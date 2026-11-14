const { test, expect, progressing, modelSettle } = require('./fixtures.cjs');
const { gameData, expectedMap } = require('../scripts/check.cjs');

test('direct-open artifact loads ordered artwork, models and real frames', async ({ openGame }) => {
  const page = await openGame({}, [], { direct: true });
  expect(page.url()).toMatch(/^file:/);
  expect(await page.evaluate(() => ({
    keys: Object.keys(ART),
    embedded: Object.values(ART).every(value => value.startsWith('data:image/jpeg;base64,')),
    models: PS2C.ready && !!PI
  }))).toEqual({
    keys: ['face', 'pais', 'jack', 'money', 'don', 'mcwey', 'nine'],
    embedded: true,
    models: true
  });
  await progressing(page);
});

test('boot, models, real frames and settings reload in enhanced/retro', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext && gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
  })).toContain('SwiftShader');
  expect(await page.evaluate(() => ENH() && !!PI)).toBe(true);
  await progressing(page);
  await page.locator('#bSettings').click();
  await page.locator('#bRetro').click();
  await page.locator('#bMute').click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.evaluate(() => PS2C.ready && !ENH() && SET.sound === false && menuT > 0), modelSettle).toBe(true);
  await progressing(page);
  await page.locator('#bSettings').click();
  await expect(page.locator('#bRetro')).toHaveText('GRAPHICS: PS1 RETRO');
  await page.locator('#bRetro').click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.evaluate(() => PS2C.ready && ENH() && !!PI && menuT > 0), modelSettle).toBe(true);
});

test('UI journey: title/select/intro/elevator/brief/car/mission, spam and held movement', async ({ openGame }) => {
  const page = await openGame();
  await page.locator('#bStart').click();
  await expect.poll(() => page.evaluate(() => state)).toBe('select');
  await page.locator('#bPlay').click();
  await expect.poll(() => page.evaluate(() => state === 'play' && !!G.cine && !fading)).toBe(true);
  for (let i = 0; i < 6; i++) await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => state === 'play' && G.def === HUBS.lobby && !fading)).toBe(true);
  // Walk around the lobby fountain rather than into its collision tiles.
  await page.keyboard.down('d');
  try { await page.waitForFunction(() => G.player.x > 14, null, { polling: 'raf' }); }
  finally { await page.keyboard.up('d'); }
  await page.keyboard.down('w');
  try { await page.waitForFunction(() => G.player.z < 4.5, null, { polling: 'raf' }); }
  finally { await page.keyboard.up('w'); }
  await page.keyboard.down('a');
  try { await page.waitForFunction(() => G.player.x < 11.5, null, { polling: 'raf' }); }
  finally { await page.keyboard.up('a'); }
  await page.keyboard.down('w');
  try {
    await expect.poll(() => page.evaluate(() => state), { timeout: 25_000 }).toBe('elev');
  } finally { await page.keyboard.up('w'); }
  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => state === 'play' && G.def === HUBS.office && !fading)).toBe(true);
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => state)).toBe('brief');
  await page.waitForFunction(() => !fading && CHAT.phase !== 'idle', null, { polling: 'raf' });
  // Branches expand the queue as they are reached; Space also confirms the highlighted choice.
  for (let i = 0; i < 200; i++) {
    if (await page.evaluate(() => CHAT.done)) break;
    await page.keyboard.press('Space');
  }
  await expect.poll(() => page.evaluate(() => CHAT.done)).toBe(true);
  // The final Space can also accept a dialogue completed by its read timer.
  if (await page.evaluate(() => state === 'brief' && !fading)) await page.locator('#bGo').click();
  await expect.poll(() => page.evaluate(() => state)).toBe('elev');
  for (let i = 0; i < 6; i++) await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => state === 'play' && G.def === HUBS.lobby && !fading)).toBe(true);
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => state === 'carmenu' && !fading)).toBe(true);
  await page.locator('#bCarJob').click();
  // the car drives off from McWey's kerb first; Enter skips the scene like a player would
  await page.waitForFunction(() => G.seq && G.seq.t > 0.5, null, { polling: 'raf' });
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => state === 'play' && G.def === LEVELS[0] && !fading)).toBe(true);
  const x = await page.evaluate(() => G.player.x);
  await page.keyboard.down('d');
  try { await expect.poll(() => page.evaluate(() => G.player.x)).toBeGreaterThan(x + 0.5); }
  finally { await page.keyboard.up('d'); }
  await expect.poll(() => page.evaluate(() => G.time)).toBeGreaterThan(0.2);
  expect(await page.evaluate(() => G.player.alive && Number.isFinite(G.freeze) && G.freeze <= 0)).toBe(true);
  await progressing(page);
});

test('integration: existing startLevel loads all eleven floors and advances real simulation', async ({ openGame }) => {
  const page = await openGame();
  const data = gameData();
  expect(await page.evaluate(() => LEVEL_TRACKS.every(list => list.every(track => !!TRACKS[track])))).toBe(true);
  for (let i = 0; i < data.LEVELS.length; i++) {
    const expected = expectedMap(data.LEVELS[i], data);
    // Floor 2 is a building: startLevel(2) begins on the lobby stage (missions.js), not on the LEVELS[2] map.
    if (i === 2) Object.assign(expected, { enemies: 7, items: 3, player: [[13.5, 12.5]], car: [[23.5, 12.5]] });
    // Floor 10 is Kade Tower: startLevel(10) begins on the site stage (missions.js).
    if (i === 10) Object.assign(expected, { enemies: 13, items: 4, player: [[13.5, 12.5]], car: [[24.5, 12.5]] });
    const actual = await page.evaluate(i => {
      startLevel(i);
      return { enemies: G.enemies.length, items: G.items.length,
        player: [[G.player.x, G.player.z]], car: [[G.car.x, G.car.z]] };
    }, i);
    expect(actual, `Floor ${i} actual loader semantics`).toEqual(JSON.parse(JSON.stringify(expected)));
    await expect.poll(() => page.evaluate(() => G.T)).toBeGreaterThan(0.12);
    expect(await page.evaluate(() => Number.isFinite(G.player.x) && Number.isFinite(G.player.z) && Number.isFinite(G.freeze))).toBe(true);
    await progressing(page);
  }
});

test('arrival: every floor opens with the car pulling up to a real entrance, skipped on retry', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  for (let i = 0; i < 11; i++) {
    const a = await page.evaluate(i => {
      NOARRIVE = false; ARR_SEEN = -1; startLevel(i);
      const arriving = !!G.arrive, { type, gx, zT } = G.arr; endArrive();
      const at = [G.player.x, G.player.z], car = [G.car.x, G.car.z], doors = G.doors.filter(d => d.front).length;
      const walkable = !G.solid[Math.floor(at[1]) * G.W + Math.floor(at[0])];
      startLevel(i);
      return { arriving, type, gx, zT, at, car, doors, walkable, retry: !!G.arrive, again: [G.player.x, G.player.z] };
    }, i);
    const front = a.type === 'front';
    expect(a.arriving, `Floor ${i} opens with the car arrival`).toBe(true);
    expect(a.walkable, `Floor ${i} entrance is walkable`).toBe(true);
    expect(a.doors, `Floor ${i} entrance has a real door`).toBeGreaterThan(0);
    expect(a.at[0], `Floor ${i} player at entrance`).toBeCloseTo(a.gx, 5);
    expect(a.at[1], `Floor ${i} player at entrance`).toBeCloseTo(a.zT + (front ? 0.45 : 0.15), 5);
    expect(Math.abs(a.car[0] - a.gx), `Floor ${i} car parked by entrance`).toBeCloseTo(0.55, 5);
    expect(a.car[1], `Floor ${i} car parked by entrance`).toBeCloseTo(a.zT + (front ? 1.15 : 1), 5);
    expect(a.retry, `Floor ${i} retry skips the drive-in`).toBe(false);
    expect(a.again, `Floor ${i} retry starts at the entrance`).toEqual(a.at);
  }
  // Real frames: the Marina drive-in plays out by itself and opens through a two-leaf iron gate.
  await page.evaluate(() => { NOARRIVE = false; ARR_SEEN = -1; startLevel(3); });
  await expect.poll(() => page.evaluate(() => !G.arrive), { timeout: 45_000 }).toBe(true);
  expect(await page.evaluate(() => G.doors.filter(d => d.gate).length)).toBe(2);
  // Doors stop rounds: a pistol shot into the gate and into a wooden door ends at the leaf and swings it.
  expect(await page.evaluate(() => {
    G.enemies.forEach(en => { en.alive = false; });
    const shoot = d => {
      const e = doorEnd(d), mx = (d.hx + e[0]) / 2, mz = (d.hz + e[1]) / 2, p = bProj('pistol');
      const b = { x: mx, z: mz + 1.5, dx: 0, dz: -1, sp: 34, life: 1.2, own: 'p', pierce: 1, type: 'pistol', hit: [], p, e: p.e0, tum: 1, y: 1.3, sx: mx, sz: mz + 1.5, st: 'stand' };
      G.bullets.push(b); for (let k = 0; k < 6; k++) updateBullets(1 / 60);
      return b.life <= 0 && b.z > d.hz - 0.1 && Math.abs(d.w) > 0 && d.pusher === 'b';
    };
    return [G.doors.find(q => q.gate), G.doors.find(q => q.front && !q.gate)].map(shoot);
  })).toEqual([true, true]);
  await page.evaluate(() => { NOARRIVE = true; });
  await progressing(page);
});

test('saves: historical migration, current round-trip, floor stepping and quota recovery', async ({ openGame }) => {
  const history = await openGame({ nb86prog: { don: { lvl: 4, xp: 120, perks: { tough: 1 }, sharkDead: 1, custom: 'preserve' } } }, ['nb86']);
  expect(await history.evaluate(() => ({ top: JOBS.top, wallet: wallet(), lvl: myProg().lvl, custom: myProg().custom })))
    .toEqual({ top: 3, wallet: 0, lvl: 4, custom: 'preserve' });
  await history.evaluate(() => {
    myProg().wallet = 321;
    saveProg();
    recordBest(7, { g: 'A', t: 40, s: 8000, c: 4, ch: 'don', d: 'easy' });
    JOBS.sel = 7; saveJobs();
    stepFloor(1);
  });
  await history.reload({ waitUntil: 'domcontentloaded' });
  await expect.poll(() => history.evaluate(() => PS2C.ready && menuT > 0), modelSettle).toBe(true);
  expect(await history.evaluate(() => ({ wallet: wallet(), top: JOBS.top, sel: JOBS.sel, grade: JOBS.best[7].g, custom: myProg().custom })))
    .toEqual({ wallet: 321, top: 8, sel: 8, grade: 'A', custom: 'preserve' });
  await history.evaluate(() => { JOBS.sel = 0; stepFloor(-1); });
  expect(await history.evaluate(() => JOBS.sel)).toBe(0);
  expect(await history.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function () { throw new DOMException('Fixture quota failure', 'QuotaExceededError'); };
    try { return saveSet(); }
    finally { Storage.prototype.setItem = original; }
  })).toBe(false);
  await expect(history.locator('#saveWarning')).toBeVisible();
  expect(await history.evaluate(() => saveSet())).toBe(true);
  await expect(history.locator('#saveWarning')).toBeHidden();
});

test('saves: out-of-range floor records are clamped', async ({ openGame }) => {
  const bounds = await openGame({ nb86jobs: { mig: 1, top: 999, sel: -1 } });
  expect(await bounds.evaluate(() => [JOBS.top, JOBS.sel])).toEqual([10, 0]);
});

test('saves: pre-RPG progress preserves purchases and loan history', async ({ openGame }) => {
  const preRPG = await openGame({ nb86prog: { don: {
    wallet: 123, debt: 0, cars: ['beater', 'mid'], car: 'mid', jewel: { watch: true }, seen: { loan: 1 }
  } } });
  await preRPG.locator('#bStart').click();
  expect(await preRPG.evaluate(() => ({ wallet: wallet(), lvl: myProg().lvl, car: myProg().car, loan: myProg().seen.loan })))
    .toEqual({ wallet: 123, lvl: 1, car: 'mid', loan: 1 });
});

test('saves: pre-debt progress preserves the car and loan history', async ({ openGame }) => {
  const preDebt = await openGame({ nb86prog: { don: { lvl: 2, xp: 10, perks: {}, cars: ['beater', 'mid'], car: 'mid', seen: { loan: 1 } } } });
  expect(await preDebt.evaluate(() => { arm(); return [myProg().car, myProg().seen.loan]; })).toEqual(['mid', 1]);
});

for (const [key, raw] of [['nb86', ''], ['nb86prog', 'null'], ['nb86jobs', 'null']]) {
  test(`saves: corrupt ${key} remains untouched by all save writers`, async ({ openGame }) => {
    const broken = await openGame({ [key]: raw }, [key]);
    await expect(broken.locator('#saveWarning')).toBeVisible();
    expect(await broken.evaluate(key => {
      saveSet(); saveProg(); saveJobs();
      return localStorage.getItem(key);
    }, key)).toBe(raw);
    if (key === 'nb86prog') expect(await broken.evaluate(() => JOBS.mig)).toBeFalsy();
  });
}

test('saves: invalid required containers are preserved', async ({ openGame }) => {
  const invalidContainer = { don: { lvl: 3, xp: 90, perks: [], custom: 'keep' } };
  const invalid = await openGame({ nb86prog: invalidContainer }, ['nb86prog']);
  await expect(invalid.locator('#saveWarning')).toBeVisible();
  expect(await invalid.evaluate(() => { saveProg(); return JSON.parse(localStorage.getItem('nb86prog')); })).toEqual(invalidContainer);
});

test('saves: the old armory becomes a kit and locker without losing anything, and round-trips', async ({ openGame }) => {
  const legacy = { don: { lvl: 2, xp: 0, perks: {}, custom: 'keep', arm: { eq: 'smg', owned: ['smg', 'bat', 'shotgun'], mags: 1, vest: 1, stock: [], jobs: 2 } } };
  const page = await openGame({ nb86prog: legacy });
  const kit = { v: 1, guns: [{ type: 'smg', mag: 32 }, { type: 'revolver', mag: 6 }], active: 0, melee: null, armour: { type: 'vest', plates: 1 }, pool: { '9mm': 32, '357': 3 }, upg: {}, lost: [] };
  const locker = { v: 1, items: [{ type: 'bat' }, { type: 'shotgun', mag: 6 }], lost: [] };
  expect(await page.evaluate(() => ({ kit: kit(), locker: myProg().locker }))).toEqual({ kit, locker });
  await page.evaluate(() => saveProg());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.evaluate(() => PS2C.ready && menuT > 0), modelSettle).toBe(true);
  expect(await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('nb86prog')).don; return { kit: s.kit, locker: s.locker, arm: s.arm.owned, custom: s.custom, live: kit() }; }))
    .toEqual({ kit, locker, arm: ['smg', 'bat', 'shotgun'], custom: 'keep', live: kit });
});

test('saves: kit content drift is kept in lost, stale jobs are dropped, broken kit structure blocks only progress', async ({ openGame }) => {
  const drift = await openGame({ nb86prog: { don: { lvl: 1, xp: 0, perks: {},
    kit: { v: 1, guns: [{ type: 'raygun', mag: 3 }, { type: 'pistol', mag: 99 }], active: 1, melee: 'spoon', armour: null, pool: { '9mm': 5000, plasma: 4 }, upg: {} },
    locker: { v: 1, items: [{ type: 'pistol', mag: 2 }, { type: 'zap' }] },
    run: { v: 1, mission: 'c99', stage: 's0', entryKit: { guns: [], pool: {} }, stageKit: { guns: [], pool: {} }, t: 1 } } } });
  expect(await drift.evaluate(() => { const k = kit(), p = myProg(); return { guns: k.guns, melee: k.melee, pool: k.pool, lost: k.lost.map(l => l.why), locker: p.locker.items, llost: p.locker.lost.length, run: p.run || null, blocked: SAVE.blocked.has('nb86prog') }; }))
    .toEqual({ guns: [null, { type: 'pistol', mag: 15 }], melee: null, pool: { '9mm': 90 }, lost: ['unknown gun', 'unknown melee', 'unknown caliber'], locker: [{ type: 'pistol', mag: 2 }], llost: 1, run: null, blocked: false });
  const raw = JSON.stringify({ don: { lvl: 1, xp: 0, perks: {}, kit: { guns: 'nope', pool: {} } } });
  const broken = await openGame({ nb86prog: raw }, ['nb86prog']);
  await expect(broken.locator('#saveWarning')).toBeVisible();
  expect(await broken.evaluate(() => { saveProg(); return localStorage.getItem('nb86prog'); })).toBe(raw);
});

test('saves: a job in progress resumes from its stage kit as a retry, and walking away restores the entry kit', async ({ openGame }) => {
  const entry = { v: 1, guns: [{ type: 'pistol', mag: 15 }, null], active: 0, melee: null, armour: null, pool: { '9mm': 20 }, upg: {}, lost: [] };
  const stage = { ...entry, guns: [{ type: 'shotgun', mag: 4 }, null], pool: { '12ga': 10 } };
  const page = await openGame({ nb86prog: { money: { lvl: 1, xp: 0, perks: {}, kit: entry, run: { v: 1, mission: 'c1', stage: 's1', entryKit: entry, stageKit: stage, stow: [{ type: 'smg', mag: 12 }], t: 5 } } } });
  await expect(page.locator('#bResumeJob')).toBeVisible();
  await page.locator('#bResumeJob').click();
  await expect.poll(() => page.evaluate(() => state === 'play' && !!G && !G.def.hub && levelIdx)).toBe(1);
  // a pre-MISSIONS checkpoint ('s1') on a still-unmigrated mission keeps its stage kit and stowed finds, and stays kept after the next save
  expect(await page.evaluate(() => { saveProg(); const r = JSON.parse(localStorage.getItem('nb86prog')).money.run;
    return { ch: CHARS[selIdx].id, weapon: G.player.weapon, pool: G.live.pool, kit: kit().guns, stage: r.stage, stageGuns: r.stageKit.guns, stow: r.stow }; }))
    .toEqual({ ch: 'money', weapon: { type: 'shotgun', ammo: 4 }, pool: { '12ga': 10 }, kit: entry.guns, stage: 'legacy', stageGuns: stage.guns, stow: [{ type: 'smg', mag: 12 }] });
  // 's0' (the old start id) is the same; only a stage a migrated mission no longer has restarts it from the entry kit
  expect(await page.evaluate(([e, st]) => { const run = stg => normRun({ mission: 'c1', stage: stg, entryKit: structuredClone(e), stageKit: structuredClone(st), stow: [{ type: 'smg', mag: 12 }], stageHp: 40, st: { w1: 1 } }, missionStage, []);
    const s0 = run('s0'), stages = MISSIONS.c1.stages;
    MISSIONS.c1.stages = ['legacy', 'yard'];
    try { const gone = run('gone'), yard = run('yard');
      return { s0: [s0.stage, s0.stageKit.guns, s0.stow.length, s0.stageHp], gone: [gone.stage, gone.stageKit.guns, gone.stow, gone.stageHp, gone.st], yard: [yard.stage, yard.stageKit.guns, yard.stow.length, yard.stageHp],
        bad: normRun({ mission: 'toString', entryKit: e, stageKit: st }, missionStage, []) }; } finally { MISSIONS.c1.stages = stages; } }, [entry, stage]))
    .toEqual({ s0: ['legacy', stage.guns, 1, 40], gone: ['legacy', entry.guns, undefined, undefined, undefined], yard: ['yard', stage.guns, 1, 40], bad: null });
  await expect.poll(() => page.evaluate(() => fading)).toBe(false); // walkAway is refused while the resume fade is still running
  expect(await page.evaluate(() => { const f = fadeTo; fadeTo = () => true; try { togglePause(); walkAway(); } finally { fadeTo = f; }
    const s = JSON.parse(localStorage.getItem('nb86prog')).money; return { run: s.run || null, kit: s.kit }; }))
    .toEqual({ run: null, kit: entry });
});

test('act 3: the demolition floor needs its charges cut before it clears, and the crew wears hard hats', async ({ openGame }) => {
  test.setTimeout(120_000);
  const page = await openGame();
  const start = await page.evaluate(() => { NOARRIVE = true; startLevel(8); return { act: G.def.act, rigs: G.rigs.length, obj: G.obj.label, hats: G.enemies.filter(e => e.look.helmet === 'pasgt').length, last: CAMPAIGN_LEN - 1 }; });
  expect(start).toMatchObject({ act: 3, rigs: 4, obj: 'CUT THE CHARGE WIRES', last: 10 });
  expect(start.hats).toBeGreaterThan(3);
  await page.evaluate(() => { for (const e of G.enemies) if (e.alive) killEnemy(e, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => G.enemies.every(e => !e.alive))).toBe(true);
  expect(await page.evaluate(() => G.cleared)).toBe(false);
  for (let k = 0; k < 4; k++) {
    await page.evaluate(k => { const r = G.rigs[k]; G.player.x = r.x; G.player.z = r.z + 0.6; playerGrab(G.player); }, k);
  }
  await expect.poll(() => page.evaluate(() => ({ n: G.obj.n, done: G.obj.done, cleared: G.cleared }))).toEqual({ n: 4, done: true, cleared: true });
});

test('act 3: the gala needs the ledger from the safe before the floor clears', async ({ openGame }) => {
  test.setTimeout(120_000);
  const page = await openGame();
  expect(await page.evaluate(() => { NOARRIVE = true; startLevel(9); return { act: G.def.act, obj: G.obj.label, safe: !!G.safe }; })).toEqual({ act: 3, obj: 'GET THE LEDGER', safe: true });
  await page.evaluate(() => { for (const e of G.enemies) if (e.alive) killEnemy(e, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => G.enemies.every(e => !e.alive))).toBe(true);
  expect(await page.evaluate(() => G.cleared)).toBe(false);
  await page.evaluate(() => { G.player.x = G.safe.x - 1.2; G.player.z = G.safe.z; playerGrab(G.player); });
  await expect.poll(() => page.evaluate(() => ({ done: G.obj.done, cleared: G.cleared }))).toEqual({ done: true, cleared: true });
});

test('act 3: Kade Tower, the hoist needs the foreman\'s key, the crane drops a load and Kade calls for help at half health', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  const go = sid => page.waitForFunction(sid => G && G.def && G.sid === sid && !G.going && state === 'play', sid, { timeout: 60_000 });
  expect(await page.evaluate(() => { NOARRIVE = true; startLevel(10); return { sid: G.sid, hats: G.enemies.filter(e => e.look.helmet === 'pasgt').length }; })).toMatchObject({ sid: 'site' });
  // Without the key the hoist stays shut.
  await page.evaluate(() => { const s = G.stageRun.describe(G.sid).stairs.find(q => q.id === 'elev'); G.player.x = s.at[0]; G.player.z = s.at[1] + 0.3; });
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => G.sid)).toBe('site');
  await page.evaluate(() => { const k = G.enemies.find(e => e.weapon && e.weapon.type === 'silenced'); killEnemy(k, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => !!G.key)).toBe(true);
  await page.evaluate(() => { G.player.x = G.key.x; G.player.z = G.key.z; });
  await expect.poll(() => page.evaluate(() => G.keycard)).toBe(true);
  await page.evaluate(() => { const s = G.stageRun.describe(G.sid).stairs.find(q => q.id === 'elev'); G.player.x = s.at[0]; G.player.z = s.at[1]; });
  await go('pent');
  const top = await page.evaluate(() => ({ boss: G.boss && G.boss.name || (G.def.boss && G.def.boss.name), foes: G.enemies.length, alerted: G.enemies.filter(e => e.alive && (e.state === 'chase' || e.alertT > 0)).length }));
  expect(top.boss).toBe('DORIAN KADE');
  expect(top.foes).toBeGreaterThan(8);
  // The crane starts once Kade has seen you; its warning lane lands and crushes anything in it.
  await page.evaluate(() => { G.bossSeen = true; G.crane = { t: 0.05, ph: 0, x: G.player.x, w: 2.4 }; });
  await expect.poll(() => page.evaluate(() => G.crane && G.crane.ph), { timeout: 20_000 }).toBeGreaterThan(0);
  // Half health: the reinforcements come up the hoist.
  const before = await page.evaluate(() => G.enemies.length);
  await page.evaluate(() => { G.boss.hp = Math.floor(G.boss.maxhp / 2); });
  await expect.poll(() => page.evaluate(() => G.enemies.length), { timeout: 20_000 }).toBe(before + 3);
  // Killed beside the open edge, Kade goes over it.
  expect(await page.evaluate(() => { const b = G.boss, sc = G.score; b.x = 2.5; b.z = 6.5; killEnemy(b, 'pistol', [-1, 0]); return { fell: !!G.kadeFell, paid: G.score - sc >= 2000, alive: b.alive }; })).toEqual({ fell: true, paid: true, alive: false });
  await expect.poll(() => page.evaluate(() => !!G.boss.sunk), { timeout: 20_000 }).toBe(true);
  await page.evaluate(() => { for (const e of G.enemies) if (e.alive) killEnemy(e, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
});

test('lex: the killing blow opens a spare-or-finish choice; sparing leaves him on the deck and the floor still clears', async ({ openGame }) => {
  test.setTimeout(180_000);
  const page = await openGame();
  await page.evaluate(() => { NOARRIVE = true; startLevel(7); killEnemy(G.boss, 'pistol', [0, 1]); });
  expect(await page.evaluate(() => ({ asking: !!G.mercy, alive: G.boss.alive, fin: !!G.fin }))).toEqual({ asking: true, alive: true, fin: false });
  await page.keyboard.down('1');
  await expect.poll(() => page.evaluate(() => !G.mercy), { timeout: 30_000 }).toBe(true);
  await page.keyboard.up('1');
  expect(await page.evaluate(() => ({ alive: G.boss.alive, spared: !!G.boss.spared, fin: !!G.fin }))).toEqual({ alive: true, spared: true, fin: false });
  await page.evaluate(() => { for (const e of G.enemies) if (e.alive && !e.boss) killEnemy(e, 'pistol', [0, 1]); });
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
});

test('enemy kinds: dogs, grenadiers, riot shields and spotters appear from the Marina on and behave', async ({ openGame }) => {
  test.setTimeout(180_000);
  const page = await openGame();
  const kinds = await page.evaluate(() => { NOARRIVE = true; const r = {}; for (const i of [0, 1, 3, 6, 9]) { startLevel(i); r[i] = G.enemies.filter(e => e.kind).map(e => e.kind).sort().join(','); } return r; });
  expect(kinds).toEqual({ 0: '', 1: '', 3: 'dog,dog', 6: 'nade,shield', 9: 'shield,shield,spot' });
  const r = await page.evaluate(() => { startLevel(9); const g = G, sh = g.enemies.find(e => e.kind === 'shield'); sh.a = 0;
    const nine = BAL.proj('9mm'), rifle = BAL.proj('556');
    const out = { front9: shieldBlocks(sh, { p: nine, dx: 0, dz: -1 }), back9: shieldBlocks(sh, { p: nine, dx: 0, dz: 1 }), frontRifle: shieldBlocks(sh, { p: rifle, dx: 0, dz: -1 }) };
    const dog = setKind(g.enemies.find(e => !e.kind && !e.boss), 'dog'); knockdown(dog, [1, 0]); out.dogDead = !dog.alive;
    for (const e of g.enemies) if (e.kind !== 'nade') { e.alive = false; e.sunk = true; }
    let n = g.enemies.find(e => e.kind === 'nade'); if (!n) { n = g.enemies[0]; n.alive = true; n.sunk = false; setKind(n, 'nade'); }
    g.player.x = 19.5; g.player.z = 11; g.player.hp = 99; n.x = 19.5; n.z = 5.5; n.a = 0; return out; });
  expect(r).toEqual({ front9: true, back9: false, frontRifle: false, dogDead: true });
  await expect.poll(() => page.evaluate(() => (G.nades || []).some(n => n.own === 'e' && n.ring)), { timeout: 30_000 }).toBe(true);
});

test('getaway: clearing a floor starts a countdown; leaving in time pays, staying brings backup or falling debris', async ({ openGame }) => {
  test.setTimeout(180_000);
  const page = await openGame();
  const clear = i => page.evaluate(i => { NOARRIVE = true; startLevel(i); { const f = G.enemies.reduce((a, b) => Math.hypot(b.x - G.car.x, b.z - G.car.z) > Math.hypot(a.x - G.car.x, a.z - G.car.z) ? b : a); G.player.x = f.x; G.player.z = f.z; } for (const e of G.enemies) if (e.alive) { e.lex ? (e.spared = true) : killEnemy(e, 'pistol', [0, 1]); } if (G.obj) G.obj.done = true; }, i);
  await clear(0);
  await expect.poll(() => page.evaluate(() => G.cleared)).toBe(true);
  expect(await page.evaluate(() => !!G.esc)).toBe(false); // the first floor stays a gentle tutorial
  await clear(4);
  await expect.poll(() => page.evaluate(() => !!(G.cleared && G.esc))).toBe(true);
  expect(await page.evaluate(() => ({ kind: G.esc.kind, late: G.esc.late, ok: G.esc.t >= 14 && G.esc.t <= 45 }))).toEqual({ kind: 'backup', late: false, ok: true });
  await page.evaluate(() => { G.esc.t = 0.05; });
  await expect.poll(() => page.evaluate(() => G.esc.late)).toBe(true);
  expect(await page.evaluate(() => G.enemies.filter(e => e.backup && e.alive && e.state === 'chase').length)).toBeGreaterThan(0);
  expect(await page.evaluate(() => G.cleared)).toBe(true);
  await clear(8);
  await expect.poll(() => page.evaluate(() => !!(G.cleared && G.esc))).toBe(true);
  await page.evaluate(() => { G.esc.t = 0.05; G.player.hp = 99; });
  await expect.poll(() => page.evaluate(() => G.esc.kind === 'debris' && (G.nades || []).some(n => n.ring)), { timeout: 20_000 }).toBe(true);
  await clear(3);
  await expect.poll(() => page.evaluate(() => !!(G.cleared && G.esc))).toBe(true);
  const sc = await page.evaluate(() => { const s = G.score; G.player.x = G.car.x; G.player.z = G.car.z; return s; });
  await expect.poll(() => page.evaluate(() => !!G.getaway)).toBe(true);
  expect(await page.evaluate(sc => G.score - sc, sc)).toBe(1000);
});

test('lures: a thrown weapon and a shot arcade cabinet draw guards to the noise, and ON AIR makes shots carry', async ({ openGame }) => {
  test.setTimeout(180_000);
  const page = await openGame();
  const r = await page.evaluate(() => { NOARRIVE = true; startLevel(4); const g = G, e = g.enemies.find(q => q.alive && !q.kind && q.state !== 'chase');
    lureNoise(e.x + 2, e.z, 7, 'CLATTER!'); const out = { lures: g.lures, heard: e.state !== 'chase' && !!(e.poi || e.inv || e.state === 'search' || e.sx !== undefined) };
    const c = g.cabs[0]; balImpact(c.x, c.z, 0, 1, balLook('cmu_hollow'), 'wall', false); out.cab = !!c.loud; out.lures2 = g.lures; balImpact(c.x, c.z, 0, 1, balLook('cmu_hollow'), 'wall', false); out.once = g.lures; return out; });
  expect(r).toMatchObject({ lures: 1, cab: true, lures2: 2, once: 2 });
  await page.evaluate(() => { startLevel(6); G.airT = 0.05; });
  await expect.poll(() => page.evaluate(() => !!G.onAir), { timeout: 20_000 }).toBe(true);
  await page.evaluate(() => { startLevel(0); });
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => !!G.onAir)).toBe(false);
});

test('fourth challenges and the new side jobs read slams, lures, the getaway and the ON AIR light', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(() => { NOARRIVE = true; startLevel(3); const g = G, c = CHALLENGES[3][3], out = { four: CHALLENGES.every(x => x.length === 4), name: c.n, before: c.f(g) };
    g.slamK = { water: 2 }; g.slams = 2; out.after = c.f(g); g.sj = 'slam'; out.slam = sjState(g).ok; g.sj = 'lure'; out.lure0 = !!sjState(g).ok; g.lures = 2; out.lure = sjState(g).ok;
    g.sj = 'getaway'; out.get0 = !!sjState(g).ok; g.getaway = true; out.get = sjState(g).ok; g.sj = 'clean'; out.clean = !!sjState(g).ok; g.taken = 1; out.hit = !!sjState(g).fail;
    out.air = CHALLENGES[6][3].f({}) && !CHALLENGES[6][3].f({ airShots: 1 }); out.keys = Object.keys(SIDEJOBS).length; return out; });
  expect(r).toEqual({ four: true, name: '2 MEN OVERBOARD', before: false, after: true, slam: true, lure0: false, lure: true, get0: false, get: true, clean: true, hit: true, air: true, keys: 10 });
});

test('night 2: a cleared floor can be replayed with a modifier, keeps its own best, and the daily job picks one floor and modifier', async ({ openGame }) => {
  test.setTimeout(180_000);
  const page = await openGame();
  const r = await page.evaluate(() => { NOARRIVE = true; const out = {};
    NIGHTMOD = 'shotguns'; startLevel(4); out.locked = G.mod; // not cleared yet: plays as normal
    JOBS.best[4] = { g: 'B', t: 60, s: 5000, c: 3, ch: 'don', d: 'normal' }; JOBS.top = Math.max(JOBS.top, 5);
    NIGHTMOD = null; startLevel(4); const base = G.enemies.map(e => e.x.toFixed(1) + ',' + e.z.toFixed(1)).join('|'), n = G.enemies.length;
    NIGHTMOD = 'shotguns'; startLevel(4); out.mod = G.mod; out.moved = G.enemies.map(e => e.x.toFixed(1) + ',' + e.z.toFixed(1)).join('|') !== base;
    out.allShot = G.enemies.filter(e => !e.boss && !e.kind && e.weapon && !WD[e.weapon.type].melee && e.weapon.type !== 'silenced').every(e => e.weapon.type === 'shotgun');
    NIGHTMOD = 'full'; startLevel(4); out.more = G.enemies.length > n;
    NIGHTMOD = 'glass'; startLevel(4); out.hp = G.player.hp; hurtPlayer([0, 1], 'pistol'); out.dead = !G.player.alive;
    NIGHTMOD = 'dogs'; startLevel(4); out.dogs = G.enemies.filter(e => e.kind === 'dog').length > 1;
    const q = dailyPick(); out.daily = !!q && nightOK(q.floor) && !!NIGHT_MODS[q.mod] && q.d === new Date().toISOString().slice(0, 10);
    const before = JSON.stringify(JOBS.best[4]); const rec = recordNight(4, 'full', { g: 'A', t: 50, s: 9000, c: 5, ch: 'don', d: 'normal' }); out.rec = rec.nb[0]; out.kept = JSON.stringify(JOBS.best[4]) === before;
    NIGHTMOD = null; return out; });
  expect(r).toEqual({ locked: null, mod: 'shotguns', moved: true, allShot: true, more: true, hp: 1, dead: true, dogs: true, daily: true, rec: 'FIRST NIGHT CLEAR', kept: true });
});

test('context button: the touch GRAB button names the objective, a weapon to take, a slam, a throw or a lure', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(() => { NOARRIVE = true; const out = {}; startLevel(8); const p = G.player, rg = G.rigs[0];
    p.x = rg.x; p.z = rg.z; out.obj = ctxAction(p); p.x = 1.5; p.z = 1.5; p.weapon = null; G.items.length = 0; out.none = ctxAction(p).l;
    startLevel(3); const q = G.player, W = G.W; q.weapon = { type: 'pistol', ammo: 5 }; G.items.length = 0;
    for (const b of G.boats) b.sunk = true; for (const e of G.enemies) { e.alive = false; } out.lure = ctxAction(q).l;
    for (let z = 1; z < G.H - 1 && !out.slam; z++) for (let x = 4; x < W - 2; x++) { const i = z * W + x;
      if (!G.solid[i] && G.solid[i + 1] && G.wallT[i + 1] === 39 && G.wh[i + 1] < 0.1 && !G.solid[i - 1] && !G.solid[i - 2] && !G.solid[i - 3]) {
        const e = G.enemies.find(k => k.body !== 'fat' && k.body !== 'big' && !k.boss); e.alive = true; e.down = 0; e.x = x + 0.5; e.z = z + 0.5; q.x = x - 2.5; q.z = z + 0.5; q.a = Math.PI / 2; out.slam = ctxAction(q); break; } }
    return out; });
  expect(r).toEqual({ obj: { l: 'CUT', hot: 1 }, none: 'GRAB', lure: 'LURE', slam: { l: 'SLAM', hot: 1 } });
});

test('boss second acts: the yacht floods once Lex is enraged, and Kade can be crushed with the crane console', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  await page.evaluate(() => { NOARRIVE = true; startLevel(7); G.player.hp = 99; G.boss.enraged = true; });
  await expect.poll(() => page.evaluate(() => !!G.flood && G.pool.some(v => v)), { timeout: 20_000 }).toBe(true);
  const go = sid => page.waitForFunction(sid => G && G.def && G.sid === sid && !G.going && state === 'play', sid, { timeout: 60_000 });
  await page.evaluate(() => { startLevel(10); G.keycard = true; const s = G.stageRun.describe(G.sid).stairs.find(q => q.id === 'elev'); G.player.x = s.at[0]; G.player.z = s.at[1]; });
  await go('pent');
  const a = await page.evaluate(() => { const p = G.player, L = craneLeverAt(G); p.x = L.x; p.z = L.z; p.hp = 99; const ctx = ctxAction(p).l; const hp = G.boss.hp; playerGrab(p); return { ctx, mine: !!G.crane.mine, x: Math.abs(G.crane.x - Math.max(3, Math.min(G.W - 4, G.boss.x))) < 0.01, hp }; });
  expect(a).toMatchObject({ ctx: 'CRANE', mine: true, x: true });
  await page.evaluate(() => { G.boss.spd = 0.0001; G.boss.x = G.crane.x; });
  await expect.poll(() => page.evaluate(hp => G.boss.hp < hp || !G.boss.alive, a.hp), { timeout: 20_000 }).toBe(true);
});

test('mastery, mods and capstones: kills level a weapon, Nine fits mods, Second Wind saves one fatal hit, Ghost keeps shots silent', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(() => { NOARRIVE = true; const out = {}, pr = myProg(), keep = { perks: pr.perks, mast: pr.mast, mods: pr.mods, lvl: pr.lvl };
    try {
      pr.lvl = 5; pr.perks = {}; out.capsEarly = perkOpts(pr).some(k => PERKS[k].cap); pr.lvl = 12; out.capsLate = ['second', 'slammer', 'phantom'].every(k => perkOpts(pr).includes(k));
      startLevel(3); const p = G.player; pr.mast = {}; p.weapon = { type: 'pistol', ammo: 9 };
      for (let i = 0; i < 20; i++) addKillScore(G.enemies[0], 'pistol'); out.mast = [mastLv('pistol'), mastLv('smg')];
      p.weapon = { type: 'smg', ammo: 9 }; addKillScore(G.enemies[0], 'pistol'); out.wrongGun = pr.mast.pistol;
      pr.mods = { xmag: 1, supp: 1 }; applyMods(); out.mag = WD.smg.mag; G.firstKill = 1; out.quiet = gunLoud({ type: 'pistol' }, G);
      pr.mods = {}; applyMods(); out.magBack = WD.smg.mag;
      pr.perks = { phantom: 1 }; G.firstKill = 0; out.ghost = gunLoud({ type: 'shotgun' }, G); G.firstKill = 1; out.ghostAfter = gunLoud({ type: 'shotgun' }, G) > 0;
      pr.perks = { second: 1 }; p.armor = 0; p.armorT = 0; p.hp = 1; hurtPlayer([0, 1], 'pistol', 5); out.saved = p.alive && G.secondUsed === 1;
      p.armorT = 0; hurtPlayer([0, 1], 'pistol', 5); out.second = p.alive;
    } finally { Object.assign(pr, keep); applyMods(); }
    return out; });
  expect(r).toEqual({ capsEarly: false, capsLate: true, mast: [1, 0], wrongGun: 20, mag: 48, quiet: 2.5, magBack: 32, ghost: 0, ghostAfter: true, saved: true, second: false });
});

test('slams: a guard knocked into water, the shark tank or broken glass dies there, and Kade can go off the edge', async ({ openGame }) => {
  test.setTimeout(180_000);
  const page = await openGame();
  const water = await page.evaluate(() => { NOARRIVE = true; startLevel(3); const g = G, W = g.W;
    for (let z = 1; z < g.H - 1; z++) for (let x = 1; x < W - 2; x++) { const i = z * W + x;
      if (!g.solid[i] && g.solid[i + 1] && g.wallT[i + 1] === 39 && g.wh[i + 1] < 0.1) { const e = g.enemies.find(q => q.alive && !q.boss && q.body !== 'fat' && q.body !== 'big'); e.x = x + 0.5; e.z = z + 0.5; knockdown(e, [1, 0]); return { alive: e.alive, sunk: !!e.sunk, slams: g.slams, k: g.slamK }; } }
    return null; });
  expect(water).toEqual({ alive: false, sunk: true, slams: 1, k: { water: 1 } });
  const shark = await page.evaluate(() => { startLevel(7); const g = G, W = g.W;
    for (let z = 1; z < g.H - 1; z++) for (let x = 1; x < W - 1; x++) if (!g.solid[z * W + x] && g.floorT[z * W + x] === 39) { const e = g.enemies.find(q => q.alive && !q.boss); e.x = x + 0.5; e.z = z + 0.5; knockdown(e, [1, 0]); return { alive: e.alive, k: g.slamK, boss: G.boss.alive }; }
    return null; });
  expect(shark).toEqual({ alive: false, k: { shark: 1 }, boss: true });
  const glass = await page.evaluate(() => { startLevel(1); const g = G, i = g.glass.findIndex(v => v), e = g.enemies.find(q => q.alive && !q.boss);
    e.x = i % g.W + 0.5; e.z = Math.floor(i / g.W) + 0.5; const sc = g.score; knockdown(e, [0, 1]); return { alive: e.alive, k: g.slamK, paid: g.score - sc >= 300 }; });
  expect(glass).toEqual({ alive: false, k: { glass: 1 }, paid: true });
  const plain = await page.evaluate(() => { startLevel(0); const g = G, e = g.enemies.find(q => q.alive && q.body !== 'fat' && q.body !== 'big'); g.glass.fill(0); knockdown(e, [0, 1]); return { alive: e.alive, down: e.down > 0, slams: g.slams || 0 }; });
  expect(plain).toEqual({ alive: true, down: true, slams: 0 });
});

test('lex: the spare and finish buttons work without a keyboard (touch and mouse)', async ({ openGame }) => {
  test.setTimeout(180_000);
  const page = await openGame();
  await page.evaluate(() => { NOARRIVE = true; startLevel(7); killEnemy(G.boss, 'pistol', [0, 1]); });
  await expect(page.locator('#bSpare')).toBeVisible({ timeout: 30_000 });
  await page.locator('#bSpare').click();
  await expect.poll(() => page.evaluate(() => !G.mercy), { timeout: 30_000 }).toBe(true);
  expect(await page.evaluate(() => ({ alive: G.boss.alive, spared: !!G.boss.spared }))).toEqual({ alive: true, spared: true });
  await expect(page.locator('#bSpare')).toBeHidden();
  await page.evaluate(() => { startLevel(7); killEnemy(G.boss, 'pistol', [0, 1]); });
  await expect(page.locator('#bFinish')).toBeVisible({ timeout: 30_000 });
  await page.locator('#bFinish').click();
  await expect.poll(() => page.evaluate(() => !G.mercy), { timeout: 30_000 }).toBe(true);
  expect(await page.evaluate(() => ({ alive: G.boss.alive, fin: !!G.fin }))).toEqual({ alive: false, fin: true });
});

test('lex: finishing him plays the old finisher, and Act 3 reads what you chose', async ({ openGame }) => {
  test.setTimeout(180_000);
  const page = await openGame();
  await page.evaluate(() => { NOARRIVE = true; startLevel(7); killEnemy(G.boss, 'pistol', [0, 1]); });
  await page.keyboard.down('2');
  await expect.poll(() => page.evaluate(() => !G.mercy), { timeout: 30_000 }).toBe(true);
  await page.keyboard.up('2');
  expect(await page.evaluate(() => ({ alive: G.boss.alive, fin: !!G.fin }))).toEqual({ alive: false, fin: true });
  // Act 3: a spared Lex marks the wires; a dead Lex pays out his estate.
  const spared = await page.evaluate(() => { const p = myProg(); p.lexDead = 0; dlgObj(p, 'wflags').lex_spared = 1; startLevel(8); return { fate: lexFate(), tip: !!G.tip, score: G.score }; });
  expect(spared).toEqual({ fate: 'spared', tip: true, score: 0 });
  const dead = await page.evaluate(() => { const p = myProg(); p.lexDead = 1; delete dlgObj(p, 'wflags').lex_spared; startLevel(8); return { fate: lexFate(), tip: !!G.tip, score: G.score }; });
  expect(dead).toEqual({ fate: 'dead', tip: false, score: 2500 });
});
