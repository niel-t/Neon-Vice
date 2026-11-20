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
      // the first time, McWey is on the line and walks you through the screen; trades wait until he is done
      const co = () => ({ on: $('sxCoach').classList.contains('on'), txt: $('sxCoach').textContent, hi: (document.querySelector('#sStocks .sxHi') || {}).id || ((document.querySelector('#sStocks .sxHi') || {}).className || '') });
      out.coach = [co()]; stkKey({ code: 'Enter' }); out.coach.push(co()); const wb = p.wallet; stkDeskAct('put', 0); out.coachBlocks = p.wallet === wb;
      for (let k = 0; k < 4; k++) stkKey({ code: 'Enter' }); out.coach.push(co()); stkKey({ code: 'Escape' }); out.coach.push(co());
      out.coachState = state; out.tut = p.stk.tut;
      // it opens on Chip's desk, with a free starter stock; V goes to the full board (and McWey explains that once too)
      out.desk = { view: STK_VIEW, picks: document.querySelectorAll('#sxPicks .sxPk').length, gift: $('sxMsg').textContent.includes('on the house'), owned: Object.keys(p.stk.own).length };
      stkKey({ code: 'KeyV' }); out.boardCoach = $('sxCoach').classList.contains('on'); stkKey({ code: 'Escape' }); out.view = STK_VIEW;
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
      openCarMenu(); menuKey({ code: 'KeyI' }); out.keyOpen = state; stkKey({ code: 'KeyV' });
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
  expect(r.coach[0].on).toBe(true);
  expect(r.coach[0].txt).toContain('McWEY');
  expect(r.coach[1].hi).toBe('sxPicks');
  expect(r.desk).toEqual({ view: 'desk', picks: 3, gift: true, owned: 1 });
  expect(r.boardCoach).toBe(true);
  expect(r.view).toBe('board');
  expect(r.coachBlocks).toBe(true);
  expect(r.coach[2].on).toBe(true);
  expect(r.coach[2].txt).toContain('6/7');
  expect(r.coach[3].on).toBe(false);
  expect(r.coachState).toBe('stocks');
  expect(r.tut).toBe(1);
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

// McWey explains the market in his office: the first visit after the loan talk, and by topic from ASK ABOUT THE MARKET
test('stocks: McWey brings up the exchange and answers questions about it', async ({ openGame }) => {
  const page = await openGame();
  const lines = () => page.evaluate(() => $('dlogLines').innerText);
  const visit = () => page.evaluate(() => {
    VISIT = { debrief: null, next: 1, grade: null, take: 0, style: null }; talkMcWey(); chatClearTimers(); const q = CHAT.q.map(l => l.t || '').join(' '); CHAT.i = CHAT.q.length; chatDone();
    return { q, btn: !!$('bStkAsk') && $('bStkAsk').offsetParent !== null };
  });
  await page.evaluate(() => { selIdx = 2; sessionReset(1); const p = myProg(); arm(); p.seen.loan = 1; p.debt = 8000; });
  const v1 = await visit();
  expect(v1.q).toContain('Dade Exchange');
  expect(v1.btn).toBe(true);
  expect(await page.evaluate(() => myProg().seen.stocks)).toBe(1);
  // only once
  expect((await visit()).q).not.toContain('Chip Whitmore');
  // ask about shorting
  await page.locator('#bStkAsk').click();
  await expect.poll(() => page.evaluate(() => { if (CHAT.phase !== 'choose') chatTap(); return CHAT.phase; })).toBe('choose');
  await expect(page.locator('#dlChoices button')).toHaveCount(7);
  await page.locator('#dlChoices button').nth(1).click();
  await expect.poll(() => page.evaluate(() => { if (!CHAT.done && CHAT.phase !== 'choose') chatTap(); return CHAT.done; })).toBe(true);
  expect(await lines()).toContain('margin call');
  // the keyboard asks too
  await page.keyboard.press('KeyI');
  await expect.poll(() => page.evaluate(() => { if (CHAT.phase !== 'choose') chatTap(); return CHAT.phase; })).toBe('choose');
  expect(await page.evaluate(() => CHAT.ch.opts.length)).toBe(7);
});

// CHIP'S DESK: three picks, one tap to put money in, a report after every job, broker goals with rewards, ranks with perks, and the car
// menu saying when there is something to come back for
test('stocks: Chip\'s desk picks, report, goals, ranks and the car-menu badge', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(() => {
    NOARRIVE = true; const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      selIdx = 1; sessionReset(1); const p = myProg(); arm(); p.wallet = 20000; JOBS.top = 3; loadHub('drive', 'parked');
      openCarMenu(); out.badge0 = $('bCarStocks').textContent; $('bCarStocks').click(); stkCoachNext(true);
      const s = p.stk;
      out.picks = stkPicksNow(s).map((k, i) => STK_RISK[i].pool.includes(k));
      out.goal0 = s.goal.kind;
      // amounts above your rank are locked
      document.querySelector('#sxAmt [data-i="3"]').click(); out.lock = { amt: s.amt | 0, msg: $('sxMsg').textContent };
      // put $1K into the risky pick with a tap
      const k1 = stkPicksNow(s)[1], w0 = p.wallet; document.querySelector('#sxPicks [data-d="put"][data-i="1"]').click();
      out.put = { k: !!s.own[k1], spent: w0 - p.wallet, mine: document.querySelectorAll('#sxMine .sxMr').length };
      closeStocks(); closeCarMenu();
      // a job: the report is waiting, the pick goal is done, XP for holding stocks, new picks
      STK_RNG = () => 0.999; EMP_NEWS.length = 0; MISSION = 'c1'; levelIdx = 1; G.take = 1000; G.paid = 0; payout(); STK_RNG = null;
      out.after = { rep: !!s.rep, done: s.goal.done, xp: s.xp, news: EMP_NEWS.some(n => n[0] === 'BROKER GOAL DONE'), pickDay: s.picks.day === s.day };
      openCarMenu(); out.badge1 = { txt: $('bCarStocks').textContent, ping: $('bCarStocks').classList.contains('sxPing') };
      $('bCarStocks').click(); out.report = $('sxReport').textContent;
      const w1 = p.wallet, rew = s.goal.rew; stkKey({ code: 'KeyG' }); out.collect = { paid: p.wallet - w1 === rew, xp: s.xp, next: s.goal.kind, done: s.goal.done };
      // cash out from the desk
      document.querySelector(`#sxMine [data-k="${k1}"]`).click(); out.cashed = !s.own[k1];
      // enough XP ranks you up and unlocks bigger bets
      s.xp = 10; renderStocks(''); out.rank = { n: STK_RANKS[stkRank(s)].n, lock: document.querySelectorAll('#sxAmt .sxA.lock').length };
      stkDeskAct('amt', 3); out.amt = stkAmt(s);
      closeStocks(); out.badge2 = $('bCarStocks').classList.contains('sxPing'); closeCarMenu();
    } finally { fadeTo = fade; STK_RNG = null; }
    return out;
  });
  expect(r.badge0).toContain('FREE STARTER');
  expect(r.picks).toEqual([true, true, true]);
  expect(r.goal0).toBe('pick');
  expect(r.lock.amt).toBe(1);
  expect(r.lock.msg).toContain('Rank up');
  expect(r.put.k).toBe(true);
  expect(r.put.spent).toBeGreaterThan(900);
  expect(r.put.spent).toBeLessThanOrEqual(1000);
  expect(r.put.mine).toBe(2);
  expect(r.after).toMatchObject({ rep: true, done: 1, news: true, pickDay: true });
  expect(r.after.xp).toBe(1);
  expect(r.badge1.txt).toContain('GOAL DONE');
  expect(r.badge1.ping).toBe(true);
  expect(r.report).toContain('SINCE YOUR LAST JOB');
  expect(r.collect).toMatchObject({ paid: true, xp: 4, done: 0 });
  expect(r.cashed).toBe(true);
  expect(r.rank).toEqual({ n: 'DAY TRADER', lock: 2 });
  expect(r.amt).toBe(10000);
  expect(r.badge2).toBe(false);
});
