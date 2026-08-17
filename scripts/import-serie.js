/**
 * Convierte posts-texto-directo.md en un archivo por post.
 * Uso: node scripts/import-serie.js <ruta-al-md> [fecha-inicio YYYY-MM-DD]
 * Se corre una vez. Después, cada post nuevo se crea a mano o con `npm run new`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { POSTS_DIR, serializePost } from '../src/lib/posts.js';

const SLUGS = [
  'no-sabe-predice', 'contexto-no-es-memoria', 'tokens-la-moneda-real',
  'prompt-especificacion', 'temperature-dado-o-calculadora', 'alucinaciones',
  'rag-sin-humo', 'embeddings', 'context-engineering',
  'tool-use', 'mcp', 'skills',
  'agente-vs-workflow', 'loop-del-agente', 'cuando-no-usar-agente',
  'patrones-de-diseno', 'logica-de-negocio', 'prompt-injection',
  'ia-en-el-sdlc', 'code-review', 'evals',
  'optimizacion-de-tokens', 'elegir-modelo', 'casi-nada-era-sobre-ia',
];

const IMAGES = {
  1: {
    template: 'concepto', label: 'Fundamentos',
    title: 'No sabe.\nPredice.', highlight: 'Predice.',
    items: [
      { text: 'El gato se subió al', sub: 'contexto', dim: true },
      { text: 'tejado', sub: '41%', hit: true },
      { text: 'árbol', sub: '22%' },
      { text: 'sofá', sub: '19%' },
    ],
    foot: 'Un LLM elige el siguiente token más probable.\nNo consulta la verdad.',
  },
  4: {
    template: 'lista', label: 'Práctica',
    title: 'Un prompt que sí funciona', highlight: 'sí funciona',
    items: [
      { text: 'Rol — desde qué expertise responde' },
      { text: 'Objetivo — qué debe lograr' },
      { text: 'Contexto — stack, convenciones, código' },
      { text: 'Restricciones — qué no puede hacer' },
      { text: 'Formato — JSON, diff, tabla' },
      { text: 'Criterios de aceptación', key: true },
    ],
    foot: 'Es una historia de usuario.\nEscríbela como tal.',
  },
  7: {
    template: 'proceso', label: 'Arquitectura',
    title: 'RAG en 3 pasos', highlight: 'RAG',
    steps: [
      { title: 'Buscas', sub: 'los fragmentos relevantes en tus datos' },
      { title: 'Los pegas', sub: 'en el prompt, como contexto', key: true },
      { title: 'Le pides', sub: 'que responda usando solo eso' },
    ],
    foot: 'No reentrenas nada.\nLe das la página correcta, justo a tiempo.',
  },
  10: {
    template: 'proceso', label: 'Herramientas',
    title: 'El modelo pide.\nTu backend decide.', highlight: 'Tu backend decide.',
    steps: [
      { title: 'El usuario pregunta', sub: 'en lenguaje natural' },
      { title: 'El modelo propone', sub: 'buscarPedidos(4471)' },
      { title: 'Tu código ejecuta', sub: 'auth · permisos · validación', key: true },
      { title: 'El modelo redacta', sub: 'la respuesta final' },
    ],
    foot: 'Entre la petición y la ejecución\ncabe toda tu ingeniería.',
  },
  13: {
    template: 'comparacion', label: 'Agentes',
    title: '¿Quién decide el camino?', highlight: 'el camino?',
    left: {
      head: 'Usa workflow si', mark: 'dash',
      items: ['Conoces los pasos', 'Necesitas reproducibilidad', 'El costo importa', 'Fallar sale caro'],
    },
    right: {
      head: 'Usa agente si', mark: 'dash',
      items: ['El camino se descubre', 'No puedes enumerarlo', 'Toleras variabilidad', 'Puedes verificar'],
    },
    foot: 'La diferencia no es tecnológica.\nEs quién controla el flujo.',
  },
  16: {
    template: 'lista', label: 'Ingeniería',
    title: '5 patrones para features con IA', highlight: '5 patrones',
    items: [
      { text: 'Encadenamiento' },
      { text: 'Enrutamiento' },
      { text: 'Paralelización' },
      { text: 'Evaluador–optimizador' },
      { text: 'Orquestador–trabajadores' },
    ],
    foot: 'Descomponer. Especializar. Componer.',
  },
  19: {
    template: 'lista', label: 'Proceso',
    title: 'La IA en el ciclo de desarrollo', highlight: 'ciclo de desarrollo',
    items: [
      { text: 'Requerimientos — alto' },
      { text: 'Diseño — medio' },
      { text: 'Implementación — alto' },
      { text: 'Testing — muy alto', key: true },
      { text: 'Code review — alto' },
      { text: 'Documentación — muy alto' },
      { text: 'Debugging — medio' },
    ],
    foot: 'Rinde donde es tedioso y verificable.\nPoco donde hace falta juicio.',
  },
  22: {
    template: 'lista', label: 'Decisiones',
    title: 'Bajar tu factura de IA', highlight: 'factura de IA',
    items: [
      { text: 'El modelo correcto para cada tarea', key: true },
      { text: 'Caching de prompts' },
      { text: 'Enrutamiento por dificultad' },
      { text: 'Recortar el contexto' },
      { text: 'Limitar la salida' },
      { text: 'Comprimir el JSON' },
      { text: 'Caché semántica' },
    ],
    foot: 'Instrumenta el costo por request\ndesde el día uno.',
  },
  24: {
    template: 'pares', label: 'Cierre',
    title: 'Casi nada de esto era sobre IA', highlight: 'sobre IA',
    pairs: [
      { l: 'RAG', r: 'Búsqueda' },
      { l: 'Tool use', r: 'Diseño de API' },
      { l: 'MCP', r: 'Integración' },
      { l: 'Agentes', r: 'Control de flujo' },
      { l: 'Evals', r: 'Testing' },
      { l: 'Tokens', r: 'Gestión de recursos' },
    ],
    foot: 'Sigue siendo ingeniería.\nY sigue siendo tuyo.',
  },
};

/** Lunes, miércoles y viernes a partir de la fecha de inicio. */
function schedule(start, count) {
  const dates = [];
  const d = new Date(start + 'T12:00:00Z');
  while (dates.length < count) {
    const day = d.getUTCDay();
    if (day === 1 || day === 3 || day === 5) dates.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return dates;
}

/**
 * LinkedIn no formatea markdown: los asteriscos y los backticks se ven literales.
 * Se limpian al importar, no al publicar, para que lo que ves en el archivo
 * sea exactamente lo que se va a publicar.
 */
function toPlainText(body) {
  return body
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const source = process.argv[2];
const start = process.argv[3] || '2026-08-24';

if (!source || !fs.existsSync(source)) {
  console.error('Uso: node scripts/import-serie.js <ruta-al-md> [YYYY-MM-DD]');
  process.exit(1);
}

const raw = fs.readFileSync(source, 'utf8');
const chunks = raw.split(/\n## Post /).slice(1);
const dates = schedule(start, SLUGS.length);

fs.mkdirSync(POSTS_DIR, { recursive: true });
let written = 0;

for (const chunk of chunks) {
  const header = chunk.split('\n')[0];
  const n = Number(header.match(/^(\d+)/)?.[1]);
  if (!n || !SLUGS[n - 1]) continue;

  const body = toPlainText(chunk.slice(header.length).split(/\n---\s*$/m)[0]);
  const meta = {
    slug: SLUGS[n - 1],
    n,
    date: dates[n - 1],
    status: 'draft',
    image: IMAGES[n] || null,
  };

  const name = `${String(n).padStart(2, '0')}-${meta.slug}.md`;
  fs.writeFileSync(path.join(POSTS_DIR, name), serializePost(meta, body), 'utf8');
  written++;
}

console.log(`${written} posts escritos en /posts, del ${dates[0]} al ${dates[written - 1]}`);
console.log('Todos quedaron en status "draft". Cámbialo a "ready" cuando el post esté listo para su turno.');
