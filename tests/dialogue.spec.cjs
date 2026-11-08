const { test, expect } = require('./fixtures.cjs');

// A throwaway conversation covering gating, rel/flag consequences, branch splicing and skip behaviour.
async function startTestDlg(page) {
  await page.evaluate(() => {
    DLG.t = { start: 'a', nodes: {
      a: { say: [['MCWEY', 'Pick one.']], choose: [
        { t: 'Low road.', to: 'b', set: { rel: { mcwey: 1 } } },
        { t: 'Secret road.', req: { flag: 'wf_test' } },
        { t: 'Mid road.', to: 'c', set: { flag: 'wf_test' } },
        { t: { _: 'High road.' }, tone: CHARS[selIdx].id }] },
      b: { say: [['MCWEY', 'Bee line.']] },
      c: { say: [['MCWEY', 'Sea line.']] } } };
    talkMcWey(); chatClearTimers();
    CHAT = { q: [dlgStart('t'), { who: 'm', t: 'After.' }], i: 0, phase: 'idle', tm: null, done: false };
    dlogBegin('TEST'); chatNext();
  });
}
const opts = page => page.locator('#dlChoices button');
const logText = page => page.locator('#dlogLines').innerText();

test('branching dialogue: gated choices, keys, skip stops at choices, consequences persist', async ({ openGame }) => {
  const page = await openGame();
  await startTestDlg(page);
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => CHAT.phase)).toBe('choose');
  await expect(opts(page)).toHaveText(['1.Low road.', '2.Mid road.', '3.High road.']);
  // The character's own-tone option is preselected, so Space-spam keeps the old linear voice.
  await expect(page.locator('#dlChoices button.sel')).toHaveText('3.High road.');
  await expect(page.locator('#chatPick')).toBeVisible();
  await expect(page.locator('#chatTap')).toBeHidden();
  await page.keyboard.press('Escape');
  await page.mouse.click(5, 5);
  expect(await page.evaluate(() => CHAT.phase)).toBe('choose');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#dlChoices button.sel')).toHaveText('1.Low road.');
  await page.keyboard.press('Digit1');
  await page.keyboard.press('Space');
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => CHAT.done)).toBe(true);
  const log = await logText(page);
  expect(log).toContain('Low road.');
  expect(log).toContain('Bee line.');
  expect(log).toContain('After.');
  expect(log).not.toContain('Sea line.');
  expect(await page.evaluate(() => [myProg().rel.mcwey, relMul('mcwey'), JSON.parse(localStorage.nb86prog)])).toEqual([1, 1 - 0.1 / 3, expect.anything()]);

  await startTestDlg(page);
  await page.keyboard.press('Escape');
  await expect(opts(page)).toHaveCount(3);
  await opts(page).nth(1).click();
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => CHAT.done)).toBe(true);
  expect(await logText(page)).toContain('Sea line.');
  expect(await page.evaluate(() => myProg().wflags)).toEqual({ wf_test: 1 });

  await startTestDlg(page);
  await page.keyboard.press('Escape');
  await expect(opts(page)).toHaveText(['1.Low road.', '2.Secret road.', '3.Mid road.', '4.High road.']);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.evaluate(() => typeof myProg === 'function' && menuT > 0)).toBe(true);
  expect(await page.evaluate(() => [myProg().rel, myProg().wflags])).toEqual([{ mcwey: 1 }, { wf_test: 1 }]);
});
