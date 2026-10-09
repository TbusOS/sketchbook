#!/usr/bin/env node
// preview.mjs — render an HTML file or SVG to PNG with the local Chromium, for looking at art.
//
//   node scripts/preview.mjs <file.html|file.svg> <out.png> [width] [--dark] [--wait=ms]
//
// Development aid only (needs the playwright devDependency); the build never calls it.
import { chromium } from 'playwright';
import { resolve, basename } from 'node:path';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const [file, out, width = '1400'] = args.filter(a => !a.startsWith('--'));
const dark = args.includes('--dark');
const wait = +(args.find(a => a.startsWith('--wait=')) || '--wait=12000').slice(7);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +width, height: 900 }, colorScheme: dark ? 'dark' : 'light', deviceScaleFactor: 1 });
// An SVG opened as the page itself sometimes never finishes a full-page screenshot
// (heavy filters); shown as an <img>, the way GitHub shows it, it renders fine.
let target = resolve(file);
if (file.endsWith('.svg')) {
  target = resolve(file.replace(/\.svg$/, '.preview.html'));
  writeFileSync(target, `<!doctype html><body style="margin:0;background:#888"><img src="./${basename(file)}" style="display:block;width:100%"></body>`);
}
await page.goto(pathToFileURL(target).href);
await page.waitForTimeout(wait);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(`preview: ${out}`);
