const assert = require('node:assert/strict');
const { worldData } = require('./world-snapshot.cjs');

function checkDamage() {
  const { WORLD: W } = worldData();
  const floor = { id: 'floor', poly: [[0,0],[8,0],[8,8],[0,8]], y: 0, surf: 'tile' };
  const rooms = [
    { id: 'north', poly: [[0,0],[8,0],[8,4],[0,4]] },
    { id: 'south', poly: [[0,4],[8,4],[8,8],[0,8]] }
  ];
  const wall = { id: 'wall', path: [[0,4],[8,4]], build: 'particle_divider', cov: 'full', h: 2.8 };
  const stage = (w = wall, portals = [], rs = rooms) => W.compile({ id: 'damage', bounds: [0,0,8,8], combat: true, ground: [floor], walls: [w], props: [], rooms: rs, portals });
  const hit = (st, x, y) => W.trace(st,x,2,x,6,y).find(h => h.panel !== null);
  const removeLow = (st, x) => {
    let result;
    for (const y of [.25,.75]) { const h = hit(st,x,y); result = W.damage(st,h.panel,h.cell,st.cells[h.cell].hp,'bullet'); }
    return result;
  };
  const st = stage(), h = hit(st,3.75,.25), c = st.cells[h.cell], n = W.nav(st), f = W.flow(n,[3.75,2]);
  for (const args of [
    [h.panel,h.cell,-1,'bullet'], [h.panel,h.cell,NaN,'bullet'],
    [h.panel,h.cell,1,'fire'], ['missing',h.cell,1,'bullet'],
    [h.panel+1,h.cell,1,'bullet'], [h.panel,-1,1,'bullet']
  ]) {
    assert.throws(() => W.damage(st,...args));
    assert.equal(c.hp,400); assert(c.active);
  }
  const noop = W.damage(st,h.panel,h.cell,0,'bullet');
  assert(Object.isFrozen(noop)); assert.equal(noop.dirty,false);
  assert.strictEqual(W.damage(st,'wall',h.cell,399.5,'melee'),noop);
  assert.equal(c.hp,.5);
  const removed = W.damage(st,h.panel,h.cell,.5,'blast');
  assert(removed.removed && removed.dirty); assert.deepEqual(Array.from(removed.cells),[h.cell]);
  assert.equal(c.hp,0); assert.equal(c.active,false);
  assert.strictEqual(W.damage(st,h.panel,h.cell,100,'bullet'),noop);
  assert(removed.nav.length && removed.nav.every(i => Number.isInteger(i) && i >= 0 && i < 256));
  assert.throws(() => W.flow(n,[3,2]), /rebuild navigation/);
  assert.throws(() => W.dist(n,f,3,2), /rebuild navigation/);
  assert.throws(() => n.walkable(0), /rebuild navigation/);
  const bottom = hit(st,3.75,.75);
  W.damage(st,'wall',bottom.cell,400,'bullet');
  assert(!W.portalOpen(st,st.portals[0],'move'), 'A 0.5 m hole is not a 0.6 m doorway');
  const adjacent = removeLow(st,4.25);
  assert.equal(adjacent.portal.idx,0, 'Widening/merging keeps the first portal index');
  assert.equal(adjacent.portal.width,1);
  assert(W.portalOpen(st,adjacent.portal,'move'));
  assert(W.portalOpen(st,adjacent.portal,'move',.36));
  assert(!W.portalOpen(st,adjacent.portal,'sight'), 'Intact upper cells still block standing sight');
  assert(!W.move(st,4,2,.3,0,4).hit);
  const rebuilt = W.nav(st), open = W.flow(rebuilt,[4,2]);
  assert(W.dist(rebuilt,open,4,6) > 0);
  const closed = W.flow(rebuilt,[4,2],undefined,{closed:['wall']});
  assert.equal(W.dist(rebuilt,closed,4,6),-1, 'Closing the wall reference closes every breach');
  assert.equal(st.portals.filter(p => !p.inactive).length,1);
  assert.deepEqual(Array.from(W.portals(st,0)),[0]);

  const high = stage(), eye = hit(high,3.75,1.6);
  W.damage(high,'wall',eye.cell,400,'bullet');
  assert(W.sight(high,3.75,2,3.75,6).clear);
  assert(W.move(high,3.75,2,.3,0,4).hit);
  const solid = stage({...wall,build:'rc_column_40'});
  const ih = hit(solid,3.75,.25);
  assert.strictEqual(W.damage(solid,ih.panel,ih.cell,1e100,'blast'),noop);
  assert.equal(solid.cells[ih.cell].hp,Infinity);
  solid.cells[ih.cell].hp=100;
  assert.strictEqual(W.damage(solid,ih.panel,ih.cell,100,'blast'),noop, 'Mutable HP cannot make indestructible construction removable');

  for (const start of [3.15,3.35,3.55]) for (const width of [.7,.75,.8,1]) for (const authored of [false,true]) {
    const w = {...wall,open:[
      {id:'cut',s0:start-.1,s1:start,y0:2,y1:2.2,kind:'window',build:'glass_annealed_6',cov:'glass'},
      {id:'window',s0:start+.5,s1:start+width,y0:1,y1:2.2,kind:'window',build:'glass_annealed_6',cov:'glass'}
    ]};
    const s = stage(w,authored?[{id:'wall-link',a:'north',b:'south',seg:[[0,4],[8,4]],wall:'wall'}]:[]);
    const pieces = s.panels.filter(p => p.ref === 'wall' && p.ax >= start-1e-8 && p.bx <= start+width+1e-8);
    // Align the first cut with the authored opening, then remove its neighbour and sill.
    const before = s.panels.find(p => p.ref==='wall' && Math.abs(p.bx-(start+.5))<1e-8);
    const chosen = [...new Set([before,...pieces])];
    for (const p of chosen) for (let i=p.c0;i<p.c1;i++) if(s.cells[i].y0<1) W.damage(s,s.cells[i].panel,i,s.cells[i].hp,'blast');
    const gap = authored?s.portals[0]:s.portals.find(p => !p.inactive && p.kind==='hole' && p.walk);
    assert(gap, `Missing merged gap ${start}/${width}`);
    if(!authored)assert(Math.abs(gap.width-width)<1e-8, `Exact authored breach width ${start}/${width}`);
    else assert.equal(s.portals.length,1, 'A broad authored portal keeps its identity without hiding breach axes');
    const x=start+width/2, nav=W.nav(s), field=W.flow(nav,[x,2]);
    assert(W.portalOpen(s,gap,'move'), `Gap centre is walkable ${start}/${width}`);
    assert(W.dist(nav,field,x,6)>0, `Nav reaches uneven gap ${start}/${width}`);
    if(authored)assert.equal(W.dist(nav,W.flow(nav,[x,2],undefined,{closed:['wall-link']}),x,6),-1);
  }

  const o = { id:'door',s0:3,s1:4,y0:0,y1:2.2,kind:'double',build:'door_hollow',cov:'full' };
  const doors = stage({...wall,open:[o]},[{id:'door-link',a:'north',b:'south',open:'door'}]);
  doors.doors.forEach(d => d.locked=true);
  const dn=W.nav(doors), df=W.flow(dn,[3.5,2]);
  assert.equal(W.dist(dn,df,3.5,6),-1);
  const unlinked=stage({...wall,open:[{...o,kind:'door'}]});
  unlinked.doors[0].locked=true;
  const un=W.nav(unlinked), near=W.flow(un,[3.5,3.5]);
  assert.equal(W.dist(un,near,3.5,6),-1, 'Near-target seeds cannot bypass an unlinked locked leaf');
  assert.strictEqual(W.damageLock(doors,doors.doors[0],799),W.damageLock(doors,doors.doors[0],0));
  assert.equal(doors.doors[0].lockHp,1);
  assert(W.damageLock(doors,doors.doors[0],1).breached);
  assert(doors.doors.every(d => !d.locked && d.breached));
  assert.throws(() => W.dist(dn,df,3.5,6), /Door lock changed/);
  assert(W.dist(dn,W.flow(dn,[3.5,2],df),3.5,6)>0);
  assert(W.portalOpen(doors,doors.portals[0],'move'));
  const lintel = hit(doors,3.5,2.4);
  W.damage(doors,lintel.panel,lintel.cell,400,'bullet');
  assert.equal(doors.portals.length,1, 'Lintel damage does not duplicate its opening portal');
  const vault = stage({...wall,open:[{...o,kind:'door',build:'door_vault'}]});
  vault.doors[0].locked=true;
  assert(!W.damageLock(vault,vault.doors[0],1e100).breached);
  assert(vault.doors[0].locked);
  vault.doors[0].lockHp=1;
  assert(!W.damageLock(vault,vault.doors[0],1e100).breached);
  assert(vault.doors[0].locked, 'A saved HP override cannot make a vault lock breachable');
  assert.throws(() => W.damageLock(doors,vault.doors[0],1), /Invalid lock/);
  assert.throws(() => W.damageLock(doors,doors.doors[0],-1), /Invalid lock/);

  const grid = W.buildGrid({name:'legacy',map:['########','#..#...#','#..#...#','#..#...#','#..#...#','#..#...#','#..#...#','########']},0);
  grid.doors=[];
  const legacy=W.fromCells(grid), li=4*grid.W+4, lp=legacy.panels[legacy.legacyPanel[li]], lc=legacy.cells[lp.c0];
  assert.throws(() => W.damage(legacy,lp.ref,lp.c0,1,'bullet'), /initialized/);
  lc.hp=600;
  const old=W.nav(legacy,{cellSize:1}), labels=Array.from(legacy.roomTiles), ls=W.damage(legacy,lp.ref,lp.c0,600,'bullet');
  assert.equal(grid.solid[li],0); assert.equal(grid.navVer,1);
  assert.equal(grid.floorT[li],1, 'Destroyed legacy walls expose a renderable floor immediately');
  assert.equal(legacy.roomTiles[li],-1);
  assert(labels.every((v,i) => i===li || legacy.roomTiles[i]===v), 'Legacy room indexes never renumber');
  assert(ls.portal && ls.portal.nx!==0, 'A north/south wall breach connects east/west regions');
  assert(W.portalAt(legacy,4.5,4.5));
  assert.throws(() => W.flow(old,[3.5,4.5]), /rebuild navigation/);
  const ln=W.nav(legacy,{cellSize:1});
  assert(W.dist(ln,W.flow(ln,[3.5,4.5]),5.5,4.5)>0);
  const beforeSync=W.nav(legacy,{cellSize:1});
  grid.solid[li]=1; W.syncCell(legacy,grid,li);
  assert.throws(() => W.flow(beforeSync,[3.5,4.5]), /rebuild navigation/);
  grid.glassSet=new Set([li]); lc.hp=1;
  assert.throws(() => W.damage(legacy,lp.ref,lp.c0,1,'bullet'), /hitGlass/);
  assert(grid.solid[li] && lc.active);
  console.log('WORLD damage: deposited energy, cells, locks, stable breach graphs and navigation invalidation checked');
}

module.exports = { checkDamage };
if (require.main === module) checkDamage();
