// card.mjs — a featured project as a hand-drawn card: picture, name, one short line.
//
// 800 × 600. The picture (image model, art/source/v-<repo>.webp) sits in a window
// taped to the card; below it the name, the hook and one line of facts; the
// project's icon in the corner. In the README two cards share a row, so the card is
// shown ~400 px wide: the name ends up ~23 px, the hook ~14 px. Everything a reader
// must be able to read on a phone is also in the table under the cards.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Sketch, Props, esc } from '../lib/svg.mjs';
import { drawIcon } from './icons.mjs';

export const CARD = { w: 800, h: 600, pic: { x: 24, y: 24, w: 752, h: 400 } };

const T = {
  en: { demo: 'live demo', open: 'open source' },
  zh: { demo: '有在线演示', open: '开源' },
};

// Stars in steps, not exact: a card embeds a ~40 KB picture, and redrawing 24 cards
// for every new star would add megabytes to the history each month. Exact numbers
// (commits, last update, stars) live in the README tables, where a change costs bytes.
export function starStep(n) {
  const steps = [10000, 5000, 2000, 1000, 500, 200, 100, 50, 10];
  const s = steps.find(v => n >= v);
  return s ? `★ ${s >= 1000 ? s / 1000 + 'k' : s}+` : '';
}

export function cardFacts(r, lang) {
  const t = T[lang];
  return [r.language, r.showStars ? starStep(r.stars) : '', r.demo ? t.demo : t.open].filter(Boolean).join('  ·  ');
}

function dataUri(file) { return `data:image/webp;base64,${readFileSync(file).toString('base64')}`; }

// index: position among the featured cards — later cards start drawing a little later,
// so a row of cards is drawn one after the other rather than all at once.
export function drawCard(r, { lang, theme, index = 0, root }) {
  const { w, h, pic } = CARD;
  const S = Sketch.create({ seed: 100 + index * 7, id: `card-${r.name}` });
  const t0 = 0.2 + index * 0.35;
  const hook = lang === 'zh' ? r.hookZh : r.hookEn;

  const cardPts = Sketch.roundRectPts(6, 6, w - 12, h - 12, 26);
  const clipPts = Sketch.roundRectPts(pic.x, pic.y, pic.w, pic.h, 12);
  const img = join(root, 'art/source', `v-${r.name}${theme === 'dark' ? '-dark' : ''}.webp`);
  const under =
    `<path class="card" d="${Sketch.spline(cardPts, true)}Z"/>` +
    `<clipPath id="pic-${r.name}"><path d="${Sketch.spline(clipPts, true)}Z"/></clipPath>` +
    `<image href="${dataUri(img)}" x="${pic.x}" y="${pic.y}" width="${pic.w}" height="${pic.h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#pic-${r.name})" class="pic" style="--d:${t0 + 0.5}s"/>`;

  S.at(t0, 1.1, () => {
    S.loop(cardPts, { w: 'b' });
    S.rect(pic.x, pic.y, pic.w, pic.h, { r: 12, w: 't' });
  });
  S.at(t0 + 1.1, 0.6, () => {
    // two strips of tape in the group's pencil hold the picture on the card
    [[pic.x + 40, pic.y - 2, -8], [pic.x + pic.w - 150, pic.y - 12, 6]].forEach(([x, y, a]) => {
      const rad = a * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad);
      const pts = [[0, 0], [110, 0], [110, 30], [0, 30]].map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
      S.poly(pts, { w: 'h', fill: r.pen, style: 'zig', gap: 3.2 });
    });
  });
  S.at(t0 + 1.5, 1.6, () => {
    S.text(44, 486, r.name, { size: 46 });
    if (hook) S.text(44, 532, hook, { size: 28, ink: '2' });
    S.text(44, 574, cardFacts(r, lang), { size: 21, ink: '2' });
  });
  S.at(t0 + 2.6, 1.0, () => drawIcon(S, Props, r.icon, w - 92, 512, 0.78, r.pen));

  // the picture fades in after the frame is drawn (先线后色): line first, then colour
  const css = '.pic{animation:g-fade .9s ease-out var(--d) both}@media (prefers-reduced-motion:reduce){.pic{animation:none}}';
  return {
    w, h, theme, paper: false, css: css + S.css(), under,
    title: `${r.name}${hook ? ' — ' + hook : ''}`,
    art: S.art(), labels: S.labels(), dur: S.duration,
    alt: esc(`${r.name}: ${lang === 'zh' ? r.zh : r.en}`),
  };
}
