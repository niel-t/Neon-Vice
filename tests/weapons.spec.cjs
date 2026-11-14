const { test, expect } = require('./fixtures.cjs');

// Weapons overhaul: every gun has a model and real recordings (audio/guns.mp3, CC0), the sprite decodes and holds every
// clip, and a shot sets recoil, a directional muzzle flash and a puff of smoke.
test('weapons: every weapon has a model, every gun has shot/reload/dry clips that exist in the decoded sprite', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(async () => {
    const out = { noModel: [], noSound: [], badClip: [] };
    for (const t of Object.keys(WD)) {
      if (t !== 'fists' && !(WPARTS[t] && WPARTS[t].length)) out.noModel.push(t);
      const wd = WD[t];
      if (wd.melee || wd.toss) continue;
      const S = GUNSND[t];
      if (!S || !S.fire.length || !S.rl.length || !S.dry) { out.noSound.push(t); continue; }
      for (const c of [...S.fire, ...S.rl.map(r => r[1]), S.dry, S.rack].filter(Boolean)) if (!GUNCLIP[c]) out.badClip.push(t + ':' + c);
      if (!(SND_GUN[wd.snd] && SFX[wd.snd])) out.noSound.push(t + ':' + wd.snd);
    }
    const ab = await (await fetch('audio/guns.mp3')).arrayBuffer();
    const buf = await new OfflineAudioContext(1, 44100, 44100).decodeAudioData(ab);
    out.fits = Object.values(GUNCLIP).every(([o, l]) => o + l <= buf.duration + 0.05);
    out.long = buf.duration > 20;
    return out;
  })).toEqual({ noModel: [], noSound: [], badClip: [], fits: true, long: true });
});

test('weapons: a shot kicks the gun, flashes along the barrel and leaves smoke', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    startLevel(0); state = 'pause';
    const p = G.player; p.weapon = { type: 'm16', ammo: 30 }; p.a = Math.PI / 2;
    const n0 = G.parts.length; fireGun(p, p.weapon, true);
    const f = G.flashes[G.flashes.length - 1];
    weaponAnim(p, 'm16'); const kick = WKICK; WKICK = 0;
    const boxes = []; drawFlash({ box: (m, c, em) => boxes.push([m[3], m[11], em]) }, f);
    return { kind: f.k, ahead: f.x > p.x, smoke: G.parts.length - n0 >= 3, kick: kick > 0.3, plumeForward: boxes.some(b => b[0] > f.x + 0.1), glowing: boxes.every(b => b[2]) };
  })).toEqual({ kind: 'r', ahead: true, smoke: true, kick: true, plumeForward: true, glowing: true });
});
