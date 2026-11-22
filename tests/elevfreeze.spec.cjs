const { test, expect } = require('./fixtures.cjs');

// Riding the Seabreeze elevator down to Kade Tower froze in the lift: a Kade Tower run saved partway up, from before the floor's map
// changed (plain stairs bumped the stage revisions), was refused on every resume, and a refusal from inside the elevator left you there.
test('elevator: a refused load (a stale saved run, or any refusal) never strands you in the lift', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const toHome = () => { state = 'play'; loadHub('home1', 'home'); if (G.seq) seqSkip(); state = 'play'; G.trigLock = false; };
    selIdx = 0; sessionReset(10); const p = myProg(); arm(); p.homes = [0, 1, 2]; p.home = 1; p.seen = p.seen || {}; p.seen.loan = 1; VISIT.next = 10; NEXTJOB = 10;
    // walk into Kade Tower and up to the steel stairs, then quit with the run saved there
    state = 'play'; takeNextJob(); startLevel(10); state = 'play';
    const o = { up: enterGridStage('stair', 'bottom') && G.sid };
    $('bQuit').click();
    // the floor's map changes in an update: the saved checkpoint no longer fits
    MISSIONS.c10.stageDefs.stair.rev++; MISSIONS.c10.stageDefs.site.rev++;
    toHome(); onHubTrigger('leave'); $('bCarJob').click();
    o.ride = state === 'carmenu' ? 'menu' : 'elev';
    for (let i = 0; i < 40 && state === 'elev' || fading; i++) await wait(250);
    await wait(500);
    // the save is left as it was (stage saves are never rewritten on a refusal), and you are back in your corridor with the reason
    o.stale = [state, G.def === HUBS.home1, myProg().run && myProg().run.stage, document.getElementById('banner').textContent.includes('revision')];
    toHome();
    fadeTo(() => enterElevator(true, { from: 3, to: 1, title: 'THE SEABREEZE', dur: 0.3, then: () => stageFailure(new Error('Test refusal')) }));
    for (let i = 0; i < 40 && (state !== 'elev' || fading); i++) await wait(100);
    for (let i = 0; i < 60 && state === 'elev'; i++) await wait(100);
    await wait(500);
    o.refused = [state, G.def === HUBS.home1, document.getElementById('banner').textContent.includes('Test refusal')];
    return o;
  });
  expect(out).toEqual({ up: 'stair', ride: 'elev', stale: ['play', true, 'stair', true], refused: ['play', true, true] });
});

// The bonus job played last (Pesos, the kid, the arena, the boss rush) leaked its twist into the next floor built in stages: Kade Tower's
// site got that job's objective and was refused ("Unsupported stage objective ..."), so from the Seabreeze you were sent back home.
test('stages: the last bonus job\'s twist does not leak into Kade Tower', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(() => {
    const o = {};
    for (const last of ['b_pesos', 'b_kid', 'b_arena', 'b_rush']) {
      selIdx = 0; sessionReset(10); const p = myProg(); arm(); p.seen = p.seen || {}; p.seen.loan = 1; VISIT.next = 10; NEXTJOB = 10; p.run = null;
      MISSION = last; STAGE_REFUSED = null; state = 'play'; takeNextJob(); startLevel(10);
      o[last] = [STAGE_REFUSED, G.def.name, MISSION, !!G.obj];
    }
    return o;
  });
  const ok = [null, 'KADE TOWER: SITE GATE', 'c10', false];
  expect(out).toEqual({ b_pesos: ok, b_kid: ok, b_arena: ok, b_rush: ok });
});
