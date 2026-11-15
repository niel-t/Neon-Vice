const { test, expect } = require('./fixtures.cjs');

// The girls' hairstyles: new long styles (waist-length, waves, box braids) and afros; girls with dark skin mostly wear an afro,
// an afro puff or braids in natural dark shades. Every style builds its own hair mesh.
test('hair: new long styles and afros build, and dark-skinned girls mostly get afros', async ({ openGame }) => {
  const page = await openGame();
  const o = await page.evaluate(() => {
    const base = dancerLook(0, 0, Object.assign(dancerProf(0), { hs: null })), V = hs => PS2C.lookVerts(Object.assign({}, base, { hs, hair: [0.1, 0.08, 0.07] })).head;
    const bald = V(null), heads = {};
    for (const hs of ['long', 'xlong', 'waves', 'braids', 'afro', 'puff']) heads[hs] = V(hs) - bald;
    let dark = 0, afro = 0, light = 0, lightLong = 0, natural = true;
    for (let i = 0; i < 400; i++) { const P = dancerProf(i); if (darkSkin(P.sk)) { dark++; if (AFRO_HS.has(P.hs)) { afro++; if (Math.max(...P.hair) > 0.4) natural = false; } } else { light++; if (['long', 'xlong', 'waves'].includes(P.hs)) lightLong++; } }
    return { heads, dark, afroShare: afro / dark, natural, longShare: lightLong / light };
  });
  for (const hs in o.heads) expect(o.heads[hs], hs).toBeGreaterThan(0);
  expect(o.heads.braids).toBeGreaterThan(o.heads.xlong);
  expect(o.dark).toBeGreaterThan(50);
  expect(o.afroShare).toBeGreaterThan(0.6);
  expect(o.natural).toBe(true);
  expect(o.longShare).toBeGreaterThan(0.5);
});
