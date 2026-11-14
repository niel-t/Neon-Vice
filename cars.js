'use strict';
/* ================= CARS =================
   Every road car is one lofted body: cross-sections ("stations") along the length, joined into smooth panels, so a car has
   a raked windscreen, a sloping hood, tumblehome on the glasshouse and rounded corners instead of stacked boxes.
   The bodies go into the same Batch as everything else, so the classic renderer and the Three.js renderer both draw them.
   Uses globals from the game script at call time: rideKit, apply, TUV, CAR_CHR, LENS_W/R/A, DARK, GOLD, B.round. */

const CAR_CHR=[0.9,0.91,0.94],CAR_GLASS=[1,1,1],CAR_DARK=[0.03,0.03,0.035],CAR_INT=[0.16,0.1,0.08];
function carLine(P,x){if(x<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(x<=P[i][0]){const a=P[i-1],b=P[i],t=(x-a[0])/((b[0]-a[0])||1);return a[1]+(b[1]-a[1])*t;}return P[P.length-1][1];}
function carSm(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
const carIn=(r,x)=>!!r&&x>r[0]&&x<r[1];

/* o: {L,W,ride,top:[[x,y]..] side silhouette tail->nose, sill:[[x,y]..] window line, ws:[x0,x1] windscreen, rw:[x0,x1] rear glass,
       cab:[x0,x1] side glass, bp:[x..] pillars between side windows, tumble, taper, col, roof, rock, open (convertible), bed:[x0,x1] (pickup)}
   returns a frame object with the body's own measurements for the detail pass */
function carBody(B,b,o){const L=o.L,hw=o.W/2,ride=o.ride||0.15,PT=TUV[56],GL=TUV[57],C=o.col,R0=o.roof||C,ROCK=o.rock||C.map(v=>v*0.5);
 const xs=new Set([-L/2,-L/2+0.05,L/2-0.05,L/2]);for(const P of [o.top,o.sill])for(const p of P)xs.add(p[0]);for(const r of [o.ws,o.rw,o.cab,o.bed])if(r){xs.add(r[0]);xs.add(r[1]);}
 for(const x of o.bp||[]){xs.add(x-0.035);xs.add(x+0.035);}for(const x of o.st||[])xs.add(x);
 const X=[...xs].filter(x=>x>=-L/2-1e-6&&x<=L/2+1e-6).sort((a,b)=>a-b).filter((x,i,a)=>i===0||x-a[i-1]>0.008);
 const tp=o.taper===undefined?0.07:o.taper,tb=o.tumble||0.8,sh=o.shoulder||0.05;
 const sta=x=>{const e=Math.min(x+L/2,L/2-x),k=carSm(e/0.32),T=carLine(o.top,x),S=carLine(o.sill,x),deck=Math.min(T,S),gh=T-deck;
  const wb=hw*(1-tp*(1-k)),wsh=wb-0.03-0.035*(1-k),yb=ride+0.07*(1-carSm(e/0.28)),ybelt=Math.max(yb+0.12,deck-sh),yr=Math.min(ybelt-0.02,yb+0.09);
  const wt=wsh-0.035+(wsh*tb-(wsh-0.035))*carSm(gh/0.12);
  return{x,T,deck,gh,wb,wsh,yb,yr,ybelt,wt,pr:[[0,yb],[wb-0.018,yb],[wb-0.012,yr],[wb,ybelt],[wsh,deck],[wt,T],[0,T]]};};
 const S=X.map(sta);
 const tw=p=>apply(b,p[0],p[1],p[2]);
 const nrm=(p0,p1,p2)=>{const u=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],v=[p2[0]-p0[0],p2[1]-p0[1],p2[2]-p0[2]];const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const l=Math.hypot(n[0],n[1],n[2]);return l<1e-9?null:n.map(q=>q/l);};
 /* quad in car space; flips to face away from cen (car space) */
 const quad=(pts,c,uv,cen)=>{const T=pts.map(tw);let n=nrm(T[0],T[1],T[2])||nrm(T[0],T[2],T[3]);if(!n)return;const cw=tw(cen),m=[(T[0][0]+T[2][0])/2-cw[0],(T[0][1]+T[2][1])/2-cw[1],(T[0][2]+T[2][2])/2-cw[2]];if(n[0]*m[0]+n[1]*m[1]+n[2]*m[2]<0){T.reverse();n=n.map(q=>-q);}B.quad(T,n[0],n[1],n[2],uv||PT,c);};
 const opened=x=>o.open&&carIn(o.cab,x)&&!carIn(o.ws,x);
 for(let i=0;i<S.length-1;i++){const A=S[i],Bs=S[i+1],xm=(A.x+Bs.x)/2,gh=(A.gh+Bs.gh)/2,cy=(A.yb+A.deck)/2;
  const pil=(o.bp||[]).some(p=>Math.abs(xm-p)<0.036);
  for(let j=0;j<6;j++){let c=C,uv=PT;
   if(j===0){c=CAR_DARK;uv=null;}else if(j===1){c=ROCK;}
   else if(j===4){if(gh>0.015&&carIn(o.cab,xm)&&!pil){c=CAR_GLASS;uv=GL;}else if(gh>0.015&&pil){c=o.pillar||R0;}}
   else if(j===5){if(o.bed&&carIn(o.bed,xm)){c=[0.1,0.1,0.11];uv=null;}else if(carIn(o.ws,xm)||carIn(o.rw,xm)){c=CAR_GLASS;uv=GL;}else if(gh>0.015&&carIn(o.cab,xm))c=opened(xm)?CAR_INT:R0;}
   if(j===4&&o.open&&gh>0.015&&carIn(o.cab,xm)&&!carIn(o.ws,xm))continue;
   for(const sd of [1,-1]){const a0=A.pr[j],a1=A.pr[j+1],b0=Bs.pr[j],b1=Bs.pr[j+1];
    let p=[[A.x,a0[1],a0[0]*sd],[Bs.x,b0[1],b0[0]*sd],[Bs.x,b1[1],b1[0]*sd],[A.x,a1[1],a1[0]*sd]];
    if(j===5&&opened(xm)){const y=Math.min(A.deck,Bs.deck)-0.07;p=[[A.x,y,A.wsh*sd],[Bs.x,y,Bs.wsh*sd],[Bs.x,y,0],[A.x,y,0]];}
    quad(p,c,uv,[xm,cy,0]);}}}
 /* end caps: the nose and the tail panel */
 for(const [k,dir] of [[0,-1],[S.length-1,1]]){const s=S[k],c0=[s.x,(s.yb+s.T)/2,0];for(let j=0;j<6;j++)for(const sd of [1,-1])quad([c0,c0,[s.x,s.pr[j][1],s.pr[j][0]*sd],[s.x,s.pr[j+1][1],s.pr[j+1][0]*sd]],j===0?CAR_DARK:C,j===0?null:PT,[s.x-dir,c0[1],0]);}
 const at=x=>sta(Math.max(-L/2,Math.min(L/2,x)));
 return{L,hw,ride,at,quad,tw,front:L/2,rear:-L/2};}

/* dark wheel well cut into the body side, with a thin lip, so the tyre sits inside the bodywork */
function carArch(f,wx,R,sd,col){const s=f.at(wx),z=sd*(s.wb+0.004),cy=R*0.98,ra=R*1.2,N=10,yb=s.yb-0.005;
 const arc=(r,i)=>{const t=Math.PI*(i/N);return[wx+Math.cos(t)*r,Math.max(yb,cy+Math.sin(t)*r)];};
 for(let i=0;i<N;i++){const a=arc(ra+0.028,i),b=arc(ra+0.028,i+1),a2=arc(ra,i),b2=arc(ra,i+1);f.quad([[a[0],a[1],z],[b[0],b[1],z],[b2[0],b2[1],z],[a2[0],a2[1],z]],col.map(v=>v*0.62),TUV[56],[wx,cy,0]);}
 const z2=sd*(s.wb+0.007);for(let i=0;i<N;i++){const a=arc(ra,i),b=arc(ra,i+1);f.quad([[wx,cy,z2],[wx,cy,z2],[b[0],b[1],z2],[a[0],a[1],z2]],CAR_DARK,null,[wx,cy,0]);f.quad([[wx,yb,z2],[wx,yb,z2],[a[0],a[1],z2],[b[0],b[1],z2]],CAR_DARK,null,[wx,cy,0]);}}

/* the common detail pass: arches, wheels, bumpers, lights, mirrors, handles, plates */
function carKit(B,x,z,s,a,o,spin){const k=rideKit(B,x,z,s,a),f=carBody(B,k.b,o),{P,W}=k,C=o.col,CH=TUV[58],GL=TUV[57],PT=TUV[56],sp=spin||0;
 const R=o.R||0.19,tw=o.tw||0.15,rim=o.rim||[0.78,0.78,0.8],bump=o.bump||CAR_CHR,L2=f.front,hw=f.hw;
 for(const sd of [-1,1])for(const wx of o.axles){carArch(f,wx,R,sd,C);const s=f.at(wx);W(wx,sd*(s.wb-tw/2+0.012),R,tw,rim,sp,{lite:!o.rimFull,white:!!o.white,spokes:o.spokes||6});}
 const nose=f.at(L2-0.03),tail=f.at(-L2+0.03);
 /* bumpers: wrap-around, chrome on the old ones and black urethane on the new ones */
 const fb=o.fbump||0.28,rb=o.rbump||0.28;
 P(L2+0.02,fb,0,0,0.07,0.075,hw*2*0.97,bump,bump===CAR_CHR?CH:null);P(-L2-0.02,rb,0,0,0.07,0.075,hw*2*0.97,bump,bump===CAR_CHR?CH:null);
 for(const sd of [-1,1]){P(L2-0.06,fb,sd*hw*0.95,0,0.16,0.07,0.05,bump,bump===CAR_CHR?CH:null);P(-L2+0.06,rb,sd*hw*0.95,0,0.16,0.07,0.05,bump,bump===CAR_CHR?CH:null);}
 /* licence plates */
 P(L2+0.058,fb,0,0,0.006,0.06,0.2,[0.95,0.95,0.9]);P(-L2-0.005,(tail.yb+tail.deck)/2,0,0,0.006,0.07,0.22,[0.95,0.95,0.9]);
 /* side mirrors on the door, at the base of the windscreen */
 if(o.ws){const mx=o.ws[0]-0.05,ms=f.at(mx);for(const sd of [-1,1]){P(mx,ms.deck+0.04,sd*(ms.wsh+0.035),0,0.07,0.05,0.04,o.mir||CAR_DARK);P(mx+0.01,ms.deck+0.01,sd*(ms.wsh+0.012),0,0.04,0.03,0.03,CAR_DARK);}}
 /* door handles + a chrome belt-line trim */
 for(const sd of [-1,1]){for(const hx of o.handles||[]){const hs=f.at(hx);P(hx,hs.ybelt-0.035,sd*(hs.wb+0.004),0,0.07,0.02,0.01,CAR_CHR,CH);}
  if(o.trim){const y=o.trimY||0.32;for(let i=0;i<4;i++){const x0=-L2*0.8+i*L2*0.4,s0=f.at(x0+L2*0.2);P(x0+L2*0.2,y,sd*(s0.wb+0.003),0,L2*0.4,0.018,0.006,o.trim,o.trim===CAR_CHR?CH:null);}}}
 return{f,P,W,k,nose,tail,CH,GL,PT,L2,hw};}

/* front lamps: square sealed beams, quad lamps, or pop-ups */
function carLamps(K,o){const {P,L2,hw,nose,tail}=K,ny=o.lampY||(nose.yb+nose.deck)/2+0.02;
 for(const sd of [-1,1]){
  if(o.lamps==='pop'){const s=K.f.at(L2-0.3);if(o.popUp){P(L2-0.3,s.T+0.045,sd*hw*0.6,0,0.16,0.09,0.24,o.col,K.PT);P(L2-0.22,s.T+0.045,sd*hw*0.6,0,0.008,0.07,0.2,LENS_W,null,1);}
   else P(L2-0.3,s.T+0.004,sd*hw*0.6,0,0.2,0.008,0.24,o.col.map(v=>v*0.85),K.PT);P(L2+0.004,ny-0.03,sd*hw*0.62,0,0.01,0.03,0.22,LENS_A,null,1);}
  else if(o.lamps==='quad'){for(const q of [0.58,0.78])P(L2+0.004,ny,sd*hw*q,0,0.012,0.075,0.1,LENS_W,null,1);P(L2+0.002,ny,sd*hw*0.68,0,0.008,0.1,0.34,CAR_CHR,K.CH);}
  else{P(L2+0.004,ny,sd*hw*0.68,0,0.012,0.08,0.2,LENS_W,null,1);P(L2+0.002,ny,sd*hw*0.68,0,0.008,0.1,0.26,CAR_CHR,K.CH);}
  /* tail lamps */
  const ty=o.tailY||(tail.yb+tail.deck)/2+0.03;P(-L2-0.004,ty,sd*hw*0.66,0,0.012,o.tailH||0.08,o.tailW||0.3,LENS_R,null,1);P(-L2-0.006,ty-(o.tailH||0.08)*0.25,sd*hw*0.5,0,0.012,0.03,0.07,[0.95,0.95,0.92],null,1);}
 /* grille */
 if(o.grille!==false){const gw=o.grilleW||hw*0.72;P(L2+0.003,ny-0.005,0,0,0.01,o.grilleH||0.08,gw,[1,1,1],TUV[60]);if(o.grilleChrome!==false)P(L2+0.006,ny+(o.grilleH||0.08)/2,0,0,0.01,0.012,gw+0.02,CAR_CHR,K.CH);}}

/* ---------- the shapes ---------- */
const CAR_SHAPES={
 /* full-size 4-door sedan: Caprice, LTD, Fairmont */
 sedan:{L:2.36,W:1.06,top:[[-1.18,0.46],[-1.12,0.5],[-0.6,0.52],[-0.4,0.79],[0.26,0.8],[0.54,0.53],[1.1,0.5],[1.18,0.46]],sill:[[-1.18,0.52],[1.18,0.53]],
  ws:[0.26,0.54],rw:[-0.6,-0.4],cab:[-0.6,0.54],bp:[-0.08],axles:[0.74,-0.74],handles:[0.12,-0.3],trim:CAR_CHR,lamps:'quad'},
 /* woodie station wagon */
 wagon:{L:2.5,W:1.08,top:[[-1.25,0.5],[-1.23,0.79],[0.3,0.81],[0.58,0.54],[1.17,0.5],[1.25,0.46]],sill:[[-1.25,0.54],[1.25,0.54]],
  ws:[0.3,0.58],cab:[-1.23,0.58],bp:[-0.1,-0.72],axles:[0.8,-0.78],handles:[0.15,-0.35],lamps:'quad',wood:true},
 /* little hatchback: Rabbit, Civic */
 hatch:{L:2.04,W:0.98,top:[[-1.02,0.5],[-0.97,0.62],[-0.78,0.77],[0.12,0.78],[0.42,0.53],[0.97,0.48],[1.02,0.45]],sill:[[-1.02,0.53],[1.02,0.52]],
  ws:[0.12,0.42],rw:[-0.97,-0.78],cab:[-0.97,0.42],bp:[-0.38],axles:[0.66,-0.64],handles:[0.05],bump:[0.12,0.12,0.13],R:0.18},
 /* wedge sports coupe with pop-ups: Corvette, Firebird */
 coupe:{L:2.4,W:1.06,ride:0.13,top:[[-1.2,0.44],[-1.1,0.47],[-0.72,0.49],[-0.22,0.69],[0.12,0.7],[0.48,0.47],[1.12,0.38],[1.2,0.33]],sill:[[-1.2,0.46],[0.48,0.47],[1.2,0.4]],
  ws:[0.12,0.48],rw:[-0.72,-0.22],cab:[-0.72,0.48],bp:[-0.12],axles:[0.76,-0.74],handles:[0.02],bump:[0.12,0.12,0.13],lamps:'pop',grille:false,fbump:0.22,rbump:0.24,R:0.2},
 /* square-body pickup */
 pickup:{L:2.5,W:1.08,ride:0.18,top:[[-1.25,0.58],[-0.22,0.58],[-0.2,0.88],[0.28,0.88],[0.54,0.61],[1.18,0.58],[1.25,0.54]],sill:[[-1.25,0.6],[1.25,0.6]],
  ws:[0.28,0.54],cab:[-0.2,0.54],bed:[-1.2,-0.24],axles:[0.82,-0.8],handles:[0.1],trim:CAR_CHR,trimY:0.36,R:0.21,taper:0.04},
 /* panel van */
 van:{L:2.6,W:1.1,ride:0.17,top:[[-1.3,0.98],[-1.28,1.04],[0.62,1.05],[0.92,0.7],[1.24,0.62],[1.3,0.56]],sill:[[-1.3,0.66],[1.3,0.66]],
  ws:[0.62,0.92],cab:[0.4,0.92],axles:[0.86,-0.84],handles:[0.5],R:0.21,taper:0.04,tumble:0.95}
};

/* traffic and parked cars: a shape picked from the colour (stable per car) unless the caller names one */
const TRAFFIC_TYPES=['sedan','hatch','coupe','wagon','pickup','sedan','hatch'];
function drawCar(B,x,z,col,dir,spin,type){const C=col||[0.86,0.1,0.16];let t=type;if(t===undefined){const h=Math.floor((C[0]*7.1+C[1]*13.3+C[2]*5.7)*97);t=TRAFFIC_TYPES[h%TRAFFIC_TYPES.length];}else if(typeof t==='number')t=TRAFFIC_TYPES[t%TRAFFIC_TYPES.length];
 drawCarShape(B,x,z,1,(dir||1)<0?Math.PI:0,t,{col:C},spin);}
function drawCarShape(B,x,z,s,a,type,over,spin){const o=Object.assign({},CAR_SHAPES[type]||CAR_SHAPES.sedan,over||{});const r0=B.round;B.round=0.35;
 const K=carKit(B,x,z,s,a,o,spin);carLamps(K,o);carExtras(K,o);B.round=r0;return K;}

/* model-specific bits: wood panels, vinyl roof, stripes, spoilers, rust and primer, pickup bed rails, roof lights */
function carExtras(K,o){const {P,f,L2,hw}=K,PT=TUV[56];
 if(o.wood)for(const sd of [-1,1]){const s=f.at(-0.2);P(-0.2,s.yr+(s.ybelt-s.yr)*0.5,sd*(s.wb+0.005),0,L2*1.55,(s.ybelt-s.yr)*0.7,0.006,[0.5,0.3,0.15]);P(-0.2,s.ybelt-0.03,sd*(s.wb+0.008),0,L2*1.56,0.02,0.006,[0.85,0.72,0.5]);P(-0.2,s.yr+0.03,sd*(s.wb+0.008),0,L2*1.56,0.02,0.006,[0.85,0.72,0.5]);}
 if(o.bed){const [x0,x1]=o.bed,s=f.at((x0+x1)/2),y=s.T;for(const sd of [-1,1])P((x0+x1)/2,y+0.02,sd*(s.wsh-0.02),0,x1-x0,0.04,0.07,o.col,PT);P(x0+0.02,y+0.02,0,0,0.05,0.04,s.wsh*2,o.col,PT);P(x1-0.02,y+0.03,0,0,0.05,0.06,s.wsh*2,o.col,PT);}
 if(o.stripe)for(const sd of [-1,1]){for(let i=0;i<6;i++){const x0=-L2+0.15+i*(L2*2-0.3)/6,xm=x0+(L2*2-0.3)/12,s=f.at(xm);P(xm,s.yr+(s.ybelt-s.yr)*0.62,sd*(s.wb+0.005),0,(L2*2-0.3)/6+0.01,0.045,0.006,o.stripe,null,1);}}
 if(o.hoodStripe){for(let i=0;i<5;i++){const xm=L2-0.12-i*0.13,s=f.at(xm);for(const sd of [-1,1])P(xm,s.T+0.003,sd*0.09,0,0.135,0.006,0.08,o.hoodStripe,null,1);}}
 if(o.spoiler){const s=f.at(-L2+0.12);P(-L2+0.12,s.T+0.1,0,0,0.13,0.025,hw*1.8,o.col,PT);for(const sd of [-1,1])P(-L2+0.12,s.T+0.05,sd*hw*0.7,0,0.05,0.1,0.04,o.col,PT);}
 if(o.primer)for(const sd of [-1,1])if(sd>0){const s=f.at(0.05);P(0.05,(s.yr+s.ybelt)/2,s.wb+0.006,0,0.42,(s.ybelt-s.yr)*0.9,0.006,[0.52,0.52,0.54]);}
 if(o.rust)for(const [rx,ry,sd] of o.rust){const s=f.at(rx);P(rx,ry,sd*(s.wb+0.006),0,0.12,0.06,0.006,[0.42,0.2,0.1]);}
 if(o.strakes)for(const sd of [-1,1])for(let i=0;i<5;i++){const xm=-0.32,s=f.at(xm),y=s.yr+0.04+i*0.045;P(xm,y,sd*(s.wb+0.006),0,0.7,0.012,0.012,[0.1,0.1,0.11]);}
 if(o.open){const s=f.at(-0.15);for(const sd of [-1,1]){P(-0.2,s.deck-0.02,sd*0.24,0,0.2,0.12,0.3,CAR_INT);P(-0.3,s.deck+0.04,sd*0.24,0.25,0.06,0.2,0.28,CAR_INT);}P(0.05,s.deck+0.02,0.24,0.5,0.03,0.12,0.12,[0.05,0.05,0.05]);}
 if(o.taxi){const s=f.at(-0.07);P(-0.07,s.T+0.05,0,0,0.12,0.08,0.34,[1,0.85,0.3],null,1);}}

/* ---------- the player's rides ---------- */
const BEATER={
 /* The Consigliere's Pinto: orange hatch, primer door, mismatched wheel */
 consigliere:Object.assign({},CAR_SHAPES.hatch,{L:2.2,W:1.0,col:[0.82,0.44,0.16],primer:true,rust:[[0.8,0.3,1],[-0.7,0.26,-1]],bump:CAR_CHR,lamps:'round',top:[[-1.1,0.5],[-1.05,0.6],[-0.72,0.76],[0.12,0.77],[0.44,0.53],[1.05,0.48],[1.1,0.45]],axles:[0.72,-0.7],ws:[0.12,0.44],rw:[-1.05,-0.72],cab:[-1.05,0.44],bp:[-0.3]}),
 /* The Money Man's Datsun: tired yellow fastback coupe */
 money:Object.assign({},CAR_SHAPES.coupe,{L:2.28,W:1.0,col:[0.8,0.72,0.3],bump:CAR_CHR,lamps:'round',grille:true,rust:[[0.6,0.28,-1],[-0.4,0.3,1],[-0.9,0.26,1]],top:[[-1.14,0.45],[-1.08,0.48],[-0.62,0.5],[-0.2,0.7],[0.1,0.71],[0.42,0.5],[1.08,0.45],[1.14,0.41]],sill:[[-1.14,0.48],[1.14,0.47]],ws:[0.1,0.42],rw:[-0.62,-0.2],cab:[-0.62,0.42],bp:[],axles:[0.72,-0.7],fbump:0.27,rbump:0.27}),
 /* The Don's Caprice: long brown land yacht with a cracked tan vinyl roof */
 don:Object.assign({},CAR_SHAPES.sedan,{L:2.85,W:1.16,col:[0.4,0.28,0.18],roof:[0.78,0.7,0.55],R:0.21,primer:true,rust:[[1.0,0.3,1]],top:[[-1.42,0.48],[-1.36,0.53],[-0.74,0.55],[-0.5,0.85],[0.34,0.86],[0.66,0.56],[1.34,0.53],[1.42,0.48]],sill:[[-1.42,0.56],[1.42,0.57]],ws:[0.34,0.66],rw:[-0.74,-0.5],cab:[-0.74,0.66],bp:[-0.08],axles:[0.92,-0.92],handles:[0.16,-0.36]})};
const MIDCAR=Object.assign({},CAR_SHAPES.coupe,{L:2.5,W:1.08,col:[0.94,0.94,0.96],roof:[0.1,0.1,0.12],rim:[0.95,0.8,0.42],rimFull:true,spokes:5,stripe:[0.2,0.85,0.9],spoiler:true,popUp:false,
 top:[[-1.25,0.43],[-1.15,0.47],[-0.74,0.49],[-0.24,0.68],[0.1,0.69],[0.46,0.47],[1.17,0.37],[1.25,0.32]],axles:[0.8,-0.78]});

/* paint, rims and underglow from Victory Vic's (see the dealership in index.html) dress whatever you drive */
function carMods(){const p=typeof PROG!=='undefined'&&PROG[rideId()];return (p&&p.carx)||{};}
const CAR_PAINTS=[null,[0.98,0.36,0.66],[0.16,0.78,0.8],[0.95,0.95,0.97],[0.06,0.06,0.07],[0.86,0.06,0.1],[0.98,0.78,0.16]];
const CAR_RIMS={stock:null,chrome:[0.92,0.93,0.96],gold:[0.98,0.8,0.36],white:[0.95,0.95,0.92]};
function rideOver(base,mx){const o={};if(mx.paint&&CAR_PAINTS[mx.paint])o.col=CAR_PAINTS[mx.paint];if(mx.rims&&CAR_RIMS[mx.rims]){o.rim=CAR_RIMS[mx.rims];o.rimFull=true;if(mx.rims==='white'){o.white=true;o.rim=[0.85,0.86,0.9];}}
 if(o.col&&base&&base.roof&&base.roof===base.col)o.roof=o.col;if(o.col&&base&&base.primer)o.primer=false;return o;}
function drawGlow(B,x,z,s,a,L,W,col){const k=rideKit(B,x,z,s,a);k.P(0,0.012,0,0,L,0.006,W,col||[1,0.2,0.75],null,1);}

function drawBeater(B,x,z,s,a,id,spin,mx){const base=BEATER[id]||BEATER.money;drawCarShape(B,x,z,s,a,null,Object.assign({},base,rideOver(base,mx||{})),spin);}
/* the player's own car: whichever one is in the garage, with the dealership's paint/rims/underglow */
function drawRide(B,x,z,s,a,id,spin){const mx=id?{}:carMods();const mc=id?'sig':myCar(),who=id||rideId(),r0=B.round;
 if(mx.glow)drawGlow(B,x,z,s,a,2.7,1.3,CAR_GLOWS[mx.glow]||CAR_GLOWS[1]);
 if(mc==='beater'){drawBeater(B,x,z,s,a,who,spin,mx);return;}
 if(mc==='mid'){drawCarShape(B,x,z,s,a,null,Object.assign({},MIDCAR,rideOver(MIDCAR,mx)),spin);return;}
 if(DEALER_CARS[mc]){const d=DEALER_CARS[mc];drawCarShape(B,x,z,s,a,null,Object.assign({},d.shape,rideOver(d.shape,mx)),spin);return;}
 B.round=0.5;const o=rideOver({},mx);
 if(who==='don')drawRolls(B,x,z,s,a,spin,o);else if(who==='consigliere')drawEscalade(B,x,z,s,a,spin,o);else drawLambo(B,x,z,s,a,o.col||null,spin);B.round=r0;}
const CAR_GLOWS=[null,[1,0.2,0.75],[0.2,0.9,1],[0.6,0.3,1]];

/* The Don's signature: the stately two-tone saloon */
const ROLLS=Object.assign({},CAR_SHAPES.sedan,{L:2.9,W:1.18,ride:0.17,col:[0.76,0.72,0.64],roof:[0.05,0.05,0.065],pillar:[0.05,0.05,0.065],R:0.24,white:true,spokes:8,rimFull:true,rim:CAR_CHR,taper:0.04,tumble:0.86,
 top:[[-1.45,0.52],[-1.4,0.6],[-0.86,0.62],[-0.62,0.93],[0.38,0.94],[0.66,0.63],[1.36,0.6],[1.45,0.55]],sill:[[-1.45,0.63],[1.45,0.64]],ws:[0.38,0.66],rw:[-0.86,-0.62],cab:[-0.86,0.66],bp:[-0.12],axles:[0.94,-0.96],handles:[0.2,-0.4],trim:[0.95,0.76,0.3],trimY:0.48,lamps:'quad',grille:false,fbump:0.3,rbump:0.3});
function drawRolls(B,x,z,s,a,spin,over){const o=Object.assign({},ROLLS,over||{});if(over&&over.col)o.roof=ROLLS.roof;const K=carKit(B,x,z,s,a,o,spin),{P,L2,CH}=K;carLamps(K,o);
 /* the temple grille and the flying lady */
 const n=K.f.at(L2-0.02);P(L2+0.02,n.deck-0.12,0,0,0.05,0.26,0.36,[1,1,1],TUV[60]);P(L2+0.03,n.deck,0,0,0.07,0.035,0.4,CAR_CHR,CH);for(const gz of [-0.18,0.18])P(L2+0.03,n.deck-0.12,gz,0,0.07,0.28,0.025,CAR_CHR,CH);
 P(L2+0.0,n.deck+0.07,0,0,0.04,0.09,0.02,CAR_CHR,CH);P(L2-0.36,n.T+0.004,0,0,0.6,0.008,0.012,CAR_CHR,CH);}
/* The Consigliere's signature: the gloss-black luxury SUV */
const ESCALADE=Object.assign({},CAR_SHAPES.van,{L:2.8,W:1.22,ride:0.22,col:[0.04,0.04,0.05],R:0.25,rimFull:true,rim:CAR_CHR,spokes:6,tumble:0.9,taper:0.05,
 top:[[-1.4,0.66],[-1.37,1.12],[0.42,1.14],[0.8,0.8],[1.32,0.76],[1.4,0.68]],sill:[[-1.4,0.8],[1.4,0.8]],ws:[0.42,0.8],cab:[-1.37,0.8],bp:[0.05,-0.62],axles:[0.95,-0.95],handles:[0.25,-0.3],trim:CAR_CHR,trimY:0.52,lamps:'quad',grilleW:0.8,grilleH:0.22,fbump:0.33,rbump:0.33,bump:[0.08,0.08,0.09]});
function drawEscalade(B,x,z,s,a,spin,over){const o=Object.assign({},ESCALADE,over||{});const K=carKit(B,x,z,s,a,o,spin),{P,L2,CH,f}=K;carLamps(K,o);
 /* roof rails, running boards */
 for(const sd of [-1,1]){const s0=f.at(-0.4);P(-0.45,s0.T+0.03,sd*(s0.wt-0.05),0,1.5,0.03,0.04,CAR_CHR,CH);const sb=f.at(0);P(0,sb.yb+0.05,sd*(sb.wb+0.04),0,1.2,0.035,0.1,[0.08,0.08,0.09]);P(0,sb.yb+0.07,sd*(sb.wb+0.09),0,1.2,0.012,0.012,CAR_CHR,CH);}}

/* ---------- the dealership's own stock (anyone can buy these) ---------- */
const DEALER_CARS={
 spyder:{name:'SPYDER 365',price:30000,desc:'Black convertible. Wind in your hair, cops in your mirror.',
  shape:Object.assign({},CAR_SHAPES.coupe,{L:2.5,W:1.06,col:[0.05,0.05,0.06],open:true,rim:[0.85,0.86,0.9],rimFull:true,spokes:5,lamps:'pop',popUp:false,bump:[0.1,0.1,0.11],
   top:[[-1.25,0.45],[-1.15,0.48],[-0.4,0.5],[-0.2,0.5],[0.08,0.68],[0.42,0.5],[1.17,0.4],[1.25,0.35]],sill:[[-1.25,0.48],[-0.2,0.5],[0.42,0.5],[1.25,0.42]],ws:[0.08,0.42],rw:null,cab:[-0.42,0.42],bp:[],axles:[0.8,-0.78]})},
 testa:{name:'TESTA BIANCA',price:75000,desc:'White, wide and flat as a pool table. Side strakes. The whole of Ocean Drive turns round.',
  shape:Object.assign({},CAR_SHAPES.coupe,{L:2.6,W:1.22,ride:0.12,col:[0.96,0.96,0.97],rim:[0.95,0.95,0.97],rimFull:true,spokes:5,lamps:'pop',popUp:false,strakes:true,taper:0.09,tumble:0.72,
   top:[[-1.3,0.44],[-1.22,0.47],[-0.75,0.5],[-0.3,0.66],[0.1,0.67],[0.46,0.45],[1.22,0.36],[1.3,0.31]],sill:[[-1.3,0.47],[0.46,0.45],[1.3,0.38]],ws:[0.1,0.46],rw:[-0.75,-0.3],cab:[-0.55,0.46],bp:[],axles:[0.82,-0.8],bump:[0.94,0.94,0.95]})}};

/* ================= VICTORY MOTORS: the car dealership =================
   Reached from the car menu (departTo -> loadHub('dealer') -> hubArrive drive-in). 'Victory' Vic Velour runs the floor: talk to him,
   or walk up to a car on a turntable, and the dealer screen opens (the shared #sStore screen in storeMode 'dealer').
   Cars are only sold here. Upgrades (PROG[id].carx) fit whatever you drive: paint, rims and underglow change the look,
   the V8 and the turbo change how it drives on Ocean Drive (updateDrive). */
const VIC_NAME="'VICTORY' VIC VELOUR";
const VIC_INTRO="Hey hey HEY! Victory Vic Velour, Victory Motors, and you just made the best decision of your life by walking in. Two fingers up, friend: one for the car, one for the price. Every deal's a win!";
const VIC_HI=["Look who's back! The lot missed you. I missed you. My commission missed you.","Kick the tyres, friend. Kick 'em hard, they kick back.","Every car on this floor is pre-loved. By me. Personally.","You've got the look of somebody who needs a convertible. Maybe two.","Peace, love and zero percent financing. Okay, not zero. Not even close."];
const VIC_SOLD=["SOLD! The {car}! Two fingers up, friend, that's a victory!","Keys to the {car}. Drive it like you stole it. Don't steal it.","The {car} is yours. I'd cry, but I'm a professional."];
const VIC_POOR=["Whoa, whoa. Love the enthusiasm, hate the wallet. Come back richer.","Friend, I'd finance you, but McWey already owns your kneecaps."];
const VIC_MOD=["Beautiful. She's purring already.","Now THAT is a ride with a personality.","Ooh. Ocean Drive's gonna need sunglasses."];
const VIC_BYE=["Peace, friend! Tell your friends. Tell your enemies, I'm not picky.","Two fingers up! Victory!","Drive safe. Or fast. Fast is also fine."];
const DEALER_LOT=['mid','spyder','sig','testa'];
const DEALER_LIST=['beater','mid','spyder','sig','testa'];
const PAINT_NAMES=['FACTORY','FLAMINGO PINK','BISCAYNE TEAL','COCAINE WHITE','MIDNIGHT BLACK','ROSSO RED','SUNSHINE YELLOW'];
const RIM_ORDER=['stock','chrome','gold','white'],RIM_NAMES={stock:'STOCK',chrome:'CHROME',gold:'GOLD',white:'WHITEWALLS'};
const GLOW_NAMES=['OFF','PINK','CYAN','PURPLE'];
const CARMODS={
 paint:{name:'PAINT JOB',price:800,desc:'Seven colours of Miami. Every spray moves to the next one.'},
 rims:{name:'RIMS',price:1500,desc:'Chrome, gold or old-school whitewalls.'},
 glow:{name:'NEON UNDERGLOW',price:2500,desc:'Your car floats on light. Cops love it. Ladies love it more.'},
 eng:{name:'V8 SWAP',price:6000,once:true,desc:'More engine than car. Faster on Ocean Drive.'},
 turbo:{name:'TURBO',price:9000,once:true,needs:'eng',desc:'Hold boost longer, refill it faster, hit a higher top speed.'}};
function carModState(k,x){if(k==='paint')return PAINT_NAMES[x.paint||0];if(k==='rims')return RIM_NAMES[x.rims||'stock'];if(k==='glow')return GLOW_NAMES[x.glow||0];return x[k]?'FITTED':'';}
let vicSayTxt='',vicImg=null;
function dealerSetup(g){g.park={x:g.car.x,z:g.car.z};const n=g.npcs.find(q=>q.kind==='vic');if(n){g.car={x:n.x,z:n.z};n.a=n.a0=Math.PI;n.r=0.3;g.lights.push({x:n.x,y:2.0,z:n.z-1.3,r:3.6,c:[1.3,1.05,0.9]});}
 const slots=[];for(let z=0;z<g.H;z++)for(let x=0;x<g.W;x++){const c=g.rows[z]&&g.rows[z][x];if(c>='1'&&c<='4')slots.push({i:+c-1,x:x+0.5,z:z+0.5});}
 slots.sort((a,b)=>a.i-b.i);g.dealer={slots:slots.map((s,i)=>({k:DEALER_LOT[i%DEALER_LOT.length],x:s.x,z:s.z,a0:0.5+i*1.3}))};
 g.solids=g.solids||[];for(const s of g.dealer.slots){g.solids.push({x:s.x,z:s.z,w:2.7,d:2.7});g.lights.push({x:s.x,y:2.4,z:s.z,r:3.4,c:[1.1,1.0,1.05]});}
 g.lights.push({x:g.W/2,y:2.2,z:6.4,r:6,c:[1.2,0.35,0.9]});
 g.obj="TALK TO VICTORY VIC · THEN BACK TO YOUR CAR";}
function dealerHello(g){const n=g&&g.npcs.find(q=>q.kind==='vic');if(!n)return;const p=myProg(),first=!(p.seen&&p.seen.vic);g.say={who:'VICTORY VIC',txt:first?"Hey hey HEY! Over here, friend! Come on in, the cars won't sell themselves!":pick(VIC_HI),t:0,dur:4};}
function dealerTargets(g,t){const n=g.npcs.find(q=>q.kind==='vic');if(n)t.push({k:'vic',x:n.x,z:n.z,r:2.7,lbl:'TALK TO VICTORY VIC'});
 for(const s of g.dealer.slots){const c=CARS[s.k],own=myProg().cars.includes(s.k);t.push({k:'show',car:s.k,x:s.x,z:s.z+1.4,r:2.0,lbl:carName(s.k)+(own?' · YOURS':' · $'+fmt(c.price))});}}
/* the lot car for a slot: your own signature model, or the dealer stock */
function drawLotCar(B,k,x,z,a){if(k==='mid'){drawCarShape(B,x,z,1,a,null,MIDCAR,0);return;}if(DEALER_CARS[k]){drawCarShape(B,x,z,1,a,null,DEALER_CARS[k].shape,0);return;}
 const r0=B.round;B.round=0.5;const id=rideId();if(id==='don')drawRolls(B,x,z,1,a,0);else if(id==='consigliere')drawEscalade(B,x,z,1,a,0);else drawLambo(B,x,z,1,a,null,0);B.round=r0;}
const DEALER_FONT={V:[[0,1,0.5,0],[0.5,0,1,1]],I:[[0.5,0,0.5,1]],C:[[1,1,0,1],[0,1,0,0],[0,0,1,0]],T:[[0,1,1,1],[0.5,1,0.5,0]],O:[[0,0,1,0],[1,0,1,1],[1,1,0,1],[0,1,0,0]],
 R:[[0,0,0,1],[0,1,1,1],[1,1,1,0.5],[1,0.5,0,0.5],[0.3,0.5,1,0]],Y:[[0,1,0.5,0.5],[1,1,0.5,0.5],[0.5,0.5,0.5,0]],M:[[0,0,0,1],[0,1,0.5,0.45],[0.5,0.45,1,1],[1,1,1,0]],S:[[1,1,0,1],[0,1,0,0.5],[0,0.5,1,0.5],[1,0.5,1,0],[1,0,0,0]]};
function dealerWord(B,word,cx,y,z,h,col){const w=h*0.62,gap=h*0.32;let x=cx-(word.length*(w+gap)-gap)/2;for(const ch of word){const S=DEALER_FONT[ch];if(S)for(const q of S)strokeBox(B,x+q[0]*w,y+q[1]*h,x+q[2]*w,y+q[3]*h,z,h*0.11,col);x+=w+gap;}}
function drawDealer(B,g){const D=g.dealer,T=g.T||0,PINK=[1,0.3,0.75],CYAN=[0.2,0.9,1];
 for(const s of D.slots){
  /* turntable: a low dais with a neon rim, the car turning slowly on top */
  for(let k=0;k<8;k++)B.box(TRS(s.x,0.05,s.z,k*Math.PI/8,2.7,0.1,1.12),[0.85,0.85,0.88]);
  for(let k=0;k<16;k++){const an=k*Math.PI/8;B.box(TRS(s.x+Math.cos(an)*1.36,0.09,s.z+Math.sin(an)*1.36,-an+Math.PI/2,0.56,0.03,0.04),k%2?PINK:CYAN,true);}
  B.round=0.35;
  drawLotCar(B,s.k,s.x,s.z,s.a0+T*0.3);
  /* price stand in front */
  B.box(TRS(s.x+1.15,0.45,s.z+1.25,0,0.04,0.9,0.04),[0.2,0.2,0.22]);B.box(TRS(s.x+1.15,0.95,s.z+1.27,0,0.42,0.28,0.02),[0.98,0.96,0.9]);B.box(TRS(s.x+1.15,1.06,s.z+1.285,0,0.36,0.05,0.01),myProg().cars.includes(s.k)?CYAN:PINK,true)}
 /* the storefront sign inside the glass, and the pylon out on the lot */
 const fz=(()=>{for(let z=0;z<g.H;z++)if(g.rows[z]&&g.rows[z].includes('G'))return z+1;return 6;})();
 B.box(TRS(g.W/2,2.3,fz+0.04,0,8.6,0.8,0.04),[0.08,0.04,0.1]);dealerWord(B,'VICTORY MOTORS',g.W/2,2.05,fz+0.08,0.48,PINK);B.box(TRS(g.W/2,2.72,fz+0.08,0,8.4,0.03,0.03),CYAN,true);B.box(TRS(g.W/2,1.88,fz+0.08,0,8.4,0.03,0.03),CYAN,true);
 const px=g.W-4.5,pz=2.4;B.box(TRS(px,1.5,pz,0,0.16,3,0.16),[0.25,0.25,0.28]);B.box(TRS(px,3.4,pz,0,2.2,1.3,0.12),[0.08,0.04,0.1]);dealerWord(B,'V',px,2.95,pz+0.08,0.85,PINK);B.box(TRS(px,4.08,pz+0.07,0,2.1,0.04,0.03),CYAN,true);B.box(TRS(px,2.76,pz+0.07,0,2.1,0.04,0.03),CYAN,true);
 /* pennant strings over the lot */
 const cols=[PINK,CYAN,[1,0.85,0.3],[1,1,1]];for(const [x0,x1,zz] of [[2,g.W-2,1.6],[2,g.W-2,4.4]]){const n=Math.round((x1-x0)/0.45);for(let i=0;i<=n;i++){const u=i/n,x=x0+(x1-x0)*u,y=2.6-Math.sin(u*Math.PI)*0.35+Math.sin(T*3+i)*0.02;B.box(TRS(x,y-0.1,zz,0,0.2,0.2,0.012),cols[i%4]);}}
 /* balloons on the end cars */
 for(const s of [D.slots[0],D.slots[D.slots.length-1]]){if(!s)continue;for(let i=0;i<3;i++){const bx=s.x-1.25+i*0.18,bz=s.z+1.2,by=1.6+i*0.15+Math.sin(T*2+i)*0.04;B.box(TRS(bx,by,bz,0,0.24,0.28,0.24),cols[i]);B.box(TRS(bx,by/2,bz,0,0.008,by,0.008),[0.9,0.9,0.9]);}}}
/* the stylised portrait on the dealer screen: the face photo, pixelated and posterised to a neon palette */
function paintVicFace(cv){if(!cv||cv.dataset.done)return;const go=()=>{const x=cv.getContext('2d',{willReadFrequently:true}),W=cv.width,H=cv.height;x.imageSmoothingEnabled=true;x.fillStyle='#2a0838';x.fillRect(0,0,W,H);x.drawImage(vicImg,30,0,320,355,0,0,W,H);
  const d=x.getImageData(0,0,W,H),P=d.data;for(let i=0;i<P.length;i+=4){const l=(P[i]*0.3+P[i+1]*0.55+P[i+2]*0.15)/255,q=v=>Math.round(v/255*5)/5*255;P[i]=Math.min(255,q(P[i])*1.04+(l<0.35?28:0));P[i+1]=q(P[i+1])*0.96;P[i+2]=Math.min(255,q(P[i+2])+(l<0.35?42:0));}
  x.putImageData(d,0,0);x.fillStyle='rgba(255,95,184,.10)';for(let y=0;y<H;y+=2)x.fillRect(0,y,W,1);cv.dataset.done='1';};
 if(vicImg&&vicImg.complete&&vicImg.naturalWidth){go();return;}if(!vicImg){vicImg=new Image();vicImg.src=ART.vic;}vicImg.addEventListener('load',go,{once:true});}
function dealerSay(t){vicSayTxt=t;const el=$('stSay');if(el)el.textContent=t;}
function openDealer(focus){if(state!=='play'||!G)return;const p=myProg();arm();if(!p.seen)p.seen={};const first=!p.seen.vic;p.seen.vic=1;saveProg();
 storeMode='dealer';G.say=null;const fi=DEALER_LIST.indexOf(focus);storeFocus=fi>=0?fi:0;state='store';show('sStore');sfx('ring');dealerSay(first?VIC_INTRO:pick(VIC_HI));renderStore('');}
function closeDealer(){state='play';show(null);const g=G;if(!g)return;if(g.park){g.car={x:g.park.x,z:g.park.z};g.obj='BACK TO YOUR CAR';}const n=g.npcs.find(q=>q.kind==='vic');if(n)popup(n.x,n.z,pick(VIC_BYE),'#ffe9a8');}
function renderDealer(msg){const p=myProg(),x=p.carx||(p.carx={});$('stWallet').textContent='$'+fmt(p.wallet);$('stOwed').textContent=p.debt>0?'OWED TO McWEY $'+fmt(p.debt):'DEBT CLEARED';
 document.querySelector('#sStore .shT').textContent='VICTORY MOTORS';document.querySelector('#sStore .shS').textContent=VIC_NAME+' · BISCAYNE BLVD · EVERY DEAL\'S A WIN';
 const face=$('stFace');face.style.display='block';paintVicFace(face);const say=$('stSay');say.style.display='';say.textContent=vicSayTxt;
 for(const id of ['stHome','stHomeH'])$(id).style.display='none';for(const id of ['stGold','stGoldH'])$(id).style.display='';$('stHome').innerHTML='';
 $('stCarsH').textContent='ON THE LOT';$('stGoldH').textContent="VIC'S GARAGE · FITS WHATEVER YOU DRIVE (NOW: "+carName(myCar())+')';
 $('stCars').innerHTML=DEALER_LIST.map((k,i)=>{const c=CARS[k],own=p.cars.includes(k),cur=p.car===k,lock=c.needs&&!p.cars.includes(c.needs);const act=cur?'DRIVING':own?'DRIVE IT':lock?'NEEDS THE '+carName(c.needs):'BUY $'+fmt(c.price);
  return `<button class="scard${cur?' on':''}" data-car="${k}"${lock?' style="opacity:.55"':''}><div class="pn">${carName(k)}</div><div class="pd">${c.desc}</div><div class="sp">${act}<span class="kbhint"> (${i+1})</span></div></button>`;}).join('');
 $('stGold').innerHTML=Object.keys(CARMODS).map((k,i)=>{const m=CARMODS[k],st=carModState(k,x),lock=m.needs&&!x[m.needs],done=m.once&&x[k];const act=done?'FITTED':lock?'NEEDS THE '+CARMODS[m.needs].name:(m.once?'':st+' · NEXT ')+'$'+fmt(m.price);
  return `<button class="scard${done?' on':''}" data-cx="${k}"${lock?' style="opacity:.55"':''}><div class="pn">${m.name}</div><div class="pd">${m.desc}</div><div class="sp">${act}<span class="kbhint"> (${(DEALER_LIST.length+i+1)%10})</span></div></button>`;}).join('');
 $('stMsg').textContent=msg||'';const cs=document.querySelectorAll('#sStore .scard');cs.forEach((b,i)=>b.style.outline=padMode&&i===storeFocus?'3px solid #ffd36b':'');if(padMode&&cs[storeFocus]&&cs[storeFocus].scrollIntoView)cs[storeFocus].scrollIntoView({block:'nearest'});}
function buyCarMod(k){const p=myProg(),x=p.carx||(p.carx={}),m=CARMODS[k];if(!m)return;if(m.once&&x[k])return renderStore('Already fitted.');if(m.needs&&!x[m.needs])return renderStore('Fit the '+CARMODS[m.needs].name+' first.');
 if(p.wallet<m.price){sfx('blip');dealerSay(pick(VIC_POOR));return renderStore('Not enough cash. Come back richer.');}
 p.wallet-=m.price;if(k==='paint')x.paint=((x.paint||0)+1)%PAINT_NAMES.length;else if(k==='rims')x.rims=RIM_ORDER[(RIM_ORDER.indexOf(x.rims||'stock')+1)%RIM_ORDER.length];else if(k==='glow')x.glow=((x.glow||0)+1)%GLOW_NAMES.length;else x[k]=1;
 saveProg();sfx('cash');dealerSay(pick(VIC_MOD));renderStore(m.name+': '+(carModState(k,x)||'FITTED')+'.');}
