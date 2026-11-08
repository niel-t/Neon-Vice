const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

// Plan format v1 (plan.js) and every plans/*.js level plan; see docs/PLAN-FORMAT.md.
function loadPlans() {
  const root = resolve(__dirname, '..');
  const planFiles = readdirSync(resolve(root, 'plans')).filter(f => f.endsWith('.js')).sort().map(f => `plans/${f}`);
  const src = ['levels.js', 'world.js', 'plan.js', ...planFiles].map(f => readFileSync(resolve(root, f), 'utf8')).join('\n');
  return vm.runInNewContext(`${src}\n({WORLD,PLAN,PLANS})`, {}, { timeout: 30000 });
}

// two 4×4 rooms in a yard; tweak(stage) adjusts the copy per case
function tiny(tweak = s => s) {
  const stage = {
    bounds: [0, 0, 12, 8], combat: true,
    rooms: [
      { id: 'yard', zone: 'exterior', kind: 'yard', rect: [0, 0, 12, 8] },
      { id: 'a', in: 'yard', kind: 'room', rect: [2, 2, 6, 6] },
      { id: 'b', in: 'yard', kind: 'room', rect: [6, 2, 10, 6] },
    ],
    doors: [
      { id: 'd_a', rooms: ['a', 'yard'], at: [4, 6], w: 0.91, kind: 'door_solid', hinge: 'w' },
      { id: 'd_ab', rooms: ['a', 'b'], at: [6, 4], w: 0.91, kind: 'door_hollow' },
    ],
    spawns: [{ id: 'p', kind: 'player', at: [1, 1] }, { id: 'e', kind: 'enemy', at: [8, 4] }],
    targets: { sight: [
      { id: 'shut', from: [5, 4], to: [8, 4], expect: 'blocked' },
      { id: 'open', from: [5, 4], to: [8, 4], open: ['d_ab'], expect: 'clear' },
    ] },
  };
  return { id: 'tiny', v: 1, stages: { s: tweak(stage) } };
}

function checkPlans() {
  const { WORLD, PLAN, PLANS } = loadPlans();
  assert.equal(PLAN.version, 1);
  const ok = (plan, what) => { const r = PLAN.validate(plan); assert.equal(r.errors.length, 0, `${what}: ${r.errors.join('; ')}`); return r; };
  const bad = (plan, re, what) => { const r = PLAN.validate(plan, { raster: false }); assert(r.errors.some(e => re.test(e)), `${what}: expected ${re}, got ${r.errors.join('; ') || 'no errors'}`); };

  // every registered level plan validates clean and compiles deterministically
  assert(Object.keys(PLANS).length > 0, 'no plans registered');
  const reports = {};
  for (const [id, plan] of Object.entries(PLANS)) {
    assert.equal(plan.id, id);
    const r = reports[id] = ok(plan, id);
    for (const sid of Object.keys(plan.stages)) {
      const out = r.outs[sid].out;
      assert.equal(JSON.stringify(PLAN.fromPlan(plan, sid)), JSON.stringify(PLAN.fromPlan(plan, sid)), `${id}/${sid}: deterministic`);
      for (const room of out.stage.rooms) assert(!('holes' in room), `${id}/${sid} room ${room.id}: stage rooms are simple`);
    }
  }

  // tiny case: walls, door, sight with the door open and shut, reachability through the door
  const t = ok(tiny(), 'tiny');
  assert.deepEqual([...t.stages.s.sight.map(s => s.got)], ['blocked', 'clear']);
  const ts = t.outs.s.out.stage, by = id => ts.walls.find(w => w.open.some(o => o.id === id));
  assert.equal(by('d_a').build, 'cbs_ext');
  assert.equal(by('d_ab').build, 'cmu_hollow');
  assert.equal(by('d_a').open[0].door.hinge !== undefined, true);

  // nested bath: partition inherits the child's part, the demising wall stays cmu, joints compile
  const nested = ok(tiny(s => {
    s.rooms.push({ id: 'a_bath', in: 'a', kind: 'bath', part: 'stud_wood_gyp', rect: [2, 2, 4, 4] });
    s.doors.push({ id: 'd_bath', rooms: ['a', 'a_bath'], at: [3, 4], w: 0.76, kind: 'door_hollow' });
    return s;
  }), 'nested');
  const ns = nested.outs.s.out;
  assert.equal(ns.stage.walls.find(w => w.open.some(o => o.id === 'd_bath')).build, 'stud_wood_gyp');
  assert.equal(ns.stage.walls.find(w => w.open.some(o => o.id === 'd_ab')).build, 'cmu_hollow');
  assert.equal(PLAN.entrances(ns, 'a').length, 2, 'bath door is inside room a');

  // a hole (child strictly inside its parent) is split into simple pieces with cut portals
  const holed = ok(tiny(s => {
    s.rooms.push({ id: 'shed', in: 'yard', kind: 'shed', rect: [7.5, 6.6, 11.5, 7.9] });
    s.doors.push({ id: 'd_shed', rooms: ['shed', 'yard'], at: [7.5, 7.25], w: 0.8, kind: 'door_metal' });
    return s;
  }), 'holed');
  const hs = holed.outs.s.out, yard = hs.stage.rooms.filter(r => r.parent === 'yard');
  assert(yard.length > 1, 'yard splits into pieces');
  const area = yard.reduce((s, r) => s + PLAN.area(r.poly), 0);
  assert(Math.abs(area - (96 - 32 - 5.2)) < 1e-6, `yard pieces cover the net area (${area})`);
  assert(hs.extras.portals.some(p => p.kind === 'cut' && p.ra === 'yard' && p.rb === 'yard'));
  assert(yard.some(r => r.id === hs.extras.portals.find(p => p.id === 'd_shed').b), 'portal remapped to the touching piece');
  WORLD.compile(hs.stage);

  // errors: overlap, door over a junction, drop edge on an elevated stage, unknown build, unreachable
  bad(tiny(s => { s.rooms.push({ id: 'c', in: 'yard', rect: [5, 5, 7, 7] }); return s; }), /overlap/, 'overlap');
  bad(tiny(s => { s.doors[1].at = [6, 2.4]; return s; }), /junction|past|corner/, 'door at junction');
  bad(tiny(s => { s.rooms.push({ id: 'box', in: 'yard', rect: [10.5, 6.5, 11.5, 7.5] }); s.doors.push({ id: 'd_box', rooms: ['box', 'yard'], at: [11, 6.5], w: 0.8, kind: 'door_metal' }); return s; }), /mitre/, 'door in a corner mitre');
  bad(tiny(s => { s.elevated = true; return s; }), /drop edge/, 'drop edge');
  bad(tiny(s => { s.edges = [{ rooms: ['a', 'b'], build: 'nope' }]; return s; }), /unknown build|nope/, 'unknown build');
  const shut = tiny(s => { s.doors.pop(); s.targets = {}; return s; });
  const rs = PLAN.validate(shut);
  assert(rs.errors.some(e => /room b: no walkable entrance/.test(e)), rs.errors.join('; '));
  assert(rs.errors.some(e => /spawn e .* not reachable/.test(e)), rs.errors.join('; '));

  // review regressions: crossing overlap, enclosed spawn, edge portals clipped to pieces, partition orientation
  bad(tiny(s => { s.rooms.push({ id: 'c', in: 'yard', zone: 'exterior', rect: [9.1, 5.5, 11.5, 7.5] }, { id: 'd', in: 'yard', zone: 'exterior', rect: [8, 7, 9.5, 7.8] }); return s; }), /overlap/, 'crossing overlap');
  const pen = PLAN.validate(tiny(s => { s.walls = [{ id: 'pen', path: [[10.5, 6.5], [11.7, 6.5], [11.7, 7.7], [10.5, 7.7]], closed: true, build: 'stud_wood_gyp', cov: 'full', h: 2.4 }]; s.spawns.push({ id: 'trap', kind: 'enemy', at: [11.1, 7.1] }); return s; }));
  assert(pen.errors.some(e => /spawn trap .* not reachable/.test(e)), `enclosed spawn: ${pen.errors.join('; ')}`);
  const clip = ok({ id: 'clip', v: 1, stages: { s: { bounds: [0, -4, 12, 12], combat: true,
    rooms: [{ id: 'yard', zone: 'exterior', kind: 'yard', rect: [0, 0, 12, 12] }, { id: 'street', zone: 'exterior', kind: 'street', rect: [0, -4, 12, 0] },
      { id: 'shed', in: 'yard', kind: 'shed', rect: [4, 4, 8, 8] }],
    doors: [{ id: 'd_shed', rooms: ['shed', 'yard'], at: [6, 8], w: 0.91, kind: 'door_metal' }],
    spawns: [{ id: 'p', kind: 'player', at: [1, -2] }] } } }, 'clip').outs.s.out;
  const sp = clip.extras.portals.filter(p => p.kind === 'edge' && p.ra !== p.rb);
  assert(sp.length > 1 && sp.every(p => p.segs ? p.segs.every(g => g[0][1] === 0 && g[1][1] === 0) : p.seg[0][1] === 0), 'street portals per piece');
  for (const p of sp) { const pc = clip.info.pieces.get('yard').find(q => q.id === p.a || q.id === p.b).poly, xs = pc.map(q => q[0]);
    for (const g of p.segs || [p.seg]) for (const q of g) assert(q[0] >= Math.min(...xs) - 1e-9 && q[0] <= Math.max(...xs) + 1e-9, `${p.id} clipped to its piece`); }
  assert(Math.abs(sp.reduce((s, p) => s + p.w, 0) - 12) < 1e-6);
  assert.equal(PLAN.entrances(clip, 'street').length, 1, 'piece fragments of one boundary are one entrance');
  assert(!PLAN.pathRooms(PLAN.roomGraph(clip), 'street', 'yard', [...new Set(sp.map(p => p.group))]), 'fragments share one logical opening');
  const loopy = ({ id: 'clip', v: 1, stages: { s: { bounds: [0, -4, 12, 12], combat: true,
    rooms: [{ id: 'yard', zone: 'exterior', rect: [0, 0, 12, 12] }, { id: 'street', zone: 'exterior', rect: [0, -4, 12, 0] }, { id: 'shed', in: 'yard', rect: [4, 4, 8, 8] }],
    doors: [{ id: 'd_shed', rooms: ['shed', 'yard'], at: [6, 8], w: 0.91, kind: 'door_metal' }], spawns: [{ id: 'p', kind: 'player', at: [1, -2] }],
    targets: { loops: [{ id: 'fake', rooms: ['street', 'yard', 'street'] }] } } } });
  bad(loopy, /loop fake/, 'one boundary split into pieces is not a loop');
  bad(tiny(s => { s.rooms[1].id = 'a.1'; s.doors[0].rooms[0] = 'a.1'; s.doors[1].rooms[0] = 'a.1'; return s; }), /reserved/, 'dots reserved for pieces');
  {
    const m = JSON.parse(JSON.stringify(PLANS.motel)), o = m.stages.f2.obj[0];
    o.kind = 'lab'; bad(m, /kind must be target/, 'obj kind');
    o.kind = 'target'; o.room = 'nowhere'; bad(m, /not nowhere/, 'obj room must match at');
  }
  {
    const rooms = [];
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) rooms.push({ id: `c${i}_${j}`, zone: 'exterior', rect: [i * 2, j * 2, i * 2 + 2, j * 2 + 2] });
    bad({ id: 'cap', v: 1, stages: { s: { bounds: [0, 0, 32, 32], combat: true, rooms, spawns: [{ id: 'p', kind: 'player', at: [1, 1] }] } } }, /exceed the 255 cap/, '256 room pieces');
  }
  {
    const m = JSON.parse(JSON.stringify(PLANS.motel));
    m.stages.lot.spawns.find(s => s.id === 'arr_w').at = [10.4, 13.2]; bad(m, /re-trigger/, 'arrival inside a stair zone');
  }
  {
    const m = JSON.parse(JSON.stringify(PLANS.motel));
    m.stages.f2.stairs.forEach(s => { s.to = 'lot'; s.oneWay = true; }); m.stages.lot.stairs = [];
    assert(!PLAN.validate(m).errors.some(e => /return stair/.test(e)), 'oneWay stairs need no pair');
    m.stages.f2.stairs.forEach(s => delete s.oneWay); bad(m, /no return stair/, 'unpaired stair');
  }
  const sps = clip.stage.portals || clip.extras.stagePortals;
  assert(sps.every(p => p.open ? Object.keys(p).length === 4 : p.seg && !('walk' in p) && !('kind' in p)), 'strict v3 stage portals');
  const orient = ok(tiny(s => { s.rooms[1].part = 'stud_steel_gyp2'; s.rooms.push({ id: 'a_c', in: 'a', kind: 'closet', rect: [2.5, 2.5, 4, 4] }); s.doors.push({ id: 'd_c', rooms: ['a', 'a_c'], at: [3.25, 4], w: 0.8, kind: 'door_hollow' }); return s; }), 'orient').outs.s.out;
  assert(orient.stage.walls.filter(w => w.id.includes('a_c')).every(w => w.build === 'stud_steel_gyp2'), 'child partitions take the parent part on every side');

  // plan SVG export and room query used by agents (scripts/world-plan.cjs --plan)
  const wp = require('./world-plan.cjs');
  for (const [id, plan] of Object.entries(PLANS)) for (const sid of Object.keys(plan.stages)) {
    const sp = wp.loadStagePlan(id, sid, { WORLD, PLAN, PLANS, reports }), svg = wp.renderStage(sp, wp.stageSight(sp, sp.out.stage.spawns[0] ? [sp.out.stage.spawns[0].x, sp.out.stage.spawns[0].z] : [0, 0], [sp.st.bounds[2] - 1, sp.st.bounds[3] - 1]));
    assert(svg.startsWith('<svg') && svg.includes('validates clean') && !/NaN|undefined/.test(svg), `${id}/${sid}: svg`);
    assert.equal(wp.stageStats(sp).roomList.length, sp.out.info.rooms.size);
  }
}

module.exports = { checkPlans, loadPlans };
if (require.main === module) { checkPlans(); console.log('plan-check ok'); }
