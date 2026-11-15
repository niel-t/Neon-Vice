const { test, expect } = require('./fixtures.cjs');

// The girls' figures: a round bust (not a cone) and real size variety, from petite to very full, for both the bust and the seat.
// lookFigure measures how far the built body sticks out in front at the chest and behind at the seat.
test('figure: bust and seat sizes really differ and dancers get a spread of sizes', async ({ openGame }) => {
  const page = await openGame();
  const o = await page.evaluate(() => {
    const base = Object.assign(dancerLook(0, 0, dancerProf(0)), { curve: 1, waist: 0.8 });
    const F = (bust, hips) => PS2C.lookFigure(Object.assign({}, base, { bust, hips }));
    const small = F(0.62, 0.6), mid = F(1.02, 1.0), big = F(1.62, 1.62);
    const busts = new Set(), seats = new Set();
    for (let i = 0; i < 120; i++) { const L = dancerLook(i, 0, dancerProf(i)); busts.add(Math.round(L.bust * 5)); seats.add(Math.round(L.hips * 5)); }
    return { small, mid, big, busts: busts.size, seats: seats.size };
  });
  expect(o.mid.bust).toBeGreaterThan(o.small.bust + 0.03);
  expect(o.big.bust).toBeGreaterThan(o.mid.bust + 0.05);
  expect(o.mid.seat).toBeGreaterThan(o.small.seat + 0.03);
  expect(o.big.seat).toBeGreaterThan(o.mid.seat + 0.04);
  expect(o.busts).toBeGreaterThanOrEqual(5);
  expect(o.seats).toBeGreaterThanOrEqual(5);
});

// Bubble-butt physics: each cheek is a spring on the pelvis. A bouncing body makes it wobble, a slap kicks it, and it settles; men have none.
test('figure: the seat jiggles with the body, bounces on a slap and settles', async ({ openGame }) => {
  const page = await openGame();
  const o = await page.evaluate(() => {
    startLevel(0); state = 'pause';
    const c = makeChar(1, 1, dancerLook(0, 0), false), m = makeChar(3, 1, Object.assign({}, G.enemies[0].look, { fem: false }), false);
    const draw = (q, t) => { PS2C.beginFrame(); return PS2C.add(q, 'game', 1, t, null, 'look'); };
    for (let i = 0; i < 30 && !(draw(c, 0) && draw(m, 0)); i++);
    let bounce = 0, t = 0;
    for (let i = 1; i <= 90; i++) { t = i / 60; c.y = m.y = 0.04 * Math.sin(t * 2 * Math.PI * 2.5); draw(c, t); draw(m, t); bounce = Math.max(bounce, Math.abs(c._bb.q[0][1]), Math.abs(c._bb.q[1][1])); }
    c.y = 0; for (let i = 0; i < 240; i++) { t += 1 / 60; draw(c, t); }
    const rest = Math.max(...c._bb.q.flat().map(Math.abs));
    c.slapT = 0.8; let slap = 0; for (let i = 0; i < 20; i++) { t += 1 / 60; c.slapT = Math.max(0, c.slapT - 1 / 60); draw(c, t); slap = Math.max(slap, c._bb.q[0][2]); }
    return { bounce, rest, slap, male: !!m._bb };
  });
  expect(o.bounce).toBeGreaterThan(0.004);
  expect(o.rest).toBeLessThan(0.002);
  expect(o.slap).toBeGreaterThan(0.004);
  expect(o.male).toBe(false);
});
