#!/usr/bin/env node
// Dev-only visual inspection tool (not part of `npm test`, not shipped).
// Renders every campaign level from the source checkout and writes PNGs to shots/<level>/ for layout review:
//   overview.png       whole level from a high oblique camera
//   oblique-<n>.png    four lower oblique close-ups, one per quadrant, looking north at decorated wall faces
//   room-<n>.png       the real gameplay camera over every room/zone (large zones are tiled)
// Usage: node scripts/shots.cjs [--levels 0,3,7] [--overlay] [--out shots] [--size 1280x720]
//        node scripts/shots.cjs --diff <dirA> <dirB>   compare two shot sets pixel by pixel (exit 1 if any differ)
//   Shots are deterministic: the same code renders pixel-identical images, so before/after sets can be diffed.
//   --overlay  label placed props (wall decor kind, fans, puddles, glass, street props, furniture) and tint
//              open-air cells green / roofed interior cells untinted, so wrong-zone placement stands out.
'use strict';
const { chromium } = require('@playwright/test');
const { mkdirSync, rmSync } = require('node:fs');
const { resolve, join } = require('node:path');
const { pathToFileURL } = require('node:url');

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const overlay = args.includes('--overlay');
const outRoot = resolve(opt('--out') || resolve(__dirname, '..', 'shots'));
const [vwid, vhei] = (opt('--size') || '1280x720').split('x').map(Number);

const frames = (page, n = 3) => page.evaluate(n => window.__shotStep(n), n);

async function main() {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: vwid, height: vhei }, deviceScaleFactor: 1 });
  await context.route('**/*', route => /fonts\.(googleapis|gstatic)\.com/.test(route.request().url()) ? route.fulfill({ status: 200, body: '' }) : route.continue());
  // Determinism: seeded Math.random (reseeded per level) and a frozen clock. performance.now, Date.now and rAF
  // timestamps all read a virtual clock that never advances, so the game loop's dt is 0 and nothing animates;
  // menuT is pinned per level. The game's rAF loop does not free-run: callbacks are queued and only run when the
  // tool steps a fixed number of frames, so per-frame randomness (flicker etc.) is consumed identically each run.
  await context.addInitScript(() => {
    let seed = 123456789;
    Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    const CLOCK = 1000, EPOCH = Date.UTC(1986, 5, 1);
    performance.now = () => CLOCK;
    Date.now = () => EPOCH + CLOCK;
    const realRaf = window.requestAnimationFrame.bind(window);
    let queue = [];
    window.requestAnimationFrame = cb => { queue.push(cb); return queue.length; };
    window.cancelAnimationFrame = () => {};
    window.__shotStep = n => new Promise(done => {
      for (let k = 0; k < n; k++) { const q = queue; queue = []; for (const cb of q) cb(CLOCK); }
      realRaf(() => realRaf(done));
    });
    window.__shotSeed = s => { seed = s >>> 0; };
    window.QLOCK = 3;
  });
  const page = await context.newPage();
  page.on('pageerror', e => console.error('page error:', e.message));
  // Each level gets a fresh page load so its shots do not depend on which levels were captured before it
  // (lazily built textures and caches consume Math.random).
  const boot = async () => {
    await page.goto(pathToFileURL(resolve(__dirname, '..', 'index.html')).href);
    await page.waitForFunction(() => typeof PS2C !== 'undefined' && PS2C.ready && !!gl, null, { timeout: 60_000 });
    await frames(page, 2);

    // HUD replacement: hidden normally, or the placement overlay with --overlay.
    await page.evaluate(overlay => {
      window.__shotOverlay = overlay;
      drawHUD = function () {
        const c = hctx; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, vw, vh);
        if (!window.__shotOverlay || !G || !VP) return;
        const P = (x, y, z) => { const m = VP, w = m[3] * x + m[7] * y + m[11] * z + m[15]; if (w <= 0.01) return null;
          return [((m[0] * x + m[4] * y + m[8] * z + m[12]) / w + 1) / 2 * vw, (1 - (m[1] * x + m[5] * y + m[9] * z + m[13]) / w) / 2 * vh]; };
        const g = G, W = g.W;
        c.fillStyle = 'rgba(60,255,120,0.18)';
        for (let z = 0; z < g.H; z++) for (let x = 0; x < W; x++) {
          if (!g.out || !g.out[z * W + x]) continue;
          const q = [P(x, 0, z), P(x + 1, 0, z), P(x + 1, 0, z + 1), P(x, 0, z + 1)];
          if (q.some(v => !v)) continue;
          c.beginPath(); c.moveTo(...q[0]); for (const v of q.slice(1)) c.lineTo(...v); c.closePath(); c.fill();
        }
        c.font = 'bold 10px monospace'; c.textAlign = 'center';
        const tag = (x, y, z, t, col) => { const s = P(x, y, z); if (!s) return; c.fillStyle = 'rgba(0,0,0,0.65)';
          const w = c.measureText(t).width + 4; c.fillRect(s[0] - w / 2, s[1] - 7, w, 12); c.fillStyle = col; c.fillText(t, s[0], s[1] + 3); };
        const furnName = Object.fromEntries(Object.entries(FURN).map(([k, v]) => [v, k]));
        for (let z = 0; z < g.H; z++) for (let x = 0; x < W; x++) {
          const i = z * W + x;
          if (g.solid[i] && !g.def.hub) { const k = wallDecorKind(g, x, z); if (k) tag(x + 0.5, 0.7, z + 1, k, '#ffd36b'); }
          else if (g.furn[i]) tag(x + 0.5, 0.3, z + 0.5, 'f' + (furnName[g.furn[i]] || g.furn[i]), '#e9c7ff');
          if (g.pool && g.pool[i]) tag(x + 0.5, 0.05, z + 0.5, 'puddle', '#7fd4ff');
          if (g.glass && g.glass[i]) tag(x + 0.5, 0.05, z + 0.5, 'glass', '#cfefff');
        }
        for (const d of g.deco) if (d.t !== 'dash' && d.t !== 'cline' && d.t !== 'lane') tag(d.x + 0.5, 0.4, d.z + 0.5, d.t, '#9fffb0');
        for (const f of g.fans || []) tag(f.x, 2.0, f.z, 'FAN', '#ff6f6f');
      };
    }, overlay);
  };

  await boot();
  const count = await page.evaluate(() => LEVELS.length);
  const levels = opt('--levels') ? opt('--levels').split(',').map(Number) : [...Array(count).keys()];
  for (const [idx, li] of levels.entries()) {
    if (idx) await boot();
    const info = await page.evaluate(i => {
      __shotSeed(0x5eed0000 + i * 7919); menuT = 10;
      startLevel(i); state = 'pause'; show(null); G.shake = 0;
      for (const el of document.body.children) if (el.id !== 'gl' && el.id !== 'hud' && el.tagName !== 'SCRIPT') el.style.visibility = 'hidden';
      const g = G, W = g.W, H = g.H, reg = new Int32Array(W * H).fill(-1), rooms = [];
      const door = (x, z) => g.rows[z][x] === 'D', out = (x, z) => !!(g.out && g.out[z * W + x]);
      for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
        if (g.solid[z * W + x] || door(x, z) || reg[z * W + x] >= 0) continue;
        const id = rooms.length, cells = [], q = [[x, z]], o = out(x, z); reg[z * W + x] = id;
        while (q.length) { const [cx, cz] = q.pop(); cells.push([cx, cz]);
          for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, nz = cz + dz, j = nz * W + nx;
            if (g.solid[j] || door(nx, nz) || reg[j] >= 0 || out(nx, nz) !== o) continue; reg[j] = id; q.push([nx, nz]); } }
        rooms.push({ out: o, cells });
      }
      const views = [];
      for (const r of rooms) {
        if (r.cells.length < 4) continue;
        const xs = r.cells.map(c => c[0]), zs = r.cells.map(c => c[1]);
        const x0 = Math.min(...xs), x1 = Math.max(...xs) + 1, z0 = Math.min(...zs), z1 = Math.max(...zs) + 1;
        const nx = Math.max(1, Math.round((x1 - x0) / 13)), nz = Math.max(1, Math.round((z1 - z0) / 7));
        for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) {
          const cx = x0 + (a + 0.5) * (x1 - x0) / nx, cz = z0 + (b + 0.5) * (z1 - z0) / nz;
          if (r.cells.some(c => Math.abs(c[0] + 0.5 - cx) < 3 && Math.abs(c[1] + 0.5 - cz) < 3)) views.push({ x: cx, z: cz, out: r.out });
        }
      }
      return { name: g.def.name, W, H, views };
    }, li);
    const dir = join(outRoot, `L${li}-${info.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`);
    rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
    const snap = async (file, cam) => {
      await page.evaluate(cam => {
        if (cam.cine) G.cine = cam.cine; else { G.cine = null; G.cam.x = cam.x; G.cam.z = cam.z; G.cam.kx = G.cam.kz = 0; }
      }, cam);
      await frames(page, 4);
      await page.screenshot({ path: join(dir, file) });
    };
    const { W, H } = info, cx = W / 2, cz = H / 2, d = Math.max(W / 1.45, H * 1.5) + 3;
    await snap('overview.png', { cine: { eye: [cx, d * 0.87, cz + d * 0.5], tgt: [cx, 0, cz] } });
    let n = 0;
    for (const [qx, qz] of [[0.27, 0.3], [0.73, 0.3], [0.27, 0.75], [0.73, 0.75]]) {
      const tx = W * qx, tz = H * qz;
      await snap(`oblique-${++n}.png`, { cine: { eye: [tx + (qx < 0.5 ? -2.5 : 2.5), 5.2, tz + 7.5], tgt: [tx, 0.4, tz - 0.5] } });
    }
    n = 0;
    for (const v of info.views) await snap(`room-${String(++n).padStart(2, '0')}-${v.out ? 'outdoor' : 'interior'}.png`, v);
    console.log(`L${li} ${info.name}: ${5 + info.views.length} shots -> ${dir}`);
  }
  await browser.close();
}

async function diff(dirA, dirB) {
  const { readdirSync, readFileSync, existsSync, statSync } = require('node:fs');
  const list = (root, rel = '') => readdirSync(join(root, rel)).flatMap(n => statSync(join(root, rel, n)).isDirectory() ? list(root, join(rel, n)) : n.endsWith('.png') ? [join(rel, n)] : []);
  const files = [...new Set([...list(dirA), ...list(dirB)])].sort();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let changed = 0;
  for (const f of files) {
    const a = join(dirA, f), b = join(dirB, f);
    if (!existsSync(a) || !existsSync(b)) { console.log(`${f}: only in ${existsSync(a) ? 'A' : 'B'}`); changed++; continue; }
    const ba = readFileSync(a), bb = readFileSync(b);
    if (ba.equals(bb)) continue;
    const r = await page.evaluate(async ([pa, pb]) => {
      const px = async s => { const im = await createImageBitmap(await (await fetch('data:image/png;base64,' + s)).blob());
        const c = new OffscreenCanvas(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, im.width, im.height); };
      const A = await px(pa), B = await px(pb);
      if (A.width !== B.width || A.height !== B.height) return { size: true };
      let n = 0; for (let i = 0; i < A.data.length; i += 4) if (A.data[i] !== B.data[i] || A.data[i + 1] !== B.data[i + 1] || A.data[i + 2] !== B.data[i + 2]) n++;
      return { n, total: A.width * A.height };
    }, [ba.toString('base64'), bb.toString('base64')]);
    if (r.size) { console.log(`${f}: size differs`); changed++; }
    else if (r.n) { console.log(`${f}: ${r.n} px differ (${(100 * r.n / r.total).toFixed(3)}%)`); changed++; }
  }
  await browser.close();
  console.log(`${files.length} images compared, ${changed} differ`);
  process.exitCode = changed ? 1 : 0;
}

if (args[0] === '--diff') diff(resolve(args[1]), resolve(args[2])).catch(e => { console.error(e); process.exit(2); });
else main().catch(e => { console.error(e); process.exit(1); });
