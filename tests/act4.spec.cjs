const { test, expect } = require('./fixtures.cjs');

// Act 4 "Wheels Up" (floors 12 to 14, indexes 11 to 13, act4.js): the garage vans, the Coral Room pilot, and Vale's jet.
const go = (page, sid) => page.waitForFunction(sid => G && G.def && G.sid === sid && !G.going && !G.climb && !G.climbIn && state === 'play', sid, { timeout: 60_000 });
const toStairs = (page, id) => page.evaluate(id => { const s = G.stageRun.describe(G.sid).stairs.find(q => q.id === id); G.player.x = s.at[0]; G.player.z = s.at[1]; }, id);

test('act 4 opens after Kade: the floor index, labels, briefs and the old-save unlock', async ({ openGame }) => {
  const page = await openGame({ nb86jobs: { top: 10, sel: 10, best: { 10: { g: 'A', t: 100, s: 1000, c: 3, ch: 'don', d: 'normal' } } } });
  expect(await page.evaluate(() => ({ len: CAMPAIGN_LEN, top: JOBS.top, act: LEVELS.slice(11).map(l => l.act), brief: BRIEF_FLOOR(11), last: BRIEF_FLOOR(13), dlg: ['brief11', 'brief12', 'brief13'].every(k => DLG[k]), quote: MC_QUOTE.length, ch: CHALLENGES.length, par: PAR.length, stash: STASH.length })))
    .toEqual({ len: 14, top: 11, act: [4, 4, 4], brief: 'ACT 4 · FLOOR 1 / 3 — VALE TRUST GARAGE', last: 'ACT 4 · FLOOR 3 / 3 — OPA-LOCKA HANGAR 7', dlg: true, quote: 15, ch: 14, par: 14, stash: 14 });
});

test('act 4 floor 1: down the garage ramps, then the barrier and a dead driver each stop a gold van and the third gets away', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  expect(await page.evaluate(() => { NOARRIVE = true; startLevel(11); return { sid: G.sid, act: LEVELS[11].act }; })).toEqual({ sid: 'p1', act: 4 });
  await toStairs(page, 'ramp');
  await go(page, 'p2');
  await page.evaluate(() => { G.player.hp = 99; for (const e of G.enemies) e.spd = 0.0001; });
  await toStairs(page, 'ramp');
  await go(page, 'dock');
  const s = await page.evaluate(() => ({ vans: G.vans.length, obj: G.obj.label, drivers: G.vans.every(v => v.e.alive && v.e.driver === v), exit: G.def.exit }));
  expect(s).toEqual({ vans: 3, obj: 'STOP THE GOLD VANS', drivers: true, exit: 'Take the freight lift up' });
  await page.evaluate(() => { G.player.hp = 99; G.player.maxhp = 99; for (const e of G.enemies) if (!e.driver) e.spd = 0.0001; });
  // Van 1: the barrier. Start it, drop the boom from the lever while it is on the lane.
  // (Put it on the lane short of the boom, so a slow CI machine doesn't race the boom's 7 seconds.)
  await page.evaluate(() => { G.vanT = G.vans[0].go; });
  await expect.poll(() => page.evaluate(() => G.vans[0].st), { timeout: 30_000 }).toBe('go');
  const ctx = await page.evaluate(() => { const v = G.vans[0]; v.z = G.lane.z; v.x = G.boom.x - 8; v.sp = 2.3; const p = G.player; p.x = G.lever.x; p.z = G.lever.z + 0.6; const l = ctxAction(p).l; playerGrab(p); return { l, down: G.boom.down > 0 }; });
  expect(ctx).toEqual({ l: 'BARRIER', down: true });
  await expect.poll(() => page.evaluate(() => G.vans[0].st), { timeout: 30_000 }).toBe('stopped');
  expect(await page.evaluate(() => ({ why: G.vans[0].why, driverOut: G.vans[0].e.driver === null }))).toEqual({ why: 'boom', driverOut: true });
  // Van 2: shoot the driver; the van coasts to a stop.
  await page.evaluate(() => { const v = G.vans[1]; G.vanT = Math.max(G.vanT, v.go); });
  await expect.poll(() => page.evaluate(() => G.vans[1].st), { timeout: 20_000 }).toBe('go');
  await page.evaluate(() => killEnemy(G.vans[1].e, 'pistol', [0, 1]));
  await expect.poll(() => page.evaluate(() => G.vans[1].st), { timeout: 20_000 }).toBe('stopped');
  // Van 3 gets away: it costs money and the floor still finishes.
  await page.evaluate(() => { G.boom.down = 0; G.boom.cd = 0; G.score = 5000; G.vanT = Math.max(G.vanT, G.vans[2].go); G.vans[2].z = G.lane.z; G.vans[2].x = G.lane.exit - 1; });
  await expect.poll(() => page.evaluate(() => G.vans[2].st), { timeout: 20_000 }).toBe('gone');
  expect(await page.evaluate(() => ({ done: G.obj.done, n: G.obj.n, score: G.score, all: CHALLENGES[11][0].f(G) }))).toEqual({ done: true, n: 3, score: 3500, all: false });
  await page.evaluate(() => { for (const e of G.enemies) if (e.alive) killEnemy(e, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
  await page.evaluate(() => { G.player.x = G.car.x; G.player.z = G.car.z; });
  await expect.poll(() => page.evaluate(() => state === 'perk' ? 'results' : state), { timeout: 30_000 }).toBe('results');
});

test('act 4 floor 2: the pilot runs when he sees you; catching him gives the pass, and Frankie Lo Presti takes six hits', async ({ openGame }) => {
  test.setTimeout(180_000);
  const page = await openGame();
  const s = await page.evaluate(() => { NOARRIVE = true; startLevel(12); return { obj: G.obj.label, pilot: G.pilot.st, frankie: G.frankie.hp, chefs: G.enemies.filter(e => e.chef).length, crowd: !!G.crowd }; });
  expect(s).toMatchObject({ obj: 'GET THE HANGAR PASS', pilot: 'sit', frankie: 6 });
  expect(s.chefs).toBeGreaterThan(0);
  await page.evaluate(() => { G.player.hp = 99; for (const e of G.enemies) e.spd = 0.0001; const n = G.pilot.n; G.player.x = n.x - 3; G.player.z = n.z; });
  await expect.poll(() => page.evaluate(() => G.pilot.st), { timeout: 20_000 }).toBe('run');
  await page.evaluate(() => { const n = G.pilot.n; G.player.x = n.x; G.player.z = n.z; });
  await expect.poll(() => page.evaluate(() => ({ st: G.pilot.st, done: G.obj.done, ch: CHALLENGES[12][0].f(G) })), { timeout: 20_000 }).toEqual({ st: 'caught', done: true, ch: true });
  // Frankie: a pistol round only wounds him; at half health he calls two men in.
  const before = await page.evaluate(() => G.enemies.length);
  await page.evaluate(() => { const f = G.frankie; for (let k = 0; k < 3; k++) hitEnemy(f, 'pistol', [0, 1], 1); });
  await expect.poll(() => page.evaluate(() => ({ alive: G.frankie.alive, help: G.frankieHelp })), { timeout: 20_000 }).toEqual({ alive: true, help: 1 });
  expect(await page.evaluate(() => G.enemies.length)).toBe(before + 2);
  await page.evaluate(() => { for (const e of G.enemies) if (e.alive) killEnemy(e, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
});

test('act 4 floor 2: if the pilot reaches his boat, his locker by the dock has the pass', async ({ openGame }) => {
  test.setTimeout(120_000);
  const page = await openGame();
  await page.evaluate(() => { NOARRIVE = true; startLevel(12); G.player.hp = 99; for (const e of G.enemies) e.spd = 0.0001; G.pilot.st = 'run'; G.pilot.n.path = []; });
  await expect.poll(() => page.evaluate(() => ({ st: G.pilot.st, obj: G.obj.label })), { timeout: 20_000 }).toEqual({ st: 'gone', obj: "OPEN THE PILOT'S LOCKER" });
  const r = await page.evaluate(() => { const p = G.player, L = G.locker; p.x = L.x - 1.2; p.z = L.z; const l = ctxAction(p).l; playerGrab(p); return { l, done: G.obj.done, open: L.open }; });
  expect(r).toEqual({ l: 'OPEN', done: true, open: true });
});

test('act 4 floor 3: Vale walks to his jet, the stairs open when he is aboard, he is finished on the runway and the jet goes up as a clean accident', async ({ openGame }) => {
  test.setTimeout(300_000);
  const page = await openGame();
  expect(await page.evaluate(() => { NOARRIVE = true; startLevel(13); return G.sid; })).toBe('apron');
  await page.evaluate(() => { G.player.hp = 99; });
  await toStairs(page, 'door');
  await go(page, 'hangar');
  // The boarding stairs stay up until Vale is aboard.
  expect(await page.evaluate(() => { const s = G.stageRun.describe(G.sid).stairs.find(q => q.id === 'board'); return { locked: stageLocked(G, s), walking: !!G.valeW && !G.valeW.aboard }; })).toEqual({ locked: true, walking: true });
  await page.evaluate(() => { G.player.hp = 99; for (const e of G.enemies) e.spd = 0.0001; G.valeW.t = 0; const n = G.valeW.n; if (n.path && n.path.length > 2) n.path = n.path.slice(-2); });
  // (His walk is cut to the last stretch so a slow CI machine still gets him aboard in time.)
  await expect.poll(() => page.evaluate(() => G.valeW.aboard), { timeout: 90_000 }).toBe(true);
  await toStairs(page, 'board');
  await go(page, 'jet');
  const j = await page.evaluate(() => ({ boss: G.boss && G.boss.vale, obj: G.obj.label, valve: !!G.jet.valve, car: !G.def.noCar, sealed: !!G.solid[G.jet.door.iz * G.W + G.jet.door.ix], lift: liftAt(G.player.x, G.player.z) }));
  expect(j).toEqual({ boss: true, obj: "TAKE OUT VALE'S BODYGUARDS", valve: true, car: true, sealed: true, lift: 0.8 });
  await page.evaluate(() => { G.player.hp = 99; G.player.maxhp = 99; for (const e of G.enemies) e.spd = 0.0001; });
  // The valve does nothing yet; the bodyguards go down and the jet starts its take-off run with the door shut.
  expect(await page.evaluate(() => { const p = G.player, v = G.jet.valve; p.x = v.x + 1.1; p.z = v.z; playerGrab(p); return G.jet.fuse; })).toBe(0);
  await page.evaluate(() => { for (const e of G.enemies) if (e.alive && !e.boss) killEnemy(e, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => G.jet.ph), { timeout: 20_000 }).toBe('roll');
  expect(await page.evaluate(() => G.obj.label.startsWith('HACK THE COCKPIT DOOR'))).toBe(true);
  // The hack: CTX at the door's panel, then hold position until it opens.
  const h = await page.evaluate(() => { const p = G.player, D = G.jet.door; p.x = D.x - 1.0; p.z = D.z; const l = ctxAction(p).l; playerGrab(p); G.jet.hack = 0.9; return { l, hacking: G.jet.hacking }; });
  expect(h).toEqual({ l: 'HACK', hacking: 1 });
  await expect.poll(() => page.evaluate(() => G.jet.ph), { timeout: 30_000 }).toBe('vale');
  expect(await page.evaluate(() => G.solid[G.jet.door.iz * G.W + G.jet.door.ix])).toBe(0);
  // Vale goes down and begs; finished bare-handed it counts as by hand, and the finisher plays.
  await page.evaluate(() => { killEnemy(G.boss, 'pistol', [0, 1]); });
  expect(await page.evaluate(() => !!G.mercy && G.boss.alive)).toBe(true);
  await page.evaluate(() => { G.player.weapon = null; G.mercy.t = 2; keys.Digit2 = true; });
  await expect.poll(() => page.evaluate(() => !G.mercy && !G.boss.alive), { timeout: 20_000 }).toBe(true);
  await page.evaluate(() => { keys.Digit2 = false; while (G.fin) { G.fin.t = 2; pressed.grab = true; updateFin(0.01); pressed.grab = false; } });
  await expect.poll(() => page.evaluate(() => G.jet.ph), { timeout: 20_000 }).toBe('stop');
  expect(await page.evaluate(() => G.valeShot)).toBe(false);
  // The throttles stop the jet; the airstairs come back down.
  const st = await page.evaluate(() => { G.items = []; const p = G.player, t = G.jet.thr; p.x = t.x - 0.8; p.z = t.z; const l = ctxAction(p).l; playerGrab(p); return { l, stopped: G.jet.stopped }; });
  expect(st).toEqual({ l: 'BRAKES', stopped: 1 });
  const v = await page.evaluate(() => { const p = G.player, v = G.jet.valve; p.x = v.x + 1.1; p.z = v.z; const l = ctxAction(p).l; playerGrab(p); return { l, fuse: G.jet.fuse > 0, done: G.obj.done }; });
  expect(v).toEqual({ l: 'VALVE', fuse: true, done: true });
  // Not done until the jet blows: standing at the car early does not finish the floor.
  await page.evaluate(() => { G.player.x = G.car.x; G.player.z = G.car.z; });
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 30_000 }).toBe(true);
  expect(await page.evaluate(() => ({ done: G.done, boom: G.jet.boom }))).toEqual({ done: false, boom: 0 });
  await page.evaluate(() => { G.jet.fuse = 0.05; });
  await expect.poll(() => page.evaluate(() => ({ boom: G.jet.boom, acc: G.accident, alive: G.player.alive })), { timeout: 20_000 }).toEqual({ boom: 1, acc: 'clean', alive: true });
  await expect.poll(() => page.evaluate(() => state === 'perk' ? 'results' : state), { timeout: 40_000 }).toBe('results');
  expect(await page.evaluate(() => document.getElementById('rTitle').textContent)).toBe('BANKER DIES IN FIERY RUNWAY CRASH');
});

const toJet = async page => {
  await page.evaluate(() => { NOARRIVE = true; startLevel(13); });
  await page.evaluate(() => { G.player.hp = 99; });
  await toStairs(page, 'door');
  await go(page, 'hangar');
  await page.evaluate(() => { G.valeW.t = 0; G.valeW.n.path = []; });
  await expect.poll(() => page.evaluate(() => G.valeW.aboard), { timeout: 30_000 }).toBe(true);
  await toStairs(page, 'board');
  await go(page, 'jet');
  await page.evaluate(() => { G.player.hp = 99; G.player.maxhp = 99; for (const e of G.enemies) if (e.alive && !e.boss) killEnemy(e, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => G.jet.ph), { timeout: 20_000 }).toBe('roll');
};

test('act 4 floor 3: spare Vale and McWey takes him; the jet still goes up as an accident', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  await toJet(page);
  await page.evaluate(() => { G.jet.hack = 1; G.jet.hacking = 1; const D = G.jet.door; G.player.x = D.x - 1.0; G.player.z = D.z; });
  await expect.poll(() => page.evaluate(() => G.jet.ph), { timeout: 20_000 }).toBe('vale');
  await page.evaluate(() => { killEnemy(G.boss, 'pistol', [0, 1]); G.mercy.t = 2; keys.Digit1 = true; });
  await expect.poll(() => page.evaluate(() => ({ m: !!G.mercy, spared: !!G.boss.spared, ph: G.jet.ph })), { timeout: 20_000 }).toEqual({ m: false, spared: true, ph: 'stop' });
  await page.evaluate(() => { keys.Digit1 = false; G.items = []; const t = G.jet.thr; G.player.x = t.x - 0.8; G.player.z = t.z; playerGrab(G.player); });
  expect(await page.evaluate(() => ({ stopped: G.jet.stopped, nearCar: Math.hypot(G.boss.x - G.car.x, G.boss.z - G.car.z) < 2.5 }))).toEqual({ stopped: 1, nearCar: true });
  await page.evaluate(() => { const v = G.jet.valve; G.player.x = v.x + 1.1; G.player.z = v.z; playerGrab(G.player); G.player.x = G.car.x + 1; G.player.z = G.car.z; G.jet.fuse = 0.05; });
  await expect.poll(() => page.evaluate(() => ({ boom: G.jet.boom, acc: G.accident, vale: G.boss.alive, me: G.player.alive })), { timeout: 20_000 }).toEqual({ boom: 1, acc: 'clean', vale: true, me: true });
});

test('act 4 floor 3: if the jet is not stopped in time it runs off the runway and you die with it', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  await toJet(page);
  expect(await page.evaluate(() => { const S = jetSkin(G, G.jetBody), d = S.doors[0]; return liftAt(d.x, d.z + d.d * 1.5); })).toBe(0);
  await page.evaluate(() => { G.jet.crash = 0.05; });
  await expect.poll(() => page.evaluate(() => ({ boom: G.jet.boom, crashed: G.jet.crashed, alive: G.player.alive })), { timeout: 20_000 }).toEqual({ boom: 1, crashed: 1, alive: false });
});
