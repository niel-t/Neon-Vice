const { test, expect } = require('./fixtures.cjs');

// Buyable home items (homeitems.js): with everything bought, every home draws in the enhanced and PS1 looks without errors,
// stays inside a per-frame budget that phones can carry, the pet tiger is gone from the shop and old saves that bought one
// get the Doberman guard dog instead.
test('home items: all upgrades draw in both looks within budget, tiger becomes a Doberman', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.wallet = 1e6; p.respect = 1; p.sharkDead = 1;
    const fade = fadeTo, o = { homes: {}, errors: [] };
    try {
      fadeTo = f => { f(); return true; };
      const all = t => { const f = {}; for (const it of catOf(t)) if (!['girls', 'guards'].includes(it.k)) f[it.k] = 1; return f; };
      o.tigerInShop = [0, 1, 2, 3].some(t => catOf(t).some(it => /tiger/i.test(it.k) && it.k !== 'tiger'));
      o.dobermanInShop = [2, 3].every(t => catOf(t).some(it => it.k === 'doberman'));
      for (const h of [0, 1, 2, 3]) {
        p.home = h; p.homes = [0, 1, 2, 3]; p.furn = {}; p.furn[h] = all(h);
        loadHub('home' + h, 'home'); if (G.seq) seqSkip();
        const r = {};
        for (const enh of [true, false]) {
          SET.gfx2 = enh; G.fixK = -1; IBhi.reset(); IBlo.reset(); dynB.reset();
          try { buildDynamic(); } catch (e) { o.errors.push(h + (enh ? ' enh: ' : ' ps1: ') + e.message); }
          r[enh ? 'enh' : 'ps1'] = { inst: IBhi.n + IBlo.n, tris: Math.round(dynB.n / 3) };
        }
        SET.gfx2 = true; o.homes[h] = r;
      }
      /* an old save with the tiger in the penthouse and the mansion */
      p.furn = { 2: { tigerpet: 1 }, 3: { tigerpet: 1 } }; p.home = 2; loadHub('home2', 'home'); if (G.seq) seqSkip();
      o.migrated = { f2: JSON.stringify(p.furn[2]), f3: JSON.stringify(p.furn[3]), pets: G.pets.map(q => q.k) };
      IBhi.reset(); dynB.reset(); for (const q of G.pets) drawPet(dynB, q, 3); o.dobDraw = IBhi.n + Math.round(dynB.n / 36);
    } finally { fadeTo = fade; }
    return o;
  });
  expect(out.errors).toEqual([]);
  expect(out.tigerInShop).toBe(false);
  expect(out.dobermanInShop).toBe(true);
  expect(out.migrated.f2).toBe('{"doberman":1}');
  expect(out.migrated.f3).toBe('{"doberman":1}');
  expect(out.migrated.pets).toEqual(['doberman']);
  expect(out.dobDraw).toBeGreaterThan(40);
  for (const h of [0, 1, 2, 3]) {
    const r = out.homes[h];
    // the furnished homes really draw something, but no home turns into a phone-melter
    expect(r.enh.inst + r.enh.tris).toBeGreaterThan(100);
    expect(r.enh.inst).toBeLessThan(3200);
    expect(r.enh.tris).toBeLessThan(160000);
    expect(r.ps1.tris).toBeLessThan(200000);
  }
  console.log(JSON.stringify(out.homes));
});
