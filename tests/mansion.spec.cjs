const { test, expect } = require('./fixtures.cjs');

// Villa Solana, the last house: locked until Lex is dealt with, then bought at the realty. Three floors joined by stairs:
// the grounds and ground floor (car out front), the master suite upstairs (the bed), the basement club (dancers, Mama Rosa
// hires a girl who moves in) and the private range (the firing line hands you a gun), with the gun locker in the cellar.
test('mansion: buy it, walk all three floors, hire a girl, the range and the locker', async ({ openGame }) => {
  const page = await openGame();
  const o = await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm();
    p.wallet = 400000; p.homes = [0]; p.home = 0; p.respect = 0; p.furn = {};
    const fade = fadeTo, r = {};
    const free = () => { const g = G, q = g.player; return !g.solid[Math.floor(q.z) * g.W + Math.floor(q.x)]; };
    const stairs = re => hubTargets(G).find(t => t.k === 'stairs' && re.test(t.lbl));
    try {
      fadeTo = f => { f(); return true; };
      openStore('home'); buyHome(3); r.lockedOwned = p.homes.includes(3);
      p.respect = 1; buyHome(3); r.owned = p.homes.includes(3); r.home = p.home; r.paid = 400000 - p.wallet; closeStore();
      loadHub('home3', 'home'); if (G.seq) seqSkip();
      r.ground = { mfl: G.mfl, car: !!G.hcar, phone: !!G.slots.o, free: free(), seats: mansionSeats(G).length, tub: mansionSeats(G).some(s => s.tub), stairs: hubTargets(G).filter(t => t.k === 'stairs').length };
      // down to the club
      stairs(/DOWN TO THE CLUB/).fn();
      const M = G.mansion;
      r.base = { mfl: G.mfl, hub: G.def === HUBS.home3b, free: free(), dancers: M.dancers.length, rosa: !!M.rosa, locker: hubTargets(G).some(t => t.k === 'locker'), bed: hubTargets(G).some(t => t.k === 'bed'), tips: hubTargets(G).filter(t => t.k === 'tip').length };
      // Mama Rosa: hire the first girl on the stage; she can't be hired twice
      openStore('mhire'); const name = M.dancers[0].dname; mansionHire(0); const w1 = p.wallet; mansionHire(0);
      r.hire = { crew: mvCrew().map(c => c.n), name, cost: 400000 - r.paid - w1, again: p.wallet === w1, girlsN: furnAt(3).girlsN, cards: document.querySelectorAll('#sStore .scard').length };
      closeStore();
      // the range: stepping onto the firing line hands you a gun, stepping back takes it off you
      const q = G.player, Z = G.range.zone; q.x = (Z.x0 + Z.x1) / 2; q.z = (Z.z0 + Z.z1) / 2; rangePre(1 / 60);
      r.range = { on: G.range.on && G.rangeOn, gun: !!(q.weapon && q.weapon.ammo > 0), name: G.range.name };
      q.z = 21.5; rangePre(1 / 60); r.range.off = !G.range.on && !G.rangeOn;
      // back up to the house, then up to the master suite
      q.x = 12; q.z = 21.5; stairs(/UP TO THE HOUSE/).fn();
      r.back = { mfl: G.mfl, free: free(), x: G.player.x, z: G.player.z, girls: G.npcs.filter(n => n.kind === 'pgirl').length };
      stairs(/UP TO THE MASTER/).fn();
      r.up = { mfl: G.mfl, free: free(), bed: hubTargets(G).find(t => t.k === 'bed')?.lbl || null, girls: G.npcs.filter(n => n.kind === 'pgirl').length, tub: mansionSeats(G).some(s => s.tub), stairs: hubTargets(G).filter(t => t.k === 'stairs').length };
      stairs(/DOWN TO THE FOYER/).fn(); r.down = { mfl: G.mfl, free: free() };
    } finally { fadeTo = fade; }
    return r;
  });
  expect(o.lockedOwned).toBe(false);
  expect(o.owned).toBe(true);
  expect(o.home).toBe(3);
  expect(o.paid).toBe(250000);
  expect(o.ground).toEqual({ mfl: 0, car: true, phone: true, free: true, seats: expect.any(Number), tub: true, stairs: 3 });
  expect(o.ground.seats).toBeGreaterThan(8);
  expect(o.base).toEqual({ mfl: -1, hub: true, free: true, dancers: 6, rosa: true, locker: true, bed: false, tips: 6 });
  expect(o.hire).toEqual({ crew: [o.hire.name], name: o.hire.name, cost: 5000, again: true, girlsN: 1, cards: 7 });
  expect(o.range).toEqual({ on: true, gun: true, name: 'PRIVATE RANGE', off: true });
  expect(o.back).toEqual({ mfl: 0, free: true, x: 7.5, z: 26.6, girls: 1 });
  expect(o.up).toEqual({ mfl: 1, free: true, bed: 'GO TO BED WITH THE GIRL', girls: 1, tub: true, stairs: 2 });
  expect(o.down).toEqual({ mfl: 0, free: true });
});

// Coming home: the car comes in through the gate, round the fountain, and you walk up the front steps; then bed with the girls upstairs.
test('mansion: the drive-in arrival ends at the front door, and bed upstairs', async ({ openGame }) => {
  const page = await openGame();
  await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm();
    p.homes = [0, 3]; p.home = 3; p.respect = 1; p.furn = { 3: { crew: [{ n: 'CANDY' }, { n: 'RAVEN' }], girls: 1, girlsN: 2, guards: 1, cabana: 1, court: 1, statue: 1, dj: 1, yacht: 1 } };
    goHome();
  });
  await expect.poll(() => page.evaluate(() => !!G.seq), { timeout: 5000 }).toBe(true);
  // run the scene in fixed steps (software GL is too slow to wait for it in real time)
  expect(await page.evaluate(() => { for (let i = 0; i < 900 && G.seq; i++) updateSeq(1 / 30); return !G.seq; })).toBe(true);
  const r = await page.evaluate(() => {
    const g = G, q = g.player, out = { hub: g.def === HUBS.home3, x: +q.x.toFixed(1), z: +q.z.toFixed(1), free: !g.solid[Math.floor(q.z) * g.W + Math.floor(q.x)], car: [+g.hcar.x.toFixed(1), +g.hcar.z.toFixed(1)], girls: g.npcs.filter(n => n.kind === 'pgirl').length, guards: g.npcs.filter(n => n.kind === 'bguard').length };
    const fade = fadeTo; try { fadeTo = f => { f(); return true; }; MV_FROM = 0; loadHub('home3u', 'home'); } finally { fadeTo = fade; }
    tuckIn(G); out.inBed = G.npcs.filter(n => n.bed).length + (G.player.bed ? 1 : 0);
    return out;
  });
  expect(r).toEqual({ hub: true, x: 20, z: 29.6, free: true, car: [20, 34.7], girls: 2, guards: 4, inBed: 3 });
});
