'use strict';
// Shared mission table and world flags. DOM/GL-free: must load in Node vm.
/* ================= MISSIONS (contract MISSIONS v1, owner W14) =================
   Campaign missions wrap LEVELS by index: cN = {idx:N, kind:'campaign', stages, start}. idx 0..CAMPAIGN_LEN-1 is the key for
   every index-keyed save/story structure (JOBS.best/top, stash, CHALLENGES, PAR, LEVEL_TRACKS, payout flags, the ending), so
   campaign ids and indexes never move. Unmigrated missions have one stage, 'legacy' = LEVELS[idx].
   run.mission is a MISSIONS id and run.stage one of its stages (shared with W6's run v1); run.var is the variant chosen at entry.
   Non-campaign missions (kind 'bonus'|'story'|'side'; ids never cN) have no index: {kind, name, base:<LEVELS idx the 'legacy'
   stage borrows>, stages, start, unlock:<cond>, rewards:[{flag}], rev}. Their records live in nb86jobs.m[id]={done, best:{'<rev>.<var>':{g,t,s,c,ch,d}}};
   they never touch index-keyed saves, story flags, McWey's cut or the campaign's next job.
   Conditions: {all:[c]}|{any:[c]}|{not:c}|{done:missionId}|{flag:wflag}|{has:collectId}; evaluated against ctx {done(id),flag(f),has(id)}.
   variants: {id:{when:<cond>, spawn?:[x,z] player start cell on the legacy map, clear?}}; the first match wins, else 'base'.
   briefFlags: wflags a mission's McWey brief sets; cleared when that brief starts so the latest choice wins.
   clear: {boss:'required'|'optional'} (default required): whether the floor clears with the boss still standing. */
const CAMPAIGN_LEN=17;
const MISSIONS={
 c0:{idx:0,kind:'campaign',stages:['legacy'],start:'legacy'},
 c1:{idx:1,kind:'campaign',stages:['legacy'],start:'legacy',briefFlags:['flamingo_back'],
  variants:{back:{when:{flag:'flamingo_back'},spawn:[21,15]}}}, // Tony leaves the delivery door open: start at the east entrance
 c2:{idx:2,kind:'campaign',stages:['legacy'],start:'legacy'},
 c3:{idx:3,kind:'campaign',stages:['legacy'],start:'legacy'},
 c4:{idx:4,kind:'campaign',stages:['legacy'],start:'legacy'},
 c5:{idx:5,kind:'campaign',stages:['legacy'],start:'legacy'},
 c6:{idx:6,kind:'campaign',stages:['legacy'],start:'legacy',briefFlags:['singer_paid']}, // read by brief7; no map change until W2's studio plan
 c7:{idx:7,kind:'campaign',stages:['legacy'],start:'legacy'},
 c8:{idx:8,kind:'campaign',stages:['legacy'],start:'legacy'},
 c9:{idx:9,kind:'campaign',stages:['legacy'],start:'legacy'},
 c10:{idx:10,kind:'campaign',stages:['legacy'],start:'legacy'},
 c11:{idx:11,kind:'campaign',stages:['legacy'],start:'legacy'},
 c12:{idx:12,kind:'campaign',stages:['legacy'],start:'legacy'},
 c13:{idx:13,kind:'campaign',stages:['legacy'],start:'legacy'},
 c14:{idx:14,kind:'campaign',stages:['legacy'],start:'legacy'},
 c15:{idx:15,kind:'campaign',stages:['legacy'],start:'legacy'},
 c16:{idx:16,kind:'campaign',stages:['legacy'],start:'legacy'},
};
/* c2 is a building: the lobby, then the elevator (keycard from the security office guard) or the stairwell and service level,
   then the penthouse (LEVELS[2] with the street walled off), out by the elevator. All three are grid stages on base index 2, so
   every index-keyed save, score and story structure stays on floor 2. Every stair is one way up; the penthouse has none, which
   makes it the stage the floor is finished from (stageFinal in index.html). noCar: the exit is the elevator, not your car. */
if(typeof LEVELS!=='undefined'){
 const L=LEVELS[2],rows=L.map.slice(),s=rows.findIndex(r=>r[0]==='='),set=(x,z,c)=>{rows[z]=rows[z].slice(0,x)+c+rows[z].slice(x+1);};
 for(let z=s;z<rows.length;z++)rows[z]='#'.repeat(rows[z].length);
 set(11,s-2,'P');set(22,s-1,'C');
 /* arrivals line up with where you left: the stairs come up in the bedroom's top-left corner, the lift opens in the middle of the top wall */
 set(4,2,',');set(9,4,'s');
 /* the bedroom's top-left corner is the open stairwell you come up (stairs.js), with the beds and lamp moved along the wall */
 for(let z=1;z<=3;z++)for(let x=1;x<=3;x++)set(x,z,',');set(6,1,'W');set(7,1,'W');set(6,2,'W');set(7,2,'W');set(8,1,'L');set(22,3,'_');set(25,6,'X');set(18,2,'_');set(16,5,'u');
 MISSIONS.c2.stages=['lobby','stair','pent'];MISSIONS.c2.start='lobby';MISSIONS.c2.was='legacy';
 MISSIONS.c2.stageDefs={
  lobby:{id:'lobby',kind:'grid',rev:3,def:{name:'CORAL TOWER LOBBY',front:1,wall:42,floor:41,legend:{'.':{f:41},'e':{f:41},'n':{f:41}},map:["####################################", "#KK.....#p.L....eee.....L.p#.......#", "#.....T.#...rrr....rrr.....#.6.....#", "#...h...#.....*.....*.s....#.......#", "#.......#...KKKKKK.........#...k...#", "#.......#................4.#..p.....#", "#..T....D..g...............D.......#", "#.1.....#.....b*.....u*....#..g....#", "#L......#pS..............Sp#......L#", "################..##################", "=================P==================", "=================C==================", "====================================", "====================================", "===================================="]},
   stairs:[{id:'elev',to:'pent',at:[18.5,2.5],r:1.2,arrive:'elev',oneWay:true},{id:'up',to:'stair',at:[32.5,3],r:0.9,arrive:'bottom',oneWay:true}]},
  stair:{id:'stair',kind:'grid',rev:4,def:{name:'STAIRWELL AND SERVICE LEVEL',noCar:true,wall:42,floor:41,legend:{'.':{f:41},'n':{f:41}},map:["##########################", "#.......L#.KK............#", "#....5...#...s...T.......#", "#....g...D..........b....#", "#........#...............#", "#...SSS..#...............#", "#........D......k........#", "#........#..2........u...#", "#.PC....p#..............L#", "##########################"]},
   arrivals:{bottom:{at:[21.5,3]}},stairs:[{id:'up',to:'pent',at:[5.5,3],r:0.9,arrive:'stairs',oneWay:true}]},
  pent:{id:'pent',kind:'grid',rev:4,def:{name:L.name,noCar:true,wall:L.wall,sofa:L.sofa,map:rows},
   arrivals:{elev:{at:[19.5,2.5]},stairs:{at:[6.5,3]}}}
 };
}
/* c10 Kade Tower (Act 3 finale) has the Coral Tower shape: the site, then the hoist (key from the foreman) or the steel stairs, then the top
   floor with Kade. The top stage keeps the id 'pent' so the tower helpers and the elevator/stairs challenges are shared with c2; the top
   is LEVELS[10] with its own boss, and it has no stairs out, so it is the stage the floor is finished from. */
if(typeof LEVELS!=='undefined'&&LEVELS[10]){
 const K=LEVELS[10];
 MISSIONS.c10.stages=['site','stair','pent'];MISSIONS.c10.start='site';
 MISSIONS.c10.stageDefs={
  site:{id:'site',kind:'grid',rev:3,def:{name:'KADE TOWER: SITE GATE',front:1,hardhat:true,wall:6,legend:{'e':{f:1},'n':{f:1}},map:["####################################", "#.......#.......eee........#.......#", "#.KK..4.#.b..............b.#.......#", "#.......#..FF.s.......FF...#..x....#", "#....T..#..........x.......#.......#", "#...h...#6...Z.......Z.....#..s....#", "#.......D...s.F.........F..D..g....#", "#.b...K.#.F....u....F..g...#....b..#", "#.......#.........2........#.5.....#", "###..###########..##################", "============P=======================", "=======================C============", "====================================", "====================================", "===================================="]},
   stairs:[{id:'elev',to:'pent',at:[18.5,2.5],r:1.2,arrive:'elev',oneWay:true},{id:'up',to:'stair',at:[32.5,3],r:0.9,arrive:'bottom',oneWay:true}]},
  stair:{id:'stair',kind:'grid',rev:4,def:{name:'KADE TOWER: STEEL STAIRS',noCar:true,hardhat:true,wall:6,legend:{'n':{f:1}},map:["##########################", "#.....KK.#..KK...........#", "#....4...#....2..Z.......#", "#....s...D...............#", "#....b...#.....g.x.......#", "#..FFF...#...............#", "#........D........b......#", "#....x...#..s........u...#", "#.PC.....#...............#", "##########################"]},
   arrivals:{bottom:{at:[21.5,3]}},stairs:[{id:'up',to:'pent',at:[5.5,3],r:0.9,arrive:'stairs',oneWay:true}]},
  pent:{id:'pent',kind:'grid',rev:4,def:{name:K.name,noCar:true,hardhat:true,wall:K.wall,sofa:K.sofa,boss:K.boss,map:K.map},
   arrivals:{elev:{at:[18.5,2.5]},stairs:{at:[6.5,3]}}}
 };
}
/* Act 4. c11 Vale Trust Garage: street level (P1), down the stairs to the parking deck (P2), down again to the vault loading dock, where
   three gold vans leave one at a time (index.html act4 helpers). The dock is LEVELS[11]; it has no stairs out, so the floor finishes there,
   out by the freight lift. c13 Opa-locka Hangar 7: the apron, the hangar where Vale walks to his jet (the boarding stairs open once he is
   aboard), then the jet out on the runway, which is LEVELS[13] with Vale as the boss and your car parked on the tarmac. */
if(typeof LEVELS!=='undefined'&&LEVELS[13]){
 const D=LEVELS[11],J=LEVELS[13],GL={'.':{f:30},'n':{f:30},'e':{f:30},'c':{f:30,furn:21},'v':{f:30,furn:22}};
 MISSIONS.c11.stages=['p1','p2','dock'];MISSIONS.c11.start='p1';
 MISSIONS.c11.stageDefs={
  p1:{id:'p1',kind:'grid',rev:3,def:{name:'VALE TRUST GARAGE: STREET LEVEL',front:1,wall:34,floor:30,legend:GL,map:["####################################", "#K....p.#..........................#", "#.T..g..#..cv..cv..cv..cv..........#", "#.......#..................b.......#", "#..h....D.....g...........s........#", "#.......#..cv..cv..cv..cv..........#", "#.p..4..#....................u.....#", "#..ZZ...#..b.......Z.........Z.....#", "###..########..##############..#####", "====P===============================", "================C===================", "====================================", "====================================", "===================================="]},
   stairs:[{id:'down',to:'p2',at:[32.5,3],r:0.9,arrive:'stairs',oneWay:true}]},
  p2:{id:'p2',kind:'grid',rev:3,def:{name:'VALE TRUST GARAGE: P2',noCar:true,wall:34,floor:30,legend:GL,map:["####################################", "#.......................s..........#", "#.....cv..cv..cv..cv..cv..cv.......#", "#............g.....................#", "#..........ZZ.........b............#", "#.....cv..cv..cv..cv..cv..cv.......#", "#..........................u.......#", "#..b........h.......Z.......g......#", "#.....cv..cv..cv..cv..cv..cv.......#", "#.PC.......2................s......#", "####################################"]},
   arrivals:{stairs:{at:[31.5,3]}},stairs:[{id:'down',to:'dock',at:[5.5,3],r:0.9,arrive:'stairs',oneWay:true}]},
  dock:{id:'dock',kind:'grid',rev:3,def:{name:D.name,noCar:true,exit:'Take the freight lift up',wall:D.wall,floor:D.floor,sofa:D.sofa,legend:D.legend,map:D.map},
   arrivals:{stairs:{at:[6.5,3]}}}
 };
 const HL={'.':{f:37},'n':{f:37},'t':{f:37},'j':{w:37,h:0.02,top:37}};
 MISSIONS.c13.stages=['apron','hangar','jet'];MISSIONS.c13.start='apron';
 MISSIONS.c13.stageDefs={
  apron:{id:'apron',kind:'grid',rev:1,def:{name:'OPA-LOCKA: THE APRON',front:1,wall:34,floor:7,legend:{'.':{f:7},'n':{f:7}},map:["########################################", "#.........#..........................n.#", "#..K..h...#....ZZ.......ZZ.......b.....#", "#.........D............................#", "#..T......#.....u.........g............#", "#.........#..ZZ.....s........ZZ........#", "#####D#####............................#", "#..........................m.......Z...#", "#..g......ZZ........b..................#", "####..##########..........#########..###", "====P===================================", "======================C=================", "========================================", "========================================", "========================================"]},
   stairs:[{id:'door',to:'hangar',at:[39.5,2.5],r:1.0,arrive:'side',oneWay:true}]},
  hangar:{id:'hangar',kind:'grid',rev:2,def:{name:'HANGAR 7',noCar:true,wall:46,floor:37,legend:HL,map:["##########################################", "#.......#................................#", "#.K..T..#.........jjjjjjjjjjjjjjjj.......#", "#.......D.........jjjjjjjjjjjjjjjjj......#", "#..t....#.........jjjjjjjjjjjjjjjjjj.....#", "#.......#.........jjjjjjjjjjjjjjjjj......#", "####D####.........jjjjjjjjjjj.jjjj.......#", "#........................................#", "#..g.......s..........b......n..u........#", "#.......ZZ................ZZ.............#", "#..PC.......h.......x............g.......#", "##########################################"]},
   arrivals:{side:{at:[41.5,2.5]}},stairs:[{id:'board',to:'jet',at:[30.5,9.5],r:1.1,arrive:'door',oneWay:true}]},
  jet:{id:'jet',kind:'grid',rev:1,def:{name:J.name,wall:J.wall,floor:J.floor,sofa:J.sofa,legend:J.legend,boss:J.boss,map:J.map},
   arrivals:{door:{at:[23.5,8.5]}}}
 };
}
/* Act 5 "Old Gold" (act5.js). Every floor is a building in three stages; the last stage is LEVELS[idx] and has no stairs out.
   c14 The Grand Biscayne: the lobby, down the stairs to the laundry (the bell captain's ledger opens the service lift), up to the roof
   with the sheets on the lines and the Cardinal's man Nunzio. c15 La Habana: the pier, up the gangway to the cargo deck, down to the
   casino, where the forty bars sit in the cage (crack it, or open the sea cock and sink her). c16 McWey Tower: the lobby, the lift up to
   the 52nd floor where you hold the office with McWey, then the stairs up to the roof and the Cardinal's helicopter. */
if(typeof LEVELS!=='undefined'&&LEVELS[16]){
 const R=LEVELS[14],C=LEVELS[15],T=LEVELS[16];
 MISSIONS.c14.stages=['lobby','laundry','roof'];MISSIONS.c14.start='lobby';
 MISSIONS.c14.stageDefs={
  lobby:{id:'lobby',kind:'grid',rev:1,def:{name:'GRAND BISCAYNE: THE LOBBY',front:1,wall:42,floor:41,sofa:0x6a2a9a,legend:{'.':{f:41},'n':{f:41}},map:["########################################", "#.....#....p......p......p.....#.......#", "#.R.R.#........................#.......#", "#.....D...S.S.....T.....S.S....D.......#", "#..h..#..........g.............#.......#", "#.....#.....p...........p......#.......#", "#.T...#........u...............#..s....#", "###D###.................b......##D######", "#..........KKKKKKK.....................#", "#...g......K.....K.......m......p......#", "#..........................h...........#", "####..##########........##########..####", "====P===================================", "======================C=================", "========================================", "========================================", "========================================"]},
   stairs:[{id:'down',to:'laundry',at:[36.5,3],r:0.9,arrive:'stairs',oneWay:true}]},
  laundry:{id:'laundry',kind:'grid',rev:1,def:{name:'GRAND BISCAYNE: THE LAUNDRY',noCar:true,wall:34,floor:44,legend:{'.':{f:44},'N':{f:44},'n':{f:44}},map:["####################################", "#.......#..GGGG..GGGG.....#........#", "#.......#.................#........#", "#..g....D......s..........D........#", "#.......#..ZZ......ZZ.....#........#", "#..Z....#.................#........#", "###D#####..GGGG..GGGG..u..#####D####", "#..................................#", "#..R..N...h........m.......x.......#", "#..RR..............................#", "#.PC...Z.........ZZ.........g......#", "####################################"]},
   arrivals:{stairs:{at:[31.5,3]}},stairs:[{id:'lift',to:'roof',at:[4.5,2.5],r:1.0,arrive:'lift',oneWay:true}]},
  roof:{id:'roof',kind:'grid',rev:1,def:{name:R.name,noCar:true,exit:'Take the service lift down',wall:R.wall,floor:R.floor,sofa:R.sofa,legend:R.legend,map:R.map},
   arrivals:{lift:{at:[4.5,2.5]}}}
 };
 MISSIONS.c15.stages=['pier','deck','casino'];MISSIONS.c15.start='pier';
 MISSIONS.c15.stageDefs={
  pier:{id:'pier',kind:'grid',rev:1,def:{name:'GOVERNMENT CUT: THE PIER',front:1,wall:34,floor:30,legend:{'.':{f:30},'n':{f:30},'a':{w:39,h:0.02,top:39,water:1}},map:["########################################", "#aaaaaaaaaaaaaaaaa...aaaaaaaaaaaaaaaaaa#", "#aaaaaaaaaaaaaaaaa...aaaaaaaaaaaaaaaaaa#", "#.....ZZ..........s..........ZZ...g....#", "#..u........ZZ...............ZZ........#", "#.....ZZZ.........g....ZZ.......u......#", "#..........b...................ZZ......#", "#####D######......K.K.......#####D######", "#..T...g..#.................#....h.....#", "#.........D.........m.......D..........#", "#..T..p...#.................#....p..T..#", "####..##########........##########..####", "====P===================================", "======================C=================", "========================================", "========================================", "========================================"]},
   stairs:[{id:'gang',to:'deck',at:[20.5,2.5],r:1.0,arrive:'gang',oneWay:true}]},
  deck:{id:'deck',kind:'grid',rev:1,def:{name:'LA HABANA: THE CARGO DECK',noCar:true,wall:34,floor:53,legend:{'.':{f:53},'n':{f:53}},map:["####################################", "#.......ZZ.....ZZ......ZZ..........#", "#..g....ZZ.....ZZ..u...ZZ..........#", "#..................................#", "#..ZZZ.....m......ZZZ.....b........#", "#..ZZZ............ZZZ..............#", "#..........g.................ZZ....#", "#....s.........ZZ.........h..ZZ....#", "#..............ZZ..................#", "#..ZZ......u.............ZZ.....g..#", "#.PC...............................#", "####################################"]},
   arrivals:{gang:{at:[18.5,10.5]}},stairs:[{id:'down',to:'casino',at:[32.5,3],r:0.9,arrive:'stairs',oneWay:true}]},
  casino:{id:'casino',kind:'grid',rev:1,def:{name:C.name,noCar:true,exit:'Take the launch back to shore',wall:C.wall,floor:C.floor,sofa:C.sofa,legend:C.legend,map:C.map},
   arrivals:{stairs:{at:[31.5,3]}}}
 };
 MISSIONS.c16.stages=['lobby','office','roof'];MISSIONS.c16.start='lobby';
 MISSIONS.c16.stageDefs={
  lobby:{id:'lobby',kind:'grid',rev:1,def:{name:'McWEY TOWER: THE LOBBY',front:1,wall:40,floor:43,sofa:0xe8dcc0,legend:{'.':{f:43},'n':{f:43},'a':{w:39,h:0.02,top:39,water:1}},map:["########################################", "#.......#..........................#...#", "#..R.R..#...p..................p...#...#", "#.......D..........................D...#", "#..g....#....S..aa....aa..S........#...#", "#.......#.......aa....aa.......g...#...#", "#..T....#..g...................u...#...#", "####D####.........m................#####", "#.................KKKK............s....#", "#...p.....S.S...h......S.S......p......#", "#......x...............................#", "####..##########........##########..####", "====P===================================", "======================C=================", "========================================", "========================================", "========================================"]},
   stairs:[{id:'lift',to:'office',at:[21.5,2.5],r:1.0,arrive:'lift',oneWay:true}]},
  office:{id:'office',kind:'grid',rev:1,def:{name:'McWEY TOWER: THE 52ND FLOOR',noCar:true,wall:40,floor:43,sofa:0xe8dcc0,legend:{'.':{f:43},'n':{f:43},'e':{f:43},'a':{w:39,h:0.02,top:39,water:1}},map:["####################################", "#aaaa..............................#", "#aaaa.....RR.............RR........#", "#aaaa.....g........................#", "#...........KKKKKKK................#", "#..G..........................G....#", "#..........E..E....E..E......g.....#", "#.....p...................p........#", "#####D########....########D#########", "#..................................#", "#..e...........e.............e.....#", "#.PC...............................#", "####################################"]},
   arrivals:{lift:{at:[18.5,2.5]}},stairs:[{id:'up',to:'roof',at:[32.5,3],r:0.9,arrive:'stairs',oneWay:true}]},
  roof:{id:'roof',kind:'grid',rev:1,def:{name:T.name,noCar:true,exit:'Take the stairs down',wall:T.wall,floor:T.floor,sofa:T.sofa,legend:T.legend,boss:T.boss,map:T.map},
   arrivals:{stairs:{at:[31.5,3]}}}
 };
}
/* bonus jobs (idea 6): odd jobs on existing maps with a twist that index.html applies after the map loads (applyTwist). They have no
   index, so they never touch campaign saves or story; their rewards set flags on the character. */
Object.assign(MISSIONS,{
 b_pesos:{kind:'bonus',name:'PESOS IS MISSING',base:0,stages:['legacy'],start:'legacy',unlock:{done:'c1'},rewards:[{flag:'pesos_saved'}],rev:1,twist:'pesos',
  brief:'A new crew moved into the Sunset and somebody grabbed a dog off the street. Brown, red collar, answers to Pesos. Go get him.'},
 b_kid:{kind:'side',name:"MRS. ORTEGA'S GRANDSON",base:1,stages:['legacy'],start:'legacy',unlock:{done:'c2'},rewards:[{flag:'kid_saved'}],rev:1,twist:'kid',
  brief:'They are holding Mrs. Ortega\'s grandson at the Flamingo. You have one minute before they decide he is not worth the trouble.'},
 b_ghost:{kind:'bonus',name:"NINE'S WAREHOUSE",base:5,stages:['legacy'],start:'legacy',unlock:{done:'c5'},rewards:[{flag:'nine_ghost'}],rev:1,twist:'ghost',
  brief:'Nine wants the mall cleared without the alarm going off. First guard who sees you calls everyone in. Stay unseen and the bonus is yours.'},
 b_quiet:{kind:'bonus',name:"McWEY'S QUIET ONE",base:6,stages:['legacy'],start:'legacy',unlock:{flag:'rep_quiet'},rewards:[{flag:'quiet_pro'}],rev:1,twist:'ghost',
  brief:'Word is you work quiet. A label boss wants the studio emptied and nobody calling the cops. First guard who sees you raises the alarm.'},
 b_arena:{kind:'bonus',name:'THE SUNSET ARENA',base:0,stages:['legacy'],start:'legacy',unlock:{done:'c3'},rewards:[{flag:'arena_run'}],rev:1,twist:'arena',
  brief:'Word got out you cleaned out the Sunset. Now every crew in Miami wants a shot at you there. They come in waves. Nine is selling between rounds. Drive off whenever you have had enough.'},
 b_rush:{kind:'bonus',name:'NIGHT SHIFT',base:4,stages:['legacy'],start:'legacy',unlock:{done:'c10'},rewards:[{flag:'night_shift'}],rev:1,twist:'rush',
  brief:'Somebody paid to bring them all back for one night at the Starlight. The Shark, Lex, Kade. One after another. Bring the kit you trust.'},
 b_lex:{kind:'story',name:"LEX'S FAVOUR",base:9,stages:['legacy'],start:'legacy',unlock:{all:[{flag:'lex_spared'},{done:'c8'}]},rewards:[{flag:'lex_favour'}],rev:1,twist:'lex',
  brief:'Lex is calling in the favour: another of Kade\'s parties. He is on the radio and he can see every guard in the building.'}});
/* EMPIRE (empire.js): once the loan is square and Lex's Royal Flush is gone, the crews move in on Miami. Everything you take, you take in
   person: drive there, clear the crew out of the building and put down whoever runs it for them.
   EMP_ACT = the campaign floor that has to be done before a crew turns up: the three street crews come at once, the leftovers of the
   acts' villains (Lex's smugglers, Kade's wrecking crew, Vale's private security) only after you have finished that act.
   FRONTS are the big places you already know (missions e_<k>, played on that floor's own map); RACKETS are smaller businesses
   (missions r_<k>), each played on its own building (EMP_SITE_MAP). Either way the reward flag
   own_<k> makes it yours and it pays after every finished job (empire.js empPay). need = the campaign floor that has to be done first. */
const EMP_ACT={snakes:7,rayos:7,ivory:7,silks:7,wreckers:10,vault:13};
const EMP_FRONTS=[
 {k:'motel',type:'compound',dist:'sobe',base:0,name:'MOTEL SUNSET',area:'SOUTH BEACH',gang:'snakes',pay:1200,need:0,at:[0.825,0.665]},
 {k:'flamingo',type:'club',dist:'sobe',base:1,name:'CLUB FLAMINGO',area:'SOUTH BEACH',gang:'rayos',pay:2000,need:1,at:[0.83,0.555]},
 {k:'marina',type:'warehouse',dist:'dtwn',base:3,name:'VICE MARINA',area:'BAYSIDE',gang:'silks',pay:3500,need:3,at:[0.585,0.445]},
 {k:'arcade',type:'club',dist:'lhav',base:4,name:'STARLIGHT ARCADE',area:'LITTLE HAVANA',gang:'snakes',pay:1500,need:4,at:[0.34,0.52]},
 {k:'mall',type:'shop',dist:'grove',base:5,name:'OCEAN VIEW MALL',area:'COCONUT GROVE',gang:'ivory',pay:3000,need:5,at:[0.43,0.81]},
 {k:'studio',type:'office',dist:'wyn',base:6,name:'THE RECORDING STUDIO',area:'WYNWOOD',gang:'ivory',pay:2500,need:6,at:[0.47,0.28]},
 {k:'site',type:'warehouse',dist:'midb',base:8,name:'OCEAN DRIVE SITE',area:'MID-BEACH',gang:'wreckers',pay:2500,need:8,at:[0.84,0.37]},
 {k:'coral',type:'office',dist:'brk',base:12,name:'THE CORAL ROOM',area:'BRICKELL',gang:'vault',pay:4500,need:12,at:[0.535,0.6]}];
/* hard 1-3 = how many of the crew hang around and how tough their collector is */
const EMP_RACKETS=[
 {k:'nails',dist:'sobe',name:'NEON NAILS',type:'shop',gang:'snakes',pay:400,hard:1,at:[0.845,0.71]},
 {k:'cabana',dist:'sobe',name:'CABANA RENTALS',type:'shop',gang:'rayos',pay:500,hard:1,at:[0.855,0.6]},
 {k:'bowl',dist:'midb',name:'SURFSIDE BOWL-O-RAMA',type:'club',gang:'snakes',pay:600,hard:2,at:[0.83,0.24]},
 {k:'pawn',dist:'midb',name:'COLLINS AVE PAWN',type:'shop',gang:'rayos',pay:700,hard:2,at:[0.855,0.45]},
 {k:'taxi',dist:'dtwn',name:'BAYFRONT TAXI CO.',type:'garage',gang:'rayos',pay:800,hard:2,at:[0.555,0.4]},
 {k:'news',dist:'dtwn',name:'BISCAYNE NEWSSTAND',type:'shop',gang:'ivory',pay:300,hard:1,at:[0.53,0.35]},
 {k:'boatyard',dist:'dtwn',name:'CORAL KEY BOATYARD',type:'warehouse',gang:'silks',pay:900,hard:2,at:[0.575,0.485]},
 {k:'wash',dist:'brk',name:'BRICKELL CAR WASH',type:'garage',gang:'ivory',pay:600,hard:1,at:[0.49,0.655]},
 {k:'cash',dist:'brk',name:'BRICKELL CHECK CASHING',type:'office',gang:'ivory',pay:1000,hard:3,at:[0.56,0.54]},
 {k:'armored',dist:'brk',name:'BRICKELL ARMORED CARS',type:'garage',gang:'vault',pay:1200,hard:3,at:[0.505,0.585]},
 {k:'savings',dist:'brk',name:'PALM SAVINGS & LOAN',type:'office',gang:'vault',pay:1400,hard:3,at:[0.515,0.7]},
 {k:'cigar',dist:'lhav',name:'CALLE OCHO CIGARS',type:'shop',gang:'rayos',pay:500,hard:1,at:[0.27,0.48]},
 {k:'bodega',dist:'lhav',name:'DOMINO PARK BODEGA',type:'shop',gang:'rayos',pay:400,hard:1,at:[0.2,0.55]},
 {k:'cafe',dist:'lhav',name:'LA PALMA CAFECITO',type:'club',gang:'rayos',pay:300,hard:1,at:[0.31,0.63]},
 {k:'garment',dist:'wyn',name:'NORTHSIDE GARMENT CO.',type:'warehouse',gang:'ivory',pay:700,hard:2,at:[0.39,0.26]},
 {k:'junk',dist:'wyn',name:'WYNWOOD JUNKYARD',type:'garage',gang:'snakes',pay:500,hard:1,at:[0.53,0.25]},
 {k:'demo',dist:'wyn',name:'OVERTOWN DEMO YARD',type:'garage',gang:'wreckers',pay:800,hard:2,at:[0.44,0.37]},
 {k:'cement',dist:'wyn',name:'MIDTOWN CEMENT CO.',type:'warehouse',gang:'wreckers',pay:900,hard:2,at:[0.5,0.19]},
 {k:'chandler',dist:'grove',name:'GROVE YACHT CHANDLERY',type:'shop',gang:'ivory',pay:900,hard:2,at:[0.47,0.87]},
 {k:'charter',dist:'grove',name:'DINNER KEY CHARTERS',type:'shop',gang:'silks',pay:700,hard:2,at:[0.5,0.78]},
 {k:'disco',dist:'grove',name:'MAYFAIR DISCO',type:'club',gang:'ivory',pay:1100,hard:3,at:[0.37,0.76]}];
/* every racket and act-crew HQ is its own building (EMP_SITE_MAP, a front-street map like the c2 lobby: the car waits on the street
   below). EMP_VENUE = the five kinds of business (their label, base floor and wall dressing); base = the LEVELS entry the map borrows
   its music and difficulty from (0/1: no floor-specific setup runs there). EMP_SITE = that one place's walls, floor and vehicles.
   Glyphs as in levels.js, plus the props of EMP_PROP: each is a solid cell (furn 60) that empire.js draws (empProp):
   a/e bowling lane and pins, j salon station, l cabana, n surfboards, o+q a boat, c+v a vehicle (the site's veh), t glass case,
   y fridge, z crates, I teller window, N vault door, Y sewing table, ! clothes rack, $ cigar table, & tyres, + rubble, ? silo,
   < car-wash brush, > fuel pump, ^ DJ booth, ; news rack, ( crushed cars, ) sacks, { espresso bar, } domino table, [ humidor,
   ] pawned guitars and TVs; '-' is water. */
const EMP_PROP='aejlnoqcvtyzINY!$&+?<>^;(){}[]/|`';
const EMP_SITE_MAP={
 nails:["##############################", "#j.j.j.j.j.#..K..#...W..U....#", "#..........#.....#...........#", "#.....g....D..h..D.....b.....#", "#j.j.j.j.j.#..Q..#############", "#..........#######...S.S.S...#", "#....s...............T...T...#", "#KKKK.........g..........p..L#", "#p......E.E.E.E...........u..#", "############..################", "============P=================", "============C=================", "==============================", "==============================", "=============================="],
 cabana:["##############################", "#l..l..l..l..l..l.#KK....Q...#", "#.................#..h.......#", "#..g......b.......D......u...#", "#l..l..l..l..l..l.#..........#", "#.................######..####", "#n.n.n....s..................#", "#..........H.....H.....g..H..#", "#n.n.n.......zz.........zz...#", "###############..#############", "===============P==============", "===============C==============", "==============================", "==============================", "=============================="],
 bowl:["##############################", "#e.e.e.e.e.e.e.e.#BBBBB.....*#", "#a.a.a.a.a.a.a.a.#......T..T.#", "#a.a.a.a.a.a.a.a.#..g........#", "#a.a.a.a.a.a.a.a.D.....u..T..#", "#a.a.a.a.a.a.a.a.#...........#", "#................###..########", "#..b..SS..s..SS......A.A.A.A.#", "#.....................b......#", "#K.K......g..............h..p#", "#############..###############", "=============P================", "=============C================", "==============================", "==============================", "=============================="],
 pawn:["##############################", "#]]]]]]]]]..#RRRR..#Q.Q..G.G.#", "#...........#......#.........#", "#.ttt..ttt..D..s...D....h....#", "#......g....#......#.........#", "#.ttt..ttt..########...KK....#", "#.................b..........#", "#KKKKKK....u.........ttt..g..#", "#p.....E..................L.p#", "########..####################", "========P=====================", "========C=====================", "==============================", "==============================", "=============================="],
 taxi:["##############################", "#cv..cv..cv..cv....#KK..Q....#", "#..................#...h.....#", "#......g......>.>..D.........#", "#cv..cv..cv........#..E.T.E..#", "#..........s.......###########", "#.....................&&.....#", "#cv..cv.....u....b.......ZZ..#", "#.........g............M.....#", "######......##################", "========P=====================", "========C=====================", "==============================", "==============================", "=============================="],
 news:["##############################", "######;;;;;;;;;;;;;;;;;;######", "######..................######", "######.;;..g...;;..b.;;.######", "######..................######", "######KKKKK...s....zz...######", "######..............#.########", "######.;;.;;...h....#..zz.G.##", "######..............#.....u.##", "#########..###################", "=========P====================", "=========C====================", "==============================", "==============================", "=============================="],
 boatyard:["##############################", "#----------------------------#", "#----------------------------#", "#............................#", "#..oq...g...oq....s...ZZ.#####", "#........................D.K.#", "#..oq.......oq...b.......#.h.#", "#.....u..........zz......#.Q.#", "#&&.........g.........M..#####", "#######.....##################", "=========P====================", "=========C====================", "==============================", "==============================", "=============================="],
 wash:["##############################", "#KK.Q.#......................#", "#..h..#.<.<.<.<.<.<.<.<......#", "#.....D....cv......cv....g...#", "#..E..#.<.<.<.<.<.<.<.<......#", "#######......................#", "#........s.........b.........#", "#.cv...cv...cv........ZZ..>..#", "#..............u.....g.......#", "################.....#########", "==================P===========", "==================C===========", "==============================", "==============================", "=============================="],
 cash:["##############################", "#QQ.N.QQ#....K...K...K...#G.G#", "#.......#................#...#", "#...m...D...h........s...D.u.#", "#.......#................#...#", "####..###IIII.IIII.IIII.######", "#............................#", "#.E.E.E........g.......S.S...#", "#p.........b................p#", "#############..###############", "=============P================", "=============C================", "==============================", "==============================", "=============================="],
 armored:["##############################", "#cv...cv...cv...cv..#Q.N.Q.Q.#", "#...................#........#", "#.....m.......s.....D...h....#", "#cv...cv...cv.......#........#", "#...................####..####", "#..g......ZZ.....u.......ZZ..#", "#.....>...ZZ.........b.......#", "#M..........g.............L..#", "####.......###################", "=======P======================", "=======C======================", "==============================", "==============================", "=============================="],
 savings:["##############################", "#.E.T.E.#QQQQQQ.N.QQQQQQ#G.K.#", "#.......#...............#....#", "#...g...D.......m.......D..h.#", "#.......#...............#....#", "####..####IIIII..IIIII########", "#............................#", "#.S.S...p.......u......p.S.S.#", "#...........g.......b........#", "#L..........................L#", "##############..##############", "==============P===============", "==============C===============", "==============================", "==============================", "=============================="],
 cigar:["##############################", "#[[[[[[..#$.$.$.$.$.#.zz..zz.#", "#........#..........#........#", "#..g.....D....b.....D...h....#", "#SS.T.SS.#$.$.$.$.$.#..zz....#", "#........####..######..#######", "#.................s..........#", "#KKKKK..t.t.t.........[[[[...#", "#p...........g..............p#", "############..################", "============P=================", "============C=================", "==============================", "==============================", "=============================="],
 bodega:["##############################", "#yyyyyyyy....#}..}..}.#..zz..#", "#............#........#......#", "#.RRRR.RRRR..D...g....D..k...#", "#............#}..}....#..zz..#", "#.RRRR.RRRR..##########..#####", "#......b.....................#", "#.zz.zz....KKKK....s....zz...#", "#p.............g............p#", "###########..#################", "===========P==================", "===========C==================", "==============================", "==============================", "=============================="],
 cafe:["##############################", "#{{{{{{{{{...#W..U#.zz..y.y..#", "#............#....#..........#", "#..g.........D..h.D....b.....#", "#.T.E.T.E.T..######......zz..#", "#..........................###", "#.}..}..}......s.............#", "#..........T.E.T.E....p......#", "#p.......g..................L#", "#######..#####################", "=======P======================", "=======C======================", "==============================", "==============================", "=============================="],
 garment:["##############################", "#Y.Y.Y.Y.Y.Y.Y.Y.#!!!!!!#KK..#", "#................#......#..h.#", "#Y.Y.Y.Y.Y.Y.Y.Y.D...b..D....#", "#.....g..........#......#.Q..#", "#Y.Y.Y.Y.Y.Y.Y.Y.#!!!!!!######", "#................#...........#", "#..s.......u.........zz..zz..#", "#zz.zz.................g....L#", "######......##################", "========P=====================", "========C=====================", "==============================", "==============================", "=============================="],
 junk:["##############################", "#((.((.((..((.((.#KK.....#&&&#", "#................#..h....#...#", "#((.((.....((.((.D.......#.b.#", "#.......g........#..Q....#...#", "#((.((.((....s...#####..##...#", "#............................#", "#&&...((.((......u.....((.((.#", "#&&..........g...............#", "########.....#################", "==========P===================", "==========C===================", "==============================", "==============================", "=============================="],
 demo:["##############################", "#+++...++....+++.....#KK.Q...#", "#+.........cv........#....h..#", "#....s...............D.......#", "#...++......b....++..#########", "#..+++...........+++.........#", "#.........cv.............ZZ..#", "#++....g.........u.......ZZ..#", "#+++..........M.......g......#", "###########.....##############", "=============P================", "=============C================", "==============================", "==============================", "=============================="],
 cement:["##############################", "#??.??.??..#)).)).)).))..#KK.#", "#??.??.??..#.............#.h.#", "#..........D....g........D...#", "#...s......#)).)).)).))..#.Q.#", "#.cv.......#.............#####", "#..........####...####.......#", "#.cv...b..........u......))..#", "#.................g......))..#", "#####......###################", "========P=====================", "========C=====================", "==============================", "==============================", "=============================="],
 chandler:["##############################", "#RRRRR.RRRRR.#..oq..oq..#Q.G.#", "#............#..........#....#", "#.t.t..g.t.t.D....s.....D.h..#", "#............#..oq......#....#", "#RRRRR.RRRRR.#####..##########", "#............................#", "#KKKK....b.........n.n.n..u..#", "#p..........................p#", "##########..##################", "==========P===================", "==========C===================", "==============================", "==============================", "=============================="],
 charter:["##############################", "#----------------------------#", "#--------....-------....-----#", "#--------.oq.-------.oq.-----#", "#............................#", "#..g....b......s.......u.....#", "#####..#########..############", "#KK..E...#.T.E.T...#.n.n.zz..#", "#...h....D.........D.....g...#", "#Q.......#.....p...#.......L.#", "##############..##############", "==============P===============", "==============C===============", "==============================", "==============================", "=============================="],
 disco:["##############################", "#BBBBBBBB..#^^^^#..SS.T.SS...#", "#..........#....#............#", "#...g......,,,,,,,,..#...m...#", "#T.E...,,,,,,,,,,,,,.D..SS.T.#", "#......,,,,,@,,,,,,,.#########", "#T.E...,,,,,,,,,,,,,.....*...#", "#.....s.,,,,,,,,,,.....u.....#", "#*.............b........g...p#", "#############..###############", "=============P================", "=============C================", "==============================", "==============================", "=============================="],
 hq_silks:["####################################", "#----------------------------------#", "#---oq----oq---.....----oq----oq---#", "#---....--....-.....-....---....---#", "#..................................#", "#..h.....s.........m.......u.......#", "#####..########......########..#####", "#KK...Q.#.zz..........zz...#.QQQQ..#", "#.......D.......BBBB.......D...g...#", "#..s....#..g..........b....#.......#", "#.......#.....oq....oq.....#..S.S..#", "###############.....################", "=================P==================", "=================C==================", "====================================", "====================================", "===================================="],
 hq_wreckers:["####################################", "#+++....??.??......cv.....++...+++.#", "#+......??.??..............+.....+.#", "#....s.............d..........u....#", "#..cv......######..######......cv..#", "#..........#KK.Q.....T.E#..........#", "#++...g....#....m.......#....b..++.#", "#+++.......D............D.......+++#", "#......))..######..######..))......#", "#..b...))........h.........))...g..#", "#M................................M#", "###############.....################", "=================P==================", "=================C==================", "====================================", "====================================", "===================================="],
 hq_vault:["####################################", "#QQQQ.N.QQQQ#......#QQQQ.N.QQQQ#G.G#", "#...........#..m...#...........#...#", "#.....h.....D......D.....s.....D.u.#", "#...........#......#...........#...#", "####..#######IIIIII#######..########", "#..................................#", "#.S.S..p....g...........g...p..S.S.#", "#..............IIIIII..............#", "#L....b....................b......L#", "#..........u.............m.........#", "###############.....################", "=================P==================", "=================C==================", "====================================", "====================================", "===================================="]};
/* the fronts and the street crews' headquarters: bigger places, each its own building too */
Object.assign(EMP_SITE_MAP,{
 motel:["####################################", "#W.U.#W.U.#W.U.#W.U.#W.U.#W.U.#KK.Q#", "#..g.#....#..s.#....#..u.#....#..h.#", "##D####D####D####D####D####D####D###", "#..................................#", "#.<.<...p...------------...p..cv...#", "#..s....H...------------...H.......#", "#..b........------------......cv...#", "#.....k.H..................H..m....#", "#.cv..cv......g......d.....cv..cv..#", "#y.......zz..........y........zz...#", "################....################", "=================P==================", "=================C==================", "====================================", "====================================", "===================================="],
 flamingo:["####################################", "#BBBBBB.|..^^^^..|.#SS.T.SS#..K.K..#", "#....g.............#...h...#...m...#", "#.?...,,,,,,,,..?..D.......D.......#", "#.....,,,,,,,,.....#SS.T.SS#..Q.G..#", "#..E..,,,u,,,,..E..####..#####..####", "#.T...,,,,,,,,...T.................#", "#..E..,,,,s,,,..E.....S.S..b..S.S..#", "#.?............?......T.T.....T.T..#", "#p....d...g.........k.........u...p#", "################....################", "=================P==================", "=================C==================", "====================================", "====================================", "===================================="],
 marina:["####################################", "#----------------------------------#", "#--oq--.--oq--.--oq--.--oq--.--oq--#", "#------.------.------.------.------#", "#------.------.------.------.------#", "#..................................#", "#.g....s......>.>.....u.......b....#", "######..########......########..####", "#KK..Q.#.zz..zz......zz..zz.#.oq...#", "#..h...D....d..........m....D...g..#", "#.E.T..#.zz....ZZ..ZZ....zz.#.&&.M.#", "#......#......k......s......#......#", "################....################", "=================P==================", "=================C==================", "====================================", "====================================", "===================================="],
 arcade:["####################################", "#????????.????????.???????#KK...Q..#", "#.........k...............#...h....#", "#..g..........s...........D........#", "#.??.??.??.??.??.??.??.??.#..G.G...#", "#.??.??.??.??.??.??.??.??.####..####", "#.................u................#", "#.??.??.??.??.....tttt..II...e.e.e.#", "#.??.??.??.??..b..........k..a.a.a.#", "#p......m.......d.....g......a.a.a.#", "################....################", "=================P==================", "=================C==================", "====================================", "====================================", "===================================="],
 mall:["####################################", "#!!!!.tt#RR.RR.t#]]]]..t#KK....Q...#", "#.......#.......#.......#....h.....#", "#..g..!!#.s...RR#....u..D..........#", "###..######..######..####.G..G.....#", "#.......................############", "#.p...S.S....----....S.S...p.......#", "#......b.....----.........m........#", "#.p...S.S............S.S...p..T.E.T#", "#..............d.......k......E.T.E#", "#{{{{...g...................s......#", "################....################", "=================P==================", "=================C==================", "====================================", "====================================", "===================================="],
 studio:["####################################", "#|.|.&.....|.|#///////.#[.KK...Q..]#", "#......s......#........#...........#", "#...g....s....D...u....D.....h.....#", "#.S.S.........#.E.E.E..#..G.G......#", "#.........m...###..#########..######", "#.............#....................#", "####..#########..S.S.S....b.....p..#", "#yy.....#.zz..#....T.T.T...........#", "#..k....D.....D...........d........#", "#.T.E...#.zz..#.|.|.....g.......|.|#", "################....################", "=================P==================", "=================C==================", "====================================", "====================================", "===================================="],
 site:["####################################", "#```..```.....??.??.....+++...```..#", "#.............??.??..........g.....#", "#..g....cv.............cv......``..#", "#.+.........########..########.....#", "#++....s....#.zz....m.....)).#..d..#", "#...........D....T.E.KK......D.....#", "#..cv.......#..h.......Q..``.#..+..#", "#...........########..########.++..#", "#.))..u............................#", "#.))......b...``.....k....cv....s..#", "#M.....&&.........................M#", "################....################", "=================P==================", "=================C==================", "====================================", "====================================", "===================================="],
 coral:["####################################", "#BBBBBBBB...&......S.S.S....#K.yy.K#", "#....g.............T.T.T....#......#", "#..........--------.........D..k...#", "#.T.E.T....--------....T.E..#K.KK.K#", "#..s.......--------......u..#......#", "#.T.E.T....--------....T.E..###..###", "#..................................#", "#.S.S...T.E.T...b....T.E.T....Q.G..#", "#.T.T..........m.........h.....S...#", "#p[[..d.....g..........s.....d..{{p#", "################....################", "=================P==================", "=================C==================", "====================================", "====================================", "===================================="],
 hq_snakes:["########################################", "#<.<.<.<.<.<...#BBBBBB....|.#KK....Q...#", "#..............#............#.....h....#", "#...g......s...D..u.........D..........#", "#&&......zz....#.T.E..T.E...#..G.G..S..#", "#&&............#............#####..#####", "#.cv....m......###....######...........#", "#......................................#", "#.<.<.<....b......SS.T.SS......k...zz..#", "#.............d..............s.........#", "#.cv..cv....&&.....u.......<.<.<.....g.#", "#M....................m...............M#", "##################....##################", "===================P====================", "===================C====================", "========================================", "========================================", "========================================"],
 hq_rayos:["########################################", "#--------------#W.U..?..#[[..$.$..KK..Q#", "#--------------#........#..............#", "#..H..H..H..H..D....g...D.......h......#", "#.....s........#.S.S....#..G.G....[[...#", "#?............?####..########....#######", "#.............m........................#", "#.S.S.S....BBBBBB.....?....T.E.T....p..#", "#..T.....u.........m........k.......S..#", "#.S.S.S........OOOO.......T.E.T.....S..#", "#.......b......OOOO...d..........s...g.#", "#p....................u...............p#", "##################....##################", "===================P====================", "===================C====================", "========================================", "========================================", "========================================"],
 hq_ivory:["########################################", "#!!!!!!#..&..||..^^^^..||.....#KK....Q.#", "#......#......................#...h....#", "#..g...D.....,,,,,,,,,,,,.....D........#", "#!!!!!!#..m..,,,,,,,,,,,,..s..#.G..G...#", "########.....,,,,,u,,,,,,.....###..#####", "#............,,,,,,,,,,,,..............#", "#.T.E.T..........................T.E.T.#", "#..b......T.E.T....k.....T.E.T.....d...#", "#.T.E.T..........................T.E.T.#", "#......s...BBBBBB......BBBBBB....g.....#", "#p..........m.............u...........p#", "##################....##################", "===================P====================", "===================C====================", "========================================", "========================================", "========================================"]});
const EMP_VENUE={
 shop:{base:0,n:'SHOP',sofa:0x2a9ea3},garage:{base:0,n:'GARAGE',sofa:0x5a5a62},club:{base:1,n:'CLUB',sofa:0xe0459a},
 warehouse:{base:0,n:'WAREHOUSE',sofa:0x6a5a3a},office:{base:0,n:'OFFICE',sofa:0x34343e},compound:{base:0,n:'COMPOUND',sofa:0x2a2030}};
const EMP_SITE={nails:{wall:12,f:2},cabana:{wall:5,f:38},bowl:{wall:12,f:1},pawn:{wall:5,f:1},taxi:{wall:34,f:7,veh:'taxi'},news:{wall:5,f:37},
 boatyard:{wall:6,f:30},wash:{wall:34,f:30,veh:'wash'},cash:{wall:42,f:41},armored:{wall:34,f:30,veh:'truck'},savings:{wall:42,f:41},
 cigar:{wall:5,f:4},bodega:{wall:5,f:1},cafe:{wall:12,f:14},garment:{wall:6,f:30},junk:{wall:6,f:7},demo:{wall:6,f:27,veh:'dozer'},
 cement:{wall:34,f:30,veh:'mixer'},chandler:{wall:5,f:41},charter:{wall:6,f:37},disco:{wall:12,f:1},
 hq_silks:{wall:6,f:37},hq_wreckers:{wall:6,f:27,veh:'dozer'},hq_vault:{wall:42,f:41},
 /* 'as' gives a glyph another prop at this one place: bikes, arcade cabinets, flamingos, gold statues, a grand piano */
 motel:{wall:12,f:37,as:{'<':'bike'}},flamingo:{wall:12,f:1,as:{'?':'flam'}},marina:{wall:6,f:4},arcade:{wall:34,f:1,as:{'?':'cab'}},
 mall:{wall:42,f:41},studio:{wall:5,f:4,as:{'&':'piano'}},site:{wall:6,f:27,veh:'dozer'},coral:{wall:42,f:4,as:{'&':'piano'}},
 hq_snakes:{wall:34,f:30,as:{'<':'bike'}},hq_rayos:{wall:42,f:41,as:{'?':'gold'}},hq_ivory:{wall:42,f:41,as:{'&':'piano'}}};
/* the building of one place. Kade's crew always wears hard hats */
function empSiteDef(key,type,name,gang){const v=EMP_VENUE[type],s=EMP_SITE[key],legend={'.':{f:s.f},'-':{w:39,h:0.02,top:39,water:1}};for(const ch of EMP_PROP)legend[ch]={f:s.f,furn:60};
 return {name,front:1,wall:s.wall,floor:s.f,sofa:v.sofa,legend,map:EMP_SITE_MAP[key],venue:type,site:key,veh:s.veh||null,hardhat:gang==='wreckers'};}
const EMP_BRIEF={snakes:'The Coral Snakes rolled in on their bikes the week Lex sank. Leather, chains, no manners. Their lieutenant runs the place from the back. Take it off them.',
 rayos:'Los Rayos took over the moment the Royal Flush went down: white suits, gold teeth, a lot of product. Put their lieutenant down and the place is yours.',
 ivory:'The Ivory Hand came down from New York to buy Miami cheap. Pinstripes and old money. Their lieutenant keeps the books here. Close them.',
 silks:'What is left of Lex Sterling\'s smugglers calls itself the Silk Syndicate now. Same boats, same silk shirts, new captain. Take the docks back off them.',
 wreckers:'Kade is gone but his wrecking crew kept the hard hats and the payroll. They run the site like it is still his. Show them the job is over.',
 vault:'Vale Trust Security still guards Conrad Vale\'s money, and now they keep it. Private army, good rifles, no boss to answer to. Close the account.'};
const EMP_RBRIEF={snakes:'The Coral Snakes collect from this place every Friday. Drive over, clear them out and put down their collector, and the owner pays you instead.',
 rayos:'Los Rayos have a collector sitting in here with a few of their boys. Go in, put them on the floor, and the owner pays you from now on.',
 ivory:'The Ivory Hand runs this place through a bookkeeper and some muscle. Walk in, close their books, and it is yours.',
 silks:'The Silk Syndicate moves its goods through here. Their collector is inside with a crew. Clear the building and the business is yours.',
 wreckers:'Kade\'s old wrecking crew uses this yard. Hard hats, crowbars, guns. Clear them out and the yard pays you.',
 vault:'Vale Trust Security guards this place like a bank vault. Get past the uniforms and their captain, and the money comes to you.'};
/* each crew's headquarters: once it holds no fronts, you can hit its HQ and kill its boss; the reward flag wiped_<gang> ends the crew
   (its rackets go independent and it never raids you again). The street crews sit on a floor you know (base, its own boss swapped for
   the crew's); the act crews dig in at a compound of their own. */
const EMP_HQ=[
 {g:'snakes',base:1,name:'THE SNAKEPIT',area:'HIALEAH',at:[0.13,0.3],need:11,venue:1},
 {g:'rayos',base:1,name:'VEGA\'S PENTHOUSE',area:'STAR ISLAND',at:[0.72,0.475],need:2,venue:1},
 {g:'ivory',base:1,name:'THE IVORY BALLROOM',area:'KEY BISCAYNE',at:[0.715,0.93],need:9,venue:1},
 {g:'silks',base:0,name:'THE STERLING BOATHOUSE',area:'FISHER ISLAND',at:[0.806,0.79],need:7,venue:1},
 {g:'wreckers',base:0,name:'KADE\'S SITE OFFICE',area:'OVERTOWN',at:[0.47,0.445],need:10,venue:1},
 {g:'vault',base:0,name:'THE VALE TRUST VAULT',area:'DODGE ISLAND',at:[0.67,0.56],need:13,venue:1}];
const EMP_HQ_BRIEF={snakes:'The Coral Snakes are down to their clubhouse. Mad Dog McCoy is holed up in there with everyone he has left. End them.',
 rayos:'Los Rayos have nothing left but Don Vega\'s penthouse. He is up there with his gold rifle and his last soldiers. Go up and finish it.',
 ivory:'The Ivory Hand is throwing one last ball to raise money for a war. Vincent Orsini is the host. Make it his farewell party.',
 silks:'Captain Nico Sterling, Lex\'s cousin, runs the Syndicate from the old family boathouse. He has every gun they own in there. Sink them for good.',
 wreckers:'Bruno Kade, Dorian\'s brother, keeps the wrecking crew together from the site office. Knock it down with him in it.',
 vault:'Marcus Vale, Conrad\'s son, sits in the trust\'s vault with what is left of the money and the men. Make the withdrawal.'};
const empNeed=(n,g)=>({all:[{done:'c7'},{done:'c'+Math.max(n,EMP_ACT[g]||7)}]});
for(const h of EMP_HQ)MISSIONS['hq_'+h.g]=Object.assign({kind:'empire',name:'HIT '+h.name,base:h.base,stages:['legacy'],start:'legacy',
 unlock:empNeed(h.need,h.g),rewards:[{flag:'wiped_'+h.g}],rev:1,twist:'turf',hq:h.g,brief:EMP_HQ_BRIEF[h.g]},
 h.venue?{venue:empSiteDef('hq_'+h.g,'compound',h.name,h.g)}:{});
for(const f of EMP_FRONTS)MISSIONS['e_'+f.k]={kind:'empire',name:'TAKE OVER '+f.name,base:1,venue:empSiteDef(f.k,f.type,f.name,f.gang),stages:['legacy'],start:'legacy',
 unlock:empNeed(f.need,f.gang),rewards:[{flag:'own_'+f.k}],rev:1,twist:'turf',front:f.k,brief:EMP_BRIEF[f.gang]};
for(const r of EMP_RACKETS)MISSIONS['r_'+r.k]={kind:'empire',name:'MUSCLE IN ON '+r.name,base:EMP_VENUE[r.type].base,stages:['legacy'],start:'legacy',
 unlock:empNeed(0,r.gang),rewards:[{flag:'own_'+r.k}],rev:1,twist:'turf',front:r.k,venue:empSiteDef(r.k,r.type,r.name,r.gang),brief:EMP_RBRIEF[r.gang]};
/* LATE RENT. A home you have moved out of is rented out (mall.js tenRent). Now and then a tenant stops paying; the home phone and Sunshine
   Realty then offer t_<home>: go round and collect it. It is a fist fight: you leave the guns in the car (fists:true, index.html
   fistsOnly), the tenant and his friends are unarmed too ('i'), and the tenant is the floor's boss. Paying up (the whole debt) is the reward. */
const TEN_HOMES=['ROOM 14','THE STUDIO','THE PENTHOUSE','VILLA SOLANA','THE CASITA','THE LOW TIDE','THE FLAMINGO ARMS','CASA DEL SOL'];
const TEN_BOSS=[["EDDIE 'NO RENT' NUÑEZ",[0.78,0.56,0.4],[0.9,0.9,0.86]],["CHAD WEXLER",[0.95,0.8,0.68],[0.98,0.55,0.7]],["RICO VALDEZ",[0.72,0.5,0.36],[0.12,0.12,0.14]],
 ["THE DUKE OF STAR ISLAND",[0.94,0.78,0.64],[0.95,0.92,0.82]],["MANNY CASTILLO",[0.68,0.48,0.34],[0.96,0.96,0.94]],["SKIPPER DOYLE",[0.96,0.76,0.62],[0.2,0.32,0.6]],
 ["TONY FLAMINGO",[0.9,0.7,0.55],[1,0.45,0.65]],["DR. HAMMOND",[0.95,0.8,0.7],[0.86,0.82,0.7]]];
const TEN_MAP=["####################################","#W.W..S.S..#..T.T..#..W.W...S.S.p..#","#.........p#.......#..............p#","#....i.....#...i...#......X........#",
 "####D########D###########D##########","#..................................#","#.p...i..........i.............i.p.#","#..................................#","################....################",
 "=================P==================","=================C==================","===================================="];
for(let t=0;t<TEN_HOMES.length;t++){const [bn,skin,col]=TEN_BOSS[t];
 MISSIONS['t_'+t]={kind:'tenant',name:'COLLECT THE RENT · '+TEN_HOMES[t],base:0,stages:['legacy'],start:'legacy',unlock:{done:'c0'},rewards:[],rev:1,tenant:t,fists:true,
  venue:{name:TEN_HOMES[t]+' · LATE RENT',front:1,wall:12,sofa:0x2a9ea3,map:TEN_MAP,
   boss:{name:bn,weapon:null,hp:6,look:()=>({skin,jacket:col,shirt:[0.95,0.95,0.92],pants:[0.18,0.18,0.22],shoes:[0.1,0.1,0.1],hair:[0.12,0.09,0.07],hs:'slick',bw:1.1,bd:1.05,bh:1.0}),
    intro:'He has not paid in weeks and he brought friends. Fists only.',dead:'RENT DAY'}},
  brief:'The tenant at '+TEN_HOMES[t]+' stopped paying and stopped answering the door. Go round and collect, with your fists: guns stay in the car. He has a few friends over.'};}
/* the map a mission plays on when it is not its base floor's own (empire rackets and act-crew HQs) */
const missionMap=id=>missionKnown(id)&&MISSIONS[id].venue||undefined;
const ownKey=(o,k)=>typeof k==='string'&&Object.prototype.hasOwnProperty.call(o,k);
const missionId=i=>'c'+i;
const missionKnown=id=>ownKey(MISSIONS,id);
/* campaign index of a mission id, -1 for anything else (non-index missions, unknown ids) */
function missionIdx(id){const m=missionKnown(id)&&MISSIONS[id];return m&&m.kind==='campaign'&&Number.isInteger(m.idx)?m.idx:-1;}
const campaignIds=()=>Array.from({length:CAMPAIGN_LEN},(_,i)=>missionId(i));
/* the stage a mission begins at; null for unknown missions (a run naming one is dropped) */
const missionStart=id=>missionKnown(id)?MISSIONS[id].start:null;
const missionStageOK=(id,st)=>missionKnown(id)&&MISSIONS[id].stages.includes(st);
/* run-resume resolver for W6's normRun: null = unknown mission (drop the run); otherwise {stage, keep}.
   A stage the mission has resumes as-is. A mission that is still one 'legacy' stage resumes there with the stage kit kept,
   whatever stage id was stored: pre-MISSIONS runs saved free-form ids ('s0', 's1', ...) that all meant "this map".
   Only a stage a migrated mission no longer has restarts it from the beginning (keep:false = entry kit, no stow).
   A mission with was:'legacy' used to be one legacy map: a run saved there ('legacy', missing or a pre-MISSIONS 'sN') resumes at the
   start with its kit and stowed finds (keep), and moved:true tells normRun to drop the old map's checkpoint and flag a notice. */
const missionStage=(id,st)=>{if(!missionKnown(id))return null;const m=MISSIONS[id];
 if(missionStageOK(id,st))return {stage:st,keep:true};
 if(m.stages.length===1&&m.stages[0]==='legacy')return {stage:'legacy',keep:true};
 if(m.was==='legacy'&&(st==null||st==='legacy'||/^s\d+$/.test(st)))return {stage:m.start,keep:true,moved:true};
 return {stage:m.start,keep:false};};
const missionIsCampaign=id=>missionIdx(id)>=0;
/* the LEVELS index whose map a mission's 'legacy' stage plays on (-1 if none) */
function missionBase(id){if(!missionKnown(id))return -1;const m=MISSIONS[id];return m.kind==='campaign'?missionIdx(id):Number.isInteger(m.base)?m.base:-1;}
function missionName(id){if(!missionKnown(id))return '';const m=MISSIONS[id];return m.name||(typeof LEVELS!=='undefined'&&LEVELS[missionBase(id)]||{}).name||id;}
const missionRev=id=>missionKnown(id)&&Number.isInteger(MISSIONS[id].rev)?MISSIONS[id].rev:1;
const extraIds=()=>Object.keys(MISSIONS).filter(id=>!missionIsCampaign(id));
function condOK(c,ctx){if(c==null)return true;if(typeof c!=='object')return false;
 if(Array.isArray(c.all))return c.all.every(x=>condOK(x,ctx));if(Array.isArray(c.any))return c.any.some(x=>condOK(x,ctx));
 if('not' in c)return !condOK(c.not,ctx);if(typeof c.done==='string')return !!ctx.done(c.done);if(typeof c.flag==='string')return !!ctx.flag(c.flag);
 if(typeof c.has==='string')return !!ctx.has(c.has);return false;}
const missionUnlocked=(id,ctx)=>missionKnown(id)&&condOK(MISSIONS[id].unlock,ctx);
const missionVariantOK=(id,v)=>v==='base'||missionKnown(id)&&ownKey(MISSIONS[id].variants||{},v);
function missionVariant(id,ctx){const vs=missionKnown(id)&&MISSIONS[id].variants||{};for(const v of Object.keys(vs))if(condOK(vs[v].when,ctx))return v;return 'base';}
const missionVar=(id,v)=>v!=='base'&&missionVariantOK(id,v)?MISSIONS[id].variants[v]:{};
/* clear rules: the variant's override, then the mission's, then the default */
function missionClear(id,v){const m=missionKnown(id)?MISSIONS[id]:{};return Object.assign({boss:'required'},m.clear,missionVar(id,v).clear);}
const missionBriefFlags=id=>missionKnown(id)&&MISSIONS[id].briefFlags||[];
/* reset a brief's own choices on the character's wflags before the brief replays them; true if anything changed */
function missionBriefReset(id,wflags){let ch=false;for(const f of missionBriefFlags(id))if(wflags&&ownKey(wflags,f)){delete wflags[f];ch=true;}return ch;}
