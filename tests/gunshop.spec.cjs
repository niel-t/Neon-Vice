const { test, expect } = require('./fixtures.cjs');

// Nine of Nine's: the shop screen is a catalogue you scroll (every regular gun on the shelf, today's three pieces
// marked down or, for an exclusive, finally in stock), and the bunker has a shooting range where a loaner or your
// own guns fire for free and go back when you step off the line.
const setup = () => {
  selIdx = 1; const p = myProg();
  p.kit = { v:1, guns:[{ type:'pistol', mag:15 }, null], active:0, melee:null, armour:null, pool:{ '9mm':20 }, upg:{}, lost:[] };
  p.locker = { v:1, items:[], lost:[] }; p.wallet = 50000;
  const a = arm(); a.met = true; a.stock = ['m16', 'katana', 'revolver']; a.key = a.jobs;
};

test('gun shop: the catalogue lists every gun, marks today\'s deals and exclusives, and scrolls by keyboard', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      loadHub('bunker', 'bunker'); seqSkip();
      out.range = !!G.range && G.range.lanes.length;
      openShop();
      const ws = shopRows.filter(q => q.k === 'w').map(q => q.t);
      out.allGuns = ['pistol', 'silenced', 'revolver', 'dual', 'smg', 'm16', 'shotgun', 'double', 'knife', 'bat', 'machete', 'tknife'].every(t => ws.includes(t));
      out.goldglHidden = !ws.includes('goldgl');
      out.prices = { m16: shopPrice('m16'), revolver: shopPrice('revolver'), pistol: shopPrice('pistol'), katana: shopPrice('katana') };
      out.avail = { katana: shopAvail('katana'), goldak: shopAvail('goldak'), golddeagle: shopAvail('golddeagle') };
      out.sections = [...document.querySelectorAll('#shTabs button')].map(b => b.dataset.tab);
      out.first = shopRows[shopSel].t;
      menuKey({ code:'ArrowDown' }); out.down = shopRows[shopSel].t;
      menuKey({ code:'ArrowRight' }); out.next = shopRows[shopSel].sec;
      out.card = { bars: document.querySelectorAll('#shDetail .gsBar').length, buy: $('shBuy').textContent.startsWith('BUY $'), tryBtn: !!$('shTry') };
      out.locked = (shopSelect(shopRows.findIndex(q => q.t === 'goldak')), $('shBuy').disabled);
      shopSelect(shopRows.findIndex(q => q.k === 'mod' && q.m === 'supp'));
      out.mod = $('shDetail').textContent.includes('9MM PISTOL');
      shopPick('goldak'); out.boughtLocked = kitHas(kit(), 'goldak') || lockerHas('goldak');
      shopPick('revolver'); out.bought = { kit: kit().guns.map(g => g && g.type), wallet: myProg().wallet };
      closeShop();
      return out;
    } finally { fadeTo = fade; }
  }, setup.toString())).toEqual({
    range: 3, allGuns: true, goldglHidden: true,
    prices: { m16: 4150, revolver: 2250, pistol: 1500, katana: 7500 },
    avail: { katana: true, goldak: false, golddeagle: false },
    sections: ['hand', 'long', 'shot', 'melee', 'mods', 'gear', 'sell'],
    first: 'pistol', down: 'silenced', next: 'long',
    card: { bars: 5, buy: true, tryBtn: true }, locked: true, mod: true,
    boughtLocked: false, bought: { kit: ['pistol', 'revolver'], wallet: 50000 - 2250 }
  });
});

test('range: TRY lends the gun on the firing line, reloads are free, paper scores, stepping back returns it', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      loadHub('bunker', 'bunker'); seqSkip();
      openShop(); shopSelect(shopRows.findIndex(q => q.t === 'm16'));
      $('shTry').click();
      const g = G, R = g.range, p = g.player;
      out.after = { state, loan: R.loan, onLine: rangeZone(p) };
      rangePre(0.016);
      out.armed = { on: g.rangeOn, gun: p.weapon && p.weapon.type, ammo: p.weapon && p.weapon.ammo, touch: (touchMode = true, true) };
      touchMode = false;
      // a round straight down lane one hits the paper
      const L = R.lanes[0]; L.down = 0; L.t = 0;
      g.bullets.push({ x: L.x, z: L.z + 3, dx: 0, dz: -1, sp: 34, life: 1.2, own: 'p', pierce: 1, type: 'm16', hit: [], y: 0.74 });
      for (let i = 0; i < 10; i++) rangeTick(0.016);
      out.hit = { hits: R.hits, pts: R.pts, down: L.t > 0, bullets: g.bullets.length };
      // an empty magazine refills for free after the reload time; the kit's pool is untouched
      p.weapon.ammo = 0; rangePre(0.016); out.reloading = R.rl > 0;
      for (let i = 0; i < 200; i++) rangePre(0.016);
      out.refilled = p.weapon.ammo === WD.m16.mag;
      // swap cycles to your own pistol
      pressed.swap = true; rangePre(0.016); out.swapped = p.weapon.type;
      // stepping off the line hands it back
      p.z -= 4; rangePre(0.016);
      out.left = { on: g.rangeOn, loan: R.loan, weapon: p.weapon, kit: kit().guns.map(q => q && q.type), pool: kit().pool['9mm'], wallet: myProg().wallet };
      return out;
    } finally { fadeTo = fade; }
  }, setup.toString())).toEqual({
    after: { state: 'play', loan: 'm16', onLine: true },
    armed: { on: true, gun: 'm16', ammo: 30, touch: true },
    hit: { hits: 1, pts: 10, down: true, bullets: 0 },
    reloading: true, refilled: true, swapped: 'pistol',
    left: { on: false, loan: null, weapon: null, kit: ['pistol', null], pool: 20, wallet: 50000 }
  });
});
