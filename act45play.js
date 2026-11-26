'use strict';
/* ================= ACTS 4 AND 5: a job on every stage, not just the last one =================
   Each floor's main set piece (the vans, the pilot, the jet; the ledger, the cage, the siege) lives in act4.js and act5.js. The stages you
   cross to get there had nothing to do but clear, so each one gets its own task here. The way on (stairs, gangway, lift, hangar door)
   stays shut until the task is dealt with, and a few of them change what waits further in (A45RUN carries that across a floor's stages).
   - c11 garage, street level (p1): the booth attendant runs for the alarm panel once the shooting starts. SMASH the panel, or catch him
     (+$1,000). If he gets there the alarm rings and the gold vans on the dock leave early.
   - c11 garage, P2: SLASH the tyres on Vale's three escort cars (+$400 each). Each one's car alarm goes off when you do.
   - c13 apron: CLOSE the valve on the fuel bowser (+$1,000). Vale's jet goes out on half tanks: 20 more seconds of runway on the jet.
   - c14 hotel lobby: three of the staff are tied up. UNTIE each (+$300); the last one is the bell captain's grandson and tells you
     where the old locker is.
   - c15 pier: the ship's radio hut. Until you SMASH the radio (+$800), every 16 s after the first shot two more men come down the gangway.
   - c15 cargo deck: one of three containers holds the Family's guns. OPEN them (+$200 for the others); find the guns (+$1,000) and the
     casino crew downstairs is left with pistols.
   - c16 McWey Tower lobby: until you LOCK DOWN the building at the security desk (+$800), the Cardinal's men keep coming in the front
     doors, two at a time.
   index.html calls in from stageIntro, stageGoal, stageLocked/stageLockHint, updateStage, drawStage and objAction/objGrab; guide.js asks
   act45Guide. World cells = map + 1. */
let A45RUN={};
const A45_FIRST={c11:'p1',c13:'apron',c14:'lobby',c15:'pier',c16:'lobby'};
const A45_ALARM_PAY=1000,A45_TYRE_PAY=400,A45_FUEL_PAY=1000,A45_FUEL_T=20,A45_STAFF_PAY=300,A45_RADIO_PAY=800,A45_RADIO_T=16,A45_CRATE_PAY=200,A45_GUNS_PAY=1000,A45_LOCK_PAY=800,A45_LOCK_T=14;
const a45c=(x,z)=>({x:x+0.5,z:z+0.5,ix:x,iz:z});
const a45Key=g=>g&&g.stageManaged&&!g.def.hub?g.mission+':'+g.sid:'';
const a45Pay=(g,n,x,z,t)=>{g.score+=n;g.gpts=(g.gpts||0)+n;sfx('cash');popup(x,z,t+'  +$'+fmt(n),'#7dff9a');};
const a45Say=(who,t)=>{if(typeof storyRadio==='function'&&!storyOff())storyRadio(who,t);};
function a45Solid(g,c){g.solid[c.iz*g.W+c.ix]=1;g.wst=null;}
function a45Obj(g,label,total){g.obj={label,n:0,total,done:false};g.objNow=true;}
/* a task is finished: the stairs open, and (as on the hotel laundry) the objective goes, since a floor change can't carry one */
function a45Done(g,head,sub){const T=g.t45;if(!T||T.done)return;T.done=true;g.obj=null;g.objNow=false;sfx('clear');banner(head,sub);}
const A45_ATTENDANT=()=>({skin:[0.62,0.44,0.32],jacket:[0.16,0.22,0.36],shirt:[0.9,0.9,0.86],tie:[0.6,0.5,0.15],pants:[0.16,0.22,0.36],shoes:[0.06,0.06,0.06],hat:'cap',hatC:[0.16,0.22,0.36],hs:'buzz',hair:[0.08,0.06,0.05]});
const A45_STAFF=[()=>({skin:[0.9,0.74,0.6],jacket:[0.55,0.08,0.12],shirt:[0.95,0.94,0.9],tie:[0.85,0.68,0.22],pants:[0.12,0.12,0.14],shoes:[0.06,0.06,0.06],hat:'cap',hatC:[0.55,0.08,0.12],hs:'buzz',hair:[0.3,0.2,0.1]}),
 ()=>({skin:[0.55,0.38,0.28],jacket:[0.95,0.94,0.9],shirt:[0.95,0.94,0.9],pants:[0.12,0.12,0.14],shoes:[0.06,0.06,0.06],hs:'slick',hair:[0.06,0.05,0.05]}),
 ()=>({skin:[0.78,0.6,0.46],jacket:[0.55,0.08,0.12],shirt:[0.95,0.94,0.9],tie:[0.85,0.68,0.22],pants:[0.55,0.08,0.12],shoes:[0.06,0.06,0.06],hat:'cap',hatC:[0.55,0.08,0.12],hs:'buzz',hair:[0.1,0.08,0.06]})];
function a45Npc(q,look,kind){const n=makeChar(q.x,q.z,look,false);n.kind=kind;n.r=0.28;n.state='idle';n.a=0;return n;}
/* reinforcements in through a door or down the gangway, already looking for you */
function a45Spawn(g,pts,n,wps){const p=g.player;let k=0;for(const q of pts){if(k>=n)break;if(blk(g,q[0],q[1]))continue;k++;
  const e=makeEnemy(g,g.def,levelIdx,pick(wps),false,q[0],q[1]);if(typeof a5Kind==='function'&&a5Kind(g))Object.assign(e.look,A5_FAMILY());
  e.state='chase';e.seeT=0;if(typeof AI!=='undefined'&&AI.know)AI.know(e,AI.belief.make(p.x,p.z,g.T||0,'call'));}
 if(k&&typeof buildRadar==='function')buildRadar(g);return k;}
const a45Hot=g=>(g.shots||0)>0||(g.kills||0)>0||g.enemies.some(e=>e.alive&&e.state==='chase');

/* ---------------- the stage tasks ---------------- */
const T45={
 /* c11 street level: the attendant and the alarm panel */
 'c11:p1':{setup(g){const P=a45c(35,8),n=a45Npc(a45c(5,4),A45_ATTENDANT(),'attendant');a45Solid(g,P);
   g.t45={kind:'alarm',panel:P,n,st:'idle',done:false,lock:'down'};a45Obj(g,'KILL THE ALARM',1);},
  tick(dt,g,T){const p=g.player,n=T.n;if(T.done)return;
   if(T.st==='idle'){n.a=Math.atan2(p.x-n.x,p.z-n.z);const d=Math.hypot(p.x-n.x,p.z-n.z);
    if(p.alive&&(a45Hot(g)||(d<5&&los(p.x,p.z,n.x,n.z)))){T.st='run';n.path=a4Path(g,n.x,n.z,T.panel.x-1,T.panel.z);popup(n.x,n.z,'"I\'M HITTING THE ALARM!"','#ff8a95');sfx('alert');
     banner('THE ATTENDANT IS RUNNING FOR THE ALARM','Catch him or smash the panel on the east wall first, or the vault knows you\'re coming.');}}
   else if(T.st==='run'&&a4Walk(n,dt,2.7)){T.st='rang';A45RUN.alarm=1;n.vx=n.vz=0;n.a=Math.PI;sfx('alert');shake(0.2);
    a45Done(g,'THE ALARM IS RINGING','The vault crew knows. The gold vans on the dock will leave early.');a45Say('vale',"Load the vans. Now. We have a guest.");}
   if((T.st==='idle'||T.st==='run')&&p.alive&&Math.hypot(p.x-n.x,p.z-n.z)<1.15){T.st='caught';n.path=null;n.vx=n.vz=0;n.crouchK=0.5;a45Pay(g,A45_ALARM_PAY,n.x,n.z,'NO ALARM');
    popup(n.x,n.z-0.5,'"OKAY! THE KEY! TAKE THE KEY!"','#ffd36b');a45Done(g,'THE ALARM IS DEAD','He gave up the panel key. The vault crew still thinks it\'s a quiet night.');}},
  act(g,p,T){return !T.done&&Math.hypot(T.panel.x-p.x,T.panel.z-p.z)<1.6?{b:'SMASH',h:'SMASH THE ALARM PANEL'}:null;},
  grab(g,p,T){T.st='smashed';T.n.path=null;T.n.vx=T.n.vz=0;T.n.crouchK=0.5;sfx('crash');shake(0.2);a45Pay(g,A45_ALARM_PAY,T.panel.x,T.panel.z,'PANEL SMASHED');
   a45Done(g,'THE ALARM IS DEAD','The vault crew still thinks it\'s a quiet night.');},
  guide(g,T){return T.st==='run'?{x:T.n.x,z:T.n.z,k:'late',lbl:'THE ATTENDANT'}:{x:T.panel.x,z:T.panel.z,k:'obj',lbl:'ALARM PANEL'};},
  hint:'KILL THE ALARM FIRST',
  draw(bx,g,T,t){const P=T.panel,on=!T.done||T.st==='rang';/* on the east wall, facing into the garage */bx(P.x+0.3,1.0,P.z,0.35,1.2,0.7,[0.62,0.64,0.66]);bx(P.x+0.1,1.3,P.z,0.04,0.25,0.4,on?[1.4,0.15,0.1]:[0.15,0.05,0.05],on&&(T.st!=='rang'||Math.sin(t*14)>0));
   bx(P.x+0.1,0.95,P.z,0.04,0.12,0.3,[0.9,0.85,0.2]);bx(P.x+0.3,2.3,P.z,0.2,0.2,0.2,on?[1.4,0.2,0.1]:[0.3,0.08,0.06],on&&T.st==='rang'&&Math.sin(t*14)>0);if(T.st==='smashed')bx(P.x+0.1,1.0,P.z,0.04,0.1,0.5,[0.1,0.1,0.1]);drawChar(CB(T.n),T.n);}},
 /* c11 P2: Vale's escort cars */
 'c11:p2':{setup(g){const cars=[[8.0,3.5],[20.0,6.5],[28.0,9.5]].map(q=>({x:q[0],z:q[1],cut:false}));g.t45={kind:'tyres',cars,done:false,lock:'down'};a45Obj(g,'SLASH THE ESCORT CARS\' TYRES',cars.length);},
  tick(dt,g,T){for(const c of T.cars)if(c.cut&&c.t<6)c.t+=dt;},
  near(T,p){return T.cars.find(c=>!c.cut&&Math.hypot(c.x-p.x,c.z-p.z)<1.7);},
  act(g,p,T){return this.near(T,p)?{b:'SLASH',h:'SLASH THE TYRES'}:null;},
  grab(g,p,T){const c=this.near(T,p);c.cut=true;g.obj.n++;sfx('blip');a45Pay(g,A45_TYRE_PAY,c.x,c.z,'TYRES SLASHED');popup(c.x,c.z-0.5,'WEE-OO WEE-OO','#ffd36b');alertNoise(c.x,c.z,9,'caralarm');c.t=0;
   if(g.obj.n>=T.cars.length)a45Done(g,'VALE\'S ESCORT ISN\'T GOING ANYWHERE','Three cars on their rims. The stairs to the vault dock are open.');},
  guide(g,T){const c=T.cars.find(c=>!c.cut);return c?{x:c.x,z:c.z,k:'obj',lbl:'ESCORT CAR'}:null;},
  hint:'VALE\'S ESCORT CARS FIRST',
  draw(bx,g,T,t){for(const c of T.cars){if(!c.cut){bx(c.x,1.15,c.z,0.18,0.08,0.12,[1.4,0.9,0.1],Math.sin(t*6)>0);continue;}
   bx(c.x,0.03,c.z,1.9,0.02,0.9,[0.05,0.05,0.05]);if(c.t<6){bx(c.x,1.15,c.z,0.2,0.1,0.14,Math.sin(t*16)>0?[1.4,0.2,0.1]:[0.2,0.4,1.4],true);}}}},
 /* c13 apron: the fuel bowser for Vale's jet */
 'c13:apron':{setup(g){const B=[a45c(36,7),a45c(37,7)];for(const c of B)a45Solid(g,c);g.t45={kind:'fuel',bowser:{x:37,z:7.5},done:false,lock:'door'};a45Obj(g,'CLOSE THE FUEL BOWSER',1);},
  tick(){},
  act(g,p,T){return !T.done&&Math.hypot(T.bowser.x-p.x,T.bowser.z-p.z)<1.8?{b:'CLOSE',h:'CLOSE THE FUEL VALVE'}:null;},
  grab(g,p,T){A45RUN.fuel=1;g.obj.n=1;sfx('door');a45Pay(g,A45_FUEL_PAY,T.bowser.x,T.bowser.z,'FUEL CUT');
   a45Done(g,'VALE FLIES ON HALF TANKS','A lighter jet rolls slower. More runway when it counts.');a45Say('mcwey',"Half tanks? Clever boy. A plane that slow is a plane you can catch.");},
  guide(g,T){return {x:T.bowser.x,z:T.bowser.z,k:'obj',lbl:'FUEL BOWSER'};},
  hint:'CUT THE JET\'S FUEL FIRST',
  draw(bx,g,T,t){const b=T.bowser;bx(b.x,0.55,b.z,1.9,0.9,0.8,[0.85,0.82,0.2]);bx(b.x-1.1,0.6,b.z,0.5,1.0,0.8,[0.9,0.9,0.92]);bx(b.x,1.02,b.z,1.7,0.06,0.5,[0.3,0.3,0.32]);
   bx(b.x+0.6,0.6,b.z+0.42,0.14,0.14,0.06,T.done?[0.2,0.6,0.25]:[1.4,0.25,0.1],!T.done);
   for(const dx of [-0.6,0.6])bx(b.x+dx,0.18,b.z,0.3,0.36,0.86,[0.08,0.08,0.08]);if(!T.done)bx(b.x+1.2,0.08,b.z+0.1,0.8,0.05,0.08,[0.12,0.12,0.12]);}},
 /* c14 hotel lobby: the tied-up staff */
 'c14:lobby':{setup(g){const pts=[a45c(14,10),a45c(16,10),a45c(35,5)];g.t45={kind:'staff',done:false,lock:'down',staff:pts.map((q,k)=>{const n=a45Npc(q,A45_STAFF[k](),'staff');n.crouchK=0.6;n.a=k===2?-Math.PI/2:0;return {n,free:false};})};a45Obj(g,'FREE THE STAFF',3);},
  tick(dt,g,T){for(const s of T.staff)if(s.free&&s.n.crouchK>0)s.n.crouchK=Math.max(0,s.n.crouchK-dt*2);},
  near(T,p){return T.staff.find(s=>!s.free&&Math.hypot(s.n.x-p.x,s.n.z-p.z)<1.4);},
  act(g,p,T){return this.near(T,p)?{b:'UNTIE',h:'UNTIE THEM'}:null;},
  grab(g,p,T){const s=this.near(T,p);s.free=true;g.obj.n++;s.n.a=Math.atan2(p.x-s.n.x,p.z-s.n.z);a45Pay(g,A45_STAFF_PAY,s.n.x,s.n.z,'FREED');
   const left=T.staff.filter(q=>!q.free).length;
   popup(s.n.x,s.n.z-0.5,left?(left===2?'"THEY CAME IN AT SIX. THEY HAVE THE WHOLE HOTEL."':'"THERE\'S ONE MORE. BY THE STAIRS."'):'"MY GRANDFATHER\'S LOCKER. BEHIND THE WASHERS, DOWNSTAIRS."','#ffd36b');
   if(!left){a45Done(g,'THE STAFF ARE FREE','The bell captain\'s grandson: the old locker is in the laundry, behind the washers.');
    a45Say('mcwey',"The bell captain's grandson. Tell him McWey says thank you. His grandfather called me kid.");}},
  guide(g,T){const s=T.staff.find(s=>!s.free);return s?{x:s.n.x,z:s.n.z,k:'obj',lbl:'TIED UP'}:null;},
  hint:'FREE THE STAFF FIRST',
  draw(bx,g,T,t){for(const s of T.staff){drawChar(CB(s.n),s.n);if(!s.free){bx(s.n.x,0.55,s.n.z,0.5,0.06,0.4,[0.75,0.68,0.5]);bx(s.n.x,0.75,s.n.z,0.46,0.05,0.36,[0.75,0.68,0.5]);}}}},
 /* c15 pier: the ship's radio */
 'c15:pier':{setup(g){const R=a45c(38,9);a45Solid(g,R);g.t45={kind:'radio',radio:R,t:0,hot:false,waves:0,done:false,lock:'gang'};a45Obj(g,'SILENCE THE SHIP\'S RADIO',1);},
  tick(dt,g,T){if(T.done)return;if(!T.hot){if(a45Hot(g)){T.hot=true;T.t=0;banner('THE PIER RADIO IS CALLING THE SHIP','Every few seconds it sends more men down the gangway. Smash it: the hut on the right.');}return;}
   T.t+=dt;if(T.t>=A45_RADIO_T&&T.waves<4){T.t=0;T.waves++;const k=a45Spawn(g,[[20.5,4.5],[19.5,4.5],[21.5,4.5]],2,['pistol','smg','shotgun']);if(k){popup(20.5,4.5,'MORE OF THEM OFF THE SHIP','#ff8a95');sfx('alert');}}},
  act(g,p,T){return !T.done&&Math.hypot(T.radio.x-p.x,T.radio.z-p.z)<1.5?{b:'SMASH',h:'SMASH THE RADIO'}:null;},
  grab(g,p,T){sfx('crash');shake(0.2);g.obj.n=1;a45Pay(g,A45_RADIO_PAY,T.radio.x,T.radio.z,'RADIO DEAD');a45Done(g,'THE RADIO IS DEAD','No more help off the ship. Up the gangway.');},
  guide(g,T){return {x:T.radio.x,z:T.radio.z,k:T.hot?'late':'obj',lbl:'THE RADIO'};},
  hint:'SILENCE THE RADIO FIRST',
  draw(bx,g,T,t){const R=T.radio;bx(R.x,0.4,R.z,0.8,0.8,0.6,[0.35,0.24,0.14]);bx(R.x,0.95,R.z,0.6,0.3,0.4,T.done?[0.12,0.12,0.12]:[0.3,0.32,0.28]);
   if(!T.done){bx(R.x-0.15,1.0,R.z+0.21,0.18,0.08,0.02,[1.3,0.9,0.2],true);bx(R.x+0.2,1.35,R.z,0.03,0.5,0.03,[0.7,0.7,0.72]);bx(R.x+0.2,1.62,R.z,0.07,0.07,0.07,[1.4,0.2,0.1],Math.sin(t*8)>0);}
   else bx(R.x,1.12,R.z,0.4,0.05,0.3,[0.05,0.05,0.05]);}},
 /* c15 deck: which container holds the guns */
 'c15:deck':{setup(g){const cs=[{x:5.5,z:6.0,fz:7.4},{x:20.5,z:6.0,fz:7.4},{x:31.0,z:8.0,fz:9.4}].map(c=>Object.assign(c,{open:false,guns:false}));cs[Math.floor(Math.random()*cs.length)].guns=true;
   g.t45={kind:'crates',cs,done:false,lock:'down'};a45Obj(g,'FIND THE FAMILY\'S GUNS',1);},
  tick(){},
  near(T,p){return T.cs.find(c=>!c.open&&Math.hypot(c.x-p.x,c.fz-p.z)<1.6);},
  act(g,p,T){return !T.done&&this.near(T,p)?{b:'OPEN',h:'OPEN THE CONTAINER'}:null;},
  grab(g,p,T){const c=this.near(T,p);c.open=true;sfx('door');
   if(c.guns){A45RUN.arms=1;g.obj.n=1;a45Pay(g,A45_GUNS_PAY,c.x,c.fz,'THE FAMILY\'S GUNS');a45Done(g,'THE GUNS GO OVER THE SIDE','The casino crew downstairs is left with whatever is in their pockets.');a45Say('mcwey',"Guns over the side? Good. The Cardinal's boys can fight you with their rosaries.");}
   else{const what=pick(['CIGARS','RUM','SUGAR']);a45Pay(g,A45_CRATE_PAY,c.x,c.fz,'HAVANA '+what);popup(c.x,c.fz-0.5,'NOT THE GUNS','#ffd36b');}},
  guide(g,T){const p=g.player;let b=null,d=1e9;for(const c of T.cs)if(!c.open){const q=Math.hypot(c.x-p.x,c.fz-p.z);if(q<d){d=q;b=c;}}return b?{x:b.x,z:b.fz,k:'obj',lbl:'CONTAINER'}:null;},
  hint:'FIND THE FAMILY\'S GUNS FIRST',
  draw(bx,g,T,t){for(const c of T.cs){const y=c.open?[0.25,0.6,0.3]:[1.3,0.85,0.15];bx(c.x,0.03,c.fz-0.2,1.0,0.015,0.5,y,!c.open&&Math.sin(t*4)>0);
   if(c.open){bx(c.x-0.55,0.9,c.fz-0.15,0.06,1.6,0.8,[0.5,0.18,0.12]);if(c.guns)bx(c.x,0.25,c.fz-0.5,0.8,0.3,0.4,[0.25,0.28,0.18]);}}}},
 /* c16 McWey Tower lobby: lock the front doors */
 'c16:lobby':{setup(g){const D=a45c(23,9);a45Solid(g,D);g.t45={kind:'lockdown',desk:D,t:-4,waves:0,done:false,lock:'lift'};a45Obj(g,'LOCK DOWN THE TOWER',1);},
  tick(dt,g,T){if(T.done)return;T.t+=dt;if(T.t>=A45_LOCK_T&&T.waves<4){T.t=0;T.waves++;const k=a45Spawn(g,[[5.5,11.5],[36.5,11.5],[20.5,11.5]],2,['pistol','smg','shotgun','smg']);
    if(k){popup(g.player.x,g.player.z-0.5,'MORE OF THEM IN THE FRONT DOORS','#ff8a95');sfx('alert');if(T.waves===1)banner('THEY KEEP COMING IN','Lock the building down at the security desk behind reception.');}}},
  act(g,p,T){return !T.done&&Math.hypot(T.desk.x-p.x,T.desk.z-p.z)<1.5?{b:'LOCK',h:'LOCK DOWN THE BUILDING'}:null;},
  grab(g,p,T){sfx('door');shake(0.3);g.obj.n=1;a45Pay(g,A45_LOCK_PAY,T.desk.x,T.desk.z,'TOWER SEALED');a45Done(g,'McWEY TOWER IS SEALED','Steel down on the front doors. Nobody else comes in. The lift is at the back.');
   a45Say('lex',"I saw the shutters drop from the street. Whoever's in there with you is all there is.");},
  guide(g,T){return {x:T.desk.x,z:T.desk.z,k:'obj',lbl:'SECURITY DESK'};},
  hint:'LOCK THE BUILDING DOWN FIRST',
  draw(bx,g,T,t){const D=T.desk;bx(D.x,0.5,D.z,0.9,1.0,0.6,[0.2,0.2,0.24]);bx(D.x,1.05,D.z-0.1,0.5,0.35,0.06,[0.15,0.3,0.4],true);bx(D.x+0.3,1.02,D.z+0.15,0.14,0.04,0.14,T.done?[0.2,1.2,0.4]:[1.4,0.2,0.1],true);
   if(T.done)for(const [x,w] of [[6,2],[21,8],[36,2]])bx(x,1.0,12.5,w,2.0,0.1,[0.42,0.44,0.48]);}}
};
const a45Def=g=>{const T=g&&g.t45;return T?T45[a45Key(g)]||null:null;};

/* ---------------- hooks ---------------- */
function act45Intro(g){const k=a45Key(g);if(!k)return;if(A45_FIRST[g.mission]===g.sid)A45RUN={};
 const D=T45[k];if(D){D.setup(g);return;}
 /* further in: what the earlier tasks changed */
 if(g.mission==='c11'&&g.sid==='dock'&&A45RUN.alarm)g.a45early=1;
 if(g.mission==='c15'&&g.sid==='casino'&&A45RUN.arms)for(const e of g.enemies)if(!e.boss&&e.weapon&&!WD[e.weapon.type].melee&&e.weapon.type!=='pistol')e.weapon={type:'pistol',ammo:99};}
function act45Tick(dt){const g=G;if(!g||!g.player||g.def.hub)return;
 /* the vans are set up by act4's intro, so the early start waits for the first tick */
 if(g.a45early===1&&g.vans){g.a45early=2;for(const v of g.vans)v.go=Math.max(1,v.go-4);}
 if(g.a45fuel!==1&&A45RUN.fuel&&g.jet&&g.mission==='c13'&&g.sid==='jet'){g.a45fuel=1;g.jet.crash+=A45_FUEL_T;}
 const D=a45Def(g);if(!D)return;
 /* a stage change refuses to carry an objective: once the task is dealt with, however that happened, it goes */
 if(g.t45.done){if(g.obj)g.obj=null;return;}D.tick(dt,g,g.t45);}
function act45Goal(g){const D=a45Def(g);return D&&!g.t45.done&&g.obj?g.obj.label:null;}
function act45Locked(g,s){const D=a45Def(g);return !!(D&&!g.t45.done&&s.id===g.t45.lock);}
function act45LockHint(g){const D=a45Def(g);if(!D||g.t45.done)return false;popup(g.player.x,g.player.z,D.hint,'#ff8a95');return true;}
function act45Action(p){const g=G;if(!g||!p)return null;const D=a45Def(g);return D&&!g.t45.done?D.act(g,p,g.t45):null;}
function act45Grab(p){const g=G;const D=a45Def(g);if(!D||g.t45.done||!D.act(g,p,g.t45))return false;D.grab(g,p,g.t45);return true;}
function act45Guide(g){const D=a45Def(g);if(!D||g.t45.done||g.cleared)return null;const quiet=g.tip||!g.enemies.some(e=>e.alive);const t=D.guide(g,g.t45);
 return t&&(quiet||t.k==='late'||g.t45.kind==='lockdown'||g.t45.kind==='radio'&&g.t45.hot)?t:null;}
function drawAct45(B,g){const D=a45Def(g);if(!D)return;const bx=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x,y,z,0,sx,sy,sz),c,!!em);D.draw(bx,g,g.t45,g.T||0);}

/* the reception counters in the Grand Biscayne and McWey Tower lobbies: one joined desk instead of a row of grey blocks (static, from buildFurniture) */
function act45Furn(B,g,x,z,f){if(f!==7||!g||!g.stageManaged||g.sid!=='lobby'||(g.mission!=='c14'&&g.mission!=='c16'))return false;
 const W=g.W,same=(ox,oz)=>g.furn[(z+oz)*W+x+ox]===7,hotel=g.mission==='c14',box=(x0,x1,y,h,z0,z1,c)=>furnBox(B,TRS((x0+x1)/2,y,(z0+z1)/2,0,x1-x0,h,z1-z0),c);
 const L=same(-1,0),R=same(1,0),U=same(0,-1),D=same(0,1),m=0.1;
 const x0=x+(L?0:m),x1=x+1-(R?0:m),z0=z+(U?0:m),z1=z+1-(D?0:m);
 const wood=hotel?hex(0x5a2a16):hex(0x1c1c22),panel=hotel?hex(0x7a3c20):hex(0x2a2a32),trim=hex(0xc9a24a),top=hotel?hex(0xeee6d6):hex(0x101014);
 box(x0,x1,0.5,1.0,z0,z1,wood);
 /* raised panels on the open faces, a brass kick rail and a brass band under the top */
 const face=(ax,az)=>{const px=ax?(ax<0?x0-0.01:x1+0.01):null,pz=az?(az<0?z0-0.01:z1+0.01):null;
  if(px!=null){box(px-0.02,px+0.02,0.55,0.62,z0+0.12,z1-0.12,panel);box(px-0.03,px+0.03,0.1,0.06,z0,z1,trim);box(px-0.03,px+0.03,0.93,0.04,z0,z1,trim);}
  else{box(x0+0.12,x1-0.12,0.55,0.62,pz-0.02,pz+0.02,panel);box(x0,x1,0.1,0.06,pz-0.03,pz+0.03,trim);box(x0,x1,0.93,0.04,pz-0.03,pz+0.03,trim);}};
 if(!L)face(-1,0);if(!R)face(1,0);if(!U)face(0,-1);if(!D)face(0,1);
 box(x0-(L?0:0.06),x1+(R?0:0.06),1.03,0.06,z0-(U?0:0.06),z1+(D?0:0.06),top);
 /* what sits on it */
 const k=(x*7+z*3)%5,cx=x+0.5,cz=z+0.5;
 if(hotel){if(k===0){furnBox(B,TRS(cx,1.1,cz,0,0.16,0.06,0.16),trim);furnBox(B,TRS(cx,1.16,cz,0,0.03,0.05,0.03),trim);}
  else if(k===2){furnBox(B,TRS(cx,1.08,cz,0.3,0.4,0.04,0.3),hex(0x6a1420));furnBox(B,TRS(cx,1.105,cz,0.3,0.36,0.01,0.26),hex(0xf2ead8));}
  else if(k===4){furnBox(B,TRS(cx,1.08,cz,0,0.12,0.04,0.12),trim);furnBox(B,TRS(cx,1.25,cz,0,0.03,0.32,0.03),trim);furnBox(B,TRS(cx,1.42,cz,0,0.26,0.12,0.18),hex(0x1f6a3a));}}
 else{if(k===0){furnBox(B,TRS(cx,1.22,cz,0,0.4,0.3,0.32),hex(0x2a2a30));furnBox(B,TRS(cx,1.24,cz+0.17,0,0.32,0.22,0.01),hex(0x2a6a8a));}
  else if(k===3){furnBox(B,TRS(cx,1.1,cz,0,0.26,0.08,0.18),hex(0x111114));furnBox(B,TRS(cx-0.04,1.16,cz,0,0.2,0.04,0.06),hex(0x111114));}}
 return true;}
