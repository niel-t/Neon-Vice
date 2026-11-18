const { test, expect } = require('./fixtures.cjs');

// THE EMPIRE (empire.js): after the Royal Flush the car menu opens a map of Miami's eight fronts. Each one is a takeover job on a map
// you know, held by a rival crew in its colours with a lieutenant boss; winning makes it yours and every owned front pays after every job.
test('empire: the map opens after the loan, takeovers spawn the crew and lieutenant, a win pays and owning all eight crowns you', async ({ openGame }) => {
  test.setTimeout(150_000);
  const page = await openGame();
  const r = await page.evaluate(() => {
    NOARRIVE = true; const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      selIdx = 1; sessionReset(1); const p = myProg(); arm(); p.wallet = 1000;
      // before the Royal Flush there is no empire
      JOBS.top = 5; loadHub('drive', 'parked'); openCarMenu(); out.early = $('bCarEmpire').style.display; closeCarMenu();
      // after it, the button shows and opens the map; fronts you have not played yet stay locked
      JOBS.top = 9; openCarMenu(); out.btn = $('bCarEmpire').style.display !== 'none' && $('bCarEmpire').textContent.includes('0/8');
      $('bCarEmpire').click();
      out.screen = { state, cards: document.querySelectorAll('#emList .emC').length, open: document.querySelectorAll('#emList .emC.open').length, lock: document.querySelectorAll('#emList .emC.lock').length, go: document.querySelectorAll('#emList .emGo').length };
      out.lockCoral = document.querySelectorAll('#emList .emC')[7].textContent.includes('THE CORAL ROOM FIRST');
      empSelect(3); out.sel = document.querySelector('#emList .emC.sel').dataset.i;
      closeEmpire(); out.back = state;
      // McWey's own job list never offers the takeovers
      out.mcList = extraIds().filter(id => MISSIONS[id].kind !== 'empire' && missionUnlocked(id, missionCtx())).every(id => !id.startsWith('e_'));
      // a takeover: Los Rayos at Club Flamingo, every thug in white and teal, El Chacal at the far end
      startMission('e_flamingo'); showObjCard(); objCardGo.call(null); OBJCARD && (OBJCARD.t = 0); objCardGo();
      const lt = G.boss;
      out.run = { lvl: levelIdx, twist: G.twist, turf: G.turf && G.turf.gang, boss: bossName(), hp: lt && lt.hp, where: $('ojWhere').textContent };
      out.colours = G.enemies.filter(e => !e.boss).every(e => e.look && Math.abs(e.look.shirt[0] - 0x1f / 255) < 0.01 && e.look.jacket[0] > 0.9);
      const far = Math.hypot(lt.x - G.player.x, lt.z - G.player.z);
      out.far = G.enemies.every(e => e === lt || Math.hypot(e.x - G.player.x, e.z - G.player.z) <= far + 0.01);
      // win it: the take is paid, the front is yours and the news waits for home
      G.take = 3000; G.paid = 0; const w0 = p.wallet; payout();
      out.won = { own: empOwns(empFront('flamingo')), paid: p.wallet - w0, news: EMP_NEWS.map(n => n[0]) };
      // the next job pays the empire on top
      EMP_NEWS.length = 0; MISSION = 'c1'; levelIdx = 1; G.take = 0; G.paid = 0; const w1 = p.wallet; G.take = 1; payout();
      out.income = { inc: empIncome(p), got: p.wallet - w1 - 1 + cutOf(1) };
      out.mapOwn = (openCarMenu(), $('bCarEmpire').textContent.includes('1/8') && $('bCarEmpire').textContent.includes('+$2,000'));
      closeCarMenu();
      // all eight: KING OF MIAMI and a quarter more from every front
      JOBS.top = 13; EMP_NEWS.length = 0;
      for (const f of EMP_FRONTS) if (f.k !== 'coral') dlgObj(p, 'wflags')['own_' + f.k] = 1;
      MISSION = 'e_coral'; G.take = 100; G.paid = 0; payout();
      out.king = { flag: !!p.wflags.king_miami, inc: empIncome(p), sum: EMP_FRONTS.reduce((a, f) => a + f.pay, 0), news: EMP_NEWS.map(n => n[0]) };
      // a lieutenant on every front's map, without errors
      out.all = EMP_FRONTS.map(f => { startMission('e_' + f.k); return !!(G.turf && G.boss && G.boss.alive && G.boss.boss); });
    } finally { fadeTo = fade; }
    return out;
  });
  expect(r.early).toBe('none');
  expect(r.btn).toBe(true);
  expect(r.screen).toEqual({ state: 'empire', cards: 8, open: 7, lock: 1, go: 7 });
  expect(r.lockCoral).toBe(true);
  expect(r.sel).toBe('3');
  expect(r.back).toBe('carmenu');
  expect(r.mcList).toBe(true);
  expect(r.run).toEqual({ lvl: 1, twist: 'turf', turf: 'rayos', boss: '"EL CHACAL" MENDOZA', hp: 8, where: 'TAKEOVER · LOS RAYOS' });
  expect(r.colours).toBe(true);
  expect(r.far).toBe(true);
  expect(r.won).toEqual({ own: true, paid: 3000, news: ['CLUB FLAMINGO IS YOURS'] });
  expect(r.income.inc).toBe(2000);
  expect(r.income.got).toBe(2000);
  expect(r.mapOwn).toBe(true);
  expect(r.king.flag).toBe(true);
  expect(r.king.inc).toBe(Math.round(r.king.sum * 1.25));
  expect(r.king.news).toContain('KING OF MIAMI');
  expect(r.all).toEqual([true, true, true, true, true, true, true, true]);
});
