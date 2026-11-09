'use strict';
// W2b geometry mesher: compiled WORLD v3 stage (+ plan extras.finish) -> static triangles in vertex format v2.
// DOM/GL-free classic script. Plan stages use it; adapter (legacy grid) stages keep index.html buildStatic.
// MESH.build(st,opts,sink): sink is Batch-like (ensure(k), vtx(x,y,z,nx,ny,nz,u,v,c), room); see docs/PLAN-FORMAT.md §9.
const MESH=(()=>{
 const EPS=1e-7,CELL=1;
 const D8=[[1,0,0,1],[0,-1,1,0],[-1,0,0,-1],[0,1,-1,0],[-1,0,0,1],[1,0,0,-1],[0,1,1,0],[0,-1,-1,0]];
 // atlas tile ids (renderer.js makeAtlas). Plans override per room id, parent id, kind or surf via stage finish.
 const SURF=Object.freeze({asphalt:7,grass:17,tile:37,water:39,carpet:3,wood:4,marble:14,checker:1,tan:27,sand:38,concrete:38,cream:41,dark:43,white:44});
 // default finishes by STYLE.md §1 room kind (atlas tiles); plan extras.finish overrides
 const FLOOR_KIND=Object.freeze({bedroom:3,living:4,dining:4,lounge:4,reception:4,office:4,secure:4,control:4,studio:4,assembly:4,retail:37,closet:3,bath:37,kitchen:37,
  utility:38,workshop:38,plant:38,store:38,staff:38,special:38,circulation:38,core:43,
  walk:41,terrace:41,pier:41,lot:7,street:38,road:7,yard:38,court:37,alley:7,stair:38,roof:38,canopy:41,planter:17});
 const WALL_KIND=Object.freeze({bedroom:12,living:12,dining:12,closet:12,lounge:13,reception:13,office:13,secure:13,control:13,studio:13,assembly:13,retail:13,bath:33,kitchen:33,
  utility:6,workshop:6,plant:6,store:6,staff:6,special:6,circulation:6,stair:6,core:6,exterior:5,interior:12});
 const CAP=[0.13,0.09,0.16],SILL=[0.78,0.75,0.72],CASING=[0.8,0.74,0.64],GLASS=[0.55,0.85,1],RAIL=[0.36,0.38,0.42],GLASS_TILE=20;
 const DECOR_COL=[0.6,0.6,0.62];
 const PROP_COL=[[/^car_/,[0.62,0.18,0.22]],[/mattress|sofa|bed/,[0.72,0.6,0.62]],[/wood|plywood|ply_/,[0.55,0.4,0.28]],[/steel|alu|metal/,[0.5,0.52,0.56]],
  [/cmu|concrete|cbs|brick/,[0.62,0.6,0.58]],[/glass/,GLASS],[/./,[0.6,0.56,0.6]]];
 const LIP=0.3,AO_R=0.6;

 // ---- convex polygon helpers ([x,z] arrays, CCW = positive shoelace) ---------------------------
 const cross=(ax,az,bx,bz)=>ax*bz-az*bx;
 function area(P){let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1];}return a/2;}
 const ccw=P=>area(P)<0?P.slice().reverse():P.slice();
 // keep the part of convex P where nx*x+nz*z<=d (with tolerance)
 function clipHalf(P,nx,nz,d){
  let lo=Infinity,hi=-Infinity;const D=P.map(p=>{const v=nx*p[0]+nz*p[1]-d;if(v<lo)lo=v;if(v>hi)hi=v;return v;});
  if(hi<=EPS)return P;if(lo>=-EPS)return[];
  const out=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],da=D[i],db=D[(i+1)%P.length];
   if(da<=EPS)out.push(a);if((da<-EPS&&db>EPS)||(da>EPS&&db<-EPS)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}
  return out.length>=3?dedupe(out):[];
 }
 function dedupe(P){const out=[];for(const p of P){const q=out[out.length-1];if(!q||Math.abs(p[0]-q[0])>1e-9||Math.abs(p[1]-q[1])>1e-9)out.push(p);}
  while(out.length>1&&Math.abs(out[0][0]-out[out.length-1][0])<=1e-9&&Math.abs(out[0][1]-out[out.length-1][1])<=1e-9)out.pop();return out.length>=3?out:[];}
 const clipRect=(P,x0,z0,x1,z1)=>{let Q=clipHalf(P,-1,0,-x0);if(Q.length)Q=clipHalf(Q,1,0,x1);if(Q.length)Q=clipHalf(Q,0,-1,-z0);if(Q.length)Q=clipHalf(Q,0,1,z1);return Q;};
 // halfplanes of convex CCW T: inside is left of each edge
 function planes(T){return T.map((a,i)=>{const b=T[(i+1)%T.length],nx=b[1]-a[1],nz=-(b[0]-a[0]);return[nx,nz,nx*a[0]+nz*a[1]];});}
 function clipConvex(P,H){let Q=P;for(const [nx,nz,d] of H){Q=clipHalf(Q,nx,nz,d);if(!Q.length)break;}return Q;}
 // P minus convex T as disjoint convex pieces
 function subtract(P,H){const out=[];let Q=P;for(const [nx,nz,d] of H){const o=clipHalf(Q,-nx,-nz,-d);if(o.length&&Math.abs(area(o))>1e-10)out.push(o);Q=clipHalf(Q,nx,nz,d);if(!Q.length)break;}return out;}
 const insideAll=(P,H)=>P.every(p=>H.every(([nx,nz,d])=>nx*p[0]+nz*p[1]<=d+1e-9));
 function inside(P,x,z){let yes=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[j],b=P[i];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
 // ear clipping of a simple polygon into CCW triangles
 function triangulate(poly){
  const P=ccw(poly),idx=P.map((_,i)=>i),tris=[];let guard=0;
  const cv=(a,b,c)=>cross(b[0]-a[0],b[1]-a[1],c[0]-b[0],c[1]-b[1]);
  const inTri=(p,a,b,c)=>cross(b[0]-a[0],b[1]-a[1],p[0]-a[0],p[1]-a[1])>=-EPS&&cross(c[0]-b[0],c[1]-b[1],p[0]-b[0],p[1]-b[1])>=-EPS&&cross(a[0]-c[0],a[1]-c[1],p[0]-c[0],p[1]-c[1])>=-EPS;
  while(idx.length>3&&guard++<10000){
   let cut=-1;
   for(let i=0;i<idx.length&&cut<0;i++){const a=P[idx[(i+idx.length-1)%idx.length]],b=P[idx[i]],c=P[idx[(i+1)%idx.length]];
    if(Math.abs(cv(a,b,c))<=EPS){cut=i;break;}
    if(cv(a,b,c)<0)continue;
    if(!idx.some(j=>{const p=P[j];return p!==a&&p!==b&&p!==c&&inTri(p,a,b,c);}))cut=i;}
   if(cut<0)cut=0;
   const a=P[idx[(cut+idx.length-1)%idx.length]],b=P[idx[cut]],c=P[idx[(cut+1)%idx.length]];
   if(Math.abs(cv(a,b,c))>EPS)tris.push([a,b,c]);idx.splice(cut,1);
  }
  if(idx.length===3){const t=idx.map(i=>P[i]);if(Math.abs(area(t))>EPS)tris.push(t);}
  return tris;
 }
 // 2D spatial hash over 1 m cells
 const NONE=[],hk=(x,z)=>(x+32768)*65536+(z+32768);
 function hash(){const m=new Map();return{
  add(v,x0,z0,x1,z1){for(let z=Math.floor(z0);z<=Math.floor(z1);z++)for(let x=Math.floor(x0);x<=Math.floor(x1);x++){const k=hk(x,z);let a=m.get(k);if(!a)m.set(k,a=[]);a.push(v);}},
  at(x,z){return m.get(hk(Math.floor(x),Math.floor(z)))||NONE;},
  // visits may repeat a value that spans several cells; callers tolerate duplicates
  box(x0,z0,x1,z1){const s=[];for(let z=Math.floor(z0);z<=Math.floor(z1);z++)for(let x=Math.floor(x0);x<=Math.floor(x1);x++){const a=m.get(hk(x,z));if(a)for(const v of a)s.push(v);}return s;}};}
 const bbox=P=>{let x0=Infinity,z0=Infinity,x1=-Infinity,z1=-Infinity;for(const [x,z] of P){if(x<x0)x0=x;if(z<z0)z0=z;if(x>x1)x1=x;if(z>z1)z1=z;}return[x0,z0,x1,z1];};
 // rectangle set difference in (t,y) space
 function rectMinus(r,holes){
  const hs=holes.filter(h=>h[0]<r[1]-1e-6&&h[1]>r[0]+1e-6&&h[2]<r[3]-1e-6&&h[3]>r[2]+1e-6);if(!hs.length)return[r];
  const ts=[...new Set([r[0],r[1],...hs.flatMap(h=>[h[0],h[1]]).filter(t=>t>r[0]&&t<r[1])])].sort((a,b)=>a-b);
  const ys=[...new Set([r[2],r[3],...hs.flatMap(h=>[h[2],h[3]]).filter(y=>y>r[2]&&y<r[3])])].sort((a,b)=>a-b);
  const out=[];
  for(let i=1;i<ts.length;i++){const tm=(ts[i-1]+ts[i])/2;let run=null;
   for(let j=1;j<ys.length;j++){const ym=(ys[j-1]+ys[j])/2,hid=hs.some(h=>tm>h[0]&&tm<h[1]&&ym>h[2]&&ym<h[3]);
    if(hid){run=null;continue;}if(run)run[3]=ys[j];else out.push(run=[ts[i-1],ts[i],ys[j-1],ys[j]]);}}
  // merge columns with identical y runs
  out.sort((a,b)=>a[2]-b[2]||a[3]-b[3]||a[0]-b[0]);const merged=[];
  for(const q of out){const l=merged[merged.length-1];if(l&&l[2]===q[2]&&l[3]===q[3]&&Math.abs(l[1]-q[0])<1e-9)l[1]=q[1];else merged.push(q.slice());}
  return merged;
 }

 function build(st,opts,sink){
  if(!st||st.v!==3||st.policy!=='v2')throw new TypeError('MESH.build needs a compiled WORLD v3 plan stage');
  if(!opts||typeof opts.uv!=='function')throw new TypeError('MESH.build needs opts.uv(tile)');
  const t0=typeof performance!=='undefined'?performance.now():Date.now();
  const fin=opts.finish||{},FW=fin.wall||{},FF=fin.floor||{},white=opts.white||opts.uv(0);
  const tint=opts.tint||(()=>[1,1,1]),pick=opts.pick||(t=>[t,0]);
  if('blT' in sink){sink.blT=0;sink.blW=0;}// no blend layer yet (W13c macro tiles)
  let verts=0;const prof={},now=()=>typeof performance!=='undefined'?performance.now():Date.now();let tp=now();const lap=n=>{const t=now();prof[n]=t-tp;tp=t;};
  // room lookup with r.idx+1 bytes
  const roomH=hash();st.rooms.forEach(r=>{if(r.poly){const b=bbox(r.poly);roomH.add(r,...b);}});
  const roomAt=(x,z)=>{for(const r of roomH.at(x,z))if(inside(r.poly,x,z))return r;return null;};
  const byte=r=>r?r.idx+1:0;
  const pickTile=(table,r,extra)=>{for(let q=r;q;q=null){for(const k of [q.id,q.parent,...extra(q)])if(k!==undefined&&table[k]!==undefined)return table[k];}return undefined;};
  const wallTile=r=>(r&&pickTile(FW,r,q=>[q.kind]))??(r&&WALL_KIND[r.kind])??(!r||r.zone==='exterior'?FW.exterior??WALL_KIND.exterior:FW.interior??WALL_KIND.interior);
  const floorTile=(r,g)=>{const f=r&&pickTile(FF,r,q=>[q.kind]);if(f!==undefined)return f;if(FF[g.surf]!==undefined)return FF[g.surf];
   if(g.surf!=='concrete'&&SURF[g.surf]!==undefined)return SURF[g.surf];return(r&&FLOOR_KIND[r.kind])??SURF[g.surf]??SURF.concrete;};
  const emit=(room,P,n,uvs,cols)=>{// convex fan, P [[x,y,z]...]; triangles wound counter-clockwise about n
   sink.ensure((P.length-2)*3);sink.room=room;
   const a=P[0];
   for(let i=1;i<P.length-1;i++){const b=P[i],c=P[i+1],ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],wx=c[0]-a[0],wy=c[1]-a[1],wz=c[2]-a[2];
    const d=(uy*wz-uz*wy)*n[0]+(uz*wx-ux*wz)*n[1]+(ux*wy-uy*wx)*n[2];if(Math.abs(d)<1e-12)continue;// collinear fan vertices
    for(const k of d<0?[0,i+1,i]:[0,i,i+1]){const p=P[k];sink.vtx(p[0],p[1],p[2],n[0],n[1],n[2],uvs[k][0],uvs[k][1],cols[k]);verts++;}}
  };
  const mul=(c,s)=>[c[0]*s,c[1]*s,c[2]*s],tm=(c,t)=>[c[0]*t[0],c[1]*t[1],c[2]*t[2]];
  const quadUV=(uv,s,t,k)=>{const m=D8[k||0],a=s-0.5,b=t-0.5;return[uv[0]+(m[0]*a+m[1]*b+0.5)*(uv[2]-uv[0]),uv[1]+(m[2]*a+m[3]*b+0.5)*(uv[3]-uv[1])];};

  // ---- walls ------------------------------------------------------------------------------------
  const P=st.panels,spans=P.map((p,i)=>{const out=[];for(let c=p.c0;c<p.c1;c++){const k=st.cells[c];if(!k.active)continue;const l=out[out.length-1];
   if(l&&Math.abs(l[1]-k.y0)<1e-9)l[1]=k.y1;else out.push([k.y0,k.y1]);}return out;});
  const fullH=P.map(p=>{let h=0;for(let c=p.c0;c<p.c1;c++)h=Math.max(h,st.cells[c].y1);return h;});
  const edges=[],eh=hash();
  P.forEach((p,pi)=>{const poly=ccw(p.poly);for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1e-6)continue;
   const e={pi,a,b,L,ux:(b[0]-a[0])/L,uz:(b[1]-a[1])/L};e.nx=e.uz;e.nz=-e.ux;edges.push(e);eh.add(e,Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1]));}});
  const wallAO=hash(),aoBox=new Map();P.forEach((p,i)=>{if(p.kind==='wall'&&spans[i].length&&spans[i][0][0]<0.05){const b=bbox(p.poly);b[4]=p.poly.length===4&&p.poly.every((q,j)=>{const r=p.poly[(j+1)%4];return Math.abs(q[0]-r[0])<1e-9||Math.abs(q[1]-r[1])<1e-9;});aoBox.set(p,b);wallAO.add(p,b[0]-AO_R,b[1]-AO_R,b[2]+AO_R,b[3]+AO_R);}});
  for(const e of edges){
   const p=P[e.pi],sp=spans[e.pi];if(!sp.length)continue;
   const holes=[];
   for(const q of eh.box(Math.min(e.a[0],e.b[0]),Math.min(e.a[1],e.b[1]),Math.max(e.a[0],e.b[0]),Math.max(e.a[1],e.b[1]))){
    if(q===e||q.pi===e.pi||e.ux*q.ux+e.uz*q.uz>-0.9999)continue;
    if(Math.abs(cross(e.ux,e.uz,q.a[0]-e.a[0],q.a[1]-e.a[1]))>1e-5||Math.abs(cross(e.ux,e.uz,q.b[0]-e.a[0],q.b[1]-e.a[1]))>1e-5)continue;
    const ta=(q.a[0]-e.a[0])*e.ux+(q.a[1]-e.a[1])*e.uz,tb=(q.b[0]-e.a[0])*e.ux+(q.b[1]-e.a[1])*e.uz,lo=Math.max(0,Math.min(ta,tb)),hi=Math.min(e.L,Math.max(ta,tb));
    if(hi-lo>1e-6)for(const [y0,y1] of spans[q.pi])holes.push([lo,hi,y0,y1]);
   }
   const ox=e.nx*0.05,oz=e.nz*0.05,rcut=[];// face line crossings of room outlines: room byte and finish change there
   for(const rr of new Set(roomH.box(Math.min(e.a[0],e.b[0])+ox,Math.min(e.a[1],e.b[1])+oz,Math.max(e.a[0],e.b[0])+ox,Math.max(e.a[1],e.b[1])+oz))){const Q=rr.poly;
    for(let i=0;i<Q.length;i++){const qa=Q[i],qb=Q[(i+1)%Q.length],ex=qb[0]-qa[0],ez=qb[1]-qa[1],den=cross(e.ux,e.uz,ex,ez);if(Math.abs(den)<1e-12)continue;
     const sx=qa[0]-e.a[0]-ox,sz=qa[1]-e.a[1]-oz,t=cross(sx,sz,ex,ez)/den,u=cross(sx,sz,e.ux,e.uz)/den;if(t>1e-6&&t<e.L-1e-6&&u>-1e-9&&u<1+1e-9)rcut.push(t);}}
   const glass=p.kind==='window',rail=p.cov==='rail';
   const H=fullH[e.pi],rx=e.nz,rz=-e.nx,n=[e.nx,0,e.nz];
   for(const s of sp)for(const [ta,tb,ya,yb] of rectMinus([0,e.L,s[0],s[1]],holes)){if(tb-ta<1e-5||yb-ya<1e-5)continue;
    const A=[e.a[0]+e.ux*ta,e.a[1]+e.uz*ta],B=[e.a[0]+e.ux*tb,e.a[1]+e.uz*tb],uA=A[0]*rx+A[1]*rz,uB=B[0]*rx+B[1]*rz;
    const lo=Math.min(uA,uB),hi=Math.max(uA,uB),cuts=[lo];for(let k=Math.floor(lo+1e-6)+1;k<hi-1e-6;k++)cuts.push(k);
    for(const t of rcut)if(t>ta+1e-6&&t<tb-1e-6)cuts.push(uA+(uB-uA)*(t-ta)/(tb-ta));
    cuts.push(hi);cuts.sort((x,y)=>x-y);
    for(let i=1;i<cuts.length;i++){if(cuts[i]-cuts[i-1]<1e-6)continue;
     const k=Math.floor((cuts[i-1]+cuts[i])/2),f=u=>(u-uA)/(uB-uA),at=u=>[A[0]+(B[0]-A[0])*f(u),A[1]+(B[1]-A[1])*f(u)];
     const p0=at(cuts[i-1]),p1=at(cuts[i]),s0=cuts[i-1]-k,s1=cuts[i]-k;
     const r=roomAt((p0[0]+p1[0])/2+ox,(p0[1]+p1[1])/2+oz),tile=glass?GLASS_TILE:rail?null:wallTile(r),uv=tile===null?white:opts.uv(tile);
     const vy=y=>glass?(y-s[0])/(s[1]-s[0]||1):Math.min(1,y/(H||1));
     const pts=[[p0[0],ya,p0[1]],[p1[0],ya,p1[1]],[p1[0],yb,p1[1]],[p0[0],yb,p0[1]]],st2=[[s0,ya],[s1,ya],[s1,yb],[s0,yb]];
     const uvs=st2.map(([s,y])=>[uv[0]+s*(uv[2]-uv[0]),uv[3]+(uv[1]-uv[3])*vy(y)]);
     const cols=pts.map(q=>glass?GLASS:rail?RAIL:mul(tint(q[0],q[2]),0.62+0.38*Math.min(1,q[1]/(H||1))));
     emit(byte(r),pts,n,uvs,cols);
    }
   }
  }
  lap('walls');
  // caps (room 0: visible under fog) and soffits; glass has neither
  P.forEach((p,i)=>{if(p.kind==='window')return;const poly=ccw(p.poly);
   for(const [y0,y1] of spans[i]){
    const top=Math.abs(y1-fullH[i])<1e-6,c=p.cov==='rail'?RAIL:top?CAP:SILL;
    emit(0,poly.map(q=>[q[0],y1,q[1]]),[0,1,0],poly.map(()=>[white[0],white[1]]),poly.map(()=>c));
    if(y0>1e-6){const rp=poly.slice().reverse();emit(0,rp.map(q=>[q[0],y0,q[1]]),[0,-1,0],rp.map(()=>[white[0],white[1]]),rp.map(()=>SILL));}
   }});

  // ---- door casings -----------------------------------------------------------------------------
  const halfOf=new Map();for(const p of P)if(p.kind==='wall'&&!halfOf.has(p.ref))halfOf.set(p.ref,p.half);
  const box=(c,u,hu,hn,y0,y1,col,room)=>{// oriented box: centre c, axis u, half lengths hu (along) hn (across)
   const n=[-u[1],u[0]],corner=(su,sn)=>[c[0]+u[0]*hu*su+n[0]*hn*sn,c[1]+u[1]*hu*su+n[1]*hn*sn];
   const ring=[corner(-1,-1),corner(1,-1),corner(1,1),corner(-1,1)],w=[white[0],white[1]];
   emit(room,ring.map(q=>[q[0],y1,q[1]]),[0,1,0],ring.map(()=>w),ring.map(()=>col));
   for(let i=0;i<4;i++){const a=ring[i],b=ring[(i+1)%4],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    emit(room,[[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]]],[(b[1]-a[1])/L,0,-(b[0]-a[0])/L],[w,w,w,w],[mul(col,0.8),mul(col,0.8),col,col]);}
  };
  for(const o of st.openings){if(!['door','double','slide'].includes(o.kind))continue;const half=halfOf.get(o.wall)??0.1;
   for(const [a,b] of o.segments){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),u=[(b[0]-a[0])/L,(b[1]-a[1])/L],n=[-u[1],u[0]];
    for(const sgn of [1,-1]){const off=half+0.015,c=t=>[a[0]+u[0]*t+n[0]*off*sgn,a[1]+u[1]*t+n[1]*off*sgn],r=roomAt(a[0]+u[0]*L/2+n[0]*(half+0.05)*sgn,a[1]+u[1]*L/2+n[1]*(half+0.05)*sgn),rb=byte(r);
     box(c(-0.035),u,0.035,0.015,0,o.y1+0.07,CASING,rb);box(c(L+0.035),u,0.035,0.015,0,o.y1+0.07,CASING,rb);box(c(L/2),u,L/2,0.015,o.y1,o.y1+0.07,CASING,rb);}}}

  // ---- props: prisms --------------------------------------------------------------------------
  for(const p of st.props){const poly=ccw(p.poly),col=PROP_COL.find(([re])=>re.test(p.build))[1],c=poly.reduce((s,q)=>[s[0]+q[0]/poly.length,s[1]+q[1]/poly.length],[0,0]),rb=byte(roomAt(...c)),w=[white[0],white[1]];
   emit(rb,poly.map(q=>[q[0],p.h,q[1]]),[0,1,0],poly.map(()=>w),poly.map(()=>col));
   for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    emit(rb,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],p.h,b[1]],[a[0],p.h,a[1]]],[(b[1]-a[1])/L,0,-(b[0]-a[0])/L],[w,w,w,w],[mul(col,0.6),mul(col,0.6),mul(col,0.85),mul(col,0.85)]);}}

  lap('caps');
  // ---- ground: room pieces x 1 m cells x first-wins grounds (WORLD.groundY semantics) ------------
  const G=st.ground,gTri=[];
  const gTris=gi=>gTri[gi]||(gTri[gi]=triangulate(G[gi].poly).map(t=>({gi,b:bbox(t),H:planes(t)})));
  const groundH=hash();G.forEach((g,gi)=>groundH.add(gi,...bbox(g.poly)));
  const gAt=(x,z)=>{let best=null;for(const r of groundH.at(x,z))if((best===null||r<best)&&inside(G[r].poly,x,z))best=r;return best;};
  // first-wins candidate ground triangles overlapping cell (cx,cz), in ground order
  const gCand=(cx,cz)=>{const out=[];for(const gi of groundH.at(cx+0.5,cz+0.5).slice().sort((a,b)=>a-b))for(const q of gTris(gi))
   if(q.b[0]<cx+CELL&&q.b[2]>cx&&q.b[1]<cz+CELL&&q.b[3]>cz)out.push(q);return out;};
  const aoCache=new Map(),ao=(x,z)=>{const near=wallAO.at(x,z);if(!near.length)return 1;const k=Math.round(x*1e3)*1e7+Math.round(z*1e3);let v=aoCache.get(k);if(v!==undefined)return v;let d=AO_R;
   for(const p of near){const Q=p.poly,b=aoBox.get(p),bd=Math.hypot(Math.max(b[0]-x,x-b[2],0),Math.max(b[1]-z,z-b[3],0));if(bd>=d)continue;
    if(b[4]){d=bd;continue;}// axis-aligned rectangle: bbox distance is exact
    let m=Infinity;for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length],ex=b[0]-a[0],ez=b[1]-a[1],L2=ex*ex+ez*ez;if(L2<1e-12)continue;
     const t=Math.max(0,Math.min(1,((x-a[0])*ex+(z-a[1])*ez)/L2)),dx=a[0]+ex*t-x,dz=a[1]+ez*t-z;m=Math.min(m,Math.hypot(dx,dz));}
    if(inside(Q,x,z))m=0;d=Math.min(d,m);}
   const s=Math.min(1,d/AO_R);v=0.55+0.45*s*s*(3-2*s);aoCache.set(k,v);return v;};
  let floorArea=0;
  // cells whose open interior no room/ground edge crosses are uniform: one quad, ground at the centre
  const segRect=(a,b,x0,z0,x1,z1)=>{let t0=0,t1=1;const dx=b[0]-a[0],dz=b[1]-a[1];
   for(const [p,q] of [[-dx,a[0]-x0],[dx,x1-a[0]],[-dz,a[1]-z0],[dz,z1-a[1]]]){if(Math.abs(p)<1e-12){if(q<=0)return false;continue;}const r=q/p;if(p<0){if(r>t0)t0=r;}else if(r<t1)t1=r;if(t0>=t1)return false;}return true;};
  const edgeCells=(poly,fn)=>{for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];
   for(let z=Math.floor(Math.min(a[1],b[1]));z<=Math.floor(Math.max(a[1],b[1]));z++)for(let x=Math.floor(Math.min(a[0],b[0]));x<=Math.floor(Math.max(a[0],b[0]));x++)
    if(segRect(a,b,x+1e-7,z+1e-7,x+CELL-1e-7,z+CELL-1e-7))fn(hk(x,z));}};
  const gCut=new Set();G.forEach(g=>edgeCells(g.poly,k=>gCut.add(k)));
  for(const r of st.rooms){if(!r.poly)continue;
   const rCut=new Set();edgeCells(r.poly,k=>rCut.add(k));
   const tris=triangulate(r.poly).map(T=>({T,b:bbox(T),H:planes(T)})),[x0,z0,x1,z1]=bbox(r.poly);
   for(let cz=Math.floor(z0);cz<z1-1e-9;cz++)for(let cx=Math.floor(x0);cx<x1-1e-9;cx++){
    const key=hk(cx,cz),sq=[[cx,cz],[cx+CELL,cz],[cx+CELL,cz+CELL],[cx,cz+CELL]];let frags;
    if(!rCut.has(key)){if(!inside(r.poly,cx+0.5,cz+0.5))continue;frags=[sq];}
    else{frags=[];for(const {T,b,H} of tris){if(b[0]>=cx+CELL||b[2]<=cx||b[1]>=cz+CELL||b[3]<=cz)continue;
     const f=insideAll(sq,H)?sq:clipRect(T,cx,cz,cx+CELL,cz+CELL);if(f.length&&area(f)>1e-9)frags.push(f);}}
    if(!gCut.has(key)){const gi=gAt(cx+0.5,cz+0.5);if(gi!==null)for(const f of frags)out(f,gi);continue;}
    for(const frag of frags){let rest=[frag];
     for(const q of gCand(cx,cz)){if(!rest.length)break;const next=[];
      for(const piece of rest){
       if(insideAll(piece,q.H)){out(piece,q.gi);continue;}
       const inter=clipConvex(piece,q.H);if(inter.length&&area(inter)>1e-10){out(inter,q.gi);next.push(...subtract(piece,q.H));}else next.push(piece);}
      rest=next;}}
    function out(piece,gi){const g=G[gi],base=floorTile(r,g),[t,k]=pick(base,cx,cz,0),uv=opts.uv(t);floorArea+=area(piece);
     emit(r.idx+1,piece.map(q=>[q[0],g.y,q[1]]),[0,1,0],piece.map(q=>quadUV(uv,q[0]-cx,q[1]-cz,k)),piece.map(q=>mul(tint(q[0],q[1]),ao(q[0],q[1]))));}
   }}
  lap('ground');
  // risers on effective (first-wins) ground boundaries: the face looks toward the lower side; void gets a LIP-deep slab edge
  const segH=hash(),segs=[],seen=new Set();
  for(const poly of [...G.map(g=>g.poly),...st.rooms.filter(r=>r.poly).map(r=>r.poly)])for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],s={a,b};segs.push(s);
   segH.add(s,Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1]));}
  G.forEach((g,gi)=>{const poly=ccw(g.poly);
   for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<1e-6)continue;
    const nx=dz/L,nz=-dx/L,ts=[0,1];
    for(const s of segH.box(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1]))){
     const ex=s.b[0]-s.a[0],ez=s.b[1]-s.a[1],den=cross(dx,dz,ex,ez);
     if(Math.abs(den)<1e-12){if(Math.abs(cross(dx,dz,s.a[0]-a[0],s.a[1]-a[1]))<1e-6)for(const p of [s.a,s.b])ts.push(((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(L*L));continue;}
     const t=cross(s.a[0]-a[0],s.a[1]-a[1],ex,ez)/den,u=cross(s.a[0]-a[0],s.a[1]-a[1],dx,dz)/den;if(u>-1e-9&&u<1+1e-9)ts.push(t);}
    const rx=nz,rz=-nx,u0=a[0]*rx+a[1]*rz,u1=b[0]*rx+b[1]*rz;
    for(let k=Math.floor(Math.min(u0,u1))+1;k<Math.max(u0,u1);k++)ts.push((k-u0)/(u1-u0));
    const T=[...new Set(ts.filter(t=>t>=0&&t<=1).map(t=>Math.round(t*1e9)/1e9))].sort((p,q)=>p-q);
    for(let j=1;j<T.length;j++){if((T[j]-T[j-1])*L<1e-5)continue;
     const tmid=(T[j-1]+T[j])/2,m=[a[0]+dx*tmid,a[1]+dz*tmid],o=2e-3;
     if(gAt(m[0]-nx*o,m[1]-nz*o)!==gi)continue;
     const go=gAt(m[0]+nx*o,m[1]+nz*o),yo=go===null?g.y-LIP:G[go].y;if(Math.abs(yo-g.y)<1e-4)continue;
     const sk=Math.round(m[0]*1e4)*1e8+Math.round(m[1]*1e4);if(seen.has(sk))continue;seen.add(sk);
     const rIn=roomAt(m[0]-nx*o,m[1]-nz*o),rOut=roomAt(m[0]+nx*o,m[1]+nz*o),down=yo<g.y,yl=Math.min(yo,g.y),yh=Math.max(yo,g.y);
     const uv=opts.uv(down?floorTile(rIn,g):floorTile(rOut,G[go])),fn=down?[nx,0,nz]:[-nx,0,-nz];
     const p0=[a[0]+dx*T[j-1],a[1]+dz*T[j-1]],p1=[a[0]+dx*T[j],a[1]+dz*T[j]],kk=Math.floor((p0[0]*rx+p0[1]*rz+p1[0]*rx+p1[1]*rz)/2);
     const s0=p0[0]*rx+p0[1]*rz-kk,s1=p1[0]*rx+p1[1]*rz-kk,h=yh-yl,vv=y=>uv[3]+(uv[1]-uv[3])*Math.min(1,(y-yl)/Math.max(h,1));
     const pts=[[p0[0],yl,p0[1]],[p1[0],yl,p1[1]],[p1[0],yh,p1[1]],[p0[0],yh,p0[1]]];
     emit(byte(down?rOut||rIn:rIn||rOut),pts,fn,[[uv[0]+s0*(uv[2]-uv[0]),vv(yl)],[uv[0]+s1*(uv[2]-uv[0]),vv(yl)],[uv[0]+s1*(uv[2]-uv[0]),vv(yh)],[uv[0]+s0*(uv[2]-uv[0]),vv(yh)]],
      pts.map(q=>mul(tint(q[0],q[2]),q[1]<yh-1e-6?0.5:0.75)));
    }}});
  lap('risers');
  // ---- decor[] (render-only, W4 DECOR.place): oriented boxes on the first-wins ground at `at` ----
  // boundary-inclusive first-wins lookups (WORLD.groundY / roomAt semantics for points on edges)
  const onEdge=(Q,x,z)=>{for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length],ex=b[0]-a[0],ez=b[1]-a[1],L2=ex*ex+ez*ez,t=L2?Math.max(0,Math.min(1,((x-a[0])*ex+(z-a[1])*ez)/L2)):0;
   if(Math.hypot(a[0]+ex*t-x,a[1]+ez*t-z)<1e-9)return true;}return false;};
  const near=(h,x,z)=>new Set([-1e-6,1e-6].flatMap(d=>[...h.at(x+d,z+d),...h.at(x-d,z+d),...h.at(x+d,z-d),...h.at(x-d,z-d)]));
  const gIncl=(x,z)=>{let best=null;for(const r of near(groundH,x,z))if((best===null||r<best)&&(inside(G[r].poly,x,z)||onEdge(G[r].poly,x,z)))best=r;return best;};
  const rIncl=(x,z)=>[...near(roomH,x,z)].sort((p,q)=>p.idx-q.idx).find(r=>inside(r.poly,x,z)||onEdge(r.poly,x,z))||null;
  for(const dc of st.decor||[]){const [x,z]=dc.at,gi=gIncl(x,z),y0=(gi===null?0:G[gi].y)+(dc.y||0),y1=y0+dc.h,a=dc.rot||0,c=Math.cos(a),s=Math.sin(a);
   const hw=dc.size[0]/2,hd=dc.size[1]/2,ring=ccw([[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([p,q])=>[x+p*c-q*s,z+p*s+q*c]));
   const col=dc.col||DECOR_COL,uv=dc.tile===undefined?white:opts.uv(dc.tile),rb=byte(rIncl(x,z));
   const tuv=dc.tile===undefined?ring.map(()=>[white[0],white[1]]):[[uv[0],uv[1]],[uv[2],uv[1]],[uv[2],uv[3]],[uv[0],uv[3]]];
   emit(rb,ring.map(q=>[q[0],y1,q[1]]),[0,1,0],tuv,ring.map(()=>col));
   if((dc.y||0)>1e-6)emit(rb,ring.slice().reverse().map(q=>[q[0],y0,q[1]]),[0,-1,0],tuv.slice().reverse(),ring.map(()=>mul(col,0.5)));
   for(let i=0;i<4;i++){const p=ring[i],q=ring[(i+1)%4],L=Math.hypot(q[0]-p[0],q[1]-p[1]);
    emit(rb,[[p[0],y0,p[1]],[q[0],y0,q[1]],[q[0],y1,q[1]],[p[0],y1,p[1]]],[(q[1]-p[1])/L,0,-(q[0]-p[0])/L],
     dc.tile===undefined?[0,0,0,0].map(()=>[white[0],white[1]]):[[uv[0],uv[3]],[uv[2],uv[3]],[uv[2],uv[1]],[uv[0],uv[1]]],[mul(col,0.65),mul(col,0.65),mul(col,0.9),mul(col,0.9)]);}}
  lap('decor');
  const t1=typeof performance!=='undefined'?performance.now():Date.now();
  return{verts,tris:verts/3,floorArea,ms:t1-t0,prof};
 }
 return Object.freeze({version:1,build,SURF,FLOOR_KIND,WALL_KIND,triangulate});
})();
