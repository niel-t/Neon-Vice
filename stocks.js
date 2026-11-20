'use strict';
/* THE DADE EXCHANGE: a 1986 stock market on the car menu (button THE DADE EXCHANGE, I, pad d-pad right). Your broker Chip Whitmore takes
   your calls from any payphone. Prices move once after every finished job (payout in index.html calls stkTick next to mallRent/empPay),
   so you buy before a job and see what happened when you get home: a random walk per stock, company news (good or bad), the odd market
   crash or boom, and the story: Kade Development climbs through Act 3 and dies with Dorian Kade, Vale Trust does the same in Act 4.
   Chip sells a hot tip once a job; it is right more often than not, and wrong the rest of the time. Everything lives in p.stk per
   operator: {day, px{k}, hist{k:[...]}, own{k:{n,cost}}, tip, real, ev{}, last[]}. Trades cost a 1% commission (min $10). */
const STK_LIST=[
 {k:'mcw',t:'MCW',name:'McWEY CORP.',sec:'HOTELS · REAL ESTATE',p0:42,mu:0.012,vol:0.045,col:'#ffd36b',desc:'The man himself. Slow, steady and gold-plated.'},
 {k:'gcc',t:'GCTV',name:'GOLD COAST CABLE',sec:'CABLE TV',p0:9,mu:0.018,vol:0.12,col:'#2de2e6',desc:'Forty channels and MTV. Everybody in Dade County wants cable.'},
 {k:'fla',t:'FLMA',name:'FLAMINGO AIRWAYS',sec:'AIRLINE',p0:24,mu:0.004,vol:0.09,col:'#ff5fb8',desc:'Miami to the islands, twice a day. Fuel prices bite.'},
 {k:'nep',t:'NEPT',name:'NEPTUNE CRUISE LINES',sec:'CRUISES',p0:31,mu:0.008,vol:0.07,col:'#7da8ff',desc:'Floating buffets out of the Port of Miami.'},
 {k:'sun',t:'SUNC',name:'SUNSHINE CITRUS',sec:'ORANGE GROVES',p0:14,mu:0.01,vol:0.06,col:'#ff9a3a',desc:'Florida orange juice. One cold night can ruin a year.'},
 {k:'egm',t:'EGLD',name:'EVERGLADES GOLD MINING',sec:'PENNY STOCK',p0:1.2,mu:-0.012,vol:0.3,col:'#9fe8a8',desc:'Gold. In a swamp. Sold over the phone. What could go wrong?'},
 {k:'kdv',t:'KDV',name:'KADE DEVELOPMENT',sec:'CONSTRUCTION',p0:18,mu:0.01,vol:0.08,col:'#f4f4f4',desc:'Dorian Kade is buying Ocean Drive one block at a time.',after:'c7',story:{rise:'c7',fall:'c10',lvl:10,ev:'kade',hit:0.85,
  head:'KADE DEVELOPMENT COLLAPSES',sub:'Dorian Kade found dead at his own tower site. KDV in free fall'}},
 {k:'vtb',t:'VTB',name:'VALE TRUST BANK',sec:'PRIVATE BANKING',p0:55,mu:0.01,vol:0.05,col:'#b08cff',desc:"Conrad Vale's bank. Very private. Very liquid. Very connected.",after:'c10',story:{rise:'c10',fall:'c13',lvl:13,ev:'vale',hit:0.8,
  head:'RUN ON VALE TRUST',sub:'Conrad Vale gone after a jet blows up at Opa-Locka. VTB crashes'}}];
/* company news: [headline, sign] picked at random when a stock has a big day */
const STK_NEWS={
 mcw:[['McWEY CORP. BUYS A HOTEL ON COLLINS',1],['McWEY TOWER ADDS TEN FLOORS',1],['CITY HALL PROBES McWEY PERMITS',-1],['McWEY CORP. MISSES ITS NUMBERS',-1]],
 gcc:[['GOLD COAST CABLE WIRES ALL OF HIALEAH',1],['GCTV SIGNS A DEAL WITH MTV',1],['GCTV OUTAGE: HURRICANE TAKES DOWN THE LINES',-1],['CABLE PIRATES COST GCTV MILLIONS',-1]],
 fla:[['FLAMINGO AIRWAYS ADDS FLIGHTS TO NASSAU',1],['OIL PRICES DROP: AIRLINES FLY HIGH',1],['FLAMINGO AIRWAYS PILOTS STRIKE',-1],['FAA GROUNDS FLAMINGO FLEET',-1]],
 nep:[['NEPTUNE CRUISES SOLD OUT ALL WINTER',1],['NEPTUNE LAUNCHES A NEW MEGASHIP',1],['FOOD POISONING ON THE S.S. NEPTUNE',-1],['NEPTUNE SHIP RUNS AGROUND OFF KEY WEST',-1]],
 sun:[['RECORD ORANGE HARVEST',1],['SUNSHINE CITRUS SIGNS A SODA DEAL',1],['FROST HITS THE GROVES',-1],['CITRUS CANKER FOUND IN POLK COUNTY',-1]],
 egm:[['EVERGLADES GOLD: "WE STRUCK A VEIN"',1],['PHONE BROKERS PUMP EGLD',1],['SEC RAIDS EVERGLADES GOLD',-1],['EGLD MINE IS JUST A SWAMP, SAYS GEOLOGIST',-1]],
 kdv:[['KADE WINS THE OCEAN DRIVE REZONING',1],['KADE BUYS ANOTHER ART DECO BLOCK',1],['PROTESTERS BLOCK KADE BULLDOZERS',-1],['KADE PERMITS UNDER REVIEW',-1]],
 vtb:[['VALE TRUST OPENS A BRANCH IN NASSAU',1],['VALE TRUST DEPOSITS UP 40%',1],['FEDS ASK WHERE VALE TRUST CASH COMES FROM',-1],['VALE TRUST AUDIT DELAYED',-1]]};
/* Chip's tips: where he heard it */
const STK_SRC=['My brother-in-law cleans the boardroom at','A guy on my racquetball team works at','I had drinks with a secretary from','The shoeshine at the Exchange swears by','My dentist plays golf with the boss of','I hear it from a fella inside'];
const STK_TIP_COST=500,STK_TIP_TRUE=0.62,STK_HIST=24,STK_BUY=[1000,10000];
let STK_SEL=0,STK_RNG=null;/* tests set STK_RNG to a function returning 0..1 */
const stkR=()=>STK_RNG?STK_RNG():Math.random();
function stkGauss(){let u=0,v=0;while(u===0)u=stkR();while(v===0)v=stkR();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
const stkDone=id=>typeof missionDone==='function'&&missionDone(id);
const stkListed=q=>!q.after||stkDone(q.after);
const stkQ=k=>STK_LIST.find(q=>q.k===k);
const stkPx=v=>v>=10?'$'+v.toFixed(2):v>=1?'$'+v.toFixed(2):'$'+v.toFixed(3);
const stkFee=v=>Math.max(10,Math.round(v*0.01));
function stkSave(p){p=p||myProg();let s=p.stk;if(!s||typeof s!=='object')s=p.stk={};
 if(typeof s.day!=='number')s.day=0;if(!s.px||typeof s.px!=='object')s.px={};if(!s.hist||typeof s.hist!=='object')s.hist={};if(!s.own||typeof s.own!=='object')s.own={};
 if(!s.ev||typeof s.ev!=='object')s.ev={};if(typeof s.real!=='number')s.real=0;if(!Array.isArray(s.last))s.last=[];
 for(const q of STK_LIST){/* old saves past a crash start the stock at its crashed price */
  if(!(s.px[q.k]>0)){let v=q.p0;if(q.story&&stkDone(q.story.fall)){v=Math.round(q.p0*(1-q.story.hit)*100)/100;s.ev[q.story.ev]=1;}s.px[q.k]=v;}
  if(!Array.isArray(s.hist[q.k])||!s.hist[q.k].length)s.hist[q.k]=[s.px[q.k]];}
 return s;}
function stkHeld(p,k){const o=stkSave(p).own[k];return o&&o.n>0?o:null;}
function stkValue(p){const s=stkSave(p);let v=0;for(const q of STK_LIST){const o=s.own[q.k];if(o&&o.n>0)v+=o.n*s.px[q.k];}return v;}
function stkCost(p){const s=stkSave(p);let v=0;for(const q of STK_LIST){const o=s.own[q.k];if(o&&o.n>0)v+=o.cost;}return v;}
/* the day's move for every stock, after a finished job. lvl = the campaign floor just finished (or -1). Returns the change in value of
   what you hold, and queues the morning headlines (empNote banners on the way home) */
function stkTick(p,lvl){const s=stkSave(p),v0=stkValue(p),heads=[];s.day++;
 const r0=stkR();let mkt=0;
 if(r0<0.03){mkt=-(0.14+0.14*stkR());heads.push(['CRASH ON THE DADE EXCHANGE','Panic selling. Every stock is down',-1,null]);}
 else if(r0<0.07){mkt=0.07+0.07*stkR();heads.push(['BULL MARKET!','Wall Street is buying. Everything is up',1,null]);}
 /* the McWey bump when you square the loan at the Royal Flush */
 const mcBump=!s.ev.flush&&(lvl===7||stkDone('c7'));if(mcBump)s.ev.flush=1;
 for(const q of STK_LIST){const k=q.k;let mu=q.mu,vol=q.vol;const st=q.story;let crash=false;
  if(st){if(s.ev[st.ev]){mu=0.002;vol=0.2;}else if(lvl===st.lvl||stkDone(st.fall))crash=true;else if(stkDone(st.rise))mu=0.065;}
  let ret=mu+vol*stkGauss()+mkt,head=null;
  if(!crash&&stkR()<0.07){const n=STK_NEWS[k],h=n[Math.floor(stkR()*n.length)%n.length];ret+=h[1]*(0.15+0.2*stkR());head=[h[0],q.t+' '+(h[1]>0?'jumps':'drops'),h[1],k];}
  if(k==='mcw'&&mcBump){ret+=0.12;head=['McWEY CORP. EXPANDS','Desmond McWey is buying up the beach. MCW climbs',1,k];}
  const tip=s.tip&&s.tip.k===k?s.tip:null;
  if(tip&&!crash)ret=tip.real?tip.dir*(0.18+0.22*stkR()):-tip.dir*(0.04+0.12*stkR());
  if(crash){ret=-st.hit;s.ev[st.ev]=1;head=[st.head,st.sub,-1,k];}
  ret=Math.max(-0.9,Math.min(1.5,ret));
  const px=Math.max(0.05,Math.round(s.px[k]*(1+ret)*(s.px[k]<1?1000:100))/(s.px[k]<1?1000:100));s.px[k]=px;
  const h=s.hist[k];h.push(px);if(h.length>STK_HIST)h.splice(0,h.length-STK_HIST);
  if(head&&(stkListed(q)||crash))heads.push(head);}
 s.tip=null;
 const d=stkValue(p)-v0;
 s.last=heads.map(h=>h[0]).slice(0,6);
 if(typeof empNote==='function'){
  const mine=heads.filter(h=>!h[3]||stkHeld(p,h[3])||STK_LIST.find(q=>q.k===h[3]).story);
  if(v0>0)empNote('YOUR STOCKS '+(d>=0?'+$':'-$')+fmt(Math.abs(d)),(mine[0]?mine[0][0]+' · ':'')+'THE DADE EXCHANGE');
  else if(mine[0])empNote(mine[0][0],mine[0][1]);}
 return Math.round(d);}
/* trades: buy about `amt` dollars of a stock (fee included), or sell a share of what you hold (1 = all, 0.5 = half) */
function stkBuy(k,amt){const p=myProg(),s=stkSave(p),q=stkQ(k);if(!q||!stkListed(q))return 'no';const px=s.px[k];
 const cash=Math.min(amt,p.wallet),n=Math.floor((cash-stkFee(cash))/px);if(n<1)return 'poor';
 const cost=n*px,fee=stkFee(cost),o=s.own[k]||(s.own[k]={n:0,cost:0});if(cost+fee>p.wallet)return 'poor';
 p.wallet-=Math.round(cost+fee);o.n+=n;o.cost+=cost+fee;saveProg();return {n,cost:cost+fee};}
function stkSell(k,part){const p=myProg(),s=stkSave(p),o=s.own[k];if(!o||!(o.n>0))return 'none';
 const n=part>=1?o.n:Math.max(1,Math.floor(o.n*part)),gross=n*s.px[k],fee=Math.min(stkFee(gross),Math.floor(gross)),cash=Math.round(gross-fee),basis=o.cost*n/o.n;
 p.wallet+=cash;o.n-=n;o.cost-=basis;if(o.n<=0)delete s.own[k];const pl=cash-basis;s.real+=pl;saveProg();return {n,cash,pl:Math.round(pl)};}
function stkBuyTip(){const p=myProg(),s=stkSave(p);if(s.tip)return 'have';if(s.tipDay===s.day)return 'used';if(p.wallet<STK_TIP_COST)return 'poor';
 const L=STK_LIST.filter(q=>stkListed(q)&&!(q.story&&s.ev[q.story.ev]));const q=L[Math.floor(stkR()*L.length)%L.length];
 const held=stkHeld(p,q.k),dir=held&&stkR()<0.4?-1:stkR()<0.75?1:-1;
 p.wallet-=STK_TIP_COST;s.tip={k:q.k,dir,real:stkR()<STK_TIP_TRUE,src:Math.floor(stkR()*STK_SRC.length)%STK_SRC.length};s.tipDay=s.day;saveProg();return 'ok';}
function stkTipTxt(s){const t=s.tip;if(!t)return '';const q=stkQ(t.k);
 return `"${STK_SRC[t.src]} ${q.name}. ${t.dir>0?'After your next job, '+q.t+' goes UP. Big.':'Get out of '+q.t+' before your next job. It is going DOWN.'}"`;}

/* ---- the screen ---- */
function stkCarBtn(){const b=$('bCarStocks');if(!b)return;const p=myProg(),v=stkValue(p),c=stkCost(p);
 b.innerHTML='THE DADE EXCHANGE &middot; '+(v>0?'STOCKS $'+fmt(v)+' <span style="color:'+(v>=c?'#7dff9a':'#ff6a6a')+'">'+(v>=c?'+':'')+Math.round((v/c-1)*100)+'%</span>':'STOCKS &amp; TIPS')+'<span class="kbhint"> (I)</span><span class="padhint"> (&rarr;)</span>';}
function openStocks(){if(state!=='carmenu'||fading)return;sfx('ring');state='stocks';stkSave();const L=stkVisible();STK_SEL=Math.min(STK_SEL,L.length-1);show('sStocks');renderStocks('Chip Whitmore here. What are we buying?');}
function closeStocks(){if(state!=='stocks')return;sfx('blip');openCarMenuForce();}
const stkVisible=()=>STK_LIST.filter(stkListed);
function stkSpark(h,col){const n=h.length;if(n<2)return '<svg class="sxSpark" viewBox="0 0 100 30" preserveAspectRatio="none"></svg>';
 const lo=Math.min(...h),hi=Math.max(...h),sp=hi-lo||1,pts=h.map((v,i)=>(i/(n-1)*100).toFixed(1)+','+(27-(v-lo)/sp*24).toFixed(1)).join(' ');
 return `<svg class="sxSpark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;}
function stkCard(q,i,p,s){const h=s.hist[q.k],px=s.px[q.k],prev=h.length>1?h[h.length-2]:px,ch=prev?(px/prev-1)*100:0,o=s.own[q.k],up=ch>=0;
 const own=o&&o.n>0?`<div class="sxOwn">YOU OWN ${fmt(o.n)} · $${fmt(o.n*px)} <b style="color:${o.n*px>=o.cost?'#7dff9a':'#ff6a6a'}">${o.n*px>=o.cost?'+':'-'}$${fmt(Math.abs(o.n*px-o.cost))}</b></div>`:'<div class="sxOwn sxNone">YOU OWN NONE</div>';
 const btn=(a,t,dis)=>`<button class="btn sm sxGo"${dis?' disabled':''} data-act="${a}" data-i="${i}">${t}</button>`,poor=p.wallet<px+10,has=!!(o&&o.n>0),dead=q.story&&s.ev[q.story.ev];
 return `<div class="sxC${i===STK_SEL?' sel':''}" data-i="${i}"><div class="sxTop"><span class="sxT" style="color:${q.col}">${q.t}</span><span class="sxP">${stkPx(px)} <b class="${up?'sxUp':'sxDn'}">${up?'▲':'▼'}${Math.abs(ch).toFixed(1)}%</b></span></div>
 <div class="emA">${q.name} · ${dead?'BANKRUPT':q.sec}</div>${stkSpark(h,up?'#7dff9a':'#ff6a6a')}<div class="sxD">${q.desc}</div>${own}
 <div class="emBtns">${btn('b0','BUY $1K',poor)}${btn('b1','BUY $10K',poor)}${btn('all','ALL IN',poor)}${btn('half','SELL HALF',!has)}${btn('sell','SELL ALL',!has)}</div></div>`;}
function renderStocks(msg){const p=myProg(),s=stkSave(p),L=stkVisible(),v=stkValue(p),c=stkCost(p);
 $('sxWallet').textContent='$'+fmt(p.wallet);
 $('sxPort').innerHTML=v>0?'STOCKS $'+fmt(v)+' <span style="color:'+(v>=c?'#7dff9a':'#ff6a6a')+'">'+(v>=c?'+':'-')+'$'+fmt(Math.abs(v-c))+'</span>':'NO STOCKS YET';
 $('sxSub').innerHTML='BROKER: CHIP WHITMORE · DAY '+(s.day+1)+'<span class="emCnt"> · '+(s.real?'BANKED '+(s.real>=0?'+$':'-$')+fmt(Math.abs(s.real)):'PRICES MOVE AFTER EVERY JOB')+'</span>';
 const tape=(s.last.length?s.last:['THE DADE EXCHANGE · MIAMI 1986']).concat(L.map(q=>q.t+' '+stkPx(s.px[q.k])));$('sxTape').textContent=tape.join('   ✦   ');
 $('sxList').innerHTML=L.map((q,i)=>stkCard(q,i,p,s)).join('');
 const tb=s.tip?`<div class="sxTipT">${stkTipTxt(s)}</div>`:`<button class="btn sm sxGo" data-act="tip"${s.tipDay===s.day||p.wallet<STK_TIP_COST?' disabled':''}>${s.tipDay===s.day?'NO MORE TIPS TODAY':'BUY A HOT TIP $'+STK_TIP_COST}<span class="kbhint"> (T)</span><span class="padhint"> (RB)</span></button><span class="sxTipN">Chip hears things. He is right more often than not.</span>`;
 $('sxTip').innerHTML=tb;$('sxMsg').textContent=msg||'';
 const el=$('sxList').querySelector('.sxC.sel');if(el&&el.scrollIntoView)try{el.scrollIntoView({block:'nearest'});}catch(e){}}
function stkSelect(i){const n=stkVisible().length;STK_SEL=(i+n)%n;sfx('blip');renderStocks('');}
function stkAct(i,act){if(state!=='stocks'||fading)return;const p=myProg();
 if(act==='tip'){const r=stkBuyTip();sfx(r==='ok'?'cash':'blip');return renderStocks(r==='ok'?'That one cost you $'+STK_TIP_COST+'. Your call what you do with it.':r==='poor'?'Tips cost money, pal.':'One tip a day. Go do a job.');}
 const q=stkVisible()[i];if(!q)return;STK_SEL=i;
 if(act==='sell'||act==='half'){const r=stkSell(q.k,act==='sell'?1:0.5);if(r==='none'){sfx('blip');return renderStocks('You do not own any '+q.t+'.');}sfx('cash');
  return renderStocks('Sold '+fmt(r.n)+' '+q.t+' for $'+fmt(r.cash)+'. '+(r.pl>=0?'Profit $'+fmt(r.pl)+'. Nice.':'Loss $'+fmt(-r.pl)+'. Ouch.'));}
 const amt=act==='b0'?STK_BUY[0]:act==='b1'?STK_BUY[1]:p.wallet;const r=stkBuy(q.k,amt);
 if(typeof r==='string'){sfx('blip');return renderStocks(r==='poor'?'Not enough cash for one share.':'Not on the board.');}
 sfx('cash');renderStocks('Bought '+fmt(r.n)+' '+q.t+' for $'+fmt(r.cost)+(act==='all'?'. All in. Bold.':'.')+' Prices move after your next job.');}
function stkKey(e){const c=e.code;if(c==='Escape'||c==='Backspace'||c==='KeyI'){closeStocks();return;}
 if(c==='ArrowUp'||c==='ArrowLeft'||c==='KeyW'||c==='KeyA')stkSelect(STK_SEL-1);else if(c==='ArrowDown'||c==='ArrowRight'||c==='KeyS')stkSelect(STK_SEL+1);
 else if(c==='Enter'||c==='Space'||c==='Digit1'||c==='KeyB')stkAct(STK_SEL,'b0');else if(c==='Digit2')stkAct(STK_SEL,'b1');else if(c==='Digit3')stkAct(STK_SEL,'all');
 else if(c==='Digit4'||c==='KeyH')stkAct(STK_SEL,'half');else if(c==='Digit5'||c==='KeyX')stkAct(STK_SEL,'sell');else if(c==='KeyT')stkAct(STK_SEL,'tip');}
function stkPad(dir){if(pdown(1)||pdown(14)){closeStocks();return;}if(pdown(12)||dir<0)stkSelect(STK_SEL-1);else if(pdown(13)||dir>0)stkSelect(STK_SEL+1);
 else if(pdown(0))stkAct(STK_SEL,'b0');else if(pdown(3))stkAct(STK_SEL,'b1');else if(pdown(2))stkAct(STK_SEL,'sell');else if(pdown(5))stkAct(STK_SEL,'tip');else if(pdown(4))stkAct(STK_SEL,'half');}
{/* the car-menu button sits above McWEY TOWER */
 const b=document.createElement('button');b.className='btn alt';b.id='bCarStocks';$('bCarMcWey').before(b);b.onclick=()=>openStocks();
 $('sxList').addEventListener('click',e=>{const t=e.target.closest('button[data-act]');if(t){stkAct(+t.dataset.i,t.dataset.act);return;}const c=e.target.closest('.sxC');if(c&&+c.dataset.i!==STK_SEL){STK_SEL=+c.dataset.i;renderStocks('');}});
 $('sxTip').addEventListener('click',e=>{const t=e.target.closest('button[data-act]');if(t)stkAct(STK_SEL,'tip');});
 $('bStkLeave').onclick=()=>closeStocks();}
