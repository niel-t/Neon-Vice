const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const { worldData, gridSnapshot, digest } = require('./world-snapshot.cjs');

function checkWorld() {
  require('./materials-check.cjs').checkMaterials();
  const { WORLD, LEVELS } = worldData();
  const fixture = JSON.parse(readFileSync(resolve(__dirname, 'fixtures', 'grid-hashes.json'), 'utf8'));
  assert.equal(WORLD.version, 1);
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
  assert.throws(() => loadPlan(8), /existing campaign index/);
  assert.throws(() => point('1,'), /finite x,z pair/);
  assert.throws(() => point('Infinity,2'), /finite x,z pair/);
  assert.throws(() => sight(plan, [-1, 0], [2, 2]), /plan bounds/);
  console.log('WORLD: dev SVG and query tooling covers all eight legacy plans');
}

module.exports = { checkWorld, worldData };
if (require.main === module) checkWorld();
