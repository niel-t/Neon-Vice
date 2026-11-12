const { test, expect } = require('./fixtures.cjs');

test('gfx next: the opt-in Three.js renderer draws gameplay, hands menus back, and is absent by default', async ({ openGame }) => {
  test.setTimeout(240_000); // software GL compiles each new shader slowly on first use
  const page = await openGame({ nvgfx: 'next' });
  expect(await page.evaluate(() => !!NX && NX.on)).toBe(true);
  await expect.poll(() => page.evaluate(() => NX.ready || NX.failed), { timeout: 30_000 }).toBe(true);
  expect(await page.evaluate(() => ({ failed: NX.failed, live: NX.live }))).toEqual({ failed: false, live: false });
  await page.evaluate(() => startLevel(0));
  await expect.poll(() => page.evaluate(() => NX.frames || 0), { timeout: 120_000 }).toBeGreaterThan(2);
  expect(await page.evaluate(() => ({ live: NX.live, failed: NX.failed, chars: NX.chars.length > 0,
    shown: getComputedStyle(document.getElementById('glnext')).display }))).toEqual({ live: true, failed: false, chars: true, shown: 'block' });
  await page.evaluate(() => { SET.gfx2 = false; });
  await expect.poll(() => page.evaluate(() => NX.live), { timeout: 60_000 }).toBe(false);
  expect(await page.evaluate(() => getComputedStyle(document.getElementById('glnext')).display)).toBe('none');
  const classic = await openGame();
  expect(await classic.evaluate(() => NX)).toBe(null);
});
