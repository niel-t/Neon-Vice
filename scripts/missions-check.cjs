const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

const read = f => readFileSync(resolve(__dirname, '..', f), 'utf8');
function missionData() {
  return vm.runInNewContext(`${read('levels.js')}\n;\n${read('missions.js')}\n;({LEVELS, CAMPAIGN_LEN, MISSIONS, missionIdx, missionStart, missionStage, missionBase, condOK, missionVariant, missionClear, missionBriefReset})`, {}, { timeout: 1000 });
}
// every flag a dialogue choice can set (set.flag anywhere in DLG)
function dialogueFlags() {
  const { DLG } = vm.runInNewContext(`${read('dialogue.js')}\n;({DLG})`, {}, { timeout: 1000 });
  const out = new Set(), walk = o => { if (!o || typeof o !== 'object') return; if (o.set && typeof o.set.flag === 'string') out.add(o.set.flag); Object.values(o).forEach(walk); };
  walk(DLG);
  return out;
}
const COND_KEYS = ['all', 'any', 'not', 'done', 'flag', 'has'];
function checkCond(c, where, MISSIONS, refs) {
  if (c === undefined) return;
  assert(c && typeof c === 'object' && !Array.isArray(c), `${where}: a condition is an object`);
  const keys = Object.keys(c);
  assert.equal(keys.length, 1, `${where}: a condition has exactly one of ${COND_KEYS.join('/')}`);
  const [k] = keys, v = c[k];
  assert(COND_KEYS.includes(k), `${where}: unknown condition ${k}`);
  if (k === 'all' || k === 'any') { assert(Array.isArray(v) && v.length, `${where}.${k}: non-empty list`); v.forEach((x, i) => checkCond(x, `${where}.${k}[${i}]`, MISSIONS, refs)); }
  else if (k === 'not') checkCond(v, `${where}.not`, MISSIONS, refs);
  else {
    assert(typeof v === 'string' && v, `${where}.${k}: a non-empty string`);
    if (k === 'done') assert(Object.prototype.hasOwnProperty.call(MISSIONS, v), `${where}: done:${v} is not a mission`);
    if (k === 'has') assert.fail(`${where}: has:${v} needs COLLECT (W14c), which does not exist yet`);
    if (k === 'flag') refs.add(v);
  }
}
const condFlags = (c, out = new Set()) => { if (c && typeof c === 'object') { if (typeof c.flag === 'string') out.add(c.flag); Object.values(c).forEach(x => condFlags(x, out)); } return out; };

// MISSIONS v1 (roadmap 2.4): campaign ids/indexes are save identifiers; every reference must resolve and nothing may be unreachable.
function checkMissions() {
  const { LEVELS, CAMPAIGN_LEN, MISSIONS, missionIdx, missionStart, missionStage, missionBase, condOK, missionVariant, missionClear, missionBriefReset } = missionData();
  // flags the game itself sets outside dialogue (payout in index.html): lex_spared when you spare Lex on the Royal Flush
  const dlgFlags = new Set([...dialogueFlags(), 'lex_spared']), briefFlags = new Set(), rewardFlags = new Set();
  assert.equal(CAMPAIGN_LEN, 11, 'CAMPAIGN_LEN is a save identifier range: review index-keyed saves before changing it');
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
    assert.deepEqual({ ...missionStage(id, m.start) }, { stage: m.start, keep: true });
    const legacyOnly = m.stages.length === 1 && m.stages[0] === 'legacy';
    assert.deepEqual({ ...missionStage(id, 'no such stage') }, { stage: m.start, keep: legacyOnly }, `${id}: a vanished stage keeps the kit only on an unmigrated mission`);
    if (m.stages.includes('legacy')) {
      const base = m.kind === 'campaign' ? m.idx : m.base;
      assert(Number.isInteger(base) && LEVELS[base], `${id}: a legacy stage needs a campaign level (idx or base)`);
    }
    assert(m.rev === undefined || Number.isInteger(m.rev) && m.rev > 0, `${id}: rev is a positive integer`);
    if (m.kind === 'campaign') assert(m.unlock === undefined && m.rewards === undefined, `${id}: campaign missions unlock in order and pay through payout()`);
    const refs = new Set();
    checkCond(m.unlock, `${id}.unlock`, MISSIONS, refs);
    for (const r of m.rewards || []) { assert(r && typeof r.flag === 'string' && r.flag, `${id}: rewards are {flag}`); rewardFlags.add(r.flag); }
    for (const f of m.briefFlags || []) { assert(typeof f === 'string' && dlgFlags.has(f), `${id}: brief flag ${f} is not set by any dialogue choice`); briefFlags.add(f); }
    const grid = LEVELS[missionBase(id)].map;
    for (const [v, d] of Object.entries(m.variants || {})) {
      assert(/^[a-z][a-z0-9_]*$/.test(v) && v !== 'base', `${id}.${v}: variant ids are identifiers (not 'base'; '.' would break best keys)`);
      assert(Object.keys(d).every(k => ['when', 'spawn', 'clear'].includes(k)), `${id}.${v}: variants may set only when/spawn/clear`);
      assert(d.when, `${id}.${v}: a variant needs a when condition`);
      checkCond(d.when, `${id}.${v}.when`, MISSIONS, refs);
      if (d.spawn) {
        const [x, z] = d.spawn, row = grid[z];
        assert(Number.isInteger(x) && Number.isInteger(z) && row && row[x] !== undefined && !'#'.includes(row[x]), `${id}.${v}: spawn [${x},${z}] is not an open cell of ${LEVELS[missionBase(id)].name}`);
      }
      if (d.clear) assert(['required', 'optional'].includes(missionClear(id, v).boss), `${id}.${v}: clear.boss`);
    }
    assert(['required', 'optional'].includes(missionClear(id, 'base').boss), `${id}: clear.boss is required|optional`);
    assert(!m.clear || Object.keys(m.clear).every(k => k === 'boss'), `${id}: clear supports only boss`);
    for (const f of refs) assert(dlgFlags.has(f) || [...Object.values(MISSIONS)].some(q => (q.rewards || []).some(r => r.flag === f)), `${id}: flag ${f} is never set`);
  }
  // brief flags are reset whenever their brief replays, so they may pick variants but never gate an unlock
  for (const id of ids) for (const f of condFlags(MISSIONS[id].unlock)) assert(!briefFlags.has(f), `${id}: unlock reads brief flag ${f}`);
  for (const f of briefFlags) assert(!rewardFlags.has(f), `${f}: a brief flag cannot also be a reward`);
  // nothing stranded: replay the campaign in order, then unlock missions until a fixpoint, treating every reachable flag as set and not() as satisfiable
  const done = new Set(), flags = new Set(dlgFlags), ctx = { done: x => done.has(x), flag: f => flags.has(f), has: () => true };
  const optimistic = c => c == null || (c.not !== undefined ? true : c.all ? c.all.every(optimistic) : c.any ? c.any.some(optimistic) : condOK(c, ctx));
  for (let grew = true; grew;) {
    grew = false;
    for (const id of ids) if (!done.has(id) && (MISSIONS[id].kind === 'campaign' || optimistic(MISSIONS[id].unlock))) {
      done.add(id); grew = true; for (const r of MISSIONS[id].rewards || []) flags.add(r.flag);
    }
  }
  const stranded = ids.filter(id => !done.has(id));
  assert.deepEqual(stranded, [], `Missions that can never unlock: ${stranded.join(', ')}`);
  // runtime helpers
  assert.equal(missionVariant('c1', { flag: f => f === 'flamingo_back', done: () => false, has: () => false }), 'back');
  assert.equal(missionVariant('c1', { flag: () => false, done: () => false, has: () => false }), 'base');
  const wf = { flamingo_back: 1, keep: 1 };
  assert.equal(missionBriefReset('c1', wf), true);
  assert.deepEqual(wf, { keep: 1 });
  assert.equal(missionIdx('nope'), -1);
  assert.equal(missionStart('nope'), null);
  assert.equal(missionStart('toString'), null, 'Prototype keys are not missions');
  assert.equal(missionStage('toString', 'legacy'), null);
  // floor 2 used to be one map: runs saved there resume in the lobby with their kit, minus the old map's checkpoint
  for (const st of ['legacy', 's1', undefined]) assert.deepEqual({ ...missionStage('c2', st) }, { stage: 'lobby', keep: true, moved: true }, `c2 run saved at ${st}`);
}

module.exports = { checkMissions, missionData };
if (require.main === module) checkMissions();
