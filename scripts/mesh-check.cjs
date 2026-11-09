const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

// W2b geometry mesher (mesh.js) over every plans/*.js stage; see docs/PLAN-FORMAT.md §9.
const MAX_VERTS = 200000;
const DOORS = new Set(['door', 'double', 'slide']);

function load() {
  const root = resolve(__dirname, '..');
  const planFiles = readdirSync(resolve(root, 'plans')).filter(f => f.endsWith('.js')).sort().map(f => `plans/${f}`);
  const src = ['levels.js', 'world.js', 'plan.js', ...planFiles, 'mesh.js'].map(f => readFileSync(resolve(root, f), 'utf8')).join('\n');
  return vm.runInNewContext(`${src}\n({WORLD,PLAN,PLANS,MESH})`, { performance }, { timeout: 30000 });
}

// sink recording Batch-shaped vertices (x y z nx ny nz u v r g b room)
function recorder() {
  const d = [];
  return { d, room: 0, blT: 0, blW: 0, ensure() {}, vtx(x, y, z, nx, ny, nz, u, v, c) { d.push(x, y, z, nx, ny, nz, u, v, c[0], c[1], c[2], this.room); } };
}

function meshStage(api, plan, sid, finish) {
  const { WORLD, PLAN, MESH } = api, out = PLAN.fromPlan(plan, sid), st = WORLD.compile(out.stage), sink = recorder(), tiles = new Set();
  const opts = { uv: t => (tiles.add(t), [0, 0, 1, 1]), finish: finish ?? out.extras.finish };
  return { st, out, sink, tiles, res: MESH.build(st, opts, sink) };
}

function checkStage(api, plan, pid, sid) {
  const { WORLD } = api, where = `${pid}/${sid}`, { st, sink, res } = meshStage(api, plan, sid), d = sink.d, N = 12;
  assert.equal(d.length / N, res.verts, `${where}: vertex count`);
  assert(res.verts > 0 && res.verts % 3 === 0 && res.verts <= MAX_VERTS, `${where}: ${res.verts} verts outside (0, ${MAX_VERTS}]`);
  assert(d.every(Number.isFinite), `${where}: non-finite vertex data`);
  const roomArea = st.rooms.reduce((s, r) => s + r.area, 0);
  assert(Math.abs(res.floorArea - roomArea) < 1e-6 * Math.max(1, roomArea), `${where}: floor area ${res.floorArea} vs rooms ${roomArea}`);
  const doors = st.openings.filter(o => DOORS.has(o.kind)).flatMap(o => o.segments.map(([a, b]) => ({ o, a, b })));
  let floorTris = 0;
  for (let t = 0; t < d.length; t += 3 * N) {
    const v = k => d.slice(t + k * N, t + k * N + N), [A, B, C] = [v(0), v(1), v(2)];
    assert(A[11] === B[11] && B[11] === C[11], `${where}: room byte varies within a triangle at ${A.slice(0, 3)}`);
    assert(A[11] >= 0 && A[11] <= 255, `${where}: room byte ${A[11]}`);
    for (const P of [A, B, C]) assert(Math.abs(Math.hypot(P[3], P[4], P[5]) - 1) < 1e-6, `${where}: non-unit normal at ${P.slice(0, 3)}`);
    const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], wx = C[0] - A[0], wy = C[1] - A[1], wz = C[2] - A[2];
    const cx = uy * wz - uz * wy, cy = uz * wx - ux * wz, cz = ux * wy - uy * wx, area2 = Math.hypot(cx, cy, cz);
    assert(area2 > 1e-10, `${where}: degenerate triangle at ${A.slice(0, 3)}`);
    assert(cx * A[3] + cy * A[4] + cz * A[5] > 0, `${where}: triangle winding disagrees with its normal at ${A.slice(0, 3)}`);
    const mx = (A[0] + B[0] + C[0]) / 3, my = (A[1] + B[1] + C[1]) / 3, mz = (A[2] + B[2] + C[2]) / 3;
    if (A[4] > 0.999 && A[11] > 0 && Math.abs(my - WORLD.groundY(st, mx, mz)) < 1e-6) {
      const r = WORLD.roomAt(st, mx, mz);
      if (r) { floorTris++; assert.equal(A[11], r.idx + 1, `${where}: floor at ${mx.toFixed(2)},${mz.toFixed(2)} tagged ${A[11]}, room ${r.id} is ${r.idx + 1}`); }
    }
    if (Math.abs(A[4]) < 1e-6) for (const { o, a, b } of doors) { // wall faces never fill a door opening
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ex = (b[0] - a[0]) / L, ez = (b[1] - a[1]) / L;
      const s = (mx - a[0]) * ex + (mz - a[1]) * ez, n = Math.abs((mx - a[0]) * -ez + (mz - a[1]) * ex);
      assert(!(s > 0.02 && s < L - 0.02 && n < 0.15 && my > 0.02 && my < o.y1 - 0.02), `${where}: wall face inside opening ${o.id} at ${mx.toFixed(2)},${my.toFixed(2)},${mz.toFixed(2)}`);
    }
  }
  assert(floorTris > 0, `${where}: no floor triangles`);
  return res;
}

// Astra W2b findings: wall faces split at room outlines, first-wins depressions get sides, collinear fan starts
function checkSynthetic(api) {
  const plan = { id: 'syn', v: 1, name: 'syn', stages: { s: { bounds: [0, 0, 4, 4],
    rooms: [{ id: 'a', rect: [0, 0, 0.7, 4], zone: 'exterior', surf: 'concrete' }, { id: 'b', rect: [0.7, 0, 4, 4], zone: 'exterior', surf: 'concrete' }],
    walls: [{ id: 'w', path: [[0, 1], [2, 1]], build: 'cmu_hollow', cov: 'waist', h: 1 }],
    ground: [{ id: 'pit', poly: [[1, 2], [3, 2], [3, 3.5], [1, 3.5]], y: -1, surf: 'concrete' }],
    props: [{ id: 'p', poly: [[2.5, 0.2], [3, 0.2], [3.5, 0.2], [3.5, 0.8], [2.5, 0.8]], build: 'cmu_filled', cov: 'full', h: 0.5 }],
    spawns: [{ id: 'p_in', kind: 'player', at: [3, 1.5] }] } } };
  checkStage(api, plan, 'syn', 's');
  const { st, sink } = meshStage(api, plan, 's'), d = sink.d, N = 12;
  let pitSide = 0;
  for (let t = 0; t < d.length; t += 3 * N) {
    const v = k => d.slice(t + k * N, t + k * N + N), [A, B, C] = [v(0), v(1), v(2)];
    if (Math.abs(A[4]) > 1e-6) continue;
    const mx = (A[0] + B[0] + C[0]) / 3, my = (A[1] + B[1] + C[1]) / 3, mz = (A[2] + B[2] + C[2]) / 3;
    const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], wx = C[0] - A[0], wy = C[1] - A[1], wz = C[2] - A[2];
    const area = Math.hypot(uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx) / 2;
    if (my > 0) { const r = api.WORLD.roomAt(st, mx + A[3] * 0.05, mz + A[5] * 0.05); assert.equal(A[11], r ? r.idx + 1 : 0, `syn: wall face at ${mx.toFixed(2)},${mz.toFixed(2)} has the wrong room byte`); }
    else if (Math.min(A[1], B[1], C[1]) < -0.999) pitSide += area;
  }
  assert(Math.abs(pitSide - 7) < 1e-6, `syn: pit sides cover ${pitSide} m², expected 7`);
  // decor[] (render-only, retained by WORLD as st.decor): rotated box standing in the pit, tiled; second one flat colour on a shelf
  const tiles = new Set(), ds = recorder(), dst = Object.assign(Object.create(null), st, { decor: [
    { id: 'd1', kind: 'crate', at: [2, 2.75], size: [0.6, 0.4], h: 0.5, rot: 0.5, tile: 7 },
    { id: 'd2', kind: 'tv', at: [3, 1.5], size: [0.5, 0.3], h: 0.3, y: 0.8, col: [0.2, 0.2, 0.25] }] });
  const res = api.MESH.build(dst, { uv: t => (tiles.add(t), [0, 0, 1, 1]) }, ds), base = api.MESH.build(st, { uv: () => [0, 0, 1, 1] }, recorder());
  assert.equal(res.verts - base.verts, 6 * 5 + 6 * 6, 'decor: box with top+4 sides on the ground, +bottom when raised');
  assert(tiles.has(7), 'decor tile is used');
  const dd = ds.d.slice(base.verts * N), ys = []; for (let i = 0; i < dd.length; i += N) ys.push(dd[i + 1]);
  assert(Math.abs(Math.min(...ys) + 1) < 1e-9 && Math.abs(Math.max(...ys) - 1.1) < 1e-9, `decor sits on the pit ground and the shelf offset (y ${Math.min(...ys)}..${Math.max(...ys)})`);
  const rb = api.WORLD.roomAt(st, 2, 2.75).idx + 1; assert(dd.filter((_, i) => i % N === 11).slice(0, 30).every(b => b === rb), 'decor room byte');
  for (let t = 0; t < dd.length; t += 3 * N) { // winding and outward normals
    const A = dd.slice(t, t + N), B = dd.slice(t + N, t + 2 * N), C = dd.slice(t + 2 * N, t + 3 * N), c = t < 30 * N ? [2, 2.75] : [3, 1.5];
    const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], wx = C[0] - A[0], wy = C[1] - A[1], wz = C[2] - A[2];
    assert((uy * wz - uz * wy) * A[3] + (uz * wx - ux * wz) * A[4] + (ux * wy - uy * wx) * A[5] > 0, 'decor winding');
    if (Math.abs(A[4]) < 1e-6) assert(((A[0] + B[0] + C[0]) / 3 - c[0]) * A[3] + ((A[2] + B[2] + C[2]) / 3 - c[1]) * A[5] > 0, 'decor side normal points outward');
  }
  // decor exactly on ground/room edges follows WORLD's boundary-inclusive first-wins lookups
  for (const at of [[2, 2], [1, 2.5], [0.7, 3], [4, 0.5]]) {
    const s = recorder(); api.MESH.build(Object.assign(Object.create(null), st, { decor: [{ id: 'e', kind: 'x', at, size: [0.2, 0.2], h: 0.1 }] }), { uv: () => [0, 0, 1, 1] }, s);
    const e = s.d.slice(base.verts * N), r = api.WORLD.roomAt(st, ...at);
    assert(Math.abs(Math.min(...e.filter((_, i) => i % N === 1)) - api.WORLD.groundY(st, ...at)) < 1e-9, `decor at ${at}: base vs WORLD.groundY`);
    assert.equal(e[11], r ? r.idx + 1 : 0, `decor at ${at}: room byte vs WORLD.roomAt`);
  }
}

// render cutaway: a back wall with void behind keeps full height, a wall with playable floor behind drops to 1.2 m; cut:false keeps both
function checkCutaway(api) {
  const { WORLD, PLAN, MESH } = api, plan = { id: 'cut', v: 1, name: 'cut', stages: { s: { bounds: [0, 0, 10, 10],
    rooms: [{ id: 'y', rect: [0, 0, 10, 10], zone: 'exterior', kind: 'yard', surf: 'concrete' }, { id: 'a', in: 'y', kind: 'office', rect: [2, 0, 8, 5] }],
    doors: [{ id: 'd', rooms: ['a', 'y'], at: [5, 5], w: 0.91, kind: 'door_solid' }],
    spawns: [{ id: 'p', kind: 'player', at: [5, 8] }] } } };
  const st = WORLD.compile(PLAN.fromPlan(plan, 's').stage), N = 12;
  const top = (cut, z) => { const s = recorder(); MESH.build(st, { uv: () => [0, 0, 1, 1], cut }, s); let m = 0; for (let i = 0; i < s.d.length; i += N) if (Math.abs(s.d[i + 2] - z) < 0.3 && Math.abs(s.d[i] - 5) < 2) m = Math.max(m, s.d[i + 1]); return m; };
  const H = top(false, 0);
  assert(H > 2 && Math.abs(top(undefined, 0) - H) < 1e-6, `cutaway: back wall over void should stay ${H}, got ${top(undefined, 0)}`);
  assert(Math.abs(top(undefined, 5) - 1.2) < 1e-6, `cutaway: occluding wall and door casing should cut to 1.2, got ${top(undefined, 5)}`);
  assert(Math.abs(top(false, 5) - H) < 0.1 && Math.abs(top({ h: 1.5 }, 5) - 1.5) < 1e-6, 'cutaway: cut:false / cut.h');
  // Astra: the near end of the hidden interval (narrow rooms, walls near eye height) and full-height openings
  const mk = (room, door) => WORLD.compile(PLAN.fromPlan({ id: 'c2', v: 1, name: 'c2', stages: { s: { bounds: [0, 0, 10, 10],
    rooms: [{ id: 'y', rect: [0, 0, 10, 10], zone: 'exterior', kind: 'yard', surf: 'concrete' }, { id: 'a', in: 'y', kind: 'office', ...room }],
    doors: door ? [{ id: 'd', rooms: ['a', 'y'], w: 0.91, kind: 'door_solid', ...door }] : [],
    spawns: [{ id: 'p', kind: 'player', at: [5, 8] }] } } }, 's').stage);
  const topOf = (s2, z, x = 5) => { const s = recorder(); MESH.build(s2, { uv: () => [0, 0, 1, 1] }, s); let m = 0; for (let i = 0; i < s.d.length; i += N) if (Math.abs(s.d[i + 2] - z) < 0.3 && Math.abs(s.d[i] - x) < 0.6) m = Math.max(m, s.d[i + 1]); return m; };
  assert(Math.abs(topOf(mk({ rect: [0, 0, 10, 3], h: 7 }), 3) - 1.2) < 1e-6, `cutaway: 7 m wall in front of a room should cut, got ${topOf(mk({ rect: [0, 0, 10, 3], h: 7 }), 3)}`);
  assert(Math.abs(topOf(mk({ rect: [0, 0, 10, 1] }), 1) - 1.2) < 1e-6, 'cutaway: 1 m corridor front wall should cut');
  const fh = mk({ rect: [2, 0, 8, 5] }, { at: [5, 5] }), fy = fh.openings.find(o => o.kind === 'door');
  if (fy) { const full = mk({ rect: [2, 0, 8, 5] }, { at: [5, 5], y1: Math.max(...fh.cells.map(c => c.y1)) });
    assert(Math.abs(topOf(full, 5) - 1.2) < 1e-6, `cutaway: full-height opening casing should cut, got ${topOf(full, 5)}`); }
}

function checkMesh() {
  const api = load(), { PLANS, MESH, WORLD } = api;
  assert.throws(() => MESH.build({ v: 2 }, { uv: () => [0, 0, 1, 1] }, recorder()), /WORLD v3 plan stage/);
  checkSynthetic(api);
  checkCutaway(api);
  for (const [pid, plan] of Object.entries(PLANS)) for (const sid of Object.keys(plan.stages)) {
    const res = checkStage(api, plan, pid, sid);
    // deterministic: identical output on rebuild
    const a = meshStage(api, plan, sid).sink.d, b = meshStage(api, plan, sid).sink.d;
    assert(a.length === b.length && a.every((x, i) => x === b[i]), `${pid}/${sid}: mesh output is not deterministic`);
    if (process.env.MESH_TIMING) console.log(`${pid}/${sid}: ${res.verts} verts, ${res.ms.toFixed(1)} ms`, JSON.stringify(res.prof));
  }
  // finish tables: a room-id override beats kind and surf defaults; unknown keys are rejected by the validator
  const motel = PLANS.motel, room = Object.values(motel.stages)[0].rooms.find(r => r.kind), sid = Object.keys(motel.stages)[0];
  const base = meshStage(api, motel, sid), over = meshStage(api, motel, sid, { wall: {}, floor: { [room.id]: 250 } });
  assert(!base.tiles.has(250) && over.tiles.has(250), 'finish.floor room override must select its tile');
  const bad = JSON.parse(JSON.stringify(motel));
  bad.stages[sid].finish = { floor: { no_such_room: 3, [room.id]: 1.5 } };
  const errs = api.PLAN.validate(bad, { raster: false }).errors.join('\n');
  assert(/finish\.floor\.no_such_room/.test(errs) && /integer 0-255/.test(errs), `finish validation errors missing:\n${errs}`);
  assert(WORLD.roomAt, 'WORLD.roomAt is required by the mesh check');
}

module.exports = { checkMesh };
if (require.main === module) { checkMesh(); console.log('mesh check passed'); }
