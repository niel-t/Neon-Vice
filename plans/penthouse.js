'use strict';
// The Penthouse (Coral Tower) as plan v1 data. Source: docs/levels/penthouse.md + penthouse.layout.json (x east, z south, metres).
// Room kinds per docs/levels/STYLE.md §1.4; layout settlements against the brief are listed in docs/PLAN-FORMAT.md §Penthouse.
PLANS.penthouse=(()=>{
 const H=2.7,COL={build:'rc_column_40',cov:'full',h:H},GLASS={build:'glass_annealed_6',cov:'glass',h:H};
 const rooms=[
  {id:'staff',name:'Staff bedroom',kind:'bedroom',style:'commercial',rect:[0,0,4,5]},
  {id:'laundry',name:'Laundry',kind:'utility',style:'commercial',rect:[4,0,7,5]},
  {id:'pantry',name:"Butler's pantry",kind:'store',rect:[7,0,9.5,5]},
  {id:'kitchen',name:'Kitchen',kind:'kitchen',rect:[9.5,0,14.5,5]},
  {id:'svc_hall',name:'Service hall',kind:'circulation',style:'commercial',rect:[0,5,14.5,6.8]},
  {id:'breakfast',name:'Breakfast room',kind:'dining',rect:[14.5,0,18,6.8]},
  {id:'dining',name:'Dining room + bar',kind:'dining',rect:[18,0,24.6,6.8]},
  {id:'stair_b',name:'Stair B',kind:'stair',rect:[24.6,0,27.6,4.5]},
  {id:'stair_b_lobby',name:'Stair B lobby',kind:'circulation',rect:[24.6,4.5,27.6,6.8]},
  {id:'stair_a',name:'Stair A',kind:'stair',rect:[8.8,6.8,11.8,11.4]},
  {id:'svc_lift',name:'Service lift',kind:'core',rect:[11.8,6.8,14.4,9.6]},
  {id:'shaft_1',name:'Shafts',kind:'core',sealed:true,rect:[14.4,6.8,16,11.4]},
  {id:'shaft_2',name:'Shafts',kind:'core',sealed:true,rect:[11.8,9.6,14.4,11.4]},
  {id:'shaft_3',name:'Shafts',kind:'core',sealed:true,rect:[8.8,11.4,10.8,14]},
  {id:'lift_p1',name:'Private lift',kind:'core',rect:[10.8,11.4,13.2,14]},
  {id:'lift_p2',name:'Passenger lift',kind:'core',rect:[13.2,11.4,15.6,14]},
  {id:'shaft_4',name:'Shaft',kind:'core',sealed:true,rect:[15.6,11.4,16,14]},
  {id:'gal_w',name:'West gallery',kind:'circulation',rect:[7,6.8,8.8,21.6]},
  {id:'ga_bed',name:'Guest A bedroom',kind:'bedroom',rect:[0,6.8,4.2,11]},
  {id:'ga_bath',name:'Guest A bath',kind:'bath',rect:[4.2,6.8,7,9.4]},
  {id:'ga_pass',name:'Guest A dressing passage',kind:'closet',rect:[4.2,9.4,7,11]},
  {id:'gb_bed',name:'Guest B bedroom',kind:'bedroom',rect:[0,11,4.2,15.2]},
  {id:'gb_pass',name:'Guest B dressing passage',kind:'closet',rect:[4.2,11,7,12.6]},
  {id:'gb_bath',name:'Guest B bath',kind:'bath',rect:[4.2,12.6,7,15.2]},
  {id:'wine',name:'Wine room',kind:'store',rect:[0,15.2,5,17.6]},
  {id:'powder',name:'Powder room',kind:'bath',rect:[5,15.2,7,17.6]},
  {id:'den',name:'Den / TV room',kind:'living',rect:[0,17.6,7,21.6]},
  {id:'panic',name:'Panic room',kind:'secure',rect:[8.8,14,10.8,19.8]},
  {id:'gal_s',name:'South gallery',kind:'circulation',rect:[8.8,19.8,10.8,21.6]},
  {id:'vest',name:'Lift vestibule',kind:'circulation',rect:[10.8,14,16,17.2]},
  {id:'foyer',name:'Foyer',kind:'circulation',rect:[10.8,17.2,16,21.6]},
  {id:'great',name:'Great room',kind:'living',rect:[16,6.8,27.6,13]},
  {id:'gal_e',name:'East gallery',kind:'circulation',rect:[16,13,17.8,21.6]},
  {id:'m_dress',name:'Master dressing room',kind:'closet',rect:[17.8,13,21.6,16]},
  {id:'m_ante',name:'Master anteroom',kind:'circulation',rect:[17.8,16,21.6,18]},
  {id:'study',name:'Study',kind:'office',rect:[17.8,18,21.6,21.6]},
  {id:'m_bed',name:'Master bedroom',kind:'bedroom',rect:[21.6,13,27.6,18]},
  {id:'m_bath',name:'Master bath',kind:'bath',rect:[21.6,18,27.6,21.6]},
  {id:'ter_e',name:'East terrace',zone:'exterior',kind:'terrace',rect:[27.6,0,30,24],surf:'tile'},
  {id:'ter_s',name:'South terrace',zone:'exterior',kind:'terrace',rect:[0,21.6,27.6,24],surf:'tile'},
 ];
 // brief §7: core edges rc_wall_20, panic-room edges cmu_filled, east/south façade glass, §7.2 double-board partitions.
 // Generated per touching room pair so precedence is explicit (core > panic > façade > stud2) and no pair repeats.
 const CORE=new Set(['stair_a','stair_b','svc_lift','lift_p1','lift_p2','shaft_1','shaft_2','shaft_3','shaft_4']);
 const TERRACE=new Set(['ter_e','ter_s']),R=Object.fromEntries(rooms.map(r=>[r.id,r.rect]));
 const touch=(a,b)=>{const [ax0,az0,ax1,az1]=R[a],[bx0,bz0,bx1,bz1]=R[b];
  return((ax1===bx0||bx1===ax0)&&Math.min(az1,bz1)-Math.max(az0,bz0)>0)||((az1===bz0||bz1===az0)&&Math.min(ax1,bx1)-Math.max(ax0,bx0)>0);};
 const STUD2=[['svc_hall',['staff','laundry','pantry','kitchen','breakfast']],['gal_w',['ga_bath','ga_pass','gb_pass','gb_bath','powder','den']],
  ['ga_bed','gb_bed'],['ga_pass','gb_pass'],['wine',['gb_bed','gb_bath']],['powder','gb_bath'],['vest',['gal_e','foyer']],
  ['gal_e',['m_dress','m_ante','study']],['m_bed',['m_dress','m_ante','great']],['m_bath','study']];
 const edges=[],done=new Set(),ids=Object.keys(R);
 const add=(a,b,o)=>{const k=[a,b].sort().join('|');if(done.has(k)||!touch(a,b))return;done.add(k);edges.push({rooms:[a,b],...o});};
 for(const a of ids)for(const b of ids)if(a<b&&(CORE.has(a)||CORE.has(b)))add(a,b,{build:'rc_wall_20'});
 for(const b of ids)if(b!=='panic')add('panic',b,{build:'cmu_filled'});
 for(const t of TERRACE)for(const a of ids)if(!TERRACE.has(a))add(a,t,GLASS);
 for(const [a,bs] of STUD2)for(const b of [].concat(bs))add(a,b,{build:'stud_steel_gyp2'});
 edges.push({rooms:['stair_b',null],build:'rc_wall_20'},{rooms:[null,['ter_e','ter_s']],build:'steel_3mm',cov:'rail',h:1.1});
 const door=(id,a,b,at,w,kind,hinge)=>({id,rooms:[a,b],at,w,kind,...(hinge?{hinge}:{})});
 const ribbon=(id,room,at,w)=>({id,rooms:[room,null],at,w,y0:.9,y1:2.4});
 return{id:'penthouse',v:1,name:'The Penthouse',style:'high_end',source:'docs/levels/penthouse.md',stages:{
  ph:{bounds:[0,0,30,24],combat:true,elevated:true,floorH:3.3,defaults:{shell:'cbs_ext',part:'stud_steel_gyp',inner:'stud_steel_gyp',h:H},
   rooms,edges,
   doors:[
    door('D1','staff','svc_hall',[2,5],.9,'door_solid'),
    door('D2','laundry','svc_hall',[5.5,5],.9,'door_hollow'),
    door('D3','pantry','svc_hall',[8.2,5],.9,'door_hollow'),
    door('D4','pantry','kitchen',[9.5,2.5],1,'open'),
    door('D5','kitchen','svc_hall',[13,5],.9,'door_solid'),
    door('D6','kitchen','breakfast',[14.5,4],1.2,'open'),
    door('D7','svc_hall','breakfast',[14.5,5.9],.9,'door_solid'),
    door('D8','svc_hall','stair_a',[10.3,6.8],1,'door_metal'),
    door('D9','svc_hall','svc_lift',[13.1,6.8],1.1,'door_metal'),
    door('D10','svc_hall','gal_w',[7.9,6.8],.9,'door_solid'),
    door('D11','breakfast','dining',[18,1],1.5,'open'),
    door('D12','dining','great',[21,6.8],5,'open'),
    door('D13','stair_b_lobby','great',[26.1,6.8],1.2,'open'),
    door('D14','stair_b_lobby','dining',[24.6,5.6],.9,'open'),
    door('D15','stair_b','stair_b_lobby',[26.1,4.5],1,'door_metal'),
    door('D16','gal_w','ga_pass',[7,10.2],.9,'door_solid'),
    door('D17','ga_pass','ga_bed',[4.2,10.2],.9,'door_hollow'),
    door('D18','ga_pass','ga_bath',[5.6,9.4],.8,'door_hollow'),
    door('D19','gal_w','gb_pass',[7,11.8],.9,'door_solid'),
    door('D20','gb_pass','gb_bed',[4.2,11.8],.9,'door_hollow'),
    door('D21','gb_pass','gb_bath',[5.6,12.6],.8,'door_hollow'),
    door('D22','gal_w','powder',[7,16.4],.8,'door_hollow'),
    door('D23','gal_w','den',[7,19.6],1.2,'open'),
    door('D24','den','wine',[2.5,17.6],.9,'door_solid'),
    // D25/D26/D32: brief 1.8 m (full gallery width) narrowed to 1.4 m arches to clear the wall junctions at each end
    door('D25','gal_w','gal_s',[8.8,20.7],1.4,'open'),
    door('D26','gal_s','foyer',[10.8,20.7],1.4,'open'),
    door('D27','gal_w','panic',[8.8,16.9],.9,'door_vault'),
    door('D28','vest','lift_p1',[12,14],1.1,'door_metal'),
    door('D29','vest','lift_p2',[14.4,14],1.1,'door_metal'),
    door('D30','vest','foyer',[13.4,17.2],2.4,'open'),
    door('D31','foyer','gal_e',[16,19.4],1.8,'open'),
    door('D32','gal_e','great',[16.9,13],1.4,'open'),
    door('D33','gal_e','m_ante',[17.8,17],.9,'door_solid'),
    door('D34','gal_e','study',[17.8,19.8],.9,'door_solid'),
    door('D35','m_ante','m_dress',[19.7,16],.9,'open'),
    door('D36','m_ante','m_bed',[21.6,17],.9,'door_solid'),
    door('D37','m_dress','m_bed',[21.6,14.5],.9,'open'),
    door('D38','m_bed','m_bath',[24.6,18],.9,'door_hollow'),
    door('D39','great','ter_e',[27.6,8.6],2.4,'glass'),
    door('D40','great','ter_e',[27.6,11.2],2.4,'glass'),
    door('D41','m_bed','ter_e',[27.6,15.5],3,'glass'),
    door('D42','gal_e','ter_s',[16.9,21.6],1.5,'glass'),
    door('D43','den','ter_s',[2.5,21.6],3,'glass'),
    // D44 (ter_s ↔ ter_e) is the open terrace corner: an unwalled exterior boundary, so it is an edge portal, not a door
   ],
   // brief §5.2: ribbon windows above a 0.9 m spandrel on the north and west (Brickell) façades, clear of the façade columns
   windows:[
    ribbon('W_staff','staff',[2,0],3),ribbon('W_laundry','laundry',[5.5,0],2.2),ribbon('W_kitchen','kitchen',[11.8,0],4),
    ribbon('W_breakfast','breakfast',[16.25,0],2.6),ribbon('W_dining_w','dining',[19.5,0],2.2),ribbon('W_dining_e','dining',[22.8,0],2.8),
    ribbon('W_ga','ga_bed',[0,9.05],3.1),ribbon('W_gb','gb_bed',[0,12.45],2.1),ribbon('W_den','den',[0,19.6],3),
   ],
   props:[
    // §7.1 structure: great-room columns (G) and façade columns (P)
    {id:'col_great_w',at:[19.8,11.4],size:[.4,.4],...COL},{id:'col_great_e',at:[23.8,11.4],size:[.4,.4],...COL},
    ...[[27.6,0],[27.6,6.8],[27.6,13],[27.6,18],[27.6,21.6],[0,21.6],[7,21.6],[14,21.6],[21.6,21.6],[7,0],[14.5,0],[21,0],[0,7],[0,14]]
     .map(([x,z])=>({id:`col_${x}_${z}`.replace(/\./g,'p'),at:[x,z],size:[.4,.4],...COL})),
    // §6.3 soft cover that reads as hard: bar, kitchen joinery, sofas; terrace planters stop handguns
    {id:'bar',at:[23.4,2.5],size:[.6,3],build:'counter_cabinet',cov:'waist',h:1.05},
    {id:'k_run',at:[12,.4],size:[4.4,.6],build:'counter_cabinet',cov:'waist',h:.9},
    {id:'k_island',at:[12,2.5],size:[2.4,1],build:'counter_cabinet',cov:'waist',h:.9},
    {id:'sofa_great_n',at:[22,8.2],size:[3,.9],build:'sofa',cov:'waist',h:.8},
    {id:'sofa_great_s',at:[22,10.6],size:[3,.9],build:'sofa',cov:'waist',h:.8},
    {id:'sofa_den',at:[4.5,19.2],size:[2.4,.9],build:'sofa',cov:'waist',h:.8},
    {id:'planter_e_n',at:[29.5,4],size:[.6,1.6],build:'cbs_ext',cov:'waist',h:.9},
    {id:'planter_e_s',at:[29.5,19],size:[.6,1.6],build:'cbs_ext',cov:'waist',h:.9},
    {id:'planter_s_w',at:[6,23.6],size:[1.6,.6],build:'cbs_ext',cov:'waist',h:.9},
    {id:'planter_s_e',at:[20,23.6],size:[1.6,.6],build:'cbs_ext',cov:'waist',h:.9},
   ],
   // §6.1 entries E1–E5 (E6 roof waits for multi-stage stairs) and §6.6 roles
   spawns:[
    {id:'p_in',kind:'player',at:[12,12.7]},
    {id:'arr_e2',kind:'arrive',at:[14.4,12.7]},{id:'arr_e3',kind:'arrive',at:[13.1,8.2]},
    {id:'arr_e4',kind:'arrive',at:[10.3,9.1]},{id:'arr_e5',kind:'arrive',at:[26.1,2.25]},
    {id:'e_door_a',kind:'enemy',role:'guard',at:[12.2,19.6]},{id:'e_door_b',kind:'enemy',role:'guard',at:[14.6,19.6]},
    {id:'e_party_a',kind:'enemy',role:'bodyguard',at:[18.2,9.5]},{id:'e_party_b',kind:'enemy',role:'bodyguard',at:[25.2,9.5]},
    {id:'e_party_c',kind:'enemy',role:'bodyguard',at:[22,12.3]},
    {id:'e_bar',kind:'enemy',role:'guard',at:[19.5,5]},{id:'c_bartender',kind:'civ',role:'bartender',at:[24.1,2.5]},
    {id:'c_cook',kind:'civ',role:'cook',at:[11,1.4]},{id:'c_maid',kind:'civ',role:'maid',at:[1.2,5.9]},
    {id:'e_svc',kind:'enemy',role:'guard',at:[6.5,5.9]},
    {id:'e_rover_w',kind:'enemy',role:'rover',at:[7.9,13.5]},{id:'e_rover_den',kind:'enemy',role:'rover',at:[3.5,20.3]},
    {id:'e_boss',kind:'enemy',role:'boss',at:[24.5,15.8]},{id:'e_close',kind:'enemy',role:'bodyguard',at:[19.7,17]},
    {id:'e_smoker',kind:'enemy',role:'smoker',at:[28.6,3]},
   ],
   targets:{
    area:{staff:20,laundry:15,pantry:12.5,kitchen:25,svc_hall:26.1,breakfast:23.8,dining:44.9,stair_b:13.5,stair_b_lobby:6.9,stair_a:13.8,
     svc_lift:7.3,shaft_1:7.4,shaft_2:4.7,shaft_3:5.2,lift_p1:6.2,lift_p2:6.2,shaft_4:1,gal_w:26.6,ga_bed:17.6,ga_bath:7.3,ga_pass:4.5,
     gb_bed:17.6,gb_pass:4.5,gb_bath:7.3,wine:12,powder:4.8,den:28,panic:11.6,gal_s:3.6,vest:16.6,foyer:22.9,great:71.9,gal_e:15.5,
     m_dress:11.4,m_ante:7.6,study:13.7,m_bed:30,m_bath:21.6,ter_e:57.6,ter_s:66.2},
    ent:{staff:1,laundry:1,pantry:2,kitchen:3,svc_hall:8,breakfast:3,dining:3,stair_b:1,stair_b_lobby:3,stair_a:1,svc_lift:1,lift_p1:1,lift_p2:1,
     gal_w:7,ga_bed:1,ga_bath:1,ga_pass:3,gb_bed:1,gb_pass:3,gb_bath:1,wine:1,powder:1,den:3,panic:1,gal_s:2,vest:3,foyer:3,great:5,gal_e:5,
     m_dress:2,m_ante:3,study:1,m_bed:4,m_bath:1,ter_e:4,ter_s:3},
    entries:{outside:['lift_p1','lift_p2','svc_lift','stair_a','stair_b'],n:5},
    sight:[
     {id:'S1',from:[16.3,10],to:[27.3,10],expect:'clear'},
     {id:'S2',from:[7.9,7],to:[7.9,21.4],expect:'clear'},
     {id:'S3',from:[16.9,13.2],to:[16.9,21.4],expect:'clear'},
     {id:'S4',from:[.3,5.9],to:[14.4,5.9],expect:'clear'},
     {id:'S5',from:[28.8,.3],to:[28.8,23.7],expect:'clear'},
     {id:'S6',from:[.3,22.8],to:[29.7,22.8],expect:'clear'},
     {id:'S7',from:[21,3],to:[21,12.8],expect:'clear'},
     {id:'S8',from:[13.4,14.2],to:[13.4,21.4],expect:'clear'},
     {id:'S9',from:[12,20],to:[20,10],expect:'blocked'},
     {id:'S10',from:[16.9,20],to:[16.9,7],expect:'clear'},
     {id:'S11',from:[26.1,4.7],to:[26.1,12.8],expect:'clear'},
     {id:'S12',from:[27,10],to:[27,15.5],expect:'blocked'},
     {id:'S13',from:[20,8.6],to:[29.5,8.6],expect:'clear'},
     {id:'S14',from:[7.4,20.7],to:[15.8,20.7],expect:'clear'},
     {id:'S15',from:[10,4],to:[17.8,4],expect:'clear'},
     {id:'S16',from:[14.8,1],to:[24.4,1],expect:'clear'},
     {id:'S17',from:[15,15.6],to:[17,15.6],expect:'blocked'},
     {id:'S18',from:[10,2.5],to:[24.4,2.5],expect:'blocked'},
    ],
    links:[{from:'vest',to:'great',without:'D31'},{from:'great',to:'svc_hall',without:'D11'}],
    loops:[
     {id:'L1',rooms:['foyer','gal_e','great','dining','breakfast','kitchen','svc_hall','gal_w','gal_s','foyer']},
     {id:'L2',rooms:['great','ter_e','ter_s','gal_e','great']},
     {id:'L3',rooms:['gal_e','m_ante','m_bed','ter_e','ter_s','gal_e']},
     {id:'L4',rooms:['m_ante','m_dress','m_bed','m_ante']},
     {id:'L5',rooms:['great','stair_b_lobby','dining','great']},
     {id:'L6',rooms:['kitchen','breakfast','svc_hall','kitchen']},
     {id:'L7',rooms:['gal_w','den','ter_s','gal_e','foyer','gal_s','gal_w']},
    ],
   }},
 },
 // User rulings (2026-11-09), inert until the runtime lands: plan.js does not read these.
 rules:{
  breach:{D27:{by:['explosive'],else:['key','script']}},
  rail:{rooms:[null,['ter_e','ter_s']],player:'block',enemy:'knockover'},
  lifts:{rooms:['lift_p1','lift_p2','svc_lift'],doors:'closed_until_W2c'},
 },
};
})();
