import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const POSTS_DIR = path.join(ROOT, 'posts');
export const IMAGES_DIR = path.join(ROOT, 'out', 'images');

const DELIM = '---';

/**
 * Formato de archivo: frontmatter JSON entre --- y ---, luego el cuerpo.
 * Se usa JSON y no YAML a propósito: cero dependencias y cero ambigüedad.
 */
export function parsePost(raw, file) {
  // Se tolera el retorno de carro: el servidor escribe LF, pero al hacer pull
  // en Windows con core.autocrlf el archivo llega en CRLF y el delimitador de
  // cierre deja de coincidir con la comparacion exacta de mas abajo.
  const lines = raw.split(/\r?\n/);
  if (lines[0].trim() !== DELIM) {
    throw new Error(`${file}: falta el frontmatter de apertura (---)`);
  }
  const end = lines.indexOf(DELIM, 1);
  if (end === -1) throw new Error(`${file}: falta el --- de cierre del frontmatter`);

  let meta;
  try {
    meta = JSON.parse(lines.slice(1, end).join('\n'));
  } catch (e) {
    throw new Error(`${file}: el frontmatter no es JSON válido — ${e.message}`);
  }
  return { meta, body: lines.slice(end + 1).join('\n').trim(), file };
}

export function serializePost(meta, body) {
  return `${DELIM}\n${JSON.stringify(meta, null, 2)}\n${DELIM}\n\n${body.trim()}\n`;
}

export function listPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const full = path.join(POSTS_DIR, f);
      const post = parsePost(fs.readFileSync(full, 'utf8'), f);
      post.path = full;
      return post;
    });
}

export function savePost(post, changes) {
  const meta = { ...post.meta, ...changes };
  fs.writeFileSync(post.path, serializePost(meta, post.body), 'utf8');
  post.meta = meta;
  return post;
}

/** El siguiente post listo cuya fecha ya llegó. */
export function nextDue(now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return (
    listPosts()
      .filter((p) => p.meta.status === 'ready' && p.meta.date <= today)
      .sort((a, b) => a.meta.date.localeCompare(b.meta.date))[0] || null
  );
}

export function imagePathFor(post) {
  return path.join(IMAGES_DIR, `${post.meta.slug}.png`);
}

/**
 * El gancho es todo lo que va antes de la primera línea en blanco.
 * Es lo único que LinkedIn muestra antes del "ver más".
 */
export function hookOf(body) {
  return body.split(/\n\s*\n/)[0].trim();
}

export function hashtagsOf(body) {
  return body.match(/#[\wÁÉÍÓÚÑáéíóúñ]+/g) || [];
}
