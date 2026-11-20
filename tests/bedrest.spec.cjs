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
  expect(out.job).toEqual({ maxhp: out.base + 2, hp: out.base + 2 });
  expect(out.after).toBe(false);
  expect(out.next).toBe(out.base);
});
