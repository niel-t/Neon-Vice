'use strict';
/* ================= McWEY'S OFFICE: his secretary, and what she is up to when you walk in =================
   Candi Carrera runs the 52nd floor. Every visit she is doing something else (never the same twice running):
   'desk'  behind the reception counter in the middle of the hall, typing, on the phone, doing her nails;
   'count' at the counting table in the loot room, thumbing bills and stacking gold bars;
   'lap'   perched on McWey's knee behind the big desk (and still there in the briefing close-up).
   McWey acts while he talks (models.js gestVec: points, spreads his hands, leans in, wags a finger, counts cash,
   sits back with his hands behind his head, sips his whisky, smokes). officeSetup/officeTick/drawMcOffice/talkMcWey call in here. */
const SEC_MODES=['desk','count','lap'];let SEC_LAST=null;
const SEC_DESK={x:16,z:14.6,w:3.2,d:0.7},SEC_TABLE={x:26,z:7.4,w:1.4,d:0.72};
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
 g.solids.push(SEC_DESK,SEC_TABLE,...OFFICE_SOLIDS);
 if(mode==='desk'){s.y=SEAT_Y+0.06;s.seatK=1;}
 else if(mode==='count'){s.x=SEC_TABLE.x;s.z=SEC_TABLE.z-0.62;s.seat=true;}
 else{n.seatK=1;n.y=0.02;s.seatK=1;Object.assign(s,secLapPos(n));s.a0=s.a;s.y=n.y+0.08;}
 g.npcs.push(s);g.secHello=false;
 g.lights.push({x:26,y:1.8,z:4.8,r:4.2,c:[1.3,1.05,0.55]},{x:26,y:1.6,z:8,r:3.6,c:[1.1,0.9,0.5]},{x:6.2,y:1.6,z:5.6,r:4,c:[0.6,0.4,1.1]});}
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
 'McWEY'.split('').forEach((ch,i)=>{const lx=D.x-0.95+i*0.4,w=ch==='c'?0.2:0.3,h=ch==='c'?0.18:0.3;for(const s2 of SIGN_STROKES[ch])strokeBox(B,lx+s2[0]*w,0.36+s2[1]*h,lx+s2[2]*w,0.36+s2[3]*h,D.z+D.d/2+0.13,0.035,GOLD);});
 /* typewriter, phone, in-tray, nameplate, flowers */
 const top=0.79;B.box(TRS(D.x-0.15,top+0.05,D.z-0.08,0,0.42,0.1,0.3),hex(0x2a2a30));B.box(TRS(D.x-0.15,top+0.11,D.z-0.18,0,0.44,0.05,0.1),hex(0x3a3a44));
 B.box(TRS(D.x-0.15,top+0.19,D.z-0.2,0.0,0.22,0.16,0.01),[0.98,0.98,0.95]);for(let i=0;i<4;i++)B.box(TRS(D.x-0.3+i*0.1,top+0.105,D.z+0.02,0,0.07,0.012,0.05),[0.9,0.9,0.85]);
 B.box(TRS(D.x+0.55,top+0.04,D.z-0.05,0.3,0.12,0.08,0.24),hex(0xff5fa8));B.box(TRS(D.x+0.55,top+0.085,D.z-0.03,0.3,0.07,0.01,0.12),[0.95,0.95,0.95]);
 B.box(TRS(D.x-0.75,top+0.03,D.z-0.05,0,0.3,0.06,0.22),GOLD);for(let i=0;i<3;i++)B.box(TRS(D.x-0.75,top+0.07+i*0.012,D.z-0.05,0.04*i,0.24,0.01,0.18),[0.96,0.95,0.9]);
 B.box(TRS(D.x+0.25,top+0.045,D.z+0.2,0,0.34,0.07,0.04),GOLD);
 B.box(TRS(D.x+0.92,top+0.09,D.z+0.12,0,0.09,0.18,0.09),[0.75,0.88,0.95]);for(let i=0;i<5;i++)B.box(TRS(D.x+0.92+Math.sin(i*1.3)*0.06,top+0.24+(i%2)*0.04,D.z+0.12+Math.cos(i*1.3)*0.06,0,0.07,0.07,0.07),i%2?hex(0xff4f9a):hex(0xffd1e8),true);
 /* her chair behind the desk */
 if(g.secMode==='desk'){const cx=s.x,cz=s.z,CH=hex(0xd8174f);B.box(TRS(cx,0.06,cz,0,0.46,0.05,0.46),DARK);B.box(TRS(cx,0.18,cz,0,0.06,0.22,0.06),GOLD);B.box(TRS(cx,0.33,cz,0,0.5,0.1,0.48),CH);B.box(TRS(cx,0.68,cz-0.24,0,0.48,0.62,0.09),CH);}
 /* the counting table in the loot room: bricks of cash, a money counter, an adding machine and a stack of gold bars */
 {const T=SEC_TABLE,tt=0.82;B.box(TRS(T.x,0.4,T.z,0,T.w,0.8,T.d),hex(0x1a1418),false,TUV[4]);B.box(TRS(T.x,tt,T.z,0,T.w+0.06,0.04,T.d+0.06),GOLD);
  for(let i=0;i<12;i++){const cx=i%3,ly=i/3|0;B.box(TRS(T.x-0.5+cx*0.22,tt+0.045+ly*0.05,T.z+0.12,0.04*(ly%2),0.2,0.05,0.1),CASH,false,TUV[11]);}
  for(let i=0;i<9;i++){const cx=i%3,ly=i/3|0,o=ly%2?0.05:0;B.box(TRS(T.x+0.32+cx*0.17+o,tt+0.05+ly*0.07,T.z+0.12,0,0.15,0.065,0.08),GOLD);}
  B.box(TRS(T.x,tt+0.07,T.z-0.08,0,0.24,0.12,0.2),hex(0x6a6a74));B.box(TRS(T.x,tt+0.14,T.z-0.12,0,0.2,0.03,0.08),hex(0x2a2a2a));
  const fl=g.secMode==='count'?(g.T*3)%1:0;B.box(TRS(T.x,tt+0.15+fl*0.06,T.z-0.02,0,0.12,0.004,0.07),CASH,false,TUV[11]);
  B.box(TRS(T.x-0.42,tt+0.04,T.z-0.12,0.2,0.18,0.06,0.16),hex(0xd8d2c0));B.box(TRS(T.x-0.42,tt+0.09,T.z-0.18,0.2,0.07,0.06,0.005),[0.98,0.98,0.95]);
  if(g.secMode==='count'&&Math.floor(g.T*1.3)%3===0)B.box(TRS(T.x-0.42,tt+0.075,T.z-0.07,0.2,0.1,0.004,0.04),[0.3,1,0.5],true);}}
/* ---- the floor's fixed set (built once into the hub's fixed batch): the city through McWey's glass, the chill room, the loot room ---- */
const OFFICE_SOLIDS=[{x:6.2,z:6.6,w:3.9,d:0.9},{x:6.2,z:5.0,w:1.4,d:0.6},/* chill room: sectional, coffee table */
 {x:24.2,z:4.8,w:1.3,d:0.8},{x:28.6,z:4.8,w:1.3,d:0.8},{x:26.2,z:4.6,w:0.6,d:0.6},{x:28.7,z:7.6,w:1.2,d:1.0},{x:23.8,z:9.1,w:1.2,d:1.0},{x:29.9,z:3.7,w:0.8,d:0.5},{x:22.3,z:5,w:0.4,d:1.3},/* loot room */
 {x:14.2,z:11.6,w:0.5,d:0.5},{x:17.8,z:11.6,w:0.5,d:0.5}];/* palms by McWey's door */
function drawOfficeSet(B,g){const bx=(x,y,z,sx,sy,sz,c,em,ry,uv)=>B.box(TRS(x,y,z,ry||0,sx,sy,sz),c,!!em,uv),h=(i,k)=>hsh(i,k,21);
 const CASH=[1,1,1],CREAM=hex(0xe8dcc0),STEEL=[0.55,0.57,0.62],PINK=[1,0.3,0.75],CYAN=[0.2,0.9,1];
 /* ===== McWEY'S OFFICE: the north wall is glass from the sill up, gold mullions, and Miami at night fifty-two floors down ===== */
 for(let x=11;x<=21;x++)bx(x,1.45,1.86,0.06,2.3,0.06,GOLD);bx(16,2.62,1.86,10.1,0.08,0.1,GOLD);bx(16,0.32,1.86,10.1,0.04,0.12,GOLD);
 for(let x=11.5;x<21;x++){bx(x-0.18,1.6,1.84,0.03,0.9,0.005,[0.35,0.5,0.7],true,0);bx(x+0.1,1.2,1.84,0.02,0.5,0.005,[0.3,0.45,0.65],true,0);}
 bx(16,-0.3,0.6,40,0.6,2.4,[0.18,0.16,0.2]);/* the outside ledge */
 bx(16,-6,-14,70,0.2,28,[0.04,0.04,0.08]);/* the ground far below */
 for(let z=-1.5;z>-28;z-=4.5)bx(16,-5.85,z,70,0.02,0.14,[1,0.6,0.25],true);for(let x=-18;x<52;x+=5)bx(x,-5.85,-14,0.14,0.02,28,[1,0.6,0.25],true);
 /* the bay, a moon road on the water */
 for(let i=0;i<46;i++){const x=-14+(i%23)*2.9+h(i,1)*1.2,z=-3-Math.floor(i/23)*6-h(i,2)*3,w=1.4+h(i,3)*1.2,top=-2.5+h(i,4)*4+(i%7===3?2.5:0)+Math.floor(i/23)*1.5,hh=top+6;
  const c=[0.08+h(i,5)*0.05,0.07+h(i,6)*0.04,0.13+h(i,7)*0.06];bx(x,top-hh/2,z,w,hh,w,c);
  const WIN=[[1,0.85,0.55],[0.6,0.9,1],[1,0.55,0.8]][i%3];for(let r=top-0.5;r>-5.6;r-=0.6)for(let q=-1;q<=1;q++){if(h(i*31+q,Math.floor(r*10))<0.45)continue;bx(x+q*w*0.3,r,z+w/2+0.01,w*0.18,0.26,0.02,WIN,true);}
  if(i%5===1)bx(x,top+0.05,z+w/2+0.02,w*0.9,0.1,0.03,i%10===1?PINK:CYAN,true);if(i%9===4){bx(x,top+0.6,z,0.05,1.2,0.05,[0.7,0.7,0.75]);bx(x,top+1.22,z,0.1,0.1,0.1,[1,0.2,0.2],true);}}
 /* a rug and two club chairs on your side of his desk, a globe bar in the corner */
 bx(16,0.012,7.7,6.4,0.02,3.4,[1,1,1],false,0,TUV[19]);
 /* ===== THE CHILL ROOM: a sectional facing the aquarium wall, a glass coffee table, champagne, neon along the back wall ===== */
 bx(6.2,0.012,5.6,6.4,0.02,4.4,[1,1,1],false,0,TUV[19]);
 bx(6.2,0.22,6.55,3.9,0.42,0.8,CREAM);bx(6.2,0.6,6.95,3.9,0.5,0.2,CREAM.map(v=>v*0.88));for(const sx of [-1,1])bx(6.2+sx*1.9,0.4,6.6,0.2,0.36,0.9,CREAM.map(v=>v*0.92));
 for(let i=0;i<4;i++)bx(4.85+i*0.9,0.46,6.5,0.82,0.08,0.66,CREAM.map(v=>v*1.04));for(const cx of [4.6,7.8])bx(cx,0.62,6.82,0.36,0.3,0.1,i0(cx)?PINK:CYAN);
 bx(6.2,0.38,5.0,1.4,0.03,0.6,[0.55,0.8,0.9],true);for(const [ox,oz] of [[-0.62,-0.24],[0.62,-0.24],[-0.62,0.24],[0.62,0.24]])bx(6.2+ox,0.19,5.0+oz,0.04,0.38,0.04,GOLD);
 bx(6.05,0.55,4.95,0.09,0.3,0.09,hex(0x1a4a2a));bx(6.05,0.74,4.95,0.04,0.1,0.04,GOLD);for(const gx of [6.4,6.55])bx(gx,0.46,5.08,0.05,0.13,0.05,[0.85,0.9,0.95]);bx(5.7,0.42,4.9,0.26,0.06,0.26,GOLD);
 bx(6.2,1.05,9.92,7.4,0.04,0.03,PINK,true);bx(6.2,0.95,9.92,7.4,0.04,0.03,CYAN,true);
 /* ===== McWEY sign beside his door, and gold planters with palms either side ===== */
 'McWEY'.split('').forEach((ch,i)=>{const lx=10.6+i*0.55,w=ch==='c'?0.28:0.42,hh=ch==='c'?0.26:0.42;for(const s of SIGN_STROKES[ch])strokeBox(B,lx+s[0]*w,0.45+s[1]*hh,lx+s[2]*w,0.45+s[3]*hh,11.04,0.05,GOLD);});
 for(const px of [14.2,17.8]){bx(px,0.25,11.6,0.5,0.5,0.5,GOLD);drawPalm(B,px,11.6,false,px);}
 /* ===== THE LOOT ROOM: through a vault door from his office. Gold in pyramids, pallets of cash, a jewel case, a chest of coins, sacks, paintings ===== */
 bx(26,0.008,6,8.6,0.012,7.8,[0.28,0.2,0.06]);/* a gold-brown floor */
 for(const [px,pz] of [[24.2,4.8],[28.6,4.8]]){for(let l=0;l<5;l++){const n=5-l;for(let i=0;i<n;i++)for(let k=0;k<3;k++)bx(px-(n-1)*0.13+i*0.26,0.05+l*0.09,pz-0.24+k*0.24,0.24,0.085,0.12+0.06*(k%2),GOLD);}}
 bx(26.2,0.45,4.6,0.5,0.9,0.5,[0.92,0.9,0.88],false,0,TUV[41]);bx(26.2,0.92,4.6,0.56,0.04,0.56,GOLD);bx(26.2,1.15,4.6,0.5,0.42,0.5,[0.5,0.85,1.1],true);bx(26.2,1.37,4.6,0.54,0.03,0.54,GOLD);
 for(let i=0;i<6;i++)bx(26.05+(i%3)*0.15,1.0,4.5+Math.floor(i/3)*0.2,0.06,0.06,0.06,[1.4,1.4,1.5],true,0.785);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;bx(26.2+Math.cos(a)*0.12,0.97,4.62+Math.sin(a)*0.1,0.04,0.02,0.04,GOLD);}
 for(const [cx,cz] of [[28.7,7.6],[23.8,9.1]]){bx(cx,0.06,cz,1.2,0.12,1.0,hex(0x8a6a40),false,0,TUV[4]);for(let l=0;l<7;l++)for(let i=0;i<12;i++)bx(cx-0.45+(i%4)*0.3,0.18+l*0.13,cz-0.33+Math.floor(i/4)*0.33,0.28,0.12,0.3,CASH,false,0,TUV[11]);}
 bx(29.9,0.22,3.7,0.8,0.44,0.5,hex(0x5a3218));bx(29.9,0.46,3.55,0.82,0.06,0.3,GOLD);bx(29.9,0.6,3.42,0.82,0.36,0.08,hex(0x5a3218),false,0.0);for(let i=0;i<14;i++)bx(29.6+h(i,40)*0.6,0.47+h(i,41)*0.06,3.6+h(i,42)*0.22,0.07,0.02,0.07,GOLD,false,i);
 for(const [sx,sz] of [[27.3,9.3],[25.1,9.5],[22.7,7.1]]){bx(sx,0.2,sz,0.36,0.4,0.36,hex(0xb8a070));bx(sx,0.43,sz,0.14,0.08,0.14,hex(0x8a7448));bx(sx,0.22,sz+0.185,0.12,0.16,0.01,[0.15,0.45,0.15]);}
 for(const [pz,c] of [[5.6,[0.9,0.4,0.2]],[8.2,[0.2,0.5,0.8]]]){bx(30.82,0.5,pz,0.06,0.9,1.1,GOLD,false,0);bx(30.78,0.5,pz,0.03,0.78,0.98,c);bx(30.77,0.55,pz-0.15,0.02,0.3,0.4,c.map(v=>Math.min(1,v+0.4)));}
 /* the vault door, swung open flat against the wall beside the doorway: a steel disc, a ring of gold bolts, a spoked wheel */
 for(let k=0;k<8;k++)B.box(A.mul(A.T(22.3,0.66,5),A.mul(A.RX(k*Math.PI/8),A.S(0.3,1.26,0.52))),STEEL);
 for(let k=0;k<12;k++){const a=k/12*Math.PI*2;bx(22.47,0.66+Math.sin(a)*0.5,5+Math.cos(a)*0.5,0.07,0.07,0.07,GOLD);}bx(22.49,0.66,5,0.06,0.16,0.16,GOLD);
 for(let k=0;k<3;k++)B.box(A.mul(A.T(22.53,0.66,5),A.mul(A.RX(k*Math.PI/3),A.S(0.04,0.62,0.04))),GOLD);}
const i0=x=>Math.round(x)%2===0;
/* the briefing close-up: when she is on his knee she stays there while he talks */
const SEC_BRIEF_P={x:0.44,y:-0.22,z:0.16,a:0.95};
function drawBriefSec(B,t){const g=G;if(!g||!g.sec||g.secMode!=='lap'||state!=='brief')return;const s=g.sec,q=Object.create(s);
 Object.assign(q,{x:SEC_BRIEF_P.x,y:SEC_BRIEF_P.y,z:SEC_BRIEF_P.z,a:SEC_BRIEF_P.a,vx:0,vz:0,seatK:1,gtalk:0});PS2C.add(q,'game',1,t,B,'look');}
/* walk up to the desk, or tap/USE McWey, to sit down for the briefing (the carpet trigger in front of the desk still works too) */
function officeTargets(g,t){const D=g.mcDesk;if(!D)return;t.push({k:'mcwey',x:D.x,z:D.z+D.d/2+0.5,r:2.2,lbl:'SIT DOWN WITH McWEY',fn:()=>{if(!g.hubDone&&!fading)g.hubDone=fadeTo(talkMcWey);}});}
