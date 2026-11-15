const { test, expect } = require('./fixtures.cjs');

// Velvet Palms is busy: no blocked kerb tiles on the floor, people sitting in the booths, at the bar and the stage rail,
// people at high-top tables, a DJ, security inside and a bouncer at the front door, and guests who take a dancer to a VIP room.
test('club life: patrons, security, a door bouncer, and a guest takes a dancer to a VIP room and back', async ({ openGame }) => {
  const page = await openGame();
  const o = await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); arm();
    const fade = fadeTo, r = {};
    try {
      fadeTo = f => { f(); return true; };
      loadHub('club'); if (G.seq) seqSkip();
      const c = G.club, R = c.room;
      // every main-room cell that looks like floor can be walked on, except the stage, the bar, the booths and the new fixtures
      let kerb = 0; for (let z = R.z0; z < R.z1; z++) for (let x = R.x0; x < R.x1; x++) if (G.rows[z][x] === 'v') kerb++;
      r.kerb = kerb;
      r.guests = G.npcs.filter(n => n.kind === 'guest').length;
      r.seated = G.npcs.filter(n => n.kind === 'patron' && n.seat).length;
      r.standing = G.npcs.filter(n => n.kind === 'patron' && !n.seat && !n.clubdj).length;
      r.dj = G.npcs.some(n => n.clubdj);
      r.security = G.npcs.filter(n => n.kind === 'bouncer').length;
      r.doorman = !!(c.doorman && c.doorman.z > c.front.z && Math.abs(c.doorman.x - c.front.x) < 2);
      // a guest picks a dancer and they go to a VIP room; she dances for him there; then she goes back to her pole
      c.nvT = 0; let saw = {}, n = null, d = null, room = null;
      for (let i = 0; i < 30 * 120; i++) {
        clubTick(1 / 30); npcStep(1 / 30);
        const s = c.nv; if (s) { n = s.n; d = s.d; room = s.r; saw[s.ph] = 1; if (s.ph === 'dance') { saw.inRoom = saw.inRoom || (inRoom(room, n.x, n.z) && inRoom(room, d.x, d.z) && d.lapDance); saw.busyRoom = clubRoomBusy(G, room); } }
        if (saw.back && !c.nv) break;
      }
      r.visit = { phases: Object.keys(saw).filter(k => ['down', 'go', 'dance', 'back'].includes(k)).sort(), inRoom: !!saw.inRoom, busy: !!saw.busyRoom, done: !c.nv, girlHome: d && !d.walking && !d.lapDance && Math.hypot(d.x - d.pole.x, d.z - d.pole.z) < 0.6, guestFree: n && !n.busy };
      // the lounge decor draws
      const boxes = []; drawClubX({ box: m => boxes.push(m) }, G); r.decor = boxes.length;
    } finally { fadeTo = fade; }
    return r;
  });
  expect(o.kerb).toBe(0);
  expect(o.guests).toBeGreaterThanOrEqual(10);
  expect(o.seated).toBeGreaterThanOrEqual(8);
  expect(o.standing).toBeGreaterThanOrEqual(4);
  expect(o.dj).toBe(true);
  expect(o.security).toBeGreaterThanOrEqual(6);
  expect(o.doorman).toBe(true);
  expect(o.visit).toEqual({ phases: ['back', 'dance', 'down', 'go'], inRoom: true, busy: true, done: true, girlHome: true, guestFree: true });
  expect(o.decor).toBeGreaterThan(150);
});
