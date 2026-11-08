const { test, expect } = require('./fixtures.cjs');

test('models: female body parameters stay within the vertex budget and use the shared rig', async ({ openGame }) => {
  const page = await openGame();
  const result = await page.evaluate(() => {
    startLevel(0);state='pause';
    const fems=[NPCLOOK.recep(),NPCLOOK.lady(),Object.assign(NPCLOOK.lady(),{skirt:0}),dancerLook(1,0),GIRLLOOK(),GIRLLOOK(true)];
    for(const hs of ['long','big'])fems.push(Object.assign(NPCLOOK.lady(),{hs,hat:null}));
    const pairs=fems.map(l=>[PS2C.lookVerts(Object.assign({},l,{fem:false,skirt:0})).total,PS2C.lookVerts(l).total]);
    const male=G.enemies[0].look,a=makeChar(1,1,fems[0],false),b=makeChar(2,2,male,false);
    PS2C.beginFrame();const built=PS2C.add(a,'game',1,0,null,'look');
    PS2C.beginFrame();const builtMale=PS2C.add(b,'game',1,0,null,'look');
    a.anim='walk';PS2C.beginFrame();PS2C.add(a,'game',1,0,null,'look');
    return {pairs,built,builtMale};
  });
  expect(result.built).toBe(true);expect(result.builtMale).toBe(true);
  for(const [m,f] of result.pairs){expect(f).toBeGreaterThan(0);expect(f).toBeLessThanOrEqual(m*1.25);}
});

test('models: look v2 armour, helmet and wardrobe fields add geometry only when set and build on any body', async ({ openGame }) => {
  const page = await openGame();
  const r = await page.evaluate(() => {
    startLevel(0);state='pause';const A=Object.assign,V=l=>PS2C.lookVerts(l).total,male=G.enemies[0].look,fem=NPCLOOK.lady();
    const out={unknown:[V(A({},male,{armor:'kevlar',helmet:'tophat'})),V(male)],maleWardrobe:[V(A({},male,{heels:1,pads:1,crop:1})),V(male)],
      add:[V(A({},male,{armor:'vest'}))>V(male),V(A({},male,{armor:'plate'}))>V(A({},male,{armor:'vest'})),V(A({},male,{helmet:'riot'}))>V(male),V(A({},fem,{heels:1}))>V(fem)]};
    const kit={armor:'plate',helmet:'pasgt',heels:1,pads:1,crop:1};
    out.pair=[V(A({},male,kit)),V(A({},fem,kit))];
    const c=makeChar(1,1,A({},fem,kit),false);PS2C.beginFrame();out.built=PS2C.add(c,'game',1,0,null,'look');
    const d=makeChar(2,2,A({},male,{armor:'vest',helmet:'riot'}),false);PS2C.beginFrame();out.builtMale=PS2C.add(d,'game',1,0,null,'look');
    return out;
  });
  expect(r.unknown[0]).toBe(r.unknown[1]);expect(r.maleWardrobe[0]).toBe(r.maleWardrobe[1]);
  expect(r.add).toEqual([true,true,true,true]);
  expect(r.pair[1]).toBeLessThanOrEqual(r.pair[0]*1.25);
  expect(r.built).toBe(true);expect(r.builtMale).toBe(true);
});
