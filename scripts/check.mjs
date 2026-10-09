#!/usr/bin/env node
// check.mjs — the checks from docs/DESIGN.md §8 that need no browser.
//
//   node scripts/check.mjs        exit 1 on any failure, print what and where
//
// C1 every public repo of the owner is accounted for: listed, archived, new, or excluded
// C2 catalog problems (renamed / deleted / forked repos, unknown groups, bad featured)
// C3 every icon name in catalog.yaml is one icons.mjs can draw
// C4 every picture the READMEs reference exists; links point at GitHub or the site
// C5 every SVG embeds the glyphs for all of its own text (no silent fallback font)
// C6 committed outputs are what the build would write now (build.mjs --check)
// C7 the hook on each featured card is at most 8 words / 16 Chinese-character widths
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { buildModel } from './lib/model.mjs';
import { textOf } from './lib/svg.mjs';
import { ICON_NAMES } from './art/icons.mjs';
import { charsFor } from './lib/fonts.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const fail = (id, msg) => fails.push(`${id} ${msg}`);

const catalog = parse(readFileSync(join(ROOT, 'catalog.yaml'), 'utf8'));
const data = JSON.parse(readFileSync(join(ROOT, 'data/repos.json'), 'utf8'));
const model = buildModel(catalog, data);

// C1
const seen = new Set([...model.all.map(r => r.name), ...model.excluded.map(e => e.name)]);
for (const r of data.repos) if (!r.fork && !seen.has(r.name)) fail('C1', `public repo "${r.name}" is in no section`);
// C2
for (const p of model.problems) fail('C2', p);
// C3
const icons = new Set(ICON_NAMES);
for (const [name, e] of Object.entries({ ...catalog.repos, ...catalog.archive })) {
  if (e.icon && !icons.has(e.icon)) fail('C3', `${name}: unknown icon "${e.icon}"`);
}
// C4
for (const f of ['README.md', 'README_zh.md']) {
  const md = readFileSync(join(ROOT, f), 'utf8');
  for (const m of md.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
    if (!/^https?:/.test(m[1]) && !existsSync(join(ROOT, m[1]))) fail('C4', `${f}: missing picture ${m[1]}`);
  }
  for (const m of md.matchAll(/(?:href="|\]\()(https?:\/\/[^")\s]+)/g)) {
    if (!/^https:\/\/(github\.com\/TbusOS(\/|$)|doc\.tbusos\.com\/)/.test(m[1])) fail('C4', `${f}: link outside GitHub / the site: ${m[1]}`);
  }
}
// C5 — svg.mjs records how many glyphs it cut into each embedded font
// (data-glyphs="hand:41 mono:12"). Read every <text> in the file independently and
// count the characters it needs: a mismatch means some text was missed when the
// font was cut, and that text would quietly render in a system font.
for (const f of readdirSync(join(ROOT, 'art')).filter(n => n.endsWith('.svg'))) {
  const svg = readFileSync(join(ROOT, 'art', f), 'utf8');
  const text = textOf(svg.replace(/<title>[\s\S]*?<\/title>/, ''));
  const rec = Object.fromEntries([...(svg.match(/data-glyphs="([^"]*)"/) || ['', ''])[1].matchAll(/(\w+):(\d+)/g)].map(m => [m[1], +m[2]]));
  for (const key of ['hand', 'mono']) {
    const need = text[key] ? charsFor(text[key]).length : 0;
    if ((rec[key] || 0) !== need) fail('C5', `art/${f}: ${key} font has ${rec[key] || 0} glyphs, its text needs ${need}`);
  }
}
// C6
try { execFileSync(process.execPath, [join(ROOT, 'scripts/build.mjs'), '--check'], { stdio: 'pipe' }); }
catch (e) { fail('C6', String(e.stderr || e.stdout).trim()); }
// C7
for (const r of model.featured) {
  if (r.hookEn.split(/\s+/).length > 8) fail('C7', `${r.name}: hook_en has more than 8 words`);
  // width: a Chinese character is 1, a Latin letter or space about half of one
  const width = [...r.hookZh].reduce((w, c) => w + (c.codePointAt(0) > 0x2e80 ? 1 : 0.5), 0);
  if (width > 16) fail('C7', `${r.name}: hook_zh is ${width} characters wide, at most 16`);
  if (!r.hookEn || !r.hookZh) fail('C7', `${r.name}: featured but has no hook`);
}

if (fails.length) { console.error(`check: ${fails.length} failure(s)\n  ${fails.join('\n  ')}`); process.exit(1); }
console.log(`check: C1–C7 pass · ${model.stats.projects} listed, ${model.archive.length} earlier, ${model.fresh.length} new, ${model.excluded.length} excluded`);
