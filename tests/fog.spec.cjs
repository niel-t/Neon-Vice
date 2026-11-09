const { test, expect } = require('./fixtures.cjs');

test('fog: on normal, the floor intro (Lex cameo) already hides enemies in unseen rooms; easy has no fog', async ({ openGame }) => {
  const page = await openGame();
  await page.evaluate(() => { SET.diff = 'normal'; SET.fog = 'auto'; startLevel(1); });
  expect(await page.evaluate(() => !!G.cameo)).toBe(true);
  await expect.poll(() => page.evaluate(() => G.T)).toBeGreaterThan(0.05);
  const s = await page.evaluate(() => ({ cameo: !!G.cameo, fog: !!G.fog && G.fog.mode,
    hidden: G.enemies.filter(e => e.alive && fogHidE(e)).length, radar: !!fogRadar(G) }));
  expect(s).toEqual({ cameo: true, fog: 'keep', hidden: expect.any(Number), radar: true });
  expect(s.hidden).toBeGreaterThan(0);
  await page.evaluate(() => { SET.diff = 'easy'; startLevel(1); });
  await expect.poll(() => page.evaluate(() => G.T)).toBeGreaterThan(0.05);
  expect(await page.evaluate(() => [!!G.fog, !!fogRadar(G), G.enemies.some(e => fogHidE(e))])).toEqual([false, false, false]);
});

