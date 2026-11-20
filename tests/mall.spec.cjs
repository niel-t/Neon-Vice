const { test, expect } = require('./fixtures.cjs');

// The Biscayne Galleria: a mall on the car menu with glass shopfronts, each run by its own keeper.
// Jewelry is worn (and shows on the model), furniture goes to any home you own, Sunshine Realty sells homes and rent-paying property.
const setup = () => { selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.wallet = 300000; };

test('mall: shops, keepers, jewelry you wear, furniture for every home, real estate that pays rent', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      loadHub('drive', 'parked'); openCarMenu();
      out.label = $('bCarDealer').textContent.includes('BISCAYNE GALLERIA');
      $('bCarDealer').click(); seqSkip(); seqSkip();
      const g = G;
      out.hub = { mall: g.def === HUBS.mall, keepers: g.mall.keepers.map(n => n.shop).sort(), vic: g.npcs.filter(n => n.kind === 'vic').length, lot: g.dealer.slots.length, shoppers: g.npcs.filter(n => n.kind === 'guest').length >= 5, glass: g.mall.glass.length >= 50 };
      const t = hubTargets(g);
      out.targets = ['car', 'vic', 'show', 'shop', 'dir'].every(k => t.some(q => q.k === k));
      // shoppers stay in the atrium
      for (let i = 0; i < 240; i++) npcStep(1 / 30);
      out.atrium = g.npcs.filter(n => n.kind === 'guest').every(n => n.x > 12.5 && n.x < 34.5 && n.z > 14.5 && n.z < 35.5);
      // every frame of the mall draws
      const B = new Batch(); drawDealer(B, g); out.drawn = B.n > 20000;
      // jewelry: buy, it shows on the model flags, take it off, put it back on
      const p = myProg();
      openMallShop('jewel');
      out.jewelScreen = { state, mode: storeMode, title: document.querySelector('#sStore .shT').textContent, cards: document.querySelectorAll('#sStore .scard').length, who: $('stSay').dataset.who };
      document.querySelector('#sStore [data-jw="medal"]').click();
      document.querySelector('#sStore [data-jw="bracelet"]').click();
      out.worn = { medal: p.jewel.medal, bracelet: p.jewel.bracelet, look: !!LOOKS[rideId()].medallion };
      document.querySelector('#sStore [data-jw="medal"]').click(); out.off = p.jewel.medal;
      document.querySelector('#sStore [data-jw="medal"]').click(); out.on = p.jewel.medal;
      closeStore(); out.closed = state;
      // furniture: only homes you own; the studio becomes buyable once you own it
      openMallShop('furn');
      out.furn0 = document.querySelectorAll('#sStore [data-mf^="0:"]').length > 5 && !document.querySelector('#sStore [data-mf^="1:"]');
      out.noPets = !document.querySelector('#sStore [data-mf="0:dog"]') && !document.querySelector('#sStore [data-mf="0:girls"]');
      document.querySelector('#sStore [data-mf="0:tv"]').click(); out.tv = !!p.furn[0].tv;
      closeStore();
      // real estate: buy the studio, then furnish it from the mall
      openMallShop('realty');
      document.querySelector('#sStore [data-ho="1"]').click(); out.home = [p.home, p.homes.slice()];
      document.querySelector('#sStore [data-inv="laundro"]').click(); out.props = { ...p.props };
      closeStore(); openMallShop('furn');
      document.querySelector('#sStore [data-mf="1:sofa"]').click(); out.sofa = !!p.furn[1].sofa;
      closeStore();
      // rent is paid with every finished job
      const w = p.wallet; out.rent = mallRent(p); out.paid = p.wallet - w;
      out.wallet = p.wallet;
      saveProg(); const sv = JSON.parse(localStorage.getItem('nb86prog'))[CHARS[selIdx].id]; out.saved = { props: sv.props, medal: sv.jewel.medal, furn1: !!sv.furn[1].sofa };
      return out;
    } finally { fadeTo = fade; }
  }, setup.toString())).toEqual({
    label: true,
    hub: { mall: true, keepers: ['furn', 'jewel', 'realty', 'tailor'], vic: 1, lot: 9, shoppers: true, glass: true },
    targets: true, atrium: true, drawn: true,
    jewelScreen: { state: 'store', mode: 'jewel', title: 'GOLD COAST JEWELERS', cards: 8, who: 'SCHMALTZY' }, // 6 pieces of jewelry + 2 pairs of earrings
    worn: { medal: true, bracelet: true, look: true },
    off: 'off', on: true,
    closed: 'play',
    furn0: true, noPets: true, tv: true,
    home: [1, [0, 1]],
    props: { laundro: 1 },
    sofa: true,
    rent: 500, paid: 500,
    wallet: 300000 - 12000 - 4000 - 1200 - 12000 - 15000 - 3500 + 500,
    saved: { props: { laundro: 1 }, medal: true, furn1: true }
  });
  // the high-detail model's build flags follow what you wear (models.js jewelB)
  expect(await page.evaluate(() => { const B = {}; PS2C.jewelB(rideId(), B); return { medal: B.medal, bracelet: B.bracelet, watch: !B.nowatch, cuban: B.chains }; }))
    .toEqual({ medal: true, bracelet: true, watch: false, cuban: false });
});

test('mall: the keepers have photo faces, and Fontaine Tailoring sells suits you wear', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      loadHub('mall'); while (G.seq) seqSkip();
      const g = G, p = myProg(), id = CHARS[selIdx].id;
      out.keepers = Object.fromEntries(g.mall.keepers.map(n => [n.shop, n.kind]));
      out.photos = ['schmaltzy', 'felix', 'lola'].every(k => ART[k] && ART[k].startsWith('data:image/jpeg'));
      out.names = [MALL_SHOPS.jewel.short, MALL_SHOPS.tailor.short, MALL_SHOPS.furn.short];
      // the tailor's rail is a target too
      out.rail = hubTargets(g).some(t => t.k === 'shop' && t.shop === 'tailor');
      openMallShop('tailor');
      out.screen = { mode: storeMode, title: document.querySelector('#sStore .shT').textContent, cards: document.querySelectorAll('#sStore .scard').length };
      const w = p.wallet;
      document.querySelector('#sStore [data-ts="mint"]').click();
      out.bought = { owned: !!p.tailor.mint, wearing: mySuit(), paid: w - p.wallet, tough: pk('tough') >= 1 };
      document.querySelector('#sStore [data-ts="mint"]').click(); out.off = mySuit();
      document.querySelector('#sStore [data-ts="mint"]').click(); out.back = mySuit();
      // a suit you haven't bought can't be worn from the character screen
      out.locked = suitOK(p, 'tux');
      closeStore();
      saveProg(); const sv = JSON.parse(localStorage.getItem('nb86prog'))[id]; out.saved = { tailor: sv.tailor, suit: sv.suit };
      return out;
    } finally { fadeTo = fade; }
  }, setup.toString())).toEqual({
    keepers: { jewel: 'jeweler', furn: 'furnman', realty: 'realtor', tailor: 'tailor' },
    photos: true,
    names: ['SCHMALTZY', 'FABULOSO FELIX', 'LOLA MONTENEGRO'],
    rail: true,
    screen: { mode: 'tailor', title: 'FONTAINE TAILORING', cards: 37 }, // 12 suits + 5 sunglasses + 20 designer accessories, shirts and shoes
    bought: { owned: true, wearing: 'mint', paid: 6500, tough: true },
    off: 'default', back: 'mint',
    locked: false,
    saved: { tailor: { mint: 1 }, suit: 'mint' }
  });
});

test('mall: walk straight in from the doors, Vic faces you, the food court has diners and stalls, signs clear the escalators', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo; try {
      fadeTo = f => { f(); return true; };
      loadHub('mall'); const g = G; while (g.seq) seqSkip();
      const vic = g.npcs.find(n => n.kind === 'vic');
      // hold W from the sidewalk in front of the doors: nothing stops you until the fountain
      const p = g.player; p.x = 23.5; p.z = 36.4; keys.KeyW = true;
      for (let i = 0; i < 240; i++) { updatePlayer(1 / 30); for (const s of g.solids) boxPush(s, p); }
      keys.KeyW = false;
      const diners = g.npcs.filter(n => n.kind === 'diner'), cooks = g.npcs.filter(n => n.kind === 'cook');
      // the shop signs hang at x 13-17 and 28-32 (map), the escalators now stand clear of them
      const escX = MALL_ESC.map(x => x + 1);
      return {
        vicFaces: Math.abs(vic.a0) < 0.01,
        walkedIn: p.z < 24,
        noPool: !g.rows.some((r, z) => z > 2 && r.includes('~')), // the bay behind Victory Motors' glass is the only water
        diners: diners.length >= 8 && diners.every(n => n.seat && n.seatK === 1),
        cooks: cooks.length === 2,
        escClear: escX.every(x => x > 18 && x < 29),
        chat: !!(NPC_CHAT.diner && NPC_CHAT.cook)
      };
    } finally { fadeTo = fade; }
  }, setup.toString())).toEqual({ vicFaces: true, walkedIn: true, noPool: true, diners: true, cooks: true, escClear: true, chat: true });
});
