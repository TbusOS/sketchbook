// site.mjs — write the web page into site/ (deployed by the Pages workflow, not committed).
//
// site/
//   index.html
//   assets/  graphite.css player.js (vendor) · site.css app.js (web/) · fonts/
//   media/   the WebP pictures (hero, card pictures, social preview)
//   art/     the README SVGs again, so the profile README can link them by URL
//
// Fonts are cut to the characters on this page: the hand font covers both languages
// (the Chinese page is set in it), ~1 500 glyphs instead of the 26 MB original.
import { mkdirSync, rmSync, writeFileSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Sketch } from './svg.mjs';
import { subset } from './fonts.mjs';
import { head, topBar, hero, featured, shelf, all, how, footer } from './site-html.mjs';

function visibleText(html) {
  return html.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

export async function buildSite(model, { root, art }) {
  const dir = join(root, 'site');
  rmSync(dir, { recursive: true, force: true });
  for (const d of ['assets/fonts', 'media', 'art']) mkdirSync(join(dir, d), { recursive: true });

  copyFileSync(join(root, 'vendor/graphite/graphite.css'), join(dir, 'assets/graphite.css'));
  copyFileSync(join(root, 'vendor/graphite/player.js'), join(dir, 'assets/player.js'));
  copyFileSync(join(root, 'web/site.css'), join(dir, 'assets/site.css'));
  copyFileSync(join(root, 'web/app.js'), join(dir, 'assets/app.js'));
  for (const f of readdirSync(join(root, 'art/source'))) copyFileSync(join(root, 'art/source', f), join(dir, 'media', f));
  for (const [rel, content] of art) if (rel.startsWith('art/') && rel.endsWith('.svg')) writeFileSync(join(dir, rel), content);
  const social = join(root, 'art/social-preview.png');
  const ogImage = existsSync(social) ? 'media/social-preview.png' : '';
  if (ogImage) copyFileSync(social, join(dir, ogImage));

  const built = new Date().toISOString().slice(0, 10);
  const body = [
    `<body class="g-page">`,
    `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${Sketch.filters()}</defs></svg>`,
    topBar(model),
    `<main>`, hero(model, root), featured(model), shelf(model), all(model), how(model), `</main>`,
    footer(model, built),
    `<script src="assets/player.js"></script>`,
    `<script src="assets/app.js"></script>`,
    `</body></html>`,
  ].join('\n');
  const html = head(model, { css: ['assets/graphite.css', 'assets/site.css'], ogImage }) + '\n' + body + '\n';

  const text = visibleText(html);
  const hand = await subset('hand', text + 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ…↗→←★☾');
  writeFileSync(join(dir, 'assets/fonts/hand.woff2'), hand.woff2);
  const mono = await subset('mono', text.replace(/[^\x20-\x7e]/g, '') + '↗→★');
  writeFileSync(join(dir, 'assets/fonts/mono.woff2'), mono.woff2);
  copyFileSync(join(root, 'fonts/lora-latin.woff2'), join(dir, 'assets/fonts/lora.woff2'));

  writeFileSync(join(dir, 'index.html'), html);
  writeFileSync(join(dir, '.nojekyll'), '');
  return dir;
}
