'use strict';
// Motel Sunset (CP3) as plan v1 data. Source: docs/levels/motel-sunset.md (x east, z south, metres).
// Layout settlements against the brief are listed in docs/PLAN-FORMAT.md §Motel.
PLANS.motel=(()=>{
 const GUEST_DOOR=.91,BATH_DOOR=.76,RAIL={build:'steel_3mm',cov:'rail',h:1.1};
 // rear-block guest bays: x0=9.4+4.1k, z 0–7.6; baths 2.1×2.3 at the rear against the shared demising wall
 function rearBlock(first,front){
  const rooms=[],doors=[],windows=[];
  for(let k=0;k<8;k++){
   const n=first+k,id=`r${n}`,x0=+(9.4+4.1*k).toFixed(3),x1=+(x0+4.1).toFixed(3),east=k%2===0;
   const bx=east?[+(x1-2.1).toFixed(3),x1]:[x0,+(x0+2.1).toFixed(3)];
   rooms.push({id,name:`Room ${n}`,kind:'bedroom',rect:[x0,0,x1,7.6]},{id:`${id}_bath`,in:id,kind:'bath',part:'stud_wood_gyp',rect:[bx[0],0,bx[1],2.3]});
   doors.push({id:`d${n}`,rooms:[id,front],at:[x0+3,7.6],w:GUEST_DOOR,kind:'door_solid',hinge:'w'},
    {id:`d${n}_bath`,rooms:[id,`${id}_bath`],at:[east?x1-.6:x0+.6,2.3],w:BATH_DOOR,kind:'door_hollow',hinge:east?'e':'w'});
   windows.push({id:`j${n}`,rooms:[id,front],at:[x0+1.4,7.6],w:1.4});
  }
  return{rooms,doors,windows};
 }
 const lotRear=rearBlock(101,'walk_r'),f2Rear=rearBlock(201,'balc');
 // west wing: z0=9.4+4.1k, x 0–7.6; doors on x 7.6 centred 3.0 m from the north wall
 const west={rooms:[],doors:[],windows:[]};
 for(let k=0;k<5;k++){
  const n=109+k,id=`r${n}`,z0=+(9.4+4.1*k).toFixed(3),z1=+(z0+4.1).toFixed(3),south=k%2===0&&k<4;
  const bz=south?[+(z1-2.1).toFixed(3),z1]:[z0,+(z0+2.1).toFixed(3)];
  west.rooms.push({id,name:`Room ${n}`,kind:'bedroom',rect:[0,z0,7.6,z1]},{id:`${id}_bath`,in:id,kind:'bath',part:'stud_wood_gyp',rect:[0,bz[0],2.3,bz[1]]});
  west.doors.push({id:`d${n}`,rooms:[id,'walk_w'],at:[7.6,z0+3],w:GUEST_DOOR,kind:'door_solid',hinge:'n'},
   {id:`d${n}_bath`,rooms:[id,`${id}_bath`],at:[2.3,south?z1-.6:z0+.6],w:BATH_DOOR,kind:'door_hollow',hinge:south?'s':'n'});
  west.windows.push({id:`j${n}`,rooms:[id,'walk_w'],at:[7.6,z0+1.4],w:1.4});
 }
 // parked cars: car_door body plus car_engine nose block (engine line stops every calibre)
 function car(id,cx,cz,nose){
  const d={w:[-1,0],e:[1,0],n:[0,-1],s:[0,1]}[nose],along=d[0]!==0;
  return[{id:`${id}_body`,at:[cx-d[0]*.55,cz-d[1]*.55],size:along?[3.3,1.75]:[1.75,3.3],build:'car_door',cov:'chest',h:1.3},
   {id:`${id}_eng`,at:[cx+d[0]*1.65,cz+d[1]*1.65],size:along?[1.1,1.6]:[1.6,1.1],build:'car_engine',cov:'chest',h:1.2}];
 }
 const cars=[...[0,1,2,4,5].flatMap(k=>car(`car_w${k}`,12.145,+(14+1.37+2.74*k).toFixed(3),'w')),...car('car_e0',23.75,15.37,'e'),
  ...[0,3].flatMap(k=>car(`car_f${k}`,+(27.3+1.37+2.74*k).toFixed(3),22.745,'n'))];
 const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
 const guestArea=ids=>Object.fromEntries(ids.map(n=>[`r${n}`,31.2]));
 const guestEnt=(ids,two)=>Object.fromEntries(ids.map(n=>[`r${n}`,two.includes(n)?2:1]));
 return{id:'motel',v:1,name:'Motel Sunset',style:'motel',source:'docs/levels/motel-sunset.md',stages:{
  lot:{bounds:[-2,0,52,44],combat:true,defaults:{shell:'cbs_ext',part:'cmu_hollow',h:2.8},
   rooms:[
    {id:'alley_w',zone:'exterior',kind:'alley',rect:[-2,0,0,31.8]},
    {id:'alley_e',zone:'exterior',kind:'alley',rect:[50,0,52,32]},
    {id:'sidewalk',zone:'exterior',kind:'street',poly:[[-2,31.8],[41,31.8],[41,32],[52,32],[52,34],[-2,34]]},
    {id:'road',zone:'exterior',kind:'road',rect:[-2,34,52,44],surf:'asphalt'},
    {id:'laundry',name:'Laundry',kind:'utility',rect:[0,0,4.5,7.6]},
    {id:'maint',name:'Maintenance',kind:'workshop',rect:[4.5,0,9.4,7.6]},
    ...lotRear.rooms,
    {id:'hk',name:'Housekeeping',kind:'utility',rect:[42.2,0,45,7.6]},
    {id:'walk_r',name:'Rear walkway',zone:'exterior',kind:'walk',rect:[0,7.6,45,9.4],roof:true},
    {id:'walk_w',name:'West walkway',zone:'exterior',kind:'walk',poly:[[7.6,9.4],[9.4,9.4],[9.4,31.8],[0,31.8],[0,29.9],[7.6,29.9]],roof:true},
    ...west.rooms,
    {id:'parking',name:'Courtyard lot',zone:'exterior',kind:'lot',rect:[9.4,9.4,41,31.8],surf:'asphalt'},
    {id:'st_w',name:'West stair',zone:'exterior',kind:'stair',in:'parking',rect:[9.4,9.4,10.8,13.8]},
    {id:'pool',name:'Pool court',zone:'exterior',kind:'court',in:'parking',rect:[26.5,10.6,41,20],surf:'tile'},
    {id:'island',name:'Landscape island',zone:'exterior',kind:'planter',in:'parking',rect:[21,20,27,25.5],y:.3,surf:'grass'},
    {id:'pc',name:'Porte-cochère',zone:'exterior',kind:'canopy',in:'parking',rect:[36,26,41,31.8],roof:true},
    {id:'ice',name:'Ice / vending',kind:'special',rect:[41,9.4,43.6,12.4],shell:'cmu_hollow'},
    {id:'chase',name:'Pool plant chase',kind:'core',sealed:true,rect:[41,12.4,43.6,14],shell:'cmu_hollow'},
    {id:'st_e',name:'East stair',zone:'exterior',kind:'stair',rect:[43.6,9.4,45,14]},
    {id:'pump',name:'Pump room',kind:'plant',rect:[41,14,45,20],shell:'cmu_hollow'},
    {id:'yard',name:'Service yard',zone:'exterior',kind:'yard',rect:[45,0,50,20]},
    {id:'mgr_bed',name:"Manager's bedroom",kind:'bedroom',rect:[41,20,44,23.6]},
    {id:'mgr_bath',name:"Manager's bath",kind:'bath',rect:[41,23.6,44,26]},
    {id:'mgr_liv',name:"Manager's living",kind:'living',rect:[44,20,50,26]},
    {id:'lobby',name:'Office / lobby',kind:'reception',rect:[41,26,46.5,32]},
    {id:'bo',name:'Back office',kind:'office',rect:[46.5,26,50,32]},
   ],
   edges:[
    {rooms:['yard',[null,'alley_e','walk_r','st_e']],build:'cmu_hollow',cov:'full',h:2.1},
    {rooms:['alley_w','walk_w'],build:'cmu_hollow',cov:'full',h:2.1},
    {rooms:['pool',['parking','island']],...RAIL},
    {rooms:['sidewalk',['walk_w','parking']],build:'cbs_ext',cov:'waist',h:.9},
    {rooms:['ice','walk_r'],none:true},
    {rooms:['mgr_liv','mgr_bed'],build:'stud_wood_gyp'},
    {rooms:['mgr_bed','mgr_bath'],build:'stud_wood_gyp'},
   ],
   doors:[
    ...lotRear.doors,...west.doors,
    {id:'d103_104',rooms:['r103','r104'],at:[21.7,4.6],w:.91,kind:'door_solid',hinge:'n'},
    {id:'d106_107',rooms:['r106','r107'],at:[34,5.05],w:.9,kind:'door_solid',hinge:'n'},
    {id:'d_laundry',rooms:['laundry','walk_r'],at:[2.2,7.6],w:.91,kind:'door_metal'},
    {id:'d_laundry_maint',rooms:['laundry','maint'],at:[4.5,5],w:.91,kind:'door_metal'},
    {id:'e5_laundry_alley',rooms:['laundry','alley_w'],at:[0,4.5],w:1,kind:'door_metal'},
    {id:'d_maint',rooms:['maint','walk_r'],at:[7,7.6],w:.91,kind:'door_metal'},
    {id:'d_hk',rooms:['hk','walk_r'],at:[43.6,7.6],w:.91,kind:'door_metal'},
    {id:'d_hk_yard',rooms:['hk','yard'],at:[45,4],w:.91,kind:'door_metal'},
    {id:'gate_pool_n',rooms:['pool','parking'],at:[33.6,10.6],w:1.2,kind:'open'},
    {id:'gate_pool_w',rooms:['pool','parking'],at:[26.5,15.6],w:1.2,kind:'open'},
    {id:'gate_pool_s',rooms:['pool','parking'],at:[33.6,20],w:1.2,kind:'open'},
    {id:'d_pump_pool',rooms:['pump','pool'],at:[41,17],w:.91,kind:'door_metal'},
    {id:'d_pump_yard',rooms:['pump','yard'],at:[45,17],w:.91,kind:'door_metal'},
    {id:'e8_yard_gate',rooms:['yard','alley_e'],at:[50,10],w:2,kind:'open'},
    {id:'d_mgr_yard',rooms:['mgr_liv','yard'],at:[47.5,20],w:.91,kind:'door_solid'},
    {id:'d_mgr_bed',rooms:['mgr_liv','mgr_bed'],at:[44,21.2],w:.8,kind:'door_hollow'},
    {id:'d_mgr_bath',rooms:['mgr_bed','mgr_bath'],at:[42.8,23.6],w:.76,kind:'door_hollow'},
    {id:'d_bo_mgr',rooms:['bo','mgr_liv'],at:[48.2,26],w:.91,kind:'door_solid'},
    {id:'d_counter_flap',rooms:['lobby','bo'],at:[46.5,31],w:.9,kind:'open'},
    {id:'d_lobby_glass',rooms:['lobby','pc'],at:[41,30.3],w:1,kind:'glass'},
    {id:'e6_lobby_street',rooms:['lobby','sidewalk'],at:[43.6,32],w:1.2,kind:'door_solid'},
    {id:'e7_bo_alley',rooms:['bo','alley_e'],at:[50,28.5],w:1,kind:'door_metal'},
    {id:'e1_in_drive',rooms:['parking','sidewalk'],at:[18,31.8],w:6,kind:'open'},
    {id:'e3_ped_walk',rooms:['walk_w','sidewalk'],at:[8.5,31.8],w:1.8,kind:'open'},
   ],
   windows:[...lotRear.windows,...west.windows,
    {id:'storefront',rooms:['lobby','pc'],at:[41,27.9],w:2.8,y0:.6,y1:2.6,build:'glass_tempered_6'}],
   ground:[{id:'pool_water',poly:[[28.5,12.6],[39.5,12.6],[39.5,18.1],[28.5,18.1]],y:-1.5,surf:'water'}],
   props:[...cars,
    {id:'pier_n',at:[36.2,26.2],size:[.4,.4],build:'cmu_filled',cov:'full',h:2.8},
    {id:'pier_s',at:[36.2,31.4],size:[.4,.4],build:'cmu_filled',cov:'full',h:2.8},
    {id:'palm_a',at:[23,22],size:[.35,.35],build:'timber_pile',cov:'full',h:4},
    {id:'palm_b',at:[25,23.6],size:[.35,.35],build:'timber_pile',cov:'full',h:4},
    {id:'lounger_a',at:[30.5,11.3],size:[1.9,.7],build:'mattress',cov:'waist',h:.4},
    {id:'lounger_b',at:[36,11.3],size:[1.9,.7],build:'mattress',cov:'waist',h:.4},
    {id:'ice_machine',at:[41.6,11.9],size:[.8,.7],build:'steel_3mm',cov:'chest',h:1.5},
    {id:'cola_machine',at:[42.6,11.9],size:[.8,.7],build:'steel_3mm',cov:'chest',h:1.5},
    {id:'dumpster',at:[47.5,1.2],size:[1.8,1.1],build:'steel_3mm',cov:'chest',h:1.3},
    {id:'counter',at:[44.3,28.6],size:[.6,4.6],build:'counter_cabinet',cov:'waist',h:.9},
    {id:'safe',at:[49.4,26.6],size:[.7,.7],build:'steel_10mm',cov:'full',h:1.7},
   ],
   spawns:[
    {id:'p_in',kind:'player',at:[18,33]},
    {id:'arr_w',kind:'arrive',at:[11.6,12.6]},{id:'arr_e',kind:'arrive',at:[44.3,10.3]},
    {id:'e_lookout_car',kind:'enemy',role:'lookout',at:[15.8,20.8]},
    {id:'e_dealer_a',kind:'enemy',role:'dealer',at:[32.5,12.1]},{id:'e_dealer_b',kind:'enemy',role:'dealer',at:[40.1,16]},
    {id:'c_client_a',kind:'civ',role:'client',at:[40.1,14.4]},{id:'c_client_b',kind:'civ',role:'client',at:[27.4,18.8]},
    {id:'c_clerk',kind:'civ',role:'clerk',at:[45.3,28.5]},
    {id:'e_patrol_a',kind:'enemy',role:'patrol',at:[14,8.5]},{id:'e_patrol_b',kind:'enemy',role:'patrol',at:[38,8.5]},
    {id:'e_dealer_111',kind:'enemy',role:'dealer',at:[5,19]},
   ],
   stairs:[{id:'stair_w',room:'st_w',at:[10.1,13.2],to:'f2',arrive:'arr_w2',rise:3},{id:'stair_e',room:'st_e',at:[44.3,13.2],to:'f2',arrive:'arr_e2',rise:3}],
   stash:[{id:'stash_111',at:[6.5,18.4]}],
   targets:{
    area:{...guestArea([...range(101,108),...range(109,113)]),r101_bath:4.8,r110_bath:4.8,laundry:34.2,maint:37.2,hk:21.3,walk_r:81,st_w:6.2,ice:7.5,
     pool:136.3,pump:24,yard:100,island:33,mgr_liv:36,mgr_bed:10.8,mgr_bath:7.2,lobby:33,bo:21},
    ent:{...guestEnt([...range(101,108),...range(109,113)],[103,104,106,107]),laundry:3,maint:2,hk:2,ice:1,pool:4,pump:2,yard:4,mgr_liv:3,mgr_bed:2,mgr_bath:1,lobby:3,bo:3},
    entries:{outside:['sidewalk','alley_w','alley_e','road'],n:8},
    sight:[
     {id:'S1',from:[18,32.5],to:[18,8.5],expect:'clear'},
     {id:'S2',from:[9.6,8.5],to:[44.8,8.5],expect:'clear'},
     {id:'S3',from:[42,29],to:[16,29],expect:'clear'},
     {id:'S4',from:[42,29],to:[47,23],expect:'blocked'},
     {id:'S5',from:[27,11],to:[40.5,19.5],expect:'clear'},
     {id:'S6',from:[8.5,30],to:[8.5,10],expect:'clear'},
     {id:'S7',from:[20.6,4],to:[20.6,12],expect:'blocked'},
     {id:'S7_open',from:[20.6,4],to:[20.6,12],open:['d103'],expect:'clear'},
    ],
    loops:[
     {id:'L2',rooms:['walk_w','walk_r','parking','pool','parking','walk_w']},
     {id:'L3',rooms:['lobby','bo','mgr_liv','yard','pump','pool','parking','pc','lobby']},
     {id:'L6',rooms:['alley_w','walk_r','laundry','alley_w']},
    ],
   }},
  f2:{bounds:[8,0,46,14],combat:true,elevated:true,floorH:3,defaults:{shell:'cbs_ext',part:'cmu_hollow',h:2.8},
   backdrop:[{stage:'lot',dy:-3}],
   rooms:[...f2Rear.rooms,
    {id:'roof_hk',name:'Housekeeping roof',zone:'exterior',kind:'roof',rect:[42.2,0,45,7.6]},
    {id:'balc',name:'Upper balcony',zone:'exterior',kind:'walk',rect:[9.4,7.6,45,9.4]},
    {id:'st_w2',name:'West stair head',zone:'exterior',kind:'stair',rect:[9.4,9.4,10.8,13.8]},
    {id:'st_e2',name:'East stair head',zone:'exterior',kind:'stair',rect:[43.6,9.4,45,13.8]},
   ],
   edges:[{rooms:[null,['balc','roof_hk','st_w2','st_e2']],...RAIL}],
   doors:[...f2Rear.doors,
    {id:'hole_204_205',rooms:['r204','r205'],at:[25.8,4],w:1.2,kind:'open',y1:2},
    {id:'d206_207',rooms:['r206','r207'],at:[34,5.05],w:.9,kind:'door_solid',hinge:'n'}],
   windows:f2Rear.windows,
   props:[{id:'barricade_205',at:[28.8,6.6],size:[1.4,.3],build:'mattress',cov:'chest',h:1.2}],
   spawns:[
    {id:'arr_w2',kind:'arrive',at:[11.6,8.5]},{id:'arr_e2',kind:'arrive',at:[43,8.5]},
    {id:'c_201',kind:'civ',at:[12,4]},
    {id:'e_lookout_203',kind:'enemy',role:'lookout',at:[19,6.5]},
    {id:'e_cook_a',kind:'enemy',role:'cook',at:[24.5,4.6]},{id:'e_cook_b',kind:'enemy',role:'cook',at:[27,3.6]},{id:'e_guard_205',kind:'enemy',role:'guard',at:[27.2,5.8]},
    {id:'e_counter',kind:'enemy',role:'counter',at:[32,4]},
    {id:'e_crew_a',kind:'enemy',role:'crew',at:[35,3.4]},{id:'e_crew_b',kind:'enemy',role:'crew',at:[36.5,5]},{id:'e_crew_c',kind:'enemy',role:'crew',at:[35.2,6.4]},
    {id:'e_boss',kind:'enemy',role:'boss',at:[41,4]},{id:'e_bodyguard',kind:'enemy',role:'bodyguard',at:[39.6,5.6]},
   ],
   stairs:[{id:'stair_w2',room:'st_w2',at:[10.1,12.6],to:'lot',arrive:'arr_w',rise:-3},{id:'stair_e2',room:'st_e2',at:[44.3,12.6],to:'lot',arrive:'arr_e',rise:-3}],
   obj:[{id:'obj_lab',kind:'target',what:'lab',at:[24.6,1.6]},{id:'obj_cash',kind:'use',what:'cash',at:[33,1.2]}],
   targets:{
    area:{...guestArea(range(201,208)),r201_bath:4.8,balc:64.1},
    ent:{...guestEnt(range(201,208),[204,205,206,207])},
    sight:[
     {id:'S8',from:[9.8,8.5],to:[44.5,8.5],expect:'clear'},
     {id:'S9',from:[23.5,4],to:[28,4],expect:'clear'},
     {id:'S10',from:[32,5],to:[36,5],expect:'blocked'},
    ],
    loops:[{id:'L5',rooms:['r204','r205','balc','r204']}],
   }},
 }};
})();
