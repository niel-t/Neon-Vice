const { test, expect } = require('./fixtures.cjs');

// Phone controls in hubs (homes, club, mall, the drive): a USE button names what is in reach and does it (same as E / pad A), a pause
// button opens the pause menu, and a tap on the screen picks the target drawn nearest the finger, not the first one in the list.
test('touch: USE and pause buttons in hubs, taps pick the nearest target', async ({ openGame }) => {
  const page = await openGame();
  const tap = id => page.evaluate(id => document.getElementById(id).dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true })), id);
  await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.wallet = 1e6; p.respect = 1; p.sharkDead = 1; p.lvl = 3;
    p.home = 2; p.homes = [0, 1, 2, 3]; p.furn = { 2: {} }; p.gymKey = null;
    loadHub('home2', 'home'); if (G.seq) seqSkip(); state = 'play'; storeMode = 'home';
    for (const k of ['wardrobe', 'bench', 'bar']) buyFurn(k); state = 'play'; show(null);
    const B = HL_POS[2].bench.use; G.player.x = B.x; G.player.z = B.z;
    document.getElementById('hud').dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true })); // the phone says hello
  });
  await expect.poll(() => page.evaluate(() => [touchMode, $('hubUI').style.display, $('bUse').textContent, getComputedStyle($('bUse')).display])).toEqual([true, 'block', 'WEIGHT BENCH', 'flex']);
  const xp0 = await page.evaluate(() => myProg().xp + myProg().lvl * 1e5);
  await tap('bUse');
  await expect.poll(() => page.evaluate(() => myProg().xp + myProg().lvl * 1e5)).toBeGreaterThan(xp0);

  /* nothing in reach: no USE button, the pause button still there */
  await page.evaluate(() => { const p = G.player, ts = hubTargets(G); let best = null; for (let z = 1; z < G.H - 1 && !best; z++) for (let x = 1; x < G.W - 1; x++) { if (G.solid[z * G.W + x]) continue; if (ts.every(t => Math.hypot(t.x - x - 0.5, t.z - z - 0.5) > t.r + 0.5)) { best = [x + 0.5, z + 0.5]; break; } } p.x = best[0]; p.z = best[1]; });
  await expect.poll(() => page.evaluate(() => getComputedStyle($('bUse')).display)).toBe('none');
  await tap('bHubPause');
  await expect.poll(() => page.evaluate(() => state)).toBe('pause');
  await page.evaluate(() => togglePause());

  /* a tap between two targets goes to the one nearest the finger, even when another comes first in the list */
  const pick = await page.evaluate(() => {
    const p = G.player, A = { k: 'a', x: p.x + 0.6, z: p.z, r: 2 }, Bt = { k: 'b', x: p.x - 0.6, z: p.z, r: 2 }, sb = project(Bt.x, 0.8, Bt.z), far = { k: 'far', x: p.x + 40, z: p.z, r: 1 }, sf = project(far.x, 0.8, far.z);
    return { near: (hubTapPick([A, Bt], sb[0], sb[1], p, null) || {}).k, far: sf ? hubTapPick([far], sf[0], sf[1], p, null) : false, none: hubTapPick([A], -500, -500, p, null) };
  });
  expect(pick).toEqual({ near: 'b', far: false, none: null });

  /* in a job the regular touch buttons take over; the hub ones hide */
  await page.evaluate(() => { startMission('c1'); state = 'play'; });
  await expect.poll(() => page.evaluate(() => [$('hubUI').style.display, $('touchUI').style.display])).toEqual(['none', 'block']);
});
