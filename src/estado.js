import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { listPosts, ROOT } from './lib/posts.js';

const SALIDA = path.join(ROOT, 'ESTADO.md');

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function fechaCorta(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`;
}

function linea(p) {
  const { n, slug, date, status, urn } = p.meta;
  const marca = status === 'published' ? 'x' : ' ';
  const num = String(n).padStart(2, '0');
  const base = `- [${marca}] \`${num}\` · ${fechaCorta(date)} · ${slug}`;

  if (status === 'published') {
    return `${base} — [ver publicación](https://www.linkedin.com/feed/update/${urn})`;
  }
  if (status === 'ready') return `${base} — listo`;
  return `${base} — borrador`;
}

/**
 * ESTADO.md es un reflejo, no un registro. La verdad de qué se publicó vive en
 * el frontmatter de cada post, que es lo que versiona git. Si este archivo se
 * borra o discrepa, se regenera y gana el post.
 */
export function escribirEstado() {
  const posts = listPosts().sort((a, b) => a.meta.n - b.meta.n);

  const cuenta = { published: 0, ready: 0, draft: 0 };
  for (const p of posts) cuenta[p.meta.status] = (cuenta[p.meta.status] || 0) + 1;

  const semanas = new Map();
  for (const p of posts) {
    const s = Math.ceil(p.meta.n / 3);
    if (!semanas.has(s)) semanas.set(s, []);
    semanas.get(s).push(p);
  }

  const siguiente = posts.find((p) => p.meta.status === 'ready');
  const ahora = new Date().toISOString().slice(0, 16).replace('T', ' ');

  const partes = [
    '# Estado de la cola',
    '',
    'Generado por `npm run estado`. **No lo edites a mano:** la verdad está en el',
    'frontmatter de cada archivo de `posts/`. Esto es un reflejo de eso.',
    '',
    `Última actualización: ${ahora} UTC`,
    '',
    `**${posts.length} posts** · ${cuenta.published} publicados · ${cuenta.ready} listos · ${cuenta.draft} en borrador`,
    '',
    siguiente
      ? `Siguiente en la cola: \`${String(siguiente.meta.n).padStart(2, '0')}\` ${siguiente.meta.slug}, el ${fechaCorta(siguiente.meta.date)}.`
      : 'No hay ningún post en `ready`. La cola está detenida.',
    '',
  ];

  for (const [s, lista] of [...semanas].sort((a, b) => a[0] - b[0])) {
    partes.push(`## Semana ${s}`, '');
    for (const p of lista) partes.push(linea(p));
    partes.push('');
  }

  fs.writeFileSync(SALIDA, partes.join('\n'), 'utf8');
  return { archivo: SALIDA, ...cuenta };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = escribirEstado();
  console.log(`ESTADO.md actualizado · ${r.published} publicados · ${r.ready} listos · ${r.draft} borradores`);
}
