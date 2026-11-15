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
const CAMPAIGN_LEN=14;
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
 /* the bedroom corner is the top of the back stairwell: its shaft and divider, with the beds and lamp moved along the wall */
 for(let z=1;z<=3;z++){set(1,z,'#');set(2,z,'#');set(3,z,',');}set(5,1,'W');set(6,1,'W');set(5,2,'W');set(6,2,'W');set(7,1,'L');set(22,3,'_');set(25,6,'X');set(18,2,'_');set(16,5,'u');
 MISSIONS.c2.stages=['lobby','stair','pent'];MISSIONS.c2.start='lobby';MISSIONS.c2.was='legacy';
 MISSIONS.c2.stageDefs={
  lobby:{id:'lobby',kind:'grid',rev:2,def:{name:'CORAL TOWER LOBBY',front:1,wall:42,floor:41,legend:{'.':{f:41},'e':{f:41},'n':{f:41}},map:["####################################", "#KK.....#p.L....eee.....L.p#.....#n#", "#.....T.#...rrr....rrr.....#.6...#.#", "#...h...#.....*.....*.s....#.....#.#", "#.......#...KKKKKK.........#...k...#", "#.......#................4.#......p#", "#..T....D..g...............D.......#", "#.1.....#.....b*.....u*....#..g....#", "#L......#pS..............Sp#......L#", "################..##################", "=================P==================", "=================C==================", "====================================", "====================================", "===================================="]},
   stairs:[{id:'elev',to:'pent',at:[18.5,2.5],r:1.2,arrive:'elev',oneWay:true},{id:'up',to:'stair',at:[35.5,2.5],r:0.9,arrive:'bottom',oneWay:true}]},
  stair:{id:'stair',kind:'grid',rev:3,def:{name:'STAIRWELL AND SERVICE LEVEL',noCar:true,wall:42,floor:41,legend:{'.':{f:41},'n':{f:41}},map:["##########################", "#n#.....L#.KK..........###", "#.#..5...#...s...T.....###", "#.#..g...D..........b..###", "#........#...............#", "#...SSS..#...............#", "#........D......k........#", "#........#..2........u...#", "#.PC....p#..............L#", "##########################"]},
   arrivals:{bottom:{at:[23.5,4.5]}},stairs:[{id:'up',to:'pent',at:[2.5,2.5],r:0.9,arrive:'stairs',oneWay:true}]},
  pent:{id:'pent',kind:'grid',rev:3,def:{name:L.name,noCar:true,wall:L.wall,sofa:L.sofa,map:rows},
   arrivals:{elev:{at:[19.5,2.5]},stairs:{at:[4.5,4.5]}}}
 };
}
/* c10 Kade Tower (Act 3 finale) has the Coral Tower shape: the site, then the hoist (key from the foreman) or the steel stairs, then the top
   floor with Kade. The top stage keeps the id 'pent' so the tower helpers and the elevator/stairs challenges are shared with c2; the top
   is LEVELS[10] with its own boss, and it has no stairs out, so it is the stage the floor is finished from. */
if(typeof LEVELS!=='undefined'&&LEVELS[10]){
 const K=LEVELS[10];
 MISSIONS.c10.stages=['site','stair','pent'];MISSIONS.c10.start='site';
 MISSIONS.c10.stageDefs={
  site:{id:'site',kind:'grid',rev:2,def:{name:'KADE TOWER: SITE GATE',front:1,hardhat:true,wall:6,legend:{'e':{f:1},'n':{f:1}},map:["####################################", "#.......#.......eee........#.....#n#", "#.KK..4.#.b..............b.#.....#.#", "#.......#..FF.s.......FF...#..x..#.#", "#....T..#..........x.......#.......#", "#...h...#6...Z.......Z.....#..s....#", "#.......D...s.F.........F..D..g....#", "#.b...K.#.F....u....F..g...#....b..#", "#.......#.........2........#.5.....#", "###..###########..##################", "============P=======================", "=======================C============", "====================================", "====================================", "===================================="]},
   stairs:[{id:'elev',to:'pent',at:[18.5,2.5],r:1.2,arrive:'elev',oneWay:true},{id:'up',to:'stair',at:[35.5,2.5],r:0.9,arrive:'bottom',oneWay:true}]},
  stair:{id:'stair',kind:'grid',rev:3,def:{name:'KADE TOWER: STEEL STAIRS',noCar:true,hardhat:true,wall:6,legend:{'n':{f:1}},map:["##########################", "#n#...KK.#..KK.........###", "#.#..4...#....2..Z.....###", "#.#..s...D.............###", "#....b...#.....g.x.......#", "#..FFF...#...............#", "#........D........b......#", "#....x...#..s........u...#", "#.PC.....#...............#", "##########################"]},
   arrivals:{bottom:{at:[23.5,4.5]}},stairs:[{id:'up',to:'pent',at:[2.5,2.5],r:0.9,arrive:'stairs',oneWay:true}]},
  pent:{id:'pent',kind:'grid',rev:3,def:{name:K.name,noCar:true,hardhat:true,wall:K.wall,sofa:K.sofa,boss:K.boss,map:K.map},
   arrivals:{elev:{at:[18.5,2.5]},stairs:{at:[4.5,4.5]}}}
 };
}
/* Act 4. c11 Vale Trust Garage: the street ramp (P1), down the ramp to the parking deck (P2), down again to the vault loading dock, where
   three gold vans leave one at a time (index.html act4 helpers). The dock is LEVELS[11]; it has no stairs out, so the floor finishes there,
   out by the freight lift. c13 Opa-locka Hangar 7: the apron, the hangar where Vale walks to his jet (the boarding stairs open once he is
   aboard), then the jet out on the runway, which is LEVELS[13] with Vale as the boss and your car parked on the tarmac. */
if(typeof LEVELS!=='undefined'&&LEVELS[13]){
 const D=LEVELS[11],J=LEVELS[13],GL={'.':{f:30},'n':{f:30},'e':{f:30},'c':{f:30,furn:21},'v':{f:30,furn:22}};
 MISSIONS.c11.stages=['p1','p2','dock'];MISSIONS.c11.start='p1';
 MISSIONS.c11.stageDefs={
  p1:{id:'p1',kind:'grid',rev:2,def:{name:'VALE TRUST GARAGE: STREET LEVEL',front:1,wall:34,floor:30,legend:GL,map:["####################################", "#K....p.#.......................#.n#", "#.T..g..#..cv..cv..cv..cv.......#..#", "#.......#..................b....#..#", "#..h....D.....g...........s........#", "#.......#..cv..cv..cv..cv..........#", "#.p..4..#....................u.....#", "#..ZZ...#..b.......Z.........Z.....#", "###..########..##############..#####", "====P===============================", "================C===================", "====================================", "====================================", "===================================="]},
   stairs:[{id:'ramp',to:'p2',at:[35,2.5],r:0.9,arrive:'ramp',oneWay:true}]},
  p2:{id:'p2',kind:'grid',rev:2,def:{name:'VALE TRUST GARAGE: P2',noCar:true,wall:34,floor:30,legend:GL,map:["####################################", "#n.#....................s.......####", "#..#..cv..cv..cv..cv..cv..cv....####", "#..#.........g..................####", "#..........ZZ.........b............#", "#.....cv..cv..cv..cv..cv..cv.......#", "#..........................u.......#", "#..b........h.......Z.......g......#", "#.....cv..cv..cv..cv..cv..cv.......#", "#.PC.......2................s......#", "####################################"]},
   arrivals:{ramp:{at:[32,4.5]}},stairs:[{id:'ramp',to:'dock',at:[3,2.5],r:0.9,arrive:'ramp',oneWay:true}]},
  dock:{id:'dock',kind:'grid',rev:2,def:{name:D.name,noCar:true,exit:'Take the freight lift up',wall:D.wall,floor:D.floor,sofa:D.sofa,legend:D.legend,map:D.map},
   arrivals:{ramp:{at:[6,4.5]}}}
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
