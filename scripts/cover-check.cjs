const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

// '#' wall, 'B' low cover (1.0 m), 'H' high cover (1.8 m), 'S' non-cover furniture, '.' floor
function grid(rows) {
  const at = (x, z) => (rows[z] && rows[z][x]) || '#';
  return {
    h: (x, z) => ({ '#': 3, B: 1.0, H: 1.8 })[at(x, z)] || 0,
    walk: (x, z) => at(x, z) === '.',
  };
}

function checkCover() {
  const calls = [];
  let losOK = () => true;
  const sb = { G: null, WORLD: {
    sight: (...a) => (calls.push(['sight', ...a]), { clear: true }),
    cell: { los: (g, ...a) => (calls.push(['los', ...a]), losOK(...a)) },
  } };
  const { STANCE, coverFind, coverStep, COVER_END,   COVER_PEEK, stanceSight, coverShotY, playerSeenBy, playerHitPoints, playerAimPoint } = vm.runInNewContext(`${readFileSync(resolve(__dirname, '..', 'cover.js'), 'utf8')}
      ;({STANCE, coverFind, coverStep, COVER_END, COVER_PEEK, stanceSight, coverShotY, playerSeenBy, playerHitPoints, playerAimPoint})`, sb, { timeout: 1000 });
  const step = (cv, q, x, z, m = [0, 0], aim = [0, -1], fired = false) => coverStep(cv, q, x, z, m[0], m[1], aim[0], aim[1], fired, 1 / 60);

  // A bar run x=2..4 at z=2 with an open end at x=5 and a wall at x=1.
  const bar = grid([
    '########',
    '#......#',
    '#.BBB..#',
    '#......#',
    '#......#',
    '########',
  ]);
  const cv = coverFind(bar, 3.5, 3.6, 0.28, 0, -1);
  assert(cv && cv.ax === 'z' && cv.s === -1 && cv.face === 3, 'Bar face north of the player');
  assert.equal(cv.lo, 2); assert.equal(cv.hi, 5);
  assert(cv.openHi && cv.openLo, 'Both bar ends are open floor');
  assert(Math.abs(cv.u - 3.3) < 1e-9, 'Snap flush to the face');
  let s = step(cv, bar, 3.5, 3.6);
  assert(s && s.kind === 'low' && s.crouch && s.eye.y === STANCE.crouch.eye, 'Low cover crouches');
  assert(s.vn < 0, 'Spring pulls the player onto the face');
  s = step(cv, bar, 3.5, 3.3, [0, 0], [0, -1], true);
  assert(!s.crouch && s.eye.y === STANCE.stand.eye, 'Firing pops up');
  assert(step(cv, bar, 3.5, 3.3).crouch === false, 'Pop-up lingers after firing');
  assert(step(cv, bar, 3.5, 3.3, [1, 0]).t === 1, 'Moving slides along the run');
  assert.equal(step(cv, bar, 5 - COVER_END, 3.3, [1, 0]).t, 0, 'Run end stops the slide');
  assert.equal(step(cv, bar, 3.5, 3.3, [0, 1]), null, 'Pulling away leaves cover');
  assert.equal(coverFind(bar, 3.5, 3.6, 0.28, 0, 1), null, 'Nothing to hug facing away from the bar');
  assert.equal(coverFind(bar, 6.5, 3.6, 0.28, 0, -1), null, 'Open floor is not cover');
  // No direction: nearest face wins.
  assert.equal(coverFind(bar, 3.5, 3.4, 0.28, 0, 0).face, 3);

  // High wall with a doorway gap at x=4 (wall at x=1..3 and x=5..6, z=2).
  const wall = grid([
    '########',
    '#......#',
    '####.###',
    '#......#',
    '#......#',
    '########',
  ]);
  const w = coverFind(wall, 3.5, 3.4, 0.28, 0, -1);
  assert(w && w.lo === 1 && w.hi === 4 && w.openHi && !w.openLo, 'Wall run ends at the doorway; the corner end is closed');
  s = step(w, wall, 3.7, 3.3, [0, 0], [0.3, -1]);
  assert(s.kind === 'high' && !s.crouch && s.lean === 1, 'Doorway edge leans when aiming across the wall');
  assert(Math.abs(s.eye.x - (4 + COVER_PEEK)) < 1e-9 && Math.abs(s.eye.z - 3.3) < 1e-9, 'Lean eye sits past the corner');
  assert.equal(step(w, wall, 2.5, 3.3, [0, 0], [0.3, -1]).lean, 0, 'No lean away from the edge');
  assert.equal(step(w, wall, 3.7, 3.3, [0, 0], [-1, 0]).lean, 0, 'No lean when aiming back along the wall');
  assert.equal(step(w, wall, 1.3, 3.3, [0, 0], [-0.3, -1]).lean, 0, 'Closed corner never leans');

  // High furniture classifies as high; non-cover furniture blocks the probe.
  const shelf = grid(['#####', '#.H.#', '#...#', '#####']);
  assert.equal(step(coverFind(shelf, 2.5, 2.4, 0.28, 0, -1), shelf, 2.5, 2.3).kind, 'high');
  const sofa = grid(['#####', '#.B.#', '#.S.#', '#...#', '#####']);
  assert.equal(coverFind(sofa, 2.5, 3.4, 0.28, 0, -1), null, 'Cannot hug cover through a sofa');

  // W7b stance hooks
  const crouched = { x: 3, z: 3, stance: 'crouch', eye: { x: 3, z: 3, y: 1 } };
  assert.equal(coverShotY(1.3, crouched), STANCE.crouch.aim, 'Shots at a crouched target trace low');
  assert.equal(coverShotY(1.3, { stance: 'stand' }), 1.3, 'Standing targets keep the muzzle height');
  assert.equal(coverShotY(1.3, null), 1.3, 'No target keeps the muzzle height');
  stanceSight('st', 1, 1, 1.6, crouched);
  assert.deepEqual(calls.pop(), ['sight', 'st', 1, 1, 3, 3, 1.6, STANCE.crouch.top], 'Crouched sight uses the crouch top');
  sb.G = { player: { x: 4, z: 5 } };
  assert.equal(playerSeenBy({ x: 1, z: 1 }), true);
  assert.deepEqual(calls.pop(), ['los', 1, 1, 4, 5], 'No eye set: fall back to the body');
  sb.G.player.eye = { x: 4.5, z: 4.8, y: 1.6 };
  playerSeenBy({ x: 1, z: 1 });
  assert.deepEqual(calls.pop(), ['los', 1, 1, 4.5, 4.8], 'Leaning: sight targets the lean eye');

  // Lean is two-way (Astra CP2 repro, Motel Sunset): body (22.3,6.7) behind the corner, lean point (22.3,7.22), enemy (19.3,7.22)
  const lp = { x: 22.3, z: 6.7, r: 0.28, eye: { x: 22.3, z: 7.22, y: 1.6 }, cs: { lean: true } };
  const en = { x: 19.3, z: 7.22 };
  sb.G = { player: lp };
  losOK = (x0, z0, x1, z1) => !(x1 === lp.x && z1 === lp.z); // the wall hides the body only
  const hp = playerHitPoints(lp);
  assert.equal(hp.length, 2, 'A leaning player has a lean hit volume');
  assert.ok(hp.some(h => Math.hypot(h.x - 22.3, h.z - 7.22) < 1e-9 && h.r > 0.1), 'The lean volume sits at the lean point');
  assert.equal(playerSeenBy(en), true, 'The enemy sees the lean point');
  assert.equal(playerAimPoint(en), lp.eye, 'An enemy that sees only the lean point aims at it');
  losOK = () => true;
  assert.equal(playerAimPoint(en), lp, 'An enemy with the body in view aims at the body');
  assert.deepEqual(playerHitPoints({ x: 1, z: 1, r: 0.28, eye: { x: 1, z: 1, y: 1 }, cs: { crouch: true } }).length, 1, 'No lean, no extra volume');
  assert.equal(playerHitPoints({ x: 1, z: 1, r: 0.28 }).length, 1, 'Harness players without eye/cs keep one volume');
  sb.G = { player: { x: 1, z: 1, r: 0.28 } };
  assert.equal(playerAimPoint(en), sb.G.player, 'No lean: aim at the body');
}

module.exports = { checkCover };
if (require.main === module) { checkCover(); console.log('cover ok'); }
