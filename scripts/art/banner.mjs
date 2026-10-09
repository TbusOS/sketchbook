// banner.mjs — the top picture: a desk scene by the image model, with code writing
// the title on the sketchbook's blank left page and drawing the featured projects'
// icons on the right page, one at a time.
//
// The page boxes were measured on art/source/hero(-dark) with scripts/measure.mjs
// (2026-10-10, 1916 × 821 original; light and dark agree within 4 px):
//   left page  x 490–942, y 350–697      right page  x 975–1441, y 351–696
// Everything is drawn a little inside those boxes, clear of the spiral binding.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Sketch, Props } from '../lib/svg.mjs';
import { drawIcon } from './icons.mjs';

export const BANNER = { w: 1916, h: 821, left: { x: 490, y: 350, w: 452, h: 347 }, right: { x: 975, y: 351, w: 466, h: 345 } };

const TEXT = {
  en: { title: 'sketchbook', sub: n => `${n} open-source projects`, by: 'by TbusOS', size: 72 },
  zh: { title: '速写本', sub: n => `TbusOS 的 ${n} 个开源项目`, by: 'AI Agent · 内核 · 大模型', size: 100 },
};

export function drawBanner(model, { lang, theme, root }) {
  const { w, h, left: L, right: R } = BANNER;
  const t = TEXT[lang];
  const S = Sketch.create({ seed: 42, id: `banner-${lang}` });
  const img = readFileSync(join(root, 'art/source', `hero${theme === 'dark' ? '-dark' : ''}.webp`)).toString('base64');
  const under = `<image href="data:image/webp;base64,${img}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none"/>`;

  const cx = L.x + L.w / 2;
  S.at(0.3, 1.8, () => S.text(cx, L.y + 118, t.title, { size: t.size, anchor: 'middle' }));
  S.at(2.1, 0.5, () => S.underline(cx - 170, cx + 170, L.y + 146, { pen: 'orange', w: 'b' }));
  S.at(2.6, 1.0, () => {
    S.text(cx, L.y + 214, t.sub(model.stats.projects), { size: 36, anchor: 'middle' });
    S.text(cx, L.y + 266, t.by, { size: 30, anchor: 'middle', ink: '2' });
  });

  // right page: 3 × 2, each featured project's icon with its name under it
  const colW = R.w / 3, rowH = R.h / 2;
  model.featured.slice(0, 6).forEach((r, i) => {
    const x = R.x + colW * (i % 3 + 0.5), y = R.y + rowH * Math.floor(i / 3) + 72;
    S.at(3.6 + i * 0.6, 0.75, () => {
      drawIcon(S, Props, r.icon, x, y, 0.82, r.pen);
      S.text(x, y + 82, r.name, { size: 22, anchor: 'middle', ink: '2' });
    });
  });

  return {
    w, h, theme, paper: false, under, css: S.css(),
    title: lang === 'zh' ? `TbusOS 速写本:${model.stats.projects} 个开源项目` : `TbusOS sketchbook: ${model.stats.projects} open-source projects`,
    art: S.art(), labels: S.labels(), dur: S.duration,
  };
}
