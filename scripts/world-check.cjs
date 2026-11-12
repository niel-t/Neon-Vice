const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const { worldData, gridSnapshot, digest } = require('./world-snapshot.cjs');

function checkWorld() {
  require('./materials-check.cjs').checkMaterials();
  require('./compile-check.cjs').checkCompile();
  require('./nav-check.cjs').checkNav();
  require('./stages-check.cjs').checkStages();
  require('./damage-check.cjs').checkDamage();
  const { WORLD, LEVELS } = worldData();
  const fixture = JSON.parse(readFileSync(resolve(__dirname, 'fixtures', 'grid-hashes.json'), 'utf8'));
  assert.equal(WORLD.version, 3);
  assert.equal(fixture.cases.filter(c => c.key.startsWith('level:')).length, LEVELS.length);
  for (const entry of fixture.cases) {
    const def = entry.key.startsWith('level:') ? LEVELS[entry.idx] : {
      ...entry.input, floorFn: entry.input.floorFn && vm.runInNewContext(`(${entry.input.floorFn})`, {}, { timeout: 1000 })
    };
    assert.equal(digest(gridSnapshot(WORLD.buildGrid(def, entry.idx, { paletteSize: entry.input.paletteSize }))),
      entry.gridHash, `${entry.key}: legacy grid parity`);
  }
  assert.throws(() => WORLD.buildGrid(LEVELS[0]), /integer level seed/);
  assert.throws(() => WORLD.hsh(1, 2, 3), /integer level seed/);
  const a = WORLD.buildGrid(LEVELS[0], 0), b = WORLD.buildGrid(LEVELS[0], 0);
  a.solid.fill(0);
  assert(b.solid.some(Boolean), 'Each build must own fresh mutable arrays');
  for (let idx=0;idx<8;idx++)for(let x=-3;x<5;x++)for(let z=-2;z<4;z++){
    let h=(x*374761393+z*668265263+9*2246822519+idx*326648991)|0;
    h=Math.imul(h^(h>>>13),1274126177);
    assert.equal(WORLD.hsh(x,z,9,idx),((h^(h>>>16))>>>0)/4294967296);
  }
  console.log(`WORLD: ${fixture.cases.length} browser-captured grid hashes preserved`);
  checkSight(WORLD, LEVELS);
  require('./world-nav-check.cjs').checkNavigation();
  checkPlan();
  checkFog(WORLD, LEVELS);
}

function checkSight(WORLD, LEVELS) {
  const { cell } = WORLD;
  const close = (actual, expected) => assert(Math.abs(actual-expected)<1e-9, `${actual} != ${expected}`);
  const g = WORLD.buildGrid({ map: Array(6).fill('......'), wall: 1 }, 0);
  const door = { hx: 3, hz: 3, base: 0, th: 0, w: 0, pusher: '' };
  g.doors = [door];
  const hit = cell.doorHit(g, 3.5, 2, 3.5, 4);
  close(hit.d, 0.965);
  close(hit.nx, 0); close(hit.nz, -1);
  assert.equal(cell.los(g, 3.5, 2, 3.5, 4), false);
  close(cell.rayLen(g, 3.5, 2, 0, 1, 2), hit.d);
  close(cell.rayWall(g, 3.5, 2, 0, 1, 2, true).d, hit.d);
  assert.equal(cell.rayWall(g, 3.5, 2, 0, 1, 2, false).door, door);
  // A fast substep may cross the whole thin leaf without landing inside it.
  assert(cell.doorHit(g, 3.5, 2.92, 3.5, 3.12));
  assert.equal(cell.doorHit(g, 3.5, 2, 3.5, 2.9), null);
  assert.equal(cell.doorHit(g, 3.5, 3, 3.5, 3), null);
  assert.equal(cell.doorHit(g, 3.5, 3, 3.7, 3).d, 0);
  assert(cell.doorHit(g, 2, 3.035, 4, 3.035), 'Collinear slab boundary is included');
  door.th = Math.PI/4;
  const u = Math.SQRT1_2, x = 3+u*0.5, z = 3+u*0.5;
  const partial = cell.doorHit(g, x+u, z-u, x-u, z+u);
  close(partial.d, 0.965);
  assert.equal(cell.los(g, x+u, z-u, x-u, z+u), false);
  door.th = Math.PI/2;
  assert.equal(cell.los(g, 3.5, 2, 3.5, 4), true, 'Open doorway is clear away from swung leaf');
  assert(cell.doorHit(g, 2, 3.5, 4, 3.5), 'Fully open leaf still occludes rays across it');
  // Synthetic double doors have opposed hinges, not the legacy adjacent-D glyph rule.
  g.doors = [door, { hx: 5, hz: 3, base: Math.PI, th: 0, w: 0, pusher: '' }];
  door.th = 0;
  assert.equal(cell.los(g, 3.4, 2, 3.4, 4), false);
  assert.equal(cell.los(g, 4.6, 2, 4.6, 4), false);
  g.doors.push({ hx: 3, hz: 2.5, base: 0, th: 0, w: 0, pusher: '' });
  close(cell.doorHit(g, 3.5, 2, 3.5, 4).d, 0.465);
  g.doors = [];
  const i = 3*g.W+3;
  g.solid[i]=1; g.wh[i]=0.12;
  assert.equal(cell.isBlock(g, 3, 3), true);
  assert.equal(cell.isCover(g, 3, 3), true, 'Legacy occupancy stays unchanged');
  assert.equal(cell.rayBlock(g, 3, 3, true), false);
  assert.equal(cell.los(g, 2.5, 3.5, 4.5, 3.5), true);
  close(cell.rayLen(g, 2.5, 3.5, 1, 0, 2), 2);
  assert.equal(cell.rayWall(g, 2.5, 3.5, 1, 0, 2, true), null);
  g.wh[i]=0.6;
  assert.equal(cell.los(g, 2.5, 3.5, 4.5, 3.5), false);
  g.wh[i]=0;
  assert.equal(cell.rayBlock(g, 3, 3, false), true, 'Default-height legacy walls still stop rays');
  g.wh[i]=0.12; g.furn[i]=7;
  assert.equal(cell.rayBlock(g, 3, 3, true), true, 'Tall cover still stops shots');
  assert.equal(cell.rayBlock(g, -1, 3, false), true);
  const marina = WORLD.buildGrid(LEVELS[3], 3);
  marina.doors = marina.doorSpecs.map(d => ({ ...d, th: 0 }));
  assert.equal(cell.isBlock(marina, 9, 4), true);
  assert.equal(cell.rayBlock(marina, 9, 4, true), false);
  assert.equal(cell.los(marina, 6.5, 4.5, 13.5, 4.5), true, 'Marina water no longer hides the adjacent pier');
  console.log('WORLD: closed/swung/double doors and movement-only low walls checked');
  checkBullets(WORLD);
}

function checkBullets(WORLD) {
  const html = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');
  const start = html.indexOf('function updateBullets(dt)'), end = html.indexOf('function updateItems(dt)', start);
  assert(start >= 0 && end > start, 'Production bullet loop boundary');
  const source = html.slice(start, end);
  const run = (th, lowWall = false) => {
    const g = WORLD.buildGrid({ map: Array(6).fill('......'), wall: 1 }, 0);
    g.doors = lowWall ? [] : [{ hx: 3, hz: 3, base: 0, th, w: 0, pusher: '' }];
    if (lowWall) { g.solid[3*g.W+3]=1; g.wh[3*g.W+3]=0.12; }
    g.enemies = [{ x: 3.5, z: 3.7, r: 0.3, alive: true }];
    g.player = { alive: true };
    g.bullets = [{ x: 3.5, z: 2, dx: 0, dz: 1, sp: 20, life: 1, own: 'p', hit: [], pierce: 1, type: 'pistol' }];
    const effects = [], damage = [];
    vm.runInNewContext(`${source}\nupdateBullets(0.1);`, {
      G: g, WORLD, sparks: (...args) => effects.push(args), sfx: () => {},
      hitEnemy: e => damage.push(e), shootCorpse: () => {}, addWallDecal: () => {}, rnd: () => 0
    }, { timeout: 1000 });
    return { g, effects, damage };
  };
  const closed = run(0);
  assert.equal(closed.damage.length, 0, 'Production bullet loop stops before the enemy behind a closed door');
  assert.equal(closed.g.bullets.length, 0);
  assert.equal(closed.effects.length, 1);
  assert(closed.effects[0].slice(0, 3).every(Number.isFinite));
  assert.equal(run(Math.PI/2).damage.length, 1, 'Production bullet loop clears the opened doorway');
  assert.equal(run(0, true).damage.length, 1, 'Production bullet loop clears a low water/kerb cell');
}

function checkPlan() {
  const { loadPlan, stats, sight, renderPlan, point } = require('./world-plan.cjs');
  for (let idx=0;idx<8;idx++) {
    const plan = loadPlan(idx), summary = stats(plan), svg = renderPlan(plan);
    assert.equal(summary.spawns.player, 1);
    assert.equal(summary.spawns.exit, 1);
    assert(summary.walkableCells > 0 && summary.walkableCells <= summary.floorCells);
    assert(svg.startsWith('<svg ') && svg.endsWith('</svg>\n'));
    assert(!svg.includes('NaN') && !svg.includes('undefined'));
    assert(svg.includes('not researched materials'));
  }
  const plan = loadPlan(3), ray = sight(plan, [6.5, 4.5], [13.5, 4.5]);
  assert.equal(ray.visible, true);
  assert(renderPlan(plan, ray).includes('clear sightline'));
  const d = plan.grid.doors[0], e = plan.WORLD.geometry.doorEnd(d), x = (d.hx+e[0])/2, z = (d.hz+e[1])/2;
  const ux = Math.cos(d.base), uz = Math.sin(d.base);
  const blocked = sight(plan, [x+uz*.2,z-ux*.2], [x-uz*.2,z+ux*.2]);
  assert.equal(blocked.visible, false);
  assert.equal(blocked.firstHit.kind, 'door');
  const wall = sight(loadPlan(0), [1.5,1.5], [2.5,1.5]);
  assert.equal(wall.visible, false);
  assert.equal(wall.firstHit.kind, 'wall');
  assert.throws(() => loadPlan(10), /existing campaign index/);
  assert.throws(() => point('1,'), /finite x,z pair/);
  assert.throws(() => point('Infinity,2'), /finite x,z pair/);
  assert.throws(() => sight(plan, [-1, 0], [2, 2]), /plan bounds/);
  console.log('WORLD: dev SVG and query tooling covers all eight legacy plans');
}

/* W12a fog: production FOG module and fogSee from index.html, on compiled v2 stages and the legacy adapter. */
function checkFog(WORLD, LEVELS) {
  const html = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');
  const start = html.indexOf('/* FOG_BEGIN */'), end = html.indexOf('function fogMode(', start);
  assert(start >= 0 && end > start, 'FOG production boundary');
  const ctx = vm.createContext({ WORLD, G: null, Math, Map, Uint8Array, Int16Array, Int32Array, Float32Array, Float64Array, Object });
  vm.runInContext(html.slice(start, end) + '\nthis.FOG=FOG;this.fogSee=fogSee;', ctx, { timeout: 1000 });
  const { FOG, fogSee } = ctx;
  // Q-A difficulty mapping plus the SET.fog toggle; non-combat stages never fog.
  for (const [diff, set, combat, want] of [['off','auto',true,'off'],['keep','auto',true,'keep'],['grey','auto',true,'grey'],
    ['off','on',true,'keep'],['grey','on',true,'grey'],['keep','off',true,'off'],['grey','auto',false,'off'],['keep','bogus',true,'keep'],[undefined,'auto',true,'off']])
    assert.equal(FOG.mode(diff, set, combat), want, `FOG.mode(${diff},${set},${combat})`);
  const square = (x0,z0,x1,z1) => [[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
  const DOOR = { kind: 'door', build: 'door_solid', cov: 'full' }, ARCH = { kind: 'arch' };
  const stage =  (open, extra = {}) => ({
    id: 'fog-test', bounds: [0,0,12,8], combat: true, ground: [{ id: 'floor', poly: square(0,0,12,8), y: 0, surf: 'tile' }],
    walls: open === null ? [] : [{ id: 'wall', path: [[6,0],[6,8]], build: 'cbs_ext', cov: 'full', h: 2.8,
      open: [{ id: 'entry', s0: 1.55, s1: 2.45, y0: 0, y1: 2.2, ...open }] }],
    props: [], rooms: [{ id: 'left', poly: square(0,0,6,8) }, { id: 'right', poly: square(6,0,12,8) }],
    portals: [{ id: 'link', a: 'left', b: 'right', open: 'entry' }], ...extra
  });
  const run = (st, mode, eye = [3,6]) => {
    const f = FOG.create(WORLD, st, mode), see = (ax,az,bx,bz) => WORLD.sight(st,ax,az,bx,bz).clear;
    return { f, see, tick: (dt = FOG.TICK) => FOG.tick(f, dt, eye[0], eye[1], see) };
  };
  const door = WORLD.compile(stage(DOOR)), d = run(door, 'keep', [3,2]);
  d.tick(0);
  assert.equal(FOG.level(d.f, 0), 2, 'Eye room is live');
  assert.equal(FOG.level(d.f, 1), 0, 'Closed door hides the room behind it');
  assert(FOG.hidden(d.f, 10, 7) && !FOG.hidden(d.f, 1, 1), 'Dynamic objects hide only in the unseen room');
  assert(d.f.rays > 0 && d.f.rays <= FOG.RAYS_ROOM + 3, `Ray cap per candidate room (${d.f.rays})`);
  door.doors[0].th = Math.PI/2; d.tick(0.05);
  assert.equal(FOG.level(d.f, 1), 0, 'Reveal runs at 10Hz');
  assert(d.tick(0.05), 'Opened door: visible portal reveals');
  assert(!FOG.hidden(d.f, 11.9, 7.9) && !FOG.hidden(d.f, 11.9, 0.1), 'Room reveals whole, not fractionally');
  door.doors[0].th = 0; for (let i=0;i<10;i++) d.tick();
  assert.equal(FOG.level(d.f, 1), 2, 'Normal (keep): seen rooms stay live');
  const hard = run(door, 'grey', [3,2]);
  door.doors[0].th = Math.PI/2; hard.tick(0); assert.equal(FOG.level(hard.f, 1), 2);
  door.doors[0].th = 0; hard.tick(); hard.tick();
  assert.equal(FOG.level(hard.f, 1), 2, 'Hard holds briefly before greying (no flicker)');
  for (let i=0;i<4;i++) hard.tick();
  assert.equal(FOG.level(hard.f, 1), 1, 'Hard: room out of sight turns grey');
  assert(FOG.hidden(hard.f, 10, 7), 'Hard: grey room hides dynamics');
  FOG.setMode(hard.f, 'keep'); assert.equal(FOG.level(hard.f, 1), 2, 'Switching to keep restores grey rooms');
  const glass = run(WORLD.compile(stage({ ...DOOR, kind: 'window', y0: 1, build: 'glass_tempered_6', cov: 'glass' })), 'keep'); glass.tick(0);
  assert.equal(FOG.level(glass.f, 1), 2, 'Glass reveals');
  const block = run(WORLD.compile(stage({ ...DOOR, kind: 'window', y0: 1, build: 'glass_block', cov: 'full' })), 'keep'); block.tick(0);
  assert.equal(FOG.level(block.f, 1), 0, 'Opaque glass block hides');
  const arch = run(WORLD.compile(stage(ARCH)), 'keep'); arch.tick(0);
  assert.equal(FOG.level(arch.f, 1), 2, 'Arch reveals');
  const hole = run(WORLD.compile(stage(null, { portals: [{ id: 'hole', a: 'left', b: 'right', seg: [[6,1],[6,3]] }] })), 'keep'); hole.tick(0);
  assert.equal(FOG.level(hole.f, 1), 2, 'Hole reveals');
  // Two entrances, only the later one in view: a failed first entrance must not end the room's test.
  const two = WORLD.compile(stage(DOOR, { walls: [{ id: 'wall', path: [[6,0],[6,8]], build: 'cbs_ext', cov: 'full', h: 2.8,
    open: [{ id: 'entry', s0: 1.55, s1: 2.45, y0: 0, y1: 2.2, ...DOOR }, { id: 'arch', s0: 5.55, s1: 6.45, y0: 0, y1: 2.2, ...ARCH }] }],
    portals: [{ id: 'link', a: 'left', b: 'right', open: 'entry' }, { id: 'link2', a: 'left', b: 'right', open: 'arch' }] }));
  const tw = run(two, 'keep', [3,6]); tw.tick(0);
  assert.equal(FOG.level(tw.f, 1), 2, 'Every entrance is tried: a closed first door does not hide the open second');
  // Sight with no portal in the graph (low barrier, legacy glass): the sight-only pass reveals.
  const open = run(WORLD.compile(stage(null, { portals: [] })), 'keep'); open.tick(0);
  assert.equal(FOG.level(open.f, 1), 2, 'Sight-only link reveals');
  // A guard with a firing line is never hidden, even if no static target is in view.
  const narrow = run(door, 'keep', [3,2]); door.doors[0].th = Math.PI/2;
  const leg2 = FOG.create(WORLD, door, 'keep'); leg2.tx.fill(-1000);
  FOG.tick(leg2, 0, 3, 2, narrow.see, new Float64Array([11, 2]), 1);
  assert(!FOG.hidden(leg2, 11, 2), 'Dynamic point with clear sight reveals its room');
  door.doors[0].th = 0;
  // Breach after fog creation: the replaced graph is picked up, seen state is kept.
  const wallSt = (portals = []) => WORLD.compile({ ...stage(null, { portals }), walls: [{ id: 'div', path: [[6,0],[6,8]], build: 'particle_divider', cov: 'full', h: 2.8 }] });
  const br = wallSt(), bf = run(br, 'keep'); bf.tick(0);
  assert.equal(FOG.level(bf.f, 1), 0, 'Divider hides');
  for (let y = .25; y < 2.8; y += .5) for (const h of WORLD.trace(br,3,4,9,4,y).filter(o => o.panel !== null)) WORLD.damage(br,h.panel,h.cell,br.cells[h.cell].hp,'bullet');
  assert(WORLD.sight(br,3,4,9,4).clear && br.portals.length > 0, 'Breach opens sight');
  for (let i = 0; i < 3; i++) bf.tick();
  assert.equal(FOG.level(bf.f, 1), 2, 'Breach after fog creation reveals');
  const far = run(WORLD.compile(stage(ARCH)), 'keep', [3,7.9]); far.tick(0);
  assert.equal(FOG.level(far.f, 1), 2, 'Oblique view through an opening still reveals');
  // Pieces of one parent room reveal together; a third room behind a closed door stays dark.
  const split = WORLD.compile(stage(ARCH, {
    rooms: [{ id: 'left', poly: square(0,0,6,8) }, { id: 'r1', parent: 'R', poly: square(6,0,12,4) }, { id: 'r2', parent: 'R', poly: square(6,4,12,8) }],
    portals: [{ id: 'link', a: 'left', b: 'r1', open: 'entry' }] }));
  const sp = run(split, 'keep', [3,1]); sp.tick(0);
  assert(!FOG.hidden(sp.f, 11, 7), 'Parent group reveals whole');
  const calm = WORLD.compile({ ...stage(DOOR), combat: false }), cm = run(calm, 'keep'); cm.tick(0);
  assert.equal(FOG.level(cm.f, 1), 2, 'Non-combat rooms are never fogged');
  const pin = WORLD.compile(stage(DOOR, { rooms: [{ id: 'left', poly: square(0,0,6,8) }, { id: 'right', poly: square(6,0,12,8), kind: 'entry' }] }));
  assert.equal(FOG.level(run(pin, 'grey').f, 1), 2, 'Entry rooms start revealed');
  assert.equal(FOG.hidden(null, 1, 1), false); assert.equal(FOG.hidden(FOG.create(WORLD, door, 'off'), 10, 7), false, 'Fog off hides nothing');
  // Legacy adapter: two rooms joined by one door; fogSee is the in-game sight (cells, live leaves, glass transparent).
  const g = WORLD.buildGrid({ map: ['###########', '#....#....#', '#....#....#', '#....#....#', '#....D....#', '###########'], wall: 1 }, 0);
  g.doors = g.doorSpecs.map(q => ({ ...q, th: 0, w: 0, pusher: '' })); ctx.G = g;
  const lst = WORLD.fromCells(g), cellOf = (x,z) => lst.roomTiles[Math.floor(z)*g.W+Math.floor(x)];
  const lx = g.doors[0].hx-3, lz = g.doors[0].hz+.49;
  const R = [...Array(g.W*g.H).keys()].reverse().find(i => lst.roomTiles[i] >= 0 && lst.roomTiles[i] !== cellOf(lx,lz)), rx = R%g.W+.5, rz = Math.floor(R/g.W)+.5;
  const lf = FOG.create(WORLD, lst, 'keep'); FOG.tick(lf, 0, lx, lz, fogSee);
  assert.equal(FOG.level(lf, cellOf(rx,rz)), 0, 'Legacy: closed door hides');
  g.doors[0].th = Math.PI/2; FOG.tick(lf, FOG.TICK, lx, lz, fogSee);
  assert.equal(FOG.level(lf, cellOf(rx,rz)), 2, 'Legacy: opened door reveals');
  const sx = g.doors[0].hx+Math.cos(g.doors[0].base)*.49, sz = g.doors[0].hz+Math.sin(g.doors[0].base)*.49;
  assert.equal(FOG.hidden(lf, sx, sz), false, 'Doorway square follows its live neighbours');
  const wallI = g.solid.findIndex((v,i) => v && i%g.W > 0 && i%g.W < g.W-1 && !g.solid[i-1] && !g.solid[i+1]), wx = wallI%g.W, wz = Math.floor(wallI/g.W);
  assert.equal(fogSee(wx-.5, wz+.5, wx+1.5, wz+.5), false, 'Legacy wall blocks fog sight');
  g.glassSet = new Set([wallI]); assert.equal(fogSee(wx-.5, wz+.5, wx+1.5, wz+.5), true, 'Legacy studio glass reveals');
  ctx.G = null;
  // Every production level: street rooms start live, rays stay inside the frame budget, every room is reachable by a target.
  LEVELS.forEach((def, li) => {
    const q = WORLD.buildGrid(def, li); q.doors = q.doorSpecs.map(o => ({ ...o, th: 0, w: 0, pusher: '' })); ctx.G = q;
    const st = WORLD.fromCells(q), f = FOG.create(WORLD, st, 'grey');
    st.rooms.forEach(r => { if (r.zone === 'exterior') assert.equal(FOG.level(f, r.idx), 2, `${def.name}: street starts live`);
      assert(f.off[r.idx+1] > f.off[r.idx], `${def.name}: room ${r.id} has fog targets`); });
    let worst = 0;
    for (let i = 0; i < st.roomTiles.length; i += 7) if (st.roomTiles[i] >= 0) {
      FOG.tick(f, FOG.TICK, i%q.W+.5, Math.floor(i/q.W)+.5, fogSee); worst = Math.max(worst, f.rays);
      assert(!f.unk.some(Boolean), `${def.name}: no room starved of rays`);
      assert.equal(FOG.level(f, st.roomTiles[i]), 2, `${def.name}: eye room is live`);
    }
    assert(worst <= FOG.RAYS_TICK, `${def.name}: ${worst} rays per tick`);
  });
  ctx.G = null;
  console.log('FOG: Q-A mapping, door/glass/arch/hole reveal, keep vs grey, groups, legacy adapter on all eight levels');
}

module.exports = { checkWorld, checkFog, worldData };
if (require.main === module) checkWorld();
