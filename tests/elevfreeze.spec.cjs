const { test, expect } = require('./fixtures.cjs');

// Riding the Seabreeze elevator down to Kade Tower froze in the lift: a Kade Tower run saved partway up, from before the floor's map
// changed (plain stairs bumped the stage revisions), was refused on every resume, and a refusal from inside the elevator left you there.
test('elevator: a stale saved run restarts the floor, and a refused load never strands you in the lift', async ({ openGame }) => {
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
    o.stale = [state, G.def.name, myProg().run && myProg().run.stage];
    // any load that is refused from the lift sends you back out into your corridor with the reason
    if (state === 'objcard') objCardGo();
    toHome();
    fadeTo(() => enterElevator(true, { from: 3, to: 1, title: 'THE SEABREEZE', dur: 0.3, then: () => stageFailure(new Error('Test refusal')) }));
    for (let i = 0; i < 40 && (state !== 'elev' || fading); i++) await wait(100);
    for (let i = 0; i < 60 && state === 'elev'; i++) await wait(100);
    await wait(500);
    o.refused = [state, G.def === HUBS.home1, document.getElementById('banner').textContent.includes('Test refusal')];
    return o;
  });
  expect(out).toEqual({ up: 'stair', ride: 'elev', stale: ['objcard', 'KADE TOWER: SITE GATE', 'site'], refused: ['play', true, true] });
});
