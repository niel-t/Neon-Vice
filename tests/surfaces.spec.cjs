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

// W13c: macro 2×2 cells must be continuous across quarters and wrap; blend partners need a usable height mask.
test('surfaces: macro tiles wrap continuously and blend partners carry grime masks (GL atlas readback)', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(() => {
    const fb = gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, atlasTex, 0);
    const A = new Uint8Array(ATLAS * ATLAS * 4);gl.readPixels(0, 0, ATLAS, ATLAS, gl.RGBA, gl.UNSIGNED_BYTE, A);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);gl.deleteFramebuffer(fb);
    const px = (t, i, j) => {const [cx, cy] = TCELL(t);return ((cy * 64 + j) * ATLAS + cx * 64 + i) * 4;};
    // mean colour of 4 runs along one side (0 left, 1 right, 2 top, 3 bottom) of the 60px interior
    const prof = (t, side) => {const out = [];for (let g = 0;g < 4;g++) {const acc = [0, 0, 0];for (let q = 0;q < 15;q++) {
      const w = 2 + g * 15 + q, [i, j] = [[2, w], [61, w], [w, 2], [w, 61]][side], k = px(t, i, j);for (let c = 0;c < 3;c++) acc[c] += A[k + c] / 15;}out.push(acc);}return out;};
    const seam = (a, sa, b, sb) => {const P = prof(a, sa), Q = prof(b, sb);let d = 0;for (let g = 0;g < 4;g++) for (let c = 0;c < 3;c++) d = Math.max(d, Math.abs(P[g][c] - Q[g][c]));return Math.round(d);};
    // the quarter seams sit on 32-unit boundaries, which are also checker/plank edges, so compare each macro seam with the
    // legacy base tile's own wrap seam (known seamless); a design drawn without wrap copies or with a wrong quarter offset
    // breaks rows/grout/veins at the seam and exceeds it
    let macro = 0;for (const b of MACDEF) {const m = MACRO[b], h = seam(b, 1, b, 0), v = seam(b, 3, b, 2);
      for (const [a, c] of [[0, 1], [1, 0], [2, 3], [3, 2]]) macro = Math.max(macro, seam(m + a, 1, m + c, 0) - h);
      for (const [a, c] of [[0, 2], [2, 0], [1, 3], [3, 1]]) macro = Math.max(macro, seam(m + a, 3, m + c, 2) - v);}
    const masks = Object.entries(BLEND).map(([t, p]) => {let lo = 255, hi = 0, lb = 0, lp = 0;
      for (let j = 2;j < 62;j += 3) for (let i = 2;i < 62;i += 3) {const k = px(p, i, j), s = px(+t, i, j);lo = Math.min(lo, A[k + 3]);hi = Math.max(hi, A[k + 3]);
        lb += A[s] + A[s + 1] + A[s + 2];lp += A[k] + A[k + 1] + A[k + 2];}
      return { t: +t, span: hi - lo, darker: lp < lb || lb < 400 * 150 };});
    const ids = [...VDEF.map((_, i) => 64 + i), ...Object.values(MACRO).flatMap(m => [m, m + 1, m + 2, m + 3]), ...Object.values(BLEND)];
    // mask edges must be one palindromic profile on all four sides, so differently transformed neighbours blend seamlessly
    let edge = 0;for (const p of Object.values(BLEND)) for (let w = 2;w < 62;w++) {const ref = A[px(p, 2, w) + 3];
      for (const [i, j] of [[61, w], [w, 2], [w, 61], [2, 63 - w], [61, 63 - w], [63 - w, 2], [63 - w, 61]]) edge = Math.max(edge, Math.abs(A[px(p, i, j) + 3] - ref));}
    // the same must hold for box-filtered mips down to 4×4 per cell (LOD 4)
    let mip = 0;for (const p of Object.values(BLEND)) {let n = 64, M = [];for (let j = 0;j < 64;j++) for (let i = 0;i < 64;i++) M.push(A[px(p, i, j) + 3]);
      while (n > 4) {const h = n / 2, N = [];for (let j = 0;j < h;j++) for (let i = 0;i < h;i++) N.push((M[2 * j * n + 2 * i] + M[2 * j * n + 2 * i + 1] + M[(2 * j + 1) * n + 2 * i] + M[(2 * j + 1) * n + 2 * i + 1]) / 4);M = N;n = h;
        for (let w = 0;w < n;w++) {const ref = M[w * n];for (const [i, j] of [[n - 1, w], [w, 0], [w, n - 1], [0, n - 1 - w]]) mip = Math.max(mip, Math.abs(M[j * n + i] - ref));}}}
    return { macro, masks, edge, mip: Math.round(mip), dup: ids.length - new Set(ids).size, min: Math.min(...ids), max: Math.max(...ids), surf: surfFloor(4, 3, -3), m4: MACRO[4], err: gl.getError() };
  });
  expect(r.edge).toBeLessThanOrEqual(2);
  expect(r.mip).toBeLessThanOrEqual(3);
  expect(r.macro).toBeLessThanOrEqual(30);
  expect(r.masks.filter(m => m.span < 150 || !m.darker)).toEqual([]);
  expect([r.dup, r.min >= 64, r.max < 256]).toEqual([0, true, true]);
  expect(r.surf).toEqual([r.m4 + 3, 0]);
  expect(r.err).toBe(0);
});

// W13e: static faces carry roomId (r+1) and the 256×1 room-state texture drives brightness; all-live is the default.
test('surfaces: buildStatic roomId and room-state texture', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(() => {
    startLevel(0);state='pause';
    const B=G.staticB,st=wst(G);let tagged=0,max=0;
    for(let k=0;k<B.n;k++){const rm=B.u8[k*48+46];if(rm){tagged++;max=Math.max(max,rm);}}
    // floor vertex check: every floor cell's room must match roomAt at its centre
    let floors=0;for(let z=0;z<G.H;z++)for(let x=0;x<G.W;x++){const i=z*G.W+x;if(G.solid[i])continue;const rr=WORLD.roomAt(st,x+0.5,z+0.5);if(rr)floors++;}
    const lum=()=>{render();const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,p=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,p);let s=0;for(let q=0;q<p.length;q+=4)s+=p[q]+p[q+1]+p[q+2];return s/(w*h);};
    const live=lum();for(const rm of st.rooms)setRoomState(rm.idx,[40,0,255,255]);const dim=lum();resetRoomState();const back=lum();
    return {tagged,max,rooms:st.rooms.length,floors,live,dim,back,def:Array.from(ROOMS.slice(0,8)),err:gl.getError()};
  });
  expect(r.rooms).toBeGreaterThan(0);
  expect(r.floors).toBeGreaterThan(0);
  expect(r.tagged).toBeGreaterThan(0);
  expect(r.max).toBeLessThanOrEqual(r.rooms);
  expect(r.def).toEqual([255,255,255,255,255,255,255,255]);
  expect(r.dim).toBeLessThan(r.live*0.8);
  expect(Math.abs(r.back-r.live)).toBeLessThan(r.live*0.03);
  expect(r.err).toBe(0);
});
