const { test, expect } = require('./fixtures.cjs');

// Street blocks (streets.js): every hub street is cut into lots with their own buildings, and the McWey lobby has its own regulars.
test('streets: hub streets are a run of different buildings, the lobby has its cast', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    selIdx = 0; sessionReset(Math.min(JOBS.sel, JOBS.top)); arm();
    const out = {};
    // the venues (mall, club, Nine's) face the camera with their own fronts since #34, so only Ocean Drive has a row of lots
    for (const h of ['drive']) {
      loadHub(h, h === 'drive' ? 'parked' : undefined);
      const L = G.lots || [], names = L.map(l => l.name), W = G.W;
      // no generic window-box cell is left on the street, and no lot is narrower than two cells
      let generic = 0; for (let i = 0; i < W * G.H; i++) if (G.solid[i] && G.wallT[i] === 33 && G.tint[i] >= 0 && !G.wallX[i]) generic++;
      out[h] = { kinds: new Set(L.map(l => l.t)).size >= 4, uniqueNames: new Set(names).size === names.length, generic, narrow: L.filter(l => l.x1 - l.x0 < 1).length, kerb: G.kerb.length > 4 };
    }
    loadHub('lobby');
    const kinds = G.npcs.map(n => n.kind);
    out.lobby = { guests: kinds.filter(k => k === 'guest' || k === 'sitter').length, cast: new Set(G.npcs.filter(n => n.cast).map(n => n.kind)).size, talk: G.npcs.filter(n => n.cast).every(n => NPC_CHAT[n.kind] && NPCLINES[n.kind]) };
    // the routines run: the bellhop gets somewhere, and nothing throws
    const b = G.npcs.find(n => n.kind === 'bellhop'), x0 = b.x, z0 = b.z; G.player.x = 2; G.player.z = 11;
    for (let i = 0; i < 300; i++) { npcStep(1 / 30); }
    out.lobby.moved = Math.hypot(b.x - x0, b.z - z0) > 0.5;
    return out;
  })).toEqual({
    drive: { kinds: true, uniqueNames: true, generic: 0, narrow: 0, kerb: true },
    lobby: { guests: 0, cast: 10, talk: true, moved: true }
  });
});

test('lobby: gold McWEY CORP. counter, seats you can sit in, and calm tracks between jobs', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    selIdx = 0; sessionReset(Math.min(JOBS.sel, JOBS.top)); arm();
    loadHub('lobby');
    const out = {};
    // the counter draws its letters (one gold box per lit run) and the generic furniture desk is skipped
    const B = { round: 0.45, n: 0, box() { this.n++; }, quad() {} };
    drawMcDesk(B, G); out.desk = B.n > 120 && B.round === 0.45;
    const F = { n: 0, box() { this.n++; } }; let i = G.furn.indexOf(7); buildFurniture(F, G, i % G.W, (i / G.W) | 0, 7); out.oldDesk = F.n;
    // walk up to the free end of the cream sofa, sit, then stand up by moving
    const s = lobbySeats(G)[0], p = G.player; p.x = s.x + 0.2; p.z = s.z + 1.0;
    const sit = hubTargets(G).find(t => t.k === 'sit'); out.offered = !!sit;
    sitDown(G, sit.s); for (let k = 0; k < 10; k++) { hubInteract(); updatePlayer(1 / 30); for (const q of G.solids) boxPush(q, p); npcStep(1 / 30); if (G.seatP) seatHold(G); }
    out.seated = !!G.seatP && p.seatK === 1 && Math.hypot(p.x - s.x, p.z - s.z) < 0.01 && hubTargets(G).some(t => t.k === 'stand');
    keys.KeyS = true; updatePlayer(1 / 30); keys.KeyS = false;
    out.stood = !G.seatP && !p.seatK && p.y === 0;
    // seats with someone already in them are never offered
    out.noDouble = hubTargets(G).filter(t => t.k === 'sit').every(t => !G.npcs.some(n => Math.hypot(n.x - t.x, n.z - t.z) < 0.5));
    // every hub (and the car menu, shops and lift) plays one of the calm between-jobs tracks
    out.hubs = Object.entries(HUBS).filter(([, d]) => !String(d.track).startsWith('c_')).map(([k]) => k);
    out.tracks = ['c_pastel', 'c_palms', 'c_tide', 'c_vhs'].every(t => TRACKS[t] && TRACKS[t].bpm <= 96);
    return out;
  })).toEqual({ desk: true, oldDesk: 0, offered: true, seated: true, stood: true, noDouble: true, hubs: [], tracks: true });
});

test("nine of nine's: regulars with lines, sidewalk furniture you walk round, and the gold sign and street front draw", async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    selIdx = 0; sessionReset(Math.min(JOBS.sel, JOBS.top)); arm();
    loadHub('bunker');
    const cast = G.npcs.filter(n => n.cast), out = {};
    out.cast = new Set(cast.map(n => n.kind)).size;
    out.lines = cast.every(n => NPC_CHAT[n.kind] && NPCLINES[n.kind]);
    out.clear = cast.every(n => !isSolid(Math.floor(n.x), Math.floor(n.z)));
    out.kerb = G.kerb.length >= 6 && G.solids.length >= 6;
    const p = G.player; const c = cast.find(n => n.kind === 'biker'); p.x = c.x - 1; p.z = c.z;
    out.talk = hubTargets(G).some(t => t.k === 'talk' && t.n === c);
    const B = { round: 0.45, n: 0, box() { this.n++; }, quad() { this.n++; } }; drawNineFront(B, G); out.front = B.n > 100 && B.round === 0.45;
    for (let i = 0; i < 200; i++) npcStep(1 / 30);
    out.ok = cast.every(n => Number.isFinite(n.x) && Number.isFinite(n.z));
    return out;
  })).toEqual({ cast: 5, lines: true, clear: true, kerb: true, talk: true, front: true, ok: true });
});
