const { test, expect } = require('./fixtures.cjs');

// Act 5 "Old Gold" (floors 15 to 17, indexes 14 to 16, act5.js): the Grand Biscayne ledger, La Habana's forty bars, and the Cardinal at McWey Tower.
const go = (page, sid) => page.waitForFunction(sid => G && G.def && G.sid === sid && !G.going && !G.climb && !G.climbIn && state === 'play', sid, { timeout: 60_000 });
const toStairs = (page, id) => page.evaluate(id => { const s = G.stageRun.describe(G.sid).stairs.find(q => q.id === id); G.player.x = s.at[0]; G.player.z = s.at[1]; }, id);
const tough = page => page.evaluate(() => { G.player.hp = 99; G.player.maxhp = 99; for (const e of G.enemies) e.spd = 0.0001; });
const killAll = page => page.evaluate(() => { for (const e of G.enemies) if (e.alive && !e.boss) killEnemy(e, 'pistol', [0, 1]); });
const results = page => expect.poll(() => page.evaluate(() => state === 'perk' ? 'results' : state), { timeout: 40_000 }).toBe('results');

test('act 5 opens after Vale: the floor index, labels, briefs and the old-save unlock', async ({ openGame }) => {
  const page = await openGame({ nb86jobs: { top: 13, sel: 13, best: { 13: { g: 'A', t: 100, s: 1000, c: 3, ch: 'don', d: 'normal' } } } });
  expect(await page.evaluate(() => ({ len: CAMPAIGN_LEN, top: JOBS.top, act: LEVELS.slice(14).map(l => l.act), brief: BRIEF_FLOOR(14), last: BRIEF_FLOOR(16), dlg: ['brief14', 'brief15', 'brief16', 'finale5c'].every(k => DLG[k]), quote: MC_QUOTE.length, ch: CHALLENGES.length, par: PAR.length, stash: STASH.length, deb: !!MC_DEBRIEF[16] })))
    .toMatchObject({ len: 17, top: 14, act: [5, 5, 5], dlg: true, quote: 17, ch: 17, par: 17, stash: 17, deb: true });
  const b = await page.evaluate(() => [BRIEF_FLOOR(14), BRIEF_FLOOR(16)]);
  expect(b[0].startsWith('ACT 5 · FLOOR 1 / 3')).toBe(true);
  expect(b[1].startsWith('ACT 5 · FLOOR 3 / 3')).toBe(true);
});

test('act 5 floor 1: the laundry lift stays locked until the ledger is open, then Nunzio on the roof calls for help and the sheets hide you', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  expect(await page.evaluate(() => { NOARRIVE = true; startLevel(14); return { sid: G.sid, act: LEVELS[14].act }; })).toEqual({ sid: 'lobby', act: 5 });
  await tough(page);
  await toStairs(page, 'down');
  await go(page, 'laundry');
  await tough(page);
  const l = await page.evaluate(() => { const s = G.stageRun.describe(G.sid).stairs.find(q => q.id === 'lift'); return { obj: G.obj.label, locked: stageLocked(G, s), ledger: !!G.ledger }; });
  expect(l).toEqual({ obj: "FIND THE BELL CAPTAIN'S LEDGER", locked: true, ledger: true });
  const o = await page.evaluate(() => { const p = G.player, L = G.ledger; p.x = L.x; p.z = L.z + 1.0; const s0 = G.score; const lbl = ctxAction(p).l; playerGrab(p); const s = G.stageRun.describe(G.sid).stairs.find(q => q.id === 'lift');
    return { lbl, open: G.ledger.open, obj: G.obj, goal: act5Goal(G), paid: G.score > s0, locked: stageLocked(G, s), quiet: !!A5RUN.quiet, ch: CHALLENGES[14][0].f(G) }; });
  expect(o).toMatchObject({ lbl: 'OPEN', open: true, obj: null, goal: 'TAKE THE SERVICE LIFT UP', paid: true, locked: false });
  await killAll(page);
  await toStairs(page, 'lift');
  await go(page, 'roof');
  const r = await page.evaluate(() => ({ nunzio: G.nunzio && G.nunzio.hp, sheets: G.sheets.length, exit: G.def.exit }));
  expect(r.nunzio).toBe(6);
  expect(r.sheets).toBeGreaterThan(6);
  expect(r.exit).toBe('Take the service lift down');
  // In the sheets nobody sees you, until you shoot.
  const h = await page.evaluate(() => { const q = G.sheets[0], p = G.player; p.x = q.x; p.z = q.z; G.a5shotT = -9; const a = a5Hide(G, p); G.shots = (G.shots || 0) + 1; act5Tick(0.01); const b = a5Hide(G, p); return { a, b, crowd: (updateCrowd(0.01), G.hideNow) }; });
  expect(h.a).toBe('IN THE SHEETS');
  expect(h.b).toBe(null);
  // Nunzio calls two men up at half health.
  await tough(page);
  const n0 = await page.evaluate(() => G.enemies.filter(e => e.alive).length);
  await page.evaluate(() => { for (let k = 0; k < 3; k++) hitEnemy(G.nunzio, 'pistol', [0, 1], 1); act5Tick(0.01); });
  expect(await page.evaluate(() => ({ alive: G.nunzio.alive, help: G.nunzioHelp }))).toEqual({ alive: true, help: 1 });
  expect(await page.evaluate(() => G.enemies.filter(e => e.alive).length)).toBe(n0 + 2);
  await page.evaluate(() => { killEnemy(G.nunzio, 'pistol', [0, 1]); for (const e of G.enemies) if (e.alive) killEnemy(e, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
  await page.evaluate(() => { G.player.x = G.car.x; G.player.z = G.car.z; });
  await results(page);
});

const toCasino = async page => {
  await page.evaluate(() => { NOARRIVE = true; startLevel(15); });
  await go(page, 'pier');
  await tough(page);
  await toStairs(page, 'gang');
  await go(page, 'deck');
  await tough(page);
  await toStairs(page, 'down');
  await go(page, 'casino');
  await tough(page);
};

test('act 5 floor 2: crack the cage for the forty bars; the gamblers run at the first shot', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  await toCasino(page);
  const s = await page.evaluate(() => ({ obj: G.obj.label, cage: !!G.cage, valve: !!G.valve, gamblers: G.gamblers.length, exit: G.def.exit }));
  expect(s).toMatchObject({ cage: true, valve: true, exit: 'Take the launch back to shore' });
  expect(s.gamblers).toBeGreaterThan(3);
  await page.evaluate(() => { G.shots = (G.shots || 0) + 1; act5Tick(0.01); });
  expect(await page.evaluate(() => ({ panic: G.panic, run: G.gamblers.every(n => n.run) }))).toEqual({ panic: 1, run: true });
  const c = await page.evaluate(() => { const p = G.player, C = G.cage; p.x = C.x; p.z = C.z + 1.2; const l = ctxAction(p).l; playerGrab(p); C.crack = 0.95; return { l, cracking: C.cracking }; });
  expect(c).toEqual({ l: 'CRACK', cracking: 1 });
  await expect.poll(() => page.evaluate(() => ({ open: G.cage.open, gold: G.a5gold, done: G.obj.done })), { timeout: 20_000 }).toEqual({ open: true, gold: 'back', done: true });
  // The sea cock is shut for good once the bars are out.
  expect(await page.evaluate(() => { const p = G.player, V = G.valve; p.x = V.x; p.z = V.z + 1.0; return act5Action(p); })).toBe(null);
  await killAll(page);
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
  await page.evaluate(() => { G.player.x = G.car.x; G.player.z = G.car.z; });
  await results(page);
  expect(await page.evaluate(() => (payout(), { t: document.getElementById('rTitle').textContent, f: dlgFlag('gold_back'), s: dlgFlag('gold_sunk') }))).toEqual({ t: 'THE FORTY BARS COME HOME', f: true, s: false });
});

test('act 5 floor 2: open the sea cock, the crew abandons ship, and staying aboard too long drowns you', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  await toCasino(page);
  const v = await page.evaluate(() => { const p = G.player, V = G.valve; p.x = V.x; p.z = V.z + 1.0; const l = ctxAction(p).l; playerGrab(p); return { l, sink: !!G.sink, gold: G.a5gold, crew: G.enemies.filter(e => e.alive && !e.boss).length }; });
  expect(v).toEqual({ l: 'SINK', sink: true, gold: 'sunk', crew: 0 });
  await page.evaluate(() => { G.player.hp = 1; G.player.maxhp = 1; G.player.armor = 0; G.sink.t = 0.2; });
  await expect.poll(() => page.evaluate(() => G.player.alive), { timeout: 20_000 }).toBe(false);
});

test('act 5 floor 2: sink her and make the launch in time', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  await toCasino(page);
  await page.evaluate(() => { const p = G.player, V = G.valve; p.x = V.x; p.z = V.z + 1.0; playerGrab(p); });
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
  await page.evaluate(() => { G.player.x = G.car.x; G.player.z = G.car.z; });
  await results(page);
  expect(await page.evaluate(() => (payout(), { t: document.getElementById('rTitle').textContent, s: dlgFlag('gold_sunk') }))).toEqual({ t: 'LA HABANA GOES DOWN', s: true });
});

const toRoof = async page => {
  await page.evaluate(() => { NOARRIVE = true; startLevel(16); });
  await go(page, 'lobby');
  await tough(page);
  await toStairs(page, 'lift');
  await go(page, 'office');
  await page.evaluate(() => { G.player.hp = 99; G.player.maxhp = 99; });
  const o = await page.evaluate(() => { const s = G.stageRun.describe(G.sid).stairs.find(q => q.id === 'up'); return { mc: !!G.mcwey, locked: stageLocked(G, s), obj: G.obj.label }; });
  expect(o).toEqual({ mc: true, locked: true, obj: 'HOLD THE OFFICE' });
  // three waves come up the back stairs; each is cut down as it arrives
  for (let w = 1; w <= 3; w++) {
    await page.evaluate(() => { for (const e of G.enemies) if (e.alive) killEnemy(e, 'pistol', [0, 1]); if (G.wave) G.wave.t = 0; });
    await expect.poll(() => page.evaluate(() => G.wave.n), { timeout: 20_000 }).toBe(w);
    await page.evaluate(() => { for (const e of G.enemies) if (e.alive) e.spd = 0.0001; });
  }
  await page.evaluate(() => { for (const e of G.enemies) if (e.alive) killEnemy(e, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => G.held), { timeout: 20_000 }).toBe(true);
  expect(await page.evaluate(() => { const s = G.stageRun.describe(G.sid).stairs.find(q => q.id === 'up'); return { locked: stageLocked(G, s), held: A5RUN.held }; })).toEqual({ locked: false, held: 1 });
  await toStairs(page, 'up');
  await go(page, 'roof');
  await tough(page);
  const r = await page.evaluate(() => ({ card: G.boss && G.boss.cardinal, heli: !!G.heli, exit: G.def.exit }));
  expect(r).toEqual({ card: true, heli: true, exit: 'Take the stairs down' });
};

test('act 5 floor 3: hold the office, then finish the Cardinal on the roof and stand with McWey', async ({ openGame }) => {
  test.setTimeout(300_000);
  const page = await openGame();
  await toRoof(page);
  // at half health the door gunner starts strafing and two more men jump down
  const n0 = await page.evaluate(() => G.enemies.filter(e => e.alive).length);
  await page.evaluate(() => { const b = G.boss; b.hp = Math.floor(b.maxhp / 2); act5Tick(0.01); });
  expect(await page.evaluate(() => ({ p2: G.cardP2, strafe: !!G.strafe }))).toEqual({ p2: 1, strafe: true });
  expect(await page.evaluate(() => G.enemies.filter(e => e.alive).length)).toBe(n0 + 2);
  await page.evaluate(() => { G.strafe = null; for (const e of G.enemies) if (e.alive && !e.boss) killEnemy(e, 'pistol', [0, 1]); killEnemy(G.boss, 'pistol', [0, 1]); });
  expect(await page.evaluate(() => !!G.mercy && G.boss.alive)).toBe(true);
  await page.evaluate(() => { G.mercy.t = 2; keys.Digit2 = true; });
  await expect.poll(() => page.evaluate(() => !G.mercy && !G.boss.alive), { timeout: 20_000 }).toBe(true);
  await page.evaluate(() => { keys.Digit2 = false; while (G.fin) { G.fin.t = 2; pressed.grab = true; updateFin(0.01); pressed.grab = false; } });
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
  await page.evaluate(() => { G.player.x = G.car.x; G.player.z = G.car.z; });
  await results(page);
  expect(await page.evaluate(() => (payout(), { t: document.getElementById('rTitle').textContent, stood: dlgFlag('mc_stood'), chair: dlgFlag('mc_chair'), end: act5End().title, fin: act5Finale(), ch: CHALLENGES[16][0].f(G) }))).toMatchObject({ t: 'THE CARDINAL FALLS', stood: true, chair: false, end: 'THE LAST HONEST MAN', fin: 'finale' });
});

test('act 5 floor 3: take the deal, his men stand down, the helicopter leaves with McWey and the chair is yours', async ({ openGame }) => {
  test.setTimeout(300_000);
  const page = await openGame();
  await toRoof(page);
  await page.evaluate(() => { killEnemy(G.boss, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => ({ m: !!G.mercy, b: document.getElementById('bSpare').textContent })), { timeout: 10_000 }).toEqual({ m: true, b: 'TAKE THE DEAL' });
  await page.evaluate(() => { G.mercy.t = 2; keys.Digit1 = true; });
  await expect.poll(() => page.evaluate(() => ({ m: !!G.mercy, deal: G.cardDeal, spared: !!G.boss.spared })), { timeout: 20_000 }).toEqual({ m: false, deal: 1, spared: true });
  await page.evaluate(() => { keys.Digit1 = false; });
  await expect.poll(() => page.evaluate(() => G.heli.go > 0), { timeout: 20_000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
  await page.evaluate(() => { G.player.x = G.car.x; G.player.z = G.car.z; });
  await results(page);
  expect(await page.evaluate(() => (payout(), { t: document.getElementById('rTitle').textContent, chair: dlgFlag('mc_chair'), end: act5End().title, fin: act5Finale(), lint: !!DLG.finale5c }))).toEqual({ t: 'THE CARDINAL TAKES McWEY', chair: true, end: 'THE NEW McWEY', fin: 'finale5c', lint: true });
});
