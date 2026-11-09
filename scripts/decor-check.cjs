const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

// DECOR (decor.js, W4c): kit data integrity, synthetic rooms per kind × style, and a dressed motel plan.
function loadDecor() {
  const root = resolve(__dirname, '..');
  const src = ['levels.js', 'world.js', 'plan.js', 'plans/motel.js', 'decor.js'].map(f => readFileSync(resolve(root, f), 'utf8')).join('\n');
  return vm.runInNewContext(`${src}\n({WORLD,PLAN,PLANS,DECOR})`, {}, { timeout: 60000 });
}

function checkData({ WORLD, PLAN, DECOR }) {
  const { items, kits, ARTPOOL, SCATTER, NO_DECOR } = DECOR, BUILD = WORLD.materials.BUILD;
  const has = (id, what) => assert(items[id], `${what}: unknown decor item ${id}`);
  for (const it of Object.values(items)) {
    assert(it.w > 0 && it.d > 0 && it.h > 0, `${it.id}: invalid size`);
    assert(it.styles.length && it.styles.every(s => DECOR.STYLES.includes(s)), `${it.id}: invalid styles`);
    if (it.build) {
      assert(BUILD[it.build], `${it.id}: unknown build ${it.build}`);
      assert(['full', 'chest', 'waist'].includes(it.cov), `${it.id}: invalid cov ${it.cov}`);
    }
    for (const s of it.share ?? []) has(s, `${it.id} share`);
    for (const s of Object.values(it.buildBy ?? {})) assert(BUILD[s], `${it.id}: unknown buildBy ${s}`);
  }
  const entry = (e, what) => {
    if (typeof e === 'string') return has(e, what);
    for (const k of ['i', 'row', 'rep', 'rows', 'edge', 'above', 'on']) if (typeof e[k] === 'string' && k !== 'on' && !(k === 'row' && ['cab', 'laundry'].includes(e[k]))) has(e[k], what);
    if (e.i && typeof e.on === 'string' && !items[e.on]) assert(['counter_run', 'dresser'].includes(e.on), `${what}: unknown host ${e.on}`);
    for (const a of e.alt ?? []) has(a, `${what} alt`);
    for (const k of ['table', 'desk', 'sofa']) if (typeof e[k] === 'string') has(e[k], what);
    for (const b of e.beds ?? []) has(Array.isArray(b) ? b[0] : b, what);
  };
  for (const [kind, byStyle] of Object.entries(kits)) {
    assert(PLAN.ROOM_KINDS.has(kind), `kits.${kind}: not a PLAN room kind`);
    for (const [style, kit] of Object.entries(byStyle)) {
      const what = `kits.${kind}.${style}`;
      assert(Array.isArray(kit.req) && Array.isArray(kit.opt) && kit.cap > 0 && kit.cap <= 1, `${what}: invalid kit`);
      for (const k of [kit, ...Object.values(kit.uses ?? {})]) {
        for (const e of k.req ?? []) entry(e, what);
        for (const [e, w] of k.opt ?? []) { assert(w > 0, `${what}: invalid weight`); entry(e, what); }
      }
    }
  }
  for (const kind of PLAN.ROOM_KINDS) {
    if (NO_DECOR.includes(kind)) continue;
    assert(kits[kind], `room kind ${kind} has no kit`);
    for (const s of PLAN.STYLES) assert(DECOR.kitFor(kind, s), `kitFor(${kind}, ${s}) resolves nothing`);
  }
  for (const pool of Object.values(ARTPOOL)) for (const [id] of pool) has(id, 'ARTPOOL');
  for (const ids of Object.values(SCATTER)) for (const id of ids) has(id, 'SCATTER');
}

// one walled rectangle per kind × style with a single door on its south edge
function checkSynthetic({ DECOR }) {
  const { rect, overlap, inPoly } = DECOR._, EXT = new Set(['walk', 'terrace', 'court', 'lot', 'street', 'road', 'alley', 'yard', 'pier', 'planter']);
  let rooms = 0, solids = 0, visuals = 0; const warn = [];
  for (const [kind, byStyle] of Object.entries(DECOR.kits)) {
    for (const style of Object.keys(byStyle)) {
      const kit = byStyle[style], ext = EXT.has(kind), A = Math.max(16, (kit.min || 6) * 2), w = Math.min(16, Math.sqrt(A * 1.25)), d = Math.min(16, A / w);
      const poly = [[0, 0], [w, 0], [w, d], [0, d]], dx = 0.9;
      const edges = poly.map((a, i) => ({ a, b: poly[(i + 1) % 4], wall: !ext, h: 2.8, thick: 0.15, build: ext ? undefined : 'stud_wood_gyp', open: [] }));
      edges[0].open.push({ s0: dx - 0.45, s1: dx + 0.45, kind: 'door', exit: kind === 'circulation' });
      const room = { id: `${kind}_${style}`, kind, style, poly, h: 2.8, edges, reserved: [{ at: [dx, 0.8], r: 0.6 }] };
      const what = `synthetic ${room.id}`;
      const a = DECOR.place(room, { levelId: 'decor-check' }), b = DECOR.place(room, { levelId: 'decor-check' });
      assert.equal(JSON.stringify(a), JSON.stringify(b), `${what}: placement is not deterministic`);
      const zone = rect(dx, 0.075 + 0.6, 1.5, 1.2, 0), roofed = !ext;
      for (const p of a.props) {
        const fp = rect(p.at[0], p.at[1], p.size[0], p.size[1], p.rot);
        assert(fp.every(v => v[0] > -1e-3 && v[0] < w + 1e-3 && v[1] > -1e-3 && v[1] < d + 1e-3), `${what}: ${p.item} outside the room`);
        if (!ext) assert(!overlap(fp, zone), `${what}: ${p.item} blocks the door`);
        assert(Math.hypot(p.at[0] - dx, p.at[1] - 0.8) > 0.6, `${what}: ${p.item} on the reserved spawn`);
      }
      for (const q of a.decor) {
        assert(inPoly(poly, q.at), `${what}: decor ${q.kind} outside the room`);
        if (DECOR.items[q.kind].host.includes('ceiling')) assert(roofed, `${what}: ceiling ${q.kind} in an open area`);
      }
      const solidA = a.props.reduce((s, p) => s + p.size[0] * p.size[1], 0);
      assert(solidA <= 0.6 * w * d, `${what}: solids cover ${(solidA / (w * d) * 100).toFixed(0)}% of the floor`);
      rooms++; warn.push(...a.warnings); solids += a.props.length; visuals += a.decor.length;
    }
  }
  return { rooms, solids, visuals, warn };
}

function checkMotel({ WORLD, PLAN, PLANS, DECOR }) {
  const t = Date.now(), r = DECOR.apply(PLANS.motel), ms = Date.now() - t;
  const v = PLAN.validate(r.plan);
  assert.equal(v.errors.length, 0, `dressed motel: ${v.errors.join('; ')}`);
  const out = [];
  for (const sid of Object.keys(PLANS.motel.stages)) {
    const { stage } = PLAN.fromPlan(r.plan, sid);
    stage.decor = r.decor[sid];
    const world = WORLD.compile(stage);
    assert.equal(world.decor.length, r.decor[sid].length, `motel/${sid}: decor lost in compile`);
    out.push(`${sid} +${r.plan.stages[sid].props.length - (PLANS.motel.stages[sid].props ?? []).length} props/${r.decor[sid].length} decor`);
  }
  assert.equal(JSON.stringify(DECOR.dressStage(PLANS.motel, 'f2').decor), JSON.stringify(r.decor.f2), 'motel: placement is not deterministic');
  return { ms, out, warnings: r.warnings };
}

function checkDecorKits() {
  const ctx = loadDecor();
  assert.equal(ctx.DECOR.version, 1);
  checkData(ctx);
  const s = checkSynthetic(ctx), m = checkMotel(ctx);
  console.log(`decor: ${s.rooms} synthetic rooms (${s.solids} solids, ${s.visuals} visuals, ${s.warn.length} warnings); motel ${m.out.join(', ')} in ${m.ms} ms`);
  for (const w of m.warnings) console.log(`  decor warning ${w}`);
}

module.exports = { checkDecorKits, loadDecor };
if (require.main === module) checkDecorKits();
