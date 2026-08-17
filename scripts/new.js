/**
 * Crea el archivo de un post nuevo, ya agendado en el siguiente hueco libre.
 * Uso: npm run new -- mi-slug ["Título para la imagen"]
 */
import fs from 'node:fs';
import path from 'node:path';
import { listPosts, POSTS_DIR, serializePost } from '../src/lib/posts.js';

const slug = process.argv[2];
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('Uso: npm run new -- mi-slug ["Título de la imagen"]');
  console.error('El slug va en minúsculas, sin espacios ni tildes.');
  process.exit(1);
}

const posts = listPosts();
if (posts.some((p) => p.meta.slug === slug)) {
  console.error(`Ya existe un post con el slug "${slug}".`);
  process.exit(1);
}

/** Siguiente lunes, miércoles o viernes después del último post agendado. */
function nextSlot() {
  const last = posts.map((p) => p.meta.date).sort().pop();
  const d = new Date((last || new Date().toISOString().slice(0, 10)) + 'T12:00:00Z');
  do {
    d.setUTCDate(d.getUTCDate() + 1);
  } while (![1, 3, 5].includes(d.getUTCDay()));
  return d.toISOString().slice(0, 10);
}

const n = Math.max(0, ...posts.map((p) => p.meta.n || 0)) + 1;
const title = process.argv[3];

const meta = {
  slug,
  n,
  date: nextSlot(),
  status: 'draft',
  image: title
    ? { template: 'lista', label: 'Tema', title, highlight: '', items: [{ text: 'Primer punto' }, { text: 'Segundo punto' }], foot: 'Remate de la imagen.' }
    : null,
};

const body = `Primera línea: el gancho.

Segunda línea que remata el gancho.

Desarrollo, una idea por línea.

Remate, solo, al final.

👉 Pregunta de cierre.

#IAconCriterio #DesarrolloDeSoftware #FullStack`;

const file = path.join(POSTS_DIR, `${String(n).padStart(2, '0')}-${slug}.md`);
fs.writeFileSync(file, serializePost(meta, body), 'utf8');

console.log(`Creado ${path.relative(process.cwd(), file)} para el ${meta.date}.`);
console.log('Escribe el contenido, cambia status a "ready" y corre: npm run lint');
