'use strict';
/* GIRLFRIENDS (2026-11-22): the dancers at Velvet Palms get to know you. Every $100 you throw on stage, every VIP room you book with
   her, every bill in the VIP lounge and every dance you sit all the way through builds her affection (GF_NEED to fill, at most GF_JOB_CAP
   per job, so it takes a few nights). Once she is crazy about you she asks to leave with you after a VIP dance (or Tony lets you ask from
   his list): she quits, walks out the front door and from then on lives at your home as your girlfriend, in her club look.
   At home she is a 'pgirl' with n.gf set: she hangs out, dances, joins you in bed first (bedN counts her) and has her own lines.
   Saved per operator: p.gf=[{n,prof,fit}] (her look, kept exactly), p.gfAff={NAME:{a,k,j}} (affection, job key, gained this job).
   The club's girls now always look the same (gfClubLook seeds her look by her name), so the one you keep coming back for is her. */
const GF_NEED=20,GF_JOB_CAP=10,GF_MAX=3;
/* when girlfriends leave the roster these girls start working at the club instead, so the stage never runs short */
const GF_MORE_NAMES=['VELVET','CANDY','RAVEN','SAPPHIRE','LOLA','TIFFANY'];
let GF_ASK=null;
function gfList(){const p=myProg();if(!Array.isArray(p.gf))p.gf=[];return p.gf;}
function gfN(){return gfList().length;}
function gfIs(name){return gfList().some(q=>q.n===name);}
function gfAffOf(name){const p=myProg(),a=p.gfAff&&p.gfAff[name];return a?a.a:0;}
function gfReady(name){return !gfIs(name)&&gfAffOf(name)>=GF_NEED;}
function gfAffRec(name){const p=myProg();if(!p.gfAff||typeof p.gfAff!=='object')p.gfAff={};return p.gfAff[name]||(p.gfAff[name]={a:0,k:-1,j:0});}
/* ---------------- the club roster ---------------- */
function gfAllNames(){return DANCER_NAMES.concat(GF_MORE_NAMES);}
/* tonight's girls (n poles): the girls who already like you are always working (one pole is kept for a new face), the rest are drawn at random */
function gfClubNames(n){const free=DANCER_NAMES.filter(x=>!gfIs(x));for(const x of GF_MORE_NAMES)if(free.length<DANCER_NAMES.length&&!gfIs(x))free.push(x);
 const sh=free.slice().sort(()=>Math.random()-0.5),fav=sh.filter(x=>gfAffOf(x)>0).sort((a,b)=>gfAffOf(b)-gfAffOf(a)).slice(0,Math.max(1,(n||4)-1));
 /* the rest are picked so no two girls on stage share a lingerie style, a figure or a hair colour */
 const key=x=>{const L=gfClubLook(x).L;return[L.ling,L.curve,L.hair.join()];},used=fav.map(key),out=fav.slice(),rest=[];
 for(const x of sh){if(fav.includes(x))continue;const k=key(x);if(out.length<(n||4)&&!used.some(u=>u.some((v,i)=>v===k[i]))){out.push(x);used.push(k);}else rest.push(x);}
 return out.concat(rest);}
/* her look, the same every night: seeded by her name; lingerie, figure and hair spread by her place on the roster */
function gfClubLook(name){const all=gfAllNames();let ix=all.indexOf(name);if(ix<0)ix=mvSeed(name)%all.length;
 return mvSeeded(mvSeed('vp:'+name),()=>{const prof=dancerProf(ix);prof.ling=DANCER_LING[ix%DANCER_LING.length];prof.bod=DANCER_BODY[(ix*3)%DANCER_BODY.length];
  prof.hair=girlHairC(prof,ix,DANCER_HAIR[(ix*5+1)%DANCER_HAIR.length]);const fit=ix%5;return{prof,fit,L:dancerLook(fit,0,prof)};});}
/* the look she brings home: exactly what she wore at the club */
function gfLook(e){return mvSeeded(mvSeed('gf:'+e.n),()=>dancerLook(e.fit||0,0,e.prof||gfClubLook(e.n).prof));}
/* ---------------- affection ---------------- */
function gfPop(g,d,txt,col){setTimeout(()=>{if(G===g)popup(d.x,d.z-0.5,txt,col);},650);}
function gfAff(d,n){const g=G;if(!g||!g.club||g.mansion||!d||d.kind!=='sdancer'||!d.dname||gfIs(d.dname))return;
 const a=gfAffRec(d.dname),jk=arm().jobs;if(a.k!==jk){a.k=jk;a.j=0;}
 if(a.a>=GF_NEED)return;
 const add=Math.min(n,GF_JOB_CAP-a.j);
 if(add<=0){if(!(d.gfCapT>g.T-20)){d.gfCapT=g.T;gfPop(g,d,d.dname+': COME SEE ME AFTER YOUR NEXT JOB','#ffb3d1');}return;}
 a.a=Math.min(GF_NEED,a.a+add);a.j+=add;saveProg();
 gfPop(g,d,'♥ '+d.dname+' '+a.a+'/'+GF_NEED,'#ff6fae');
 if(a.a>=GF_NEED){sfx('clear');banner(d.dname+' IS CRAZY ABOUT YOU',touchMode?'Ask her home after a VIP dance, or tap Tony':'Ask her home after a VIP dance, or from Tony\'s list');}}
/* a VIP dance just ended: sitting through most of it counts, and if she is crazy about you she asks to leave with you */
function gfDanceDone(g,d,sat){if(!d||d.kind!=='sdancer')return;if(sat>=18)gfAff(d,2);
 if(gfReady(d.dname))setTimeout(()=>{if(G===g&&state==='play'&&g.club&&g.club.dancers.includes(d))gfOffer(d.dname);},1300);}
function gfHearts(name){const a=gfAffOf(name);return a>=GF_NEED?'♥ CRAZY ABOUT YOU':a?'♥ '+a+'/'+GF_NEED:'♡ DOESN\'T KNOW YOU YET';}
/* ---------------- asking her home ---------------- */
function gfOffer(name){GF_ASK=name;openStore('gfask');}
const GF_ASKS=["I'm done for tonight. Take me with you?","Get me out of here, baby. For good.","I don't want to dance for anybody else. Just you.","Tony can find another girl. Take me home."];
function gfRender(msg){const p=myProg(),name=GF_ASK,full=gfN()>=GF_MAX;
 $('stWallet').textContent='$'+fmt(p.wallet);$('stOwed').textContent='♥ '+GF_NEED+'/'+GF_NEED;
 document.querySelector('#sStore .shT').textContent=(name||'')+' · AFTER HOURS';
 document.querySelector('#sStore .shS').textContent='SHE WANTS TO LEAVE WITH YOU';
 for(const id of ['stGold','stGoldH','stHome','stHomeH'])$(id).style.display='none';
 for(const id of ['stCars','stCarsH'])$(id).style.display='';
 $('stCarsH').textContent='"'+GF_ASKS[(name||'').length%GF_ASKS.length]+'"';
 $('stCars').innerHTML=(full?`<button class="scard" data-gf="full"><div class="pn">HOUSE IS FULL</div><div class="pd">Three girlfriends already live with you. That's plenty of drama.</div><div class="sp">${gfN()}/${GF_MAX}<span class="kbhint"> (1)</span></div></button>`
  :`<button class="scard" data-gf="yes"><div class="pn">TAKE HER HOME</div><div class="pd">She quits tonight and moves in with you as your girlfriend.</div><div class="sp">♥ GIRLFRIEND<span class="kbhint"> (1)</span></div></button>`)
  +`<button class="scard" data-gf="no"><div class="pn">NOT TONIGHT</div><div class="pd">She keeps dancing. Ask Tony for her any time.</div><div class="sp">MAYBE LATER<span class="kbhint"> (2)</span></div></button>`;
 $('stMsg').textContent=msg||'';}
/* girls who are crazy about you show up on Tony's list with a TAKE HER HOME card */
function gfTonyList(ds){return ds.filter(d=>gfReady(d.dname)&&!d.walking&&!d.npcVip&&!d.lapDance);}
function gfTonyN(ds){return gfTonyList(ds).length;}
function gfTonyCards(ds,off){return gfTonyList(ds).map((d,i)=>`<button class="scard" data-gf="t:${d.dname}"><div class="pn">TAKE ${d.dname} HOME</div><div class="pd">${gfN()>=GF_MAX?'Three girlfriends already live with you.':'She is crazy about you. She quits tonight and moves in.'}</div><div class="sp">♥ GIRLFRIEND<span class="kbhint"> (${off+i+1})</span></div></button>`).join('');}
function gfChoose(v){const g=G;
 if(v==='full'){sfx('blip');return renderStore('Three is enough. Nobody needs four girlfriends.');}
 if(v==='no'){state='play';show(null);const d=g&&g.club&&g.club.dancers.find(q=>q.dname===GF_ASK);if(d)gfPop(g,d,'MAYBE NEXT TIME, SUGAR','#ffb3d1');GF_ASK=null;return;}
 if(v.startsWith('t:'))GF_ASK=v.slice(2);
 gfTake(GF_ASK);}
function gfTake(name){const g=G,c=g&&g.club;if(!c)return;const d=c.dancers.find(q=>q.dname===name);
 if(!d||gfIs(name)){state='play';show(null);return;}
 if(gfN()>=GF_MAX){sfx('blip');return renderStore('Three girlfriends already live with you.');}
 gfList().push({n:name,prof:d.prof,fit:d.fit});saveProg();GF_ASK=null;
 state='play';show(null);sfx('clear');
 banner(name+' IS YOUR GIRLFRIEND','She quits tonight · she will be waiting for you at home');
 if(c.tony)tonySays(g,pick(["Now I'm a dancer short. Treat her right, or you answer to me.","Another one walks out with a customer. Take care of her, pal.","You know how many guys tried that? Congratulations."]));
 gfLeave(g,d);}
/* she walks off the stage (or out of the VIP lounge) and out of the front door */
function gfLeave(g,d){const c=g.club;if(c.back&&c.back.d===d)c.back=null;d.walking=true;d.lapDance=false;d.gfOut=true;
 const fd=c.front||{x:Math.floor(g.W/2),z:g.H-2},tx=fd.x+0.5,tz=fd.z-1.3,f=new Int16Array(g.W*g.H);WORLD.cell.bfs(g,f,Math.floor(tx),Math.floor(tz));
 const onStage=(d.y||0)>0.2,st=onStage?stageStep(g,d.x,d.z):null;
 (c.gfOut||(c.gfOut=[])).push({d,f,tx,tz,t:0,ph:onStage?'down':'walk',fx:d.x,fz:d.z,fy:d.y||0,sx:st?st.x:d.x,sz:st?st.z:d.z});}
function gfTick(g,dt){const c=g.club;if(!c||!c.gfOut||!c.gfOut.length)return;
 for(const o of c.gfOut.slice()){const d=o.d;o.t+=dt;
  if(o.ph==='down'){const k=Math.min(1,o.t/0.8);d.x=o.fx+(o.sx-o.fx)*k;d.z=o.fz+(o.sz-o.fz)*k;d.y=o.fy*(1-k)+Math.sin(k*Math.PI)*0.25;d.walk=(d.walk||0)+dt*9;d.a=Math.atan2(o.sx-o.fx,o.sz-o.fz);if(k>=1){o.ph='walk';o.t=0;d.y=0;}}
  else if(Math.hypot(o.tx-d.x,o.tz-d.z)>0.5&&o.t<30)clubStep(g,d,o.f,o.tx,o.tz,2.2,dt);
  else{c.gfOut.splice(c.gfOut.indexOf(o),1);gfGone(g,d);}}}
function gfGone(g,d){const c=g.club;popup(d.x,d.z,'SEE YOU AT HOME, BABY','#ff6fae');sfx('door');
 const i=g.npcs.indexOf(d);if(i>=0)g.npcs.splice(i,1);const j=c.dancers.indexOf(d);if(j>=0)c.dancers.splice(j,1);}
/* ---------------- at home ---------------- */
/* spawn(q,look) makes a 'pgirl' at q; off: how many hired girls already took the spots */
function gfHome(g,spawn,off){const L=gfList(),have=g.spawned.gf||0,ms=g.spots.m||[],o=(g.slots&&g.slots.o)||g.player||{x:g.W/2,z:g.H/2};
 for(let i=have;i<L.length;i++){const j=off+i,b=ms[0]||o,q=ms[j]||{x:b.x+1.1*(j-ms.length+1),z:b.z+0.6};
  const n=spawn(q,gfLook(L[i]));n.gf=1;n.dname=L[i].n;n.prof=L[i].prof;n.girlI=j;}
 g.spawned.gf=Math.max(have,L.length);}
const GF_LINES=["Missed you, baby. How was work?","Tony called. He wants me back. I told him I'm retired.","No more pole. Unless you ask nicely.","Take me dancing somewhere I'm not the one working.","You smell like gunpowder again. Shower first.","The girls at the club are so jealous of me.","I told my mama I'm dating a businessman. Technically true.","This is so much better than a dressing room.","Don't wait so long next time. I get bored."];
function gfLine(n){const p=myProg(),L=GF_LINES.slice();if(gfN()>1)L.push('Be nice to the other girls. But I am still your favourite, right?');return (n.dname?n.dname+': ':'')+pick(L);}
