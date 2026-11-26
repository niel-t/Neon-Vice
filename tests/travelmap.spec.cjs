const { test, expect } = require('./fixtures.cjs');

// TRAVEL MAP (travel.js): the car menu is a map of Miami. Places are pins (the old car-menu buttons), the side card names the picked
// pin with one DRIVE THERE button, and the car phone / Dade Exchange / Empire sit under it. Touch picks first and drives on the
// second tap; arrows pick and Enter drives; McWey still only gets in the way for the loan, act starts and the finale.
test('travel map: pins, you-are-here, card, touch pick-then-drive, arrows and Enter, McWey rule', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(async () => {
    const out = {}, frame = () => new Promise(f => requestAnimationFrame(() => requestAnimationFrame(f)));
    fadeTo = f => { f(); return true; };
    selIdx = 1; sessionReset(1); const p = myProg(); p.wallet = 50000; p.seen = p.seen || {}; p.seen.loan = 1; p.home = 1;
    NEXTJOB = 2; VISIT = { debrief: null, next: 2, grade: null, take: 0, style: null }; JOBPICK = null;
    // at Nine's: no Nine's pin, a you-are-here marker on Little Havana, the job glows at its floor's district
    loadHub('bunker'); openCarMenu(); await frame();
    const vis = id => $(id).style.display !== 'none';
    const map = $('cmMap').getBoundingClientRect();
    const inMap = id => { const b = $(id).getBoundingClientRect(); return b.left >= map.left - 1 && b.right <= map.right + 1 && b.top >= map.top - 1 && b.bottom <= map.bottom + 1; };
    out.at = { state, pins: TMAP_PINS.filter(vis), inside: TMAP_PINS.filter(vis).every(inMap), here: $('cmHere').style.left === (TMAP_PLACES.shop.x / 1.6) + '%',
      sel: TMAP_SEL, card: $('cmTitle').textContent, tag: $('cmTag').textContent, go: $('bCarGo').textContent.startsWith('DRIVE THERE'),
      tools: ['bCarPhone', 'bCarStocks', 'bCarEmpire'].every(id => $(id).parentNode === $('cmTools')) };
    // arrows pick the nearest pin that way; Enter drives to it
    const key = code => menuKey({ code });
    tmapSelect('bCarMcWey'); key('ArrowRight'); out.right = TMAP_SEL;
    tmapSelect('bCarMcWey'); key('ArrowUp'); out.up = TMAP_SEL;
    // touch: the first tap on a new pin only picks it, the second one drives
    const pin = $('bCarClub');
    pin.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true })); pin.click();
    out.tap1 = { state, sel: TMAP_SEL, card: $('cmTitle').textContent };
    pin.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true })); pin.click(); seqSkip && seqSkip();
    out.tap2 = { club: G.def === HUBS.club };
    // from the club, Enter on a fresh menu drives to tonight's job (the job is picked by default)
    openCarMenu(); await frame(); out.club = { sel: TMAP_SEL, here: $('cmHere').style.left === (TMAP_PLACES.club.x / 1.6) + '%', clubPin: vis('bCarClub') };
    closeCarMenu();
    // McWey must: the job pin reads SEE McWEY and sits on McWey Tower, the McWey pin goes away
    VISIT.next = 3; NEXTJOB = 2; loadHub('bunker'); openCarMenu(); await frame();
    out.must = { label: $('bCarJob').textContent.startsWith('SEE McWEY'), mc: vis('bCarMcWey'), at: $('bCarJob').style.left === (TMAP_PLACES.mcwey.x / 1.6) + '%', card: $('cmTitle').textContent };
    closeCarMenu();
    return out;
  });
  expect(r.at).toEqual({ state: 'carmenu', pins: ['bCarJob', 'bCarMcWey', 'bCarClub', 'bCarDealer', 'bCarCasino', 'bCarHome'], inside: true, here: true,
    sel: 'bCarJob', card: 'THE PENTHOUSE', tag: 'NEXT JOB · BRICKELL', go: true, tools: true });
  expect(r.right).toBe('bCarClub');
  expect(r.up).toBe('bCarDealer');
  expect(r.tap1).toEqual({ state: 'carmenu', sel: 'bCarClub', card: 'VELVET PALMS' });
  expect(r.tap2).toEqual({ club: true });
  expect(r.club).toEqual({ sel: 'bCarJob', here: true, clubPin: false });
  expect(r.must).toEqual({ label: true, mc: false, at: true, card: 'McWEY TOWER' });
});
