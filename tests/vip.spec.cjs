const { test, expect } = require('./fixtures.cjs');

// Velvet Palms VIP room: pay $500, pick a dancer, the player sits in the booth chair while she dances,
// then it ends on a timer or when the player stands up.
test('club: book a VIP dance, sit through it, and stand up', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); arm(); myProg().wallet = 600;
    const fade = fadeTo, o = {};
    try {
      fadeTo = f => { f(); return true; };
      loadHub('club'); if (G.seq) seqSkip();
      const v = G.club.vip;
      o.door = hubTargets(G).some(t => t.k === 'vip');
      openStore('vip');
      o.screen = { state, mode: storeMode, cards: document.querySelectorAll('#sStore [data-vip]').length };
      document.querySelector('#sStore [data-vip="0"]').click();
      o.booked = { active: v.active, wallet: myProg().wallet, state };
      for (let i = 0; i < 30; i++) clubTick(1 / 30);
      o.seated = { x: G.player.x, z: G.player.z, lap: !!v.dancer.lapDance, end: hubTargets(G).some(t => t.k === 'vip_end') };
      // a second booking is refused without the cash
      openStore('vip'); document.querySelector('#sStore [data-vip="1"]').click();
      o.broke = { msg: $('stMsg').textContent, wallet: myProg().wallet }; closeStore();
      for (let i = 0; i < 40 * 30; i++) clubTick(1 / 30);
      o.after = { active: v.active, x: G.player.x, z: G.player.z, lap: G.club.dancers.some(d => d.lapDance) };
    } finally { fadeTo = fade; }
    return o;
  });
  expect(out.door).toBe(true);
  expect(out.screen).toEqual({ state: 'store', mode: 'vip', cards: out.screen.cards });
  expect(out.screen.cards).toBeGreaterThan(0);
  expect(out.booked).toEqual({ active: true, wallet: 100, state: 'play' });
  expect(out.seated).toEqual({ x: 26.5, z: 16.5, lap: true, end: true });
  expect(out.broke.wallet).toBe(100);
  expect(out.broke.msg).toMatch(/Not enough cash/);
  expect(out.after).toEqual({ active: false, x: 23.5, z: 16, lap: false });
  // the dancers (pole and lap dance) render without errors for a few frames
  await page.waitForTimeout(1500);
});
