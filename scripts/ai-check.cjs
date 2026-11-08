const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const { worldData } = require('./world-snapshot.cjs');

function checkAI() {
  const { WORLD } = worldData();
  const html = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');
  const close = (a, b, eps = 1e-6, m) => assert(Math.abs(a-b) <= eps, m || `${a} != ${b}`);
  // Two rooms split by a tall wall with one door, plus a low-water strip in the right room.
  const def = { map: ['###########', '#....#....#', '#....#....#', '#....#....#', '#....D....#', '###########'], wall: 1 };
  const make = () => {
    const g = WORLD.buildGrid(def, 0);
    g.doors = g.doorSpecs.map(d => ({ ...d, th: 0, w: 0, pusher: '' }));
    g.enemies = []; g.items = []; g.T = 0; g.flow = new Int16Array(g.W*g.H);
    g.player = { x: 1, z: 1, r: .28, vx: 0, vz: 0, alive: true };
    return g;
  };
  const ctx = vm.createContext({ WORLD, G: null, Dd: () => ({ vision: 9, cone: .85, react: 1 }), sfx: () => {}, popup: () => {}, banner: () => {},
    clamp: (v,a,b) => v<a?a:v>b?b:v, los: (...a) => WORLD.cell.los(ctx.G, ...a), Math });
  vm.runInContext([
    'const TAU=Math.PI*2;', html.match(/const angDiff=[^\r\n]+/)[0],
    html.slice(html.indexOf('function flowStep('), html.indexOf('/* ================= GEOMETRY')),
    readFileSync(resolve(__dirname, '..', 'ai.js'), 'utf8').replace(/^'use strict';/, ''),
    'this.AI=AI;this.alertNoise=alertNoise;this.spot=spot;'
  ].join('\n'), ctx);
  const { AI } = ctx, B = AI.belief;

  // Belief: decay, uncertainty growth, clamped prediction, sight wins, goal clamped by geometry.
  const b = B.make(2, 2, 10, 'see', { vx: 3, vz: 0 });
  close(B.conf(b, 14), Math.exp(-1)); close(B.sig(b, 11), .3+2.5); close(B.sig(b, 100), 8);
  assert.deepEqual([...B.predict(b, 10.5)], [3.5, 2]); assert.deepEqual([...B.predict(b, 30)], [5, 2], 'Prediction clamps to 1 s');
  const weak = B.make(0, 0, 0, 'hit'), strong = B.make(0, 0, 0, 'noise');
  assert(B.accept(weak, strong, 0) && !B.accept(strong, weak, 0) && B.accept(strong, B.make(0, 0, 0, 'see', { conf: .01 }), 0));
  assert(B.accept(B.make(0, 0, 0, 'see'), B.make(0, 0, 8, 'hit'), 8), 'Fresh weak news beats stale strong news');
  let g = make(); ctx.G = g;
  assert.deepEqual([...B.goal(g, B.make(4.5, 2.5, 0, 'see', { vx: 3, vz: 0 }))], [4.5, 2.5], 'Prediction through a wall is rejected');
  assert.deepEqual([...B.goal(g, B.make(2.5, 2.5, 0, 'see', { vx: 1, vz: 0 }))], [3.5, 2.5]);

  // Attenuation: open air ~ distance, tall wall +6, closed door +3, open door free, low water free.
  const cost = (sx, sz, x, z, max = 50) => AI.costAt(AI.hear(g, sx, sz, max), x, z);
  close(cost(2.5, 2.5, 4.5, 2.5), 2); close(cost(2.5, 2.5, 4.5, 4.5), 2*Math.SQRT2);
  close(cost(4.5, 2.5, 7.5, 2.5), 9, 1e-6, 'Through the wall');
  close(cost(4.5, 5.5, 7.5, 5.5), 6, 1e-6, 'Through the closed door');
  g.doors[0].th = 1.4; AI.hear(g, 0, 0, 0); close(cost(4.5, 5.5, 7.5, 5.5), 3, 1e-6, 'Open door transmits'); g.doors[0].th = 0;
  g.solid[2*g.W+8] = 1; g.wh[2*g.W+8] = .02; close(cost(7.5, 2.5, 9.5, 2.5), 2, 1e-6, 'Low water does not attenuate'); g.solid[2*g.W+8] = 0; g.wh[2*g.W+8] = 0;
  assert.equal(cost(2.5, 2.5, 9.5, 2.5, 3), Infinity, 'Search stops at the radius');

  // Noise: honest per-source knowledge, attenuated by walls, coalesced per frame.
  const guard = (x, z, o = {}) => ({ x, z, r: .28, a: 0, alive: true, down: 0, state: 'idle', id: g.enemies.length, ...o });
  g = make(); ctx.G = g;
  const near = guard(3.5, 2.5), walled = guard(7.5, 2.5), chaser = guard(4.5, 4.2, { state: 'chase' });
  g.enemies.push(near, walled, chaser);
  ctx.alertNoise(2.5, 2.5, 6, 'p');
  assert(near.state === 'search' && near.bl.src === 'noise' && near.bl.x === 2.5, 'Player noise gives a player belief');
  assert(walled.state === 'idle' && !walled.bl, 'A tall wall muffles a 6 m noise at 5 m');
  assert(chaser.state === 'chase' && chaser.bl && chaser.bl.src === 'noise', 'Chasers hear and update belief');
  g.T = 1; ctx.alertNoise(8.5, 3.5, 6);
  assert(walled.state === 'search' && walled.poi.src === 'noise' && !walled.bl, 'Non-player noise is a point of interest, not a player belief');
  const n0 = AI.noises.length; ctx.alertNoise(8.5, 3.5, 4); assert.equal(AI.noises.length, n0, 'Same-frame noises coalesce');

  // Callouts are snapshots gated by sound, not live links to the player.
  g = make(); ctx.G = g;
  const spotter = guard(4.5, 2.5), mate = guard(3.5, 3.5), across = guard(7.5, 2.5);
  g.enemies.push(spotter, mate, across); g.player.x = 2; g.player.z = 3;
  spotter.bl = B.make(2, 3, 0, 'see'); ctx.spot(spotter);
  assert(mate.state === 'search' && mate.bl.src === 'call' && mate.bl.t === 0 && mate.bl.x === 2, 'Same-room ally gets a snapshot');
  assert(across.state === 'idle' && !across.bl, 'Ally behind a wall does not hear the callout');
  g.player.x = 9; assert.equal(mate.bl.x, 2, 'Snapshot does not follow the player');

  // Hit belief points back along the damage direction.
  const hurt = guard(3, 2); AI.hurt(hurt, [0, 2]);
  assert(hurt.bl.src === 'hit' && hurt.bl.x === 3 && hurt.bl.z === -1, 'Hit belief lies back along the damage direction');

  // Seeded agent randomness is repeatable and per agent.
  const seq = e => [AI.rand(e), AI.rand(e), AI.rand(e)];
  assert.deepEqual(seq({ id: 3 }), seq({ id: 3 })); assert.notDeepEqual(seq({ id: 3 }), seq({ id: 4 }));

  // Navigation fields: one per target cell, independent, budgeted, oldest request first.
  g = make(); ctx.G = g; g.T = 5;
  const fa = AI.nav.field(g, 2.5, 2.5), fb = AI.nav.field(g, 8.5, 2.5);
  assert(fa !== fb && fa[2*g.W+2] === 0 && fb[2*g.W+8] === 0 && fa[2*g.W+8] > 0, 'Fields are target-owned');
  assert.equal(AI.nav.field(g, 2.6, 2.4), fa, 'Same target cell shares a field');
  const built = AI.nav.built; AI.nav.field(g, 3.5, 3.5); AI.nav.field(g, 4.5, 4.5);
  assert.equal(AI.nav.field(g, 7.5, 2.5), null, 'Budget of 4 per frame'); assert.equal(AI.nav.built-built, 2);
  g.T = 5.1; AI.nav.field(g, 9.5, 3.5);
  assert(AI.nav.cache.has(2*g.W+7), 'Queued request served first next frame');
  g.navVer = 1; g.solid[2*g.W+6] = 0; const fresh = AI.nav.field(g, 2.5, 2.5);
  assert(fresh[2*g.W+6] === 4, 'Geometry version bump rebuilds stale fields');
  assert.equal(AI.nav.field(g, -5, -5), false, 'No free cell near target');

  // Room belief (W8b): rooms A|B|C in a row (4x4 m each), B-C door lockable, C opens to the outside.
  const R = AI.rooms, shut = new Set();
  const gr = { n: 3, area: [16, 16, 16, 1e3], cx: [2, 6, 10, 0], cz: [2, 2, 2, 0], pa: [0, 1, 2], pb: [1, 2, -1], pw: [1, 1, 1],
    px: [4, 8, 12], pz: [2, 2, 2], at: (x, z) => x < 0 || x >= 12 ? -1 : Math.floor(x/4), adj: i => [[0], [0, 1], [1, 2]][i] || [], open: k => !shut.has(k) };
  const sum = P => [...P].reduce((a, v) => a+v, 0);
  let P = R.init(gr, 1, 1); assert.deepEqual([...P], [1, 0, 0, 0]);
  for (let i = 0; i < 8; i++) R.diffuse(gr, P, .25, 3);
  close(sum(P), 1, 1e-5, 'Diffusion conserves mass'); assert(P[0] > P[1] && P[1] > P[2] && P[2] > P[3] && P[3] > 0, 'Mass spreads outward in order');
  P = R.init(gr, 5, 1); shut.add(1); for (let i = 0; i < 40; i++) R.diffuse(gr, P, .25, 3);
  assert(P[2] === 0 && P[3] === 0 && P[0] > 0, 'Locked portals stop the spread'); shut.clear();
  P = Float32Array.from([.5, .5, 0, 0]); assert(R.clear(P, 1)); close(P[0], 1, 1e-6, 'Searched room drops out and mass renormalises');
  assert(!R.clear(Float32Array.from([1, 0, 0, 0]), 0), 'Clearing the last candidate reports lost');
  assert.equal(R.pick(gr, Float32Array.from([.2, 0, .8, 0]), 1, 2), 2, 'Likelier room wins');
  assert.equal(R.pick(gr, Float32Array.from([.5, 0, .5, 0]), 1, 2), 0, 'Ties go to the nearer room');
  const am = R.ambush(gr, Float32Array.from([0, 0, 1, 0]), 1);
  assert(am.k === 1 && am.x === 6.5 && am.z === 2 && close(am.a, Math.PI/2) === undefined, 'Ambush covers the likely door from inside');
  shut.add(1); assert.equal(R.ambush(gr, Float32Array.from([0, 0, 1, 0]), 1), null, 'No ambush on a locked door'); shut.clear();
  console.log('AI: belief, attenuation, callouts, seeded rng, per-target nav fields and room belief checked');
}

module.exports = { checkAI };
if (require.main === module) checkAI();
