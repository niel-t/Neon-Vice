const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const { worldData } = require('./world-snapshot.cjs');

function checkMaterials() {
  const { materials: m } = worldData().WORLD;
  const doc = readFileSync(resolve(__dirname, '..', 'docs', 'research', 'MATERIALS.md'), 'utf8');
  const section = doc.split('## 8. JS literal proposals')[1];
  const literal = section?.match(/```js\s*([\s\S]*?)```/)?.[1];
  assert(literal, 'W3 canonical material/build literal');
  const reference = vm.runInNewContext(`${literal}\n({MAT,BUILD})`, {}, { timeout: 1000 });
  assert.deepEqual(structuredClone(m.MAT), structuredClone(reference.MAT));
  assert.deepEqual(structuredClone(m.BUILD), structuredClone(reference.BUILD));
  assert.equal(Object.keys(m.MAT).length, 21);
  assert.equal(Object.keys(m.BUILD).length, 38);
  const frozen = o => {
    assert(Object.isFrozen(o));
    for (const v of Object.values(o)) if (v && typeof v === 'object') frozen(v);
  };
  frozen(m);
  for (const [id, mat] of Object.entries(m.MAT)) {
    assert(Number.isFinite(mat.res) && mat.res >= 0, `${id}: resistance J/cm`);
    assert([0, 1].includes(mat.hard), `${id}: hardness application`);
  }
  for (const [id, b] of Object.entries(m.BUILD)) {
    for (const layers of [b.layers, ...(b.alt ? [b.alt.layers] : [])]) {
      assert(layers.length, `${id}: empty stack`);
      for (const [mat, cm] of layers) assert(m.MAT[mat] && Number.isFinite(cm) && cm > 0, `${id}: layer`);
    }
    assert(b.cellHp === Infinity || Number.isFinite(b.cellHp) && b.cellHp > 0);
    if (b.coreE !== undefined) assert(Number.isFinite(b.coreE) && b.coreE > 0);
    if (b.lockHp !== undefined) assert(b.lockHp === Infinity || Number.isFinite(b.lockHp) && b.lockHp > 0);
    if (b.alt) {
      assert(b.alt.p > 0 && b.alt.p < 1);
      assert.equal(m.selectLayers(id, b.alt.p - 1e-8), b.alt.layers);
      assert.equal(m.selectLayers(id, b.alt.p), b.layers);
      assert.equal(m.selectLayers(id, .999), b.layers);
    } else assert.equal(m.selectLayers(id, 0), b.layers);
    const d = m.describe(id);
    assert.deepEqual(JSON.parse(JSON.stringify(d)), structuredClone(d), `${id}: JSON-safe descriptor`);
    assert.equal(d.indestructible, b.cellHp === Infinity);
    assert.equal(d.lockIndestructible, b.lockHp === Infinity);
    d.layers[0][1] = 0;
    assert(b.layers[0][1] > 0, 'Descriptors never mutate canonical tables');
  }
  assert.equal(m.describe('stud_steel_gyp').thicknessCm, 12.38);
  assert.equal(m.describe('door_vault').lockHp, null);
  assert.equal(m.describe('door_vault').lockIndestructible, true);
  assert.equal(m.describe('rc_column_40').indestructible, true);
  assert.equal(m.describe('glass_block').pane, false, 'Build optics/pane do not leak from component material');
  const surface = (build, cov = 'full', kind = 'wall') => m.validateSurface({ kind, build, cov, h: 2.7 });
  for (const build of Object.keys(m.BUILD)) {
    assert.equal(m.blocksSight(surface(build, 'full', 'prop')), false, 'Even full-height props never occlude sight');
  }
  assert(m.blocksSight(surface('cbs_ext')));
  assert(!m.blocksSight(surface('cbs_ext', 'chest'), 'standing'));
  assert(m.blocksSight(surface('cbs_ext', 'chest'), 'crouched'));
  for (const cov of ['waist', 'rail']) for (const stance of ['standing', 'crouched']) assert(!m.blocksSight(surface('cbs_ext', cov), stance));
  for (const id of ['glass_annealed_6', 'glass_tempered_6', 'glass_lam_windshield', 'glass_studio']) {
    assert(!m.blocksSight(surface(id, 'glass', 'window')));
    assert(!m.blocksSight(surface(id, 'full', 'door')));
  }
  assert(m.blocksSight(surface('glass_block', 'full', 'window')));
  assert(m.blocksSight(surface('door_metal', 'full', 'door')));
  assert(m.blocksSight(surface('door_vault', 'full', 'door')));
  for (const bad of ['open', 'glass', 'curtain', 'toString']) assert.throws(() => m.build(bad), /Unknown construction/);
  for (const u of [-1, 1, NaN, Infinity, undefined]) assert.throws(() => m.selectLayers('cmu_hollow', u), /sample u/);
  assert.throws(() => m.validateSurface({ build: 'sofa', cov: 'full', h: 1 }), /kind/);
  const valid = { kind: 'wall', build: 'cbs_ext', cov: 'full', h: 2.7 };
  assert.throws(() => m.validateSurface(Object.create(valid)), /Missing surface field/);
  assert.throws(() => m.validateSurface(Object.assign(Object.create({ h: 2.7 }), { kind: 'wall', build: 'cbs_ext', cov: 'full' })), /field h/);
  assert.throws(() => m.validateSurface(Object.defineProperty({ ...valid }, 't', { value: .2 })), /field t/);
  assert.throws(() => m.validateSurface({ ...valid, [Symbol('extra')]: true }), /Unknown surface field/);
  assert.throws(() => m.validateSurface({ kind: 'wall', build: 'cbs_ext', cov: 'full', h: 2, t: .2 }), /field t/);
  assert.throws(() => surface('glass_block', 'glass'), /requires full/);
  assert.throws(() => surface('door_metal', 'glass', 'door'), /Opaque/);
  assert.throws(() => surface('door_metal', 'chest', 'door'), /Door\/window/);
  assert.throws(() => m.validateSurface({ kind: 'wall', build: 'cbs_ext', cov: 'full', h: Infinity }), /positive finite/);
  assert.throws(() => m.blocksSight(surface('cbs_ext'), 'prone'), /stance/);
  console.log('WORLD materials: 21 materials, 38 builds, optics/coverage and JSON-safe durability checked');
}

module.exports = { checkMaterials };
if (require.main === module) checkMaterials();
