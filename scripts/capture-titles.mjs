// Screenshots each game's title screen into landing/img/<slug>.webp.
// Requires site/ to be built first (npm run build). Usage: node scripts/capture-titles.mjs [slug...]
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv.slice(2);
const games = JSON.parse(readFileSync(join(root, 'games.json'), 'utf8')).filter((g) => !only.length || only.includes(g.slug));

const port = 4174;
const server = await serve(port);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

for (const g of games) {
  await page.goto(`http://localhost:${port}/${g.slug}/`);
  const canvas = await page.waitForSelector('canvas');
  await page.waitForTimeout(g.captureDelayMs ?? 2500);
  const png = await canvas.screenshot();
  // 16:9 crop of the canvas; games.json "crop": {top, height} as fractions (0–1) of canvas height.
  const img = sharp(png);
  const { width, height } = await img.metadata();
  const top = Math.round((g.crop?.top ?? 0) * height);
  const h = Math.round((g.crop?.height ?? 1) * height);
  await img
    .extract({ left: 0, top, width, height: Math.min(h, height - top) })
    .resize(800, 450, { fit: 'cover', position: 'top' })
    .webp({ quality: 85 })
    .toFile(join(root, 'landing', 'img', `${g.slug}.webp`));
  console.log(`captured ${g.slug}`);
}

await browser.close();
server.close();
