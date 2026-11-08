const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

const read = f => readFileSync(resolve(__dirname, '..', f), 'utf8');
function missionData() {
  return vm.runInNewContext(`${read('levels.js')}\n;\n${read('missions.js')}\n;({LEVELS, CAMPAIGN_LEN, MISSIONS, missionIdx, missionStart, missionStage})`, {}, { timeout: 1000 });
}

// MISSIONS v1 (roadmap 2.4): campaign ids/indexes are save identifiers; every reference must resolve and nothing may be unreachable.
function checkMissions() {
  const { LEVELS, CAMPAIGN_LEN, MISSIONS, missionIdx, missionStart, missionStage } = missionData();
  assert.equal(CAMPAIGN_LEN, 8, 'CAMPAIGN_LEN is a save identifier range: review index-keyed saves before changing it');
  assert.equal(LEVELS.length, CAMPAIGN_LEN, 'Every campaign mission wraps one level');
  const ids = Object.keys(MISSIONS);
  for (let i = 0; i < CAMPAIGN_LEN; i++) {
    const m = MISSIONS['c' + i];
    assert(m, `Missing campaign mission c${i}`);
    assert.equal(m.kind, 'campaign', `c${i}: campaign kind`);
    assert.equal(m.idx, i, `c${i}: idx must equal its id`);
    assert.equal(missionIdx('c' + i), i);
  }
  for (const id of ids) {
    const m = MISSIONS[id];
    assert(/^[a-z][a-z0-9_]*$/.test(id), `${id}: mission ids are lower-case identifiers`);
    assert(!(id in Object.prototype), `${id}: shadows an Object.prototype name`);
    assert(['campaign', 'bonus', 'story', 'side'].includes(m.kind), `${id}: unknown kind ${m.kind}`);
    if (m.kind === 'campaign') assert(/^c\d+$/.test(id) && m.idx < CAMPAIGN_LEN, `${id}: campaign missions are c0..c${CAMPAIGN_LEN - 1}`);
    else {
      assert(!/^c\d+$/.test(id), `${id}: cN ids are reserved for the campaign`);
      assert.equal(m.idx, undefined, `${id}: only campaign missions have an index`);
      assert(typeof m.name === 'string' && m.name, `${id}: needs a name`);
    }
    assert(Array.isArray(m.stages) && m.stages.length, `${id}: no stages`);
    assert(m.stages.every(s => typeof s === 'string' && s), `${id}: stage ids are strings`);
    assert.equal(new Set(m.stages).size, m.stages.length, `${id}: duplicate stage`);
    assert(m.stages.includes(m.start), `${id}: start ${m.start} is not one of its stages`);
    assert.equal(missionStart(id), m.start);
    assert.equal(missionStage(id, m.start), m.start);
    assert.equal(missionStage(id, 'no such stage'), m.start);
    if (m.stages.includes('legacy')) {
      const base = m.kind === 'campaign' ? m.idx : m.base;
      assert(Number.isInteger(base) && LEVELS[base], `${id}: a legacy stage needs a campaign level (idx or base)`);
    }
  }
  assert.equal(missionIdx('nope'), -1);
  assert.equal(missionStart('nope'), null);
  assert.equal(missionStart('toString'), null, 'Prototype keys are not missions');
  assert.equal(missionStage('toString', 'legacy'), null);
}

module.exports = { checkMissions, missionData };
if (require.main === module) checkMissions();
