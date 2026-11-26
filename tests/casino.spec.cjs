const { test, expect } = require('./fixtures.cjs');

// Casino La Perla (casino.js): a hub on the car menu with slots, blackjack, roulette and craps for real money, the Pearl Club card,
// the bar, the lounge stage and a high-limit Salon Prive.
const setup = () => { selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm(); p.wallet = 100000; p.casino = undefined; };

test('casino: the hub, its people and every game pays out right', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(setup => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      // the car menu has the casino pin and it drives there
      loadHub('drive', 'parked'); openCarMenu();
      out.pin = $('bCarCasino').style.display !== 'none' && $('bCarCasino').classList.contains('cmPin');
      const tr = travel; travel = go => go(); $('bCarCasino').click(); travel = tr;
      const g = G;
      out.hub = { casino: g.def === HUBS.casino, park: !!g.park, lot: !!g.lot, people: g.npcs.length >= 40, dealers: Object.keys(g.casino.dealers).length };
      if (g.seq) seqSkip();
      // targets: every table, the free slot machines, the cage, Pilar, the bar
      const t = hubTargets(g);
      out.targets = { tables: t.filter(q => /^PLAY (BLACKJACK|ROULETTE|CRAPS)/.test(q.lbl)).length, slots: t.filter(q => /SLOTS|DIVER|FLAMINGO|PEARL/.test(q.lbl) && /^PLAY/.test(q.lbl)).length, cage: t.some(q => /CAGE/.test(q.lbl)), pilar: t.some(q => /PILAR/.test(q.lbl)), bar: t.some(q => /BAR/.test(q.lbl)), car: t.some(q => q.k === 'car') };
      // people and frames run without errors
      for (let i = 0; i < 90; i++) { updateHub(1 / 30); }
      const B = new Batch(); casDyn(B, g); out.drawn = B.n > 0 && g.staticB.n > 20000;
      const p = myProg();
      // blackjack: fixed shoe, player 10+9 = 19 against dealer 10+7 = 17, wins even money
      casSit(CAS_TABLES[0]);
      out.bjState = [state, !!g.seatP];
      CAS_BJ.shoe = [...Array(20).fill({ r: '5', su: '♣' }), { r: '2', su: '♠' }, { r: '7', su: '♥' }, { r: '9', su: '♣' }, { r: 'K', su: '♦' }, { r: '10', su: '♠' }];
      let w0 = p.wallet; casPickChip(100); out.bjBet = w0 - p.wallet;
      bjDeal(); while (CS.q.length) CS.q.shift().fn(); CS.busy = 0; out.bjPhase = CAS_BJ.phase; bjStand(); CAS_G.bj.finish();
      out.bj = { res: CAS_BJ.res.join(), net: p.wallet - w0 };
      casClose(); out.closed = [state, !g.seatP];
      // roulette: the ball lands on 17 (black, odd, low, second dozen)
      casSit(CAS_TABLES[3]);
      CAS_RNG = () => CAS_WHEEL.indexOf(17) / CAS_WHEEL.length + 0.001;
      w0 = p.wallet; casPickChip(25);
      const spot = k => roSpots().find(s => s.k === k), tap = k => { const s = spot(k); CAS_G.roul.tap(s.x + 2, s.y + 2); };
      tap('n17'); tap('black'); tap('red'); tap('doz1');
      roSpin(); CAS_G.roul.finish();
      out.ro = { res: CAS_RO.res, net: p.wallet - w0 }; // 25*36 + 25*2 + 25*3 - 100
      casClose();
      // craps: 4 then 4 makes the point, pass + odds win; a field bet on the 4 wins even money
      casSit(CAS_TABLES[2]);
      const rolls = [1, 3, 2, 2]; let ri = 0; CAS_RNG = () => (rolls[ri++ % rolls.length] - 1) / 6 + 0.01;
      w0 = p.wallet; casPickChip(25); crPlace('pass'); crRoll(); while (CS.q.length) CS.q.shift().fn(); CS.busy = 0;
      out.point = CAS_CR.point; crPlace('odds'); crPlace('field'); crRoll(); while (CS.q.length) CS.q.shift().fn(); CS.busy = 0;
      out.cr = { point: CAS_CR.point, net: p.wallet - w0 }; // pass +25, odds 25*2 = +50, field +25
      casClose();
      // slots: three pearls on three coins hit the progressive
      const m = CAS_SLOTS.find(q => q.den === 5 && !CAS_SLOT_BUSY.has(q.i));
      casSitSlot(m); const pi = CAS_STRIP.indexOf('pearl'); CAS_RNG = () => (pi + 0.5) / CAS_STRIP.length;
      const jp0 = casProg().jp[5]; w0 = p.wallet; CAS_SLOT.acts().find(a => a.id === 'max').fn(); CAS_G.slot.finish();
      out.slot = { won: p.wallet - w0 + 15 >= jp0, reset: casProg().jp[5] === 5000 };
      casClose(); CAS_RNG = null;
      // the Pearl Club: card numbers, a tier, Pilar's comp once per job
      const c = casProg(); out.club = { wag: c.wag > 0, n: c.n };
      c.wag = 60000; p.arm.jobs = 7; casClub('pilar'); w0 = p.wallet; casComp(); casComp(); out.comp = p.wallet - w0; casClose();
      // the Salon Prive: a GOLD card lets you sit at the high-limit table
      casSit(CAS_TABLES[5]); out.vip = state; casClose();
      c.wag = 0; p.wallet = 1000; casSit(CAS_TABLES[5]); out.vipNo = state;
      // touch: the hub USE button names the table in reach
      p.wallet = 5000; touchMode = true; const s = casSeat(CAS_TABLES[0]); g.player.x = s.x; g.player.z = s.z; hubInteract(); hubTouchUI(); out.use = $('bUse').textContent; touchMode = false;
      return out;
    } finally { fadeTo = fade; CAS_RNG = null; }
  }, setup.toString())).toEqual({
    pin: true,
    hub: { casino: true, park: true, lot: true, people: true, dealers: 7 },
    targets: { tables: 7, slots: 20, cage: true, pilar: true, bar: true, car: true },
    drawn: true,
    bjState: ['casino', true], bjBet: 100, bjPhase: 'play', bj: { res: 'WIN', net: 100 }, closed: ['play', true],
    ro: { res: 17, net: 925 },
    point: 4, cr: { point: 0, net: 100 },
    slot: { won: true, reset: true },
    club: { wag: true, n: 4 },
    comp: 1000,
    vip: 'casino', vipNo: 'play',
    use: 'PLAY BLACKJACK'
  });
});
