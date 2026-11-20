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

// Decorate (homelife.js): from the home phone, move furniture (carry it, it only goes down where it fits, it stays moved after a
// reload), paint the walls, lay a new floor in one room and re-finish what is built into a room; each costs money and saves.
test('home life: decorate mode moves furniture, paints walls, floors and finishes rooms', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.wallet = 1e6; p.home = 1; p.homes = [0, 1];
    p.furn = { 1: { wardrobe: 1, bench: 1, dine: 1 } }; p.deco = {};
    const fade = fadeTo, o = {};
    try {
      fadeTo = f => { f(); return true; };
      loadHub('home1', 'home'); if (G.seq) seqSkip(); state = 'play';
      openStore('home'); o.card = [...document.querySelectorAll('#sStore .scard')].some(b => b.dataset.hlact === 'open');
      hlDecorClick('open'); o.mode = storeMode; o.moveCards = [...document.querySelectorAll('#sStore [data-hlact^="mv:"]')].map(b => b.dataset.hlact).sort();
      /* paint, floor, finish */
      const w0 = p.wallet; hlDecorClick('paint:3'); hlDecorClick('room:bed'); hlDecorClick('floor:43'); hlDecorClick('fin:gold');
      o.paid = w0 - p.wallet; o.deco = JSON.stringify({ paint: p.deco[1].paint, floor: p.deco[1].floor, fin: p.deco[1].fin });
      const g = G, W = g.W, rows = g.def.map;
      let wall = null, bedFloor = null, liveFloor = null;
      for (let z = 1; z < g.H - 1 && !(wall && bedFloor && liveFloor); z++) for (let x = 1; x < W - 1; x++) { const ch = rows[z - 1][x - 1], i = z * W + x;
        if (ch === '#' && wall === null) wall = [g.wallT[i], g.tint[i]]; if (ch === '.' && hlRoomAt(1, x, z) === 'bed' && bedFloor === null) bedFloor = g.floorT[i]; if (ch === '.' && hlRoomAt(1, x, z) === 'live' && liveFloor === null) liveFloor = g.floorT[i]; }
      o.wall = wall; o.bedFloor = bedFloor; o.liveFloor = liveFloor;
      /* the finish recolours built-in boxes in that room only */
      o.fin = [hlFinRemap(1, TRS(3, 0.5, 13, 0, 1, 1, 1), [0.5, 0.5, 0.5]).join(), hlFinRemap(1, TRS(15, 0.5, 15, 0, 1, 1, 1), [0.5, 0.5, 0.5]).join(), hlFinRemap(1, TRS(3, 0.5, 13, 0, 1, 1, 1), [1, 0.2, 0.2], true).join()];
      closeStore();
      /* carry the wardrobe: into a wall is refused, the middle of the living room is fine */
      hlStartMove(G, 'wardrobe'); let pl = G.player; pl.x = 15.5; pl.z = 12.6; pl.a = Math.PI; hlMoveTick(G); o.badSpot = G.hlMove.ok; hlPlace(G); o.stillMoving = !!G.hlMove;
      o.bar = document.getElementById('hlMoveBar').style.display;
      pl.x = 15.5; pl.z = 17.6; pl.a = Math.PI; hlRotate(G); hlMoveTick(G); o.goodSpot = G.hlMove.ok; hlPlace(G);
      o.moved = !G.hlMove && !!p.deco[1].mv.wardrobe; const P = hlPosAll(G).wardrobe; o.solidAtNew = P.sol.every(([x, z]) => G.solid[z * G.W + x]);
      o.oldFree = !G.solid[13 * G.W + 8];
      o.target = hubTargets(G).some(t => t.lbl.startsWith('WARDROBE') && Math.hypot(t.x - P.use.x, t.z - P.use.z) < 0.01);
      /* a slot piece: the table and its chairs go together */
      hlStartMove(G, 'dine'); pl = G.player; pl.x = 12.5; pl.z = 19.0; pl.a = Math.PI; hlMoveTick(G); const ok = G.hlMove.ok, at = G.hlMove.at; hlPlace(G);
      o.dine = ok && Math.abs(G.slots.q.x - at.x) < 0.01 && Math.abs(G.slots.q.z - at.z) < 0.01 && homeSeats(G).filter(s => s.lbl === 'SIT AT THE TABLE').every(s => Math.hypot(s.x - at.x, s.z - at.z) < 1.2);
      /* cancel puts it back */
      hlStartMove(G, 'bench'); pl = G.player; const b0 = JSON.stringify(hlPosAll(G).bench.sol); pl.x = 20; pl.z = 18; hlMoveTick(G); hlCancel(G); o.cancel = !G.hlMove && JSON.stringify(hlPosAll(G).bench.sol) === b0;
      /* reset */
      openStore('home'); hlDecorClick('open'); hlDecorClick('mvreset'); o.reset = Object.keys(p.deco[1].mv).length === 0 && Math.abs(hlPosAll(G).wardrobe.x - HL_POS[1].wardrobe.x) < 0.01;
      closeStore();
      /* draw with a finish in both looks */
      o.errors = []; for (const enh of [true, false]) { SET.gfx2 = enh; try { IBhi.reset(); dynB.reset(); hlFinWrap(dynB, G, HB => { drawHomeDecor(HB, G); drawHome(HB, G); }); } catch (e) { o.errors.push(e.message); } }
      SET.gfx2 = true; o.ibBox = Object.prototype.hasOwnProperty.call(IBhi, 'box') ? typeof IBhi.box : 'proto';
    } finally { fadeTo = fade; }
    return o;
  });
  expect(out.card).toBe(true);
  expect(out.mode).toBe('hldecor');
  expect(out.moveCards).toEqual(['mv:bench', 'mv:dine', 'mv:wardrobe']);
  expect(out.paid).toBe(600 + 800 + 1500);
  expect(out.deco).toBe(JSON.stringify({ paint: 3, floor: { bed: 43 }, fin: { bed: 'gold' } }));
  expect(out.wall).toEqual([44, 53]);
  expect(out.bedFloor).toBe(43);
  expect(out.liveFloor).toBe(61);
  expect(out.fin[0]).not.toBe('0.5,0.5,0.5');
  expect(out.fin[1]).toBe('0.5,0.5,0.5');
  expect(out.fin[2]).toBe('1,0.2,0.2');
  expect(out.badSpot).toBe(false);
  expect(out.stillMoving).toBe(true);
  expect(out.bar).toBe('flex');
  expect(out.goodSpot).toBe(true);
  expect(out.moved).toBe(true);
  expect(out.solidAtNew).toBe(true);
  expect(out.oldFree).toBe(true);
  expect(out.target).toBe(true);
  expect(out.dine).toBe(true);
  expect(out.cancel).toBe(true);
  expect(out.reset).toBe(true);
  expect(out.errors).toEqual([]);
});
