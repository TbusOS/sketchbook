#!/usr/bin/env node
// build.mjs — catalog.yaml + data/repos.json → every picture, both READMEs, the
// profile README and the web page.
//
//   node scripts/build.mjs            write everything that changed
//   node scripts/build.mjs --check    write nothing; exit 1 if a committed output is stale
//   node scripts/build.mjs --no-site  skip the web page (faster while drawing)
//
// Committed outputs: README.md, README_zh.md, art/*.svg, profile/README.md.
// The web page goes to site/ (not committed; the Pages workflow builds and deploys it).
// A file is only rewritten when its content changed, so an unchanged day is a no-op.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { buildModel } from './lib/model.mjs';
import { standalone } from './lib/svg.mjs';
import { readme } from './lib/readme.mjs';
import { profile } from './lib/profile.mjs';
import { drawBanner } from './art/banner.mjs';
import { drawCard } from './art/card.mjs';
import { drawShelf } from './art/shelf.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const SITE = !args.includes('--no-site') && !CHECK;

export function loadModel() {
  const catalog = parse(readFileSync(join(ROOT, 'catalog.yaml'), 'utf8'));
  const data = JSON.parse(readFileSync(join(ROOT, 'data/repos.json'), 'utf8'));
  return buildModel(catalog, data);
}

export async function art(model) {
  const out = new Map();
  for (const lang of ['en', 'zh']) {
    for (const theme of ['light', 'dark']) {
      out.set(`art/banner-${lang}-${theme}.svg`, await standalone(drawBanner(model, { lang, theme, root: ROOT })));
      out.set(`art/shelf-${lang}-${theme}.svg`, await standalone(drawShelf(model, { lang, theme })));
      for (const [i, r] of model.featured.entries()) {
        out.set(`art/card-${r.name}-${lang}-${theme}.svg`, await standalone(drawCard(r, { lang, theme, index: i, root: ROOT })));
      }
    }
  }
  return out;
}

async function main() {
  const model = loadModel();
  if (model.problems.length) {
    console.error('build: catalog problems —\n  ' + model.problems.join('\n  '));
    process.exit(1);
  }
  const outputs = await art(model);
  outputs.set('README.md', readme(model, 'en'));
  outputs.set('README_zh.md', readme(model, 'zh'));
  outputs.set('profile/README.md', profile(model));

  let changed = 0;
  const stale = [];
  for (const [rel, content] of outputs) {
    const file = join(ROOT, rel);
    const same = existsSync(file) && readFileSync(file, 'utf8') === content;
    if (same) continue;
    if (CHECK) { stale.push(rel); continue; }
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
    changed++;
  }
  if (CHECK) {
    if (stale.length) { console.error(`build --check: ${stale.length} output(s) out of date:\n  ${stale.join('\n  ')}\nrun: npm run build`); process.exit(1); }
    console.log(`build --check: all ${outputs.size} outputs up to date`);
    return;
  }
  console.log(`build: ${outputs.size} outputs, ${changed} rewritten · ${model.stats.projects} projects, ${model.stats.commits} commits`);

  if (SITE) {
    const { buildSite } = await import('./lib/site.mjs');
    const dir = await buildSite(model, { root: ROOT, art: outputs });
    console.log(`build: web page → ${relative(ROOT, dir)}/index.html`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(e); process.exit(1); });
}
