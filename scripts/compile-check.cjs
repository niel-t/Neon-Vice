const assert = require('node:assert/strict');
const { worldData } = require('./world-snapshot.cjs');

function checkCompile() {
  const { WORLD: W, LEVELS } = worldData();
  const ground = [{ id: 'floor', poly: [[0,0],[20,0],[20,20],[0,20]], y: 0, surf: 'tile' }];
  const wall = { id: 'partition', path: [[10,2],[10,18]], build: 'cbs_ext', cov: 'full', h: 2.8 };
  const stage = (walls = [], props = []) => ({ id: 'test', bounds: [0,0,20,20], combat: true, ground, walls, props });
  const close = (a,b,eps=1e-8) => assert(Math.abs(a-b)<=eps, `${a} != ${b}`);
  const full = W.compile(stage([wall]));
  assert.equal(full.v, 2); assert.equal(full.policy, 'v2');
  assert(!W.sight(full,5,10,15,10).clear);
  for (const p of full.panels) {
    assert(Math.hypot(p.bx-p.ax,p.bz-p.az)<=.5+1e-8);
    assert(Object.isFrozen(p));
  }
  for (const c of full.cells) { assert(c.y1-c.y0<=.5+1e-8); assert.equal(c.hp,35000); }
  assert.equal(W.groundY(full,3,3),0); assert.equal(W.groundY(full,30,30),null);
  const chest=W.compile(stage([{...wall,cov:'chest',h:1.2}]));
  assert(W.sight(chest,5,10,15,10).clear);
  assert(!W.sight(chest,5,10,15,10,1,1.1).clear);
  assert(!W.sight(chest,5,10,15,10,1.6,1.1).clear, 'Crouched target is hidden behind chest cover');
  for (const cov of ['waist','rail']) {
    const st=W.compile(stage([{...wall,cov,h:cov==='waist'?.9:1}]));
    assert(W.sight(st,5,10,15,10,1,1.1).clear);
    assert(W.move(st,5,10,.3,10,0).hit, 'Low cover still blocks movement');
  }
  const glass=W.compile(stage([{...wall,build:'glass_tempered_6',cov:'glass'}]));
  assert(W.sight(glass,5,10,15,10).clear);
  assert(W.trace(glass,5,10,15,10).length);
  const block=W.compile(stage([{...wall,build:'glass_block'}]));
  assert(!W.sight(block,5,10,15,10).clear);
  const window={id:'pane',s0:4,s1:8,y0:1,y1:2.5,kind:'window',build:'glass_tempered_6',cov:'glass'};
  const glazing=W.compile(stage([{...wall,open:[window]}]));
  assert(W.sight(glazing,5,8,15,8).clear);
  assert(W.trace(glazing,5,8,15,8,1.6).some(h=>h.kind==='window'));
  assert(!W.sight(glazing,5,8,15,8,.7,.7).clear);
  const translucent=W.compile(stage([{...wall,open:[{...window,build:'glass_block',cov:'full'}]}]));
  assert(!W.sight(translucent,5,8,15,8).clear, 'Short glass-block window still blocks eye-height sight');
  const arch=W.compile(stage([{...wall,open:[{id:'arch',s0:4,s1:8,y0:0,y1:2.2,kind:'arch'}]}]));
  assert(W.sight(arch,5,8,15,8).clear); assert(!W.move(arch,5,8,.3,10,0).hit);
  for(const c of full.cells)if(c.y0<=1.6&&c.y1>1.6)c.active=false;
  assert(W.sight(full,5,10,15,10).clear, 'Eye-height hole opens sight');
  assert(W.move(full,5,10,.3,10,0).hit, 'Eye-height hole does not remove movement barrier');
  const prop={id:'cabinet',poly:[[9,9],[11,9],[11,11],[9,11]],build:'sofa',cov:'full',h:2};
  const props=W.compile(stage([], [prop]));
  assert(W.sight(props,5,10,15,10).clear); assert(W.move(props,5,10,.3,10,0).hit);
  assert(W.trace(props,5,10,15,10,.7).some(h=>h.kind==='prop'));
  assert.equal(W.trace(props,5,10,15,10,3).length,0);
  close(W.trace(props,5,4,15,14)[0].cos,Math.SQRT1_2);
  for(const r of [0,.3]){
    const escape=W.move(props,9,10,r,-1,0);
    assert(escape.overlap&&!escape.hit);close(escape.x,8);
    assert(W.move(props,9,10,r,1,0).hit);
  }
  const reversed=W.compile(stage([], [{...prop,poly:[...prop.poly].reverse()}]));
  close(W.move(reversed,9,10,.3,-1,0).x,8);
  close(W.trace(props,9,10,9.1,10.5)[0].cos,.1/Math.hypot(.1,.5));
  for(const angle of [0,Math.PI/12]){
    const cs=Math.cos(angle),sn=Math.sin(angle),poly=prop.poly.map(([x,z])=>[10+(x-10)*cs-(z-10)*sn,10+(x-10)*sn+(z-10)*cs]);
    for(const winding of [poly,[...poly].reverse()]){
      const st=W.compile(stage([], [{...prop,poly:winding}]));
      const edge=[(poly[0][0]+poly[3][0])/2,(poly[0][1]+poly[3][1])/2],nx=-cs,nz=-sn;
      for(const offset of [-1e-10,0,1e-10])for(const r of [0,.3]){
        const x=edge[0]+nx*offset,z=edge[1]+nz*offset,escape=W.move(st,x,z,r,nx,nz),enter=W.move(st,x,z,r,-nx*.5,-nz*.5);
        assert(!escape.hit&&escape.overlap);close(escape.x,x+nx);close(escape.z,z+nz);assert(enter.hit);
      }
      const hit=W.trace(st,...edge,edge[0]-nx*.1-sn*.5,edge[1]-nz*.1+cs*.5)[0];
      close(hit.cos,.1/Math.hypot(.1,.5));
    }
  }
  const step=W.compile({...stage(),ground:[ground[0],{id:'raised',poly:[[2,2],[4,2],[4,4],[2,4]],y:2,surf:'wood'}]});
  assert(W.sight(step,1,3,5,3).clear);
  // First ground polygon wins, so list raised region first for a height query.
  const raised=W.compile({...stage(),ground:[step.ground[1],ground[0]]});
  assert.equal(W.groundY(raised,3,3),2);
  const curve=W.compile(stage([{...wall,path:{arc:[10,10,4,-Math.PI/2,Math.PI/2]}}]));
  assert(!W.sight(curve,10,10,18,10).clear);
  for(const p of curve.panels){close(Math.hypot(p.ax-10,p.az-10),4); assert(Math.hypot(p.bx-p.ax,p.bz-p.az)<=.5);}
  const curveWindow=W.compile(stage([{...wall,path:{arc:[10,10,4,-Math.PI/2,Math.PI/2]},open:[{...window,s0:5,s1:7}]}]));
  assert(W.sight(curveWindow,10,10,18,10).clear);
  const doorOpen={id:'door',s0:5,s1:7,y0:0,y1:2.2,kind:'door',build:'door_solid',cov:'full'};
  const doors=W.compile(stage([{...wall,open:[doorOpen]}]));
  assert(!W.sight(doors,5,8,15,8).clear);
  doors.doors[0].th=Math.PI/2;
  assert(W.sight(doors,5,8,15,8).clear);
  doors.doors[0].th=Math.PI/4;
  assert(W.trace(doors,9,8,11,6,1).some(h=>h.kind==='door'));
  assert.equal(Object.getOwnPropertyDescriptor(doors.doors[0],'hx').writable,false);
  doors.doors[0].th=NaN;assert.throws(()=>W.sight(doors,5,8,15,8),/finite/);doors.doors[0].th=0;
  const double=W.compile(stage([{...wall,open:[{...doorOpen,kind:'double'}]}]));
  assert.equal(double.doors.length,2);
  assert(!W.sight(double,5,7.5,15,7.5).clear);
  assert(!W.sight(double,5,8.5,15,8.5).clear);
  const sliding=W.compile(stage([{...wall,open:[{...doorOpen,kind:'slide'}]}]));
  assert(!W.sight(sliding,5,8,15,8).clear);
  sliding.doors[0].slide=1;
  assert(W.sight(sliding,5,8,15,8).clear);
  assert(!W.move(doors,5,8,.3,10,0).hit, 'Door leaves are resolved by the dedicated door collider');
  const metal=W.compile(stage([{...wall,build:'steel_3mm'}]));
  const hit=W.trace(metal,5,9.8,15,10.2,.7),L=Math.hypot(10,.4);
  const intervals=hit.map(h=>[h.t0,h.t1]).sort((a,b)=>a[0]-b[0]);let length=0,end=-1;
  for(const [a,b] of intervals){length+=Math.max(0,b-Math.max(a,end));end=Math.max(end,b);}
  close(length*L,.0032*L/10,1e-6);
  assert(hit.every(h=>h.cos>0&&h.path>=0&&h.t0<=h.t1));
  const headOn=W.move(metal,5,10,.3,50,0);
  assert(headOn.hit); close(headOn.x,10-.0016-.3,2e-4);
  const slide=W.move(metal,5,5,.3,10,5);
  assert(slide.hit); assert(slide.z>9.9);
  const touching=W.move(metal,10-.0016-.3,5,.3,0,3);
  assert(!touching.hit);close(touching.z,8);
  const leave=W.move(metal,9.9,10,.3,-2,0);
  assert(leave.overlap&&!leave.hit);close(leave.x,7.9);
  const enter=W.move(metal,9.9,10,.3,2,0);assert(enter.overlap&&enter.hit);
  const boundary=W.move(W.compile(stage()),1,1,.3,-5,0);assert(boundary.hit);assert(boundary.x>=.3);
  const cover=W.coverAt(metal,9,10,1,0,2);assert(cover.length);close(cover[0].h,2.8);
  for(const c of metal.cells)c.active=false;
  assert.equal(W.coverAt(metal,9,10,1,0,2).length,0);
  assert(!W.move(metal,5,10,.3,10,0).hit);
  const negative=[
    {...stage(),combat:undefined},{...stage(),bounds:[0,0,0,20]},
    {...stage(),walls:undefined},{...stage(),rooms:{}},
    stage([{...wall,h:1.2}]),stage([{...wall,cov:'chest',h:2}]),
    stage([{...wall,build:'not_a_build'}]),stage([{...wall,path:[[1,1],[1,1]]}]),
    stage([{...wall,path:{arc:[10,10,.1,0,1]}}]),stage([{...wall,path:{arc:[10,10,4,0,1]},closed:true}]),
    stage([{...wall,path:[[0,0],[0,20]]}]),stage([{...wall,id:'floor'}]),
    stage([{...wall,open:[{...doorOpen,s1:30}]}]),stage([{...wall,open:[doorOpen,{...doorOpen,id:'overlap'}]}]),
    stage([{...wall,open:[{...doorOpen,y0:1}]}]),
    stage([{...wall,open:[{...doorOpen,door:{slide:.5}}]}]),
    stage([{...wall,open:[{...doorOpen,kind:'slide',door:{th:.2}}]}]),
    stage([{...wall,path:{arc:[10,10,4,0,2]},open:[doorOpen]}]),
    {...stage(),unknown:1},
    stage([], [{...prop,poly:[[3,3],[5,5],[3,5],[5,3]]}])
  ];
  for(const bad of negative)assert.throws(()=>W.compile(bad));
  const selfTouch=[[3,3],[5,5],[7,3],[7,5],[3,5]];
  for(let i=0;i<selfTouch.length;i++)assert.throws(()=>W.compile({...stage(),ground:[{...ground[0],poly:[...selfTouch.slice(i),...selfTouch.slice(0,i)]}]}),/simple/);
  assert.throws(()=>W.compile(Object.create(stage())),/Inherited/);
  assert.throws(()=>W.compile({...stage(),rooms:[{id:'room',note:new Date()}]}),/JSON-like/);
  const source=stage([{...wall}]);const owned=W.compile(source);source.walls[0].path[0][0]=0;assert.equal(owned.panels[0].ax,10);
  checkJoints(W,close);
  checkAdapter(W,LEVELS);
  console.log('WORLD v2: freeform openings, cells, optics, curves, live doors, analytic movement and cover checked');
}

function checkJoints(W,close) {
  const spec = path => ({id:'corners',bounds:[0,0,50,50],combat:true,ground:[],walls:[{id:'bent',path,build:'rc_column_40',cov:'full',h:2.8}],props:[]});
  const area=poly=>Math.abs(poly.reduce((sum,a,i)=>{const b=poly[(i+1)%poly.length];return sum+a[0]*b[1]-a[1]*b[0];},0))/2;
  const intersection=(subject,clip)=>{
    let out=subject;
    const sign=Math.sign(clip.reduce((sum,a,i)=>{const b=clip[(i+1)%clip.length];return sum+a[0]*b[1]-a[1]*b[0];},0));
    for(let i=0;i<clip.length&&out.length;i++){
      const a=clip[i],b=clip[(i+1)%clip.length],dist=p=>sign*((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])),next=[];
      for(let j=0;j<out.length;j++){
        const p=out[j],q=out[(j+1)%out.length],dp=dist(p),dq=dist(q);
        if(dp>=0)next.push(p);
        if((dp>=0)!==(dq>=0)){const u=dp/(dp-dq);next.push([p[0]+(q[0]-p[0])*u,p[1]+(q[1]-p[1])*u]);}
      }out=next;
    }return out;
  };
  const inspect=(st,length,width)=>{
    close(st.panels.reduce((sum,p)=>sum+area(p.poly),0),length*width,1e-8);
    for(let i=0;i<st.panels.length;i++){
      const a=st.panels[i];assert(Math.hypot(a.bx-a.ax,a.bz-a.az)<=.5+1e-8);
      for(let j=i+1;j<st.panels.length;j++)assert(area(intersection(a.poly,st.panels[j].poly))<1e-10, 'Same-wall panel interiors must not overlap');
    }
  };
  for(const deg of [90,120,135]){
    const theta=deg*Math.PI/180,path=[[10,20],[20,20],[20+10*Math.cos(theta),20+10*Math.sin(theta)]],st=W.compile(spec(path));
    inspect(st,20,.4);
    const v=[-Math.tan(theta/2)*.2,.2],d=Math.hypot(...v),mid=[20-v[0]*.95,20-v[1]*.95],nx=-v[1]/d,nz=v[0]/d;
    assert(!W.sight(st,mid[0]-nx*.03,mid[1]-nz*.03,mid[0]+nx*.03,mid[1]+nz*.03).clear, 'Outer mitre must be intact');
    const outside=[20-v[0]*1.05,20-v[1]*1.05];
    assert(W.sight(st,outside[0]-nx*.001,outside[1]-nz*.001,outside[0]+nx*.001,outside[1]+nz*.001).clear);
  }
  const right=W.compile(spec([[10,20],[20,20],[20,30]]));
  assert(!W.sight(right,22.907,20.765,17.213,18.875).clear, 'Reviewed corner-leak repro');
  const thick=spec([[10,20],[10.6,20],[10.6,20.6]]);thick.walls[0].build='sofa';inspect(W.compile(thick),1.2,.62);
  const zig=spec([[10,20],[20,20],[20,20.1],[30,20.1]]);inspect(W.compile(zig),20.1,.4);
  const closed=spec([[10,10],[20,10],[20,20],[10,20]]);closed.walls[0].closed=true;inspect(W.compile(closed),40,.4);
  for(const [radius,build] of [[.5,'sofa'],[4,'cbs_ext']]){
    const curve=spec({arc:[20,20,radius,-Math.PI/2,Math.PI/2]});curve.walls[0].build=build;
    const st=W.compile(curve),length=st.panels.reduce((sum,p)=>sum+Math.hypot(p.bx-p.ax,p.bz-p.az),0);
    inspect(st,length,W.materials.describe(build).thicknessCm/100);
  }
  const opening={id:'window',kind:'window',s0:9.95,s1:10.1,y0:1,y1:2.5,build:'glass_tempered_6',cov:'glass'};
  for(const [s0,s1] of [[9.5,9.95],[9.95,10.1],[10.05,10.1]]){
    const cut=spec([[10,20],[20,20],[20,30]]);cut.walls[0].open=[{...opening,s0,s1}];
    const st=W.compile(cut);assert(st.panels.some(p=>p.kind==='window'));
  }
  const mergedLength=hits=>{
    let end=-1,total=0;for(const h of hits){total+=Math.max(0,h.t1-Math.max(end,h.t0))*Math.hypot(10,10);end=Math.max(end,h.t1);}return total;
  };
  close(mergedLength(W.trace(right,15,25,25,15)),Math.SQRT2*.4);
  const bad=[
    [[10,20],[20,20],[10,20]],[[10,20],[20,20],[20+10*Math.cos(Math.PI*5/6),25]],
    [[10,10],[20,10],[20,20],[10,10]],{arc:[20,20,4,0,Math.PI*2]}
  ];
  for(const path of bad)assert.throws(()=>W.compile(spec(path)));
  const cramped=spec([[10,20],[20,20],[20,20.5],[10,20.5]]);cramped.walls[0].build='sofa';assert.throws(()=>W.compile(cramped),/convex|simple/);
  const jamb=spec([[10,20],[20,20],[20,30]]);jamb.walls[0].open=[{...opening,kind:'door',y0:0,y1:2.2,s0:9,s1:10,build:'door_solid',cov:'full'}];assert.throws(()=>W.compile(jamb),/mitre/);
  const separate=spec([[10,20],[20,20]]);separate.walls.push({...separate.walls[0],id:'other',path:[[20,20],[20,30]]});assert.throws(()=>W.compile(separate),/one path/);
  const outside=spec([[10,1],[49.9,1],[49.9,20]]);assert.throws(()=>W.compile(outside),/bounds/);
  const inner=W.move(right,18,22,.26,4,-4);assert(inner.hit);close(inner.x,19.54,2e-4);close(inner.z,20.46,2e-4);
  const outer=W.move(right,22,18,.26,-4,4);assert(outer.hit);assert(outer.z>18);
  const straight=W.compile(spec([[10,20],[40,20]]));let x=11,z=19.54;
  for(let i=0;i<250;i++){const m=W.move(straight,x,z,.26,.1,.02);x=m.x;z=m.z;}
  assert(x>35.99&&z<19.541, 'Repeated seam slides must not stall');
}

function checkAdapter(W,LEVELS) {
  let seed=41981;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  let total=0,mismatches=0,nearTotal=0,nearMismatches=0;
  for(let idx=0;idx<LEVELS.length;idx++){
    const g=W.buildGrid(LEVELS[idx],idx);g.doors=g.doorSpecs.map(d=>({...d,th:0,w:0,pusher:''}));
    const st=W.fromCells(g),floor=[];
    const probe={...g,W:3,H:3,solid:new Uint8Array(9),wh:new Float32Array(9),furn:new Uint8Array(9),doors:[]};probe.solid[4]=1;
    closeLegacyCos(W,probe);
    for(let i=0;i<g.solid.length;i++)if(!g.solid[i])floor.push(i);
    const sample=()=>{const i=floor[Math.floor(random()*floor.length)];return[i%g.W+random(),Math.floor(i/g.W)+random()];};
    let errors=0,near=0,nearErrors=0;
    for(let k=0;k<3000;k++){
      const a=sample(),b=sample(),dist=Math.hypot(b[0]-a[0],b[1]-a[1]);
      const old=W.cell.los(g,...a,...b),now=W.sight(st,...a,...b);
      total++;if(dist<=13){near++;nearTotal++;}
      if(old!==now.clear){
        errors++;mismatches++;if(dist<=13){nearErrors++;nearMismatches++;}
        assert(old&&!now.clear&&now.kind==='wall','Adapter must never lose a legacy blocker');
        const p=st.panels.find(p=>p.ref===now.ref),hits=W.trace(st,...a,...b);
        const h=hits.find(h=>h.ref===p.ref&&h.kind==='wall');
        assert(h&&h.path<.15+1e-8,'Mismatch must be a sub-sample corner clip');
      }
      // Body-clearance sweep agreement: endpoints must be collision-free.
      const r=.26;
      const safe=p=>{
        const c={x:p[0],z:p[1],r};W.cell.collideGrid(g,c);return Math.hypot(c.x-p[0],c.z-p[1])<1e-8;
      };
      if(safe(a)&&safe(b)){
        const clear=W.cell.moveClear(g,...a,...b,r),m=W.move(st,...a,r,b[0]-a[0],b[1]-a[1]);
        assert.equal(!m.hit&&!m.overlap,clear,`Level ${idx}: movement clearance parity`);
      }
    }
    assert(errors/3000<=.01);assert(!near||nearErrors/near<=.01);
    for(const d of g.doors){
      for(let k=0;k<15;k++){
        d.th=(random()-.5)*Math.PI;
        const a=[d.hx-1+random()*2,d.hz-1+random()*2],b=[d.hx-1+random()*2,d.hz-1+random()*2];
        const legacy=W.cell.doorHit(g,...a,...b),hits=W.trace(st,...a,...b).filter(h=>h.kind==='door');
        if(legacy){assert(hits.length);assert(Math.abs(hits[0].t0-legacy.t)<1e-9);}
        else assert.equal(hits.length,0);
      }d.th=0;
    }
    const i=floor.find(i=>i%g.W>1&&Math.floor(i/g.W)>1);
    g.solid[i]=1;W.syncCell(st,g,i);assert(st.cells[st.panels[st.legacyPanel[i]].c0].active);
    g.solid[i]=0;W.syncCell(st,g,i);assert(!st.cells[st.panels[st.legacyPanel[i]].c0].active);
    console.log(`Adapter ${idx}: ${(100*(1-errors/3000)).toFixed(3)}% sight agreement; within13m ${(100*(1-nearErrors/near)).toFixed(3)}%; ${st.panels.length} reserved panels/${st.props.length} props`);
  }
  console.log(`Adapter total: ${total} rays, ${mismatches} classified corner clips; within13m ${nearTotal} rays/${nearMismatches} clips`);
}

function closeLegacyCos(W,g) {
  const hit=W.trace(W.fromCells(g),.5,1.5,2.5,1.5)[0];
  assert.equal(hit.cos,1,'Legacy box head-on uses its actual entry face');
}

module.exports={checkCompile};
if(require.main===module)checkCompile();
