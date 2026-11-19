'use strict';
/* ================= EMPIRE: TAKE OVER MIAMI =================
   A crime-empire mode that opens once McWey's loan is square (the Royal Flush, floor c7, is done). The car menu opens THE EMPIRE, a map
   of seven districts fought over by six crews: the three street crews that moved in when Lex sank (the Coral Snakes, Los Rayos, the
   Ivory Hand) and the leftovers of the acts' villains, who only turn up once you have finished that act (EMP_ACT in missions.js):
   Lex's smugglers (the Silk Syndicate), Kade's wrecking crew and Vale Trust Security.
   Nothing is taken from the map: every place is a job you drive to and clear in person.
   - RACKETS (EMP_RACKETS, missions r_<k>): small businesses in buildings of five kinds (shop, garage, club, warehouse, office;
     EMP_VENUE in missions.js). Clear the crew and their collector out and the owner pays you.
   - FRONTS (EMP_FRONTS, missions e_<k>): the big places you know, taken on that floor's map against the crew's lieutenant. Own one and buy
     GUARDS (raids fail more often) and EXPANSIONS (it pays more).
   - HQs (EMP_HQ, missions hq_<g>): once a crew holds no fronts, hit its headquarters and kill its boss. The crew is wiped out: its rackets
     go independent and it never raids you again.
   - HEAT and RAIDS: after every finished job each living crew may hit one of your places, likelier the hotter it is. Guards can stop a
     raid on a front; otherwise the place is UNDER ATTACK and pays nothing: drive there and defend it before your next job is done, or the
     crew takes it.
   - INCOME after every job: rackets, fronts (+50% per expansion), +25% for every district you own whole, +25% on everything once the
     whole city is yours and every crew is gone (KING OF MIAMI). RESPECT (rackets + 2 per front + 5 per crew wiped) gives you a title.
   Owning a place is the reward flag own_<k>, a wiped crew is wiped_<g> (both in wflags); the rest lives in p.emp. */
const EMP_GANGS={
 snakes:{name:'THE CORAL SNAKES',short:'CORAL SNAKES',col:'#ff3fa4',
  look:L=>{L.jacket=hex(0x15151a);L.shirt=hex(0xff3fa4);L.pants=hex(0x2a3a5a);L.shoes=hex(0x111114);},
  lt:{name:'"SPIKE" DELANEY',weapon:'shotgun',hp:8,intro:'The Coral Snakes lieutenant. Sawn-off and a bad temper. Keep moving.',dead:'SPIKE IS DOWN',
   look:()=>({skin:hex(0xd9a37c),jacket:hex(0x15151a),shirt:hex(0xff3fa4),pants:hex(0x2a3a5a),shoes:hex(0x111114),hair:hex(0x101010),hs:'mohawk',shades:true,chain:true,stubble:true,bw:1.25,bd:1.2,bh:1.04})},
  boss:{name:'"MAD DOG" McCOY',weapon:'spas12',hp:18,intro:'The Coral Snakes boss. Biggest man in Hialeah, auto shotgun. Never let him close.',dead:'THE SNAKES ARE FINISHED',
   look:()=>({skin:hex(0xe8b890),jacket:hex(0x101014),shirt:hex(0xff3fa4),pants:hex(0x1a2a44),shoes:hex(0x111114),hair:hex(0x6b4a2a),hs:'big',beard:hex(0x6b4a2a),shades:true,chain:true,bw:1.5,bd:1.4,bh:1.08,belly:true})}},
 rayos:{name:'LOS RAYOS',short:'LOS RAYOS',col:'#2de2e6',
  look:L=>{L.jacket=hex(0xf2efe6);L.shirt=hex(0x1fb5b8);L.pants=hex(0xf2efe6);L.shoes=hex(0xf2efe6);},
  lt:{name:'"EL CHACAL" MENDOZA',weapon:'mac10',hp:8,intro:'Los Rayos lieutenant. White suit, MAC-10, sprays the room. Use cover.',dead:'EL CHACAL IS DOWN',
   look:()=>({skin:hex(0xa8744f),jacket:hex(0xf2efe6),shirt:hex(0x1fb5b8),pants:hex(0xf2efe6),shoes:hex(0xf2efe6),hair:hex(0x101010),hs:'slick',stache:true,shades:true,chain:true,watch:true,bw:1.1,bd:1.05,bh:1.0})},
  boss:{name:'DON ALEJANDRO VEGA',weapon:'goldak',hp:18,intro:'The boss of Los Rayos. Gold suit, golden AK, nothing left to lose.',dead:'LOS RAYOS ARE FINISHED',
   look:()=>({skin:hex(0xa8744f),jacket:hex(0xe8c060),shirt:hex(0x101010),pants:hex(0xe8c060),shoes:hex(0xf2efe6),hair:hex(0x101010),hs:'slick',stache:true,shades:true,chain:true,watch:true,cigar:true,bw:1.2,bd:1.12,bh:1.0})}},
 ivory:{name:'THE IVORY HAND',short:'IVORY HAND',col:'#e8e4f0',
  look:L=>{L.jacket=hex(0x34343e);L.shirt=hex(0xf4f4f4);L.pants=hex(0x34343e);L.shoes=hex(0x1a1410);},
  lt:{name:'"LEFTY" CAPUTO',weapon:'m16',hp:8,intro:'The Ivory Hand lieutenant. New York money with an M16. Flank him.',dead:'LEFTY IS DOWN',
   look:()=>({skin:hex(0xf0c8a0),jacket:hex(0x34343e),shirt:hex(0xf4f4f4),pants:hex(0x34343e),shoes:hex(0x1a1410),hair:hex(0x8a8a8a),hs:'slick',cigar:true,watch:true,bw:1.3,bd:1.25,bh:1.0,belly:true})},
  boss:{name:'VINCENT "THE SAINT" ORSINI',weapon:'m16',hp:18,intro:'The Ivory Hand boss. White tuxedo, M16, bodyguards everywhere. Take the guards first.',dead:'THE IVORY HAND IS FINISHED',
   look:()=>({skin:hex(0xf0c8a0),jacket:hex(0xf4f4f4),shirt:hex(0x101010),pants:hex(0x101010),shoes:hex(0x101010),hair:hex(0xc8c0b0),hs:'slick',watch:true,bw:1.15,bd:1.1,bh:1.02})}},
 /* the acts' leftovers: Lex Sterling's smugglers (Act 2), Dorian Kade's wrecking crew (Act 3), Conrad Vale's private security (Act 4) */
 silks:{name:'THE SILK SYNDICATE',short:'SILK SYNDICATE',col:'#b78cff',act:2,
  look:L=>{L.jacket=hex(0x1c2440);L.shirt=hex(0x9b6cff);L.pants=hex(0xe8dcc0);L.shoes=hex(0x6a4a2a);},
  lt:{name:'"REEF" CALLOWAY',weapon:'smg',hp:8,intro:'Silk Syndicate lieutenant. Ran Lex\'s fastest boat. Fast on his feet too.',dead:'REEF IS DOWN',
   look:()=>({skin:hex(0xc89068),jacket:hex(0x1c2440),shirt:hex(0x9b6cff),pants:hex(0xe8dcc0),shoes:hex(0x6a4a2a),hair:hex(0xd8b060),hs:'pony',shades:true,chain:true,stubble:true,bw:1.1,bd:1.05,bh:1.02})},
  boss:{name:'CAPTAIN NICO STERLING',weapon:'mini14',hp:18,intro:'Lex\'s cousin, captain of the Silk Syndicate. Mini-14 and a grudge for the family.',dead:'THE SILK SYNDICATE IS SUNK',
   look:()=>({skin:hex(0xe0b088),jacket:hex(0xf2efe6),shirt:hex(0x9b6cff),pants:hex(0xf2efe6),shoes:hex(0x6a4a2a),hair:hex(0xd8b060),hs:'slick',shades:true,chain:true,watch:true,bw:1.15,bd:1.1,bh:1.03})}},
 wreckers:{name:'KADE\'S WRECKING CREW',short:'WRECKING CREW',col:'#ffb020',act:3,
  look:L=>{L.jacket=hex(0xff9a1a);L.shirt=hex(0x6a6a70);L.pants=hex(0x2a3a5a);L.shoes=hex(0x5a3a1a);},
  lt:{name:'"SLEDGE" KOWALSKI',weapon:'double',hp:8,intro:'The wrecking crew\'s foreman. Double barrel, arms like a crane. Stay out of reach.',dead:'SLEDGE IS DOWN',
   look:()=>({skin:hex(0xe8b890),jacket:hex(0xff9a1a),shirt:hex(0x6a6a70),pants:hex(0x2a3a5a),shoes:hex(0x5a3a1a),hair:hex(0x3a2a1a),hs:'big',beard:hex(0x3a2a1a),bw:1.45,bd:1.35,bh:1.06,belly:true})},
  boss:{name:'BRUNO KADE',weapon:'spas12',hp:18,intro:'Dorian Kade\'s brother. Keeps the crew on the payroll with an auto shotgun.',dead:'THE WRECKING CREW IS FINISHED',
   look:()=>({skin:hex(0xf0c8a0),jacket:hex(0xf2efe6),shirt:hex(0xff9a1a),pants:hex(0xf2efe6),shoes:hex(0x1a1410),hair:hex(0x9a8a7a),hs:'slick',stache:true,watch:true,bw:1.3,bd:1.25,bh:1.04})}},
 vault:{name:'VALE TRUST SECURITY',short:'VALE SECURITY',col:'#5a9cff',act:4,
  look:L=>{L.jacket=hex(0x1a2a4a);L.shirt=hex(0xa8c8ff);L.pants=hex(0x1a2a4a);L.shoes=hex(0x101014);},
  lt:{name:'CAPTAIN DREW HOLLIS',weapon:'mini14',hp:8,intro:'Vale Trust\'s head of security. Ex-army, Mini-14, keeps his men in a line.',dead:'HOLLIS IS DOWN',
   look:()=>({skin:hex(0xd9a37c),jacket:hex(0x1a2a4a),shirt:hex(0xa8c8ff),pants:hex(0x1a2a4a),shoes:hex(0x101014),hair:hex(0x2a1a10),hs:'slick',shades:true,watch:true,bw:1.2,bd:1.15,bh:1.04})},
  boss:{name:'MARCUS VALE',weapon:'m16',hp:18,intro:'Conrad Vale\'s son. Took the family money and the family army. M16, armoured vest.',dead:'VALE TRUST SECURITY IS FINISHED',
   look:()=>({skin:hex(0xf0c8a0),jacket:hex(0x2a2a34),shirt:hex(0xf4f4f4),pants:hex(0x2a2a34),shoes:hex(0x101010),hair:hex(0xb08a5a),hs:'slick',watch:true,bw:1.1,bd:1.05,bh:1.04})}}};
const EMP_DIST={sobe:'SOUTH BEACH',midb:'MID-BEACH',dtwn:'DOWNTOWN',brk:'BRICKELL',lhav:'LITTLE HAVANA',wyn:'WYNWOOD',grove:'COCONUT GROVE'};
/* every place on the map: fronts and rackets share keys, ownership (own_<k>), raids and holders */
const EMP_PLACES=[...EMP_FRONTS.map(f=>Object.assign(f,{t:'front'})),...EMP_RACKETS.map(r=>Object.assign(r,{t:'racket'}))];
const EMP_GOLD='#ffd36b',EMP_GUARD=[2500,6000,12000];
const EMP_TITLES=[[0,'STREET HUSTLER'],[3,'EARNER'],[8,'CAPTAIN'],[15,'UNDERBOSS'],[24,'BOSS']];
let EMP_ROLL=null; // tests fix the dice
const empDice=()=>typeof EMP_ROLL==='number'?EMP_ROLL:Math.random();
const empFront=k=>EMP_FRONTS.find(f=>f.k===k)||null;
const empRacket=k=>EMP_RACKETS.find(r=>r.k===k)||null;
const empPlace=k=>EMP_PLACES.find(x=>x.k===k)||null;
const empMission=x=>(x.t==='racket'?'r_':'e_')+x.k;
const empOpen=()=>missionDone('c7');
/* a crew is on the map once you have finished its act */
const empActive=g=>missionDone('c'+(EMP_ACT[g]||7));
const empGangs=()=>Object.keys(EMP_GANGS).filter(empActive);
function empSave(p){p=p||myProg();const e=p.emp&&typeof p.emp==='object'?p.emp:(p.emp={});
 for(const [k,v] of [['heat',{}],['hold',{}],['raid',{}],['up',{}]])if(!e[k]||typeof e[k]!=='object')e[k]=v;if(!Number.isFinite(e.day))e.day=0;
 /* saves from before the in-person rackets kept shaken-down rackets in p.emp.rk: they are owned places now */
 if(e.rk&&typeof e.rk==='object'){const w=dlgObj(p,'wflags');for(const k in e.rk)if(e.rk[k]&&empRacket(k))w['own_'+k]=1;}delete e.rk;delete e.tried;
 for(const g in EMP_GANGS)if(!Number.isFinite(e.heat[g]))e.heat[g]=0;return e;}
const empFlag=(p,f)=>{const w=p&&p.wflags;return !!(w&&ownKey(w,f)&&w[f]);};
function empOwns(x,p){p=p||myProg();return empFlag(p,'own_'+x.k);}
const empOwnsR=empOwns;
const empWiped=(g,p)=>empFlag(p||myProg(),'wiped_'+g);
const empOwned=p=>EMP_FRONTS.filter(f=>empOwns(f,p));
const empRackets=p=>EMP_RACKETS.filter(r=>empOwns(r,p));
/* who runs a place you don't own: a crew that raided it away from you, else the crew that started with it; 'none' once that crew is gone */
function empHolder(x,p){p=p||myProg();const e=empSave(p),g=ownKey(e.hold,x.k)?e.hold[x.k]:x.gang;return g!=='none'&&EMP_GANGS[g]&&!empWiped(g,p)?g:'none';}
const empRaid=(x,p)=>{const e=empSave(p),r=e.raid[x.k];return r&&EMP_GANGS[r.g]&&empOwns(x,p)?r:null;};
const empUnlocked=x=>missionUnlocked(empMission(x),missionCtx());
const empHqOpen=h=>missionUnlocked('hq_'+h.g,missionCtx());
const empCrewFronts=(g,p)=>EMP_FRONTS.filter(f=>!empOwns(f,p)&&empHolder(f,p)===g);
const empCrewRackets=(g,p)=>EMP_RACKETS.filter(r=>!empOwns(r,p)&&empHolder(r,p)===g);
function empRespect(p){p=p||myProg();return empRackets(p).length+2*empOwned(p).length+5*Object.keys(EMP_GANGS).filter(g=>empWiped(g,p)).length;}
const empKing=p=>EMP_PLACES.every(x=>empOwns(x,p))&&Object.keys(EMP_GANGS).every(g=>empWiped(g,p));
function empTitle(p){if(empKing(p))return 'KING OF MIAMI';const r=empRespect(p);let t=EMP_TITLES[0][1];for(const [n,s] of EMP_TITLES)if(r>=n)t=s;return t;}
const empFrontPay=(f,p)=>Math.round(f.pay*(1+0.5*((empSave(p).up[f.k]||{}).x|0)));
const empPay1=(x,p)=>x.t==='front'?empFrontPay(x,p):x.pay;
const empLive=(x,p)=>empOwns(x,p)&&!empRaid(x,p);
function empDistOwned(d,p){return EMP_PLACES.filter(x=>x.dist===d).every(x=>empLive(x,p));}
function empIncome(p){p=p||myProg();let tot=0;
 for(const d in EMP_DIST){let s=0;for(const x of EMP_PLACES)if(x.dist===d&&empLive(x,p))s+=empPay1(x,p);tot+=empDistOwned(d,p)?s*1.25:s;}
 return Math.round(empKing(p)?tot*1.25:tot);}
/* the crew's man at a racket: a collector, tougher at the harder places */
function empCollector(g,hard){const gg=EMP_GANGS[g],lt=gg.lt;return {name:gg.short+' COLLECTOR',weapon:hard>2?lt.weapon:hard>1?'smg':'pistol',hp:3+2*hard,
 intro:gg.short+' collect from here. Put their man down and the place pays you.',dead:'THE COLLECTOR IS DOWN',look:()=>Object.assign(lt.look(),{bw:1.05,bd:1,hs:'slick'})};}
/* what a running empire mission is: a place (taken or defended) or a crew HQ */
function empRunInfo(){const m=typeof MISSION==='string'&&missionKnown(MISSION)&&MISSIONS[MISSION];if(!m||m.kind!=='empire')return null;const p=myProg();
 if(m.hq){const h=EMP_HQ.find(q=>q.g===m.hq);return h?{hq:h,gang:h.g,base:h.base,boss:EMP_GANGS[h.g].boss}:null;}
 const x=empPlace(m.front);if(!x)return null;const r=empRaid(x,p),h=r?r.g:empHolder(x,p),g=h==='none'?x.gang:h;
 return {f:x,gang:g,base:missionBase(MISSION),defend:!!r,free:!r&&h==='none',boss:x.t==='front'?EMP_GANGS[g].lt:empCollector(g,x.hard)};}
const empRun=()=>{const i=empRunInfo();return i&&i.f||null;};
/* news to show once you are home again */
let EMP_NEWS=[];
const empNote=(a,b)=>EMP_NEWS.push([a,b]);
/* after every finished job (payout): unanswered raids are lost, the empire pays, heat cools, and the crews may strike again */
function empPay(p){const e=empSave(p),run=empRunInfo(),cur=run&&run.f?run.f.k:null;e.day++;
 for(const x of EMP_PLACES){const r=e.raid[x.k];if(!r)continue;if(!empOwns(x,p)||!EMP_GANGS[r.g]||empWiped(r.g,p)){delete e.raid[x.k];continue;}if(x.k===cur||r.d>=e.day)continue;
  delete e.raid[x.k];delete dlgObj(p,'wflags')['own_'+x.k];e.hold[x.k]=r.g;e.heat[r.g]=Math.max(0,e.heat[r.g]-15);empNote(EMP_GANGS[r.g].short+' TOOK '+x.name,'You did not come back to defend it. Take it back from the Empire map');}
 const inc=empIncome(p);if(inc>0){p.wallet+=inc;p.empTot=(p.empTot||0)+inc;empNote('YOUR EMPIRE PAID +$'+fmt(inc),empTitle(p)+' · '+empOwned(p).length+' fronts · '+empRackets(p).length+' rackets');}
 for(const g in EMP_GANGS){if(empWiped(g,p)||!empActive(g)){e.heat[g]=0;continue;}e.heat[g]=Math.max(0,e.heat[g]-8);
  if(Object.values(e.raid).some(r=>r&&r.g===g))continue;
  const mine=EMP_PLACES.filter(x=>empOwns(x,p)&&!e.raid[x.k]&&x.k!==cur);if(!mine.length)continue;
  if(empDice()>=Math.min(0.4,e.heat[g]/250))continue;
  const t=mine[Math.floor(empDice()*mine.length)%mine.length],gg=EMP_GANGS[g];
  const lv=t.t==='front'?(e.up[t.k]||{}).g|0:0;if(lv&&empDice()<0.3*lv){empNote('YOUR GUARDS HELD '+t.name,gg.short+' tried it and ran');continue;}
  e.raid[t.k]={g,d:e.day};empNote(gg.short+' ARE HITTING '+t.name,'Drive over and defend it before your next job is done, or it is theirs');}
 return inc;}
/* payout() after an empire job: the reward flag (own_<k> or wiped_<g>) is already set */
function empTaken(p,k){const e=empSave(p),m=MISSIONS[MISSION]||{};
 if(m.hq){const g=m.hq,gg=EMP_GANGS[g];for(const x of EMP_PLACES)if(!empOwns(x,p)&&(ownKey(e.hold,x.k)?e.hold[x.k]:x.gang)===g)e.hold[x.k]='none';e.heat[g]=0;
  for(const x of EMP_PLACES)if(e.raid[x.k]&&e.raid[x.k].g===g)delete e.raid[x.k];empNote(gg.name+' ARE FINISHED','Their rackets have nobody behind them now · respect +5');return empCrown(p);}
 const x=empPlace(k);if(!x)return;const r=e.raid[x.k];
 if(r){delete e.raid[x.k];e.heat[r.g]=Math.min(100,e.heat[r.g]+10);empNote('YOU HELD '+x.name,EMP_GANGS[r.g].short+' will think twice');return;}
 const was=ownKey(e.hold,x.k)?e.hold[x.k]:x.gang;delete e.hold[x.k];if(EMP_GANGS[was]&&!empWiped(was,p))e.heat[was]=Math.min(100,e.heat[was]+(x.t==='front'?30:12));
 empNote(x.name+' IS YOURS','+$'+fmt(empPay1(x,p))+' after every job'+(x.t==='front'?' · buy guards before they come back':' · keep an eye on it'));empCrown(p);}
function empCrown(p){if(empKing(p)){const w=dlgObj(p,'wflags');if(!w.king_miami){w.king_miami=1;empNote('KING OF MIAMI','The whole city is yours · everything pays 25% more');}}}
function empNews(){if(!EMP_NEWS.length)return;const n=EMP_NEWS.splice(0);let i=0;const next=()=>{if(i>=n.length)return;const b=n[i++];banner(b[0],b[1]);sfx('cash');if(i<n.length)setTimeout(next,3200);};setTimeout(next,2400);}
/* thugs on an empire job wear their crew's colours (makeEnemy calls this before building the model) */
function turfLook(L){const r=empRunInfo();if(!r||levelIdx!==r.base)return;delete L.torsoTile;L.apron=false;L.tee=false;EMP_GANGS[r.gang].look(L);}
/* applyTwist 'turf': the lieutenant, the collector (or at an HQ the crew boss, in place of the floor's own boss) waits at the far end.
   A racket keeps only part of its building's crew: half at an easy place, three quarters at a stubborn one, all of them at a tough one;
   a place whose crew is gone has only a few leftovers. */
function turfSetup(g){const r=empRunInfo();if(!r)return;const p=g.player;
 if(r.hq){for(const e of g.enemies)if(e.boss){e.alive=false;e.sunk=true;}g.enemies=g.enemies.filter(e=>e.alive);g.boss=null;}
 if(r.f&&r.f.t==='racket'){const keep=r.free?0.35:0.25+0.25*r.f.hard,es=g.enemies.filter(e=>!e.boss),n=Math.max(2,Math.round(es.length*keep));
  es.sort((a,b)=>Math.hypot(b.x-p.x,b.z-p.z)-Math.hypot(a.x-p.x,a.z-p.z));for(const e of es.slice(n)){e.alive=false;e.sunk=true;}g.enemies=g.enemies.filter(e=>e.alive);}
 g.turf={k:r.f?r.f.k:'hq_'+r.gang,gang:r.gang,boss:r.boss,defend:r.defend,hq:!!r.hq,racket:!!(r.f&&r.f.t==='racket')};
 let best=null,bd=0;for(let z=1;z<g.H-1;z++)for(let x=1;x<g.W-1;x++){const i=z*g.W+x;if(g.solid[i]||g.furn[i]||(g.def.site?'=PC'.includes(g.rows[z][x]):isOut(g,x,z)))continue;const d=Math.hypot(x+0.5-p.x,z+0.5-p.z);if(d>bd){bd=d;best=[x+0.5,z+0.5];}}
 if(best)makeEnemy(g,{boss:r.boss},levelIdx,r.boss.weapon,true,best[0],best[1]);}
/* upgrades on an owned front: guards 0-3, expansion 0-2 */
function empUpCost(f,kind,p){const u=empSave(p).up[f.k]||{};if(kind==='g')return (u.g|0)<3?EMP_GUARD[u.g|0]:null;return (u.x|0)<2?f.pay*((u.x|0)?8:4):null;}
function empUpgrade(k,kind){const p=myProg(),f=empFront(k),e=empSave(p);if(!f||!empOwns(f,p))return 'no';const c=empUpCost(f,kind,p);if(c==null)return 'max';if(p.wallet<c)return 'poor';
 p.wallet-=c;const u=e.up[f.k]||(e.up[f.k]={});u[kind]=(u[kind]|0)+1;saveProg();return 'ok';}
/* ---- THE EMPIRE screen (car menu, E / pad BACK): the map on the left, the crews and the districts on the right ---- */
let EMP_SEL=0,EMP_ENT=null;
function empEntries(){if(!EMP_ENT){EMP_ENT=EMP_HQ.map(h=>({t:'hq',h,k:'hq_'+h.g,at:h.at,name:h.name}));
 for(const d in EMP_DIST)for(const t of ['front','racket'])for(const x of EMP_PLACES)if(x.dist===d&&x.t===t)EMP_ENT.push({t,x,f:t==='front'?x:null,r:t==='racket'?x:null,k:x.k,at:x.at,name:x.name,d});}return EMP_ENT;}
/* the state of an entry: own | raid | open | lock | wiped */
function empEntState(en,p){p=p||myProg();
 if(en.t==='hq'){if(empWiped(en.h.g,p))return 'wiped';return empHqOpen(en.h)&&!empCrewFronts(en.h.g,p).length?'open':'lock';}
 const x=en.x;if(empOwns(x,p))return empRaid(x,p)?'raid':'own';return empUnlocked(x)?'open':'lock';}
function empCol(en,p){const s=empEntState(en,p);if(s==='own')return EMP_GOLD;if(s==='raid')return '#ff5a3a';if(s==='lock'||s==='wiped')return '#6a5a7a';
 const g=en.t==='hq'?en.h.g:empHolder(en.x,p);return g==='none'?'#9fe8a8':EMP_GANGS[g].col;}
function openEmpire(){if(state!=='carmenu'||!empOpen())return;sfx('pick');state='empire';const E=empEntries(),p=myProg();
 let i=E.findIndex(en=>empEntState(en,p)==='raid');if(i<0)i=E.findIndex(en=>en.t==='front'&&empEntState(en,p)==='open');EMP_SEL=i>=0?i:0;show('sEmpire');renderEmpire('');}
function closeEmpire(){if(state!=='empire')return;sfx('blip');openCarMenuForce();}
/* why a place is shut: the floor you have to finish first (its own, or the act that brings its crew to Miami) */
const empLockN=en=>{const g=en.t==='hq'?en.h.g:en.x.gang,n=en.t==='hq'?en.h.need:en.x.t==='front'?en.x.need:0;return Math.max(n,EMP_ACT[g]||7);};
const empLockTxt=n=>'FINISH '+LEVELS[n].name+' FIRST';
function empHeatBar(g,p){const h=empSave(p).heat[g]|0;return `<span class="emHeat"><i style="width:${h}%"></i></span>`;}
function empCard(en,i,p){const s=empEntState(en,p),sel=i===EMP_SEL?' sel':'',btn=(a,t,dis)=>`<button class="btn sm emGo"${dis?' disabled':''} data-act="${a}" data-i="${i}">${t}</button>`;
 if(en.t==='hq'){const g=en.h.g,gg=EMP_GANGS[g],on=empActive(g),fr=empCrewFronts(g,p).length,rk=empCrewRackets(g,p).length;
  const st=s==='wiped'?'<b style="color:#7dff9a">WIPED OUT</b>':!on?`<b style="color:#8a7a9a">TURNS UP AFTER ACT ${gg.act}</b>`:`HEAT ${empHeatBar(g,p)} · ${fr} FRONT${fr===1?'':'S'} · ${rk} RACKETS`;
  const act=s==='open'?btn('hq','HIT THEIR HQ<span class="kbhint"> (ENTER)</span>'):s==='wiped'?'':`<div class="emNote">${!empHqOpen(en.h)?empLockTxt(empLockN(en)):'TAKE THEIR '+fr+' FRONT'+(fr>1?'S':'')+' FIRST'}</div>`;
  return `<div class="emC crew ${s}${sel}${on?'':' off'}" data-i="${i}" style="border-color:${s==='wiped'||!on?'#4a3a5a':gg.col}"><div class="emN" style="color:${on?gg.col:'#8a7a9a'}">${gg.name}</div><div class="emA">HQ: ${en.h.name} · ${en.h.area}</div><div class="emW">${st}</div>${act}</div>`;}
 const x=en.x,g=empHolder(x,p),gc=g==='none'?null:EMP_GANGS[g],fr=en.t==='front',u=fr?empSave(p).up[x.k]||{}:{};
 let who,act='';
 if(s==='own'||s==='raid'){who=s==='raid'?`<b style="color:#ff5a3a">UNDER ATTACK BY ${EMP_GANGS[empRaid(x,p).g].name}</b>`:`<b style="color:${EMP_GOLD}">YOURS</b>`+(fr?` · GUARDS ${u.g|0}/3 · EXPANDED ${u.x|0}/2`:'');
  if(s==='raid')act=btn('go','DRIVE OVER AND DEFEND IT<span class="kbhint"> (ENTER)</span>');
  else if(fr){const cg=empUpCost(x,'g',p),cx=empUpCost(x,'x',p);act=btn('g',cg==null?'GUARDS MAXED':'GUARDS $'+fmt(cg),cg==null||p.wallet<cg)+btn('x',cx==null?'FULLY EXPANDED':'EXPAND $'+fmt(cx),cx==null||p.wallet<cx);}}
 else if(s==='lock')who=`<b style="color:#8a7a9a">${empLockTxt(empLockN(en))}</b>`;
 else{who=gc?`${fr?'HELD BY':'PAYS'} <b style="color:${gc.col}">${fr?gc.name:gc.short}</b>`:'<b style="color:#9fe8a8">INDEPENDENT</b> · A FEW LEFTOVERS';
  act=btn('go',(fr?'DRIVE OVER AND TAKE IT':'DRIVE OVER AND MUSCLE IN')+'<span class="kbhint"> (ENTER)</span>');}
 const kind=fr?'FRONT':EMP_VENUE[x.type].n+(x.hard>1?' · '+(x.hard>2?'HEAVY':'GUARDED'):'');
 return `<div class="emC ${en.t} ${s}${sel}" data-i="${i}"><div class="emN">${x.name}</div><div class="emA">${kind} · $${fmt(empPay1(x,p))} A JOB</div><div class="emW">${who}</div><div class="emBtns">${act}</div></div>`;}
function renderEmpire(msg){const p=myProg(),E=empEntries(),inc=empIncome(p);
 $('emWallet').textContent='$'+fmt(p.wallet);$('emInc').innerHTML=inc?'+$'+fmt(inc)+' A JOB'+(p.empTot?'<span class="emCnt"> · EARNED $'+fmt(p.empTot)+'</span>':''):'NOTHING PAYS YOU YET';
 $('emSub').innerHTML=empTitle(p)+' · RESPECT '+empRespect(p)+'<span class="emCnt"> · '+empOwned(p).length+'/'+EMP_FRONTS.length+' FRONTS · '+empRackets(p).length+'/'+EMP_RACKETS.length+' RACKETS</span>';
 let h='<div class="emH">RIVAL CREWS</div>',lastD=null;
 E.forEach((en,i)=>{if(en.d&&en.d!==lastD){lastD=en.d;const all=E.filter(q=>q.d===en.d),own=all.filter(q=>empEntState(q,p)==='own').length;h+=`<div class="emH">${EMP_DIST[en.d]} <span>${own}/${all.length}${empDistOwned(en.d,p)?' · YOURS +25%':''}</span></div>`;}h+=empCard(en,i,p);});
 $('emList').innerHTML=h;$('emMsg').textContent=msg||'';drawEmpMap();empAnim();
 const el=$('emList').querySelector('.emC.sel');if(el&&el.scrollIntoView)try{el.scrollIntoView({block:'nearest'});}catch(e){}}
function empSelect(i){const n=empEntries().length;EMP_SEL=(i+n)%n;sfx('blip');renderEmpire('');}
/* the act buttons: go (drive over and take it / defend it), hq, g/x upgrades on a front */
function empAct(i,act){if(state!=='empire'||fading)return;const en=empEntries()[i];if(!en)return;const p=myProg(),s=empEntState(en,p);EMP_SEL=i;
 if(en.t==='front'&&(act==='g'||act==='x')){const res=empUpgrade(en.x.k,act);sfx(res==='ok'?'cash':'blip');
  return renderEmpire(res==='ok'?(act==='g'?'More guards on '+en.x.name+'. Raids fail more often.':en.x.name+' is bigger now and pays $'+fmt(empFrontPay(en.x,p))+' a job.'):res==='poor'?'Not enough cash.':res==='max'?'Nothing more to buy there.':'');}
 if(s==='lock'||s==='wiped'||s==='own'){sfx('blip');return renderEmpire(s==='own'?'Already yours.':s==='wiped'?'They are finished.':'Not yet.');}
 const id=en.t==='hq'?'hq_'+en.h.g:empMission(en.x),gk=en.t==='hq'?en.h.g:(empRaid(en.x,p)||{g:empHolder(en.x,p)}).g,gg=EMP_GANGS[gk]||EMP_GANGS[en.x.gang];
 sfx('pick');cruiseGo(id,en.name,(en.t==='hq'?'WIPE OUT ':s==='raid'?'DEFEND AGAINST ':en.t==='racket'?'MUSCLE IN · ':'TAKEOVER · ')+gg.name,en.t==='hq'?en.h.area:EMP_DIST[en.x.dist]);}
function empPrimary(i){const en=empEntries()[i];if(!en)return;const s=empEntState(en);if(en.t==='front'&&s==='own')return empAct(i,'g');empAct(i,en.t==='hq'?'hq':'go');}
function empKey(e){const c=e.code;if(c==='Escape'||c==='Backspace'||c==='KeyE'){closeEmpire();return;}
 if(c==='ArrowUp'||c==='ArrowLeft'||c==='KeyW'||c==='KeyA')empSelect(EMP_SEL-1);else if(c==='ArrowDown'||c==='ArrowRight'||c==='KeyS')empSelect(EMP_SEL+1);
 else if(c==='Enter'||c==='Space')empPrimary(EMP_SEL);else if(c==='KeyG')empAct(EMP_SEL,'g');else if(c==='KeyX'||c==='KeyD')empAct(EMP_SEL,'x');}
function empPad(dir){if(pdown(1)||pdown(8)){closeEmpire();return;}if(pdown(12)||dir<0)empSelect(EMP_SEL-1);else if(pdown(13)||dir>0)empSelect(EMP_SEL+1);else if(pdown(0))empPrimary(EMP_SEL);
 else if(pdown(3))empAct(EMP_SEL,'x');}

/* ---- the map: a neon night chart of Miami, 1986. The geography (coast, islands, highways, causeways) is drawn once into a cached layer
   at the canvas's real pixel size; the turf glows, pins and the pulsing selection are drawn over it every frame while the screen is up.
   Map coordinates are 0..1 across a 0.9:1 frame fitted inside the canvas (EMP_FRONTS[].at uses them); land and sea run past the frame. ---- */
const EMP_ASPECT=0.9;
const EMP_GEO={
 main:[[-0.6,-0.3],[0.6,-0.3],[0.6,0],[0.592,0.1],[0.6,0.2],[0.585,0.3],[0.598,0.37],[0.625,0.44],[0.61,0.5],[0.585,0.57],[0.565,0.64],[0.54,0.72],[0.5,0.79],[0.47,0.86],[0.44,0.94],[0.41,1.05],[0.39,1.3],[-0.6,1.3]],
 beach:[[0.785,-0.3],[0.78,0],[0.772,0.15],[0.765,0.3],[0.768,0.45],[0.774,0.58],[0.785,0.68],[0.805,0.735],[0.83,0.73],[0.85,0.66],[0.862,0.55],[0.87,0.4],[0.875,0.2],[0.882,0],[0.89,-0.3]],
 isles:[[[0.705,0.48],[0.735,0.47],[0.74,0.5],[0.71,0.51]],[[0.635,0.545],[0.70,0.555],[0.705,0.575],[0.64,0.57]],[[0.79,0.78],[0.815,0.775],[0.82,0.8],[0.795,0.805]],
  [[0.665,0.86],[0.69,0.84],[0.735,0.9],[0.75,0.98],[0.74,1.08],[0.715,1.08],[0.7,0.97]],[[0.66,0.415],[0.672,0.41],[0.674,0.425],[0.662,0.428]],[[0.69,0.418],[0.703,0.413],[0.705,0.428],[0.692,0.43]],[[0.72,0.42],[0.734,0.416],[0.736,0.43],[0.722,0.433]]],
 roads:[{n:'I-95',w:3.2,c:'#ffd36b',p:[[0.4,-0.3],[0.41,0.2],[0.43,0.38],[0.46,0.52],[0.45,0.64],[0.41,0.8],[0.38,1.3]]},
  {n:'',w:2.4,c:'#ff8a3a',p:[[-0.6,0.47],[0.2,0.475],[0.46,0.5],[0.6,0.49]]},
  {n:'US 1',w:2,c:'#ff8a3a',p:[[0.575,0.6],[0.5,0.72],[0.42,0.82],[0.3,0.98],[0.2,1.3]]},
  {n:'',w:1.6,c:'#ff8a3a',p:[[0.58,0.0],[0.57,0.2],[0.585,0.4]]},
  {n:'',w:1.6,c:'#ff8a3a',p:[[0.82,-0.3],[0.815,0.2],[0.81,0.45],[0.815,0.7]]}],
 bridges:[[[0.588,0.25],[0.767,0.27]],[[0.6,0.42],[0.766,0.44]],[[0.612,0.5],[0.72,0.55],[0.778,0.62]],[[0.565,0.645],[0.62,0.72],[0.68,0.86]]],
 labels:[['LITTLE HAVANA',0.25,0.58],['WYNWOOD',0.5,0.2],['DOWNTOWN',0.5,0.4],['BRICKELL',0.45,0.66],['COCONUT GROVE',0.3,0.88],['OVERTOWN',0.3,0.36]],
 water:[['BISCAYNE',0.69,0.7],['BAY',0.7,0.74],['ATLANTIC OCEAN',0.955,0.55,'v']],
 palms:[[0.86,0.6],[0.862,0.5],[0.866,0.4],[0.87,0.3],[0.872,0.2],[0.874,0.1],[0.848,0.69],[0.745,0.95],[0.73,0.89]]};
let EMP_LAYER=null,EMP_RECT=null,EMP_ANIM=0,EMP_SPARK=[];
function empRng(seed){let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
function empPath(c,P,R,closed){/* a smooth curve through the points (Catmull-Rom as Beziers) */
 const pts=P.map(R),n=pts.length;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
 for(let i=0;i<(closed?n:n-1);i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];const a=closed||i>0?p0:p1,d=closed||i<n-2?p3:p2;
  c.bezierCurveTo(p1[0]+(p2[0]-a[0])/6,p1[1]+(p2[1]-a[1])/6,p2[0]-(d[0]-p1[0])/6,p2[1]-(d[1]-p1[1])/6,p2[0],p2[1]);}
 if(closed)c.closePath();}
function empFont(px,bold){return (bold?'bold ':'')+Math.round(px)+"px 'Press Start 2P',monospace";}
function empBuildLayer(W,H){const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
 const mh=Math.min(H,W/EMP_ASPECT),mw=mh*EMP_ASPECT,ox=(W-mw)/2,oy=(H-mh)/2,R=([x,y])=>[ox+x*mw,oy+y*mh],u=mh/400;EMP_RECT={ox,oy,mw,mh,u};
 const rng=empRng(1986);
 /* sea: deep navy with a warm horizon glow off the beach */
 let gr=c.createLinearGradient(0,0,W,0);gr.addColorStop(0,'#04102a');gr.addColorStop(0.6,'#062244');gr.addColorStop(1,'#0a2e58');c.fillStyle=gr;c.fillRect(0,0,W,H);
 gr=c.createRadialGradient(ox+mw*1.05,oy+mh*0.05,0,ox+mw*1.05,oy+mh*0.05,mh*0.75);gr.addColorStop(0,'rgba(255,63,164,.32)');gr.addColorStop(0.5,'rgba(255,120,80,.08)');gr.addColorStop(1,'rgba(255,63,164,0)');c.fillStyle=gr;c.fillRect(0,0,W,H);
 /* swell lines on the open sea */
 c.strokeStyle='rgba(45,226,230,.10)';c.lineWidth=Math.max(1,u);for(let k=0;k<26;k++){const y=oy+(k/26)*mh*1.1-mh*0.05,x0=ox+mw*(0.9+rng()*0.05);c.beginPath();c.moveTo(x0,y);for(let x=x0;x<W;x+=6*u)c.lineTo(x,y+Math.sin(x/(9*u)+k)*1.6*u);c.stroke();}
 const land=(P,fill)=>{empPath(c,P,R,true);c.fillStyle=fill;c.fill();};
 const coast=P=>{empPath(c,P,R,true);c.save();c.strokeStyle='rgba(232,196,138,.55)';c.lineWidth=5*u;c.stroke();c.shadowColor='#2de2e6';c.shadowBlur=10*u;c.strokeStyle='rgba(45,226,230,.9)';c.lineWidth=1.6*u;c.stroke();c.restore();};
 /* glow of the shallows */
 c.save();c.shadowColor='rgba(45,226,230,.35)';c.shadowBlur=22*u;for(const P of [EMP_GEO.main,EMP_GEO.beach,...EMP_GEO.isles])land(P,'#0a2f4e');c.restore();
 /* land */
 const lg=c.createLinearGradient(ox,oy,ox+mw*0.6,oy+mh);lg.addColorStop(0,'#24103a');lg.addColorStop(1,'#1a0a2c');
 for(const P of [EMP_GEO.main,EMP_GEO.beach,...EMP_GEO.isles])land(P,lg);
 /* city blocks with lit windows, clipped to the land */
 c.save();empPath(c,EMP_GEO.main,R,true);empPath(c,EMP_GEO.beach,R,true);c.beginPath();
 for(const P of [EMP_GEO.main,EMP_GEO.beach]){const pts=P.map(R);c.moveTo(pts[0][0],pts[0][1]);for(const q of pts)c.lineTo(q[0],q[1]);c.closePath();}c.clip();
 const step=11*u;for(let y=oy-mh*0.3;y<oy+mh*1.3;y+=step)for(let x=0;x<W;x+=step){const dense=1-Math.min(1,Math.hypot((x-ox)/mw-0.55,(y-oy)/mh-0.48)*1.6);
  c.fillStyle='rgba(120,70,170,'+(0.1+dense*0.18)+')';c.fillRect(x+1.5*u,y+1.5*u,step-3*u,step-3*u);
  if(rng()<0.25+dense*0.5){c.fillStyle=rng()<0.7?'rgba(255,211,107,'+(0.35+rng()*0.5)+')':'rgba(45,226,230,.6)';c.fillRect(x+2*u+rng()*(step-5*u),y+2*u+rng()*(step-5*u),1.6*u,1.6*u);}}
 /* downtown towers glow */
 gr=c.createRadialGradient(ox+mw*0.56,oy+mh*0.47,0,ox+mw*0.56,oy+mh*0.47,mh*0.16);gr.addColorStop(0,'rgba(255,211,107,.28)');gr.addColorStop(1,'rgba(255,211,107,0)');c.fillStyle=gr;c.fillRect(0,0,W,H);
 c.restore();
 for(const P of [EMP_GEO.main,EMP_GEO.beach,...EMP_GEO.isles])coast(P);
 /* causeways: a pale deck with lamps */
 for(const B of EMP_GEO.bridges){c.save();c.lineCap='round';c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=6*u;empPath(c,B,R,false);c.stroke();c.strokeStyle='#d9c8ec';c.lineWidth=3*u;c.stroke();c.setLineDash([2*u,6*u]);c.strokeStyle='#ffd36b';c.lineWidth=1.4*u;c.stroke();c.restore();}
 /* highways */
 for(const r of EMP_GEO.roads){c.save();c.lineCap='round';c.lineJoin='round';empPath(c,r.p,R,false);c.shadowColor=r.c;c.shadowBlur=8*u;c.strokeStyle=r.c;c.globalAlpha=0.85;c.lineWidth=r.w*u;c.stroke();c.restore();
  if(r.n){const q=R(r.p[r.n==='I-95'?2:1]);c.save();c.font=empFont(6*u);const tw=c.measureText(r.n).width+6*u;c.fillStyle='#1a0c2a';c.strokeStyle=r.c;c.lineWidth=1.2*u;c.fillRect(q[0]-tw/2,q[1]-5*u,tw,10*u);c.strokeRect(q[0]-tw/2,q[1]-5*u,tw,10*u);c.fillStyle=r.c;c.textAlign='center';c.textBaseline='middle';c.fillText(r.n,q[0],q[1]+0.5*u);c.restore();}}
 /* palms along the beach */
 for(const pp of EMP_GEO.palms){const [x,y]=R(pp);c.save();c.strokeStyle='#7dff9a';c.globalAlpha=0.75;c.lineWidth=1.2*u;c.beginPath();c.moveTo(x,y+4*u);c.quadraticCurveTo(x+1*u,y,x,y-3*u);c.stroke();
  for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*0.6;c.beginPath();c.moveTo(x,y-3*u);c.quadraticCurveTo(x+Math.cos(a)*3*u,y-3*u+Math.sin(a)*3*u-1*u,x+Math.cos(a)*5*u,y-3*u+Math.sin(a)*5*u+1.5*u);c.stroke();}c.restore();}
 /* names */
 c.textAlign='center';c.textBaseline='middle';
 for(const [t,x,y] of EMP_GEO.labels){const q=R([x,y]);c.font=empFont(5.5*u);c.fillStyle='rgba(0,0,0,.6)';c.fillText(t,q[0]+u,q[1]+u);c.fillStyle='rgba(233,199,255,.62)';c.fillText(t,q[0],q[1]);}
 {const q=R([0.818,0.22]);c.save();c.translate(q[0],q[1]);c.rotate(Math.PI/2);c.font=empFont(6*u);c.fillStyle='rgba(255,211,107,.75)';c.fillText('MIAMI BEACH',0,0);c.restore();}
  for(const [t,x,y,v] of EMP_GEO.water){const q=R([x,y]);c.save();c.translate(q[0],q[1]);if(v)c.rotate(Math.PI/2);c.font='italic '+Math.round(9*u)+'px Georgia,serif';c.fillStyle='rgba(45,226,230,.45)';c.fillText(t.split('').join(String.fromCharCode(8202)),0,0);c.restore();}
 /* title cartouche and compass */
 {const x=ox+10*u,y=oy+10*u;c.save();c.fillStyle='rgba(10,4,20,.78)';c.strokeStyle='#ff2d95';c.lineWidth=1.5*u;c.fillRect(x,y,100*u,30*u);c.strokeRect(x,y,100*u,30*u);c.textAlign='left';
  c.font=empFont(10*u);c.fillStyle='#ffd36b';c.shadowColor='#ff2d95';c.shadowBlur=6*u;c.fillText('MIAMI',x+6*u,y+11*u);c.shadowBlur=0;c.font=empFont(5*u);c.fillStyle='#2de2e6';c.fillText('DADE COUNTY · 1986',x+6*u,y+23*u);c.restore();}
 {const cx=ox+mw*0.93,cy=oy+mh*0.92,r=14*u;c.save();c.translate(cx,cy);c.strokeStyle='rgba(233,199,255,.5)';c.lineWidth=u;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();
  for(let k=0;k<4;k++){c.rotate(Math.PI/2);c.beginPath();c.moveTo(0,-r*1.1);c.lineTo(r*0.22,0);c.lineTo(-r*0.22,0);c.closePath();c.fillStyle=k===3?'#ff3fa4':'rgba(233,199,255,.6)';c.fill();}
  c.font=empFont(6*u);c.fillStyle='#ff3fa4';c.textAlign='center';c.fillText('N',0,-r*1.55);c.restore();}
 /* scanlines and vignette */
 c.fillStyle='rgba(0,0,0,.12)';for(let y=0;y<H;y+=3)c.fillRect(0,y,W,1);
 gr=c.createRadialGradient(W/2,H/2,Math.min(W,H)*0.35,W/2,H/2,Math.max(W,H)*0.75);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=gr;c.fillRect(0,0,W,H);
 /* sea sparkles to twinkle each frame */
 EMP_SPARK=[];const tc=document.createElement('canvas').getContext('2d');const inLand=(x,y)=>[EMP_GEO.main,EMP_GEO.beach,...EMP_GEO.isles].some(P=>{empPath(tc,P,R,true);return tc.isPointInPath(x,y);});
 for(let k=0;k<70;k++){const x=rng()*W,y=rng()*H;if(!inLand(x,y))EMP_SPARK.push([x,y,rng()*6.28,0.6+rng()*1.4]);}
 return cv;}
function empPinPath(c,x,y,r){c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-r*0.5,y-r*0.9,x-r*1.15,y-r*1.25,x-r*1.1,y-r*1.9);c.arc(x,y-r*1.9,r*1.1,Math.PI,0);c.bezierCurveTo(x+r*1.15,y-r*1.25,x+r*0.5,y-r*0.9,x,y);c.closePath();}
function drawEmpMap(t){const cv=$('emMap');if(!cv)return;const b=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
 const W=Math.max(60,Math.round((b.width||360)*dpr)),H=Math.max(60,Math.round((b.height||400)*dpr));
 if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;EMP_LAYER=null;}if(!EMP_LAYER||EMP_LAYER.width!==W||EMP_LAYER.height!==H)EMP_LAYER=empBuildLayer(W,H);
 const c=cv.getContext('2d'),{ox,oy,mw,mh,u}=EMP_RECT,T=(t||performance.now())/1000;c.drawImage(EMP_LAYER,0,0);
 for(const [x,y,ph,s] of EMP_SPARK){const a=Math.max(0,Math.sin(T*s+ph));if(a<0.2)continue;c.fillStyle='rgba(180,250,255,'+(a*0.7)+')';c.fillRect(x,y,1.6*u*a,1.6*u*a);}
 const r=Math.max(6,8*u);
 const E=empEntries(),p=myProg(),P=en=>[ox+en.at[0]*mw,oy+en.at[1]*mh];
 /* turf: every place glows in its holder's colour */
 E.forEach(en=>{const s=empEntState(en,p);if(s==='lock'||s==='wiped')return;const [x,y]=P(en),col=empCol(en,p),rr=r*(en.t==='racket'?3:5.5);
  const g=c.createRadialGradient(x,y,0,x,y,rr);g.addColorStop(0,col+(en.t==='racket'?'44':'66'));g.addColorStop(1,col+'00');c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,Math.PI*2);c.fill();});
 /* pins, the selected one last: rackets are small diamonds, fronts map markers, HQs a skull plate */
 const order=E.map((en,i)=>i).sort((a,b)=>(a===EMP_SEL)-(b===EMP_SEL)||E[a].at[1]-E[b].at[1]);
 for(const i of order){const en=E[i],s=empEntState(en,p),[x,y]=P(en),sel=i===EMP_SEL,col=empCol(en,p),bob=sel?Math.sin(T*4)*1.5*u:0,flash=s==='raid'&&Math.sin(T*8)>0;
  if(sel)for(let k=0;k<2;k++){const ph=(T*0.9+k*0.5)%1;c.strokeStyle=col;c.globalAlpha=1-ph;c.lineWidth=2*u;c.beginPath();c.ellipse(x,y,r*(1+ph*3),r*(0.45+ph*1.3),0,0,Math.PI*2);c.stroke();c.globalAlpha=1;}
  if(en.t==='racket'){const d=(sel?1.25:0.85)*r*0.8;c.save();c.translate(x,y+bob);c.shadowColor=col;c.shadowBlur=(sel?12:5)*u;c.rotate(Math.PI/4);c.fillStyle=flash?'#fff':col;c.fillRect(-d/2,-d/2,d,d);c.shadowBlur=0;c.strokeStyle='#160826';c.lineWidth=1.2*u;c.strokeRect(-d/2,-d/2,d,d);c.restore();
   if(s==='own'||s==='lock'||s==='raid'){c.fillStyle='#160826';c.font=empFont(d*0.7);c.textAlign='center';c.textBaseline='middle';c.fillText(s==='own'?'$':s==='lock'?'?':'!',x+0.3*u,y+bob+0.5*u);}}
  else if(en.t==='hq'){const w=r*(sel?2.4:2),hh=r*(sel?2.1:1.75),yy=y-hh-r*0.4+bob;c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.ellipse(x,y,r,r*0.35,0,0,Math.PI*2);c.fill();
   c.save();c.shadowColor=col;c.shadowBlur=(sel?16:8)*u;c.fillStyle='#120818';c.fillRect(x-w/2,yy,w,hh);c.shadowBlur=0;c.strokeStyle=col;c.lineWidth=2*u;c.strokeRect(x-w/2,yy,w,hh);c.beginPath();c.moveTo(x,yy+hh);c.lineTo(x,y);c.stroke();
   /* a skull, or a cross over it once the crew is gone */
   const sx=x,sy=yy+hh*0.46,sr=hh*0.27;c.fillStyle=col;c.beginPath();c.arc(sx,sy,sr,Math.PI*0.95,Math.PI*2.05);c.fill();c.fillRect(sx-sr*0.62,sy,sr*1.24,sr*0.75);c.fillStyle='#120818';c.beginPath();c.arc(sx-sr*0.38,sy+sr*0.05,sr*0.26,0,Math.PI*2);c.arc(sx+sr*0.38,sy+sr*0.05,sr*0.26,0,Math.PI*2);c.fill();
   if(s==='wiped'){c.strokeStyle='#ff3a3a';c.lineWidth=2.4*u;c.beginPath();c.moveTo(x-w*0.4,yy+hh*0.15);c.lineTo(x+w*0.4,yy+hh*0.85);c.moveTo(x+w*0.4,yy+hh*0.15);c.lineTo(x-w*0.4,yy+hh*0.85);c.stroke();}c.restore();}
  else{const pr=sel?r*1.2:r;c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.ellipse(x,y,pr*0.8,pr*0.3,0,0,Math.PI*2);c.fill();
   c.save();c.translate(0,bob);c.shadowColor=col;c.shadowBlur=(sel||flash?16:8)*u;empPinPath(c,x,y,pr);const pg=c.createLinearGradient(x,y-pr*3,x,y);pg.addColorStop(0,'#fff');pg.addColorStop(0.25,flash?'#fff':col);pg.addColorStop(1,col);c.fillStyle=pg;c.fill();c.shadowBlur=0;
   c.strokeStyle='#160826';c.lineWidth=1.4*u;c.stroke();c.fillStyle='#160826';c.beginPath();c.arc(x,y-pr*1.9,pr*0.72,0,Math.PI*2);c.fill();
   c.fillStyle=col;c.font=empFont(pr*0.85);c.textAlign='center';c.textBaseline='middle';
   if(s==='own'){const cx=x,cy=y-pr*1.9,w=pr*0.5;c.beginPath();c.moveTo(cx-w,cy+w*0.55);c.lineTo(cx-w,cy-w*0.35);c.lineTo(cx-w*0.5,cy+w*0.1);c.lineTo(cx,cy-w*0.6);c.lineTo(cx+w*0.5,cy+w*0.1);c.lineTo(cx+w,cy-w*0.35);c.lineTo(cx+w,cy+w*0.55);c.closePath();c.fill();}
   else c.fillText(s==='lock'?'?':'!',x+0.5*u,y-pr*1.85);c.restore();}
  if(sel){const gk=en.t==='hq'?en.h.g:empRaid(en.x,p)?empRaid(en.x,p).g:empHolder(en.x,p);
   const l1=en.name,l2=s==='own'?'YOURS':s==='raid'?'UNDER ATTACK':s==='wiped'?'WIPED OUT':s==='lock'?(en.t==='hq'||empActive(gk)?'NOT YET':'AFTER ACT '+EMP_GANGS[gk].act):(gk==='none'?'INDEPENDENT':EMP_GANGS[gk].name)+(en.t==='racket'?' · '+EMP_VENUE[en.x.type].n:'');
   c.font=empFont(6.5*u);const w1=c.measureText(l1).width;c.font=empFont(4.8*u);const w2=c.measureText(l2).width;const top=en.t==='racket'?r*1.4:en.t==='hq'?r*3:r*3.4;
   const bw=Math.max(w1,w2)+12*u,bh=24*u,bx=clamp(x-bw/2,ox+2*u,Math.min(W,ox+mw)-bw-2*u),by=Math.max(2*u,y-top-bh+bob);
   c.fillStyle='rgba(10,4,20,.88)';c.fillRect(bx,by,bw,bh);c.strokeStyle=col;c.lineWidth=1.5*u;c.strokeRect(bx,by,bw,bh);c.fillStyle='#2de2e6';c.fillRect(bx+3*u,by+bh,bw,2*u);
   c.textAlign='left';c.textBaseline='middle';c.font=empFont(6.5*u);c.fillStyle='#fff';c.fillText(l1,bx+6*u,by+8*u);c.font=empFont(4.8*u);c.fillStyle=col;c.fillText(l2,bx+6*u,by+17*u);}}
 /* legend strip: yours, the crews and the free places, in two rows on a narrow map */
 {const items=[['YOURS',EMP_GOLD],...Object.values(EMP_GANGS).map(g=>[g.short,g.col]),['FREE','#9fe8a8']];c.font=empFont(5*u);const wid=it=>c.measureText(it[0]).width+16*u;
  let rows=[items];const all=items.reduce((a,it)=>a+wid(it),0);if(all>mw-8*u)rows=[items.slice(0,4),items.slice(4)];
  c.textAlign='left';c.textBaseline='middle';rows.forEach((row,ri)=>{const tw=row.reduce((a,it)=>a+wid(it),0),lx0=ox+mw/2-tw/2,ly=Math.min(H,oy+mh)-9*u-(rows.length-1-ri)*13*u;
   c.fillStyle='rgba(10,4,20,.78)';c.fillRect(lx0-6*u,ly-6.5*u,tw+6*u,13*u);let lx=lx0;
   for(const [tx,col] of row){c.fillStyle=col;c.shadowColor=col;c.shadowBlur=4*u;c.beginPath();c.arc(lx+3*u,ly,3*u,0,Math.PI*2);c.fill();c.shadowBlur=0;c.fillText(tx,lx+9*u,ly+0.5*u);lx+=wid([tx]);}});}}
function empLoop(t){if(state!=='empire'){EMP_ANIM=0;return;}drawEmpMap(t);EMP_ANIM=requestAnimationFrame(empLoop);}
function empAnim(){if(!EMP_ANIM&&typeof requestAnimationFrame==='function')EMP_ANIM=requestAnimationFrame(empLoop);}
if(typeof document!=='undefined'&&document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{EMP_LAYER=null;});
$('emList').onclick=e=>{const b=e.target.closest('[data-act]');if(b){if(!b.disabled)empAct(+b.dataset.i,b.dataset.act);return;}const cd=e.target.closest('.emC[data-i]');if(cd&&+cd.dataset.i!==EMP_SEL)empSelect(+cd.dataset.i);};
$('emMap').onclick=e=>{const cv=$('emMap'),b=cv.getBoundingClientRect();if(!EMP_RECT||!b.width)return;const s=cv.width/b.width,px=(e.clientX-b.left)*s,py=(e.clientY-b.top)*s;let bi=-1,bd=EMP_RECT.u*18;
 empEntries().forEach((en,i)=>{const x=EMP_RECT.ox+en.at[0]*EMP_RECT.mw,y=EMP_RECT.oy+en.at[1]*EMP_RECT.mh-EMP_RECT.u*(en.t==='racket'?0:10),d=Math.hypot(x-px,y-py);if(d<bd){bd=d;bi=i;}});if(bi>=0)empSelect(bi);};
$('bEmpLeave').onclick=()=>closeEmpire();
$('bCarEmpire').onclick=()=>openEmpire();
/* ---- dressing the rackets' buildings (static, built with the level): a lit sign with the place's name over the door in the colours of
   whoever holds it, an awning and door lights outside, and things on the walls and floor that belong to that kind of building.
   Nothing here has a body: it is all mounted on walls, hung from the ceiling or painted on the floor. ---- */
function empRGB(s,k){const n=parseInt(s.slice(1),16);k=k||1;return [((n>>16)&255)/255*k,((n>>8)&255)/255*k,(n&255)/255*k];}
function drawEmpVenue(B,g){const type=g.def&&g.def.venue;if(!type||!g.front||!g.rows)return;const W=g.W,zW=g.front.zT-1,r=empRunInfo(),gc=empRGB(r&&EMP_GANGS[r.gang]?EMP_GANGS[r.gang].col:'#ff3fa4');
 const free=(x,z)=>x>0&&z>0&&x<W-1&&z<zW&&!g.solid[z*W+x],neon=gc.map(v=>v*1.5),dark=[0.08,0.06,0.1],r0=B.round;B.round=0;
 /* the door gap in the front wall */
 let d0=-1,d1=-1;for(let x=1;x<W-1;x++)if(!g.solid[zW*W+x]){if(d0<0)d0=x;d1=x;}
 if(d0>=0){const cx=(d0+d1+1)/2,zf=zW+1,nm=g.def.name||'',px=Math.min(0.055,5.2/(nm.length*6)),w=nm.length*6*px+0.4,y=WALL_H+0.42;
  B.box(TRS(cx,y,zf-0.02,0,w+0.12,0.6,0.06),neon,true);B.box(TRS(cx,y,zf+0.02,0,w,0.5,0.06),dark);neonText(B,nm,cx,y,zf+0.07,px,neon);
  for(const o of [-w/2+0.1,w/2-0.1])B.box(TRS(cx+o,WALL_H+0.06,zf-0.02,0,0.06,0.14,0.06),[0.25,0.25,0.3]);
  /* awning in two colours over the door, a mat, and a lamp either side */
  const aw=d1-d0+1.8;for(let k=0;k<8;k++)B.box(TRS(cx-aw/2+(k+0.5)*aw/8,WALL_H-0.12,zf+0.32,0,aw/8,0.05,0.66),k%2?[0.92,0.9,0.86]:gc);
  B.box(TRS(cx,0.006,zf+0.45,0,d1-d0+0.6,0.01,0.6),type==='garage'||type==='warehouse'?[0.85,0.7,0.1]:[0.45,0.08,0.14]);
  for(const o of [-(d1-d0+1)/2-0.45,(d1-d0+1)/2+0.45]){B.box(TRS(cx+o,0.82,zf+0.06,0,0.1,0.22,0.1),[1.3,1.1,0.7],true);B.box(TRS(cx+o,0.95,zf+0.06,0,0.16,0.04,0.16),dark);}
  if(!g.evLit){g.evLit=1;g.lights.push({x:cx,y:1.5,z:zf+0.8,r:5,c:gc});}}
 /* the place's own props */
 B.round=0.12;for(let z=1;z<zW;z++)for(let x=1;x<W-1;x++)if(g.furn[z*W+x]===60){const ch=g.rows[z][x];if(ch!=='q'&&ch!=='v')empProp(B,g,x,z,ch);}B.round=0;
 /* wall pieces: on every wall face that looks at the camera, something of the trade */
 const P=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x,y,z,0,sx,sy,sz),c,em);
 const GOODS=[[0.9,0.25,0.2],[0.95,0.8,0.2],[0.2,0.6,0.85],[0.3,0.75,0.4],[0.9,0.5,0.75],[0.95,0.95,0.9]];
 for(let z=1;z<zW-1;z++)for(let x=1;x<W-1;x++){if(!g.solid[z*W+x]||!free(x,z+1)||g.rows[z][x]==='D')continue;const cx=x+0.5,zf=z+1.012,h=hsh(x,z,71),h2=hsh(x,z,72);
  if(type==='shop'){if(h<0.5){for(const y of [0.5,0.82]){P(cx,y,zf+0.05,0.9,0.03,0.12,[0.5,0.36,0.22]);for(let k=0;k<4;k++)P(cx-0.33+k*0.22,y+0.09,zf+0.05,0.13,0.14+hsh(x+k,z,73)*0.08,0.09,GOODS[Math.floor(hsh(x+k,z,74+y*10)*6)]);}}
   else if(h<0.62){P(cx,0.75,zf,0.7,0.42,0.02,[0.95,0.9,0.3]);P(cx,0.75,zf+0.012,0.56,0.08,0.01,[0.8,0.1,0.15]);}}
  else if(type==='garage'){if(h<0.3){P(cx,0.72,zf,0.86,0.5,0.02,[0.5,0.38,0.24]);for(let k=0;k<4;k++)P(cx-0.3+k*0.2,0.72+(hsh(x+k,z,75)-0.5)*0.2,zf+0.02,0.04,0.2+hsh(x+k,z,76)*0.14,0.02,[0.7,0.72,0.76]);}
   else if(h<0.5){for(const o of [-0.22,0.22]){P(cx+o,0.7,zf+0.03,0.36,0.36,0.06,[0.07,0.07,0.08]);P(cx+o,0.7,zf+0.05,0.16,0.16,0.04,[0.6,0.6,0.64]);}}
   else if(h<0.62){P(cx,0.8,zf,0.8,0.26,0.02,[0.95,0.75,0.1]);for(let k=0;k<4;k++)P(cx-0.3+k*0.2,0.8,zf+0.012,0.08,0.26,0.01,dark);}}
  else if(type==='club'){if(h<0.55){P(cx,0.38+h2*0.5,zf+0.02,0.92,0.04,0.03,h2<0.5?[1.6,0.3,1.1]:[0.3,1.4,1.6],true);}
   else if(h<0.7){P(cx,0.62,zf+0.1,0.5,0.7,0.2,[0.06,0.06,0.08]);for(const y of [0.42,0.78])P(cx,y,zf+0.21,0.3,0.26,0.02,[0.2,0.2,0.24]);}
   else if(h<0.8){P(cx,0.75,zf,0.6,0.45,0.02,[1.2,0.9,0.3],true);P(cx,0.75,zf+0.012,0.5,0.35,0.01,[0.5,0.08,0.3]);}}
  else if(type==='warehouse'){if(h<0.25){P(cx,0.85,zf,0.7,0.2,0.02,[0.95,0.75,0.1]);P(cx,0.85,zf+0.012,0.5,0.05,0.01,dark);}
   else if(h<0.4){P(cx,0.55,zf+0.04,0.2,0.4,0.08,[0.8,0.1,0.1]);P(cx,0.8,zf+0.04,0.08,0.1,0.08,[0.2,0.2,0.2]);}
   else if(h<0.52){P(cx,0.7,zf,0.8,0.5,0.02,[0.86,0.84,0.76]);for(let k=0;k<4;k++)P(cx,0.55+k*0.1,zf+0.012,0.64,0.02,0.01,[0.3,0.3,0.35]);}}
  else if(type==='office'){if(h<0.35){P(cx,0.75,zf,0.56,0.42,0.03,[0.75,0.6,0.2]);P(cx,0.75,zf+0.02,0.46,0.32,0.01,GOODS[Math.floor(h2*6)].map(v=>v*0.6));}
   else if(h<0.45){P(cx,0.85,zf+0.02,0.26,0.26,0.03,[0.95,0.95,0.92]);P(cx,0.88,zf+0.04,0.02,0.1,0.01,dark);P(cx+0.04,0.85,zf+0.04,0.08,0.02,0.01,dark);}
   else if(h<0.55){P(cx,0.4,zf+0.12,0.3,0.8,0.24,[0.75,0.82,0.9]);P(cx,0.88,zf+0.12,0.24,0.2,0.2,[0.5,0.75,1.1],true);}}
  else{if(h<0.3){P(cx,0.68,zf,0.5,0.8,0.02,gc);P(cx,0.68,zf+0.012,0.3,0.3,0.01,dark);P(cx,1.1,zf+0.01,0.56,0.04,0.04,[0.75,0.6,0.2]);}
   else if(h<0.45){P(cx,0.82,zf+0.05,0.1,0.2,0.1,[1.3,1.0,0.6],true);}}}
 /* floor and ceiling: oil and bay lines in a garage, lane paint in a warehouse, a runner in an office, hanging lamps everywhere */
 for(let z=2;z<zW-1;z++)for(let x=2;x<W-2;x++){const i=z*W+x;if(g.solid[i]||g.furn[i]||g.rows[z][x]==='D')continue;const h=hsh(x,z,81),cx=x+0.5,cz=z+0.5;
  if(type==='garage'&&h<0.07)floorQuad(B,cx,cz,0.9+h*8,h*90,TUV[47],[1,1,1],0.007);
  if(type==='warehouse'&&x%6===3&&free(x,z-1)&&free(x,z+1))P(cx,0.006,cz,0.08,0.008,1,[0.95,0.75,0.1]);
  if(type==='office'&&z===zW-3)P(cx,0.006,cz,1,0.008,0.8,[0.4,0.08,0.14]);
  if(x%5===2&&z%4===2&&free(x-1,z)&&free(x+1,z)&&free(x,z-1)&&free(x,z+1)&&type!=='club'){P(cx,WALL_H+0.5,cz,0.02,0.9,0.02,dark);P(cx,WALL_H+0.02,cz,0.34,0.07,0.34,type==='office'?[0.9,0.9,0.86]:[0.2,0.4,0.3]);P(cx,WALL_H-0.03,cz,0.2,0.03,0.2,[1.4,1.2,0.8],true);}}
 B.round=r0;}
/* ---- the props of the rackets' own buildings (EMP_PROP glyphs in missions.js; every one stands on a solid furn-60 cell).
   empProp draws one cell's prop into the static batch; two-cell props (boats o+q, vehicles c+v) are drawn from their first cell. ---- */
const EMP_PAL=[[0.9,0.25,0.2],[0.95,0.8,0.2],[0.2,0.6,0.85],[0.3,0.75,0.4],[0.9,0.5,0.75],[0.95,0.95,0.9],[0.55,0.3,0.75],[0.95,0.55,0.15]];
function empProp(B,g,x,z,ch){const cx=x+0.5,cz=z+0.5,h=hsh(x,z,91),h2=hsh(x,z,92),col=EMP_PAL[Math.floor(h*8)%8],col2=EMP_PAL[Math.floor(h2*8)%8];
 const P=(X,y,Z,sx,sy,sz,c,em,ry)=>B.box(TRS(cx+X,y,cz+Z,ry||0,sx,sy,sz),c,em);
 const WOOD=[0.45,0.3,0.17],DWOOD=[0.26,0.16,0.09],STEEL=[0.62,0.64,0.7],DARK=[0.09,0.08,0.11],WHITE=[0.93,0.93,0.9],GLASS=[0.55,0.8,0.95],RUST=[0.5,0.26,0.12],CONC=[0.6,0.6,0.62];
 switch(ch){
 case 'a':P(0,0.04,0,0.74,0.08,1,[0.78,0.58,0.32]);P(0,0.082,0,0.04,0.004,1,[0.5,0.32,0.15]);for(const s of [-0.43,0.43])P(s,0.03,0,0.12,0.06,1,DARK);break;
 case 'e':P(0,0.04,0.2,0.74,0.08,0.6,[0.78,0.58,0.32]);P(0,0.5,-0.3,0.98,1.0,0.4,[0.16,0.1,0.22]);P(0,0.86,-0.09,0.9,0.14,0.03,[1.5,0.4,1.1],true);
  for(const [px,pz] of [[0,0.38],[-0.12,0.26],[0.12,0.26],[-0.24,0.14],[0,0.14],[0.24,0.14]]){P(px,0.19,pz,0.07,0.22,0.07,WHITE);P(px,0.24,pz,0.075,0.03,0.075,[0.85,0.1,0.1]);}break;
 case 'j':P(0,0.5,-0.42,0.8,1.0,0.1,[0.95,0.6,0.8]);P(0,0.72,-0.36,0.56,0.46,0.02,GLASS,true);P(0,0.42,-0.26,0.8,0.05,0.24,WHITE);for(let k=0;k<4;k++)P(-0.27+k*0.18,0.5,-0.26,0.05,0.12,0.05,EMP_PAL[(k+Math.floor(h*8))%8]);
  P(0,0.28,0.14,0.42,0.1,0.42,[0.9,0.3,0.6]);P(0,0.52,0.33,0.42,0.42,0.08,[0.9,0.3,0.6]);P(0,0.12,0.14,0.1,0.24,0.1,STEEL);break;
 case 'l':for(const [px,pz] of [[-0.46,-0.46],[0.46,-0.46],[-0.46,0.46],[0.46,0.46]])P(px,0.6,pz,0.05,1.2,0.05,WHITE);for(let k=0;k<6;k++)P(-0.42+k*0.168,1.22,0,0.168,0.05,1.04,k%2?WHITE:col);
  P(0,0.16,0,0.5,0.08,0.86,WOOD);P(0,0.24,0,0.46,0.08,0.82,col2);P(0,0.34,-0.3,0.46,0.14,0.22,col2);break;
 case 'n':P(0,0.5,-0.3,0.9,0.05,0.05,WOOD);for(const s of [-0.44,0.44])P(s,0.3,-0.3,0.05,0.6,0.05,WOOD);for(let k=0;k<3;k++){const c=EMP_PAL[(k*3+Math.floor(h*8))%8];B.box(A.mul(TRS(cx-0.28+k*0.28,0.62,cz-0.12,0,1,1,1),A.mul(A.RX(-0.28),A.S(0.2,1.24,0.05))),c);B.box(A.mul(TRS(cx-0.28+k*0.28,0.62,cz-0.09,0,1,1,1),A.mul(A.RX(-0.28),A.S(0.04,1.2,0.05))),WHITE);}break;
 case 'o':{const X=0.5;for(const s of [-0.55,0.55]){P(X+s,0.14,0,0.08,0.28,0.7,RUST);}P(X,0.42,0,1.7,0.3,0.62,WHITE);P(X+0.9,0.44,0,0.26,0.24,0.4,WHITE);P(X+1.03,0.46,0,0.12,0.18,0.2,WHITE);P(X,0.34,0,1.72,0.06,0.64,col);
  P(X,0.585,0,1.56,0.03,0.5,[0.55,0.33,0.16]);P(X+0.2,0.7,0,0.05,0.2,0.46,GLASS,true);P(X-0.3,0.66,0,0.5,0.12,0.4,WHITE);P(X-0.86,0.5,0,0.1,0.3,0.24,DARK);break;}
 case 'c':{const v=g.def.veh,X=0.5;if(v==='taxi'){drawCarShapeRaw(B,cx+X,cz,0.56,0,'sedan',{col:[0.95,0.75,0.1]},0);P(X,0.86,0,0.24,0.08,0.12,[1.4,1.2,0.5],true);P(X,0.4,0.335,0.7,0.06,0.01,DARK);}
  else if(v==='truck'){drawCarShapeRaw(B,cx+X,cz,0.6,0,'van',{col:[0.42,0.46,0.52]},0);P(X-0.1,0.5,0.375,0.9,0.1,0.01,[0.2,0.4,0.85]);P(X-0.1,0.5,-0.375,0.9,0.1,0.01,[0.2,0.4,0.85]);P(X-0.2,1.0,0,0.2,0.06,0.2,STEEL);}
  else if(v==='dozer'){drawCarShapeRaw(B,cx+X,cz,0.56,0,'pickup',{col:[0.95,0.7,0.08]},0);P(X+1.08,0.28,0,0.08,0.5,1.0,STEEL);P(X+1.0,0.2,0,0.2,0.08,0.7,DARK);P(X-0.2,0.98,0,0.5,0.06,0.5,[0.95,0.7,0.08]);}
  else if(v==='mixer'){drawCarShapeRaw(B,cx+X,cz,0.56,0,'pickup',{col:WHITE},0);B.box(A.mul(TRS(cx+X-0.36,0.9,cz,0,1,1,1),A.mul(A.RZ?A.RZ(0.25):A.RY(0),A.S(0.86,0.56,0.56))),[0.85,0.3,0.15]);P(X-0.36,0.9,0,0.2,0.6,0.6,WHITE);}
  else drawCarShapeRaw(B,cx+X,cz,0.56,0,['sedan','wagon','hatch','coupe'][Math.floor(h*4)%4],{col},0);break;}
 case 't':P(0,0.3,0,0.94,0.6,0.7,DWOOD);P(0,0.72,0,0.9,0.24,0.66,GLASS,true);P(0,0.86,0,0.94,0.03,0.7,[0.75,0.6,0.2]);for(let k=0;k<3;k++)P(-0.28+k*0.28,0.66,0,0.14,0.08,0.2,EMP_PAL[(k*2+Math.floor(h*8))%8]);break;
 case 'y':P(0,0.6,-0.1,0.94,1.2,0.6,WHITE);P(0,0.62,0.21,0.8,1.0,0.02,[0.5,0.8,1.2],true);for(let r=0;r<3;r++)for(let k=0;k<4;k++)P(-0.27+k*0.18,0.3+r*0.32,0.19,0.1,0.18,0.06,EMP_PAL[(k+r*3+Math.floor(h*8))%8]);P(0,1.14,0.21,0.8,0.1,0.03,[1.3,0.3,0.3],true);break;
 case 'z':P(0,0.2,0,0.84,0.4,0.84,WOOD);P(0,0.41,0,0.74,0.04,0.74,col);if(h<0.6){P(0.08,0.6,-0.06,0.6,0.36,0.6,[0.52,0.36,0.2],false,0.3);P(0.08,0.79,-0.06,0.5,0.04,0.5,col2,false,0.3);}for(const s of [-0.3,0.3])P(s,0.2,0.425,0.06,0.4,0.01,DWOOD);break;
 case 'I':P(0,0.42,0,1,0.84,0.5,DWOOD);P(0,0.86,0,1,0.05,0.62,[0.85,0.83,0.78]);P(0,1.22,0,1,0.7,0.04,[0.5,0.8,1.0],true);P(0,1.59,0,1,0.06,0.1,[0.75,0.6,0.2]);for(const s of [-0.48,0.48])P(s,1.22,0,0.05,0.74,0.08,[0.75,0.6,0.2]);P(0,0.93,0.02,0.3,0.06,0.2,DARK);break;
 case 'N':P(0,0.85,-0.2,1.0,1.7,0.5,[0.36,0.38,0.44]);P(0,0.8,0.1,0.82,1.4,0.16,STEEL);P(0,0.8,0.2,0.4,0.4,0.06,[0.8,0.82,0.86]);for(let k=0;k<4;k++)P(0,0.8,0.25,0.5,0.05,0.04,[0.75,0.6,0.2],false,0);
  P(0,0.8,0.25,0.05,0.5,0.04,[0.75,0.6,0.2]);for(const s of [-0.36,0.36])for(const y of [0.3,1.3])P(s,y,0.19,0.08,0.08,0.04,DARK);break;
 case 'Y':P(0,0.5,0,0.94,0.06,0.6,WOOD);for(const [px,pz] of [[-0.42,-0.25],[0.42,-0.25],[-0.42,0.25],[0.42,0.25]])P(px,0.24,pz,0.05,0.48,0.05,STEEL);P(-0.15,0.62,-0.05,0.36,0.2,0.16,WHITE);P(-0.3,0.72,-0.05,0.08,0.2,0.16,WHITE);P(-0.02,0.58,0.02,0.04,0.12,0.04,STEEL);
  P(0.22,0.545,0.05,0.4,0.03,0.44,col);P(0.3,0.6,-0.2,0.1,0.14,0.1,col2);break;
 case '!':for(const s of [-0.46,0.46])P(s,0.55,0,0.04,1.1,0.4,STEEL);P(0,1.08,0,0.96,0.04,0.04,STEEL);for(let k=0;k<7;k++){const c=EMP_PAL[(k*3+Math.floor(h*8))%8];P(-0.39+k*0.13,0.72,0,0.07,0.66,0.34,c);P(-0.39+k*0.13,1.03,0,0.03,0.08,0.03,DARK);}break;
 case '$':P(0,0.46,0,0.9,0.06,0.7,DWOOD);for(const [px,pz] of [[-0.4,-0.3],[0.4,-0.3],[-0.4,0.3],[0.4,0.3]])P(px,0.22,pz,0.06,0.44,0.06,DWOOD);P(-0.2,0.5,0,0.4,0.02,0.5,[0.42,0.3,0.12]);for(let k=0;k<5;k++)P(0.2,0.51,-0.2+k*0.1,0.3,0.035,0.045,[0.36,0.2,0.08]);P(0.3,0.54,0.26,0.24,0.08,0.14,[0.75,0.6,0.2]);break;
 case '&':for(const [px,pz,n] of [[-0.22,-0.2,3],[0.24,-0.16,2],[0,0.26,h<0.5?4:2]])for(let k=0;k<n;k++){P(px,0.09+k*0.17,pz,0.46,0.16,0.46,[0.07,0.07,0.08],false,k*0.4);P(px,0.09+k*0.17,pz,0.2,0.165,0.2,[0.3,0.3,0.33]);}break;
 case '+':P(0,0.16,0,0.9,0.32,0.86,CONC,false,h*3);P(0.12,0.4,-0.1,0.56,0.3,0.5,[0.5,0.5,0.53],false,h2*3);P(-0.2,0.34,0.22,0.36,0.22,0.3,[0.66,0.4,0.3],false,h*5);B.box(A.mul(TRS(cx+0.1,0.6,cz,h*6,1,1,1),A.mul(A.RX(0.9),A.S(0.03,0.9,0.03))),RUST);if(h2<0.5)P(0.3,0.12,0.3,0.3,0.12,0.2,[0.7,0.34,0.22],false,1);break;
 case '?':P(0,1.15,0,0.9,2.3,0.9,[0.72,0.73,0.76]);P(0,1.15,0,0.94,0.14,0.94,[0.85,0.3,0.15]);P(0,2.36,0,0.6,0.14,0.6,[0.6,0.6,0.64]);P(0,0.2,0.47,0.3,0.4,0.06,DARK);P(0.4,1.2,0.47,0.05,2.2,0.05,STEEL);break;
 case '<':P(0,0.03,0,0.5,0.06,0.5,STEEL);P(0,0.7,0,0.1,1.4,0.1,STEEL);for(let k=0;k<6;k++)P(0,0.2+k*0.2,0,0.5,0.17,0.5,k%2?[0.2,0.45,0.95]:[0.92,0.2,0.3],false,k*0.5+h*3);P(0,1.42,0,0.3,0.06,0.3,DARK);break;
 case '>':P(0,0.04,0,0.7,0.08,0.5,CONC);P(0,0.55,0,0.44,0.94,0.3,[0.85,0.12,0.14]);P(0,0.82,0.155,0.32,0.26,0.01,WHITE);P(0,1.08,0,0.5,0.14,0.34,WHITE);P(0,1.2,0,0.3,0.12,0.3,[1.3,1.1,0.6],true);P(0.25,0.5,0.1,0.04,0.5,0.04,DARK);break;
 case '^':P(0,0.42,0.1,1,0.84,0.6,DARK);P(0,0.86,0.1,1,0.04,0.66,[0.2,0.18,0.26]);P(0,0.5,0.41,1,0.08,0.02,[1.6,0.3,1.1],true);P(0,0.25,0.41,1,0.05,0.02,[0.3,1.4,1.6],true);P(0,0.9,0.1,0.44,0.03,0.44,[0.05,0.05,0.06]);P(0,0.92,0.1,0.12,0.03,0.12,col);P(0,0.9,-0.4,0.9,1.5,0.18,[0.07,0.07,0.09]);for(const y of [0.5,1.1])P(0,y,-0.3,0.5,0.44,0.02,[0.22,0.22,0.26]);break;
 case ';':P(0,0.55,-0.1,0.9,1.1,0.08,STEEL);for(let r=0;r<3;r++){P(0,0.2+r*0.34,0.02,0.9,0.03,0.26,STEEL);for(let k=0;k<4;k++)B.box(A.mul(TRS(cx-0.32+k*0.21,0.33+r*0.34,cz+0.02,0,1,1,1),A.mul(A.RX(-0.3),A.S(0.18,0.24,0.02))),EMP_PAL[(k+r*5+Math.floor(h*8))%8]);}break;
 case '(':for(let k=0;k<(h<0.4?3:2);k++){const c=k===1?col2:col,y=0.2+k*0.38;P(0,y,0,1.0,0.3,0.86,c.map(v=>v*0.55+0.12),false,(k-1)*0.08);P(-0.05,y+0.17,0,0.5,0.08,0.7,[0.2,0.24,0.3],false,(k-1)*0.08);P(0.4,y-0.02,0,0.2,0.2,0.88,RUST,false,(k-1)*0.08);}break;
 case ')':P(0,0.06,0,0.94,0.1,0.9,WOOD);for(let k=0;k<3;k++)for(const s of [-0.22,0.22])P(s+(k%2?0.03:-0.03),0.2+k*0.18,0,0.42,0.17,0.8,k%2?[0.82,0.78,0.68]:[0.76,0.72,0.62]);P(0,0.2,0.41,0.3,0.1,0.01,[0.8,0.25,0.15]);break;
 case '{':P(0,0.45,0,1,0.9,0.7,DWOOD);P(0,0.92,0,1,0.05,0.78,[0.86,0.84,0.8]);if(h<0.4){P(0,1.12,-0.1,0.5,0.36,0.34,[0.8,0.82,0.86]);P(0,1.32,-0.1,0.54,0.05,0.38,[0.8,0.15,0.15]);P(0,1.0,0.1,0.34,0.03,0.14,DARK);}else for(let k=0;k<3;k++){P(-0.26+k*0.26,0.99,0.1,0.1,0.09,0.1,WHITE);P(-0.26+k*0.26,0.96,0.1,0.18,0.015,0.18,WHITE);}break;
 case '}':P(0,0.5,0,0.7,0.05,0.7,[0.2,0.5,0.35]);P(0,0.25,0,0.1,0.5,0.1,DWOOD);for(let k=0;k<6;k++)P(-0.2+(k%3)*0.2,0.535,k<3?-0.08:0.1,0.08,0.02,0.15,WHITE,false,k*0.7);for(const s of [-0.5,0.5]){P(s*0.9,0.28,0.38*Math.sign(s),0.26,0.05,0.26,WOOD);P(s*0.9,0.14,0.38*Math.sign(s),0.06,0.28,0.06,DARK);}break;
 case '[':P(0,0.65,-0.12,0.96,1.3,0.56,DWOOD);P(0,0.72,0.17,0.8,1.0,0.02,[0.9,0.75,0.4],true);for(let r=0;r<4;r++)for(let k=0;k<3;k++)P(-0.25+k*0.25,0.34+r*0.26,0.15,0.2,0.1,0.06,r%2?[0.5,0.3,0.12]:[0.7,0.5,0.2]);P(0,1.32,-0.12,1,0.06,0.6,[0.75,0.6,0.2]);break;
 case ']':P(0,0.3,-0.2,0.96,0.6,0.5,DWOOD);if(h<0.5){B.box(A.mul(TRS(cx,0.95,cz-0.3,0,1,1,1),A.mul(A.RX(0.15),A.S(0.08,0.8,0.04))),WOOD);P(0,0.74,-0.24,0.3,0.36,0.08,col);P(0,0.74,-0.19,0.1,0.1,0.02,DARK);}else{P(0,0.86,-0.2,0.6,0.5,0.44,[0.3,0.2,0.12]);P(0,0.88,0.03,0.46,0.36,0.02,[0.5,0.8,1.1],true);P(0.2,1.2,-0.2,0.02,0.3,0.02,STEEL);}break;
 default:break;}}
