const { test, expect, progressing } = require('./fixtures.cjs');

test('focus: lost releases clear world input and held controller buttons re-arm safely', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    startLevel(0);keys.KeyD=true;mouse.down=true;mouse.active=true;sticks.L={id:1};sticks.R={id:2};
    for(const k of Object.keys(pressed))pressed[k]=true;G.click=[1,2];
    const buttons=Array.from({length:16},()=>({pressed:false,value:0}));
    buttons[9]={pressed:true,value:1};
    const original=navigator.getGamepads;
    navigator.getGamepads=()=>[{connected:true,buttons,axes:[0,0,0,0]}];
    try {
      dispatchEvent(new Event('blur'));pollPad();
      const cleared={state,keys:Object.keys(keys).length,mouse:mouse.down,sticks:!!sticks.L||!!sticks.R,pressed:Object.values(pressed).some(Boolean),click:G.click,pad:PAD.on};
      dispatchEvent(new Event('focus'));pollPad();const held=pdown(9);
      buttons[9]={pressed:false,value:0};buttons[7]={pressed:false,value:0.4};pollPad();const triggerBlocked=!PAD.on&&PAD.rearm;
      buttons[7]={pressed:false,value:0};pollPad();
      buttons[9]={pressed:true,value:1};pollPad();const fresh=pdown(9);
      resetInputs();
      return {cleared,held,fresh,triggerBlocked};
    } finally {navigator.getGamepads=original;}
  })).toEqual({
    cleared:{state:'pause',keys:0,mouse:false,sticks:false,pressed:false,click:null,pad:false},
    held:false,fresh:true,triggerBlocked:true
  });
});

test('audio: gesture recovery surfaces rejection without queuing suspended sound effects', async ({ browser, artifactURL }) => {
  const { context, page, errors } = await startupPage(browser, artifactURL, 'audio');
  try {
    await expect.poll(() => page.evaluate(() => PS2C.ready)).toBe(true);
    await page.evaluate(() => {window.allowAudioActivation=true;});
    await page.locator('#bStart').click();
    await expect.poll(() => page.evaluate(() => AC.state)).toBe('running');
    await page.evaluate(async () => {
      await AC.suspend();
      window.allowAudioActivation=false;
      window.resumeCalls=0;window.nativeResume=AC.resume.bind(AC);
      AC.resume=()=>{resumeCalls++;return nativeResume();};
    });
    await progressing(page);
    await page.locator('#bPlay').click();
    expect(await page.evaluate(() => [AC.state,resumeCalls])).toEqual(['suspended',0]);
    expect(await page.evaluate(() => {
      let nodes=0;const oscillator=AC.createOscillator,source=AC.createBufferSource;
      AC.createOscillator=function(...args){nodes++;return oscillator.apply(this,args);};
      AC.createBufferSource=function(...args){nodes++;return source.apply(this,args);};
      try {for(let i=0;i<10;i++){sfx('revolver');pb(GB.dual,AC.currentTime,1);tone(AC.currentTime,0.1,'sine',100,100,1);}}
      finally {AC.createOscillator=oscillator;AC.createBufferSource=source;}
      return nodes;
    })).toBe(0);
    await page.evaluate(() => {allowAudioActivation=true;AC.resume=()=>{resumeCalls++;return Promise.reject(new Error('Injected audio denial'));};});
    await page.mouse.click(5,5);
    await expect(page.locator('#audioWarning')).toBeVisible();
    const calls=await page.evaluate(() => resumeCalls);
    await progressing(page);
    expect(await page.evaluate(() => resumeCalls)).toBe(calls);
    await page.evaluate(() => {AC.resume=()=>{resumeCalls++;return nativeResume();};});
    await page.mouse.click(5,5);
    await expect.poll(() => page.evaluate(() => AC.state)).toBe('running');
    await expect(page.locator('#audioWarning')).toBeHidden();
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain('Audio recovery failed');
  } finally {await context.close();}
});

test('ownership: carry survives floor changes but not a new character run', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    startLevel(2);
    G.player.weapon = { type:'shotgun', ammo:37 };
    finishLevel();
    const saved = { ...CARRY };
    startLevel(3);
    const carried = { ...G.player.weapon };
    selIdx = 1;JOBS.sel = 0;
    const fade = fadeTo;
    try { fadeTo = () => true;$('bPlay').click(); } finally { fadeTo = fade; }
    const cleared = CARRY;
    startLevel(0);
    return { saved, carried, cleared, weapon:G.player.weapon };
  })).toEqual({
    saved:{ type:'shotgun',ammo:37,from:2 },
    carried:{ type:'shotgun',ammo:37 },
    cleared:null,
    weapon:null
  });
});

test('ownership: delayed limb blood stays in its originating world', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    startLevel(0);
    const callbacks = [], timer = setTimeout;
    try { window.setTimeout = fn => { callbacks.push(fn);return 0; };limbGib(G.enemies[0],'armL',[1,0]); }
    finally { window.setTimeout = timer; }
    const before = G.parts.length;callbacks[0]();const sameWorld = G.parts.length - before;
    startLevel(1);
    const replacement = G.parts.length;callbacks.forEach(fn=>fn());
    return { timers:callbacks.length,sameWorld,replacementDelta:G.parts.length-replacement };
  })).toEqual({ timers:4,sameWorld:6,replacementDelta:0 });
});

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
    if(mode === 'audio') {
      window.allowAudioActivation=false;window.audioActivation=false;
      Object.defineProperty(navigator,'userActivation',{get:()=>({isActive:audioActivation})});
      for(const type of ['pointerdown','pointerup','touchend','click','keydown'])addEventListener(type,()=>{audioActivation=allowAudioActivation;},{capture:true});
    }
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
