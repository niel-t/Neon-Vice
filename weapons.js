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
   Ballistic fields (penetration, energy) are W5's and are added to these same entries. */
const CAL={
 '9mm':{name:'9MM',box:30,price:300,cap:90,up:45},
 '357':{name:'.357 MAGNUM',box:12,price:400,cap:36,up:18},
 '12ga':{name:'12 GAUGE',box:10,price:400,cap:30,up:15},
 '556':{name:'5.56MM',box:30,price:600,cap:90,up:45},
 '762':{name:'7.62MM',box:30,price:700,cap:90,up:45},
 '50ae':{name:'.50 AE',box:14,price:900,cap:42,up:14},
 '40mm':{name:'40MM GRENADE',box:3,price:1500,cap:9,up:3},
};
/* persistent body armour: plates absorb one hit each; repaired or replaced at Nine's. spd=move mult while worn */
const ARMOUR={
 vest:{name:'KEVLAR VEST',plates:1,price:2500,repair:900},
 carrier:{name:'PLATE CARRIER',plates:2,price:6000,repair:1600,spd:0.96},
};
