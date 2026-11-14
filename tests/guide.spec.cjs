const { test, expect } = require('./fixtures.cjs');

// The next-objective guide (guide.js): nothing while guards stand, then the objective, the next stage's stairs, or the way out.
test('guide: points at the singer, then the car, once the Studio is clear', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(async () => {
    const wait = ms => new Promise(res => setTimeout(res, ms));
    startMission('c6'); if (G.arrive) endArrive(); await wait(300);
    const g = G, before = guideTarget(g);
    for (const e of g.enemies) e.alive = false;
    await wait(400);
    const t1 = guideTarget(g), singer = { x: g.singer.x, z: g.singer.z };
    drawHUD0(); touchMode = true; drawHUD0(); touchMode = false;
    g.obj.done = true; await wait(400);
    const t2 = guideTarget(g);
    return { before, t1: t1 && { k: t1.k, lbl: t1.lbl, at: t1.x === singer.x && t1.z === singer.z }, cleared: g.cleared, t2: t2 && { k: t2.k, car: t2.x === g.car.x && t2.z === g.car.z, lbl: t2.lbl.split('  ')[0] } };
  });
  expect(r).toEqual({ before: null, t1: { k: 'obj', lbl: 'TALK TO THE SINGER', at: true }, cleared: true, t2: { k: 'exit', car: true, lbl: 'BACK TO THE CAR' } });
});

test('guide: Coral Tower lobby points up the stairs once its guards are down', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(async () => {
    const wait = ms => new Promise(res => setTimeout(res, ms));
    window.NOARRIVE = 1; startMission('c2'); if (G.arrive) endArrive(); await wait(300);
    const g = G, before = guideTarget(g);
    for (const e of g.enemies) e.alive = false; await wait(300);
    const t = guideTarget(g), st = g.stageRun.describe(g.sid).stairs.find(s => s.x === undefined && s.at[0] === t.x && s.at[1] === t.z);
    return { before, k: t.k, lbl: t.lbl, stair: st && st.id, cleared: g.cleared };
  });
  expect(r).toEqual({ before: null, k: 'stage', lbl: 'TAKE THE STAIRS', stair: 'up', cleared: false });
});

test('guide: spared Lex shows the charges on Ocean Drive before the guards are down', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(async () => {
    const wait = ms => new Promise(res => setTimeout(res, ms));
    startMission('c8'); if (G.arrive) endArrive(); await wait(300);
    const g = G, plain = guideTarget(g);
    g.tip = true; g.gdT = -1;
    const tip = guideTarget(g);
    return { plain, tip: tip && tip.lbl, foes: g.enemies.some(e => e.alive) };
  });
  expect(r).toEqual({ plain: null, tip: 'CUT THE WIRES', foes: true });
});
