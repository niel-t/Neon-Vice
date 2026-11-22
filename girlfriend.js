'use strict';
/* GIRLFRIENDS (2026-11-22): the dancers at Velvet Palms get to know you. Every $100 you throw on stage, every VIP room you book with
   her, every bill in the VIP lounge and every dance you sit all the way through builds her affection (GF_NEED to fill, at most GF_JOB_CAP
   per job, so it takes a few nights). Once she is crazy about you, she stays to talk after a VIP dance
   (or walk up to her on stage: TALK TO her). Ask her home in the conversation and she quits, walks out the front door and from then on lives at your home as your girlfriend, in her club look.
   At home she is a 'pgirl' with n.gf set: she hangs out, dances, joins you in bed first (bedN counts her) and has her own lines.
   Saved per operator: p.gf=[{n,prof,fit}] (her look, kept exactly), p.gfAff={NAME:{a,k,j}} (affection, job key, gained this job).
   The club's girls now always look the same (gfClubLook seeds her look by her name), so the one you keep coming back for is her. */
const GF_NEED=20,GF_JOB_CAP=10,GF_MAX=3;
/* when girlfriends leave the roster these girls start working at the club instead, so the stage never runs short */
const GF_MORE_NAMES=['VELVET','CANDY','RAVEN','SAPPHIRE','LOLA','TIFFANY'];
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
/* a VIP dance just ended: sitting through most of it counts, and if she is crazy about you she stays and talks to you */
function gfDanceDone(g,d,sat){if(!d||d.kind!=='sdancer')return;if(sat>=18)gfAff(d,2);
 if(gfReady(d.dname)){const c=g.club;if(c.back&&c.back.d===d)c.back=null;d.walking=true;d.gfWait=true;
  setTimeout(()=>{if(G===g&&state==='play'&&c.dancers.includes(d))gfTalk(g,d);else if(G===g)gfSendBack(g,d);},900);}}
function gfHearts(name){const a=gfAffOf(name);return a>=GF_NEED?'♥ CRAZY ABOUT YOU':a?'♥ '+a+'/'+GF_NEED:'♡ DOESN\'T KNOW YOU YET';}
/* ---------------- asking her home: a conversation with her, not a menu ----------------
   Her line and your answers sit in a speech box at the bottom of the screen (tap, click or 1-3). Your answers are in your
   operator's own voice. Moving away ends it as "not tonight". The box is DOM, so it works the same on a phone. */
const GF_TALK={
 open:["Can I tell you something? I don't dance like that for anybody else.","You keep coming back. The other girls tease me about you now.","I get off at two. I really don't feel like going home alone tonight.","Every night I look for you in the crowd. Is that crazy?"],
 opts:[{r:'yes',t:{don:"Then quit. Come home with me tonight.",consigliere:"Then let me get you out of here. For good.",money:"Quit tonight. Whatever Tony pays you, I'll cover it.",_:"Then come home with me tonight."}},
  {r:'tease',t:{don:"You say that to every guy with a fat wallet.",consigliere:"I bet you say that to every lawyer in here.",money:"I know a sales pitch when I hear one, sweetheart.",_:"You say that to every guy with a fat wallet."}},
  {r:'no',t:{don:"Not tonight, sweetheart.",consigliere:"Not tonight. I have an early start.",money:"Not tonight. The books won't balance themselves.",_:"Not tonight, sweetheart."}}],
 yes:["You mean it? Give me two minutes to grab my bag.","Don't you dare change your mind. I'm getting my coat.","Finally. I'm telling Tony I quit. Right now."],
 tease:["Ouch. Tips don't buy this, baby. Ask me again when you mean it.","Every guy? No. Just you. Think about it."],
 no:["Then come back soon. I'll be right here.","Okay. But don't make me wait too long."],
 full:["Three girls already waiting at your place? Wow. Call me if one of them leaves."]};
const gfHash=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;};
function gfTalk(g,d){const c=g&&g.club;if(!c||c.talk||!gfReady(d.dname))return;arm();mouse.down=false;
 d.walking=true;d.gfWait=true;d.vx=d.vz=0;g.say=null;const p=g.player;
 c.talk={d,px:p.x,pz:p.z,t:0,line:GF_TALK.open[(gfHash(d.dname)+arm().jobs)%GF_TALK.open.length]};sfx('blip');gfBox(g);}
function gfBox(g){const c=g.club,T=c.talk;let el=document.getElementById('gfTalk');
 if(!el){el=document.createElement('div');el.id='gfTalk';el.style.cssText='position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(94vw,560px);z-index:60;background:rgba(12,4,22,.94);border-left:4px solid #ff6fae;padding:10px 12px;box-sizing:border-box;font-family:inherit';
  el.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button[data-gft]');if(b){e.stopPropagation();gfPick(+b.dataset.gft);}});
  for(const ev of ['pointerdown','touchstart','mousedown'])el.addEventListener(ev,e=>e.stopPropagation(),{passive:true});document.body.appendChild(el);}
 const esc=t=>String(t).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
 const opts=gfN()>=GF_MAX?GF_TALK.opts.slice(1):GF_TALK.opts;T.opts=opts;
 el.innerHTML=`<div style="color:#ff6fae;font-size:11px;letter-spacing:1px;margin-bottom:4px">${esc(T.d.dname)} ♥</div><div style="color:#fff;font-size:16px;line-height:1.3;margin-bottom:8px">${esc(T.line)}</div>`
  +opts.map((o,i)=>`<button type="button" data-gft="${i}" style="display:block;width:100%;text-align:left;margin:4px 0;padding:8px 10px;background:#1c0a2a;color:#ffd36b;border:1px solid #5a2a6a;font:inherit;font-size:14px;cursor:pointer">${i+1}. ${esc(dlgText(o.t))}</button>`).join('');
 el.style.display='block';}
function gfBoxHide(){const el=document.getElementById('gfTalk');if(el)el.style.display='none';}
function gfSay(g,who,txt){g.say={who,txt,t:0,dur:2.2+txt.length*0.05};}
function gfPick(k){const g=G,c=g&&g.club,T=c&&c.talk;if(!T||!T.opts||!T.opts[k])return;const o=T.opts[k],d=T.d;T.opts=null;gfBoxHide();sfx('pick');
 const me=dlgText(o.t);gfSay(g,CHARS[selIdx].name,me);
 const after=(fn,ms)=>setTimeout(()=>{if(G===g)fn();},ms);
 if(o.r==='yes'){after(()=>{gfSay(g,d.dname,pick(GF_TALK.yes));c.talk=null;gfTake(d.dname);},1400);return;}
 after(()=>{gfSay(g,d.dname,pick(gfN()>=GF_MAX&&o.r!=='tease'?GF_TALK.full:GF_TALK[o.r]));c.talk=null;gfSendBack(g,d);},1400);}
/* the talk is over and she goes back to work: down off the lounge floor to her pole, or straight back to dancing */
function gfSendBack(g,d){const c=g.club;d.gfWait=false;if(!c.dancers.includes(d))return;
 if((d.y||0)>0.2){d.walking=false;return;}
 const st=stageStep(g,d.pole.x,d.pole.z);c.back={d,ph:'walk',t:0,tx:st.x,tz:st.z};WORLD.cell.bfs(g,c.back.f=new Int16Array(g.W*g.H),Math.floor(st.x),Math.floor(st.z));}
function gfTalkEnd(g){const c=g.club,T=c&&c.talk;if(!T)return;gfBoxHide();const d=T.d;c.talk=null;gfSay(g,d.dname,pick(GF_TALK.no));gfSendBack(g,d);}
/* keys 1-3 pick an answer, Escape walks away */
window.addEventListener('keydown',e=>{const g=G,T=g&&g.club&&g.club.talk;if(!T||!T.opts||state!=='play')return;
 const m=/^(?:Digit|Numpad)([1-3])$/.exec(e.code);if(m){gfPick(+m[1]-1);e.preventDefault();e.stopImmediatePropagation();}
 else if(e.code==='Escape'){gfTalkEnd(g);e.preventDefault();e.stopImmediatePropagation();}},true);
function gfTake(name){const g=G,c=g&&g.club;if(!c)return;const d=c.dancers.find(q=>q.dname===name);
 if(!d||gfIs(name)||gfN()>=GF_MAX)return;
 gfList().push({n:name,prof:d.prof,fit:d.fit});saveProg();sfx('clear');
 banner(name+' IS YOUR GIRLFRIEND','She quits tonight · she will be waiting for you at home');
 if(c.tony)setTimeout(()=>{if(G===g)tonySays(g,pick(["Now I'm a dancer short. Treat her right, or you answer to me.","Another one walks out with a customer. Take care of her, pal.","You know how many guys tried that? Congratulations."]));},2600);
 gfLeave(g,d);}
/* she walks off the stage (or out of the VIP lounge) and out of the front door */
function gfLeave(g,d){const c=g.club;if(c.back&&c.back.d===d)c.back=null;d.walking=true;d.lapDance=false;d.gfOut=true;
 const fd=c.front||{x:Math.floor(g.W/2),z:g.H-2},tx=fd.x+0.5,tz=fd.z-1.3,f=new Int16Array(g.W*g.H);WORLD.cell.bfs(g,f,Math.floor(tx),Math.floor(tz));
 const onStage=(d.y||0)>0.2,st=onStage?stageStep(g,d.x,d.z):null;
 (c.gfOut||(c.gfOut=[])).push({d,f,tx,tz,t:0,ph:onStage?'down':'walk',fx:d.x,fz:d.z,fy:d.y||0,sx:st?st.x:d.x,sz:st?st.z:d.z});}
function gfTick(g,dt){const c=g.club;if(!c)return;
 /* while you talk you both stand still and face each other; walking off ends it */
 const T=c.talk;if(T){const p=g.player,d=T.d;T.t+=dt;if(T.opts&&T.t>0.6&&moveIntent()){gfTalkEnd(g);}else{p.x=T.px;p.z=T.pz;p.vx=p.vz=0;p.a=Math.atan2(d.x-p.x,d.z-p.z);d.vx=d.vz=0;d.a+=clamp(angDiff(d.a,Math.atan2(p.x-d.x,p.z-d.z)),-5*dt,5*dt);}}
 if(!c.gfOut||!c.gfOut.length)return;
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
