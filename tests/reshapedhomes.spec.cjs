const { test, expect } = require('./fixtures.cjs');

// Reshaped realty homes (homes.js, 2026-11-25): the Low Tide's real hull and cabin, the casita's L-shaped bungalow with a
// carport, Casa del Sol's open courtyard and tower. Each home uses its own floor tiles (renderer.js 248-253), and every
// spot you need to reach (the wardrobe, bench, minibar, locker, seats) can be walked to from where you arrive.
test('reshaped homes: own floors, and every use spot is reachable on foot', async ({ openGame }) => {
  const page = await openGame();
  const o = await page.evaluate(() => {
    selIdx = 0; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg();
    p.wallet = 1e6; p.homes = [0, 4, 5, 7]; p.sharkDead = 1; p.furn = p.furn || {};
    const r = { atlas: [248, 249, 250, 251, 252, 253].every(t => ATILES.has(t)), homes: {} };
    for (const t of [4, 5, 7]) {
      p.home = t; p.furn[t] = Object.fromEntries(catOf(t).map(it => [it.k, 1]));
      loadHub('home' + t, 'home'); if (G.seq) seqSkip(); state = 'play';
      const g = G, W = g.W, seen = new Uint8Array(W * g.H), q = [];
      const at = (x, z) => Math.floor(z) * W + Math.floor(x);
      const s0 = at(g.player.x, g.player.z); seen[s0] = 1; q.push(s0);
      while (q.length) { const i = q.pop(), x = i % W, z = (i / W) | 0; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = (z + dz) * W + x + dx; if (!seen[j] && !g.solid[j]) { seen[j] = 1; q.push(j); } } }
      const d = RH_DEF[t], spots = Object.values(d.hl).map(h => h.use).concat(rhSeats(g).filter(s => s.out).map(s => s.out));
      const tiles = new Set(); for (let i = 0; i < W * g.H; i++) if (g.floorX && g.floorX[i]) tiles.add(g.floorX[i]);
      r.homes[t] = { tiles: [...tiles].sort(), unreached: spots.filter(s => !seen[at(s.x, s.z)]).map(s => [s.x, s.z]), bed: seen[at(d.bedW.x + 1.2, d.bedW.z + 2.2)] === 1 };
    }
    // the houseboat's bow is a point: water either side of the foredeck tip, deck down the middle
    p.home = 5; loadHub('home5', 'home'); if (G.seq) seqSkip();
    const g = G, c = (x, z) => g.rows[z][x];
    r.bow = [c(2, 9), c(2, 6), c(2, 12)].join('');
    return r;
  });
  expect(o.atlas).toBe(true);
  expect(o.homes[5].tiles).toEqual([248, 249]);
  expect(o.homes[4].tiles).toEqual([250, 252, 253]);
  expect(o.homes[7].tiles).toEqual([251, 252]);
  for (const t of [4, 5, 7]) expect(o.homes[t].unreached).toEqual([]);
  expect(o.bow).toBe('u~~');
});
