'use strict';
/* ACCESSORIES you wear (2026-11-20): hats, gloves, belts and Havana cigars on Felix's accessory wall in Fontaine Tailoring,
   earrings in Schmaltzy's case at Gold Coast Jewelers. One piece per slot is worn at a time; everything you bought stays yours.
   Save: p.acc={own:{k:1},on:{slot:k}}.
   Looks: the high-detail model reads accOn() in models.js jewelB (B.hat/hatCol/hatBand, B.gloves, B.ear, B.belt, B.cigar);
   the classic model reads LOOKS flags set by applyAccLooks (accHat, accEar, accBelt, gloves, cigar), drawn by accClassicHead/accClassicTorso. */
/* DESIGNER LINE FOR MEN (Tristan 2026-11-20: "make it look like designer items", then "more for males"): every piece comes from a made-up luxury
   house (house; never a real brand) and wears its gold hardware: a logo plate on the hat band, a gold snap on the gloves, a band on the cigar, a gold
   buckle on the belt (buckle 'rings' = the D'Oro interlocking rings, 'plate' = a square plate). Earrings are a single stud in the left ear. */
const ACC_SLOTS={hat:'HATS',shirt:'SHIRTS',shoes:'SHOES',hands:'GLOVES',belt:'BELTS',mouth:'SMOKES',ear:'EARRINGS'};
const ACC_HOUSES={bellamy:'MAISON BELLAMY · PARIS',valente:'VALENTE · ROMA',doro:"D'ORO · MILANO",harcourt:'HARCOURT · LONDON',reina:'LA REINA · HABANA'};
const ACC={
 fedora:{slot:'hat',shop:'tailor',house:'bellamy',name:'WHITE FELT FEDORA',price:6500,desc:'Snow white rabbit felt, a black grosgrain band and the little gold Bellamy plate at the front. Says "I own the club" before you open your mouth.',hat:'fedora',col:[0.95,0.93,0.88],band:[0.08,0.08,0.1]},
 panama:{slot:'hat',shop:'tailor',house:'valente',name:'MONTECRISTI PANAMA',price:4800,desc:'Hand-woven toquilla straw, a wide brim, a black silk band with the gold Valente V. Shade for the face, not the conscience.',hat:'panama',col:[0.9,0.81,0.58],band:[0.08,0.07,0.09]},
 cap:{slot:'hat',shop:'tailor',house:'doro',name:'LOGO SPORT CAP',price:2200,desc:"Black lambskin six-panel, gold D'Oro rings on the front, gold button. Off duty, on the yacht, or on the run.",hat:'cap',col:[0.06,0.055,0.065],band:[0.95,0.76,0.3]},
 flat:{slot:'hat',shop:'tailor',house:'harcourt',name:'CASHMERE FLAT CAP',price:3200,desc:'Grey cashmere tweed from a Savile Row cutter, a gold crest on the side. The old men playing dominoes will stand up.',hat:'flat',col:[0.46,0.43,0.4],band:[0.32,0.29,0.27]},
 gloves:{slot:'hands',shop:'tailor',house:'doro',name:'NAPPA DRIVING GLOVES',price:2500,desc:'Black nappa leather, perforated knuckles, a gold logo snap at the wrist. Grip on the wheel, no prints on the glass.',col:[0.07,0.065,0.07]},
 tangloves:{slot:'hands',shop:'tailor',house:'valente',name:'CALFSKIN GLOVES',price:2800,desc:'Hand-stitched tan calfskin, a gold snap at the wrist. Italian, like the people who ask about them.',col:[0.62,0.42,0.24]},
 belt:{slot:'belt',shop:'tailor',house:'doro',name:'LOGO BELT',price:4500,desc:"Black calf leather and a big gold buckle of the D'Oro rings. Everybody looks at your belt first. That's the point.",col:[0.06,0.055,0.06],buckle:'rings'},
 gator:{slot:'belt',shop:'tailor',house:'harcourt',name:'ALLIGATOR BELT',price:6000,desc:'Dark brown Florida alligator, a heavy square gold buckle. The alligator had it coming.',col:[0.24,0.13,0.07],buckle:'plate'},
 /* shirts under the jacket (shirt: a colour 0..255, 'tropical', 'pais' or 'baroque' for the high-detail model; col for the classic one) and shoes
    (shoe: leather colour 0..255, bit: a gold horsebit across the vamp). Taking one off brings back your signature shirt or shoes. */
 silkblack:{slot:'shirt',shop:'tailor',house:'valente',name:'BLACK SILK SHIRT',price:1800,desc:'Heavy black silk, open to the third button. Goes with every suit and every crime.',shirt:[22,20,26],col:[0.09,0.08,0.1]},
 whiteshirt:{slot:'shirt',shop:'tailor',house:'harcourt',name:'WHITE POPLIN SHIRT',price:1200,desc:'Crisp white Sea Island cotton from Jermyn Street. The banker look.',shirt:[246,246,242],col:[0.96,0.96,0.95]},
 tealshirt:{slot:'shirt',shop:'tailor',house:'doro',name:'TEAL SILK SHIRT',price:1600,desc:'Electric teal silk that glows under the neon.',shirt:[30,190,190],col:[0.12,0.74,0.74]},
 coralshirt:{slot:'shirt',shop:'tailor',house:'bellamy',name:'CORAL SILK SHIRT',price:1600,desc:'Sunset coral, soft collar. Looks like money at the beach club.',shirt:[255,112,90],col:[1,0.44,0.35]},
 tropshirt:{slot:'shirt',shop:'tailor',house:'doro',name:'TROPICAL PRINT SHIRT',price:2200,desc:"Teal silk with pink palm leaves, the D'Oro resort print.",shirt:'tropical',col:[0.16,0.56,0.54]},
 paisshirt:{slot:'shirt',shop:'tailor',house:'valente',name:'PAISLEY SILK SHIRT',price:2400,desc:'Lilac and violet paisley, hand-printed in Como.',shirt:'pais',col:[0.6,0.45,0.8]},
 baroque:{slot:'shirt',shop:'tailor',house:'doro',name:'BAROQUE GOLD SHIRT',price:3800,desc:"Black silk printed with gold baroque scrolls. The loudest thing D'Oro makes.",shirt:'baroque',col:[0.3,0.24,0.1]},
 whiteloafer:{slot:'shoes',shop:'tailor',house:'valente',name:'WHITE HORSEBIT LOAFERS',price:2600,desc:'White calf loafers with a gold horsebit, no socks. Pure Ocean Drive.',shoe:[242,240,234],bit:1,col:[0.95,0.94,0.92]},
 blackloafer:{slot:'shoes',shop:'tailor',house:'doro',name:'BLACK PATENT LOAFERS',price:2400,desc:"Mirror-black patent leather, a gold D'Oro bit across the top.",shoe:[18,16,20],bit:1,col:[0.07,0.06,0.08]},
 cognac:{slot:'shoes',shop:'tailor',house:'harcourt',name:'COGNAC OXFORDS',price:2200,desc:'Hand-burnished cognac brogues, built in Northampton to outlast you.',shoe:[150,80,38],col:[0.59,0.31,0.15]},
 oxblood:{slot:'shoes',shop:'tailor',house:'bellamy',name:'OXBLOOD LOAFERS',price:2800,desc:'Deep oxblood calf with a gold bit. The colour hides what it should.',shoe:[96,22,30],bit:1,col:[0.38,0.09,0.12]},
 cigar:{slot:'mouth',shop:'tailor',house:'reina',name:'GRAN CORONA CIGARS',price:900,desc:'A cedar box of real Cubans, the kind you are not supposed to have, each with a gold paper band. One is always lit.'},
 stud:{slot:'ear',shop:'jewel',house:'bellamy',name:'DIAMOND STUD',price:7500,desc:'One carat in the left ear, set in Bellamy platinum. Catches the light every time you turn your head.',ear:'stud'},
 gstud:{slot:'ear',shop:'jewel',house:'doro',name:'GOLD STUD',price:3000,desc:"One 18k gold stud in the left ear, the D'Oro rings stamped on the face. Half the men on the docks wear one. None of them wear this one.",ear:'gold'}};
const accName=it=>ACC_HOUSES[it.house].split(' · ')[0]+' '+it.name;
function accData(p){const a=p.acc=p.acc||{};a.own=a.own||{};a.on=a.on||{};return a;}
/* what is being worn right now, by slot ({hat:'fedora',...}); only pieces you own and that still exist count */
function accOn(p){const o={},a=p&&p.acc;if(!a||!a.on)return o;for(const s in a.on){const k=a.on[s];if(k&&ACC[k]&&ACC[k].slot===s&&a.own&&a.own[k])o[s]=k;}return o;}
function accWorn(p,k){const it=ACC[k];return !!it&&accOn(p)[it.slot]===k;}
function buyAcc(k){const p=myProg(),it=ACC[k];if(!it)return;const a=accData(p),id=rideId(),wasOn=accWorn(p,k);
 if(a.own[k]){a.on[it.slot]=wasOn?null:k;saveProg();sfx('pick');applyJewelLooks();PS2C.rebuild(id);
  return renderStore(wasOn?'You take off the '+accName(it)+'.':'You put on the '+accName(it)+'.');}
 if(p.wallet<it.price)return mallPoor();
 p.wallet-=it.price;a.own[k]=1;a.on[it.slot]=k;saveProg();sfx('cash');
 const s=MALL_SHOPS[it.shop];mallSay(pick((it.shop==='tailor'&&s.acc)||s.sold));applyJewelLooks();PS2C.rebuild(id);renderStore('SOLD: '+accName(it)+'. '+it.desc);}
/* the shop cards for one shop's accessories, grouped by slot; n = running card number for the keyboard hints */
function accCards(p,shop,n){const ks=Object.keys(ACC).filter(k=>ACC[k].shop===shop),a=(p.acc&&p.acc.own)||{},on=accOn(p);
 return ks.map(k=>{const it=ACC[k],w=on[it.slot]===k,own=!!a[k],swap=!w&&!!on[it.slot];
  return mallCard(`data-ac="${k}"`,`<span style="display:block;font-size:.62em;color:#ffd36b;letter-spacing:.12em">${ACC_HOUSES[it.house]}</span>${it.name}`,it.desc,w?'WEARING · TAKE OFF':own?(swap?'YOURS · SWAP IT IN':'YOURS · WEAR'):'BUY $'+fmt(it.price),w,false,n+ks.indexOf(k));}).join('');}
/* classic model flags; the signature look (Don's cigar, any gloves) comes back when you take a piece off */
function applyAccLooks(){if(typeof LOOKS==='undefined')return;for(const c of CHARS){const L=LOOKS[c.id];if(!L)continue;if(!L._ac0)L._ac0={gloves:L.gloves,cigar:L.cigar,shirt:L.shirt,shirtTile:L.shirtTile,shoes:L.shoes};
 const on=accOn(PROG[c.id]),g=ACC[on.hands];Object.assign(L,L._ac0);L.accHat=on.hat?ACC[on.hat]:null;L.accEar=on.ear?ACC[on.ear].ear:null;L.accBelt=on.belt?ACC[on.belt]:null;
 if(g)L.gloves=g.col;if(on.mouth)L.cigar=true;if(on.shirt){L.shirt=ACC[on.shirt].col;L.shirtTile=null;}if(on.shoes)L.shoes=ACC[on.shoes].col;}}
/* classic model, head matrix H (index.html drawChar): the hat sits over the hair plate, earrings hang under the ear blocks */
function accClassicHead(B,H,hy,Lk){const h=Lk.accHat;
 if(h){const c=h.col,b=h.band;
  if(h.hat==='fedora'){PB(B,H,0,1.125+hy,-0.005,0.262,0.11,0.262,c);PB(B,H,0,1.074+hy,-0.005,0.42,0.016,0.42,c);PB(B,H,0,1.092+hy,-0.005,0.268,0.03,0.268,b);}
  else if(h.hat==='panama'){PB(B,H,0,1.115+hy,-0.005,0.262,0.09,0.262,c);PB(B,H,0,1.072+hy,-0.005,0.5,0.014,0.5,c);PB(B,H,0,1.088+hy,-0.005,0.268,0.028,0.268,b);}
  else if(h.hat==='cap'){PB(B,H,0,1.095+hy,-0.008,0.27,0.08,0.27,c);PB(B,H,0,1.064+hy,0.17,0.25,0.018,0.13,c);PB(B,H,0,1.14+hy,-0.008,0.04,0.014,0.04,b);PB(B,H,0,1.1+hy,0.137,0.08,0.04,0.006,b);}
  else if(h.hat==='flat'){PB(B,H,0,1.085+hy,0.005,0.272,0.065,0.285,c);PB(B,H,0,1.06+hy,0.15,0.25,0.022,0.09,b);}
  /* the house's gold logo plate at the front */
  const ly={fedora:1.092,panama:1.088,cap:1.1,flat:1.09}[h.hat],lz={fedora:0.13,panama:0.13,cap:0.14,flat:0.146}[h.hat];if(ly)PB(B,H,0,ly+hy,lz,h.hat==='cap'?0.07:0.04,h.hat==='cap'?0.035:0.026,0.008,GOLD,true);}
 if(Lk.accEar)PB(B,H,-0.128,0.89+hy,0.005,0.022,0.022,0.022,Lk.accEar==='stud'?[0.95,0.97,1]:GOLD,Lk.accEar==='stud');}
function accClassicTorso(B,TM,by,CW,Lk){const bt=Lk.accBelt;if(!bt)return;PB(B,TM,0,0.44+by,0,0.354*CW,0.03,0.224,bt.col);
 if(bt.buckle==='plate')PB(B,TM,0,0.44+by,0.118,0.06,0.04,0.012,GOLD,true);else for(const s of [-1,1])PB(B,TM,s*0.018,0.44+by,0.118,0.03,0.04,0.012,GOLD,true);}
/* pieces bought earlier show from the first frame (index.html ran applyJewelLooks before this file loaded) */
applyAccLooks();
