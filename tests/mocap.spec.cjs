const { test, expect } = require('./fixtures.cjs');

// Motion capture (CMU, retargeted): the girls walk and stand with the mocap clips and the lambada is a stage and home dance;
// every clip decodes into unit quaternions with the feet near the floor, and the loops join without a jump.
test('mocap: clips decode, loop cleanly, and play on dancers and home girls', async ({ openGame }) => {
  const page = await openGame();
  const o = await page.evaluate(() => {
    const r = { clips: {} };
    for (const k of ['walk', 'walk2', 'idle', 'idle2', 'lambada']) {
      const C = PS2C.mocapClip(k), F = C.F; let unit = true, maxRoot = 0, seam = 0;
      for (let i = 0; i < C.n; i++) {
        for (let j = 0; j < 17; j++) { const p = i * F + 3 + j * 4, l = Math.hypot(C.A[p], C.A[p + 1], C.A[p + 2], C.A[p + 3]); if (Math.abs(l - 1) > 0.05) unit = false; }
        maxRoot = Math.max(maxRoot, Math.abs(C.A[i * F + 1]));
      }
      for (let j = 0; j < 17; j++) { const a = (C.n - 1) * F + 3 + j * 4, b = 3 + j * 4; seam = Math.max(seam, 1 - Math.abs(C.A[a] * C.A[b] + C.A[a + 1] * C.A[b + 1] + C.A[a + 2] * C.A[b + 2] + C.A[a + 3] * C.A[b + 3])); }
      r.clips[k] = { n: C.n > 20, unit, root: maxRoot < 0.2, seam: seam < 0.02, stride: k.startsWith('walk') ? C.stride > 0.8 : true };
    }
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); arm(); fadeTo = f => { f(); return true; };
    loadHub('club'); if (G.seq) seqSkip();
    r.moves = CLUB_MOVES.includes('lambada');
    return r;
  });
  for (const k in o.clips) expect(o.clips[k], k).toEqual({ n: true, unit: true, root: true, seam: true, stride: true });
  expect(o.moves).toBe(true);
  // a stage girl doing the lambada and a girl walking render with the mocap pose
  await page.evaluate(() => { const d = G.club.dancers[0]; d.move = 'lambada'; d.mt = 2; d.md = 99; const e = G.club.dancers[1]; e.move = 'strut'; e.mt = 2; e.md = 99; });
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => G.club.dancers.slice(0, 2).every(d => d._pw && d._pw.length === 17))).toBe(true);
});
