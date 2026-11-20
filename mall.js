'use strict';
/* BISCAYNE GALLERIA: the shopping mall on the car menu. Drive in, park on the street and walk through the glass doors into an
   open atrium (a gold fountain under palms, a food court between two escalators, red-cushioned benches, planters, lamps
   and shoppers). Glass shopfronts open off the atrium, each with its own keeper:
     GOLD COAST JEWELERS (west)  jewelry you wear: it shows on your character (watch, chains, rings, bracelet, medallion)
     SUNSHINE REALTY (west)      homes to buy or move back into, and investment property that pays rent after every job
     CASA BONITA (east, north)   furniture for any home you own, delivered while you are out
     FONTAINE TAILORING (east, south)  suits made to measure that you wear (SUITS in index.html with shop:1)
     VICTORY MOTORS (at the back) Vic's showroom: the dealer screen and his turntables (cars.js)
   Vic, Schmaltzy (jewelry), Felix (tailor) and Lola (furniture) have photo faces (ART / CH in models.js); Barbara is still a placeholder.
   Every shop screen is the shared #sStore screen in its own storeMode ('jewel', 'furn', 'realty').
   The hub map is HUBS.mall in index.html; map cell (x,z) is world (x+1,z+1) because the loader pads every map by one cell.
   Loaded after gunshop.js, before the main inline script: nothing here touches main-script globals at load time. */
const MALL_NAME='BISCAYNE GALLERIA';
const MALL_SHOPS={
 jewel:{name:'GOLD COAST JEWELERS',sub:'GOLD · DIAMONDS · NO QUESTIONS ASKED',who:'SCHMALTZY THE GOLDPAWN',short:'SCHMALTZY',npc:'jeweler',what:'JEWELRY',col:'#ffd36b',
  intro:"Schmaltzy. The Goldpawn. That's Nugget on the counter, he bites. Everything in this case is real gold, I weigh it myself. You want to look rich or you want to look poor?",
  hi:["You again. Nugget, look who's back. He doesn't like you either.","Gold goes up. Always up. Buy now, thank me later.","I had a guy try to pawn a fake Rolex. Once.","Look with your eyes, not your fingers. Nugget's watching."],
  sold:["Sold. Wear it out, let the whole strip see.","Pleasure. Nugget says it suits you. Nugget lies.","Real gold, real weight. Don't let anybody tell you different."],
  poor:["That's not money, that's a tip. Come back with real money.","Nugget's chain costs more than your wallet."],
  bye:["Go on, shine. Nugget, say bye.","Don't pawn it. If you pawn it, pawn it with me.","Come back when you're richer. Everybody comes back."]},
 furn:{name:'CASA BONITA',sub:'DESIGN · INTERIORS · DELIVERED WHILE YOU ARE OUT',who:"LOLA 'CALIENTE' MONTENEGRO",short:'LOLA MONTENEGRO',npc:'furnman',what:'FURNITURE',col:'#7dff9a',
  intro:"Hola, guapo. Lola Montenegro, Casa Bonita. Peach leather, glass and brass, a bed you won't want to leave. You choose, my boys deliver, and nobody asks about the bullet holes.",
  hi:["Look who came back to see me.","Sit on that sofa, mi amor. Tell me that's not heaven.","Everything here is on sale for you. Only for you.","A man is only as good as his living room."],
  sold:["Delivered tonight, cariño. Think of me when you sit on it.","Ay, beautiful choice. Your place is going to be muy caliente.","Done. My boys are fast, and very discreet."],
  poor:["Ay, papi, your taste is bigger than your wallet.","Come back with more cash and I'll give you the good smile."],
  bye:["Adiós, guapo. Don't make me wait too long.","Mi casa, su casa. Literally, you bought it.","Ciao, mi amor. Watch the doorframes when they deliver."]},
 realty:{name:'SUNSHINE REALTY',sub:'HOMES · INVESTMENT PROPERTY · CASH WELCOME',who:'BARBARA BRIGHTWATER',short:'BARBARA BRIGHTWATER',npc:'realtor',what:'REAL ESTATE',col:'#ff6fae',
  intro:"Barbara Brightwater, Sunshine Realty! Location, location, and cash. I find you a place to live, and places that pay you while you sleep.",
  hi:["Miami's only going up, darling. Get in now.","Cash buyers are my favourite kind of buyer.","I don't ask where the money comes from. It's very freeing.","Every listing I sell, I sell with a smile. This smile."],
  sold:["Congratulations! Keys, deed, and a fruit basket.","SOLD! I'll put the sign out myself.","Pleasure doing business. Mostly the commission."],
  poor:["Oh honey. The bank won't touch you and neither will I.","Maybe start with something smaller. Like a parking space."],
  bye:["Bye now! Tell your friends with cash.","Don't forget, Miami's only going up!","Ta-ta! Keep those payments coming."]},
 tailor:{name:'FONTAINE TAILORING',sub:'SUITS · LINEN · SILK · SUNGLASSES · ACCESSORIES',who:"FELIX 'FABULOSO' FONTAINE",short:'FABULOSO FELIX',npc:'tailor',what:'SUITS',col:'#ff9ec7',
  intro:"Welcome, welcome! Felix Fontaine, but the whole of Ocean Drive calls me Fabuloso. Arms out, chin up. Honey, we are going to make you unforgettable.",
  acc:["Accessories, darling! The exclamation mark on the sentence.","Oh, that is a whole personality. Wear it out.","Now THAT is a finishing touch. Nobody will look at anything else.","A man is his details. And your details are fabuloso."],
  shades:["Oh, those frame your face like a Monet, darling.","Now you look like trouble with a trust fund.","Sunglasses indoors? Honey, that's the whole point.","The sun is jealous. Let it be."],
  hi:["There's my favourite silhouette! Turn around, let me see.","Linen breathes, silk shines, polyester confesses. Choose wisely.","A good suit walks into a room before you do.","Pastel is not a colour, darling, it's an attitude."],
  sold:["Look at those shoulders! Wear it out, I insist.","Fabuloso! Miami is not ready for you.","Perfect fit. I'd tell you you're welcome, but just look in the mirror."],
  poor:["Ooh, darling, love the ambition, not the budget.","Come back when the wallet matches the cheekbones."],
  bye:["Ciao, gorgeous! Stand up straight out there.","Strut, don't walk!","Come back for a fitting, any time."]},
 /* upstairs (upstairs.js): Crazy Ray's, Doc Feelgood's and the Starlite Zone arcade */
 elec:{name:"CRAZY RAY'S ELECTRONICS",sub:'TVs · VCRs · CAR PHONES · SCANNERS',who:"RAY 'CRAZY RAY' RUSSO",short:'CRAZY RAY',npc:'ray',what:'ELECTRONICS',col:'#2de2e6',
  intro:"Crazy Ray! My prices are INSANE! Pagers, car phones, a police scanner that fell off a truck. The truck was a police truck. You didn't hear that from me.",
  hi:["Prices so low I should be arrested! Again!","Everything works. Mostly. Ninety-day warranty on the box.","You look like a man who needs to know when the cops are coming.","Car phone! In a car! It's the future, my friend!"],
  sold:["SOLD! Batteries not included. Okay, included. For you.","Crazy deal, crazy guy, crazy you!","Pleasure. Don't tell anybody what you paid, they'll think I'm nuts."],
  poor:["Even crazy has limits, pal.","Come back with real money and I'll go INSANE on you."],
  bye:["Stay crazy!","Tell your friends! Not the cop friends!","Come back, I got VCRs coming in Tuesday."]},
 clinic:{name:"DOC FEELGOOD'S",sub:'PHARMACY · PATCH-UPS · NO PAPERWORK',who:"DR. MAXWELL 'DOC FEELGOOD' GOODE",short:'DOC FEELGOOD',npc:'doc',what:'PHARMACY',col:'#7dff9a',
  intro:"Doc Feelgood. Board certified, more or less. Something for the pain, something for the nerves, something for when you should be dead. Cash, no names.",
  hi:["Back again? Let me guess. You fell on some bullets.","Open wide. Kidding. I don't do teeth.","Take two of these and don't call me in the morning.","My waiting room's empty. My best customers don't wait."],
  sold:["Next job only. After that you're on your own again.","There you go. Don't mix it with anything. Or do, I'm not your mother.","Good choice. The dead ones never come back to complain."],
  poor:["No money, no medicine. That's the Hippocratic oath, right?","Try the free clinic. They ask a lot of questions."],
  bye:["Stay healthy. Or at least alive.","Come back in one piece. Or a few, I can work with that.","Doctor's orders: duck."]},
 arcade:{name:'STARLITE ZONE',sub:'ARCADE · TOKENS · HIGH SCORES',who:'STARLA NOVA',short:'STARLA',npc:'starla',what:'ARCADE',col:'#c9b6f2',
  intro:"Welcome to the Starlite Zone! I'm Starla. Tokens are twenty bucks a game, high scores go on the board, and the Quickdraw jackpot hasn't been hit all summer.",
  hi:["Back for the jackpot? Everybody's back for the jackpot.","The kids say you're fast. Prove it.","Quickdraw '86, best cabinet in Florida. Don't hit the screen.","No running, no smoking, no shooting. Real guns, I mean."],
  sold:["Good luck, gunslinger.","Insert token. Breathe. Draw.","Machine's warm. Go get it."],
  poor:["Twenty bucks a game, hon. Come back with twenty bucks.","Even the kids have quarters."],
  bye:["See you, space cowboy.","Come back and beat your score!","Game over, man. Come back soon."]}};
const MALL_MODES=['jewel','furn','realty','tailor','elec','clinic','arcade'],mallMode=()=>MALL_MODES.includes(storeMode);
/* investment property from Sunshine Realty: each one pays rent after every finished job (payout in index.html calls mallRent) */
const MALL_PROPS=[
 {k:'laundro',name:'SUDS-O-RAMA LAUNDROMAT',price:15000,rent:500,desc:'Twenty coin machines on Collins. Very clean money.'},
 {k:'arcade',name:'PIXEL PALACE ARCADE',price:35000,rent:1200,desc:'Pinball, Pac-Man and a back room nobody asks about.'},
 {k:'motel',name:'PALM BREEZE MOTEL',price:70000,rent:2500,desc:'Pink stucco, a pool, rooms by the hour or the week.'},
 {k:'marina',name:'BISCAYNE MARINA SLIPS',price:150000,rent:5500,desc:'Forty boat slips. The boats come and go at night.'}];
/* furniture Casa Bonita doesn't stock: animals, people. Those stay on the home phone */
const MALL_NOFURN=['girls','guards','dog','cat','iguana','tigerpet','doberman'];
let mallSayTxt='';
function mallProps(p){return p.props||(p.props={});}
function mallRent(p){const o=mallProps(p);let r=0;for(const q of MALL_PROPS)if(o[q.k])r+=q.rent;if(r){p.wallet+=r;p.rentTot=(p.rentTot||0)+r;}return r;}
/* jewelry: p.jewel[k] is true while you wear it, 'off' while it sits in your box (still yours) */
function jewelWorn(p,k){return p&&p.jewel&&p.jewel[k]===true;}

/* ---------- the hub ---------- */
function mallSetup(g){dealerSetup(g);const D=g.dealer,O=1;
 g.mall={keepers:[],T:0};D.signZ=15.04;D.signX=g.W/2;D.noPylon=1;D.pen=[[3,g.W-2,4.6],[3,g.W-2,11.8]];
 g.car={x:g.park.x,z:g.park.z};
 for(const n of g.npcs){const s=Object.keys(MALL_SHOPS).find(k=>MALL_SHOPS[k].npc===n.kind);if(!s)continue;n.a=n.a0=0;n.r=0.3;n.shop=s;g.mall.keepers.push(n);
  g.lights.push({x:n.x,y:2.0,z:n.z+1.2,r:3.4,c:[1.2,1.05,0.9]});}
 /* everything you can bump into: counters, cases, planters, benches, escalators, the showroom sets */
 const S=g.solids=g.solids||[],R=(x,z,w,d)=>S.push({x:x+O,z:z+O+MALL_DZ,w,d});
 /* jewelry: the counter across the shop with Schmaltzy behind it, the wall cabinets, the round case and the safe */
 R(4.5,10.95,6.2,0.7);R(5.5,6.35,8.6,0.6);R(8.5,13.5,1.3,1.3);R(1.5,6.6,0.9,1.0);
 /* realty: Barbara's desk, the filing cabinets, the tower model */
 R(5.5,20.4,3.0,0.9);R(1.4,17.4,0.7,0.7);R(9.4,23.6,1.5,1.5);
 /* furniture showroom (north half): counter, living set, bedroom set */
 R(41.5,9.95,4.0,0.7);R(37.5,13.4,3.0,1.1);R(41.7,13.5,2.2,2.4);
 /* tailor (south half): Felix's cutting table, the mannequins, the clothes rail, the mirror */
 R(39.5,19.7,3.6,0.9);for(const [x,z] of MALL_MANNEQ)R(x,z,0.6,0.6);R(43.4,22.6,0.6,4.2);R(41.4,22.4,0.7,0.7);
 /* atrium: escalators, landing posts, fountain planters, corner gardens, pool benches */
 for(const ex of MALL_ESC)R(ex,20.5,2.0,7.0);
 for(const [x,z] of MALL_PLANTERS)R(x,z,1.3,1.3);
 for(const [x,z] of MALL_GARDENS)R(x,z,2.6,1.8);
 /* food court: the tables and the two stalls (counter and back) */
 for(const [x,z] of MALL_TABLES)R(x,z,1.0,1.0);
 for(const st of MALL_STALLS){R(st.x,st.z,1.0,2.6);R(st.x-st.side*0.9,st.z,0.4,2.6);}
 mallCourt(g);
 g.lights.push({x:23.5,y:2.8,z:29.5,r:6,c:[1.25,0.95,0.7]},{x:16.4,y:2.4,z:29.8,r:3.4,c:[1.3,0.8,0.5]},{x:30.6,y:2.4,z:29.8,r:3.4,c:[0.8,1.2,0.6]},{x:6,y:2.4,z:19,r:5,c:[1.25,0.95,0.55]},{x:6,y:2.4,z:30,r:5,c:[1.25,0.6,0.85]},{x:40,y:2.4,z:20,r:6,c:[0.7,1.15,0.85]},{x:39.5,y:2.5,z:30.5,r:6,c:[1.2,0.75,0.95]},{x:23.5,y:2.8,z:33.5,r:6,c:[0.85,0.8,0.75]},{x:23.5,y:3,z:38,r:7,c:[0.8,0.45,0.75]});
 /* the glass runs (H cells): frames and panes are drawn by drawMallGlass */
 g.mall.glass=[];for(let z=0;z<g.H;z++)for(let x=0;x<g.W;x++)if(g.rows[z]&&g.rows[z][x]==='H')g.mall.glass.push([x,z]);
 venueLot(g);
 g.obj='SHOP AROUND · THEN BACK TO YOUR CAR';}
/* the atrium and the side shops were laid out with the entrance at the top; they sit MALL_DZ rows further south now that you walk in
   from the front (Victory Motors moved to the back). Their coordinates below stay in that layout and get MALL_DZ added. */
const MALL_DZ=8;
/* fountain planters and the four corner gardens (map coords, before MALL_DZ) */
/* the tailor's mannequins (old layout coordinates, + MALL_DZ like the rest): x, z, suit colour */
const MALL_MANNEQ=[[35.7,20.2,[0.98,0.77,0.67]],[35.7,23.4,[0.63,0.91,0.81]],[38.6,24.8,[0.96,0.96,0.93]],[41.2,24.8,[0.78,0.66,0.93]]];
const MALL_PLANTERS=[[19.5,9.5],[25.5,9.5],[19.5,14.5],[25.5,14.5]];
const MALL_GARDENS=[[14.5,8.0],[30.5,8.0],[14.5,24.6],[30.5,24.6]];
/* the escalators flank the food court, clear of the shop signs that hang in front of the side shops */
const MALL_ESC=[18.6,26.4];
/* the food court (old layout coords): round tables either side of the aisle from the front doors to the fountain, and two food stalls */
const MALL_TABLES=[[20.7,18.4],[24.3,18.4],[20.7,20.8],[24.3,20.8],[20.7,23.2],[24.3,23.2]];
const MALL_STALLS=[{x:15.4,z:20.8,side:1,name:['PIZZA','PALACE'],col:[1,0.55,0.2],rim:[1,0.2,0.2],awn:[[1,0.2,0.2],[1,1,1]]},
 {x:29.6,z:20.8,side:-1,name:['TACO','LOCO'],col:[0.5,1,0.45],rim:[1,0.85,0.2],awn:[[0.2,0.75,0.3],[1,0.9,0.3]]}];
/* the chairs: four round each table; who sits where (the rest stay free) */
const MALL_CHAIRS=[[0.78,0],[-0.78,0],[0,0.78],[0,-0.78]];
const MALL_DINERS=[[0,0],[0,2],[1,1],[1,3],[2,0],[3,2],[3,1],[4,0],[4,3],[5,1],[5,2]];
function mallTargets(g,t){for(const n of g.mall.keepers){const s=MALL_SHOPS[n.shop];t.push({k:'shop',shop:n.shop,x:n.x,z:n.z,r:2.9,lbl:'TALK TO '+s.short+' · '+s.what});}
 const O=1,OZ=O+MALL_DZ;t.push({k:'shop',shop:'jewel',x:8.5+O,z:14.9+OZ,r:1.6,lbl:'GOLD COAST JEWELERS · THE CASE'});t.push({k:'shop',shop:'furn',x:37.5+O,z:14.4+OZ,r:1.6,lbl:'CASA BONITA · LOOK AROUND'});t.push({k:'shop',shop:'tailor',x:37.6+O,z:21.5+OZ,r:1.5,lbl:'FONTAINE TAILORING · THE RAIL'});
 t.push({k:'dir',x:16.6+O,z:26.0+OZ,r:1.5,lbl:'MALL DIRECTORY'});
 /* the escalators go up to level 2 (upstairs.js) */
 MALL_ESC.forEach((ex,i)=>t.push({k:'up',fn:()=>mallRide('up',i),x:ex+O,z:25.0+OZ,r:1.3,lbl:'RIDE UP · LEVEL 2: ELECTRONICS · ARCADE · CLINIC'}));}
function mallHello(g){if(!g||!g.mall)return;banner(MALL_NAME,'Jewelry · suits · furniture · real estate · Victory Motors');}
function mallDirectory(){const g=G;if(!g||!g.player)return;sfx('blip');popup(g.player.x,g.player.z-0.4,'WEST: JEWELRY · REALTY   EAST: FURNITURE · TAILOR   AT THE BACK: VICTORY MOTORS','#2de2e6');}
/* shoppers wander the atrium only, and walk around the planters and benches */
function mallWalk(n,dt,g,p){const d=Math.hypot(p.x-n.x,p.z-n.z);n.vx=0;n.vz=0;if(d<1.4)return;
 const free=(x,z)=>!g.solids.some(s=>Math.abs(x-s.x)<s.w/2+0.4&&Math.abs(z-s.z)<s.d/2+0.4)&&!isBlock(Math.floor(x),Math.floor(z));
 if(!n.tgt||Math.hypot(n.tgt[0]-n.x,n.tgt[1]-n.z)<0.3||n.stuck>1.2){let t=null;for(let k=0;k<24&&!t;k++){const x=13.6+Math.random()*19.8,z=15.8+Math.random()*18;if(free(x,z))t=[x,z];}n.tgt=t||[n.x,n.z];n.stuck=0;n.wait=rnd(0.6,3.5);}
 if(n.wait>0){n.wait-=dt;return;}
 const dx=n.tgt[0]-n.x,dz=n.tgt[1]-n.z,L=Math.hypot(dx,dz)||1,sp=0.8;n.vx=dx/L*sp;n.vz=dz/L*sp;const ox=n.x,oz=n.z;n.x+=n.vx*dt;n.z+=n.vz*dt;collideGrid(n);for(const s of g.solids)boxPush(s,n);
 const m=Math.hypot(n.x-ox,n.z-oz);n.walk=(n.walk||0)+m*9;if(m<sp*dt*0.3)n.stuck=(n.stuck||0)+dt;n.a+=clamp(angDiff(n.a,Math.atan2(dx,dz)),-5*dt,5*dt);}
/* low-poly looks for the mall keepers (used when the photo-face models aren't drawn; Barbara is still a placeholder) */
function mallLook(k){const hx=v=>[(v>>16&255)/255,(v>>8&255)/255,(v&255)/255];
 if(k==='jeweler')return{calm:1,skin:hx(0xd8a07a),jacket:hx(0xf6d6be),shirt:hx(0x2a8f8a),torsoTile:32,pants:hx(0xf0d0b8),shoes:hx(0xc8aa82),hs:'big',hair:hx(0x1a1210),chain:true,medallion:true,watch:true,bling:true,aviators:true,bw:1.0,bd:1.0,bh:0.98};
 if(k==='tailor')return{calm:1,skin:hx(0xe0aa80),jacket:hx(0xf4a8be),shirt:hx(0xd98aa4),torsoTile:32,pants:hx(0xf0a4ba),shoes:hx(0xf6f4ee),hs:'big',hair:hx(0x6a4426),stache:true,chain:true,watch:true,aviators:true,bw:1.0,bd:1.0,bh:1.02};
 if(k==='furnman')return{fem:true,calm:1,sleeves:true,pads:true,heels:true,skirt:0.55,skin:hx(0xe0b088),jacket:hx(0xb21c34),shirt:hx(0x161418),pants:hx(0x962032),shoes:hx(0x281418),hs:'big',hair:hx(0xa8784a),chain:true,watch:true,bw:0.86,bd:0.86,bh:1.02};
 if(k==='ray')return{calm:1,skin:hx(0xe8b890),jacket:hx(0x2de2e6),shirt:hx(0xff6fae),torsoTile:32,pants:hx(0x2a2a33),shoes:hx(0xffffff),hs:'big',hair:hx(0x2a1a10),stache:true,glasses:true,watch:true,bw:1.08,bd:1.1,bh:0.98};
 if(k==='doc')return{calm:1,skin:hx(0xf0c8a8),jacket:hx(0xf6f6f6),shirt:hx(0x7dff9a),torsoTile:32,pants:hx(0x8a8a96),shoes:hx(0x2a1a14),hs:'slick',hair:hx(0xd8d8d8),glasses:true,watch:true,bw:0.96,bd:0.98,bh:1.02};
 if(k==='starla')return{fem:true,calm:1,sleeves:true,pads:true,heels:true,skirt:0.5,skin:hx(0xc88a5a),jacket:hx(0x9a5ad8),shirt:hx(0x2de2e6),pants:hx(0x1a1a22),shoes:hx(0xffffff),hs:'big',hair:hx(0x101010),chain:true,bw:0.86,bd:0.86,bh:1.0};
 return{fem:true,calm:1,sleeves:true,pads:true,heels:true,skirt:0.6,skin:hx(0xf0c8a0),jacket:hx(0xff6fae),shirt:hx(0xffffff),pants:hx(0xf0c8a0),shoes:hx(0xffffff),hs:'long',hair:hx(0xf0d070),medallion:true,bw:0.86,bd:0.86,bh:1.02};}

/* ---------- signs: a stroke font for the neon lettering (unit cell, y up) ---------- */
const MALL_FONT={A:[[0,0,0.5,1],[0.5,1,1,0],[0.22,0.42,0.78,0.42]],B:[[0,0,0,1],[0,1,0.72,1],[0.72,1,0.9,0.82],[0.9,0.82,0.72,0.52],[0,0.52,0.75,0.52],[0.75,0.52,1,0.3],[1,0.3,0.78,0],[0.78,0,0,0]],
 C:[[1,1,0,1],[0,1,0,0],[0,0,1,0]],D:[[0,0,0,1],[0,1,0.6,1],[0.6,1,1,0.68],[1,0.68,1,0.32],[1,0.32,0.6,0],[0.6,0,0,0]],E:[[1,1,0,1],[0,1,0,0],[0,0,1,0],[0,0.5,0.75,0.5]],F:[[1,1,0,1],[0,1,0,0],[0,0.5,0.75,0.5]],
 G:[[1,1,0,1],[0,1,0,0],[0,0,1,0],[1,0,1,0.45],[1,0.45,0.5,0.45]],H:[[0,0,0,1],[1,0,1,1],[0,0.5,1,0.5]],I:[[0.5,0,0.5,1],[0.2,1,0.8,1],[0.2,0,0.8,0]],J:[[1,1,1,0],[1,0,0,0],[0,0,0,0.32]],
 K:[[0,0,0,1],[0,0.42,1,1],[0.3,0.6,1,0]],L:[[0,1,0,0],[0,0,1,0]],M:[[0,0,0,1],[0,1,0.5,0.45],[0.5,0.45,1,1],[1,1,1,0]],N:[[0,0,0,1],[0,1,1,0],[1,0,1,1]],O:[[0,0,1,0],[1,0,1,1],[1,1,0,1],[0,1,0,0]],
 P:[[0,0,0,1],[0,1,1,1],[1,1,1,0.5],[1,0.5,0,0.5]],Q:[[0,0,1,0],[1,0,1,1],[1,1,0,1],[0,1,0,0],[0.6,0.3,1.1,-0.12]],R:[[0,0,0,1],[0,1,1,1],[1,1,1,0.5],[1,0.5,0,0.5],[0.3,0.5,1,0]],
 S:[[1,1,0,1],[0,1,0,0.5],[0,0.5,1,0.5],[1,0.5,1,0],[1,0,0,0]],T:[[0,1,1,1],[0.5,1,0.5,0]],U:[[0,1,0,0],[0,0,1,0],[1,0,1,1]],V:[[0,1,0.5,0],[0.5,0,1,1]],
 W:[[0,1,0.22,0],[0.22,0,0.5,0.62],[0.5,0.62,0.78,0],[0.78,0,1,1]],X:[[0,0,1,1],[0,1,1,0]],Y:[[0,1,0.5,0.5],[1,1,0.5,0.5],[0.5,0.5,0.5,0]],Z:[[0,1,1,1],[1,1,0,0],[0,0,1,0]],
 0:[[0,0,1,0],[1,0,1,1],[1,1,0,1],[0,1,0,0],[0,0,1,1]],1:[[0.5,0,0.5,1],[0.5,1,0.22,0.78],[0.2,0,0.8,0]],2:[[0,1,1,1],[1,1,1,0.5],[1,0.5,0,0.5],[0,0.5,0,0],[0,0,1,0]],3:[[0,1,1,1],[1,1,1,0],[1,0,0,0],[0.3,0.5,1,0.5]],
 4:[[0,1,0,0.5],[0,0.5,1,0.5],[1,1,1,0]],5:[[1,1,0,1],[0,1,0,0.5],[0,0.5,1,0.5],[1,0.5,1,0],[1,0,0,0]],6:[[1,1,0,1],[0,1,0,0],[0,0,1,0],[1,0,1,0.5],[1,0.5,0,0.5]],7:[[0,1,1,1],[1,1,0.3,0]],
 8:[[0,0,1,0],[1,0,1,1],[1,1,0,1],[0,1,0,0],[0,0.5,1,0.5]],9:[[1,0,1,1],[1,1,0,1],[0,1,0,0.5],[0,0.5,1,0.5]],'·':[[0.4,0.45,0.6,0.55]],'-':[[0.15,0.5,0.85,0.5]]};
/* a word in neon tubes, centred on cx, on the plane z (reads from the south, where the camera is) */
function mallWord(B,word,cx,y,z,h,col){const w=h*0.62,gap=h*0.32;let x=cx-(word.length*(w+gap)-gap)/2;for(const ch of word){const S=MALL_FONT[ch];if(S)for(const q of S)strokeBox(B,x+q[0]*w,y+q[1]*h,x+q[2]*w,y+q[3]*h,z,h*0.11,col);x+=w+gap;}}
const mallWordW=(word,h)=>word.length*h*0.94-h*0.32;
/* a hanging sign: dark board, neon rim, one or two lines of lettering */
function mallSign(B,cx,y,z,lines,col,h,rim){const w=Math.max(...lines.map((l,i)=>mallWordW(l,i?h*0.6:h)))+0.5,H=lines.length>1?h*1.9+0.3:h+0.3;
 B.box(TRS(cx,y,z,0,w,H,0.08),[0.06,0.03,0.08]);const r=rim||col;for(const s of [-1,1]){B.box(TRS(cx,y+s*(H/2-0.03),z+0.05,0,w-0.06,0.035,0.03),r,true);B.box(TRS(cx+s*(w/2-0.03),y,z+0.05,0,0.035,H-0.06,0.03),r,true);}
 if(lines.length>1){mallWord(B,lines[0],cx,y+0.05,z+0.06,h,col);mallWord(B,lines[1],cx,y-h*0.75,z+0.06,h*0.6,[1,1,1]);}else mallWord(B,lines[0],cx,y-h/2,z+0.06,h,col);
 for(const s of [-1,1])B.box(TRS(cx+s*(w/2-0.4),y+H/2+0.5,z,0,0.02,1,0.02),[0.6,0.6,0.65]);}

/* ---------- drawing (called from drawDealer every frame) ---------- */
/* The mall is drawn in two passes so it doesn't rebuild ~150k vertices every frame: drawMall(staticB,g) once from buildStatic
   (venues.js venueStatic) with the moving bits sent to MALL_SINK, and drawMall(MALL_SINK,g,B) every frame, where only the moving
   bits (fountain jets and ripples, escalator steps, glinting gold) reach B through LB / bl(). */
const MALL_SINK=new Proxy({},{get:(t,k)=>k==='n'?0:()=>{},set:()=>true});
function drawMall(B,g,LB){LB=LB||MALL_SINK;const T=g.T||0,O=1,OZ=O+MALL_DZ,bx=(x,y,z,sx,sy,sz,c,em,ry)=>B.box(TRS(x+O,y,z+OZ,ry||0,sx,sy,sz),c,!!em),bl=(x,y,z,sx,sy,sz,c,em,ry)=>LB.box(TRS(x+O,y,z+OZ,ry||0,sx,sy,sz),c,!!em);
 const PINK=[1,0.3,0.75],CYAN=[0.2,0.9,1],GOLDC=[1,0.8,0.3],WH=[0.95,0.95,0.97],CH=[0.78,0.8,0.84],WOOD=[0.55,0.36,0.2],RED=[0.85,0.1,0.16],GREEN=[0.2,0.62,0.28],DK=[0.12,0.11,0.14];
 const palm=(x,z,tall)=>drawPalm(B,x+O,z+OZ,tall,x*1.7+z);
 const bench=(x,z,ry,cush)=>{const c=Math.cos(ry),s=Math.sin(ry),P=(dx,y,dz,sx,sy,sz,col)=>B.box(TRS(x+O+dx*c+dz*s,y,z+OZ-dx*s+dz*c,ry,sx,sy,sz),col);
  P(0,0.42,0,1.5,0.06,0.44,cush?RED:WOOD);P(0,0.66,-0.2,1.5,0.32,0.05,cush?RED:WOOD);for(const sx of [-0.65,0.65]){P(sx,0.21,0,0.05,0.42,0.4,CH);P(sx,0.5,-0.2,0.05,0.5,0.05,CH);}};
 const lamp=(x,z)=>{bx(x,0.05,z,0.3,0.1,0.3,CH);bx(x,1.3,z,0.07,2.5,0.07,WH);for(const s of [-1,1]){bx(x+s*0.3,2.55,z,0.6,0.04,0.04,WH);bx(x+s*0.6,2.62,z,0.22,0.22,0.22,[1.2,1.15,1.0],true);}};
 const shrub=(x,z,s)=>{bx(x,0.35*s,z,0.55*s,0.5*s,0.55*s,GREEN,false,x+z);bx(x,0.55*s,z,0.38*s,0.32*s,0.38*s,[0.3,0.74,0.34],false,x*2);};
 drawMallGlass(B,g);
 /* ===== the atrium ===== */
 /* the mall's name over the front doors, outside, a canopy over the doors, and the directory board just inside */
 mallSign(B,22.5+O,2.9,27.08+OZ,['BISCAYNE GALLERIA'],PINK,0.5,CYAN);
 for(const dz of [0,1.24])bx(22.5,2.35,27.0+dz,6.4,0.1,0.08,[0.95,0.95,0.97]);for(const sx of [-3.2,3.2])bx(22.5+sx,2.35,27.62,0.08,0.1,1.3,[0.95,0.95,0.97]);bx(22.5,2.28,28.22,6.4,0.06,0.05,PINK,true);for(const sx of [-3,3])bx(22.5+sx,1.17,28.15,0.1,2.34,0.1,CH);
 for(const sx of [-4.6,4.6]){palm(22.5+sx,27.7,false);}
 bx(16.6,0.8,25.6,0.12,1.6,0.12,CH);bx(16.6,1.35,25.65,1.1,1.2,0.06,DK);bx(16.6,1.83,25.7,0.96,0.12,0.02,PINK,true);
 [GOLDC,PINK,[0.5,1,0.6],CYAN].forEach((c,i)=>bx(16.6,1.6-i*0.2,25.7,0.8-i*0.06,0.08,0.02,c,true));
 /* fountain planters with palms and red bench cushions facing out */
 for(const [x,z] of MALL_PLANTERS){bx(x,0.3,z,1.3,0.6,1.3,[0.9,0.88,0.84]);bx(x,0.61,z,1.2,0.02,1.2,[0.32,0.22,0.12]);palm(x,z,true);shrub(x+0.38,z+0.38,0.7);shrub(x-0.4,z-0.36,0.6);
  bx(x,0.62,z+(z<12?-0.72:0.72),1.3,0.1,0.22,RED);}
 /* corner gardens: raised beds, palms, a bench on the open side */
 for(const [x,z] of MALL_GARDENS){bx(x,0.25,z,2.6,0.5,1.8,[0.86,0.84,0.8]);bx(x,0.51,z,2.5,0.02,1.7,[0.3,0.2,0.1]);palm(x-0.6,z,true);palm(x+0.7,z-0.2,false);shrub(x+0.3,z+0.45,0.8);shrub(x-1.0,z+0.5,0.6);
  bench(x,z+(z<12?1.45:-1.45),z<12?0:Math.PI,false);}
 /* ===== the food court: round tables with chairs, trays of food, two stalls, a sign over the way in ===== */
 drawMallTables(B,O,OZ);
 for(const st of MALL_STALLS)drawMallStall(B,st,O,OZ);
 mallSign(B,22.5+O,3.2,25.7+OZ,['FOOD COURT'],[1,0.8,0.3],0.36,PINK);
 /* escalators rising north to a closed upper level */
 for(const ex of MALL_ESC){const zs=24,zt=17,yt=3.0,L=zs-zt,an=Math.atan2(yt,L),hl=Math.hypot(L,yt);
  B.box(A.mul(A.mul(A.T(ex+O,yt/2-0.25,(zs+zt)/2+OZ),A.RX(an)),A.S(1.5,0.5,hl)),[0.86,0.86,0.9]);
  for(const s of [-1,1]){B.box(A.mul(A.mul(A.T(ex+O+s*0.72,yt/2+0.35,(zs+zt)/2+OZ),A.RX(an)),A.S(0.08,0.9,hl)),[0.55,0.75,0.85]);
   B.box(A.mul(A.mul(A.T(ex+O+s*0.72,yt/2+0.84,(zs+zt)/2+OZ),A.RX(an)),A.S(0.12,0.07,hl+0.3)),DK);}
  const n=14,off=(T*0.35)%1;for(let i=0;i<n;i++){const u=(i+off)/n,y=u*yt,z=zs-u*L;bl(ex,y+0.02,z,1.3,0.04,0.36,[0.25,0.25,0.28]);bl(ex,y+0.045,z+0.16,1.3,0.012,0.03,[1,0.85,0.2],true);}
  bx(ex,0.02,zs+0.4,1.5,0.04,0.8,[0.5,0.5,0.55]);
  /* the landing up top: a balcony stub on two columns with glass rails, and level 2 opening up behind it (upstairs.js) */
  bx(ex,yt-0.1,zt-0.7,2.2,0.2,1.4,[0.9,0.9,0.92]);for(const s of [-1,1]){bx(ex+s*0.95,(yt-0.2)/2,zt-0.7,0.2,yt-0.2,0.2,WH);bx(ex+s*1.05,yt+0.5,zt-0.7,0.04,0.8,1.4,[0.6,0.85,0.95],true);bx(ex+s*1.05,yt+0.92,zt-0.7,0.08,0.06,1.4,CH);}
  bx(ex,yt+0.02,zt-1.45,2.4,0.24,0.1,DK);bx(ex,yt+0.15,zt-1.39,2.4,0.03,0.02,CYAN,true);
  mallSign(B,ex+O,yt+1.3,zt-1.3+OZ,['LEVEL 2',ex<22?'ELECTRONICS · ARCADE':'ARCADE · CLINIC'],CYAN,0.28,PINK);}
 /* lamps and shoppers' trash cans */
 for(const [x,z] of [[17,7.6],[28,7.6],[15.6,16.5],[29.4,16.5],[12.9,17.6],[32.1,17.6]])lamp(x,z);
 for(const [x,z] of [[21,15.6],[24,15.6]]){bx(x,0.35,z,0.4,0.7,0.4,[0.85,0.85,0.88]);bx(x,0.72,z,0.44,0.05,0.44,GOLDC);}
 /* ===== GOLD COAST JEWELERS (west, north) ===== */
 mallSign(B,15.0+O,2.7,7.3+OZ,['GOLD COAST','JEWELERS'],GOLDC,0.36,PINK);
 {/* the long counter: dark base, glass top, gold pieces glinting inside */
  const cz=10.95;bx(4.5,0.45,cz,6.2,0.9,0.7,[0.12,0.06,0.14]);bx(4.5,0.92,cz,6.2,0.04,0.72,[0.75,0.9,1.0]);bx(4.5,0.58,cz+0.36,6.0,0.03,0.01,GOLDC,true);
  for(let i=0;i<10;i++){const x=1.8+i*0.6,c=i%3===0?[0.9,0.95,1.1]:GOLDC;bl(x,0.82,cz+((i*7)%3-1)*0.15,0.16,0.04,0.16,c,true,T*0.6+i);}
  /* wall cabinets with velvet busts wearing chains, a mirror and the diamond sign */
  bx(5.5,1.1,6.35,8.6,2.2,0.5,[0.16,0.06,0.16]);for(let i=0;i<5;i++){const x=1.8+i*1.8;bx(x,1.25,6.62,1.3,1.2,0.04,[0.55,0.75,0.95]);bx(x,1.05,6.5,0.3,0.42,0.22,[0.18,0.05,0.2]);bx(x,1.32,6.5,0.18,0.14,0.18,[0.18,0.05,0.2]);
   bx(x,1.1,6.63,0.26,0.03,0.02,GOLDC,true);bx(x,1.0,6.63,0.07,0.07,0.02,[1,1,1],true);}
  {const y=2.45,dx=5.5,dz=6.62+0.02,s=0.36,col=[0.6,0.9,1.3];strokeBox(B,dx+O-s,y,dx+O,y-s*1.2,dz+OZ,0.05,col);strokeBox(B,dx+O,y-s*1.2,dx+O+s,y,dz+OZ,0.05,col);strokeBox(B,dx+O-s,y,dx+O+s,y,dz+OZ,0.05,col);strokeBox(B,dx+O-s*0.5,y+0.22,dx+O+s*0.5,y+0.22,dz+OZ,0.05,col);strokeBox(B,dx+O-s,y,dx+O-s*0.5,y+0.22,dz+OZ,0.05,col);strokeBox(B,dx+O+s,y,dx+O+s*0.5,y+0.22,dz+OZ,0.05,col);}
  /* the round island case with a turning diamond, the safe, two velvet stools, mirrors */
  bx(8.5,0.45,13.5,1.1,0.9,1.1,[0.12,0.06,0.14]);bx(8.5,1.05,13.5,1.0,0.3,1.0,[0.7,0.88,1.0]);LB.box(A.mul(A.mul(A.T(8.5+O,1.1,13.5+OZ),A.RY(T)),A.mul(A.RX(0.785),A.S(0.16,0.16,0.16))),[1.2,1.2,1.4],true);
  bx(1.5,0.5,6.6,0.9,1.0,1.0,[0.3,0.32,0.35]);bx(1.5,0.55,7.12,0.25,0.25,0.03,CH);
  for(const x of [3.2,5.8]){bx(x,0.32,cz+0.75,0.36,0.04,0.36,[0.5,0.05,0.2]);bx(x,0.16,cz+0.75,0.05,0.32,0.05,GOLDC);}
  bx(1.06,1.2,13.5,0.04,1.6,1.0,[0.7,0.85,0.95]);bx(1.04,1.2,13.5,0.02,1.7,1.1,GOLDC);}
 /* ===== SUNSHINE REALTY (west, south) ===== */
 mallSign(B,14.4+O,2.75,18.3+OZ,['SUNSHINE','REALTY'],PINK,0.3,GOLDC);
 {bx(5.5,0.72,20.4,3.0,0.06,0.9,[0.95,0.92,0.86]);bx(5.5,0.36,20.82,2.9,0.66,0.04,[0.95,0.92,0.86]);for(const s of [-1,1])bx(5.5+s*1.45,0.36,20.4,0.06,0.7,0.88,[0.95,0.92,0.86]);
  bx(5.0,0.84,20.4,0.36,0.14,0.28,[0.85,0.82,0.76]);bx(5.0,0.98,20.3,0.32,0.22,0.04,[0.2,0.7,0.4],true);bx(6.3,0.79,20.5,0.3,0.06,0.18,[0.9,0.1,0.2]);
  /* chairs for the buyers, the listing boards on the north wall, a SOLD banner */
  for(const x of [4.6,6.4]){bx(x,0.25,21.5,0.5,0.06,0.5,[1,0.45,0.7]);bx(x,0.5,21.73,0.5,0.45,0.06,[1,0.45,0.7]);bx(x,0.12,21.5,0.05,0.24,0.05,CH);}
  const lst=[[2.3,[1,0.55,0.2],[0.2,0.6,0.3]],[4.3,[0.95,0.75,0.85],[0.4,0.85,0.9]],[6.3,[0.15,0.15,0.2],[1,0.8,0.3]],[8.3,[0.9,0.9,0.95],[0.3,0.5,0.9]]];
  for(const [x,c1,c2] of lst){bx(x,1.5,17.12,1.5,1.1,0.04,[0.98,0.97,0.94]);bx(x,1.55,17.15,1.3,0.7,0.02,c2);bx(x,1.38,17.17,0.6,0.42,0.02,c1);bx(x,1.62,17.18,0.66,0.08,0.02,c1.map(v=>v*0.7));bx(x,1.04,17.15,1.2,0.1,0.02,PINK,true);}
  bx(6.3,2.25,17.16,1.4,0.24,0.03,[1,0.1,0.2]);mallWord(B,'SOLD',6.3+O,2.16,17.2+OZ,0.18,[1,1,1]);
  bx(1.4,0.5,17.4,0.6,1.0,0.6,[0.62,0.62,0.66]);for(let i=0;i<3;i++)bx(1.4,0.25+i*0.32,17.71,0.4,0.02,0.02,CH);
  /* the tower model under a glass cover on a plinth */
  bx(9.4,0.4,23.6,1.2,0.8,1.2,WH);bx(9.4,0.82,23.6,1.1,0.04,1.1,[0.4,0.75,0.45]);bx(9.4,1.2,23.6,0.3,0.8,0.3,[0.6,0.85,1.0]);bx(9.1,1.0,23.4,0.22,0.4,0.22,[1,0.8,0.85]);bx(9.7,0.95,23.8,0.24,0.3,0.24,[0.95,0.95,0.85]);bx(9.4,1.66,23.6,0.18,0.12,0.18,GOLDC,true);
  palm(1.6,24.6,false);palm(10.2,18.0,false);}
 /* ===== CASA BONITA (east) ===== */
 mallSign(B,30.9+O,2.7,7.3+OZ,['CASA BONITA','FURNITURE'],[0.5,1,0.6],0.32,PINK);
 {bx(41.5,0.48,9.95,4.0,0.96,0.7,[0.95,0.92,0.86]);bx(41.5,0.98,9.95,4.06,0.05,0.76,[0.55,0.36,0.2]);bx(40.4,1.06,9.95,0.32,0.12,0.24,[0.85,0.82,0.76]);
  /* living set: white leather sectional, glass coffee table, neon flamingo on the wall, a palm */
  const sofa=[0.98,0.76,0.64];bx(37.5,0.22,13.6,3.0,0.44,0.9,sofa);bx(37.5,0.55,13.12,3.0,0.5,0.22,sofa);bx(36.1,0.4,14.05,0.25,0.36,1.0,sofa);bx(38.9,0.4,14.05,0.25,0.36,1.0,sofa);
  bx(37.5,0.32,14.9,1.4,0.04,0.7,[0.7,0.9,0.95]);for(const [dx,dz] of [[-0.6,-0.3],[0.6,-0.3],[-0.6,0.3],[0.6,0.3]])bx(37.5+dx,0.15,14.9+dz,0.04,0.3,0.04,CH);bx(37.5,0.4,14.9,0.2,0.12,0.2,[1,0.4,0.7]);
  bx(37.5,0.02,14.4,3.6,0.02,2.4,[1,0.55,0.75]);
  mallWord(B,'DESIGN',36.9+O,1.95,6.08+OZ,0.3,PINK);mallWord(B,'INTERIORS',41.5+O,1.95,6.08+OZ,0.28,CYAN);
  palm(35.6,11.6,false);
  /* bedroom set: a big bed with pink sheets, nightstands with lamps */
  bx(41.7,0.25,13.5,2.0,0.3,2.2,[0.95,0.95,0.97]);bx(41.7,0.45,13.7,1.9,0.14,1.8,[1,0.55,0.75]);for(const s of [-0.5,0.5])bx(41.7+s,0.55,12.75,0.7,0.12,0.36,WH);bx(41.7,0.7,12.38,2.0,0.9,0.1,[0.3,0.25,0.35]);
  for(const s of [-1.35,1.35]){bx(41.7+s,0.25,12.6,0.5,0.5,0.45,[0.3,0.25,0.35]);bx(41.7+s,0.62,12.6,0.08,0.24,0.08,CH);bx(41.7+s,0.82,12.6,0.3,0.2,0.3,[1.15,1.0,0.8],true);}
  /* price tags on stands */
  for(const [x,z] of [[39.4,15.4],[43.2,15.4]]){bx(x,0.4,z,0.03,0.8,0.03,CH);bx(x,0.85,z,0.4,0.24,0.02,[1,1,0.9]);bx(x,0.86,z+0.015,0.3,0.06,0.01,PINK,true);}
  palm(43.2,10.9,true);}
 /* ===== FONTAINE TAILORING (east, south): Felix behind the cutting table, a glass-block wall with the neon TAILOR sign, mannequins, a rail of suits ===== */
 mallSign(B,30.6+O,2.75,18.3+OZ,['FONTAINE','TAILORING'],[1,0.62,0.8],0.3,CYAN);
 {const MINT=[0.55,0.92,0.84],PEACH=[0.98,0.77,0.67],WOOD2=[0.62,0.44,0.28];
  /* the glass-block wall across the back, pale pink and lit from behind, the neon word over Felix */
  for(let i=0;i<16;i++)for(let j=0;j<5;j++){const x=35.7+i*0.5,y=0.3+j*0.48,c=(i+j)%3===0?[1.05,0.85,0.95]:[0.92,0.8,0.9];bx(x,y,17.12,0.46,0.44,0.16,c,(i*j)%5===1);}
  bx(39.5,1.95,17.24,3.2,0.62,0.04,[0.08,0.04,0.1]);mallWord(B,'TAILOR',39.5+O,1.76,17.3+OZ,0.36,[1,0.35,0.65]);bx(39.5,2.3,17.27,3.0,0.03,0.03,CYAN,true);
  /* a mint rug, the cutting table: wood, a green cutting mat, fabric bolts, the sewing machine and the cotton spools */
  bx(39.2,0.012,22.4,6.4,0.012,3.6,[0.3,0.62,0.56]);bx(39.2,0.016,22.4,6.0,0.012,3.2,[0.42,0.74,0.68]);
  bx(39.5,0.44,19.7,3.6,0.88,0.9,WOOD2);bx(39.5,0.89,19.7,3.4,0.02,0.8,[0.25,0.55,0.4]);for(let i=0;i<5;i++)bx(38.0+i*0.24,0.9,19.6,0.01,0.004,0.7,[0.8,0.95,0.85]);
  bx(38.4,0.96,19.75,0.7,0.12,0.4,PEACH);bx(38.4,1.04,19.75,0.66,0.06,0.36,[0.63,0.91,0.81]);
  {const sx=40.7;bx(sx,0.98,19.7,0.6,0.16,0.3,[0.9,0.88,0.8]);bx(sx+0.22,1.18,19.7,0.14,0.28,0.26,[0.9,0.88,0.8]);bx(sx-0.05,1.34,19.7,0.6,0.12,0.22,[0.9,0.88,0.8]);bx(sx-0.3,1.12,19.7,0.06,0.2,0.06,CH);bx(sx+0.28,1.34,19.86,0.12,0.12,0.04,[0.3,0.3,0.32]);}
  [[1,0.4,0.6],[0.4,0.85,1],[1,0.85,0.3],[0.6,1,0.7],[1,1,1]].forEach((c,i)=>{bx(41.4+i*0.16,1.0,19.45,0.1,0.18,0.1,c);});
  bx(37.7,0.92,19.85,0.3,0.02,0.06,CH);bx(37.62,0.92,19.95,0.06,0.02,0.18,CH);
  /* a yellow tape measure left over the table edge */
  bx(39.1,0.75,20.16,0.05,0.3,0.01,[1,0.85,0.2]);
  /* mannequins in the new suits: stand, legs, jacket with lapels, a head */
  for(const [x,z,c] of MALL_MANNEQ){bx(x,0.04,z,0.4,0.06,0.4,CH);bx(x,0.5,z,0.05,0.9,0.05,CH);bx(x,1.02,z,0.42,0.28,0.24,c.map(v=>v*0.92));
   bx(x,1.4,z,0.5,0.5,0.28,c);bx(x-0.1,1.5,z+0.145,0.08,0.3,0.01,c.map(v=>v*0.8));bx(x+0.1,1.5,z+0.145,0.08,0.3,0.01,c.map(v=>v*0.8));bx(x,1.56,z+0.142,0.1,0.18,0.01,[1,0.95,0.9]);
   bx(x,1.7,z,0.12,0.1,0.12,[0.92,0.86,0.8]);bx(x,1.86,z,0.2,0.22,0.2,[0.92,0.86,0.8]);}
  /* the clothes rail down the east wall: chrome, a rainbow of jackets on hangers */
  bx(43.4,1.6,22.6,0.05,0.05,4.2,CH);for(const zz of [20.5,24.7])bx(43.4,0.8,zz,0.05,1.6,0.05,CH);
  const RAIL=[[0.98,0.77,0.67],[1,0.55,0.75],[0.63,0.91,0.81],[0.55,0.75,1],[0.96,0.96,0.93],[0.78,0.66,0.93],[1,0.85,0.45],[0.2,0.2,0.3],[0.95,0.6,0.5],[0.5,0.9,0.95]];
  RAIL.forEach((c,i)=>bx(43.35,1.12,20.8+i*0.38,0.36,0.9,0.12,c));
  /* the SHADES tower: a mirrored column on a chrome base, five shelves of sunglasses facing the shop floor, a small pink neon word on top */
  {const tx=41.4,tz=22.4,LN={amber:[0.55,0.32,0.08],black:[0.06,0.06,0.08],blue:[0.25,0.6,1],pink:[1,0.4,0.65],smoke:[0.25,0.25,0.3]},FR={gold:[1,0.8,0.3],black:[0.08,0.08,0.1],white:[0.97,0.97,0.97]},SK=Object.keys(SHADES);
   bx(tx,0.05,tz,0.66,0.1,0.66,CH);bx(tx,1.0,tz,0.5,1.8,0.5,[0.14,0.11,0.18]);bx(tx,1.0,tz+0.252,0.42,1.7,0.01,[0.2,0.16,0.26]);for(const e of [-0.22,0.22])bx(tx+e,1.0,tz+0.256,0.015,1.7,0.015,[1,0.35,0.65],true);
   for(let r=0;r<5;r++){const y=0.45+r*0.32;for(const sd of [-1,1]){const fz=sd>0?tz+0.27:tz,fx=sd>0?tx:tx+0.27;
     bx(sd>0?tx:tx+0.3,y-0.06,sd>0?tz+0.3:tz,sd>0?0.5:0.1,0.015,sd>0?0.1:0.5,CH);
     for(let k=0;k<2;k++){const S=SHADES[SK[(r*2+k+(sd>0?0:1))%SK.length]],o=-0.12+k*0.24,ln=LN[S.lens],fr=FR[S.frame];
      if(sd>0){bx(tx+o-0.05,y,fz+0.04,0.085,0.06,0.012,ln,S.lens==='blue'||S.lens==='pink');bx(tx+o+0.05,y,fz+0.04,0.085,0.06,0.012,ln,S.lens==='blue'||S.lens==='pink');bx(tx+o,y+0.038,fz+0.044,0.2,0.016,0.012,fr,S.frame!=='black');}
      else{bx(fx+0.04,y,tz+o-0.045,0.01,0.045,0.07,ln);bx(fx+0.04,y,tz+o+0.045,0.01,0.045,0.07,ln);bx(fx+0.042,y+0.03,tz+o,0.01,0.012,0.19,fr);}}}}
   bx(tx,2.02,tz,0.6,0.24,0.6,[0.08,0.04,0.1]);mallWord(B,'SHADES',tx+O,1.94,tz+0.31+OZ,0.11,[1,0.35,0.65]);}
  /* the three-way mirror in the corner and a stool for fittings */
  bx(43.5,1.0,18.3,0.06,1.9,0.8,[0.75,0.85,0.95],true);bx(43.2,1.0,17.75,0.4,1.9,0.06,[0.7,0.8,0.9]);bx(42.4,0.25,18.6,0.4,0.5,0.4,[1,0.55,0.75]);
  palm(35.0,25.3,false);palm(43.3,25.3,true);}
 /* Nugget, Schmaltzy's Boston terrier: sits on the jewelry counter next to him in a gold chain (animals.js, drawn every frame so he moves) */
 {const J=g.mall.keepers.find(n=>n.shop==='jewel');if(J&&LB!==MALL_SINK&&typeof drawNugget==='function')drawNugget(J.x+0.95,0.94,10.95+OZ,T);}
 /* ===== VICTORY MOTORS (at the back): drawDealer draws the turntables, pennants and the sign; add the showroom desk and palms ===== */
 for(const [x,z,t] of [[2.6,4.2,1],[43.4,4.2,1],[2.6,12.2,0],[43.4,12.2,0]])drawPalm(B,x,z,!!t,x+z);}

/* glass shopfronts: chrome posts at every cell edge, a header rail, a kick plate and pale streaks for the panes (see-through from above) */
/* the food court's tables, chairs and trays (old layout coords); upstairs draws them again far below through the atrium opening */
function drawMallTables(B,O,OZ){const bx=(x,y,z,sx,sy,sz,c,em,ry)=>B.box(TRS(x+O,y,z+OZ,ry||0,sx,sy,sz),c,!!em),CH=[0.78,0.8,0.84],PINK=[1,0.3,0.75],CYAN=[0.2,0.9,1];
 for(const [x,z] of MALL_TABLES){bx(x,0.04,z,0.5,0.08,0.5,CH);bx(x,0.38,z,0.08,0.7,0.08,CH);for(let k=0;k<8;k++)bx(x,0.74,z,1.0,0.04,0.42,[0.97,0.97,0.98],false,k*Math.PI/8);
  bx(x,0.765,z,0.9,0.012,0.9*0.4,[1,0.45,0.7],false,0.3);
  MALL_CHAIRS.forEach(([dx,dz],k)=>{const cx=x+dx,cz=z+dz,ry=Math.atan2(dx,dz);const c=Math.cos(ry),sn=Math.sin(ry),P=(ox,y,oz,sx,sy,sz,col)=>B.box(TRS(cx+O+ox*c+oz*sn,y,cz+OZ-ox*sn+oz*c,ry,sx,sy,sz),col);
   P(0,0.44,0,0.44,0.05,0.42,k%2?CYAN.map(v=>v*0.8):PINK.map(v=>v*0.85));P(0,0.72,0.2,0.44,0.5,0.04,k%2?CYAN.map(v=>v*0.8):PINK.map(v=>v*0.85));for(const [lx,lz] of [[-0.18,-0.17],[0.18,-0.17],[-0.18,0.17],[0.18,0.17]])P(lx,0.21,lz,0.03,0.42,0.03,CH);});
  /* trays: a red tray, a paper cup with a straw, a pizza slice or a taco basket */
  for(let k=0;k<2;k++){const tx=x+(k?0.2:-0.22),tz=z+(k?-0.18:0.16),r=(x*3+z+k)%3;bx(tx,0.775,tz,0.34,0.02,0.26,[0.85,0.12,0.15],false,k);bx(tx+0.09,0.85,tz-0.05,0.07,0.14,0.07,k?[1,0.85,0.2]:[1,1,1]);bx(tx+0.09,0.95,tz-0.05,0.01,0.1,0.01,PINK);
   if(r===0)bx(tx-0.06,0.79,tz+0.03,0.16,0.012,0.12,[1,0.75,0.3],false,0.6);else if(r===1){bx(tx-0.06,0.8,tz+0.03,0.14,0.04,0.1,[0.95,0.85,0.5]);bx(tx-0.06,0.83,tz+0.03,0.1,0.02,0.06,[0.35,0.7,0.25]);}else bx(tx-0.06,0.8,tz+0.03,0.12,0.04,0.12,[0.7,0.35,0.15]);}}
}
/* a food stall: counter facing the court (side 1 = faces east), a back wall with shelves, a striped awning, the name board facing the camera */
function drawMallStall(B,st,O,OZ){const {x,z,side}=st,bx=(px,y,pz,sx,sy,sz,c,em)=>B.box(TRS(px+O,y,pz+OZ,0,sx,sy,sz),c,!!em),CH=[0.78,0.8,0.84],WH=[0.97,0.96,0.94];
 bx(x,0.5,z,0.9,1.0,2.6,WH);bx(x+side*0.02,1.02,z,1.0,0.05,2.7,CH);bx(x+side*0.46,0.55,z,0.02,0.6,2.5,st.col.map(v=>v*0.8));
 bx(x-side*0.9,1.15,z,0.3,2.3,2.6,[0.92,0.9,0.86]);for(let i=0;i<3;i++)bx(x-side*0.72,0.9+i*0.45,z,0.1,0.03,2.3,CH);
 for(let i=0;i<6;i++)bx(x-side*0.7,0.98+(i%3)*0.45,z-0.9+(i>>1)*0.55+((i*7)%3)*0.1,0.14,0.16,0.14,[[1,0.3,0.3],[1,0.85,0.2],[0.3,0.8,1],[1,1,1],[0.4,0.85,0.4],[1,0.5,0.75]][i]);
 bx(x+side*0.25,1.25,z+0.7,0.3,0.4,0.3,[0.75,0.75,0.78]);bx(x+side*0.25,1.25,z+0.7,0.22,0.3,0.31,[0.2,0.2,0.22]);
 for(let i=0;i<8;i++)B.box(A.mul(A.mul(A.T(x+O-side*0.1,2.15,z+OZ-1.3+i*0.33+0.165),A.RZ(side*0.35)),A.S(1.5,0.04,0.33)),st.awn[i%2]);
 for(const dz of [-1.25,1.25])bx(x+side*0.4,1.6,z+dz,0.05,1.2,0.05,CH);
 mallSign(B,x+O-side*0.2,2.7,z+1.32+OZ,st.name,st.col,0.24,st.rim);}
/* the people of the food court: diners on the chairs, a cook in each stall */
function mallCourt(g){const O=1,OZ=O+MALL_DZ;if(typeof NPC_CHAT==='object'&&!NPC_CHAT.diner){NPC_CHAT.diner=["Best pizza in Dade County. Don't tell my mother.","We come here for the air conditioning.","Sit anywhere, honey. Not there.","You gonna eat those fries?","They say a whole second floor's opening next year."];
  NPC_CHAT.cook=["Slice? Two bucks. For you, three.","Fresh this morning. Which morning, I won't say.","Extra cheese is free if you look rich. You look rich.","Hot sauce? It's very hot. Sign here."];}
 for(const [ti,ci] of MALL_DINERS){const [tx,tz]=MALL_TABLES[ti],[dx,dz]=MALL_CHAIRS[ci],x=tx+dx+O,z=tz+dz+OZ,n=makeChar(x,z,NPCLOOK.guest(),false);
  Object.assign(n,{kind:'diner',state:'idle',y:SEAT_Y,seatK:1,seat:true,a:Math.atan2(-dx,-dz),a0:Math.atan2(-dx,-dz),r:0.3,said:false});n.body=n.look.body;g.npcs.push(n);}
 for(const st of MALL_STALLS){const n=makeChar(st.x-st.side*0.45+O,st.z+OZ,Object.assign(NPCLOOK.guest(),{jacket:[0.97,0.97,0.97],shirt:st.rim,hs:'buzz'}),false);
  Object.assign(n,{kind:'cook',state:'idle',a:st.side*Math.PI/2,a0:st.side*Math.PI/2,r:0.3,said:false});n.body=n.look.body;g.npcs.push(n);}}
function drawMallGlass(B,g){const H=2.6,CHR=[0.82,0.84,0.88],GL=[0.62,0.85,0.95],has=(x,z)=>g.rows[z]&&g.rows[z][x]==='H';
 for(const [x,z] of g.mall.glass){const ew=has(x-1,z)||has(x+1,z),cx=x+0.5,cz=z+0.5;
  if(ew){B.box(TRS(cx,H,cz,0,1.0,0.1,0.14),CHR);B.box(TRS(x,H/2+0.15,cz,0,0.07,H-0.3,0.07),CHR);if(!has(x+1,z))B.box(TRS(x+1,H/2+0.15,cz,0,0.07,H-0.3,0.07),CHR);
   B.box(TRS(cx,0.33,cz,0,0.98,0.02,0.04),GL,true);B.box(TRS(cx,H-0.06,cz,0,0.98,0.02,0.04),GL,true);B.box(A.mul(A.mul(A.T(cx-0.12,1.4,cz),A.RZ(0.9)),A.S(0.5,0.015,0.015)),GL.map(v=>v*0.7),true);}
  else{B.box(TRS(cx,H,cz,0,0.14,0.1,1.0),CHR);B.box(TRS(cx,H/2+0.15,z,0,0.07,H-0.3,0.07),CHR);if(!has(x,z+1))B.box(TRS(cx,H/2+0.15,z+1,0,0.07,H-0.3,0.07),CHR);
   B.box(TRS(cx,0.33,cz,0,0.04,0.02,0.98),GL,true);B.box(TRS(cx,H-0.06,cz,0,0.04,0.02,0.98),GL,true);}}}
/* ---------- the shop screens ---------- */
const MALL_PHOTO={jewel:'schmaltzy',tailor:'felix',furn:'lola'},mallImg={};
/* the keepers with a photo get the same neon-posterised portrait as Vic (cars.js paintVicFace); the others a drawn placeholder */
function paintKeeperPhoto(cv,key){const go=()=>{if(storeMode!==Object.keys(MALL_PHOTO).find(k=>MALL_PHOTO[k]===key))return;const x=cv.getContext('2d',{willReadFrequently:true}),W=cv.width,H=cv.height;x.imageSmoothingEnabled=true;x.fillStyle='#2a0838';x.fillRect(0,0,W,H);x.drawImage(mallImg[key],30,0,320,355,0,0,W,H);
  const d=x.getImageData(0,0,W,H),P=d.data;for(let i=0;i<P.length;i+=4){const l=(P[i]*0.3+P[i+1]*0.55+P[i+2]*0.15)/255,q=v=>Math.round(v/255*5)/5*255;P[i]=Math.min(255,q(P[i])*1.04+(l<0.35?28:0));P[i+1]=q(P[i+1])*0.96;P[i+2]=Math.min(255,q(P[i+2])+(l<0.35?42:0));}
  x.putImageData(d,0,0);x.fillStyle='rgba(255,95,184,.10)';for(let y=0;y<H;y+=2)x.fillRect(0,y,W,1);cv.dataset.done='1';};
 const im=mallImg[key]||(mallImg[key]=Object.assign(new Image(),{src:ART[key]}));if(im.complete&&im.naturalWidth)go();else im.addEventListener('load',go,{once:true});}
function paintKeeperFace(cv,shop){if(!cv)return;delete cv.dataset.done;if(MALL_PHOTO[shop]&&typeof ART!=='undefined'&&ART[MALL_PHOTO[shop]])return paintKeeperPhoto(cv,MALL_PHOTO[shop]);const x=cv.getContext('2d'),W=cv.width,H=cv.height,s=MALL_SHOPS[shop],L=mallLook(s.npc),C=a=>'rgb('+a.map(v=>Math.round(v*255)).join(',')+')';
 x.fillStyle='#2a0838';x.fillRect(0,0,W,H);x.fillStyle=s.col;x.globalAlpha=0.25;x.fillRect(0,H-20,W,20);x.globalAlpha=1;
 x.fillStyle=C(L.jacket);x.beginPath();x.moveTo(6,H);x.lineTo(10,H-14);x.lineTo(W-10,H-14);x.lineTo(W-6,H);x.fill();
 x.fillStyle=C(L.hair);x.beginPath();x.ellipse(W/2,24,L.fem?17:14,L.fem?19:15,0,0,7);x.fill();if(L.fem)x.fillRect(W/2-17,24,34,20);
 x.fillStyle=C(L.skin);x.beginPath();x.ellipse(W/2,28,11,14,0,0,7);x.fill();x.fillRect(W/2-4,38,8,8);
 x.fillStyle='#15101a';x.fillRect(W/2-6,25,3,2);x.fillRect(W/2+3,25,3,2);if(L.aviators){x.fillStyle='rgba(20,20,26,.9)';x.fillRect(W/2-9,23,8,5);x.fillRect(W/2+1,23,8,5);}
 if(L.stache){x.fillStyle=C(L.hair);x.fillRect(W/2-5,33,10,2);}x.fillStyle=L.fem?'#c0306a':'#7a3a2a';x.fillRect(W/2-3,36,6,1.5);
 if(L.chain||L.medallion){x.strokeStyle='#ffd36b';x.lineWidth=1.5;x.beginPath();x.moveTo(W/2-6,H-14);x.quadraticCurveTo(W/2,H-6,W/2+6,H-14);x.stroke();}
 x.fillStyle='rgba(255,95,184,.10)';for(let y=0;y<H;y+=2)x.fillRect(0,y,W,1);}
function mallSay(t){mallSayTxt=t;const el=$('stSay');if(el)el.textContent=t;}
function openMallShop(shop){if(state!=='play'||!G||!MALL_SHOPS[shop])return;const p=myProg();arm();if(!p.seen)p.seen={};const s=MALL_SHOPS[shop],first=!p.seen['mall_'+shop];p.seen['mall_'+shop]=1;saveProg();
 storeMode=shop;storeFocus=0;G.say=null;state='store';show('sStore');sfx('ring');mallSay(first?s.intro:pick(s.hi));paintKeeperFace($('stFace'),shop);renderStore('');}
function closeMallShop(){const shop=storeMode;state='play';show(null);storeMode='shop';const g=G,M=g&&(g.mall||g.up2);if(!M)return;const n=M.keepers.find(q=>q.shop===shop);if(n)popup(n.x,n.z,pick(MALL_SHOPS[shop].bye),'#ffe9a8');}
function mallCard(data,name,desc,act,on,dim,i){return `<button class="scard${on?' on':''}" ${data}${dim?' style="opacity:.55"':''}><div class="pn">${name}</div><div class="pd">${desc}</div><div class="sp">${act}${i<9?`<span class="kbhint"> (${i+1})</span>`:''}</div></button>`;}
function renderMallShop(msg){const p=myProg(),s=MALL_SHOPS[storeMode],sec=(id,on)=>{$(id).style.display=on?'':'none';$(id+'H').style.display=on?'':'none';};
 $('stWallet').textContent='$'+fmt(p.wallet);$('stOwed').textContent=p.debt>0?'OWED TO McWEY $'+fmt(p.debt):'DEBT CLEARED';
 document.querySelector('#sStore .shT').textContent=s.name;document.querySelector('#sStore .shS').textContent=s.who+' · '+MALL_NAME;
 $('stFace').style.display='block';const say=$('stSay');say.style.display='';say.dataset.who=s.short;say.textContent=mallSayTxt;let n=0;
 if(storeMode==='jewel'){sec('stCars',1);sec('stGold',0);sec('stHome',0);$('stCarsH').textContent='IN THE CASE · WHAT YOU WEAR SHOWS ON YOU';
  $('stCars').innerHTML=Object.keys(JEWEL).map(k=>{const j=JEWEL[k],own=!!p.jewel[k],on=jewelWorn(p,k);return mallCard(`data-jw="${k}"`,j.name,j.desc,on?'WEARING · TAKE OFF':own?'IN THE BOX · WEAR':'BUY $'+fmt(j.price),on,false,n++);}).join('');
  sec('stGold',1);$('stGoldH').textContent='EARRINGS · ONE PAIR IN AT A TIME';$('stGold').innerHTML=accCards(p,'jewel',n);n+=Object.keys(ACC).filter(k=>ACC[k].shop==='jewel').length;}
 else if(storeMode==='tailor'){sec('stCars',1);sec('stGold',0);sec('stHome',0);const cur=mySuit();$('stCarsH').textContent='MADE TO MEASURE · WHAT YOU WEAR SHOWS ON YOU';
  $('stCars').innerHTML=SUITKEYS.filter(k=>SUITS[k].shop).map(k=>{const S=SUITS[k],own=suitOK(p,k),on=cur===k;return mallCard(`data-ts="${k}"`,S.name,S.desc,on?'WEARING · BACK TO SIGNATURE':own?'IN THE WARDROBE · WEAR':'BUY $'+fmt(S.price),on,false,n++);}).join('');
  sec('stGold',1);$('stGoldH').textContent='SUNGLASSES · ONE PAIR ON AT A TIME';const so=(p.shades&&p.shades.own)||{},sw=shadesOn(p);
  $('stGold').innerHTML=Object.keys(SHADES).map(k=>{const it=SHADES[k];return mallCard(`data-sg="${k}"`,it.name,it.desc,sw===k?'WEARING · TAKE OFF':so[k]?'IN YOUR POCKET · WEAR':'BUY $'+fmt(it.price),sw===k,false,n++);}).join('');
  sec('stHome',1);$('stHomeH').textContent='DESIGNER ACCESSORIES · PARIS · ROMA · MILANO · LONDON · ONE OF EACH KIND ON';$('stHome').innerHTML=accCards(p,'tailor',n);n+=Object.keys(ACC).filter(k=>ACC[k].shop==='tailor').length;}
 else if(storeMode==='furn'){const ids=['stCars','stGold','stHome'];ids.forEach((id,t)=>{sec(id,1);const own=(p.homes||[0]).includes(t),here=(p.home||0)===t,f=furnAt(t);
   $(id+'H').textContent=HOMEDEF[t].name+(here?' · YOU LIVE HERE':own?' · YOURS':' · NOT YOURS YET');
   $(id).innerHTML=own?catOf(t).filter(it=>!MALL_NOFURN.includes(it.k)).map(it=>mallCard(`data-mf="${t}:${it.k}"`,it.name,it.desc,f[it.k]?'DELIVERED':'BUY $'+fmt(it.price),!!f[it.k],false,n++)).join('')
    :`<div class="pd">Buy it at Sunshine Realty first, then Lola's boys deliver.</div>`;});}
 else if(storeMode==='elec'||storeMode==='clinic'||storeMode==='arcade')up2Render(storeMode,p,sec);
 else{sec('stCars',1);sec('stGold',1);sec('stHome',0);const pr=mallProps(p);$('stCarsH').textContent='HOMES · YOU WAKE UP IN THE ONE YOU LIVE IN';
  $('stCars').innerHTML=HOMEDEF.map((h,i)=>{const own=(p.homes||[0]).includes(i),cur=(p.home||0)===i,lock=h.needs&&!p[h.needs];return mallCard(`data-ho="${i}"`,h.name,h.desc,cur?'LIVING HERE':own?'MOVE BACK IN':lock?(h.lockTxt||'AFTER THE SHARK IS DEAD'):'BUY $'+fmt(h.price),cur,lock,n++);}).join('');
  const rent=MALL_PROPS.reduce((a,q)=>a+(pr[q.k]?q.rent:0),0);$('stGoldH').textContent='INVESTMENT PROPERTY · RENT AFTER EVERY JOB'+(rent?' · $'+fmt(rent)+' A JOB · EARNED $'+fmt(p.rentTot||0):'');
  $('stGold').innerHTML=MALL_PROPS.map(q=>mallCard(`data-inv="${q.k}"`,q.name,q.desc+' Rent $'+fmt(q.rent)+' a job.',pr[q.k]?'YOURS · $'+fmt(q.rent)+' A JOB':'BUY $'+fmt(q.price),!!pr[q.k],false,n++)).join('');}
 $('stMsg').textContent=msg||'';const cs=document.querySelectorAll('#sStore .scard');if(storeFocus>=cs.length)storeFocus=0;cs.forEach((b,i)=>b.style.outline=padMode&&i===storeFocus?'3px solid #ffd36b':'');if(padMode&&cs[storeFocus]&&cs[storeFocus].scrollIntoView)cs[storeFocus].scrollIntoView({block:'nearest'});}
function furnAt(t){const p=myProg();p.furn=p.furn||{};hiMigrateFurn(p);return p.furn[t]||(p.furn[t]={});}
function mallPoor(){sfx('blip');mallSay(pick(MALL_SHOPS[storeMode].poor));return renderStore('Not enough cash. Come back richer.');}
function buyFurnAt(t,k){const p=myProg(),it=catOf(t).find(q=>q.k===k);if(!it||MALL_NOFURN.includes(k)||!(p.homes||[0]).includes(t))return;const f=furnAt(t);if(f[k])return renderStore('Already delivered.');
 if(p.wallet<it.price)return mallPoor();p.wallet-=it.price;f[k]=1;saveProg();sfx('cash');mallSay(pick(MALL_SHOPS.furn.sold));renderStore('DELIVERED TO '+HOMEDEF[t].name+': '+it.name+'.');}
/* Felix's sunglasses (the SHADES rack in Fontaine Tailoring): own any number, wear one pair at a time; p.shades={own:{k:1},on:k}.
   look: lens/frame colours and shape for the PS2 model (models.js sunB) and the classic model (index.html applyShadeLooks) */
const SHADES={
 avi:{name:'GOLD COAST AVIATORS',price:1200,desc:'Gold wire, amber teardrops. Every TV detective owns a pair.',lens:'amber',frame:'gold',shape:'avi'},
 way:{name:'NIGHT SHIFT CLASSICS',price:800,desc:'Thick black frames, black lenses. Wear them at night. Especially at night.',lens:'black',frame:'black',shape:'way'},
 wrap:{name:'KEY BISCAYNE WRAPS',price:1500,desc:'One mirrored blue visor that wraps round your head. Speedboat approved.',lens:'blue',frame:'black',shape:'wrap'},
 round:{name:'FLAMINGO ROUNDS',price:1000,desc:'Little round pink lenses on a gold bridge. Very art school.',lens:'pink',frame:'gold',shape:'round'},
 shield:{name:'STARLITE SHIELDS',price:2000,desc:'White flat-top frames, smoke lenses. Seen at every rooftop party on the beach.',lens:'smoke',frame:'white',shape:'way'}};
function shadesOn(p){const s=p&&p.shades;return s&&s.on&&SHADES[s.on]&&s.own&&s.own[s.on]?s.on:null;}
function buyShades(k){const p=myProg(),it=SHADES[k];if(!it)return;const s=p.shades=p.shades||{};s.own=s.own||{};const id=rideId();
 if(s.own[k]){s.on=s.on===k?null:k;saveProg();sfx('pick');applyJewelLooks();PS2C.rebuild(id);return renderStore(s.on?'You slide on the '+it.name+'.':'The '+it.name+' go in your top pocket.');}
 if(p.wallet<it.price)return mallPoor();p.wallet-=it.price;s.own[k]=1;s.on=k;saveProg();sfx('cash');mallSay(pick(MALL_SHOPS.tailor.shades));applyJewelLooks();PS2C.rebuild(id);renderStore('SOLD: '+it.name+'. '+it.desc);}
/* the tailor: buying a suit puts it on; clicking the one you wear goes back to your signature look, any other owned one swaps */
function buySuit(k){const p=myProg(),S=SUITS[k];if(!S||!S.shop)return;p.tailor=p.tailor||{};const id=rideId();
 if(p.tailor[k]){p.suit=mySuit()===k?'default':k;saveProg();sfx('pick');PS2C.applySuit(id);return renderStore(p.suit===k?'You change into the '+S.name+'.':'Back in your signature look.');}
 if(p.wallet<S.price)return mallPoor();p.wallet-=S.price;p.tailor[k]=1;p.suit=k;saveProg();sfx('cash');mallSay(pick(MALL_SHOPS.tailor.sold));PS2C.applySuit(id);renderStore('MADE TO MEASURE: '+S.name+'. '+S.desc+'.');}
function buyProp(k){const p=myProg(),q=MALL_PROPS.find(o=>o.k===k),pr=mallProps(p);if(!q)return;if(pr[k])return renderStore('Already yours. The rent comes in after every job.');
 if(p.wallet<q.price)return mallPoor();p.wallet-=q.price;pr[k]=1;saveProg();sfx('cash');mallSay(pick(MALL_SHOPS.realty.sold));renderStore('SOLD: '+q.name+'. $'+fmt(q.rent)+' rent after every job.');}
/* sunglasses bought earlier show from the first frame (index.html ran applyJewelLooks before this file loaded) */
if(typeof applyShadeLooks==='function')applyShadeLooks();
