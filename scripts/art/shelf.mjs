// shelf.mjs — every listed project as a book on a two-row shelf.
//
// Why a shelf and not a map: 33 names placed freely on a map collide; on a shelf
// they line up by construction, and "a shelf of things we made" fits a sketchbook.
// Encoding (also written on the picture, so nobody has to guess):
//   thickness = commits (log scale: 1 commit and 420 commits both stay readable)
//   colour    = group (catalog.yaml `pen`)        ★ = featured
//   height    = just enough for the name on the spine
// On the web page each book is a <g data-repo> that the page script turns into a link.
import { Sketch } from '../lib/svg.mjs';

const W = 1600, MARGIN = 70, GAP = 6, GROUP_GAP = 46, FONT = 22;

const TEXT = {
  en: { title: 'Every project, on one shelf', note: 'thicker book = more commits  ·  ★ = featured' },
  zh: { title: '全部项目都在这个书架上', note: '书越厚 = 提交越多  ·  ★ = 精选' },
};

function layout(model) {
  const all = model.groups.flatMap(g => g.repos).concat(model.fresh);
  const maxC = Math.max(2, ...all.map(r => r.commits));
  const featured = new Set(model.featured.map(r => r.name));
  const groups = model.groups.filter(g => g.repos.length).map(g => ({ id: g.id, en: g.en, zh: g.zh, pen: g.pen, repos: g.repos }));
  if (model.fresh.length) groups.push({ id: 'fresh', en: 'New on the shelf', zh: '新上架', pen: 'sky', repos: model.fresh });
  for (const g of groups) {
    g.books = g.repos.map(r => ({
      r,
      w: Math.round(44 + 36 * Math.log(Math.max(1, r.commits)) / Math.log(maxC)),
      h: Math.min(390, Math.max(170, Math.round(r.name.length * FONT * 0.55 + 60))),
      star: featured.has(r.name),
    }));
    g.width = g.books.reduce((s, b) => s + b.w + GAP, -GAP);
  }
  // two rows, split where the running width first passes half the total
  const total = groups.reduce((s, g) => s + g.width, 0);
  const rows = [[], []];
  let acc = 0;
  for (const g of groups) { (acc < total / 2 ? rows[0] : rows[1]).push(g); acc += g.width + GROUP_GAP; }
  return rows.filter(r => r.length);
}

export function drawShelf(model, { lang, theme }) {
  const t = TEXT[lang];
  const S = Sketch.create({ seed: 9, id: `shelf-${lang}` });
  const rows = layout(model);
  let top = 120, clock = 0.9, H = 0;

  S.at(0, 0.9, () => {
    S.text(MARGIN, 72, t.title, { size: 40 });
    S.text(W - MARGIN, 72, t.note, { size: 22, anchor: 'end', ink: '2' });
  });

  rows.forEach(row => {
    const rowW = row.reduce((s, g) => s + g.width, 0) + GROUP_GAP * (row.length - 1);
    const tallest = Math.max(...row.flatMap(g => g.books.map(b => b.h)));
    const base = top + 34 + tallest;
    let x = (W - rowW) / 2;
    S.at(clock, 0.5, () => S.rect(x - 34, base, rowW + 68, 20, { fill: 'wood', style: 'wash' }));
    clock += 0.4;
    row.forEach(g => {
      const gx = x;
      g.books.forEach(b => {
        const bx = x, by = base - b.h;
        S.group(`<g class="bk" data-repo="${b.r.name}" data-group="${g.id}">`, () => {
          S.at(clock, 0.32, () => {
            S.rect(bx, by, b.w, b.h, { r: 4, fill: g.pen, gap: 4.6 });
            S.line(bx + 4, by + 16, bx + b.w - 4, by + 16, { w: 'h', double: false });
            S.line(bx + 4, base - 16, bx + b.w - 4, base - 16, { w: 'h', double: false });
            S.text(bx + b.w / 2 - 7, by + 30, b.r.name, { size: FONT, rotate: 90 });
            if (b.star) S.star(bx + b.w / 2, by - 18, 10, { pen: 'orange' });
          });
        });
        clock += 0.16;
        x += b.w + GAP;
      });
      const mid = gx + g.width / 2, label = lang === 'zh' ? g.zh : g.en;
      S.at(clock, 0.5, () => {
        S.text(mid, base + 58, label, { size: 24, anchor: 'middle' });
        S.underline(mid - Math.min(g.width / 2, label.length * (lang === 'zh' ? 12 : 6)), mid + Math.min(g.width / 2, label.length * (lang === 'zh' ? 12 : 6)), base + 70, { pen: g.pen });
      });
      clock += 0.2;
      x += GROUP_GAP - GAP;
    });
    top = base + 100;
    H = base + 96;
  });

  return {
    w: W, h: H, theme, css: S.css(),
    title: lang === 'zh' ? '书架:每本书是一个项目,书越厚提交越多' : 'The shelf: one book per project, thicker means more commits',
    art: S.art(), labels: S.labels(), dur: S.duration,
  };
}
