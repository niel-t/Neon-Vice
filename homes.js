'use strict';
/* MORE HOMES AT SUNSHINE REALTY: four more places to live, sold by Barbara Brightwater at the mall next to Room 14, the studio,
   the penthouse and Villa Solana. Each is one map with real rooms (doors, windows, a bed that grows with the girls, a bathroom,
   a kitchen), its own outside, the home phone, the gun locker, the wardrobe / weight bench / minibar from homelife.js, parties,
   bodyguards, pets and the shared furniture (drawn in the style of the home it is closest to: g.home's "look"), plus a few
   upgrades nobody else has.
     home4  CASITA · LITTLE HAVANA   $6,500   a pastel bungalow on a side street off Calle Ocho: front porch, chain-link fence,
                                              back yard with a mango tree. Upgrades: domino table (the old men play for money),
                                              caja china pig roast, a hammock.
     home5  THE LOW TIDE · HOUSEBOAT $18,000  moored at Dinner Key: a cabin with a bedroom, salon and galley and the head, decks all
                                              round, a gangway to the pier. Upgrades: fishing chairs (cast a line), a tiki bar on the
                                              bow, a jet ski tied alongside.
     home6  THE FLAMINGO ARMS · DECO $28,000  a corner condo in an Art Deco block on Ocean Drive, curved balcony over the beach, up
                                              the lift from the lobby like the studio. Upgrades: a jukebox, a balcony bistro set, a
                                              pink neon FLAMINGO on the balcony.
     home7  CASA DEL SOL · THE GROVE $95,000  a Spanish villa in Coconut Grove round a courtyard with a fountain, pool and spa in the
                                              back garden under a banyan, a front loggia and a gated drive. After the Shark is dead.
                                              Upgrades: koi pond, macaw aviary, a grotto waterfall at the pool, an outdoor cinema.
   Map cell (x,z) is world (x+1,z+1); everything below is in world coordinates unless it says map.
   Loaded after mansion.js, before the main inline script: nothing here touches main-script globals or WebGL at load time;
   rhRegister() (called from the inline script) adds the homes to the shared per-home tables. */
const RH_FIRST=4;
const RH_HOMES=[
 {name:'CASITA · LITTLE HAVANA',price:6500,desc:'A pastel bungalow off Calle Ocho: front porch, a back yard with a mango tree, cafecito next door.'},
 {name:'THE LOW TIDE · HOUSEBOAT',price:18000,desc:'A houseboat at Dinner Key: cabin, salon and galley, decks all round. Rocks you to sleep.'},
 {name:'THE FLAMINGO ARMS · DECO CONDO',price:28000,desc:'A corner condo in an Art Deco block on Ocean Drive. Portholes, glass block and a curved balcony over the beach.'},
 {name:'CASA DEL SOL · COCONUT GROVE',price:95000,needs:'sharkDead',lockTxt:'AFTER THE SHARK IS DEAD',lockMsg:'The owner wants a buyer with a name in this town. Deal with the Shark first.',
  desc:'A Spanish villa round a fountain courtyard, a pool and spa under a banyan tree, a gated drive. Old money. Your money now.'}];
/* ---------------- the maps (W wall with a window, D door, R rail or fence, slots o phone f tank q table s disco ball r rug l shelf j desk p pole t pets g guards m girls n door guard, P you) ---------------- */
const RH_CASITA=["RRRRRRRRRRRRRRRRRRRRRRRRRR",
 "R,,,,,,,,,,,,,,,,,,,,,,,,R",
 "R,,,t,,,,,,,,,,,,,,,,,,,,R",
 "R,,,,,,,,,,,,,,,,,,,m,,,,R",
 "R,,,,,,,,,,,,,,,,,,,,,,,,R",
 "###WW#####W####D##WWW#WW##",
 "#......l#....#...........#",
 "#.......#....#...........#",
 "#.......#....#...........#",
 "#.......#....#.....q.....#",
 "#.......#....#...........#",
 "####D#####D###...........#",
 "#..o...f........m...j....#",
 "#........m.r.s........p..#",
 "#....m......P............#",
 "###WWW##WW##D###WWW##WW###",
 "R,,uuuuuuuuuunuuuuuuuu,,,R",
 "R,,uuuuuuguuuuuuguuuuu,,,R",
 "R,,,,,,,,,,===,,,,,,,,,,,R",
 "R,,,,,,,,,,===,,,,,,,,,,,R",
 "R,,,,,,,,,,===,,,,,,,,,,,R",
 "RRRRRRRRRRR===RRRRRRRRRRRR",
 "==========================",
 "::::::::::::::::::::::::::",
 "::::::::::::::::::::::::::"];
const RH_BOAT=["~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "~~~RRRRRRRRRRRRRRRRRRRRRRRR~~~",
 "~~~RuuuuuuuumuuuuuuuuuuuuuR~~~",
 "~~~Ruu##WW##WWWW#WW##W#uuuR~~~",
 "~~~Ruu#....#o....f.#..#uuuR~~~",
 "~~~Rut#....#.......#..#uuuR~~~",
 "~~~Ruu#....#.q..s..#..#uuuR~~~",
 "~~~Ruu#....D...rP..D..#uuuR~~~",
 "~~~Ruu#....#j.....p#..#uuuR~~~",
 "~~~Ruu#########D#######uuuR~~~",
 "~~~RuuuumuuuuuuuuuuumuuuuuR~~~",
 "~~~RRRRRRRRRRRR==RRRRRRRRRR~~~",
 "~~~~~~~~~~~~~~~==~~~~~~~~~~~~~",
 "=============n================",
 "=========g==========g=========",
 "::::::::::::::::::::::::::::::",
 "::::::::::::::::::::::::::::::"];
const RH_CONDO=["~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "yyyyyyyyyyyyyyyyyyyyyyyyyyyy",
 "yyyyyyyyyyyyyyyyyyyyyyyyyyyy",
 "yyyyyRRRRRRRRRRRRRRRRRRyyyyy",
 "yyyyyRuutuuuuuuuuuuuuuRyyyyy",
 "yyyyyRuuuuuuuumuuuuuuuRyyyyy",
 "###WWWW###WW....WWW##WWW####",
 "#........#..o...f..#.......#",
 "#........#.........#...q...#",
 "#........D.m..s............#",
 "#........#..r....p.........#",
 "###D#####..........###D#####",
 "#.....#..m.........#.l..j..#",
 "#.....#......P.....D.......#",
 "#.....#............#.......#",
 "##############D#############",
 "########ex......n...########",
 "########ex..g......g########",
 "############################"];
const RH_GROVE=["ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ",
 "Z,,,,,,,,,,,,,,,,,wwwwwwwwwww,,,,Z",
 "Z,,,,,,,,,,,,,,,,,wwwwwwwwwww,,,,Z",
 "Z,,,,,,,m,,,,,,,,,wwwwwwwwwww,,,,Z",
 "Z,,,,,,,,,,,,,,,,,uuuuuuuuuuu,,,,Z",
 "Z#####WWW####WW#####WW#..#WWW##W#Z",
 "Z#.........#....#..o.......f....#Z",
 "Z#.........#....#...............#Z",
 "Z#.........D....#....r..s.......#Z",
 "Z#.........#....#.m...........p.#Z",
 "Z#.........#....#...............#Z",
 "Z########D#######.....###########Z",
 "Z#.........#cccccccccc#....j..l.#Z",
 "Z#.........#cctccccccc#.........#Z",
 "Z#.........DccccccccccD.........#Z",
 "Z#...q.....#ccmccccmcc#.........#Z",
 "Z#.........#cccccPcccc#.........#Z",
 "Z#.........#cccccccccc#.........#Z",
 "Z##WWW##WW#####....#####WW##WWW##Z",
 "Z,uuuuuuuuuuuuuuuuunuuuuuuuuuuuu,Z",
 "Z,uuuuuuuuuuguuuuuuuuuguuuuuuuuu,Z",
 "Z,,,,,,,,,,,,,======,,,,,,,,,,,,,Z",
 "Z,,,,,,,,,,,,,==g===,,,,,,,,,,,,,Z",
 "Z,,,,,,,,,,,,,======,,,,,,,,,,,,,Z",
 "Z,,,,,,,,,,,,,======,,,,,,,,,,,,,Z",
 "ZZZZZZZZZZZZZZ======ZZZZZZZZZZZZZZ",
 "::::::::::::::::::::::::::::::::::"];
/* ---------------- the hubs ---------------- */
const RH_SLOTS='otgmfqsrljp';
function rhLeg(f,extra){const L={'.':{f},n:{f,npc:'smoker'}};for(const c of RH_SLOTS)L[c]={f};return Object.assign(L,extra);}
/* floors per room: [x0,z0,x1,z1,tile] in map cells, first match wins, 0 = the legend's floor. Built with its own data so the
   world check can re-evaluate the source on its own (no globals) */
function rhFloor(R){return new Function('x','z','const R='+JSON.stringify(R)+',X=x-1,Z=z-1;for(const r of R)if(X>=r[0]&&X<=r[2]&&Z>=r[1]&&Z<=r[3])return r[4];return 0;');}
const RH_SEA={w:39,h:0.02,top:39,water:1};
const RH_HUBS={
 home4:{name:'CASITA · LITTLE HAVANA',hub:'foot',homeT:4,wall:62,floor:61,amb:[0.33,0.3,0.28],lc:[0.54,0.46,0.38],sofa:0x2a9ea3,track:'c_vhs',where:'LITTLE HAVANA · OFF CALLE OCHO',obj:'FURNISH THE PLACE · THEN HEAD OUT',grime:0.22,
  floorFn:rhFloor([[1,6,7,10,4],[9,6,12,10,1],[14,6,24,11,27],[1,12,24,14,61]]),
  legend:rhLeg(61,{',':{f:17},'=':{f:34},':':{f:7},u:{f:37},W:{w:62,h:0.42},R:{w:56,h:0.08,top:56}}),map:RH_CASITA},
 home5:{name:'THE LOW TIDE · HOUSEBOAT',hub:'foot',homeT:5,wall:18,floor:41,amb:[0.31,0.32,0.36],lc:[0.5,0.5,0.52],sofa:0xffffff,track:'c_tide',where:'DINNER KEY MARINA · THE LOW TIDE',obj:'FURNISH THE PLACE · THEN HEAD OUT',grime:0.12,
  floorFn:rhFloor([[7,6,10,10,29],[12,6,18,10,41],[20,6,21,10,14]]),
  legend:rhLeg(41,{'~':RH_SEA,u:{f:4},'=':{f:13},':':{f:7},W:{w:18,h:0.42},R:{w:4,h:0.08,top:4}}),map:RH_BOAT},
 home6:{name:'THE FLAMINGO ARMS',hub:'foot',homeT:6,wall:44,floor:61,amb:[0.35,0.31,0.35],lc:[0.58,0.48,0.5],sofa:0xffffff,track:'c_pastel',where:'OCEAN DRIVE · THE FLAMINGO ARMS · 4TH FLOOR',obj:'FURNISH THE PLACE · THEN HEAD OUT',grime:0.14,
  floorFn:rhFloor([[1,8,8,11,4],[1,13,5,15,1],[20,8,26,11,14],[20,13,26,15,4],[7,8,19,15,61],[8,17,17,18,43]]),
  legend:rhLeg(61,{'~':RH_SEA,y:{w:38,h:0.03,top:38},u:{f:37},W:{w:44,h:0.42},R:{w:44,h:0.08,top:44},e:{w:40},x:{f:43,trig:'leave'}}),map:RH_CONDO},
 home7:{name:'CASA DEL SOL · COCONUT GROVE',hub:'foot',homeT:7,wall:41,floor:63,amb:[0.36,0.33,0.31],lc:[0.6,0.52,0.44],sofa:0xe8dcc0,track:'c_palms',where:'COCONUT GROVE · CASA DEL SOL',obj:'FURNISH THE PLACE · THEN HEAD OUT',grime:0.08,
  floorFn:rhFloor([[2,6,10,10,4],[12,6,15,10,63],[17,6,31,11,63],[2,12,10,17,27],[23,12,31,17,4]]),
  legend:rhLeg(63,{',':{f:17},'=':{f:37},':':{f:7},u:{f:61},c:{f:37},w:{w:12,h:0.02,top:12,water:1},W:{w:41,h:0.42},Z:{w:41,h:1.15,top:41}}),map:RH_GROVE}};

/* ---------------- per home: look, bed, locker, home-life pieces, party, the car or the lift, lights, upgrades ---------------- */
const RH_DEF={
 4:{look:0,map:RH_CASITA,area:'LITTLE HAVANA',bed:[2.03,6.57,1],bedW:{x:3.0,z:7.6},locker:{x:8.72,z:10.5},
  hl:{wardrobe:{x:6.5,z:7.27,ry:0,sol:[[6,7]],use:{x:6.5,z:8.1}},bench:{x:11,z:3.5,ry:0,sol:[[10,3],[11,3]],use:{x:11,z:4.35}},bar:{x:15.27,z:10.5,ry:Math.PI/2,sol:[[15,10]],use:{x:16.1,z:10.5}}},
  party:{price:800,n:6,xp:180},car:{x:14,z:24.7},title:['LITTLE HAVANA','CASITA · OFF CALLE OCHO'],carTxt:'your car is out on the street',
  walk:[[13.6,23.3],[13.5,22.4],[13.5,19.6],[13.5,17.6],[13.5,16.4],[13.5,15.4]],
  solid:[[2,7],[3,7],[11,7],[12,7],[17,7],[18,7],[19,7],[20,7],[21,7],[22,7],[23,7],[24,7],[25,7],[2,14],[3,14],[4,15],[3,15],[4,2],[6,18],[8,18]],
  lights:[[5,9.5,5,[0.75,0.6,0.42]],[12,9,3.5,[0.5,0.85,0.8]],[20.5,9.5,6,[0.85,0.7,0.48]],[6,14.5,5.5,[0.8,0.62,0.42]],[18,14.5,6,[0.75,0.6,0.45]],[13.5,18,5,[1.0,0.72,0.4],1.9],[8,3,6,[0.42,0.5,0.4],2.2],[20,3,6,[0.45,0.5,0.4],2.2],[5,24.5,6,[0.95,0.78,0.45],2.6],[23,24.5,6,[0.95,0.78,0.45],2.6]],
  cat:[{k:'domino',name:'DOMINO TABLE',price:600,desc:'A card table under the mango tree and two old men who never leave. They play for money. So can you.'},
   {k:'lechon',name:'CAJA CHINA PIG ROAST',price:700,desc:'A roasting box in the back yard and a whole pig in it. The neighbours suddenly love you.'},
   {k:'hammock',name:'YARD HAMMOCK',price:350,desc:'Strung from the mango tree to the clothesline post. Lie in it and forget McWey.'}]},
 5:{look:1,map:RH_BOAT,area:'DINNER KEY',bed:[8.03,6.57,1],bedW:{x:9.0,z:7.6},locker:{x:11.72,z:7.5},
  hl:{wardrobe:{x:11.73,z:8.6,ry:-Math.PI/2,sol:[[11,8]],use:{x:10.9,z:8.6}},bench:{x:25.5,z:8.5,ry:Math.PI/2,sol:[[25,8],[25,9]],use:{x:26.4,z:8.5}},bar:{x:13.27,z:10.4,ry:Math.PI/2,sol:[[13,10]],use:{x:14.1,z:10.4}}},
  party:{price:2000,n:6,xp:230},car:{x:16,z:18.7},title:['DINNER KEY MARINA','THE LOW TIDE'],carTxt:'your car is parked on the pier',
  walk:[[16.6,17.3],[17.0,16.3],[17.0,15.3],[17.0,14.3],[16.8,13.4],[16.5,12.6],[16.5,11.4]],
  solid:[[8,7],[9,7],[14,7],[15,7],[16,7],[21,7],[22,7],[20,8],[5,10],[5,11]],
  lights:[[9.5,9.5,4.5,[0.75,0.6,0.5]],[16,9,6,[0.8,0.7,0.52]],[22,9,3.5,[0.6,0.85,0.9]],[5.5,8.5,5,[0.9,0.6,0.35],1.6],[25.5,8.5,5,[0.9,0.6,0.35],1.6],[16,13.5,5,[0.9,0.7,0.4],1.6],[8,17,6,[0.95,0.8,0.5],2.4],[24,17,6,[0.95,0.8,0.5],2.4],[16,2,8,[0.25,0.5,0.75],0.6]],
  cat:[{k:'rig',name:'FISHING CHAIRS + RODS',price:1200,desc:'Two fighting chairs on the stern and a bucket of bait. Cast a line once a night. Sometimes the bay gives something back.'},
   {k:'tiki',name:'TIKI BAR ON THE BOW',price:3000,desc:'Bamboo, a grass roof, two torches and a blender. Coconut cups included.'},
   {k:'jetski',name:'JET SKI',price:6500,desc:'Pink and white, tied up alongside. It mostly just bobs there looking fast.'}]},
 6:{look:1,map:RH_CONDO,area:'OCEAN DRIVE',bed:[2.03,8.57,1],bedW:{x:3.0,z:9.6},locker:{x:9.72,z:9.5},
  hl:{wardrobe:{x:8.5,z:9.27,ry:0,sol:[[8,9]],use:{x:8.5,z:10.1}},bench:{x:18.0,z:6.5,ry:0,sol:[[17,6],[18,6]],use:{x:18.0,z:7.35}},bar:{x:11.27,z:9.5,ry:Math.PI/2,sol:[[11,9]],use:{x:12.1,z:9.5}}},
  party:{price:3000,n:7,xp:260},title:['OCEAN DRIVE','THE FLAMINGO ARMS'],
  lift:{at:[10.7,18.5],path:[[12.6,18.4],[15.5,18.2],[15.5,17.2],[15.5,16.2]],title:'THE FLAMINGO ARMS',from:4,to:1},
  solid:[[2,9],[3,9],[22,9],[23,9],[24,9],[25,9],[26,9],[27,9],[2,14],[3,14],[11,15],[12,15],[13,16],[24,14],[16,18],[17,18]],
  lights:[[5,11,5.5,[0.8,0.62,0.55]],[3.5,15,3.5,[0.55,0.85,0.9]],[15,11.5,6.5,[0.85,0.68,0.6]],[14,15,5.5,[0.8,0.6,0.62]],[24,10.5,5,[0.75,0.75,0.7]],[23.5,15,4.5,[0.75,0.55,0.4]],[14,6.5,7,[0.75,0.45,0.55],1.4],[13,18.5,5,[0.95,0.75,0.5]],[14,3,9,[0.6,0.5,0.55],2.6]],
  cat:[{k:'jukebox',name:'WURLITZER JUKEBOX',price:3500,desc:'Bubble tubes, chrome and a hundred 45s. Lets you pick the music at home.'},
   {k:'bistro',name:'BALCONY BISTRO SET',price:1800,desc:'A little round table and two chairs on the balcony. Coffee at sunrise, rum at sunset.'},
   {k:'neonsign',name:'PINK NEON FLAMINGO',price:2500,desc:'The building\'s name in pink neon along your balcony rail. Seen from the beach. Seen from space.'}]},
 7:{look:2,map:RH_GROVE,area:'COCONUT GROVE',bed:[3.22,6.67,1.2],bedW:{x:4.2,z:7.7},locker:{x:11.72,z:7.5},
  hl:{wardrobe:{x:10.4,z:7.27,ry:0,sol:[[10,7]],use:{x:10.4,z:8.1}},bench:{x:31.5,z:3.0,ry:Math.PI/2,sol:[[31,2],[31,3]],use:{x:32.4,z:3.0}},bar:{x:18.35,z:9.5,ry:Math.PI/2,sol:[],use:{x:19.3,z:9.5},built:1}},
  party:{price:10000,n:10,xp:450},car:{x:18,z:23.3},title:['COCONUT GROVE','CASA DEL SOL'],carTxt:'your car is in the drive',
  walk:[[17.6,21.6],[17.5,20.4],[17.5,19.3],[17.5,18.3]],
  inPath:[[18,45],[18,27.6],[17.4,25.4],[16.3,24.0],[17.0,23.35],[18,23.3]],depart:c=>[[c.x,c.z],[19.8,23.5],[20.3,25.0],[18.6,27.2],[18,30],[18,46]],
  solid:[[3,7],[4,7],[5,7],[13,7],[14,7],[3,13],[4,13],[5,13],[6,13],[7,13],[8,13],[9,13],[18,9],[18,10],[27,10],[28,10],[29,11],[17,14],[18,14],[17,15],[18,15],[14,2],[15,2],[16,2],[14,3],[15,3],[16,3],[4,2],[5,2],[4,3]],
  lights:[[6.5,9,6,[0.85,0.68,0.5]],[14.5,9,4,[0.8,0.85,0.9]],[24,9,7,[0.95,0.78,0.55],2.4],[7,15.5,6,[0.85,0.7,0.5]],[28,15.5,6,[0.8,0.62,0.4]],[18,16,7,[0.75,0.8,0.95],2.2],[24.5,3.5,8,[0.22,0.55,0.75],0.6],[15.5,3,4,[0.3,0.6,0.9],0.8],[17.5,21,7,[1.0,0.75,0.45],2.0],[14.5,26.5,4,[1.1,0.8,0.4],1.6],[21.5,26.5,4,[1.1,0.8,0.4],1.6],[7,3,6,[0.4,0.5,0.4],2.4]],
  cat:[{k:'koi',name:'KOI POND',price:9000,desc:'A lily pond under the banyan with fat orange koi. They have cost more than your first car.'},
   {k:'aviary',name:'MACAW AVIARY',price:7500,desc:'A white iron birdcage in the courtyard and two macaws who learned to swear from the last owner.'},
   {k:'grotto',name:'POOL GROTTO WATERFALL',price:22000,desc:'Rocks, ferns and a waterfall over the far end of the pool. Lit blue at night.'},
   {k:'cinema',name:'OUTDOOR CINEMA',price:16000,desc:'A screen on the garden wall, two loungers and a projector. Tonight: something with speedboats.'}]}};
const RH_LINES={viejo:["Capicúa! Pay up, chico.","In Havana I had a house with forty windows. Now I have dominoes.","Your mother would want you to sit down and play.","The fat one cheats. Don't tell him I said so.","Cafecito? There's always cafecito."],
 macaw:["SQUAWK! PAY McWEY!","HELLO SAILOR!","WHO'S A PRETTY BOY? NOT YOU!","SQUAWK! DON'T SHOOT!","FREEZE! METRO-DADE! ...HEH HEH."]};
const rhDef=t=>RH_DEF[t]||null;
/* the look a home's shared furniture and home-life pieces use: motel (0), studio (1) or penthouse (2) */
function homeLook(t){return t<3?t:t===3?2:(RH_DEF[t]?RH_DEF[t].look:0);}
/* add the homes to the per-home tables in the main script and homelife.js (called once from the inline script) */
function rhRegister(){const SL={tank:'f',dine:'q',disco:'s',rug:'r',shelf:'l',desk:'j',guards:'g',girls:'m',pole:'p',dog:'t',cat:'t',iguana:'t',doberman:'t'};
 for(const k of Object.keys(RH_DEF)){const t=+k,d=RH_DEF[t],has=c=>d.map.some(r=>r.includes(c));
  BIG_BED[t]=d.bed;HOME_BED_WORLD[t]=d.bedW;HOME_LOCKER_WORLD[t]=d.locker;
  FURN_X[t]=FURN_X[d.look].filter(it=>!SL[it.k]||has(SL[it.k]));FURN_CAT[t]=d.cat;
  HL_CAT[t]=(HL_CAT[d.look]||[]).filter(it=>d.hl[it.k]&&!d.hl[it.k].built);HL_POS[t]=d.hl;HL_PARTY[t]=d.party;
  if(d.lift)HOME_LIFT[t]=d.lift;}
 Object.assign(HOME_NPC_LINES,RH_LINES);}

/* ---------------- setup (from homeSetup) ---------------- */
function rhSetup(g,t){const d=RH_DEF[t],W=g.W,H=g.H,leg=g.def.legend;g.rhome=t;g.rdef=d;g.rh={T:0,fish:[]};
 /* the loader's padding ring: carry the outside surface out to it (sea, sand, street, lawn) instead of a dark wall */
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){if(z>0&&x>0&&x<W-1&&z<H-1)continue;const X=Math.min(W-3,Math.max(0,x-1)),Z=Math.min(H-3,Math.max(0,z-1)),ch=(d.map[Z]||'')[X],i=z*W+x,L=leg[ch];
  if(!L||ch==='#'||ch==='Z'||ch==='W')continue;const tex=L.w?L.top||L.w:L.f;if(L.w&&L.h>0.1)continue;g.wh[i]=L.water?0.02:0.03;g.wallT[i]=g.topT[i]=tex;g.glow[i]=L.water?2:0;}
 buildStatic(g);
 /* furniture that blocks (after the static build, or the grid would draw it as walls) */
 for(const [x,z] of d.solid)if(x>0&&z>0&&x<W-1&&z<H-1)g.solid[z*W+x]=1;
 const lp=d.locker;g.solid[Math.floor(lp.z)*W+Math.floor(lp.x)]=1;
 for(const [x,z,r,c,y] of d.lights)g.lights.push({x,z,r,c,y:y||1.9});
 if(d.car){const c=d.car;g.hcar={x:c.x,z:c.z,a:0,spin:0};g.solids=g.solids||[];g.solids.push({x:c.x,z:c.z,w:2.35,d:1.05});g.trigs.push({x:c.x-0.5,z:c.z-0.78,t:'leave'});g.car={x:c.x,z:c.z};}
 if(t===7)g.fount={x:18,z:15.2};
 g.obj='FURNISH THE PLACE · THEN HEAD OUT';}
/* upgrades: solids, lights and the people who come with them (homeExtras; safe to call again after buying) */
function rhExtras(g,f){const t=g.rhome,sp=g.spawned,sol=(x,z)=>{if(x>0&&z>0&&x<g.W-1&&z<g.H-1)g.solid[z*g.W+x]=1;},L=(k,x,z,r,c,y)=>{if(g['rhL'+k])return;g['rhL'+k]=1;g.lights.push({x,z,r,c,y:y||1.4});};g.fixK=-1;
 const npc=(kind,x,z,look,a,seat)=>{const n=makeChar(x,z,look,false);n.kind=kind;n.state='idle';n.a=n.a0=a||0;n.r=0.3;n.body=look.body;n.said=false;if(seat)Object.assign(n,{seat:true,seatK:1,y:0.06});g.npcs.push(n);return n;};
 if(t===4){if(f.domino){sol(17,3);if(!sp.domino){sp.domino=1;npc('viejo',16.75,3.5,Object.assign(NPCLOOK.guest(),{hair:hex(0xd8d8d8),shirt:hex(0xf4f1e6),jacket:hex(0xf4f1e6),tee:true}),Math.PI/2,1);npc('viejo',18.25,3.5,Object.assign(NPCLOOK.guest(),{hair:hex(0xbcbcbc),shirt:hex(0xb8d8ee),jacket:hex(0xb8d8ee),tee:true}),-Math.PI/2,1);}}
  if(f.lechon){sol(22,2);sol(23,2);L('pig',22.6,2.6,3.5,[1.1,0.5,0.15],0.8);}
  if(f.hammock){sol(8,1);}}
 if(t===5){if(f.tiki){for(const z of [9,10,11])sol(5,z);L('tiki',5.6,10,4.5,[1.1,0.55,0.2],1.6);}
  if(f.rig){sol(24,12);sol(26,12);}}
 if(t===6){if(f.jukebox){sol(19,13);L('juke',19.4,13.5,3.5,[1.1,0.4,0.8],1.2);}if(f.bistro){sol(10,6);}if(f.neonsign)L('neon',14.5,5.4,6,[1.3,0.3,0.75],0.9);}
 if(t===7){if(f.koi){for(const [x,z] of [[9,2],[10,2],[11,2],[9,3],[10,3],[11,3]])sol(x,z);}
  if(f.aviary){for(const [x,z] of [[21,13],[22,13],[21,14],[22,14]])sol(x,z);if(!sp.macaw){sp.macaw=1;g.rh.birds=[{x:21.7,z:13.9,c:[0.9,0.1,0.1],ph:0},{x:22.3,z:14.2,c:[0.1,0.45,0.95],ph:1.7}];}}
  if(f.grotto)L('grotto',29.4,2.6,5,[0.2,0.6,1.1],1.0);
  if(f.cinema){sol(12,4);sol(13,4);L('cine',12,2.2,5,[0.6,0.6,0.9],1.2);}}}
function rhBanner(g){const t=g.rhome,d=RH_DEF[t];banner(HOMEDEF[t].name,(touchMode?'Tap':'Click')+' the phone for furniture and side jobs · '+(d.lift?'the lift takes you down to your car':d.carTxt));}
/* coming home: the car pulls up and you walk in; at the Flamingo Arms the lift brings you up from the lobby */
function rhArrive(g){if(!g||!g.rhome)return;const d=g.rdef;
 if(d.lift){const L=d.lift,p=g.player;if(!p)return;p.x=L.at[0];p.z=L.at[1];p.a=Math.PI/2;seqCamTo(g,p.x+1,p.z);sfx('ding');
  startSeq([{k:'hide',quiet:1},{k:'card',t1:d.title[0],t2:d.title[1]},{k:'wait',dur:0.6},{k:'walk',path:L.path,face:Math.PI,sp:2.4}],g=>rhBanner(g));return;}
 const c=g.hcar,c0=d.car;if(!c)return;seqCamTo(g,c0.x,c0.z-1);
 startSeq([{k:'hide',quiet:1},{k:'card',t1:d.title[0],t2:d.title[1]},{k:'drive',car:c,path:d.inPath||[[-7,c0.z],[c0.x,c0.z]],dur:d.inPath?4.0:2.6,ease:'out',camEnd:1},{k:'wait',dur:0.35},
  {k:'out',car:c,at:[c0.x-0.3,c0.z-0.72],a:Math.PI},{k:'walk',path:d.walk,face:Math.PI}],g=>rhBanner(g));}
function rhDepartPath(g,c){const d=g.rdef;return d&&d.depart?d.depart(c):null;}

/* ---------------- what you can press, where you can sit ---------------- */
function rhTargets(g,t){const f=homeFurn(),h=g.rhome,p=myProg(),a=arm();
 if(h===4&&f.domino)t.push({k:'rh',x:17.5,z:4.45,r:1.5,lbl:p.rhDom===a.jobs?'DOMINOES · THEY WANT A REMATCH TOMORROW':'PLAY DOMINOES · $100 A HAND',fn:()=>rhDomino(g)});
 if(h===4&&f.lechon)t.push({k:'rh',x:22.6,z:3.6,r:1.4,lbl:'GRAB A PLATE OF LECHON',fn:()=>rhLechon(g)});
 if(h===5&&f.rig)t.push({k:'rh',x:25.3,z:12.4,r:1.5,lbl:p.rhFish===a.jobs?'FISHING · NOTHING BITING TILL TOMORROW':'CAST A LINE',fn:()=>rhFish(g)});
 if(h===6&&f.jukebox)t.push({k:'hifi',x:18.75,z:13.5,r:1.6,lbl:'JUKEBOX · CHANGE TRACK'});
 if(h===7&&f.aviary)t.push({k:'rh',x:21.8,z:15.4,r:1.6,lbl:'TALK TO THE MACAWS',fn:()=>rhMacaw(g)});}
function rhSeats(g){const t=g.rhome,f=homeFurn(),L=[],add=(x,z,a,y,lbl,o)=>L.push(Object.assign({x,z,a,y,lbl},o||{}));
 if(t===4){for(const x of [2.9,3.6])add(x,14.62,0,0.1,'SIT ON THE SOFA');add(4.25,15.4,-0.5,0.08,'SIT IN THE ARMCHAIR');for(const x of [6.0,7.8])add(x,17.75,0,0.08,'SIT IN THE ROCKING CHAIR',{out:{x,z:18.6}});
  if(f.hammock)add(6.4,2.3,Math.PI/2,0.36,'LIE IN THE HAMMOCK',{out:{x:6.4,z:3.4}});}
 if(t===5){add(5.6,7.2,0,0.02,'LIE ON THE LOUNGER',{out:{x:6.4,z:7.3}});if(f.tiki)for(const z of [9.3,10.1,10.9])add(6.45,z,-Math.PI/2,0.32,'SIT AT THE TIKI BAR',{out:{x:6.6,z:z}});
  if(f.rig)for(const x of [24.6,26.0])add(x,12.25,0,0.12,'SIT IN THE FIGHTING CHAIR',{out:{x,z:13.1}});}
 if(t===6){for(const x of [11.75,12.4])add(x,14.62,0,0.1,'SIT ON THE SOFA');add(13.05,15.4,-0.5,0.08,'SIT IN THE ARMCHAIR');add(22.5,16.0,0,0.06,'SIT IN THE READING CHAIR');
  if(f.bistro)for(const [x,a] of [[9.9,-Math.PI/2],[11.1,Math.PI/2]])add(x,6.6,a,0.08,'SIT AT THE BISTRO TABLE');}
 if(t===7){for(const x of [27.6,28.3])add(x,10.62,0,0.1,'SIT ON THE SOFA');add(29.05,11.45,-0.5,0.08,'SIT IN THE ARMCHAIR');for(let i=0;i<3;i++)add(19.2,8.7+i*0.8,-Math.PI/2,0.36,'SIT AT THE BAR',{out:{x:19.9,z:8.7+i*0.8}});
  for(const x of [26.2,28.6])add(x,4.4,Math.PI,0.0,'LIE ON THE LOUNGER',{out:{x,z:5.3}});
  if(f.cinema)for(const x of [12.2,13.4])add(x,4.6,Math.PI,0.02,'WATCH THE MOVIE',{out:{x:x,z:5.4}});
  const J=RH_TUB;J.P.forEach(([x,z,a],i)=>add(x,z,a,J.y,'GET IN THE SPA',{tub:J,ti:i,out:{x:J.out[i][0],z:J.out[i][1]}}));}
 return L;}
const RH_TUB={x:15.5,z:3.0,y:0.12,P:[[15.5,3.6,Math.PI],[16.1,3.0,-Math.PI/2],[15.5,2.4,0],[14.9,3.0,Math.PI/2]],out:[[15.5,4.6],[17.3,4.3],[13.8,4.5],[13.6,4.0]]};

/* ---------------- the little things to do ---------------- */
function rhDomino(g){const p=myProg(),a=arm(),pl=g.player;if(p.rhDom===a.jobs){sfx('blip');popup(pl.x,pl.z,'"ENOUGH FOR TONIGHT, CHICO."','#ffd36b');return;}
 if(p.wallet<100){sfx('blip');popup(pl.x,pl.z,'YOU NEED $100 TO SIT DOWN','#ff8a95');return;}
 p.rhDom=a.jobs;const win=Math.random()<0.5;p.wallet+=win?100:-100;saveProg();sfx(win?'cash':'blip');
 popup(pl.x,pl.z-0.4,win?'CAPICÚA! YOU WIN $100':'THEY DOMINO YOU · -$100',win?'#7dff9a':'#ff8a95');const v=g.npcs.find(n=>n.kind==='viejo');if(v)setTimeout(()=>{if(G===g)popup(v.x,v.z,win?'"Beginner\'s luck."':'"Again tomorrow, eh?"','#ffe9a8');},900);}
function rhLechon(g){const pl=g.player;sfx('pick');popup(pl.x,pl.z-0.3,pick(['CRISPY SKIN. PERFECT.','MOJO, GARLIC, ORANGE. YES.','LIKE ABUELA MADE IT','THE NEIGHBOURS SMELL IT FROM THE STREET']),'#ffd36b');}
const RH_CATCH=[['A SNAPPER! DINNER.',0],['AN OLD BOOT. CLASSIC.',0],['A WATERPROOF BAG... WITH CASH IN IT! +$400',400],['A BARRACUDA. IT LOOKS AT YOU. YOU LET IT GO.',0],['A PISTOL WRAPPED IN A TOWEL. YOU THROW IT BACK.',0],['A CRAB IN A BEER CAN.',0],['A WALLET. $150 STILL IN IT.',150]];
function rhFish(g){const p=myProg(),a=arm(),pl=g.player;if(p.rhFish===a.jobs){sfx('blip');popup(pl.x,pl.z,'NOTHING BITING TILL TOMORROW','#ffd36b');return;}
 p.rhFish=a.jobs;saveProg();sfx('click');g.rh.cast=2.2;popup(pl.x,pl.z-0.3,'*PLOP*','#9fd8ff');
 setTimeout(()=>{if(G!==g)return;const c=pick(RH_CATCH);if(c[1]){p.wallet+=c[1];saveProg();sfx('cash');}else sfx('pick');popup(pl.x,pl.z-0.5,c[0],c[1]?'#7dff9a':'#ffe9a8');},1600);}
function rhMacaw(g){const b=g.rh.birds;if(!b)return;sfx('blip');const q=pick(b);popup(q.x,q.z-0.2,pick(RH_LINES.macaw),'#ffd36b');q.flap=1.2;}

/* ---------------- every frame (homeTick) ---------------- */
function rhTick(g,dt){const R=g.rh;if(!R)return;R.T+=dt;updateDoors(dt);
 if(R.cast>0)R.cast-=dt;if(R.birds)for(const q of R.birds)if(q.flap>0)q.flap-=dt;
 const f=homeFurn();
 if(g.rhome===4&&f.lechon&&Math.random()<dt*6)g.parts.push({t:'c',x:22.6+rnd(-0.3,0.3),y:0.8,z:2.5+rnd(-0.2,0.2),vx:rnd(-0.1,0.2),vy:rnd(0.5,0.9),vz:rnd(-0.2,0),s:0.07,c:[0.5,0.48,0.46],life:1.4});
 if(g.rhome===7&&f.grotto&&Math.random()<dt*14)g.parts.push({t:'c',x:24.5+rnd(-1.4,1.4),y:0.9,z:2.15,vx:0,vy:-0.6,vz:rnd(0.1,0.4),s:0.05,c:[0.75,0.92,1.0],life:0.5});}

/* ================= the drawing =================
   Static pieces build once into the hub's fixed batch (rebuilt after buying something: rhExtras sets g.fixK=-1); the moving
   bits (water, flames, the fan, fish, birds, the jet ski, the doors) are drawn every frame. */
const RH_WH=[0.96,0.95,0.93],RH_PINK=[1,0.3,0.68],RH_TEAL=[0.18,0.72,0.7],RH_TERRA=[0.72,0.33,0.18],RH_LEAF=[0.16,0.48,0.2];
const rhBx=B=>(x,y,z,sx,sy,sz,c,em,ry,uv)=>B.box(TRS(x,y,z,ry||0,sx,sy,sz),c,!!em,uv);
function drawRHome(D,g,F){const t=g.rhome;if(!t)return;const B=F===undefined?D:F;
 if(B){const bx=rhBx(B),I=hiShim(B);mvWindows(B,g.def.map);rhStatic[t](B,bx,I,g,homeFurn());}
 rhDyn(D,g,homeFurn());for(const q of g.pets)drawPet(D,q,g.T);
 const DC=[null,null,null,null,[[0.18,0.62,0.6],[0.95,0.92,0.82]],[[0.55,0.36,0.2],[0.8,0.6,0.38]],[[0.98,0.96,0.94],[1,0.6,0.75]],[[0.42,0.24,0.12],[0.6,0.4,0.22]]][t];
 for(const d of g.doors||[]){const a=d.base+d.th,e=doorEnd(d),m0=A.mul(A.T((d.hx+e[0])/2,0,(d.hz+e[1])/2),A.RY(-a));D.box(A.mul(m0,TRS(0,0.56,0,0,0.98,1.1,0.06)),DC[0]);D.box(A.mul(m0,TRS(0,0.6,0,0,0.7,0.8,0.075)),DC[1]);
  D.box(TRS(d.hx+Math.cos(a)*0.84,0.56,d.hz+Math.sin(a)*0.84,-a,0.05,0.05,0.16),GOLD);}}
/* little shared pieces */
function rhCounter(bx,x0,x1,z,base,top,o){const w=x1-x0,cx=(x0+x1)/2;o=o||{};bx(cx,0.44,z,w,0.88,0.6,base);bx(cx,0.9,z,w+0.04,0.05,0.64,top);
 for(let x=x0+0.3;x<x1-0.15;x+=0.6)bx(x,0.46,z+0.302,0.5,0.7,0.01,base.map(v=>v*0.82));
 if(o.sink!==undefined){bx(o.sink,0.93,z,0.5,0.02,0.38,[0.62,0.64,0.68]);bx(o.sink,1.03,z-0.22,0.04,0.2,0.04,[0.82,0.82,0.86]);bx(o.sink,1.12,z-0.14,0.04,0.03,0.18,[0.82,0.82,0.86]);}
 if(o.stove!==undefined){bx(o.stove,0.93,z,0.58,0.02,0.52,[0.08,0.08,0.09]);for(const dx of [-0.14,0.14])for(const dz of [-0.12,0.12])bx(o.stove+dx,0.945,z+dz,0.16,0.01,0.16,[0.28,0.28,0.3]);}}
function rhFridge(bx,x,z,c){bx(x,0.9,z,0.7,1.8,0.62,c);bx(x,1.22,z+0.315,0.68,0.01,0.01,c.map(v=>v*0.7));bx(x+0.26,1.45,z+0.33,0.04,0.3,0.04,[0.8,0.8,0.84]);bx(x+0.26,0.75,z+0.33,0.04,0.3,0.04,[0.8,0.8,0.84]);}
function rhPhone(bx,o,top,c){bx(o.x,0.3,o.z,0.42,0.6,0.42,top);bx(o.x,0.63,o.z,0.24,0.06,0.18,c);bx(o.x,0.69,o.z,0.26,0.05,0.08,c.map(v=>v*0.8));for(let i=0;i<4;i++)bx(o.x+0.15+i*0.03,0.5-i*0.12,o.z+0.12,0.02,0.1,0.02,c);}
function rhPlant(B,I,x,z,s,pot){homePalm(B,I,x,z,s||0.9,pot||RH_TERRA);}
function rhRug(bx,x,z,w,d,c,b){bx(x,0.006,z,w,0.008,d,c);bx(x,0.008,z,w-0.16,0.008,d-0.16,b);}
function rhLamp(bx,x,z,c){bx(x,0.3,z,0.36,0.6,0.36,[0.35,0.24,0.14]);bx(x,0.72,z,0.05,0.24,0.05,GOLD);bx(x,0.9,z,0.3,0.2,0.3,c,true);}
/* rail and fence runs along the map's R cells: a post on every cell, a top rail joining neighbours */
function rhRails(bx,map,post,rail,h,mesh){map.forEach((row,Z)=>{for(let X=0;X<row.length;X++){if(row[X]!=='R')continue;const x=X+1.5,z=Z+1.5;bx(x,h/2,z,0.06,h,0.06,post);
  if(row[X+1]==='R')bx(x+0.5,h,z,1.0,0.05,0.05,rail);if((map[Z+1]||'')[X]==='R')bx(x,h,z+0.5,0.05,0.05,1.0,rail);
  if(mesh){if(row[X+1]==='R')bx(x+0.5,0.12,z,1.0,0.03,0.03,rail);if((map[Z+1]||'')[X]==='R')bx(x,0.12,z+0.5,0.03,0.03,1.0,rail);}}});}
/* see-through panes: glass in the windows, chain-link mesh on the casita's fence */
function rhPanes(P,g){mvPanes(P,g);if(g.rhome!==4)return;const map=g.def.map,c=[0.35,0.37,0.4];
 if(!g._rhMesh){g._rhMesh=[];map.forEach((row,Z)=>{for(let X=0;X<row.length;X++){if(row[X]!=='R')continue;if(row[X+1]==='R')g._rhMesh.push([X+2,Z+1.5,1]);if((map[Z+1]||'')[X]==='R')g._rhMesh.push([X+1.5,Z+2,0]);}});}
 for(const [x,z,h] of g._rhMesh)P.box(TRS(x,0.56,z,0,h?1.0:0.03,0.88,h?0.03:1.0),c,false,TUV[20]);}
/* a big leafy tree: trunk and a few overlapping blobs of canopy */
function rhTree(B,I,x,z,s,leaf,fruit){const bx=rhBx(B);I.r=0.8;I.tp=-0.3;I.box(TRS(x,0.7*s,z,0,0.3*s,1.4*s,0.3*s),[0.4,0.28,0.17]);I.tp=0;
 for(const [dx,dz,dy,r] of [[0,0,1.75,1.6],[0.7,0.3,1.6,1.1],[-0.65,0.35,1.55,1.15],[0.2,-0.5,1.7,1.1],[-0.3,0.55,1.95,1.0]]){I.r=1;I.box(TRS(x+dx*s,dy*s,z+dz*s,0,r*s,0.75*s,r*s),leaf.map((v,i)=>v*(0.85+0.15*((dx+dz+i)%2))));}
 I.r=0;if(fruit)for(let i=0;i<9;i++){const a=i*2.4,r=0.55+(i%3)*0.18;bx(x+Math.cos(a)*r*s,1.25*s+(i%2)*0.1,z+Math.sin(a)*r*s+0.25,0.1,0.13,0.1,fruit);}}

const rhStatic={
/* ===== CASITA, LITTLE HAVANA ===== */
4(B,bx,I,g,f){const n=bedN(),S=g.slots;
 rhRails(bx,g.def.map,[0.62,0.64,0.66],[0.7,0.72,0.74],1.0,true);
 /* the back yard: the mango tree, a clothesline with laundry, a plastic chair, the back step */
 rhTree(B,I,4.6,2.6,1.05,[0.2,0.5,0.22],[1,0.62,0.12]);
 for(const x of [13.8,23.2]){bx(x,0.85,1.7,0.07,1.7,0.07,[0.6,0.6,0.62]);bx(x,1.68,1.7,0.5,0.05,0.05,[0.6,0.6,0.62]);}bx(18.5,1.6,1.7,9.4,0.015,0.015,[0.85,0.85,0.85]);
 [[15,RH_WH],[16.2,[0.95,0.6,0.7]],[17.6,[0.5,0.75,0.95]],[19.0,[1,0.85,0.3]],[20.5,RH_WH],[21.8,[0.95,0.4,0.35]]].forEach(([x,c],i)=>bx(x,1.32-(i%2)*0.08,1.7,0.5+(i%3)*0.1,0.55,0.02,c));
 bx(16,0.06,6.25,1.2,0.12,0.5,[0.7,0.68,0.64]);
 if(!f.domino){I.r=0.3;I.box(TRS(19.5,0.22,3.6,0.3,0.45,0.04,0.45),RH_WH);I.box(TRS(19.5,0.48,3.82,0.3,0.45,0.5,0.05),RH_WH);I.r=0;}
 /* the bedroom: bed (it grows with the girls), nightstand and lamp, a picture of the old country */
 drawBigBed((x,y,z,a,b,c,col)=>bx(x+1,y,z+1,a,b,c,col),4,n,[0.5,0.32,0.18],[0.95,0.92,0.82],[0.98,0.82,0.6]);
 bx(2.4,0.3,7.05+0.98*n+0.25,0.42,0.6,0.42,[0.5,0.32,0.18]);rhLamp(bx,2.4,7.05+0.98*n+0.25,[1,0.8,0.5]);
 bx(5.0,1.35,7.02,0.9,0.6,0.03,[0.45,0.3,0.15]);bx(5.0,1.35,7.035,0.8,0.5,0.01,[0.3,0.6,0.85]);bx(5.0,1.22,7.04,0.8,0.18,0.01,[0.2,0.55,0.25]);
 rhRug(bx,5.6,10.0,1.8,1.2,[0.85,0.4,0.3],[0.95,0.75,0.45]);
 /* the bathroom: pink and teal tile */
 drawBathroomAt(bx,I,11.0,8.0,[0.4,0.78,0.75],[0.96,0.9,0.92]);bx(12.2,1.4,7.03,0.5,0.6,0.02,[0.75,0.85,0.9]);
 /* the kitchen: mint cabinets, a white fridge, the cafetera on the stove, a little altar of cafecito cups */
 rhCounter(bx,17.0,25.0,7.35,[0.55,0.85,0.75],[0.95,0.94,0.9],{sink:20.5,stove:23.3});rhFridge(bx,25.55,7.4,[0.96,0.95,0.9]);
 bx(23.2,1.02,7.25,0.12,0.18,0.12,[0.75,0.75,0.78]);for(let i=0;i<4;i++)bx(18.0+i*0.18,0.96,7.2,0.07,0.07,0.07,RH_WH);
 for(let i=0;i<3;i++)bx(19.4+i*0.5,1.55,7.05,0.32,0.32,0.03,[[1,0.5,0.4],[0.95,0.85,0.4],[0.4,0.75,0.95]][i]);
 /* the living room: a floral sofa and armchair, coffee table, the TV on its cart, the phone, a saint's candle, a fan overhead */
 drawSeatingAt(bx,I,3.2,14.6,[0.9,0.55,0.45],[0.98,0.85,0.7],[0.45,0.3,0.15]);
 rhPhone(bx,S.o||{x:4.5,z:13.5},[0.45,0.3,0.15],[0.95,0.4,0.45]);
 bx(6.4,0.3,13.3,0.7,0.6,0.45,[0.35,0.24,0.14]);bx(6.4,0.85,13.3,0.6,0.5,0.45,[0.2,0.2,0.22]);bx(6.4,0.86,13.535,0.48,0.38,0.01,[0.3,0.55,0.6],true);
 rhRug(bx,13.5,14.4,3.2,1.4,[0.3,0.6,0.62],[0.95,0.9,0.75]);
 bx(9.6,1.35,12.04,0.7,0.5,0.02,[0.6,0.45,0.2]);bx(9.6,1.35,12.05,0.6,0.4,0.01,[0.95,0.85,0.5]);
 /* the front porch: posts, a low rail, two rocking chairs, pots of hibiscus; the mailbox at the gate; a palm and two pink flamingos in the lawn */
 for(const x of [3.3,8.2,18.8,22.8]){bx(x,1.0,18.9,0.14,2.0,0.14,RH_WH);bx(x,0.04,18.9,0.24,0.08,0.24,RH_WH);}
 for(const [x0,x1] of [[3.3,12.2],[14.8,22.8]]){bx((x0+x1)/2,0.62,18.92,x1-x0,0.06,0.06,RH_WH);bx((x0+x1)/2,0.3,18.92,x1-x0,0.04,0.04,RH_WH);for(let x=x0+0.25;x<x1;x+=0.25)bx(x,0.46,18.92,0.03,0.32,0.03,RH_WH);}
 for(const x of [6.0,7.8]){const K=hiKit(B,x,17.75,0,I);K.rb(0,0.3,0,0.5,0.06,0.5,[0.55,0.36,0.2],0.4);K.rb(0,0.62,-0.24,0.5,0.6,0.06,[0.55,0.36,0.2],0.4);for(const sx of [-0.24,0.24]){K.rr(sx,0.08,0,0,0,0,0.04,0.06,0.7,[0.45,0.28,0.15],0.6);K.rb(sx,0.2,0,0.04,0.24,0.04,[0.45,0.28,0.15],0.6);}}
 for(const [x,c] of [[4.2,[1,0.3,0.4]],[11.6,[1,0.55,0.2]],[15.4,[1,0.3,0.4]],[22.0,[1,0.85,0.3]]]){I.r=0.7;I.box(TRS(x,0.18,17.3,0,0.4,0.36,0.4),RH_TERRA);I.r=1;I.box(TRS(x,0.5,17.3,0,0.5,0.4,0.5),RH_LEAF);I.r=0;for(let i=0;i<4;i++)bx(x+Math.cos(i*1.6)*0.18,0.66,17.3+Math.sin(i*1.6)*0.18,0.1,0.06,0.1,c);}
 bx(11.4,0.55,22.3,0.06,1.1,0.06,[0.3,0.3,0.32]);bx(11.4,1.15,22.3,0.24,0.2,0.4,[0.25,0.45,0.75]);
 mvPalm(B,3.0,20.2,0.9,0.15);mvPalm(B,24.0,19.6,0.8,-0.1);
 for(const [x,z,a] of [[7.5,20.3,0.4],[8.3,20.6,-0.3]]){const K=hiKit(B,x,z,a,I);K.rb(0,0.62,0,0.16,0.18,0.3,RH_PINK,1);K.sg([0,0.68,0.12],[0,0.95,0.2],0.05,0.05,RH_PINK);K.rb(0,0.98,0.24,0.08,0.08,0.12,RH_PINK,1);K.sf([0,0.6,0],[0,0.05,0],0.02,0.02,[0.2,0.2,0.2]);}
 /* the street: a lamp each end, the kerb */
 for(const x of [5,23]){bx(x,1.3,23.2,0.08,2.6,0.08,[0.3,0.3,0.32]);bx(x+0.3,2.58,23.2,0.6,0.06,0.1,[0.3,0.3,0.32]);bx(x+0.55,2.5,23.2,0.24,0.08,0.18,[1.1,0.9,0.6],true);}
 bx(14,0.04,24.0,28,0.08,0.12,[0.75,0.75,0.72]);for(let x=1;x<28;x+=2.4)bx(x,0.012,25.9,1.2,0.01,0.08,[0.95,0.85,0.3]);
 /* upgrades */
 if(f.domino){const K=hiKit(B,17.5,3.5,0,I);K.rb(0,0.7,0,0.9,0.05,0.9,[0.2,0.45,0.25],0.2);K.legs(0.8,0.8,0.68,0.05,[0.3,0.3,0.32]);for(let i=0;i<9;i++)K.bx(-0.3+(i%5)*0.14,0.735,-0.15+Math.floor(i/5)*0.32+(i%2)*0.05,0.1,0.02,0.05,RH_WH);
  for(const sx of [-0.75,0.75]){K.rb(sx,0.36,0,0.36,0.05,0.36,[0.85,0.3,0.25],0.4);K.legs(0.3,0.3,0.34,0.04,[0.75,0.75,0.78]);}}
 if(f.lechon){const K=hiKit(B,22.6,2.6,0,I);K.rb(0,0.35,0,1.3,0.6,0.7,[0.5,0.3,0.15],0.15);K.bx(0,0.66,0,1.34,0.04,0.74,[0.25,0.25,0.27]);K.rb(0,0.74,0,1.0,0.1,0.5,[0.18,0.17,0.17],0.3);
  K.rb(0,0.6,0.52,0.7,0.3,0.25,[0.85,0.85,0.88],0.5);K.rb(0,0.84,0,0.9,0.22,0.36,[0.8,0.45,0.2],0.9);}
 if(f.hammock){bx(8.3,0.9,1.9,0.12,1.8,0.12,[0.45,0.3,0.18]);const K=hiKit(B,6.45,2.3,0,I);for(let i=0;i<7;i++){const u=i/6,y=0.62-Math.sin(u*Math.PI)*0.28;K.bx(-1.3+u*2.6,y,0,0.42,0.03,0.62,i%2?[1,0.4,0.35]:[1,0.85,0.4]);}K.sf([-1.6,1.1,0],[-1.3,0.62,0],0.02,0.02,RH_WH);K.sf([1.6,1.1,0],[1.3,0.62,0],0.02,0.02,RH_WH);}},
/* ===== THE LOW TIDE, HOUSEBOAT ===== */
5(B,bx,I,g,f){const n=bedN(),S=g.slots,TK=[0.6,0.38,0.2],NAVY=[0.1,0.18,0.42];
 /* the hull round the deck: a white topside with a navy stripe and the name on the stern, teak rails, pilings, the gangway */
 bx(15.5,0.1,14.85,23.4,0.2,0.3,RH_WH);bx(15.5,0.12,15.0,23.4,0.06,0.02,NAVY);bx(15.5,0.1,4.15,23.4,0.2,0.3,RH_WH);bx(4.15,0.1,9.5,0.3,0.2,10.8,RH_WH);bx(26.85,0.1,9.5,0.3,0.2,10.8,RH_WH);
 mallWord(B,'LOW TIDE',22.5,0.06,15.02,0.16,NAVY);
 rhRails(bx,g.def.map,TK,TK,0.85);
 for(const [x,z] of [[3.3,3.3],[27.7,3.3],[3.3,15.7],[27.7,15.7],[9,15.7],[22,15.7]]){I.r=0.8;I.box(TRS(x,0.5,z,0,0.32,1.0,0.32),[0.45,0.32,0.2]);I.r=0;bx(x,1.02,z,0.26,0.04,0.26,[0.9,0.88,0.8]);}
 for(const x of [16.0,18.0]){bx(x,0.5,15.0,0.05,1.0,0.05,[0.75,0.75,0.78]);bx(x,0.95,15.0,0.05,0.05,2.0,[0.75,0.75,0.78]);}bx(17,0.06,15.0,1.9,0.06,2.0,[0.55,0.45,0.3]);
 /* the cabin roof edge (a white eave) and a captain's wheel on the salon wall */
 bx(15,2.25,6.05,17,0.08,0.3,RH_WH);
 {const K=hiKit(B,19.72,8.0,-Math.PI/2,I);K.ring(0,1.25,0,0.32,0.05,0.05,TK,12,'z');K.cy(0,1.25,0,0.12,0.06,TK,'z');for(let i=0;i<8;i++){const a=i*Math.PI/4;K.sf([0,1.25,0],[Math.cos(a)*0.42,1.25+Math.sin(a)*0.42,0],0.035,0.035,TK);}}
 /* the bedroom: a bunk-sized double that grows, round porthole mirrors, a sea chest */
 drawBigBed((x,y,z,a,b,c,col)=>bx(x+1,y,z+1,a,b,c,col),5,n,TK,[0.92,0.94,0.98],[0.3,0.45,0.8]);
 bx(9.4,0.22,11.4,0.9,0.44,0.5,[0.45,0.3,0.15]);bx(9.4,0.46,11.4,0.92,0.04,0.52,GOLD);
 /* the salon and galley: teak counter, a two-burner stove, a bench settee, a lantern */
 rhCounter(bx,14.05,16.95,7.35,TK,[0.95,0.94,0.9],{sink:14.6,stove:16.3});
 rhPhone(bx,S.o||{x:13.5,z:7.5},TK,[0.95,0.95,0.92]);
 rhRug(bx,16.0,10.0,2.6,1.6,NAVY,[0.92,0.9,0.85]);
 /* the head: white tile, a small sink and a shower */
 drawBathroomAt(bx,I,21.15,7.9,[0.85,0.9,0.95],RH_WH);
 /* the decks: a lounger and palm on the bow, coiled ropes, life rings, a cooler, lanterns */
 mvLounger(B,5.6,7.2,0,RH_TEAL);rhPlant(B,I,4.9,12.4,0.75,[0.95,0.94,0.9]);
 for(const [x,z] of [[7.5,13.4],[23.6,4.6]]){for(let i=0;i<3;i++)bx(x,0.05+i*0.05,z,0.5-i*0.1,0.05,0.5-i*0.1,[0.85,0.78,0.6]);}
 for(const [x,z] of [[10.5,6.0],[20.5,13.95]]){const K=hiKit(B,x,z,0,I);K.ring(0,1.1,0,0.22,0.08,0.08,[1,0.35,0.3],10,'z');K.ring(0,1.1,0,0.22,0.081,0.03,RH_WH,10,'z',false,0.3);}
 bx(23.8,0.25,12.9,0.6,0.5,0.4,[0.25,0.55,0.85]);bx(23.8,0.52,12.9,0.62,0.04,0.42,RH_WH);
 /* the pier and the lot: planks, bollards, a dock box, lamps, parking lines */
 for(let x=0.5;x<32;x+=1.1)bx(x,0.004,17,0.04,0.008,2.0,[0.25,0.18,0.1]);
 for(const x of [6,12,21,27]){bx(x,0.22,16.2,0.22,0.44,0.22,[0.2,0.2,0.22]);bx(x,0.46,16.2,0.3,0.06,0.3,[0.2,0.2,0.22]);}
 bx(11,0.3,17.6,1.0,0.6,0.5,RH_WH);bx(11,0.62,17.6,1.04,0.04,0.54,[0.25,0.55,0.85]);
 for(const x of [8,24]){bx(x,1.2,17.75,0.08,2.4,0.08,[0.3,0.3,0.32]);bx(x,2.42,17.75,0.3,0.12,0.3,[1.1,0.9,0.6],true);}
 for(let x=3;x<31;x+=3.2)bx(x,0.012,19.4,0.08,0.01,1.6,RH_WH);
 /* upgrades */
 if(f.tiki){bx(5.3,0.5,10.1,0.5,1.0,2.4,[0.6,0.45,0.25]);for(let i=0;i<6;i++)bx(5.56,0.5,9.0+i*0.44,0.02,0.9,0.06,[0.4,0.28,0.12]);bx(5.4,1.02,10.1,0.7,0.05,2.5,[0.45,0.3,0.15]);
  for(let i=0;i<4;i++){bx(5.3,1.95+i*0.07,10.1,1.3-i*0.25,0.08,2.9-i*0.4,[0.85,0.7,0.35].map(v=>v*(0.9+0.05*i)));}for(const z of [8.85,11.35])bx(5.05,1.45,z,0.06,1.0,0.06,[0.45,0.3,0.15]);
  for(const z of [9.3,10.1,10.9]){bx(6.45,0.38,z,0.3,0.04,0.3,[0.6,0.45,0.25]);bx(6.45,0.19,z,0.05,0.38,0.05,[0.45,0.3,0.15]);}
  for(const [z,c] of [[9.6,[1,0.6,0.2]],[10.5,[0.3,0.8,0.4]]])bx(5.35,1.12,z,0.12,0.16,0.12,c);}
 if(f.rig)for(const x of [24.6,26.0]){const K=hiKit(B,x,12.25,0,I);K.rb(0,0.32,0,0.5,0.08,0.5,RH_WH,0.4);K.rb(0,0.6,-0.24,0.5,0.55,0.08,RH_WH,0.4);K.cy(0,0.15,0,0.16,0.3,[0.7,0.7,0.74],'y');
  K.sf([0.22,0.5,0.1],[0.6,2.0,1.6],0.025,0.025,[0.2,0.2,0.22]);K.sf([0.6,2.0,1.6],[0.62,0.1,2.6],0.004,0.004,[0.9,0.9,0.9]);}},
/* ===== THE FLAMINGO ARMS, ART DECO CONDO ===== */
6(B,bx,I,g,f){const n=bedN(),S=g.slots,MINT=[0.6,0.92,0.82],PEACH=[1,0.78,0.62],CHR=[0.82,0.84,0.88];
 /* the beach below: palms along the promenade, a lifeguard tower, two striped umbrellas */
 for(const [x,l] of [[2.5,0.2],[7.5,-0.1],[20.5,0.15],[26.5,-0.2]])mvPalm(B,x,4.4,1.0,l);
 {const x=24.5,z=3.2;for(const sx of [-0.4,0.4])for(const sz of [-0.3,0.3])bx(x+sx,0.6,z+sz,0.06,1.2,0.06,RH_WH);bx(x,1.25,z,1.1,0.08,0.9,RH_WH);bx(x,1.65,z,1.0,0.75,0.8,[1,0.55,0.62]);bx(x,2.08,z,1.2,0.1,1.0,MINT);bx(x,1.65,z+0.41,0.6,0.4,0.01,[0.3,0.6,0.8]);}
 mvUmbrella(B,11.5,3.3,RH_PINK);mvUmbrella(B,15.5,2.8,RH_TEAL);
 /* the balcony: a curved deco rail with an eyebrow ledge, potted palms */
 rhRails(bx,g.def.map,RH_WH,MINT,0.95);bx(14.5,0.3,5.04,17.2,0.6,0.08,PEACH);bx(14.5,0.62,5.0,17.4,0.04,0.16,RH_WH);
 for(let i=0;i<8;i++){const a=(i+0.5)/8*Math.PI/2;bx(6.0-Math.cos(a)*0.0,0.3,5.0+Math.sin(a)*1.9,0.08,0.6,0.26,PEACH);}
 rhPlant(B,I,6.8,7.4,0.8,RH_WH);rhPlant(B,I,21.2,7.4,0.8,RH_WH);
 /* the facade over the windows: thin eyebrow ledges and the speed stripes along the top of the wall */
 for(const x0 of [4,11,22]){bx(x0+1.5,2.0,7.9,3.4,0.05,0.32,RH_WH);}for(let i=0;i<3;i++)bx(14,2.35-i*0.09,7.98,28,0.04,0.02,[MINT,PEACH,RH_PINK][i]);
 /* the bedroom: a white lacquer bed, a round vanity mirror, a peach rug */
 drawBigBed((x,y,z,a,b,c,col)=>bx(x+1,y,z+1,a,b,c,col),6,n,RH_WH,[0.98,0.97,0.96],[1,0.65,0.75]);
 bx(6.4,0.38,9.3,1.2,0.76,0.5,RH_WH);bx(6.4,0.78,9.3,1.24,0.04,0.54,PEACH);{const K=hiKit(B,6.4,9.06,0,I);K.ring(0,1.3,0,0.36,0.06,0.04,CHR,14,'z');K.cy(0,1.3,0.005,0.66,0.01,[0.75,0.85,0.92],'z',false,0);}
 rhRug(bx,6.0,11.6,2.2,1.2,PEACH,[1,0.88,0.78]);
 /* the bathroom: black and white checker, pink fixtures, glass block */
 drawBathroomAt(bx,I,3.0,14.0,[0.95,0.6,0.7],[1,0.82,0.86]);
 /* the kitchen: mint cabinets and chrome, a rounded fridge */
 rhCounter(bx,22.0,27.6,9.35,MINT,[0.96,0.96,0.96],{sink:24.5,stove:26.6});rhFridge(bx,27.55,10.6,[0.98,0.97,0.92]);
 /* the living room: a curved white sofa, armchair and glass table, a chrome floor lamp, the phone, a deco print */
 drawSeatingAt(bx,I,12.0,14.6,RH_WH,[1,0.7,0.78],CHR);rhPhone(bx,S.o||{x:13.5,z:9.5},RH_WH,RH_PINK);
 bx(10.6,0.9,13.2,0.04,1.8,0.04,CHR);bx(10.6,1.82,13.2,0.36,0.14,0.36,[1,0.9,0.7],true);bx(10.6,0.02,13.2,0.4,0.04,0.4,CHR);
 bx(16.0,1.4,9.03,1.2,0.8,0.02,[0.12,0.12,0.15]);for(let i=0;i<5;i++)bx(16.0,1.1+i*0.15,9.045,1.0-i*0.16,0.06,0.01,[RH_PINK,MINT,PEACH,RH_TEAL,[1,0.85,0.4]][i]);
 /* the den: a reading chair and a lamp */
 {const K=hiKit(B,22.5,16.0,0,I);K.rb(0,0.22,0,0.7,0.36,0.65,[0.95,0.6,0.5],0.5);K.rb(0,0.55,-0.27,0.7,0.5,0.12,[0.95,0.6,0.5],0.5);}rhLamp(bx,21.4,16.2,[1,0.85,0.6]);
 /* the corridor: a deco runner, sconces, a palm by the lift */
 bx(13,0.007,18.95,9,0.008,0.8,[0.15,0.55,0.55]);bx(13,0.009,18.95,8.7,0.008,0.55,[0.95,0.6,0.7]);for(const x of [11.5,15,18.5]){bx(x,1.5,18.02,0.3,0.24,0.04,[1.1,0.85,0.6],true);}rhPlant(B,I,17.6,19.4,0.7,RH_WH);
 /* upgrades */
 if(f.jukebox){const K=hiKit(B,19.62,13.5,-Math.PI/2,I);K.rb(0,0.55,0,0.85,1.1,0.5,[0.5,0.2,0.12],0.3);K.rb(0,1.15,0,0.85,0.4,0.5,[0.5,0.2,0.12],1);K.bx(0,0.7,0.26,0.55,0.4,0.01,[1,0.85,0.5],true);
  for(const sx of [-0.36,0.36])K.bx(sx,0.75,0.26,0.07,1.0,0.02,[1,0.4,0.85],true);K.bx(0,1.15,0.26,0.6,0.3,0.01,[0.3,0.9,1],true);}
 if(f.bistro){const K=hiKit(B,10.5,6.6,0,I);K.cy(0,0.72,0,0.7,0.03,RH_WH,'y');K.rb(0,0.36,0,0.05,0.72,0.05,CHR,1);K.cy(0,0.02,0,0.4,0.03,CHR,'y');
  for(const sx of [-0.6,0.6]){K.cy(sx,0.44,0,0.42,0.04,RH_PINK,'y');K.legs(0.3,0.3,0.42,0.03,CHR);K.rb(sx+(sx<0?-0.2:0.2),0.7,0,0.04,0.5,0.4,CHR,0.5);}}},
/* ===== CASA DEL SOL, COCONUT GROVE ===== */
7(B,bx,I,g,f){const n=bedN(),S=g.slots,DW=[0.42,0.24,0.12],CREAM=[0.95,0.9,0.8],M=TUV[63];
 /* terracotta coping on the garden wall, the gate posts with lanterns, an iron gate standing open */
 g.def.map.forEach((row,Z)=>{let a=-1;for(let X=0;X<=row.length;X++){const on=row[X]==='Z';if(on&&a<0)a=X;if(!on&&a>=0){bx((a+X)/2+1,1.2,Z+1.5,X-a,0.08,1.06,RH_TERRA);a=-1;}}});
 for(const x of [14.6,21.4]){bx(x,0.8,26.5,0.6,1.6,0.6,CREAM);bx(x,1.65,26.5,0.7,0.1,0.7,RH_TERRA);bx(x,1.9,26.5,0.22,0.3,0.22,[1.1,0.8,0.4],true);}
 for(const [x,a] of [[15.0,-1.2],[21.0,1.2]]){const m0=A.mul(A.T(x,0,26.5),A.RY(a));for(let i=0;i<7;i++)B.box(A.mul(m0,TRS(0.15+i*0.42,0.65,0,0,0.03,1.2,0.03)),[0.1,0.1,0.12]);for(const y of [0.1,1.2])B.box(A.mul(m0,TRS(1.4,y,0,0,2.8,0.05,0.04)),[0.1,0.1,0.12]);}
 /* the back garden: the banyan with its hanging roots, the pool with its coping, the spa, loungers */
 {I.r=0.6;for(const [dx,dz,s] of [[0,0,1],[0.6,0.3,0.7],[-0.5,0.4,0.75],[0.3,-0.4,0.6]])I.box(TRS(4.5+dx,1.1,2.8+dz,0,0.45*s,2.2,0.45*s),[0.45,0.38,0.3]);I.r=0;
  for(let i=0;i<10;i++){const a=i*0.63,r=1.4+(i%3)*0.4;bx(4.5+Math.cos(a)*r,1.4,2.8+Math.sin(a)*r*0.6,0.04,1.6,0.04,[0.42,0.34,0.25]);}
  for(const [dx,dz,dy,r] of [[0,0,2.7,4.2],[1.6,0.5,2.55,2.6],[-1.4,0.6,2.5,2.4],[0.4,-0.6,2.9,2.4]]){I.r=1;I.box(TRS(4.5+dx,dy,2.8+dz,0,r,0.8,r*0.62),[0.14,0.4,0.18]);}I.r=0;}
 bx(24.5,0.05,5.12,11.5,0.1,0.25,CREAM,false,0,M);bx(18.88,0.05,3.5,0.25,0.1,3.3,CREAM,false,0,M);bx(30.12,0.05,3.5,0.25,0.1,3.3,CREAM,false,0,M);
 for(let i=0;i<3;i++)bx(19.4+i*0.3,0.026,4.2,0.26,0.012,1.4,[0.8,0.92,0.98]);
 for(let i=0;i<8;i++){const a=i*TAU/8;bx(15.5+Math.sin(a)*1.02,0.22,3.0+Math.cos(a)*1.02,0.92,0.44,0.22,CREAM,false,a,M);bx(15.5+Math.sin(a)*1.14,0.42,3.0+Math.cos(a)*1.14,0.8,0.02,0.03,[0.3,0.75,1],true,a);}
 bx(15.5,0.08,3.0,1.9,0.16,1.9,[0.1,0.3,0.4],false,Math.PI/8);bx(15.5,0.2,3.0,1.8,0.02,1.8,[0.3,0.65,0.85],true,Math.PI/8);
 for(const x of [26.2,28.6])mvLounger(B,x,4.4,Math.PI,RH_TERRA);mvUmbrella(B,27.4,4.0,[0.95,0.85,0.6]);
 mvPalm(B,32.2,1.8,0.9,-0.2);mvPalm(B,18.0,1.6,0.8,0.15);
 /* the bedroom: carved four-poster that grows, a dresser, a rug */
 drawBigBed((x,y,z,a,b,c,col)=>bx(x+1,y,z+1,a,b,c,col),7,n,DW,[0.97,0.95,0.9],[0.85,0.75,0.55]);
 {const B0=bigBedWorld(7,n);for(const sx of [-1,1])for(const sz of [-1,1])bx(B0.x+sx*0.95*B0.s,1.0,B0.z+sz*(B0.w/2),0.08,2.0,0.08,DW);}
 bx(8.0,0.45,7.3,1.6,0.9,0.55,DW);bx(8.0,0.92,7.3,1.64,0.04,0.59,[0.95,0.9,0.8]);rhRug(bx,7.6,9.6,2.6,1.6,[0.6,0.2,0.15],[0.9,0.75,0.5]);
 /* the bathroom: marble, gold taps, a clawfoot tub */
 drawBathroomAt(bx,I,13.6,7.9,[0.9,0.88,0.85],[0.98,0.97,0.95]);{const K=hiKit(B,15.4,10.6,0,I);K.rb(0,0.35,0,1.4,0.5,0.7,RH_WH,0.9);K.bx(0,0.56,0,1.2,0.02,0.5,[0.5,0.75,0.9]);for(const sx of [-0.55,0.55])for(const sz of [-0.25,0.25])K.rb(sx,0.06,sz,0.1,0.12,0.1,GOLD,1);}
 /* the great room: a long bar of carved wood, a white sectional, potted palms */
 bx(18.35,0.5,9.5,0.6,1.0,2.4,DW);bx(18.35,1.02,9.5,0.72,0.06,2.5,[0.95,0.9,0.8]);for(let i=0;i<5;i++)bx(17.55,1.5,8.5+i*0.5,0.08,0.3,0.08,[[0.2,0.5,0.2],[0.6,0.3,0.1],[0.85,0.8,0.6],[0.3,0.15,0.1],[0.9,0.5,0.2]][i]);
 bx(17.15,1.3,9.5,0.1,0.04,2.4,DW);
 for(let i=0;i<3;i++){const z=8.7+i*0.8;bx(19.2,0.36,z,0.32,0.05,0.32,[0.6,0.2,0.15]);bx(19.2,0.18,z,0.05,0.36,0.05,GOLD);}
 drawSeatingAt(bx,I,28.0,10.6,[0.95,0.93,0.88],[0.9,0.75,0.55],DW);rhPhone(bx,S.o||{x:20.5,z:7.5},DW,[0.9,0.85,0.75]);
 rhPlant(B,I,17.6,7.3,1.0);rhPlant(B,I,31.4,7.3,1.0);
 /* the kitchen: terracotta, white cabinets, a copper hood, a farmhouse table */
 rhCounter(bx,3.2,10.4,13.35,[0.96,0.95,0.92],[0.5,0.32,0.2],{sink:5.0,stove:8.4});bx(8.4,1.8,13.25,0.8,0.5,0.4,[0.75,0.45,0.25]);rhFridge(bx,10.6,14.6,[0.85,0.86,0.88]);
 /* the office: leather chair, a wall map, a safe */
 bx(25.0,0.4,13.3,0.7,0.8,0.6,[0.3,0.3,0.32]);bx(25.0,0.4,13.61,0.5,0.5,0.01,[0.5,0.5,0.52]);bx(25.15,0.45,13.62,0.08,0.08,0.02,GOLD);bx(30.0,1.4,13.03,1.6,0.9,0.02,[0.85,0.8,0.6]);bx(30.0,1.4,13.04,1.4,0.75,0.01,[0.35,0.55,0.7]);
 /* the courtyard: the fountain (tiered, the water itself moves), clay planters with palms in the corners, a bench */
 {const x=18,z=15.2;for(let i=0;i<12;i++){const a=i*TAU/12;bx(x+Math.sin(a)*1.15,0.22,z+Math.cos(a)*1.15,0.64,0.44,0.18,CREAM,false,a);}bx(x,0.12,z,2.1,0.1,2.1,[0.25,0.5,0.6],true,Math.PI/12);
  I.r=0.6;I.box(TRS(x,0.7,z,0,0.3,1.0,0.3),CREAM);I.r=0.8;I.tp=-0.5;I.box(TRS(x,1.12,z,0,1.3,0.16,1.3),CREAM);I.box(TRS(x,1.62,z,0,0.72,0.12,0.72),CREAM);I.tp=0;I.r=0;bx(x,1.38,z,0.16,0.4,0.16,CREAM);bx(x,1.9,z,0.1,0.3,0.1,CREAM);}
 for(const [x,z] of [[13.4,13.4],[22.6,18.6],[13.4,18.6]])rhPlant(B,I,x,z,1.0);
 /* the front loggia: arches on columns, terracotta pots; the front garden: palms and a hedge */
 for(let x=2.5;x<34;x+=3.1){bx(x,1.0,22.85,0.3,2.0,0.3,CREAM);bx(x,0.05,22.85,0.42,0.1,0.42,CREAM);}bx(17.5,2.05,22.85,31,0.14,0.34,CREAM);for(let x=4.05;x<33;x+=3.1)bx(x,1.85,22.85,2.6,0.12,0.3,CREAM);
 for(const x of [10.5,24.5]){I.r=0.7;I.box(TRS(x,0.25,21.6,0,0.6,0.5,0.6),RH_TERRA);I.r=1;I.box(TRS(x,0.75,21.6,0,0.8,0.6,0.8),RH_LEAF);I.r=0;}
 for(const [x,z,s,l] of [[4,24.2,1.05,0.15],[31,24.2,1.0,-0.15],[9.5,25.4,0.85,0.1],[26,25.4,0.85,-0.1]])mvPalm(B,x,z,s,l);
 for(const [x0,x1] of [[2,14],[22,34]]){I.r=1;for(let x=x0+0.5;x<x1;x+=1)I.box(TRS(x,0.35,26.0,0,1.1,0.7,0.7),[0.15,0.42,0.18]);I.r=0;}
 /* upgrades */
 if(f.koi){const K=hiKit(B,10.5,3.1,0,I);K.ov(0,0.03,0,3.0,1.6,0.04,[0.1,0.25,0.22]);for(let i=0;i<14;i++){const a=i*TAU/14;K.rb(Math.cos(a)*1.55,0.1,Math.sin(a)*0.82,0.42,0.2,0.3,[0.55,0.52,0.48],0.9);}
  for(const [dx,dz] of [[-0.6,0.2],[0.5,-0.3],[0.9,0.35]]){K.cy(dx,0.06,dz,0.3,0.01,[0.25,0.6,0.25],'y');K.ball(dx+0.05,0.09,dz,0.08,[1,0.85,0.9]);}}
 if(f.aviary){const K=hiKit(B,21.9,13.95,0,I);for(let i=0;i<12;i++){const a=i*TAU/12;K.sf([Math.cos(a)*0.85,0.05,Math.sin(a)*0.85],[Math.cos(a)*0.85,1.6,Math.sin(a)*0.85],0.025,0.025,RH_WH);K.sf([Math.cos(a)*0.85,1.6,Math.sin(a)*0.85],[0,2.25,0],0.025,0.025,RH_WH);}
  K.ring(0,0.05,0,0.85,0.05,0.05,RH_WH,16);K.ring(0,1.6,0,0.85,0.04,0.04,RH_WH,16);K.ring(0,0.8,0,0.85,0.03,0.03,RH_WH,16);K.ball(0,2.3,0,0.12,GOLD);K.sf([-0.6,1.1,0],[0.6,1.1,0],0.03,0.03,DW);}
 if(f.grotto){for(let i=0;i<9;i++){const x=21.8+i*0.68,h=0.5+((i*7)%4)*0.18;I.r=0.9;I.box(TRS(x,1.1+h/2,1.75,i*0.7,0.8,h,0.6),[0.5,0.47,0.42]);}I.r=1;for(const x of [21.6,27.6])I.box(TRS(x,1.9,1.8,0,0.9,0.5,0.6),[0.2,0.5,0.22]);I.r=0;}
 if(f.cinema){bx(12.0,1.75,1.62,4.4,2.4,0.06,[0.15,0.15,0.17]);for(const x of [9.75,14.25])bx(x,1.0,1.7,0.1,2.0,0.1,[0.15,0.15,0.17]);
  for(const x of [12.2,13.4])mvLounger(B,x,4.6,Math.PI,[0.15,0.15,0.2]);bx(14.8,0.6,4.8,0.3,1.2,0.3,[0.2,0.2,0.22]);bx(14.8,1.25,4.8,0.4,0.3,0.5,[0.25,0.25,0.28]);}}};

/* ---- the moving bits, every frame ---- */
function rhDyn(D,g,f){const t=g.rhome,T=g.T,bx=rhBx(D);
 if(t===4){/* the living room fan */const a=T*5;bx(14,2.1,14.3,0.06,0.3,0.06,[0.4,0.3,0.2]);for(let i=0;i<4;i++)D.box(A.mul(A.mul(A.T(14,1.95,14.3),A.RY(a+i*Math.PI/2)),TRS(0.45,0,0,0,0.8,0.02,0.16)),[0.55,0.38,0.22]);
  if(f.lechon){const k=0.8+0.2*Math.sin(T*9);bx(22.6,0.69,2.6,1.0,0.02,0.5,[1.2*k,0.4*k,0.1*k],true);}}
 if(t===5){/* lanterns on the decks flicker; the jet ski bobs alongside, its rope to the rail */
  for(const [x,z] of [[5.5,5.4],[25.5,5.4],[5.5,13.6],[25.5,13.6]]){const k=0.85+0.15*Math.sin(T*7+x);bx(x,1.0,z,0.14,0.2,0.14,[1.1*k,0.75*k,0.35*k],true);}
  if(f.jetski){const y=0.05+Math.sin(T*1.6)*0.04,r=Math.sin(T*1.1)*0.05,m0=A.mul(A.mul(A.T(12,y,2.3),A.RY(0.08)),A.RZ(r)),P=(px,py,pz,sx,sy,sz,c,em)=>D.box(A.mul(m0,TRS(px,py,pz,0,sx,sy,sz)),c,!!em);
   P(0,0.18,0,2.0,0.3,0.75,RH_WH);P(0.85,0.2,0,0.5,0.24,0.5,RH_PINK);P(-0.1,0.4,0,0.9,0.16,0.4,RH_PINK);P(0.4,0.58,0,0.12,0.3,0.1,[0.15,0.15,0.17]);P(0.42,0.75,0,0.08,0.06,0.6,[0.15,0.15,0.17]);P(-0.95,0.16,0,0.12,0.2,0.6,RH_TEAL);
   D.box(TRS(11.8,0.55,3.25,0,0.02,0.02,1.4),[0.9,0.85,0.7]);}
  if(f.tiki)for(const z of [8.85,11.35]){const k=0.8+0.2*Math.sin(T*11+z);bx(5.05,2.02+0.04*Math.sin(T*13+z),z,0.14,0.22,0.14,[1.3*k,0.6*k,0.15*k],true);}
  if(g.rh.cast>0){const u=1-g.rh.cast/2.2;bx(25.3,0.05,14.6+u*1.0,0.18,0.02,0.18,[0.85,0.95,1],true);}
  for(let i=0;i<6;i++){const x=((i*5.3+T*0.4)%30)+1,s=0.5+0.5*Math.sin(T*2+i);bx(x,0.025,1.5+(i%3)*0.9,0.6,0.004,0.04,[0.6*s,0.8*s,1.0*s],true);}}
 if(t===6){/* the sea sparkles; the neon sign hums */
  for(let i=0;i<8;i++){const x=((i*3.7+T*0.5)%28)+1,s=0.5+0.5*Math.sin(T*2.4+i*1.3);bx(x,0.025,1.0+(i%2)*0.9,0.7,0.004,0.04,[0.7*s,0.85*s,1.0*s],true);}
  if(f.neonsign){const k=Math.sin(T*1.7)*Math.sin(T*4.3)>0.93?0.35:1;mallWord(D,'FLAMINGO',14.5,0.68,4.96,0.3,[1.4*k,0.3*k,0.8*k]);D.box(TRS(14.5,0.6,4.98,0,0.02,0.02,0.02),RH_PINK);}
  if(f.jukebox){const k=0.6+0.4*Math.sin(T*3);bx(19.35,0.75,13.5,0.01,0.9,0.5,[1*k,0.5,0.9*(1-k)+0.3],true);}}
 if(t===7){/* the courtyard fountain runs; koi circle; the macaws bob; the cinema flickers; the spa glows */
  if(g.fount)drawFountainWater(D,g.fount,T);
  if(f.koi)for(let i=0;i<5;i++){const a=T*0.4*(i%2?1:-1)+i*1.3,r=0.5+0.18*i,x=10.5+Math.cos(a)*r*1.4,z=3.1+Math.sin(a)*r*0.7;D.box(TRS(x,0.065,z,-a+(i%2?0:Math.PI),0.06,0.03,0.2),i%2?[1,0.45,0.1]:[1,0.95,0.9],false);}
  if(f.aviary&&g.rh.birds)for(const q of g.rh.birds){const fl=q.flap>0,y=1.18+(fl?Math.abs(Math.sin(T*18))*0.15:Math.sin(T*2+q.ph)*0.02),K=hiKit(D,q.x,q.z,Math.sin(T*0.7+q.ph)*0.6);
   K.rb(0,y,0,0.13,0.26,0.13,q.c,1);K.rb(0,y+0.18,0.02,0.11,0.11,0.11,q.c,1);K.rb(0,y+0.17,0.09,0.05,0.06,0.06,[0.95,0.9,0.7],1);K.rb(0,y-0.2,-0.04,0.05,0.24,0.03,q.c.map(v=>v*0.7),0.6);
   for(const sx of [-1,1])K.rr(sx*0.08,y,0,0,0,sx*(fl?1.1*Math.sin(T*20):0.1),0.03,0.22,0.12,[1,0.85,0.2],0.6);}
  if(f.cinema){const s=T*0.8,c=[0.5+0.4*Math.sin(s*3.1),0.4+0.4*Math.sin(s*2.3+1),0.6+0.4*Math.sin(s*1.7+2)];bx(12.0,1.75,1.66,4.2,2.2,0.01,c,true);bx(12.0+Math.sin(s)*1.4,1.5,1.665,0.8,0.4,0.01,[1,0.95,0.85],true);}
  {const k=0.85+0.15*Math.sin(T*2.2);bx(15.5,0.205,3.0,1.6,0.01,1.6,[0.25*k,0.65*k,0.9*k],true,Math.PI/8);}}}
