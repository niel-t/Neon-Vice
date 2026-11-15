'use strict';
/* ACT 4: WHEELS UP (campaign indexes 11 to 13). Conrad Vale, the banker behind Lex and Kade, is flying the Family's gold out of Miami.
   - c11 Vale Trust Garage (stages p1, p2, dock in missions.js): at the vault dock three gold vans leave one at a time down the lane to
     the exit ramp. Drop the boom barrier from its lever while a van is coming (BARRIER), or kill the driver, and the van stops. A van
     that reaches the ramp is gone and costs money; the floor still finishes once all three are stopped or gone.
   - c12 The Coral Room (one map, set up from act2Setup): Vale's pilot sits in the dining room and runs for the back dock when he sees
     you or hears a shot. Reach him for the hangar pass; if he gets away, the pass is in his locker by the dock. Frankie Lo Presti, Vale's
     head of security, holds the private dining room. Kitchen men dress as chefs, dining room men as waiters.
   - c13 Opa-locka Hangar 7 (stages apron, hangar, jet): in the hangar Vale walks from the office to his jet's stairs; the stairs open
     once he is aboard. On the jet (out on the runway) Vale fights in the cabin; at half health the jet starts rolling. Finished, open
     the fuel valve in the rear hold (VALVE) and get clear: 15 s later the jet goes up. It is a CLEAN accident if Vale was not shot.
   index.html calls in from stageIntro, updateStage, drawStage, objAction/objGrab, killEnemy, finishLevel and payout; guide.js asks
   act4Guide first. Everything here keys on the mission id, so other floors never see it. */
const isGarage=g=>!!(g&&g.stageManaged&&g.mission==='c11');
const isHangar=g=>!!(g&&g.stageManaged&&g.mission==='c13');
const A4_VAN_COST=1500,A4_CLEAN_PAY=10000,A4_FUSE=15;
function a4Cells(g,ch){const o=[];for(let z=0;z<g.H;z++)for(let x=0;x<g.W;x++)if(g.rows[z][x]===ch)o.push({x:x+0.5,z:z+0.5,ix:x,iz:z});return o;}
function a4Later(g,ms,f){setTimeout(()=>{if(G===g&&state==='play')f();},ms);}
/* cell path between two points over open floor (walls and furniture block), for the walkers (Vale, the pilot) */
function a4Path(g,sx,sz,tx,tz){const W=g.W,H=g.H,s=Math.floor(sz)*W+Math.floor(sx),t=Math.floor(tz)*W+Math.floor(tx),prev=new Int32Array(W*H).fill(-1),q=[s];prev[s]=s;
 const open=i=>!g.solid[i]&&!g.furn[i];
 for(let h=0;h<q.length&&prev[t]<0;h++){const c=q[h],x=c%W,z=c/W|0;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=W||nz>=H)continue;const n=nz*W+nx;if(prev[n]<0&&(open(n)||n===t)){prev[n]=c;q.push(n);}}}
 if(prev[t]<0)return [];const out=[];for(let c=t;c!==s;c=prev[c])out.push({x:c%W+0.5,z:(c/W|0)+0.5});return out.reverse();}
/* walk a character along a path at speed sp; returns true at the end */
function a4Walk(c,dt,sp){const P=c.path;if(!P||!P.length){c.vx=c.vz=0;return true;}const t=P[0],dx=t.x-c.x,dz=t.z-c.z,d=Math.hypot(dx,dz);
 if(d<0.12){P.shift();return !P.length;}const m=Math.min(d,sp*dt);c.x+=dx/d*m;c.z+=dz/d*m;c.vx=dx/d*sp;c.vz=dz/d*sp;c.a=Math.atan2(dx,dz);c.walk=(c.walk||0)+m*9;return false;}
/* Lex, if you spared him on the yacht, keeps helping: a call at the start of each Act 4 floor and the guide from the start (g.tip).
   If he died, his estate was banked at Vale Trust: +$2,500 on the garage floor, and Vale has two more men at the jet. */
function act4Lex(g,i){const f=typeof lexFate==='function'?lexFate():null;
 if(f==='spared'){g.tip=true;const msg=i===11?'Lex calls: "Vale\'s vans go out the east ramp. Drop the barrier."':i===12?'Lex texts: "The pilot sits by the window. He scares easy."':'Lex calls: "Tail number N86VT. The side door is open. Go."';a4Later(g,3200,()=>banner('LEX, THE SPARED',msg));}
 else if(f==='dead'&&i===11){g.score+=2500;a4Later(g,3000,()=>popup(g.player.x,g.player.z-0.5,"LEX'S SAFE DEPOSIT BOX  +$2,500",'#ffd36b'));}}
function act4Intro(g){
 if(isGarage(g)){
  if(g.sid==='p1'){banner('ACT 4: WHEELS UP','Floor 1: Vale Trust Garage · Conrad Vale is emptying his vault');act4Lex(g,11);}
  else if(g.sid==='p2')banner('P2: THE PARKING DECK','The ramp down to the vault dock is at the far end.');
  else{placeStash(g,11);vanSetup(g);banner('THE VAULT DOCK','Three gold vans are leaving. Drop the boom barrier or shoot the drivers.');}
  return true;}
 if(isHangar(g)){
  if(g.sid==='apron'){banner('FLOOR 3: OPA-LOCKA HANGAR 7','The hangar side door is at the far end of the apron.');act4Lex(g,13);}
  else if(g.sid==='hangar'){valeWalkSetup(g);banner('HANGAR 7','Vale is walking to his jet. The stairs stay up until he is aboard.');}
  else{placeStash(g,13);jetSetup(g);banner('ON THE RUNWAY','Vale is in the back of the cabin. Finish him, then make it look like an accident.');}
  return true;}
 return false;}
function act4Goal(g){if(isGarage(g))return g.sid==='dock'?null:'TAKE THE RAMP DOWN';if(isHangar(g))return g.sid==='apron'?'GET INTO THE HANGAR':g.sid==='hangar'?(g.valeW&&g.valeW.aboard?'BOARD THE JET':'GET TO THE JET'):null;return null;}
function act4Locked(g,s){return isHangar(g)&&s.id==='board'&&!(g.valeW&&g.valeW.aboard);}
function act4LockHint(g){popup(g.player.x,g.player.z,'THE STAIRS GO UP WHEN VALE IS ABOARD','#ff8a95');}
const A4_STAIR_LBL={ramp:'TAKE THE RAMP DOWN',door:'HANGAR SIDE DOOR',board:'BOARD THE JET'};

/* ---------------- floor 12: the gold vans ---------------- */
function vanSetup(g){const qs=a4Cells(g,'q').sort((a,b)=>a.x-b.x),y=a4Cells(g,'y')[0],o=a4Cells(g,'o')[0];if(!qs.length||!y||!o)return;
 g.lane={z:y.z,exit:y.x-0.7};g.boom={x:y.x-4.5,z:y.z,down:0,cd:0};g.lever={x:o.x,z:o.z};g.vanT=0;
 g.vans=qs.map((q,k)=>{const v={x:q.x,z:q.z+0.4,a:-Math.PI/2,st:'wait',go:5+k*15,sp:0,k};const e=makeEnemy(g,g.def,11,'smg',false,v.x,v.z);e.state='idle';e.driver=v;v.e=e;return v;});
 g.obj={label:'STOP THE GOLD VANS',n:0,total:g.vans.length,done:false};g.objNow=true;if(typeof buildRadar==='function')buildRadar(g);}
function vanCount(g){const st=g.vans.filter(v=>v.st==='stopped').length,gone=g.vans.filter(v=>v.st==='gone').length;g.obj.n=st+gone;
 if(!g.obj.done&&st+gone>=g.vans.length){g.obj.done=true;g.objNow=false;banner(gone?(st?st+' VANS STOPPED, '+gone+' GOT AWAY':'EVERY VAN GOT AWAY'):'ALL THREE VANS STOPPED',g.enemies.every(e=>!e.alive)?'Take the freight lift up':'Finish off Vale\'s men');}}
function vanStop(g,v,why){v.st='stopped';v.why=why;const e=v.e;if(e&&e.alive){e.driver=null;e.state='chase';e.seeT=0;if(typeof AI!=='undefined'&&g.player)AI.know(e,AI.belief.make(g.player.x,g.player.z,g.T||0,'call'));}
 g.score+=750;g.gpts=(g.gpts||0)+750;popup(v.x,v.z,(why==='boom'?'BARRIER! ':'')+'VAN STOPPED +$750','#7dff9a');sfx('crash');shake(0.35);vanCount(g);}
function vanTick(dt,g){const p=g.player;g.vanT+=dt;const B=g.boom;if(B.down>0){B.down-=dt;if(B.down<=0)B.cd=3;}else if(B.cd>0)B.cd-=dt;
 for(const v of g.vans){const e=v.e;
  if(v.st==='wait'&&(g.vanT>=v.go||!e.alive)){v.st='go';popup(v.x,v.z,'A VAN IS LEAVING','#ffd36b');sfx('blip');if(!g.vanTip){g.vanTip=1;banner('A GOLD VAN IS MOVING','Drop the barrier from the lever by the ramp, or shoot the driver');}}
  if(v.st==='go'){
   if(!e.alive){v.sp=Math.max(0,v.sp-dt*4);if(v.sp<=0.05){vanStop(g,v,'driver');continue;}}else v.sp=Math.min(2.3,v.sp+dt*1.6);
   const m=v.sp*dt;
   if(v.z<g.lane.z-0.01){v.z=Math.min(g.lane.z,v.z+m);v.a=-Math.PI/2;}
   else{const nx=v.x+m;v.a=0;
    if(B.down>0&&v.x+1.15<=B.x-0.25&&nx+1.15>B.x-0.25){v.x=B.x-1.4;vanStop(g,v,'boom');continue;}
    v.x=nx;if(v.x>=g.lane.exit){v.st='gone';if(e.alive){e.alive=false;e.sunk=true;e.driver=null;}const c=Math.min(A4_VAN_COST,Math.max(0,g.score));g.score-=c;popup(v.x-1,v.z,'A VAN GOT AWAY  -$'+fmt(c),'#ff8a95');sfx('alert');vanCount(g);continue;}}}
  if(e.alive&&e.driver===v){const ca=Math.cos(v.a),sa=-Math.sin(v.a);e.x=v.x+ca*0.55;e.z=v.z+sa*0.55;e.vx=e.vz=0;if(e.state!=='chase')e.a=Math.atan2(ca,sa);}
  /* the van is solid to the player: push out of its box (and shove when it is moving) */
  if(p&&p.alive&&v.st!=='gone'){const ca=Math.cos(v.a),sa=-Math.sin(v.a),dx=p.x-v.x,dz=p.z-v.z,lu=dx*ca+dz*sa,lw=-dx*sa+dz*ca,hl=1.15+p.r,hw=0.55+p.r;
   if(Math.abs(lu)<hl&&Math.abs(lw)<hw){const ou=hl-Math.abs(lu),ow=hw-Math.abs(lw);if(ow<ou){const s=Math.sign(lw)||1;p.x+=-sa*s*ow;p.z+=ca*s*ow;}else{const s=Math.sign(lu)||1;p.x+=ca*s*ou;p.z+=sa*s*ou;}}}}}
function boomPull(p){const g=G,L=g.lever,B=g.boom;if(!L||Math.hypot(p.x-L.x,p.z-L.z)>1.3)return false;
 if(B.down>0||B.cd>0){popup(L.x,L.z,B.down>0?'BARRIER IS DOWN':'BARRIER RESETTING','#ffd36b');return true;}
 B.down=7;sfx('door');popup(B.x,B.z,'BARRIER DOWN','#ffd36b');return true;}
function drawVan(B,v,T){const {P}=rideKit(B,v.x,v.z,1,v.a),body=[0.86,0.86,0.82],dk=[0.12,0.12,0.14],gold=[0.95,0.75,0.25],gl=[0.35,0.5,0.6];
 P(0,0.18,0,0,2.3,0.16,1.04,dk);P(-0.2,0.72,0,0,1.75,1.0,1.06,body);P(0.82,0.58,0,0,0.62,0.72,1.04,body);P(0.92,0.86,0,0,0.42,0.3,0.98,gl);
 for(const sd of [-1,1]){P(-0.2,0.64,sd*0.535,0,1.6,0.12,0.01,gold,null,1);P(0.8,0.8,sd*0.525,0,0.36,0.24,0.01,gl);for(const wx of [-0.75,0.7])P(wx,0.2,sd*0.5,0,0.44,0.4,0.12,dk);}
 P(-1.08,0.75,0,0,0.04,0.9,0.9,[0.7,0.7,0.68]);P(-1.1,0.75,0,0,0.02,0.1,0.92,gold,null,1);
 if(v.st==='go'&&Math.sin(T*10)>0)P(1.16,0.42,0,0,0.04,0.12,0.8,[1,0.95,0.7],null,1);
 if(v.st==='stopped')P(1.16,0.42,0,0,0.04,0.12,0.8,[1,0.55,0.1],null,Math.sin(T*6)>0);}
function a4DrawGarage(B,g){const bx=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x,y,z,0,sx,sy,sz),c,!!em),T=g.T||0;
 if(g.sid!=='dock'||!g.vans)return;
 {const c=g.car,st=[0.62,0.65,0.7];bx(c.x,0.95,c.z-0.45,1.6,1.9,0.08,st);bx(c.x,0.95,c.z-0.41,0.04,1.8,0.02,[0.3,0.32,0.36]);bx(c.x,2.05,c.z-0.4,0.6,0.14,0.05,g.cleared?[0.3,1,0.5]:[1,0.3,0.3],true);for(let k=0;k<4;k++)bx(c.x,0.02,c.z+0.2+k*0.12,1.4,0.01,0.05,k%2?[0.1,0.1,0.1]:[1,0.8,0.1]);}
 for(const v of g.vans)if(v.st!=='gone')drawVan(B,v,T);
 const Bm=g.boom,L=g.lever,a=Bm.down>0?0:1.35,hot=Bm.down<=0&&Bm.cd<=0;
 bx(Bm.x,0.5,Bm.z-1.15,0.3,1.0,0.3,[0.95,0.75,0.1]);bx(Bm.x,1.02,Bm.z-1.15,0.36,0.06,0.36,[0.12,0.12,0.14]);
 for(let k=0;k<13;k++){const r=0.2+k*0.18,c=(k>>1)%2?[0.95,0.95,0.95]:[0.9,0.12,0.12];bx(Bm.x,0.95+Math.sin(a)*r,Bm.z-1.15+Math.cos(a)*r,0.12,0.12,0.16,c);}
 bx(L.x,0.5,L.z,0.36,1.0,0.3,[0.3,0.32,0.36]);bx(L.x,1.05,L.z,0.2,0.1,0.2,hot?[1,0.2,0.15]:[0.3,0.1,0.1],hot&&Math.sin(T*8)>0);
 bx(g.lane.exit+0.2,0.03,g.lane.z,1.2,0.015,1.6,[0.05,0.05,0.06]);for(let k=0;k<3;k++){const on=Math.sin(T*5-k)>0;bx(g.lane.exit-1-k*0.6,0.03,g.lane.z,0.15,0.012,0.8,on?[1,0.85,0.3]:[0.4,0.32,0.1],on);}}

/* ---------------- floor 13: The Coral Room ---------------- */
const PILOT_LOOK=()=>({skin:[0.93,0.78,0.64],jacket:[0.1,0.13,0.25],shirt:[0.96,0.96,0.97],tie:[0.1,0.1,0.14],pants:[0.1,0.13,0.25],shoes:[0.06,0.06,0.07],hs:'normal',hair:[0.35,0.24,0.14],hat:'cap',hatC:[0.1,0.13,0.25],bw:1,bd:1,bh:1.02});
const FRANKIE_LOOK=()=>({skin:[0.87,0.68,0.52],jacket:[0.08,0.08,0.1],shirt:[0.55,0.1,0.14],pants:[0.08,0.08,0.1],shoes:[0.05,0.05,0.05],hs:'slick',hair:[0.12,0.1,0.09],stache:true,chain:true,watch:true,body:'big',bw:1.15,bd:1.1,bh:1.04});
function act4Rest(g){g.rest=1;const t=a4Cells(g,'t')[0],o=a4Cells(g,'o')[0],N=a4Cells(g,'N')[0],wat=a4Cells(g,'a');
 /* guards, items and walkers stand on their glyph's cell, which takes the default floor: give each the floor around it (kitchen tile,
    cellar boards, dining marble) and rebuild the static batch */
 {const W=g.W;let ch=0;for(let z=1;z<g.H-1;z++)for(let x=1;x<W-1;x++){const c=g.rows[z][x],i=z*W+x;if(g.solid[i]||g.def.legend[c]||isOut(g,x,z))continue;const n={};for(const k of [i-1,i+1,i-W,i+W])if(!g.solid[k]&&g.floorT[k]>0)n[g.floorT[k]]=(n[g.floorT[k]]||0)+1;
   let b=g.floorT[i],bn=0;for(const k in n)if(n[k]>bn){bn=n[k];b=+k;}if(b!==g.floorT[i]){g.floorT[i]=b;ch=1;}}if(ch)buildStatic(g);}
 for(const e of g.enemies){const i=Math.floor(e.z)*g.W+Math.floor(e.x);if(g.floorT[i]===44){Object.assign(e.look,{jacket:[0.96,0.96,0.95],shirt:[0.96,0.96,0.95],pants:[0.25,0.25,0.28],apron:[0.98,0.98,0.97],hat:null});e.chef=1;}
  else if(e.weapon&&!WD[e.weapon.type].melee&&!e.kind)Object.assign(e.look,{jacket:[0.08,0.08,0.1],shirt:[0.97,0.97,0.97],vest:[0.08,0.08,0.1],tie:[0.08,0.08,0.1]});}
 if(o){const e=makeEnemy(g,g.def,12,'spas12',false,o.x,o.z);Object.assign(e.look,FRANKIE_LOOK());e.body='big';e.hp=e.maxhp=6;e.r=0.34;e.spd=0.9;e.pers='careful';e.mini='frankie';g.frankie=e;}
 if(t){const n=makeChar(t.x,t.z,PILOT_LOOK(),false);n.kind='pilot';n.a=Math.PI/2;n.r=0.28;
  let best=null,bd=1e9;for(const w of wat)for(const [dx,dz] of [[-1,0],[0,-1],[0,1]]){const x=w.ix+dx,z=w.iz+dz,i=z*g.W+x;if(g.solid[i]||g.furn[i]||g.rows[z][x]==='a')continue;const d=Math.hypot(x+0.5-t.x,z+0.5-t.z);if(d<bd){bd=d;best={x:x+0.5,z:z+0.5};}}
  g.pilot={n,st:'sit',to:best,caught:0};}
 if(N){g.locker={x:N.x,z:N.z,open:false};g.solid[N.iz*g.W+N.ix]=1;}
 g.obj={label:'GET THE HANGAR PASS',n:0,total:1,done:false};}
function pilotTick(dt,g){const P=g.pilot,p=g.player,n=P.n;if(P.st==='caught'||P.st==='gone')return;
 if(P.st==='sit'){const d=Math.hypot(p.x-n.x,p.z-n.z),seen=d<6.5&&los(p.x,p.z,n.x,n.z);n.a=Math.PI/2+Math.sin((g.T||0)*0.7)*0.2;
  if(p.alive&&(seen||(g.shots||0)>0||(g.kills||0)>0)){P.st='run';n.path=P.to?a4Path(g,n.x,n.z,P.to.x,P.to.z):[];popup(n.x,n.z,'"NOT TONIGHT!"','#ff8a95');sfx('alert');banner('THE PILOT IS RUNNING','He is going for his boat at the back dock. Catch him.');}}
 if(P.st==='run'){if(a4Walk(n,dt,3.0)){P.st='gone';n.vx=n.vz=0;popup(n.x,n.z,'THE PILOT GOT AWAY','#ff8a95');banner('HE GOT AWAY','His locker by the dock has the pass. Open it.');g.obj.label='OPEN THE PILOT\'S LOCKER';sfx('splash');}}
 if((P.st==='run'||P.st==='sit')&&p.alive&&Math.hypot(p.x-n.x,p.z-n.z)<1.15){P.st='caught';P.caught=1;n.vx=n.vz=0;n.a=Math.atan2(p.x-n.x,p.z-n.z);restPass(g,n.x,n.z,'"TAKE IT! TAKE IT! HANGAR SEVEN, MIDNIGHT!"');}}
function restPass(g,x,z,line){if(g.obj.done)return;g.obj.n=1;g.obj.done=true;g.score+=1500;g.gpts=(g.gpts||0)+1500;sfx('cash');popup(x,z,'HANGAR PASS +$1,500','#7dff9a');
 banner('THE HANGAR PASS',line);a4Later(g,2400,()=>banner('OPA-LOCKA, HANGAR 7',g.enemies.every(e=>!e.alive)?'Wheels up at midnight. Get back to the car':'Wheels up at midnight. Finish the job here first'));}
function frankieTick(g){const f=g.frankie;if(!f||!f.alive)return;
 if(!g.frankieSeen&&f.state==='chase'){g.frankieSeen=1;banner('FRANKIE LO PRESTI','Vale\'s head of security, from Philadelphia. Six hits to put him down.');
  if(CHARS[selIdx].id==='consigliere')a4Later(g,1800,()=>popup(f.x,f.z-0.4,'"GUS. LAST TIME I SAW YOU, YOU WERE IN A DINER."','#ffd36b'));}
 if(!g.frankieHelp&&f.hp<=f.maxhp/2){g.frankieHelp=1;popup(f.x,f.z,'"GET IN HERE!"','#ff8a95');let n=0;for(const [dx,dz] of [[-1.2,1.6],[1.2,1.6],[-2.4,0.6],[-2.4,2.2],[-3.5,1.2],[0,2.4]]){const x=clamp(f.x+dx,1.5,g.W-1.5),z=clamp(f.z+dz,1.5,g.H-1.5);if(n>=2||blk(g,x,z))continue;n++;const e=makeEnemy(g,g.def,12,'pistol',false,x,z);Object.assign(e.look,{jacket:[0.08,0.08,0.1],shirt:[0.97,0.97,0.97],vest:[0.08,0.08,0.1],tie:[0.08,0.08,0.1]});e.state='chase';e.seeT=0;}if(typeof buildRadar==='function')buildRadar(g);}}
function drawRest(B,g){const P=g.pilot,L=g.locker,bx=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x,y,z,0,sx,sy,sz),c,!!em);
 if(P&&P.st!=='gone'){const n=P.n;if(!fogHid(n.x,n.z))drawChar(CB(n),n);if(P.st==='caught'){const y=1.95+Math.sin((g.T||0)*4)*0.05;bx(n.x,y,n.z,0.26,0.16,0.03,[1,0.85,0.3],true);}}
 if(L){bx(L.x,0.6,L.z,0.7,1.2,0.6,[0.42,0.46,0.52]);bx(L.x,0.6,L.z+0.31,0.03,1.0,0.01,[0.25,0.27,0.3]);bx(L.x+0.2,0.7,L.z+0.31,0.05,0.12,0.02,L.open?[0.2,0.8,0.3]:[1,0.75,0.2],true);}
 if(g.tip&&P&&P.st==='sit')bx(P.n.x,1.4,P.n.z,0.07,2.8,0.07,[0.3,1,0.5],true);}

/* ---------------- floor 14: Hangar 7 and the jet ---------------- */
function valeLook(){return LEVELS[13].boss.look();}
function valeWalkSetup(g){const t=a4Cells(g,'t')[0],n=a4Cells(g,'n')[0];if(!t||!n)return;const v=makeChar(t.x,t.z,valeLook(),false);v.kind='vale';v.r=0.3;v.a=Math.PI/2;
 v.path=a4Path(g,t.x,t.z,n.x,n.z);g.valeW={n:v,t:2.2,aboard:false,stairs:{x:n.x,z:n.z}};g.jetBody=a4Body(g);}
function valeWalkTick(dt,g){const W=g.valeW;if(!W||W.aboard)return;if(W.t>0){W.t-=dt;if(W.t<=0)popup(W.n.x,W.n.z,'"WHEELS UP IN FIVE MINUTES."','#ffd36b');return;}
 if(a4Walk(W.n,dt,1.45)){W.aboard=true;sfx('door');banner('VALE IS ABOARD','The jet is taxiing out to the runway. Get up those stairs.');}}
/* the jet's body cells (j): {x0,x1,z0,z1} in world units */
function a4Body(g){const c=a4Cells(g,'j');if(!c.length)return null;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const q of c){x0=Math.min(x0,q.ix);x1=Math.max(x1,q.ix+1);z0=Math.min(z0,q.iz);z1=Math.max(z1,q.iz+1);}return {x0,x1,z0,z1,cz:(z0+z1)/2};}
function jetSetup(g){const b=a4Body(g),N=a4Cells(g,'N')[0];if(!b)return;g.jetBody=b;g.jet={valve:N?{x:N.x,z:N.z}:null,fuse:0,boom:0,roll:0,rollT:0,open:false};
 if(N)g.solid[N.iz*g.W+N.ix]=1;
 g.obj={label:'FINISH VALE',n:0,total:1,done:false};
 if(lexFate()==='dead'){for(const [x,z] of [[b.x1-3,b.z0-2],[b.x1-6,b.z1+2]]){const e=makeEnemy(g,g.def,13,'mac10',false,x,z);e.state='idle';}if(typeof buildRadar==='function')buildRadar(g);}}
function jetTick(dt,g){const J=g.jet,p=g.player,b=g.jetBody,bo=g.boss;if(!J||!b)return;
 if(bo&&bo.alive&&!J.roll&&bo.hp<=bo.maxhp/2){J.roll=1;banner('THE JET IS ROLLING','Vale told the pilot to go. Stay on your feet.');sfx('boss');
  for(const [x,z] of [[b.x1-2.5,b.cz-0.6],[b.x1-2.5,b.cz+0.6]]){if(blk(g,x,z))continue;const e=makeEnemy(g,g.def,13,'colt45',false,x,z);e.state='chase';e.seeT=0;}if(typeof buildRadar==='function')buildRadar(g);
  if(lexFate()==='spared')a4Later(g,1500,()=>popup(p.x,p.z-0.5,'LEX: "HE CAN\'T SHOOT WHILE IT MOVES. RUSH HIM!"','#7dff9a'));}
 if(J.roll&&!J.boom&&bo&&bo.alive){J.rollT-=dt;if(J.rollT<=0){J.rollT=rnd(1.6,2.8);shake(0.3);rumble(0.4,0.4,200);}
  const inJet=q=>q.x>b.x0&&q.x<b.x1&&q.z>b.z0&&q.z<b.z1;if(p.alive&&inJet(p)&&!blk(g,p.x-dt*0.55,p.z))p.x-=dt*0.55;
  for(const it of g.items)if(!it.flying&&inJet(it)&&!blk(g,it.x-dt*1.2,it.z))it.x-=dt*1.2;}
 if(J.fuse>0){const s0=Math.ceil(J.fuse);J.fuse-=dt;if(Math.random()<dt*20&&J.valve)g.parts.push({t:'c',x:J.valve.x+rnd(-0.4,0.4),y:0.05,z:J.valve.z+rnd(-0.4,0.4),vx:rnd(-0.3,0.3),vy:rnd(0.1,0.4),vz:rnd(-0.3,0.3),s:0.06,c:[0.55,0.45,0.2],life:0.9});
  if(Math.ceil(J.fuse)!==s0&&J.fuse>0){popup(p.x,p.z-0.6,'FUEL  '+Math.ceil(J.fuse),'#ff8a95');sfx('blip');}
  if(J.fuse<=0){J.fuse=0;jetBoom(g);}}
 if(J.boom&&Math.random()<dt*40){const x=rnd(b.x0,b.x1),z=rnd(b.z0,b.z1);g.parts.push({t:'c',x,y:rnd(0.3,1.2),z,vx:rnd(-0.4,0.4),vy:rnd(1,2.6),vz:rnd(-0.4,0.4),s:rnd(0.08,0.16),c:Math.random()<0.6?[1,rnd(0.35,0.7),0.08]:[0.18,0.16,0.16],life:rnd(0.5,1.1)});}}
/* the jet goes up: a chain of blasts down the fuselage, everybody near it dies (you too, if you are still close), and the accident
   is graded: CLEAN when Vale was not shot */
function jetBoom(g){const J=g.jet,b=g.jetBody,p=g.player,R=3.2;J.boom=1;
 for(let k=0;k<6;k++)a4Later(g,k*140,()=>explode({x:b.x0+1+(b.x1-b.x0-2)*k/5,z:b.cz+rnd(-0.8,0.8),own:'p'}));
 shake(1.2);rumble(1,1,900);g.flash=0.6;g.flashC=[1,0.6,0.2];
 for(let i=0;i<70;i++){const a=rnd(0,TAU),v=rnd(3,9);g.parts.push({t:'c',x:rnd(b.x0,b.x1),y:0.8,z:b.cz,vx:Math.cos(a)*v,vy:rnd(2,7),vz:Math.sin(a)*v,s:rnd(0.08,0.2),c:Math.random()<0.55?[1,rnd(0.4,0.8),0.1]:[0.2,0.18,0.18],life:rnd(0.6,1.4)});}
 const near=q=>q.x>b.x0-R&&q.x<b.x1+R&&q.z>b.z0-R&&q.z<b.z1+R;
 for(const e of g.enemies)if(e.alive&&near(e))killEnemy(e,'shotgun',[0,1]);
 if(p.alive&&near(p)){p.armor=0;p.armorT=0;const d=[Math.sign(p.x-(b.x0+b.x1)/2)||1,0];for(let k=0;k<8&&p.alive;k++){p.armorT=0;hurtPlayer(d,'grenade',99);}}
 g.accident=g.valeShot?'messy':'clean';
 if(p.alive){if(g.accident==='clean'){const pay=Math.round(A4_CLEAN_PAY*Dd().mult);g.score+=pay;g.gpts=(g.gpts||0)+2000;popup(p.x,p.z-0.5,'A CLEAN ACCIDENT  +$'+fmt(pay),'#7dff9a');}
  a4Later(g,900,()=>banner('BANKER DIES IN FIERY RUNWAY CRASH',g.accident==='clean'?'"Investigators blame a fuel leak." Back to the car.':'"Police puzzled by bullet holes." Back to the car.'));}}
function valvePull(p){const g=G,J=g.jet;if(!J||!J.valve||J.fuse>0||J.boom)return false;if(Math.hypot(p.x-J.valve.x,p.z-J.valve.z)>1.4)return false;
 if(g.boss&&g.boss.alive){popup(J.valve.x,J.valve.z,'FINISH VALE FIRST','#ff8a95');return true;}
 J.fuse=A4_FUSE;J.open=true;g.obj.n=1;g.obj.done=true;g.objNow=false;sfx('door');banner('THE FUEL IS POURING','Get clear of the jet before it goes up: '+A4_FUSE+' seconds');return true;}
/* the airliner-style private jet: nose cone east, tail fin and engines west, swept wings north and south of the cabin. In the hangar the
   body is a solid block (j cells, lower) and gets a roof; on the runway the cabin is open so you can see the fight inside. */
function drawJet(B,g,b,roof){const T=g.T||0,bx=(x,y,z,sx,sy,sz,c,em,ry)=>B.box(TRS(x,y,z,ry||0,sx,sy,sz),c,!!em),wh=[0.95,0.95,0.96],gr=[0.75,0.77,0.8],st=[0.12,0.2,0.42],gold=[0.95,0.75,0.25];
 const L=b.x1-b.x0,cz=b.cz,w=b.z1-b.z0,boom=g.jet&&g.jet.boom,sh=boom?[0.12,0.1,0.1]:wh,sg=boom?[0.1,0.09,0.09]:gr;
 for(let k=0;k<3;k++)bx(b.x1+0.45+k*0.55,0.65-k*0.06,cz,0.6,1.0-k*0.25,w*(0.82-k*0.24),sh);bx(b.x1+0.95,0.95,cz,0.5,0.25,w*0.5,boom?sg:[0.15,0.2,0.3]);
 bx(b.x0-0.6,0.7,cz,1.2,0.9,w*0.55,sh);bx(b.x0-0.9,1.9,cz,1.0,1.6,0.14,sh);bx(b.x0-1.0,2.6,cz,0.8,0.12,2.4,sh);bx(b.x0-0.9,2.0,cz,1.02,0.2,0.16,boom?sg:st);
 for(const sd of [-1,1]){const wz=sd>0?b.z1:b.z0,mx=b.x0+L*0.55;for(let k=0;k<5;k++)bx(mx-k*0.55,0.55,wz+sd*(0.6+k*0.75),2.2-k*0.3,0.08,0.8,sg);bx(mx-2.4,0.6,wz+sd*4.1,0.5,0.4,0.12,boom?sg:st);
  bx(b.x0+1.4,0.95,wz+sd*0.55,1.6,0.6,0.6,sg);bx(b.x0+2.25,0.95,wz+sd*0.55,0.08,0.56,0.56,[0.08,0.08,0.1]);
  bx(b.x0+L/2,0.9,wz+sd*0.01,L-0.4,0.1,0.02,boom?sg:st,false);bx(b.x0+L/2,0.78,wz+sd*0.01,L-0.6,0.04,0.02,boom?sg:gold,false);
  for(let k=0;k<Math.floor(L/1.2);k++)bx(b.x0+1.2+k*1.2,1.0,wz+sd*0.012,0.3,0.18,0.02,boom?sg:[0.25,0.45,0.65],false);}
 if(roof)bx(b.x0+L/2,1.07,cz,L,0.06,w,sh);
 if(!boom&&(Math.sin(T*3)>0.6))for(const sd of [-1,1])bx(b.x0+L*0.55-2.4,0.65,(sd>0?b.z1:b.z0)+sd*4.2,0.14,0.14,0.14,sd>0?[0.2,1,0.3]:[1,0.15,0.15],true);}
function drawHangar(B,g){const bx=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x,y,z,0,sx,sy,sz),c,!!em),T=g.T||0;
 if(g.sid==='hangar'&&g.jetBody){drawJet(B,g,g.jetBody,true);const W=g.valeW;if(W){if(!W.aboard&&!fogHid(W.n.x,W.n.z))drawChar(CB(W.n),W.n);const s=W.stairs;
   for(let k=0;k<5;k++)bx(s.x-0.1,0.12+k*0.2,s.z-0.35-k*0.18,0.9,0.08,0.22,[0.85,0.85,0.88]);bx(s.x-0.55,0.6,s.z-0.7,0.05,1.1,1.2,[0.7,0.72,0.76]);bx(s.x+0.35,0.6,s.z-0.7,0.05,1.1,1.2,[0.7,0.72,0.76]);
   bx(s.x-0.1,0.03,s.z,0.9,0.015,0.9,W.aboard?[0.3,1,0.5]:[1,0.25,0.25],true);}
  const b=g.jetBody;bx(b.x1+4.2,0.35,b.cz,1.4,0.6,1.0,[0.95,0.75,0.1]);bx(b.x1+3.2,0.25,b.cz,1.2,0.04,0.06,[0.1,0.1,0.12]);}
 if(g.sid==='jet'&&g.jetBody){drawJet(B,g,g.jetBody,false);const J=g.jet;if(J&&J.valve&&!J.boom){const v=J.valve,ready=g.boss&&!g.boss.alive&&!(J.fuse>0);bx(v.x,0.5,v.z,0.6,1.0,0.5,[0.85,0.2,0.15]);bx(v.x,1.05,v.z,0.3,0.06,0.3,[0.1,0.1,0.12]);
   bx(v.x,1.15,v.z,0.36,0.08,0.08,ready?[1,0.85,0.2]:[0.4,0.32,0.1],ready&&Math.sin(T*8)>0);if(J.fuse>0)bx(v.x,0.02,v.z,1.2+0.2*Math.sin(T*6),0.01,1.2,[0.5,0.42,0.18]);}}
 if(g.sid==='apron'){for(let k=0;k<8;k++)bx(6+k*4.2,0.02,g.H-8.5,1.8,0.01,0.16,[1,0.85,0.2]);}}
/* the ramps, side door and boarding stairs between stages */
function drawA4Stairs(B,g,s){const x=s.at[0],z=s.at[1],bx=(px,py,pz,sx,sy,sz,c,em)=>B.box(TRS(px,py,pz,0,sx,sy,sz),c,!!em),T=g.T||0,lock=act4Locked(g,s);
 if(s.id==='ramp'){for(let k=0;k<4;k++)bx(x,0.02-k*0.004,z-0.3+k*0.25,1.6,0.012,0.22,k%2?[0.22,0.22,0.25]:[0.3,0.3,0.34]);for(let k=0;k<3;k++){const on=Math.sin(T*5-k*1.4)>0;bx(x,0.03,z+0.6-k*0.4,0.5,0.012,0.08,on?[1,0.85,0.3]:[0.4,0.32,0.1],on);}
  bx(x,2.0,z-0.45,1.0,0.3,0.05,[0.1,0.2,0.5]);bx(x,2.0,z-0.42,0.7,0.12,0.02,[1,1,1],true);return;}
 if(s.id==='door'){bx(x,0.95,z-0.47,0.95,1.9,0.05,[0.02,0.02,0.04]);bx(x,2.0,z-0.44,0.6,0.14,0.05,[0.3,1,0.5],true);bx(x,0.02,z,0.9,0.012,0.9,[0.3,1,0.5],true);return;}
 if(s.id==='board'&&lock)return;}

/* ---------------- shared hooks ---------------- */
function act4Tick(dt){const g=G;if(!g||!g.player||g.def.hub)return;
 if(isGarage(g)&&g.sid==='dock'&&g.vans)vanTick(dt,g);
 else if(g.rest&&levelIdx===12){if(g.pilot)pilotTick(dt,g);frankieTick(g);}
 else if(isHangar(g)){if(g.sid==='hangar')valeWalkTick(dt,g);else if(g.sid==='jet')jetTick(dt,g);}}
function drawAct4(B,g){if(isGarage(g))a4DrawGarage(B,g);else if(isHangar(g))drawHangar(B,g);else if(g.rest&&levelIdx===12)drawRest(B,g);}
function act4Action(p){const g=G;if(!g||!p)return null;
 if(isGarage(g)&&g.lever&&Math.hypot(p.x-g.lever.x,p.z-g.lever.z)<1.3&&g.vans.some(v=>v.st==='wait'||v.st==='go'))return {b:'BARRIER',h:'DROP THE BOOM BARRIER'};
 if(g.rest&&g.locker&&!g.locker.open&&g.pilot&&g.pilot.st==='gone'&&!g.obj.done&&Math.hypot(p.x-g.locker.x,p.z-g.locker.z)<1.6)return {b:'OPEN',h:'OPEN THE LOCKER'};
 if(isHangar(g)&&g.jet&&g.jet.valve&&!g.jet.fuse&&!g.jet.boom&&g.boss&&!g.boss.alive&&Math.hypot(p.x-g.jet.valve.x,p.z-g.jet.valve.z)<1.4)return {b:'VALVE',h:'OPEN THE FUEL VALVE'};
 return null;}
function act4Grab(p){const g=G;if(!g||!p)return false;
 if(isGarage(g)&&g.lever&&g.vans&&g.vans.some(v=>v.st==='wait'||v.st==='go')&&boomPull(p))return true;
 if(g.rest&&g.locker&&!g.locker.open&&g.pilot&&g.pilot.st==='gone'&&!g.obj.done&&Math.hypot(p.x-g.locker.x,p.z-g.locker.z)<1.6){g.locker.open=true;restPass(g,g.locker.x,g.locker.z,'A spare pass and tonight\'s flight plan, taped inside the door.');return true;}
 if(isHangar(g)&&valvePull(p))return true;
 return false;}
/* killEnemy hook: shots on Vale spoil the accident; a dead driver lets his van coast to a stop (vanTick); Frankie's last words */
function act4Kill(e,type){const g=G;if(!g)return;
 if(e.vale){g.valeShot=GUNS.includes(type);g.obj.label='MAKE IT LOOK LIKE AN ACCIDENT';g.objNow=true;}
 if(e.mini==='frankie'){const gus=CHARS[selIdx].id==='consigliere';popup(e.x,e.z-0.4,gus?'"IT WAS BUSINESS, GUS. JUST BUSINESS."':'"VALE... PAYS... BETTER..."','#ffd36b');
  if(gus)a4Later(g,1600,()=>banner('FRANKIE LO PRESTI','The man who set up the diner on Passyunk Avenue. Philadelphia will hear about it.'));}}
function act4Guide(g){const p=g.player;
 if(g.jet&&g.jet.fuse>0&&!g.jet.boom){const c=g.car;return {x:c.x,z:c.z,k:'late',lbl:'GET CLEAR'};}
 if(g.jet&&g.boss&&!g.boss.alive&&!g.jet.fuse&&!g.jet.boom&&g.jet.valve&&!g.fin)return {x:g.jet.valve.x,z:g.jet.valve.z,k:'obj',lbl:'OPEN THE FUEL VALVE'};
 if(g.vans&&g.lever&&g.vans.some(v=>v.st==='go'&&v.e.alive&&v.z>=g.lane.z-0.01))return {x:g.lever.x,z:g.lever.z,k:'obj',lbl:'DROP THE BARRIER'};
 if(g.pilot&&g.pilot.st==='run')return {x:g.pilot.n.x,z:g.pilot.n.z,k:'obj',lbl:'CATCH THE PILOT'};
 if(g.pilot&&g.pilot.st==='gone'&&g.locker&&!g.locker.open&&!g.obj.done)return {x:g.locker.x,z:g.locker.z,k:'obj',lbl:'OPEN THE LOCKER'};
 if(g.pilot&&g.pilot.st==='sit'&&(g.tip||!g.enemies.some(e=>e.alive)))return {x:g.pilot.n.x,z:g.pilot.n.z,k:'obj',lbl:'THE PILOT'};
 return null;}
/* the results card for Act 4's last floor reads like the next morning's paper */
function act4Results(g){if(!g||!g.jet||!g.jet.boom)return null;const clean=g.accident==='clean';
 return {title:'BANKER DIES IN FIERY RUNWAY CRASH',html:`<br>THE MORNING PAPER<b style="color:${clean?'#7dff9a':'#ff8a95'}">${clean?'"INVESTIGATORS BLAME A FUEL LEAK"':'"POLICE PUZZLED BY BULLET HOLES"'}</b><br>ACCIDENT<b style="color:${clean?'#7dff9a':'#ff8a95'}">${clean?'CLEAN  +$'+fmt(Math.round(A4_CLEAN_PAY*Dd().mult)):'MESSY: VALE WAS SHOT'}</b>`};}
