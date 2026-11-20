'use strict';
/* ================= DRIVING: car physics, and driving yourself to an Empire job =================
   CAR PHYSICS (carInput / carStep): the car keeps a real velocity, not just a speed along its nose. Steering turns the nose; the tyres
   then pull the velocity round to it as fast as their grip allows. Grip is high when you drive clean, drops when the tail is already
   sliding, and nearly goes when you pull the HANDBRAKE (Space, pad B, or hold a second thumb on the right of the screen): the tail comes
   round and you drift. Steering is quick at low speed and calmer at high speed, the brakes are strong, coasting rolls on. Sliding and
   hard braking leave rubber on the road, puff tyre smoke and squeal; hitting a wall bounces you off it instead of stopping dead.
   THE DRIVE (cruise hub): picking a place on the Empire map no longer plays a travel card. You get a few blocks of Miami (cruiseDef,
   laid out from the place's name so the same place always has the same streets): grid roads with traffic both ways, sidewalks, lamps,
   parks, parking lots, low and tall blocks. Your destination glows at the kerb under a neon sign with its name; an arrow at the screen
   edge points to it. Pull up next to it and the job starts. SKIP THE DRIVE (Tab / pad Y / the button) goes straight there. */
const CAR_PHYS={acc:9.5,turboAcc:13.5,brake:18,rev:7,maxV:13.5,turboV:19,drag:0.9,steer:2.7,grip:9,slideGrip:2.6,hbGrip:0.75};
/* the driver's hands: throttle -0.7..1, steer -1..1, handbrake, turbo */
function carInput(c){let thr=0,st=0,turbo=false,hand=false;
 if(keys.KeyW||keys.ArrowUp)thr=1;if(keys.KeyS||keys.ArrowDown)thr=-0.7;if(keys.KeyA||keys.ArrowLeft)st+=1;if(keys.KeyD||keys.ArrowRight)st-=1;if(keys.Space)hand=true;
 let sx=0,sz=0,mag=0;if(sticks.L){const v=stickVec(sticks.L);sx=v[0];sz=v[1];mag=Math.hypot(sx,sz);if(Math.hypot(sticks.L.x-sticks.L.ox,sticks.L.y-sticks.L.oy)>68)turbo=true;}
 if(sticks.R)hand=true;
 if(padMode&&PAD.on){sx+=PAD.lx;sz+=PAD.ly;mag=Math.min(1,Math.hypot(sx,sz));if(PAD.b[4]||PAD.b[10])turbo=true;if(PAD.b[7])thr=Math.max(thr,PAD.rt);if(PAD.b[6])thr=-0.7;if(PAD.b[1])hand=true;}
 if(mag>0.25){const ht=Math.atan2(sx,sz),df=angDiff(c.h,ht);st=clamp(df*2.2,-1,1);if(thr===0)thr=mag*(Math.cos(df)>-0.5?1:0.4);}
 if(keys.ShiftLeft||keys.ShiftRight)turbo=true;return {thr,st,hand,turbo};}
/* one step of the car: speed, heading, grip, wall bounces and the marks it leaves. Returns true when it hit something hard. */
function carStep(g,c,inp,dt){const P=CAR_PHYS,cx=myProg().carx||{},pf=carPerf(myCar()),eng=(cx.eng?1.18:1)*pf.spd,ea=(cx.eng?1.18:1)*pf.acc,tb=cx.turbo?1:0;
 if(!Number.isFinite(c.vx)||!Number.isFinite(c.vz)||(!c.vx&&!c.vz&&c.v)){c.vx=Math.sin(c.h)*c.v;c.vz=Math.cos(c.h)*c.v;}
 const turbo=inp.turbo&&inp.thr>0&&c.boost>0.02;if(turbo)c.boost=Math.max(0,c.boost-dt*(tb?0.22:0.35));else c.boost=Math.min(1,(c.boost||0)+dt*(tb?0.26:0.18));
 /* steer from the speed along the nose: quick when slow, calmer when fast; the handbrake swings the tail */
 let fx=Math.sin(c.h),fz=Math.cos(c.h);const vf0=c.vx*fx+c.vz*fz,sp=Math.abs(vf0);
 let yaw=inp.st*P.steer*clamp(sp/3,0,1)/(1+sp*0.04)*(vf0<-0.2?-1:1);if(inp.hand&&sp>3.5)yaw*=1.7;
 c.h+=yaw*dt;fx=Math.sin(c.h);fz=Math.cos(c.h);const rx=Math.cos(c.h),rz=-Math.sin(c.h);
 let vf=c.vx*fx+c.vz*fz,vr=c.vx*rx+c.vz*rz;
 const maxV=turbo?P.turboV*eng+tb*3:P.maxV*eng;
 if(inp.thr>0){if(vf<-0.3)vf=Math.min(0,vf+P.brake*dt);else if(vf<maxV)vf=Math.min(maxV,vf+inp.thr*(turbo?P.turboAcc+tb*3:P.acc)*ea*dt);}
 else if(inp.thr<0){if(vf>0.3){vf=Math.max(0,vf-P.brake*(-inp.thr/0.7)*dt);c.braking=vf>5;}else vf=Math.max(-5,vf+inp.thr*P.rev*dt);}
 else vf*=Math.exp(-dt*P.drag);
 if(inp.thr>=0)c.braking=false;if(vf>maxV)vf+=(maxV-vf)*(1-Math.exp(-dt*2));
 if(inp.hand){vf*=Math.exp(-dt*1.4);}
 /* the tyres pull the slide back in line with the nose: strong when clean, weak once sliding, almost nothing on the handbrake */
 const sliding=Math.abs(vr)>3.2,grip=inp.hand?P.hbGrip:sliding?P.slideGrip*pf.grip:P.grip*pf.grip;vr*=Math.exp(-grip*dt);
 c.vx=fx*vf+rx*vr;c.vz=fz*vf+rz*vr;c.v=vf;c.slip=Math.abs(vr);c.yaw=yaw;c.wr=(c.wr||0)-vf*dt/0.25;c.hand=inp.hand;
 /* move and bounce off walls */
 const ox=c.x,oz=c.z;c.x+=c.vx*dt;c.z+=c.vz*dt;const hit={x:c.x,z:c.z,r:c.r};collideGrid(hit);
 const s=vf<0?-1:1,fpx=c.x+fx*0.95*s,fpz=c.z+fz*0.95*s,nose=isBlock(Math.floor(fpx),Math.floor(fpz));let hard=false;
 if(Math.hypot(hit.x-c.x,hit.z-c.z)>1e-3||nose){let nx=hit.x-c.x,nz=hit.z-c.z,nl=Math.hypot(nx,nz);if(nl<1e-4){nx=-fx*s;nz=-fz*s;nl=1;}nx/=nl;nz/=nl;
  c.x=hit.x;c.z=hit.z;if(nose){c.x=ox;c.z=oz;}const vn=c.vx*nx+c.vz*nz;
  if(vn<0){c.vx-=1.35*vn*nx;c.vz-=1.35*vn*nz;c.vx*=0.8;c.vz*=0.8;if(-vn>4){hard=true;sfx('crash');shake(Math.min(0.5,-vn*0.04));rumble(0.7,0.7,200);sparks(c.x-nx*0.9,0.3,c.z-nz*0.9);}}
  c.v=c.vx*fx+c.vz*fz;}
 if(carWalls(c))hard=true;
 /* rubber, smoke and the squeal */
 const mark=(c.slip>2.4&&Math.hypot(c.vx,c.vz)>3.5)||c.braking;c.markT=(c.markT||0)+dt;
 if(mark&&c.markT>0.035){c.markT=0;for(const o of [-0.36,0.36])addFloorDecal(c.x-fx*0.72+rx*o,c.z-fz*0.72+rz*o,0.2,c.h,10,[0.04,0.04,0.05]);}
 if((c.slip>3.6||c.braking&&sp>9)&&Math.random()<dt*28)g.parts.push({t:'c',x:c.x-fx*0.8+rnd(-0.3,0.3),y:0.18,z:c.z-fz*0.8+rnd(-0.3,0.3),vx:rnd(-0.6,0.6),vy:rnd(0.4,1),vz:rnd(-0.6,0.6),s:0.12,c:[0.78,0.76,0.82],life:0.7});
 if(turbo&&Math.random()<dt*25)g.parts.push({t:'c',x:c.x-fx*1.2,y:0.3,z:c.z-fz*1.2,vx:-fx*2+rnd(-0.5,0.5),vy:rnd(0,0.5),vz:-fz*2+rnd(-0.5,0.5),s:0.06,c:[1,0.4,0.9],life:0.3});
 carSqueal(mark?Math.min(1,(c.slip-1.5)/4+(c.braking?0.4:0)):0);g.turbo=turbo;
 const p=g.player;if(p){p.x=c.x;p.z=c.z;p.vx=c.vx;p.vz=c.vz;p.a=c.h;}return hard;}
/* tyre squeal: filtered noise whose level follows the slide */
let SQL=null;
function carSqueal(k){if(!AC||contextLost||!SET.sound||AC.state!=='running'){return;}
 if(!SQL){if(!(k>0.05))return;try{const n=AC.createBufferSource(),b=AC.createBuffer(1,AC.sampleRate,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;n.buffer=b;n.loop=true;
  const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=2300;f.Q.value=9;const gn=AC.createGain();gn.gain.value=0;n.connect(f);f.connect(gn);gn.connect(AC.destination);n.start();SQL={n,f,gn};}catch(e){SQL=false;return;}}
 if(!SQL)return;SQL.gn.gain.setTargetAtTime(Math.max(0,k)*0.09,AC.currentTime,0.05);SQL.f.frequency.setTargetAtTime(2000+Math.max(0,k)*900+Math.random()*120,AC.currentTime,0.08);}

/* ---- the drive to an Empire job ---- */
let CRUISE=null;
const CRUISE_H=[5,21,37],CRUISE_V=[4,24,46,68],CRUISE_W=76,CRUISE_HT=46;
function cruiseRng(s){let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return ()=>((h=Math.imul(h^(h>>>15),0x2c1b3c6d)+0x6d2b79f5>>>0)/4294967296);}
/* a few blocks of Miami for one trip, the same streets every time for the same place */
function cruiseDef(key,name,area){const R=cruiseRng('cruise|'+key),W=CRUISE_W,H=CRUISE_HT,m=[];for(let z=0;z<H;z++)m.push(new Array(W).fill('b'));
 const set=(x,z,c)=>{if(x>=0&&z>=0&&x<W&&z<H)m[z][x]=c;},get=(x,z)=>x>=0&&z>=0&&x<W&&z<H?m[z][x]:'b';
 const roadH=z=>CRUISE_H.some(z0=>z>=z0&&z<z0+4),roadV=x=>CRUISE_V.some(x0=>x>=x0&&x<x0+4);
 /* blocks: the camera looks north, so the strip of each block that borders the road to its north stays open (a plaza, a lawn with
    palms or a parking strip) and the buildings stand behind it, facing the road to their south. Some blocks are all park or parking. */
 const bandsZ=[[1,3],[10,19],[26,35],[42,44]],bandsX=[[1,2],[9,22],[29,44],[51,66],[73,74]];
 for(const [z0,z1] of bandsZ)for(const [x0,x1] of bandsX){const k=R(),big=x1-x0>=8&&z1-z0>=6,open=big?z0+3:z0-1,kind=R();
  for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){
   if(big&&k<0.16)m[z][x]=(x*7+z*3)%6===0&&x>x0&&x<x1&&z>z0&&z<z1?'H':'y';
   else if(big&&k<0.3)m[z][x]='.';
   else if(z<=open)m[z][x]=kind<0.4?((x+z*2)%5===0&&z===z0+1?'H':'y'):kind<0.75?'.':'s';
   else m[z][x]='b';}
  if(big)for(let z=z0+1;z<=(k>=0.16&&k<0.3?z1-1:open);z+=3)for(let x=x0+1;x+1<x1;x+=3)if(m[z][x]==='.'&&R()<0.7){m[z][x]='q';m[z][x+1]='Q';}}
 /* sidewalks, then the roads over them */
 for(const z0 of CRUISE_H)for(let x=0;x<W;x++){set(x,z0-1,'s');set(x,z0+4,'s');}
 for(const x0 of CRUISE_V)for(let z=0;z<H;z++){if(get(x0-1,z)!=='=')set(x0-1,z,'s');if(get(x0+4,z)!=='=')set(x0+4,z,'s');}
 for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(roadH(z)||roadV(x))m[z][x]='=';
 for(let x=0;x<W;x++){set(x,0,'b');set(x,H-1,'b');}for(let z=0;z<H;z++){set(0,z,'b');set(W-1,z,'b');}
 /* lamps along the sidewalks */
 for(const z0 of CRUISE_H)for(let x=6;x<W-2;x+=11)for(const z of [z0-1,z0+4])if(get(x,z)==='s')set(x,z,'l');
 /* you start on the first avenue heading east; the place is on a far kerb */
 const sx=11,sz=CRUISE_H[0]+3;set(sx,sz,'P');
 const cand=[];for(const z0 of CRUISE_H.slice(1))for(const [x0,x1] of bandsX.slice(1,4))for(let x=x0+2;x<=x1-2;x++)if(get(x,z0-1)==='s'&&Math.hypot(x-sx,z0-sz)>30)cand.push([x,z0-1,get(x,z0-2)==='b'&&get(x-2,z0-2)==='b'&&get(x+2,z0-2)==='b']);
 const good=cand.filter(q=>q[2]),pool=good.length?good:cand;
 const [dx,dz]=pool[Math.floor(R()*pool.length)%pool.length];set(dx,dz,'C');
 return {name:name,hub:'cruise',cruise:true,wall:33,floor:7,sofa:0xffffff,track:'c_palms',where:'MIAMI · '+(area||'ON THE ROAD'),obj:'DRIVE TO '+name,
  legend:{'b':{w:33,h:'rand',tint:1,top:34},'s':{f:37},'l':{f:37,lamp:1},'y':{f:38},'H':{f:38,furn:8},'.':{f:7},'q':{f:7,furn:21},'Q':{f:7,furn:22}},
  map:m.map(r=>r.join(''))};}
/* from the Empire map: drive there yourself */
function cruiseGo(id,name,sub,area){if(fading)return false;CRUISE={id,name,sub,area,t:0};HUBS.cruise=cruiseDef(id,name,area);
 return fadeTo(()=>{loadHub('cruise','cruise');});}
const CRUISE_COLS=[[0.2,0.35,0.8],[0.9,0.9,0.86],[0.15,0.15,0.17],[0.25,0.65,0.65],[0.95,0.75,0.2],[0.7,0.2,0.8],[0.8,0.2,0.2],[0.3,0.6,0.3]];
/* hubModeSetup for HUBMODE 'cruise': your car on the avenue, traffic both ways on every road, the markings and the sign at the place */
function cruiseSetup(g){const p=g.player,R=cruiseRng('traffic|'+(CRUISE&&CRUISE.id));const c=g.pcar={x:p.x,z:p.z,h:Math.PI/2,v:0,vx:0,vz:0,boost:1,r:0.62,slip:0};
 g.dest={x:g.car.x,z:g.car.z+1.6,sx:g.car.x,sz:g.car.z};g.traffic=[];
 for(const z0 of CRUISE_H){const zw=z0+1;for(const [lz,dir] of [[zw+1,-1],[zw+3,1]])for(let i=0;i<5;i++)g.traffic.push({ax:'x',x:3+i*(g.W-6)/5+R()*6,z:lz,dir,sp:5+R()*2.5,col:CRUISE_COLS[Math.floor(R()*8)],slow:0});}
 for(const x0 of CRUISE_V){const xw=x0+1;for(const [lx,dir] of [[xw+1,1],[xw+3,-1]])for(let i=0;i<3;i++)g.traffic.push({ax:'z',x:lx,z:3+i*(g.H-6)/3+R()*5,dir,sp:4.5+R()*2,col:CRUISE_COLS[Math.floor(R()*8)],slow:0});}
 g.traffic=g.traffic.filter(t=>Math.hypot(t.x-c.x,t.z-c.z)>5);
 roadPortals(g,CRUISE_H.map(z0=>({ax:'x',a:z0+1,b:z0+5})).concat(CRUISE_V.map(x0=>({ax:'z',a:x0+1,b:x0+5}))));
 const onRoadH=z=>CRUISE_H.some(z0=>z>=z0+1&&z<z0+5),onRoadV=x=>CRUISE_V.some(x0=>x>=x0+1&&x<x0+5);
 for(const z0 of CRUISE_H)for(let x=1;x<g.W-1;x++){if(onRoadV(x))continue;g.deco.push({t:'cline',x,z:z0+3});if(x%2===0){g.deco.push({t:'lane',x,z:z0+2});g.deco.push({t:'lane',x,z:z0+4});}}
 for(const x0 of CRUISE_V)for(let z=1;z<g.H-1;z++){if(onRoadH(z))continue;g.deco.push({t:'cr_vline',x:x0+3,z});}
 for(const z0 of CRUISE_H)for(const x0 of CRUISE_V){g.deco.push({t:'cr_zebra',x:x0+1,z:z0,v:0});g.deco.push({t:'cr_zebra',x:x0+1,z:z0+5,v:0});g.deco.push({t:'cr_zebra',x:x0,z:z0+1,v:1});g.deco.push({t:'cr_zebra',x:x0+5,z:z0+1,v:1});}
 g.deco.push({t:'cr_sign',x:Math.floor(g.car.x),z:Math.floor(g.car.z),name:CRUISE?CRUISE.name:g.def.name});
 g.lights.push({x:g.car.x,y:1.6,z:g.car.z,r:5,c:[1,0.4,0.85]});
 if(p){p.a=c.h;g.cam.x=c.x;g.cam.z=c.z;}g.obj='DRIVE TO '+(CRUISE?CRUISE.name:g.def.name);
 banner(CRUISE?CRUISE.name:g.def.name,(CRUISE&&CRUISE.sub?CRUISE.sub+' · ':'')+(touchMode?'Left thumb drives · hold a right thumb to drift':padMode?'Left stick drives · B handbrake · LB turbo':'W/S gas & brake · A/D steer · Space handbrake · Shift turbo'));return true;}
/* static bits drawDeco hands over: centre lines of the avenues, crossings, the place's sign */
function cruiseDeco(B,g,d){const cx=d.x+0.5,cz=d.z+0.5;
 if(d.t==='cr_vline'){for(const o of [-0.06,0.06])B.box(TRS(d.x+o,0.004,cz,0,0.05,0.006,1.0),hex(0xe8c040));}
 else if(d.t==='cr_zebra'){for(let k=0;k<4;k++){const o=0.5+k;if(d.v)B.box(TRS(cx,0.005,d.z+o,0,0.75,0.006,0.32),[0.92,0.92,0.9]);else B.box(TRS(d.x+o,0.005,cz,0,0.32,0.006,0.75),[0.92,0.92,0.9]);}}
 else if(d.t==='cr_tun'){/* an underpass where a road leaves the map: the traffic drives in under the deck and out of sight instead of through the end wall */
  const P=d.P,o0=P.end?P.L-P.d:-4,o1=P.end?P.L+4:P.d,mid=(P.a+P.b)/2,w=P.b-P.a,far=P.end?P.L+2:-2,mouth=P.end?P.L-P.d:P.d;
  const bx=(o,c,so,sy,sc,y,col,em)=>B.box(P.ax==='x'?TRS(o,y,c,0,so,sy,sc):TRS(c,y,o,0,sc,sy,so),col,em);
  bx((o0+o1)/2,mid,o1-o0,0.5,w+0.5,1.62,[0.23,0.23,0.27]);bx(far,P.a-0.12,4,1.4,0.24,0.7,[0.12,0.12,0.15]);bx(far,P.b+0.12,4,1.4,0.24,0.7,[0.12,0.12,0.15]);
  bx(P.end?P.L+4:-4,mid,0.2,1.4,w+0.5,0.7,[0.02,0.02,0.03]);bx(far,mid,4,0.02,w,-0.012,[0.05,0.05,0.07]);
  bx(mouth+(P.end?-0.02:0.02),mid,0.08,0.12,w+0.5,1.44,[1,0.78,0.2],true);
  for(let k=0;k<w*2;k++)if(k%2===0)bx(mouth+(P.end?-0.03:0.03),P.a+0.25+k*0.5,0.1,0.22,0.5,1.62,[0.9,0.7,0.15]);}
 else if(d.t==='cr_sign'){const zf=d.z,nm=d.name||'',px=Math.min(0.07,4.2/(nm.length*6)),w=nm.length*6*px+0.5,y=2.0;
  B.box(TRS(cx,y,zf+0.06,0,w,0.62,0.1),[0.08,0.05,0.12]);B.box(TRS(cx,y,zf+0.03,0,w+0.1,0.7,0.06),[1,0.3,0.75],true);neonText(B,nm,cx,y,zf+0.13,px,[1.5,0.5,1.2]);
  B.box(TRS(cx,1.15,zf+0.4,0,2.6,0.06,0.8),[0.85,0.2,0.45]);for(const o of [-1.2,1.2])B.box(TRS(cx+o,0.58,zf+0.75,0,0.06,1.16,0.06),[0.2,0.2,0.24]);}}
/* ================= SOLID CARS =================
   A car is as long as it looks: your car is three circles (middle, nose, tail) that the walls push back on, and a traffic car is a box
   along its lane. Traffic never moves into a box that is taken (another car, or you), brakes for whatever is in its lane ahead, and waits
   off the edge of the map until its way back in is clear; your car is pushed out of any traffic car it touches, and back off the walls. */
const CARBOX={hl:1.2,hw:0.52};
/* where a road runs off the map the end wall becomes an underpass (drawn by cruiseDeco 'cr_tun'). spans: [{ax:'x'|'z',a,b}] = the cells the road covers across. */
function roadPortals(g,spans){g.portals=[];const W=g.W,H=g.H;
 for(const s of spans)for(const end of [0,1]){const L=s.ax==='x'?W:H,at=(p,k)=>s.ax==='x'?k*W+p:p*W+k;let d=0;
  for(;d<4;d++){const p=end?L-1-d:d;let all=true;for(let k=s.a;k<s.b;k++)if(!g.solid[at(p,k)])all=false;if(!all)break;}
  if(!d||d>3)continue;const inner=end?L-1-d:d;
  for(let q=0;q<d;q++){const p=end?L-1-q:q;for(let k=s.a;k<s.b;k++){const i=at(p,k),j=at(inner,k);g.solid[i]=0;g.furn[i]=0;g.wh[i]=0;g.floorT[i]=g.floorT[j];if(g.out)g.out[i]=g.out[j];}}
  const P={ax:s.ax,a:s.a,b:s.b,end,d,L};g.portals.push(P);g.deco.push({t:'cr_tun',x:end?L-1:0,z:s.a,P});}}
/* your car stops at the mouth of an underpass */
function carPortals(c){const g=G;if(!g||!g.portals)return;for(const P of g.portals){const al=P.ax==='x',along=al?c.x:c.z,cross=al?c.z:c.x;if(cross<P.a-0.4||cross>P.b+0.4)continue;
  const lim=P.end?P.L-P.d-1.25:P.d+1.25,over=P.end?along-lim:lim-along;if(over>0){const m=P.end?-over:over;carShove(c,[c.x,c.z,0,0],al?m:0,al?0:m,0.2);}}}
function carCircles(c){const fx=Math.sin(c.h),fz=Math.cos(c.h);return[[c.x,c.z,0.56,0],[c.x+fx*0.74,c.z+fz*0.74,0.46,1],[c.x-fx*0.74,c.z-fz*0.74,0.46,-1]];}
/* push one of the car's circles by (dx,dz): the car moves, turns about its middle if it was the nose or the tail, and loses the speed it had into the push */
function carShove(c,q,dx,dz,bounce){const d=Math.hypot(dx,dz);if(d<1e-5)return 0;const nx=dx/d,nz=dz/d;c.x+=dx;c.z+=dz;
 if(q[3]){const rx=Math.cos(c.h),rz=-Math.sin(c.h);c.h+=q[3]*(dx*rx+dz*rz)/0.74*0.45;}
 const vn=c.vx*nx+c.vz*nz;if(vn<0){c.vx-=(1+bounce)*vn*nx;c.vz-=(1+bounce)*vn*nz;}c.v=c.vx*Math.sin(c.h)+c.vz*Math.cos(c.h);return vn<0?-vn:0;}
/* the nose and the tail against the walls (carStep has already done the middle). Returns true on a hard knock. */
function carWalls(c){let hard=false;if(typeof collideGrid!=='function')return false;
 for(let pass=0;pass<2;pass++){const Q=carCircles(c);for(let i=1;i<3;i++){const q=Q[i],h={x:q[0],z:q[1],r:q[2]};collideGrid(h);const dx=h.x-q[0],dz=h.z-q[1];if(Math.hypot(dx,dz)<1e-4)continue;
   const hit=carShove(c,q,dx,dz,0.25);if(hit>4){hard=true;c.vx*=0.8;c.vz*=0.8;sfx('crash');shake(Math.min(0.5,hit*0.04));rumble(0.7,0.7,200);sparks(q[0],0.3,q[1]);}}
  const m={x:c.x,z:c.z,r:c.r||0.62};collideGrid(m);c.x=m.x;c.z=m.z;}
 carPortals(c);return hard;}
function trafficBox(t,x,z){const al=t.ax!=='z';return{x:x===undefined?t.x:x,z:z===undefined?t.z:z,hx:al?CARBOX.hl:CARBOX.hw,hz:al?CARBOX.hw:CARBOX.hl};}
function boxHit(a,b,m){return Math.abs(a.x-b.x)<a.hx+b.hx+m&&Math.abs(a.z-b.z)<a.hz+b.hz+m;}
function boxCirc(b,q,m){return Math.hypot(Math.max(0,Math.abs(q[0]-b.x)-b.hx),Math.max(0,Math.abs(q[1]-b.z)-b.hz))<q[2]+m;}
/* one step of the traffic. Lanes run along x (ax undefined or 'x') or along z (ax 'z'). */
function trafficMove(g,dt){const c=g.pcar,PC=c&&!g.parked?carCircles(c):[],T=g.traffic;
 if(!g.trafOK){g.trafOK=1;/* nor on top of you */for(let i=T.length-1;i>=0;i--)if(PC.some(q=>boxCirc(trafficBox(T[i]),q,1.2)))T.splice(i,1);/* nobody starts inside somebody else */for(let i=T.length-1;i>0;i--)for(let j=0;j<i;j++)if(boxHit(trafficBox(T[i]),trafficBox(T[j]),0.4)){T.splice(i,1);break;}}
 for(const t of T){t.slow=Math.max(0,(t.slow||0)-dt);const al=t.ax!=='z',pos=al?t.x:t.z,lat=al?t.z:t.x,L=al?g.W:g.H;let v=t.sp*(t.slow>0?0.2:1);
  for(const o of T){if(o===t)continue;const oal=o.ax!=='z',d=((al?o.x:o.z)-pos)*t.dir,l=Math.abs((al?o.z:o.x)-lat);
   if(oal===al){if(l<0.9&&d>0&&d<6)v=Math.min(v,Math.max(0,(o.cur===undefined?o.sp:o.cur)+(d-3.1)*1.6));}
   /* a car crossing my lane: stop short of it while any of it is in my lane */
   else if(l<CARBOX.hl+CARBOX.hw&&d>0&&d<5)v=Math.min(v,Math.max(0,(d-(CARBOX.hl+CARBOX.hw+0.45))*2.2));}
  for(const q of PC){const d=((al?q[0]:q[1])-pos)*t.dir,l=Math.abs((al?q[1]:q[0])-lat);if(l<CARBOX.hw+q[2]&&d>0&&d<5)v=Math.min(v,Math.max(0,(d-(CARBOX.hl+q[2]+0.5))*2.2));}
  t.cur=t.cur===undefined||v<t.cur?v:t.cur+(v-t.cur)*Math.min(1,dt*2.5);
  let np=pos+t.dir*t.cur*dt,wrap=false;if(np>L+2){np=-2;wrap=true;}else if(np<-2){np=L+2;wrap=true;}
  const cb=trafficBox(t),nb=trafficBox(t,al?np:t.x,al?t.z:np);let blocked=false;
  for(const o of T){if(o===t)continue;const ob=trafficBox(o);if(boxHit(nb,ob,wrap?0.8:0.06)&&(wrap||!boxHit(cb,ob,0.06))){blocked=true;break;}}
  if(!blocked)for(const q of PC)if(boxCirc(nb,q,0.04)&&(wrap||((al?q[0]:q[1])-pos)*t.dir>0)){blocked=true;break;}
  if(blocked){t.cur=0;continue;}
  if(al)t.x=np;else t.z=np;t.wr=(t.wr||0)-t.cur*dt/0.25;}}
/* your car against the traffic: pushed out of every box it touches, then back off the walls; a car that has you pinned backs away. Returns the hardest knock. */
function carVsTraffic(g,dt){const c=g.pcar;let worst=0,who=null;
 for(const t of g.traffic){const b=trafficBox(t);if(Math.abs(c.x-b.x)>b.hx+1.4||Math.abs(c.z-b.z)>b.hz+1.4)continue;let touched=false;
  for(let pass=0;pass<2;pass++)for(const q of carCircles(c)){const ex=Math.abs(q[0]-b.x)-b.hx,ez=Math.abs(q[1]-b.z)-b.hz;let dx=0,dz=0;
    if(ex<0&&ez<0){if(ex>ez)dx=Math.sign(q[0]-b.x||1)*(q[2]-ex);else dz=Math.sign(q[1]-b.z||1)*(q[2]-ez);}
    else{const ox=Math.max(0,ex),oz=Math.max(0,ez),d=Math.hypot(ox,oz);if(d>=q[2])continue;const k=(q[2]-d)/(d||1);dx=Math.sign(q[0]-b.x)*ox*k;dz=Math.sign(q[1]-b.z)*oz*k;}
    touched=true;const hit=carShove(c,q,dx,dz,0.4);if(hit>worst){worst=hit;who=t;}}
  if(!touched)continue;if(!who)who=t;carWalls(c);
  /* still inside it: you are against a wall, so the other car gives way */
  const al=t.ax!=='z';for(let k=0;k<12&&carCircles(c).some(q=>boxCirc(trafficBox(t),q,0));k++){const nx=al?t.x-t.dir*0.08:t.x,nz=al?t.z:t.z-t.dir*0.08,nb=trafficBox(t,nx,nz);if(g.traffic.some(o=>o!==t&&boxHit(nb,trafficBox(o),0.02)))break;t.x=nx;t.z=nz;}
  t.cur=0;if(worst>3||!(t.slow>0)){t.hit=1;}t.slow=1.2;}
 if(who&&who.hit){for(const t of g.traffic)t.hit=0;c.vx*=0.75;c.vz*=0.75;c.v=c.vx*Math.sin(c.h)+c.vz*Math.cos(c.h);sfx('crash');sfx('horn');shake(0.4);rumble(0.8,0.8,220);sparks((c.x+who.x)/2,0.4,(c.z+who.z)/2);popup(who.x,who.z,pick(['HEY!','WATCH IT!','*HONK*','LEARN TO DRIVE!']),'#ffd36b');}
 /* wedged between a car and a wall with no way to push clear: back to where the car last stood free */
 if(who){const Q=carCircles(c);if(g.traffic.some(t=>{const tb=trafficBox(t);return Q.some(q=>boxCirc(tb,q,-0.03));})&&c.ok&&g.traffic.every(t=>{const tb=trafficBox(t);return !carCircles(c.ok).some(q=>boxCirc(tb,q,-0.03));})){c.x=c.ok.x;c.z=c.ok.z;c.h=c.ok.h;c.vx*=-0.15;c.vz*=-0.15;c.v=c.vx*Math.sin(c.h)+c.vz*Math.cos(c.h);}}
 if(!c.ok)c.ok={x:0,z:0,h:0};c.ok.x=c.x;c.ok.z=c.z;c.ok.h=c.h;
 const p=g.player;if(p&&!g.parked){p.x=c.x;p.z=c.z;p.a=c.h;}return worst;}

function cruiseTraffic(g,dt){trafficMove(g,dt);carVsTraffic(g,dt);}
function cruiseTick(dt){const g=G,c=g.pcar;if(!c)return;g.cruiseT=(g.cruiseT||0)+dt;
 if(g.arrived){c.vx*=Math.exp(-dt*5);c.vz*=Math.exp(-dt*5);c.x+=c.vx*dt;c.z+=c.vz*dt;c.v=Math.hypot(c.vx,c.vz);carSqueal(0);engineRev(c.v,false);return;}
 const inp=carInput(c);carStep(g,c,inp,dt);cruiseTraffic(g,dt);engineRev(c.v,g.turbo);
 if(Math.hypot(c.x-g.dest.x,c.z-g.dest.z)<2.6||Math.hypot(c.x-g.dest.sx,c.z-g.dest.sz)<2.2)cruiseArrive();}
/* pulled up at the place (or skipped the drive): into the job */
function cruiseArrive(skip){const g=G;if(!g||g.def.hub!=='cruise'||g.arrived||g.hubDone)return false;g.arrived=true;const id=CRUISE&&CRUISE.id;carSqueal(0);
 if(!skip){sfx('carShut');banner(CRUISE?CRUISE.name:'',"You're here");}
 const go=()=>{CRUISE=null;if(!id||!missionKnown(id)){goHome();return;}JOBPICK=null;startMission(id);showObjCard();};
 g.hubDone=skip?fadeTo(go):(setTimeout(()=>{if(G===g)fadeTo(go);},skip?0:700),true);return true;}
function drawCruise(B,g){const c=g.pcar;drawRide(B,c.x,c.z,1,c.h-Math.PI/2,null,c.wr||0);if(g.player)drawDriver(g,c.x,c.z,c.h-Math.PI/2);
 for(const t of g.traffic)if(inView(t.x,0.6,t.z,2.6)){if(t.ax==='x')drawCar(B,t.x,t.z,t.col,t.dir,t.wr||0,undefined,1);else drawCarShape(B,t.x,t.z,1,t.dir>0?-Math.PI/2:Math.PI/2,TRAFFIC_TYPES[Math.floor((t.col[0]*7.1+t.col[1]*13.3+t.col[2]*5.7)*97)%TRAFFIC_TYPES.length],{col:t.col,drv:1+Math.floor(t.col[0]*97)%23},t.wr||0);}
 /* the place: a gold diamond over the kerb and a ring on the road */
 const d=g.dest,y=2.9+Math.sin(g.T*4)*0.2;B.box(A.mul(A.mul(A.T(d.sx,y,d.sz),A.RY(g.T*2)),A.mul(A.RX(0.785),A.S(0.45,0.45,0.45))),GOLD,true);
 for(let i=0;i<10;i++){const a=g.T*1.5+i*0.628;B.box(TRS(d.x+Math.sin(a)*1.6,0.02,d.z+Math.cos(a)*1.6,-a,0.35,0.01,0.12),[1,0.85,0.3],true);}}
/* the arrow to the place at the screen edge, and how far it is */
function cruiseHUD(c,g,u,m){const d=g.dest;c.font=PXF(7*u);txt(c,g.def.where,m,m,'#ffd36b','left',7*u);c.font=VTF(22*u);txt(c,g.obj,m,m+10*u,'#fff','left',22*u);
 const car=g.pcar,dist=Math.hypot(d.x-car.x,d.z-car.z);c.font=VTF(18*u);txt(c,Math.round(dist*10)+' M',m,m+34*u,'#2de2e6','left',18*u);
 const kmh=Math.round(Math.hypot(car.vx||0,car.vz||0)*9);c.font=VTF(26*u);txt(c,kmh+' KM/H',vw-m,vh-m-30*u,car.slip>2.4?'#ff3fa4':'#fff','right',26*u);
 const s=project(d.sx,1.5,d.sz);let sx,sy,on=false;if(s){sx=s[0];sy=s[1];on=sx>40*u&&sy>60*u&&sx<vw-40*u&&sy<vh-40*u;}
 if(on){const b=Math.sin(g.T*6)*4*u;c.fillStyle='#ffd36b';c.beginPath();c.moveTo(sx,sy-20*u+b);c.lineTo(sx-9*u,sy-34*u+b);c.lineTo(sx+9*u,sy-34*u+b);c.closePath();c.fill();return;}
 const cs=project(car.x,0.5,car.z);if(!cs)return;let ax=(s?s[0]:cs[0]+(d.x-car.x)*40)-cs[0],ay=(s?s[1]:cs[1]+(d.z-car.z)*40)-cs[1];const L=Math.hypot(ax,ay)||1;ax/=L;ay/=L;
 const cxm=vw/2,cym=vh/2,r=Math.min(vw,vh)*0.42,px=cxm+ax*r,py=cym+ay*r,an=Math.atan2(ay,ax);c.save();c.translate(px,py);c.rotate(an);c.fillStyle='#ffd36b';c.shadowColor='#ff2d95';c.shadowBlur=10*u;
 c.beginPath();c.moveTo(18*u,0);c.lineTo(-10*u,-12*u);c.lineTo(-4*u,0);c.lineTo(-10*u,12*u);c.closePath();c.fill();c.restore();}
