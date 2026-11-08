const { test, expect, progressing, modelSettle } = require('./fixtures.cjs');

test('graphics: bloom replacements release only the previous targets', async ({ openGame }) => {
  const page=await openGame();
  const result=await page.evaluate(()=>{
    const methods=['createTexture','createFramebuffer','deleteTexture','deleteFramebuffer'],original={},counts={},deleted=[];
    for(const name of methods){original[name]=gl[name];counts[name]=0;gl[name]=function(...args){counts[name]++;if(name.startsWith('delete'))deleted.push(args[0]);return original[name].apply(this,args);};}
    let correct=true;
    try {
      for(let i=0;i<9;i++){
        const old=[bloomA.tex,bloomA.fb,bloomB.tex,bloomB.fb],offset=deleted.length;
        setBloom(1000+i*40,800+i*40);
        correct=correct&&old.every(handle=>deleted.slice(offset).includes(handle))&&gl.isTexture(bloomA.tex)&&gl.isTexture(bloomB.tex)&&gl.isFramebuffer(bloomA.fb)&&gl.isFramebuffer(bloomB.fb);
      }
      setBloom(1320,1120);
    }finally{for(const name of methods)gl[name]=original[name];}
    return {counts,correct};
  });
  expect(result).toEqual({counts:{createTexture:18,createFramebuffer:18,deleteTexture:18,deleteFramebuffer:18},correct:true});
  await progressing(page);
});

test('graphics: context loss stops progression, preserves saves and requires reload', async ({ browser,artifactURL }) => {
  const {context,page,errors}=await startupPage(browser,artifactURL,'normal');
  try {
    await expect.poll(()=>page.evaluate(()=>PS2C.ready), modelSettle).toBe(true);
    await page.locator('#bStart').click();
    await page.evaluate(()=>{startLevel(0);togglePause();});
    await page.locator('#bShake').click();
    const saves=await page.evaluate(()=>{
      saveProg();saveSet();
      window.lossExtension=gl.getExtension('WEBGL_lose_context');lossExtension.loseContext();
      return ['nb86','nb86prog','nb86jobs'].map(key=>localStorage.getItem(key));
    });
    await expect(page.locator('#contextWarning')).toBeVisible();
    const stopped=await page.evaluate(()=>({time:G.T,menuT,state,gain:master.gain.value}));
    expect(await page.evaluate(()=>document.activeElement.id)).toBe('bContextReload');
    expect(await page.evaluate(()=>$('sPause').inert)).toBe(true);
    await page.keyboard.press('m');await page.keyboard.press('Escape');
    await page.evaluate(()=>new Promise(resolve=>{let frames=0;function tick(){if(++frames===8)resolve();else requestAnimationFrame(tick);}requestAnimationFrame(tick);}));
    expect(await page.evaluate(()=>({time:G.T,menuT,state,gain:master.gain.value}))).toEqual(stopped);
    expect(stopped.state).toBe('pause');expect(stopped.gain).toBe(0);
    expect(await page.evaluate(()=>document.elementFromPoint(innerWidth/2,innerHeight/2).closest('#contextWarning')!==null)).toBe(true);
    expect(await page.evaluate(()=>['nb86','nb86prog','nb86jobs'].map(key=>localStorage.getItem(key)))).toEqual(saves);
    await page.evaluate(()=>lossExtension.restoreContext());
    await expect(page.locator('#contextMessage')).toContainText('available again');
    expect(await page.evaluate(()=>menuT)).toBe(stopped.menuT);
    await Promise.all([page.waitForEvent('domcontentloaded'),page.keyboard.press('Enter')]);
    await expect.poll(()=>page.evaluate(()=>PS2C.ready&&!contextLost&&menuT>0), modelSettle).toBe(true);
    expect(await page.evaluate(()=>['nb86','nb86prog','nb86jobs'].map(key=>localStorage.getItem(key)))).toEqual(saves);
    expect(errors).toEqual([]);
  }finally{await context.close();}
});

test('models: one NPC build per render and visible pending combatants', async ({ openGame }) => {
  const page = await openGame();
  const result = await page.evaluate(() => {
    startLevel(0);state='pause';
    const original=gl.bufferData, clock=performance.now;let count=0,now=0;
    gl.bufferData=function(target,data,usage){if(target===gl.ELEMENT_ARRAY_BUFFER&&usage===gl.STATIC_DRAW)count++;return original.call(this,target,data,usage);};
    performance.now=()=>now+=10;
    const counts=[];
    try {for(let i=0;i<G.enemies.length+2;i++){count=0;render();counts.push(count/2);}}
    finally {gl.bufferData=original;performance.now=clock;}
    const a=makeChar(1,1,G.enemies[0].look,false),b=makeChar(2,2,G.enemies[1].look,false);
    PS2C.beginFrame();const first=PS2C.add(a,'game',1,0,null,'look'),pending=PS2C.add(b,'game',1,0,null,'look');
    const before=IBhi.n;drawChar(IBhi,b);const fallback=IBhi.n-before;
    PS2C.beginFrame();const eventual=PS2C.add(b,'game',1,0,null,'look');
    return {counts,enemies:G.enemies.length,first,pending,fallback,eventual};
  });
  expect(result.counts.every(count=>count<=1)).toBe(true);
  expect(result.counts.reduce((a,b)=>a+b,0)).toBe(result.enemies);
  expect(result.enemies).toBeGreaterThan(1);
  expect(result.first).toBe(true);expect(result.pending).toBe(false);
  expect(result.fallback).toBeGreaterThan(0);expect(result.eventual).toBe(true);
});

test('models: failed NPC build does not starve subsequent models', async ({ browser, artifactURL }) => {
  const { context,page,errors }=await startupPage(browser,artifactURL,'normal');
  try {
    await expect.poll(()=>page.evaluate(()=>PS2C.ready), modelSettle).toBe(true);
    expect(await page.evaluate(()=>{
      startLevel(0);state='pause';PS2C.beginFrame();
      const a=G.enemies[0],b=G.enemies[1],upload=gl.bufferData;let calls=0;
      gl.bufferData=function(...args){if(++calls===2)throw new Error('Injected NPC failure');return upload.apply(this,args);};
      let failed;
      try {failed=PS2C.add(a,'game',1,0,null,'look');}finally{gl.bufferData=upload;}
      PS2C.beginFrame();const skipped=PS2C.add(a,'game',1,0,null,'look'),next=PS2C.add(b,'game',1,0,null,'look');
      return {failed,skipped,next};
    })).toEqual({failed:false,skipped:false,next:true});
    await progressing(page);
    expect(errors.length).toBe(1);expect(errors[0]).toContain('PS2 look');
  }finally{await context.close();}
});

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
    await expect.poll(() => page.evaluate(() => PS2C.ready), modelSettle).toBe(true);
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

test('ownership: the kit carries between jobs, retries rewind and walking away restores what you brought', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    const fade = fadeTo;
    try {
      fadeTo = () => true;
      selIdx = 1;
      startLevel(2);
      const bare = G.player.weapon;
      G.player.weapon = { type:'shotgun', ammo:37 };
      finishLevel(); pendingPerks = 0; $('bNextLvl').click();
      const k = kit(), kept = { guns:k.guns, pool:k.pool, run:myProg().run || null };
      startLevel(3);
      const carried = { ...G.player.weapon };
      G.player.weapon = null; G.player.alive = false;
      restart();
      const retried = { weapon:{ ...G.player.weapon }, pool:{ ...G.live.pool } };
      G.player.weapon = { type:'pistol', ammo:9 };
      togglePause(); walkAway();
      const stored = JSON.parse(localStorage.getItem('nb86prog')).money;
      return { bare, kept, carried, retried, walked:{ guns:kit().guns, run:myProg().run || null, stored:stored.kit.guns, storedRun:stored.run || null } };
    } finally { fadeTo = fade; }
  })).toEqual({
    bare:null,
    kept:{ guns:[{ type:'shotgun', mag:6 }, null], pool:{ '12ga':30 }, run:null },
    carried:{ type:'shotgun', ammo:6 },
    retried:{ weapon:{ type:'shotgun', ammo:6 }, pool:{ '12ga':30 } },
    walked:{ guns:[{ type:'shotgun', mag:6 }, null], run:null, stored:[{ type:'shotgun', mag:6 }, null], storedRun:null }
  });
});

test('ownership: walking over a gun of your caliber strips its rounds into the pool without taking it', async ({ openGame }) => {
  const page = await openGame();
  await page.evaluate(() => {
    selIdx = 1; startLevel(0); G.freeze = 0;
    const p = G.player; p.weapon = { type:'silenced', ammo:15 }; G.live.pool = {};
    G.items.push({ x:p.x, z:p.z, type:'pistol', ammo:13, vx:0, vz:0, rot:0, flying:false, fresh:false, flyT:0, age:2, tag:'w6' });
  });
  await expect.poll(() => page.evaluate(() => G.live.pool['9mm'] | 0)).toBe(13);
  expect(await page.evaluate(() => ({ held:G.player.weapon.type, left:G.items.filter(i => i.tag === 'w6').map(i => i.ammo) })))
    .toEqual({ held:'silenced', left:[0] });
});

test('slots: two guns and a melee switch in hand, pickups fill the free slot, reloads draw from the pool', async ({ openGame }) => {
  const page = await openGame();
  expect(await page.evaluate(() => {
    selIdx = 1;
    myProg().kit = { v:1, guns:[{ type:'pistol', mag:2 }, null], active:0, melee:'bat', armour:null, pool:{ '9mm':20 }, upg:{}, lost:[] };
    startLevel(0); G.freeze = 0;
    const p = G.player, L = () => G.live, snap = () => ({ hand:G.hand, w:p.weapon && { ...p.weapon }, guns:L().guns.map(g => g && { ...g }), melee:L().melee });
    const out = { start:snap() };
    takeWeapon(p, 'shotgun', 8); out.pick = { ...snap(), pool:{ ...L().pool } };
    cycleHand(p); out.c1 = snap();
    cycleHand(p); out.c2 = snap();
    slotHand(p, 3); slotHand(p, 1); out.direct = snap();
    p.weapon.ammo = 0; reloadStart(p); p.rl.t = (p.rl.ar0 + p.rl.ar1) / 2; reloadInput(p);
    out.perfect = { rl:p.rl, ammo:p.weapon.ammo, pool:L().pool['9mm'] };
    p.weapon.ammo = 10; reloadStart(p); p.rl.t = 0.01; reloadInput(p); const jam = p.rl.jam; reloadInput(p); const stillOn = !!p.rl;
    reloadTick(p, 10); out.jammed = { jam, stillOn, rl:p.rl, ammo:p.weapon.ammo, pool:L().pool['9mm'] };
    const k = kitFromPlay().kit; out.kit = { guns:k.guns, melee:k.melee, active:k.active };
    throwWeapon(p); out.thrown = snap();
    return out;
  })).toEqual({
    start:{ hand:0, w:{ type:'pistol', ammo:2 }, guns:[null, null], melee:'bat' },
    pick:{ hand:1, w:{ type:'shotgun', ammo:6 }, guns:[{ type:'pistol', mag:2 }, null], melee:'bat', pool:{ '9mm':20, '12ga':2 } },
    c1:{ hand:'melee', w:{ type:'bat', ammo:0 }, guns:[{ type:'pistol', mag:2 }, { type:'shotgun', mag:6 }], melee:null },
    c2:{ hand:0, w:{ type:'pistol', ammo:2 }, guns:[null, { type:'shotgun', mag:6 }], melee:'bat' },
    direct:{ hand:0, w:{ type:'pistol', ammo:2 }, guns:[null, { type:'shotgun', mag:6 }], melee:'bat' },
    perfect:{ rl:null, ammo:15, pool:5 },
    jammed:{ jam:true, stillOn:true, rl:null, ammo:15, pool:0 },
    kit:{ guns:[{ type:'pistol', mag:15 }, { type:'shotgun', mag:6 }], melee:'bat', active:0 },
    thrown:{ hand:1, w:{ type:'shotgun', ammo:6 }, guns:[null, null], melee:'bat' }
  });
});

test('nine: full hands deliver to the locker, a sale takes two clicks, and the locker swaps without duplicating', async ({ openGame }) => {
  const page = await openGame();
  await page.evaluate(() => {
    selIdx = 1; const p = myProg();
    p.kit = { v:1, guns:[{ type:'pistol', mag:15 }, { type:'smg', mag:30 }], active:0, melee:'bat', armour:null, pool:{}, upg:{}, lost:[] };
    p.locker = { v:1, items:[], lost:[] }; p.wallet = 100000;
    startLevel(0); state = 'play'; G.cine = null;
    const a = arm(); a.met = true; a.stock = ['m16', 'katana', 'revolver']; a.key = a.jobs;
    openShop();
  });
  await page.locator('#shCards [data-k="m16"]').click();
  expect(await page.evaluate(() => ({ items:myProg().locker.items, guns:kit().guns.map(g => g.type), spent:100000 - myProg().wallet === SHOPP.m16 })))
    .toEqual({ items:[{ type:'m16', mag:30 }], guns:['pistol', 'smg'], spent:true });
  await page.locator('#shExtra [data-x="sell"]').click();
  await page.locator('#shExtra [data-s="l0"]').click();
  expect(await page.evaluate(() => myProg().locker.items.length)).toBe(1);
  await page.locator('#shExtra [data-s="l0"]').click();
  expect(await page.evaluate(() => ({ n:myProg().locker.items.length, paid:myProg().wallet === 100000 - SHOPP.m16 + Math.round(SHOPP.m16 * SELL_FRAC) })))
    .toEqual({ n:0, paid:true });
  await page.evaluate(() => { closeShop(); openStore('locker'); });
  await page.locator('#sStore [data-ks="g1"]').click();
  expect(await page.evaluate(() => ({ guns:kit().guns.map(g => g && g.type), items:myProg().locker.items }))).toEqual({ guns:['pistol', null], items:[{ type:'smg', mag:30 }] });
  await page.locator('#sStore [data-ks="melee"]').click();
  await page.locator('#sStore [data-lt="0"]').click();
  expect(await page.evaluate(() => ({ guns:kit().guns.map(g => g && g.type), melee:kit().melee, items:myProg().locker.items.map(i => i.type), saved:JSON.parse(localStorage.getItem('nb86prog')).money.locker.items.length })))
    .toEqual({ guns:['pistol', 'smg'], melee:null, items:['bat'], saved:1 });
});
test('slots: in a job Tab switches and R reloads instead of restarting; Backspace restarts', async ({ openGame }) => {
  const page = await openGame();
  await page.evaluate(() => {
    selIdx = 1;
    myProg().kit = { v:1, guns:[{ type:'pistol', mag:3 }, { type:'smg', mag:30 }], active:0, melee:null, armour:null, pool:{ '9mm':40 }, upg:{}, lost:[] };
    startLevel(0); state = 'play'; G.cine = null; window.__w6 = G;
  });
  await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => [G.hand, G.player.weapon.type])).toEqual([1, 'smg']);
  await page.keyboard.press('Digit1');
  await expect.poll(() => page.evaluate(() => G.hand)).toBe(0);
  await page.keyboard.press('KeyR');
  await expect.poll(() => page.evaluate(() => !!G.player.rl)).toBe(true);
  expect(await page.evaluate(() => G === window.__w6)).toBe(true);
  await page.keyboard.press('Backspace');
  await expect.poll(() => page.evaluate(() => G !== window.__w6)).toBe(true);
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
    if (mode === 'no-webgl') {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type,...args) {
        return type === 'webgl' ? null : getContext.call(this,type,...args);
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
    await expect.poll(() => page.evaluate(() => PS2C.ready), modelSettle).toBe(true);
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
    await expect.poll(() => page.evaluate(() => PS2C.status), modelSettle).toBe('degraded');
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
    await expect.poll(() => page.evaluate(() => PS2C.ready), modelSettle).toBe(true);
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
    await expect.poll(() => page.evaluate(() => PS2C.status), modelSettle).toBe('failed');
    expect(await page.evaluate(() => [PS2C.ready, PS2C.modelStatus('don')])).toEqual([false, 'failed']);
    await expect(page.locator('#modelWarning')).toBeVisible();
    await progressing(page);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain('PS2C');
  } finally { await context.close(); }
});

test('startup: unavailable WebGL keeps the explicit error screen after script splitting', async ({browser,artifactURL})=>{
  const {context,page,errors}=await startupPage(browser,artifactURL,'no-webgl');
  try {
    await expect(page.locator('#err')).toHaveClass(/on/);
    await expect(page.locator('#modelWarning')).toBeHidden();
    expect(errors).toEqual(['no webgl','no webgl']);
  }finally{await context.close();}
});
