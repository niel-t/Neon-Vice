const { test, expect } = require('./fixtures.cjs');

// Renegotiating McWey's cut: a button after his talk (tap on phones, R on keyboards), three pitches, chancy outcome,
// once per finished job, a penalty for the hard pitch or for asking at every visit, and the haggled rate is what payout() takes.
test('mcwey: renegotiate the cut, win or lose, once per job, and payout uses the new rate', async ({ openGame }) => {
  const page = await openGame();
  const visit = () => page.evaluate(() => {
    VISIT = { debrief: null, next: 1, grade: null, take: 0, style: null }; talkMcWey(); chatClearTimers(); CHAT.i = CHAT.q.length; chatDone();
    return { btn: $('bNeg') && $('bNeg').textContent, disabled: !!($('bNeg') && $('bNeg').disabled), visible: !!($('bNeg') && $('bNeg').offsetParent) };
  });
  const ask = async (opt) => {
    await page.locator('#bNeg').click();
    await expect.poll(() => page.evaluate(() => CHAT.phase)).toBe('choose');
    await expect(page.locator('#dlChoices button')).toHaveCount(3);
    await page.locator('#dlChoices button').nth(opt).click();
    await expect.poll(() => page.evaluate(() => { chatSkipAll(); return CHAT.done; })).toBe(true);
    return page.evaluate(() => ({ rate: mcRate(), neg: myProg().neg, rel: relGet('mcwey'), btn: $('bNeg').textContent, disabled: $('bNeg').disabled }));
  };
  await page.evaluate(() => { selIdx = 2; sessionReset(1); const p = myProg(); arm(); p.seen.loan = 1; p.debt = 8000; p.paid = false; p.arm.jobs = 3; MC_ROLL = 0; });

  const v0 = await visit();
  expect(v0).toEqual({ btn: 'RENEGOTIATE CUT · 60% (R)', disabled: false, visible: true });
  // "forget I asked" costs nothing and keeps the ask available
  let r = await ask(2);
  expect(r.rate).toBe(0.6); expect(r.disabled).toBe(false);
  // a soft pitch that lands: 5 points off, then the button waits for the next job
  r = await ask(0);
  expect(r.rate).toBe(0.55); expect(r.disabled).toBe(true); expect(r.btn).toContain('ASK AFTER NEXT JOB');
  expect(await page.locator('#dlogLines').innerText()).toContain('55%');
  // still used up on the next visit until another job is done
  expect((await visit()).disabled).toBe(true);

  // a hard pitch that fails: +5 points and McWey likes you less
  await page.evaluate(() => { myProg().arm.jobs = 5; MC_ROLL = 0.99; });
  await visit();
  r = await ask(1);
  expect(r.rate).toBe(0.6); expect(r.rel).toBe(-1); expect(r.neg.s).toBe(0);

  // asking at three visits in a row wears him out: even a soft fail costs 5 points
  await page.evaluate(() => { myProg().arm.jobs = 6; });
  await visit(); r = await ask(0); expect(r.rate).toBe(0.6); expect(r.neg.s).toBe(1);
  await page.evaluate(() => { myProg().arm.jobs = 7; });
  await visit(); r = await ask(0); expect(r.rate).toBe(0.65); expect(r.neg.s).toBe(2);

  // the floor: he never goes below it, whatever the dice say
  await page.evaluate(() => { const p = myProg(); p.arm.jobs = 10; p.rate.debt = 0.4; MC_ROLL = 0; });
  await visit(); r = await ask(1); expect(r.rate).toBe(0.4);

  // payout takes the haggled rate while you owe him, then a separate partner's share once square; the Lex job pays whole
  const pay = await page.evaluate(() => {
    const p = myProg(), out = {};
    startLevel(1); G.paid = 0; G.take = 1000; let w = p.wallet; payout(); out.owe = { cut: 1000 - (p.wallet - w), debt: p.debt };
    p.debt = 0; p.paid = true; p.rate.part = 0.1;
    startLevel(1); G.paid = 0; G.take = 1000; w = p.wallet; payout(); out.share = 1000 - (p.wallet - w);
    out.line = mcFill(MC_PAY.share, { take: '1,000', cut: '100' });
    for (const e of (startLevel(7), G.enemies)) e.alive = false; G.paid = 0; G.take = 1000; w = p.wallet; payout(); out.lex = 1000 - (p.wallet - w);
    MC_ROLL = null; return out;
  });
  expect(pay).toEqual({ owe: { cut: 400, debt: 7600 }, share: 100, line: expect.stringContaining('$100 of it is my share'), lex: 0 });
});
