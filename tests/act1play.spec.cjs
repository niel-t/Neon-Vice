const { test, expect } = require('./fixtures.cjs');

// Act 1 "The Street" (act1play.js): burn the product and make the cook talk, catch Rico before the books burn, Moreau's panic room.
const tough = page => page.evaluate(() => { G.player.hp = 99; G.player.maxhp = 99; for (const e of G.enemies) e.spd = 0.0001; });
const at = (page, x, z) => page.evaluate(([x, z]) => { G.player.x = x; G.player.z = z; G.player.vx = G.player.vz = 0; }, [x, z]);
const tick = (page, n = 1, dt = 0.05) => page.evaluate(([n, dt]) => { for (let k = 0; k < n; k++) act1Tick(dt); }, [n, dt]);

test('motel: three tables of product to burn (the objective), and the cook talks when caught', async ({ openGame }) => {
  const page = await openGame();
  const s = await page.evaluate(() => { startLevel(0); return { obj: G.obj.label, total: G.obj.total, tables: G.prod.map(q => G.rows[q.iz][q.ix]), cook: G.cook.st }; });
  expect(s).toEqual({ obj: 'BURN THE PRODUCT', total: 3, tables: ['T', 'T', 'T'], cook: 'hide' });
  await tough(page);
  for (let k = 0; k < 3; k++) {
    const r = await page.evaluate(k => { const q = G.prod[k], p = G.player; p.x = q.x; p.z = q.z + 1.0; const lbl = ctxAction(p).l, s0 = G.score; playerGrab(p); return { lbl, burnt: q.burnt, paid: G.score - s0 }; }, k);
    expect(r).toEqual({ lbl: 'BURN', burnt: true, paid: 400 });
  }
  expect(await page.evaluate(() => G.obj.done)).toBe(true);
  // the cook: walk up to him, then TALK
  await page.evaluate(() => { const n = G.cook.n; G.player.x = n.x + 0.6; G.player.z = n.z; });
  await tick(page);
  const c = await page.evaluate(() => { const p = G.player, lbl = ctxAction(p).l, s0 = G.score; playerGrab(p); return { st0: lbl, st: G.cook.st, paid: G.score - s0 }; });
  expect(c).toEqual({ st0: 'TALK', st: 'talked', paid: 750 });
  // the floor clears with the objective done
  await page.evaluate(() => { for (const e of G.enemies) if (e.alive) killEnemy(e, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
});

test('club: Rico runs for the books once shooting starts; catch him in time for the bonus, else the books burn', async ({ openGame }) => {
  const page = await openGame();
  await page.evaluate(() => { LEXMET = true; startLevel(1); G.cameo = null; });
  await tough(page);
  expect(await page.evaluate(() => ({ st: G.rico.st, obj: G.obj.label }))).toEqual({ st: 'idle', obj: 'CATCH RICO BEFORE HE BURNS THE BOOKS' });
  await page.evaluate(() => { G.shots = 1; });
  await tick(page);
  expect(await page.evaluate(() => ({ st: G.rico.st, path: G.rico.n.path.length > 5 }))).toEqual({ st: 'run', path: true });
  // he gets there and burns them if nobody stops him
  await tick(page, 400, 0.05);
  expect(await page.evaluate(() => G.rico.st)).toBe('burn');
  await tick(page, 200, 0.05);
  expect(await page.evaluate(() => ({ ash: G.books.ash, st: G.rico.st, obj: G.obj.label }))).toEqual({ ash: true, st: 'cower', obj: 'MAKE RICO TALK' });
  await page.evaluate(() => { const n = G.rico.n; G.player.x = n.x + 0.5; G.player.z = n.z; });
  const r = await page.evaluate(() => { const s0 = G.score; act1Tick(0.05); const caught = G.score - s0, lbl = ctxAction(G.player).l; playerGrab(G.player); return { caught, lbl, st: G.rico.st, done: G.obj.done }; });
  expect(r).toEqual({ caught: 0, lbl: 'TALK', st: 'talked', done: true });
  // a fresh run: caught on the way, the books are saved and pay
  const s = await page.evaluate(() => { startLevel(1); G.cameo = null; G.shots = 1; act1Tick(0.05); for (let k = 0; k < 20; k++) act1Tick(0.05); const n = G.rico.n, s0 = G.score; G.player.x = n.x; G.player.z = n.z; act1Tick(0.05); return { st: G.rico.st, saved: G.rico.saved, paid: G.score - s0 }; });
  expect(s).toEqual({ st: 'caught', saved: true, paid: 1500 });
});

test('penthouse: Moreau runs for the panic room at half health, shutters come down, the breaker lifts them', async ({ openGame }) => {
  test.setTimeout(120_000);
  const page = await openGame();
  await page.evaluate(() => { startLevel(2); });
  await page.waitForFunction(() => G && G.sid === 'lobby' && state === 'play');
  await page.evaluate(() => { const s = G.stageRun.describe('lobby').stairs.find(q => q.id === 'elev'); G.keycard = 1; G.player.x = s.at[0]; G.player.z = s.at[1]; });
  await page.waitForFunction(() => G.sid === 'pent' && !G.going && !G.climb && !G.climbIn && state === 'play', null, { timeout: 60_000 });
  await tough(page);
  const p = await page.evaluate(() => ({ panic: G.panic && G.panic.st, doors: G.panic.cells.map(c => G.rows[c.iz][c.ix]), boss: !!G.boss }));
  expect(p).toEqual({ panic: 'open', doors: ['D', 'D'], boss: true });
  // knock him to half and walk him into the room
  await page.evaluate(() => { const b = G.boss; b.hp = Math.floor(b.maxhp / 2); G.player.x = 4; G.player.z = 10; act1Tick(0.05); });
  expect(await page.evaluate(() => G.panic.st)).toBe('run');
  await page.evaluate(() => { const b = G.boss; b.x = G.panic.to.x; b.z = G.panic.to.z; act1Tick(0.05); });
  const s = await page.evaluate(() => ({ st: G.panic.st, solid: G.panic.cells.map(c => G.solid[c.iz * G.W + c.ix]), goal: stageGoal(G) }));
  expect(s).toEqual({ st: 'shut', solid: [1, 1], goal: 'CUT THE POWER AT THE BREAKER' });
  const b = await page.evaluate(() => { const q = G.panic.breaker; G.player.x = q.x + 1.0; G.player.z = q.z; const lbl = ctxAction(G.player).l; playerGrab(G.player); return { lbl, st: G.panic.st, solid: G.panic.cells.map(c => G.solid[c.iz * G.W + c.ix]) }; });
  expect(b).toEqual({ lbl: 'CUT', st: 'dark', solid: [0, 0] });
});
