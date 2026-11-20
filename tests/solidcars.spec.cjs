const { test, expect } = require('./fixtures.cjs');

// Solid cars: your car is as long as it looks against walls (nose and tail, not just the middle), traffic never moves into
// another car or into you, and you are pushed out of any traffic car you touch.
const setup = () => { selIdx = 0; sessionReset(Math.min(JOBS.sel, JOBS.top)); arm(); };

test('solid cars: no car drives through a wall, through another car, or through you', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      const boxes = g => g.traffic.map(t => trafficBox(t));
      // how deep any two traffic cars, or a traffic car and your car, are inside each other (0 = clear)
      const overlap = g => { const B = boxes(g); let m = 0;
        for (let i = 0; i < B.length; i++) for (let j = 0; j < i; j++) m = Math.max(m, Math.min(B[i].hx + B[j].hx - Math.abs(B[i].x - B[j].x), B[i].hz + B[j].hz - Math.abs(B[i].z - B[j].z)));
        return m; };
      const inMe = g => { let m = 0; for (const b of boxes(g)) for (const q of carCircles(g.pcar)) m = Math.max(m, q[2] - Math.hypot(Math.max(0, Math.abs(q[0] - b.x) - b.hx), Math.max(0, Math.abs(q[1] - b.z) - b.hz))); return m; };
      const inWall = c => carCircles(c).some(q => isBlock(Math.floor(q[0]), Math.floor(q[1])));
      const drive = (g, inp, n, each) => { for (let k = 0; k < n; k++) { carStep(g, g.pcar, inp, 1 / 60); if (g.def.hub === 'cruise') cruiseTraffic(g, 1 / 60); else { trafficMove(g, 1 / 60); carVsTraffic(g, 1 / 60); } each(k); } };

      // ---- the Empire streets: traffic on both axes ----
      cruiseGo('cigar', 'CALLE OCHO CIGARS', '', 'LITTLE HAVANA');
      let g = G, c = g.pcar;
      out.cruise = g.def.hub === 'cruise' && g.traffic.length > 15 && g.traffic.some(t => t.ax === 'z');
      // traffic alone for a minute and a half: nobody ends up inside anybody, and it keeps flowing (no gridlock)
      const far = { x: c.x, z: c.z }; let worst = 0, moved = 0, inWalls = 0; const x0 = g.traffic.map(t => t.x + t.z);
      c.x = -40; c.z = -40;
      for (let k = 0; k < 5400; k++) { const before = g.traffic.map(t => t.x + t.z); trafficMove(g, 1 / 60); worst = Math.max(worst, overlap(g)); if (g.traffic.some(t => t.x > 0 && t.z > 0 && t.x < g.W && t.z < g.H && isBlock(Math.floor(t.x), Math.floor(t.z)))) inWalls++; if (k > 5000) g.traffic.forEach((t, i) => { if (Math.abs(t.x + t.z - before[i]) > 1e-6) moved++; }); }
      // the roads leave the map through underpasses, so the traffic never drives into the end wall
      out.tunnels = g.portals.length === 14 && inWalls === 0;
      out.trafficClear = worst < 0.02; out.flows = moved > 400 * g.traffic.length * 0.5;
      // parked across a lane: the traffic queues behind you instead of driving through
      c.x = far.x; c.z = far.z; c.vx = c.vz = c.v = 0;
      const clearX = x => x > 8 && x < g.W - 8 && !CRUISE_V.some(x0 => x > x0 - 2 && x < x0 + 7);
      const lane = g.traffic.find(t => t.ax !== 'z' && clearX(t.x + t.dir * 9) && clearX(t.x)); c.x = lane.x + lane.dir * 9; c.z = lane.z; c.h = 0;
      g.traffic = g.traffic.filter(t => !boxCirc(trafficBox(t), [c.x, c.z, 2.2], 0));
      let hitMe = 0; const lx = lane.x;
      for (let k = 0; k < 1500; k++) { trafficMove(g, 1 / 60); hitMe = Math.max(hitMe, inMe(g)); }
      out.queues = hitMe < 0.05 && (lane.x - lx) * lane.dir > 3 && lane.cur === 0;
      // ramming them: you are pushed back out, never left inside one
      let stuckIn = 0, walled = 0;
      for (const [thr, st] of [[1, 0], [1, 0.6], [1, -0.6], [-0.7, 0.3], [1, 1]]) drive(g, { thr, st, hand: false, turbo: true }, 420, () => { stuckIn = Math.max(stuckIn, inMe(g)); if (inWall(c)) walled++; worst = Math.max(worst, overlap(g)); });
      out.pushedOut = stuckIn < 0.06; out.noWall = walled === 0; out.stillClear = worst < 0.02; out.finite = [c.x, c.z, c.h, c.vx, c.vz].every(Number.isFinite);

      // ---- Ocean Drive: the long way into every wall, at every angle ----
      loadHub('drive'); g = G; c = g.pcar; G.cine = null;
      let through = 0, deep = 0, crash = 0; const home = { x: c.x, z: c.z };
      for (let a = 0; a < 16; a++) { c.x = home.x; c.z = home.z; c.h = a * Math.PI / 8; c.vx = c.vz = c.v = 0; g.traffic = [];
        drive(g, { thr: 1, st: a % 3 - 1, hand: a % 4 === 0, turbo: true }, 300, () => { if (inWall(c)) through++; }); }
      out.walls = through === 0;
      // Ocean Drive traffic: no car inside another over a minute, and none inside you while you weave through it
      loadHub('drive'); g = G; c = g.pcar; G.cine = null; worst = 0;
      for (let k = 0; k < 1800; k++) { trafficMove(g, 1 / 60); worst = Math.max(worst, overlap(g)); }
      for (const st of [0, 0.5, -0.5, 1, -1, 0]) drive(g, { thr: 1, st, hand: false, turbo: false }, 300, () => { deep = Math.max(deep, inMe(g)); worst = Math.max(worst, overlap(g)); if (inWall(c)) crash++; });
      out.ocean = g.portals.length === 2 && worst < 0.02 && deep < 0.06 && crash === 0;
      return out;
    } finally { fadeTo = fade; }
  }, setup.toString());
  expect(r).toEqual({ cruise: true, tunnels: true, trafficClear: true, flows: true, queues: true, pushedOut: true, noWall: true, stillClear: true, finite: true, walls: true, ocean: true });
});
