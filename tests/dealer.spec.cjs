const { test, expect } = require('./fixtures.cjs');

// Victory Motors: the car dealership is a drive-in stop on the car menu, the only place that sells cars,
// and its upgrades (PROG[id].carx) dress and tune whatever you drive.
const setup = () => { selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.wallet = 200000; };

test('dealer: drive to Victory Motors, meet Vic, buy a car and upgrades, and they stick', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      loadHub('drive', 'parked'); openCarMenu();
      out.menu = $('bCarDealer').style.display !== 'none';
      $('bCarDealer').click();
      out.depart = !!G.seq; seqSkip();
      out.lot = { hub: G.def === HUBS.dealer, scene: !!G.seq, vic: G.npcs.filter(n => n.kind === 'vic').length, slots: G.dealer.slots.map(s => s.k) };
      seqSkip();
      const t = hubTargets(G).map(q => q.k);
      out.targets = ['car', 'vic', 'show'].every(k => t.includes(k));
      openCarMenu(); out.menuHere = $('bCarDealer').style.display === 'none'; closeCarMenu();
      openDealer('spyder');
      out.screen = { state, mode: storeMode, title: document.querySelector('#sStore .shT').textContent, cards: document.querySelectorAll('#sStore .scard').length, face: $('stFace').style.display, say: $('stSay').textContent.length > 20 };
      buyCar('spyder');
      for (const k of ['paint', 'paint', 'rims', 'glow', 'turbo', 'eng', 'turbo']) buyCarMod(k);
      const p = myProg();
      out.bought = { car: p.car, cars: p.cars.slice(), carx: { ...p.carx }, wallet: p.wallet };
      saveProg(); out.saved = JSON.parse(localStorage.getItem('nb86prog'))[CHARS[selIdx].id].carx;
      closeStore(); out.closed = [state, G.obj];
      // the shopping mall no longer sells cars
      openCarMenu(); $('bCarStore').click(); out.mall = $('stCars').style.display; closeStore();
      // every car and every look draws without throwing
      const B = new Batch(); let n = 0;
      for (const k of ['beater', 'mid', 'spyder', 'sig', 'testa']) for (const id of [0, 1, 2]) {
        selIdx = id; myProg().car = k; myProg().carx = { paint: 3, rims: 'white', glow: 2 }; B.reset(); drawRide(B, 0, 0, 1, 0.4); n += B.n > 2000 ? 1 : 0;
      }
      for (const ty of ['sedan', 'wagon', 'hatch', 'coupe', 'pickup', 'van']) { B.reset(); drawCar(B, 0, 0, [0.5, 0.5, 0.5], 1, 0, ty); n += B.n > 2000 ? 1 : 0; }
      out.drawn = n;
      return out;
    } finally { fadeTo = fade; }
  }, setup.toString())).toEqual({
    menu: true, depart: true,
    lot: { hub: true, scene: true, vic: 1, slots: ['mid', 'spyder', 'sig', 'testa'] },
    targets: true, menuHere: true,
    screen: { state: 'store', mode: 'dealer', title: 'VICTORY MOTORS', cards: 10, face: 'block', say: true },
    bought: { car: 'spyder', cars: ['beater', 'spyder'], carx: { paint: 2, rims: 'chrome', glow: 1, eng: 1, turbo: 1 }, wallet: 200000 - 30000 - 800 * 2 - 1500 - 2500 - 6000 - 9000 },
    saved: { paint: 2, rims: 'chrome', glow: 1, eng: 1, turbo: 1 },
    closed: ['play', 'BACK TO YOUR CAR'],
    mall: 'none',
    drawn: 21
  });
});
