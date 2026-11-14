const { test, expect } = require('./fixtures.cjs');

/* W14 missions: non-campaign records in nb86jobs.m, a fixture non-campaign job end to end, variants, the c7 payout split and Q-B restart */

test('missions: nb86jobs.m round-trips with unknown fields, and a malformed record blocks job saves', async ({ openGame }) => {
  const m = { zz: { done: 1, best: { '1.base': { g: 'A', t: 30, s: 900, c: 3, ch: 'don', d: 'easy' } }, extra: 'keep' }, later: { future: true } };
  const page = await openGame({ nb86jobs: { top: 2, sel: 1, best: {}, m, newer: 7 } });
  expect(await page.evaluate(() => { saveJobs(); const o = JSON.parse(localStorage.getItem('nb86jobs')); return { m: o.m, newer: o.newer, blocked: SAVE.blocked.has('nb86jobs') }; }))
    .toEqual({ m, newer: 7, blocked: false });
  const raw = JSON.stringify({ top: 1, m: { zz: { done: 1, best: 'nope' } } });
  const bad = await openGame({ nb86jobs: raw }, ['nb86jobs']);
  await expect(bad.locator('#saveWarning')).toBeVisible();
  expect(await bad.evaluate(() => { saveJobs(); return localStorage.getItem('nb86jobs'); })).toBe(raw);
});

test('missions: a non-campaign job unlocks, plays on its base map, pays without a cut or story flags and returns to the campaign job', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    const fade = fadeTo;
    try {
      fadeTo = () => true;
      MISSIONS.zz = { kind: 'bonus', name: 'TEST JOB', base: 0, stages: ['legacy'], start: 'legacy', unlock: { done: 'c0' }, rewards: [{ flag: 'zz_paid' }], rev: 2 };
      selIdx = 1; sessionReset(3);
      const p = myProg(); arm(); p.debt = 1000;
      const locked = missionUnlocked('zz', missionCtx());
      JOBS.best[0] = { g: 'B', t: 60, s: 1, c: 1, ch: 'money', d: 'easy' };
      const open = missionUnlocked('zz', missionCtx());
      VISIT = { debrief: null, next: 3, grade: null, take: 0, style: null };
      talkMcWey(); CHAT.done = true;
      const menu = $('dlJobs').textContent;
      $('dlJobs').querySelector('[data-mid="zz"]').click();
      const picked = { JOBPICK, NEXTJOB };
      startMission(JOBPICK);
      const started = { mission: MISSION, levelIdx, run: p.run.mission, ret: p.run.ret, var: p.run.var, sj: G.sj, hud: missionName(MISSION) };
      const resume = resumeRun();
      const w0 = p.wallet, top0 = JOBS.top;
      for (const e of G.enemies) e.alive = false;
      finishLevel(); pendingPerks = 0; const take = G.take; $('bNextLvl').click();
      return { locked, open, menu, picked, started, resume: { id: resume.id, st: resume.st }, paid: p.wallet - w0 === take && take > 0, debt: p.debt, top: JOBS.top === top0,
        flag: p.wflags.zz_paid, story: !!(p.sharkDead || p.boat), rec: Object.keys(JOBS.m.zz.best), visit: { next: VISIT.next, debrief: VISIT.debrief }, run: p.run || null,
        stored: JSON.parse(localStorage.getItem('nb86jobs')).m.zz.done };
    } finally { fadeTo = fade; }
  })).toEqual({ locked: false, open: true, menu: 'BONUS: TEST JOB', picked: { JOBPICK: 'zz', NEXTJOB: 3 },
    started: { mission: 'zz', levelIdx: 0, run: 'zz', ret: 3, var: 'base', sj: null, hud: 'TEST JOB' }, resume: { id: 'zz', st: 3 },
    paid: true, debt: 1000, top: true, flag: 1, story: false, rec: ['2.base'], visit: { next: 3, debrief: null }, run: null, stored: 1 });
});

test('missions: the club back-door variant follows the brief choice and sticks for the run; c7 records whether Lex died', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    const fade = fadeTo;
    try {
      fadeTo = () => true;
      selIdx = 0; const p = myProg(); arm();
      dlgObj(p, 'wflags').flamingo_back = 1;
      startLevel(1);
      const back = { v: G.variant, run: p.run.var, at: [G.player.x, G.player.z] };
      delete p.wflags.flamingo_back; G.player.alive = false; restart();
      const retry = G.variant;
      togglePause(); walkAway();
      startLevel(1);
      const fresh = G.variant;
      p.wflags.flamingo_back = 1; missionBriefReset('c1', p.wflags);
      startLevel(7);
      for (const e of G.enemies) if (!e.boss) e.alive = false;
      const req = { boss: G.clear.boss };
      G.clear = { boss: 'optional' }; update(0.016);
      const cleared = G.cleared;
      G.take = 100; payout();
      const spared = { spared: p.wflags.lex_spared, dead: p.lexDead || 0 };
      startLevel(7); for (const e of G.enemies) e.alive = false; G.take = 100; payout();
      return { back, retry, fresh, reset: p.wflags.flamingo_back || 0, req, cleared, spared, killed: { spared: p.wflags.lex_spared || 0, dead: p.lexDead } };
    } finally { fadeTo = fade; }
  })).toEqual({ back: { v: 'back', run: 'back', at: [21.5, 15.5] }, retry: 'back', fresh: 'base', reset: 0, req: { boss: 'required' }, cleared: true,
    spared: { spared: 1, dead: 0 }, killed: { spared: 0, dead: 1 } });
});

test('missions: restart from the beginning appears past the first stage and rewinds to the entry kit', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    const fade = fadeTo;
    try {
      fadeTo = () => true;
      MISSIONS.c0.stages.push('yard');
      const def = { name: 'W14 GRID', wall: 1, floor: 1, map: ['#########', '#P......#', '#.......#', '#########'] };
      MISSIONS.c0.stageDefs = {
        legacy: { id: 'legacy', kind: 'grid', rev: 1, def, arrivals: { back: { at: [2.5, 2.5] } }, stairs: [{ id: 'up', to: 'yard', at: [7.5, 3.5], arrive: 'up' }] },
        yard: { id: 'yard', kind: 'grid', rev: 1, def, arrivals: { up: { at: [2.5, 2.5] } }, stairs: [{ id: 'back', to: 'legacy', at: [7.5, 3.5], arrive: 'back' }] }
      };
      selIdx = 1; startLevel(0);
      const entry = G.player.weapon ? G.player.weapon.type : null;
      togglePause(); const first = $('bPRestartJob').style.display; togglePause();
      G.player.weapon = { type: 'shotgun', ammo: 5 }; enterStage('yard', 'up');
      G.player.alive = false; pendingPerks = 0; showDead();
      const shown = $('bDeadRestartJob').style.display;
      G.player.alive = false; restart();
      const retry = { stage: myProg().run.stage, weapon: G.player.weapon && G.player.weapon.type };
      togglePause(); const paused = $('bPRestartJob').style.display;
      Object.assign(myProg().run, { stageHp: 40, st: { w1: 1 } });
      $('bPRestartJob').click();
      return { first, shown, retry, paused, stage: myProg().run.stage, w1: [myProg().run.st.current, Object.keys(myProg().run.st.states)], weapon: G.player.weapon ? G.player.weapon.type : null, entry };
    } finally { fadeTo = fade; }
  })).toEqual({ first: 'none', shown: '', retry: { stage: 'yard', weapon: 'shotgun' }, paused: '', stage: 'legacy', w1: ['legacy', ['legacy']], weapon: null, entry: null });
});

test('missions: after a job, leaving home by the door goes to McWey for the debrief, never back to the finished job (P0 loop)', async ({ openGame }) => {
  // a pre-MISSIONS save: jobs record and progress with no run, no wflags and no nb86jobs.m
  const page = await openGame({ nb86jobs: { top: 1, sel: 1, best: { 0: { g: 'B', t: 60, s: 1, c: 1, ch: 'money', d: 'easy' } } }, nb86prog: { money: { lvl: 2, xp: 0, perks: {}, debt: 9000, wallet: 100 } } });
  expect(await page.evaluate(() => {
    const fade = fadeTo, out = [];
    try {
      fadeTo = f => { f(); return true; };
      selIdx = CHARS.findIndex(c => c.id === 'money'); sessionReset(Math.min(JOBS.sel, JOBS.top)); NEXTJOB = VISIT.next;
      for (const lvl of [1, 2]) {
        startLevel(NEXTJOB);
        if (G.stageManaged) { enterStage('stair', 'bottom'); enterStage('pent', 'stairs'); } // floor 2 finishes in the penthouse
        for (const e of G.enemies) e.alive = false;
        finishLevel(); pendingPerks = 0; $('bNextLvl').click();
        const home = HUBMODE;
        onHubTrigger('leave');
        // the door asks where to; McWey still insists here (first meeting, then a new act), so the job button sends you to him
        const viaDoor = { mode: HUBMODE, state, label: $('bCarJob').textContent.startsWith('SEE McWEY') };
        closeCarMenu();
        // the car menu offers McWey, not the finished job, while the debrief is still owed
        loadHub('drive', 'parked'); openCarMenu();
        const label = $('bCarJob').textContent;
        $('bCarJob').click(); seqSkip(); // driving off from McWey's kerb is a skippable scene
        const viaCar = { mode: HUBMODE, cine: !!G.cine };
        talkMcWey(); CHAT.done = true; chatGo();
        loadHub('home0', 'home'); onHubTrigger('leave'); seqSkip(); openCarMenu();
        out.push({ lvl, home, viaDoor, label, viaCar, next: NEXTJOB, after: { mode: HUBMODE, label: $('bCarJob').textContent.startsWith('NEXT JOB: ' + LEVELS[lvl + 1].name) } });
        closeCarMenu();
      }
      return out;
    } finally { fadeTo = fade; }
  })).toEqual([1, 2].map(lvl => ({ lvl, home: 'home', viaDoor: { mode: 'home', state: 'carmenu', label: true }, label: expect.stringMatching(/^SEE McWEY/), viaCar: { mode: 'in', cine: true },
    next: lvl + 1, after: { mode: 'home', label: true } })));
});

test('travel: from home or a shop you can drive straight to the next job, which opens on its objective card', async ({ openGame }) => {
  const page = await openGame({ nb86jobs: { top: 2, sel: 1, best: {} }, nb86prog: { money: { lvl: 2, xp: 0, perks: {}, debt: 9000, wallet: 100, seen: { loan: 1 } } } });
  expect(await page.evaluate(() => {
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      selIdx = CHARS.findIndex(c => c.id === 'money'); sessionReset(0); NEXTJOB = VISIT.next;
      startLevel(NEXTJOB); for (const e of G.enemies) e.alive = false; finishLevel(); pendingPerks = 0; $('bNextLvl').click();
      // home: the door opens the destination menu, with the next job, McWey and the shops, and no "back to your place"
      onHubTrigger('leave');
      const vis = id => $(id).style.display !== 'none';
      out.home = { state, job: $('bCarJob').textContent.split('(')[0].trim(), mcwey: vis('bCarMcWey'), shop: vis('bCarShop'), home: vis('bCarHome') };
      closeCarMenu(); out.closed = [state, G.trigLock];
      // the gun shop: same menu, and the job button starts the next floor straight away, behind its objective card
      loadHub('bunker'); openCarMenu(); $('bCarJob').click(); seqSkip();
      out.job = { state, level: levelIdx, hub: !!G.def.hub, card: $('sObj').classList.contains('on'), name: $('ojName').textContent, list: $('ojList').children.length > 1 };
      OBJCARD.t = 0; objCardGo(); out.go = [state, $('sObj').classList.contains('on'), mcDue()];
      // the chopper is parked for now: trips stay by car
      myProg().heli = 1; out.heli = rideHeli();
      return out;
    } finally { fadeTo = fade; }
  })).toEqual({ home: { state: 'carmenu', job: 'NEXT JOB: ' + 'CLUB FLAMINGO', mcwey: true, shop: true, home: false }, closed: ['play', true],
    job: { state: 'objcard', level: 1, hub: false, card: true, name: 'CLUB FLAMINGO', list: true }, go: ['play', false, false], heli: false });
});

test('free travel: PLAY and sleeping start you at home, McWey only for a new act; shops in between keep the next job', async ({ openGame }) => {
  const page = await openGame({ nb86jobs: { top: 3, sel: 1, best: {} }, nb86prog: { money: { lvl: 2, xp: 0, perks: {}, debt: 9000, wallet: 100, seen: { loan: 1 } } } });
  await page.locator('#bStart').click();
  await page.evaluate(() => { selIdx = CHARS.findIndex(c => c.id === 'money'); updateSelect(); });
  expect(await page.evaluate(() => {
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      // a regular job: PLAY wakes you at home with the job already taken, no drive to McWey
      $('bPlay').click(); out.play = { mode: HUBMODE, home: G.def === HUBS.home0, cine: !!G.cine, next: NEXTJOB, due: mcDue() };
      // go shopping first, then come home and sleep: still home, and the job is still waiting
      loadHub('bunker'); openCarMenu(); $('bCarHome').click(); seqSkip();
      G.slots = G.slots || []; myProg().mornKey = arm().jobs; goSleep();
      out.slept = { state, mode: HUBMODE, cine: !!G.cine };
      onHubTrigger('leave'); out.menu = $('bCarJob').textContent.startsWith('NEXT JOB: CLUB FLAMINGO'); closeCarMenu();
      // the start of a new act still goes through McWey's office
      JOBS.sel = 3; $('bPlay').click(); out.act = { mode: HUBMODE, cine: !!G.cine };
      return out;
    } finally { fadeTo = fade; }
  })).toEqual({ play: { mode: 'home', home: true, cine: false, next: 1, due: false }, slept: { state: 'play', mode: 'home', cine: false }, menu: true, act: { mode: 'in', cine: true } });
});

test('bonus jobs: Pesos follows you once found, the kid must be reached in time, the warehouse pays for no alarm, Lex shows every guard', async ({ openGame }) => {
  test.setTimeout(180_000);
  const page = await openGame();
  const r = await page.evaluate(() => { NOARRIVE = true; const fade = fadeTo; fadeTo = () => true; const out = {};
    try {
      selIdx = 0; sessionReset(3); const p = myProg(); arm();
      out.ids = ['b_pesos', 'b_kid', 'b_ghost', 'b_lex'].every(id => MISSIONS[id] && MISSIONS[id].kind !== 'campaign');
      out.lexLocked = missionUnlocked('b_lex', missionCtx());
      startMission('b_pesos'); out.pesos = { twist: G.twist, obj: G.obj.label, lvl: levelIdx };
      G.player.x = G.pesos.x; G.player.z = G.pesos.z; updateTwist(0.016); out.found = G.pesos.found && G.obj.done;
      startMission('b_kid'); out.kid = { obj: G.obj.label, t: G.kidT }; G.player.hp = 99; G.kidT = 0.01; updateTwist(0.05); out.late = !G.player.alive;
      startMission('b_ghost'); const e = G.enemies.find(q => q.alive && !q.boss); spot(e); out.alarm = G.alarm;
      startMission('b_lex'); out.reveal = G.enemies.every(q => q.pvis);
      NIGHTMOD = 'glass'; startMission('b_pesos'); out.noNight = G.mod; NIGHTMOD = null;
    } finally { fadeTo = fade; }
    return out; });
  expect(r).toEqual({ ids: true, lexLocked: false, pesos: { twist: 'pesos', obj: 'FIND PESOS', lvl: 0 }, found: true, kid: { obj: 'REACH THE KID', t: 60 }, late: true, alarm: 1, reveal: true, noNight: null });
});

test('arena: waves keep coming, kills pay arena cash, guns can be bought between waves and the car cashes out', async ({ openGame }) => {
  test.setTimeout(120_000);
  const page = await openGame();
  const r = await page.evaluate(() => { NOARRIVE = true; const fade = fadeTo; fadeTo = () => true; const out = {};
    try {
      selIdx = 0; sessionReset(3); arm(); startMission('b_arena'); const g = G, p = g.player;
      out.start = { twist: g.twist, wave: g.arena.wave };
      for (const e of g.enemies) if (e.alive) { e.alive = false; addKillScore(e, 'fists'); }
      updateTwist(0.016); out.brk = { cleared: g.cleared, brk: g.arena.brk > 0, offers: g.items.filter(it => it.price).length };
      const it = g.items.find(q => q.price); g.arena.cash = 0; out.poor = arenaBuy(p, it); g.arena.cash = 99999; out.buy = arenaBuy(p, it) === false && it.price === 0;
      const n0 = g.enemies.length; updateTwist(ARENA_BRK + 0.1); out.wave2 = { wave: g.arena.wave, more: g.enemies.length > n0, cleared: g.cleared };
    } finally { fadeTo = fade; }
    return out; });
  expect(r).toEqual({ start: { twist: 'arena', wave: 1 }, brk: { cleared: true, brk: true, offers: 3 }, poor: true, buy: true, wave2: { wave: 2, more: true, cleared: false } });
});

test('night shift: the three bosses come one after another and the job clears after Kade', async ({ openGame }) => {
  test.setTimeout(120_000);
  const page = await openGame();
  const r = await page.evaluate(() => { NOARRIVE = true; const fade = fadeTo; fadeTo = () => true; const out = { names: [] };
    try {
      selIdx = 0; sessionReset(3); arm(); startMission('b_rush'); const g = G; g.player.hp = 99;
      out.empty = g.enemies.length === 0;
      for (let k = 0; k < 3; k++) { updateTwist(4); const b = g.boss; out.names.push(!!b && b.alive ? (b.lex ? 'lex' : b.look === LEVELS[10].boss ? 'kade' : 'boss') : null); if (b) { b.alive = false; } updateTwist(0.01); }
      out.done = g.obj.done;
    } finally { fadeTo = fade; }
    return out; });
  expect(r.empty).toBe(true);
  expect(r.names.every(Boolean)).toBe(true);
  expect(r.names[1]).toBe('lex');
  expect(r.done).toBe(true);
});
