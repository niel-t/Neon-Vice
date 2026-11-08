// Validates branching dialogue data (dialogue.js DLG) against roadmap §2.7 and docs/STYLE-DIALOGUE.md.
const assert = require('node:assert/strict');
const vm = require('node:vm');

const CHARS = ['don', 'consigliere', 'money'];
const NODE_KEYS = new Set(['say', 'next', 'choose']);
const OPT_KEYS = new Set(['t', 'say', 'to', 'tone', 'set', 'req']);
const REQ_KEYS = new Set(['has', 'flag', 'noFlag', 'char', 'rel']);
const SET_KEYS = new Set(['rel', 'flag']);
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Returns the resolved variants of a text value, or throws if the shape is wrong.
function variants(v, where) {
  if (typeof v === 'string') return [v];
  assert(isObj(v), `${where}: text must be a string or {don,consigliere,money,_}`);
  const keys = Object.keys(v);
  assert(keys.length && keys.every(k => k === '_' || CHARS.includes(k)), `${where}: unknown text key in ${keys}`);
  assert('_' in v || CHARS.every(c => c in v), `${where}: text needs '_' or all three characters`);
  return keys.map(k => { assert.equal(typeof v[k], 'string', `${where}.${k}: text must be a string`); return v[k]; });
}

// Tokens are linted at their longest expansion; anything else in braces is a typo.
const TOKEN_LEN = { kid: 'partner', car: 'x'.repeat(16), gun: 'x'.repeat(16) };
function lint(raw, max, where, LINT, banned, tokens = LINT.tokens) {
  const text = raw.replace(/\{(\w+)\}/g, (m, k) => { assert(tokens.includes(k), `${where}: unknown token ${m}: "${raw}"`); return TOKEN_LEN[k]; });
  assert(text.trim().length, `${where}: empty text`);
  assert(text.length <= max, `${where}: ${text.length} chars (max ${max}): "${text}"`);
  assert((text.match(/\u2014/g) || []).length <= LINT.maxDash, `${where}: too many em dashes: "${text}"`);
  for (const [word, re] of banned) assert(!re.test(text), `${where}: banned phrase "${word}": "${text}"`);
}

function validateDLG(DLG, WHO, LINT) {
  const banned = LINT.banned.map(w => [w, new RegExp(`(^|\\W)${reEsc(w)}`, 'i')]);
  for (const [id, d] of Object.entries(DLG)) {
    assert(isObj(d) && isObj(d.nodes), `DLG ${id}: needs nodes`);
    assert(d.nodes[d.start], `DLG ${id}: start node ${d.start} missing`);
    const edges = {};
    for (const [n, node] of Object.entries(d.nodes)) {
      const at = `DLG ${id}.${n}`;
      assert(isObj(node), `${at}: node must be an object`);
      for (const k of Object.keys(node)) assert(NODE_KEYS.has(k), `${at}: unknown key ${k}`);
      assert((node.say && node.say.length) || node.choose, `${at}: needs say or choose`);
      assert(!(node.next && node.choose), `${at}: next and choose are exclusive`);
      edges[n] = [];
      (node.say || []).forEach((line, i) => {
        assert(Array.isArray(line) && line.length === 2, `${at}.say[${i}]: expected [speaker, text]`);
        assert(Object.prototype.hasOwnProperty.call(WHO, line[0]), `${at}.say[${i}]: unknown speaker ${line[0]}`);
        for (const t of variants(line[1], `${at}.say[${i}]`)) lint(t, LINT.maxLine, `${at}.say[${i}]`, LINT, banned);
      });
      if (node.next) { assert(d.nodes[node.next], `${at}: next ${node.next} missing`); edges[n].push(node.next); }
      if (!node.choose) continue;
      assert(Array.isArray(node.choose) && node.choose.length <= 9, `${at}: choose must be a list of at most 9 options`);
      assert(node.choose.filter(o => !o.req).length >= 3, `${at}: needs at least 3 ungated options`);
      node.choose.forEach((o, i) => {
        const oa = `${at}.choose[${i}]`;
        assert(isObj(o), `${oa}: option must be an object`);
        for (const k of Object.keys(o)) assert(OPT_KEYS.has(k), `${oa}: unknown key ${k}`);
        for (const t of variants(o.t, `${oa}.t`)) lint(t, LINT.maxOpt, `${oa}.t`, LINT, banned);
        if (o.say !== undefined) for (const t of variants(o.say, `${oa}.say`)) lint(t, LINT.maxLine, `${oa}.say`, LINT, banned);
        if (o.to !== undefined) { assert(d.nodes[o.to], `${oa}: to ${o.to} missing`); edges[n].push(o.to); }
        if (o.req !== undefined) {
          assert(isObj(o.req), `${oa}: req must be an object`);
          for (const [k, v] of Object.entries(o.req)) {
            assert(REQ_KEYS.has(k), `${oa}: unknown req ${k}`);
            if (k === 'rel') assert(isObj(v) && Object.values(v).every(Number.isInteger), `${oa}: req.rel needs integer minimums`);
            else if (k === 'char') assert(CHARS.includes(v), `${oa}: unknown req.char ${v}`);
            else assert(typeof v === 'string' && v, `${oa}: req.${k} must be a string`);
          }
        }
        if (o.set !== undefined) {
          assert(isObj(o.set), `${oa}: set must be an object`);
          for (const [k, v] of Object.entries(o.set)) {
            assert(SET_KEYS.has(k), `${oa}: unknown set ${k}`);
            if (k === 'flag') assert(typeof v === 'string' && v, `${oa}: set.flag must be a string`);
            else assert(isObj(v) && Object.values(v).every(x => x === 1 || x === -1), `${oa}: set.rel steps are +1 or -1 (decision Q-D)`);
          }
        }
      });
    }
    const seen = new Set([d.start]), todo = [d.start];
    while (todo.length) for (const m of edges[todo.pop()]) if (!seen.has(m)) { seen.add(m); todo.push(m); }
    for (const n of Object.keys(d.nodes)) assert(seen.has(n), `DLG ${id}.${n}: unreachable from ${d.start}`);
    // A loop of `next` edges never reaches a choice, so skip-all would spin forever.
    for (const n of Object.keys(d.nodes)) {
      const path = new Set();
      for (let m = n; m; m = d.nodes[m].next) { assert(!path.has(m), `DLG ${id}.${n}: next loop with no choice`); path.add(m); }
    }
  }
  return Object.keys(DLG).length;
}

function selfTest(WHO, LINT) {
  const opt = t => ({ t });
  const ok = { start: 'a', nodes: { a: { say: [['MCWEY', 'Go.']], choose: [opt('One.'), opt('Two.'), { t: 'Three.', to: 'b', set: { rel: { mcwey: 1 } } }, { t: 'Four.', req: { has: 'x' } }] }, b: { say: [['P', { _: 'Fine.' }]] } } };
  validateDLG({ ok }, WHO, LINT);
  const bad = {
    twoOpts: { start: 'a', nodes: { a: { choose: [opt('One.'), opt('Two.'), { t: 'Three.', req: { flag: 'f' } }] } } },
    lostNode: { start: 'a', nodes: { a: { say: [['MCWEY', 'Hi.']] }, b: { say: [['MCWEY', 'Hi.']] } } },
    badTo: { start: 'a', nodes: { a: { choose: [opt('One.'), opt('Two.'), { t: 'Three.', to: 'zz' }] } } },
    speaker: { start: 'a', nodes: { a: { say: [['NOBODY', 'Hi.']] } } },
    banned: { start: 'a', nodes: { a: { say: [['MCWEY', "Here's the thing, kid."]] } } },
    long: { start: 'a', nodes: { a: { say: [['MCWEY', 'x'.repeat(LINT.maxLine + 1)]] } } },
    bigRel: { start: 'a', nodes: { a: { choose: [opt('One.'), opt('Two.'), { t: 'Three.', set: { rel: { mcwey: 2 } } }] } } },
    token: { start: 'a', nodes: { a: { say: [['MCWEY', 'Hi, {kdi}.']] } } },
    halfText: { start: 'a', nodes: { a: { say: [['P', { don: 'Hi.' }]] } } },
    empty: { start: 'a', nodes: { a: {} } },
    nextLoop: { start: 'a', nodes: { a: { say: [['MCWEY', 'Again.']], next: 'b' }, b: { say: [['MCWEY', 'Again.']], next: 'a' } } },
  };
  for (const [name, d] of Object.entries(bad)) assert.throws(() => validateDLG({ [name]: d }, WHO, LINT), undefined, `dlg-check self-test: ${name} should fail`);
}

function checkDialogue(source) {
  const { DLG, DLG_WHO, DLG_LINT, DLG_TOKENS, mcLines } = vm.runInNewContext(`${source}\n;({DLG, DLG_WHO, DLG_LINT, DLG_TOKENS, mcLines})`, {}, { timeout: 1000 }); // dialogue data stays DOM-free
  const LINT = { ...DLG_LINT, tokens: DLG_TOKENS };
  selfTest(DLG_WHO, LINT);
  const n = validateDLG(DLG, DLG_WHO, LINT);
  // McWey's visit lines outside DLG may also carry the {car}/{gun} tokens that talkMcWey fills in.
  const banned = LINT.banned.map(w => [w, new RegExp(`(^|\\W)${reEsc(w)}`, 'i')]);
  const lines = mcLines();
  lines.forEach((t, i) => { assert.equal(typeof t, 'string', `mcLines[${i}]: not a string`); lint(t, LINT.maxLine, `mcLines[${i}]`, LINT, banned, [...DLG_TOKENS, 'car', 'gun']); });
  console.log(`dialogue: ${n} DLG conversations and ${lines.length} McWey lines valid`);
}

module.exports = { validateDLG, checkDialogue };
if (require.main === module) checkDialogue(require('node:fs').readFileSync(require('node:path').resolve(__dirname, '..', 'dialogue.js'), 'utf8'));
