const { test, expect } = require('./fixtures.cjs');

// EMPIRE (empire.js): a crime-empire mode after the Royal Flush. The car menu opens a map of seven districts and six rival crews (three
// street crews, plus Lex's, Kade's and Vale's leftovers once their act is done). Every place is taken in person: rackets on buildings of
// five kinds, fronts on the floors you know, HQs to wipe a crew out; heat and raids you drive over to defend, upgrades, district bonuses,
// respect titles and King of Miami.
test('empire: in-person rackets and fronts, act crews, raids and defence, HQ wipe-outs and king of Miami', async ({ openGame }) => {
  test.setTimeout(240_000);
  const page = await openGame();
  const r = await page.evaluate(() => {
    NOARRIVE = true; const fade = fadeTo, out = {};
    const run = id => { startMission(id); const R = empRunInfo(); return { name: G.def.name, venue: G.def.venue || null, hat: !!G.def.hardhat, gang: G.turf && G.turf.gang, boss: bossName(), bosses: G.enemies.filter(e => e.boss && e.alive).length, inside: !!G.boss && (G.def.site ? !'=PC'.includes(G.rows[Math.floor(G.boss.z)][Math.floor(G.boss.x)]) : !isOut(G, Math.floor(G.boss.x), Math.floor(G.boss.z))), site: G.def.site || null, props: G.furn.filter(f => f === 60).length, map: G.def.map.join(''), foes: G.enemies.filter(e => e.alive && !e.boss).length, lvl: levelIdx, free: !!(R && R.free) }; };
    const win = () => { EMP_NEWS.length = 0; G.take = 100; G.paid = 0; payout(); return EMP_NEWS.map(n => n[0]); };
    try {
      fadeTo = f => { f(); return true; };
      selIdx = 1; sessionReset(1); const p = myProg(); arm(); p.wallet = 100000;
      // no empire before the Royal Flush
      JOBS.top = 5; loadHub('drive', 'parked'); openCarMenu(); out.early = $('bCarEmpire').style.display; closeCarMenu();
      JOBS.top = 9; openCarMenu(); out.btn = $('bCarEmpire').style.display !== 'none' && $('bCarEmpire').textContent.includes('STREET HUSTLER');
      $('bCarEmpire').click();
      const q = s => document.querySelectorAll('#emList ' + s).length;
      out.screen = { state, cards: q('.emC'), crews: q('.emC.crew'), off: q('.emC.crew.off'), fronts: q('.emC.front'), rackets: q('.emC.racket'), heads: q('.emH'), shake: q('[data-act="talk"]') };
      // the act crews: Lex's smugglers are here after the Royal Flush, Kade's and Vale's men only after their acts
      const st = k => empEntState(empEntries().find(e => e.k === k), p);
      out.acts = { silks: empActive('silks'), wreck: empActive('wreckers'), vault: empActive('vault'), marina: st('marina'), boatyard: st('boatyard'), demo: st('demo'), site: st('site'), savings: st('savings'), hqWreck: st('hq_wreckers') };
      // a racket is a job too: the map button sends you there
      const iCigar = empEntries().findIndex(e => e.k === 'cigar');
      document.querySelector(`#emList [data-act="go"][data-i="${iCigar}"]`).click();
      // ...as a real drive: a few blocks of Miami with traffic, your car, and the place glowing at a kerb
      const g0 = G, c = g0.pcar;
      out.cruise = { hub: g0.def.hub, mode: HUBMODE, obj: g0.obj, traffic: g0.traffic.length > 20, far: Math.hypot(g0.dest.x - c.x, g0.dest.z - c.z) > 25, road: !isBlock(Math.floor(c.x), Math.floor(c.z)) && !isBlock(Math.floor(g0.dest.x), Math.floor(g0.dest.z)), same: JSON.stringify(cruiseDef('r_cigar', 'X').map) === JSON.stringify(g0.def.map) };
      // car physics: it gathers speed, grips in a clean corner, and the handbrake throws the tail out and leaves rubber
      g0.traffic = []; for (let k = 0; k < 90; k++) carStep(g0, c, { thr: 1, st: 0, hand: false, turbo: false }, 1 / 60); const v1 = c.v, x1 = c.x;
      for (let k = 0; k < 12; k++) carStep(g0, c, { thr: 1, st: 0.5, hand: false, turbo: false }, 1 / 60); const clean = c.slip, d0 = g0.decals.length;
      for (let k = 0; k < 25; k++) carStep(g0, c, { thr: 0, st: 1, hand: true, turbo: false }, 1 / 60);
      out.phys = { fast: v1 > 7, moved: x1 > 15, clean: clean < 2.4, drift: c.slip > 2.4, rubber: g0.decals.length > d0, finite: [c.x, c.z, c.vx, c.vz, c.h].every(Number.isFinite) };
      // pulling up at the place starts the job; so does skipping the drive
      c.x = g0.dest.x; c.z = g0.dest.z; c.vx = c.vz = 0; cruiseTick(1 / 60); out.cruise.arrived = !!g0.arrived;
      g0.arrived = false; g0.hubDone = false; hubSkip();
      out.drive = { mission: MISSION, state, where: $('ojWhere').textContent };
      if (OBJCARD) { OBJCARD.t = 0; objCardGo(); }
      const R0 = empRunInfo();
      out.cigar = { name: G.def.name, venue: G.def.venue, twist: G.twist, gang: G.turf.gang, racket: G.turf.racket, boss: bossName(), hp: G.boss.hp, foes: G.enemies.filter(e => e.alive && !e.boss).length, base: R0.base };
      out.cigarCol = G.enemies.filter(e => !e.boss).every(e => Math.abs(e.look.shirt[0] - 0x1f / 255) < 0.01 && e.look.jacket[0] > 0.9);
      EMP_ROLL = 0.99; out.cigarWin = { news: win(), own: empOwns(empRacket('cigar'), p), flag: !!p.wflags.own_cigar };
      // old saves: rackets shaken down from the map are owned places now
      p.emp.rk = { nails: 1 }; empSave(p); out.migrate = { own: empOwns(empRacket('nails'), p), rk: 'rk' in p.emp }; delete p.wflags.own_nails;
      // McWey never offers empire jobs
      out.mcList = extraIds().filter(id => MISSIONS[id].kind !== 'empire' && missionUnlocked(id, missionCtx())).every(id => !/^(e|r|hq)_/.test(id));
      // a front: Los Rayos at Club Flamingo, El Chacal at the far end
      startMission('e_flamingo'); showObjCard(); OBJCARD.t = 0; objCardGo();
      out.run = { lvl: levelIdx, twist: G.twist, gang: G.turf.gang, boss: bossName(), hp: G.boss.hp, where: $('ojWhere').textContent, venue: G.def.venue || null };
      out.won = win(); out.own = empOwns(empFront('flamingo'), p);
      const fl = empFront('flamingo'), pay0 = empFrontPay(fl, p); empUpgrade('flamingo', 'g'); empUpgrade('flamingo', 'x');
      out.up = { g: p.emp.up.flamingo.g, x: p.emp.up.flamingo.x, pay: empFrontPay(fl, p) / pay0 };
      // a raid on the front (guards fail): under attack, pays nothing
      for (const g in p.emp.heat) p.emp.heat[g] = 0; p.emp.heat.rayos = 100;
      EMP_ROLL = 0.35; MISSION = 'c1'; levelIdx = 1; EMP_NEWS.length = 0; empPay(p);
      out.raid = { on: !!empRaid(fl, p), news: EMP_NEWS.some(n => n[0].includes('HITTING')) };
      openCarMenu(); out.alarm = $('bCarEmpire').textContent.includes('UNDER ATTACK'); closeCarMenu();
      startMission('e_flamingo'); out.defend = { gang: G.turf.gang, defend: G.turf.defend };
      out.held = win(); out.heldRaid = !!empRaid(fl, p);
      // a raid on a racket: also defended in person, on its building
      const cg = empRacket('cigar'), inc0 = empIncome(p); p.emp.raid.cigar = { g: 'rayos', d: p.emp.day };
      out.rraid = { st: st('cigar'), inc: inc0 - empIncome(p) };
      openCarMenu(); $('bCarEmpire').click(); const iC = empEntries().findIndex(e => e.k === 'cigar'); empSelect(iC);
      out.rraid.btn = !!document.querySelector(`#emList [data-act="go"][data-i="${iC}"]`); closeEmpire(); closeCarMenu();
      startMission('r_cigar'); out.rraid.defend = G.turf.defend; out.rraid.venue = G.def.venue; out.rraid.news = win(); out.rraid.after = !!empRaid(cg, p);
      // an unanswered raid: the next job ends with Los Rayos owning the front again
      p.emp.raid.flamingo = { g: 'rayos', d: p.emp.day - 1 }; EMP_ROLL = 0.99; MISSION = 'c1'; EMP_NEWS.length = 0; empPay(p);
      out.lost = { own: empOwns(fl, p), holder: empHolder(fl, p), news: EMP_NEWS.some(n => n[0].includes('TOOK')) };
      // the HQ opens once the crew holds no fronts; wiping them frees their rackets and stops their raids
      JOBS.top = 14; const w = dlgObj(p, 'wflags'); w.own_flamingo = 1; delete p.emp.hold.flamingo;
      out.hqOpen = st('hq_rayos');
      out.hq = run('hq_rayos'); out.wipeNews = win();
      out.wiped = { flag: empWiped('rayos', p), free: empHolder(empRacket('taxi'), p), heat: p.emp.heat.rayos };
      out.leftovers = run('r_taxi');
      // every crew is on the map after Act 4; an act crew's HQ is a compound of its own
      out.late = { wreck: empActive('wreckers'), vault: empActive('vault'), demo: st('demo'), hqSilks: st('hq_silks') };
      w.own_marina = 1; out.hqSilksOpen = st('hq_silks');
      out.silksHq = run('hq_silks'); out.wreckYard = run('r_demo'); out.vaultHq = run('hq_vault');
      // the five kinds of building
      out.kinds = ['cigar', 'taxi', 'bowl', 'garment', 'cash'].map(k => run('r_' + k).venue);
      // every front, racket and headquarters is its own place: its own floor plan, dressed with props for that business
      const siteIds = [...EMP_FRONTS.map(f => 'e_' + f.k), ...EMP_RACKETS.map(r => 'r_' + r.k), ...EMP_HQ.map(h => 'hq_' + h.g)], sites = siteIds.map(run);
      out.sites = { n: sites.length, own: sites.every((o, i) => o.site && o.site === siteIds[i].replace(/^[er]_/, '')), campaign: sites.filter(o => LEVELS.some(L => L.map.join('') === o.map)).length, maps: new Set(sites.map(o => o.map)).size, bare: sites.filter(o => o.props < 4).map(o => o.site) };
      // everything owned, every crew gone: KING OF MIAMI and +25% on top
      for (const x of EMP_PLACES) w['own_' + x.k] = 1; for (const g in EMP_GANGS) if (g !== 'ivory') w['wiped_' + g] = 1; p.emp.raid = {};
      MISSION = 'hq_ivory'; win();
      out.king = { title: empTitle(p), flag: !!p.wflags.king_miami, news: EMP_NEWS.map(n => n[0]).includes('KING OF MIAMI') };
      // every place and HQ loads with its one boss inside the building
      for (const x of EMP_PLACES) delete w['own_' + x.k]; for (const g in EMP_GANGS) delete w['wiped_' + g]; p.emp.hold = {};
      out.all = [...EMP_FRONTS.map(f => 'e_' + f.k), ...EMP_RACKETS.map(r => 'r_' + r.k), ...EMP_HQ.map(h => 'hq_' + h.g)].map(id => { const o = run(id); return o.bosses === 1 && o.inside && o.foes >= 2 ? '' : id + ':' + JSON.stringify(o); }).filter(Boolean);
      // the map draws with every pin state without errors
      loadHub('drive', 'parked'); openCarMenu(); $('bCarEmpire').click(); for (let i = 0; i < empEntries().length; i++) empSelect(i); drawEmpMap(1234); out.drawn = state;
    } finally { fadeTo = fade; EMP_ROLL = null; }
    return out;
  });
  expect(r.early).toBe('none');
  expect(r.btn).toBe(true);
  expect(r.screen).toEqual({ state: 'empire', cards: 35, crews: 6, off: 2, fronts: 8, rackets: 21, heads: 8, shake: 0 });
  expect(r.acts).toEqual({ silks: true, wreck: false, vault: false, marina: 'open', boatyard: 'open', demo: 'lock', site: 'lock', savings: 'lock', hqWreck: 'lock' });
  expect(r.cruise).toEqual({ hub: 'cruise', mode: 'cruise', obj: 'DRIVE TO CALLE OCHO CIGARS', traffic: true, far: true, road: true, same: true, arrived: true });
  expect(r.phys).toEqual({ fast: true, moved: true, clean: true, drift: true, rubber: true, finite: true });
  expect(r.drive).toEqual({ mission: 'r_cigar', state: 'objcard', where: 'TAKEOVER · LOS RAYOS' });
  expect(r.cigar).toEqual({ name: 'CALLE OCHO CIGARS', venue: 'shop', twist: 'turf', gang: 'rayos', racket: true, boss: 'LOS RAYOS COLLECTOR', hp: 5, foes: 3, base: 0 });
  expect(r.cigarCol).toBe(true);
  expect(r.cigarWin.news).toContain('CALLE OCHO CIGARS IS YOURS');
  expect(r.cigarWin.own && r.cigarWin.flag).toBe(true);
  expect(r.migrate).toEqual({ own: true, rk: false });
  expect(r.mcList).toBe(true);
  expect(r.run).toEqual({ lvl: 1, twist: 'turf', gang: 'rayos', boss: '"EL CHACAL" MENDOZA', hp: 8, where: 'TAKEOVER · LOS RAYOS', venue: 'club' });
  expect(r.won).toContain('CLUB FLAMINGO IS YOURS');
  expect(r.own).toBe(true);
  expect(r.up).toEqual({ g: 1, x: 1, pay: 1.5 });
  expect(r.raid).toEqual({ on: true, news: true });
  expect(r.alarm).toBe(true);
  expect(r.defend).toEqual({ gang: 'rayos', defend: true });
  expect(r.held).toContain('YOU HELD CLUB FLAMINGO');
  expect(r.heldRaid).toBe(false);
  expect(r.rraid).toEqual({ st: 'raid', inc: 500, btn: true, defend: true, venue: 'shop', news: expect.arrayContaining(['YOU HELD CALLE OCHO CIGARS']), after: false });
  expect(r.lost).toEqual({ own: false, holder: 'rayos', news: true });
  expect(r.hqOpen).toBe('open');
  expect(r.hq).toMatchObject({ boss: 'DON ALEJANDRO VEGA', bosses: 1, gang: 'rayos', venue: 'compound', name: "VEGA'S PENTHOUSE" });
  expect(r.wipeNews).toContain('LOS RAYOS ARE FINISHED');
  expect(r.wiped).toEqual({ flag: true, free: 'none', heat: 0 });
  expect(r.leftovers).toMatchObject({ venue: 'garage', free: true, bosses: 1 });
  expect(r.late).toEqual({ wreck: true, vault: true, demo: 'open', hqSilks: 'lock' });
  expect(r.hqSilksOpen).toBe('open');
  expect(r.silksHq).toMatchObject({ name: 'THE STERLING BOATHOUSE', venue: 'compound', boss: 'CAPTAIN NICO STERLING', bosses: 1, gang: 'silks', inside: true });
  expect(r.wreckYard).toMatchObject({ venue: 'garage', hat: true, gang: 'wreckers', boss: 'WRECKING CREW COLLECTOR' });
  expect(r.vaultHq).toMatchObject({ venue: 'compound', boss: 'MARCUS VALE', gang: 'vault' });
  expect(r.kinds).toEqual(['shop', 'garage', 'club', 'warehouse', 'office']);
  expect(r.king).toEqual({ title: 'KING OF MIAMI', flag: true, news: true });
  expect(r.all).toEqual([]);
  expect(r.sites).toEqual({ n: 35, own: true, campaign: 0, maps: 35, bare: [] });
  expect(r.drawn).toBe('empire');
});
