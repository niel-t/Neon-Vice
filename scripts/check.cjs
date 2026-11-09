const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const { files } = require('./build.cjs');

function gameData() {
  const html = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const order = ['art.js', 'levels.js', 'world.js', 'plan.js', 'plans/motel.js', 'plans/penthouse.js', 'mesh.js', 'missions.js', 'models.js', null, 'renderer.js', 'weapons.js', 'ai.js', 'cover.js', 'dialogue.js', 'overworld.js', null];
  assert.equal(scripts.length, order.length, 'Expected ordered assets followed by the inline classic game script');
  scripts.forEach((script, i) => assert.equal(script[1].trim(), order[i] ? `src="${order[i]}"` : '', 'Scripts must retain synchronous classic loading order'));
  const sources = scripts.map((script, i) => {
    const src = script[1].match(/\bsrc="([^"]+)"/)?.[1];
    let source = script[2];
    if (src) {
      assert(/^(plans\/)?[a-z0-9_-]+\.js$/.test(src), 'Runtime scripts must use local bare filenames (plans/ for level plans)');
      assert(files.includes(src), `${src} is missing from the production allowlist`);
      assert.equal(source.trim(), '', 'External scripts must not contain inline code');
      source = readFileSync(resolve(__dirname, '..', src), 'utf8');
    }
    assert(source.trimStart().startsWith("'use strict';"), 'Every classic script must preserve strict mode');
    new vm.Script(source, { filename: src || `index.html inline script ${i}` });
    return source;
  });
  const source = sources.join('\n;\n');
  new vm.Script(source, { filename: 'ordered classic game scripts' });
  assert(sources.slice(1).every(source => !source.includes('const ART=')), 'Embedded artwork must remain in art.js');
  assert(sources[1].includes('/*LEVELS*/') && sources[1].includes('/*END*/'), 'Campaign markers must remain in levels.js');
  vm.runInNewContext(sources[1], {}, { timeout: 1000 });
  vm.runInNewContext(sources.slice(1, order.indexOf('missions.js') + 1).join('\n;\n'), {}, { timeout: 5000 }); // levels, world, plan, plans, mesh, missions stay DOM/GL-free
  for (const marker of ['/*LEVELS*/', '/*END*/']) {
    assert.equal(source.split(marker).length, 2, `Missing or duplicate ${marker} data marker`);
  }
  const declarations = ['EKIND', 'IKIND', 'FURN', 'FLOORCH', 'PAR', 'LEVEL_TRACKS'].map(name => {
    const match = source.match(new RegExp(`const ${name}=([^;]+);`));
    assert(match, `Missing ${name} declaration`);
    return `const ${name}=${match[1]};`;
  });
  const weaponsSource = sources[order.indexOf('weapons.js')];
  const weapons = vm.runInNewContext(`${weaponsSource}\n;({WD, BT, CAL, ARMOUR})`, {}, { timeout: 1000 }); // weapon data stays DOM/GL-free
  const cover = vm.runInNewContext(`${sources[order.indexOf('cover.js')]}\n;({STANCE})`, {}, { timeout: 1000 }); // cover logic stays DOM/GL-free
  assert(cover.STANCE.crouch.eye < cover.STANCE.stand.eye && cover.STANCE.crouch.top < cover.STANCE.stand.top, 'Crouch must lower eye and top');
  const levels = source.split('/*LEVELS*/')[1].split('/*END*/')[0];
  const data = vm.runInNewContext(`${declarations.join('\n')}\n${levels}
    ({LEVELS, EKIND, IKIND, FURN, FLOORCH, PAR, LEVEL_TRACKS})`, {}, { timeout: 1000 });
  return { ...data, ...weapons };
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
  require('./world-check.cjs').checkWorld();
  require('./plan-check.cjs').checkPlans();
  require('./decor-check.cjs').checkDecorKits();
  require('./mesh-check.cjs').checkMesh();
  require('./ballistics-check.cjs').checkBallistics();
  require('./missions-check.cjs').checkMissions();
  require('./ai-check.cjs').checkAI();
  require('./dlg-check.cjs').checkDialogue(readFileSync(resolve(__dirname, '..', 'dialogue.js'), 'utf8'));
  require('./cover-check.cjs').checkCover();
  const data = gameData();
  const { LEVELS, PAR, LEVEL_TRACKS, WD, CAL, ARMOUR } = data;
  for (const [id, c] of Object.entries(CAL)) {
    for (const k of ['box', 'price', 'cap', 'up']) assert(Number.isInteger(c[k]) && c[k] > 0, `Caliber ${id}: invalid ${k}`);
  }
  for (const [id, a] of Object.entries(ARMOUR)) {
    assert(Number.isInteger(a.plates) && a.plates > 0 && a.price > 0 && a.repair > 0, `Armour ${id}: invalid data`);
  }
  for (const [type, w] of Object.entries(WD)) {
    if (w.melee) { assert(w.cal === undefined && w.mag === undefined, `${type}: melee weapons have no ammo`); continue; }
    assert(Number.isInteger(w.mag) && w.mag > 0, `${type}: invalid magazine`);
    if (w.toss) { assert(w.cal === null, `${type}: thrown weapons have no caliber`); continue; }
    assert(CAL[w.cal], `${type}: unknown caliber ${w.cal}`);
    assert(w.rl > 0 && Array.isArray(w.ar) && w.ar[0] > 0 && w.ar[1] > 0 && w.ar[0] + w.ar[1] < 1, `${type}: invalid reload`);
    assert(!w.base || WD[w.base], `${type}: unknown base weapon`);
  }
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
