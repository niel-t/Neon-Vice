'use strict';
/* NINE OF NINE'S: the gun shop screen, Nine's close-up scene, the bunker's rooms and the shooting range.
   The shop screen is a gun-store catalogue you scroll: sections down the left, one row per weapon, and a card with
   stat bars, attachments, ammo, the price and TRY AT THE RANGE. Nine's close-up turns the selected piece on the counter.
   The bunker hub is a real shop: showroom, counter, armoury, workshop and a hallway in the west two thirds,
   a three-lane shooting range in the east third. Step up to the firing line to shoot; free range ammo; walk away and
   Nine's boy takes any loaner back.
   Loaded after cars.js, before the main inline script: nothing here touches main-script globals at load time. */
const NINE_INTRO="Hello, my friend! I am Nine, last name also Nine, and I bring you exotic machinery of death. Very ludicrous. Only at Nine of Nines.";
const NINE_HI=["Ah, my friend returns! Capitalism is beautiful, da?","Every piece I calibrate personally, with mathematics.","Is not a gun. Is a statement, written in lead.","Nine guns of ten are boring. I sell you the tenth.","Today's selection is very ludicrous. I am proud."];
const NINE_BUY=["Excellent choice. Very ballistic.","Da! Treat her well, she is temperamental.","You have taste. Dangerous taste.","Pleasure doing business. Mostly the pleasure is mine."];
const NINE_EXCL="Ah, you choose the exclusive! This one I smuggle through three borders and past one very angry customs officer.";
const NINE_POOR="My friend, this costs more than you have. I am sorry, but is simple arithmetic.";
const NINE_SELL=['Is good piece. I give you fair price. Fair for me.','Da, I find her a new home. A worse one, probably.','Forty percent. Is not robbery, is economics.'];
const NINE_TRY=['Go, try her at the range. Ammunition is on the house. The house is me.','Lane two, my friend. Shoot paper, not my cousin.','Try before you buy. Is very American, I love it.'];
const NINE_BACK=['My boy takes her back. Come, buy her properly.','Is good, da? Now you know. Now you pay.','Paper is dead. Very convincing.'];
const SHOPP={pistol:1500,silenced:2200,revolver:2800,dual:3200,smg:3500,shotgun:3800,double:4200,m16:5200,bat:600,knife:500,machete:900,katana:7500,tknife:1100,golddeagle:12000,goldak:15000,goldgl:20000};
const WDESC={pistol:'Reliable. Boring. Like a Swiss watch.',silenced:'For conversations nobody hears.',revolver:'Six chances. Goes through three men.',dual:'Two pistols, twice the opinions.',smg:'Sprays the room like cologne.',shotgun:'Seven pellets of diplomacy.',double:'Two shells. One argument.',m16:'Three-round bursts, through walls.',bat:'Silent. Swings. Home run.',knife:'Close, quiet, personal.',tknife:'Four blades. Silent across the room. Go pick them up after.',machete:'For cutting through the paperwork.',
 katana:'Folded nine hundred times. By me. On a Tuesday.',goldgl:'I acquire it from a very wet gentleman. Six gold grenades.',golddeagle:'Two solid-gold hand cannons. Through walls, through men.',goldak:'Solid gold. Fully automatic. Zero subtlety.'};
const EXCL=['goldak','golddeagle','katana'];
/* the catalogue: weapon sections first, then attachments, ammo and armour, and selling */
const SHOP_SECS=[{id:'hand',name:'HANDGUNS',w:['pistol','silenced','revolver','dual','golddeagle']},{id:'long',name:'SMG & RIFLES',w:['smg','m16','goldak']},
 {id:'shot',name:'SHOTGUNS & HEAVY',w:['shotgun','double','goldgl']},{id:'melee',name:'MELEE & THROWN',w:['knife','bat','machete','tknife','katana']},
 {id:'mods',name:'ATTACHMENTS'},{id:'gear',name:'AMMO & ARMOUR'},{id:'sell',name:'SELL TO NINE'}];
const SHOP_KIND={hand:'HANDGUN',long:'AUTOMATIC',shot:'SHOTGUN',melee:'MELEE'};
const MOD_GUN={supp:'pistol',xmag:'smg',sling:null};
const MOD_INFO={supp:'Screws onto the 9MM PISTOL. Its shots go quiet: nobody in the next room hears them.',xmag:'Clips into the UZI. 48 rounds a magazine instead of 32.',sling:'For every gun you carry. Switching weapons takes a blink instead of a breath.'};
const DEAL_OFF=0.2;
const rangeOK=t=>!!WD[t]&&!WD[t].melee&&!WD[t].toss&&!WD[t].nade;
let shopSayT=null,shopDone=null,shopRows=[],shopSel=1,sellArm=null,shopPadT=0,shopShowT=0;
/* stock: every regular piece is always on the shelf; each job Nine rolls three pieces, the regular ones go 20% off
   (TODAY'S DEALS) and an exclusive among them is the one he can actually sell you this time */
function rollStock(a){const ex=EXCL.concat(myProg().lexDead?['goldgl']:[]),pool=Object.keys(SHOPP).filter(k=>!ex.includes(k)&&k!=='goldgl').sort(()=>Math.random()-0.5),st=pool.slice(0,3);if(Math.random()<(myProg().lexDead?0.5:0.35))st[Math.random()*3|0]=pick(ex);a.stock=st;a.key=a.jobs;}
function shopAvail(t){return !WD[t].excl||arm().stock.includes(t);}
function shopDeal(t){return !WD[t].excl&&arm().stock.includes(t);}
function shopPrice(t){const p=SHOPP[t]||0;return shopDeal(t)?Math.round(p*(1-DEAL_OFF)/50)*50:p;}
function shopReady(){const m=document.getElementById('shMain');return !!m&&!m.classList.contains('hid');}
function shopType(t,done){clearInterval(shopSayT);const el=$('shSay');let i=0;el.textContent='';shopDone=done||null;
 const fin=()=>{clearInterval(shopSayT);nineTalk=false;el.textContent=t;const f=shopDone;shopDone=null;if(f)f();};el.onclick=fin;
 nineTalk=true;shopSayT=setInterval(()=>{i++;el.textContent=t.slice(0,i);if(i%2===0)sfx('type');if(i>=t.length)fin();},22);}
function openShop(){if(state!=='play'||!G)return;const a=arm();if(a.key!==a.jobs||a.stock.length!==3)rollStock(a);const first=!a.met;a.met=true;saveProg();
 state='shop';sellArm=null;shopRows=[];shopSel=1;show('sShop');sfx('ring');renderShop();$('shMain').classList.toggle('hid',first);
 shopType(first?NINE_INTRO:pick(NINE_HI),()=>{$('shMain').classList.remove('hid');shopScroll();});}
function closeShop(quiet){if(state!=='shop')return;clearInterval(shopSayT);shopDone=null;nineTalk=false;sfx('blip');state='play';show(null);const g=G;if(g.park){g.car={x:g.park.x,z:g.park.z};g.obj='BACK TO YOUR CAR';}
 if(quiet)return;const n=g.npcs.find(q=>q.kind==='nine');if(n)popup(n.x,n.z,pick(['Do svidaniya, my friend.','Come back alive. Dead customers do not tip.','Shoot responsibly. Or not. Is your business.']),'#ffe9a8');}
/* Nine's (W6d): a purchase goes into the kit when there is room, otherwise it is driven to the apartment locker; ammo and bigger stashes for every caliber you own;
   armour bought, repaired or upgraded (the old vest is traded in); anything you own sold for SELL_FRAC of its price, two clicks so a stray tap can't sell a gun */
function kitGun(k){return k.guns[k.active]||k.guns[1-k.active]||null;}
function kitHas(k,t){return k.guns.some(g=>g&&g.type===t)||k.melee===t;}
function lockerHas(t){return myProg().locker.items.some(i=>i.type===t);}
function ownCals(){const k=kit(),o=[];for(const it of [k.guns[k.active],k.guns[1-k.active],...myProg().locker.items]){const c=it&&it.type&&WD[it.type]&&WD[it.type].cal;if(isCal(c)&&!o.includes(c))o.push(c);}return o;}
function itemName(it){return it.armour?ARMOUR[it.armour].name:WD[it.type].name;}
function itemPrice(it){return it.armour?ARMOUR[it.armour].price:SHOPP[it.type]||0;}
function upgPrice(k,c){return CAL[c].price*3*(1+((k.upg||{})[c]|0));}
/* ---- the catalogue rows ---- */
function shopBuildRows(){const k=kit(),pr=myProg(),a=arm(),R=[];
 for(const s of SHOP_SECS){const it=[];
  if(s.w){for(const t of s.w){if(t==='goldgl'&&!pr.lexDead&&!a.stock.includes(t))continue;it.push({k:'w',t});}}
  else if(s.id==='mods'){for(const m of Object.keys(MODS))it.push({k:'mod',m});}
  else if(s.id==='gear'){const cs=ownCals();if(!cs.length)it.push({k:'ammo',c:null});for(const c of cs)it.push({k:'ammo',c});it.push({k:'vest'});if(!(k.armour&&k.armour.type==='carrier'))it.push({k:'carrier'});for(const c of cs)it.push({k:'stash',c});if(k.guns[0]&&k.guns[1])it.push({k:'swap'});}
  else{for(const [sl,id] of [[0,'k0'],[1,'k1'],['melee','kmelee'],['armour','karmour']]){const o=itemOfSlot(k,sl);if(o)it.push({k:'sell',id,it:o,home:false});}pr.locker.items.forEach((o,i)=>it.push({k:'sell',id:'l'+i,it:o,home:true}));if(!it.length)it.push({k:'none'});}
  R.push({h:1,sec:s.id,name:s.name});for(const q of it){q.sec=s.id;R.push(q);}}
 return R;}
const rowKey=q=>q.k+':'+(q.t||q.m||q.c||q.id||'');
function shopStats(t){const w=WD[t];if(!w)return [];if(w.melee){const one=w.kill?1:0.35;return [['DAMAGE',one],['SPEED',clamp(0.25/w.cd,0,1)],['REACH',clamp(w.range/1.5,0,1)],['SWING ARC',clamp((w.arc||1)/1.35,0,1)]];}
 if(w.toss)return [['DAMAGE',0.9],['FIRE RATE',clamp(1/w.cd/14,0,1)],['ACCURACY',0.85],['PENETRATION',0.33],['CAPACITY',w.mag/48]];
 const e=w.nade?3000:(CAL[w.cal].e0||0)*(w.pel||1)*(w.eMul||1),rate=w.burst3?9.4:1/w.cd;
 return [['DAMAGE',clamp(Math.sqrt(e/3000),0.08,1)],['FIRE RATE',clamp(rate/14,0.06,1)],['ACCURACY',clamp(1-w.spr/0.4,0.08,1)],['PENETRATION',w.nade?1:clamp((w.pierce||1)/3,0,1)],['CAPACITY',clamp(w.mag/48,0.04,1)]];}
function rowLabel(q){const k=kit();
 if(q.k==='w'){const w=WD[q.t],own=kitHas(k,q.t),home=lockerHas(q.t);let p=own?'IN YOUR KIT':!shopAvail(q.t)?'NEXT SHIPMENT':'$'+fmt(shopPrice(q.t));if(!own&&home&&shopAvail(q.t))p+=' · 1 AT HOME';return {n:w.name,p,tag:w.excl?(shopAvail(q.t)?'EXCLUSIVE':''):shopDeal(q.t)?'DEAL':''};}
 if(q.k==='mod'){const M=MODS[q.m];return {n:M.name,p:hasMod(q.m)?'FITTED':'$'+fmt(M.price)};}
 if(q.k==='ammo'){if(!q.c)return {n:'AMMO',p:'NEEDS A GUN'};const C=CAL[q.c];return {n:'AMMO · '+C.name,p:(k.pool[q.c]|0)+'/'+capOf(k,q.c)+' · $'+fmt(C.price)};}
 if(q.k==='stash')return {n:'BIGGER '+CAL[q.c].name+' STASH',p:'$'+fmt(upgPrice(k,q.c))};
 if(q.k==='vest'){const ar=k.armour&&ARMOUR[k.armour.type];return {n:!ar?'KEVLAR VEST':'REPAIR '+ar.name,p:ar&&k.armour.plates>=ar.plates?'READY':'$'+fmt(ar?ar.repair:ARMOUR.vest.price)};}
 if(q.k==='carrier'){const ar=k.armour&&ARMOUR[k.armour.type];return {n:(ar?'TRADE UP: ':'')+ARMOUR.carrier.name,p:'$'+fmt(ARMOUR.carrier.price-(ar?sellValue({armour:k.armour.type,plates:k.armour.plates},ar.price):0))};}
 if(q.k==='swap')return {n:'SWAP GUNS',p:'FREE'};
 if(q.k==='sell')return {n:itemName(q.it)+(q.home?' · HOME':''),p:'+$'+fmt(sellValue(q.it,itemPrice(q.it)))};
 return {n:'NOTHING TO SELL',p:''};}
function rowIcon(q){return q.k==='w'?q.t:q.k==='mod'?(MOD_GUN[q.m]||'m16'):q.k==='sell'&&!q.it.armour?q.it.type:null;}
function renderShop(){const prev=shopRows[shopSel]&&rowKey(shopRows[shopSel]);shopRows=shopBuildRows();let i=prev?shopRows.findIndex(q=>!q.h&&rowKey(q)===prev):-1;
 if(i<0)i=Math.min(shopSel,shopRows.length-1);while(i>0&&shopRows[i]&&shopRows[i].h)i++;if(!shopRows[i]||shopRows[i].h)i=1;shopSel=i;
 $('shWallet').textContent='$'+fmt(wallet());
 $('shList').innerHTML=shopRows.map((q,j)=>{if(q.h)return `<div class="gsH" data-sec="${q.sec}">${q.name}</div>`;const L=rowLabel(q),ic=rowIcon(q),ex=q.k==='w'&&WD[q.t].excl,lock=q.k==='w'&&!shopAvail(q.t),own=q.k==='w'&&kitHas(kit(),q.t)||q.k==='mod'&&hasMod(q.m);
  return `<button class="gsR${ex?' ex':''}${lock?' lock':''}${own?' own':''}" data-i="${j}" data-row="${rowKey(q)}"${q.k==='w'?` data-k="${q.t}"`:''}>${ic?`<canvas class="gsI" width="60" height="22" data-w="${ic}"></canvas>`:'<span class="gsI"></span>'}<span class="gsN">${L.n}${L.tag?` <b class="gsTag${L.tag==='DEAL'?' deal':''}">${L.tag==='DEAL'?'-'+Math.round(DEAL_OFF*100)+'%':L.tag}</b>`:''}</span><span class="gsP">${L.p}</span></button>`;}).join('');
 for(const cv of $('shList').querySelectorAll('canvas')){const t=cv.dataset.w;drawIcon(cv.getContext('2d'),t,4,3,3.4,WD[t]&&WD[t].excl?'#ffd36b':'#f4ecff');}
 $('shTabs').innerHTML=SHOP_SECS.map(s=>`<button data-tab="${s.id}">${s.name}</button>`).join('');
 $('shLoad').textContent=loadoutTxt();shopSelect(shopSel,true);}
/* move the highlight without rebuilding the list; the card and the 3D showcase follow the selection */
function shopSelect(i,keep){const q=shopRows[i];if(!q||q.h)return;if(i!==shopSel){sellArm=null;shopShowT=0;}shopSel=i;
 for(const b of $('shList').querySelectorAll('.gsR'))b.classList.toggle('sel',+b.dataset.i===i);
 for(const b of $('shTabs').querySelectorAll('button'))b.classList.toggle('on',b.dataset.tab===q.sec);
 $('shDetail').innerHTML=shopCard(q);shopScroll(keep);}
function shopScroll(){const L=$('shList'),r=L&&L.querySelector('.gsR.sel');if(!r)return;const top=r.offsetTop-L.offsetTop,h=r.offsetHeight;
 /* keep the section header in view when the first row of a section is picked */
 const hdr=r.previousElementSibling&&r.previousElementSibling.classList.contains('gsH')?r.previousElementSibling.offsetHeight:0;
 if(top-hdr<L.scrollTop)L.scrollTop=top-hdr;else if(top+h>L.scrollTop+L.clientHeight)L.scrollTop=top+h-L.clientHeight;}
const KEYH=(k,p)=>`<span class="kbhint"> (${k})</span><span class="padhint"> (${p})</span>`;
function shopBars(t){const cur=kitGun(kit()),cs=cur&&cur.type!==t?shopStats(cur.type):null;
 return '<div class="gsBars">'+shopStats(t).map(([n,v],i)=>{const c=cs&&cs[i]&&cs[i][0]===n?cs[i][1]:null;return `<div class="gsBar"><span>${n}</span><i><b style="width:${Math.round(v*100)}%"></b>${c!==null?`<u style="left:${Math.round(c*100)}%"></u>`:''}</i></div>`;}).join('')+'</div>'+(cs?`<div class="gsCmp">| = YOUR ${WD[cur.type].name}</div>`:'');}
function shopCard(q){const k=kit(),pr=myProg();
 if(q.k==='w'){const t=q.t,w=WD[t],own=kitHas(k,t),av=shopAvail(t),sec=SHOP_SECS.find(s=>s.id===q.sec),n=((pr.mast||{})[t])|0,ml=mastLv(t);
  const sub=(w.excl?'NINE EXCLUSIVE · ':'')+(w.toss?'THROWN':SHOP_KIND[sec.id]||'')+(w.cal?' · '+CAL[w.cal].name:'')+(w.melee?' · ONE-HIT KILL':' · MAG '+w.mag)+(w.pierce>1?' · PIERCES '+w.pierce:'');
  const mods=Object.keys(MODS).filter(m=>!w.melee&&!w.toss&&(MOD_GUN[m]===t||!MOD_GUN[m])).map(m=>`<button data-x="mod" data-c="${m}"${hasMod(m)?' class="on"':''}>${MODS[m].name}${hasMod(m)?' · FITTED':' $'+fmt(MODS[m].price)}</button>`).join('');
  const ammo=w.cal&&isCal(w.cal)&&ownCals().includes(w.cal)?`<button data-x="ammo" data-c="${w.cal}"${(k.pool[w.cal]|0)>=capOf(k,w.cal)?' class="on"':''}>AMMO +${CAL[w.cal].box} $${fmt(CAL[w.cal].price)} (${k.pool[w.cal]|0}/${capOf(k,w.cal)})${KEYH('F','Y')}</button>`:'';
  const mast=w.toss?'':`<div class="gsM">MASTERY ${ml?ROMAN[ml]:'-'} · ${n} KILLS${ml<3?' · '+ROMAN[ml+1]+' AT '+MAST[ml]+': '+MASTD[ml+1]:' · GOLD FINISH'}</div>`;
  const buy=own?'IN YOUR KIT':!av?'NEXT SHIPMENT':'BUY $'+fmt(shopPrice(t))+(shopDeal(t)?` <s>$${fmt(SHOPP[t])}</s>`:'');
  return `<div class="gsDT">${w.name}</div><div class="gsDS">${sub}</div><div class="gsQ">"${WDESC[t]||''}"</div>${shopBars(t)}${mast}${mods||ammo?`<div class="gsX">${mods}${ammo}</div>`:''}
   <div class="gsA"><button class="btn${own?' alt':''}" id="shBuy" data-act="buy"${!av&&!own?' disabled':''}>${buy}${KEYH('ENTER','A')}</button>${rangeOK(t)&&av?`<button class="btn alt" id="shTry" data-act="try">TRY AT THE RANGE${KEYH('T','X')}</button>`:''}</div>`;}
 const L=rowLabel(q),act=(lbl,attr)=>`<div class="gsA"><button class="btn" id="shBuy" ${attr}>${lbl}${KEYH('ENTER','A')}</button></div>`;
 if(q.k==='mod'){const M=MODS[q.m],g=MOD_GUN[q.m];return `<div class="gsDT">${M.name}</div><div class="gsDS">ATTACHMENT · ${g?'FITS THE '+WD[g].name:'FITS EVERY GUN'} · BOUGHT ONCE, ALWAYS FITTED</div><div class="gsQ">${MOD_INFO[q.m]}</div>`+act(hasMod(q.m)?'FITTED':'BUY $'+fmt(M.price),`data-x="mod" data-c="${q.m}"`);}
 if(q.k==='ammo'){if(!q.c)return `<div class="gsDT">AMMO</div><div class="gsQ">Bullets need a gun, my friend. Buy one first.</div>`;const C=CAL[q.c];return `<div class="gsDT">${C.name} AMMO</div><div class="gsDS">+${C.box} ROUNDS A BOX · YOU CARRY ${k.pool[q.c]|0}/${capOf(k,q.c)}</div><div class="gsQ">Fresh rounds. Still warm from the factory.</div>`+act('BUY $'+fmt(C.price),`data-x="ammo" data-c="${q.c}"`);}
 if(q.k==='stash'){const C=CAL[q.c];return `<div class="gsDT">BIGGER ${C.name} STASH</div><div class="gsDS">CARRY +${C.up} MORE ${C.name} · NOW ${capOf(k,q.c)}</div><div class="gsQ">More pouches. You rattle with confidence.</div>`+act('BUY $'+fmt(upgPrice(k,q.c)),`data-x="upg" data-c="${q.c}"`);}
 if(q.k==='vest'||q.k==='carrier'){const A2=q.k==='vest'?ARMOUR.vest:ARMOUR.carrier;return `<div class="gsDT">${L.n}</div><div class="gsDS">ARMOUR · ${A2.plates} PLATE${A2.plates>1?'S':''}</div><div class="gsQ">${q.k==='vest'?'Kevlar. It stops one bullet. After that, it is just a nice shirt.':'Ceramic plates, front and back. You walk a little slower, you live a little longer.'}</div>`+act(L.p==='READY'?'READY':(q.k==='vest'?'BUY ':'TRADE UP ')+L.p+'',`data-x="${q.k}"`);}
 if(q.k==='swap')return `<div class="gsDT">SWAP GUNS</div><div class="gsQ">Your other gun goes in your hands first.</div>`+act('SWAP','data-x="swap"');
 if(q.k==='sell')return `<div class="gsDT">SELL ${itemName(q.it)}</div><div class="gsDS">${q.home?'FROM YOUR APARTMENT LOCKER':'FROM YOUR KIT'} · ${Math.round(SELL_FRAC*100)}% OF ITS PRICE</div><div class="gsQ">Is good piece. I give you fair price. Fair for me.</div>`+act((sellArm===q.id?'SURE? SELL FOR ':'SELL FOR ')+L.p,`data-s="${q.id}"${sellArm===q.id?' class="btn on"':''}`);
 return `<div class="gsDT">NOTHING TO SELL</div><div class="gsQ">Empty pockets, my friend. Is very relaxing.</div>`;}
function shopMove(d){if(!shopReady())return;let i=shopSel;for(let n=0;n<shopRows.length;n++){i=(i+d+shopRows.length)%shopRows.length;if(!shopRows[i].h)break;}sfx('blip');shopSelect(i);}
function shopJump(d){if(!shopReady())return;const cur=SHOP_SECS.findIndex(s=>s.id===shopRows[shopSel].sec),n=SHOP_SECS.length;for(let s=1;s<=n;s++){const id=SHOP_SECS[(cur+d*s+n*4)%n].id,i=shopRows.findIndex(q=>!q.h&&q.sec===id);if(i>=0){sfx('blip');shopSelect(i);return;}}}
function shopTab(id){const i=shopRows.findIndex(q=>!q.h&&q.sec===id);if(i>=0){sfx('blip');shopSelect(i);}}
function shopAct(){const b=$('shBuy');if(b&&!b.disabled)b.click();}
function shopPick(t){if(state!=='shop'||!shopReady())return;const k=kit(),pr=myProg();
 if(kitHas(k,t)){const s=k.guns.findIndex(g=>g&&g.type===t);if(s>=0&&s!==k.active){k.active=s;saveProg();sfx('pick');renderShop();}shopType('She is already in your hands, my friend.');return;}
 if(!shopAvail(t)){sfx('blip');shopType('This one comes with the next shipment, my friend. Patience. Customs are slow.');return;}
 const c=shopPrice(t);if(pr.wallet<c){sfx('blip');shopType(NINE_POOR);return;}const w=WD[t];
 const r=kitReceive(k,pr.locker,{type:t,mag:w.melee?0:w.mag});
 if(!r){sfx('blip');shopType('Your hands are full and your locker is full, my friend. Sell something. Or carry less.');return;}
 pr.wallet-=c;saveProg();sfx('cash');renderShop();shopType(r==='locker'?'Your hands are full, so my boy drives her to your apartment. She waits in your locker.':w.excl?NINE_EXCL:pick(NINE_BUY));}
function shopSellPick(id){if(state!=='shop'||!shopReady())return;if(sellArm!==id){sellArm=id;sfx('blip');shopSelect(shopSel,true);return;}
 const k=kit(),pr=myProg(),kin=id[0]==='k',s=kin?({k0:0,k1:1,kmelee:'melee',karmour:'armour'})[id]:+id.slice(1);
 const it=kitSell(k,pr.locker,kin?'kit':'locker',s);sellArm=null;if(!it){renderShop();return;}
 pr.wallet+=sellValue(it,itemPrice(it));saveProg();sfx('cash');renderShop();shopType(pick(NINE_SELL));}
function shopExtra(t,cal){if(state!=='shop'||!shopReady())return;const k=kit(),pr=myProg();let say;
 if(t==='swap'){if(k.guns[0]&&k.guns[1]){k.active=1-k.active;saveProg();sfx('pick');renderShop();}return;}
 if(t==='mod'){const M=MODS[cal];if(!M)return;if(hasMod(cal)){shopType('Already fitted, my friend. I do not sell the same strap twice.');return;}if(pr.wallet<M.price){sfx('blip');shopType(NINE_POOR);return;}
  pr.wallet-=M.price;(pr.mods||(pr.mods={}))[cal]=1;applyMods();saveProg();sfx('cash');renderShop();shopType(M.say);return;}
 if(t==='ammo'||t==='upg'){const c=cal||ownCals()[0];if(!c){shopType('Bullets need a gun, my friend. This is how bullets work.');return;}
  if(t==='ammo'){if((k.pool[c]|0)>=capOf(k,c)){shopType('Your bag is full. More is not ammunition, is a hobby.');return;}if(pr.wallet<CAL[c].price){sfx('blip');shopType(NINE_POOR);return;}pr.wallet-=CAL[c].price;poolAdd(k,c,CAL[c].box);say='Fresh rounds. Still warm from the factory. Which factory, I do not say.';}
  else{const pz=upgPrice(k,c);if((k.upg[c]|0)>=99){shopType('Any more pockets and you are a pocket.');return;}if(pr.wallet<pz){sfx('blip');shopType(NINE_POOR);return;}pr.wallet-=pz;k.upg[c]=(k.upg[c]|0)+1;say='More pouches. Now you rattle with confidence.';}}
 else if(t==='carrier'){const old=k.armour,C=ARMOUR.carrier;if(old&&old.type==='carrier'){shopType('You already wear the big one, my friend.');return;}
  const tr=old?sellValue({armour:old.type,plates:old.plates},ARMOUR[old.type].price):0,pz=C.price-tr;if(pr.wallet<pz){sfx('blip');shopType(NINE_POOR);return;}
  pr.wallet-=pz;k.armour={type:'carrier',plates:C.plates};say=old?'I take your old vest as part payment. Two plates now. You walk a little slower, you live a little longer.':'Ceramic plates, front and back. You walk a little slower, you live a little longer.';}
 else{const ar=k.armour&&ARMOUR[k.armour.type];if(ar&&k.armour.plates>=ar.plates){shopType('Is in one piece, my friend. Go and break it first.');return;}
  const pz=ar?ar.repair:ARMOUR.vest.price;if(pr.wallet<pz){sfx('blip');shopType(NINE_POOR);return;}pr.wallet-=pz;if(ar)k.armour.plates=ar.plates;else k.armour={type:'vest',plates:ARMOUR.vest.plates};
  say=ar?'Patched. Do not ask with what.':'Kevlar. It stops one bullet. After that, it is just a nice shirt.';}
 saveProg();sfx('cash');renderShop();shopType(say);}
/* TRY AT THE RANGE: Nine hands you a loaner and you walk out onto lane two; free range ammo; step off the line and it goes back */
function shopTry(t){if(state!=='shop'||!shopReady()||!rangeOK(t)||!shopAvail(t))return;const g=G;if(!g||!g.range){shopType('The range is closed today, my friend. My cousin is painting it.');return;}
 closeShop(true);g.range.loan=t;const p=g.player;if(p){p.x=BK.lanes[1]+1;p.z=BK.strip[2]+1.6;p.vx=p.vz=0;p.a=Math.PI;}sfx('pick');
 const n=g.npcs.find(q=>q.kind==='nine');if(n)popup(n.x,n.z,pick(NINE_TRY),'#ffe9a8');banner('TEST FIRE · '+WD[t].name,touchMode?'Drag right thumb to aim &amp; fire · free range ammo':padMode?'Right stick aims · RT fires · free range ammo':'Click to fire · R reloads · free range ammo');}
function shopRowAct(q){if(!q||q.h)return;if(q.k==='w')shopPick(q.t);else if(q.k==='sell')shopSellPick(q.id);else if(q.k==='mod')shopExtra('mod',q.m);else if(q.k==='ammo')shopExtra('ammo',q.c);else if(q.k==='stash')shopExtra('upg',q.c);else if(q.k!=='none')shopExtra(q.k);}
document.getElementById('sShop').addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b)return;if(b.id==='bShopLeave'){closeShop();return;}if(!shopReady())return;
 if(b.dataset.i!==undefined){const i=+b.dataset.i;if(i!==shopSel){sfx('blip');shopSelect(i);}return;}
 if(b.dataset.tab){shopTab(b.dataset.tab);return;}
 const q=shopRows[shopSel];
 if(b.dataset.act==='try'){if(q&&q.k==='w')shopTry(q.t);return;}
 if(b.dataset.act==='buy'){shopRowAct(q);return;}
 if(b.dataset.x)shopExtra(b.dataset.x,b.dataset.c);else if(b.dataset.s)shopSellPick(b.dataset.s);});
/* keyboard: W/S or arrows scroll, A/D or Q/E jump sections, Enter buys, T tries, F buys ammo for the gun on the card */
function shopKey(e){const c=e.code;if(c==='Escape'||c==='Backspace'){closeShop();return;}if(!shopReady()){if(c==='Space'||c==='Enter'||c==='KeyE')$('shSay').click();return;}
 if(c==='ArrowUp'||c==='KeyW')shopMove(-1);else if(c==='ArrowDown'||c==='KeyS')shopMove(1);else if(c==='PageUp')shopJump(-1);else if(c==='PageDown')shopJump(1);
 else if(c==='ArrowLeft'||c==='KeyA'||c==='KeyQ')shopJump(-1);else if(c==='ArrowRight'||c==='KeyD'||c==='KeyE')shopJump(1);
 else if(c==='Enter'||c==='Space')shopAct();else if(c==='KeyT'){const q=shopRows[shopSel];if(q&&q.k==='w')shopTry(q.t);}
 else if(c==='KeyF'||c==='Digit4'){const q=shopRows[shopSel],w=q&&q.k==='w'&&WD[q.t];shopExtra('ammo',w&&isCal(w.cal)&&ownCals().includes(w.cal)?w.cal:undefined);}else if(c==='Digit5')shopExtra('vest');}
/* gamepad: d-pad / left stick up-down scroll, LB/RB or d-pad left-right jump sections, A buys, X tries, Y ammo, B leaves */
function shopPadInput(dir,dt){if(pdown(1)){closeShop();return;}if(!shopReady()){if(pdown(0))$('shSay').click();return;}
 const ay=(PAD.gp&&PAD.gp.axes[1])||0;shopPadT-=dt||0.016;let v=0;if(pdown(12))v=-1;else if(pdown(13))v=1;else if(Math.abs(ay)>0.6&&shopPadT<=0)v=Math.sign(ay);if(Math.abs(ay)<0.3)shopPadT=0;
 if(v){shopPadT=0.18;shopMove(v);return;}if(dir||pdown(4)||pdown(5)){shopJump(dir||(pdown(4)?-1:1));return;}
 if(pdown(0))shopAct();else if(pdown(2)){const q=shopRows[shopSel];if(q&&q.k==='w')shopTry(q.t);}else if(pdown(3))shopKey({code:'KeyF'});}
/* ---- Nine of Nine close-up (the shop scene, built like McWey's briefing): his counter, the pegboards and the selected piece turning on a velvet mat ---- */
/* built on first use: a Batch needs WebGL, and without it the startup error screen must stay the only failure */
let nineB=null,nineBuilt=false,nineChar=null,nineTalk=false,nineBlinkT=2;
const NFONT={N:[[0,0,0,1],[0,1,1,0],[1,0,1,1]],I:[[0.5,0,0.5,1]],E:[[1,1,0,1],[0,1,0,0],[0,0,1,0],[0,0.5,0.7,0.5]],O:[[0,0,1,0],[1,0,1,1],[1,1,0,1],[0,1,0,0]],F:[[0,0,0,1],[0,1,1,1],[0,0.5,0.7,0.5]],
 S:[[1,1,0,1],[0,1,0,0.5],[0,0.5,1,0.5],[1,0.5,1,0],[1,0,0,0]],R:[[0,0,0,1],[0,1,1,1],[1,1,1,0.5],[1,0.5,0,0.5],[0.3,0.5,1,0]],A:[[0,0,0,1],[0,1,1,1],[1,1,1,0],[0,0.5,1,0.5]],
 G:[[1,1,0,1],[0,1,0,0],[0,0,1,0],[1,0,1,0.5],[1,0.5,0.5,0.5]],M:[[0,0,0,1],[0,1,0.5,0.45],[0.5,0.45,1,1],[1,1,1,0]],U:[[0,1,0,0],[0,0,1,0],[1,0,1,1]],Y:[[0,1,0.5,0.5],[1,1,0.5,0.5],[0.5,0.5,0.5,0]],
 P:[[0,0,0,1],[0,1,1,1],[1,1,1,0.5],[1,0.5,0,0.5]],T:[[0,1,1,1],[0.5,1,0.5,0]],W:[[0,1,0.25,0],[0.25,0,0.5,0.6],[0.5,0.6,0.75,0],[0.75,0,1,1]],K:[[0,0,0,1],[1,1,0,0.5],[0.25,0.6,1,0]],
 '1':[[0.5,0,0.5,1],[0.2,0.75,0.5,1]],'2':[[0,1,1,1],[1,1,1,0.5],[1,0.5,0,0.5],[0,0.5,0,0],[0,0,1,0]],'3':[[0,1,1,1],[1,1,1,0],[1,0,0,0],[0.3,0.5,1,0.5]],'9':[[1,0.5,0,0.5],[0,0.5,0,1],[0,1,1,1],[1,1,1,0],[1,0,0,0]],"'":[[0.5,1,0.5,0.72]]};
/* a neon word on a wall: z is the wall face, dir=1 faces +z (south, toward the camera); x runs left to right */
function nineWord(B,word,cx,y,z,h,col,dir){const w=h*0.62,gap=h*0.3,sp=(c)=>c==="'"?w*0.3:w;let tot=0;for(const ch of word)tot+=(ch===' '?w*0.6:sp(ch))+gap;tot-=gap;let x=cx-tot/2;
 for(const ch of word){if(ch===' '){x+=w*0.6+gap;continue;}const S=NFONT[ch],cw=sp(ch);if(S)for(const q of S){const ox=ch==="'"?-0.35*w:0;strokeBox(B,x+ox+q[0]*cw,y+q[1]*h,x+ox+q[2]*cw,y+q[3]*h,z,h*0.11,col);}x+=cw+gap;}}
/* a gun hung on a wall that faces the camera: side profile, barrel pointing along +x */
function wallGun(B,t,x,y,z,s,flip){drawWeapon(B,A.mul(A.mul(A.T(x,y,z),A.RY(flip?-Math.PI/2:Math.PI/2)),A.S(s,s,s)),t);}
function buildNine(){if(!nineB)nineB=new Batch();const B=nineB;B.reset();B.round=0.45;const PINK=[1,0.28,0.72],CYAN=[0.25,0.9,1];
 for(let x=-4;x<4;x++)for(let z=-2;z<4;z++)B.quad([[x,0,z+1],[x+1,0,z+1],[x+1,0,z],[x,0,z]],0,1,0,TUV[(x+z)&1?43:1],[0.8,0.78,0.85]);
 const wz=-1.3;for(let x=-4;x<4;x++)for(let y=0;y<4;y++)B.quad([[x,y,wz],[x+1,y,wz],[x+1,y+1,wz],[x,y+1,wz]],0,0,1,TUV[6],[0.55,0.5,0.62]);
 /* side wall on the right with the range window: lane lights glowing through the glass */
 for(let z=-2;z<4;z++)for(let y=0;y<4;y++)B.quad([[3.4,y,z],[3.4,y,z+1],[3.4,y+1,z+1],[3.4,y+1,z]],-1,0,0,TUV[6],[0.5,0.45,0.58]);
 B.box(TRS(3.38,1.55,0.2,0,0.04,1.3,2.3),hex(0x3a3a44));B.box(TRS(3.36,1.55,0.2,0,0.02,1.15,2.15),[0.04,0.06,0.1]);B.box(TRS(3.35,1.55,0.2,0,0.01,0.05,2.15),hex(0x3a3a44));B.box(TRS(3.35,2.05,0.2,0,0.01,0.05,0.3),[1,0.2,0.2],true);
 /* pegboards both sides of Nine, guns hung in rows */
 for(const [x0,x1] of [[-3.8,-0.75],[0.75,3.2]]){B.box(TRS((x0+x1)/2,1.75,wz+0.03,0,x1-x0,1.9,0.04),hex(0x2a2226));for(let gx=x0+0.12;gx<x1-0.05;gx+=0.18)for(let gy=0.9;gy<2.65;gy+=0.18)B.box(TRS(gx,gy,wz+0.055,0,0.025,0.025,0.01),hex(0x120e12));
  B.box(TRS((x0+x1)/2,2.72,wz+0.06,0,x1-x0,0.05,0.05),hex(0x5a4a30));B.box(TRS((x0+x1)/2,0.78,wz+0.06,0,x1-x0,0.05,0.05),hex(0x5a4a30));}
 for(const [t,x,y,s] of [['m16',-3.0,2.35,1.9],['shotgun',-1.75,2.35,1.9],['smg',-3.35,1.75,1.9],['revolver',-2.55,1.75,1.9],['double',-1.5,1.75,1.7],['silenced',-3.3,1.2,1.9],['machete',-2.3,1.2,1.8],['pistol',-1.35,1.2,1.9],
  ['m16',2.4,2.35,1.9],['double',1.4,2.35,1.7],['smg',1.25,1.75,1.9],['shotgun',2.4,1.75,1.7],['bat',1.6,1.2,1.4],['knife',2.55,1.2,2],['revolver',3.0,1.2,1.8]])wallGun(B,t,x,y,wz+0.12,s);
 /* the backlit panel behind the showcase mat, so the piece reads as a silhouette */
 B.box(TRS(-0.62,1.3,wz+0.05,0,1.5,1.05,0.03),hex(0x1a1a22));B.box(TRS(-0.62,1.3,wz+0.07,0,1.4,0.95,0.01),[0.55,0.32,0.62],true);for(let i=1;i<7;i++)B.box(TRS(-1.32+i*0.2,1.3,wz+0.08,0,0.008,0.95,0.005),[0.75,0.5,0.85],true);B.box(TRS(-0.62,1.3,wz+0.08,0,1.4,0.008,0.005),[0.75,0.5,0.85],true);
 /* the neon sign across the top */
 B.box(TRS(0,3.25,wz+0.04,0,5.4,0.7,0.04),[0.06,0.03,0.08]);nineWord(B,"NINE OF NINE'S",0,3.05,wz+0.08,0.4,PINK);B.box(TRS(0,2.92,wz+0.08,0,5.0,0.03,0.03),CYAN,true);B.box(TRS(0,3.56,wz+0.08,0,5.0,0.03,0.03),CYAN,true);
 /* glass display counter: dark frame, lit bed, pistols inside, brass trim */
 const CZ=0.62;B.box(TRS(0,0.45,CZ,0,3.6,0.9,0.62),hex(0x2a2430),false,TUV[13]);B.box(TRS(0,0.915,CZ,0,3.68,0.04,0.7),[0.62,0.6,0.68]);B.box(TRS(0,0.62,CZ+0.315,0,3.4,0.5,0.01),[0.55,0.85,1.0],true);
 for(const [t,x] of [['pistol',-1.3],['revolver',-0.65],['silenced',0.1],['dual',0.8],['knife',1.4]])drawWeapon(B,A.mul(A.mul(A.T(x,0.6,CZ+0.33),A.RY(Math.PI/2)),A.S(1.6,1.6,1.6)),t);
 B.box(TRS(0,0.94,CZ+0.34,0,3.68,0.02,0.02),GOLD,true);B.box(TRS(0,0.06,CZ+0.32,0,3.6,0.08,0.02),GOLD);
 /* velvet mat for the showcase piece, cash register, ammo boxes */
 B.box(TRS(-0.55,0.945,CZ+0.02,0,1.05,0.015,0.5),hex(0x7a0c2a));B.box(TRS(-0.55,0.952,CZ+0.02,0,0.98,0.012,0.44),hex(0x9a1838));
 B.box(TRS(1.35,1.07,CZ-0.05,0,0.42,0.28,0.36),hex(0x3a3a40));B.box(TRS(1.35,1.24,CZ-0.12,-0.0,0.36,0.1,0.14),hex(0x1a1a1e));B.box(TRS(1.35,1.25,CZ-0.05,0,0.2,0.05,0.005),[0.3,1,0.5],true);
 for(let i=0;i<3;i++)B.box(TRS(0.65+i*0.03,0.97+i*0.075,CZ-0.1,0.1*i,0.22,0.075,0.14),hex(0x4a5a2a));B.box(TRS(0.65,1.15,CZ-0.1,0.2,0.14,0.006,0.08),[0.9,0.85,0.4]);
 /* overhead lamp over the mat */
 B.box(TRS(-0.55,3.2,0.5,0,0.02,0.9,0.02),hex(0x1a1a1a));B.box(TRS(-0.55,2.72,0.5,0,0.34,0.12,0.2),hex(0x202024));B.box(TRS(-0.55,2.655,0.5,0,0.3,0.01,0.16),[1,0.9,0.7],true);
 B.upload(true);
 nineChar=makeChar(0.45,-0.25,NPCLOOK.nine(),false);nineChar.body='fat';nineChar.pose='sal';nineChar.kind='nine';nineChar.talk=0;nineChar.blink=0;nineChar.a=-0.15;nineChar.splat={torso:[],legs:[],face:[]};nineBuilt=true;}
function updateNine(dt){if(!nineBuilt)buildNine();const c=nineChar;c.talk=nineTalk?Math.abs(Math.sin(menuT*16))*(0.45+0.55*Math.abs(Math.sin(menuT*4.7))):Math.max(0,c.talk-dt*4);
 nineBlinkT-=dt;if(nineBlinkT<=0){c.blink=0.13;nineBlinkT=rnd(2,4.5);}c.blink-=dt;shopShowT+=dt;}
/* the catalogue covers the left of the screen (the bottom on a phone held upright), so the camera puts the mat and Nine on the right */
function nineView(asp){let eye=[-1.15,1.6,2.7],tgt=[-1.15,asp>1.9?0.82:1.02,0];if(asp<1){eye=[-0.3,1.75,3.3];tgt=[-0.3,0.3,0.6];}const fl=Math.sin(menuT*1.7)>0.96?0.25:1;
 return{eye,tgt,lights:[{x:-0.55,y:2.5,z:0.6,r:3.0,c:[1.4*fl,1.15*fl,0.85*fl]},{x:-2.4,y:1.6,z:0.2,r:3.4,c:[1,0.15,0.3]},{x:2,y:2.0,z:-0.6,r:3.6,c:[1,0.3,0.75]},{x:1.2,y:1.5,z:1.8,r:3.6,c:[0.35,0.8,1.2]},{x:0,y:0.6,z:1.3,r:1.6,c:[0.3,0.6,0.9]},{x:-0.6,y:1.7,z:1.6,r:2.4,c:[1.5,1.45,1.4]}]};}
/* what the mat shows for the selected row: the weapon (with the attachment on it), or the gun an attachment fits */
function shopShowType(){const q=shopRows[shopSel];if(!q)return null;if(q.k==='w')return q.t;if(q.k==='mod')return MOD_GUN[q.m]||(kitGun(kit())||{}).type||'m16';if(q.k==='sell'&&!q.it.armour)return q.it.type;if(q.k==='ammo'||q.k==='stash'){const c=q.c;const t=c&&['pistol','revolver','shotgun','m16','goldak','golddeagle','goldgl'].find(k=>WD[k].cal===c);return t||null;}return null;}
const showBox=t=>{const ps=WPARTS[t]||[];let z0=1e9,z1=-1e9,y0=1e9,y1=-1e9;for(const q of ps){z0=Math.min(z0,q[2]-q[5]/2);z1=Math.max(z1,q[2]+q[5]/2);y0=Math.min(y0,q[1]-q[4]/2);y1=Math.max(y1,q[1]+q[4]/2);}return {cz:(z0+z1)/2,cy:(y0+y1)/2,len:Math.max(0.1,z1-z0)};};
function drawShowcase(B,t,x,y,z,len,T,mods){const bb=showBox(t),s=len/bb.len,pop=Math.min(1,shopShowT*5),a=Math.PI/2+Math.sin(T*0.7)*0.55;
 const m=A.mul(A.mul(A.mul(A.T(x,y+Math.sin(T*1.6)*0.015,z),A.RY(a)),A.S(s*pop,s*pop,s*pop)),A.T(0,-bb.cy,-bb.cz));
 WGOLD=mastLv(t)>=3;drawWeapon(B,m,t);WGOLD=false;
 const P=(px,py,pz,sx,sy,sz,c,em)=>B.box(A.mul(m,TRS(px,py,pz,0,sx,sy,sz)),c,em);
 if(t==='pistol'&&(mods.supp||hasMod('supp')))P(0,0.045,0.26,0.034,0.034,0.17,DARK);
 if(t==='smg'&&(mods.xmag||hasMod('xmag')))P(0,-0.12,0.02,0.034,0.13,0.047,GUN);
 if((mods.sling||hasMod('sling'))&&!WD[t].melee&&!WD[t].toss){P(0.03,-0.02,0.0,0.006,0.02,Math.max(0.12,bb.len*0.6),[0.55,0.1,0.2]);}
 /* a soft spotlight pool on the mat */B.box(TRS(x,0.962,z,0,len*0.9,0.004,0.36),[0.5,0.15,0.22],true);}
function drawNineDyn(B,P){B.reset();P.reset();if(!nineChar)return;if(!PS2C.add(nineChar,'menu',1,menuT,IBhi,'nine')&&PS2C.modelStatus('nine')==='failed')hdChar(B,{...nineChar,pose:'nine'},menuT);
 const q=shopRows[shopSel],t=shopReady()?shopShowType():null,mods=q&&q.k==='mod'?{[q.m]:1}:{};
 if(t&&WPARTS[t])drawShowcase(B,t,-0.6,1.3,0.66,showLen(t),menuT,mods);
 else if(q&&(q.k==='vest'||q.k==='carrier')){B.box(TRS(-0.55,1.12,0.66,0.3+Math.sin(menuT*0.7)*0.4,0.5,0.32,0.18),q.k==='vest'?hex(0x2a3a2a):hex(0x2a2a30));B.box(TRS(-0.55,1.12,0.66,0.3+Math.sin(menuT*0.7)*0.4,0.36,0.24,0.2),hex(0x1a1a1c));}
 else{const ex=arm().stock.find(k=>WD[k]&&WD[k].excl);if(ex)drawShowcase(B,ex,-0.6,1.3,0.66,showLen(ex),menuT,{});}}
const showLen=t=>{const w=WD[t];return w.melee?(t==='knife'?0.5:0.9):w.toss?0.45:w.two||t==='smg'||t==='goldak'?0.85:0.55;};

/* =================== THE BUNKER: Nine's shop as real rooms, the shooting range in its east third ===================
   Map coordinates below (the loader pads the map by one cell, so world = map + 1). Shop x 1..20, range x 22..30.
   Showroom z 6..14 (counter z 12, Nine z 13, his shelf z 14), armoury x 1..7 z 16..21, workshop x 9..15, hallway x 17..20
   to the range door (x 21, z 17). Range: targets up north, the shooting bench at z 15, the firing line z 16..17, lockers behind. */
const BK={lanes:[23.5,26.5,29.5],tz:[11.4,9.2,7.4],strip:[22,31,16,18]};
const BK_SOLID=[[5,12,15,12],[5,14,15,14],[3,8,6,8],[14,8,17,8],[10,9,11,9],[1,7,1,10],[20,7,20,10],[22,15,30,15],[30,19,30,21],[5,16,7,16],[1,19,2,21],[10,16,14,16],[12,19,13,19],[17,21,18,21]];
function bunkerSetup(g){for(const [x0,z0,x1,z1] of BK_SOLID)for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)g.solid[(z+1)*g.W+x+1]=1;
 const L=(x,z,r,c,y)=>g.lights.push({x:x+1,y:y||2.2,z:z+1,r,c});g.lights.length=0;
 L(5,8.5,6,[1.1,0.85,0.6]);L(16,8.5,6,[1.1,0.85,0.6]);L(10.5,6.8,5,[1.2,0.3,0.8]);L(10.5,11.5,4.5,[1.2,1.0,0.75]);L(10.5,9,3,[1.3,1.1,0.6],1.6);
 L(4,18.5,5,[0.75,0.7,0.55]);L(12,18.5,5,[0.95,0.8,0.55]);L(18.5,18,4.5,[0.6,0.5,0.9]);
 L(26.5,9.5,7,[0.95,1.0,1.1],2.5);L(26.5,6.6,5,[1.2,0.25,0.25],1.8);L(26.5,17,5.5,[0.9,0.95,1.05]);L(26.5,20,4.5,[0.5,0.6,0.9]);
 g.range={lanes:BK.lanes.map((x,i)=>({x:x+1,z:BK.tz[i]+1,base:x+1,down:0,t:0,flash:0})),on:false,loan:null,prev:null,list:[],i:0,rl:0,fired:0,hits:0,pts:0,best:0,last:null,lastAmmo:0};}
function rangeZone(p){return p.x>BK.strip[0]+1.05&&p.x<BK.strip[1]+0.95&&p.z>BK.strip[2]+0.62&&p.z<BK.strip[3]+1.3;}
function rangeGuns(R){const k=kit(),o=[];if(R.loan)o.push(R.loan);for(const s of [k.active,1-k.active]){const it=k.guns[s];if(it&&rangeOK(it.type)&&!o.includes(it.type))o.push(it.type);}if(!o.length)o.push('pistol');return o;}
function rangeEquip(R,p,t){p.weapon={type:t,ammo:WD[t].mag};p.rl=null;p.burstQ=0;p.cd=Math.max(p.cd,hasMod('sling')?0.08:0.3);R.rl=0;R.lastAmmo=WD[t].mag;sfx('pick');popup(p.x,p.z,WD[t].name+(t===R.loan?' · LOANER':t==='pistol'&&!kitHas(kit(),'pistol')?' · HOUSE GUN':''),'#2de2e6');}
/* runs before updatePlayer: the firing line hands out the gun, reloads for free, and takes a loaner back when you leave */
function rangePre(dt){const g=G,R=g.range,p=g.player;if(!R||!p||!p.alive)return;const inZ=rangeZone(p);
 if(inZ&&!R.on){R.on=true;g.rangeOn=true;R.prev=p.weapon||null;R.list=rangeGuns(R);R.i=0;rangeEquip(R,p,R.list[0]);g.obj='SHOOTING RANGE · STEP BACK TO LEAVE';}
 else if(!inZ&&R.on){R.on=false;g.rangeOn=false;p.weapon=R.prev;p.rl=null;p.burstQ=0;g.bullets.length=0;if(R.loan){const n=g.npcs.find(q=>q.kind==='nine');if(n)popup(n.x,n.z,pick(NINE_BACK),'#ffe9a8');popup(p.x,p.z,'LOANER RETURNED','#ffd36b');R.loan=null;}g.obj=null;}
 if(!R.on)return;const w=p.weapon;if(!w)return;
 if((pressed.swap||pressed.slot)&&R.list.length>1){R.i=pressed.slot?Math.min(R.list.length-1,pressed.slot-1):(R.i+1)%R.list.length;if(R.list[R.i]!==w.type)rangeEquip(R,p,R.list[R.i]);pressed.swap=false;pressed.slot=0;return;}
 if(w.ammo<R.lastAmmo){const n=R.lastAmmo-w.ammo;R.fired+=n*(WD[w.type].pel||1);}R.lastAmmo=w.ammo;
 if(R.rl>0){R.rl-=dt;p.cd=Math.max(p.cd,0.05);if(R.rl<=0){w.ammo=WD[w.type].mag;R.lastAmmo=w.ammo;p.cd=Math.max(p.cd,0.1);sfx('pick');}}
 else if(w.ammo<=0||pressed.reload&&w.ammo<WD[w.type].mag){R.rl=WD[w.type].rl*(mastLv(w.type)>=2?0.75:1);p.burstQ=0;p.cd=Math.max(p.cd,0.05);sfx('blip');pressed.reload=false;}}
/* after updatePlayer: the range's own bullets (the hub has no enemies or doors to resolve), paper targets and the score */
const bkWall=(g,x,z)=>{const r=g.rows[Math.floor(z)];const c=r&&r[Math.floor(x)];return c===undefined||c==='#'||c==='W'||c==='D'||c==='b';};
function rangeTick(dt){const g=G,R=g.range;if(!R)return;const T=g.T;
 for(const L of R.lanes){if(L===R.lanes[1])L.x=L.base+Math.sin(T*0.9)*0.85;else if(L===R.lanes[2])L.x=L.base+Math.sin(T*0.55+1)*0.35;
  if(L.t>0){L.t-=dt;L.down=Math.min(1,L.down+dt*7);if(L.t<=0)sfx('click');}else L.down=Math.max(0,L.down-dt*3);if(L.flash>0)L.flash-=dt;}
 for(const b of g.bullets){if(b.own!=='p'){b.life=0;continue;}const dist=b.sp*dt,steps=Math.ceil(dist/0.2),st=dist/steps;
  for(let s=0;s<steps&&b.life>0;s++){const nx=b.x+b.dx*st,nz=b.z+b.dz*st;
   for(const L of R.lanes){if(L.down>0.3||b.hit.includes(L))continue;if((b.z-L.z)*(nz-L.z)>0)continue;const u=(L.z-b.z)/((nz-b.z)||1e-6),xc=b.x+(nx-b.x)*u,off=Math.abs(xc-L.x);if(off>0.38)continue;
    b.hit.push(L);const pts=off<0.08?10:off<0.2?8:5;R.hits++;R.pts+=pts;L.t=1.1;L.flash=0.25;L.last=pts;popup(L.x,L.z,pts===10?'BULLSEYE +10':'+'+pts,pts===10?'#ffd36b':'#7dff9a');sfx(pts===10?'ding':'thud');
    for(let i=0;i<4;i++)g.parts.push({t:'s',x:xc,y:1.1+rnd(-0.2,0.2),z:L.z,vx:rnd(-1,1),vy:rnd(0,1.5),vz:rnd(-1.5,0),s:0.05,c:[0.95,0.92,0.85],life:rnd(0.3,0.6)});
    b.pierce--;if(b.pierce<=0){b.life=0;break;}}
   if(b.life<=0)break;
   if(bkWall(g,nx,nz)){const ocx=Math.floor(b.x),ocz=Math.floor(b.z),ncx=Math.floor(nx),ncz=Math.floor(nz);let wx,wz,nrx=0,nrz=0;
    if(ncx!==ocx){wx=ncx>ocx?ncx:ocx;nrx=ncx>ocx?-1:1;wz=b.z+(wx-b.x)/(b.dx||1e-6)*b.dz;}else{wz=ncz>ocz?ncz:ocz;nrz=ncz>ocz?-1:1;wx=b.x+(wz-b.z)/(b.dz||1e-6)*b.dx;}
    sparks(wx+nrx*0.05,0.74,wz+nrz*0.05,nrz>0?[0.45,0.3,0.25]:undefined);if(nrz>0)sfx('thud',0.4);addWallDecal(wx,0.74+rnd(-0.12,0.12),wz,nrx,nrz,0.08,10,[0.1,0.09,0.09]);b.life=0;break;}
   b.x=nx;b.z=nz;}
  b.life-=dt;}
 g.bullets=g.bullets.filter(b=>b.life>0);if(g.flashes)for(const f of g.flashes)f.t-=dt;if(g.flashes)g.flashes=g.flashes.filter(f=>f.t>0);
 R.best=Math.max(R.best,R.pts);R.camK=(R.camK||0)+((R.on?1:0)-(R.camK||0))*(1-Math.exp(-dt*3));}
function drawRangeHUD(c,g,u,m){const R=g.range,p=g.player;if(!R||!R.on||!p||!p.weapon)return;const w=p.weapon,wd=WD[w.type];
 const acc=R.fired?Math.round(R.hits/R.fired*100):0,bw=Math.min(vw*0.46,260*u),bh=62*u,x=vw-m-bw,y=m+58*u;
 c.fillStyle='rgba(10,4,18,.82)';c.fillRect(x,y,bw,bh);c.fillStyle='#ff2d95';c.fillRect(x,y,bw,3*u);
 c.font=PXF(7*u);txt(c,'NINE\'S RANGE · '+wd.name+(w.type===R.loan?' · LOANER':''),x+8*u,y+8*u,'#ffd36b','left',7*u);
 c.font=VTF(17*u);txt(c,R.rl>0?'RELOADING…':'AMMO '+w.ammo+'/'+wd.mag,x+8*u,y+19*u,R.rl>0?'#ff8a95':'#fff','left',17*u);txt(c,'SCORE '+R.pts,x+bw-8*u,y+19*u,'#ffd36b','right',17*u);
 txt(c,'HITS '+R.hits+' · '+acc+'%'+(R.best>R.pts?' · BEST '+R.best:''),x+8*u,y+36*u,'#7dff9a','left',17*u);
 c.font=PXF(5.5*u);txt(c,(touchMode?'SWITCH: NEXT GUN · RELOAD':padMode?'Y: NEXT GUN · X: RELOAD':'Q: NEXT GUN · R: RELOAD')+(R.list.length>1?' ('+R.list.length+' GUNS)':''),x+8*u,y+54*u,'#e9c7ff','left',5.5*u);
 if(!touchMode&&!padMode&&mouse.active){const cx=mouse.x,cy=mouse.y;c.strokeStyle='#000';c.lineWidth=4;const d=()=>{c.beginPath();c.moveTo(cx-10*u,cy);c.lineTo(cx-3*u,cy);c.moveTo(cx+3*u,cy);c.lineTo(cx+10*u,cy);c.moveTo(cx,cy-10*u);c.lineTo(cx,cy-3*u);c.moveTo(cx,cy+3*u);c.lineTo(cx,cy+10*u);c.stroke();};d();c.strokeStyle='#ffd36b';c.lineWidth=2;d();}}
/* the bunker's dressing, drawn every frame like the apartments (world coordinates = map + 1) */
function drawBunker(B,g){const T=g.T||0,O=1,bx=(x,y,z,sx,sy,sz,c,em,ry)=>B.box(TRS(x+O,y,z+O,ry||0,sx,sy,sz),c,!!em),PINK=[1,0.3,0.75],CYAN=[0.2,0.9,1],RED=[1,0.2,0.25],
  BR=[0.42,0.3,0.2],DK=[0.12,0.11,0.13],ST=[0.32,0.33,0.36],OL=[0.27,0.33,0.2],fl=Math.sin(T*1.7)>0.97?0.3:1;
 const gun=(t,x,y,z,ry,s,lay)=>drawWeapon(B,A.mul(A.mul(A.mul(A.T(x+O,y,z+O),A.RY(ry)),lay?A.RZ(Math.PI/2):A.T(0,0,0)),A.S(s,s,s)),t);
 /* ---- storefront: the street sign and the shutter tracks ---- */
 bx(10.5,2.3,6.04,4.6,0.66,0.05,[0.06,0.03,0.08]);nineWord(B,"NINE OF NINE'S",11.5,2.1,7.1,0.34,[1.2*fl,0.35*fl,0.85*fl]);bx(10.5,2.58,6.09,4.3,0.03,0.03,CYAN,true);bx(10.5,2.02,6.09,4.3,0.03,0.03,CYAN,true);
 for(const sx of [8.9,13.1])bx(sx,1.2,5.1,0.08,2.4,0.12,ST);
 /* ---- showroom: red runner from the door to the counter ---- */
 bx(10.5,0.012,9.2,2.2,0.012,6.4,[0.3,0.03,0.08]);bx(10.5,0.016,9.2,2.0,0.012,6.2,[0.4,0.05,0.11]);for(const sx of [9.45,11.55])bx(sx,0.02,9.2,0.05,0.012,6.2,GOLD);
 /* north wall pegboards either side of the door, handguns and SMGs hung side-on */
 for(const [x0,x1] of [[1.2,8.6],[12.4,19.8]]){bx((x0+x1)/2,1.45,6.06,x1-x0,1.5,0.05,hex(0x2a2226));bx((x0+x1)/2,2.25,6.1,x1-x0,0.06,0.07,BR);bx((x0+x1)/2,0.68,6.1,x1-x0,0.06,0.07,BR);}
 {const ws=[['pistol',1.9,1.8],['silenced',3.0,1.8],['revolver',4.1,1.8],['dual',5.4,1.8],['pistol',6.8,1.8],['smg',8.0,1.8],['smg',2.3,1.1],['revolver',3.7,1.1],['silenced',5.1,1.1],['knife',6.4,1.1],['tknife',7.6,1.1],
   ['shotgun',13.6,1.8],['m16',15.5,1.8],['double',17.4,1.8],['m16',19.1,1.8],['machete',13.4,1.1],['bat',15.0,1.1],['shotgun',16.9,1.1],['knife',18.9,1.1]];
  for(const [t,x,y] of ws)gun(t,x,y,6.16,Math.PI/2,WD[t].two?1.25:1.7);}
 nineWord(B,'9',4.9+O,2.4,6.12+O,0.28,PINK);nineWord(B,'9',16.1+O,2.4,6.12+O,0.28,PINK);
 /* west wall: long-gun rack, rifles standing barrel-up */
 bx(1.25,1.2,8.5,0.32,2.1,4.0,hex(0x3a2a20));bx(1.42,0.35,8.5,0.06,0.08,3.9,BR);bx(1.42,1.95,8.5,0.06,0.08,3.9,BR);
 {const lg=['m16','shotgun','double','m16','shotgun','double','m16','bat'];lg.forEach((t,i)=>drawWeapon(B,A.mul(A.mul(A.mul(A.T(1.55+O,1.05,6.85+i*0.48+O),A.RZ(0)),A.RX(-Math.PI/2)),A.S(1.15,1.15,1.15)),t));}
 /* east wall: ammo shelving, olive boxes and red shotgun shells */
 bx(20.7,1.0,8.5,0.55,2.0,4.0,hex(0x2a2a2e));for(let sh=0;sh<4;sh++){const y=0.25+sh*0.5;bx(20.5,y,8.5,0.6,0.04,3.9,ST);for(let i=0;i<9;i++){const z=6.8+i*0.42,red=(i+sh)%3===0;bx(20.45,y+0.12,z,0.28,0.2,0.32,red?[0.7,0.12,0.12]:OL);bx(20.3,y+0.14,z,0.01,0.08,0.2,[0.9,0.85,0.5]);}}
 /* glass display cases: dark base, lit bed with pistols, glass frame */
 for(const cx of [4.5,15.5]){bx(cx,0.4,8.5,3.8,0.8,0.8,hex(0x2a2430));bx(cx,0.82,8.5,3.7,0.03,0.7,[0.16,0.26,0.36],true);
  ['pistol','revolver','silenced','pistol','dual'].forEach((t,i)=>gun(cx===4.5?t:['smg','knife','revolver','silenced','pistol'][i],cx-1.45+i*0.72,0.86,8.5,Math.PI/2,1.5,true));
  for(const [ex,ez] of [[-1.88,-0.38],[1.88,-0.38],[-1.88,0.38],[1.88,0.38]])bx(cx+ex,1.0,8.5+ez,0.03,0.38,0.03,[0.75,0.8,0.85]);bx(cx,1.19,8.12,3.8,0.025,0.025,[0.75,0.8,0.85]);bx(cx,1.19,8.88,3.8,0.025,0.025,[0.75,0.8,0.85]);
  bx(cx-1.9,1.19,8.5,0.025,0.025,0.8,[0.75,0.8,0.85]);bx(cx+1.9,1.19,8.5,0.025,0.025,0.8,[0.75,0.8,0.85]);bx(cx,0.06,8.92,3.8,0.08,0.02,GOLD);}
 /* the exclusive pedestal under its spotlight, the piece turning on top (an empty plinth and a gold 9 when nothing came in) */
 {const px=11,pz=9.5,ex=arm().stock.find(k=>WD[k]&&WD[k].excl);bx(px,0.5,pz,1.0,1.0,0.8,[0.08,0.07,0.09]);bx(px,1.015,pz,1.0,0.03,0.8,[0.32,0.04,0.1]);for(const ez of [-0.41,0.41])bx(px,1.03,pz+ez,1.04,0.03,0.03,GOLD);for(const ex2 of [-0.51,0.51])bx(px+ex2,1.03,pz,0.03,0.03,0.84,GOLD);bx(px,0.62,pz+0.405,0.6,0.07,0.01,ex?[1,0.75,0.3]:[0.4,0.4,0.45],true);
  for(let k=0;k<12;k++){const an=k/12*TAU;bx(px+Math.cos(an)*0.66,0.02,pz+Math.sin(an)*0.54,0.06,0.01,0.06,[1,0.85,0.4],true);}
  if(ex){const bb=showBox(ex),s=0.75/bb.len;drawWeapon(B,A.mul(A.mul(A.mul(A.T(px+O,1.38+Math.sin(T*2)*0.04,pz+O),A.RY(T*0.9)),A.S(s,s,s)),A.T(0,-bb.cy,-bb.cz)),ex);}else nineWord(B,'9',px+O,1.15,pz+O,0.3,GOLD);}
 /* the counter: glass front lit from inside, brass rail, cash register, bell; Nine's back shelf with boxed pieces on top */
 bx(10.5,0.47,12.5,11,0.94,0.8,hex(0x2a2430));bx(10.5,0.96,12.5,11.1,0.05,0.9,[0.2,0.22,0.27]);bx(10.5,0.55,12.09,10.6,0.55,0.01,[0.2,0.32,0.45],true);bx(10.5,0.97,12.06,11.1,0.025,0.025,GOLD,true);
 for(let i=0;i<7;i++)gun(['pistol','smg','revolver','silenced','dual','knife','pistol'][i],6.4+i*1.35,0.62,12.07,Math.PI/2,1.4);
 bx(13.4,1.12,12.5,0.45,0.3,0.4,hex(0x3a3a40));bx(13.4,1.3,12.42,0.38,0.1,0.16,hex(0x1a1a1e));bx(13.4,1.31,12.31,0.22,0.05,0.005,[0.3,1,0.5],true);bx(8,1.02,12.4,0.12,0.06,0.12,GOLD);
 bx(10.5,0.6,14.5,11,1.2,0.8,hex(0x3a2a20));bx(10.5,1.22,14.5,11.1,0.05,0.85,BR);for(let i=0;i<10;i++){const x=5.6+i*1.0;if(i%2)bx(x,1.31,14.5,0.5,0.14,0.3,i%4===1?OL:[0.45,0.1,0.12]);else gun(['m16','shotgun','smg','double','revolver'][i/2],x,1.27,14.5,Math.PI/2+0.3,1.3,true);}
 nineWord(B,'TODAY',6.3+O,0.42,14.08+O,0.16,CYAN);
 /* ---- armoury (west back room): gun safes against the north wall, crates and ammo cans ---- */
 for(let i=0;i<3;i++){const x=5.5+i;bx(x,0.95,16.45,0.9,1.9,0.7,hex(0x2a3a34));bx(x,0.95,16.82,0.82,1.8,0.02,hex(0x22302a));bx(x+0.28,1.0,16.84,0.06,0.2,0.04,[0.75,0.7,0.5]);bx(x-0.2,1.5,16.84,0.12,0.12,0.02,[0.3,0.8,0.4],true);}
 for(const [x,z,h] of [[1.5,19.5,0.9],[2.5,19.5,0.6],[1.5,20.5,0.9],[2.5,20.5,0.9],[1.5,21.4,0.6],[2.5,21.4,0.6],[1.5,19.5,1.6],[1.5,20.5,1.6]]){B.box(TRS(x+O,h-0.33,z+O,0,0.86,0.62,0.86),[0.85,0.75,0.6],false,TUV[53]);}
 for(let i=0;i<5;i++)bx(4.2+i*0.42,0.17,21.3,0.34,0.34,0.22,OL);bx(4.0,0.06,18.7,1.4,0.1,1.0,BR);bx(4.0,0.35,18.7,1.0,0.4,0.6,[0.8,0.7,0.5]);
 nineWord(B,'ARMOURY',4.5+O,1.95,16.07+O,0.17,[1,0.75,0.3]);
 /* ---- workshop: the bench where Nine fits suppressors and mags, his desk, a safe and the CCTV ---- */
 bx(12,0.86,16.45,5,0.06,0.8,BR);for(const lx of [9.7,14.3])bx(lx,0.42,16.45,0.08,0.84,0.7,ST);bx(12,1.55,16.08,5,1.2,0.05,hex(0x2a2226));
 for(const [t,x] of [['pistol',10.2],['smg',11.4],['silenced',12.7],['revolver',13.8]])gun(t,x,1.6,16.14,Math.PI/2,1.6);
 bx(10.4,0.98,16.5,0.3,0.18,0.18,ST);bx(10.4,1.1,16.5,0.08,0.1,0.32,ST);gun('m16',12.2,0.9,16.55,Math.PI/2,1.0,true);bx(13.5,0.92,16.5,0.12,0.06,0.18,DARK);bx(13.75,0.92,16.45,0.06,0.06,0.17,DARK);
 bx(12.5,0.74,19.5,1.8,0.06,0.85,hex(0x4a2a1a));for(const [lx,lz] of [[-0.82,-0.36],[0.82,-0.36],[-0.82,0.36],[0.82,0.36]])bx(12.5+lx,0.36,19.5+lz,0.07,0.72,0.07,hex(0x2a1a10));
 bx(12.2,0.79,19.45,0.5,0.03,0.34,[0.9,0.88,0.8]);bx(12.95,0.86,19.4,0.32,0.12,0.22,[0.15,0.15,0.17]);bx(12.5,0.5,20.35,0.5,0.06,0.5,[0.6,0.08,0.1]);bx(12.5,0.85,20.58,0.5,0.6,0.06,[0.6,0.08,0.1]);
 bx(15.4,0.5,21.35,0.8,1.0,0.6,hex(0x2a2a30));bx(15.4,0.55,21.03,0.25,0.25,0.02,[0.7,0.7,0.72]);
 {const on=Math.floor(T*1.5)%2;bx(9.6,1.9,20.5,0.4,0.32,0.4,[0.14,0.14,0.16]);bx(9.82,1.9,20.5,0.02,0.24,0.32,on?[0.35,0.55,0.45]:[0.3,0.45,0.4],true);}
 bx(14.5,1.6,16.07,0.6,0.8,0.02,[0.75,0.1,0.12]);bx(14.5,1.72,16.06,0.18,0.18,0.01,[1,0.85,0.3],true);
 /* ---- hallway to the range: trophy frames, a bench and a water cooler ---- */
 for(let i=0;i<4;i++)bx(17.06,1.5,16.3+i*1.3,0.03,0.5,0.7,[0.75,0.6,0.3]),bx(17.08,1.5,16.3+i*1.3,0.02,0.4,0.58,[0.15,0.2,0.3]);
 bx(18,0.42,21.4,1.6,0.12,0.45,BR);bx(17.4,0.2,21.4,0.08,0.4,0.4,ST);bx(18.6,0.2,21.4,0.08,0.4,0.4,ST);bx(20.5,0.55,21.4,0.4,1.1,0.4,[0.85,0.85,0.88]);bx(20.5,1.25,21.4,0.3,0.3,0.3,[0.4,0.7,0.95]);
 nineWord(B,'RANGE',19+O,2.0,16.08+O,0.2,RED);
 /* ---- the range: backstop berm, lane numbers, floor lines, paper targets on carriers, the bench and booth dividers ---- */
 bx(26.5,0.45,6.35,9,0.9,0.7,[0.12,0.11,0.1]);bx(26.5,1.2,6.15,9,0.8,0.3,[0.16,0.14,0.12]);bx(26.5,2.15,6.1,9,1.1,0.1,[0.22,0.2,0.18]);
 nineWord(B,"NINE'S RANGE",27.5,2.15,6.2+O,0.26,[1*fl,0.25*fl,0.3*fl]);
 BK.lanes.forEach((lx,i)=>nineWord(B,String(i+1),lx+O,1.75,6.32+O,0.22,[1,1,1]));
 for(const lx of [25,28]){bx(lx,0.012,10.5,0.06,0.012,9,[0.9,0.85,0.3],true);bx(lx,0.75,15.1,0.06,1.5,1.2,hex(0x3a3a44));}
 for(let z=8;z<=14;z+=2)for(const lx of BK.lanes)bx(lx,0.014,z,0.6,0.012,0.04,[0.85,0.85,0.9]);
 bx(26.5,0.5,15.2,9,0.08,0.7,[0.36,0.36,0.4]);for(const lx of [22.2,30.8])bx(lx,0.25,15.2,0.08,0.5,0.6,ST);
 for(const lx of BK.lanes){bx(lx,0.6,15.0,0.5,0.04,0.3,[0.2,0.6,0.25]);bx(lx+0.6,0.57,15.25,0.24,0.08,0.18,[0.12,0.12,0.14]);bx(lx-0.6,0.58,15.3,0.22,0.1,0.14,OL);}
 const R=g.range;if(R)for(const L of R.lanes){const x=L.x,z=L.z,dn=L.down,hl=L.flash>0?1:0;
  B.box(TRS(L.base,2.45,z,0,0.04,0.03,0.04),DK);B.box(TRS(x,2.4,z,0,0.12,0.06,0.12),ST);B.box(TRS(x,2.1,z,0,0.01,0.6,0.01),[0.6,0.6,0.62]);
  const m=A.mul(A.T(x,1.78,z),A.RX(dn*1.35)),P=(px,py,pz,sx,sy,sz,c,em)=>B.box(A.mul(m,TRS(px,py,pz,0,sx,sy,sz)),c,em);
  P(0,0,0,0.8,0.03,0.03,[0.3,0.3,0.32]);P(0,-0.6,0.01,0.72,1.2,0.012,hl?[1.2,1.15,1]:[0.92,0.9,0.85],hl);P(0,-0.12,0.02,0.3,0.28,0.01,[0.1,0.1,0.12]);P(0,-0.8,0.02,0.56,0.8,0.01,[0.1,0.1,0.12]);
  P(0,-0.74,0.025,0.34,0.46,0.01,[0.9,0.9,0.86]);P(0,-0.74,0.03,0.13,0.18,0.01,RED,true);P(0,-0.12,0.025,0.13,0.13,0.01,[0.9,0.9,0.86]);
  for(const pz of [0.03])B.box(TRS(L.base,0.012,z,0,2.2,0.012,0.05),[0.5,0.5,0.52]);}
 /* the monitor over the bench, showing hits as lit bars */
 {const n=R?Math.min(10,Math.round(R.fired?R.hits/R.fired*10:0)):0;bx(26.5,2.45,14.7,2.2,0.6,0.08,DK);bx(26.5,2.45,14.75,2.05,0.48,0.01,[0.05,0.08,0.12],true);for(let i=0;i<10;i++)bx(25.6+i*0.2,2.45,14.76,0.14,0.32,0.01,i<n?(i<4?RED:i<7?[1,0.8,0.25]:[0.3,1,0.5]):[0.12,0.14,0.18],i<n);
  bx(26.5,3.0,14.7,0.04,0.5,0.04,DK);}
 /* behind the line: lockers, an ear-defender rack, a bench and a rules board */
 for(let i=0;i<3;i++){const z=19.4+i;bx(30.65,1.0,z,0.6,2.0,0.92,[0.35,0.4,0.48]);bx(30.33,1.0,z,0.02,1.9,0.86,[0.3,0.35,0.42]);for(let k=0;k<3;k++)bx(30.32,1.7-k*0.08,z,0.01,0.03,0.5,DK);}
 bx(22.2,1.6,19.5,0.08,0.06,1.4,ST);for(let i=0;i<4;i++){bx(22.3,1.45,19.0+i*0.33,0.14,0.2,0.08,[0.9,0.3,0.15]);bx(22.3,1.58,19.0+i*0.33,0.05,0.04,0.24,DK);}
 bx(26,0.42,21.3,3,0.1,0.45,BR);for(const lx of [24.7,27.3])bx(lx,0.2,21.3,0.08,0.4,0.4,ST);
 bx(26.5,1.6,18.4,0.02,0,0,DK);
 /* the doors (world coordinates, they swing when you walk into them): steel grey with a red stripe on the range door */
 for(const d of g.doors||[]){const a=d.base+d.th,e=doorEnd(d),m0=A.mul(A.T((d.hx+e[0])/2,0,(d.hz+e[1])/2),A.RY(-a)),rng=d.hx>21.5;B.box(A.mul(m0,TRS(0,0.56,0,0,0.98,1.1,0.06)),[0.3,0.31,0.34]);B.box(A.mul(m0,TRS(0,0.6,0,0,0.7,0.8,0.075)),rng?[0.75,0.12,0.14]:[0.22,0.23,0.26]);
  B.box(TRS(d.hx+Math.cos(a)*0.84,0.56,d.hz+Math.sin(a)*0.84,-a,0.05,0.05,0.16),GOLD);}
 /* bullets, muzzle flashes and spent casings while the range is live (the hub's own draw doesn't know about them) */
 for(const b of g.bullets)B.box(TRS(b.x,0.74,b.z,Math.atan2(b.dx,b.dz),0.035,0.035,0.45),[1,0.95,0.55],true);
 if(g.flashes)for(const f of g.flashes)drawFlash(B,f);
 if(R&&R.on)for(const q of g.gibs)B.box(A.mul(A.mul(A.T(q.x,q.y,q.z),A.mul(A.RY(q.ry),A.RX(q.rx))),A.S(q.sx,q.sy,q.sz)),q.c);}
