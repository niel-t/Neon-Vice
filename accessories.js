'use strict';
/* ACCESSORIES you wear (2026-11-20): hats, gloves, a bum bag and Havana cigars on Felix's accessory wall in Fontaine Tailoring,
   earrings in Schmaltzy's case at Gold Coast Jewelers. One piece per slot is worn at a time; everything you bought stays yours.
   Save: p.acc={own:{k:1},on:{slot:k}}.
   Looks: the high-detail model reads accOn() in models.js jewelB (B.hat/hatCol/hatBand, B.gloves, B.ear, B.pack, B.cigar);
   the classic model reads LOOKS flags set by applyAccLooks (accHat, accEar, accPack, gloves, cigar), drawn by accClassicHead/accClassicTorso. */
const ACC_SLOTS={hat:'HATS',hands:'GLOVES',waist:'BAGS',mouth:'SMOKES',ear:'EARRINGS'};
const ACC={
 fedora:{slot:'hat',shop:'tailor',name:'WHITE PALM FEDORA',price:1800,desc:'Snow white felt, black silk band. Says "I own the club" before you open your mouth.',hat:'fedora',col:[0.95,0.93,0.88],band:[0.08,0.08,0.1]},
 panama:{slot:'hat',shop:'tailor',name:'KEY WEST PANAMA',price:1400,desc:'Hand-woven straw with a wide brim and a flamingo pink band. Shade for the face, not the conscience.',hat:'panama',col:[0.88,0.78,0.55],band:[1,0.42,0.68]},
 cap:{slot:'hat',shop:'tailor',name:'BISCAYNE BAY CAP',price:600,desc:'Teal ball cap, white button, curved peak. Off-duty, on the boat, or on the run.',hat:'cap',col:[0.1,0.66,0.68],band:[0.96,0.96,0.94]},
 flat:{slot:'hat',shop:'tailor',name:'LITTLE HAVANA FLAT CAP',price:900,desc:'Grey tweed, worn low. The old men playing dominoes will nod at you.',hat:'flat',col:[0.44,0.41,0.38],band:[0.3,0.28,0.26]},
 gloves:{slot:'hands',shop:'tailor',name:'BLACK DRIVING GLOVES',price:700,desc:'Thin black kid leather. Grip on the wheel, no prints on the glass.',col:[0.07,0.065,0.07]},
 tangloves:{slot:'hands',shop:'tailor',name:'TAN CALFSKIN GLOVES',price:900,desc:'Soft tan calfskin with a snap at the wrist. Italian, like the people who ask about them.',col:[0.62,0.42,0.24]},
 pack:{slot:'waist',shop:'tailor',name:'NEON BUM BAG',price:450,desc:'Hot pink nylon, teal zip, worn proudly at the front. Holds cash, keys and one bad idea.',col:[1,0.3,0.62],band:[0.18,0.85,0.85]},
 cigar:{slot:'mouth',shop:'tailor',name:'HAVANA CIGARS',price:250,desc:'A box of real Cubans, the kind you are not supposed to have. One is always lit.'},
 stud:{slot:'ear',shop:'jewel',name:'DIAMOND STUDS',price:7500,desc:'A carat in each ear. They catch the light every time you turn your head.',ear:'stud'},
 hoop:{slot:'ear',shop:'jewel',name:'GOLD HOOPS',price:3000,desc:'Thick gold hoops, one in each ear. Pirate money.',ear:'hoop'}};
function accData(p){const a=p.acc=p.acc||{};a.own=a.own||{};a.on=a.on||{};return a;}
/* what is being worn right now, by slot ({hat:'fedora',...}); only pieces you own and that still exist count */
function accOn(p){const o={},a=p&&p.acc;if(!a||!a.on)return o;for(const s in a.on){const k=a.on[s];if(k&&ACC[k]&&ACC[k].slot===s&&a.own&&a.own[k])o[s]=k;}return o;}
function accWorn(p,k){const it=ACC[k];return !!it&&accOn(p)[it.slot]===k;}
function buyAcc(k){const p=myProg(),it=ACC[k];if(!it)return;const a=accData(p),id=rideId(),wasOn=accWorn(p,k);
 if(a.own[k]){a.on[it.slot]=wasOn?null:k;saveProg();sfx('pick');applyJewelLooks();PS2C.rebuild(id);
  return renderStore(wasOn?'You take off the '+it.name+'.':'You put on the '+it.name+'.');}
 if(p.wallet<it.price)return mallPoor();
 p.wallet-=it.price;a.own[k]=1;a.on[it.slot]=k;saveProg();sfx('cash');
 const s=MALL_SHOPS[it.shop];mallSay(pick((it.shop==='tailor'&&s.acc)||s.sold));applyJewelLooks();PS2C.rebuild(id);renderStore('SOLD: '+it.name+'. '+it.desc);}
/* the shop cards for one shop's accessories, grouped by slot; n = running card number for the keyboard hints */
function accCards(p,shop,n){const ks=Object.keys(ACC).filter(k=>ACC[k].shop===shop),a=(p.acc&&p.acc.own)||{},on=accOn(p);
 return ks.map(k=>{const it=ACC[k],w=on[it.slot]===k,own=!!a[k],swap=!w&&!!on[it.slot];
  return mallCard(`data-ac="${k}"`,it.name,it.desc,w?'WEARING · TAKE OFF':own?(swap?'YOURS · SWAP IT IN':'YOURS · WEAR'):'BUY $'+fmt(it.price),w,false,n+ks.indexOf(k));}).join('');}
/* classic model flags; the signature look (Don's cigar, any gloves) comes back when you take a piece off */
function applyAccLooks(){if(typeof LOOKS==='undefined')return;for(const c of CHARS){const L=LOOKS[c.id];if(!L)continue;if(!L._ac0)L._ac0={gloves:L.gloves,cigar:L.cigar};
 const on=accOn(PROG[c.id]),g=ACC[on.hands];Object.assign(L,L._ac0);L.accHat=on.hat?ACC[on.hat]:null;L.accEar=on.ear?ACC[on.ear].ear:null;L.accPack=on.waist?ACC[on.waist]:null;
 if(g)L.gloves=g.col;if(on.mouth)L.cigar=true;}}
/* classic model, head matrix H (index.html drawChar): the hat sits over the hair plate, earrings hang under the ear blocks */
function accClassicHead(B,H,hy,Lk){const h=Lk.accHat;
 if(h){const c=h.col,b=h.band;
  if(h.hat==='fedora'){PB(B,H,0,1.125+hy,-0.005,0.262,0.11,0.262,c);PB(B,H,0,1.074+hy,-0.005,0.42,0.016,0.42,c);PB(B,H,0,1.092+hy,-0.005,0.268,0.03,0.268,b);}
  else if(h.hat==='panama'){PB(B,H,0,1.115+hy,-0.005,0.262,0.09,0.262,c);PB(B,H,0,1.072+hy,-0.005,0.5,0.014,0.5,c);PB(B,H,0,1.088+hy,-0.005,0.268,0.028,0.268,b);}
  else if(h.hat==='cap'){PB(B,H,0,1.095+hy,-0.008,0.27,0.08,0.27,c);PB(B,H,0,1.064+hy,0.17,0.25,0.018,0.13,c);PB(B,H,0,1.14+hy,-0.008,0.04,0.014,0.04,b);PB(B,H,0,1.1+hy,0.137,0.08,0.04,0.006,b);}
  else if(h.hat==='flat'){PB(B,H,0,1.085+hy,0.005,0.272,0.065,0.285,c);PB(B,H,0,1.06+hy,0.15,0.25,0.022,0.09,b);}}
 if(Lk.accEar){const e=Lk.accEar==='stud'?[0.95,0.97,1]:GOLD;for(const s of [-1,1])PB(B,H,s*0.128,0.885+hy,0.005,0.022,Lk.accEar==='hoop'?0.04:0.022,0.022,e,Lk.accEar==='stud');}}
function accClassicTorso(B,TM,by,CW,Lk){const k=Lk.accPack;if(!k)return;PB(B,TM,0,0.49+by,0,0.352*CW,0.024,0.222,DARK);PB(B,TM,0,0.47+by,0.14,0.2,0.085,0.06,k.col);PB(B,TM,0,0.5+by,0.172,0.19,0.012,0.006,k.band);}
/* pieces bought earlier show from the first frame (index.html ran applyJewelLooks before this file loaded) */
applyAccLooks();
