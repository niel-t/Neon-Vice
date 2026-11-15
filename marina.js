'use strict';
/* ================= VICE MARINA: the dock yard, the pier and the boats =================
   The Marina (LEVELS[3]) reads as a working dock yard on a real marina:
   - The two buildings are corrugated sheds (tiles 218 siding / 221 roof, seafoam boat works on the left, coral harbour office on
     the right), and the yard between them is asphalt with painted lines, shipping containers ('q' cells, tile 220, one colour
     per container), a jib crane on the harbour office's corner and roller shutters and signs on the street fronts.
   - The pier is a quay boardwalk with finger piers out into the water. Lex's boats lie in the slips between the fingers, bow out
     to sea, tied to cleats with bow and stern lines, with fenders on the fingers. Pilings and an edge timber run along every pier
     edge; lamps stand at the finger tips, power posts and slip numbers at each berth, and a boat travel lift straddles the empty slip.
     The water runs on past the map's edge instead of stopping at a wall.
   - Every boat in the game (Lex's, yours under the window, the ride out to the Royal Flush) is a classic Italian runabout:
     one lofted varnished-mahogany hull with a white boot stripe and a chrome rubbing strake, a seamed mahogany deck, cream
     leather benches and sunpad, a chrome-framed wraparound windscreen and a flag at the stern. Built once and cached (carCache).
   Everything goes into the same Batch as the rest of the level, so the classic renderer and the Three.js renderer both draw it.
   Loaded after act1.js, before the main inline script: nothing here touches main-script globals at load time. */

const isMarina=g=>!!g&&!!g.def&&g.def.name==='VICE MARINA'&&!g.def.hub&&!!g.front;
const MAR_SHED=[0x5fb3a3,0xe07f62],MAR_BOX=[0xc23b2e,0x2f6fae,0x2a9d8f,0xe2802f],MAR_BOX_TXT=['STERLING','VICE LINE','GULF STAR','CARIBE'];
const MAR_WOOD=[0.33,0.22,0.14],MAR_PILE=[0.22,0.16,0.11],MAR_ROPE=[0.88,0.82,0.64],MAR_IRON=[0.13,0.13,0.15],MAR_LIFT=[0.16,0.36,0.78];

function marWater(g,x,z){if(x<0||z<0||x>=g.W||z>=g.H)return false;const i=z*g.W+x;return g.solid[i]===1&&g.wallT[i]===39&&g.wh[i]<0.1;}

/* ---- set-up (dressStreet, after act1Dress): materials, containers, the pier's fingers and berths, lamps ---- */
function marinaDress(g){if(!isMarina(g))return;const W=g.W,zT=g.front.zT,rows=g.rows;
 let zW=-1;for(let z=0;z<zT;z++)for(let x=1;x<W-1;x++)if(rows[z][x]==='o'||rows[z][x]==='Y')zW=z;if(zW<0)return;
 const zQ=zW+1,M=g.mar={zW,zQ,boxes:[],fingers:[],slips:[],berths:[],lamps:[],lift:null,crane:null,shut:[]};
 /* open sea past the edge: the loader's padding ring around the water is drawn as more water (still solid) */
 for(let z=0;z<=zW;z++)for(let x=0;x<W;x++){if(rows[z][x]!==' ')continue;const i=z*W+x;g.wallT[i]=39;g.topT[i]=39;g.wh[i]=0.02;g.glow[i]=2;g.tint[i]=-1;g.wallX[i]=0;g.topX[i]=0;}
 for(const x of [0,W-1])if(rows[zQ][x]===' '){const i=zQ*W+x;g.wh[i]=0.02;g.wallT[i]=4;g.topT[i]=4;g.tint[i]=-1;g.wallX[i]=0;g.topX[i]=0;}
 /* the yard is asphalt, the sheds corrugated steel */
 for(let z=zQ+1;z<zT;z++)for(let x=0;x<W;x++){const i=z*W+x;if(!g.solid[i]&&g.floorT[i]===4)g.floorT[i]=7;
  if(rows[z][x]==='#'){g.wallX[i]=218;g.topX[i]=221;g.tint[i]=tintIdx(x<W/2?MAR_SHED[0]:MAR_SHED[1]);}}
 /* shipping containers: each horizontal run of 'q' is one box in its own colour */
 for(let z=0;z<zT;z++)for(let x=0;x<W;){if(rows[z][x]!=='q'){x++;continue;}let e=x;while(rows[z][e+1]==='q')e++;const k=M.boxes.length,c=MAR_BOX[k%MAR_BOX.length],ti=tintIdx(c);
  for(let q=x;q<=e;q++){const i=z*W+q;g.wallX[i]=220;g.topX[i]=221;g.tint[i]=ti;}M.boxes.push({x0:x,x1:e+1,z,h:g.wh[z*W+x]||WALL_H,col:shx(c),txt:MAR_BOX_TXT[k%MAR_BOX_TXT.length]});x=e+1;}
 /* fingers: runs of open deck in the last water row; each runs north until the water */
 const deck=(x,z)=>x>=0&&x<W&&z>=0&&!g.solid[z*W+x];
 for(let x=0;x<W;){if(!deck(x,zW)){x++;continue;}let e=x;while(deck(e+1,zW))e++;let top=zW;for(let z=zW-1;z>=0;z--){let all=true;for(let q=x;q<=e;q++)if(!deck(q,z))all=false;if(!all)break;top=z;}M.fingers.push({x0:x,x1:e+1,top});x=e+1;}
 for(let k=0;k+1<M.fingers.length;k++){const L=M.fingers[k],R=M.fingers[k+1],s={x0:L.x1,x1:R.x0,top:Math.max(L.top,R.top),boat:null};
  for(let z=0;z<=zW;z++)for(let x=s.x0;x<s.x1;x++)if(rows[z][x]==='Y')s.boat={x:x+0.5,z:z+0.5};M.slips.push(s);if(s.boat)M.berths.push(Object.assign({xl:s.x0,xr:s.x1},s.boat));}
 /* a travel lift over the empty slip */
 const empty=M.slips.filter(s=>!s.boat&&s.x1-s.x0>=3);if(empty.length){const s=empty[Math.floor(empty.length/2)];M.lift={xl:s.x0,xr:s.x1,z0:zW-2.6,z1:zW-0.3};}
 /* lamps at the finger tips and along the quay */
 for(const f of M.fingers){const x=f.x0+0.14,z=f.top+0.16;M.lamps.push({x,z});g.lights.push({x,y:1.7,z:z+0.2,r:4.2,c:[1,0.85,0.6]});}
 /* the jib crane stands on the harbour office's north-west corner and swings its boom out over the slip next to it */
 for(let x=Math.floor(W/2);x<W;x++)if(rows[zQ+1][x]==='#'){const sl=M.slips.filter(s=>s.x1<=x+1).pop();M.crane={x:x+0.5,z:zQ+1.5,y0:g.wh[(zQ+1)*W+x]||WALL_H,hx:sl?sl.x1-1.2:x-1.6,hz:zW+0.4};break;}
 /* roller shutters on the street fronts: the widest stretch of shed wall each side of the yard */
 const zf=zT-1;for(const side of [0,1]){let best=null;for(let x=1;x<W-1;){const ok=q=>rows[zf][q]==='#'&&(side?q>W/2:q<W/2)&&deck(q,zf+1);if(!ok(x)){x++;continue;}let e=x;while(ok(e+1))e++;if(!best||e-x>best.b-best.a)best={a:x,b:e};x=e+1;}
  if(best&&best.b-best.a>=3){const a=best.a+1,b=Math.min(best.b-1,a+3);M.shut.push({a,b:b+1,z:zf+1,t:side?'BAIT * TACKLE * FUEL':'BOAT WORKS',c:side?[0.85,0.33,0.24]:[0.12,0.5,0.46]});}}}

/* ---- painted lettering (not lit): SNFONT pixels as thin boxes, on a wall facing +z or flat on the deck ---- */
function marText(B,s,cx,cy,z,px,col){const adv=6*px,W0=s.length*adv-px;
 for(let k=0;k<s.length;k++){const gl=SNFONT[s[k]];if(!gl)continue;const ox=cx-W0/2+k*adv,oy=cy+2.5*px;
  for(let r=0;r<5;r++){const row=gl[r];let c=0;while(c<5){if(row>>(4-c)&1){let e=c;while(e+1<5&&(row>>(3-e)&1))e++;const x0=ox+c*px,x1=ox+(e+1)*px,y=oy-r*px-px/2;B.box(TRS((x0+x1)/2,y,z+0.004,0,x1-x0,px*0.92,0.008),col);c=e+1;}else c++;}}}}
function marDeckText(B,s,cx,cz,px,col){const adv=6*px,W0=s.length*adv-px;
 for(let k=0;k<s.length;k++){const gl=SNFONT[s[k]];if(!gl)continue;const ox=cx-W0/2+k*adv,oz=cz-2.5*px;
  for(let r=0;r<5;r++){const row=gl[r];let c=0;while(c<5){if(row>>(4-c)&1){let e=c;while(e+1<5&&(row>>(3-e)&1))e++;const x0=ox+c*px,x1=ox+(e+1)*px;B.quad([[x0,0.007,oz+(r+1)*px],[x1,0.007,oz+(r+1)*px],[x1,0.007,oz+r*px],[x0,0.007,oz+r*px]],0,1,0,WUV,col);c=e+1;}else c++;}}}}
/* a straight line (rope, cable, strap) between two points, as a thin box */
function marLine(B,p,q,t,col){const dx=q[0]-p[0],dy=q[1]-p[1],dz=q[2]-p[2],L=Math.hypot(dx,dy,dz);if(L<1e-4)return;const yaw=Math.atan2(-dz,dx),pit=Math.atan2(dy,Math.hypot(dx,dz));
 B.box(A.mul(A.mul(A.mul(A.T((p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2),A.RY(yaw)),A.RZ(pit)),A.S(L,t,t)),col);}

/* ---- baked into the static batch (buildStatic) ---- */
function drawMarina(B,g){if(!isMarina(g)||!g.mar)return;const M=g.mar,W=g.W,zW=M.zW,zQ=M.zQ,r0=B.round;B.round=0;
 const sb=(x,y,z,sx,sy,sz,c,em,ry)=>B.box(TRS(x,y,z,ry||0,sx,sy,sz),c,!!em);
 /* the pier: an edge timber on every side that meets the water, and pilings along it (every cell on the fingers, every other on the quay) */
 const piles=new Set(),pile=(x,z)=>{const k=Math.round(x*20)+','+Math.round(z*20);if(piles.has(k))return;piles.add(k);B.round=0.6;sb(x,0.19,z,0.15,0.46,0.15,MAR_PILE);B.round=0;sb(x,0.43,z,0.17,0.03,0.17,[0.42,0.32,0.22]);};
 for(let z=0;z<=zQ;z++)for(let x=0;x<W;x++){if(g.solid[z*W+x])continue;const quay=z===zQ;
  for(const [dx,dz] of [[0,-1],[1,0],[-1,0],[0,1]]){if(!marWater(g,x+dx,z+dz))continue;
   const ex=x+0.5+dx*0.5,ez=z+0.5+dz*0.5,along=dz!==0;sb(ex-dx*0.035,0.03,ez-dz*0.035,along?1:0.07,0.06,along?0.07:1,MAR_WOOD);
   const ox=dx*0.04,oz=dz*0.04,run=(nx,nz)=>!g.solid[nz*W+nx]&&marWater(g,nx+dx,nz+dz);
   if(along){if(!quay||x%2===0)pile(x+0.1,ez+oz);if(!run(x+1,z))pile(x+0.9,ez+oz);}else{pile(ex+ox,z+0.1);if(!run(x,z+1))pile(ex+ox,z+0.9);}}}
 /* finger tips: a lamp post; at the root of every slip the slip number painted on the quay edge */
 for(const l of M.lamps){const P=hex(0x1f3a34);sb(l.x,0.05,l.z,0.2,0.1,0.2,P);sb(l.x,0.8,l.z,0.06,1.5,0.06,P);sb(l.x,1.58,l.z,0.2,0.04,0.2,P);sb(l.x,1.67,l.z,0.14,0.16,0.14,[1,0.88,0.62],true);sb(l.x,1.77,l.z,0.22,0.04,0.22,P);}
 M.slips.forEach((s,k)=>{const cx=(s.x0+s.x1)/2;marDeckText(B,'A'+(k+1),cx,zQ+0.32,0.05,[0.95,0.94,0.88]);
  /* power and water posts on each finger at the slip's root, a life ring on the quay between them */
  for(const [ex,f] of [[s.x0,1],[s.x1,-1]]){const x=ex-f*0.16,z=zW+0.25;sb(x,0.22,z,0.14,0.44,0.14,[0.93,0.93,0.9]);sb(x,0.46,z,0.17,0.05,0.17,[0.2,0.5,0.6]);sb(x,0.34,z+0.072,0.05,0.05,0.01,[0.3,1,0.5],true);}
  if(k%2===0){const x=cx,z=zQ+0.16,R=0.15;sb(x,0.32,z-0.01,0.05,0.64,0.05,[0.85,0.85,0.82]);for(let j=0;j<10;j++){const an=j*TAU/10;B.box(A.mul(A.mul(A.T(x+Math.cos(an)*R,0.42+Math.sin(an)*R,z+0.03),A.RZ(an)),A.S(0.05,0.1,0.05)),j%3===0?S_WHITE:hex(0xff5a1f));}}
  else{const x=cx,z=zQ+0.2;sb(x,0.12,z,0.22,0.24,0.22,MAR_IRON);sb(x,0.27,z,0.3,0.07,0.3,MAR_IRON);}});
 /* each berth: four cleats on the finger edges and fenders hanging off them */
 for(const b of M.berths){for(const [ex,f] of [[b.xl,1],[b.xr,-1]]){for(const dz of [-1.05,1.05]){const x=ex-f*0.12,z=b.z+dz;sb(x,0.02,z,0.07,0.04,0.2,MAR_IRON);sb(x,0.06,z,0.05,0.04,0.3,S_CHROME);}
   for(const dz of [-0.45,0.45]){const x=ex+f*0.05,z=b.z+dz;B.round=0.8;sb(x,0.14,z,0.1,0.24,0.1,[0.95,0.95,0.97]);B.round=0;marLine(B,[ex-f*0.1,0.05,z],[x,0.27,z],0.015,MAR_ROPE);}}}
 /* the travel lift: a blue portal frame on four wheeled legs standing on the fingers, slings hanging into the slip */
 if(M.lift){const L=M.lift,x0=L.xl-0.25,x1=L.xr+0.25,Y=1.8,C=MAR_LIFT;
  for(const z of [L.z0,L.z1]){for(const x of [x0,x1]){sb(x,Y/2,z,0.1,Y,0.1,C);sb(x,0.1,z,0.1,0.2,0.26,MAR_IRON);}sb((x0+x1)/2,Y,z,x1-x0+0.12,0.12,0.12,C);}
  for(const x of [x0,x1])sb(x,Y-0.2,(L.z0+L.z1)/2,0.1,0.1,L.z1-L.z0,C);
  sb(x1+0.2,0.95,L.z1-0.4,0.26,0.34,0.5,hex(0xe0b020));sb(x1+0.2,1.14,L.z1-0.4,0.24,0.04,0.46,S_DGREY);
  for(const z of [L.z0+0.6,L.z1-0.6]){const a=[x0+0.45,Y-0.1,z],b=[x1-0.45,Y-0.1,z],lo=0.28;marLine(B,a,[x0+0.9,lo,z],0.03,S_DGREY);marLine(B,[x0+0.9,lo,z],[x1-0.9,lo,z],0.05,hex(0x2a4a8a));marLine(B,[x1-0.9,lo,z],b,0.03,S_DGREY);}}
 /* the jib crane: a yellow mast on the harbour office's corner, a lattice boom out over the water, the hook block on its cable */
 if(M.crane){const C=M.crane,Y=C.y0,top=Y+1.5,YL=hex(0xe8b52a);sb(C.x,Y+0.06,C.z,0.42,0.12,0.42,S_DGREY);sb(C.x,Y+0.75,C.z,0.16,1.4,0.16,YL);sb(C.x+0.12,Y+0.75,C.z,0.025,1.4,0.025,S_DGREY);
  sb(C.x,top-0.08,C.z,0.26,0.24,0.26,YL);sb(C.x+0.1,top-0.08,C.z+0.14,0.14,0.14,0.02,[0.3,0.3,0.35]);
  const hb=[C.hx,top-0.05,C.hz],root=[C.x,top-0.05,C.z],tail=[C.x+(C.x-C.hx)*0.18,top-0.05,C.z+(C.z-C.hz)*0.18];
  marLine(B,root,hb,0.08,YL);marLine(B,[root[0],top+0.1,root[2]],[hb[0],top-0.02,hb[2]],0.03,YL);marLine(B,root,tail,0.08,YL);sb(tail[0],top-0.12,tail[2],0.26,0.22,0.26,S_DGREY);
  for(let k=1;k<6;k++){const t=k/6,p=[root[0]+(hb[0]-root[0])*t,top-0.05,root[2]+(hb[2]-root[2])*t];marLine(B,p,[p[0],top+0.1-(0.12*t),p[2]],0.02,YL);}
  marLine(B,[hb[0],top-0.08,hb[2]],[hb[0],1.0,hb[2]],0.012,S_DGREY);sb(hb[0],0.92,hb[2],0.12,0.16,0.08,YL);sb(hb[0],0.78,hb[2],0.035,0.12,0.035,S_DGREY);}
 /* yard: a yellow lane line through the middle, hatching at the container ends, a stencilled FORKLIFTS ONLY */
 {const zm=Math.floor((zQ+1+g.front.zT-1)/2)+0.5,YL=[0.95,0.78,0.2];for(let x=1;x<W-1;x++){const i=Math.floor(zm)*W+x;if(g.solid[i]||g.floorT[i]!==7)continue;for(const o of [0.1,0.55])B.quad([[x+o,0.006,zm+0.04],[x+o+0.32,0.006,zm+0.04],[x+o+0.32,0.006,zm-0.04],[x+o,0.006,zm-0.04]],0,1,0,WUV,YL);}}
 /* containers: corner posts, door bars on the east end, the line's name stencilled on the side */
 for(const c of M.boxes){const h=c.h,z0=c.z,z1=c.z+1,dk=sdim(c.col,0.55);for(const x of [c.x0,c.x1])for(const z of [z0,z1])sb(x+(x===c.x0?0.04:-0.04),h/2,z+(z===z0?0.04:-0.04),0.1,h+0.01,0.1,dk);
  for(let k=0;k<4;k++)sb(c.x1+0.012,h/2,z0+0.2+k*0.2,0.025,h-0.16,0.03,dk);sb(c.x1+0.02,h*0.5,z0+0.5,0.02,0.1,0.8,S_GREY);
  marText(B,c.txt,(c.x0+c.x1)/2,h*0.62,z1+0.002,Math.min(0.045,(c.x1-c.x0-0.4)/(c.txt.length*6)),[0.97,0.97,0.95]);}
 /* roofs: the containers' and the sheds' corrugated tops in their own colour (the wall pass draws tops untinted) */
 for(let z=zQ+1;z<g.front.zT;z++)for(let x=0;x<W;x++){const i=z*W+x,t=g.wallX[i];if(t!==218&&t!==220)continue;const h=(g.wh[i]||WALL_H)+0.004,c=g.tint[i]>=100?STREET_TINT[g.tint[i]-100]:[1,1,1],k=t===220?0.92:0.8;
  B.quad([[x,h,z+1],[x+1,h,z+1],[x+1,h,z],[x,h,z]],0,1,0,TUV[221],[c[0]*k,c[1]*k,c[2]*k]);}
 /* street fronts: a roller shutter and the shed's name painted on a board on the parapet */
 for(const s of M.shut){const z=s.z+0.006,y1=0.98;B.quad([[s.b,0.02,z],[s.a,0.02,z],[s.a,y1,z],[s.b,y1,z]],0,0,1,TUV[179],[0.95,0.95,0.95]);sb((s.a+s.b)/2,y1+0.03,z+0.02,s.b-s.a+0.1,0.06,0.05,S_DGREY);
  const cx=(s.a+s.b)/2,w=Math.max(s.b-s.a+1.2,textW(s.t,0.045)+0.4);sb(cx,1.36,z+0.03,w,0.4,0.05,[0.95,0.93,0.86]);sb(cx,1.36,z+0.01,w+0.06,0.46,0.03,S_DGREY);marText(B,s.t,cx,1.36,z+0.055,0.045,s.c);
  for(const o of [-w/2+0.2,w/2-0.2])sb(cx+o,1.62,z+0.12,0.04,0.12,0.2,S_DGREY),sb(cx+o,1.58,z+0.2,0.12,0.04,0.08,[1,0.9,0.6],true);}
 B.round=r0;}

/* ---- Lex's boats in their berths: the runabout bow out to sea, bow and stern lines to the cleats (drawn per frame: boats sink) ---- */
function drawMarinaBoat(B,g,q,i,col){const M=g.mar,b=M&&M.berths.find(b=>Math.abs(b.x-q.x)<0.01&&Math.abs(b.z-q.z)<0.01);
 if(!b){drawRiva(B,q.x,q.z,i%2?Math.PI:0,col);return false;}
 drawRiva(B,q.x,q.z,Math.PI/2,col);
 for(const [ex,f] of [[b.xl,1],[b.xr,-1]]){const s=Math.sign(ex-q.x);for(const [dz,bz,bw] of [[-1.05,-1.0,0.15],[1.05,1.0,0.4]])marLine(B,[ex-f*0.12,0.07,q.z+dz],[q.x+s*bw,0.4,q.z+bz],0.018,MAR_ROPE);}
 return true;}

/* ================= THE RUNABOUT =================
   Boat space: +x is the bow, y up, z across. One lofted hull: half-width and sheer height per station, the profile running from the
   bottom up the side (boot stripe, mahogany, chrome strake) and across a cambered deck laid in mahogany planks with cream seams. */
const RIVA_L=2.7,RIVA_HW=0.46;
const RIVA_MAH=[0.4,0.17,0.07],RIVA_DECK=[0.5,0.25,0.11],RIVA_SEAM=[0.94,0.89,0.76],RIVA_CREAM=[0.95,0.92,0.82],RIVA_BOT=[0.08,0.12,0.24],RIVA_BOOT=[0.96,0.96,0.93],RIVA_CHR=[0.92,0.93,0.96];
function rivaW(x){const t=(x+RIVA_L/2)/RIVA_L;if(t<0.06)return RIVA_HW*(0.86+0.14*t/0.06);if(t<0.55)return RIVA_HW;const u=(t-0.55)/0.45;return Math.max(0.012,RIVA_HW*Math.pow(Math.max(0,1-Math.pow(u,1.9)),0.62));}
function rivaY(x){const t=(x+RIVA_L/2)/RIVA_L;return t<0.55?0.34+0.02*t/0.55:0.36+0.09*Math.pow((t-0.55)/0.45,1.8);}
function drawRiva(B,x,z,a,col){const c=col||[1,0.3,0.75];carCache(B,'riva|'+c.join(','),x,z,1,a||0,0,(K)=>rivaRaw(K,c));}
function rivaRaw(B,col){const b=A.mul(A.T(0,0,0),A.RY(0)),PT=TUV[56],CH=TUV[58],GL=TUV[57],r0=B.round;B.round=0;
 const tw=p=>apply(b,p[0],p[1],p[2]);
 const nrm=(p0,p1,p2)=>{const u=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],v=[p2[0]-p0[0],p2[1]-p0[1],p2[2]-p0[2]];const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const l=Math.hypot(n[0],n[1],n[2]);return l<1e-9?null:n.map(q=>q/l);};
 const quad=(pts,c,uv,cen)=>{const T=pts.map(tw);let n=nrm(T[0],T[1],T[2])||nrm(T[0],T[2],T[3]);if(!n)return;const m=[(T[0][0]+T[2][0])/2-cen[0],(T[0][1]+T[2][1])/2-cen[1],(T[0][2]+T[2][2])/2-cen[2]];if(n[0]*m[0]+n[1]*m[1]+n[2]*m[2]<0){T.reverse();n=n.map(q=>-q);}B.quad(T,n[0],n[1],n[2],uv||PT,c);};
 const L=RIVA_L,XS=[-1.35,-1.31,-1.15,-0.9,-0.6,-0.3,0,0.3,0.55,0.75,0.9,1.02,1.12,1.2,1.27,1.32,1.35];
 /* the deck's lateral samples (fraction of the deck half-width, edge to centre): planks with a cream seam between */
 const DK=[1,0.93,0.915,0.75,0.735,0.57,0.555,0.39,0.375,0.21,0.195,0.03,0];
 const prof=x=>{const w=rivaW(x),y=rivaY(x),dw=0.975*w,cam=0.035*Math.min(1,w/0.2);
  const side=[[0.55*w,-0.01],[0.93*w,0.04],[0.985*w,0.09],[w,y-0.055],[w,y-0.028],[dw,y]];
  const dk=DK.map(f=>[dw*f,y+cam*(1-f*f)]);return {side,dk,w,y};};
 const SC=[RIVA_BOT,RIVA_BOOT,RIVA_MAH,RIVA_CHR,RIVA_MAH],SU=[null,null,PT,CH,PT];
 const S=XS.map(prof);
 for(let i=0;i<XS.length-1;i++){const x0=XS[i],x1=XS[i+1],P=S[i],Q=S[i+1];
  for(const sd of [1,-1]){
   for(let j=0;j<P.side.length-1;j++){const a0=P.side[j],a1=P.side[j+1],b0=Q.side[j],b1=Q.side[j+1];quad([[x0,a0[1],a0[0]*sd],[x1,b0[1],b0[0]*sd],[x1,b1[1],b1[0]*sd],[x0,a1[1],a1[0]*sd]],SC[j],SU[j]||PT,[(x0+x1)/2,0.15,0]);}
   for(let j=0;j<DK.length-1;j++){const a0=P.dk[j],a1=P.dk[j+1],b0=Q.dk[j],b1=Q.dk[j+1],seam=j%2===1;quad([[x0,a0[1],a0[0]*sd],[x1,b0[1],b0[0]*sd],[x1,b1[1],b1[0]*sd],[x0,a1[1],a1[0]*sd]],seam?RIVA_SEAM:RIVA_DECK,PT,[(x0+x1)/2,-2,0]);}}}
 /* the transom: the stern's flat back, mahogany with a chrome edge */
 {const P=S[0],x=XS[0];const pts=[[0,-0.04]].concat(P.side).concat(P.dk.slice(1));for(let j=0;j<pts.length-1;j++){const p=pts[j],q=pts[j+1];quad([[x,p[1],p[0]],[x,q[1],q[0]],[x,q[1],-q[0]],[x,p[1],-p[0]]],j===4?RIVA_CHR:RIVA_MAH,PT,[x+1,0.2,0]);}}
 const P=(px,py,pz,sx,sy,sz,c,uv,em,ry,rz)=>B.box(A.mul(A.mul(A.mul(A.T(px,py,pz),A.RY(ry||0)),A.RZ(rz||0)),A.S(sx,sy,sz)),c,!!em,uv);
 const Y=x=>rivaY(x)+0.03,Wd=x=>rivaW(x);
 /* cockpit: two cream leather benches with backrests, piping in the boat's colour; the sunpad over the engine hatch */
 B.round=0.5;
 for(const [x0,w] of [[0.02,0.26],[-0.42,0.26]]){const y=Y(x0),hw=Wd(x0)*0.8;P(x0,y+0.05,0,w,0.1,hw*2,RIVA_CREAM);P(x0-w/2+0.04,y+0.15,0,0.08,0.22,hw*2,RIVA_CREAM,null,false,0,0.18);}
 P(-0.95,Y(-0.95)+0.035,0,0.62,0.07,Wd(-0.95)*1.5,RIVA_CREAM);B.round=0;
 for(const [x0,w] of [[0.02,0.26],[-0.42,0.26]]){const y=Y(x0),hw=Wd(x0)*0.8;P(x0+w/2,y+0.1,0,0.012,0.012,hw*2,col);}
 P(-0.95+0.31,Y(-0.95)+0.07,0,0.012,0.012,Wd(-0.95)*1.5,col);
 for(const sd of [-1,1])P(-0.95,Y(-0.95)+0.075,sd*0.12,0.6,0.004,0.01,sdim(RIVA_CREAM,0.85));
 /* the dashboard and the wheel, two chrome air vents aft, a chrome grab rail */
 P(0.27,Y(0.27)+0.07,0,0.07,0.1,Wd(0.27)*1.6,RIVA_MAH,PT);for(const o of [-0.2,-0.1,0.1])P(0.24,Y(0.27)+0.09,o,0.01,0.035,0.035,RIVA_CHR,CH);
 P(0.19,Y(0.19)+0.17,-0.17,0.02,0.18,0.18,[0.95,0.93,0.86],null,false,0,0.5);P(0.19,Y(0.19)+0.17,-0.17,0.018,0.04,0.04,RIVA_CHR,CH,false,0,0.5);
 for(const sd of [-1,1]){P(-0.66,Y(-0.66)+0.03,sd*0.3,0.16,0.05,0.07,RIVA_CHR,CH);P(-0.66,Y(-0.66)+0.035,sd*0.3,0.12,0.03,0.08,[0.1,0.1,0.12]);}
 /* the windscreen: a centre pane and two angled side panes in chrome frames */
 {const x=0.36,y=Y(x),hw=Wd(x)*0.82;P(x,y+0.09,0,0.015,0.16,hw*1.1,[0.55,0.75,0.9],GL,false,0,-0.35);P(x+0.03,y+0.17,0,0.02,0.02,hw*1.12,RIVA_CHR,CH);
  for(const sd of [-1,1]){P(x-0.12,y+0.08,sd*hw*0.92,0.28,0.14,0.012,[0.55,0.75,0.9],GL,false,sd*0.2);P(x-0.12,y+0.155,sd*hw*0.95,0.28,0.016,0.02,RIVA_CHR,CH,false,sd*0.2);P(x+0.02,y+0.08,sd*hw*0.6,0.03,0.17,0.03,RIVA_CHR,CH);}}
 /* bow fittings: a chrome cleat, the red and green running lights, the bow staff; stern: the flagstaff and a flag in the boat's colour */
 P(1.0,Y(1.0)+0.02,0,0.12,0.03,0.04,RIVA_CHR,CH);P(1.05,Y(1.05)+0.01,0,0.04,0.02,0.12,RIVA_CHR,CH);
 for(const [sd,c] of [[1,[1,0.15,0.15]],[-1,[0.2,1,0.4]]])P(0.62,rivaY(0.62)-0.04,sd*(rivaW(0.62)+0.004),0.06,0.03,0.008,c,null,true);
 P(1.28,Y(1.28)+0.09,0,0.015,0.2,0.015,RIVA_CHR,CH);
 P(-1.3,Y(-1.3)+0.2,0,0.018,0.42,0.018,RIVA_CHR,CH);P(-1.3-0.12,Y(-1.3)+0.34,0,0.24,0.14,0.008,col);P(-1.3-0.12,Y(-1.3)+0.34,0.006,0.24,0.04,0.008,RIVA_CREAM);
 /* the chrome name plate on the transom */
 P(-1.353,rivaY(-1.35)-0.12,0,0.008,0.04,0.32,RIVA_CHR,CH);
 B.round=r0;}
