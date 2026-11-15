'use strict';
/* ================= STREET FRONTS AND SETS: Act 1 (the Sunset Motel, Club Flamingo, the Coral Tower lobby), and the Act 2/3 fronts =================
   Each Act 1 street is built like the venue fronts (venues.js): under the building's front wall, a paved sidewalk, a parking
   lay-by marked into bays, two road lanes and a sand verge with palms (world.js frontGrid turns the map's '=' rows into these,
   def.front on the level). Nothing on the street is rolled at random any more: no stray patch tiles or litter on the road, no palm
   in a traffic lane. Every lamp, bin, phone, sign and parked car has its own spot, picked here per building.
   Arriving, your car comes along the near lane, swings into the bay beside the sidewalk, you get out on the kerb, cross the
   sidewalk and walk in through one of the building's real entrances (the side door for the club's staff entrance), and the
   job starts just inside the door.
   'f' map cells (furniture 30) are fixtures drawn here: the motel's ice and soda machines, the club's DJ booth.
   Loaded after streets.js, before the main inline script: nothing here touches main-script globals at load time. */

/* per building: which entrance the arrival uses ('side' = the narrow door furthest from the middle, else the main door),
   the awning colour over the main door, and the kerb furniture as [kind, x offset from the main door, side] (side 'w' = against the
   building, 'k' = at the kerb). Kinds are streets.js kerb props plus the act1 ones drawn below. */
const ACT1={
 'MOTEL SUNSET':{entry:'main',awning:0x2a9ea3,carpet:false,lamps:[-12,-4,6,16],
  kerb:[['pole',-6,'k'],['phone',2,'w'],['news',-2.5,'w'],['trash',4,'w'],['hydrant',9,'k'],['meter',12,'k'],['trash',-11,'w'],['bench',13,'w']],
  sign:{t:'OFFICE',c:[0.3,0.95,1]},side:{bulb:true}},
 'CLUB FLAMINGO':{entry:'side',awning:0xe0459a,carpet:true,lamps:[-13,-5,6,13],
  kerb:[['rope',-1.6,'k2'],['rope',1.6,'k2'],['posters',-3,'w'],['posters',3,'w'],['meter',-8,'k'],['hydrant',9,'k'],['news',11,'w'],['phone',-9.5,'w']],
  sign:{t:'CLUB FLAMINGO',c:[1,0.3,0.7],flamingo:true},side:{bulb:true,dumpsters:true}},
 'CORAL TOWER LOBBY':{entry:'main',awning:0xd9c08a,carpet:true,canopy:true,lamps:[-12,-5,5,12],
  kerb:[['planter',-2.2,'w'],['planter',2.2,'w'],['podium',3.2,'k2'],['bench',-8,'w'],['bench',8,'w'],['mailbox',10.5,'k'],['news',-10.5,'w'],['hydrant',-14,'k'],['trash',14,'w']],
  sign:null},
 /* Act 2 and Act 3 fronts (the Royal Flush is at sea and keeps its speedboat) */
 'VICE MARINA':{entry:'main',gate:true,awning:0x2bb7b9,lamps:[-14,-7,7,14],
  kerb:[['pole',-10,'k',{t1:'VICE',t2:'MARINA',c1:[0.3,0.95,1],c2:[1,0.55,0.2],t3:'BOAT SLIPS'}],['bench',-4.5,'w'],['bench',4.5,'w'],['trash',6.5,'w'],['phone',-6.5,'w'],['hydrant',11,'k'],['news',12.5,'w']],
  sign:null,side:{bulb:true,dumpsters:true}},
 'STARLIGHT ARCADE':{entry:'main',awning:0xe0459a,lamps:[-13,-6,7,13],
  kerb:[['posters',-2.6,'w'],['posters',2.6,'w'],['news',-5,'w'],['trash',5,'w'],['meter',-9,'k'],['meter',9,'k'],['hydrant',11,'k'],['phone',-11,'w']],
  sign:{t:'STARLIGHT',c:[0.75,0.45,1]},side:{bulb:true}},
 'OCEAN VIEW MALL':{entry:'main',awning:0x2bb7b9,carpet:false,lamps:[-14,-7,6,13],
  kerb:[['planter',-1.8,'w'],['planter',1.8,'w'],['bench',-4.5,'w'],['bench',4.5,'w'],['trash',-7,'w'],['mailbox',8,'k'],['phone',10.5,'w'],['news',-10.5,'w'],['hydrant',-12.5,'k']],
  sign:{t:'OCEAN VIEW MALL',c:[0.3,0.95,1]},side:{bulb:true}},
 'THE RECORDING STUDIO':{entry:'side',awning:0x8e2a66,lamps:[-13,-6,6,13],
  kerb:[['posters',-2.6,'w'],['meter',-5,'k'],['news',4,'w'],['trash',6,'w'],['phone',-9,'w'],['hydrant',10,'k'],['bench',12,'w']],
  sign:{t:'SUNSHINE SOUND',c:[1,0.35,0.3],onair:true},side:{bulb:true,dumpsters:true}},
 'OCEAN DRIVE DEMOLITION':{entry:'side',awning:0xe0a030,lamps:[-13,13],works:true,
  kerb:[['barrier',-2.2,'k2'],['barrier',2.2,'k2'],['cone',-4,'k'],['cone',4,'k'],['cone',-7,'k'],['cone',7,'k'],['dumpster',9,'w'],['trash',-9,'w'],['hydrant',11,'k']],
  sign:{t:'KADE DEVELOPMENT',c:[1,0.8,0.3]},side:{bulb:true}},
 'THE GRAND BISCAYNE GALA':{entry:'main',awning:0xd9c08a,carpet:true,canopy:'GRAND BISCAYNE',lamps:[-13,-6,6,13],
  kerb:[['rope',-1.7,'k2'],['rope',1.7,'k2'],['planter',-3.4,'w'],['planter',3.4,'w'],['podium',3.6,'k'],['bench',-8,'w'],['bench',8,'w'],['news',-11,'w'],['hydrant',12,'k']],
  sign:null},
 'KADE TOWER: SITE GATE':{entry:'main',awning:0xe0a030,lamps:[-12,12],works:true,
  kerb:[['barrier',-2.4,'k2'],['barrier',2.4,'k2'],['cone',-4.5,'k'],['cone',4.5,'k'],['cone',-8,'k'],['cone',8,'k'],['dumpster',-11,'w'],['dumpster',11,'w']],
  sign:{t:'KADE TOWER',c:[1,1,1]},side:{bulb:true}},
};
const act1Of=g=>g&&g.front&&ACT1[g.def.name]?ACT1[g.def.name]:null;
const A1_CARS=[[0.92,0.92,0.9],[0.1,0.1,0.12],[0.75,0.12,0.15],[0.2,0.45,0.85],[0.95,0.75,0.2],[0.3,0.75,0.65],[0.9,0.5,0.7]];

/* the street entrances: every opening in the front wall above the sidewalk, as [{a,b}] cell runs */
function act1Gaps(g){const W=g.W,zT=g.front.zT,out=[];let run=null;
 for(let x=1;x<W-1;x++){const ok=!g.solid[(zT-1)*W+x]&&!g.solid[(zT-2)*W+x];if(ok){if(!run){run={a:x,b:x};out.push(run);}else run.b=x;}else run=null;}return out;}

/* ---- arrival: called by arriveSetup for front streets; sets g.arr, the doors, the car's bay and the walk in ---- */
function act1Arrive(g,i,skipScene){const A=act1Of(g),F=g.front,W=g.W,zT=F.zT,gaps=act1Gaps(g);if(!gaps.length||!g.player)return false;
 const ctr=q=>(q.a+q.b+1)/2,mid=W/2;gaps.sort((p,q)=>Math.abs(ctr(p)-mid)-Math.abs(ctr(q)-mid));
 /* a door is only an entrance if you can step inside it (the mall's middle door opens onto the elevator block) */
 const inOK=q=>{const x=Math.floor((q.a+q.b+1)/2-(q.b>q.a?0.5:0)),i=(zT-2)*W+x;return !g.solid[i]&&!g.furn[i]&&g.rows[zT-2][x]!=='e';};
 let main=gaps.find(q=>q.b-q.a<=1&&inOK(q))||gaps.find(inOK)||gaps[0];
 /* the Marina: the dock yard's open front is railed off, with a two-leaf iron gate in the middle */
 if(A.gate){const wide=gaps.filter(q=>q.b-q.a>=3).sort((p,q)=>(q.b-q.a)-(p.b-p.a))[0];if(wide){const c=Math.floor(ctr(wide)),gate={a:c-1,b:c};
  for(let x=wide.a;x<=wide.b;x++){if(x>=gate.a&&x<=gate.b)continue;const ii=(zT-1)*W+x;g.solid[ii]=1;g.wallT[ii]=6;g.wh[ii]=0.55;g.topT[ii]=0;g.deco.push({t:'rail',x,z:zT-1});}
  gaps.splice(gaps.indexOf(wide),1,gate);main=gate;g.deco.push({t:'arch',x:gate.a,z:zT-1,fx:gate.b,w:2});for(const sx of [-1,1])g.lights.push({x:c+sx*1.3,y:1.8,z:zT+0.1,r:4,c:[0.3,0.9,1]});g.a1gate=gate;}}
 let gap=main;if(A.entry==='side'){const s=gaps.filter(q=>q!==main&&q.b-q.a<=1&&inOK(q)&&Math.abs(ctr(q)-ctr(main))>=6);if(s.length)gap=s[s.length-1];}
 for(const q of gaps)addGapDoors(g,q,zT-1);if(g.a1gate)for(const d of g.doors)if(d.front&&Math.abs(d.hz-(zT-0.5))<0.01&&d.hx>=g.a1gate.a&&d.hx<=g.a1gate.b+1)d.gate=1;
 const gx=ctr(gap),fx=ctr(main);g.arr={type:gap===main?'front':'side',zT,zB:F.zV,gx,gap,main,fx,ax:null,front:1};
 /* the bays are three cells wide; yours is the one whose middle sits just past the door, so the driver's door opens onto the walk */
 const b0=Math.round(gx+0.45-1.5),cx=b0+1.5,cz=F.bay+0.5;g.bayX=cx;g.bays=[];
 for(let b=b0-3*Math.ceil(b0/3);b+3<=W-1;b+=3){if(b<1)continue;g.bays.push({x:b+1.5,z:cz,b,mine:b===b0});}
 g.car={x:cx,z:cz};g.carA=0;
 /* the job starts just inside the door; if that cell is blocked, on the sidewalk outside it */
 const inX=Math.floor(gx-(gap.b>gap.a?0.5:0)),inside=inOK(gap),door=inside?[gx,zT-1.45]:[gx,zT+0.45];
 const p=g.player;p.x=door[0];p.z=door[1];p.a=Math.PI;
 if(skipScene)return true;
 const L=F.lane[0]+0.5,path=[[cx-16,L],[cx-4.2,L],[cx-1.5,cz+0.12],[cx,cz]];
 g.arrive={t:0,ph:'drive',front:1,path,L:seqPathLen(path),x1:cx,z:cz,door,thr:[gx,zT+0.3],hide:true,spin:0,lvl:i,then:null,dir:1};
 g.car.x=path[0][0];g.car.z=path[0][1];arriveSfx();return true;}

/* one frame of the front-street arrival (updateArrive hands over here) */
function act1ArriveStep(g,A0,dt){const p=g.player,c=g.car;
 if(A0.ph==='drive'){const u=Math.min(1,A0.t/2.6),e=1-Math.pow(1-u,3),s=e*A0.L,q=seqPathAt(A0.path,s),ah=seqPathAt(A0.path,Math.min(A0.L,s+0.9)),bh=seqPathAt(A0.path,Math.max(0,s-0.3));
  let dx=ah[0]-bh[0],dz=ah[1]-bh[1];if(Math.hypot(dx,dz)<1e-4){dx=1;dz=0;}A0.spin+=Math.hypot(q[0]-c.x,q[1]-c.z)*3.2;c.x=q[0];c.z=q[1];g.carA=Math.atan2(-dz,dx);
  if(u>=1){c.x=A0.x1;c.z=A0.z;g.carA=0;A0.ph='park';A0.t=0;}}
 else if(A0.ph==='park'){if(A0.t>0.3){A0.ph='open';A0.t=0;A0.side=carSideOf(c,c.x,g.front.zT+0.5,0);A0.ex=carPt(c,A0.side,0.86,-0.15,0);carDoorOpen(c,A0.side);}}
 else if(A0.ph==='open'){if(c.dr.t>=0.8||A0.t>0.6){A0.ph='step';A0.t=0;const q=carPt(c,A0.side,0.34,-0.15,0);A0.hide=false;p.x=q[0];p.z=q[1];}}
 else if(A0.ph==='step'){if(autoWalk(p,A0.ex,1.9,dt)||A0.t>0.8){p.x=A0.ex[0];p.z=A0.ex[1];A0.ph='walk';A0.t=0;carDoorClose(c);}}
 else if(A0.ph==='walk'){if(autoWalk(p,A0.thr,2.6,dt)||A0.t>1.6){A0.ph='in';A0.t=0;}}
 else if(A0.ph==='in'){const ox=p.x,oz=p.z,done=autoWalk(p,A0.door,2.2,dt);seqDoors(g,p,p.x-ox,p.z-oz);if(done||A0.t>1.6){walkVel(p,0,0);return true;}}
 updateDoors(dt);carDoorTick(c,dt);
 {const k=1-Math.exp(-dt*3),tx=A0.ph==='drive'?A0.x1:p.x,tz=A0.ph==='drive'?A0.z-1:Math.min(A0.z-1,p.z+0.6);g.cam.x+=(tx-g.cam.x)*k;g.cam.z+=(tz-g.cam.z)*k;}
 return false;}

/* ---- street dressing: dressStreet hands front streets over here (before buildStatic) ---- */
function act1Dress(g){const A=act1Of(g),F=g.front,W=g.W,a=g.arr,zT=F.zT;streetPlan(g);
 const gaps=act1Gaps(g),ctr=q=>(q.a+q.b+1)/2,mid=W/2;gaps.sort((p,q)=>Math.abs(ctr(p)-mid)-Math.abs(ctr(q)-mid));
 const main=a?a.main:(gaps.find(q=>q.b-q.a<=1)||gaps[0]),fx=main?ctr(main):mid,doorsX=gaps.map(ctr);g.a1={kerb:[],lamps:[],palms:[],signs:[]};const K=g.a1.kerb;
 const clearOfDoors=(x,r)=>doorsX.every(d=>Math.abs(d-x)>r);
 if(!g.bays){/* no arrival scene (tests, NOARRIVE): bays from the map's car spot */const b0=Math.round(g.car.x-1.5);g.bayX=b0+1.5;g.bays=[];for(let b=b0-3*Math.ceil(b0/3);b+3<=W-1;b+=3)if(b>=1)g.bays.push({x:b+1.5,z:F.bay+0.5,b,mine:b===b0});g.car.x=g.bayX;g.car.z=F.bay+0.5;g.carA=0;}
 /* the main door: awning or canopy, a carpet, warm lights under it */
 if(main){const w=Math.min(main.b-main.a+1.8,4.2),col=hex(A.awning);
  if(A.canopy)g.a1.signs.push({t:'canopy',x:fx,z:zT,w:w+0.6,text:A.canopy===true?'CORAL TOWER':A.canopy});else g.deco.push({t:'awning',x:Math.floor(fx),z:zT,fx,w,c:col});
  if(A.carpet)g.deco.push({t:'carpet',x:Math.floor(fx),z:zT,fx,w:Math.min(main.b-main.a+1,2.2)});
  for(const sx of [-1,1])g.lights.push({x:fx+sx*(w/2+0.2),y:1.5,z:zT+0.2,r:3.6,c:[1,0.82,0.55]});
  if(A.sign)g.a1.signs.push(Object.assign({x:fx,z:zT},A.sign));}
 /* the other doors: a caged bulb over each, and bins by the club's staff door */
 for(const q of gaps){if(q===main)continue;const x=ctr(q);if(A.side&&A.side.bulb){g.deco.push({t:'bulb',x:Math.floor(x),z:zT,fx:x});g.lights.push({x,y:1.9,z:zT+0.3,r:4,c:[1,0.78,0.45]});}
  if(A.side&&A.side.dumpsters){for(const o of [-2.6,2.4])if(clearOfDoors(x+o,1.2))g.deco.push({t:'dumpster',x:Math.floor(x+o-0.5),z:zT-0.02,c:o>0});g.deco.push({t:'bags',x:Math.floor(x+1.2),z:zT-0.35});}}
 /* street lamps at the kerb, lit over the road */
 for(const o of A.lamps){const x=Math.round(fx+o)+0.5;if(x<1.5||x>W-1.5||!clearOfDoors(x,1.1))continue;g.a1.lamps.push(x);g.lights.push({x,y:2.2,z:zT+1.15,r:5,c:[1,0.72,0.42]});}
 /* kerb furniture */
 for(const [t,o,s,opt] of A.kerb){const x=fx+o;if(x<1.3||x>W-1.3)continue;if(s==='w'&&!clearOfDoors(x,0.9))continue;if(g.a1.lamps.some(l=>Math.abs(l-x)<0.6))continue;
  K.push(Object.assign({t,x,z:s==='w'?zT+0.28:s==='k2'?zT+0.62:zT+0.8},opt||{}));}
 /* palms along the verge, the same rhythm the whole way */
 for(let x=2.5;x<W-1;x+=5)g.a1.palms.push(x);
 /* parked cars: some of the other bays, never the ones next to yours, and one always left free (for your old car) */
 const mine=g.bays.findIndex(b=>b.mine);let free=0;
 for(let k=0;k<g.bays.length;k++){const b=g.bays[k];if(b.mine||Math.abs(k-mine)<=1){continue;}const h=ihash(b.b,zT,(g.def.name||'').length*13+7);
  if(h<0.42||free===0&&Math.abs(k-mine)===2){free++;continue;}b.car={col:A1_CARS[Math.floor(h*977)%A1_CARS.length],dir:h>0.75?-1:1};
  for(let x=b.b;x<b.b+3;x++){const ii=F.bay*W+x;if(!g.solid[ii]&&!g.furn[ii])g.furn[ii]=22;}}}

/* baked into the static batch at the end of buildStatic */
function drawAct1(B,g){if(!act1Of(g)||!g.a1)return;const F=g.front,W=g.W,zT=F.zT,zB=F.bay,zL=F.lane,r0=B.round;B.round=0;
 const WH=[0.92,0.92,0.88],YL=[0.95,0.78,0.2];
 /* the kerb between the sidewalk and the lay-by, and a lower one along the verge */
 B.box(TRS(W/2,0.07,zB+0.02,0,W,0.14,0.12),[0.78,0.78,0.76]);B.box(TRS(W/2,0.05,F.zV+0.02,0,W,0.1,0.08),[0.7,0.68,0.62]);
 /* bays: a line between each, your bay lit, the lay-by's edge line, the centre dashes and the verge's edge line */
 for(const b of g.bays){B.box(TRS(b.b,0.012,zB+0.5,0,0.07,0.012,0.95),WH);if(b.b+3<W-1)B.box(TRS(b.b+3,0.012,zB+0.5,0,0.07,0.012,0.95),WH);}
 B.box(TRS(W/2,0.012,zB+0.96,0,W,0.012,0.06),WH);
 for(let x=0.6;x<W;x+=1.6)B.box(TRS(x,0.012,zL[1],0,0.8,0.012,0.07),YL);
 B.box(TRS(W/2,0.012,F.zV-0.06,0,W,0.012,0.06),WH);
 const mine=g.bays.find(b=>b.mine);if(mine)B.box(TRS(mine.x,0.013,zB+0.08,0,1.6,0.012,0.08),[0.3,0.75,1],true);
 /* road furniture, placed not rolled: two manholes in the far lane, a drain at every other bay line */
 for(const x of [W*0.3,W*0.72])floorQuad(B,Math.floor(x)+0.5,zL[1]+0.5,0.62,0,TUV[206],[1,1,1],0.008);
 for(let k=0;k<g.bays.length;k+=2){const x=g.bays[k].b+0.02;B.quad([[x-0.25,0.009,zB+0.2],[x+0.25,0.009,zB+0.2],[x+0.25,0.009,zB+0.04],[x-0.25,0.009,zB+0.04]],0,1,0,TUV[208],[1,1,1]);}
 for(const b of g.bays)if(b.car)drawCar(B,b.x,b.z,b.car.col,b.car.dir,0);
 for(const x of g.a1.palms)drawPalm(B,x,F.zV+0.5,true,x*1.7);
 for(const x of g.a1.lamps)a1Lamp(B,x,zT);
 for(const k of g.a1.kerb){if(k.t==='pole')a1Pole(B,k.x,k.z,k);else if(k.t==='cone'){sbox(B,k.x,0.03,k.z,0.34,0.06,0.34,hex(0x1a1a1a));sbox(B,k.x,0.22,k.z,0.2,0.34,0.2,hex(0xff6a10));sbox(B,k.x,0.24,k.z,0.22,0.06,0.22,S_WHITE);sbox(B,k.x,0.42,k.z,0.09,0.08,0.09,hex(0xff6a10));}
  else if(k.t==='barrier'){for(const o of [-0.5,0.5])sbox(B,k.x+o,0.4,k.z,0.06,0.8,0.3,S_GREY);for(let j=0;j<4;j++)sbox(B,k.x-0.375+j*0.25,0.62,k.z,0.25,0.18,0.04,j%2?S_WHITE:hex(0xff6a10));sbox(B,k.x+0.5,0.84,k.z,0.07,0.06,0.07,[1,0.6,0.1],true);}
  else if(k.t==='dumpster'){const z=k.z+0.08,col=hex(0x2f5a3a);sbox(B,k.x,0.38,z,1.3,0.76,0.62,col);sbox(B,k.x,0.79,z+0.02,1.34,0.06,0.66,sdim(col,0.7));}else if(k.t==='hydrant'){const x=k.x,z=k.z;sbox(B,x,0.22,z,0.18,0.44,0.18,hex(0xc0202a));sbox(B,x,0.46,z,0.13,0.08,0.13,hex(0xd03030));sbox(B,x,0.28,z,0.3,0.07,0.07,hex(0xa01a22));}else drawKerb(B,g,k);}
 for(const s of g.a1.signs)a1Sign(B,g,s);
 a1Fixtures(B,g);a1Interior(B,g);B.round=r0;}
function a1Lamp(B,x,zT){const z=zT+0.86,P=hex(0x3a3a44);sbox(B,x,0.08,z,0.18,0.16,0.18,P);sbox(B,x,1.15,z,0.08,2.3,0.08,P);sbox(B,x,2.28,z+0.25,0.07,0.07,0.5,P);sbox(B,x,2.22,z+0.48,0.24,0.08,0.3,[1,0.85,0.55],true);}
/* the Sunset's roadside sign: a tall pole, the name in teal and orange neon, and VACANCY lit underneath */
function a1Pole(B,x,z,o){o=o||{};const T1=o.t1||'SUNSET',T2=o.t2||'MOTEL',C1=o.c1||[1,0.55,0.15],C2=o.c2||[0.3,0.95,1],T3=o.t3||'VACANCY';const P=hex(0x2a2a32);sbox(B,x,1.6,z,0.12,3.2,0.12,P);sbox(B,x+0.02,3.02,z-0.02,1.9,0.78,0.14,hex(0x1c3e4a));sbox(B,x+0.02,3.02,z+0.06,1.96,0.84,0.02,[0.3,0.95,1],true);
 sbox(B,x+0.02,3.02,z+0.075,1.84,0.72,0.02,hex(0x123038));neonText(B,T1,x+0.02,3.2,z+0.09,0.05,C1);neonText(B,T2,x+0.02,2.86,z+0.09,0.045,C2);
 sbox(B,x,2.3,z,1.2,0.3,0.1,hex(0x1a1a20));neonText(B,T3,x,2.3,z+0.06,Math.min(0.028,1.1/(T3.length*6)),[1,0.25,0.3]);}
/* signs over the main door: the motel office, Club Flamingo's neon flamingo, the tower's gold letters on a canopy */
function a1Sign(B,g,s){const z=s.z+0.03,x=s.x;
 if(s.t==='canopy'){const w=s.w,c=hex(0x1a2340),zf=s.z+0.95;sbox(B,x,2.1,s.z+0.48,w,0.06,0.96,c);sbox(B,x,2.02,zf,w+0.04,0.2,0.05,c);sbox(B,x,2.13,zf,w+0.06,0.03,0.07,GOLD);sbox(B,x,1.91,zf,w+0.06,0.03,0.07,GOLD);
  goldText(B,s.text,x,2.02,zf+0.02,0.022*Math.min(1,10/s.text.length));for(const sx of [-1,1])sbox(B,x+sx*(w/2-0.05),1.0,zf-0.02,0.06,2.0,0.06,GOLD);
  for(let k=0;k<4;k++)sbox(B,x-w/2+0.5+k*(w-1)/3,2.06,s.z+0.5,0.1,0.02,0.1,[1,0.9,0.6],true);return;}
 if(s.gold){goldText(B,s.t,x,2.6,s.z,0.05);return;}
 if(s.t==='OFFICE'){sbox(B,x,2.4,z+0.1,1.1,0.26,0.05,hex(0x14141a));sbox(B,x,2.2,z+0.1,0.04,0.2,0.04,hex(0x3a3a44));neonText(B,'OFFICE',x,2.4,z+0.14,0.032,s.c);return;}
 const px=Math.min(0.05,3.6/(s.t.length*6)),w=textW(s.t,px)+0.3;sbox(B,x,2.45,z+0.03,w,0.5,0.06,hex(0x1a0a18));sbox(B,x,2.45,z+0.065,w+0.06,0.56,0.01,sdim(s.c,0.7),true);sbox(B,x,2.45,z+0.07,w-0.04,0.44,0.01,hex(0x1a0a18));
 neonText(B,s.t,x,2.45,z+0.09,px,s.c);if(s.onair){sbox(B,x+w/2+0.45,2.45,z+0.06,0.6,0.26,0.05,hex(0x1a0a0a));neonText(B,'ON AIR',x+w/2+0.45,2.45,z+0.1,0.016,[1,0.2,0.2]);}
 if(s.flamingo){const fx=x-w/2-0.45,P=[1,0.4,0.7];sbox(B,fx,2.15,z+0.05,0.04,0.7,0.02,P,true);sbox(B,fx+0.06,2.55,z+0.05,0.26,0.18,0.02,P,true);sbox(B,fx+0.14,2.75,z+0.05,0.04,0.3,0.02,P,true);sbox(B,fx+0.2,2.9,z+0.05,0.12,0.06,0.02,[1,0.7,0.2],true);}
 for(let k=0;k<10;k++)sbox(B,x-w/2+k*w/9,2.15,z+0.08,0.05,0.05,0.03,(k%2?[1,0.9,0.5]:[1,0.5,0.8]),true);}

/* ---- the 'f' fixtures: contiguous runs of furniture 30, drawn per building ---- */
function a1Fixtures(B,g){const W=g.W,seen=new Set();
 for(let z=0;z<g.H;z++)for(let x=0;x<W;x++){const i=z*W+x;if(g.furn[i]!==30||seen.has(i))continue;let e=x;while(g.furn[z*W+e+1]===30)e++;for(let k=x;k<=e;k++)seen.add(z*W+k);
  const back=isSolid(x,z-1)?-1:1,cx=(x+e+1)/2,cz=z+0.5,n=e-x+1;
  if(g.def.name==='MOTEL SUNSET')a1Vend(B,x,e,cz,back);else if(g.def.name==='CLUB FLAMINGO')a1DJ(B,cx,cz,n,back);}}
/* the motel walkway: an ice machine and a soda machine side by side against the wall */
function a1Vend(B,x0,x1,cz,back){const z=cz-back*0.12,f=back<0?1:-1;
 {const x=x0+0.5;sbox(B,x,0.55,z,0.86,1.1,0.7,[0.86,0.88,0.9]);sbox(B,x,1.0,z+f*0.355,0.8,0.18,0.02,[0.25,0.55,0.95],true);neonText(B,'ICE',x,1.0,z+f*0.37,0.03,S_WHITE);
  sbox(B,x,0.55,z+f*0.355,0.5,0.34,0.02,[0.55,0.58,0.62]);sbox(B,x,0.3,z+f*0.36,0.6,0.04,0.02,S_DGREY);}
 if(x1>x0){const x=x1+0.5;sbox(B,x,0.8,z,0.86,1.6,0.72,hex(0x1650b0));sbox(B,x-0.12,0.98,z+f*0.365,0.5,1.0,0.02,[1,1,1],true,TUV[28]);sbox(B,x+0.28,0.9,z+f*0.365,0.14,0.5,0.02,[0.85,0.85,0.9]);
  sbox(B,x,1.5,z+f*0.37,0.8,0.14,0.02,[1,0.35,0.3],true);sbox(B,x,0.22,z+f*0.37,0.6,0.14,0.02,DARK);}}
/* Club Flamingo's DJ booth: a curved front in pink, two turntables and a mixer, a neon strip, crates of records */
function a1DJ(B,cx,cz,n,back){const w=n-0.1,z=cz,f=back<0?1:-1;
 sbox(B,cx,0.5,z+f*0.2,w,1.0,0.5,hex(0x2a1030));sbox(B,cx,0.52,z+f*0.46,w,0.9,0.02,hex(0xe0459a));sbox(B,cx,0.78,z+f*0.475,w-0.1,0.05,0.02,[1,0.4,0.8],true);sbox(B,cx,0.2,z+f*0.475,w-0.1,0.05,0.02,[0.3,0.9,1],true);
 sbox(B,cx,1.02,z,w,0.06,0.8,hex(0x141018));
 for(const o of [-0.9,0.9]){const x=cx+o;sbox(B,x,1.07,z,0.5,0.04,0.42,hex(0x2a2a30));sbox(B,x,1.1,z,0.36,0.02,0.36,DARK);sbox(B,x,1.112,z,0.08,0.01,0.08,[1,0.3,0.6],true);sbox(B,x+0.17,1.12,z-0.12,0.03,0.02,0.22,S_CHROME);}
 sbox(B,cx,1.08,z,0.4,0.05,0.34,hex(0x30303a));for(let k=0;k<4;k++)sbox(B,cx-0.12+k*0.08,1.11,z,0.025,0.02,0.2,[0.3+k*0.2,0.9,1-k*0.15],true);
 sbox(B,cx-w/2+0.25,0.2,z-f*0.25,0.4,0.4,0.36,hex(0x2a2018));sbox(B,cx+w/2-0.25,0.2,z-f*0.25,0.4,0.4,0.36,hex(0x2a2018));}

/* ---- inside: the small things that say what each room is ---- */
function a1Interior(B,g){const n=g.def.name,W=g.W,cell=(x,z)=>g.furn[z*W+x];
 if(n==='MOTEL SUNSET'){
  /* the office: a bell and the register on the counter, the key board on the wall behind it */
  for(let z=0;z<g.H;z++)for(let x=0;x<W;x++){if(cell(x,z)!==7||cell(x,z-1)===7||cell(x,z+1)!==7||cell(x,z+2)===7)continue;
   if(isSolid(x-1,z)){sbox(B,x+0.5,1.0,z+0.3,0.12,0.04,0.12,GOLD);sbox(B,x+0.5,1.06,z+0.3,0.05,0.04,0.05,GOLD);sbox(B,x+0.55,1.06,z+0.75,0.3,0.14,0.26,hex(0x3a3a44));
    sbox(B,x+0.03,1.5,z+0.6,0.04,0.6,0.8,hex(0x6b3a1a));for(let r=0;r<3;r++)for(let c=0;c<4;c++)sbox(B,x+0.06,1.68-r*0.18,z+0.3+c*0.18,0.02,0.06,0.03,GOLD);}}
  /* room numbers on the guest-room doors along the walkway */
  let num=10;for(const d of g.doors){if(d.front||Math.abs(d.base)>0.1)continue;if(d.hz>9)continue;num++;const zf=Math.floor(d.hz)+1.02;sbox(B,d.hx+1.4,1.45,zf,0.34,0.2,0.02,hex(0x14141a));neonText(B,String(num),d.hx+1.4,1.45,zf+0.015,0.024,[1,0.75,0.3]);}}
 else if(n==='CLUB FLAMINGO'){
  /* the bar: a back shelf of lit bottles over the counter and a neon BAR sign; the coat check by the front doors */
  for(let z=0;z<g.H;z++)for(let x=0;x<W;x++){if(cell(x,z)===2&&isSolid(x,z-1)){sbox(B,x+0.5,1.45,z+0.08,1,0.04,0.16,hex(0x3a2214));sbox(B,x+0.5,1.75,z+0.08,1,0.04,0.16,hex(0x3a2214));
    for(let k=0;k<4;k++)sbox(B,x+0.2+k*0.2,1.58+((x+k)%2)*0.3,z+0.1,0.06,0.2,0.06,[[0.3,0.8,0.4],[0.9,0.6,0.2],[0.6,0.3,0.9],[0.9,0.9,0.95]][(x+k)%4],true);}
   if(cell(x,z)===2&&cell(x+1,z)===2&&cell(x-1,z)!==2&&isSolid(x,z-1))neonText(B,'BAR',x+3,2.1,z+0.06,0.05,[0.3,0.95,1]);
   if(cell(x,z)===7&&cell(x+1,z)===7&&g.front&&z===g.front.zT-2){sbox(B,x+1,1.3,z+0.45,0.9,0.26,0.04,hex(0x14141a));neonText(B,'COATS',x+1,1.3,z+0.475,0.03,[1,0.6,0.85]);}}}
 else if(n==='CORAL TOWER LOBBY'){
  /* gold CORAL TOWER over the elevators, a directory board beside them */
  for(let x=0;x<W;x++)if(g.rows[2]&&g.rows[2][x]==='e'&&g.rows[2][x+1]==='e'&&g.rows[2][x+2]==='e'&&g.rows[2][x-1]!=='e'){goldText(B,'CORAL TOWER',x+1.5,1.95,2,0.035);
   sbox(B,x-0.6,1.1,2.04,0.6,0.8,0.04,hex(0x1a1a20));for(let r=0;r<6;r++)sbox(B,x-0.6,1.38-r*0.1,2.065,0.46,0.03,0.01,[0.9,0.85,0.6],true);}}}
