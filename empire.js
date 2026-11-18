'use strict';
/* ================= EMPIRE: TAKE OVER MIAMI =================
   Once McWey's loan is square (the Royal Flush, floor c7, is done) three crews move in on the businesses you already know: the
   Coral Snakes, Los Rayos and the Ivory Hand. The car menu opens THE EMPIRE: a map of Miami with every front, who holds it and
   what it pays. Each front is a takeover job (MISSIONS e_<k>, kind 'empire', in missions.js) on that floor's own map: the crew
   wears its colours and its lieutenant (a boss) waits at the far end. Win and the reward flag own_<k> makes it yours. Every
   owned front pays after every finished job, campaign or not (payout calls empPay); own all eight and you are KING OF MIAMI,
   and every front pays a quarter more. */
const EMP_GANGS={
 snakes:{name:'THE CORAL SNAKES',short:'CORAL SNAKES',col:'#ff3fa4',
  look:L=>{L.jacket=hex(0x15151a);L.shirt=hex(0xff3fa4);L.pants=hex(0x2a3a5a);L.shoes=hex(0x111114);},
  lt:{name:'"SPIKE" DELANEY',weapon:'shotgun',hp:8,intro:'The Coral Snakes lieutenant. Sawn-off and a bad temper. Keep moving.',dead:'SPIKE IS DOWN',
   look:()=>({skin:hex(0xd9a37c),jacket:hex(0x15151a),shirt:hex(0xff3fa4),pants:hex(0x2a3a5a),shoes:hex(0x111114),hair:hex(0x101010),hs:'mohawk',shades:true,chain:true,stubble:true,bw:1.25,bd:1.2,bh:1.04})}},
 rayos:{name:'LOS RAYOS',short:'LOS RAYOS',col:'#2de2e6',
  look:L=>{L.jacket=hex(0xf2efe6);L.shirt=hex(0x1fb5b8);L.pants=hex(0xf2efe6);L.shoes=hex(0xf2efe6);},
  lt:{name:'"EL CHACAL" MENDOZA',weapon:'mac10',hp:8,intro:'Los Rayos lieutenant. White suit, MAC-10, sprays the room. Use cover.',dead:'EL CHACAL IS DOWN',
   look:()=>({skin:hex(0xa8744f),jacket:hex(0xf2efe6),shirt:hex(0x1fb5b8),pants:hex(0xf2efe6),shoes:hex(0xf2efe6),hair:hex(0x101010),hs:'slick',stache:true,shades:true,chain:true,watch:true,bw:1.1,bd:1.05,bh:1.0})}},
 ivory:{name:'THE IVORY HAND',short:'IVORY HAND',col:'#e8e4f0',
  look:L=>{L.jacket=hex(0x34343e);L.shirt=hex(0xf4f4f4);L.pants=hex(0x34343e);L.shoes=hex(0x1a1410);},
  lt:{name:'"LEFTY" CAPUTO',weapon:'m16',hp:8,intro:'The Ivory Hand lieutenant. New York money with an M16. Flank him.',dead:'LEFTY IS DOWN',
   look:()=>({skin:hex(0xf0c8a0),jacket:hex(0x34343e),shirt:hex(0xf4f4f4),pants:hex(0x34343e),shoes:hex(0x1a1410),hair:hex(0x8a8a8a),hs:'slick',cigar:true,watch:true,bw:1.3,bd:1.25,bh:1.0,belly:true})}}};
const EMP_KING=1.25,EMP_GOLD='#ffd36b';
const empFront=k=>EMP_FRONTS.find(f=>f.k===k)||null;
const empMission=f=>'e_'+f.k;
const empOpen=()=>missionDone('c7');
function empOwns(f,p){p=p||myProg();const w=p&&p.wflags;return !!(w&&ownKey(w,'own_'+f.k)&&w['own_'+f.k]);}
const empOwned=p=>EMP_FRONTS.filter(f=>empOwns(f,p));
const empUnlocked=f=>missionUnlocked(empMission(f),missionCtx());
const empKing=p=>empOwned(p).length===EMP_FRONTS.length;
function empIncome(p){const o=empOwned(p),s=o.reduce((a,f)=>a+f.pay,0);return Math.round(s*(o.length===EMP_FRONTS.length?EMP_KING:1));}
/* the front a running mission is taking over (null outside takeovers) */
function empRun(){const m=typeof MISSION==='string'&&missionKnown(MISSION)&&MISSIONS[MISSION];return m&&m.kind==='empire'?empFront(m.front):null;}
/* news to show once you are home again: what the empire paid, what you took */
let EMP_NEWS=[];
function empPay(p){const r=empIncome(p);if(r>0){p.wallet+=r;p.empTot=(p.empTot||0)+r;EMP_NEWS.push(['YOUR EMPIRE PAID +$'+fmt(r),empOwned(p).length+' of '+EMP_FRONTS.length+' businesses'+(empKing(p)?' · king of Miami':'')]);}return r;}
/* payout() after a takeover: the reward flag is already set */
function empTaken(p,k){const f=empFront(k);if(!f)return;EMP_NEWS.push([f.name+' IS YOURS','+$'+fmt(f.pay)+' after every job · '+empOwned(p).length+' of '+EMP_FRONTS.length]);
 if(empKing(p)){const w=dlgObj(p,'wflags');if(!w.king_miami){w.king_miami=1;EMP_NEWS.push(['KING OF MIAMI','All eight are yours · every business pays 25% more']);}}}
function empNews(){if(!EMP_NEWS.length)return;const n=EMP_NEWS.splice(0);let i=0;const next=()=>{if(i>=n.length)return;const b=n[i++];banner(b[0],b[1]);sfx('cash');if(i<n.length)setTimeout(next,3200);};setTimeout(next,2400);}
/* thugs on a takeover wear their crew's colours (makeEnemy calls this before building the model) */
function turfLook(L){const f=empRun();if(!f||levelIdx!==f.base)return;const gg=EMP_GANGS[f.gang];delete L.torsoTile;L.apron=false;L.tee=false;gg.look(L);}
/* applyTwist 'turf': the lieutenant waits at the far end of the floor */
function turfSetup(g){const f=empRun();if(!f)return;const gg=EMP_GANGS[f.gang],p=g.player;g.turf={k:f.k,gang:f.gang,boss:gg.lt};
 let best=null,bd=0;for(let z=1;z<g.H-1;z++)for(let x=1;x<g.W-1;x++){const i=z*g.W+x;if(g.solid[i]||isOut(g,x,z)||g.furn[i])continue;const d=Math.hypot(x+0.5-p.x,z+0.5-p.z);if(d>bd){bd=d;best=[x+0.5,z+0.5];}}
 if(best)makeEnemy(g,{boss:gg.lt},levelIdx,gg.lt.weapon,true,best[0],best[1]);}

/* ---- THE EMPIRE screen (car menu, E / pad BACK): the map on the left, the fronts on the right ---- */
let EMP_SEL=0;
function empState(f){if(empOwns(f))return 'own';return empUnlocked(f)?'open':'lock';}
function openEmpire(){if(state!=='carmenu'||!empOpen())return;sfx('pick');state='empire';const i=EMP_FRONTS.findIndex(f=>empState(f)==='open');EMP_SEL=i>=0?i:0;show('sEmpire');renderEmpire('');}
function closeEmpire(){if(state!=='empire')return;sfx('blip');openCarMenuForce();}
function empLockTxt(f){return (f.need>7?'FINISH ':'FINISH ')+LEVELS[f.need].name+' FIRST';}
function renderEmpire(msg){const p=myProg(),own=empOwned(p),inc=empIncome(p);
 $('emWallet').textContent='$'+fmt(p.wallet);$('emInc').textContent=inc?'+$'+fmt(inc)+' AFTER EVERY JOB'+(p.empTot?' · EARNED $'+fmt(p.empTot):''):'NOTHING PAYS YOU YET';
 $('emSub').textContent='MIAMI · '+own.length+' OF '+EMP_FRONTS.length+' BUSINESSES'+(empKing(p)?' · KING OF MIAMI':'');
 $('emList').innerHTML=EMP_FRONTS.map((f,i)=>{const s=empState(f),gg=EMP_GANGS[f.gang];
  const who=s==='own'?'<b style="color:'+EMP_GOLD+'">YOURS</b>':s==='lock'?'<b style="color:#8a7a9a">'+empLockTxt(f)+'</b>':'HELD BY <b style="color:'+gg.col+'">'+gg.name+'</b>';
  return `<div class="emC ${s}${i===EMP_SEL?' sel':''}" data-i="${i}"><div class="emN">${f.name}</div><div class="emA">${f.area} · $${fmt(f.pay)} A JOB</div><div class="emW">${who}</div>${s==='open'?`<button class="btn sm emGo" data-go="${i}">TAKE IT OVER<span class="kbhint"> (ENTER)</span><span class="padhint"> (A)</span></button>`:''}</div>`;}).join('');
 $('emMsg').textContent=msg||'';drawEmpMap();empAnim();
 const el=$('emList').children[EMP_SEL];if(el&&el.scrollIntoView)try{el.scrollIntoView({block:'nearest'});}catch(e){}}
function empSelect(i){EMP_SEL=(i+EMP_FRONTS.length)%EMP_FRONTS.length;sfx('blip');renderEmpire('');}
function empGo(i){if(state!=='empire'||fading)return;const f=EMP_FRONTS[i];if(!f)return;const s=empState(f);
 if(s==='own'){sfx('blip');return renderEmpire(f.name+' is already yours. It pays after every job.');}
 if(s==='lock'){sfx('blip');return renderEmpire('You don\'t know that place yet. '+empLockTxt(f).toLowerCase().replace(/^./,c=>c.toUpperCase())+'.');}
 const id=empMission(f);sfx('pick');state='play';show(null);travel(()=>{JOBPICK=null;startMission(id);showObjCard();},f.name,'TAKEOVER · '+EMP_GANGS[f.gang].name);}
function empKey(e){const c=e.code;if(c==='Escape'||c==='Backspace'||c==='KeyE'){closeEmpire();return;}
 if(c==='ArrowUp'||c==='ArrowLeft'||c==='KeyW'||c==='KeyA')empSelect(EMP_SEL-1);else if(c==='ArrowDown'||c==='ArrowRight'||c==='KeyS'||c==='KeyD')empSelect(EMP_SEL+1);
 else if(c==='Enter'||c==='Space')empGo(EMP_SEL);}
function empPad(dir){if(pdown(1)||pdown(8)){closeEmpire();return;}if(pdown(12)||dir<0)empSelect(EMP_SEL-1);else if(pdown(13)||dir>0)empSelect(EMP_SEL+1);else if(pdown(0))empGo(EMP_SEL);}
/* ---- the map: a neon night chart of Miami, 1986. The geography (coast, islands, highways, causeways) is drawn once into a cached layer
   at the canvas's real pixel size; the turf glows, pins and the pulsing selection are drawn over it every frame while the screen is up.
   Map coordinates are 0..1 across a 0.9:1 frame fitted inside the canvas (EMP_FRONTS[].at uses them); land and sea run past the frame. ---- */
const EMP_ASPECT=0.9;
const EMP_GEO={
 main:[[-0.6,-0.3],[0.6,-0.3],[0.6,0],[0.592,0.1],[0.6,0.2],[0.585,0.3],[0.598,0.37],[0.625,0.44],[0.61,0.5],[0.585,0.57],[0.565,0.64],[0.54,0.72],[0.5,0.79],[0.47,0.86],[0.44,0.94],[0.41,1.05],[0.39,1.3],[-0.6,1.3]],
 beach:[[0.785,-0.3],[0.78,0],[0.772,0.15],[0.765,0.3],[0.768,0.45],[0.774,0.58],[0.785,0.68],[0.805,0.735],[0.83,0.73],[0.85,0.66],[0.862,0.55],[0.87,0.4],[0.875,0.2],[0.882,0],[0.89,-0.3]],
 isles:[[[0.705,0.48],[0.735,0.47],[0.74,0.5],[0.71,0.51]],[[0.635,0.545],[0.70,0.555],[0.705,0.575],[0.64,0.57]],[[0.79,0.78],[0.815,0.775],[0.82,0.8],[0.795,0.805]],
  [[0.665,0.86],[0.69,0.84],[0.735,0.9],[0.75,0.98],[0.74,1.08],[0.715,1.08],[0.7,0.97]],[[0.66,0.415],[0.672,0.41],[0.674,0.425],[0.662,0.428]],[[0.69,0.418],[0.703,0.413],[0.705,0.428],[0.692,0.43]],[[0.72,0.42],[0.734,0.416],[0.736,0.43],[0.722,0.433]]],
 roads:[{n:'I-95',w:3.2,c:'#ffd36b',p:[[0.4,-0.3],[0.41,0.2],[0.43,0.38],[0.46,0.52],[0.45,0.64],[0.41,0.8],[0.38,1.3]]},
  {n:'',w:2.4,c:'#ff8a3a',p:[[-0.6,0.47],[0.2,0.475],[0.46,0.5],[0.6,0.49]]},
  {n:'US 1',w:2,c:'#ff8a3a',p:[[0.575,0.6],[0.5,0.72],[0.42,0.82],[0.3,0.98],[0.2,1.3]]},
  {n:'',w:1.6,c:'#ff8a3a',p:[[0.58,0.0],[0.57,0.2],[0.585,0.4]]},
  {n:'',w:1.6,c:'#ff8a3a',p:[[0.82,-0.3],[0.815,0.2],[0.81,0.45],[0.815,0.7]]}],
 bridges:[[[0.588,0.25],[0.767,0.27]],[[0.6,0.42],[0.766,0.44]],[[0.612,0.5],[0.72,0.55],[0.778,0.62]],[[0.565,0.645],[0.62,0.72],[0.68,0.86]]],
 labels:[['LITTLE HAVANA',0.25,0.58],['WYNWOOD',0.5,0.2],['DOWNTOWN',0.5,0.4],['BRICKELL',0.45,0.66],['COCONUT GROVE',0.3,0.88],['OVERTOWN',0.3,0.36]],
 water:[['BISCAYNE',0.69,0.7],['BAY',0.7,0.74],['ATLANTIC OCEAN',0.955,0.55,'v']],
 palms:[[0.86,0.6],[0.862,0.5],[0.866,0.4],[0.87,0.3],[0.872,0.2],[0.874,0.1],[0.848,0.69],[0.745,0.95],[0.73,0.89]]};
let EMP_LAYER=null,EMP_RECT=null,EMP_ANIM=0,EMP_SPARK=[];
function empRng(seed){let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
function empPath(c,P,R,closed){/* a smooth curve through the points (Catmull-Rom as Beziers) */
 const pts=P.map(R),n=pts.length;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
 for(let i=0;i<(closed?n:n-1);i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];const a=closed||i>0?p0:p1,d=closed||i<n-2?p3:p2;
  c.bezierCurveTo(p1[0]+(p2[0]-a[0])/6,p1[1]+(p2[1]-a[1])/6,p2[0]-(d[0]-p1[0])/6,p2[1]-(d[1]-p1[1])/6,p2[0],p2[1]);}
 if(closed)c.closePath();}
function empFont(px,bold){return (bold?'bold ':'')+Math.round(px)+"px 'Press Start 2P',monospace";}
function empBuildLayer(W,H){const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
 const mh=Math.min(H,W/EMP_ASPECT),mw=mh*EMP_ASPECT,ox=(W-mw)/2,oy=(H-mh)/2,R=([x,y])=>[ox+x*mw,oy+y*mh],u=mh/400;EMP_RECT={ox,oy,mw,mh,u};
 const rng=empRng(1986);
 /* sea: deep navy with a warm horizon glow off the beach */
 let gr=c.createLinearGradient(0,0,W,0);gr.addColorStop(0,'#04102a');gr.addColorStop(0.6,'#062244');gr.addColorStop(1,'#0a2e58');c.fillStyle=gr;c.fillRect(0,0,W,H);
 gr=c.createRadialGradient(ox+mw*1.05,oy+mh*0.05,0,ox+mw*1.05,oy+mh*0.05,mh*0.75);gr.addColorStop(0,'rgba(255,63,164,.32)');gr.addColorStop(0.5,'rgba(255,120,80,.08)');gr.addColorStop(1,'rgba(255,63,164,0)');c.fillStyle=gr;c.fillRect(0,0,W,H);
 /* swell lines on the open sea */
 c.strokeStyle='rgba(45,226,230,.10)';c.lineWidth=Math.max(1,u);for(let k=0;k<26;k++){const y=oy+(k/26)*mh*1.1-mh*0.05,x0=ox+mw*(0.9+rng()*0.05);c.beginPath();c.moveTo(x0,y);for(let x=x0;x<W;x+=6*u)c.lineTo(x,y+Math.sin(x/(9*u)+k)*1.6*u);c.stroke();}
 const land=(P,fill)=>{empPath(c,P,R,true);c.fillStyle=fill;c.fill();};
 const coast=P=>{empPath(c,P,R,true);c.save();c.strokeStyle='rgba(232,196,138,.55)';c.lineWidth=5*u;c.stroke();c.shadowColor='#2de2e6';c.shadowBlur=10*u;c.strokeStyle='rgba(45,226,230,.9)';c.lineWidth=1.6*u;c.stroke();c.restore();};
 /* glow of the shallows */
 c.save();c.shadowColor='rgba(45,226,230,.35)';c.shadowBlur=22*u;for(const P of [EMP_GEO.main,EMP_GEO.beach,...EMP_GEO.isles])land(P,'#0a2f4e');c.restore();
 /* land */
 const lg=c.createLinearGradient(ox,oy,ox+mw*0.6,oy+mh);lg.addColorStop(0,'#24103a');lg.addColorStop(1,'#1a0a2c');
 for(const P of [EMP_GEO.main,EMP_GEO.beach,...EMP_GEO.isles])land(P,lg);
 /* city blocks with lit windows, clipped to the land */
 c.save();empPath(c,EMP_GEO.main,R,true);empPath(c,EMP_GEO.beach,R,true);c.beginPath();
 for(const P of [EMP_GEO.main,EMP_GEO.beach]){const pts=P.map(R);c.moveTo(pts[0][0],pts[0][1]);for(const q of pts)c.lineTo(q[0],q[1]);c.closePath();}c.clip();
 const step=11*u;for(let y=oy-mh*0.3;y<oy+mh*1.3;y+=step)for(let x=0;x<W;x+=step){const dense=1-Math.min(1,Math.hypot((x-ox)/mw-0.55,(y-oy)/mh-0.48)*1.6);
  c.fillStyle='rgba(120,70,170,'+(0.1+dense*0.18)+')';c.fillRect(x+1.5*u,y+1.5*u,step-3*u,step-3*u);
  if(rng()<0.25+dense*0.5){c.fillStyle=rng()<0.7?'rgba(255,211,107,'+(0.35+rng()*0.5)+')':'rgba(45,226,230,.6)';c.fillRect(x+2*u+rng()*(step-5*u),y+2*u+rng()*(step-5*u),1.6*u,1.6*u);}}
 /* downtown towers glow */
 gr=c.createRadialGradient(ox+mw*0.56,oy+mh*0.47,0,ox+mw*0.56,oy+mh*0.47,mh*0.16);gr.addColorStop(0,'rgba(255,211,107,.28)');gr.addColorStop(1,'rgba(255,211,107,0)');c.fillStyle=gr;c.fillRect(0,0,W,H);
 c.restore();
 for(const P of [EMP_GEO.main,EMP_GEO.beach,...EMP_GEO.isles])coast(P);
 /* causeways: a pale deck with lamps */
 for(const B of EMP_GEO.bridges){c.save();c.lineCap='round';c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=6*u;empPath(c,B,R,false);c.stroke();c.strokeStyle='#d9c8ec';c.lineWidth=3*u;c.stroke();c.setLineDash([2*u,6*u]);c.strokeStyle='#ffd36b';c.lineWidth=1.4*u;c.stroke();c.restore();}
 /* highways */
 for(const r of EMP_GEO.roads){c.save();c.lineCap='round';c.lineJoin='round';empPath(c,r.p,R,false);c.shadowColor=r.c;c.shadowBlur=8*u;c.strokeStyle=r.c;c.globalAlpha=0.85;c.lineWidth=r.w*u;c.stroke();c.restore();
  if(r.n){const q=R(r.p[r.n==='I-95'?2:1]);c.save();c.font=empFont(6*u);const tw=c.measureText(r.n).width+6*u;c.fillStyle='#1a0c2a';c.strokeStyle=r.c;c.lineWidth=1.2*u;c.fillRect(q[0]-tw/2,q[1]-5*u,tw,10*u);c.strokeRect(q[0]-tw/2,q[1]-5*u,tw,10*u);c.fillStyle=r.c;c.textAlign='center';c.textBaseline='middle';c.fillText(r.n,q[0],q[1]+0.5*u);c.restore();}}
 /* palms along the beach */
 for(const pp of EMP_GEO.palms){const [x,y]=R(pp);c.save();c.strokeStyle='#7dff9a';c.globalAlpha=0.75;c.lineWidth=1.2*u;c.beginPath();c.moveTo(x,y+4*u);c.quadraticCurveTo(x+1*u,y,x,y-3*u);c.stroke();
  for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*0.6;c.beginPath();c.moveTo(x,y-3*u);c.quadraticCurveTo(x+Math.cos(a)*3*u,y-3*u+Math.sin(a)*3*u-1*u,x+Math.cos(a)*5*u,y-3*u+Math.sin(a)*5*u+1.5*u);c.stroke();}c.restore();}
 /* names */
 c.textAlign='center';c.textBaseline='middle';
 for(const [t,x,y] of EMP_GEO.labels){const q=R([x,y]);c.font=empFont(5.5*u);c.fillStyle='rgba(0,0,0,.6)';c.fillText(t,q[0]+u,q[1]+u);c.fillStyle='rgba(233,199,255,.62)';c.fillText(t,q[0],q[1]);}
 {const q=R([0.818,0.22]);c.save();c.translate(q[0],q[1]);c.rotate(Math.PI/2);c.font=empFont(6*u);c.fillStyle='rgba(255,211,107,.75)';c.fillText('MIAMI BEACH',0,0);c.restore();}
  for(const [t,x,y,v] of EMP_GEO.water){const q=R([x,y]);c.save();c.translate(q[0],q[1]);if(v)c.rotate(Math.PI/2);c.font='italic '+Math.round(9*u)+'px Georgia,serif';c.fillStyle='rgba(45,226,230,.45)';c.fillText(t.split('').join(String.fromCharCode(8202)),0,0);c.restore();}
 /* title cartouche and compass */
 {const x=ox+10*u,y=oy+10*u;c.save();c.fillStyle='rgba(10,4,20,.78)';c.strokeStyle='#ff2d95';c.lineWidth=1.5*u;c.fillRect(x,y,100*u,30*u);c.strokeRect(x,y,100*u,30*u);c.textAlign='left';
  c.font=empFont(10*u);c.fillStyle='#ffd36b';c.shadowColor='#ff2d95';c.shadowBlur=6*u;c.fillText('MIAMI',x+6*u,y+11*u);c.shadowBlur=0;c.font=empFont(5*u);c.fillStyle='#2de2e6';c.fillText('DADE COUNTY · 1986',x+6*u,y+23*u);c.restore();}
 {const cx=ox+mw*0.93,cy=oy+mh*0.92,r=14*u;c.save();c.translate(cx,cy);c.strokeStyle='rgba(233,199,255,.5)';c.lineWidth=u;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();
  for(let k=0;k<4;k++){c.rotate(Math.PI/2);c.beginPath();c.moveTo(0,-r*1.1);c.lineTo(r*0.22,0);c.lineTo(-r*0.22,0);c.closePath();c.fillStyle=k===3?'#ff3fa4':'rgba(233,199,255,.6)';c.fill();}
  c.font=empFont(6*u);c.fillStyle='#ff3fa4';c.textAlign='center';c.fillText('N',0,-r*1.55);c.restore();}
 /* scanlines and vignette */
 c.fillStyle='rgba(0,0,0,.12)';for(let y=0;y<H;y+=3)c.fillRect(0,y,W,1);
 gr=c.createRadialGradient(W/2,H/2,Math.min(W,H)*0.35,W/2,H/2,Math.max(W,H)*0.75);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=gr;c.fillRect(0,0,W,H);
 /* sea sparkles to twinkle each frame */
 EMP_SPARK=[];const tc=document.createElement('canvas').getContext('2d');const inLand=(x,y)=>[EMP_GEO.main,EMP_GEO.beach,...EMP_GEO.isles].some(P=>{empPath(tc,P,R,true);return tc.isPointInPath(x,y);});
 for(let k=0;k<70;k++){const x=rng()*W,y=rng()*H;if(!inLand(x,y))EMP_SPARK.push([x,y,rng()*6.28,0.6+rng()*1.4]);}
 return cv;}
function empPinPath(c,x,y,r){c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-r*0.5,y-r*0.9,x-r*1.15,y-r*1.25,x-r*1.1,y-r*1.9);c.arc(x,y-r*1.9,r*1.1,Math.PI,0);c.bezierCurveTo(x+r*1.15,y-r*1.25,x+r*0.5,y-r*0.9,x,y);c.closePath();}
function drawEmpMap(t){const cv=$('emMap');if(!cv)return;const b=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
 const W=Math.max(60,Math.round((b.width||360)*dpr)),H=Math.max(60,Math.round((b.height||400)*dpr));
 if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;EMP_LAYER=null;}if(!EMP_LAYER||EMP_LAYER.width!==W||EMP_LAYER.height!==H)EMP_LAYER=empBuildLayer(W,H);
 const c=cv.getContext('2d'),{ox,oy,mw,mh,u}=EMP_RECT,T=(t||performance.now())/1000;c.drawImage(EMP_LAYER,0,0);
 for(const [x,y,ph,s] of EMP_SPARK){const a=Math.max(0,Math.sin(T*s+ph));if(a<0.2)continue;c.fillStyle='rgba(180,250,255,'+(a*0.7)+')';c.fillRect(x,y,1.6*u*a,1.6*u*a);}
 const r=Math.max(6,8*u),P=f=>[ox+f.at[0]*mw,oy+f.at[1]*mh];
 /* turf: each front glows in its holder's colour */
 EMP_FRONTS.forEach(f=>{const s=empState(f);if(s==='lock')return;const [x,y]=P(f),col=s==='own'?EMP_GOLD:EMP_GANGS[f.gang].col;
  const g=c.createRadialGradient(x,y,0,x,y,r*5.5);g.addColorStop(0,col+'66');g.addColorStop(1,col+'00');c.fillStyle=g;c.beginPath();c.arc(x,y,r*5.5,0,Math.PI*2);c.fill();});
 /* pins, the selected one last */
 const order=EMP_FRONTS.map((f,i)=>i).sort((a,b)=>(a===EMP_SEL)-(b===EMP_SEL)||EMP_FRONTS[a].at[1]-EMP_FRONTS[b].at[1]);
 for(const i of order){const f=EMP_FRONTS[i],s=empState(f),[x,y]=P(f),sel=i===EMP_SEL,col=s==='own'?EMP_GOLD:s==='lock'?'#6a5a7a':EMP_GANGS[f.gang].col,bob=sel?Math.sin(T*4)*1.5*u:0,pr=sel?r*1.2:r;
  if(sel)for(let k=0;k<2;k++){const ph=(T*0.9+k*0.5)%1;c.strokeStyle=col;c.globalAlpha=1-ph;c.lineWidth=2*u;c.beginPath();c.ellipse(x,y,r*(1+ph*3),r*(0.45+ph*1.3),0,0,Math.PI*2);c.stroke();c.globalAlpha=1;}
  c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.ellipse(x,y,pr*0.8,pr*0.3,0,0,Math.PI*2);c.fill();
  c.save();c.translate(0,bob);c.shadowColor=col;c.shadowBlur=(sel?16:8)*u;empPinPath(c,x,y,pr);const pg=c.createLinearGradient(x,y-pr*3,x,y);pg.addColorStop(0,'#fff');pg.addColorStop(0.25,col);pg.addColorStop(1,col);c.fillStyle=pg;c.fill();c.shadowBlur=0;
  c.strokeStyle='#160826';c.lineWidth=1.4*u;c.stroke();c.fillStyle='#160826';c.beginPath();c.arc(x,y-pr*1.9,pr*0.72,0,Math.PI*2);c.fill();
  c.fillStyle=col;c.font=empFont(pr*0.85);c.textAlign='center';c.textBaseline='middle';
  if(s==='own'){/* a little crown */const cx=x,cy=y-pr*1.9,w=pr*0.5;c.beginPath();c.moveTo(cx-w,cy+w*0.55);c.lineTo(cx-w,cy-w*0.35);c.lineTo(cx-w*0.5,cy+w*0.1);c.lineTo(cx,cy-w*0.6);c.lineTo(cx+w*0.5,cy+w*0.1);c.lineTo(cx+w,cy-w*0.35);c.lineTo(cx+w,cy+w*0.55);c.closePath();c.fill();}
  else c.fillText(s==='lock'?'?':'!',x+0.5*u,y-pr*1.85);
  c.restore();
  if(sel){const gg=EMP_GANGS[f.gang],l1=f.name,l2=s==='own'?'YOURS · $'+fmt(f.pay)+' A JOB':s==='lock'?'NOT YET':gg.name;c.font=empFont(6.5*u);const w1=c.measureText(l1).width;c.font=empFont(4.8*u);const w2=c.measureText(l2).width;
   const bw=Math.max(w1,w2)+12*u,bh=24*u,bx=clamp(x-bw/2,ox+2*u,Math.min(W,ox+mw)-bw-2*u),by=Math.max(2*u,y-pr*3.4-bh+bob);
   c.fillStyle='rgba(10,4,20,.88)';c.fillRect(bx,by,bw,bh);c.strokeStyle=col;c.lineWidth=1.5*u;c.strokeRect(bx,by,bw,bh);c.fillStyle='#2de2e6';c.fillRect(bx+3*u,by+bh,bw,2*u);
   c.textAlign='left';c.textBaseline='middle';c.font=empFont(6.5*u);c.fillStyle='#fff';c.fillText(l1,bx+6*u,by+8*u);c.font=empFont(4.8*u);c.fillStyle=col;c.fillText(l2,bx+6*u,by+17*u);}}
 /* legend strip */
 {const items=[['YOURS',EMP_GOLD],...Object.values(EMP_GANGS).map(g=>[g.short,g.col])];c.font=empFont(5*u);let tw=0;for(const [tx] of items)tw+=c.measureText(tx).width+18*u;
  const lx0=ox+mw/2-tw/2,ly=Math.min(H,oy+mh)-9*u;c.fillStyle='rgba(10,4,20,.78)';c.fillRect(lx0-6*u,ly-8*u,tw+6*u,15*u);let lx=lx0;c.textAlign='left';c.textBaseline='middle';
  for(const [tx,col] of items){c.fillStyle=col;c.shadowColor=col;c.shadowBlur=4*u;c.beginPath();c.arc(lx+3*u,ly,3*u,0,Math.PI*2);c.fill();c.shadowBlur=0;c.fillText(tx,lx+9*u,ly+0.5*u);lx+=c.measureText(tx).width+18*u;}}}
function empLoop(t){if(state!=='empire'){EMP_ANIM=0;return;}drawEmpMap(t);EMP_ANIM=requestAnimationFrame(empLoop);}
function empAnim(){if(!EMP_ANIM&&typeof requestAnimationFrame==='function')EMP_ANIM=requestAnimationFrame(empLoop);}
if(typeof document!=='undefined'&&document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{EMP_LAYER=null;});
$('emList').onclick=e=>{const go=e.target.closest('[data-go]');if(go){empGo(+go.dataset.go);return;}const cd=e.target.closest('[data-i]');if(cd&&+cd.dataset.i!==EMP_SEL)empSelect(+cd.dataset.i);};
$('emMap').onclick=e=>{const cv=$('emMap'),b=cv.getBoundingClientRect();if(!EMP_RECT||!b.width)return;const s=cv.width/b.width,px=(e.clientX-b.left)*s,py=(e.clientY-b.top)*s;let bi=-1,bd=EMP_RECT.u*22;
 EMP_FRONTS.forEach((f,i)=>{const x=EMP_RECT.ox+f.at[0]*EMP_RECT.mw,y=EMP_RECT.oy+f.at[1]*EMP_RECT.mh-EMP_RECT.u*10,d=Math.hypot(x-px,y-py);if(d<bd){bd=d;bi=i;}});if(bi>=0)empSelect(bi);};
$('bEmpLeave').onclick=()=>closeEmpire();
$('bCarEmpire').onclick=()=>openEmpire();
