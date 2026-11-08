const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const { test, expect } = require('@playwright/test');

/* weapons.js is DOM-free, so the reload and caliber-room arithmetic is checked without a browser */
const K = vm.runInNewContext(`${readFileSync(resolve(__dirname, '..', 'weapons.js'), 'utf8')}\n;({WD, CAL, kitNew, capOf, reloadNeed, reloadNew, reloadPress, stripRoom, AR_JAM, LOCKER_CAP, SELL_FRAC, ARMOUR, kitStash, kitTake, kitReceive, kitSell, sellValue, normKit, normLocker})`, {}, { timeout: 1000 });

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

/* W6d: every locker move either completes or changes nothing, so an item is never duplicated or lost */
const count = (k, l) => JSON.stringify([...k.guns.filter(Boolean).map(g => g.type), k.melee, k.armour && k.armour.type, ...l.items.map(i => i.type || i.armour)].filter(Boolean).sort());
const locker = items => ({ v: 1, items, lost: [] });

test('locker: stash and take move one item and keep every count', () => {
  const k = K.kitNew(), l = locker([{ type: 'shotgun', mag: 2 }, { type: 'machete' }, { armour: 'carrier', plates: 1 }]);
  k.guns = [{ type: 'pistol', mag: 7 }, { type: 'smg', mag: 30 }]; k.active = 1; k.melee = 'bat'; k.armour = { type: 'vest', plates: 1 };
  const before = count(k, l);
  expect(K.kitTake(k, l, 0)).toBe(true);
  expect(k.guns[1]).toEqual({ type: 'shotgun', mag: 2 });
  expect(l.items[0]).toEqual({ type: 'smg', mag: 30 });
  expect(K.kitTake(k, l, 1)).toBe(true);
  expect(k.melee).toBe('machete');
  expect(K.kitTake(k, l, 2)).toBe(true);
  expect(k.armour).toEqual({ type: 'carrier', plates: 1 });
  expect(l.items[2]).toEqual({ armour: 'vest', plates: 1 });
  expect(count(k, l)).toBe(before);

  expect(K.kitStash(k, l, 1)).toBe(true);
  expect(k.guns[1]).toBe(null);
  expect(k.active).toBe(0);
  expect(K.kitTake(k, l, l.items.length - 1)).toBe(true);
  expect(k.guns[1]).toEqual({ type: 'shotgun', mag: 2 });
  expect(k.active).toBe(1);
  expect(K.kitStash(k, l, 'melee')).toBe(true);
  expect(K.kitStash(k, l, 'melee')).toBe(false);
  expect(count(k, l)).toBe(before);
  expect(K.normKit(JSON.parse(JSON.stringify(k))).lost).toEqual([]);
  expect(K.normLocker(JSON.parse(JSON.stringify(l))).lost).toEqual([]);
});

test('locker: a full locker refuses stashing and deliveries without touching the kit', () => {
  const full = locker(Array.from({ length: K.LOCKER_CAP }, () => ({ type: 'knife' })));
  const k = K.kitNew();
  k.guns = [{ type: 'pistol', mag: 7 }, { type: 'smg', mag: 30 }]; k.melee = 'bat';
  const snap = JSON.stringify(k);
  expect(K.kitStash(k, full, 0)).toBe(false);
  expect(K.kitReceive(k, full, { type: 'shotgun', mag: 6 })).toBe(false);
  expect(K.kitReceive(k, full, { type: 'machete' })).toBe(false);
  expect(JSON.stringify(k)).toBe(snap);
  expect(full.items.length).toBe(K.LOCKER_CAP);
});

test('nine: a purchase fills the kit first, then goes to the locker', () => {
  const k = K.kitNew(), l = locker([]);
  expect(K.kitReceive(k, l, { type: 'pistol', mag: 15 })).toBe('kit');
  expect(K.kitReceive(k, l, { type: 'smg', mag: 30 })).toBe('kit');
  expect(k.guns.map(g => g.type)).toEqual(['pistol', 'smg']);
  expect(k.active).toBe(0);
  expect(K.kitReceive(k, l, { type: 'm16', mag: 30 })).toBe('locker');
  expect(K.kitReceive(k, l, { type: 'bat' })).toBe('kit');
  expect(K.kitReceive(k, l, { type: 'katana' })).toBe('locker');
  expect(K.kitReceive(k, l, { armour: 'vest', plates: 1 })).toBe('kit');
  expect(l.items).toEqual([{ type: 'm16', mag: 30 }, { type: 'katana' }]);
  expect(K.kitReceive(k, l, { type: 'plasma' })).toBe(false);
});

test('nine: selling pays SELL_FRAC and pours the magazine into the pool', () => {
  const k = K.kitNew(), l = locker([{ type: 'revolver', mag: 6 }, { armour: 'vest', plates: 0 }]);
  k.guns = [{ type: 'pistol', mag: 10 }, null]; k.pool['9mm'] = K.capOf(k, '9mm') - 4;
  expect(K.sellValue({ type: 'pistol' }, 1500)).toBe(Math.round(1500 * K.SELL_FRAC));
  expect(K.sellValue({ armour: 'vest', plates: 0 }, K.ARMOUR.vest.price)).toBe(Math.round(Math.round(K.ARMOUR.vest.price * K.SELL_FRAC) / 2));
  expect(K.kitSell(k, l, 'kit', 0)).toEqual({ type: 'pistol', mag: 10 });
  expect(k.guns).toEqual([null, null]);
  expect(k.pool['9mm']).toBe(K.capOf(k, '9mm'));
  expect(K.kitSell(k, l, 'locker', 0).type).toBe('revolver');
  expect(k.pool['357']).toBe(6);
  expect(l.items).toEqual([{ armour: 'vest', plates: 0 }]);
  expect(K.kitSell(k, l, 'kit', 1)).toBe(null);
  expect(K.kitSell(k, l, 'locker', 5)).toBe(null);
});