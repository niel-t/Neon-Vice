const { test, expect } = require('./fixtures.cjs');

// EMPIRE JOBS (empire.js empJobSetup/empJobTick): every kind of place plays its own way, and the enemy laser is now a muzzle glint
// that only shows right before a shot (index.html aimWind/drawAimCue), with the old laser as a setting.
test('empire jobs: shakedown, hotwire, safe, torch, bag man, front backup, raid defence, HQ backup; subtle aim cue', async ({ openGame }) => {
  test.setTimeout(180_000);
  const page = await openGame();
  const r = await page.evaluate(() => {
    NOARRIVE = true; const fade = fadeTo, out = {};
    const tick = (s) => { for (let t = 0; t < s; t += 1 / 30) empJobTick(1 / 30); };
    const near = (x, z) => { const p = G.player; for (const [dx, dz] of [[1.2, 0], [-1.2, 0], [0, 1.2], [0, -1.2], [1.5, 0], [-1.5, 0]]) if (!blk(G, x + dx, z + dz)) { p.x = x + dx; p.z = z + dz; return; } p.x = x; p.z = z + 1; };
    const killAll = () => { for (const e of G.enemies) if (e.alive && !e.spared) killEnemy(e, 'pistol', [0, 1]); };
    try {
      fadeTo = f => { f(); return true; };
      selIdx = 1; sessionReset(1); const p = myProg(); arm(); p.wallet = 100000; JOBS.top = 14;
      out.step=(out.step|0)+1; // the aim cue: nothing while he is still lining up, a glint just before he fires; the old laser is a setting
      startMission('c1'); const e = G.enemies.find(x => x.alive && x.weapon); e.aiming = true; e.react = 1; e.cd = 0;
      const w0 = aimWind(e); e.react = 0.05; const w1 = aimWind(e); buildDynamic();
      $('bAim').click(); const lz = SET.aim; $('bAim').click();
      out.aim = { w0, w1, setting: lz, back: SET.aim, label: $('bAim').textContent };
      out.step=(out.step|0)+1; // SHOP: the owner pays once the collector is down
      startMission('r_cigar'); let j = G.emj; out.shop = { mode: j.mode, owner: !!j.owner, label: G.obj && G.obj.label, how: objLines(G).some(l => /owner/i.test(l.t)) };
      near(j.owner.x, j.owner.z); out.shop.early = !!empJobAction(G.player);
      killEnemy(j.bossE, 'pistol', [0, 1]); near(j.owner.x, j.owner.z); const s0 = G.score; out.shop.act = (empJobAction(G.player) || {}).b; empJobGrab(G.player);
      out.shop.done = G.obj.done; out.shop.paid = G.score - s0;
      out.step=(out.step|0)+1; // SHOP, owner shot: the place pays half from then on
      delete dlgObj(p, 'wflags').own_cigar; startMission('r_cigar'); j = G.emj; killEnemy(j.owner, 'pistol', [0, 1]); tick(0.1); EMP_NEWS.length = 0; G.take = 100; G.paid = 0; payout();
      out.shop.half = !!p.emp.half.cigar; out.shop.pay = empPay1(empRacket('cigar'), p);
      out.step=(out.step|0)+1; // GARAGE: hotwire the car, stand beside it until it starts
      startMission('r_taxi'); j = G.emj; const car = j.tg && j.tg[0]; out.garage = { mode: j.mode, tg: j.tg ? j.tg.length : 0 }; near(car.x, car.z); out.garage.act = (empJobAction(G.player) || {}).b;
      empJobGrab(G.player); tick(2); out.garage.mid = G.obj.label; const s1 = G.score; tick(2); out.garage.done = G.obj.done; out.garage.paid = G.score - s1;
      out.step=(out.step|0)+1; // OFFICE: crack the safe; it trips the alarm and backup walks in
      startMission('r_cash'); j = G.emj; const n0 = G.enemies.length; near(j.tg[0].x, j.tg[0].z); empJobGrab(G.player); tick(6.5);
      out.office = { mode: j.mode, done: G.obj.done, backup: G.enemies.length - n0, alarm: !!j.alarm };
      out.step=(out.step|0)+1; // WAREHOUSE: three charges, three explosions
      startMission('r_garment'); j = G.emj; out.ware = { mode: j.mode, tg: j.tg.length };
      for (const t of j.tg) { near(t.x, t.z); G.player.armorT = 99; empJobGrab(G.player); } tick(3.3); out.ware.n = G.obj.n; out.ware.done = G.obj.done;
      out.step=(out.step|0)+1; // CLUB: the bag man runs for the street once they see you, and is gone if he gets there
      startMission('r_bowl'); j = G.emj; const b = j.bossE; out.club = { mode: j.mode, bag: !!b.bag }; b.state = 'chase'; tick(0.1); out.club.runs = !!b.runTo;
      b.z = G.front.zT + 1; tick(0.1); out.club.gone = !b.alive && G.obj.done && /AWAY/.test(G.obj.label);
      startMission('r_bowl'); j = G.emj; const s2 = G.score; killEnemy(j.bossE, 'pistol', [0, 1]); tick(0.1); out.club.take = G.score - s2;
      out.step=(out.step|0)+1; // FRONT: after the lieutenant and the job, two waves of backup to hold off
      startMission('e_flamingo'); j = G.emj; out.front = { mode: j.mode, front: j.front }; killAll(); G.obj.done = true; tick(0.1);
      out.front.hold = G.obj.label; const n1 = G.enemies.length; tick(2.2); out.front.wave1 = G.enemies.length - n1; killAll(); tick(2.7); out.front.wave2 = G.enemies.length - n1 - out.front.wave1; killAll(); tick(2.7);
      out.front.done = G.obj.done && !!j.held;
      out.step=(out.step|0)+1; // DEFEND: raiders inside wreck the place; three waves, the lieutenant last; damage climbs while they are inside
      dlgObj(p, 'wflags').own_cigar = 1; p.emp.raid.cigar = { g: 'rayos', d: p.emp.day }; startMission('r_cigar'); j = G.emj;
      out.defend = { mode: j.mode, inside: G.enemies.filter(x => x.alive).length, boss: G.enemies.some(x => x.alive && x.boss) }; tick(3); out.defend.dmg = j.dmg > 0;
      for (let k = 0; k < 3; k++) { killAll(); tick(3); } out.defend.waves = j.wave; out.defend.lt = G.enemies.some(x => x.boss); killAll(); tick(0.5); out.defend.done = G.obj.done;
      out.step=(out.step|0)+1; // losing a raid: damage at 100% ends the job
      startMission('r_cigar'); j = G.emj; j.dmg = 99.9; tick(0.2); out.defend.lost = !G.player.alive && G.killedBy === 'wrecked';
      delete p.emp.raid.cigar;
      out.step=(out.step|0)+1; // HQ: two riot-shield bodyguards, and backup when the boss is hurt
      const w = dlgObj(p, 'wflags'); w.own_flamingo = 1; startMission('hq_rayos'); j = G.emj; const bo = j.bossE, n2 = G.enemies.length;
      out.hq = { mode: j.mode, shields: G.enemies.filter(x => x.kind === 'shield').length }; bo.hp = Math.floor(bo.maxhp / 2); tick(0.1); out.hq.backup = G.enemies.length - n2;
      out.step=(out.step|0)+1; // drawing every mode's markers works
      buildDynamic(); out.drawn = true;
    } catch (err) { out.err = String(err && err.stack || err); }
    fadeTo = fade; return out;
  });
  expect(r.err, 'step '+r.step).toBeUndefined();
  expect(r.aim).toEqual({ w0: 0, w1: expect.any(Number), setting: 'laser', back: 'subtle', label: 'ENEMY AIM: SUBTLE' });
  expect(r.aim.w1).toBeGreaterThan(0.8);
  expect(r.shop).toMatchObject({ mode: 'shop', owner: true, label: 'LEAN ON THE OWNER', how: true, early: false, act: 'LEAN', done: true, half: true, pay: 250 });
  expect(r.shop.paid).toBeGreaterThan(0);
  expect(r.garage).toMatchObject({ mode: 'garage', tg: 1, act: 'WIRE', done: true });
  expect(r.garage.mid).toMatch(/HOTWIRE THEIR CAR \d+%/);
  expect(r.garage.paid).toBeGreaterThan(0);
  expect(r.office).toMatchObject({ mode: 'office', done: true, alarm: true });
  expect(r.office.backup).toBeGreaterThan(0);
  expect(r.ware).toMatchObject({ mode: 'warehouse', tg: 3, n: 3, done: true });
  expect(r.club).toMatchObject({ mode: 'club', bag: true, runs: true, gone: true });
  expect(r.club.take).toBeGreaterThan(0);
  expect(r.front).toMatchObject({ mode: 'club', front: true, hold: 'HOLD THE PLACE', done: true });
  expect(r.front.wave1).toBeGreaterThan(0); expect(r.front.wave2).toBeGreaterThan(0);
  expect(r.defend).toMatchObject({ mode: 'defend', boss: false, dmg: true, waves: 3, lt: true, done: true, lost: true });
  expect(r.defend.inside).toBeLessThanOrEqual(2);
  expect(r.hq.mode).toBe('hq'); expect(r.hq.shields).toBe(2); expect(r.hq.backup).toBe(4);
  expect(r.drawn).toBe(true);
});
