const { test, expect } = require('./fixtures.cjs');

// McWey's office (mcoffice.js): his secretary does something different every visit, McWey acts while he talks,
// and the briefing opens from the carpet in front of his desk or from USE / a tap on him.
const toOffice = async page => {
  await page.locator('#bStart').click();
  await page.locator('#bPlay').click();
  await expect.poll(() => page.evaluate(() => state === 'play' && !!G.cine && !fading)).toBe(true);
  await page.evaluate(() => { const p = myProg(); p.seen = p.seen || {}; p.seen.loan = 1; saveProg(); VISIT = { debrief: 0, next: 1, grade: 'B', take: 100, style: 'mixed' }; NEXTJOB = 0; HUBFIRST = false; });
};

test('mcoffice: the secretary is at the desk, the counting table or on his lap, never the same twice running', async ({ openGame }) => {
  const page = await openGame();
  await toOffice(page);
  const modes = await page.evaluate(() => {
    const out = [];
    for (let i = 0; i < 12; i++) {
      loadHub('office');
      const s = G.npcs.find(n => n.kind === 'secretary'), m = G.npcs.find(n => n.kind === 'mcwey');
      out.push({ mode: G.secMode, set: s.gset, mc: m.gset, seat: !!s.seatK, solid: G.solids.includes(SEC_TABLE), d: Math.hypot(s.x - m.x, s.z - m.z) });
    }
    return out;
  });
  for (let i = 1; i < modes.length; i++) expect(modes[i].mode).not.toBe(modes[i - 1].mode);
  expect(new Set(modes.map(m => m.mode))).toEqual(new Set(['desk', 'count', 'lap']));
  for (const m of modes) {
    expect(m.set).toBe(m.mode);
    expect(m.mc).toBe(m.mode === 'lap' ? 'mclap' : 'mc');
    expect(m.solid).toBe(true); // the counting table always stands in the loot room
    if (m.mode === 'lap') expect(m.d).toBeLessThan(0.5); else expect(m.d).toBeGreaterThan(3);
    expect(m.seat).toBe(m.mode !== 'count');
  }
});

test('mcoffice: McWey and the secretary act, she greets you, and USE at the desk opens the briefing', async ({ openGame }) => {
  const page = await openGame();
  await toOffice(page);
  await page.evaluate(() => { window.SECMODE = 'count'; loadHub('office'); G.player.x = 25.5; G.player.z = 8.8; });
  // models build in the background; once they are drawn McWey and the secretary each run a gesture
  await expect.poll(() => page.evaluate(() => { const m = G.npcs.find(n => n.kind === 'mcwey'), s = G.sec; return !!(m._gs && s._gs) && [m._gs.set, s._gs.set]; }), { timeout: 40_000 }).toEqual(['mc', 'count']);
  await expect.poll(() => page.evaluate(() => G.secHello)).toBe(true);
  expect(await page.evaluate(() => G.popups.some(p => /count|bar/i.test(p.txt || '')))).toBe(true);
  // the gestures move on: over a few seconds McWey changes what he is doing
  const seen = await page.evaluate(async () => { const m = G.npcs.find(n => n.kind === 'mcwey'), s = new Set(); for (let i = 0; i < 40; i++) { s.add(m._gs.cur); await new Promise(r => setTimeout(r, 300)); } return [...s]; });
  expect(seen.length).toBeGreaterThan(1);
  // standing in front of his desk: USE (E / the touch USE button) sits you down with him
  await page.evaluate(() => { G.player.x = 16.4; G.player.z = 7.6; });
  await expect.poll(() => page.evaluate(() => G.ia && G.ia.k)).toBe('mcwey');
  await page.keyboard.press('e');
  await expect.poll(() => page.evaluate(() => state)).toBe('brief');
});

test('mcoffice: on his lap she stays there for the briefing close-up, and walking to the desk still opens it', async ({ openGame }) => {
  const page = await openGame();
  await toOffice(page);
  await page.evaluate(() => { window.SECMODE = 'lap'; loadHub('office'); G.player.x = 16; G.player.z = 10.5; });
  await page.keyboard.down('w');
  try { await expect.poll(() => page.evaluate(() => state), { timeout: 20_000 }).toBe('brief'); }
  finally { await page.keyboard.up('w'); }
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => ({ set: salChar.gset, mode: G.secMode, pos: (({ x, z }) => [x, z])(G.sec) }))).toMatchObject({ set: 'mclap', mode: 'lap' });
});

test('mcoffice: each room has its own floor and walls, and the floor has people on it', async ({ openGame }) => {
  const page = await openGame();
  await toOffice(page);
  const r = await page.evaluate(() => {
    loadHub('office');
    const g = G, at = (X, Z) => g.floorF(X + 1, Z + 1);
    // a wall face takes the room it faces: the wall between reception and McWey's office (map 12,9)
    const i = (9 + 1) * g.W + 12 + 1;
    return { rec: at(16, 14), office: at(15, 4), chill: at(4, 4), loot: at(25, 4), toRec: g.wallF(13, 10, 0, 1, i), toOffice: g.wallF(13, 10, 0, -1, i),
      vips: g.npcs.filter(n => n.kind === 'vip').length, guard: g.npcs.some(n => n.kind === 'guard' && n.x > 20 && n.z < 6), strolls: g.npcs.some(n => n.stroll) };
  });
  expect(r).toEqual({ rec: 232, office: 230, chill: 231, loot: 233, toRec: 237, toOffice: 234, vips: 3, guard: true, strolls: true });
});
