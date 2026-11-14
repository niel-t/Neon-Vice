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
      out.hub = { mall: g.def === HUBS.mall, keepers: g.mall.keepers.map(n => n.shop).sort(), vic: g.npcs.filter(n => n.kind === 'vic').length, lot: g.dealer.slots.length, shoppers: g.npcs.filter(n => n.kind === 'guest').length >= 5, glass: g.mall.glass.length > 60 };
      const t = hubTargets(g);
      out.targets = ['car', 'vic', 'show', 'shop', 'dir'].every(k => t.some(q => q.k === k));
      // shoppers stay in the atrium
      for (let i = 0; i < 240; i++) npcStep(1 / 30);
      out.atrium = g.npcs.filter(n => n.kind === 'guest').every(n => n.x > 12.5 && n.x < 34.5 && n.z > 6.5 && n.z < 27.5);
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
    hub: { mall: true, keepers: ['furn', 'jewel', 'realty'], vic: 1, lot: 4, shoppers: true, glass: true },
    targets: true, atrium: true, drawn: true,
    jewelScreen: { state: 'store', mode: 'jewel', title: 'GOLD COAST JEWELERS', cards: 6, who: 'DIAMOND DOLORES' },
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
