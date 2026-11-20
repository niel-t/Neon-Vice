'use strict';
/* ---- a playful slap on the behind (F / pad B / the SLAP button on a phone) ----
   Stand close to a girl and give her a cheeky slap. At home (every home, the mansion's crew and its stage girls too) she jumps,
   giggles and plays along. At Velvet Palms the girls are working and Tony runs a no-touching house:
     1st time: the girl snaps at you and won't take your tips for a while, Tony warns you;
     2nd time: Tony fines you $500 ("the touching fee");
     3rd time: the bouncers throw you out, and the door stays shut to you until you've done another job (p.clubBan).
   Slapping the girl in a VIP room ends the dance there and then, and counts as a strike. Nothing more than that: it stays playful. */
const SLAP_R=1.45,SLAP_STAGE_R=2.0,SLAP_FINE=500;
const SLAP_HOME=['HEY! BEHAVE~','OOH, CHEEKY!','*GIGGLE*','DO THAT AGAIN AND YOU\'RE BUYING DINNER','HANDS, MISTER!','MMM, NAUGHTY','STOP IT... OKAY, ONE MORE'];
const SLAP_CLUB=['HEY! HANDS OFF!','LOOK, DON\'T TOUCH!','NO TOUCHING, CREEP!','THAT\'S NOT ON THE MENU!','EXCUSE ME?!'];
const TONY_SLAP=[
 ["Hey! Hands off the talent, pal. That's your one warning.","Whoa, whoa. Nobody touches my girls. That's strike one.","Eyes only, my friend. Do that again and it costs you."],
 ["That's the touching fee. Five hundred. One more and you're on the sidewalk.","Strike two. Five hundred, and I'm being nice. Next time the boys walk you out."],
 ["That's it. Boys, show him the door.","You don't listen, huh? OUT. Don't come back till you learn some manners."]];
const SLAP_SFX={
 slap:t=>{noise(t,0.07,'highpass',1600,5200,0.6,sfxG,0.8);tone(t,0.05,'sine',220,90,0.25);},
 giggle:t=>{for(let i=0;i<4;i++){const f=880+i*55+Math.random()*40;tone(t+0.05+i*0.11,0.08,'sine',f*1.25,f,0.07);tone(t+0.05+i*0.11,0.08,'triangle',f*2.5,f*2,0.025);}},
 huff:t=>{tone(t+0.04,0.16,'triangle',520,300,0.08);noise(t+0.04,0.14,'bandpass',900,500,0.06,sfxG,3);}};
const slapClub=g=>!!(g&&g.club);
/* who can be slapped right now, and how close you need to be (stage girls are up on the stage, so a little further) */
function slapList(g){const o=[];if(!g||!g.def||!g.def.hub||!g.player)return o;
 if(g.club){const v=g.club.vip;if(v.active&&v.dancer)return[{d:v.dancer,r:2.2}];if(v.escort)o.push({d:v.escort.d,r:SLAP_R});
  for(const d of g.club.dancers)if(!d.walking&&!d.lapDance)o.push({d,r:SLAP_STAGE_R});return o;}
 for(const n of g.npcs){if(n.kind==='pgirl'&&!n.bed&&!n.tub&&!n.massage&&n.alive!==false)o.push({d:n,r:SLAP_R});else if(n.kind==='sdancer'&&g.mansion)o.push({d:n,r:SLAP_STAGE_R});else if(n.kind==='dancer'&&g.slots)o.push({d:n,r:SLAP_STAGE_R});}
 return o;}
function slapNear(g){const p=g&&g.player;if(!p||g.seq||g.cine||g.seatP||p.bed||g.hubDone)return null;let best=null,bd=1e9;
 for(const q of slapList(g)){const d=Math.hypot(q.d.x-p.x,q.d.z-p.z);if(d<q.r&&d<bd){bd=d;best=q.d;}}return best;}
/* runs every hub frame: finds the girl in reach (g.slapN, for the hint and the phone button), takes the key press, counts timers down */
function slapTick(dt){const g=G;if(!g||!g.def||!g.def.hub)return;const p=g.player;
 g.slapCd=Math.max(0,(g.slapCd||0)-dt);if(p&&p.slapT>0)p.slapT=Math.max(0,p.slapT-dt);
 for(const n of g.npcs){if(n.slapT>0)n.slapT=Math.max(0,n.slapT-dt);if(n.cold>0)n.cold=Math.max(0,n.cold-dt);}
 /* banned from Velvet Palms: the bouncers turn you round at the door */
 if(g.club&&p&&state==='play'&&!g.hubDone&&!fading&&clubBanned()&&inRoom(g.club.room,p.x,p.z)){if(g.park){p.x=g.park.x;p.z=g.park.z+1.2;}popup(p.x,p.z,'BOUNCER: YOU\'RE DONE HERE TONIGHT','#ff8a95');openCarMenuForce();}
 g.slapN=state==='play'?slapNear(g):null;
 if(pressed.slap){pressed.slap=false;if(g.slapN)slapGirl(g,g.slapN);}}
function slapGirl(g,d){const p=g.player;if(!p||!d||g.slapCd>0)return false;arm();if(!SFX.slap)Object.assign(SFX,SLAP_SFX);g.slapCd=0.9;
 p.slapT=0.4;p.a=Math.atan2(d.x-p.x,d.z-p.z);
 /* she looks back over the shoulder nearer to you */
 const side=Math.sin(angDiff(d.a||0,Math.atan2(p.x-d.x,p.z-d.z)));d.slapT=0.8;d.slapS=side<0?-1:1;
 setTimeout(()=>{if(G===g)sfx('slap');},120);
 const hx=(p.x+d.x)/2,hz=(p.z+d.z)/2;
 for(let i=0;i<6;i++)g.parts.push({t:'c',x:hx,y:0.95,z:hz,vx:rnd(-0.8,0.8),vy:rnd(0.6,1.6),vz:rnd(-0.8,0.8),s:0.05,c:[1,0.85,0.9],life:0.4});
 if(slapClub(g))slapStrike(g,d);
 else{setTimeout(()=>{if(G===g)sfx('giggle');},260);popup(d.x,d.z,pick(SLAP_HOME),'#ff8ad0');
  for(let i=0;i<5;i++)g.parts.push({t:'c',x:d.x+rnd(-0.2,0.2),y:1.7,z:d.z+rnd(-0.2,0.2),vx:rnd(-0.25,0.25),vy:rnd(0.5,0.9),vz:rnd(-0.25,0.25),s:0.07,c:[1,0.3,0.6],life:1.2});
  d.boost=Math.min(1.6,(d.boost||0)+0.4);}
 return true;}
/* Velvet Palms: the girl snaps at you and Tony counts strikes for this visit */
function slapStrike(g,d){const c=g.club,p=myProg();c.slaps=(c.slaps||0)+1;const n=c.slaps;
 setTimeout(()=>{if(G===g)sfx('huff');},250);popup(d.x,d.z,pick(SLAP_CLUB),'#ff5a6e');d.cold=Math.max(d.cold||0,45);d.boost=0;
 if(c.vip.active&&c.vip.dancer===d)stopLapdance();
 if(c.vip.escort&&c.vip.escort.d===d)slapSendBack(g);
 if(c.tony)tonySays(g,pick(TONY_SLAP[Math.min(2,n-1)]));
 if(n===1){banner('TONY: NO TOUCHING','First warning · '+d.dname+' won\'t take your tips for a while');}
 else if(n===2){const f=Math.min(SLAP_FINE,Math.max(0,p.wallet));p.wallet-=f;saveProg();sfx('cash');popup(g.player.x,g.player.z,'-$'+fmt(f)+' · TOUCHING FEE','#ff8a95');banner('TOUCHING FEE · $'+fmt(f),'Last warning · one more and the bouncers walk you out');}
 else slapThrowOut(g);}
/* the girl you booked walks back to her pole, the booking is gone */
function slapSendBack(g){const c=g.club,e=c.vip.escort;if(!e)return;const d=e.d;c.vip.escort=null;
 if(e.ph==='down'){d.walking=false;d.x=d.pole.x;d.z=d.pole.z;d.y=0.36;}
 else{const st=stageStep(g,d.pole.x,d.pole.z);c.back={d,ph:'walk',t:0,tx:st.x,tz:st.z};WORLD.cell.bfs(g,c.back.f=new Int16Array(g.W*g.H),Math.floor(st.x),Math.floor(st.z));}
 g.obj='TIP THE DANCERS · BOOK A VIP ROOM WITH TONY';}
/* strike three: the bouncers walk you out to your car and the door stays shut until you've done another job */
function slapThrowOut(g){const p=myProg(),a=arm();p.clubBan=a.jobs;saveProg();g.hubDone=true;
 const out=()=>{if(G!==g)return;g.hubDone=false;const pl=g.player,c=g.club;if(c.vip.active)stopLapdance();slapSendBack(g);
  if(pl&&g.park){pl.x=g.park.x;pl.z=g.park.z+1.2;pl.vx=pl.vz=0;}banner('THROWN OUT OF VELVET PALMS','Tony\'s boys won\'t let you back in until you\'ve done another job');openCarMenuForce();};
 setTimeout(()=>{if(G!==g)return;if(!fadeTo(out))out();},1600);}
/* the club door: banned until the next job */
function clubBanned(){const p=myProg(),a=arm();return p.clubBan!==undefined&&p.clubBan!==null&&p.clubBan===a.jobs;}
/* the hint over her head (keyboard and pad; the phone gets the SLAP button) */
function drawSlapHint(c,g,u){const d=g.slapN;if(!d||touchMode)return;const s=project(d.x,1.9,d.z);if(!s)return;const up=g.ia&&Math.hypot(g.ia.x-d.x,g.ia.z-d.z)<0.6?24*u:0;s[1]-=up;
 const lbl=(padMode?'(B) ':'[F] ')+(slapClub(g)?'SLAP · TONY IS WATCHING':'SLAP HER BUTT');c.font=VTF(14*u);const tw=c.measureText(lbl).width;
 c.fillStyle='rgba(10,4,18,.75)';c.fillRect(s[0]-tw/2-5*u,s[1]-18*u,tw+10*u,16*u);txt(c,lbl,s[0],s[1]-17*u,slapClub(g)?'#ff8a95':'#ff8ad0','center',14*u);}
