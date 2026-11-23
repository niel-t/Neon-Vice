'use strict';
/* NEXT-OBJECTIVE GUIDE: once the guards on a floor (or on a stage of a multi-stage job) are down, the game points at where to go next:
   the car / elevator out, the stairs or elevator up to the next stage, or the job objective still left (charges to plant, wires to cut,
   the safe, the singer, Pesos, the kid). Three pieces share one target (guideTarget):
   - in the world: a pulsing ring on the floor with a light post and a spinning diamond over the spot (both renderers draw dynB boxes);
   - on the HUD: when the spot is on screen, a bobbing double chevron over it with a short label and the distance; when it is off screen,
     a fat arrow pinned to the edge of the screen in its direction, with the same label beside it;
   - on the radar: the marker sits on the target instead of always on the car.
   Spared Lex (lexFate()==='spared', g.tip) keeps his Act 3 favour: with his tip the guide shows the objective from the start, before
   the guards are down. Colours: pink = way out, cyan = stairs/elevator to the next stage, gold = objective. */
const GUIDE_COL={exit:'#ff3fa4',stage:'#2de2e6',obj:'#ffd36b',late:'#ff2a3a'};
const GUIDE_RGB={exit:[1,0.25,0.65],stage:[0.18,0.88,0.9],obj:[1,0.8,0.3],late:[1,0.16,0.22]};
function guideFoes(g){return g.enemies.some(e=>e.alive&&!e.spared&&!(e.boss&&g.clear&&g.clear.boss==='optional'));}
function guideNear(p,a){let b=null,d=1e9;for(const q of a){const k=Math.hypot(q.x-p.x,q.z-p.z);if(k<d){d=k;b=q;}}return b;}
/* the objective spot still to do, nearest first */
function guideObj(g){const p=g.player,o=g.obj,T=(q,lbl)=>q&&{x:q.x,z:q.z,k:'obj',lbl};if(!o||o.done)return null;
 if(g.boats)return T(guideNear(p,g.boats.filter(b=>!b.sunk&&!(b.fuse>0))),'PLANT A CHARGE');
 if(g.rigs)return T(guideNear(p,g.rigs.filter(r=>!r.cut)),'CUT THE WIRES');
 if(g.safe)return T(g.safe,'OPEN THE SAFE');
 if(g.singer)return T(g.singer,'TALK TO THE SINGER');
 if(g.pesos&&!g.pesos.found)return T(g.pesos,'FIND PESOS');
 if(g.kid)return T(g.kid,'REACH THE KID');
 return null;}
/* the stairs or elevator on to the next stage: never back down to a stage you came from while a new one is still ahead */
function guideStage(g){if(!g.stageManaged||!g.stageRun||stageFinal(g))return null;let st;try{st=g.stageRun.describe(g.sid).stairs;}catch(e){return null;}
 st=st.filter(s=>s.to!==g.sid&&!stageLocked(g,s));const fresh=st.filter(s=>!stageSeen(g,s.to));if(fresh.length)st=fresh;
 const s=guideNear(g.player,st.map(s=>({x:s.at[0],z:s.at[1],s})));if(!s)return null;
 return {x:s.x,z:s.z,k:'stage',lbl:s.s.id==='elev'?(isKade(g)?'TAKE THE HOIST':'TAKE THE ELEVATOR'):typeof A4_STAIR_LBL!=='undefined'&&A4_STAIR_LBL[s.s.id]||typeof a5StairLbl==='function'&&a5StairLbl(g,s.s)||'TAKE THE STAIRS'};}
function guideTarget(g){if(!g||!g.def||g.def.hub||g.done||!g.player||!g.player.alive||g.arrive||g.cameo||g.fin||g.mercy||g.climb||g.climbIn||g.twist==='rush')return null;
 if(g.gdT===g.T&&g.gdV!==undefined)return g.gdV;let t=typeof act4Guide==='function'&&(!g.cleared||g.jet)?act4Guide(g):null;if(!t&&typeof act5Guide==='function')t=act5Guide(g);
 if(t){}else if(g.cleared){if(!g.jet&&stageMayFinish(g)){const late=g.esc&&g.esc.late;t={x:g.car.x,z:g.car.z,k:late?'late':'exit',lbl:(g.def.noCar?(g.def.exit?'FREIGHT LIFT':'ELEVATOR DOWN'):boatArrival(g)?'BACK TO THE BOAT':'BACK TO THE CAR')};}}
 else{const foes=guideFoes(g);if(!foes||g.tip)t=guideObj(g);if(!t&&(!foes||g.keycard))t=guideStage(g);}
 g.gdT=g.T;g.gdV=t;if(t&&(!g.gdK||g.gdK!==t.k+t.lbl.slice(0,6))){g.gdK=t.k+t.lbl.slice(0,6);g.gdS=g.T;}return t;}
/* world marker: ring on the floor that breathes, a thin light post, and a spinning diamond on top */
function drawGuide3D(B,g){const t=guideTarget(g);if(!t)return;const c=GUIDE_RGB[t.k],T=g.T,k=0.5+0.5*Math.sin(T*5),r=0.55+k*0.18,w=0.06;
 for(let i=0;i<4;i++){const a=T*1.2+i*Math.PI/2;B.box(TRS(t.x+Math.sin(a)*r,0.035,t.z+Math.cos(a)*r,a,r*1.35,0.02,w),c,true);}
 B.box(TRS(t.x,0.03,t.z,0,0.18,0.015,0.18),c,true);B.box(TRS(t.x,1.0,t.z,0,0.04,2.0,0.04),c,true);
 const y=2.25+Math.sin(T*4)*0.12;B.box(A.mul(A.mul(A.T(t.x,y,t.z),A.RY(T*2.4)),A.mul(A.RX(0.785),A.S(0.28,0.28,0.28))),c,true);}
/* HUD: chevrons over the spot, or an edge arrow toward it */
function drawGuideHUD(c,g,u){const t=guideTarget(g);if(!t)return;const p=g.player,col=GUIDE_COL[t.k],dist=Math.round(Math.hypot(t.x-p.x,t.z-p.z)),age=g.T-(g.gdS||0);
 const pop=age<0.6?1+0.5*(1-age/0.6):1,pulse=0.75+0.25*Math.sin(g.T*6),lbl=t.lbl+'  '+dist+'m';
 const s=project(t.x,1.2,t.z);const mL=34*u,mR=34*u,mT=(touchMode?124:84)*u,mB=(touchMode?96:76)*u;
 const on=s&&s[0]>mL&&s[0]<vw-mR&&s[1]>(touchMode?60:30)*u&&s[1]<vh-mB;c.save();c.textBaseline='top';
 if(on){if(dist<1.6){c.restore();return;}const bob=Math.sin(g.T*5)*4*u,x=s[0],y=Math.max(22*u,s[1]-18*u+bob);c.globalAlpha=pulse;
  for(let i=0;i<2;i++){const yy=y+i*9*u,hw=(10-i*2)*u*pop;c.beginPath();c.moveTo(x-hw,yy);c.lineTo(x,yy+8*u);c.lineTo(x+hw,yy);c.lineTo(x+hw,yy+4*u);c.lineTo(x,yy+12*u);c.lineTo(x-hw,yy+4*u);c.closePath();c.fillStyle='#000';c.save();c.translate(1.5*u,1.5*u);c.fill();c.restore();c.fillStyle=col;c.fill();}
  c.globalAlpha=1;c.font=PXF(7*u);const tw=c.measureText(lbl).width;c.fillStyle='rgba(10,4,18,.82)';c.fillRect(x-tw/2-6*u,y-18*u,tw+12*u,15*u);c.fillStyle=col;c.fillRect(x-tw/2-6*u,y-4*u,tw+12*u,1.5*u);txt(c,lbl,x,y-14.5*u,'#fff','center',7*u);c.restore();return;}
 /* direction: from the screen centre toward the projected spot (or the world offset when it does not project) */
 const cx=vw/2,cy=vh/2;let dx,dy;if(s){dx=s[0]-cx;dy=s[1]-cy;}else{dx=t.x-p.x;dy=t.z-p.z;}const dl=Math.hypot(dx,dy)||1;dx/=dl;dy/=dl;
 const hw=vw/2-mL,hh=Math.min(cy-mT,vh-mB-cy),kk=Math.min(Math.abs(dx)>1e-4?hw/Math.abs(dx):1e9,Math.abs(dy)>1e-4?hh/Math.abs(dy):1e9),ax=cx+dx*kk,ay=cy+dy*kk,a=Math.atan2(dy,dx),sc=u*pop*(0.92+0.12*Math.sin(g.T*7));
 c.save();c.translate(ax,ay);c.rotate(a);c.beginPath();c.moveTo(16*sc,0);c.lineTo(-6*sc,-13*sc);c.lineTo(-2*sc,0);c.lineTo(-6*sc,13*sc);c.closePath();
 c.lineWidth=4*u;c.strokeStyle='#000';c.stroke();c.fillStyle=col;c.fill();c.beginPath();c.moveTo(-10*sc,-9*sc);c.lineTo(-4*sc,0);c.lineTo(-10*sc,9*sc);c.lineWidth=3*u;c.strokeStyle=col;c.globalAlpha=0.55;c.stroke();c.restore();
 /* label sits inside the arrow, clamped onto the screen */
 c.font=PXF(7*u);const tw=c.measureText(lbl).width,lx=clamp(ax-dx*(30*u+tw/2),tw/2+8*u,vw-tw/2-8*u),ly=clamp(ay-dy*30*u-7*u,8*u,vh-22*u);
 c.fillStyle='rgba(10,4,18,.82)';c.fillRect(lx-tw/2-6*u,ly-4*u,tw+12*u,15*u);c.fillStyle=col;c.fillRect(lx-tw/2-6*u,ly-4*u,2*u,15*u);txt(c,lbl,lx,ly-0.5*u,'#fff','center',7*u);c.restore();}
