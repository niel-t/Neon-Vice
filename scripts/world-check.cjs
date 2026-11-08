const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const { gridSnapshot, digest } = require('./world-snapshot.cjs');

function worldData() {
  const source = ['levels.js', 'world.js'].map(file => readFileSync(resolve(__dirname, '..', file), 'utf8')).join('\n');
  return vm.runInNewContext(`${source}\n({WORLD,LEVELS})`, {}, { timeout: 1000 });
}

function checkWorld() {
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
}

module.exports = { checkWorld, worldData };
if (require.main === module) checkWorld();
