'use strict';
/* ================= PS2-STYLE CHARACTERS (low-poly skinned models, faces from the artwork) ================= */
const PS2C=(()=>{
const FACECFG={"money": {"EM": [168, 192], "prof": [[0, 0], [58, -8], [92, -3], [150, 0]], "hl": 106, "hr": 114}, "don": {"EM": [165, 192], "prof": [[0, 0], [55, -6], [90, -3], [150, 0]], "hl": 92, "hr": 118}, "mcwey": {"EM": [173.6, 192], "prof": [[0, 0], [50.4, -12.3], [85.7, -5.5], [145.7, 0]], "hl": 96, "hr": 114}};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t,hex=h=>[((h>>16)&255)/255,((h>>8)&255)/255,(h&255)/255];
/* ---------------- vector helpers ---------------- */
const V={add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
 cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len:a=>Math.hypot(a[0],a[1],a[2]),norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];}};
/* ---------------- skeleton (rest pose, A-pose arms) ---------------- */
const AA=38*Math.PI/180,AD=[Math.sin(AA),-Math.cos(AA),0];
const SH=[0.215,1.425,-0.01],EL=V.add(SH,V.mul(AD,0.3)),WR=V.add(EL,V.mul(AD,0.27)),HT=V.add(WR,V.mul(AD,0.18));
const mir=p=>[-p[0],p[1],p[2]];
const BONES=[ // name, parent, pivot, end
 ['pelvis',-1,[0,0.95,0],[0,1.06,0]],['spine',0,[0,1.06,0],[0,1.26,0]],['chest',1,[0,1.26,0],[0,1.47,0]],['neck',2,[0,1.47,0],[0,1.6,0]],['head',3,[0,1.6,0],[0,1.82,0]],
 ['uarmL',2,SH,EL],['farmL',5,EL,WR],['handL',6,WR,HT],['uarmR',2,mir(SH),mir(EL)],['farmR',8,mir(EL),mir(WR)],['handR',9,mir(WR),mir(HT)],
 ['thighL',0,[0.1,0.93,0],[0.105,0.51,0.01]],['shinL',11,[0.105,0.51,0.01],[0.11,0.1,-0.01]],['footL',12,[0.11,0.1,-0.01],[0.115,0.03,0.17]],
 ['thighR',0,[-0.1,0.93,0],[-0.105,0.51,0.01]],['shinR',14,[-0.105,0.51,0.01],[-0.11,0.1,-0.01]],['footR',15,[-0.11,0.1,-0.01],[-0.115,0.03,0.17]]];
const BI={};BONES.forEach((b,i)=>BI[b[0]]=i);
/* two soft bones after the rig, never posed or mocapped: the left and right cheek of a woman's seat, moved by softSeat's springs */
const SOFT_L=BONES.length,SOFT_R=BONES.length+1,NBS=BONES.length+2;
const KIDS=BONES.map((_,i)=>BONES.map((b,j)=>b[1]===i?j:-1).filter(j=>j>=0));
/* ================= TEXTURES (painted at load, PS2-sized) ================= */
let SKIN=[196,138,102],LAV=[162,132,210],LAVD=[100,76,148],PANTS=[154,126,202],SHD=[40,20,70];
const rgb=(c,a)=>a===undefined?`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`:`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
function loadImg(src,name){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Could not load character artwork: '+name));i.src=src;});}
const HEAD={chinY:1.575,crownY:1.842,neckY:1.47};
/* head: cylindrical unwrap of the face from the artwork, mirrored from its lit half so the face is straight and symmetric */
function paintHead(img,F){const W=256,H=256,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
 const s=document.createElement('canvas');s.width=img.width;s.height=img.height;const sx=s.getContext('2d');sx.drawImage(img,0,0);const S=sx.getImageData(0,0,s.width,s.height).data,SW=s.width,SH=s.height;
 const samp=(px,py)=>{px=clamp(px,0,SW-1.001);py=clamp(py,0,SH-1.001);const x0=px|0,y0=py|0,fx=px-x0,fy=py-y0,o=[0,0,0];for(let k=0;k<3;k++){const a=S[(y0*SW+x0)*4+k],b=S[(y0*SW+x0+1)*4+k],cc=S[((y0+1)*SW+x0)*4+k],d=S[((y0+1)*SW+x0+1)*4+k];o[k]=(a*(1-fx)+b*fx)*(1-fy)+(cc*(1-fx)+d*fx)*fy;}return o;};
 /* crop space (2x): skull ellipse, crown & chin rows; facial midline runs from between the eyes (row 193) to the mouth (row 283) */
 const ecx=176,ecy=196,erx=110,ery=150,crown=46,chin=344,mid=sy=>196-(sy-180)*0.06;
 /* match the base skin to the face's own skin tone (cheeks + forehead) */
 {let a=[0,0,0],n=0;for(const [px,py] of F.skin){const c=samp(px,py);a=a.map((v,k)=>v+c[k]);n++;}SKIN=a.map(v=>v/n);if(F.hairPt){const h=samp(...F.hairPt);F.hair=h.map(v=>v*0.9);}if(F.beardPt){const b=samp(...F.beardPt);F.beard=b.map(v=>v*0.9);}}
 const out=x.createImageData(W,H),D=out.data;
 for(let V=0;V<H;V++){const t=1-V/(H-1),Y=lerp(HEAD.neckY,HEAD.crownY,t);const sy=chin-(Y-HEAD.chinY)/(HEAD.crownY-HEAD.chinY)*(chin-crown);
  const dy=(sy-ecy)/ery,xr=Math.abs(dy)<1?ecx+erx*Math.sqrt(1-dy*dy):0,cxr=mid(sy),half=xr-cxr,neck=Y<HEAD.chinY-0.045;
  for(let U=0;U<W;U++){const ph=(U/(W-1)-0.5)*2*Math.PI;const ap=Math.abs(ph);let base=SKIN;if(F.hair&&Y>1.775-0.12*clamp((ap-1.1)/1.7,0,1))base=F.hair;else if(F.beard&&Y>(F.beardBot||1.552)&&Y<(F.beardTop||1.665)+0.03*clamp((ap-1.0)/0.4,0,1)*(ap<1.75?1:0)&&ap<2.35)base=F.beard;if(base===F.beard&&Y<(F.beardBot||1.552)+0.03){const k=(Y-(F.beardBot||1.552))/0.03;base=SKIN.map((v,i)=>v+(F.beard[i]-v)*k);}if(base===SKIN&&Y<HEAD.chinY)base=SKIN.map(v=>v*0.93);let col=base.map(v=>v*(0.8+0.2*Math.max(0,Math.cos(ph)))*(0.92+0.08*t));
   const lim=1.38;const hw=Math.abs(dy)<1?erx*Math.sqrt(1-dy*dy):0;if(!neck&&Math.abs(ph)<lim&&hw>8){const qy=sy-192,mq=profAt(F.prof,qy),sk=176-F.EM[0],qx=F.hl?mq+Math.sin(ph)*(ph<0?F.hl:F.hr)*0.92*Math.sqrt(Math.max(0,1-dy*dy)):sk+Math.sin(ph)*hw*0.86+(mq-sk)*Math.pow(Math.cos(ph),2),TS=F.TS||0,TC=Math.sqrt(1-TS*TS),a=(()=>{const qq=Math.min(qy,chin-192+10);return samp(F.EM[0]+qx*TC-qq*TS,192+qx*TS+qq*TC);})(),sm=e=>e*e*(3-2*e),f=sm(clamp((lim-Math.abs(ph))/0.6,0,1))*sm(clamp((hw-8)/34,0,1))*sm(clamp((sy-crown)/40,0,1))*sm(clamp((Y-HEAD.chinY+0.045)/0.05,0,1));col=col.map((v,k)=>lerp(v,a[k],f));}
   const o=(V*W+U)*4;D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;}}
 x.putImageData(out,0,0);
 /* hand-painted PS2 face (symmetric, one nose), drawn at 2x on a 512 sheet */
 const c2=document.createElement('canvas');c2.width=c2.height=512;const y=c2.getContext('2d');y.imageSmoothingQuality='high';y.drawImage(c,0,0,512,512);
 y.save();y.scale(2,2);const fy=(HEAD.crownY-1.676)/(HEAD.crownY-HEAD.neckY)*256;y.translate(128,fy);y.scale(1.4,1.22);y.translate(-128,-fy);y.restore();
 x.clearRect(0,0,W,H);c.width=c.height=512;c.getContext('2d').drawImage(c2,0,0);const x2=c.getContext('2d');x2.scale(2,2);
 paintEars(x2);x2.setTransform(1,0,0,1,0,0);x2.fillStyle='#5a3418';x2.fillRect(0,0,24,6);x2.fillStyle='#ff8a2a';x2.fillRect(28,0,20,6);x2.fillStyle='#e8e0d4';x2.fillRect(52,0,20,6);if(F.glassesSwatch){x2.fillStyle='#0b0b0e';x2.fillRect(244,0,24,6);}
 /* sunglasses swatches (Felix's SHADES, buildHead B.sun): lenses black/amber/mirror blue/pink/smoke, frames gold/white */
 ['#0b0b0e','#7a4410','#3a8ee8','#e85a98','#34343c','#e8b84a','#f4f4f2'].forEach((c,i)=>{x2.fillStyle=c;x2.fillRect(280+i*14,0,14,6);});return c;}
function profAt(P,q){if(q<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(q<=P[i][0]){const a=P[i-1],b=P[i];return a[1]+(b[1]-a[1])*(q-a[0])/(b[0]-a[0]);}return P[P.length-1][1];}
let FO={calm:0,brow:'#1e100a',fem:0};
/* men's mouths for generated faces (the heroes' come from their artwork): 1 frown, 2 sneer, 3 smirk, 4 clenched grin, 5 thin and tight */
function paintMouth(y,C,my,dk,lt,INK){const m=FO.mouth,lw=FO.lip||1,lc=rgb([SKIN[0]*0.72,SKIN[1]*0.42,SKIN[2]*0.4]),hw=10*(m===5?0.9:1),dn=m===1?2.6:m===5?0.6:1.2,sd=FO.side||1;
 const cl=m===2||m===3?[dn-(m===2?3.2:2.6),dn]:[dn,dn],L0=sd>0?cl[0]:cl[1],R0=sd>0?cl[1]:cl[0];
 const sh=(cx,cy,rx,ry,col)=>{const g=y.createRadialGradient(cx,cy,0,cx,cy,1);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');y.save();y.translate(cx,cy);y.scale(rx,ry);y.fillStyle=g;y.fillRect(-1,-1,2,2);y.restore();};
 sh(C,my+3,12,3.4,rgb([150,70,60],0.45));
 if(m===4){/* teeth clenched behind parted lips, like a man about to start something */
  y.fillStyle='#2a0a0c';y.beginPath();y.moveTo(C-hw,my+L0-1);y.quadraticCurveTo(C,my-2.6,C+hw,my+R0-1);y.quadraticCurveTo(C,my+5.4,C-hw,my+L0-1);y.fill();
  y.fillStyle='#efe6d6';y.beginPath();y.moveTo(C-hw+2,my+L0-0.8);y.quadraticCurveTo(C,my-1.8,C+hw-2,my+R0-0.8);y.quadraticCurveTo(C,my+3.8,C-hw+2,my+L0-0.8);y.fill();
  y.strokeStyle='rgba(120,100,90,.6)';y.lineWidth=0.5;for(let i=-3;i<=3;i++){y.beginPath();y.moveTo(C+i*2.6,my-1.2+Math.abs(i)*0.3);y.lineTo(C+i*2.6,my+3);y.stroke();}y.beginPath();y.moveTo(C-hw+2,my+1);y.quadraticCurveTo(C,my+1.6,C+hw-2,my+1);y.stroke();}
 /* upper lip, lower lip, the dark line between */
 y.fillStyle=lc;y.beginPath();y.moveTo(C-hw,my+L0);y.quadraticCurveTo(C-hw*0.5,my-1.8*lw-(m===2&&sd<0?1.6:0),C,my-1.1*lw);y.quadraticCurveTo(C+hw*0.5,my-1.8*lw-(m===2&&sd>0?1.6:0),C+hw,my+R0);y.quadraticCurveTo(C,my+(m===4?-0.6:0.6),C-hw,my+L0);y.fill();
 y.fillStyle=rgb([SKIN[0]*0.8,SKIN[1]*0.5,SKIN[2]*0.48]);y.beginPath();y.moveTo(C-hw*0.86,my+L0+0.4);y.quadraticCurveTo(C,my+(m===4?4.4:2)+3.4*lw,C+hw*0.86,my+R0+0.4);y.quadraticCurveTo(C,my+(m===4?3.6:1.4),C-hw*0.86,my+L0+0.4);y.fill();
 y.strokeStyle=INK+'1)';y.lineWidth=m===5?1.9:1.5;y.beginPath();y.moveTo(C-hw-0.5,my+L0+0.5);y.quadraticCurveTo(C-hw*0.5,my+(m===4?-1:0.2),C,my+(m===4?-0.4:0.6));y.quadraticCurveTo(C+hw*0.5,my+(m===4?-1:0.2),C+hw+0.5,my+R0+0.5);y.stroke();
 if(m===4){y.beginPath();y.moveTo(C-hw*0.8,my+L0+0.6);y.quadraticCurveTo(C,my+4.8,C+hw*0.8,my+R0+0.6);y.stroke();}
 /* corner creases: down for a frown, a dimple on the raised side for a smirk or sneer */
 y.strokeStyle=INK+'.5)';y.lineWidth=0.8;for(const s of [-1,1]){const c0=s<0?L0:R0;y.beginPath();y.moveTo(C+s*(hw+0.5),my+c0+0.5);y.quadraticCurveTo(C+s*(hw+2.2),my+c0+(c0<0?-0.8:1.5),C+s*(hw+2),my+c0+(c0<0?-2.6:3.6));y.stroke();}
 y.fillStyle=rgb(lt,0.4);y.beginPath();y.ellipse(C,my+(m===4?5.2:3.1)+lw,4,0.9,0,0,6.3);y.fill();}
/* the look's face, rolled from the look itself (no Math.random, so level spawns keep their random sequence): eye size and colour, brows, nose,
   mouth, age lines and the head's jaw and cheekbones. Heroes and named characters have artwork faces and never come through here. */
function faceOf(L){let h=2166136261;const k=JSON.stringify([L.skin,L.hair,L.hs,L.jacket,L.shirt,L.pants,L.arch,L.beard,L.stache,L.hat,L.body,L.fem]);for(let i=0;i<k.length;i++)h=Math.imul(h^k.charCodeAt(i),16777619);
 const r=()=>{h=(h+0x6D2B79F5)|0;let t=Math.imul(h^(h>>>15),1|h);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;},pk=a=>a[r()*a.length|0];
 const calm=(L.calm||0)>0.5,f={eo:1.12+r()*0.26,iris:pk(['#3a2010','#2a1608','#5a3a1a','#3a2010','#3c5a6a','#4a6a3a','#6a4a2a']),browT:0.85+r()*0.6,nose:0.85+r()*0.4,lip:0.8+r()*0.5,age:r(),side:r()<0.5?-1:1,
  mouth:calm?pk([3,3,4,5]):pk([1,1,2,2,3,4,5]),jaw:0.95+r()*0.11,cheek:0.97+r()*0.07,pores:0.5+r()*0.5};
 /* the Don's habit: some mobsters and bikers chew a cigar too */
 f.cig=(L.arch==='mobster'||L.arch==='biker')&&!L.fem&&r()<0.45;
 return f;}
function paintFace(y){const C=128,dk=SKIN.map(v=>v*0.62),md=SKIN.map(v=>v*0.8),lt=SKIN.map(v=>Math.min(255,v*1.12)),INK='rgba(38,18,14,';
 const V=Y=>(HEAD.crownY-Y)/(HEAD.crownY-HEAD.neckY)*256,U=xm=>C+Math.asin(clamp(xm/0.108,-1,1))/(2*Math.PI)*256;
 const ell=(cx,cy,rx,ry,col,rot)=>{y.fillStyle=col;y.beginPath();y.ellipse(cx,cy,rx,ry,rot||0,0,6.3);y.fill();};
 const soft=(cx,cy,rx,ry,col)=>{const g=y.createRadialGradient(cx,cy,0,cx,cy,1);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');y.save();y.translate(cx,cy);y.scale(rx,ry);y.fillStyle=g;y.fillRect(-1,-1,2,2);y.restore();};
 const sym=f=>{f(1);f(-1);};
 /* shading: brow ridge, cheekbones, jaw, under-chin; warm cheeks */
 soft(C,V(1.6),34,12,rgb(dk,0.35));sym(s=>soft(C+s*21,V(1.66),9,12,'rgba(200,90,70,.18)'));sym(s=>soft(C+s*26,V(1.63),8,18,rgb(dk,0.22)));
 soft(C,V(1.77),30,10,rgb(lt,0.25));sym(s=>soft(C+s*14,V(1.712),10,6,rgb(dk,FO.fem?0.28:0.6)));
 /* forehead creases */
 if(!FO.fem){y.strokeStyle=INK+'.22)';y.lineWidth=0.8;for(const yy of [1.775,1.79]){y.beginPath();y.moveTo(C-15,V(yy)+1);y.quadraticCurveTo(C,V(yy)-1,C+15,V(yy)+1);y.stroke();}}
 /* eyes: almond whites, brown iris, heavy upper lid, dark bags (women: open almond eyes, light lids, no bags) */
 const ey=V(1.706),ex=U(0.031),eo=FO.fem?1.25:(FO.eo||1);
 /* women: big made-up eyes that still read from the game camera: eyeshadow, white almond, large dark iris with a catch-light,
    thick liner with a flick, lashes, and a clean arched brow */
 if(FO.fem){sym(s=>{const cx=C+s*(ex-C),ic=FO.iris||'#3a2414';
   soft(cx,ey-2.5,10,6,FO.shadow||'rgba(150,60,140,.55)');
   y.fillStyle='#f6f2ee';y.beginPath();y.moveTo(cx-7.5,ey+0.4);y.quadraticCurveTo(cx-1,ey-5.2,cx+7.5,ey-0.2);y.quadraticCurveTo(cx+1,ey+3.6,cx-7.5,ey+0.4);y.fill();
   ell(cx-s*0.4,ey-0.6,3.3,3.4,ic);ell(cx-s*0.4,ey-0.6,1.7,1.8,'#050203');ell(cx-s*0.4-1,ey-1.8,0.9,0.9,'#fff');
   y.strokeStyle='#0a0406';y.lineCap='round';y.lineWidth=2.6;y.beginPath();y.moveTo(cx-s*8,ey+0.6);y.quadraticCurveTo(cx-s*1,ey-5.8,cx+s*8,ey-0.6);y.lineTo(cx+s*11,ey-3.6);y.stroke();
   y.lineWidth=1.1;for(let k=0;k<4;k++){const t=0.25+k*0.2,lx=cx+s*(-8+16*t),ly=ey-0.6-4.6*Math.sin(t*Math.PI)*0.95;y.beginPath();y.moveTo(lx,ly);y.lineTo(lx+s*1.4,ly-2.6);y.stroke();}
   y.strokeStyle='rgba(10,4,6,.55)';y.lineWidth=0.9;y.beginPath();y.moveTo(cx-s*6.5,ey+1.8);y.quadraticCurveTo(cx,ey+3.6,cx+s*7,ey+0.8);y.stroke();
   y.strokeStyle=FO.brow;y.lineWidth=2.4;y.beginPath();y.moveTo(cx-s*8,ey-7.2);y.quadraticCurveTo(cx+s*1,ey-12.4,cx+s*9.5,ey-7.6);y.stroke();y.lineCap='butt';});}
 else sym(s=>{const cx=C+s*(ex-C);
  soft(cx,ey+3,8,4,rgb(dk,FO.fem?0.15:0.5));
  y.fillStyle='#ece4da';y.beginPath();y.moveTo(cx-6.5,ey);y.quadraticCurveTo(cx,ey-3.6*eo,cx+6.5,ey);y.quadraticCurveTo(cx,ey+2.6*eo,cx-6.5,ey);y.fill();
  ell(cx-s*0.6,ey-0.2,2.8*Math.min(eo,1.15),2.8*Math.min(eo,1.15),FO.iris||'#3a2010');ell(cx-s*0.6,ey-0.2,1.4,1.4,'#080302');ell(cx-s*0.6-0.8,ey-1.1,0.7,0.7,'#fff');
  if(FO.eo){/* hero-style eyes: a lid crease above, a lash line below, the socket shadowed so the eye reads from the game camera */
   y.strokeStyle=INK+'.4)';y.lineWidth=0.8;y.beginPath();y.moveTo(cx-6,ey-3.2*eo);y.quadraticCurveTo(cx,ey-6.2*eo,cx+6.5,ey-3);y.stroke();
   y.strokeStyle=INK+'.75)';y.lineWidth=1;y.beginPath();y.moveTo(cx-6,ey+0.8);y.quadraticCurveTo(cx,ey+2.9*eo,cx+6.2,ey+0.6);y.stroke();
   if(FO.age>0.55){y.strokeStyle=INK+(0.18+0.3*(FO.age-0.55))+')';y.lineWidth=0.7;for(let k=-1;k<=1;k++){y.beginPath();y.moveTo(cx+s*8,ey+k*1.6);y.lineTo(cx+s*12,ey+k*2.8-0.6);y.stroke();}}}
  y.strokeStyle=INK+'1)';y.lineWidth=2.2;y.beginPath();y.moveTo(cx-7,ey+0.3);y.quadraticCurveTo(cx,ey-4.2*eo,cx+7,ey+0.2);y.stroke();
  y.strokeStyle=INK+(FO.fem?'.2)':'.45)');y.lineWidth=0.7;y.beginPath();y.moveTo(cx-5,ey+2.2*eo);y.quadraticCurveTo(cx,ey+3.6*eo,cx+5,ey+2.2*eo);y.stroke();
  /* brows: arched & feminine for women, low & angled for men */
  if(FO.fem){y.strokeStyle=FO.brow;y.lineWidth=1.6;y.beginPath();y.moveTo(cx-s*8.5,ey-5.5);y.quadraticCurveTo(cx-s*1.5,ey-9.2,cx+s*8.5,ey-5.2);y.stroke();}
  else{const bt=FO.browT||1,eb=ey-(FO.eo?1.8:0);y.fillStyle=FO.brow;y.beginPath();y.moveTo(cx-s*9.5,eb-3.6-FO.calm*4.5);y.lineTo(cx+s*8.5,eb-9.2+FO.calm*2.2);y.lineTo(cx+s*8,eb-9.2+FO.calm*2.2+3.8*bt);y.lineTo(cx-s*9.5,eb-3.6-FO.calm*4.5+2.2*bt);y.closePath();y.fill();
   if(FO.eo){/* brow hairs */y.strokeStyle=FO.brow;y.lineWidth=0.7;for(let k=0;k<9;k++){const t=k/8,bx=lerp(cx+s*8,cx-s*9,t),by=lerp(eb-9.2+FO.calm*2.2,eb-3.6-FO.calm*4.5,t)+1.4*bt;y.beginPath();y.moveTo(bx,by+1);y.lineTo(bx-s*2.2,by-1.6);y.stroke();}}}});
 /* frown crease between the brows */
 if(!FO.fem){y.strokeStyle=INK+(0.55*(1-FO.calm))+')';y.lineWidth=0.9;sym(s=>{y.beginPath();y.moveTo(C+s*2,ey-7);y.lineTo(C+s*1.2,ey-2);y.stroke();});}
 /* nose: one broad nose, bridge highlight, wing shading, nostrils */
 const nb=V(1.7),nt=V(1.672);y.fillStyle=rgb(lt,0.55);y.beginPath();y.moveTo(C-1.5,nb);y.lineTo(C+1.5,nb);y.lineTo(C+2.5,nt-2);y.lineTo(C-2.5,nt-2);y.fill();
 const nw=FO.fem?1:(FO.nose||1);sym(s=>{soft(C+s*5*nw,nt-6,2.5,9,rgb(dk,0.35));soft(C+s*7*nw,nt,4,3.5,rgb(md,0.8));y.strokeStyle=INK+'.6)';y.lineWidth=0.9;y.beginPath();y.arc(C+s*6.5,nt,3.6,s>0?-1.2:Math.PI-0.3,s>0?0.3:Math.PI+1.2);y.stroke();});
 ell(C,nt-0.5,4,3,rgb(SKIN.map(v=>Math.min(255,v*1.05))));ell(C-0.8,nt-1.5,1.3,1,rgb(lt,0.8));sym(s=>ell(C+s*3.3,nt+2,1.6,1,'rgba(40,14,10,.85)'));
 /* nasolabial folds */
 if(!FO.fem){y.strokeStyle=INK+(0.4+0.3*(FO.age||0))+')';y.lineWidth=0.9+0.5*(FO.age||0);sym(s=>{y.beginPath();y.moveTo(C+s*9,nt+1);y.quadraticCurveTo(C+s*13,V(1.655),C+s*12.5,V(1.638));y.stroke();});}
 /* mouth: firm, corners turned down; full lower lip */
 const my=V(1.646);
 if(FO.mouth&&!FO.fem)paintMouth(y,C,my,dk,lt,INK);else{
 soft(C,my+3,11,3,rgb([150,70,60],0.5));y.fillStyle='rgb(150,72,62)';y.beginPath();y.moveTo(C-10,my+1.2);y.quadraticCurveTo(C,my-2,C+10,my+1.2);y.quadraticCurveTo(C,my+4.6,C-10,my+1.2);y.fill();
 y.strokeStyle=INK+'1)';y.lineWidth=1.6;y.beginPath();y.moveTo(C-10.5,my+1.8);y.quadraticCurveTo(C-5,my-0.3,C,my+0.3);y.quadraticCurveTo(C+5,my-0.3,C+10.5,my+1.8);y.stroke();
 y.fillStyle=rgb(lt,0.35);y.fillRect(C-4,my+2.4,8,1);}soft(C,my+7,7,2.5,rgb(dk,0.4));
 /* chin + jaw line */
 soft(C,V(1.6),8,4,rgb(lt,0.25));y.strokeStyle=INK+'.25)';y.lineWidth=0.8;y.beginPath();y.moveTo(C-3,V(1.598));y.quadraticCurveTo(C,V(1.594),C+3,V(1.598));y.stroke();}
function paintEars(x){
 /* painted ears (used by the ear flaps), nape crease, a touch of stubble shadow along the jaw */
 for(const ex of [64,192]){const sd=ex>128?1:-1;x.fillStyle=rgb([150,92,70]);x.beginPath();x.ellipse(ex,105,9,19,0,0,6.3);x.fill();x.fillStyle=rgb(SKIN.map(v=>v*1.0));x.beginPath();x.ellipse(ex+sd*2,103,6,15,0,0,6.3);x.fill();x.strokeStyle=rgb([120,70,52],0.7);x.lineWidth=1.5;x.beginPath();x.ellipse(ex,105,10,20,0,0,6.3);x.stroke();}
 x.strokeStyle=rgb([130,80,60],0.35);x.lineWidth=2;x.beginPath();x.moveTo(0,200);x.quadraticCurveTo(12,196,26,201);x.moveTo(256,200);x.quadraticCurveTo(244,196,230,201);x.stroke();}
/* body sheet layout (rows): torso 0-290 · sleeves 290-380 · cuffs 380-400 · swatches 400-440 · trousers 440-512 */
const TY0=0.8,TY1=1.51,ROW={t:290,s0:290,s1:380,c0:381,c1:399,w0:400,w1:440,p0:440,p1:512};
const SW={skin:[0.15,420/512],gold:[0.43,420/512],dial:[(290+20)/512,420/512],shoe:[0.82,420/512]};
function paintBody(pais,B){LAV=B.jacket;LAVD=LAV.map(v=>v*0.62);PANTS=B.pants;SHD=LAV.map(v=>v*0.3);const SHc=a=>rgb(SHD,a);const W=512,c=document.createElement('canvas');c.width=W;c.height=W;const x=c.getContext('2d');
 const ty=Y=>(TY1-Y)/(TY1-TY0)*ROW.t,fx=m=>256+m*340;
 const fabric=(y0,y1,base)=>{x.fillStyle=rgb(base);x.fillRect(0,y0,W,y1-y0);x.save();x.beginPath();x.rect(0,y0,W,y1-y0);x.clip();
  x.globalAlpha=0.09;x.strokeStyle='#3a2a5a';x.lineWidth=1;for(let i=-W;i<W*2;i+=3){x.beginPath();x.moveTo(i,y0);x.lineTo(i+(y1-y0),y1);x.stroke();}
  x.globalAlpha=0.06;x.strokeStyle='#ffffff';for(let i=-W;i<W*2;i+=4){x.beginPath();x.moveTo(i,y1);x.lineTo(i+(y1-y0),y0);x.stroke();}
  const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'rgba(255,255,255,0.10)');g.addColorStop(1,SHc(.16));x.globalAlpha=1;x.fillStyle=g;x.fillRect(0,y0,W,y1-y0);x.restore();};
 const line=(pts,w,col)=>{x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(...pts[0]);for(const p of pts.slice(1))x.lineTo(...p);x.stroke();};
 const stitch=(pts,col)=>{x.save();x.setLineDash([3,3]);line(pts,1,col||'rgba(235,225,255,.55)');x.restore();};
 const blob=(cx,cy,rx,ry,col)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,1);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.save();x.translate(cx,cy);x.scale(rx,ry);x.fillStyle=g;x.beginPath();x.arc(0,0,1,0,6.3);x.restore();x.save();x.translate(cx,cy);x.scale(rx,ry);x.fillStyle=g;x.fillRect(-1,-1,2,2);x.restore();};
 const pp=x.createPattern(pais,'repeat');pp.setTransform&&pp.setTransform(new DOMMatrix().scale(B.shirtScale||0.26));
 const INK=rgb(LAV.map(v=>v*0.38),0.85),SEAM=rgb(LAV.map(v=>v*0.48),0.45);
 /* ---- torso ---- */
 fabric(0,ROW.t,LAV);
 /* baked PS2-style shading: underarms & sides darker, chest catch-light, lower-back fold */
 for(const sx of [128,384]){blob(sx,ty(1.36),70,60,SHc(.35));blob(sx,ty(1.0),50,90,SHc(.18));}
 blob(256,ty(1.3),120,50,'rgba(255,255,255,.12)');blob(0,ty(1.05),40,30,SHc(.2));blob(W,ty(1.05),40,30,SHc(.2));
 for(const sd of [-1,1])for(let k=0;k<3;k++){x.strokeStyle='rgba(50,30,90,.22)';x.lineWidth=2;x.beginPath();const cx=256+sd*(150+k*12),cy=ty(1.04+k*0.03);x.moveTo(cx-18,cy);x.quadraticCurveTo(cx,cy+5,cx+18,cy-2);x.stroke();}
 /* seams: side, back, shoulder, darts */
 line([[0,0],[0,ROW.t]],3,SEAM);line([[W,0],[W,ROW.t]],3,SEAM);line([[2,ty(0.97)],[2,ROW.t]],3,'rgba(50,30,80,.7)');line([[W-2,ty(0.97)],[W-2,ROW.t]],3,'rgba(50,30,80,.7)');
 for(const sd of [-1,1]){x.strokeStyle=SEAM;x.lineWidth=2;x.beginPath();x.moveTo(256+sd*128,ty(1.44));x.quadraticCurveTo(256+sd*122,ty(1.15),256+sd*128,ty(0.81));x.stroke();
  line([[256+sd*96,ty(1.47)],[256+sd*170,ty(1.43)]],2,SEAM);line([[fx(sd*0.105),ty(1.26)],[fx(sd*0.11),ty(1.0)]],1.5,'rgba(70,50,110,.3)');}
 const V=Y=>0.012+(Y-1.12)*0.36;
 /* shirt V: paisley from the art, open neck, placket buttons */
 x.save();x.beginPath();x.moveTo(fx(-V(1.12)),ty(1.12));for(let Y=1.12;Y<=1.52;Y+=0.02)x.lineTo(fx(-V(Y)),ty(Y));for(let Y=1.52;Y>=1.12;Y-=0.02)x.lineTo(fx(V(Y)),ty(Y));x.closePath();x.clip();x.fillStyle=pp;x.fillRect(0,0,W,ROW.t);
 const sg=x.createLinearGradient(fx(-0.1),0,fx(0.1),0);sg.addColorStop(0,'rgba(40,20,40,.45)');sg.addColorStop(0.3,'rgba(0,0,0,0)');sg.addColorStop(0.7,'rgba(0,0,0,0)');sg.addColorStop(1,'rgba(40,20,40,.45)');x.fillStyle=sg;x.fillRect(0,0,W,ROW.t);
 if(!B.tie&&B.deepV){x.fillStyle=rgb(SKIN.map(v=>v*0.86));x.beginPath();x.moveTo(fx(0),ty(1.2));x.lineTo(fx(-0.085),ty(1.53));x.lineTo(fx(0.085),ty(1.53));x.closePath();x.fill();x.save();x.clip();for(let k=0;k<260;k++){const hx=fx((Math.random()-0.5)*0.12),hy=ty(1.25+Math.random()*0.24);x.strokeStyle='rgba(90,45,25,.45)';x.lineWidth=0.8;x.beginPath();x.moveTo(hx,hy);x.lineTo(hx+(Math.random()-0.5)*3,hy+2+Math.random()*2);x.stroke();}x.restore();}
 if(!B.tie){x.fillStyle=rgb(SKIN.map(v=>v*0.88));x.beginPath();x.moveTo(fx(0),ty(1.41));x.lineTo(fx(-0.06),ty(1.53));x.lineTo(fx(0.06),ty(1.53));x.closePath();x.fill();}
 if(B.tie){const tc=B.tie;x.fillStyle=rgb(tc);x.beginPath();x.moveTo(fx(-0.018),ty(1.48));x.lineTo(fx(0.018),ty(1.48));x.lineTo(fx(0.03),ty(1.2));x.lineTo(fx(0),ty(1.15));x.lineTo(fx(-0.03),ty(1.2));x.closePath();x.fill();x.fillStyle=rgb(tc.map(v=>v*1.3));x.fillRect(fx(-0.022),ty(1.5),fx(0.022)-fx(-0.022),ty(1.47)-ty(1.5));x.strokeStyle='rgba(0,0,0,.4)';x.lineWidth=1;x.stroke();for(let k=0;k<6;k++){x.strokeStyle=rgb(tc.map(v=>v*1.6),0.35);x.beginPath();x.moveTo(fx(-0.03),ty(1.44-k*0.05));x.lineTo(fx(0.03),ty(1.41-k*0.05));x.stroke();}}
 if(B.chains)for(const [d,w] of [[1.44,2.2],[1.38,2.6],[1.31,3.2]]){x.strokeStyle='#8a5a14';x.lineWidth=w+1;x.beginPath();x.moveTo(fx(-0.075),ty(1.52));x.quadraticCurveTo(fx(0),ty(d-0.06),fx(0.075),ty(1.52));x.stroke();x.strokeStyle='#f0c050';x.lineWidth=w;x.stroke();x.strokeStyle='#fff4c0';x.lineWidth=0.8;x.setLineDash([2,3]);x.stroke();x.setLineDash([]);}
 if(B.chain){x.strokeStyle='#e8b84a';x.lineWidth=3;x.beginPath();x.moveTo(fx(-0.07),ty(1.5));x.quadraticCurveTo(fx(0),ty(1.3),fx(0.07),ty(1.5));x.stroke();x.strokeStyle='#8a5a14';x.lineWidth=1;x.setLineDash([2,2]);x.stroke();x.setLineDash([]);
  const mg=x.createRadialGradient(fx(0),ty(1.32),0,fx(0),ty(1.32),11);mg.addColorStop(0,'#fff4c0');mg.addColorStop(0.6,'#e8b84a');mg.addColorStop(1,'#8a5a14');x.fillStyle=mg;x.beginPath();x.moveTo(fx(0),ty(1.36));x.lineTo(fx(0.028),ty(1.32));x.lineTo(fx(0),ty(1.27));x.lineTo(fx(-0.028),ty(1.32));x.closePath();x.fill();}
 if(B.medal){/* gold medallion: a long fine chain and a saint the size of a coaster */x.strokeStyle='#d8a838';x.lineWidth=1.6;x.beginPath();x.moveTo(fx(-0.08),ty(1.52));x.quadraticCurveTo(fx(0),ty(1.12),fx(0.08),ty(1.52));x.stroke();
  const cy=ty(1.215),r=Math.abs(fx(0.034)-fx(0)),mg=x.createRadialGradient(fx(-0.008),cy-r*0.3,0,fx(0),cy,r);mg.addColorStop(0,'#fff4c0');mg.addColorStop(0.55,'#f0c050');mg.addColorStop(1,'#8a5a14');x.fillStyle=mg;x.beginPath();x.arc(fx(0),cy,r,0,6.3);x.fill();
  x.strokeStyle='#8a5a14';x.lineWidth=1.2;x.beginPath();x.arc(fx(0),cy,r*0.72,0,6.3);x.stroke();x.fillStyle='#a8741c';x.fillRect(fx(0)-1,cy-r*0.45,2,r*0.9);x.fillRect(fx(0)-r*0.3,cy-r*0.15,r*0.6,2);}
 if(!B.tie)line([[fx(0.004),ty(1.4)],[fx(0.004),ty(1.12)]],1.5,'rgba(60,35,45,.6)');if(!B.tie&&!B.chain)for(const Y of [1.36,1.28,1.2]){x.fillStyle='#efe6d6';x.beginPath();x.arc(fx(0.012),ty(Y),2.2,0,6.3);x.fill();}
 x.restore();
 /* lapels: wide notch lapels with drop shadow, ink edge, pick-stitching and a buttonhole */
 for(const sd of [-1,1]){const L=[];for(let Y=1.17;Y<=1.455;Y+=0.015)L.push([fx(sd*V(Y)),ty(Y)]);const R=[];for(let Y=1.455;Y>=1.17;Y-=0.015)R.push([fx(sd*(V(Y)+0.078)),ty(Y)]);
  x.save();x.translate(sd*3,3);x.fillStyle=SHc(.4);x.beginPath();x.moveTo(...L[0]);for(const p of L)x.lineTo(...p);for(const p of R)x.lineTo(...p);x.closePath();x.fill();x.restore();
  const lg=x.createLinearGradient(fx(sd*0.05),0,fx(sd*0.2),0);lg.addColorStop(0,rgb(LAV.map(v=>Math.min(255,v*1.1))));lg.addColorStop(1,rgb(LAV.map(v=>v*0.95)));x.fillStyle=lg;
  x.beginPath();x.moveTo(...L[0]);for(const p of L)x.lineTo(...p);for(const p of R)x.lineTo(...p);x.closePath();x.fill();x.strokeStyle=INK;x.lineWidth=2.5;x.stroke();
  const st=[];for(let Y=1.19;Y<=1.44;Y+=0.015)st.push([fx(sd*(V(Y)+0.068)),ty(Y)]);stitch(st);
  x.fillStyle=rgb(LAVD);x.beginPath();x.moveTo(fx(sd*(V(1.41)+0.078)),ty(1.41));x.lineTo(fx(sd*(V(1.41)+0.106)),ty(1.425));x.lineTo(fx(sd*(V(1.41)+0.078)),ty(1.445));x.fill();
  if(sd>0)line([[fx(V(1.34)+0.03),ty(1.345)],[fx(V(1.34)+0.055),ty(1.35)]],2,'rgba(50,30,90,.8)');
  /* shirt collar points lying over the lapels */
  x.save();x.translate(sd*2,2);x.fillStyle='rgba(30,10,30,.35)';x.beginPath();x.moveTo(fx(sd*0.02),ty(1.385));x.lineTo(fx(sd*0.128),ty(1.432));x.lineTo(fx(sd*0.072),ty(1.5));x.closePath();x.fill();x.restore();
  x.beginPath();x.moveTo(fx(sd*0.02),ty(1.385));x.lineTo(fx(sd*0.128),ty(1.432));x.lineTo(fx(sd*0.072),ty(1.5));x.closePath();x.fillStyle=pp;x.fill();x.strokeStyle='rgba(60,30,50,.85)';x.lineWidth=2;x.stroke();}
 /* front: two buttons with thread, front edge stitching, opening below the button */
 line([[fx(0),ty(1.02)],[fx(-0.07),ty(0.8)]],2,INK);line([[fx(0.006),ty(1.02)],[fx(0.075),ty(0.8)]],2,INK);stitch([[fx(-0.012),ty(1.0)],[fx(-0.074),ty(0.81)]]);
 for(const Y of [1.07,0.97]){x.fillStyle='rgba(30,15,50,.4)';x.beginPath();x.arc(fx(0)+1,ty(Y)+1.5,5,0,6.3);x.fill();x.fillStyle='#4a3866';x.beginPath();x.arc(fx(0),ty(Y),4.6,0,6.3);x.fill();x.fillStyle='rgba(255,255,255,.4)';x.beginPath();x.arc(fx(0)-1.5,ty(Y)-1.5,1.6,0,6.3);x.fill();x.fillStyle='#211530';for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]])x.fillRect(fx(0)+dx*1.4-0.6,ty(Y)+dy*1.4-0.6,1.2,1.2);}
 /* flap pockets with shadow + ticket pocket */
 for(const sd of [-1,1]){const px=fx(sd*0.15);x.fillStyle=SHc(.35);x.fillRect(px-23,ty(0.985)+10,46,4);x.fillStyle=rgb(LAV.map(v=>v*0.97));x.fillRect(px-23,ty(0.985)-2,46,13);x.strokeStyle=INK;x.lineWidth=1.6;x.strokeRect(px-23,ty(0.985)-2,46,13);stitch([[px-20,ty(0.985)+8],[px+20,ty(0.985)+8]]);}
 x.fillStyle=rgb(LAV.map(v=>v*0.97));x.fillRect(fx(0.15)-14,ty(1.04)-1,28,8);x.strokeStyle=INK;x.lineWidth=1.2;x.strokeRect(fx(0.15)-14,ty(1.04)-1,28,8);
 /* breast pocket welt + folded white pocket square, gold lapel pin */
 x.fillStyle=SHc(.35);x.fillRect(fx(0.09),ty(1.32),fx(0.17)-fx(0.09),4);line([[fx(0.09),ty(1.32)],[fx(0.17),ty(1.315)]],1.8,INK);
 x.fillStyle=B.square||'#f4f1ea';x.beginPath();x.moveTo(fx(0.095),ty(1.322));x.lineTo(fx(0.108),ty(1.362));x.lineTo(fx(0.122),ty(1.335));x.lineTo(fx(0.138),ty(1.37));x.lineTo(fx(0.162),ty(1.318));x.fill();x.strokeStyle='rgba(120,110,130,.7)';x.lineWidth=1;x.stroke();
 if(B.pin!==false){x.fillStyle='#8a5a14';x.beginPath();x.arc(fx(0.118)+1,ty(1.39)+1,5,0,6.3);x.fill();const pg=x.createRadialGradient(fx(0.116),ty(1.392),0,fx(0.118),ty(1.39),5);pg.addColorStop(0,'#fff6c8');pg.addColorStop(0.5,'#f0c050');pg.addColorStop(1,'#a06a14');x.fillStyle=pg;x.beginPath();x.arc(fx(0.118),ty(1.39),4.6,0,6.3);x.fill();}
 /* back: collar band, centre seam, vent */
 x.fillStyle='rgba(60,40,100,.35)';x.fillRect(0,0,70,12);x.fillRect(W-70,0,70,12);line([[3,ty(0.95)],[10,ty(0.95)],[10,ROW.t]],1.5,'rgba(60,40,100,.6)');
 /* hem: shadow + stitch */
 x.fillStyle=SHc(.35);x.fillRect(0,ROW.t-8,W,8);stitch([[0,ROW.t-11],[W,ROW.t-11]]);
 /* ---- sleeves (u: 0.5 = front/inner elbow, 0.75 = outer side) ---- */
 fabric(ROW.s0,ROW.s1,LAV);const sr=v=>ROW.s0+v*(ROW.s1-ROW.s0);
 blob(128,sr(0.1),90,26,SHc(.35));blob(384,sr(0.05),90,20,'rgba(255,255,255,.12)');
 for(let k=0;k<3;k++){x.strokeStyle='rgba(50,30,90,.3)';x.lineWidth=2;x.beginPath();x.moveTo(230,sr(0.52+k*0.04));x.quadraticCurveTo(256,sr(0.56+k*0.04),282,sr(0.52+k*0.04));x.stroke();}
 line([[128,ROW.s0],[128,ROW.s1]],2,SEAM);x.fillStyle=SHc(.35);x.fillRect(0,ROW.s1-8,W,8);stitch([[0,ROW.s1-10],[W,ROW.s1-10]]);
 for(let i=0;i<4;i++){const bx=372+i*8,by=ROW.s1-17;x.fillStyle='rgba(30,15,50,.4)';x.beginPath();x.arc(bx+1,by+1,3,0,6.3);x.fill();x.fillStyle='#4a3866';x.beginPath();x.arc(bx,by,2.8,0,6.3);x.fill();}
 /* ---- cuffs: paisley with an edge ---- */
 x.fillStyle=pp;x.fillRect(0,ROW.c0,W,ROW.c1-ROW.c0);x.fillStyle='rgba(40,20,40,.35)';x.fillRect(0,ROW.c0,W,3);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(0,ROW.c1-3,W,2);
 /* ---- swatches: skin (hands), gold bracelet links, watch dial, shoe leather ---- */
 const g=x.createLinearGradient(0,ROW.w0,0,ROW.w1);g.addColorStop(0,rgb(SKIN.map(v=>v*1.06)));g.addColorStop(1,rgb(SKIN.map(v=>v*0.84)));x.fillStyle=g;x.fillRect(0,ROW.w0,150,40);
 x.strokeStyle='rgba(110,60,40,.55)';x.lineWidth=1.5;for(let i=0;i<4;i++){x.beginPath();x.moveTo(26+i*32,ROW.w0+8);x.quadraticCurveTo(30+i*32,ROW.w0+20,26+i*32,ROW.w0+34);x.stroke();}
 const gg=x.createLinearGradient(0,ROW.w0,0,ROW.w1);gg.addColorStop(0,'#fff4c0');gg.addColorStop(0.35,'#f0c050');gg.addColorStop(0.7,'#c08a24');gg.addColorStop(1,'#7a4e10');x.fillStyle=gg;x.fillRect(150,ROW.w0,140,40);
 for(let i=150;i<290;i+=7){x.fillStyle='rgba(90,55,10,.75)';x.fillRect(i,ROW.w0,1.5,40);x.fillStyle='rgba(255,250,210,.5)';x.fillRect(i+2,ROW.w0,1,40);}
 /* dial (40x40): champagne face, gold bezel, hour markers, hands */
 const dx=310,dy=ROW.w0+20;x.fillStyle=gg;x.fillRect(290,ROW.w0,40,40);x.fillStyle='#e9dcb4';x.beginPath();x.arc(dx,dy,14,0,6.3);x.fill();x.strokeStyle='#8a5a14';x.lineWidth=2;x.stroke();
 for(let k=0;k<12;k++){const a=k*Math.PI/6;x.strokeStyle=k%3?'#9a7a3a':'#5a3a10';x.lineWidth=k%3?1:2;x.beginPath();x.moveTo(dx+Math.sin(a)*10,dy-Math.cos(a)*10);x.lineTo(dx+Math.sin(a)*13,dy-Math.cos(a)*13);x.stroke();}
 x.strokeStyle='#2a1a08';x.lineWidth=2;x.beginPath();x.moveTo(dx,dy);x.lineTo(dx+6,dy-5);x.moveTo(dx,dy);x.lineTo(dx-2,dy-10);x.stroke();x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(dx-4,dy-5,6,3,-0.6,0,6.3);x.fill();
 /* shoe leather: u wraps the shoe (0.5 = top), v runs heel->toe */
 const sl=x.createLinearGradient(330,0,512,0);const SC=B.shoe||[42,36,48];sl.addColorStop(0,rgb(SC.map(v=>v*0.3)));sl.addColorStop(0.18,rgb(SC.map(v=>v*0.65)));sl.addColorStop(0.5,rgb(SC));sl.addColorStop(0.82,rgb(SC.map(v=>v*0.65)));sl.addColorStop(1,rgb(SC.map(v=>v*0.3)));x.fillStyle=sl;x.fillRect(330,ROW.w0,182,40);
 x.fillStyle='rgba(255,255,255,.35)';x.fillRect(410,ROW.w0+24,20,10);x.fillStyle='#3a2414';x.fillRect(330,ROW.w0,10,40);x.fillRect(502,ROW.w0,10,40);stitch([[345,ROW.w0+2],[345,ROW.w1-2]],'rgba(120,100,90,.6)');stitch([[497,ROW.w0+2],[497,ROW.w1-2]],'rgba(120,100,90,.6)');
 /* ---- trousers (v: hip -> ankle) ---- */
 fabric(ROW.p0,ROW.p1,PANTS);const pr=v=>ROW.p0+v*(ROW.p1-ROW.p0);
 line([[256,ROW.p0],[256,ROW.p1]],1.6,'rgba(255,255,255,.35)');line([[258,ROW.p0],[258,ROW.p1]],1.2,'rgba(60,40,100,.45)');line([[2,ROW.p0],[2,ROW.p1]],2,SEAM);line([[128,ROW.p0],[128,ROW.p1]],2,SEAM);line([[384,ROW.p0],[384,ROW.p1]],2,SEAM);
 for(let k=0;k<3;k++){x.strokeStyle='rgba(50,30,90,.28)';x.lineWidth=2;x.beginPath();x.moveTo(220,pr(0.5+k*0.03));x.quadraticCurveTo(256,pr(0.53+k*0.03),292,pr(0.5+k*0.03));x.stroke();}
 blob(256,pr(0.95),80,6,SHc(.4));x.fillStyle=SHc(.35);x.fillRect(0,ROW.p1-4,W,4);
 return c;}
/* ================= LOW-POLY MESH BUILDER ================= */
function newMesh(){return{p:[],uv:[],bi:[],bw:[],idx:[],grp:[]};}
let GRP=0;
function addV(M,p,uv,w){M.p.push(...p);M.uv.push(...uv);const ws=w.slice(0,4);while(ws.length<4)ws.push([0,0]);let s=0;for(const q of ws)s+=q[1];for(const q of ws){M.bi.push(q[0]);M.bw.push(q[1]/s);}M.grp.push(GRP);return M.p.length/3-1;}
function tri(M,a,b,c,out){const P=i=>[M.p[i*3],M.p[i*3+1],M.p[i*3+2]];const n=V.cross(V.sub(P(b),P(a)),V.sub(P(c),P(a)));if(out&&V.dot(n,out)<0)M.idx.push(a,c,b);else M.idx.push(a,b,c);}
/* loft rings: ring = {c, s(side), f(front), rx, rz, v, w, mod, sq} ; u wraps 0..1 with the front (phi=0) at u=0.5 */
function loft(M,rings,segs,o={}){GRP++;const u0=o.u0||0,u1=o.u1===undefined?1:o.u1,ph0=o.ph0||0;const id=[];
 for(const r of rings){const row=[];for(let i=0;i<=segs;i++){const ph=-Math.PI+2*Math.PI*i/segs+ph0;let sn=Math.sin(ph),cs=Math.cos(ph);if(r.sq){sn=Math.sign(sn)*Math.pow(Math.abs(sn),r.sq);cs=Math.sign(cs)*Math.pow(Math.abs(cs),r.sq);}
   let p=V.add(r.c,V.add(V.mul(r.s,sn*r.rx),V.mul(r.f,cs*r.rz)));if(r.mod)p=r.mod(p,ph,r);row.push(addV(M,p,o.uvf?o.uvf(i/segs,r):[lerp(u0,u1,i/segs),r.v],r.wm?r.wm(p,ph,r):r.w));}id.push(row);}
 for(let k=0;k<rings.length-1;k++)for(let i=0;i<segs;i++){const a=id[k][i],b=id[k][i+1],c=id[k+1][i+1],d=id[k+1][i];const cen=V.mul(V.add(rings[k].c,rings[k+1].c),0.5),P=j=>[M.p[j*3],M.p[j*3+1],M.p[j*3+2]];const out=V.sub(V.mul(V.add(V.add(P(a),P(b)),V.add(P(c),P(d))),0.25),cen);tri(M,a,b,c,out);tri(M,a,c,d,out);}
 const cap=(k,dir,uv,lift)=>{const r=rings[k],cc=addV(M,V.add(r.c,V.mul(dir,lift||0)),uv||[0.5,r.v],r.w);for(let i=0;i<segs;i++)tri(M,id[k][i],id[k][i+1],cc,dir);};
 if(o.capA)cap(0,o.capA.dir,o.capA.uv,o.capA.lift);if(o.capB)cap(rings.length-1,o.capB.dir,o.capB.uv,o.capB.lift);return id;}
/* textured disc (watch dial): uv laid out around a centre in the texture */
function disc(M,c,n,a,b,r,segs,uvc,uvr,w){GRP++;const cc=addV(M,c,uvc,w),rim=[];for(let i=0;i<=segs;i++){const t=i/segs*2*Math.PI;rim.push(addV(M,V.add(c,V.add(V.mul(a,Math.cos(t)*r),V.mul(b,Math.sin(t)*r))),[uvc[0]+Math.cos(t)*uvr,uvc[1]-Math.sin(t)*uvr],w));}for(let i=0;i<segs;i++)tri(M,cc,rim[i],rim[i+1],n);}
const W1=b=>[[b,1]],W2=(a,b,t)=>[[a,1-t],[b,t]];
/* body-parameter sets on the shared skeleton and animation set.
   fem: athletic 80s proportions (not exaggerated): narrower sloped shoulders, defined waist, wider hips, slimmer limbs with a calf,
   knees slightly in (Q-angle), smaller hands and feet, slimmer neck, a little shorter; walks and stands with the 'fem' gait. */
const BODYP={
 male:{torso:null,bust:null,segs:16,arm:[1,1,1,1,1,1],cuff:1,shIn:0,leg:[1,1,1,1,1,1,1],legX:r=>1+(0.92-r)*0.12,footX:0.112,hand:1,foot:1,neck:1,glute:0,gait:'male',scale:[1,1,1]},
 fem:{torso:[[0.8,0.242,0.172,0],[0.9,0.256,0.182,-0.014],[1.0,0.200,0.144,0.006],[1.1,0.146,0.112,0.012],[1.2,0.186,0.144,0.016],[1.28,0.212,0.160,0.022],[1.36,0.210,0.142,0.008],[1.42,0.192,0.122,-0.004],[1.465,0.15,0.102,-0.012],[1.51,0.078,0.078,-0.014]],
  bust:{1.2:0.052,1.28:0.118,1.36:0.060},segs:20,arm:[0.86,0.84,0.8,0.78,0.76,0.72],cuff:0.74,shIn:0.022,leg:[1.20,1.14,0.98,0.82,0.92,0.74,0.7],
  legX:r=>r>0.51?1-(0.92-r)/0.41*0.09:0.91+(0.51-r)/0.41*0.07,footX:0.1,hand:0.86,foot:0.86,neck:0.84,glute:0.064,gait:'fem',scale:[0.92,0.96,0.92]}};
/* scale vertices [v0,v1) about a point (per-axis factors) */
function scaleAbout(M,v0,v1,c,k){for(let i=v0;i<v1;i++)for(let a=0;a<3;a++)M.p[i*3+a]=c[a]+(M.p[i*3+a]-c[a])*k[a];}
/* head-parameter sets: jaw rows y:[rx k, rz k, min roundness]; face relief (nose/brow/chin) offsets by ring */
const HEADP={
 male:{nose:{1.652:0.012,1.677:0.016,1.702:0.006},brow:{1.727:0.008},chin:{1.605:0.012,1.585:0.006}},
 fem:{jaw:{1.555:[0.86,0.9,1],1.585:[0.86,0.92,0.95],1.605:[0.88,0.95,0.92],1.628:[0.92,0.97,0.92],1.652:[0.96,0.98,0.92],1.677:[0.99,1,0.92]},
  nose:{1.652:0.008,1.677:0.011,1.702:0.004},brow:{1.727:0.003},chin:{1.605:0.006,1.585:0.007}}};
/* hair shell: rows [y,rx,rz,z]; the face side is tucked inside the head below `open` so the hair frames the face; `curl` adds perm texture */
function hairShell(M,rows,segs,o){const hu=[144/512,3/512],open=o.open||0,c0=o.c0||0.3,curl=o.curl||0,fq=o.fq||1,sh=o.k0===undefined?0.45:o.k0;
 const wy=y=>y>1.6?W1(BI.head):y>1.52?W2(BI.neck,BI.head,(y-1.52)/0.08):y>1.44?W2(BI.chest,BI.neck,(y-1.44)/0.08):W1(BI.chest);
 loft(M,rows.map(r=>({c:[0,r[0],r[3]],s:[1,0,0],f:[0,0,1],rx:r[1],rz:r[2],w:wy(r[0]),v:hu[1],mod:(p,ph)=>{const c=Math.cos(ph),n=1+curl*(Math.sin(ph*9*fq+r[0]*120*fq)*0.6+Math.sin(ph*5*fq-r[0]*70*fq)*0.4);
  let k=n;if(r[0]<open){const t=clamp((c-c0)/0.3,0,1);k*=1-sh*t*t*(3-2*t);}p[0]*=k;p[2]=r[3]+(p[2]-r[3])*k;return p;}})),segs,{uvf:()=>hu,capA:o.top?{dir:[0,1,0],uv:hu}:undefined,capB:o.bottom?{dir:[0,-1,0],uv:hu}:undefined});}
/* feathered face-framing lock (80s flick): a tapered strand from the temple down past the jaw, curling outward at the tip */
function hairLock(M,s,pts){const hu=[144/512,3/512];loft(M,pts.map(q=>({c:[s*q[0],q[1],q[2]],s:[1,0,0],f:[0,0,1],rx:q[3],rz:q[3]*0.7,v:hu[1],w:q[1]>1.6?W1(BI.head):W2(BI.neck,BI.head,clamp((q[1]-1.5)/0.1,0,1))})),6,{uvf:()=>hu,capA:{dir:[0,1,0],uv:hu},capB:{dir:[0,-1,0],uv:hu}});}
/* a thin hanging strand (box braids): a tapered loft through pts [x,y,z,r], weighted head -> neck -> chest as it falls, with a little bead at the tip */
function hairBraid(M,pts){const hu=[144/512,3/512],wy=y=>y>1.6?W1(BI.head):y>1.52?W2(BI.neck,BI.head,(y-1.52)/0.08):y>1.44?W2(BI.chest,BI.neck,(y-1.44)/0.08):W1(BI.chest);
 loft(M,pts.map(q=>({c:[q[0],q[1],q[2]],s:[1,0,0],f:[0,0,1],rx:q[3],rz:q[3],v:hu[1],w:wy(q[1])})),3,{uvf:()=>hu,capB:{dir:[0,-1,0],uv:hu}});}/* the top end is buried in the braided cap, so only the tip is capped */
/* torso profile rows [y, rx, rz, zc, weights] after body params, shoulders and belly (shared by the body and the armour shell) */
function torsoRows(B){const BP=B.fem?BODYP.fem:BODYP.male;
 const T=[[0.8,0.206,0.143,0,W1(BI.pelvis)],[0.9,0.207,0.145,0,W1(BI.pelvis)],[1.0,0.2,0.147,0.008,W2(BI.pelvis,BI.spine,0.5)],[1.1,0.21,0.152,0.014,W1(BI.spine)],
  [1.22,0.236,0.158,0.012,W2(BI.spine,BI.chest,0.6)],[1.33,0.252,0.158,0.008,W1(BI.chest)],[1.415,0.24,0.142,-0.004,W1(BI.chest)],[1.465,0.192,0.118,-0.012,W1(BI.chest)],[1.51,0.098,0.092,-0.014,W2(BI.chest,BI.neck,0.3)]];
 /* women: the BODYP.fem torso (wider hips, defined waist, soft bust, narrower sloped shoulders; fully clothed) */
 if(BP.torso){const tw=y=>y<0.95?W1(BI.pelvis):y<1.05?W2(BI.pelvis,BI.spine,0.5):y<1.15?W1(BI.spine):y<1.25?W2(BI.spine,BI.chest,0.6):y<1.5?W1(BI.chest):W2(BI.chest,BI.neck,0.3);T.splice(0,T.length,...BP.torso.map(r=>[r[0],r[1],r[2],r[3],tw(r[0])]));}
 const SHx=B.shoulders||0,BEL=B.belly||0;for(const r of T){const y=r[0],up=clamp((y-1.15)/0.25,0,1)*(y>1.48?0.4:1);r[1]*=1+SHx*up;const bb=Math.exp(-Math.pow((y-1.02)/0.14,2));r[2]+=BEL*bb;r[3]+=BEL*0.6*bb;r[1]+=BEL*0.35*bb;}
 if(B.pads)for(const r of T)if(r[0]>1.3&&r[0]<1.5)r[1]*=r[0]>1.44?1.1:1.06;
 return T;}
function buildBody(B){const M=newMesh(),X=[1,0,0],Y=[0,1,0],Z=[0,0,1],BP=B.fem?BODYP.fem:BODYP.male;
 const tv=y=>((TY1-y)/(TY1-TY0)*ROW.t)/512;
 /* torso: big frame, chest wider than the hips, padded 80s shoulders, open collar */
 /* dancers: fuller bust and seat, capped and spread over three rows so a big figure stays round instead of coming to a point */
 /* sizes: bustK / hipK run about 0.6 (petite) to 1.6 (very full); the mapping spreads them so a small one really is small */
 const cv=B.curve||1,sz=k=>Math.max(0.3,0.35+((k||1)-0.62)*1.4),bM = B.dancer ? Math.min(2.6,1.3*(0.8+0.2*cv)*sz(B.bustK)) : 1.15;
 const gM = B.dancer ? Math.min(2.7,1.75*(0.75+0.25*cv)*Math.max(0.35,0.4+((B.hipK||1)-0.6)*1.32)) : 1.25;
 /* dancers: a cinched waist (narrowest at the navel, easing out into the ribs and the hips) */
 const wq=y=>B.dancer?1-(1-(B.waist||1))*Math.exp(-Math.pow((y-1.1)/0.085,2)):1;
 const T=torsoRows(B), SHx=B.shoulders||0;
 /* women: a round bust. An extra ring through the chest (and one through the seat) so the profile is a dome, not a cone: full and round underneath, a gentle
    slope on top, each side a rounded mound (bigger sizes sit a little lower and wider) */
 if(B.fem){for(const y of [0.85,1.25]){const i=T.findIndex(r=>r[0]>y);if(i<1)continue;const a=T[i-1],b=T[i],k=(y-a[0])/(b[0]-a[0]);
   T.splice(i,0,[y,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k,a[3]+(b[3]-a[3])*k,k<0.5?a[4]:b[4]]);}}
 const bPk=(B.dancer?0.112:0.118)*bM,bs=bM/1.4,bY=1.285-0.018*Math.max(0,bs-1),bLo=0.085+0.022*bs,bHi=0.125+0.02*bs,bX=0.38+0.03*Math.max(0,bs-1);
 const bustAt=(y,ph)=>{const t=(y-bY)/(y<bY?bLo:bHi);if(t*t>=1)return 0;const v=y<bY?Math.pow(1-t*t,0.45):Math.pow(1-t*t,1.15);
  const c=Math.cos(ph);if(c<=0)return 0;const u=(Math.abs(Math.sin(ph))-bX)/0.4,dome=u*u<1?Math.pow(1-u*u,0.55):0;return bPk*v*Math.pow(c,0.7)*(0.88*dome+0.12*Math.exp(-Math.pow(Math.sin(ph)/0.3,2)));};
 /* the seat: a round dome too, fullest a little below the middle of the hips, curving under into the legs instead of coming to a ridge */
 const gluteAt=y=>{const t=(y-0.885)/0.13;if(t*t>=1)return 0;return Math.pow(1-t*t,y<0.885?0.5:0.8);};
 /* across the back: two round cheeks either side of the centre line, the fullness wrapping well round the sides so it reads as a
    bubble from behind and in profile rather than a shelf; seatAt is 0..1 and also sets how much each vertex follows the soft cheek bones */
 const seatAt=(y,ph)=>{const yw=gluteAt(y),c=-Math.cos(ph);if(yw<=0||c<=0)return 0;const u=(Math.abs(Math.sin(ph))-0.33)/0.42,dome=u*u<1?Math.pow(1-u*u,0.6):0;return yw*Math.pow(c,0.6)*(0.3+0.7*dome);};
 const softW=B.fem&&BP.glute?(p,ph,r)=>{const f=0.9*seatAt(r.y0,ph)*(B.skirt?0.35:1);if(f<=0.01)return r.w;const sL=clamp(0.5+p[0]/0.05,0,1);return r.w.map(q=>[q[0],q[1]*(1-f)]).concat([[SOFT_L,f*sL],[SOFT_R,f*(1-sL)]]);}:null;
 loft(M,T.map(r=>({c:[0,r[0],r[3]],s:X,f:Z,y0:r[0],wm:softW,rx:r[1]*(B.dancer&&r[0]<0.96?1+0.12*cv*(B.hipK||1):1)*wq(r[0]),rz:r[2]*(0.4+0.6*wq(r[0])),v:tv(r[0]),w:r[4],mod:(p,ph)=>{if(r[0]>1.44&&r[0]<1.48){p[1]+=0.006*Math.cos(2*ph);}if(B.fem){p[2]+=bustAt(r[0],ph);if(BP.glute){const f=seatAt(r[0],ph);if(f>0){p[2]-=0.85*BP.glute*gM*f;p[1]-=0.01*f;}}return p;}if(Math.cos(ph)>0.2&&r[0]>1.05&&r[0]<1.4)p[2]+=0.008*Math.cos(ph);return p;}})),BP.segs,{capA:{dir:[0,-1,0],uv:[0.5,0.555]},capB:{dir:[0,1,0],uv:[0.5,0.002],lift:-0.012}});
 /* lapel ridge: a thin raised strip so the lapels catch light (PS2 games modelled these as a few polys) */
 if(!B.fem)for(const s of [1,-1]){GRP++;const pts=[];for(const Y of [1.18,1.3,1.45]){const vw=0.012+(Y-1.12)*0.36,xx=s*(vw+0.04),zz=Math.sqrt(Math.max(0,1-Math.pow(xx/(Y>1.38?0.24:0.25),2)))*0.156+0.008+(Y<1.4?0.008:0);pts.push([xx,Y,zz]);}
  const uvp=p=>[0.5+p[0]*340/512,((TY1-p[1])/(TY1-TY0)*ROW.t)/512];const w=W1(BI.chest),ids=[];for(const p of pts){ids.push(addV(M,V.add(p,[-s*0.03,0,0.004]),uvp(V.add(p,[-s*0.03,0,0])),w),addV(M,V.add(p,[s*0.03,0,0.006]),uvp(V.add(p,[s*0.03,0,0])),w));}
  for(let k=0;k<2;k++){const a=ids[k*2],b=ids[k*2+1],c=ids[k*2+3],d=ids[k*2+2];tri(M,a,b,c,[0,0,1]);tri(M,a,c,d,[0,0,1]);}}
 /* open shirt collar band standing around the back of the neck */
 if(!B.fem)loft(M,[{c:[0,1.49,-0.012],rx:0.1,rz:0.094},{c:[0,1.535,-0.02],rx:0.096,rz:0.09}].map((r,k)=>Object.assign(r,{s:X,f:Z,w:W2(BI.chest,BI.neck,0.4),v:(ROW.c0+2+k*15)/512,mod:(p,ph)=>{if(Math.cos(ph)>0.55)p[1]-=(Math.cos(ph)-0.55)*0.09*(k);return p;}})),12,{u0:0,u1:1});
 /* arms */
 for(const s of [1,-1]){const v0=M.p.length/3;const sh=s>0?SH:mir(SH),el=s>0?EL:mir(EL),wr=s>0?WR:mir(WR),ad=[AD[0]*s,AD[1],0],side=V.norm(V.cross(ad,Z)).map(v=>-v*s),fwd=Z;
  const ua=BI[s>0?'uarmL':'uarmR'],fa=BI[s>0?'farmL':'farmR'],hb=BI[s>0?'handL':'handR'];const sv=t=>(ROW.s0+t*(ROW.s1-ROW.s0))/512;
  const at=(base,dir,t)=>V.add(base,V.mul(dir,t));
  loft(M,[{c:V.add(at(sh,ad,0.0),[-s*0.012,-0.012,0]),rx:0.074,rz:0.08,v:sv(0),w:[[ua,0.6],[BI.chest,0.4]]},{c:at(sh,ad,0.06),rx:0.082,rz:0.084,v:sv(0.15),w:W1(ua)},{c:at(sh,ad,0.2),rx:0.076,rz:0.078,v:sv(0.4),w:W1(ua)},
   {c:el,rx:0.068,rz:0.07,v:sv(0.55),w:W2(ua,fa,0.5)},{c:at(el,ad,0.1),rx:0.064,rz:0.064,v:sv(0.72),w:W1(fa)},{c:at(wr,ad,-0.02),rx:0.056,rz:0.057,v:sv(0.98),w:W1(fa)}].map((r,k)=>Object.assign(r,{s:side,f:fwd,rx:r.rx*BP.arm[k],rz:r.rz*BP.arm[k]})),8,{u0:0,u1:1});
  loft(M,[{c:at(wr,ad,-0.035),rx:0.05,rz:0.051,v:(ROW.c0+1)/512,w:W1(fa)},{c:at(wr,ad,0.012),rx:0.049,rz:0.05,v:(ROW.c1-1)/512,w:W2(fa,hb,0.3)}].map(r=>Object.assign(r,{s:side,f:fwd,rx:r.rx*BP.cuff,rz:r.rz*BP.cuff})),8,{u0:0,u1:1});
  if(!B.nowatch&&s===(B.watch||1)){/* gold watch: link bracelet, raised case with bezel, champagne dial, crown */
   const gv=SW.gold[1];loft(M,[{c:at(wr,ad,-0.064),rx:0.058,rz:0.059},{c:at(wr,ad,-0.034),rx:0.058,rz:0.059}].map(r=>Object.assign(r,{s:side,f:fwd,w:W1(fa),v:gv})),12,{uvf:(u,r)=>[150/512+u*140/512,r===undefined?gv:gv]});
   const cc=at(at(wr,ad,-0.049),side,0.058),ax=V.norm(ad),bx=fwd;
   loft(M,[{c:cc,rx:0.029,rz:0.029},{c:at(cc,side,0.013),rx:0.029,rz:0.029},{c:at(cc,side,0.015),rx:0.025,rz:0.025}].map(r=>Object.assign(r,{s:ax,f:bx,w:W1(fa),v:gv})),12,{uvf:()=>[0.36,gv]});
   disc(M,at(cc,side,0.0155),side,ax,bx,0.023,14,SW.dial,16/512,W1(fa));
   loft(M,[{c:at(at(cc,side,0.006),bx,0.028),rx:0.005,rz:0.005},{c:at(at(cc,side,0.006),bx,0.036),rx:0.004,rz:0.004}].map(r=>Object.assign(r,{s:ax,f:side,w:W1(fa),v:gv})),6,{uvf:()=>[0.36,gv],capB:{dir:bx,uv:[0.36,gv]}});}
  if(B.bracelet&&s!==(B.watch||1)){/* gold ID bracelet: chunky curb links and a name plate */
   const gv=SW.gold[1];loft(M,[{c:at(wr,ad,-0.062),rx:0.061,rz:0.062},{c:at(wr,ad,-0.04),rx:0.061,rz:0.062}].map(r=>Object.assign(r,{s:side,f:fwd,w:W1(fa),v:gv})),10,{uvf:(u,r)=>[150/512+u*140/512,gv]});
   const pc=at(at(wr,ad,-0.051),side,0.062);loft(M,[{c:pc,rx:0.012,rz:0.024},{c:at(pc,side,0.008),rx:0.012,rz:0.024}].map(r=>Object.assign(r,{s:V.norm(ad),f:fwd,w:W1(fa),v:gv})),8,{uvf:()=>[0.36,gv],capB:{dir:side,uv:[0.36,gv]}});}
  {/* fist: palm block, four curled fingers, thumb across the front; gold knuckle duster rings around the fingers */
   const f0=M.p.length/3,pm=V.mul(side,-1),Zv=[0,0,1],hw=W1(hb),sk=()=>SW.skin,gv=SW.gold[1],gu=()=>[0.36,gv];
   const P=(ta,tp,tz)=>V.add(V.add(at(wr,ad,ta),V.mul(pm,tp)),V.mul(Zv,tz));
   loft(M,[[0,0.024,0.038],[0.03,0.026,0.046],[0.07,0.025,0.048],[0.093,0.022,0.046]].map(q=>({c:P(q[0],0,0),s:pm,f:Zv,rx:q[1],rz:q[2],sq:0.6,w:hw,v:SW.skin[1]})),8,{uvf:u=>[0.02+u*0.26,SW.skin[1]],capB:{dir:ad,uv:sk(),lift:0.004}});
   const FZ=[0.034,0.0113,-0.0113,-0.034];
   for(const fz of FZ){const r0=fz===FZ[3]?0.0098:0.0112;
    loft(M,[{c:P(0.1,-0.016,fz),rx:r0,rz:r0*0.92},{c:P(0.104,0.03,fz),rx:r0,rz:r0*0.92}].map(r=>Object.assign(r,{s:ad,f:Zv,w:hw,v:SW.skin[1]})),6,{uvf:sk,capA:{dir:V.mul(pm,-1),uv:sk(),lift:0.006},capB:{dir:pm,uv:sk(),lift:0.006}});
    loft(M,[{c:P(0.104,0.034,fz),rx:r0*0.95,rz:r0*0.9},{c:P(0.066,0.036,fz),rx:r0*0.85,rz:r0*0.85}].map(r=>Object.assign(r,{s:pm,f:Zv,w:hw,v:SW.skin[1]})),6,{uvf:sk,capB:{dir:V.mul(ad,-1),uv:sk(),lift:0.005}});
    /* duster finger ring: open band around the finger */
    if(B.rings&&(fz===FZ[2]||fz===FZ[1]&&B.rings>1))loft(M,[{c:P(0.1,0.004,fz),rx:0.0128,rz:0.0122},{c:P(0.1,0.014,fz),rx:0.0128,rz:0.0122}].map(r=>Object.assign(r,{s:ad,f:Zv,w:hw,v:gv})),8,{uvf:gu});
    if(B.dusters)loft(M,[{c:P(0.1,-0.006,fz),rx:0.0158,rz:0.0128},{c:P(0.1,0.012,fz),rx:0.0158,rz:0.0128}].map(r=>Object.assign(r,{s:ad,f:Zv,w:hw,v:gv})),10,{uvf:gu});
    /* spike on the punching face */
    if(B.dusters)loft(M,[{c:P(0.117,0.003,fz),rx:0.0055,rz:0.0055},{c:P(0.133,0.003,fz),rx:0.001,rz:0.001}].map(r=>Object.assign(r,{s:pm,f:Zv,w:hw,v:gv})),5,{uvf:gu});}
   if(B.dusters){
   /* duster frame: front bridge joining the rings + grip bar in the palm */
   loft(M,[{c:P(0.112,0.003,0.05),rx:0.0055,rz:0.009},{c:P(0.112,0.003,-0.05),rx:0.0055,rz:0.009}].map(r=>Object.assign(r,{s:ad,f:pm,w:hw,v:gv})),6,{uvf:gu,capA:{dir:Zv,uv:gu()},capB:{dir:V.mul(Zv,-1),uv:gu()}});
   loft(M,[{c:P(0.056,0.032,0.044),rx:0.007,rz:0.008},{c:P(0.056,0.032,-0.044),rx:0.007,rz:0.009}].map(r=>Object.assign(r,{s:ad,f:pm,w:hw,v:gv})),6,{uvf:gu,capA:{dir:Zv,uv:gu()},capB:{dir:V.mul(Zv,-1),uv:gu()}});
   for(const zz of [0.047,-0.047])loft(M,[{c:P(0.112,0.006,zz),rx:0.006,rz:0.006},{c:P(0.056,0.032,zz),rx:0.006,rz:0.006}].map(r=>Object.assign(r,{s:Zv,f:ad,w:hw,v:gv})),5,{uvf:gu});
   }
   /* thumb wrapped over the front of the curled fingers */
   loft(M,[{c:P(0.035,0.026,0.044),rx:0.016,rz:0.015},{c:P(0.07,0.044,0.03),rx:0.013,rz:0.012},{c:P(0.088,0.049,0.006),rx:0.011,rz:0.0105}].map(r=>Object.assign(r,{s:ad,f:pm,w:hw,v:SW.skin[1]})),6,{uvf:sk,capB:{dir:V.mul(Zv,-1),uv:sk(),lift:0.006}});
   if(BP.hand!==1)scaleAbout(M,f0,M.p.length/3,wr,[BP.hand,BP.hand,BP.hand]);}
  {const dx=s*(0.215*SHx*0.9-BP.shIn);for(let i=v0;i<M.p.length/3;i++)M.p[i*3]+=dx;}
  /* legs */
  const x=0.1*s,th=BI[s>0?'thighL':'thighR'],sn=BI[s>0?'shinL':'shinR'],ft=BI[s>0?'footL':'footR'];const lv=t=>(ROW.p0+t*(ROW.p1-ROW.p0))/512;
  loft(M,[[0.92,0.1,W2(BI.pelvis,th,0.6)],[0.8,0.095,W1(th)],[0.65,0.083,W1(th)],[0.51,0.07,W2(th,sn,0.5)],[0.36,0.064,W1(sn)],[0.2,0.06,W1(sn)],[0.1,0.065,W1(sn)]].map((r,k)=>({c:[x*BP.legX(r[0]),r[0],0.006],s:X,f:Z,rx:r[1]*BP.leg[k]*(B.dancer&&r[0]>0.6?1.15:1),rz:r[1]*1.04*BP.leg[k]*(B.dancer&&r[0]>0.6?1.35:1),v:lv((0.92-r[0])/0.82),w:r[2]})),10,{});
  /* shoes: loafer shape, leather texture wrapping over the top */
  const sc=(z,w,h,y,t)=>({c:[BP.footX*s,y,z],s:X,f:Y,rx:w,rz:h,w:W1(ft),t});const sw=SW.shoe[1];
  if(B.fem&&s>0&&B.skirt){/* skirt: flares from the hips, painted like the dress (bottom of the torso sheet) */
   const sl=B.skirt,sv2=tv(0.82),sk=(y,r,z)=>({c:[0,y,z],s:X,f:Z,rx:r,rz:r*0.74,v:sv2,w:W1(BI.pelvis)});
   loft(M,[sk(0.84,0.234,0),sk(0.84-sl*0.45,0.24+sl*0.04,0.004),sk(0.84-sl,0.246+sl*0.08,0.008)],20,{});}
  const s0=M.p.length/3;if(B.heels){/* pumps: raised heel, low vamp, slim toe, stiletto */
   loft(M,[sc(-0.06,0.04,0.026,0.112,0),sc(-0.02,0.046,0.034,0.098,0.25),sc(0.07,0.048,0.03,0.05,0.6),sc(0.16,0.042,0.022,0.03,0.85),sc(0.2,0.026,0.014,0.026,1)],8,{uvf:(u,r)=>[(332+u*178)/512,(ROW.w0+2+r.t*36)/512],capA:{dir:[0,0,-1],uv:[340/512,(ROW.w0+4)/512]},capB:{dir:[0,0,1],uv:[421/512,(ROW.w1-4)/512]},ph0:Math.PI/8});
   loft(M,[{c:[BP.footX*s,0.09,-0.052],rx:0.012,rz:0.014},{c:[BP.footX*s,0.004,-0.056],rx:0.005,rz:0.005}].map(r=>Object.assign(r,{s:X,f:Z,w:W1(ft),v:(ROW.w0+30)/512})),6,{uvf:()=>[340/512,(ROW.w0+30)/512],capB:{dir:[0,-1,0],uv:[340/512,(ROW.w0+30)/512]}});}
  else loft(M,[sc(-0.065,0.05,0.045,0.06,0),sc(-0.02,0.056,0.06,0.07,0.25),sc(0.08,0.058,0.045,0.055,0.6),sc(0.17,0.05,0.032,0.04,0.85),sc(0.205,0.032,0.02,0.035,1)],8,{uvf:(u,r)=>[(332+u*178)/512,(ROW.w0+2+r.t*36)/512],capA:{dir:[0,0,-1],uv:[340/512,(ROW.w0+4)/512]},capB:{dir:[0,0,1],uv:[421/512,(ROW.w1-4)/512]},ph0:Math.PI/8});
  if(BP.foot!==1)scaleAbout(M,s0,M.p.length/3,[BP.footX*s,0,-0.04],[BP.foot,0.94,BP.foot]);}
 return M;}
function buildHead(B){const M=newMesh(),X=[1,0,0],Z=[0,0,1],tv=y=>1-(y-HEAD.neckY)/(HEAD.crownY-HEAD.neckY),FH=!!(B&&B.fem),nk=FH?BODYP.fem.neck:1;
 /* rings: neck -> chin -> square jaw -> cheekbones -> brow -> crown */
 const R=[[1.47,0.097*nk,0.094*nk,-0.008,1],[1.52,0.095*nk,0.094*nk,-0.002,1],[1.555,0.09,0.093,0.006,1],[1.585,0.084,0.09,0.012,0.8],[1.605,0.094,0.098,0.02,0.72],[1.628,0.1,0.104,0.02,0.78],[1.652,0.103,0.108,0.016,0.85],[1.677,0.106,0.11,0.011,0.9],
  [1.702,0.108,0.112,0.006,0.92],[1.727,0.109,0.114,0.002,0.95],[1.757,0.107,0.114,-0.004,1],[1.787,0.099,0.107,-0.009,1],[1.812,0.083,0.092,-0.012,1],[1.83,0.058,0.065,-0.014,1]];
 /* women: tapered rounded jaw and a small chin, softer brow and a smaller nose; cheekbones stay full */
 if(FH){const J=HEADP.fem.jaw;for(const r of R){const j=J[r[0]];if(j){r[1]*=j[0];r[2]*=j[1];r[4]=Math.max(r[4],j[2]);}}}
 /* generated men get their own head shape (heroes keep the defaults): a wider or narrower jaw, fuller or flatter cheekbones */
 else if(B&&(B.jaw||B.cheek)){for(const r of R){if(r[0]>1.54&&r[0]<1.64)r[1]*=lerp(B.jaw||1,1,clamp((r[0]-1.555)/0.085,0,1));if(r[0]>1.64&&r[0]<1.72)r[1]*=B.cheek||1;}}
 const HP=FH?HEADP.fem:HEADP.male,nk0=B&&B.noseK||1,nose=nk0===1?HP.nose:Object.fromEntries(Object.entries(HP.nose).map(([k,v])=>[k,v*nk0])),brow=HP.brow,chin=HP.chin;
 loft(M,R.map(r=>({c:[0,r[0],r[3]],s:X,f:Z,rx:r[1],rz:r[2],sq:r[4],v:tv(r[0]),w:r[0]<1.6?W2(BI.neck,BI.head,clamp((r[0]-1.5)/0.1,0,1)):W1(BI.head),
  mod:(p,ph)=>{const c=Math.cos(ph);if(c>0.5){p[2]-=(c-0.5)*0.03;}const k=Math.max(0,c);const key=r[0];p[2]+=((nose[key]||0)*Math.pow(k,24)+(brow[key]||0)*k*k+(chin[key]||0)*Math.pow(k,4));return p;}})),16,{capB:{dir:[0,1,0],uv:[0.5,0.004],lift:0.012}});
 if(B&&B.cigar){const cu=[12/512,3/512],eu=[38/512,3/512],w=W1(BI.head);loft(M,[{c:[0.03,1.64,0.1],rx:0.009,rz:0.009},{c:[0.06,1.632,0.175],rx:0.0095,rz:0.0095}].map(r=>Object.assign(r,{s:[1,0,0],f:[0,1,0],w,v:cu[1]})),6,{uvf:()=>cu});loft(M,[{c:[0.06,1.632,0.175],rx:0.0096,rz:0.0096},{c:[0.062,1.6315,0.185],rx:0.0092,rz:0.0092}].map(r=>Object.assign(r,{s:[1,0,0],f:[0,1,0],w,v:eu[1]})),6,{uvf:()=>eu,capB:{dir:[0,0,1],uv:eu}});}
 if(B&&B.hs==='long'&&FH){/* women's long feathered hair: full back and sides to the shoulder blades, a flicked fringe and face-framing wings */
  hairShell(M,[[1.79,0.122,0.118,-0.014],[1.72,0.132,0.114,-0.026],[1.64,0.136,0.104,-0.04],[1.56,0.132,0.09,-0.056],[1.48,0.126,0.074,-0.07],[1.4,0.122,0.06,-0.08],[1.35,0.126,0.05,-0.084]],14,{open:1.77,c0:0.4,curl:0.015,bottom:1});
  for(const s of [1,-1])hairLock(M,s,[[0.09,1.79,0.06,0.02],[0.118,1.73,0.05,0.026],[0.13,1.66,0.03,0.028],[0.124,1.58,0.02,0.026],[0.13,1.5,0.008,0.022],[0.15,1.45,-0.004,0.012]]);}
 else if(B&&B.hs==='bob'&&FH){/* chin-length bob: a smooth helmet of hair cut level at the jaw, open at the face, with a straight fringe */
  hairShell(M,[[1.8,0.122,0.12,-0.012],[1.73,0.134,0.12,-0.02],[1.66,0.138,0.112,-0.03],[1.6,0.134,0.102,-0.038],[1.565,0.13,0.096,-0.042]],14,{open:1.765,c0:0.4,curl:0.004,bottom:1});}
 else if(B&&B.hs==='long'){/* long hair: falls behind the head past the shoulders, framing the face */
  const hu=[144/512,3/512],R=(y,r,rz,z,w)=>({c:[0,y,z],s:[1,0,0],f:[0,0,1],rx:r,rz,w,v:hu[1]});
  loft(M,[R(1.76,0.12,0.09,-0.035,W1(BI.head)),R(1.66,0.125,0.08,-0.055,W1(BI.head)),R(1.56,0.128,0.068,-0.07,W2(BI.neck,BI.head,0.5)),R(1.46,0.124,0.056,-0.085,W2(BI.chest,BI.neck,0.5)),R(1.38,0.11,0.042,-0.1,W1(BI.chest))],12,{uvf:()=>hu,capB:{dir:[0,1,0],uv:hu},capA:{dir:[0,-1,0],uv:hu}});}
 if(B&&FH&&B.hs==='xlong'){/* sleek waist-length hair: straight and heavy down the back, a centre part, long face-framing panels to the collarbones */
  hairShell(M,[[1.795,0.122,0.12,-0.014],[1.72,0.13,0.114,-0.026],[1.64,0.133,0.104,-0.04],[1.56,0.13,0.092,-0.06],[1.48,0.128,0.08,-0.084],[1.4,0.126,0.074,-0.1],[1.2,0.116,0.068,-0.116],[1.08,0.084,0.05,-0.12]],12,{open:1.775,c0:0.4,curl:0.005,bottom:1});
  for(const s of [1,-1])hairLock(M,s,[[0.07,1.8,0.07,0.02],[0.112,1.74,0.056,0.026],[0.128,1.66,0.036,0.03],[0.13,1.52,0.01,0.029],[0.136,1.44,-0.01,0.02]]);}
 else if(B&&FH&&B.hs==='waves'){/* long glamour waves: big soft volume falling past the shoulder blades, flaring out at the ends, with waved face-framing locks */
  hairShell(M,[[1.8,0.126,0.122,-0.012],[1.73,0.14,0.122,-0.022],[1.56,0.152,0.104,-0.052],[1.47,0.158,0.096,-0.07],[1.38,0.162,0.09,-0.088],[1.28,0.15,0.078,-0.102],[1.21,0.1,0.05,-0.106]],14,{open:1.77,c0:0.42,curl:0.04,fq:1.3,bottom:1});
  for(const s of [1,-1])hairLock(M,s,[[0.08,1.8,0.066,0.022],[0.124,1.73,0.05,0.03],[0.14,1.65,0.03,0.032],[0.14,1.52,0.014,0.029],[0.16,1.4,-0.02,0.014]]);}
 else if(B&&FH&&B.hs==='braids'){/* long box braids: a neat braided cap, then a curtain of thin braids from the crown down the back to the waist, a few over the shoulders */
  hairShell(M,[[1.8,0.122,0.12,-0.012],[1.72,0.131,0.116,-0.022],[1.62,0.13,0.104,-0.038],[1.56,0.11,0.084,-0.046]],12,{open:1.77,c0:0.4,curl:0.012,fq:3,bottom:1});
  const N=8;for(let i=0;i<N;i++){const a=-2.45+4.9*i/(N-1),sa=Math.sin(a),ca=Math.cos(a),side=Math.abs(sa)>0.86&&ca>-0.2,len=side?0.3:0.42+0.12*((i*7)%5)/4;
   const x0=sa*0.128,z0=-0.02+ca*0.118,x1=sa*(side?0.14:0.1),z1=side?0.02:Math.min(z0,-0.1)-0.03+ca*0.02;
   hairBraid(M,[[x0,1.66,z0,0.019],[x1,1.5,z1-0.012,0.019],[x1*0.92,1.5-len,z1-0.034,0.014],[x1*0.92,1.49-len,z1-0.034,0.018]]);}}
 else if(B&&FH&&B.hs==='afro'){/* a big round afro: full, tightly curled volume all round the head, the face left open */
  hairShell(M,[[1.975,0.06,0.06,-0.022],[1.955,0.135,0.13,-0.022],[1.91,0.188,0.178,-0.024],[1.85,0.212,0.198,-0.028],[1.78,0.214,0.196,-0.032],[1.71,0.2,0.18,-0.036],[1.65,0.172,0.152,-0.042],[1.6,0.136,0.116,-0.046],[1.575,0.1,0.086,-0.048]],16,{open:1.8,c0:0.46,k0:0.5,curl:0.05,fq:2.4,top:1,bottom:1});}
 else if(B&&FH&&B.hs==='puff'){/* afro puff: hair pulled back smooth into a big round puff on top of the crown, held with a band */
  hairShell(M,[[2.0,0.05,0.05,-0.072],[1.985,0.1,0.096,-0.072],[1.945,0.13,0.124,-0.07],[1.9,0.136,0.13,-0.066],[1.855,0.12,0.114,-0.062],[1.82,0.09,0.086,-0.058]],18,{curl:0.06,fq:2.4,top:1,bottom:1});
  const hu=[300/512,3/512],w=W1(BI.head),T=y=>({c:[0,y,-0.058],s:[1,0,0],f:[0,0,1],rx:0.062,rz:0.058,w,v:hu[1]});loft(M,[T(1.828),T(1.846)],12,{uvf:()=>hu});}
 if(B&&B.hs==='pony'){/* high ponytail: a scrunchie at the back of the crown and a thick tail swinging down to the shoulder blades */
  const hu=[144/512,3/512],w=W1(BI.head),T=(y,z,r)=>({c:[0,y,z],s:[1,0,0],f:[0,0.35,-1],rx:r,rz:r*0.85,w,v:hu[1]});
  loft(M,[T(1.83,-0.085,0.03),T(1.835,-0.125,0.034),T(1.8,-0.165,0.04),T(1.72,-0.185,0.038),T(1.62,-0.18,0.032),T(1.52,-0.165,0.022),T(1.46,-0.155,0.008)],10,{uvf:()=>hu,capA:{dir:[0,0,1],uv:hu}});
  loft(M,[T(1.835,-0.1,0.036),T(1.835,-0.115,0.036)],10,{uvf:()=>[300/512,3/512]});}
 if(B&&(B.hs==='normal'||B.hs==='slick'||B.hs==='buzz'||B.hs==='long'||B.hs==='pony'||B.hs==='xlong'||B.hs==='waves'||B.hs==='braids'||B.hs==='puff')){const LH=FH&&(B.hs==='long'||B.hs==='xlong'||B.hs==='waves'||B.hs==='braids'),hu=[144/512,3/512],w=W1(BI.head),th=B.hs==='buzz'?0.004:B.hs==='slick'||B.hs==='puff'?0.009:LH?0.02:0.014,fr=LH&&B.hs!=='braids'?0.024:0;
  const R=(y,r,z,drop)=>({c:[0,y,z],s:[1,0,0],f:[0,0,1],rx:r+th,rz:r*1.045+th,w,v:hu[1],mod:(p,ph)=>{const back=Math.max(0,-Math.cos(ph)),fw=Math.max(0,Math.cos(ph));p[1]-=drop*back;if(B.hs==='slick')p[2]-=0.006*fw;
   if(fr&&y<1.8){const f=Math.pow(fw,3);p[1]-=fr*f;p[2]+=0.012*f;}return p;}});
  loft(M,[R(1.765,0.108,-0.004,0.07),R(1.79,0.1,-0.009,0.035),R(1.815,0.084,-0.012,0.012),R(1.834,0.06,-0.014,0),R(1.846,0.03,-0.014,0)],14,{uvf:()=>hu,capB:{dir:[0,1,0],uv:hu}});}
 if(B&&(B.hs==='mohawk'||B.hs==='big')){const hu=[144/512,3/512],w=W1(BI.head);
  if(B.hs==='big'&&FH){/* women's 80s perm: big curly volume around the crown falling to the shoulders, open at the face */
   hairShell(M,[[1.92,0.06,0.06,-0.02],[1.885,0.13,0.125,-0.018],[1.82,0.158,0.142,-0.022],[1.74,0.166,0.126,-0.036],[1.65,0.162,0.106,-0.052],[1.56,0.152,0.088,-0.066],[1.48,0.136,0.07,-0.076],[1.43,0.118,0.056,-0.08]],16,{open:1.775,c0:0.42,curl:0.07,top:1,bottom:1});}
  else if(B.hs==='big'){const R=(y,r,z)=>({c:[0,y,z],s:[1,0,0],f:[0,0,1],rx:r,rz:r*1.08,w,v:hu[1]});loft(M,[R(1.7,0.112,-0.03),R(1.76,0.135,-0.02),R(1.83,0.138,-0.015),R(1.89,0.115,-0.015),R(1.925,0.06,-0.015)],14,{uvf:()=>hu,capB:{dir:[0,1,0],uv:hu}});}
  else{GRP++;const N=9,ids=[];for(let i=0;i<=N;i++){const a=-1.05+2.1*i/N,cz=Math.sin(a)*0.112-0.004,cy=1.738+Math.cos(a)*0.104,ny=Math.cos(a),nz=Math.sin(a),h=0.07+0.02*Math.sin(i/N*Math.PI);
   ids.push([addV(M,[-0.014,cy,cz],hu,w),addV(M,[0.014,cy,cz],hu,w),addV(M,[0,cy+ny*h,cz+nz*h],hu,w)]);}
   for(let i=0;i<N;i++){const a=ids[i],b=ids[i+1];tri(M,a[0],b[0],b[2],[-1,0,0]);tri(M,a[0],b[2],a[2],[-1,0,0]);tri(M,a[1],a[2],b[2],[1,0,0]);tri(M,a[1],b[2],b[1],[1,0,0]);}}}
 if(B&&B.hat){const hu=[88/512,3/512],bu=[116/512,3/512],w=W1(BI.head),R=(y,r,z)=>({c:[0,y,z||-0.006],s:[1,0,0],f:[0,0,1],rx:r,rz:r*1.04,w,v:hu[1]});
  if(B.hat==='fedora'){loft(M,[R(1.79,0.19),R(1.795,0.195),R(1.8,0.12)],16,{uvf:()=>hu});loft(M,[R(1.79,0.118),R(1.82,0.118)],16,{uvf:()=>bu});loft(M,[R(1.82,0.117),R(1.9,0.108),R(1.925,0.085)],16,{uvf:()=>hu,capB:{dir:[0,1,0],uv:hu,lift:-0.01}});}
  else if(B.hat==='beanie'){loft(M,[R(1.755,0.118),R(1.79,0.119)],16,{uvf:()=>bu});loft(M,[R(1.79,0.116),R(1.85,0.1),R(1.885,0.06)],16,{uvf:()=>hu,capB:{dir:[0,1,0],uv:hu}});}
  else{loft(M,[R(1.745,0.116),R(1.8,0.112),R(1.84,0.09),R(1.86,0.05)],16,{uvf:()=>hu,capB:{dir:[0,1,0],uv:hu}});loft(M,[{c:[0,1.75,-0.13],s:[1,0,0],f:[0,1,0],rx:0.03,rz:0.012,w,v:hu[1]},{c:[0,1.68,-0.15],s:[1,0,0],f:[0,1,0],rx:0.02,rz:0.01,w,v:hu[1]}],6,{uvf:()=>hu});}}
 /* full fluffy beard + moustache (3D), e.g. Nine of Nine */
 if(B&&B.fluff==='photo'){const w=W1(BI.head),tv=y=>1-(clamp(y,1.565,1.7)-HEAD.neckY)/(HEAD.crownY-HEAD.neckY);
  const ring=(y,rx,rz,z,hide)=>({c:[0,y,z],s:[1,0,0],f:[0,0,1],rx,rz,w,v:tv(y),mod:(p,ph)=>{const c=Math.cos(ph),k=lerp(0.5,1,clamp((c+0.45)/0.6,0,1))*(hide?lerp(1,0.55,Math.pow(Math.max(0,c),1.5)):1),n=1+0.07*Math.sin(ph*9+y*140)+0.045*Math.sin(ph*17+y*61);p[0]*=k*n;p[2]=z+(p[2]-z)*k*n;return p;}});
  loft(M,[ring(1.49,0.03,0.036,0.056),ring(1.51,0.064,0.076,0.04),ring(1.536,0.094,0.104,0.024),ring(1.566,0.106,0.116,0.014),ring(1.6,0.112,0.121,0.018),ring(1.628,0.115,0.123,0.016,1),ring(1.664,0.113,0.12,0.012,1),ring(1.69,0.109,0.115,0.008,1)],18,{capA:{dir:[0,-1,0],uv:[0.5,tv(1.565)]}});
  const bu=[200/512,3/512];loft(M,[-0.05,-0.042,-0.03,-0.016,0,0.016,0.03,0.042,0.05].map(x=>{const ax=Math.abs(x);return{c:[x,1.672-ax*0.06,0.12-x*x*9],s:[0,1,0],f:[0,0,1],rx:0.0085-ax*0.05,rz:0.011-ax*0.06,w,v:bu[1]};}),8,{uvf:()=>bu});}
 if(B&&B.hairVol){const w=W1(BI.head),tv=y=>1-(y-HEAD.neckY)/(HEAD.crownY-HEAD.neckY);
  const H=(y,rx,rz,z,a)=>({c:[0,y,z],s:[1,0,0],f:[0,0,1],rx,rz,w,v:tv(y),mod:(p,ph)=>{const n=1+(a||0)*(Math.sin(ph*7+y*90)*0.6+Math.sin(ph*13)*0.4);p[0]*=n;p[2]=z+(p[2]-z)*n;if(Math.cos(ph)>0)p[1]+=(a||0)*0.4*Math.cos(ph);return p;}});
  loft(M,[H(1.762,0.106,0.113,-0.004),H(1.782,0.113,0.121,-0.006,0.03),H(1.81,0.104,0.112,-0.009,0.05),H(1.836,0.084,0.092,-0.012,0.05),H(1.858,0.05,0.056,-0.014,0.04)],18,{capB:{dir:[0,1,0],uv:[0.5,tv(1.86)],lift:0.006}});}
 /* big 80s hair for the photo-face keepers: hairBig 1 = a curly mop down to the ears, 2 = long teased hair to the shoulders, 3 = a feathered mop.
    The rings below the forehead pull in at the front so the face stays clear; every ring samples the hair colour row. */
 if(B&&B.hairBig){const w=W1(BI.head),hv=1-(1.83-HEAD.neckY)/(HEAD.crownY-HEAD.neckY),curl=B.hairBig===1?1.4:0.6;
  const H=(y,rx,rz,z,a)=>({c:[0,y,z],s:[1,0,0],f:[0,0,1],rx,rz,w:y<1.62?W2(BI.neck,BI.head,0.6):w,v:hv,mod:(p,ph)=>{const c=Math.cos(ph),n=1+a*curl*(Math.sin(ph*9+y*120)*0.6+Math.sin(ph*17+y*53)*0.4),k=y<1.785?lerp(1,0.58,clamp((c-0.15)/0.45,0,1)):1;p[0]*=n*k;p[2]=z+(p[2]-z)*n*k;return p;}});
  const R=(B.hairBig===2?[[1.53,0.1,0.11,-0.035,0.03],[1.6,0.125,0.13,-0.026,0.05]]:[]).concat([[1.665,0.122,0.128,-0.014,0.05],[1.725,0.134,0.14,-0.01,0.06],[1.79,0.142,0.148,-0.006,0.06],[1.85,0.13,0.136,-0.008,0.05],[1.9,0.092,0.098,-0.012,0.04],[1.93,0.035,0.04,-0.012,0]]);
  loft(M,R.map(q=>H(...q)),20,{capA:{dir:[0,-1,0],uv:[0.5,hv]},capB:{dir:[0,1,0],uv:[0.5,hv]}});}
 if(B&&B.fluff===true){const bu=[200/512,3/512],w=W1(BI.head);
  const ring=(y,rx,rz,z,dip)=>({c:[0,y,z],s:[1,0,0],f:[0,0,1],rx,rz,w,v:bu[1],mod:(p,ph)=>{const c=Math.cos(ph),k=lerp(0.5,1,clamp((c+0.45)/0.6,0,1)),n=1+0.075*Math.sin(ph*9+y*140)+0.045*Math.sin(ph*17+y*61);p[0]*=k*n;p[2]=z+(p[2]-z)*k*n;if(dip&&c>0)p[1]-=dip*c*c;return p;}});
  loft(M,[ring(1.488,0.028,0.034,0.056),ring(1.508,0.062,0.074,0.04),ring(1.534,0.092,0.102,0.024),ring(1.565,0.104,0.114,0.014),ring(1.6,0.111,0.12,0.018),ring(1.634,0.115,0.123,0.018,0.03),ring(1.668,0.113,0.121,0.012,0.052)],18,{uvf:()=>bu,capA:{dir:[0,-1,0],uv:bu}});
  loft(M,[-0.042,-0.03,-0.016,0,0.016,0.03,0.042].map(x=>({c:[x,1.649-Math.abs(x)*0.45-(Math.abs(x)>0.035?0.008:0),0.119-x*x*7],s:[0,1,0],f:[0,0,1],rx:0.0095-Math.abs(x)*0.08,rz:0.011,w,v:bu[1]})),8,{uvf:()=>bu});}
 /* armour (look v2): soft vest or plate carrier following the torso profile (bust flattened under it), with armholes and a scooped neck;
    chest/spine weighted so it rides the body and survives a head cut */
 if(B&&B.armor){const T=torsoRows(B),BU=(B.fem&&BODYP.fem.bust)||{},plate=B.armor==='plate',au=[342/512,3/512],du=[370/512,3/512],pad=plate?0.026:0.018,sY=[0,1,0];
  const at=y=>{let i=0;while(i<T.length-2&&T[i+1][0]<y)i++;const a=T[i],b=T[i+1],t=clamp((y-a[0])/(b[0]-a[0]),0,1);return{rx:lerp(a[1],b[1],t),rz:lerp(a[2],b[2],t),zc:lerp(a[3],b[3],t),w:t<0.5?a[4]:b[4]};};
  const bust=y=>{let m=0;for(const k in BU)m=Math.max(m,BU[k]*Math.max(0,1-Math.abs(y-k)/0.09));return m*0.85;};
  const shell=y=>{const r=at(y),F=r.zc+r.rz+bust(y),K=r.rz-r.zc,arm=y<1.28?1:1-1.8*(y-1.28);return{y,w:r.w,zc:(F-K)/2,rx:r.rx*arm+pad*(y<1.28?1:0.5),rz:(F+K)/2+pad};};
  const YS=[0.97,1.06,1.16,1.26,1.34,1.41,1.45],top=YS[YS.length-1],S=YS.map(shell);
  loft(M,S.map(r=>({c:[0,r.y,r.zc],s:X,f:Z,rx:r.rx,rz:r.rz,sq:0.8,w:r.w,v:au[1],mod:(p,ph)=>{if(r.y===top){const c=Math.max(0,Math.cos(ph));p[1]-=0.06*c*c;}return p;}})),16,{uvf:()=>au});
  const fz=y=>{const r=S.reduce((a,b)=>Math.abs(b.y-y)<Math.abs(a.y-y)?b:a);return r.zc+r.rz;},bz=y=>{const r=S.reduce((a,b)=>Math.abs(b.y-y)<Math.abs(a.y-y)?b:a);return r.zc-r.rz;};
  const box=(x,y,z0,dz,rx,ry,uv,w)=>loft(M,[{c:[x,y,z0],rx,rz:ry},{c:[x,y,z0+dz],rx:rx*0.96,rz:ry*0.96}].map(r=>Object.assign(r,{s:X,f:sY,sq:0.3,w,v:uv[1]})),8,{uvf:()=>uv,capB:{dir:[0,0,Math.sign(dz)],uv},ph0:Math.PI/8});
  const k=S[3].rx/0.25;
  if(plate){const wc=W2(BI.spine,BI.chest,0.7);box(0,1.25,fz(1.26)-0.012,0.03,0.125*k,0.13,au,wc);box(0,1.25,bz(1.26)+0.012,-0.026,0.125*k,0.13,au,wc);
   for(const x of [-0.085,0,0.085])box(x*k,1.08,fz(1.06)-0.008,0.032,0.03,0.042,du,W2(BI.pelvis,BI.spine,0.6));}
  else for(const x of [-1,1])box(x*0.07*k,1.36,fz(1.34)-0.01,0.016,0.03,0.022,du,W1(BI.chest));}
 /* helmet (look v2): PASGT shell flaring over the ears and nape, or a round riot helmet with a smoked visor */
 if(B&&B.helmet){const hu=[398/512,3/512],vu=[426/512,3/512],w=W1(BI.head),riot=B.helmet==='riot';
  const R=(y,r,z,drop)=>({c:[0,y,z],s:X,f:Z,rx:r,rz:r*1.08,w,v:hu[1],mod:(p,ph)=>{p[1]-=(drop||0)*(1-Math.cos(ph))/2;return p;}});
  if(riot)loft(M,[R(1.905,0.05,-0.008),R(1.89,0.104,-0.008),R(1.845,0.138,-0.01),R(1.78,0.148,-0.012),R(1.74,0.15,-0.014,0.05),R(1.736,0.138,-0.014,0.05)],16,{uvf:()=>hu,capA:{dir:[0,1,0],uv:hu}});
  else loft(M,[R(1.9,0.045,-0.008),R(1.886,0.1,-0.008),R(1.845,0.135,-0.01),R(1.785,0.145,-0.012,0.01),R(1.738,0.15,-0.014,0.07),R(1.734,0.138,-0.014,0.07)],16,{uvf:()=>hu,capA:{dir:[0,1,0],uv:hu}});
  if(riot)loft(M,[[1.745,0.152,0.162],[1.67,0.15,0.168],[1.6,0.138,0.158]].map(q=>({c:[0,q[0],-0.01],s:X,f:Z,rx:q[1],rz:q[2],w:q[0]<1.6?W2(BI.neck,BI.head,0.5):w,v:vu[1],mod:(p,ph)=>{const t=clamp((Math.cos(ph)-0.1)/0.25,0,1),kk=lerp(0.55,1,t);p[0]*=kk;p[2]=-0.01+(p[2]+0.01)*kk;return p;}})),16,{uvf:()=>vu});}
 /* sunglasses from Felix (B.sun = a SHADES entry): lens discs, a brow bar or bridge in the frame colour, temple arms */
 if(B&&B.sun){const S=B.sun,w=W1(BI.head),gy=1.708,gz=0.128,SWU={black:287,amber:301,blue:315,pink:329,smoke:343,gold:357,white:371},uv=k=>[(SWU[k]||287)/512,3/512],lu=uv(S.lens),fu=uv(S.frame);
  const disc=(cx,cy,rx,rz,sq,u)=>loft(M,[gz-0.001,gz+0.004].map(z=>({c:[cx,cy,z],s:[1,0,0],f:[0,1,0],rx,rz,sq,w,v:u[1]})),14,{uvf:()=>u,capA:{dir:[0,0,-1],uv:u},capB:{dir:[0,0,1],uv:u}});
  const bar=(x0,x1,y,t,u)=>loft(M,[x0,x1].map(x=>({c:[x,y,gz+0.004],s:[0,1,0],f:[0,0,1],rx:t,rz:t,w,v:u[1]})),6,{uvf:()=>u,capA:{dir:[-1,0,0],uv:u},capB:{dir:[1,0,0],uv:u}});
  const sh=S.shape;
  if(sh==='wrap'){disc(0,gy,0.08,0.019,0.45,lu);bar(-0.08,0.08,gy+0.02,0.004,fu);}
  else{const P=sh==='avi'?{rx:0.03,rz:0.025,sq:0.8,dy:-0.004}:sh==='round'?{rx:0.022,rz:0.022,sq:1,dy:0}:{rx:0.031,rz:0.02,sq:0.45,dy:0};
   for(const sx of [1,-1])disc(sx*0.037,gy+P.dy,P.rx,P.rz,P.sq,lu);
   if(sh==='way')bar(-0.072,0.072,gy+0.019,0.0065,fu);else if(sh==='avi'){bar(-0.07,0.07,gy+0.021,0.0028,fu);bar(-0.016,0.016,gy+0.012,0.0028,fu);}else bar(-0.016,0.016,gy+0.006,0.003,fu);}
  const tp=(z,x)=>({c:[x,gy+0.012,z],s:[0,1,0],f:[1,0,0],rx:0.0045,rz:0.0035,w,v:fu[1]});for(const sx of [1,-1])loft(M,[tp(gz-0.004,sx*0.072),tp(0.06,sx*0.108),tp(-0.025,sx*0.115)],5,{uvf:()=>fu});}
 /* glasses: rectangular black frames, bridge, temple arms */
 if(B&&B.specs&&!B.sun){const gu=B.fluff==='photo'?[0.5,3/512]:[172/512,3/512],w=W1(BI.head),gy=1.711,gz=0.125;
  for(const sx of [1,-1]){const cx=sx*0.036,R2=(rx,rz,z)=>({c:[cx,gy,z],s:[1,0,0],f:[0,1,0],rx,rz,sq:0.35,w,v:gu[1]});
   const bar=(a0,a1,hz)=>loft(M,[a0,a1].map(c=>({c:[c[0],c[1],gz],s:hz?[0,1,0]:[1,0,0],f:[0,0,1],rx:0.0042,rz:0.0042,w,v:gu[1]})),6,{uvf:()=>gu,capA:{dir:hz?[-1,0,0]:[0,-1,0],uv:gu},capB:{dir:hz?[1,0,0]:[0,1,0],uv:gu}});const hw=0.031,hh=0.02;bar([cx-hw,gy+hh],[cx+hw,gy+hh],1);bar([cx-hw+0.004,gy-hh],[cx+hw-0.004,gy-hh],1);bar([cx-hw,gy-hh+0.002],[cx-hw,gy+hh],0);bar([cx+hw,gy-hh+0.002],[cx+hw,gy+hh],0);
   const tp=(z,x)=>({c:[x,gy+0.007,z],s:[0,1,0],f:[1,0,0],rx:0.0045,rz:0.0035,w,v:gu[1]});loft(M,[tp(gz-0.004,sx*0.066),tp(0.06,sx*0.106),tp(-0.025,sx*0.114)],5,{uvf:()=>gu});}
  loft(M,[-0.014,0,0.014].map(x=>({c:[x,gy+0.006-(x===0?0.002:0),gz-0.001],s:[0,1,0],f:[0,0,1],rx:0.0035,rz:0.0035,w,v:gu[1]})),5,{uvf:()=>gu});}
 /* ear flaps, textured with the painted ears */
 for(const s of [1,-1]){GRP++;const c=[s*0.106,1.69,-0.006],w=W1(BI.head),u=s>0?192/256:64/256,v0=84/256,v1=126/256,du=12/256;
  const a=addV(M,V.add(c,[0,0.026,-0.014]),[u-du,v0],w),b=addV(M,V.add(c,[0,0.026,0.012]),[u+du,v0],w),cc=addV(M,V.add(c,[s*0.014,-0.028,0.01]),[u+du,v1],w),d=addV(M,V.add(c,[s*0.012,-0.028,-0.016]),[u-du,v1],w),o=[s,0,0];
  const e=addV(M,V.add(c,[s*0.018,0,-0.002]),[u,(v0+v1)/2],w);for(const [p,q] of [[a,b],[b,cc],[cc,d],[d,a]])tri(M,p,q,e,o);}
 return M;}
/* smooth normals per loft group (positions welded inside a group) */
function normals(M){const n=new Float32Array(M.p.length),key=i=>M.grp[i]+':'+Math.round(M.p[i*3]*1e4)+','+Math.round(M.p[i*3+1]*1e4)+','+Math.round(M.p[i*3+2]*1e4),acc={};
 for(let t=0;t<M.idx.length;t+=3){const a=M.idx[t],b=M.idx[t+1],c=M.idx[t+2],P=i=>[M.p[i*3],M.p[i*3+1],M.p[i*3+2]],fn=V.cross(V.sub(P(b),P(a)),V.sub(P(c),P(a)));for(const i of [a,b,c]){const k=key(i);acc[k]=acc[k]?V.add(acc[k],fn):fn;}}
 for(let i=0;i<M.p.length/3;i++){const q=V.norm(acc[key(i)]||[0,1,0]);n.set(q,i*3);}return n;}
/* ---------------- matrices ---------------- */
const M4={id:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
 mul(a,b){const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;},
 T:(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],
 R(ax,a){const[x,y,z]=V.norm(ax),c=Math.cos(a),s=Math.sin(a),t=1-c;return[t*x*x+c,t*x*y+s*z,t*x*z-s*y,0,t*x*y-s*z,t*y*y+c,t*y*z+s*x,0,t*x*z+s*y,t*y*z-s*x,t*z*z+c,0,0,0,0,1];},
 persp(f,a,n,fa){const t=1/Math.tan(f/2);return[t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0];},
 look(e,c,u){const z=V.norm(V.sub(e,c)),x=V.norm(V.cross(u,z)),y=V.cross(z,x);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V.dot(x,e),-V.dot(y,e),-V.dot(z,e),1];},
 ap(m,p){return[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];}};
/* ---------------- animation ---------------- */

const X=[1,0,0],Y=[0,1,0],Z=[0,0,1];
/* dance beat (~118 bpm): ws is the weight side (+1 right leg, -1 left) with a dwell on each side, wl/wl2 the same a little and a
   lot later (follow-through), dip the knee dip as the weight crosses over, b the beat phase. Shared with the jiggle springs. */
function danceGroove(t,lap){const b=t*(lap?1.7:1.95)*Math.PI*0.5,sh=x=>Math.sign(x)*Math.pow(Math.abs(x),0.72),s=Math.sin(b);
 return{b,ws:sh(s),wl:sh(Math.sin(b-0.6)),wl2:sh(Math.sin(b-1.2)),dip:Math.pow(Math.max(0,1-Math.abs(s)*1.25),2)};}
/* arm gestures for dancing: each is [lower, forward (-) / back (+), elbow bend] for one arm (s=+1 left, -1 right) on beat phase b.
   'up' is the arm that goes overhead. A girl drifts from one pair to the next every few seconds (her own order, from her offset o),
   blending over the last quarter of each, and a girl who has only just stopped walking (en<1) keeps her arms loose. */
const DANCE_ARMS={
 loose:(s,b,ws)=>[0.47+0.04*s*ws,0.1*Math.sin(b+s*1.2),0.45+0.15*Math.sin(b+s)],
 hips:(s,b)=>[0.1,0.34,1.9+0.06*Math.sin(b)],
 body:(s,b)=>{const u=0.5-0.5*Math.cos(b*0.5+(s>0?0:0.7));return[0.5-0.24*u,-0.5*u,0.35+1.4*u];},
 up:(s,b)=>{const w=Math.sin(b-0.9);return[-2.25+0.12*w,0.12,0.85+0.3*Math.max(0,w)];},
 head:(s,b)=>[-1.85,0.42,2.15+0.1*Math.sin(b)],
 wave:(s,b)=>[0.05+0.1*Math.sin(b+s*1.3),-1.0+0.22*Math.sin(b+s*1.6),0.7+0.35*Math.sin(b+s*1.6+0.8)]};
const DANCE_SEQ={stage:[['up','hips'],['hips','hips'],['body','body'],['hips','up'],['head','head'],['wave','wave'],['loose','up'],['body','loose']],
 party:[['loose','loose'],['hips','loose'],['body','body'],['loose','loose'],['up','hips'],['loose','loose'],['wave','wave'],['loose','hips'],['hips','up']]};
function danceArms(tt,b,ws,party,o,en){const S=DANCE_SEQ[party?'party':'stage'],D=party?4.2:3.4,x=tt/D+o*1.7,i=Math.floor(x),f=x-i,w0=Math.max(0,Math.min(1,(f-0.72)/0.28)),w=w0*w0*(3-2*w0);
 const a=S[((i%S.length)+S.length)%S.length],n=S[(((i+1)%S.length)+S.length)%S.length],out=[];
 for(const [j,s] of [[0,1],[1,-1]]){const p=DANCE_ARMS[a[j]](s,b,ws),q=DANCE_ARMS[n[j]](s,b,ws),l=DANCE_ARMS.loose(s,b,ws),r=[0,1,2].map(k=>p[k]+(q[k]-p[k])*w);
  out.push({lw:l[0]+(r[0]-l[0])*en,fx:l[1]+(r[1]-l[1])*en,el:l[2]+(r[2]-l[2])*en});}
 return out;}
/* motion capture playback (mocap.js): clips are decoded once; a frame is two keys nlerped. MP.t plays by time, MP.d by distance
   walked (one loop per clip stride). Fills R (local bone rotations) and MP.root. */
const MOCAP={};
function mocapClip(k){if(MOCAP[k])return MOCAP[k];if(typeof MOCAP_SRC==='undefined'||!MOCAP_SRC[k])return null;const S=MOCAP_SRC[k],b=atob(S.d),n=S.n,F=3+NB*4,A=new Float32Array(n*F);
 for(let i=0;i<n*F;i++){let v=b.charCodeAt(i);if(v>127)v-=256;A[i]=v/127*((i%F)<3?0.25:1);}
 return MOCAP[k]={n,F,A,stride:S.stride};}
function mocapPose(MP,R,root){const C=mocapClip(MP.c);if(!C)return false;const n=C.n,F=C.F,A=C.A;
 let f=MP.d!==undefined&&C.stride>0?MP.d/C.stride*n:MP.t*30;f=((f%n)+n)%n;const i0=Math.floor(f),i1=(i0+1)%n,w=f-i0,a=i0*F,b=i1*F;
 MP.root=[A[a]+(A[b]-A[a])*w,A[a+1]+(A[b+1]-A[a+1])*w,A[a+2]+(A[b+2]-A[a+2])*w];
 for(let j=0;j<NB;j++){const p=a+3+j*4,q=b+3+j*4,sg=(A[p]*A[q]+A[p+1]*A[q+1]+A[p+2]*A[q+2]+A[p+3]*A[q+3])<0?-1:1;
  let x=A[p]+(A[q]*sg-A[p])*w,y=A[p+1]+(A[q+1]*sg-A[p+1])*w,z=A[p+2]+(A[q+2]*sg-A[p+2])*w,s=A[p+3]+(A[q+3]*sg-A[p+3])*w;const l=Math.hypot(x,y,z,s)||1;x/=l;y/=l;z/=l;s/=l;
  R[BONES[j][0]]=[1-2*(y*y+z*z),2*(x*y+z*s),2*(x*z-y*s),0,2*(x*y-z*s),1-2*(x*x+z*z),2*(y*z+x*s),0,2*(x*z+y*s),2*(y*z-x*s),1-2*(x*x+y*y),0,0,0,0,1];}
 return true;}
/* a short cross-fade between whole poses, so a dancer flows between walking and dancing, between routines and into a flinch instead
   of snapping. Each bone's local rotation eases toward the new pose (lerped, then made rigid again) and is turned about its own
   joint, so limbs never stretch; the hips' offset eases too. c._pw keeps the last local pose shown. */
function rigid3(a){let n=Math.hypot(a[0],a[1],a[2])||1;a[0]/=n;a[1]/=n;a[2]/=n;const d=a[0]*a[4]+a[1]*a[5]+a[2]*a[6];a[4]-=d*a[0];a[5]-=d*a[1];a[6]-=d*a[2];
 n=Math.hypot(a[4],a[5],a[6])||1;a[4]/=n;a[5]/=n;a[6]/=n;a[8]=a[1]*a[6]-a[2]*a[5];a[9]=a[2]*a[4]-a[0]*a[6];a[10]=a[0]*a[5]-a[1]*a[4];}
function invRigid(m){return[m[0],m[4],m[8],0,m[1],m[5],m[9],0,m[2],m[6],m[10],0,-(m[0]*m[12]+m[1]*m[13]+m[2]*m[14]),-(m[4]*m[12]+m[5]*m[13]+m[6]*m[14]),-(m[8]*m[12]+m[9]*m[13]+m[10]*m[14]),1];}
/* bubble-butt physics: each cheek is a bouncy damped spring hung on the pelvis. The pelvis's own acceleration (every step, hip bumps and
   drops in a dance, sitting down) swings it, and a slap kicks it; the cheek shifts and squashes/stretches about its own centre, which the
   soft bones carry (vertices on the seat are weighted to them in buildBody). Left and right ring at slightly different rates, so they wobble. */
const SOFT_C=[[0.085,0.885,-0.105],[-0.085,0.885,-0.105]],SOFT_HZ=[4.1,4.6],SOFT_Z=0.12,SOFT_G=[3.8,5.2,4.2],SOFT_MAX=[0.022,0.03,0.026];
function softSeat(c,Wb,t,still){const P=Wb[BI.pelvis],o=M4.ap(P,[0,0.95,0]);let s=c._bb;const dt=s?t-s.t:0;
 if(!s||dt<0||dt>0.25||still){s=c._bb={t,p:o,v:null,q:[[0,0,0,0,0,0],[0,0,0,0,0,0]],sl:false};}
 else if(dt>0){const v=[0,1,2].map(j=>(o[j]-s.p[j])/dt);/* the first step after a (re)start only learns the speed, so walking on screen doesn't kick */
  let a=s.v?[0,1,2].map(j=>(v[j]-s.v[j])/dt):[0,0,0];const am=Math.hypot(a[0],a[1],a[2]);if(am>45)a=a.map(x=>x*45/am);
  s.p=o;s.v=v;s.t=t;
  /* the pelvis's acceleration in its own frame (axes read off the bone matrix, so its scale and turn drop out) */
  const ax=[0,1,2].map(k=>{const e=M4.ap(P,[k===0?1:0,0.95+(k===1?1:0),k===2?1:0]),d=[e[0]-o[0],e[1]-o[1],e[2]-o[2]],n=Math.hypot(d[0],d[1],d[2])||1;return(a[0]*d[0]+a[1]*d[1]+a[2]*d[2])/n;});
  /* a slap: the cheeks get pushed in and up, then bounce back */
  if(c.slapT>0.6&&!s.sl){s.sl=true;s.q[0][5]+=0.55;s.q[0][4]+=0.35;s.q[1][5]+=0.42;s.q[1][4]+=0.25;}else if(!(c.slapT>0))s.sl=false;
  const n=Math.max(1,Math.ceil(dt*120)),h=dt/n;
  for(let i=0;i<2;i++){const w=2*Math.PI*SOFT_HZ[i],k=w*w,d=2*SOFT_Z*w,q=s.q[i];
   for(let st=0;st<n;st++)for(let j=0;j<3;j++){const f=-k*q[j]-d*q[j+3]-ax[j]*SOFT_G[j];q[j+3]+=f*h;q[j]+=q[j+3]*h;if(Math.abs(q[j])>SOFT_MAX[j]){q[j]=Math.sign(q[j])*SOFT_MAX[j];q[j+3]*=-0.3;}}}}
 for(let i=0;i<2;i++){const q=s.q[i],C=SOFT_C[i],sy=1+q[1]*5,sx=1-q[1]*2.5,sz=1-q[1]*2.5-q[2]*2;
  Wb[SOFT_L+i]=M4.mul(P,[sx,0,0,0,0,sy,0,0,0,0,sz,0,C[0]+q[0]-sx*C[0],C[1]+q[1]-sy*C[1],C[2]+q[2]-sz*C[2],1]);}}
function blendPose(c,W,t){const L=W.map((w,i)=>BONES[i][1]<0?w.slice():M4.mul(invRigid(W[BONES[i][1]]),w)),P=c._pw,dt=t-(c._pwT||0);
 if(!P||dt<0||dt>0.3){c._pw=L;c._pwT=t;return W;}
 if(dt>0){c._pwT=t;const k=1-Math.exp(-dt*11);
  for(let i=0;i<L.length;i++){const a=P[i],b=L[i];for(const j of [0,1,2,4,5,6])a[j]+=(b[j]-a[j])*k;rigid3(a);
   /* turn about the joint: t = pv - R pv (+ the hips' own offset for the root) */
   const pv=BONES[i][2],rp=[a[0]*pv[0]+a[4]*pv[1]+a[8]*pv[2],a[1]*pv[0]+a[5]*pv[1]+a[9]*pv[2],a[2]*pv[0]+a[6]*pv[1]+a[10]*pv[2]];
   if(BONES[i][1]<0){const bp=[b[0]*pv[0]+b[4]*pv[1]+b[8]*pv[2],b[1]*pv[0]+b[5]*pv[1]+b[9]*pv[2],b[2]*pv[0]+b[6]*pv[1]+b[10]*pv[2]];
    a._r=a._r||[a[12]-(pv[0]-rp[0]),a[13]-(pv[1]-rp[1]),a[14]-(pv[2]-rp[2])];for(let q=0;q<3;q++)a._r[q]+=(b[12+q]-(pv[q]-bp[q])-a._r[q])*k;
    for(let q=0;q<3;q++)a[12+q]=pv[q]-rp[q]+a._r[q];}
   else for(let q=0;q<3;q++)a[12+q]=pv[q]-rp[q];}}
 const O=[];for(let i=0;i<P.length;i++)O[i]=BONES[i][1]<0?P[i]:M4.mul(O[BONES[i][1]],P[i]);return O;}
function pose(t,anim,jab,arms,kick,gait){const R={},rot=(b,ax,a)=>{R[b]=M4.mul(M4.R(ax,a),R[b]||M4.id());};let root=[0,0,0];const run=gait==='runway',fem=gait==='fem'||run;
 const armHinge=s=>V.norm(V.cross([AD[0]*s,AD[1],0],Z));
 const lower=(s,a)=>rot(s>0?'uarmL':'uarmR',Z,-a*s);
 const MP=window.MOCAP_PLAY;
 if(MP&&mocapPose(MP,R,root)){root=MP.root;
  /* the lambada was captured with a partner, so her arms dance on their own instead (the drifting gestures) */
  if(MP.arms){const b=MP.t*1.95*Math.PI*0.5,AR=danceArms(MP.t,b,Math.sin(b),false,MP.o||0,1);for(const nm of ['uarmL','farmL','handL','uarmR','farmR','handR'])delete R[nm];
   for(const sd of [1,-1]){const q=AR[sd>0?0:1],u=sd>0?'uarmL':'uarmR';lower(sd,q.lw);rot(u,X,q.fx);rot(sd>0?'farmL':'farmR',armHinge(sd),q.el);}}}
 else if(anim==='idle'&&fem){/* contrapposto: weight on the right leg, hip up on that side, left knee eased, shoulders counter-tilted */
  const br=Math.sin(t*1.6),sw=Math.sin(t*0.45)*0.012;lower(1,0.6);lower(-1,0.58);rot('uarmL',X,-0.04);rot('uarmR',X,-0.08);rot('farmL',armHinge(1),0.3);rot('farmR',armHinge(-1),0.38);
  rot('pelvis',Z,-0.07-sw);rot('pelvis',Y,0.06);rot('thighR',Z,0.075+sw);rot('thighL',Z,0.03+sw);rot('thighL',X,-0.1);rot('shinL',X,0.2);rot('footL',X,-0.08);rot('thighR',X,0.02);
  rot('spine',Z,0.05+sw*0.6);rot('chest',Z,0.035);rot('chest',X,-0.02*br);rot('spine',X,0.01);rot('neck',Z,-0.02);rot('neck',Y,Math.sin(t*0.5)*0.06);rot('head',X,Math.sin(t*0.37)*0.05);
  root=[-0.022,0.003*br-0.004,0];}
 else if(anim==='idle'){const br=Math.sin(t*1.6);lower(1,0.5);lower(-1,0.5);rot('uarmL',X,-0.05);rot('uarmR',X,-0.05);rot('farmL',armHinge(1),0.25);rot('farmR',armHinge(-1),0.25);
  rot('chest',X,-0.02*br);rot('neck',Y,Math.sin(t*0.5)*0.06);rot('head',X,Math.sin(t*0.37)*0.06);rot('spine',X,0.02);root=[0,0.004*br,0];rot('thighL',Z,0.03);rot('thighR',Z,-0.03);}
 else if(anim==='walk'&&run){/* runway walk for the dancers and the girls at home: each foot is placed on one line in front of the other,
   so the hips swing and drop over the stance leg; the knee straightens as the heel lands, the chest stays lifted, shoulders back and
   counter-turning a little, arms hang loose and swing softly from the shoulder with relaxed wrists, the head stays level */
  const w=t*2*Math.PI*0.95,s=Math.sin(w),c=Math.cos(w),roll=-0.12*c,shift=-0.042*c;
  rot('thighL',X,-0.38*s);rot('thighR',X,0.38*s);
  rot('shinL',X,0.04+0.66*Math.pow(Math.max(0,Math.sin(w+1.9)),1.4));rot('shinR',X,0.04+0.66*Math.pow(Math.max(0,Math.sin(w+1.9+Math.PI)),1.4));
  rot('footL',X,0.22*Math.max(0,-Math.sin(w+0.6)));rot('footR',X,0.22*Math.max(0,Math.sin(w+0.6)));
  const legZ=(-shift-0.83*roll)/0.83;rot('thighL',Z,legZ-0.12);rot('thighR',Z,legZ+0.12);
  lower(1,0.48);lower(-1,0.48);rot('uarmL',X,0.2*s);rot('uarmR',X,-0.2*s);rot('farmL',armHinge(1),0.26+0.12*Math.max(0,-s));rot('farmR',armHinge(-1),0.26+0.12*Math.max(0,s));
  rot('pelvis',Z,roll);rot('pelvis',Y,0.22*s);rot('spine',Z,-roll*1.2);rot('spine',Y,-0.08*s);rot('chest',Y,-0.1*s);rot('spine',X,-0.03);rot('chest',X,-0.07);rot('neck',Z,roll*0.45);rot('neck',X,0.04);
  root=[shift,0.012*Math.abs(c)-0.012,0];rot('head',X,-0.04);rot('head',Z,-roll*0.2);}
 else if(anim==='walk'&&fem){/* hip-led walk: pelvis shifts over the stance leg and drops on the swing side, feet track a narrow line,
   smaller arm swing close to the body, upright chest with little counter-rotation, steady head */
  const w=t*2*Math.PI*0.95,s=Math.sin(w),c=Math.cos(w),roll=-0.07*c,shift=-0.026*c;
  rot('thighL',X,-0.42*s);rot('thighR',X,0.42*s);rot('shinL',X,0.08+0.72*Math.max(0,Math.sin(w+1.9)));rot('shinR',X,0.08+0.72*Math.max(0,Math.sin(w+1.9+Math.PI)));
  rot('footL',X,0.28*Math.max(0,-Math.sin(w+0.6)));rot('footR',X,0.28*Math.max(0,Math.sin(w+0.6)));
  const legZ=(-shift-0.83*roll)/0.83;rot('thighL',Z,legZ-0.05);rot('thighR',Z,legZ+0.05);
  lower(1,0.6);lower(-1,0.6);rot('uarmL',X,0.3*s);rot('uarmR',X,-0.3*s);rot('farmL',armHinge(1),0.42+0.16*Math.max(0,-s));rot('farmR',armHinge(-1),0.42+0.16*Math.max(0,s));
  rot('pelvis',Z,roll);rot('pelvis',Y,0.15*s);rot('spine',Z,-roll*1.15);rot('chest',Y,-0.08*s);rot('spine',X,0.02);rot('chest',X,-0.03);rot('neck',Z,roll*0.3);
  root=[shift,0.016*Math.abs(c)-0.014,0];rot('head',X,-0.02);}
 else if(anim==='walk'){const w=t*2*Math.PI*0.95,s=Math.sin(w),c=Math.cos(w);
  rot('thighL',X,-0.45*s);rot('thighR',X,0.45*s);rot('shinL',X,0.08+0.75*Math.max(0,Math.sin(w+1.9)));rot('shinR',X,0.08+0.75*Math.max(0,Math.sin(w+1.9+Math.PI)));
  rot('footL',X,0.25*Math.max(0,-Math.sin(w+0.6)));rot('footR',X,0.25*Math.max(0,Math.sin(w+0.6)));
  lower(1,0.52);lower(-1,0.52);rot('uarmL',X,0.38*s);rot('uarmR',X,-0.38*s);rot('farmL',armHinge(1),0.35+0.2*Math.max(0,-s));rot('farmR',armHinge(-1),0.35+0.2*Math.max(0,s));
  rot('pelvis',Y,0.1*s);rot('chest',Y,-0.16*s);rot('spine',X,0.06);root=[0,0.025*Math.abs(c)-0.02,0];rot('head',X,-0.04);}
 else if(anim==='dance'||anim==='lapdance'){
  /* dancing is built in layers so she never holds a pose:
     1. the groove (danceGroove): weight rolls from leg to leg, the hips sway and turn over the standing leg in a soft figure eight,
        the ribcage counters them (an S-curve) and the head rides on top a beat late; the free knee bends in with the heel up;
     2. arm gestures that drift from one into the next (danceArms): loose arms, hands on the hips, hands up the body, one arm up,
        hands in the hair, a snake wave. Each girl runs her own order and timing, so no two dance alike;
     3. the stage routines (window.DANCE_MOVE.m, faded in and out by .e): pole (back to the pole, a hand up it, body waves and a slow
        slide down), spin (round the pole holding on, the inner leg hooked), drop (a slow squat that rises hips first), hair (a flip).
     Girls at home ('party') dance smaller with their arms mostly low, and .en eases them in after they stop walking.
     The lap dance keeps its own pose over the groove. */
  const jg=window.DANCE_JIGGLE||{x:0,y:0,boost:0},DM=window.DANCE_MOVE||{m:'sway',e:1},c01=v=>v<0?0:v>1?1:v;
  const lap=anim==='lapdance',m=lap?'lap':DM.m,party=m==='party',e=(lap||party||m==='sway')?0:c01(DM.e),en=DM.en===undefined?1:c01(DM.en);
  const tt=t+(DM.o||0),G0=danceGroove(tt,lap),ws=G0.ws,b=G0.b,amp=(party?0.8:1)*(0.25+0.75*en);
  const gb=amp*(lap?1:1-e*(m==='spin'?0.8:m==='drop'?0.55:m==='pole'?0.4:0.25));
  const pz=-0.13*ws*gb,rx=-0.05*ws*gb,legZ=(-rx-0.83*pz)/0.83;
  rot('pelvis',Z,pz+jg.x*0.1);rot('pelvis',Y,0.17*Math.cos(b-0.25)*gb);rot('pelvis',X,(0.07*Math.sin(2*b-0.3)+jg.y*0.12)*gb);
  rot('spine',X,(-0.05*Math.sin(2*b-0.9)-jg.y*0.15)*gb);rot('chest',X,(0.07*Math.sin(2*b-1.5)+jg.y*0.3)*gb);
  rot('spine',Z,(0.08*G0.wl-jg.x*0.12)*gb);rot('chest',Z,(0.06*G0.wl2+jg.x*0.18)*gb);rot('chest',Y,-0.1*Math.cos(b-0.6)*gb);rot('neck',Z,-0.06*G0.wl2*gb);
  const fl=Math.max(0,ws),fr=Math.max(0,-ws),dip=G0.dip;
  rot('thighL',Z,legZ);rot('thighR',Z,legZ);
  rot('thighL',X,(-0.24*fl-0.05*dip-0.03)*gb);rot('shinL',X,(0.46*fl+0.12*dip+0.06)*gb);rot('footL',X,0.26*fl*gb);rot('thighL',Y,-0.12*fl*gb);
  rot('thighR',X,(-0.24*fr-0.05*dip-0.03)*gb);rot('shinR',X,(0.46*fr+0.12*dip+0.06)*gb);rot('footR',X,0.26*fr*gb);rot('thighR',Y,0.12*fr*gb);
  root=[rx,(-0.03*dip-0.012*(fl+fr)-0.008)*gb,0];
  rot('head',Z,-0.07*G0.wl2*gb);rot('head',X,(-0.05*Math.sin(2*b-2.2)-jg.y*0.1)*gb);rot('neck',Y,(0.16*Math.sin(tt*0.37)+0.07*Math.sin(tt*0.93))*gb);
  if(lap){
   rot('thighL',X,-0.38);rot('thighR',X,-0.38);rot('thighL',Z,0.26);rot('thighR',Z,-0.26);rot('shinL',X,0.55);rot('shinR',X,0.55);
   lower(1,0.3);lower(-1,0.3);rot('uarmL',X,-0.6+0.16*Math.cos(b-0.8));rot('uarmR',X,-0.6-0.16*Math.cos(b-0.8));
   rot('farmL',armHinge(1),1.1);rot('farmR',armHinge(-1),1.1);
   root[1]+=-0.12+0.04*Math.abs(Math.sin(b));root[2]+=0.05*Math.cos(b);}
  else{const k=1-e;
   if(k>0){const AR=danceArms(tt,b,ws,party,DM.o||0,en);
    for(const s of [1,-1]){const q=AR[s>0?0:1],u=s>0?'uarmL':'uarmR';lower(s,q.lw*k);rot(u,X,q.fx*k);rot(s>0?'farmL':'farmR',armHinge(s),q.el*k);}}
   const kk=e,T0=DM.t||0;
   if(m==='pole'&&kk>0){const v=b*0.5,wv=x=>Math.sin(v-x),q=(0.5-0.5*Math.cos(T0*0.8))*kk,u=0.5-0.5*Math.cos(v);
    /* body waves from the knees up through the hips, ribs and head, with her back on the pole; now and then a slow slide down it */
    rot('thighL',X,-(0.1+0.08*wv(0))*kk);rot('thighR',X,-(0.1+0.08*wv(0))*kk);rot('shinL',X,(0.2+0.16*wv(0))*kk);rot('shinR',X,(0.2+0.16*wv(0))*kk);
    rot('pelvis',X,0.2*wv(0.6)*kk);rot('spine',X,-0.18*wv(1.2)*kk);rot('chest',X,0.22*wv(1.8)*kk);rot('head',X,-0.13*wv(2.4)*kk);
    rot('thighL',X,-0.75*q);rot('thighR',X,-0.75*q);rot('thighL',Z,0.24*q);rot('thighR',Z,-0.24*q);rot('shinL',X,1.3*q);rot('shinR',X,1.3*q);rot('footL',X,-0.5*q);rot('footR',X,-0.5*q);
    root[1]+=(-0.02-0.012*wv(0))*kk-0.17*q;
    /* one hand up the pole behind her head, the other runs up her body */
    lower(-1,-2.3*kk);rot('uarmR',X,0.4*kk);rot('farmR',armHinge(-1),0.55*kk);
    lower(1,(0.48-0.2*u)*kk);rot('uarmL',X,-0.45*u*kk);rot('farmL',armHinge(1),(0.4+1.3*u)*kk);}
   else if(m==='spin'&&kk>0){const sw2=Math.sin(T0*2.2);
    /* round the pole: the inner (right) hand high on it, the outer arm out in a long line, leaning out; inner leg hooked, outer leg trailing */
    lower(-1,-2.45*kk);rot('uarmR',X,-0.1*kk);rot('farmR',armHinge(-1),0.35*kk);
    lower(1,(-0.3+0.15*sw2)*kk);rot('uarmL',X,0.3*kk);rot('farmL',armHinge(1),0.25*kk);
    rot('spine',Z,-0.14*kk);rot('chest',Z,-0.08*kk);rot('spine',X,-0.1*kk);rot('chest',X,-0.12*kk);rot('head',X,-0.22*kk);rot('head',Z,-0.1*kk);
    rot('thighR',X,-1.0*kk);rot('shinR',X,1.45*kk);rot('footR',X,0.55*kk);rot('thighR',Z,-0.12*kk);
    rot('thighL',X,(0.22+0.1*sw2)*kk);rot('shinL',X,0.5*kk);rot('footL',X,0.6*kk);}
   else if(m==='drop'&&kk>0){const ph=T0*1.1,q=(0.5-0.5*Math.cos(ph))*kk,rise=Math.max(0,-Math.sin(ph))*Math.min(1,q*3);
    /* a slow squat with the knees open and the hands on the knees; she comes back up hips first, the chest following */
    rot('thighL',X,-1.25*q);rot('thighR',X,-1.25*q);rot('thighL',Z,0.42*q);rot('thighR',Z,-0.42*q);
    rot('shinL',X,2.1*q);rot('shinR',X,2.1*q);rot('footL',X,-0.85*q);rot('footR',X,-0.85*q);
    rot('pelvis',Y,0.2*Math.sin(b)*q);rot('spine',X,(0.26*q+0.32*rise)*kk);rot('chest',X,0.06*q);rot('head',X,(-0.22*q-0.2*rise)*kk);
    lower(1,(0.55-0.1*q)*kk);lower(-1,(0.55-0.1*q)*kk);rot('uarmL',X,(-0.1-0.45*q)*kk);rot('uarmR',X,(-0.1-0.45*q)*kk);rot('farmL',armHinge(1),(0.35+0.25*q)*kk);rot('farmR',armHinge(-1),(0.35+0.25*q)*kk);
    root[1]-=0.44*q;}
   else if(m==='hair'&&kk>0){const f=Math.sin(b*0.5+0.4),fp=Math.max(0,f),fn=Math.max(0,-f);
    /* bends forward, then whips the hair back as she comes up, hands running up through it */
    rot('spine',X,(0.34*fp-0.14*fn)*kk);rot('chest',X,0.18*f*kk);rot('neck',X,0.24*f*kk);rot('head',X,0.3*f*kk);rot('head',Z,0.12*Math.cos(b*0.5)*kk);
    lower(1,(-1.9+0.45*fp)*kk);lower(-1,(-1.75+0.5*fp)*kk);rot('uarmL',X,(0.4-0.55*fp)*kk);rot('uarmR',X,(0.35-0.55*fp)*kk);rot('farmL',armHinge(1),(2.0-0.5*fp)*kk);rot('farmR',armHinge(-1),(1.9-0.5*fp)*kk);
    rot('shinL',X,(0.18+0.12*Math.abs(f))*kk);rot('shinR',X,(0.18+0.12*Math.abs(f))*kk);rot('thighL',X,-(0.09+0.06*Math.abs(f))*kk);rot('thighR',X,-(0.09+0.06*Math.abs(f))*kk);root[1]-=(0.012+0.012*Math.abs(f))*kk;}
  }
 }
 else{ /* boxer: fists up, bouncing */
  const b=Math.abs(Math.sin(t*4.2)),j=jab===undefined?Math.max(0,Math.sin(t*1.3))**8:jab;root=[0,-0.035-b*0.025,0];
  rot('thighL',X,-0.28);rot('thighR',X,0.08);rot('thighL',Z,0.1);rot('thighR',Z,-0.1);rot('shinL',X,0.42);rot('shinR',X,0.32);rot('footL',X,-0.14);rot('footR',X,-0.4);
  rot('pelvis',Y,0.32);rot('spine',X,0.12);rot('chest',Y,-0.2);rot('chest',X,0.06);rot('neck',X,0.1);rot('head',X,-0.06);
  lower(1,0.62);lower(-1,0.6);rot('uarmL',X,-0.62+j*0.1);rot('uarmR',X,-0.7-j*0.85);rot('uarmL',Y,-0.2);rot('uarmR',Y,0.25-j*0.2);
  rot('farmL',armHinge(1),2.25);rot('farmR',armHinge(-1),2.2-j*1.9);rot('handL',armHinge(1),0.25);rot('handR',armHinge(-1),0.25-j*0.25);}
 if(arms){for(const b of ['uarmL','uarmR','farmL','farmR','handL','handR'])delete R[b];const k=kick||0;
  const up=(s,x,y,z)=>{const u=s>0?'uarmL':'uarmR';lower(s,0.66);rot(u,X,x);rot(u,Y,y);if(z)rot(s>0?'farmL':'farmR',armHinge(s),z);};
  if(arms==='execGun'){up(-1,-0.75+k,0.2,0.1);up(1,-0.7,-0.45,0.5);}
  else if(arms==='aim'){up(-1,-1.5+k*1.6,0.22,0.05+k);up(1,-1.36+k,-0.52,0.4);}
  else if(arms==='aim1'){up(-1,-1.52+k*2,0.12,k);lower(1,0.5);rot('farmL',armHinge(1),0.25);}
  else if(arms==='dual'){up(-1,-1.5+k,0.1,0.02);up(1,-1.5+k*0.6,-0.1,0.02);}
  else if(arms==='rifle'){const pm=window.PUMP||0;up(-1,-1.2+k,0.3,0.9);up(1,-1.36+0.3*pm,-0.4,0.25+0.75*pm);}
  else if(arms==='low'){lower(-1,0.5);rot('uarmR',X,-0.15);rot('farmR',armHinge(-1),0.35);lower(1,0.5);rot('farmL',armHinge(1),0.25);}
  else if(arms==='cash'){lower(-1,0.5);rot('uarmR',X,-0.12);rot('farmR',armHinge(-1),0.3);up(1,-0.7,-0.35,1.4);}
  else if(arms==='melee'){up(-1,-1.0-0.45*k,0.75-1.7*k,1.15-0.95*k);lower(1,0.5);rot('farmL',armHinge(1),0.4);}
  else if(arms==='slap'){/* wind the right hand back, swing it through low and in front, let it come back */
   const sx=k<0.3?0.75*k/0.3:k<0.5?0.75-1.45*(k-0.3)/0.2:-0.7*(1-(k-0.5)/0.5);up(-1,sx,0.15,0.45);rot('chest',Y,-0.25*sx);lower(1,0.5);rot('farmL',armHinge(1),0.3);}
  else if(arms==='talk'){const g=Math.sin(t*2.3)*0.22,g2=Math.sin(t*1.7+1)*0.22;up(-1,-0.5+g,0.25,1.2+g2);up(1,-0.55-g2,-0.25,1.1+g);}}
 if(window.SLAPK){const q=window.SLAPK,sd=q<0?-1:1,a=Math.abs(q);/* a little jump, hips forward, a look back over the shoulder */
  rot('pelvis',X,-0.22*a);rot('spine',X,-0.08*a);rot('chest',X,-0.08*a);rot('neck',Y,0.5*a*sd);rot('head',Y,0.3*a*sd);rot('head',X,-0.1*a);
  rot('thighL',X,-0.12*a);rot('shinL',X,0.3*a);root[1]+=0.035*a;}
 if(window.EXLEAN){rot('spine',X,0.35*window.EXLEAN);rot('chest',X,0.2*window.EXLEAN);rot('thighL',X,-0.35*window.EXLEAN);rot('thighR',X,-0.1*window.EXLEAN);rot('shinL',X,0.55*window.EXLEAN);rot('shinR',X,0.3*window.EXLEAN);root[1]-=0.08*window.EXLEAN;}
 if(window.CROUCH){const c=window.CROUCH;/* W7 cover crouch: deep knee bend, feet flat, chest over knees */
  rot('thighL',X,-1.45*c);rot('thighR',X,-1.3*c);rot('shinL',X,2.2*c);rot('shinR',X,2.05*c);rot('footL',X,-0.75*c);rot('footR',X,-0.75*c);rot('spine',X,0.4*c);rot('chest',X,0.15*c);root[1]-=0.47*c;}
 if(window.SIT){const c=window.SIT;/* sat on a sofa or chair: thighs level, shins down, back upright, hands on the knees */
  rot('thighL',X,-1.5*c);rot('thighR',X,-1.42*c);rot('shinL',X,1.5*c);rot('shinR',X,1.42*c);rot('spine',X,-0.06*c);root[1]-=0.4*c;}
 if(window.DRIVE){/* at the wheel: legs out to the pedals, back against the seat, both hands up on the rim */
  for(const b of ['thighL','thighR','shinL','shinR','footL','footR','uarmL','uarmR','farmL','farmR','spine','chest','pelvis'])delete R[b];
  rot('thighL',X,-1.32);rot('thighR',X,-1.28);rot('shinL',X,0.62);rot('shinR',X,0.5);rot('spine',X,-0.14);rot('chest',X,-0.06);
  rot('uarmL',X,-1.05);rot('uarmR',X,-1.05);rot('uarmL',Z,0.16);rot('uarmR',Z,-0.16);rot('farmL',armHinge(1),0.5);rot('farmR',armHinge(-1),0.5);root=[0,-0.42,0];}
 R.head=M4.mul(M4.R(X,0.06),R.head||M4.id());
 const W=[];for(let i=0;i<NB;i++){const b=BONES[i],pv=b[2],L=M4.mul(M4.mul(M4.T(pv[0],pv[1],pv[2]),R[b[0]]||M4.id()),M4.T(-pv[0],-pv[1],-pv[2]));W[i]=b[1]<0?M4.mul(M4.T(root[0],root[1],root[2]),L):M4.mul(W[b[1]],L);}
 return W;}
const NB=BONES.length;let ready=false,shaderReady=false,status='loading',P=null,MODELS={},Lc={},queue=[];
const CH={
 consigliere:{face:'face',F:{EM:[190,192],TS:0.158,prof:[[0,0],[53,13],[93,5],[153,0]],skin:[[120,250],[250,250],[186,95],[150,120],[220,120],[186,320]]},
  B:{jacket:[162,132,210],pants:[154,126,202],shirt:'pais',watch:-1,dusters:true,shoe:[42,36,48],shoulders:0.22},scale:[1.14,1.36,1.12],neckDrop:0.04},
 money:{face:'money',F:{...FACECFG.money,skin:[[110,255],[240,255],[176,90],[150,110],[205,110]]},
  B:{jacket:[236,232,222],pants:[226,222,212],shirt:[246,244,240],pin:false,watch:1,shoe:[170,140,105]},scale:[0.93,1.0,0.93]},
 don:{face:'don',F:{...FACECFG.don,skin:[[150,140],[200,140],[176,150]],hairPt:[176,72],beardPt:[176,342],beardTop:1.7},
  B:{jacket:[240,236,228],pants:[234,230,222],shirt:[112,42,172],chain:true,cigar:true,watch:1,shoe:[96,60,34],square:'#7b2fc0',pin:false,belly:0.13},scale:[1.34,0.97,1.28]},
 nine:{face:'nine',F:{EM:[176,192],prof:[[0,0],[43,2],[70,4],[153,2]],glassesSwatch:1,smile:1,hl:106,hr:104,skin:[[150,118],[200,118],[176,100],[118,212],[236,212]],hairPt:[176,62],beardPt:[176,322],beardTop:1.69,beardBot:1.53},
  B:{jacket:[24,24,30],pants:[42,44,58],shirt:[204,90,42],dolphin:true,pin:false,shoe:[30,24,22],belly:0.12,shoulders:0.06,specs:1,fluff:'photo',hairVol:true},scale:[1.24,0.98,1.2]},
 vic:{face:'vic',F:{EM:[174,192],prof:[[0,0],[50,-10],[86,-4],[150,0]],hl:96,hr:94,skin:[[135,245],[215,245],[175,110],[150,130],[200,130]],hairPt:[175,40]},
  B:{jacket:[246,150,170],pants:[238,234,226],shirt:[22,20,26],watch:1,chain:true,shoe:[236,232,224],pin:false,square:'#2de2e6',shoulders:0.1,hairVol:true},scale:[1.12,1.02,1.1]},
 schmaltzy:{face:'schmaltzy',F:{EM:[175,192],prof:[[0,0],[50,-10],[86,-4],[150,0]],hl:104,hr:104,skin:[[110,265],[240,270],[175,140],[150,150],[205,150]],hairPt:[175,40]},
  B:{jacket:[246,214,190],pants:[240,208,184],shirt:'tropical',deepV:true,chains:true,rings:2,watch:1,shoe:[200,170,130],pin:false,square:'#ff8a6a',hairBig:1},scale:[1.04,0.98,1.02]},
 felix:{face:'felix',F:{EM:[174,192],prof:[[0,0],[50,-10],[86,-4],[150,0]],hl:100,hr:100,skin:[[100,250],[245,250],[175,135],[150,145],[200,145]],hairPt:[175,40]},
  B:{jacket:[244,168,190],pants:[240,164,186],shirt:'tropical',deepV:true,chains:true,rings:2,watch:1,shoe:[246,244,238],pin:false,square:'#2de2e6',shoulders:0.08,hairBig:3},scale:[1.0,1.03,1.0]},
 lola:{face:'lola',F:{EM:[174,192],prof:[[0,0],[50,-10],[86,-4],[150,0]],hl:96,hr:96,skin:[[120,250],[230,250],[175,140],[150,150],[200,150]],hairPt:[70,90]},
  B:{fem:true,skirt:0.55,heels:true,pads:true,jacket:[178,28,52],pants:[150,32,50],shirt:[22,20,24],chain:true,watch:-1,shoe:[40,24,28],pin:false,hairBig:2},scale:[0.9,1.0,0.88]},
 mcwey:{face:'mcwey',F:{...FACECFG.mcwey,hl:100,hr:126,beardBot:1.545,skin:[[120,235],[232,235],[176,100],[140,130],[212,130]],beardPt:[130,305],beardTop:1.69},
  B:{jacket:[228,218,198],pants:[222,212,192],shirt:'tropical',deepV:true,chains:true,rings:2,watch:1,shoe:[196,180,156],pin:false,square:'#e8dcc8'},scale:[1.06,1.0,1.06]},
};
const mainIds=Object.keys(CH),modelStates=Object.fromEntries(mainIds.map(id=>[id,'loading']));
function modelFailure(id,e){modelStates[id]='failed';$('modelWarning').style.display='block';console.error('PS2C '+id,e);}
function paintSmile(cv,F){const x=cv.getContext('2d'),C=256,my=277,hw=36;
 if(F.beard){x.fillStyle=rgb(F.beard);x.fillRect(188,0,24,6);}
 const mouth=()=>{x.beginPath();x.moveTo(C-hw,my-14);x.quadraticCurveTo(C,my,C+hw,my-14);x.quadraticCurveTo(C+hw*0.62,my+19,C,my+20);x.quadraticCurveTo(C-hw*0.62,my+19,C-hw,my-14);x.closePath();};
 x.save();mouth();x.fillStyle='#3a0e12';x.fill();x.clip();x.fillStyle='#f3ede2';x.beginPath();x.moveTo(C-hw,my-15);x.quadraticCurveTo(C,my-1,C+hw,my-15);x.lineTo(C+hw,my-2);x.quadraticCurveTo(C,my+12,C-hw,my-2);x.closePath();x.fill();
 x.strokeStyle='rgba(120,100,90,.55)';x.lineWidth=1;for(let i=-3;i<=3;i++){const tx=C+i*7;x.beginPath();x.moveTo(tx,my-4+Math.abs(i)*0.6);x.lineTo(tx,my+7-Math.abs(i)*0.5);x.stroke();}
 x.fillStyle='rgba(200,80,90,.5)';x.beginPath();x.ellipse(C,my+12,hw*0.45,3,0,0,6.3);x.fill();x.restore();
 mouth();x.strokeStyle='#1e0606';x.lineWidth=3.4;x.stroke();
 x.strokeStyle='rgba(60,20,10,.7)';x.lineWidth=1.6;for(const sd of [1,-1]){x.lineWidth=2.4;x.beginPath();x.moveTo(C+sd*(hw+1),my-14);x.quadraticCurveTo(C+sd*(hw+6),my-16,C+sd*(hw+7),my-23);x.stroke();}}
function dolphinPrint(x){const pat=(x0,y0,w,h,skipV)=>{x.save();x.beginPath();x.rect(x0,y0,w,h);if(skipV)x.rect(362,0,-212,150);x.clip('evenodd');if(L.fem&&L.crop){x.beginPath();x.rect(0,0,512,512);x.rect(0,139,512,34);x.clip('evenodd');}
  for(let k=0;k<w*h/900;k++){const px=x0+Math.random()*w,py=y0+Math.random()*h,sz=6+Math.random()*5,cs=Math.random()<0.55?['#ff5fb8','#ffb070']:['#2de2e6','#3a6ae0'];x.save();x.translate(px,py);x.rotate(Math.random()*6.3);const gr=x.createLinearGradient(-sz*1.6,0,sz*1.6,0);gr.addColorStop(0,cs[0]);gr.addColorStop(1,cs[1]);x.fillStyle=gr;x.beginPath();x.ellipse(0,0,sz*1.6,sz*0.55,0,0,6.3);x.fill();x.beginPath();x.moveTo(-sz*1.4,0);x.lineTo(-sz*2.3,-sz*0.7);x.lineTo(-sz*2.2,sz*0.7);x.closePath();x.fill();x.beginPath();x.moveTo(-sz*0.2,-sz*0.45);x.lineTo(sz*0.25,-sz*1.1);x.lineTo(sz*0.6,-sz*0.4);x.closePath();x.fill();x.restore();}x.restore();};
  pat(0,0,512,290,true);pat(0,290,512,90,false);}
function tropicalCanvas(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#2a8f8a';x.fillRect(0,0,128,128);
 const leaf=(cx,cy,a,sz,col)=>{x.save();x.translate(cx,cy);x.rotate(a);x.fillStyle=col;x.beginPath();x.moveTo(0,-sz);x.quadraticCurveTo(sz*0.5,-sz*0.2,0,sz);x.quadraticCurveTo(-sz*0.5,-sz*0.2,0,-sz);x.fill();x.strokeStyle='rgba(90,30,50,.5)';x.lineWidth=1;x.beginPath();x.moveTo(0,-sz*0.9);x.lineTo(0,sz*0.9);x.stroke();for(let k=-3;k<=3;k++){x.beginPath();x.moveTo(0,k*sz*0.22);x.lineTo(sz*0.3*Math.sign(k||1),k*sz*0.22-sz*0.12);x.stroke();}x.restore();};
 const pts=[[20,22,0.6],[84,14,-0.7],[52,60,1.9],[110,70,0.3],[18,96,-1.2],[76,104,2.6],[44,6,2.2],[118,118,-0.4]];
 for(const [px,py,a] of pts)for(const [ox,oy] of [[0,0],[128,0],[-128,0],[0,128],[0,-128]]){leaf(px+ox,py+oy,a,20,'#d98aa4');leaf(px+ox+6,py+oy+4,a+0.5,12,'#b8607e');}
 x.globalAlpha=0.08;x.strokeStyle='#000';for(let i=0;i<128;i+=2){x.beginPath();x.moveTo(i,0);x.lineTo(i,128);x.stroke();}return c;}
function shirtCanvas(col){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle=rgb(col);x.fillRect(0,0,64,64);
 x.globalAlpha=0.08;x.strokeStyle='#000';for(let i=0;i<64;i+=2){x.beginPath();x.moveTo(i,0);x.lineTo(i,64);x.stroke();}x.globalAlpha=0.06;x.strokeStyle='#fff';for(let i=1;i<64;i+=3){x.beginPath();x.moveTo(0,i);x.lineTo(64,i);x.stroke();}return c;}
const VS=`attribute vec3 aP;attribute vec3 aN;attribute vec2 aT;attribute vec4 aBi;attribute vec4 aBw;
uniform mat4 uVP;uniform mat4 uB[${NBS}];uniform vec4 uPL[8];uniform vec3 uPC[8];uniform vec3 uAmb;uniform vec3 uLD;uniform vec3 uLC;uniform vec3 uCam;uniform vec2 uFog;
varying vec2 vT;varying vec3 vL;varying float vS;varying float vF;
void main(){mat4 M=uB[int(aBi.x)]*aBw.x+uB[int(aBi.y)]*aBw.y+uB[int(aBi.z)]*aBw.z+uB[int(aBi.w)]*aBw.w;
 vec4 w=M*vec4(aP,1.0);vec3 n=normalize((M*vec4(aN,0.0)).xyz);vec3 V=normalize(uCam-w.xyz);
 vec3 l=uAmb*(0.85+0.25*n.y)+uLC*max((dot(n,-uLD)+0.25)/1.25,0.0)*0.8;float sp=0.0;
 for(int i=0;i<8;i++){vec3 L=uPL[i].xyz-w.xyz;float d=length(L);L/=max(d,0.001);float a=clamp(1.0-d/max(uPL[i].w,0.001),0.0,1.0);a*=a;l+=uPC[i]*a*max((dot(n,L)+0.25)/1.25,0.0);sp+=a*pow(max(dot(n,normalize(L+V)),0.0),16.0)*length(uPC[i])*0.05;}
 l+=pow(1.0-max(dot(n,V),0.0),3.0)*vec3(0.45,0.3,0.6)*0.3;vL=l;vS=sp;vT=aT;vF=clamp((length(uCam-w.xyz)-uFog.x)/(uFog.y-uFog.x),0.0,1.0);gl_Position=uVP*w;}`;
const FS=`precision highp float;varying vec2 vT;varying vec3 vL;varying float vS;varying float vF;uniform sampler2D uTex;uniform vec3 uFogC;
void main(){vec3 c=texture2D(uTex,vT).rgb*vL+vec3(vS)*0.5;gl_FragColor=vec4(mix(c,uFogC,vF),1.0);}`;
function sh(t,src){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(message);}return s;}
function mkTex(cnv){const t=gl.createTexture();try{gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cnv);gl.generateMipmap(gl.TEXTURE_2D);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}catch(e){gl.deleteTexture(t);throw e;}}
function freeModel(parts){if(parts&&window.NVNEXT&&NVNEXT.impl&&NVNEXT.impl.free)NVNEXT.impl.free(parts);for(const m of parts||[]){for(const b of ['p','n','t','bi','bw','i'])if(m[b])gl.deleteBuffer(m[b]);if(m.tex)gl.deleteTexture(m.tex);}}
function upload(Mh,tex){const o={tex,n_i:Mh.idx.length};const mk=(key,d)=>{const b=o[key]=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,d,gl.STATIC_DRAW);};
 try{mk('p',new Float32Array(Mh.p));mk('n',normals(Mh));mk('t',new Float32Array(Mh.uv));mk('bi',new Float32Array(Mh.bi));mk('bw',new Float32Array(Mh.bw));o.i=gl.createBuffer();
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,o.i);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(Mh.idx),gl.STATIC_DRAW);return o;}catch(e){freeModel([o]);throw e;}}
async function init(){const shaders=[];try{
 P=gl.createProgram();for(const [type,source] of [[gl.VERTEX_SHADER,VS],[gl.FRAGMENT_SHADER,FS]]){const s=sh(type,source);shaders.push(s);gl.attachShader(P,s);}gl.linkProgram(P);if(!gl.getProgramParameter(P,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(P));
 for(const n of ['uVP','uB','uPL','uPC','uAmb','uLD','uLC','uCam','uFog','uFogC','uTex'])Lc[n]=gl.getUniformLocation(P,n);for(const n of ['aP','aN','aT','aBi','aBw'])Lc[n]=gl.getAttribLocation(P,n);
 shaderReady=true;
 try{PAIS=await loadImg(ART.pais,'pais');}catch(e){modelFailure('consigliere',e);}if(contextLost||gl.isContextLost())return;
 for(const id of mainIds){if(modelStates[id]==='failed')continue;try{const C=CH[id];C.img=await loadImg(ART[C.face],C.face);if(contextLost||gl.isContextLost())return;buildCH(id);modelStates[id]='ready';C.suitOn=null;applySuit(id);}catch(e){modelFailure(id,e);}finally{gl.bindTexture(gl.TEXTURE_2D,atlasTex);}}
 ready=mainIds.every(id=>modelStates[id]==='ready');status=ready?'ready':'degraded';
 }catch(e){shaderReady=false;status='failed';for(const id of mainIds)modelStates[id]='failed';if(P)gl.deleteProgram(P);P=null;$('modelWarning').style.display='block';console.error('PS2C',e);}
 finally{for(const s of shaders)gl.deleteShader(s);gl.bindTexture(gl.TEXTURE_2D,atlasTex);}}
 let PAIS=null;function jewelB(id,B){const p=PROG[id];if(!p||!CHARS.some(c=>c.id===id))return;const j=p.jewel||{},w=k=>j[k]===true;if(B.chains0===undefined)B.chains0=!!B.chains;B.nowatch=!w('watch');B.chain=w('chain');B.rings=w('rings')?2:0;B.chains=B.chains0||w('cuban');B.bracelet=w('bracelet');B.medal=w('medal');const sk=typeof shadesOn==='function'?shadesOn(p):null;B.sun=sk?SHADES[sk]:null;}
 function buildCH(id){const C=CH[id],face=C.img,pais=PAIS;jewelB(id,C.B);const ht=paintHead(face,C.F);if(C.F.smile)paintSmile(ht,C.F);const shirt=C.B.shirt==='pais'?pais:C.B.shirt==='tropical'?tropicalCanvas():shirtCanvas(C.B.shirt);const bt=paintBody(shirt,Object.assign({shirtScale:C.B.shirt==='pais'?0.26:C.B.shirt==='tropical'?0.45:1},C.B));if(C.B.dolphin)dolphinPrint(bt.getContext('2d'));
  const cp=cv=>{const k=document.createElement('canvas');k.width=cv.width;k.height=cv.height;k.getContext('2d').drawImage(cv,0,0);return k;};const canvases={bc:bt,hc:ht,bcBase:cp(bt),bc0:cp(bt),hc0:cp(ht)},parts=[];
  try{parts.push(upload(buildBody(C.B),mkTex(bt)));parts.push(upload(buildHead(C.B),mkTex(ht)));}catch(e){freeModel(parts);throw e;}
  const old=MODELS[id];MODELS[id]=parts;Object.assign(C,canvases);freeModel(old);}
 function rebuild(id){if(!shaderReady||!CH[id]||!CH[id].img)return;try{buildCH(id);CH[id].suitOn=null;applySuit(id);}catch(e){$('modelWarning').style.display='block';console.error('PS2C rebuild '+id,e);}finally{gl.bindTexture(gl.TEXTURE_2D,atlasTex);}}
const RW=mir(WR),ADR=[-AD[0],AD[1],0],LW=WR,ADL=[AD[0],AD[1],0];
function handFrame(Wm,left,sw,base){const Mh=Wm[left?BI.handL:BI.handR],w=left?LW:RW,a=left?ADL:ADR,pm=left?V.norm(V.cross(a,Z)).map(v=>v):V.norm(V.cross(a,Z)).map(v=>-v);
 const O=M4.ap(Mh,V.add(w,V.mul(a,0.065))),dz=V.norm(V.sub(M4.ap(Mh,V.add(w,a)),M4.ap(Mh,w))),dy=V.norm(V.sub(M4.ap(Mh,V.add(w,Z)),M4.ap(Mh,w))),dx=V.norm(V.cross(dy,dz)),dy2=V.cross(dz,dx);
 return [dx[0]*sw,dy2[0]*sw,dz[0]*sw,O[0],dx[1]*sw,dy2[1]*sw,dz[1]*sw,O[1],dx[2]*sw,dy2[2]*sw,dz[2]*sw,O[2]];}
/* ---------- generic PS2 models for NPCs & enemies, built from their game "look" ---------- */
const C255=c=>(c||[0.5,0.5,0.5]).map(v=>Math.round(v*255));
const BODYCFG={fat:{scale:[1.22,0.98,1.2],belly:0.12,shoulders:0.08},big:{scale:[1.14,1.06,1.1],shoulders:0.24},thin:{scale:[0.86,1.05,0.86]},slim:{scale:[0.93,1.02,0.93]},stocky:{scale:[1.08,0.96,1.08],shoulders:0.1},boss:{scale:[1.2,1.0,1.18],belly:0.1,shoulders:0.12},normal:{scale:[1,1,1]}};
/* the men's face volume map is the same for every generated head (only the cheek hollows scale with age), so it is worked out once:
   s = light and shade, h = cheek hollows, w = warmth on the cheeks, nose and ears. Building a look stays as cheap as before on phones. */
let SCULPT=null;
function sculptMaps(W,FSX,FSY,fy0,gs){const S=new Float32Array(W*W),H=new Float32Array(W*W),Wm=new Float32Array(W*W);
 for(let V=0;V<W;V++){const t=1-V/(W-1),Y=lerp(HEAD.neckY,HEAD.crownY,t);for(let U=0;U<W;U++){const ph=(U/(W-1)-0.5)*2*Math.PI,ap=Math.abs(ph),o=V*W+U;
  let sc=0.66+0.36*Math.pow(Math.max(0,Math.cos(ph)),0.8),warm=0,hol=0;
  if(ap<1.7){const du=(U-128)/FSX,dv=fy0+(V-fy0)/FSY;
   for(const s of [-1,1]){sc+=-0.22*gs(du,dv,s*12,93,8.5,7)+0.08*gs(du,dv,s*12,82,9,3)+0.12*gs(du,dv,s*20,107,7,5)-0.08*gs(du,dv,s*6,110,2.5,8);hol-=0.12*gs(du,dv,s*23,130,6,13);warm+=gs(du,dv,s*19,115,9,8);}
   sc+=0.07*gs(du,dv,0,62,22,16)+0.09*gs(du,dv,0,104,3,12)+0.06*gs(du,dv,0,155,8,6)-0.1*gs(du,dv,0,142,8,3);warm+=0.6*gs(du,dv,0,117,4,3);}
  let k=1;if(Y<1.6)k=1-0.26*clamp((1.6-Y)/0.03,0,1)*(Y>HEAD.chinY-0.05?1:0.9);
  if(ap>1.45&&ap<1.85&&Y>1.66&&Y<1.76)warm+=0.5;
  S[o]=sc*k;H[o]=hol*k;Wm[o]=warm;}}
 return{s:S,h:H,w:Wm};}
function paintHeadP(L){SKIN=C255(L.skin);const W=256,c=document.createElement('canvas');c.width=c.height=W;const x=c.getContext('2d');const out=x.createImageData(W,W),D=out.data;
 const hair=L.hair?C255(L.hair):null,hs=L.hs,beard=L.beard?C255(L.beard):null,hatOn=!!L.hat;
 const hl=hs==='buzz'?1.79:hs==='slick'||hs==='puff'?1.772:hs==='big'||hs==='long'||hs==='xlong'||hs==='waves'||hs==='braids'||hs==='afro'?1.75:1.768;
 const F=faceOf(L),man=!L.fem;
 /* men's skin a little richer, the way the photo faces of the heroes read in the club lights */
 if(man){const lum=0.3*SKIN[0]+0.59*SKIN[1]+0.11*SKIN[2];SKIN=SKIN.map((v,i)=>clamp(lum+(v-lum)*1.3+(i===0?5:0),0,255));}
 const FSX=man?1.72:1.4,FSY=man?1.3:1.22,fy0=(HEAD.crownY-1.676)/(HEAD.crownY-HEAD.neckY)*256,gs=(du,dv,cx,cy,rx,ry)=>Math.exp(-((du-cx)*(du-cx))/(rx*rx)-((dv-cy)*(dv-cy))/(ry*ry));
 let ns=(F.pores*977)|0;const noise=()=>{ns=(Math.imul(ns,1664525)+1013904223)>>>0;return ns/4294967296;};
 const grey=man&&F.age>0.82&&hair?hair.map(v=>lerp(v,200,0.55)):null,side=man&&hair&&hs&&hs!=='mohawk'&&hs!=='buzz'&&!hatOn;
 if(man&&!SCULPT)SCULPT=sculptMaps(W,FSX,FSY,fy0,gs);
 for(let V=0;V<W;V++){const t=1-V/(W-1),Y=lerp(HEAD.neckY,HEAD.crownY,t);
  for(let U=0;U<W;U++){const ph=(U/(W-1)-0.5)*2*Math.PI,ap=Math.abs(ph);let base=SKIN.slice(),bare=1;
   if(hair&&hs){const line=hl-0.11*clamp((ap-1.0)/1.0,0,1)-0.03*clamp((ap-2.2)/0.8,0,1);let inH=Y>line;if(hs==='mohawk')inH=Y>1.7&&Math.abs(Math.sin(ph))<0.22;
    /* sideburns down in front of the ears, like the heroes' own hair */
    if(side&&!inH&&ap>1.2&&ap<1.5&&Y>1.655)inH=true;
    if(inH){const k=hs==='buzz'?0.55:hs==='mohawk'?1:0.95,hc=grey&&ap>1.0&&Y<1.8?grey:hair,st=hs==='buzz'?1-0.12*noise():0.86+0.1*Math.sin(ph*70+Math.sin(Y*90)*2)+0.06*noise(),gl=hs==='slick'||hs==='big'?1+0.35*Math.exp(-Math.pow((Y-1.805)/0.014,2))*Math.max(0,Math.cos(ph-0.5)):1;
     base=base.map((v,i)=>v+(Math.min(255,hc[i]*st*gl)-v)*k);bare=1-k;}}
   /* beard and stubble follow the jaw: over the upper lip and chin, low on the cheeks, rising to meet the sideburns, soft at the edges */
   if(beard||L.stubble){const sm=e=>{e=clamp(e,0,1);return e*e*(3-2*e);},top=ap<0.3?1.664:ap<0.9?lerp(1.664,1.632,sm((ap-0.3)/0.6)):lerp(1.632,1.7,sm((ap-0.9)/0.5)),bot=lerp(1.548,1.585,sm((ap-0.9)/0.6)),
     m=sm((top-Y)/0.012)*sm((Y-bot)/0.012)*sm((1.62-ap)/0.14);
    if(m>0.01){if(beard){const bn=0.8+0.25*noise(),bc=beard.map(v=>v*bn);base=base.map((v,i)=>v+(bc[i]-v)*m);bare*=1-m;}else{const d=noise()<0.5?0.2:0.05;base=base.map((v,i)=>v*(1-d*m)-(i===2?0:4)*d*m);}}}
   /* sculpted skin: the heroes' faces come from photos with real light and shadow on them; generated faces get the same volume painted in:
      eye sockets, brow ridge, nose bridge, cheekbones and hollows, the chin, a shadow under the jaw, warm cheeks and ears, and skin grain */
   if(!man){const col=base.map(v=>v*(0.8+0.2*Math.max(0,Math.cos(ph)))*(0.92+0.08*t));const o=(V*W+U)*4;D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;continue;}
   const o0=V*W+U;let sc=SCULPT.s[o0]+SCULPT.h[o0]*(0.6+0.6*F.age),warm=SCULPT.w[o0];
   sc*=0.96+0.08*noise()*F.pores;
   const tint=[1.03,0.95,0.9],col=base.map((v,i)=>Math.min(255,v*sc*(0.94+0.06*t)*(bare>0.5?tint[i]:1)+(i===0?14:i===1?-2:-4)*warm*bare));const o=(V*W+U)*4;D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;}}
 x.putImageData(out,0,0);
 const c2=document.createElement('canvas');c2.width=c2.height=512;const y=c2.getContext('2d');y.imageSmoothingQuality='high';y.drawImage(c,0,0,512,512);
 FO={calm:L.calm||0,brow:L.fem?rgb((hair||[40,28,20]).map(v=>Math.min(v,120)*0.45)):hair?rgb(hair.map(v=>v*0.7)):beard?rgb(beard.map(v=>v*0.7)):'#2a1a12',fem:L.fem?1:0,iris:L.iris||(L.fem?null:F.iris),shadow:L.shadow||null};
 if(man)Object.assign(FO,{eo:F.eo,browT:F.browT,nose:F.nose,lip:F.lip,age:F.age,side:F.side,mouth:L.stache||L.beard?(F.mouth===4?1:F.mouth):F.mouth});
 y.save();y.scale(2,2);const fy=(HEAD.crownY-1.676)/(HEAD.crownY-HEAD.neckY)*256;y.translate(128,fy);y.scale(FSX,FSY);y.translate(-128,-fy);paintFace(y);
 const C=128,Vy=Y=>(HEAD.crownY-Y)/(HEAD.crownY-HEAD.neckY)*256,ey=Vy(1.706),ex=7.5;
 if(L.stache||L.beard){y.fillStyle=rgb((beard||hair||[40,28,20]).map(v=>v*0.8));y.beginPath();y.moveTo(C-12,Vy(1.646)+2);y.quadraticCurveTo(C-6,Vy(1.662),C,Vy(1.658));y.quadraticCurveTo(C+6,Vy(1.662),C+12,Vy(1.646)+2);y.quadraticCurveTo(C,Vy(1.652),C-12,Vy(1.646)+2);y.fill();}
 if(L.scar){y.strokeStyle='rgba(150,60,60,.8)';y.lineWidth=1.4;y.beginPath();y.moveTo(C+5,ey-12);y.lineTo(C+11,ey+9);y.stroke();for(let k=0;k<4;k++){y.beginPath();y.moveTo(C+5.5+k*1.5-2,ey-8+k*5);y.lineTo(C+5.5+k*1.5+2,ey-8+k*5);y.stroke();}}
 if(L.fem){/* blush on the cheekbones and full painted lips (cupid's bow, darker line between the lips, a gloss highlight) */
  const lc=L.lip||[225,30,90],ly=Vy(1.646);for(const s of [1,-1]){y.fillStyle='rgba(245,95,130,.30)';y.beginPath();y.ellipse(C+s*(ex+5),Vy(1.668),6,3.6,0,0,6.3);y.fill();}
  y.fillStyle=rgb(lc);y.beginPath();y.moveTo(C-9.5,ly+0.6);y.quadraticCurveTo(C-5,ly-3.6,C,ly-1.6);y.quadraticCurveTo(C+5,ly-3.6,C+9.5,ly+0.6);y.quadraticCurveTo(C,ly+6.2,C-9.5,ly+0.6);y.fill();
  y.strokeStyle=rgb(lc.map(v=>v*0.45));y.lineWidth=1.1;y.beginPath();y.moveTo(C-9.5,ly+0.6);y.quadraticCurveTo(C,ly+1.8,C+9.5,ly+0.6);y.stroke();
  y.fillStyle='rgba(255,230,238,.7)';y.beginPath();y.ellipse(C-1,ly+3.1,3.4,0.9,0,0,6.3);y.fill();}
 if(L.shades||L.aviators){for(const s of [1,-1]){const cx=C+s*ex;y.fillStyle='rgba(10,10,14,.95)';y.beginPath();if(L.aviators){y.moveTo(cx-s*-7,ey-4);y.lineTo(cx+s*8,ey-4);y.quadraticCurveTo(cx+s*8,ey+6,cx+s*1,ey+6);y.quadraticCurveTo(cx-s*7,ey+5,cx-s*7,ey-4);}else{y.rect(cx-7.5,ey-4,15,8);}y.fill();y.fillStyle='rgba(120,170,220,.45)';y.fillRect(cx-5,ey-3,4,2);
  y.strokeStyle=L.aviators?'#d0a040':'#111';y.lineWidth=1;y.stroke();}y.strokeStyle=L.aviators?'#d0a040':'#111';y.lineWidth=1.4;y.beginPath();y.moveTo(C-2,ey-2);y.lineTo(C+2,ey-2);y.stroke();for(const s of [1,-1]){y.beginPath();y.moveTo(C+s*(ex+7.5),ey-3);y.lineTo(C+s*30,ey-2);y.stroke();}}
 else if(L.glasses){y.strokeStyle='#222';y.lineWidth=1.3;for(const s of [1,-1]){y.beginPath();y.ellipse(C+s*ex,ey,7,5.5,0,0,6.3);y.stroke();}y.beginPath();y.moveTo(C-1,ey-1);y.lineTo(C+1,ey-1);y.stroke();}
 y.restore();const x2=c2.getContext('2d');x2.save();x2.scale(2,2);paintEars(x2);
 if(L.earpiece){x2.fillStyle='#111';x2.fillRect(186,100,6,10);x2.strokeStyle='#ddd';x2.lineWidth=0.7;x2.beginPath();x2.moveTo(189,110);x2.lineTo(189,150);x2.stroke();}x2.restore();
 x2.fillStyle='#5a3418';x2.fillRect(0,0,24,6);x2.fillStyle='#ff8a2a';x2.fillRect(28,0,20,6);x2.fillStyle='#e8e0d4';x2.fillRect(52,0,20,6);
 if(L.hair){x2.fillStyle=rgb(C255(L.hair));x2.fillRect(132,0,24,6);}const hc=C255(L.hatC||[0.1,0.1,0.12]);x2.fillStyle=rgb(hc);x2.fillRect(76,0,24,6);x2.fillStyle=rgb(hc.map(v=>v*0.45));x2.fillRect(104,0,24,6);x2.fillStyle='#0b0b0e';x2.fillRect(160,0,24,6);if(L.beard){x2.fillStyle=rgb(C255(L.beard).map(v=>Math.min(255,v*1.08)));x2.fillRect(188,0,24,6);}
 if(ARMOR[L.armor]){const a=C255(L.armorC||(L.armor==='plate'?[0.27,0.29,0.21]:[0.13,0.14,0.17]));x2.fillStyle=rgb(a);x2.fillRect(330,0,24,6);x2.fillStyle=rgb(a.map(v=>v*0.6));x2.fillRect(358,0,24,6);}
 if(HELMET[L.helmet]){x2.fillStyle=rgb(C255(L.helmetC||(L.helmet==='riot'?[0.07,0.07,0.09]:[0.25,0.28,0.19])));x2.fillRect(386,0,24,6);x2.fillStyle='#5a7490';x2.fillRect(414,0,24,6);}return c2;}
function paintBodyP(L){const sh=C255(L.shirt),jk=C255(L.jacket),sk=C255(L.skin);
 const B={jacket:jk,pants:C255(L.pants),shirt:sh,tie:L.tie?C255(L.tie):null,chain:!!(L.chain||L.medallion),chains:!!L.cuban,deepV:!!L.cuban,pin:false,square:L.tie?'#e8e4dc':'#f0ece4',shoe:C255(L.shoes||[0.08,0.08,0.09]),shirtScale:1};
 if(L.tee||L.tank){B.jacket=sh;}
 const c=paintBody(shirtCanvas(sh),B),x=c.getContext('2d');
 const fab=(x0,y0,w,h,col)=>{x.fillStyle=rgb(col);x.fillRect(x0,y0,w,h);x.globalAlpha=0.08;x.strokeStyle='#000';for(let i=x0;i<x0+w;i+=3){x.beginPath();x.moveTo(i,y0);x.lineTo(i+h*0.3,y0+h);x.stroke();}x.globalAlpha=1;const g=x.createLinearGradient(0,y0,0,y0+h);g.addColorStop(0,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(0,0,0,.18)');x.fillStyle=g;x.fillRect(x0,y0,w,h);};
 if(L.tee||L.tank){fab(0,0,512,290,sh);
  for(const sx of [128,384]){const g=x.createRadialGradient(sx,40,0,sx,40,80);g.addColorStop(0,'rgba(0,0,0,.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(sx-80,0,160,120);}
  x.fillStyle=rgb(sk.map(v=>v*0.9));x.beginPath();x.ellipse(256,0,L.tank?60:38,L.tank?40:22,0,0,6.3);x.fill();
  if(L.chain||L.medallion){x.strokeStyle='#e8b84a';x.lineWidth=3;x.beginPath();x.moveTo(214,0);x.quadraticCurveTo(256,70,298,0);x.stroke();if(L.medallion){x.fillStyle='#f0c050';x.beginPath();x.arc(256,52,9,0,6.3);x.fill();}}
  fab(0,290,512,90,sk);if(L.tee)fab(0,290,512,26,sh);fab(0,381,512,18,sk);
  if(L.tattoo){x.strokeStyle='rgba(30,50,90,.75)';x.lineWidth=2;for(let k=0;k<14;k++){const tx=Math.random()*512,ty2=300+Math.random()*70;x.beginPath();x.arc(tx,ty2,3+Math.random()*6,0,4);x.stroke();}}
  if(L.tank)for(const sx of [96,416]){x.fillStyle=rgb(sk);x.fillRect(sx-34,0,68,26);}}
 if(L.fem){if(L.dancer){
  fab(0,0,512,290,sk);fab(0,290,512,90,sk);fab(0,381,512,18,sk);fab(0,440,512,72,sk);
  /* lingerie styles (L.ling): bikini (default), bodysuit, corset, lace, babydoll, leopard, strappy, leotard; L.hose: stockings or fishnets on the legs */
  const ling=L.ling||'bikini',dk=jk.map(v=>v*0.6);
  for(const sd of [-1,1]){const g=x.createRadialGradient(256+sd*38,94,4,256+sd*38,102,52);g.addColorStop(0,'rgba(255,255,255,.26)');g.addColorStop(0.55,'rgba(255,255,255,0)');g.addColorStop(0.82,'rgba(0,0,0,.22)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(256+sd*38-55,40,110,115);}
  x.strokeStyle=rgb(sk.map(v=>v*0.62));x.lineWidth=2.5;x.beginPath();x.moveTo(256,68);x.lineTo(256,122);x.stroke();
  const top=()=>{x.fillStyle=rgb(jk);x.fillRect(0,94,512,12);for(const sd of [-1,1]){x.beginPath();x.moveTo(256+sd*8,112);x.lineTo(256+sd*68,112);x.lineTo(256+sd*38,62);x.closePath();x.fill();x.strokeStyle=rgb(sh);x.lineWidth=3;x.stroke();x.beginPath();x.moveTo(256+sd*38,62);x.lineTo(256+sd*18,0);x.stroke();}};
  const bottom=()=>{x.fillStyle=rgb(jk);x.fillRect(0,214,512,10);x.beginPath();x.moveTo(222,214);x.lineTo(290,214);x.lineTo(256,272);x.closePath();x.fill();
   x.beginPath();x.moveTo(0,214);x.lineTo(18,214);x.lineTo(0,268);x.closePath();x.fill();x.beginPath();x.moveTo(512,214);x.lineTo(494,214);x.lineTo(512,268);x.closePath();x.fill();};
  const lace=(y0,y1)=>{x.strokeStyle=rgb(sh);x.lineWidth=1.5;for(let lx=0;lx<512;lx+=10){x.beginPath();x.arc(lx+5,y1,5,0,Math.PI);x.stroke();}x.globalAlpha=0.35;for(let lx=0;lx<512;lx+=8)for(let ly=y0;ly<y1;ly+=8){x.beginPath();x.arc(lx+(ly/8%2)*4,ly,2.2,0,6.3);x.stroke();}x.globalAlpha=1;};
  if(ling==='bodysuit'){/* one-piece: bust to hips in one colour, plunging neckline, high-cut legs, a gloss stripe */
   x.fillStyle=rgb(jk);x.fillRect(0,92,512,140);x.fillStyle=rgb(sk);x.beginPath();x.moveTo(226,92);x.lineTo(286,92);x.lineTo(256,168);x.closePath();x.fill();
   x.fillStyle=rgb(jk);x.beginPath();x.moveTo(222,232);x.lineTo(290,232);x.lineTo(256,276);x.closePath();x.fill();
   for(const sd of [-1,1]){x.strokeStyle=rgb(jk);x.lineWidth=5;x.beginPath();x.moveTo(256+sd*40,94);x.lineTo(256+sd*24,0);x.stroke();}
   x.fillStyle='rgba(255,255,255,.18)';x.fillRect(0,120,512,5);x.fillStyle=rgb(sh);x.fillRect(0,196,512,5);}
  else if(ling==='corset'){/* cups on top, a laced bodice down to the hips, garter straps */
   top();x.fillStyle=rgb(jk);x.fillRect(0,108,512,108);x.strokeStyle=rgb(dk);x.lineWidth=2;for(let bx2=16;bx2<512;bx2+=32){x.beginPath();x.moveTo(bx2,108);x.lineTo(bx2,216);x.stroke();}
   x.strokeStyle=rgb(sh);x.lineWidth=2;for(let ly=114;ly<210;ly+=12){x.beginPath();x.moveTo(248,ly);x.lineTo(264,ly+12);x.moveTo(264,ly);x.lineTo(248,ly+12);x.stroke();}
   x.fillStyle=rgb(sh);x.fillRect(0,106,512,4);x.fillRect(0,214,512,4);bottom();
   for(const gx of [40,140,372,472]){x.fillStyle=rgb(sh);x.fillRect(gx,218,4,60);}}
  else if(ling==='lace'){top();bottom();lace(92,108);lace(212,226);}
  else if(ling==='babydoll'){/* sheer babydoll: a see-through chemise from the bust flaring to the upper hip over a matching set, ribbon bow under the bust */
   top();bottom();x.globalAlpha=0.42;x.fillStyle=rgb(jk);x.fillRect(0,108,512,124);x.globalAlpha=1;lace(222,232);
   x.fillStyle=rgb(sh);x.fillRect(0,108,512,5);x.beginPath();x.moveTo(256,112);x.lineTo(244,104);x.lineTo(244,120);x.closePath();x.moveTo(256,112);x.lineTo(268,104);x.lineTo(268,120);x.closePath();x.fill();}
  else if(ling==='leopard'){/* leopard-print bikini, very 1986 */
   top();bottom();const spots=(y0,y1)=>{x.fillStyle='rgba(40,22,10,.85)';for(let lx=4;lx<512;lx+=14)for(let ly=y0;ly<y1;ly+=10){const ox=(ly/10%2)*7;x.beginPath();x.ellipse(lx+ox,ly,3,2.2,0.5,0,6.3);x.fill();}};
   x.save();x.beginPath();x.rect(0,58,512,56);x.clip();spots(60,114);x.restore();x.save();x.beginPath();x.rect(0,212,512,62);x.clip();spots(214,274);x.restore();}
  else if(ling==='strappy'){/* strappy set: bikini with criss-cross straps over the midriff and a ring at the centre */
   top();bottom();x.strokeStyle=rgb(jk);x.lineWidth=4;for(const sd of [-1,1]){x.beginPath();x.moveTo(256+sd*60,112);x.lineTo(256-sd*60,214);x.stroke();x.beginPath();x.moveTo(256+sd*140,112);x.lineTo(256+sd*30,214);x.stroke();}
   x.strokeStyle='#e8b84a';x.lineWidth=3;x.beginPath();x.arc(256,163,8,0,6.3);x.stroke();}
  else if(ling==='leotard'){/* 80s high-cut leotard: shoulder to hip in one colour, a contrast stripe across the bust, cut high over the hips */
   x.fillStyle=rgb(jk);x.fillRect(0,40,512,190);x.fillStyle=rgb(sk);x.beginPath();x.ellipse(256,40,46,26,0,0,6.3);x.fill();
   x.fillStyle=rgb(jk);x.beginPath();x.moveTo(214,230);x.lineTo(298,230);x.lineTo(256,278);x.closePath();x.fill();
   x.fillStyle=rgb(sh);x.fillRect(0,128,512,12);x.fillStyle='rgba(255,255,255,.2)';x.fillRect(0,144,512,4);}
  else{top();bottom();}
  if(L.hose){/* stockings: sheer colour with a lace top, or fishnets */const hc=C255(L.hoseC||[0.05,0.05,0.07]);
   if(L.hose==='net'){x.strokeStyle=rgb(hc);x.lineWidth=1.4;for(let k=-80;k<600;k+=9){x.beginPath();x.moveTo(k,440);x.lineTo(k+72,512);x.moveTo(k+72,440);x.lineTo(k,512);x.stroke();}}
   else{x.fillStyle=rgb(hc);x.globalAlpha=0.55;x.fillRect(0,446,512,66);x.globalAlpha=1;}
   x.fillStyle=rgb(hc);x.fillRect(0,440,512,7);x.strokeStyle=rgb(hc);x.lineWidth=1.2;for(let lx=0;lx<512;lx+=8){x.beginPath();x.arc(lx+4,447,4,0,Math.PI);x.stroke();}}
  if(L.chain||L.medallion){x.strokeStyle='#e8b84a';x.lineWidth=3;x.beginPath();x.moveTo(220,0);x.quadraticCurveTo(256,46,292,0);x.stroke();if(L.medallion){x.fillStyle='#f0c050';x.beginPath();x.arc(256,36,7,0,6.3);x.fill();}}
 }else{fab(0,0,512,290,jk);
  for(const sx of [128,384]){const g=x.createRadialGradient(sx,40,0,sx,40,80);g.addColorStop(0,'rgba(0,0,0,.2)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(sx-80,0,160,120);}
  x.fillStyle=rgb(sk.map(v=>v*0.92));x.beginPath();x.ellipse(256,0,44,26,0,0,6.3);x.fill();
  for(const sd of [-1,1]){const g=x.createRadialGradient(256+sd*36,92,4,256+sd*36,100,46);g.addColorStop(0,'rgba(255,255,255,.16)');g.addColorStop(0.6,'rgba(255,255,255,0)');g.addColorStop(0.8,'rgba(0,0,0,.14)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(256+sd*36-50,40,100,110);}
  x.fillStyle=rgb(sh);x.fillRect(0,180,512,9);
  if(L.chain||L.medallion){x.strokeStyle='#e8b84a';x.lineWidth=3;x.beginPath();x.moveTo(220,0);x.quadraticCurveTo(256,46,292,0);x.stroke();if(L.medallion){x.fillStyle='#f0c050';x.beginPath();x.arc(256,36,7,0,6.3);x.fill();}}
  if(L.sleeves)fab(0,290,512,90,jk);else{fab(0,290,512,90,sk);for(const sx of [96,416]){x.fillStyle=rgb(sk);x.fillRect(sx-34,0,68,22);}}fab(0,381,512,18,sk);
  if(L.crop){/* bare midriff between the top's hem (~y 1.17) and the waistband */fab(0,139,512,34,sk);const g=x.createLinearGradient(0,139,0,147);g.addColorStop(0,'rgba(0,0,0,.28)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,139,512,8);
   x.fillStyle=rgb(sk.map(v=>v*0.6));x.beginPath();x.ellipse(256,164,2.2,3,0,0,6.3);x.fill();}}}
 if(L.vest){const vc=C255(L.vest);fab(0,0,212,290,vc);fab(300,0,212,290,vc);x.strokeStyle='rgba(0,0,0,.5)';x.lineWidth=3;x.strokeRect(212,0,88,290);if(L.pouches){for(const px of [150,330]){x.fillStyle=rgb(vc.map(v=>v*0.8));x.fillRect(px,150,40,46);x.strokeStyle='rgba(0,0,0,.4)';x.strokeRect(px,150,40,46);}}}
 if(L.apron){const ac=C255(L.apron);fab(150,40,212,250,ac);x.strokeStyle=rgb(ac.map(v=>v*0.7));x.lineWidth=3;x.beginPath();x.moveTo(170,40);x.lineTo(220,0);x.moveTo(342,40);x.lineTo(292,0);x.stroke();
  for(let k=0;k<9;k++){x.fillStyle='rgba(130,10,14,.75)';x.beginPath();x.ellipse(170+Math.random()*170,80+Math.random()*190,4+Math.random()*10,3+Math.random()*7,Math.random()*3,0,6.3);x.fill();}}
 if(L.torsoTile===30||L.torsoTile===31||L.torsoTile===29||L.torsoTile===32){const pat=(x0,y0,w,h,skipV)=>{x.save();x.beginPath();x.rect(x0,y0,w,h);if(skipV)x.rect(362,0,-212,150);x.clip('evenodd');if(L.fem&&L.crop){x.beginPath();x.rect(0,0,512,512);x.rect(0,139,512,34);x.clip('evenodd');}
  if(L.torsoTile===30){x.strokeStyle='rgba(235,235,245,.38)';x.lineWidth=1;for(let i=x0;i<x0+w;i+=7){x.beginPath();x.moveTo(i,y0);x.lineTo(i,y0+h);x.stroke();}}
  else if(L.torsoTile===31){const cs=['#3e4a26','#6b6b3a','#2a2a1a','#7a7048'];for(let k=0;k<w*h/260;k++){x.fillStyle=cs[k%4];x.beginPath();x.ellipse(x0+Math.random()*w,y0+Math.random()*h,6+Math.random()*12,4+Math.random()*8,Math.random()*3,0,6.3);x.fill();}}
  else if(L.torsoTile===32){for(let k=0;k<w*h/900;k++){const px=x0+Math.random()*w,py=y0+Math.random()*h,sz=6+Math.random()*5,cs=Math.random()<0.55?['#ff5fb8','#ffb070']:['#2de2e6','#3a6ae0'];x.save();x.translate(px,py);x.rotate(Math.random()*6.3);const gr=x.createLinearGradient(-sz*1.6,0,sz*1.6,0);gr.addColorStop(0,cs[0]);gr.addColorStop(1,cs[1]);x.fillStyle=gr;x.beginPath();x.ellipse(0,0,sz*1.6,sz*0.55,0,0,6.3);x.fill();x.beginPath();x.moveTo(-sz*1.4,0);x.lineTo(-sz*2.3,-sz*0.7);x.lineTo(-sz*2.2,sz*0.7);x.closePath();x.fill();x.beginPath();x.moveTo(-sz*0.2,-sz*0.45);x.lineTo(sz*0.25,-sz*1.1);x.lineTo(sz*0.6,-sz*0.4);x.closePath();x.fill();x.restore();}}
  else{for(let k=0;k<w*h/500;k++){x.fillStyle=k%2?'rgba(255,240,120,.7)':'rgba(255,255,255,.6)';x.beginPath();x.arc(x0+Math.random()*w,y0+Math.random()*h,2+Math.random()*4,0,6.3);x.fill();}}x.restore();};
  if(L.tee||L.tank)pat(0,0,512,290,false);else{pat(0,0,512,290,true);pat(0,290,512,90,false);}if(L.legTile===L.torsoTile)pat(0,440,512,72,false);}
 if(L.gloves){const gc=C255(L.gloves);x.fillStyle=rgb(gc);x.fillRect(0,400,150,40);x.fillRect(0,381,512,18);}
 return c;}
/* look fields v2 (additive; absent = v1 output):
   armor:'vest'|'plate' (any body) soft vest or plate carrier over the torso; armorC:[r,g,b] 0..1 colour.
   helmet:'pasgt'|'riot' (any body) replaces hat and hides hair; helmetC:[r,g,b] 0..1 colour.
   fem only: heels:1 pumps; pads:1 80s shoulder pads; crop:1 bare midriff. */
const ARMOR={vest:1,plate:1},HELMET={pasgt:1,riot:1};
/* enemies (looks with an archetype) are built like the heroes: the slim ones like the Money Man, the regulars a bit stockier,
   the big ones broad in the shoulders like the Consigliere, the fat ones round like the Don. Visual only: hit sizes stay the archetype's. */
const HEROBUILD={thin:{scale:[0.95,1.02,0.95],shoulders:0.06},normal:{scale:[1.14,1.0,1.1],shoulders:0.16},big:{scale:[1.2,1.1,1.16],shoulders:0.24},fat:{scale:[1.3,0.98,1.24],belly:0.13,shoulders:0.08}};
/* hero accessories on enemies, rolled from the look (no Math.random): gold rings, chains on open shirts, a Cuban chain on dealers, glasses */
const SUITS={mobster:1,hitman:1,bodyguard:1,dealer:1};
function kitLook(L){if(!L||L.fem||!L.arch)return L;let h=2166136261;const k=JSON.stringify([L.skin,L.hair,L.arch,L.jacket,L.shirt,L.body,'kit']);for(let i=0;i<k.length;i++)h=Math.imul(h^k.charCodeAt(i),16777619);
 const r=()=>{h=(h+0x6D2B79F5)|0;let t=Math.imul(h^(h>>>15),1|h);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
 const o=Object.assign({},L),suit=SUITS[L.arch];if(r()<(suit?0.5:0.35))o.bling=true;if(!L.tie&&r()<(suit?0.55:0.35))o.chain=true;if(L.arch==='dealer'&&r()<0.45)o.cuban=true;
 if(!L.shades&&!L.aviators&&!L.glasses&&r()<(suit?0.22:0.1))o.glasses=true;return o;}
function lookCfg(L,bodyType){const fb=k=>(!L.fem&&L.arch&&HEROBUILD[k])||BODYCFG[L.fem&&k==='thin'?'slim':k],bt=fb(bodyType)||fb(L.body)||BODYCFG.normal,helmet=HELMET[L.helmet]?L.helmet:null;
 return{L,B:{specs:L.glasses?1:0,fluff:!!(L.fluff&&L.beard),hs:(L.hair&&!L.hat&&!helmet)?L.hs:null,watch:L.watch?-1:0,cigar:!!(L.cigar||(!L.fem&&faceOf(L).cig)),hat:helmet?null:(L.hat||null),shoulders:bt.shoulders||0,belly:bt.belly||(L.belly?0.1:0),rings:L.bling?1:0,fem:!!L.fem,dancer:!!(L.fem&&L.dancer),curve:L.fem&&L.dancer?(L.curve||1):1,waist:L.fem&&L.dancer?(L.waist||1):1,bustK:L.fem&&L.dancer?(L.bust||1):1,hipK:L.fem&&L.dancer?(L.hips||1):1,skirt:L.fem?(L.skirt||0):0,
  armor:ARMOR[L.armor]?L.armor:null,helmet,...(L.fem?{}:(F=>({jaw:F.jaw,cheek:F.cheek,noseK:0.85+0.3*(F.nose-0.85)/0.4}))(faceOf(L))),heels:!!(L.fem&&L.heels),pads:!!(L.fem&&L.pads),crop:!!(L.fem&&L.crop)},scale:(L.fem?bt.scale.map((v,i)=>v*BODYP.fem.scale[i]):bt.scale).map((v,i)=>v*(L.sc?L.sc[i]:1)),gait:L.fem&&L.dancer?'runway':(L.fem?BODYP.fem:BODYP.male).gait};}
/* vertex counts for a look without touching GL (budget checks: female <= 1.25x male) */
function lookVerts(L,bodyType){const B=lookCfg(L||{},bodyType).B,b=buildBody(B).p.length/3,h=buildHead(B).p.length/3;return{body:b,head:h,total:b+h};}
let LOOKN=0,lastG=null,buildsThisFrame=0;const failedLooks=new Set();
function beginFrame(){buildsThisFrame=0;}
function lookKey(c){if(!c.look)return null;if(!c._ps2k){c._ps2k='L'+(++LOOKN);}return c._ps2k;}
function bloodify(key,lvl,c){const C=CH[key];if(!C||!C.bc)return;C.dirty=true;const paint=(cv,regions,n,big)=>{const x=cv.getContext('2d');for(let i=0;i<n;i++){const r=regions[Math.random()*regions.length|0],px=r[0]+Math.random()*r[2],py=r[1]+Math.random()*r[3],s=(big?8:4)+Math.random()*(big?18:10);
  x.fillStyle=`rgba(${100+Math.random()*50|0},${Math.random()*12|0},${10+Math.random()*12|0},${0.75+Math.random()*0.25})`;x.beginPath();x.ellipse(px,py,s,s*(0.6+Math.random()*0.6),Math.random()*3,0,6.3);x.fill();
  for(let k=0;k<5;k++){x.beginPath();x.arc(px+(Math.random()-0.5)*s*3,py+(Math.random()-0.5)*s*3,1+Math.random()*3,0,6.3);x.fill();}if(Math.random()<0.6){x.fillRect(px-1.5,py,3,s*(1+Math.random()*2));}}};
 const front=[[150,30,212,250]],all=[[0,0,512,290],[0,290,512,90],[0,440,512,72]];
 if(lvl>=1)paint(C.bc,front,lvl===1?4:10,lvl>1);if(lvl>=2)paint(C.bc,all,8,false);if(lvl>=3)paint(C.bc,[[150,0,212,140]],14,true);
 if(lvl>=2&&!c.headless)paint(C.hc,[[150,150,212,240]],lvl>=3?12:4,false);
 const re=(cv,tex)=>{gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.generateMipmap(gl.TEXTURE_2D);};re(C.bc,MODELS[key][0].tex);re(C.hc,MODELS[key][1].tex);gl.bindTexture(gl.TEXTURE_2D,atlasTex);}
function buildLook(key,c){const Lk=kitLook(c.look),bt=c.boss?'boss':(c.body||Lk.body);const cfg=lookCfg(Lk,bt);
 const ht=paintHeadP(Lk),btx=paintBodyP(Lk),parts=[];try{parts.push(upload(buildBody(cfg.B),mkTex(btx)));parts.push(upload(buildHead(cfg.B),mkTex(ht)));}catch(e){freeModel(parts);throw e;}
 MODELS[key]=parts;CH[key]={scale:cfg.scale,gait:cfg.gait,npc:true,bc:btx,hc:ht,sig:lookSig(c)};}
/* NPC models are kept between levels: building one (painting two 512px textures, lofting the body and head, uploading) costs
   20-45 ms and only one is built per frame, so every hub visit used to stutter for seconds while the same lobby regulars and
   shoppers were rebuilt. Clean models go into a small pool keyed by their look and are handed straight to the next character
   with that look. Bloodied ones (bloodify painted their textures) are freed as before. Each model holds ~2.7 MB of textures, hence the cap. */
const LOOKPOOL=new Map(),LOOKPOOL_MAX=24;let lookPoolN=0;
function lookSig(c){try{return (c.boss?'boss':(c.body||c.look.body))+'|'+JSON.stringify(c.look);}catch(e){return null;}}
function lookFromPool(sig){const a=sig&&LOOKPOOL.get(sig);if(!a||!a.length)return null;const e=a.pop();if(!a.length)LOOKPOOL.delete(sig);lookPoolN--;return e;}
function freeLooks(){failedLooks.clear();for(const k in MODELS)if(CH[k]&&CH[k].npc){const C=CH[k];
  if(C.sig&&!C.dirty){let a=LOOKPOOL.get(C.sig);if(a)LOOKPOOL.delete(C.sig);else a=[];a.push({parts:MODELS[k],ch:C});LOOKPOOL.set(C.sig,a);lookPoolN++;}else freeModel(MODELS[k]);
  delete MODELS[k];delete CH[k];}
 while(lookPoolN>LOOKPOOL_MAX){const [sig,a]=LOOKPOOL.entries().next().value;freeModel(a.shift().parts);lookPoolN--;if(!a.length)LOOKPOOL.delete(sig);}}
function applySuit(id){const C=CH[id];if(!shaderReady||!C||!C.bcBase||!MODELS[id])return;const sk=suitOK(PROG[id],PROG[id]&&PROG[id].suit)?PROG[id].suit:'default';if(C.suitOn===sk)return;C.suitOn=sk;
 const x=C.bc0.getContext('2d');x.globalCompositeOperation='source-over';x.globalAlpha=1;x.drawImage(C.bcBase,0,0);
 if(sk!=='default'){const zones=[[0,0,200,290],[312,0,200,290],[0,290,512,90],[0,440,512,72]];x.save();x.beginPath();for(const z of zones)x.rect(...z);x.clip();
  if(sk==='power'){x.fillStyle='rgba(38,38,50,.84)';x.fillRect(0,0,512,512);x.fillStyle='rgba(210,210,235,.25)';for(let i=0;i<512;i+=12)x.fillRect(i,0,1.2,512);}
  else if(sk==='linen'){x.fillStyle='rgba(246,238,220,.82)';x.fillRect(0,0,512,512);x.fillStyle='rgba(160,140,110,.12)';for(let i=0;i<512;i+=3)x.fillRect(0,i,512,1);}
  else if(sk==='pinstripe'){x.fillStyle='rgba(20,16,36,.30)';x.fillRect(0,0,512,512);x.fillStyle='rgba(235,230,255,.55)';for(let i=0;i<512;i+=9)x.fillRect(i,0,1.6,512);}
  else if(sk==='camo'){x.fillStyle='rgba(70,82,48,.78)';x.fillRect(0,0,512,512);const cols=['rgba(38,46,26,.8)','rgba(122,112,72,.75)','rgba(26,28,20,.8)'];let sd=7;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;for(let i=0;i<150;i++){x.fillStyle=cols[i%3];x.beginPath();x.ellipse(r()*512,r()*512,10+r()*26,6+r()*14,r()*3,0,6.3);x.fill();}}
  else if(typeof SUITS!=='undefined'&&SUITS[sk]&&SUITS[sk].paint){const S=SUITS[sk],[r,g2,b]=S.paint;x.fillStyle=`rgba(${r},${g2},${b},.86)`;x.fillRect(0,0,512,512);
   if(S.pat==='linen'){x.fillStyle='rgba(120,90,70,.10)';for(let i=0;i<512;i+=3)x.fillRect(0,i,512,1);for(let i=0;i<512;i+=5)x.fillRect(i,0,1,512);}
   else{x.fillStyle='rgba(255,255,255,.16)';for(let i=0;i<512;i+=16)x.fillRect(0,i,512,5);x.fillStyle='rgba(0,0,0,.08)';for(let i=8;i<512;i+=16)x.fillRect(0,i,512,3);}}
  else{x.fillStyle='rgba(255,70,170,.62)';x.fillRect(0,0,512,512);x.fillStyle='rgba(255,210,235,.35)';for(let i=0;i<512;i+=14)x.fillRect(0,i,512,2);x.fillStyle='rgba(60,0,40,.18)';x.fillRect(0,0,512,512);}
  x.restore();}
 C.bc.getContext('2d').drawImage(C.bc0,0,0);gl.bindTexture(gl.TEXTURE_2D,MODELS[id][0].tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,C.bc);gl.generateMipmap(gl.TEXTURE_2D);gl.bindTexture(gl.TEXTURE_2D,atlasTex);}
function resetMain(){for(const id in CH){const C=CH[id];if(C.npc||!C.bc0||!C.dirty)continue;C.dirty=false;C.bc.getContext('2d').drawImage(C.bc0,0,0);C.hc.getContext('2d').drawImage(C.hc0,0,0);
  for(const [cv,tex] of [[C.bc,MODELS[id][0].tex],[C.hc,MODELS[id][1].tex]]){gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.generateMipmap(gl.TEXTURE_2D);}}gl.bindTexture(gl.TEXTURE_2D,atlasTex);}
function levelCheck(){if(G!==lastG){lastG=G;freeLooks();resetMain();applySuit(CHARS[selIdx].id);}}
function ensureLook(c){levelCheck();const k=lookKey(c);if(!k||failedLooks.has(k))return null;if(MODELS[k])return k;
 {const p=lookFromPool(lookSig(c));if(p){MODELS[k]=p.parts;CH[k]=p.ch;return k;}}
 if(buildsThisFrame>=1)return null;buildsThisFrame++;try{buildLook(k,c);}catch(e){failedLooks.add(k);$('modelWarning').style.display='block';console.error('PS2 look',e);return null;}finally{gl.bindTexture(gl.TEXTURE_2D,atlasTex);}return k;}

function has(id){return !!CH[id];}
/* c: game character; mode: 'menu' | 'game' | 'stand'; returns true when drawn */
function add(c,mode,scale,t,IB,id){if(!shaderReady)return false;if(mode==='game')levelCheck();if(id==='look'){id=ensureLook(c);if(!id)return false;}if(!MODELS[id])return false;let anim='idle',jab,arms=null,k=0,gun=null,cash=false,dual=false;const sp=Math.hypot(c.vx||0,c.vz||0);
 const atk=c.atkT>0?clamp(c.atkT/(c.atkDur||0.2),0,1):0,ap=1-atk;
 if(mode==='menu'){
  if(c.pose==='consigliere'){anim='stance';jab=c.jab>0?Math.sin((1-c.jab/0.24)*Math.PI):undefined;}
  else if(c.pose==='money'){arms='cash';gun='silenced';cash=true;}
  else if(c.pose==='don'){arms='aim1';gun='revolver';k=(c.kick||0)*0.4;}
  else if(c.pose==='sal'){arms='talk';}
 }else if(mode==='game'){
  const wt=c.weapon?c.weapon.type:'fists',wd=WD[wt]||WD.fists;anim=sp>0.4?'walk':'idle';
  if(wt==='fists'){if(atk>0){anim='stance';jab=Math.sin(ap*Math.PI);}}
  else if(wd.melee){arms='melee';k=atk>0?ap:0;gun=wt;}
  else{gun=wt;k=atk*0.12;arms=BT(wt)==='dual'?'dual':wd.two?'rifle':'aim';dual=BT(wt)==='dual';if(!(c.player||c.kind==='mcwey'||c.state==='chase'||c.aiming||atk>0))arms='low';}
 }
 if(mode==='game'&&c.ex){const kd=c.ex.kind;if(kd==='gun'){arms='execGun';anim='idle';}else if(kd==='fists'){anim='stance';jab=atk>0?Math.sin(ap*Math.PI):0;}window.EXLEAN=1;}else window.EXLEAN=0;
 window.CROUCH=mode==='game'&&c.alive&&!(c.down>0)?(c.crouchK||0):0;window.SIT=mode==='game'&&c.alive&&!(c.down>0)?(c.seatK||0):0;window.DRIVE=mode==='game'&&c.drive?1:0;
 window.PUMP=0;if(gun==='shotgun'&&c.pumpAt!==undefined&&G){const dt2=G.T-c.pumpAt;if(dt2>0.3&&dt2<0.62)window.PUMP=Math.sin((dt2-0.3)/0.32*Math.PI);}
 let mcp=null;
 if(mode==='game'&&c.alive&&(c.kind==='sdancer'||c.kind==='dancer'||c.kind==='pgirl'||c.kind==='pguest'||c.lapDance)){
  const pgk=c.kind==='pgirl'||c.kind==='pguest';/* party guests (homelife.js) dance like the girls at home */
  const o0=c.dOff===undefined?(c.dOff=Math.random()*4):c.dOff,still=!(c.seatK>0.01)&&!c.tub&&!c.bed;
  if(c.walking){}/* a dancer walking with you (or back to the stage) walks */
  else if(c.move==='strut'&&!c.lapDance)anim='walk';
  else if(pgk&&sp>=0.15){}
  else if(pgk&&!c.lapDance&&still){/* at home she dances in spells (her party groove or the lambada) and stands between them */
   const q=(t+o0*7)%26,sp2=Math.floor((t+o0*7)/26);if(q<16){anim='dance';if(sp2%2)mcp={c:'lambada',t:t+o0*5,arms:1,o:o0};}else mcp={c:o0>2?'idle':'idle2',t:t+o0*9};}
  else if(c.move==='lambada'&&!c.lapDance){anim='dance';mcp={c:'lambada',t:t+o0*5,arms:1,o:o0};}
  else if(!pgk||sp<0.15)anim=c.lapDance?'lapdance':'dance';
  /* mocap walk (the distance walked drives it, so the feet keep pace) and mocap standing for the girls */
  if(still&&!c.lapDance&&anim==='walk')mcp={c:o0>2?'walk2':'walk',d:(c.walk||0)/9};
  else if(still&&!c.lapDance&&anim==='idle')mcp={c:o0>2?'idle':'idle2',t:t+o0*9};
  /* girls at home ease into a smaller party groove once they stop walking (c.dK) */
  const home=pgk&&!c.lapDance;if(home){const dtc=Math.max(0,Math.min(0.1,t-(c._dkT===undefined?t:c._dkT)));c._dkT=t;c.dK=(c.dK||0)+((anim==='dance'?1:0)-(c.dK||0))*Math.min(1,dtc*1.4);}
  window.DANCE_MOVE={m:home?'party':c.move||'sway',e:c.moveE===undefined?1:c.moveE,t:c.mt||0,o:c.dOff===undefined?(c.dOff=Math.random()*4):c.dOff,en:home?c.dK:1};
  if(c.lapDance)arms=null;
  const bst=c.boost||0,o=c.dOff===undefined?(c.dOff=Math.random()*4):c.dOff,g1=danceGroove(t+o,!!c.lapDance),h=1/30,g0=danceGroove(t+o-h,!!c.lapDance),g2=danceGroove(t+o+h,!!c.lapDance);
  /* springs pushed by the hips' actual acceleration: sideways from the weight shift, up and down from the knee dip and the bounce */
  const ax=-(g2.ws-2*g1.ws+g0.ws)/(h*h)*0.055,ay=-(g2.dip-2*g1.dip+g0.dip)/(h*h)*0.035+(c.vy0!==undefined?0:0);
  const amp=0.6+bst*0.5,ty=clamp(ay*0.045*amp,-1.2,1.2),tx=clamp(ax*0.05*amp,-1.2,1.2);
  c._jy=c._jy||0;c._jvy=c._jvy||0;c._jx=c._jx||0;c._jvx=c._jvx||0;
  c._jvy+=((ty-c._jy)*145-c._jvy*10.5)*(1/60);c._jy+=c._jvy*(1/60);
  c._jvx+=((tx-c._jx)*125-c._jvx*9.5)*(1/60);c._jx+=c._jvx*(1/60);
  window.DANCE_JIGGLE={x:c._jx,y:c._jy,boost:bst};
 }else window.DANCE_JIGGLE=null;
 const tt=anim==='walk'&&mode==='game'?(c.walk||0)/(2*Math.PI*0.95)/2:t;
 const lying=mode==='game'&&(!c.alive||c.down>0||!!c.bed);if(lying){arms=null;gun=null;anim='idle';window.DANCE_JIGGLE=null;}
 /* a playful slap: the player's hand swings (arms 'slap'), the girl jumps and looks back over her shoulder (window.SLAPK) */
 if(mode==='game'&&c.slapT>0){if(c.player){arms='slap';k=1-c.slapT/0.4;gun=null;dual=false;}else window.SLAPK=Math.sin(Math.PI*clamp(1-c.slapT/0.8,0,1))*(c.slapS||1);}
 window.MOCAP_PLAY=!lying&&mcp&&typeof mocapClip==='function'?mcp:null;
 let W=pose(lying?0:tt,anim,jab,arms,k,CH[id].gait);window.SLAPK=0;window.MOCAP_PLAY=null;
 if(mode==='game'&&!lying&&(c.kind==='sdancer'||c.kind==='dancer'||c.kind==='pgirl'||c.lapDance||c.slapT>0||c._pw))W=blendPose(c,W,t);else if(lying)c._pw=null;
 window.DANCE_JIGGLE=null;window.DANCE_MOVE=null;window.EXLEAN=0;window.CROUCH=0;window.SIT=0;window.DRIVE=0;const S=CH[id].scale;
 const SC=[scale*S[0],0,0,0,0,scale*S[1],0,0,0,0,scale*S[2],0,0,0,0,1];let bx0=c.x+(c.lox||0),bz0=c.z+(c.loz||0);
 /* in bed the head goes on the pillow: the root (feet) sits one body length from it, whatever her height */
 if(lying&&c.bed&&c.bedHX!==undefined){const len=1.8*scale*S[1];bx0=c.bedHX+Math.sin(c.a||0)*len;bz0=c.bedHZ+Math.cos(c.a||0)*len;}
 let base=M4.mul(M4.T(bx0,(c.y||0)+(typeof liftAt==='function'?liftAt(c.x,c.z):0),bz0),M4.R([0,1,0],c.a||0));
 /* lying down: tip over first and scale after, so a body keeps its standing height as its length and its depth as its thickness */
 if(lying){const fe=c.fall===undefined?1:1-Math.pow(1-c.fall,2);base=M4.mul(base,M4.mul(M4.T(0,(c.bed?0.15:0.2)*fe*scale*S[2],0),M4.mul(M4.R([1,0,0],(c.alive&&!c.bed?1:-1)*Math.PI/2*fe),SC)));}
 else base=M4.mul(base,SC);
 const Wb=[];const B=new Float32Array(NBS*16);for(let i=0;i<NB;i++)Wb[i]=M4.mul(base,W[i]);if(CH[id].neckDrop){const h=BI.head;Wb[h]=M4.mul(base,M4.mul(M4.T(0,-CH[id].neckDrop,0),W[h]));}
 const cut=[],SEV={armL:['uarmL','farmL','handL'],armR:['uarmR','farmR','handR'],legL:['thighL','shinL','footL'],legR:['thighR','shinR','footR']};
 if(c.sev)for(const l in c.sev)cut.push(SEV[l]);if(c.headless)cut.push(['head']);
 for(const grp of cut){const b0=BI[grp[0]],pv=M4.ap(Wb[b0],BONES[b0][2]);const Z0=[0,0,0,0,0,0,0,0,0,0,0,0,pv[0],pv[1],pv[2],1];for(const nm of grp)Wb[BI[nm]]=Z0;
  if(IB){const pr=IB.r,pu=IB.uv;IB.r=0.8;IB.uv=null;IB.box(A.mul(A.T(pv[0],pv[1],pv[2]),A.S(0.11*scale,0.11*scale,0.11*scale)),[0.55,0.03,0.06]);IB.box(A.mul(A.T(pv[0],pv[1],pv[2]),A.S(0.05*scale,0.05*scale,0.05*scale)),[0.92,0.85,0.8]);if(grp[0]==='head'){IB.box(A.mul(A.T(pv[0],pv[1]+0.03*scale,pv[2]),A.S(0.035*scale,0.08*scale,0.035*scale)),[0.95,0.9,0.85]);IB.box(A.mul(A.T(pv[0]+0.03*scale,pv[1]+0.01,pv[2]+0.02*scale),A.S(0.06*scale,0.05*scale,0.05*scale)),[0.7,0.08,0.12]);}IB.r=pr;IB.uv=pu;}}
 Wb[SOFT_L]=Wb[SOFT_R]=Wb[BI.pelvis];if(mode==='game'&&(c.look?c.look.fem:CH[id].B&&CH[id].B.fem))softSeat(c,Wb,t,lying);
 for(let i=0;i<NBS;i++)B.set(Wb[i],i*16);queue.push({B,id});
 if(mode==='game'&&(CH[id].npc||c.player)){const lvl=!c.alive?(c.execd?3:2):(c.hp<(c.maxhp||1)?1:0);if(lvl>(c._bl||0)){c._bl=lvl;bloodify(id,lvl,c);}}
 if(IB&&gun&&WD[gun]&&!(c.sev&&c.sev.armR)){const sw=1.65*scale;const wm=handFrame(Wb,false,sw),hg=gun==='dual'?'pistol':gun;if(typeof mastLv==='function')WGOLD=!!c.player&&mode==='game'&&mastLv(gun)>=3;if(mode==='game'&&typeof weaponAnim==='function')weaponAnim(c,gun);drawWeapon(IB,wm,hg);WKICK=WPUMP=0;if(typeof mastLv==='function')WGOLD=false;if(gun==='shotgun'&&!(c.sev&&c.sev.armL)){const fm=handFrame(Wb,true,1);const pr=IB.r,pu=IB.uv;IB.r=0.4;IB.uv=null;IB.box(A.mul(fm,A.mul(A.T(0,0.02,0.03),A.S(0.05*scale,0.05*scale,0.16*scale))),[0.35,0.22,0.12]);IB.r=pr;IB.uv=pu;}c.muzzle=apply(wm,0,0.05,(WD[gun].len||0.2)+0.12);if(dual){if(mode==='game'&&typeof weaponAnim==='function')weaponAnim(c,gun);drawWeapon(IB,handFrame(Wb,true,sw),hg);WKICK=WPUMP=0;}}
 if(IB&&cash){const hm=handFrame(Wb,true,1);const pr=IB.r,pu=IB.uv;IB.r=0;for(let i=-2;i<=2;i++){const m=A.mul(A.mul(A.mul(hm,A.T(0,0.03,0.04)),A.RY(i*0.26)),A.T(0,0.004*i,0.085));IB.box(A.mul(m,A.S(0.075,0.004,0.16)),[1,1,1],false,TUV[11]);}IB.r=pr;IB.uv=pu;}
 if(IB&&id==='mcwey'&&!gun){const hm=handFrame(Wb,false,1);const pr=IB.r,pu=IB.uv;IB.r=0.6;IB.uv=null;const cm=A.mul(hm,A.mul(A.T(0,0.035,0.02),A.RX(-0.5)));IB.box(A.mul(cm,A.mul(A.T(0,0,0.06),A.S(0.022,0.022,0.15))),[0.42,0.24,0.12]);IB.box(A.mul(cm,A.mul(A.T(0,0,0.0),A.S(0.024,0.024,0.018))),[0.85,0.65,0.25]);IB.box(A.mul(cm,A.mul(A.T(0,0,0.137),A.S(0.024,0.024,0.008))),[1,0.45,0.15],true);c.cig=apply(cm,0,0,0.145);IB.r=pr;IB.uv=pu;}
 return true;}
function flush(VPm,u){if(NX&&NX.live){NX.takeChars(queue,MODELS);queue.length=0;return;}if(!shaderReady||!queue.length||!u){queue.length=0;return;}gl.useProgram(P);
 gl.uniformMatrix4fv(Lc.uVP,false,VPm);gl.uniform4fv(Lc.uPL,LBUF);gl.uniform3fv(Lc.uPC,CBUF);gl.uniform3fv(Lc.uAmb,u.amb.map(v=>v*1.35));gl.uniform3fv(Lc.uLD,u.ld);gl.uniform3fv(Lc.uLC,u.lc);gl.uniform3fv(Lc.uCam,u.eye);gl.uniform2fv(Lc.uFog,u.fog);gl.uniform3fv(Lc.uFogC,u.fogC);
 gl.uniform1i(Lc.uTex,0);gl.activeTexture(gl.TEXTURE0);gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
 for(const kk of ['aP','aN','aT','aBi','aBw']){const l=Lc[kk];if(l>=0){gl.enableVertexAttribArray(l);if(EXT_I)EXT_I.vertexAttribDivisorANGLE(l,0);}}
 for(const q of queue){if(!MODELS[q.id])continue;gl.uniformMatrix4fv(Lc.uB,false,q.B);for(const mm of MODELS[q.id]){gl.bindTexture(gl.TEXTURE_2D,mm.tex);
  const at=(n,b,s)=>{const l=Lc[n];if(l<0)return;gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.vertexAttribPointer(l,s,gl.FLOAT,false,0,0);};
  at('aP',mm.p,3);at('aN',mm.n,3);at('aT',mm.t,2);at('aBi',mm.bi,4);at('aBw',mm.bw,4);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mm.i);gl.drawElements(gl.TRIANGLES,mm.n_i,gl.UNSIGNED_SHORT,0);}}
 for(const kk of ['aP','aN','aT','aBi','aBw']){const l=Lc[kk];if(l>=0)gl.disableVertexAttribArray(l);}gl.disable(gl.CULL_FACE);gl.bindTexture(gl.TEXTURE_2D,atlasTex);queue.length=0;}
/* how far the chest comes forward and the seat goes back on a look's body (tests use it to check the figure sizes) */
function lookFigure(L){const B=lookCfg(L||{}).B,M=buildBody(B),P=M.p;let f=-1,b=1;for(let i=0;i<P.length;i+=3){const y=P[i+1],x=P[i],z=P[i+2];if(Math.abs(x)>0.22)continue;if(y>1.15&&y<1.42)f=Math.max(f,z);if(y>0.76&&y<1.0)b=Math.min(b,z);}return{bust:f,seat:-b};}
return{init,add,flush,has,applySuit,rebuild,beginFrame,lookVerts,lookFigure,headTex:L=>paintHeadP(L),faceOf,jewelB,mocapClip,modelStatus:id=>modelStates[id],get status(){return status;},get ready(){return ready;}};})();
