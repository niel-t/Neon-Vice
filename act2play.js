'use strict';
/* ================= ACT 2 "SILKS": follow the money =================
   Each floor takes one part of Lex's business away (story.js gives the clue to the next one).
   - Floor 2, Starlight Arcade (c4): three money counters run in the back rooms behind the cabinets. UNPLUG all three (E), +$500 each:
     that's the floor's objective.
   - Floor 3, Ocean View Mall (c5): your night off is a set-up. Lex's men walk the mall dressed as shoppers, guns away, until Lex
     speaks on the PA (about 7 s in, or as soon as you fire or walk into one of them). Then they draw, and two more crews come in
     through the front doors. SURVIVE THE AMBUSH: the floor can only clear once both crews are in.
   - Floor 5, the Royal Flush (c7): McWey wants the yacht. Once Lex is down (dead or spared), TAKE THE HELM on the main deck,
     aft of the dance floor (+$2,500): that's the floor's objective, so the floor only clears once the yacht is yours.
   World cells = map + 1. */
const A2_COUNT_PAY=500,A2_REVEAL_T=7,A2_WAVES=[{t:6,n:3},{t:16,n:3}];
const A2_HELM_PAY=2500,A2_HELM=[22,9];
const A2_COUNTERS=[[10,3],[37,3],[3,10]],A2_DOORS=[[5,10],[34,10],[25,10]];
function act2PlaySetup(g,i){
 if(i===4){g.counters=A2_COUNTERS.map(q=>({x:q[0]+0.5,z:q[1]+0.5,ix:q[0],iz:q[1],off:false}));for(const c of g.counters)g.solid[c.iz*g.W+c.ix]=1;g.wst=null;
  g.obj={label:'UNPLUG THE MONEY COUNTERS',n:0,total:g.counters.length,done:false};}
 if(i===7){g.helm={x:A2_HELM[0]+0.5,z:A2_HELM[1]+0.5,ix:A2_HELM[0],iz:A2_HELM[1],taken:false};g.solid[g.helm.iz*g.W+g.helm.ix]=1;g.wst=null;
  g.obj={label:'TAKE THE HELM',n:0,total:1,done:false};}
 if(i===5){g.ambush2={st:'calm',t:0,wave:0,wt:0};
  for(const e of g.enemies){if(e.boss)continue;let L=NPCLOOK.guest();for(let k=0;k<6&&L.fem;k++)L=NPCLOOK.guest();e.look0=e.look;e.look=Object.assign({},L,{calm:0});e.bribed=1;e.undercover=1;e.aiming=false;e.state='idle';}
  g.obj={label:'SURVIVE THE AMBUSH',n:0,total:A2_WAVES.length,done:false};}}
function a2Reveal(g,why){const A=g.ambush2;if(A.st!=='calm')return;A.st='hot';A.wt=0;const p=g.player;
 for(const e of g.enemies){if(!e.undercover)continue;e.undercover=0;e.bribed=0;if(e.look0)e.look=e.look0;if(e.alive){e.state='chase';e.react=0.5;if(AI.know)AI.know(e,AI.belief.make(p.x,p.z,g.T||0,'call'));}}
 sfx('alert');shake(0.2);banner("IT'S A SET-UP",why||'The shoppers are Lex\'s men. More are coming in the front doors.');
 if(typeof storyRadio==='function'&&!storyOff())storyRadio('lex',"Now, gentlemen. Somebody remind our friend this is my mall.");}
function act2Tick(dt){const g=G;if(!g||!g.player||g.def.hub)return;const p=g.player;
 if(g.ambush2){const A=g.ambush2;A.t+=dt;
  if(A.st==='calm'){const near=g.enemies.some(e=>e.alive&&e.undercover&&Math.hypot(e.x-p.x,e.z-p.z)<1.4);const hurt=g.enemies.some(e=>e.undercover&&(!e.alive||e.hitT>0));
   if(A.t>A2_REVEAL_T||(g.shots||0)>0||near||hurt)a2Reveal(g,near?'You walked into one of them. They were never shopping.':null);}
  else if(A.wave<A2_WAVES.length){A.wt+=dt;const W=A2_WAVES[A.wave];if(A.wt>=W.t){A.wave++;g.obj.n=A.wave;let n=0;
    for(const d of A2_DOORS){if(n>=W.n)break;const x=d[0]+0.5,z=d[1]+0.5-0.2;if(blk(g,x,z))continue;n++;const e=makeEnemy(g,g.def,5,pick(['pistol','smg','pistol','shotgun']),false,x,z);e.state='chase';e.seeT=0;if(AI.know)AI.know(e,AI.belief.make(p.x,p.z,g.T||0,'call'));}
    if(typeof buildRadar==='function')buildRadar(g);popup(p.x,p.z-0.5,'MORE OF THEM AT THE DOORS','#ff8a95');sfx('alert');
    if(A.wave>=A2_WAVES.length){g.obj.done=true;banner('THE LAST CREW IS IN','Put them down, then get out of the mall.');}}}}}
const a2LexDown=g=>!g.boss||!g.boss.alive||g.boss.spared;
function act2Action(p){const g=G;if(!g||!p)return null;
 if(g.helm&&!g.helm.taken&&Math.hypot(g.helm.x-p.x,g.helm.z-p.z)<1.5)return a2LexDown(g)?{b:'HELM',h:'TAKE THE HELM'}:null;
 if(!g.counters)return null;const c=g.counters.find(c=>!c.off&&Math.hypot(c.x-p.x,c.z-p.z)<1.5);return c?{b:'UNPLUG',h:'UNPLUG THE MONEY COUNTER'}:null;}
function act2Grab(p){const g=G;const a=act2Action(p);if(!a)return false;
 if(a.b==='HELM'){const h=g.helm;h.taken=true;g.obj.n=1;g.obj.done=true;g.score+=A2_HELM_PAY;g.gpts=(g.gpts||0)+A2_HELM_PAY;sfx('cash');popup(h.x,h.z,'THE YACHT IS YOURS +$'+fmt(A2_HELM_PAY),'#7dff9a');
  banner('THE ROYAL FLUSH BELONGS TO McWEY',g.enemies.every(e=>!e.alive||e.spared)?'Your crew will sail her in. Back to the boat':'Finish the crew, then back to the boat');
  if(typeof storyRadio==='function'&&!storyOff())storyRadio('mcwey',"I can see her lights from my window. She's beautiful. Leave the sharks, I've grown fond of them.");return true;}const c=g.counters.find(c=>!c.off&&Math.hypot(c.x-p.x,c.z-p.z)<1.5);c.off=true;g.obj.n++;
 g.score+=A2_COUNT_PAY;g.gpts=(g.gpts||0)+A2_COUNT_PAY;sfx('cash');popup(c.x,c.z,'UNPLUGGED +$'+A2_COUNT_PAY,'#7dff9a');
 for(let k=0;k<14;k++)g.parts.push({t:'c',x:c.x,y:0.9,z:c.z,vx:(Math.random()-0.5)*2,vy:1+Math.random()*2,vz:(Math.random()-0.5)*2,s:0.04,c:[1.5,1.3,0.5],life:0.4});
 if(g.obj.n>=g.obj.total){g.obj.done=true;banner('THE STARLIGHT IS DARK',g.enemies.every(e=>!e.alive)?'Get back to the car':'Lex\'s quarters stop here. Finish the floor');}return true;}
function act2Guide(g){if(g.cleared)return null;const quiet=g.tip||!g.enemies.some(e=>e.alive);
 if(g.helm&&!g.helm.taken&&a2LexDown(g)&&g.enemies.every(e=>!e.alive||e.spared))return {x:g.helm.x,z:g.helm.z,k:'obj',lbl:'THE HELM'};
 if(g.counters&&quiet){const c=g.counters.find(c=>!c.off);if(c)return {x:c.x,z:c.z,k:'obj',lbl:'MONEY COUNTER'};}return null;}
function drawAct2Play(B,g){const bx=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x,y,z,0,sx,sy,sz),c,!!em),T=g.T||0;
 if(g.helm){const h=g.helm;bx(h.x,0.5,h.z,0.7,1.0,0.5,[0.36,0.2,0.1]);bx(h.x,1.02,h.z-0.05,0.6,0.04,0.4,[0.1,0.12,0.14]);bx(h.x-0.15,1.06,h.z-0.05,0.14,0.02,0.1,[0.2,1.2,0.5],true);
  const sp=h.taken?T*1.5:0;for(let k=0;k<8;k++){const a=sp+k*Math.PI/4;bx(h.x+Math.cos(a)*0.28,1.35+Math.sin(a)*0.28,h.z+0.3,0.05,0.05,0.05,[0.7,0.5,0.2]);}bx(h.x,1.35,h.z+0.3,0.12,0.12,0.06,[0.85,0.65,0.25]);
  if(!h.taken&&a2LexDown(g))bx(h.x,2.0+Math.sin(T*3)*0.08,h.z,0.12,0.12,0.12,[1.4,1.1,0.3],true);}
 if(g.counters)for(const c of g.counters){bx(c.x,0.45,c.z,0.8,0.9,0.7,[0.2,0.2,0.24]);bx(c.x,0.95,c.z,0.6,0.12,0.4,[0.75,0.76,0.8]);
  if(!c.off){for(let k=0;k<3;k++)bx(c.x-0.2+k*0.2,1.06+((T*6+k)%1)*0.08,c.z,0.14,0.04,0.07,[0.45,0.7,0.4]);bx(c.x,0.75,c.z+0.36,0.3,0.1,0.02,[0.3,1.4,0.4],true);bx(c.x+0.3,0.35,c.z+0.36,0.06,0.06,0.02,[1.4,0.2,0.1],true);}
  else{bx(c.x,0.75,c.z+0.36,0.3,0.1,0.02,[0.08,0.08,0.08]);bx(c.x+0.45,0.04,c.z+0.2,0.5,0.03,0.03,[0.1,0.1,0.1]);}}}
