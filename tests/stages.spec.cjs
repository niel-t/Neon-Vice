const { test, expect } = require('./fixtures.cjs');

// Injected infrastructure only: shipped missions still use their legacy maps.
const registration = `{
 const def={name:'GRID BRIDGE',wall:1,floor:1,map:['#########','#P..D..1#','#....%..#','#..g....#','#########']};
 MISSIONS.c0.stages=['legacy','yard']; MISSIONS.c0.start='legacy';
 MISSIONS.c0.stageDefs={
  legacy:{id:'legacy',kind:'grid',rev:1,def,arrivals:{back:{at:[2.5,3.5],dir:0}},stairs:[{id:'up',to:'yard',at:[7.5,4.5],arrive:'up'}]},
  yard:{id:'yard',kind:'grid',rev:1,def,arrivals:{up:{at:[2.5,3.5],dir:0}},stairs:[{id:'down',to:'legacy',at:[7.5,4.5],arrive:'back'}]}
 };
}`;

async function inject(page) {
  await page.evaluate(registration);
  // Definitions must also exist before save normalization on a real browser reload.
  await page.route('**/missions.js', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}\n${registration}` });
  });
}

test('stages: fresh worlds carry in-hand kit, fractional HP and armour; returning retains world state and mission totals', async ({ openGame }) => {
  const page = await openGame(); await inject(page);
  expect(await page.evaluate(() => {
    selIdx = 0; arm(); myProg().kit.armour = { type: Object.keys(ARMOUR)[0], plates: 2 };
    startLevel(0); const old = G, oldPlayer = G.player;
    G.player.weapon = { type: 'shotgun', ammo: 5 }; G.player.hp = 2.75; G.player.armor = 1; G.player.kitPlates = 2;
    G.enemies[0].alive = false; G.enemies[0].hp = 0; G.enemies[0].pers = 'careful';
    const look = JSON.stringify(G.enemies[0].look); G.doors[0].th = .8; G.items = [];
    const pane = G.panes[0]; hitGlass(pane.ix, pane.iz);
    G.kills = 1; G.score = 700; G.time = 12.5; G.shots = 4; G.kb.shotgun = 1;
    let saves = 0, stages = 0, loads = 0; const writer = saveProg, hook = runStage, loadout = applyLoadout;
    saveProg = (...a) => { saves++; return writer(...a); }; runStage = (...a) => { stages++; return hook(...a); }; applyLoadout = (...a) => { loads++; return loadout(...a); };
    try {
      const up = enterStage('yard', 'up'), next = G;
      const carry = [G.player.weapon.type, G.player.weapon.ammo, G.player.hp, G.player.armor];
      const counters = [G.kills, G.score, G.time, G.shots];
      const back = enterStage('legacy', 'back');
      return { up, back, fresh: G !== old && G !== next && G.player !== oldPlayer, carry, counters,
        retained: [G.enemies[0].alive, G.enemies[0].hp, G.enemies[0].pers, JSON.stringify(G.enemies[0].look) === look, G.doors[0].th, G.items.length, G.panes.length],
        totals: [G.kills, G.score, G.time, G.shots, G.kb.shotgun], saves, stages, loads, stage: myProg().run.stage,
        ephemeral: [G.bullets.length, G.parts.length, G.nades.length], validMapIndex: levelIdx };
    } finally { saveProg = writer; runStage = hook; applyLoadout = loadout; state = 'pause'; }
  })).toEqual({ up: true, back: true, fresh: true, carry: ['shotgun', 5, 2.75, 1], counters: [1, 700, 12.5, 4],
    retained: [false, 0, 'careful', true, .8, 0, 0], totals: [1, 700, 12.5, 4, 1], saves: 2, stages: 2, loads: 2,
    stage: 'legacy', ephemeral: [0, 0, 0], validMapIndex: 0 });
});

test('stages: death and reload retry ENTRY world/kit/HP, while mission restart and walking away restore entry kit', async ({ openGame }) => {
  const page = await openGame(); await inject(page);
  expect(await page.evaluate(() => {
    selIdx = 1; startLevel(0);
    G.player.weapon = { type: 'shotgun', ammo: 5 }; G.player.hp = 2.25;
    enterStage('yard', 'up'); G.items = []; G.enemies[0].alive = false; G.player.weapon.ammo = 1; G.player.hp = .5;
    G.player.alive = false; state = 'dead'; restart(); state = 'pause';
    return { stage: G.sid, kit: G.player.weapon, hp: G.player.hp, enemies: G.enemies[0].alive, items: G.items.length, at: [G.player.x, G.player.z] };
  })).toEqual({ stage: 'yard', kit: { type: 'shotgun', ammo: 5 }, hp: 2.25, enemies: true, items: 1, at: [2.5, 3.5] });
  await page.reload();
  expect(await page.evaluate(() => {
    selIdx = 1; startMission('c0'); state = 'pause';
    return { stage: G.sid, hp: G.player.hp, ammo: G.player.weapon.ammo, alive: G.enemies[0].alive, items: G.items.length };
  })).toEqual({ stage: 'yard', hp: 2.25, ammo: 5, alive: true, items: 1 });
  expect(await page.evaluate(() => {
    runRestartMission(); const cleared = !('st' in myProg().run) && !('stageHp' in myProg().run);
    restart(); const restarted = [G.sid, G.player.weapon, myProg().run.st.current, cleared];
    G.player.weapon = { type: 'shotgun', ammo: 3 }; enterStage('yard', 'up');
    state = 'pause'; const fade = fadeTo; fadeTo = () => true;
    try { walkAway(); return { restarted, run: myProg().run || null, entryGun: myProg().kit.guns[0], entryMelee: myProg().kit.melee }; }
    finally { fadeTo = fade; }
  })).toEqual({ restarted: ['legacy', null, 'legacy', true], run: null, entryGun: null, entryMelee: null });
});

test('stages: rejected arrivals, builds and snapshots preserve G, run, storage and release detached GPU batches', async ({ openGame }) => {
  const page = await openGame(); await inject(page);
  expect(await page.evaluate(() => {
    selIdx = 1; startLevel(0); state = 'pause';
    const g = G, r = myProg().run, raw = localStorage.getItem('nb86prog'), serialized = JSON.stringify(r), def = MISSIONS.c0.stageDefs.yard.def;
    const checks = [], unchanged = () => G === g && myProg().run === r && JSON.stringify(r) === serialized && localStorage.getItem('nb86prog') === raw;
    const manager = g.stageRun, prep = manager.prepare('yard');
    const replacement = WORLD.stageRun({ id: 'c0', stages: ['legacy', 'yard'], start: 'legacy' }, sid => {
      const { def, ...d } = MISSIONS.c0.stageDefs[sid];
      return sid === 'yard' ? { ...d, arrivals: { up: { at: [0, 0] } } } : d;
    });
    const token = replacement.prepare('legacy'), entry = stageCapture(g); replacement.commit(token, null, entry);
    g.stageRun = replacement; checks.push(!enterStage('yard', 'up') && unchanged()); g.stageRun = manager;
    let created = 0, deleted = 0; const create = gl.createBuffer.bind(gl), remove = gl.deleteBuffer.bind(gl), build = buildStatic;
    gl.createBuffer = () => { created++; return create(); }; gl.deleteBuffer = b => { deleted++; remove(b); };
    buildStatic = () => { throw new Error('injected detached build failure'); };
    try { checks.push(!enterStage('yard', 'up') && unchanged() && created === deleted && created > 0); }
    finally { gl.createBuffer = create; gl.deleteBuffer = remove; buildStatic = build; }
    g.enemies[0].look.bad = Infinity; checks.push(!enterStage('yard', 'up') && unchanged()); delete g.enemies[0].look.bad;
    g.enemies[0].alive = 'invalid'; checks.push(!enterStage('yard', 'up') && unchanged()); g.enemies[0].alive = true;
    MISSIONS.c0.stageDefs.yard.def = { ...def, map: ['###', '#.#', '###'] };
    checks.push(!enterStage('yard', 'up') && unchanged()); MISSIONS.c0.stageDefs.yard.def = def;
    return checks;
  })).toEqual([true, true, true, true, true]);
});

test('stages: stair fade freezes simulation, refuses dead players, checks ownership and latches retries; finish remains gated', async ({ openGame }) => {
  const page = await openGame(); await inject(page);
  expect(await page.evaluate(() => {
    selIdx = 1; startLevel(0); const original = G, fade = fadeTo; let callback, count = 0;
    fadeTo = fn => { callback = fn; count++; return true; };
    try {
      Object.assign(G.player, { x: 7.5, z: 4.5, alive: false }); update(.1); const dead = count === 0;
      G.player.alive = true; G.player.hp = 2; update(.1);
      const frozenState = state, before = G.time; update(2); const frozen = G.time === before;
      callback(); const arrived = G.sid;
      Object.assign(G.player, { x: 7.5, z: 4.5 }); update(.1); const incoming = G;
      MISSION = 'c1'; callback(); const stale = G === incoming; MISSION = 'c0'; state = 'play';
      const countBefore = count; update(.1); const latched = count === countBefore;
      G.player.x = 4; update(.1); G.player.x = 7.5; update(.1); callback();
      const returned = G !== original && G.sid === 'legacy';
      const total = totalScore; finishLevel(); const gated = state === 'play' && totalScore === total && !G.done;
      fadeTo = () => false; G.player.x = 4; update(.1); G.player.x = 7.5; update(.1);
      return { dead, frozenState, frozen, arrived, stale, latched, returned, gated, refused: state === 'play' };
    } finally { fadeTo = fade; state = 'pause'; }
  })).toEqual({ dead: true, frozenState: 'stagefade', frozen: true, arrived: 'yard', stale: true, latched: true, returned: true, gated: true, refused: true });
});

test('stages: malformed/revision-drift saves and unsupported plans never rewrite storage or fall back to legacy', async ({ openGame }) => {
  const page = await openGame(); await inject(page);
  expect(await page.evaluate(() => {
    selIdx = 1; startLevel(0); state = 'pause'; const g = G, r = myProg().run;
    const valid = kitClone(r.st), results = []; r.st = kitClone(valid);
    const rejects = () => { saveProg(); const raw = localStorage.getItem('nb86prog'), before = JSON.stringify(r); const ok = startMission('c0'); return ok === false && G === g && JSON.stringify(r) === before && localStorage.getItem('nb86prog') === raw; };
    r.st.v = 99; results.push(rejects()); r.st = kitClone(valid);
    r.st.states.legacy.rev = 2; results.push(rejects()); r.st = kitClone(valid);
    r.st.entry.data.player.x = null; results.push(rejects()); r.st = kitClone(valid);
    delete r.stageHp; startMission('c0'); const historical = G.player.hp === G.player.maxhp; state = 'pause';
    const fresh = G, raw = localStorage.getItem('nb86prog'), before = JSON.stringify(r);
    MISSIONS.c0.stageDefs.yard.kind = 'plan';
    const noPlan = !enterStage('yard', 'up') && G === fresh && JSON.stringify(r) === before && localStorage.getItem('nb86prog') === raw;
    MISSIONS.c0.stageDefs.yard.kind = 'grid'; delete MISSIONS.c0.stageDefs.yard;
    const noMissing = !startMission('c0') && G === fresh && JSON.stringify(r) === before && localStorage.getItem('nb86prog') === raw;
    return { results, historical, noPlan, noMissing };
  })).toEqual({ results: [true, true, true], historical: true, noPlan: true, noMissing: true });
});

test('stages: sparse cell durability and door locks survive real grid returns, including destruction and Infinity', async ({ openGame }) => {
  const page = await openGame(); await inject(page);
  expect(await page.evaluate(() => {
    selIdx = 1; startLevel(0); const first = G, i = G.W + 1, infinite = G.W + 2;
    const cell = index => G.wst.cells[G.wst.panels[G.wst.legacyPanel[index]].c0];
    cell(i).hp = 600; cell(infinite).hp = Infinity;
    WORLD.damage(G.wst, G.wst.legacyPanel[i], G.wst.panels[G.wst.legacyPanel[i]].c0, 100, 'bullet');
    Object.assign(G.doors[0], { build: 'door_hollow', locked: true, breached: false });
    WORLD.damageLock(G.wst, G.doors[0], 100);
    const up = enterStage('yard', 'up');
    const sparse = myProg().run.st.states.legacy.data.durability;
    const back = enterStage('legacy', 'back');
    const retained = [cell(i).hp, cell(i).active, cell(infinite).hp === Infinity, G.doors[0].build, G.doors[0].locked, G.doors[0].lockHp, G.doors[0].breached];
    const move = (id, arrival) => { if(!enterStage(id, arrival))throw new Error($('banner').textContent); };
    WORLD.damage(G.wst, G.wst.legacyPanel[i], G.wst.panels[G.wst.legacyPanel[i]].c0, 500, 'blast');
    WORLD.damageLock(G.wst, G.doors[0], 700);
    move('yard', 'up'); move('legacy', 'back');
    const breached = [cell(i).hp, cell(i).active, G.solid[i], G.doors[0].build, G.doors[0].locked, G.doors[0].lockHp, G.doors[0].breached];
    Object.assign(G.doors[0], { build: 'door_vault', locked: true, breached: false, lockHp: Infinity });
    move('yard', 'up'); const lockTag = myProg().run.st.states.legacy.data.doors[0].lockHp;
    move('legacy', 'back'); state = 'pause';
    return { up, back, fresh: G !== first, sparse, retained, breached, lockTag,
      indestructibleLock: G.doors[0].lockHp === Infinity && G.doors[0].locked,
      jsonSafe: JSON.stringify(myProg().run.st).includes('indestructible') };
  })).toEqual({ up: true, back: true, fresh: true, sparse: [{ i: 12, hp: 500 }, { i: 13, hp: 'indestructible' }],
    retained: [500, true, true, 'door_hollow', true, 700, false],
    breached: [0, false, 0, 'door_hollow', false, 0, true], lockTag: 'indestructible', indestructibleLock: true, jsonSafe: true });
});

test('stages: durability and locks retry their ENTRY values after death and browser reload', async ({ openGame }) => {
  const page = await openGame(); await inject(page);
  expect(await page.evaluate(() => {
    selIdx = 1; startLevel(0); const i = G.W + 1, cell = () => G.wst.cells[G.wst.panels[G.wst.legacyPanel[i]].c0];
    cell().hp = 600;
    WORLD.damage(G.wst, G.wst.legacyPanel[i], G.wst.panels[G.wst.legacyPanel[i]].c0, 100, 'bullet');
    Object.assign(G.doors[0], { build: 'door_hollow', locked: true, breached: false }); WORLD.damageLock(G.wst, G.doors[0], 100);
    enterStage('yard', 'up'); enterStage('legacy', 'back'); const entry = G;
    WORLD.damage(G.wst, G.wst.legacyPanel[i], G.wst.panels[G.wst.legacyPanel[i]].c0, 200, 'melee');
    WORLD.damageLock(G.wst, G.doors[0], 700);
    G.player.alive = false; state = 'dead'; restart(); state = 'pause';
    return { fresh: G !== entry, hp: cell().hp, active: cell().active, door: [G.doors[0].build, G.doors[0].locked, G.doors[0].lockHp, G.doors[0].breached] };
  })).toEqual({ fresh: true, hp: 500, active: true, door: ['door_hollow', true, 700, false] });
  await page.reload();
  expect(await page.evaluate(() => {
    selIdx = 1; startMission('c0'); state = 'pause'; const i = G.W + 1;
    return { hp: G.wst.cells[G.wst.panels[G.wst.legacyPanel[i]].c0].hp, door: [G.doors[0].build, G.doors[0].locked, G.doors[0].lockHp, G.doors[0].breached] };
  })).toEqual({ hp: 500, door: ['door_hollow', true, 700, false] });
});

test('stages: malformed sparse durability and door checkpoints reject atomically without rewriting saves', async ({ openGame }) => {
  const page = await openGame(); await inject(page);
  expect(await page.evaluate(() => {
    selIdx = 1; startLevel(0); state = 'pause'; const g = G, r = myProg().run, valid = kitClone(r.st), i = G.W + 1;
    const bad = [
      [{ i, hp: 500 }, { i, hp: 400 }], [{ i: -1, hp: 500 }], [{ i: g.W * g.H, hp: 500 }],
      [{ i, hp: null }], [{ i, hp: -1 }], [{ i, hp: 'Infinity' }], [{ i, hp: 0 }],
      [{ i, hp: 500 }, { i: i + 1, hp: 'invalid' }], [{ i, hp: 500, unknown: true }], null
    ];
    const rejected = () => { saveProg(); const raw = localStorage.getItem('nb86prog'), before = JSON.stringify(r);
      return !startMission('c0') && G === g && JSON.stringify(r) === before && localStorage.getItem('nb86prog') === raw &&
        g.wst.cells[g.wst.panels[g.wst.legacyPanel[i]].c0].hp === null; };
    const results = bad.map(sparse => { r.st = kitClone(valid); r.st.entry.data.durability = sparse; return rejected(); });
    for(const door of [
      { i: 1, build: 'door_hollow' }, { build: 'unknown' }, { build: 'door_hollow', lockHp: 'Infinity' },
      { build: 'door_hollow', lockHp: 0, breached: true, locked: true }, { build: 'door_hollow', locked: 'yes' }
    ]){r.st = kitClone(valid); Object.assign(r.st.entry.data.doors[0], door); results.push(rejected());}
    r.st = kitClone(valid); delete r.st.entry.data.durability; delete r.st.states.legacy.data.durability;
    const historical = startMission('c0'); state = 'pause';
    return { results, historical };
  })).toEqual({ results: Array(15).fill(true), historical: true });
});

test('stages: exactly one runStage save sees prospective envelope and HP; storage failure remains visible', async ({ openGame }) => {
  const page = await openGame({}, ['nb86prog']); await inject(page);
  expect(await page.evaluate(() => {
    selIdx = 1; startLevel(0); G.player.hp = 2.125; G.player.weapon = { type: 'shotgun', ammo: 5 };
    const previous = G, raw = localStorage.getItem('nb86prog'), writer = saveProg, checkpoint = runStage, store = Storage.prototype.setItem;
    let saves = 0, checkpoints = 0, prepared = false, savedTogether = false;
    runStage = id => {
      checkpoints++; const r = myProg().run;
      prepared = G === previous && r.st.current === id && r.stageHp === 2.125;
      return checkpoint(id);
    };
    saveProg = () => {
      saves++; const r = myProg().run;
      savedTogether = r.stage === 'yard' && r.st.current === 'yard' && r.stageHp === 2.125 && r.stageKit.guns[r.stageKit.active].mag === 5;
      return writer();
    };
    Storage.prototype.setItem = function(key, value) {
      if(key === 'nb86prog')throw new DOMException('Injected quota failure', 'QuotaExceededError');
      return store.call(this, key, value);
    };
    try {
      const activated = enterStage('yard', 'up'); state = 'pause';
      return { activated, saves, checkpoints, prepared, savedTogether, unchangedDisk: localStorage.getItem('nb86prog') === raw,
        visibleFailure: SAVE.errors.has('nb86prog'), current: G.sid };
    } finally { saveProg = writer; runStage = checkpoint; Storage.prototype.setItem = store; }
  })).toEqual({ activated: true, saves: 1, checkpoints: 1, prepared: true, savedTogether: true, unchangedDisk: true, visibleFailure: true, current: 'yard' });
  await expect(page.locator('#saveWarning')).toBeVisible();
});
