const { test, expect } = require('./fixtures.cjs');

// W13b: per-cell UV transforms must keep tile edges continuous, and variant cells must keep their base tile's edges.
test('surfaces: allowed tile transforms and variant cells keep edges matching (GL atlas readback)', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(() => {
    const fb = gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, atlasTex, 0);
    const A = new Uint8Array(ATLAS * ATLAS * 4);gl.readPixels(0, 0, ATLAS, ATLAS, gl.RGBA, gl.UNSIGNED_BYTE, A);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);gl.deleteFramebuffer(fb);
    const at = (t, s, u) => {const [cx, cy] = TCELL(t), k = ((cy * 64 + 2 + Math.round(u * 59)) * ATLAS + cx * 64 + 2 + Math.round(s * 59)) * 4;return [A[k], A[k + 1], A[k + 2]];};
    // mean colour of 4 runs along a side (0 left, 1 right, 2 top, 3 bottom) of tile t seen through D8 transform k
    const prof = (t, k, side) => {const m = D8[k], out = [];for (let g = 0;g < 4;g++) {const acc = [0, 0, 0];for (let q = 0;q < 15;q++) {
      const w = (g * 15 + q) / 59, [s, u] = [[0, w], [1, w], [w, 0], [w, 1]][side], a = s - 0.5, c = u - 0.5, p = at(t, m[0] * a + m[1] * c + 0.5, m[2] * a + m[3] * c + 0.5);
      for (let ch = 0;ch < 3;ch++) acc[ch] += p[ch] / 15;}out.push(acc);}return out;};
    const diff = (t, k, sides, b = t) => {let d = 0;for (const side of sides) {const P = prof(t, k, side), Q = prof(b, 0, side);
      for (let g = 0;g < 4;g++) for (let ch = 0;ch < 3;ch++) d = Math.max(d, Math.abs(P[g][ch] - Q[g][ch]));}return Math.round(d);};
    // a horizontal flip only creates mirror seams (always continuous), so it must just keep top and bottom. Tolerance 20 is
    // a coarse guard: random specks/curves already differ that much at plain seams; wrong classes on trims/checkers show 150+
    const bad = [];for (const t of Object.keys(TCLS).map(Number)) for (const k of SXF[TCLS[t]]) {const d = diff(t, k, k === 4 ? [2, 3] : [0, 1, 2, 3]);if (d > 20) bad.push([t, k, d]);}
    const variants = VDEF.map(([b], i) => diff(64 + i, 0, [0, 1, 2, 3], b));
    return { bad, variants, control: [diff(1, 1, [0, 1, 2, 3]), diff(43, 1, [0, 1, 2, 3])], err: gl.getError() };
  });
  expect(r.bad).toEqual([]);
  expect(Math.max(...r.variants)).toBeLessThanOrEqual(1);
  for (const c of r.control) expect(c).toBeGreaterThan(50);
  expect(r.err).toBe(0);
});
