const { test, expect } = require('./fixtures.cjs');

// Home guards stand beside the doors (no chairs under them), no bathroom fixture blocks a door, and you can sit:
// at the bar, on the sofas and chairs, and in the hot tub / jacuzzi with the party girls (who get out again with you).
test('home: door guards by the doors, doors clear, seats and the jacuzzi with the girls', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.wallet = 100000;
    const fade = fadeTo, o = { homes: [] };
    try {
      fadeTo = f => { f(); return true; };
      for (const h of [0, 1, 2]) {
        p.home = h; p.homes = [0, 1, 2]; p.furn = {}; p.furn[h] = { guards: 1, girlsN: 3, tub: 1, sofa: 1, deck: 1, sky: 1, pit: 1, dine: 1 };
        loadHub('home' + h, 'home'); if (G.seq) seqSkip();
        const g = G, W = g.W, rows = HUBS['home' + h].map, r = {};
        const cell = (x, z) => (rows[z - 1] || '')[x - 1] || '#', open = c => c === 'D' || (c !== '#' && c !== 'W' && c !== 'R' && c !== '~' && c !== 'y' && c !== 'e');
        const doorCells = []; rows.forEach((row, z) => [...row].forEach((c, x) => { if (c === 'D') doorCells.push([x + 1, z + 1]); }));
        const smokers = g.npcs.filter(n => n.kind === 'smoker');
        r.smokers = smokers.length;
        r.standing = smokers.every(n => !n.seat && !(n.y < 0));
        r.chairs = g.deco.filter(d => d.t === 'chair' || d.t === 'cigar').length;
        // a guard is "by the door" when a door or a wall opening is within 1.6 m
        const openings = doorCells.map(([x, z]) => [x + 0.5, z + 0.5]);
        // wall gaps: a floor cell in a wall row with wall on its left or right and floor above and below
        for (let z = 1; z < g.H - 1; z++) for (let x = 1; x < W - 1; x++) { const c = cell(x, z); if (c === '#' || c === 'D' || !open(c)) continue; if (open(cell(x, z - 1)) && open(cell(x, z + 1)) && (cell(x - 1, z) === '#' || cell(x + 1, z) === '#' || cell(x - 1, z) === 'W' || cell(x + 1, z) === 'W' || cell(x - 1, z) === 'R' || cell(x + 1, z) === 'R')) openings.push([x + 0.5, z + 0.5]); }
        const guards = g.npcs.filter(n => n.kind === 'smoker' || n.kind === 'bguard');
        r.guards = guards.length;
        r.byDoor = guards.every(n => openings.some(([x, z]) => Math.hypot(x - n.x, z - n.z) < 1.6));
        r.far = guards.filter(n => !openings.some(([x, z]) => Math.hypot(x - n.x, z - n.z) < 1.6)).map(n => n.kind + "@" + n.x.toFixed(1) + "," + n.z.toFixed(1));
        // nothing solid right inside or outside a door
        r.blocked = doorCells.filter(([x, z]) => { const ns = cell(x - 1, z) === '#' || cell(x + 1, z) === '#' ? [[x, z - 1], [x, z + 1]] : [[x - 1, z], [x + 1, z]]; return ns.some(([a, b]) => g.solid[b * W + a]); }).map(c => c.join(','));
        // seats: sit, the prompt turns into STAND UP, moving gets you up
        const seats = homeSeats(g); r.labels = [...new Set(seats.map(s => s.lbl))];
        const s0 = seats.find(s => !s.tub); hubInteract(); sitDown(g, s0); r.sat = g.player.seatK === 1 && Math.abs(g.player.x - s0.x) < 0.01;
        r.stand = hubTargets(g).map(t => t.lbl); seatUp(g); r.up = !g.seatP && g.player.seatK === 0;
        // the tub: the girls come in, then out again with you
        const ts = seats.find(s => s.tub);
        if (ts) {
          tubIn(g, ts); const gs = g.npcs.filter(n => n.kind === 'pgirl');
          r.inTub = gs.filter(n => n.tub).length; for (let i = 0; i < 30; i++) npcStep(1 / 30);
          r.stayed = gs.filter(n => n.tub).every(n => Math.hypot(n.x - ts.tub.x, n.z - ts.tub.z) < 1);
          r.tubLbl = hubTargets(g).map(t => t.lbl); seatUp(g);
          r.outTub = gs.filter(n => n.tub).length; r.outFree = gs.concat([g.player]).every(n => !g.solid[Math.floor(n.z) * W + Math.floor(n.x)]);
        }
        o.homes.push(r);
      }
    } finally { fadeTo = fade; }
    return o;
  });
  const [m, s, ph] = out.homes;
  for (const r of out.homes) {
    expect(r.standing).toBe(true);
    expect(r.chairs).toBe(0);
    expect(r.far).toEqual([]);
    expect(r.blocked).toEqual([]);
    expect(r.sat).toBe(true);
    expect(r.stand).toEqual(['STAND UP']);
    expect(r.up).toBe(true);
  }
  expect([m.smokers, s.smokers, ph.smokers]).toEqual([1, 1, 2]);
  expect([m.guards, s.guards, ph.guards]).toEqual([2, 3, 5]);
  expect(ph.labels).toEqual(expect.arrayContaining(['SIT AT THE BAR', 'SIT ON THE SOFA', 'GET IN THE JACUZZI', 'SIT ON THE DAYBED', 'SIT IN THE PIT', 'SIT AT THE TABLE']));
  expect(s.labels).toEqual(expect.arrayContaining(['SIT ON THE SOFA', 'SIT IN THE LOUNGE CHAIR', 'SIT ON THE BANQUETTE', 'GET IN THE HOT TUB']));
  expect(m.labels).toEqual(expect.arrayContaining(['SIT ON THE SOFA']));
  for (const r of [s, ph]) {
    expect(r.inTub).toBe(3);
    expect(r.stayed).toBe(true);
    expect(r.tubLbl).toEqual(['GET OUT']);
    expect(r.outTub).toBe(0);
    expect(r.outFree).toBe(true);
  }
});
