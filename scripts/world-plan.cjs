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

// ---- authored plans (plan.js + plans/*.js) ------------------------------------------------------
const kindColors = { guest: '#3d5a80', bath: '#5fa8d3', service: '#6d597a', office: '#b56576', apartment: '#e56b6f', shaft: '#333',
  stair: '#ffd166', walk: '#495057', alley: '#343a40', street: '#2b2d42', road: '#22223b', lot: '#3a3a3a', court: '#118ab2',
  planter: '#2d6a4f', canopy: '#6c757d', yard: '#40434e', roof: '#5c4d3c' };
const buildColors = ['#fe6f9e', '#ae9cff', '#ffad66', '#ffda78', '#82b8fc', '#cb8fc4', '#7bdff2', '#b9fbc0', '#f7aef8'];
const spawnColors = { player: '#7dff9a', arrive: '#7dff9a', exit: '#fff', enemy: '#ff4d5e', civ: '#b8c0ff', item: '#ffd36b' };

function loadStagePlan(planId, sid, ctx) {
  const { WORLD, PLAN, PLANS } = ctx || require('./plan-check.cjs').loadPlans(), plan = PLANS[planId];
  if (!plan) throw new RangeError(`Unknown plan ${planId}; known: ${Object.keys(PLANS).join(', ')}`);
  if (!plan.stages[sid]) throw new RangeError(`Unknown stage ${sid}; known: ${Object.keys(plan.stages).join(', ')}`);
  const report = ctx?.reports?.[planId] || PLAN.validate(plan), got = report.outs[sid];
  if (!got) throw new Error(report.errors.join('\n'));
  return { WORLD, PLAN, plan, sid, report, out: got.out, st: got.st };
}

function stageStats(sp) {
  const { PLAN, out, report, sid } = sp, R = report.stages[sid];
  const rooms = [...out.info.rooms.values()].map(r => ({ id: r.id, name: r.name, kind: r.kind, zone: r.zone, in: r.in,
    grossM2: +r.gross.toFixed(2), netM2: +r.net.toFixed(2), entrances: PLAN.entrances(out, r.id).map(p => p.id),
    pieces: out.info.pieces.get(r.id).map(p => p.id) }));
  return { plan: sp.plan.id, stage: sid, errors: report.errors.filter(e => e.includes(`/${sid}`)), warnings: report.warnings.filter(e => e.includes(`/${sid}`)).length,
    rooms: R.rooms, walls: R.walls, panels: R.panels, doors: R.doors, portals: R.portals, props: R.props,
    reach: R.reach, entries: R.entries, sight: R.sight, loops: R.loops, roomList: rooms };
}

function stageSight(sp, from, to, stance = 'standing', open = []) {
  const res = sp.PLAN.sightTest(sp.st, { from, to, stance, open });
  return { from, to, stance, open, clear: res.clear, by: res.ref ?? null, kind: res.kind ?? null, t: res.t };
}

function renderStage(sp, line) {
  const { WORLD, PLAN, out, st, report, sid } = sp, R = report.stages[sid], [bx0, bz0, bx1, bz1] = st.bounds;
  const scale = 18, margin = 40, top = 70, W = Math.max(1100, (bx1 - bx0) * scale + margin * 2), H = (bz1 - bz0) * scale + top + 170;
  const X = x => (margin + (x - bx0) * scale).toFixed(1), Z = z => (top + (z - bz0) * scale).toFixed(1);
  const pts = poly => poly.map(p => `${X(p[0])},${Z(p[1])}`).join(' '), body = [];
  for (let x = Math.ceil(bx0); x <= bx1; x++) body.push(`<line x1="${X(x)}" y1="${Z(bz0)}" x2="${X(x)}" y2="${Z(bz1)}" stroke="#1b2130" stroke-width="${x % 5 ? .5 : 1}"/>`);
  for (let z = Math.ceil(bz0); z <= bz1; z++) body.push(`<line x1="${X(bx0)}" y1="${Z(z)}" x2="${X(bx1)}" y2="${Z(z)}" stroke="#1b2130" stroke-width="${z % 5 ? .5 : 1}"/>`);
  for (let x = Math.ceil(bx0 / 5) * 5; x <= bx1; x += 5) body.push(`<text x="${X(x)}" y="${top - 6}" text-anchor="middle" fill="#9ca9bf">${x}</text>`);
  for (let z = Math.ceil(bz0 / 5) * 5; z <= bz1; z += 5) body.push(`<text x="${margin - 4}" y="${+Z(z) + 4}" text-anchor="end" fill="#9ca9bf">${z}</text>`);
  for (const r of out.stage.rooms) {
    const plan = out.info.rooms.get(r.parent ?? r.id), ext = plan.zone === 'exterior', fill = kindColors[plan.kind] || '#555';
    body.push(`<polygon points="${pts(r.poly)}" fill="${fill}" fill-opacity="${ext ? .35 : .6}" stroke="${fill}" stroke-dasharray="${ext ? '4 3' : ''}"><title>${xml(`${r.id}${r.parent ? ` (piece of ${r.parent})` : ''}: ${plan.kind} ${plan.zone}`)}</title></polygon>`);
  }
  for (const g of st.ground) if (g.y < -EPSV || g.surf === 'water') body.push(`<polygon points="${pts(g.poly)}" fill="#1d6fa5" fill-opacity=".7"><title>${xml(`${g.id}: ground y ${g.y}`)}</title></polygon>`);
  const builds = [...new Set(st.panels.map(p => p.build))].sort(), bc = b => buildColors[builds.indexOf(b) % buildColors.length];
  for (const p of st.panels) {
    const cells = st.cells.slice(p.c0, p.c1), blocks = cells.some(c => c.active && c.y0 < 1);
    body.push(`<polygon points="${pts(p.poly)}" fill="${p.kind === 'window' ? '#cdeffd' : bc(p.build)}" opacity="${blocks ? 1 : .3}"><title>${xml(`${p.ref}: ${p.build} ${p.cov}${p.kind === 'window' ? ' window' : blocks ? '' : ' (overhead only)'}`)}</title></polygon>`);
  }
  for (const d of st.doors) {
    const e = WORLD.geometry.doorEnd(d);
    body.push(`<line x1="${X(d.hx)}" y1="${Z(d.hz)}" x2="${X(e[0])}" y2="${Z(e[1])}" stroke="#2de2e6" stroke-width="3"><title>${xml(`door ${d.id}: ${d.build} ${d.len.toFixed(2)} m`)}</title></line><circle cx="${X(d.hx)}" cy="${Z(d.hz)}" r="2.5" fill="#fff"/>`);
  }
  for (const p of out.extras.portals) if (p.kind === 'door' && p.seg) body.push(`<line x1="${X(p.seg[0][0])}" y1="${Z(p.seg[0][1])}" x2="${X(p.seg[1][0])}" y2="${Z(p.seg[1][1])}" stroke="#2de2e6" stroke-width="2" stroke-dasharray="2 2"><title>${xml(`opening ${p.id}: ${p.w} m`)}</title></line>`);
  for (const p of st.props) body.push(`<polygon points="${pts(p.poly)}" fill="#bc8544" stroke="#3b2a17"><title>${xml(`${p.id}: ${p.build} ${p.cov} ${p.h} m`)}</title></polygon>`);
  for (const r of out.info.rooms.values()) {
    const piece = out.info.pieces.get(r.id).map(p => p.poly).sort((a, b) => PLAN.area(b) - PLAN.area(a))[0];
    const cx = piece.reduce((s, p) => s + p[0], 0) / piece.length, cz = piece.reduce((s, p) => s + p[1], 0) / piece.length;
    const [lx, lz] = PLAN.inside(piece, cx, cz) ? [cx, cz] : [(piece[0][0] + piece[2][0]) / 2, (piece[0][1] + piece[2][1]) / 2];
    const small = r.gross < 12, tiny = r.gross < 8, ent = PLAN.entrances(out, r.id).length;
    body.push(`<text x="${X(lx)}" y="${Z(lz)}" text-anchor="middle" font-size="${tiny ? 6.5 : small ? 8 : 10}" fill="#fff">${xml(r.id)}<title>${xml(`${r.id}: ${r.gross.toFixed(1)} m², ${ent} entrances`)}</title></text>${tiny ? '' : `<text x="${X(lx)}" y="${+Z(lz) + (small ? 9 : 12)}" text-anchor="middle" font-size="${small ? 7 : 9}" fill="#c9d1e0">${r.gross.toFixed(1)}m² ·${ent}e</text>`}`);
  }
  for (const s of out.stage.spawns) body.push(`<circle cx="${X(s.x)}" cy="${Z(s.z)}" r="4.5" fill="${spawnColors[s.kind] || '#fff'}" stroke="#000"><title>${xml(`${s.kind} ${s.id}${s.role ? ` (${s.role})` : ''} at (${s.x},${s.z})`)}</title></circle>`);
  for (const s of out.extras.stairs) body.push(`<path d="M${X(s.at[0])},${+Z(s.at[1]) - 6} l6,10 l-12,0 z" fill="#ffd166" stroke="#000"><title>${xml(`stair ${s.id} → ${s.to}/${s.arrive}`)}</title></path>`);
  for (const [k, c] of [['obj', '#ff9f1c'], ['stash', '#c77dff'], ['items', '#ffd36b']]) for (const o of out.extras[k]) body.push(`<rect x="${+X(o.at[0]) - 5}" y="${+Z(o.at[1]) - 5}" width="10" height="10" fill="${c}" stroke="#000" transform="rotate(45 ${X(o.at[0])} ${Z(o.at[1])})"><title>${xml(`${k} ${o.id}`)}</title></rect>`);
  const lines = [...(R.sight || []).map(s => { const t = out.extras.targets.sight.find(q => q.id === s.id); return { from: t.from, to: t.to, clear: s.got === 'clear', label: `${s.id} ${s.got}${s.ok ? '' : ` (brief: ${s.want})`}` }; }),
    ...(line ? [{ from: line.from, to: line.to, clear: line.clear, label: `query ${line.clear ? 'clear' : `blocked by ${line.by}`}` }] : [])];
  for (const l of lines) body.push(`<line x1="${X(l.from[0])}" y1="${Z(l.from[1])}" x2="${X(l.to[0])}" y2="${Z(l.to[1])}" stroke="${l.clear ? '#7dff9a' : '#ff4d5e'}" stroke-width="1.5" stroke-dasharray="6 3"><title>${xml(l.label)}</title></line><text x="${X(l.from[0])}" y="${+Z(l.from[1]) - 4}" font-size="9" fill="${l.clear ? '#7dff9a' : '#ff4d5e'}">${xml(l.label.split(' ')[0])}</text>`);
  const legendB = builds.map((b, i) => `<tspan fill="${bc(b)}">■ ${xml(b)} </tspan>`).join('');
  const kinds = [...new Set([...out.info.rooms.values()].map(r => r.kind))].map(k => `<tspan fill="${kindColors[k] || '#555'}">■</tspan><tspan> ${xml(k)} </tspan>`).join('');
  const errs = report.errors.filter(e => e.includes(`/${sid}`));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">${xml(`${sp.plan.name || sp.plan.id} — ${sid}`)} plan</title><desc id="desc">Authored plan: rooms by kind with gross m² and walkable entrances, walls at true thickness coloured by build, doors, openings, props, spawns, stairs, objectives and brief sightlines.</desc>
<rect width="100%" height="100%" fill="#0b0f18"/><g font-family="monospace" font-size="11" fill="#e4e7ef">
<text x="${margin}" y="24" font-size="18">${xml(`${sp.plan.name || sp.plan.id} — ${sid}`)}</text>
<text x="${margin}" y="46">${R.rooms} stage rooms · ${R.walls} walls · ${R.panels} panels · ${R.doors} doors · ${R.portals} portals · walkable ${R.reach?.walkableM2 ?? '?'} m² from ${R.reach?.from ?? '-'} · ${errs.length ? `${errs.length} ERRORS` : 'validates clean'}</text>
${body.join('\n')}
<text x="${margin}" y="${H - 140}">Walls: ${legendB}</text>
<text x="${margin}" y="${H - 120}">Rooms: ${kinds}</text>
<text x="${margin}" y="${H - 100}">Labels: room id, gross m², walkable entrances (e). Faded wall: overhead only (arch lintel). Pale blue: window. Cyan: door leaf / dashed open portal.</text>
<text x="${margin}" y="${H - 80}">Dots: green player/arrive · red enemy · lilac civilian · yellow item. Triangle stair · orange objective · purple stash. Brown: props.</text>
<text x="${margin}" y="${H - 60}">Sightlines (brief targets): green clear / red blocked; hover for detail. Grid 1 m, labels every 5 m. x east, z south.</text>
${errs.slice(0, 2).map((e, i) => `<text x="${margin}" y="${H - 38 + i * 16}" fill="#ff4d5e">${xml(e.slice(0, 160))}</text>`).join('\n')}
</g></svg>\n`;
}
const EPSV = 1e-6;

function main(args = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({ args, allowPositionals: true, options: {
    level: { type: 'string' }, out: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' },
    plan: { type: 'string' }, stage: { type: 'string' }, room: { type: 'string' }, stance: { type: 'string' }, open: { type: 'string' }
  } });
  const [command] = positionals;
  if (values.plan !== undefined) {
    if (positionals.length !== 1 || !['render', 'stats', 'sight', 'validate', 'room'].includes(command)) {
      throw new Error('Usage: node scripts\\world-plan.cjs render|stats|sight|validate|room --plan <id> [--stage <sid>] [--out plan.svg] [--from x,z --to x,z [--stance crouched] [--open d1,d2]] [--room id]');
    }
    const ctx = require('./plan-check.cjs').loadPlans();
    if (command === 'validate') {
      const { PLAN, PLANS } = ctx;
      if (!PLANS[values.plan]) throw new RangeError(`Unknown plan ${values.plan}; known: ${Object.keys(PLANS).join(', ')}`);
      const rep = PLAN.validate(PLANS[values.plan]);
      console.log(JSON.stringify({ errors: rep.errors, warnings: rep.warnings }, null, 2));
      if (rep.errors.length) process.exitCode = 1;
      return;
    }
    const sp = loadStagePlan(values.plan, values.stage || Object.keys(ctx.PLANS[values.plan]?.stages || {})[0], ctx);
    const line = values.from || values.to ? stageSight(sp, point(values.from), point(values.to), values.stance, values.open ? values.open.split(',') : []) : null;
    if (command === 'render') {
      if (!values.out) throw new Error('render requires --out; existing files are never overwritten');
      writeFileSync(resolve(values.out), renderStage(sp, line), { flag: 'wx' });
      console.log(`Wrote ${resolve(values.out)}`);
    } else if (command === 'stats') console.log(JSON.stringify(stageStats(sp), null, 2));
    else if (command === 'room') {
      const r = stageStats(sp).roomList.find(x => x.id === values.room);
      if (!r) throw new RangeError(`Unknown room ${values.room}`);
      console.log(JSON.stringify({ ...r, portals: sp.out.extras.portals.filter(p => p.ra === r.id || p.rb === r.id) }, null, 2));
    } else {
      if (!line) throw new Error('sight requires --from x,z and --to x,z');
      console.log(JSON.stringify(line, null, 2));
    }
    return;
  }
  if (positionals.length !== 1 || !['render', 'stats', 'sight'].includes(command) || !/^\d+$/.test(values.level || '')) {
    throw new Error('Usage: node scripts\\world-plan.cjs render|stats|sight --level 0-7 [--out plan.svg] [--from x,z --to x,z]\n   or: node scripts\\world-plan.cjs render|stats|sight|validate|room --plan <id> [--stage <sid>] ...');
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

module.exports = { loadPlan, stats, sight, renderPlan, point, main, loadStagePlan, stageStats, stageSight, renderStage };
if (require.main === module) main();
