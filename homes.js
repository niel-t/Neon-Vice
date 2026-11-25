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
 "R,,,t,,,,,,,,,,,,,,,,,,m,R",
 "R,,,,,,,,,,,##W#W##,,,,,,R",
 "R,,,,,,,,,,,#.....#,,,,,,R",
 "R,,,,,,,,,,,W.....D,,,,,,R",
 "R,,,,,,,,,,,#.....#,,,,,,R",
 "R,##WW####WW#.....#,,,,,,R",
 "R,#....#f..j......#,=====R",
 "R,W....D......q...W,=====R",
 "R,#....#..........W,=====R",
 "R,######D#.o..m...#,=====R",
 "R,W...l..#...r....#,=====R",
 "R,#......#...Ps.p.#,=====R",
 "R,W......#........D,=====R",
 "R,##WWW###WW#D#WW##,=====R",
 "R,,uuuuuuumuuuunuu,,=====R",
 "R,,uuuuuuuuuuuuuuu,,=====R",
 "R,,,,,,,g,,,===,,g,,=====R",
 "R,,,,,,,,,,,===,,,,,=====R",
 "R,,,,,,,,,,,===,,,,,=====R",
 "RRRRRRRRRRRR===RRRRR=====R",
 "==========================",
 "::::::::::::::::::::::::::",
 "::::::::::::::::::::::::::"];
/* the houseboat: the deck cells (u) follow the hull drawn over them (RH_HULL: a sharp bow at the west, a rounded stern); the
   cells outside the hull line are water, so you walk where the deck is */
const RH_BOAT=["~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
 "~~~~~~~~~~uuuuuuuuuumuuuuuuuuuu~~~~~",
 "~~~~~~~uuuu#WWW######WWW#W##uuuu~~~~",
 "~~~~uuuuuuuW...f....#...#..Wuuuu~~~~",
 "~~uuuuuuuuuW........#...D..Wuuuu~~~~",
 "~uuuuuuuuuuD....s.q.#...####uumu~~~~",
 "~~uuuuuuuuuW..r.P...D......#uuuu~~~~",
 "~~~~umuutuuWoj...p..#......#uuuu~~~~",
 "~~~~~~~uuuu#WWW#D#WW#WWW#WW#uuuu~~~~",
 "~~~~~~~~~~uuuuuuuuuuuuuuuuuuuuu~~~~~",
 "~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~",
 "~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~",
 "===============n====================",
 "==========g============g============",
 "::::::::::::::::::::::::::::::::::::",
 "::::::::::::::::::::::::::::::::::::"];
const RH_HULL={x0:1.6,x1:33.4,cz:9.5,hw:4.85};
/* the hull's half-width at world x: a curved bow, straight sides, the stern quarters rounded in */
function rhHullW(x){const H=RH_HULL;if(x<H.x0||x>H.x1)return -1;const b=Math.min(1,(x-H.x0)/10),s=(H.x1-x)/1.6;let h=H.hw*Math.sqrt(b)*(1-0.12*(1-b));
 if(s<1)h=Math.min(h,H.hw*(0.75+0.25*Math.sqrt(Math.max(0,s))));return h;}
/* the north (port... well, starboard when she points west) side of the hull line from the bow to the stern */
function rhHullPts(){const H=RH_HULL,P=[];for(let i=0;i<=14;i++){const u=i/14,x=H.x0+10*u*u;P.push([x,H.cz-Math.max(0,rhHullW(x))]);}
 for(let x=13;x<H.x1-1.6;x+=2)P.push([x,H.cz-rhHullW(x)]);for(let i=0;i<=6;i++){const x=H.x1-1.6+1.6*Math.sqrt(i/6);P.push([x,H.cz-rhHullW(x)]);}return P;}
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
 "Z,,,,,,,,,,,,,,,,,wwwwwwwwwww,,##Z",
 "Z,,,,,,,,,,,,,,,,,wwwwwwwwwww,,##Z",
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
 "Z##WWW##WW##cccccccccc##WW##WWW##Z",
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
  floorFn:rhFloor([[3,12,8,14,4],[3,8,6,10,1],[13,4,17,7,27],[8,8,17,14,61]]),
  legend:rhLeg(61,{',':{f:17},'=':{f:34},':':{f:7},u:{f:37},W:{w:62,h:0.42},R:{w:56,h:0.08,top:56}}),map:RH_CASITA},
 home5:{name:'THE LOW TIDE · HOUSEBOAT',hub:'foot',homeT:5,wall:18,floor:41,amb:[0.31,0.32,0.36],lc:[0.5,0.5,0.52],sofa:0xffffff,track:'c_tide',where:'DINNER KEY MARINA · THE LOW TIDE',obj:'FURNISH THE PLACE · THEN HEAD OUT',grime:0.12,
  floorFn:rhFloor([[25,6,26,7,14],[21,6,26,10,29],[17,6,19,7,14],[12,6,19,10,41]]),
  legend:rhLeg(41,{'~':RH_SEA,u:{f:4},'=':{f:13},':':{f:7},W:{w:18,h:0.42},R:{w:4,h:0.08,top:4}}),map:RH_BOAT},
 home6:{name:'THE FLAMINGO ARMS',hub:'foot',homeT:6,wall:44,floor:61,amb:[0.35,0.31,0.35],lc:[0.58,0.48,0.5],sofa:0xffffff,track:'c_pastel',where:'OCEAN DRIVE · THE FLAMINGO ARMS · 4TH FLOOR',obj:'FURNISH THE PLACE · THEN HEAD OUT',grime:0.14,
  floorFn:rhFloor([[1,8,8,11,4],[1,13,5,15,1],[20,8,26,11,14],[20,13,26,15,4],[7,8,19,15,61],[8,17,17,18,43]]),
  legend:rhLeg(61,{'~':RH_SEA,y:{w:38,h:0.03,top:38},u:{f:37},W:{w:44,h:0.42},R:{w:44,h:0.08,top:44},e:{w:40},x:{f:43,trig:'leave'}}),map:RH_CONDO},
 home7:{name:'CASA DEL SOL · COCONUT GROVE',hub:'foot',homeT:7,wall:41,floor:63,amb:[0.36,0.33,0.31],lc:[0.6,0.52,0.44],sofa:0xe8dcc0,track:'c_palms',where:'COCONUT GROVE · CASA DEL SOL',obj:'FURNISH THE PLACE · THEN HEAD OUT',grime:0.08,
  floorFn:rhFloor([[2,6,10,10,4],[12,6,15,10,63],[17,6,31,11,63],[2,12,10,17,27],[23,12,31,17,4]]),
  legend:rhLeg(63,{',':{f:17},'=':{f:37},':':{f:7},u:{f:61},c:{f:37},w:{w:12,h:0.02,top:12,water:1},W:{w:41,h:0.42},Z:{w:41,h:1.15,top:41}}),map:RH_GROVE}};

/* ---------------- per home: look, bed, locker, home-life pieces, party, the car or the lift, lights, upgrades ---------------- */
const RH_DEF={
 4:{look:0,map:RH_CASITA,area:'LITTLE HAVANA',bed:[4.03,12.57,1],bedW:{x:5.0,z:13.6},locker:{x:9.72,z:15.5},
  hl:{wardrobe:{x:9.73,z:14.5,ry:-Math.PI/2,sol:[[9,14]],use:{x:8.9,z:14.5}},bench:{x:22,z:6.5,ry:0,sol:[[21,6],[22,6]],use:{x:22,z:7.35}},bar:{x:14.27,z:7.5,ry:Math.PI/2,sol:[[14,7]],use:{x:15.1,z:7.5}}},
  party:{price:800,n:6,xp:180},car:{x:14,z:24.7},title:['LITTLE HAVANA','CASITA · OFF CALLE OCHO'],carTxt:'your car is out on the street',
  walk:[[14.4,23.3],[14.5,22.4],[14.5,20.0],[14.5,18.0],[14.5,16.4],[14.5,15.4]],
  solid:[[4,13],[5,13],[11,13],[11,14],[18,13],[14,5],[15,5],[16,5],[17,5],[18,5],[23,11],[23,12],[23,13],[17,9]],
  fx:[[4,9,7,11,252],[14,5,18,8,253],[9,9,18,15,250],[8,10,8,10,250],[9,12,9,12,250]],
  lights:[[5.5,10.5,3.5,[0.6,0.85,0.8]],[6.5,14.5,5,[0.8,0.62,0.42]],[14.5,13.8,6,[0.85,0.68,0.46]],[14.5,10.2,5,[0.85,0.72,0.5]],[16.2,6.5,4.5,[0.7,0.85,0.75]],[14.5,18,5,[1.0,0.72,0.4],1.9],[8,3,6,[0.42,0.5,0.4],2.2],[20,4,6,[0.45,0.5,0.4],2.2],[23.5,12.8,5,[0.8,0.75,0.6],2.0],[5,24.5,6,[0.95,0.78,0.45],2.6],[23,24.5,6,[0.95,0.78,0.45],2.6]],
  cat:[{k:'domino',name:'DOMINO TABLE',price:600,desc:'A card table under the mango tree and two old men who never leave. They play for money. So can you.'},
   {k:'lechon',name:'CAJA CHINA PIG ROAST',price:700,desc:'A roasting box in the back yard and a whole pig in it. The neighbours suddenly love you.'},
   {k:'hammock',name:'YARD HAMMOCK',price:350,desc:'Strung from the mango tree to the clothesline post. Lie in it and forget McWey.'}]},
 5:{look:1,map:RH_BOAT,area:'DINNER KEY',bed:[22.03,6.57,1],bedW:{x:23.0,z:7.6},locker:{x:27.72,z:11.5},
  hl:{wardrobe:{x:27.73,z:10.6,ry:-Math.PI/2,sol:[[27,10]],use:{x:26.9,z:10.6}},bench:{x:30.5,z:7.5,ry:Math.PI/2,sol:[[30,7],[30,8]],use:{x:31.4,z:7.5}},bar:{x:13.27,z:10.5,ry:Math.PI/2,sol:[[13,10]],use:{x:14.1,z:10.5}}},
  party:{price:2000,n:6,xp:230},car:{x:17,z:18.7},title:['DINNER KEY MARINA','THE LOW TIDE'],carTxt:'your car is parked on the pier',
  walk:[[17.6,17.3],[18.0,16.3],[18.0,15.3],[18.0,14.3],[17.8,13.4],[17.5,12.6],[17.5,11.4]],
  solid:[[13,7],[18,7],[19,7],[20,7],[15,8],[16,8],[22,7],[23,7]],fx:[[26,7,27,8,0],[22,7,27,11,249],[13,7,20,11,248],[12,9,12,9,248],[21,10,21,10,248]],
  lights:[[16.5,9.5,6,[0.8,0.7,0.52]],[23.5,9,4.5,[0.75,0.6,0.5]],[26.5,7.8,2.8,[0.6,0.85,0.9]],[6,9.5,5,[0.9,0.6,0.35],1.6],[30.5,9.5,5,[0.9,0.6,0.35],1.6],[18,13.5,5,[0.9,0.7,0.4],1.6],[9,17,6,[0.95,0.8,0.5],2.4],[27,17,6,[0.95,0.8,0.5],2.4],[18,2,9,[0.25,0.5,0.75],0.6]],
  cat:[{k:'rig',name:'FISHING CHAIRS + RODS',price:1200,desc:'Two fighting chairs on the stern and a bucket of bait. Cast a line once a night. Sometimes the bay gives something back.'},
   {k:'tiki',name:'TIKI BAR ON THE BOW',price:3000,desc:'Bamboo, a grass roof, two torches and a blender. Coconut cups included.'},
   {k:'jetski',name:'JET SKI',price:6500,desc:'Pink and white, tied up alongside. It mostly just bobs there looking fast.'}]},
 6:{look:1,map:RH_CONDO,area:'OCEAN DRIVE',bed:[2.03,8.57,1],bedW:{x:3.0,z:9.6},locker:{x:9.72,z:9.5},
  hl:{wardrobe:{x:8.5,z:9.27,ry:0,sol:[[8,9]],use:{x:8.5,z:10.1}},bench:{x:18.0,z:6.5,ry:0,sol:[[17,6],[18,6]],use:{x:18.0,z:7.35}},bar:{x:11.27,z:9.5,ry:Math.PI/2,sol:[[11,9]],use:{x:12.1,z:9.5}}},
  party:{price:3000,n:7,xp:260},title:['OCEAN DRIVE','THE FLAMINGO ARMS'],
  lift:{at:[10.7,18.5],path:[[12.6,18.4],[15.5,18.2],[15.5,17.2],[15.5,16.2]],title:'THE FLAMINGO ARMS',from:4,to:1},
  solid:[[2,9],[3,9],[22,9],[23,9],[24,9],[25,9],[26,9],[27,9],[27,10],[5,9],[6,9],[2,14],[2,15],[2,16],[5,14],[6,14],[6,16],[8,14],[9,14],[8,16],[19,9],[11,15],[12,15],[13,16],[24,14],[27,14],[16,18],[17,18],[19,18],[19,6],[20,6],[7,7],[21,7]],
  lights:[[5,11,5.5,[0.8,0.62,0.55]],[3.5,15,3.5,[0.55,0.85,0.9]],[15,11.5,6.0,[0.72,0.58,0.52]],[13,15,5.0,[0.7,0.52,0.56]],[24,10.5,5,[0.75,0.75,0.7]],[23.5,15,4.5,[0.75,0.55,0.4]],[14,6.5,7,[0.75,0.45,0.55],1.4],[13,18.5,5,[0.95,0.75,0.5]],[14,3,9,[0.6,0.5,0.55],2.6]],
  cat:[{k:'jukebox',name:'WURLITZER JUKEBOX',price:3500,desc:'Bubble tubes, chrome and a hundred 45s. Lets you pick the music at home.'},
   {k:'bistro',name:'BALCONY BISTRO SET',price:1800,desc:'A little round table and two chairs on the balcony. Coffee at sunrise, rum at sunset.'},
   {k:'neonsign',name:'PINK NEON FLAMINGO',price:2500,desc:'The building\'s name in pink neon along your balcony rail. Seen from the beach. Seen from space.'}]},
 7:{look:2,map:RH_GROVE,area:'COCONUT GROVE',bed:[3.22,6.67,1.2],bedW:{x:4.2,z:7.7},locker:{x:11.72,z:7.5},
  hl:{wardrobe:{x:10.4,z:7.27,ry:0,sol:[[10,7]],use:{x:10.4,z:8.1}},bench:{x:30.6,z:4.0,ry:Math.PI/2,sol:[[30,3],[30,4]],use:{x:31.5,z:4.0}},bar:{x:18.35,z:9.5,ry:Math.PI/2,sol:[],use:{x:19.3,z:9.5},built:1}},
  party:{price:10000,n:10,xp:450},car:{x:18,z:23.3},title:['COCONUT GROVE','CASA DEL SOL'],carTxt:'your car is in the drive',
  walk:[[17.6,21.6],[17.5,20.4],[17.5,19.3],[17.5,18.3]],
  inPath:[[18,45],[18,27.6],[17.4,25.4],[16.3,24.0],[17.0,23.35],[18,23.3]],depart:c=>[[c.x,c.z],[19.8,23.5],[20.3,25.0],[18.6,27.2],[18,30],[18,46]],
  fx:[[13,13,22,19,251],[2,20,32,21,251],[13,7,16,11,252]],
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

/* the Flamingo Arms' own deco surfaces (renderer.js tiles 238-247). floorT is an Int8Array, so the floors go in g.floorX (read
   first by buildStatic); each wall face picks its tile from the room it faces (g.wallF). Rects are world cells [x0,z0,x1,z1,tile] */
const RH_CONDO_FLOOR=[[13,8,16,8,238],[2,9,9,12,239],[2,14,6,16,240],[21,9,27,12,241],[21,14,27,16,230],[11,9,19,12,238],[8,13,19,16,238],[9,18,20,19,242],[7,6,22,7,243]];
const RH_CONDO_WALL=[[2,14,6,16,246],[21,9,27,12,247],[0,0,40,7,245]];
function rhCondoSurf(g){const W=g.W,H=g.H,FX=g.floorX=new Uint8Array(W*H),at=(R,x,z)=>{for(const r of R)if(x>=r[0]&&x<=r[2]&&z>=r[1]&&z<=r[3])return r[4];return 0;};
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){const i=z*W+x;if(!g.solid[i])FX[i]=at(RH_CONDO_FLOOR,x,z);}
 g.wallF=(x,z,nx,nz,i)=>{if(g.wallT[i]!==44||(g.wh[i]||WALL_H)<0.3)return 0;return at(RH_CONDO_WALL,x+nx,z+nz)||244;};}
/* the other realty homes' own floors (renderer.js 248-253), the same way: world-cell rects [x0,z0,x1,z1,tile], first match wins,
   tile 0 keeps the floorFn floor */
function rhSurf(g,R){const W=g.W,H=g.H,FX=g.floorX=new Uint8Array(W*H);
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){const i=z*W+x;if(g.solid[i])continue;for(const r of R)if(x>=r[0]&&x<=r[2]&&z>=r[1]&&z<=r[3]){FX[i]=r[4];break;}}}
/* ---------------- setup (from homeSetup) ---------------- */
function rhSetup(g,t){const d=RH_DEF[t],W=g.W,H=g.H,leg=g.def.legend;g.rhome=t;g.rdef=d;g.rh={T:0,fish:[]};
 /* the loader's padding ring: carry the outside surface out to it (sea, sand, street, lawn) instead of a dark wall */
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){if(z>0&&x>0&&x<W-1&&z<H-1)continue;const X=Math.min(W-3,Math.max(0,x-1)),Z=Math.min(H-3,Math.max(0,z-1)),ch=(d.map[Z]||'')[X],i=z*W+x,L=leg[ch];
  if(!L||ch==='#'||ch==='Z'||ch==='W')continue;const tex=L.w?L.top||L.w:L.f;if(L.w&&L.h>0.1)continue;g.wh[i]=L.water?0.02:0.03;g.wallT[i]=g.topT[i]=tex;g.glow[i]=L.water?2:0;}
 if(t===6)rhCondoSurf(g);else if(d.fx)rhSurf(g,d.fx);
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
 if(t===4){if(f.domino){sol(10,3);if(!sp.domino){sp.domino=1;npc('viejo',9.25,3.5,Object.assign(NPCLOOK.guest(),{hair:hex(0xd8d8d8),shirt:hex(0xf4f1e6),jacket:hex(0xf4f1e6),tee:true}),Math.PI/2,1);npc('viejo',10.75,3.5,Object.assign(NPCLOOK.guest(),{hair:hex(0xbcbcbc),shirt:hex(0xb8d8ee),jacket:hex(0xb8d8ee),tee:true}),-Math.PI/2,1);}}
  if(f.lechon){sol(22,2);sol(23,2);L('pig',22.6,2.6,3.5,[1.1,0.5,0.15],0.8);}
  if(f.hammock){sol(8,1);}}
 if(t===5){if(f.tiki){for(const x of [6,7,8])sol(x,7);L('tiki',7.6,7.8,4.5,[1.1,0.55,0.2],1.6);}
  if(f.rig){sol(29,12);sol(31,12);}}
 if(t===6){if(f.jukebox){sol(19,13);L('juke',19.4,13.5,3.5,[1.1,0.4,0.8],1.2);}if(f.bistro){sol(10,6);}if(f.neonsign)L('neon',14.5,5.4,6,[1.3,0.3,0.75],0.9);}
 if(t===7){if(f.koi){for(const [x,z] of [[9,2],[10,2],[11,2],[9,3],[10,3],[11,3]])sol(x,z);}
  if(f.aviary){for(const [x,z] of [[20,17],[21,17],[20,18],[21,18]])sol(x,z);if(!sp.macaw){sp.macaw=1;g.rh.birds=[{x:20.7,z:17.85,c:[0.9,0.1,0.1],ph:0},{x:21.3,z:18.15,c:[0.1,0.45,0.95],ph:1.7}];}}
  if(f.grotto)L('grotto',29.4,2.6,5,[0.2,0.6,1.1],1.0);
  if(f.cinema){sol(12,4);sol(13,4);L('cine',12,2.2,5,[0.6,0.6,0.9],1.2);}}}
function rhBanner(g){const t=g.rhome,d=RH_DEF[t];banner(HOMEDEF[t].name,(touchMode?'Tap':'Click')+' the phone for furniture and side jobs · '+(d.lift?'the lift takes you down to your car':d.carTxt));}
/* coming home: the car pulls up and you walk in; at the Flamingo Arms the lift brings you up from the lobby */
function rhArrive(g){if(!g||!g.rhome)return;const d=g.rdef;
 if(d.lift){const L=d.lift,p=g.player;if(!p)return;p.x=L.at[0];p.z=L.at[1];p.a=Math.PI/2;seqCamTo(g,p.x+1,p.z);sfx('ding');
  /* the lift doors open with you already in the car: no 'hide' step here (only stepping out of a car shows you again, so a hidden
     player stayed invisible for the whole visit) */
  g.hideP=false;g.inCar=null;
  startSeq([{k:'card',t1:d.title[0],t2:d.title[1]},{k:'wait',dur:0.6},{k:'walk',path:L.path,face:Math.PI,sp:2.4}],g=>{g.hideP=false;rhBanner(g);});return;}
 const c=g.hcar,c0=d.car;if(!c)return;seqCamTo(g,c0.x,c0.z-1);
 startSeq([{k:'hide',quiet:1},{k:'card',t1:d.title[0],t2:d.title[1]},{k:'drive',car:c,path:d.inPath||[[-7,c0.z],[c0.x,c0.z]],dur:d.inPath?4.0:2.6,ease:'out',camEnd:1},{k:'wait',dur:0.35},
  {k:'out',car:c,at:[c0.x-0.3,c0.z-0.72],a:Math.PI},{k:'walk',path:d.walk,face:Math.PI}],g=>rhBanner(g));}
function rhDepartPath(g,c){const d=g.rdef;return d&&d.depart?d.depart(c):null;}

/* ---------------- what you can press, where you can sit ---------------- */
function rhTargets(g,t){const f=homeFurn(),h=g.rhome,p=myProg(),a=arm();
 if(h===4&&f.domino)t.push({k:'rh',x:10,z:4.45,r:1.5,lbl:p.rhDom===a.jobs?'DOMINOES · THEY WANT A REMATCH TOMORROW':'PLAY DOMINOES · $100 A HAND',fn:()=>rhDomino(g)});
 if(h===4&&f.lechon)t.push({k:'rh',x:22.6,z:3.6,r:1.4,lbl:'GRAB A PLATE OF LECHON',fn:()=>rhLechon(g)});
 if(h===5&&f.rig)t.push({k:'rh',x:30.3,z:12.4,r:1.5,lbl:p.rhFish===a.jobs?'FISHING · NOTHING BITING TILL TOMORROW':'CAST A LINE',fn:()=>rhFish(g)});
 if(h===6&&f.jukebox)t.push({k:'hifi',x:18.75,z:13.5,r:1.6,lbl:'JUKEBOX · CHANGE TRACK'});
 if(h===7&&f.aviary)t.push({k:'rh',x:20.9,z:16.6,r:1.6,lbl:'TALK TO THE MACAWS',fn:()=>rhMacaw(g)});}
function rhSeats(g){const t=g.rhome,f=homeFurn(),L=[],add=(x,z,a,y,lbl,o)=>L.push(Object.assign({x,z,a,y,lbl},o||{}));
 if(t===4){for(const z of [13.55,14.25])add(11.62,z,Math.PI/2,0.1,'SIT ON THE SOFA',{out:{x:12.6,z}});for(const x of [6.0,7.8])add(x,17.75,0,0.08,'SIT IN THE ROCKING CHAIR',{out:{x,z:18.6}});
  if(f.hammock)add(6.4,2.3,Math.PI/2,0.36,'LIE IN THE HAMMOCK',{out:{x:6.4,z:3.4}});}
 if(t===5){add(4.6,9.7,0,0.02,'LIE ON THE LOUNGER',{out:{x:5.7,z:9.7}});add(14.15,7.55,-Math.PI/2,0.3,'TAKE THE HELM',{out:{x:14.3,z:9.3}});for(const x of [15.25,15.95])add(x,8.45,0,0.1,'SIT ON THE SETTEE',{out:{x,z:9.4}});
  if(f.tiki)for(const x of [6.6,7.5,8.4])add(x,8.3,Math.PI,0.32,'SIT AT THE TIKI BAR',{out:{x,z:9.1}});
  if(f.rig)for(const x of [29.6,31.0])add(x,12.25,0,0.12,'SIT IN THE FIGHTING CHAIR',{out:{x,z:13.1}});}
 if(t===6){for(const x of [11.75,12.4])add(x,14.62,0,0.1,'SIT ON THE SOFA');add(13.05,15.4,-0.5,0.08,'SIT IN THE ARMCHAIR');add(22.5,16.0,0,0.06,'SIT IN THE READING CHAIR');
  if(f.bistro)for(const [x,a] of [[9.9,-Math.PI/2],[11.1,Math.PI/2]])add(x,6.6,a,0.08,'SIT AT THE BISTRO TABLE');}
 if(t===7){for(const x of [27.6,28.3])add(x,10.62,0,0.1,'SIT ON THE SOFA');add(29.05,11.45,-0.5,0.08,'SIT IN THE ARMCHAIR');for(let i=0;i<3;i++)add(19.2,8.7+i*0.8,-Math.PI/2,0.36,'SIT AT THE BAR',{out:{x:19.9,z:8.7+i*0.8}});
  for(const x of [26.2,28.6])add(x,4.4,Math.PI,0.0,'LIE ON THE LOUNGER',{out:{x,z:5.3}});
  if(f.cinema)for(const x of [12.2,13.4])add(x,4.6,Math.PI,0.02,'WATCH THE MOVIE',{out:{x:x,z:5.4}});
  const J=RH_TUB;J.P.forEach(([x,z,a],i)=>add(x,z,a,J.y,'GET IN THE SPA',{tub:J,ti:i,out:{x:J.out[i][0],z:J.out[i][1]}}));}
 return L;}
const RH_TUB={x:15.5,z:3.0,y:0.12,P:[[15.5,3.6,Math.PI],[16.1,3.0,-Math.PI/2],[15.5,2.4,0],[14.9,3.0,Math.PI/2]],out:[[15.5,4.6],[17.3,4.3],[14.5,4.7],[14.3,4.3]]};

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
/* ===== CASITA, LITTLE HAVANA =====
   Reshaped 2026-11-25: a small L-shaped bungalow instead of a box filling the lot: the kitchen wing reaches back into the yard,
   a driveway and carport down the east side (an old Bel Air-ish sedan lives there), a front porch with striped awnings.
   World cells: bedroom x4-9 z13-15, bathroom x4-7 z9-11, hall x9-10 z9-11, dining x11-18 z9-11, living x11-18 z12-15,
   kitchen x14-18 z5-8, porch x4-18 z17-18, yard z2-7, carport x21-25 z9-21 */
4(B,bx,I,g,f){const n=bedN(),S=g.slots,WD=[0.5,0.32,0.18],WD2=[0.42,0.26,0.14],MINT=[0.55,0.85,0.75],PINK=[0.98,0.62,0.66],YEL=[1,0.85,0.4];
 rhRails(bx,g.def.map,[0.62,0.64,0.66],[0.7,0.72,0.74],1.0,true);
 /* the house outside: a white eave and a terracotta drip edge on every wall top, striped awnings over the front windows */
 for(const [x,z,w,d] of [[11.5,7.96,17.16,0.12],[11.5,17.04,17.16,0.12],[2.96,12.5,0.12,9.16],[20.04,12.5,0.12,9.16],[16.5,3.96,7.16,0.12],[12.96,6,0.12,4.1]]){bx(x,1.2,z,w,0.1,d,RH_WH);bx(x,1.27,z,w,0.04,d,RH_TERRA);}
 for(const [x0,x1] of [[4.9,8.1],[10.9,13.1],[15.9,18.1]]){const w=x1-x0;for(let i=0;i<Math.round(w/0.4);i++)bx(x0+0.2+i*0.4,1.36,17.28,0.4,0.03,0.6,i%2?RH_WH:[0.2,0.62,0.6],false);bx((x0+x1)/2,1.18,17.56,w,0.14,0.02,[0.2,0.62,0.6]);}
 /* the back yard: the mango tree, a clothesline with laundry, the back step and a washing machine by the kitchen door */
 rhTree(B,I,4.6,2.6,1.05,[0.2,0.5,0.22],[1,0.62,0.12]);
 for(const x of [13.8,23.2]){bx(x,0.85,1.7,0.07,1.7,0.07,[0.6,0.6,0.62]);bx(x,1.68,1.7,0.5,0.05,0.05,[0.6,0.6,0.62]);}bx(18.5,1.6,1.7,9.4,0.015,0.015,[0.85,0.85,0.85]);
 [[15,RH_WH],[16.2,[0.95,0.6,0.7]],[17.6,[0.5,0.75,0.95]],[19.0,[1,0.85,0.3]],[20.5,RH_WH],[21.8,[0.95,0.4,0.35]]].forEach(([x,c],i)=>bx(x,1.32-(i%2)*0.08,1.7,0.5+(i%3)*0.1,0.55,0.02,c));
 bx(20.3,0.06,6.5,0.6,0.12,1.0,[0.7,0.68,0.64]);
 {const K=hiKit(B,20.45,4.6,0,I);K.rb(0,0.42,0,0.62,0.84,0.6,RH_WH,0.2);K.cy(0,0.6,0.305,0.36,0.02,[0.3,0.45,0.55],'z');K.bx(0,0.86,-0.18,0.6,0.06,0.2,[0.85,0.85,0.88]);}
 if(!f.domino){I.r=0.3;I.box(TRS(10,0.22,3.6,0.3,0.45,0.04,0.45),RH_WH);I.box(TRS(10,0.48,3.82,0.3,0.45,0.5,0.05),RH_WH);I.r=0;}
 /* the bedroom: bed (it grows with the girls), a picture of Havana over it, the saint's shelf, a floor fan, a rag rug */
 drawBigBed((x,y,z,a,b,c,col)=>bx(x+1,y,z+1,a,b,c,col),4,n,WD,[0.95,0.92,0.82],[0.98,0.82,0.6]);
 bx(5.4,1.45,13.03,1.0,0.62,0.03,WD2);bx(5.4,1.45,13.045,0.9,0.52,0.01,[0.35,0.62,0.85]);bx(5.4,1.3,13.05,0.9,0.2,0.01,[0.95,0.85,0.6]);for(const x of [5.1,5.6])bx(x,1.48,13.055,0.12,0.22,0.01,[0.9,0.9,0.85]);
 {const K=hiKit(B,8.4,13.45,0,I);K.cy(0,0.02,0,0.3,0.03,[0.2,0.4,0.6],'y');K.sg([0,0.03,0],[0,0.9,0],0.04,0.04,[0.75,0.75,0.78]);K.cy(0,1.0,0.02,0.42,0.06,[0.2,0.4,0.6],'z');K.ring(0,1.0,0.03,0.2,0.04,0.02,[0.85,0.85,0.88],10,'z');}
 rhRug(bx,7.0,15.0,1.7,1.1,[0.85,0.4,0.3],[0.95,0.75,0.45]);
 /* the bathroom: Talavera tile floor, pink tile wainscot, a mirror over the sink */
 drawBathroomAt(bx,I,4.6,9.95,[0.4,0.78,0.75],[0.96,0.9,0.92]);bx(5.6,1.42,9.03,0.5,0.6,0.02,[0.75,0.85,0.9]);bx(5.6,1.42,9.025,0.58,0.68,0.01,[0.55,0.4,0.2]);
 for(const [x,z,w,d] of [[6.0,9.04,4.0,0.02],[4.04,10.5,0.02,3.0]])bx(x,0.45,z,w,0.9,d,PINK);
 /* the hall: a crucifix and a little shrine with candles */
 bx(9.5,1.6,9.03,0.05,0.4,0.02,[0.5,0.32,0.16]);bx(9.5,1.66,9.03,0.24,0.05,0.02,[0.5,0.32,0.16]);
 /* the kitchen: mint cabinets, a white fridge, the cafetera on the stove, cafecito cups, painted plates on the wall */
 rhCounter(bx,14.05,18.0,5.35,MINT,[0.95,0.94,0.9],{sink:15.2,stove:17.2});rhFridge(bx,18.55,5.4,[0.96,0.95,0.9]);
 bx(17.2,1.02,5.25,0.12,0.18,0.12,[0.75,0.75,0.78]);for(let i=0;i<4;i++)bx(15.9+i*0.18,0.96,5.2,0.07,0.07,0.07,RH_WH);
 for(let i=0;i<3;i++){const K=hiKit(B,15.0+i*0.55,5.03,0,I);K.cy(0,1.6,0,0.34,0.02,[[1,0.5,0.4],[0.95,0.85,0.4],[0.4,0.75,0.95]][i],'z');K.cy(0,1.6,0.012,0.18,0.01,RH_WH,'z');}
 bx(16.0,1.95,5.2,3.6,0.4,0.34,MINT);
 /* the dining room: a ceiling light over the table spot, a hutch of good china */
 {const K=hiKit(B,17.4,9.3,0,I);K.rb(0,0.5,0,1.1,1.0,0.5,WD2,0.15);K.rb(0,1.35,-0.1,1.0,0.7,0.28,WD2,0.15);K.bx(0,1.35,0.045,0.9,0.6,0.01,[0.7,0.82,0.85]);for(let i=0;i<4;i++)K.cy(-0.3+i*0.2,1.4,0.0,0.16,0.02,RH_WH,'z');}
 /* the living room: a floral sofa along the wall, coffee table, the TV on its cart, the phone, a picture of the old country, a fan overhead */
 {const K=hiKit(B,11.45,13.9,Math.PI/2,I);const FL=[0.9,0.55,0.45],CU=[0.98,0.85,0.7];K.rb(0,0.22,0,1.5,0.32,0.65,FL,0.35);K.rb(0,0.46,-0.28,1.5,0.4,0.1,FL,0.35);for(const sx of [-0.36,0.36])K.rb(sx,0.4,0.02,0.68,0.1,0.56,CU,0.5);
  for(const sx of [-0.76,0.76])K.rb(sx,0.34,0,0.12,0.32,0.62,FL,0.6);for(let i=0;i<5;i++)K.bx(-0.6+i*0.3,0.47,0.31,0.08,0.08,0.01,[0.95,0.4,0.45]);K.rr(0.5,0.58,-0.12,0,-0.3,0,0.26,0.26,0.08,YEL,0.8);}
 rhPhone(bx,S.o||{x:12.5,z:12.5},WD2,[0.95,0.4,0.45]);bx(12.75,0.7,12.35,0.06,0.12,0.06,[1.1,0.75,0.35],true);
 {const K=hiKit(B,13.2,13.9,0,I);K.rb(0,0.38,0,0.6,0.05,0.9,WD,0.3);K.legs(0.5,0.8,0.36,0.05,WD2);K.cy(0,0.43,0.15,0.16,0.08,[0.9,0.3,0.35],'y');}
 {const K=hiKit(B,18.45,13.0,-Math.PI/2,I);K.rb(0,0.3,0,0.7,0.6,0.45,[0.35,0.24,0.14],0.2);K.rb(0,0.86,0,0.62,0.52,0.48,[0.2,0.2,0.22],0.25);K.bx(0,0.86,0.245,0.48,0.38,0.01,[0.3,0.55,0.6],true);K.sf([0.1,1.12,0],[0.25,1.45,-0.05],0.012,0.012,HI_CH);K.sf([-0.1,1.12,0],[-0.25,1.45,-0.05],0.012,0.012,HI_CH);}
 bx(11.03,1.45,13.9,0.02,0.55,0.75,[0.6,0.45,0.2]);bx(11.045,1.45,13.9,0.01,0.45,0.65,[0.95,0.85,0.5]);bx(11.05,1.38,13.9,0.01,0.12,0.65,[0.2,0.55,0.3]);
 /* the front porch: posts, a low rail (open at the steps), two rocking chairs, pots of hibiscus; the mailbox at the gate; palms and two pink flamingos in the lawn */
 for(const x of [4.3,9.2,12.9,16.1,18.8]){bx(x,1.0,18.9,0.14,2.0,0.14,RH_WH);bx(x,0.04,18.9,0.24,0.08,0.24,RH_WH);}
 for(const [x0,x1] of [[4.3,12.9],[16.1,18.8]]){bx((x0+x1)/2,0.62,18.92,x1-x0,0.06,0.06,RH_WH);bx((x0+x1)/2,0.3,18.92,x1-x0,0.04,0.04,RH_WH);for(let x=x0+0.25;x<x1;x+=0.25)bx(x,0.46,18.92,0.03,0.32,0.03,RH_WH);}
 bx(14.5,0.05,19.2,3.0,0.1,0.4,[0.75,0.72,0.68]);
 for(const x of [6.0,7.8]){const K=hiKit(B,x,17.75,0,I);K.rb(0,0.3,0,0.5,0.06,0.5,[0.55,0.36,0.2],0.4);K.rb(0,0.62,-0.24,0.5,0.6,0.06,[0.55,0.36,0.2],0.4);for(const sx of [-0.24,0.24]){K.rr(sx,0.08,0,0,0,0,0.04,0.06,0.7,[0.45,0.28,0.15],0.6);K.rb(sx,0.2,0,0.04,0.24,0.04,[0.45,0.28,0.15],0.6);}}
 for(const [x,c] of [[4.2,[1,0.3,0.4]],[9.7,[1,0.55,0.2]],[12.4,[1,0.3,0.4]],[18.4,[1,0.85,0.3]]]){I.r=0.7;I.box(TRS(x,0.18,17.3,0,0.4,0.36,0.4),RH_TERRA);I.r=1;I.box(TRS(x,0.5,17.3,0,0.5,0.4,0.5),RH_LEAF);I.r=0;for(let i=0;i<4;i++)bx(x+Math.cos(i*1.6)*0.18,0.66,17.3+Math.sin(i*1.6)*0.18,0.1,0.06,0.1,c);}
 bx(12.6,0.55,22.3,0.06,1.1,0.06,[0.3,0.3,0.32]);bx(12.6,1.15,22.3,0.24,0.2,0.4,[0.25,0.45,0.75]);
 mvPalm(B,3.0,20.2,0.9,0.15);mvPalm(B,19.6,20.2,0.8,-0.1);
 for(const [x,z,a] of [[7.5,20.3,0.4],[8.3,20.6,-0.3]]){const K=hiKit(B,x,z,a,I);K.rb(0,0.62,0,0.16,0.18,0.3,RH_PINK,1);K.sg([0,0.68,0.12],[0,0.95,0.2],0.05,0.05,RH_PINK);K.rb(0,0.98,0.24,0.08,0.08,0.12,RH_PINK,1);K.sf([0,0.6,0],[0,0.05,0],0.02,0.02,[0.2,0.2,0.2]);}
 /* the carport: four posts and a slatted roof, an oil stain, the old sedan on the drive, a workbench */
 for(const x of [21.2,25.8])for(const z of [9.2,16.6]){bx(x,1.1,z,0.12,2.2,0.12,RH_WH);bx(x,0.05,z,0.24,0.1,0.24,[0.7,0.7,0.72]);}
 for(const z of [9.2,16.6])bx(23.5,2.22,z,4.84,0.12,0.1,RH_WH);for(const x of [21.2,23.5,25.8])bx(x,2.3,12.9,0.1,0.08,7.6,RH_WH);bx(23.5,2.36,9.2,4.9,0.03,0.6,[0.2,0.62,0.6]);
 bx(23.5,0.004,12.6,1.0,0.006,1.6,[0.15,0.14,0.13]);
 drawCarShapeRaw(B,23.5,12.5,1,Math.PI/2,'sedan',{col:[0.55,0.82,0.82]});
 {const K=hiKit(B,25.5,10.2,-Math.PI/2,I);K.rb(0,0.45,0,1.4,0.06,0.5,WD,0.2);K.legs(1.3,0.45,0.44,0.05,WD2);K.bx(0,1.2,0.22,1.4,0.8,0.03,[0.62,0.55,0.42]);for(let i=0;i<5;i++)K.bx(-0.5+i*0.25,1.25,0.19,0.04,0.3,0.04,[0.3,0.3,0.32]);K.rb(0.4,0.55,0,0.3,0.14,0.2,[0.8,0.15,0.15],0.3);}
 /* the street: a lamp each end, the kerb */
 for(const x of [5,23]){bx(x,1.3,23.2,0.08,2.6,0.08,[0.3,0.3,0.32]);bx(x+0.3,2.58,23.2,0.6,0.06,0.1,[0.3,0.3,0.32]);bx(x+0.55,2.5,23.2,0.24,0.08,0.18,[1.1,0.9,0.6],true);}
 bx(14,0.04,24.0,28,0.08,0.12,[0.75,0.75,0.72]);for(let x=1;x<28;x+=2.4)bx(x,0.012,25.9,1.2,0.01,0.08,[0.95,0.85,0.3]);
 /* upgrades */
 if(f.domino){const K=hiKit(B,10,3.5,0,I);K.rb(0,0.7,0,0.9,0.05,0.9,[0.2,0.45,0.25],0.2);K.legs(0.8,0.8,0.68,0.05,[0.3,0.3,0.32]);for(let i=0;i<9;i++)K.bx(-0.3+(i%5)*0.14,0.735,-0.15+Math.floor(i/5)*0.32+(i%2)*0.05,0.1,0.02,0.05,RH_WH);
  for(const sx of [-0.75,0.75]){K.rb(sx,0.36,0,0.36,0.05,0.36,[0.85,0.3,0.25],0.4);K.legs(0.3,0.3,0.34,0.04,[0.75,0.75,0.78]);}}
 if(f.lechon){const K=hiKit(B,22.6,2.6,0,I);K.rb(0,0.35,0,1.3,0.6,0.7,[0.5,0.3,0.15],0.15);K.bx(0,0.66,0,1.34,0.04,0.74,[0.25,0.25,0.27]);K.rb(0,0.74,0,1.0,0.1,0.5,[0.18,0.17,0.17],0.3);
  K.rb(0,0.6,0.52,0.7,0.3,0.25,[0.85,0.85,0.88],0.5);K.rb(0,0.84,0,0.9,0.22,0.36,[0.8,0.45,0.2],0.9);}
 if(f.hammock){bx(8.3,0.9,1.9,0.12,1.8,0.12,[0.45,0.3,0.18]);const K=hiKit(B,6.45,2.3,0,I);for(let i=0;i<7;i++){const u=i/6,y=0.62-Math.sin(u*Math.PI)*0.28;K.bx(-1.3+u*2.6,y,0,0.42,0.03,0.62,i%2?[1,0.4,0.35]:[1,0.85,0.4]);}K.sf([-1.6,1.1,0],[-1.3,0.62,0],0.02,0.02,RH_WH);K.sf([1.6,1.1,0],[1.3,0.62,0],0.02,0.02,RH_WH);}},
/* ===== THE LOW TIDE, HOUSEBOAT =====
   Reshaped 2026-11-25: a real hull (a sharp bow to the west, a rounded stern with a swim platform), a teak deck laid in planks
   over it, and the cabin split into a wheelhouse salon with the helm and galley, a stateroom and its own head. World cells:
   salon x13-20 z7-11, stateroom x22-27 z7-11 (head x26-27 z7-8), foredeck x2-11, aft deck x29-32, side decks z5 and z13 */
5(B,bx,I,g,f){const n=bedN(),S=g.slots,TK=[0.6,0.38,0.2],TK2=[0.52,0.32,0.17],NAVY=[0.1,0.18,0.42],H=RH_HULL,CH=HI_CH,BR=HI_BRASS;
 /* the hull: white topsides with a navy sheer stripe, a dark boot top at the waterline, a teak cap rail */
 const N=rhHullPts(),S2=N.map(([x,z])=>[x,2*H.cz-z]).reverse(),O=N.concat([[H.x1,H.cz+rhHullW(H.x1)]]).concat(S2.slice(1));
 const seg=(a,b,nx,nz,off,y,h,th,c)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<0.01)return;bx((a[0]+b[0])/2+nx*off,y,(a[1]+b[1])/2+nz*off,L+0.03,h,th,c,false,-Math.atan2(dz,dx));};
 for(let i=0;i<O.length-1;i++){const a=O[i],b=O[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=dz/L,nz=-dx/L;
  seg(a,b,nx,nz,0.07,0.12,0.36,0.14,RH_WH);seg(a,b,nx,nz,0.145,0.2,0.06,0.02,NAVY);seg(a,b,nx,nz,0.145,0.03,0.05,0.02,[0.42,0.1,0.1]);seg(a,b,nx,nz,0.04,0.315,0.04,0.22,TK);}
 mallWord(B,'LOW TIDE',27.2,0.06,H.cz+H.hw+0.16,0.15,NAVY);
 /* the deck: teak planks running fore and aft, black caulking between them, cut round the cabin */
 for(let k=0,z=H.cz-H.hw+0.02;z<H.cz+H.hw-0.02;z+=0.25,k++){const zc=z+0.125,d=Math.abs(zc-H.cz)+0.02;let xa=H.x0;while(xa<H.x1&&rhHullW(xa)<d)xa+=0.04;let xb=H.x1;while(xb>xa&&rhHullW(xb)<d)xb-=0.04;if(xb-xa<0.1)continue;
  const runs=zc>6&&zc<13?[[xa,12],[29,xb]]:[[xa,xb]],c=k%3===0?TK2:k%3===1?TK:[0.57,0.36,0.19];
  for(const [a,b] of runs){if(b-a<0.05)continue;bx((a+b)/2,0.015,zc,b-a,0.03,0.24,c);bx((a+b)/2,0.031,zc+0.124,b-a,0.004,0.012,[0.08,0.06,0.05]);}}
 /* stanchions and a chrome rail round the deck, open at the gangway */
 {const P=[];let acc=0;for(let i=0;i<O.length-1;i++){const a=O[i],b=O[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);acc+=L;if(acc>=1.05||i===0){acc=0;P.push(a);}}P.push(O[O.length-1]);
  const inn=([x,z])=>{const d=z<H.cz?1:-1;return[x+(x<H.x0+1?0.18:x>H.x1-0.05?-0.14:0),z+d*0.13];},gap=([x,z])=>z>H.cz&&x>16.9&&x<19.1;
  for(let i=0;i<P.length;i++){const p=inn(P[i]);if(gap(P[i]))continue;bx(p[0],0.45,p[1],0.04,0.9,0.04,CH);const q=P[i+1]&&inn(P[i+1]);if(!q||gap(P[i+1]))continue;
   for(const [y,t] of [[0.88,0.045],[0.5,0.025]]){const dx=q[0]-p[0],dz=q[1]-p[1];bx((p[0]+q[0])/2,y,(p[1]+q[1])/2,Math.hypot(dx,dz)+0.02,t,t,CH,false,-Math.atan2(dz,dx));}}}
 /* the bow: an anchor on its roller, the windlass, coiled warps, a pulpit light; the stern: swim platform, ladder, ensign */
 {const K=hiKit(B,H.x0+0.35,H.cz,0,I);K.rb(0.15,0.12,0,0.5,0.1,0.16,CH,0.4);K.cy(-0.12,0.05,0,0.12,0.16,[0.2,0.2,0.22],'z');K.sg([-0.18,0.0,0],[-0.18,-0.35,0],0.05,0.05,[0.2,0.2,0.22]);K.sg([-0.18,-0.35,-0.18],[-0.18,-0.35,0.18],0.05,0.05,[0.2,0.2,0.22]);}
 {const K=hiKit(B,3.3,H.cz,0,I);K.rb(0,0.16,0,0.5,0.32,0.36,[0.85,0.85,0.88],0.4);K.cy(0,0.3,0,0.26,0.4,CH,'x');K.cy(0,0.3,0,0.18,0.42,[0.2,0.2,0.22],'x');}
 for(const [x,z] of [[4.2,7.9],[29.6,5.6],[31.8,12.6]])for(let i=0;i<3;i++)bx(x,0.05+i*0.04,z,0.48-i*0.1,0.04,0.48-i*0.1,[0.88,0.82,0.62]);
 bx(H.x1+0.35,0.06,H.cz,0.7,0.06,4.4,TK);for(let i=0;i<9;i++)bx(H.x1+0.35,0.095,H.cz-2.0+i*0.5,0.66,0.004,0.04,TK2);
 for(const dz of [-0.22,0.22])bx(H.x1+0.62,0.0,H.cz+1.4+dz,0.04,0.5,0.04,CH);for(let i=0;i<3;i++)bx(H.x1+0.62,-0.15+i*0.14,H.cz+1.4,0.03,0.03,0.44,CH);
 {bx(32.9,0.9,6.2,0.04,1.8,0.04,[0.85,0.85,0.88]);for(let i=0;i<5;i++)bx(32.9,1.72-i*0.06,6.55,0.01,0.06,0.62,i%2?RH_WH:[0.85,0.12,0.15]);bx(32.9,1.66,6.4,0.012,0.18,0.3,NAVY);}
 /* the cabin outside: a white eave round the roof line, nav lights (red to port, green to starboard), life rings, a radar arch over the aft deck */
 for(const [x,z,w,d] of [[20.5,5.96,17.16,0.12],[20.5,13.04,17.16,0.12],[11.96,9.5,0.12,7.16],[29.04,9.5,0.12,7.16]]){bx(x,1.2,z,w,0.1,d,RH_WH);bx(x,1.13,z,w,0.04,d,NAVY);}
 bx(11.9,1.28,6.1,0.12,0.1,0.12,[0.3,1.3,0.4],true);bx(11.9,1.28,12.9,0.12,0.1,0.12,[1.4,0.25,0.2],true);
 for(const x of [14.0,24.5]){const K=hiKit(B,x,13.12,0,I);K.ring(0,0.75,0,0.22,0.08,0.08,[1,0.35,0.3],10,'z');K.ring(0,0.75,0,0.22,0.081,0.03,RH_WH,10,'z',false,0.3);}
 for(const z of [5.35,13.65]){bx(30.9,1.25,z,0.14,2.5,0.14,RH_WH);bx(30.9,1.25,z+(z<9?0.25:-0.25),0.1,0.06,0.5,RH_WH);}bx(30.9,2.52,9.5,0.18,0.1,8.44,RH_WH);
 {const K=hiKit(B,30.9,9.5,0,I);K.ov(0,2.62,0,0.6,0.6,0.05,RH_WH);K.rb(0,2.72,0,0.5,0.16,0.5,RH_WH,1);K.rb(0,2.6,1.6,0.9,0.05,0.12,[0.15,0.15,0.17],0.5);K.sg([0,2.57,-2.2],[0,3.4,-2.2],0.03,0.03,CH);bx(30.9,3.42,7.3,0.06,0.06,0.06,[1.3,1.2,1],true);}
 /* the foredeck: a lounger, palms in planters by the door, the jet ski's cleat */
 mvLounger(B,4.6,9.7,0,RH_TEAL);rhPlant(B,I,11.4,7.2,0.75,[0.95,0.94,0.9]);rhPlant(B,I,11.4,11.8,0.7,[0.95,0.94,0.9]);
 for(const [x,z] of [[13.8,4.85],[22,4.85],[22,14.15],[9,14.0]]){bx(x,0.06,z,0.26,0.04,0.06,CH);bx(x,0.04,z,0.05,0.06,0.05,CH);}
 /* the salon: helm station at the front windows (console, wheel, compass, throttles) with the captain's chair */
 {const K=hiKit(B,13.32,7.55,0,I);K.rb(0,0.45,0,0.56,0.9,0.86,TK,0.15);K.fr(0.05,0.95,0,0,0,0.35,0.5,0.06,0.84,[0.12,0.12,0.14]);K.bx(0.1,1.0,-0.2,0.02,0.1,0.22,[0.4,0.9,0.6],true);K.bx(0.1,1.0,0.18,0.02,0.1,0.18,[1,0.7,0.3],true);
  K.ball(-0.12,1.06,0,0.16,BR);K.ball(-0.12,1.1,0,0.12,[0.6,0.8,0.9]);for(const dz of [0.25,0.33])K.sg([0.18,0.92,dz],[0.3,1.08,dz],0.03,0.03,CH);
  const W=hiKit(B,13.68,7.55,Math.PI/2,I);W.ring(0,1.0,0,0.3,0.05,0.05,TK,12,'z');W.cy(0,1.0,0,0.1,0.07,BR,'z');for(let i=0;i<8;i++){const a=i*Math.PI/4;W.sf([0,1.0,0],[Math.cos(a)*0.4,1.0+Math.sin(a)*0.4,0],0.03,0.03,TK);}W.sg([0,0.65,-0.05],[0,0.95,-0.05],0.06,0.06,CH);}
 {const K=hiKit(B,14.15,7.55,0,I);K.cy(0,0.15,0,0.34,0.03,CH,'y');K.sg([0,0.15,0],[0,0.38,0],0.07,0.07,CH);K.rb(0,0.44,0,0.46,0.1,0.46,RH_WH,0.6);K.rb(0.21,0.7,0,0.08,0.46,0.44,RH_WH,0.6);for(const sz of [-1,1])K.rb(0,0.56,sz*0.22,0.36,0.05,0.05,NAVY,0.6);}
 /* the settee and a little round table, a ship's clock and barometer on the bulkhead, porthole mirrors */
 {const K=hiKit(B,15.6,8.4,0,I);K.rb(0,0.2,0,1.5,0.32,0.6,RH_WH,0.35);K.rb(0,0.46,-0.25,1.5,0.4,0.12,RH_WH,0.35);for(const sx of [-0.37,0.37]){K.rb(sx,0.4,0.03,0.7,0.1,0.52,NAVY,0.5);K.rb(sx,0.6,-0.17,0.62,0.26,0.1,NAVY,0.6);}
  for(const [sx,c] of [[-0.55,[0.95,0.4,0.35]],[0.55,[1,0.85,0.4]]])K.rr(sx,0.58,-0.1,0,-0.3,0,0.24,0.24,0.08,c,0.8);for(const sx of [-0.71,0.71])K.rb(sx,0.36,0,0.1,0.3,0.6,RH_WH,0.5);}
 {const K=hiKit(B,15.6,9.4,0,I);K.cy(0,0.42,0,0.62,0.04,TK,'y');K.sg([0,0.04,0],[0,0.4,0],0.06,0.06,CH);K.cy(0,0.02,0,0.32,0.03,CH,'y');K.cy(0.12,0.47,0.05,0.1,0.06,[0.95,0.94,0.9],'y');}
 for(const [z,face] of [[8.0,[0.95,0.94,0.9]],[10.9,[0.92,0.88,0.8]]]){const K=hiKit(B,20.97,z,-Math.PI/2,I);K.cy(0,1.45,0,0.3,0.04,BR,'z');K.cy(0,1.45,0.02,0.24,0.02,face,'z');K.sf([0,1.45,0.035],[0.08,1.52,0.035],0.012,0.005,[0.1,0.1,0.1]);}
 /* the galley: teak counter, a two-burner stove and sink, the fridge, cabinets with fiddle rails, hanging copper pans */
 rhCounter(bx,17.55,20.1,7.35,TK,[0.95,0.94,0.9],{sink:18.1,stove:19.55});rhFridge(bx,20.55,7.4,[0.96,0.95,0.9]);
 bx(18.8,1.72,7.2,2.5,0.5,0.34,TK);for(let i=0;i<4;i++)bx(17.86+i*0.62,1.72,7.375,0.56,0.44,0.01,TK2);bx(18.8,1.44,7.36,2.5,0.03,0.03,BR);
 for(let i=0;i<3;i++){const x=18.4+i*0.5;bx(x,1.36,7.5,0.01,0.12,0.01,[0.3,0.3,0.32]);const K=hiKit(B,x,7.5,0,I);K.cy(0,1.22,0,0.2-i*0.03,0.04,[0.8,0.45,0.25],'z');}
 bx(19.55,0.99,7.3,0.18,0.12,0.18,[0.75,0.75,0.78]);
 /* the stateroom: the bed (it grows with the girls), a book shelf over it, a sea chest, a mounted sailfish, a rug */
 drawBigBed((x,y,z,a,b,c,col)=>bx(x+1,y,z+1,a,b,c,col),5,n,TK,[0.92,0.94,0.98],[0.22,0.35,0.7]);
 bx(22.2,1.3,8.5,0.24,0.04,2.6,TK);for(let i=0;i<9;i++)bx(22.2,1.4,7.6+i*0.2,0.14,0.16+(i%3)*0.025,0.06,[[0.8,0.2,0.2],[0.2,0.4,0.8],[0.9,0.8,0.3],[0.2,0.6,0.3]][i%4]);
 {const K=hiKit(B,25.75,10.32,0,I);K.rb(0,0.24,0,0.9,0.44,0.5,TK,0.25);K.rb(0,0.5,0,0.92,0.1,0.52,TK2,0.6);for(const sx of [-0.35,0.35])K.bx(sx,0.26,0.256,0.08,0.4,0.01,BR);K.bx(0,0.36,0.26,0.12,0.1,0.01,BR);}
 {const K=hiKit(B,26.3,10.04,0,I);K.rr(0,1.55,0,0,0,0.12,0.9,0.16,0.05,[0.2,0.35,0.6],0.8);K.rr(-0.1,1.66,0,0,0,0.6,0.08,0.3,0.03,[0.15,0.25,0.5],0.6);K.rr(0.5,1.6,0,0,0,0.0,0.06,0.03,0.03,[0.15,0.15,0.2],0.6);K.bx(0,1.55,-0.03,1.1,0.4,0.02,TK);}
 rhRug(bx,24.2,10.55,1.6,0.8,NAVY,[0.92,0.9,0.85]);
 /* the head: white tile, a small sink and a shower */
 drawBathroomAt(bx,I,26.2,7.85,[0.85,0.9,0.95],RH_WH);
 /* the pier and the lot: planks, bollards, mooring pilings and warps, a dock box, lamps, parking lines; the gangway */
 for(let x=0.5;x<38;x+=1.1)bx(x,0.004,17,0.04,0.008,2.0,[0.25,0.18,0.1]);
 for(const x of [6,12,24,30]){bx(x,0.22,16.2,0.22,0.44,0.22,[0.2,0.2,0.22]);bx(x,0.46,16.2,0.3,0.06,0.3,[0.2,0.2,0.22]);}
 for(const [x,z] of [[9.5,3.9],[27.5,3.9],[9.5,15.15],[27.5,15.15]]){I.r=0.8;I.box(TRS(x,0.5,z,0,0.32,1.0,0.32),[0.45,0.32,0.2]);I.r=0;bx(x,1.02,z,0.26,0.04,0.26,[0.9,0.88,0.8]);}
 for(const [x0,z0,x1,z1] of [[9,14.15,9.5,15.15],[22,14.15,24,16.2],[12,14.2,12,16.2],[13.8,4.85,9.5,3.9]]){const dx=x1-x0,dz=z1-z0;bx((x0+x1)/2,0.25,(z0+z1)/2,0.025,0.025,Math.hypot(dx,dz),[0.9,0.85,0.7],false,Math.atan2(dx,dz));}
 for(const x of [17.05,18.95]){bx(x,0.5,15.0,0.05,1.0,0.05,CH);bx(x,0.95,15.0,0.05,0.05,2.0,CH);}bx(18,0.06,15.0,1.9,0.06,2.0,[0.55,0.45,0.3]);for(let i=0;i<7;i++)bx(18,0.095,14.15+i*0.28,1.86,0.012,0.04,[0.4,0.32,0.2]);
 bx(11,0.3,17.6,1.0,0.6,0.5,RH_WH);bx(11,0.62,17.6,1.04,0.04,0.54,[0.25,0.55,0.85]);
 for(const x of [9,27]){bx(x,1.2,17.75,0.08,2.4,0.08,[0.3,0.3,0.32]);bx(x,2.42,17.75,0.3,0.12,0.3,[1.1,0.9,0.6],true);}
 for(let x=3;x<36;x+=3.2)bx(x,0.012,19.4,0.08,0.01,1.6,RH_WH);
 /* upgrades: the tiki bar on the foredeck, the fishing chairs on the aft deck */
 if(f.tiki){bx(7.6,0.5,7.3,2.8,1.0,0.5,[0.6,0.45,0.25]);for(let i=0;i<7;i++)bx(6.4+i*0.4,0.5,7.56,0.06,0.9,0.02,[0.4,0.28,0.12]);bx(7.6,1.02,7.35,2.9,0.05,0.7,[0.45,0.3,0.15]);
  for(let i=0;i<4;i++)bx(7.6,1.95+i*0.07,7.4,3.3-i*0.4,0.08,1.5-i*0.25,[0.85,0.7,0.35].map(v=>v*(0.9+0.05*i)));for(const x of [6.1,9.1])bx(x,1.45,7.05,0.06,1.0,0.06,[0.45,0.3,0.15]);
  for(const x of [6.6,7.5,8.4]){bx(x,0.38,8.3,0.3,0.04,0.3,[0.6,0.45,0.25]);bx(x,0.19,8.3,0.05,0.38,0.05,[0.45,0.3,0.15]);}
  for(const [x,c] of [[7.0,[1,0.6,0.2]],[8.0,[0.3,0.8,0.4]]])bx(x,1.12,7.3,0.12,0.16,0.12,c);}
 if(f.rig)for(const x of [29.6,31.0]){const K=hiKit(B,x,12.25,0,I);K.rb(0,0.32,0,0.5,0.08,0.5,RH_WH,0.4);K.rb(0,0.6,-0.24,0.5,0.55,0.08,RH_WH,0.4);K.cy(0,0.15,0,0.16,0.3,[0.7,0.7,0.74],'y');
  K.sg([0.22,0.5,0.1],[0.6,2.0,1.6],0.025,0.025,[0.2,0.2,0.22]);K.sf([0.6,2.0,1.6],[0.62,0.1,2.6],0.004,0.004,[0.9,0.9,0.9]);}},
/* ===== THE FLAMINGO ARMS, ART DECO CONDO =====
   Revamped 2026-11-22: its own deco surfaces (renderer.js tiles 238-247, laid by rhCondoSurf) and rounded furniture built
   from the homeitems.js kit instead of plain boxes. World cells: bedroom x2-9 z9-12, bathroom x2-6 z14-16, living room
   x11-19 z9-12 plus x8-19 z13-16, kitchen x21-27 z9-12, den x21-27 z14-16, corridor x11-20 z18-19, balcony x7-22 z6-7 */
6(B,bx,I,g,f){const n=bedN(),S=g.slots,MINT=[0.56,0.88,0.78],PEACH=[1,0.78,0.62],CHR=HI_CH,BLUSH=[0.98,0.72,0.74],CORAL=[0.96,0.5,0.46],TEAL=[0.12,0.5,0.48],FROST=[1.1,0.98,0.86];
 /* the beach below: palms along the promenade, a lifeguard tower, two striped umbrellas */
 for(const [x,l] of [[2.5,0.2],[7.5,-0.1],[20.5,0.15],[26.5,-0.2]])mvPalm(B,x,4.4,1.0,l);
 {const K=hiKit(B,24.5,3.2,0,I);for(const sx of [-0.4,0.4])for(const sz of [-0.3,0.3])K.rb(sx,0.6,sz,0.07,1.2,0.07,RH_WH,0.6);K.rb(0,1.25,0,1.1,0.08,0.9,RH_WH,0.3);K.rb(0,1.65,0,1.0,0.75,0.8,[1,0.55,0.62],0.35);K.rb(0,2.08,0,1.25,0.12,1.05,MINT,0.8);K.bx(0,1.65,0.41,0.6,0.4,0.01,[0.3,0.6,0.8]);}
 mvUmbrella(B,11.5,3.3,RH_PINK);mvUmbrella(B,15.5,2.8,RH_TEAL);
 /* the balcony: a white rail with mint top rail, a solid peach parapet with a rounded white cap, round ends, planters and a lounger */
 rhRails(bx,g.def.map,RH_WH,MINT,0.95);
 {const K=hiKit(B,14.5,5.04,0,I);K.rb(0,0.3,0,17.2,0.6,0.1,PEACH,0.2);K.rb(0,0.63,-0.02,17.4,0.06,0.18,RH_WH,1);for(let i=0;i<3;i++)K.bx(0,0.12+i*0.09,0.055,17.0,0.035,0.01,[MINT,RH_WH,RH_PINK][i]);}
 for(const [x,s] of [[6.0,1],[23.0,-1]]){const K=hiKit(B,x,5.0,0,I);for(let i=0;i<8;i++){const a=(i+0.5)/8*Math.PI/2,px=-s*Math.cos(a)*0.0+s*(1-Math.cos(a))*0.25,pz=Math.sin(a)*1.9;K.rb(px,0.3,pz,0.1,0.6,0.3,PEACH,0.4);K.rb(px,0.63,pz,0.18,0.06,0.32,RH_WH,1);}}
 for(const x of [7.4,21.6]){const K=hiKit(B,x,7.45,0,I);K.cy(0,0.24,0,0.62,0.48,RH_WH,'y',false,0.6);K.cy(0,0.49,0,0.66,0.04,MINT,'y');rhPlant(B,I,x,7.45,0.8,RH_WH);}
 mvLounger(B,19.8,6.75,Math.PI/2,RH_PINK);{const K=hiKit(B,18.5,6.5,0,I);K.cy(0,0.42,0,0.45,0.03,RH_WH,'y');K.rb(0,0.21,0,0.05,0.42,0.05,CHR,1);K.cy(0,0.015,0,0.3,0.03,CHR,'y');K.ball(0.08,0.5,0,0.1,[1,0.85,0.3]);}
 /* the facade over the windows: rounded eyebrow ledges and the speed stripes along the top of the wall */
 for(const x0 of [4,11,22]){const K=hiKit(B,x0+1.5,7.9,0,I);K.rb(0,2.0,0,3.4,0.06,0.34,RH_WH,1);}for(let i=0;i<3;i++)bx(14,2.35-i*0.09,7.98,28,0.04,0.02,[MINT,PEACH,RH_PINK][i]);
 /* ---- the bedroom: the bed (it grows with the girls) with a tall channel-tufted fan headboard, nightstand with a globe lamp,
    a waterfall vanity with a round mirror and a pouf, a round rug, a chrome torchiere ---- */
 drawBigBed((x,y,z,a,b,c,col)=>bx(x+1,y,z+1,a,b,c,col),6,n,RH_WH,[0.98,0.97,0.96],[1,0.65,0.75]);
 {const W0=bigBedWorld(6,n),K=hiKit(B,W0.x-0.98*W0.s,W0.z,0,I),w=W0.w+0.25;K.rb(-0.02,0.62,0,0.12,1.24,w,BLUSH,0.5);
  const k=Math.max(3,Math.round(w/0.32));for(let i=0;i<k;i++)K.rb(0.06,0.66,-w/2+(i+0.5)*w/k,0.06,1.05,w/k*0.8,[1,0.8,0.82],1);
  K.rb(0,1.32,0,0.14,0.22,w*0.62,BLUSH,1);K.rb(0,1.46,0,0.14,0.16,w*0.3,BLUSH,1);K.rb(0.02,1.26,0,0.16,0.05,w+0.04,GOLD,1);
  const nz=W0.z+W0.w/2+0.36;if(nz<12.7){const N=hiKit(B,2.42,nz,0,I);N.rb(0,0.28,0,0.46,0.56,0.42,RH_WH,0.6);N.bx(0.235,0.28,0,0.01,0.03,0.3,GOLD);N.cy(0,0.58,0,0.2,0.03,CHR,'y');N.rb(0,0.66,0,0.03,0.14,0.03,CHR,1);N.ball(0,0.82,0,0.24,FROST);}}
 {const K=hiKit(B,6.4,9.32,0,I);K.rb(0,0.38,0,1.25,0.76,0.5,RH_WH,0.7);K.rb(0,0.79,0,1.3,0.05,0.54,PEACH,1);for(const sx of [-0.33,0.33])K.bx(sx,0.5,0.252,0.5,0.01,0.01,GOLD);
  K.ring(0,1.4,-0.18,0.4,0.06,0.05,CHR,16,'z');K.cy(0,1.4,-0.17,0.74,0.01,[0.72,0.84,0.92],'z',false,0);K.rb(0,1.88,-0.2,0.18,0.12,0.04,GOLD,1);
  K.cy(0,0.24,0.7,0.42,0.42,BLUSH,'y',false,1);K.cy(0,0.46,0.7,0.4,0.04,[1,0.86,0.86],'y');}
 {const K=hiKit(B,5.6,11.4,0,I);K.ov(0,0.006,0,2.4,1.5,0.008,PEACH);K.ov(0,0.009,0,2.0,1.15,0.008,[1,0.88,0.8]);K.ov(0,0.012,0,0.9,0.5,0.008,RH_PINK);}
 {const K=hiKit(B,8.6,12.5,0,I);K.cy(0,0.02,0,0.34,0.04,CHR,'y');K.rb(0,0.85,0,0.035,1.7,0.035,CHR,1);K.cy(0,1.72,0,0.42,0.1,FROST,'y',true);}
 /* ---- the bathroom: a pink rounded tub along the west wall with a chrome shower ring, a pink toilet, a pedestal sink under a round
    mirror, a towel rail, a bath mat ---- */
 {const K=hiKit(B,2.48,15.6,0,I);K.rb(0,0.3,0,0.82,0.6,1.6,[0.98,0.66,0.74],0.7);K.rb(0,0.56,0,0.62,0.04,1.38,[0.6,0.82,0.95],1);K.rb(0,0.62,0,0.86,0.04,1.64,RH_WH,1);
  K.rb(-0.3,1.02,-0.62,0.04,0.8,0.04,CHR,1);K.rb(-0.2,1.4,-0.62,0.22,0.04,0.04,CHR,1);K.cy(-0.08,1.38,-0.62,0.14,0.03,CHR,'y');K.ring(0.05,1.9,0,0.48,0.025,0.025,CHR,14);
  for(let i=0;i<5;i++)K.bx(0.05-0.45+i*0.02,1.35,-0.35+i*0.1,0.02,1.1,0.12,[0.8,0.95,0.92]);}
 {const K=hiKit(B,6.3,14.38,0,I);K.rb(0,0.22,0.05,0.36,0.44,0.48,[0.98,0.66,0.74],0.8);K.rb(0,0.45,0.08,0.42,0.06,0.52,[0.98,0.66,0.74],1);K.rb(0,0.62,-0.18,0.46,0.4,0.18,[0.98,0.66,0.74],0.6);K.bx(0,0.84,-0.16,0.06,0.02,0.04,CHR);}
 {const K=hiKit(B,5.0,14.3,0,I);K.rb(0,0.42,0,0.18,0.84,0.18,[0.98,0.66,0.74],0.8,0.3);K.rb(0,0.86,0.04,0.62,0.12,0.42,[0.98,0.66,0.74],1);K.ov(0,0.93,0.04,0.42,0.26,0.01,[0.6,0.8,0.9]);K.rb(0,1.0,-0.14,0.04,0.14,0.04,CHR,1);
  K.ring(0,1.55,-0.27,0.32,0.05,0.04,CHR,14,'z');K.cy(0,1.55,-0.26,0.6,0.01,[0.72,0.84,0.92],'z',false,0);
  K.rb(-0.95,1.2,-0.26,0.6,0.03,0.03,CHR,1);K.bx(-0.95,1.0,-0.24,0.4,0.4,0.03,MINT);K.bx(-0.95,1.0,-0.225,0.4,0.05,0.01,RH_WH);}
 {const K=hiKit(B,4.2,15.9,0,I);K.ov(0,0.008,0,1.0,0.6,0.01,MINT);K.ov(0,0.011,0,0.8,0.44,0.01,RH_WH);}
 rhPlant(B,I,6.45,16.4,0.55,RH_WH);
 /* ---- the kitchen: mint rounded cabinets with chrome pulls, a white counter with a rounded nose, the range with chrome knobs and a
    hood, upper cabinets where there is no window, a rounded retro fridge, a toaster, a stand mixer and a fruit bowl ---- */
 {const K=hiKit(B,24.8,9.35,0,I),w=5.6;K.rb(0,0.44,0,w,0.84,0.6,MINT,0.25);K.rb(0,0.9,0.01,w+0.04,0.07,0.66,[0.97,0.97,0.96],1);K.bx(0,0.05,0.26,w,0.1,0.02,TEAL);
  for(let i=0;i<9;i++){const x=-w/2+0.31+i*0.62;K.rb(x,0.48,0.3,0.56,0.68,0.02,[0.62,0.92,0.84],0.4);K.rb(x,0.74,0.32,0.18,0.03,0.03,CHR,1);}
  K.ov(-0.3,0.94,0,0.56,0.4,0.02,[0.66,0.68,0.72]);K.rb(-0.3,1.06,-0.24,0.04,0.22,0.04,CHR,1);K.sg([-0.3,1.16,-0.24],[-0.3,1.14,-0.08],0.035,0.035,CHR);
  K.rb(1.8,0.94,0,0.66,0.02,0.54,[0.08,0.08,0.09],0.5);for(const dx of [-0.15,0.15])for(const dz of [-0.12,0.12])K.cy(1.8+dx,0.955,dz,0.16,0.01,[0.3,0.3,0.32],'y');for(let i=0;i<4;i++)K.cy(1.56+i*0.16,0.78,0.33,0.06,0.03,CHR,'z');
  K.rb(1.8,1.8,-0.12,0.8,0.12,0.42,CHR,0.8);K.rb(1.8,2.05,-0.22,0.4,0.4,0.2,CHR,0.6,0.4);
  for(const x of [0.9,2.55]){K.rb(x,1.75,-0.14,0.7,0.6,0.32,MINT,0.3);K.rb(x,1.75,0.025,0.6,0.5,0.02,[0.62,0.92,0.84],0.4);K.rb(x+0.24,1.56,0.04,0.03,0.12,0.03,CHR,1);}
  K.rb(-1.9,1.0,0.02,0.32,0.18,0.2,CHR,0.8);K.bx(-1.9,1.1,0.02,0.2,0.02,0.04,[0.15,0.15,0.17]);
  K.rb(-1.2,1.0,0.0,0.2,0.16,0.28,RH_PINK,0.8);K.rb(-1.2,1.12,0.05,0.12,0.08,0.24,RH_PINK,1);K.cy(-1.2,1.0,0.14,0.18,0.14,CHR,'y');
  K.cy(0.6,0.96,0.04,0.32,0.06,RH_WH,'y');for(const [dx,dz,c] of [[0.55,0.02,[1,0.55,0.15]],[0.66,0.07,[0.95,0.2,0.2]],[0.6,-0.04,[1,0.85,0.2]]])K.ball(dx,1.02,dz,0.09,c);}
 {const K=hiKit(B,27.5,10.6,-Math.PI/2,I);K.rb(0,0.92,0,0.72,1.84,0.64,[0.62,0.9,0.82],0.9);K.bx(0,1.2,0.325,0.66,0.01,0.01,[0.42,0.66,0.6]);K.rb(0.27,1.5,0.34,0.04,0.32,0.05,CHR,1);K.rb(0.27,0.8,0.34,0.04,0.32,0.05,CHR,1);
  K.bx(0,0.4,0.33,0.3,0.06,0.01,CHR);}
 /* ---- the living room: a curved channel-tufted sofa, a tub armchair and a round glass table on a big round rug; a sunburst mirror over
    a deco console; a chrome torchiere; palms; the phone; a deco print ---- */
 {const K=hiKit(B,12.4,15.15,0,I);K.ov(0,0.006,0,3.6,2.4,0.008,TEAL);K.ov(0,0.009,0,3.3,2.1,0.008,[0.97,0.93,0.86]);K.ov(0,0.012,0,2.3,1.4,0.008,BLUSH);K.ov(0,0.015,0,1.6,0.9,0.008,[0.97,0.93,0.86]);}
 {const W=[0.97,0.95,0.92],CU=[1,0.72,0.78];
  for(const [dx,a,w] of [[0,0,1.0],[-0.68,0.42,0.48],[0.68,-0.42,0.48]]){const K=hiKit(B,12.0+dx,14.6+(dx?0.12:0),a,I);K.rb(0,0.2,0,w,0.3,0.68,W,0.6);K.rb(0,0.38,0.04,w-0.04,0.1,0.56,CU,1);
   K.rb(0,0.56,-0.27,w,0.46,0.16,W,0.8);const m=Math.max(2,Math.round(w/0.25));for(let i=0;i<m;i++)K.rb(-w/2+(i+0.5)*w/m,0.58,-0.18,w/m*0.82,0.36,0.06,CU,1);}
  for(const s of [-1,1]){const K=hiKit(B,12.0+s*0.98,14.82,-s*0.42,I);K.rb(0,0.3,0,0.18,0.5,0.66,W,1);}
  {const K0=hiKit(B,13.05,15.4,-0.5,I);K0.cy(0,0.18,0,0.68,0.3,W,'y',false,0.8);K0.cy(0,0.35,0,0.56,0.06,CU,'y',false,1);for(let i=0;i<7;i++){const a=Math.PI*(1.12+i*0.76/6);K0.rb(Math.cos(a)*0.29,0.5,Math.sin(a)*0.29,0.17,0.38,0.12,W,1,0,-a);}}
  const T=hiKit(B,12.15,15.7,0,I);T.cy(0,0.36,0,0.82,0.03,[0.74,0.88,0.94],'y');T.cy(0,0.335,0,0.86,0.02,CHR,'y');T.rb(0,0.18,0,0.06,0.32,0.06,CHR,1);T.cy(0,0.02,0,0.44,0.03,CHR,'y');T.rb(0.15,0.42,0.05,0.12,0.08,0.12,RH_PINK,1);}
 {const K=hiKit(B,9.0,14.28,0,I);K.rb(0,0.4,0,1.3,0.06,0.4,RH_WH,1);K.rb(0,0.2,0,1.24,0.36,0.34,[0.98,0.8,0.78],0.5);for(const sx of [-0.55,0.55])K.rb(sx,0.2,0,0.08,0.4,0.36,GOLD,1);
  for(let i=0;i<16;i++){const a=i*TAU/16;K.sf([Math.cos(a)*0.22,1.45+Math.sin(a)*0.22,-0.2],[Math.cos(a)*(i%2?0.5:0.62),1.45+Math.sin(a)*(i%2?0.5:0.62),-0.2],0.03,0.012,GOLD);}
  K.cy(0,1.45,-0.19,0.44,0.02,GOLD,'z');K.cy(0,1.45,-0.18,0.36,0.01,[0.74,0.86,0.94],'z',false,0);K.rb(-0.35,0.5,0.02,0.12,0.16,0.12,MINT,1);K.ball(0.4,0.5,0.0,0.14,[1,0.7,0.2]);}
 {const K=hiKit(B,10.6,13.2,0,I);K.cy(0,0.02,0,0.38,0.04,CHR,'y');K.rb(0,0.88,0,0.035,1.76,0.035,CHR,1);K.cy(0,1.78,0,0.46,0.12,FROST,'y',true);K.ring(0,1.78,0,0.23,0.03,0.13,GOLD,12);}
 rhPlant(B,I,19.35,9.45,0.9,RH_WH);rhPlant(B,I,8.45,16.4,0.85,RH_WH);
 rhPhone(bx,S.o||{x:13.5,z:9.5},RH_WH,RH_PINK);
 {const K=hiKit(B,18.3,9.03,0,I);K.rb(0,1.4,0,1.0,0.9,0.03,GOLD,0.4);K.bx(0,1.4,0.016,0.9,0.8,0.01,[0.12,0.12,0.15]);for(let i=0;i<5;i++)K.bx(0,1.12+i*0.13,0.022,0.8-i*0.13,0.05,0.01,[RH_PINK,MINT,PEACH,RH_TEAL,[1,0.85,0.4]][i]);}
 /* ---- the den: a tub reading chair, a torchiere, a record console with a turntable, a round rug ---- */
 {const K=hiKit(B,23.6,15.6,0,I);K.ov(0,0.006,0,1.9,1.3,0.008,CORAL);K.ov(0,0.009,0,1.6,1.0,0.008,[0.98,0.88,0.78]);}
 {const K=hiKit(B,22.5,16.0,0,I);K.cy(0,0.18,0,0.7,0.32,CORAL,'y',false,0.8);K.cy(0,0.36,0,0.58,0.06,[1,0.82,0.74],'y',false,1);K.rb(0,0.56,-0.27,0.7,0.48,0.16,CORAL,1);for(const s of [-1,1])K.rb(s*0.32,0.42,0,0.12,0.26,0.6,CORAL,1);}
 {const K=hiKit(B,21.45,16.3,0,I);K.cy(0,0.02,0,0.32,0.04,CHR,'y');K.rb(0,0.8,0,0.035,1.6,0.035,CHR,1);K.cy(0,1.62,0,0.4,0.1,FROST,'y',true);}
 {const K=hiKit(B,27.25,14.3,0,I);K.rb(0,0.34,0,0.95,0.6,0.44,[0.42,0.24,0.12],0.4);K.rb(0,0.66,0,0.99,0.04,0.48,[0.3,0.16,0.08],1);for(const sx of [-0.22,0.22])K.bx(sx,0.34,0.222,0.4,0.5,0.01,[0.5,0.3,0.16]);
  K.rb(-0.1,0.7,0,0.5,0.05,0.38,[0.12,0.12,0.13],0.6);K.cy(-0.12,0.735,0,0.3,0.01,[0.05,0.05,0.06],'y');K.cy(-0.12,0.742,0,0.1,0.01,RH_PINK,'y');K.sf([0.08,0.75,-0.12],[-0.02,0.75,0.04],0.015,0.015,CHR);
  K.rb(0.33,0.78,0,0.18,0.18,0.3,[0.9,0.85,0.75],0.3);}
 /* ---- the corridor: a deco runner, fan sconces, brass lift doors with a sunburst and the floor dial, a palm ---- */
 {const K=hiKit(B,15.5,18.95,0,I);K.rb(0,0.007,0,9,0.008,0.8,TEAL,0.6);K.rb(0,0.009,0,8.7,0.008,0.55,BLUSH,0.6);for(let x=-4;x<=4;x+=1)K.bx(x,0.012,0,0.3,0.004,0.3,GOLD,false,Math.PI/4);}
 for(const x of [12.5,16.0,19.0]){const K=hiKit(B,x,18.04,0,I);K.rb(0,1.5,0,0.34,0.06,0.06,GOLD,1);for(let i=0;i<5;i++){const a=Math.PI*(0.15+i*0.175);K.fr(Math.cos(a)*0.12,1.55+Math.sin(a)*0.12,0.02,0,0,a-Math.PI/2,0.05,0.18,0.03,FROST,true);}}
 {const K=hiKit(B,10.04,18.95,Math.PI/2,I),BR=[0.62,0.46,0.2];K.rb(0,1.12,0,1.5,2.24,0.05,BR,0.3);K.bx(0,1.02,0.03,1.2,1.96,0.01,[0.5,0.38,0.18]);K.bx(0,1.05,0.04,0.02,2.0,0.01,[0.35,0.25,0.1]);
  for(let i=0;i<9;i++){const a=Math.PI*(i/8);K.sf([0,2.08,0.04],[Math.cos(a)*0.55,2.08+Math.sin(a)*0.3,0.04],0.03,0.01,[1,0.85,0.45]);}
  K.cy(0.95,1.3,0.04,0.16,0.02,[0.12,0.12,0.13],'z');K.bx(0.95,1.32,0.05,0.02,0.06,0.005,[1,0.6,0.2],true);}
 rhPlant(B,I,19.55,18.45,0.7,RH_WH);
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
 mvPalm(B,18.0,1.6,0.8,0.15);
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
 for(const [x,z] of [[15.0,13.5],[21.0,13.5],[14.6,18.6]])rhPlant(B,I,x,z,1.0);
 /* reshaped 2026-11-25: the courtyard is open to the front loggia (a U round it now, not a closed box), with an arcade of
    columns and arches down both sides; Spanish barrel tile eaves on every wall top, iron rejas on the front windows,
    and a mirador tower over the pool corner */
 for(const x of [13.45,22.55]){for(const z of [13.4,16.7,18.9])I.r=0.5,I.box(TRS(x,0.95,z,0,0.24,1.9,0.24),CREAM),I.r=0,bx(x,0.06,z,0.36,0.12,0.36,CREAM),bx(x,1.92,z,0.34,0.08,0.34,CREAM);
  for(const [z0,z1] of [[13.4,16.7],[16.7,18.9]]){const zc=(z0+z1)/2,L=z1-z0;bx(x,2.05,zc,0.26,0.16,L+0.3,CREAM);for(let i=1;i<6;i++){const u=i/6,h=Math.sin(u*Math.PI)*0.32;bx(x,1.88-h*0.0+0.02,z0+u*L,0.22,0.06+Math.max(0,0.28-h),0.02+L/6,CREAM);}}}
 {const map=g.def.map,out=c=>c!==undefined&&',=ucw'.includes(c),wall=c=>c==='#'||c==='W';
  map.forEach((row,Z)=>{for(let X=0;X<row.length;X++){if(!wall(row[X]))continue;for(const [dx,dz] of [[0,1],[0,-1],[1,0],[-1,0]]){if(!out((map[Z+dz]||'')[X+dx]))continue;
   const cx=X+1.5+dx*0.62,cz=Z+1.5+dz*0.62,al=dz!==0;bx(cx,1.22,cz,al?1.02:0.3,0.06,al?0.3:1.02,RH_TERRA);I.r=1;
   for(let k=0;k<4;k++){const o=-0.375+k*0.25;I.box(TRS(cx+(al?o:0),1.3,cz+(al?0:o),0,al?0.17:0.34,0.11,al?0.34:0.17),k%2?[0.68,0.3,0.16]:[0.78,0.38,0.2]);}I.r=0;
   if(dz===1&&row[X]==='W'){for(let k=0;k<5;k++)bx(X+1.1+k*0.2,0.78,Z+2.07,0.025,0.66,0.025,[0.08,0.08,0.09]);for(const y of [0.48,1.08])bx(X+1.5,y,Z+2.07,0.9,0.03,0.03,[0.08,0.08,0.09]);}}}});}
 {const x=33,z=3;bx(x,2.4,z,2.0,2.5,2.0,CREAM);bx(x,1.2,z+1.01,2.0,0.06,0.02,RH_TERRA);bx(x,3.68,z,2.2,0.1,2.2,CREAM);
  for(const dx of [-0.5,0.5]){bx(x+dx,3.15,z+1.005,0.5,0.62,0.02,[0.12,0.08,0.06]);bx(x+dx,3.5,z+1.006,0.36,0.14,0.02,[0.12,0.08,0.06]);}
  for(let k=0;k<5;k++)bx(x-0.9+k*0.45,2.75,z+1.12,0.03,0.4,0.03,[0.08,0.08,0.09]);bx(x,2.95,z+1.12,2.0,0.03,0.03,[0.08,0.08,0.09]);bx(x,2.56,z+1.12,2.1,0.04,0.28,CREAM);
  for(let i=0;i<5;i++)bx(x,3.8+i*0.16,z,2.3-i*0.48,0.16,2.3-i*0.48,i%2?[0.68,0.3,0.16]:[0.78,0.38,0.2]);bx(x,4.75,z,0.08,0.3,0.08,GOLD);bx(x,4.95,z,0.14,0.14,0.14,GOLD);
  bx(x,1.9,z+1.01,0.7,1.2,0.02,DW);bx(x,2.55,z+1.012,0.7,0.1,0.02,RH_TERRA);}
 /* the front loggia: arches on columns, terracotta pots; the front garden: palms and a hedge */
 for(let x=2.5;x<34;x+=3.1){bx(x,1.0,22.85,0.3,2.0,0.3,CREAM);bx(x,0.05,22.85,0.42,0.1,0.42,CREAM);}bx(17.5,2.05,22.85,31,0.14,0.34,CREAM);for(let x=4.05;x<33;x+=3.1)bx(x,1.85,22.85,2.6,0.12,0.3,CREAM);
 for(const x of [10.5,24.5]){I.r=0.7;I.box(TRS(x,0.25,21.6,0,0.6,0.5,0.6),RH_TERRA);I.r=1;I.box(TRS(x,0.75,21.6,0,0.8,0.6,0.8),RH_LEAF);I.r=0;}
 for(const [x,z,s,l] of [[4,24.2,1.05,0.15],[31,24.2,1.0,-0.15],[9.5,25.4,0.85,0.1],[26,25.4,0.85,-0.1]])mvPalm(B,x,z,s,l);
 for(const [x0,x1] of [[2,14],[22,34]]){I.r=1;for(let x=x0+0.5;x<x1;x+=1)I.box(TRS(x,0.35,26.0,0,1.1,0.7,0.7),[0.15,0.42,0.18]);I.r=0;}
 /* upgrades */
 if(f.koi){const K=hiKit(B,10.5,3.1,0,I);K.ov(0,0.03,0,3.0,1.6,0.04,[0.1,0.25,0.22]);for(let i=0;i<14;i++){const a=i*TAU/14;K.rb(Math.cos(a)*1.55,0.1,Math.sin(a)*0.82,0.42,0.2,0.3,[0.55,0.52,0.48],0.9);}
  for(const [dx,dz] of [[-0.6,0.2],[0.5,-0.3],[0.9,0.35]]){K.cy(dx,0.06,dz,0.3,0.01,[0.25,0.6,0.25],'y');K.ball(dx+0.05,0.09,dz,0.08,[1,0.85,0.9]);}}
 if(f.aviary){const K=hiKit(B,20.9,17.95,0,I);for(let i=0;i<12;i++){const a=i*TAU/12;K.sf([Math.cos(a)*0.85,0.05,Math.sin(a)*0.85],[Math.cos(a)*0.85,1.6,Math.sin(a)*0.85],0.025,0.025,RH_WH);K.sf([Math.cos(a)*0.85,1.6,Math.sin(a)*0.85],[0,2.25,0],0.025,0.025,RH_WH);}
  K.ring(0,0.05,0,0.85,0.05,0.05,RH_WH,16);K.ring(0,1.6,0,0.85,0.04,0.04,RH_WH,16);K.ring(0,0.8,0,0.85,0.03,0.03,RH_WH,16);K.ball(0,2.3,0,0.12,GOLD);K.sf([-0.6,1.1,0],[0.6,1.1,0],0.03,0.03,DW);}
 if(f.grotto){for(let i=0;i<9;i++){const x=21.8+i*0.68,h=0.5+((i*7)%4)*0.18;I.r=0.9;I.box(TRS(x,1.1+h/2,1.75,i*0.7,0.8,h,0.6),[0.5,0.47,0.42]);}I.r=1;for(const x of [21.6,27.6])I.box(TRS(x,1.9,1.8,0,0.9,0.5,0.6),[0.2,0.5,0.22]);I.r=0;}
 if(f.cinema){bx(12.0,1.75,1.62,4.4,2.4,0.06,[0.15,0.15,0.17]);for(const x of [9.75,14.25])bx(x,1.0,1.7,0.1,2.0,0.1,[0.15,0.15,0.17]);
  for(const x of [12.2,13.4])mvLounger(B,x,4.6,Math.PI,[0.15,0.15,0.2]);bx(14.8,0.6,4.8,0.3,1.2,0.3,[0.2,0.2,0.22]);bx(14.8,1.25,4.8,0.4,0.3,0.5,[0.25,0.25,0.28]);}}};

/* ---- the moving bits, every frame ---- */
function rhDyn(D,g,f){const t=g.rhome,T=g.T,bx=rhBx(D);
 if(t===4){/* the living room fan */const a=T*5;bx(14.5,2.1,13.8,0.06,0.3,0.06,[0.4,0.3,0.2]);for(let i=0;i<4;i++)D.box(A.mul(A.mul(A.T(14.5,1.95,13.8),A.RY(a+i*Math.PI/2)),TRS(0.45,0,0,0,0.8,0.02,0.16)),[0.55,0.38,0.22]);
  if(f.lechon){const k=0.8+0.2*Math.sin(T*9);bx(22.6,0.69,2.6,1.0,0.02,0.5,[1.2*k,0.4*k,0.1*k],true);}}
 if(t===5){/* lanterns on the decks flicker; the jet ski bobs alongside, its rope to the rail */
  for(const [x,z] of [[11.8,5.8],[29.2,5.8],[11.8,13.2],[29.2,13.2]]){const k=0.85+0.15*Math.sin(T*7+x);bx(x,1.5,z,0.14,0.2,0.14,[1.1*k,0.75*k,0.35*k],true);bx(x,1.65,z,0.04,0.12,0.04,[0.2,0.2,0.22]);}
  if(f.jetski){const y=0.05+Math.sin(T*1.6)*0.04,r=Math.sin(T*1.1)*0.05,m0=A.mul(A.mul(A.T(14,y,2.5),A.RY(0.08)),A.RZ(r)),P=(px,py,pz,sx,sy,sz,c,em)=>D.box(A.mul(m0,TRS(px,py,pz,0,sx,sy,sz)),c,!!em);
   P(0,0.18,0,2.0,0.3,0.75,RH_WH);P(0.85,0.2,0,0.5,0.24,0.5,RH_PINK);P(-0.1,0.4,0,0.9,0.16,0.4,RH_PINK);P(0.4,0.58,0,0.12,0.3,0.1,[0.15,0.15,0.17]);P(0.42,0.75,0,0.08,0.06,0.6,[0.15,0.15,0.17]);P(-0.95,0.16,0,0.12,0.2,0.6,RH_TEAL);
   D.box(TRS(13.8,0.4,3.9,0,0.02,0.02,1.9),[0.9,0.85,0.7]);}
  if(f.tiki)for(const x of [6.1,9.1]){const k=0.8+0.2*Math.sin(T*11+x);bx(x,2.02+0.04*Math.sin(T*13+x),7.05,0.14,0.22,0.14,[1.3*k,0.6*k,0.15*k],true);}
  if(g.rh.cast>0){const u=1-g.rh.cast/2.2;bx(30.3,0.05,14.9+u*1.0,0.18,0.02,0.18,[0.85,0.95,1],true);}
  for(let i=0;i<8;i++){const x=((i*5.3+T*0.4)%35)+1,s=0.5+0.5*Math.sin(T*2+i);bx(x,0.025,1.5+(i%3)*0.9,0.6,0.004,0.04,[0.6*s,0.8*s,1.0*s],true);}}
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
