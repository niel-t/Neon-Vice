const { test, expect } = require('./fixtures.cjs');

// Acts 4 and 5 (act45play.js): every stage before the set piece has its own task, and the way on stays shut until it is dealt with.
const tough = page => page.evaluate(() => { G.player.hp = 99; G.player.maxhp = 99; for (const e of G.enemies) e.spd = 0.0001; });
// stand next to (x,z), read the context button, press it
const use = (page, x, z) => page.evaluate(([x, z]) => { const p = G.player; p.x = x; p.z = z; p.vx = p.vz = 0; const a = ctxAction(p), s0 = G.score; playerGrab(p); return { l: a && a.l, paid: G.score - s0 }; }, [x, z]);
const next = page => page.evaluate(() => { const s = G.stageRun.describe(G.sid).stairs[0]; for (const e of G.enemies) if (e.alive) { e.alive = false; e.sunk = true; } enterStage(s.to, s.arrive); return G.sid; });
const state = page => page.evaluate(() => { const s = G.stageRun.describe(G.sid).stairs[0]; return { sid: G.sid, task: G.t45 && G.t45.kind, done: !!(G.t45 && G.t45.done), locked: stageLocked(G, s), goal: stageGoal(G) }; });

test('garage: the attendant runs for the alarm (rung = early vans); P2 escort tyres', async ({ openGame }) => {
  test.setTimeout(120_000);
  const page = await openGame();
  await page.evaluate(() => { NOARRIVE = true; startLevel(11); });
  await tough(page);
  expect(await state(page)).toEqual({ sid: 'p1', task: 'alarm', done: false, locked: true, goal: 'KILL THE ALARM' });
  // shooting starts: he runs, and if nobody stops him the alarm rings
  await page.evaluate(() => { G.shots = 1; G.player.x = 20; G.player.z = 7; for (let k = 0; k < 2; k++) act45Tick(0.05); });
  expect(await page.evaluate(() => ({ st: G.t45.st, path: G.t45.n.path.length > 10 }))).toEqual({ st: 'run', path: true });
  await page.evaluate(() => { G.player.x = 2.5; G.player.z = 7.5; for (let k = 0; k < 600 && G.t45.st === 'run'; k++) act45Tick(0.05); });
  expect(await page.evaluate(() => ({ st: G.t45.st, alarm: A45RUN.alarm, done: G.t45.done }))).toEqual({ st: 'rang', alarm: 1, done: true });
  expect((await state(page)).locked).toBe(false);
  // a fresh run: smash the panel first and get paid
  await page.evaluate(() => { startLevel(11); });
  const P = await page.evaluate(() => [G.t45.panel.x, G.t45.panel.z + 1]);
  expect(await use(page, P[0], P[1])).toEqual({ l: 'SMASH', paid: 1000 });
  expect(await page.evaluate(() => ({ alarm: A45RUN.alarm || 0, st: G.t45.st }))).toEqual({ alarm: 0, st: 'smashed' });
  // P2: three escort cars
  expect(await next(page)).toBe('p2');
  expect(await state(page)).toEqual({ sid: 'p2', task: 'tyres', done: false, locked: true, goal: "SLASH THE ESCORT CARS' TYRES" });
  for (const [x, z] of await page.evaluate(() => G.t45.cars.map(c => [c.x, c.z + 1.1]))) expect(await use(page, x, z)).toEqual({ l: 'SLASH', paid: 400 });
  expect(await state(page)).toMatchObject({ done: true, locked: false });
  // the dock: no alarm, so the vans keep their times
  expect(await next(page)).toBe('dock');
  await page.evaluate(() => act45Tick(0.016));
  expect(await page.evaluate(() => G.vans.map(v => v.go))).toEqual([5, 20, 35]);
});

test('garage: a rung alarm sends the dock vans out early', async ({ openGame }) => {
  const page = await openGame();
  await page.evaluate(() => { NOARRIVE = true; startLevel(11); A45RUN.alarm = 1; G.t45.done = true; G.obj = null; });
  expect(await next(page)).toBe('p2');
  await page.evaluate(() => { G.t45.done = true; G.obj = null; });
  expect(await next(page)).toBe('dock');
  expect(await page.evaluate(() => { act45Tick(0.016); return G.vans.map(v => v.go); })).toEqual([1, 16, 31]);
});

test('airfield: closing the fuel bowser gives the jet 20 more seconds of runway', async ({ openGame }) => {
  const page = await openGame();
  await page.evaluate(() => { NOARRIVE = true; startLevel(13); });
  expect(await state(page)).toEqual({ sid: 'apron', task: 'fuel', done: false, locked: true, goal: 'CLOSE THE FUEL BOWSER' });
  const b = await page.evaluate(() => [G.t45.bowser.x, G.t45.bowser.z + 1.2]);
  expect(await use(page, b[0], b[1])).toEqual({ l: 'CLOSE', paid: 1000 });
  expect(await state(page)).toMatchObject({ done: true, locked: false });
  expect(await page.evaluate(() => A45RUN.fuel)).toBe(1);
  // the hangar and then the jet stage: the clock starts longer
  const crash = await page.evaluate(() => { let s = G.stageRun.describe(G.sid).stairs[0]; enterStage(s.to, s.arrive); const j = G.stageRun.describe('hangar').stairs.find(q => q.to === 'jet'); enterStage(j.to, j.arrive); act45Tick(0.016); return { sid: G.sid, crash: G.jet.crash }; });
  expect(crash).toEqual({ sid: 'jet', crash: 95 });
});

test('hotel lobby: untie the three staff; the last one points to the locker', async ({ openGame }) => {
  const page = await openGame();
  await page.evaluate(() => { NOARRIVE = true; startLevel(14); });
  await tough(page);
  expect(await state(page)).toEqual({ sid: 'lobby', task: 'staff', done: false, locked: true, goal: 'FREE THE STAFF' });
  for (const [x, z] of await page.evaluate(() => G.t45.staff.map(s => [s.n.x + 0.8, s.n.z]))) expect(await use(page, x, z)).toEqual({ l: 'UNTIE', paid: 300 });
  expect(await state(page)).toMatchObject({ done: true, locked: false, goal: 'TAKE THE STAIRS DOWN' });
});

test('ship: the pier radio calls men off the ship until smashed; one container on deck holds the guns, and the casino crew loses theirs', async ({ openGame }) => {
  test.setTimeout(120_000);
  const page = await openGame();
  await page.evaluate(() => { NOARRIVE = true; startLevel(15); });
  await tough(page);
  expect(await state(page)).toEqual({ sid: 'pier', task: 'radio', done: false, locked: true, goal: "SILENCE THE SHIP'S RADIO" });
  const n = await page.evaluate(() => { const n0 = G.enemies.length; G.shots = 1; act45Tick(0.05); for (let k = 0; k < 17; k++) act45Tick(1); return G.enemies.length - n0; });
  expect(n).toBe(2);
  const R = await page.evaluate(() => [G.t45.radio.x - 1.0, G.t45.radio.z]);
  expect(await use(page, R[0], R[1])).toEqual({ l: 'SMASH', paid: 800 });
  expect(await page.evaluate(() => { const n0 = G.enemies.length; for (let k = 0; k < 40; k++) act45Tick(1); return G.enemies.length - n0; })).toBe(0);
  expect(await next(page)).toBe('deck');
  expect(await state(page)).toEqual({ sid: 'deck', task: 'crates', done: false, locked: true, goal: "FIND THE FAMILY'S GUNS" });
  // open the empty ones first, then the guns
  const cs = await page.evaluate(() => G.t45.cs.map(c => ({ x: c.x, z: c.fz, guns: c.guns })).sort((a, b) => a.guns - b.guns));
  for (const c of cs) expect(await use(page, c.x, c.z)).toEqual({ l: 'OPEN', paid: c.guns ? 1000 : 200 });
  expect(await state(page)).toMatchObject({ done: true, locked: false });
  expect(await next(page)).toBe('casino');
  expect(await page.evaluate(() => G.enemies.filter(e => !e.boss && e.weapon && !WD[e.weapon.type].melee).every(e => e.weapon.type === 'pistol'))).toBe(true);
});

test('McWey Tower lobby: men keep coming in the front doors until the building is locked down', async ({ openGame }) => {
  const page = await openGame();
  await page.evaluate(() => { NOARRIVE = true; startLevel(16); });
  await tough(page);
  expect(await state(page)).toEqual({ sid: 'lobby', task: 'lockdown', done: false, locked: true, goal: 'LOCK DOWN THE TOWER' });
  expect(await page.evaluate(() => { const n0 = G.enemies.length; for (let k = 0; k < 19; k++) act45Tick(1); return G.enemies.length - n0; })).toBe(2);
  const D = await page.evaluate(() => [G.t45.desk.x, G.t45.desk.z + 1.0]);
  expect(await use(page, D[0], D[1])).toEqual({ l: 'LOCK', paid: 800 });
  expect(await state(page)).toMatchObject({ done: true, locked: false, goal: 'TAKE THE LIFT UP' });
  expect(await page.evaluate(() => { const n0 = G.enemies.length; for (let k = 0; k < 60; k++) act45Tick(1); return G.enemies.length - n0; })).toBe(0);
});
