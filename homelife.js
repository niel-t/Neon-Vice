'use strict';
/* HOME LIFE: more to own and more to do at home.
   Three new upgrades for Room 14, the studio and the penthouse (sold on the home phone and at Casa Bonita):
     the WARDROBE   change into any outfit you own (signature, unlocked and tailored suits) without going to the mall
     the WEIGHT BENCH   work out once per job for XP
     the MINIBAR    pour a drink: the room sways a little, the girls come over for a toast (the penthouse bar is always open)
   and things to do:
     THROW A PARTY  from the home phone, once per job (Villa Solana too): guests dance in the living room until you go to bed,
                    then a morning-after visitor at the door
     WATCH TV       on Room 14's stolen CRT
   Positions are world cells (the loader pads maps by one cell). Things sit against the west, east or north walls: the camera
   looks north, so anything against a south wall would hide behind it. */

const HL_CAT=[
 [{k:'wardrobe',name:'PARTICLEBOARD WARDROBE',price:600,desc:'One door sticks, the mirror is cracked. Change into anything you own.'},
  {k:'bench',name:'RUSTY WEIGHT BENCH',price:500,desc:'Out on the patio with a bar and mismatched plates. Work out once a job for XP.'},
  {k:'bar',name:'BEER COOLER',price:250,desc:'Styrofoam, full of ice and cheap cans. Pour a drink.'}],
 [{k:'wardrobe',name:'MIRRORED CLOSET',price:2500,desc:'Floor-to-ceiling mirrors, pastel trim. Change into anything you own.'},
  {k:'bench',name:'CHROME HOME GYM',price:2000,desc:'A bench and barbell on the terrace, facing the ocean. Work out once a job for XP.'},
  {k:'bar',name:'BRASS BAR CART',price:1800,desc:'Rum, gin, a pineapple and an ice bucket on wheels. Pour a drink.'}],
 [{k:'wardrobe',name:'WALK-IN DRESSING WALL',price:9000,desc:'Black lacquer, gold rails, a lit mirror and every suit on show. Change into anything you own.'},
  {k:'bench',name:'GOLD-PLATE HOME GYM',price:8000,desc:'Bench, gold plates and a dumbbell rack up on the terrace. Work out once a job for XP.'}],
 []];
/* where each piece stands, per home: x,z = centre, ry = turn (0 faces the camera), sol = cells it blocks, use = where you stand to use it */
const HL_POS=[
 {wardrobe:{x:2.27,z:10.6,ry:Math.PI/2,sol:[[2,10],[2,11]],use:{x:3.0,z:10.6}},
  bench:{x:7.6,z:5.5,ry:0,sol:[[7,5],[8,5]],use:{x:7.6,z:6.3}},
  bar:{x:16.7,z:8.45,ry:-Math.PI/2,sol:[[16,8]],use:{x:15.9,z:8.6}}},
 {wardrobe:{x:8.72,z:13.0,ry:-Math.PI/2,sol:[[8,13]],use:{x:7.9,z:13.0}},
  bench:{x:12.5,z:8.65,ry:0,sol:[[12,8],[13,8]],use:{x:12.5,z:9.5}},
  bar:{x:21.74,z:15.5,ry:-Math.PI/2,sol:[[21,15]],use:{x:20.9,z:15.5}}},
 {wardrobe:{x:8.72,z:11.5,ry:-Math.PI/2,sol:[[8,11],[8,12]],use:{x:7.9,z:11.5}},
  bench:{x:20.0,z:6.4,ry:0,sol:[[19,6],[20,6],[19,5],[20,5]],use:{x:20.0,z:7.3}},
  bar:{x:10.2,z:17.3,ry:0,sol:[],use:{x:10.2,z:17.4},built:1}},
 {}];
const HL_GYM_XP=[80,120,160],HL_PARTY=[{price:500,n:5,xp:150},{price:2500,n:7,xp:250},{price:7500,n:9,xp:400},{price:20000,n:12,xp:600}];
const HL_LINES={pguest:["Who IS this guy?","Is it true you know McWey?","Great place. Is that real marble?","I came with Linda. Where's Linda?","Turn it up!","Somebody said there's a shark in the tank. Is there a shark?","I love this song!","You throw a better party than Club Flamingo.","Don't tell my husband I'm here.","Is that real gold?"]};
const HL_TOAST=["To Miami!","Cheers, baby.","To the money!","Salud!","One more and I'm dancing on the table.","To you, handsome."];
const HL_TV=[["CHANNEL 7: ...a body was found in Biscayne Bay. Police say no suspects.","Click."],["INFOMERCIAL: The Thigh-Master 3000! Call now!","...you change the channel."],["NEWS: Metro-Dade promises a crackdown on Ocean Drive.","Sure they do."],["AEROBICS: And reach, and stretch, and feel the burn!","You feel the burn of shame."],["WEATHER: 89 degrees, humid, a 30% chance of gunfire.","Sounds about right."],["SOAP: 'Rodrigo! The baby is not yours!'","Gasp."],["SPORTS: The Dolphins lose again.","Somebody owes you money now."],["MUSIC VIDEO: synths, a white suit, a speedboat at sunset.","Inspiring."]];
/* a party morning: somebody at the door after the guests are gone */
const HL_MORNING=[
 {who:'THE MORNING AFTER',msg:'Glitter everywhere, a stranger asleep in the bathtub and a stack of bills under an empty bottle. "For the champagne. Call me. - M."',fxt:'+$1,200',fx:p=>{p.wallet+=1200;}},
 {who:'THE NEIGHBOURS',msg:'A petition under the door, forty signatures long, about "the noise", "the conga line" and "the man in the fountain". Somebody has to pay for the fountain.',fxt:'-$600',fx:p=>{p.wallet=Math.max(0,p.wallet-600);}},
 {who:'A HUNGOVER GUEST',msg:'"Best party in Miami, man. My cousin runs numbers in Little Havana. He wants to meet you." He leaves a gold card with a phone number.',fxt:'+150 XP · PEOPLE ARE TALKING',fx:()=>{awardXP(150);}},
 {who:'THE CLEANING LADY',msg:'She looks at the living room, crosses herself, and asks for double. She finds a Rolex in the couch on her way out and keeps it.',fxt:'-$300',fx:p=>{p.wallet=Math.max(0,p.wallet-300);}},
 {who:'A PHOTO IN THE HERALD',msg:'Society page: "Mystery Host Throws the Party of the Season." You are a blur behind a palm. Your tailor calls to say congratulations.',fxt:'+$500 · FONTAINE SENDS A GIFT',fx:p=>{p.wallet+=500;}}];

const hlFurn=()=>homeFurn();
const hlTier=g=>Math.min(g.home,2);
function hlHas(g,k){if(g.home===3)return false;const P=HL_POS[g.home][k];return !!P&&(P.built||!!hlFurn()[k]);}

/* ---- spawn, solids and the party guests ---- */
function hlExtras(g){const p=myProg();if(g.home!==3){const P=HL_POS[g.home];for(const k of ['wardrobe','bench','bar'])if(hlHas(g,k))for(const [x,z] of P[k].sol)if(x>0&&z>0&&x<g.W-1&&z<g.H-1)g.solid[z*g.W+x]=1;}
 if(hlPartyOn(p,g.home)&&(g.home!==3||g.mfl===0)&&!g.spawned.party)hlGuests(g);}
function hlPartyOn(p,t){const q=p.party;return !!q&&q.on&&q.key===arm().jobs&&q.home===t;}
/* guests take free cells near the phone (or the mansion foyer), reached through open floor, not through walls */
function hlCells(g,n){const S=g.slots,o=S.o||{x:g.player.x,z:g.player.z},W=g.W,seen=new Set(),Q=[[Math.floor(o.x),Math.floor(o.z),0]],out=[];
 const free=(x,z)=>x>0&&z>0&&x<W-1&&z<g.H-1&&!g.solid[z*W+x]&&g.rows[z]&&g.rows[z][x]!=='D'&&!'#WR~ye'.includes(g.rows[z][x]);
 seen.add(Q[0][0]+','+Q[0][1]);while(Q.length){const [x,z,d]=Q.shift();if(d>0&&d<=7&&free(x,z)&&Math.hypot(x+0.5-o.x,z+0.5-o.z)>1.2)out.push([x,z]);if(d>=9)continue;
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,key=nx+','+nz;if(seen.has(key))continue;seen.add(key);if(free(nx,nz)||(g.rows[nz]&&g.rows[nz][nx]==='D'))Q.push([nx,nz,d+1]);}}
 /* spread them out: every other cell, shuffled with a fixed seed so a reload puts people back where they were */
 const pick=out.filter(([x,z])=>(x+z)%2===0);let s=7;const rnd2=()=>{s=(s*16807)%2147483647;return s/2147483647;};for(let i=pick.length-1;i>0;i--){const j=Math.floor(rnd2()*(i+1));[pick[i],pick[j]]=[pick[j],pick[i]];}
 return pick.slice(0,n);}
function hlGuests(g){g.spawned.party=1;const t=g.home,N=HL_PARTY[t].n,cells=hlCells(g,N),S=g.slots,c=S.s||S.o||{x:g.W/2,z:g.H/2};
 cells.forEach(([x,z],i)=>{const look=Object.assign(i%2?NPCLOOK.guest():NPCLOOK.lady(),{calm:1});
  const n=makeChar(x+0.5,z+0.5,look,false);const a=Math.atan2(c.x-n.x,c.z-n.z);Object.assign(n,{kind:'pguest',state:'idle',a,a0:a,r:0.28,said:false,dOff:i*0.7});n.body=look.body;g.npcs.push(n);});
 if(!g.disco&&(S.s||S.o)){const q=S.s||S.o;g.disco={x:q.x,z:q.z};g.hlDisco=1;}
 const L=['n_nightdrive','n_crystal','c_palms','n_haze'].filter(k=>typeof tapeOK!=='function'||tapeOK(k));if(L.length){g.hlTrack0=g.hlTrack0||g.track;g.track=L[0];}}
function hlEndParty(g){const p=myProg();if(!p.party||!p.party.on)return false;p.party.on=0;saveProg();
 if(g){g.npcs=g.npcs.filter(n=>n.kind!=='pguest');g.spawned.party=0;if(g.hlDisco){g.disco=null;g.hlDisco=0;const S=g.slots;if(g.home!==3&&homeFurn().disco&&S.s)g.disco={x:S.s.x,z:S.s.z};}if(g.hlTrack0){g.track=g.hlTrack0;g.hlTrack0=null;}}return true;}
function hlThrowParty(){const p=myProg(),a=arm(),t=p.home||0,P=HL_PARTY[t];
 if(p.party&&p.party.key===a.jobs)return renderStore(p.party.on?'The party is already going. Go dance.':'One party a night. The neighbours have lawyers.');
 if(p.wallet<P.price){sfx('blip');return renderStore('Not enough cash. Come back richer.');}
 p.wallet-=P.price;p.party={key:a.jobs,on:1,home:t};const ups=awardXP(P.xp);saveProg();sfx('cash');
 if(G&&G.slots&&G.home===t&&(t!==3||G.mfl===0))hlGuests(G);
 renderStore('PARTY! '+P.n+' guests on their way. +'+P.xp+' XP'+(ups?' · LEVEL UP':'')+'. Go to bed when you want them gone.');}
/* the party card on the home phone (with the side jobs) */
function hlPartyCard(){const p=myProg(),a=arm(),t=p.home||0,P=HL_PARTY[t],done=p.party&&p.party.key===a.jobs,on=done&&p.party.on;
 return `<button class="scard${on?' on':''}" data-hlparty="1"><div class="pn">THROW A PARTY</div><div class="pd">${P.n} guests, music, dancing until you go to bed. Once a night. +${P.xp} XP.</div><div class="sp">${on?'PARTY ON':done?'TOMORROW NIGHT':'$'+fmt(P.price)}</div></button>`;}

/* ---- what you can do ---- */
function hlTargets(g,t){if(g.home===3)return;const P=HL_POS[g.home];
 if(hlHas(g,'wardrobe'))t.push({k:'hl',x:P.wardrobe.use.x,z:P.wardrobe.use.z,r:1.4,lbl:'WARDROBE · CHANGE CLOTHES',fn:()=>hlWardrobe(g)});
 if(hlHas(g,'bench')){const a=arm(),done=myProg().gymKey===a.jobs;t.push({k:'hl',x:P.bench.use.x,z:P.bench.use.z,r:1.4,lbl:done?'WEIGHT BENCH · ALREADY PUMPED':'WEIGHT BENCH · WORK OUT (+'+HL_GYM_XP[hlTier(g)]+' XP)',fn:()=>hlWorkout(g)});}
 if(hlHas(g,'bar'))t.push({k:'hl',x:P.bar.use.x,z:P.bar.use.z,r:1.4,lbl:g.home===2?'THE BAR · POUR A DRINK':'POUR A DRINK',fn:()=>hlDrink(g)});
 if(g.home===0&&hlFurn().tv&&g.slots.b){const b=g.slots.b;t.push({k:'hl',x:b.x+0.2,z:b.z+0.6,r:1.3,lbl:'WATCH TV',fn:()=>hlTV(g)});}}
function hlWardrobe(g){const p=myProg(),own=SUITKEYS.filter(k=>k==='default'||suitOK(p,k));
 if(own.length<2){sfx('blip');popup(g.player.x,g.player.z,'NOTHING ELSE TO WEAR · TRY FONTAINE TAILORING','#ffd36b');return;}
 const k=own[(own.indexOf(mySuit())+1)%own.length];p.suit=k;saveProg();sfx('pick');if(typeof PS2C!=='undefined')PS2C.applySuit(rideId());
 popup(g.player.x,g.player.z-0.3,'NOW WEARING: '+SUITS[k].name,'#ff9ad5');if(k!=='default')popup(g.player.x,g.player.z+0.2,SUITS[k].desc.toUpperCase(),'#ffe9a8');}
function hlWorkout(g){const p=myProg(),a=arm(),pl=g.player;
 if(p.gymKey===a.jobs){sfx('blip');popup(pl.x,pl.z,'YOUR ARMS ARE JELLY · AGAIN AFTER THE NEXT JOB','#ffd36b');return;}
 const go=()=>{if(G!==g)return;p.gymKey=a.jobs;const xp=HL_GYM_XP[hlTier(g)],ups=awardXP(xp);saveProg();sfx('pick');g.hlPump=2.2;
  popup(pl.x,pl.z-0.4,'+'+xp+' XP · FEELING STRONG','#7dff9a');if(ups)popup(pl.x,pl.z+0.2,'LEVEL UP · PICK A PERK AFTER THE NEXT JOB','#ffd36b');
  const gs=g.npcs.filter(n=>n.kind==='pgirl'&&!n.bed&&!n.tub);if(gs.length){const n=gs[0];setTimeout(()=>{if(G===g)popup(n.x,n.z,pick(['Ooh, look at those arms.','Do one more, baby!','Sweaty. I like it.']),'#ffe9a8');},900);}};
 banner('WORKING OUT','Three sets of ten. Then five more for the mirror.');if(!fadeTo(go))go();}
function hlDrink(g){const pl=g.player;g.drinks=g.drinks||0;
 if(g.drinks>=4){sfx('blip');popup(pl.x,pl.z,"YOU'VE HAD ENOUGH, CHAMP",'#ffd36b');return;}
 g.drinks++;g.buzz=Math.min(40,(g.buzz||0)+12);sfx('click');popup(pl.x,pl.z-0.3,['A COLD ONE','ANOTHER ONE','DOUBLE, NO ICE','THE ROOM IS SPINNING'][g.drinks-1],'#9fe8ff');
 /* the girls (and anybody at the party) come over for a toast */
 const near=g.npcs.filter(n=>(n.kind==='pgirl'&&!n.bed&&!n.tub&&!n.seat)||n.kind==='pguest').sort((a,b)=>Math.hypot(a.x-pl.x,a.z-pl.z)-Math.hypot(b.x-pl.x,b.z-pl.z));
 near.slice(0,2).forEach((n,i)=>{if(n.kind==='pgirl'){n.tgt=[pl.x+(i?0.9:-0.9),pl.z+0.6];n.wait=0;n.stuck=0;}setTimeout(()=>{if(G===g)popup(n.x,n.z,pick(HL_TOAST),'#ffe9a8');},700+i*900);});}
function hlTV(g){if(g.talkT>0)return;const L=pick(HL_TV);g.talkT=L.length*1.6+0.4;sfx('click');const b=g.slots.b;let t=0;for(const line of L){setTimeout(()=>{if(G===g)popup(b.x+0.2,b.z,line,'#9fe8ff');},t);t+=1600;}}
/* the buzz wears off; the morning after waits for bed */
function hlTick(g,dt){if(g.buzz>0)g.buzz=Math.max(0,g.buzz-dt);else if(g.drinks&&g.buzz<=0)g.drinks=0;if(g.hlPump>0)g.hlPump-=dt;}
/* a gentle sway of the camera while you are buzzed (both renderers use the same eye and target) */
function hlSway(g,eye,tgt){const b=Math.min(1,(g.buzz||0)/20);if(b<=0)return;const T=g.T,sx=Math.sin(T*0.9)*0.32*b,sz=Math.cos(T*0.63)*0.22*b;tgt[0]+=sx;tgt[2]+=sz;eye[0]+=sx*0.4+Math.sin(T*1.7)*0.12*b;}
/* bed: the party ends, and the first sleep after it gets the morning-after visitor */
function hlSleep(g){return hlEndParty(g);}

/* ================= the models ================= */
function hlDraw(B,g){if(g.home===3)return;const t=g.home,P=HL_POS[t],T=g.T;
 for(const k of ['wardrobe','bench','bar']){if(!hlHas(g,k)||P[k].built)continue;const q=P[k];if(!hiVis(q.x,q.z,1.6))continue;
  hiWith(()=>{const K=hiKit(B,q.x,q.z,q.ry);if(k==='wardrobe')hlWardrobeM(K,t,T,g);else if(k==='bench')hlBenchM(K,t,T,g);else hlBarM(K,t,T);});}}
/* the wardrobe: 1.0 wide, 0.5 deep, back against the wall (local -z), doors toward you */
function hlWardrobeM(K,t,T,g){
 if(t===0){const PB=[0.62,0.46,0.3],PD=[0.48,0.34,0.2];K.rb(0,1.0,0,1.0,2.0,0.5,PB,0.12);K.bx(0,2.02,0,1.04,0.04,0.54,PD);K.bx(0,0.05,0.01,0.98,0.1,0.5,PD);
  K.bx(-0.25,1.05,0.253,0.47,1.8,0.012,PD);K.bx(0.25,1.05,0.253,0.47,1.8,0.012,[0.55,0.4,0.25]);K.bx(0.25,1.2,0.262,0.34,1.2,0.006,[0.6,0.68,0.72]);
  for(let i=0;i<4;i++)K.fr(0.25+(i-1.5)*0.06,1.2+(i%2?0.2:-0.15),0.266,0,0,0.6+i*0.5,0.008,0.4,0.002,[0.25,0.28,0.3]);/* the crack */
  for(const sx of [-0.04,0.04])K.rb(sx,1.1,0.27,0.03,0.14,0.03,[0.75,0.72,0.6],1);K.fr(-0.06,1.05,0.36,0.25,0,0,0.42,1.75,0.012,PD);/* the door that sticks, ajar */
  K.rb(-0.25,0.95,0.3,0.36,0.5,0.04,[0.85,0.25,0.3],0.6);/* a shirt hanging over it */K.rb(0.3,2.13,0,0.4,0.22,0.36,[0.6,0.5,0.32],0.4);K.bx(-0.2,2.1,0,0.34,0.14,0.3,[0.3,0.32,0.36]);}
 else if(t===1){const WH=[0.97,0.96,0.95],TR=[0.3,0.85,0.8],MR=[0.72,0.86,0.92];K.rb(0,1.05,0,1.0,2.1,0.5,WH,0.15);K.bx(0,2.12,0.02,1.04,0.06,0.54,TR);K.bx(0,0.04,0.02,1.02,0.08,0.52,[1,0.6,0.75]);
  for(const sx of [-0.25,0.25]){K.bx(sx,1.08,0.253,0.46,1.92,0.008,MR);K.bx(sx,1.08,0.258,0.04,1.9,0.004,[0.95,1,1],true);for(const y of [0.14,2.03])K.bx(sx,y,0.257,0.46,0.03,0.006,TR);}
  K.bx(0,1.08,0.258,0.02,1.92,0.006,TR);for(const sx of [-0.035,0.035])K.rb(sx,1.1,0.27,0.02,0.24,0.02,HI_CH,1);
  /* a glimpse of the player in the mirror: a moving smudge of colour when you stand in front */
  const p=g.player;if(p){const d=Math.hypot(p.x-HL_POS[1].wardrobe.use.x,p.z-HL_POS[1].wardrobe.use.z);if(d<1.6)K.bx(0.18,1.25,0.262,0.14,0.5,0.003,[1,0.7,0.82].map(v=>v*(1-d/1.6)),true);}
  K.rb(0.2,2.24,0,0.36,0.18,0.3,[1,0.75,0.85],0.5);K.rb(-0.2,2.22,0,0.3,0.14,0.28,[0.55,0.9,0.95],0.5);}
 else{const BK=[0.05,0.05,0.06],SU=[[0.95,0.94,0.9],[0.14,0.14,0.2],[0.98,0.75,0.68],[0.62,0.88,0.78],[0.75,0.62,0.9]];
  K.rb(0,1.15,-0.02,1.2,2.3,0.46,BK,0.1);K.bx(0,2.32,0.02,1.26,0.06,0.52,GOLD);K.bx(0,0.04,0.02,1.24,0.08,0.5,GOLD);
  /* open middle: a gold rail, suits on hangers, shoes on a lit shelf */
  K.bx(0,1.2,0.05,0.72,1.9,0.34,[0.1,0.09,0.1]);K.sf([-0.34,1.85,0.06],[0.34,1.85,0.06],0.02,0.02,GOLD);
  for(let i=0;i<5;i++){const x=-0.28+i*0.14,c=SU[i];K.rb(x,1.5,0.06,0.12,0.62,0.22,c,0.6,0.2);K.bx(x,1.82,0.06,0.1,0.05,0.02,GOLD);K.bx(x,1.62,0.175,0.03,0.2,0.005,[0.85,0.1,0.15]);}
  K.bx(0,0.62,0.12,0.7,0.02,0.28,[1.1,0.9,0.5],true);for(let i=0;i<4;i++)K.rb(-0.24+i*0.16,0.68,0.12,0.12,0.06,0.2,i%2?[0.06,0.05,0.05]:[0.95,0.94,0.9],0.6);
  K.bx(0,0.3,0.2,0.7,0.02,0.02,GOLD);for(const sx of [-1,1]){K.bx(sx*0.5,1.2,0.232,0.18,2.0,0.01,[0.65,0.62,0.6]);K.bx(sx*0.5,1.2,0.236,0.15,1.9,0.004,[0.9,0.92,0.95]);/* lit mirror strips */for(let j=0;j<7;j++)K.ball(sx*0.6,0.4+j*0.27,0.24,0.035,[1.4,1.2,0.8]);}
  K.bx(0,2.15,0.24,0.6,0.08,0.01,GOLD);}}
/* the weight bench: a padded bench along local x, uprights at the head end, a barbell on the hooks (lifted while you pump) */
function hlBenchM(K,t,T,g){const FR=[[0.42,0.24,0.16],HI_CH,[0.08,0.08,0.09]][t],PAD=[[0.55,0.12,0.1],[0.98,0.97,0.96],[0.12,0.12,0.13]][t],PL=[[0.2,0.2,0.22],[0.3,0.85,0.8],GOLD][t];
 K.rb(0,0.42,0,1.15,0.1,0.32,PAD,0.6);for(const sx of [-0.45,0.4]){K.rb(sx,0.2,0,0.05,0.38,0.05,FR,0.6);K.rb(sx,0.03,0,0.06,0.06,0.42,FR,0.6);}K.rb(0,0.33,0,1.0,0.05,0.06,FR,0.6);
 for(const sz of [-0.24,0.24]){K.rb(-0.55,0.55,sz,0.05,1.1,0.05,FR,0.6);K.rb(-0.55,0.03,sz,0.3,0.06,0.07,FR,0.6);K.rb(-0.5,0.9,sz,0.08,0.03,0.05,FR,0.6);}
 const up=(g.hlPump||0)>0?Math.abs(Math.sin(g.hlPump*5))*0.25:0,by=0.93+up;K.sf([-0.5,by,-0.62],[-0.5,by,0.62],0.025,0.025,HI_CH);
 for(const sz of [-1,1]){const n=t===0?(sz<0?2:1):2;for(let i=0;i<n;i++)K.cy(-0.5,by,sz*(0.4+i*0.06),t===0&&i?0.26:0.36,0.04,i&&t===0?[0.5,0.12,0.1]:PL,'x');K.cy(-0.5,by,sz*0.52,0.06,0.03,HI_CH,'x');}
 if(t===0){/* a cinder block and a towel */K.rb(0.62,0.1,0.3,0.36,0.2,0.18,[0.6,0.6,0.58],0.15);K.rb(0.1,0.48,0.05,0.4,0.02,0.22,[0.95,0.9,0.3],0.4);}
 else{/* the dumbbell rack */const rx=0.75;K.rb(rx,0.35,-0.05,0.14,0.7,0.36,FR,0.4,0.1);for(let i=0;i<3;i++){const y=0.25+i*0.18,d=0.08+i*0.015;K.sf([rx-0.02,y,-0.2],[rx-0.02,y,0.1],0.02,0.02,HI_CH);for(const sz of [-0.2,0.1])K.cy(rx-0.02,y,sz,d,0.04,PL,'z');}
  if(t===2){K.rb(0,0.48,0.02,0.5,0.02,0.18,[0.95,0.94,0.9],0.4);K.bx(0,0.475,0.17,0.3,0.03,0.005,GOLD);}
  else K.rb(0.15,0.48,0.0,0.4,0.02,0.2,[1,0.6,0.75],0.4);}}
/* the minibar: Room 14's beer cooler, the studio's brass bar cart */
function hlBarM(K,t,T){
 if(t===0){const ST=[0.95,0.95,0.92];K.rb(0,0.18,0,0.55,0.36,0.38,ST,0.3);K.rr(0,0.42,-0.22,0,-1.2,0,0.56,0.04,0.38,ST,0.4);K.bx(0,0.36,0,0.48,0.005,0.3,[0.75,0.9,1]);
  for(let i=0;i<6;i++){const x=-0.18+(i%3)*0.17,z=-0.07+Math.floor(i/3)*0.14;K.cy(x,0.38,z,0.07,0.1,i%2?[0.85,0.1,0.12]:[0.95,0.8,0.2],'y',false,0.4);}
  K.cy(0.42,0.06,0.12,0.07,0.12,[0.85,0.1,0.12],'y',false,0.4);K.rr(0.38,0.035,-0.1,0.9,0,Math.PI/2,0.07,0.12,0.07,[0.95,0.8,0.2],0.4);/* empties on the floor */}
 else{const BR=HI_BRASS,GL=[0.75,0.92,1];for(const sx of [-0.3,0.3])for(const sz of [-0.17,0.17])K.rb(sx,0.45,sz,0.025,0.9,0.025,BR,1);
  for(const y of [0.35,0.85]){K.rb(0,y,0,0.66,0.025,0.38,[0.55,0.75,0.8],0.2);K.bx(0,y+0.015,0,0.6,0.004,0.32,GL);}
  for(const sx of [-0.3,0.3])K.cy(sx,0.08,0.19,0.13,0.03,HI_BK,'z');K.ring(0.3,0.9,0,0.12,0.012,0.012,BR,10,'z');/* the handle */
  const BOT=[[0.35,0.18,0.08],[0.85,0.85,0.88],[0.15,0.45,0.2],[0.75,0.45,0.15]];BOT.forEach((c,i)=>{const x=-0.24+i*0.12;K.rb(x,1.0,-0.08,0.07,0.22,0.07,c,0.7);K.rb(x,1.14,-0.08,0.025,0.08,0.025,c,1);K.bx(x,1.0,-0.044,0.05,0.07,0.003,[0.95,0.92,0.8]);});
  K.cy(0.12,0.93,0.08,0.14,0.13,[0.85,0.85,0.88],'y',false,0.4);for(let i=0;i<4;i++)K.rb(0.09+(i%2)*0.05,1.0,0.06+(i>>1)*0.04,0.035,0.035,0.035,[0.85,0.95,1],0.6);/* ice bucket */
  K.rb(-0.18,0.94,0.1,0.13,0.17,0.12,[0.95,0.75,0.2],1);for(let i=0;i<5;i++)K.rr(-0.18,1.05,0.1,i*1.26,0.4,0,0.03,0.14,0.012,[0.2,0.6,0.25],0.8);/* the pineapple */
  for(let i=0;i<3;i++){K.cy(-0.15+i*0.15,0.42,0.06,0.06,0.1,GL,'y',false,0.6);}}}
