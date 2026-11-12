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
  await expect.poll(() => page.evaluate(() => state === 'play' && G.def === LEVELS[0] && !fading)).toBe(true);
  const x = await page.evaluate(() => G.player.x);
  await page.keyboard.down('d');
  try { await expect.poll(() => page.evaluate(() => G.player.x)).toBeGreaterThan(x + 0.5); }
  finally { await page.keyboard.up('d'); }
  await expect.poll(() => page.evaluate(() => G.time)).toBeGreaterThan(0.2);
  expect(await page.evaluate(() => G.player.alive && Number.isFinite(G.freeze) && G.freeze <= 0)).toBe(true);
  await progressing(page);
});

test('integration: existing startLevel loads all eight floors and advances real simulation', async ({ openGame }) => {
  const page = await openGame();
  const data = gameData();
  expect(await page.evaluate(() => LEVEL_TRACKS.every(list => list.every(track => !!TRACKS[track])))).toBe(true);
  for (let i = 0; i < data.LEVELS.length; i++) {
    const expected = expectedMap(data.LEVELS[i], data);
    // Floor 2 is a building: startLevel(2) begins on the lobby stage (missions.js), not on the LEVELS[2] map.
    if (i === 2) Object.assign(expected, { enemies: 7, items: 3, player: [[13.5, 12.5]], car: [[23.5, 12.5]] });
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
  for (let i = 0; i < 8; i++) {
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
    .toEqual({ wallet: 321, top: 7, sel: 7, grade: 'A', custom: 'preserve' });
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
  expect(await bounds.evaluate(() => [JOBS.top, JOBS.sel])).toEqual([7, 0]);
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
  expect(await page.evaluate(() => { const f = fadeTo; fadeTo = () => true; try { togglePause(); walkAway(); } finally { fadeTo = f; }
    const s = JSON.parse(localStorage.getItem('nb86prog')).money; return { run: s.run || null, kit: s.kit }; }))
    .toEqual({ run: null, kit: entry });
});
