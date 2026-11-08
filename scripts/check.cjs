const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

function gameData() {
  const html = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  assert.equal(scripts.length, 1, 'Expected one inline classic game script');
  assert(!/\bsrc\s*=|\btype\s*=\s*["']module/.test(scripts[0][1]), 'Game script must remain inline/classic');
  const source = scripts[0][2];
  new vm.Script(source, { filename: 'index.html inline script' });
  for (const marker of ['/*LEVELS*/', '/*END*/']) {
    assert.equal(source.split(marker).length, 2, `Missing or duplicate ${marker} data marker`);
  }
  const declarations = ['EKIND', 'IKIND', 'FURN', 'FLOORCH', 'PAR', 'LEVEL_TRACKS'].map(name => {
    const match = source.match(new RegExp(`const ${name}=([^;]+);`));
    assert(match, `Missing ${name} declaration`);
    return `const ${name}=${match[1]};`;
  });
  const weapons = source.match(/const WD=([\s\S]*?);\s*const BT=/);
  assert(weapons, 'Missing weapon data boundary');
  const levels = source.split('/*LEVELS*/')[1].split('/*END*/')[0];
  return vm.runInNewContext(`${declarations.join('\n')}\nconst WD=${weapons[1]};\n${levels}
    ({LEVELS, EKIND, IKIND, FURN, FLOORCH, PAR, LEVEL_TRACKS, WD})`, {}, { timeout: 1000 });
}

function expectedMap(def, data) {
  const out = { enemies: 0, items: 0, player: [], car: [] };
  def.map.forEach((row, z) => [...row].forEach((c, x) => {
    if (def.legend?.[c] || c === '#' || c === ' ' || data.FURN[c]) return;
    if (c === 'P' || c === 'C') out[c === 'P' ? 'player' : 'car'].push([x + 1.5, z + 1.5]);
    else if (c in data.EKIND || c === 'X') out.enemies++;
    else if (c in data.IKIND) out.items++;
    else assert(c in data.FLOORCH || ['r', '@', '*', 'D'].includes(c), `${def.name}: unknown map glyph ${c}`);
  }));
  return out;
}

function check() {
  const data = gameData();
  const { LEVELS, PAR, LEVEL_TRACKS, WD } = data;
  const names = ['MOTEL SUNSET', 'CLUB FLAMINGO', 'THE PENTHOUSE', 'VICE MARINA',
    'STARLIGHT ARCADE', 'OCEAN VIEW MALL', 'THE RECORDING STUDIO', 'THE ROYAL FLUSH'];
  assert.equal(LEVELS.length, names.length, 'Review append-only level/save indexes before changing campaign length');
  assert.equal(PAR.length, LEVELS.length);
  assert.equal(LEVEL_TRACKS.length, LEVELS.length);
  for (const type of [...Object.values(data.EKIND), ...Object.values(data.IKIND)]) {
    assert(type === null || WD[type], `Unknown weapon ${type}`);
  }
  LEVELS.forEach((def, i) => {
    assert.equal(def.name, names[i], 'Level indexes are persistent save/story identifiers');
    assert.equal(def.act || 1, i < 3 ? 1 : 2, 'Campaign must retain the 3 + 5 act split');
    assert(def.map.length && def.map.every(row => typeof row === 'string' && row.length), `${def.name}: empty map`);
    assert(PAR[i] > 0 && Number.isFinite(PAR[i]), `${def.name}: invalid par`);
    assert(LEVEL_TRACKS[i].length, `${def.name}: missing music`);
    assert(!def.boss || WD[def.boss.weapon], `${def.name}: unknown boss weapon`);
    const map = expectedMap(def, data);
    assert.equal(map.player.length, 1, `${def.name}: loader needs one player`);
    assert.equal(map.car.length, 1, `${def.name}: loader needs one car/exit`);
    assert(map.enemies > 0, `${def.name}: no combat enemies`);
    console.log(`${i}: ${def.name} (${map.enemies} enemies, ${map.items} items; ragged padding allowed)`);
  });
  for (const [i, glyphs] of [[3, 'Y'], [4, 'ca'], [5, 'ne'], [6, '%!'], [7, 'y']]) {
    for (const glyph of glyphs) assert(LEVELS[i].map.join('').includes(glyph), `Floor ${i}: missing story glyph ${glyph}`);
  }
}

module.exports = { gameData, expectedMap };
if (require.main === module) check();
