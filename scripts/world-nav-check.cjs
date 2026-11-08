const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const { worldData } = require('./world-snapshot.cjs');

function checkNavigation() {
  const { WORLD, LEVELS } = worldData();
  const html = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');
  const section = (a, b) => {
    const start = html.indexOf(a), end = html.indexOf(b, start);
    assert(start >= 0 && end > start, `Production boundary ${a}`);
    return html.slice(start, end);
  };
  const source = [
    readFileSync(resolve(__dirname, '..', 'weapons.js'), 'utf8'),
    'const TAU=Math.PI*2;',
    html.match(/const angDiff=[^\r\n]+/)[0],
    section('function flowStep(', '/* ================= GEOMETRY'),
    section('function moveChar(', '/* ================= FX'),
    section('function bossAI(', 'function spot('),
    section('function visionHalfAngle(', 'function separate('),
    section('function lexAI(', '/* the finisher on Lex'),
    section('function updateCash(', 'function updateFX(')
  ].join('\n');
  function simulation({ weapon = 'bat', boss = false, lex = false, map, start = [6.5, 4.5], target = [13.5, 4.5], radius = .28, item, cash } = {}) {
    const g = WORLD.buildGrid(map || LEVELS[3], 3);
    g.flow = new Int16Array(g.W*g.H); g.nflow = new Int16Array(g.W*g.H);
    g.doors = g.doorSpecs.map(d => ({ ...d, th: 0, w: 0, pusher: '' }));
    g.player = { x: target[0], z: target[1], r: .28, vx: 0, vz: 0, a: 0, alive: true, weapon: null };
    const e = { x: start[0], z: start[1], r: radius, vx: 0, vz: 0, a: 0, alive: true, down: 0, cd: 0, atkT: 0, alertT: 0, qT: 0, hitT: 0,
      weapon: weapon && { type: weapon, ammo: 99 }, state: 'chase', seeT: 0, react: 0, wind: 0, pers: 'rush',
      id: 0, spd: 1, hp: 10, maxhp: 10, boss, lex, walk: 0, lastStep: 0 };
    g.enemies = [e]; g.items = item ? [item] : []; g.cash = cash ? [cash] : []; g.parts = [];
    let attacks = 0, maxZ = e.z;
    const context = vm.createContext({
      G: g, WORLD, SET: { diff: 'easy' }, Dd: () => ({ vision: 9, cone: .85, react: 1, ecd: 1 }), pk: () => 0,
      lerp: (a,b,t) => a+(b-a)*t,
      clamp: (v,a,b) => v<a?a:v>b?b:v,
      los: (...args) => WORLD.cell.los(g,...args), bfs: (...args) => WORLD.cell.bfs(g,...args),
      collideGrid: c => WORLD.cell.collideGrid(g,c), collideDoors: (c,p) => WORLD.cell.collideDoors(g,c,p),
      footstep: () => {}, slideBody: () => {}, spot: () => {}, sfx: () => {}, popup: () => {}, shake: () => {},
      hurtPlayer: () => attacks++, fireGun: () => attacks++, throwNade: () => attacks++, rnd: (a,b) => (a+b)/2,
      pick: values => values[0]
    });
    vm.runInContext(`${source}\nMath.random=()=>0.5;`, context, { timeout: 1000 });
    const step = new vm.Script('updateEnemy(G.enemies[0],1/60);');
    const cashStep = new vm.Script('updateCash(1/60);');
    for (let frame=0;frame<1200;frame++) {
      g.T = frame/60;
      if (frame%12===0) WORLD.cell.bfs(g,g.flow,Math.floor(g.player.x),Math.floor(g.player.z));
      if (cash) { e.state = 'idle'; cashStep.runInContext(context, { timeout: 1000 }); break; }
      step.runInContext(context, { timeout: 1000 });
      maxZ = Math.max(maxZ, e.z);
      assert(Number.isFinite(e.x) && Number.isFinite(e.z));
    }
    return { g, e, attacks, maxZ };
  }
  const marina = WORLD.buildGrid(LEVELS[3], 3);
  assert.equal(WORLD.cell.moveClear(marina,6.5,4.5,13.5,4.5,.26),false);
  const bat = simulation();
  assert(bat.attacks > 0 && bat.e.x > 12, `Visible melee target across Marina water must be reached via the pier: ${JSON.stringify({x:bat.e.x,z:bat.e.z,attacks:bat.attacks,state:bat.e.state})}`);
  assert(simulation({ weapon: null }).attacks > 0, 'Unarmed chase also routes around water');
  const boss = simulation({ weapon: 'm16', boss: true });
  assert(boss.e.x > 8 && boss.attacks > 0, 'Boss retains attacks while routing its approach');
  const lex = simulation({ weapon: 'm16', boss: true, lex: true });
  assert(lex.maxZ > 5 && lex.attacks > 0, `Lex retains ranged attacks and can detour during an approach: ${JSON.stringify({x:lex.e.x,z:lex.e.z,maxZ:lex.maxZ,attacks:lex.attacks})}`);
  const room = { map: ['##########', '#........#', '#........#', '#........#', '##########'], wall: 1 };
  const roomGrid = WORLD.buildGrid(room, 0);
  assert(WORLD.cell.moveClear(roomGrid,2.36,2.5,2.36,3.5,.36), 'Exact wall contact is not an overlap');
  assert(!WORLD.cell.moveClear(roomGrid,2.2,2.5,2.2,3.5,.3), 'A radius-overlapping corridor is blocked');
  roomGrid.solid[3*roomGrid.W+4]=1;
  assert(!WORLD.cell.moveClear(roomGrid,3,4,5,2,0), 'A segment through a blocked cell corner is not clear');
  const fat = simulation({ map: room, start: [4, 2.5], target: [2.28, 2.5], radius: .36 });
  assert(fat.attacks > 0 && Math.abs(fat.e.z-2.5)<.01, 'Wall-adjacent targets keep direct melee movement');
  const item = { x: 2.1, z: 2.5, type: 'bat', flying: false };
  assert(simulation({ map: room, start: [4, 2.5], target: [9, 3.5], weapon: null, item }).e.weapon, 'Wall-adjacent weapons remain collectible');
  const cash = { x: 2.1, z: 2.5, sx: 2.1, sz: 2.5, tx: 2.1, tz: 2.5, t: .4, life: 20, landed: false };
  assert.equal(simulation({ map: room, start: [4, 2.5], target: [9, 3.5], cash }).e.state, 'distract', 'Wall-adjacent cash still attracts guards');
  console.log(`WORLD: production Marina navigation restored (${bat.attacks} melee attacks), bosses and wall-adjacent interactions checked`);
}

module.exports = { checkNavigation };
if (require.main === module) checkNavigation();
