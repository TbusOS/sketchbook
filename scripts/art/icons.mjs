// icons.mjs — one small drawing per project, in a 100 × 100 box around (cx, cy).
//
// draw(S, P, name, cx, cy, k, pen): k scales the box, pen is the group's pencil.
// Colour rule (graphite): the group pencil is the only colour that means
// something; everything else is graphite line, a grey wash or blank paper. So an
// icon says "what it does" by shape and "which shelf it sits on" by colour.
// Names are the `icon:` values in catalog.yaml; check.mjs fails on an unknown one.

function M(cx, cy, k) {
  const p = (u, v) => [cx + u * k, cy + v * k];
  p.pts = list => list.map(([u, v]) => p(u, v));
  p.rr = (u, v, w, h, r) => list(u, v, w, h, r).map(([a, b]) => p(a, b));
  return p;
}
function list(x, y, w, h, r) {
  const out = [], n = 4;
  r = Math.min(r, w / 2, h / 2);
  const arc = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI);
  return out;
}
const T = { w: 't' }, H = { w: 'h', double: false };
const L = (S, a, b, o) => S.line(a[0], a[1], b[0], b[1], o);

const ICONS = {
  pencils(S, P, p, pen) {
    [[-26, 'grey'], [-8, pen], [10, 'grey'], [28, 'grey']].forEach(([u, c], i) => {
      const lean = (i - 1.5) * 4;
      S.poly(p.pts([[u - 6 + lean, -34], [u + 6 + lean, -34], [u + 6, 26], [u - 6, 26]]), { fill: c, gap: 3.4, w: 't' });
      S.poly(p.pts([[u - 6 + lean, -34], [u + 6 + lean, -34], [u + lean, -48]]), { w: 't', fill: 'wood', style: 'wash' });
    });
    S.poly(p.pts([[-42, 16], [44, 16], [40, 44], [-38, 44]]), { fill: 'paper', style: 'wash', washCls: 'solid' });
  },
  whetstone(S, P, p, pen) {
    S.poly(p.pts([[-46, 18], [46, 18], [42, 38], [-42, 38]]), { fill: 'wood', style: 'wash' });
    S.poly(p.pts([[-38, 4], [38, 4], [38, 18], [-38, 18]]), { fill: 'grey', gap: 3.6 });
    S.poly(p.pts([[-30, -2], [18, -26], [22, -18], [-26, 6]]), { fill: pen, gap: 3.2, w: 't' });
    S.poly(p.pts([[18, -26], [36, -34], [22, -18]]), { w: 't', fill: 'wood', style: 'wash' });
    S.burst(...p(-30, 0), 6 * p.k, 14 * p.k, 200, 250, 3);
  },
  books(S, P, p, pen) { P.books(S, ...p(0, 34), p.k, { pens: ['grey', pen, 'grey', pen] }); },
  cards(S, P, p, pen) {
    S.poly(p.pts([[-44, -6], [44, -6], [44, 40], [-44, 40]]), { fill: 'wood', style: 'wash' });
    L(S, p(-44, 8), p(44, 8), T);
    S.poly(p.pts([[-30, -34], [10, -40], [16, -4], [-24, 2]]), { fill: 'paper', style: 'wash', washCls: 'solid', w: 't' });
    S.poly(p.pts([[-10, -30], [30, -26], [26, 6], [-14, 2]]), { fill: pen, gap: 4.2, w: 't' });
    S.dot(...p(0, 24), 3);
  },
  palette(S, P, p, pen) {
    S.blob(...p(0, 2), 46 * p.k, 36 * p.k, { fill: 'wood', style: 'wash', bump: 0.08 });
    S.circle(...p(18, 18), 7 * p.k, T);
    [[-24, -8, pen], [-6, -20, 'grey'], [16, -14, pen], [-26, 14, 'grey']].forEach(([u, v, c]) => S.circle(...p(u, v), 7 * p.k, { w: 't', fill: c, gap: 3 }));
  },
  bulb(S, P, p, pen) { P.bulb(S, ...p(0, -4), p.k * 1.05, {}); },
  doc(S, P, p, pen) {
    P.doc(S, ...p(-36, -42), p.k * 0.9, {});
    P.doc(S, ...p(-12, -30), p.k * 0.9, { pen });
  },
  chart(S, P, p, pen) {
    L(S, p(-42, 40), p(44, 40)); L(S, p(-42, 40), p(-42, -44));
    [[-30, 20], [-12, 6], [6, 14], [24, -16]].forEach(([u, h], i) => S.poly(p.pts([[u, 40], [u + 12, 40], [u + 12, h], [u, h]]), { fill: i === 3 ? pen : 'grey', gap: 3.6, w: 't' }));
    S.arrow(p.pts([[-36, 6], [-14, -10], [4, -4], [34, -36]]), { w: 't', head: 9 * p.k });
  },
  phone(S, P, p, pen) {
    P.phone(S, ...p(-8, 0), p.k * 0.95, { screen: pen });
    S.path(p.pts([[-8, 42], [-8, 48], [20, 48], [34, 34], [44, 34]]), T);
    S.poly(p.pts([[38, 26], [50, 26], [50, 42], [38, 42]]), { w: 't', fill: 'grey', style: 'wash' });
  },
  monitor(S, P, p, pen) { P.monitor(S, ...p(0, 40), p.k * 0.62, { screen: pen }); },
  laptop(S, P, p, pen) { P.laptop(S, ...p(0, 34), p.k * 0.68, { screen: pen }); },
  map(S, P, p, pen) {
    S.poly(p.pts([[-44, -30], [-14, -38], [14, -30], [44, -38], [44, 34], [14, 42], [-14, 34], [-44, 42]]), { fill: 'paper', style: 'wash', washCls: 'solid' });
    L(S, p(-14, -38), p(-14, 34), H); L(S, p(14, -30), p(14, 42), H);
    S.path(p.pts([[-34, 22], [-20, 4], [-2, 14], [14, -6], [32, -18]]), { pen, cls: 'dash' });
    S.dot(...p(32, -18), 4.5, { pen });
  },
  clock(S, P, p, pen) { P.clock(S, ...p(0, 0), p.k * 1.25, { hour: 4, min: 40 }); },
  cloud(S, P, p, pen) {
    P.cloud(S, ...p(0, -4), p.k * 0.62, { pen });
    S.arrow(p.pts([[0, 8], [4, 26], [-2, 44]]), { w: 't', head: 8 * p.k });
  },
  save(S, P, p, pen) {
    S.poly(p.pts([[-38, -40], [28, -40], [40, -28], [40, 40], [-38, 40]]), { fill: pen, gap: 4.2 });
    S.poly(p.pts([[-24, -40], [20, -40], [20, -14], [-24, -14]]), { w: 't', fill: 'paper', style: 'wash', washCls: 'solid' });
    S.poly(p.pts([[-26, 6], [26, 6], [26, 40], [-26, 40]]), { w: 't', fill: 'paper', style: 'wash', washCls: 'solid' });
    L(S, p(8, -34), p(8, -20), T);
  },
  terminal(S, P, p, pen) {
    S.loop(p.rr(-46, -34, 92, 68, 8), { fill: 'line', style: 'wash' });
    S.path(p.pts([[-30, -12], [-16, -2], [-30, 8]]), { pen, smooth: false });
    L(S, p(-8, 10), p(20, 10), { pen });
    L(S, p(-34, 24), p(34, 24), H);
  },
  server(S, P, p, pen) { P.server(S, ...p(0, 46), p.k * 0.78, { n: 3, lights: [pen, 'grey', pen] }); },
  papers(S, P, p, pen) {
    [[24, 'grey'], [12, 'grey'], [0, 'grey'], [-12, 'grey']].forEach(([v], i) => S.poly(p.pts([[-38 + i * 2, v + 10], [34 + i * 2, v + 8], [36 + i * 2, v + 20], [-36 + i * 2, v + 22]]), { w: 't', fill: 'paper', style: 'wash', washCls: 'solid' }));
    S.poly(p.pts([[14, 8], [24, 8], [24, -8], [14, -8]]), { w: 'h', fill: pen, gap: 3 });
    P.magnifier(S, ...p(-8, -26), p.k * 0.62, {});
  },
  robot(S, P, p, pen) { P.robot(S, ...p(0, 50), p.k * 0.5, { pose: 'wave' }); },
  chat(S, P, p, pen) {
    S.loop(p.pts([[-44, -36], [14, -36], [18, -6], [-14, -4], [-28, 8], [-26, -4], [-44, -6]]), { fill: pen, gap: 4 });
    S.loop(p.pts([[-6, 2], [44, 2], [44, 32], [30, 32], [34, 44], [18, 32], [-6, 32]]), { fill: 'paper', style: 'wash', washCls: 'solid' });
    [6, 20, 34].forEach(u => S.dot(...p(u - 6, 17), 2.6));
  },
  chip(S, P, p, pen) {
    S.loop(p.rr(-28, -28, 56, 56, 6), { fill: pen, gap: 4 });
    S.poly(p.pts([[-14, -14], [14, -14], [14, 14], [-14, 14]]), { w: 't', fill: 'paper', style: 'wash', washCls: 'solid' });
    for (let i = -18; i <= 18; i += 12) {
      L(S, p(i, -28), p(i, -42), H); L(S, p(i, 28), p(i, 42), H);
      L(S, p(-28, i), p(-42, i), H); L(S, p(28, i), p(42, i), H);
    }
  },
  flow(S, P, p, pen) {
    const box = (u, v, c) => S.loop(p.rr(u - 13, v - 9, 26, 18, 5), c ? { fill: c, gap: 3.2, w: 't' } : T);
    box(-30, -30, pen); box(30, -30); box(-30, 30); box(30, 30, pen);
    S.arrow(p.pts([[-16, -30], [16, -30]]), { w: 't', head: 7 * p.k });
    S.arrow(p.pts([[-24, -20], [24, 20]]), { w: 't', head: 7 * p.k, pen });
    S.arrow(p.pts([[-30, -20], [-30, 20]]), { w: 't', head: 7 * p.k });
  },
  router(S, P, p, pen) {
    S.loop(p.rr(-42, 6, 84, 28, 6), { fill: 'grey', style: 'wash' });
    [-26, -12, 2].forEach(u => S.dot(...p(u, 20), 3.4, { pen }));
    L(S, p(-30, 6), p(-36, -34), T); L(S, p(30, 6), p(36, -34), T);
    [16, 26].forEach(r => S.path([p(-r * 0.7, -16 - r * 0.6), p(0, -16 - r), p(r * 0.7, -16 - r * 0.6)], { w: 't', pen }));
  },
  checklist(S, P, p, pen) {
    S.poly(p.pts([[-34, -44], [34, -44], [34, 44], [-34, 44]]), { fill: 'paper', style: 'wash', washCls: 'solid' });
    [-24, 0, 24].forEach((v, i) => {
      S.path(p.pts([[-24, v], [-18, v + 6], [-8, v - 8]]), { pen: i < 2 ? pen : undefined, smooth: false, w: 't' });
      L(S, p(0, v), p(24, v), H);
    });
  },
  pointer(S, P, p, pen) {
    S.loop(p.rr(-44, -18, 30, 36, 6), { fill: pen, gap: 3.6 });
    S.dot(...p(-29, 0), 4);
    S.arrow(p.pts([[-14, 0], [8, -14], [26, -22]]), { head: 9 * p.k });
    S.loop(p.rr(26, -38, 22, 30, 5), T);
    S.loop(p.rr(26, 6, 22, 30, 5), { w: 't', cls: 'dash' });
  },
  magnifier(S, P, p, pen) {
    [[-40, -26], [-16, -30], [8, -22], [-30, 2], [-6, 6]].forEach(([u, v]) => S.loop(p.rr(u, v, 18, 12, 3), H));
    P.magnifier(S, ...p(-4, -4), p.k * 1.05, {});
    S.ring(...p(-4, -4), 28 * p.k, 28 * p.k, { pen });
  },
  stairs(S, P, p, pen) {
    const st = [[-44, 40], [-44, 20], [-22, 20], [-22, 0], [0, 0], [0, -20], [22, -20], [22, -40], [44, -40], [44, 40]];
    S.poly(p.pts(st), { fill: 'grey', style: 'wash' });
    S.poly(p.pts([[22, -40], [44, -40], [44, -20], [22, -20]]), { w: 't', fill: pen, gap: 3.4 });
    S.star(...p(33, -52), 7 * p.k, { pen });
  },
  usb(S, P, p, pen) {
    S.loop(p.rr(-16, -10, 32, 52, 6), { fill: 'grey', style: 'wash' });
    S.poly(p.pts([[-11, -38], [11, -38], [11, -10], [-11, -10]]), { fill: pen, gap: 3.2, w: 't' });
    S.poly(p.pts([[-6, -32], [-1, -32], [-1, -26], [-6, -26]]), H); S.poly(p.pts([[1, -32], [6, -32], [6, -26], [1, -26]]), H);
    S.path(p.pts([[0, 42], [0, 48], [-20, 50], [-36, 44]]), T);
  },
  shield(S, P, p, pen) {
    S.loop(p.pts([[0, -44], [36, -32], [32, 8], [0, 44], [-32, 8], [-36, -32]]), { fill: pen, gap: 4 });
    S.path(p.pts([[-14, 0], [-4, 12], [16, -14]]), { w: 'b', smooth: false });
  },
  compass(S, P, p, pen) {
    S.circle(...p(0, 0), 42 * p.k, { fill: 'paper', style: 'wash', washCls: 'solid' });
    S.poly(p.pts([[0, -32], [8, 0], [0, 6], [-8, 0]]), { w: 't', fill: pen, gap: 3 });
    S.poly(p.pts([[0, 32], [8, 0], [0, -6], [-8, 0]]), { w: 't', fill: 'grey', style: 'wash' });
    S.dot(...p(0, 0), 3);
  },
  ruler(S, P, p, pen) {
    S.poly(p.pts([[-46, 6], [40, -34], [48, -18], [-38, 22]]), { fill: pen, gap: 4 });
    for (let i = 0; i < 8; i++) { const u = -36 + i * 11, v = 6 - i * 5.1; L(S, p(u, v), p(u + 2, v + (i % 2 ? 6 : 10)), H); }
  },
  keyboard(S, P, p, pen) {
    S.loop(p.rr(-46, -22, 92, 46, 6), { fill: 'grey', style: 'wash' });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
      const u = -38 + c * 13 + (r % 2) * 4, v = -14 + r * 12, hit = (r === 1 && c === 1) || (r === 0 && c === 4);
      S.poly(p.pts([[u, v], [u + 9, v], [u + 9, v + 8], [u, v + 8]]), hit ? { w: 'h', fill: pen, gap: 2.4 } : H);
    }
  },
  printer(S, P, p, pen) {
    S.poly(p.pts([[-26, -42], [26, -42], [26, -12], [-26, -12]]), { w: 't', fill: 'paper', style: 'wash', washCls: 'solid' });
    S.loop(p.rr(-44, -16, 88, 36, 6), { fill: 'grey', style: 'wash' });
    S.poly(p.pts([[-24, 10], [24, 10], [28, 46], [-28, 46]]), { w: 't', fill: pen, gap: 3.8 });
    S.dot(...p(32, -4), 3, { pen });
  },
  gear(S, P, p, pen) { P.gear(S, ...p(-10, 6), p.k * 0.9, { pen }); P.gear(S, ...p(28, -26), p.k * 0.5, {}); },
};

export const ICON_NAMES = Object.keys(ICONS);

export function drawIcon(S, P, name, cx, cy, k, pen) {
  const fn = ICONS[name];
  if (!fn) throw new Error(`unknown icon "${name}" (known: ${ICON_NAMES.join(', ')})`);
  const p = M(cx, cy, k);
  p.k = k;
  fn(S, P, p, pen);
}
