'use strict';
/* ANIMALS: the pets you can buy, Schmaltzy's terrier Nugget, the guard dogs, the fish and the sharks in the tanks.
   Every animal is built from rounded, tapered boxes on an instanced batch (IBhi near the camera, IBlo far away), which the
   classic renderer and the new one both draw; the PS1 look falls back to plain boxes. Four-legged animals have a skeleton:
   each leg solves two-bone IK to a foot that follows a real gait (walk, trot, gallop), the hips drop to sit or lie down when
   they stop, the spine rocks, the head looks around, and tails and fish swim on a travelling wave. Motion state lives on the
   animal object in o._an, so nothing here allocates per animal beyond the matrices it draws. */
const AN_TAU=Math.PI*2;
const anV=(x,y,z)=>[x,y,z];
const anAdd=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],anSub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],anMul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
const anLen=a=>Math.hypot(a[0],a[1],a[2]),anDot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],anLerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const anMix=(a,b,t)=>a+(b-a)*t,anCl=(v,a,b)=>v<a?a:v>b?b:v,anFr=v=>v-Math.floor(v);
const anRotY=(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return [p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];};
/* a box at (x,y,z) of size (sx,sy,sz) in frame m; r = corner rounding (1 = fully round), tp = taper toward +y */
function anB(I,m,x,y,z,sx,sy,sz,c,r,tp,em){I.r=r===undefined?1:r;I.tp=tp||0;I.box(A.mul(m,[sx,0,0,x,0,sy,0,y,0,0,sz,z]),c,!!em);}
/* the same with a rotation (yaw, pitch, roll) */
function anBR(I,m,x,y,z,ry,rx,rz,sx,sy,sz,c,r,tp,em){I.r=r===undefined?1:r;I.tp=tp||0;I.box(A.mul(m,A.mul(A.mul(A.mul(A.T(x,y,z),A.RY(ry)),A.RX(rx)),A.mul(A.RZ(rz),A.S(sx,sy,sz)))),c,!!em);}
/* a box from point p to point q (its local y axis), w wide and d deep. The depth axis leans toward hint (default up, or forward
   when the segment itself is vertical). tp > 0 narrows it toward q. */
function anS(I,m,p,q,w,d,c,r,tp,hint){let dx=q[0]-p[0],dy=q[1]-p[1],dz=q[2]-p[2];const L=Math.hypot(dx,dy,dz)||1e-4;dx/=L;dy/=L;dz/=L;
 let h=hint||[0,1,0],k=h[0]*dx+h[1]*dy+h[2]*dz,zx=h[0]-k*dx,zy=h[1]-k*dy,zz=h[2]-k*dz,zl=Math.hypot(zx,zy,zz);
 if(zl<0.25){h=hint?[0,1,0]:[0,0,1];if(Math.abs(h[0]*dx+h[1]*dy+h[2]*dz)>0.9)h=[0,0,1];k=h[0]*dx+h[1]*dy+h[2]*dz;zx=h[0]-k*dx;zy=h[1]-k*dy;zz=h[2]-k*dz;zl=Math.hypot(zx,zy,zz)||1;}
 zx/=zl;zy/=zl;zz/=zl;const xx=dy*zz-dz*zy,xy=dz*zx-dx*zz,xz=dx*zy-dy*zx;
 I.r=r===undefined?1:r;I.tp=tp||0;I.box(A.mul(m,[xx*w,dx*L,zx*d,(p[0]+q[0])/2,xy*w,dy*L,zy*d,(p[1]+q[1])/2,xz*w,dz*L,zz*d,(p[2]+q[2])/2]),c);}
/* two-bone IK: the middle joint for a limb of lengths a, b from S to T, bending toward the pole direction */
function anIK(S,T,a,b,pole){let d=anSub(T,S),L=anLen(d);const mx=(a+b)*0.995;if(L>mx){T=anAdd(S,anMul(d,mx/L));L=mx;}if(L<1e-4)L=1e-4;
 const u=anMul(anSub(T,S),1/L),x=(a*a-b*b+L*L)/(2*L),h=Math.sqrt(Math.max(0,a*a-x*x));let pv=anSub(pole,anMul(u,anDot(pole,u)));const pl=anLen(pv)||1;pv=anMul(pv,1/pl);
 return {j:anAdd(anAdd(S,anMul(u,x)),anMul(pv,h)),t:T};}
/* which batch: detailed near the camera, coarse far away (same rule as the people) */
function anBatch(x,z){return typeof G==='object'&&G&&G.cam&&Math.hypot(x-G.cam.x,z-G.cam.z)>=11?IBlo:IBhi;}
/* motion tracking: speed from how far the animal moved since the last frame, and a gait phase that advances with distance so
   the feet stay planted instead of sliding */
function anTrack(o,T,stride){const s=o._an||(o._an={x:o.x,z:o.z,t:T,ph:Math.random(),v:0,rest:0,still:0,look:0,lk:0,lkT:0});let dt=T-s.t;
 if(!(dt>0)||dt>0.5){s.x=o.x;s.z=o.z;s.t=T;return s;}const d=Math.hypot(o.x-s.x,o.z-s.z),v=Math.min(9,d/dt);s.v=s.v+(v-s.v)*Math.min(1,dt*10);
 s.ph=anFr(s.ph+d/Math.max(0.05,stride));s.x=o.x;s.z=o.z;s.t=T;s.still=s.v<0.12?s.still+dt:0;s.rest=anCl(s.rest+(s.still>0.7?dt*1.6:-dt*4),0,1);
 /* idle head turns: look somewhere new every couple of seconds */
 s.lkT-=dt;if(s.lkT<=0){s.lkT=1.2+Math.random()*2.8;s.lk=s.v>0.3?0:(Math.random()-0.5)*1.5;}s.look+=(s.lk-s.look)*Math.min(1,dt*3);s.dt=dt;return s;}

/* ---------------- four-legged animals ---------------- */
/* sizes in world units. H shoulder height, L shoulder-to-hip, cw/ch chest, hw/hh hips, wl waist (0..1 of chest depth), lg leg
   thickness, hd skull, mz muzzle length, mw muzzle width; ear: prick | flop | bat | crop | round | cat; tail: n segments, len,
   w, up (angle), curl, kind; colours: c coat, b belly, m muzzle, l lower legs, p paws, e ears, n nose, eye iris */
const AN_SPEC={
 dober:{H:0.6,L:0.46,cw:0.22,ch:0.3,hw:0.2,hh:0.21,wl:0.55,lg:0.075,hd:0.17,mz:0.17,mw:0.085,neck:0.2,nw:0.11,ear:'crop',es:0.11,
  tail:{n:3,len:0.12,w:0.035,up:0.9,curl:0},c:[0.07,0.06,0.06],b:[0.07,0.06,0.06],m:[0.55,0.3,0.12],l:[0.55,0.3,0.12],p:[0.5,0.28,0.12],e:[0.07,0.06,0.06],n:[0.03,0.03,0.03],eye:[0.35,0.2,0.08],
  tan:1,stride:0.62,collar:[0.15,0.15,0.17],spikes:1},
 mutt:{H:0.42,L:0.36,cw:0.2,ch:0.25,hw:0.18,hh:0.19,wl:0.7,lg:0.07,hd:0.15,mz:0.12,mw:0.08,neck:0.14,nw:0.1,ear:'flop',es:0.1,
  tail:{n:5,len:0.3,w:0.04,up:0.7,curl:0.18},c:[0.62,0.42,0.24],b:[0.9,0.8,0.64],m:[0.85,0.72,0.55],l:[0.62,0.42,0.24],p:[0.9,0.8,0.64],e:[0.42,0.26,0.14],n:[0.06,0.05,0.05],eye:[0.3,0.18,0.08],
  chest:[0.9,0.8,0.64],stride:0.45,collar:[0.85,0.1,0.15],tag:1},
 boston:{H:0.25,L:0.19,cw:0.15,ch:0.16,hw:0.13,hh:0.13,wl:0.75,lg:0.045,hd:0.13,mz:0.05,mw:0.08,neck:0.08,nw:0.09,ear:'bat',es:0.085,
  tail:{n:2,len:0.05,w:0.03,up:-0.3,curl:0.9},c:[0.08,0.07,0.08],b:[0.94,0.93,0.91],m:[0.94,0.93,0.91],l:[0.08,0.07,0.08],p:[0.94,0.93,0.91],e:[0.08,0.07,0.08],n:[0.03,0.03,0.03],eye:[0.22,0.13,0.07],
  chest:[0.94,0.93,0.91],blaze:[0.94,0.93,0.91],bug:1,stride:0.28,collar:[1,0.78,0.3],tag:1},
 cat:{H:0.22,L:0.25,cw:0.12,ch:0.14,hw:0.12,hh:0.13,wl:0.75,lg:0.04,hd:0.1,mz:0.035,mw:0.06,neck:0.07,nw:0.065,ear:'cat',es:0.06,
  tail:{n:7,len:0.36,w:0.03,up:1.0,curl:-0.22},c:[0.5,0.5,0.52],b:[0.78,0.77,0.76],m:[0.82,0.8,0.78],l:[0.5,0.5,0.52],p:[0.78,0.77,0.76],e:[0.42,0.42,0.44],n:[0.85,0.5,0.55],eye:[0.6,0.85,0.25],
  stripes:{n:7,c:[0.24,0.24,0.27],w:0.02},tailRings:[0.24,0.24,0.27],slit:1,whisk:1,stride:0.3},
 tiger:{H:0.72,L:0.7,cw:0.32,ch:0.38,hw:0.3,hh:0.32,wl:0.8,lg:0.11,hd:0.27,mz:0.12,mw:0.17,neck:0.18,nw:0.2,ear:'round',es:0.08,
  tail:{n:8,len:0.75,w:0.06,up:-0.9,curl:0.18},c:[0.95,0.5,0.12],b:[0.97,0.94,0.88],m:[0.97,0.94,0.88],l:[0.95,0.5,0.12],p:[0.95,0.55,0.18],e:[0.1,0.08,0.07],n:[0.8,0.45,0.42],eye:[0.95,0.75,0.2],
  stripes:{n:11,c:[0.07,0.05,0.05],w:0.04},tailRings:[0.07,0.05,0.05],ruff:1,whisk:1,stride:0.8,heavy:1}};
const AN_GAIT={walk:{duty:0.64,off:[0,0.5,0.75,0.25],lift:0.16},trot:{duty:0.5,off:[0,0.5,0.5,0],lift:0.22},gallop:{duty:0.38,off:[0,0.1,0.55,0.66],lift:0.3}};
const AN_EYEW=[1,1,1],AN_PINK=[0.9,0.4,0.48],AN_TEETH=[0.96,0.94,0.86],AN_GOLD=[1,0.78,0.3];
/* st: T time, ph gait phase 0..1, v speed, gait, rest 0..1, restKind sit|lie, look yaw, tilt, mouth 0..1, pant, wag, crouch,
   snarl, blink, dead */
function anQuad(I,M,sp,st){const T=st.T,H=sp.H,L=sp.L,G2=AN_GAIT[st.gait||'walk'],rest=st.rest||0,lie=st.restKind==='lie'?rest:0,sit=st.restKind==='lie'?0:rest;
 const mv=anCl(st.v||0,0,1)*(1-rest),ph=st.ph||0,gal=st.gait==='gallop',cr=st.crouch||0,br=Math.sin(T*(st.pant?7:1.8))*0.006*H/0.4;
 const stride=sp.stride*(gal?1.5:st.gait==='trot'?1.1:0.8)*mv;
 /* the body: spine bob twice a stride (once at the gallop, with the back rocking) */
 const bob=gal?Math.sin(ph*AN_TAU)*0.05*H*mv:-Math.abs(Math.cos(ph*AN_TAU*2))*0.03*H*mv,rock=gal?Math.sin(ph*AN_TAU+0.9)*0.13*mv:0;
 const sy=H*(1-0.14*cr)*(1-0.55*lie)+bob+Math.sin(rock)*L*0.5+br,hy=H*0.97*(1-0.1*cr)*(1-0.62*sit)*(1-0.6*lie)+bob-Math.sin(rock)*L*0.5;
 const sh=[0,sy,L/2+cr*0.04],hp=[0,hy,-L/2+sit*L*0.18],f=anMul(anSub(sh,hp),1/(anLen(anSub(sh,hp))||1));
 const up=[0,f[2],-f[1]];/* perpendicular to the spine, toward the back */
 const along=(t,dn)=>anAdd(anLerp(hp,sh,t),anMul(up,-dn));
 /* torso: ribcage hanging low, a tucked waist, a round rump; belly colour underneath */
 anS(I,M,along(0.34,sp.ch*0.18),anAdd(along(1.08,sp.ch*0.12),[0,0,0]),sp.cw,sp.ch,sp.c,1,0.12);
 anS(I,M,along(0.42,sp.ch*0.36),along(1.0,sp.ch*0.34),sp.cw*0.8,sp.ch*0.55,sp.b,1,0.25);
 anS(I,M,along(0.0,sp.hh*0.08),along(0.6,sp.ch*(1-sp.wl)*0.4),sp.hw*0.92,sp.ch*sp.wl,sp.c,1,-0.1);
 anS(I,M,along(-0.2,sp.hh*0.05),along(0.22,sp.hh*0.12),sp.hw,sp.hh,sp.c,1,0);
 if(sp.chest)anS(I,M,along(0.9,sp.ch*0.32),along(1.12,sp.ch*0.18),sp.cw*0.62,sp.ch*0.5,sp.chest,1,0.3);
 if(sp.tan){for(const s of [-1,1])anB(I,M,s*sp.cw*0.22,sh[1]-sp.ch*0.05,sh[2]+sp.cw*0.5+0.01,0.045,0.05,0.03,sp.m);}
 /* stripes: short curved bands lying on the back and upper flanks (pills placed around the body's cross-section) */
 if(sp.stripes){const S=sp.stripes,ry=Math.atan2(f[0],f[2]),rx=-Math.asin(anCl(f[1],-1,1));
  for(let k=0;k<S.n;k++){const t=-0.12+k*(1.16/S.n)+((k*37)%5)*0.01,sec=t<0.18?[sp.hw,sp.hh,sp.hh*0.05]:t<0.5?[sp.hw*0.92,sp.ch*sp.wl,sp.ch*(1-sp.wl)*0.25]:[sp.cw,sp.ch,sp.ch*0.18];
   const P=along(t,sec[2]),Fb=A.mul(A.mul(A.mul(M,A.T(P[0],P[1],P[2])),A.RY(ry)),A.RX(rx)),a=sec[0]*0.5,b=sec[1]*0.5,n=k%2?4:5,sp2=k%3===1?0.8:1;
   for(let j=0;j<n;j++){const th=(j/(n-1)-0.5)*2.3*sp2;anBR(I,Fb,Math.sin(th)*a*0.96,Math.cos(th)*b*0.96,(j%2)*S.w*0.3,0,0,-th,a*0.6,0.012,S.w*(j===0||j===n-1?0.7:1),S.c,1,0);}}}
 /* legs: front shoulders, hind hips, feet from the gait (or tucked for sitting / lying) */
 const legs=[[-1,1],[1,1],[-1,0],[1,0]];const fx=sp.cw*0.3;
 for(let i=0;i<4;i++){const [s,fr]=legs[i],p=anFr(ph+G2.off[i]);let fz,fy;
  if(p<G2.duty){fz=stride*(0.5-p/G2.duty);fy=0;}else{const t=(p-G2.duty)/(1-G2.duty);fz=stride*(-0.5+t);fy=Math.sin(t*Math.PI)*G2.lift*H*mv;}
  if(fr){const S=[s*fx,sh[1]-sp.ch*0.32,sh[2]-0.01],wh=H*0.13;
   let foot=[s*fx*(1+0.2*lie),fy,sh[2]+fz+cr*0.06];foot=anLerp(foot,[s*fx,0,sh[2]+lie*H*0.34+sit*0.02],rest);
   const W=anAdd(foot,[0,anMix(wh,wh*0.4,lie)+fy*0.3,fy*-0.25]),la=(H-wh)*0.53;const k=anIK(S,W,la,la,[0,0,-1]);
   anS(I,M,anAdd(S,[0,sp.ch*0.12,0.02]),k.j,sp.lg*1.55,sp.lg*1.9,sp.c,1,0.35);anS(I,M,k.j,k.t,sp.lg*0.95,sp.lg*1.0,sp.l,1,0.2);
   anS(I,M,k.t,anAdd(foot,[0,sp.lg*0.35,0.01]),sp.lg*0.8,sp.lg*0.8,sp.p,1,0.1);anB(I,M,foot[0],foot[1]+sp.lg*0.26,foot[2]+sp.lg*0.35,sp.lg*1.1,sp.lg*0.52,sp.lg*1.35,sp.p,1);}
  else{const S=[s*sp.hw*0.3,hp[1]-sp.hh*0.15,hp[2]+0.01];
   let foot=[s*fx,fy,hp[2]+fz*0.9];foot=anLerp(foot,[s*fx*(1.25+lie*0.5),0,hp[2]+L*(sit*0.42+lie*0.15)],rest);
   const hk=anAdd(foot,anLerp([0,H*0.3+fy*0.2,-H*0.08],[0,0.025+sp.lg*0.3,-H*0.32],rest)),la=H*0.4,lb=H*0.36;const k=anIK(S,hk,la,lb,[0,0,1]);
   anS(I,M,anAdd(S,[0,sp.hh*0.2,-0.02]),k.j,sp.hw*0.42,sp.lg*2.6,sp.c,1,0.4);anS(I,M,k.j,k.t,sp.lg*0.9,sp.lg*1.2,sp.l,1,0.25);
   anS(I,M,k.t,anAdd(foot,[0,sp.lg*0.35,0]),sp.lg*0.75,sp.lg*0.8,sp.l,1,0.1);anB(I,M,foot[0],foot[1]+sp.lg*0.26,foot[2]+sp.lg*0.3,sp.lg*1.05,sp.lg*0.5,sp.lg*1.3,sp.p,1);}}
 /* tail: a chain whose segments lag behind each other, so a wag travels down it */
 {const tl=sp.tail,n=tl.n,sl=tl.len/n,wag=st.wag||0;let P=anAdd(along(-0.18,-sp.hh*0.28),[0,0,0]),yaw=0,pit=tl.up*(1-0.5*sit)*(1-lie)-lie*0.25-(st.tuck||0)+(gal?-0.3:0);
  for(let j=0;j<n;j++){const u=(j+1)/n;yaw=Math.sin(T*(wag>0.5?13:3)-j*0.7)*(wag*0.55+0.08)*u*1.6+lie*0.5*(j+1);pit+=tl.curl*(1-lie)+(j===0?0:Math.sin(T*1.3-j)*0.03);
   const dir=anRotY([0,Math.sin(pit),-Math.cos(pit)],yaw),Q=anAdd(P,anMul(dir,sl));const ring=sp.tailRings&&(j%2===1||j===n-1);
   anS(I,M,P,Q,tl.w*(1-u*0.45),tl.w*(1-u*0.45),j===n-1&&sp.tailRings?sp.tailRings:ring?sp.tailRings:sp.c,1,0.15);P=Q;}}
 /* neck and head */
 const nb=along(1.02,-sp.ch*0.18),na=anMix(anMix(0.95,0.35,mv*(gal?1:0.5)),0.15,cr)+sit*0.05-lie*0.55,look=st.look||0;
 const nd=anRotY([0,Math.sin(na),Math.cos(na)],look*0.6),hc=anAdd(nb,anMul(nd,sp.neck));
 anS(I,M,anAdd(nb,anMul(nd,-0.02)),hc,sp.nw,sp.nw*1.25,sp.c,1,0.15);
 if(sp.collar||sp.spikes||sp.tag){const cc=anLerp(nb,hc,0.45);anS(I,M,anAdd(cc,anMul(nd,-0.012)),anAdd(cc,anMul(nd,0.012)),sp.nw*1.05,sp.nw*1.3,sp.collar||[0.8,0.1,0.15],0.8,0);
  if(sp.spikes)for(let k=0;k<6;k++){const a=(k/6)*AN_TAU,o=[Math.cos(a)*sp.nw*0.58,Math.sin(a)*sp.nw*0.7,0];anB(I,M,cc[0]+o[0],cc[1]+o[1],cc[2]+o[2]*0+nd[2]*0.0,0.018,0.018,0.018,[0.8,0.8,0.85],1);}
  if(sp.tag)anB(I,M,cc[0],cc[1]-sp.nw*0.75,cc[2]+0.03,0.03,0.035,0.008,AN_GOLD,1);}
 const hpit=-0.15+na*0.35-(st.headDown||0),Mh=A.mul(A.mul(A.mul(M,A.T(hc[0],hc[1],hc[2])),A.RY(look*0.9)),A.mul(A.RX(hpit*-1+0.0),A.RZ(st.tilt||0)));
 anHead(I,Mh,sp,st,T);}
/* the head in its own frame: +z is where the nose points */
function anHead(I,Mh,sp,st,T){const s=sp.hd,mo=anCl(st.mouth||0,0,1),bl=st.dead?1:(st.blink||(anFr(T*0.23+(st.seed||0))<0.025?1:0)),sn=st.snarl||0;
 anB(I,Mh,0,0,0,s*0.95,s*0.85,s*1.0,sp.c,1);/* skull */
 if(sp.ruff){for(const x of [-1,1])anBR(I,Mh,x*s*0.42,-s*0.12,-s*0.05,x*0.3,0,x*0.4,s*0.38,s*0.55,s*0.5,sp.b,1);}
 if(sp.bug){anB(I,Mh,0,s*0.12,-s*0.08,s*1.05,s*0.8,s*0.85,sp.c,1);}
 /* muzzle and jaw: the lower jaw swings open at the hinge */
 const mz=sp.mz,mw=sp.mw,my=-s*0.18;anS(I,Mh,[0,my+s*0.06,s*0.25],[0,my+s*0.02,s*0.42+mz],mw,mw*0.9,sp.m,1,0.3);
 anB(I,Mh,0,my+s*0.06+mw*0.35,s*0.45+mz,mw*0.45,mw*0.38,mw*0.3,sp.n,1);/* nose */
 if(sp.blaze)anS(I,Mh,[0,s*0.42,s*0.2],[0,my+s*0.2,s*0.46],s*0.14,s*0.08,sp.blaze,1,0.4);
 if(sp.tan)for(const x of [-1,1])anB(I,Mh,x*s*0.24,s*0.27,s*0.44,s*0.13,s*0.08,s*0.06,sp.m,1);
 {const ja=0.08+mo*0.55,jl=s*0.2+mz*0.95,jw=mw*0.82,J=A.mul(Mh,A.mul(A.T(0,my-mw*0.18,s*0.18),A.RX(ja)));
  anB(I,J,0,0,jl/2,jw,mw*0.32,jl,sp.m,1);if(mo>0.15||sn>0.2){for(const x of [-1,1]){anBR(I,Mh,x*mw*0.3,my-mw*0.25,s*0.36+mz*0.8,0,0,0,0.012,0.03*s/0.17,0.012,AN_TEETH,0.6,0.7);anBR(I,J,x*mw*0.28,mw*0.18,jl*0.85,0,Math.PI,0,0.011,0.026*s/0.17,0.011,AN_TEETH,0.6,0.7);}
   anB(I,J,0,mw*0.12,jl*0.5,jw*0.75,0.01,jl*0.8,[0.55,0.12,0.16],1);}
  if(st.pant&&!st.dead){const sw=Math.sin(T*7)*0.08;anS(I,J,[0,mw*0.15,jl*0.55],[sw*0.2,-mw*0.32,jl*0.98],jw*0.6,0.012,AN_PINK,1,0.1);}
  if(st.dead){anS(I,J,[0,mw*0.15,jl*0.6],[0.02,-mw*0.2,jl*1.15],jw*0.55,0.012,AN_PINK,1,0.1);}}
 if(sp.whisk)for(const x of [-1,1])for(let k=0;k<3;k++)anBR(I,Mh,x*mw*0.75,my+s*0.02-k*0.01,s*0.4+mz,x*(0.25+k*0.15),0,0,s*0.65,0.003,0.003,[0.95,0.95,0.92],0,0);
 /* eyes: dark ball, coloured iris, a glint (the glint reads as life from the top-down camera) */
 for(const x of [-1,1]){const ex=x*s*(sp.bug?0.32:0.27),ey=s*0.1,ez=s*0.42;
  if(bl){anB(I,Mh,ex,ey,ez,s*0.16,s*0.03,s*0.06,sp.c,1);continue;}
  anB(I,Mh,ex,ey,ez,s*0.15,s*0.13,s*0.1,[0.03,0.025,0.02],1);anB(I,Mh,ex+x*s*0.012,ey,ez+s*0.035,s*0.11,s*0.1,s*0.04,sp.eye,1);
  anB(I,Mh,ex+x*s*0.012,ey,ez+s*0.052,sp.slit?s*0.02:s*0.055,s*0.08,s*0.02,[0.01,0.01,0.01],1);anB(I,Mh,ex-x*s*0.01,ey+s*0.03,ez+s*0.06,s*0.025,s*0.025,s*0.01,AN_EYEW,1,0,true);
  if(sn>0.2)anBR(I,Mh,ex,ey+s*0.09,ez,0,0,-x*0.35,s*0.2,s*0.04,s*0.08,sp.c,1);}
 /* ears */
 const eb=st.earsBack||0,es=sp.es,tw=(anFr(T*0.37+(st.seed||0)*3)<0.04)?0.3:0;
 for(const x of [-1,1]){const tws=x>0?tw:0;
  if(sp.ear==='crop'||sp.ear==='cat'||sp.ear==='bat'){const base=[x*s*(sp.ear==='bat'?0.3:0.27),s*0.34,-s*0.05],ba=sp.ear==='bat'?0.55:0.25,tip=anAdd(base,[x*Math.sin(ba)*es,Math.cos(ba+eb*0.9)*es,-es*(eb*0.9+tws)-es*0.08]);
   anS(I,Mh,base,tip,es*(sp.ear==='bat'?0.85:0.55),0.018*(es/0.1),sp.e,0.5,0.85,[0,0,1]);if(sp.ear!=='crop')anS(I,Mh,anAdd(base,[0,0.004,0.006]),anAdd(tip,[0,-es*0.2,0.006]),es*(sp.ear==='bat'?0.55:0.32),0.008,AN_PINK,0.5,0.85,[0,0,1]);}
  else if(sp.ear==='flop'){const base=[x*s*0.38,s*0.25,-s*0.08],sw=Math.sin(T*2+x)*0.03;anS(I,Mh,base,[x*s*0.5,-s*0.2-eb*0.05,-s*0.08+sw-eb*0.06],0.03,es*0.7,sp.e,1,0.2,[0,0,1]);}
  else{anB(I,Mh,x*s*0.36,s*0.38,-s*0.1,es,es*0.9,es*0.45,sp.e,1);anB(I,Mh,x*s*0.36,s*0.37,-s*0.07,es*0.6,es*0.55,es*0.2,sp.b,1);}}}

/* ---------------- the iguana: sprawling legs, a body that swings side to side as it walks ---------------- */
function anLizard(I,M,st){const T=st.T,ph=st.ph||0,mv=anCl(st.v||0,0,1),C=[0.32,0.6,0.28],D=[0.18,0.36,0.16],Bl=[0.55,0.75,0.42],n=6;
 const wv=u=>Math.sin(ph*AN_TAU-u*2.2)*0.05*mv+Math.sin(T*0.6)*0.01;
 const spine=[];for(let i=0;i<=n;i++){const u=i/n;spine.push([wv(u),0.075+Math.sin(u*Math.PI)*0.012,0.2-u*0.42]);}
 for(let i=0;i<n;i++){const u=i/n,w=0.13-Math.abs(u-0.45)*0.08;anS(I,M,spine[i],spine[i+1],w,w*0.62,i%2?C:D,1,0);}
 anS(I,M,anAdd(spine[1],[0,-0.03,0]),anAdd(spine[5],[0,-0.03,0]),0.09,0.04,Bl,1,0);
 for(let i=1;i<n;i++)anS(I,M,anAdd(spine[i],[0,0.035,0]),anAdd(spine[i],[0,0.065,-0.01]),0.006,0.02,[0.5,0.72,0.35],0.4,0.9);
 /* legs */
 for(const [s,fr,o] of [[-1,1,0],[1,1,0.5],[-1,0,0.5],[1,0,0]]){const P=spine[fr?1:5],p=anFr(ph+o),stc=p<0.6,t=stc?p/0.6:(p-0.6)/0.4,fz=0.09*mv*(stc?0.5-t:-0.5+t),fy=stc?0:Math.sin(t*Math.PI)*0.03*mv;
  const S=[P[0]+s*0.05,P[1]-0.01,P[2]],foot=[P[0]+s*0.14,fy,P[2]+fz+(fr?0.03:-0.02)],E=[P[0]+s*0.1,0.08,P[2]+(fr?-0.01:0.02)];
  anS(I,M,S,E,0.038,0.034,C,1,0.2);anS(I,M,E,foot,0.028,0.028,C,1,0.2);for(let k=-1;k<=1;k++)anS(I,M,foot,anAdd(foot,[s*0.02+k*0.015,0,0.035]),0.008,0.008,D,0.5,0.4);}
 /* tail: long, banded, swishing */
 let P=spine[n],yaw=0;for(let j=0;j<8;j++){const u=(j+1)/8;yaw=Math.sin(ph*AN_TAU-2.2-j*0.45)*0.35*mv+Math.sin(T*0.9-j*0.5)*0.12*u;const Q=anAdd(P,[Math.sin(yaw)*0.07,-(P[1]-0.03)*0.25,-Math.cos(yaw)*0.07]);
  anS(I,M,P,Q,0.06*(1-u*0.8),0.05*(1-u*0.8),j%2?D:C,1,0.1);P=Q;}
 /* head: wedge skull, dewlap under the chin, the big round cheek scale */
 const h0=spine[0],look=st.look||0,Mh=A.mul(A.mul(M,A.T(h0[0],h0[1]+0.01,h0[2]+0.03)),A.RY(look*0.5+wv(0)*-3));
 anS(I,Mh,[0,0,0],[0,-0.005,0.13],0.075,0.055,C,1,0.45);anS(I,Mh,[0,-0.02,0.01],[0,-0.03,0.12],0.06,0.03,Bl,1,0.4);
 const dw=0.03+Math.max(0,Math.sin(T*0.8))*0.012;anS(I,Mh,[0,-0.035,0.02],[0,-0.035-dw,0.08],0.008,0.05,[0.45,0.7,0.35],0.6,0.3,[0,0,1]);
 for(const x of [-1,1]){anB(I,Mh,x*0.037,0.0,0.06,0.012,0.02,0.02,[0.04,0.04,0.03],1);anB(I,Mh,x*0.039,0.005,0.062,0.006,0.006,0.006,AN_EYEW,1,0,true);anB(I,Mh,x*0.034,-0.02,0.0,0.004,0.03,0.03,[0.75,0.8,0.65],1);}
 for(let k=0;k<4;k++)anS(I,Mh,[0,0.025,-0.01-k*0.025],[0,0.06-k*0.006,-0.02-k*0.025],0.005,0.018,[0.5,0.72,0.35],0.4,0.9);}

/* ---------------- fish ---------------- */
const AN_FISH={
 koi:{len:1,w:0.2,h:0.24,c:[0.97,0.95,0.92],fin:[0.98,0.9,0.82],spots:[[0.3,0.25,[1,0.42,0.08]],[0.62,0.3,[0.95,0.3,0.06]],[0.12,0.18,[0.85,0.12,0.05]]],barbel:1,tail:0.32},
 goldkoi:{len:1,w:0.2,h:0.24,c:[1,0.55,0.12],fin:[1,0.62,0.25],spots:[[0.45,0.28,[0.98,0.96,0.92]]],barbel:1,tail:0.32},
 clown:{len:1,w:0.24,h:0.42,c:[1,0.45,0.05],fin:[1,0.45,0.05],bands:[0.22,0.5,0.8],edge:[0.05,0.04,0.04],tail:0.26},
 angel:{len:1,w:0.1,h:0.62,c:[0.85,0.86,0.82],fin:[0.85,0.86,0.82],bars:[0.18,0.45,0.75],barC:[0.12,0.12,0.12],long:1,tail:0.28},
 tang:{len:1,w:0.14,h:0.55,c:[0.12,0.32,0.95],fin:[0.1,0.2,0.7],tailC:[1,0.85,0.1],mark:[0.04,0.06,0.2],tail:0.28},
 ytang:{len:1,w:0.13,h:0.62,c:[1,0.88,0.1],fin:[1,0.86,0.12],tail:0.27,snout:1},
 grouper:{len:1,w:0.24,h:0.3,c:[0.5,0.46,0.38],fin:[0.42,0.38,0.32],spots:[[0.4,0.2,[0.35,0.3,0.24]],[0.7,0.22,[0.35,0.3,0.24]]],tail:0.28}};
/* a fish of length s in frame m (it swims toward +z); ph is its own swim phase */
function anFish(I,m,T,kind,s,ph){const F=AN_FISH[kind]||AN_FISH.koi,sw=T*7+ph,W=F.w*s,Hh=F.h*s;
 const X=u=>Math.sin(sw-u*3.4)*(0.02+0.16*u*u)*s;const pt=u=>[X(u),0,s*(0.5-u)];
 const prof=u=>u<0.18?0.55+u*2.5:u<0.6?1:Math.max(0.22,1-(u-0.6)*1.9);
 for(let i=0;i<4;i++){const u0=[0,0.2,0.45,0.68][i],u1=[0.2,0.45,0.68,0.86][i],p0=prof(u0),p1=prof(u1),a=Math.max(p0,p1),big=p0>=p1;
  anS(I,m,pt(big?u0:u1),pt(big?u1:u0),W*a,Hh*a,F.c,1,1-Math.min(p0,p1)/a);}
 if(F.snout)anS(I,m,pt(0.05),[0,-Hh*0.05,s*0.62],W*0.4,Hh*0.15,F.c,1,0.4);
 /* markings ride on the body */
 if(F.spots)for(const [u,r,c] of F.spots){const P=pt(u);anB(I,m,P[0],Hh*0.18,P[2],W*0.9,Hh*0.5,s*r,c,1);}
 if(F.bands)for(const u of F.bands){const P=pt(u),a=prof(u);anB(I,m,P[0],0,P[2],W*a*1.04,Hh*a*1.02,s*0.07,F.edge,1);anB(I,m,P[0],0,P[2],W*a*1.08,Hh*a*0.98,s*0.045,[1,1,1],1);}
 if(F.bars)for(const u of F.bars){const P=pt(u),a=prof(u);anB(I,m,P[0],0,P[2],W*a*1.06,Hh*a*1.15,s*0.05,F.barC,1);}
 if(F.mark){const P=pt(0.45);anB(I,m,P[0],Hh*0.08,P[2],W*1.05,Hh*0.4,s*0.4,F.mark,1);}
 /* fins: dorsal, anal, pectorals sculling, a forked tail */
 const fc=F.fin,tl=pt(0.86),ta=Math.atan2(X(0.86)-X(0.76),s*0.1);
 if(F.long){anS(I,m,pt(0.25),anAdd(pt(0.7),[0,Hh*0.95,-s*0.25]),0.006,s*0.25,fc,0.3,0.8,[0,0,1]);anS(I,m,pt(0.25),anAdd(pt(0.7),[0,-Hh*0.95,-s*0.25]),0.006,s*0.25,fc,0.3,0.8,[0,0,1]);
  for(const x of [-1,1])anS(I,m,pt(0.25),anAdd(pt(0.35),[x*0.01,-Hh*1.3,-s*0.1]),0.004,0.004,fc,0.3,0.5);}
 else{anS(I,m,anAdd(pt(0.3),[0,Hh*0.4,0]),anAdd(pt(0.6),[0,Hh*0.62,-s*0.04]),0.006,s*0.3,fc,0.3,0.6,[0,0,1]);anS(I,m,anAdd(pt(0.55),[0,-Hh*0.4,0]),anAdd(pt(0.72),[0,-Hh*0.58,-s*0.03]),0.006,s*0.14,fc,0.3,0.6,[0,0,1]);}
 for(const x of [-1,1]){const fl=Math.sin(T*9+ph+x)*0.5;anS(I,m,[x*W*0.4,-Hh*0.12,s*0.22],[x*(W*0.4+s*0.14*Math.cos(fl)),-Hh*0.2,s*0.22-s*0.14*Math.abs(Math.sin(fl))-s*0.04],s*0.08,0.005,fc,0.4,0.5);}
 {const tc=F.tailC||fc,tLen=F.tail*s;for(const v of [1,-1])anS(I,m,tl,[tl[0]+Math.sin(ta)*-tLen*0.9,v*Hh*0.55*(F.long?1.2:1),tl[2]-Math.cos(ta)*tLen],0.006,s*0.16,tc,0.3,0.55,[0,0,1]);}
 if(F.barbel)for(const x of [-1,1])anS(I,m,[x*W*0.2,-Hh*0.15,s*0.48],[x*W*0.45,-Hh*0.3,s*0.52],0.004,0.004,F.fin,0.3,0.3);
 for(const x of [-1,1]){anB(I,m,x*W*0.36,Hh*0.1,s*0.36,s*0.07,s*0.07,s*0.05,[0.03,0.03,0.03],1);anB(I,m,x*W*0.41,Hh*0.12,s*0.37,s*0.025,s*0.025,s*0.012,AN_EYEW,1,0,true);}}
/* a smooth loop around a tank, facing where it is going */
function anFishPath(T,x0,x1,zc,dz,y0,yA,i){const mid=(x0+x1)/2,hs=(x1-x0)/2,w=0.42+0.07*(i%3),ph=i*1.93;
 const x=mid+hs*Math.sin(T*w+ph),z=zc+dz*Math.sin(2*(T*w+ph)+i),y=y0+yA*Math.sin(T*0.5+i*1.3),vx=hs*w*Math.cos(T*w+ph),vz=2*dz*w*Math.cos(2*(T*w+ph)+i);
 return A.mul(A.mul(A.T(x,y,z),A.RY(Math.atan2(vx,vz))),A.RX(-Math.sin(T*0.5+i*1.3)*0.15));}
function drawFishTank(I,T,x0,x1,zc,dz,yb,yt,list,s){for(let i=0;i<list.length;i++){const m=anFishPath(T*(0.9+0.05*i),x0+s*0.6,x1-s*0.6,zc,dz,(yb+yt)/2+((i*0.37)%1-0.5)*(yt-yb)*0.6,(yt-yb)*0.12,i);anFish(I,m,T,list[i],s*(0.85+0.12*((i*7)%3)),i*2.1);}}

/* ---------------- the shark: a fusiform body on a travelling wave, countershaded, with real fins ---------------- */
function drawShark(IB,m,T,sc){const S=sc||1,sw=T*3.2,pr=IB.r,pt0=IB.tp,pu=IB.uv;IB.uv=null;
 const BC=[0.42,0.48,0.56],BL=[0.88,0.9,0.92],DK=[0.05,0.05,0.06],FIN=[0.36,0.42,0.5];const M0=A.mul(m,A.S(S,S,S));
 const X=u=>Math.sin(sw-u*4.2)*(0.012+0.15*u*u),P=(u,y)=>[X(u),y||0,0.64-u*1.5];
 const R=[[0,0.02],[0.06,0.075],[0.16,0.12],[0.3,0.14],[0.45,0.125],[0.6,0.09],[0.74,0.05],[0.84,0.03]];
 for(let i=0;i<R.length-1;i++){const [u0,r0]=R[i],[u1,r1]=R[i+1],big=r0>=r1,a=Math.max(r0,r1),tp=1-Math.min(r0,r1)/a;const e=0.035*(i?1:0),pa=P(big?u0-e:u1+e*0.5),pb=P(big?u1+e*0.5:u0-e);
  anS(IB,M0,pa,pb,a*1.9,a*2.05,BC,0.8,tp*0.85);anS(IB,M0,anAdd(pa,[0,-a*0.42,0]),anAdd(pb,[0,-a*0.42,0]),a*1.6,a*1.1,BL,0.8,tp*0.85);}
 /* snout underside, mouth line with a row of teeth, gills, eyes */
 {const mp=P(0.09,-0.07);anB(IB,M0,mp[0],mp[1],mp[2],0.13,0.012,0.07,DK,0.6);for(let k=-3;k<=3;k++){const a=k/3;anB(IB,M0,mp[0]+a*0.055,mp[1]-0.006,mp[2]+0.03-Math.abs(a)*0.03,0.008,0.016,0.006,AN_TEETH,0.4,0.8);}}
 for(const sd of [-1,1]){for(let i=0;i<5;i++){const g=P(0.2+i*0.022);anB(IB,M0,g[0]+sd*0.128,g[1]-0.005,g[2],0.006,0.11-i*0.008,0.008,DK,0.5);}
  const e=P(0.07,0.025);anB(IB,M0,e[0]+sd*0.068,e[1],e[2],0.024,0.026,0.03,DK,1);anB(IB,M0,e[0]+sd*0.078,e[1]+0.008,e[2]+0.008,0.008,0.008,0.008,AN_EYEW,1,0,true);
  /* pectoral fins: long, swept back, flexing a little */
  const r=P(0.3,-0.07),fl=Math.sin(sw*0.5)*0.03;anS(IB,M0,anAdd(r,[sd*0.1,0,0.03]),anAdd(r,[sd*0.4,-0.1+fl,-0.17]),0.16,0.018,FIN,0.5,0.75);
  /* pelvic fins */
  const pv=P(0.62,-0.06);anS(IB,M0,anAdd(pv,[sd*0.04,0,0]),anAdd(pv,[sd*0.12,-0.04,-0.07]),0.05,0.01,FIN,0.5,0.7);}
 /* first dorsal (the one you see from above), second dorsal, anal fin */
 {const d=P(0.36,0.12);anS(IB,M0,anAdd(d,[0,0,0.06]),anAdd(P(0.48,0.36),[0,0,0]),0.02,0.2,FIN,0.4,0.85,[0,0,1]);
  const d2=P(0.7,0.06);anS(IB,M0,d2,anAdd(P(0.75,0.12),[0,0,0]),0.012,0.06,FIN,0.4,0.7,[0,0,1]);const an=P(0.72,-0.05);anS(IB,M0,an,anAdd(P(0.77,-0.1),[0,0,0]),0.01,0.05,FIN,0.4,0.7,[0,0,1]);}
 /* caudal fin: tall upper lobe, shorter lower lobe, swinging with the tail */
 {const t=P(0.84),ta=Math.atan2(X(0.84)-X(0.78),0.09),dir=(up,len)=>[t[0]-Math.sin(ta)*len*0.6,t[1]+up,t[2]-Math.cos(ta)*len];
  anS(IB,M0,t,dir(0.28,0.24),0.016,0.14,FIN,0.4,0.85,[0,0,1]);anS(IB,M0,t,dir(-0.16,0.14),0.014,0.1,FIN,0.4,0.8,[0,0,1]);}
 IB.r=pr;IB.tp=pt0;IB.uv=pu;}
function sharkPath(T,x0,x1,zc,dz,y0,yA){const mid=(x0+x1)/2,hs=(x1-x0)/2,w=0.35,x=mid+hs*Math.sin(T*w),z=zc+dz*Math.sin(2*T*w),vx=hs*w*Math.cos(T*w),vz=2*dz*w*Math.cos(2*T*w),y=y0+yA*Math.sin(T*0.7);
 return A.mul(A.mul(A.T(x,y,z),A.RY(Math.atan2(vx,vz))),A.RZ(-vz*0.4));}
/* a shark tank: the shark, a school of reef fish and rising bubbles (McWey's office, the briefing, the Royal Flush, the penthouse) */
const AN_REEF=['ytang','tang','clown','angel','grouper'];
function drawTankLife(B,T,x0,x1,zc,dz,y0,yA,sc,yb,yt){const I=IBhi,pr=I.r,pt=I.tp,pu=I.uv;I.uv=null;drawShark(I,sharkPath(T,x0+0.5*sc,x1-0.5*sc,zc,dz,y0,yA),T,sc);
 for(let i=0;i<5;i++){const m=anFishPath(-T*1.1+i*1.7,x0+0.25,x1-0.25,zc,dz*0.6+0.02,yb+0.3+i*0.2*(yt-yb)/1.2,0.06,i);anFish(I,m,T,AN_REEF[i],0.16*sc,i*1.3);}
 I.r=pr;I.tp=pt;I.uv=pu;
 for(let i=0;i<14;i++){const ph=(T*0.45+i*0.37)%1,x=x0+0.15+((i*0.618)%1)*(x1-x0-0.3);B.box(TRS(x+Math.sin(T*3+i)*0.03,yb+ph*(yt-yb),zc+Math.sin(i*7)*dz*0.8,0,0.025+0.015*ph,0.025+0.015*ph,0.025+0.015*ph),[0.65,0.9,1].map(v=>v*0.8),true);}}

/* ---------------- the animals in the game ---------------- */
/* the guard dog (an enemy kind from the Marina on): a black-and-tan Doberman that trots on patrol, gallops when it hunts you,
   crouches before it lunges, bares its teeth and pins its ears while chasing, and lies on its side when it is down */
function drawDog(B,e){const T=G.T,I=B&&B.box&&(B===IBhi||B===IBlo)?B:anBatch(e.x,e.z),sp=AN_SPEC.dober,s=anTrack(e,T,0.8),pr=I.r,pt=I.tp,pu=I.uv;I.uv=null;
 const v=e.alive?s.v:0,gait=v>3.2?'gallop':v>1.1?'trot':'walk',chase=e.alive&&e.state==='chase',wind=e.alive&&e.wind>0,atk=e.alive&&e.atkT>0;
 const M=e.alive?A.mul(A.T(e.x,0,e.z),A.RY(e.a)):A.mul(A.mul(A.T(e.x,0.13,e.z),A.RY(e.a)),A.mul(A.RZ(1.5),A.T(0,-0.05,0)));
 anQuad(I,M,sp,{T,ph:s.ph,v:e.alive?Math.min(1,v/1.2):0,gait,rest:e.alive&&!chase?s.rest*0.0:0,look:e.alive&&!chase?s.look*0.6:0,mouth:atk?1:wind?0.55:chase?0.25+0.15*Math.sin(T*9):(v>1?0.35:0.15),
  pant:e.alive&&!chase&&!wind,snarl:chase||wind?1:0,earsBack:chase||wind?1:0,crouch:wind?1:atk?-0.4:0,wag:e.alive&&!chase?0.25:0,tuck:0,headDown:wind?0.25:0,dead:!e.alive,seed:e.id||0});
 I.r=pr;I.tp=pt;I.uv=pu;}
/* pets at home, and Pesos on the job where you have to find him: he wanders, sits when he stops (the tiger and the cat lie down),
   looks around, wags and pants */
const AN_PETK={dog:'mutt',cat:'cat',tigerpet:'tiger'};
function drawPet(B,q,T){if(q.k==='doberman'&&typeof hiDoberman==='function')return hiDoberman(q,T,G&&G.player);const x=q.x,z=q.z,I=anBatch(x,z),pr=I.r,pt=I.tp,pu=I.uv;I.uv=null;
 const sp=AN_SPEC[AN_PETK[q.k]],s=anTrack(q,T,sp?sp.stride:0.12),M=A.mul(A.T(x,0,z),A.RY(q.a||0));
 if(q.k==='iguana')anLizard(I,M,{T,ph:s.ph,v:s.v/0.3,look:s.look});
 else if(sp){const v=s.v/(q.k==='tigerpet'?0.9:0.8);anQuad(I,M,sp,{T,ph:s.ph,v,gait:v>1.6?'trot':'walk',rest:s.rest,restKind:q.k==='dog'?'sit':'lie',look:s.look,tilt:q.k==='dog'?Math.sin(T*0.4)*0.12*s.rest:0,
  mouth:q.k==='dog'?0.35:q.k==='tigerpet'?(anFr(T*0.08)<0.06?0.9:0.05):0.02,pant:q.k==='dog',wag:q.k==='dog'?(q.found===false?0.3:0.9):0,seed:(x*7+z*3)%1});}
 I.r=pr;I.tp=pt;I.uv=pu;}
/* Nugget, Schmaltzy's Boston terrier, sits on the jewelry counter in his gold collar: breathes, looks around, tilts his head, pants now and then */
function drawNugget(x,y,z,T){const I=IBhi,pr=I.r,pt=I.tp,pu=I.uv;I.uv=null;const sp=AN_SPEC.boston;
 const lk=Math.sin(T*0.35)*0.6+Math.sin(T*1.1)*0.1,pant=anFr(T*0.05)>0.55,M=A.mul(A.T(x,y,z),A.RY(0.15));
 anQuad(I,M,sp,{T,ph:0,v:0,rest:1,restKind:'sit',look:lk,tilt:anFr(T*0.07)<0.18?0.35:0,mouth:pant?0.4:0.05,pant,wag:0.4,seed:0.4});
 I.r=pr;I.tp=pt;I.uv=pu;}
/* the koi and reef tanks you can buy for the motel and the studio */
const AN_KOI=['koi','goldkoi','koi'],AN_HOME_REEF=['clown','tang','ytang','angel','clown'];
function drawHomeFish(t,T,x0,x1,zc,yb,yt){const I=IBhi,pr=I.r,pt=I.tp,pu=I.uv;I.uv=null;drawFishTank(I,T,x0,x1,zc,0.1,yb,yt,t===0?AN_KOI:AN_HOME_REEF,t===0?0.16:0.12);I.r=pr;I.tp=pt;I.uv=pu;}
