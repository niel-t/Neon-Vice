const assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks');
const {worldData}=require('./world-snapshot.cjs');

function checkNav(){
 const {WORLD:W,LEVELS}=worldData();
 const square=(x0,z0,x1,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
 const stage=(width=.9,centre=4)=>({
  id:'nav-test',bounds:[0,0,12,8],combat:true,
  ground:[{id:'floor',poly:square(0,0,12,8),y:0,surf:'tile'}],
  walls:[{id:'wall',path:[[6,.5],[6,7.5]],build:'cbs_ext',cov:'full',h:2.8,open:[{id:'entry',s0:centre-.5-width/2,s1:centre-.5+width/2,y0:0,y1:2.2,kind:'door',build:'door_solid',cov:'full'}]}],
  props:[],rooms:[{id:'left',poly:square(0,0,6,8)},{id:'right',poly:square(6,0,12,8),combat:false}],
  portals:[{id:'door-link',a:'left',b:'right',open:'entry'}]
 });
 const s=W.compile(stage()),p=s.portals[0];
 assert.equal(s.rooms[0].area,48);assert.equal(s.rooms[1].idx,1);assert.equal(s.rooms[1].combat,false);
 assert.deepEqual(Array.from(W.portals(s,0)),[0]);assert.equal(W.roomAt(s,6,4).id,'left');assert.equal(W.portalAt(s,6,4),p);
 assert(!W.portalOpen(s,p,'sight'));assert(W.portalOpen(s,p,'move'));
 s.doors[0].th=Math.PI/2;assert(W.portalOpen(s,p,'sight'));s.doors[0].locked=true;assert(!W.portalOpen(s,p,'move'));s.doors[0].locked=false;
 assert(Object.isFrozen(s.rooms[0].samples[0]));
 for(const width of [.8,.9])for(const centre of [3.5,4,4.2,5.75]){
  const st=W.compile(stage(width,centre)),n=W.nav(st);
  const f=W.flow(n,[9,centre]);
  assert(W.dist(n,f,3,centre)>0,`Narrow door ${width}/${centre} must connect`);
  const closed=W.flow(n,[9,centre],undefined,{closed:['entry']});
  // The wall's free ends leave routes only narrower than diameter.
  assert.equal(W.dist(n,closed,3,centre),-1,'Closed portal excludes door gap');
  const wide=W.nav(st,{radius:width/2+.02});assert.equal(W.dist(wide,W.flow(wide,[9,centre]),3,centre),-1);
 }
 const n=W.nav(s),f=W.flow(n,[9,4]),other=W.flow(n,[3,4]);
 const before=W.dist(n,other,9,4);W.flow(n,[[9,2],[9,6]],f);assert.equal(W.dist(n,other,9,4),before);
 assert.equal(W.flow(n,[6,2],f).reachable,false,'Target inside wall must not seed');
 W.flow(n,[5.7,2],f);assert(f.reachable,'Wall-adjacent target seeds radius-zero visible reps');
 assert.throws(()=>W.dist(W.nav(s),f,3,4),/mismatch/);
 assert.throws(()=>n.tileAt(NaN,4),/finite/);assert.throws(()=>W.nav(s,{radius:-1}),/invalid/);
 const reused=W.flow(n,[9,4],f);assert.equal(reused,f);
 s.doors[0].locked=true;assert.throws(()=>W.step(n,f,3,4),/lock changed/);s.doors[0].locked=false;
 const pos=[3,4],out=[0,0];
 for(let k=0;k<100;k++){
  const next=W.step(n,f,...pos,out);if(!next)break;
  const m=W.move(s,...pos,.3,next[0]-pos[0],next[1]-pos[1]);assert(!m.hit,`Each consumed waypoint must be movement clear: ${pos} -> ${next}, ${JSON.stringify(m)}`);pos[0]=m.x;pos[1]=m.z;
 }
 assert(pos[0]>6.5,'Waypoints cross narrow door');
 const noWall={...stage(),walls:[],portals:[{id:'open',a:'left',b:'right',seg:[[6,1],[6,7]]}]};
 const open=W.compile(noWall);assert(W.portalOpen(open,open.portals[0],'sight'));assert(W.portalOpen(open,open.portals[0],'move'));
 const fullOpen={...noWall,portals:[{id:'open',a:'left',b:'right',seg:[[6,0],[6,8]]}]};
 const fullStage=W.compile(fullOpen),fullNav=W.nav(fullStage);
 assert.equal(W.dist(fullNav,W.flow(fullNav,[9,4],undefined,{closed:['open']}),3,4),-1);
 const arch=stage();arch.walls[0].open[0]={id:'entry',s0:3.05,s1:3.95,y0:0,y1:2.2,kind:'arch'};
 const archStage=W.compile(arch),archNav=W.nav(archStage);
 assert.equal(W.dist(archNav,W.flow(archNav,[9,4],undefined,{closed:['door-link']}),3,4),-1,'Explicit closure applies to arch');
 const glass=stage();glass.walls[0].open[0]={...glass.walls[0].open[0],kind:'window',y0:1,build:'glass_tempered_6',cov:'glass'};
 const pane=W.compile(glass);assert(!pane.portals[0].walk);assert(W.portalOpen(pane,pane.portals[0],'sight'));
 glass.walls[0].open[0].build='glass_block';glass.walls[0].open[0].cov='full';
 const block=W.compile(glass);assert(!W.portalOpen(block,block.portals[0],'sight'));
 const double=stage();double.walls[0].open[0].kind='double';assert.equal(W.compile(double).portals[0].doors.length,2);
 for(const rooms of [
  [{id:'a',poly:square(1,1,5,5)},{id:'b',poly:square(2,2,4,4)}],
  [{id:'a',poly:square(1,1,5,5)},{id:'b',poly:square(1,1,5,5)}],
  [{id:'a',poly:square(1,1,5,5)},{id:'b',poly:square(4,4,6,6)}]
 ])assert.throws(()=>W.compile({...noWall,rooms,portals:[]}),/overlap/);
 const ground=(regions)=>W.compile({...noWall,rooms:[],portals:[],ground:regions.map((r,i)=>({id:`g${i}`,poly:square(...r.slice(0,4)),y:r[4],surf:'tile'}))});
 const slit=ground([[0,0,5.99,8,0],[6.01,0,12,8,0]]);
 assert(!W.clear(slit,5,4,7,4,.3));const slitNav=W.nav(slit);assert.equal(W.dist(slitNav,W.flow(slitNav,[9,4]),3,4),-1);
 const flat=ground([[0,0,6,8,0],[6,0,12,8,0]]);assert(W.clear(flat,5,4,7,4,.3));
 const step=ground([[0,0,6,8,0],[6,0,12,8,.2]]);assert(!W.clear(step,5,4,7,4,.3));
 const overlap=ground([[2,2,4,4,0],[0,0,12,8,0]]);assert(W.clear(overlap,1,3,5,3,.3));
 const snapshot=ground([[0,0,12,8,0]]),snapNav=W.nav(snapshot),snapField=W.flow(snapNav,[9.25,4.25]),snapDistance=W.dist(snapNav,snapField,3.25,4.25);
 snapshot.ground.splice(0);snapshot.buckets.clear();snapshot.panels.splice(0);snapshot.props.splice(0);
 assert.equal(W.dist(snapNav,snapField,3.25,4.25),snapDistance,'Snapshots do not alias geometry collections');
 const u=W.compile({id:'u-test',bounds:[0,0,40,40],combat:true,ground:[],walls:[],props:[],rooms:[{id:'corridor',poly:[[0,0],[40,0],[40,40],[39,40],[39,1],[1,1],[1,40],[0,40]]}]});
 assert(u.rooms[0].samples.length&&u.rooms[0].samples.every(p=>W.roomAt(u,...p)?.id==='corridor'),'Thin concave room gets guaranteed interior sample');
 const notch={...noWall,rooms:[{id:'left',poly:[[0,0],[6,0],[6,1.2],[5,1.2],[5,2],[6,2],[6,8],[0,8]]},noWall.rooms[1]]};
 assert.throws(()=>W.compile(notch),/shared room boundary/,'Portal must not bridge a notch');
 const shortcut=W.compile({id:'shortcut',bounds:[0,0,8,8],combat:true,ground:[{id:'g',poly:square(0,0,8,8),y:0,surf:'tile'}],walls:[],props:[{id:'p',poly:square(3.013,2.007,4.013,4.007),build:'sofa',cov:'full',h:2}]});
 const shortNav=W.nav(shortcut),shortField=W.flow(shortNav,[6.25,3.25]),start=[2.790742011,1.777222941],next=W.step(shortNav,shortField,...start);
 assert(next&&W.clear(shortcut,...start,...next,.3),'Near-node shortcut must retain actual capsule clearance');
 const thin=W.compile({...noWall,rooms:[],portals:[],walls:[{id:'thin',path:[[6,.01],[6,7.99]],build:'glass_tempered_6',cov:'glass',h:2.8}]});
 const thinNav=W.nav(thin);assert.equal(W.dist(thinNav,W.flow(thinNav,[9,4]),3,4),-1,'Thin clear glazing still blocks nav');
 const corner=W.compile({id:'corner',bounds:[0,0,4,4],combat:true,ground:[{id:'g',poly:square(0,0,4,4),y:0,surf:'tile'}],walls:[],props:[
  {id:'p1',poly:square(2,0,4,2),build:'sofa',cov:'full',h:2},{id:'p2',poly:square(0,2,2,4),build:'sofa',cov:'full',h:2}]});
 const cornerNav=W.nav(corner);assert.equal(W.dist(cornerNav,W.flow(cornerNav,[3,3]),1,1),-1,'Diagonal corner cutting rejected');
 assert(!W.clear(s,6,2,6,2,0),'Zero-displacement disc checks overlap');
 const timing=[];
 for(let idx=0;idx<LEVELS.length;idx++){
  const g=W.buildGrid(LEVELS[idx],idx);g.doors=g.doorSpecs.map(d=>({...d,th:0}));
  const st=W.fromCells(g),t0=performance.now(),nav=W.nav(st,{cellSize:1,diagonal:false}),free=[];
  for(let i=0;i<g.solid.length;i++){
   assert.equal(nav.walkable(i),!W.cell.isBlock(g,i%g.W,Math.floor(i/g.W)),`Legacy ${idx}/${i} unit nav occupancy`);
   if(nav.walkable(i))free.push(i);
  }
  const goal=free[Math.floor(free.length/2)],target=[goal%g.W+.5,Math.floor(goal/g.W)+.5],t1=performance.now(),field=W.flow(nav,target),t2=performance.now();
  const old=new Int16Array(g.W*g.H);W.cell.bfs(g,old,goal%g.W,Math.floor(goal/g.W));
  for(const i of free)assert.equal(W.dist(nav,field,i%g.W+.5,Math.floor(i/g.W)+.5),old[i],`Legacy ${idx}/${i} BFS parity`);
  assert(st.rooms.length<=255&&st.rooms.every(r=>r.derived));
  const fine=W.nav(st);for(const d of g.doors){
   const x=d.hx+Math.cos(d.base)*.49,z=d.hz+Math.sin(d.base)*.49,nx=-Math.sin(d.base),nz=Math.cos(d.base),a=[x-nx*.6,z-nz*.6],b=[x+nx*.6,z+nz*.6];
   if(W.clear(st,...a,...b,.3))assert(W.dist(fine,W.flow(fine,b),...a)>=0,'Adapter doorway survives subtiles');
  }
  timing.push({level:idx,buildMs:+(t1-t0).toFixed(2),fieldMs:+(t2-t1).toFixed(2),rooms:st.rooms.length,portals:st.portals.length});
 }
 console.log('WORLD nav/rooms:',JSON.stringify(timing));
 const byteRooms=Array.from({length:256},(_,i)=>({id:`room${i}`,poly:square(i,0,i+1,1)}));
 assert.throws(()=>W.compile({id:'room-cap',bounds:[0,0,256,1],combat:false,ground:[],walls:[],props:[],rooms:byteRooms}),/255 rooms/);
 const last=W.compile({id:'room-cap',bounds:[0,0,255,1],combat:false,ground:[],walls:[],props:[],rooms:byteRooms.slice(0,255)});
 assert.equal(last.rooms[254].idx+1,255,'Last room fits vertex byte without wrapping to unroomed zero');
}
module.exports={checkNav};
if(require.main===module)checkNav();
