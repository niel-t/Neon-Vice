const { test, expect } = require('./fixtures.cjs');

// Velvet Palms girlfriends: tips, VIP rooms and full dances build a dancer's affection (capped per job, so it takes a few nights).
// When she is crazy about you she asks to leave with you after a VIP dance; she walks out of the club and lives at your home
// in her club look, joins you in bed first and has her own lines. Tony's list offers her too. Everything is buttons, so touch works.
test('club: build a dancer\'s affection, take her home as your girlfriend, and she lives there in her club look', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(), a = arm(); p.wallet = 100000;
    const fade = fadeTo, to = setTimeout, o = {}, tick = (s, until) => { for (let i = 0; i < s * 30; i++) { clubTick(1 / 30); if (until && until()) return true; } return false; };
    const flush = []; setTimeout = (f, ms) => { flush.push(f); return 0; };
    const run = () => { while (flush.length) flush.shift()(); };
    try {
      fadeTo = f => { f(); return true; };
      loadHub('club'); if (G.seq) seqSkip();
      let c = G.club; const d = c.dancers[0], name = d.dname, look = JSON.stringify([d.look.hair, d.look.ling, d.look.skin, d.look.curve]);
      // the same girl always looks the same, visit after visit
      const again = gfClubLook(name).L; o.sameLook = JSON.stringify([again.hair, again.ling, again.skin, again.curve]) === look;
      // tips count, one point each, and Tony's list shows how she feels
      G.player.x = d.x; G.player.z = d.z + 2; tipDancer(d); tipDancer(d); run();
      o.afterTips = gfAffOf(name);
      openStore('vip'); o.hearts = document.querySelector('#sStore [data-vip="0"]').textContent; closeStore();
      // a whole job's worth: the cap stops it at GF_JOB_CAP until the next job
      for (let i = 0; i < 20; i++) tipDancer(d); run();
      o.capped = gfAffOf(name);
      // next jobs: a VIP dance (booking +3, bills +1 each, sitting through it +2)
      const vipNight = () => {
        openStore('vip'); document.querySelector(`#sStore [data-vip="${c.dancers.indexOf(d)}"]`).click();
        tick(1.2); const r = c.rooms[0]; G.player.x = r.chairX; G.player.z = r.z0 + 1.6;
        tick(20, () => c.vip.active); lapTip(); lapTip(); tick(60, () => !c.vip.active); run();
      };
      a.jobs++; vipNight(); o.night2 = gfAffOf(name);
      o.noOfferYet = state;
      tick(40, () => !d.walking); a.jobs++; vipNight(); o.night3 = gfAffOf(name);
      // she stays and talks to you: her line and your answers in a speech box, not a menu
      const box = () => document.getElementById('gfTalk'), btns = () => [...box().querySelectorAll('button[data-gft]')];
      o.talk = { state, talking: !!c.talk, shown: box() && box().style.display, text: box() && box().textContent, answers: btns().length, targets: hubTargets(G).length };
      // "not tonight": she goes back to work and stays ready
      btns()[2].click(); run();
      o.declined = { talk: !!c.talk, gf: gfN(), hidden: box().style.display, say: G.say && G.say.who };
      tick(30, () => !d.walking);
      // walk up to her on stage: TALK TO her starts the conversation again; key 1 asks her home
      G.player.x = d.x; G.player.z = d.z + 2;
      const tt = hubTargets(G).find(q => q.k === 'gftalk'); o.stageTarget = tt && tt.lbl; tt.fn(tt);
      o.again = !!c.talk;
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' })); run();
      o.taken = { state, gf: gfN(), saved: myProg().gf[0].n === name, banner: LASTBAN && LASTBAN[0] };
      o.leaves = tick(40, () => !c.dancers.includes(d));
      o.gone = !G.npcs.includes(d);
      // she is off the roster next time
      loadHub('club'); if (G.seq) seqSkip(); o.roster = G.club.dancers.some(q => q.dname === name);
      // at home in the Penthouse she is there in her club look, the bed grows for her, and she gets in first
      p.home = 2; p.homes = [0, 1, 2]; p.furn = {}; loadHub('home2', 'home'); if (G.seq) seqSkip();
      const gfn = G.npcs.find(n => n.kind === 'pgirl' && n.gf);
      o.home = { there: !!gfn, name: gfn && gfn.dname, look: gfn && JSON.stringify([gfn.look.hair, gfn.look.ling, gfn.look.skin, gfn.look.curve]) === look, bed: bedN(), label: (hubTargets(G).find(t => t.k === 'bed') || {}).lbl };
      o.line = gfLine(gfn);
      p.furn[2] = { girls: 1, girlsN: 1 }; homeExtras(G);
      tuckIn(G); bedTick(G, 0.1); o.inBed = { gf: !!gfn.bed, n: G.npcs.filter(n => n.bed).length };
      // Villa Solana too, upstairs and down, but not in the basement club
      p.home = 3; p.homes = [0, 1, 2, 3]; p.furn = {}; o.mansion = [];
      for (const h of ['home3', 'home3u', 'home3b']) { loadHub(h, 'home'); if (G.seq) seqSkip(); o.mansion.push(G.npcs.filter(n => n.gf).length); }
    } finally { fadeTo = fade; setTimeout = to; }
    return o;
  });
  expect(out.sameLook).toBe(true);
  expect(out.afterTips).toBe(2);
  expect(out.hearts).toMatch(/2\/20/);
  expect(out.capped).toBe(10);
  expect(out.night2).toBe(17);
  expect(out.noOfferYet).toBe('play');
  expect(out.night3).toBe(20);
  expect(out.talk).toEqual({ state: 'play', talking: true, shown: 'block', text: expect.stringMatching(/1\. .*2\. .*3\. /), answers: 3, targets: 0 });
  expect(out.declined).toEqual({ talk: false, gf: 0, hidden: 'none', say: expect.any(String) });
  expect(out.stageTarget).toMatch(/^TALK TO /);
  expect(out.again).toBe(true);
  expect(out.taken).toEqual({ state: 'play', gf: 1, saved: true, banner: expect.stringMatching(/IS YOUR GIRLFRIEND/) });
  expect(out.leaves).toBe(true);
  expect(out.gone).toBe(true);
  expect(out.roster).toBe(false);
  expect(out.home).toEqual({ there: true, name: expect.any(String), look: true, bed: 2, label: 'GO TO BED WITH THE GIRL' });
  expect(out.line).toMatch(/: /);
  expect(out.inBed.gf).toBe(true);
  expect(out.mansion).toEqual([1, 1, 0]);
});
