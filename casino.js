'use strict';
/* CASINO LA PERLA: a casino on Collins Avenue you can drive to from the car menu any time, and play for real money.
   Doña Pilar Castellanos ran a floor in Havana before '59 and built La Perla after she got out. Inside, from the front doors:
     THE LOBBY        the gold pearl in its oyster fountain, gold columns, two doormen
     SLOTS (west)     two double banks: $5 PEARL DIVER and $25 FLAMINGO 7s, each with its own progressive jackpot
     THE PIT (middle) two blackjack tables, the craps table and two roulette wheels, each with its dealer and regulars
     THE BAR (east)   bar stools you can sit on, a lounge, the bartender and a cocktail waitress doing the rounds
     THE CAGE (NW)    the cashier behind the bars: your PEARL CLUB card
     THE LOUNGE STAGE a singer and her trio
     SALON PRIVE (NE) high limits ($500 to $25,000 blackjack and roulette, $500 BLACK PEARL slots): a GOLD card or $25,000 on you
   The games run on their own screen (#sCasino, built here) with a canvas table and big buttons, so they work by mouse, touch,
   keys and pad alike. Bets come straight out of the wallet and wins go straight back in; the PEARL CLUB tracks what you wager.
   Save data: p.casino {wag, net, best, n, jp:{den:pot}, comp, vis}.
   The hub map is CASINO_HUB (HUBS.casino in index.html); map cell (x,z) is world (x+1,z+1), the loader pads every map by one.
   Loaded after stocks.js, before the main inline script: nothing here touches main-script globals or WebGL at load time. */
const CAS_NAME='CASINO LA PERLA';
const CASINO_HUB={name:CAS_NAME,hub:'foot',wall:6,floor:43,sofa:0x8a1830,grime:0.05,amb:[0.4,0.32,0.36],lc:[0.66,0.54,0.5],track:'c_highroller',where:'CASINO LA PERLA · COLLINS AVENUE',obj:'PLAY THE TABLES · THEN BACK TO YOUR CAR',
 legend:{'.':{f:43},'_':{f:63},'H':{w:42,h:0.32,top:43},'S':{w:6,h:0.42,top:43},'s':{f:37},'l':{f:37,lamp:1},'p':{f:7},',':{f:7},'v':{w:38,h:0.03,top:38}},
 map:[
 "#############################################",
 "#..........#..SSSSSSSSSSSSSSSSS..H..........#",
 "#..........#..SSSSSSSSSSSSSSSSS..H..........#",
 "#..........#..SSSSSSSSSSSSSSSSS..H..........#",
 "#..........#..SSSSSSSSSSSSSSSSS..H..........#",
 "#..........#.....................H..........#",
 "#..........#.....................H..........#",
 "#..........#.....................H..........#",
 "#HHHHHHHHHH#.....................H..........#",
 "#................................H..........#",
 "#................................HHHH...HHHH#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "#...........................................#",
 "############HHHHHHHH_____HHHHHHHH############",
 "#sssssssssssssssssssssPsssssssssssssssssssss#",
 "#ssslsssssssslsssssssssssssssssslsssssssslss#",
 "ppppppppppppppppppCpppppppppppppppppppppppppp",
 ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
 ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
 "vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv"]};
/* the tables (map coordinates): dealer on the north side facing you, seats round the south side */
const CAS_TABLES=[
 {id:'bj1',game:'bj',x:16.5,z:12.5,min:10,max:500},
 {id:'bj2',game:'bj',x:16.5,z:19.5,min:25,max:2000},
 {id:'cr',game:'craps',x:22.5,z:16.2,min:10,max:1000},
 {id:'ro1',game:'roul',x:28.5,z:12.5,min:5,max:500},
 {id:'ro2',game:'roul',x:28.5,z:19.5,min:25,max:2000},
 {id:'bjx',game:'bj',x:38.5,z:3.2,min:500,max:25000,vip:1},
 {id:'rox',game:'roul',x:38.5,z:7.0,min:500,max:25000,vip:1}];
const CAS_GAME={bj:'BLACKJACK',roul:'ROULETTE',craps:'CRAPS',slot:'SLOTS'};
/* seats per game, relative to the table centre: [dx, dz, faces] (a = PI faces north, at the dealer) */
const CAS_SEATS={bj:[[-1.05,0.55,Math.PI-0.5],[-0.36,0.82,Math.PI-0.15],[0.36,0.82,Math.PI+0.15],[1.05,0.55,Math.PI+0.5]],
 roul:[[-1.1,0.98,Math.PI],[-0.3,0.98,Math.PI],[0.5,0.98,Math.PI]],
 craps:[[-1.6,1.42,Math.PI],[-0.55,1.42,Math.PI],[0.55,1.42,Math.PI],[1.6,1.42,Math.PI],[-2.65,0,Math.PI/2],[2.65,0,-Math.PI/2]]};
/* which seat at each table is yours (the rest may hold regulars) */
const CAS_MYSEAT={bj1:2,bj2:1,cr:2,ro1:1,ro2:2,bjx:1,rox:1};
/* slot machines: two double banks in the west wing, two BLACK PEARL machines in the salon */
const CAS_SLOTKIND={5:{name:'PEARL DIVER',col:[0.25,0.85,1]},25:{name:'FLAMINGO 7s',col:[1,0.35,0.7]},500:{name:'BLACK PEARL',col:[0.85,0.75,1]}};
const CAS_SLOTS=(()=>{const L=[];for(const [bx,den] of [[4.6,5],[8.6,25]])for(let i=0;i<8;i++)for(const s of [-1,1])L.push({x:bx+s*0.32,z:11.6+i*1.1,side:s,den});
 for(const z of [5.6,7.0])L.push({x:43.2,z,side:-1,den:500});L.forEach((m,i)=>m.i=i);return L;})();
const casSlotSeat=m=>({x:m.x+m.side*0.95,z:m.z,a:m.side<0?Math.PI/2:-Math.PI/2});
/* who sits where: a fixed pattern, so the room looks the same each visit (the regulars have their favourite machines) */
const CAS_SLOT_BUSY=new Set([0,1,3,5,6,9,10,12,15,17,18,21,22,24,27,28,30,31]);
const CAS_BAR={x:41.0,z0:12.6,z1:21.4},CAS_STOOLS=[13.6,14.8,16.0,17.2,18.4,19.6,20.8].map(z=>({x:39.75,z,a:Math.PI/2}));
const CAS_SOFAS=[{x:35.6,z:15.8,a:Math.PI/2},{x:35.6,z:17.0,a:Math.PI/2},{x:35.6,z:19.0,a:Math.PI/2},{x:35.6,z:20.2,a:Math.PI/2}];
const CAS_LOUNGE=[[15.5,6.6],[19.5,6.9],[25.5,6.9],[29.5,6.6]];
const CAS_COLS=[[13.2,23.4],[13.2,26.0],[31.8,23.4],[31.8,26.0]];
const CAS_PEARL={x:22.5,z:24.4};
const CAS_WAIT=[[12.9,9.6],[32.2,9.6],[32.2,22.4],[12.9,22.4]];/* the waitress's rounds */
const CAS_VIP_CASH=25000,CAS_TIERS=[{k:'MEMBER',at:0,col:'#c9b6f2'},{k:'SILVER',at:10000,col:'#e6e6f0'},{k:'GOLD',at:50000,col:'#ffd36b'},{k:'BLACK PEARL',at:250000,col:'#ff9ec7'}];
const CAS_COMP=[0,250,1000,5000];/* Pilar's comp once per job, by tier */
let CAS_RNG=null;/* tests fix the dice: a function returning 0..1 */
const casR=()=>CAS_RNG?CAS_RNG():Math.random();

/* ---------- save data ---------- */
function casProg(){const p=myProg();const c=p.casino||(p.casino={});for(const [k,v] of Object.entries({wag:0,net:0,best:0,n:0,comp:-1,vis:0}))if(c[k]===undefined)c[k]=v;if(!c.jp)c.jp={};
 for(const d of Object.keys(CAS_SLOTKIND))if(!(c.jp[d]>0))c.jp[d]=+d*1000;return c;}
function casTier(c){c=c||casProg();let t=0;CAS_TIERS.forEach((q,i)=>{if(c.wag>=q.at)t=i;});return t;}
function casVipOk(){return casTier()>=2||wallet()>=CAS_VIP_CASH;}
/* every bet that is settled: how much went down, how much came back */
function casSettle(stake,back){const c=casProg(),p=myProg(),t0=casTier(c);c.wag+=stake;c.n++;const net=back-stake;c.net+=net;if(net>c.best)c.best=net;
 const t1=casTier(c);if(t1>t0){CS.flash={txt:'PEARL CLUB · '+CAS_TIERS[t1].k+' CARD!',col:CAS_TIERS[t1].col,t:performance.now()};casSnd('jack');}
 saveProg();return net;}

/* ---------- looks ---------- */
const casHx=v=>[(v>>16&255)/255,(v>>8&255)/255,(v&255)/255];
const CAS_LOOK={
 pilar:()=>({fem:true,calm:1,sleeves:true,pads:true,heels:true,skirt:0.62,skin:casHx(0xd9a37c),jacket:casHx(0x16121a),shirt:casHx(0xd8b060),pants:casHx(0x16121a),shoes:casHx(0x1a1416),hs:'bob',hair:casHx(0x2a2228),medallion:true,chain:true,watch:true,bw:0.86,bd:0.86,bh:1.0}),
 dealer:()=>({skin:casHx(pick([0xd9a37c,0xf0c8a0,0x8a5a3a,0xefcaa8])),jacket:casHx(0xf2efe8),shirt:casHx(0xf2efe8),vest:casHx(0x7a1022),tie:casHx(0x101012),pants:casHx(0x121216),shoes:casHx(0x0a0a0c),hs:pick(['slick','normal','buzz']),hair:casHx(pick([0x1a1410,0x3a2a1a,0x101010])),bw:1.0,bd:1.0,bh:1.0}),
 fdealer:()=>({fem:true,calm:1,sleeves:true,skin:casHx(pick([0xefcaa8,0xd9a37c,0x8a5a3a])),jacket:casHx(0xf2efe8),shirt:casHx(0xf2efe8),vest:casHx(0x7a1022),pants:casHx(0x121216),shoes:casHx(0x0a0a0c),hs:'pony',hair:casHx(pick([0x1a1410,0x5a3a20,0xe0c070])),bw:0.86,bd:0.86,bh:1.0}),
 pitboss:()=>({skin:casHx(0xe0b090),jacket:casHx(0x22222a),shirt:casHx(0xffffff),tie:casHx(0xb0902a),pants:casHx(0x22222a),shoes:casHx(0x0a0a0c),hs:'slick',hair:casHx(0x8a8a8a),stache:true,watch:true,body:'big',bw:1.1,bd:1.08,bh:1.0}),
 cashier:()=>({skin:casHx(0xf0c8a0),jacket:casHx(0x2a5a3a),shirt:casHx(0xffffff),tie:casHx(0x101012),pants:casHx(0x1a1a1e),shoes:casHx(0x0a0a0c),hs:'normal',hair:casHx(0x5a3a20),glasses:true,bw:0.98,bd:0.96,bh:0.98}),
 waitress:()=>({fem:true,calm:1,heels:true,skirt:0.26,skin:casHx(0xefcaa8),jacket:casHx(0xc0142c),shirt:casHx(0xc0142c),pants:casHx(0xefcaa8),hose:'sheer',shoes:casHx(0x101012),hs:'pony',hair:casHx(0x1a1012),bw:0.84,bd:0.84,bh:1.0}),
 barman:()=>({skin:casHx(0x8a5a3a),jacket:casHx(0xffffff),shirt:casHx(0xffffff),vest:casHx(0x101012),tie:casHx(0x7a1022),pants:casHx(0x101012),shoes:casHx(0x0a0a0c),hs:'buzz',hair:casHx(0x101010),stache:true,bw:1.02,bd:1.0,bh:1.0}),
 singer:()=>({fem:true,calm:1,heels:true,skirt:0.66,skin:casHx(0x6b4226),jacket:casHx(0xd8b050),shirt:casHx(0xd8b050),pants:casHx(0xd8b050),shoes:casHx(0xd8b050),hs:'waves',hair:casHx(0x120c0a),medallion:true,bw:0.85,bd:0.85,bh:1.02}),
 band:()=>({skin:casHx(pick([0xd9a37c,0x8a5a3a,0xf0c8a0,0x6b4226])),jacket:casHx(0xf4f0e8),shirt:casHx(0x101012),tie:casHx(0x101012),pants:casHx(0x101012),shoes:casHx(0x0a0a0c),hs:pick(['slick','normal']),hair:casHx(0x1a1410),bw:1.0,bd:1.0,bh:1.0})};

/* ---------- people: lines when you walk up, and when you talk ---------- */
function casLines(){if(typeof NPC_CHAT!=='object'||NPC_CHAT.pilar)return;
 NPC_CHAT.pilar=["In Havana the tables never closed. Here they close at six. Progress.","Play what you like, cariño. The house is patient.","I dealt cards for Meyer's people at the Riviera. Nobody cheated twice.","The Cardinal? He counted my cage in '58. He still owes me a dance.","My dealers are honest. It is the cards that lie.","A gentleman tips the dealer. The dealer remembers."];
 NPC_CHAT.cdealer=["Place your bets.","Good luck, sir.","The shoe's been cold all night. Or hot. Depends who's asking.","No more bets, please.","Tips are appreciated. Mostly by me."];
 NPC_CHAT.pitboss=["I watch the tables. Doña Pilar watches me.","Win all you like. Count cards and you meet the back door.","Big night? Keep it classy."];
 NPC_CHAT.cashier=["The cage pays every winner. With a smile, even.","Your Pearl Club card? Doña Pilar likes regulars.","We don't do chips here. Cash on the felt, Florida-style."];
 NPC_CHAT.cwaitress=["Cocktails? Compliments of the house, for card members.","Careful, the craps table gets loud.","My feet hate this carpet."];
 NPC_CHAT.barman=["Mojito? Cuba libre? Something with an umbrella?","Every big winner sits on that stool. Every big loser too.","I make one drink better than anyone in Miami. I'm not telling you which."];
 NPC_CHAT.singer=["This one's for the lady at the roulette wheel.","Request? Honey, I take tips.","Bésame mucho, darling."];
 NPC_CHAT.band=["The piano's out of tune. So's the drummer.","We do two sets and a mambo.","Don't clap between songs, it confuses Ray."];
 NPC_CHAT.csec=["Welcome to La Perla. No firearms on the floor.","Enjoy your evening, sir.","The lady at the door says you're a regular."];
 NPC_CHAT.gambler=["Hit me. No wait. Don't hit me.","Red came up six times. It's due black. It's DUE.","I'm up! I'm down. I'm up!","My wife thinks I'm at bowling.","Seven, baby, seven!","This machine is warm, I can feel it.","Never split tens. Never.","Lucky shirt. Lucky socks. Unlucky everything else."];
 NPC_CHAT.punter=["First time in Miami. The ocean, the casino, the ocean.","I'm just watching. I'm only watching.","Did you see the guy who hit the jackpot? Me neither.","My system can't lose. It's lost, but it can't."];
 for(const k of ['pilar','cashier','csec','barman'])NPCLINES[k]=NPCLINES[k]||[[k==='pilar'?"Bienvenido a La Perla.":k==='csec'?"Evening, sir. Welcome to La Perla.":k==='barman'?"What'll it be?":"Cage is open."]];}

/* ---------- setup ---------- */
function casSetup(g){const O=1,W=g.W,H=g.H;casLines();casProg();
 g.park={x:g.car.x,z:g.car.z};g.car={x:g.park.x,z:g.park.z};
 const C=g.casino={T:0,keepers:[],dealers:{},walk:[],rail:[],t:0,warn:0,cheer:3};
 /* the carpet, the marble lobby, the salon's teal, the cage's tiles; the walls are burgundy damask */
 const FX=g.floorX=new Uint8Array(W*H),WX=g.wallX=new Uint8Array(W*H);
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){const X=x-O,Z=z-O,i=z*W+x;if(Z<0||Z>27)continue;
  FX[i]=Z>=23&&Z<=26?232:X>=34&&Z<=9?255:X<=10&&Z<=7?233:Z<=4&&X>=13&&X<=31?230:254;
  if(g.rows[z]&&g.rows[z][x]==='#'&&Z<27)WX[i]=234;}
 const S=g.solids=g.solids||[],R=(x,z,w,d)=>S.push({x:x+O,z:z+O,w,d});
 /* tables */
 for(const t of CAS_TABLES){if(t.game==='bj')R(t.x,t.z,2.6,1.2);else if(t.game==='roul')R(t.x,t.z,3.1,1.4);else R(t.x,t.z,4.6,2.1);}
 /* slot banks (one block per bank), the salon's two machines, the podium */
 for(const bx of [4.6,8.6])R(bx,15.45,1.24,9.3);for(const m of CAS_SLOTS)if(m.den===500)R(m.x,m.z,0.7,0.85);R(22.5,11.0,1.4,0.6);
 /* the bar counter and its back bar, the lounge's coffee tables, the stage tables, the gold columns, the pearl fountain */
 R(CAS_BAR.x,(CAS_BAR.z0+CAS_BAR.z1)/2,0.8,CAS_BAR.z1-CAS_BAR.z0);R(43.55,17,0.6,9.6);R(36.9,17.6,0.9,2.4);
 for(const [x,z] of CAS_LOUNGE)R(x,z,0.9,0.9);for(const [x,z] of CAS_COLS)R(x,z,0.7,0.7);R(CAS_PEARL.x,CAS_PEARL.z,2.6,2.0);
 /* the cage: vault, cash counters; the salon sofa */
 R(5.5,1.3,3.2,0.6);R(2.0,4.5,0.8,2.0);R(9.0,4.5,0.8,2.0);R(42.6,1.6,1.4,0.9);
 /* staff */
 const add=(kind,look,x,z,a,more)=>{const n=makeChar(x+O,z+O,look,false);Object.assign(n,{kind,state:'idle',a,a0:a,r:0.3,said:false},more||{});n.body=n.look.body;g.npcs.push(n);return n;};
 C.pilar=add('pilar',CAS_LOOK.pilar(),22.5,11.7,0);
 C.cashier=add('cashier',CAS_LOOK.cashier(),5.5,7.1,0);add('cashier',CAS_LOOK.cashier(),2.6,6.6,0.4);
 C.dealers={};CAS_TABLES.forEach((t,i)=>{const dz=t.game==='bj'?-0.95:t.game==='roul'?-1.05:-1.45,dx=t.game==='roul'?0.9:0;
  const d=add('cdealer',i%2?CAS_LOOK.fdealer():CAS_LOOK.dealer(),t.x+dx,t.z+dz,0);C.dealers[t.id]=d;
  if(t.game==='craps'){add('cdealer',CAS_LOOK.dealer(),t.x-1.0,t.z-1.45,0);add('pitboss',CAS_LOOK.pitboss(),t.x+1.0,t.z-1.45,0);}});
 add('pitboss',CAS_LOOK.pitboss(),19.6,16.2,Math.PI/2);
 C.barman=add('barman',CAS_LOOK.barman(),42.5,16.4,-Math.PI/2);add('barman',CAS_LOOK.barman(),42.5,19.8,-Math.PI/2);
 add('csec',NPCLOOK.guard(),19.2,25.9,0);add('csec',NPCLOOK.guard(),25.8,25.9,0);C.bouncer=add('csec',NPCLOOK.guard(),36.0,11.2,0);
 /* the lounge stage: the singer at the front, the trio behind (they stand on the stage, 0.42 up) */
 C.singer=add('singer',CAS_LOOK.singer(),22.5,3.6,0,{y:0.42});
 for(const [x,z,a] of [[16.6,2.6,0.5],[27.4,2.4,-0.4],[24.6,1.6,0]])add('band',CAS_LOOK.band(),x,z,a,{y:x<17||x>24&&x<25?0.42+SEAT_Y+0.12:0.42,seat:x<17||(x>24&&x<25),seatK:x<17||(x>24&&x<25)?1:0});
 /* the waitress on her rounds */
 C.wait=add('cwaitress',CAS_LOOK.waitress(),CAS_WAIT[0][0],CAS_WAIT[0][1],0,{wi:1});
 /* regulars: at the tables, on the slots, at the bar, in the lounge; and a few walking the floor */
 const gam=(x,z,a,y,seat)=>add('gambler',NPCLOOK.guest(),x,z,a,seat===false?{}:{seat:true,seatK:1,y:y===undefined?SEAT_Y+0.2:y});
 /* every seat but yours is taken (the salon keeps one free); the same regulars play beside you in the game screen */
 C.seated={};for(const t of CAS_TABLES){const L=CAS_SEATS[t.game];L.forEach(([dx,dz,a],k)=>{if(k===CAS_MYSEAT[t.id]||(t.vip&&k>2))return;
  const n=gam(t.x+dx,t.z+dz,a,undefined,t.game!=='craps');n.tbl=t;(C.seated[t.id]=C.seated[t.id]||[]).push({k,n});});
  /* railbirds: a couple standing behind the players, on the side away from your chair */
  if(!t.vip){const my=CAS_SEATS[t.game][CAS_MYSEAT[t.id]][0],sd=my>0?-1:1,back=t.game==='craps'?2.25:t.game==='roul'?1.75:1.65;
   for(const [ox,oz] of t.game==='craps'?[[sd*0.4,0.1],[sd*1.3,0],[sd*2.2,0.15]]:[[sd*0.75,0],[sd*1.45,-0.2]]){const n=add('punter',NPCLOOK.guest(),t.x+ox,t.z+back+oz,Math.PI);n.tbl=t;n.rail=1;C.rail.push(n);}}}
 for(const m of CAS_SLOTS)if(CAS_SLOT_BUSY.has(m.i)){const s=casSlotSeat(m);gam(s.x,s.z,s.a,SEAT_Y+0.3);}
 for(const [k,s] of CAS_STOOLS.entries())if(k%3!==1)gam(s.x,s.z,s.a,SEAT_Y+0.47);
 gam(CAS_SOFAS[0].x,CAS_SOFAS[0].z,CAS_SOFAS[0].a,SEAT_Y);gam(CAS_SOFAS[3].x,CAS_SOFAS[3].z,CAS_SOFAS[3].a,SEAT_Y);
 for(const [x,z] of CAS_LOUNGE.slice(1,3))gam(x-0.7,z,Math.PI/2,SEAT_Y+0.12);
 for(let i=0;i<10;i++)C.walk.push(add('punter',NPCLOOK.guest(),[13,19.6,25.4,31.6,22.5,13,31.6,19.6,25.4,13][i],[10,9.6,22.4,14,22.6,20,20.5,22.6,9.6,15][i],0));
 /* lights: warm pools over the tables, pink over the slots, gold on the stage, cool in the salon */
 g.lights.push(...CAS_TABLES.slice(0,5).map(t=>({x:t.x+O,y:2.4,z:t.z+O,r:3.6,c:[1.3,1.05,0.75]})),
  {x:5.6,y:2.4,z:13+O,r:5,c:[1.2,0.5,1.0]},{x:7.6,y:2.4,z:19+O,r:5,c:[0.5,0.9,1.3]},{x:22.5+O,y:2.6,z:3+O,r:6,c:[1.3,0.95,0.55]},
  {x:39+O,y:2.4,z:5+O,r:6,c:[0.75,0.8,1.3]},{x:41+O,y:2.4,z:17+O,r:5,c:[1.25,0.6,0.85]},{x:6+O,y:2.4,z:4+O,r:5,c:[0.9,1.15,0.7]},{x:22.5+O,y:2.6,z:24.5+O,r:6,c:[1.3,1.1,0.8]},{x:22.5+O,y:3,z:29.5,r:7,c:[1.2,0.5,0.8]});
 venueLot(g);/* rebuilds the static batch with the lot, the floors above and everything casStatic draws */
 const v=casProg();v.vis++;saveProg();
 g.obj='PLAY THE TABLES · THEN BACK TO YOUR CAR';}
function casHello(g){if(!g||!g.casino)return;const c=casProg(),first=c.vis<=1;banner(CAS_NAME,'Slots · blackjack · roulette · craps · the bar');
 const n=g.casino.pilar;if(n)setTimeout(()=>{if(G===g&&n)popup(n.x,n.z-0.3,first?'"WELCOME TO LA PERLA, CARIÑO. COME SEE ME."':'"MY FAVOURITE REGULAR!"','#ffd36b');},1600);}

/* ---------- interaction ---------- */
function casTargets(g,t){const O=1,C=g.casino;if(!C)return;
 if(g.seatP){seatTargets(g,t,[]);return;}
 t.push({k:'cas',fn:()=>casClub('pilar'),x:C.pilar.x,z:C.pilar.z+0.2,r:2.2,lbl:'TALK TO DOÑA PILAR · PEARL CLUB'});
 t.push({k:'cas',fn:()=>casClub('cage'),x:5.5+O,z:9.4+O,r:1.8,lbl:'THE CAGE · YOUR CARD & WINNINGS'});
 for(const tb of CAS_TABLES){const s=casSeat(tb);t.push({k:'cas',fn:()=>casSit(tb),x:s.x,z:s.z,r:1.3,lbl:'PLAY '+CAS_GAME[tb.game]+' · $'+fmt(tb.min)+'-$'+fmt(tb.max)});}
 for(const m of CAS_SLOTS){if(CAS_SLOT_BUSY.has(m.i))continue;const s=casSlotSeat(m);t.push({k:'cas',fn:()=>casSitSlot(m),x:s.x,z:s.z,r:0.75,lbl:'PLAY $'+fmt(m.den)+' '+CAS_SLOTKIND[m.den].name});}
 t.push({k:'cas',fn:()=>casDrink(g),x:39.7+O,z:17.0+O,r:1.6,lbl:casTier()>=1?'THE BAR · A DRINK ON THE HOUSE':'THE BAR · A DRINK $20'});
 seatTargets(g,t,casSeatList(g));
 /* everybody else with something to say */
 const p=g.player;let nb=null,nd=1.7;if(p)for(const q of g.npcs){if(!NPC_CHAT[q.kind]||q===C.pilar)continue;const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<nd){nd=d;nb=q;}}
 if(nb)t.push({k:'talk',n:nb,x:nb.x,z:nb.z,r:1.7,lbl:'TALK'});}
/* bar stools and lounge sofas you can sit on (the busy ones are skipped by seatTargets) */
function casSeatList(g){const O=1;return CAS_STOOLS.map(s=>({x:s.x+O,z:s.z+O,a:s.a,y:SEAT_Y+0.47,lbl:'SIT AT THE BAR',out:{x:s.x+O-0.8,z:s.z+O}})).concat(CAS_SOFAS.map(s=>({x:s.x+O,z:s.z+O,a:s.a,lbl:'SIT IN THE LOUNGE'})));}
function casSeat(tb){const [dx,dz,a]=CAS_SEATS[tb.game][CAS_MYSEAT[tb.id]];return {x:tb.x+dx+1,z:tb.z+dz+1,a};}
/* sit down at the table (the craps table you stand at), then the game screen opens */
function casSit(tb){const g=G;if(!g||!g.casino||state!=='play')return;
 if(tb.vip&&!casVipOk()){casBouncer(g);return;}
 const s=casSeat(tb);if(tb.game!=='craps'){sitDown(g,{x:s.x,z:s.z,a:s.a,y:SEAT_Y+0.2,out:{x:s.x,z:s.z+0.75}});}else{const p=g.player;p.x=s.x;p.z=s.z;p.a=s.a;p.vx=p.vz=0;}
 casOpen(tb.game,tb);}
function casSitSlot(m){const g=G;if(!g||state!=='play')return;if(m.den>=500&&!casVipOk()){casBouncer(g);return;}const s=casSlotSeat(m);
 sitDown(g,{x:s.x+1,z:s.z+1,a:s.a,y:SEAT_Y+0.3,out:{x:s.x+1+(m.side<0?-0.6:0.6),z:s.z+1}});casOpen('slot',{id:'slot'+m.i,den:m.den,min:m.den,max:m.den*3,m});}
function casBouncer(g){const n=g.casino.bouncer;sfx('blip');popup(n.x,n.z-0.3,'"SALON PRIVE: GOLD CARD OR $'+fmt(CAS_VIP_CASH)+' ON YOU, SIR."','#ff8a95');}
function casDrink(g){const free=casTier()>=1;if(!free){if(wallet()<20){sfx('blip');popup(g.player.x,g.player.z,'TWENTY BUCKS, PAL','#ff8a95');return;}myProg().wallet-=20;saveProg();}
 if(typeof hlDrink==='function')hlDrink(g);else sfx('click');const n=g.casino.barman;if(n)popup(n.x,n.z-0.3,pick(free?['"ON THE HOUSE, MR. CARD MEMBER."','"PILAR\'S TREAT."']:['"TWENTY. KEEP THE UMBRELLA."','"SALUD."']),'#ffe9a8');}

/* ---------- per frame: the waitress's rounds, the walkers, the salon rope, the band ---------- */
function casTick(dt,g){const C=g.casino;if(!C)return;C.T+=dt;const p=g.player;
 if(typeof hlTick==='function'&&g.buzz!==undefined)hlTick(g,dt);
 const w=C.wait;if(w){const tg=CAS_WAIT[w.wi],O=1,dx=tg[0]+O-w.x,dz=tg[1]+O-w.z,L=Math.hypot(dx,dz);w.vx=w.vz=0;
  if(p&&Math.hypot(p.x-w.x,p.z-w.z)<1.2){}else if(L<0.15){w.wi=(w.wi+1)%CAS_WAIT.length;}else{const sp=0.9;w.vx=dx/L*sp;w.vz=dz/L*sp;w.x+=w.vx*dt;w.z+=w.vz*dt;w.walk=(w.walk||0)+sp*dt*9;w.a+=clamp(angDiff(w.a,Math.atan2(dx,dz)),-5*dt,5*dt);}}
 for(const n of C.walk)casWalk(n,dt,g,p);
 /* somebody at a table wins (or doesn't) every few seconds: a shout, a hop; the railbirds lean in */
 for(const n of C.rail){n.walk=(n.walk||0)+dt*(n.hop>0?6:0.6);if(n.hop>0)n.hop-=dt;}
 if((C.cheer-=dt)<=0){C.cheer=rnd(4,8);const L=g.npcs.filter(n=>n.tbl&&!n.rail);const n=L.length&&pick(L);
  if(n&&p&&Math.hypot(n.x-p.x,n.z-p.z)<12){const gm=n.tbl.game,win=Math.random()<0.6,
   T={bj:win?['BLACKJACK!','TWENTY-ONE, BABY!','PAY ME!']:['BUST! AGAIN!','DEALER\'S HOT TONIGHT'],roul:win?['RED! I SAID RED!','SEVENTEEN! MY NUMBER!','STRAIGHT UP, BABY!']:['DOUBLE ZERO?! COME ON!','THE WHEEL HATES ME'],craps:win?['YO-LEVEN!','POINT! POINT!','COME ON, SEVEN!']:['SEVEN OUT...','CRAPS! NOOO']}[gm]||['WINNER!'];
   popup(n.x,n.z-0.3,'"'+pick(T)+'"',win?'#ffd36b':'#ff8a95');if(win){n.hop=1.2;for(const q of C.rail)if(q.tbl===n.tbl)q.hop=1.4;if(typeof casSnd==='function'&&Math.hypot(n.x-p.x,n.z-p.z)<6)casSnd('chip');}}}
 for(const n of g.npcs)if(n.hop>0&&n.tbl&&!n.rail){n.hop-=dt;if(n.y0===undefined)n.y0=n.y||0;n.y=n.y0+Math.abs(Math.sin(n.hop*9))*0.08;if(n.hop<=0)n.y=n.y0;}
 /* the salon: no card, no cash, no entry */
 if(p&&!casVipOk()&&p.x>34.6&&p.x<42.6&&p.z<11.3&&p.z>10.2){p.z=11.35;if(C.T>C.warn){C.warn=C.T+4;casBouncer(g);}}
 /* the singer sways, the band nods along */
 for(const n of g.npcs){if(n.kind==='singer'){n.a=Math.sin(C.T*0.9)*0.35;n.walk=(n.walk||0)+dt*2;}else if(n.kind==='band')n.walk=(n.walk||0)+dt*(n.seat?0:1.5);}}
const CAS_FLOOR=[12.8,32.4,9.4,22.8];/* the walkers keep to the floor round the pit */
function casWalk(n,dt,g,p){const d=p?Math.hypot(p.x-n.x,p.z-n.z):9;n.vx=0;n.vz=0;if(d<1.3)return;const O=1;
 const free=(x,z)=>!g.solids.some(s=>Math.abs(x-s.x)<s.w/2+0.45&&Math.abs(z-s.z)<s.d/2+0.45)&&!isBlock(Math.floor(x),Math.floor(z));
 if(!n.tgt||Math.hypot(n.tgt[0]-n.x,n.tgt[1]-n.z)<0.3||n.stuck>1.2){let t=null;for(let k=0;k<24&&!t;k++){const x=CAS_FLOOR[0]+O+casR()*(CAS_FLOOR[1]-CAS_FLOOR[0]),z=CAS_FLOOR[2]+O+casR()*(CAS_FLOOR[3]-CAS_FLOOR[2]);if(free(x,z))t=[x,z];}n.tgt=t||[n.x,n.z];n.stuck=0;n.wait=rnd(1,4);}
 if(n.wait>0){n.wait-=dt;return;}
 const dx=n.tgt[0]-n.x,dz=n.tgt[1]-n.z,L=Math.hypot(dx,dz)||1,sp=0.75;n.vx=dx/L*sp;n.vz=dz/L*sp;const ox=n.x,oz=n.z;n.x+=n.vx*dt;n.z+=n.vz*dt;collideGrid(n);for(const s of g.solids)boxPush(s,n);
 const m=Math.hypot(n.x-ox,n.z-oz);n.walk=(n.walk||0)+m*9;if(m<sp*dt*0.3)n.stuck=(n.stuck||0)+dt;n.a+=clamp(angDiff(n.a,Math.atan2(dx,dz)),-5*dt,5*dt);}

/* ---------- drawing: everything that never moves (baked once into the static batch by venueStatic) ---------- */
function casStatic(B,g){const O=1,bx=(x,y,z,sx,sy,sz,c,em,ry)=>B.box(TRS(x+O,y,z+O,ry||0,sx,sy,sz),c,!!em),
  GOLDC=[1,0.8,0.32],GOLDD=[0.75,0.55,0.18],RED=[0.62,0.05,0.12],FELT=[0.06,0.42,0.22],FELTB=[0.05,0.22,0.5],WOOD=[0.36,0.18,0.08],BLK=[0.06,0.05,0.07],WH=[0.95,0.94,0.9],CH=[0.78,0.8,0.84],PINK=[1,0.3,0.7],CYAN=[0.25,0.9,1];
 const r0=B.round;B.round=0;
 /* ===== the front: a gold marquee over the doors, an awning, the red carpet, gold ropes ===== */
 mallSign(B,22.5+O,3.05,27.12+O,['CASINO LA PERLA','SLOTS · TABLES · LOUNGE'],GOLDC,0.5,PINK);
 bx(22.5,2.45,28.45,6.4,0.06,0.9,RED);for(const s of [-1,1])bx(22.5+s*3.15,1.22,28.85,0.06,2.44,0.06,GOLDC);bx(22.5,2.4,28.9,6.4,0.1,0.04,GOLDC,true);
 bx(22.5,0.012,28.6,4.2,0.012,1.7,RED);for(const s of [-1,1]){bx(22.5+s*2.15,0.016,28.6,0.06,0.012,1.7,GOLDC);for(const zz of [28.0,29.2]){bx(22.5+s*2.6,0.45,zz,0.08,0.9,0.08,GOLDC);bx(22.5+s*2.6,0.92,zz,0.14,0.08,0.14,GOLDC);}bx(22.5+s*2.6,0.78,28.6,0.04,0.04,1.2,[0.7,0.05,0.12]);}
 /* the front glass (H): frames, a streak; the bulbs round the marquee are drawn per frame */
 for(let x=0;x<45;x++){const c=g.rows[27+O]&&g.rows[27+O][x+O];if(c!=='H')continue;bx(x+0.5,2.6,27.5,1,0.08,0.12,GOLDD);bx(x,1.45,27.5,0.06,2.3,0.06,GOLDD);bx(x+0.5,0.36,27.5,0.98,0.02,0.04,[0.6,0.85,0.95],true);}
 /* ===== the lobby: the pearl in its oyster, the gold columns, palms, the host stand ===== */
 {const P=CAS_PEARL;bx(P.x,0.22,P.z,2.6,0.44,2.0,[0.9,0.86,0.8]);bx(P.x,0.45,P.z,2.4,0.02,1.8,[0.3,0.65,0.85]);
  for(let i=0;i<9;i++){const a=-1.2+i*0.3;B.box(A.mul(A.mul(A.T(P.x+O+Math.sin(a)*0.6,0.9,P.z+O-0.25-Math.cos(a)*0.1),A.RZ(-a*0.9)),A.S(0.24,1.0,0.08)),[0.92,0.86,0.8]);}
  bx(P.x,0.55,P.z+0.1,0.9,0.18,0.7,[0.85,0.78,0.72]);bx(P.x,0.92,P.z+0.05,0.6,0.56,0.56,[1.15,1.1,1.2],true);}
 for(const [x,z] of CAS_COLS){bx(x,1.3,z,0.5,2.6,0.5,GOLDC);bx(x,0.06,z,0.7,0.12,0.7,BLK);bx(x,2.55,z,0.7,0.1,0.7,BLK);}
 for(const [x,z] of [[1.6,26],[43.4,26],[1.6,23.4],[43.4,23.4]])drawPalm(B,x+O,z+O,false,x+z);
 bx(16.5,0.55,24.4,0.9,1.1,0.5,WOOD);bx(16.5,1.12,24.4,1.0,0.05,0.6,GOLDC);
 /* ===== the cage: bars and windows on the glass run, the vault, cash, the PEARL CLUB sign ===== */
 for(let x=1;x<=10;x++){bx(x+0.5,2.55,8.5,1,0.1,0.14,GOLDD);for(let k=0;k<5;k++)bx(x+0.1+k*0.2,1.45,8.5,0.035,2.1,0.035,GOLDC);if(x%3===2){bx(x+0.5,0.95,8.62,0.9,0.05,0.3,WOOD);bx(x+0.5,1.0,8.62,0.5,0.02,0.24,WH);}}
 bx(5.5,1.2,1.25,3.2,2.4,0.5,[0.5,0.52,0.56]);bx(5.5,1.2,1.52,1.8,1.8,0.06,[0.62,0.64,0.68]);for(let i=0;i<6;i++){const a=i*TAU/6;bx(5.5+Math.cos(a)*0.45,1.2+Math.sin(a)*0.45,1.58,0.1,0.1,0.04,GOLDC);}
 for(const sx of [2.0,9.0]){bx(sx,0.5,4.5,0.8,1.0,2.0,WOOD);bx(sx,1.02,4.5,0.82,0.04,2.02,[0.2,0.4,0.25]);for(let k=0;k<5;k++)bx(sx,1.08+((k*3)%2)*0.06,3.7+k*0.4,0.3,0.06+((k*5)%3)*0.04,0.16,[0.45,0.7,0.4]);}
 mallSign(B,5.5+O,2.95,8.38+O,['THE CAGE','PEARL CLUB · CASHIER'],GOLDC,0.36,GOLDC);
 /* ===== the lounge stage: boards, a gold edge, the piano, the drums, the bass, the sign ===== */
 bx(22.5,0.43,3,17,0.02,4,[0.32,0.14,0.08]);bx(22.5,0.21,5.02,17.04,0.42,0.04,[0.45,0.05,0.12]);bx(22.5,0.43,5.03,17.06,0.04,0.06,GOLDC);for(let x=14.5;x<31;x+=1.5)bx(x,0.3,5.06,0.12,0.06,0.03,[1.2,1.0,0.6],true);
 bx(22.5,1.5,1.05,17,2.2,0.06,[0.35,0.04,0.1]);for(let x=14.6;x<31;x+=0.8)bx(x,1.5,1.1,0.12,2.2,0.04,[0.45,0.06,0.14]);
 {const y=0.44;bx(16.0,y+0.5,1.9,1.4,0.18,1.6,BLK);bx(16.0,y+0.25,1.9,0.12,0.5,0.12,BLK);bx(16.0,y+0.62,2.7,1.3,0.04,0.2,WH);bx(16.0,y+0.72,1.6,1.3,0.5,0.06,BLK,false,0.0);
  bx(24.6,y+0.25,2.2,0.5,0.4,0.5,[0.85,0.12,0.2]);bx(24.0,y+0.4,2.5,0.36,0.22,0.36,[0.85,0.12,0.2]);bx(25.2,y+0.4,2.5,0.36,0.22,0.36,[0.85,0.12,0.2]);for(const [x,yy] of [[24.0,0.85],[25.3,0.95]])bx(x,y+yy,2.0,0.4,0.02,0.4,GOLDC);
  B.box(A.mul(A.mul(A.T(27.75+O,y+0.85,2.5+O),A.RZ(-0.18)),A.S(0.36,1.6,0.16)),[0.55,0.28,0.1]);bx(22.5,y+0.7,3.95,0.04,1.4,0.04,CH);bx(22.5,y+1.42,3.95,0.08,0.12,0.08,BLK);}
 mallSign(B,22.5+O,2.45,1.15+O,['LA PERLA LOUNGE'],PINK,0.38,GOLDC);
 for(const [x,z] of CAS_LOUNGE){bx(x,0.36,z,0.12,0.72,0.12,GOLDD);bx(x,0.72,z,0.8,0.04,0.8,BLK);bx(x,0.82,z,0.08,0.16,0.08,[1.2,0.9,0.5],true);for(const s of [-1,1])casChair(B,x+s*0.7+O,z+O,s>0?-Math.PI/2:Math.PI/2,RED);}
 /* ===== SALON PRIVE: glass with gold frames, a chandelier, a sofa, the sign ===== */
 for(let z=0;z<11;z++)for(let x=33;x<45;x++){const c=g.rows[z+O]&&g.rows[z+O][x+O];if(c!=='H')continue;const ew=g.rows[z+O][x+O-1]==='H'||g.rows[z+O][x+O+1]==='H';
  if(ew&&z===10){bx(x+0.5,2.6,10.5,1,0.08,0.12,GOLDD);bx(x,1.45,10.5,0.06,2.3,0.06,GOLDD);}else{bx(33.5,2.6,z+0.5,0.12,0.08,1,GOLDD);bx(33.5,1.45,z,0.06,2.3,0.06,GOLDD);}}
 mallSign(B,38.5+O,2.9,10.62+O,['SALON PRIVE'],[0.85,0.75,1],0.36,GOLDC);
 for(const s of [-1,1]){bx(38.5+s*1.6,0.45,10.8,0.08,0.9,0.08,GOLDC);bx(38.5+s*1.6,0.92,10.8,0.14,0.08,0.14,GOLDC);}
 bx(42.6,0.3,1.6,1.4,0.36,0.9,[0.2,0.16,0.3]);bx(42.6,0.62,1.2,1.4,0.5,0.14,[0.2,0.16,0.3]);
 /* ===== the slot banks: cabinets on a plinth, a sign over each end ===== */
 for(const bxx of [4.6,8.6]){const den=bxx<6?5:25,K=CAS_SLOTKIND[den];bx(bxx,0.08,15.45,1.3,0.16,9.3,BLK);bx(bxx,0.95,15.45,0.08,1.9,9.2,[0.1,0.08,0.12]);
  for(const zz of [10.55,20.35]){bx(bxx,1.75,zz,1.3,0.6,0.12,BLK);mallWord(B,'$'+den,bxx+O,1.66,zz+(zz<15?-0.07:0.07)+O,0.3,K.col);}}
 for(const m of CAS_SLOTS){const K=CAS_SLOTKIND[m.den],s=m.side,x=m.x;bx(x,0.75,m.z,0.5,1.5,0.8,[0.12,0.1,0.14]);bx(x+s*0.26,0.86,m.z,0.04,0.16,0.62,K.col.map(v=>v*0.5));bx(x+s*0.27,1.55,m.z,0.03,0.12,0.7,K.col,true);
  bx(x+s*0.3,0.88,m.z,0.12,0.04,0.5,[0.25,0.22,0.28]);bx(x+s*0.27,0.32,m.z,0.03,0.2,0.4,[0.75,0.7,0.6]);bx(x+s*0.05,1.0,m.z+0.42,0.04,0.04,0.04,CH);bx(x+s*0.05,1.35,m.z+0.42,0.03,0.7,0.03,CH);bx(x+s*0.05,1.72,m.z+0.42,0.09,0.09,0.09,[1,0.15,0.2]);
  const st=casSlotSeat(m);casStool(B,st.x+O,st.z+O,0.55);}
 /* ===== the tables ===== */
 for(const t of CAS_TABLES){const x=t.x,z=t.z;
  if(t.game==='bj'){/* half moon: felt with a padded rail, chip tray, discard holder, the shoe */
   const F=t.vip?[0.1,0.1,0.35]:FELT;for(let k=0;k<7;k++){const a=-1.25+k*(2.5/6),w=0.62;B.box(A.mul(A.mul(A.T(x+O+Math.sin(a)*0.55,0.8,z+O-0.35+Math.cos(a)*0.55),A.RY(a)),A.S(w,0.06,1.1)),F);}
   bx(x,0.79,z-0.45,2.6,0.07,0.3,F);for(let k=0;k<9;k++){const a=-1.3+k*(2.6/8);B.box(A.mul(A.mul(A.T(x+O+Math.sin(a)*1.18,0.84,z+O-0.35+Math.cos(a)*1.0),A.RY(a)),A.S(0.48,0.1,0.14)),[0.18,0.08,0.05]);}
   bx(x,0.4,z-0.1,1.6,0.8,0.7,WOOD);bx(x,0.84,z-0.52,0.9,0.04,0.18,BLK);for(let k=0;k<6;k++)bx(x-0.35+k*0.14,0.88,z-0.52,0.1,0.04,0.12,[[0.9,0.1,0.1],[0.1,0.3,0.9],[0.95,0.95,0.95],[0.1,0.6,0.2],[0.1,0.1,0.1],[0.9,0.6,0.1]][k]);
   bx(x+0.85,0.9,z-0.4,0.24,0.14,0.32,[0.12,0.3,0.2]);bx(x-0.85,0.9,z-0.42,0.2,0.12,0.2,[0.6,0.1,0.1]);
   for(const [dx,dz] of CAS_SEATS.bj)bx(x+dx*0.8,0.835,z+dz*0.45-0.15,0.2,0.005,0.2,[1,1,1]);mallWord(B,t.vip?'$500':'$'+t.min,x+O,0.84,z+O-0.1,0.0001,GOLDC);}
  else if(t.game==='roul'){/* the layout (red and black squares), the wheel at the east end in its wooden bowl */
   const F=t.vip?[0.1,0.1,0.35]:FELT;bx(x,0.42,z,3.0,0.84,1.3,WOOD);bx(x,0.86,z,3.1,0.04,1.4,[0.22,0.1,0.05]);bx(x-0.35,0.885,z,2.2,0.01,1.1,F);
   for(let c=0;c<12;c++)for(let r=0;r<3;r++){const n=3*c+3-r;bx(x-1.25+c*0.16+0.08,0.892,z-0.3+r*0.22,0.14,0.006,0.2,CAS_RED.has(n)?[0.75,0.06,0.08]:[0.06,0.06,0.06]);}
   bx(x-1.4,0.892,z-0.08,0.12,0.006,0.62,[0.05,0.5,0.2]);for(let k=0;k<3;k++)bx(x-1.25+k*0.64+0.32,0.892,z+0.42,0.6,0.006,0.16,F.map(v=>v*1.4));
   bx(x+1.08,0.93,z,0.78,0.12,0.78,[0.3,0.14,0.06]);}
  else{/* craps: a long bathtub table, padded rail, the felt's pass line, the field, point boxes */
   bx(x,0.42,z,4.4,0.84,1.9,WOOD);for(const s of [-1,1]){bx(x,0.9,z+s*0.98,4.6,0.12,0.14,[0.2,0.09,0.05]);bx(x+s*2.23,0.9,z,0.14,0.12,2.1,[0.2,0.09,0.05]);}bx(x,0.86,z,4.3,0.02,1.8,FELT);
   bx(x,0.875,z+0.62,3.8,0.006,0.06,WH);bx(x,0.875,z+0.25,2.8,0.006,0.36,[0.85,0.7,0.2]);for(let k=0;k<6;k++){bx(x-1.5+k*0.6,0.875,z-0.35,0.5,0.006,0.36,[0.06,0.3,0.16]);bx(x-1.5+k*0.6,0.88,z-0.35,0.32,0.006,0.04,WH);}
   for(const s of [-1,1])bx(x+s*2.05,1.0,z,0.12,0.24,1.8,[0.2,0.09,0.05]);}
  /* a low brass lamp over every table and the limit sign */
  const sx=t.game==='craps'?x+2.6:x-1.5;bx(sx,0.5,z-0.8,0.04,1.0,0.04,CH);bx(sx,1.15,z-0.8,0.5,0.3,0.04,BLK);mallWord(B,'$'+t.min,sx+O,1.1,z-0.77+O,0.12,t.vip?[0.85,0.75,1]:GOLDC);}
 /* stools at the tables: the regulars' and yours */
 for(const t of CAS_TABLES){if(t.game==='craps')continue;for(const [dx,dz] of CAS_SEATS[t.game])casStool(B,t.x+dx+O,t.z+dz+O,0.45);}
 bx(22.5,0.5,11.0,1.4,1.0,0.6,WOOD);bx(22.5,1.02,11.0,1.5,0.04,0.7,GOLDC);
 /* ===== the bar: the counter, the back bar of bottles, stools, the lounge ===== */
 {const b=CAS_BAR,zc=(b.z0+b.z1)/2,L=b.z1-b.z0;bx(b.x,0.52,zc,0.8,1.04,L,[0.32,0.05,0.1]);bx(b.x,1.06,zc,0.95,0.06,L+0.1,BLK);bx(b.x-0.41,0.2,zc,0.02,0.06,L,GOLDC,true);bx(b.x-0.41,0.75,zc,0.02,0.04,L,GOLDC);
  bx(43.55,0.55,17,0.6,1.1,9.6,WOOD);for(let k=0;k<3;k++)bx(43.6,1.35+k*0.42,17,0.4,0.03,9.4,CH);
  for(let k=0;k<3;k++)for(let i=0;i<30;i++){const zz=12.5+i*0.32;bx(43.6,1.5+k*0.42,zz,0.08,0.24+((i+k)%3)*0.05,0.08,[[0.4,0.75,0.3],[0.85,0.55,0.15],[0.9,0.9,0.95],[0.6,0.1,0.15],[0.3,0.5,0.9]][(i*7+k)%5],(i+k)%4===0);}
  bx(43.95,2.35,17,0.04,0.5,6,BLK);mallWord(B,'BAR',43.9+O,2.15,17+O,0.0001,PINK);
  for(const s of CAS_STOOLS)casStool(B,s.x+O,s.z+O,0.72);
  for(const s of CAS_SOFAS)bx(s.x-0.1,0.22,s.z,0.8,0.44,1.0,[0.55,0.08,0.18]);for(const zz of [16.4,19.6])bx(35.1,0.5,zz,0.3,0.6,2.2,[0.55,0.08,0.18]);
  bx(36.9,0.24,17.6,0.9,0.04,2.4,[0.1,0.1,0.12]);bx(36.9,0.12,17.6,0.8,0.24,2.2,GOLDD);}
 mallSign(B,38.5+O,2.8,11.6+O,['THE PEARL BAR'],PINK,0.32,CYAN);
 B.round=r0;}
/* a little bar stool / table stool: chrome post, red cushion */
function casStool(B,x,z,h){B.box(TRS(x,h/2,z,0,0.05,h,0.05),[0.78,0.8,0.84]);B.box(TRS(x,0.02,z,0,0.32,0.04,0.32),[0.6,0.6,0.64]);B.box(TRS(x,h+0.04,z,0,0.36,0.08,0.36),[0.62,0.06,0.14]);}
function casChair(B,x,z,a,col){const c=Math.cos(a),s=Math.sin(a),P=(dx,y,dz,sx,sy,sz,cc)=>B.box(TRS(x+dx*c+dz*s,y,z-dx*s+dz*c,a,sx,sy,sz),cc);P(0,0.42,0,0.42,0.08,0.42,col);P(0,0.7,-0.2,0.42,0.5,0.06,col);P(0,0.2,0,0.06,0.4,0.06,[0.75,0.55,0.18]);}

/* ---------- drawing: per frame (bulbs, slot reels, the wheels, dice, the waitress's tray) ---------- */
function casDyn(B,g){const O=1,C=g.casino;if(!C)return;const T=C.T,bl=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x+O,y,z+O,0,sx,sy,sz),c,!!em);
 /* marquee bulbs chase round the sign */
 for(let i=0;i<26;i++){const on=((i+Math.floor(T*6))%4)<2,x=17.7+i*0.38;bl(x,2.36,27.2,0.08,0.08,0.06,on?[1.4,1.2,0.6]:[0.3,0.25,0.15],on);bl(x,3.74,27.2,0.08,0.08,0.06,on?[1.4,1.2,0.6]:[0.3,0.25,0.15],on);}
 /* slot screens and the toppers blink */
 for(const m of CAS_SLOTS){const K=CAS_SLOTKIND[m.den],f=0.6+0.4*Math.sin(T*(2+m.i%3)+m.i),s=m.side;bl(m.x+s*0.27,1.18,m.z,0.02,0.34,0.54,[0.9*f,0.9*f,1.0*f],true);
  for(let r=0;r<3;r++)bl(m.x+s*0.285,1.18,m.z-0.17+r*0.17,0.01,0.12,0.1,CAS_SYMC[(m.i*3+r+Math.floor(T*(CAS_SLOT_BUSY.has(m.i)?3:0.3)))%CAS_SYMC.length],true);
  if(((m.i*7+Math.floor(T*2))%9)===0)bl(m.x,1.85,m.z,0.36,0.1,0.36,K.col,true);}
 /* the progressive jackpot boards over each bank */
 for(const [bxx,den] of [[4.6,5],[8.6,25]]){const f=0.75+0.25*Math.sin(T*3+den);bl(bxx,2.02,15.45,0.06,0.22,1.6,CAS_SLOTKIND[den].col.map(v=>v*f),true);}
 /* roulette wheels turn, the balls ride the rim */
 for(const t of CAS_TABLES){if(t.game!=='roul')continue;const wx=t.x+1.08+O,wz=t.z+O,sp=T*0.8+t.x;
  for(let i=0;i<8;i++){const a=sp+i*TAU/8;B.box(TRS(wx+Math.cos(a)*0.22,1.0,wz+Math.sin(a)*0.22,-a,0.3,0.02,0.05,0),i%2?[0.7,0.05,0.08]:[0.05,0.05,0.05]);}
  B.box(TRS(wx,1.02,wz,0,0.12,0.06,0.12),[1,0.8,0.32]);const ba=-T*2.4+t.z;B.box(TRS(wx+Math.cos(ba)*0.33,1.02,wz+Math.sin(ba)*0.33,0,0.04,0.04,0.04),[1.2,1.2,1.2],true);}
 /* the dice on the craps felt, now and then rolled down the table */
 {const t=CAS_TABLES[2],ph=(T*0.25)%1,x=t.x+O+(ph<0.3?1.6-ph*8:-0.8),z=t.z+O-0.1;for(const dz of [-0.12,0.12])B.box(TRS(x,0.93,z+dz,ph*20,0.1,0.1,0.1),[0.9,0.1,0.12]);}
 /* the waitress carries a tray of drinks */
 const w=C.wait;if(w){const hx=w.x+Math.sin(w.a)*0.25+Math.cos(w.a)*0.22,hz=w.z+Math.cos(w.a)*0.25-Math.sin(w.a)*0.22;B.box(TRS(hx,1.22,hz,0,0.36,0.02,0.36),[0.85,0.85,0.88]);for(const [dx,dz,c] of [[-0.08,-0.06,[1,0.4,0.6]],[0.09,0.04,[0.4,0.9,1]],[0,0.1,[1,0.85,0.3]]])B.box(TRS(hx+dx,1.31,hz+dz,0,0.06,0.16,0.06),c,true);}
 /* the stage spotlight on the singer */
 const sg=C.singer;if(sg){const f=0.85+0.15*Math.sin(T*1.7);for(const [r,k] of [[1.3,0.18],[0.8,0.3]])B.box(TRS(sg.x,0.445+k*0.01,sg.z,0,r,0.004,r),[0.9*k*f*2,0.75*k*f*2,0.45*k*f*2],true);}}

/* =====================================================================================
   THE GAMES: one screen, a canvas table and buttons. CS holds the state of whatever you are playing.
   ===================================================================================== */
const CAS_RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const CAS_WHEEL=['0',28,9,26,30,11,7,20,32,17,5,22,34,15,3,24,36,13,1,'00',27,10,25,29,12,8,19,31,18,6,21,33,16,4,23,35,14,2];
const CAS_SYM=['cherry','bell','bar','dbar','seven','pearl','blank'],CAS_SYMW=[5,6,6,4,2,1,8];
const CAS_SYMC=[[1,0.2,0.25],[1,0.85,0.25],[0.95,0.95,0.95],[0.3,0.3,0.35],[1,0.15,0.2],[0.9,0.9,1.1],[0.4,0.4,0.45]];
/* the reel strip: every symbol as often as its weight, in a fixed shuffle (the same strip on every machine) */
const CAS_STRIP=(()=>{const s=[];CAS_SYM.forEach((k,i)=>{for(let n=0;n<CAS_SYMW[i];n++)s.push(k);});let q=7;for(let i=s.length-1;i>0;i--){q=(q*16807)%2147483647;const j=q%(i+1);[s[i],s[j]]=[s[j],s[i]];}return s;})();
const CAS_PAY=[['pearl',3,600,'3 × PEARL'],['seven',3,80,'3 × SEVEN'],['dbar',3,30,'3 × DOUBLE BAR'],['bar',3,15,'3 × BAR'],['bell',3,12,'3 × BELL'],['cherry',3,10,'3 × CHERRY'],['anybar',3,4,'ANY 3 BARS'],['cherry',2,3,'2 × CHERRY'],['cherry',1,1,'1 × CHERRY']];
function casSlotPay(r){const c=k=>r.filter(x=>x===k).length;for(const [k,n,m,lbl] of CAS_PAY){if(k==='anybar'){if(c('bar')+c('dbar')===3)return {m,lbl};continue;}if(n===3?c(k)===3:c(k)===n)return {m,lbl,k};}return null;}
const CS={on:false,game:null,tb:null,chip:0,msg:'',busy:0,q:[],pad:{},raf:0,flash:null,cur:0};
const CAS_CHIPS=[5,25,100,500,1000,5000,10000];
function casChipSet(tb){const m=tb.min;return CAS_CHIPS.filter(v=>v>=m&&v<=tb.max).slice(0,5);}

/* ---------- the screen ---------- */
function casEnsure(){if(document.getElementById('sCasino'))return;
 const st=document.createElement('style');st.textContent=`#sCasino .csBox{display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;max-height:100%;padding:6px 8px;box-sizing:border-box}
#sCasino .csHead{display:flex;justify-content:space-between;align-items:flex-end;width:min(96vw,960px);gap:8px}
#sCasino canvas{position:static;inset:auto;z-index:auto;display:block;max-width:min(96vw,960px);max-height:calc(100vh - 215px);width:auto;height:auto;border:3px solid #d8b060;border-radius:10px;box-shadow:0 0 24px rgba(255,111,174,.55);touch-action:none;background:#0a3a22}
#sCasino .csRow{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;width:min(96vw,960px)}
#sCasino .csRow .btn{margin:0;padding:8px 12px;font-size:clamp(11px,1.6vw,15px);min-width:64px;min-height:40px}
#sCasino .chip{width:46px;height:46px;border-radius:50%;border:4px dashed #fff;color:#fff;font:bold 12px monospace;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 0 #000;user-select:none;-webkit-user-select:none}
#sCasino .chip.sel{outline:3px solid #ffd36b;outline-offset:2px;transform:translateY(-3px)}
#sCasino .csBox>*{flex-shrink:0}
#sCasino .csMsg{color:#ffe9a8;font:18px VT323,monospace;min-height:20px;text-align:center}
@media (max-height:430px){#sCasino .csBox{gap:3px;padding:3px 8px}#sCasino canvas{max-height:calc(100vh - 165px)}#sCasino .chip.sel{transform:none}#sCasino .shT{font-size:16px}#sCasino .shS{display:none}#sCasino .csRow .btn{min-height:34px;padding:5px 9px}#sCasino .chip{width:38px;height:38px;font-size:10px}#sCasino .csMsg{min-height:0;font-size:15px}}`;
 document.head.appendChild(st);
 const d=document.createElement('div');d.id='sCasino';d.className='screen dim';
 d.innerHTML='<div class="csBox"><div class="csHead"><div><div class="shT" id="csT"></div><div class="shS" id="csS"></div></div><div class="shW" id="csW"></div></div><canvas id="csCv" width="960" height="540"></canvas><div class="csMsg" id="csMsg"></div><div class="csRow" id="csChips"></div><div class="csRow" id="csActs"></div></div>';
 document.body.appendChild(d);if(typeof SCREENS!=='undefined'&&!SCREENS.includes('sCasino'))SCREENS.push('sCasino');
 const cv=document.getElementById('csCv');cv.addEventListener('pointerdown',e=>{e.preventDefault();const r=cv.getBoundingClientRect();casTap((e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height);});
 window.addEventListener('keydown',e=>{if(state!=='casino')return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;casKey(e.code);},true);}
function casOpen(game,tb){if(!G)return;casEnsure();casProg();
 Object.assign(CS,{on:true,game,tb,msg:'',busy:0,q:[],pad:{},flash:null,cur:0,bets:{},last:null,dealt:new Map(),tick:null});const ch=casChipSet(tb);CS.chips=ch;CS.chip=ch[0];
 CAS_G[game].init();state='casino';show('sCasino');sfx('pick');casDealerSay('hi');casUI();cancelAnimationFrame(CS.raf);CS.raf=requestAnimationFrame(casLoop);}
function casClose(){if(state!=='casino')return;const G0=CAS_G[CS.game];if(G0&&G0.finish)G0.finish();cancelAnimationFrame(CS.raf);CS.on=false;state='play';show(null);sfx('blip');
 const g=G;if(g&&g.seatP)seatUp(g);if(g&&CS.tb&&CS.tb.id){const d=g.casino&&g.casino.dealers[CS.tb.id];if(d)popup(d.x,d.z-0.3,pick(['"COME BACK SOON."','"GOOD LUCK OUT THERE."','"THANK YOU, SIR."']),'#ffe9a8');}saveProg();}
function casDealerSay(k){const L={hi:['Welcome to the table.','Place your bets.','Good evening, sir.'],win:['Winner!','Nicely done.','Pay the gentleman.'],lose:['House wins.','Better luck next hand.','Ooh. Close.'],push:['Push.','Nobody wins. Nobody loses.']}[k];CS.say=pick(L);}
/* wallet helpers: a bet goes down only if you have it and it fits the table */
function casCan(v){return wallet()>=v;}
function casTake(v){const p=myProg();p.wallet-=v;}
function casGive(v){if(v>0){myProg().wallet+=v;}}
function casMsg(s){CS.msg=s;const el=document.getElementById('csMsg');if(el)el.textContent=s;}
function casUI(){const G0=CAS_G[CS.game],tb=CS.tb;document.getElementById('csT').textContent=G0.title(tb);document.getElementById('csS').textContent=G0.sub(tb);
 document.getElementById('csW').textContent='$'+fmt(wallet());casMsg(CS.msg);
 const ch=document.getElementById('csChips');if(G0.chips){const cols={5:'#d8202a',25:'#1a8a3a',100:'#18181c',500:'#7a2ab0',1000:'#d8a020',5000:'#e86aa8',10000:'#2a6ad8'};
  ch.innerHTML=CS.chips.map((v,i)=>`<div class="chip${v===CS.chip?' sel':''}" data-chip="${v}" style="background:${cols[v]}">${v>=1000?v/1000+'K':v}</div>`).join('');ch.style.display='';
  ch.querySelectorAll('[data-chip]').forEach(el=>el.onclick=()=>casPickChip(+el.dataset.chip));}else{ch.innerHTML='';ch.style.display='none';}
 const acts=G0.acts().concat([{id:'leave',lbl:'LEAVE',k:'ESC',p:'B',fn:casClose,alt:1}]);CS.acts=acts;
 const ar=document.getElementById('csActs');ar.innerHTML=acts.map((a,i)=>`<button class="btn${a.alt?' alt':''}" data-a="${i}"${a.dis?' disabled style="opacity:.45"':''}>${a.lbl}${a.k?`<span class="kbhint"> (${a.k})</span>`:''}${a.p?`<span class="padhint"> (${a.p})</span>`:''}</button>`).join('');
 ar.querySelectorAll('[data-a]').forEach(el=>el.onclick=()=>{const a=CS.acts[+el.dataset.a];if(a&&!a.dis&&!CS.busy)a.fn();else if(a&&a.id==='leave')a.fn();});}
function casPickChip(v){CS.chip=v;sfx('click');const G0=CAS_G[CS.game];if(G0.chipTap)G0.chipTap(v);casUI();}
function casKey(c){if(c==='Escape'||c==='Backspace'){casClose();return;}const m=/^Digit([1-9])$/.exec(c);if(m&&CS.chips[+m[1]-1]){casPickChip(CS.chips[+m[1]-1]);return;}
 const a=(CS.acts||[]).find(q=>q.code&&q.code.includes(c));if(a&&!a.dis&&!CS.busy){a.fn();return;}
 const G0=CAS_G[CS.game];if(G0.key)G0.key(c);}
function casTap(x,y){if(CS.busy)return;const G0=CAS_G[CS.game];if(G0.tap)G0.tap(x,y);}
/* timed steps (card by card, reel by reel): buttons wait until the queue is empty */
function casQ(ms,fn){const t0=CS.q.length?CS.q[CS.q.length-1].at:performance.now();CS.q.push({at:t0+ms,fn});CS.busy=1;}
function casLoop(now){if(state!=='casino')return;while(CS.q.length&&now>=CS.q[0].at){const s=CS.q.shift();s.fn();if(!CS.q.length){CS.busy=0;casUI();}}
 const gp=navigator.getGamepads?Array.from(navigator.getGamepads()).find(x=>x):null;
 if(gp){const b=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed),cur={a:b(0),b:b(1),x:b(2),y:b(3),lb:b(4),rb:b(5),l:b(14),r:b(15),u:b(12),d:b(13)},prev=CS.pad;CS.pad=cur;const hit=k=>cur[k]&&!prev[k];
  if(hit('b')){casClose();return;}
  if(hit('lb')||hit('rb')){const i=CS.chips.indexOf(CS.chip),j=clamp(i+(hit('rb')?1:-1),0,CS.chips.length-1);if(j!==i)casPickChip(CS.chips[j]);}
  for(const k of ['a','x','y']){if(!hit(k))continue;const a=(CS.acts||[]).find(q=>q.p===k.toUpperCase());if(a&&!a.dis&&!CS.busy)a.fn();}
  const G0=CAS_G[CS.game];if(G0.padDir)for(const [k,dx,dy] of [['l',-1,0],['r',1,0],['u',0,-1],['d',0,1]])if(hit(k))G0.padDir(dx,dy);}
 casDraw(now);CS.raf=requestAnimationFrame(casLoop);}
function casDraw(now){const cv=document.getElementById('csCv');if(!cv)return;const x=cv.getContext('2d'),W=cv.width,H=cv.height;
 CAS_G[CS.game].draw(x,W,H,now);
 if(CS.say){const at=CAS_G[CS.game].sayAt;x.font='bold 18px Georgia,serif';x.textAlign='center';const tw=x.measureText('DEALER: '+CS.say).width+24,sx=at?at[0]:22+tw/2,sy=at?at[1]:H-26;x.fillStyle='rgba(0,0,0,.6)';casRR(x,sx-tw/2,sy-20,tw,28,8);x.fill();x.fillStyle='#ffe9a8';x.fillText('DEALER: '+CS.say,sx,sy);}
 const F=CS.flash;if(F&&now-F.t<2600){const k=Math.min(1,(now-F.t)/200)*Math.max(0,Math.min(1,(2600-(now-F.t))/400));x.globalAlpha=k;x.fillStyle='rgba(10,4,18,.8)';x.fillRect(0,H/2-46,W,92);x.font='bold 40px monospace';x.textAlign='center';x.fillStyle=F.col||'#7dff9a';x.fillText(F.txt,W/2,H/2+14);x.globalAlpha=1;}
 const w=document.getElementById('csW'),s='$'+fmt(wallet());if(w&&w.textContent!==s)w.textContent=s;}
function casWin(txt,col){CS.flash={txt,col:col||'#7dff9a',t:performance.now()};}
/* ---------- table art: cloth with a nap and a padded leather rail (painted once, cached), chips with edge spots, real cards ---------- */
const CAS_ART={};
function casCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function casRR(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath();}
const casRGB=c=>Array.isArray(c)?'rgb('+c.map(v=>Math.max(0,Math.min(255,v*255|0))).join(',')+')':(c||'#888');
function casFeltTex(W,H,col){const k='felt'+col+W+'x'+H;if(CAS_ART[k])return CAS_ART[k];const c=casCanvas(W,H),x=c.getContext('2d');
 const dark=col==='#1a2a78'?'#060c2c':'#04261a';
 const gr=x.createRadialGradient(W/2,H*0.42,30,W/2,H*0.5,W*0.72);gr.addColorStop(0,col);gr.addColorStop(1,dark);x.fillStyle=gr;x.fillRect(0,0,W,H);
 /* the nap of the cloth */
 let s=12345;const r=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let i=0;i<24000;i++){x.fillStyle=r()<0.5?'rgba(255,255,255,.035)':'rgba(0,0,0,.07)';x.fillRect(r()*W,r()*H,1+r()*1.6,1);}
 /* the lamp over the table */
 const lg=x.createRadialGradient(W/2,H*0.38,10,W/2,H*0.4,W*0.55);lg.addColorStop(0,'rgba(255,236,190,.17)');lg.addColorStop(1,'rgba(255,236,190,0)');x.fillStyle=lg;x.fillRect(0,0,W,H);
 /* the padded rail: dark leather, a sheen along the top, a brass trim where it meets the cloth */
 const R=20;x.lineJoin='round';x.lineWidth=R;const rg=x.createLinearGradient(0,0,0,H);rg.addColorStop(0,'#3a1608');rg.addColorStop(0.5,'#5c2610');rg.addColorStop(1,'#260c04');x.strokeStyle=rg;casRR(x,R/2,R/2,W-R,H-R,24);x.stroke();
 x.lineWidth=3;x.strokeStyle='rgba(255,220,170,.2)';casRR(x,6,6,W-12,H-12,20);x.stroke();
 x.lineWidth=8;x.strokeStyle='rgba(0,0,0,.28)';casRR(x,R+5,R+5,W-2*R-10,H-2*R-10,12);x.stroke();
 x.lineWidth=2.5;x.strokeStyle='#d8b060';casRR(x,R+1,R+1,W-2*R-2,H-2*R-2,14);x.stroke();
 x.font='bold 13px Georgia,serif';x.textAlign='center';x.fillStyle='rgba(216,176,96,.55)';x.fillText('CASINO  LA  PERLA  ·  MIAMI BEACH',W/2,R+19);
 return CAS_ART[k]=c;}
function casFelt(x,W,H,col){x.drawImage(casFeltTex(W,H,col||'#13784a'),0,0);}
const CAS_CHIPC={5:'#d8202a',25:'#1a8a3a',100:'#18181c',500:'#7a2ab0',1000:'#d8a020',5000:'#e86aa8',10000:'#2a6ad8'};
const casAmt=v=>v>=1000?(Math.round(v/100)/10)+'K':String(v);
/* one chip seen from above: the colour, six edge spots, the dashed inlay, a light sheen */
function casChip1(x,cx,cy,r,col){x.fillStyle=col;x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();
 x.fillStyle='rgba(255,255,255,.92)';for(let i=0;i<6;i++){const a=i*TAU/6;x.beginPath();x.arc(cx,cy,r,a-0.2,a+0.2);x.arc(cx,cy,r*0.74,a+0.2,a-0.2,true);x.closePath();x.fill();}
 x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=Math.max(1,r*0.07);x.setLineDash([r*0.2,r*0.14]);x.beginPath();x.arc(cx,cy,r*0.6,0,TAU);x.stroke();x.setLineDash([]);
 const hg=x.createRadialGradient(cx-r*0.4,cy-r*0.5,1,cx,cy,r);hg.addColorStop(0,'rgba(255,255,255,.35)');hg.addColorStop(0.55,'rgba(255,255,255,0)');hg.addColorStop(1,'rgba(0,0,0,.28)');x.fillStyle=hg;x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();}
/* a stack: the amount broken into chips, biggest at the bottom, the total on top (col: a player's own roulette colour) */
function casChipDraw(x,cx,cy,v,r,col){r=r||16;const L=[];let left=v;for(let i=CAS_CHIPS.length-1;i>=0&&L.length<7;i--)while(left>=CAS_CHIPS[i]&&L.length<7){L.push(CAS_CHIPS[i]);left-=CAS_CHIPS[i];}if(!L.length)L.push(5);
 const dy=Math.max(2,r*0.2);x.fillStyle='rgba(0,0,0,.38)';x.beginPath();x.ellipse(cx+3,cy+4,r*1.05,r*0.95,0,0,TAU);x.fill();
 L.forEach((d,i)=>{const y=cy-i*dy;x.fillStyle='rgba(0,0,0,.5)';x.beginPath();x.arc(cx,y+dy*0.7,r,0,TAU);x.fill();casChip1(x,cx,y,r,col||CAS_CHIPC[d]);});
 const ty=cy-(L.length-1)*dy,s=casAmt(v);x.font='bold '+(r*0.6|0)+'px monospace';x.textAlign='center';x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.65)';x.strokeText(s,cx,ty+r*0.22);x.fillStyle='#fff';x.fillText(s,cx,ty+r*0.22);}
/* cards: faces and the La Perla back are painted once each, then copied */
const CAS_PIPS={'2':[[0,-1],[0,1]],'3':[[0,-1],[0,0],[0,1]],'4':[[-1,-1],[1,-1],[-1,1],[1,1]],'5':[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],'6':[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]],
 '7':[[-1,-1],[1,-1],[0,-0.5],[-1,0],[1,0],[-1,1],[1,1]],'8':[[-1,-1],[1,-1],[0,-0.5],[-1,0],[1,0],[0,0.5],[-1,1],[1,1]],'9':[[-1,-1],[1,-1],[-1,-0.33],[1,-0.33],[0,0],[-1,0.33],[1,0.33],[-1,1],[1,1]],
 '10':[[-1,-1],[1,-1],[0,-0.66],[-1,-0.33],[1,-0.33],[-1,0.33],[1,0.33],[0,0.66],[-1,1],[1,1]]};
function casCardBack(){if(CAS_ART.back)return CAS_ART.back;const w=76,h=108,c=casCanvas(w,h),x=c.getContext('2d');
 casRR(x,0.5,0.5,w-1,h-1,7);x.fillStyle='#fbfaf6';x.fill();casRR(x,4,4,w-8,h-8,5);x.fillStyle='#a01424';x.fill();x.save();x.clip();
 x.strokeStyle='rgba(255,210,150,.4)';x.lineWidth=1;for(let i=-h;i<w+h;i+=8){x.beginPath();x.moveTo(i,0);x.lineTo(i+h,h);x.moveTo(i+h,0);x.lineTo(i,h);x.stroke();}x.restore();
 x.strokeStyle='#d8b060';x.lineWidth=1.5;casRR(x,8,8,w-16,h-16,4);x.stroke();
 x.fillStyle='#1a0a14';x.beginPath();x.arc(w/2,h/2,15,0,TAU);x.fill();const pg=x.createRadialGradient(w/2-4,h/2-4,1,w/2,h/2,11);pg.addColorStop(0,'#fff');pg.addColorStop(0.7,'#e8dcf0');pg.addColorStop(1,'#9a8ab0');x.fillStyle=pg;x.beginPath();x.arc(w/2,h/2,11,0,TAU);x.fill();
 return CAS_ART.back=c;}
function casCardFace(c){const k='card'+c.r+c.su;if(CAS_ART[k])return CAS_ART[k];const w=76,h=108,cv=casCanvas(w,h),x=cv.getContext('2d'),red=c.su==='♥'||c.su==='♦',ink=red?'#c8101e':'#16161a';
 casRR(x,0.5,0.5,w-1,h-1,7);const fg=x.createLinearGradient(0,0,w,h);fg.addColorStop(0,'#ffffff');fg.addColorStop(1,'#ece7da');x.fillStyle=fg;x.fill();x.strokeStyle='#b0a898';x.lineWidth=1;x.stroke();
 x.fillStyle=ink;x.textAlign='center';const idx=()=>{x.font='bold '+(c.r==='10'?15:18)+'px Georgia,serif';x.fillText(c.r,11,19);x.font='14px serif';x.fillText(c.su,11,34);};
 idx();x.save();x.translate(w,h);x.rotate(Math.PI);idx();x.restore();
 if(CAS_PIPS[c.r]){x.font='17px serif';for(const [px,py] of CAS_PIPS[c.r])x.fillText(c.su,w/2+px*14,h/2+py*30+6);}
 else if(c.r==='A'){x.font='48px serif';x.fillText(c.su,w/2,h/2+16);}
 else{/* the court cards: a gold frame, a crown, the letter */
  x.fillStyle=red?'rgba(200,16,30,.1)':'rgba(30,30,80,.1)';x.fillRect(19,16,w-38,h-32);x.strokeStyle='#c89a40';x.lineWidth=2;x.strokeRect(19,16,w-38,h-32);
  x.fillStyle='#d8a838';const cy=33;x.beginPath();x.moveTo(w/2-12,cy+8);x.lineTo(w/2-12,cy-3);x.lineTo(w/2-6,cy+2);x.lineTo(w/2,cy-6);x.lineTo(w/2+6,cy+2);x.lineTo(w/2+12,cy-3);x.lineTo(w/2+12,cy+8);x.closePath();x.fill();
  x.fillStyle=ink;x.font='bold 32px Georgia,serif';x.fillText(c.r,w/2,h/2+17);x.font='15px serif';x.fillText(c.su,w/2,h-24);}
 return CAS_ART[k]=cv;}
/* one card at (cx,cy) top-left; sx from -1 (back) to 1 (face) flips it; sc scales it */
function casCard(x,cx,cy,c,back,sc,sx){sc=sc||1;sx=sx===undefined?1:sx;const w=76*sc,h=108*sc;x.save();x.translate(cx+w/2,cy);x.scale(Math.max(0.03,Math.abs(sx)),1);
 x.fillStyle='rgba(0,0,0,.35)';casRR(x,-w/2+3,4,w,h,7*sc);x.fill();x.drawImage(back||sx<0?casCardBack():casCardFace(c),-w/2,0,w,h);x.restore();}
/* a card slides in from the shoe the first time it is drawn */
function casDealt(x,tx,ty,c,back,sc,now,sx){const D=CS.dealt||(CS.dealt=new Map());if(!D.has(c))D.set(c,now);const k=Math.min(1,(now-D.get(c))/260),e=1-Math.pow(1-k,3);
 const fx=850,fy=60;casCard(x,fx+(tx-fx)*e,fy+(ty-fy)*e,c,back,sc,sx);}

/* ---------- the regulars at your table: the same people who sit there on the floor, with names, chips and moods ---------- */
const CAS_NM={m:['SAL','RICKY','HAL','VINNIE','TEDDY','FRANKIE','MORRIS','ARTIE','EDDIE','LOU','BUDDY','NICKY','JULIO','MANNY'],f:['MARGE','DOLORES','BUNNY','CONSUELO','LORRAINE','GLORIA','PEACHES','ROSALIND','CARMEN','DIXIE','TRUDY','YOLANDA']};
const CAS_PCOL=['#e8c040','#40c8f0','#ff5aa0','#70e070','#ff9a40','#b490ff'];
const CAS_PSAY={win:['Ha! Pay me!','Yes! YES!','Told you, baby.','Lucky shirt!','Mama needs a new fur!','Drinks on me! Kidding.'],lose:['Aw, come on.','Again?!','Unbelievable.','My wife\'s gonna kill me.','This table hates me.','One more. Just one.'],
 bj:['BLACKJACK, BABY!','Twenty-one! Read it and weep!'],bust:['Dammit.','Too many. Too many!','Why did I hit that?'],hi:['Evening.','Pull up a chair, pal.','You feeling lucky?','Watch this one, kid.'],seven:['Seven out... ugh.','Who brought the seven?!'],point:['Point! Point!','That\'s how you shoot!']};
function casPeople(tb){const C=G&&G.casino,L=(C&&C.seated&&C.seated[tb.id])||[];let h=0;for(const ch of String(tb.id))h=(h*31+ch.charCodeAt(0))%997;
 return L.map(({k,n})=>{const lk=(n&&n.look)||{},fem=!!lk.fem,N=CAS_NM[fem?'f':'m'];
  return {k,n,fem,name:N[(h+k*5)%N.length],col:casRGB(lk.jacket),shirt:casRGB(lk.shirt),skin:casRGB(lk.skin||[0.85,0.65,0.5]),hair:casRGB(lk.hair||[0.1,0.08,0.06]),chip:CAS_PCOL[(h+k)%CAS_PCOL.length],
   hand:[],bet:0,bets:{},res:'',net:0,mood:0,moodT:0,say:'',sayT:0};});}
function casSay(P,k){P.say=pick(CAS_PSAY[k]);P.sayT=performance.now();if(k==='win'||k==='bj'||k==='point'){P.mood=1;P.moodT=P.sayT;}else if(k!=='hi'){P.mood=-1;P.moodT=P.sayT;}}
/* someone at the rail, seen from behind: shoulders, the back of the head, both hands on the cushion; hops when they win, slumps when they lose */
function casPersonDraw(x,P,cx,cy,s,now){const dt=now-P.moodT,hop=P.mood>0&&dt<1600?-Math.abs(Math.sin(dt/95))*7*(1-dt/1600):0,slump=P.mood<0&&dt<1800?5*(1-dt/1800):0;cy+=Math.sin(now/650+P.k*1.7)*1.2+hop+slump;
 x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(cx,cy+4*s,50*s,28*s,0,0,TAU);x.fill();
 x.fillStyle=P.col;for(const d of [-1,1]){x.beginPath();x.ellipse(cx+d*31*s,cy-12*s,9*s,22*s,d*0.55,0,TAU);x.fill();}
 x.fillStyle=P.skin;for(const d of [-1,1]){x.beginPath();x.arc(cx+d*40*s,cy-31*s,7*s,0,TAU);x.fill();}
 const sg=x.createLinearGradient(0,cy-18*s,0,cy+34*s);sg.addColorStop(0,P.col);sg.addColorStop(1,'#000');x.fillStyle=sg;x.beginPath();x.ellipse(cx,cy+10*s,45*s,26*s,0,Math.PI,0);x.lineTo(cx+45*s,cy+44*s);x.lineTo(cx-45*s,cy+44*s);x.closePath();x.fill();
 x.fillStyle=P.shirt;x.beginPath();x.moveTo(cx-8*s,cy-12*s);x.lineTo(cx+8*s,cy-12*s);x.lineTo(cx,cy+2*s);x.closePath();x.fill();
 x.fillStyle=P.skin;x.beginPath();x.arc(cx,cy-7*s,16*s,0,TAU);x.fill();x.fillStyle=P.hair;x.beginPath();x.arc(cx,cy-9*s,P.fem?19*s:16*s,0,TAU);x.fill();
 if(P.fem){x.beginPath();x.ellipse(cx,cy+9*s,16*s,15*s,0,0,TAU);x.fill();}
 /* the name on a little brass plate on the rail, and what they just said */
 x.font='bold '+(11*s+2|0)+'px monospace';x.textAlign='center';const tw=x.measureText(P.name).width+12,py=cy-58*s;x.fillStyle='rgba(10,6,4,.7)';casRR(x,cx-tw/2,py-12*s,tw,16*s+2,5);x.fill();x.fillStyle=P.chip;x.fillText(P.name,cx,py+1);
 if(P.say&&now-P.sayT<2600){x.globalAlpha=Math.min(1,(2600-(now-P.sayT))/300);x.font='bold 14px monospace';const sw=x.measureText(P.say).width+16,bx=Math.max(30+sw/2,Math.min(930-sw/2,cx)),by=py-38*s-(P.k%2)*28;
  x.fillStyle='#fff8e8';casRR(x,bx-sw/2,by-16,sw,24,8);x.fill();x.beginPath();x.moveTo(cx-6,by+8);x.lineTo(cx+6,by+8);x.lineTo(cx,by+16);x.closePath();x.fill();x.fillStyle='#2a1020';x.fillText(P.say,bx,by+1);x.globalAlpha=1;}}

/* ---------- casino sounds (short, synthesized on the effects bus) ---------- */
function casSnd(k){try{if(typeof AC==='undefined'||!AC||AC.state!=='running'||!SET.sound||typeof sfxG==='undefined')return;const t=AC.currentTime;
 const tone=(f,dt,dur,v,type)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.value=f;g.gain.setValueAtTime(0.0001,t+dt);g.gain.linearRampToValueAtTime(v,t+dt+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+dt+dur);o.connect(g);g.connect(sfxG);o.start(t+dt);o.stop(t+dt+dur+0.02);};
 const noise=(dt,dur,v,f)=>{if(typeof noiseBuf==='undefined'||!noiseBuf)return;const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseBuf;fl.type='bandpass';fl.frequency.value=f;fl.Q.value=1.2;g.gain.setValueAtTime(v,t+dt);g.gain.exponentialRampToValueAtTime(0.0001,t+dt+dur);s.connect(fl);fl.connect(g);g.connect(sfxG);s.start(t+dt);s.stop(t+dt+dur+0.02);};
 if(k==='card')noise(0,0.07,0.3,3200);
 else if(k==='chip'){noise(0,0.03,0.35,5200);noise(0.04,0.03,0.25,4600);}
 else if(k==='reel')tone(180,0,0.05,0.08,'square');
 else if(k==='stop'){tone(300,0,0.06,0.12,'square');noise(0,0.04,0.2,2000);}
 else if(k==='ball'){for(let i=0;i<10;i++)noise(i*0.09+Math.random()*0.03,0.03,0.18,6000);}
 else if(k==='dice'){for(let i=0;i<5;i++)noise(i*0.07,0.04,0.3,1800+i*300);}
 else if(k==='win'){[523,659,784,1047].forEach((f,i)=>tone(f,i*0.08,0.18,0.08,'square'));}
 else if(k==='jack'){for(let i=0;i<16;i++)tone([523,659,784,1047][i%4]*(i>7?2:1),i*0.07,0.12,0.07,'square');}
 else if(k==='lose')tone(160,0,0.25,0.07,'sawtooth');}catch(e){}}

/* ---------- SLOTS ---------- */
const CAS_SL={coins:1,reels:[0,0,0],spin:null,res:null,win:null};
function slotTitle(tb){return '$'+fmt(tb.den)+' '+CAS_SLOTKIND[tb.den].name;}
function casSlotSpin(){const S=CAS_SL,tb=CS.tb,bet=tb.den*S.coins;if(S.spin)return;if(!casCan(bet)){casMsg('Not enough cash for '+S.coins+' coin'+(S.coins>1?'s':'')+'.');sfx('blip');return;}
 casTake(bet);const c=casProg();c.jp[tb.den]=Math.round((c.jp[tb.den]||tb.den*1000)+bet*0.02);
 const stops=[0,1,2].map(()=>Math.floor(casR()*CAS_STRIP.length)),res=stops.map(i=>CAS_STRIP[i]),now=performance.now();
 S.spin={t0:now,stops,from:S.reels.slice()};S.res=null;S.win=null;casMsg('');CS.say='';casSnd('reel');
 [900,1350,1800].forEach((ms,i)=>casQ(i?450:900,()=>{S.reels[i]=stops[i];casSnd('stop');}));
 casQ(150,()=>{S.spin=null;S.res=res;const hit=casSlotPay(res);let back=0;
  if(hit){if(hit.k==='pearl'&&S.coins===3){back=c.jp[tb.den];c.jp[tb.den]=tb.den*1000;casWin('PROGRESSIVE JACKPOT!  $'+fmt(back),'#ffd36b');casSnd('jack');}
   else{back=hit.m*bet;casWin(hit.lbl+'  +$'+fmt(back),back>=bet*10?'#ffd36b':'#7dff9a');casSnd(back>=bet*10?'jack':'win');}}
  else casSnd('lose');casGive(back);const net=casSettle(bet,back);casMsg(hit?hit.lbl+' pays $'+fmt(back):'No win.');if(back>=bet*20&&G&&G.casino){const n=G.casino.pilar;if(n)popup(n.x,n.z-0.3,'"A WINNER AT THE SLOTS!"','#ffd36b');}});
 casUI();}
const CAS_SLOT={chips:false,title:slotTitle,sub:tb=>'1 TO 3 COINS · 3 COINS FOR THE PROGRESSIVE · $'+fmt(tb.den)+' A COIN',
 init(){CAS_SL.coins=1;CAS_SL.spin=null;CAS_SL.res=null;CAS_SL.win=null;CAS_SL.reels=[3,9,17];casMsg('Bet one to three coins and spin.');},
 acts(){const S=CAS_SL,tb=CS.tb;return [{id:'one',lbl:'BET ONE · '+S.coins+'/3',k:'W',p:'X',code:['KeyW','ArrowUp'],fn:()=>{S.coins=S.coins%3+1;sfx('click');casSnd('chip');casUI();}},
  {id:'max',lbl:'BET MAX',k:'M',p:'Y',code:['KeyM'],fn:()=>{S.coins=3;sfx('click');casSnd('chip');casSlotSpin();}},
  {id:'spin',lbl:'SPIN · $'+fmt(tb.den*S.coins),k:'SPACE',p:'A',code:['Space','Enter','KeyE'],fn:casSlotSpin,dis:!!S.spin}];},
 finish(){while(CS.q.length){const s=CS.q.shift();s.fn();}CS.busy=0;},
 tap(x,y){if(x>60&&x<600&&y>110&&y<430)casSlotSpin();},
 draw(x,W,H,now){const S=CAS_SL,tb=CS.tb,K=CAS_SLOTKIND[tb.den],c=casProg(),col=casRGB(K.col),hit=S.res&&casSlotPay(S.res),hot=!!(hit&&CS.flash&&now-CS.flash.t<2600);
  /* the room behind, the lacquered cabinet with its chrome edge */
  const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#12031a');gr.addColorStop(1,'#34092a');x.fillStyle=gr;x.fillRect(0,0,W,H);
  for(let i=0;i<14;i++){x.fillStyle=`rgba(255,${120+i*8},200,.05)`;x.beginPath();x.arc((i*97)%W,30+(i*53)%120,30+(i%4)*12,0,TAU);x.fill();}
  const cab=x.createLinearGradient(40,0,620,0);cab.addColorStop(0,'#24081e');cab.addColorStop(0.5,'#4c1438');cab.addColorStop(1,'#24081e');x.fillStyle=cab;casRR(x,40,12,580,516,20);x.fill();
  const chr=x.createLinearGradient(0,12,0,528);chr.addColorStop(0,'#f4f6fa');chr.addColorStop(0.5,'#8a8e98');chr.addColorStop(1,'#d8dce4');x.strokeStyle=chr;x.lineWidth=5;casRR(x,40,12,580,516,20);x.stroke();
  /* chasing bulbs round the jackpot board and the reel window (they race on a win) */
  const bulbs=(X,Y,w,h,n)=>{const per=2*(w+h);for(let i=0;i<n;i++){const p=i/n*per;let bx,by;if(p<w){bx=X+p;by=Y;}else if(p<w+h){bx=X+w;by=Y+p-w;}else if(p<2*w+h){bx=X+w-(p-w-h);by=Y+h;}else{bx=X;by=Y+h-(p-2*w-h);}
   const on=((i+(now/(hot?55:170)|0))%3)===0;x.fillStyle=on?'#fff4c0':'#4a2a18';if(on){x.shadowColor=hot?'#ffffff':'#ffc850';x.shadowBlur=9;}x.beginPath();x.arc(bx,by,on?4.5:3.5,0,TAU);x.fill();x.shadowBlur=0;}};
  x.fillStyle='#050208';casRR(x,66,26,528,76,10);x.fill();bulbs(62,22,536,84,52);
  x.font='bold 19px Georgia,serif';x.textAlign='center';x.fillStyle=col;x.fillText(K.name+'  ·  PROGRESSIVE',330,52);
  x.font='bold 34px monospace';const jc=(now/300|0)%2?'#ffd36b':'#ff6fae';x.shadowColor=jc;x.shadowBlur=12;x.fillStyle=jc;x.fillText('$'+fmt(c.jp[tb.den]),330,92);x.shadowBlur=0;
  const bz=x.createLinearGradient(0,112,0,432);bz.addColorStop(0,'#e8ecf2');bz.addColorStop(0.5,'#70747e');bz.addColorStop(1,'#c8ccd4');x.fillStyle=bz;casRR(x,68,110,526,322,12);x.fill();bulbs(60,104,542,334,64);
  for(let i=0;i<3;i++){const rx=80+i*175,ry=120,rw=150,rh=300;
   const rg=x.createLinearGradient(rx,0,rx+rw,0);rg.addColorStop(0,'#cfc8bc');rg.addColorStop(0.2,'#fbf8f0');rg.addColorStop(0.8,'#fbf8f0');rg.addColorStop(1,'#cfc8bc');x.fillStyle=rg;x.fillRect(rx,ry,rw,rh);
   let pos=S.reels[i];if(S.spin&&!(CS.q.length<=2-i&&S.reels[i]===S.spin.stops[i])){pos=(S.spin.from[i]+(now-S.spin.t0)/45)%CAS_STRIP.length;}
   x.save();x.beginPath();x.rect(rx,ry,rw,rh);x.clip();const fr=pos%1,base=Math.floor(pos),blur=S.spin&&pos!==S.reels[i];
   for(let k=-2;k<=2;k++){const sym=CAS_STRIP[((base+k)%CAS_STRIP.length+CAS_STRIP.length)%CAS_STRIP.length],cy=ry+rh/2+(k-fr)*100;if(blur){x.globalAlpha=0.35;casSymDraw(x,sym,rx+rw/2,cy-14,38);x.globalAlpha=1;}casSymDraw(x,sym,rx+rw/2,cy,38);}
   const sh=x.createLinearGradient(0,ry,0,ry+rh);sh.addColorStop(0,'rgba(0,0,0,.6)');sh.addColorStop(0.3,'rgba(0,0,0,0)');sh.addColorStop(0.7,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.6)');x.fillStyle=sh;x.fillRect(rx,ry,rw,rh);
   /* the glass in front of the reel */
   const gl=x.createLinearGradient(rx,ry,rx+rw,ry+rh*0.6);gl.addColorStop(0,'rgba(255,255,255,.22)');gl.addColorStop(0.35,'rgba(255,255,255,0)');x.fillStyle=gl;x.fillRect(rx,ry,rw,rh);x.restore();
   x.strokeStyle='#d8b060';x.lineWidth=4;x.strokeRect(rx,ry,rw,rh);}
  x.strokeStyle=hit?'rgba(255,230,120,'+(0.6+0.4*Math.sin(now/90))+')':'rgba(255,40,80,.85)';x.lineWidth=hit?5:3;if(hit){x.shadowColor='#ffd36b';x.shadowBlur=14;}x.beginPath();x.moveTo(70,270);x.lineTo(590,270);x.stroke();x.shadowBlur=0;
  x.fillStyle='#ff2850';for(const sx of [70,590]){x.beginPath();x.moveTo(sx,262);x.lineTo(sx+(sx<300?12:-12),270);x.lineTo(sx,278);x.closePath();x.fill();}
  /* coin lights */
  x.textAlign='center';for(let i=0;i<3;i++){const on=i<S.coins;if(on){x.shadowColor='#ffd36b';x.shadowBlur=10;}x.fillStyle=on?'#ffd36b':'#3a2a30';x.beginPath();x.arc(250+i*80,455,16,0,TAU);x.fill();x.shadowBlur=0;x.fillStyle='#000';x.font='bold 14px monospace';x.fillText(String(i+1),250+i*80,460);}
  x.fillStyle='#ffe9a8';x.font='bold 16px monospace';x.fillText('COINS IN',170,460);
  /* the LED ticker: what the rest of the bank is winning */
  if(!CS.tick||now-CS.tick.t>9000){const n=1+(Math.random()*32|0),N=CAS_NM[Math.random()<0.5?'f':'m'],amt=tb.den*pick([2,3,5,10,10,15,30,80]);CS.tick={t:now,txt:'★ MACHINE '+n+' · '+pick(N)+' WINS $'+fmt(amt)+' ★  '+pick(['THE PEARL CLUB PAYS YOU BACK','FREE COCKTAILS FOR CARD MEMBERS','PROGRESSIVE NOW $'+fmt(c.jp[tb.den]),'LIVE MUSIC IN THE LOUNGE TONIGHT'])+' ★'};}
  x.fillStyle='#120604';casRR(x,66,482,528,32,6);x.fill();x.save();x.beginPath();x.rect(70,484,520,28);x.clip();x.font='bold 18px monospace';x.textAlign='left';x.fillStyle='#ff9a30';x.shadowColor='#ff7a10';x.shadowBlur=6;
  const tw=x.measureText(CS.tick.txt).width,tx=590-((now-CS.tick.t)*0.09)%(tw+520);x.fillText(CS.tick.txt,tx,505);x.shadowBlur=0;x.restore();
  /* paytable */
  x.fillStyle='rgba(0,0,0,.6)';casRR(x,630,30,305,470,12);x.fill();x.strokeStyle='#d8b060';x.lineWidth=2;casRR(x,630,30,305,470,12);x.stroke();x.textAlign='center';x.fillStyle='#ffd36b';x.font='bold 18px Georgia,serif';x.fillText('PAYS PER COIN',782,56);
  x.textAlign='left';CAS_PAY.forEach(([k,n,m,lbl],i)=>{const y=86+i*44;const on=hit&&hit.lbl===lbl;if(on){x.fillStyle='rgba(255,211,107,'+(0.2+0.15*Math.sin(now/100))+')';x.fillRect(635,y-22,295,40);}
   const sym=k==='anybar'?'bar':k;for(let j=0;j<(k==='anybar'?3:n);j++)casSymDraw(x,k==='anybar'?(j%2?'dbar':'bar'):sym,655+j*30,y-4,12);x.fillStyle=on?'#ffd36b':'#fff';x.font='bold 18px monospace';x.textAlign='right';x.fillText(k==='pearl'?'600 / JACKPOT':String(m),922,y+2);x.textAlign='left';});
  x.textAlign='center';x.fillStyle='#c9b6f2';x.font='14px monospace';x.font='12px monospace';x.fillText('3 PEARLS ON 3 COINS WINS THE PROGRESSIVE',782,488);}};
function casSymDraw(x,s,cx,cy,r){x.save();x.translate(cx,cy);
 if(s==='cherry'){x.strokeStyle='#2a7a2a';x.lineWidth=r*0.12;x.beginPath();x.moveTo(-r*0.35,r*0.1);x.quadraticCurveTo(0,-r*0.9,r*0.2,-r*0.8);x.moveTo(r*0.35,r*0.15);x.quadraticCurveTo(r*0.2,-r*0.5,r*0.2,-r*0.8);x.stroke();
  x.fillStyle='#d01020';for(const dx of [-0.38,0.38]){x.beginPath();x.arc(dx*r,r*0.35,r*0.36,0,TAU);x.fill();}x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.arc(-0.48*r,r*0.22,r*0.08,0,TAU);x.fill();}
 else if(s==='bell'){x.fillStyle='#e8b020';x.beginPath();x.moveTo(-r*0.7,r*0.5);x.quadraticCurveTo(-r*0.6,-r*0.8,0,-r*0.8);x.quadraticCurveTo(r*0.6,-r*0.8,r*0.7,r*0.5);x.closePath();x.fill();x.fillStyle='#a87010';x.fillRect(-r*0.75,r*0.45,r*1.5,r*0.15);x.beginPath();x.arc(0,r*0.7,r*0.15,0,TAU);x.fill();}
 else if(s==='bar'||s==='dbar'){const n=s==='dbar'?2:1;for(let k=0;k<n;k++){const y=(n===1?0:(k-0.5)*r*0.7);x.fillStyle='#111';x.fillRect(-r*0.85,y-r*0.3,r*1.7,r*0.6);x.fillStyle='#fff';x.font='bold '+(r*0.45|0)+'px monospace';x.textAlign='center';x.fillText('BAR',0,y+r*0.16);}}
 else if(s==='seven'){x.font='bold '+(r*1.8|0)+'px Georgia,serif';x.textAlign='center';x.fillStyle='#a00818';x.fillText('7',3,r*0.62+3);x.fillStyle='#ff2030';x.fillText('7',0,r*0.62);}
 else if(s==='pearl'){const g2=x.createRadialGradient(-r*0.25,-r*0.25,r*0.1,0,0,r*0.7);g2.addColorStop(0,'#fff');g2.addColorStop(0.6,'#e8dcf0');g2.addColorStop(1,'#9a8ab0');x.fillStyle='#2a1a40';x.beginPath();x.ellipse(0,r*0.25,r*0.9,r*0.4,0,0,TAU);x.fill();x.fillStyle=g2;x.beginPath();x.arc(0,-r*0.05,r*0.6,0,TAU);x.fill();}
 x.restore();}

/* ---------- BLACKJACK: six decks, dealer stands on all 17s, blackjack pays 3:2, double on two cards, one split; the regulars play their own hands ---------- */
const CAS_BJ={shoe:[],hands:[],dealer:[],hole:true,holeT:0,cur:0,phase:'bet',bet:0,last:0,res:[],ppl:[]};
function bjShoe(){const s=[];for(let d=0;d<6;d++)for(const su of '♠♥♦♣')for(const r of ['A','2','3','4','5','6','7','8','9','10','J','Q','K'])s.push({r,su});for(let i=s.length-1;i>0;i--){const j=Math.floor(casR()*(i+1));[s[i],s[j]]=[s[j],s[i]];}return s;}
function bjDraw(){const B=CAS_BJ;if(!B.shoe.length)B.shoe=bjShoe();return B.shoe.pop();}
function bjVal(cs){let v=0,a=0;for(const c of cs){if(c.r==='A'){v+=11;a++;}else v+=['J','Q','K','10'].includes(c.r)?10:+c.r;}while(v>21&&a){v-=10;a--;}return v;}
function bjSoft(cs){let v=0,a=0;for(const c of cs){if(c.r==='A'){v+=11;a++;}else v+=['J','Q','K','10'].includes(c.r)?10:+c.r;}while(v>21&&a){v-=10;a--;}return a>0;}
const bjBJ=cs=>cs.length===2&&bjVal(cs)===21;
/* where the regulars sit on screen: by how many seats they are from you */
const BJ_X={'-2':110,'-1':255,'1':705,'2':850};
function bjPx(P){const d=P.k-CAS_MYSEAT[CS.tb.id];return BJ_X[d]||(d<0?110:850);}
function bjDeal(){const B=CAS_BJ,tb=CS.tb;if(B.phase==='done')B.phase='bet';if(B.phase!=='bet')return;if(B.bet<tb.min){if(B.last&&casCan(B.last)&&B.bet===0){B.bet=Math.min(B.last,tb.max);casTake(B.bet);}else{casMsg('Table minimum is $'+fmt(tb.min)+'.');sfx('blip');return;}}
 if(B.shoe.length<20+B.ppl.length*4)B.shoe=bjShoe();/* the cut card */B.hands=[{cards:[],bet:B.bet,done:false,dbl:false}];B.dealer=[];B.hole=true;B.cur=0;B.res=[];B.phase='deal';B.last=B.bet;CS.say='';casMsg('');
 for(const P of B.ppl){P.hand=[];P.res='';P.dbl=0;P.bet=Math.min(tb.max,tb.min*pick([1,1,2,2,3,5]));}
 /* the deal goes round from the dealer's left (your right), two cards each, the dealer's second face down */
 const H=B.hands[0],m=CAS_MYSEAT[tb.id],ord=B.ppl.map(P=>({k:P.k,f:()=>P.hand.push(bjDraw())})).concat([{k:m,f:()=>H.cards.push(bjDraw())}]).sort((a,b)=>b.k-a.k),steps=[];
 for(let r=0;r<2;r++){for(const o of ord)steps.push(o.f);steps.push(()=>B.dealer.push(bjDraw()));}
 steps.forEach((f,i)=>casQ(i?(B.ppl.length?240:330):150,()=>{f();casSnd('card');}));
 casQ(250,()=>{const up=B.dealer[0].r,peek=up==='A'||['10','J','Q','K'].includes(up);
  if(peek&&bjBJ(B.dealer)){B.hole=false;B.holeT=performance.now();bjSettle();return;}
  B.phase='npc';bjNpcs(B.ppl.filter(P=>P.k>m).sort((a,b)=>b.k-a.k),()=>{if(bjBJ(H.cards)){casMsg('Blackjack!');bjNext();casUI();return;}
   B.phase='play';casMsg('Hit, stand'+(casCan(H.bet)?', double':'')+(bjCanSplit()?' or split':'')+'?');casUI();});});casUI();}
/* a regular plays: double 10 or 11 against a small card, hit soft 17 and below, hit 12-16 against a 7 or better, stand on the rest */
function bjNpcTurn(P,then){const B=CAS_BJ,u=bjVal([B.dealer[0]]);
 const step=()=>{const v=bjVal(P.hand),soft=bjSoft(P.hand);let act='stand';
  if(v<21){if(P.hand.length===2&&(v===10||v===11)&&u<10&&!soft&&!P.dbl)act='double';else if(v<=11||(soft&&v<=17)||(v<=16&&u>=7)||(v===12&&u<=3))act='hit';}
  if(act==='stand'){casQ(420,then);return;}
  casQ(520,()=>{P.hand.push(bjDraw());casSnd('card');if(act==='double'){P.bet*=2;P.dbl=1;casSnd('chip');}
   if(bjVal(P.hand)>21){P.res='BUST';casSay(P,'bust');casQ(380,then);return;}if(act==='double'){casQ(380,then);return;}step();});};
 step();}
function bjNpcs(list,then){const L=list.slice(),nx=()=>{const P=L.shift();if(!P){then();return;}if(bjBJ(P.hand)){P.res='BLACKJACK';casSay(P,'bj');nx();return;}bjNpcTurn(P,nx);};nx();}
function bjCanSplit(){const B=CAS_BJ,H=B.hands[B.cur];if(!H||B.hands.length>1||H.cards.length!==2)return false;const v=c=>['J','Q','K','10'].includes(c.r)?10:c.r;return v(H.cards[0])===v(H.cards[1])&&casCan(H.bet);}
function bjHit(){const B=CAS_BJ,H=B.hands[B.cur];if(B.phase!=='play'||!H)return;H.cards.push(bjDraw());casSnd('card');const v=bjVal(H.cards);if(v>=21){if(v>21)casMsg('Bust!');bjNext();}casUI();}
function bjStand(){if(CAS_BJ.phase!=='play')return;bjNext();casUI();}
function bjDouble(){const B=CAS_BJ,H=B.hands[B.cur];if(B.phase!=='play'||!H||H.cards.length!==2||!casCan(H.bet))return;casTake(H.bet);H.bet*=2;H.dbl=true;casSnd('chip');H.cards.push(bjDraw());casSnd('card');bjNext();casUI();}
function bjSplit(){const B=CAS_BJ;if(B.phase!=='play'||!bjCanSplit())return;const H=B.hands[0];casTake(H.bet);const H2={cards:[H.cards.pop()],bet:H.bet,done:false,split:1};H.split=1;B.hands.push(H2);
 H.cards.push(bjDraw());H2.cards.push(bjDraw());casSnd('card');const aces=H.cards[0].r==='A';if(aces){H.done=H2.done=true;B.cur=1;bjNext();}casMsg('Two hands. Playing the first.');casUI();}
function bjNext(){const B=CAS_BJ;B.hands[B.cur].done=true;while(B.cur<B.hands.length&&B.hands[B.cur].done)B.cur++;if(B.cur<B.hands.length){casMsg('Second hand.');return;}
 /* the players on your left go, then the dealer turns the hole card and draws to 17 (only if any hand is still alive) */
 B.phase='dealer';const m=CAS_MYSEAT[CS.tb.id];
 bjNpcs(B.ppl.filter(P=>P.k<m).sort((a,b)=>b.k-a.k),()=>{const live=B.hands.some(h=>bjVal(h.cards)<=21)||B.ppl.some(P=>P.hand.length&&bjVal(P.hand)<=21);
  casQ(400,()=>{B.hole=false;B.holeT=performance.now();casSnd('card');});
  const step=()=>{if(live&&bjVal(B.dealer)<17){casQ(520,()=>{B.dealer.push(bjDraw());casSnd('card');step();});}else casQ(300,bjSettle);};step();});}
function bjSettle(){const B=CAS_BJ,d=bjVal(B.dealer),dbj=bjBJ(B.dealer);let stake=0,back=0;const out=[];
 for(const H of B.hands){const v=bjVal(H.cards),bj=bjBJ(H.cards)&&!H.split;stake+=H.bet;let r;
  if(v>21)r=['BUST',0];else if(bj&&!dbj)r=['BLACKJACK',H.bet*2.5];else if(dbj&&!bj)r=['DEALER BLACKJACK',0];else if(bj&&dbj)r=['PUSH',H.bet];else if(d>21||v>d)r=['WIN',H.bet*2];else if(v===d)r=['PUSH',H.bet];else r=['LOSE',0];
  back+=r[1];out.push(r[0]);}
 /* the regulars: their own money, their own moods (a couple of them say so) */
 let talk=0;for(const P of B.ppl){if(!P.hand.length)continue;const v=bjVal(P.hand),bj=bjBJ(P.hand);let r,m;
  if(v>21){r='BUST';m=-1;}else if(bj&&!dbj){r='BLACKJACK';m=1.5;}else if(dbj&&!bj){r='LOSE';m=-1;}else if(bj&&dbj){r='PUSH';m=0;}else if(d>21||v>d){r='WIN';m=1;}else if(v===d){r='PUSH';m=0;}else{r='LOSE';m=-1;}
  P.res=r;P.net+=m*P.bet;if(r==='BUST'||r==='BLACKJACK')continue;if(m&&talk<2&&Math.random()<0.55){talk++;casSay(P,m>0?'win':'lose');}else if(m){P.mood=m>0?1:-1;P.moodT=performance.now();}}
 casGive(back);const net=casSettle(stake,back);B.res=out;B.phase='done';B.bet=0;
 if(net>0){casWin((out.includes('BLACKJACK')?'BLACKJACK!  ':'')+'+$'+fmt(net),out.includes('BLACKJACK')?'#ffd36b':'#7dff9a');casSnd('win');casDealerSay('win');}else if(net<0){casSnd('lose');casDealerSay('lose');}else casDealerSay('push');
 casMsg(out.join(' · ')+(net?' · '+(net>0?'+':'-')+'$'+fmt(Math.abs(net)):''));casUI();}
function bjAddChip(v){const B=CAS_BJ,tb=CS.tb;if(B.phase==='done'){B.phase='bet';B.hands=[];B.dealer=[];B.res=[];for(const P of B.ppl){P.hand=[];P.res='';}}if(B.phase!=='bet')return;if(B.bet+v>tb.max){casMsg('Table maximum is $'+fmt(tb.max)+'.');return;}if(!casCan(v)){casMsg('Not enough cash.');sfx('blip');return;}casTake(v);B.bet+=v;casSnd('chip');casMsg('Bet $'+fmt(B.bet)+'. Deal when ready.');}
function bjClear(){const B=CAS_BJ;if(B.phase!=='bet'&&B.phase!=='done')return;casGive(B.bet);B.bet=0;casMsg('Bet cleared.');casUI();}
/* the dealer's chip rack: six tubes of chips */
function casRack(x,X,Y){x.fillStyle='rgba(0,0,0,.45)';casRR(x,X-4,Y-4,6*30+8,44,6);x.fill();
 [10000,5000,1000,500,100,25].forEach((v,i)=>{const cx=X+i*30;const g=x.createLinearGradient(cx,0,cx+26,0);g.addColorStop(0,'rgba(0,0,0,.4)');g.addColorStop(0.4,'rgba(255,255,255,.15)');g.addColorStop(1,'rgba(0,0,0,.45)');x.fillStyle=CAS_CHIPC[v];x.fillRect(cx,Y,26,36);x.fillStyle=g;x.fillRect(cx,Y,26,36);
  x.fillStyle='rgba(0,0,0,.35)';for(let y=Y+4;y<Y+36;y+=4)x.fillRect(cx,y,26,1);x.fillStyle='rgba(255,255,255,.7)';for(let y=Y+2;y<Y+36;y+=8)x.fillRect(cx+11,y,4,2);});}
const CAS_BJG={chips:true,title:tb=>tb.vip?'SALON PRIVE · BLACKJACK':'BLACKJACK',sub:tb=>'$'+fmt(tb.min)+' TO $'+fmt(tb.max)+' · BLACKJACK PAYS 3 TO 2 · DEALER STANDS ON 17',sayAt:[480,522],
 init(){const B=CAS_BJ;if(B.shoe.length<20)B.shoe=bjShoe();Object.assign(B,{hands:[],dealer:[],hole:true,holeT:0,cur:0,phase:'bet',bet:0,res:[]});B.ppl=casPeople(CS.tb);CS.dealt=new Map();
  if(B.ppl.length)casSay(pick(B.ppl),'hi');casMsg('Tap a chip to bet, then DEAL.');},
 chipTap(v){bjAddChip(v);},
 acts(){const B=CAS_BJ,H=B.hands[B.cur];if(B.phase==='play')return [{id:'hit',lbl:'HIT',k:'H',p:'A',code:['KeyH','Space','Enter'],fn:bjHit},{id:'stand',lbl:'STAND',k:'S',p:'X',code:['KeyS'],fn:bjStand},
  {id:'dbl',lbl:'DOUBLE',k:'D',p:'Y',code:['KeyD'],fn:bjDouble,dis:!(H&&H.cards.length===2&&casCan(H.bet))},...(bjCanSplit()?[{id:'split',lbl:'SPLIT',k:'P',code:['KeyP'],fn:bjSplit}]:[])];
  const lb=B.bet?'DEAL · $'+fmt(B.bet):B.last?'REBET $'+fmt(B.last):'DEAL';return [{id:'deal',lbl:lb,k:'SPACE',p:'A',code:['Space','Enter','KeyE'],fn:bjDeal,dis:B.phase!=='bet'&&B.phase!=='done'||(!B.bet&&!B.last)},{id:'clr',lbl:'CLEAR',k:'C',p:'X',code:['KeyC'],fn:bjClear,alt:1,dis:!B.bet},{id:'add',lbl:'+ $'+fmt(CS.chip),k:'+',p:'Y',code:['Equal','NumpadAdd','KeyA'],fn:()=>{bjAddChip(CS.chip);casUI();},alt:1}];},
 finish(){const B=CAS_BJ;while(CS.q.length){const s=CS.q.shift();s.fn();}CS.busy=0;if(B.phase==='play'){while(B.phase==='play')bjNext();while(CS.q.length){const s=CS.q.shift();s.fn();}}if(B.phase==='bet'&&B.bet){casGive(B.bet);B.bet=0;}CS.busy=0;},
 tap(x,y){const B=CAS_BJ;if(Math.hypot(x-480,y-400)<70&&(B.phase==='bet'||B.phase==='done')){bjAddChip(CS.chip);casUI();}},
 draw(x,W,H,now){const B=CAS_BJ,tb=CS.tb;casFelt(x,W,H,tb.vip?'#1a2a78':null);
  x.strokeStyle='rgba(255,233,168,.7)';x.lineWidth=2;x.beginPath();x.arc(W/2,-260,600,0.22*Math.PI,0.78*Math.PI);x.stroke();
  x.font='bold 18px Georgia,serif';x.textAlign='center';x.fillStyle='rgba(255,233,168,.85)';x.fillText('BLACKJACK PAYS 3 TO 2',W/2,236);x.font='13px monospace';x.fillText('DEALER MUST STAND ON ALL 17s · INSURANCE PAYS 2 TO 1',W/2,256);
  casRack(x,52,34);
  /* the shoe: a wooden box, the next card peeking out */
  x.fillStyle='rgba(0,0,0,.4)';casRR(x,W-146,46,112,76,8);x.fill();const sg=x.createLinearGradient(W-150,0,W-40,0);sg.addColorStop(0,'#5a2a10');sg.addColorStop(1,'#2a1006');x.fillStyle=sg;casRR(x,W-150,42,112,76,8);x.fill();
  x.drawImage(casCardBack(),W-140,50,50,64);x.fillStyle='rgba(20,10,4,.85)';x.fillRect(W-98,48,54,68);x.fillStyle='#ffe9a8';x.font='12px monospace';x.textAlign='center';x.fillText(B.shoe.length+' CARDS',W-94,136);
  /* the dealer's cards: the hole card flips over when it is turned */
  B.dealer.forEach((c,i)=>{const tx=W/2-60+i*56-(B.dealer.length-2)*28;let sx=1;if(i===1)sx=B.hole?-1:-Math.cos(Math.min(1,(now-B.holeT)/300)*Math.PI);casDealt(x,tx,60,c,false,1,now,sx);});
  if(B.dealer.length&&!B.hole){x.fillStyle='#ffe9a8';x.font='bold 20px monospace';x.textAlign='center';x.fillText('DEALER '+bjVal(B.dealer),W/2,200);}
  /* the regulars: their bet, their cards, how it went */
  for(const P of B.ppl){const px=bjPx(P);x.strokeStyle='rgba(255,233,168,.5)';x.lineWidth=2;x.beginPath();x.arc(px,272,26,0,TAU);x.stroke();if(P.bet)casChipDraw(x,px,272,P.bet,14);
   P.hand.forEach((c,i)=>casDealt(x,px-34+i*20,322-i*4,c,false,0.62,now));
   x.textAlign='center';if(P.hand.length){x.font='bold 15px monospace';x.fillStyle='#fff';x.fillText(String(bjVal(P.hand))+(P.dbl?' · ×2':''),px,316-P.hand.length*4);}
   if(P.res){x.font='bold 16px monospace';x.fillStyle=/WIN|BLACKJACK/.test(P.res)?'#7dff9a':P.res==='PUSH'?'#ffe9a8':'#ff8a95';x.fillText(P.res,px,428);}
   casPersonDraw(x,P,px,H-24,0.9,now);}
  /* your hand(s) */
  B.hands.forEach((h,k)=>{const cx=B.hands.length>1?W/2+(k?125:-125):W/2;h.cards.forEach((c,i)=>casDealt(x,cx-50+i*36-(h.cards.length-2)*18,340-i*6,c,false,1,now));
   const v=bjVal(h.cards);x.textAlign='center';x.fillStyle=k===B.cur&&B.phase==='play'?'#ffd36b':'#fff';x.font='bold 20px monospace';x.fillText(String(v)+(h.dbl?' · DOUBLED':''),cx,330);
   if(B.res[k]){x.fillStyle=/WIN|BLACKJACK/.test(B.res[k])&&!/DEALER/.test(B.res[k])?'#7dff9a':B.res[k]==='PUSH'?'#ffe9a8':'#ff8a95';x.font='bold 22px monospace';x.fillText(B.res[k],cx,488);}
   casChipDraw(x,cx+90,460,h.bet,18);});
  /* your betting circle */
  if(B.phase==='bet'||B.phase==='done'){x.strokeStyle='#ffe9a8';x.lineWidth=3;x.beginPath();x.arc(W/2,400,58,0,TAU);x.stroke();x.font='14px monospace';x.textAlign='center';x.fillStyle='rgba(255,233,168,.8)';x.fillText(B.bet?'':'TAP TO BET $'+fmt(CS.chip),W/2,405);if(B.bet)casChipDraw(x,W/2,400,B.bet,26);}}};

/* ---------- ROULETTE: American wheel (0 and 00); the regulars bet with their own coloured chips ---------- */
const CAS_RO={bets:{},last:null,spin:null,res:null,hist:[],ang:0,ball:0,ppl:[],nb:[]};
function roSpots(){if(roSpots.L)return roSpots.L;const L=[],x0=392,cw=40,y0=140,rh=60;
 L.push({k:'n0',lbl:'0',x:352,y:y0,w:40,h:90,pay:35,win:r=>r==='0'},{k:'n00',lbl:'00',x:352,y:y0+90,w:40,h:90,pay:35,win:r=>r==='00'});
 for(let c=0;c<12;c++)for(let r=0;r<3;r++){const n=3*c+3-r;L.push({k:'n'+n,lbl:String(n),n,x:x0+c*cw,y:y0+r*rh,w:cw,h:rh,pay:35,win:q=>q===n});}
 for(let r=0;r<3;r++)L.push({k:'col'+r,lbl:'2:1',x:x0+12*cw,y:y0+r*rh,w:50,h:rh,pay:2,win:q=>typeof q==='number'&&q>0&&(q-(3-r))%3===0});
 for(let d=0;d<3;d++)L.push({k:'doz'+d,lbl:['1st 12','2nd 12','3rd 12'][d],x:x0+d*160,y:y0+180,w:160,h:46,pay:2,win:q=>typeof q==='number'&&q>=1+d*12&&q<=12+d*12});
 [['lo','1-18',q=>q>=1&&q<=18],['even','EVEN',q=>q>0&&q%2===0],['red','RED',q=>CAS_RED.has(q)],['black','BLACK',q=>typeof q==='number'&&q>0&&!CAS_RED.has(q)],['odd','ODD',q=>q%2===1],['hi','19-36',q=>q>=19&&q<=36]].forEach(([k,lbl,f],i)=>L.push({k,lbl,x:x0+i*80,y:y0+226,w:80,h:46,pay:1,win:q=>typeof q==='number'&&f(q)}));
 return roSpots.L=L;}
const roTotal=()=>Object.values(CAS_RO.bets).reduce((a,b)=>a+b,0);
/* the regulars put their chips down for the next spin (cosmetic money: theirs, not yours) */
function roNpcBet(){const R=CAS_RO,tb=CS.tb,L=roSpots();R.nb=[];for(const P of R.ppl){const n=1+(Math.random()*3|0);for(let i=0;i<n;i++){const s=L[Math.random()<0.6?2+(Math.random()*36|0):38+(Math.random()*(L.length-38)|0)];R.nb.push({P,k:s.k,v:Math.min(tb.max,tb.min*pick([1,1,2,4]))});}}}
function roPlace(k){const R=CAS_RO,tb=CS.tb;if(R.spin)return;if(R.res!==null&&!roTotal()){R.res=null;roNpcBet();}const v=CS.chip;if(roTotal()+v>tb.max){casMsg('Table maximum is $'+fmt(tb.max)+'.');sfx('blip');return;}if(!casCan(v)){casMsg('Not enough cash.');sfx('blip');return;}
 casTake(v);R.bets[k]=(R.bets[k]||0)+v;casSnd('chip');const s=roSpots().find(q=>q.k===k);casMsg('$'+fmt(R.bets[k])+' on '+(s?s.lbl:k)+' · total $'+fmt(roTotal()));casUI();}
function roClear(){const R=CAS_RO;if(R.spin)return;casGive(roTotal());R.bets={};casMsg('Bets cleared.');casUI();}
function roRebet(){const R=CAS_RO;if(R.spin||!R.last)return;const tot=Object.values(R.last).reduce((a,b)=>a+b,0);if(!casCan(tot)){casMsg('Not enough cash to rebet.');return;}casGive(roTotal());casTake(tot);R.bets={...R.last};if(R.res!==null){R.res=null;roNpcBet();}casSnd('chip');casMsg('Same bets again: $'+fmt(tot)+'.');casUI();}
function roSpin(){const R=CAS_RO,tb=CS.tb,tot=roTotal();if(R.spin)return;if(tot<tb.min){casMsg('Table minimum is $'+fmt(tb.min)+'. Tap the layout to bet.');sfx('blip');return;}
 const idx=Math.floor(casR()*CAS_WHEEL.length),now=performance.now(),N=CAS_WHEEL.length;R.spin={t0:now,idx,a0:R.ang,b0:R.ball};R.res=null;R.last={...R.bets};CS.say='No more bets.';casSnd('ball');
 casQ(3600,()=>{const r=CAS_WHEEL[idx],q=r;R.ang=R.spin.a0+TAU*2.2;R.ball=R.ang+(idx+0.5)*TAU/N;R.res=q;R.spin=null;R.hist.unshift(q);R.hist=R.hist.slice(0,12);let back=0;
  for(const [k,v] of Object.entries(R.bets)){const s=roSpots().find(z=>z.k===k);if(s&&s.win(q))back+=v*(s.pay+1);}
  /* the regulars: winning chips stay (and get paid), the rest is swept */
  const won=new Map();R.nb=R.nb.filter(b=>{const s=roSpots().find(z=>z.k===b.k),w=s&&s.win(q);if(w)won.set(b.P,(won.get(b.P)||0)+b.v*s.pay);return w;});
  let talk=0;for(const P of R.ppl){const w=won.get(P);if(w){P.net+=w;if(talk++<2)casSay(P,'win');else{P.mood=1;P.moodT=performance.now();}}else if(Math.random()<0.35&&talk<2){talk++;casSay(P,'lose');}}
  casGive(back);const net=casSettle(tot,back);R.bets={};const nm=(typeof q==='number'?(CAS_RED.has(q)?'RED ':'BLACK ')+q:q+' · GREEN');
  if(net>0){casWin(nm+'  +$'+fmt(net));casSnd('win');casDealerSay('win');}else{casSnd(back?'chip':'lose');casDealerSay(back?'push':'lose');}casMsg(nm+(back?' · pays $'+fmt(back):' · no win'));});casUI();}
function roNum(q){return typeof q==='number'?(CAS_RED.has(q)?'#c8101e':'#111'):'#0a7a3a';}
/* the wheel itself (pockets, frets, numbers, the cone and its turret) is painted once and turned */
function casWheelTex(rad){const k='wheel'+rad;if(CAS_ART[k])return CAS_ART[k];const S=rad*2+6,c=casCanvas(S,S),x=c.getContext('2d'),cx=S/2,cy=S/2,N=CAS_WHEEL.length;
 for(let i=0;i<N;i++){const a0=i*TAU/N,a1=a0+TAU/N,q=CAS_WHEEL[i];x.fillStyle=roNum(q);x.beginPath();x.arc(cx,cy,rad,a0,a1);x.arc(cx,cy,rad*0.62,a1,a0,true);x.closePath();x.fill();
  x.save();x.translate(cx+Math.cos(a0+TAU/N/2)*rad*0.9,cy+Math.sin(a0+TAU/N/2)*rad*0.9);x.rotate(a0+TAU/N/2+Math.PI/2);x.fillStyle='#fff';x.font='bold '+(rad*0.085|0)+'px Georgia,serif';x.textAlign='center';x.fillText(String(q),0,4);x.restore();}
 const pg=x.createRadialGradient(cx,cy,rad*0.62,cx,cy,rad*0.8);pg.addColorStop(0,'rgba(0,0,0,.5)');pg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=pg;x.beginPath();x.arc(cx,cy,rad*0.8,0,TAU);x.arc(cx,cy,rad*0.62,0,TAU,true);x.fill();
 x.strokeStyle='#e0b860';x.lineWidth=1.5;for(let i=0;i<N;i++){const a=i*TAU/N;x.beginPath();x.moveTo(cx+Math.cos(a)*rad*0.62,cy+Math.sin(a)*rad*0.62);x.lineTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad);x.stroke();}
 x.lineWidth=2;for(const f of [0.62,0.8,1]){x.beginPath();x.arc(cx,cy,rad*f,0,TAU);x.stroke();}
 const cg=x.createRadialGradient(cx-rad*0.18,cy-rad*0.18,rad*0.04,cx,cy,rad*0.62);cg.addColorStop(0,'#b0662e');cg.addColorStop(0.7,'#5a2810');cg.addColorStop(1,'#2a1006');x.fillStyle=cg;x.beginPath();x.arc(cx,cy,rad*0.61,0,TAU);x.fill();
 for(let i=0;i<4;i++){const a=i*Math.PI/2;x.strokeStyle='#e8c070';x.lineWidth=rad*0.045;x.lineCap='round';x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a)*rad*0.42,cy+Math.sin(a)*rad*0.42);x.stroke();
  const bg=x.createRadialGradient(cx+Math.cos(a)*rad*0.44-2,cy+Math.sin(a)*rad*0.44-2,1,cx+Math.cos(a)*rad*0.44,cy+Math.sin(a)*rad*0.44,rad*0.06);bg.addColorStop(0,'#fff6d0');bg.addColorStop(1,'#a07828');x.fillStyle=bg;x.beginPath();x.arc(cx+Math.cos(a)*rad*0.44,cy+Math.sin(a)*rad*0.44,rad*0.06,0,TAU);x.fill();}
 const tg=x.createRadialGradient(cx-4,cy-4,1,cx,cy,rad*0.14);tg.addColorStop(0,'#fff4c8');tg.addColorStop(1,'#a07828');x.fillStyle=tg;x.beginPath();x.arc(cx,cy,rad*0.14,0,TAU);x.fill();
 return CAS_ART[k]=c;}
const CAS_ROX=[470,650,830];/* where the regulars sit along the layout, by seat */
const CAS_ROG={chips:true,title:tb=>tb.vip?'SALON PRIVE · ROULETTE':'ROULETTE',sub:tb=>'$'+fmt(tb.min)+' TO $'+fmt(tb.max)+' · NUMBERS PAY 35 TO 1 · DOZENS 2 TO 1 · COLOURS EVEN',sayAt:[185,474],
 init(){const R=CAS_RO;R.bets={};R.spin=null;R.res=null;R.ppl=casPeople(CS.tb);roNpcBet();if(R.ppl.length)casSay(pick(R.ppl),'hi');casMsg('Pick a chip, tap the layout to bet, then SPIN.');},
 acts(){const R=CAS_RO,t=roTotal();return [{id:'spin',lbl:'SPIN'+(t?' · $'+fmt(t):''),k:'SPACE',p:'A',code:['Space','Enter','KeyE'],fn:roSpin,dis:!!R.spin||!t},{id:'clr',lbl:'CLEAR',k:'C',p:'Y',code:['KeyC'],fn:roClear,alt:1,dis:!t||!!R.spin},
  {id:'re',lbl:'REBET',k:'R',code:['KeyR'],fn:roRebet,alt:1,dis:!R.last||!!R.spin},{id:'put',lbl:'BET HERE',k:'X',p:'X',code:['KeyX'],fn:()=>roPlace(roSpots()[CS.cur].k),alt:1,dis:!!R.spin}];},
 finish(){while(CS.q.length){const s=CS.q.shift();s.fn();}CS.busy=0;if(roTotal()){casGive(roTotal());CAS_RO.bets={};}},
 tap(x,y){const s=roSpots().find(q=>x>=q.x&&x<q.x+q.w&&y>=q.y&&y<q.y+q.h);if(s){CS.cur=roSpots().indexOf(s);roPlace(s.k);}},
 padDir(dx,dy){const L=roSpots(),a=L[CS.cur],ax=a.x+a.w/2,ay=a.y+a.h/2;let best=-1,bd=1e9;L.forEach((s,i)=>{if(i===CS.cur)return;const vx=s.x+s.w/2-ax,vy=s.y+s.h/2-ay,al=vx*dx+vy*dy;if(al<=4)return;const d=Math.hypot(vx,vy)+Math.abs(vx*dy-vy*dx)*2;if(d<bd){bd=d;best=i;}});if(best>=0){CS.cur=best;sfx('blip');}},
 key(c){const D={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[c];if(D)this.padDir(D[0],D[1]);},
 draw(x,W,H,now){const R=CAS_RO,tb=CS.tb;casFelt(x,W,H,tb.vip?'#1a2a78':null);
  /* the wheel turns slowly, fast while it spins; the ball runs the other way round the chrome track and drops into its pocket */
  const cx=185,cy=292,rad=126,N=CAS_WHEEL.length;let ang=R.ang,ball=R.ball,ballR=rad*0.71;
  if(R.spin){const t=Math.min(1,(now-R.spin.t0)/3600),e=1-Math.pow(1-t,3);ang=R.spin.a0+e*TAU*2.2;const target=ang+(R.spin.idx+0.5)*TAU/N;ball=R.spin.b0+(target-R.spin.b0-TAU*6)*e;ballR=rad*(1.07-0.36*Math.max(0,Math.min(1,(t-0.55)/0.4)));}
  else{R.ang+=0.002;ang=R.ang;if(R.res!==null){R.ball+=0.002;ball=R.ball;}}
  x.fillStyle='rgba(0,0,0,.4)';x.beginPath();x.arc(cx+6,cy+8,rad+20,0,TAU);x.fill();
  const bw=x.createRadialGradient(cx-30,cy-30,rad*0.4,cx,cy,rad+20);bw.addColorStop(0,'#8a4420');bw.addColorStop(1,'#2a0e04');x.fillStyle=bw;x.beginPath();x.arc(cx,cy,rad+20,0,TAU);x.fill();
  const tr=x.createRadialGradient(cx,cy,rad,cx,cy,rad+13);tr.addColorStop(0,'#4a4a52');tr.addColorStop(0.55,'#eeeef4');tr.addColorStop(1,'#6a6a72');x.fillStyle=tr;x.beginPath();x.arc(cx,cy,rad+13,0,TAU);x.arc(cx,cy,rad,0,TAU,true);x.fill();
  x.strokeStyle='#d8b060';x.lineWidth=2.5;x.beginPath();x.arc(cx,cy,rad+20,0,TAU);x.stroke();
  for(let i=0;i<8;i++){const a=i*TAU/8+0.2;x.save();x.translate(cx+Math.cos(a)*(rad+6.5),cy+Math.sin(a)*(rad+6.5));x.rotate(a+Math.PI/4);x.fillStyle='#e0bc68';x.fillRect(-3.5,-3.5,7,7);x.restore();}
  const wt=casWheelTex(rad);x.save();x.translate(cx,cy);x.rotate(ang);x.drawImage(wt,-wt.width/2,-wt.height/2);x.restore();
  if(R.spin||R.res!==null){const bx=cx+Math.cos(ball)*ballR,by=cy+Math.sin(ball)*ballR;x.fillStyle='rgba(0,0,0,.45)';x.beginPath();x.arc(bx+2,by+3,6,0,TAU);x.fill();
   const bg=x.createRadialGradient(bx-2,by-2,0.5,bx,by,6);bg.addColorStop(0,'#ffffff');bg.addColorStop(1,'#b0b0bc');x.fillStyle=bg;x.beginPath();x.arc(bx,by,6,0,TAU);x.fill();}
  const sh=x.createLinearGradient(cx-rad,cy-rad,cx+rad,cy+rad);sh.addColorStop(0,'rgba(255,255,255,.14)');sh.addColorStop(0.4,'rgba(255,255,255,0)');x.fillStyle=sh;x.beginPath();x.arc(cx,cy,rad+20,0,TAU);x.fill();
  /* the layout */
  x.fillStyle='rgba(0,0,0,.25)';x.fillRect(356,144,570,272);
  roSpots().forEach((s,i)=>{if(s.n||s.k==='red'||s.k==='black'||s.k[0]==='n'){const base=s.n?roNum(s.n):s.k==='red'?'#c8101e':s.k==='black'?'#111':'#0a7a3a';const g=x.createLinearGradient(s.x,s.y,s.x,s.y+s.h);g.addColorStop(0,base);g.addColorStop(1,'rgba(0,0,0,.25)');x.fillStyle=base;x.fillRect(s.x,s.y,s.w,s.h);x.fillStyle=g;x.fillRect(s.x,s.y,s.w,s.h);}
   const hit=R.res!==null&&s.win(R.res);if(hit){x.fillStyle='rgba(255,211,107,'+(0.35+0.25*Math.sin(now/120))+')';x.fillRect(s.x,s.y,s.w,s.h);}
   x.strokeStyle='#e8e2d0';x.lineWidth=1.5;x.strokeRect(s.x,s.y,s.w,s.h);x.fillStyle='#fff';x.font='bold '+(s.n||s.k[0]==='n'?18:15)+'px '+(s.n||s.k[0]==='n'?'Georgia,serif':'monospace');x.textAlign='center';x.fillText(s.lbl,s.x+s.w/2,s.y+s.h/2+6);
   if(padMode&&i===CS.cur){x.strokeStyle='#ffd36b';x.lineWidth=4;x.strokeRect(s.x+2,s.y+2,s.w-4,s.h-4);}});
  /* the regulars' coloured chips, then yours on top */
  const off=[[-9,-7],[9,-7],[-9,7],[9,7]];R.nb.forEach(b=>{const s=roSpots().find(q=>q.k===b.k);if(!s)return;const o=off[R.ppl.indexOf(b.P)%4];casChipDraw(x,s.x+s.w/2+o[0],s.y+s.h/2+o[1],b.v,Math.min(12,s.w/2-6),b.P.chip);});
  roSpots().forEach(s=>{const v=R.bets[s.k];if(v)casChipDraw(x,s.x+s.w/2,s.y+s.h/2,v,Math.min(17,s.w/2-2));});
  /* the dolly on the winning number */
  if(R.res!==null&&!R.spin){const s=roSpots().find(q=>q.k==='n'+R.res);if(s){const dx=s.x+s.w/2,dy=s.y+s.h/2-4;x.fillStyle='rgba(0,0,0,.4)';x.beginPath();x.ellipse(dx+3,dy+12,11,6,0,0,TAU);x.fill();
   const dg=x.createLinearGradient(dx-10,0,dx+10,0);dg.addColorStop(0,'rgba(200,220,255,.75)');dg.addColorStop(0.5,'rgba(255,255,255,.95)');dg.addColorStop(1,'rgba(160,180,220,.75)');x.fillStyle=dg;x.fillRect(dx-9,dy-8,18,18);x.fillStyle='#d8b060';x.beginPath();x.ellipse(dx,dy-8,9,4,0,0,TAU);x.fill();}}
  /* the last numbers */
  x.textAlign='left';x.font='bold 16px monospace';x.fillStyle='#ffe9a8';x.fillText('LAST NUMBERS',392,95);R.hist.forEach((q,i)=>{x.fillStyle=roNum(q);casRR(x,532+i*34,76,30,26,5);x.fill();x.fillStyle='#fff';x.textAlign='center';x.fillText(String(q),547+i*34,95);x.textAlign='left';});
  if(R.res!==null&&!R.spin){x.fillStyle=roNum(R.res);x.beginPath();x.arc(cx,cy,30,0,TAU);x.fill();x.strokeStyle='#ffd36b';x.lineWidth=3;x.stroke();x.fillStyle='#fff';x.font='bold 28px Georgia,serif';x.textAlign='center';x.fillText(String(R.res),cx,cy+10);}
  for(const P of R.ppl)casPersonDraw(x,P,CAS_ROX[P.k]||830,H-24,0.85,now);}};

/* ---------- CRAPS: pass line, don't pass, odds, field, any seven; the rail backs the shooter ---------- */
const CAS_CR={bets:{},point:0,dice:[3,4],roll:null,lastRoll:0,hist:[],ppl:[]};
const CR_SPOTS=[{k:'pass',lbl:'PASS LINE',x:60,y:420,w:620,h:70},{k:'dp',lbl:"DON'T PASS BAR",x:60,y:360,w:400,h:50},{k:'odds',lbl:'ODDS',x:470,y:360,w:210,h:50},{k:'field',lbl:'FIELD  2 PAYS 2 · 12 PAYS 3',x:60,y:270,w:620,h:80},{k:'any7',lbl:'ANY 7 · 4 TO 1',x:700,y:270,w:220,h:80}];
const CR_ODDS={4:2,10:2,5:1.5,9:1.5,6:1.2,8:1.2};
const CR_PX=[190,335,480,625,75,885];/* where the rail regulars stand, by seat */
const crTotal=()=>Object.values(CAS_CR.bets).reduce((a,b)=>a+b,0);
function crPlace(k){const C=CAS_CR,tb=CS.tb,v=CS.chip;if(C.roll)return;
 if((k==='pass'||k==='dp')&&C.point){casMsg('The point is on: line bets wait for the next come-out. Back your pass bet with ODDS.');sfx('blip');return;}
 if(k==='odds'){if(!C.point||!C.bets.pass){casMsg('Odds go behind a pass line bet once a point is set.');sfx('blip');return;}if((C.bets.odds||0)+v>C.bets.pass*2){casMsg('Odds up to twice your pass bet.');sfx('blip');return;}}
 if(crTotal()+v>tb.max*3){casMsg('That is the table limit.');sfx('blip');return;}if(!casCan(v)){casMsg('Not enough cash.');sfx('blip');return;}
 casTake(v);C.bets[k]=(C.bets[k]||0)+v;casSnd('chip');const s=CR_SPOTS.find(q=>q.k===k);casMsg('$'+fmt(C.bets[k])+' on '+s.lbl.split('  ')[0]+'.');casUI();}
function crClear(){const C=CAS_CR;if(C.roll)return;let back=0;for(const k of Object.keys(C.bets)){if(C.point&&(k==='pass'||k==='dp'))continue;back+=C.bets[k];delete C.bets[k];}casGive(back);casMsg(back?'Took back $'+fmt(back)+'.':C.point?'Line bets stay until the point is decided.':'');casUI();}
function crRoll(){const C=CAS_CR,tb=CS.tb;if(C.roll)return;const t=crTotal();if(!t){casMsg('Bet on the PASS LINE (or the field) to roll.');sfx('blip');return;}
 if(!C.point&&!(C.bets.pass||C.bets.dp)&&t<tb.min){casMsg('Table minimum is $'+fmt(tb.min)+'.');sfx('blip');return;}
 const d=[1+Math.floor(casR()*6),1+Math.floor(casR()*6)];C.roll={t0:performance.now(),d};CS.say='';casSnd('dice');casQ(1300,()=>crResolve(d));casUI();}
/* the regulars on the rail: back on the line each come-out, odds once there is a point, a field bet now and then (their money, not yours) */
function crNpcBet(){const C=CAS_CR,m=CS.tb.min;for(const P of C.ppl){const b=P.bets;if(!C.point&&!b.pass&&!b.dp){if(Math.random()<0.82)b.pass=m*pick([1,1,2,3]);else b.dp=m*pick([1,2]);}
  if(C.point&&b.pass&&!b.odds&&Math.random()<0.6)b.odds=b.pass*pick([1,2]);if(!b.field&&Math.random()<0.25)b.field=m;}}
function crNpc(s,pt){let talk=0;for(const P of CAS_CR.ppl){const b=P.bets;let net=0;const st=(k,mult)=>{if(b[k]){net+=b[k]*(mult-1);delete b[k];}};
  if(b.field)st('field',s===2?3:s===12?4:[3,4,9,10,11].includes(s)?2:0);
  if(!pt){if(s===7||s===11){st('pass',2);st('dp',0);}else if(s===2||s===3){st('pass',0);st('dp',2);}else if(s===12){st('pass',0);st('dp',1);}}
  else if(s===pt){st('odds',1+CR_ODDS[s]);st('pass',2);st('dp',0);}else if(s===7){st('odds',0);st('pass',0);st('dp',2);}
  if(net){P.net+=net;if(talk<2&&(Math.abs(net)>=CS.tb.min*2||Math.random()<0.3)){talk++;casSay(P,net>0?(pt&&s===pt?'point':'win'):(pt&&s===7?'seven':'lose'));}else{P.mood=net>0?1:-1;P.moodT=performance.now();}}}}
function crResolve(d){const C=CAS_CR,s=d[0]+d[1],pt=C.point;C.roll=null;C.dice=d;C.hist.unshift(s);C.hist=C.hist.slice(0,10);let stake=0,back=0;const out=[];const settle=(k,mult,lbl)=>{const v=C.bets[k];if(!v)return;stake+=v;back+=v*mult;delete C.bets[k];out.push(lbl);};
 /* one-roll bets */
 if(C.bets.field)settle('field',s===2?3:s===12?4:[3,4,9,10,11].includes(s)?2:0,[2,3,4,9,10,11,12].includes(s)?'FIELD WINS':'FIELD LOSES');
 if(C.bets.any7)settle('any7',s===7?5:0,s===7?'ANY 7 WINS':'ANY 7 LOSES');
 if(!C.point){if(s===7||s===11){settle('pass',2,'PASS WINS');settle('dp',0,"DON'T PASS LOSES");}
  else if(s===2||s===3){settle('pass',0,'CRAPS · PASS LOSES');settle('dp',2,"DON'T PASS WINS");}
  else if(s===12){settle('pass',0,'CRAPS · PASS LOSES');settle('dp',1,"DON'T PASS PUSHES");}
  else{C.point=s;out.push('THE POINT IS '+s);}}
 else if(s===C.point){settle('odds',1+CR_ODDS[s],'ODDS WIN');settle('pass',2,'PASS WINS');settle('dp',0,"DON'T PASS LOSES");out.push('POINT MADE');C.point=0;}
 else if(s===7){settle('odds',0,'ODDS LOSE');settle('pass',0,'SEVEN OUT');settle('dp',2,"DON'T PASS WINS");C.point=0;}
 crNpc(s,pt);crNpcBet();
 if(stake){casGive(back);const net=casSettle(stake,back);if(net>0){casWin(s+'!  +$'+fmt(net));casSnd('win');}else if(net<0)casSnd('lose');}
 CS.say=s===7&&!C.point?'Seven!':s===2||s===3||s===12?'Craps!':s===11?'Yo-leven!':s+(d[0]===d[1]?' the hard way!':', '+s+'.');
 casMsg('ROLLED '+s+' ('+d[0]+'+'+d[1]+')'+(out.length?' · '+out.join(' · '):''));casUI();}
/* a red casino die: rounded, a little see-through, white pips */
function crDie(x,cx,cy,v,s,rot){x.save();x.translate(cx,cy);x.rotate(rot||0);x.fillStyle='rgba(0,0,0,.4)';casRR(x,-s/2+4,-s/2+6,s,s,s*0.18);x.fill();
 const g=x.createLinearGradient(-s/2,-s/2,s/2,s/2);g.addColorStop(0,'#ff5058');g.addColorStop(0.6,'#c8101c');g.addColorStop(1,'#8a0610');x.fillStyle=g;casRR(x,-s/2,-s/2,s,s,s*0.18);x.fill();
 x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1.5;casRR(x,-s/2+2,-s/2+2,s-4,s-4,s*0.15);x.stroke();
 const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]}[v];
 for(const [a,b] of P){x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.arc(a*s*0.27+1,b*s*0.27+1,s*0.09,0,TAU);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(a*s*0.27,b*s*0.27,s*0.09,0,TAU);x.fill();}x.restore();}
const CAS_CRG={chips:true,title:()=>'CRAPS',sub:tb=>'$'+fmt(tb.min)+' TO $'+fmt(tb.max)+' · PASS LINE EVEN MONEY · ODDS AT TRUE ODDS · FIELD AND ANY 7',sayAt:[480,238],
 init(){const C=CAS_CR;C.bets={};C.point=0;C.roll=null;C.ppl=casPeople(CS.tb);crNpcBet();if(C.ppl.length)casSay(pick(C.ppl),'hi');casMsg('Bet the PASS LINE, then ROLL. 7 or 11 wins on the come-out.');},
 acts(){const C=CAS_CR,t=crTotal();return [{id:'roll',lbl:'ROLL'+(t?' · $'+fmt(t):''),k:'SPACE',p:'A',code:['Space','Enter','KeyE'],fn:crRoll,dis:!!C.roll||!t},{id:'pass',lbl:C.point?'+ ODDS':'+ PASS',k:'Q',p:'X',code:['KeyQ'],fn:()=>crPlace(C.point?'odds':'pass'),alt:1,dis:!!C.roll},
  {id:'field',lbl:'+ FIELD',k:'F',p:'Y',code:['KeyF'],fn:()=>crPlace('field'),alt:1,dis:!!C.roll},{id:'clr',lbl:'TAKE DOWN',k:'C',code:['KeyC'],fn:crClear,alt:1,dis:!t||!!C.roll}];},
 /* walking away mid-round: the line bet rides until it is decided, rolled out for you */
 finish(){const C=CAS_CR;while(CS.q.length){const s=CS.q.shift();s.fn();}CS.busy=0;let n=0;while(C.point&&(C.bets.pass||C.bets.dp||C.bets.odds)&&n++<200){const d=[1+Math.floor(casR()*6),1+Math.floor(casR()*6)];crResolve(d);}
  const back=(C.bets.field||0)+(C.bets.any7||0)+(C.point?0:(C.bets.pass||0)+(C.bets.dp||0));casGive(back);C.bets={};C.point=0;},
 tap(x,y){const s=CR_SPOTS.find(q=>x>=q.x&&x<q.x+q.w&&y>=q.y&&y<q.y+q.h);if(s)crPlace(s.k);else if(x>700&&y>380)crRoll();},
 draw(x,W,H,now){const C=CAS_CR;casFelt(x,W,H);
  /* the point boxes with the puck */
  [4,5,6,8,9,10].forEach((n,i)=>{const bx=60+i*104,by=60;x.strokeStyle='#e8e2d0';x.lineWidth=2;x.strokeRect(bx,by,100,90);x.fillStyle='#fff';x.font='bold 40px Georgia,serif';x.textAlign='center';x.fillText(n===6?'SIX':n===9?'NINE':String(n),bx+50,by+62);
   if(C.point===n){x.fillStyle='rgba(0,0,0,.4)';x.beginPath();x.arc(bx+52,by+21,17,0,TAU);x.fill();const pg=x.createRadialGradient(bx+46,by+12,2,bx+50,by+18,17);pg.addColorStop(0,'#fff');pg.addColorStop(1,'#c8c8d0');x.fillStyle=pg;x.beginPath();x.arc(bx+50,by+18,16,0,TAU);x.fill();x.fillStyle='#111';x.font='bold 12px monospace';x.fillText('ON',bx+50,by+22);}});
  if(!C.point){x.fillStyle='rgba(0,0,0,.4)';x.beginPath();x.arc(743,108,26,0,TAU);x.fill();x.fillStyle='#111';x.beginPath();x.arc(740,105,26,0,TAU);x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();x.fillStyle='#fff';x.font='bold 13px monospace';x.textAlign='center';x.fillText('OFF',740,110);}
  x.fillStyle='#ffe9a8';x.font='16px monospace';x.textAlign='center';x.fillText(C.point?'POINT '+C.point+' · MAKE IT AGAIN BEFORE A 7':'COME-OUT ROLL · 7 OR 11 WINS',W/2,180);
  x.font='13px monospace';x.fillText('LAST ROLLS',845,160);x.fillText(C.hist.slice(0,6).join(' · '),845,180);
  CR_SPOTS.forEach(s=>{x.strokeStyle='#e8e2d0';x.lineWidth=2;x.strokeRect(s.x,s.y,s.w,s.h);if(s.k==='any7'){x.fillStyle='#8a0a16';x.fillRect(s.x,s.y,s.w,s.h);}x.fillStyle=s.k==='field'?'#ffd36b':'#fff';x.font='bold 18px monospace';x.textAlign='center';x.fillText(s.lbl,s.x+s.w/2,s.y+s.h/2+(s.k==='field'?-6:6));
   if(s.k==='field'){x.font='14px monospace';x.fillStyle='#fff';x.fillText('2 · 3 · 4 · 9 · 10 · 11 · 12',s.x+s.w/2,s.y+s.h/2+18);}
   if((s.k==='pass'||s.k==='dp')&&C.point){x.fillStyle='rgba(0,0,0,.25)';x.fillRect(s.x,s.y,s.w,s.h);}
   if(s.k==='odds'&&(!C.point||!C.bets.pass)){x.fillStyle='rgba(0,0,0,.35)';x.fillRect(s.x,s.y,s.w,s.h);}});
  /* the rail's bets in their colours, then yours */
  C.ppl.forEach((P,i)=>{const b=P.bets;if(b.pass)casChipDraw(x,84+i*40,462,b.pass,13,P.chip);if(b.dp)casChipDraw(x,80+i*22,388,b.dp,11,P.chip);if(b.odds)casChipDraw(x,486+i*14,394,b.odds,11,P.chip);if(b.field)casChipDraw(x,548+i*24,330,b.field,11,P.chip);});
  CR_SPOTS.forEach(s=>{const v=C.bets[s.k];if(v)casChipDraw(x,s.x+s.w-40,s.y+s.h/2,v,18);});
  /* the dice, tumbling down the table */
  let d=C.dice,dx=800,dy=440,rot=0;if(C.roll){const t=Math.min(1,(now-C.roll.t0)/1300);d=t<0.85?[1+((now/70|0)%6),1+((now/90|0)%6)]:C.roll.d;dx=930-t*130;dy=300+Math.sin(t*Math.PI*3)*40*(1-t)+t*140;rot=(1-t)*12;}
  crDie(x,dx-30,dy,d[0],44,rot);crDie(x,dx+30,dy+8,d[1],44,-rot*0.8);
  for(const P of C.ppl)casPersonDraw(x,P,CR_PX[P.k]||885,H-14,0.78,now);}};

/* ---------- PEARL CLUB: Pilar and the cage (a card, your numbers, the comp) ---------- */
function casClubDraw(x,W,H,now){const c=casProg(),t=casTier(c),T=CAS_TIERS[t],nx=CAS_TIERS[t+1];
 const gr=x.createLinearGradient(0,0,W,H);gr.addColorStop(0,'#1a0620');gr.addColorStop(1,'#08202a');x.fillStyle=gr;x.fillRect(0,0,W,H);
 /* the card */
 x.save();x.translate(70,70);const cg=x.createLinearGradient(0,0,380,240);cg.addColorStop(0,t===3?'#2a1030':t===2?'#c8a040':t===1?'#c8c8d4':'#4a3a6a');cg.addColorStop(1,t===3?'#ff9ec7':t===2?'#fff0a8':t===1?'#ffffff':'#8a7ab0');
 x.fillStyle=cg;x.beginPath();x.roundRect?x.roundRect(0,0,400,250,18):x.rect(0,0,400,250);x.fill();x.fillStyle='rgba(0,0,0,.65)';x.font='bold 30px Georgia,serif';x.textAlign='left';x.fillText('La Perla',24,52);x.font='bold 15px monospace';x.fillText('PEARL CLUB · '+T.k,24,80);
 casSymDraw(x,'pearl',340,60,46);x.font='bold 22px monospace';x.fillText(CHARS[selIdx].name,24,200);x.font='14px monospace';x.fillText('MEMBER SINCE 1986 · CARD Nº '+(100000+selIdx*7919+333).toString().slice(0,6),24,228);x.restore();
 /* numbers */
 x.textAlign='left';x.fillStyle='#ffe9a8';x.font='bold 22px monospace';const L=[['TOTAL WAGERED','$'+fmt(c.wag)],['NET WIN / LOSS',(c.net>=0?'+$':'-$')+fmt(Math.abs(c.net))],['BIGGEST WIN','$'+fmt(c.best)],['BETS SETTLED',fmt(c.n)],['VISITS',fmt(c.vis)]];
 L.forEach(([a,b],i)=>{x.fillStyle='#c9b6f2';x.fillText(a,520,90+i*44);x.fillStyle=a.startsWith('NET')?(c.net>=0?'#7dff9a':'#ff8a95'):'#fff';x.textAlign='right';x.fillText(b,920,90+i*44);x.textAlign='left';});
 /* the next tier */
 x.fillStyle='#fff';x.font='bold 18px monospace';x.fillText(nx?'NEXT: '+nx.k+' CARD AT $'+fmt(nx.at)+' WAGERED':'THE HIGHEST CARD IN THE HOUSE',70,370);
 x.fillStyle='rgba(255,255,255,.15)';x.fillRect(70,385,850,22);x.fillStyle=nx?nx.col:T.col;x.fillRect(70,385,850*(nx?Math.min(1,(c.wag-T.at)/(nx.at-T.at)):1),22);
 x.font='16px monospace';x.fillStyle='#ffe9a8';const perks=['SILVER: drinks on the house at the bar · $250 comp each job','GOLD: the Salon Prive without the $25,000 rule · $1,000 comp','BLACK PEARL: Pilar\'s $5,000 comp every job'];perks.forEach((s,i)=>{x.fillStyle=t>=i+1?'#7dff9a':'#8a7a9a';x.fillText((t>=i+1?'✓ ':'· ')+s,70,440+i*26);});}
function casCompReady(){const c=casProg(),t=casTier(c),j=(myProg().arm||{}).jobs||0;return t>=1&&c.comp!==j;}
function casComp(){if(!casCompReady())return;const c=casProg(),t=casTier(c),amt=CAS_COMP[t];c.comp=(myProg().arm||{}).jobs||0;casGive(amt);saveProg();casSnd('win');casWin('PILAR\'S COMP  +$'+fmt(amt),'#ffd36b');casMsg('"For my favourite regular. Spend it here, cariño."');casUI();}
const CAS_CLUB={chips:false,title:()=>CS.tb.who==='cage'?'THE CAGE · CASHIER':'DOÑA PILAR CASTELLANOS',sub:()=>'PEARL CLUB · '+CAS_TIERS[casTier()].k+' CARD',
 init(){casMsg(CS.tb.who==='cage'?'"Wins go straight to your pocket here, sir. Here is your card."':pick(['"Your card, cariño. Play more, I give more."','"In Havana, a regular got a cigar. In Miami, cash."','"The house always remembers its friends."']));},
 acts(){return casCompReady()?[{id:'comp',lbl:'COLLECT COMP · $'+fmt(CAS_COMP[casTier()]),k:'SPACE',p:'A',code:['Space','Enter','KeyE'],fn:casComp}]:[];},
 draw:casClubDraw};
function casClub(who){casOpen('club',{id:null,who,min:0,max:0});}
const CAS_G={slot:CAS_SLOT,bj:CAS_BJG,roul:CAS_ROG,craps:CAS_CRG,club:CAS_CLUB};

/* ---------- the car menu: CASINO LA PERLA is a pin on the map (travel.js) ---------- */
function casCarGo(){if(state!=='carmenu'||fading)return;sfx('pick');state='play';show(null);travel(()=>{loadHub('casino');hubArrive(G);},CAS_NAME,'SLOTS · BLACKJACK · ROULETTE · CRAPS');}
(function(){const b=document.getElementById('bCarCasino');if(b)b.onclick=casCarGo;
 window.addEventListener('keydown',e=>{if(typeof state!=='undefined'&&state==='carmenu'&&e.code==='KeyK'&&b&&b.style.display!=='none'){e.preventDefault();e.stopImmediatePropagation();casCarGo();}},true);})();
