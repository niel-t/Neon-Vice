const { test, expect, progressing } = require('./fixtures.cjs');

async function startupPage(browser, artifactURL, mode) {
  const context = await browser.newContext();
  const errors = [];
  context.on('weberror', event => errors.push(event.error().message));
  context.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.fulfill({ body: '' });
    if (mode === 'image' && url.pathname === '/art.js') {
      const response = await route.fetch();
      const body = (await response.text()).replace(/money:'[^']*'/, "money:'data:image/jpeg;base64,broken'");
      return route.fulfill({ response, body });
    }
    return route.continue();
  });
  await context.addInitScript(mode => {
    window.QLOCK = 3;
    window.bootSamples = [];
    window.pendingDraws = [];
    const raf = requestAnimationFrame;
    let wrapped = false;
    window.requestAnimationFrame = callback => raf(now => {
      if (!wrapped && typeof hdChar === 'function') {
        wrapped = true;
        const draw = hdChar;
        hdChar = (batch, character, time) => {
          const pending = PS2C.modelStatus(character.pose) === 'loading';
          const before = batch.n;
          draw(batch, character, time);
          if (pending && state === 'title') pendingDraws.push(batch.n - before);
        };
      }
      callback(now);
      if (bootSamples.length < 8) bootSamples.push({ menuT, ftEma, last });
    });
    if (mode === 'healthy') {
      const NativeImage = Image;
      window.Image = class extends NativeImage {
        set onload(fn) { super.onload = event => setTimeout(() => fn(event), 150); }
        get onload() { return super.onload; }
      };
    }
    if (mode === 'shader') {
      const original = WebGLRenderingContext.prototype.getShaderParameter;
      WebGLRenderingContext.prototype.getShaderParameter = function(shader, parameter) {
        if (parameter === this.COMPILE_STATUS && this.getShaderSource(shader).includes('uniform mat4 uB[')) return false;
        return original.call(this, shader, parameter);
      };
    }
  }, mode);
  const page = await context.newPage();
  await page.goto(artifactURL, { waitUntil: 'domcontentloaded' });
  return { context, page, errors };
}

test('startup: nonnegative first frame and no loading-only title fallback', async ({ browser, artifactURL }) => {
  const { context, page, errors } = await startupPage(browser, artifactURL, 'healthy');
  try {
    await expect.poll(() => page.evaluate(() => PS2C.ready)).toBe(true);
    const samples = await page.evaluate(() => ({ frames: bootSamples, pending: pendingDraws }));
    expect(samples.frames[0].menuT).toBe(0);
    expect(samples.frames.every(sample => sample.menuT >= 0 && sample.ftEma >= 0)).toBe(true);
    expect(samples.pending.length).toBeGreaterThan(0);
    expect(samples.pending.every(vertices => vertices === 0)).toBe(true);
    await progressing(page);
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});

test('startup: one failed image settles without hiding healthy models', async ({ browser, artifactURL }) => {
  const { context, page, errors } = await startupPage(browser, artifactURL, 'image');
  try {
    await expect.poll(() => page.evaluate(() => PS2C.status)).toBe('degraded');
    expect(await page.evaluate(() => [PS2C.ready, PS2C.modelStatus('money'), PS2C.modelStatus('don')]))
      .toEqual([false, 'failed', 'ready']);
    await expect(page.locator('#modelWarning')).toBeVisible();
    const drawing = await page.evaluate(() => {
      const batch = new Batch();
      const fallback = { pose: 'money', look: LOOKS.money, x: 0, y: 0, z: 0, a: 0 };
      hdChar(batch, fallback, 0);
      const vertices = batch.n;
      gl.deleteBuffer(batch.buf);
      return { vertices, healthy: PS2C.add({ pose: 'don', x: 0, z: 0 }, 'menu', 1, 0, null, 'don') };
    });
    expect(drawing.healthy).toBe(true);
    expect(drawing.vertices).toBeGreaterThan(0);
    await progressing(page);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain('PS2C money');
  } finally { await context.close(); }
});

test('startup: failed rebuild preserves the previous drawable model', async ({ browser, artifactURL }) => {
  const { context, page, errors } = await startupPage(browser, artifactURL, 'normal');
  try {
    await expect.poll(() => page.evaluate(() => PS2C.ready)).toBe(true);
    expect(await page.evaluate(() => {
      const original = gl.bufferData;
      let allocations = 0, freed = 0;
      const deletion = gl.deleteBuffer;
      gl.bufferData = function(...args) { if (++allocations === 2) throw new Error('Injected rebuild failure');return original.apply(this,args); };
      gl.deleteBuffer = function(buffer) { freed++;return deletion.call(this,buffer); };
      try { PS2C.rebuild('don'); } finally { gl.bufferData = original;gl.deleteBuffer = deletion; }
      return { drawable: PS2C.add({ pose:'don',x:0,z:0 },'menu',1,0,null,'don'), freed };
    })).toEqual({ drawable:true, freed:2 });
    await progressing(page);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain('PS2C rebuild don');
  } finally { await context.close(); }
});

test('startup: shared shader failure settles with explicit degraded presentation', async ({ browser, artifactURL }) => {
  const { context, page, errors } = await startupPage(browser, artifactURL, 'shader');
  try {
    await expect.poll(() => page.evaluate(() => PS2C.status)).toBe('failed');
    expect(await page.evaluate(() => [PS2C.ready, PS2C.modelStatus('don')])).toEqual([false, 'failed']);
    await expect(page.locator('#modelWarning')).toBeVisible();
    await progressing(page);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain('PS2C');
  } finally { await context.close(); }
});
