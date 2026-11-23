'use strict';
/* TRAVEL MAP: the car menu is a neon map of Miami. Every place you can drive to is a pin (the old car-menu buttons, same ids and
   handlers), tonight's job glows pink, a side card says what the selected pin is with one DRIVE THERE button, and the extras
   (car phone, the Dade Exchange, the Empire) sit as small buttons under it.
   Mouse: hover picks a pin, click drives. Touch: the first tap picks, a second tap (or DRIVE THERE) drives. Keys: arrows
   pick, Enter drives, and the old letter shortcuts still work. Pad: stick / d-pad pick, A drives, the old shoulder buttons still work.
   The map is 160 x 100 units, north up: mainland on the left, Biscayne Bay, Miami Beach, the Atlantic on the right. */
const TMAP_PLACES={
 mcwey:{x:74,y:55,area:'DOWNTOWN',col:'#ffd36b'},
 shop:{x:44,y:62,area:'LITTLE HAVANA',col:'#2de2e6'},
 club:{x:127,y:63,area:'SOUTH BEACH',col:'#ff5fb8'},
 dealer:{x:82,y:27,area:'MIDTOWN',col:'#2de2e6'}};
/* the homes: Room 14 (Sunset Motel), the Ocean Drive studio, Coral Tower penthouse, Villa Solana, then homes.js: the casita, the houseboat, the Flamingo Arms, Casa del Sol */
const TMAP_HOMES=[{x:24,y:22,area:'HIALEAH'},{x:130,y:80,area:'OCEAN DRIVE'},{x:68,y:73,area:'BRICKELL'},{x:107,y:60,area:'STAR ISLAND'},
 {x:36,y:58,area:'LITTLE HAVANA'},{x:70,y:92,area:'DINNER KEY'},{x:134,y:70,area:'SOUTH BEACH'},{x:47,y:94,area:'COCONUT GROVE'}];
/* campaign floors by LEVELS index (missionBase), kept clear of the fixed pins */
const TMAP_JOBS=[{x:54,y:40,area:'ALLAPATTAH'},{x:122,y:42,area:'MID BEACH'},{x:68,y:73,area:'BRICKELL'},{x:97,y:66,area:'DODGE ISLAND'},
 {x:60,y:28,area:'WYNWOOD'},{x:131,y:22,area:'NORTH BEACH'},{x:30,y:46,area:'FLAGAMI'},{x:116,y:86,area:'FISHER ISLAND'},
 {x:137,y:96,area:'SOUTH POINTE'},{x:60,y:88,area:'COCONUT GROVE'},{x:86,y:45,area:'EDGEWATER'},{x:54,y:70,area:'THE ROADS'},{x:38,y:85,area:'CORAL GABLES'},{x:16,y:9,area:'OPA-LOCKA'},
 {x:137,y:50,area:'MIAMI BEACH'},{x:104,y:74,area:'GOVERNMENT CUT'},{x:82,y:62,area:'DOWNTOWN'}];
const TMAP_PINS=['bCarJob','bCarMcWey','bCarShop','bCarClub','bCarDealer','bCarHome'];
let TMAP_SEL='bCarJob',TMAP_NAV=0,TMAP_READY=false;
addEventListener('resize',()=>{if(typeof state!=='undefined'&&state==='carmenu')tmapFit();});
function tmapSvg(){
 const isl=(cx,cy,rx,ry)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="tmL"/>`;
 return `<svg viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="tmGrid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M5 0H0V5" fill="none" stroke="#173a66" stroke-width=".3"/></pattern>
<linearGradient id="tmSea" x1="0" x2="1"><stop offset="0" stop-color="#0b1c40"/><stop offset="1" stop-color="#082a50"/></linearGradient></defs>
<rect width="160" height="100" fill="url(#tmSea)"/><rect width="160" height="100" fill="url(#tmGrid)"/>
<path class="tmL" d="M0 0H96C94 12 99 20 95 30 92 40 97 48 93 58 90 66 95 72 91 80 88 88 90 95 88 100H0Z"/>
<path class="tmL" d="M117 0H125C124 20 130 40 133 62 135 78 139 90 140 100H129C126 88 124 76 122 62 119 42 118 20 117 0Z"/>
${isl(107,60,4,2.2)}${isl(101,42,3,1.4)}${isl(105,43,2.4,1.2)}${isl(97,66,5,2)}${isl(88,72,2.4,1.6)}${isl(116,86,4,2.5)}${isl(146,95,9,4)}
<g class="tmRd"><path d="M0 52H93M0 26H95M0 78H90M20 0V100M50 0V100M72 0V100M8 64C30 60 40 70 60 66"/><path d="M128 0C127 30 132 60 136 100"/></g>
<g class="tmCw"><path d="M93 55 104 60 110 60 123 62"/><path d="M95 30 121 29"/><path d="M95 42 120 41"/><path d="M90 70 97 66 102 66"/></g>
<g class="tmTx"><text x="104" y="22" transform="rotate(-84 104 22)">BISCAYNE BAY</text><text x="148" y="58" transform="rotate(-80 148 58)">ATLANTIC OCEAN</text><text x="139" y="99">KEY BISCAYNE</text></g></svg>`;}
/* labels: each pin tries centred, hanging right and hanging left, and keeps the spot that stays on the map and overlaps the
   labels already placed the least (tonight's job goes first so it never moves) */
function tmapFit(){const m=$('cmMap');if(!m||state!=='carmenu')return;const W=m.clientWidth,H=m.clientHeight,put=[];
 const hm=$('cmHere');if(hm.style.display!=='none'){const r=hm.getBoundingClientRect(),o=m.getBoundingClientRect();put.push({x:r.left-o.left,y:r.top-o.top,w:r.width,h:r.height});}
 const cost=a=>(a.x<2||a.x+a.w>W-2||a.y<2?1e7:0)+put.reduce((s,b)=>s+Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)),0);
 for(const id of TMAP_PINS){const b=$(id);if(!tmapVis(id))continue;const px=parseFloat(b.style.left)/100*W,py=parseFloat(b.style.top)/100*H,w=b.offsetWidth,h=b.offsetHeight;
  const opts=[['',px-w/2],['lft',px-14],['rgt',px+14-w]].map(([c,x])=>({c,r:{x,y:py-h,w,h}}));
  let pick=opts[0],pc=1e9;for(const o of opts){const c=cost(o.r);if(c<pc-1){pc=c;pick=o;}}
  b.classList.toggle('lft',pick.c==='lft');b.classList.toggle('rgt',pick.c==='rgt');put.push(pick.r);}}
/* the pin a place lives at right now */
function tmapPos(id){const p=typeof myProg==='function'?myProg():{};
 if(id==='bCarJob'){if(mcMust())return {...TMAP_PLACES.mcwey,col:'#ff2d95'};let i=typeof JOBPICK!=='undefined'&&JOBPICK?missionBase(JOBPICK):mcDue()?VISIT.next:NEXTJOB;if(!(i>=0))i=NEXTJOB;i=Number.isFinite(i)?Math.max(0,i):0;return {...TMAP_JOBS[i%TMAP_JOBS.length],col:'#ff2d95'};}
 if(id==='bCarHome')return {...TMAP_HOMES[p.home||0]||TMAP_HOMES[0],col:'#7dff9a'};
 return TMAP_PLACES[{bCarMcWey:'mcwey',bCarShop:'shop',bCarClub:'club',bCarDealer:'dealer'}[id]];}
/* where the player is standing: the pin for the current hub */
function tmapHere(){const d=G&&G.def;if(!d)return null;if(HUBMODE==='home')return tmapPos('bCarHome');
 if(d===HUBS.bunker)return TMAP_PLACES.shop;if(d===HUBS.club)return TMAP_PLACES.club;if(d===HUBS.mall||d===HUBS.mall2)return TMAP_PLACES.dealer;return TMAP_PLACES.mcwey;}
const tmapVis=id=>$(id).style.display!=='none';
function tmapInit(){if(TMAP_READY)return;TMAP_READY=true;const m=$('cmMap');m.insertAdjacentHTML('afterbegin',tmapSvg());
 for(const id of TMAP_PINS){const b=$(id);b.classList.add('cmPin');
  b.addEventListener('mouseenter',()=>{if(!touchMode)tmapSelect(id);});
  /* a touch on a pin that isn't picked yet only picks it */
  b.addEventListener('pointerdown',e=>{b._arm=e.pointerType!=='mouse'&&TMAP_SEL!==id;});}
 m.addEventListener('click',e=>{const b=e.target.closest('.cmPin');if(b&&b._arm){b._arm=false;e.stopPropagation();e.preventDefault();tmapSelect(b.id,true);}},true);
 $('bCarGo').onclick=()=>{if(state==='carmenu'&&tmapVis(TMAP_SEL))$(TMAP_SEL).click();};}
/* lay the pins out and refresh the card; called by openCarMenu after it set every button's label and visibility */
function tmapRefresh(){tmapInit();
 for(const id of TMAP_PINS){const b=$(id),q=tmapPos(id);b.style.left=(q.x/1.6)+'%';b.style.top=q.y+'%';b.style.setProperty('--pc',q.col);b.dataset.area=q.area;}
 const h=tmapHere(),hm=$('cmHere');if(h){hm.style.display='';hm.style.left=(h.x/1.6)+'%';hm.style.top=h.y+'%';hm.classList.toggle('lft',h.x<26);hm.classList.toggle('rgt',h.x>134);}else hm.style.display='none';
 requestAnimationFrame(tmapFit);
 if(!tmapVis(TMAP_SEL)||state==='carmenu'&&!$('sCar').classList.contains('on'))TMAP_SEL='bCarJob';tmapSelect(TMAP_SEL);}
function tmapInfo(id){const p=myProg(),q=tmapPos(id);
 const txt=id=>$(id).textContent.replace(/\s*\([^)]*\)\s*/g,' ').trim();
 switch(id){
  case 'bCarJob':return mcMust()?{t:'McWEY TOWER',d:'McWey wants a word before the next job. Fifty-two floors of gold, downtown.',k:'ENTER'}
   :{t:txt(id).replace(/^NEXT JOB:\s*/,''),d:"Tonight's job. Pull up, read the card, go in.",k:'ENTER',tag:'NEXT JOB'};
  case 'bCarMcWey':return {t:'McWEY TOWER',d:mcDue()?'Debrief with McWey and pick up the next floor.':'Take extra work from McWey, or haggle his cut.',k:'M'};
  case 'bCarShop':return {t:"NINE OF NINE'S",d:'Guns, ammo and the range out back. Try before you buy.',k:'G'};
  case 'bCarClub':return clubBanned()?{t:'VELVET PALMS',d:"Tony's bouncers won't let you in. Do another job first.",k:'C',no:true}:{t:'VELVET PALMS',d:"Tony's gentlemen's club. Drinks, the stage, the VIP rooms.",k:'C'};
  case 'bCarDealer':return {t:'BISCAYNE GALLERIA',d:'Jewelry, the tailor, furniture, real estate and Victory Motors.',k:'D'};
  case 'bCarHome':return {t:HOMEDEF[p.home||0].name,d:'Your place. Sleep, change, throw a party.',k:'H'};}
 return {t:txt(id),d:'',k:''};}
function tmapSelect(id,snd){if(!$(id)||!tmapVis(id))return;if(snd&&id!==TMAP_SEL)sfx('blip');TMAP_SEL=id;
 for(const k of TMAP_PINS)$(k).classList.toggle('sel',k===id);
 const i=tmapInfo(id),q=tmapPos(id);$('cmCard').style.setProperty('--pc',q.col);
 $('cmTag').textContent=(i.tag?i.tag+' · ':'')+q.area;$('cmTitle').textContent=i.t;$('cmDesc').textContent=i.d;
 $('bCarGo').innerHTML=(i.no?'CLOSED TONIGHT':'DRIVE THERE')+(i.k?'<span class="kbhint"> ('+i.k+')</span>':'')+'<span class="padhint"> (A)</span>';$('bCarGo').classList.toggle('alt',!!i.no);}
/* arrows / stick: the nearest visible pin roughly in that direction (screen y grows downward) */
function tmapMove(dx,dy){const a=tmapPos(TMAP_SEL);let best=null,bs=1e9;
 for(const id of TMAP_PINS){if(id===TMAP_SEL||!tmapVis(id))continue;const q=tmapPos(id),vx=q.x-a.x,vy=(q.y-a.y)*1.6,d=Math.hypot(vx,vy)||0.01,along=(vx*dx+vy*dy)/d;
  if(along<0.35)continue;const s=d*(2-along);if(s<bs){bs=s;best=id;}}
 if(best)tmapSelect(best,true);}
function tmapKey(c){const D={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[c];if(D){tmapMove(D[0],D[1]);return true;}
 if(c==='Enter'||c==='Space'||c==='NumpadEnter'){$('bCarGo').click();return true;}return false;}
function tmapPad(dt){TMAP_NAV-=dt;const x=PAD.lx||0,y=PAD.ly||0,m=Math.hypot(x,y);
 if(m<0.5){TMAP_NAV=0;}else if(TMAP_NAV<=0){TMAP_NAV=0.28;tmapMove(x/m,y/m);}
 if(pdown(0))$('bCarGo').click();}
