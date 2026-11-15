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
  // the club is busy (patrons, guests, security) and one new look is built per frame, so give slow software rendering time to reach the girls
  await page.waitForFunction(() => G.club.dancers.slice(0, 2).every(d => d._pw), null, { timeout: 30000 }).catch(() => {});
  expect(await page.evaluate(() => G.club.dancers.slice(0, 2).every(d => d._pw && d._pw.length === 17))).toBe(true);
});

// the pole dancer at home runs the Velvet Palms routines (incl. the lambada) on her own little stage, turned to you, and can be slapped
test('home pole dancer: stage routines on her platform, facing you', async ({ openGame }) => {
  const page = await openGame();
  const o = await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.homes = [0, 1, 2]; p.home = 2; p.furn = { 2: { pole: 1 } }; fadeTo = f => { f(); return true; };
    loadHub('home2', 'home'); if (G.seq) seqSkip();
    const d = G.dancer, moves = new Set(); let far = 0;
    const q = G.slots.p; G.player.x = q.x + 2.5; G.player.z = q.z + 1;
    for (let i = 0; i < 60 * 40; i++) { homeTick(1 / 60); moves.add(d.move); far = Math.max(far, Math.hypot(d.x - q.x, d.z - q.z)); }
    d.move = 'sway'; d.mt = 1; d.md = 99; for (let i = 0; i < 120; i++) homeTick(1 / 60);
    const face = Math.cos(angDiff(d.a, Math.atan2(G.player.x - d.x, G.player.z - d.z)));
    G.player.x = d.x + 0.8; G.player.z = d.z + 0.8; slapTick(1 / 60);
    return { pole: !!d.pole, moves: moves.size, far, y: d.y, face, slap: G.slapN === d };
  });
  expect(o.pole).toBe(true);
  expect(o.moves).toBeGreaterThanOrEqual(4);
  expect(o.far).toBeLessThan(0.6);
  expect(o.y).toBeLessThan(0.3);
  expect(o.face).toBeGreaterThan(0.4);
  expect(o.slap).toBe(true);
});
