import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { TOKENS } from './auth.js';
import { listPosts } from './lib/posts.js';
import { notify, configurado } from './lib/telegram.js';

const DIA = 24 * 60 * 60 * 1000;

/** freshTokens() se niega a publicar cuando quedan menos de 5 días. */
const MARGEN_DIAS = 5;
const AVISO_DIAS = Number(process.env.TOKEN_AVISO_DIAS || 10);

const fecha = (ms) => new Date(ms).toLocaleDateString('es-CO');

export function estadoDelToken(ahora = Date.now()) {
  if (!fs.existsSync(TOKENS)) return { hay: false };

  const t = JSON.parse(fs.readFileSync(TOKENS, 'utf8'));
  const corte = t.expires_at - MARGEN_DIAS * DIA;
  const diasVence = Math.floor((t.expires_at - ahora) / DIA);
  const diasCorte = Math.floor((corte - ahora) / DIA);

  // Posts que ya no saldrían: están listos y su fecha cae después del corte.
  const desde = new Date(Math.max(corte, ahora)).toISOString().slice(0, 10);
  const enRiesgo = listPosts()
    .filter((p) => p.meta.status === 'ready' && p.meta.date >= desde)
    .map((p) => p.meta);

  return {
    hay: true,
    venceEn: t.expires_at,
    corteEn: corte,
    diasVence,
    diasCorte,
    puedeRenovarSolo: Boolean(t.refresh_token),
    enRiesgo,
    urgente: diasCorte <= AVISO_DIAS,
  };
}

function resumen(e) {
  const lineas = [
    `El token de LinkedIn vence el ${fecha(e.venceEn)} (quedan ${e.diasVence} días).`,
    `El publicador deja de funcionar el ${fecha(e.corteEn)}, ${MARGEN_DIAS} días antes.`,
  ];
  if (e.diasCorte <= 0) {
    lineas.push('', 'Ya pasó el corte: las publicaciones están fallando ahora mismo.');
  }
  if (e.enRiesgo.length) {
    lineas.push('', `Posts listos que no saldrían (${e.enRiesgo.length}):`);
    for (const m of e.enRiesgo) lineas.push(`  ${String(m.n).padStart(2, '0')} · ${m.date} · ${m.slug}`);
  }
  if (!e.puedeRenovarSolo) {
    lineas.push('', 'Esta app no entrega refresh token, así que hay que renovar a mano:');
    lineas.push('npm run auth');
  }
  return lineas.join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const avisar = process.argv.includes('--avisar');
  const e = estadoDelToken();

  if (!e.hay) {
    const msg = 'No hay sesión de LinkedIn guardada. Corre: npm run auth';
    console.log(msg);
    if (avisar) await notify(`LinkedIn — ${msg}`);
    process.exit(0);
  }

  console.log(resumen(e));

  if (!avisar) {
    console.log(
      e.urgente
        ? `\nEstá dentro del umbral de aviso (${AVISO_DIAS} días).`
        : `\nTodo en orden. El aviso saltaría a los ${AVISO_DIAS} días del corte.`
    );
    process.exit(0);
  }

  // Modo cron: solo molesta cuando de verdad hace falta.
  if (!e.urgente) process.exit(0);
  if (!configurado) {
    console.error('Hay que avisar, pero Telegram no está configurado (TG_BOT_TOKEN / TG_CHAT_ID).');
    process.exit(1);
  }
  await notify(`⚠️ LinkedIn: hay que renovar el acceso\n\n${resumen(e)}`);
  console.log('Aviso enviado.');
}
