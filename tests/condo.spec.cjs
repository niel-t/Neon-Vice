const { test, expect } = require('./fixtures.cjs');

// The Flamingo Arms deco condo (homes.js home 6): coming home up the lift must leave the player visible (the arrival used
// to start with a 'hide' step that nothing undid), whether the scene plays out or is skipped, and the condo lays its own
// deco floors and wall tiles (renderer.js 238-247) with the rounded furniture built in both looks.
test('flamingo condo: visible after the lift arrival, deco surfaces and furniture', async ({ openGame }) => {
  const page = await openGame();
  const o = await page.evaluate(() => {
    selIdx = 0; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg();
    p.wallet = 1e6; p.homes = [0, 6]; p.home = 6; p.furn = p.furn || {}; p.furn[6] = {};
    const fade = fadeTo, r = {};
    try {
      fadeTo = f => { f(); return true; };
      state = 'play';
      // the scene plays out
      goHome(); r.started = !!G.seq && G.rhome === 6;
      for (let i = 0; i < 200 && G.seq; i++) updateSeq(0.05);
      r.played = { seq: !!G.seq, hide: !!G.hideP, inCar: !!G.inCar };
      // the scene is skipped straight away
      goHome(); seqSkip(); r.skipped = { seq: !!G.seq, hide: !!G.hideP };
      // waking up and stepping out of the lift from the lobby
      enterHomeByLift(6); for (let i = 0; i < 200 && G.seq; i++) updateSeq(0.05); r.lift = !!G.hideP;
      const g = G, W = g.W, cell = (x, z) => z * W + x;
      r.floors = { living: g.floorX[cell(14, 10)], bed: g.floorX[cell(4, 10)], bath: g.floorX[cell(4, 15)], kitchen: g.floorX[cell(24, 11)], den: g.floorX[cell(24, 15)], hall: g.floorX[cell(14, 18)], balcony: g.floorX[cell(10, 7)], slider: g.floorX[cell(14, 8)] };
      const wall = (x, z, nx, nz) => g.wallF(x, z, nx, nz, cell(x, z));
      r.walls = { living: wall(8, 13, 0, 1), kitchen: wall(25, 8, 0, 1), bath: wall(5, 13, 0, 1), balcony: wall(10, 8, 0, -1) };
      r.atlas = [238, 239, 240, 241, 242, 243, 244, 245, 246, 247].every(t => ATILES.has(t));
      // furniture builds with and without the upgrades, in both looks
      for (const k of ['jukebox', 'bistro', 'neonsign']) p.furn[6][k] = 1; p.furn[6].girlsN = 2;
      const draw = () => { const B = new Batch(1 << 16); drawRHome(B, G); const n = B.n; gl.deleteBuffer(B.buf); return n; };
      SET.gfx2 = true; loadHub('home6', 'home'); if (G.seq) seqSkip(); r.drawNew = draw() > 2000; render();
      SET.gfx2 = false; loadHub('home6', 'home'); if (G.seq) seqSkip(); r.drawOld = draw() > 2000; render(); SET.gfx2 = true;
      r.free = !G.solid[Math.floor(G.player.z) * G.W + Math.floor(G.player.x)];
      r.seats = rhSeats(G).length;
    } finally { fadeTo = fade; }
    return r;
  });
  expect(o.started).toBe(true);
  expect(o.played).toEqual({ seq: false, hide: false, inCar: false });
  expect(o.skipped).toEqual({ seq: false, hide: false });
  expect(o.lift).toBe(false);
  expect(o.floors).toEqual({ living: 238, bed: 239, bath: 240, kitchen: 241, den: 230, hall: 242, balcony: 243, slider: 238 });
  expect(o.walls).toEqual({ living: 244, kitchen: 247, bath: 246, balcony: 245 });
  expect(o.atlas).toBe(true);
  expect(o.drawNew).toBe(true);
  expect(o.drawOld).toBe(true);
  expect(o.free).toBe(true);
  expect(o.seats).toBeGreaterThanOrEqual(5);
});
