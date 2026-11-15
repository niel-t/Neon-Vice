const { test, expect } = require('./fixtures.cjs');

// Animals (animals.js): pets, Nugget, guard dogs, fish and the shark are built from instanced rounded boxes and actually move:
// the pose changes from frame to frame, walking moves the legs, and a stopped pet sits or lies down.
test('animals: every animal draws, animates, and rests when it stops', async ({ openGame }) => {
  const page = await openGame();
  const out = await page.evaluate(() => {
    selIdx = 2; sessionReset(Math.min(JOBS.sel, JOBS.top)); const p = myProg(); arm();
    p.home = 2; p.homes = [0, 1, 2]; p.furn = { 2: { dog: 1, cat: 1, iguana: 1, doberman: 1, tank: 1 } }; loadHub('home2', 'home'); if (G.seq) seqSkip();
    const snap = fn => { IBhi.reset(); IBlo.reset(); dynB.reset(); fn(); const B = IBhi.n ? IBhi : dynB; return { n: IBhi.n + IBlo.n + Math.round(dynB.n / 36), f: Array.from(B.f.slice(0, 2400)) }; };
    const differ = (a, b) => a.f.some((v, i) => Math.abs(v - b.f[i]) > 1e-4);
    const o = { pets: {} };
    for (const q of G.pets) {
      q.x = G.player.x + 1; q.z = G.player.z; q._an = null; const T0 = 10;
      drawPet(dynB, q, T0); /* first call starts the tracker */
      q.x += 0.02; const a = snap(() => drawPet(dynB, q, T0 + 0.016));
      q.x += 0.02; const b = snap(() => drawPet(dynB, q, T0 + 0.032));
      let T = T0 + 0.032; for (let i = 0; i < 120; i++) { T += 0.016; drawPet(dynB, q, T); }
      o.pets[q.k] = { n: a.n, walks: differ(a, b), rest: +(q._an.rest).toFixed(2) };
    }
    const e = { x: 5, z: 5, a: 0, vx: 0, vz: 0, alive: true, state: 'chase', id: 3, wind: 0 };
    G.T = 1; drawDog(IBhi, e); e.x += 0.08; G.T += 0.016; const d1 = snap(() => drawDog(IBhi, e)); e.x += 0.08; G.T += 0.016; const d2 = snap(() => drawDog(IBhi, e));
    o.dog = { n: d1.n, runs: differ(d1, d2) }; e.alive = false; o.deadDog = snap(() => drawDog(IBhi, e)).n;
    const t1 = snap(() => drawTankLife(dynB, 1, 0, 3, 0, 0.1, 1, 0.2, 0.8, 0.4, 2)), t2 = snap(() => drawTankLife(dynB, 1.1, 0, 3, 0, 0.1, 1, 0.2, 0.8, 0.4, 2));
    o.tank = { n: t1.n, swims: differ(t1, t2) };
    o.nugget = snap(() => drawNugget(1, 1, 1, 3)).n;
    o.fish = snap(() => drawHomeFish(1, 2, 0, 1.4, 0, 0.5, 1.2)).n;
    return o;
  });
  for (const k of ['dog', 'cat', 'iguana', 'doberman']) {
    expect(out.pets[k].n).toBeGreaterThan(25);
    expect(out.pets[k].walks).toBe(true);
  }
  for (const k of ['dog', 'cat', 'doberman']) expect(out.pets[k].rest).toBeGreaterThan(0.9);
  expect(out.dog.n).toBeGreaterThan(40);
  expect(out.dog.runs).toBe(true);
  expect(out.deadDog).toBeGreaterThan(40);
  expect(out.tank.n).toBeGreaterThan(60);
  expect(out.tank.swims).toBe(true);
  expect(out.nugget).toBeGreaterThan(30);
  expect(out.fish).toBeGreaterThan(40);
  // nothing explodes in size: keep each animal cheap enough for phones
  expect(out.dog.n).toBeLessThan(140);
  expect(out.pets.doberman.n).toBeLessThan(220);
});
