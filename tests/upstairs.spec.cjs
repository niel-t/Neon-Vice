const { test, expect } = require('./fixtures.cjs');

// Galleria level 2 (upstairs.js): ride the escalators up to a balcony over the food court, with Crazy Ray's Electronics
// (pager, car phone, police scanner), the Starlite Zone arcade (Quickdraw '86) and Doc Feelgood's clinic (one-job boosts).
const setup = () => { selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.wallet = 300000; p.gear = {}; p.meds = {}; p.arcade = {}; };

test('mall level 2: escalators, three shops, gadgets, meds and the quick-draw cabinet', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      loadHub('mall');
      // the mall's escalators take you up
      let t = hubTargets(G);
      out.rideUp = t.filter(q => q.lbl && q.lbl.includes('LEVEL 2')).length;
      t.find(q => q.lbl && q.lbl.includes('LEVEL 2')).fn();
      const g = G;
      out.up = { hub: g.def === HUBS.mall2, keepers: g.up2.keepers.map(n => n.shop).sort(), onFloor: !g.solid[Math.floor(g.player.z) * g.W + Math.floor(g.player.x)] };
      t = hubTargets(g);
      out.targets = { shops: t.filter(q => q.k === 'shop').length, down: t.filter(q => q.lbl && q.lbl.includes('RIDE DOWN')).length, qd: t.filter(q => q.lbl && q.lbl.includes('QUICKDRAW')).length };
      // people up here talk and wander without errors, and every frame draws
      for (let i = 0; i < 120; i++) { g.player.x = 6 + (i % 30); g.player.z = 11.5; npcStep(1 / 30); }
      const B = new Batch(); drawUp2(B, g); out.drawn = B.n > 0 && g.staticB.n > 20000;
      // Crazy Ray's: three gadgets
      const p = myProg();
      openMallShop('elec');
      out.elec = { state, title: document.querySelector('#sStore .shT').textContent, cards: document.querySelectorAll('#sStore [data-gear]').length };
      for (const k of ['pager', 'phone', 'scanner']) document.querySelector(`#sStore [data-gear="${k}"]`).click();
      out.gear = { ...p.gear }; out.paidGear = 300000 - p.wallet;
      closeStore();
      // the pager adds a third side-job offer
      p.sjOff = null; out.offers = sjOffers().length;
      // Doc Feelgood's: all three meds, used on the next job and gone once paid
      openMallShop('clinic');
      for (const k of ['pk', 'adr', 'salts']) document.querySelector(`#sStore [data-med="${k}"]`).click();
      out.meds = { ...p.meds };
      closeStore();
      // the arcade: a game costs $20, five duels, a fast hand wins
      openMallShop('arcade');
      document.querySelector('#sStore [data-arc="play"]').click();
      out.arcade = state;
      const w0 = p.wallet; qdFire(0); out.token = w0 - p.wallet;
      for (let r = 0; r < 5; r++) { const at = QD.t0; qdTick(at); qdFire(at + 180); qdTick(at + 2000); }
      out.qd = { phase: QD.phase, best: p.arcade.best, plays: p.arcade.plays, won: p.wallet - (w0 - 20) };
      closeArcade(); out.closed = state;
      // ride back down
      hubTargets(G).find(q => q.lbl && q.lbl.includes('RIDE DOWN')).fn();
      out.down = G.def === HUBS.mall;
      // on a job: meds apply
      NOARRIVE = true; startLevel(0); const pl = G.player;
      out.job = { maxhp: pl.maxhp, adren: G.adren, salts: G.salts };
      pl.armor = 0; pl.armorT = 0; pl.hp = 1; hurtPlayer([0, 1], 'pistol', 5); out.saved = pl.alive && G.saltsUsed === 1;
      G.paid = 0; G.take = 100; payout(); out.usedUp = Object.keys(p.meds).length;
      // the car phone shows on the car menu away from Nine's and opens his shop without the range
      loadHub('drive', 'parked'); openCarMenu();
      out.phoneBtn = $('bCarPhone').style.display !== 'none';
      $('bCarPhone').click(); out.phone = { state, tryHidden: !$('shTry') };
      closeShop(); out.phoneClosed = [state, SHOP_REMOTE];
      saveProg(); const sv = JSON.parse(localStorage.getItem('nb86prog'))[CHARS[selIdx].id];
      out.saved2 = { gear: sv.gear, best: sv.arcade.best };
      return out;
    } finally { fadeTo = fade; }
  }, setup.toString())).toEqual({
    rideUp: 2,
    up: { hub: true, keepers: ['arcade', 'clinic', 'elec'], onFloor: true },
    targets: { shops: 3, down: 2, qd: 2 },
    drawn: true,
    elec: { state: 'store', title: "CRAZY RAY'S ELECTRONICS", cards: 3 },
    gear: { pager: 1, phone: 1, scanner: 1 }, paidGear: 23000,
    offers: 3,
    meds: { pk: 1, adr: 1, salts: 1 },
    arcade: 'arcade', token: 20,
    qd: { phase: 'over', best: 180, plays: 1, won: 1000 },
    closed: 'play', down: true,
    job: { maxhp: expect.any(Number), adren: 1, salts: 1 },
    saved: true, usedUp: 0,
    phoneBtn: true, phone: { state: 'shop', tryHidden: true }, phoneClosed: ['play', false],
    saved2: { gear: { pager: 1, phone: 1, scanner: 1 }, best: 180 },
  });
});

// Fontaine Tailoring's sunglasses section: buy a pair and it goes on (one pair at a time), take it off, it shows on both character models and saves.
test('mall: sunglasses at Fontaine Tailoring, worn one pair at a time', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')(); const p = myProg(); p.shades = {}; const out = {};
    loadHub('mall'); openMallShop('tailor');
    out.cards = document.querySelectorAll('#sStore [data-sg]').length;
    document.querySelector('#sStore [data-sg="avi"]').click();
    out.avi = { on: shadesOn(p), paid: 300000 - p.wallet, classic: !!LOOKS[rideId()].aviators };
    document.querySelector('#sStore [data-sg="wrap"]').click();
    const L = LOOKS[rideId()], B = { }; PS2C.jewelB(rideId(), B);
    out.wrap = { on: shadesOn(p), own: Object.keys(p.shades.own).sort(), classic: !!L.shades && !L.aviators, lens: L.shadeC && L.shadeC[2] > 0.5, ps2: B.sun && B.sun.shape };
    document.querySelector('#sStore [data-sg="wrap"]').click(); PS2C.jewelB(rideId(), B);
    out.off = { on: shadesOn(p), ps2: B.sun, back: L.shades === L._sh0.shades && L.glasses === L._sh0.glasses };
    closeStore(); saveProg(); out.saved = JSON.parse(localStorage.getItem('nb86prog'))[CHARS[selIdx].id].shades;
    return out;
  }, setup.toString())).toEqual({
    cards: 5,
    avi: { on: 'avi', paid: 1200, classic: true },
    wrap: { on: 'wrap', own: ['avi', 'wrap'], classic: true, lens: true, ps2: 'wrap' },
    off: { on: null, ps2: null, back: true },
    saved: { own: { avi: 1, wrap: 1 }, on: null },
  });
});
