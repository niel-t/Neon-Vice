'use strict';
/* ================= STAIRS: one corner staircase for every stage change on foot =================
   Coral Tower and Kade Tower (up) and the Vale Trust garage (down) all use the same thing: an L-shaped corner staircase, two cells wide,
   with a handrail. Seen from the room it fills a top corner: the first flight runs up the side wall toward the top wall (you walk
   straight onto it from the room), there is a landing in the corner, and the second flight runs along the top wall back toward the
   room. At the far end of the second flight the floor changes, and on the next floor you step off the same staircase at the same end,
   in the same corner, facing the same way.
   - Going up, the stairs rise. On the floor above, the same L is an open stairwell with a rail round it, and you come up out of it
     onto the landing.
   - Going down (the garage), the stairs sink into the floor. On the floor below, the same L climbs up to the ceiling, and you come down
     it onto the landing.
   Local cells: u counts away from the side wall (0 next to it), v down from the top wall (0 next to it). The corner landing is u 0-1,
   v 0-1; the first flight u 0-1, v 2-3 (you walk in from v 4); the second flight u 2-3, v 0-1. The stair's 'at' is the centre of the
   second flight's far cell (u 3, z 3); an arrival's 'at' is the landing just past it (u 4). Stair ids 'up' and 'down' are staircases;
   arrivals are the ones those stairs arrive at. The staircase you leave by is walkable (the player rises or sinks with the steps,
   flightY, and its rails stop you); the one you arrive by is a solid cell set (an open stairwell drops below the floor, stairs from
   above stand on it), so you can't walk back. Everything is drawn once into the level's static batch.
   Loaded after act4sets.js; nothing runs at load time. */
const FLIGHT={H:1.2,STEPS:8};
/* the stage def a loaded map belongs to: the same def object the stage was built from */
function stairStageOf(g){if(!g||!g.def||g.def.hub||typeof MISSIONS==='undefined')return null;
 for(const [m,M] of Object.entries(MISSIONS)){if(!M||!M.stageDefs)continue;for(const [sid,raw] of Object.entries(M.stageDefs))if(raw&&raw.def===g.def)return {m,sid,raw,defs:M.stageDefs};}return null;}
/* staircases on this map: {top (far cell), side (-1 corner on the left, 1 on the right), z0 (row by the top wall), xw (side wall face),
   xi (far edge), go (you leave by it), dir (+1 up, -1 down), s (the stair), k (the arrival key)} */
function stairFlights(g){if(!g)return [];if(g._fl&&g._flDef===g.def)return g._fl;const out=[];g._fl=out;g._flDef=g.def;const st=stairStageOf(g);if(!st)return out;const W=g.W;
 const mk=(top,z,go,dir,s,k)=>{const side=top<W/2?-1:1,xw=side>0?top+4:top-3;out.push({top,side,z0:Math.floor(z)-1,xw,xi:xw-side*4,go,dir,s,k});};
 for(const s of st.raw.stairs||[])if(s.id==='up'||s.id==='down')mk(Math.floor(s.at[0]),s.at[1],true,s.id==='up'?1:-1,s,null);
 for(const [k,a] of Object.entries(st.raw.arrivals||{})){let dir=0;for(const o of Object.values(st.defs))for(const s of o.stairs||[])if(s.to===st.sid&&s.arrive===k&&(s.id==='up'||s.id==='down'))dir=s.id==='up'?1:-1;
  if(!dir)continue;const land=Math.floor(a.at[0]),side=land<W/2?-1:1;mk(land+side,a.at[1],false,dir,null,k);}
 return out;}
const flU=(f,x)=>f.side*(f.xw-x),flV=(f,z)=>z-f.z0,flX=(f,u)=>f.xw-f.side*u;
const inFlight=(f,x,z)=>{const u=flU(f,x),v=flV(f,z);return u>=0&&v>=0&&((v<=2&&u<=4)||(v<=4&&u<=2));};
/* how far up the staircase a point is (0 where you walk on, 0.5 on the corner landing, 1 at the far end) */
function flightG(f,x,z){const u=Math.max(0,Math.min(4,flU(f,x))),v=Math.max(0,Math.min(4,flV(f,z)));if(v>2&&u<=2)return (4-v)/4;if(u<2)return 0.5;return 0.5+(u-2)/4;}
/* the height of the steps under a point: leaving, up rises and down sinks; arriving, the stairwell you came up drops away toward where its
   first flight starts and the stairs you came down climb toward it */
function flightY(f,x,z){const t=flightG(f,x,z===undefined?f.z0+1:z);return f.go?f.dir*FLIGHT.H*t:-f.dir*FLIGHT.H*(1-t);}
/* (the stage runner hands out copies of the stairs, so match by id) */
function stairFlightOf(g,s){return s?stairFlights(g).find(f=>f.go&&f.s.id===s.id&&f.s.to===s.to)||null:null;}
function arriveFlightOf(g,k){return stairFlights(g).find(f=>!f.go&&f.k===k)||null;}
/* the cells of a staircase */
function flightCells(f){const o=[];for(let u=0;u<4;u++)for(let v=0;v<(u<2?4:2);v++)o.push([f.side>0?f.xw-1-u:f.xw+u,f.z0+v]);return o;}
/* a stairwell drops away (solid, below the floor), stairs down from above stand on the floor (solid), a way down has no floor */
function stairsDress(g){const fl=stairFlights(g);if(!fl.length)return;const W=g.W;g.pit=g.pit||new Uint8Array(W*g.H);
 /* the Three renderer's ground plane sits just under the floor; drop it so a stairwell shows its steps */
 if(fl.some(f=>f.go?f.dir<0:f.dir>0))g.lowGround=1;
 for(const f of fl)for(const [x,z] of flightCells(f)){const i=z*W+x;if(x<1||x>=W-1)continue;g.furn[i]=0;if(g.rug)g.rug[i]=0;
  if(f.go){if(f.dir<0)g.pit[i]=1;continue;}
  g.solid[i]=1;g.wh[i]=f.dir>0?-(FLIGHT.H+0.12):0.02;if(!g.wallT[i])g.wallT[i]=g.def.wall||1;g.topT[i]=0;g.tint[i]=-1;g.glow[i]=0;if(g.wallX)g.wallX[i]=0;if(g.topX)g.topX[i]=0;}}
/* rails you can't walk through on the staircase you leave by: along both flights' room sides and across the far end (you walk on at v 4) */
function flightRails(f){if(!f.go)return [];return [{x:flX(f,2),z:f.z0+3,w:0.14,d:2},{x:flX(f,3),z:f.z0+2,w:2,d:0.14},{x:f.xi,z:f.z0+1,w:0.14,d:2}];}
/* every frame: the player's height on a staircase, and the rails */
function stairTick(g){const p=g&&g.player;if(!p||g.climb||g.climbIn||g.seatP)return;const fl=stairFlights(g);if(!fl.length)return;let y=0;
 for(const f of fl){if(!f.go)continue;if(inFlight(f,p.x,p.z))y=flightY(f,p.x,p.z);if(p.alive!==false)for(const r of flightRails(f))boxPush(r,p);}
 p.y=(p.y||0)+(y-(p.y||0))*0.5;if(Math.abs(p.y)<0.004)p.y=0;}
/* clear zones for the set dressers: every staircase cell, the landing past its far end and the floor where you walk on */
function stairClear(g){const o=[];for(const f of stairFlights(g)){for(const [x,z] of flightCells(f))o.push([x+0.5,z+0.5,0.9]);
 for(const v of [0,1,2])o.push([flX(f,4.5),f.z0+v+0.5,0.9]);for(const u of [0.5,1.5,2.5])o.push([flX(f,u),f.z0+4.5,0.9]);}return o;}

/* ---------------- the look ---------------- */
function stairKit(g){const st=stairStageOf(g),m=st&&st.m;
 if(m==='c2')return {step:[0.9,0.88,0.86],nose:[0.82,0.64,0.24],rail:[0.85,0.68,0.22],post:[0.78,0.6,0.2],wall:[0.82,0.8,0.78],sign:[0.3,1,0.5]};
 if(m==='c10')return {step:[0.6,0.58,0.55],nose:[0.95,0.78,0.15],rail:[0.32,0.32,0.36],post:[0.28,0.28,0.32],wall:[0.55,0.54,0.52],sign:[0.3,1,0.5]};
 return {step:[0.62,0.61,0.58],nose:[0.96,0.76,0.12],rail:[0.96,0.76,0.12],post:[0.9,0.7,0.1],wall:[0.6,0.59,0.57],sign:[0.3,1,0.5]};}
function drawFlights(B,g){const fl=stairFlights(g);if(!fl.length)return;const K=stairKit(g),H=FLIGHT.H,S=FLIGHT.STEPS,r0=B.round;B.round=0;
 const bx=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x,y,z,0,sx,sy,sz),c,!!em);
 /* a bar between two points that differ along x or along z (and in height) */
 const seg=(x0,y0,z0,x1,y1,z1,t,c)=>{const cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2;
  if(Math.abs(z1-z0)<1e-6){const L=Math.hypot(x1-x0,y1-y0);B.box(A.mul(A.mul(A.T(cx,cy,cz),A.RZ(Math.atan2(y1-y0,x1-x0))),A.S(L,t,t)),c,false);}
  else{const L=Math.hypot(z1-z0,y1-y0);B.box(A.mul(A.mul(A.T(cx,cy,cz),A.RX(Math.atan2(-(y1-y0),z1-z0))),A.S(t,t,L)),c,false);}};
 for(const f of fl){const sinks=f.go?f.dir<0:f.dir>0,lo=-H-0.08,shade=y=>sinks?Math.max(0.3,1+y/H*0.7):1,Y=(x,z)=>flightY(f,x,z),b0=sinks?lo:0;
  /* one block per tread from the floor (or the bottom of the well) up to its top, so the sides read as a staircase; the tread's top is its
     higher edge and the nosing runs along its lower edge */
  const tread=(xa,za,xb,zb,along,k)=>{const ya=Y(xa,za),yb=Y(xb,zb),top=Math.max(ya,yb),hh=Math.max(0.01,top-b0),s=shade(top),c=K.step.map(q=>q*s*(0.95+(k%2)*0.05));
   const cx=(xa+xb)/2,cz=(za+zb)/2,lx=along==='x'?Math.abs(xb-xa):2,lz=along==='z'?Math.abs(zb-za):2;
   const X=along==='x'?cx:flX(f,1),Z=along==='z'?cz:f.z0+1;bx(X,b0+hh/2,Z,lx,hh,lz,c);
   if(Math.abs(ya-yb)>1e-4){const ex=ya<yb?xa:xb,ez=ya<yb?za:zb;if(along==='x')bx(ex+(ya<yb?1:-1)*Math.sign(xb-xa)*0.03,top+0.004,Z,0.05,0.008,1.96,K.nose.map(q=>q*s));
    else bx(X,top+0.004,ez+(ya<yb?1:-1)*Math.sign(zb-za)*0.03,1.96,0.008,0.05,K.nose.map(q=>q*s));}};
  const T=2/S;
  /* first flight: up the side wall from v 4 to v 2 */
  for(let k=0;k<S;k++){const za=f.z0+4-k*T,zb=za-T;tread(flX(f,1),za,flX(f,1),zb,'z',k);}
  /* the corner landing */
  {const top=Y(flX(f,1),f.z0+1),hh=Math.max(0.01,top-b0),s=shade(top);bx(flX(f,1),b0+hh/2,f.z0+1,2,hh,2,K.step.map(q=>q*s*0.97));}
  /* second flight: along the top wall from u 2 to the far end */
  for(let k=0;k<S;k++){const xa=flX(f,2+k*T),xb=flX(f,2+(k+1)*T);tread(xa,f.z0+1,xb,f.z0+1,'x',k);}
  const dk=K.wall.map(q=>q*0.5),post=(x,y,z)=>bx(x,y+0.46,z,0.045,0.92,0.045,K.post);
  if(sinks){/* the well's walls go down to the bottom on every side of the L */
   const wl=(x0,z0,x1,z1)=>{const along=Math.abs(z1-z0)<1e-6;bx((x0+x1)/2,lo/2-0.004,(z0+z1)/2,along?Math.abs(x1-x0):0.06,-lo,along?0.06:Math.abs(z1-z0),dk);};
   wl(flX(f,0),f.z0,flX(f,4),f.z0);wl(flX(f,0),f.z0,flX(f,0),f.z0+4);wl(flX(f,4),f.z0,flX(f,4),f.z0+2);wl(flX(f,2),f.z0+2,flX(f,4),f.z0+2);wl(flX(f,2),f.z0+2,flX(f,2),f.z0+4);wl(flX(f,0),f.z0+4,flX(f,2),f.z0+4);
   /* the balustrade round the opening, at floor level: open where you walk in (a way down) or where you came up (an arrival) */
   const rail=(x0,z0,x1,z1)=>{bx((x0+x1)/2,0.92,(z0+z1)/2,Math.max(0.07,Math.abs(x1-x0)),0.06,Math.max(0.07,Math.abs(z1-z0)),K.rail);const n=Math.round(Math.hypot(x1-x0,z1-z0)*2);for(let i=0;i<=n;i++)post(x0+(x1-x0)*i/n,0,z0+(z1-z0)*i/n);};
   rail(flX(f,2),f.z0+2,flX(f,4),f.z0+2);rail(flX(f,2),f.z0+2,flX(f,2),f.z0+4);
   if(f.go)rail(flX(f,4),f.z0,flX(f,4),f.z0+2);else rail(flX(f,0),f.z0+4,flX(f,2),f.z0+4);}
  else{/* stairs standing on the floor: stringers and handrails up both flights' room sides, on posts */
   const xr=flX(f,2),zr=f.z0+2;
   seg(xr,Y(xr,f.z0+4)+0.05,f.z0+4,xr,Y(xr,f.z0+2)+0.05,f.z0+2,0.1,K.wall.map(q=>q*0.7));seg(xr,Y(xr,f.z0+4)+0.92,f.z0+4,xr,Y(xr,f.z0+2)+0.92,f.z0+2,0.06,K.rail);
   seg(flX(f,2),Y(flX(f,2),zr)+0.05,zr,f.xi,Y(f.xi,zr)+0.05,zr,0.1,K.wall.map(q=>q*0.7));seg(flX(f,2),Y(flX(f,2),zr)+0.92,zr,f.xi,Y(f.xi,zr)+0.92,zr,0.06,K.rail);
   for(let i=0;i<=4;i++){const z=f.z0+4-i*0.5;post(xr,Y(xr,z),z);const x=flX(f,2+i*0.5);post(x,Y(x,zr),zr);}
   /* the far end of the way out has a rail across it; stairs you came down are open there and railed where they meet the ceiling */
   if(f.go){const y=Y(f.xi,f.z0+1);bx(f.xi,y+0.92,f.z0+1,0.06,0.06,2,K.rail);for(let i=0;i<=4;i++)post(f.xi,y,f.z0+i*0.5);}
   else{const y=Y(flX(f,1),f.z0+4);bx(flX(f,1),y+0.92,f.z0+4,2,0.06,0.06,K.rail);for(let i=0;i<=4;i++)post(flX(f,i*0.5),y,f.z0+4);}}
  /* the sign on the wall over the far end of a way down: a green arrow pointing the way you go */
  if(f.go&&f.dir<0){const x=f.top+0.5,y=0.92,z=f.z0+0.05;bx(x,y,z-0.01,0.62,0.24,0.04,[0.05,0.2,0.08]);bx(x,y,z+0.015,0.5,0.14,0.01,K.sign,true);
   const d=-f.side,wb=(px,py,a,L)=>B.box(A.mul(A.mul(A.T(px,py,z+0.025),A.RZ(a)),A.S(L,0.032,0.01)),[0.92,1,0.92],true);
   wb(x-d*0.03,y,0,0.26);wb(x+d*0.06,y+0.042,-d*0.785,0.13);wb(x+d*0.06,y-0.042,d*0.785,0.13);}}
 B.round=r0;}
