'use strict';
/* ACCESSORIES you wear (2026-11-20): hats, gloves, belt bags, a logo belt and Havana cigars on Felix's accessory wall in Fontaine Tailoring,
   earrings in Schmaltzy's case at Gold Coast Jewelers. One piece per slot is worn at a time; everything you bought stays yours.
   Save: p.acc={own:{k:1},on:{slot:k}}.
   Looks: the high-detail model reads accOn() in models.js jewelB (B.hat/hatCol/hatBand, B.gloves, B.ear, B.pack, B.belt, B.cigar);
   the classic model reads LOOKS flags set by applyAccLooks (accHat, accEar, accPack, gloves, cigar), drawn by accClassicHead/accClassicTorso. */
/* DESIGNER LINE (Tristan 2026-11-20: "make it look like designer items"): every piece comes from a made-up luxury house (house) and wears its
   gold hardware: a logo plate on the hat band, a gold snap on the gloves, a logo plaque on the bags, a band on the cigar, the house's
   interlocking-ring buckle on the belt. mono: the bag is printed with the house monogram (gold on the leather). */
const ACC_SLOTS={hat:'HATS',hands:'GLOVES',waist:'BAGS',belt:'BELTS',mouth:'SMOKES',ear:'EARRINGS'};
const ACC_HOUSES={bellamy:'MAISON BELLAMY · PARIS',valente:'VALENTE · ROMA',doro:"D'ORO · MILANO",harcourt:'HARCOURT · LONDON',stclair:'SAINT-CLAIR · NEW YORK',reina:'LA REINA · HABANA'};
const ACC={
 fedora:{slot:'hat',shop:'tailor',house:'bellamy',name:'WHITE FELT FEDORA',price:6500,desc:'Snow white rabbit felt, a black grosgrain band and the little gold Bellamy plate at the front. Says "I own the club" before you open your mouth.',hat:'fedora',col:[0.95,0.93,0.88],band:[0.08,0.08,0.1]},
 panama:{slot:'hat',shop:'tailor',house:'valente',name:'MONTECRISTI PANAMA',price:4800,desc:'Hand-woven toquilla straw, a wide brim, a flamingo silk band with the gold Valente V. Shade for the face, not the conscience.',hat:'panama',col:[0.9,0.81,0.58],band:[1,0.42,0.68]},
 cap:{slot:'hat',shop:'tailor',house:'doro',name:'LOGO SPORT CAP',price:2200,desc:"Black lambskin six-panel, gold D'Oro rings on the front, gold button. Off duty, on the yacht, or on the run.",hat:'cap',col:[0.06,0.055,0.065],band:[0.95,0.76,0.3]},
 flat:{slot:'hat',shop:'tailor',house:'harcourt',name:'CASHMERE FLAT CAP',price:3200,desc:'Grey cashmere tweed from a Savile Row cutter, a gold crest on the side. The old men playing dominoes will stand up.',hat:'flat',col:[0.46,0.43,0.4],band:[0.32,0.29,0.27]},
 gloves:{slot:'hands',shop:'tailor',house:'doro',name:'NAPPA DRIVING GLOVES',price:2500,desc:'Black nappa leather, perforated knuckles, a gold logo snap at the wrist. Grip on the wheel, no prints on the glass.',col:[0.07,0.065,0.07]},
 tangloves:{slot:'hands',shop:'tailor',house:'valente',name:'CALFSKIN GLOVES',price:2800,desc:'Hand-stitched tan calfskin, a gold snap at the wrist. Italian, like the people who ask about them.',col:[0.62,0.42,0.24]},
 monobag:{slot:'waist',shop:'tailor',house:'doro',name:'MONOGRAM BELT BAG',price:5500,desc:"Espresso coated canvas printed all over with the gold D'Oro rings, dark leather trim and a gold plaque. Holds cash, keys and the deed to something.",col:[0.24,0.15,0.09],band:[0.1,0.07,0.05],mono:1},
 pack:{slot:'waist',shop:'tailor',house:'stclair',name:'NEON BELT BAG',price:3500,desc:'Hot pink nylon, teal zip and a gold Saint-Clair plaque, worn proudly at the front. The most expensive bad idea in Miami.',col:[1,0.3,0.62],band:[0.18,0.85,0.85]},
 belt:{slot:'belt',shop:'tailor',house:'doro',name:'LOGO BELT',price:4500,desc:"Black calf leather and a big gold buckle of the D'Oro rings. Everybody looks at your belt first. That's the point.",col:[0.06,0.055,0.06]},
 cigar:{slot:'mouth',shop:'tailor',house:'reina',name:'GRAN CORONA CIGARS',price:900,desc:'A cedar box of real Cubans, the kind you are not supposed to have, each with a gold paper band. One is always lit.'},
 stud:{slot:'ear',shop:'jewel',house:'bellamy',name:'DIAMOND STUDS',price:7500,desc:'A carat in each ear, set in Bellamy platinum. They catch the light every time you turn your head.',ear:'stud'},
 hoop:{slot:'ear',shop:'jewel',house:'doro',name:'GOLD HOOPS',price:3000,desc:"Thick 18k hoops with the D'Oro rings engraved inside. Pirate money.",ear:'hoop'}};
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
function applyAccLooks(){if(typeof LOOKS==='undefined')return;for(const c of CHARS){const L=LOOKS[c.id];if(!L)continue;if(!L._ac0)L._ac0={gloves:L.gloves,cigar:L.cigar};
 const on=accOn(PROG[c.id]),g=ACC[on.hands];Object.assign(L,L._ac0);L.accHat=on.hat?ACC[on.hat]:null;L.accEar=on.ear?ACC[on.ear].ear:null;L.accPack=on.waist?ACC[on.waist]:null;L.accBelt=on.belt?ACC[on.belt]:null;
 if(g)L.gloves=g.col;if(on.mouth)L.cigar=true;}}
/* classic model, head matrix H (index.html drawChar): the hat sits over the hair plate, earrings hang under the ear blocks */
function accClassicHead(B,H,hy,Lk){const h=Lk.accHat;
 if(h){const c=h.col,b=h.band;
  if(h.hat==='fedora'){PB(B,H,0,1.125+hy,-0.005,0.262,0.11,0.262,c);PB(B,H,0,1.074+hy,-0.005,0.42,0.016,0.42,c);PB(B,H,0,1.092+hy,-0.005,0.268,0.03,0.268,b);}
  else if(h.hat==='panama'){PB(B,H,0,1.115+hy,-0.005,0.262,0.09,0.262,c);PB(B,H,0,1.072+hy,-0.005,0.5,0.014,0.5,c);PB(B,H,0,1.088+hy,-0.005,0.268,0.028,0.268,b);}
  else if(h.hat==='cap'){PB(B,H,0,1.095+hy,-0.008,0.27,0.08,0.27,c);PB(B,H,0,1.064+hy,0.17,0.25,0.018,0.13,c);PB(B,H,0,1.14+hy,-0.008,0.04,0.014,0.04,b);PB(B,H,0,1.1+hy,0.137,0.08,0.04,0.006,b);}
  else if(h.hat==='flat'){PB(B,H,0,1.085+hy,0.005,0.272,0.065,0.285,c);PB(B,H,0,1.06+hy,0.15,0.25,0.022,0.09,b);}
  /* the house's gold logo plate at the front */
  const ly={fedora:1.092,panama:1.088,cap:1.1,flat:1.09}[h.hat],lz={fedora:0.13,panama:0.13,cap:0.14,flat:0.146}[h.hat];if(ly)PB(B,H,0,ly+hy,lz,h.hat==='cap'?0.07:0.04,h.hat==='cap'?0.035:0.026,0.008,GOLD,true);}
 if(Lk.accEar){const e=Lk.accEar==='stud'?[0.95,0.97,1]:GOLD;for(const s of [-1,1])PB(B,H,s*0.128,0.885+hy,0.005,0.022,Lk.accEar==='hoop'?0.04:0.022,0.022,e,Lk.accEar==='stud');}}
function accClassicTorso(B,TM,by,CW,Lk){const k=Lk.accPack,bt=Lk.accBelt;
 if(bt){PB(B,TM,0,0.44+by,0,0.354*CW,0.03,0.224,bt.col);for(const s of [-1,1])PB(B,TM,s*0.018,0.44+by,0.118,0.03,0.04,0.012,GOLD,true);}
 if(!k)return;PB(B,TM,0,0.49+by,0,0.352*CW,0.024,0.222,DARK);PB(B,TM,0,0.47+by,0.14,0.2,0.085,0.06,k.col);PB(B,TM,0,0.5+by,0.172,0.19,0.012,0.006,k.band);PB(B,TM,0,0.465+by,0.172,0.05,0.026,0.006,GOLD,true);}
/* pieces bought earlier show from the first frame (index.html ran applyJewelLooks before this file loaded) */
applyAccLooks();
