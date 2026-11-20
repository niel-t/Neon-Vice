const { test, expect } = require('./fixtures.cjs');

// THE DADE EXCHANGE (stocks.js): a 1986 stock market on the car menu. Buy and sell between jobs, prices move after every finished job,
// Chip's hot tips are right most of the time, and the story moves Kade Development and Vale Trust.
test('stocks: buy, sell, prices move after jobs, tips, story crashes, keys and touch', async ({ openGame }) => {
  test.setTimeout(120_000);
  const page = await openGame();
  const r = await page.evaluate(() => {
    NOARRIVE = true; const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      selIdx = 1; sessionReset(1); const p = myProg(); arm(); p.wallet = 50000;
      JOBS.top = 3; loadHub('drive', 'parked'); openCarMenu();
      const b = $('bCarStocks');
      out.btn = !!b && b.offsetParent !== null && b.textContent.includes('DADE EXCHANGE');
      b.click();
      out.screen = { state, on: $('sStocks').classList.contains('on'), cards: document.querySelectorAll('#sxList .sxC').length, kade: !!document.querySelector('#sxList').textContent.includes('KDV') };
      // buy $10K of McWey with the card button (a click, like a tap)
      const iM = stkVisible().findIndex(q => q.k === 'mcw');
      document.querySelector(`#sxList [data-act="b1"][data-i="${iM}"]`).click();
      const o = p.stk.own.mcw;
      out.buy = { n: o.n, wallet: p.wallet, spent: 50000 - p.wallet, msg: $('sxMsg').textContent };
      // a finished job moves the prices (fixed dice: a steady climb), and the news says how your stocks did
      STK_RNG = () => 0.999; // no crash, no news, every stock drifts its own way
      EMP_NEWS.length = 0; const px0 = p.stk.px.mcw;
      state = 'play'; show(null); MISSION = 'c1'; levelIdx = 1; G.take = 1000; G.paid = 0; payout();
      out.tick = { day: p.stk.day, moved: p.stk.px.mcw !== px0, hist: p.stk.hist.mcw.length, news: EMP_NEWS.map(n => n[0]), last: LASTPAY.stk };
      // sell half, then everything, from the keyboard
      openCarMenu(); menuKey({ code: 'KeyI' }); out.keyOpen = state;
      STK_SEL = iM; stkKey({ code: 'KeyH' }); out.half = p.stk.own.mcw.n;
      const w0 = p.wallet; stkKey({ code: 'KeyX' }); out.sold = { gone: !p.stk.own.mcw, cash: p.wallet - w0, real: p.stk.real };
      // a tip: costs $500, one a job, and when it is true the stock moves its way after the next job
      STK_RNG = () => 0.01; // first listed stock, going up, and true
      document.querySelector('#sxTip [data-act="tip"]').click();
      out.tip = { have: !!p.stk.tip, k: p.stk.tip && p.stk.tip.k, real: p.stk.tip && p.stk.tip.real, txt: $('sxTip').textContent.includes('UP'), again: stkBuyTip() };
      const tk = p.stk.tip.k, t0 = p.stk.px[tk]; STK_RNG = () => 0.5;
      state = 'play'; show(null); G.paid = 0; payout();
      out.tipHit = p.stk.px[tk] / t0;
      // the story: Kade Development lists after the Royal Flush, climbs through Act 3, and crashes when Kade dies
      STK_RNG = () => 0.999; JOBS.top = 9; out.kdvListed = stkListed(stkQ('kdv'));
      const k0 = p.stk.px.kdv; G.paid = 0; levelIdx = 8; payout(); out.kdvRise = p.stk.px.kdv > k0;
      stkBuy('kdv', 5000); const k1 = p.stk.px.kdv; EMP_NEWS.length = 0;
      G.paid = 0; levelIdx = 10; payout();
      out.kade = { drop: p.stk.px.kdv / k1, ev: p.stk.ev.kade, news: EMP_NEWS.map(n => n.join(' ')).join(' | ') };
      // an old save that already beat Act 4 starts Vale Trust at its crashed price
      delete p.stk; JOBS.top = 14; stkSave(p); out.vale = { px: p.stk.px.vtb, ev: p.stk.ev.vale };
      // the pad: right on the d-pad opens it from the car menu, B closes it
      openCarMenu(); out.carLabel = $('bCarStocks').textContent; closeCarMenu();
    } finally { fadeTo = fade; STK_RNG = null; }
    return out;
  });
  expect(r.btn).toBe(true);
  expect(r.screen).toEqual({ state: 'stocks', on: true, cards: 6, kade: false });
  expect(r.buy.n).toBeGreaterThan(200);
  expect(r.buy.spent).toBeLessThanOrEqual(10000);
  expect(r.buy.spent).toBeGreaterThan(9800);
  expect(r.buy.msg).toContain('MCW');
  expect(r.tick.day).toBe(1);
  expect(r.tick.moved).toBe(true);
  expect(r.tick.hist).toBe(2);
  expect(r.tick.news.some(n => n.startsWith('YOUR STOCKS'))).toBe(true);
  expect(typeof r.tick.last).toBe('number');
  expect(r.keyOpen).toBe('stocks');
  expect(r.half).toBeGreaterThan(100);
  expect(r.sold.gone).toBe(true);
  expect(r.sold.cash).toBeGreaterThan(0);
  expect(r.tip).toMatchObject({ have: true, real: true, txt: true, again: 'have' });
  expect(r.tipHit).toBeGreaterThan(1.15);
  expect(r.kdvListed).toBe(true);
  expect(r.kdvRise).toBe(true);
  expect(r.kade.drop).toBeLessThan(0.2);
  expect(r.kade.ev).toBe(1);
  expect(r.kade.news).toContain('KADE DEVELOPMENT COLLAPSES');
  expect(r.vale.ev).toBe(1);
  expect(r.vale.px).toBeLessThan(15);
  expect(r.carLabel).toContain('DADE EXCHANGE');
});
