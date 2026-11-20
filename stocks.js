'use strict';
/* THE DADE EXCHANGE: a 1986 stock market on the car menu (button THE DADE EXCHANGE, I, pad d-pad right). Your broker Chip Whitmore takes
   your calls from any payphone. Prices move once after every finished job (payout in index.html calls stkTick next to mallRent/empPay),
   so you trade before a job and see what happened when you get home: a random walk per stock, company news (good or bad), the odd market
   crash or boom, and the story: Kade Development climbs through Act 3 and dies with Dorian Kade, Vale Trust does the same in Act 4.
   - BUY / SELL shares (1% commission, min $10). Steady stocks pay a DIVIDEND after every job.
   - SHORT a stock to bet on it falling: you put up the money, win what it drops, lose what it climbs. At double your price it is a
     MARGIN CALL and the money is gone.
   - STOP-LOSS: sells for you after a job if the price falls 10% or 25% below where you set it.
   - Everglades Gold can go BUST: shares worthless, shorts paid in full, relisted a job later. Krugerrand gold climbs when the market crashes.
   - Chip sells a HOT TIP once a job ($500, right 62% of the time). People in the hubs pass on free RUMOURS now and then (right half the time).
   Everything lives in p.stk per operator: {day, px{k}, hist{k:[...]}, own{k:{n,cost}}, sh{k:{n,ent,coll}}, stop{k:{pct,at}}, tip, tipDay,
   rum, rumDay, real, ev{}, last[], news{k}, st{won,lost,div,trades,best,worst}}. */
const STK_LIST=[
 {k:'mcw',t:'MCW',name:'McWEY CORP.',sec:'HOTELS · REAL ESTATE',p0:42,mu:0.01,vol:0.045,div:0.012,col:'#ffd36b',desc:'The man himself. Slow, steady and gold-plated. Pays a dividend.'},
 {k:'gcc',t:'GCTV',name:'GOLD COAST CABLE',sec:'CABLE TV',p0:9,mu:0.018,vol:0.12,col:'#2de2e6',desc:'Forty channels and MTV. Everybody in Dade County wants cable.'},
 {k:'fla',t:'FLMA',name:'FLAMINGO AIRWAYS',sec:'AIRLINE',p0:24,mu:0.004,vol:0.09,col:'#ff5fb8',desc:'Miami to the islands, twice a day. Fuel prices bite.'},
 {k:'nep',t:'NEPT',name:'NEPTUNE CRUISE LINES',sec:'CRUISES',p0:31,mu:0.006,vol:0.07,div:0.01,col:'#7da8ff',desc:'Floating buffets out of the Port of Miami. Pays a dividend.'},
 {k:'sun',t:'SUNC',name:'SUNSHINE CITRUS',sec:'ORANGE GROVES',p0:14,mu:0.008,vol:0.06,div:0.008,col:'#ff9a3a',desc:'Florida orange juice. One cold night can ruin a year.'},
 {k:'gld',t:'GOLD',name:'KRUGERRAND GOLD',sec:'SAFE HAVEN',p0:340,mu:0.004,vol:0.03,haven:1,col:'#ffe28a',desc:'One ounce coins. Barely moves, and climbs when everything else crashes.'},
 {k:'egm',t:'EGLD',name:'EVERGLADES GOLD MINING',sec:'PENNY STOCK',p0:1.2,mu:-0.012,vol:0.3,bust:0.035,col:'#9fe8a8',desc:'Gold. In a swamp. Sold over the phone. It could go bust any day.'},
 {k:'kdv',t:'KDV',name:'KADE DEVELOPMENT',sec:'CONSTRUCTION',p0:18,mu:0.01,vol:0.08,col:'#f4f4f4',desc:'Dorian Kade is buying Ocean Drive one block at a time.',after:'c7',story:{rise:'c7',fall:'c10',lvl:10,ev:'kade',hit:0.85,
  head:'KADE DEVELOPMENT COLLAPSES',sub:'Dorian Kade found dead at his own tower site. KDV in free fall'}},
 {k:'vtb',t:'VTB',name:'VALE TRUST BANK',sec:'PRIVATE BANKING',p0:55,mu:0.01,vol:0.05,div:0.01,col:'#b08cff',desc:"Conrad Vale's bank. Very private. Very liquid. Very connected.",after:'c10',story:{rise:'c10',fall:'c13',lvl:13,ev:'vale',hit:0.8,
  head:'RUN ON VALE TRUST',sub:'Conrad Vale gone after a jet blows up at Opa-Locka. VTB crashes'}}];
/* company news: [headline, sign] picked at random when a stock has a big day */
const STK_NEWS={
 mcw:[['McWEY CORP. BUYS A HOTEL ON COLLINS',1],['McWEY TOWER ADDS TEN FLOORS',1],['CITY HALL PROBES McWEY PERMITS',-1],['McWEY CORP. MISSES ITS NUMBERS',-1]],
 gcc:[['GOLD COAST CABLE WIRES ALL OF HIALEAH',1],['GCTV SIGNS A DEAL WITH MTV',1],['GCTV OUTAGE: HURRICANE TAKES DOWN THE LINES',-1],['CABLE PIRATES COST GCTV MILLIONS',-1]],
 fla:[['FLAMINGO AIRWAYS ADDS FLIGHTS TO NASSAU',1],['OIL PRICES DROP: AIRLINES FLY HIGH',1],['FLAMINGO AIRWAYS PILOTS STRIKE',-1],['FAA GROUNDS FLAMINGO FLEET',-1]],
 nep:[['NEPTUNE CRUISES SOLD OUT ALL WINTER',1],['NEPTUNE LAUNCHES A NEW MEGASHIP',1],['FOOD POISONING ON THE S.S. NEPTUNE',-1],['NEPTUNE SHIP RUNS AGROUND OFF KEY WEST',-1]],
 sun:[['RECORD ORANGE HARVEST',1],['SUNSHINE CITRUS SIGNS A SODA DEAL',1],['FROST HITS THE GROVES',-1],['CITRUS CANKER FOUND IN POLK COUNTY',-1]],
 gld:[['SOVIET SALES SPOOK GOLD MARKET',-1],['GOLD HITS A THREE-YEAR HIGH',1],['DOLLAR SLIDES, GOLD SHINES',1],['SOUTH AFRICA SANCTIONS SQUEEZE KRUGERRANDS',1]],
 egm:[['EVERGLADES GOLD: "WE STRUCK A VEIN"',1],['PHONE BROKERS PUMP EGLD',1],['SEC RAIDS EVERGLADES GOLD',-1],['EGLD MINE IS JUST A SWAMP, SAYS GEOLOGIST',-1]],
 kdv:[['KADE WINS THE OCEAN DRIVE REZONING',1],['KADE BUYS ANOTHER ART DECO BLOCK',1],['PROTESTERS BLOCK KADE BULLDOZERS',-1],['KADE PERMITS UNDER REVIEW',-1]],
 vtb:[['VALE TRUST OPENS A BRANCH IN NASSAU',1],['VALE TRUST DEPOSITS UP 40%',1],['FEDS ASK WHERE VALE TRUST CASH COMES FROM',-1],['VALE TRUST AUDIT DELAYED',-1]]};
/* Chip's tips: where he heard it. Rumours: what people in the hubs say */
const STK_SRC=['My brother-in-law cleans the boardroom at','A guy on my racquetball team works at','I had drinks with a secretary from','The shoeshine at the Exchange swears by','My dentist plays golf with the boss of','I hear it from a fella inside'];
const STK_RUM=[[1,'Word is {t} is about to take off.'],[1,'My cousin says buy {t}. Big news coming.'],[1,'{t}? Going up. Trust me, I read the papers.'],[-1,'Heard {t} is in trouble. Real trouble.'],[-1,'Sell {t}, pal. Something stinks over there.'],[-1,'{t} is going down. You did not hear it from me.']];
const STK_TIP_COST=500,STK_TIP_TRUE=0.62,STK_RUM_TRUE=0.5,STK_RUM_CHANCE=0.22,STK_HIST=30,STK_BUY=[1000,10000],STK_STOPS=[0,0.1,0.25],STK_MARGIN=2;
let STK_SEL=0,STK_RNG=null;/* tests set STK_RNG to a function returning 0..1 */
const stkR=()=>STK_RNG?STK_RNG():Math.random();
function stkGauss(){let u=0,v=0;while(u===0)u=stkR();while(v===0)v=stkR();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
const stkDone=id=>typeof missionDone==='function'&&missionDone(id);
const stkListed=q=>!q.after||stkDone(q.after);
const stkQ=k=>STK_LIST.find(q=>q.k===k);
const stkPx=v=>v>=1?'$'+v.toFixed(2):'$'+v.toFixed(3);
const stkFee=v=>Math.max(10,Math.round(v*0.01));
const stkMoney=v=>(v>=0?'+$':'-$')+fmt(Math.abs(v));
const stkObj=(s,k)=>{if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))s[k]={};return s[k];};
function stkSave(p){p=p||myProg();let s=p.stk;if(!s||typeof s!=='object')s=p.stk={};
 if(typeof s.day!=='number')s.day=0;for(const k of ['px','hist','own','sh','stop','ev','news','st'])stkObj(s,k);if(typeof s.real!=='number')s.real=0;if(!Array.isArray(s.last))s.last=[];
 for(const k of ['won','lost','div','trades'])if(typeof s.st[k]!=='number')s.st[k]=0;
 for(const q of STK_LIST){/* old saves past a crash start the stock at its crashed price */
  if(!(s.px[q.k]>0)){let v=q.p0;if(q.story&&stkDone(q.story.fall)){v=Math.round(q.p0*(1-q.story.hit)*100)/100;s.ev[q.story.ev]=1;}s.px[q.k]=v;}
  if(!Array.isArray(s.hist[q.k])||!s.hist[q.k].length)s.hist[q.k]=[s.px[q.k]];}
 return s;}
function stkHeld(p,k){const o=stkSave(p).own[k];return o&&o.n>0?o:null;}
function stkShort(p,k){const o=stkSave(p).sh[k];return o&&o.n>0?o:null;}
const stkShVal=(o,px)=>Math.max(0,o.coll+(o.ent-px)*o.n);
function stkValue(p){const s=stkSave(p);let v=0;for(const q of STK_LIST){const o=s.own[q.k],h=s.sh[q.k];if(o&&o.n>0)v+=o.n*s.px[q.k];if(h&&h.n>0)v+=stkShVal(h,s.px[q.k]);}return v;}
function stkCost(p){const s=stkSave(p);let v=0;for(const q of STK_LIST){const o=s.own[q.k],h=s.sh[q.k];if(o&&o.n>0)v+=o.cost;if(h&&h.n>0)v+=h.coll;}return v;}
/* the book: every closed trade counts toward won / lost, the best and the worst */
function stkBook(s,pl,t){pl=Math.round(pl);s.real+=pl;s.st.trades++;if(pl>=0)s.st.won+=pl;else s.st.lost-=pl;
 if(!s.st.best||pl>s.st.best.pl)s.st.best={pl,t};if(!s.st.worst||pl<s.st.worst.pl)s.st.worst={pl,t};}
/* the day's move for every stock, after a finished job. lvl = the campaign floor just finished (or -1). Returns the change in value of
   what you hold (dividends included), and queues the headlines (empNote banners on the way home) */
function stkTick(p,lvl){const s=stkSave(p),v0=stkValue(p),heads=[],notes=[];s.day++;
 const r0=stkR();let mkt=0;
 if(r0<0.03){mkt=-(0.14+0.14*stkR());heads.push(['CRASH ON THE DADE EXCHANGE','Panic selling. Everything is down but gold',-1,null]);}
 else if(r0<0.07){mkt=0.07+0.07*stkR();heads.push(['BULL MARKET!','Wall Street is buying. Everything is up',1,null]);}
 /* the McWey bump when you square the loan at the Royal Flush */
 const mcBump=!s.ev.flush&&(lvl===7||stkDone('c7'));if(mcBump)s.ev.flush=1;
 s.news={};
 for(const q of STK_LIST){const k=q.k;let mu=q.mu,vol=q.vol;const st=q.story;let crash=false,bust=false;
  if(st){if(s.ev[st.ev]){mu=0.002;vol=0.2;}else if(lvl===st.lvl||stkDone(st.fall))crash=true;else if(stkDone(st.rise))mu=0.065;}
  let ret=mu+vol*stkGauss()+(q.haven?-mkt*0.6:mkt),head=null;
  if(!crash&&stkR()<0.07){const n=STK_NEWS[k],h=n[Math.floor(stkR()*n.length)%n.length];ret+=h[1]*(0.15+0.2*stkR());head=[h[0],q.t+' '+(h[1]>0?'jumps':'drops'),h[1],k];}
  if(k==='mcw'&&mcBump){ret+=0.12;head=['McWEY CORP. EXPANDS','Desmond McWey is buying up the beach. MCW climbs',1,k];}
  const tip=s.tip&&s.tip.k===k?s.tip:null,rum=!tip&&s.rum&&s.rum.k===k?s.rum:null;
  if(tip&&!crash)ret=tip.real?tip.dir*(0.18+0.22*stkR()):-tip.dir*(0.04+0.12*stkR());
  else if(rum&&!crash)ret=rum.real?rum.dir*(0.12+0.16*stkR()):-rum.dir*(0.04+0.1*stkR());
  if(q.bust&&!tip&&!rum&&!crash&&stkR()<q.bust){bust=true;head=['EVERGLADES GOLD GOES BUST','The mine was a swamp. EGLD shares are worthless',-1,k];}
  if(crash){ret=-st.hit;s.ev[st.ev]=1;head=[st.head,st.sub,-1,k];}
  ret=Math.max(-0.9,Math.min(1.5,ret));
  const old=s.px[k],sc=old<1?1000:100;let px=bust?0.01:Math.max(0.05,Math.round(old*(1+ret)*sc)/sc);
  if(bust){/* holders lose it all, shorts are paid in full; relisted at a fresh penny price */
   const o=s.own[k];if(o&&o.n>0){stkBook(s,-o.cost,q.t);notes.push(['EGLD WENT BUST','Your '+fmt(o.n)+' shares are worthless · -$'+fmt(o.cost)]);delete s.own[k];}
   const h=s.sh[k];if(h&&h.n>0){const pay=Math.round(h.coll+h.ent*h.n);p.wallet+=pay;stkBook(s,pay-h.coll,q.t);notes.push(['YOUR EGLD SHORT PAID OFF','+$'+fmt(pay-h.coll)+' on a dead stock']);delete s.sh[k];}
   delete s.stop[k];px=0.4+Math.round(stkR()*60)/100;}
  s.px[k]=px;const hh=s.hist[k];if(bust)hh.push(0.01);hh.push(px);if(hh.length>STK_HIST)hh.splice(0,hh.length-STK_HIST);
  if(head){s.news[k]=head[0];if(stkListed(q)||crash)heads.push(head);}}
 s.tip=null;s.rum=null;
 /* after the move: dividends, stop-losses, margin calls */
 let div=0;for(const q of STK_LIST){const k=q.k,px=s.px[k],o=s.own[k];
  if(o&&o.n>0&&q.div)div+=o.n*px*q.div;
  const sp=s.stop[k];if(sp&&o&&o.n>0&&px<=sp.at){const r=stkSellP(p,k,1);if(r!=='none')notes.push(['STOP-LOSS SOLD YOUR '+q.t,'Sold '+fmt(r.n)+' at '+stkPx(px)+' · '+stkMoney(r.pl)]);}
  if(sp&&!(s.own[k]&&s.own[k].n>0))delete s.stop[k];
  const h=s.sh[k];if(h&&h.n>0&&px>=h.ent*STK_MARGIN){stkBook(s,-h.coll,q.t);notes.push(['MARGIN CALL ON '+q.t,q.t+' doubled. Your short is gone · -$'+fmt(h.coll)]);delete s.sh[k];}}
 div=Math.round(div);if(div>0){p.wallet+=div;s.st.div+=div;}
 const d=Math.round(stkValue(p)-v0+div);
 s.last=heads.map(h=>h[0]).slice(0,6);
 if(typeof empNote==='function'){
  const mine=heads.filter(h=>!h[3]||stkHeld(p,h[3])||stkShort(p,h[3])||stkQ(h[3]).story);
  if(v0>0)empNote('YOUR STOCKS '+stkMoney(d),(mine[0]?mine[0][0]+' · ':'')+(div?'DIVIDENDS +$'+fmt(div):'THE DADE EXCHANGE'));
  else if(mine[0])empNote(mine[0][0],mine[0][1]);
  for(const n of notes.slice(0,2))empNote(n[0],n[1]);}
 return d;}
/* trades: buy about `amt` dollars of a stock (fee included), or sell a share of what you hold (1 = all, 0.5 = half) */
function stkBuy(k,amt){const p=myProg(),s=stkSave(p),q=stkQ(k);if(!q||!stkListed(q))return 'no';const px=s.px[k];
 const cash=Math.min(amt,p.wallet),n=Math.floor((cash-stkFee(cash))/px);if(n<1)return 'poor';
 const cost=n*px,fee=stkFee(cost),o=s.own[k]||(s.own[k]={n:0,cost:0});if(cost+fee>p.wallet)return 'poor';
 p.wallet-=Math.round(cost+fee);o.n+=n;o.cost+=cost+fee;saveProg();return {n,cost:Math.round(cost+fee)};}
function stkSellP(p,k,part){const s=stkSave(p),o=s.own[k];if(!o||!(o.n>0))return 'none';
 const n=part>=1?o.n:Math.max(1,Math.floor(o.n*part)),gross=n*s.px[k],fee=Math.min(stkFee(gross),Math.floor(gross)),cash=Math.round(gross-fee),basis=o.cost*n/o.n;
 p.wallet+=cash;o.n-=n;o.cost-=basis;if(o.n<=0){delete s.own[k];delete s.stop[k];}const pl=cash-basis;stkBook(s,pl,stkQ(k).t);saveProg();return {n,cash,pl:Math.round(pl)};}
const stkSell=(k,part)=>stkSellP(myProg(),k,part);
/* shorts: put up `amt` dollars against a stock; you get back that money plus what it falls (minus what it climbs) when you cover */
function stkShortOpen(k,amt){const p=myProg(),s=stkSave(p),q=stkQ(k);if(!q||!stkListed(q))return 'no';const px=s.px[k];
 if(q.story&&s.ev[q.story.ev])return 'dead';const cash=Math.min(amt,p.wallet),n=Math.floor((cash-stkFee(cash))/px);if(n<1)return 'poor';
 const coll=n*px,fee=stkFee(coll);if(coll+fee>p.wallet)return 'poor';const h=s.sh[k]||(s.sh[k]={n:0,ent:0,coll:0});
 h.ent=(h.ent*h.n+px*n)/(h.n+n);h.n+=n;h.coll+=coll;p.wallet-=Math.round(coll+fee);saveProg();return {n,cost:Math.round(coll+fee)};}
function stkCover(k){const p=myProg(),s=stkSave(p),h=s.sh[k];if(!h||!(h.n>0))return 'none';
 const val=stkShVal(h,s.px[k]),fee=Math.min(stkFee(h.n*s.px[k]),Math.floor(val)),cash=Math.round(val-fee),pl=cash-h.coll;
 p.wallet+=cash;delete s.sh[k];stkBook(s,pl,stkQ(k).t);saveProg();return {n:h.n,cash,pl:Math.round(pl)};}
/* stop-loss: cycles off, -10%, -25% from today's price */
function stkStop(k){const p=myProg(),s=stkSave(p);if(!stkHeld(p,k))return 'none';const cur=s.stop[k],i=cur?STK_STOPS.indexOf(cur.pct):0,nx=STK_STOPS[(i+1)%STK_STOPS.length];
 if(!nx)delete s.stop[k];else s.stop[k]={pct:nx,at:Math.round(s.px[k]*(1-nx)*1000)/1000};saveProg();return nx;}
function stkBuyTip(){const p=myProg(),s=stkSave(p);if(s.tip)return 'have';if(s.tipDay===s.day)return 'used';if(p.wallet<STK_TIP_COST)return 'poor';
 const L=STK_LIST.filter(q=>stkListed(q)&&!(q.story&&s.ev[q.story.ev]));const q=L[Math.floor(stkR()*L.length)%L.length];
 const held=stkHeld(p,q.k),dir=held&&stkR()<0.4?-1:stkR()<0.6?1:-1;
 p.wallet-=STK_TIP_COST;s.tip={k:q.k,dir,real:stkR()<STK_TIP_TRUE,src:Math.floor(stkR()*STK_SRC.length)%STK_SRC.length};s.tipDay=s.day;saveProg();return 'ok';}
function stkTipTxt(s){const t=s.tip;if(!t)return '';const q=stkQ(t.k);
 return `"${STK_SRC[t.src]} ${q.name}. ${t.dir>0?'After your next job, '+q.t+' goes UP. Big.':q.t+' is going DOWN after your next job. Sell it, or short it.'}"`;}
/* a free rumour from someone you chat to in a hub (npcTalk in index.html asks): at most one a job, about one in five chats */
function stkRumor(kind){if(typeof myProg!=='function'||!G||!G.def||!G.def.hub)return null;const p=myProg();if(!p)return null;const s=stkSave(p);
 if(s.rum||s.rumDay===s.day||stkR()>=STK_RUM_CHANCE)return null;
 const L=STK_LIST.filter(q=>stkListed(q)&&!(q.story&&s.ev[q.story.ev])&&!(s.tip&&s.tip.k===q.k));if(!L.length)return null;
 const q=L[Math.floor(stkR()*L.length)%L.length],R=STK_RUM[Math.floor(stkR()*STK_RUM.length)%STK_RUM.length];
 s.rum={k:q.k,dir:R[0],real:stkR()<STK_RUM_TRUE,line:R[1].replace('{t}',q.t),where:G.def.name||''};s.rumDay=s.day;saveProg();
 if(typeof banner==='function')setTimeout(()=>banner('A RUMOUR ABOUT '+q.t,'Your call. Trade it at THE DADE EXCHANGE'),1600);return s.rum.line;}

/* ---- the screen: the ticker tape, the chosen stock big (chart, position, actions), the board of all stocks, tips and rumours ---- */
function stkCarBtn(){const b=$('bCarStocks');if(!b)return;const p=myProg(),v=stkValue(p),c=stkCost(p);
 b.innerHTML='THE DADE EXCHANGE &middot; '+(v>0?'STOCKS $'+fmt(v)+' <span style="color:'+(v>=c?'#7dff9a':'#ff6a6a')+'">'+(v>=c?'+':'')+Math.round((v/c-1)*100)+'%</span>':'STOCKS &amp; TIPS')+'<span class="kbhint"> (I)</span><span class="padhint"> (&rarr;)</span>';}
function openStocks(){if(state!=='carmenu'||fading)return;sfx('ring');state='stocks';stkSave();const L=stkVisible();STK_SEL=Math.max(0,Math.min(STK_SEL,L.length-1));show('sStocks');renderStocks('Chip Whitmore here. What are we buying?');}
function closeStocks(){if(state!=='stocks')return;sfx('blip');openCarMenuForce();}
const stkVisible=()=>STK_LIST.filter(stkListed);
function stkChart(h,col,big,marks){const n=h.length,W=big?300:100,H=big?90:30;if(n<2)return `<svg class="${big?'sxBig':'sxSpark'}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"></svg>`;
 let lo=Math.min(...h),hi=Math.max(...h);for(const m of marks||[])if(m.v>0){lo=Math.min(lo,m.v);hi=Math.max(hi,m.v);}const sp=hi-lo||1,y=v=>(H-3-(v-lo)/sp*(H-6)).toFixed(1);
 const pts=h.map((v,i)=>(i/(n-1)*W).toFixed(1)+','+y(v)).join(' ');
 const fill=big?`<polygon points="0,${H} ${pts} ${W},${H}" fill="${col}" fill-opacity=".14"/>`:'';
 const lines=(marks||[]).filter(m=>m.v>0).map(m=>`<line x1="0" x2="${W}" y1="${y(m.v)}" y2="${y(m.v)}" stroke="${m.c}" stroke-width="1" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"/>`).join('');
 return `<svg class="${big?'sxBig':'sxSpark'}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${fill}${lines}<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="${big?2.5:2}" vector-effect="non-scaling-stroke"/></svg>`;}
const stkCh=(s,k)=>{const h=s.hist[k],px=s.px[k],prev=h.length>1?h[h.length-2]:px;return prev?(px/prev-1)*100:0;};
function stkCard(q,i,p,s){const px=s.px[q.k],ch=stkCh(s,q.k),o=s.own[q.k],h=s.sh[q.k],up=ch>=0,dead=q.story&&s.ev[q.story.ev];
 let pos='<span class="sxNone">—</span>';
 if(o&&o.n>0){const g=o.n*px-o.cost;pos=`OWN ${fmt(o.n)} <b class="${g>=0?'sxUp':'sxDn'}">${stkMoney(g)}</b>`;}
 if(h&&h.n>0){const g=stkShVal(h,px)-h.coll;pos=(o&&o.n>0?pos+' · ':'')+`SHORT <b class="${g>=0?'sxUp':'sxDn'}">${stkMoney(g)}</b>`;}
 return `<button class="sxC${i===STK_SEL?' sel':''}" data-i="${i}"><span class="sxTop"><span class="sxT" style="color:${q.col}">${q.t}</span><span class="sxP">${stkPx(px)} <b class="${up?'sxUp':'sxDn'}">${up?'▲':'▼'}${Math.abs(ch).toFixed(1)}%</b></span></span>
 <span class="emA">${q.name}${dead?' · BANKRUPT':''}</span>${stkChart(s.hist[q.k],up?'#7dff9a':'#ff6a6a')}<span class="sxOwn">${pos}</span></button>`;}
function stkDetail(q,p,s){const k=q.k,px=s.px[k],o=s.own[k],h=s.sh[k],sp=s.stop[k],hist=s.hist[k],ch=stkCh(s,k),up=ch>=0,i=STK_SEL,dead=q.story&&s.ev[q.story.ev];
 const btn=(a,t,dis,key)=>`<button class="btn sm sxGo${a.startsWith('s')&&a!=='stop'&&a!=='sell'?' sxSh':''}"${dis?' disabled':''} data-act="${a}" data-i="${i}">${t}${key?'<span class="kbhint"> ('+key+')</span>':''}</button>`;
 const poor=p.wallet<px+10,has=!!(o&&o.n>0),hs=!!(h&&h.n>0);
 const lo=Math.min(...hist),hi=Math.max(...hist),avg=has?o.cost/o.n:0;
 const rows=[];
 rows.push(`<b>${stkPx(px)}</b> <b class="${up?'sxUp':'sxDn'}">${up?'▲':'▼'}${Math.abs(ch).toFixed(1)}%</b> · ${hist.length}-DAY LOW ${stkPx(lo)} · HIGH ${stkPx(hi)}`);
 if(q.div)rows.push(`<span style="color:#ffd36b">DIVIDEND ${(q.div*100).toFixed(1)}% A JOB</span>`+(has?' · $'+fmt(o.n*px*q.div)+' NEXT JOB':''));
 if(has){const g=o.n*px-o.cost;rows.push(`YOU OWN ${fmt(o.n)} · PAID ${stkPx(avg)} EACH · WORTH $${fmt(o.n*px)} <b class="${g>=0?'sxUp':'sxDn'}">${stkMoney(g)}</b>`);}
 if(sp&&has)rows.push(`<span style="color:#ff9a3a">STOP-LOSS: SELLS IF IT FALLS TO ${stkPx(sp.at)} (−${sp.pct*100}%)</span>`);
 if(hs){const g=stkShVal(h,px)-h.coll;rows.push(`SHORT ${fmt(h.n)} AT ${stkPx(h.ent)} · PUT UP $${fmt(h.coll)} <b class="${g>=0?'sxUp':'sxDn'}">${stkMoney(g)}</b> · MARGIN CALL AT ${stkPx(h.ent*STK_MARGIN)}`);}
 if(s.news[k])rows.push(`<span style="color:#2de2e6">NEWS: ${s.news[k]}</span>`);
 const marks=[has?{v:avg,c:'#2de2e6'}:null,sp&&has?{v:sp.at,c:'#ff9a3a'}:null,hs?{v:h.ent,c:'#ff5fb8'}:null].filter(Boolean);
 return `<div class="sxDL"><div class="sxTop"><span class="sxT" style="color:${q.col}">${q.t} <span class="sxNm">${q.name}</span></span><span class="emA">${dead?'BANKRUPT':q.sec}</span></div>${stkChart(hist,up?'#7dff9a':'#ff6a6a',true,marks)}</div>
 <div class="sxDR"><div class="sxD">${q.desc}</div><div class="sxRows">${rows.map(r=>'<div>'+r+'</div>').join('')}</div>
 <div class="emBtns">${btn('b0','BUY $1K',poor,'1')}${btn('b1','BUY $10K',poor,'2')}${btn('all','ALL IN',poor,'3')}${btn('half','SELL HALF',!has,'4')}${btn('sell','SELL ALL',!has,'5')}</div>
 <div class="emBtns">${btn('s0','SHORT $1K',poor||dead,'Z')}${btn('s1','SHORT $10K',poor||dead)}${btn('cover','COVER SHORT',!hs,'C')}${btn('stop','STOP-LOSS: '+(sp&&has?'−'+sp.pct*100+'%':'OFF'),!has,'L')}</div></div>`;}
function renderStocks(msg){const p=myProg(),s=stkSave(p),L=stkVisible(),v=stkValue(p),c=stkCost(p);STK_SEL=Math.max(0,Math.min(STK_SEL,L.length-1));
 $('sxWallet').textContent='$'+fmt(p.wallet);
 $('sxPort').innerHTML=v>0?'STOCKS $'+fmt(v)+' <span style="color:'+(v>=c?'#7dff9a':'#ff6a6a')+'">'+stkMoney(v-c)+'</span>':'NO STOCKS YET';
 const st=s.st,best=st.best&&st.best.pl>0?' · BEST '+stkMoney(st.best.pl)+' '+st.best.t:'';
 $('sxSub').innerHTML='BROKER: CHIP WHITMORE · DAY '+(s.day+1)+'<span class="emCnt"> · '+(st.trades?'BANKED '+stkMoney(s.real)+best+(st.div?' · DIVIDENDS $'+fmt(st.div):''):'PRICES MOVE AFTER EVERY JOB')+'</span>';
 const tape=(s.last.length?s.last:['THE DADE EXCHANGE · MIAMI 1986']).concat(L.map(q=>q.t+' '+stkPx(s.px[q.k])+' '+(stkCh(s,q.k)>=0?'▲':'▼')+Math.abs(stkCh(s,q.k)).toFixed(1)+'%'));$('sxTape').textContent=tape.join('   ✦   ');
 $('sxDetail').innerHTML=L[STK_SEL]?stkDetail(L[STK_SEL],p,s):'';
 $('sxList').innerHTML=L.map((q,i)=>stkCard(q,i,p,s)).join('');
 let tb=s.tip?`<div class="sxTipT">${stkTipTxt(s)}</div>`:`<button class="btn sm sxGo" data-act="tip"${s.tipDay===s.day||p.wallet<STK_TIP_COST?' disabled':''}>${s.tipDay===s.day?'NO MORE TIPS TODAY':'BUY A HOT TIP $'+STK_TIP_COST}<span class="kbhint"> (T)</span><span class="padhint"> (RB)</span></button><span class="sxTipN">Chip hears things. He is right more often than not.</span>`;
 if(s.rum)tb+=`<div class="sxTipT sxRum">RUMOUR${s.rum.where?' FROM '+s.rum.where:''}: "${s.rum.line}"</div>`;
 $('sxTip').innerHTML=tb;$('sxMsg').textContent=msg||'';
 const el=$('sxList').querySelector('.sxC.sel');if(el&&el.scrollIntoView)try{el.scrollIntoView({block:'nearest'});}catch(e){}}
function stkSelect(i){const n=stkVisible().length;STK_SEL=(i+n)%n;sfx('blip');renderStocks('');}
const STK_SAY={poor:'Not enough cash for one share.',no:'Not on the board.',dead:'Nobody will lend you a dead stock to short.',none:'You have nothing to sell there.'};
function stkAct(i,act){if(state!=='stocks'||fading)return;const p=myProg();
 if(act==='tip'){const r=stkBuyTip();sfx(r==='ok'?'cash':'blip');return renderStocks(r==='ok'?'That one cost you $'+STK_TIP_COST+'. Your call what you do with it.':r==='poor'?'Tips cost money, pal.':'One tip a day. Go do a job.');}
 const q=stkVisible()[i];if(!q)return;STK_SEL=i;let r,say;
 if(act==='sell'||act==='half'){r=stkSell(q.k,act==='sell'?1:0.5);if(typeof r!=='string')say='Sold '+fmt(r.n)+' '+q.t+' for $'+fmt(r.cash)+'. '+(r.pl>=0?'Profit $'+fmt(r.pl)+'. Nice.':'Loss $'+fmt(-r.pl)+'. Ouch.');}
 else if(act==='s0'||act==='s1'){r=stkShortOpen(q.k,STK_BUY[act==='s0'?0:1]);if(typeof r!=='string')say='Shorted '+fmt(r.n)+' '+q.t+' with $'+fmt(r.cost)+'. You win if it falls. If it doubles, you lose it all.';}
 else if(act==='cover'){r=stkCover(q.k);if(typeof r!=='string')say='Covered your '+q.t+' short: $'+fmt(r.cash)+' back. '+(r.pl>=0?'Profit $'+fmt(r.pl)+'.':'Loss $'+fmt(-r.pl)+'.');}
 else if(act==='stop'){r=stkStop(q.k);if(r!=='none'){sfx('blip');return renderStocks(r?'Stop-loss set. If '+q.t+' falls '+r*100+'% after a job, I sell it for you.':'Stop-loss off. You ride it all the way.');}}
 else{r=stkBuy(q.k,act==='b0'?STK_BUY[0]:act==='b1'?STK_BUY[1]:p.wallet);if(typeof r!=='string')say='Bought '+fmt(r.n)+' '+q.t+' for $'+fmt(r.cost)+(act==='all'?'. All in. Bold.':'.')+' Prices move after your next job.';}
 if(typeof r==='string'){sfx('blip');return renderStocks(STK_SAY[r]||'');}
 sfx('cash');renderStocks(say);}
function stkKey(e){const c=e.code;if(c==='Escape'||c==='Backspace'||c==='KeyI'){closeStocks();return;}
 const K={Enter:'b0',Space:'b0',KeyB:'b0',Digit1:'b0',Digit2:'b1',Digit3:'all',Digit4:'half',KeyH:'half',Digit5:'sell',KeyX:'sell',KeyZ:'s0',KeyC:'cover',KeyL:'stop',KeyT:'tip'};
 if(c==='ArrowUp'||c==='ArrowLeft'||c==='KeyW'||c==='KeyA')stkSelect(STK_SEL-1);else if(c==='ArrowDown'||c==='ArrowRight'||c==='KeyS')stkSelect(STK_SEL+1);else if(K[c])stkAct(STK_SEL,K[c]);}
function stkPad(dir){if(pdown(1)||pdown(14)){closeStocks();return;}if(pdown(12)||dir<0)stkSelect(STK_SEL-1);else if(pdown(13)||dir>0)stkSelect(STK_SEL+1);
 else if(pdown(0))stkAct(STK_SEL,'b0');else if(pdown(3))stkAct(STK_SEL,'b1');else if(pdown(2))stkAct(STK_SEL,'sell');else if(pdown(5))stkAct(STK_SEL,'tip');
 else if(pdown(4))stkAct(STK_SEL,'s0');else if(pdown(7))stkAct(STK_SEL,'cover');else if(pdown(6))stkAct(STK_SEL,'stop');}
{/* the car-menu button sits above McWEY TOWER */
 const b=document.createElement('button');b.className='btn alt';b.id='bCarStocks';$('bCarMcWey').before(b);b.onclick=()=>openStocks();
 $('sxList').addEventListener('click',e=>{const c=e.target.closest('.sxC');if(c&&+c.dataset.i!==STK_SEL){STK_SEL=+c.dataset.i;sfx('blip');renderStocks('');}});
 $('sxDetail').addEventListener('click',e=>{const t=e.target.closest('button[data-act]');if(t&&!t.disabled)stkAct(+t.dataset.i,t.dataset.act);});
 $('sxTip').addEventListener('click',e=>{const t=e.target.closest('button[data-act]');if(t&&!t.disabled)stkAct(STK_SEL,'tip');});
 $('bStkLeave').onclick=()=>closeStocks();}
