'use strict';
// Player/enemy cover and stance. DOM/GL-free; gameplay wiring lives in index.html.
// Cover is an axis-aligned run of cover cells; the player hugs its face. Local frame: u is the
// normal axis (the cover lies toward +s), v is the tangent axis along the run.
const STANCE={stand:{eye:1.6,top:1.8},crouch:{eye:1.0,top:1.1,aim:0.7}};
const COVER_REACH=0.85,COVER_HIGH=1.6,COVER_GAP=0.02,COVER_EDGE=0.45,COVER_PEEK=0.22,COVER_POP=0.35,COVER_END=0.12;
/* legacy bullet-stopping furniture heights (metres): below COVER_HIGH you crouch behind it, else you lean */
const COVER_FURN_H={2:1.0,7:1.0,9:1.6,10:1.6,11:1.35,12:1.5,13:1.8,14:0.95,19:1.3,20:1.15,21:1.3,22:1.3};
/* legacy grid adapter: h = height of a bullet-stopping cell (0 = none), walk = open floor */
function coverGridQ(g){
 const inb=(cx,cz)=>cx>=0&&cz>=0&&cx<g.W&&cz<g.H;
 return{
  h(cx,cz){if(!inb(cx,cz))return 3;const i=cz*g.W+cx;if(g.solid[i]===1)return(g.wh[i]||WALL_H)>=0.6?3:0;return COVER[g.furn[i]]===1?(COVER_FURN_H[g.furn[i]]||1.2):0;},
  walk(cx,cz){if(!inb(cx,cz))return false;const i=cz*g.W+cx;return g.solid[i]!==1&&!(g.furn[i]>0);}};
}
function coverCell(q,ax,u,v){return ax==='x'?q.h(u,v):q.h(v,u);}
function coverWalk(q,ax,u,v){return ax==='x'?q.walk(u,v):q.walk(v,u);}
/* Find the cover face to hug from (x,z), preferring direction (dx,dz) when it is nonzero. */
function coverFind(q,x,z,r,dx,dz){
 const dl=Math.hypot(dx,dz),ux=dl>1e-6?dx/dl:0,uz=dl>1e-6?dz/dl:0;let best=null,bs=Infinity;
 for(const ax of ['x','z'])for(const s of [-1,1]){
  const u=ax==='x'?x:z,v=ax==='x'?z:x,cu0=Math.floor(u),cv=Math.floor(v),al=s*(ax==='x'?ux:uz);
  if(dl>1e-6&&al<0.35)continue;
  for(let k=1;k<=2;k++){const cu=cu0+s*k;
   if(coverCell(q,ax,cu,cv)>0){const face=s>0?cu:cu+1,gap=Math.abs(face-u)-r,sc=gap-al*0.8;if(gap<=COVER_REACH&&sc<bs){bs=sc;best={ax,s,cu,cv,face};}break;}
   if(!coverWalk(q,ax,cu,cv))break;}}
 if(!best)return null;
 const {ax,s,cu,cv}=best,run=c=>coverCell(q,ax,cu,c)>0&&coverWalk(q,ax,cu-s,c);
 let a=cv,b=cv;while(a>cv-16&&run(a-1))a--;while(b<cv+16&&run(b+1))b++;
 const open=c=>coverCell(q,ax,cu,c)===0&&coverWalk(q,ax,cu-s,c);
 return{ax,s,cu,face:best.face,lo:a,hi:b+1,openLo:open(a-1),openHi:open(b+1),u:best.face-s*(r+COVER_GAP),pop:0};
}
/* One frame in cover. (mx,mz) = desired move, (ax_,az_) = aim unit vector, fired = shot this frame.
   Returns null when the player leaves cover, else tangent input t, normal velocity vn, stance and eye. */
function coverStep(cv,q,x,z,mx,mz,ax_,az_,fired,dt){
 const X=cv.ax==='x',u=X?x:z,v=X?z:x,mn=X?mx:mz,mt=X?mz:mx,an=(X?ax_:az_)*cv.s,at=X?az_:ax_;
 const du=Math.abs(u-cv.u);if(-cv.s*mn>0.6||du>Math.max(0.3,(cv.du===undefined?du:cv.du)+0.05))return null;cv.du=Math.min(cv.du===undefined?du:cv.du,du);
 const vc=Math.min(cv.hi-COVER_END,Math.max(cv.lo+COVER_END,v)),h=coverCell(q,cv.ax,cv.cu,Math.floor(vc));if(!(h>0))return null;
 cv.pop=fired?COVER_POP:Math.max(0,cv.pop-dt);
 const high=h>=COVER_HIGH,side=cv.openHi&&cv.hi-vc<COVER_EDGE?1:cv.openLo&&vc-cv.lo<COVER_EDGE?-1:0;
 const lean=high&&side!==0&&at*side>-0.15&&(an>0.15||at*side>0.35)?side:0;
 const crouch=!high&&cv.pop<=0;
 const ev=lean?(lean>0?cv.hi:cv.lo)+lean*COVER_PEEK:vc,eu=lean?cv.u:u;
 const eye={x:X?eu:ev,z:X?ev:eu,y:crouch?STANCE.crouch.eye:STANCE.stand.eye};
 /* slide along the run, spring onto the face, stop at the run ends */
 let vt=mt;if((v<=cv.lo+COVER_END&&vt<0)||(v>=cv.hi-COVER_END&&vt>0))vt=0;
 const vn=Math.max(-4,Math.min(4,(cv.u-u)*10));
 return{kind:high?'high':'low',crouch,lean,eye,t:vt,vn,v:vc,spd:crouch?0.55:0.8};
}
/* W7b stance hooks. t is an actor with stance/eye (eye = lean point when leaning). */
const stanceOf=t=>t&&t.stance==='crouch'?'crouch':'stand';
/* WORLD.sight from a viewer eye to t's head; a crouched t hides behind chest panels (props never block sight, Q9) */
function stanceSight(st,ax,az,eyeA,t){const e=t.eye||t;return WORLD.sight(st,ax,az,e.x,e.z,eyeA,STANCE[stanceOf(t)].top);}
/* trace height for a shot at t: aimed low at a crouched target so its waist-high cover counts */
function coverShotY(muzzleY,t){return stanceOf(t)==='crouch'?Math.min(muzzleY,STANCE.crouch.aim):muzzleY;}
/* enemy e (eye at e.x/e.z) sees the player's eye. Legacy cell LOS today: no gameplay WORLD state exists until
   W1's mutation-sync checkpoint, after which this becomes stanceSight(st,e.x,e.z,STANCE[stanceOf(e)].eye,p). */
function playerSeenBy(e){const p=G.player,eye=p.eye||p;return WORLD.cell.los(G,e.x,e.z,eye.x,eye.z);}
/* a leaning player exposes the lean point: it is hittable, and enemies aim at it when the body is hidden from them */
const COVER_LEAN_R=0.2;
const leaning=p=>!!(p&&p.cs&&p.cs.lean&&p.eye);
function playerHitPoints(p){return leaning(p)?[p,{x:p.eye.x,z:p.eye.z,r:COVER_LEAN_R}]:[p];}
/* bullet line clear of walls and bullet-stopping furniture (los ignores furniture; a fridge must count) */
function coverShotClear(g,x0,z0,x1,z1){const dx=x1-x0,dz=z1-z0,n=Math.ceil(Math.hypot(dx,dz)/0.15);
 for(let i=1;i<n;i++){const t=i/n;if(WORLD.cell.rayBlock(g,Math.floor(x0+dx*t),Math.floor(z0+dz*t),true))return false;}return!WORLD.cell.doorHit(g,x0,z0,x1,z1);}
function playerAimPoint(e){const p=G.player;return leaning(p)&&!coverShotClear(G,e.x,e.z,p.x,p.z)?p.eye:p;}
