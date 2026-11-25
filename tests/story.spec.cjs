const { test, expect } = require('./fixtures.cjs');

// The story layer (story.js): act openers, voices during a floor, a lead on every floor and the call on the way home.
const on = page => page.evaluate(() => { window.NOSTORY = false; });
const tick = (page, n = 4) => page.evaluate(n => { for (let k = 0; k < n; k++) { G.T = Math.max(G.T, 1); storyTick(0.3, G); } }, n);

test('story data: every floor has voices, every act an opener, lines stay short and stage keys match the stages', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(() => {
    const bad = [], long = [];
    const lines = [];
    STORY.forEach((S, i) => { for (const [k, L] of Object.entries(S.v)) { if (k.startsWith('st_')) { const M = MISSIONS['c' + i]; if (!M.stages.includes(k.slice(3))) bad.push(i + ':' + k); } lines.push(...L); }
      if (S.call) lines.push(...S.call); if (i < CAMPAIGN_LEN - 1 && (!S.lead || !S.call)) bad.push(i + ':lead/call'); });
    for (const A of Object.values(ACTS)) lines.push(...A.lines);
    for (const [w, t] of lines) { if (!SPEAKER[w]) bad.push('who:' + w); if (t.length > 140) long.push(t); }
    return { n: STORY.length, len: CAMPAIGN_LEN, acts: Object.keys(ACTS).map(Number), actStarts: LEVELS.map((l, i) => i).filter(i => i === 0 || (LEVELS[i].act || 1) !== (LEVELS[i - 1].act || 1)), bad, long };
  });
  expect(r.n).toBe(r.len);
  expect(r.acts).toEqual(r.actStarts);
  expect(r.bad).toEqual([]);
  expect(r.long).toEqual([]);
});

test('act opener plays once before the objective card, then the card works as before', async ({ openGame }) => {
  const page = await openGame();
  await on(page);
  const a = await page.evaluate(() => { startLevel(3); return { shown: showObjCard(), state, title: $('acT').textContent, who: $('acWho').textContent, n: $('acLines').children.length }; });
  expect(a).toEqual({ shown: true, state: 'actcard', title: 'SILKS', who: 'LEX "SILKS" STERLING', n: 2 });
  await page.evaluate(() => { ACTCARD.t = 0; actCardGo(); });
  expect(await page.evaluate(() => state)).toBe('objcard');
  // second time round (a retry) goes straight to the card; floors that don't open an act never show it
  expect(await page.evaluate(() => { OBJCARD.t = 0; objCardGo(); startLevel(3); showObjCard(); const s1 = state; OBJCARD.t = 0; objCardGo(); startLevel(4); showObjCard(); return [s1, state]; })).toEqual(['objcard', 'objcard']);
});

test('voices on arrival and when the guards thin out, the lead drops at the last body, pays once, and the call plays on the way home', async ({ openGame }) => {
  test.setTimeout(120_000);
  const page = await openGame();
  await on(page);
  await page.evaluate(() => { startLevel(0); state = 'play'; show(null); });
  await tick(page);
  expect(await page.evaluate(() => ({ who: STORY_RUN.cur && STORY_RUN.cur.who, fired: [...STORY_RUN.fired] }))).toEqual({ who: 'mcwey', fired: ['arrive'] });
  await page.evaluate(() => { const L = G.enemies.filter(e => e.alive); for (let k = 0; k < Math.ceil(L.length / 2); k++) killEnemy(L[k], 'pistol', [0, 1]); });
  await tick(page);
  expect(await page.evaluate(() => STORY_RUN.fired.has('half'))).toBe(true);
  await page.evaluate(() => { for (const e of G.enemies) if (e.alive) killEnemy(e, 'pistol', [0, 1]); G.player.hp = 99; });
  await expect.poll(() => page.evaluate(() => G.cleared), { timeout: 20_000 }).toBe(true);
  await tick(page, 1);
  const l = await page.evaluate(() => ({ lead: !!G.lead, taken: G.lead && G.lead.taken, clear: STORY_RUN.fired.has('clear') }));
  expect(l).toEqual({ lead: true, taken: false, clear: true });
  const p = await page.evaluate(() => { const s0 = G.score; G.player.x = G.lead.x; G.player.z = G.lead.z; storyTick(0.1, G); const s1 = G.score; storyTick(0.1, G); return { paid: s1 - s0, again: G.score - s1, taken: G.lead.taken, saved: !!myProg().story.leads[0] }; });
  expect(p).toEqual({ paid: 300, again: 0, taken: true, saved: true });
  const c = await page.evaluate(() => { finishLevel(); pendingPerks = 0; $('bNextLvl').click(); return { state, text: $('sCall').textContent }; });
  expect(c.state).toBe('call');
  expect(c.text).toContain('Club Flamingo');
  expect(c.text).toContain('YOU TOOK');
  await page.evaluate(() => { CALLCARD.t = 0; callGo(); });
  await expect.poll(() => page.evaluate(() => !fading && !!G.def.hub), { timeout: 20_000 }).toBe(true);
  // the call only plays the first time
  expect(await page.evaluate(() => storyCall(0, () => {}))).toBe(false);
});

test('multi-stage floors speak per stage, and the whole layer stays off when NOSTORY is set', async ({ openGame }) => {
  const page = await openGame();
  await on(page);
  await page.evaluate(() => { startLevel(2); state = 'play'; show(null); });
  await tick(page);
  expect(await page.evaluate(() => ({ sid: G.sid, fired: [...STORY_RUN.fired], who: STORY_RUN.cur && STORY_RUN.cur.who }))).toEqual({ sid: 'lobby', fired: ['st_lobby'], who: 'moreau' });
  await page.evaluate(() => { window.NOSTORY = true; startLevel(0); state = 'play'; show(null); });
  await tick(page);
  expect(await page.evaluate(() => ({ shown: storyOpener(), cur: STORY_RUN.g === G && !!STORY_RUN.cur }))).toEqual({ shown: false, cur: false });
});
