const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const { test, expect } = require('@playwright/test');

/* weapons.js is DOM-free, so the reload and caliber-room arithmetic is checked without a browser */
const K = vm.runInNewContext(`${readFileSync(resolve(__dirname, '..', 'weapons.js'), 'utf8')}\n;({WD, CAL, kitNew, capOf, reloadNeed, reloadNew, reloadPress, stripRoom, AR_JAM})`, {}, { timeout: 1000 });

test('reload: tops the magazine up from the pool, never past either', () => {
  expect(K.reloadNeed('pistol', 3, 100)).toBe(12);
  expect(K.reloadNeed('pistol', 3, 5)).toBe(5);
  expect(K.reloadNeed('pistol', 15, 100)).toBe(0);
  expect(K.reloadNeed('pistol', 0, 0)).toBe(0);
  expect(K.reloadNeed('bat', 0, 100)).toBe(0);
  expect(K.reloadNeed('tknife', 0, 100)).toBe(0);
});

test('reload: one press in the active window finishes it; anywhere else jams and locks', () => {
  const w = K.WD.revolver, r = K.reloadNew('revolver');
  expect(r).toEqual({ t: 0, dur: w.rl, ar0: w.ar[0] * w.rl, ar1: (w.ar[0] + w.ar[1]) * w.rl, tried: false, jam: false });
  r.t = (r.ar0 + r.ar1) / 2;
  expect(K.reloadPress(r)).toBe('hit');
  expect(K.reloadPress(r)).toBe('locked');

  const j = K.reloadNew('revolver');
  j.t = j.ar0 / 2;
  expect(K.reloadPress(j)).toBe('jam');
  expect(j.jam).toBe(true);
  expect(j.dur).toBeCloseTo(j.t + (w.rl - j.t) * K.AR_JAM, 9);
  j.t = (j.ar0 + j.ar1) / 2;
  expect(K.reloadPress(j)).toBe('locked');
});

test('reload: every caliber gun has a window that ends before the reload does', () => {
  for (const [type, w] of Object.entries(K.WD)) {
    if (w.melee || !(w.cal in K.CAL)) continue;
    const r = K.reloadNew(type);
    expect(r.ar0, type).toBeGreaterThan(0);
    expect(r.ar1, type).toBeLessThan(r.dur);
  }
});

test('stripping: room is what the caliber capacity (with upgrades) leaves free', () => {
  const k = K.kitNew();
  const cap = K.capOf(k, '9mm');
  expect(K.stripRoom(k, '9mm')).toBe(cap);
  k.pool['9mm'] = cap - 4;
  expect(K.stripRoom(k, '9mm')).toBe(4);
  k.upg['9mm'] = 1;
  expect(K.stripRoom(k, '9mm')).toBe(4 + K.CAL['9mm'].up);
  expect(K.stripRoom(k, null)).toBe(0);
  expect(K.stripRoom(k, 'plasma')).toBe(0);
});
