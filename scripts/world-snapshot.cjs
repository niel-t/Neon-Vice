const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

function worldData() {
  const source = ['levels.js', 'world.js'].map(file => readFileSync(resolve(__dirname, '..', file), 'utf8')).join('\n');
  return vm.runInNewContext(`${source}\n({WORLD,LEVELS,FURN,EKIND,IKIND,WALL_H})`, {}, { timeout: 1000 });
}

function gridSnapshot(g) {
  const arrays = ['solid', 'furn', 'floorT', 'wallT', 'rug', 'wh', 'topT', 'tint', 'glow'];
  return {
    W: g.W, H: g.H, rows: g.rows,
    arrays: Object.fromEntries(arrays.map(key => {
      const a = g[key], bytes = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
      return [key, { type: a.constructor.name, length: a.length, bytes: Array.from(bytes) }];
    })),
    doors: (g.doorSpecs || g.doors).map(({ hx, hz, base }) => ({ hx, hz, base }))
  };
}

function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

// This function is evaluated in the real game page, before simulation can run.
function captureLoads(snapshotSource) {
  const snapshot = (0, eval)(`(${snapshotSource})`);
  const random = Math.random, hazards = addHazards, setup = hubSetup, oldIdx = levelIdx;
  const records = [];
  let grid;
  addHazards = (g, i) => { grid = snapshot(g); return hazards(g, i); };
  hubSetup = g => { grid = snapshot(g); return setup(g); };
  try {
    const cases = [
      ...LEVELS.map((def, idx) => ({ key: `level:${idx}`, idx, def })),
      ...Object.entries(HUBS).flatMap(([name, def]) => [0, 7].map(idx => ({ key: `hub:${name}:${idx}`, idx, def })))
    ];
    for (const { key, idx, def } of cases) {
      let seed = 123456789;
      Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
      levelIdx = idx;
      const g = loadLevel(idx, def);
      const look = c => ({ x: c.x, z: c.z, a: c.a, state: c.state, pers: c.pers, hp: c.hp,
        weapon: c.weapon, look: Object.fromEntries(Object.entries(c.look).filter(([k]) => !k.startsWith('_'))) });
      const record = {
        key, idx, input: { map: def.map, legend: def.legend, wall: def.wall, floor: def.floor,
          floorFn: def.floorFn?.toString(), paletteSize: PASTEL.length },
        grid, loaded: { grid: snapshot(g), player: look(g.player), car: g.car, disco: g.disco,
          doors: g.doors, lights: g.lights, enemies: g.enemies.map(look), npcs: g.npcs.map(look),
          items: g.items, trigs: g.trigs, deco: g.deco, pool: g.pool, glass: g.glass }
      };
      const queries = [];
      for (let k=0;k<30;k++) {
        const x=(k*7.31)%(g.W+2)-1,z=(k*3.17)%(g.H+2)-1,dx=Math.sin(k),dz=Math.cos(k);
        const cx=Math.floor(x),cz=Math.floor(z),c={x,z,r:0.28};
        collideGrid(c);
        queries.push([isSolid(cx,cz),isBlock(cx,cz),isCover(cx,cz),rayLen(x,z,dx,dz,8),
          rayWall(x,z,dx,dz,8,true),los(x,z,x+dx*8,z+dz*8),c]);
      }
      const flow = new Int16Array(g.W*g.H);
      bfs(flow,Math.floor(g.player.x),Math.floor(g.player.z));
      queries.push(Array.from(flow));
      record.queries = queries;
      records.push(record);
    }
  } finally {
    Math.random = random; addHazards = hazards; hubSetup = setup; levelIdx = oldIdx;
  }
  return records;
}

module.exports = { worldData, gridSnapshot, digest, captureLoads };
