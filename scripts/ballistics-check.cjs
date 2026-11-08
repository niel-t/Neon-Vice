const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

// W5: the W3 research tables are the fixture (BALLISTICS.md §4, MATERIALS.md §5); the engine is weapons.js BAL.
const read = f => readFileSync(resolve(__dirname, '..', f), 'utf8');
function load() {
  const src = ['levels.js', 'world.js', 'weapons.js'].map(read).join('\n;\n');
  return vm.runInNewContext(`${src}\n({WORLD,BAL,CAL,WD,ARMOUR,ARMLV,LEGACY_BUILD})`, {}, { timeout: 1000 });
}
// research calibre -> projectile; game calibres come from CAL so the test guards the shipped numbers
function projectiles({ BAL }) {
  const P = (e0, hard, metal, rifle = false) => ({ e0, hard, metal, rifle, dmg: 1 });
  return {
    '9mm': BAL.proj('9mm'), '9mm_smg': BAL.proj('9mm', 1.22), '.45': P(548, 1, 1.25), '.357': BAL.proj('357'),
    '.50ae': BAL.proj('50ae'), '5.56': BAL.proj('556'), '7.62x39': BAL.proj('762'), '12ga_00': BAL.proj('12ga'),
    '12ga_slug': P(3413, 0.5, 2), '.50bmg': P(16900, 1, 4, true)
  };
}
function mdTable(md, header) {
  const lines = md.split('\n'), i = lines.findIndex(l => l.startsWith(header));
  assert(i >= 0, `table ${header} missing`);
  const cols = lines[i].split('|').slice(2, -1).map(s => s.trim()), rows = [];
  for (let j = i + 2; j < lines.length && lines[j].startsWith('|'); j++) {
    const c = lines[j].split('|').slice(1, -1).map(s => s.trim());
    rows.push({ name: c[0].replace(/`/g, ''), cells: Object.fromEntries(cols.map((k, n) => [k, c[n + 1]])) });
  }
  return rows;
}
function near(got, want, where) {
  const m = /^(\d+)%$/.exec(want), s = /^stop(?:@(\d+))?$/.exec(want);
  if (s) return assert(got.stop !== undefined && (!s[1] || got.stop === +s[1]), `${where}: want ${want}, got ${JSON.stringify(got)}`);
  assert(m, `${where}: bad cell ${want}`);
  assert(got.e !== undefined, `${where}: want ${want} pass, got stop`);
  assert(Math.abs(100 * got.ret - +m[1]) <= 3, `${where}: want ${want}, got ${(100 * got.ret).toFixed(1)}%`);
}

function checkBallistics() {
  const d = load(), { BAL, WORLD } = d, mats = WORLD.materials, P = projectiles(d);
  const md = read('docs/research/BALLISTICS.md');
  const run = (p, builds) => { const r = BAL.chain(mats, p, builds); return r.stop ? r : { e: r.e, ret: r.e / p.e0 }; };
  let n = 0;
  for (const row of mdTable(md, '| construction | 9mm |')) for (const [cal, want] of Object.entries(row.cells)) {
    const [b, alt] = row.name.split('@');
    near(run(P[cal], [alt ? b + '@alt' : b]), want.replace(/^stop$/, 'stop@1'), `${row.name} ${cal}`); n++;
  }
  const chains = { '2× stud_wood_gyp': Array(2).fill('stud_wood_gyp'), '4× stud_wood_gyp': Array(4).fill('stud_wood_gyp'),
    '5× stud_wood_gyp': Array(5).fill('stud_wood_gyp'), 'door_hollow + stud_wood_gyp': ['door_hollow', 'stud_wood_gyp'],
    'car_door ×2 (through a car)': ['car_door', 'car_door'],
    'brick_cmu_ext + ply + brick_cmu_ext': ['brick_cmu_ext', 'particle_divider', 'brick_cmu_ext'] };
  for (const row of mdTable(md, '| chain | 9mm |')) for (const [cal, want] of Object.entries(row.cells)) {
    assert(chains[row.name], `unknown chain ${row.name}`); near(run(P[cal], chains[row.name]), want, `${row.name} ${cal}`); n++;
  }
  assert(n > 450, `matrix too small (${n})`);
  // MATERIALS.md §5 rounds to remove one 0.5 m cell (12ga column is per shell of 9 pellets)
  const rpc = mdTable(read('docs/research/MATERIALS.md'), '| Construction | 9mm / Uzi');
  const colCal = { '9mm / Uzi / .45 / .357': ['9mm', '9mm_smg', '.45', '.357'], '.50 AE': ['.50ae'], '12ga 00 (shells)': ['12ga_00'],
    slug: ['12ga_slug'], '5.56': ['5.56'], '7.62×39': ['7.62x39'], '.50 BMG': ['.50bmg'] };
  for (const row of rpc) for (const b of [row.name.split(' / ')[0]]) for (const [col, want] of Object.entries(row.cells)) for (const cal of colCal[col]) {
    const got = BAL.roundsPerCell(mats, P[cal], b, cal === '12ga_00' ? 9 : 1), w = want.replace(/\*|G/g, '').trim();
    assert.equal(got === Infinity ? 'never' : String(got), w, `rounds_per_cell ${b} ${cal}`);
  }
  // armour (§5): soft vest stops handguns/buck, blunt on .50 AE, rifles pass; plates stop 5.56, half M43 at muzzle
  assert.equal(BAL.absorb('II', P['9mm'], 490), 1);
  assert.equal(BAL.absorb('II', P['12ga_00'], 287), 1);
  assert.equal(BAL.absorb('II', P['.50ae'], 1965), 0.5);
  assert.equal(BAL.absorb('II', P['5.56'], 1750), 0.1);
  assert.equal(BAL.absorb('IIIA', P['.50ae'], 1965), 1);
  assert.equal(BAL.absorb('III', P['5.56'], 1750), 1);
  assert.equal(BAL.absorb('III', P['7.62x39'], 2030), 0.5);
  assert.equal(BAL.absorb('III', P['.50bmg'], 16900), 0.1);
  for (const a of Object.values(d.ARMOUR)) assert(d.ARMLV[a.lv], `${a.name} armour level`);
  // float HP: a clean hit is exactly 1, so one-hit kills stay one-hit
  assert.equal(BAL.damage(P['9mm'], 490), 1);
  assert(BAL.dead(1, BAL.damage(P['9mm'], 490)) && !BAL.dead(2, 1) && BAL.dead(2, 1.95));
  // kill/no-kill vs a 1-hp thug (checkpoint: assert gameplay outcomes, not just matrix energies)
  const after = (cal, builds) => BAL.chain(mats, P[cal], builds).e || 0, kills = (cal, e) => BAL.dead(1, BAL.damage(P[cal], e));
  assert(kills('9mm', after('9mm', ['stud_steel_gyp2'])), '9mm through steel-stud partition kills');
  assert(kills('9mm', after('9mm', ['door_solid'])), '9mm through a solid door kills');
  assert(!kills('12ga_00', after('12ga_00', ['stud_steel_gyp'])), 'a lone buck pellet through drywall only wounds');
  assert(kills('.357', P['.357'].e0 - BAL.BODY_J) && kills('5.56', P['5.56'].e0 - 2 * BAL.BODY_J), '.357 / rifles still pierce');
  assert(!kills('9mm', 150), 'a spent round wounds');
  // legacy map only names known builds
  const L = d.LEGACY_BUILD, all = [L.void, ...Object.values(L.prop)];
  for (const m of [L.def, ...Object.values(L.levels)]) all.push(m.int, m.ext, m.door, m.pane);
  for (const v of all) assert(mats.BUILD[v], `legacy map: unknown build ${v}`);
  const names = vm.runInNewContext(`${read('levels.js')}\nLEVELS.map(l=>l.name)`, {}, { timeout: 1000 });
  for (const k of Object.keys(L.levels)) assert(names.includes(k), `legacy map: no level named ${k}`);
  checkBulletPath();
}

// W5b production bullet path (index.html slice) on a tiny legacy grid: wall typology, body loss, low cover, glass
function checkBulletPath() {
  const html = read('index.html'), a = html.indexOf('/* ===== W5b bullets'), b = html.indexOf('/* legacy grid stepping', a);
  assert(a >= 0 && b > a, 'W5b bullet block boundary');
  const src = ['levels.js', 'world.js', 'weapons.js'].map(read).join('\n;\n') + '\n;\n' + html.slice(a, b);
  const run = ({ name = 'VICE MARINA', wall = true, enemies = [[2.5, 0.5]], furn = 0, crouch = false, glass = false, type = 'pistol' }) => {
    const hits = [], glassHits = [], ctx = { hits, glassHits, TALL_FURN: { 8: 1, 9: 1, 10: 1, 12: 1, 13: 1, 17: 1 } };
    vm.createContext(ctx);
    vm.runInContext(`${src}
      const g=WORLD.buildGrid({name:${JSON.stringify(name)},map:Array(5).fill('...........'),wall:1},0);
      const w=g.rows.findIndex(r=>r.includes('.'))+2,x0=g.rows[w].indexOf('.')+5,i=w*g.W+x0;
      if(${wall})g.solid[i]=1;if(${furn}){g.furn[i-3]=${furn};}if(${glass}){g.solid[i]=1;g.glassSet=new Set([i]);}
      g.doors=[];g.player={alive:true};g.parts=[];g.enemies=${JSON.stringify(enemies)}.map(([dx,dz])=>({x:x0+dx,z:w+dz,r:0.3,alive:true}));
      var G=g,hsh=(x,z,k)=>WORLD.hsh(x,z,k,0),rnd=(a,b)=>(a+b)/2,sparks=()=>{},sfx=()=>{},addWallDecal=()=>{},shootCorpse=()=>{},
       hurtPlayer=()=>{},hitEnemy=(e,t,d,dmg)=>hits.push(dmg),hitGlass=(x,z)=>{glassHits.push(x);g.solid[z*g.W+x]=0;};
      const bP=bProj(${JSON.stringify(type)});
      g.bullets=[{x:x0-3.5,z:w+0.5,dx:1,dz:0,sp:20,life:1,own:'p',hit:[],type:${JSON.stringify(type)},p:bP,e:bP.e0,tum:1,y:1.3,sx:x0-3.5,sz:w+0.5,st:${crouch}?'crouch':'stand'}];
      for(let t=0;t<6;t++)updateBulletsW5(0.05);`, ctx, { timeout: 2000 });
    return ctx;
  };
  let r = run({});
  assert.deepEqual(r.hits, [1], '9mm through steel-stud gyp still kills');
  r = run({ type: 'shotgun' });
  assert(r.hits.length === 1 && r.hits[0] < 0.9, `a buck pellet through drywall wounds: ${r.hits}`);
  assert.equal(run({ name: 'MOTEL SUNSET' }).hits.length, 0, '9mm stops in hollow CMU');
  assert.equal(run({ name: 'MOTEL SUNSET', type: 'm16' }).hits.length, 0, '5.56 stops in hollow CMU (§4)');
  r = run({ name: 'MOTEL SUNSET', type: 'goldak' });
  assert(r.hits.length === 1 && r.hits[0] < 0.9, `7.62 keeps ~9% through hollow CMU and wounds: ${r.hits}`);
  r = run({ wall: false, enemies: [[-1, 0.5], [2.5, 0.5]] });
  assert.deepEqual(r.hits, [1], '9mm: clean hit, then the body stops it');
  assert.equal(run({ wall: false, enemies: [[-1, 0.5], [2.5, 0.5]], type: 'revolver' }).hits.length, 2, '.357 passes one body');
  assert.equal(run({ wall: false, furn: 2 }).hits.length, 1, 'standing shooter fires over the low bar it hugs');
  assert.equal(run({ wall: false, furn: 2, crouch: true }).hits.length, 0, 'crouched: the CMU bar stops a 9mm');
  assert.equal(run({ wall: false, furn: 2, crouch: true, enemies: [[-1.75, 0.5]] }).hits.length, 1, 'a thug hugging the bar is shot over it');
  assert.equal(run({ wall: false, furn: 2, crouch: true, enemies: [[-1.6, -0.5], [2.5, 0.5]] }).hits.length, 0, 'an off-line bystander by the bar does not open it');
  r = run({ wall: false, glass: true });
  assert(r.glassHits.length === 1 && r.hits.length === 1, 'pane breaks and the round carries on');
  const ext = vm.runInNewContext(`${src}\nLEVELS.map((l,i)=>{const g=WORLD.buildGrid(l,i),m=LEGACY_BUILD.levels[l.name]||LEGACY_BUILD.def;let n=0;
    for(let k=0;k<g.W*g.H;k++)if(g.rows[(k/g.W)|0][k%g.W]==='#'&&legBuild(g,{kind:'wall',ref:k})===m.ext)n++;return [l.name,n];})`, {}, { timeout: 2000 });
  for (const [name, n] of ext) assert(n > 0, `${name}: no exterior walls`);
}

module.exports = { checkBallistics };
if (require.main === module) { checkBallistics(); console.log('ballistics ok'); }
