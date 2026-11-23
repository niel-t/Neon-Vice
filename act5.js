'use strict';
/* ACT 5: OLD GOLD (campaign indexes 14 to 16). Vale's black book says McWey kept forty bars of the Family's Havana gold in 1959, and New
   York sends Don Ettore Bastiani, "the Cardinal", to collect the gold and McWey with it. Stage defs are in missions.js.
   - c14 The Grand Biscayne (lobby, laundry, roof): the bell captain's old locker in the laundry holds his 1959 ledger and the service
     lift key (OPEN). On the roof the hotel's sheets hang on the lines: stand among them without shooting and nobody sees you. The
     Cardinal's nephew Nunzio, "the Altar Boy", holds the roof.
   - c15 La Habana (pier, deck, casino): the forty bars sit in the casino cage. Crack it (CRACK, stand at the cage for a few seconds)
     for the gold, or open the sea cock in the engine room (SINK): the crew abandons ship and you have a few seconds to reach the launch.
     Gamblers sit at the tables until the first shot, and you can stand among them unseen.
   - c16 McWey Tower (lobby, office, roof): on the 52nd floor you hold McWey's office through three waves; then the stairs up to the
     roof, where the Cardinal waits by his helicopter. At half health its door gunner strafes the roof. Beaten, he offers a deal:
     [1] take it (he takes McWey, you take the chair) or [2] finish him (you stand with McWey). The payout records mc_chair/mc_stood,
     which pick the ending (act5End, act5Finale).
   index.html calls in from stageIntro/Goal/Locked/LockHint, updateStage, drawStage, objAction/objGrab, killEnemy, updateMercy/updateFin,
   updateCrowd (a5Hide), buildStatic (drawAct5Sets), payout and the results card; guide.js asks act5Guide. act4.js helpers (a4Cells,
   a4Later, a4Path, a4Walk) are shared. Everything keys on the mission id, so other floors never see it. */
const A5_KIND={c14:'hotel',c15:'ship',c16:'siege'};
const a5Kind=g=>g&&g.stageManaged&&!g.def.hub?A5_KIND[g.mission]||null:null;
const A5_GOLD_PAY=8000,A5_SINK_PAY=1500,A5_CRACK=6,A5_SINK_T=25,A5_LEDGER_PAY=1500;
/* what has to carry from one stage to the next (challenges read it on the last stage); reset on each floor's first stage */
let A5RUN={};
const A5_FAMILY=()=>({jacket:[0.1,0.1,0.12],shirt:[0.92,0.9,0.86],tie:[0.45,0.06,0.1],pants:[0.1,0.1,0.12],shoes:[0.05,0.05,0.05],hat:'fedora',hatC:[0.12,0.11,0.12],pin:1});
const NUNZIO_LOOK=()=>({skin:[0.9,0.74,0.6],jacket:[0.05,0.05,0.06],shirt:[0.05,0.05,0.06],tie:[0.97,0.97,0.97],pants:[0.05,0.05,0.06],shoes:[0.04,0.04,0.04],hs:'slick',hair:[0.1,0.08,0.07],medallion:true,body:'big',bw:1.12,bd:1.08,bh:1.04});
const CROUPIER_LOOK=()=>({jacket:[0.96,0.95,0.92],shirt:[0.96,0.95,0.92],vest:[0.6,0.06,0.1],tie:[0.06,0.06,0.07],pants:[0.08,0.08,0.09],shoes:[0.05,0.05,0.05],hat:null});
function a5Dress(g){const k=a5Kind(g);for(const e of g.enemies){if(e.boss||e.kind)continue;
 if(k==='ship'&&g.sid==='casino'&&e.weapon&&!WD[e.weapon.type].melee&&Math.random()<0.5)Object.assign(e.look,CROUPIER_LOOK());else Object.assign(e.look,A5_FAMILY());}}
/* Lex, if you spared him, still calls in with a tip and the guide from the start (g.tip); if he died, nothing changes now */
function act5Lex(g,msg){if(typeof lexFate==='function'&&lexFate()==='spared'){g.tip=true;a4Later(g,3200,()=>banner('LEX, THE SPARED',msg));}}
function a5Lift(g,s){return {x:s.at[0],z:s.at[1]};}

/* ---------------- intros, goals and locks ---------------- */
function act5Intro(g){const k=a5Kind(g);if(!k)return false;a5Dress(g);g.a5s=g.shots||0;g.a5shotT=-9;
 if(k==='hotel'){
  if(g.sid==='lobby'){A5RUN={};banner('ACT 5: OLD GOLD','Floor 1: The Grand Biscayne · The Family has taken the hotel');act5Lex(g,'Lex calls: "The old locker is behind the washers. Nobody\'s opened it in years."');}
  else if(g.sid==='laundry')ledgerSetup(g);
  else roofSetup(g);
  return true;}
 if(k==='ship'){
  if(g.sid==='pier'){A5RUN={};banner('FLOOR 2: LA HABANA','Government Cut · the gangway is at the end of the pier');act5Lex(g,'Lex radios: "The cage code is the year he left Havana. Crack it fast."');}
  else if(g.sid==='deck')banner('THE CARGO DECK','The stairs down to the casino are in the far corner.');
  else casinoSetup(g);
  return true;}
 if(g.sid==='lobby'){A5RUN={};banner('FLOOR 3: McWEY TOWER','The Cardinal\'s men have the lobby. The lift is at the back.');act5Lex(g,'Lex calls: "I\'m outside. Nobody else goes in or out. Go."');}
 else if(g.sid==='office')officeSetup5(g);
 else cardRoofSetup(g);
 return true;}
function act5Goal(g){const k=a5Kind(g);if(!k)return null;
 if(k==='hotel')return g.sid==='lobby'?'TAKE THE STAIRS DOWN':g.sid==='laundry'?(g.ledger&&g.ledger.open?'TAKE THE SERVICE LIFT UP':'FIND THE BELL CAPTAIN\'S LEDGER'):null;
 if(k==='ship')return g.sid==='pier'?'UP THE GANGWAY':g.sid==='deck'?'TAKE THE STAIRS DOWN':null;
 if(g.sid==='lobby')return 'TAKE THE LIFT UP';
 if(g.sid==='office')return g.held?'UP TO THE ROOF':'HOLD THE OFFICE  ·  WAVE '+Math.max(1,Math.min(3,(g.wave&&g.wave.n)||1))+' / 3';
 return null;}
function act5Locked(g,s){const k=a5Kind(g);if(!k)return false;
 if(k==='hotel'&&g.sid==='laundry'&&s.id==='lift')return !(g.ledger&&g.ledger.open);
 if(k==='siege'&&g.sid==='office'&&s.id==='up')return !g.held;return false;}
function act5LockHint(g){const k=a5Kind(g);if(!k)return false;
 popup(g.player.x,g.player.z,k==='hotel'?'THE LIFT KEY IS IN THE BELL CAPTAIN\'S LOCKER':'NOT WHILE THEY\'RE STILL COMING','#ff8a95');return true;}
function a5StairLbl(g,s){return s.id==='lift'?'TAKE THE LIFT':s.id==='gang'?'UP THE GANGWAY':null;}

/* ---------------- floor 15: the Grand Biscayne ---------------- */
function ledgerSetup(g){const N=a4Cells(g,'N')[0];if(N){g.ledger={x:N.x,z:N.z,open:false};g.solid[N.iz*g.W+N.ix]=1;}
 g.obj={label:'FIND THE BELL CAPTAIN\'S LEDGER',n:0,total:1,done:false};
 banner('THE LAUNDRY','Where McWey\'s mother did the sheets. The bell captain\'s locker is down here somewhere.');}
function ledgerOpen(g){const L=g.ledger;if(!L||L.open)return;L.open=true;g.obj.n=1;g.obj.done=true;g.objNow=false;
 A5RUN.quiet=!g.enemies.some(e=>e.alive&&e.state==='chase');
 const pay=Math.round(A5_LEDGER_PAY*Dd().mult);g.score+=pay;g.gpts=(g.gpts||0)+A5_LEDGER_PAY;sfx('cash');popup(L.x,L.z,'THE LEDGER  +$'+fmt(pay),'#7dff9a');
 banner('THE BELL CAPTAIN\'S LEDGER','"Havana cage, 1959: 412 bars in, 372 out." And the service lift key, on a brass ring.');g.obj=null;/* a floor change can't carry an objective */}
function roofSetup(g){placeStash(g,14);g.sheets=a4Cells(g,'~');g.sheetSet=new Set(g.sheets.map(q=>q.iz*g.W+q.ix));
 const o=a4Cells(g,'o')[0];if(o){const e=makeEnemy(g,g.def,14,'shotgun',false,o.x,o.z);Object.assign(e.look,NUNZIO_LOOK());e.body='big';e.hp=e.maxhp=6;e.r=0.34;e.spd=0.95;e.pers='careful';e.mini='nunzio';g.nunzio=e;if(typeof buildRadar==='function')buildRadar(g);}
 banner('THE ROOF','The sheets are still on the lines. Stand among them, hold your fire, and nobody sees you.');}
function nunzioTick(g){const n=g.nunzio;if(!n||!n.alive)return;
 if(!g.nunzioSeen&&n.state==='chase'){g.nunzioSeen=1;banner('NUNZIO, "THE ALTAR BOY"','The Cardinal\'s nephew. Six hits to put him down.');popup(n.x,n.z-0.4,'"MY UNCLE SAYS A PRAYER FOR YOU."','#ffd36b');}
 if(!g.nunzioHelp&&n.hp<=n.maxhp/2){g.nunzioHelp=1;popup(n.x,n.z,'"UP HERE! ON THE ROOF!"','#ff8a95');let c=0;for(const [dx,dz] of [[-1.5,1.5],[1.5,1.5],[0,2.5],[-2.5,0],[2.5,0]]){const x=clamp(n.x+dx,1.5,g.W-1.5),z=clamp(n.z+dz,1.5,g.H-1.5);if(c>=2||blk(g,x,z))continue;c++;const e=makeEnemy(g,g.def,14,'pistol',false,x,z);Object.assign(e.look,A5_FAMILY());e.state='chase';e.seeT=0;}if(typeof buildRadar==='function')buildRadar(g);}}
/* standing among the sheets (or the gamblers) hides you from anybody who isn't already after you, until you shoot */
function a5Hide(g,p){const k=a5Kind(g);if(!k||!p)return null;if((g.T||0)-(g.a5shotT||-9)<1.4)return null;
 if(g.sheetSet){const ix=Math.floor(p.x),iz=Math.floor(p.z);for(const [dx,dz] of [[0,0],[0,-1],[0,1]])if(g.sheetSet.has((iz+dz)*g.W+ix+dx))return 'IN THE SHEETS';}
 if(g.gamblers&&!g.panic&&g.gamblers.some(n=>!n.gone&&Math.hypot(n.x-p.x,n.z-p.z)<1.2))return 'AMONG THE GAMBLERS';
 return null;}

/* ---------------- floor 16: La Habana ---------------- */
function casinoSetup(g){placeStash(g,15);const N=a4Cells(g,'N'),q=a4Cells(g,'q')[0];
 if(N.length){for(const c of N)g.solid[c.iz*g.W+c.ix]=1;const x=N.reduce((s,c)=>s+c.x,0)/N.length,z=N[0].z;g.cage={x,z,w:N.length,crack:0,cracking:0,open:false,warn:0};}
 if(q){g.valve={x:q.x,z:q.z};g.solid[q.iz*g.W+q.ix]=1;}
 g.gamblers=a4Cells(g,'t').map(c=>{const n=makeChar(c.x,c.z,NPCLOOK.guest(),false);n.kind='crowd';n.a=Math.random()*TAU;n.r=0.26;n.ph=Math.random()*TAU;return n;});
 g.obj={label:'THE FORTY BARS: CRACK THE CAGE OR SINK HER',n:0,total:1,done:false};g.objNow=true;
 banner('THE CASINO','The forty bars are in the cage. Crack it, or open the sea cock in the engine room and sink her.');}
function cagePay(g){const C=g.cage;C.open=true;C.cracking=0;g.a5gold='back';g.obj.n=1;g.obj.done=true;g.objNow=false;
 const pay=Math.round(A5_GOLD_PAY*Dd().mult);g.score+=pay;g.gpts=(g.gpts||0)+3000;sfx('cash');shake(0.3);popup(C.x,C.z,'FORTY BARS  +$'+fmt(pay),'#7dff9a');
 banner('THE FORTY BARS','Every one stamped HAVANA 1959. '+(g.enemies.some(e=>e.alive)?'Finish the crew, then the launch.':'Get them down to the launch.'));}
function sinkOpen(g){const V=g.valve;g.sink={t:A5_SINK_T};g.a5gold='sunk';g.obj.n=1;g.obj.done=true;g.objNow=false;
 const pay=Math.round(A5_SINK_PAY*Dd().mult);g.score+=pay;g.gpts=(g.gpts||0)+A5_SINK_PAY;sfx('door');shake(0.5);popup(V.x,V.z,'SEA COCK OPEN  +$'+fmt(pay),'#ffd36b');
 let n=0;for(const e of g.enemies)if(e.alive&&!e.boss){e.alive=false;e.sunk=true;n++;}g.panic=1;
 banner('SHE IS GOING DOWN',(n?'The crew is abandoning ship. ':'')+'Get to the launch: '+A5_SINK_T+' seconds');}
function casinoTick(dt,g){const p=g.player,C=g.cage;
 if(!g.panic&&(g.shots||0)>0){g.panic=1;for(const n of g.gamblers){n.path=a4Path(g,n.x,n.z,g.car.x,g.car.z);n.run=1;}popup(p.x,p.z-0.5,'THE GAMBLERS RUN FOR THE LAUNCH','#ffd36b');}
 for(const n of g.gamblers){if(n.gone)continue;if(n.run){if(a4Walk(n,dt,3.2)||!n.path.length)n.gone=1;}else{n.ph+=dt;n.a+=Math.sin(n.ph*0.6)*dt*0.3;}}
 if(C&&C.cracking&&!C.open){if(p.alive&&Math.hypot(p.x-C.x,p.z-C.z)<2.1){const T=g.tip?A5_CRACK/2:A5_CRACK,h0=Math.floor(C.crack*5);C.crack=Math.min(1,C.crack+dt/T);
   if(Math.floor(C.crack*5)!==h0&&C.crack<1){popup(C.x,C.z-0.5,'CRACKING '+Math.floor(C.crack*100)+'%','#7dff9a');sfx('blip');}if(C.crack>=1)cagePay(g);}
  else if(!C.warn){C.warn=1;popup(C.x,C.z-0.5,'CRACKING PAUSED','#ff8a95');}}
 const S=g.sink;if(S&&!g.done&&p.alive){const s0=Math.ceil(S.t);S.t-=dt;if(Math.ceil(S.t)!==s0&&S.t>0&&S.t<=10){popup(p.x,p.z-0.6,'SINKING  '+Math.ceil(S.t),'#ff8a95');sfx('blip');}
  if(Math.random()<dt*2){shake(0.15);rumble(0.3,0.3,150);}
  if(S.t<=0){S.t=0;banner('LA HABANA GOES DOWN','You went down with her.');p.armor=0;for(let k=0;k<8&&p.alive;k++){p.armorT=0;hurtPlayer([0,1],'grenade',99);}}}}

/* ---------------- floor 17: McWey Tower ---------------- */
function officeSetup5(g){const m=makeChar(16.5,4.3,NPCLOOK.mcwey(),false);m.kind='mcwey';m.state='idle';m.a=0;m.r=0.32;m.body=m.look.body;g.mcwey=m;
 g.wave={n:0,t:2.5};g.spawns=a4Cells(g,'e');g.held=false;
 g.obj={label:'HOLD THE OFFICE',n:0,total:3,done:false};
 banner('THE 52ND FLOOR','McWey is behind his desk. Hold the office until the Cardinal runs out of men.');
 a4Later(g,1800,()=>popup(m.x,m.z-0.5,'"ABOUT TIME! MIND THE SHARK!"','#ffd36b'));}
const A5_WAVES=[['pistol','smg','bat'],['shotgun','mac10','pistol','knife'],['spas12','smg','colt45','mac10','bat']];
const A5_MC_LINES=['"THERE\'S MORE OF THEM ON THE STAIRS!"','"THAT\'S ITALIAN MARBLE, YOU ANIMALS!"','"LAST ONES, KID! I CAN HEAR THE OLD MAN\'S CHOPPER!"'];
function a5OfficeTick(dt,g){const W=g.wave,m=g.mcwey;if(!W||g.held)return;
 if(m)for(const e of g.enemies)if(e.alive&&!e.boss&&Math.hypot(e.x-m.x,e.z-m.z)<1.3&&(g.T||0)>(g.mcHitT||0)){g.mcHitT=(g.T||0)+3;A5RUN.mcHit=1;popup(m.x,m.z-0.5,'"OW! THIS SUIT IS SILK!"','#ff8a95');sfx('punch');}
 if(g.enemies.some(e=>e.alive))return;
 if(W.n>=3){g.held=true;A5RUN.held=1;g.obj=null;g.objNow=false;sfx('clear');banner('THE OFFICE HOLDS','McWey: "The roof, kid! He\'s landing on my roof!"');if(m)popup(m.x,m.z-0.5,'"GO! THE STAIRS!"','#ffd36b');return;}
 W.t-=dt;if(W.t>0)return;
 const list=A5_WAVES[W.n],sp=g.spawns.length?g.spawns:[{x:g.W/2,z:g.H-2}];
 list.forEach((k,i)=>{const s=sp[i%sp.length],x=s.x+(i>=sp.length?0.6:0),z=s.z;const e=makeEnemy(g,g.def,16,k,false,x,z);Object.assign(e.look,A5_FAMILY());e.state='chase';e.seeT=0;if(typeof AI!=='undefined'&&g.player)AI.know(e,AI.belief.make(g.player.x,g.player.z,g.T||0,'call'));});
 W.n++;g.obj.n=W.n-1;W.t=3.5;if(typeof buildRadar==='function')buildRadar(g);sfx('alert');
 banner('WAVE '+W.n+' OF 3','The Cardinal\'s men are coming up the back stairs');if(m)popup(m.x,m.z-0.5,A5_MC_LINES[W.n-1],'#ffd36b');}
function cardRoofSetup(g){placeStash(g,16);const y=a4Cells(g,'y');
 if(y.length){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const q of y){x0=Math.min(x0,q.ix);x1=Math.max(x1,q.ix+1);z0=Math.min(z0,q.iz);z1=Math.max(z1,q.iz+1);}g.heli={x:(x0+x1)/2,z:(z0+z1)/2,y:0,go:0,x0,x1,z0,z1};}
 g.strafe=null;banner('THE ROOF','The Cardinal is standing by his helicopter, and he has been waiting for you.');}
function cardTick(dt,g){const b=g.boss,p=g.player,H=g.heli;
 if(H&&H.go){H.go+=dt;H.y=Math.min(30,H.y+dt*(1+H.go*1.5));if(Math.random()<dt*8)g.parts.push({t:'c',x:H.x+rnd(-1.5,1.5),y:0.05,z:H.z+rnd(-1.5,1.5),vx:rnd(-2,2),vy:0.2,vz:rnd(-2,2),s:0.08,c:[0.7,0.7,0.72],life:0.6});}
 if(!b||!b.alive||b.spared||g.mercy||g.fin)return;
 if(!g.cardP2&&b.hp<=b.maxhp/2){g.cardP2=1;banner('THE DOOR GUNNER','Stay out of the red lanes. Two more of his men jump down from the helicopter.');popup(b.x,b.z-0.4,'"FINISH THIS ONE FOR ME."','#ffd36b');
  if(H)for(const dx of [-1.6,1.6]){const e=makeEnemy(g,g.def,16,'mac10',false,H.x+dx,H.z1+0.6);Object.assign(e.look,A5_FAMILY());e.state='chase';e.seeT=0;}if(typeof buildRadar==='function')buildRadar(g);
  g.strafe={t:1.5,ph:0,z:0,w:1.8};}
 const S=g.strafe;if(!S)return;S.t-=dt;
 if(S.ph===0&&S.t<=0){S.ph=1;S.t=1.3;S.z=clamp(p.z+rnd(-1,1),2,g.H-2);sfx('blip');}
 else if(S.ph===1&&S.t<=0){S.ph=2;S.t=0.5;sfx('mac');shake(0.4);if(p.alive&&Math.abs(p.z-S.z)<S.w/2)hurtPlayer([0,1],'smg');for(const e of g.enemies)if(e.alive&&!e.boss&&Math.abs(e.z-S.z)<S.w/2)killEnemy(e,'smg',[0,1]);
  for(let i=0;i<24;i++)g.parts.push({t:'c',x:rnd(1.5,g.W-1.5),y:0.05,z:S.z+rnd(-S.w/2,S.w/2),vx:rnd(-0.5,0.5),vy:rnd(0.5,1.5),vz:rnd(-0.5,0.5),s:0.05,c:[1,0.85,0.4],life:0.4});}
 else if(S.ph===2&&S.t<=0){S.ph=0;S.t=b.hp<=b.maxhp/4?2.6:3.6;}}
/* the deal: the Cardinal takes McWey and leaves in his helicopter; his men stand down; Miami is yours */
function act5Deal(g,e){g.cardDeal=1;e.cuffed=1;e.weapon=null;g.strafe=null;for(const q of g.enemies)if(q.alive&&q!==e){q.spared=true;q.state='idle';q.weapon=null;}
 popup(e.x,e.z-0.4,'"A WISE CHOICE. THE CHAIR IS YOURS."','#ffd36b');banner('YOU TOOK THE DEAL','His men go down for McWey. The Cardinal flies home, and Miami is yours.');
 a4Later(g,2200,()=>{e.sunk=true;if(g.heli)g.heli.go=0.01;sfx('boss');a4Later(g,1500,()=>banner('MIAMI IS YOURS','Take the stairs down. Your new office is on the 52nd floor.'));});}
function act5Finished(g,e){g.strafe=null;banner('THE CARDINAL IS DONE','McWey lives, and the helicopter is leaving without its passenger.');if(g.heli)a4Later(g,1200,()=>{g.heli.go=0.01;sfx('boss');});}

/* ---------------- shared hooks ---------------- */
function act5Tick(dt){const g=G,k=a5Kind(g);if(!k||!g.player)return;
 if((g.shots||0)!==g.a5s){g.a5s=g.shots||0;g.a5shotT=g.T||0;}
 if(k==='hotel'&&g.sid==='roof')nunzioTick(g);
 else if(k==='ship'&&g.sid==='casino'&&g.gamblers)casinoTick(dt,g);
 else if(k==='siege'){if(g.sid==='office')a5OfficeTick(dt,g);else if(g.sid==='roof')cardTick(dt,g);}}
function act5Action(p){const g=G;if(!g||!p||!a5Kind(g))return null;
 if(g.ledger&&!g.ledger.open&&Math.hypot(p.x-g.ledger.x,p.z-g.ledger.z)<1.6)return {b:'OPEN',h:'OPEN THE BELL CAPTAIN\'S LOCKER'};
 if(g.cage&&!g.cage.open&&!g.sink&&Math.hypot(p.x-g.cage.x,p.z-g.cage.z)<2.0)return {b:'CRACK',h:'CRACK THE CAGE'};
 if(g.valve&&!g.sink&&!(g.cage&&g.cage.open)&&Math.hypot(p.x-g.valve.x,p.z-g.valve.z)<1.5)return {b:'SINK',h:'OPEN THE SEA COCK'};
 return null;}
function act5Grab(p){const g=G;if(!g||!p||!a5Kind(g))return false;
 if(g.ledger&&!g.ledger.open&&Math.hypot(p.x-g.ledger.x,p.z-g.ledger.z)<1.6){ledgerOpen(g);return true;}
 if(g.cage&&!g.cage.open&&!g.sink&&Math.hypot(p.x-g.cage.x,p.z-g.cage.z)<2.0){g.cage.cracking=1;g.cage.warn=0;popup(g.cage.x,g.cage.z-0.5,'CRACKING '+Math.floor(g.cage.crack*100)+'%','#7dff9a');sfx('blip');return true;}
 if(g.valve&&!g.sink&&!(g.cage&&g.cage.open)&&Math.hypot(p.x-g.valve.x,p.z-g.valve.z)<1.5){sinkOpen(g);return true;}
 return false;}
function act5Kill(e,type){const g=G;if(!g||!a5Kind(g))return;
 if(e.mini==='nunzio'){popup(e.x,e.z-0.4,'"TELL MY UNCLE... I KEPT THE FAITH..."','#ffd36b');a4Later(g,1500,()=>banner('NUNZIO IS DOWN','The roof is clear of the Altar Boy. The service lift is back in the corner.'));}}
function act5Guide(g){const k=a5Kind(g);if(!k)return null;const quiet=g.tip||!g.enemies.some(e=>e.alive);
 if(g.sink&&!g.done)return {x:g.car.x,z:g.car.z,k:'late',lbl:'THE LAUNCH'};
 if(g.cleared)return null;
 if(g.ledger&&!g.ledger.open&&quiet)return {x:g.ledger.x,z:g.ledger.z,k:'obj',lbl:'THE LOCKER'};
 if(g.cage&&!g.cage.open&&!g.sink&&quiet)return {x:g.cage.x,z:g.cage.z,k:'obj',lbl:'THE CAGE'};
 if(k==='siege'&&g.sid==='office'&&!g.held&&g.mcwey&&quiet)return {x:g.mcwey.x,z:g.mcwey.z,k:'obj',lbl:'GUARD McWEY'};
 if(g.sid==='roof'&&k==='siege'&&g.boss&&g.boss.alive&&!g.boss.spared&&!g.mercy)return {x:g.boss.x,z:g.boss.z,k:'obj',lbl:'THE CARDINAL'};
 return null;}
/* the payout keeps what this act decided: the bars (floor 16) and McWey (floor 17) */
function act5Pay(g,w){if(!g||!w)return;
 if(g.mission==='c15'&&g.a5gold){if(g.a5gold==='back'){w.gold_back=1;delete w.gold_sunk;}else{w.gold_sunk=1;delete w.gold_back;}}
 if(g.mission==='c16'){if(g.cardDeal){w.mc_chair=1;delete w.mc_stood;}else{w.mc_stood=1;delete w.mc_chair;}}}
/* the ending's name: stand with McWey, or take his chair */
function act5End(){if(typeof dlgFlag!=='function')return null;if(dlgFlag('mc_chair'))return {title:'THE NEW McWEY',quote:"Every chair in Miami was somebody else's first."};
 if(dlgFlag('mc_stood'))return {title:'THE LAST HONEST MAN',quote:"Gold doesn't lie, and neither did you."};return null;}
function act5Finale(){return typeof dlgFlag==='function'&&dlgFlag('mc_chair')?'finale5c':'finale';}
function act5Results(g){if(!g||!a5Kind(g)||!stageFinal(g))return null;
 if(g.mission==='c15'&&g.a5gold){const b=g.a5gold==='back';return {title:b?'THE FORTY BARS COME HOME':'LA HABANA GOES DOWN',html:`<br>THE GOLD<b style="color:${b?'#7dff9a':'#ffd36b'}">${b?'ALL FORTY BARS  +$'+fmt(Math.round(A5_GOLD_PAY*Dd().mult)):'ON THE BOTTOM OF GOVERNMENT CUT'}</b>`};}
 if(g.mission==='c16'){const d=!!g.cardDeal;return {title:d?'THE CARDINAL TAKES McWEY':'THE CARDINAL FALLS',html:`<br>McWEY<b style="color:${d?'#ff8a95':'#7dff9a'}">${d?'HANDED OVER. THE CHAIR IS YOURS':'ALIVE, AND IN YOUR DEBT'}</b>`};}
 return null;}

/* ---------------- drawing: what moves (each frame) ---------------- */
function drawA5Lift(bx,x,zw,lock){const steel=[0.74,0.77,0.82],brass=[0.85,0.68,0.22];
 bx(x,0.95,zw+0.04,1.5,1.9,0.06,steel);bx(x,0.95,zw+0.075,0.02,1.86,0.02,[0.3,0.32,0.36]);bx(x-0.8,1.0,zw+0.06,0.1,2.0,0.1,brass);bx(x+0.8,1.0,zw+0.06,0.1,2.0,0.1,brass);bx(x,2.0,zw+0.06,1.7,0.1,0.1,brass);
 bx(x,2.12,zw+0.09,0.4,0.1,0.04,lock?[1,0.2,0.2]:[0.3,1,0.5],true);bx(x,0.012,zw+0.45,1.4,0.012,0.7,lock?[0.5,0.12,0.12]:[0.2,0.5,0.3],true);}
function drawAct5(B,g){const k=a5Kind(g);if(!k)return false;const bx=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x,y,z,0,sx,sy,sz),c,!!em),T=g.T||0;
 if(g.stageRun){const D=g.stageRun.describe(g.sid);for(const s of D.stairs)if(s.id==='lift')drawA5Lift(bx,s.at[0],Math.floor(s.at[1]),act5Locked(g,s));
  const ar=D.arrivals;if(ar&&ar.lift&&!(D.stairs||[]).some(s=>s.id==='lift'))drawA5Lift(bx,ar.lift.at[0],Math.floor(ar.lift.at[1]),false);}
 /* the hotel's sheets: two panels per cell so the bottom swings further than the top */
 if(g.sheets)for(const q of g.sheets){const ph=T*1.6+q.ix*0.7+q.iz*1.3,s1=Math.sin(ph)*0.04,s2=Math.sin(ph-0.6)*0.11,c=SHEET_C[(q.ix*7+q.iz*3)%SHEET_C.length];
  bx(q.x,1.3,q.z+s1,0.98,0.6,0.025,c);bx(q.x,0.8,q.z+s2,0.98,0.44,0.025,c.map(v=>v*0.93));}
 if(g.ledger){const L=g.ledger;bx(L.x,0.75,L.z,0.8,1.5,0.6,[0.42,0.38,0.3]);bx(L.x,0.75,L.z+0.31,0.02,1.3,0.01,[0.2,0.18,0.14]);bx(L.x+0.25,0.85,L.z+0.31,0.06,0.12,0.02,L.open?[0.3,0.9,0.4]:[0.9,0.7,0.25],true);
  if(L.open)bx(L.x-0.2,0.75,L.z+0.5,0.04,1.3,0.7,[0.42,0.38,0.3]);if(g.tip&&!L.open)bx(L.x,1.6,L.z,0.07,1.6,0.07,[0.3,1,0.5],true);}
 if(g.gamblers)for(const n of g.gamblers)if(!n.gone&&!fogHid(n.x,n.z))drawChar(CB(n),n);
 if(g.cage){const C=g.cage,x0=C.x-C.w/2,gold=[0.95,0.75,0.25];if(!C.open)for(let k2=0;k2<3;k2++)for(let l=0;l<2;l++)bx(C.x-0.6+k2*0.6,0.15+l*0.12,C.z,0.36,0.1,0.22,gold,l===1);
  for(let i=0;i<=C.w*4;i++){const x=x0+i/4;bx(x,0.75,C.z+0.48,0.03,1.5,0.03,[0.3,0.31,0.34]);}bx(C.x,1.5,C.z+0.48,C.w,0.05,0.05,[0.3,0.31,0.34]);
  if(C.crack>0&&!C.open)bx(C.x,1.75,C.z+0.5,C.w*C.crack,0.06,0.02,[0.3,1,0.5],true);if(g.tip&&!C.open&&!g.sink)bx(C.x,1.9,C.z,0.07,1.2,0.07,[0.3,1,0.5],true);}
 if(g.valve){const V=g.valve,on=!!g.sink;bx(V.x,0.45,V.z,0.4,0.9,0.4,[0.3,0.32,0.36]);for(let i=0;i<6;i++){const a=i*TAU/6+(on?T*4:0);bx(V.x+Math.cos(a)*0.22,0.95,V.z+Math.sin(a)*0.22,0.06,0.06,0.18,[0.85,0.12,0.1]);}bx(V.x,0.95,V.z,0.1,0.1,0.1,[0.85,0.12,0.1]);}
 if(g.sink){const f=1-g.sink.t/A5_SINK_T;bx(g.W/2,0.02+f*0.35,g.H/2,g.W-2,0.01,g.H-2,[0.1,0.3,0.45]);}
 if(g.mcwey&&!fogHid(g.mcwey.x,g.mcwey.z)){const m=g.mcwey;m.a=Math.atan2(g.player.x-m.x,g.player.z-m.z)*0.4;drawChar(CB(m),m);}
 if(g.heli){const H=g.heli;if(H.y<29){const Bp=H.y>0?a5Lifted(B,H.y):B;drawHeli(Bp,H.x,H.z,Math.PI/2,T*(H.go?3:2),1.25);}}
 if(g.strafe&&g.strafe.ph>0){const S=g.strafe;bx(g.W/2,0.04,S.z,g.W-3,0.02,S.w,[1,0.15,0.15],S.ph===2||Math.sin(T*20)>0);}
 return true;}
const SHEET_C=[[0.97,0.96,0.93],[0.95,0.9,0.92],[0.9,0.94,0.97],[0.97,0.95,0.86]];
/* a batch that draws everything raised by y (the helicopter taking off) */
function a5Lifted(B,y){const L=A.T(0,y,0),o=Object.create(B);o.box=(m,c,e,uv)=>B.box(A.mul(L,m),c,e,uv);o.quad=(P,nx,ny,nz,uv,c)=>B.quad(P.map(p=>[p[0],p[1]+y,p[2]]),nx,ny,nz,uv,c);return o;}

/* ---------------- drawing: the sets (built once into the static batch) ---------------- */
function drawAct5Sets(B,g){const k=a5Kind(g);if(!k)return;const bx=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x,y,z,0,sx,sy,sz),c,!!em),cells=ch=>a4Cells(g,ch),
 gold=[0.92,0.74,0.32],brass=[0.8,0.62,0.26],red=[0.62,0.06,0.1],dk=[0.12,0.12,0.14],wh=[0.94,0.93,0.9],steel=[0.62,0.64,0.68],W=g.W,H=g.H,Wm=W-2,Hm=H-2,bm=(x,y,z,...r)=>bx(x+1,y,z+1,...r);/* hand-placed props use map cells (the grid adds a one-cell border) */
 if(k==='hotel'&&g.sid==='lobby'){
  /* a red runner from the doors to the front desk, brass luggage carts, the bell captain's stand */
  bm(20,0.012,9.5,2.2,0.01,4.6,red);for(const sd of [-1,1])bm(20+sd*1.08,0.016,9.5,0.06,0.01,4.6,gold);
  for(const [x,z] of [[8.5,9.5],[30.5,8.5]]){bm(x,0.12,z,1.0,0.06,0.6,[0.55,0.1,0.12]);for(const sx of [-0.45,0.45])bm(x+sx,0.8,z,0.05,1.5,0.05,brass);bm(x,1.55,z,1.0,0.05,0.05,brass);for(const [ox,c] of [[-0.25,[0.35,0.22,0.14]],[0.2,[0.2,0.25,0.4]]])bm(x+ox,0.36,z,0.38,0.42,0.42,c);}
  bm(4.5,0.5,9.5,0.6,1.0,0.5,[0.36,0.2,0.1]);bm(4.5,1.02,9.5,0.66,0.04,0.56,gold);bm(4.5,1.1,9.4,0.12,0.08,0.12,brass,true);}
 if(k==='hotel'&&g.sid==='laundry'){
  /* the washers get portholes, pipes run along the top wall, laundry carts and a pressing table */
  for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(g.rows[z][x]==='G'){bx(x+0.5,0.5,z+0.86,0.5,0.5,0.02,[0.12,0.14,0.16]);bx(x+0.5,0.5,z+0.875,0.36,0.36,0.01,[0.55,0.7,0.8],true);}
  for(const z of [1.08,7.1])bm(Wm/2,1.85,z,Wm-2,0.08,0.08,[0.55,0.45,0.3]);
  for(const [x,z] of [[13.5,8.5],[24.5,10.5],[31.5,8.5]]){bm(x,0.35,z,0.9,0.6,0.6,[0.86,0.86,0.82]);bm(x,0.68,z,0.86,0.12,0.56,[0.97,0.97,0.98]);for(const sx of [-0.4,0.4])bm(x+sx,0.04,z,0.08,0.08,0.5,dk);}}
 if(k==='hotel'&&g.sid==='roof'){
  /* the clotheslines and their posts, the water tank on its legs, the parapet cap */
  const runs={};for(const q of cells('~')){(runs[q.iz]||(runs[q.iz]=[])).push(q.ix);}
  for(const z in runs){const xs=runs[z].sort((a,b)=>a-b);let a=xs[0];for(let i=1;i<=xs.length;i++){if(i===xs.length||xs[i]!==xs[i-1]+1){const b=xs[i-1]+1,zz=+z+0.5;bx((a+b)/2,1.62,zz,b-a+0.3,0.02,0.02,[0.85,0.85,0.85]);for(const x of [a-0.1,b+0.1])bx(x,0.82,zz,0.08,1.64,0.08,[0.55,0.55,0.58]);if(i<xs.length)a=xs[i];}}}
  {const x=31.5,z=9.5;for(const [ox,oz] of [[-0.6,-0.6],[0.6,-0.6],[-0.6,0.6],[0.6,0.6]])bm(x+ox,0.6,z+oz,0.1,1.2,0.1,[0.4,0.3,0.2]);for(let i=0;i<8;i++){const a=i*TAU/8;bm(x+Math.cos(a)*0.62,1.8,z+Math.sin(a)*0.62,0.5,1.2,0.12,[0.55,0.4,0.25]);}bm(x,2.45,z,1.1,0.1,1.1,[0.4,0.3,0.2]);}
  for(let x=1;x<Wm-1;x++)bm(x+0.5,0.04,Hm-1.4,1,0.03,0.1,[0.85,0.8,0.7]);}
 if(k==='ship'&&g.sid==='pier'){
  /* La Habana's hull beyond the water: a dark hull with a red boot stripe, portholes, a white superstructure, and the gangway up */
  bm(Wm/2,1.6,-1.4,Wm-2,3.2,2.6,[0.1,0.12,0.2]);bm(Wm/2,0.35,-0.08,Wm-2,0.7,0.06,[0.6,0.08,0.08]);bm(Wm/2,3.25,-0.1,Wm-2,0.08,0.1,wh);
  for(let x=3;x<Wm-2;x+=2)bm(x+0.5,2.2,-0.09,0.3,0.3,0.03,[0.95,0.85,0.5],true);
  bm(Wm/2+4,4.4,-2.2,14,2.4,1.6,wh);for(let x=Wm/2-2;x<Wm/2+10;x+=1.2)bm(x,4.6,-1.38,0.7,0.5,0.03,[0.15,0.25,0.4]);
  for(let i=0;i<8;i++){const f=(i+0.5)/8;bm(19.5,0.15+f*1.9,3.2-f*3.3,1.2,0.06,0.48,[0.6,0.5,0.35]);}for(const sd of [-0.6,0.6])bm(19.5+sd,1.5,1.5,0.05,0.05,3.6,steel);
  for(const x of [6,12,27,33]){bm(x+0.5,0.25,3.15,0.3,0.5,0.3,dk);bm(x+0.5,0.52,3.15,0.42,0.08,0.42,dk);}}
 if(k==='ship'&&g.sid==='deck'){
  /* two cargo derricks, hatch covers, life rings on the rail, lifeboats at the top */
  for(const [x,z] of [[6,7.5],[27,3.5]]){bm(x,1.4,z,0.3,2.8,0.3,[0.75,0.55,0.1]);bm(x+1.4,2.6,z,2.8,0.12,0.12,[0.75,0.55,0.1]);bm(x+2.7,1.6,z,0.02,2.0,0.02,[0.2,0.2,0.2]);bm(x+2.7,0.6,z,0.3,0.12,0.3,dk);}
  for(const [x,z] of [[12,3],[22,8]]){bm(x,0.1,z,3.2,0.2,2.2,[0.2,0.32,0.22]);for(let i=0;i<4;i++)bm(x-1.2+i*0.8,0.21,z,0.04,0.02,2.2,[0.15,0.25,0.17]);}
  for(const x of [5,15,25])bm(x,0.9,1.05,0.5,0.5,0.06,[1,0.45,0.1]);
  for(const x of [9,19]){bm(x,0.75,0.8,3.2,0.6,1.0,[0.95,0.5,0.12]);bm(x,1.08,0.8,3.0,0.08,0.9,wh);}}
 if(k==='ship'&&g.sid==='casino'){
  /* roulette wheels on the tables, chips, a gold chandelier per table, the cage's sign, the engine room's pipes */
  let n=0;for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(g.rows[z][x]==='O'&&g.rows[z][x+1]==='O'){const cx=x+1,cz=z+0.5;bx(cx-0.5,0.82,cz,0.46,0.04,0.46,[0.35,0.2,0.1]);bx(cx-0.5,0.85,cz,0.36,0.02,0.36,n%2?[0.8,0.1,0.1]:[0.08,0.08,0.08]);bx(cx-0.5,0.88,cz,0.08,0.05,0.08,gold);
   for(let c=0;c<4;c++)bx(cx+0.1+c*0.12,0.83,cz-0.2+((c*7)%3)*0.15,0.08,0.05+c*0.02,0.08,[[0.9,0.1,0.1],[0.1,0.3,0.9],[0.95,0.95,0.95],[0.1,0.6,0.2]][c]);
   bx(cx,2.2,cz,0.5,0.06,0.5,gold,true);bx(cx,2.5,cz,0.03,0.6,0.03,gold);n++;}
  for(const q of cells('N'))bx(q.x,0.03,q.z,1,0.02,1,[0.3,0.25,0.1]);
  bm(4.5,1.9,9.12,2.6,0.32,0.05,[0.1,0.08,0.06]);bm(4.5,1.9,9.15,2.4,0.2,0.02,gold,true);
  for(const z of [9.6,11.6])bm(30,1.7,z,10,0.1,0.1,[0.55,0.45,0.3]);bm(33.5,0.6,11,1.2,1.2,1.2,[0.35,0.38,0.42]);}
 if(k==='siege'&&g.sid==='lobby'){
  /* gold columns, the fountain's spouts, McWEY in gold over the lift */
  for(const [x,z] of [[10,2],[30,2],[10,9],[30,9]]){bm(x,1.2,z,0.5,2.4,0.5,gold);bm(x,0.06,z,0.7,0.12,0.7,[0.2,0.18,0.12]);bm(x,2.36,z,0.7,0.1,0.7,[0.2,0.18,0.12]);}
  for(const x of [17,23])for(let i=0;i<6;i++)bm(x,0.3+i*0.12,5,0.06,0.06,0.06,[0.6,0.85,1],true);
  bm(20.5,2.35,1.06,3.4,0.42,0.05,dk);for(let i=0;i<5;i++)bm(19.1+i*0.7,2.35,1.1,0.5,0.28,0.03,typeof SIGN_GOLD!=='undefined'?SIGN_GOLD:gold,true);}
 if(k==='siege'&&g.sid==='office'){
  /* the gold plinths with bars, a cream rug in front of the desk, the shark tank's glass edge */
  for(const q of cells('G')){for(let l=0;l<3;l++)for(let i=0;i<3-l;i++)bx(q.x-0.2+i*0.2+l*0.1,1.0+l*0.09,q.z,0.17,0.08,0.24,gold,l===2);}
  bm(15.5,0.012,6.2,7,0.01,3,[0.92,0.86,0.72]);for(const sd of [-1,1])bm(15.5,0.016,6.2+sd*1.45,7,0.01,0.08,gold);
  bm(3,0.6,4.02,4.1,1.2,0.04,[0.55,0.75,0.9]);bm(5.02,0.6,2.5,0.04,1.2,3.1,[0.55,0.75,0.9]);}
 if(k==='siege'&&g.sid==='roof'){
  /* the helipad: a yellow ring and an H, landing lights round the pad, an antenna mast */
  const P=cells(','),x0=Math.min(...P.map(q=>q.ix)),x1=Math.max(...P.map(q=>q.ix))+1,z0=Math.min(...P.map(q=>q.iz)),z1=Math.max(...P.map(q=>q.iz))+1,cx=(x0+x1)/2,cz=(z0+z1)/2,R=Math.min(x1-x0,z1-z0)/2-0.4;
  for(let i=0;i<32;i++){const a=i*TAU/32;bx(cx+Math.cos(a)*R,0.02,cz+Math.sin(a)*R,0.4,0.01,0.14,[1,0.82,0.1]);}
  for(const sx of [-0.8,0.8])bx(cx+sx,0.022,cz,0.3,0.01,2.2,wh);bx(cx,0.022,cz,1.6,0.01,0.3,wh);
  for(let x=x0;x<=x1;x+=1.5)for(const z of [z0,z1])bx(x,0.06,z,0.12,0.1,0.12,[0.3,1,0.5],true);
  bm(5,2.0,9.5,0.12,4,0.12,steel);bm(5,4.05,9.5,0.2,0.2,0.2,[1,0.1,0.1],true);}}
