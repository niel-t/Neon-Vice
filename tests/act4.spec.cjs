const { test, expect } = require('./fixtures.cjs');

// Act 4 "Wheels Up" (floors 12 to 14, indexes 11 to 13, act4.js): the garage vans, the Coral Room pilot, and Vale's jet.
const go = (page, sid) => page.waitForFunction(sid => G && G.def && G.sid === sid && !G.going && !G.climb && !G.climbIn && state === 'play', sid, { timeout: 60_000 });
const toStairs = (page, id) => page.evaluate(id => { const s = G.stageRun.describe(G.sid).stairs.find(q => q.id === id); G.player.x = s.at[0]; G.player.z = s.at[1]; }, id);

test('act 4 opens after Kade: the floor index, labels, briefs and the old-save unlock', async ({ openGame }) => {
  const page = await openGame({ nb86jobs: { top: 10, sel: 10, best: { 10: { g: 'A', t: 100, s: 1000, c: 3, ch: 'don', d: 'normal' } } } });
  expect(await page.evaluate(() => ({ len: CAMPAIGN_LEN, top: JOBS.top, act: LEVELS.slice(11, 14).map(l => l.act), brief: BRIEF_FLOOR(11), last: BRIEF_FLOOR(13), dlg: ['brief11', 'brief12', 'brief13'].every(k => DLG[k]), quote: MC_QUOTE.length, ch: CHALLENGES.length, par: PAR.length, stash: STASH.length })))
    .toEqual({ len: 17, top: 11, act: [4, 4, 4], brief: 'ACT 4 · FLOOR 1 / 3 — VALE TRUST GARAGE', last: 'ACT 4 · FLOOR 3 / 3 — OPA-LOCKA HANGAR 7', dlg: true, quote: 17, ch: 17, par: 17, stash: 17 });
});

test('act 4 floor 1: down the garage stairs, then the barrier and a dead driver each stop a gold van and the third gets away', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  expect(await page.evaluate(() => { NOARRIVE = true; startLevel(11); return { sid: G.sid, act: LEVELS[11].act }; })).toEqual({ sid: 'p1', act: 4 });
  await toStairs(page, 'down');
  await go(page, 'p2');
  await page.evaluate(() => { G.player.hp = 99; for (const e of G.enemies) e.spd = 0.0001; });
  await toStairs(page, 'down');
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
  // The jet is moving down the runway: the tarmac scrolls past, the airstairs are gone, the car was left behind.
  expect(await page.evaluate(() => { const d = jetSkin(G, G.jetBody).doors[0]; return { moving: G.jet.dist > 0, stairs: liftAt(d.x, d.z + d.d * 1.0), carGone: G.car.x < 0 }; })).toEqual({ moving: true, stairs: 0, carGone: true });
  // The throttles stop the jet; the door stays shut until the valve is open.
  const st = await page.evaluate(() => { G.items = []; const p = G.player, t = G.jet.thr; p.x = t.x - 0.8; p.z = t.z; const l = ctxAction(p).l; playerGrab(p); return { l, stopped: G.jet.stopped }; });
  expect(st).toEqual({ l: 'BRAKES', stopped: 1 });
  const atDoor = () => { const p = G.player, d = jetSkin(G, G.jetBody).doors[0]; p.x = d.x; p.z = d.z - d.d * 0.5; };
  await page.evaluate(atDoor);
  await page.waitForFunction(() => G.jet.doorT > 0, null, { timeout: 20_000 });
  expect(await page.evaluate(() => ({ out: !!G.jet.out, stairs: liftAt(G.player.x, G.player.z + 1.5) }))).toEqual({ out: false, stairs: 0 });
  const v = await page.evaluate(() => { const p = G.player, v = G.jet.valve; p.x = v.x + 1.1; p.z = v.z; const l = ctxAction(p).l; playerGrab(p); return { l, fuse: G.jet.fuse > 0, done: G.obj.done }; });
  expect(v).toEqual({ l: 'VALVE', fuse: true, done: true });
  // Out through the cabin door: the jet goes up behind you and the floor ends.
  expect(await page.evaluate(() => ({ done: G.done, boom: G.jet.boom }))).toEqual({ done: false, boom: 0 });
  await page.evaluate(atDoor);
  await expect.poll(() => page.evaluate(() => !!G.jet.out), { timeout: 20_000 }).toBe(true);
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

test('act 4 floor 3: spare Vale, he walks out with you and the jet still goes up as an accident', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  await toJet(page);
  await page.evaluate(() => { G.jet.hack = 1; G.jet.hacking = 1; const D = G.jet.door; G.player.x = D.x - 1.0; G.player.z = D.z; });
  await expect.poll(() => page.evaluate(() => G.jet.ph), { timeout: 20_000 }).toBe('vale');
  await page.evaluate(() => { killEnemy(G.boss, 'pistol', [0, 1]); G.mercy.t = 2; keys.Digit1 = true; });
  await expect.poll(() => page.evaluate(() => ({ m: !!G.mercy, spared: !!G.boss.spared, ph: G.jet.ph })), { timeout: 20_000 }).toEqual({ m: false, spared: true, ph: 'stop' });
  await page.evaluate(() => { keys.Digit1 = false; G.items = []; const t = G.jet.thr; G.player.x = t.x - 0.8; G.player.z = t.z; playerGrab(G.player); });
  expect(await page.evaluate(() => ({ stopped: G.jet.stopped, cuffed: G.boss.cuffed }))).toEqual({ stopped: 1, cuffed: 1 });
  await page.evaluate(() => { const v = G.jet.valve; G.player.x = v.x + 1.1; G.player.z = v.z; playerGrab(G.player); const d = jetSkin(G, G.jetBody).doors[0]; G.player.x = d.x; G.player.z = d.z - d.d * 0.5; });
  await expect.poll(() => page.evaluate(() => ({ boom: G.jet.boom, acc: G.accident, vale: G.boss.alive, me: G.player.alive, out: G.boss.z > G.jetBody.z1 - 1 })), { timeout: 20_000 }).toEqual({ boom: 1, acc: 'clean', vale: true, me: true, out: true });
  await expect.poll(() => page.evaluate(() => state === 'perk' ? 'results' : state), { timeout: 40_000 }).toBe('results');
});

test('act 4 floor 3: if the jet is not stopped in time it runs off the runway and you die with it', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  await toJet(page);
  expect(await page.evaluate(() => { const S = jetSkin(G, G.jetBody), d = S.doors[0]; return liftAt(d.x, d.z + d.d * 1.5); })).toBe(0);
  await page.evaluate(() => { G.jet.crash = 0.05; });
  await expect.poll(() => page.evaluate(() => ({ boom: G.jet.boom, crashed: G.jet.crashed, alive: G.player.alive })), { timeout: 20_000 }).toEqual({ boom: 1, crashed: 1, alive: false });
});

test('act 4 sets: the garage stairs are corner staircases that come out in the same corner, and the hangar doors bring you in from the apron', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  const p1 = await page.evaluate(() => { NOARRIVE = true; startLevel(11); const f = stairFlights(G);
    return { sid: G.sid, fl: f.map(q => [q.go, q.dir, q.top, q.side]), pit: G.pit[3 * G.W + 34] === 1, props: G.a4.props.length > 12, floor: G.floorX[3 * G.W + 20], wall: G.wallX.some(v => v === 224) }; });
  expect(p1).toEqual({ sid: 'p1', fl: [[true, -1, 32, 1]], pit: true, props: true, floor: 223, wall: true });
  // you walk onto the first flight from the room at floor level and sink with the steps to the far end
  expect(await page.evaluate(() => { const f = stairFlights(G)[0]; return [Math.abs(flightY(f, f.xw - f.side * 0.5, f.z0 + 3.95)) < 0.05, flightY(f, f.top + 0.5) < -0.8, flightY(f, f.xi)]; })).toEqual([true, true, -1.2]);
  // you walk onto the first flight from the room and along the second without a rail or a wall in the way
  expect(await page.evaluate(() => { const f = stairFlights(G)[0], p = G.player, path = [[flX(f, 1), f.z0 + 4.8], [flX(f, 1), f.z0 + 1], [flX(f, 3.3), f.z0 + 1]];let ok = true;
    for (let k = 0; k + 1 < path.length; k++) for (let t = 0; t <= 1; t += 0.05) { const x = path[k][0] + (path[k + 1][0] - path[k][0]) * t, z = path[k][1] + (path[k + 1][1] - path[k][1]) * t;
      if (isSolid(Math.floor(x), Math.floor(z))) ok = false; p.x = x; p.z = z; for (const r of flightRails(f)) boxPush(r, p); if (Math.hypot(p.x - x, p.z - z) > 0.01) ok = false; }
    p.x = 20; p.z = 6; return ok; })).toBe(true);
  // the rail along the second flight's room side keeps you off its side
  expect(await page.evaluate(() => { const p = G.player; p.x = 33.5; p.z = 4.2; stairTick(G); return p.z >= 4.07; })).toBe(true);
  // take the stairs: on P2 you come down the same flight, in the same top-right corner, onto the landing
  await page.evaluate(() => { for (const e of G.enemies) e.alive = false; });
  await toStairs(page, 'down');
  await page.waitForFunction(() => G.sid === 'p2', null, { timeout: 60_000 });
  const p2 = await page.evaluate(() => ({ arr: G.climbIn ? [G.climbIn.x0 > 32, G.climbIn.y0 > 0] : null, fl: stairFlights(G).map(q => [q.go, q.dir, q.top]), solid: isSolid(33, 2) }));
  expect(p2.fl).toEqual([[true, -1, 5], [false, -1, 32]]);
  expect(p2.solid).toBe(true);
  if (p2.arr) expect(p2.arr).toEqual([true, true]);
  await go(page, 'p2');
  expect(await page.evaluate(() => [G.player.x, G.player.z, G.player.y])).toEqual([31.5, 3, 0]);
  await page.evaluate(() => { for (const e of G.enemies) e.alive = false; });
  await toStairs(page, 'down');
  await go(page, 'dock');
  expect(await page.evaluate(() => [G.player.x, G.player.z, stairFlights(G).map(q => [q.go, q.top]), G.vans.length])).toEqual([6.5, 3, [[false, 5]], 3]);
  // the hangar: the apron's north wall is the front of Hangar 7; through its open doors you walk in from the doorway in the hangar's
  // south wall (a low solid threshold, so nobody walks out onto the apron) at the same spot along the wall
  await page.evaluate(() => { NOARRIVE = true; delete myProg().run; startLevel(13); for (const e of G.enemies) e.alive = false; });
  await go(page, 'apron');
  expect(await page.evaluate(() => { const s = G.stageRun.describe(G.sid).stairs.find(q => q.id === 'door'); return [s.at[1] < 3, s.at[0] > 25 && s.at[0] < 36]; })).toEqual([true, true]);
  await toStairs(page, 'door');
  await page.waitForFunction(() => G.sid === 'hangar', null, { timeout: 60_000 });
  expect(await page.evaluate(() => G.climbIn ? G.climbIn.z0 > 12 : true)).toBe(true);
  await go(page, 'hangar');
  expect(await page.evaluate(() => [G.player.x, G.player.z, G.player.y, G.a4.k, !!G.a4.jetBox, isSolid(32, 12), (G.wh[12 * G.W + 32] || 1) < 0.1])).toEqual([33, 10.6, 0, 'hangar', true, true, true]);
  // the parked jet has one door and one set of airstairs (a short outline row used to read as two more doors)
  expect(await page.evaluate(() => jetSkin(G, G.jetBody).doors.map(d => [d.x, d.d]))).toEqual([[30.5, 1]]);
});

test('act 4 floor 3: inside the raised jet cabin the mouse aims at the guard you point at, not half a cell past him', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  await page.evaluate(() => { NOARRIVE = true; startLevel(13); G.player.hp = 99; });
  await toStairs(page, 'door');
  await go(page, 'hangar');
  await page.evaluate(() => { G.player.hp = 99; for (const e of G.enemies) e.spd = 0.0001; G.valeW.t = 0; G.valeW.n.path = []; });
  await expect.poll(() => page.evaluate(() => G.valeW.aboard), { timeout: 30_000 }).toBe(true);
  await toStairs(page, 'board');
  await go(page, 'jet');
  // the runway jet keeps its single door
  expect(await page.evaluate(() => jetSkin(G, G.jetBody).doors.length)).toBe(1);
  // the mouse is over a guard's chest in the cabin (0.7 above the cabin floor, which is 0.8 above the tarmac): the aim point, seen at that
  // height, is right under the cursor (it used to be read at tarmac height, half a cell past whoever you pointed at)
  await page.evaluate(() => { const p = G.player; p.x = 16.5; p.z = 7.5; });
  await page.mouse.move(400, 150);
  await page.waitForFunction(() => G.aimX !== undefined, null, { timeout: 20_000 });
  const r = await page.evaluate(() => { const y = 0.7 + liftAt(G.player.x, G.player.z), v = M4.x4(VP, G.aimX, y, G.aimZ, 1); return { lift: liftAt(G.player.x, G.player.z), dx: Math.abs((v[0] / v[3] * 0.5 + 0.5) * vw - mouse.x), dy: Math.abs((0.5 - v[1] / v[3] * 0.5) * vh - mouse.y) }; });
  expect(r.lift).toBe(0.8);
  expect(r.dx).toBeLessThan(1.5);
  expect(r.dy).toBeLessThan(1.5);
});
