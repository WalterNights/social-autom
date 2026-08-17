import fs from 'node:fs';
import { listPosts, nextDue, savePost, imagePathFor } from './lib/posts.js';
import { checkPost } from './lib/rules.js';
import { freshTokens } from './auth.js';

const API = 'https://api.linkedin.com/rest';
const VERSION = process.env.LI_VERSION || '202601';

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const value = (n) => {
  const i = args.indexOf(`--${n}`);
  return i === -1 ? null : args[i + 1];
};

/**
 * La API de Posts exige escapar ciertos caracteres en `commentary`.
 * El '#' se deja fuera a propósito: escaparlo rompe los hashtags, que son
 * parte de la estrategia. Si LinkedIn rechaza un post por eso, añádelo aquí.
 */
const ESCAPE = process.env.LI_ESCAPE_CHARS ?? '\\|{}@[]()<>*_~';

function escapeCommentary(text) {
  if (!ESCAPE) return text;
  const set = new Set(ESCAPE.split(''));
  return [...text].map((c) => (set.has(c) ? '\\' + c : c)).join('');
}

function headers(token, extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    'LinkedIn-Version': VERSION,
    'X-Restli-Protocol-Version': '2.0.0',
    ...extra,
  };
}

async function api(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  if (!res.ok) throw new Error(`${options.method || 'GET'} ${url} -> ${res.status}\n${text}`);
  return text ? JSON.parse(text) : {};
}

async function uploadImage(token, author, file) {
  const init = await api(`${API}/images?action=initializeUpload`, {
    method: 'POST',
    headers: headers(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ initializeUploadRequest: { owner: author } }),
  });
  const { uploadUrl, image } = init.value;

  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: fs.readFileSync(file),
  });
  if (!put.ok) throw new Error(`Falló la subida de la imagen: ${put.status} ${await put.text()}`);
  return image;
}

/**
 * Para contenido de imagen la API documenta `altText`, no `title` (title es de
 * video). Va el título real de la tarjeta, no el slug: es lo que leen los
 * lectores de pantalla. Recomendado por debajo de 120 caracteres.
 */
function altTextFor(image) {
  if (!image) return null;
  const partes = [image.label, image.title].filter(Boolean);
  const texto = partes.join(': ') || 'Imagen del post';
  // Los títulos de las tarjetas traen saltos de línea para el render; en el
  // texto alternativo van como una sola frase.
  return texto.replace(/\s+/g, ' ').trim().slice(0, 120);
}

async function createPost(token, author, commentary, imageUrn, altText) {
  const payload = {
    author,
    commentary: escapeCommentary(commentary),
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };
  if (imageUrn) payload.content = { media: { id: imageUrn, altText } };

  const res = await fetch(`${API}/posts`, {
    method: 'POST',
    headers: headers(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /posts -> ${res.status}\n${await res.text()}`);
  return res.headers.get('x-restli-id') || res.headers.get('x-linkedin-id');
}

// --- Telegram: aprobación desde el celular ---

const TG = process.env.TG_BOT_TOKEN;
const CHAT = process.env.TG_CHAT_ID;

async function tg(method, body) {
  if (!TG || !CHAT) throw new Error('Falta TG_BOT_TOKEN o TG_CHAT_ID en .env');
  const res = await fetch(`https://api.telegram.org/bot${TG}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT, ...body }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram ${method}: ${data.description}`);
  return data.result;
}

export async function notify(text) {
  if (TG && CHAT) await tg('sendMessage', { text });
}

async function askApproval(post, minutes = 45) {
  await tg('sendMessage', {
    text: `Toca publicar: ${post.meta.slug}\n\n${'—'.repeat(20)}\n\n${post.body}`,
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Publicar', callback_data: `go:${post.meta.slug}` },
          { text: 'Saltar hoy', callback_data: `no:${post.meta.slug}` },
        ],
      ],
    },
  });

  const deadline = Date.now() + minutes * 60_000;
  let offset = 0;
  console.log(`Esperando tu respuesta en Telegram (hasta ${minutes} min)...`);

  while (Date.now() < deadline) {
    const updates = await tg('getUpdates', { offset, timeout: 30 });
    for (const u of updates) {
      offset = u.update_id + 1;
      const cb = u.callback_query;
      if (!cb?.data?.endsWith(post.meta.slug)) continue;
      await tg('answerCallbackQuery', { callback_query_id: cb.id });
      return cb.data.startsWith('go:');
    }
  }
  console.log('Se venció el tiempo de espera. No se publicó nada.');
  return false;
}

// --- main ---

const slug = value('slug');
const post = slug ? listPosts().find((p) => p.meta.slug === slug) : nextDue();

if (!post) {
  console.log(slug ? `No encontré el post "${slug}"` : 'No hay ningún post listo para hoy.');
  process.exit(0);
}

const { errors, warns } = checkPost(post);
for (const w of warns) console.log(`!  ${w}`);
if (errors.length) {
  console.error(`\nNo publico "${post.meta.slug}" porque tiene errores:`);
  for (const e of errors) console.error(`x  ${e}`);
  process.exit(1);
}

const image = post.meta.image ? imagePathFor(post) : null;
if (image && !fs.existsSync(image)) {
  console.error(`Falta la imagen. Corre primero: npm run render ${post.meta.slug}`);
  process.exit(1);
}

if (flag('dry')) {
  console.log(`\n${post.meta.slug} · ${post.meta.date} · ${post.body.length} caracteres`);
  console.log(image ? `imagen: ${image}` : 'sin imagen');
  console.log('\n' + '─'.repeat(48) + '\n');
  console.log(post.body);
  console.log('\n' + '─'.repeat(48));
  console.log('\nEsto es una vista previa. Para publicar: npm run publish');
  process.exit(0);
}

if (flag('ask') && !(await askApproval(post))) process.exit(0);

const tokens = await freshTokens();
const imageUrn = image ? await uploadImage(tokens.access_token, tokens.author, image) : null;
const urn = await createPost(
  tokens.access_token,
  tokens.author,
  post.body,
  imageUrn,
  altTextFor(post.meta.image)
);

savePost(post, { status: 'published', publishedAt: new Date().toISOString(), urn });

const url = `https://www.linkedin.com/feed/update/${urn}`;
console.log(`\nPublicado: ${url}`);
await notify(`Publicado: ${post.meta.slug}\n${url}\n\nLa primera hora es la que cuenta. Entra a responder comentarios.`);
