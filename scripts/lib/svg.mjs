// svg.mjs — wrap a sketch.js drawing into a standalone SVG file.
//
// README pictures come in two files, light and dark, because GitHub picks one with
// <picture> + prefers-color-scheme. So the colours are fixed per file: the light
// file gets the :root tokens of graphite.css, the dark file gets the dark ones.
// The drawing itself is identical — sketch.js never writes a colour, only classes.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { subset, fontFaceCss } from './fonts.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
export const Sketch = require(join(ROOT, 'vendor/graphite/sketch.js'));
export const Props = require(join(ROOT, 'vendor/graphite/props.js'));

const CSS = readFileSync(join(ROOT, 'vendor/graphite/graphite.css'), 'utf8');

function block(selector) {
  const i = CSS.indexOf(selector + ' {');
  if (i < 0) throw new Error(`graphite.css: "${selector}" not found`);
  const a = CSS.indexOf('{', i) + 1, b = CSS.indexOf('}', a);
  return CSS.slice(a, b);
}
function minify(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{};:,>])\s*/g, '$1');
}

const TOKENS = { light: minify(block(':root')), dark: minify(block(':root[data-theme="dark"]')) };
// group 2 of graphite.css: the classes sketch.js output uses
const DRAW = (() => {
  const a = CSS.indexOf('/* ── 2 drawings'), b = CSS.indexOf('/* ── 3 page pieces');
  if (a < 0 || b < 0) throw new Error('graphite.css: section markers not found');
  return minify(CSS.slice(a, b));
})();

// The dark block in graphite.css only overrides colours; fonts, line width and the
// rest live in the light block. So the dark file gets both, dark last.
// (First version shipped dark only: every font var was undefined, labels fell back to Times.)
export function tokensCss(theme) { return theme === 'dark' ? `:root{${TOKENS.light}}:root{${TOKENS.dark}}` : `:root{${TOKENS.light}}`; }
export function drawCss() { return DRAW; }
export function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function unesc(s) { return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&'); }

// Text inside <text> elements, split by font: mono labels carry class f-mono.
export function textOf(labels) {
  const out = { hand: '', mono: '' };
  for (const m of labels.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
    const inner = unesc(m[2].replace(/<[^>]+>/g, ''));
    if (/\bf-mono\b/.test(m[1])) out.mono += inner; else out.hand += inner;
  }
  return out;
}

export async function fontsFor(text) {
  const css = [], chars = {};
  for (const key of ['hand', 'mono']) {
    if (!text[key]) continue;
    const sub = await subset(key, text[key]);
    css.push(fontFaceCss(sub));
    chars[key] = sub.chars;
  }
  return { css: css.join(''), chars };
}

// fig: { w, h, title, art, labels, css, under, over, theme, still }
//   under: markup below the drawing (e.g. an <image>), over: above it
export async function standalone(fig) {
  const fonts = await fontsFor(textOf(fig.labels));
  const charsAttr = Object.entries(fonts.chars).map(([k, v]) => `${k}:${v.length}`).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fig.w} ${fig.h}" width="${fig.w}" height="${fig.h}" class="gfig" role="img" aria-label="${esc(fig.title)}" data-theme="${fig.theme}" data-glyphs="${charsAttr}"${fig.still ? ' data-still=""' : ''}>` +
    `<title>${esc(fig.title)}</title>` +
    `<style>${fonts.css}${tokensCss(fig.theme)}${DRAW}${fig.css || ''}</style>` +
    `<defs>${Sketch.filters()}${fig.defs || ''}</defs>` +
    (fig.paper === false ? '' : `<rect class="paper" width="${fig.w}" height="${fig.h}"/><rect width="${fig.w}" height="${fig.h}" filter="url(#g-tooth)"/>`) +
    (fig.under || '') +
    `<g filter="url(#g-pencil)">${fig.art}</g><g>${fig.labels}</g>` +
    (fig.over || '') + '</svg>\n';
}
