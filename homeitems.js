'use strict';
/* HOME ITEMS: the furniture, upgrades and terrace pieces you buy for Room 14, the studio, the penthouse and Villa Solana.
   Every piece is built from rounded, tapered boxes on the instanced batch (IBhi), the same parts the animals use, so both
   renderers draw them soft-edged; the PS1 look falls back to plain boxes. Flat bits (screens, felt, slats, glowing neon) go on
   the ordinary batch. Round things that are thin (records, cones, discs, pockets) are 12-sided: six boxes through the centre,
   turned 30 degrees apart. Pieces sit at the same spots and keep the same footprints as the old blocky ones, so seats, solids and doors line up.
   Static mansion pieces build once into the hub's fixed batch: there the kit softens corners through the batch's own rounding. */

const HI_WH=[0.96,0.95,0.93],HI_BK=[0.06,0.06,0.07],HI_CH=[0.8,0.81,0.85],HI_DK=[0.12,0.12,0.13],HI_BRASS=[0.85,0.66,0.28];
const HI_WOOD=[0.42,0.26,0.15],HI_DWOOD=[0.24,0.12,0.07],HI_TEAK=[0.55,0.36,0.2],HI_PINK=[1,0.3,0.72],HI_CYAN=[0.25,0.9,1];
/* a segment matrix: local y runs from p to q, width w on the side axis, depth d leaning toward hint (default up) */
function hiSegM(p,q,w,d,hint){let dx=q[0]-p[0],dy=q[1]-p[1],dz=q[2]-p[2];const L=Math.hypot(dx,dy,dz)||1e-4;dx/=L;dy/=L;dz/=L;
 let h=hint||[0,1,0],k=h[0]*dx+h[1]*dy+h[2]*dz,zx=h[0]-k*dx,zy=h[1]-k*dy,zz=h[2]-k*dz,zl=Math.hypot(zx,zy,zz);
 if(zl<0.25){h=Math.abs(dz)>0.9?[0,1,0]:[0,0,1];k=h[0]*dx+h[1]*dy+h[2]*dz;zx=h[0]-k*dx;zy=h[1]-k*dy;zz=h[2]-k*dz;zl=Math.hypot(zx,zy,zz)||1;}
 zx/=zl;zy/=zl;zz/=zl;const xx=dy*zz-dz*zy,xy=dz*zx-dx*zz,xz=dx*zy-dy*zx;
 return [xx*w,dx*L,zx*d,(p[0]+q[0])/2,xy*w,dy*L,zy*d,(p[1]+q[1])/2,xz*w,dz*L,zz*d,(p[2]+q[2])/2];}
/* the kit: everything is placed in a local frame at (x,z) turned ry. B = flat batch, I = rounded instances (IBhi) or, for the
   fixed batch, a stand-in that rounds through Batch.round */
function hiShim(B){return {r:0,tp:0,uv:null,box(m,c,em,uv){const r0=B.round;B.round=this.r>0.05?Math.max(r0||0,1+this.r*2):r0;B.box(m,c,em,uv);B.round=r0;}};}
function hiKit(B,x,z,ry,I,y){I=I||anBatch(x,z);const m0=A.mul(A.T(x,y||0,z),A.RY(ry||0)),M=m=>A.mul(m0,m);
 const K={B,I,m0,
  /* plain box */
  bx(px,py,pz,sx,sy,sz,c,em,a,uv){B.box(M(TRS(px,py,pz,a||0,sx,sy,sz)),c,!!em,uv);},
  /* rounded box: r rounding (1 = round as it can be), tp taper toward the top */
  rb(px,py,pz,sx,sy,sz,c,r,tp,a){I.r=r===undefined?0.5:r;I.tp=tp||0;I.box(M(TRS(px,py,pz,a||0,sx,sy,sz)),c);},
  /* rounded box with yaw, pitch, roll */
  rr(px,py,pz,ay,ax,az,sx,sy,sz,c,r,tp){I.r=r===undefined?0.5:r;I.tp=tp||0;I.box(M(A.mul(A.mul(A.mul(A.T(px,py,pz),A.RY(ay||0)),A.RX(ax||0)),A.mul(A.RZ(az||0),A.S(sx,sy,sz)))),c);},
  /* flat box with yaw, pitch, roll (emissive allowed) */
  fr(px,py,pz,ay,ax,az,sx,sy,sz,c,em){B.box(M(A.mul(A.mul(A.mul(A.T(px,py,pz),A.RY(ay||0)),A.RX(ax||0)),A.mul(A.RZ(az||0),A.S(sx,sy,sz)))),c,!!em);},
  /* a rounded segment from p to q */
  sg(p,q,w,d,c,r,tp,hint){I.r=r===undefined?1:r;I.tp=tp||0;I.box(M(hiSegM(p,q,w,d,hint)),c);},
  /* a flat (optionally glowing) segment, for neon tubes and thin rods */
  sf(p,q,w,d,c,em,hint){B.box(M(hiSegM(p,q,w,d,hint)),c,!!em);},
  /* a polyline of rounded segments */
  pl(pts,w,d,c,em,hint){for(let i=0;i<pts.length-1;i++){if(em)K.sf(pts[i],pts[i+1],w,d,c,true,hint);else K.sg(pts[i],pts[i+1],w,d,c,1,0,hint);}},
  /* a 12-sided disc / short cylinder (8-sided when small), built from boxes through the centre: axis 'y' (lying flat), 'z' (facing the camera) or 'x' */
  cy(px,py,pz,dia,th,c,ax,em,rnd){const r=rnd===undefined?0.3:rnd,n=dia>0.25?12:8,w=dia*Math.tan(Math.PI/n);for(let k=0;k<n/2;k++){const a=k*AN_TAU/n;
    const m=ax==='z'?A.mul(A.mul(A.T(px,py,pz),A.RZ(a)),A.S(dia,w,th)):ax==='x'?A.mul(A.mul(A.T(px,py,pz),A.RX(a)),A.S(th,dia,w)):A.mul(A.mul(A.T(px,py,pz),A.RY(a)),A.S(dia,th,w));
    if(em)B.box(M(m),c,true);else{I.r=r;I.tp=0;I.box(M(m),c);}}},
  /* an oval disc dx by dz lying flat (a circle squashed along z) */
  ov(px,py,pz,dx,dz,th,c,em){const n=12,w=dx*Math.tan(Math.PI/n);for(let k=0;k<n/2;k++){const m=A.mul(A.mul(A.T(px,py,pz),A.S(1,1,dz/dx)),A.mul(A.RY(k*AN_TAU/n),A.S(dx,th,w)));if(em)B.box(M(m),c,true);else{I.r=0;I.tp=0;I.box(M(m),c);}}},
  /* a ring of n little boxes (radius rad) in the xz plane, or the xy plane with ax 'z' */
  ring(px,py,pz,rad,th,w,c,n,ax,em,ph){const L=2*rad*Math.tan(Math.PI/n)*1.06;for(let k=0;k<n;k++){const a=(ph||0)+k*AN_TAU/n;
    const m=ax==='z'?A.mul(A.mul(A.T(px+Math.cos(a)*rad,py+Math.sin(a)*rad,pz),A.RZ(a)),A.S(th,L,w)):A.mul(A.mul(A.T(px+Math.cos(a)*rad,py,pz+Math.sin(a)*rad),A.RY(-a)),A.S(th,w,L));
    if(em)B.box(M(m),c,true);else{I.r=0.6;I.tp=0;I.box(M(m),c);}}},
  /* four legs under a w x d top at height h */
  legs(w,d,h,t,c,r){for(const sx of [-1,1])for(const sz of [-1,1])K.rb(sx*(w/2-t/2),h/2,sz*(d/2-t/2),t,h,t,c,r===undefined?0.6:r);},
  /* a ball */
  ball(px,py,pz,d,c){I.r=1;I.tp=0;I.box(M(TRS(px,py,pz,0,d,d,d)),c);}};
 return K;}
/* run fn with IBhi's state saved and restored around it */
function hiWith(fn){const I=IBhi,pr=I.r,pt=I.tp,pu=I.uv;I.uv=null;try{fn();}finally{I.r=pr;I.tp=pt;I.uv=pu;}}
/* skip a piece that is off screen (the camera only ever shows part of a home) */
const hiVis=(x,z,r)=>typeof inView!=='function'||!G||!G.cam||inView(x,0.8,z,r);
const hiRnd=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s);};

/* ================= pieces every home has a version of ================= */
/* the fish tank: a cabinet, a framed glass box (the glass itself is drawn in the pane pass), gravel, plants, rocks or coral */
function hiTank(B,q,t,T){if(!hiVis(q.x,q.z,1.8))return;const w=[1.0,1.4,2.6][t],h=[0.6,0.9,1.6][t],y0=[0.45,0.45,0.2][t],K=hiKit(B,q.x,q.z,0);
 const cab=[[0.4,0.26,0.15],[0.97,0.97,0.97],[0.07,0.07,0.08]][t],trim=[[0.1,0.1,0.11],HI_CH,GOLD][t];
 K.rb(0,y0/2,0,w,y0,0.55,cab,0.15);
 if(t<2){for(const sx of [-1,1]){K.bx(sx*w/4,y0/2,0.278,w/2-0.07,y0-0.1,0.012,cab.map(v=>v*0.85));K.ball(sx*0.05,y0/2+0.02,0.29,0.035,t===0?HI_BRASS:HI_CH);}}
 else{K.bx(0,y0-0.03,0.279,w,0.03,0.01,GOLD);K.bx(0,0.03,0.279,w,0.03,0.01,GOLD);}
 /* frame: bottom trim, corner posts, the hood with its light */
 K.rb(0,y0+0.02,0,w+0.03,0.04,0.58,trim,0.4);for(const sx of [-1,1])for(const sz of [-1,1])K.bx(sx*(w/2-0.005),y0+h/2,sz*0.27,0.022,h,0.022,trim);
 K.rb(0,y0+h+0.04,0,w+0.05,0.08,0.6,t===1?HI_WH:trim,0.5);K.bx(0,y0+h-0.004,0.21,w-0.12,0.012,0.05,[0.75,0.92,1],true);
 /* gravel and pebbles */
 K.bx(0,y0+0.07,0,w-0.05,0.06,0.5,[[0.75,0.68,0.52],[0.92,0.9,0.85],[0.32,0.3,0.3]][t]);
 const n=Math.round(w*10);for(let i=0;i<n;i++){const px=(hiRnd(i+t*30)-0.5)*(w-0.12),pz=(hiRnd(i*3+7)-0.5)*0.4;K.rb(px,y0+0.105,pz,0.05,0.025,0.04,[[0.5,0.45,0.4],[0.95,0.6,0.7],[0.2,0.2,0.22],[0.8,0.75,0.6]][(i+t)%4],1);}
 if(t===0){/* koi: water grass, a stone lantern, driftwood */
  for(let i=0;i<6;i++){const bx=-w/2+0.12+i*(w-0.24)/5,bz=-0.12+(i%2)*0.08,sw=Math.sin(T*1.6+i)*0.04;K.pl([[bx,y0+0.1,bz],[bx+sw*0.5,y0+0.28,bz],[bx+sw,y0+0.42+(i%3)*0.04,bz]],0.025,0.012,[0.2,0.55,0.22]);}
  K.rb(0.28,y0+0.14,-0.08,0.08,0.06,0.08,[0.55,0.55,0.52],0.3);K.rb(0.28,y0+0.2,-0.08,0.05,0.07,0.05,[0.6,0.6,0.57],0.3);K.rb(0.28,y0+0.26,-0.08,0.11,0.03,0.11,[0.55,0.55,0.52],0.3,0.5);
  K.rr(-0.2,y0+0.13,0.05,0.4,0,0.25,0.34,0.05,0.06,[0.45,0.32,0.2],1);}
 else if(t===1){/* reef: branching coral, an anemone, a little castle */
  const cor=[[1,0.45,0.55],[1,0.6,0.25],[0.75,0.35,0.9]];for(let c=0;c<3;c++){const cx=-0.45+c*0.42,b=[cx,y0+0.1,-0.1];
   for(let j=0;j<4;j++){const a=j*1.7+c,tip=[cx+Math.cos(a)*0.09,y0+0.24+(j%2)*0.08,-0.1+Math.sin(a)*0.06];K.sg(b,tip,0.04,0.04,cor[c]);K.ball(tip[0],tip[1],tip[2],0.045,cor[c]);}}
  K.rb(0.5,y0+0.13,0.05,0.12,0.06,0.12,[0.9,0.4,0.6],1);for(let j=0;j<8;j++){const a=j*AN_TAU/8,sw=Math.sin(T*2+j)*0.02;K.sg([0.5+Math.cos(a)*0.04,y0+0.15,0.05+Math.sin(a)*0.04],[0.5+Math.cos(a)*0.08+sw,y0+0.25,0.05+Math.sin(a)*0.07],0.018,0.018,[1,0.6,0.75]);}
  K.rb(-0.42,y0+0.17,0.08,0.2,0.14,0.14,[0.85,0.75,0.6],0.2);for(const sx of [-1,1])K.rb(-0.42+sx*0.08,y0+0.27,0.08,0.06,0.12,0.06,[0.88,0.78,0.62],0.3);K.bx(-0.42,y0+0.15,0.152,0.05,0.07,0.01,[0.1,0.08,0.06]);}
 else{/* the shark tank: dark rock and tall kelp */
  for(let i=0;i<5;i++){const px=-1.1+i*0.55,s=0.18+hiRnd(i+2)*0.14;K.rb(px,y0+0.1+s/2,-0.12+(i%2)*0.06,s*1.4,s,s,[0.18,0.17,0.2],1);}
  for(let i=0;i<7;i++){const px=-1.15+i*0.38,bz=-0.16,pts=[];for(let j=0;j<=4;j++){const yy=y0+0.12+j*(h-0.3)/4;pts.push([px+Math.sin(T*1.1+i+j*0.8)*0.03*j,yy,bz]);}K.pl(pts,0.05,0.012,[0.15,0.42,0.18]);}}}
/* the dining set */
function hiDine(B,q,t,T){if(!hiVis(q.x,q.z,2.2))return;const K=hiKit(B,q.x,q.z,0);
 if(t===0){/* card table, folding chairs, cold chow mein */
  K.rb(0,0.345,0,0.92,0.03,0.72,HI_BK,0.4);K.bx(0,0.362,0,0.88,0.01,0.68,[0.2,0.34,0.24]);
  for(const sx of [-1,1])for(const sz of [-1,1]){K.sg([sx*0.42,0.34,sz*0.32],[sx*0.4,0,sz*0.3],0.022,0.022,[0.35,0.35,0.38]);K.rb(sx*0.4,0.01,sz*0.3,0.04,0.02,0.04,HI_BK,1);}
  for(const sd of [-1,1]){const z=sd*0.6,c=[0.58,0.56,0.5],m=[0.3,0.3,0.33];K.rb(0,0.22,z,0.36,0.03,0.34,c,0.5);K.rb(0,0.38,z+sd*0.17,0.34,0.16,0.03,c,0.5);
   for(const sx of [-1,1]){K.sg([sx*0.16,0.4,z+sd*0.18],[sx*0.16,0,z+sd*0.16],0.02,0.02,m);K.sg([sx*0.15,0.22,z-sd*0.14],[sx*0.16,0,z-sd*0.18],0.02,0.02,m);}}
  /* takeout boxes, chopsticks, a can, a paper plate */
  K.rb(-0.15,0.42,0,0.12,0.1,0.1,HI_WH,0.15,-0.25);K.bx(-0.15,0.42,0.051,0.05,0.05,0.004,[0.85,0.12,0.1]);K.sg([-0.18,0.47,0],[-0.12,0.56,-0.02],0.008,0.008,[0.75,0.6,0.35]);K.sg([-0.16,0.47,0.01],[-0.08,0.55,0.0],0.008,0.008,[0.75,0.6,0.35]);
  K.cy(0.2,0.37,0.1,0.2,0.01,HI_WH,'y');K.rb(0.22,0.38,0.1,0.1,0.02,0.07,[0.85,0.65,0.25],1);K.rb(0.05,0.43,-0.2,0.06,0.11,0.06,[0.85,0.1,0.12],0.9);K.cy(0.05,0.487,-0.2,0.05,0.005,HI_CH,'y');
  K.rb(0.32,0.38,-0.18,0.11,0.02,0.11,[0.5,0.5,0.55],1);K.sg([0.32,0.395,-0.18],[0.4,0.4,-0.14],0.014,0.014,[0.95,0.92,0.85]);}
 else if(t===1){/* glass table on chrome pedestals, white tulip chairs, a bowl of fake fruit */
  K.rb(0,0.4,0,1.5,0.03,0.85,[0.7,0.88,0.96],0.4);K.bx(0,0.385,0,1.52,0.008,0.87,HI_CH);
  for(const lx of [-0.5,0.5]){K.cy(lx,0.2,0,0.08,0.38,HI_CH,'y');K.cy(lx,0.012,0,0.36,0.024,HI_CH,'y');K.cy(lx,0.375,0,0.18,0.02,HI_CH,'y');}
  for(const lx of [-0.45,0.45])for(const sd of [-1,1]){const z=sd*0.65;K.cy(lx,0.012,z,0.28,0.024,HI_WH,'y');K.rb(lx,0.13,z,0.06,0.24,0.06,HI_WH,1,0.3);
   K.rb(lx,0.27,z,0.36,0.08,0.34,HI_WH,0.9);K.rr(lx,0.44,z+sd*0.15,0,sd*0.25,0,0.34,0.28,0.06,HI_WH,0.9);K.rb(lx,0.315,z,0.3,0.02,0.28,[1,0.55,0.72],0.9);}
  K.rb(0,0.45,0,0.3,0.09,0.3,[0.92,0.95,1],1,-0.2);K.ball(-0.05,0.5,0.02,0.08,[1,0.55,0.12]);K.ball(0.06,0.5,-0.04,0.075,[0.85,0.1,0.15]);
  for(let i=0;i<5;i++)K.ball(0.05+(i%2)*0.03,0.5+Math.floor(i/2)*0.025,0.06,0.035,[0.5,0.2,0.6]);K.rr(-0.04,0.53,-0.06,0.6,0,0.5,0.03,0.16,0.04,[1,0.88,0.3],1);}
 else{/* marble banquet table, eight velvet chairs, candelabra, roses */
  K.bx(0,0.42,0,3.0,0.08,0.95,[1,1,1],false,0,TUV[63]);K.rb(0,0.375,0,3.04,0.02,0.99,GOLD,0.4);
  for(const lx of [-1.2,1.2]){K.rb(lx,0.03,0,0.5,0.06,0.5,GOLD,0.4);K.rb(lx,0.2,0,0.22,0.3,0.22,[0.9,0.88,0.84],0.8,0.25);K.rb(lx,0.35,0,0.34,0.06,0.5,[0.9,0.88,0.84],0.4);}
  for(let i=0;i<4;i++)for(const sd of [-1,1]){const px=-1.1+i*0.73,pz=sd*0.3;K.cy(px,0.47,pz,0.24,0.015,[0.98,0.98,0.96],'y');K.cy(px,0.478,pz,0.16,0.015,GOLD,'y');
   K.cy(px+0.16,0.465,pz,0.04,0.006,[0.9,0.95,1],'y');K.rb(px+0.16,0.5,pz,0.012,0.06,0.012,[0.9,0.95,1],1);K.rb(px+0.16,0.55,pz,0.05,0.05,0.05,[0.85,0.92,1],1,-0.3);K.rb(px+0.16,0.54,pz,0.04,0.025,0.04,[0.55,0.03,0.1],1);}
  /* the chairs: velvet seats, tall tufted backs with a gold crest, gold legs */
  for(let i=0;i<4;i++)for(const sd of [-1,1]){const px=-1.1+i*0.73,pz=sd*0.7;K.rb(px,0.33,pz,0.42,0.1,0.4,VR_HI,0.7);K.rb(px,0.62,pz+sd*0.18,0.4,0.56,0.08,VR_HI,0.6);K.rb(px,0.92,pz+sd*0.18,0.44,0.05,0.09,GOLD,1);
   for(let b=0;b<3;b++)K.ball(px-0.12+b*0.12,0.66,pz+sd*0.135,0.025,GOLD);for(const lx of [-0.17,0.17])for(const lz of [-0.15,0.15])K.sg([px+lx,0.29,pz+lz],[px+lx*1.15,0,pz+lz*1.15],0.03,0.03,GOLD);}
  /* candelabra and roses */
  for(const lx of [-0.7,0.7]){K.cy(lx,0.47,0,0.14,0.02,GOLD,'y');K.rb(lx,0.58,0,0.035,0.22,0.035,GOLD,1);K.sg([lx-0.14,0.7,0],[lx+0.14,0.7,0],0.02,0.02,GOLD);
   for(const ox of [-0.14,0,0.14]){const yy=ox?0.72:0.76;K.rb(lx+ox,yy+0.06,0,0.03,0.11,0.03,[1,0.96,0.88],0.9);K.bx(lx+ox,yy+0.15+Math.sin(T*9+ox*20)*0.008,0,0.022,0.05,0.022,[1.3,0.85,0.35],true);}}
  K.rb(0,0.5,0,0.14,0.12,0.14,[0.9,0.95,1],1,-0.3);for(let i=0;i<7;i++){const a=i*AN_TAU/7;K.ball(Math.cos(a)*0.07,0.6+(i%2)*0.03,Math.sin(a)*0.06,0.07,[[0.85,0.05,0.12],[1,0.85,0.9],[0.95,0.2,0.35]][i%3]);}K.ball(0,0.64,0,0.07,[0.9,0.1,0.2]);}}
const VR_HI=[0.5,0.04,0.11];
/* the rug */
function hiRug(B,r,t,T){if(!hiVis(r.x+0.3,r.z,1.6))return;const K=hiKit(B,r.x,r.z,0);
 if(t===0){K.rb(0,0.012,0,2.2,0.02,1.5,[0.9,0.45,0.12],0.3);for(let i=0;i<40;i++){const x=(hiRnd(i)-0.5)*2.05,z=(hiRnd(i+50)-0.5)*1.35;K.rb(x,0.03,z,0.09,0.035,0.09,[[0.95,0.5,0.15],[0.8,0.35,0.08],[1,0.6,0.25]][i%3],1);}
  for(const sx of [-1,1])for(let i=0;i<12;i++)K.bx(sx*1.13,0.008,-0.66+i*0.12,0.08,0.01,0.025,[0.95,0.75,0.4]);K.rb(0.4,0.024,0.25,0.36,0.006,0.24,[0.45,0.25,0.08],1);}
 else if(t===1){/* a pink flamingo, flat on the floor */
  const P=[1,0.42,0.7],L=[1,0.6,0.82],y=0.014;K.rb(-0.2,0.012,0.1,1.1,0.02,0.64,P,1);K.rr(-0.32,0.02,0.05,0.25,0,0,0.6,0.012,0.34,L,1);
  K.pl([[0.25,y,-0.02],[0.48,y,-0.2],[0.52,y,-0.42],[0.42,y,-0.56],[0.6,y,-0.66]],0.12,0.02,P);K.rb(0.66,0.016,-0.67,0.2,0.022,0.16,P,1);
  K.sg([0.75,0.02,-0.67],[0.88,0.02,-0.6],0.07,0.02,[0.97,0.95,0.9]);K.sg([0.88,0.02,-0.6],[0.93,0.02,-0.54],0.05,0.02,HI_BK);K.ball(0.68,0.03,-0.7,0.035,HI_BK);
  for(const lz of [0.2,0.32]){K.sg([-0.65,0.015,lz],[-1.0,0.015,lz+0.06],0.035,0.01,[1,0.5,0.6]);K.sg([-1.0,0.015,lz+0.06],[-1.2,0.015,lz-0.05],0.035,0.01,[1,0.5,0.6]);}}
 else{/* the polar bear: pelt, splayed legs with claws, a real head with an open mouth */
  const W=[0.97,0.96,0.92],Wd=[0.9,0.88,0.84];K.rb(0,0.02,0,1.4,0.035,0.85,W,0.8);
  for(const [lx,lz,ex,ez] of [[0.45,-0.35,0.75,-0.75],[-0.5,-0.35,-0.8,-0.75],[0.45,0.35,0.75,0.75],[-0.5,0.35,-0.8,0.75]]){K.sg([lx,0.02,lz],[ex,0.02,ez],0.24,0.03,W,0.8);K.rb(ex,0.025,ez,0.2,0.04,0.2,Wd,1);for(let c=-1;c<=1;c++){const a=Math.atan2(ez-lz,ex-lx);K.sg([ex+Math.cos(a)*0.08+Math.cos(a+1.57)*c*0.05,0.025,ez+Math.sin(a)*0.08+Math.sin(a+1.57)*c*0.05],[ex+Math.cos(a)*0.14+Math.cos(a+1.57)*c*0.06,0.02,ez+Math.sin(a)*0.14+Math.sin(a+1.57)*c*0.06],0.018,0.018,HI_DK);}}
  K.rb(-0.75,0.02,0,0.14,0.04,0.12,W,1);
  K.rb(0.86,0.13,0,0.34,0.24,0.34,W,1);K.rb(1.06,0.1,0,0.22,0.15,0.18,W,1);K.rb(1.17,0.12,0,0.05,0.04,0.07,HI_BK,1);K.rb(1.08,0.04,0,0.18,0.04,0.14,Wd,1);K.rb(1.06,0.075,0,0.15,0.02,0.11,[0.6,0.1,0.15],1);
  for(const sz of [-1,1]){K.rb(1.13,0.07,sz*0.04,0.015,0.03,0.015,[0.98,0.97,0.9],1);K.ball(0.98,0.2,sz*0.08,0.035,HI_BK);K.rb(0.8,0.27,sz*0.12,0.07,0.07,0.05,W,1);}}}
/* the shelf */
function hiShelf(B,q,t,T){if(!hiVis(q.x,q.z,1.6))return;const K=hiKit(B,q.x,q.z,0),BC=[[0.8,0.2,0.2],[0.2,0.4,0.8],[0.9,0.8,0.3],[0.2,0.6,0.3],[0.6,0.2,0.6],[0.95,0.95,0.92],[0.1,0.1,0.12],[0.95,0.5,0.15]];
 const books=(x0,x1,y,depth,cols,seed,band)=>{let x=x0,i=0;while(x<x1-0.03){const w=0.03+hiRnd(seed+i)*0.03,h=0.14+hiRnd(seed+i+40)*0.1,c=cols[(i*3+seed)%cols.length];if(x+w>x1)break;
   if(hiRnd(seed+i+90)<0.08&&x+0.1<x1){K.rr(x+0.05,y+0.05,0.02,0,0,1.05,w,h,depth,c,0.2);x+=0.12;i++;continue;}K.rb(x+w/2,y+h/2,0.02,w,h,depth,c,0.2);if(band){K.bx(x+w/2,y+h-0.025,0.02+depth/2+0.002,w*0.9,0.012,0.004,GOLD);K.bx(x+w/2,y+0.03,0.02+depth/2+0.002,w*0.9,0.012,0.004,GOLD);}x+=w+0.004;i++;}};
 if(t===0){/* bricks and planks, paperbacks, a stack of tapes */
  const BR=[0.62,0.25,0.17];for(let lv=0;lv<3;lv++){const y=lv*0.3;for(const sx of [-0.31,0.31])for(let b=0;b<2;b++)K.rb(sx+(hiRnd(lv*4+b+(sx>0?2:0))-0.5)*0.02,y+0.07+b*0.13,0,0.16,0.12,0.3,BR.map(v=>v*(0.9+hiRnd(lv+b)*0.2)),0.15);
   K.rb(0,y+0.28,0,0.8,0.04,0.36,[0.62,0.45,0.28],0.3);}
  books(-0.22,0.24,0.3,0.2,BC,3,false);books(-0.22,0.1,0.6,0.2,BC,9,false);for(let i=0;i<4;i++){K.rb(0.17,0.62+i*0.042,0.02,0.11,0.04,0.2,HI_BK,0.2);K.bx(0.17,0.62+i*0.042,0.122,0.08,0.02,0.004,HI_WH);}
  for(let i=0;i<3;i++){K.rb(0,0.03+i*0.042,0.04,0.2,0.04,0.11,HI_BK,0.2);K.bx(0,0.03+i*0.042,0.098,0.14,0.02,0.004,[0.95,0.9,0.75]);}}
 else if(t===1){/* white bookcase: books by colour, a vase, a plant, a photo */
  const W=HI_WH;K.rb(0,0.8,-0.18,0.8,1.6,0.04,W,0.2);for(const sx of [-1,1])K.rb(sx*0.385,0.8,0,0.03,1.6,0.4,W,0.3);K.rb(0,1.59,0,0.82,0.04,0.42,W,0.4);K.rb(0,0.04,0,0.8,0.08,0.4,W,0.3);
  const rain=[[[1,0.3,0.4],[1,0.5,0.6]],[[1,0.6,0.2],[1,0.8,0.3]],[[0.3,0.8,0.5],[0.2,0.6,0.8]],[[0.4,0.4,0.9],[0.7,0.4,0.9]]];
  for(let s=0;s<4;s++){const y=0.08+s*0.38;K.rb(0,y+0.36,0,0.75,0.025,0.38,W,0.3);if(s===1){books(-0.35,0.05,y,0.24,rain[s],s*13,false);K.rb(0.22,y+0.12,0.02,0.12,0.24,0.12,[0.3,0.85,0.85],1,0.35);}
   else if(s===3){books(-0.35,0.0,y,0.24,rain[s],s*13,false);K.rb(0.2,y+0.06,0.02,0.14,0.12,0.14,[0.95,0.55,0.7],0.4,0.2);for(let l=0;l<5;l++){const a=l*1.3;K.sg([0.2,y+0.12,0.02],[0.2+Math.cos(a)*0.1,y+0.28,0.02+Math.sin(a)*0.06],0.04,0.01,[0.2,0.6,0.25]);}}
   else if(s===2){books(-0.35,0.15,y,0.24,rain[s],s*13,false);K.rr(0.25,y+0.1,0.06,0,-0.25,0,0.14,0.18,0.015,GOLD,0.2);K.bx(0.25,y+0.105,0.07,0.1,0.13,0.01,[0.4,0.7,0.9],false);}
   else books(-0.35,0.35,y,0.24,rain[s],s*13,false);}}
 else{/* the library wall: dark wood, gold crown, leather books, a ladder on a brass rail */
  const D=[0.3,0.13,0.06],L=[[0.45,0.06,0.06],[0.12,0.25,0.15],[0.35,0.2,0.1],[0.1,0.12,0.25],[0.5,0.3,0.12]];K.rb(0,1.15,-0.18,0.8,2.3,0.04,D,0.2);
  for(const sx of [-1,1]){K.rb(sx*0.38,1.15,0.01,0.06,2.3,0.42,D,0.3);K.bx(sx*0.38,1.15,0.225,0.03,2.2,0.01,GOLD);}K.rb(0,2.32,0.02,0.9,0.08,0.48,D,0.4);K.rb(0,2.38,0.03,0.94,0.04,0.5,GOLD,0.5);K.rb(0,0.05,0.01,0.82,0.1,0.44,D,0.3);
  for(let s=0;s<6;s++){const y=0.1+s*0.36;K.rb(0,y+0.35,0,0.72,0.025,0.4,D,0.3);books(-0.34,0.34,y,0.26,L,s*7,true);}
  K.rb(0,2.05,0.3,0.86,0.025,0.025,GOLD,1);for(const sx of [0.22,0.4]){K.sg([sx,2.05,0.3],[sx+0.08,0.02,0.58],0.035,0.03,[0.4,0.2,0.08]);}for(let r=1;r<7;r++){const k=r/7;K.sg([0.22+0.08*k,2.05-2.03*k,0.3+0.28*k],[0.4+0.08*k,2.05-2.03*k,0.3+0.28*k],0.025,0.025,[0.45,0.24,0.1]);}}}
/* the desk */
function hiDesk(B,q,t,T){if(!hiVis(q.x,q.z+0.3,1.6))return;const K=hiKit(B,q.x,q.z,0);
 if(t===0){/* steel desk, a typewriter with paper in it, a gooseneck lamp, a folding chair */
  const S=[0.55,0.55,0.6],SD=[0.4,0.4,0.45];K.rb(0,0.38,0,1.0,0.04,0.6,S,0.4);for(const sx of [-1,1])K.rb(sx*0.45,0.19,0,0.04,0.36,0.52,SD,0.3);K.bx(0,0.2,-0.25,0.86,0.25,0.02,SD);
  const G=[0.2,0.32,0.27];K.rb(0,0.44,0.02,0.36,0.08,0.24,G,0.45);K.rr(0,0.47,0.1,0,0.35,0,0.34,0.03,0.1,G,0.5);
  for(let r=0;r<3;r++)for(let c=0;c<8;c++){K.rb(-0.13+c*0.037+(r%2)*0.018,0.475+r*0.017,0.13-r*0.03,0.024,0.012,0.022,HI_BK,1);K.bx(-0.13+c*0.037+(r%2)*0.018,0.482+r*0.017,0.13-r*0.03,0.016,0.003,0.014,HI_WH);}
  K.rr(0,0.52,-0.06,0,0,Math.PI/2,0.05,0.42,0.05,HI_BK,1);for(const sx of [-1,1])K.rr(sx*0.23,0.52,-0.06,0,0,Math.PI/2,0.06,0.03,0.06,HI_CH,1);K.rr(0,0.62,-0.09,0,-0.2,0,0.28,0.2,0.004,HI_WH,0);
  for(let l=0;l<4;l++)K.bx(0,0.66-l*0.03,-0.087+l*0.006,0.2,0.006,0.002,[0.25,0.25,0.3]);
  K.cy(0.38,0.405,-0.15,0.14,0.02,HI_BK,'y');K.pl([[0.38,0.41,-0.15],[0.36,0.6,-0.18],[0.3,0.72,-0.08]],0.02,0.02,HI_BK);K.rr(0.27,0.72,-0.04,0,0.6,0,0.12,0.1,0.12,[0.2,0.45,0.3],0.8,0.5);K.bx(0.25,0.69,0.0,0.06,0.01,0.06,[1.2,1.1,0.8],true);
  K.rb(-0.36,0.44,-0.12,0.07,0.09,0.07,[0.9,0.9,0.88],0.9);K.rb(-0.36,0.485,-0.12,0.055,0.01,0.055,[0.3,0.18,0.08],1);
  const c=[0.5,0.5,0.55];K.rb(0,0.22,0.55,0.36,0.03,0.34,c,0.5);K.rb(0,0.38,0.72,0.34,0.16,0.03,c,0.5);for(const sx of [-1,1]){K.sg([sx*0.16,0.4,0.73],[sx*0.16,0,0.71],0.02,0.02,SD);K.sg([sx*0.15,0.22,0.41],[sx*0.16,0,0.37],0.02,0.02,SD);}}
 else{const W=t===1,top=W?HI_WH:[0.15,0.12,0.12],edge=W?[0.85,0.85,0.88]:[0.3,0.25,0.2];
  K.rb(0,0.77,0,1.34,0.04,0.74,edge,0.4);K.rb(0,0.38,-0.3,1.24,0.7,0.06,top,0.3);for(const sx of [-1,1])K.rb(sx*0.5,0.38,0,0.3,0.74,0.68,top,0.25);
  for(const sx of [-1,1])for(let d=0;d<3;d++){K.bx(sx*0.5,0.6-d*0.22,0.342,0.26,0.19,0.01,top.map(v=>v*0.92));K.rb(sx*0.5,0.64-d*0.22,0.355,0.1,0.02,0.02,W?HI_CH:GOLD,1);}
  if(!W){K.rb(0,0.75,0,1.38,0.03,0.78,GOLD,0.5);K.bx(0,0.792,0,1.0,0.005,0.4,[0.1,0.25,0.15]);}
  if(W){/* a beige computer with a green screen, a brick phone */
   const BE=[0.86,0.82,0.72];K.rb(-0.1,0.84,-0.1,0.4,0.1,0.32,BE,0.3);K.rb(-0.1,1.04,-0.13,0.36,0.3,0.3,BE,0.4,0.15);K.rb(-0.1,1.04,0.025,0.29,0.22,0.02,[0.05,0.12,0.06],0.8);
   for(let l=0;l<5;l++){const on=(Math.floor(T*2)+l)%7!==0;if(on)K.bx(-0.1-0.11+((l*37)%5)*0.01,1.12-l*0.035,0.036,0.1+((l*53)%7)*0.016,0.012,0.004,[0.25,1.1,0.45],true);}
   K.rr(-0.1,0.8,0.18,0,0.1,0,0.42,0.03,0.14,BE,0.5);for(let r=0;r<3;r++)K.bx(-0.1,0.818,0.14+r*0.035,0.36,0.006,0.02,[0.55,0.52,0.45]);K.rb(0.2,0.8,0.2,0.05,0.025,0.08,BE,1);
   K.rr(0.45,0.88,0.05,0.3,0,0.2,0.06,0.2,0.05,[0.2,0.2,0.22],0.4);K.rr(0.43,0.99,0.03,0.3,0,0.2,0.01,0.12,0.01,HI_BK,1);K.bx(0.455,0.92,0.077,0.035,0.02,0.004,[0.5,1,0.4],true);}
  else{/* three green tickers, a desk phone, a cigar */
   for(let i=0;i<3;i++){const sx=(i-1)*0.42,ay=-(i-1)*0.25;K.rr(sx,0.95,-0.12,ay,0,0,0.38,0.3,0.28,[0.85,0.82,0.72],0.35,0.12);K.fr(sx+Math.sin(ay)*0.142,0.97,-0.12+Math.cos(ay)*0.142,ay,0,0,0.3,0.22,0.004,[0.02,0.06,0.03]);
    for(let l=0;l<5;l++){const ph=(T*0.6+l*0.21+i*0.37)%1,up=(l+i)%2;K.fr(sx+Math.sin(ay)*0.146+Math.cos(ay)*(ph-0.5)*0.24,1.05-l*0.04,-0.12+Math.cos(ay)*0.146-Math.sin(ay)*(ph-0.5)*0.24,ay,0,0,0.07,0.014,0.003,up?[0.25,1.1,0.45]:[1.1,0.25,0.3],true);}}
   K.rr(0,0.8,0.2,0,0.1,0,0.5,0.03,0.15,[0.2,0.2,0.22],0.5);K.rb(0.5,0.82,0.15,0.2,0.06,0.18,HI_BK,0.4);K.rr(0.5,0.87,0.15,0,0,Math.PI/2,0.04,0.2,0.05,HI_BK,1);
   K.cy(-0.5,0.8,0.18,0.12,0.02,[0.9,0.92,0.95],'y');K.rr(-0.5,0.815,0.18,0.5,0,Math.PI/2,0.025,0.14,0.025,[0.45,0.28,0.12],1);K.bx(-0.43,0.815,0.21,0.015,0.015,0.015,[1.3,0.5,0.1],true);}
  /* executive chair: five-star base, gas column, deep seat, tall back */
  const CC=W?HI_WH:[0.38,0.06,0.07];for(let k=0;k<5;k++){const a=k*AN_TAU/5;K.sg([0,0.06,0.65],[Math.cos(a)*0.24,0.04,0.65+Math.sin(a)*0.24],0.04,0.03,HI_CH);K.ball(Math.cos(a)*0.24,0.025,0.65+Math.sin(a)*0.24,0.05,HI_BK);}
  K.rb(0,0.18,0.65,0.05,0.24,0.05,HI_CH,1);K.rb(0,0.32,0.65,0.5,0.1,0.48,CC,0.7);K.rr(0,0.66,0.86,0,-0.12,0,0.48,0.6,0.1,CC,0.7);for(const sx of [-1,1])K.rb(sx*0.25,0.43,0.66,0.06,0.04,0.34,CC,1);
  if(!W)for(let r=0;r<3;r++)for(let c=0;c<3;c++)K.ball(-0.12+c*0.12,0.5+r*0.14,0.8,0.025,GOLD);}}
/* the dance pole: a round lit stage, a pole with flanges at both ends */
function hiPole(B,q,t,T){if(!hiVis(q.x,q.z,1.8))return;const K=hiKit(B,q.x,q.z,0),P=t===2?GOLD:HI_CH;K.cy(0,0.055,0,0.92,0.11,t===0?[0.3,0.2,0.3]:[0.1,0.1,0.12],'y',false,0.5);K.cy(0,0.113,0,0.86,0.008,[1,0.3,0.75],'y',true);
 K.ring(0,0.06,0,0.465,0.02,0.03,[1.3,0.4,0.9],16,'y',true,T*0.5);K.cy(0,0.13,0,0.14,0.04,P,'y');K.rb(0,1.35,0,0.05,2.5,0.05,P,1);K.cy(0,2.6,0,0.16,0.06,P,'y');K.rb(0,2.55,0,0.08,0.06,0.08,P,1);}

/* ================= Room 14 ================= */
/* the stolen CRT on a milk crate, a VCR blinking 12:00, rabbit ears */
function hiTV(B,x,z,T){if(!hiVis(x,z,1))return;const K=hiKit(B,x,z,0),BL=[0.15,0.35,0.78];
 for(let i=0;i<4;i++)K.rb(0,0.03+i*0.1,0,0.5,0.03,0.42,BL,0.3);for(const sx of [-1,1])for(const sz of [-1,1])K.rb(sx*0.235,0.18,sz*0.195,0.03,0.36,0.03,BL,0.4);
 K.rb(0,0.39,0,0.42,0.06,0.3,HI_BK,0.3);K.bx(0,0.39,0.151,0.38,0.04,0.004,[0.25,0.25,0.28]);K.bx(-0.06,0.39,0.154,0.14,0.012,0.004,HI_BK);
 if(Math.sin(T*3.2)>0)K.bx(0.12,0.39,0.154,0.06,0.016,0.004,[0.3,1.2,0.4],true);
 K.rb(0,0.63,-0.02,0.48,0.42,0.4,[0.2,0.19,0.2],0.35,0.06);for(const sx of [-1,1])K.bx(sx*0.243,0.63,-0.02,0.006,0.36,0.34,[0.42,0.26,0.14]);
 K.rb(-0.04,0.64,0.182,0.36,0.3,0.03,[0.08,0.08,0.09],0.4);
 const ph=Math.floor(T*3)%3,snow=Math.sin(T*0.7)>0.75,sc=snow?[0.55+Math.random()*0.4,0.55+Math.random()*0.4,0.6+Math.random()*0.4]:[[1,0.35,0.75],[0.3,0.9,1],[1,0.85,0.3]][ph];
 K.rr(-0.04,0.64,0.196,0,0,0,0.3,0.24,0.012,sc,0.9);K.bx(-0.04+Math.sin(T*6)*0.08,0.62,0.204,0.04,0.1,0.004,[1,1,1],true);K.bx(-0.04,0.53+((T*0.5)%1)*0.22,0.204,0.3,0.008,0.003,sc.map(v=>v*0.6),true);
 for(let i=0;i<2;i++)K.cy(0.18,0.72-i*0.08,0.19,0.045,0.02,[0.75,0.75,0.78],'z');for(let i=0;i<4;i++)K.bx(0.18,0.56-i*0.02,0.192,0.07,0.006,0.004,HI_BK);
 K.rb(0,0.86,-0.02,0.12,0.04,0.09,[0.2,0.2,0.22],0.6);for(const s of [-1,1]){const tip=[s*0.24,1.32,-0.04];K.sf([s*0.03,0.87,-0.02],tip,0.012,0.012,[0.75,0.75,0.78]);K.ball(tip[0],tip[1],tip[2],0.025,[0.8,0.8,0.82]);}}
/* the army surplus duffel: a soft round bag, straps, a zipper, shells and mags spilling out */
function hiDuffel(B,x,z,T){if(!hiVis(x,z,1))return;const K=hiKit(B,x,z,0),OL=[0.3,0.34,0.2],OD=[0.22,0.25,0.14];
 K.rr(0,0.19,0,0,0,Math.PI/2,0.4,0.95,0.44,OL,1);for(const sx of [-1,1])K.cy(sx*0.44,0.19,0,0.36,0.04,OD,'x');
 K.bx(0,0.385,0,0.82,0.012,0.03,HI_DK);K.rb(0.3,0.39,0.02,0.04,0.02,0.05,HI_CH,1);for(const sx of [-0.2,0.2])K.pl([[sx,0.36,-0.12],[sx,0.46,-0.06],[sx,0.47,0.04],[sx,0.36,0.12]],0.05,0.012,OD);
 K.rb(-0.15,0.23,0.205,0.18,0.12,0.01,[0.75,0.72,0.6],0.3);K.bx(-0.15,0.23,0.212,0.1,0.04,0.003,HI_DK);
 for(let i=0;i<9;i++){const px=-0.6+i*0.14,pz=0.35+((i*37)%5)*0.04,a=i*0.7;K.rr(px,0.025,pz,a,0,Math.PI/2,0.04,0.09,0.04,i%3?[0.75,0.1,0.1]:[0.85,0.7,0.3],1);K.rr(px+Math.cos(a)*0.05,0.025,pz-Math.sin(a)*0.05,a,0,Math.PI/2,0.042,0.02,0.042,HI_BRASS,1);}
 K.rr(0.6,0.03,0.3,0.5,0,Math.PI/2,0.05,0.2,0.08,HI_DK,0.3);K.rr(0.45,0.03,0.42,-0.4,0,Math.PI/2,0.05,0.2,0.08,HI_DK,0.3);}
/* the rattling desk fan: weighted base, telescoping stand, a caged three-blade head */
function hiFan(B,x,z,T){if(!hiVis(x,z,1))return;const K=hiKit(B,x,z,0),C=[0.75,0.75,0.78],hz=0.08;
 K.cy(0,0.03,0,0.36,0.06,[0.6,0.6,0.64],'y',false,0.6);K.rb(0,0.25,0,0.05,0.42,0.05,C,1);K.rb(0,0.55,0,0.035,0.24,0.035,HI_CH,1);K.ball(0,0.68,0,0.06,[0.55,0.55,0.6]);
 K.rb(0,0.78,hz-0.1,0.14,0.14,0.18,[0.62,0.68,0.7],1);K.ring(0,0.78,hz,0.2,0.015,0.015,C,14,'z');K.ring(0,0.78,hz-0.08,0.17,0.015,0.015,C,14,'z');
 for(let k=0;k<6;k++){const a=k*AN_TAU/6;K.sf([Math.cos(a)*0.02,0.78+Math.sin(a)*0.02,hz+0.01],[Math.cos(a)*0.2,0.78+Math.sin(a)*0.2,hz],0.008,0.008,C);}
 for(let i=0;i<3;i++){const an=T*16+i*AN_TAU/3;K.rr(Math.cos(an)*0.09,0.78+Math.sin(an)*0.09,hz-0.04,0,0.35,an,0.15,0.08,0.012,[0.7,0.85,0.9],0.8);}K.cy(0,0.78,hz-0.02,0.07,0.04,C,'z');}
/* the kiddie pool: three inflated rings, water, a rubber duck, a beach ball, the hose */
function hiKiddiePool(B,x,z,T){if(!hiVis(x+0.3,z,1.4))return;const K=hiKit(B,x,z,0),n=16,rx=0.78,rz=0.43;
 for(let ring=0;ring<3;ring++){const y=0.05+ring*0.08,cs=[[0.2,0.55,0.9],[0.97,0.97,0.95],[0.95,0.3,0.35]][ring];for(let k=0;k<n;k++){const a0=k*AN_TAU/n,a1=(k+1)*AN_TAU/n;
   K.sg([Math.cos(a0)*rx,y,Math.sin(a0)*rz],[Math.cos(a1)*rx,y,Math.sin(a1)*rz],0.1,0.1,ring===1&&k%2?[1,0.85,0.3]:cs,1);}}
 K.ov(0,0.02,0,1.5,0.82,0.03,[0.2,0.55,0.9]);K.ov(0,0.2,0,1.42,0.74,0.012,[0.08,0.36,0.52],true);
 const dx=Math.sin(T*0.7)*0.35,dz=Math.cos(T*0.9)*0.12,ya=T*0.3;K.rr(dx,0.24,dz,ya,0,0,0.12,0.08,0.09,[1,0.85,0.15],1);K.rr(dx+Math.sin(ya)*0.04,0.3,dz+Math.cos(ya)*0.04,ya,0,0,0.07,0.07,0.07,[1,0.85,0.15],1);K.rr(dx+Math.sin(ya)*0.08,0.295,dz+Math.cos(ya)*0.08,ya,0,0,0.04,0.02,0.04,[1,0.45,0.1],1);
 const bxp=-0.4+Math.cos(T*0.5)*0.12;K.ball(bxp,0.27,0.08,0.16,[0.97,0.97,0.95]);K.rr(bxp,0.27,0.08,T*0.4,0,0,0.162,0.162,0.05,[1,0.25,0.3],1);K.rr(bxp,0.27,0.08,T*0.4+1.57,0,0,0.162,0.162,0.05,[0.2,0.5,1],1);
 const hp=[];for(let k=0;k<=8;k++){const a=k*0.75;hp.push([1.05+Math.cos(a)*(0.18+k*0.012),0.03,0.35+Math.sin(a)*(0.12+k*0.01)]);}hp.push([0.75,0.03,0.2],[0.62,0.24,0.05]);K.pl(hp,0.04,0.04,[0.2,0.55,0.25]);K.rb(0.6,0.26,0.03,0.04,0.06,0.04,[0.9,0.75,0.2],1);}
/* the rusty kettle barbecue: a round bowl on three splayed legs, the lid hung open, glowing coals */
function hiBBQ(B,x,z,T){if(!hiVis(x,z,1))return;const K=hiKit(B,x,z,0),R=[0.3,0.16,0.1],RD=[0.22,0.12,0.08];
 for(let k=0;k<3;k++){const a=k*AN_TAU/3+0.5;K.sg([Math.cos(a)*0.17,0.52,Math.sin(a)*0.17],[Math.cos(a)*0.28,0,Math.sin(a)*0.28],0.035,0.035,RD);}
 K.cy(0,0.24,0,0.36,0.02,RD,'y');for(const a of [0.5,0.5+AN_TAU/3])K.cy(Math.cos(a)*0.29,0.05,Math.sin(a)*0.29,0.1,0.03,HI_BK,'x');
 K.rr(0,0.62,0,0,Math.PI,0,0.62,0.3,0.62,R,1,0.45);K.cy(0,0.735,0,0.58,0.02,[0.2,0.1,0.06],'y');
 const gl=0.8+0.2*Math.sin(T*5);K.cy(0,0.73,0,0.5,0.008,[1.2*gl,0.4*gl,0.08],'y',true);for(let i=0;i<7;i++)K.bx(-0.21+i*0.07,0.752,0,0.012,0.01,0.5,[0.15,0.15,0.16]);K.ring(0,0.752,0,0.26,0.012,0.012,[0.15,0.15,0.16],16,'y');
 for(const [px,pz] of [[-0.1,-0.08],[0.1,0.1]]){K.rb(px,0.77,pz,0.14,0.03,0.12,[0.45,0.2,0.1],0.8);for(let s=0;s<2;s++)K.bx(px-0.02+s*0.04,0.787,pz,0.01,0.002,0.1,[0.15,0.07,0.04]);}
 K.rr(0,0.78,-0.36,0,-1.35,0,0.6,0.24,0.6,R,1,0.4);K.rb(0,0.92,-0.6,0.12,0.04,0.05,HI_BK,1);
 K.rb(0.42,0.5,0,0.24,0.02,0.3,[0.5,0.38,0.22],0.3);K.sg([0.38,0.53,-0.05],[0.5,0.53,0.1],0.05,0.008,HI_CH,0.3);}

/* ================= the Ocean Drive studio ================= */
/* the white leather sectional: plinth, chrome feet, separate seat and back cushions, a rolled arm, the chaise */
function hiSofa(B,cx,cz,T,blood){if(!hiVis(cx+0.4,cz+0.4,2.2))return;const K=hiKit(B,cx,cz,0),W=[0.97,0.95,0.92],W2=[0.93,0.91,0.88];
 K.bx(0,0.04,0,2.5,0.08,0.82,[0.2,0.62,0.64]);K.bx(1.4,0.04,0.8,0.82,0.08,1.5,[0.2,0.62,0.64]);for(const [fx,fz] of [[-1.2,-0.36],[-1.2,0.36],[0.9,-0.36],[1.75,1.5],[1.05,1.5],[1.75,0.1]])K.rb(fx,0.04,fz,0.06,0.08,0.06,HI_CH,1);
 K.rb(0,0.18,0,2.6,0.2,0.9,W,0.35);K.rb(1.4,0.18,0.8,0.9,0.2,1.6,W,0.35);K.rb(0,0.44,-0.38,2.6,0.44,0.16,W2,0.5);K.rb(-1.26,0.36,0.02,0.14,0.28,0.86,W,1);
 for(let i=0;i<3;i++){K.rb(-0.85+i*0.82,0.33,0.07,0.8,0.12,0.66,W,0.75);K.rr(-0.85+i*0.82,0.53,-0.26,0,-0.22,0,0.78,0.4,0.16,W2,0.8);}
 K.rb(1.4,0.33,0.86,0.82,0.12,1.42,W,0.75);K.rr(1.4,0.52,0.0,0,-0.2,0,0.82,0.38,0.16,W2,0.8);for(let s=0;s<3;s++)K.bx(1.4,0.393,0.4+s*0.4,0.78,0.004,0.01,[0.82,0.8,0.76]);
 const PC=[[1,0.55,0.72],[0.3,0.82,0.82]];for(let i=0;i<4;i++)K.rr(-0.9+i*0.55,0.5,-0.18,0.12*(i%2?1:-1),-0.25,0.1*(i%2?1:-1),0.3,0.3,0.1,PC[i%2],0.9);
 if(blood){K.bx(-0.3,0.395,0.05,0.55,0.01,0.4,[0.55,0.03,0.05]);K.bx(-0.1,0.395,0.2,0.2,0.01,0.15,[0.6,0.04,0.06]);}}
/* the hi-fi: a chrome-and-glass rack (turntable, EQ, tuner, tape deck, amp with VU needles) between two tower speakers */
function hiHifi(B,bx0,bz,T){if(!hiVis(bx0-0.4,bz,1.5))return;const K=hiKit(B,bx0-0.4,bz+0.05,0),SV=[0.72,0.74,0.78],beat=Math.max(0,Math.sin(T*8.4))**4;
 for(const sx of [-1,1])for(const sz of [-1,1])K.rb(sx*0.28,0.7,sz*0.2,0.03,1.4,0.03,HI_CH,1);for(const y of [0.02,0.42,0.68,0.94,1.2,1.38])K.bx(0,y,0,0.58,0.02,0.43,[0.5,0.6,0.65]);
 K.rb(0,0.22,0,0.52,0.36,0.38,HI_BK,0.25);K.bx(0,0.22,0.191,0.48,0.32,0.004,[0.2,0.2,0.22]);/* the amp */
 for(const sx of [-0.12,0.12]){K.bx(sx,0.3,0.195,0.16,0.08,0.004,[1.1,0.75,0.3],true);const nd=-0.6+((sx<0?beat:Math.abs(Math.sin(T*7.1)))*1.2);K.fr(sx+Math.sin(nd)*0.03,0.28+Math.cos(nd)*0.03,0.198,0,0,-nd,0.004,0.06,0.003,HI_BK);}
 for(let i=0;i<5;i++)K.cy(-0.18+i*0.09,0.13,0.2,0.045,0.02,SV,'z');
 K.rb(0,0.55,0,0.52,0.2,0.38,SV,0.25);for(const sx of [-0.12,0.12]){K.bx(sx,0.56,0.192,0.18,0.1,0.004,[0.1,0.1,0.12]);for(const rx of [-0.04,0.04]){K.fr(sx+rx,0.56,0.196,0,0,T*4,0.03,0.006,0.002,HI_WH);K.fr(sx+rx,0.56,0.196,0,0,T*4+1.57,0.03,0.006,0.002,HI_WH);}}
 K.rb(0,0.81,0,0.52,0.18,0.38,HI_BK,0.25);K.bx(-0.08,0.83,0.192,0.3,0.05,0.004,[0.2,0.9,1],true);K.bx(-0.08+Math.sin(T*0.3)*0.12,0.83,0.195,0.006,0.06,0.003,[1.3,0.3,0.3],true);for(let i=0;i<2;i++)K.cy(0.17,0.83-i*0.0,0.2,0.06,0.02,SV,'z');
 K.rb(0,1.07,0,0.52,0.2,0.38,HI_BK,0.25);for(let i=0;i<6;i++){const h=0.04+Math.abs(Math.sin(T*7+i*1.3))*0.14;K.bx(-0.2+i*0.08,1.0+h/2,0.193,0.05,h,0.004,i<4?[0.3,1,0.6]:[1,0.8,0.3],true);}
 K.rb(0,1.44,0,0.52,0.08,0.38,[0.4,0.26,0.16],0.4);K.cy(-0.06,1.49,0,0.3,0.02,[0.12,0.12,0.13],'y');K.fr(-0.06,1.505,0,T*3.5,0,0,0.3,0.002,0.02,[0.3,0.3,0.32]);K.cy(-0.06,1.502,0,0.1,0.006,[0.9,0.15,0.2],'y');
 K.sg([0.19,1.5,-0.12],[0.04,1.51,0.02],0.012,0.012,HI_CH);K.cy(0.19,1.5,-0.12,0.05,0.04,HI_CH,'y');
 for(const sx of [-0.65,0.65]){const S=hiKit(B,bx0-0.4+sx,bz+0.05,0);S.rb(0,0.6,0,0.35,1.2,0.35,[0.08,0.08,0.09],0.25);S.bx(0,0.6,0.176,0.32,1.16,0.004,[0.12,0.12,0.14]);
  const pump=1+beat*0.12;S.cy(0,0.32,0.18,0.28,0.02,[0.2,0.2,0.22],'z');S.cy(0,0.32,0.185+beat*0.01,0.22*pump,0.02,[0.3,0.3,0.33],'z');S.ball(0,0.32,0.19+beat*0.015,0.08,[0.15,0.15,0.16]);
  S.cy(0,0.72,0.18,0.16,0.02,[0.2,0.2,0.22],'z');S.cy(0,0.72,0.186,0.11,0.02,[0.35,0.35,0.38],'z');S.ball(0,0.98,0.185,0.06,SV);S.bx(0,1.12,0.18,0.12,0.02,0.004,GOLD);}}
/* the neon flamingo (glowing tubes on standoffs) over a glass coffee table with a mirror tray */
function hiNeon(B,cx,cz,T){if(!hiVis(cx,cz,1.6))return;const K=hiKit(B,cx,cz-0.43,0),N=[1,0.3,0.75],O=[1,0.6,0.3],z=0.03,fl=Math.sin(T*23)*Math.sin(T*3.1)>0.97?0.4:1,Nc=N.map(v=>v*fl);
 K.bx(0,1.55,0.005,1.0,0.95,0.012,[0.08,0.06,0.1]);for(const [px,py] of [[-0.4,1.15],[0.4,1.15],[-0.4,1.95],[0.4,1.95]])K.cy(px,py,0.015,0.03,0.03,HI_CH,'z');
 const body=[];for(let k=0;k<=12;k++){const a=k*AN_TAU/12;body.push([0.12+Math.cos(a)*0.28,1.52+Math.sin(a)*0.15,z]);}K.pl(body,0.035,0.035,Nc,true);
 K.pl([[0.18,1.52,z],[0.3,1.5,z],[0.38,1.42,z]],0.03,0.03,Nc,true);
 K.pl([[-0.12,1.6,z],[-0.25,1.7,z],[-0.29,1.83,z],[-0.22,1.95,z],[-0.1,1.99,z],[-0.02,1.95,z]],0.035,0.035,Nc,true);K.pl([[-0.02,1.95,z],[0.06,1.9,z],[0.07,1.85,z]],0.03,0.03,O,true);
 K.pl([[0.1,1.37,z],[0.1,1.05,z]],0.03,0.03,O,true);K.pl([[0.18,1.38,z],[0.28,1.22,z],[0.13,1.16,z]],0.03,0.03,O,true);
 const T2=hiKit(B,cx,cz+0.3,0);T2.rb(0,0.38,0,1.2,0.04,0.7,[0.7,0.9,1.0],0.5);T2.bx(0,0.36,0,1.22,0.006,0.72,HI_CH);
 for(const [lx,lz] of [[-0.52,-0.27],[0.52,-0.27],[-0.52,0.27],[0.52,0.27]]){T2.cy(lx,0.18,lz,0.05,0.36,HI_CH,'y');T2.cy(lx,0.005,lz,0.09,0.01,HI_CH,'y');}
 T2.rb(0.15,0.41,0,0.36,0.015,0.26,[0.92,0.95,1],0.6);T2.bx(0.15,0.42,0,0.32,0.003,0.22,[0.9,0.95,1.05],true);T2.rb(-0.3,0.46,0.1,0.06,0.1,0.06,[0.85,0.92,1],1,-0.4);T2.rb(-0.3,0.47,0.1,0.05,0.03,0.05,[1,0.45,0.2],1);}
/* the backlit pegboard (the guns hang on it, drawn by drawHome), a little shelf of ammo below */
function hiPeg(B,px,pz,T){if(!hiVis(px,pz,1.8))return;const K=hiKit(B,px,pz,0);K.bx(0,1.3,-0.012,2.0,1.3,0.02,[0.3,0.9,1],true);K.rb(0,1.3,0,1.9,1.2,0.04,[0.9,0.9,0.88],0.2);
 for(let r=0;r<6;r++)for(let c=0;c<12;c++)K.bx(-0.85+c*0.155,0.82+r*0.19,0.021,0.025,0.025,0.003,[0.35,0.35,0.35]);
 K.rb(0,0.66,0.08,1.6,0.04,0.2,[0.62,0.45,0.28],0.3);for(const sx of [-0.7,0.7])K.sg([sx,0.64,0.0],[sx,0.5,0.0],0.03,0.03,HI_DK);
 for(let i=0;i<5;i++){const c=[[0.2,0.45,0.2],[0.75,0.15,0.1],[0.85,0.7,0.3],[0.2,0.3,0.6],[0.2,0.45,0.2]][i];K.rb(-0.6+i*0.27,0.73,0.09,0.18,0.1,0.12,c,0.2);K.bx(-0.6+i*0.27,0.74,0.151,0.12,0.04,0.003,HI_WH);}}
/* the terrace hot tub: teak slats, a white rim, glowing water, headrests, steps, champagne, towels */
function hiTub(B,x,z,T){if(!hiVis(x,z,1.8))return;const K=hiKit(B,x,z,0);K.bx(0,0.03,0,2.56,0.04,1.96,[1,0.3,0.72],true);K.rb(0,0.3,0,2.4,0.58,1.8,HI_TEAK,0.15);
 for(let i=0;i<14;i++)K.bx(-1.1+i*0.17,0.3,0.902,0.008,0.54,0.004,[0.35,0.22,0.12]);for(let i=0;i<10;i++)for(const sx of [-1,1])K.bx(sx*1.202,0.3,-0.78+i*0.174,0.004,0.54,0.008,[0.35,0.22,0.12]);
 for(const sz of [-1,1])K.rb(0,0.6,sz*0.83,2.46,0.05,0.2,HI_WH,0.6);for(const sx of [-1,1])K.rb(sx*1.11,0.6,0,0.24,0.05,1.86,HI_WH,0.6);K.rb(0,0.604,0,2.0,0.012,1.4,[0.07,0.36,0.5],0.6);K.bx(0,0.608,0,1.9,0.004,1.3,[0.1,0.42,0.58],true);
 for(let i=0;i<7;i++)K.bx(Math.sin(T*1.7+i*2.1)*0.8,0.615,Math.cos(T*1.3+i*1.4)*0.5,0.12,0.01,0.12,[0.5,0.66,0.74],true);
 for(const [lx,lz] of [[-0.95,0],[0.95,0],[0,-0.65],[0,0.65]])K.bx(lx,0.59,lz,lx?0.01:0.3,0.04,lx?0.3:0.01,[1.2,0.4,0.9],true);
 for(const sx of [-1,1])K.rb(sx*0.9,0.66,-0.68,0.3,0.08,0.14,HI_BK,1);
 K.rb(1.42,0.07,0,0.4,0.14,0.8,HI_TEAK,0.3);K.rb(1.32,0.21,0,0.2,0.14,0.8,HI_TEAK,0.3);for(let i=0;i<3;i++)K.rb(1.42,0.16+i*0.045,0.2,0.3,0.04,0.25,i%2?[1,0.55,0.72]:HI_WH,0.7);
 K.rb(-0.95,0.72,-0.65,0.22,0.24,0.22,[0.8,0.82,0.88],1,-0.2);K.rr(-0.93,0.85,-0.65,0,0,0.2,0.07,0.22,0.07,[0.1,0.3,0.15],1);K.rr(-0.91,0.98,-0.65,0,0,0.2,0.03,0.08,0.03,GOLD,1);
 for(const ox of [-0.75,-0.62])K.rb(ox,0.67,-0.8,0.03,0.08,0.03,[0.85,0.92,1],1,-0.4);}
/* the sun deck: two slatted loungers with cushions, a fringed parasol, a cooler, tiki torches */
function hiDeck(B,T){if(!hiVis(25.5,9,2.8))return;const K=hiKit(B,0,0,0),AL=[0.94,0.94,0.96];
 for(const [x,cc] of [[24.5,[1,0.55,0.72]],[26.5,[0.3,0.82,0.82]]]){for(const sx of [-0.28,0.28]){K.sg([x+sx,0.17,8.65],[x+sx,0.17,9.85],0.04,0.04,AL);K.rb(x+sx,0.08,9.8,0.04,0.16,0.04,AL,1);K.cy(x+sx,0.06,8.72,0.12,0.03,HI_DK,'x');}
  for(let i=0;i<8;i++)K.rb(x,0.19,8.75+i*0.14,0.56,0.02,0.1,AL,0.3);K.rb(x,0.24,9.3,0.52,0.07,1.1,cc,0.7);
  K.sg([x,0.22,8.66],[x,0.62,8.2],0.56,0.04,AL,0.4);K.sg([x,0.26,8.68],[x,0.64,8.24],0.52,0.07,cc,0.7);K.rr(x,0.66,8.24,0,-0.8,0,0.4,0.08,0.16,HI_WH,1);
  K.bx(x,0.284,9.55,0.53,0.006,0.25,HI_WH);for(let s=0;s<3;s++)K.bx(x,0.288,9.47+s*0.08,0.53,0.004,0.025,cc.map(v=>v*0.7));}
 K.cy(25.5,1.05,8.5,0.05,2.1,HI_WH,'y');K.cy(25.5,0.03,8.5,0.36,0.06,[0.85,0.85,0.88],'y');
 for(let i=0;i<8;i++){const a=i*AN_TAU/8,m0=A.mul(A.mul(A.T(25.5,2.12,8.5),A.RY(a)),A.RX(0.28));K.B.box(A.mul(m0,A.mul(A.T(0,0,0.62),A.S(0.98,0.03,1.24))),i%2?[1,0.42,0.62]:[0.98,0.98,1]);
  K.B.box(A.mul(m0,A.mul(A.T(0,-0.06,1.24),A.S(0.95,0.12,0.02))),i%2?[1,0.42,0.62]:[0.98,0.98,1]);K.B.box(A.mul(m0,A.mul(A.T(0,0.02,0.62),A.mul(A.RY(AN_TAU/16),A.S(0.015,0.015,1.25)))),HI_CH);}
 K.ball(25.5,2.32,8.5,0.08,HI_WH);
 K.rb(25.5,0.18,9.75,0.5,0.32,0.34,[0.2,0.62,0.9],0.3);K.rb(25.5,0.36,9.75,0.53,0.06,0.37,HI_WH,0.5);K.pl([[25.28,0.36,9.75],[25.32,0.44,9.75],[25.68,0.44,9.75],[25.72,0.36,9.75]],0.025,0.025,HI_WH);
 K.rb(25.38,0.44,9.7,0.06,0.11,0.06,[0.95,0.1,0.15],0.9);K.rb(25.6,0.47,9.82,0.06,0.16,0.06,[0.3,0.5,0.15],0.9);K.rb(25.6,0.57,9.82,0.025,0.05,0.025,[0.3,0.5,0.15],1);
 for(const tx of [23.4,27.6]){for(let s=0;s<4;s++)K.rb(tx,0.15+s*0.29,8.25,0.06,0.27,0.06,[0.6,0.45,0.25],0.8);K.rb(tx,1.22,8.25,0.14,0.14,0.14,[0.45,0.32,0.18],0.6,-0.3);
  for(let f=0;f<3;f++){const fl=Math.sin(T*9+tx+f*2);K.rb(tx+(f-1)*0.03,1.36+fl*0.02,8.25,0.06,0.16+fl*0.05,0.06,[1.4,0.6+f*0.15,0.15],1,0.8);}}}

/* ================= the Coral Tower penthouse ================= */
/* the rotating wall vault: a steel frame bolted to the wall, a door that swings round, tufted red velvet, spotlights */
function hiVault(B,vx,vz,sw,T){if(!hiVis(vx,vz,1.8))return;const K=hiKit(B,vx,vz,0);K.bx(0,1.45,0.02,2.44,1.64,0.05,[0.12,0.12,0.14]);for(let i=0;i<10;i++)K.cy(-1.12+i*0.249,2.22,0.05,0.04,0.02,HI_CH,'z');for(let i=0;i<10;i++)K.cy(-1.12+i*0.249,0.68,0.05,0.04,0.02,HI_CH,'z');
 const D=hiKit(B,vx,vz+0.06,sw,undefined,1.45);D.rb(0,0,0,2.2,1.4,0.08,[0.2,0.2,0.23],0.2);D.rb(0,0,0.04,2.04,1.24,0.02,[0.42,0.03,0.07],0.3);
 for(let r=0;r<4;r++)for(let c=0;c<8;c++)D.ball(-0.87+c*0.25+(r%2)*0.125,-0.45+r*0.3,0.052,0.02,GOLD);
 D.bx(0,0.63,0.045,2.06,0.025,0.03,GOLD);D.bx(0,-0.63,0.045,2.06,0.025,0.03,GOLD);for(const sx of [-1,1])D.bx(sx*1.03,0,0.045,0.025,1.28,0.03,GOLD);
 for(let i=0;i<3;i++){D.rr(-0.65+i*0.65,0.58,0.08,0,0.6,0,0.07,0.05,0.07,HI_CH,1);D.bx(-0.65+i*0.65,0.55,0.1,0.04,0.01,0.04,[1.4,1.3,1.0],true);}
 const G=hiKit(B,vx,vz,0);G.rb(1.2,1.45,0.08,0.12,0.4,0.08,[0.25,0.25,0.28],0.4);G.ring(1.2,1.45,0.13,0.08,0.015,0.02,HI_CH,10,'z',false,sw*3);}
/* the velvet conversation pit: four tufted sofas round a black-marble fountain */
function hiPit(B,a,T){if(!hiVis(a.x,a.z,2.4))return;const r=1.35;for(let i=0;i<4;i++){const an=i*Math.PI/2,K=hiKit(B,a.x+Math.sin(an)*r,a.z+Math.cos(an)*r,an);
  K.rb(0,0.12,0,2.4,0.24,0.6,[0.4,0.04,0.1],0.4);K.bx(0,0.02,-0.3,2.4,0.04,0.02,GOLD);for(let s=0;s<3;s++)K.rb(-0.8+s*0.8,0.28,-0.04,0.78,0.1,0.52,[0.5,0.05,0.13],0.8);
  K.rb(0,0.42,0.24,2.4,0.38,0.14,[0.42,0.04,0.1],0.6);K.rb(0,0.62,0.25,2.42,0.04,0.16,GOLD,1);for(let r2=0;r2<2;r2++)for(let c=0;c<7;c++)K.ball(-1.0+c*0.33+(r2%2)*0.16,0.38+r2*0.12,0.168,0.025,GOLD);
  for(const k of [-0.7,0.7])K.rr(k,0.44,0.11,0,-0.3,k*0.2,0.32,0.26,0.1,k>0?GOLD:[0.95,0.92,0.85],0.9);}
 const K=hiKit(B,a.x,a.z,0);K.cy(0,0.25,0,0.92,0.5,[0.06,0.06,0.07],'y',false,0.2);K.ring(0,0.5,0,0.46,0.04,0.03,GOLD,16,'y');K.cy(0,0.5,0,0.82,0.008,[0.2,0.6+Math.sin(T*3)*0.1,0.9],'y',true);
 K.cy(0,0.62,0,0.12,0.24,[0.06,0.06,0.07],'y');K.cy(0,0.75,0,0.4,0.04,[0.06,0.06,0.07],'y');K.ring(0,0.77,0,0.2,0.02,0.02,GOLD,12,'y');K.cy(0,0.772,0,0.34,0.005,[0.3,0.75,1],'y',true);
 for(let j=0;j<6;j++){const ja=j*AN_TAU/6+T*0.3,h=0.18+0.04*Math.sin(T*6+j);K.sf([0,0.78,0],[Math.cos(ja)*0.2,0.78+h,Math.sin(ja)*0.2],0.012,0.012,[0.6,0.85,1.1],true);K.sf([Math.cos(ja)*0.2,0.78+h,Math.sin(ja)*0.2],[Math.cos(ja)*0.35,0.52,Math.sin(ja)*0.35],0.012,0.012,[0.6,0.85,1.1],true);}}
/* the white tiger on gold: a real stuffed tiger (the animal rig, frozen mid-snarl) on a stepped gold plinth with a brass plate */
const HI_WTIGER=Object.assign({},typeof AN_SPEC==='object'?AN_SPEC.tiger:{},{c:[0.96,0.95,0.92],b:[0.98,0.97,0.95],m:[0.98,0.97,0.95],l:[0.95,0.94,0.9],p:[0.94,0.92,0.88],eye:[0.3,0.6,0.95],n:[0.85,0.55,0.55],stripes:{n:11,c:[0.12,0.11,0.12],w:0.04},tailRings:[0.12,0.11,0.12]});
function hiTigerStatue(B,b,T){if(!hiVis(b.x,b.z,1.2))return;const K=hiKit(B,b.x,b.z,0);K.rb(0,0.07,0,1.42,0.14,0.72,GOLD,0.3);K.rb(0,0.19,0,1.3,0.1,0.6,[0.06,0.06,0.07],0.3);K.rb(0,0.245,0,1.32,0.012,0.62,GOLD,0.5);
 K.bx(0,0.12,0.362,0.4,0.08,0.006,[0.95,0.8,0.4]);for(let l=0;l<2;l++)K.bx(0,0.135-l*0.03,0.366,0.3-l*0.08,0.008,0.002,HI_BK);
 if(typeof anQuad==='function'){const M=A.mul(A.mul(A.T(b.x,0.25,b.z),A.RY(Math.PI/2)),A.S(0.82,0.82,0.82));anQuad(IBhi,M,HI_WTIGER,{T:0,ph:0.3,v:0,rest:0,look:0.4,mouth:0.9,snarl:1,crouch:0.35,seed:0.3});}}
/* the zebra billiards table: a striped apron, black leather rails with gold sights, pockets, turned legs, a full rack and a cue */
function hiPool(B,c,T){if(!hiVis(c.x,c.z,1.4))return;const K=hiKit(B,c.x,c.z,0),Z=[0.95,0.95,0.95];
 for(const sx of [-0.8,0.8])for(const sz of [-0.38,0.38]){K.rr(sx,0.25,sz,0,Math.PI,0,0.16,0.42,0.16,Z,0.6,0.35);K.rb(sx,0.2,sz,0.15,0.04,0.15,HI_BK,1);K.cy(sx,0.02,sz,0.14,0.04,GOLD,'y');}
 K.rb(0,0.6,0,1.9,0.24,1.0,Z,0.25);for(let i=0;i<9;i++){const x=-0.84+i*0.21,a=(i%2?0.35:-0.3);for(const sz of [-1,1])K.fr(x,0.6,sz*0.503,0,0,a,0.07,0.28,0.006,HI_BK);}for(const sx of [-1,1])for(let i=0;i<4;i++)K.fr(sx*0.953,0.6,-0.36+i*0.24,Math.PI/2,0,i%2?0.3:-0.3,0.07,0.28,0.006,HI_BK);
 K.bx(0,0.75,0,1.84,0.02,0.94,[0.1,0.5,0.25]);for(const sz of [-1,1])K.rb(0,0.775,sz*0.5,1.98,0.07,0.1,HI_BK,0.5);for(const sx of [-1,1])K.rb(sx*0.95,0.775,0,0.1,0.07,0.98,HI_BK,0.5);
 for(let i=0;i<6;i++)for(const sz of [-1,1])K.rb(-0.75+i*0.3,0.812,sz*0.5,0.025,0.005,0.025,GOLD,1);
 for(const sx of [-0.93,0,0.93])for(const sz of [-0.48,0.48]){K.cy(sx,0.79,sz,0.11,0.02,[0.02,0.02,0.02],'y');K.ring(sx,0.8,sz,0.06,0.012,0.012,GOLD,10,'y');}
 const bc=[[1,0.85,0.1],[0.1,0.2,0.9],[0.9,0.1,0.1],[0.45,0.1,0.6],[1,0.5,0.1],[0.1,0.55,0.2],[0.6,0.1,0.1],[0.08,0.08,0.08],[1,0.85,0.1],[0.1,0.2,0.9]];let n=0;
 for(let row=0;row<4;row++)for(let j=0;j<=row;j++){K.ball(0.35+row*0.055,0.79,(j-row/2)*0.063,0.06,bc[n%bc.length]);n++;}K.ball(-0.5,0.79,0.05,0.06,HI_WH);
 K.sg([-0.85,0.8,0.32],[0.3,0.8,0.4],0.022,0.022,[0.85,0.68,0.42],1,0.4);K.sg([-0.85,0.8,0.32],[-0.55,0.8,0.341],0.035,0.035,HI_BK);K.rb(0.6,0.83,-0.4,0.04,0.025,0.04,[0.3,0.55,0.9],0.3);}
/* the sky lounge: marble daybeds with cushions and pillows round a gas fire behind glass, a champagne table (world coordinates) */
function hiSky(B,T){if(!hiVis(3.6,6,2.8))return;const K=hiKit(B,1,1,0),MB=[0.96,0.94,0.9],BK=[0.06,0.05,0.07],VR=[0.55,0.04,0.12];
 K.rb(3,0.1,4.55,3.7,0.2,0.72,BK,0.2);K.rb(1.5,0.1,5.9,0.72,0.2,1.7,BK,0.2);K.bx(3,0.205,4.92,3.7,0.012,0.02,GOLD);K.bx(1.87,0.205,5.9,0.02,0.012,1.7,GOLD);
 for(let i=0;i<4;i++)K.rb(1.6+i*0.9,0.25,4.6,0.88,0.12,0.64,MB,0.8);for(let i=0;i<2;i++)K.rb(1.5,0.25,5.5+i*0.82,0.64,0.12,0.8,MB,0.8);
 K.rb(3,0.42,4.22,3.7,0.34,0.14,BK,0.4);K.rb(1.2,0.42,5.9,0.14,0.34,1.7,BK,0.4);
 for(let i=0;i<4;i++)K.rr(1.7+i*0.85,0.46,4.38,0,-0.3,(i%2?0.12:-0.12),0.42,0.28,0.12,i%2?GOLD:VR,0.9);for(let i=0;i<2;i++)K.rr(1.36,0.46,5.5+i*0.8,Math.PI/2,-0.3,0,0.42,0.28,0.12,i?GOLD:VR,0.9);
 K.bx(3.5,0.14,5.8,0.8,0.28,0.56,BK,false,0,TUV[43]);K.rb(3.5,0.29,5.8,0.86,0.025,0.62,GOLD,0.6);K.bx(3.5,0.31,5.8,0.6,0.02,0.36,[0.5,0.2,0.05],true);
 for(let i=0;i<10;i++)K.rb(3.5-0.25+hiRnd(i)*0.5,0.32,5.8-0.14+hiRnd(i+9)*0.28,0.07,0.04,0.06,[0.18,0.15,0.14],1);
 for(let i=0;i<7;i++){const fl=Math.abs(Math.sin(T*7+i*1.7));K.rb(3.5+(i-3)*0.08,0.4+fl*0.06,5.8+((i*3)%3-1)*0.07,0.07,0.14+fl*0.16,0.07,[1.4,0.55+fl*0.3,0.12],1,0.7);}
 for(const sz of [-1,1])K.bx(3.5,0.42,5.8+sz*0.3,0.82,0.22,0.008,[0.75,0.85,0.95]);
 K.cy(5.2,0.2,4.5,0.36,0.4,GOLD,'y');K.rb(5.2,0.46,4.5,0.2,0.14,0.2,[0.85,0.87,0.9],1,-0.2);K.rr(5.2,0.55,4.5,0,0,0.25,0.06,0.24,0.06,[0.1,0.3,0.15],1);K.rr(5.23,0.67,4.5,0,0,0.25,0.03,0.06,0.03,GOLD,1);
 for(const ox of [-0.1,0.12]){K.rb(5.2+ox,0.43,4.65,0.012,0.06,0.012,[0.85,0.92,1],1);K.rb(5.2+ox,0.5,4.65,0.04,0.08,0.04,[0.95,0.85,0.55],1,-0.2);}}

/* ================= Villa Solana (static pieces build once into the fixed batch) ================= */
/* the poolside cabana bar: striped canopy on white posts, a bar with a neon kick, stools, bottles, a blender */
function hiCabana(B){const K=hiKit(B,32.6,11.08,0,hiShim(B)),WH=HI_WH,PK=[1,0.3,0.6];
 for(const [x,z] of [[-1.3,-0.93],[1.3,-0.93],[-1.3,0.92],[1.3,0.92]]){K.cy(x,0.75,z,0.09,1.5,WH,'y');K.cy(x,0.03,z,0.16,0.06,GOLD,'y');}
 for(let i=0;i<7;i++){K.fr(-1.29+i*0.43,1.6,-0.55,0,0.35,0,0.43,0.04,1.25,i%2?WH:PK);K.fr(-1.29+i*0.43,1.6,0.55,0,-0.35,0,0.43,0.04,1.25,i%2?WH:PK);K.bx(-1.29+i*0.43,1.42,1.16,0.42,0.14,0.02,i%2?WH:PK);}
 K.rb(0,1.82,0,2.9,0.06,0.08,WH,0.6);
 K.rb(0,0.48,-0.33,2.6,0.96,0.5,[0.12,0.1,0.13],0.2);for(let i=0;i<12;i++)K.bx(-1.2+i*0.218,0.48,-0.075,0.012,0.86,0.004,[0.3,0.2,0.12]);
 K.rb(0,0.97,-0.33,2.7,0.05,0.62,WH,0.5);K.bx(0,0.85,-0.59,2.5,0.04,0.02,[0.3,0.9,1],true);K.bx(0,0.06,-0.065,2.5,0.03,0.02,PK,true);
 for(const x of [-1,0,1]){K.cy(x,0.36,0.25,0.3,0.06,PK,'y');K.cy(x,0.18,0.25,0.05,0.34,HI_CH,'y');K.ring(x,0.14,0.25,0.12,0.015,0.015,HI_CH,10,'y');K.cy(x,0.01,0.25,0.24,0.02,HI_CH,'y');}
 const BT=[[0.2,0.5,0.25],[0.75,0.45,0.15],[0.9,0.92,0.95],[0.55,0.1,0.15],[0.95,0.8,0.3]];for(let i=0;i<9;i++){const x=-1.1+i*0.27;K.rb(x,1.1,-0.5,0.06,0.2,0.06,BT[i%5],0.9);K.rb(x,1.23,-0.5,0.025,0.07,0.025,BT[i%5],1);}
 K.rb(0.7,1.04,-0.25,0.14,0.1,0.14,HI_DK,0.4);K.rb(0.7,1.18,-0.25,0.11,0.2,0.11,[0.95,0.5,0.65],0.8,-0.2);K.rb(0.7,1.3,-0.25,0.12,0.04,0.12,HI_DK,0.6);
 for(const x of [-0.6,-0.3]){K.rb(x,1.04,-0.2,0.02,0.08,0.02,[0.9,0.95,1],1);K.rb(x,1.11,-0.2,0.1,0.06,0.1,[1,0.6,0.3],1,-0.3);K.sg([x,1.12,-0.2],[x+0.04,1.2,-0.2],0.01,0.01,PK);}
 mallWord(B,'CABANA',32.6,1.62,10.0,0.14,PK);}
/* tennis floodlights: lattice towers with angled light banks */
function hiFlood(B){for(const [x,z] of [[35.9,4.9],[48.1,4.9],[35.9,23.1],[48.1,23.1]]){const fz=z<10?1:-1,K=hiKit(B,x,z,0,hiShim(B)),S=[0.32,0.33,0.36];
  K.rb(0,0.08,0,0.4,0.16,0.4,[0.5,0.5,0.52],0.2);for(const sx of [-1,1])for(const sz of [-1,1])K.sg([sx*0.1,0.1,sz*0.1],[sx*0.05,3.1,sz*0.05],0.035,0.035,S);
  for(let i=0;i<10;i++){const y=0.3+i*0.3,w=0.2-i*0.01;K.sf([-w/2,y,w/2],[w/2,y+0.3,w/2],0.015,0.015,S);K.sf([-w/2,y,-w/2],[w/2,y+0.3,-w/2],0.015,0.015,S);}
  K.rb(0,3.12,0,0.95,0.06,0.12,S,0.4);for(let r=0;r<2;r++)for(let c=0;c<3;c++){const lx=-0.3+c*0.3,ly=3.25+r*0.24;K.rr(lx,ly,fz*0.05,0,-fz*0.5,0,0.24,0.2,0.16,[0.2,0.2,0.22],0.4,0.15);K.fr(lx,ly-fz*0.0,fz*0.135,0,-fz*0.5,0,0.2,0.16,0.01,[1.4,1.4,1.25],true);}}}
/* the gold flamingo on the front fountain: a real bird made of rounded parts (glowing gold) */
function hiFlamingo(B,FX,FZ){const K=hiKit(B,FX,FZ,0,hiShim(B),1.66),G=[1,0.78,0.3];
 const sg=(p,q,w)=>K.sf(p,q,w,w,G,true);sg([0.04,0,0],[0.05,0.3,0],0.03);sg([0.05,0.3,0],[0.03,0.56,0],0.03);sg([-0.06,0.2,0.02],[-0.04,0.36,0],0.028);sg([-0.04,0.36,0],[0.0,0.58,0],0.028);
 K.fr(0,0.7,0,0,0,0.25,0.44,0.24,0.24,G,true);K.fr(-0.24,0.7,0,0,0,0.65,0.22,0.1,0.18,G,true);K.fr(-0.02,0.74,0.09,0,0.2,0.3,0.34,0.14,0.06,G,true);K.fr(-0.02,0.74,-0.09,0,-0.2,0.3,0.34,0.14,0.06,G,true);
 const nk=[[0.18,0.78,0],[0.26,0.92,0],[0.24,1.06,0],[0.17,1.16,0],[0.23,1.24,0],[0.3,1.22,0]];for(let i=0;i<nk.length-1;i++)sg(nk[i],nk[i+1],0.06-i*0.004);
 K.fr(0.32,1.22,0,0,0,-0.2,0.12,0.08,0.08,G,true);sg([0.37,1.21,0],[0.46,1.12,0],0.035);}
/* the DJ booth: a black-and-gold console with an LED face, two turntables and a mixer, speaker stacks with real cones */
function hiDJ(B){const K=hiKit(B,19,6.6,0,hiShim(B)),M=TUV[63];
 K.rb(0,0.45,0,2.0,0.9,1.2,[0.08,0.07,0.09],0.2);K.rb(0,0.92,0,2.06,0.04,1.26,GOLD,0.5);K.bx(0,0.45,0.61,1.9,0.8,0.02,[0.06,0.02,0.1]);
 for(const x of [-0.5,0.5]){K.rb(x,0.96,-0.1,0.56,0.06,0.48,[0.16,0.16,0.18],0.4);K.cy(x+0.2,0.995,0.1,0.05,0.02,HI_CH,'y');}
 K.rb(0,0.97,0.2,0.4,0.06,0.24,[0.2,0.2,0.22],0.4);for(let i=0;i<4;i++){K.bx(-0.12+i*0.08,1.0,0.22,0.015,0.004,0.12,HI_BK);K.cy(-0.12+i*0.08,1.01,0.14,0.035,0.02,HI_CH,'y');}
 for(const x of [-1.3,1.3]){const S=hiKit(B,19+x,6.6,0,hiShim(B));S.rb(0,0.45,0,0.5,0.9,0.5,[0.1,0.1,0.12],0.2);S.rb(0,1.15,0,0.44,0.5,0.44,[0.1,0.1,0.12],0.2);
  S.cy(0,0.3,0.255,0.36,0.02,[0.22,0.22,0.25],'z');S.cy(0,0.3,0.262,0.24,0.02,[0.32,0.32,0.36],'z');S.cy(0,0.3,0.268,0.08,0.02,[0.15,0.15,0.16],'z');
  S.cy(0,0.68,0.255,0.24,0.02,[0.22,0.22,0.25],'z');S.cy(0,0.68,0.262,0.14,0.02,[0.32,0.32,0.36],'z');S.cy(0,1.08,0.225,0.2,0.02,[0.22,0.22,0.25],'z');S.cy(0,1.28,0.225,0.08,0.02,HI_CH,'z');}}
/* the per-frame DJ bits: spinning platters with labels and tone arms, the LED face */
function hiDJDyn(D,T){if(!hiVis(19,6.6,1.8))return;hiWith(()=>{for(const x of [18.5,19.5]){const K=hiKit(D,x,6.5,T*4*(x<19?1:-1),undefined,0.995);K.cy(0,0,0,0.42,0.012,[0.06,0.06,0.07],'y',false,0.1);K.cy(0,0.008,0,0.13,0.006,x<19?[1,0.3,0.6]:[0.3,0.9,1],'y');K.fr(0.15,0.01,0,0,0,0,0.04,0.004,0.01,HI_WH);
  const A2=hiKit(D,x,6.5,0);A2.sg([0.2,1.0,0.12],[0.06,1.0,0.0],0.012,0.012,HI_CH);}
 for(let i=0;i<8;i++){const h=0.06+0.18*Math.abs(Math.sin(T*7+i*1.3));D.box(TRS(18.3+i*0.2,0.45+h/2-0.3,7.23,0,0.12,h,0.01),NEON[i%4],true);}});}
/* the motor yacht: a lofted white hull with a blue boot stripe, two decks of dark glass, a flybridge, a radar arch and a tender */
const HI_YACHT_ST=[[5.6,0.02,0.05,0.42],[5.3,0.42,0.28,0.4],[4.6,0.78,0.42,0.36],[3.0,0.94,0.48,0.33],[0.5,0.97,0.5,0.32],[-2.5,0.95,0.5,0.32],[-4.6,0.9,0.46,0.34],[-5.1,0.86,0.42,0.38],[-5.12,0.02,0.05,0.4]];
function hiYacht(B){const yx=42,yz=2.3,K=hiKit(B,yx,yz,0,hiShim(B)),WH=[0.97,0.97,0.96],GL=[0.06,0.08,0.12];
 if(typeof heliLoft==='function'&&B.quad){const b=A.T(yx,0,yz);heliLoft(B,b,HI_YACHT_ST,14,(i,k,t)=>{const sn=Math.sin(t);if(sn<-0.25&&sn>-0.45)return{c:[0.1,0.3,0.7]};if(sn>0.3&&sn<0.5)return{c:GL,g:1};if(sn<-0.85)return{c:[0.12,0.12,0.14]};return{c:WH};});}
 else K.bx(0,0.3,0,10.2,0.5,1.9,WH);
 K.rb(-0.2,0.72,0,7.6,0.06,1.85,[0.75,0.6,0.42],0.3);/* the teak deck */
 K.rb(-0.6,0.98,0,5.2,0.5,1.5,WH,0.35);K.bx(-0.6,1.0,0.755,4.8,0.24,0.01,GL);K.bx(-0.6,1.0,-0.755,4.8,0.24,0.01,GL);K.rr(1.95,0.98,0,0,0,0.55,0.4,0.48,1.4,GL,0.2);
 K.rb(-1.0,1.36,0,3.4,0.32,1.2,WH,0.35);K.bx(-1.0,1.38,0.605,3.0,0.16,0.01,GL);K.bx(-1.0,1.38,-0.605,3.0,0.16,0.01,GL);
 K.rb(-1.3,1.58,0,2.6,0.08,1.3,WH,0.4);for(let x=-2.4;x<=-0.2;x+=0.44)for(const sz of [-0.62,0.62])K.rb(x,1.74,sz,0.03,0.28,0.03,HI_CH,1);K.rb(-1.3,1.88,0.62,2.3,0.025,0.025,HI_CH,1);K.rb(-1.3,1.88,-0.62,2.3,0.025,0.025,HI_CH,1);
 K.rb(-2.2,2.0,0,0.16,0.7,1.1,WH,0.5,0.2);K.rr(-2.2,2.4,0,T0yacht,0,0,0.6,0.04,0.1,[0.2,0.2,0.22],0.5);K.cy(-2.2,2.36,0,0.12,0.06,WH,'y');
 for(let x=1.2;x<=5.0;x+=0.5)for(const sz of [-0.8,0.8])K.rb(x,0.88,sz*(1-Math.max(0,x-3.5)*0.3),0.025,0.3,0.025,HI_CH,1);
 K.rb(-3.9,0.86,0,1.6,0.25,0.9,[0.95,0.95,0.92],0.7);K.rb(-3.9,0.98,0,1.2,0.05,0.6,[0.2,0.5,0.9],0.6);K.rb(0.8,0.78,0,1.6,0.08,1.3,[0.25,0.5,0.85],0.6);
 mallWord(B,'SOLANA',yx-3.2,0.55,yz+0.5,0.18,GOLD);}
const T0yacht=0.3;

/* ================= the Doberman guard dog ================= */
/* replaces the pet tiger: a black-and-tan Doberman in a spiked collar that patrols the place, sits on alert when it stops,
   keeps its ears up, watches you when you come near and goes back to its post by the door */
function hiDoberman(q,T,pl){const x=q.x,z=q.z,I=anBatch(x,z),pr=I.r,pt=I.tp,pu=I.uv;I.uv=null;const sp=AN_SPEC.dober,s=anTrack(q,T,sp.stride),M=A.mul(A.T(x,0,z),A.RY(q.a||0));
 let look=s.look;if(pl){const d=Math.hypot(pl.x-x,pl.z-z);if(d<3.5){let la=Math.atan2(pl.x-x,pl.z-z)-(q.a||0);la=Math.atan2(Math.sin(la),Math.cos(la));look=anCl(la,-1.1,1.1);}}
 const v=s.v/0.9;anQuad(I,M,sp,{T,ph:s.ph,v,gait:v>1.6?'trot':'walk',rest:s.rest,restKind:'sit',look,tilt:0,mouth:s.rest>0.5?(anFr(T*0.11)<0.5?0.35:0.1):0.25,pant:s.rest>0.5&&anFr(T*0.11)<0.5,wag:0.15,seed:0.6});
 I.r=pr;I.tp=pt;I.uv=pu;}
/* old saves: the tiger goes, the Doberman moves in (same home, nothing to pay) */
function hiMigrateFurn(p){if(!p||!p.furn)return;for(const k of Object.keys(p.furn)){const f=p.furn[k];if(f&&f.tigerpet){delete f.tigerpet;f.doberman=1;}}}
