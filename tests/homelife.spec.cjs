const { test, expect } = require('./fixtures.cjs');

// Home life (homelife.js): the wardrobe, weight bench and minibar are on sale in Room 14, the studio and the penthouse (phone and
// Casa Bonita), they draw in both looks, block their cells without blocking a door, and each one does something: change outfit,
// work out once per job for XP, pour a drink (the camera sways). Room 14's TV talks. A party from the phone brings guests who
// dance until bed, once per job, and the first sleep after it brings a party morning.
test('home life: wardrobe, bench, minibar, TV and parties', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.wallet = 1e6; p.respect = 1; p.sharkDead = 1; p.lvl = 3;
    const fade = fadeTo, o = { homes: {}, errors: [] };
    try {
      fadeTo = f => { f(); return true; };
      for (const h of [0, 1, 2]) {
        const r = {};
        r.inShop = ['wardrobe', 'bench', 'bar'].filter(k => catOf(h).some(it => it.k === k));
        r.atMall = catOf(h).filter(it => !MALL_NOFURN.includes(it.k)).some(it => it.k === 'wardrobe');
        p.home = h; p.homes = [0, 1, 2, 3]; p.furn = {}; p.furn[h] = { tv: 1 }; p.party = null; p.gymKey = null;
        loadHub('home' + h, 'home'); if (G.seq) seqSkip(); state = 'play';
        r.before = hubTargets(G).filter(t => t.k === 'hl').map(t => t.lbl);
        for (const k of ['wardrobe', 'bench', 'bar']) if (catOf(h).some(it => it.k === k)) buyFurn(k);
        const g = G, W = g.W, P = HL_POS[h];
        r.after = hubTargets(g).filter(t => t.k === 'hl').map(t => t.lbl.split(' · ')[0]);
        r.solid = ['wardrobe', 'bench', 'bar'].every(k => P[k].sol.every(([x, z]) => g.solid[z * W + x]));
        r.useFree = ['wardrobe', 'bench', 'bar'].every(k => !g.solid[Math.floor(P[k].use.z) * W + Math.floor(P[k].use.x)]);
        /* no door gets a solid cell on either side of it */
        r.doorBlocked = []; for (let z = 1; z < g.H - 1; z++) for (let x = 1; x < W - 1; x++) if (g.rows[z][x] === 'D') {
          const horiz = '#W'.includes(g.rows[z][x - 1]) || '#W'.includes(g.rows[z][x + 1]); const ns = horiz ? [[x, z - 1], [x, z + 1]] : [[x - 1, z], [x + 1, z]];
          if (ns.some(([a, b]) => g.solid[b * W + a])) r.doorBlocked.push(x + ',' + z); }
        for (const enh of [true, false]) { SET.gfx2 = enh; IBhi.reset(); IBlo.reset(); dynB.reset(); g.cam.x = P.bench.x; g.cam.z = P.bench.z;
          try { const n0 = IBhi.n + IBlo.n; hlDraw(dynB, g); r[enh ? 'enhParts' : 'ps1Parts'] = IBhi.n + IBlo.n + dynB.n - n0; } catch (e) { o.errors.push(h + ': ' + e.message); } }
        SET.gfx2 = true;
        /* the wardrobe cycles what you own */
        const s0 = mySuit(); hlWardrobe(g); r.suit = [s0, mySuit()];
        /* the bench: XP once per job */
        const xp0 = p.xp + p.lvl * 1e5; hlWorkout(g); const xp1 = p.xp + p.lvl * 1e5; hlWorkout(g); r.gym = [xp1 > xp0, p.xp + p.lvl * 1e5 === xp1];
        /* a drink: buzzed, the camera sways */
        hlDrink(g); const e = [0, 8, 4], t = [0, 0, 0]; g.T = 3; hlSway(g, e, t); r.buzz = g.buzz > 0 && (t[0] !== 0 || t[2] !== 0);
        for (let i = 0; i < 6; i++) hlDrink(g); r.drinks = g.drinks;
        if (h === 0) { g.talkT = 0; hlTV(g); r.tv = g.talkT > 0; }
        o.homes[h] = r;
      }
      /* a party in the studio */
      p.home = 1; p.furn = { 1: {} }; p.party = null; p.mornKey = null; loadHub('home1', 'home'); if (G.seq) seqSkip(); state = 'play'; storeMode = 'home';
      const w0 = p.wallet; hlThrowParty(); const g = G;
      const gs = g.npcs.filter(n => n.kind === 'pguest');
      o.party = { paid: w0 - p.wallet, guests: gs.length, onFloor: gs.every(n => !g.solid[Math.floor(n.z) * g.W + Math.floor(n.x)] && g.rows[Math.floor(n.z)][Math.floor(n.x)] !== 'D'), card: hlPartyCard().includes('PARTY ON'), disco: !!g.disco };
      const w1 = p.wallet; hlThrowParty(); o.party.twice = w1 === p.wallet;
      for (let i = 0; i < 20; i++) npcStep(1 / 30);
      /* leave and come back the same night: the party is still on */
      loadHub('home1', 'home'); if (G.seq) seqSkip(); o.party.back = G.npcs.filter(n => n.kind === 'pguest').length;
      goSleep(); o.party.afterBed = G.npcs.filter(n => n.kind === 'pguest').length; o.party.morning = $('mnWho').textContent; o.party.partyMorning = HL_MORNING.some(m => m.who === o.party.morning);
      state = 'play'; show(null);
      /* the mansion: guests on the ground floor */
      p.home = 3; p.furn = { 3: {} }; p.party = null; loadHub('home3', 'home'); if (G.seq) seqSkip(); state = 'play'; hlThrowParty();
      o.mansion = G.npcs.filter(n => n.kind === 'pguest').length;
    } finally { fadeTo = fade; }
    return o;
  });
  expect(out.errors).toEqual([]);
  for (const h of [0, 1, 2]) {
    const r = out.homes[h];
    expect(r.inShop).toEqual(h === 2 ? ['wardrobe', 'bench'] : ['wardrobe', 'bench', 'bar']);
    expect(r.atMall).toBe(true);
    expect(r.before).toEqual(h === 0 ? ['WATCH TV'] : h === 2 ? ['THE BAR · POUR A DRINK'] : []);
    expect(r.after).toEqual(expect.arrayContaining(['WARDROBE', 'WEIGHT BENCH', h === 2 ? 'THE BAR' : 'POUR A DRINK']));
    expect(r.solid).toBe(true);
    expect(r.useFree).toBe(true);
    expect(r.doorBlocked).toEqual([]);
    expect(r.enhParts).toBeGreaterThan(30);
    expect(r.ps1Parts).toBeGreaterThan(30);
    expect(r.suit[0]).not.toBe(r.suit[1]);
    expect(r.gym).toEqual([true, true]);
    expect(r.buzz).toBe(true);
    expect(r.drinks).toBe(4);
  }
  expect(out.homes[0].tv).toBe(true);
  expect(out.party).toMatchObject({ paid: 2500, guests: 7, onFloor: true, card: true, disco: true, twice: true, back: 7, afterBed: 0, partyMorning: true });
  expect(out.mansion).toBe(12);
});
