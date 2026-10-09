#!/usr/bin/env node
// measure.mjs — find a flat blank area in a bitmap, so code can draw on top of it.
//
//   node scripts/measure.mjs <image> <x> <y> [tolerance]
//
// Starts at (x, y), which must be inside the blank area, and walks left / right /
// up / down along the middle row and column until the colour differs from the
// start pixel by more than `tolerance` (sum of RGB differences, default 30).
// Prints the box in pixels and in percent of the image. Same method as the
// graphite-design image-prompts guide; measure the light and the dark image and
// only share one box between them when they agree to a few pixels.
import sharp from 'sharp';

export async function measure(file, x, y, tol = 30) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const px = (i, j) => { const k = (j * W + i) * 3; return [data[k], data[k + 1], data[k + 2]]; };
  const ref = px(x, y);
  const same = (i, j) => { const p = px(i, j); return Math.abs(p[0] - ref[0]) + Math.abs(p[1] - ref[1]) + Math.abs(p[2] - ref[2]) < tol; };
  // walk a few rows / columns and keep the tightest edge, so one stray mark does not stop us early
  const walk = (dx, dy) => {
    const edges = [];
    for (const off of [-40, -20, 0, 20, 40]) {
      let i = x + (dy ? off : 0), j = y + (dx ? off : 0);
      while (i > 0 && j > 0 && i < W - 1 && j < H - 1 && same(i + dx, j + dy)) { i += dx; j += dy; }
      edges.push(dx ? i : j);
    }
    edges.sort((a, b) => a - b);
    return edges[2];   // median of five
  };
  const box = { left: walk(-1, 0), right: walk(1, 0), top: walk(0, -1), bottom: walk(0, 1), width: W, height: H };
  const pct = v => Math.round(v * 1000) / 10;
  box.pct = { left: pct(box.left / W), right: pct(box.right / W), top: pct(box.top / H), bottom: pct(box.bottom / H) };
  return box;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [file, x, y, tol] = process.argv.slice(2);
  if (!file) { console.error('usage: measure.mjs <image> <x> <y> [tolerance]'); process.exit(2); }
  console.log(JSON.stringify(await measure(file, +x, +y, tol ? +tol : 30)));
}
