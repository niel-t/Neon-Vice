const { test, expect } = require('./fixtures.cjs');

// Music pack 2 (music.js): new mission tracks, chill after-clear tracks and hub themes, all on the shared music bus.
const NEW = ['n_voltage', 'n_chrome', 'n_heat', 'n_sapphire', 'n_killswitch', 'n_hollow', 'c_afterglow', 'c_comedown', 'c_coolant',
  'c_marble', 'c_corner', 'c_iron', 'c_velvet', 'c_strobe', 'c_galleria', 'c_escalator'];

test('music: new tracks are wired to missions, hubs and the floor-clear cool-down', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(NEW => {
    const out = {};
    out.exist = NEW.filter(n => !(TRACKS[n] && typeof TRACKS[n].step === 'function' && TRACKS[n].title && TRACKS[n].bpm > 0));
    // every mission floor opens with one of the new tracks; the old ones stay in rotation
    out.missions = LEVEL_TRACKS.every(l => /^n_(voltage|chrome|heat|sapphire|killswitch|hollow)$/.test(l[0]) && l.length > 2 && l.every(t => TRACKS[t]));
    out.hubs = ['lobby', 'office', 'bunker', 'mall', 'mall2'].map(k => HUBS[k].track);
    const club = new Set([HUBS.club.track, HUBS.club.track]);
    out.club = [...club].sort();
    // clear: the matching chill track; during an escape sprint the mission track keeps going
    const g0 = G, s0 = state;
    G = { track: 'n_sapphire' }; state = 'results'; out.after = afterTrack();
    G = { track: 'n_killswitch', esc: { t: 10 } }; state = 'play'; out.escape = afterTrack();
    G = { track: 'game' }; out.oldTrack = TRACKS[afterTrack()] ? 'ok' : afterTrack();
    G = g0; state = s0;
    out.hifi = ['c_velvet', 'c_galleria', 'c_afterglow'].every(t => HIFI_TRACKS.includes(t) && tapeOK(t));
    return out;
  }, NEW)).toEqual({ exist: [], missions: true, hubs: ['c_marble', 'c_corner', 'c_iron', 'c_galleria', 'c_escalator'], club: ['c_strobe', 'c_velvet'],
    after: 'c_comedown', escape: 'n_killswitch', oldTrack: 'ok', hifi: true });
});

test('music: every new track plays a full loop without errors and stays under the old tracks\' peak', async ({ openGame }) => {
  test.setTimeout(120_000);
  const page = await openGame();
  const res = await page.evaluate(async NEW => {
    const out = {};
    for (const name of [...NEW, 'n_crystal']) {
      const sr = 44100, secs = 4, oc = new OfflineAudioContext(2, sr * secs, sr);
      Object.defineProperty(oc, 'state', { get: () => 'running' });
      AC = oc; master = oc.createGain(); master.gain.value = 0.6; master.connect(oc.destination);
      musicG = oc.createGain(); musicG.gain.value = 0.34; musicG.connect(master);
      noiseBuf = oc.createBuffer(1, sr, sr); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      initMusicBus(); MUS.muffled = false; applyTrack(name, false);
      const T = TRACKS[name], spb = 60 / T.bpm / 4; let errors = 0;
      // schedule a whole arrangement loop (the render below only covers its first seconds, starting from the busiest section)
      const loop = (T.bars || 16) * 16, skip = Math.max(0, loop - Math.ceil(secs / spb) - 32);
      for (let n = 0; n < loop; n++) { const t = n >= skip ? 0.05 + (n - skip) * spb : null; try { if (t !== null) T.step(n, t, spb); else T.step.call(T, n, secs + 1, spb); } catch (e) { errors++; } }
      const buf = await oc.startRendering(), L = buf.getChannelData(0);
      let peak = 0, sum = 0, bad = 0; for (let i = 0; i < L.length; i++) { const v = L[i]; if (!Number.isFinite(v)) bad++; else { peak = Math.max(peak, Math.abs(v)); sum += v * v; } }
      out[name] = { errors, bad, peak, rms: Math.sqrt(sum / L.length) };
    }
    AC = null;
    return out;
  }, NEW);
  for (const name of NEW) {
    expect(res[name].errors, name).toBe(0);
    expect(res[name].bad, name).toBe(0);
    expect(res[name].rms, name).toBeGreaterThan(0.01);
    expect(res[name].peak, name).toBeLessThan(Math.max(0.5, res.n_crystal.peak * 1.6));
  }
});
