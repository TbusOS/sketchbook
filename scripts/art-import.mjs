#!/usr/bin/env node
// art-import.mjs — turn the chosen raw PNGs from the image model into committed WebP files.
//
//   node scripts/art-import.mjs            import every image that exists in .cache/illo/
//   node scripts/art-import.mjs hero       just this one (light and dark)
//
// Raw PNGs are ~2 MB each and live in .cache/illo/ (not committed; scripts/illo.sh
// draws them). What the README and the site embed are these WebP files:
//   hero        1916×821 → 1600 wide, the whole picture (code draws on its blank pages)
//   v-<repo>    1672×941 → cropped to the card window (1.88:1), 960 wide
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, '.cache/illo');
const OUT = join(ROOT, 'art/source');

export const CARD_RATIO = 752 / 400;   // the picture window on a featured card (scripts/art/card.mjs)

const JOBS = [
  { name: 'hero', width: 1600 },
  ...['sky-skills', 'android-llm-bridge', 'ai-doc', 'whetstone', 'engram', 'flowsight'].map(r => ({ name: `v-${r}`, width: 960, ratio: CARD_RATIO })),
];

async function convert(job, theme) {
  const base = theme === 'dark' ? `${job.name}-dark` : job.name;
  const src = join(SRC, `${base}-v1.png`);
  if (!existsSync(src)) { console.log(`skip  ${base} (no ${src})`); return; }
  let img = sharp(src);
  if (job.ratio) {
    const { width, height } = await img.metadata();
    const h = Math.round(width / job.ratio);
    img = img.extract({ left: 0, top: Math.max(0, Math.round((height - h) / 2)), width, height: Math.min(h, height) });
  }
  const out = join(OUT, `${base}.webp`);
  const info = await img.resize({ width: job.width }).webp({ quality: 78, effort: 6 }).toFile(out);
  console.log(`wrote art/source/${base}.webp  ${info.width}×${info.height}  ${Math.round(info.size / 1024)} KB`);
}

mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
for (const job of JOBS) {
  if (only && job.name !== only && job.name !== `v-${only}`) continue;
  await convert(job, 'light');
  await convert(job, 'dark');
}
