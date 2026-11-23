const { test, expect } = require('./fixtures.cjs');

// Locomotion ported from Spice Master Eddy (models.js gaitStep + the m* clips in mocap.js): the player and the guards walk, jog,
// run and stand with motion capture, the gait phase follows the distance actually covered, and walking backwards plays in reverse.
test('gait: Spice Master clips decode, loop and ground the feet', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(() => {
    const out = {};
    for (const k of ['mwalk', 'mwalkH', 'mjog', 'mrun', 'midle']) {
      const C = PS2C.mocapClip(k), F = C.F; let unit = true, root = 0, seam = 0;
      for (let i = 0; i < C.n; i++) {
        for (let j = 0; j < 17; j++) { const p = i * F + 3 + j * 4; if (Math.abs(Math.hypot(C.A[p], C.A[p + 1], C.A[p + 2], C.A[p + 3]) - 1) > 0.05) unit = false; }
        root = Math.max(root, Math.abs(C.A[i * F + 1]));
      }
      for (let j = 0; j < 17; j++) { const a = (C.n - 1) * F + 3 + j * 4, b = 3 + j * 4; seam = Math.max(seam, 1 - Math.abs(C.A[a] * C.A[b] + C.A[a + 1] * C.A[b + 1] + C.A[a + 2] * C.A[b + 2] + C.A[a + 3] * C.A[b + 3])); }
      out[k] = { unit, root: root < 0.2, seam: seam < 0.03, speed: k === 'midle' ? C.speed === 0 : C.speed > 0.5 };
    }
    // the blend: standing is idle, a brisk pace walks, the player's pace jogs, a sprint runs
    const c = { a: 0 }, w = v => { for (let i = 0; i < 90; i++) PS2C.gaitStep(c, v, 1 / 30, 0, false, false); const g = c._gt.w; return Object.keys(g).reduce((b, k) => g[k] > g[b] ? k : b, 'idle'); };
    out.ladder = [w(0), w(2), w(4.5), w(8)];
    // the phase moves by distance: twice the speed covers the same stride in half the time (within the stretch limit)
    const ph = (v, back) => { const d = { a: 0 }; for (let i = 0; i < 60; i++) PS2C.gaitStep(d, v, 1 / 60, 0, false, back); const p0 = d._gt.ph; PS2C.gaitStep(d, v, 1 / 60, 0, false, back); return ((d._gt.ph - p0) % 1 + 1.5) % 1 - 0.5; };
    out.fwd = ph(3.5, false) > 0; out.back = ph(3.5, true) < 0;
    return out;
  });
  for (const k of ['mwalk', 'mwalkH', 'mjog', 'mrun', 'midle']) expect(r[k], k).toEqual({ unit: true, root: true, seam: true, speed: true });
  expect(r.ladder).toEqual(['idle', 'walk', 'jog', 'run']);
  expect(r.fwd).toBe(true);
  expect(r.back).toBe(true);
});

test('gait: the player jogs on keys and on the touch stick, and stands still with the idle clip', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(async () => {
    const wait = ms => new Promise(res => setTimeout(res, ms));
    window.NOARRIVE = 1; startMission('c3'); if (G.arrive) endArrive(); G.cameo = null; G.lex = null; await wait(400);
    for (const e of G.enemies) { e.blind = true; e.state = 'idle'; } SET.cheat = true;
    const p = G.player, top = () => { const w = p._gt && p._gt.w; return w ? Object.keys(w).reduce((b, k) => w[k] > w[b] ? k : b, 'idle') : null; };
    await wait(800); const still = top();
    const x0 = p.x, z0 = p.z; keys.KeyD = true; await wait(900); const moved = Math.hypot(p.x - x0, p.z - z0), keysTop = top(), ph = p._gt && p._gt.ph; keys.KeyD = false; await wait(1200); const stop = top();
    // touch: the left stick dragged right moves the player the same way
    touchMode = true; sticks.L = { id: 1, ox: 100, oy: 100, x: 155, y: 100 }; await wait(900); const touchTop = top(); sticks.L = null; touchMode = false;
    return { moved: moved > 1, still, keysTop, stop, touchTop, phase: typeof ph === 'number' };
  });
  expect(r.moved).toBe(true);
  expect(r.phase).toBe(true);
  expect(r.still).toBe('idle');
  expect(['jog', 'run']).toContain(r.keysTop);
  expect(r.stop).toBe('idle');
  expect(['walk', 'jog', 'run']).toContain(r.touchTop);
});
