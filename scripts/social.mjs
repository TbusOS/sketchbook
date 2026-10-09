#!/usr/bin/env node
// social.mjs — the 1280 × 640 picture shown when someone shares a link to the repo or the page.
//
//   node scripts/social.mjs            write art/social-preview.png (needs playwright)
//
// It is the finished English banner on paper, with the address underneath. GitHub
// has no API for a repository's social preview, so upload this file by hand:
// repo Settings → General → Social preview. The web page uses it as og:image.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const banner = readFileSync(join(ROOT, 'art/banner-en-light.svg'), 'utf8')
  .replace('<svg ', '<svg data-still="" ');   // finished drawing, no animation
const font = readFileSync(join(ROOT, 'site/assets/fonts/hand.woff2')).toString('base64');
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:H;src:url(data:font/woff2;base64,${font})}
body{margin:0;width:1280px;height:640px;background:#f6efe2;overflow:hidden;font-family:H}
.b{display:block;width:1280px;height:auto;margin-top:6px}
.b svg{width:1280px;height:auto;display:block}
p{margin:0;position:absolute;left:0;right:0;bottom:30px;text-align:center;font-size:34px;color:#39332c}
p span{color:#933d12}
</style><div class="b">${banner}</div><p>github.com/TbusOS/<span>sketchbook</span></p>`;
const tmp = join(ROOT, '.cache/social.html');
writeFileSync(tmp, html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 640 } });
await page.goto(pathToFileURL(tmp).href);
await page.waitForTimeout(1500);
await page.screenshot({ path: join(ROOT, 'art/social-preview.png') });
await browser.close();
console.log('social: art/social-preview.png');
