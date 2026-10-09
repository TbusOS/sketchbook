// fonts.mjs — cut fonts down to the characters a picture or page actually uses.
//
// Why: an SVG shown in a README is loaded as an image, and an image may not load
// anything from outside itself. The handwriting has to travel inside the SVG,
// and the full LXGW WenKai GB Screen is 26 MB; the 30 characters of a card are ~7 KB.
//
// Sources:
//   hand  LXGW WenKai GB Screen (OFL 1.1) — too big for git; downloaded once into
//         .cache/fonts/ from the font's GitHub release
//   mono  JetBrains Mono, Latin part (OFL 1.1) — fonts/, committed (31 KB)
//   body  Lora, Latin part (OFL 1.1) — fonts/, committed, used by the web page only
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const HAND_URL = 'https://github.com/lxgw/LxgwWenKai-Screen/releases/download/v1.522/LXGWWenKaiGBScreen.ttf';

export const FACES = {
  hand: { family: 'LXGW WenKai GB Screen', file: join(ROOT, '.cache/fonts/LXGWWenKaiGBScreen.ttf'), url: HAND_URL },
  mono: { family: 'JetBrains Mono', file: join(ROOT, 'fonts/jetbrains-mono-latin.woff2') },
  body: { family: 'Lora', file: join(ROOT, 'fonts/lora-latin.woff2') },
};

const sources = new Map();
function source(face) {
  if (sources.has(face.file)) return sources.get(face.file);
  if (!existsSync(face.file)) {
    if (!face.url) throw new Error(`font missing: ${face.file}`);
    mkdirSync(dirname(face.file), { recursive: true });
    console.log(`fonts: downloading ${face.url}`);
    // curl, not fetch: curl honours HTTPS_PROXY, Node's fetch does not
    execFileSync('curl', ['-fsSL', '--retry', '3', '-o', face.file, face.url], { stdio: 'inherit' });
  }
  const buf = readFileSync(face.file);
  sources.set(face.file, buf);
  return buf;
}

// Always include ASCII digits and basic punctuation: numbers on cards change daily,
// and a missing "7" would quietly fall back to a system font.
export const ALWAYS = '0123456789 .,·:-–—/()+%#&\'"?!';

export function charsFor(text) { return [...new Set([...(text + ALWAYS)])].sort().join(''); }

const cache = new Map();
export async function subset(faceKey, text) {
  const face = FACES[faceKey];
  const chars = charsFor(text);
  const key = `${faceKey}:${chars}`;
  if (!cache.has(key)) cache.set(key, subsetFont(source(face), chars, { targetFormat: 'woff2' }));
  return { family: face.family, chars, woff2: await cache.get(key) };
}

export function fontFaceCss(sub, extra = '') {
  return `@font-face{font-family:'${sub.family}';src:url(data:font/woff2;base64,${sub.woff2.toString('base64')}) format('woff2');font-display:block${extra}}`;
}

