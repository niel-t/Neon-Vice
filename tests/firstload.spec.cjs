const { test, expect } = require('./fixtures.cjs');

// First-sight stutter: people in a new area are built while it loads (nearest first) and in idle time, not one per frame on sight.
test('first load: people are built as an area loads and the rest drain in the background', async ({ openGame }) => {
  test.setTimeout(120_000);
  const page = await openGame();
  await expect.poll(() => page.evaluate(() => PS2C.ready)).toBe(true);
  await page.evaluate(() => loadHub('club'));
  // the club's first frame builds a batch of its people straight away, not just one
  // (stop the game loop for a moment to look at what the first frame alone did)
  const built = await page.evaluate(() => new Promise(done => { const g = G; requestAnimationFrame(() => requestAnimationFrame(() =>
    done(g === G ? G.npcs.filter(c => c.look && c._ps2k).length : -1))); }));
  expect(built).toBeGreaterThan(3);
  // and nobody is left waiting a few seconds later
  await expect.poll(() => page.evaluate(() => PS2C.warmLeft), { timeout: 60_000 }).toBe(0);
});

test('first load: the face painter gives the same face for the same look', async ({ openGame }) => {
  const page = await openGame();
  await expect.poll(() => page.evaluate(() => PS2C.ready)).toBe(true);
  const same = await page.evaluate(() => {
    const hash = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 2166136261; for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619); return h >>> 0; };
    startLevel(0); const looks = G.enemies.map(e => e.look).filter(Boolean).slice(0, 4);
    looks.push({ ...looks[0], fem: true, hair: [0.6, 0.4, 0.2], hs: 'long' }, { ...looks[0], beard: [0.2, 0.15, 0.1], hs: 'buzz' }, { ...looks[0], stubble: true, beard: null, hs: 'mohawk' });
    return looks.map(L => hash(PS2C.headTex(L)) === hash(PS2C.headTex(L)));
  });
  expect(same.every(Boolean)).toBe(true);
});

test('first load: the new renderer builds every shader before it takes over', async ({ openGame }) => {
  test.setTimeout(300_000); // software GL compiles each shader slowly
  const page = await openGame({ nvgfx: 'next' });
  await expect.poll(() => page.evaluate(() => NX.ready || NX.failed), { timeout: 30_000 }).toBe(true);
  await page.evaluate(() => startLevel(0));
  await expect.poll(() => page.evaluate(() => NX.frames || 0), { timeout: 150_000 }).toBeGreaterThan(2);
  const warm = await page.evaluate(() => ({ jobs: NX.warmJobs, built: NX.warmPrograms, frames: NX.frames }));
  expect(warm.jobs).toBeGreaterThan(10);
  // play on and walk into a busy hub: no shader is built after the warm-up
  await page.waitForTimeout(3000);
  await page.evaluate(() => loadHub('mall'));
  await expect.poll(() => page.evaluate(() => NX.frames), { timeout: 60_000 }).toBeGreaterThan(warm.frames || 10);
  await page.waitForTimeout(3000);
  expect(await page.evaluate(() => NX.impl.renderer.info.programs.length)).toBe(warm.built);
});
