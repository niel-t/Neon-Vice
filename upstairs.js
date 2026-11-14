'use strict';
/* BISCAYNE GALLERIA, LEVEL 2: ride either escalator up from the food court onto a balcony around the atrium opening.
   Three shops along the back, each hooked into the game rather than just for show:
     CRAZY RAY'S ELECTRONICS (west)  gadgets you own for good: a pager (a third side job on offer), a car phone (order from Nine
                                      from the car menu anywhere) and a police scanner (guards within 9 m always show on the radar)
     STARLITE ZONE (middle)           the arcade: QUICKDRAW '86, a duel cabinet you play for cash prizes; regulars to chat with
     DOC FEELGOOD'S (east)            medicine for your next job, used up when you get paid: painkillers (+1 hit),
                                      an adrenaline shot (move 10% faster), smelling salts (once, a fatal hit leaves you on your last hit)
   The shop screens are the mall's shared #sStore screen (MALL_SHOPS elec / clinic / arcade in mall.js); QUICKDRAW has its own screen.
   The hub map is HUBS.mall2 in index.html; map cell (x,z) is world (x+1,z+1). The food court is drawn far below through the opening.
   Loaded after streets.js, before the main inline script: nothing here touches main-script globals or WebGL at load time. */
const UP2_GEAR={pager:{name:'SKYPAGE PAGER',price:3000,desc:'Beeps when there is work. A third side job on offer every time.'},
 phone:{name:'BRICK CAR PHONE',price:8000,desc:'Call Nine from your car menu, anywhere, and order guns by phone.'},
 scanner:{name:'POLICE SCANNER',price:12000,desc:'Guards within 9 metres always show on your radar on a job.'}};
const UP2_MEDS={pk:{name:'PAINKILLERS',price:1500,desc:'Take one extra hit on your next job.'},
 adr:{name:'ADRENALINE SHOT',price:2500,desc:'Move 10% faster on your next job.'},
 salts:{name:'SMELLING SALTS',price:5000,desc:'Once on your next job, a fatal hit leaves you on your last hit.'}};
const UP2_ESC=[19.0,27.0],UP2_Y=-3.4,UP2_DZ=4;/* escalator centres (map x); the food court floor below; mall old-layout z = level 2 map z + UP2_DZ */
const UP2_CABS=[16.4,17.8,19.2,20.6,22.0,23.4,24.8,26.2,27.6].map((x,i)=>({x,z:1.5,a:0,qd:i===4})).concat([[17.6,5.0],[19.0,5.0],[25.2,5.0],[26.6,5.0]].map(([x,z],i)=>({x,z,a:0,qd:i===2})));
const UP2_GAMES=["NEON VIPER","CRYSTAL CRUSH","SKY ACE","LASER LIZARD","QUICKDRAW '86","DISCO DUEL","ROBO BOXER","GATOR GRID","MIAMI MAYHEM","TURBO TIDE","SPACE SALSA","QUICKDRAW '86","PIXEL PIRANHA"];
function hasGear(k){try{const p=myProg();return !!(p&&p.gear&&p.gear[k]);}catch(e){return false;}}

/* ---------- setup ---------- */
function up2Setup(g){const O=1,W=g.W,H=g.H;g.up2={keepers:[],T:0};
 /* the loader's padding ring along the bottom would be a wall in front of the windows: flatten it; the opening has no lid */
 for(let x=0;x<W;x++){const i=(H-1)*W+x;g.wh[i]=0.02;g.wallT[i]=g.topT[i]=38;g.glow[i]=0;}
 for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(g.rows[z]&&g.rows[z][x]==='o'){const i=z*W+x;g.topT[i]=0;if(g.topX)g.topX[i]=0;}
 const S=g.solids=g.solids||[],R=(x,z,w,d)=>S.push({x:x+O,z:z+O,w,d});
 /* electronics: counter, TV wall, shelves, the display island */
 R(7,6.0,5.0,0.7);R(7,1.35,11.0,0.6);R(1.45,5,0.6,6.0);R(13.55,5,0.6,6.0);R(10.6,7.7,1.6,0.9);
 /* arcade: cabinets, the air hockey table, Starla's token booth */
 for(const c of UP2_CABS)R(c.x,c.z,0.9,0.85);R(22.0,5.2,2.2,1.2);R(27.6,7.5,2.2,0.7);
 /* clinic: counter, shelves, the exam bed, waiting chairs */
 R(37,6.0,5.0,0.7);R(37,1.35,9.0,0.6);R(42.2,3.2,1.0,2.1);R(31.55,5,0.6,4.0);
 /* balcony: planters and benches */
 for(const [x,z] of UP2_PLANTERS)R(x,z,1.2,1.2);
 /* the keepers (placeholder faces until real ones come) */
 for(const [shop,x,z] of [['elec',7,5.25],['clinic',37,5.25],['arcade',27.6,6.75]]){const s=MALL_SHOPS[shop],n=makeChar(x+O,z+O,mallLook(s.npc),false);
  Object.assign(n,{kind:s.npc,state:'idle',a:0,a0:0,r:0.3,shop,said:false});n.body=n.look.body;g.npcs.push(n);g.up2.keepers.push(n);g.lights.push({x:x+O,y:2.1,z:z+O+1.2,r:3.4,c:[1.2,1.08,0.95]});}
 /* the regulars: kids at the cabinets, browsers, a patient waiting, people at the rail looking down */
 up2Lines();
 const add=(kind,x,z,a,seat)=>{const n=makeChar(x+O,z+O,NPCLOOK.guest(),false);Object.assign(n,{kind,state:'idle',a,a0:a,r:0.3,said:false});if(seat)Object.assign(n,{seat:true,seatK:1,y:SEAT_Y});n.body=n.look.body;g.npcs.push(n);};
 for(const i of [0,2,6,8])add('gamer',UP2_CABS[i].x,UP2_CABS[i].z+0.85,Math.PI);add('gamer',UP2_CABS[10].x,5.85,Math.PI);
 add('browser',3.2,3.0,Math.PI);add('browser',10.6,8.55,Math.PI);add('patient',31.95,4.2,Math.PI/2,true);
 add('gazer',16.5,11.5,0);add('gazer',23.2,11.5,0);add('gazer',22.0,21.4,Math.PI);add('gazer',9.0,15.0,Math.PI/2);
 g.lights.push({x:8,y:2.6,z:5,r:6,c:[0.5,1.0,1.3]},{x:23,y:2.6,z:4.5,r:7,c:[1.1,0.4,1.3]},{x:38,y:2.6,z:5,r:6,c:[0.75,1.25,0.85]},
  {x:23.5,y:2.8,z:12,r:7,c:[1.1,0.95,0.85]},{x:8,y:2.6,z:17,r:6,c:[1.0,0.85,0.95]},{x:38,y:2.6,z:17,r:6,c:[1.0,0.85,0.95]},{x:23.5,y:2.8,z:23,r:7,c:[0.95,0.85,1.0]});
 g.obj='ELECTRONICS · ARCADE · CLINIC · RIDE DOWN TO LEAVE';
 if(typeof buildStatic==='function'&&g.staticB)buildStatic(g);}
const UP2_PLANTERS=[[4.5,13.5],[10.5,18.5],[34.5,13.5],[40.5,18.5]];
function up2Lines(){if(typeof NPC_CHAT!=='object'||NPC_CHAT.gamer)return;
 NPC_CHAT.gamer=["Shh. I'm on the last level.","Quickdraw's rigged. The jackpot's real though.","My high score's on the board. Third from the top. That's me.","Got a quarter? Twenty bucks? Same thing in here."];
 NPC_CHAT.browser=["Forty inches. FORTY. My wife's gonna kill me.","A phone in your car. Who are you gonna call, your car?","Ray says the scanner picks up the cops. Ray says a lot of things."];
 NPC_CHAT.patient=["Doc's running late. Doc's always running late.","Don't ask what I'm in for.","I fell. On a guy. Who had a knife."];
 NPC_CHAT.gazer=["You can see the whole food court from up here.","Best view in the mall. Free, too.","They say the second floor's gonna have a cinema next year."];}

/* ---------- interaction ---------- */
function up2Targets(g,t){const O=1;for(const n of g.up2.keepers){const s=MALL_SHOPS[n.shop];t.push({k:'shop',shop:n.shop,x:n.x,z:n.z,r:2.7,lbl:'TALK TO '+s.short+' · '+s.what});}
 for(const c of UP2_CABS)if(c.qd)t.push({k:'arcade',fn:()=>openArcade(),x:c.x+O,z:c.z+O+0.9,r:1.3,lbl:"PLAY QUICKDRAW '86 · $20"});
 UP2_ESC.forEach((ex,i)=>t.push({k:'down',fn:()=>mallRide('down',i),x:ex+O,z:12.5+O,r:1.2,lbl:'RIDE DOWN · FOOD COURT · YOUR CAR'}));}
/* both ways on the escalators: a fade and the other floor, you step off at the other end of the same escalator */
function mallRide(dir,i){const g=G;if(!g||g.hubDone||(typeof fading!=='undefined'&&fading))return;sfx('blip');
 g.hubDone=fadeTo(()=>{loadHub(dir==='up'?'mall2':'mall');const h=G,p=h.player;if(!p)return;
  if(dir==='up'){p.x=UP2_ESC[i]+1;p.z=12.5+1;}else{p.x=MALL_ESC[i]+1;p.z=25.5+1+MALL_DZ;}p.a=0;p.vx=p.vz=0;if(h.cam){h.cam.x=p.x;h.cam.z=p.z-1;}
  banner(dir==='up'?'LEVEL 2':MALL_NAME,dir==='up'?"Crazy Ray's · Starlite Zone · Doc Feelgood's":'Food court · shops · Victory Motors');});}
function up2Render(mode,p,sec){let n=0;sec('stCars',1);sec('stGold',0);sec('stHome',0);
 if(mode==='elec'){const gr=p.gear||{};$('stCarsH').textContent='GADGETS · YOURS FOR GOOD';
  $('stCars').innerHTML=Object.keys(UP2_GEAR).map(k=>{const it=UP2_GEAR[k];return mallCard(`data-gear="${k}"`,it.name,it.desc,gr[k]?'YOURS':'BUY $'+fmt(it.price),!!gr[k],false,n++);}).join('');}
 else if(mode==='clinic'){const m=p.meds||{};$('stCarsH').textContent='FOR YOUR NEXT JOB · USED UP WHEN YOU GET PAID';
  $('stCars').innerHTML=Object.keys(UP2_MEDS).map(k=>{const it=UP2_MEDS[k];return mallCard(`data-med="${k}"`,it.name,it.desc,m[k]?'IN YOUR POCKET':'BUY $'+fmt(it.price),!!m[k],false,n++);}).join('');}
 else{const a=p.arcade||{};$('stCarsH').textContent="QUICKDRAW '86 · YOUR BEST "+(a.best?a.best+' MS':'· NOT YET')+(a.won?' · WON $'+fmt(a.won):'');
  $('stCars').innerHTML=mallCard('data-arc="play"',"QUICKDRAW '86","Five duels. Fire the moment the screen says DRAW. Average under 250 ms wins the $1,000 jackpot, under 320 ms $200, under 400 ms $50.",'PLAY · $20 A GAME',false,false,n++);}}
function buyGear(k){const p=myProg(),it=UP2_GEAR[k];if(!it)return;p.gear=p.gear||{};if(p.gear[k])return renderStore('Already yours.');
 if(p.wallet<it.price)return mallPoor();p.wallet-=it.price;p.gear[k]=1;saveProg();sfx('cash');mallSay(pick(MALL_SHOPS.elec.sold));
 renderStore(it.name+': '+(k==='phone'?'look for CAR PHONE on your car menu.':k==='pager'?'a third side job on offer from now on.':'guards near you show on the radar.'));}
function buyMed(k){const p=myProg(),it=UP2_MEDS[k];if(!it)return;p.meds=p.meds||{};if(p.meds[k])return renderStore('Already in your pocket for the next job.');
 if(p.wallet<it.price)return mallPoor();p.wallet-=it.price;p.meds[k]=1;saveProg();sfx('cash');mallSay(pick(MALL_SHOPS.clinic.sold));renderStore(it.name+': ready for your next job.');}
function arcadeCard(k){if(k!=='play')return;state='play';show(null);storeMode='shop';openArcade();}
/* Doc's medicine: on for the whole next job (a retry or the next stage keeps it), gone once you are paid */
function medsApply(g,p){let m;try{m=myProg().meds;}catch(e){return;}if(!m||!g||g.def.hub)return;const on=[];
 if(m.pk){p.maxhp+=1;p.hp+=1;on.push('+1 HIT');}if(m.adr){g.adren=1;on.push('ADRENALINE');}if(m.salts){g.salts=1;on.push('SMELLING SALTS');}
 if(on.length){g.medsOn=1;if(typeof popup==='function')popup(p.x,p.z,"DOC'S MEDS · "+on.join(' · '),'#7dff9a');}}
function medsUsed(p){if(G&&G.medsOn&&p&&p.meds)p.meds={};}

/* ---------- drawing ---------- */
/* a batch that draws everything UP2_Y lower: the food court seen through the opening */
function up2Below(B){return{box:(m,c,em,uv)=>{const q=m.slice?m.slice():Array.from(m);q[7]+=UP2_Y;B.box(q,c,em,uv);},quad:(P,nx,ny,nz,uv,c)=>B.quad(P.map(v=>[v[0],v[1]+UP2_Y,v[2]]),nx,ny,nz,uv,c)};}
function drawUp2Static(B,g){const O=1,W=g.W,H=g.H,bx=(x,y,z,sx,sy,sz,c,em,ry)=>B.box(TRS(x+O,y,z+O,ry||0,sx,sy,sz),c,!!em),
  PINK=[1,0.3,0.75],CYAN=[0.2,0.9,1],GOLDC=[1,0.8,0.3],WH=[0.95,0.95,0.97],CH=[0.78,0.8,0.84],DK=[0.1,0.09,0.12],GREEN=[0.4,1,0.55],at=(x,z)=>g.rows[z]&&g.rows[z][x];
 const r0=B.round;B.round=0;
 /* ===== through the opening: the food court one floor down ===== */
 {const L=up2Below(B),isO=(x,z)=>at(x,z)==='o',near=(x,z)=>{for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)if(isO(x+dx,z+dz))return true;return false;};
  for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(near(x,z)){const X=x+O,Z=z+O;L.quad([[X,0,Z+1],[X+1,0,Z+1],[X+1,0,Z],[X,0,Z]],0,1,0,TUV[61],[0.82,0.78,0.8]);}
  drawMallTables(L,O,O-UP2_DZ);
  /* the diners, seen from above: shoulders and heads */
  const cols=[[1,0.45,0.7],[0.3,0.85,0.9],[1,1,1],[1,0.85,0.3],[0.6,0.5,0.9]];
  MALL_DINERS.forEach(([ti,ci],k)=>{const [tx,tz]=MALL_TABLES[ti],[dx,dz]=MALL_CHAIRS[ci],x=tx+dx,z=tz+dz-UP2_DZ;L.box(TRS(x+O,0.75,z+O,0,0.42,0.5,0.3),cols[k%cols.length]);L.box(TRS(x+O,1.12,z+O,0,0.22,0.24,0.22),[0.85,0.62,0.45]);L.box(TRS(x+O,1.25,z+O,0,0.24,0.08,0.24),[0.15,0.1,0.08]);});
  /* the slab around the opening: a white edge, then the shopfronts of the floor below glowing under it */
  for(let z=0;z<H;z++)for(let x=0;x<W;x++){if(!isO(x,z))continue;const X=x+O,Z=z+O;
   for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){if(isO(x+dx,z+dz))continue;const ex=X+0.5+dx*0.5,ez=Z+0.5+dz*0.5,lw=dx?0.06:1,ld=dz?0.06:1;
    B.box(TRS(ex-dx*0.03,-0.22,ez-dz*0.03,0,lw,0.44,ld),WH);B.box(TRS(ex-dx*0.03,-0.46,ez-dz*0.03,0,lw,0.04,ld),PINK,true);
    B.box(TRS(ex,(UP2_Y-0.5)/2,ez,0,lw,-UP2_Y-0.5,ld),[0.16,0.12,0.2]);if((x+z)%3===0)B.box(TRS(ex-dx*0.04,UP2_Y+1.3,ez-dz*0.04,0,dx?0.02:0.8,1.4,dz?0.02:0.8),[0.5,0.75,0.95],true);}}}
 /* ===== the escalators coming up through the opening ===== */
 for(const ex of UP2_ESC){const zt=13.0,zs=zt+7,yb=UP2_Y,L2=zs-zt,an=Math.atan2(-yb,L2),hl=Math.hypot(L2,yb);
  B.box(A.mul(A.mul(A.T(ex+O,yb/2-0.25,(zs+zt)/2+O),A.RX(an)),A.S(1.5,0.5,hl)),[0.86,0.86,0.9]);
  for(const s of [-1,1]){B.box(A.mul(A.mul(A.T(ex+O+s*0.72,yb/2+0.35,(zs+zt)/2+O),A.RX(an)),A.S(0.08,0.9,hl)),[0.55,0.75,0.85]);B.box(A.mul(A.mul(A.T(ex+O+s*0.72,yb/2+0.84,(zs+zt)/2+O),A.RX(an)),A.S(0.12,0.07,hl+0.3)),DK);}
  bx(ex,0.01,12.55,1.5,0.02,0.9,[0.5,0.5,0.55]);bx(ex,0.02,12.2,1.3,0.012,0.06,GOLDC,true);}
 /* ===== glass: shopfronts and south windows (H) and the balustrade round the opening (r) ===== */
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){const c=at(x,z);if(c!=='H'&&c!=='r')continue;const tall=c==='H'?2.6:1.05,ew=at(x-1,z)===c||at(x+1,z)===c,cx=x+0.5,cz=z+0.5;
  if(ew){bx(cx,tall,cz,1.0,0.08,0.12,CH);bx(x,tall/2+0.16,cz,0.06,tall-0.32,0.06,CH);bx(cx,0.36,cz,0.98,0.02,0.04,[0.55,0.8,0.92],true);bx(cx,tall-0.06,cz,0.98,0.02,0.04,[0.55,0.8,0.92],true);B.box(A.mul(A.mul(A.T(cx-0.12+O,(tall+0.32)/2,cz+O),A.RZ(0.9)),A.S(Math.min(0.5,tall*0.4),0.015,0.015)),[0.4,0.6,0.66],true);}
  else{bx(cx,tall,cz,0.12,0.08,1.0,CH);bx(cx,tall/2+0.16,z,0.06,tall-0.32,0.06,CH);bx(cx,0.36,cz,0.04,0.02,0.98,[0.55,0.8,0.92],true);bx(cx,tall-0.06,cz,0.04,0.02,0.98,[0.55,0.8,0.92],true);}}
 /* ===== CRAZY RAY'S ELECTRONICS ===== */
 mallSign(B,7+O,2.95,10.12+O,["CRAZY RAY'S",'ELECTRONICS'],CYAN,0.32,PINK);
 {bx(7,0.48,6.0,5.0,0.96,0.7,[0.14,0.14,0.18]);bx(7,0.98,6.0,5.06,0.05,0.76,[0.35,0.35,0.4]);bx(7,0.6,6.36,4.9,0.04,0.01,CYAN,true);bx(5.4,1.12,6.0,0.4,0.22,0.3,[0.2,0.2,0.24]);bx(5.4,1.15,6.16,0.32,0.12,0.01,[0.3,1,0.5],true);
  /* the TV wall: twelve sets on a black rack, each on its own channel */
  bx(7,1.5,1.3,11,3.0,0.5,[0.08,0.08,0.1]);
  for(let r=0;r<3;r++)for(let c=0;c<5;c++){const x=2.8+c*2.1,y=0.75+r*0.95;bx(x,y,1.6,1.7,0.8,0.15,[0.16,0.14,0.16]);}
  /* shelves of VCRs and boomboxes along the side walls */
  for(const sx of [1.45,13.55])for(let i=0;i<4;i++){bx(sx,0.35+i*0.55,5,0.55,0.04,6.0,CH);for(let k=0;k<6;k++)bx(sx,0.48+i*0.55,2.5+k*1.0,0.42,0.2,0.62,[[0.1,0.1,0.12],[0.75,0.75,0.78],[0.15,0.12,0.12]][(i+k)%3]);}
  /* the display island: a car phone in its bag, pagers on a card, the scanner with its aerial */
  bx(10.6,0.45,7.7,1.6,0.9,0.9,WH);bx(10.6,0.92,7.7,1.62,0.04,0.92,[0.2,0.2,0.24]);bx(10.2,1.0,7.6,0.36,0.12,0.18,[0.12,0.1,0.1]);bx(10.15,1.08,7.6,0.08,0.18,0.06,[0.15,0.15,0.17]);
  for(let i=0;i<3;i++)bx(10.75+i*0.16,0.98,7.5,0.1,0.04,0.14,[0.15,0.15,0.18]);bx(11.0,1.0,7.9,0.3,0.1,0.2,[0.25,0.25,0.28]);bx(11.1,1.25,7.9,0.015,0.4,0.015,CH);
  mallWord(B,'SALE',7+O,2.45,1.03+O,0.26,[1,0.2,0.3]);}
 /* ===== STARLITE ZONE ===== */
 mallSign(B,22+O,2.95,10.12+O,['STARLITE ZONE'],[0.8,0.65,1],0.42,CYAN);
 {UP2_CABS.forEach((c,i)=>{const col=[[1,0.3,0.75],[0.2,0.9,1],[1,0.8,0.3],[0.5,1,0.5],[0.8,0.5,1]][i%5];
   bx(c.x,0.85,c.z,0.82,1.7,0.78,[0.07,0.06,0.1]);for(const s of [-1,1])bx(c.x+s*0.415,0.85,c.z,0.01,1.6,0.74,col.map(v=>v*0.7));
   bx(c.x,0.95,c.z+0.4,0.7,0.12,0.22,[0.16,0.16,0.2]);bx(c.x-0.12,1.03,c.z+0.42,0.05,0.08,0.05,[1,0.2,0.2]);bx(c.x+0.12,1.02,c.z+0.42,0.07,0.03,0.07,[0.9,0.9,0.2]);
   bx(c.x,1.95,c.z+0.36,0.78,0.22,0.04,c.qd?[1.2,0.9,0.3]:col,true);mallWord(B,UP2_GAMES[i].replace("'",''),c.x+O,1.9,c.z+0.39+O,0.055,[0.1,0.05,0.12]);});
  /* the air hockey table, the prize shelf and Starla's token booth */
  bx(22,0.42,5.2,2.2,0.84,1.2,[0.1,0.25,0.6]);bx(22,0.86,5.2,2.1,0.04,1.1,[0.75,0.9,1.0]);bx(22,0.89,5.2,0.02,0.005,1.0,[1,0.3,0.4],true);for(const s of [-1,1])bx(22+s*0.8,0.92,5.2,0.14,0.04,0.14,[1,0.2,0.3]);
  bx(27.6,0.5,7.5,2.2,1.0,0.7,[0.25,0.1,0.35]);bx(27.6,1.02,7.5,2.26,0.05,0.76,[0.8,0.5,1]);bx(27.6,0.7,7.86,2.1,0.05,0.01,[1,0.85,0.3],true);bx(26.9,1.15,7.4,0.3,0.22,0.25,[0.75,0.75,0.78]);
  bx(28.9,1.3,5.2,0.5,2.6,2.6,[0.2,0.08,0.26]);for(let i=0;i<4;i++)for(let k=0;k<3;k++)bx(28.62,0.6+i*0.55,4.4+k*0.8,0.1,0.24,0.24,[[1,0.4,0.7],[0.3,0.9,1],[1,0.9,0.3],[0.6,1,0.5]][(i+k)%4]);
  /* stars on the ceiling-high back wall */
  for(let i=0;i<14;i++){const x=15.6+((i*37)%140)/10,y=2.3+((i*13)%7)/10;bx(x,y,1.06,0.08,0.08,0.02,[1.2,1.15,0.9],true,0.78);}}
 /* ===== DOC FEELGOOD'S ===== */
 mallSign(B,37+O,2.95,10.12+O,["DOC FEELGOOD'S",'PHARMACY'],GREEN,0.3,[1,1,1]);
 {bx(37,0.48,6.0,5.0,0.96,0.7,WH);bx(37,0.98,6.0,5.06,0.05,0.76,[0.6,0.85,0.7]);bx(37,0.6,6.36,4.9,0.04,0.01,GREEN,true);bx(38.6,1.1,6.0,0.36,0.2,0.3,[0.75,0.75,0.78]);
  /* the shelves of pill bottles and the green neon cross */
  bx(37,1.3,1.3,9,2.6,0.5,[0.92,0.94,0.92]);for(let i=0;i<4;i++){bx(37,0.4+i*0.55,1.55,8.8,0.04,0.3,CH);for(let k=0;k<18;k++)bx(32.9+k*0.48,0.5+i*0.55,1.55,0.14,0.16+((k+i)%3)*0.04,0.14,[[1,0.6,0.2],[1,1,1],[0.5,0.8,1],[1,0.4,0.5]][(k+i)%4]);}
  bx(37,2.75,1.07,0.9,0.3,0.03,GREEN,true);bx(37,2.75,1.07,0.3,0.9,0.03,GREEN,true);
  /* the exam bed behind a curtain, the waiting chairs */
  bx(42.2,0.4,3.2,0.9,0.1,2.0,[0.85,0.95,0.9]);bx(42.2,0.2,3.2,0.8,0.4,1.9,CH);bx(42.2,0.5,2.35,0.7,0.1,0.3,WH);bx(41.4,2.2,3.2,0.02,0.02,2.6,CH);bx(41.4,1.25,4.3,0.02,1.9,0.5,[0.55,0.85,0.7]);
  for(let i=0;i<4;i++){const z=3.4+i*0.8;bx(31.55,0.44,z,0.5,0.06,0.5,[0.4,0.75,0.6]);bx(31.33,0.7,z,0.06,0.5,0.5,[0.4,0.75,0.6]);for(const s of [-0.2,0.2])bx(31.55,0.21,z+s,0.04,0.42,0.04,CH);}
  bx(34,0.3,7.6,0.5,0.6,0.5,[0.3,0.6,0.35]);drawPalm(B,34+O,7.6+O,false,3.3);}
 /* ===== the balcony: planters, benches, lamps, the level directory ===== */
 for(const [x,z] of UP2_PLANTERS){bx(x,0.3,z,1.2,0.6,1.2,[0.9,0.88,0.84]);bx(x,0.61,z,1.1,0.02,1.1,[0.32,0.22,0.12]);drawPalm(B,x+O,z+O,true,x+z);}
 for(const [x,z,ry] of [[7.5,13.0,0],[37.5,13.0,0],[7.5,22.6,Math.PI],[37.5,22.6,Math.PI]]){const c=Math.cos(ry),s=Math.sin(ry),P=(dx,y,dz,sx,sy,sz,col)=>B.box(TRS(x+O+dx*c+dz*s,y,z+O-dx*s+dz*c,ry,sx,sy,sz),col);
  P(0,0.42,0,1.5,0.06,0.44,[0.85,0.1,0.16]);P(0,0.66,-0.2,1.5,0.32,0.05,[0.85,0.1,0.16]);for(const sx of [-0.65,0.65])P(sx,0.21,0,0.05,0.42,0.4,CH);}
 for(const [x,z] of [[2.5,21.5],[42.5,21.5],[12.5,11],[32.5,11]]){bx(x,0.05,z,0.3,0.1,0.3,CH);bx(x,1.3,z,0.07,2.5,0.07,WH);bx(x,2.62,z,0.26,0.26,0.26,[1.2,1.15,1.0],true);}
 bx(22.5,0.8,22.6,0.12,1.6,0.12,CH);bx(22.5,1.35,22.55,1.6,1.2,0.06,DK);bx(22.5,1.83,22.5,1.4,0.12,0.02,PINK,true);
 [CYAN,[0.8,0.65,1],GREEN].forEach((c,i)=>bx(22.5,1.6-i*0.22,22.5,1.2,0.1,0.02,c,true));
 B.round=r0;}
/* per frame: the escalator steps, the TV wall's channels, the arcade screens */
function drawUp2(B,g){const O=1,T=g.T||0,bl=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x+O,y,z+O,0,sx,sy,sz),c,!!em);
 for(const ex of UP2_ESC){const zt=13.0,L=7,n=14,off=(T*0.35)%1;for(let i=0;i<n;i++){const u=(i+off)/n,y=UP2_Y*(1-u),z=zt+L*(1-u);bl(ex,y+0.02,z,1.3,0.04,0.36,[0.25,0.25,0.28]);bl(ex,y+0.045,z-0.16,1.3,0.012,0.03,[1,0.85,0.2],true);}}
 const CHN=[[0.3,0.6,1],[1,0.4,0.7],[0.4,1,0.5],[1,0.9,0.4],[0.9,0.9,1],[0.6,0.4,1]];
 for(let r=0;r<3;r++)for(let c=0;c<5;c++){const k=Math.floor(T*0.7+r*2+c*3+((r*5+c)%4)*0.3),col=CHN[k%CHN.length];bl(2.8+c*2.1,0.75+r*0.95,1.69,1.5,0.66,0.02,col,true);}
 UP2_CABS.forEach((cb,i)=>{const f=0.75+0.25*Math.sin(T*(2+i%3)+i),col=cb.qd?[1.1*f,0.55*f,0.25*f]:[[0.4,0.6,1],[1,0.4,0.8],[0.4,1,0.6]][i%3].map(v=>v*f);
  B.box(A.mul(A.mul(A.T(cb.x+O,1.45,cb.z+O+0.37),A.RX(-0.25)),A.S(0.6,0.48,0.02)),col,true);});}

/* ---------- QUICKDRAW '86: the duel cabinet ---------- */
const QD={phase:'title',round:0,times:[],t0:0,at:0,msg:'',prize:0,raf:0,pad:{}};
const QD_ROUNDS=5,QD_PRIZES=[[250,1000,'JACKPOT!'],[320,200,'SHARPSHOOTER'],[400,50,'NOT BAD']];
function qdEnsure(){if(document.getElementById('sArcade'))return;const d=document.createElement('div');d.id='sArcade';d.className='screen dim';
 d.innerHTML='<canvas id="qdCv" width="640" height="400" style="max-width:96vw;max-height:70vh;border:3px solid #c9b6f2;box-shadow:0 0 24px #ff6fae;image-rendering:pixelated;touch-action:none"></canvas><div class="hint" id="qdHint" style="margin-top:8px"></div><button class="btn alt" id="qdLeave" style="margin-top:8px">LEAVE THE CABINET<span class="kbhint"> (ESC)</span><span class="padhint"> (B)</span></button>';
 document.body.appendChild(d);if(typeof SCREENS!=='undefined'&&!SCREENS.includes('sArcade'))SCREENS.push('sArcade');
 document.getElementById('qdCv').addEventListener('pointerdown',e=>{e.preventDefault();qdFire();});
 document.getElementById('qdLeave').addEventListener('click',()=>closeArcade());
 window.addEventListener('keydown',e=>{if(state!=='arcade')return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;const c=e.code;
  if(c==='Escape'||c==='Backspace')closeArcade();else if(c==='Space'||c==='Enter'||c==='KeyE'||c==='KeyF')qdFire();},true);}
function openArcade(){if(state!=='play'||!G)return;qdEnsure();state='arcade';show('sArcade');sfx('ring');QD.phase='title';QD.msg='';QD.pad={};cancelAnimationFrame(QD.raf);QD.raf=requestAnimationFrame(qdLoop);}
function closeArcade(){if(state!=='arcade')return;cancelAnimationFrame(QD.raf);state='play';show(null);sfx('blip');const g=G;if(g&&g.up2){const n=g.up2.keepers.find(q=>q.shop==='arcade');if(n)popup(n.x,n.z,pick(MALL_SHOPS.arcade.bye),'#ffe9a8');}}
/* the one button: start a game (pays the token), shoot, or go again */
function qdFire(now){now=now===undefined?performance.now():now;const p=myProg();
 if(QD.phase==='title'||QD.phase==='over'){if(p.wallet<20){QD.msg='INSERT $20';sfx('blip');return;}p.wallet-=20;saveProg();sfx('cash');QD.round=0;QD.times=[];qdNext(now);return;}
 if(QD.phase==='ready'){QD.times.push(999);QD.msg='TOO EARLY!';QD.phase='shot';QD.at=now+900;sfx('blip');return;}
 if(QD.phase==='draw'){const rt=Math.max(1,Math.round(now-QD.t0));QD.times.push(rt);QD.msg=rt+' MS';QD.phase='shot';QD.at=now+900;sfx('shot');return;}}
function qdNext(now){if(QD.round>=QD_ROUNDS)return qdDone();QD.round++;QD.phase='ready';QD.msg='';QD.t0=now+1200+Math.random()*1800;}
function qdDone(){const p=myProg(),a=p.arcade=p.arcade||{};const avg=Math.round(QD.times.reduce((s,v)=>s+v,0)/QD.times.length);QD.avg=avg;
 const hit=QD_PRIZES.find(q=>avg<q[0]);QD.prize=hit?hit[1]:0;QD.msg=hit?hit[2]+' +$'+fmt(hit[1]):'NO PRIZE';p.wallet+=QD.prize;a.plays=(a.plays||0)+1;a.won=(a.won||0)+QD.prize;if(!a.best||avg<a.best)a.best=avg;
 saveProg();sfx(QD.prize?'cash':'blip');QD.phase='over';}
function qdTick(now){if(QD.phase==='ready'&&now>=QD.t0){QD.phase='draw';sfx('ring');}
 else if(QD.phase==='draw'&&now-QD.t0>1500){QD.times.push(1500);QD.msg='TOO SLOW!';QD.phase='shot';QD.at=now+900;}
 else if(QD.phase==='shot'&&now>=QD.at)qdNext(now);}
function qdLoop(now){if(state!=='arcade')return;qdTick(now);
 const gp=navigator.getGamepads?Array.from(navigator.getGamepads()).find(x=>x):null;if(gp){const a=!!(gp.buttons[0]&&gp.buttons[0].pressed),b=!!(gp.buttons[1]&&gp.buttons[1].pressed);if(a&&!QD.pad.a)qdFire(now);if(b&&!QD.pad.b){closeArcade();return;}QD.pad={a,b};}
 qdDraw(now);QD.raf=requestAnimationFrame(qdLoop);}
function qdDraw(now){const cv=document.getElementById('qdCv');if(!cv)return;const x=cv.getContext('2d'),W=cv.width,H=cv.height,p=myProg(),a=p.arcade||{};
 const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#1a0630');gr.addColorStop(0.55,'#ff3d8b');gr.addColorStop(0.56,'#12021e');gr.addColorStop(1,'#2a0a40');x.fillStyle=gr;x.fillRect(0,0,W,H);
 x.fillStyle='#ffd36b';x.beginPath();x.arc(W/2,H*0.55,70,Math.PI,0);x.fill();x.fillStyle='#12021e';for(let i=0;i<6;i++)x.fillRect(W/2-72,H*0.55-12-i*11,144,3+i*0.6);
 x.strokeStyle='#2de2e6';x.lineWidth=1;for(let i=0;i<10;i++){const y=H*0.56+Math.pow(i/10,2)*H*0.44;x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();}
 for(let i=-8;i<=8;i++){x.beginPath();x.moveTo(W/2+i*20,H*0.56);x.lineTo(W/2+i*120,H);x.stroke();}
 const txt=(s,X,Y,sz,c)=>{x.font='bold '+sz+'px monospace';x.textAlign='center';x.fillStyle='#000';x.fillText(s,X+3,Y+3);x.fillStyle=c;x.fillText(s,X,Y);};
 /* the outlaw: a silhouette that draws when you do */
 const drawn=QD.phase==='draw'||QD.phase==='shot';x.fillStyle=drawn?'#ff2a6a':'#40104a';const ox=W/2,oy=H*0.56;
 x.fillRect(ox-14,oy-110,28,70);x.beginPath();x.arc(ox,oy-122,14,0,7);x.fill();x.fillRect(ox-30,oy-136,60,6);x.fillRect(ox-16,oy-152,32,18);x.fillRect(ox-14,oy-40,10,40);x.fillRect(ox+4,oy-40,10,40);
 if(drawn){x.fillRect(ox+14,oy-100,34,8);x.fillRect(ox+44,oy-104,14,6);}else x.fillRect(ox+14,oy-100,8,40);
 txt("QUICKDRAW '86",W/2,40,30,'#ffd36b');
 if(QD.phase==='title')txt('INSERT TOKEN · $20 · FIRE TO PLAY',W/2,H-60,18,'#2de2e6');
 if(QD.phase==='ready')txt('READY...',W/2,H-60,30,'#ffffff');
 if(QD.phase==='draw')txt('DRAW!',W/2,H-60,48,'#ff2a6a');
 if(QD.phase==='shot'||QD.phase==='over')txt(QD.msg,W/2,H-60,QD.phase==='over'?30:36,QD.phase==='over'&&QD.prize?'#7dff9a':'#ffffff');
 if(QD.phase==='over')txt('AVERAGE '+QD.avg+' MS · FIRE TO GO AGAIN ($20)',W/2,H-24,16,'#2de2e6');
 else if(QD.phase!=='title'){txt('DUEL '+QD.round+' / '+QD_ROUNDS,W/2,H-24,16,'#c9b6f2');}
 else{if(QD.msg)txt(QD.msg,W/2,H-100,22,'#ff8a95');txt('UNDER 250 MS $1,000 · 320 MS $200 · 400 MS $50',W/2,H-24,14,'#c9b6f2');}
 x.font='bold 14px monospace';x.textAlign='left';x.fillStyle='#7dff9a';x.fillText('$'+fmt(p.wallet),12,22);x.textAlign='right';x.fillStyle='#ffd36b';x.fillText('BEST '+(a.best?a.best+' MS':'---'),W-12,22);
 const h=document.getElementById('qdHint');if(h)h.textContent=touchMode?'Tap the screen to fire':padMode?'A to fire · B to leave':'Space, Enter or click to fire · Esc to leave';}
