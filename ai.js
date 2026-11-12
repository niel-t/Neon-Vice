'use strict';
// Enemy perception, knowledge and behaviour. Enemies act on beliefs built from sight, sound, callouts and hits;
// G.player is read directly only for the senses themselves (vision, proximity, footsteps) and while seen.
/* W2f plan stages (g.plan): WORLD geometry is authoritative, the cell grid is compatibility only */
const PL=g=>!!(g&&g.plan&&g.wst&&typeof planNav==='function');
const mClear=(g,ax,az,bx,bz,r=0)=>PL(g)?WORLD.clear(g.wst,ax,az,bx,bz,r):WORLD.cell.moveClear(g,ax,az,bx,bz,r);
const blk=(g,x,z)=>PL(g)?!WORLD.clear(g.wst,x,z,x,z,0):WORLD.cell.isBlock(g,Math.floor(x),Math.floor(z));
const AI=(()=>{
 const SRC={see:{conf:1,sig:.3},step:{conf:.8,sig:.8},noise:{conf:.7,sig:1.5},call:{conf:.75,sig:1.2},hit:{conf:.6,sig:3},shot:{conf:.6,sig:1.5}};
 const TAU_C=4,SIG_RATE=2.5,SIG_MAX=8,PRED_MAX=1,GRACE=3,KEEP=6,WALL_COST=6,DOOR_COST=3;
 const belief={
  make(x,z,t,src,o){o=o||{};const s=SRC[src];return{x,z,vx:o.vx||0,vz:o.vz||0,t,src,conf:o.conf!==undefined?o.conf:s.conf,sig:o.sig!==undefined?o.sig:s.sig};},
  age:(b,T)=>Math.max(0,T-b.t),
  conf:(b,T)=>b.conf*Math.exp(-belief.age(b,T)/TAU_C),
  sig:(b,T)=>Math.min(SIG_MAX,b.sig+SIG_RATE*belief.age(b,T)),
  predict(b,T){const a=Math.min(belief.age(b,T),PRED_MAX);return[b.x+b.vx*a,b.z+b.vz*a];},
  accept:(old,nb,T)=>!old||nb.src==='see'||belief.conf(nb,T)>=belief.conf(old,T),
  // Movement goal: computed once per belief, prediction clamped to 1 s and to a clear straight line.
  goal(g,b){if(b.gx===undefined){const p=belief.predict(b,b.t+PRED_MAX);const ok=(b.vx||b.vz)&&mClear(g,b.x,b.z,p[0],p[1]);b.gx=ok?p[0]:b.x;b.gz=ok?p[1]:b.z;}return[b.gx,b.gz];}
 };
 function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
 function rand(e){if(!e.rng)e.rng=rng(Math.imul((typeof levelIdx==='number'?levelIdx:0)+1,0x9E3779B1)^Math.imul((e.id|0)+1,0x85EBCA77));return e.rng();}
 /* acoustics: chamfer Dijkstra; tall walls transmit at a cost, closed doors muffle */
 let ac=null;
 const NB=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]];
 function acFor(g){if(ac&&ac.g===g&&ac.nd===(g.doors?g.doors.length:0))return ac;const n=g.W*g.H,doors=new Map();
  for(const d of g.doors||[])doors.set(Math.floor(d.hz+Math.sin(d.base)*.5)*g.W+Math.floor(d.hx+Math.cos(d.base)*.5),d);
  return ac={g,nd:g.doors?g.doors.length:0,dist:new Float64Array(n),seen:new Uint32Array(n),cur:0,doors};}
 const tall=(g,i)=>g.solid[i]===1&&(!g.wh[i]||g.wh[i]>=.6);
 function enterCost(a,i){const g=a.g;if(tall(g,i))return WALL_COST;const d=a.doors.get(i);return d&&Math.abs(d.th)<.35?DOOR_COST:0;}
 function hear(g,x,z,max){const a=acFor(g),W=g.W,H=g.H;if(++a.cur>=0xffffffff){a.seen.fill(0);a.cur=1;}
  const sx=Math.floor(x),sz=Math.floor(z);if(sx<0||sz<0||sx>=W||sz>=H)return a;
  const hp=[],push=(d,i)=>{hp.push([d,i]);let k=hp.length-1;while(k>0){const q=(k-1)>>1;if(hp[q][0]<=hp[k][0])break;[hp[q],hp[k]]=[hp[k],hp[q]];k=q;}};
  const pop=()=>{const top=hp[0],last=hp.pop();if(hp.length){hp[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<hp.length&&hp[l][0]<hp[m][0])m=l;if(r<hp.length&&hp[r][0]<hp[m][0])m=r;if(m===k)break;[hp[m],hp[k]]=[hp[k],hp[m]];k=m;}}return top;};
  const s=sz*W+sx;a.seen[s]=a.cur;a.dist[s]=0;push(0,s);
  while(hp.length){const [d,i]=pop();if(d>a.dist[i])continue;const cx=i%W,cz=(i-cx)/W;
   for(const [ox,oz,c] of NB){const nx=cx+ox,nz=cz+oz;if(nx<0||nz<0||nx>=W||nz>=H)continue;const j=nz*W+nx;
    if(ox&&oz&&(tall(g,cz*W+nx)||tall(g,nz*W+cx)))continue;
    const nd=d+c+enterCost(a,j);if(!(nd<=max)||(a.seen[j]===a.cur&&a.dist[j]<=nd))continue;a.seen[j]=a.cur;a.dist[j]=nd;push(nd,j);}}
  return a;}
 function costAt(a,x,z){const g=a.g,cx=Math.floor(x),cz=Math.floor(z);if(cx<0||cz<0||cx>=g.W||cz>=g.H)return Infinity;const i=cz*g.W+cx;return a.seen[i]===a.cur?a.dist[i]:Infinity;}
 /* per-target navigation fields, shared by target cell, at most BUDGET fresh BFS per frame, oldest request first */
 const nav={BUDGET:4,MAX:32,g:null,cache:new Map(),queue:[],T:NaN,budget:0,built:0,pn:null,pc:new Map(),
  // plan stages: WORLD.flow fields keyed by 0.5 m target tile; null while waiting for budget, false if nav fails
  pfield(g,x,z){nav.frame(g);let n;try{n=planNav(g);}catch(err){return false;}if(nav.pn!==n){nav.pn=n;nav.pc.clear();}
   const k=Math.floor(x*2)+','+Math.floor(z*2),c=nav.pc.get(k);if(c){c.used=nav.T;return c.f;}if(nav.budget<=0)return null;
   if(nav.pc.size>=nav.MAX){let ok=null,ou=Infinity;for(const [kk,v] of nav.pc)if(v.used<ou){ou=v.used;ok=kk;}nav.pc.delete(ok);}
   let f;try{f=WORLD.flow(n,[[x,z]]);}catch(err){return false;}nav.budget--;nav.built++;nav.pc.set(k,{f,used:nav.T});return f;},
  key(g,x,z){const cx=Math.floor(x),cz=Math.floor(z);if(!WORLD.cell.isBlock(g,cx,cz))return cz*g.W+cx;
   for(const [ox,oz] of NB){if(!WORLD.cell.isBlock(g,cx+ox,cz+oz))return(cz+oz)*g.W+cx+ox;}return -1;},
  build(g,k){let c=nav.cache.get(k);if(!c){if(nav.cache.size>=nav.MAX){let ok=null,ou=Infinity;for(const [kk,v] of nav.cache)if(v.used<ou){ou=v.used;ok=kk;}c=nav.cache.get(ok);nav.cache.delete(ok);}
    else c={f:new Int16Array(g.W*g.H)};nav.cache.set(k,c);}
   WORLD.cell.bfs(g,c.f,k%g.W,(k/g.W)|0);c.ver=g.navVer|0;c.used=nav.T;nav.budget--;nav.built++;return c.f;},
  frame(g){const T=g.T||0;if(nav.g!==g){nav.g=g;nav.cache.clear();nav.queue.length=0;nav.pc.clear();}if(T===nav.T)return;nav.T=T;nav.budget=nav.BUDGET;
   while(nav.budget>0&&nav.queue.length){const k=nav.queue.shift(),c=nav.cache.get(k);if(!c||c.ver!==(g.navVer|0))nav.build(g,k);}},
  // Int16Array field (fresh or awaiting rebuild), null while waiting for budget, false if no free cell near the target.
  field(g,x,z){nav.frame(g);const k=nav.key(g,x,z);if(k<0)return false;const c=nav.cache.get(k);
   if(c&&c.ver===(g.navVer|0)){c.used=nav.T;return c.f;}
   if(nav.budget>0)return nav.build(g,k);if(!nav.queue.includes(k))nav.queue.push(k);return c?c.f:null;}
 };
 const noises=[];let nzT=NaN,nzF=[];
 function know(e,b){if(belief.accept(e.bl,b,G.T||0))e.bl=b;}
 function poi(e,x,z,src){e.poi={x,z,t:G.T||0,src};}
 function investigate(e,x,z,qT,lh){if(e.state==='chase')return;e.state='search';e.sx=x;e.sz=z;e.searchT=0;e.srT=0;e.arr=0;e.pb=null;e.qT=qT;e.amb=null;
  e.lh=lh!==undefined?lh:Math.atan2(x-e.x,z-e.z);}
 function callout(e,r,fn){const g=G,ls=g.enemies.filter(q=>q!==e&&q.alive&&!(q.down>0)&&Math.hypot(q.x-e.x,q.z-e.z)<r);if(!ls.length)return 0;
  const a=hear(g,e.x,e.z,r*1.3);let n=0;for(const q of ls)if(costAt(a,q.x,q.z)<=r*1.3){fn(q);n++;}return n;}
 function hurt(e,dir){const l=Math.hypot(dir[0],dir[1]);if(!e.alive||!(l>1e-6))return;const ux=dir[0]/l,uz=dir[1]/l;e.hd=Math.atan2(-ux,-uz);know(e,belief.make(e.x-ux*3,e.z-uz*3,G.T||0,'hit'));}
 function witness(e){const g=G;for(const q of g.enemies){if(q.alive&&q!==e&&!(q.down>0)&&q.state!=='chase'&&Math.hypot(q.x-e.x,q.z-e.z)<4&&los(q.x,q.z,e.x,e.z)){q.wary=1;e.found=1;poi(q,e.x,e.z,'body');investigate(q,e.x,e.z,1.2);}}}
 function seek(e,tx,tz,sp){const g=G,dx=tx-e.x,dz=tz-e.z,d=Math.hypot(dx,dz);if(d<.6)return{vx:0,vz:0,face:null,done:true};
  let px=tx,pz=tz;
  if(!mClear(g,e.x,e.z,tx,tz,Math.max(0,e.r-.02))){if(PL(g)){const f=nav.pfield(g,tx,tz);if(f===null)return{vx:0,vz:0,face:Math.atan2(dx,dz)};
    let s=null;try{const v=f?WORLD.dist(nav.pn,f,e.x,e.z):-1;if(v<0)return{vx:0,vz:0,face:null,stuck:true};if(v<.3)return{vx:0,vz:0,face:null,done:true};s=WORLD.step(nav.pn,f,e.x,e.z);}catch(err){nav.pc.clear();}
    if(!s)return{vx:0,vz:0,face:null,stuck:true};px=s[0];pz=s[1];}else{const f=nav.field(g,tx,tz);
   if(f===null)return{vx:0,vz:0,face:Math.atan2(dx,dz)};
   const cx=Math.floor(e.x),cz=Math.floor(e.z),v=f?f[cz*g.W+cx]:-1;if(v<0)return{vx:0,vz:0,face:null,stuck:true};if(v===0)return{vx:0,vz:0,face:null,done:true};
   const t=flowStep(f,e,tx,tz);px=t[0];pz=t[1];}}
  const ddx=px-e.x,ddz=pz-e.z,l=Math.hypot(ddx,ddz)||1;return{vx:ddx/l*sp,vz:ddz/l*sp,face:Math.atan2(ddx,ddz)};}
 function probe(e){const g=G,s=e.bl?Math.min(4,Math.max(1.5,belief.sig(e.bl,g.T||0))):2.5,h=e.lh!==undefined?e.lh:e.a;
  for(let k=0;k<6;k++){const a=h+(rand(e)-.5)*2.6,d=s*(.5+.5*rand(e)),x=e.sx+Math.sin(a)*d,z=e.sz+Math.cos(a)*d;
   if(blk(g,x,z))continue;
   if(Math.abs(angDiff(e.a,Math.atan2(x-e.x,z-e.z)))<visionHalfAngle(e)&&los(e.x,e.z,x,z))continue;
   return[x,z];}
  return null;}
 // Sweep around (e.sx,e.sz): walk there, then alternate looking around with probes biased to the last heading.
 function search(e,dt,sp){const lim=e.wary?6:3.5;
  if(e.amb){const a=e.amb;if((G.T||0)-a.t>AMB_HOLD){e.amb=null;e.srT=0;}else{const r=seek(e,a.x,a.z,sp);return r.done||r.stuck?{vx:0,vz:0,face:a.a}:r;}}
  e.srT=(e.srT||0)+dt;if(e.srT>lim+10)return{vx:0,vz:0,face:null,end:true};
  if(!e.arr){const r=seek(e,e.sx,e.sz,sp);if(!r.done&&!r.stuck)return r;e.arr=1;e.searchT=0;e.lookT=.6;}
  e.searchT+=dt;if(e.searchT>lim)return{vx:0,vz:0,face:null,end:true};
  if(e.pb){e.pbT-=dt;const r=seek(e,e.pb[0],e.pb[1],sp*.8);if(!r.done&&!r.stuck&&e.pbT>0)return r;e.pb=null;e.lookT=1;}
  e.lookT-=dt;if(e.lookT<=0){e.pb=probe(e);e.pbT=2.5;e.lookT=1;}
  return{vx:0,vz:0,face:e.a+dt*3};}
 function noiseDup(x,z,r,src){const T=G.T||0;if(T!==nzT){nzT=T;nzF.length=0;}
  if(nzF.some(n=>n.src===src&&n.r>=r&&Math.hypot(n.x-x,n.z-z)<.75))return true;nzF.push({x,z,r,src});
  noises.push({x,z,r,t:T});if(noises.length>16)noises.shift();return false;}
 // W8b room belief: probability mass over a room graph; index n is "unroomed/outside".
 // gr={n,area[],cx[],cz[],at(x,z)->i|-1,adj(i)->portal idx[],pa[],pb[] (-1 outside),pw[],px[],pz[],open(k)->bool}
 const PROBE=[.6,0,-.6,0,0,.6,0,-.6,.6,.6,-.6,.6,.6,-.6,-.6,-.6,1.1,0,-1.1,0,0,1.1,0,-1.1];
 const rooms={
  graph(st,W){W=W||WORLD;const R=st.rooms,Pt=st.portals,n=R.length,m=Pt.length,gr={n,area:new Float64Array(n+1),cx:new Float64Array(n+1),cz:new Float64Array(n+1),
   pa:new Int16Array(m),pb:new Int16Array(m),pw:new Float64Array(m),px:new Float64Array(m),pz:new Float64Array(m),
   at:(x,z)=>{let r=W.roomAt(st,x,z);if(r)return r.idx;const p=W.portalAt(st,x,z);if(p)return p.a;
    // Legacy doorway cells belong to no room: resolve to the nearest adjoining one so mass never strands outside.
    for(let j=0;j<PROBE.length;j+=2){r=W.roomAt(st,x+PROBE[j],z+PROBE[j+1]);if(r)return r.idx;}return -1;},
   adj:i=>i<n?W.portals(st,i):[],open:k=>W.portalOpen(st,Pt[k],'move'),ok:(x,z,r)=>W.clear(st,x,z,x,z,r),s:[],pnx:new Float64Array(m),pnz:new Float64Array(m)};
   for(const r of R){gr.area[r.idx]=Math.max(r.area,1);gr.cx[r.idx]=r.centroid[0];gr.cz[r.idx]=r.centroid[1];gr.s[r.idx]=r.samples;}gr.area[n]=1e3;
   for(const p of Pt){gr.pa[p.idx]=p.a;gr.pb[p.idx]=p.b==null?-1:p.b;gr.pw[p.idx]=p.width;gr.px[p.idx]=p.mid[0];gr.pz[p.idx]=p.mid[1];gr.pnx[p.idx]=p.nx||0;gr.pnz[p.idx]=p.nz||0;}return gr;},
  init(gr,x,z,out){const P=out&&out.length===gr.n+1?out.fill(0):new Float32Array(gr.n+1),i=gr.at(x,z);P[i<0?gr.n:i]=1;return P;},
  // Mass leaks through move-open portals at speed*width/area per second, capped so a room never over-drains.
  diffuse(gr,P,dt,speed){const n=gr.n,m=gr.pa.length,d=(gr.dd||(gr.dd=new Float64Array(n+1))).fill(0);let deg=gr.deg;
   if(!deg){deg=gr.deg=new Float64Array(n+1);for(let k=0;k<m;k++){deg[gr.pa[k]]++;deg[gr.pb[k]<0?n:gr.pb[k]]++;}}
   for(let k=0;k<m;k++){if(gr.pa[k]<0||!gr.open(k))continue;const a=gr.pa[k],b=gr.pb[k]<0?n:gr.pb[k];
    const fa=P[a]*Math.min(dt*speed*gr.pw[k]/gr.area[a],.9/deg[a]),fb=P[b]*Math.min(dt*speed*gr.pw[k]/gr.area[b],.9/deg[b]);d[a]+=fb-fa;d[b]+=fa-fb;}
   for(let i=0;i<=n;i++)P[i]=Math.max(0,P[i]+d[i]);return P;},
  // Negative information: room i was looked at and the player is not there.
  clear(P,i,f){P[i]*=1-(f==null?1:f);let s=0;for(let j=0;j<P.length;j++)s+=P[j];if(s<1e-6)return false;for(let j=0;j<P.length;j++)P[j]/=s;return true;},
  pick(gr,P,x,z){let best=-1,bs=1e-4;for(let i=0;i<gr.n;i++){const s=P[i]/(1+.1*Math.hypot(gr.cx[i]-x,gr.cz[i]-z));if(s>bs){bs=s;best=i;}}return best;},
  // Ambush: cover the own-room portal facing the most likely neighbour, standing back inside the room.
  ambush(gr,P,mine,back){back=back||1.5;let best=-1,bp=1e-3;for(const k of gr.adj(mine)){if(k>=gr.pa.length||!gr.open(k))continue;const o=gr.pa[k]===mine?gr.pb[k]:gr.pa[k],q=P[o<0?gr.n:o];if(q>bp){bp=q;best=k;}}
   if(best<0)return null;const mx=gr.px[best],mz=gr.pz[best];
   // Stand back along the portal normal on our side (centroid direction as fallback); the spot must be in our room and clear.
   const nx=gr.pnx?gr.pnx[best]:0,nz=gr.pnz?gr.pnz[best]:0,dirs=[nx,nz,-nx,-nz,gr.cx[mine]-mx,gr.cz[mine]-mz];
   for(let j=0;j<6;j+=2){const l=Math.hypot(dirs[j],dirs[j+1]);if(l<1e-6)continue;const ux=dirs[j]/l,uz=dirs[j+1]/l;
    for(const s of[back,back*.66,back*.4]){const x=mx+ux*s,z=mz+uz*s;if(gr.at(x,z)!==mine||(gr.ok&&!gr.ok(x,z,.3)))continue;return{k:best,x,z,a:Math.atan2(mx-x,mz-z),p:bp};}}
   return null;}
 };
 const HUNT=30,AMB_HOLD=8,PSPD=3,rg={st:null,v:-1,pt:null,m:0,gr:null};
 // Room graph of the live stage (index.html wst); null on harnesses without one or on roomless stages.
 function graph(){if(typeof wst!=='function')return null;const st=wst(G);if(!st||!st.rooms||!st.rooms.length)return null;
  // Rebuild on stage swap, nav revision (glass/breach bumps g.navVer) or W1f portal append/merge.
  const v=G.navVer|0;if(rg.st!==st||rg.v!==v||rg.pt!==st.portals||rg.m!==st.portals.length){rg.st=st;rg.v=v;rg.pt=st.portals;rg.m=st.portals.length;rg.gr=rooms.graph(st);}return rg.gr;}
 // Room belief follows e.bl: reseeded on new information, spread at player speed, and the agent's own room drains as it looks.
 function track(e,dt){const gr=graph(),b=e.bl;if(!gr||!b)return null;const T=G.T||0;
  if(e.rpB!==b||!e.rp||e.rp.length!==gr.n+1){e.rp=rooms.init(gr,b.x,b.z,e.rp);e.rpB=b;for(let a=Math.min(T-b.t,8);a>1e-3;a-=.25)rooms.diffuse(gr,e.rp,Math.min(.25,a),PSPD);}
  else if(dt>0)rooms.diffuse(gr,e.rp,dt,PSPD);
  const i=gr.at(e.x,e.z);if(i>=0)rooms.clear(e.rp,i,Math.min(1,dt*.8));return gr;}
 // Search ended: rule out the searched room and move on to the likeliest remaining one.
 function hunt(e){const gr=graph(),b=e.bl;if(!gr||!b||e.boss||!e.rp||e.rpB!==b||(G.T||0)-b.t>HUNT)return false;
  for(const q of[[e.x,e.z],[e.sx,e.sz]]){const i=gr.at(q[0],q[1]);if(i>=0&&!rooms.clear(e.rp,i,1))return false;}
  const k=rooms.pick(gr,e.rp,e.x,e.z);if(k<0)return false;const s=gr.s[k]||[],q=s.length?s[Math.floor(rand(e)*s.length)]:[gr.cx[k],gr.cz[k]];
  investigate(e,q[0],q[1],0);e.hr=k;return true;}
 // Lost sight: some ranged agents hold their room, covering the portal the player most likely left through.
 function lurk(e){if(e.boss)return false;const gr=track(e,0);if(!gr||rand(e)>=(e.pers==='careful'?.7:.25))return false;
  const mine=gr.at(e.x,e.z);if(mine<0)return false;const am=rooms.ambush(gr,e.rp,mine,1.5);if(!am||am.p<.25)return false;
  e.amb={x:am.x,z:am.z,a:am.a,t:G.T||0};return true;}
 // Shot evidence: impacts, penetration exits, near misses and hits on allies alarm witnesses even when suppressed.
 // Same room always witnesses; otherwise line of sight within SHOT_R, or close enough to hear the crack.
 const SHOT_R=9,SHOT_NEAR=1.5,WHIZ=1;
 const iq=e=>e.iq!==undefined?e.iq:e.pers==='careful'?.9:e.pers==='flank'?.5:.15;
 // Smart witnesses walk the shot line back to the first obstruction and through it into the space beyond.
 function backtrace(g,x,z,ux,uz){let px=x,pz=z,wall=0;
  for(let s=.25;s<=12;s+=.25){const qx=x+ux*s,qz=z+uz*s,b=WORLD.cell.isBlock(g,Math.floor(qx),Math.floor(qz));
   if(b){if(++wall>8)break;continue;}if(wall){const rx=qx+ux*.75,rz=qz+uz*.75;return WORLD.cell.isBlock(g,Math.floor(rx),Math.floor(rz))?[qx,qz]:[rx,rz];}px=qx;pz=qz;if(s>=8)break;}
  return[px,pz];}
 function shot(x,z,dx,dz,kind,skip){const g=G;if(!g||!g.enemies)return 0;const l=Math.hypot(dx,dz);if(!(l>1e-6))return 0;const ux=dx/l,uz=dz/l,T=g.T||0;
  // Evidence point sits on the witnesses' side of the surface it marks.
  const k=kind==='exit'?.1:kind==='impact'?-.1:0;x+=ux*k;z+=uz*k;
  const gr=graph(),ri=gr?gr.at(x,z):-1;let n=0;
  for(const e of g.enemies){if(!e.alive||e===skip||e.down>0)continue;if(e.bl&&e.bl.src==='see'&&T-e.bl.t<.25)continue;const d=Math.hypot(e.x-x,e.z-z);
   const same=ri>=0&&gr.at(e.x,e.z)===ri;if(!same&&d>SHOT_NEAR&&!(d<=SHOT_R&&los(e.x,e.z,x,z)))continue;
   n++;e.wary=1;const smart=rand(e)<iq(e);let bx=x,bz=z,o={conf:.45,sig:5};
   if(smart){[bx,bz]=backtrace(g,x,z,-ux,-uz);o={};}
   know(e,belief.make(bx,bz,T,'shot',o));e.shK=smart?'trace':'panic';
   if(e.state!=='chase'){if(!(e.shT>T-3)&&typeof popup==='function'){popup(e.x,e.z,smart?'SHOTS!':'?!','#ffd36b');if(typeof sfx==='function')sfx('alert');}
    investigate(e,bx,bz,.4,smart?Math.atan2(-ux,-uz):undefined);}
   e.shT=T;}
  return n;}
 // Near misses along a player bullet segment: each enemy reacts once per bullet.
 function whiz(b,ax,az,d){const g=G;if(!g||!g.enemies||!(d>0))return;
  for(const e of g.enemies){if(!e.alive||(b.hit&&b.hit.includes(e))||(b.nm&&b.nm.includes(e)))continue;
   const t=Math.max(0,Math.min(d,(e.x-ax)*b.dx+(e.z-az)*b.dz)),px=ax+b.dx*t,pz=az+b.dz*t;
   if(Math.hypot(e.x-px,e.z-pz)>WHIZ+e.r)continue;(b.nm||(b.nm=[])).push(e);shot(px,pz,b.dx,b.dz,'miss');}}
 return{SRC,belief,rng,rand,hear,costAt,nav,rooms,graph,track,hunt,lurk,noises,know,poi,investigate,callout,hurt,witness,seek,search,probe,noiseDup,shot,whiz,backtrace,iq,GRACE,KEEP,HUNT,AMB_HOLD,
  debug:typeof location!=='undefined'&&/[?&]ai=1(&|$)/.test(location.search)};
})();
function alertNoise(x,z,r,src){const g=G;if(!g||!(r>=1)||AI.noiseDup(x,z,r,src))return;const T=g.T||0,R=r*1.5;
 const ls=g.enemies.filter(e=>e.alive&&!(e.down>0)&&Math.hypot(e.x-x,e.z-z)<(e.boss?R:r));if(!ls.length)return;
 const a=AI.hear(g,x,z,ls.some(e=>e.boss)?R:r);
 for(const e of ls){const lim=e.boss?R:r,c=AI.costAt(a,e.x,e.z);if(c>lim)continue;
  if(src==='p'){const q=c/lim;AI.know(e,AI.belief.make(x,z,T,'noise',{conf:.7*(1-.4*q),sig:.6+1.6*q}));AI.investigate(e,x,z,1.2);}
  else{AI.poi(e,x,z,'noise');AI.investigate(e,x,z,1.2);}}}
function bossAI(e,dt,dist,dx,dz,ang){if(e.lex)return lexAI(e,dt,dist,dx,dz,ang);const enr=e.hp<=e.maxhp/2;e.aiming=dist>=1.3;e.react-=dt;let tvx=0,tvz=0;const d=dist||1;
 if(dist>3){tvx=dx/d*2.3;tvz=dz/d*2.3;}else if(dist<1.35&&e.cd<=0){e.cd=1.0;e.atkT=e.atkDur=0.25;sfx('punch');hurtPlayer([dx/d,dz/d],'boss');shake(0.5);}
 if(dist>=1.35&&e.react<=0&&e.cd<=0&&Math.abs(angDiff(e.a,ang))<0.3){e.weapon.ammo=99;fireGun(e,e.weapon,false);e.burst=(e.burst||0)+1;if(e.burst<(enr?8:5))e.cd=0.085;else{e.burst=0;e.cd=(enr?0.85:1.4)*Dd().ecd;}}
 if(enr&&!e.enraged){e.enraged=true;popup(e.x,e.z,'HE IS PISSED','#ff2a3a');sfx('boss');}return[tvx,tvz];}
function spot(e){if(e.boss&&!G.bossSeen){G.bossSeen=true;banner(bossName(),G.def.boss?(G.def.boss.intro||'Gold grenades. Keep moving and never stand still.'):'He takes a lot of hits. Keep moving, use cover.');sfx('boss');}
 if(e.state!=='chase'){e.alertT=0.9;sfx('alert');const b=e.bl;if(b)AI.callout(e,5,o=>{AI.know(o,AI.belief.make(b.x,b.z,b.t,'call'));AI.investigate(o,b.x,b.z,1);});}}
function visionHalfAngle(e){return e.state==='search'?1.3:Dd().cone+(e.wary?0.35:0);}
function updateEnemy(e,dt){const g=G,p=g.player,T=g.T||0;
 if(e.hitT>0)e.hitT-=dt;if(e.alertT>0)e.alertT-=dt;if(e.qT>0)e.qT-=dt;
 if(!e.alive){slideBody(e,dt);return;}
 if(e.down>0){e.down-=dt;if(e.fall!==undefined&&e.fall<1)e.fall=Math.min(1,e.fall+dt*5);e.vx*=Math.exp(-dt*5);e.vz*=Math.exp(-dt*5);moveChar(e,dt,false);if(e.down<=0){e.state='chase';e.react=0.6*Dd().react;e.seeT=0;e.a+=Math.PI;e.ga=e.a;}return;}
 e.cd-=dt;if(e.atkT>0)e.atkT-=dt;if(e.ga===undefined)e.ga=e.a;
 const wd=WD[e.weapon?e.weapon.type:'fists'];const dx=p.x-e.x,dz=p.z-e.z,dist=Math.hypot(dx,dz)||0.001,ang=Math.atan2(dx,dz);
 const chasing=e.state==='chase',look=chasing?e.ga:e.a,half=chasing?Math.max(visionHalfAngle(e),1.4):visionHalfAngle(e);
 let see=false;if(p.alive&&dist<(chasing?13:Dd().vision)){const cone=dist<1.6||Math.abs(angDiff(look,ang))<half;if(cone&&(typeof playerSeenBy==='function'?playerSeenBy(e):los(e.x,e.z,p.x,p.z)))see=true;}
 if(!see&&p.alive){const hear=(p.sprinting?3.2:1.4)*(Math.hypot(p.vx,p.vz)>0.6?1:0);if(dist<hear&&los(e.x,e.z,p.x,p.z)){AI.know(e,AI.belief.make(p.x,p.z,T,'step'));if(!chasing){AI.investigate(e,p.x,p.z,1);e.ta=ang;}}}
 if(!see&&e.bl&&(chasing||e.state==='search'))AI.track(e,dt);
 if(!see&&(e.state==='idle'||e.state==='patrol')){for(const o of g.enemies){if(o.alive||o.found||o===e)continue;const bx=o.x-e.x,bz=o.z-e.z,bd2=Math.hypot(bx,bz);if(bd2<Dd().vision*0.8&&Math.abs(angDiff(e.a,Math.atan2(bx,bz)))<Dd().cone&&los(e.x,e.z,o.x,o.z)){o.found=1;e.wary=1;AI.poi(e,o.x,o.z,'body');AI.investigate(e,o.x,o.z,1.4);popup(e.x,e.z,'BODY!','#ffd36b');sfx('alert');
  AI.callout(e,6,q=>{if(q.state==='chase')return;q.wary=1;AI.poi(q,o.x,o.z,'body');AI.investigate(q,o.x,o.z,1);});break;}}}
 if(see){const grace=e.bl&&e.bl.src==='see'&&T-e.bl.t<AI.GRACE;AI.know(e,AI.belief.make(p.x,p.z,T,'see',{vx:p.vx,vz:p.vz}));
  if(e.state!=='chase'){if(grace)e.react=0.15*Dd().react;else{spot(e);e.react=(wd.melee?0.2:rnd(0.5,0.75))*Dd().react*(e.rmul||1)*(1+0.15*pk('sense'));}e.state='chase';}
  e.lkx=p.x;e.lkz=p.z;e.seeT=0;}else e.seeT+=dt;
 if(!p.alive&&e.state==='chase'){e.state='idle';}
 e.aiming=false;let tvx=0,tvz=0,face=null,gaze=null;
 switch(e.state){
  case 'idle':e.turnT-=dt;if(e.turnT<=0){e.turnT=rnd(1.5,4);e.ta=e.a+rnd(-1.3,1.3);}face=e.ta;break;
  case 'patrol':if(e.pauseT>0){e.pauseT-=dt;break;}tvx=Math.sin(e.pa)*1.3;tvz=Math.cos(e.pa)*1.3;face=e.pa;break;
  case 'distract':{const c=e.cashT;if(!c||c.life<=0){e.state='patrol';break;}const ddx=c.x-e.x,ddz=c.z-e.z,dd=Math.hypot(ddx,ddz);face=Math.atan2(ddx,ddz);if(dd>0.8){tvx=ddx/dd*2.2;tvz=ddz/dd*2.2;}break;}
  case 'search':{const r=AI.search(e,dt,2.6);tvx=r.vx;tvz=r.vz;face=r.face;if(r.end&&!AI.hunt(e)){e.state=e.wary?'idle':'patrol';e.turnT=0;e.searchT=0;}break;}
  case 'chase':{
   if(!e.weapon){let bi=null,bd=4.5;for(const it of g.items){if(it.flying)continue;const d=Math.hypot(it.x-e.x,it.z-e.z);if(d<bd&&los(e.x,e.z,it.x,it.z)&&mClear(g,e.x,e.z,it.x,it.z)){bd=d;bi=it;}}
    if(bi&&(dist>2.5||!see)){const ddx=bi.x-e.x,ddz=bi.z-e.z;tvx=ddx/(bd||1)*3.2;tvz=ddz/(bd||1)*3.2;face=Math.atan2(ddx,ddz);if(bd<0.5){e.weapon={type:bi.type,ammo:99};g.items.splice(g.items.indexOf(bi),1);e.react=0.5;}break;}}
   // W7: aim at the exposed lean point when the body is behind the corner
   const ap=see&&typeof playerAimPoint==='function'?playerAimPoint(e):p,aang=ap===p?ang:Math.atan2(ap.x-e.x,ap.z-e.z);
   if(see){face=aang;gaze=aang;e.sb=null;e.blT=0;
    if(SET.diff!=='easy'&&!e.boss&&p.weapon&&!WD[p.weapon.type].melee&&dist<10&&!(e.dodgeT>0)&&Math.abs(angDiff(p.a,Math.atan2(-dx,-dz)))<0.09&&Math.random()<dt*(SET.diff==='hard'?1.6:0.7)){e.dodgeT=0.3;e.dodgeD=Math.random()<0.5?-1:1;const s=e.dodgeD*5.2/Math.max(dist,1e-3);e.dodX=dz*s;e.dodZ=-dx*s;}
    if(e.boss){const r=bossAI(e,dt,dist,dx,dz,aang);tvx=r[0];tvz=r[1];}
    else if(wd.melee){const sp=e.weapon?3.6:3.4;if(dist>0.85){tvx=dx/dist*sp;tvz=dz/dist*sp;const pg=p.weapon&&!WD[p.weapon.type].melee;if(pg&&dist>2.2){const zz=Math.sin(g.T*5+e.id*1.7)*0.85;tvx+=dz/dist*sp*zz;tvz-=dx/dist*sp*zz;}}if(dist<1.05&&e.wind<=0&&e.cd<=0){e.wind=0.28*Math.min(Dd().react,1.6);e.alertT=0.3;}}
    else{e.aiming=true;e.react-=dt;const want=e.pers==='rush'?3.2:e.pers==='careful'?6.5:4.8;
     if(dist>want+1.5){tvx=dx/dist*2.2;tvz=dz/dist*2.2;}else if(dist<want-1.5&&e.pers!=='rush'){tvx=-dx/dist*1.8;tvz=-dz/dist*1.8;}
     e.strT=(e.strT||0)-dt;if(e.strT<=0){e.strT=rnd(0.7,1.6);e.strD=Math.random()<0.5?-1:1;}if(SET.diff!=='easy'||e.pers==='rush'){const sv=e.pers==='careful'?1.1:1.5;tvx+=dz/dist*sv*e.strD;tvz-=dx/dist*sv*e.strD;}
     const lead=SET.diff==='hard'?0.9:SET.diff==='normal'?0.5:0;if(lead){const tt=dist/Dd().ebSpd;face=Math.atan2(ap.x-e.x+p.vx*tt*lead,ap.z-e.z+p.vz*tt*lead);}
     if(e.react<=0&&e.cd<=0&&Math.abs(angDiff(e.a,face))<0.22){e.weapon.ammo=99;fireGun(e,e.weapon,false);
      if(wd.burst){e.burst++;if(e.burst>=wd.burst){e.burst=0;e.cd=0.9;}}else if(wd.burst3){e.burst++;if(e.burst<3)e.cd=0.08;else{e.burst=0;e.cd=wd.ecd;}}}}}
   // Seen target only: the shared player field is honest while the player is in sight.
   if(see&&tvx*dx+tvz*dz>1e-6&&!mClear(g,e.x,e.z,p.x,p.z,Math.max(0,Math.min(e.r,p.r)-0.02))){
    const t=flowStep(g.flow,e,p.x,p.z),sp=(tvx*dx+tvz*dz)/dist;
    if(t){const tx=t[0]-e.x,tz=t[1]-e.z,d=Math.hypot(tx,tz)||1;tvx=tx/d*sp;tvz=tz/d*sp;if(wd.melee)face=Math.atan2(tx,tz);}else{tvx=tvz=0;}
   }
   if(!see){const b=e.bl,age=b?T-b.t:1e9,sp=wd.melee?3.2:2.6;
    e.blT=(e.blT||0)+dt;if(e.blT>.3)e.react=Math.max(e.react,b&&b.src==='see'&&age<AI.GRACE?0.15:0.35);
    if(!wd.melee&&e.pers==='careful'&&b&&b.src==='see'&&age<2.2){face=gaze=Math.atan2(b.x-e.x,b.z-e.z);e.aiming=age<1.2;e.react=Math.max(e.react,0.2);}
    else if(b&&age<AI.KEEP&&e.sb!==b){const q=AI.belief.goal(g,b),r=AI.seek(e,q[0],q[1],sp);
     if(r.done||r.stuck){e.sb=b;const h=Math.hypot(b.vx,b.vz)>.5?Math.atan2(b.vx,b.vz):e.a;
      if(e.boss){e.sx=q[0];e.sz=q[1];e.arr=1;e.searchT=0;e.srT=0;e.lookT=0;e.pb=null;e.lh=h;}else{e.state='search';AI.investigate(e,q[0],q[1],1,h);if(!wd.melee)AI.lurk(e);}}
     else{tvx=r.vx;tvz=r.vz;face=r.face;if(Math.hypot(q[0]-e.x,q[1]-e.z)>.3)gaze=Math.atan2(q[0]-e.x,q[1]-e.z);}}
    else if(!e.boss){e.state='search';AI.investigate(e,b&&age<AI.KEEP?b.x:e.x,b&&age<AI.KEEP?b.z:e.z,1,e.hd!==undefined?e.hd:e.a);if(!wd.melee)AI.lurk(e);}
    else{if(e.sb!==b||e.sx===undefined){e.sb=b;e.sx=e.x;e.sz=e.z;e.arr=1;e.searchT=0;e.srT=0;e.lookT=0;e.pb=null;e.lh=e.hd!==undefined?e.hd:e.a;}
     const r=AI.search(e,dt,3);if(r.end){e.sx=e.x;e.sz=e.z;e.srT=0;e.searchT=0;e.lookT=0;}else{tvx=r.vx;tvz=r.vz;face=r.face;}}}
  }break;}
 if(e.wind>0){e.wind-=dt;tvx*=0.3;tvz*=0.3;if(e.wind<=0){e.atkT=e.atkDur=0.2;e.jab=Math.random()<0.5;e.cd=0.8;sfx(wd.snd||'swing_fists',0.8);const d2=Math.hypot(p.x-e.x,p.z-e.z);
  if(p.alive&&d2<1.25&&Math.abs(angDiff(e.a,Math.atan2(p.x-e.x,p.z-e.z)))<1.1){sfx('hit_'+(e.weapon?e.weapon.type:'fists'));hurtPlayer([(p.x-e.x)/(d2||1),(p.z-e.z)/(d2||1)],e.weapon?e.weapon.type:'fists');}}}
 if(e.dodgeT>0){e.dodgeT-=dt;tvx=e.dodX||0;tvz=e.dodZ||0;}
 if(face!==null){const turn=e.state==='chase'?8:3;e.a+=clamp(angDiff(e.a,face),-turn*dt,turn*dt);}
 if(e.state==='chase'){const t=gaze!==null?gaze:e.a;e.ga+=clamp(angDiff(e.ga,t),-10*dt,10*dt);}else e.ga=e.a;
 tvx*=e.spd||1;tvz*=e.spd||1;const k=1-Math.exp(-dt*10);e.vx+=(tvx-e.vx)*k;e.vz+=(tvz-e.vz)*k;const moved=moveChar(e,dt,false);
 if(e.state==='patrol'&&e.pauseT<=0&&moved<1.3*dt*0.4){const opts=[0,Math.PI/2,Math.PI,-Math.PI/2].filter(a=>Math.abs(angDiff(a,e.pa))>0.1);e.pa=pick(opts);e.pauseT=rnd(0.3,1.2);}}
function separate(){const g=G,cs=[g.player,...g.enemies].filter(c=>c.alive&&!(c.down>0));
 for(let i=0;i<cs.length;i++)for(let j=i+1;j<cs.length;j++){const a=cs[i],b=cs[j],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz),m=a.r+b.r;if(d<m&&d>1e-4){const p=(m-d)/2,nx=dx/d,nz=dz/d;a.x-=nx*p;a.z-=nz*p;b.x+=nx*p;b.z+=nz*p;collideGrid(a);collideGrid(b);}}}
function lexAI(e,dt,dist,dx,dz,ang){const enr=e.hp<=e.maxhp/2;e.aiming=dist>=1.3;e.react-=dt;const d=dist||1;let tvx=0,tvz=0;
 if(dist>6.5){tvx=dx/d*2.2;tvz=dz/d*2.2;}else if(dist<3.2){tvx=-dx/d*1.9;tvz=-dz/d*1.9;}else{tvx=-dz/d*1.2;tvz=dx/d*1.2;}
 if(dist<1.35&&e.cd<=0){e.cd=1.0;e.atkT=e.atkDur=0.25;sfx('punch');hurtPlayer([dx/d,dz/d],'boss');shake(0.5);}
 else if(e.react<=0&&e.cd<=0&&dist<11&&los(e.x,e.z,G.player.x,G.player.z)){throwNade(e,'e',G.player.x+rnd(-0.7,0.7),G.player.z+rnd(-0.7,0.7));e.atkT=e.atkDur=0.3;e.cd=(enr?1.05:1.75)*Dd().ecd;if(Math.random()<0.25)popup(e.x,e.z,pick(['"Catch, pal!"','"Solid gold, baby!"','"This suit is linen!"','"You can\'t afford me!"']),'#ffa6c9');}
 if(enr&&!e.enraged){e.enraged=true;popup(e.x,e.z,'"MY SUIT! THIS IS LINEN!"','#ffa6c9');sfx('boss');}return[tvx,tvz];}
