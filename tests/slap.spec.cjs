const { test, expect } = require('./fixtures.cjs');

// A playful slap (F / pad B / SLAP button): the girls at home giggle (every home, the mansion's crew and its stage girls),
// at Velvet Palms Tony warns you, then fines you, then the bouncers throw you out until you've done another job.
test('slap: girls at home play along, Tony warns, fines and throws you out of Velvet Palms', async ({ openGame }) => {
  const page = await openGame();
  const o = await page.evaluate(async () => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm();
    p.wallet = 5000; p.homes = [0, 1, 2, 3]; p.respect = 1;
    const fade = fadeTo, r = { homes: [] }, frames = n => new Promise(res => { let k = 0; const f = () => (++k >= n ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); });
    const reach = d => { const q = G.player; q.x = d.x + 0.6; q.z = d.z + 0.5; };
    const slap = () => { G.slapCd = 0; pressed.slap = true; slapTick(1 / 60); };
    try {
      fadeTo = f => { f(); return true; };
      // every home: a hired girl jumps and giggles, nothing is charged
      for (const h of [0, 1, 2]) {
        p.home = h; p.furn = { [h]: { girlsN: 1 } }; loadHub('home' + h, 'home'); if (G.seq) seqSkip();
        const d = G.npcs.find(n => n.kind === 'pgirl'); reach(d); slapTick(1 / 60);
        const near = G.slapN === d, w = p.wallet; slap();
        r.homes.push({ near, hit: d.slapT > 0 && G.player.slapT > 0, said: G.popups.some(q => SLAP_HOME.includes(q.txt)), free: p.wallet === w, far: (G.player.x = d.x + 5, slapTick(1 / 60), G.slapN === null) });
      }
      // the mansion: the basement stage girls too
      p.home = 3; p.furn = {}; loadHub('home3b', 'home'); if (G.seq) seqSkip();
      { const d = G.mansion.dancers[0]; reach(d); slap(); r.mansion = { hit: d.slapT > 0, said: G.popups.some(q => SLAP_HOME.includes(q.txt)) }; }
      await frames(4); // the slapped girl and the slapping hand render
      // Velvet Palms: strike one (warning, she won't take tips), two ($500 fee), three (thrown out, banned)
      p.home = 2; p.furn = {}; loadHub('club'); if (G.seq) seqSkip();
      const c = G.club, d0 = c.dancers[0], d1 = c.dancers[1]; reach(d0); slapTick(1 / 60);
      r.clubHint = G.slapN === d0;
      slap(); const w1 = p.wallet; tipDancer(d0);
      r.one = { slaps: c.slaps, tony: !!(G.say && G.say.who === 'TONY'), cold: d0.cold > 0, refused: p.wallet === w1, said: G.popups.some(q => SLAP_CLUB.includes(q.txt)) };
      reach(d1); slap(); r.two = { slaps: c.slaps, fee: w1 - p.wallet };
      // a VIP dance ends at once if you slap her (that is strike three here)
      const v = c.vip; startLapdance(2); const r0 = c.rooms[0]; G.player.x = r0.chairX; G.player.z = r0.z0 + 1.6;
      for (let i = 0; i < 600 && !v.active; i++) clubTick(1 / 30);
      r.vip = { active: v.active, hint: (slapTick(1 / 60), G.slapN === v.dancer) };
      slap(); r.three = { slaps: c.slaps, danceOver: !v.active, out: G.hubDone, ban: p.clubBan === arm().jobs };
      await new Promise(res => setTimeout(res, 1900));
      r.thrown = { state, ban: clubBanned() };
      $('bCarClub').onclick(); r.door = { state, banned: G.def === HUBS.club && state === 'carmenu' };
      // after another job the door opens again
      arm().jobs++; r.after = clubBanned();
      closeCarMenu();
    } finally { fadeTo = fade; }
    return r;
  });
  for (const h of o.homes) expect(h).toEqual({ near: true, hit: true, said: true, free: true, far: true });
  expect(o.mansion).toEqual({ hit: true, said: true });
  expect(o.clubHint).toBe(true);
  expect(o.one).toEqual({ slaps: 1, tony: true, cold: true, refused: true, said: true });
  expect(o.two).toEqual({ slaps: 2, fee: 500 });
  expect(o.vip).toEqual({ active: true, hint: true });
  expect(o.three).toEqual({ slaps: 3, danceOver: true, out: true, ban: true });
  expect(o.thrown).toEqual({ state: 'carmenu', ban: true });
  expect(o.door).toEqual({ state: 'carmenu', banned: true });
  expect(o.after).toBe(false);
});
