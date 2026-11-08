'use strict';
// Plan format v1 (W2): room-first level authoring compiled to WORLD.compile v2 stages. See docs/PLAN-FORMAT.md.
// DOM/GL-free classic script; plans/<mission>.js register into PLANS. Not loaded by the game yet.
const PLANS={};
const PLAN=(()=>{
 const EPS=1e-6,TOL=1e-4,SNAP=1e3,PAD=.5;
 const STANCE={standing:[1.6,1.8],crouched:[1,1.1]};
 const SPAWN_KINDS=new Set(['player','enemy','civ','item','exit','arrive']);
 const W=()=>{if(typeof WORLD==='undefined'||!WORLD.compile)throw new Error('PLAN needs WORLD v2 loaded first');return WORLD;};
 const snap=v=>Math.round(v*SNAP)/SNAP;
 const key=p=>`${snap(p[0])},${snap(p[1])}`;
 const cross=(ax,az,bx,bz)=>ax*bz-az*bx;
 const dist=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
 const fail=(where,msg)=>{throw new Error(`${where}: ${msg}`);};
 const num=(v,where,name)=>{if(!Number.isFinite(v))fail(where,`${name} must be a finite number`);return v;};
 const pt=(p,where,name='point')=>{if(!Array.isArray(p)||p.length!==2)fail(where,`${name} must be [x,z]`);return[snap(num(p[0],where,name)),snap(num(p[1],where,name))];};
 function area(poly){let a=0;for(let i=0;i<poly.length;i++)a+=cross(...poly[i],...poly[(i+1)%poly.length]);return a/2;}
 function inside(poly,x,z){
  let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[j],b=poly[i];
   if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;
 }
 // parameter t of p on segment a-b, or null when p is off the segment by more than tol metres
 function onSeg(p,a,b,tol=TOL){
  const L=dist(a,b),t=((p[0]-a[0])*(b[0]-a[0])+(p[1]-a[1])*(b[1]-a[1]))/(L*L);
  return t>-tol/L&&t<1+tol/L&&Math.abs(cross(p[0]-a[0],p[1]-a[1],b[0]-a[0],b[1]-a[1]))/L<tol?t:null;
 }
 function roomPoly(r,where){
  if((r.rect!==undefined)===(r.poly!==undefined))fail(where,'needs exactly one of rect or poly');
  if(r.rect){if(!Array.isArray(r.rect)||r.rect.length!==4)fail(where,'rect must be [x0,z0,x1,z1]');
   const [x0,z0,x1,z1]=r.rect.map(v=>snap(num(v,where,'rect')));if(x1<=x0||z1<=z0)fail(where,'rect has no area');
   return[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];}
  if(!Array.isArray(r.poly)||r.poly.length<3)fail(where,'poly needs three points');
  const p=r.poly.map(q=>pt(q,where,'poly'));if(Math.abs(area(p))<EPS)fail(where,'poly has no area');
  for(let i=0;i<p.length;i++)for(let j=i+2;j<p.length;j++){if(i===0&&j===p.length-1)continue;
   const [a,b,c,d]=[p[i],p[i+1],p[j],p[(j+1)%p.length]],d1=cross(b[0]-a[0],b[1]-a[1],c[0]-a[0],c[1]-a[1]),d2=cross(b[0]-a[0],b[1]-a[1],d[0]-a[0],d[1]-a[1]),
    d3=cross(d[0]-c[0],d[1]-c[1],a[0]-c[0],a[1]-c[1]),d4=cross(d[0]-c[0],d[1]-c[1],b[0]-c[0],b[1]-c[1]);
   if(d1*d2<0&&d3*d4<0)fail(where,'poly self-intersects');}
  return area(p)<0?p.reverse():p;
 }
 const rectPoly=(cx,cz,w,d,rot=0)=>{const c=Math.cos(rot),s=Math.sin(rot);
  return[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>[snap(cx+u*c-v*s),snap(cz+u*s+v*c)]);};

 // ---- rooms -> atomic boundary segments with the innermost room on each side ---------------------
 function derive(plan,sid){
  const S=plan?.stages?.[sid];if(!S)fail(`${plan?.id}/${sid}`,'unknown stage');
  const where=`${plan.id}/${sid}`,def={shell:'cbs_ext',part:'cmu_hollow',inner:'stud_wood_gyp',h:2.8,surf:'concrete',...(S.defaults||{})};
  if(!Array.isArray(S.bounds)||S.bounds.length!==4)fail(where,'bounds must be [x0,z0,x1,z1]');
  const rooms=new Map();
  for(const r of S.rooms||[]){
   const w=`${where} room ${r?.id}`;if(typeof r.id!=='string'||!/^[A-Za-z0-9_-]+$/.test(r.id)||rooms.has(r.id))fail(w,'missing, invalid or duplicate id (letters, digits, _ and -; . is reserved for split pieces)');
   const zone=r.zone??'interior';if(!['interior','exterior'].includes(zone))fail(w,'zone must be interior or exterior');
   const poly=roomPoly(r,w);rooms.set(r.id,{...r,zone,poly,gross:area(poly),kids:[]});
  }
  for(const r of rooms.values()){
   if(r.in===undefined)continue;const p=rooms.get(r.in);if(!p)fail(`${where} room ${r.id}`,`parent ${r.in} not found`);
   for(let a=p;a;a=a.in!==undefined?rooms.get(a.in):null)if(a===r)fail(`${where} room ${r.id}`,'nesting cycle');
   for(const q of r.poly)if(!inside(p.poly,...q)&&!p.poly.some((a,i)=>onSeg(q,a,p.poly[(i+1)%p.poly.length])!==null))fail(`${where} room ${r.id}`,`not inside parent ${p.id}`);
   p.kids.push(r.id);
  }
  const depth=r=>r.in===undefined?0:1+depth(rooms.get(r.in)),top=r=>r.in===undefined?r:top(rooms.get(r.in));
  // a unit is the outermost interior ancestor: partitions inside one unit, demising walls between units
  const unit=r=>r.in!==undefined&&rooms.get(r.in).zone==='interior'?unit(rooms.get(r.in)):r;
  for(const r of rooms.values()){r.depth=depth(r);r.net=r.gross-r.kids.reduce((s,k)=>s+rooms.get(k).gross,0);}
  // unrelated rooms must not overlap: no proper edge crossing, no vertex strictly inside the other
  const anc=(r,q)=>{for(let a=r;a;a=a.in!==undefined?rooms.get(a.in):null)if(a===q)return true;return false;};
  const onB=(poly,p)=>poly.some((a,i)=>onSeg(p,a,poly[(i+1)%poly.length])!==null);
  const crossing=(a,b,c,d)=>{const d1=cross(b[0]-a[0],b[1]-a[1],c[0]-a[0],c[1]-a[1]),d2=cross(b[0]-a[0],b[1]-a[1],d[0]-a[0],d[1]-a[1]),
   d3=cross(d[0]-c[0],d[1]-c[1],a[0]-c[0],a[1]-c[1]),d4=cross(d[0]-c[0],d[1]-c[1],b[0]-c[0],b[1]-c[1]);return d1*d2<-EPS&&d3*d4<-EPS;};
  const all=[...rooms.values()];
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const A=all[i],B=all[j];if(anc(A,B)||anc(B,A))continue;
   const hit=A.poly.some(p=>inside(B.poly,...p)&&!onB(B.poly,p))||B.poly.some(p=>inside(A.poly,...p)&&!onB(A.poly,p))||
    A.poly.some((a,k)=>B.poly.some((c,m)=>crossing(a,A.poly[(k+1)%A.poly.length],c,B.poly[(m+1)%B.poly.length])));
   if(hit)fail(where,`rooms ${A.id} and ${B.id} overlap (nest with in:, or fix the bounds)`);}
  const ordered=[...rooms.values()].sort((a,b)=>b.depth-a.depth);
  const roomAt=(x,z)=>{for(const r of ordered)if(inside(r.poly,x,z))return r.id;return null;};
  const chainOk=(x,z)=>{const hit=ordered.filter(r=>inside(r.poly,x,z));for(let i=0;i+1<hit.length;i++){let a=hit[i];while(a&&a.in!==hit[i+1].id)a=a.in!==undefined?rooms.get(a.in):null;if(!a)return[hit[i].id,hit[i+1].id];}return null;};
  const verts=[...rooms.values()].flatMap(r=>r.poly),segs=new Map();
  for(const r of rooms.values())for(let i=0;i<r.poly.length;i++){
   const a=r.poly[i],b=r.poly[(i+1)%r.poly.length],cuts=[0,1];
   for(const v of verts){const t=onSeg(v,a,b);if(t!==null&&t>EPS&&t<1-EPS)cuts.push(t);}
   cuts.sort((x,y)=>x-y);
   for(let k=1;k<cuts.length;k++){
    if((cuts[k]-cuts[k-1])*dist(a,b)<TOL)continue;
    const p=[snap(a[0]+(b[0]-a[0])*cuts[k-1]),snap(a[1]+(b[1]-a[1])*cuts[k-1])],q=[snap(a[0]+(b[0]-a[0])*cuts[k]),snap(a[1]+(b[1]-a[1])*cuts[k])];
    const [P,Q]=key(p)<key(q)?[p,q]:[q,p],K=`${key(P)}|${key(Q)}`;if(!segs.has(K))segs.set(K,{a:P,b:Q});
   }
  }
  const pairKey=(a,b)=>[a??'-',b??'-'].sort().join('|');
  const edges=[];
  for(const s of segs.values()){
   const dx=s.b[0]-s.a[0],dz=s.b[1]-s.a[1],l=Math.hypot(dx,dz),m=[(s.a[0]+s.b[0])/2,(s.a[1]+s.b[1])/2],o=2e-3;
   const pl=[m[0]-dz/l*o,m[1]+dx/l*o],pr=[m[0]+dz/l*o,m[1]-dx/l*o];
   for(const q of [pl,pr]){const bad=chainOk(...q);if(bad)fail(where,`rooms ${bad[0]} and ${bad[1]} overlap near ${key(q)} (nest with in:, or fix the bounds)`);}
   const L=roomAt(...pl),R=roomAt(...pr);if(L===R)continue;
   edges.push({a:s.a,b:s.b,L,R,k:pairKey(L,R),len:l,pl,pr});
  }
  // overrides: rooms:[a, b|null|[b,c,...]]
  const overrides=new Map();
  for(const e of S.edges||[]){
   const w=`${where} edge ${JSON.stringify(e.rooms)}`;if(!Array.isArray(e.rooms)||e.rooms.length!==2)fail(w,'rooms must be [a, b|null|[b,...]]');
   for(const b of [].concat(e.rooms[1])){for(const id of [e.rooms[0],b])if(id!==null&&!rooms.has(id))fail(w,`unknown room ${id}`);
    const k=pairKey(e.rooms[0],b);if(overrides.has(k))fail(w,`duplicate edge override ${k}`);
    if(!e.none&&!e.build)fail(w,'needs none:true or a build');overrides.set(k,{...e,used:false});}
  }
  const inherit=(r,f)=>{for(let a=r;a;a=a.in!==undefined?rooms.get(a.in):null)if(a[f]!==undefined)return a[f];return undefined;};
  for(const e of edges){
   const A=e.L?rooms.get(e.L):null,B=e.R?rooms.get(e.R):null,o=overrides.get(e.k);if(o)o.used=true;
   const inA=A?.zone==='interior',inB=B?.zone==='interior';
   e.wall=null;if(o?.none||(!o&&!inA&&!inB))continue;
   let build=o?.build;
   if(!build){
    if(inA&&inB){
     if(unit(A)===unit(B)){
      if(A.depth!==B.depth)build=(A.depth>B.depth?A:B).part;
      else{if(A.part&&B.part&&A.part!==B.part)fail(where,`rooms ${A.id}/${B.id} disagree on partition build (${A.part} vs ${B.part}); add an edges override`);build=A.part??B.part;}
      if(!build){// the deeper room's parent, else the siblings' parents (orientation-independent)
       const pp=r=>r.in!==undefined?rooms.get(r.in).part:undefined;
       if(A.depth!==B.depth)build=pp(A.depth>B.depth?A:B);
       else{const pa=pp(A),pb=pp(B);if(pa&&pb&&pa!==pb)fail(where,`rooms ${A.id}/${B.id}: parents disagree on partition build (${pa} vs ${pb}); add an edges override`);build=pa??pb;}
       build??=def.inner;
      }
     }else build=def.part;
    }else build=inherit(inA?A:B,'shell')??def.shell;
   }
   const hOf=r=>r?.zone==='interior'?inherit(r,'h')??def.h:0,h=o?.h??(Math.max(hOf(A),hOf(B))||def.h);
   e.wall={build,cov:o?.cov??'full',h,shell:!(inA&&inB)};
  }
  for(const o of overrides.values())if(!o.used)fail(where,`edge override ${JSON.stringify(o.rooms)} matches no shared boundary`);
  return{S,where,def,rooms,edges,pairKey,roomAt,top};
 }

 // ---- wall graph -> compile wall paths ---------------------------------------------------------
 function chains(edges,halfOf){
  const nodes=new Map(),pk=w=>`${w.build}|${w.cov}|${w.h}`,walls=edges.filter(e=>e.wall);
  walls.forEach((e,i)=>{e.i=i;for(const end of ['a','b']){const k=key(e[end]);if(!nodes.has(k))nodes.set(k,[]);nodes.get(k).push([i,end]);}});
  const away=(e,end)=>{const o=end==='a'?e.b:e.a,p=e[end],l=dist(p,o);return[(o[0]-p[0])/l,(o[1]-p[1])/l];};
  const pair=new Map();
  for(const inc of nodes.values()){
   const opts=[];
   for(let x=0;x<inc.length;x++)for(let y=x+1;y<inc.length;y++){
    const [i,ei]=inc[x],[j,ej]=inc[y];if(pk(walls[i].wall)!==pk(walls[j].wall))continue;
    const u=away(walls[i],ei),v=away(walls[j],ej),dot=u[0]*v[0]+u[1]*v[1];// -1 = straight through
    if(dot>Math.cos(Math.PI/4)+EPS)continue;// turn sharper than 135 degrees
    if(inc.length>2&&dot>-1+1e-6)continue;// junctions only continue straight through
    opts.push([dot,x,y]);
   }
   opts.sort((p,q)=>p[0]-q[0]);const used=new Set();
   for(const [,x,y] of opts){if(used.has(x)||used.has(y))continue;used.add(x);used.add(y);
    pair.set(`${inc[x][0]}${inc[x][1]}`,inc[y]);pair.set(`${inc[y][0]}${inc[y][1]}`,inc[x]);}
  }
  const seen=new Set(),out=[];
  const walk=(i,from)=>{const pts=[walls[i][from]],segs=[];let cur=i,end=from;
   for(;;){seen.add(cur);segs.push(cur);const other=end==='a'?'b':'a';pts.push(walls[cur][other]);
    const nx=pair.get(`${cur}${other}`);if(!nx||seen.has(nx[0]))return{pts,segs,closed:!!nx&&nx[0]===i};
    cur=nx[0];end=nx[1];}};
  for(const e of walls)for(const end of ['a','b'])if(!seen.has(e.i)&&!pair.has(`${e.i}${end}`))out.push(walk(e.i,end));
  for(const e of walls)if(!seen.has(e.i)){const c=walk(e.i,'a');c.closed=true;out.push(c);}
  const straight=(a,b,d)=>Math.abs(cross(b[0]-a[0],b[1]-a[1],d[0]-b[0],d[1]-b[1]))<1e-9+EPS*dist(a,b)*dist(b,d)&&((b[0]-a[0])*(d[0]-b[0])+(b[1]-a[1])*(d[1]-b[1]))>0;
  for(const c of out){
   c.wall=walls[c.segs[0]].wall;c.half=halfOf(c.wall.build);c.edges=c.segs.map(i=>walls[i]);
   let p=c.pts;if(c.closed){p.pop();const n=p.length;p=p.filter((b,i)=>!straight(p[(i+n-1)%n],b,p[(i+1)%n]));}
   else p=p.filter((b,i)=>i===0||i===p.length-1||!straight(p[i-1],b,p[i+1]));
   c.pts=p.map(q=>q.slice());c.raw=c.pts.map(q=>q.slice());
  }
  // stable ids: lowest room-pair key in the chain plus a counter
  const used=new Map();
  for(const c of out.map(c=>[c,c.edges.map(e=>e.k).sort()[0]]).sort((p,q)=>p[1]<q[1]?-1:p[1]>q[1]?1:key(p[0].raw[0])<key(q[0].raw[0])?-1:1)){
   const base=`wl_${c[1].replace(/\|/g,'_').replace(/-/g,'out')}`,n=(used.get(base)||0)+1;used.set(base,n);c[0].id=n>1?`${base}_${n}`:base;}
  // end joints: ends meeting a node butt into the dominant wall (a through chain, else the thickest end)
  const ends=new Map();
  for(const c of out)if(!c.closed)for(const at of [0,c.pts.length-1]){
   const k=key(c.pts[at]);if(!ends.has(k))ends.set(k,[]);
   const nb=c.pts[at===0?1:c.pts.length-2],l=dist(c.pts[at],nb);ends.get(k).push({c,at,u:[(nb[0]-c.pts[at][0])/l,(nb[1]-c.pts[at][1])/l]});
  }
  const throughAt=p=>{let best=null;for(const c of out){const P=c.closed?[...c.pts,c.pts[0]]:c.pts;
   for(let i=1;i<P.length;i++){const t=onSeg(p,P[i-1],P[i]);if(t===null)continue;
    if(!c.closed&&((i===1&&t<1e-6)||(i===P.length-1&&t>1-1e-6)))continue;
    if(!best||best.c.half<c.half)best={c,dir:[(P[i][0]-P[i-1][0])/dist(P[i-1],P[i]),(P[i][1]-P[i-1][1])/dist(P[i-1],P[i])]};break;}}return best;};
  const junctions=[];
  for(const [k,list] of ends){
   const thr=throughAt(list[0].c.pts[list[0].at]);if(!thr&&list.length<2)continue;
   junctions.push({p:list[0].c.raw[list[0].at],chains:new Set([...list.map(e=>e.c),...(thr?[thr.c]:[])])});
   const dom=thr?{c:thr.c,dir:thr.dir}:list.slice().sort((p,q)=>q.c.half-p.c.half||(q.c.wall.shell-p.c.wall.shell))[0];
   const dline=dom.dir??dom.u;let ext=0,partner=false;
   for(const e of list){
    if(e===dom)continue;
    const sin=Math.abs(cross(...e.u,...dline)),cos=Math.abs(e.u[0]*dline[0]+e.u[1]*dline[1]);
    if(!dom.dir&&cos>Math.cos(Math.PI/180)){partner=true;continue;}
    // trim to the dominant face, under-trimmed on slanted joins so the walls overlap rather than crack
    const d=Math.max(0,dom.c.half/Math.max(sin,.2)-e.c.half*cos/Math.max(sin,.2)),p=e.c.pts[e.at],nb=e.c.pts[e.at===0?1:e.c.pts.length-2];
    if(d>=dist(p,nb)-.05)fail('walls',`wall ${e.c.id} near ${k} is shorter than its joint trim`);
    e.c.pts[e.at]=[snap(p[0]+e.u[0]*d),snap(p[1]+e.u[1]*d)];ext=Math.max(ext,e.c.half/Math.max(sin,.2));
   }
   if(!dom.dir&&ext&&!partner){const p=dom.c.pts[dom.at];dom.c.pts[dom.at]=[snap(p[0]-dom.u[0]*ext),snap(p[1]-dom.u[1]*ext)];}
  }
  return{chains:out,junctions};
 }

 // ---- nested parents -> simple stage pieces (WORLD v3 rooms are simple polygons, no holes) ------
 // The net region (parent minus direct children) is rasterised on the grid of its axis-aligned
 // vertex coordinates; if any connected part has an inner ring it is cut into x-slabs at the
 // hole extents. One piece keeps the room id; several become <id>.1, <id>.2... ordered by z then x.
 function trace(cells,xs,zs,nxs){
  const out=new Map(),edge=(a,b)=>{const k=key(a);if(out.has(k))out.get(k).push(b);else out.set(k,[b]);};
  for(const c of cells){const i=c%nxs,j=Math.floor(c/nxs),has=(di,dj)=>i+di>=0&&i+di<nxs&&cells.has((j+dj)*nxs+i+di);
   const [x0,x1,z0,z1]=[xs[i],xs[i+1],zs[j],zs[j+1]];
   if(!has(0,-1))edge([x0,z0],[x1,z0]);if(!has(1,0))edge([x1,z0],[x1,z1]);if(!has(0,1))edge([x1,z1],[x0,z1]);if(!has(-1,0))edge([x0,z1],[x0,z0]);}
  for(const list of out.values())if(list.length>1)return null;// pinch vertex: not a simple outline
  const rings=[],used=new Set();
  for(const k0 of out.keys()){if(used.has(k0))continue;const ring=[];let k=k0;
   while(!used.has(k)){used.add(k);ring.push(k.split(',').map(Number));k=key(out.get(k)[0]);}
   const n=ring.length;rings.push(ring.filter((b,i)=>{const a=ring[(i+n-1)%n],d=ring[(i+1)%n];return Math.abs(cross(b[0]-a[0],b[1]-a[1],d[0]-b[0],d[1]-b[1]))>EPS;}));}
  return rings;
 }
 function overlapSeg(p,q,s,t){
  const L=dist(p,q),line=v=>Math.abs(cross(q[0]-p[0],q[1]-p[1],v[0]-p[0],v[1]-p[1]))/L<TOL;if(!line(s)||!line(t))return null;
  const par=v=>((v[0]-p[0])*(q[0]-p[0])+(v[1]-p[1])*(q[1]-p[1]))/(L*L),a=par(s),b=par(t),lo=Math.max(0,Math.min(a,b)),hi=Math.min(1,Math.max(a,b));
  if((hi-lo)*L<TOL)return null;const at=u=>[snap(p[0]+(q[0]-p[0])*u),snap(p[1]+(q[1]-p[1])*u)];return[at(lo),at(hi)];
 }
 function splitParents(D){
  const pieces=new Map();
  for(const r of D.rooms.values()){
   if(!r.kids.length){pieces.set(r.id,[{id:r.id,poly:r.poly}]);continue;}
   const polys=[r.poly,...r.kids.map(k=>D.rooms.get(k).poly)];
   if(polys.some(p=>p.some((a,i)=>{const b=p[(i+1)%p.length];return Math.abs(a[0]-b[0])>EPS&&Math.abs(a[1]-b[1])>EPS;})))
    fail(`${D.where} room ${r.id}`,'nested rooms need an axis-aligned parent and children for now (WORLD v3 rooms have no holes)');
   const xs=[...new Set(polys.flat().map(p=>p[0]))].sort((a,b)=>a-b),zs=[...new Set(polys.flat().map(p=>p[1]))].sort((a,b)=>a-b),nxs=xs.length-1;
   const own=new Set();
   for(let j=0;j+1<zs.length;j++)for(let i=0;i<nxs;i++){const cx=(xs[i]+xs[i+1])/2,cz=(zs[j]+zs[j+1])/2;
    if(inside(r.poly,cx,cz)&&!r.kids.some(k=>inside(D.rooms.get(k).poly,cx,cz)))own.add(j*nxs+i);}
   const comps=cuts=>{const seen=new Set(),res=[];
    for(const c0 of own){if(seen.has(c0))continue;const comp=new Set([c0]),q=[c0];seen.add(c0);
     for(let h=0;h<q.length;h++){const c=q[h],i=c%nxs;
      for(const [n,ok] of [[c+1,i+1<nxs&&!cuts.has(xs[i+1])],[c-1,i>0&&!cuts.has(xs[i])],[c+nxs,true],[c-nxs,true]])if(ok&&own.has(n)&&!seen.has(n)){seen.add(n);comp.add(n);q.push(n);}}
     res.push(comp);}
    return res.map(comp=>({comp,rings:trace(comp,xs,zs,nxs)}));};
   let parts=comps(new Set());
   if(parts.some(p=>!p.rings||p.rings.length>1)){
    const cut=new Set();for(const p of parts)for(const ring of p.rings||[])if(area(ring)<0)for(const v of ring)cut.add(v[0]);
    parts=comps(cut);
   }
   if(parts.some(p=>!p.rings||p.rings.length!==1))fail(`${D.where} room ${r.id}`,'could not split the region around its nested rooms into simple pieces');
   const lo=(poly,k)=>Math.min(...poly.map(q=>q[k])),polys2=parts.map(p=>p.rings[0]).sort((a,b)=>lo(a,1)-lo(b,1)||lo(a,0)-lo(b,0));
   pieces.set(r.id,polys2.length===1?[{id:r.id,poly:polys2[0]}]:polys2.map((poly,i)=>({id:`${r.id}.${i+1}`,poly})));
  }
  const pieceAt=(x,z)=>{const id=D.roomAt(x,z);if(id===null)return null;const ps=pieces.get(id);return ps.length===1?ps[0].id:(ps.find(p=>inside(p.poly,x,z))??ps[0]).id;};
  // shared boundaries between sibling pieces become open portals
  const cutPortals=[];
  for(const [id,ps] of pieces){if(ps.length<2)continue;
   for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const segs=[],A=ps[i].poly,B=ps[j].poly;
    for(let a=0;a<A.length;a++)for(let b=0;b<B.length;b++){const s=overlapSeg(A[a],A[(a+1)%A.length],B[b],B[(b+1)%B.length]);if(s)segs.push(s);}
    if(!segs.length)continue;
    const P={id:`${ps[i].id}~${ps[j].id}`,a:ps[i].id,b:ps[j].id,ra:id,rb:id,seg:segs[0],walk:true,kind:'cut',w:snap(segs.reduce((s,g)=>s+dist(...g),0))};
    if(segs.length>1)P.segs=segs;cutPortals.push(P);}
  }
  return{pieces,pieceAt,cutPortals};
 }

 // ---- fromPlan ---------------------------------------------------------------------------------
 const COMPASS={w:(p,q)=>p[0]<q[0]-EPS||(Math.abs(p[0]-q[0])<EPS&&p[1]<q[1]),e:(p,q)=>p[0]>q[0]+EPS||(Math.abs(p[0]-q[0])<EPS&&p[1]>q[1]),
  n:(p,q)=>p[1]<q[1]-EPS||(Math.abs(p[1]-q[1])<EPS&&p[0]<q[0]),s:(p,q)=>p[1]>q[1]+EPS||(Math.abs(p[1]-q[1])<EPS&&p[0]>q[0])};
 function fromPlan(plan,sid){
  const Wd=W(),M=Wd.materials,D=derive(plan,sid),{S,where,rooms,edges,pairKey,roomAt}=D;
  const halfOf=b=>{try{return M.describe(b).thicknessCm/200;}catch(e){fail(where,`unknown build ${b}`);}};
  const {chains:cs,junctions}=chains(edges,halfOf);
  const walls=cs.map(c=>{const w={id:c.id,path:c.pts,build:c.wall.build,cov:c.wall.cov,h:c.wall.h,open:[]};if(c.closed)w.closed=true;return w;});
  const portals=[],openings=[];
  function locate(rs,at,w,whereD,arch){
   if(!Array.isArray(rs)||rs.length!==2)fail(whereD,'rooms must be [a,b|null]');
   for(const id of rs)if(id!==null&&!rooms.has(id))fail(whereD,`unknown room ${id}`);
   const k=pairKey(...rs),cands=edges.filter(e=>e.k===k&&onSeg(at,e.a,e.b,1e-3)!==null);
   if(!cands.length)fail(whereD,`at ${at} is not on the boundary between ${rs[0]} and ${rs[1]}`);
   const e=cands[0],u=[(e.b[0]-e.a[0])/e.len,(e.b[1]-e.a[1])/e.len],p0=[at[0]-u[0]*w/2,at[1]-u[1]*w/2],p1=[at[0]+u[0]*w/2,at[1]+u[1]*w/2];
   for(const p of [p0,p1])if(!edges.some(f=>f.k===k&&onSeg(p,f.a,f.b,1e-3)!==null))fail(whereD,`width ${w} runs past the ${rs[0]}/${rs[1]} boundary`);
   if(!e.wall)return{open:true,p0,p1};
   const c=cs.find(c=>c.edges.includes(e)),P=c.closed?[...c.pts,c.pts[0]]:c.pts;let s=0;
   for(let i=1;i<P.length;i++){
    const a=P[i-1],b=P[i],L2=dist(a,b),ta=onSeg(p0,a,b,1e-3),tb=onSeg(p1,a,b,1e-3);
    const line=Math.abs(cross(p0[0]-a[0],p0[1]-a[1],b[0]-a[0],b[1]-a[1]))/L2<1e-3&&Math.abs(cross(p1[0]-a[0],p1[1]-a[1],b[0]-a[0],b[1]-a[1]))/L2<1e-3;
    if(line&&(ta!==null||tb!==null)){
     const t0=((p0[0]-a[0])*(b[0]-a[0])+(p0[1]-a[1])*(b[1]-a[1]))/(L2*L2),t1=((p1[0]-a[0])*(b[0]-a[0])+(p1[1]-a[1])*(b[1]-a[1]))/(L2*L2);
     let lo=Math.min(t0,t1)*L2,hi=Math.max(t0,t1)*L2;
     if(lo<-EPS||hi>L2+EPS){if(!arch)fail(whereD,`runs ${lo<0?(-lo).toFixed(3):(hi-L2).toFixed(3)} m past the trimmed end of wall ${c.id}; move it along the wall`);lo=Math.max(lo,0);hi=Math.min(hi,L2);}
     if(!arch){// WORLD keeps leaf doors clear of the mitre inset at path corners: half·tan(turn/2)
      const n=P.length-1,dir=k=>{const a2=P[k-1],b2=P[k],l=dist(a2,b2);return[(b2[0]-a2[0])/l,(b2[1]-a2[1])/l];};
      const inset=(u,v)=>c.half*Math.abs(cross(...u,...v))/(1+u[0]*v[0]+u[1]*v[1]);
      const prev=i>1?i-1:c.closed?n:0,next=i<n?i+1:c.closed?1:0,me=dir(i);
      const i0=prev?inset(dir(prev),me):0,i1=next?inset(me,dir(next)):0;
      if(lo<i0-EPS||hi>L2-i1+EPS)fail(whereD,`sits in the mitre of a corner of wall ${c.id}; keep ${Math.max(i0,i1).toFixed(2)} m from the corner`);
     }
     return{chain:c,s0:snap(s+lo),s1:snap(s+hi),rev:t1<t0,p0,p1,piece:[a,b]};
    }
    s+=L2;
   }
   fail(whereD,`opening is not on one straight piece of wall ${c.id} (move it away from the corner)`);
  }
  const sidePts=(at,L)=>{const l=dist(L.p0,L.p1),n=[-(L.p1[1]-L.p0[1])/l*2e-3,(L.p1[0]-L.p0[0])/l*2e-3];return[[at[0]+n[0],at[1]+n[1]],[at[0]-n[0],at[1]-n[1]]];};
  const hinge=(L,h)=>{if(h===undefined||h==='start'||h==='end')return h??'start';
   if(!COMPASS[h])fail(where,`hinge must be n|s|e|w|start|end`);const a=L.piece[0],b=L.piece[1];return COMPASS[h](a,b)?'start':'end';};
  const ids=new Set(walls.map(w=>w.id));
  const claim=(id,wh)=>{if(typeof id!=='string'||!/^[A-Za-z0-9_.-]+$/.test(id)||ids.has(id)||rooms.has(id))fail(wh,'missing, invalid or duplicate id');ids.add(id);};
  for(const d of S.doors||[]){
   const wd=`${where} door ${d?.id}`;claim(d.id,wd);
   const at=pt(d.at,wd,'at'),w=num(d.w,wd,'w'),kind=d.kind??'door_solid';if(w<.5)fail(wd,'w below 0.5 m');
   const L=locate(d.rooms,at,w,wd,kind==='open');
   portals.push({id:d.id,a:d.rooms[0],b:d.rooms[1],...(L.open?{seg:[L.p0,L.p1]}:{open:d.id,sides:sidePts(at,L)}),walk:true,kind:'door',w,at,u:[snap((L.p1[0]-L.p0[0])/w),snap((L.p1[1]-L.p0[1])/w)]});
   if(L.open){if(kind!=='open')fail(wd,`kind ${kind} on an unwalled boundary; use kind:'open' or an edges override`);continue;}
   const wall=walls.find(x=>x.id===L.chain.id),o={id:d.id,s0:L.s0,s1:L.s1,y0:0,y1:Math.min(wall.h,d.y1??(kind==='open'?Math.min(2.4,wall.h):2.1))};
   if(kind==='open')o.kind='arch';
   else{
    const glass=kind==='glass';o.build=glass?'glass_tempered_6':kind;o.cov=glass?'glass':'full';
    o.kind=d.double||(!d.slide&&!glass&&w>=1.5)?'double':d.slide||(glass&&w>=1.5)?'slide':'door';
    o.door={th:0,slide:0};if(o.kind!=='double')o.door.hinge=hinge(L,d.hinge);
   }
   wall.open.push(o);openings.push({id:d.id,wall:wall.id,s0:o.s0,s1:o.s1,chain:L.chain,where:wd});
  }
  for(const v of S.windows||[]){
   const wd=`${where} window ${v?.id}`;claim(v.id,wd);
   const L=locate(v.rooms,pt(v.at,wd,'at'),num(v.w,wd,'w'),wd,false);if(L.open)fail(wd,'window on an unwalled boundary');
   const wall=walls.find(x=>x.id===L.chain.id);
   wall.open.push({id:v.id,s0:L.s0,s1:L.s1,y0:num(v.y0??.9,wd,'y0'),y1:Math.min(wall.h,num(v.y1??2.1,wd,'y1')),kind:'window',build:v.build??'glass_annealed_6',cov:v.cov??'glass'});
   portals.push({id:v.id,a:v.rooms[0],b:v.rooms[1],open:v.id,sides:sidePts(L.p0.map((c,i)=>(c+L.p1[i])/2),L),walk:false,kind:'window',w:v.w});
   openings.push({id:v.id,wall:wall.id,s0:L.s0,s1:L.s1,chain:L.chain,where:wd});
  }
  // openings must not straddle a junction where another wall butts in
  for(const o of openings){
   const c=o.chain,P=c.closed?[...c.pts,c.pts[0]]:c.pts;
   for(const j of junctions){if(!j.chains.has(c)||j.chains.size<2)continue;let s=0;
    for(let i=1;i<P.length;i++){const t=onSeg(j.p,P[i-1],P[i],1e-3),L2=dist(P[i-1],P[i]);
     if(t!==null){const at=s+t*L2,half=Math.max(...[...j.chains].filter(x=>x!==c).map(x=>x.half));
      if(at>o.s0-half-.05&&at<o.s1+half+.05)fail(o.where,`overlaps the junction at ${key(j.p)} on wall ${c.id}; keep ${(half+.05).toFixed(2)} m clear`);break;}s+=L2;}}
  }
  for(const w of walls)w.open.sort((a,b)=>a.s0-b.s0);
  // open shared boundaries (no wall) are walkable portals, one per room pair
  const SP=splitParents(D),byPiece=new Map();
  const edgePortal=(e,sep,kind,walk)=>{// split the edge where generated pieces of either side change
   const ts=[0,1];for(const r of [e.L,e.R])for(const pc of SP.pieces.get(r))for(const v of pc.poly){const t=onSeg(v,e.a,e.b);if(t!==null&&t>EPS&&t<1-EPS)ts.push(t);}
   ts.sort((x,y)=>x-y);const lerp=t=>[snap(e.a[0]+(e.b[0]-e.a[0])*t),snap(e.a[1]+(e.b[1]-e.a[1])*t)];
   const wall=kind==='sight'?cs.find(c=>c.edges.includes(e))?.id:undefined;
   for(let k=1;k<ts.length;k++){
    const a=lerp(ts[k-1]),b=lerp(ts[k]),l=dist(a,b);if(l<TOL)continue;
    const m=[(a[0]+b[0])/2,(a[1]+b[1])/2],dx=(b[0]-a[0])/l,dz=(b[1]-a[1])/l,o=2e-3;
    const pa0=SP.pieceAt(m[0]-dz*o,m[1]+dx*o),pb0=SP.pieceAt(m[0]+dz*o,m[1]-dx*o);
    const [A,B,RA,RB]=pa0<pb0?[pa0,pb0,e.L,e.R]:[pb0,pa0,e.R,e.L],id=`${A}${sep}${B}`;
    if(!byPiece.has(id)){const p={id,a:A,b:B,ra:RA,rb:RB,group:[RA,RB].sort().join(sep),seg:[a,b],walk,kind,w:0,segs:[]};if(wall)p.wall=wall;byPiece.set(id,p);portals.push(p);}
    const p=byPiece.get(id);p.segs.push([a,b]);p.w+=l;}};
  for(const e of edges)if(e.L&&e.R&&!e.wall)edgePortal(e,'~','edge',true);
  for(const e of edges)if(e.L&&e.R&&e.wall&&!M.blocksSight({kind:'wall',build:e.wall.build,cov:e.wall.cov,h:e.wall.h},'standing'))edgePortal(e,'^','sight',false);
  for(const p of byPiece.values()){if(p.segs.length===1)delete p.segs;p.w=snap(p.w);}
  for(const w of S.walls||[]){claim(w.id,`${where} wall ${w.id}`);for(const o of w.open||[])claim(o.id,`${where} wall ${w.id} opening`);walls.push(JSON.parse(JSON.stringify(w)));}
  const ground=(S.ground||[]).map(g=>{claim(g.id,`${where} ground ${g.id}`);return{...g,y:g.y??0};});
  for(const r of [...rooms.values()].sort((a,b)=>b.depth-a.depth)){const id=`g_${r.id}`;claim(id,`${where} room ${r.id} ground`);ground.push({id,poly:r.poly,y:r.y??0,surf:r.surf??D.def.surf});}
  const props=(S.props||[]).map(p=>{const wp=`${where} prop ${p?.id}`;claim(p.id,wp);
   if(p.poly)return{id:p.id,poly:p.poly,build:p.build,cov:p.cov,h:p.h};
   const at=pt(p.at,wp,'at');if(!Array.isArray(p.size)||p.size.length!==2)fail(wp,'size must be [w,d]');
   return{id:p.id,poly:rectPoly(at[0],at[1],num(p.size[0],wp,'size'),num(p.size[1],wp,'size'),p.rot??0),build:p.build,cov:p.cov,h:p.h};});
  const spawns=(S.spawns||[]).map(s=>{const ws=`${where} spawn ${s?.id}`;claim(s.id,ws);const at=pt(s.at,ws,'at');
   return{id:s.id,kind:s.kind,x:at[0],z:at[1],room:roomAt(...at),...(s.a!==undefined?{a:s.a}:{}),...(s.role?{role:s.role}:{})};});
  const outRooms=[...rooms.values()].flatMap(r=>SP.pieces.get(r.id).map(p=>{const o={id:p.id,poly:p.poly,kind:r.kind??(r.zone==='interior'?'room':'yard'),zone:r.zone,roof:r.roof??r.zone==='interior'};
   if(p.id!==r.id){claim(p.id,`${where} room ${r.id} piece`);o.parent=r.id;}
   if(r.name)o.name=r.name;if(r.in!==undefined)o.in=r.in;if(r.combat!==undefined)o.combat=r.combat;if(r.y)o.y=r.y;return o;}));
  // portals carry stage pieces in a/b and plan rooms in ra/rb
  for(const p of portals){if(p.ra!==undefined)continue;
   let q1,q2;if(p.seg){const [s,t]=p.seg,l=dist(s,t),n=[-(t[1]-s[1])/l*2e-3,(t[0]-s[0])/l*2e-3],m=[(s[0]+t[0])/2,(s[1]+t[1])/2];q1=[m[0]+n[0],m[1]+n[1]];q2=[m[0]-n[0],m[1]-n[1]];}
   else{[q1,q2]=p.sides;}
   p.ra=p.a;p.rb=p.b;const r1=roomAt(...q1),[A,B]=r1===p.a?[q1,q2]:[q2,q1];p.a=SP.pieceAt(...A);p.b=SP.pieceAt(...B);delete p.sides;
  }
  for(const s of spawns)s.room=SP.pieceAt(s.x,s.z);
  portals.push(...SP.cutPortals);
  // strict WORLD v3 portal records; door-on-open-edge portals duplicate the edge portal and are dropped
  const stagePortals=[],taken=new Set(portals.map(p=>p.id)),uniq=id=>{let u=id;for(let n=2;taken.has(u);n++)u=`${id}_${n}`;taken.add(u);return u;};
  for(const p of portals){if(p.open){stagePortals.push({id:p.id,a:p.a,b:p.b,open:p.open});continue;}
   if(p.kind==='door')continue;const segs=p.segs||[p.seg];
   segs.forEach((s,k)=>stagePortals.push({id:segs.length>1?uniq(`${p.id}.${k+1}`):p.id,a:p.a,b:p.b,seg:s,...(p.wall?{wall:p.wall}:{})}));}
  const v3=Wd.version>=3;
  const [x0,z0,x1,z1]=S.bounds;
  const stage=JSON.parse(JSON.stringify({id:sid,bounds:[x0-PAD,z0-PAD,x1+PAD,z1+PAD],combat:S.combat??true,ground,walls,props,rooms:outRooms,...(v3?{portals:stagePortals}:{}),spawns}));
  for(const k of ['stairs','obj','stash','items'])for(const o of S[k]||[])claim(o.id,`${where} ${k} ${o.id}`);
  const extras={portals:JSON.parse(JSON.stringify(portals)),...(v3?{}:{stagePortals:JSON.parse(JSON.stringify(stagePortals))}),stairs:S.stairs||[],obj:S.obj||[],stash:S.stash||[],items:S.items||[],backdrop:S.backdrop||[],targets:S.targets||{},floorH:S.floorH,briefBounds:S.bounds,elevated:!!S.elevated};
  return{stage,extras,info:{rooms,edges,chains:cs,junctions,roomAt,pieceAt:SP.pieceAt,pieces:SP.pieces,top:D.top}};
 }

 // ---- validation -------------------------------------------------------------------------------
 function compileLocated(stage){
  const Wd=W();
  try{return Wd.compile(stage);}catch(e){
   for(const k of ['walls','props','ground'])for(const r of stage[k]){
    try{Wd.compile({id:stage.id,bounds:stage.bounds,combat:stage.combat,ground:[],walls:[],props:[],rooms:[],spawns:[],[k]:[r]});}
    catch(e2){throw new Error(`compile: ${k.slice(0,-1)} ${r.id}${r.build?` (${r.build})`:''}: ${e2.message}`);}
   }
   throw new Error(`compile: ${e.message}`);
  }
 }
 // walkability raster (stopgap until WORLD nav lands): 0.25 m cells, capsule r 0.3, step <= 0.35 m.
 // Two clear cell centres 0.25 m apart cannot straddle geometry (each is >= r from it), so adjacency only
 // checks the ground step. Doors narrower than the raster resolves are bridged along their axis.
 function raster(st,step=.25,r=.3,bridges=[]){
  const Wd=W(),[x0,z0,x1,z1]=st.bounds,nx=Math.floor((x1-x0)/step),nz=Math.floor((z1-z0)/step),N=nx*nz;
  const ok=new Uint8Array(N),gy=new Float64Array(N),c=i=>[x0+(i%nx+.5)*step,z0+(Math.floor(i/nx)+.5)*step];
  const clear=(x,z)=>Wd.groundY(st,x,z)!==null&&!Wd.move(st,x,z,r,1e-3,0).overlap;
  // same rules as WORLD.move/groundY, rasterised per polygon: first ground wins; props and panels with an
  // active cell below 1 m (WORLD MOVE_H) block; the bounds are a barrier
  const span=(poly,pad,fn)=>{const xs=poly.map(p=>p[0]),zs=poly.map(p=>p[1]);
   const i0=Math.max(0,Math.floor((Math.min(...xs)-pad-x0)/step)),i1=Math.min(nx-1,Math.floor((Math.max(...xs)+pad-x0)/step));
   const j0=Math.max(0,Math.floor((Math.min(...zs)-pad-z0)/step)),j1=Math.min(nz-1,Math.floor((Math.max(...zs)+pad-z0)/step));
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)fn(j*nx+i);};
  const seg=(poly,x,z)=>{let d=Infinity;for(let k=0;k<poly.length;k++){const a=poly[k],b=poly[(k+1)%poly.length],dx=b[0]-a[0],dz=b[1]-a[1];
   const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return d;};
  const has=new Uint8Array(N);
  for(const g of st.ground)span(g.poly,0,i=>{if(has[i])return;const [x,z]=c(i);if(inside(g.poly,x,z)||seg(g.poly,x,z)<EPS){has[i]=1;gy[i]=g.y;ok[i]=1;}});
  const blockers=[...st.props.map(p=>p.poly),...st.panels.filter(p=>st.cells.slice(p.c0,p.c1).some(q=>q.active&&q.y0<1)).map(p=>p.poly)];
  for(const poly of blockers)span(poly,r,i=>{if(!ok[i])return;const [x,z]=c(i);if(inside(poly,x,z)||seg(poly,x,z)<r-EPS)ok[i]=0;});
  for(let i=0;i<N;i++)if(ok[i]){const [x,z]=c(i);if(Math.min(x-x0,x1-x,z-z0,z1-z)<r-EPS)ok[i]=0;}
  const adj=(i,j)=>ok[j]&&Math.abs(gy[i]-gy[j])<=.35+EPS;
  const E=new Uint8Array(N);
  for(let i=0;i<N;i++){if(!ok[i])continue;if(i%nx<nx-1&&adj(i,i+1))E[i]|=1;if(i+nx<N&&adj(i,i+nx))E[i]|=2;}
  const index=(x,z)=>{const ix=Math.floor((x-x0)/step),iz=Math.floor((z-z0)/step);return ix<0||iz<0||ix>=nx||iz>=nz?-1:iz*nx+ix;};
  // nearest clear cell that the exact position reaches by a straight collision-free move (never across a wall)
  const near=(x,z,rad=1.25)=>{const cand=[];for(let dz=-rad;dz<=rad+EPS;dz+=step)for(let dx=-rad;dx<=rad+EPS;dx+=step){const i=index(x+dx,z+dz);if(i>=0&&ok[i])cand.push([Math.hypot(dx,dz),i]);}
   cand.sort((p,q)=>p[0]-q[0]||p[1]-q[1]);
   for(const [,i] of cand){const [cx,cz]=c(i),m=Wd.move(st,x,z,r,cx-x,cz-z);if(!m.hit&&!m.overlap&&m.groundY!==null&&Math.hypot(m.x-cx,m.z-cz)<1e-6)return i;}
   return-1;};
  const X=new Map(),link=(i,j)=>{for(const [a,b] of [[i,j],[j,i]]){if(!X.has(a))X.set(a,[]);X.get(a).push(b);}};
  for(const {at,u} of bridges){// walk the door axis 0.75 m each side; every sample must be clear
   const n=[-u[1],u[0]],pts=[];for(let t=-.75;t<=.75+EPS;t+=.125)pts.push([at[0]+n[0]*t,at[1]+n[1]*t]);
   if(!pts.every(p=>clear(...p)))continue;const a=near(...pts[0],.25),b=near(...pts.at(-1),.25);if(a>=0&&b>=0&&a!==b)link(a,b);}
  const reach=src=>{const seen=new Int32Array(N).fill(-1);if(src<0||!ok[src])return seen;const q=[src];seen[src]=0;
   for(let h=0;h<q.length;h++){const i=q[h],d=seen[i]+1;
    for(const [o,e] of [[1,E[i]&1],[-1,i%nx>0&&E[i-1]&1],[nx,E[i]&2],[-nx,i>=nx&&E[i-nx]&2]])if(e&&seen[i+o]<0){seen[i+o]=d;q.push(i+o);}
    for(const j of X.get(i)||[])if(seen[j]<0){seen[j]=d;q.push(j);}}
   return seen;};
  return{nx,nz,N,step,ok,E,c,index,reach,near};
 }
 // plan-room graph (pieces of one room are collapsed; ra/rb are plan rooms)
 function roomGraph(out){
  const g=new Map([[null,[]]]);for(const id of out.info.rooms.keys())g.set(id,[]);
  const seen=new Set();for(const p of out.extras.portals)if(p.walk&&p.ra!==p.rb){const k=p.group??p.id;if(seen.has(k))continue;seen.add(k);g.get(p.ra).push([p.rb,k]);g.get(p.rb).push([p.ra,k]);}
  return g;
 }
 function pathRooms(g,a,b,without=[]){
  const skip=new Set([].concat(without)),seen=new Set([a]),q=[a];
  for(let h=0;h<q.length;h++){if(q[h]===b)return true;for(const [n,pid] of g.get(q[h])||[])if(!skip.has(pid)&&!seen.has(n)){seen.add(n);q.push(n);}}
  return false;
 }
 // walkable portals crossing the boundary of a room's subtree (a guest room counts its bath as inside)
 function entrances(out,id){
  const sub=new Set([id]);let grew=true;while(grew){grew=false;for(const r of out.info.rooms.values())if(r.in!==undefined&&sub.has(r.in)&&!sub.has(r.id)){sub.add(r.id);grew=true;}}
  const seen=new Set();// one entrance per logical opening: pieces of one boundary share a group
  return out.extras.portals.filter(p=>{if(!p.walk||sub.has(p.ra)===sub.has(p.rb))return false;const k=p.group??p.id;if(seen.has(k))return false;seen.add(k);return true;});
 }
 function sightTest(st,s){
  const Wd=W(),[eye,top]=STANCE[s.stance??'standing'],open=new Set(s.open||[]),saved=st.doors.map(d=>[d.th,d.slide]);
  try{for(const d of st.doors)if(open.has(d.id)||open.has(d.id.split(':')[0])){if(d.kind==='slide')d.slide=1;else d.th=(d.id.endsWith(':1')?-1:1)*Math.PI/2;}
   return Wd.sight(st,...s.from,...s.to,eye,top);}
  finally{st.doors.forEach((d,i)=>{d.th=saved[i][0];d.slide=saved[i][1];});}
 }
 function validate(plan,{raster:doRaster=true}={}){
  const Wd=W(),report={plan:plan?.id,errors:[],warnings:[],stages:{}},err=m=>report.errors.push(m),warn=m=>report.warnings.push(m);
  if(!plan||typeof plan.id!=='string'){err('plan needs an id');return report;}
  if(plan.v!==1)err(`${plan.id}: plan v must be 1`);
  const sids=Object.keys(plan.stages||{});if(!sids.length)err(`${plan.id}: no stages`);
  const outs={};
  for(const sid of sids){
   const where=`${plan.id}/${sid}`,R=report.stages[sid]={};
   let out,st;try{out=fromPlan(plan,sid);st=compileLocated(out.stage);}catch(e){err(e.message.startsWith('compile')?`${where} ${e.message}`:e.message);continue;}
   outs[sid]={out,st};
   Object.assign(R,{rooms:out.stage.rooms.length,walls:out.stage.walls.length,panels:st.panels.length,doors:st.doors.length,portals:out.extras.portals.length,props:st.props.length,area:[],ent:[],sight:[],loops:[]});
   if(st.panels.length>3000)err(`${where}: ${st.panels.length} panels exceeds the 3k stage budget`);
   const g=roomGraph(out),T=out.extras.targets;
   for(const r of out.info.rooms.values()){
    if(!r.sealed&&!g.get(r.id).length&&!(r.kids.length&&entrances(out,r.id).length))err(`${where} room ${r.id}: no walkable entrance (mark sealed:true for shafts)`);}
   for(const e of out.info.edges){if(e.wall)continue;const [a,b]=[e.L,e.R].map(id=>id&&out.info.rooms.get(id));
    if((a?.zone==='interior'&&!b)||(b?.zone==='interior'&&!a))warn(`${where}: interior room ${(a||b).id} is open to the void along ${key(e.a)}–${key(e.b)}`);
    if(out.extras.elevated&&(!a||!b))err(`${where}: drop edge (no wall or rail) on ${(a||b).id} along ${key(e.a)}–${key(e.b)}`);}
   const placed=(at,what)=>{const id=out.info.roomAt(...at);if(!id)err(`${where} ${what} at ${at} is not inside any room`);else if(Wd.groundY(st,...at)===null)err(`${where} ${what} at ${at} has no ground`);return id;};
   for(const s of out.stage.spawns){if(!SPAWN_KINDS.has(s.kind))err(`${where} spawn ${s.id}: unknown kind ${s.kind}`);
    placed([s.x,s.z],`spawn ${s.id}`);if(Wd.move(st,s.x,s.z,.3,1e-3,0).overlap)err(`${where} spawn ${s.id}: overlaps a wall or prop`);}
   for(const s of out.extras.stairs){const id=placed(s.at,`stair ${s.id}`);if(s.room&&id!==s.room)err(`${where} stair ${s.id}: at is in ${id}, not ${s.room}`);
    const to=plan.stages[s.to];if(!to)err(`${where} stair ${s.id}: target stage ${s.to} does not exist`);
    else if(!(to.spawns||[]).some(x=>x.id===s.arrive&&x.kind==='arrive'))err(`${where} stair ${s.id}: arrive spawn ${s.arrive} missing on ${s.to}`);}
   for(const k of ['obj','stash','items'])for(const o of out.extras[k])placed(o.at,`${k} ${o.id}`);
   for(const [id,m2] of Object.entries(T.area||{})){const r=out.info.rooms.get(id);if(!r){err(`${where} area target: unknown room ${id}`);continue;}
    const ok=Math.abs(r.gross-m2)<=Math.max(.5,m2*.02);R.area.push({id,m2:snap(r.gross),want:m2,ok});if(!ok)err(`${where} room ${id}: ${r.gross.toFixed(1)} m² vs brief ${m2}`);}
   for(const [id,n] of Object.entries(T.ent||{})){if(!g.has(id)){err(`${where} ent target: unknown room ${id}`);continue;}
    const got=entrances(out,id).length;R.ent.push({id,got,want:n,ok:got===n});if(got!==n)err(`${where} room ${id}: ${got} entrances vs brief ${n}`);}
   if(T.entries){const outside=new Set(T.entries.outside),got=[...new Map(out.extras.portals.filter(p=>p.walk&&outside.has(p.ra)!==outside.has(p.rb)).map(p=>[p.group??p.id,p])).values()];
    R.entries={got:got.map(p=>p.id),want:T.entries.n};if(got.length!==T.entries.n)err(`${where}: ${got.length} site entries (${got.map(p=>p.id)}) vs brief ${T.entries.n}`);}
   for(const s of T.sight||[]){const res=sightTest(st,s),got=res.clear?'clear':'blocked',ok=got===s.expect;
    R.sight.push({id:s.id,got,want:s.expect,by:res.ref,ok});if(!ok)err(`${where} sight ${s.id}: ${got}${res.ref?` by ${res.ref}`:''}, brief says ${s.expect}`);}
   for(const t of T.links||[])if(!pathRooms(g,t.from,t.to,t.without))err(`${where} link ${t.from}→${t.to}${t.without?` without ${t.without}`:''}: no room path`);
   for(const l of T.loops||[]){// rooms [a,b,...,a]; consecutive rooms joined by distinct walkable portals
    const usedP=new Set();let ok=l.rooms[0]===l.rooms.at(-1)&&l.rooms.length>=3;
    for(let i=0;ok&&i+1<l.rooms.length;i++){const p=(g.get(l.rooms[i])||[]).find(([n,pid])=>n===l.rooms[i+1]&&!usedP.has(pid));if(!p){ok=false;break;}usedP.add(p[1]);}
    R.loops.push({id:l.id,ok});if(!ok)err(`${where} loop ${l.id}: ${l.rooms.join('→')} is not a closed walkable cycle`);}
   for(const p of out.extras.portals)if(p.walk&&p.w<.8-EPS)warn(`${where} portal ${p.id}: ${p.w} m is tight for r 0.3 pawns`);
   if(doRaster){
    const nav=JSON.parse(JSON.stringify(out.stage));
    for(const w of nav.walls)for(const o of w.open||[])if(['door','double','slide'].includes(o.kind)){o.kind='arch';delete o.build;delete o.cov;delete o.door;}
    const ras=raster(Wd.compile(nav),.25,.3,out.extras.portals.filter(p=>p.walk&&p.at)),src=out.stage.spawns.find(s=>s.kind==='player')??out.stage.spawns.find(s=>s.kind==='arrive');
    if(!src)warn(`${where}: no player or arrive spawn; reachability skipped`);
    else{
     const seen=ras.reach(ras.near(src.x,src.z));let cells=0;const hit=new Set();
     for(let i=0;i<ras.N;i++)if(seen[i]>=0){cells++;const id=out.info.roomAt(...ras.c(i));if(id)hit.add(id);}
     R.reach={from:src.id,walkableM2:snap(cells*ras.step*ras.step)};
     const need=[...out.stage.spawns.filter(s=>s!==src).map(s=>[`spawn ${s.id}`,[s.x,s.z]]),...['obj','stash','items','stairs'].flatMap(k=>out.extras[k].map(o=>[`${k} ${o.id}`,o.at]))];
     for(const [id,at] of need){const i=ras.near(...at);if(i<0||seen[i]<0)err(`${where} ${id} at ${at} is not reachable from ${src.id}`);}
     for(const r of plan.stages[sid].rooms)if(!r.sealed&&!hit.has(r.id))err(`${where} room ${r.id}: not reachable from ${src.id}`);
    }
   }
  }
  report.outs=outs;return report;
 }
 return Object.freeze({version:1,derive,fromPlan,validate,compileLocated,raster,roomGraph,pathRooms,entrances,sightTest,STANCE,area,inside});
})();
