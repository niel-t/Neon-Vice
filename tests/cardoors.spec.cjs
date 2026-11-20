const { test, expect } = require('./fixtures.cjs');

// Getting in and out of a car: the driver's door swings open and shut, and the walk to and from it plays the walk cycle (vx/vz set).
const setup = () => { selIdx = 0; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.homes = [0, 1, 2]; };

test('car doors: leaving gets you in through an opening door, arriving gets you out of one, both with the walk cycle', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = {};
    try {
      fadeTo = () => true;
      /* step the hub scene, noting what the door and the player did */
      const run = (car, n) => { const r = { maxDoor: 0, walked: false, hidden: false, slid: 0 }; for (let i = 0; i < n && G.seq; i++) {
        const px = G.player.x, pz = G.player.z; updateHub(1 / 60); const moved = Math.hypot(G.player.x - px, G.player.z - pz) > 1e-4;
        if (moved && !G.hideP) { if (Math.hypot(G.player.vx, G.player.vz) > 0.4) r.walked = true; else r.slid++; }
        if (car.dr) r.maxDoor = Math.max(r.maxDoor, car.dr.t); if (G.hideP) r.hidden = true; if (!G.seq || G.seq.i >= G.seq.steps.length) break; }
        r.shut = !car.dr || car.dr.t === 0; r.slid = r.slid > 3; /* the last step of each walk lands with the velocity already cleared */ r.maxDoor = r.maxDoor > 0.9; return r; };
      // leaving Nine's: walk to the car, the door opens, you get in, it shuts
      loadHub('bunker'); while (G.seq) seqSkip(); G.player.x = G.park.x - 2; G.player.z = G.park.z - 2;
      departTo(() => {}, 'X', 'Y'); out.steps = G.seq.steps.map(s => s.k).join(' ');
      out.leave = run(G.park, 400);
      // pulling up at the club: the door opens, you step out of it, it shuts behind you
      loadHub('club'); hubArrive(G); out.arrive = run(G.park, 600); out.arrive.visible = !G.hideP;
      // Room 14
      myProg().home = 0; goHome(); out.home = run(G.hcar, 900);
      // a skipped scene leaves the door shut
      loadHub('club'); hubArrive(G); for (let i = 0; i < 200; i++) updateHub(1 / 60); seqSkip(); out.skipShut = !G.park.dr || G.park.dr.t === 0;
      // every car you can own has a door to open
      out.dims = ['beater', 'mid', 'spyder', 'testa', 'sig'].map(c => { myProg().car = c; return ['money', 'don', 'consigliere'].map(id => { const sv = selIdx; selIdx = CHARS.findIndex(q => q.id === id); const o = rideShapeNow(); const d = o.lambo ? 1 : carDoorDims(o); selIdx = sv; return !!d && (o.lambo || (d.x1 - d.x0 > 0.4 && d.y1 > d.y0)); }).every(Boolean); });
      return out;
    } finally { fadeTo = fade; }
  }, setup.toString())).toEqual({
    steps: 'walk in card wait drive call',
    leave: { maxDoor: true, walked: true, hidden: true, slid: false, shut: true },
    arrive: { maxDoor: true, walked: true, hidden: true, slid: false, shut: true, visible: true },
    home: { maxDoor: true, walked: true, hidden: true, slid: false, shut: true },
    skipShut: true, dims: [true, true, true, true, true]
  });
});

test('car doors: a mission drive-in opens the door for you, and the getaway walks you in before the results', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(setup => {
    eval('(' + setup + ')')();
    NOARRIVE = false; ARR_SEEN = -1; startLevel(1); const g = G, out = { arriving: !!g.arrive, maxDoor: 0, walked: false };
    for (let i = 0; i < 600 && g.arrive; i++) { update(1 / 60); if (g.car.dr) out.maxDoor = Math.max(out.maxDoor, g.car.dr.t); if (g.arrive && !g.arrive.hide && Math.hypot(g.player.vx, g.player.vz) > 0.4) out.walked = true; }
    out.done = !g.arrive; out.shut = g.car.dr.t === 0; out.maxDoor = out.maxDoor > 0.9;
    // clear the floor and walk up to the car
    for (const e of g.enemies) if (e.alive) { e.lex ? (e.spared = true) : killEnemy(e, 'pistol', [0, 1]); } if (g.obj) g.obj.done = true;
    for (let i = 0; i < 240 && !g.cleared; i++) { g.cameo = null; update(1 / 60); }
    g.player.x = g.car.x + 0.6; g.player.z = g.car.z - 1.4; update(1 / 60);
    out.leaving = !!g.leave && state === 'play'; let door = 0, hid = false;
    for (let i = 0; i < 400 && state === 'play'; i++) { update(1 / 60); if (g.car.dr) door = Math.max(door, g.car.dr.t); if (g.leave && g.leave.hide) hid = true; }
    out.leaveDoor = door > 0.9; out.hid = hid; out.results = state === 'results';
    return out;
  }, setup.toString());
  expect(r).toEqual({ arriving: true, maxDoor: true, walked: true, done: true, shut: true, leaving: true, leaveDoor: true, hid: true, results: true });
});

// See-through cars: cars drawn into the per-frame batch send their panes to the blended glass batch and get a fitted cabin,
// and the player's own model sits at the wheel whenever they are in the car (driving, pulling up, pulling away).
test('cars: see-through glass with a cabin, and you are at the wheel when driving, arriving and leaving', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = {}, dd = drawDriver; let drivers = 0, last = null;
    try {
      fadeTo = f => { f(); return true; };
      drawDriver = function (g, x, z, a, p) { drivers++; dd(g, x, z, a, p); last = g.pdrv; };
      // every car you can own: panes go to the glass batch, the body keeps none, the seat fits under the roof
      myProg().cars = Object.keys(CARS);
      out.glass = []; out.seats = [];
      for (const id of [0, 1, 2]) for (const k of Object.keys(CARS)) {
        selIdx = id; myProg().car = k; dynB.reset(); CARGLASS.length = 0; drawRide(dynB, 0, 0, 1, 0.4);
        out.glass.push(CARGLASS.length === 1 && CARGLASS[0][0].n >= 12);
        const o = rideShapeNow(); if (!o.lambo) { const S = carSeat(o); out.seats.push(S.top - S.y > 0.2 && Math.abs(S.x) < o.L / 2 - 0.3 && S.z < o.W / 2); }
      }
      out.glass = out.glass.every(Boolean); out.seats = out.seats.every(Boolean);
      // a car baked into another batch keeps its painted glass
      const SB = Batch.cpu(4096); CARGLASS.length = 0; drawCar(SB, 0, 0, [0.5, 0.5, 0.5], 1, 0, 'sedan'); out.baked = CARGLASS.length === 0 && SB.n > 2000;
      // traffic has somebody in it, parked cars do not
      dynB.reset(); drawCar(dynB, 0, 0, [0.5, 0.5, 0.5], 1, 0, 'sedan'); const empty = dynB.n; dynB.reset(); drawCar(dynB, 0, 0, [0.5, 0.5, 0.5], 1, 0, 'sedan', 1); out.traffic = dynB.n > empty;
      selIdx = 0; myProg().car = 'stallion';
      // driving Ocean Drive: you are in the seat, on the left, facing the way the car points
      loadHub('drive'); G.cine = null; drivers = 0; buildDynamic();
      const c = G.pcar, k = carAxes(c.h - Math.PI / 2), side = (last.x - c.x) * k.sx + (last.z - c.z) * k.sz;
      out.driving = drivers === 1 && side < -0.1 && last.drive === 1 && last.weapon === null && Math.abs(Math.sin(last.a) - k.fx) < 1e-6;
      // parked: you are on foot, nobody at the wheel
      loadHub('drive', 'parked'); drivers = 0; buildDynamic(); out.parked = drivers === 0;
      // leaving for the mall: once you are in, you are at the wheel as it pulls away, and as it pulls up at the other end
      openCarMenu(); $('bCarDealer').click();
      let n = 0, away = 0, up = 0, afoot = 0;
      while (G.seq && n++ < 4000) {
        updateHub(1 / 60); if (!G.seq) break; const s = G.seq.steps[G.seq.i]; drivers = 0; buildDynamic();
        if (s && s.k === 'drive' && G.def !== HUBS.mall && drivers === 1) away++;
        if (s && s.k === 'drive' && G.def === HUBS.mall && drivers === 1) up++;
        if (s && s.k === 'walk' && G.def === HUBS.mall) afoot += drivers;
      }
      out.away = away > 10; out.up = up > 10; out.afoot = afoot === 0; out.out = !G.hideP && !G.inCar;
      return out;
    } finally { fadeTo = fade; drawDriver = dd; }
  }, setup.toString());
  expect(r).toEqual({ glass: true, seats: true, baked: true, traffic: true, driving: true, parked: true, away: true, up: true, afoot: true, out: true });
});
