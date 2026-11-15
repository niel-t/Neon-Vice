const { test, expect } = require('./fixtures.cjs');

// 1986 additions: Colt .45, MAC-10, SPAS-12, Mini-14, lever-action .30-30, scoped .30-06 and a golf club.
// Each gun has its own recordings (no shot clip shared with another gun), is on Nine's shelf and can be tried on the range;
// the lever and bolt guns work their action after a shot; later floors hand some guards the new guns, picked without Math.random.
const NEW = ['colt45', 'mac10', 'spas12', 'mini14', 'lever', 'hunter'];
const setup = () => {
  selIdx = 1; const p = myProg();
  p.kit = { v:1, guns:[{ type:'pistol', mag:15 }, null], active:0, melee:null, armour:null, pool:{ '9mm':20 }, upg:{}, lost:[] };
  p.locker = { v:1, items:[], lost:[] }; p.wallet = 50000;
  const a = arm(); a.met = true; a.stock = ['m16', 'katana', 'revolver']; a.key = a.jobs;
};

test('new guns: own recordings, own model, own icon, on Nine\'s shelf, and each one fires on the range', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(([setup, NEW]) => {
    eval('(' + setup + ')')();
    const fade = fadeTo, out = { shared: [], noIcon: [], noModel: [], noPrice: [], fired: {} };
    try {
      fadeTo = f => { f(); return true; };
      const owner = {};
      for (const [t, S] of Object.entries(GUNSND)) for (const c of S.fire) (owner[c] = owner[c] || []).push(t);
      for (const t of [...NEW, 'golf']) {
        if (!WICON[t]) out.noIcon.push(t);
        if (!(WPARTS[t] && WPARTS[t].length > 8)) out.noModel.push(t);
        if (!(SHOPP[t] > 0 && WDESC[t])) out.noPrice.push(t);
        if (GUNSND[t]) for (const c of GUNSND[t].fire) if (owner[c].length > 1) out.shared.push(t + ':' + c);
      }
      out.sounds = NEW.every(t => SND_GUN[WD[t].snd] === t && typeof SFX[WD[t].snd] === 'function');
      out.golfSounds = typeof SFX.swing_golf === 'function' && typeof SFX.hit_golf === 'function';
      loadHub('bunker', 'bunker'); seqSkip();
      openShop();
      const ws = shopRows.filter(q => q.k === 'w').map(q => q.t);
      out.listed = [...NEW, 'golf'].every(t => ws.includes(t));
      for (const t of NEW) {
        if (state !== 'shop') openShop();
        shopSelect(shopRows.findIndex(q => q.t === t));
        if (!$('shTry')) { out.fired[t] = 'no try button'; continue; }
        $('shTry').click(); rangePre(0.016);
        const p = G.player; p.cd = 0; const n = G.bullets.length, a0 = p.weapon && p.weapon.ammo;
        if (p.weapon) fireGun(p, p.weapon, true);
        out.fired[t] = { gun: p.weapon && p.weapon.type, shot: p.weapon && p.weapon.ammo === a0 - 1, pellets: G.bullets.length - n };
        p.z -= 4; rangePre(0.016);
      }
      return out;
    } finally { fadeTo = fade; }
  }, [setup.toString(), NEW])).toEqual({
    shared: [], noIcon: [], noModel: [], noPrice: [], sounds: true, golfSounds: true, listed: true,
    fired: {
      colt45: { gun: 'colt45', shot: true, pellets: 1 }, mac10: { gun: 'mac10', shot: true, pellets: 1 },
      spas12: { gun: 'spas12', shot: true, pellets: 6 }, mini14: { gun: 'mini14', shot: true, pellets: 1 },
      lever: { gun: 'lever', shot: true, pellets: 1 }, hunter: { gun: 'hunter', shot: true, pellets: 1 }
    }
  });
});

test('new guns: the lever swings and the bolt draws back after a shot; the golf club swings like a bat', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    startLevel(0); state = 'pause';
    const p = G.player, out = {};
    const parts = (type, tag) => { const ms = []; const B = { box: m => ms.push(m.slice()), r: 0, tp: 0, uv: 0 };
      drawWeapon(B, A.T(0, 0, 0), type); return WPARTS[type].map((q, i) => q[9] === tag ? ms[i] : null).filter(Boolean); };
    for (const [t, tag] of [['lever', 'l'], ['hunter', 'b']]) {
      p.weapon = { type: t, ammo: WD[t].mag }; p.cd = 0; fireGun(p, p.weapon, true);
      WPUMP = 0; const rest = parts(t, tag);
      G.T = p.pumpAt + (t === 'hunter' ? 0.65 : 0.38); weaponAnim(p, t); const pump = WPUMP;
      const moved = parts(t, tag); WPUMP = 0;
      out[t] = { pump: pump > 0.5, moved: moved.some((m, i) => Math.abs(m[3] - rest[i][3]) + Math.abs(m[7] - rest[i][7]) + Math.abs(m[11] - rest[i][11]) > 0.01) };
    }
    p.weapon = { type: 'golf', ammo: 0 }; p.atkT = 0.1; p.atkDur = 0.22;
    const pose = handPose(p, 'golf', WD.golf, 0, 0); out.golfSwing = !!pose.w && Math.abs(pose.tw) > 0.01;
    return out;
  })).toEqual({ lever: { pump: true, moved: true }, hunter: { pump: true, moved: true }, golfSwing: true });
});

test('new guns: from floor 2 on, some guards carry them, chosen by enemy index so a replay is the same', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    const types = i => { startLevel(i); state = 'pause'; return G.enemies.filter(e => e.weapon).map(e => e.weapon.type); };
    const out = {};
    out.floor1 = types(0).some(t => ['colt45', 'mac10', 'mini14', 'spas12'].includes(t));
    const later = []; for (let i = 1; i < LEVELS.length; i++) later.push(...types(i));
    out.later = ['colt45', 'mac10', 'mini14', 'spas12'].filter(t => later.includes(t)).length >= 3;
    // the pick depends only on the floor and each guard's index: the same guards always get the same guns
    const mk = () => ({ enemies: [0, 1, 2, 3, 4, 5].map(id => ({ id, weapon: { type: 'smg', ammo: 99 } })) });
    const a = mk(), b = mk(); applyArsenal(a, 4); applyArsenal(b, 4);
    out.same = JSON.stringify(a) === JSON.stringify(b) && a.enemies.map(e => e.weapon.type).join() === 'smg,mac10,smg,smg,mac10,smg';
    return out;
  })).toEqual({ floor1: false, later: true, same: true });
});
