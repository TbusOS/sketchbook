// End-to-end: real catalog.yaml + data/repos.json through every generator.
// The pictures are also looked at by eye (docs/DEVELOP.md); these tests pin the
// properties a look cannot promise every day: every repo reaches every output,
// both themes really differ, fonts travel inside the files, links stay https.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadModel, art } from '../scripts/build.mjs';
import { readme } from '../scripts/lib/readme.mjs';
import { profile } from '../scripts/lib/profile.mjs';
import { head, topBar, hero, featured, shelf, all, how, footer } from '../scripts/lib/site-html.mjs';
import { tokensCss } from '../scripts/lib/svg.mjs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const model = loadModel();
const listed = model.groups.flatMap(g => g.repos);
const outputs = await art(model);

test('the real catalog has no problems and lists every group', () => {
  assert.deepEqual(model.problems, []);
  assert.ok(listed.length >= 30);
  assert.equal(model.featured.length, 6);
});

test('art: banner, shelf and six cards, in two languages and two themes', () => {
  const names = [...outputs.keys()];
  assert.equal(names.filter(n => n.startsWith('art/banner-')).length, 4);
  assert.equal(names.filter(n => n.startsWith('art/shelf-')).length, 4);
  assert.equal(names.filter(n => n.startsWith('art/card-')).length, 6 * 4);
});

test('every picture carries its own handwriting font and is a complete SVG', () => {
  for (const [name, svg] of outputs) {
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, name);
    assert.match(svg, /@font-face\{font-family:'LXGW WenKai GB Screen';src:url\(data:font\/woff2;base64,/, name);
    assert.ok(svg.trimEnd().endsWith('</svg>'), name);
  }
});

test('dark files are drawn on night paper, light files on cream', () => {
  for (const [name, svg] of outputs) {
    const dark = name.includes('-dark.svg');
    assert.equal(svg.includes('--g-paper:#131925'), dark, name);
    assert.ok(svg.includes('--g-hand:'), `${name} keeps the font variables`);
  }
  assert.ok(tokensCss('dark').indexOf('--g-hand') < tokensCss('dark').indexOf('#131925'));
});

test('the shelf has one book per listed project, the cards one per featured', () => {
  const shelfSvg = outputs.get('art/shelf-en-light.svg');
  for (const r of listed) assert.ok(shelfSvg.includes(`data-repo="${r.name}"`), r.name);
  for (const r of model.featured) assert.ok(outputs.has(`art/card-${r.name}-zh-dark.svg`), r.name);
});

test('both READMEs link every listed repo and only use https', () => {
  for (const lang of ['en', 'zh']) {
    const md = readme(model, lang);
    for (const r of listed) assert.ok(md.includes(`](${r.url})`), `${lang}: ${r.name}`);
    assert.doesNotMatch(md, /\bhttp:\/\//, lang);
    assert.ok(md.includes(lang === 'en' ? 'README_zh.md' : 'README.md'), `${lang} links the other language`);
  }
});

test('README text uses a month for dates, never "days ago"', () => {
  const md = readme(model, 'en');
  assert.doesNotMatch(md, /days? ago|yesterday|today/);
  assert.match(md, /\d{4}-\d{2}/);
});

test('profile README points at the published pictures by absolute URL', () => {
  const md = profile(model);
  for (const r of model.featured) assert.ok(md.includes(`${model.site}art/card-${r.name}-en-light.svg`), r.name);
  assert.doesNotMatch(md, /src="art\//);
});

test('web page: every project has a card with an anchor, both languages, a link', () => {
  const html = [head(model, { css: [], ogImage: '' }), topBar(model), hero(model, ROOT), featured(model), shelf(model), all(model), how(model), footer(model, '2026-01-01')].join('\n');
  for (const r of [...listed, ...model.archive]) {
    assert.ok(html.includes(`id="p-${r.name}"`), r.name);
    assert.ok(html.includes(`<a href="${r.url}">${r.name}</a>`), r.name);
  }
  assert.ok(html.includes('class="lang-en"') && html.includes('class="lang-zh"'));
  assert.equal((html.match(/data-filter="/g) || []).length, model.groups.filter(g => g.repos.length).length + 1 + (model.fresh.length ? 1 : 0));
});
