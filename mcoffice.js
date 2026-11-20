'use strict';
/* ================= McWEY'S OFFICE: his secretary, and what she is up to when you walk in =================
   Candi Carrera runs the 52nd floor. Every visit she is doing something else (never the same twice running):
   'desk'  behind the reception counter by the door, typing, on the phone, doing her nails;
   'count' at the counting table, thumbing bills and stacking gold bars;
   'lap'   perched on McWey's knee behind the big desk (and still there in the briefing close-up).
   McWey acts while he talks (models.js gestVec: points, spreads his hands, leans in, wags a finger, counts cash,
   sits back with his hands behind his head, sips his whisky, smokes). officeSetup/officeTick/drawMcOffice/talkMcWey call in here. */
const SEC_MODES=['desk','count','lap'];let SEC_LAST=null;
const SEC_DESK={x:14.6,z:9.55,w:2.2,d:0.62},SEC_TABLE={x:16.1,z:7.0,w:1.4,d:0.72};
function secLook(){return{fem:true,curvy:true,calm:1,sleeves:true,pads:true,skirt:0.5,heels:true,hose:'sheer',hoseC:[0.06,0.05,0.07],
 skin:hex(0xf2c7a5),jacket:hex(0xd8174f),shirt:hex(0xfaf4ee),pants:hex(0xf2c7a5),shoes:hex(0xd8174f),hs:'big',hair:hex(0xf0cf6a),
 iris:'#2a5a9a',lip:[214,18,60],shadow:'rgba(150,60,140,.55)',chain:true,bw:0.9,bd:0.9,bh:1.02,waist:0.8,bust:1.0,hips:1.0,curve:1.05};}
/* what she says: a greeting for each act, then her lines when you talk to her */
const SEC_HELLO={desk:["Mr McWey's expecting you. Go right in, sugar.","Wipe your feet. The carpet costs more than your car."],
 count:["Four hundred and twelve, four hundred and... don't talk to me, I'll lose count.","Every bar gets counted twice. Him first, then me."],
 lap:["Oh! We were just going over the books.","Don't mind me, honey. I'm part of the furniture."]};
const SEC_CHAT=["I type a hundred words a minute. Most of them are numbers.","Coffee? It's Cuban. Everything up here is Cuban.",
 "He calls me his accounts receivable. I call him Mr McWey.","If he offers you a cigar, take it. If he offers you a raise, get it in writing.",
 "Fifty-two floors and the elevator still plays Barry Manilow.","The count's off by one bar. Don't look at me like that.",
 "I've seen men walk in here and leave by the window. You're doing fine.","Big hair, big shoulders, big money. It's 1986, sugar."];
function secPickMode(){const f=window.SECMODE;if(SEC_MODES.includes(f))return SEC_LAST=f;const o=SEC_MODES.filter(m=>m!==SEC_LAST);return SEC_LAST=o[Math.floor(Math.random()*o.length)];}
/* her seat on his knee, from where he sits and which way he faces */
function secLapPos(n){const a=n.a,s=Math.sin(a),c=Math.cos(a),f=0.2,r=0.3;return{x:n.x+s*f+c*r,z:n.z+c*f-s*r,a:a+0.35};}
function mcOfficeSetup(g,n){if(typeof NPC_CHAT!=='undefined'&&!NPC_CHAT.secretary)NPC_CHAT.secretary=SEC_CHAT;
 const mode=secPickMode(),s=makeChar(SEC_DESK.x,SEC_DESK.z-0.72,secLook(),false);Object.assign(s,{kind:'secretary',state:'idle',r:0.28,said:true,a:0,a0:0,seat:true,gset:mode,gtalk:0});s.body=s.look.body;
 g.sec=s;g.secMode=mode;n.gset=mode==='lap'?'mclap':'mc';n.gtalk=0;
 g.solids.push(SEC_DESK);if(mode==='count')g.solids.push(SEC_TABLE);
 if(mode==='desk'){s.y=SEAT_Y+0.06;s.seatK=1;}
 else if(mode==='count'){s.x=SEC_TABLE.x;s.z=SEC_TABLE.z-0.62;s.seat=true;}
 else{n.seatK=1;n.y=0.02;s.seatK=1;Object.assign(s,secLapPos(n));s.a0=s.a;s.y=n.y+0.08;}
 g.npcs.push(s);g.secHello=false;}
function mcOfficeTick(g,dt,n,p){const s=g.sec;if(!s)return;if(n.gtalk>0)n.gtalk-=dt;if(s.gtalk>0)s.gtalk-=dt;
 if(g.secMode==='lap'){n.a=n.a0;Object.assign(s,secLapPos(n));s.a0=s.a;s.y=n.y+0.08;s.vx=s.vz=0;}
 if(!g.secHello&&Math.hypot(p.x-s.x,p.z-s.z)<(g.secMode==='lap'?4.4:3.2)){g.secHello=true;s.gtalk=3;popup(s.x,s.z+0.3,pick(SEC_HELLO[g.secMode]),'#ffb3d1');sfx('blip');}}
/* the front desk by the door and the counting table, with what is on them */
function drawSecretaryDesk(B,g){const D=SEC_DESK,s=g.sec,WD0=hex(0x3a1a10),WD1=hex(0x5a2a18),CR=hex(0xf2ead8),CASH=[1,1,1];
 /* a reception counter: the desk she works at, and a raised ledge on your side with a gold trim */
 B.box(TRS(D.x,0.38,D.z,0,D.w,0.76,D.d),WD0,false,TUV[4]);B.box(TRS(D.x,0.77,D.z,0,D.w+0.08,0.04,D.d+0.08),WD1,false,TUV[4]);
 B.box(TRS(D.x,0.47,D.z+D.d/2+0.06,0,D.w+0.1,0.94,0.12),CR);B.box(TRS(D.x,0.95,D.z+D.d/2+0.02,0,D.w+0.16,0.04,0.26),WD1,false,TUV[4]);
 B.box(TRS(D.x,0.8,D.z+D.d/2+0.125,0,D.w+0.1,0.03,0.01),GOLD);B.box(TRS(D.x,0.25,D.z+D.d/2+0.125,0,D.w+0.1,0.03,0.01),GOLD);
 for(const sd of [-1,1])B.box(TRS(D.x+sd*(D.w/2+0.03),0.47,D.z+D.d/2+0.125,0,0.03,0.92,0.01),GOLD);
 for(const s2 of SIGN_STROKES.M)strokeBox(B,D.x-0.15+s2[0]*0.3,0.36+s2[1]*0.28,D.x-0.15+s2[2]*0.3,0.36+s2[3]*0.28,D.z+D.d/2+0.13,0.035,GOLD);
 /* typewriter, phone, in-tray, nameplate, flowers */
 const top=0.79;B.box(TRS(D.x-0.15,top+0.05,D.z-0.08,0,0.42,0.1,0.3),hex(0x2a2a30));B.box(TRS(D.x-0.15,top+0.11,D.z-0.18,0,0.44,0.05,0.1),hex(0x3a3a44));
 B.box(TRS(D.x-0.15,top+0.19,D.z-0.2,0.0,0.22,0.16,0.01),[0.98,0.98,0.95]);for(let i=0;i<4;i++)B.box(TRS(D.x-0.3+i*0.1,top+0.105,D.z+0.02,0,0.07,0.012,0.05),[0.9,0.9,0.85]);
 B.box(TRS(D.x+0.55,top+0.04,D.z-0.05,0.3,0.12,0.08,0.24),hex(0xff5fa8));B.box(TRS(D.x+0.55,top+0.085,D.z-0.03,0.3,0.07,0.01,0.12),[0.95,0.95,0.95]);
 B.box(TRS(D.x-0.75,top+0.03,D.z-0.05,0,0.3,0.06,0.22),GOLD);for(let i=0;i<3;i++)B.box(TRS(D.x-0.75,top+0.07+i*0.012,D.z-0.05,0.04*i,0.24,0.01,0.18),[0.96,0.95,0.9]);
 B.box(TRS(D.x+0.25,top+0.045,D.z+0.2,0,0.34,0.07,0.04),GOLD);
 B.box(TRS(D.x+0.92,top+0.09,D.z+0.12,0,0.09,0.18,0.09),[0.75,0.88,0.95]);for(let i=0;i<5;i++)B.box(TRS(D.x+0.92+Math.sin(i*1.3)*0.06,top+0.24+(i%2)*0.04,D.z+0.12+Math.cos(i*1.3)*0.06,0,0.07,0.07,0.07),i%2?hex(0xff4f9a):hex(0xffd1e8),true);
 /* her chair behind the desk */
 if(g.secMode==='desk'){const cx=s.x,cz=s.z,CH=hex(0xd8174f);B.box(TRS(cx,0.06,cz,0,0.46,0.05,0.46),DARK);B.box(TRS(cx,0.18,cz,0,0.06,0.22,0.06),GOLD);B.box(TRS(cx,0.33,cz,0,0.5,0.1,0.48),CH);B.box(TRS(cx,0.68,cz-0.24,0,0.48,0.62,0.09),CH);}
 /* the counting table: bricks of cash, a money counter, an adding machine and a stack of gold bars */
 if(g.secMode==='count'){const T=SEC_TABLE,tt=0.82;B.box(TRS(T.x,0.4,T.z,0,T.w,0.8,T.d),hex(0x1a1418),false,TUV[4]);B.box(TRS(T.x,tt,T.z,0,T.w+0.06,0.04,T.d+0.06),GOLD);
  for(let i=0;i<12;i++){const cx=i%3,ly=i/3|0;B.box(TRS(T.x-0.5+cx*0.22,tt+0.045+ly*0.05,T.z+0.12,0.04*(ly%2),0.2,0.05,0.1),CASH,false,TUV[11]);}
  for(let i=0;i<9;i++){const cx=i%3,ly=i/3|0,o=ly%2?0.05:0;B.box(TRS(T.x+0.32+cx*0.17+o,tt+0.05+ly*0.07,T.z+0.12,0,0.15,0.065,0.08),GOLD);}
  B.box(TRS(T.x,tt+0.07,T.z-0.08,0,0.24,0.12,0.2),hex(0x6a6a74));B.box(TRS(T.x,tt+0.14,T.z-0.12,0,0.2,0.03,0.08),hex(0x2a2a2a));
  const fl=(g.T*3)%1;B.box(TRS(T.x,tt+0.15+fl*0.06,T.z-0.02,0,0.12,0.004,0.07),CASH,false,TUV[11]);
  B.box(TRS(T.x-0.42,tt+0.04,T.z-0.12,0.2,0.18,0.06,0.16),hex(0xd8d2c0));B.box(TRS(T.x-0.42,tt+0.09,T.z-0.18,0.2,0.07,0.06,0.005),[0.98,0.98,0.95]);
  if(Math.floor(g.T*1.3)%3===0)B.box(TRS(T.x-0.42,tt+0.075,T.z-0.07,0.2,0.1,0.004,0.04),[0.3,1,0.5],true);}}
/* the briefing close-up: when she is on his knee she stays there while he talks */
const SEC_BRIEF_P={x:0.44,y:-0.22,z:0.16,a:0.95};
function drawBriefSec(B,t){const g=G;if(!g||!g.sec||g.secMode!=='lap'||state!=='brief')return;const s=g.sec,q=Object.create(s);
 Object.assign(q,{x:SEC_BRIEF_P.x,y:SEC_BRIEF_P.y,z:SEC_BRIEF_P.z,a:SEC_BRIEF_P.a,vx:0,vz:0,seatK:1,gtalk:0});PS2C.add(q,'game',1,t,B,'look');}
/* walk up to the desk, or tap/USE McWey, to sit down for the briefing (the carpet trigger in front of the desk still works too) */
function officeTargets(g,t){const D=g.mcDesk;if(!D)return;t.push({k:'mcwey',x:D.x,z:D.z+D.d/2+0.5,r:2.2,lbl:'SIT DOWN WITH McWEY',fn:()=>{if(!g.hubDone&&!fading)g.hubDone=fadeTo(talkMcWey);}});}
