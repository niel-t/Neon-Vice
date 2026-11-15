const { test, expect } = require('./fixtures.cjs');

// Backstories (docs/BACKSTORIES.md) surface in talk: each operator hears his own lines, never another's.
test('backstory: people around town and McWey talk about the operator you picked', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(() => {
    const out = {};
    for (let i = 0; i < CHARS.length; i++) {
      selIdx = i; const id = CHARS[i].id;
      const lines = Object.keys(STORY_CHAT).flatMap(k => storyChat(k));
      const others = CHARS.filter(c => c.id !== id).flatMap(c => Object.values(STORY_CHAT).flatMap(S => S[c.id] || []));
      const mornings = MORNING.filter(m => !m.need || m.need()).map(m => m.who);
      const brief0 = DLG.brief0.nodes.a.choose.filter(o => !o.req || o.req.char === id).length;
      out[id] = { n: lines.length, leak: lines.filter(l => others.includes(l)).length, mornings, brief0, file: !!CHARS[i].bio };
    }
    // storyPick prefers an unheard story line 60% of the time; pin the roll so the check doesn't depend on chance.
    STORY_HEARD.clear(); selIdx = 2;
    const rnd = Math.random; Math.random = () => 0;
    const first = storyPick('lawyer', ['old line']);
    Math.random = rnd;
    return { out, first, heard: STORY_HEARD.has(first) };
  });
  for (const id of ['don', 'consigliere', 'money']) {
    expect(r.out[id].n).toBeGreaterThan(10);
    expect(r.out[id].leak).toBe(0);
    expect(r.out[id].file).toBe(true);
    expect(r.out[id].brief0).toBe(4);
  }
  expect(r.out.don.mornings).toContain('A LETTER FROM PROVIDENCE');
  expect(r.out.don.mornings).not.toContain('A FEDERAL ENVELOPE');
  expect(r.out.money.mornings).toContain('A FEDERAL ENVELOPE');
  expect(r.out.consigliere.mornings).toContain('A POSTCARD FROM PHILADELPHIA');
  expect(r.first).toContain('Benedetti');
  expect(r.heard).toBe(true);
});
