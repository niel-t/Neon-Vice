const { test, expect } = require('./fixtures.cjs');

// Accessories (accessories.js): hats, gloves, a bum bag and cigars on Felix's wall at Fontaine Tailoring, earrings in Schmaltzy's case.
// One piece per kind is worn; buying puts it on, clicking again takes it off, another of the same kind swaps. Shows on both models and saves.
const setup = () => { selIdx = 0; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.wallet = 300000; p.acc = {}; };

test('mall: accessories at Fontaine Tailoring and Gold Coast Jewelers, one of each kind worn', async ({ openGame }) => {
  const page = await openGame();
  await expect.poll(() => page.evaluate(() => PS2C.ready), { timeout: 60_000 }).toBe(true);
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')(); const p = myProg(), id = rideId(), out = {};
    loadHub('mall'); openMallShop('tailor');
    out.tailor = { cards: document.querySelectorAll('#sStore [data-ac]').length, head: $('stHomeH').textContent.startsWith('ACCESSORIES'), shown: $('stHome').style.display !== 'none' };
    document.querySelector('#sStore [data-ac="fedora"]').click();
    const L = LOOKS[id], B = {}; PS2C.jewelB(id, B);
    out.fedora = { on: accOn(p).hat, paid: 300000 - p.wallet, classic: L.accHat && L.accHat.hat, ps2: B.hat };
    document.querySelector('#sStore [data-ac="cap"]').click(); PS2C.jewelB(id, B);
    out.cap = { on: accOn(p).hat, own: Object.keys(p.acc.own).sort(), ps2: B.hat, swapLbl: document.querySelector('#sStore [data-ac="fedora"]').textContent.includes('SWAP IT IN') };
    for (const k of ['gloves', 'pack', 'cigar']) document.querySelector(`#sStore [data-ac="${k}"]`).click();
    PS2C.jewelB(id, B);
    out.more = { gloves: B.gloves && B.gloves[0] < 40, classicGloves: L.gloves === ACC.gloves.col, pack: !!B.pack && !!L.accPack, cigar: B.cigar && L.cigar };
    document.querySelector('#sStore [data-ac="cap"]').click(); PS2C.jewelB(id, B);
    out.off = { hat: accOn(p).hat || null, ps2: B.hat, classic: L.accHat };
    closeStore();
    openMallShop('jewel');
    out.jewel = { cards: document.querySelectorAll('#stGold [data-ac]').length, jewelry: document.querySelectorAll('#sStore [data-jw]').length };
    document.querySelector('#sStore [data-ac="hoop"]').click(); document.querySelector('#sStore [data-ac="stud"]').click(); PS2C.jewelB(id, B);
    out.ear = { on: accOn(p).ear, ps2: B.ear, classic: L.accEar };
    closeStore();
    // every hat shape and every piece builds on the high-detail model and draws on the classic model (stageB skips the PS2 path) without errors
    const errs = [];
    for (const h of ['fedora', 'panama', 'cap', 'flat']) {
      p.acc.on.hat = h; p.acc.own[h] = 1; applyJewelLooks(); PS2C.rebuild(id);
      if ($('modelWarning').style.display === 'block') errs.push('ps2 ' + h);
      try { const n0 = stageB.n; drawChar(stageB, G.player); if (!(stageB.n > n0)) errs.push('classic empty ' + h); stageB.n = n0; } catch (e) { errs.push('classic ' + h + ' ' + e.message); }
    }
    out.errs = errs;
    saveProg(); out.saved = JSON.parse(localStorage.getItem('nb86prog'))[CHARS[selIdx].id].acc.on;
    return out;
  }, setup.toString())).toEqual({
    tailor: { cards: 8, head: true, shown: true },
    fedora: { on: 'fedora', paid: 1800, classic: 'fedora', ps2: 'fedora' },
    cap: { on: 'cap', own: ['cap', 'fedora'], ps2: 'cap', swapLbl: true },
    more: { gloves: true, classicGloves: true, pack: true, cigar: true },
    off: { hat: null, ps2: null, classic: null },
    jewel: { cards: 2, jewelry: 6 },
    ear: { on: 'stud', ps2: 'stud', classic: 'stud' },
    errs: [],
    saved: { hat: 'flat', hands: 'gloves', waist: 'pack', mouth: 'cigar', ear: 'stud' },
  });
});
