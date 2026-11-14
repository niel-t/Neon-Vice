const { test, expect } = require('./fixtures.cjs');

// Street blocks (streets.js): every hub street is cut into lots with their own buildings, and the McWey lobby has its own regulars.
test('streets: hub streets are a run of different buildings, the lobby has its cast', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    selIdx = 0; sessionReset(Math.min(JOBS.sel, JOBS.top)); arm();
    const out = {};
    for (const h of ['drive', 'dealer', 'bunker', 'club']) {
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
    dealer: { kinds: true, uniqueNames: true, generic: 0, narrow: 0, kerb: true },
    bunker: { kinds: true, uniqueNames: true, generic: 0, narrow: 0, kerb: true },
    club: { kinds: true, uniqueNames: true, generic: 0, narrow: 0, kerb: true },
    lobby: { guests: 0, cast: 10, talk: true, moved: true }
  });
});
