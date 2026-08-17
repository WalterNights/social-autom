import { hookOf, hashtagsOf } from './posts.js';

export const LIMITS = {
  hook: 200,        // lo que LinkedIn muestra antes del "ver más"
  total: 3000,      // límite duro de la plataforma
  line: 220,
  hashtagsMin: 3,
  hashtagsMax: 5,
  sentencesPerParagraph: 2,
  emojiKinds: 2,
};

// Solo marcadores de lista. El 👉 se excluye a propósito: marca la pregunta
// de cierre, no una enumeración, y contarlo disparaba avisos falsos.
const MARKERS = {
  'check verde': /✅/u,
  'equis roja': /❌/u,
  'cuadro neutro': /▪️|▪/u,
  numerados: /[0-9]\uFE0F?\u20E3/u,
  semaforo: /🟢|🟡|🔴/u,
};

const LIST_LINE = /^(✅|❌|▪️?|👉|🟢|🟡|🔴|[0-9]\uFE0F?\u20E3|-|\*)/u;

const FILLER = [
  'es importante mencionar',
  'cabe destacar',
  'cabe resaltar',
  'en este sentido',
  'por otro lado',
  'en el mundo actual',
  'como todos sabemos',
  'sin lugar a dudas',
  'hoy en día',
  'a día de hoy',
];

function countSentences(text) {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12).length;
}

export function checkPost(post) {
  const errors = [];
  const warns = [];
  const { body, meta } = post;

  if (!body) errors.push('el cuerpo está vacío');

  const hook = hookOf(body);
  if (hook.length > LIMITS.hook) {
    errors.push(
      `el gancho tiene ${hook.length} caracteres, se corta a los ${LIMITS.hook}. Recórtalo o parte la primera frase.`
    );
  }

  if (body.length > LIMITS.total) {
    errors.push(`el post tiene ${body.length} caracteres, el máximo es ${LIMITS.total}`);
  }

  const tags = hashtagsOf(body);
  if (tags.length < LIMITS.hashtagsMin || tags.length > LIMITS.hashtagsMax) {
    errors.push(`hay ${tags.length} hashtags, deberían ser entre ${LIMITS.hashtagsMin} y ${LIMITS.hashtagsMax}`);
  }

  const url = body.match(/https?:\/\/\S+/);
  if (url) {
    errors.push(`hay un enlace en el cuerpo (${url[0]}). LinkedIn castiga el alcance: va en el primer comentario.`);
  }

  if (meta.image) {
    for (const field of ['template', 'label', 'title', 'foot']) {
      if (!meta.image[field]) errors.push(`falta image.${field} en el frontmatter`);
    }
  }

  // --- avisos: no bloquean, pero casi siempre vale la pena atenderlos ---

  const kinds = Object.entries(MARKERS)
    .filter(([, re]) => re.test(body))
    .map(([name]) => name);
  if (kinds.length > LIMITS.emojiKinds) {
    warns.push(`usa ${kinds.length} tipos de marcador (${kinds.join(', ')}). El máximo son ${LIMITS.emojiKinds}.`);
  }

  if (body.includes('`')) {
    warns.push('hay backticks. LinkedIn no formatea código: se van a ver como comillas sueltas en el texto.');
  }

  if (/\*\*[^*]+\*\*/.test(body)) {
    warns.push('hay negrita de markdown (**). LinkedIn la muestra literal, con los asteriscos.');
  }

  const lower = body.toLowerCase();
  for (const f of FILLER) {
    if (lower.includes(f)) warns.push(`relleno detectado: "${f}". Se puede borrar sin perder nada.`);
  }

  // La regla es "una idea por línea", así que se cuenta por línea y no por bloque.
  // Las líneas que abren con marcador son ítems de lista: se saltan.
  body.split('\n').forEach((line, i) => {
    const clean = line.trim();
    if (!clean || LIST_LINE.test(clean)) return;
    const n = countSentences(clean);
    if (n > LIMITS.sentencesPerParagraph) {
      warns.push(`la línea ${i + 1} tiene ${n} frases. Si tiene dos ideas, son dos líneas.`);
    }
  });

  body.split('\n').forEach((l, i) => {
    if (l.length > LIMITS.line) warns.push(`la línea ${i + 1} tiene ${l.length} caracteres. Pártela.`);
  });

  return { errors, warns, hook };
}
