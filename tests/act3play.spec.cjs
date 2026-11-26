const { test, expect } = require('./fixtures.cjs');

// Act 3 "Condemned" (act3play.js): the demolition charges run on a clock; the gala is black tie.
test('demolition: the wires are on a clock, and charges still wired go off when it runs out', async ({ openGame }) => {
  const page = await openGame();
  const s = await page.evaluate(() => { startLevel(8); G.player.hp = 99; G.player.maxhp = 99; for (const e of G.enemies) e.spd = 0.0001; act3Tick(0.05); return { t: G.fuse3.t, lbl: G.obj.label }; });
  expect(s.t).toBeGreaterThan(140);
  expect(s.lbl).toMatch(/^CUT THE CHARGE WIRES {2}2:\d\d$/);
  const r = await page.evaluate(() => { G.player.x = 2; G.player.z = 2; G.rigs[0].cut = true; G.obj.n = 1; G.fuse3.t = 0.01; act3Tick(0.05); return { blown: G.rigs.filter(r => r.blown).length, n: G.rigs.length, done: G.obj.done, lbl: G.obj.label }; });
  expect(r).toEqual({ blown: r.n - 1, n: r.n, done: true, lbl: 'THE CHARGES WENT OFF' });
});

test('gala: guards mingle while your gun is away; the ledger taken unseen clears the floor and pays', async ({ openGame }) => {
  const page = await openGame();
  const s = await page.evaluate(() => { startLevel(9); act3Tick(0.05); return { calm: G.gala.calm, hand: G.player.weapon, mingle: G.enemies.every(e => e.boss || (e.mingle && e.bribed)) }; });
  expect(s).toEqual({ calm: true, hand: null, mingle: true });
  const q = await page.evaluate(() => { const p = G.player, sf = G.safe; p.x = sf.x; p.z = sf.z + 1.2; if (blk(G, p.x, p.z)) p.z = sf.z - 1.2; const s0 = G.score; playerGrab(p); act3Tick(0.05); return { done: G.obj.done, quiet: G.gala.quiet, paid: G.score - s0 }; });
  expect(q).toMatchObject({ done: true, quiet: true });
  expect(q.paid).toBe(1500 + 2000);
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
});

test('gala: a gun drawn where a guard can see it, or any shot, sets them all on you', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(() => { startLevel(9); act3Tick(0.05); const e = G.enemies.find(e => !e.boss), p = G.player; p.x = e.x + 1.5; p.z = e.z; if (blk(G, p.x, p.z)) p.x = e.x - 1.5; p.weapon = { type: 'pistol', ammo: 12 }; act3Tick(0.05);
    return { calm: G.gala.calm, hot: G.enemies.every(e => e.boss || (!e.mingle && !e.bribed && e.state === 'chase')) }; });
  expect(r).toEqual({ calm: false, hot: true });
  expect(await page.evaluate(() => { startLevel(9); act3Tick(0.05); G.shots = 1; act3Tick(0.05); return G.gala.calm; })).toBe(false);
});
