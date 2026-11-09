'use strict';
// DECOR (W4c): reusable decor kits per room kind (docs/levels/STYLE.md, R3) and a seeded, deterministic placer.
// DOM/GL-free classic script, placement-agnostic: DECOR.place(room) dresses one room description, and
// DECOR.dressStage(plan,sid) derives those descriptions from PLAN.fromPlan. Solid items go to plan props[]
// (they collide, take shots and block nav); visual items go to decor[] (render-only; rays and nav ignore
// them, decision Q4). Generation runs at load time from levelId+roomId seeds (Q6). Not loaded by the game yet.
const DECOR=(()=>{
 const STYLES=['motel','high_end','deco','marine','commercial'];
 const INTERIOR=['living','dining','kitchen','bedroom','bath','closet','reception','lounge','assembly','retail','office','secure','control','studio','workshop','staff','utility','store','plant','circulation'];
 const EXTERIOR=['walk','terrace','court','lot','street','road','alley','yard','pier','planter'];
 const NO_DECOR=['stair','core','canopy','roof','special'];
 const KINDS=[...INTERIOR,...EXTERIOR,...NO_DECOR];
 const EXT=new Set(EXTERIOR),PUBLIC=new Set(['assembly','retail','reception','court']);
 const COVS=['full','chest','waist'];
 const ART=new Set(['art_print','art_canvas','art_poster','gold_disc','mirror_wall','neon_sign','clock_wall','calendar_pinup','noticeboard','chart_nautical']);

 // ---- §2 items: I(id,[w,d,h],hosts,facing,'build/cov'|0 (visual),clear,styles,extra) ----
 // hosts: wall, corner, free, edge (exterior boundary), mount (wallMount, y = centre), ceiling (y = lowest point),
 // top (on = host items), scatter, plan (plan-authored only; never generated).
 const items={};
 const I=(id,[w,d,h],host,face,solid,clear,styles,x={})=>{const [build,cov]=solid?solid.split('/'):[];
  items[id]={id,w,d,h,host:host.split(','),face,...(build?{build,cov}:{}),clear,styles:styles==='all'?STYLES.slice():styles.split(','),...x};};
 // 2.1 bedroom, living, dining
 I('bed_twin',[.99,1.91,.55],'wall','out','mattress/waist',.9,'all',{side:.6});
 I('bed_double',[1.37,1.91,.55],'wall','out','mattress/waist',.9,'motel,commercial',{side:.6});
 I('bed_queen',[1.52,2.03,.55],'wall','out','mattress/waist',.9,'motel,high_end,marine',{side:.6});
 I('bed_king_platform',[2.15,2.25,.45],'wall','out','mattress/waist',.9,'high_end',{side:.75});
 I('mattress_floor',[1.37,1.91,.2],'scatter','any',0,0,'all');
 I('nightstand',[.5,.4,.6],'wall','out',0,0,'all');
 I('dresser',[1.5,.5,.8],'wall','out','counter_cabinet/waist',.9,'all');
 I('wardrobe',[1.2,.6,2],'wall','out','counter_cabinet/full',.9,'motel,commercial,marine');
 I('wardrobe_mirror',[2.4,.65,2.4],'wall','out','counter_cabinet/full',.9,'high_end');
 I('luggage_rack',[.65,.45,.5],'wall','out',0,0,'motel,high_end');
 I('bench_bed_end',[1.3,.45,.45],'free','pair',0,0,'high_end');
 I('ac_sleeve',[.66,.3,.4],'mount','out',0,.6,'motel,commercial',{y:.55,ext:1});
 I('sofa_3',[2.1,.9,.8],'wall,free','pair','sofa/waist',.45,'all');
 I('sofa_sectional',[3,2.4,.7],'free','pair','sofa/waist',.45,'high_end',{leg:.95});
 I('banquette',[1.5,.6,1.1],'wall,free','table','sofa/waist',.45,'deco,high_end,commercial');
 I('armchair',[.85,.85,.8],'free','pair','sofa/waist',.45,'all');
 I('coffee_table',[1.2,.6,.4],'free','pair','counter_cabinet/waist',0,'high_end,motel');
 I('side_table',[.5,.5,.55],'free','any',0,0,'all');
 I('console_table',[1.2,.4,.8],'wall','out','counter_cabinet/waist',.6,'high_end');
 I('tv_console',[1,.5,.8],'wall','pair','counter_cabinet/waist',0,'motel,high_end');
 I('tv_crt',[.6,.5,.5],'top','pair',0,0,'all',{on:['dresser','back_bar','bar_counter','counter_run','sideboard','console_table']});
 I('vcr',[.43,.35,.1],'top','out',0,0,'all',{on:['tv_console']});
 I('rack_stereo',[.5,.45,1.2],'wall','out',0,.6,'high_end,commercial');
 I('bookcase',[.9,.35,2],'wall','out','counter_cabinet/full',.6,'high_end,commercial');
 I('piano_grand',[1.5,1.6,1],'free','any','steel_3mm/waist',.9,'high_end,commercial'); // W5: pianos are steel_3mm
 I('drinks_trolley',[.8,.45,.8],'free','any',0,0,'high_end');
 I('lamp_floor_arc',[.4,.4,2],'free','pair',0,0,'high_end');
 I('palm_pot',[.6,.6,1.8],'corner,free','any',0,0,'high_end,deco,commercial');
 I('dining_table_4',[1,1,.75],'free','any','counter_cabinet/waist',.75,'all',{round:1,seats:4});
 I('dining_table_8',[2.4,1.1,.75],'free','any','counter_cabinet/waist',.9,'high_end',{round:1,seats:8});
 I('dining_table_12',[3.6,1.2,.75],'free','any','counter_cabinet/waist',.9,'high_end,marine',{round:1,seats:12});
 I('dining_chair',[.45,.5,.9],'free','table',0,0,'all');
 I('sideboard',[1.8,.5,.85],'wall','out','counter_cabinet/waist',.9,'high_end,deco');
 // 2.2 kitchen, bath, utility
 I('counter_run',[1,.6,.9],'wall','out','counter_cabinet/waist',1,'all',{run:1});
 I('island',[1.8,.9,.9],'free','any','counter_cabinet/waist',1,'high_end',{round:1});
 I('fridge',[.8,.75,1.75],'wall','out','car_door/full',1,'all');
 I('range',[.76,.65,.9],'wall','out','car_door/waist',1,'all');
 I('range_commercial',[1.5,.8,.9],'wall','out','steel_3mm/waist',1.2,'commercial,deco,marine');
 I('prep_table',[1.8,.75,.9],'wall,free','any','car_door/waist',1,'commercial');
 I('hotplate_2',[.5,.3,.1],'top','out',0,0,'motel',{on:['counter_run','folding_table']});
 I('microwave',[.5,.38,.3],'top','out',0,0,'all',{on:['counter_run']});
 I('wall_phone',[.1,.08,.22],'mount','out',0,0,'all',{y:1.4});
 I('wc',[.4,.7,.75],'wall','out',0,.6,'all',{side:.2,share:['basin_pedestal','vanity']});
 I('urinal',[.4,.35,.6],'wall','out',0,.6,'commercial,deco',{y:.6});
 I('basin_pedestal',[.55,.45,.85],'wall','out',0,.6,'motel',{share:['wc']});
 I('vanity',[.9,.55,.85],'wall','out','counter_cabinet/waist',.75,'all');
 I('tub',[1.52,.76,.5],'corner','out','steel_3mm/waist',.75,'all',{share:['wc','basin_pedestal','vanity']});
 I('shower_stall',[.9,.9,2],'corner','out',0,.75,'all');
 I('mirror_cabinet',[.6,.12,.75],'mount','out',0,0,'all',{y:1.5});
 I('towel_rail',[.6,.1,.1],'mount','out',0,0,'all',{y:1.2});
 I('stall_partition',[.9,.03,1.8],'plan','out',0,0,'commercial,deco',{note:'author as a plan wall (particle_divider/chest)'});
 I('washer',[.69,.7,.9],'wall','out','car_door/waist',1,'all');
 I('dryer',[.69,.7,.9],'wall','out','car_door/waist',1,'all');
 I('folding_table',[1.8,.75,.75],'free,wall','any','counter_cabinet/waist',.6,'all');
 I('shelving_steel',[1.2,.45,2],'wall','out','steel_3mm/full',.9,'all');
 I('linen_cart',[1,.55,1],'wall,free','any',0,0,'motel,high_end,commercial');
 I('mop_bucket',[.45,.35,.6],'scatter','any',0,0,'all');
 I('mop_sink',[.6,.6,.3],'corner','out',0,.6,'commercial');
 I('workbench',[1.8,.75,.9],'wall','out','counter_cabinet/waist',1,'all');
 I('tool_board',[1.2,.05,.9],'mount','out',0,0,'all',{y:1.5});
 I('switchboard',[2.4,.6,2.1],'wall','out','steel_3mm/full',1,'commercial');
 I('fuse_board',[.5,.15,.8],'mount','out',0,.9,'all',{y:1.5});
 // 2.3 office, control, studio, secure
 I('desk_office',[1.5,.75,.75],'wall,free','path','counter_cabinet/waist',.9,'commercial,motel');
 I('desk_exec',[2,.9,.76],'free','path','counter_cabinet/waist',1,'high_end');
 I('office_chair',[.6,.6,1],'free','pair',0,0,'all');
 I('visitor_chair',[.55,.55,.85],'free','pair',0,0,'all');
 I('filing_cabinet',[.4,.7,1.33],'wall','out','car_door/chest',.9,'commercial,motel,marine');
 I('safe',[.7,.7,1.7],'wall,corner','out','steel_10mm/full',.9,'all');
 I('safe_small',[.5,.5,.6],'wall','out','steel_10mm/waist',.6,'all');
 I('count_table',[2,.9,.9],'free','any','counter_cabinet/waist',.9,'commercial',{round:1});
 I('money_counter',[.3,.3,.25],'top','any',0,0,'commercial',{on:['count_table']});
 I('typewriter',[.48,.4,.2],'top','out',0,0,'all',{on:['desk_office','desk_exec']});
 I('computer_8bit',[.5,.45,.4],'top','out',0,0,'commercial,high_end',{on:['desk_office','desk_exec']});
 I('cctv_bank',[1.5,.6,1.8],'wall','out','steel_3mm/full',1,'commercial,deco');
 I('rack_19',[.6,.8,1.8],'wall','out','steel_3mm/full',1,'commercial');
 I('console_desk',[2.6,1.1,.95],'free','out','counter_cabinet/waist',1,'commercial');
 I('producer_desk',[2.4,.7,.75],'free','out','counter_cabinet/waist',.9,'commercial');
 I('tape_machine',[.9,.8,1.1],'wall,free','out','steel_3mm/waist',1,'commercial');
 I('monitor_soffit',[1,.6,.8],'mount','out',0,0,'commercial',{y:2});
 I('mic_stand',[.6,.6,1.8],'free','any',0,0,'commercial');
 I('gobo',[1.2,.15,1.8],'free','any',0,0,'commercial',{hint:'joinery_ply'}); // W5: hides, is not cover
 I('drum_kit',[2,1.8,1.2],'free','any',0,0,'commercial');
 I('amp_stack',[.75,.4,1.3],'wall,free','out','counter_cabinet/chest',0,'commercial');
 I('tape_shelving',[1.2,.45,2.1],'wall','out','steel_3mm/full',.9,'commercial');
 // 2.4 commercial, arcade, bar, retail
 I('arcade_upright',[.64,.88,1.73],'wall','out','counter_cabinet/full',1.2,'commercial');
 I('arcade_cocktail',[.56,.81,.74],'free','any','counter_cabinet/waist',.6,'commercial',{round:1});
 I('arcade_driver',[.9,1.7,1.8],'wall','out','counter_cabinet/full',.9,'commercial');
 I('pinball',[.74,1.4,1.9],'wall','out','counter_cabinet/waist',1,'commercial');
 I('change_machine',[.55,.5,1.5],'wall','out','steel_3mm/chest',.9,'commercial');
 I('pool_table',[2,1.15,.8],'free','any','counter_cabinet/waist',1.5,'commercial,deco',{round:1}); // W5: counter_cabinet
 I('poker_table',[2.4,1.2,.76],'free','any','counter_cabinet/waist',.9,'commercial,deco',{round:1});
 I('bar_counter',[1,.65,1.07],'free','out','counter_cmu/waist',.9,'deco,commercial,high_end',{run:1,buildBy:{deco:'glass_block'}});
 I('back_bar',[1,.5,.9],'wall','out','counter_cabinet/waist',.9,'deco,high_end',{run:1});
 I('bar_stool',[.4,.4,.75],'free','pair',0,0,'deco,commercial');
 I('cocktail_table',[.6,.6,.75],'free','any',0,0,'deco,high_end',{foot:1.5});
 I('dj_booth',[2.4,1.2,1.1],'plan','out',0,0,'deco');
 I('speaker_stack',[.8,.6,1.8],'corner,free','out','counter_cabinet/full',0,'deco');
 I('cigarette_machine',[.75,.55,1.6],'wall','out','steel_3mm/full',.9,'deco,commercial');
 I('vending_cola',[.8,.7,1.5],'wall','out','steel_3mm/chest',.9,'all');
 I('jukebox',[.95,.65,1.5],'wall','out','counter_cabinet/chest',.9,'deco,commercial');
 I('reception_desk',[2.4,.7,1.07],'free,wall','path','counter_cabinet/waist',1,'all',{back:.9});
 I('bell_ledge',[1.2,.3,1.07],'wall','out',0,0,'motel');
 I('retail_gondola',[1.2,.9,1.5],'free','any','steel_3mm/chest',1.2,'commercial',{round:1});
 I('wall_shelving_retail',[1.2,.4,2.1],'wall','out','steel_3mm/full',1.2,'commercial');
 I('display_case',[1.5,.6,.95],'free,wall','out','glass_tempered_6/waist',1,'commercial,high_end');
 I('cash_wrap',[1.8,.75,1],'free','path','counter_cabinet/waist',1,'commercial',{back:.9});
 I('record_bin',[1.2,.75,.9],'free','any','counter_cabinet/waist',1,'commercial',{round:1});
 I('clothes_rail',[1.2,.6,1.4],'free','any',0,.9,'commercial');
 I('shoe_bench',[1.5,.45,.45],'free','any',0,0,'commercial');
 I('flower_bucket_stand',[1.5,.6,1],'wall','out',0,.9,'commercial');
 I('food_counter',[1,.7,1.07],'wall','out','counter_cabinet/waist',1.2,'commercial',{run:1});
 I('fc_table',[1.22,1.22,.75],'free','any',0,.9,'commercial',{foot:2.2});
 I('bench_mall',[1.8,.5,.45],'free','path',0,0,'commercial');
 I('planter_mall',[1.5,1.5,.6],'free','any','brick_1w/waist',1.2,'commercial',{round:1});
 // 2.5 store, yard, exterior, marine
 I('crate_stack',[1.2,1,1.3],'wall,free','any','counter_cabinet/chest',0,'all',{door:1.2});
 I('pallet_racking',[2.7,1.1,3],'wall','out','steel_3mm/full',2.4,'commercial');
 I('pallet',[1.2,1,.9],'free','any','counter_cabinet/waist',0,'commercial,marine');
 I('drum_55',[.6,.6,.9],'free','any','steel_3mm/waist',0,'all');
 I('dumpster',[1.8,1.1,1.3],'wall','out','steel_3mm/chest',1.2,'all');
 I('trash_can',[.55,.55,.75],'scatter','any',0,0,'all');
 I('hand_truck',[.5,.6,1.2],'scatter','any',0,0,'commercial');
 I('car_parked',[1.85,4.9,1.4],'free','out','car_door/chest',.9,'all');
 I('van_parked',[2,5,2],'free','out','car_door/full',.9,'commercial');
 I('lounger',[.7,1.9,.4],'free','any','mattress/waist',.6,'motel,high_end,marine');
 I('patio_set',[1,1,.75],'free','any',0,.9,'all',{foot:2.4});
 I('palm_ground',[.4,.4,4],'free','any','timber_pile/full',0,'all');
 I('planter_box',[1.2,.6,.6],'wall,free','any','brick_1w/waist',0,'all');
 I('light_pole',[.25,.25,6],'free','any',0,0,'all');
 I('newspaper_box',[.5,.45,1.1],'edge','out',0,0,'commercial,deco');
 I('payphone',[.35,.3,1.9],'wall,free','out',0,0,'all');
 I('bus_bench',[1.8,.6,1],'edge','out',0,0,'all');
 I('fire_hydrant',[.3,.3,.7],'edge','out',0,0,'all');
 I('dock_box',[1.5,.65,.75],'edge','out','dock_box/waist',0,'marine');
 I('bollard_cleat',[.3,.15,.35],'edge','out',0,0,'marine');
 I('pedestal_power',[.3,.3,1.1],'edge','out',0,0,'marine');
 I('fuel_pump_marine',[.6,.5,1.5],'plan','out',0,0,'marine');
 I('life_ring',[.75,.1,.75],'mount','out',0,0,'marine',{y:1.5,ext:1});
 I('rope_coil',[.5,.5,.15],'scatter','any',0,0,'marine');
 I('boat_trailer',[2.5,7,2.5],'free','any','grp_hull/full',.9,'marine,commercial');
 I('deck_chair_marine',[.6,.7,.85],'free','any',0,0,'marine');
 I('outboard_stand',[.6,.9,1.4],'free','any','steel_3mm/chest',.9,'marine');
 I('shrub',[.8,.8,.8],'scatter','any',0,0,'all',{note:'planter planting (§3.2 "shrubs (vis)")'});
 // 2.6 wall art, wall-mount, ceiling, tabletop, scatter: all visual
 I('art_print',[.6,.03,.45],'mount','out',0,0,'motel,commercial',{y:1.5});
 I('art_canvas',[1.5,.04,1.2],'mount','out',0,0,'high_end',{y:1.55});
 I('art_poster',[.6,.02,.9],'mount','out',0,0,'commercial,deco',{y:1.5});
 I('gold_disc',[.4,.03,.5],'mount','out',0,0,'commercial',{y:1.5});
 I('mirror_wall',[1.2,.01,2],'mount','out',0,0,'high_end,deco',{y:1.2});
 I('neon_sign',[1.2,.1,.5],'mount','out',0,0,'deco,commercial',{y:2.1});
 I('clock_wall',[.3,.05,.3],'mount','out',0,0,'commercial,motel',{y:2});
 I('calendar_pinup',[.3,.01,.45],'mount','out',0,0,'commercial',{y:1.5});
 I('sign_exit',[.35,.1,.2],'mount','out',0,0,'commercial,deco',{y:2.2});
 I('noticeboard',[.9,.03,.6],'mount','out',0,0,'commercial',{y:1.5});
 I('fire_ext',[.2,.15,.55],'mount','out',0,0,'all',{y:1.1});
 I('chart_nautical',[.9,.03,.6],'mount','out',0,0,'marine',{y:1.5});
 I('porthole',[.4,.05,.4],'mount','out',0,0,'marine',{y:1.5,hull:1});
 I('fluoro_troffer',[.6,1.2,.1],'ceiling','any',0,0,'commercial');
 I('ceiling_fan',[1.3,1.3,.4],'ceiling','any',0,0,'motel,high_end',{y:2.3});
 I('chandelier',[.9,.9,.9],'ceiling','any',0,0,'high_end',{minY:1.9});
 I('track_light',[1.5,.1,.15],'ceiling','any',0,0,'high_end,commercial');
 I('mirror_ball',[.5,.5,.5],'ceiling','any',0,0,'deco');
 I('light_rig',[3,.3,.3],'ceiling','any',0,0,'deco');
 I('smoke_detector',[.15,.15,.05],'ceiling','any',0,0,'all');
 I('ashtray',[.15,.15,.04],'top','any',0,0,'all',{on:['coffee_table','dining_table_4','bar_counter','desk_office','desk_exec','poker_table','side_table','nightstand']});
 I('phone_desk',[.22,.22,.1],'top','out',0,0,'all',{on:['desk_office','desk_exec','nightstand','reception_desk']});
 I('lamp_table',[.35,.35,.6],'top','any',0,0,'all',{on:['nightstand','side_table','desk_office','desk_exec']});
 I('glasses_bottles',[.4,.2,.3],'top','any',0,0,'deco,high_end',{on:['bar_counter','back_bar','sideboard','drinks_trolley']});
 I('cash_register',[.4,.45,.3],'top','out',0,0,'commercial,deco',{on:['cash_wrap','bar_counter','reception_desk','food_counter']});
 I('paperwork',[.3,.25,.05],'top','any',0,0,'commercial',{on:['desk_office','desk_exec','count_table','folding_table','reception_desk']});
 I('money_stacks',[.4,.3,.15],'plan','any',0,0,'commercial',{note:'mission props are plan-authored'});
 I('magazine_pile',[.3,.25,.05],'top,scatter','any',0,0,'all',{on:['coffee_table','side_table','nightstand']});
 I('rug',[2.4,1.7,.01],'scatter','any',0,0,'high_end,motel',{rug:1});
 I('bags_luggage',[.7,.25,.5],'scatter','any',0,0,'all');
 I('boxes_cardboard',[.5,.4,.4],'scatter','any',0,0,'commercial');
 I('litter',[.3,.3,.02],'scatter','any',0,0,'all',{outside:1});
 I('cone_wet',[.3,.3,.6],'scatter','any',0,0,'commercial');

 // ---- §3 kits: DECOR.kits[kind][style] = {req, opt:[[entry,weight]], cap, scatter, art:[perM,max], min, uses} ----
 // Entries: 'id' | {i:id, n, on, above, under:'window', wall:'hull'|'longest', face:'door', at:'exit', anchor:'bed',
 // minA, style, use, per:{m2|len}, w} | {g:group, ...} | {row:id, n|per|each:'long'|every} (a run along a wall) |
 // {rows:id} (free rows, repeated) | {rep:id} (repeated free item) | {edge:id, pitch} (along open/water edges).
 // `uses` holds per-room-use variants (room.use; the first key is the default) merged over the kit.
 const kits={};
 const K=(kind,styles,kit)=>{kits[kind]??={};for(const s of styles==='all'?STYLES:styles.split(','))kits[kind][s]=kit;};
 const bedSizes={motel:[['bed_double',2],['bed_queen',1],['bed_double',1],['bed_twin',1]],high_end:[['bed_king_platform',1],['bed_queen',1],['bed_double',1],['bed_twin',1]],
  marine:[['bed_queen',1],['bed_double',1],['bed_twin',1]],commercial:[['bed_twin',2],['bed_twin',1]]};
 K('bedroom','motel',{req:[{i:'ac_sleeve',under:'window'},{g:'bed',beds:bedSizes.motel},{i:'dresser',top:'tv_crt',alt:['tv_console']}],
  opt:[['wardrobe',2],['luggage_rack',2],['armchair',1],[{g:'dine',table:'dining_table_4',chairs:2},1],['bags_luggage',2]],cap:.35,scatter:.5,art:[.25,2],min:9});
 K('bedroom','high_end',{req:[{g:'bed',beds:bedSizes.high_end},'wardrobe_mirror'],
  opt:[[{i:'bench_bed_end',anchor:'bed'},2],[{i:'armchair',n:2},3],['side_table',2],['palm_pot',2],['rug',3],['tv_console',1]],cap:.3,scatter:.3,art:[.15,2],min:12});
 K('bedroom','marine',{req:[{g:'bed',beds:bedSizes.marine},'dresser'],opt:[['wardrobe',2],[{i:'porthole',wall:'hull'},3]],cap:.4,scatter:.2,art:[.2,2],min:8});
 K('bedroom','commercial',{req:[{g:'bed',beds:bedSizes.commercial}],opt:[['dresser',2],['wardrobe',1],[{i:'tv_crt',on:'dresser'},1],['calendar_pinup',2]],cap:.35,scatter:.6,art:[.2,2],min:7});
 K('living','motel',{req:[{g:'sofa_tv',sofa:'sofa_3'}],opt:[['armchair',2],[{g:'dine',table:'dining_table_4',chairs:2},2],['bookcase',1],['ceiling_fan',2]],cap:.3,scatter:.6,art:[.25,3],min:12});
 K('living','high_end',{req:[{g:'sofa_tv',sofa:'sofa_sectional',rug:1}],
  opt:[[{i:'piano_grand',minA:50},1],['rack_stereo',2],['lamp_floor_arc',2],['palm_pot',3],['drinks_trolley',2],['console_table',1],['bookcase',1]],cap:.25,scatter:.2,art:[.12,4],min:20});
 K('dining','all',{req:[{g:'dine',by:'area'}],opt:[['sideboard',3],[{i:'chandelier',style:'high_end'},3],['palm_pot',1]],cap:.3,scatter:.1,art:[.15,2],min:7});
 K('kitchen','motel,high_end,marine',{req:[{g:'kitchen'}],opt:[[{i:'island',style:'high_end',minA:16},3],[{g:'dine',table:'dining_table_4',chairs:2},1]],cap:.4,scatter:.3,art:[.1,1],min:5});
 K('kitchen','commercial,deco',{req:[{row:'counter_run',len:[3,2.4,1.8]},'range_commercial','prep_table'],
  opt:[[{i:'fridge',n:2},2],['shelving_steel',2],['mop_bucket',1],['boxes_cardboard',2]],cap:.45,scatter:.6,art:[.05,1],min:6});
 const bathPublic={req:[{row:'wc',pitch:.9,per:{len:1.5}},{i:'vanity',w:1.8,above:'mirror_cabinet'}],opt:[[{row:'urinal',pitch:.8,n:[2,3],use:'men'},3],['cone_wet',1]],cap:.2,scatter:.2,art:[0,0],min:8};
 K('bath','all',{req:[{g:'bath'}],opt:[['towel_rail',2],['rug',1]],cap:.2,scatter:.2,art:[0,0],min:2.5});
 for(const s of ['commercial','deco'])kits.bath[s]={...kits.bath[s],uses:{private:{},public:bathPublic}};
 K('closet','all',{req:[{i:'wardrobe',wall:'longest'}],opt:[['dresser',2],['bags_luggage',2],[{row:'shelving_steel',use:'coat'},2]],cap:.45,scatter:.4,art:[.1,1],min:2});
 kits.closet.high_end={...kits.closet.high_end,req:[{i:'wardrobe_mirror',wall:'longest'}]};
 K('reception','all',{req:[{i:'reception_desk',face:'door',unless:/counter|desk|reception/}],
  opt:[[{g:'sofa_tv',tv:false,sofa:'sofa_3'},2],['palm_pot',2],[{i:'bell_ledge',style:'motel'},2],['cigarette_machine',1],[{i:'vending_cola',style:'motel'},1]],cap:.25,scatter:.3,art:[.15,3],min:8});
 K('lounge','deco,high_end',{req:[{g:'booth'}],opt:[[{g:'bar',minA:25},2],[{rep:'cocktail_table',max:4},3],['palm_pot',2],['poker_table',1]],cap:.3,scatter:.2,art:[.15,3],min:12});
 K('lounge','commercial',{req:[{g:'sofa_tv',tv:false,sofa:'sofa_3'}],opt:[['armchair',2],['vending_cola',2],[{i:'gold_disc',use:'studio'},3],[{i:'poker_table',use:'arcade'},3]],
  cap:.3,scatter:.4,art:[.2,4],min:10,uses:{studio:{},arcade:{}}});
 K('assembly','deco',{req:[{g:'bar',unless:'bar'},{i:'speaker_stack',n:2}],opt:[[{rep:'cocktail_table',max:8},3],[{i:'banquette',n:2},2],['mirror_ball',3],['light_rig',2]],cap:.2,scatter:.2,art:[.1,4],min:60});
 K('assembly','commercial',{req:[{row:'cab',every:1}],opt:[['arcade_cocktail',2],['pool_table',1],['change_machine',2],[{row:'pinball',n:[2,4]},2],[{i:'fluoro_troffer',grid:3},3]],cap:.3,scatter:.2,art:[.1,4],min:40,
  uses:{arcade:{},food_court:{req:[{rep:'fc_table',max:24}],opt:[['bench_mall',1],['trash_can',3],['planter_mall',1]],cap:.1,scatter:.3,art:[0,0],min:60}}});
 K('assembly','high_end',{req:[{g:'bar'},{i:'banquette',n:2}],opt:[[{rep:'cocktail_table',max:6},3],['piano_grand',2],['chandelier',3]],cap:.2,scatter:.1,art:[.1,4],min:40});
 const shelves={row:'wall_shelving_retail',n:[2,4]};
 K('retail','commercial',{req:[{i:'cash_wrap',face:'door'}],opt:[[{i:'clothes_rail',n:2,use:'anchor'},3],['palm_pot',1],['boxes_cardboard',1]],cap:.35,scatter:.3,art:[.1,3],min:15,
  uses:{toys:{req:[{rows:'retail_gondola',max:4},shelves]},records:{req:[{rows:'record_bin',max:5}]},shoes:{req:[shelves,'shoe_bench']},jewel:{req:[{i:'display_case',n:3}]},
   electronics:{req:[{rows:'retail_gondola',max:4},shelves]},anchor:{req:[{rows:'retail_gondola',max:6},shelves]},photo:{req:['display_case',shelves]},
   florist:{req:[{i:'flower_bucket_stand',n:2}]},marine:{req:[{rows:'retail_gondola',max:3}]}}});
 K('office','commercial,motel,marine',{req:[{g:'desk',desk:'desk_office'}],
  opt:[['filing_cabinet',3],['safe_small',1],['bookcase',1],[{i:'chart_nautical',style:'marine'},2],['noticeboard',2]],cap:.3,scatter:.4,art:[.2,3],min:5});
 K('office','high_end',{req:[{g:'desk',desk:'desk_exec'}],opt:[[{i:'bookcase',n:2},3],[{i:'armchair',n:2},2],['drinks_trolley',1],['art_canvas',3]],cap:.25,scatter:.2,art:[.15,3],min:10});
 K('secure','all',{req:['safe'],opt:[[{g:'count',use:'count'},3],['shelving_steel',3],['filing_cabinet',1],[{i:'tape_shelving',use:'vault'},3]],cap:.4,scatter:.2,art:[0,0],min:3,uses:{panic:{},count:{},vault:{}}});
 K('control','commercial',{req:[],opt:[['tape_machine',3],['rack_19',2],['office_chair',2]],cap:.4,scatter:.3,art:[.1,2],min:6,
  uses:{security:{req:['cctv_bank',{g:'desk',desk:'desk_office'}]},studio:{req:[{g:'console'},'rack_19']},copy:{req:[{g:'desk',desk:'desk_office'},'rack_19']}}});
 K('studio','commercial',{req:[{i:'mic_stand',n:[1,3]}],opt:[[{i:'drum_kit',minA:30},2],[{i:'piano_grand',minA:40},1],['amp_stack',2],['gobo',2]],cap:.25,scatter:.3,art:[0,0],min:3});
 K('workshop','all',{req:[{i:'workbench',above:'tool_board'}],opt:[['shelving_steel',3],['drum_55',2],[{i:'outboard_stand',style:'marine'},2],['crate_stack',1],['calendar_pinup',2]],cap:.4,scatter:.8,art:[.1,2],min:6});
 K('staff','all',{req:[{g:'dine',table:'dining_table_4',chairs:4}],opt:[['vending_cola',2],[{row:'counter_run',len:[1.8,1.2]},2],['sofa_3',1],[{i:'tv_crt',on:'counter_run'},1],['noticeboard',2]],cap:.3,scatter:.5,art:[.15,3],min:6});
 K('utility','all',{req:[],opt:[['mop_sink',2],['mop_bucket',2]],cap:.45,scatter:.6,art:[0,0],min:4,
  uses:{laundry:{req:[{row:'laundry',n:[1,3]},'folding_table']},housekeeping:{req:['shelving_steel','linen_cart']}}});
 K('store','all',{req:[{row:'shelving_steel',each:'long'}],opt:[['crate_stack',2],[{i:'pallet',minA:20},2],['boxes_cardboard',3]],cap:.5,scatter:.8,art:[0,0],min:2,uses:{stores:{},wine:{}}});
 K('plant','commercial',{req:[],opt:[['fuse_board',3],['drum_55',1]],cap:.4,scatter:.3,art:[0,0],min:3,uses:{elec:{req:['switchboard']},pump:{req:['drum_55']},mach:{req:['rack_19']}}});
 K('circulation','all',{req:['fire_ext',{i:'sign_exit',at:'exit'}],opt:[],cap:.05,scatter:.1,art:[.2,6],min:0});
 K('walk','motel',{req:[],opt:[['vending_cola',1],[{i:'lounger',minDepth:2},1],['trash_can',1]],cap:.1,scatter:.1,art:[0,0],min:0});
 K('walk','marine',{req:[],opt:[['life_ring',3],['rope_coil',2],['deck_chair_marine',1]],cap:.1,scatter:.2,art:[0,0],min:0});
 K('terrace','high_end,marine',{req:[{i:'lounger',n:2}],opt:[['patio_set',3],['palm_pot',3],['planter_box',2]],cap:.2,scatter:.1,art:[0,0],min:8});
 K('court','motel,high_end',{req:[{i:'lounger',per:{pool:3}}],opt:[['patio_set',3],['palm_ground',2],['trash_can',1]],cap:.15,scatter:.1,art:[0,0],min:0});
 K('court','commercial',{req:[],opt:[[{i:'bench_mall',n:2},2],[{i:'planter_mall',n:2},2],[{i:'palm_ground',n:2},2],[{i:'light_pole',n:2},2],['payphone',1]],cap:.1,scatter:.1,art:[0,0],min:0});
 K('lot','all',{req:[{g:'car'}],opt:[[{i:'light_pole',n:2},2],['dumpster',1],['trash_can',1],['litter',2]],cap:.3,scatter:.2,art:[0,0],min:0});
 K('street','all',{req:[],opt:[['newspaper_box',2],['payphone',1],['bus_bench',1],['fire_hydrant',2],['trash_can',2],['palm_ground',2]],cap:.05,scatter:.2,art:[0,0],min:0});
 K('road','all',{req:[{g:'parked'}],opt:[],cap:.2,scatter:0,art:[0,0],min:0});
 K('alley','all',{req:[{i:'dumpster',per:{len:25},alt:['trash_can','drum_55']}],opt:[['drum_55',2],['crate_stack',2],['trash_can',2],['litter',3],['boxes_cardboard',2]],cap:.15,scatter:.6,art:[0,0],min:0});
 K('yard','commercial,marine',{req:[],opt:[['pallet',3],['drum_55',2],['crate_stack',2],['van_parked',1],[{i:'boat_trailer',style:'marine'},2],['hand_truck',1]],cap:.25,scatter:.4,art:[0,0],min:0});
 K('pier','marine',{req:[{edge:'bollard_cleat',pitch:3},{edge:'pedestal_power',pitch:6}],opt:[[{edge:'dock_box',pitch:6},3],['rope_coil',2],['life_ring',1]],cap:.05,scatter:.2,art:[0,0],min:0});
 K('planter','all',{req:[{i:'palm_ground',per:{m2:12}}],opt:[[{i:'shrub',n:[1,3]},3]],cap:1,scatter:0,art:[0,0],min:0});
 // wall-art pools per style (§2.6), [id, weight, kinds or null for any]
 const ARTPOOL={motel:[['art_print',4],['clock_wall',1,['office','reception','kitchen','staff']]],high_end:[['art_canvas',4],['mirror_wall',1,['living','bedroom','dining','closet','circulation','lounge']]],
  deco:[['art_poster',3],['neon_sign',2,['assembly','lounge','circulation','reception']],['mirror_wall',1,['lounge','bath','assembly','reception']]],
  marine:[['chart_nautical',3],['art_print',1]],commercial:[['art_poster',2],['art_print',2],['clock_wall',1,['office','staff','kitchen','workshop','control','reception']],
  ['noticeboard',1,['office','staff','workshop']],['calendar_pinup',1,['workshop','office','staff']]]};
 const SCATTER={bedroom:['bags_luggage','magazine_pile'],living:['magazine_pile'],lounge:['magazine_pile'],office:['boxes_cardboard'],reception:['magazine_pile'],closet:['bags_luggage'],
  kitchen:['boxes_cardboard'],staff:['boxes_cardboard'],utility:['mop_bucket','boxes_cardboard'],store:['boxes_cardboard'],workshop:['boxes_cardboard'],plant:['boxes_cardboard'],
  secure:['boxes_cardboard'],control:['boxes_cardboard'],studio:['boxes_cardboard'],circulation:['boxes_cardboard'],alley:['litter','trash_can'],lot:['litter'],street:['trash_can'],
  yard:['drum_55'],pier:['rope_coil'],walk:['trash_can'],court:['trash_can'],terrace:[],dining:[],bath:[],retail:['boxes_cardboard'],assembly:['trash_can']};
 const kitFor=(kind,style)=>{const k=kits[kind];if(!k)return null;return k[style]??k.commercial??k[Object.keys(k)[0]];};

 // ---- seeded RNG (FNV-1a -> mulberry32) ----
 const fnv=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
 const mulberry=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 const shuffle=(rng,a)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const pick=(rng,a)=>a[Math.floor(rng()*a.length)];
 const nOf=(rng,n)=>Array.isArray(n)?n[0]+Math.floor(rng()*(n[1]-n[0]+1)):n??1;

 // ---- geometry (x,z plane; rect() matches plan.js rectPoly: u along w, v along d, item front = +v) ----
 const r3=v=>Math.round(v*1000)/1000;
 const area=p=>{let s=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];s+=a[0]*b[1]-b[0]*a[1];}return s/2;};
 const centroid=p=>{let x=0,z=0,A=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],c=a[0]*b[1]-b[0]*a[1];A+=c;x+=(a[0]+b[0])*c;z+=(a[1]+b[1])*c;}
  return Math.abs(A)<1e-9?p[0]:[x/(3*A),z/(3*A)];};
 const inPoly=(p,[x,z])=>{let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [xi,zi]=p[i],[xj,zj]=p[j];
  if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c;}return c;};
 const segD=([px,pz],[ax,az],[bx,bz])=>{const dx=bx-ax,dz=bz-az,L=dx*dx+dz*dz;let t=L?((px-ax)*dx+(pz-az)*dz)/L:0;t=Math.max(0,Math.min(1,t));
  return Math.hypot(px-ax-t*dx,pz-az-t*dz);};
 const rect=(cx,cz,w,d,rot)=>{const c=Math.cos(rot),s=Math.sin(rot);return[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>{const u=a*w/2,v=b*d/2;return[cx+u*c-v*s,cz+u*s+v*c];});};
 const axesOf=p=>p.map((a,i)=>{const b=p[(i+1)%p.length];return[a[1]-b[1],b[0]-a[0]];});
 const proj=(p,[ax,az])=>{let lo=Infinity,hi=-Infinity;for(const [x,z] of p){const d=x*ax+z*az;if(d<lo)lo=d;if(d>hi)hi=d;}return[lo,hi];};
 const BB=new WeakMap(),bb=p=>{let b=BB.get(p);if(!b){b=[Infinity,Infinity,-Infinity,-Infinity];for(const [x,z] of p){if(x<b[0])b[0]=x;if(z<b[1])b[1]=z;if(x>b[2])b[2]=x;if(z>b[3])b[3]=z;}BB.set(p,b);}return b;};
 const bbGap=(p,q)=>{const a=bb(p),b=bb(q);return Math.hypot(Math.max(0,a[0]-b[2],b[0]-a[2]),Math.max(0,a[1]-b[3],b[1]-a[3]));};
 const overlap=(p,q,eps=1e-4)=>{const a=bb(p),b=bb(q);if(a[2]<=b[0]+eps||b[2]<=a[0]+eps||a[3]<=b[1]+eps||b[3]<=a[1]+eps)return false;for(const ax of [...axesOf(p),...axesOf(q)]){const l=Math.hypot(ax[0],ax[1]);if(l<1e-9)continue;const n=[ax[0]/l,ax[1]/l];
  const [a0,a1]=proj(p,n),[b0,b1]=proj(q,n);if(a1<=b0+eps||b1<=a0+eps)return false;}return true;};
 const polyD=(p,q)=>{if(overlap(p,q,0))return 0;let m=Infinity;for(let i=0;i<p.length;i++)for(const x of q)m=Math.min(m,segD(x,p[i],p[(i+1)%p.length]));
  for(let i=0;i<q.length;i++)for(const x of p)m=Math.min(m,segD(x,q[i],q[(i+1)%q.length]));return m;};
 const near=(p,q,lim)=>bbGap(p,q)<lim;
 const ptPolyD=(pt,p)=>{if(inPoly(p,pt))return 0;let m=Infinity;for(let i=0;i<p.length;i++)m=Math.min(m,segD(pt,p[i],p[(i+1)%p.length]));return m;};
 const shrink=(p,k)=>{const c=centroid(p);return p.map(([x,z])=>{const dx=c[0]-x,dz=c[1]-z,l=Math.hypot(dx,dz)||1;return[x+dx/l*k,z+dz/l*k];});};
 const rotFor=n=>Math.atan2(-n[0],n[1]); // rot whose front (-sin rot, cos rot) equals n

 // ---- room preparation: edges with inward normals, openings, zones ----
 // room = {id, kind, style, use?, poly, h?, roof?, edges?:[{a,b,wall, h, build, thick, ext, water, open:[{s0,s1,kind,y0,y1,exit}]}],
 //         reserved?:[{at,r}], props?:[plan props], keepOut?:[poly], stalls?:[{at,rot}], parking?:[{a,b}], pools?}
 const prep=(room,o)=>{
  const poly=room.poly,A=Math.abs(area(poly)),H=room.h??2.8,kind=room.kind,ext=EXT.has(kind);
  const edges=(room.edges??poly.map((a,i)=>({a,b:poly[(i+1)%poly.length],wall:!ext}))).map((e,i)=>{
   const dx=e.b[0]-e.a[0],dz=e.b[1]-e.a[1],L=Math.hypot(dx,dz)||1e-9,t=[dx/L,dz/L];let n=[-t[1],t[0]];
   const m=[(e.a[0]+e.b[0])/2,(e.a[1]+e.b[1])/2];if(!inPoly(poly,[m[0]+n[0]*.02,m[1]+n[1]*.02]))n=[-n[0],-n[1]];
   const wall=e.wall!==false;
   return{...e,i,L,t,n,wall,h:wall?e.h??H:0,thick:wall?e.thick??.15:0,build:e.build??'',open:(e.open??[]).map(q=>({y0:q.kind==='door'?0:.9,y1:2.1,...q}))};});
  const at=(e,s,off)=>[e.a[0]+e.t[0]*s+e.n[0]*off,e.a[1]+e.t[1]*s+e.n[1]*off];
  const zones=[],windows=[];
  for(const e of edges){
   for(const q of e.open){const sc=(q.s0+q.s1)/2,w=q.s1-q.s0;
    if(q.kind==='window'){const d=.6+e.thick/2,c=at(e,sc,d/2);windows.push({poly:rect(c[0],c[1],w,d,rotFor(e.n)),sill:q.y0});}
    else{const d=(q.exit||e.ext?2:A<6&&(kind==='bath'||kind==='closet')?.8:1.2)+e.thick/2,c=at(e,sc,d/2);zones.push(rect(c[0],c[1],w+.6,d,rotFor(e.n)));}}
   if(!e.wall&&!ext&&e.L<=3.2&&e.L>.3){const c=at(e,e.L/2,.3);zones.push(rect(c[0],c[1],e.L,.6,rotFor(e.n)));}}
  const R={room,id:room.id,kind,style:room.style,use:room.use,poly,A,H,roof:room.roof??!ext,ext,edges,at,zones,windows,
   reserved:(room.reserved??o.reserved??[]).filter(q=>ptPolyD(q.at,poly)<(q.r??.6)+.5).map(q=>({at:q.at,r:q.r??.6})),
   keepOut:room.keepOut??[],floor:[],mounts:[],ceil:[],units:[],solidA:0,n:0,props:[],decor:[],warnings:[],
   radius:o.radius??(PUBLIC.has(kind)?.52:.37),inner:shrink(poly,.002)};
  for(const p of room.props??[]){const fp=p.poly??rect(p.at[0],p.at[1],p.size[0],p.size[1],p.rot??0);
   const u={id:'plan:'+p.id,members:[]};R.units.push(u);
   R.floor.push({unit:u,it:{id:p.item??'plan',h:p.h??1,build:p.build},poly:fp,solid:true,clears:[],plan:true});R.solidA+=Math.abs(area(fp));}
  navInit(R);return R;};

 // ---- nav raster: probes (doors, open edges, reserved points) connected at baseline must stay connected ----
 const navInit=R=>{
  let x0=Infinity,z0=Infinity,x1=-Infinity,z1=-Infinity;for(const [x,z] of R.poly){x0=Math.min(x0,x);z0=Math.min(z0,z);x1=Math.max(x1,x);z1=Math.max(z1,z);}
  const st=R.A>400?.25:R.A>150?.18:.12,nx=Math.ceil((x1-x0)/st)+1,nz=Math.ceil((z1-z0)/st)+1,r=R.radius,base=new Uint8Array(nx*nz);
  const segs=[];for(const e of R.edges){if(!e.wall)continue;let s=0;
   for(const q of e.open.filter(q=>q.kind!=='window').sort((a,b)=>a.s0-b.s0)){if(q.s0>s)segs.push([e,s,q.s0]);s=Math.max(s,q.s1);}if(s<e.L)segs.push([e,s,e.L]);}
  const cell=(i,j)=>[x0+i*st,z0+j*st];
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(!inPoly(R.poly,cell(i,j)))base[j*nx+i]=1;
  R.nav={x0,z0,st,nx,nz,cell};for(const [e,s0,s1] of segs)navPaint(R,base,[R.at(e,s0,0),R.at(e,s1,0)],r+e.thick/2);
  const pts=[];for(const e of R.edges){for(const q of e.open)if(q.kind!=='window')pts.push(R.at(e,(q.s0+q.s1)/2,.5+e.thick/2));
   if(!e.wall)for(let s=Math.min(1.5,e.L/2);s<e.L;s+=3)pts.push(R.at(e,s,.5));}
  for(const q of R.reserved)pts.push(q.at);
  const idx=([x,z],G)=>{const i=Math.round((x-x0)/st),j=Math.round((z-z0)/st);let best=-1,bd=Infinity;
   for(let dj=-3;dj<=3;dj++)for(let di=-3;di<=3;di++){const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=nz||G[b*nx+a])continue;const d=di*di+dj*dj;if(d<bd){bd=d;best=b*nx+a;}}return best;};
  R.nav={x0,z0,st,nx,nz,base,cell};const cur=R.nav.cur=base.slice();for(const m of R.floor)if(m.solid)navPaint(R,cur,m.poly,r);
  const probes=R.nav.probes=[...new Set(pts.map(p=>idx(p,cur)).filter(k=>k>=0))];
  const lab=navLabel(R,cur);const groups=new Map();for(const p of probes){const l=lab[p];if(!groups.has(l))groups.set(l,[]);groups.get(l).push(p);}
  R.nav.groups=[...groups.values()].filter(g=>g.length>1);};
 const navLabel=(R,g)=>{const {nx,nz,probes}=R.nav,lab=new Int32Array(nx*nz).fill(-1);let L=0;
  for(const p of probes){if(g[p]||lab[p]>=0)continue;const q=[p];lab[p]=L;
   while(q.length){const k=q.pop(),i=k%nx,j=(k-i)/nx;
    for(const [a,b] of [[i+1,j],[i-1,j],[i,j+1],[i,j-1]]){if(a<0||b<0||a>=nx||b>=nz)continue;const kk=b*nx+a;if(g[kk]||lab[kk]>=0)continue;lab[kk]=L;q.push(kk);}}L++;}
  return lab;};
 const navPaint=(R,g,poly,r)=>{const {x0,z0,st,nx,nz,cell}=R.nav;const D=poly.length===2?(c=>segD(c,poly[0],poly[1])):(c=>ptPolyD(c,poly));let a0=Infinity,b0=Infinity,a1=-Infinity,b1=-Infinity;
  for(const [x,z] of poly){a0=Math.min(a0,x);b0=Math.min(b0,z);a1=Math.max(a1,x);b1=Math.max(b1,z);}
  for(let j=Math.max(0,Math.floor((b0-r-z0)/st));j<=Math.min(nz-1,Math.ceil((b1+r-z0)/st));j++)
   for(let i=Math.max(0,Math.floor((a0-r-x0)/st));i<=Math.min(nx-1,Math.ceil((a1+r-x0)/st));i++)if(!g[j*nx+i]&&D(cell(i,j))<r)g[j*nx+i]=1;};
 const navBlocks=(R,m)=>m.solid||R.kind==='circulation'&&!m.it.rug&&!m.it.scatter;
 // incremental: R.nav.cur holds everything committed; returns the new grid, or null when connectivity/clearance breaks
 const navOK=(R,extra)=>{const n=R.nav,r=R.radius,g=n.cur.slice();
  for(const m of extra)if(navBlocks(R,m))navPaint(R,g,m.poly,r);
  if(!n.probes.length)return g;
  const lab=navLabel(R,g);
  for(const grp of n.groups){const l=lab[grp[0]];if(g[grp[0]]||grp.some(p=>g[p]||lab[p]!==l))return null;}
  const live=new Set(n.probes.filter(p=>!g[p]).map(p=>lab[p]));
  for(const m of R.floor){if(!m.solid||m.plan)continue;for(const c of m.clears){let ok=false;
   const {x0,z0,st,nx,nz,cell}=n;let a0=Infinity,b0=Infinity,a1=-Infinity,b1=-Infinity;for(const [x,z] of c){a0=Math.min(a0,x);b0=Math.min(b0,z);a1=Math.max(a1,x);b1=Math.max(b1,z);}
   for(let j=Math.max(0,Math.floor((b0-r-z0)/st));j<=Math.min(nz-1,Math.ceil((b1+r-z0)/st))&&!ok;j++)
    for(let i=Math.max(0,Math.floor((a0-r-x0)/st));i<=Math.min(nx-1,Math.ceil((a1+r-x0)/st));i++){const k=j*nx+i;if(!g[k]&&live.has(lab[k])&&ptPolyD(cell(i,j),c)<=r){ok=true;break;}}
   if(!ok)return null;}}
  return g;};

 // ---- member construction and validity ----
 // A unit is one placement decision (a group or a single item); members of one unit may share clears and stand closer than C13.
 const clearsOf=(it,at,rot,c=it.clear)=>{const out=[];if(!c&&!it.side&&!it.back)return out;
  const cs=Math.cos(rot),sn=Math.sin(rot),P=(u,v,w,d)=>rect(at[0]+u*cs-v*sn,at[1]+u*sn+v*cs,w,d,rot);
  if(it.round){out.push(rect(at[0],at[1],it.w+2*c,it.d+2*c,rot));return out;}
  if(c)out.push(P(0,it.d/2+c/2,it.w,c));
  if(it.side){if(it.oneSide!==1)out.push(P(-it.w/2-it.side/2,0,it.side,it.d));if(it.oneSide!==-1)out.push(P(it.w/2+it.side/2,0,it.side,it.d));}
  if(it.back)out.push(P(0,-it.d/2-it.back/2,it.w,it.back));
  return out;};
 const mem=(it,at,rot,x={})=>{const w=x.w??it.w,d=x.d??it.d,I={...it,w,d,...(x.h?{h:x.h}:{}),...(x.oneSide?{oneSide:x.oneSide}:{})};const fw=it.foot??w,fd=it.foot??d;
  return{it:I,at,rot,poly:rect(at[0],at[1],fw,fd,rot),solid:!!it.build&&!x.vis,clears:x.noClear?[]:clearsOf(I,at,rot,x.clear??it.clear),...x};};
 const fitsFloor=(R,unit,m)=>{
  const p=m.poly,it=m.it;
  if(!p.every(c=>inPoly(R.poly,c))){const s=shrink(p,.003);if(!s.every(c=>inPoly(R.poly,c)))return'outside';}
  const s=shrink(p,.003);if(R.poly.some(v=>inPoly(s,v)))return'vertex';
  if(R.roof&&it.h>R.H-.1)return'height';
  for(const z of R.zones)if(overlap(z,p))return'door';
  for(const z of R.keepOut)if(overlap(z,p))return'keepout';
  for(const q of R.reserved)if(ptPolyD(q.at,p)<q.r)return'reserved';
  for(const e of R.edges){if(!e.wall)continue;e.seg??=[e.a,e.b];if(near(e.seg,p,e.thick/2)&&polyD(e.seg,p)<e.thick/2-.002)return'wall';}
  if(m.solid)for(const w of R.windows)if(it.h>w.sill-.05&&overlap(w.poly,p))return'window';
  if(!it.rug)for(const o of R.mounts){if(o.unit===unit||it.h<=o.y-o.it.h/2-.08)continue;const e=R.edges[o.edge];o.band??=rect(...R.at(e,o.s,e.thick/2+.15),o.it.w,.3,rotFor(e.n));if(overlap(o.band,p))return'under-mount';}
  for(const c of m.clears)if(!shrink(c,.02).every(v=>inPoly(R.poly,v)))return'clear-out';
  for(const f of R.floor){if(f.unit===unit)continue;
   if(it.rug){if(f.it.rug&&overlap(f.poly,p))return'rug';continue;}
   if(f.it.rug)continue;
   if(overlap(f.poly,p))return'overlap';
   for(const c of f.clears)if(!f.it.share?.includes(it.id)&&overlap(c,p))return'in-clear';
   for(const c of m.clears)if(!it.share?.includes(f.it.id)&&overlap(c,f.poly))return'clear-blocked';
   if(m.solid&&f.solid&&near(f.poly,p,.6)){const d=polyD(f.poly,p);if(d<.6&&!(m.edge!=null&&m.edge===f.edge&&d<=.05))return'c13';}}
  return null;};
 const mountOK=(R,unit,m)=>{const e=R.edges[m.edge],it=m.it,b=m.y-it.h/2,t=m.y+it.h/2;
  if(!e||!e.wall||e.h<2)return'host';
  if(/glass|hull/.test(e.build)&&!(it.hull&&/hull/.test(e.build)))return'host-build';
  if(it.hull&&!(/hull/.test(e.build)||e.ext))return'hull';
  if(R.ext&&!it.ext)return'exterior';
  if(m.s-it.w/2<.15||m.s+it.w/2>e.L-.15)return'ends';
  if(t>e.h-.05||b<.05)return'y';
  for(const q of e.open)if(m.s+it.w/2>q.s0-.05&&m.s-it.w/2<q.s1+.05&&!(b>=q.y1+.02||t<=q.y0-.02))return'opening';
  for(const o of R.mounts){if(o.edge!==m.edge||o.unit===unit&&o===m)continue;const g=ART.has(it.id)&&ART.has(o.it.id)?0:.15;
   if(m.s+it.w/2+g>o.s-o.it.w/2&&m.s-it.w/2-g<o.s+o.it.w/2&&t+g>o.y-o.it.h/2&&b-g<o.y+o.it.h/2)return'mount';}
  const band=rect(...R.at(e,m.s,e.thick/2+.15),it.w,.3,rotFor(e.n));
  for(const f of R.floor)if(!f.it.rug&&overlap(band,f.poly)&&b<f.it.h+.08)return'above-floor';
  return null;};
 const ceilOK=(R,m)=>{const it=m.it;if(!R.roof||R.ext)return'roof';if(m.y<(it.minY??2.1)||m.y+it.h>R.H+1e-6)return'y';
  if(!m.poly.every(c=>inPoly(R.poly,c)))return'outside';for(const o of R.ceil)if(overlap(o.poly,m.poly))return'overlap';return null;};

 // ---- frames: a frame is an origin + inward normal n (local +v) and u axis eu=(n.z,-n.x); wall frames sit on a wall face ----
 const wallFrame=(R,e,s)=>({edge:e.i,s,o:R.at(e,s,e.thick/2),n:e.n});
 const wallFrames=(R,w,o={})=>{const out=[];
  for(const e of R.edges){if(!e.wall||o.full&&e.h<2||o.edges&&!o.edges.includes(e.i))continue;if(e.L<w+.24)continue;
   const ss=[e.L/2],st=R.A<6?.05:.1;for(let s=w/2+.12;s<=e.L-w/2-.12+1e-9;s+=st)ss.push(s);for(const s of ss)out.push(wallFrame(R,e,s));}
  if(o.score)return out.map(f=>[o.score(f)+R.rng()*.01,f]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
  return shuffle(R.rng,out);};
 const cornerFrames=(R,w)=>{const out=[];for(const e of R.edges){if(!e.wall||e.L<w+.3)continue;for(const s of [w/2+.14,e.L-w/2-.14])out.push(wallFrame(R,e,s));}return shuffle(R.rng,out);};
 const longest=R=>R.edges.filter(e=>e.wall).sort((a,b)=>b.L-a.L)[0];
 const freeFrames=(R,o={})=>{const pts=[];let x0=Infinity,z0=Infinity,x1=-Infinity,z1=-Infinity;
  for(const [x,z] of R.poly){x0=Math.min(x0,x);z0=Math.min(z0,z);x1=Math.max(x1,x);z1=Math.max(z1,z);}
  const st=o.step??(R.A>300?.6:R.A>80?.4:.25),L=longest(R)??R.edges.slice().sort((a,b)=>b.L-a.L)[0],th0=rotFor(L.n);
  for(let z=z0+st/2;z<z1;z+=st)for(let x=x0+st/2;x<x1;x+=st)if(inPoly(R.poly,[x,z]))pts.push([x,z]);
  const doors=R.edges.flatMap(e=>e.open.filter(q=>q.kind!=='window').map(q=>R.at(e,(q.s0+q.s1)/2,0)));
  const out=[];for(const p of shuffle(R.rng,pts).slice(0,o.max??260)){
   const ths=o.faceDoor&&doors.length?[(()=>{const d=doors.sort((a,b)=>Math.hypot(a[0]-p[0],a[1]-p[1])-Math.hypot(b[0]-p[0],b[1]-p[1]))[0];return Math.atan2(-(d[0]-p[0]),d[1]-p[1]);})()]
    :shuffle(R.rng,[0,1,2,3]).map(k=>th0+k*Math.PI/2);
   for(const th of ths)out.push({o:p,n:[-Math.sin(th),Math.cos(th)],free:1});}
  if(o.faceDoor)out.sort((a,b)=>Math.min(...doors.map(d=>Math.abs(Math.hypot(d[0]-a.o[0],d[1]-a.o[1])-3)))-Math.min(...doors.map(d=>Math.abs(Math.hypot(d[0]-b.o[0],d[1]-b.o[1])-3))));
  return out;};
 const edgeFrames=(R,o={})=>{const out=[];const es=R.edges.filter(e=>!e.wall&&(!o.water||e.water));
  for(const e of (es.length||!o.water?es:R.edges.filter(e=>!e.wall)))for(let s=o.pitch?o.pitch/2:.6;s<e.L-.3;s+=o.pitch??.5)out.push({edge:e.i,s,o:R.at(e,s,o.inset??.3),n:e.n,edgeHost:1});
  return o.pitch?out:shuffle(R.rng,out);};

 // ---- units: realise a layout of member specs in a frame, validate, then commit ----
 // spec: {i, u, v, r, opt, wall, w, d, h, vis, clear, part, noClear} | {mount:i, u, y, opt} | {top:k, i, du, opt}
 const realize=(R,f,sp)=>{const eu=[f.n[1],-f.n[0]],th=rotFor(f.n);
  if(sp.mount){const it=items[sp.mount],e=R.edges[f.edge];if(!it||!e)return null;const s=f.s+(sp.u??0)*(eu[0]*e.t[0]+eu[1]*e.t[1]);
   return{it,kind:'mount',edge:f.edge,s,y:sp.y??it.y??1.5,at:R.at(e,s,e.thick/2+it.d/2),rot:th};}
  const it=items[sp.i];if(!it)return null;const u=sp.u??0,v=sp.v??(f.edge!=null&&!f.edgeHost?it.d/2+(sp.gap??0):0);
  const at=[f.o[0]+eu[0]*u+f.n[0]*v,f.o[1]+eu[1]*u+f.n[1]*v];
  const m=mem(it,at,th+(sp.r??0),sp);m.kind='floor';if(sp.wall||f.edge!=null&&sp.wall!==false&&!f.edgeHost&&sp.u==null&&sp.v==null)m.edge=f.edge;return m;};
 const placeUnit=(R,name,frames,layout,o={})=>{
  const unit={id:name,members:[],tops:[]};let tries=0;
  const cap=Math.min(o.max??500,R.tryCap??Infinity);for(const f of frames){if(++tries>cap)break;const specs=layout(f);if(!specs)continue;
   const fl=[],mo=[],tops=[];let bad=false;
   for(const sp of specs){if(sp.top!=null){tops.push(sp);continue;}const m=realize(R,f,sp);if(!m){if(sp.opt)continue;bad=true;break;}
    m.unit=unit;if(m.kind==='mount'){mo.push([m,sp]);continue;}
    const why=fitsFloor(R,unit,m);if(why){if(sp.opt){m.drop=1;continue;}if(R.why)R.why[name+'/'+sp.i+':'+why]=(R.why[name+'/'+sp.i+':'+why]??0)+1;bad=true;break;}m.idx=specs.indexOf(sp);fl.push(m);}
   if(bad)continue;
   const sA=fl.filter(m=>m.solid).reduce((a,m)=>a+m.it.w*m.it.d,0);if(o.cap!=null&&sA&&R.solidA+sA>o.cap*R.A+1e-6)return null;
   R.floor.push(...fl);const ok=[];
   for(const [m,sp] of mo){const why=mountOK(R,unit,m);if(why){if(sp.opt)continue;if(R.why)R.why[name+':m:'+why]=(R.why[name+':m:'+why]??0)+1;bad=true;break;}m.unit=unit;R.mounts.push(m);ok.push(m);}
   if(!bad&&fl.some(m=>navBlocks(R,m))){const g=navOK(R,fl);if(g)R.nav.cur=g;else{bad=true;if(R.why)R.why[name+':nav']=(R.why[name+':nav']??0)+1;}}
   if(bad){R.floor.splice(R.floor.length-fl.length,fl.length);for(const m of ok)R.mounts.splice(R.mounts.indexOf(m),1);continue;}
   R.solidA+=sA;unit.members=[...fl,...ok];unit.frame=f;R.units.push(unit);R.placed.push(...fl,...ok);
   for(const sp of tops){const host=fl.find(m=>m.idx===sp.top);if(!host)continue;addTop(R,host,items[sp.i],sp.du);}
   return unit;}
  return null;};
 const unplace=(R,unit)=>{const ms=new Set([...unit.members,...unit.members.flatMap(m=>m.tops??[])]);
  R.floor=R.floor.filter(m=>!ms.has(m));R.mounts=R.mounts.filter(m=>!ms.has(m));R.placed=R.placed.filter(m=>!ms.has(m));R.units=R.units.filter(u=>u!==unit);
  R.solidA-=unit.members.filter(m=>m.kind==='floor'&&m.solid).reduce((a,m)=>a+m.it.w*m.it.d,0);
  const g=R.nav.cur=R.nav.base.slice();for(const m of R.floor)if(navBlocks(R,m))navPaint(R,g,m.poly,R.radius);};
 const addTop=(R,host,it,du)=>{if(!it)return null;host.tops??=[];if(host.tops.length>=2||it.w>host.it.w+.01||it.d>host.it.d+.01)return null;
  const room=(host.it.w-it.w)/2;du=du??(host.tops.length?-Math.sign(host.tops[0].du||1)*room*.7:(R.rng()-.5)*room);du=Math.max(-room,Math.min(room,du));
  if(host.tops.some(t=>Math.abs(t.du-du)<(t.it.w+it.w)/2+.02))return null;
  const c=Math.cos(host.rot),s=Math.sin(host.rot),t={it,kind:'top',host,du,at:[host.at[0]+du*c,host.at[1]+du*s],rot:host.rot,y:host.it.h};
  host.tops.push(t);R.placed.push(t);return t;};

 // ---- single items by host ----
 const framesFor=(R,it,ent={})=>{
  if(ent.wall==='longest'){const free=e=>e.L-e.open.reduce((a,q)=>a+q.s1-q.s0+.6,0),rank=R.edges.filter(e=>e.wall).sort((a,b)=>free(b)-free(a)||a.i-b.i).map(e=>e.i);
   return wallFrames(R,it.w,{edges:rank,score:f=>rank.indexOf(f.edge)});}
  const out=[];for(const h of it.host){
   if(h==='wall')out.push(...wallFrames(R,ent.w??it.w));else if(h==='corner')out.push(...cornerFrames(R,ent.w??it.w));
   else if(h==='free')out.push(...freeFrames(R,{faceDoor:ent.face==='door'}));else if(h==='edge')out.push(...edgeFrames(R,{inset:it.d/2+.3}));}
  return out;};
 const placeItem=(R,id,ent={},o={})=>{const it=items[id];if(!it||it.host.includes('plan'))return null;
  if(it.host[0]==='mount')return placeMount(R,it,ent);if(it.host[0]==='ceiling')return placeCeil(R,it,ent);
  if(it.host[0]==='top')return placeTopAny(R,it,ent);if(it.host[0]==='scatter')return placeScatter(R,it);
  const sp={i:id,...(ent.w?{w:ent.w}:{}),...(ent.clear!=null?{clear:ent.clear}:{})},extra=[];
  if(ent.above)extra.push({mount:ent.above,u:0,opt:1});if(ent.top)extra.push({top:0,i:ent.top});
  return placeUnit(R,id,framesFor(R,it,ent),f=>f.edge!=null&&!f.edgeHost?[{...sp,wall:true,...(it.back?{gap:it.back}:{})},...extra]:f.edgeHost?[{...sp,v:0}]:[sp,...extra.filter(x=>!x.mount)],{cap:o.cap});};
 const placeMount=(R,it,ent={},pref=[])=>{
  let frames=[];
  if(ent.under==='window'||ent.at==='exit'){for(const e of R.edges)for(const q of e.open){
    if(ent.under&&q.kind==='window'&&e.ext)frames.push({...wallFrame(R,e,(q.s0+q.s1)/2),y:q.y0-.06-it.h/2});
    if(ent.at&&q.kind!=='window'&&(q.exit||e.ext))frames.push({...wallFrame(R,e,(q.s0+q.s1)/2),y:q.y1+.04+it.h/2});}
   frames=shuffle(R.rng,frames);}
  else frames=[...pref,...wallFrames(R,it.w,{full:1})];
  for(const f of frames.slice(0,400)){const m=realize(R,f,{mount:it.id,u:0,y:f.y});if(!m)continue;
   const unit={id:it.id,members:[m]};m.unit=unit;if(mountOK(R,unit,m))continue;R.mounts.push(m);R.placed.push(m);R.units.push(unit);return unit;}
  return null;};
 const placeCeil=(R,it,ent={},pts=[])=>{if(!R.roof||R.ext)return null;const y=it.y??R.H-it.h-.02,th=rotFor((longest(R)??R.edges[0]).n);
  const c=centroid(R.poly),cand=[...pts,c];if(ent.grid){const out=[];for(const f of freeFrames(R,{step:ent.grid,max:40}))if(f.n[0]===-Math.sin(th))out.push(f.o);}
  for(let k=0;k<30;k++)cand.push([c[0]+(R.rng()-.5)*3,c[1]+(R.rng()-.5)*3]);
  for(const p of cand){const m={it,kind:'ceil',at:p,rot:th,y,poly:rect(p[0],p[1],it.w,it.d,th)};if(ceilOK(R,m))continue;R.ceil.push(m);R.placed.push(m);return{members:[m]};}
  return null;};
 const placeCeilGrid=(R,it,step)=>{if(!R.roof||R.ext)return 0;const th=rotFor((longest(R)??R.edges[0]).n),y=R.H-it.h-.02;let n=0;
  let x0=Infinity,z0=Infinity,x1=-Infinity,z1=-Infinity;for(const [x,z] of R.poly){x0=Math.min(x0,x);z0=Math.min(z0,z);x1=Math.max(x1,x);z1=Math.max(z1,z);}
  for(let z=z0+step/2;z<z1;z+=step)for(let x=x0+step/2;x<x1;x+=step){const m={it,kind:'ceil',at:[x,z],rot:th,y,poly:rect(x,z,it.w,it.d,th)};
   if(!ceilOK(R,m)){R.ceil.push(m);R.placed.push(m);n++;}}return n;};
 const placeTopAny=(R,it,ent={})=>{const hosts=shuffle(R.rng,R.floor.filter(m=>!m.plan&&(ent.on?m.it.id===ent.on:(it.on??[]).includes(m.it.id))));
  for(const h of hosts){const t=addTop(R,h,it);if(t)return{members:[t]};}return null;};
 const RUGOK=new Set(['coffee_table','dining_table_4','dining_table_8','dining_table_12','dining_chair','armchair','sofa_3','sofa_sectional','side_table','bench_bed_end','cocktail_table']);
 const placeScatter=(R,it,o={})=>{const c=centroid(R.poly);let x0=Infinity,z0=Infinity,x1=-Infinity,z1=-Infinity;
  for(const [x,z] of R.poly){x0=Math.min(x0,x);z0=Math.min(z0,z);x1=Math.max(x1,x);z1=Math.max(z1,z);}
  const unit={id:it.id,members:[]},sc={...it,scatter:1};
  for(let k=0;k<(o.tries??60);k++){const p=o.at&&k<8?[o.at[0]+(R.rng()-.5)*.4*k/4,o.at[1]+(R.rng()-.5)*.4*k/4]:[x0+R.rng()*(x1-x0),z0+R.rng()*(z1-z0)];
   const rot=o.rot??(it.rug?rotFor((longest(R)??R.edges[0]).n):R.rng()*Math.PI*2);const m=mem(sc,p,rot,{noClear:1});m.kind='floor';m.unit=unit;
   if(fitsFloor(R,unit,m))continue;
   if(it.rug&&R.floor.some(f=>!f.it.rug&&overlap(f.poly,m.poly)&&!RUGOK.has(f.it.id)))continue;
   if(navBlocks(R,m)){R.floor.push(m);const g=navOK(R,[m]);R.floor.pop();if(!g)continue;R.nav.cur=g;}
   R.floor.push(m);R.placed.push(m);unit.members=[m];R.units.push(unit);return unit;}
  void c;return null;};
 // greedy sweep of single items along walls (arcade cabinets, shelving, laundry pairs, wc/urinal rows)
 const sweep=(R,ids,o={})=>{let n=0;const max=o.n??99,es=(o.edges??R.edges.filter(e=>e.wall).sort((a,b)=>b.L-a.L)).filter(e=>e.wall);
  for(const e of es){let s=.14,k=0,run=0;while(s<e.L-.1&&n<max&&(!o.perEdge||run<o.perEdge)){const id=ids[k%ids.length],it=items[id],w=o.w??it.w;s=Math.max(s,.14);
    const f=wallFrame(R,e,s+w/2);if(s+w/2>e.L-w/2-.12)break;
    const u=placeUnit(R,id,[f],()=>[{i:id,wall:true,...(o.w?{w:o.w}:{})}],{cap:o.cap});
    if(u){n++;run++;k++;s+=Math.max(w+.02,o.pitch??0);}else s+=.1;}
   if(o.oneEdge&&run)break;}
  return n;};

 // ---- groups (§3.1): layouts in a frame's local (u along the wall, v into the room) ----
 const PI=Math.PI;
 const hasWin=(R,e)=>e.open.some(q=>q.kind==='window');
 const doorPts=R=>R.edges.flatMap(e=>e.open.filter(q=>q.kind!=='window').map(q=>R.at(e,(q.s0+q.s1)/2,0)));
 const artPick=R=>{const pool=(ARTPOOL[R.style]??ARTPOOL.commercial).filter(([,,k])=>!k||k.includes(R.kind));if(!pool.length)return null;
  let t=pool.reduce((a,p)=>a+p[1],0)*R.rng();for(const p of pool)if((t-=p[1])<0)return p[0];return pool[0][0];};
 const G={
  bed(R,ent){const opts=ent.beds??[['bed_double',1]],art=artPick(R);
   const frames=()=>wallFrames(R,1,{score:f=>(hasWin(R,R.edges[f.edge])?2:0)-R.edges[f.edge].L*.05+Math.abs(f.s-R.edges[f.edge].L/2)*.15});
   for(const [id,cnt] of opts){const it=items[id];if(!it||R.A<(cnt>1?14:0))continue;const W=it.w,D=it.d;
    const lay=cnt>1?()=>[{i:id,u:-(W/2+.3),v:D/2},{i:id,u:W/2+.3,v:D/2},{i:'nightstand',u:0,v:.2,opt:1},{top:2,i:'lamp_table'},...(art?[{mount:art,u:0,y:1.45,opt:1}]:[])]
     :()=>[{i:id,u:0,v:D/2},{i:'nightstand',u:-(W/2+.3),v:.2,opt:1},{i:'nightstand',u:W/2+.3,v:.2,opt:1},{top:1,i:'lamp_table'},{top:2,i:'phone_desk'},...(art?[{mount:art,u:0,y:1.45,opt:1}]:[])];
    const u=placeUnit(R,'bed',frames(),lay,{max:700});if(u){R.bed=u;return u;}}
   // small rooms: push a single bed into a corner, with access (C7) on the open side only
   for(const [id,cnt] of opts){const it=items[id];if(!it||cnt>1)continue;const W=it.w,D=it.d;
    const fr=[];for(const e of R.edges){if(!e.wall||e.L<W+.3)continue;for(const [s,k] of [[W/2+.1,-1],[e.L-W/2-.1,1]]){const f=wallFrame(R,e,s),eu=[f.n[1],-f.n[0]];f.side=Math.sign(eu[0]*e.t[0]+eu[1]*e.t[1])*k;fr.push(f);}}
    const lay=f=>[{i:id,u:0,v:D/2,oneSide:-f.side},{i:'nightstand',u:-f.side*(W/2+.3),v:.2,opt:1},{top:1,i:'lamp_table'}];
    const u=placeUnit(R,'bed',shuffle(R.rng,fr),lay);if(u){R.bed=u;return u;}}
   return null;},
  sofa_tv(R,ent){const sofa=ent.sofa??'sofa_3',S=items[sofa],tv=ent.tv!==false,sect=sofa==='sofa_sectional';const W=S.w,D=sect?.95:S.d;
   const tries=tv?[3,2.6,2.4,3.4]:[0];
   for(const g of tries){const vs=tv?.5+g+D/2:D/2,rs=tv?PI:0,ft=tv?-1:1,vt=vs+ft*(D/2+.45+.3);
    const lay=()=>[{i:sofa,u:0,v:vs,r:rs,...(sect?{w:W,d:D}:{})},{i:'coffee_table',u:0,v:vt,opt:1},
     ...(tv?[{i:'tv_console',u:0,v:.25},{top:sect?4:3,i:'tv_crt'}]:[]),
     ...(sect?[{i:sofa,u:-(W/2-.475),v:vs-1.2,r:rs,w:.95,d:1.45,noClear:1}]:[]),
     {i:'armchair',u:W/2+.75,v:vt,r:-PI/2*ft,opt:1},...(ent.rug||R.rng()<.5?[{i:'rug',u:0,v:vt,opt:1}]:[]),{top:1,i:'magazine_pile'}];
    const u=placeUnit(R,'sofa',wallFrames(R,W,{score:f=>(hasWin(R,R.edges[f.edge])?1:0)-R.edges[f.edge].L*.1+Math.abs(f.s-R.edges[f.edge].L/2)*.1}),lay,{max:500});
    if(u){R.sofa=u;return u;}}
   return null;},
  dine(R,ent){const sizes=ent.table?[ent.table]:R.A>=30?['dining_table_12','dining_table_8','dining_table_4']:R.A>=14?['dining_table_8','dining_table_4']:['dining_table_4'];
   for(const id of sizes){const T=items[id];if(!T.styles.includes(R.style)&&id!=='dining_table_4')continue;
    const seats=ent.chairs??T.seats??4,lay=()=>{const out=[{i:id}];
     if(T.w<=1.2){const at=[[0,1],[0,-1],[1,0],[-1,0]].slice(0,seats);for(const [a,b] of at)out.push({i:'dining_chair',u:a*(T.w/2+.25),v:b*(T.d/2+.25),r:b>0?PI:b<0?0:a>0?PI/2:-PI/2});}
     else{const per=Math.min(Math.floor(T.w/.6),Math.ceil(seats/2));for(let k=0;k<per;k++){const u=(k-(per-1)/2)*.6;out.push({i:'dining_chair',u,v:T.d/2+.25,r:PI},{i:'dining_chair',u,v:-(T.d/2+.25),r:0});}}
     out.push({top:0,i:'ashtray',opt:1});return out;};
    const u=placeUnit(R,'dine',freeFrames(R),lay,{max:400});if(u){R.table=u;return u;}}
   return null;},
  desk(R,ent){const id=ent.desk??'desk_office',D=items[id],dp=doorPts(R),vd=.9+D.d/2;
   const score=f=>{if(!dp.length)return 0;const c=[f.o[0]+f.n[0]*3,f.o[1]+f.n[1]*3];return Math.min(...dp.map(p=>Math.hypot(p[0]-c[0],p[1]-c[1])));};
   const lay=()=>[{i:id,u:0,v:vd},{i:'office_chair',u:0,v:.45},{i:'visitor_chair',u:-.4,v:vd+D.d/2+.45,r:PI,opt:1},{i:'visitor_chair',u:.4,v:vd+D.d/2+.45,r:PI,opt:1},
    {top:0,i:'phone_desk'},{top:0,i:R.style==='motel'?'typewriter':R.style==='high_end'?'lamp_table':'computer_8bit'},{top:0,i:'paperwork'}];
   return placeUnit(R,'desk',wallFrames(R,D.w,{score}),lay,{max:500});},
  kitchen(R){for(const L of [4.2,3.6,3,2.4,1.8]){const x0=-L/2,rest=L-.8,c=(rest-.76)/2;
    const lay=()=>{const out=[{i:'fridge',u:x0+.4,v:.375},{i:'range',u:x0+.8+rest/2,v:.325}];
     if(c>=.3)out.push({i:'counter_run',w:c,u:x0+.8+c/2,v:.3},{i:'counter_run',w:c,u:L/2-c/2,v:.3},{top:2,i:'microwave'});return out;};
    const u=placeUnit(R,'kitchen',wallFrames(R,L),lay,{max:400});if(u)return u;}return null;},
  bar(R){for(const L of [6,5,4,3]){const n=Math.floor((L-1)/.6);
    const lay=()=>{const out=[{i:'back_bar',w:L,u:0,v:.25},{i:'bar_counter',w:L-1,u:.5,v:1.725}];
     for(let k=0;k<n;k++)out.push({i:'bar_stool',u:.5+(k-(n-1)/2)*.6,v:2.3,r:PI,noClear:1});out.push({top:0,i:'glasses_bottles'},{top:1,i:'cash_register'});return out;};
    const u=placeUnit(R,'bar',wallFrames(R,L),lay,{max:400});if(u)return u;}return null;},
  console(R){const fr=[];for(const e of R.edges)for(const q of e.open)if(q.kind==='window'&&!e.ext)fr.push({...wallFrame(R,e,(q.s0+q.s1)/2),win:q.s1-q.s0});
   const frames=fr.length?fr:wallFrames(R,2.6);
   const lay=f=>[{i:'console_desk',u:0,v:1.15},{i:'office_chair',u:0,v:2.1,r:PI},{i:'producer_desk',u:0,v:3.3,opt:1},
    {mount:'monitor_soffit',u:-((f.win??1.6)/2+.6),opt:1},{mount:'monitor_soffit',u:(f.win??1.6)/2+.6,opt:1}];
   return placeUnit(R,'console',frames,lay,{max:300});},
  count(R){return placeUnit(R,'count',freeFrames(R),()=>[{i:'count_table'},{i:'office_chair',v:.8,r:PI,noClear:1},{i:'office_chair',v:-.8,noClear:1},{top:0,i:'money_counter'},{top:0,i:'paperwork'}],{max:300});},
  bath(R){const basin=()=>placeItem(R,R.style==='motel'?'basin_pedestal':'vanity',{above:'mirror_cabinet'});
   let a=R.A>=3.5?placeItem(R,'tub'):null,b=placeItem(R,'wc');
   if(a&&!b){unplace(R,a);a=null;b=placeItem(R,'wc');}
   a=a||placeItem(R,'shower_stall');let c=basin();
   if(b&&!c){unplace(R,b);c=basin();b=placeItem(R,'wc');if(!b){if(c)unplace(R,c);b=placeItem(R,'wc');c=b&&basin();}}
   if(!a)R.warnings.push(`${R.id}: no tub or shower fits`);if(!b)R.warnings.push(`${R.id}: no wc fits`);
   return a||b||c?{members:[]}:null;},
  booth(R){return placeUnit(R,'booth',[...wallFrames(R,1.5),...freeFrames(R)],f=>{const w=f.free?[]:[];void w;
    return f.free?[{i:'banquette',v:1.05,r:PI},{i:'banquette',v:-1.05},{i:'coffee_table',v:0,noClear:1},{top:2,i:'ashtray',opt:1}]
     :[{i:'banquette',v:.3},{i:'coffee_table',v:1.35,noClear:1},{i:'banquette',v:2.4,r:PI},{top:1,i:'ashtray',opt:1}];},{max:400});},
  car(R){if(R.room.props?.some(p=>/car/.test(p.build??'')||/^car/.test(p.id)))return{members:[]};
   const st=R.room.stalls;if(!st?.length){R.warnings.push(`${R.id}: lot has no stalls; cars not placed`);return{members:[]};}
   const want=Math.round(st.length*(.4+R.rng()*.3));let n=0;
   for(const s of shuffle(R.rng,st)){if(n>=want)break;const th=s.rot??0;if(placeUnit(R,'car',[{o:s.at,n:[-Math.sin(th),Math.cos(th)],free:1}],()=>[{i:R.rng()<.15?'van_parked':'car_parked',noClear:1}]))n++;}
   return{members:[]};},
  parked(R){for(const l of R.room.parking??[]){const dx=l.b[0]-l.a[0],dz=l.b[1]-l.a[1],L=Math.hypot(dx,dz),n=[-dz/L,dx/L],th=rotFor([dx/L,dz/L]);
    for(let s=3;s<L-3;s+=6.5)if(R.rng()<.5)placeUnit(R,'car',[{o:[l.a[0]+dx/L*s,l.a[1]+dz/L*s],n:[-Math.sin(th),Math.cos(th)],free:1}],()=>[{i:'car_parked',noClear:1}]);void n;}
   return{members:[]};},
 };

 // ---- kit entries ----
 const ent=e=>typeof e==='string'?{i:e}:e;
 const entOK=(R,e)=>!(e.style&&e.style!==R.style||e.minA&&R.A<e.minA||e.use&&(e.use==='men'?/women|ladies/.test(R.hint):e.use!==R.use)
  ||e.unless&&(R.room.props??[]).some(p=>e.unless.test(p.id)));
 const countOf=(R,e)=>{if(e.per?.m2)return Math.max(1,Math.floor(R.A/e.per.m2));
  if(e.per?.len){const L=Math.max(...R.edges.map(x=>x.L));return Math.max(1,Math.floor(L/e.per.len));}
  if(e.per?.pool)return R.keepOut.length?R.keepOut.length*e.per.pool:2;return nOf(R.rng,e.n);};
 const runEntry=(R,e0,o={})=>{const e=ent(e0);if(!entOK(R,e))return true;
  if(e.g){const g=G[e.g];return!!(g&&g(R,e));}
  if(e.edge){let n=0;for(const f of edgeFrames(R,{water:1,pitch:e.pitch,inset:items[e.edge].d/2+.3}))if(placeUnit(R,e.edge,[f],()=>[{i:e.edge,v:0}]))n++;return n>0||!R.edges.some(x=>!x.wall);}
  if(e.row){const n=countOf(R,e);
   if(e.row==='cab')return sweep(R,['arcade_upright','arcade_upright','arcade_driver','arcade_upright'],{cap:R.kit.cap})>0;
   if(e.row==='laundry')return sweep(R,['washer','dryer'],{n:2*n,oneEdge:1})>0;
   if(e.len){for(const L of e.len)if(placeItem(R,e.row,{w:L},{cap:R.kit.cap}))return true;return false;}
   if(e.each==='long'){let k=0;for(const x of R.edges.filter(x=>x.wall).sort((a,b)=>b.L-a.L).slice(0,2))k+=sweep(R,[e.row],{edges:[x],n:3,cap:R.kit.cap});return k>0;}
   return sweep(R,[e.row],{n:e.per?.len?Math.max(1,Math.floor(Math.max(...R.edges.filter(x=>x.wall).map(x=>x.L))/e.per.len)):n,pitch:e.pitch,oneEdge:!!e.pitch,cap:R.kit.cap})>0;}
  if(e.rows||e.rep){const id=e.rows??e.rep,max=e.max??4;let k=0;for(let t=0;t<max;t++)if(placeItem(R,id,{},{cap:R.kit.cap}))k++;else break;return k>0;}
  const it=items[e.i];if(!it)return false;
  if(e.grid)return placeCeilGrid(R,it,e.grid)>0;
  if(e.anchor==='bed'){const b=R.bed?.members.find(m=>/^bed_/.test(m.it.id));if(!b)return false;
   const fv=[-Math.sin(b.rot),Math.cos(b.rot)],at=[b.at[0]+fv[0]*(b.it.d/2+.05+it.d/2),b.at[1]+fv[1]*(b.it.d/2+.05+it.d/2)],m=mem(it,at,b.rot);m.kind='floor';m.unit=R.bed;
   if(fitsFloor(R,R.bed,m))return false;R.floor.push(m);R.placed.push(m);R.bed.members.push(m);return true;}
  if(e.on){const h=R.floor.filter(m=>m.it.id===e.on);for(const x of h)if(addTop(R,x,it))return true;return false;}
  if(e.under==='window'&&!R.edges.some(x=>x.ext&&x.open.some(q=>q.kind==='window')))return true;
  const n=countOf(R,e);let k=0;for(let t=0;t<n;t++)if(placeItem(R,e.i,e,{cap:o.cap??R.kit.cap}))k++;
  if(!k&&e.alt)for(const a of e.alt)if(placeItem(R,a,e,{cap:o.cap??R.kit.cap}))return true;return k>0;};

 // ---- driver: DECOR.place(room, {levelId, seed, reserved, radius}) -> {props, decor, warnings} ----
 const variant=(R,k)=>{if(!k.uses)return k;const keys=Object.keys(k.uses);let use=R.room.use;
  if(use==null)use=keys.find(x=>R.hint.includes(x.replace('_',' '))||R.hint.includes(x));
  if(use==null){if(R.kind==='bath')use=R.A>8&&['commercial','deco'].includes(R.style)?'public':'private';
   else if(R.kind==='control')use=R.edges.some(e=>!e.ext&&hasWin(R,e))?'studio':'security';else use=keys[0];}
  if(!keys.includes(use)){R.warnings.push(`${R.id}: unknown use ${use} for ${R.kind}; using ${keys[0]}`);use=keys[0];}
  R.use=use;return{...k,...k.uses[use]};};
 const place=(room,o={})=>{
  const R=prep(room,o);R.rng=mulberry(fnv(`${o.levelId??''}/${room.id}/${o.seed??0}`));R.placed=[];
  R.hint=`${room.id} ${room.name??''}`.toLowerCase();if(o.debug){R.why={};R.t0=Date.now();}
  const out=()=>emit(R);
  if(NO_DECOR.includes(R.kind))return out();
  const k0=kitFor(R.kind,R.style);if(!k0){R.warnings.push(`${R.id}: no kit for kind ${R.kind}`);return out();}
  const kit=R.kit=variant(R,k0);
  if(R.A<kit.min)R.warnings.push(`${R.id}: ${R.A.toFixed(1)} m² is below the ${R.kind} kit minimum ${kit.min} m²; required items only`);
  for(const e of kit.req)if(!runEntry(R,e,{cap:1}))R.warnings.push(`${R.id}: dropped required ${ent(e).g??ent(e).i??ent(e).row??ent(e).rows??ent(e).rep??ent(e).edge}`);
  if(R.A>=kit.min){
   const opt=[],art=[],ceil=[],scat=[...(SCATTER[R.kind]??[])];
   for(const [e0,w] of kit.opt){const e=ent(e0),it=items[e.i];
    if(it&&it.host[0]==='ceiling'&&!e.grid){if(R.rng()<w/(w+1))ceil.push(e);continue;}
    if(it&&it.host[0]==='scatter'&&!it.rug){scat.push(e.i);continue;}
    if(it&&ART.has(it.id)&&!e.wall){art.push([e,w]);continue;}opt.push([e,w]);}
   const budget=Math.min(12,Math.max(1,Math.round(R.A/7)));
   const order=opt.map(([e,w])=>[e,-Math.log(1-R.rng())/w]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
   R.tryCap=160;let used=0;for(const e of order){if(used>=budget||R.solidA>=kit.cap*R.A)break;if(runEntry(R,e))used++;}
   // wall art: budget from the free full-height wall run
   const run=R.ext?0:R.edges.filter(e=>e.wall&&e.h>=2&&!/glass|hull/.test(e.build)).reduce((a,e)=>a+e.L-e.open.reduce((s,q)=>s+q.s1-q.s0,0),0);
   let na=Math.min(kit.art[1],Math.floor(kit.art[0]*run));
   for(const [e] of art)if(na>0&&R.rng()<.7&&runEntry(R,e))na--;
   for(let t=0;t<na*3&&na>0;t++){const id=artPick(R);if(id&&placeMount(R,items[id]))na--;}
   // ceiling: fans over the bed or sofa, chandeliers over the table, else the room centre; smoke detectors
   for(const e of ceil){const it=items[e.i],anchor=(e.i==='chandelier'?R.table:R.bed??R.sofa??R.table)?.members[0];placeCeil(R,it,e,anchor?[anchor.at]:[]);}
   if(R.roof&&!R.ext&&R.A>=6&&!['bath','closet'].includes(R.kind))placeCeil(R,items.smoke_detector,{},[]);
   // tabletop dressing
   for(const h of R.floor.slice()){if(h.plan||h.tops?.length||R.rng()>.6)continue;
    const pool=Object.values(items).filter(t=>t.host[0]==='top'&&t.on?.includes(h.it.id)&&t.styles.includes(R.style));if(pool.length)addTop(R,h,pick(R.rng,pool));}
   // scatter
   if(scat.length){const n=Math.min(10,Math.round(kit.scatter*R.A/10));for(let t=0;t<n;t++)placeScatter(R,items[pick(R.rng,scat)]);}
  }
  return out();};
 const emit=R=>{const props=[],decor=[];let np=0,nd=0;const sty=R.style;
  for(const m of R.placed){const it=m.it,base={kind:it.id,room:R.id};
   if(m.kind==='floor'&&m.solid){const build=it.buildBy?.[sty]??it.build;
    props.push({id:`dc_${R.id}_${np++}`,item:it.id,room:R.id,at:[r3(m.at[0]),r3(m.at[1])],size:[r3(it.w),r3(it.d)],rot:r3(m.rot),build,cov:it.cov,h:r3(it.h)});continue;}
   const y=m.kind==='mount'?m.y-it.h/2:m.kind==='ceil'?m.y:m.kind==='top'?m.y:0;
   decor.push({id:`dv_${R.id}_${nd++}`,...base,at:[r3(m.at[0]),r3(m.at[1])],size:[r3(it.foot??it.w),r3(it.foot??it.d)],h:r3(it.h),rot:r3(m.rot),y:r3(Math.max(0,y))});}
  return{props,decor,warnings:R.warnings,use:R.use,...(R.why?{why:R.why,ms:Date.now()-R.t0}:{})};};

 // ---- plan bridge: dress a PLAN stage (PLAN.fromPlan output) room by room ----
 const thickOf=b=>{const B=typeof WORLD!=='undefined'&&WORLD.materials?.BUILD?.[b];return B?B.layers.reduce((a,l)=>a+l[1],0)/100:.15;};
 const roomEdges=(piece,walls,pieceAt,rooms)=>{const p=piece.poly,out=[];
  for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<1e-6)continue;const t=[dx/L,dz/L];
   const par=q=>(q[0]-a[0])*t[0]+(q[1]-a[1])*t[1],off=q=>Math.abs((q[0]-a[0])*t[1]-(q[1]-a[1])*t[0]);const iv=[];
   for(const w of walls){let S=0;for(let k=0;k+1<w.path.length;k++){const P=w.path[k],Q=w.path[k+1],l=Math.hypot(Q[0]-P[0],Q[1]-P[1]);
     if(off(P)<2e-3&&off(Q)<2e-3){const tp=par(P),tq=par(Q),lo=Math.max(0,Math.min(tp,tq)),hi=Math.min(L,Math.max(tp,tq));
      if(hi-lo>1e-3){const dir=tq>=tp?1:-1,open=[];
       for(const q of w.open??[]){if(q.s1<=S||q.s0>=S+l)continue;const e0=tp+dir*(Math.max(q.s0,S)-S),e1=tp+dir*(Math.min(q.s1,S+l)-S);
        open.push({s0:Math.min(e0,e1),s1:Math.max(e0,e1),kind:q.kind==='window'?'window':'door',y0:q.y0,y1:q.y1,id:q.id});}
       iv.push({lo,hi,h:w.h,build:w.build,thick:thickOf(w.build),open});}}S+=l;}}
   iv.sort((x,y)=>x.lo-y.lo);const cuts=[];let s=0;
   for(const v of iv){if(v.lo>s+1e-3)cuts.push({lo:s,hi:v.lo});if(v.hi>s+1e-3)cuts.push({...v,lo:Math.max(s,v.lo)});s=Math.max(s,v.hi);}if(L>s+1e-3)cuts.push({lo:s,hi:L});
   // wall-end stubs (half the thickness of a crossing wall) belong to the neighbouring wall, not to an opening
   for(let k=0;k<cuts.length;k++){const c=cuts[k];if(c.build!=null||c.hi-c.lo>=.3)continue;const nb=cuts[k-1]?.build!=null?cuts[k-1]:cuts[k+1]?.build!=null?cuts[k+1]:null;
    if(nb)cuts[k]={...nb,lo:c.lo,hi:c.hi,open:[]};}
   for(const c of cuts){const A=[a[0]+t[0]*c.lo,a[1]+t[1]*c.lo],B=[a[0]+t[0]*c.hi,a[1]+t[1]*c.hi],m=[(A[0]+B[0])/2,(A[1]+B[1])/2];
    let n=[-t[1],t[0]];if(!inPoly(p,[m[0]+n[0]*.02,m[1]+n[1]*.02]))n=[-n[0],-n[1]];
    const d=(c.thick??0)/2+.05,nb=pieceAt(m[0]-n[0]*d,m[1]-n[1]*d),other=nb&&rooms.get(nb),ext=!other||other.zone==='exterior';
    out.push({a:A,b:B,wall:c.build!=null,h:c.h,build:c.build,thick:c.thick,ext,water:!other,
     open:(c.open??[]).filter(q=>q.s1>c.lo&&q.s0<c.hi).map(q=>({...q,s0:Math.max(0,q.s0-c.lo),s1:Math.min(c.hi-c.lo,q.s1-c.lo),exit:q.kind==='door'&&ext}))});}}
  return out;};
 const dressStage=(plan,sid,o={})=>{const P=o.PLAN??(typeof PLAN!=='undefined'?PLAN:null);if(!P)throw new Error('DECOR.dressStage needs PLAN');
  const {stage,extras,info}=P.fromPlan(plan,sid),S=plan.stages[sid],H=S.defaults?.h??plan.defaults?.h??2.8;
  const rooms=new Map(stage.rooms.map(r=>[r.id,r])),src=new Map((S.rooms??[]).map(r=>[r.id,r]));
  const pts=[...stage.spawns.map(s=>({at:[s.x,s.z],r:.6})),...extras.obj.map(q=>({at:q.at,r:1})),...extras.stash.map(q=>({at:q.at,r:.6})),
   ...extras.stairs.map(q=>({at:q.at,r:1.2})),...extras.items.map(q=>({at:q.at??[q.x,q.z],r:.6})),...(o.reserved??[])];
  const water=stage.ground.filter(g=>g.surf==='water'||g.y<0).map(g=>g.poly);
  const res={props:[],decor:[],warnings:[],rooms:{}};
  for(const pc of stage.rooms){const kind=o.kindOf?.(pc)??pc.kind;if(NO_DECOR.includes(kind)||!KINDS.includes(kind)){if(!KINDS.includes(kind))res.warnings.push(`${pc.id}: kind ${kind} has no kits`);continue;}
   const sr=src.get(pc.id)??src.get(pc.parent)??{},c=centroid(pc.poly);
   const props=stage.props.filter(p=>{const q=centroid(p.poly);return info.pieceAt(q[0],q[1])===pc.id;});
   const room={id:pc.id,name:pc.name??sr.name,kind,style:pc.style??o.style??'commercial',use:sr.use,poly:pc.poly,h:sr.h??H,roof:pc.roof,
    edges:roomEdges(pc,stage.walls,info.pieceAt,rooms),reserved:pts,props,keepOut:water.filter(w=>w.some(v=>inPoly(pc.poly,v))||inPoly(w,c)),stalls:sr.stalls,parking:sr.parking};
   const r=place(room,{levelId:`${plan.id}/${sid}`,seed:o.seed,debug:o.debug});
   res.props.push(...r.props);res.decor.push(...r.decor);res.warnings.push(...r.warnings);res.rooms[pc.id]={kind,use:r.use,props:r.props.length,decor:r.decor.length,...(r.why?{why:r.why,ms:r.ms}:{})};}
  return res;};
 // apply(plan) -> {plan: copy with generated solids appended to each stage's props, decor:{sid:[records]}, warnings}
 const apply=(plan,o={})=>{const copy=JSON.parse(JSON.stringify(plan)),decor={},warnings=[];
  for(const sid of Object.keys(plan.stages)){const r=dressStage(plan,sid,o);
   copy.stages[sid].props=[...(copy.stages[sid].props??[]),...r.props.map(({item,room,...p})=>p)];
   decor[sid]=r.decor;warnings.push(...r.warnings.map(w=>`${sid}: ${w}`));}
  return{plan:copy,decor,warnings};};
 return Object.freeze({version:1,STYLES,KINDS,NO_DECOR,items,kits,ARTPOOL,SCATTER,kitFor,place,dressStage,apply,
  _:{rect,overlap,inPoly,polyD,area,roomEdges,prep,fitsFloor,wallFrames,realize,navOK}});
})();
