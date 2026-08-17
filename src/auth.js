import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT } from './lib/posts.js';

export const TOKENS = path.join(ROOT, '.tokens.json');
const AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const USERINFO = 'https://api.linkedin.com/v2/userinfo';
const SCOPES = 'openid profile w_member_social';

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta ${name} en .env`);
  return v;
}

export function loadTokens() {
  if (!fs.existsSync(TOKENS)) throw new Error('No hay sesión. Corre: npm run auth');
  return JSON.parse(fs.readFileSync(TOKENS, 'utf8'));
}

function saveTokens(t) {
  fs.writeFileSync(TOKENS, JSON.stringify(t, null, 2), 'utf8');
  fs.chmodSync(TOKENS, 0o600);
}

async function exchange(params) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`LinkedIn devolvió ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

function shape(data, previous = {}) {
  const now = Date.now();
  return {
    access_token: data.access_token,
    expires_at: now + data.expires_in * 1000,
    refresh_token: data.refresh_token || previous.refresh_token || null,
    refresh_expires_at: data.refresh_token_expires_in
      ? now + data.refresh_token_expires_in * 1000
      : previous.refresh_expires_at || null,
    author: previous.author || null,
  };
}

/** Devuelve un access token vivo, refrescándolo si le quedan menos de 5 días. */
export async function freshTokens() {
  const t = loadTokens();
  const margin = 5 * 24 * 60 * 60 * 1000;
  if (t.expires_at - Date.now() > margin) return t;

  if (!t.refresh_token) {
    throw new Error(
      'El token está por vencer y la app no entrega refresh tokens. Vuelve a correr: npm run auth'
    );
  }
  console.log('Token cerca de vencer, refrescando...');
  const data = await exchange({
    grant_type: 'refresh_token',
    refresh_token: t.refresh_token,
    client_id: env('LI_CLIENT_ID'),
    client_secret: env('LI_CLIENT_SECRET'),
  });
  const next = shape(data, t);
  saveTokens(next);
  return next;
}

// --- flujo interactivo, solo cuando se corre este archivo directamente ---

if (import.meta.url === `file://${process.argv[1]}`) {
  const redirect = env('LI_REDIRECT_URI');
  const port = Number(new URL(redirect).port || 80);
  const state = crypto.randomBytes(16).toString('hex');

  const url =
    `${AUTH_URL}?response_type=code&client_id=${encodeURIComponent(env('LI_CLIENT_ID'))}` +
    `&redirect_uri=${encodeURIComponent(redirect)}&state=${state}&scope=${encodeURIComponent(SCOPES)}`;

  console.log('\nAbre esta URL en el navegador y autoriza la app:\n');
  console.log(url + '\n');

  const server = http.createServer(async (req, res) => {
    const q = new URL(req.url, redirect).searchParams;
    if (!q.get('code')) return res.end('Esperando el callback...');

    const done = (msg) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<meta charset="utf-8"><p style="font:16px sans-serif">${msg}</p>`);
    };

    try {
      if (q.get('state') !== state) throw new Error('El state no coincide. Abortando por seguridad.');

      const data = await exchange({
        grant_type: 'authorization_code',
        code: q.get('code'),
        client_id: env('LI_CLIENT_ID'),
        client_secret: env('LI_CLIENT_SECRET'),
        redirect_uri: redirect,
      });
      const t = shape(data);

      const me = await fetch(USERINFO, { headers: { Authorization: `Bearer ${t.access_token}` } });
      if (!me.ok) throw new Error(`userinfo devolvió ${me.status}`);
      const { sub, name } = await me.json();
      t.author = `urn:li:person:${sub}`;
      saveTokens(t);

      done('Listo. Ya puedes cerrar esta pestaña.');
      console.log(`\nSesión guardada para ${name}`);
      console.log(`author: ${t.author}`);
      console.log(`El access token vence el ${new Date(t.expires_at).toLocaleDateString('es-CO')}`);
      if (!t.refresh_token) {
        console.log('\nAviso: esta app no entregó refresh token. Vas a tener que repetir `npm run auth` antes de esa fecha.');
      }
    } catch (e) {
      done(`Error: ${e.message}`);
      console.error('\n' + e.message);
    } finally {
      server.close();
    }
  });

  server.listen(port, () => console.log(`Escuchando el callback en ${redirect}`));
}
