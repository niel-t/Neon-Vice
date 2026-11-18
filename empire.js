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
 $('emMsg').textContent=msg||'';drawEmpMap();
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
/* a neon street map of Miami: the mainland, Biscayne Bay, the causeways and Miami Beach, one pin per front */
function drawEmpMap(){const cv=$('emMap');if(!cv)return;const c=cv.getContext('2d'),W=cv.width,H=cv.height,X=v=>v*W,Y=v=>v*H;
 c.fillStyle='#06142c';c.fillRect(0,0,W,H);
 c.strokeStyle='rgba(45,226,230,.07)';c.lineWidth=1;for(let y=0;y<H;y+=6){c.beginPath();c.moveTo(0,y+.5);c.lineTo(W,y+.5);c.stroke();}
 const poly=(pts,fill,stroke)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(X(x),Y(y)):c.moveTo(X(x),Y(y)));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}};
 const land=[[0,0],[0.66,0],[0.64,0.12],[0.62,0.26],[0.63,0.4],[0.6,0.5],[0.62,0.6],[0.56,0.7],[0.52,0.8],[0.46,0.9],[0.4,1],[0,1]];
 poly(land,'#1c0e30','#ff2d95');
 /* streets on the mainland */
 c.save();c.beginPath();land.forEach(([x,y],i)=>i?c.lineTo(X(x),Y(y)):c.moveTo(X(x),Y(y)));c.closePath();c.clip();c.strokeStyle='rgba(255,63,164,.16)';
 for(let x=0.04;x<0.7;x+=0.07){c.beginPath();c.moveTo(X(x),0);c.lineTo(X(x),H);c.stroke();}for(let y=0.05;y<1;y+=0.08){c.beginPath();c.moveTo(0,Y(y));c.lineTo(W,Y(y));c.stroke();}
 c.strokeStyle='rgba(255,211,107,.35)';c.lineWidth=3;c.beginPath();c.moveTo(X(0.18),0);c.lineTo(X(0.2),Y(0.5));c.lineTo(X(0.16),H);c.stroke();c.restore();
 /* Miami Beach and the little islands */
 poly([[0.78,0.04],[0.85,0.02],[0.88,0.3],[0.89,0.6],[0.87,0.86],[0.82,0.9],[0.79,0.7],[0.77,0.4]],'#241238','#ff2d95');
 poly([[0.68,0.4],[0.72,0.38],[0.73,0.42],[0.69,0.44]],'#241238','rgba(255,45,149,.6)');poly([[0.7,0.62],[0.74,0.6],[0.75,0.64],[0.71,0.66]],'#241238','rgba(255,45,149,.6)');
 c.strokeStyle='rgba(233,199,255,.55)';c.lineWidth=2;for(const [y0,y1] of [[0.3,0.28],[0.5,0.48],[0.66,0.7]]){c.beginPath();c.moveTo(X(0.62),Y(y0));c.lineTo(X(0.79),Y(y1));c.stroke();}
 c.font='bold '+Math.round(W*0.034)+'px monospace';c.textAlign='center';c.fillStyle='rgba(233,199,255,.5)';
 c.fillText('MIAMI',X(0.22),Y(0.12));c.fillText('BISCAYNE',X(0.71),Y(0.18));c.fillText('BAY',X(0.71),Y(0.22));c.save();c.translate(X(0.95),Y(0.62));c.rotate(Math.PI/2);c.fillText('ATLANTIC',0,0);c.restore();
 c.save();c.translate(X(0.835),Y(0.2));c.rotate(Math.PI/2);c.fillText('MIAMI BEACH',0,0);c.restore();
 /* pins */
 const r=Math.max(6,W*0.03);
 EMP_FRONTS.forEach((f,i)=>{const s=empState(f),x=X(f.at[0]),y=Y(f.at[1]),col=s==='own'?EMP_GOLD:s==='lock'?'#5a4a6a':EMP_GANGS[f.gang].col;
  if(i===EMP_SEL){c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(x,y,r*1.9,0,Math.PI*2);c.stroke();c.strokeStyle=col;c.beginPath();c.arc(x,y,r*2.5,0,Math.PI*2);c.stroke();}
  c.fillStyle='#000';c.beginPath();c.arc(x+2,y+2,r,0,Math.PI*2);c.fill();c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
  c.fillStyle=s==='lock'?'#a89ab8':'#160826';c.font='bold '+Math.round(r*1.3)+'px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(s==='own'?'$':s==='lock'?'?':'!',x,y+1);c.textBaseline='alphabetic';
  if(i===EMP_SEL){c.font='bold '+Math.round(W*0.036)+'px monospace';const t=f.name,tw=c.measureText(t).width+10,tx=clamp(x,tw/2+2,W-tw/2-2),ty=y-r*2.7;c.fillStyle='rgba(0,0,0,.8)';c.fillRect(tx-tw/2,ty-W*0.04,tw,W*0.055);c.fillStyle=col;c.fillText(t,tx,ty);}});
 /* legend */
 c.font='bold '+Math.round(W*0.03)+'px monospace';c.textAlign='left';let lx=6;const ly=H-8;
 for(const [t,col] of [['YOURS',EMP_GOLD],...Object.values(EMP_GANGS).map(g=>[g.short,g.col])]){c.fillStyle=col;c.fillRect(lx,ly-8,8,8);c.fillText(t,lx+11,ly);lx+=c.measureText(t).width+20;}}
$('emList').onclick=e=>{const go=e.target.closest('[data-go]');if(go){empGo(+go.dataset.go);return;}const cd=e.target.closest('[data-i]');if(cd&&+cd.dataset.i!==EMP_SEL)empSelect(+cd.dataset.i);};
$('emMap').onclick=e=>{const cv=$('emMap'),b=cv.getBoundingClientRect(),x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;let bi=-1,bd=0.09;
 EMP_FRONTS.forEach((f,i)=>{const d=Math.hypot(f.at[0]-x,(f.at[1]-y)*b.height/b.width);if(d<bd){bd=d;bi=i;}});if(bi>=0)empSelect(bi);};
$('bEmpLeave').onclick=()=>closeEmpire();
$('bCarEmpire').onclick=()=>openEmpire();
