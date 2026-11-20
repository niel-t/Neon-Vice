const { test, expect } = require('./fixtures.cjs');

// A night in bed with the girls you hired: each girl who fits in the bed is +1 hit on the next job (up to +2), gone once you are paid.
// Room 14 keeps its single bed, so sleeping there alone gives nothing.
test('home: going to bed with the girls gives extra hits on the next job', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(async () => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.wallet = 100000;
    const fade = fadeTo, o = {};
    const sleepIn = async (h, n) => {
      p.home = h; p.homes = [0, 1, 2]; p.furn = {}; p.furn[h] = { girls: 1, girlsN: n }; delete p.rest;
      loadHub('home' + h, 'home'); if (G.seq) seqSkip();
      goSleep(); if (state === 'morning') $('bMorning').click();
      await new Promise(r => setTimeout(r, 600));
      return p.rest ? p.rest.n : 0;
    };
    try {
      fadeTo = f => { f(); return true; };
      o.room14 = await sleepIn(0, 3);
      o.studio1 = await sleepIn(1, 1);
      o.studio3 = await sleepIn(1, 3);
      o.inBed = G.npcs.filter(n => n.bed).length;
      // they turn towards you with an arm around you, and giggle as they climb in
      o.cuddle = G.npcs.filter(n => n.bed).map(n => n.cuddle === (G.player.z < n.z ? 1 : -1));
      o.giggled = !!SFX.giggle;
      o.base = Dd().hp + pk('tough');
      NOARRIVE = true; startLevel(0);
      o.job = { maxhp: G.player.maxhp, hp: G.player.hp };
      G.paid = 0; G.take = 100; payout(); o.after = !!p.rest;
      startLevel(0); o.next = G.player.maxhp;
    } finally { fadeTo = fade; }
    return o;
  });
  expect(out.room14).toBe(0);
  expect(out.studio1).toBe(1);
  expect(out.studio3).toBe(2);
  expect(out.inBed).toBe(2);
  expect(out.cuddle).toEqual([true, true]);
  expect(out.giggled).toBe(true);
  expect(out.job).toEqual({ maxhp: out.base + 2, hp: out.base + 2 });
  expect(out.after).toBe(false);
  expect(out.next).toBe(out.base);
});

// A massage instead of sleep: you lie face down, one girl sits on your back; getting up lets her go, and you can still go to bed after.
test('home: a girl gives you a massage on the bed', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm();
    p.home = 1; p.homes = [0, 1, 2]; p.furn = { 1: { girls: 1, girlsN: 2 } }; loadHub('home1', 'home'); if (G.seq) seqSkip();
    const o = {}, t = hubTargets(G).find(q => q.k === 'massage');
    o.label = t && t.lbl; t.fn(t);
    const q = G.massage && G.massage.q;
    for (let i = 0; i < 30; i++) { bedTick(G, 0.1); }
    const B = bigBedWorld(1, bedN());
    o.on = { prone: G.player.prone, bed: G.player.bed, girl: !!(q && q.massage && q.seatK === 1), onBed: Math.abs(q.z - B.z) < 0.3 && Math.abs(q.x - B.x) < B.s };
    o.noTarget = !hubTargets(G).some(q => q.k === 'massage');
    G.player.bedT = 0; bedTick(G, 0.1);
    o.off = { prone: !!G.player.prone, bed: G.player.bed, girl: !!q.massage, massage: !!G.massage };
    massageStart(G); tuckIn(G); o.sleep = { prone: !!G.player.prone, massage: !!G.massage, inBed: G.npcs.filter(n => n.bed).length };
    return o;
  });
  expect(out.label).toBe('GET A MASSAGE');
  expect(out.on).toEqual({ prone: true, bed: true, girl: true, onBed: true });
  expect(out.noTarget).toBe(true);
  expect(out.off).toEqual({ prone: false, bed: false, girl: false, massage: false });
  expect(out.sleep).toEqual({ prone: false, massage: false, inBed: 2 });
});
