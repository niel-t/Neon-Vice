'use strict';
/* ================= ACT 3 "CONDEMNED": the building fights back, and the money wears black tie =================
   - Floor 1, Ocean Drive Demolition (c8): the charges are on a clock (A3_FUSE seconds, shown with the objective). Cut every wire in time
     for the usual pay; if the clock runs out, each charge still wired goes off where it stands (it hurts anybody close, you too),
     and the block comes down without your bonus.
   - Floor 2, the Grand Biscayne Gala (c9): black tie, so your gun starts holstered and Kade's security mingle with the guests
     without looking for trouble. They only turn on you if one of them sees a gun in your hand, hears a shot, or sees one of
     their own go down. Take the ledger while nobody has noticed and the floor counts as clear without another shot (+$2,000);
     once the alarm is up, it's a normal fight.
   Kade Tower keeps its climb, the hoist and the crane. */
const A3_FUSE=150,A3_QUIET_PAY=2000,A3_SEE=7.5;
function act3PlaySetup(g,i){
 if(i===8&&g.rigs){g.fuse3={t:A3_FUSE,blown:false};g.obj.base=g.obj.label;}
 if(i===9){g.gala={calm:true,quiet:false};const p=g.player;if(p&&kitOn(p)&&p.weapon)holster(p);
  for(const e of g.enemies){if(e.boss)continue;e.bribed=1;e.mingle=1;e.aiming=false;e.state='idle';}
  a4Later(g,2600,()=>banner('BLACK TIE','Gun away and they leave you alone. A gun in your hand, a shot, or a body they can see, and the party is over.'));}}
function a3Alarm(g,why){const G3=g.gala;if(!G3||!G3.calm)return;G3.calm=false;const p=g.player;
 for(const e of g.enemies){if(!e.mingle)continue;e.mingle=0;e.bribed=0;if(e.alive){e.state='chase';e.react=0.5;if(AI.know)AI.know(e,AI.belief.make(p.x,p.z,g.T||0,'call'));}}
 sfx('alert');banner('SECURITY!',why);if(typeof storyRadio==='function'&&!storyOff())storyRadio('kade',"Security, the gentleman by the "+(g.obj&&g.obj.done?'safe':'bar')+" is not on the guest list. Remove him.");}
function act3Tick(dt){const g=G;if(!g||!g.player||g.def.hub)return;const p=g.player;
 /* set up on the first tick: act2Setup places the rigs and the safe after the act hooks run */
 if(!g.a3init){g.a3init=1;const i=typeof MISSION!=='undefined'&&missionIsCampaign(MISSION)?missionIdx(MISSION):-1;if(i===8||i===9)act3PlaySetup(g,i);}
 if(g.fuse3&&!g.fuse3.blown&&g.obj&&!g.obj.done){const F=g.fuse3;F.t-=dt;const s=Math.max(0,Math.ceil(F.t));g.obj.label=g.obj.base+'  '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
  if(F.t<=10&&!F.warn){F.warn=1;banner('TEN SECONDS','Get clear of the charges.');sfx('alert');}
  if(F.t<=0){F.blown=true;g.obj.label='THE CHARGES WENT OFF';g.obj.done=true;for(const r of g.rigs)if(!r.cut){r.blown=true;r.cut=true;explode({x:r.x,z:r.z,own:'e'});}
   banner('THE BLOCK IS COMING DOWN','Too slow. No bonus for the wires.');}}
 else if(g.fuse3&&g.obj&&g.obj.done&&!g.fuse3.blown&&g.obj.label!==g.obj.base)g.obj.label=g.obj.base;
 if(g.gala&&g.gala.calm){const live=g.enemies.filter(e=>e.alive&&e.mingle),gun=p.weapon&&!WD[p.weapon.type].melee;
  const sees=(e,x,z,r)=>Math.hypot(e.x-x,e.z-z)<r&&los(e.x,e.z,x,z);
  if((g.shots||0)>0)return a3Alarm(g,'A shot at the gala. Every one of them heard it.');
  if(gun&&live.some(e=>sees(e,p.x,p.z,A3_SEE)))return a3Alarm(g,'One of them saw the gun.');
  for(const d of g.enemies)if(d.mingle&&(!d.alive||d.hitT>0)&&!d.a3seen){d.a3seen=1;if(live.some(e=>e!==d&&sees(e,d.x,d.z,A3_SEE)))return a3Alarm(g,'They saw him go down.');}
  if(g.obj&&g.obj.done&&!g.gala.quiet){g.gala.quiet=true;for(const e of g.enemies)if(e.mingle)e.spared=1;g.score+=A3_QUIET_PAY;g.gpts=(g.gpts||0)+A3_QUIET_PAY;sfx('cash');popup(p.x,p.z-0.5,'NOBODY NOTICED +$'+fmt(A3_QUIET_PAY),'#7dff9a');}}}
function drawAct3Play(B,g){if(!g.rigs)return;const bx=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x,y,z,0,sx,sy,sz),c,!!em);
 for(const r of g.rigs)if(r.blown){for(let k=0;k<5;k++)bx(r.x+Math.sin(k*2.3)*0.5,0.1+k%2*0.08,r.z+Math.cos(k*1.7)*0.5,0.4,0.2+k%3*0.1,0.3,[0.36,0.33,0.3]);}}
