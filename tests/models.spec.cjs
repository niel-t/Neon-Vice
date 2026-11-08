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
