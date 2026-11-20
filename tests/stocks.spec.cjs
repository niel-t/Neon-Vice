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
      document.querySelector(`#sxList .sxC[data-i="${iM}"]`).click(); document.querySelector('#sxDetail [data-act="b1"]').click();
      const o = p.stk.own.mcw;
      out.buy = { n: o.n, wallet: p.wallet, spent: 50000 - p.wallet, msg: $('sxMsg').textContent };
      // a finished job moves the prices (fixed dice: a steady climb), and the news says how your stocks did
      STK_RNG = () => 0.999; // no crash, no news, every stock drifts its own way
      EMP_NEWS.length = 0; const px0 = p.stk.px.mcw;
      state = 'play'; show(null); MISSION = 'c1'; levelIdx = 1; G.take = 1000; G.paid = 0; payout();
      out.tick = { day: p.stk.day, moved: p.stk.px.mcw !== px0, hist: p.stk.hist.mcw.length, div: p.stk.st.div, news: EMP_NEWS.map(n => n[0]), last: LASTPAY.stk };
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

      // shorts, stop-loss, margin call, a penny stock going bust, gold in a crash, rumours
      { delete p.stk; JOBS.top = 3; p.wallet = 100000; const s = stkSave(p);
        // short FLMA, it falls 20%: covering pays the drop
        s.px.fla = 20; stkShortOpen('fla', 10000); const h = s.sh.fla, w0 = p.wallet; s.px.fla = 16;
        const cv = stkCover('fla'); out.short = { n: h.n, pl: cv.pl, back: p.wallet - w0 };
        // a short on GCTV that doubles is a margin call; a stop-loss on SUNC sells after a fall; EGLD goes bust (short pays, shares worthless)
        s.px.gcc = 10; stkShortOpen('gcc', 2000); s.px.sun = 10; stkBuy('sun', 3000); stkStop('sun'); out.stopAt = s.stop.sun.at;
        s.px.egm = 1; stkBuy('egm', 1000); stkShortOpen('egm', 1000);
        STK_RNG = () => 0.999; // quiet dice: no market event, no news, every stock drifts a little
        EMP_NEWS.length = 0;
s.px.gcc = 25; s.px.sun = 8.5; // GCTV has more than doubled, SUNC is under its stop: the checks run after the day's move
        stkTick(p, -1);
        out.margin = { gone: !s.sh.gcc, news: EMP_NEWS.some(n => n[0].startsWith('MARGIN CALL')) };
        out.stop = { sold: !s.own.sun, news: EMP_NEWS.some(n => n[0].startsWith('STOP-LOSS')) };
        // bust: force it with low dice for EGLD only
EMP_NEWS.length = 0; const before = p.wallet;
        STK_RNG = () => 0.999; const q = stkQ('egm'), b0 = q.bust; q.bust = 1.01; stkTick(p, -1); q.bust = b0;
        out.bust = { own: !s.own.egm, sh: !s.sh.egm, paid: p.wallet > before, low: s.hist.egm.includes(0.01), relist: s.px.egm >= 0.4, news: EMP_NEWS.map(n => n[0]).join('|') };
        // a crash: gold climbs while the rest fall
        const g0 = s.px.gld, m0 = s.px.mcw; let n = 0; STK_RNG = () => (n++ === 0 ? 0.01 : 0.999); stkTick(p, -1); out.crash = { gold: s.px.gld > g0, mcw: s.px.mcw < m0 };
        // a rumour from someone in a hub: free, one a job, shows on the exchange
        STK_RNG = () => 0.01; loadHub('drive', 'parked'); const line = stkRumor('guest'); out.rum = { line, have: !!s.rum, again: stkRumor('guest') };
        out.book = { trades: s.st.trades, best: s.st.best && s.st.best.pl > 0 };
        STK_RNG = null; state = 'carmenu'; openStocks(); out.rumShown = $('sxTip').textContent.includes('RUMOUR'); out.detail = !!document.querySelector('#sxDetail .sxBig'); closeStocks(); closeCarMenu(); }
      // the pad: right on the d-pad opens it from the car menu, B closes it
      openCarMenu(); out.carLabel = $('bCarStocks').textContent; closeCarMenu();
    } finally { fadeTo = fade; STK_RNG = null; }
    return out;
  });
  expect(r.btn).toBe(true);
  expect(r.screen).toEqual({ state: 'stocks', on: true, cards: 7, kade: false });
  expect(r.buy.n).toBeGreaterThan(200);
  expect(r.buy.spent).toBeLessThanOrEqual(10000);
  expect(r.buy.spent).toBeGreaterThan(9800);
  expect(r.buy.msg).toContain('MCW');
  expect(r.tick.day).toBe(1);
  expect(r.tick.moved).toBe(true);
  expect(r.tick.hist).toBe(2);
  expect(r.tick.div).toBeGreaterThan(0);
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
  expect(r.short.pl).toBeGreaterThan(1500);
  expect(r.stopAt).toBeCloseTo(9, 2);
  expect(r.margin).toEqual({ gone: true, news: true });
  expect(r.stop).toEqual({ sold: true, news: true });
  expect(r.bust).toMatchObject({ own: true, sh: true, paid: true, low: true, relist: true });
  expect(r.bust.news).toContain('BUST');
  expect(r.crash).toEqual({ gold: true, mcw: true });
  expect(typeof r.rum.line).toBe('string');
  expect(r.rum.have).toBe(true);
  expect(r.rum.again).toBe(null);
  expect(r.book.trades).toBeGreaterThan(3);
  expect(r.rumShown).toBe(true);
  expect(r.detail).toBe(true);
});
