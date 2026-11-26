const { test, expect } = require('./fixtures.cjs');

// Act 2 "Silks" (act2play.js): unplug the Starlight's money counters; the mall night off is an ambush.
test('arcade: three money counters to unplug are the objective', async ({ openGame }) => {
  const page = await openGame();
  const s = await page.evaluate(() => { startLevel(4); G.player.hp = 99; for (const e of G.enemies) e.spd = 0.0001; return { obj: G.obj.label, total: G.obj.total, solid: G.counters.every(c => G.solid[c.iz * G.W + c.ix] === 1) }; });
  expect(s).toEqual({ obj: 'UNPLUG THE MONEY COUNTERS', total: 3, solid: true });
  for (let k = 0; k < 3; k++) {
    const r = await page.evaluate(k => { const c = G.counters[k], p = G.player; const spots = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dz]) => [c.x + dx, c.z + dz]).filter(([x, z]) => !blk(G, x, z)); p.x = spots[0][0]; p.z = spots[0][1];
      const lbl = ctxAction(p).l, s0 = G.score; playerGrab(p); return { lbl, off: c.off, paid: G.score - s0, reach: spots.length > 0 }; }, k);
    expect(r).toEqual({ lbl: 'UNPLUG', off: true, paid: 500, reach: true });
  }
  expect(await page.evaluate(() => G.obj.done)).toBe(true);
});

test('mall: Lex\'s men pose as shoppers until the set-up is sprung, then two crews come in the front doors', async ({ openGame }) => {
  const page = await openGame();
  const s = await page.evaluate(() => { startLevel(5); G.player.hp = 99; const u = G.enemies.filter(e => e.undercover); return { n: u.length, all: G.enemies.length, bribed: u.every(e => e.bribed), obj: G.obj.label, st: G.ambush2.st }; });
  expect(s.n).toBe(s.all);
  expect(s).toMatchObject({ bribed: true, obj: 'SURVIVE THE AMBUSH', st: 'calm' });
  // firing springs it
  const r = await page.evaluate(() => { G.shots = 1; act2Tick(0.05); return { st: G.ambush2.st, live: G.enemies.filter(e => e.undercover || e.bribed).length, chase: G.enemies.every(e => e.state === 'chase') }; });
  expect(r).toEqual({ st: 'hot', live: 0, chase: true });
  const n0 = await page.evaluate(() => G.enemies.length);
  const w = await page.evaluate(() => { for (let k = 0; k < 500; k++) act2Tick(0.05); return { len: G.enemies.length, wave: G.ambush2.wave, done: G.obj.done }; });
  expect(w).toEqual({ len: n0 + 6, wave: 2, done: true });
  await page.evaluate(() => { for (const e of G.enemies) if (e.alive) killEnemy(e, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
});

test('mall: left alone, the set-up springs by itself after a few seconds', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => { startLevel(5); for (let k = 0; k < 160; k++) act2Tick(0.05); return G.ambush2.st; })).toBe('hot');
});

test('royal flush: the helm only takes once Lex is down, and the floor waits for it', async ({ openGame }) => {
  const page = await openGame();
  const s = await page.evaluate(() => { NOARRIVE = true; startLevel(7); const h = G.helm, p = G.player; p.hp = 99; p.maxhp = 99; for (const e of G.enemies) e.spd = 0.0001; p.x = h.x - 1; p.z = h.z; if (blk(G, p.x, p.z)) p.x = h.x + 1; return { obj: G.obj.label, act: act2Action(p) }; });
  expect(s).toEqual({ obj: 'TAKE THE HELM', act: null });
  await page.evaluate(() => { for (const e of G.enemies) if (e.alive && !e.boss) killEnemy(e, 'pistol', [0, 1]); G.boss.spared = true; G.boss.state = 'idle'; G.boss.bribed = 1; });
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => G.cleared)).toBe(false);
  const r = await page.evaluate(() => { const p = G.player, lbl = ctxAction(p).l, s0 = G.score; playerGrab(p); return { lbl, taken: G.helm.taken, paid: G.score - s0 }; });
  expect(r).toEqual({ lbl: 'HELM', taken: true, paid: 2500 });
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
});
