const { test, expect } = require('./fixtures.cjs');

test('models: female body parameters stay within the vertex budget and use the shared rig', async ({ openGame }) => {
  const page = await openGame();
  const result = await page.evaluate(() => {
    startLevel(0);state='pause';
    const male=G.enemies[0].look,fems=[NPCLOOK.recep(),NPCLOOK.lady(),Object.assign(NPCLOOK.lady(),{skirt:0}),dancerLook(1,0),GIRLLOOK(),GIRLLOOK(true)];
    const m=PS2C.lookVerts(male),f=fems.map(l=>PS2C.lookVerts(l));
    const a=makeChar(1,1,fems[0],false),b=makeChar(2,2,male,false);
    PS2C.beginFrame();const built=PS2C.add(a,'game',1,0,null,'look');
    PS2C.beginFrame();const builtMale=PS2C.add(b,'game',1,0,null,'look');
    a.anim='walk';PS2C.beginFrame();PS2C.add(a,'game',1,0,null,'look');
    return {male:m.total,fem:f.map(v=>v.total),built,builtMale};
  });
  expect(result.built).toBe(true);expect(result.builtMale).toBe(true);
  for(const v of result.fem){expect(v).toBeGreaterThan(0);expect(v).toBeLessThanOrEqual(result.male*1.25);}
});
