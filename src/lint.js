import { listPosts } from './lib/posts.js';
import { checkPost, LIMITS } from './lib/rules.js';

const only = process.argv[2];
const posts = listPosts().filter((p) => !only || p.meta.slug === only);

if (!posts.length) {
  console.error(only ? `No encontré el post "${only}"` : 'No hay posts en /posts');
  process.exit(1);
}

let totalErrors = 0;
let totalWarns = 0;

for (const post of posts) {
  const { errors, warns, hook } = checkPost(post);
  totalErrors += errors.length;
  totalWarns += warns.length;

  const status = errors.length ? 'ERROR' : warns.length ? 'aviso' : 'ok';
  console.log(`\n[${status}] ${post.meta.slug}  ·  ${post.meta.date}  ·  ${post.body.length} car.`);
  console.log(`  gancho (${hook.length}/${LIMITS.hook}): ${hook.split('\n')[0].slice(0, 80)}`);
  for (const e of errors) console.log(`  x  ${e}`);
  for (const w of warns) console.log(`  !  ${w}`);
}

console.log(`\n${posts.length} posts · ${totalErrors} errores · ${totalWarns} avisos`);
process.exit(totalErrors ? 1 : 0);
