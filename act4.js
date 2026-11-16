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
  else if(g.sid==='p2')banner('P2: THE PARKING DECK','The stairs down to the vault dock are in the far corner.');
  else{placeStash(g,11);vanSetup(g);banner('THE VAULT DOCK','Three gold vans are leaving. Drop the boom barrier or shoot the drivers.');}
  return true;}
 if(isHangar(g)){
  if(g.sid==='apron'){banner('FLOOR 3: OPA-LOCKA HANGAR 7','The hangar side door is at the far end of the apron.');act4Lex(g,13);}
  else if(g.sid==='hangar'){valeWalkSetup(g);banner('HANGAR 7','Vale is walking to his jet. The stairs stay up until he is aboard.');}
  else{placeStash(g,13);jetSetup(g);banner('ON THE RUNWAY','Vale has locked himself in the cockpit. Take out his bodyguards in the cabin first.');}
  return true;}
 return false;}
function act4Goal(g){if(isGarage(g))return g.sid==='dock'?null:'TAKE THE STAIRS DOWN';if(isHangar(g))return g.sid==='apron'?'GET INTO THE HANGAR':g.sid==='hangar'?(g.valeW&&g.valeW.aboard?'BOARD THE JET':'GET TO THE JET'):null;return null;}
function act4Locked(g,s){return isHangar(g)&&s.id==='board'&&!(g.valeW&&g.valeW.aboard);}
function act4LockHint(g){popup(g.player.x,g.player.z,'THE STAIRS GO UP WHEN VALE IS ABOARD','#ff8a95');}
const A4_STAIR_LBL={down:'TAKE THE STAIRS DOWN',door:'HANGAR SIDE DOOR',board:'BOARD THE JET'};

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
/* The jet, in order: Vale has sealed himself in the cockpit behind a thick door. Take out his bodyguards in the cabin; then he
   pushes the throttles and the jet starts its take-off run (the airstairs come up, the door is shut). Hack the cockpit door, deal
   with Vale (he begs: spare him or finish him), and pull the throttles back before the jet runs off the end of the runway. Then the
   fuel valve, the run and the blast. J.ph: 'guards' > 'roll' (door shut) > 'vale' (door open) > 'stop' (Vale dealt with) > 'stopped'. */
const A4_CRASH=75,A4_HACK=5,A4_VMAX=9;
/* the take-off run: the jet leaves the tarmac behind (men still outside, loose guns, the car, the stash) and the runway slides past */
function jetLeaveTarmac(g){const b=g.jetBody,p=g.player;
 for(const e of g.enemies)if(e.alive&&!e.boss&&!inJetB(b,e)){e.alive=false;e.sunk=true;}
 g.items=g.items.filter(it=>inJetB(b,it));if(g.stash&&!g.stash.got)g.stash=null;
 if(g.car){g.car.x=-60;g.car.z=-60;}
 if(p&&p.alive&&!inJetB(b,p)){const d=jetSkin(g,b).doors[0];if(d){p.x=d.x;p.z=d.z-d.d*0.8;p.vx=p.vz=0;}}}
/* out through the door: drop to the tarmac and run, the jet goes up behind you and the floor is done */
function jetExit(g,d){const J=g.jet,p=g.player,bo=g.boss;J.out=1;p.x=d.x+0.4;p.z=d.z+d.d*2.3;p.vx=p.vz=0;sfx('door');
 if(bo&&bo.alive&&bo.cuffed){bo.x=p.x-0.9;bo.z=p.z+d.d*0.2;bo.vx=bo.vz=0;popup(bo.x,bo.z-0.5,'VALE COMES ALONG QUIETLY','#7dff9a');}
 banner('OUT OF THE JET','Run!');J.fuse=Math.min(J.fuse,1.2);}
function jetSetup(g){const b=a4Body(g),N=a4Cells(g,'N')[0],D=a4Cells(g,'Y')[0];if(!b)return;g.jetBody=b;
 g.jet={valve:N?{x:N.x,z:N.z}:null,fuse:0,boom:0,roll:0,rollT:0,open:false,ph:'guards',crash:A4_CRASH,hack:0,door:D?{x:D.x,z:D.z,ix:D.ix,iz:D.iz,o:0}:null,stopped:0};g.lift=(x,z)=>jetLift(g,x,z);
 if(N)g.solid[N.iz*g.W+N.ix]=1;
 const bo=g.boss;if(bo){bo.spd0=bo.spd;bo.spd=0.0001;bo.state='idle';bo.sealed=1;}
 const tc=at13(g,26,6);g.jet.thr={x:tc[0],z:tc[1]};
 g.obj={label:'TAKE OUT VALE\'S BODYGUARDS',n:0,total:1,done:false};
 if(lexFate()==='dead'){for(const [x,z] of [[b.x1-3,b.z0-2],[b.x1-6,b.z1+2]]){const e=makeEnemy(g,g.def,13,'mac10',false,x,z);e.state='idle';}if(typeof buildRadar==='function')buildRadar(g);}}
/* a cell of the jet map (map column c, row r) in world units, from the body outline (the map's fuselage starts at column 10, row 4) */
function at13(g,c,r){const b=g.jetBody;return [b.x0+(c-10)+0.5,b.z0+(r-4)+0.5];}
const inJetB=(b,q)=>q.x>b.x0&&q.x<b.x1&&q.z>b.z0&&q.z<b.z1;
function jetDoorSeal(g,on){const S=jetSkin(g,g.jetBody);for(const d of S.doors){const ix=Math.floor(d.x),iz=d.d>0?Math.floor(d.z):Math.floor(d.z)-1;g.solid[iz*g.W+ix]=on?1:0;}}
function jetLabel(g){const J=g.jet,t=Math.max(0,Math.ceil(J.crash)),ts=' '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
 g.obj.label=J.ph==='guards'?'TAKE OUT VALE\'S BODYGUARDS':J.ph==='roll'?'HACK THE COCKPIT DOOR'+ts:J.ph==='vale'?'DEAL WITH VALE'+ts:J.ph==='stop'?'STOP THE JET'+ts:J.fuse>0||J.out?'GET OUT THROUGH THE DOOR':'OPEN THE FUEL VALVE';}
function jetTick(dt,g){const J=g.jet,p=g.player,b=g.jetBody,bo=g.boss;if(!J||!b)return;
 if(J.ph==='guards'&&!g.enemies.some(e=>e.alive&&!e.boss&&!e.spared&&inJetB(b,e))){J.ph='roll';J.roll=1;J.rolled=1;J.spd=0;jetDoorSeal(g,true);sfx('boss');shake(0.5);jetLeaveTarmac(g);
  banner('THE JET IS ROLLING','Vale is at the controls behind a locked door. Hack it and stop the jet before it runs off the runway.');
  if(lexFate()==='spared')a4Later(g,1500,()=>popup(p.x,p.z-0.5,'LEX: "THAT DOOR HAS A SERVICE PANEL. HACK IT!"','#7dff9a'));}
 if(J.roll&&!J.stopped&&!J.boom){J.crash-=dt;J.rollT-=dt;if(J.rollT<=0){J.rollT=rnd(1.4,2.6);shake(0.25+0.25*(1-J.crash/A4_CRASH));rumble(0.4,0.4,200);}
  const s0=Math.ceil(J.crash+dt);if(Math.ceil(J.crash)!==s0&&J.crash<=10&&J.crash>0){popup(p.x,p.z-0.6,'RUNWAY END  '+Math.ceil(J.crash),'#ff8a95');sfx('blip');}
  J.spd=Math.min(A4_VMAX,J.spd+dt*0.3);
  if(p.alive&&inJetB(b,p)&&!blk(g,p.x-dt*0.45,p.z))p.x-=dt*0.45;
  for(const it of g.items)if(!it.flying&&inJetB(b,it)&&!blk(g,it.x-dt*1.0,it.z))it.x-=dt*1.0;
  if(J.crash<=0){J.crash=0;J.crashed=1;banner('THE JET RAN OFF THE RUNWAY','Nobody walks away from that.');jetBoom(g);}}
 else if(J.spd>0)J.spd=Math.max(0,J.spd-dt*(J.boom?9:4));
 J.dist=(J.dist||0)+J.spd*dt;
 if(J.spd>1&&!J.boom&&Math.random()<J.spd*dt*4)g.parts.push({t:'c',x:b.x0+0.3,y:1.1,z:b.cz+rnd(-0.5,0.5),vx:-J.spd*0.6,vy:rnd(0,0.2),vz:rnd(-0.2,0.2),s:0.07,c:[0.55,0.55,0.58],life:0.6});
 /* stopped and rigged: walk to the cabin door to get out */
 if(J.stopped&&!J.out&&!J.boom&&p.alive){const d=jetSkin(g,b).doors[0];if(d&&Math.abs(p.x-d.x)<0.62&&Math.abs(p.z-d.z)<0.85){if(J.fuse>0)jetExit(g,d);else if((g.T||0)>(J.doorT||0)){J.doorT=(g.T||0)+2.5;popup(d.x,d.z-0.5,'OPEN THE FUEL VALVE FIRST','#ff8a95');sfx('blip');}}}
 /* the hack: stand at the door's panel; it pauses if you step away */
 const D=J.door;if(D&&J.ph==='roll'&&J.hacking){if(Math.hypot(p.x-D.x,p.z-D.z)<1.7&&p.alive){const h0=Math.floor(J.hack*5);J.hack=Math.min(1,J.hack+dt/A4_HACK);if(Math.floor(J.hack*5)!==h0&&J.hack<1){popup(D.x,D.z-0.4,'HACKING '+Math.floor(J.hack*100)+'%','#7dff9a');sfx('blip');}
   if(J.hack>=1){J.ph='vale';J.hacking=0;D.o=0.001;g.solid[D.iz*g.W+D.ix]=0;sfx('door');banner('THE DOOR IS OPEN','Vale is at the controls.');if(bo&&bo.alive){bo.spd=bo.spd0||bo.spd;bo.sealed=0;bo.state='chase';bo.seeT=0;AI.know(bo,AI.belief.make(p.x,p.z,g.T||0,'call'));popup(bo.x,bo.z-0.4,'"YOU\'RE TOO LATE. WE\'RE GOING UP."','#ffd36b');}}}
  else if(!J.hackWarn){J.hackWarn=1;popup(D.x,D.z-0.4,'HACK PAUSED','#ff8a95');}}
 if(D&&D.o>0&&D.o<1)D.o=Math.min(1,D.o+dt*1.5);
 if(J.ph==='vale'&&bo&&(!bo.alive||bo.spared)&&!g.fin&&!g.mercy){J.ph='stop';banner('NOW STOP THE JET','The throttles on the centre pedestal. Pull them back.');}
 jetLabel(g);
 if(J.fuse>0){const s0=Math.ceil(J.fuse);J.fuse-=dt;if(Math.random()<dt*20&&J.valve)g.parts.push({t:'c',x:J.valve.x+rnd(-0.4,0.4),y:0.05,z:J.valve.z+rnd(-0.4,0.4),vx:rnd(-0.3,0.3),vy:rnd(0.1,0.4),vz:rnd(-0.3,0.3),s:0.06,c:[0.55,0.45,0.2],life:0.9});
  if(Math.ceil(J.fuse)!==s0&&J.fuse>0){popup(p.x,p.z-0.6,'FUEL  '+Math.ceil(J.fuse),'#ff8a95');sfx('blip');}
  if(J.fuse<=0){J.fuse=0;jetBoom(g);}}
 if(J.boom&&Math.random()<dt*40){const x=rnd(b.x0,b.x1),z=rnd(b.z0,b.z1);g.parts.push({t:'c',x,y:rnd(0.3,1.2),z,vx:rnd(-0.4,0.4),vy:rnd(1,2.6),vz:rnd(-0.4,0.4),s:rnd(0.08,0.16),c:Math.random()<0.6?[1,rnd(0.35,0.7),0.08]:[0.18,0.16,0.16],life:rnd(0.5,1.1)});}}
function hackStart(p){const g=G,J=g.jet,D=J&&J.door;if(!D||J.ph!=='roll'||Math.hypot(p.x-D.x,p.z-D.z)>1.5)return false;J.hacking=1;J.hackWarn=0;popup(D.x,D.z-0.4,'HACKING '+Math.floor(J.hack*100)+'%','#7dff9a');sfx('blip');return true;}
function brakesPull(p){const g=G,J=g.jet;if(!J||J.ph!=='stop'||Math.hypot(p.x-J.thr.x,p.z-J.thr.z)>1.3)return false;
 J.ph='stopped';J.stopped=1;J.roll=0;sfx('door');shake(0.6);banner('THE JET IS STOPPED',Math.ceil(J.crash)+' seconds of runway to spare. Open the fuel valve in the rear hold, then get out through the door.');
 const bo=g.boss;if(bo&&bo.alive&&bo.spared){bo.vx=bo.vz=0;bo.down=0;bo.hp=Math.max(1,bo.hp);bo.state='idle';bo.cuffed=1;}
 return true;}
/* the jet goes up: a chain of blasts down the fuselage, everybody near it dies (you too, if you are still close), and the accident
   is graded: CLEAN when Vale was not shot */
function jetBoom(g){const J=g.jet,b=g.jetBody,p=g.player,R=2.6;J.boom=1;
 for(let k=0;k<6;k++)a4Later(g,k*140,()=>explode({x:b.x0+1+(b.x1-b.x0-2)*k/5,z:b.cz+rnd(-0.8,0.8),own:'p'}));
 shake(1.2);rumble(1,1,900);g.flash=0.6;g.flashC=[1,0.6,0.2];
 for(let i=0;i<70;i++){const a=rnd(0,TAU),v=rnd(3,9);g.parts.push({t:'c',x:rnd(b.x0,b.x1),y:0.8,z:b.cz,vx:Math.cos(a)*v,vy:rnd(2,7),vz:Math.sin(a)*v,s:rnd(0.08,0.2),c:Math.random()<0.55?[1,rnd(0.4,0.8),0.1]:[0.2,0.18,0.18],life:rnd(0.6,1.4)});}
 const near=q=>q.x>b.x0-R&&q.x<b.x1+R&&q.z>b.z0-R&&q.z<b.z1+R;
 for(const e of g.enemies)if(e.alive&&near(e)&&!e.cuffed)killEnemy(e,'shotgun',[0,1]);
 if(p.alive&&near(p)&&!J.out){p.armor=0;p.armorT=0;const d=[Math.sign(p.x-(b.x0+b.x1)/2)||1,0];for(let k=0;k<8&&p.alive;k++){p.armorT=0;hurtPlayer(d,'grenade',99);}}
 g.accident=g.valeShot?'messy':'clean';
 if(p.alive){if(g.accident==='clean'){const pay=Math.round(A4_CLEAN_PAY*Dd().mult);g.score+=pay;g.gpts=(g.gpts||0)+2000;popup(p.x,p.z-0.5,'A CLEAN ACCIDENT  +$'+fmt(pay),'#7dff9a');}
  a4Later(g,900,()=>banner('BANKER DIES IN FIERY RUNWAY CRASH',g.accident==='clean'?'"Investigators blame a fuel leak."':'"Police puzzled by bullet holes."'));
  if(J.out)a4Later(g,3200,()=>{if(G===g&&state==='play'&&!g.done&&g.player.alive){g.done=true;finishLevel();}});}}
function valvePull(p){const g=G,J=g.jet;if(!J||!J.valve||J.fuse>0||J.boom)return false;if(Math.hypot(p.x-J.valve.x,p.z-J.valve.z)>1.4)return false;
 if(!J.stopped){popup(J.valve.x,J.valve.z,J.ph==='guards'?'NOT WHILE HIS MEN ARE ABOARD':'STOP THE JET FIRST','#ff8a95');return true;}
 J.fuse=A4_FUSE;J.open=true;g.obj.n=1;g.obj.done=true;g.objNow=false;sfx('door');banner('THE FUEL IS POURING','Get out through the cabin door before it goes up: '+A4_FUSE+' seconds');return true;}
/* the airliner-style private jet: nose cone east, tail fin and engines west, swept wings north and south of the cabin. In the hangar the
   body is a solid block (j cells, lower) and gets a roof; on the runway the cabin is open so you can see the fight inside. */
/* the jet: a thin white skin with a row of small windows. The 'j' cells keep the collision but sit flat (h 0.02); the skin is drawn on
   each fuselage cell's edge that faces the cabin, so the walls are thin and the cabin keeps its width. The outline cells outside the
   skin are the plane's shadow on the tarmac. A gap in the outline's top or bottom row is the door: airstairs run down from it. */
function jetSkin(g,b){if(g.jetSkin&&g.jetSkin.b===b)return g.jetSkin;const cells=a4Cells(g,'j'),set=new Set(cells.map(q=>q.ix+','+q.iz)),e=[],doors=[];
 const inner=(x,z)=>x>b.x0&&x<b.x1-1&&z>b.z0&&z<b.z1-1&&!set.has(x+','+z);
 for(const k of set){const [x,z]=k.split(',').map(Number);
  if(inner(x,z+1))e.push({x0:x,x1:x+1,z:z+1,hz:1,o:-1});if(inner(x,z-1))e.push({x0:x,x1:x+1,z:z,hz:1,o:1});
  if(inner(x+1,z))e.push({z0:z,z1:z+1,x:x+1,hz:0,o:-1});if(inner(x-1,z))e.push({z0:z,z1:z+1,x:x,hz:0,o:1});}
 for(const z of [b.z0,b.z1-1])for(let x=b.x0+1;x<b.x1-1;x++)if(!set.has(x+','+z)&&set.has((x-1)+','+z))doors.push({x:x+0.5,z:z===b.z0?z+1:z,d:z===b.z0?-1:1});
 g.jetSkin={b,e,doors,cells,set};return g.jetSkin;}
/* the jet stands on its landing gear: the cabin floor is JET_DECK above the tarmac, and the airstairs run from the door down to the
   ground. liftAt() (index.html, models.js) raises characters, dropped guns, blood, bullets and sparks by this much where they are. */
const JET_DECK=0.8;
function jetLift(g,x,z){const b=g.jetBody;if(!b)return 0;const S=jetSkin(g,b),ix=Math.floor(x),iz=Math.floor(z);
 if(ix>b.x0&&ix<b.x1-1&&iz>b.z0&&iz<b.z1-1&&!S.set.has(ix+','+iz))return JET_DECK;
 if(!(g.jet&&g.jet.rolled))for(const d of S.doors)if(Math.abs(x-d.x)<0.62){const t=(z-d.z)*d.d;if(t>-0.05&&t<2)return JET_DECK*Math.min(1,1-t/2);}
 return 0;}
function liftAt(x,z){const g=G;return g&&g.lift?g.lift(x,z):0;}
/* airstairs from a door at hull face z down to the tarmac, d = +1 south / -1 north */
function drawAirstairs(bx,x,z,d,c,top){const n=8,len=2.0,rail=[0.7,0.72,0.76];top=top||1.0;
 for(let k=0;k<n;k++){const f=(k+0.5)/n,y=top*(1-f),zz=z+d*f*len;bx(x,y,zz,0.78,0.05,len/n+0.02,c);
  for(const sd of [-1,1])bx(x+sd*0.42,y+0.45,zz,0.04,0.04,len/n+0.02,rail);if(k%2===0)for(const sd of [-1,1])bx(x+sd*0.42,y+0.22,zz,0.03,0.45,0.03,rail);}
 for(const sd of [-1,1])bx(x+sd*0.38,top*0.5,z+d*len*0.5,0.05,0.05,len*1.02,[0.55,0.57,0.6]);}
function drawJet(B,g,b,roof){const T=g.T||0,DK=JET_DECK,bx0=(x,y,z,sx,sy,sz,c,em,ry)=>B.box(TRS(x,y,z,ry||0,sx,sy,sz),c,!!em),bx=(x,y,z,sx,sy,sz,c,em,ry)=>bx0(x,y+DK,z,sx,sy,sz,c,em,ry),wh=[0.95,0.95,0.96],gr=[0.75,0.77,0.8],st=[0.12,0.2,0.42];
 const boom=g.jet&&g.jet.boom,sh=boom?[0.12,0.1,0.1]:wh,sg=boom?[0.1,0.09,0.09]:gr,win=boom?[0.06,0.05,0.05]:[0.1,0.14,0.22],H=1.15,t=0.1,S=jetSkin(g,b);
 /* the visible hull is one cell in from the outline */
 const X0=b.x0+1,X1=b.x1-1,Z0=b.z0+1,Z1=b.z1-1,L=X1-X0,cz=b.cz,w=Z1-Z0;
 const winAt=(x0,len,z)=>{for(let k=0;k<len;k++)for(const f of [0.3,0.7]){const wx=x0+k+f;if(S.doors.some(d=>Math.abs(d.x-wx)<0.6&&Math.abs(d.z-z)<0.2))continue;bx(wx,0.74,z,0.18,0.2,0.012,win);}};
 bx0((b.x0+b.x1)/2,0.036,cz,b.x1-b.x0-0.6,0.01,b.z1-b.z0-0.3,[0.05,0.05,0.06]);
 /* the belly under the cabin floor, and the landing gear: a nose leg and two main legs under the wings, each with its wheels */
 bx(X0+L/2,-0.14,cz,L,0.28,w*0.92,sh);bx(X0+L/2,-0.3,cz,L*0.92,0.08,w*0.6,sg);
 const leg=(x,z,two)=>{bx0(x,DK*0.5,z,0.07,DK,0.07,[0.55,0.56,0.6]);bx0(x-0.12,DK*0.45,z,0.22,0.04,0.04,[0.55,0.56,0.6]);
  for(const o of two?[-0.13,0.13]:[0])bx0(x,0.14,z+o,0.28,0.28,0.1,[0.08,0.08,0.09]);bx0(x,0.14,z,0.1,0.1,two?0.34:0.12,[0.6,0.6,0.64]);};
 if(!boom){leg(X1-0.8,cz,true);for(const sd of [-1,1])leg(X0+L*0.48,cz+sd*w*0.42,true);}
 if(roof){bx(X0+L/2,H/2,cz,L,H,w,sh);bx(X0+L/2,H+0.03,cz,L,0.06,w-0.1,sh);
  for(const z of [Z0-0.007,Z1+0.007])winAt(X0,L,z);
  for(const d of S.doors)bx(d.x,0.55,d.z+d.d*0.008,0.72,1.0,0.012,[0.08,0.08,0.1]);}
 else for(const q of S.e){if(q.hz){const z=q.z+q.o*t/2,len=q.x1-q.x0;bx((q.x0+q.x1)/2,H/2,z,len,H,t,sh);for(const sd of [-1,1])winAt(q.x0,len,z+sd*(t/2+0.006));}
  else{const x=q.x+q.o*t/2;bx(x,H/2,(q.z0+q.z1)/2,t,H,q.z1-q.z0,sh);}}
 const J=g.jet,rolled=J&&J.rolled,open=J&&J.stopped&&!boom;
 for(const d of S.doors){if(!rolled)drawAirstairs(bx0,d.x,d.z,d.d,boom?sg:[0.88,0.88,0.9],DK+0.02);
  else if(!open)bx(d.x,1.15/2,d.z-d.d*0.05,0.98,1.15,0.1,sh);
  else{bx(d.x+0.95,1.15/2,d.z+d.d*0.07,0.98,1.15,0.06,sh);const hot=J.fuse>0;bx(d.x,0.03,d.z-d.d*0.45,0.8,0.012,0.7,hot?[0.2,0.6,0.3]:[0.2,0.35,0.25]);if(hot)bx(d.x,1.3,d.z-d.d*0.1,0.5,0.1,0.04,Math.sin(T*8)>0?[0.3,1,0.5]:[0.1,0.4,0.2],Math.sin(T*8)>0);}}
 /* nose: a tapering cone with the cockpit windscreen; tail: tapered cone, swept fin and a T-tail */
 const bm=(x,y,z,ry,rx,sx,sy,sz,c,em,rz)=>B.box(A.mul(A.mul(A.mul(A.mul(A.T(x,y+DK,z),A.RY(ry)),A.RX(rx)),A.RZ(rz||0)),A.S(sx,sy,sz)),c,!!em);
 /* a swept, tapered surface from (x,z) out along side sd: n overlapping boxes turned to the sweep angle, so the edges run straight */
 const surf=(x,y,z,sd,span,root,tip,sweep,th,dy,col,n)=>{const a=Math.atan2(sweep,span),seg=Math.hypot(span,sweep)/n;
  for(let k=0;k<n;k++){const f=(k+0.5)/n,c=root+(tip-root)*f;bm(x-sweep*f-c/2,y+dy*f,z+sd*span*f,-sd*a,0,c,th*(1-f*0.4),seg*1.06,col);}};
 for(let k=0;k<8;k++){const f=(k+0.5)/8,h=1.15*(1-f*f*0.6),ww=w*Math.sqrt(1-f*f*0.92);bx(X1+k*0.2+0.1,0.06+h/2-f*0.04,cz,0.21,h,ww,sh);}
 for(const sd of [-1,1])bm(X1+0.5,0.98,cz+sd*w*0.2,sd*0.5,0,0.34,0.16,w*0.3,boom?sg:[0.08,0.1,0.16]);
 for(let k=0;k<8;k++){const f=(k+0.5)/8,h=1.15*(1-f*0.5),ww=w*(1-f*0.72);bx(X0-k*0.22-0.11,0.06+h/2+f*0.3,cz,0.23,h,ww,sh);}
 /* swept fin and T-tail */
 bm(X0-0.95,1.75,cz,0,0,1.1,1.25,0.09,sh,false,0.45);bm(X0-0.75,1.15,cz,0,0,1.5,0.3,0.12,sh);
 for(const sd of [-1,1])surf(X0-1.05,2.36,cz,sd,1.3,0.75,0.35,0.45,0.06,0,sh,3);
 /* wings: low, swept back and tapered, with a winglet at each tip, a flap line, a fairing at the root and the nav lights */
 const span=3.3,root=2.3,tip=0.7,sweep=1.5,xr=X0+L*0.6;
 for(const sd of [-1,1]){const wz=sd>0?Z1:Z0;
  surf(xr,0.42,wz,sd,span,root,tip,sweep,0.08,0.1,sg,4);surf(xr-root+0.32,0.47,wz,sd,span*0.62,0.42,0.3,sweep*0.62*(1-0.15),0.02,0.06,boom?sg:[0.6,0.62,0.66],3);
  const tz=wz+sd*span,tle=xr-sweep;bm(tle-tip/2-0.08,0.8,tz+sd*0.02,0,0,tip*0.85,0.6,0.05,sh,false,0.35);bm(tle-tip/2-0.2,1.09,tz+sd*0.02,0,0,tip*0.5,0.06,0.05,boom?sg:st);
  bx(xr-root*0.45,0.36,wz+sd*0.18,root*0.95,0.2,0.4,sg);
  if(!boom&&(Math.sin(T*3)>0.6))bx(tle-0.12,0.55,tz+sd*0.04,0.1,0.1,0.1,sd>0?[0.2,1,0.3]:[1,0.15,0.15],true);
 /* engines on the rear fuselage: pylon, an eight-sided nacelle, dark intake and exhaust */
  const ex=X0+0.9,ez=wz+sd*0.62,ey=1.0;bx(ex+0.05,ey,wz+sd*0.22,0.7,0.12,0.4,sg);
  for(let r=0;r<4;r++)bm(ex,ey,ez,0,r*Math.PI/4,1.55,0.24,0.58,r%2?sg:sh);
  bm(ex+0.79,ey,ez,0,Math.PI/8,0.02,0.44,0.44,[0.05,0.05,0.07]);bm(ex+0.8,ey,ez,0,0,0.03,0.16,0.16,boom?sg:[0.4,0.42,0.46]);
  bm(ex-0.8,ey,ez,0,Math.PI/8,0.06,0.36,0.36,[0.12,0.12,0.14]);}
 if(!roof)drawCabin(B,g,b,bx,bm);}
/* the cabin, fitted out like a private jet: club seats facing over walnut tables, a leather divan, the bar, the cockpit behind a
   bulkhead, gold on a pallet in the hold, a runner down the aisle and lights along the ceiling. The seat cells ('k') are solid. */
function drawCabin(B,g,b,bx,bm){if(g.jet&&g.jet.boom)return;const at=(c,r)=>[b.x0+(c-10)+0.5,b.z0+(r-4)+0.5],T=g.T||0;
 {const S=jetSkin(g,b);for(let ix=b.x0+1;ix<b.x1-1;ix++)for(let iz=b.z0+1;iz<b.z1-1;iz++)if(!S.set.has(ix+','+iz))bx(ix+0.5,-0.03,iz+0.5,1.01,0.06,1.01,(ix+iz)%2?[0.3,0.2,0.24]:[0.33,0.22,0.26]);}
 const lea=[0.86,0.79,0.64],lea2=[0.74,0.66,0.52],wal=[0.36,0.2,0.1],gold=[0.95,0.75,0.25],cream=[0.92,0.88,0.78];
 const seat=(c,r,d,col)=>{const [x,z]=at(c,r),cl=col||lea;bx(x,0.16,z,0.62,0.3,0.6,[0.25,0.22,0.2]);bx(x+d*0.04,0.36,z,0.58,0.12,0.56,cl);
  bx(x-d*0.27,0.66,z,0.14,0.62,0.56,cl);bx(x-d*0.3,0.98,z,0.12,0.18,0.34,lea2);for(const sd of [-1,1])bx(x,0.48,z+sd*0.3,0.56,0.12,0.08,lea2);};
 const table=(c,r)=>{const [x,z]=at(c,r);bx(x,0.3,z,0.1,0.55,0.1,[0.6,0.6,0.62]);bx(x,0.58,z,0.62,0.04,0.66,wal);bx(x,0.605,z,0.66,0.012,0.7,gold);
  bx(x+0.12,0.66,z-0.1,0.05,0.09,0.05,[0.85,0.9,0.95]);bx(x-0.1,0.625,z+0.12,0.2,0.03,0.14,[0.08,0.08,0.08]);};
 /* club seats either side of a table, on both sides of the aisle */
 for(const r of [5,7]){seat(14,r,1);table(15,r);seat(16,r,-1);}
 /* the divan along the starboard wall */
 {const [x0,z]=at(18,7),x=x0+0.5;bx(x,0.18,z,1.9,0.34,0.62,[0.25,0.22,0.2]);bx(x,0.4,z-0.03,1.86,0.12,0.56,lea);bx(x,0.68,z+0.3,1.9,0.5,0.14,lea);
  for(const sd of [-1,1])bx(x+sd*0.92,0.5,z,0.1,0.3,0.6,lea2);for(const k of [-0.5,0.5])bx(x+k,0.52,z+0.18,0.32,0.2,0.1,[0.55,0.15,0.18]);}
 /* the bar along the port wall: walnut, a marble top, bottles and glasses */
 {const [x0,z]=at(21,5),x=x0+0.5;bx(x,0.45,z-0.05,1.9,0.9,0.6,wal);bx(x,0.92,z-0.05,1.96,0.05,0.66,[0.95,0.94,0.92]);bx(x,0.6,z+0.26,1.86,0.03,0.02,gold);
  const bc=[[0.2,0.5,0.2],[0.6,0.35,0.1],[0.85,0.85,0.9],[0.5,0.1,0.12],[0.75,0.55,0.2]];for(let k=0;k<5;k++)bx(x-0.7+k*0.32,1.06,z-0.18,0.08,0.22,0.08,bc[k],k===2);
  for(let k=0;k<3;k++)bx(x-0.4+k*0.4,0.99,z+0.08,0.06,0.09,0.06,[0.85,0.9,0.95]);}
 /* bulkhead to the cockpit (the aisle stays open). The cockpit is walk-in: two pilot seats, the yokes, the centre pedestal with the
    throttles, and across the nose the instrument panel with its screens, dials and the glare shield */
 {const bxh=b.x0+14,J=g.jet,D=J&&J.door,steel=[0.42,0.44,0.48];
  /* the bulkhead and the armoured cockpit door: thick steel, a keypad service panel on the cabin side; it slides into the wall once hacked */
  for(const r of [5,7]){const [,z]=at(24,r);bx(bxh+0.16,0.575,z,0.32,1.15,1.0,[0.93,0.93,0.94]);bx(bxh-0.005,0.5,z,0.01,0.06,1.0,wal);}
  if(D){const o=D.o||0,dz=D.z-o*0.95;bx(bxh+0.16,0.575,dz,0.3,1.13,0.96,steel);bx(bxh-0.003,0.575,dz,0.01,1.0,0.86,[0.32,0.34,0.38]);
   for(const k of [-0.3,0,0.3])bx(bxh-0.006,0.575+k,dz,0.012,0.04,0.8,[0.25,0.27,0.3]);
   if(o<=0){const pz=D.z+0.3,hk=J.hack||0,ok=J.ph!=='guards';bx(bxh-0.02,0.7,pz,0.03,0.24,0.16,[0.08,0.08,0.1]);bx(bxh-0.035,0.78,pz,0.01,0.05,0.12,hk>0?[0.3,1,0.5]:[1,0.2,0.2],ok);
    for(let k=0;k<6;k++)bx(bxh-0.035,0.62+(k>>1)*0.05,pz-0.03+(k&1)*0.06,0.01,0.03,0.03,[0.6,0.6,0.62]);
    if(hk>0)bx(bxh-0.04,1.0,D.z,0.012,0.06,0.8*hk,[0.3,1,0.5],true);}}
  const dk=[0.1,0.1,0.12],gy=[0.22,0.23,0.26];for(const r of [5,7])seat(26,r,1,[0.32,0.33,0.36]);
  const PX=b.x1-1.32,[,pz]=at(26,6);bx(PX,0.42,pz,0.5,0.84,2.7,dk);bx(PX-0.05,0.86,pz,0.62,0.06,2.8,[0.05,0.05,0.06]);
  for(let k=0;k<4;k++){const z=pz-1.0+k*0.66,hue=[[0.15,0.5,0.95],[0.2,0.85,0.4],[0.15,0.5,0.95],[0.95,0.6,0.15]][k];bx(PX-0.26,0.6,z,0.01,0.26,0.36,[0.03,0.03,0.04]);bx(PX-0.265,0.6,z,0.01,0.2,0.3,hue,Math.sin(T*1.5+k)>-0.6);}
  for(let k=0;k<10;k++)bx(PX-0.262,0.34,pz-1.1+k*0.24,0.01,0.05,0.05,k%4===0?[1,0.25,0.2]:[1,0.8,0.3],Math.sin(T*3+k*2.1)>0.2);
  {const [cx]=at(26,6);bx(cx+0.05,0.28,pz,0.6,0.56,0.36,gy);for(let k=0;k<3;k++)bx(cx-0.1+k*0.14,0.62,pz,0.03,0.14,0.03,[0.6,0.6,0.62]);for(let k=0;k<3;k++)bx(cx-0.1+k*0.14,0.7,pz,0.06,0.04,0.06,k===1?[0.9,0.2,0.2]:GOLD);
   bx(cx+0.25,0.57,pz,0.12,0.02,0.3,[0.03,0.03,0.04]);bx(cx+0.25,0.58,pz,0.1,0.01,0.24,[0.3,0.9,0.5],true);}
  for(const r of [5,7]){const [x,z]=at(26,r);bx(x+0.4,0.4,z,0.05,0.4,0.05,[0.2,0.2,0.22]);bx(x+0.38,0.62,z,0.04,0.06,0.3,[0.2,0.2,0.22]);for(const sd of [-1,1])bx(x+0.38,0.66,z+sd*0.14,0.04,0.1,0.04,[0.2,0.2,0.22]);
   bx(x,0.32,z+(r===5?-0.42:0.42),0.7,0.3,0.12,gy);}}
 /* gold on a pallet in the hold */
 {const [x,z]=at(11,7);bx(x,0.06,z,0.8,0.12,0.8,[0.5,0.38,0.22]);for(let l=0;l<3;l++)for(let k=0;k<(3-l);k++)for(let m=0;m<2;m++)bx(x-0.2+k*0.2+l*0.1,0.17+l*0.09,z-0.12+m*0.24,0.17,0.08,0.2,gold,l===2);}
 /* the aisle runner and the ceiling lights */
 {const [x0,z]=at(11,6),[x1]=at(25,6);bx((x0+x1)/2,0.008,z,x1-x0+0.6,0.006,0.5,cream);for(const sd of [-1,1])bx((x0+x1)/2,0.01,z+sd*0.24,x1-x0+0.6,0.006,0.03,gold);
  for(let x=x0;x<=x1;x+=1.0)for(const sd of [-1,1])bx(x,1.08,z+sd*1.32,0.12,0.03,0.08,[1,0.92,0.75],true);}}
/* the runway under the jet: asphalt, centre-line dashes, edge lines and lights, distance blocks. During the take-off run they all
   slide west past the jet (J.dist), so the plane reads as moving east down the runway. */
function drawRunway(bx,g,b){const J=g.jet,o=J?(J.dist||0):0,T=g.T||0,cz=b.cz,W=g.W,hw=4.1,x0=1,x1=W-1,X=(x1+x0)/2,wht=[0.9,0.9,0.86];
 bx(X,0.008,cz,x1-x0,0.008,hw*2,[0.12,0.12,0.13]);
 for(const sd of [-1,1]){bx(X,0.02,cz+sd*(hw-0.25),x1-x0,0.008,0.1,wht);bx(X,0.008,cz+sd*(hw+0.9),x1-x0,0.008,1.6,[0.16,0.3,0.14]);}
 const rep=(gap,f)=>{const s=((o%gap)+gap)%gap;for(let x=x0-gap+gap-s;x<x1+gap;x+=gap)if(x>x0+0.3&&x<x1-0.3)f(x);};
 rep(2.4,x=>bx(x,0.02,cz,1.3,0.008,0.14,wht));
 rep(9,x=>{for(const sd of [-1,1])bx(x,0.02,cz+sd*1.9,2.2,0.008,0.5,wht);});
 rep(3,x=>{for(const sd of [-1,1]){bx(x,0.05,cz+sd*(hw+0.15),0.12,0.08,0.12,[0.25,0.25,0.25]);bx(x,0.1,cz+sd*(hw+0.15),0.1,0.04,0.1,[1,0.95,0.7],true);}});
 rep(17,x=>{for(const sd of [-1,1]){bx(x,0.25,cz+sd*(hw+1.2),0.9,0.5,0.12,[0.06,0.06,0.07]);bx(x,0.25,cz+sd*(hw+1.13),0.6,0.3,0.02,[1,1,1],true);}});
}
function drawHangar(B,g){const bx=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x,y,z,0,sx,sy,sz),c,!!em),T=g.T||0;
 if(g.sid==='hangar'&&g.jetBody){drawJet(B,g,g.jetBody,true);const W=g.valeW;if(W){if(!W.aboard&&!fogHid(W.n.x,W.n.z))drawChar(CB(W.n),W.n);const s=W.stairs;
   bx(s.x,0.03,s.z,0.9,0.015,0.9,W.aboard?[0.3,1,0.5]:[1,0.25,0.25],true);}
  const b=g.jetBody;bx(b.x1+2.4,0.35,b.cz,1.4,0.6,1.0,[0.95,0.75,0.1]);bx(b.x1+1.4,0.25,b.cz,1.2,0.04,0.06,[0.1,0.1,0.12]);}
 if(g.sid==='jet'&&g.jetBody){drawRunway(bx,g,g.jetBody);drawJet(B,g,g.jetBody,false);const J=g.jet;if(J&&J.valve&&!J.boom){const v=J.valve,ready=g.boss&&!g.boss.alive&&!(J.fuse>0);bx(v.x,0.5,v.z,0.6,1.0,0.5,[0.85,0.2,0.15]);bx(v.x,1.05,v.z,0.3,0.06,0.3,[0.1,0.1,0.12]);
   bx(v.x,1.15,v.z,0.36,0.08,0.08,ready?[1,0.85,0.2]:[0.4,0.32,0.1],ready&&Math.sin(T*8)>0);if(J.fuse>0)bx(v.x,0.02,v.z,1.2+0.2*Math.sin(T*6),0.01,1.2,[0.5,0.42,0.18]);}}
}
/* the side door and boarding stairs between stages (the garage stairs are stairs.js) */
function drawA4Stairs(B,g,s){const x=s.at[0],z=s.at[1],bx=(px,py,pz,sx,sy,sz,c,em)=>B.box(TRS(px,py,pz,0,sx,sy,sz),c,!!em),T=g.T||0,lock=act4Locked(g,s);
 if(s.id==='down')return; /* the garage stairs are drawn once with the level (stairs.js) */
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
 const J=isHangar(g)&&g.jet;
 if(J&&J.door&&J.ph==='roll'&&Math.hypot(p.x-J.door.x,p.z-J.door.z)<1.5)return {b:'HACK',h:'HACK THE COCKPIT DOOR'};
 if(J&&J.ph==='stop'&&Math.hypot(p.x-J.thr.x,p.z-J.thr.z)<1.3)return {b:'BRAKES',h:'PULL THE THROTTLES BACK'};
 if(J&&J.valve&&J.stopped&&!J.fuse&&!J.boom&&Math.hypot(p.x-J.valve.x,p.z-J.valve.z)<1.4)return {b:'VALVE',h:'OPEN THE FUEL VALVE'};
 return null;}
function act4Grab(p){const g=G;if(!g||!p)return false;
 if(isGarage(g)&&g.lever&&g.vans&&g.vans.some(v=>v.st==='wait'||v.st==='go')&&boomPull(p))return true;
 if(g.rest&&g.locker&&!g.locker.open&&g.pilot&&g.pilot.st==='gone'&&!g.obj.done&&Math.hypot(p.x-g.locker.x,p.z-g.locker.z)<1.6){g.locker.open=true;restPass(g,g.locker.x,g.locker.z,'A spare pass and tonight\'s flight plan, taped inside the door.');return true;}
 if(isHangar(g)&&g.jet&&(hackStart(p)||brakesPull(p)||valvePull(p)))return true;
 return false;}
/* killEnemy hook: shots on Vale spoil the accident; a dead driver lets his van coast to a stop (vanTick); Frankie's last words */
function act4Kill(e,type){const g=G;if(!g)return;
 if(e.vale){g.valeShot=g.valeHand===undefined?(GUNS.includes(type)||!!(WD[type]&&!WD[type].melee)):!g.valeHand;g.objNow=true;}
 if(e.mini==='frankie'){const gus=CHARS[selIdx].id==='consigliere';popup(e.x,e.z-0.4,gus?'"IT WAS BUSINESS, GUS. JUST BUSINESS."':'"VALE... PAYS... BETTER..."','#ffd36b');
  if(gus)a4Later(g,1600,()=>banner('FRANKIE LO PRESTI','The man who set up the diner on Passyunk Avenue. Philadelphia will hear about it.'));}}
function act4Guide(g){const p=g.player;
 if(g.jet&&g.jet.fuse>0&&!g.jet.boom&&!g.jet.out){const d=jetSkin(g,g.jetBody).doors[0];if(d)return {x:d.x,z:d.z,k:'late',lbl:'GET OUT'};}
 {const J=g.jet;if(J&&!J.boom&&!g.fin&&!g.mercy){if(J.ph==='roll'&&J.door)return {x:J.door.x,z:J.door.z,k:'obj',lbl:'HACK THE DOOR'};
  if(J.ph==='vale'&&g.boss&&g.boss.alive&&!g.boss.spared)return {x:g.boss.x,z:g.boss.z,k:'obj',lbl:'VALE'};
  if(J.ph==='stop')return {x:J.thr.x,z:J.thr.z,k:'obj',lbl:'THE THROTTLES'};
  if(J.stopped&&!J.fuse&&J.valve)return {x:J.valve.x,z:J.valve.z,k:'obj',lbl:'OPEN THE FUEL VALVE'};}}
 if(g.vans&&g.lever&&g.vans.some(v=>v.st==='go'&&v.e.alive&&v.z>=g.lane.z-0.01))return {x:g.lever.x,z:g.lever.z,k:'obj',lbl:'DROP THE BARRIER'};
 if(g.pilot&&g.pilot.st==='run')return {x:g.pilot.n.x,z:g.pilot.n.z,k:'obj',lbl:'CATCH THE PILOT'};
 if(g.pilot&&g.pilot.st==='gone'&&g.locker&&!g.locker.open&&!g.obj.done)return {x:g.locker.x,z:g.locker.z,k:'obj',lbl:'OPEN THE LOCKER'};
 if(g.pilot&&g.pilot.st==='sit'&&(g.tip||!g.enemies.some(e=>e.alive)))return {x:g.pilot.n.x,z:g.pilot.n.z,k:'obj',lbl:'THE PILOT'};
 return null;}
/* the results card for Act 4's last floor reads like the next morning's paper */
function act4Results(g){if(!g||!g.jet||!g.jet.boom)return null;const clean=g.accident==='clean';
 return {title:'BANKER DIES IN FIERY RUNWAY CRASH',html:`<br>THE MORNING PAPER<b style="color:${clean?'#7dff9a':'#ff8a95'}">${clean?'"INVESTIGATORS BLAME A FUEL LEAK"':'"POLICE PUZZLED BY BULLET HOLES"'}</b><br>ACCIDENT<b style="color:${clean?'#7dff9a':'#ff8a95'}">${clean?'CLEAN  +$'+fmt(Math.round(A4_CLEAN_PAY*Dd().mult)):'MESSY: VALE WAS SHOT'}</b>`};}
