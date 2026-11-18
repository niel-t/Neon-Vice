'use strict';
/* ================= EMPIRE: TAKE OVER MIAMI =================
   A crime-empire mode that opens once McWey's loan is square (the Royal Flush, floor c7, is done). Three crews carve up Miami:
   the Coral Snakes, Los Rayos and the Ivory Hand. The car menu opens THE EMPIRE, a map of seven districts:
   - RACKETS (EMP_RACKETS, here): small businesses you shake down from the map. Talk, lean on the owner or trash the place:
     the harder you push the surer it is, and the angrier the crew that ran it gets (heat). A failed pitch waits for the next job.
   - FRONTS (EMP_FRONTS, missions e_<k> in missions.js): the big places, taken in a job on that floor's map against the crew in
     its colours and its lieutenant. Own one and buy GUARDS (rivals' raids fail more often) and EXPANSIONS (it pays more).
   - HQs (EMP_HQ, missions hq_<g>): once a crew holds no fronts, hit its headquarters and kill its boss. The crew is wiped out:
     its rackets go independent (easy to shake down) and it never raids you again.
   - HEAT and RAIDS: after every finished job each living crew may hit one of your businesses, likelier the hotter it is. Guards
     can stop a raid on a front; otherwise the front is UNDER ATTACK: defend it (its job again) before your next job is done, or the
     crew takes it. A raided racket is simply lost half the time.
   - INCOME after every job: rackets, fronts (+50% per expansion), +25% for every district you own whole, +25% on everything once
     the whole city is yours and all three crews are gone (KING OF MIAMI). RESPECT (rackets + 2 per front + 5 per crew wiped) gives
     you a title and better odds on shakedowns.
   Ownership of fronts is the reward flag own_<k>, a wiped crew is wiped_<g> (both in wflags); the rest lives in p.emp. */
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
   look:()=>({skin:hex(0xf0c8a0),jacket:hex(0xf4f4f4),shirt:hex(0x101010),pants:hex(0x101010),shoes:hex(0x101010),hair:hex(0xc8c0b0),hs:'slick',watch:true,bw:1.15,bd:1.1,bh:1.02})}}};
const EMP_DIST={sobe:'SOUTH BEACH',midb:'MID-BEACH',dtwn:'DOWNTOWN',brk:'BRICKELL',lhav:'LITTLE HAVANA',wyn:'WYNWOOD',grove:'COCONUT GROVE'};
/* hard 1-3 lowers the shakedown odds */
const EMP_RACKETS=[
 {k:'nails',dist:'sobe',name:'NEON NAILS',gang:'snakes',pay:400,hard:1,at:[0.845,0.71]},
 {k:'cabana',dist:'sobe',name:'CABANA RENTALS',gang:'rayos',pay:500,hard:1,at:[0.855,0.6]},
 {k:'bowl',dist:'midb',name:'SURFSIDE BOWL-O-RAMA',gang:'snakes',pay:600,hard:2,at:[0.83,0.24]},
 {k:'pawn',dist:'midb',name:'COLLINS AVE PAWN',gang:'rayos',pay:700,hard:2,at:[0.855,0.45]},
 {k:'taxi',dist:'dtwn',name:'BAYFRONT TAXI CO.',gang:'rayos',pay:800,hard:2,at:[0.555,0.4]},
 {k:'news',dist:'dtwn',name:'BISCAYNE NEWSSTAND',gang:'ivory',pay:300,hard:1,at:[0.53,0.35]},
 {k:'wash',dist:'brk',name:'BRICKELL CAR WASH',gang:'ivory',pay:600,hard:1,at:[0.49,0.655]},
 {k:'cash',dist:'brk',name:'BRICKELL CHECK CASHING',gang:'ivory',pay:1000,hard:3,at:[0.56,0.54]},
 {k:'cigar',dist:'lhav',name:'CALLE OCHO CIGARS',gang:'rayos',pay:500,hard:1,at:[0.27,0.48]},
 {k:'bodega',dist:'lhav',name:'DOMINO PARK BODEGA',gang:'rayos',pay:400,hard:1,at:[0.2,0.55]},
 {k:'cafe',dist:'lhav',name:'LA PALMA CAFECITO',gang:'rayos',pay:300,hard:1,at:[0.31,0.63]},
 {k:'garment',dist:'wyn',name:'NORTHSIDE GARMENT CO.',gang:'ivory',pay:700,hard:2,at:[0.39,0.26]},
 {k:'junk',dist:'wyn',name:'WYNWOOD JUNKYARD',gang:'snakes',pay:500,hard:1,at:[0.53,0.25]},
 {k:'chandler',dist:'grove',name:'GROVE YACHT CHANDLERY',gang:'ivory',pay:900,hard:2,at:[0.47,0.87]},
 {k:'disco',dist:'grove',name:'MAYFAIR DISCO',gang:'ivory',pay:1100,hard:3,at:[0.37,0.76]}];
const EMP_GOLD='#ffd36b',EMP_GUARD=[2500,6000,12000],EMP_HOW={talk:{n:'TALK',p:0.35,heat:4},lean:{n:'LEAN ON HIM',p:0.6,heat:10,fail:10},trash:{n:'TRASH THE PLACE',p:1,heat:25}};
const EMP_TITLES=[[0,'STREET HUSTLER'],[3,'EARNER'],[8,'CAPTAIN'],[15,'UNDERBOSS'],[24,'BOSS']];
let EMP_ROLL=null; // tests fix the dice
const empDice=()=>typeof EMP_ROLL==='number'?EMP_ROLL:Math.random();
const empFront=k=>EMP_FRONTS.find(f=>f.k===k)||null;
const empRacket=k=>EMP_RACKETS.find(r=>r.k===k)||null;
const empMission=f=>'e_'+f.k;
const empOpen=()=>missionDone('c7');
function empSave(p){p=p||myProg();const e=p.emp&&typeof p.emp==='object'?p.emp:(p.emp={});
 for(const [k,v] of [['heat',{}],['hold',{}],['raid',{}],['up',{}],['rk',{}],['tried',{}]])if(!e[k]||typeof e[k]!=='object')e[k]=v;if(!Number.isFinite(e.day))e.day=0;
 for(const g in EMP_GANGS)if(!Number.isFinite(e.heat[g]))e.heat[g]=0;return e;}
const empFlag=(p,f)=>{const w=p&&p.wflags;return !!(w&&ownKey(w,f)&&w[f]);};
function empOwns(f,p){p=p||myProg();return empFlag(p,'own_'+f.k);}
const empOwnsR=(r,p)=>!!empSave(p).rk[r.k];
const empWiped=(g,p)=>empFlag(p||myProg(),'wiped_'+g);
const empOwned=p=>EMP_FRONTS.filter(f=>empOwns(f,p));
const empRackets=p=>EMP_RACKETS.filter(r=>empOwnsR(r,p));
/* who runs a place you don't own: a crew that raided it away from you, else the crew that started with it; 'none' once that crew is gone */
function empHolder(x,p){p=p||myProg();const e=empSave(p),g=ownKey(e.hold,x.k)?e.hold[x.k]:x.gang;return g!=='none'&&EMP_GANGS[g]&&!empWiped(g,p)?g:'none';}
const empRaid=(f,p)=>{const e=empSave(p),r=e.raid[f.k];return r&&EMP_GANGS[r.g]&&empOwns(f,p)?r:null;};
const empUnlocked=f=>missionUnlocked(empMission(f),missionCtx());
const empHqOpen=h=>missionUnlocked('hq_'+h.g,missionCtx());
const empCrewFronts=(g,p)=>EMP_FRONTS.filter(f=>!empOwns(f,p)&&empHolder(f,p)===g);
const empCrewRackets=(g,p)=>EMP_RACKETS.filter(r=>!empOwnsR(r,p)&&empHolder(r,p)===g);
function empRespect(p){p=p||myProg();return empRackets(p).length+2*empOwned(p).length+5*Object.keys(EMP_GANGS).filter(g=>empWiped(g,p)).length;}
const empKing=p=>empOwned(p).length===EMP_FRONTS.length&&empRackets(p).length===EMP_RACKETS.length&&Object.keys(EMP_GANGS).every(g=>empWiped(g,p));
function empTitle(p){if(empKing(p))return 'KING OF MIAMI';const r=empRespect(p);let t=EMP_TITLES[0][1];for(const [n,s] of EMP_TITLES)if(r>=n)t=s;return t;}
const empRank=p=>{const r=empRespect(p);return EMP_TITLES.filter(([n])=>r>=n).length-1;};
const empFrontPay=(f,p)=>Math.round(f.pay*(1+0.5*((empSave(p).up[f.k]||{}).x|0)));
function empDistOwned(d,p){return EMP_FRONTS.filter(f=>f.dist===d).every(f=>empOwns(f,p)&&!empRaid(f,p))&&EMP_RACKETS.filter(r=>r.dist===d).every(r=>empOwnsR(r,p));}
function empIncome(p){p=p||myProg();let tot=0;
 for(const d in EMP_DIST){let s=0;for(const f of EMP_FRONTS)if(f.dist===d&&empOwns(f,p)&&!empRaid(f,p))s+=empFrontPay(f,p);for(const r of EMP_RACKETS)if(r.dist===d&&empOwnsR(r,p))s+=r.pay;tot+=empDistOwned(d,p)?s*1.25:s;}
 return Math.round(empKing(p)?tot*1.25:tot);}
/* what a running empire mission is: a front (taken or defended) or a crew HQ */
function empRunInfo(){const m=typeof MISSION==='string'&&missionKnown(MISSION)&&MISSIONS[MISSION];if(!m||m.kind!=='empire')return null;const p=myProg();
 if(m.hq){const h=EMP_HQ.find(q=>q.g===m.hq);return h?{hq:h,gang:h.g,base:h.base,boss:EMP_GANGS[h.g].boss}:null;}
 const f=empFront(m.front);if(!f)return null;const r=empRaid(f,p),g=r?r.g:empHolder(f,p);return {f,gang:g==='none'?f.gang:g,base:f.base,defend:!!r,boss:EMP_GANGS[g==='none'?f.gang:g].lt};}
const empRun=()=>{const i=empRunInfo();return i&&i.f||null;};
/* news to show once you are home again */
let EMP_NEWS=[];
const empNote=(a,b)=>EMP_NEWS.push([a,b]);
/* after every finished job (payout): unanswered raids are lost, the empire pays, heat cools, and the crews may strike again */
function empPay(p){const e=empSave(p),run=empRunInfo(),cur=run&&run.f?run.f.k:null;e.day++;
 for(const f of EMP_FRONTS){const r=e.raid[f.k];if(!r)continue;if(!empOwns(f,p)||!EMP_GANGS[r.g]||empWiped(r.g,p)){delete e.raid[f.k];continue;}if(f.k===cur||r.d>=e.day)continue;
  delete e.raid[f.k];delete dlgObj(p,'wflags')['own_'+f.k];e.hold[f.k]=r.g;e.heat[r.g]=Math.max(0,e.heat[r.g]-15);empNote(EMP_GANGS[r.g].short+' TOOK '+f.name,'You did not come back to defend it. Take it back from the Empire map');}
 const inc=empIncome(p);if(inc>0){p.wallet+=inc;p.empTot=(p.empTot||0)+inc;empNote('YOUR EMPIRE PAID +$'+fmt(inc),empTitle(p)+' · '+empOwned(p).length+' fronts · '+empRackets(p).length+' rackets');}
 for(const g in EMP_GANGS){if(empWiped(g,p)){e.heat[g]=0;continue;}e.heat[g]=Math.max(0,e.heat[g]-8);
  if(Object.values(e.raid).some(r=>r&&r.g===g))continue;
  const mine=[...empOwned(p).filter(f=>!e.raid[f.k]&&f.k!==cur).map(f=>({f})),...empRackets(p).map(r=>({r}))];if(!mine.length)continue;
  if(empDice()>=Math.min(0.4,e.heat[g]/250))continue;
  const t=mine[Math.floor(empDice()*mine.length)%mine.length],gg=EMP_GANGS[g];
  if(t.r){if(empDice()<0.5){delete e.rk[t.r.k];e.hold[t.r.k]=g;empNote(gg.short+' TOOK '+t.r.name,'They walked in and the owner pays them now. Shake him down again');}else empNote(gg.short+' HIT '+t.r.name,'The owner held his nerve. It is still yours');continue;}
  const lv=(e.up[t.f.k]||{}).g|0;if(lv&&empDice()<0.3*lv){empNote('YOUR GUARDS HELD '+t.f.name,gg.short+' tried it and ran');continue;}
  e.raid[t.f.k]={g,d:e.day};empNote(gg.short+' ARE HITTING '+t.f.name,'Defend it from the Empire map before your next job is done, or it is theirs');}
 return inc;}
/* payout() after an empire job: the reward flag (own_<k> or wiped_<g>) is already set */
function empTaken(p,k){const e=empSave(p),m=MISSIONS[MISSION]||{};
 if(m.hq){const g=m.hq,gg=EMP_GANGS[g];for(const r of EMP_RACKETS)if(!empOwnsR(r,p)&&empHolder(r,p)==='none'&&(ownKey(e.hold,r.k)?e.hold[r.k]:r.gang)===g)e.hold[r.k]='none';e.heat[g]=0;
  for(const f of EMP_FRONTS)if(e.raid[f.k]&&e.raid[f.k].g===g)delete e.raid[f.k];empNote(gg.name+' ARE FINISHED','Their rackets have nobody behind them now · respect +5');return empCrown(p);}
 const f=empFront(k);if(!f)return;const r=e.raid[f.k];
 if(r){delete e.raid[f.k];e.heat[r.g]=Math.min(100,e.heat[r.g]+10);empNote('YOU HELD '+f.name,EMP_GANGS[r.g].short+' will think twice');return;}
 const was=ownKey(e.hold,f.k)?e.hold[f.k]:f.gang;delete e.hold[f.k];if(EMP_GANGS[was])e.heat[was]=Math.min(100,e.heat[was]+30);
 empNote(f.name+' IS YOURS','+$'+fmt(empFrontPay(f,p))+' after every job · buy guards before they come back');empCrown(p);}
function empCrown(p){if(empKing(p)){const w=dlgObj(p,'wflags');if(!w.king_miami){w.king_miami=1;empNote('KING OF MIAMI','The whole city is yours · everything pays 25% more');}}}
function empNews(){if(!EMP_NEWS.length)return;const n=EMP_NEWS.splice(0);let i=0;const next=()=>{if(i>=n.length)return;const b=n[i++];banner(b[0],b[1]);sfx('cash');if(i<n.length)setTimeout(next,3200);};setTimeout(next,2400);}
/* thugs on an empire job wear their crew's colours (makeEnemy calls this before building the model) */
function turfLook(L){const r=empRunInfo();if(!r||levelIdx!==r.base)return;delete L.torsoTile;L.apron=false;L.tee=false;EMP_GANGS[r.gang].look(L);}
/* applyTwist 'turf': the lieutenant (or at an HQ the crew boss, in place of the floor's own boss) waits at the far end */
function turfSetup(g){const r=empRunInfo();if(!r)return;const p=g.player;
 if(r.hq){for(const e of g.enemies)if(e.boss){e.alive=false;e.sunk=true;}g.enemies=g.enemies.filter(e=>e.alive);g.boss=null;}
 g.turf={k:r.f?r.f.k:'hq_'+r.gang,gang:r.gang,boss:r.boss,defend:r.defend,hq:!!r.hq};
 let best=null,bd=0;for(let z=1;z<g.H-1;z++)for(let x=1;x<g.W-1;x++){const i=z*g.W+x;if(g.solid[i]||isOut(g,x,z)||g.furn[i])continue;const d=Math.hypot(x+0.5-p.x,z+0.5-p.z);if(d>bd){bd=d;best=[x+0.5,z+0.5];}}
 if(best)makeEnemy(g,{boss:r.boss},levelIdx,r.boss.weapon,true,best[0],best[1]);}
/* shaking down a racket from the map */
function empOdds(r,how,p){const H=EMP_HOW[how];if(H.p>=1)return 1;return clamp(H.p+0.05*empRank(p)-0.1*(r.hard-1)+(empHolder(r,p)==='none'?0.25:0),0.05,0.95);}
const empTried=(r,p)=>{const e=empSave(p);return e.tried[r.k]===e.day;};
function empShake(k,how){const p=myProg(),r=empRacket(k),H=EMP_HOW[how],e=empSave(p);if(!r||!H)return null;if(empOwnsR(r,p))return 'own';if(empTried(r,p))return 'wait';
 const g=empHolder(r,p),ok=empDice()<empOdds(r,how,p);
 if(ok){e.rk[r.k]=1;delete e.hold[r.k];if(EMP_GANGS[g])e.heat[g]=Math.min(100,e.heat[g]+H.heat);empCrown(p);}
 else{e.tried[r.k]=e.day;if(H.fail&&EMP_GANGS[g])e.heat[g]=Math.min(100,e.heat[g]+H.fail);}
 saveProg();return ok?'ok':'fail';}
/* upgrades on an owned front: guards 0-3, expansion 0-2 */
function empUpCost(f,kind,p){const u=empSave(p).up[f.k]||{};if(kind==='g')return (u.g|0)<3?EMP_GUARD[u.g|0]:null;return (u.x|0)<2?f.pay*((u.x|0)?8:4):null;}
function empUpgrade(k,kind){const p=myProg(),f=empFront(k),e=empSave(p);if(!f||!empOwns(f,p))return 'no';const c=empUpCost(f,kind,p);if(c==null)return 'max';if(p.wallet<c)return 'poor';
 p.wallet-=c;const u=e.up[f.k]||(e.up[f.k]={});u[kind]=(u[kind]|0)+1;saveProg();return 'ok';}

/* ---- THE EMPIRE screen (car menu, E / pad BACK): the map on the left, the crews and the districts on the right ---- */
let EMP_SEL=0,EMP_ENT=null;
function empEntries(){if(!EMP_ENT){EMP_ENT=EMP_HQ.map(h=>({t:'hq',h,k:'hq_'+h.g,at:h.at,name:h.name}));
 for(const d in EMP_DIST){for(const f of EMP_FRONTS)if(f.dist===d)EMP_ENT.push({t:'front',f,k:f.k,at:f.at,name:f.name,d});for(const r of EMP_RACKETS)if(r.dist===d)EMP_ENT.push({t:'racket',r,k:r.k,at:r.at,name:r.name,d});}}return EMP_ENT;}
/* the state of an entry: own | raid | open | lock | wait | wiped */
function empEntState(en,p){p=p||myProg();
 if(en.t==='hq'){if(empWiped(en.h.g,p))return 'wiped';return empHqOpen(en.h)&&!empCrewFronts(en.h.g,p).length?'open':'lock';}
 if(en.t==='front'){const f=en.f;if(empOwns(f,p))return empRaid(f,p)?'raid':'own';return empUnlocked(f)?'open':'lock';}
 const r=en.r;if(empOwnsR(r,p))return 'own';return empTried(r,p)?'wait':'open';}
function empCol(en,p){const s=empEntState(en,p);if(s==='own')return EMP_GOLD;if(s==='raid')return '#ff5a3a';if(s==='lock'||s==='wiped')return '#6a5a7a';
 const g=en.t==='hq'?en.h.g:empHolder(en.f||en.r,p);return g==='none'?'#9fe8a8':EMP_GANGS[g].col;}
function openEmpire(){if(state!=='carmenu'||!empOpen())return;sfx('pick');state='empire';const E=empEntries(),p=myProg();
 let i=E.findIndex(en=>empEntState(en,p)==='raid');if(i<0)i=E.findIndex(en=>en.t==='front'&&empEntState(en,p)==='open');EMP_SEL=i>=0?i:0;show('sEmpire');renderEmpire('');}
function closeEmpire(){if(state!=='empire')return;sfx('blip');openCarMenuForce();}
const empLockTxt=n=>'FINISH '+LEVELS[n].name+' FIRST';
function empHeatBar(g,p){const h=empSave(p).heat[g]|0;return `<span class="emHeat"><i style="width:${h}%"></i></span>`;}
function empCard(en,i,p){const s=empEntState(en,p),sel=i===EMP_SEL?' sel':'',btn=(a,t,dis)=>`<button class="btn sm emGo"${dis?' disabled':''} data-act="${a}" data-i="${i}">${t}</button>`;
 if(en.t==='hq'){const g=en.h.g,gg=EMP_GANGS[g],fr=empCrewFronts(g,p).length,rk=empCrewRackets(g,p).length;
  const st=s==='wiped'?'<b style="color:#7dff9a">WIPED OUT</b>':`HEAT ${empHeatBar(g,p)} · ${fr} FRONTS · ${rk} RACKETS`;
  const act=s==='open'?btn('hq','HIT THEIR HQ<span class="kbhint"> (ENTER)</span>'):s==='wiped'?'':`<div class="emNote">${!empHqOpen(en.h)?empLockTxt(en.h.need):'TAKE THEIR '+fr+' FRONT'+(fr>1?'S':'')+' FIRST'}</div>`;
  return `<div class="emC crew ${s}${sel}" data-i="${i}" style="border-color:${s==='wiped'?'#4a3a5a':gg.col}"><div class="emN" style="color:${gg.col}">${gg.name}</div><div class="emA">HQ: ${en.h.name} · ${en.h.area}</div><div class="emW">${st}</div>${act}</div>`;}
 if(en.t==='front'){const f=en.f,g=empHolder(f,p),u=empSave(p).up[f.k]||{};
  let who,act='';
  if(s==='own'||s==='raid'){who=s==='raid'?`<b style="color:#ff5a3a">UNDER ATTACK BY ${EMP_GANGS[empRaid(f,p).g].name}</b>`:`<b style="color:${EMP_GOLD}">YOURS</b> · GUARDS ${u.g|0}/3 · EXPANDED ${u.x|0}/2`;
   const cg=empUpCost(f,'g',p),cx=empUpCost(f,'x',p);
   act=s==='raid'?btn('go','DEFEND IT<span class="kbhint"> (ENTER)</span>'):btn('g',cg==null?'GUARDS MAXED':'GUARDS $'+fmt(cg),cg==null||p.wallet<cg)+btn('x',cx==null?'FULLY EXPANDED':'EXPAND $'+fmt(cx),cx==null||p.wallet<cx);}
  else if(s==='lock')who=`<b style="color:#8a7a9a">${empLockTxt(f.need)}</b>`;
  else{who=`HELD BY <b style="color:${EMP_GANGS[g==='none'?f.gang:g].col}">${EMP_GANGS[g==='none'?f.gang:g].name}</b>`;act=btn('go','TAKE IT OVER<span class="kbhint"> (ENTER)</span>');}
  return `<div class="emC front ${s}${sel}" data-i="${i}"><div class="emN">${f.name}</div><div class="emA">FRONT · $${fmt(empFrontPay(f,p))} A JOB</div><div class="emW">${who}</div><div class="emBtns">${act}</div></div>`;}
 const r=en.r,g=empHolder(r,p);let who,act='';
 if(s==='own')who=`<b style="color:${EMP_GOLD}">YOURS</b>`;
 else{who=g==='none'?'<b style="color:#9fe8a8">INDEPENDENT</b>':`PAYS <b style="color:${EMP_GANGS[g].col}">${EMP_GANGS[g].short}</b>`;
  act=s==='wait'?'<div class="emNote">HE SAID NO · TRY AGAIN AFTER YOUR NEXT JOB</div>':Object.keys(EMP_HOW).map((h,j)=>btn(h,EMP_HOW[h].n+' '+Math.round(empOdds(r,h,p)*100)+'%<span class="kbhint"> ('+(j+1)+')</span>')).join('');}
 return `<div class="emC racket ${s}${sel}" data-i="${i}"><div class="emN">${r.name}</div><div class="emA">RACKET · $${fmt(r.pay)} A JOB${r.hard>1?' · '+(r.hard>2?'TOUGH':'STUBBORN')+' OWNER':''}</div><div class="emW">${who}</div><div class="emBtns">${act}</div></div>`;}
function renderEmpire(msg){const p=myProg(),E=empEntries(),inc=empIncome(p);
 $('emWallet').textContent='$'+fmt(p.wallet);$('emInc').innerHTML=inc?'+$'+fmt(inc)+' A JOB'+(p.empTot?'<span class="emCnt"> · EARNED $'+fmt(p.empTot)+'</span>':''):'NOTHING PAYS YOU YET';
 $('emSub').innerHTML=empTitle(p)+' · RESPECT '+empRespect(p)+'<span class="emCnt"> · '+empOwned(p).length+'/'+EMP_FRONTS.length+' FRONTS · '+empRackets(p).length+'/'+EMP_RACKETS.length+' RACKETS</span>';
 let h='<div class="emH">RIVAL CREWS</div>',lastD=null;
 E.forEach((en,i)=>{if(en.d&&en.d!==lastD){lastD=en.d;const all=E.filter(q=>q.d===en.d),own=all.filter(q=>empEntState(q,p)==='own').length;h+=`<div class="emH">${EMP_DIST[en.d]} <span>${own}/${all.length}${empDistOwned(en.d,p)?' · YOURS +25%':''}</span></div>`;}h+=empCard(en,i,p);});
 $('emList').innerHTML=h;$('emMsg').textContent=msg||'';drawEmpMap();empAnim();
 const el=$('emList').querySelector('.emC.sel');if(el&&el.scrollIntoView)try{el.scrollIntoView({block:'nearest'});}catch(e){}}
function empSelect(i){const n=empEntries().length;EMP_SEL=(i+n)%n;sfx('blip');renderEmpire('');}
/* the act buttons: go (take over / defend), hq, talk/lean/trash, g/x upgrades */
function empAct(i,act){if(state!=='empire'||fading)return;const en=empEntries()[i];if(!en)return;const p=myProg(),s=empEntState(en,p);EMP_SEL=i;
 if(en.t==='racket'){if(!EMP_HOW[act])act='talk';const res=empShake(en.r.k,act);const r=en.r;
  if(res==='ok'){sfx('cash');return renderEmpire(act==='trash'?'You wrecked the place until he begged. '+r.name+' pays you now.':act==='lean'?'A little pressure did it. '+r.name+' pays you now.':'He saw sense. '+r.name+' pays you now.');}
  sfx('blip');return renderEmpire(res==='fail'?(act==='lean'?'He called his friends instead. The crew is angrier now. Try again after your next job.':'He laughed you out of the shop. Try again after your next job.'):res==='wait'?'He already said no. Come back after your next job.':'');}
 if(en.t==='front'&&(act==='g'||act==='x')){const res=empUpgrade(en.f.k,act);sfx(res==='ok'?'cash':'blip');
  return renderEmpire(res==='ok'?(act==='g'?'More guards on '+en.f.name+'. Raids fail more often.':en.f.name+' is bigger now and pays $'+fmt(empFrontPay(en.f,p))+' a job.'):res==='poor'?'Not enough cash.':res==='max'?'Nothing more to buy there.':'');}
 if(s==='lock'||s==='wiped'||s==='own'){sfx('blip');return renderEmpire(s==='own'?'Already yours.':s==='wiped'?'They are finished.':'Not yet.');}
 const id=en.t==='hq'?'hq_'+en.h.g:empMission(en.f),gg=EMP_GANGS[en.t==='hq'?en.h.g:(empRaid(en.f,p)||{g:empHolder(en.f,p)}).g]||EMP_GANGS[en.f.gang];
 sfx('pick');state='play';show(null);travel(()=>{JOBPICK=null;startMission(id);showObjCard();},en.name,(en.t==='hq'?'WIPE OUT ':s==='raid'?'DEFEND AGAINST ':'TAKEOVER · ')+gg.name);}
function empPrimary(i){const en=empEntries()[i];if(!en)return;const s=empEntState(en);if(en.t==='racket')return empAct(i,'talk');if(en.t==='front'&&s==='own')return empAct(i,'g');empAct(i,en.t==='hq'?'hq':'go');}
function empKey(e){const c=e.code;if(c==='Escape'||c==='Backspace'||c==='KeyE'){closeEmpire();return;}
 if(c==='ArrowUp'||c==='ArrowLeft'||c==='KeyW'||c==='KeyA')empSelect(EMP_SEL-1);else if(c==='ArrowDown'||c==='ArrowRight'||c==='KeyS')empSelect(EMP_SEL+1);
 else if(c==='Enter'||c==='Space')empPrimary(EMP_SEL);else if(c==='Digit1')empAct(EMP_SEL,'talk');else if(c==='Digit2')empAct(EMP_SEL,'lean');else if(c==='Digit3')empAct(EMP_SEL,'trash');
 else if(c==='KeyG')empAct(EMP_SEL,'g');else if(c==='KeyX'||c==='KeyD')empAct(EMP_SEL,'x');}
function empPad(dir){if(pdown(1)||pdown(8)){closeEmpire();return;}if(pdown(12)||dir<0)empSelect(EMP_SEL-1);else if(pdown(13)||dir>0)empSelect(EMP_SEL+1);else if(pdown(0))empPrimary(EMP_SEL);
 else if(pdown(3)){const en=empEntries()[EMP_SEL];empAct(EMP_SEL,en&&en.t==='front'?'x':'lean');}else if(pdown(5))empAct(EMP_SEL,'trash');}

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
  if(en.t==='racket'){const d=(sel?1.25:0.85)*r*0.8;c.save();c.translate(x,y+bob);c.shadowColor=col;c.shadowBlur=(sel?12:5)*u;c.rotate(Math.PI/4);c.fillStyle=col;c.fillRect(-d/2,-d/2,d,d);c.shadowBlur=0;c.strokeStyle='#160826';c.lineWidth=1.2*u;c.strokeRect(-d/2,-d/2,d,d);c.restore();
   if(s==='own'){c.fillStyle='#160826';c.font=empFont(d*0.7);c.textAlign='center';c.textBaseline='middle';c.fillText('$',x+0.3*u,y+bob+0.5*u);}}
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
  if(sel){const gk=en.t==='hq'?en.h.g:en.t==='front'&&empRaid(en.f,p)?empRaid(en.f,p).g:empHolder(en.f||en.r,p);
   const l1=en.name,l2=s==='own'?'YOURS':s==='raid'?'UNDER ATTACK':s==='wiped'?'WIPED OUT':s==='lock'?'NOT YET':gk==='none'?'INDEPENDENT':EMP_GANGS[gk].name;
   c.font=empFont(6.5*u);const w1=c.measureText(l1).width;c.font=empFont(4.8*u);const w2=c.measureText(l2).width;const top=en.t==='racket'?r*1.4:en.t==='hq'?r*3:r*3.4;
   const bw=Math.max(w1,w2)+12*u,bh=24*u,bx=clamp(x-bw/2,ox+2*u,Math.min(W,ox+mw)-bw-2*u),by=Math.max(2*u,y-top-bh+bob);
   c.fillStyle='rgba(10,4,20,.88)';c.fillRect(bx,by,bw,bh);c.strokeStyle=col;c.lineWidth=1.5*u;c.strokeRect(bx,by,bw,bh);c.fillStyle='#2de2e6';c.fillRect(bx+3*u,by+bh,bw,2*u);
   c.textAlign='left';c.textBaseline='middle';c.font=empFont(6.5*u);c.fillStyle='#fff';c.fillText(l1,bx+6*u,by+8*u);c.font=empFont(4.8*u);c.fillStyle=col;c.fillText(l2,bx+6*u,by+17*u);}}
 /* legend strip */
 {const items=[['YOURS',EMP_GOLD],...Object.values(EMP_GANGS).map(g=>[g.short,g.col]),['FREE','#9fe8a8']];c.font=empFont(5*u);let tw=0;for(const [tx] of items)tw+=c.measureText(tx).width+18*u;
  const lx0=ox+mw/2-tw/2,ly=Math.min(H,oy+mh)-9*u;c.fillStyle='rgba(10,4,20,.78)';c.fillRect(lx0-6*u,ly-8*u,tw+6*u,15*u);let lx=lx0;c.textAlign='left';c.textBaseline='middle';
  for(const [tx,col] of items){c.fillStyle=col;c.shadowColor=col;c.shadowBlur=4*u;c.beginPath();c.arc(lx+3*u,ly,3*u,0,Math.PI*2);c.fill();c.shadowBlur=0;c.fillText(tx,lx+9*u,ly+0.5*u);lx+=c.measureText(tx).width+18*u;}}}
function empLoop(t){if(state!=='empire'){EMP_ANIM=0;return;}drawEmpMap(t);EMP_ANIM=requestAnimationFrame(empLoop);}
function empAnim(){if(!EMP_ANIM&&typeof requestAnimationFrame==='function')EMP_ANIM=requestAnimationFrame(empLoop);}
if(typeof document!=='undefined'&&document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{EMP_LAYER=null;});
$('emList').onclick=e=>{const b=e.target.closest('[data-act]');if(b){if(!b.disabled)empAct(+b.dataset.i,b.dataset.act);return;}const cd=e.target.closest('.emC[data-i]');if(cd&&+cd.dataset.i!==EMP_SEL)empSelect(+cd.dataset.i);};
$('emMap').onclick=e=>{const cv=$('emMap'),b=cv.getBoundingClientRect();if(!EMP_RECT||!b.width)return;const s=cv.width/b.width,px=(e.clientX-b.left)*s,py=(e.clientY-b.top)*s;let bi=-1,bd=EMP_RECT.u*18;
 empEntries().forEach((en,i)=>{const x=EMP_RECT.ox+en.at[0]*EMP_RECT.mw,y=EMP_RECT.oy+en.at[1]*EMP_RECT.mh-EMP_RECT.u*(en.t==='racket'?0:10),d=Math.hypot(x-px,y-py);if(d<bd){bd=d;bi=i;}});if(bi>=0)empSelect(bi);};
$('bEmpLeave').onclick=()=>closeEmpire();
$('bCarEmpire').onclick=()=>openEmpire();
