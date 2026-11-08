'use strict';
// Weapon, caliber and kit data/helpers. Data only: no DOM/GL, nothing runs gameplay at load.
/* weapon defs: spr=base spread(rad) mv=extra spread while moving bloom=added per shot loud=noise radius spd=move mult
   loadout: cal=CAL id (null: melee/thrown), mag=rounds per magazine, rl=reload seconds, ar=active-reload window [start,len] as fractions of rl
   ammo=rounds in a loose gun found on a job (pickups/enemy drops) */
const WD={
 fists:{name:'FISTS',melee:true,range:0.95,cd:0.3,kill:false,snd:'swing_fists'},
 bat:{name:'BASEBALL BAT',melee:true,range:1.3,cd:0.45,kill:true,len:0.72,snd:'swing_bat',arc:1.1},
 knife:{name:'KNIFE',melee:true,range:1.0,cd:0.25,kill:true,len:0.27,snd:'swing_knife',arc:0.8},
 machete:{name:'MACHETE',melee:true,range:1.2,cd:0.36,kill:true,len:0.57,snd:'swing_machete',arc:1.0},
 pistol:{name:'9MM PISTOL',ammo:13,cal:'9mm',mag:15,rl:1.3,ar:[0.45,0.16],cd:0.2,pel:1,spr:0.025,mv:0.07,bloom:0.04,ecd:0.8,loud:13,len:0.2,snd:'pistol',kick:0.1},
 silenced:{name:'SILENCED 9MM',ammo:12,cal:'9mm',mag:15,rl:1.5,ar:[0.45,0.15],cd:0.24,pel:1,spr:0.03,mv:0.07,bloom:0.04,ecd:0.85,loud:2.5,len:0.36,snd:'silenced',kick:0.06},
 revolver:{name:'.357 MAGNUM',ammo:6,cal:'357',mag:6,rl:2.4,ar:[0.5,0.12],cd:0.34,pel:1,spr:0.012,mv:0.06,bloom:0.08,ecd:0.95,loud:15,pierce:3,len:0.24,snd:'revolver',kick:0.2},
 shotgun:{name:'PUMP SHOTGUN',ammo:6,cal:'12ga',mag:6,rl:3.0,ar:[0.55,0.12],cd:0.75,pel:7,spr:0.26,mv:0.04,bloom:0,ecd:1.2,loud:16,len:0.68,snd:'shotgun',kick:0.4,spd:0.94,two:true},
 double:{name:'DOUBLE BARREL',ammo:2,cal:'12ga',mag:2,rl:1.9,ar:[0.4,0.18],cd:0.22,pel:10,spr:0.38,mv:0.04,bloom:0,ecd:1.4,loud:17,len:0.6,snd:'double',kick:0.55,spd:0.95,two:true},
 smg:{name:'UZI',ammo:32,cal:'9mm',mag:32,rl:1.8,ar:[0.5,0.14],cd:0.07,pel:1,spr:0.06,mv:0.08,bloom:0.025,bloomMax:0.22,ecd:0.12,burst:4,loud:13,len:0.26,snd:'smg',kick:0.08},
 dual:{name:'DUAL 9MMs',ammo:26,cal:'9mm',mag:30,rl:2.6,ar:[0.5,0.12],cd:0.1,pel:1,spr:0.05,mv:0.08,bloom:0.02,bloomMax:0.16,ecd:0.35,burst:6,loud:13,len:0.2,snd:'dual',kick:0.08},
 m16:{name:'M16',ammo:30,cal:'556',mag:30,rl:2.2,ar:[0.5,0.13],cd:0.32,pel:1,spr:0.015,mv:0.09,bloom:0.02,ecd:0.9,burst3:true,loud:15,pierce:2,len:0.66,snd:'rifle',kick:0.14,spd:0.92,two:true},
 tknife:{name:'THROWING KNIVES',toss:true,ammo:4,cal:null,mag:4,cd:0.3,loud:0,len:0.27,snd:'throw'},
 /* Nine of Nine exclusives: base = the stock weapon whose animation, gore and sounds they borrow */
 goldak:{name:'GOLDEN AK-47',base:'m16',excl:true,ammo:40,cal:'762',mag:40,rl:2.5,ar:[0.5,0.12],cd:0.09,pel:1,spr:0.03,mv:0.08,bloom:0.02,bloomMax:0.16,ecd:0.2,burst:5,loud:15,pierce:2,len:0.62,snd:'rifle',kick:0.12,spd:0.94,two:true},
 golddeagle:{name:'GOLDEN DEAGLES',base:'dual',excl:true,ammo:16,cal:'50ae',mag:14,rl:2.8,ar:[0.5,0.1],cd:0.16,pel:1,spr:0.03,mv:0.07,bloom:0.05,bloomMax:0.2,ecd:0.5,loud:16,pierce:3,len:0.26,snd:'revolver',kick:0.24},
 goldgl:{name:'GOLD GRENADE LAUNCHER',base:'shotgun',excl:true,nade:true,ammo:6,cal:'40mm',mag:6,rl:3.5,ar:[0.55,0.1],cd:0.8,pel:1,spr:0.02,mv:0.04,bloom:0,ecd:1.6,loud:17,len:0.62,snd:'double',kick:0.5,spd:0.93,two:true},
 katana:{name:'KATANA',base:'machete',excl:true,melee:true,range:1.5,cd:0.26,kill:true,len:0.8,snd:'swing_machete',arc:1.35},
};
const BT=t=>(WD[t]&&WD[t].base)||t;
/* calibers shared by every gun that chambers them (one pool per caliber in the kit).
   box=rounds per box at Nine's, price=$ per box, cap=base pool capacity before upgrades, up=capacity added per upgrade.
   Ballistics (W5, CAL v2, docs/research/BALLISTICS.md §1): e0=muzzle J per projectile (12ga: per 00 pellet), hard=hard-layer factor,
   metal=steel/alu loss factor, rifle=rifle bullet for armour, dmg=damage of a clean hit. 40mm is blast only (no e0). WD.eMul scales e0 (Uzi). */
const CAL={
 '9mm':{name:'9MM',box:30,price:300,cap:90,up:45,e0:490,hard:1,metal:1,dmg:1},
 '357':{name:'.357 MAGNUM',box:12,price:400,cap:36,up:18,e0:731,hard:0.9,metal:1,dmg:1},
 '12ga':{name:'12 GAUGE',box:10,price:400,cap:30,up:15,e0:287,hard:0.5,metal:1,dmg:1},
 '556':{name:'5.56MM',box:30,price:600,cap:90,up:45,e0:1750,hard:1,metal:1,rifle:true,dmg:1},
 '762':{name:'7.62MM',box:30,price:700,cap:90,up:45,e0:2030,hard:1.3,metal:1,rifle:true,dmg:1},
 '50ae':{name:'.50 AE',box:14,price:900,cap:42,up:14,e0:1965,hard:0.8,metal:1.5,dmg:1},
 '40mm':{name:'40MM GRENADE',box:3,price:1500,cap:9,up:3},
};
WD.smg.eMul=1.22;
/* persistent body armour: plates absorb one hit each; repaired or replaced at Nine's. spd=move mult while worn. lv=NIJ level (ARMLV) */
const ARMOUR={
 vest:{name:'KEVLAR VEST',plates:1,price:2500,repair:900,lv:'II'},
 carrier:{name:'PLATE CARRIER',plates:2,price:6000,repair:1600,spd:0.96,lv:'III'},
};
/* NIJ 0101.02/.03 levels (BALLISTICS.md §5, P): stop = e·hard below which a plate stops the round (rifles only if rifle:true);
   part = rifle energy below which a III plate still takes half. absorb 1 stop, 0.5 blunt/partial, 0.1 pass. */
const ARMLV={II:{stop:900},IIIA:{stop:2000},III:{stop:2100,rifle:true,part:3000}};
/* ================= BALLISTICS (W5): pure penetration + damage, no DOM/GL =================
   mats = WORLD.materials ({MAT,BUILD}); passed in so this file loads standalone. A projectile p = {e0,hard,metal,rifle,dmg}. */
const BAL=(()=>{
 // BODY_J: flat loss per torso, a gameplay value (research has none: 9mm FMJ over-penetrates, M193 fragments)
 const EMIN=30,TUMBLE=2,OBL_MAX=3,HP_EPS=0.1,BODY_J=500,E_REF=250;
 const proj=(cal,eMul)=>{const c=CAL[cal]||{};return {e0:(c.e0||0)*(eMul||1),hard:c.hard||1,metal:c.metal||1,rifle:!!c.rifle,dmg:c.dmg||1};};
 // one construction: returns {e: energy out or null if stopped, tum: perforated a hard layer ≥3 cm nominal, dep: energy deposited}
 function cross(mats,p,build,e,tum=1,cos=1,alt=false){
  const B=mats.BUILD[build];if(!B)throw new RangeError('Unknown build '+build);
  const layers=alt&&B.alt?B.alt.layers:B.layers,obl=Math.min(OBL_MAX,1/Math.max(cos,1e-6)),eIn=e;let hardT=false;
  for(const [m,t] of layers){const M=mats.MAT[m];if(!M.res)continue;
   let loss=M.res*t*obl*tum;if(M.hard)loss/=p.hard;if(m==='steel'||m==='alu')loss*=p.metal;
   e-=loss;if(e<EMIN)return {e:null,tum:hardT,dep:eIn};if(M.hard&&t>=3)hardT=true;}
  return {e,tum:hardT,dep:eIn-e};}
 // chain of constructions (perpendicular, no alt unless 'id@alt'): final energy or {stop:index}
 function chain(mats,p,builds){let e=p.e0,tum=1;for(let i=0;i<builds.length;i++){const [b,a]=builds[i].split('@');const r=cross(mats,p,b,e,tum,1,!!a);if(r.e===null)return {stop:i+1};e=r.e;if(r.tum)tum=TUMBLE;}return {e};}
 // energy deposited toward cell destruction (0 below coreE)
 const deposit=(mats,p,build,eIn,dep)=>{const c=mats.BUILD[build].coreE;return c&&eIn*p.hard<c?0:dep;};
 function roundsPerCell(mats,p,build,pellets=1){const B=mats.BUILD[build];if(B.cellHp===Infinity)return Infinity;if(B.coreE&&p.e0*p.hard<B.coreE)return Infinity;
  const r=cross(mats,p,build,p.e0);return Math.ceil(B.cellHp/((p.e0-(r.e||0))*pellets));}
 function absorb(lv,p,e){const L=ARMLV[lv];if(!L)return 0;const eh=e*p.hard;return eh<L.stop&&(!p.rifle||L.rifle)?1:(!p.rifle||eh<(L.part||0))?0.5:0.1;}
 // damage vs a fixed reference energy (not muzzle e0): any round still above E_REF is a clean hit (1), weaker ones wound
 const damage=(p,e,abs=0)=>p.dmg*Math.min(1,Math.pow(Math.max(0,e)/E_REF,0.7))*(1-abs);
 const dead=(hp,dmg)=>hp-dmg<=HP_EPS+1e-9;
 return Object.freeze({EMIN,TUMBLE,OBL_MAX,HP_EPS,BODY_J,E_REF,proj,cross,chain,deposit,roundsPerCell,absorb,damage,dead});
})();
/* legacy cell levels have one wall glyph: interior '#' takes the level typology (MATERIALS.md §4), '#' touching the void or an outdoor glyph (out) takes ext,
   the void itself is indestructible. prop = COVER furniture id -> build. Keyed by level name; def for hub/unknown. P, W5-owned. */
const LEGACY_BUILD={
 void:'rc_column_40',
 out:' =',
 def:{int:'cmu_hollow',ext:'cbs_ext',door:'door_solid',pane:'glass_annealed_6'},
 levels:{
  'MOTEL SUNSET':{int:'cmu_hollow',ext:'cbs_ext',door:'door_solid',pane:'glass_annealed_6'},
  'CLUB FLAMINGO':{int:'cmu_hollow',ext:'cbs_ext',door:'door_solid',pane:'glass_annealed_6'},
  'THE PENTHOUSE':{int:'stud_steel_gyp2',ext:'cbs_ext',door:'door_solid',pane:'glass_tempered_6'},
  'VICE MARINA':{int:'stud_steel_gyp',ext:'cbs_ext',door:'door_metal',pane:'glass_annealed_6',out:' =_oY'},
  'STARLIGHT ARCADE':{int:'stud_steel_gyp2',ext:'cbs_ext',door:'door_metal',pane:'glass_tempered_6'},
  'OCEAN VIEW MALL':{int:'stud_steel_gyp2',ext:'rc_wall_20',door:'door_metal',pane:'glass_tempered_6'},
  'THE RECORDING STUDIO':{int:'acoustic_double',ext:'cbs_ext',door:'door_solid',pane:'glass_annealed_6'},
  'THE ROYAL FLUSH':{int:'joinery_ply',ext:'alu_bulkhead',door:'door_hollow',pane:'glass_lam_windshield',out:' _oyY'},
 },
 prop:{2:'counter_cmu',7:'counter_cabinet',9:'steel_3mm',10:'counter_cabinet',11:'counter_cabinet',12:'counter_cabinet',13:'counter_cabinet',
  14:'steel_10mm',19:'counter_cabinet',20:'counter_cabinet',21:'car_door',22:'car_door'},
};
/* ================= KIT: the persistent inventory (save contract kit/locker/run v1) =================
   kit    = {v:1, guns:[{type,mag}|null ×2], active:0|1, melee:type|null, armour:{type,plates}|null,
             pool:{cal:rounds}, upg:{cal:upgrades}, lost:[{item,why}]}
   locker = {v:1, items:[{type,mag}|{type}|{armour,plates}], lost:[]}
   run    = {v:1, mission:'c'+levelIdx, stage:'s0', entryKit, stageKit, t, stow?:[locker items set aside at a stage]}  (absent = not on a job)
   Pure and DOM-free so the save tests and check.cjs can load it. Pool capacity is derived (capOf), never stored. */
const KIT_V=1,LOCKER_CAP=12;
const plainObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const kitInt=(n,lo,hi)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,Math.floor(n))):lo;
const isGunT=t=>typeof t==='string'&&Object.prototype.hasOwnProperty.call(WD,t)&&!WD[t].melee;
const isMeleeT=t=>typeof t==='string'&&Object.prototype.hasOwnProperty.call(WD,t)&&!!WD[t].melee&&t!=='fists';
const isCal=c=>typeof c==='string'&&Object.prototype.hasOwnProperty.call(CAL,c);
function kitNew(){return {v:KIT_V,guns:[null,null],active:0,melee:null,armour:null,pool:{},upg:{},lost:[]};}
function kitClone(k){return JSON.parse(JSON.stringify(k));}
function capOf(kit,cal){const c=CAL[cal];return c?c.cap+kitInt((kit.upg||{})[cal],0,99)*c.up:0;}
function poolAdd(kit,cal,n){if(!isCal(cal)||!(n>0))return 0;const have=kit.pool[cal]|0,add=Math.max(0,Math.min(Math.floor(n),capOf(kit,cal)-have));if(add)kit.pool[cal]=have+add;return add;}
/* structural shape checks (Q5 tier 1: failures block nb86prog writes) */
const kitShape=k=>plainObj(k)&&(k.v===undefined||k.v===KIT_V)&&Array.isArray(k.guns)&&plainObj(k.pool)&&(k.upg===undefined||plainObj(k.upg));
const lockerShape=l=>plainObj(l)&&(l.v===undefined||l.v===KIT_V)&&Array.isArray(l.items);
const runShape=r=>plainObj(r)&&(r.v===undefined||r.v===KIT_V);
/* content normalisation (Q5 tier 2: never blocks; unknown content moves to lost[] so a later build can restore it). Idempotent. */
function normGun(g,lost,why){if(g==null)return null;if(!plainObj(g)||!isGunT(g.type)){lost.push({item:g,why:why||'unknown gun'});return null;}g.mag=kitInt(g.mag,0,WD[g.type].mag);return g;}
function normKit(k){k.v=KIT_V;const lost=k.lost=Array.isArray(k.lost)?k.lost:[];
 const guns=k.guns;k.guns=[normGun(guns[0],lost),normGun(guns[1],lost)];for(const g of guns.slice(2))if(g!=null)lost.push({item:g,why:'third gun slot'});
 k.active=k.active===1?1:0;
 if(k.melee==null)k.melee=null;else if(!isMeleeT(k.melee)){lost.push({item:k.melee,why:'unknown melee'});k.melee=null;}
 if(k.armour==null)k.armour=null;else if(!plainObj(k.armour)||!Object.prototype.hasOwnProperty.call(ARMOUR,k.armour.type)){lost.push({item:k.armour,why:'unknown armour'});k.armour=null;}else k.armour.plates=kitInt(k.armour.plates,0,ARMOUR[k.armour.type].plates);
 if(!plainObj(k.upg))k.upg={};for(const c of Object.keys(k.upg)){if(!isCal(c)){lost.push({item:{upg:c,n:k.upg[c]},why:'unknown caliber'});delete k.upg[c];}else k.upg[c]=kitInt(k.upg[c],0,99);}
 for(const c of Object.keys(k.pool)){if(!isCal(c)){lost.push({item:{cal:c,n:k.pool[c]},why:'unknown caliber'});delete k.pool[c];}else k.pool[c]=kitInt(k.pool[c],0,capOf(k,c));}
 return k;}
function normLocker(l){l.v=KIT_V;const lost=l.lost=Array.isArray(l.lost)?l.lost:[];
 l.items=l.items.filter(it=>{if(plainObj(it)&&isGunT(it.type)){it.mag=kitInt(it.mag,0,WD[it.type].mag);return true;}
  if(plainObj(it)&&isMeleeT(it.type))return true;
  if(plainObj(it)&&Object.prototype.hasOwnProperty.call(ARMOUR,it.armour)){it.plates=kitInt(it.plates,0,ARMOUR[it.armour].plates);return true;}
  lost.push({item:it,why:'unknown item'});return false;});
 return l;}
/* a run that no longer makes sense (unknown mission, broken snapshots) is dropped = walked away from; the kit itself is untouched during a job */
function normRun(r,nMissions,lost){const m=/^c(\d+)$/.exec(r.mission);if(!m||+m[1]>=nMissions||!kitShape(r.entryKit)||!kitShape(r.stageKit))return null;
 r.v=KIT_V;if(typeof r.stage!=='string')r.stage='s0';if(!Number.isFinite(r.t))r.t=0;normKit(r.entryKit);normKit(r.stageKit);
 if(Array.isArray(r.stow)){const t={items:r.stow,lost:lost||r.entryKit.lost};normLocker(t);r.stow=t.items;}else delete r.stow;return r;}
/* first kit for a save that predates it: the old armory (arm.eq/owned/mags/vest) becomes kit + locker; arm itself is left as it was */
function kitFromArm(a,charId){const k=kitNew(),l={v:KIT_V,items:[],lost:[]};a=plainObj(a)?a:{};
 const eq=typeof a.eq==='string'?a.eq:null,owned=Array.isArray(a.owned)?a.owned:[];
 if(eq&&isGunT(eq)){const w=WD[eq],tot=Math.round((w.ammo||0)*(1+kitInt(a.mags,0,9)));k.guns[0]={type:eq,mag:Math.min(tot,w.mag)};poolAdd(k,w.cal,tot-k.guns[0].mag);}
 else if(eq&&isMeleeT(eq))k.melee=eq;else if(eq)k.lost.push({item:eq,why:'unknown weapon'});
 for(const t of [...new Set(owned)]){if(t===eq)continue;if(isGunT(t))l.items.push({type:t,mag:WD[t].mag});else if(isMeleeT(t))l.items.push({type:t});else k.lost.push({item:t,why:'unknown weapon'});}
 if(a.vest)k.armour={type:'vest',plates:1};
 if(charId==='don'&&!k.guns.some(g=>g&&g.type==='revolver')&&!l.items.some(i=>i.type==='revolver')){
  const s=k.guns.indexOf(null);if(s>=0){k.guns[s]={type:'revolver',mag:WD.revolver.mag};if(!k.guns[k.active])k.active=s;}else l.items.push({type:'revolver',mag:WD.revolver.mag});poolAdd(k,'357',3);}
 return {kit:k,locker:l};}
/* boot-time per-character normalisation; called after the structural checks, never writes the save */
function kitBoot(p,charId,nMissions){
 if(p.kit==null){const m=kitFromArm(p.arm,charId);p.kit=m.kit;if(p.locker==null)p.locker=m.locker;}
 if(p.locker==null)p.locker={v:KIT_V,items:[],lost:[]};
 normKit(p.kit);normLocker(p.locker);
 if(p.run!=null&&!normRun(p.run,nMissions,p.locker.lost))delete p.run;}
/* ================= RELOAD (W6c): timed top-up from the caliber pool with a Gears-style active window =================
   One press inside [ar0,ar1] seconds finishes at once; a press anywhere else jams (the rest takes AR_JAM× longer) and locks further tries. */
const AR_JAM=1.4;
function reloadNeed(type,mag,pool){const w=WD[type];if(!w||w.melee||!isCal(w.cal))return 0;return Math.max(0,Math.min(w.mag-Math.max(0,mag|0),pool|0));}
function reloadNew(type){const w=WD[type],d=w.rl||1.5,a=w.ar||[0.5,0.12];return {t:0,dur:d,ar0:a[0]*d,ar1:(a[0]+a[1])*d,tried:false,jam:false};}
function reloadPress(r){if(r.tried)return 'locked';r.tried=true;if(r.t>=r.ar0&&r.t<=r.ar1)return 'hit';r.jam=true;r.dur=r.t+(r.dur-r.t)*AR_JAM;return 'jam';}
const stripRoom=(kit,cal)=>isCal(cal)?Math.max(0,capOf(kit,cal)-(kit.pool[cal]|0)):0;
/* ================= LOCKER + NINE'S (W6d): moving things between the kit and the apartment locker, deliveries and sales =================
   Slots: 0|1 = kit.guns, 'melee' = kit.melee, 'armour' = kit.armour. Nothing is duplicated or dropped: every move either completes or changes nothing. */
const SELL_FRAC=0.4;
const lockerRoom=l=>l.items.length<LOCKER_CAP;
function itemOfSlot(k,s){if(s===0||s===1)return k.guns[s];if(s==='melee')return k.melee?{type:k.melee}:null;if(s==='armour')return k.armour?{armour:k.armour.type,plates:k.armour.plates}:null;return null;}
function clearSlot(k,s){if(s===0||s===1){k.guns[s]=null;if(!k.guns[k.active]&&k.guns[1-k.active])k.active=1-k.active;}else if(s==='melee')k.melee=null;else if(s==='armour')k.armour=null;}
/* kit -> locker; false when the locker is full or the slot is empty */
function kitStash(k,l,s){const it=itemOfSlot(k,s);if(!it||!lockerRoom(l))return false;l.items.push(it);clearSlot(k,s);return true;}
/* locker[i] -> kit: a gun takes a free slot (active first) or trades places with the active gun; melee and armour trade places with what you carry */
function kitTake(k,l,i){const it=l.items[i];if(!it)return false;
 if(it.armour){l.items.splice(i,1);if(k.armour)l.items.splice(i,0,{armour:k.armour.type,plates:k.armour.plates});k.armour={type:it.armour,plates:it.plates|0};return true;}
 if(isMeleeT(it.type)){l.items.splice(i,1);if(k.melee)l.items.splice(i,0,{type:k.melee});k.melee=it.type;return true;}
 if(!isGunT(it.type))return false;l.items.splice(i,1);
 const s=k.guns[k.active]==null?k.active:k.guns[1-k.active]==null?1-k.active:-1;
 if(s<0)l.items.splice(i,0,k.guns[k.active]);const d=s<0?k.active:s;k.guns[d]={type:it.type,mag:it.mag|0};k.active=d;return true;}
/* a purchase: into the kit when there is room for it, otherwise into the locker; 'kit' | 'locker' | false (both full) */
function kitReceive(k,l,it){
 if(it.armour){if(!k.armour){k.armour={type:it.armour,plates:it.plates|0};return 'kit';}if(!lockerRoom(l))return false;l.items.push(it);return 'locker';}
 if(isMeleeT(it.type)){if(!k.melee){k.melee=it.type;return 'kit';}if(!lockerRoom(l))return false;l.items.push({type:it.type});return 'locker';}
 if(!isGunT(it.type))return false;const s=k.guns[k.active]==null?k.active:k.guns[1-k.active]==null?1-k.active:-1;
 if(s>=0){k.guns[s]={type:it.type,mag:it.mag|0};if(!k.guns[k.active])k.active=s;return 'kit';}if(!lockerRoom(l))return false;l.items.push({type:it.type,mag:it.mag|0});return 'locker';}
/* what Nine pays: SELL_FRAC of the price (a damaged vest at half that); rounds left in a sold gun's magazine go to the pool (up to its cap) */
function sellValue(it,price){const base=Math.round((price||0)*SELL_FRAC);if(it&&it.armour){const a=ARMOUR[it.armour];return a&&it.plates<a.plates?Math.round(base/2):base;}return base;}
function kitSell(k,l,where,i){let it;if(where==='kit'){it=itemOfSlot(k,i);if(!it)return null;clearSlot(k,i);}else{it=l.items[i];if(!it)return null;l.items.splice(i,1);}
 const w=it.type&&WD[it.type];if(w&&!w.melee&&(it.mag|0)>0)poolAdd(k,w.cal,it.mag|0);return it;}