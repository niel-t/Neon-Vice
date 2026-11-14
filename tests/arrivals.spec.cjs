const { test, expect } = require('./fixtures.cjs');

// Coming home and leaving places by car are skippable scenes (g.seq). These check where each one leaves you, skipped or not.
const setup = () => { selIdx = 0; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.homes = [0, 1, 2]; };

test('arrivals: each home has its own way in, and a skipped scene ends where the full one would', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      const at = () => [+G.player.x.toFixed(1), +G.player.z.toFixed(1)];
      // Room 14: the car pulls into the motel lot, you walk through the patio and in by the back door
      myProg().home = 0; goHome();
      out.room14 = { mode: HUBMODE, scene: !!G.seq, hidden: G.hideP };
      seqSkip(); out.room14.end = at(); out.room14.scene2 = !!G.seq; out.room14.car = !!G.hcar;
      // the Studio: The Seabreeze's lobby first, greeted by the concierge, then the elevator to floor 3
      myProg().home = 1; goHome();
      out.studio = { hub: G.def === HUBS.slobby, mode: HUBMODE, scene: !!G.seq };
      seqSkip(); out.studio.greeted = G.npcs.find(n => n.kind === 'concierge').said; out.studio.lobby = at();
      onHubTrigger('lift'); out.studio.elev = [state, $('elFloor').textContent, document.querySelector('#sElev .elT').textContent];
      skipElev(); updateElev(0.016);
      out.studio.home = [G.def === HUBS.home1, HUBMODE, !!G.seq]; seqSkip(); out.studio.inside = at();
      // the Penthouse: Coral Tower's garage, the private elevator from P1, out into the entrance hall
      myProg().home = 2; goHome();
      out.pent = { hub: G.def === HUBS.garage, scene: !!G.seq };
      seqSkip(); onHubTrigger('lift'); out.pent.floor = $('elFloor').textContent; skipElev(); updateElev(0.016);
      seqSkip(); out.pent.home = [G.def === HUBS.home2, HUBMODE]; out.pent.hall = at();
      // leaving the penthouse goes back down the private elevator before the drive
      // the door asks where to first; picking a destination rides the private elevator down before the drive
      G.trigLock = false; onHubTrigger('leave'); out.pent.menu = state; $('bCarShop').click(); out.pent.down = [state, $('elFloor').textContent];
      return out;
    } finally { fadeTo = fade; }
  }, setup.toString())).toEqual({
    room14: { mode: 'home', scene: true, hidden: true, end: [11.5, 8.8], scene2: false, car: true },
    studio: { hub: true, mode: 'arrive', scene: true, greeted: true, lobby: [10, 6], elev: ['elev', '01', 'THE SEABREEZE'], home: [true, 'home', true], inside: [15.5, 20.2] },
    pent: { hub: true, scene: true, floor: 'P1', home: [true, 'home'], hall: [15.9, 22.5], menu: 'carmenu', down: ['elev', '69'] }
  });
});

test('arrivals: leaving McWey drives off with a travel card, and Nine and the club open with a drive-in', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      loadHub('drive', 'parked'); openCarMenu(); $('bCarShop').click();
      out.depart = { scene: !!G.seq, hub: G.def.hub, steps: G.seq.steps.map(s => s.k).join(' ') };
      seqSkip(); out.bunker = { hub: G.def === HUBS.bunker, scene: !!G.seq, car: [+G.park.x.toFixed(1), +G.park.z.toFixed(1)] };
      seqSkip(); out.bunker.after = !!G.seq;
      openCarMenu(); $('bCarHome').click(); seqSkip(); out.home = { mode: HUBMODE, scene: !!G.seq };
      return out;
    } finally { fadeTo = fade; }
  }, setup.toString())).toEqual({
    depart: { scene: true, hub: 'drive', steps: 'walk in card wait drive call' },
    bunker: { hub: true, scene: true, car: [16.5, 26.5], after: false },
    home: { mode: 'home', scene: true }
  });
});

test('arrivals: the mall, the club and Nine park you in a bay out front, and you walk up the sidewalk and in through the front door', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      for (const [hub, kind] of [['mall', 'vic'], ['club', 'tony'], ['bunker', 'nine']]) {
        loadHub(hub); const g = G, L = g.lot;
        const r = { lot: !!L, bay: !!L && Math.abs(g.park.z - L.bayZ) < 0.6, others: !!L && L.cars.length > 0 && L.cars.every(c => Math.abs(c.x - g.park.x) > 3) };
        // the drive-in comes along the road and ends in your bay; leaving pulls out onto the road
        const path = venueArrivePath(g, g.park), dep = venueDepartPath(g, g.park);
        r.drive = Math.abs(path[0][1] - L.roadZ) < 0.01 && path[path.length - 1][0] === g.park.x && Math.abs(dep[dep.length - 1][1] - L.roadZ) < 0.01;
        while (g.seq) seqSkip();
        // you end up on the sidewalk, between your car and the building
        r.kerb = g.player.z < g.park.z && g.player.z > L.top - 3;
        // and you can walk from there through the front door to the keeper
        const W = g.W, seen = new Uint8Array(W * g.H), q = [Math.floor(g.player.z) * W + Math.floor(g.player.x)]; seen[q[0]] = 1;
        while (q.length) { const i = q.shift(), x = i % W, z = (i / W) | 0; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, nz = z + dz, j = nz * W + nx; if (nx < 0 || nz < 0 || nx >= W || nz >= g.H || seen[j] || g.solid[j] === 1) continue; seen[j] = 1; q.push(j); } }
        const n = g.npcs.find(k => k.kind === kind); let ok = false;
        for (let z = Math.floor(n.z) - 2; z <= Math.floor(n.z) + 2; z++) for (let x = Math.floor(n.x) - 2; x <= Math.floor(n.x) + 2; x++) if (seen[z * W + x] && Math.hypot(x + 0.5 - n.x, z + 0.5 - n.z) < 2.1) ok = true;
        r.walkIn = ok;
        out[hub] = r;
      }
      return out;
    } finally { fadeTo = fade; }
  }, setup.toString())).toEqual(Object.fromEntries(['mall', 'club', 'bunker'].map(h => [h, { lot: true, bay: true, others: true, drive: true, kerb: true, walkIn: true }])));
});
