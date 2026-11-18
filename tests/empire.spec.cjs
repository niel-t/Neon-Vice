const { test, expect } = require('./fixtures.cjs');

// EMPIRE (empire.js): a crime-empire mode after the Royal Flush. The car menu opens a map of seven districts with three rival crews:
// rackets you shake down from the map, fronts you take in a job (crew colours, lieutenant), HQs you hit to wipe a crew out,
// heat and raids on what you own (guards help, unanswered raids lose the front), upgrades, district bonuses and respect titles.
test('empire: map, shakedowns, takeovers, upgrades, raids and defence, HQ wipe-out and king of Miami', async ({ openGame }) => {
  test.setTimeout(180_000);
  const page = await openGame();
  const r = await page.evaluate(() => {
    NOARRIVE = true; const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      selIdx = 1; sessionReset(1); const p = myProg(); arm(); p.wallet = 100000;
      // no empire before the Royal Flush
      JOBS.top = 5; loadHub('drive', 'parked'); openCarMenu(); out.early = $('bCarEmpire').style.display; closeCarMenu();
      JOBS.top = 9; openCarMenu(); out.btn = $('bCarEmpire').style.display !== 'none' && $('bCarEmpire').textContent.includes('STREET HUSTLER');
      $('bCarEmpire').click();
      out.screen = { state, cards: document.querySelectorAll('#emList .emC').length, crews: document.querySelectorAll('#emList .emC.crew').length, fronts: document.querySelectorAll('#emList .emC.front').length, rackets: document.querySelectorAll('#emList .emC.racket').length, heads: document.querySelectorAll('#emList .emH').length };
      // shakedowns: a failed talk waits for the next job; a trash always works and heats up the crew
      const iCafe = empEntries().findIndex(e => e.k === 'cafe'), iCigar = empEntries().findIndex(e => e.k === 'cigar');
      EMP_ROLL = 0.99; empAct(iCafe, 'talk'); out.fail = { own: !!p.emp.rk.cafe, wait: empEntState(empEntries()[iCafe], p), msg: $('emMsg').textContent.includes('next job') };
      const h0 = p.emp.heat.rayos; empAct(iCigar, 'trash'); out.trash = { own: !!p.emp.rk.cigar, heat: p.emp.heat.rayos - h0 };
      EMP_ROLL = 0; document.querySelector(`#emList [data-act="lean"][data-i="${empEntries().findIndex(e => e.k === 'bodega')}"]`).click(); out.lean = !!p.emp.rk.bodega;
      closeEmpire(); out.back = state;
      // McWey never offers empire jobs
      out.mcList = extraIds().filter(id => MISSIONS[id].kind !== 'empire' && missionUnlocked(id, missionCtx())).every(id => !/^(e|hq)_/.test(id));
      // a front: Los Rayos at Club Flamingo, thugs in white and teal, El Chacal at the far end
      startMission('e_flamingo'); showObjCard(); OBJCARD.t = 0; objCardGo();
      const lt = G.boss;
      out.run = { lvl: levelIdx, twist: G.twist, gang: G.turf && G.turf.gang, boss: bossName(), hp: lt && lt.hp, where: $('ojWhere').textContent };
      out.colours = G.enemies.filter(e => !e.boss).every(e => Math.abs(e.look.shirt[0] - 0x1f / 255) < 0.01 && e.look.jacket[0] > 0.9);
      EMP_ROLL = 0.99; EMP_NEWS.length = 0; G.take = 3000; G.paid = 0; const w0 = p.wallet; payout();
      out.won = { own: empOwns(empFront('flamingo')), news: EMP_NEWS.map(n => n[0]), heat: p.emp.heat.rayos };
      // upgrades: guards and an expansion
      const fl = empFront('flamingo'), pay0 = empFrontPay(fl, p); empUpgrade('flamingo', 'g'); empUpgrade('flamingo', 'x');
      out.up = { g: p.emp.up.flamingo.g, x: p.emp.up.flamingo.x, pay: empFrontPay(fl, p) / pay0 };
      // a raid on the front (guards fail): it is under attack and pays nothing; skip it for a job and it is lost
      p.emp.heat.rayos = 100; p.emp.heat.snakes = 0; p.emp.heat.ivory = 0; delete p.emp.rk.cafe; delete p.emp.rk.cigar; delete p.emp.rk.bodega;
      EMP_ROLL = 0.35; MISSION = 'c1'; levelIdx = 1; EMP_NEWS.length = 0; empPay(p);
      out.raid = { on: !!empRaid(fl, p), news: EMP_NEWS.some(n => n[0].includes('HITTING')), inc: empIncome(p) };
      openCarMenu(); out.alarm = $('bCarEmpire').textContent.includes('UNDER ATTACK'); closeCarMenu();
      // defend it: the job is against the raiders and winning clears the raid
      startMission('e_flamingo'); out.defend = { gang: G.turf.gang, defend: G.turf.defend };
      EMP_NEWS.length = 0; G.take = 100; G.paid = 0; payout(); out.held = { raid: !!empRaid(fl, p), own: empOwns(fl, p), news: EMP_NEWS.map(n => n[0]) };
      // now an unanswered raid: next job ends with Los Rayos owning it again
      p.emp.raid.flamingo = { g: 'rayos', d: p.emp.day - 1 }; EMP_ROLL = 0.99; MISSION = 'c1'; EMP_NEWS.length = 0; empPay(p);
      out.lost = { own: empOwns(fl, p), holder: empHolder(fl, p), news: EMP_NEWS.some(n => n[0].includes('TOOK')) };
      // the HQ opens once the crew holds no fronts; wiping them frees their rackets and stops their raids
      JOBS.top = 13; const w = dlgObj(p, 'wflags'); w.own_flamingo = 1; w.own_marina = 1; delete p.emp.hold.flamingo;
      const iHq = empEntries().findIndex(e => e.k === 'hq_rayos'); out.hqOpen = empEntState(empEntries()[iHq], p);
      startMission('hq_rayos'); out.hq = { boss: bossName(), bosses: G.enemies.filter(e => e.boss && e.alive).length, gang: G.turf.gang };
      EMP_NEWS.length = 0; G.take = 100; G.paid = 0; payout();
      out.wiped = { flag: empWiped('rayos', p), free: empHolder(empRacket('taxi'), p), heat: p.emp.heat.rayos, news: EMP_NEWS.some(n => n[0].includes('FINISHED')), odds: empOdds(empRacket('taxi'), 'talk', p) > EMP_HOW.talk.p };
      // everything owned, all crews gone: KING OF MIAMI and +25% on top
      for (const f of EMP_FRONTS) w['own_' + f.k] = 1; for (const q of EMP_RACKETS) p.emp.rk[q.k] = 1; w.wiped_snakes = 1; p.emp.raid = {};
      MISSION = 'hq_ivory'; EMP_NEWS.length = 0; G.take = 100; G.paid = 0; payout();
      out.king = { title: empTitle(p), flag: !!p.wflags.king_miami, news: EMP_NEWS.map(n => n[0]).includes('KING OF MIAMI') };
      // every front and HQ loads with its boss
      out.all = [...EMP_FRONTS.map(f => 'e_' + f.k), ...EMP_HQ.map(h => 'hq_' + h.g)].map(id => { startMission(id); return !!(G.turf && G.boss && G.boss.alive && G.enemies.filter(e => e.boss && e.alive).length === 1); });
      // the map draws with every pin state without errors
      loadHub('drive', 'parked'); openCarMenu(); $('bCarEmpire').click(); for (let i = 0; i < empEntries().length; i++) empSelect(i); drawEmpMap(1234); out.drawn = state;
    } finally { fadeTo = fade; EMP_ROLL = null; }
    return out;
  });
  expect(r.early).toBe('none');
  expect(r.btn).toBe(true);
  expect(r.screen).toEqual({ state: 'empire', cards: 26, crews: 3, fronts: 8, rackets: 15, heads: 8 });
  expect(r.fail).toEqual({ own: false, wait: 'wait', msg: true });
  expect(r.trash).toEqual({ own: true, heat: 25 });
  expect(r.lean).toBe(true);
  expect(r.back).toBe('carmenu');
  expect(r.mcList).toBe(true);
  expect(r.run).toEqual({ lvl: 1, twist: 'turf', gang: 'rayos', boss: '"EL CHACAL" MENDOZA', hp: 8, where: 'TAKEOVER · LOS RAYOS' });
  expect(r.colours).toBe(true);
  expect(r.won.own).toBe(true);
  expect(r.won.news).toContain('CLUB FLAMINGO IS YOURS');
  expect(r.up).toEqual({ g: 1, x: 1, pay: 1.5 });
  expect(r.raid.on).toBe(true);
  expect(r.raid.news).toBe(true);
  expect(r.alarm).toBe(true);
  expect(r.defend).toEqual({ gang: 'rayos', defend: true });
  expect(r.held.raid).toBe(false);
  expect(r.held.own).toBe(true);
  expect(r.held.news).toContain('YOU HELD CLUB FLAMINGO');
  expect(r.lost).toEqual({ own: false, holder: 'rayos', news: true });
  expect(r.hqOpen).toBe('open');
  expect(r.hq).toEqual({ boss: 'DON ALEJANDRO VEGA', bosses: 1, gang: 'rayos' });
  expect(r.wiped).toEqual({ flag: true, free: 'none', heat: 0, news: true, odds: true });
  expect(r.king).toEqual({ title: 'KING OF MIAMI', flag: true, news: true });
  expect(r.all.every(Boolean)).toBe(true);
  expect(r.drawn).toBe('empire');
});
