import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { listPosts, imagePathFor, IMAGES_DIR, ROOT } from './lib/posts.js';

const TEMPLATE = path.join(ROOT, 'templates', 'card.html');
const HANDLE = process.env.LI_HANDLE || '';

const only = process.argv[2];
const targets = listPosts().filter((p) => p.meta.image && (!only || p.meta.slug === only));

if (!targets.length) {
  console.log(only ? `El post "${only}" no existe o no lleva imagen.` : 'Ningún post con imagen.');
  process.exit(0);
}

fs.mkdirSync(IMAGES_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
await page.goto('file://' + TEMPLATE);

for (const post of targets) {
  const data = { ...post.meta.image, handle: HANDLE };
  try {
    await page.evaluate((d) => window.render(d), data);
  } catch (e) {
    console.error(`x  ${post.meta.slug}: ${e.message}`);
    continue;
  }
  const out = imagePathFor(post);
  await page.locator('#card').screenshot({ path: out });
  console.log(`ok ${post.meta.slug} -> ${path.relative(ROOT, out)}`);
}

await browser.close();
