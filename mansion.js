'use strict';
/* VILLA SOLANA, STAR ISLAND: the fourth and last home, sold by Sunshine Realty at the mall once Lex is dealt with.
   A grand 80s Miami estate in three hubs (each its own map, like the mall's two levels; the stairs fade you between them):
     home3   the ground floor and the grounds. South to north: the gate in the estate wall, the drive round the front fountain,
             the front steps and the double doors into a black-and-white marble foyer with two curved staircases up to a landing,
             the great room (west, with the stairs down to the basement), the dining room and kitchen (east), the gallery,
             and out the back the terrace and the infinity pool running into the bay. The tennis court is fenced off on the east lawn.
     home3u  upstairs: the master bedroom (the bed grows with the girls), the master bath with a sunken tub, the walk-in closet,
             the guest suite and a lounge, a balcony over the pool, and the gallery round the open well over the foyer.
             Through the well and past the balcony rail you look straight down onto the ground floor, 3.4 m below.
     home3b  the basement: THE VELVET VAULT, your own club (a stage with six dancers you can hire to live with you, a bar, booths,
             a dance floor under a mirror ball), a private three-lane shooting range, and the cellar hall with your gun locker.
   Every hub runs the shared home code with g.home 3 (phone, bed, locker, seats, side jobs); g.mfl says which floor (0, 1, -1).
   The hired girls (up to MV_GIRLS) are kept in p.furn[3].crew by name and look the same every time (their look is seeded by name).
   Map cell (x,z) is world (x+1,z+1); everything below is in world coordinates.
   Loaded after upstairs.js, before the main inline script: nothing here touches main-script globals or WebGL at load time. */
const MV_PRICE=250000,MV_GIRLS=8,MV_HIRE=5000,MV_LOW=-3.4;
const MV_NAMES=['CANDY','VELVET','SAPPHIRE','RAVEN','PEACHES','GINGER','SCARLET','MISTY','DOLLY','ECHO','SUNNY','LUSH','AMBER','VIXEN','HONEY','STORM'];
const MV_HOME={name:'VILLA SOLANA · STAR ISLAND',price:MV_PRICE,needs:'respect',lockTxt:'AFTER LEX IS DEALT WITH',lockMsg:'The owner only sells to someone with a reputation. Deal with Lex first.',
 desc:'The last word. A walled estate on Star Island: marble foyer, twin staircases, an infinity pool on the bay, a tennis court, and a club and shooting range in the basement.'};
/* ---------------- the maps ---------------- */
const MV_G=[
 "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "RRRRRRRRRRRwwwwwwwwwwwwwwwwRRRRRRRFFFFFFFFFFFFFF",
 "Z..........wwwwwwwwwwwwwwww.......F____________F",
 "Z..........wwwwwwwwwwwwwwww.......F____________F",
 "Z..........wwwwwwwwwwwwwwww.......F____________F",
 "Z..........wwwwwwwwwwwwwwww.......F____________F",
 "Z.................................F____________F",
 "Z........m........................F____________F",
 "Z............m..........m....m....F____________F",
 "Z.................................F____________F",
 "Z.................................F____________F",
 "Z,,,#WWW..WWW####....###WWW#..WW#,F____________F",
 "Z,,,#.........#........#........#,F____________F",
 "Z,,,#.o............m............#,F____________F",
 "Z,,,#...........................#,F____________F",
 "Z,,,#.........#........#........#,F____________F",
 "Z,,,#.........#YYYYYYYY#...m....#,F____________F",
 "Z,,,#.....m...#YYYYYYYY#........#,F____________F",
 "Z,,,#.........#YY....YY#........#,F____________F",
 "Z,,,#.........#YY....YY#........#,F____________F",
 "Z,,,#....t....#YY....YY####..####,FFFFFF__FFFFFF",
 "Z,,,#.........#YY....YY#........#,,,,,,,,,,,,,,Z",
 "Z,,,#..m......#YY....YY#........#,,,,,,,,,,,,,,Z",
 "Z,,,#.........#YY....YY#........#,,,,,,,,,,,,,,Z",
 "Z,,,#.........#YY....YY#........#,,,,,,,,,,,,,,Z",
 "Z,,,#YYY........................#,,,,,,,,,,,,,,Z",
 "Z,,,#YYY........................#,,,,,,,,,,,,,,Z",
 "Z,,,#YYY......#...P....#........#,,,,,,,,,,,,,,Z",
 "Z,,,#WW#WW#WW#WW#W..WW#WW#WW#WW##,,,,,,,,,,,,,,Z",
 "Z,,,,,,,,,,,,,..g....g..,,,,,,,,,,,,,,,,,,,,,,,Z",
 "Zvvvvvvvvvvvv,..........,vvvvvvvvvvvvvvvvvvvvvvZ",
 "Z,,,,,,,,,,,,,,========,,,,,,,,,,,,,,,,,,,,,,,,Z",
 "Z,,,,,,,,,,,,,==========,,,,,,,,,,,,,,,,,,,,,,,Z",
 "Z,,,,,,,,,,,,====,,,,====,,,,,,,,,,,,,,,,,,,,,,Z",
 "Z,,,,,,,,,,,,===,,,,,,===,,,,,,,,,,,,,,,,,,,,,,Z",
 "Z,,,,,,,,,,,====,,,,,,====,,,,,,,,,,,,,,,,,,,,,Z",
 "Z,,,,,,,,,,,,===,====,===,,,,,,,,,,,,,,,,,,,,,,Z",
 "Z,,,,,,,,,,,,============,,,,,,,,,,,,,,,,,,,,,,Z",
 "Z,,,,,,,,,,,,,==========,,,,,,,,,,,,,,,,,,,,,,,Z",
 "Z,,,,,,,,,,,,,,==g==g==,,,,,,,,,,,,,,,,,,,,,,,,Z",
 "Z,,,,,,,,,,,,,,,,====,,,,,,,,,,,,,,,,,,,,,,,,,,Z",
 "ZZZZZZZZZZZZZZZZZ====ZZZZZZZZZZZZZZZZZZZZZZZZZZZ"];
const MV_U=[
 "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
 "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
 "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
 "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
 "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
 "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
 "yyyyRRRRRRRRRRRRRRRRRRRRRRRRRRRRRyyyyyyyyyyyyyyy",
 "yyyyR...........................Ryyyyyyyyyyyyyyy",
 "yyyyR.............m.............Ryyyyyyyyyyyyyyy",
 "yyyyR...........................Ryyyyyyyyyyyyyyy",
 "yyyy#WWWWWW#WWWWW....WWWWW#WW#WW#yyyyyyyyyyyyyyy",
 "yyyy#......#..............#.....#yyyyyyyyyyyyyyy",
 "yyyy#......#..............#.....#yyyyyyyyyyyyyyy",
 "yyyy#......#...m......m...#.....#yyyyyyyyyyyyyyy",
 "yyyy#......#..............#.....#yyyyyyyyyyyyyyy",
 "yyyy#......#..............D.....#yyyyyyyyyyyyyyy",
 "yyyy#......#..............#.....#yyyyyyyyyyyyyyy",
 "yyyy#......D..............#.....#yyyyyyyyyyyyyyy",
 "yyyy#......#..............#.....#yyyyyyyyyyyyyyy",
 "yyyy#############....############yyyyyyyyyyyyyyy",
 "yyyy#.........D...P....D........#yyyyyyyyyyyyyyy",
 "yyyy#.........#........#........#yyyyyyyyyyyyyyy",
 "yyyy#.........#YYOOOOYY#........#yyyyyyyyyyyyyyy",
 "yyyy#.........#YYOOOOYY#........#yyyyyyyyyyyyyyy",
 "yyyy#.........#YYOOOOYY#....o...#yyyyyyyyyyyyyyy",
 "yyyy#.........#YYOOOOYY#........#yyyyyyyyyyyyyyy",
 "yyyy#.........#YYOOOOYY#........#yyyyyyyyyyyyyyy",
 "yyyy#WW#WW#WW#WW#WW#WW#WW#WW#WW##yyyyyyyyyyyyyyy",
 "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"];
const MV_B=[
 "##################################",
 "#....................#...........#",
 "#....................#...........#",
 "#....................#...........#",
 "#....................#...........#",
 "#....................#...........#",
 "#....................#...........#",
 "#....................#...........#",
 "#....................#...........#",
 "#....................#...........#",
 "#..m.............m...#...........#",
 "#....................#...........#",
 "#....................#...........#",
 "#....................#...........#",
 "#....................#...........#",
 "#...m...........m....#...........#",
 "#....................#...........#",
 "#....................#...........#",
 "##########..###############D######",
 "#................................#",
 "#.........P......................#",
 "#......YYYYYYYY..................#",
 "#......YYYYYYYY..................#",
 "##################################"];
const MV_SLOTLEG=f=>{const L={};for(const c of '.otgmnx')L[c]={f};return L;};
/* the ground floor's floors (world cells): terrace terrazzo, foyer checkerboard marble, dining parquet, kitchen tile, the drive, the lawn, the court
   (built with its own copy of the map: the world check re-evaluates floorFn's source on its own, with no globals) */
const mvFloorG=new Function('x','z','const M='+JSON.stringify(MV_G)+';'+"const X=x-1,Z=z-1,ch=(M[Z]||'')[X];if(ch===',')return 11;if(ch==='=')return 37;if(ch==='_')return X>=34&&X<=47&&Z>=3&&Z<=22?61:3;if(Z<=12)return 61;if(Z>=31)return 63;if(X>=15&&X<=22&&Z>=18)return (X+Z)%2?43:63;if(X>=24&&Z<=21)return 4;if(X>=24)return 14;return 63;");
function mvFloorU(x,z){const X=x-1,Z=z-1;if(Z<=12)return 61;if(Z<=21)return X<=10?43:X>=27?4:63;return X<=13?29:X>=24?4:63;}
function mvFloorB(x,z){const X=x-1,Z=z-1;if(Z>=19)return 4;if(X>=22)return 61;return 43;}
const MANSION_HUBS={
 home3:{name:'VILLA SOLANA',hub:'foot',homeT:3,mfl:0,wall:45,floor:63,amb:[0.38,0.34,0.37],lc:[0.62,0.54,0.52],sofa:0xffffff,track:'c_palms',where:'STAR ISLAND · VILLA SOLANA',obj:'FURNISH THE PLACE · THEN HEAD OUT',grime:0.06,
  floorFn:mvFloorG,
  legend:Object.assign(MV_SLOTLEG(63),{'~':{w:39,h:0.02,top:39,water:1},'w':{w:12,h:0.02,top:12,water:1},'R':{w:43,h:0.1,top:43},'F':{w:34,h:0.06,top:34},'Z':{w:62,h:1.15,top:41},
   'v':{w:24,h:0.55,top:11},'W':{w:45,h:0.42},'Y':{w:63,h:0.06,top:63},',':{f:11},'=':{f:37},'_':{f:12}}),
  map:MV_G},
 home3u:{name:'VILLA SOLANA · UPSTAIRS',hub:'foot',homeT:3,mfl:1,wall:45,floor:63,amb:[0.38,0.34,0.38],lc:[0.62,0.54,0.54],sofa:0xffffff,track:'c_tide',where:'STAR ISLAND · VILLA SOLANA · UPSTAIRS',obj:'THE MASTER SUITE',grime:0.05,
  floorFn:mvFloorU,
  legend:Object.assign(MV_SLOTLEG(63),{'~':{w:39,h:0.02,top:39,water:1},'y':{w:42,h:0.02,top:42},'O':{w:42,h:0.02,top:42},'Y':{w:42,h:0.02,top:42},'R':{w:43,h:0.1,top:43},'W':{w:45,h:0.42}}),
  map:MV_U},
 home3b:{name:'THE VELVET VAULT',hub:'foot',homeT:3,mfl:-1,wall:19,floor:43,amb:[0.58,0.44,0.52],lc:[0.78,0.54,0.62],sofa:0xb0102a,track:'c_palms',where:'VILLA SOLANA · BASEMENT',obj:'THE CLUB · THE RANGE',grime:0.03,
  floorFn:mvFloorB,
  legend:Object.assign(MV_SLOTLEG(43),{'Y':{w:43,h:0.06,top:43}}),
  map:MV_B}};
/* where each floor's stairs are (world): the targets you press, and where you come out */
const MV_STAIRS={
 0:[{to:1,x:17.0,z:28.6,lbl:'STAIRS · UP TO THE MASTER SUITE'},{to:1,x:23.0,z:28.6,lbl:'STAIRS · UP TO THE MASTER SUITE'},{to:-1,x:7.5,z:27.4,lbl:'STAIRS · DOWN TO THE CLUB & RANGE'}],
 1:[{to:0,x:17.0,z:25.4,lbl:'STAIRS · DOWN TO THE FOYER'},{to:0,x:23.0,z:25.4,lbl:'STAIRS · DOWN TO THE FOYER'}],
 '-1':[{to:0,x:12.0,z:21.5,lbl:'STAIRS · UP TO THE HOUSE'}]};
const MV_ARRIVE={'1>0':{x:17.0,z:29.2,a:0},'-1>0':{x:7.5,z:26.6,a:Math.PI},'0>1':{x:19.5,z:24.6,a:Math.PI},'0>-1':{x:12.0,z:21.0,a:Math.PI}};
const MV_HUBNAME={0:'home3',1:'home3u','-1':'home3b'};
let MV_FROM=null;
/* ---------------- small helpers ---------------- */
function mvCrew(){const f=furnAt(3);if(!Array.isArray(f.crew))f.crew=[];return f.crew;}
function mvSeed(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h||1;}
/* run fn with Math.random replaced by a seeded generator, so a girl's look comes out the same every time */
function mvSeeded(seed,fn){const R=Math.random;let s=seed>>>0;Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};try{return fn();}finally{Math.random=R;}}
function mvGirlLook(name,i){return mvSeeded(mvSeed(name),()=>{const P=dancerProf(i);return{P,L:dancerLook(i+(Math.random()*5|0),0,P)};});}
function mvChar(g,kind,x,z,look,a){const n=makeChar(x,z,look,false);n.kind=kind;n.state='idle';n.a=n.a0=a||0;n.r=0.3;n.body=look.body;n.said=false;g.npcs.push(n);return n;}
function mvSolid(g,x0,z0,x1,z1){if(g._mvDefer){g._mvDefer.push([x0,z0,x1,z1]);return;}for(let z=Math.floor(z0);z<Math.ceil(z1);z++)for(let x=Math.floor(x0);x<Math.ceil(x1);x++)if(x>0&&z>0&&x<g.W-1&&z<g.H-1)g.solid[z*g.W+x]=1;}
const mvLooks={
 butler:()=>({skin:hex(0xe8c4a0),jacket:hex(0x111116),shirt:hex(0xffffff),tie:hex(0x111116),pants:hex(0x111116),shoes:hex(0x08080a),hs:'slick',hair:hex(0xd8d8dc),bw:0.98,bd:0.96,bh:1.04,body:'normal'}),
 rosa:()=>({fem:true,calm:1,sleeves:true,pads:true,heels:true,skirt:0.7,skin:hex(0xc89a6a),jacket:hex(0x6a0820),shirt:hex(0xffd36b),pants:hex(0xc89a6a),shoes:hex(0x111111),hs:'big',hair:hex(0x101010),medallion:true,chain:true,bw:0.95,bd:0.95,bh:1.0}),
 barman:()=>({skin:hex(0x8a5a3a),jacket:hex(0xffffff),shirt:hex(0x111116),tie:hex(0xb0102a),pants:hex(0x111116),shoes:hex(0x08080a),hs:'buzz',hair:hex(0x101010),bw:1.02,bd:1.0,bh:1.02,body:'normal'}),
 dj:()=>({skin:hex(0xf0c8a0),jacket:hex(0x2de2e6),shirt:hex(0xff2d95),pants:hex(0x1a1a22),shoes:hex(0xffffff),hs:'big',hair:hex(0xffd36b),shades:true,chain:true,bw:0.98,bd:0.96,bh:1.0,body:'normal'}),
 pro:()=>({skin:hex(0xd9a37c),jacket:hex(0xffffff),shirt:hex(0xffffff),pants:hex(0xffffff),shoes:hex(0xffffff),hs:'normal',hair:hex(0x6a3a1a),tee:true,bw:1.0,bd:0.98,bh:1.04,body:'normal'})};
const MV_LINES={butler:["Welcome home, sir. The pool has been skimmed and the champagne is cold.","Mr. McWey telephoned. I told him you were in the shower. You were not.","The tennis pro asks whether you intend to play, or only to own a court.","Shall I have the fountain turned up? Guests like it loud.","I served three owners in this house. You are by far the most... energetic."],
 rosa:["Mama Rosa runs the Vault, honey. You want a girl to move in, you talk to me.","Every girl on that stage is a professional. Treat her like one.","Five grand and she's yours, room and board. The house is big enough.","The music's loud so the neighbours don't hear the range. Clever, no?"],
 mbar:["What'll it be, boss? It's all on the house. It's your house.","Rosa says the new girl is a natural. I say tip her anyway.","Don't shoot the range and drink at the same time. House rule."],
 mdj:["This one goes out to the man who owns the building!","I've got Nine's whole album. Twice.","Turn it up? Boss, it IS up."],
 pro:["Nice court. Shame about your backhand.","I taught a Spanish prince once. He cheated too.","Swing through the ball, not at it."]};
/* ---------------- setup: called from homeSetup for g.home 3 ---------------- */
function mansionSetup(g){const fl=g.def.mfl,W=g.W,H=g.H;g.mfl=fl;g.mansion={fl,gate:0,rally:{t:0,dir:1,n:0},T:0};
 /* furniture is marked solid only after buildStatic, or the grid would draw it as walls */
 g._mvDefer=[];if(fl===0)mvGroundSetup(g);else if(fl===1)mvUpSetup(g);else mvBaseSetup(g);
 buildStatic(g);const def=g._mvDefer;g._mvDefer=null;for(const q of def)mvSolid(g,...q);
 const p=g.player,k=MV_FROM!==null?MV_FROM+'>'+fl:null,A=k&&MV_ARRIVE[k];MV_FROM=null;
 if(A&&p){p.x=A.x;p.z=A.z;p.a=A.a;p.vx=p.vz=0;g.cam.x=p.x;g.cam.z=p.z-1;}
 const st=MV_STAIRS[fl];if(fl!==0&&st)g.car={x:st[0].x,z:st[0].z};}
function mvGroundSetup(g){const W=g.W,H=g.H;
 /* the loader's padding ring: the bay along the top, lawn down the sides, the road along the bottom */
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){if(z>0&&x>0&&x<W-1&&z<H-1)continue;const i=z*W+x,sea=z<=3,road=z===H-1;g.wh[i]=sea?0.02:0.03;g.wallT[i]=g.topT[i]=sea?39:road?7:11;g.glow[i]=sea?2:0;}
 /* the stairwell down to the basement in the great room's corner: its cells drop away into the dark */
 for(let z=28;z<=30;z++)for(let x=6;x<=8;x++){const i=z*W+x;g.wh[i]=-2.2;g.wallT[i]=g.topT[i]=43;}
 /* round things the grid can't hold: the jacuzzi, the front fountain; the furniture that blocks */
 g.solids=g.solids||[];
 mvSolid(g,29.4,5.4,31.6,7.6);mvSolid(g,18.2,37.0,21.8,40.0);
 mvSolid(g,6.05,19.2,6.6,23.8);       /* the TV wall */
 mvSolid(g,8.6,20.3,12.4,22.6);       /* the sectional and the glass table */
 mvSolid(g,12.4,15.05,14.0,17.0);     /* the bar */
 mvSolid(g,26.6,17.4,31.4,19.6);      /* the dining table */
 mvSolid(g,26.4,26.6,30.6,28.0);mvSolid(g,25.05,24.05,33.0,24.9);   /* the island, the counters */
 mvSolid(g,18.4,15.4,21.6,16.6);      /* the gallery statue */
 mvSolid(g,9.4,27.0,14.0,27.6);       /* the shark tank */
 mvSolid(g,19.6,25.85,20.4,26.55);    /* the globe on its plinth */
 /* the car out front, and the way out: walk back out of the front door to it */
 const c=g.hcar={x:20.0,z:34.7,a:0,spin:0};g.solids.push({x:c.x,z:c.z,w:2.35,d:1.05});g.trigs.push({x:20.0,z:33.55,t:'leave'});g.car={x:c.x,z:c.z};
 const L=(x,z,r,c,y)=>g.lights.push({x,z,r,c,y:y||2.1});
 L(20,25,7,[1.0,0.86,0.7],2.6);L(20,17,6,[0.95,0.8,0.7]);L(10,18,6,[0.9,0.74,0.6]);L(10,26,6,[0.85,0.66,0.6]);L(29,18,6,[0.95,0.78,0.55]);L(29,27,6,[0.85,0.85,0.9]);
 L(20,7,9,[0.35,0.9,1.15],0.6);L(13,10,5,[1.2,0.35,0.8],0.9);L(27,10,5,[1.2,0.35,0.8],0.9);L(30.5,6.5,4,[0.4,1.0,1.2],0.8);L(6,8,5,[1.0,0.6,0.35],1.4);
 L(20,38.5,6,[0.5,0.9,1.2],1.2);L(20,33,5,[1.1,0.75,0.45],2.4);L(17.6,44,4,[1.2,0.8,0.4],1.6);L(22.4,44,4,[1.2,0.8,0.4],1.6);L(41,27.5,6,[0.85,0.9,1.1],2.4);L(11.7,26.6,4,[0.3,0.75,1.2],1.2);L(41.5,13.5,8,[0.75,0.85,0.95],2.4);
 /* the household: the butler in the foyer, two guards at the gate, the tennis pro and his partner rallying on the court */
 mvChar(g,'butler',21.6,24.8,mvLooks.butler(),0);
 for(const x of [16.6,23.4]){const n=mvChar(g,'hguard',x,44.1,NPCLOOK.guard(),0);n.a=n.a0=x<20?Math.PI*0.25:-Math.PI*0.25;}
 g.mansion.pro=mvChar(g,'pro',41.5,6.6,mvLooks.pro(),0);g.mansion.pro2=mvChar(g,'pro',41.5,20.4,Object.assign(NPCLOOK.guest(),{shirt:hex(0xffffff),jacket:hex(0xffffff)}),Math.PI);
 g.obj='FURNISH THE PLACE · THEN HEAD OUT';}
function mvUpSetup(g){const W=g.W,H=g.H;g.lowGround=1;
 /* the floor drops away past the balcony rail and down the stairwell: those cells sit 3.4 m down, wearing the ground floor's surfaces
    (the bay, the pool, the terrace, the lawn, the foyer's marble), so you look straight down onto the house below */
 const GD=MANSION_HUBS.home3;
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){const i=z*W+x,X=x-1,Z=z-1,ch=(MV_U[Z]||'')[X];const pad=z===0||x===0||x===W-1||z===H-1;
  if(!pad&&!'yOY~'.includes(ch||' '))continue;const gc=(MV_G[Z]||'')[X]||(Z<3?'~':',');let t=42,gl=0;
  if(gc==='~'){t=39;gl=2;}else if(gc==='w'){t=12;gl=2;}else if(gc==='R'||gc==='F')t=43;else if(gc==='Z')t=41;else if(gc==='v')t=24;else if(gc==='#'||gc==='W')t=33;else t=GD.floorFn(x,z)||63;
  g.solid[i]=1;g.wh[i]=MV_LOW;g.wallT[i]=t;g.topT[i]=t;g.glow[i]=gl;}
 const L=(x,z,r,c,y)=>g.lights.push({x,z,r,c,y:y||2.1});
 L(19.5,18,7,[1.0,0.8,0.7]);L(8.5,18,5,[0.7,0.85,0.95]);L(29,18,5,[0.95,0.8,0.6]);L(9.5,26,6,[0.95,0.7,0.65]);L(28,26,6,[0.9,0.75,0.55]);L(19.5,27,6,[1.0,0.86,0.7],2.6);L(19.5,11,7,[0.5,0.8,1.1],1.2);
 mvSolid(g,23.6,15.2,26.0,16.6);      /* the dresser by the bed */
 mvSolid(g,6.6,15.6,10.6,18.6);       /* the sunken tub */
 mvSolid(g,6.05,25.1,8.4,27.6);       /* the guest bed */
 mvSolid(g,28.0,27.2,31.0,28.4);      /* the desk */
 mvSolid(g,18.0,17.3,21.0,20.3);      /* the round bed in the middle of the room */
 g.obj='THE MASTER SUITE · TAKE THE STAIRS DOWN TO GO OUT';}
/* the basement: the club's stage and poles, the bar, booths, the dance floor; the range; the cellar hall */
const MV_POLES=[7.0,8.9,10.8,12.7,14.6,16.5].map(x=>({x,z:3.75}));
const MV_LANES=[25.5,28.5,31.5],MV_LANEZ=[6.2,5.0,4.2];
function mvBaseSetup(g){const W=g.W,H=g.H;
 mvSolid(g,6.0,2.0,18.0,5.6);         /* the stage */
 mvSolid(g,3.0,7.5,4.0,14.5);         /* the bar */
 for(const z of [8.0,11.5,15.0])mvSolid(g,19.8,z-1.2,21.0,z+1.2);   /* the booths */
 mvSolid(g,23.0,14.2,33.0,14.6);      /* the shooting bench */
 mvSolid(g,2.05,16.6,8.0,17.95);      /* the lounge sofa */
 g.disco={x:11.5,z:10.5};
 const L=(x,z,r,c,y)=>g.lights.push({x,z,r,c,y:y||2.2});
 L(11.5,4,6,[1.6,0.15,0.4]);L(11.5,10.5,6,[1.1,0.3,1.0]);L(3,11,5,[1.2,0.7,0.35]);L(20,11.5,5,[1.3,0.1,0.25]);L(5,16.5,5,[0.9,0.3,0.7]);L(14,16.5,4,[1.2,0.8,0.5]);
 L(28.5,9,7,[0.95,1.0,1.1],2.5);L(28.5,4.5,5,[1.2,0.25,0.25],1.8);L(28.5,16,5,[0.9,0.95,1.05]);L(12,21,6,[1.0,0.75,0.5]);L(26,21.5,6,[0.95,0.7,0.45]);
 /* the club: six girls on the stage (the ones you haven't hired yet), Mama Rosa who does the hiring, the barman, a few regulars */
 const crew=mvCrew(),names=MV_NAMES.filter(n=>!crew.some(q=>q.n===n));g.mansion.dancers=[];
 MV_POLES.forEach((q,i)=>{const nm=names[i];if(!nm)return;const {P,L:lk}=mvGirlLook(nm,i),d=makeChar(q.x,q.z,lk,false);
  Object.assign(d,{prof:P,kind:'sdancer',pole:q,y:0.36,tips:0,stage:0,boost:0,ph:i*2.1,fit:i,dname:nm,r:0.25,move:CLUB_MOVES[i%CLUB_MOVES.length],mt:0,md:rnd(4,7),moveE:1,sa:i*2.1,a:0});
  g.npcs.push(d);g.mansion.dancers.push(d);});
 g.mansion.rosa=mvChar(g,'rosa',14.6,16.4,mvLooks.rosa(),0);
 mvChar(g,'mbar',2.45,11.0,mvLooks.barman(),Math.PI/2);
 for(const [x,z] of [[8.2,7.0],[11.0,7.2],[14.8,7.0]]){const n=mvChar(g,'patron',x,z,Object.assign(NPCLOOK.guest(),{calm:1}),Math.PI);n.a=n.a0=Math.atan2(11.5-x,3.75-z);}
 /* the range: three lanes north, the firing line between the bench and the back wall */
 g.range={name:'PRIVATE RANGE',zone:{x0:23.05,x1:32.95,z0:14.85,z1:17.4},lanes:MV_LANES.map((x,i)=>({x,z:MV_LANEZ[i],base:x,down:0,t:0,flash:0})),on:false,loan:null,prev:null,list:[],i:0,rl:0,fired:0,hits:0,pts:0,best:0,last:null,lastAmmo:0};
 mvSolid(g,33.05,21.05,33.95,21.95);   /* the gun locker */
 mvSolid(g,2.1,21.1,6.9,21.95);       /* the cash in the counting room */
 g.obj='THE CLUB · THE RANGE · TAKE THE STAIRS UP TO GO OUT';}
/* furniture, guards, pets and girls (homeExtras for the mansion): safe to call again after buying something */
function mansionExtras(g){const f=homeFurn(),S=g.slots,fl=g.mfl,sp=g.spawned;g.fixK=-1;
 if(fl===0){
  if(f.guards&&!sp.guards){sp.guards=1;(g.spots.g||[]).forEach(q=>{const n=mvChar(g,'bguard',q.x,q.z,BGLOOK(2),0);n.a=n.a0=q.z>40?Math.PI:0;});}
  if(f.tigerpet&&!sp.tigerpet&&S.t){sp.tigerpet=1;g.pets.push({k:'tigerpet',x:S.t.x+0.6,z:S.t.z-0.4,a:0,tx:S.t.x,tz:S.t.z,wait:1,step:0});}
  if(f.cabana&&!g.cabLit){g.cabLit=1;mvSolid(g,31.2,10.2,34.0,11.4);g.lights.push({x:32.6,y:1.8,z:11,r:4.5,c:[1.2,0.7,0.35]});}
  if(f.court&&!g.courtLit){g.courtLit=1;for(const [x,z] of [[36.5,5.5],[46.5,5.5],[36.5,21.5],[46.5,21.5]])g.lights.push({x,y:3.2,z,r:9,c:[1.0,1.0,0.95]});}}
 if(fl===-1&&f.dj&&!sp.dj){sp.dj=1;mvSolid(g,18.0,6.0,20.0,7.2);g.mansion.dj=mvChar(g,'mdj',19.0,5.6,mvLooks.dj(),0);g.lights.push({x:19,y:2,z:6.6,r:4,c:[0.3,1.0,1.3]});}
 /* the girls you've hired: the whole crew hangs around the ground floor and the pool; the first three keep you company upstairs */
 const crew=mvCrew(),want=fl===0?crew.length:fl===1?Math.min(3,crew.length):0,have=sp.girls||0,ms=g.spots.m||[];
 for(let i=have;i<want;i++){const c=crew[i],{P,L:lk}=mvGirlLook(c.n,i),q=ms[i%Math.max(1,ms.length)]||{x:g.player.x+1,z:g.player.z},off=ms.length&&i>=ms.length?0.8:0;
  const n=mvChar(g,'pgirl',q.x+off,q.z+off*0.4,lk,0);n.prof=P;n.girlI=i;n.dname=c.n;}
 sp.girls=Math.max(have,want);}
function mvBanner(g){const fl=g.mfl,tap=touchMode?'Tap':'Click';
 if(fl===0)banner('VILLA SOLANA',tap+' the phone for furniture and side jobs · your car is out front');
 else if(fl===1)banner('THE MASTER SUITE',mvCrew().length?'The girls are upstairs · the bed is big enough':'Sleep, change, take in the view');
 else banner('THE VELVET VAULT',touchMode?'Tap a dancer to tip · talk to Mama Rosa to hire a girl · range on the right':'Press E on a dancer to throw $100 · talk to Mama Rosa to hire a girl · range on the right');}
/* ---------------- moving between the floors ---------------- */
function mvGo(to){const g=G;if(!g||fading||g.seq)return;sfx('door');const from=g.mfl;fadeTo(()=>{MV_FROM=from;loadHub(MV_HUBNAME[to],'home');});}
/* ---------------- coming home and leaving: through the gate, round the fountain to the front steps ---------------- */
function mansionArrive(g){if(!g||g.mfl!==0||!g.hcar)return;const c=g.hcar,c0={x:20.0,z:34.7};c.x=20;c.z=58;c.a=Math.PI/2;seqCamTo(g,20,40);
 startSeq([{k:'hide',quiet:1},{k:'card',t1:'STAR ISLAND',t2:'VILLA SOLANA'},{k:'drive',car:c,path:[[20,58],[20,45.5],[19.4,43.0],[16.2,41.7],[14.6,38.5],[16.0,35.6],[18.0,34.75],[c0.x,c0.z]],dur:4.6,ease:'out',camMin:-1e9},{k:'wait',dur:0.3},
  {k:'out',car:c,at:[20.25,33.75],a:Math.PI},{k:'walk',path:[[20.0,32.9],[20.0,31.3],[20.0,29.6]],face:Math.PI,sp:2.4}],g=>{g.mansion.gate=0;mvBanner(g);});}
function mvDepartPath(c){return[[c.x,c.z],[22.6,34.85],[24.6,36.0],[25.4,38.5],[24.0,41.5],[20.6,42.9],[20,45.5],[20,58]];}
/* ---------------- every frame (from homeTick) ---------------- */
function mansionTick(g,dt){const M=g.mansion;if(!M)return;M.T+=dt;
 if(!g.range)updateDoors(dt);
 if(g.mfl===0){/* the gate swings open while a car is near it */
  const c=g.hcar,near=c&&Math.abs(c.x-20)<4&&c.z>39&&c.z<50;M.gate=clamp(M.gate+(near?dt:-dt)*1.6,0,1);
  /* the tennis pro and his partner: the ball goes back and forth over the net, each of them shuffles across to meet it */
  const R=M.rally,a=M.pro,b=M.pro2;R.t+=dt*0.62;if(R.t>=1){R.t-=1;R.dir=-R.dir;R.n++;R.x0=R.x1===undefined?41.5:R.x1;R.x1=38.5+Math.random()*6;if(Math.hypot(g.player.x-41.5,g.player.z-13.5)<9&&Math.random()<0.12)sfx('click',0.4);}
  if(R.x0===undefined){R.x0=41.5;R.x1=43;}
  const hitter=R.dir>0?a:b,recv=R.dir>0?b:a;if(a&&b){const tx=R.x1;recv.x+=clamp(tx-recv.x,-2.2*dt,2.2*dt);recv.vx=Math.abs(tx-recv.x)>0.05?Math.sign(tx-recv.x)*2:0;recv.walk=(recv.walk||0)+Math.abs(recv.vx)*dt*9;hitter.vx=0;
   a.a=0;b.a=Math.PI;if(R.t<0.12)hitter.atkT=0.2;}}
 if(g.mfl===-1&&M.dancers){const proxy={club:{sc:{x:11.75,z:6}},T:g.T,parts:g.parts};for(const d of M.dancers){danceTick(proxy,d,dt);d.boost=Math.max(0,d.boost-dt*0.25);}
  if(M.dj){M.dj.atkT=Math.sin(g.T*8)>0.9?0.15:M.dj.atkT;}}}
/* the ball in flight (world position) for the court drawing */
function mvBall(g){const R=g.mansion.rally,a=g.mansion.pro,b=g.mansion.pro2;if(!a||!b)return null;const u=R.t,from=R.dir>0?a:b,to=R.dir>0?b:a,x0=R.x0===undefined?from.x:R.x0,x1=R.x1===undefined?to.x:R.x1;
 const z0=from.z+(R.dir>0?0.5:-0.5),z1=to.z+(R.dir>0?-0.5:0.5),bounce=0.72,y=u<bounce?0.9+Math.sin(u/bounce*Math.PI)*1.4*(1-u/bounce)+(1-u/bounce)*0.1-u/bounce*0.85:Math.sin((u-bounce)/(1-bounce)*Math.PI)*0.9;
 return{x:x0+(x1-x0)*u,y:Math.max(0.06,y),z:z0+(z1-z0)*u};}
/* ---------------- what you can press (from hubTargets) ---------------- */
function mansionTargets(g,t){const fl=g.mfl;
 for(const s of MV_STAIRS[fl]||[])t.push({k:'stairs',x:s.x,z:s.z,r:1.7,lbl:s.lbl,fn:()=>mvGo(s.to)});
 if(fl===-1){const M=g.mansion;for(const d of M.dancers||[])t.push({k:'tip',d,x:d.x,z:d.z+1.6,r:2.6,lbl:'THROW $100 AT '+d.dname});
  if(M.rosa)t.push({k:'rosa',x:M.rosa.x,z:M.rosa.z,r:2.2,lbl:'MAMA ROSA · HIRE A GIRL ('+mvCrew().length+'/'+MV_GIRLS+')',fn:()=>{sfx('blip');openStore('mhire');}});}}
/* places to sit: sofas, loungers, booths and stools; the jacuzzi and the sunken tub bring the girls in with you */
const MV_TUBS={0:{x:30.5,z:6.5,y:0.12,P:[[30.5,7.15,Math.PI],[31.15,6.5,-Math.PI/2],[30.5,5.85,0],[29.85,6.5,Math.PI/2]],out:[[30.5,8.3],[32.3,7.4],[28.8,8.4],[28.6,7.6]]},
 1:{x:8.6,z:17.1,y:-0.12,P:[[8.6,17.75,Math.PI],[9.6,17.1,-Math.PI/2],[8.6,16.45,0],[7.6,17.1,Math.PI/2]],out:[[8.6,19.3],[11.2,19.2],[6.4,19.3],[7.5,19.4]]}};
function mansionSeats(g){const fl=g.mfl,L=[],add=(x,z,a,y,lbl,o)=>L.push(Object.assign({x,z,a,y,lbl},o||{}));
 if(fl===0){for(const x of [9.3,10.3,11.3])add(x,20.75,0,0.06,'SIT ON THE SOFA');for(const z of [16.1,16.9])add(12.0,z,Math.PI/2,0.36,'SIT AT THE BAR',{out:{x:11.2,z}});
  for(const x of [14.2,16.6,23.4,25.8])add(x,10.35,Math.PI,0.0,'LIE ON THE LOUNGER');for(const x of [27.6,30.4])add(x,16.8,0,0.12,'SIT AT THE TABLE');}
 if(fl===1){add(25.2,20.0,-Math.PI/2,0.05,'SIT IN THE ARMCHAIR');add(19.5,11.2,0,-0.02,'SIT ON THE DAYBED');add(21.5,11.2,0,-0.02,'SIT ON THE DAYBED');add(27.5,24.9,0,0.06,'SIT IN THE CHESTERFIELD');}
 if(fl===-1){for(const z of [8.0,11.5,15.0])for(const dz of [-0.5,0.5])add(19.55,z+dz,-Math.PI/2,0.08,'SIT IN THE BOOTH');for(const x of [3.4,5.0,6.6])add(x,16.55,Math.PI,0.08,'SIT ON THE SOFA');
  for(const z of [8.6,10.2,11.8,13.4])add(4.75,z,-Math.PI/2,0.36,'SIT AT THE BAR',{out:{x:5.6,z}});}
 const J=MV_TUBS[fl];if(J)J.P.forEach(([x,z,a],i)=>add(x,z,a,J.y,fl===0?'GET IN THE JACUZZI':'GET IN THE TUB',{tub:J,ti:i,out:{x:J.out[i][0],z:J.out[i][1]}}));
 return L;}
/* ---------------- Mama Rosa's book: hire a girl from the stage to live with you ---------------- */
function mansionHireRender(msg){const p=myProg(),g=G,crew=mvCrew();
 $('stWallet').textContent='$'+fmt(p.wallet);$('stOwed').textContent='LIVING WITH YOU · '+crew.length+'/'+MV_GIRLS;
 document.querySelector('#sStore .shT').textContent='MAMA ROSA · THE VELVET VAULT';
 document.querySelector('#sStore .shS').textContent='HIRE A GIRL · SHE MOVES IN TONIGHT · $'+fmt(MV_HIRE)+' EACH';
 for(const id of ['stHome','stHomeH'])$(id).style.display='none';$('stHome').innerHTML='';for(const id of ['stCars','stCarsH','stGold','stGoldH'])$(id).style.display='';
 $('stCarsH').textContent="ON THE STAGE TONIGHT";$('stGoldH').textContent='ALREADY LIVING WITH YOU';
 const ds=g&&g.mansion&&g.mansion.dancers||[],full=crew.length>=MV_GIRLS;
 $('stCars').innerHTML=ds.map((d,i)=>`<button class="scard" data-mh="${i}"${d.hired?' style="opacity:.55"':''}><div class="pn">${d.dname}</div><div class="pd">${d.hired?'Packing her bags. She moves in tonight.':['Dances like the rent is due. Smiles like it isn\'t.','Came down from Orlando with a suitcase and a plan.','Says she was a backup singer once. Sings in the shower to prove it.','Never misses a beat, never misses a tip.','Ask her about her tattoo. Actually, don\'t.','Likes the pool, the champagne and the quiet ones.'][i%6]}</div><div class="sp">${d.hired?'HIRED':full?'HOUSE FULL':'HIRE · $'+fmt(MV_HIRE)}<span class="kbhint"> (${i+1})</span></div></button>`).join('')||'<div class="pd">The stage is empty tonight.</div>';
 $('stGold').innerHTML=crew.map(c=>`<button class="scard on" style="cursor:default"><div class="pn">${c.n}</div><div class="pd">Lives at Villa Solana. Pool by day, the master suite by night.</div><div class="sp">LIVES HERE</div></button>`).join('')||'<div class="pd">Nobody yet. The house is very quiet.</div>';
 $('stMsg').textContent=msg||'';const cs=document.querySelectorAll('#sStore .scard');if(storeFocus>=cs.length)storeFocus=0;cs.forEach((b,i)=>b.style.outline=padMode&&i===storeFocus?'3px solid #ffd36b':'');}
function mansionHire(i){const p=myProg(),g=G,d=g&&g.mansion&&g.mansion.dancers&&g.mansion.dancers[i],crew=mvCrew(),f=furnAt(3);arm();if(!d)return;
 if(d.hired)return renderStore(d.dname+' is already packing her bags.');
 if(crew.length>=MV_GIRLS){sfx('blip');return renderStore('Eight girls is a household. Nine is a sorority. The house is full.');}
 if(p.wallet<MV_HIRE){sfx('blip');return renderStore('Five grand, honey. Come back when you have it.');}
 p.wallet-=MV_HIRE;crew.push({n:d.dname});f.girls=1;f.girlsN=crew.length;d.hired=true;saveProg();sfx('cash');
 popup(d.x,d.z,d.dname+' IS MOVING IN','#ff6fae');
 renderStore(pick(['Good choice. ','She was hoping you would ask. ','Treat her nice. ',''])+d.dname+' moves in tonight. '+(crew.length<=3?'She will be waiting upstairs.':'She will be down by the pool.'));}
/* ================= drawing ================= */
/* ================= drawing =================
   drawMansion(D,g,F): F is the fixed batch (drawHubDyn builds it once with everything that never moves; false once it is built,
   undefined to draw everything into D). Anything that moves or flickers goes to D every frame. */
const MV_WH=[0.97,0.96,0.94],MV_PINK=[1,0.25,0.7],MV_CYAN=[0.2,0.85,1],MV_RED=[0.6,0.03,0.1],MV_BLK=[0.06,0.05,0.07],MV_WOOD=[0.36,0.19,0.09];
const mvBx=B=>(x,y,z,sx,sy,sz,c,em,ry,uv)=>B.box(TRS(x,y,z,ry||0,sx,sy,sz),c,!!em,uv);
function mvPalm(B,x,z,s,lean){const bx=mvBx(B),tr=[0.5,0.38,0.22],h=1.9*s,n=7,ln=lean||0;
 for(let i=0;i<n;i++){const y=(i+0.5)*h/n,lx=Math.sin(i/n*1.2)*ln*s;B.box(A.mul(A.T(x+lx,y,z),A.mul(A.RZ(-ln*0.25),A.S(0.13*s,h/n*1.08,0.13*s))),i%2?tr:tr.map(v=>v*0.84));}
 const tx=x+Math.sin(1.2)*ln*s,ty=h,fc=[0.16,0.55,0.24];bx(tx,ty,z,0.24*s,0.16*s,0.24*s,[0.42,0.32,0.16]);
 for(let i=0;i<9;i++){const a=i*TAU/9+x*0.7,dr=0.45+(i%3)*0.18;B.box(A.mul(A.mul(A.T(tx,ty,z),A.RY(a)),A.mul(A.RX(dr),A.mul(A.T(0,0,0.5*s),A.S(0.22*s,0.02,1.0*s)))),i%2?fc:fc.map(v=>v*0.78));}}
function mvLounger(B,x,z,a,c){const m0=A.mul(A.T(x,0,z),A.RY(a||0)),P=(px,py,pz,sx,sy,sz,col,rx)=>B.box(A.mul(m0,A.mul(A.T(px,py,pz),A.mul(A.RX(rx||0),A.S(sx,sy,sz)))),col);
 P(0,0.18,0.2,0.62,0.06,1.25,MV_WH);P(0,0.22,0.2,0.54,0.05,1.15,c);P(0,0.32,-0.62,0.62,0.06,0.62,MV_WH,0.75);P(0,0.35,-0.6,0.54,0.05,0.56,c,0.75);for(const [lx,lz] of [[-0.27,-0.3],[0.27,-0.3],[-0.27,0.75],[0.27,0.75]])P(lx,0.08,lz,0.05,0.16,0.05,[0.85,0.86,0.9]);}
function mvUmbrella(B,x,z,c){B.box(TRS(x,0.75,z,0,0.05,1.5,0.05),MV_WH);for(let i=0;i<8;i++)B.box(A.mul(A.mul(A.T(x,1.5,z),A.RY(i*TAU/8)),A.mul(A.RX(0.3),A.mul(A.T(0,0,0.5),A.S(0.8,0.03,1.0)))),i%2?c:MV_WH);}
/* window frames on every run of sill cells (W): mullions, a header; the glass itself is drawn by mvPanes into the glass batch */
function mvRuns(map,ch){const R=[];map.forEach((row,Z)=>{let a=-1;for(let X=0;X<=row.length;X++){const on=row[X]===ch;if(on&&a<0)a=X;if(!on&&a>=0){R.push({x0:a+1,x1:X+1,z:Z+1.5});a=-1;}}});return R;}
function mvWindows(B,map){const bx=mvBx(B);for(const r of mvRuns(map,'W')){bx((r.x0+r.x1)/2,1.12,r.z,r.x1-r.x0,0.06,0.16,MV_WH);bx((r.x0+r.x1)/2,0.44,r.z,r.x1-r.x0+0.04,0.04,0.2,[0.92,0.88,0.8]);for(let x=r.x0;x<=r.x1;x++)bx(x,0.78,r.z,0.06,0.7,0.1,MV_WH);}}
function mvPanes(P,g){const map=g.def.map,pc=[0.32,0.52,0.66];if(!g._mvRuns)g._mvRuns=mvRuns(map,'W');for(const r of g._mvRuns)P.box(TRS((r.x0+r.x1)/2,0.78,r.z,0,r.x1-r.x0,0.68,0.03),pc,false,TUV[20]);
 if(g.mfl===0){for(const [x0,x1] of [[1,12],[28,35]])P.box(TRS((x0+x1)/2,0.55,4.5,0,x1-x0,0.82,0.03),pc,false,TUV[20]);}
 if(g.mfl===1)P.box(TRS(19,0.55,10.5,0,28,0.82,0.03),pc,false,TUV[20]);}
/* a stair flight: n steps from (x,z0) at floor level to z1 at height h, w wide; curve bows it sideways in the middle */
function mvFlight(B,x,z0,z1,h,w,n,curve,runner,y0){const bx=mvBx(B),y=y0||0;for(let i=0;i<n;i++){const u=(i+0.5)/n,z=z0+(z1-z0)*u,cx=x+curve*Math.sin(u*Math.PI),top=y+h*(i+1)/n,d=Math.abs(z1-z0)/n+0.02;
  bx(cx,(top+y)/2,z,w,Math.abs(top-y)+0.001,d,MV_WH,false,0,TUV[63]);if(runner)bx(cx,top+0.004,z,w*0.45,0.008,d,runner);}
 return i=>({x:x+curve*Math.sin((i+0.5)/n*Math.PI),z:z0+(z1-z0)*(i+0.5)/n,y:y+h*(i+1)/n});}
function mvRail(B,pts,ht,col,post){const bx=mvBx(B);for(let i=0;i<pts.length;i++){const p=pts[i];bx(p.x,p.y+ht/2,p.z,0.05,ht,0.05,post||MV_WH);
  if(i){const q=pts[i-1],dx=p.x-q.x,dy=p.y-q.y,dz=p.z-q.z,L=Math.hypot(dx,dy,dz);B.box(A.mul(A.mul(A.T((p.x+q.x)/2,(p.y+q.y)/2+ht,(p.z+q.z)/2),A.RY(Math.atan2(dx,dz))),A.mul(A.RX(-Math.atan2(dy,Math.hypot(dx,dz))),A.S(0.06,0.05,L+0.04))),col);}}}
function mvNeonWord(B,word,cx,y,z,h,col){mallWord(B,word,cx,y,z,h,col);}
function drawMansion(D,g,F){const B=F===undefined?D:F;if(!g.mansion)return;
 if(g.mfl===0){if(B)mvGroundStatic(B,g);mvGroundDyn(D,g);}
 else if(g.mfl===1){if(B)mvUpStatic(B,g);mvUpDyn(D,g);}
 else{if(B)mvBaseStatic(B,g);mvBaseDyn(D,g);}
 for(const q of g.pets)drawPet(D,q,g.T);
 /* the inside doors (world coordinates, they swing when you walk into them): white lacquer, gold handle */
 for(const d of g.doors||[]){const a=d.base+d.th,e=doorEnd(d),m0=A.mul(A.T((d.hx+e[0])/2,0,(d.hz+e[1])/2),A.RY(-a));D.box(A.mul(m0,TRS(0,0.56,0,0,0.98,1.1,0.06)),g.mfl<0?[0.3,0.31,0.34]:MV_WH);D.box(A.mul(m0,TRS(0,0.6,0,0,0.7,0.8,0.075)),g.mfl<0?[0.6,0.08,0.12]:[0.9,0.88,0.84]);
  D.box(TRS(d.hx+Math.cos(a)*0.84,0.56,d.hz+Math.sin(a)*0.84,-a,0.05,0.05,0.16),GOLD);}}
/* ---------------- the ground floor and the grounds ---------------- */
function mvGroundStatic(B,g){const bx=mvBx(B),f=homeFurn(),M=TUV[63],T0=0;
 /* ===== the terrace and the infinity pool: coping on three sides, the north edge spills into the bay ===== */
 bx(20,0.05,9.12,16.5,0.1,0.25,MV_WH,false,0,M);bx(11.88,0.05,6.5,0.25,0.1,5.25,MV_WH,false,0,M);bx(28.12,0.05,6.5,0.25,0.1,5.25,MV_WH,false,0,M);
 bx(20,0.035,4.03,16.0,0.05,0.06,[0.05,0.1,0.14]);bx(20,0.014,3.86,16.2,0.02,0.24,[0.55,0.92,1.0],true);
 for(let i=0;i<6;i++)bx(13.6+i*2.56,0.03,8.86,0.5,0.012,0.1,i%2?MV_PINK:MV_CYAN,true);
 for(let i=0;i<3;i++)bx(12.25+i*0.3,0.026,7.6,0.26,0.012,1.6,[0.8,0.92,0.98]);
 for(const [x,c] of [[14.2,MV_PINK],[16.6,MV_CYAN],[23.4,MV_PINK],[25.8,MV_CYAN]])mvLounger(B,x,10.75,Math.PI,c);
 for(const x of [15.4,24.6]){mvUmbrella(B,x,11.4,x<20?MV_PINK:MV_CYAN);bx(x,0.2,10.9,0.4,0.03,0.4,MV_WH);bx(x,0.1,10.9,0.05,0.2,0.05,MV_WH);}
 /* the glass rail along the bay either side of the pool */
 for(const [x0,x1] of [[1,12],[28,35]]){for(let x=x0+0.1;x<=x1-0.05;x+=1)bx(x,0.5,4.5,0.05,1.0,0.05,[0.85,0.86,0.9]);bx((x0+x1)/2,0.98,4.5,x1-x0,0.05,0.07,GOLD);}
 /* the jacuzzi: a raised white octagon, black tile inside, pink light round the rim */
 for(let i=0;i<8;i++){const a=i*TAU/8;bx(30.5+Math.sin(a)*1.02,0.22,6.5+Math.cos(a)*1.02,0.92,0.44,0.22,MV_WH,false,a,M);bx(30.5+Math.sin(a)*1.14,0.42,6.5+Math.cos(a)*1.14,0.8,0.02,0.03,MV_PINK,true,a);}
 bx(30.5,0.08,6.5,1.9,0.16,1.9,MV_BLK,false,Math.PI/8);
 /* the west terrace: white sofas round a fire bowl, and palms */
 for(const [x,z,a] of [[6,6.7,0],[6,9.3,Math.PI],[4.7,8,Math.PI/2],[7.3,8,-Math.PI/2]]){const m0=A.mul(A.T(x,0,z),A.RY(a)),P=(px,py,pz,sx,sy,sz,c)=>B.box(A.mul(m0,TRS(px,py,pz,0,sx,sy,sz)),c);
  P(0,0.18,0,1.5,0.36,0.62,MV_WH);P(0,0.42,-0.26,1.5,0.32,0.12,MV_WH);for(const lx of [-0.45,0.45])P(lx,0.42,-0.12,0.3,0.24,0.08,lx<0?MV_PINK:MV_CYAN);}
 bx(6,0.18,8,0.9,0.36,0.9,[0.2,0.2,0.22],false,Math.PI/4);bx(6,0.37,8,0.7,0.02,0.7,[0.1,0.08,0.06],false,Math.PI/4);
 for(const [x,z,s,l] of [[2.4,5.6,1.15,0.2],[2.4,11.6,1.0,-0.15],[10.6,11.8,0.95,0.1],[33.4,5.6,1.1,-0.2],[11.0,5.2,0.85,0.25],[29.0,11.9,0.9,0.15]])if(!(f.cabana&&x>30&&z>9))mvPalm(B,x,z,s,l);
 for(const x of [5.0,13.0,27.0,34.0]){bx(x,0.5,13.4,0.05,1.0,0.05,[0.4,0.28,0.15]);bx(x,1.02,13.4,0.12,0.12,0.12,[0.3,0.2,0.1]);}
 if(f.cabana){for(const [x,z] of [[31.3,10.15],[33.9,10.15],[31.3,12.0],[33.9,12.0]])bx(x,0.75,z,0.07,1.5,0.07,MV_WH);
  for(let i=0;i<7;i++)bx(31.1+i*0.43+0.21,1.52,11.08,0.43,0.04,2.1,i%2?MV_WH:MV_PINK);bx(32.6,1.55,11.08,3.1,0.03,2.2,MV_WH);
  bx(32.6,0.48,10.75,2.6,0.96,0.5,[0.12,0.1,0.13]);bx(32.6,0.97,10.75,2.7,0.04,0.6,MV_WH,false,0,M);bx(32.6,0.85,10.49,2.5,0.04,0.02,MV_CYAN,true);
  for(const x of [31.6,32.6,33.6])bx(x,0.32,10.2,0.28,0.04,0.28,MV_PINK);mallWord(B,'CABANA',32.6,1.62,10.0,0.14,MV_PINK);}
 if(f.yacht){const yx=42,yz=2.3;bx(yx,0.25,yz,10.2,0.5,1.9,MV_WH);bx(yx+5.3,0.25,yz,0.9,0.5,1.3,MV_WH,false,0);bx(yx,0.32,yz+0.96,10.2,0.08,0.02,[0.1,0.3,0.7]);
  bx(yx-0.5,0.72,yz,6.0,0.45,1.5,MV_WH);bx(yx-0.5,0.74,yz+0.76,5.6,0.2,0.02,[0.06,0.08,0.12]);bx(yx-1.0,1.12,yz,3.6,0.36,1.2,MV_WH);bx(yx-1.0,1.14,yz+0.61,3.2,0.16,0.02,[0.06,0.08,0.12]);
  bx(yx-1.6,1.5,yz,0.12,0.5,0.9,MV_WH);bx(yx-1.6,1.76,yz,0.6,0.05,0.1,[0.2,0.2,0.22]);bx(yx-3.6,0.64,yz,1.6,0.25,0.8,[0.95,0.95,0.92]);mallWord(B,'SOLANA',yx+2.2,0.12,yz+0.97,0.18,GOLD);}
 /* ===== the tennis court: lines, net, chain-link fence, the umpire's chair and a bench ===== */
 bx(42,0.004,14,12.8,0.006,18.8,[0.18,0.42,0.32]);bx(42,0.007,14,8.4,0.006,16.4,[0.16,0.32,0.62]);const LN=[0.96,0.96,0.96];for(const z of [6,22])bx(42,0.012,z,8.06,0.01,0.07,LN);for(const x of [38,46,39,45])bx(x,0.012,14,0.06,0.01,16,LN);
 for(const z of [10,18])bx(42,0.012,z,6,0.01,0.06,LN);bx(42,0.012,14,0.06,0.01,8,LN);for(const z of [6.15,21.85])bx(42,0.012,z,0.06,0.01,0.3,LN);
 for(const x of [37.5,46.5])bx(x,0.32,14,0.07,0.64,0.07,[0.2,0.2,0.22]);bx(42,0.32,14,9,0.5,0.015,[0.08,0.09,0.1]);bx(42,0.58,14,9,0.05,0.03,LN);
 const FN=[0.36,0.4,0.4];for(let z=4.5;z<=23.5;z+=1.9){bx(35.5,0.8,z,0.06,1.6,0.06,FN);bx(48.5,0.8,z,0.06,1.6,0.06,FN);}
 for(let x=35.5;x<=48.5;x+=1.86){bx(x,0.8,4.5,0.06,1.6,0.06,FN);if(x<40.9||x>43.1)bx(x,0.8,23.5,0.06,1.6,0.06,FN);}
 for(const y of [0.4,0.9,1.58]){bx(35.5,y,14,0.025,0.025,19,FN);bx(48.5,y,14,0.025,0.025,19,FN);bx(42,y,4.5,13,0.025,0.025,FN);bx(38.2,y,23.5,5.4,0.025,0.025,FN);bx(45.8,y,23.5,5.4,0.025,0.025,FN);}
 for(const x of [41.0,43.0])bx(x,0.9,23.5,0.08,1.8,0.08,MV_WH);bx(42,1.78,23.5,2.1,0.06,0.08,MV_PINK,true);
 bx(37.0,0.55,14,0.5,0.06,0.5,MV_WH);for(const [lx,lz] of [[-0.2,-0.2],[0.2,-0.2],[-0.2,0.2],[0.2,0.2]])bx(37.0+lx,0.27,14+lz,0.04,0.55,0.04,MV_WH);bx(37.0,0.75,14,0.45,0.4,0.06,MV_WH,false,Math.PI/2);
 bx(36.5,0.22,10.5,0.4,0.06,1.6,MV_WOOD);bx(36.5,0.11,10.5,0.3,0.22,1.4,[0.3,0.3,0.32]);bx(36.5,0.16,17.5,0.4,0.3,0.5,[0.2,0.5,0.85]);bx(36.5,0.32,17.5,0.42,0.04,0.52,MV_WH);
 if(f.court)for(const [x,z] of [[35.9,4.9],[48.1,4.9],[35.9,23.1],[48.1,23.1]]){bx(x,1.6,z,0.12,3.2,0.12,[0.3,0.3,0.33]);bx(x,3.25,z,0.8,0.25,0.4,[0.2,0.2,0.22]);bx(x,3.2,z+(z<10?0.21:-0.21),0.7,0.18,0.02,[1.3,1.3,1.2],true);}
 /* ===== the house: neon on the facade, pilasters, a portico over the front doors, the steps ===== */
 for(let x=5;x<=33;x++){const ch=MV_G[30][x-1];if(ch==='#'){bx(x+0.5,1.19,31.5,1.12,0.08,1.12,MV_WH);bx(x+0.5,0.58,32.03,0.05,0.96,0.02,MV_PINK,true);}}
 bx(19.5,1.17,32.04,29,0.035,0.02,MV_CYAN,true);bx(19.5,1.17,13.97,29,0.035,0.02,MV_PINK,true);
 for(const x of [17.2,18.4,21.6,22.8]){bx(x,0.8,32.75,0.26,1.6,0.26,MV_WH,false,0,M);bx(x,0.8,32.75,0.26,1.6,0.26,MV_WH,false,Math.PI/4,M);bx(x,1.62,32.75,0.4,0.06,0.4,GOLD);bx(x,0.04,32.75,0.42,0.08,0.42,GOLD);}
 bx(20,1.73,32.75,6.4,0.16,0.62,MV_WH,false,0,M);bx(20,1.83,32.75,6.5,0.04,0.66,GOLD);mallWord(B,'VILLA SOLANA',20,1.66,33.07,0.13,MV_PINK);
 bx(20,0.02,33.0,10.4,0.04,2.0,MV_WH,false,0,M);bx(20,0.05,33.4,9.6,0.04,1.2,MV_WH,false,0,M);bx(20,0.08,33.75,8.8,0.04,0.5,MV_WH,false,0,M);bx(20,0.012,32.6,1.6,0.02,1.4,MV_RED);
 for(const sx of [-1,1]){const hx=20+sx*0.97;bx(hx,0.55,30.62,0.08,1.1,0.96,MV_WOOD);bx(hx-sx*0.05,0.55,30.62,0.02,0.8,0.7,[0.45,0.25,0.12]);bx(hx-sx*0.06,0.56,30.2,0.03,0.18,0.03,GOLD);}
 for(const x of [16.3,23.7]){bx(x,0.25,33.3,0.5,0.5,0.5,MV_WH,false,Math.PI/4,M);bx(x,0.52,33.3,0.56,0.04,0.56,GOLD,false,Math.PI/4);mvPalm(B,x,33.3,0.6,0);}
 mvWindows(B,MV_G);
 /* ===== the foyer: twin staircases curving up to the landing, the neon name on the landing, the marble medallion ===== */
 const SH=0.84;bx(20,SH/2,20,8,SH,2,MV_WH,false,0,M);bx(20,SH+0.01,20,8.04,0.02,2.04,GOLD);bx(20,SH+0.012,20.3,3.6,0.01,1.4,MV_RED);
 const wf=mvFlight(B,17.0,27.9,21.0,SH,1.9,12,-0.35,MV_RED),ef=mvFlight(B,23.0,27.9,21.0,SH,1.9,12,0.35,MV_RED);
 const railW=[],railE=[];for(let i=0;i<12;i+=2){const p=wf(i),q=ef(i);railW.push({x:p.x+0.92,y:p.y,z:p.z});railE.push({x:q.x-0.92,y:q.y,z:q.z});}
 railW.push({x:18.0,y:SH,z:21.0});railE.push({x:22.0,y:SH,z:21.0});mvRail(B,railW,0.42,GOLD);mvRail(B,railE,0.42,GOLD);
 mvRail(B,[{x:18,y:SH,z:21},{x:19,y:SH,z:21},{x:20,y:SH,z:21},{x:21,y:SH,z:21},{x:22,y:SH,z:21}],0.42,GOLD);
 for(const x of [18.0,22.0]){bx(x,0.25,28.0,0.18,0.5,0.18,MV_WH,false,0,M);bx(x,0.55,28.0,0.12,0.1,0.12,GOLD);}
 bx(20,0.42,21.02,3.7,0.6,0.02,[0.08,0.04,0.1]);mallWord(B,'VILLA SOLANA',20,0.28,21.05,0.15,MV_PINK);for(const s of [-1,1])bx(20,0.42+s*0.27,21.05,3.5,0.02,0.02,MV_CYAN,true);
 {const r0=B.round;B.round=0;bx(20,SH+0.62,19.3,2.2,1.1,0.08,GOLD);bx(20,SH+0.62,19.36,2.0,0.95,0.02,[0.08,0.03,0.14]);drawRetroSun(B,20,SH+0.55,19.38,0.4,-0.1,0.9);B.round=r0;}
 bx(20,0.004,25.0,2.8,0.008,2.8,GOLD,false,Math.PI/4);bx(20,0.006,25.0,2.5,0.008,2.5,MV_BLK,false,Math.PI/4);bx(20,0.008,25.0,1.6,0.008,1.6,MV_WH,false,0,M);bx(20,0.009,25.0,0.5,0.008,0.5,MV_PINK,true,Math.PI/4);
 for(const x of [16.6,23.4]){bx(x,0.3,30.4,0.44,0.6,0.44,MV_BLK,false,0,M);bx(x,0.62,30.4,0.5,0.04,0.5,GOLD);mvPalm(B,x,30.4,0.55,0);}
 /* ===== the gallery behind the landing: a gold panther on a plinth, palms, the terrace doors ===== */
 bx(20,0.25,16,1.4,0.5,0.9,MV_BLK,false,0,M);bx(20,0.51,16,1.46,0.03,0.96,GOLD);bx(20,0.015,16,1.9,0.02,1.4,MV_PINK,true);
 {const P=(x,y,z,sx,sy,sz,ry)=>bx(20+x,0.52+y,16+z,sx,sy,sz,GOLD,false,ry||0);P(0,0.28,0,0.75,0.2,0.22);P(0.45,0.42,0,0.22,0.18,0.18);P(0.56,0.4,0,0.1,0.07,0.1);for(const [lx,lz] of [[-0.28,-0.08],[-0.28,0.08],[0.26,-0.08],[0.26,0.08]])P(lx,0.1,lz,0.07,0.22,0.07);P(-0.52,0.32,0,0.42,0.04,0.04,0.3);}
 for(const x of [16.7,23.3]){bx(x,0.22,15.6,0.5,0.44,0.5,MV_WH,false,0,M);mvPalm(B,x,15.6,0.7,0);}
 for(const sx of [-1,1])bx(20+sx*2.35,0.58,14.1,0.6,1.1,0.04,[0.75,0.8,0.86]);
 /* ===== the great room: the projection TV, the white sectional, the zebra rug, the bar, the phone ===== */
 bx(8.4,0.006,21.6,3.6,0.008,4.0,MV_WH);for(let i=0;i<9;i++)bx(6.9+i*0.38,0.012,21.6+Math.sin(i*1.7)*0.4,0.14,0.006,3.0,MV_BLK,false,Math.sin(i)*0.25);
 bx(6.35,0.3,21.5,0.5,0.6,4.4,MV_BLK);bx(6.35,0.61,21.5,0.54,0.02,4.44,GOLD);bx(6.35,0.88,21.5,0.1,0.52,1.9,[0.1,0.1,0.12]);for(const z of [19.7,23.3])bx(6.4,0.62,z,0.36,1.24,0.36,[0.1,0.09,0.1]);
 bx(9.45,0.2,21.6,0.8,0.4,3.3,MV_WH);bx(9.85,0.44,21.6,0.18,0.42,3.3,MV_WH);for(const z of [19.95,23.25])bx(9.45,0.3,z,0.8,0.6,0.2,MV_WH);
 for(let i=0;i<4;i++)bx(9.7,0.5,20.4+i*0.8,0.12,0.26,0.32,i%2?MV_PINK:MV_CYAN,false,0.15);
 bx(7.9,0.3,21.6,0.8,0.03,1.6,[0.75,0.9,1.0]);bx(7.9,0.15,21.6,0.5,0.3,1.2,GOLD);bx(7.9,0.325,21.4,0.4,0.01,0.3,[0.9,0.92,0.96],true);
 bx(13.25,0.5,16.05,0.55,1.0,1.9,MV_BLK);bx(13.2,1.01,16.05,0.75,0.04,2.0,MV_WH,false,0,M);bx(12.9,0.05,16.05,0.04,0.1,1.9,GOLD);bx(12.88,0.75,16.05,0.02,0.04,1.8,MV_PINK,true);
 for(const z of [16.1,16.9]){bx(12.05,0.36,z,0.32,0.05,0.32,MV_RED);bx(12.05,0.18,z,0.05,0.36,0.05,GOLD);}
 for(let r=0;r<2;r++)for(let i=0;i<7;i++)bx(13.9,0.62+r*0.28,15.2+i*0.27,0.08,0.2,0.08,[[0.8,0.2,0.2],[0.3,0.8,0.4],[0.9,0.75,0.3],[0.2,0.5,0.9],[0.95,0.95,0.9],[0.6,0.2,0.6],[0.9,0.4,0.1]][(i+r*3)%7],true);
 bx(7.5,0.2,16.5,0.5,0.4,0.5,MV_WH,false,0,M);bx(7.5,0.41,16.5,0.54,0.02,0.54,GOLD);bx(7.5,0.46,16.5,0.22,0.08,0.16,MV_WH);bx(7.5,0.52,16.45,0.2,0.04,0.05,GOLD);
 mvPalm(B,6.6,15.6,0.6,0.1);mvPalm(B,13.4,30.4,0.6,-0.1);
 /* the stairs down to the basement, behind a brass rail, with the club's sign over them */
 for(let i=0;i<8;i++){const z=28.15+i*0.34,y=-0.12-i*0.26;bx(7.5,y,z,2.9,0.08,0.36,MV_BLK);bx(7.5,y+0.045,z-0.15,2.9,0.01,0.04,MV_PINK,true);}
 mvRail(B,[{x:6.1,y:0,z:27.95},{x:7.5,y:0,z:27.95},{x:9.0,y:0,z:27.95},{x:9.0,y:0,z:29.5},{x:9.0,y:0,z:31.0}],0.48,GOLD);
 mallSign(B,7.5,1.5,28.0,['THE VAULT'],MV_PINK,0.2);
 /* ===== specials: the shark tank across the great room, the globe's plinth in the foyer, the helipad on the east lawn ===== */
 bx(11.7,0.1,27.3,4.7,0.2,0.66,MV_BLK);bx(11.7,1.24,27.3,4.7,0.08,0.66,MV_BLK);for(const x of [9.38,14.02])bx(x,0.67,27.3,0.06,1.06,0.66,GOLD);bx(11.7,1.29,27.3,4.74,0.02,0.7,GOLD);
 bx(11.7,1.18,27.3,4.5,0.03,0.05,MV_CYAN,true);bx(11.7,0.205,27.3,4.6,0.01,0.6,[0.2,0.55,0.85],true);bx(11.7,0.22,27.3,4.6,0.04,0.58,[0.85,0.75,0.5]);for(const [x,c] of [[10.1,[1,0.4,0.5]],[10.6,[0.95,0.6,0.3]],[13.2,[1,0.45,0.6]],[13.5,[0.4,0.85,0.5]]])bx(x,0.32,27.4,0.18,0.2,0.16,c);
 bx(11.7,0.05,27.01,4.6,0.03,0.02,MV_CYAN,true);
 bx(20,0.3,26.2,0.62,0.6,0.62,MV_BLK,false,0,M);bx(20,0.62,26.2,0.7,0.04,0.7,GOLD);bx(20,0.03,26.2,0.76,0.06,0.76,GOLD);bx(20,0.68,26.2,0.12,0.12,0.12,GOLD);mallWord(B,'THE CITY IS OURS',20,0.34,26.52,0.045,GOLD);
 mvDisc(B,41,0.012,27.5,3.0,0.012,[0.22,0.22,0.25]);for(let i=0;i<24;i++){const a=i*TAU/24;bx(41+Math.cos(a)*2.75,0.02,27.5+Math.sin(a)*2.75,0.06,0.012,0.6,[0.95,0.85,0.2],false,-a);}
 bx(40.2,0.022,27.5,0.18,0.012,1.6,MV_WH);bx(41.8,0.022,27.5,0.18,0.012,1.6,MV_WH);bx(41,0.022,27.5,1.6,0.012,0.18,MV_WH);
 for(let i=0;i<8;i++){const a=i*TAU/8;bx(41+Math.cos(a)*3.05,0.05,27.5+Math.sin(a)*3.05,0.1,0.1,0.1,[0.3,1.2,0.5],true);}
 /* ===== the dining room: a marble table for ten under a chandelier ===== */
 bx(29,0.42,18.5,4.6,0.06,1.6,MV_WH,false,0,M);bx(29,0.385,18.5,4.64,0.02,1.64,GOLD);for(const x of [27.2,30.8])bx(x,0.2,18.5,0.3,0.4,0.9,GOLD);
 for(let i=0;i<5;i++)for(const sd of [-1,1]){const x=27.0+i,z=18.5+sd*1.05;bx(x,0.25,z,0.42,0.06,0.42,MV_RED);bx(x,0.12,z,0.36,0.24,0.36,GOLD);bx(x,0.5,z+sd*0.2,0.42,0.5,0.06,MV_RED);}
 for(const x of [28,30]){bx(x,0.56,18.5,0.06,0.24,0.06,GOLD);bx(x,0.72,18.5,0.04,0.08,0.04,[1,0.85,0.4],true);}bx(29,0.5,18.5,0.4,0.1,0.4,[1,0.3,0.55]);
 for(let i=0;i<4;i++)bx(26.5+i*2,0.75,15.03,1.2,0.5,0.03,[[1,0.3,0.7],[0.2,0.8,1],[1,0.75,0.3],[0.6,0.3,1]][i],true);
 /* ===== the kitchen: white units, black marble tops, a pink neon strip, the island and its stools ===== */
 bx(29,0.45,24.47,7.9,0.9,0.85,MV_WH);bx(29,0.92,24.47,7.94,0.04,0.89,MV_BLK,false,0,M);bx(29,1.05,24.1,7.8,0.03,0.03,MV_PINK,true);
 bx(28.5,0.45,27.3,4.2,0.9,1.3,MV_WH);bx(28.5,0.92,27.3,4.3,0.04,1.4,MV_BLK,false,0,M);for(const x of [27.2,28.5,29.8])bx(x,0.95,27.3,0.3,0.02,0.3,[0.2,0.2,0.22]);
 for(const x of [27,28,29,30]){bx(x,0.45,28.4,0.32,0.05,0.32,MV_PINK);bx(x,0.22,28.4,0.04,0.44,0.04,GOLD);}
 bx(32.7,0.95,25.2,0.6,1.9,0.6,[0.85,0.86,0.9]);bx(32.38,0.95,25.2,0.02,1.8,0.02,[0.3,0.3,0.32]);
 /* ===== out front: the fountain, the drive's lamps, palms, the gate pillars, neon along the estate wall ===== */
 const FX=20,FZ=38.5;for(let i=0;i<8;i++){const a=i*TAU/8+TAU/16;bx(FX+Math.sin(a)*1.85,0.22,FZ+Math.cos(a)*1.85,1.55,0.44,0.26,MV_WH,false,a,M);bx(FX+Math.sin(a)*2.0,0.45,FZ+Math.cos(a)*2.0,1.45,0.02,0.04,MV_PINK,true,a);}
 bx(FX,0.32,FZ,3.4,0.02,3.4,[0.25,0.6,0.85],false,Math.PI/8);bx(FX,0.322,FZ,3.4,0.02,3.4,[0.25,0.6,0.85]);
 bx(FX,0.6,FZ,0.4,1.0,0.4,MV_WH,false,0,M);for(const r of [0,Math.PI/4])bx(FX,1.06,FZ,1.3,0.1,1.3,MV_WH,false,r,M);bx(FX,1.4,FZ,0.22,0.6,0.22,MV_WH,false,0,M);for(const r of [0,Math.PI/4])bx(FX,1.62,FZ,0.66,0.07,0.66,MV_WH,false,r,M);
 if(f.statue){const P=(x,y,z,sx,sy,sz,rz,rx)=>B.box(A.mul(A.T(FX+x,1.66+y,FZ+z),A.mul(A.RZ(rz||0),A.mul(A.RX(rx||0),A.S(sx,sy,sz)))),GOLD,true);
  P(0.05,0.28,0,0.025,0.56,0.025,0.1);P(-0.05,0.3,0,0.025,0.6,0.025,-0.25);P(0,0.68,0,0.42,0.22,0.24,0.25);P(-0.2,0.66,0,0.2,0.1,0.18,0.6);P(0.2,0.95,0,0.06,0.42,0.06,-0.35);P(0.28,1.18,0,0.16,0.09,0.1);P(0.38,1.14,0,0.12,0.04,0.05,-0.6);}
 for(let i=0;i<10;i++){const a=i*TAU/10+TAU/20;if(Math.abs(Math.cos(a))>0.95)continue;const x=FX+Math.sin(a)*5.8/0.82,z=FZ+Math.cos(a)*5.8;bx(x,0.7,z,0.06,1.4,0.06,[0.16,0.14,0.18]);bx(x,1.42,z,0.2,0.2,0.2,[1.2,0.95,0.6],true);bx(x,0.02,z,0.24,0.04,0.24,GOLD);}
 for(const [x,z,s,l] of [[13.0,34.2,1.0,0.15],[27.0,34.2,1.0,-0.15],[12.2,40.8,1.1,0.1],[27.8,40.8,1.05,-0.1],[15.8,43.0,0.9,0],[24.2,43.0,0.9,0],[3.5,34.5,1.2,0.2],[3.5,40.5,1.0,-0.1],[8.0,37.5,1.15,0.1],[32.5,36.0,1.1,-0.2],[38.0,29.5,1.2,0.1],[44.0,34.0,1.0,-0.1],[40.0,40.5,1.15,0.2],[45.5,26.5,0.95,0],[3.5,27.0,1.1,0.15],[3.5,18.0,1.0,-0.1],[34.0,27.0,1.05,0.1]])mvPalm(B,x,z,s,l);
 for(const x of [17.6,22.4]){bx(x,1.0,44.5,1.0,2.0,1.0,MV_WH,false,0,M);bx(x,2.05,44.5,1.1,0.1,1.1,GOLD);bx(x,2.28,44.5,0.34,0.34,0.34,GOLD,false,Math.PI/4);bx(x,1.5,44.0,0.5,0.5,0.02,[0.08,0.03,0.1]);mallWord(B,'VS',x,1.36,43.98,0.24,MV_PINK);}
 bx(2.03,1.1,24.5,0.02,0.04,39,MV_CYAN,true);bx(9.5,1.1,43.98,15,0.04,0.02,MV_CYAN,true);bx(35.25,1.1,43.98,25.5,0.04,0.02,MV_CYAN,true);bx(47.97,1.1,34,0.02,0.04,20,MV_CYAN,true);}
function mvGroundDyn(D,g){const T=g.T,bx=mvBx(D),f=homeFurn(),M=g.mansion;
 for(let i=0;i<16;i++){const x=12.6+((i*3.7+T*0.35*(i%3+1))%15),z=4.6+((i*1.9+Math.sin(T*0.6+i)*0.8)%4.2+4.2)%4.2;bx(x,0.035,z,0.35+0.15*Math.sin(T*2+i),0.004,0.06,[0.75,0.95,1.05],true,Math.sin(i)*0.4);}
 {const x=19+Math.sin(T*0.13)*5,z=6.5+Math.sin(T*0.21)*1.3,a=T*0.2;const m0=A.mul(A.T(x,0.06,z),A.RY(a)),P=(px,py,pz,sx,sy,sz,c)=>D.box(A.mul(m0,TRS(px,py,pz,0,sx,sy,sz)),c);
  for(let i=0;i<8;i++){const an=i*TAU/8;D.box(A.mul(m0,A.mul(A.T(Math.sin(an)*0.35,0.05,Math.cos(an)*0.35),A.mul(A.RY(an),A.S(0.3,0.14,0.16)))),[1,0.45,0.7]);}P(0,0.32,0.35,0.07,0.42,0.07,[1,0.45,0.7]);P(0,0.53,0.42,0.1,0.08,0.18,[1,0.45,0.7]);P(0,0.53,0.53,0.05,0.04,0.08,[0.1,0.1,0.1]);}
 bx(30.5,0.36,6.5,1.8,0.01,1.8,[0.3,0.85,1.05],true,Math.PI/8);for(let i=0;i<9;i++){const a=T*1.7+i*2.3,r=0.2+((i*0.37+T*0.5)%0.6);bx(30.5+Math.sin(a)*r,0.375,6.5+Math.cos(a)*r,0.1,0.01,0.1,[0.92,1,1],true);}
 {const fl=0.85+0.15*Math.sin(T*9)*Math.sin(T*5.3);for(let i=0;i<5;i++)bx(6+Math.sin(T*3+i)*0.12,0.42+i*0.07*fl,8+Math.cos(T*2.5+i)*0.12,0.3-i*0.05,0.08,0.3-i*0.05,[1.3,0.55+i*0.08,0.12],true,i);
  for(const x of [5.0,13.0,27.0,34.0])bx(x,1.14+Math.sin(T*9+x)*0.02,13.4,0.09,0.14+Math.sin(T*11+x)*0.03,0.09,[1.3,0.7,0.2],true);}
 drawFountainWater(D,{x:20,z:38.5},T);for(let k=0;k<3;k++){const ph=(T*0.4+k/3)%1,r=1.3+ph*0.4;for(let j=0;j<16;j++){const an=j*TAU/16;bx(20+Math.sin(an)*r,0.335,38.5+Math.cos(an)*r,0.03,0.004,r*0.38,[0.75,0.92,1].map(v=>v*(1-ph)),true,an+Math.PI/2);}}
 if(M.pro){const b=mvBall(g);if(b){bx(b.x,b.y,b.z,0.08,0.08,0.08,[0.85,1.0,0.2],true);bx(b.x,0.012,b.z,0.1,0.004,0.1,[0.05,0.08,0.06]);}}
 {const k=M.gate*1.35;for(const sd of [-1,1]){const hx=20+sd*1.9,a=sd<0?-k:Math.PI+k,m0=A.mul(A.T(hx,0,44.5),A.RY(a)),P=(px,py,pz,sx,sy,sz,c,em)=>D.box(A.mul(m0,TRS(px,py,pz,0,sx,sy,sz)),c,!!em);
   P(0.95,0.08,0,1.9,0.06,0.06,MV_BLK);P(0.95,1.3,0,1.9,0.06,0.06,MV_BLK);P(0.95,0.75,0,1.9,0.04,0.04,MV_BLK);for(let i=0;i<9;i++){P(0.1+i*0.21,0.7,0,0.03,1.3,0.03,MV_BLK);P(0.1+i*0.21,1.4,0,0.05,0.08,0.05,GOLD);}P(1.6,0.75,0,0.34,0.34,0.03,GOLD);P(1.6,0.75,0.02,0.2,0.2,0.01,MV_PINK,true);}}
 drawChandelier(D,IBhi,20,25,1.45,T);drawChandelier(D,IBhi,29,18.5,1.2,T);
 mvTankFish(D,T);mvGlobe(D,20,26.2,T);mvFireworks(D,T,1.8,1.6);
 if(myProg().heli)drawHeli(D,41,27.5,0.4,0);else for(let i=0;i<8;i++){if(Math.floor(T*4)%8===i)bx(41+Math.cos(i*TAU/8)*3.05,0.08,27.5+Math.sin(i*TAU/8)*3.05,0.14,0.04,0.14,[0.6,1.6,0.8],true);}
 {const ph=Math.floor(T*0.7)%4,c=[[1,0.35,0.75],[0.3,0.9,1],[1,0.85,0.3],[0.6,0.4,1]][ph];bx(6.41,0.88,21.5,0.01,0.46,1.8,c.map(v=>v*(0.85+0.15*Math.sin(T*7))),true);}}

/* ---------------- the specials ---------------- */
const MV_BED={x:19.5,z:18.8};
/* a disc out of 32 wedges (radial boxes meeting in the middle) */
function mvDisc(B,x,y,z,r,h,c,em,uv){const N=32,w=2*r*Math.tan(Math.PI/N)+0.01;for(let i=0;i<N;i++){const a=i*TAU/N;B.box(TRS(x+Math.cos(a)*r/2,y,z+Math.sin(a)*r/2,-a,r,h,w),c,!!em,uv);}}
/* the master bed: a round dais with a neon rim, a white leather base, red satin, a tufted half-moon headboard, pillows, a canopy ring */
function mvRoundBed(B,x,z){const bx=mvBx(B),N=28;
 mvDisc(B,x,0.05,z,2.45,0.1,MV_WH,false,TUV[63]);for(let i=0;i<N;i++){const a=i*TAU/N;bx(x+Math.cos(a)*2.46,0.05,z+Math.sin(a)*2.46,0.04,0.035,0.58,MV_PINK,true,-a);}
 mvDisc(B,x,0.26,z,2.05,0.3,MV_WH);for(let i=0;i<N;i++){const a=i*TAU/N;bx(x+Math.cos(a)*2.06,0.41,z+Math.sin(a)*2.06,0.04,0.03,0.48,GOLD,false,-a);}
 mvDisc(B,x,0.49,z,1.95,0.14,MV_RED);mvDisc(B,x+0.35,0.565,z,1.55,0.02,[0.72,0.05,0.14]);
 for(let i=0;i<14;i++){const a=Math.PI*0.62+i*Math.PI*0.76/13;bx(x+Math.cos(a)*2.12,0.62,z+Math.sin(a)*2.12,0.14,0.82,0.52,MV_RED,false,-a);bx(x+Math.cos(a)*2.14,1.04,z+Math.sin(a)*2.14,0.18,0.05,0.54,GOLD,false,-a);
  bx(x+Math.cos(a)*2.04,0.74,z+Math.sin(a)*2.04,0.02,0.04,0.04,GOLD,false,-a);}
 for(let i=0;i<4;i++){const zz=z-1.47+i*0.98;bx(x-1.15,0.62,zz,0.36,0.12,0.72,i%2?MV_WH:[1,0.75,0.85],false,0.0);}
 for(const sd of [-1,1]){const a=Math.PI+sd*1.25,px=x+Math.cos(a)*2.75,pz=z+Math.sin(a)*2.75;bx(px,0.25,pz,0.5,0.5,0.5,GOLD,false,a);bx(px,0.51,pz,0.56,0.02,0.56,MV_WH,false,a,TUV[63]);bx(px,0.68,pz,0.06,0.3,0.06,GOLD);bx(px,0.88,pz,0.3,0.16,0.3,[1.2,0.85,0.6],true);}
 for(let i=0;i<N;i++){const a=i*TAU/N;bx(x+Math.cos(a)*1.9,1.75,z+Math.sin(a)*1.9,0.05,0.05,0.44,GOLD,false,-a);}for(let i=0;i<4;i++){const a=i*TAU/4+0.4;bx(x+Math.cos(a)*1.9,2.2,z+Math.sin(a)*1.9,0.015,0.9,0.015,GOLD);}}
/* fireworks over the bay: a burst every couple of seconds, sparks fall and fade (deterministic from the clock) */
function mvFireworks(D,T,zc,yb){for(let k=0;k<3;k++){const per=2.6,t0=Math.floor(T/per-k/3)*per+k*per/3,u=(T-t0)/per;if(u<0||u>1)continue;
  const sd=Math.floor(t0*7.3),rr=v=>((Math.sin(sd*12.9898+v*78.233)*43758.5453)%1+1)%1,cx=6+rr(1)*36,cy=yb+rr(2)*1.2,cz=zc+rr(3)*1.5,c=NEON[Math.floor(rr(4)*4)],f=Math.max(0,1-u*1.15);
  if(u<0.18){const h=u/0.18;D.box(TRS(cx,cy*h,cz+1.5*(1-h),0,0.05,0.18,0.05),[1.2,0.9,0.5],true);continue;}
  const e=(u-0.18)/0.82,R=0.5+e*2.2;for(let i=0;i<26;i++){const a=i*TAU/26,b=((i*7)%5-2)*0.35;D.box(TRS(cx+Math.cos(a)*R*Math.cos(b),cy+Math.sin(b)*R-e*e*0.9,cz+Math.sin(a)*R*0.45,0,0.13,0.13,0.13),c.map(v=>v*1.6*f),true);D.box(TRS(cx+Math.cos(a)*R*0.7*Math.cos(b),cy+Math.sin(b)*R*0.7-e*e*0.9,cz+Math.sin(a)*R*0.3,0,0.07,0.07,0.07),[1.4*f,1.3*f,1.0*f],true);}}}
/* the shark tank's life: a reef shark cruising end to end, a school of neon fish the other way, bubbles */
function mvTankFish(D,T){const x0=9.7,x1=13.7,z=27.25,P=(m,px,py,pz,sx,sy,sz,c,em)=>D.box(A.mul(m,TRS(px,py,pz,0,sx,sy,sz)),c,!!em);
 {const u=(T*0.11)%2,f=u<1?u:2-u,dir=u<1?1:-1,x=x0+0.5+(x1-x0-1)*(0.5-0.5*Math.cos(f*Math.PI)),y=0.72+Math.sin(T*0.7)*0.12,w=Math.sin(T*6)*0.18,m=A.mul(A.T(x,y,z+0.05),A.RY(dir>0?0:Math.PI)),G2=[0.5,0.55,0.62],W2=[0.85,0.86,0.88];
  P(m,0,0,0,0.62,0.15,0.16,G2);P(m,0.3,-0.01,0,0.16,0.1,0.11,G2);P(m,0.02,-0.05,0,0.5,0.06,0.13,W2);P(m,-0.05,0.13,0,0.14,0.14,0.03,G2);
  D.box(A.mul(m,A.mul(A.T(-0.36,0,0),A.mul(A.RY(w),TRS(-0.1,0.04,0,0,0.2,0.2,0.03)))),G2);P(m,0.05,-0.09,0.06,0.14,0.03,0.12,G2);P(m,0.3,0.02,0.055,0.03,0.03,0.01,[0.05,0.05,0.05]);}
 for(let i=0;i<9;i++){const sp=0.35+0.05*(i%3),u=((-T*sp+i*0.37)%1+1)%1,x=x1-0.15-u*(x1-x0-0.3),y=0.42+((i*0.29)%0.62),zz=z-0.12+((i*0.17)%0.25),c=NEON[i%4],w=Math.sin(T*10+i)*0.3,m=A.mul(A.T(x,y+Math.sin(T*2+i)*0.03,zz),A.RY(Math.PI));
  P(m,0,0,0,0.13,0.07,0.035,c,true);D.box(A.mul(m,A.mul(A.T(-0.065,0,0),A.mul(A.RY(w),TRS(-0.04,0,0,0,0.07,0.07,0.012)))),c,true);}
 for(let i=0;i<6;i++){const u=(T*0.5+i/6)%1;D.box(TRS(10.2+i*0.65+Math.sin(T*3+i)*0.04,0.3+u*0.85,z+0.1,0,0.035,0.035,0.035),[0.85,0.95,1],true);}}
/* the gold globe in the foyer: turning, meridians and a pink neon ring round it */
function mvGlobe(D,x,z,T){const y=1.12,R=0.38,rot=T*0.6;for(let la=-3;la<=3;la++){const lat=la*0.4,rr=Math.cos(lat)*R,yy=y+Math.sin(lat)*R,n=Math.max(4,Math.round(14*Math.cos(lat)));
  for(let i=0;i<n;i++){const lon=i*TAU/n+rot,land=Math.sin(lon*2+la)>0.25;D.box(A.mul(A.mul(A.mul(A.T(x+Math.sin(lon)*rr,yy,z+Math.cos(lon)*rr),A.RY(lon)),A.RX(-lat)),A.S(0.2*Math.cos(lat)+0.04,0.13,0.03)),land?[1.0,0.78,0.3]:[0.75,0.55,0.16],land);}}
 for(let i=0;i<24;i++){const a=i*TAU/24-rot*0.5;D.box(TRS(x+Math.sin(a)*0.52,y+Math.sin(a*1)*0.08,z+Math.cos(a)*0.52,a,0.03,0.03,0.15),MV_PINK,true);}}
/* ---------------- upstairs: the balcony over the pool, the master suite, the bath, the dressing room, the gallery round the stairwell ---------------- */
function mvUpStatic(B,g){const bx=mvBx(B),f=homeFurn(),M=TUV[63],S=g.slots||{};
 /* ===== the balcony: a white slab edge with pink neon under it, posts and a gold rail (the glass is mvPanes), daybeds, palms in planters, a telescope ===== */
 bx(19.5,-0.2,10.02,29,0.4,0.06,MV_WH,false,0,M);bx(19.5,-0.42,10.04,29,0.035,0.03,MV_PINK,true);
 for(let x=5.1;x<=33.95;x+=1.2)bx(x,0.5,10.5,0.05,1.0,0.05,[0.85,0.86,0.9]);bx(19.5,0.98,10.5,29,0.05,0.07,GOLD);
 for(const x of [5.5,33.5]){for(let z=11;z<=13.6;z+=1.2)bx(x,0.5,z,0.05,1.0,0.05,[0.85,0.86,0.9]);bx(x,0.98,12.2,0.07,0.05,3.4,GOLD);}
 for(const [x,c] of [[19.5,MV_PINK],[21.5,MV_CYAN]]){bx(x,0.13,11.55,0.95,0.26,1.6,MV_WH,false,0,M);bx(x,0.29,11.6,0.86,0.06,1.45,c);bx(x,0.42,10.88,0.95,0.42,0.14,MV_WH,false,0,M);bx(x,0.36,11.0,0.7,0.14,0.14,MV_WH);}
 bx(20.5,0.22,11.5,0.5,0.44,0.5,GOLD);bx(20.5,0.45,11.5,0.6,0.02,0.6,[0.8,0.92,1.0]);bx(20.5,0.5,11.45,0.07,0.1,0.07,[0.2,0.5,0.25]);bx(20.62,0.52,11.55,0.06,0.14,0.06,[0.95,0.9,0.7]);
 for(const [x,z] of [[6.6,12.6],[32.4,12.6],[13.0,12.6],[27.0,12.6]]){bx(x,0.22,z,0.56,0.44,0.56,MV_WH,false,0,M);bx(x,0.45,z,0.6,0.03,0.6,GOLD);mvPalm(B,x,z,0.62,x<20?0.1:-0.1);}
 {const x=9,z=11.6;for(const a of [0,TAU/3,2*TAU/3])B.box(A.mul(A.T(x,0.4,z),A.mul(A.RY(a),A.mul(A.RX(0.25),A.S(0.03,0.8,0.03)))),[0.75,0.6,0.25]);B.box(A.mul(A.T(x,0.9,z-0.05),A.mul(A.RX(-0.5),A.S(0.12,0.12,0.75))),GOLD);B.box(A.mul(A.T(x,1.08,z-0.38),A.mul(A.RX(-0.5),A.S(0.15,0.15,0.04))),[0.2,0.3,0.4]);}
 for(const x of [15.5,24.5]){mvLounger(B,x,12.0,Math.PI,x<20?MV_CYAN:MV_PINK);}
 /* the sliding doors in from the balcony (open), and the window frames */
 for(const x of [18.05,21.95])bx(x,0.56,14.5,0.1,1.12,0.14,MV_WH);bx(20,1.1,14.5,4,0.08,0.14,MV_WH);for(const x of [18.4,21.6])bx(x,0.56,14.62,0.62,1.0,0.03,[0.55,0.7,0.8]);
 mvWindows(B,MV_U);
 /* ===== the master bedroom: a round bed on a round dais in the middle of the room, pink neon under it, a gold canopy ring over it,
    the fireplace on the west wall, the dresser and TV, the armchair ===== */
 mvRoundBed(B,MV_BED.x,MV_BED.z);
 bx(13.12,0.38,18.8,0.12,0.76,2.0,MV_WH,false,0,M);bx(13.2,0.3,18.8,0.06,0.44,1.2,MV_BLK);bx(13.22,0.78,18.8,0.3,0.05,2.2,MV_WH,false,0,M);bx(13.36,0.81,18.8,0.04,0.02,2.2,GOLD);
 for(const z of [17.95,19.65])bx(13.3,0.4,z,0.06,0.72,0.06,GOLD);for(const z of [18.2,19.4])bx(13.3,0.86,z,0.05,0.07,0.05,[0.95,0.92,0.85]);bx(13.1,1.0,18.8,0.04,0.24,1.0,[0.75,0.85,0.95]);bx(13.08,1.0,18.8,0.05,0.28,1.06,GOLD);
 bx(15.0,0.006,18.8,1.6,0.008,1.2,MV_WH);
 bx(24.8,0.4,15.9,2.3,0.8,0.62,MV_WH,false,0,M);bx(24.8,0.81,15.9,2.36,0.03,0.66,GOLD);for(const x of [24.2,25.4])for(const y of [0.2,0.55])bx(x,y,16.22,1.0,0.02,0.01,GOLD);
 bx(24.8,1.14,15.75,1.4,0.62,0.08,[0.08,0.08,0.1]);bx(24.8,0.84,15.75,0.3,0.04,0.2,[0.12,0.12,0.14]);
 {const x=25.55,z=20.0,m0=A.mul(A.T(x,0,z),A.RY(-Math.PI/2)),P=(px,py,pz,sx,sy,sz,c)=>B.box(A.mul(m0,TRS(px,py,pz,0,sx,sy,sz)),c);P(0,0.2,0,0.8,0.4,0.75,MV_RED);P(0,0.55,-0.33,0.8,0.5,0.14,MV_RED);for(const s of [-1,1])P(s*0.36,0.36,0,0.1,0.3,0.75,MV_RED);P(0,0.02,0,0.82,0.04,0.78,GOLD);}
 bx(24.3,0.22,20.0,0.4,0.44,0.4,GOLD);bx(24.3,0.45,20.0,0.46,0.02,0.46,MV_WH,false,0,M);bx(24.3,0.5,20.0,0.12,0.06,0.12,[0.9,0.85,0.7]);
 for(const [x,z] of [[16.3,15.3],[26.6,22.4]]){bx(x,0.35,z,0.08,0.7,0.08,GOLD);bx(x,0.78,z,0.34,0.2,0.34,[1.1,0.85,0.6],true);}
 for(let i=0;i<3;i++)bx(18.6+i*1.6,0.72,15.04,1.1,0.6,0.03,[[1,0.3,0.7],[0.2,0.8,1],[1,0.75,0.3]][i],true),bx(18.6+i*1.6,0.72,15.03,1.2,0.7,0.02,GOLD);
 /* ===== the bath: the sunken tub in a marble surround with a neon rim, the double vanity, the gold taps, the glass shower ===== */
 const TB=MV_TUBS[1];bx(TB.x,0.03,15.75,4.0,0.06,0.3,MV_WH,false,0,M);bx(TB.x,0.03,18.45,4.0,0.06,0.3,MV_WH,false,0,M);bx(6.75,0.03,17.1,0.3,0.06,3.0,MV_WH,false,0,M);bx(10.45,0.03,17.1,0.3,0.06,3.0,MV_WH,false,0,M);
 bx(TB.x,0.065,15.92,3.4,0.01,0.03,MV_PINK,true);bx(TB.x,0.065,18.28,3.4,0.01,0.03,MV_PINK,true);bx(TB.x,-0.05,17.1,3.5,0.06,2.4,MV_BLK);
 bx(TB.x,0.25,15.68,0.08,0.4,0.08,GOLD);B.box(A.mul(A.T(TB.x,0.45,15.8),A.S(0.06,0.06,0.3)),GOLD);for(const x of [7.3,9.9]){bx(x,0.3,15.75,0.36,0.6,0.36,MV_WH,false,0,M);bx(x,0.62,15.75,0.3,0.06,0.3,[0.9,0.4,0.6],true);}
 bx(6.35,0.42,21.0,0.6,0.84,2.6,MV_WH);bx(6.35,0.86,21.0,0.66,0.04,2.66,MV_BLK,false,0,M);for(const z of [20.3,21.7]){bx(6.4,0.88,z,0.36,0.02,0.5,[0.95,0.95,0.97]);bx(6.2,1.0,z,0.06,0.18,0.04,GOLD);}
 bx(6.08,0.98,21.0,0.03,0.32,2.4,[0.7,0.82,0.9]);bx(6.06,1.15,21.0,0.04,0.03,2.5,GOLD);bx(6.07,0.98,19.68,0.03,0.36,0.04,MV_PINK,true);bx(6.07,0.98,22.32,0.03,0.36,0.04,MV_PINK,true);
 bx(11.0,0.02,22.2,1.6,0.04,1.4,MV_WH,false,0,M);bx(10.2,0.55,22.2,0.03,1.1,1.4,[0.6,0.75,0.85]);bx(11.0,0.55,21.5,1.6,1.1,0.03,[0.6,0.75,0.85]);bx(11.6,1.0,22.6,0.2,0.04,0.2,GOLD);
 for(const [x,z] of [[11.4,16.0],[6.6,19.2]]){bx(x,0.2,z,0.44,0.4,0.44,MV_WH,false,0,M);mvPalm(B,x,z,0.45,0);}
 /* ===== the dressing room: rails of suits and dresses, shoe shelves, a jewellery island under glass, the long mirror ===== */
 bx(30.5,1.0,15.3,4.8,0.04,0.04,GOLD);for(let i=0;i<14;i++){const x=28.4+i*0.32,c=[[0.95,0.95,0.92],[0.15,0.15,0.2],[0.9,0.3,0.6],[0.3,0.75,0.9],[0.85,0.7,0.4],[0.55,0.1,0.15],[0.2,0.4,0.3]][i%7];bx(x,0.62,15.45,0.06,0.72,0.42,c);bx(x,0.99,15.45,0.02,0.06,0.02,GOLD);}
 bx(33.6,0.5,19.0,0.6,1.0,4.6,MV_WH);for(let r=0;r<4;r++)for(let i=0;i<8;i++)bx(33.3,0.16+r*0.24,17.0+i*0.55,0.2,0.06,0.16,[[0.9,0.1,0.2],[0.08,0.08,0.08],[0.95,0.85,0.3],[0.95,0.95,0.95]][(i+r)%4]);
 bx(30.5,0.42,19.2,1.8,0.84,0.9,MV_WH,false,0,M);bx(30.5,0.85,19.2,1.84,0.03,0.94,[0.8,0.92,1.0]);for(let i=0;i<5;i++)bx(29.9+i*0.3,0.84,19.2,0.12,0.01,0.12,[1.1,0.9,0.4],true);bx(30.5,0.6,19.66,1.6,0.03,0.02,MV_PINK,true);
 bx(28.08,0.65,21.0,0.03,1.1,0.9,[0.75,0.85,0.95]);bx(28.06,0.65,21.0,0.04,1.18,0.98,GOLD);bx(30.5,0.006,21.6,1.6,0.008,1.6,MV_PINK,false,Math.PI/4);
 /* ===== the gallery round the stairwell: brass rails, the twin flights going down to the foyer ===== */
 mvFlight(B,17.0,30.9,26.05,3.4,1.9,14,-0.25,MV_RED,MV_LOW);mvFlight(B,23.0,30.9,26.05,3.4,1.9,14,0.25,MV_RED,MV_LOW);
 const rl=(pts)=>mvRail(B,pts.map(([x,z])=>({x,y:0,z})),0.5,GOLD);
 rl([[18.05,31.0],[18.05,29.0],[18.05,27.0],[18.05,26.05],[20,26.05],[21.95,26.05],[21.95,27.0],[21.95,29.0],[21.95,31.0]]);
 bx(20,-0.17,26.02,4,0.34,0.06,MV_WH,false,0,M);bx(20,-0.36,26.04,4,0.03,0.02,MV_CYAN,true);
 for(const x of [15.4,24.6]){bx(x,0.25,25.5,0.4,0.5,0.4,MV_BLK,false,0,M);bx(x,0.52,25.5,0.44,0.04,0.44,GOLD);bx(x,0.75,25.5,0.22,0.42,0.22,[0.95,0.3,0.6],false,Math.PI/4);}
 bx(20,0.72,23.03,3.0,0.7,0.03,GOLD);bx(20,0.72,23.05,2.8,0.58,0.02,[0.08,0.03,0.14]);mallWord(B,'SOLANA',20,0.55,23.07,0.16,MV_PINK);
 /* ===== the guest suite: a white bed, a vanity with bulbs, a neon flamingo, a shag rug ===== */
 drawBedAt(bx,7.2,26.35,MV_WH,[0.3,0.8,0.85],[1,0.55,0.75],1.2);bx(6.08,0.7,26.35,0.06,0.8,1.3,[0.3,0.8,0.85]);
 bx(10.0,0.006,27.2,2.4,0.01,2.0,[0.95,0.55,0.75]);
 bx(12.5,0.4,24.35,1.4,0.8,0.5,MV_WH);bx(12.5,0.81,24.35,1.44,0.03,0.54,GOLD);bx(12.5,1.05,24.12,1.0,0.45,0.03,[0.75,0.85,0.95]);for(let i=0;i<5;i++)bx(11.9+i*0.3,1.3,24.13,0.06,0.06,0.06,[1.3,1.1,0.8],true);
 {const x=9.2,z=24.06,P=(px,py,sx,sy,r)=>B.box(A.mul(A.T(x+px,py,z),A.mul(A.RZ(r||0),A.S(sx,sy,0.02))),MV_PINK,true);P(0,0.7,0.36,0.18);P(0.15,0.86,0.03,0.3,0.3);P(0.24,1.0,0.12,0.06);P(-0.05,0.45,0.02,0.3);P(0.05,0.45,0.02,0.3);}
 /* ===== the study: the chesterfield, the partners' desk with the phone, bookshelves, a mounted marlin, a globe bar ===== */
 {const x=27.5,z=24.75;bx(x,0.2,z,2.2,0.4,0.72,[0.32,0.12,0.06]);bx(x,0.5,z-0.32,2.2,0.42,0.14,[0.3,0.11,0.05]);for(const s of [-1,1])bx(x+s*1.06,0.35,z,0.16,0.32,0.72,[0.3,0.11,0.05]);for(let i=0;i<4;i++)bx(x-0.75+i*0.5,0.41,z,0.4,0.02,0.6,[0.38,0.15,0.07]);}
 bx(29.5,0.4,27.8,3.0,0.06,1.2,MV_WOOD);bx(29.5,0.43,27.8,2.6,0.01,0.9,[0.12,0.3,0.18]);for(const x of [28.2,30.8])bx(x,0.2,27.8,0.5,0.4,1.1,MV_WOOD);
 bx(28.6,0.46,27.7,0.4,0.03,0.3,[0.95,0.95,0.92]);bx(30.3,0.55,27.6,0.08,0.2,0.08,GOLD);bx(30.3,0.68,27.6,0.26,0.1,0.26,[0.2,0.6,0.3]);
 {const o=S.o||{x:29.5,z:28.5};bx(o.x,0.48,o.z-0.6,0.22,0.06,0.16,[0.85,0.1,0.15]);bx(o.x,0.53,o.z-0.6,0.2,0.04,0.05,GOLD);}
 bx(29.5,0.3,26.8,0.6,0.06,0.55,MV_RED);bx(29.5,0.6,26.55,0.6,0.6,0.08,MV_RED);bx(29.5,0.15,26.8,0.06,0.3,0.06,GOLD);
 for(let i=0;i<2;i++){const x=31.2+i*1.2;bx(x,0.6,24.25,1.1,1.2,0.35,MV_WOOD);for(let r=0;r<3;r++)for(let k=0;k<6;k++)bx(x-0.45+k*0.18,0.3+r*0.36,24.42,0.12,0.24,0.04,[[0.6,0.1,0.1],[0.1,0.3,0.5],[0.7,0.6,0.2],[0.2,0.4,0.2]][(k+r+i)%4]);}
 {const x=27.5,z=24.05;bx(x,1.0,z,1.3,0.12,0.03,[0.2,0.35,0.7]);B.box(A.mul(A.T(x+0.75,1.06,z),A.mul(A.RZ(0.6),A.S(0.3,0.06,0.03))),[0.2,0.35,0.7]);B.box(A.mul(A.T(x-0.7,1.0,z),A.mul(A.RZ(0.2),A.S(0.5,0.02,0.03))),[0.3,0.3,0.35]);bx(x,0.95,z+0.01,1.6,0.4,0.01,[0.25,0.12,0.06]);}
 bx(26.0,0.25,29.3,0.5,0.5,0.5,MV_WOOD);bx(26.0,0.6,29.3,0.5,0.5,0.5,[0.3,0.5,0.7],false,0.4);bx(26.0,0.6,29.3,0.04,0.64,0.62,GOLD);
 mvPalm(B,32.6,30.2,0.55,0);mvPalm(B,6.6,30.2,0.55,0);}
function mvUpDyn(D,g){const T=g.T,bx=mvBx(D);
 {const fl=0.85+0.15*Math.sin(T*9)*Math.sin(T*5.3);for(let i=0;i<5;i++)bx(13.25,0.14+i*0.06*fl,18.5+i*0.15+Math.sin(T*3+i)*0.05,0.06,0.1,0.18-i*0.02,[1.3,0.5+i*0.1,0.12],true,i);}
 mvFireworks(D,T,2.4,1.8);
 /* water in the sunken tub, the chandelier hanging down the stairwell, the TV, candles on the balcony */
 const TB=MV_TUBS[1];bx(TB.x,0.02,17.1,3.3,0.01,2.2,[0.3,0.75,1.0],true);for(let i=0;i<8;i++){const a=T*1.3+i*2.1,r=0.3+((i*0.31+T*0.4)%0.8);bx(TB.x+Math.sin(a)*r*1.3,0.03,17.1+Math.cos(a)*r*0.8,0.1,0.01,0.1,[0.9,1,1],true);}
 drawChandelier(D,IBhi,20,28.5,MV_LOW+1.6,T);
 {const ph=Math.floor(T*0.5)%4,c=[[1,0.35,0.75],[0.3,0.9,1],[1,0.85,0.3],[0.6,0.4,1]][ph];bx(24.8,1.14,15.8,1.3,0.54,0.01,c.map(v=>v*(0.8+0.2*Math.sin(T*6))),true);}
 for(const [x,z] of [[20.4,11.45],[20.62,11.55]])bx(x,0.62+Math.sin(T*9+x)*0.01,z,0.03,0.05+Math.sin(T*12+x)*0.01,0.03,[1.3,0.75,0.25],true);
 const pulse=0.75+0.25*Math.sin(T*2.2);bx(19.5,-0.42,10.06,29,0.03,0.02,MV_PINK.map(v=>v*pulse),true);}

/* ---------------- the basement: THE VELVET VAULT (stage, poles, bar, booths, dance floor), the private range, the cellar hall ---------------- */
function mvBaseStatic(B,g){const bx=mvBx(B),f=homeFurn(),M=TUV[63],LT=[0.9,0.9,0.95];
 /* ===== the stage: black lacquer with a gold lip, six chrome poles, red velvet curtains, the club's name in neon on the back wall ===== */
 bx(12,0.18,3.8,12,0.36,3.6,MV_BLK,false,0,M);bx(12,0.365,3.8,12.04,0.01,3.64,[0.12,0.08,0.12]);bx(12,0.37,5.62,12.04,0.02,0.06,GOLD);bx(12,0.37,1.98+0.04,12.04,0.02,0.04,GOLD);
 for(let i=0;i<3;i++)bx(12,0.06+i*0.12,5.75+i*0.15,12.4-i*0.2,0.12,0.3,[0.1,0.06,0.1]);
 for(const q of MV_POLES){bx(q.x,0.36+0.9,q.z,0.05,1.8,0.05,LT);bx(q.x,0.39,q.z,0.26,0.04,0.26,GOLD);bx(q.x,2.15,q.z,0.2,0.06,0.2,GOLD);}
 for(const x of [5.4,18.6])for(let i=0;i<5;i++)bx(x+(i-2)*0.16,0.62,2.25,0.14,1.24,0.18+(i%2)*0.08,i%2?MV_RED:[0.48,0.02,0.08]);
 bx(12,1.15,2.2,12,0.12,0.2,MV_RED);for(let i=0;i<24;i++)bx(6.25+i*0.5,1.06,2.32,0.04,0.08,0.04,GOLD);
 bx(12,0.78,2.06,6.4,0.5,0.03,[0.06,0.02,0.08]);mvNeonWord(B,'THE VELVET VAULT',12,0.66,2.09,0.2,MV_PINK);
 /* ===== the dance floor: a black square with gold edging; the tiles light up from mvBaseDyn ===== */
 bx(11.5,0.006,10.5,6.3,0.01,5.3,[0.05,0.04,0.06]);for(const z of [7.85,13.15])bx(11.5,0.012,z,6.4,0.012,0.06,GOLD);for(const x of [8.35,14.65])bx(x,0.012,10.5,0.06,0.012,5.36,GOLD);
 /* ===== the bar along the west wall: black front, gold top, pink neon kick, a back bar of lit bottles, the brass foot rail ===== */
 bx(3.5,0.48,11.0,1.0,0.96,7.0,MV_BLK,false,0,M);bx(3.55,0.98,11.0,1.2,0.05,7.1,GOLD);bx(4.02,0.08,11.0,0.02,0.06,6.9,MV_PINK,true);bx(4.02,0.7,11.0,0.02,0.04,6.9,MV_PINK,true);bx(4.25,0.16,11.0,0.04,0.04,7.0,GOLD);
 bx(2.15,0.6,11.0,0.3,1.2,6.4,[0.1,0.06,0.08]);for(let r=0;r<3;r++){bx(2.3,0.5+r*0.28,11.0,0.25,0.02,6.2,[0.75,0.85,0.95]);for(let i=0;i<20;i++)bx(2.3,0.6+r*0.28,8.1+i*0.31,0.07,0.18,0.07,[[0.8,0.2,0.2],[0.3,0.8,0.4],[0.9,0.75,0.3],[0.2,0.5,0.9],[0.95,0.95,0.9],[0.6,0.2,0.6],[0.9,0.4,0.1]][(i+r*3)%7],true);}
 bx(2.12,1.05,11.0,0.04,0.16,6.0,[0.06,0.02,0.08]);mvNeonWordX(B,'BAR',2.16,1.05,11.0,0.12,MV_CYAN);
 for(const z of [8.6,10.2,11.8,13.4]){bx(4.75,0.36,z,0.34,0.05,0.34,MV_RED);bx(4.75,0.18,z,0.05,0.36,0.05,GOLD);bx(4.75,0.02,z,0.3,0.02,0.3,GOLD);}
 /* ===== the booths down the east wall: red tufted leather, a gold-rimmed table each, a little lamp ===== */
 for(const z of [8.0,11.5,15.0]){bx(20.65,0.5,z,0.3,1.0,2.4,MV_RED);bx(20.15,0.2,z,0.9,0.4,2.3,[0.5,0.02,0.08]);bx(20.15,0.41,z,0.84,0.03,2.2,MV_RED);for(const s of [-1,1])bx(20.15,0.42,z+s*1.18,0.9,0.44,0.12,MV_RED);
  for(let i=0;i<4;i++)bx(20.48,0.7,z-0.9+i*0.6,0.02,0.04,0.04,GOLD);bx(18.85,0.38,z,0.8,0.03,0.8,MV_BLK);bx(18.85,0.39,z,0.84,0.01,0.84,GOLD);bx(18.85,0.19,z,0.08,0.38,0.08,GOLD);
  bx(18.85,0.47,z,0.06,0.14,0.06,GOLD);bx(18.85,0.58,z,0.16,0.1,0.16,[1.2,0.4,0.7],true);}
 /* ===== the lounge by the south wall: a long velvet sofa, a glass table, Mama Rosa's corner with her book and her sign ===== */
 bx(5.0,0.2,17.3,5.8,0.4,0.8,MV_RED);bx(5.0,0.5,17.68,5.8,0.5,0.16,[0.48,0.02,0.08]);for(const x of [2.2,7.8])bx(x,0.35,17.3,0.2,0.3,0.8,[0.48,0.02,0.08]);for(let i=0;i<3;i++)bx(3.4+i*1.6,0.41,17.25,1.4,0.03,0.66,MV_RED);
 bx(5.0,0.3,15.7,2.4,0.03,0.9,[0.75,0.9,1.0]);bx(5.0,0.15,15.7,1.8,0.3,0.06,GOLD);bx(4.6,0.34,15.7,0.1,0.06,0.1,[0.95,0.9,0.5]);bx(5.4,0.36,15.6,0.08,0.1,0.08,[0.4,0.8,0.5]);
 bx(13.6,0.35,16.4,0.6,0.04,0.6,MV_BLK);bx(13.6,0.18,16.4,0.08,0.35,0.08,GOLD);bx(13.6,0.39,16.4,0.3,0.03,0.22,MV_RED);bx(13.6,0.41,16.4,0.28,0.01,0.2,[0.95,0.9,0.8]);
 bx(15.6,0.22,16.6,0.9,0.44,0.6,[0.85,0.2,0.55]);bx(15.95,0.48,16.6,0.2,0.5,0.6,[0.85,0.2,0.55]);
 mallSign(B,14.6,1.62,17.7,['MAMA ROSA','HIRE A GIRL'],MV_PINK,0.13);
 /* ===== the DJ booth (an upgrade) ===== */
 if(f.dj){bx(19,0.45,6.6,2.0,0.9,1.2,MV_BLK,false,0,M);bx(19,0.91,6.6,2.04,0.03,1.24,GOLD);bx(19,0.45,7.21,1.9,0.8,0.02,[0.06,0.02,0.1]);for(const x of [18.5,19.5]){bx(x,0.94,6.5,0.5,0.03,0.5,[0.12,0.12,0.14]);}bx(19,0.96,6.8,0.4,0.04,0.2,[0.2,0.2,0.22]);
  for(const x of [17.7,20.3]){bx(x,0.45,6.6,0.5,0.9,0.5,[0.1,0.1,0.12]);bx(x,0.6,6.86,0.3,0.3,0.02,[0.25,0.25,0.28]);bx(x,0.25,6.86,0.2,0.2,0.02,[0.25,0.25,0.28]);}}
 /* ===== the arch out to the cellar hall, the club wall's neon ===== */
 for(const x of [11.05,12.95]){bx(x,0.6,19.0,0.18,1.2,0.3,GOLD);bx(x,0.6,18.96,0.06,1.0,0.32,MV_PINK,true);}bx(12,1.2,19.0,2.2,0.12,0.32,GOLD);
 bx(12,0.02,1.95,20,0.04,0.04,MV_PINK,true);bx(2.04,1.1,10,0.04,0.04,16,MV_CYAN,true);
 /* ===== the range: a berm and baffle at the far end, lane numbers, floor lines, the shooting bench and booth dividers, a rifle rack ===== */
 bx(28.5,0.45,2.6,10,0.9,1.0,[0.12,0.11,0.1]);bx(28.5,1.2,2.35,10,0.8,0.5,[0.16,0.14,0.12]);bx(28.5,2.15,2.2,10,1.1,0.2,[0.22,0.2,0.18]);
 MV_LANES.forEach((lx,i)=>mvNeonWord(B,String(i+1),lx,1.7,2.46,0.22,[1,1,1]));
 for(const lx of [27,30]){bx(lx,0.012,9,0.06,0.012,11,[0.9,0.85,0.3],true);bx(lx,0.75,14.9,0.06,1.5,1.2,[0.23,0.23,0.27]);}
 for(let z=7;z<=13;z+=2)for(const lx of MV_LANES)bx(lx,0.014,z,0.6,0.012,0.04,[0.85,0.85,0.9]);
 bx(28,0.5,14.4,10,0.08,0.5,[0.36,0.36,0.4]);for(const lx of [23.3,32.7])bx(lx,0.25,14.4,0.08,0.5,0.45,[0.3,0.3,0.34]);
 for(const lx of MV_LANES){bx(lx,0.56,14.3,0.5,0.04,0.3,[0.2,0.6,0.25]);bx(lx+0.6,0.57,14.45,0.24,0.08,0.18,[0.12,0.12,0.14]);}
 bx(28.5,2.45,14.0,2.2,0.6,0.08,[0.1,0.1,0.12]);bx(28.5,2.45,14.05,2.05,0.48,0.01,[0.05,0.08,0.12],true);bx(28.5,3.0,14.0,0.04,0.5,0.04,[0.1,0.1,0.12]);
 bx(33.85,1.0,10,0.2,1.2,5,MV_WOOD);for(let i=0;i<8;i++){const z=7.8+i*0.6;bx(33.72,1.0,z,0.06,1.0,0.08,[0.1,0.1,0.12]);bx(33.7,0.75,z,0.08,0.3,0.1,MV_WOOD);}
 bx(23.15,1.6,16.5,0.08,0.06,1.4,[0.3,0.3,0.34]);for(let i=0;i<4;i++){bx(23.25,1.45,16.0+i*0.33,0.14,0.2,0.08,[0.9,0.3,0.15]);bx(23.25,1.58,16.0+i*0.33,0.05,0.04,0.24,[0.1,0.1,0.12]);}
 /* ===== the cellar hall: wine racks along the club wall, a cigar humidor, the stairs up behind a brass rail, the gun locker by the range door ===== */
 for(const [x0,x1] of [[7.6,10.6],[13.4,26.6]]){const n=Math.round((x1-x0)/0.9);for(let i=0;i<n;i++){const x=x0+(i+0.5)*(x1-x0)/n;bx(x,0.6,20.25,(x1-x0)/n-0.04,1.2,0.4,MV_WOOD);for(let r=0;r<4;r++)for(let k=0;k<3;k++)bx(x-0.25+k*0.25,0.2+r*0.28,20.47,0.07,0.07,0.04,(k+r+i)%3?[0.25,0.04,0.08]:[0.65,0.7,0.35]);}}
 /* the counting room at the west end: a round steel vault door swung open, gold bars, and your cash piled up (mvBaseDyn) */
 for(let i=0;i<16;i++){const a=i*TAU/16;bx(4.5+Math.cos(a)*0.62,0.7+Math.sin(a)*0.62,20.12,0.26,0.26,0.14,[0.55,0.56,0.6],false,0);}bx(4.5,0.7,20.1,1.0,1.0,0.1,[0.3,0.31,0.35]);
 {const m0=A.mul(A.T(5.2,0,20.2),A.RY(-1.2));for(let i=0;i<12;i++){const a=i*TAU/12;B.box(A.mul(m0,TRS(0.62+Math.cos(a)*0.5,0.7+Math.sin(a)*0.5,0,0,0.3,0.3,0.24)),[0.6,0.62,0.66]);}B.box(A.mul(m0,TRS(0.62,0.7,0.14,0,0.5,0.06,0.06)),GOLD);B.box(A.mul(m0,TRS(0.62,0.7,0.14,0,0.06,0.5,0.06)),GOLD);}
 for(let r=0;r<3;r++)for(let i=0;i<4-r;i++)bx(2.7+i*0.32+r*0.16,0.06+r*0.1,20.6,0.28,0.1,0.14,[1.2,0.9,0.35],true);
 bx(4.5,1.32,20.06,2.4,0.16,0.02,[0.06,0.02,0.08]);mvNeonWord(B,'COUNTING ROOM',4.5,1.28,20.09,0.08,[0.4,1.2,0.5]);
 bx(18.5,1.25,20.07,3.0,0.18,0.02,[0.06,0.02,0.08]);mvNeonWord(B,'CELLAR',18.5,1.21,20.1,0.1,[1,0.75,0.35]);
 mvFlight(B,12,22.05,23.95,1.1,7.4,6,0,MV_RED);mvRail(B,[{x:8.1,y:0,z:21.9},{x:8.1,y:0,z:23.9}],0.5,GOLD);mvRail(B,[{x:15.9,y:0,z:21.9},{x:15.9,y:0,z:23.9}],0.5,GOLD);
 mallSign(B,12,1.5,21.9,['UP'],MV_CYAN,0.16);
 bx(30.6,0.45,20.4,1.0,0.9,0.5,MV_WOOD);bx(30.6,0.91,20.4,1.04,0.03,0.54,GOLD);bx(30.6,0.6,20.66,0.8,0.5,0.02,[0.6,0.4,0.2]);
 for(let i=0;i<3;i++)bx(31.9+i*0.55,0.95,20.08,0.45,0.9,0.04,[0.75,0.6,0.3]),bx(31.9+i*0.55,0.95,20.1,0.35,0.78,0.02,[0.12,0.08,0.06]);
 for(const [x,z] of [[26.4,22.6]])bx(x,0.5,z,0.3,1.0,0.3,[0.3,0.3,0.32]),bx(x,1.05,z,0.2,0.1,0.2,[1.2,0.85,0.5],true);}
/* a neon word on a west/east wall (runs along z) */
function mvNeonWordX(B,word,x,y,z,h,col){mallWord({box:(m,c,e,uv)=>B.box(A.mul(A.mul(A.T(x,0,z),A.RY(Math.PI/2)),A.mul(A.T(-x,0,-z),m)),c,e,uv)},word,x,y,z,h,col);}
function mvBaseDyn(D,g){const T=g.T,bx=mvBx(D),M=g.mansion,f=homeFurn();
 /* stage chase lights, a spot on each dancer, the flickering sign, the dance-floor tiles, the mirror ball */
 for(let i=0;i<24;i++){const on=Math.floor(T*6+i)%2;bx(6.25+i*0.5,0.3,5.63,0.12,0.06,0.02,on?MV_PINK:[1,0.85,0.3],true);}
 for(const d of M.dancers||[]){const b=0.6+0.4*Math.sin(T*3+d.ph)+(d.boost||0);bx(d.pole.x,0.372,d.pole.z,0.9,0.004,0.9,[0.9*b,0.25*b,0.55*b],true,T*0.3+d.ph);}
 const fl=Math.sin(T*23)>0.97?0.4:1;bx(12,0.66,2.11,4.2,0.02,0.01,[0.2*fl,0.05*fl,0.15*fl],true);
 for(let i=0;i<6;i++)for(let j=0;j<5;j++){const k=(Math.floor(T*2.5)+i*3+j*5+((i+j)%2)*7)%6,c=NEON[k%4],on=k<3;if(!on)continue;bx(9.0+i,0.014,8.5+j,0.92,0.006,0.92,c.map(v=>v*0.75),true);}
 drawDisco(D,g);for(let i=0;i<8;i++){const an=T*1.1+i*TAU/8,rr=2.2+Math.sin(T*0.7+i)*0.8;bx(11.5+Math.cos(an)*rr,0.016,10.5+Math.sin(an)*rr,0.3,0.004,0.3,NEON[i%4],true);}
 if(f.dj){for(const x of [18.5,19.5])D.box(A.mul(A.T(x,0.96,6.5),A.mul(A.RY(T*4*(x<19?1:-1)),A.S(0.42,0.01,0.42))),[0.08,0.08,0.09]);for(let i=0;i<8;i++){const h=0.06+0.18*Math.abs(Math.sin(T*7+i*1.3));bx(18.3+i*0.2,0.45+h/2-0.3,7.23,0.12,h,0.01,NEON[i%4],true);}}
 /* the range: paper targets on their carriers, the hit monitor, bullets, flashes */
 const R=g.range,DK=[0.1,0.1,0.12],ST=[0.5,0.5,0.55],RED=[1,0.2,0.25];
 if(R)for(const L of R.lanes){const x=L.x,z=L.z,dn=L.down,hl=L.flash>0?1:0;
  D.box(TRS(L.base,2.45,z,0,0.04,0.03,0.04),DK);D.box(TRS(x,2.4,z,0,0.12,0.06,0.12),ST);D.box(TRS(x,2.1,z,0,0.01,0.6,0.01),[0.6,0.6,0.62]);
  const m=A.mul(A.T(x,1.78,z),A.RX(dn*1.35)),P=(px,py,pz,sx,sy,sz,c,em)=>D.box(A.mul(m,TRS(px,py,pz,0,sx,sy,sz)),c,em);
  P(0,0,0,0.8,0.03,0.03,[0.3,0.3,0.32]);P(0,-0.6,0.01,0.72,1.2,0.012,hl?[1.2,1.15,1]:[0.92,0.9,0.85],hl);P(0,-0.12,0.02,0.3,0.28,0.01,[0.1,0.1,0.12]);P(0,-0.8,0.02,0.56,0.8,0.01,[0.1,0.1,0.12]);
  P(0,-0.74,0.025,0.34,0.46,0.01,[0.9,0.9,0.86]);P(0,-0.74,0.03,0.13,0.18,0.01,RED,true);P(0,-0.12,0.025,0.13,0.13,0.01,[0.9,0.9,0.86]);
  D.box(TRS(L.base,0.012,z,0,2.2,0.012,0.05),[0.5,0.5,0.52]);}
 {const n=R?Math.min(10,Math.round(R.fired?R.hits/R.fired*10:0)):0;for(let i=0;i<10;i++)bx(27.6+i*0.2,2.45,14.06,0.14,0.32,0.01,i<n?(i<4?RED:i<7?[1,0.8,0.25]:[0.3,1,0.5]):[0.12,0.14,0.18],i<n);}
 const rf=Math.sin(T*17)>0.95?0.5:1;mvNeonWord(D,'PRIVATE RANGE',28.5,1.0,2.12,0.16,[1*rf,0.22*rf,0.28*rf]);
 for(const b of g.bullets)D.box(TRS(b.x,0.74,b.z,Math.atan2(b.dx,b.dz),0.035,0.035,0.45),[1,0.95,0.55],true);
 if(g.flashes)for(const q of g.flashes)drawFlash(D,q);
 if(R&&R.on)for(const q of g.gibs)D.box(A.mul(A.mul(A.T(q.x,q.y,q.z),A.mul(A.RY(q.ry),A.RX(q.rx))),A.S(q.sx,q.sy,q.sz)),q.c);
 drawLocker(D,g);
 {const n=Math.min(60,Math.ceil((myProg().wallet||0)/20000));for(let i=0;i<n;i++){const col=i%12,row=Math.floor(i/12);bx(2.45+col*0.38+(row%2)*0.1,0.07+row*0.14,21.55,0.34,0.13,0.5,[0.35,0.62,0.35]);bx(2.45+col*0.38+(row%2)*0.1,0.075+row*0.14,21.55,0.08,0.135,0.51,[0.9,0.85,0.7]);}}}
