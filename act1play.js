'use strict';
/* ================= ACT 1 "THE STREET": what you do besides clear the floor =================
   Act 1's signature is making people talk: each floor has somebody who knows where the next one is.
   - Floor 1, Motel Sunset (c0): BURN THE PRODUCT on the tables in three rooms (E / BURN). The cook hides in the back room:
     catch him and TALK (+$750, he gives up Club Flamingo, which is the floor's lead).
   - Floor 2, Club Flamingo (c1): Rico the manager runs across the dance floor for the back office to burn the books as soon as
     the shooting starts. Catch him before they are ash (+$1,500), then TALK. If the books burn, he still talks, for nothing.
   - Floor 3, the Penthouse (c2, top stage): at half health Moreau runs for his panic room and steel shutters come down on both
     doors. Cut the power at the breaker in the dining room (E / CUT) and the shutters lift, with the lights down to red.
   Coordinates are world cells: legacy maps and stages get a 1-cell border, so world = map + 1. */
const A1_BURN_PAY=400,A1_COOK_PAY=750,A1_RICO_PAY=1500,A1_BOOKS_T=8;
const A1_COOK_LOOK=()=>({skin:[0.86,0.66,0.5],jacket:[0.95,0.95,0.93],shirt:[0.95,0.95,0.93],pants:[0.3,0.3,0.34],shoes:[0.2,0.18,0.16],apron:[0.92,0.9,0.84],hs:'buzz',hair:[0.12,0.1,0.08],bw:0.95,bd:1.0,bh:0.98});
const A1_RICO_LOOK=()=>({skin:[0.9,0.7,0.54],jacket:[0.95,0.52,0.18],shirt:[0.1,0.1,0.12],pants:[0.95,0.52,0.18],shoes:[0.92,0.9,0.86],hs:'slick',hair:[0.08,0.06,0.05],chain:true,shades:true,watch:true,bw:0.98,bd:0.98,bh:1.0});
const A1_PROD=[[12,5],[19,5],[23,12]],A1_COOK=[6,13],A1_RICO=[33,4],A1_BOOKS=[3,6],A1_SHUT=[[31,3],[35,5]],A1_PANIC=[34,3],A1_BREAKER=[2,10];
const a1c=(q)=>({x:q[0]+0.5,z:q[1]+0.5,ix:q[0],iz:q[1]});
const a1Pent=g=>!!g&&g.mission==='c2'&&g.sid==='pent';
const a1Talk=(g,who,lines)=>{for(const t of lines){if(typeof storyRadio==='function'&&!storyOff())storyRadio(who,t);}popup(g.player.x,g.player.z-0.6,'"'+lines[0]+'"','#ffd36b');};
function a1Npc(g,q,look,kind){const n=makeChar(q.x,q.z,look,false);n.kind=kind;n.r=0.28;n.state='idle';n.a=0;return n;}
function a1Fire(g,x,z,n,big){for(let k=0;k<n;k++){const hot=Math.random()<0.6;g.parts.push({t:'c',x:x+(Math.random()-0.5)*0.5,y:0.8+Math.random()*0.3,z:z+(Math.random()-0.5)*0.5,vx:(Math.random()-0.5)*0.3,vy:(hot?1.2:0.7)+Math.random()*(big?1.4:0.8),vz:(Math.random()-0.5)*0.3,s:hot?0.06:0.1,c:hot?[1.4,0.55+Math.random()*0.4,0.1]:[0.25,0.24,0.26],life:hot?0.5:1.2});}}
/* set up from act2Setup (legacy floors) */
function act1Setup(g,i){g.a1=g.a1||null;if(i===0){
  g.prod=A1_PROD.map(q=>Object.assign(a1c(q),{burnt:false,t:0}));
  g.cook={n:a1Npc(g,a1c(A1_COOK),A1_COOK_LOOK(),'cook'),st:'hide',talked:false};g.cook.n.crouchK=0.6;
  g.obj={label:'BURN THE PRODUCT',n:0,total:g.prod.length,done:false};}
 else if(i===1){const b=a1c(A1_BOOKS);g.books={x:b.x,z:b.z,t:0,ash:false};
  g.rico={n:a1Npc(g,a1c(A1_RICO),A1_RICO_LOOK(),'rico'),st:'idle',talked:false,saved:false};
  g.obj={label:'CATCH RICO BEFORE HE BURNS THE BOOKS',n:0,total:1,done:false};}}
/* the penthouse top stage, from stageIntro */
function act1Intro(g){if(!a1Pent(g))return;g.a1panic={st:'open',breaker:a1c(A1_BREAKER),cells:A1_SHUT.map(a1c),to:a1c(A1_PANIC),t:0};
 const b=g.a1panic.breaker;g.solid[b.iz*g.W+b.ix]=1;g.wst=null;}
function act1Goal(g){if(!a1Pent(g)||!g.a1panic)return null;const P=g.a1panic;return P.st==='shut'?'CUT THE POWER AT THE BREAKER':null;}
function a1Shutters(g,down){const P=g.a1panic;for(const c of P.cells){g.solid[c.iz*g.W+c.ix]=down?1:0;}g.wst=null;}
function act1Tick(dt){const g=G;if(!g||!g.player||g.def.hub)return;const p=g.player;
 if(g.prod)for(const q of g.prod)if(q.burnt&&q.t<7){q.t+=dt;a1Fire(g,q.x,q.z,2,q.t<2.5);}
 if(g.cook){const C=g.cook,n=C.n;if(C.st==='hide'){n.a=Math.atan2(p.x-n.x,p.z-n.z);if(p.alive&&Math.hypot(p.x-n.x,p.z-n.z)<1.2){C.st='caught';n.crouchK=0;popup(n.x,n.z-0.4,'"DON\'T SHOOT! I JUST COOK!"','#ff8a95');sfx('blip');}}}
 if(g.rico){const R=g.rico,n=R.n,B=g.books;
  if(R.st==='idle'){const d=Math.hypot(p.x-n.x,p.z-n.z);if(p.alive&&((g.shots||0)>0||(g.kills||0)>0||(d<6&&los(p.x,p.z,n.x,n.z)))){R.st='run';n.path=a4Path(g,n.x,n.z,B.x,B.z+1);
    popup(n.x,n.z,'"THE BOOKS! NOBODY TOUCHES THE BOOKS!"','#ff8a95');sfx('alert');banner('RICO IS RUNNING FOR THE BACK OFFICE','He is going to burn the books. Catch him first.');}}
  else if(R.st==='run'){if(a4Walk(n,dt,3.1)){R.st='burn';n.vx=n.vz=0;banner('RICO IS BURNING THE BOOKS','Back office, top left. '+A1_BOOKS_T+' seconds.');}}
  else if(R.st==='burn'&&!B.ash){B.t+=dt;n.a=Math.atan2(B.x-n.x,B.z-n.z);a1Fire(g,B.x,B.z,2,false);if(B.t>=A1_BOOKS_T){B.ash=true;R.st='cower';popup(B.x,B.z,'THE BOOKS ARE ASH','#ff8a95');banner('THE BOOKS ARE ASH','Rico still knows things. Make him talk.');g.obj.label='MAKE RICO TALK';}}
  if(B.ash&&B.t<A1_BOOKS_T+6){B.t+=dt;a1Fire(g,B.x,B.z,1,false);}
  if(R.st!=='caught'&&R.st!=='talked'&&p.alive&&Math.hypot(p.x-n.x,p.z-n.z)<1.15){const saved=!B.ash;R.st='caught';R.saved=saved;n.path=null;n.vx=n.vz=0;n.a=Math.atan2(p.x-n.x,p.z-n.z);
   if(saved){g.score+=A1_RICO_PAY;g.gpts=(g.gpts||0)+A1_RICO_PAY;sfx('cash');popup(n.x,n.z,'THE BOOKS ARE SAFE +$'+fmt(A1_RICO_PAY),'#7dff9a');}
   popup(n.x,n.z-0.5,'"OKAY! OKAY! I\'M NOT ARMED!"','#ffd36b');g.obj.label='MAKE RICO TALK';}}
 if(a1Pent(g)&&g.a1panic){const P=g.a1panic,b=g.boss;
  if(P.st==='open'&&b&&b.alive&&!b.spared&&b.hp<=b.maxhp/2){P.st='run';P.t=0;b.bribed=1;b.aiming=false;popup(b.x,b.z,'"NOT LIKE THIS! NOT IN MY HOUSE!"','#2de2e6');sfx('alert');banner('MOREAU RUNS FOR HIS PANIC ROOM','Stop him before the shutters come down.');}
  if(P.st==='run'){P.t+=dt;if(!b||!b.alive){P.st='done';}else{const r=AI.seek(b,P.to.x,P.to.z,3.4);b.vx=r.vx;b.vz=r.vz;if(r.face!=null)b.a=b.ga=r.face;
    const inRoom=q=>q.x>P.cells[0].x-0.1&&q.z<P.cells[1].z;
    if(Math.hypot(b.x-P.to.x,b.z-P.to.z)<1.0||P.t>9){b.bribed=0;b.state='chase';if(inRoom(b)&&!inRoom(p)){P.st='shut';a1Shutters(g,true);sfx('door');shake(0.3);banner('THE SHUTTERS ARE DOWN','Steel on both doors. Cut the power at the breaker in the dining room.');}else P.st='done';}}}
  if(P.st==='shut'&&(!b||!b.alive)){P.st='done';a1Shutters(g,false);}}}
function act1Action(p){const g=G;if(!g||!p||!p.alive)return null;
 if(g.prod){const q=g.prod.find(q=>!q.burnt&&Math.hypot(q.x-p.x,q.z-p.z)<1.6);if(q)return {b:'BURN',h:'BURN THE PRODUCT'};}
 if(g.cook&&g.cook.st==='caught'&&Math.hypot(g.cook.n.x-p.x,g.cook.n.z-p.z)<1.8)return {b:'TALK',h:'MAKE THE COOK TALK'};
 if(g.rico&&g.rico.st==='caught'&&Math.hypot(g.rico.n.x-p.x,g.rico.n.z-p.z)<1.8)return {b:'TALK',h:'MAKE RICO TALK'};
 if(g.a1panic&&g.a1panic.st==='shut'&&Math.hypot(g.a1panic.breaker.x-p.x,g.a1panic.breaker.z-p.z)<1.5)return {b:'CUT',h:'CUT THE POWER'};
 return null;}
function a1Pay(g,amt,x,z,txt){g.score+=amt;g.gpts=(g.gpts||0)+amt;sfx('cash');popup(x,z,txt+' +$'+fmt(amt),'#7dff9a');}
function act1Grab(p){const g=G;if(!g||!p)return false;const a=act1Action(p);if(!a)return false;
 if(a.b==='BURN'){const q=g.prod.find(q=>!q.burnt&&Math.hypot(q.x-p.x,q.z-p.z)<1.6);q.burnt=true;q.t=0;g.obj.n++;a1Pay(g,A1_BURN_PAY,q.x,q.z,'PRODUCT BURNT');sfx('boom');shake(0.15);
  if(g.obj.n>=g.obj.total){g.obj.done=true;banner('THE PRODUCT IS BURNING',g.enemies.every(e=>!e.alive)?'Get back to the car':'Finish off the crew');}return true;}
 if(a.b==='TALK'&&g.cook&&g.cook.st==='caught'&&Math.hypot(g.cook.n.x-p.x,g.cook.n.z-p.z)<1.8){g.cook.st='talked';g.cook.talked=true;a1Pay(g,A1_COOK_PAY,g.cook.n.x,g.cook.n.z,'HE TALKED');
  a1Talk(g,'cook',["It's Moreau's money! Rico from Club Flamingo picks it up every Thursday.","Take the matchbook, take anything. Just let me go home."]);a1Lead(g,0);return true;}
 if(a.b==='TALK'&&g.rico&&g.rico.st==='caught'){g.rico.st='talked';g.rico.talked=true;a1Pay(g,500,g.rico.n.x,g.rico.n.z,'HE TALKED');if(g.obj&&!g.obj.done){g.obj.n=1;g.obj.done=true;}
  a1Talk(g,'rico',g.rico.saved?["Mr Moreau lives on top of Coral Tower. Here, his key. The books say the rest.","Tell him I fought. Please. Tell him I fought."]:["Coral Tower, the top floor. Here's the key. The books are gone, so it's my word or nothing.","He'll kill me either way. Please. Make it quick or make it never."]);
  a1Lead(g,1);banner('RICO TALKED',g.enemies.every(e=>!e.alive)?'Get back to the car':'Finish the floor');return true;}
 if(a.b==='CUT'){const P=g.a1panic;P.st='dark';a1Shutters(g,false);g.a1dark=1;sfx('boom');shake(0.2);banner('LIGHTS OUT','The shutters are up. Moreau is in the dark.');
  if(typeof storyRadio==='function'&&!storyOff())storyRadio('moreau',"Who turned off my lights? I can't see a thing in here!");return true;}
 return false;}
/* talking hands over the floor's lead on the spot (story.js), so nothing drops at the end */
function a1Lead(g,i){if(typeof STORY==='undefined'||storyOff()||!STORY[i]||!STORY[i].lead||(g.lead&&g.lead.taken))return;g.lead={x:g.player.x,z:g.player.z,taken:false};storyTakeLead(g,i);}
function act1Guide(g){if(g.cleared)return null;const quiet=g.tip||!g.enemies.some(e=>e.alive);
 if(g.rico&&g.rico.st==='run')return {x:g.rico.n.x,z:g.rico.n.z,k:'obj',lbl:'CATCH RICO'};
 if(g.rico&&g.rico.st==='burn')return {x:g.rico.n.x,z:g.rico.n.z,k:'late',lbl:'THE BOOKS'};
 if(g.rico&&(g.rico.st==='caught'||g.rico.st==='cower'))return {x:g.rico.n.x,z:g.rico.n.z,k:'obj',lbl:'MAKE RICO TALK'};
 if(g.a1panic&&g.a1panic.st==='shut')return {x:g.a1panic.breaker.x,z:g.a1panic.breaker.z,k:'obj',lbl:'THE BREAKER'};
 if(g.prod&&quiet){const q=g.prod.find(q=>!q.burnt);if(q)return {x:q.x,z:q.z,k:'obj',lbl:'BURN THE PRODUCT'};}
 if(g.cook&&quiet&&g.cook.st!=='talked')return {x:g.cook.n.x,z:g.cook.n.z,k:'obj',lbl:'THE COOK'};
 return null;}
function drawAct1Play(B,g){const bx=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x,y,z,0,sx,sy,sz),c,!!em),T=g.T||0;
 if(g.prod)for(const q of g.prod){if(!q.burnt){for(let k=0;k<4;k++)bx(q.x-0.18+(k%2)*0.24,0.86+(k>>1)*0.09,q.z-0.08+((k*7)%3)*0.06,0.2,0.08,0.13,[0.95,0.95,0.92]);bx(q.x+0.2,0.88,q.z+0.15,0.14,0.12,0.14,[0.5,0.52,0.56]);bx(q.x+0.2,0.95,q.z+0.15,0.1,0.01,0.1,[0.3,0.6,1.4],true);}
  else{bx(q.x,0.84,q.z,0.5,0.04,0.36,[0.06,0.05,0.05]);if(q.t<7)bx(q.x,1.0+Math.sin(T*20)*0.04,q.z,0.36,0.28,0.26,[1.3,0.5,0.1],true);}}
 if(g.cook)drawChar(CB(g.cook.n),g.cook.n);
 if(g.rico){drawChar(CB(g.rico.n),g.rico.n);const Bk=g.books;bx(Bk.x,0.4,Bk.z-0.35,0.9,0.8,0.5,[0.3,0.18,0.1]);
  if(!Bk.ash){bx(Bk.x-0.15,0.86,Bk.z-0.35,0.26,0.1,0.34,[0.12,0.3,0.15]);bx(Bk.x+0.18,0.88,Bk.z-0.35,0.22,0.14,0.3,[0.5,0.1,0.1]);}else bx(Bk.x,0.82,Bk.z-0.35,0.5,0.02,0.36,[0.08,0.07,0.07]);
  if(g.rico.st==='burn'||Bk.ash&&Bk.t<A1_BOOKS_T+6)bx(Bk.x,1.0+Math.sin(T*18)*0.05,Bk.z-0.35,0.4,0.3,0.3,[1.3,0.5,0.1],true);}
 if(g.a1panic){const P=g.a1panic,b=P.breaker;bx(b.x,1.1,b.z,0.5,0.9,0.5,[0.35,0.37,0.4]);bx(b.x+0.26,1.25,b.z,0.02,0.12,0.12,P.st==='dark'?[0.2,0.2,0.2]:[1.4,0.2,0.1],true);bx(b.x+0.26,0.95,b.z,0.02,0.2,0.06,[0.9,0.85,0.2]);
  if(P.st==='shut')for(const c of P.cells){bx(c.x,1.3,c.z,1.0,2.6,1.0,[0.42,0.44,0.48]);for(let k=0;k<6;k++)bx(c.x,0.25+k*0.42,c.z,1.02,0.04,1.02,[0.3,0.31,0.34]);bx(c.x,2.4,c.z,1.04,0.1,1.04,[1.3,0.6,0.1],Math.sin(T*6)>0);}
  if(P.st==='dark')bx(P.to.x,2.6,P.to.z,0.3,0.06,0.3,[1.4,0.05,0.05],Math.sin(T*4)>0);}}
