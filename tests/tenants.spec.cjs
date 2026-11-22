const { test, expect } = require('./fixtures.cjs');

// Leaving any home for a job (elevator or car) must reach the job, even right after a bonus job with a twist.
// Homes you moved out of are rented out; a tenant who stops paying is collected from in a fist fight.
const setup = () => { selIdx = 0; sessionReset(10); const p = myProg(); arm(); p.seen = p.seen || {}; p.seen.loan = 1; p.homes = [0, 1, 2, 3, 4, 5, 6, 7]; p.respect = 1; p.sharkDead = 1; VISIT.next = 10; NEXTJOB = 10; p.run = null; return p; };

test('travel: every home reaches Kade Tower by elevator or car, after a bonus job', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(setup => {
    const fade = fadeTo, out = {};
    try {
      fadeTo = f => { f(); return true; };
      for (const h of [0, 1, 2, 3, 4, 5, 6, 7]) {
        const p = eval('(' + setup + ')')(); p.home = h;
        loadHub('home' + h, 'home'); if (G.seq) seqSkip(); state = 'play'; G.trigLock = false;
        MISSION = 'b_arena'; STAGE_REFUSED = null; openCarMenuForce(); $('bCarJob').click();
        const how = state === 'elev' ? 'lift' : 'car';
        if (state === 'elev') { skipElev(); updateElev(0.016); } else if (G.seq) seqSkip();
        out[h] = [how, G.def.name, STAGE_REFUSED];
      }
      return out;
    } finally { fadeTo = fade; }
  }, setup.toString());
  for (const h of Object.keys(out)) expect(out[h].slice(1), 'home ' + h).toEqual(['KADE TOWER: SITE GATE', null]);
  expect([out[1][0], out[2][0], out[6][0]]).toEqual(['lift', 'lift', 'lift']);
});

test('rent: old homes are rented out, late tenants pile up debt, and collecting it is a fist fight', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(setup => {
    const fade = fadeTo, o = {};
    try {
      fadeTo = f => { f(); return true; };
      const p = eval('(' + setup + ')')(); p.homes = [0, 1, 2]; p.home = 2; p.props = {}; p.ten = {}; p.wallet = 1000;
      TEN_ROLL = 0.99; o.paid = mallRent(p); o.wallet = p.wallet;
      TEN_ROLL = 0; mallRent(p); mallRent(p); o.late = [tenOwed(p, 0), tenOwed(p, 1), p.wallet];
      TEN_ROLL = 0.99; mallRent(p); o.still = [tenOwed(p, 0), p.wallet];
      // the home phone offers the job; it rides the Coral Tower elevator down first
      loadHub('home2', 'home'); if (G.seq) seqSkip(); state = 'store'; storeMode = 'home'; renderStore();
      o.cards = document.querySelectorAll('#sStore [data-ten]').length;
      const kitBefore = JSON.stringify(myProg().kit);
      document.querySelector('#sStore [data-ten="0"]').click();
      if (state === 'elev') { skipElev(); updateElev(0.016); }
      if (state === 'objcard') { OBJCARD.t = 0; objCardGo(); }
      const g = G;
      o.job = [MISSION, g.fists, g.player.weapon, g.items.length, g.enemies.length > 3, g.enemies.every(e => e.weapon === null), !!g.boss, g.boss && g.boss.maxhp];
      // the switch does nothing on a fist-fight job
      pressed.swap = true; update(0.016); o.swap = g.player.weapon;
      // punches hurt the tenant
      const b = g.boss, hp = b.hp; hitEnemy(b, 'fists', [1, 0], 1); o.hurt = hp - b.hp;
      // the job pays the whole debt and the kit comes back untouched
      g.take = 0; payout(); o.after = [tenOwed(p, 0), p.wallet, JSON.stringify(kitFromPlay().kit) === kitBefore];
      // moving back into a rented home throws the tenant out
      TEN_ROLL = 0; mallRent(p); o.evict = [tenOwed(p, 1) > 0]; buyHome(1); o.evict.push(tenOwed(p, 1), p.home);
      return o;
    } finally { fadeTo = fade; TEN_ROLL = null; }
  }, setup.toString());
  expect(out.paid).toBe(250 + 350);
  expect(out.wallet).toBe(1600);
  expect(out.late).toEqual([500, 700, 1600]);
  expect(out.still).toEqual([750, 1600]);
  expect(out.cards).toBe(2);
  expect(out.job).toEqual(['t_0', true, null, 0, true, true, true, 6]);
  expect(out.swap).toBe(null);
  expect(out.hurt).toBe(1);
  expect(out.after[0]).toBe(0);
  expect(out.after[1]).toBe(1600 + 1000);
  expect(out.after[2]).toBe(true);
  expect(out.evict).toEqual([true, 0, 1]);
});
