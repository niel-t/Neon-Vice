const { test, expect } = require('./fixtures.cjs');

// Velvet Palms: book a $500 VIP room with Tony, pick a girl, she steps off the stage and walks with you,
// the dance starts when you are both inside one of the private rooms, and she walks back to her pole afterwards.
test('club: book a VIP room with Tony, walk her to a private room, and she goes back to the stage', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); arm(); myProg().wallet = 600;
    const fade = fadeTo, o = {}, tick = (s, until) => { for (let i = 0; i < s * 30; i++) { clubTick(1 / 30); if (until && until()) return true; } return false; };
    try {
      fadeTo = f => { f(); return true; };
      loadHub('club'); if (G.seq) seqSkip();
      const c = G.club, v = c.vip, p = G.player;
      o.layout = { rooms: c.rooms.length, doors: G.doors.length, bouncer: G.npcs.some(n => n.kind === 'bouncer'), floor: G.floorT[(c.room.z0 + 2) * G.W + 5], wall: G.def.wall };
      o.girls = ['ling', 'curve'].map(k => new Set(c.dancers.map(d => d.look[k])).size).concat(new Set(c.dancers.map(d => d.look.hair.join())).size);
      p.x = c.tony.x - 1.5; p.z = c.tony.z;
      o.tony = (hubTargets(G).find(t => t.k === 'tony') || {}).lbl;
      openStore('vip');
      o.screen = { state, mode: storeMode, girls: document.querySelectorAll('#sStore [data-vip]').length, chat: !!document.querySelector('#sStore [data-vipchat]') };
      document.querySelector('#sStore [data-vip="0"]').click();
      const d = c.dancers[0];
      o.booked = { escort: !!v.escort, walking: !!d.walking, wallet: myProg().wallet, state, tip: hubTargets(G).some(t => t.k === 'tip' && t.d === d) };
      // a second booking is refused while she is with you
      openStore('vip'); document.querySelector('#sStore [data-vip="1"]').click();
      o.second = { msg: $('stMsg').textContent, wallet: myProg().wallet }; closeStore();
      tick(1.2);
      o.stepped = { y: d.y, onStage: d.x > G.stage.x0 && d.x < G.stage.x1 && d.z > G.stage.z0 && d.z < G.stage.z1 };
      // walk into VIP room 2: she follows through the door and the dance starts
      const r = c.rooms[1]; p.x = r.chairX; p.z = r.z0 + 1.6;
      o.arrived = tick(20, () => v.active);
      o.dance = { room: v.room && v.room.n, x: p.x, z: p.z, lap: !!d.lapDance, end: hubTargets(G).some(t => t.k === 'vip_end'), inRoom: d.x > r.x0 && d.x < r.x1 && d.z > r.z0 && d.z < r.z1 };
      tick(30);
      o.after = { active: v.active, standing: p.z < r.chairZ - 1, back: !!c.back };
      o.home = tick(40, () => !d.walking);
      o.pole = Math.hypot(d.x - d.pole.x, d.z - d.pole.z) < 0.6;
      // no cash, no room
      openStore('vip'); document.querySelector('#sStore [data-vip="2"]').click();
      o.broke = { msg: $('stMsg').textContent, wallet: myProg().wallet }; closeStore();
      // every routine keeps her near her own pole
      const moves = new Set(); let far = 0;
      for (let i = 0; i < 60 * 30; i++) { clubTick(1 / 30); for (const q of c.dancers) { moves.add(q.move); if (Math.hypot(q.x - q.pole.x, q.z - q.pole.z) > 0.9) far++; } }
      o.moves = moves.size; o.far = far;
    } finally { fadeTo = fade; }
    return o;
  });
  expect(out.layout).toEqual({ rooms: 3, doors: 5, bouncer: true, floor: 43, wall: 19 });
  // three different girls: lingerie style, body size and hair colour all differ
  expect(out.girls).toEqual([3, 3, 3]);
  expect(out.tony).toMatch(/BOOK A VIP ROOM/);
  expect(out.screen).toEqual({ state: 'store', mode: 'vip', girls: 3, chat: true });
  expect(out.booked).toEqual({ escort: true, walking: true, wallet: 100, state: 'play', tip: false });
  expect(out.second.wallet).toBe(100);
  expect(out.second.msg).toMatch(/already have a girl/);
  expect(out.stepped).toEqual({ y: 0, onStage: false });
  expect(out.arrived).toBe(true);
  expect(out.dance).toEqual({ room: 2, x: out.dance.x, z: out.dance.z, lap: true, end: true, inRoom: true });
  expect(out.after).toEqual({ active: false, standing: true, back: true });
  expect(out.home).toBe(true);
  expect(out.pole).toBe(true);
  expect(out.broke.wallet).toBe(100);
  expect(out.broke.msg).toMatch(/Not enough cash/);
  expect(out.moves).toBeGreaterThanOrEqual(4);
  expect(out.far).toBe(0);
  await page.waitForTimeout(1000);
});
