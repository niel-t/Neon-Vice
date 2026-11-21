const { test, expect } = require('./fixtures.cjs');

// Four more homes at Sunshine Realty (homes.js): Little Havana casita, Dinner Key houseboat, Ocean Drive deco condo and the
// Coconut Grove villa (locked until the Shark is dead). Each loads as a real home with the phone, bed, gun locker, seats,
// a car (or the lift), its own upgrades, a pin on the travel map and a party.
test('realty homes: buy them, load each one, phone, bed, locker, upgrades and party', async ({ openGame }) => {
  const page = await openGame();
  const o = await page.evaluate(() => {
    selIdx = 0; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); const a = arm();
    p.wallet = 200000; p.homes = [0]; p.home = 0; p.sharkDead = 0; p.furn = {};
    const fade = fadeTo, r = { homes: {} };
    const free = () => { const g = G, q = g.player; return !g.solid[Math.floor(q.z) * g.W + Math.floor(q.x)]; };
    try {
      fadeTo = f => { f(); return true; };
      openStore('home');
      r.cards = HOMEDEF.length;
      buyHome(7); r.groveLocked = !p.homes.includes(7);
      const w0 = p.wallet; buyHome(4); buyHome(5); buyHome(6); r.paid = w0 - p.wallet;
      p.sharkDead = 1; const w1 = p.wallet; buyHome(7); r.grovePaid = w1 - p.wallet; r.owned = [4, 5, 6, 7].every(t => p.homes.includes(t));
      closeStore();
      r.pins = [4, 5, 6, 7].map(t => !!(TMAP_HOMES[t] && TMAP_HOMES[t].area));
      for (const t of [4, 5, 6, 7]) {
        p.home = t; p.furn[t] = {}; p.party = null; p.rhDom = null; p.rhFish = null;
        loadHub('home' + t, 'home'); if (G.seq) seqSkip(); state = 'play';
        const g = G, tg = () => hubTargets(g);
        const h = {
          rhome: g.rhome, free: free(), phone: !!g.slots.o, car: !!g.hcar || !!RH_DEF[t].lift,
          bed: tg().some(x => x.k === 'bed'), locker: tg().some(x => x.k === 'locker')
        };
        // buy every upgrade on the phone, including the girls (the bed grows)
        storeMode = 'home';
        const cat = catOf(t); p.wallet = 1e6;
        for (const it of cat) if (it.k !== 'girls') buyFurn(it.k);
        buyFurn('girls'); buyFurn('girls');
        h.items = cat.length; h.bought = cat.filter(it => it.k === 'girls' || furnAt(t)[it.k]).length;
        h.ups = RH_DEF[t].cat.map(c => c.k).filter(k => furnAt(t)[k]).length === RH_DEF[t].cat.length;
        loadHub('home' + t, 'home'); if (G.seq) seqSkip(); state = 'play';
        h.girls = G.npcs.filter(n => n.kind === 'pgirl').length; h.seats = homeSeats(G).length;
        h.rh = hubTargets(G).filter(x => x.k === 'rh' || x.k === 'hifi').map(x => x.lbl);
        // the party
        const w = p.wallet; hlThrowParty(); h.party = p.party && p.party.on && p.party.home === t && p.wallet < w;
        loadHub('home' + t, 'home'); if (G.seq) seqSkip();
        h.guests = G.npcs.filter(n => n.kind === 'pguest').length;
        p.party = null;
        r.homes[t] = h;
      }
      // dominoes at the casita: one hand a night, $100 either way
      p.home = 4; loadHub('home4', 'home'); if (G.seq) seqSkip(); state = 'play';
      const dom = hubTargets(G).find(x => x.k === 'rh' && /DOMINOES/.test(x.lbl));
      const d0 = p.wallet; dom.fn(); const d1 = p.wallet; dom.fn();
      r.dom = { diff: Math.abs(d1 - d0), again: p.wallet === d1 };
      // fishing on the houseboat: once a night
      p.home = 5; loadHub('home5', 'home'); if (G.seq) seqSkip(); state = 'play';
      const fish = hubTargets(G).find(x => x.k === 'rh' && /CAST/.test(x.lbl)); fish.fn();
      r.fish = { key: p.rhFish === a.jobs, label: hubTargets(G).find(x => x.k === 'rh' && /FISHING|CAST/.test(x.lbl)).lbl };
      r.groveTub = (p.home = 7, loadHub('home7', 'home'), G.seq && seqSkip(), rhSeats(G).some(s => s.tub));
    } finally { fadeTo = fade; }
    return r;
  });
  expect(o.cards).toBe(8);
  expect(o.groveLocked).toBe(true);
  expect(o.paid).toBe(6500 + 18000 + 28000);
  expect(o.grovePaid).toBe(95000);
  expect(o.owned).toBe(true);
  expect(o.pins).toEqual([true, true, true, true]);
  for (const t of [4, 5, 6, 7]) {
    const h = o.homes[t];
    expect(h).toMatchObject({ rhome: t, free: true, phone: true, car: true, bed: true, locker: true, ups: true, girls: 2, party: true });
    expect(h.bought).toBe(h.items);
    expect(h.seats).toBeGreaterThan(2);
    expect(h.guests).toBeGreaterThan(0);
  }
  expect(o.homes[4].rh.some(l => /DOMINOES/.test(l))).toBe(true);
  expect(o.homes[5].rh.some(l => /CAST A LINE/.test(l))).toBe(true);
  expect(o.homes[6].rh.length).toBeGreaterThan(0);
  expect(o.dom).toEqual({ diff: 100, again: true });
  expect(o.fish).toEqual({ key: true, label: 'FISHING · NOTHING BITING TILL TOMORROW' });
  expect(o.groveTub).toBe(true);
});

// Coming home plays the arrival: the car pulls up and you walk in (the condo comes up in the lift), ending on free floor.
test('realty homes: arrival scenes end inside on free floor', async ({ openGame }) => {
  const page = await openGame();
  for (const t of [4, 5, 6, 7]) {
    await page.evaluate(t => {
      selIdx = 0; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm();
      p.homes = [0, t]; p.home = t; p.sharkDead = 1; p.furn = {};
      const fade = fadeTo; fadeTo = f => { f(); return true; };
      try { goHome(); } finally { fadeTo = fade; }
    }, t);
    const started = await page.evaluate(() => !!G.seq);
    await page.waitForFunction(() => !G.seq, null, { timeout: 30_000 });
    const r = await page.evaluate(() => { const g = G, q = g.player; return { rhome: g.rhome, free: !g.solid[Math.floor(q.z) * g.W + Math.floor(q.x)], hidden: !!q.hidden }; });
    expect(started).toBe(true);
    expect(r).toEqual({ rhome: t, free: true, hidden: false });
  }
});
