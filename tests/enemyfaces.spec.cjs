const { test, expect } = require('./fixtures.cjs');

// Enemies' faces are painted like the heroes': per-look features (eyes, mouth, nose, age, jaw) rolled from the look itself,
// so building a face never draws from Math.random and the same look always gets the same face.
test('enemy faces: varied, deterministic, no Math.random, and every archetype builds', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(() => {
    startLevel(0); state = 'pause';
    const looks = []; for (const k of [null, 'pistol', 'smg', 'shotgun', 'm16', 'knife', 'bat', 'machete', 'revolver', 'dual']) for (let i = 0; i < 8; i++) looks.push(thugLook(k, null, 0));
    const men = looks.filter(L => !L.fem), key = f => [f.mouth, Math.round(f.eo * 10), Math.round(f.nose * 10), Math.round(f.jaw * 100)].join(',');
    const rnd = Math.random; let calls = 0; Math.random = () => { calls++; return rnd(); };
    const same = men.every(L => JSON.stringify(PS2C.faceOf(L)) === JSON.stringify(PS2C.faceOf(Object.assign({}, L))));
    for (const L of men.slice(0, 6)) PS2C.headTex(L);
    Math.random = rnd;
    let built = 0; for (const L of men.slice(0, 6)) { const c = makeChar(1, 1, L, false); PS2C.beginFrame(); if (PS2C.add(c, 'game', 1, 0, null, 'look')) built++; }
    return { n: men.length, faces: new Set(men.map(L => key(PS2C.faceOf(L)))).size, mouths: new Set(men.map(L => PS2C.faceOf(L).mouth)).size, same, calls, built };
  });
  expect(r.n).toBeGreaterThan(30);
  expect(r.faces).toBeGreaterThan(r.n * 0.8);
  expect(r.mouths).toBeGreaterThanOrEqual(4);
  expect(r.same).toBe(true);
  expect(r.calls).toBe(0);
  expect(r.built).toBe(6);
});
