const { parseArgs } = require('node:util');
const { writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { worldData } = require('./world-snapshot.cjs');

const xml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const wallColors = ['#fe6f9e', '#ae9cff', '#ffad66', '#ffda78', '#82b8fc', '#cb8fc4'];

function loadPlan(idx) {
  const { WORLD, LEVELS, FURN, EKIND, IKIND, WALL_H } = worldData();
  if (!Number.isInteger(idx) || idx < 0 || idx >= LEVELS.length) throw new RangeError('Level must be an existing campaign index (0-7)');
  const def = LEVELS[idx], grid = WORLD.buildGrid(def, idx);
  grid.doors = grid.doorSpecs.map(d => ({ ...d, th: 0, w: 0, pusher: '' }));
  const spawns = [];
  grid.rows.forEach((row, z) => [...row].forEach((c, x) => {
    if (def.legend?.[c] || c === '#' || c === ' ' || FURN[c]) return;
    const kind = c === 'P' ? 'player' : c === 'C' ? 'exit' : c in EKIND || c === 'X' ? 'enemy' : c in IKIND ? 'item' : null;
    if (kind) spawns.push({ kind, x: x + 0.5, z: z + 0.5, glyph: c });
  }));
  return { WORLD, grid, spawns, wallHeight: WALL_H };
}

function stats(plan) {
  const { grid: g, spawns } = plan;
  let floorCells = 0, walkableCells = 0, lowWallCells = 0;
  for (let i = 0; i < g.solid.length; i++) {
    if (!g.solid[i]) { floorCells++; if (!g.furn[i]) walkableCells++; }
    else if (!plan.WORLD.cell.rayBlock(g, i%g.W, Math.floor(i/g.W), false)) lowWallCells++;
  }
  return { name: g.def.name, width: g.W, height: g.H, floorCells, walkableCells, lowWallCells,
    doors: g.doors.length, spawns: Object.fromEntries(['player', 'exit', 'enemy', 'item'].map(kind => [kind, spawns.filter(s => s.kind === kind).length])),
    spawnPoints: spawns,
    scale: 'Legacy cells shown as nominal 1 m squares; heights are game units, not surveyed architectural dimensions',
    rooms: null, elevation: null, combat: g.def.combat ?? !g.def.hub };
}

function sight(plan, from, to) {
  const { WORLD, grid } = plan, dx = to[0] - from[0], dz = to[1] - from[1], distance = Math.hypot(dx, dz);
  for (const [x, z] of [from, to]) if (!Number.isFinite(x) || !Number.isFinite(z) || x < 0 || z < 0 || x >= grid.W || z >= grid.H) throw new RangeError('Sight endpoints must be inside the plan bounds');
  const visible = WORLD.cell.los(grid, ...from, ...to);
  let firstHit = null;
  if (!visible) {
    const n = Math.ceil(distance / .15);
    for (let i=1;i<n;i++) {
      const t=i/n, x=from[0]+dx*t, z=from[1]+dz*t;
      if (WORLD.cell.rayBlock(grid,Math.floor(x),Math.floor(z),false)) {
        firstHit={x,z,distance:distance*t,kind:'wall',sampled:true}; break;
      }
    }
    const door = WORLD.cell.doorHit(grid,...from,...to);
    if (door && (!firstHit || door.d < firstHit.distance)) firstHit={x:door.x,z:door.z,distance:door.d,kind:'door',sampled:false};
  }
  return { from, to, visible, distance, firstHit };
}

function renderPlan(plan, line) {
  const { grid: g, spawns, WORLD } = plan, s = stats(plan), scale = 24, margin = 18, top = 62;
  const width = Math.max(820, g.W * scale + margin * 2), height = g.H * scale + top + 130;
  const X = x => margin + x * scale, Z = z => top + z * scale;
  const body = [];
  const wallTypes = [...new Set(Array.from(g.wallT).filter((type, i) => g.solid[i] && g.rows[Math.floor(i/g.W)][i%g.W] !== ' '))].sort((a,b)=>a-b);
  const color = type => wallColors[wallTypes.indexOf(type)%wallColors.length];
  const waterTypes = new Set();
  for (let z = 0; z < g.H; z++) for (let x = 0; x < g.W; x++) {
    const i = z * g.W + x, h = g.wh[i] || plan.wallHeight, type = g.wallT[i], low = g.solid[i] && !WORLD.cell.rayBlock(g,x,z,false), voidCell = g.rows[z][x] === ' ';
    let fill = '#161c29';
    if (g.solid[i]) { fill = voidCell ? '#273146' : color(type); if (g.glow[i] === 2) waterTypes.add(type); }
    const coords = `(${x+.5},${z+.5})`;
    body.push(`<rect x="${X(x)}" y="${Z(z)}" width="${scale}" height="${scale}" fill="${fill}" opacity="${low ? 0.35 : 1}" stroke="#242b3b" stroke-width=".5"><title>${xml(`${coords} ` + (g.solid[i] ? `${voidCell ? 'void/border' : g.glow[i] === 2 ? 'water' : 'wall'} type ${type}; height ${h.toFixed(2)} game units${low ? '; movement only' : ''}` : `floor ${g.floorT[i]}`))}</title></rect>`);
    if (g.furn[i]) {
      const cover = WORLD.cell.isCover(g,x,z);
      body.push(`<rect x="${X(x + .2)}" y="${Z(z + .2)}" width="${scale * .6}" height="${scale * .6}" fill="${cover ? '#bc8544' : '#78818f'}"><title>${coords} furniture type ${g.furn[i]}; ${cover ? 'stops' : 'passes'} bullets</title></rect>`);
    }
  }
  for (let x=0;x<g.W;x+=5) body.push(`<text x="${X(x+.5)}" y="${top-6}" text-anchor="middle" fill="#9ca9bf">${x}</text>`);
  for (let z=0;z<g.H;z+=5) body.push(`<text x="${margin-4}" y="${Z(z+.5)+4}" text-anchor="end" fill="#9ca9bf">${z}</text>`);
  for (const d of g.doors) {
    const e = WORLD.geometry.doorEnd(d);
    body.push(`<line x1="${X(d.hx)}" y1="${Z(d.hz)}" x2="${X(e[0])}" y2="${Z(e[1])}" stroke="#2de2e6" stroke-width="3"><title>closed door</title></line><circle cx="${X(d.hx)}" cy="${Z(d.hz)}" r="2" fill="#fff"/>`);
  }
  const colors = { player: '#7dff9a', exit: '#fff', enemy: '#ff4d5e', item: '#ffd36b' };
  for (const spawn of spawns) body.push(`<circle cx="${X(spawn.x)}" cy="${Z(spawn.z)}" r="5" fill="${colors[spawn.kind]}"><title>${xml(`${spawn.kind} (${spawn.glyph}) at (${spawn.x},${spawn.z})`)}</title></circle>`);
  if (line) {
    const color = line.visible ? '#7dff9a' : '#ff4d5e';
    body.push(`<line x1="${X(line.from[0])}" y1="${Z(line.from[1])}" x2="${X(line.to[0])}" y2="${Z(line.to[1])}" stroke="${color}" stroke-width="2" stroke-dasharray="5 3"><title>${line.visible ? 'clear' : 'blocked'} sightline</title></line>`);
    if (line.firstHit) body.push(`<circle cx="${X(line.firstHit.x)}" cy="${Z(line.firstHit.z)}" r="4" fill="#fff"><title>first ${line.firstHit.kind} hit</title></circle>`);
  }
  const labels = wallTypes.map(type => `<tspan fill="${color(type)}"> ${waterTypes.has(type) ? 'water' : 'wall'} type ${type} </tspan>`).join('') + '<tspan fill="#9ca9bf"> void/border </tspan>';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">${xml(g.def.name)} floorplan</title><desc id="desc">Legacy grid preview: wall types and coverage height, closed doors, furniture, spawns and optional sightline. Not a freeform authored layout.</desc>
<rect width="100%" height="100%" fill="#0b0f18"/><g font-family="monospace" font-size="12" fill="#e4e7ef">
<text x="${margin}" y="24" font-size="18">${xml(g.def.name)}</text><text x="${margin}" y="45">${s.walkableCells} navigable m² / ${s.floorCells} floor m² (legacy 1 m cells assumed); ${s.doors} closed doors</text>
${body.join('\n')}
<text x="${margin}" y="${height - 104}">${labels}</text>
<text x="${margin}" y="${height - 82}">Faded: low coverage, movement only. Cyan: doors. Grey furniture / gold bullet cover.</text>
<text x="${margin}" y="${height - 60}">Spawns: green player / red enemy / yellow item / white exit. Sight: green clear / red blocked.</text>
<text x="${margin}" y="${height - 38}">Wall IDs are texture types, not researched materials. Hover for coordinates and game-unit height.</text>
<text x="${margin}" y="${height - 16}">Rooms and elevation: not authored in legacy data. Combat: ${s.combat ? 'yes' : 'no'}.</text>
</g></svg>\n`;
}

function point(value) {
  const parts = value?.split(',');
  if (!parts || parts.length !== 2 || parts.some(p => !p.trim() || !Number.isFinite(Number(p)))) throw new TypeError('Coordinates must be a finite x,z pair');
  return parts.map(Number);
}

function main(args = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({ args, allowPositionals: true, options: {
    level: { type: 'string' }, out: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' }
  } });
  const [command] = positionals;
  if (positionals.length !== 1 || !['render', 'stats', 'sight'].includes(command) || !/^\d+$/.test(values.level || '')) {
    throw new Error('Usage: node scripts\\world-plan.cjs render|stats|sight --level 0-7 [--out plan.svg] [--from x,z --to x,z]');
  }
  const plan = loadPlan(Number(values.level));
  const line = values.from || values.to ? sight(plan, point(values.from), point(values.to)) : null;
  if (command === 'render') {
    if (!values.out) throw new Error('render requires --out; existing files are never overwritten');
    writeFileSync(resolve(values.out), renderPlan(plan, line), { flag: 'wx' });
    console.log(`Wrote ${resolve(values.out)}`);
  } else if (command === 'stats') console.log(JSON.stringify(stats(plan), null, 2));
  else {
    if (!line) throw new Error('sight requires --from x,z and --to x,z');
    console.log(JSON.stringify(line, null, 2));
  }
}

module.exports = { loadPlan, stats, sight, renderPlan, point, main };
if (require.main === module) main();
