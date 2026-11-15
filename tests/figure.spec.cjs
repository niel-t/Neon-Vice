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
  expect(o.big.seat).toBeGreaterThan(o.mid.seat + 0.05);
  expect(o.busts).toBeGreaterThanOrEqual(5);
  expect(o.seats).toBeGreaterThanOrEqual(5);
});
