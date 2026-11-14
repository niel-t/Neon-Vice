const { test, expect } = require('./fixtures.cjs');

// Party girls at home: hired one at a time (up to three), each one different; one girl makes the bed a double (Studio and Penthouse; Room 14 keeps its single bed),
// two or more a bed for three, and the girls who fit come to bed with you when you sleep.
test('home: hire party girls one by one, the bed grows, and they come to bed with you', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.wallet = 100000;
    const fade = fadeTo, o = { homes: [] };
    try {
      fadeTo = f => { f(); return true; };
      for (const h of [0, 1, 2]) {
        p.home = h; p.homes = [0, 1, 2]; p.furn = {}; loadHub('home' + h, 'home'); if (G.seq) seqSkip();
        const r = { bed: [bedN()] };
        openStore('home');
        for (let i = 0; i < 4; i++) { buyFurn('girls'); r.bed.push(bedN()); }
        r.msg = $('stMsg').textContent; closeStore();
        const gs = G.npcs.filter(n => n.kind === 'pgirl');
        r.girls = gs.length; r.distinct = new Set(gs.map(n => n.look.hair.join() + n.look.ling)).size;
        r.label = (hubTargets(G).find(t => t.k === 'bed') || {}).lbl;
        if (h === 0) { o.homes.push(r); continue; }
        tuckIn(G); bedTick(G, 0.1);
        const B = bigBedWorld(h, bedN()), inBed = [G.player].concat(gs).filter(c => c.bed);
        r.inBed = inBed.length; r.onBed = inBed.every(c => Math.abs(c.z - B.z) < B.w / 2 && Math.abs(c.x - B.x) < 1.2 * B.s);
        for (let i = 0; i < 20 * 10; i++) bedTick(G, 0.1);
        r.waited = inBed.every(c => c.bed);
        G.player.bedT = 0; for (let i = 0; i < 10 * 10; i++) bedTick(G, 0.1);
        r.girlsUp = inBed.every(c => !c.bed);
        o.homes.push(r);
      }
      // old saves that bought the pair keep both girls
      o.legacy = girlsN({ girls: 1 });
    } finally { fadeTo = fade; }
    return o;
  });
  // Room 14 is still the poor man's place: the girls come, the single bed stays
  expect(out.homes[0].bed).toEqual([1, 1, 1, 1, 1]);
  expect(out.homes[0].label).toBe('GO TO SLEEP');
  expect(out.homes[0].girls).toBe(3);
  for (const r of out.homes.slice(1)) {
    expect(r.bed).toEqual([1, 2, 3, 3, 3]);
    expect(r.msg).toMatch(/fire hazard/);
    expect(r.girls).toBe(3);
    expect(r.distinct).toBe(3);
    expect(r.label).toBe('GO TO BED WITH THE GIRLS');
    expect(r.inBed).toBe(3);
    expect(r.onBed).toBe(true);
    expect(r.waited).toBe(true);
    expect(r.girlsUp).toBe(true);
  }
  expect(out.legacy).toBe(2);
});
