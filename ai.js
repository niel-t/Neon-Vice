'use strict';
// Enemy perception, knowledge and behaviour. Enemies act on beliefs built from sight, sound, callouts and hits;
// G.player is read directly only for the senses themselves (vision, proximity, footsteps) and while seen.
const AI=(()=>{
 const SRC={see:{conf:1,sig:.3},step:{conf:.8,sig:.8},noise:{conf:.7,sig:1.5},call:{conf:.75,sig:1.2},hit:{conf:.6,sig:3}};
 const TAU_C=4,SIG_RATE=2.5,SIG_MAX=8,PRED_MAX=1,GRACE=3,KEEP=6,WALL_COST=6,DOOR_COST=3;
 const belief={
  make(x,z,t,src,o){o=o||{};const s=SRC[src];return{x,z,vx:o.vx||0,vz:o.vz||0,t,src,conf:o.conf!==undefined?o.conf:s.conf,sig:o.sig!==undefined?o.sig:s.sig};},
  age:(b,T)=>Math.max(0,T-b.t),
  conf:(b,T)=>b.conf*Math.exp(-belief.age(b,T)/TAU_C),
  sig:(b,T)=>Math.min(SIG_MAX,b.sig+SIG_RATE*belief.age(b,T)),
  predict(b,T){const a=Math.min(belief.age(b,T),PRED_MAX);return[b.x+b.vx*a,b.z+b.vz*a];},
  accept:(old,nb,T)=>!old||nb.src==='see'||belief.conf(nb,T)>=belief.conf(old,T),
  // Movement goal: computed once per belief, prediction clamped to 1 s and to a clear straight line.
  goal(g,b){if(b.gx===undefined){const p=belief.predict(b,b.t+PRED_MAX);const ok=(b.vx||b.vz)&&WORLD.cell.moveClear(g,b.x,b.z,p[0],p[1]);b.gx=ok?p[0]:b.x;b.gz=ok?p[1]:b.z;}return[b.gx,b.gz];}
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
 const nav={BUDGET:4,MAX:32,g:null,cache:new Map(),queue:[],T:NaN,budget:0,built:0,
  key(g,x,z){const cx=Math.floor(x),cz=Math.floor(z);if(!WORLD.cell.isBlock(g,cx,cz))return cz*g.W+cx;
   for(const [ox,oz] of NB){if(!WORLD.cell.isBlock(g,cx+ox,cz+oz))return(cz+oz)*g.W+cx+ox;}return -1;},
  build(g,k){let c=nav.cache.get(k);if(!c){if(nav.cache.size>=nav.MAX){let ok=null,ou=Infinity;for(const [kk,v] of nav.cache)if(v.used<ou){ou=v.used;ok=kk;}c=nav.cache.get(ok);nav.cache.delete(ok);}
    else c={f:new Int16Array(g.W*g.H)};nav.cache.set(k,c);}
   WORLD.cell.bfs(g,c.f,k%g.W,(k/g.W)|0);c.ver=g.navVer|0;c.used=nav.T;nav.budget--;nav.built++;return c.f;},
  frame(g){const T=g.T||0;if(nav.g!==g){nav.g=g;nav.cache.clear();nav.queue.length=0;}if(T===nav.T)return;nav.T=T;nav.budget=nav.BUDGET;
   while(nav.budget>0&&nav.queue.length){const k=nav.queue.shift(),c=nav.cache.get(k);if(!c||c.ver!==(g.navVer|0))nav.build(g,k);}},
  // Int16Array field (fresh or awaiting rebuild), null while waiting for budget, false if no free cell near the target.
  field(g,x,z){nav.frame(g);const k=nav.key(g,x,z);if(k<0)return false;const c=nav.cache.get(k);
   if(c&&c.ver===(g.navVer|0)){c.used=nav.T;return c.f;}
   if(nav.budget>0)return nav.build(g,k);if(!nav.queue.includes(k))nav.queue.push(k);return c?c.f:null;}
 };
 const noises=[];let nzT=NaN,nzF=[];
 function know(e,b){if(belief.accept(e.bl,b,G.T||0))e.bl=b;}
 function poi(e,x,z,src){e.poi={x,z,t:G.T||0,src};}
 function investigate(e,x,z,qT,lh){if(e.state==='chase')return;e.state='search';e.sx=x;e.sz=z;e.searchT=0;e.srT=0;e.arr=0;e.pb=null;e.qT=qT;
  e.lh=lh!==undefined?lh:Math.atan2(x-e.x,z-e.z);}
 function callout(e,r,fn){const g=G,ls=g.enemies.filter(q=>q!==e&&q.alive&&!(q.down>0)&&Math.hypot(q.x-e.x,q.z-e.z)<r);if(!ls.length)return 0;
  const a=hear(g,e.x,e.z,r*1.3);let n=0;for(const q of ls)if(costAt(a,q.x,q.z)<=r*1.3){fn(q);n++;}return n;}
 function hurt(e,dir){const l=Math.hypot(dir[0],dir[1]);if(!e.alive||!(l>1e-6))return;const ux=dir[0]/l,uz=dir[1]/l;e.hd=Math.atan2(-ux,-uz);know(e,belief.make(e.x-ux*3,e.z-uz*3,G.T||0,'hit'));}
 function witness(e){const g=G;for(const q of g.enemies){if(q.alive&&q!==e&&!(q.down>0)&&q.state!=='chase'&&Math.hypot(q.x-e.x,q.z-e.z)<4&&los(q.x,q.z,e.x,e.z)){q.wary=1;e.found=1;poi(q,e.x,e.z,'body');investigate(q,e.x,e.z,1.2);}}}
 function seek(e,tx,tz,sp){const g=G,dx=tx-e.x,dz=tz-e.z,d=Math.hypot(dx,dz);if(d<.6)return{vx:0,vz:0,face:null,done:true};
  let px=tx,pz=tz;
  if(!WORLD.cell.moveClear(g,e.x,e.z,tx,tz,Math.max(0,e.r-.02))){const f=nav.field(g,tx,tz);
   if(f===null)return{vx:0,vz:0,face:Math.atan2(dx,dz)};
   const cx=Math.floor(e.x),cz=Math.floor(e.z),v=f?f[cz*g.W+cx]:-1;if(v<0)return{vx:0,vz:0,face:null,stuck:true};if(v===0)return{vx:0,vz:0,face:null,done:true};
   const t=flowStep(f,e,tx,tz);px=t[0];pz=t[1];}
  const ddx=px-e.x,ddz=pz-e.z,l=Math.hypot(ddx,ddz)||1;return{vx:ddx/l*sp,vz:ddz/l*sp,face:Math.atan2(ddx,ddz)};}
 function probe(e){const g=G,s=e.bl?Math.min(4,Math.max(1.5,belief.sig(e.bl,g.T||0))):2.5,h=e.lh!==undefined?e.lh:e.a;
  for(let k=0;k<6;k++){const a=h+(rand(e)-.5)*2.6,d=s*(.5+.5*rand(e)),x=e.sx+Math.sin(a)*d,z=e.sz+Math.cos(a)*d;
   if(WORLD.cell.isBlock(g,Math.floor(x),Math.floor(z)))continue;
   if(Math.abs(angDiff(e.a,Math.atan2(x-e.x,z-e.z)))<visionHalfAngle(e)&&los(e.x,e.z,x,z))continue;
   return[x,z];}
  return null;}
 // Sweep around (e.sx,e.sz): walk there, then alternate looking around with probes biased to the last heading.
 function search(e,dt,sp){const lim=e.wary?6:3.5;e.srT=(e.srT||0)+dt;if(e.srT>lim+10)return{vx:0,vz:0,face:null,end:true};
  if(!e.arr){const r=seek(e,e.sx,e.sz,sp);if(!r.done&&!r.stuck)return r;e.arr=1;e.searchT=0;e.lookT=.6;}
  e.searchT+=dt;if(e.searchT>lim)return{vx:0,vz:0,face:null,end:true};
  if(e.pb){e.pbT-=dt;const r=seek(e,e.pb[0],e.pb[1],sp*.8);if(!r.done&&!r.stuck&&e.pbT>0)return r;e.pb=null;e.lookT=1;}
  e.lookT-=dt;if(e.lookT<=0){e.pb=probe(e);e.pbT=2.5;e.lookT=1;}
  return{vx:0,vz:0,face:e.a+dt*3};}
 function noiseDup(x,z,r,src){const T=G.T||0;if(T!==nzT){nzT=T;nzF.length=0;}
  if(nzF.some(n=>n.src===src&&n.r>=r&&Math.hypot(n.x-x,n.z-z)<.75))return true;nzF.push({x,z,r,src});
  noises.push({x,z,r,t:T});if(noises.length>16)noises.shift();return false;}
 return{SRC,belief,rng,rand,hear,costAt,nav,noises,know,poi,investigate,callout,hurt,witness,seek,search,probe,noiseDup,GRACE,KEEP,
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
function spot(e){if(e.boss&&!G.bossSeen){G.bossSeen=true;banner(bossName(),G.def.boss?'Gold grenades. Keep moving and never stand still.':'He takes a lot of hits. Keep moving, use cover.');sfx('boss');}
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
  case 'search':{const r=AI.search(e,dt,2.6);tvx=r.vx;tvz=r.vz;face=r.face;if(r.end){e.state=e.wary?'idle':'patrol';e.turnT=0;e.searchT=0;}break;}
  case 'chase':{
   if(!e.weapon){let bi=null,bd=4.5;for(const it of g.items){if(it.flying)continue;const d=Math.hypot(it.x-e.x,it.z-e.z);if(d<bd&&los(e.x,e.z,it.x,it.z)&&WORLD.cell.moveClear(g,e.x,e.z,it.x,it.z)){bd=d;bi=it;}}
    if(bi&&(dist>2.5||!see)){const ddx=bi.x-e.x,ddz=bi.z-e.z;tvx=ddx/(bd||1)*3.2;tvz=ddz/(bd||1)*3.2;face=Math.atan2(ddx,ddz);if(bd<0.5){e.weapon={type:bi.type,ammo:99};g.items.splice(g.items.indexOf(bi),1);e.react=0.5;}break;}}
   if(see){face=ang;gaze=ang;e.sb=null;
    if(SET.diff!=='easy'&&!e.boss&&p.weapon&&!WD[p.weapon.type].melee&&dist<10&&!(e.dodgeT>0)&&Math.abs(angDiff(p.a,Math.atan2(-dx,-dz)))<0.09&&Math.random()<dt*(SET.diff==='hard'?1.6:0.7)){e.dodgeT=0.3;e.dodgeD=Math.random()<0.5?-1:1;const s=e.dodgeD*5.2/Math.max(dist,1e-3);e.dodX=dz*s;e.dodZ=-dx*s;}
    if(e.boss){const r=bossAI(e,dt,dist,dx,dz,ang);tvx=r[0];tvz=r[1];}
    else if(wd.melee){const sp=e.weapon?3.6:3.4;if(dist>0.85){tvx=dx/dist*sp;tvz=dz/dist*sp;const pg=p.weapon&&!WD[p.weapon.type].melee;if(pg&&dist>2.2){const zz=Math.sin(g.T*5+e.id*1.7)*0.85;tvx+=dz/dist*sp*zz;tvz-=dx/dist*sp*zz;}}if(dist<1.05&&e.wind<=0&&e.cd<=0){e.wind=0.28*Math.min(Dd().react,1.6);e.alertT=0.3;}}
    else{e.aiming=true;e.react-=dt;const want=e.pers==='rush'?3.2:e.pers==='careful'?6.5:4.8;
     if(dist>want+1.5){tvx=dx/dist*2.2;tvz=dz/dist*2.2;}else if(dist<want-1.5&&e.pers!=='rush'){tvx=-dx/dist*1.8;tvz=-dz/dist*1.8;}
     e.strT=(e.strT||0)-dt;if(e.strT<=0){e.strT=rnd(0.7,1.6);e.strD=Math.random()<0.5?-1:1;}if(SET.diff!=='easy'||e.pers==='rush'){const sv=e.pers==='careful'?1.1:1.5;tvx+=dz/dist*sv*e.strD;tvz-=dx/dist*sv*e.strD;}
     const lead=SET.diff==='hard'?0.9:SET.diff==='normal'?0.5:0;if(lead){const tt=dist/Dd().ebSpd;face=Math.atan2(dx+p.vx*tt*lead,dz+p.vz*tt*lead);}
     if(e.react<=0&&e.cd<=0&&Math.abs(angDiff(e.a,face))<0.22){e.weapon.ammo=99;fireGun(e,e.weapon,false);
      if(wd.burst){e.burst++;if(e.burst>=wd.burst){e.burst=0;e.cd=0.9;}}else if(wd.burst3){e.burst++;if(e.burst<3)e.cd=0.08;else{e.burst=0;e.cd=wd.ecd;}}}}}
   // Seen target only: the shared player field is honest while the player is in sight.
   if(see&&tvx*dx+tvz*dz>1e-6&&!WORLD.cell.moveClear(g,e.x,e.z,p.x,p.z,Math.max(0,Math.min(e.r,p.r)-0.02))){
    const t=flowStep(g.flow,e,p.x,p.z),sp=(tvx*dx+tvz*dz)/dist;
    if(t){const tx=t[0]-e.x,tz=t[1]-e.z,d=Math.hypot(tx,tz)||1;tvx=tx/d*sp;tvz=tz/d*sp;if(wd.melee)face=Math.atan2(tx,tz);}else{tvx=tvz=0;}
   }
   if(!see){const b=e.bl,age=b?T-b.t:1e9,sp=wd.melee?3.2:2.6;
    e.react=Math.max(e.react,b&&b.src==='see'&&age<AI.GRACE?0.15:0.35);
    if(!wd.melee&&e.pers==='careful'&&b&&b.src==='see'&&age<2.2){face=gaze=Math.atan2(b.x-e.x,b.z-e.z);e.aiming=age<1.2;e.react=Math.max(e.react,0.2);}
    else if(b&&age<AI.KEEP&&e.sb!==b){const q=AI.belief.goal(g,b),r=AI.seek(e,q[0],q[1],sp);
     if(r.done||r.stuck){e.sb=b;const h=Math.hypot(b.vx,b.vz)>.5?Math.atan2(b.vx,b.vz):e.a;
      if(e.boss){e.sx=q[0];e.sz=q[1];e.arr=1;e.searchT=0;e.srT=0;e.lookT=0;e.pb=null;e.lh=h;}else{e.state='search';AI.investigate(e,q[0],q[1],1,h);}}
     else{tvx=r.vx;tvz=r.vz;face=r.face;if(Math.hypot(q[0]-e.x,q[1]-e.z)>.3)gaze=Math.atan2(q[0]-e.x,q[1]-e.z);}}
    else if(!e.boss){e.state='search';AI.investigate(e,b&&age<AI.KEEP?b.x:e.x,b&&age<AI.KEEP?b.z:e.z,1,e.hd!==undefined?e.hd:e.a);}
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
