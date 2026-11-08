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
      selIdx = 1; startLevel(0);
      const entry = G.player.weapon ? G.player.weapon.type : null;
      togglePause(); const first = $('bPRestartJob').style.display; togglePause();
      G.player.weapon = { type: 'shotgun', ammo: 5 }; runStage('yard');
      G.player.alive = false; pendingPerks = 0; showDead();
      const shown = $('bDeadRestartJob').style.display;
      G.player.alive = false; restart();
      const retry = { stage: myProg().run.stage, weapon: G.player.weapon && G.player.weapon.type };
      togglePause(); const paused = $('bPRestartJob').style.display;
      Object.assign(myProg().run, { stageHp: 40, st: { w1: 1 } });
      $('bPRestartJob').click();
      return { first, shown, retry, paused, stage: myProg().run.stage, w1: [myProg().run.stageHp, myProg().run.st], weapon: G.player.weapon ? G.player.weapon.type : null, entry };
    } finally { fadeTo = fade; }
  })).toEqual({ first: 'none', shown: '', retry: { stage: 'yard', weapon: 'shotgun' }, paused: '', stage: 'legacy', w1: [undefined, undefined], weapon: null, entry: null });
});
