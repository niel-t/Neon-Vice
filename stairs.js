'use strict';
/* ================= STAIRS: one plain staircase for every stage change on foot =================
   Coral Tower and Kade Tower (up) and the Vale Trust garage (down) all use the same thing: a straight flight of real steps, two cells
   wide and three long, along the top wall in a corner, with a handrail. You walk in at the corner end and go along the flight toward the
   room; at its far end the floor changes, and on the next floor you step off the same flight at the same end, in the same corner, facing
   the same way.
   - Going up, the flight rises toward the room. On the floor above, the same flight is an open stairwell with a rail round it, and you
     come up out of it onto the landing.
   - Going down (the garage), the stairs sink into the floor toward the room. On the floor below, the same flight climbs up to the
     ceiling, and you come down it onto the landing.
   The stair's 'at' is the centre of the flight's far end (its top cell for a way up, its bottom cell for a way down); an arrival's 'at'
   is the landing just past that end. Stair ids 'up' and 'down' are flights; arrivals are the ones those stairs arrive at. The flight you
   leave by is walkable (the player rises or sinks on it, stairY); the one you arrive by is a solid cell set (an open stairwell drops
   below the floor, a flight from above stands on it), so you can't walk back. Everything is drawn once into the level's static batch.
   Loaded after act4sets.js; nothing runs at load time. */
const FLIGHT={N:3,H:1.2,STEPS:12};
/* the stage def a loaded map belongs to: the same def object the stage was built from */
function stairStageOf(g){if(!g||!g.def||g.def.hub||typeof MISSIONS==='undefined')return null;
 for(const [m,M] of Object.entries(MISSIONS)){if(!M||!M.stageDefs)continue;for(const [sid,raw] of Object.entries(M.stageDefs))if(raw&&raw.def===g.def)return {m,sid,raw,defs:M.stageDefs};}return null;}
/* flights on this map: {top (far-end cell), side (-1 corner to the left, 1 to the right), z0 (row by the wall), xi (far edge), xc (corner
   edge), go (you leave by it), v (+1 rises toward the far end as you walk it, -1 sinks), s (the stair), k (the arrival key)} */
function stairFlights(g){if(!g)return [];if(g._fl&&g._flDef===g.def)return g._fl;const out=[];g._fl=out;g._flDef=g.def;const st=stairStageOf(g);if(!st)return out;const W=g.W,N=FLIGHT.N;
 const mk=(top,z,go,dir,s,k)=>{const side=top<W/2?-1:1,xi=side>0?top:top+1;out.push({top,side,z0:Math.floor(z)-1,xi,xc:xi+N*side,go,dir,s,k});};
 for(const s of st.raw.stairs||[])if(s.id==='up'||s.id==='down')mk(Math.floor(s.at[0]),s.at[1],true,s.id==='up'?1:-1,s,null);
 for(const [k,a] of Object.entries(st.raw.arrivals||{})){let dir=0;for(const o of Object.values(st.defs))for(const s of o.stairs||[])if(s.to===st.sid&&s.arrive===k&&(s.id==='up'||s.id==='down'))dir=s.id==='up'?1:-1;
  if(!dir)continue;const land=Math.floor(a.at[0]),side=land<W/2?-1:1;mk(land+side,a.at[1],false,dir,null,k);}
 return out;}
/* how far along a flight a point is: 0 at the corner edge, 1 at the far edge */
const flightF=(f,x)=>Math.max(0,Math.min(1,(x-f.xc)/(f.xi-f.xc)));
/* the height of the steps under a point: leaving, up rises and down sinks toward the far end; arriving, the stairwell you came up drops
   toward the corner and the flight you came down climbs toward it */
function flightY(f,x){const t=flightF(f,x);return f.go?f.dir*FLIGHT.H*t:-f.dir*FLIGHT.H*(1-t);}
const inFlight=(f,x,z)=>z>=f.z0&&z<=f.z0+2&&(x-f.xc)*(x-f.xi)<=0;
function stairFlightOf(g,s){return s?stairFlights(g).find(f=>f.go&&f.s===s)||null:null;}
function arriveFlightOf(g,k){return stairFlights(g).find(f=>!f.go&&f.k===k)||null;}
/* the cells: a stairwell drops away (solid, below the floor), a flight down from above stands on the floor (solid), a way down has no floor */
function stairsDress(g){const fl=stairFlights(g);if(!fl.length)return;const W=g.W,N=FLIGHT.N;g.pit=g.pit||new Uint8Array(W*g.H);
 /* the Three renderer's ground plane sits just under the floor; drop it so a stairwell shows its steps */
 if(fl.some(f=>f.go?f.dir<0:f.dir>0))g.lowGround=1;
 for(const f of fl)for(let n=0;n<N;n++)for(let dz=0;dz<2;dz++){const x=f.top+n*f.side,z=f.z0+dz,i=z*W+x;if(x<1||x>=W-1)continue;g.furn[i]=0;if(g.rug)g.rug[i]=0;
  if(f.go){if(f.dir<0){g.pit[i]=1;}continue;}
  g.solid[i]=1;g.wh[i]=f.dir>0?-(FLIGHT.H+0.12):0.02;if(!g.wallT[i])g.wallT[i]=g.def.wall||1;g.topT[i]=0;g.tint[i]=-1;g.glow[i]=0;if(g.wallX)g.wallX[i]=0;if(g.topX)g.topX[i]=0;}}
/* rails you can't walk through on the flight you leave by: along its room side past the corner cell, and across its far end */
function flightRails(f){if(!f.go)return [];const z1=f.z0+2,a=f.xc-f.side,b=f.xi;return [{x:(a+b)/2,z:z1,w:Math.abs(b-a),d:0.14},{x:f.xi,z:f.z0+1,w:0.14,d:2}];}
/* every frame: the player's height on a flight, and the rails */
function stairTick(g){const p=g&&g.player;if(!p||g.climb||g.climbIn||g.seatP)return;const fl=stairFlights(g);if(!fl.length)return;let y=0;
 for(const f of fl){if(!f.go)continue;if(inFlight(f,p.x,p.z))y=flightY(f,p.x);if(p.alive!==false)for(const r of flightRails(f))boxPush(r,p);}
 p.y=(p.y||0)+(y-(p.y||0))*0.5;if(Math.abs(p.y)<0.004)p.y=0;}
/* clear zones for the set dressers: every flight cell, its landing and the strip in front of it */
function stairClear(g){const o=[];for(const f of stairFlights(g)){for(let n=-1;n<=FLIGHT.N;n++)for(let dz=0;dz<3;dz++)o.push([f.top+n*f.side+0.5,f.z0+dz+0.5,0.9]);}return o;}

/* ---------------- the look ---------------- */
function stairKit(g){const st=stairStageOf(g),m=st&&st.m;
 if(m==='c2')return {step:[0.9,0.88,0.86],nose:[0.82,0.64,0.24],rail:[0.85,0.68,0.22],post:[0.78,0.6,0.2],wall:[0.82,0.8,0.78],deep:[0.18,0.16,0.2],sign:[0.3,1,0.5]};
 if(m==='c10')return {step:[0.6,0.58,0.55],nose:[0.95,0.78,0.15],rail:[0.32,0.32,0.36],post:[0.28,0.28,0.32],wall:[0.55,0.54,0.52],deep:[0.12,0.12,0.14],sign:[0.3,1,0.5]};
 return {step:[0.62,0.61,0.58],nose:[0.96,0.76,0.12],rail:[0.96,0.76,0.12],post:[0.9,0.7,0.1],wall:[0.6,0.59,0.57],deep:[0.1,0.1,0.12],sign:[0.3,1,0.5]};}
function drawFlights(B,g){const fl=stairFlights(g);if(!fl.length)return;const K=stairKit(g),N=FLIGHT.N,H=FLIGHT.H,S=FLIGHT.STEPS,T=N/S,r0=B.round;B.round=0;
 const bx=(x,y,z,sx,sy,sz,c,em)=>B.box(TRS(x,y,z,0,sx,sy,sz),c,!!em);
 /* a sloped bar from (x0,y0) to (x1,y1) along the flight at row z */
 const bar=(x0,y0,x1,y1,z,t,c)=>{const L=Math.hypot(x1-x0,y1-y0);B.box(A.mul(A.mul(A.T((x0+x1)/2,(y0+y1)/2,z),A.RZ(Math.atan2(y1-y0,x1-x0))),A.S(L,t,t)),c,false);};
 for(const f of fl){const zc=f.z0+1,zr=f.z0+1.93,sinks=f.go?f.dir<0:f.dir>0,lo=-H-0.08,shade=y=>sinks?Math.max(0.28,1+y/H*0.72):1;
  /* the steps: one block per tread, from the floor (or the bottom of the well) up to its top, so the side reads as a staircase */
  for(let k=0;k<S;k++){const xm=f.xc+(f.xi-f.xc)*(k+0.5)/S,top=f.go?f.dir*H*(k+1)/S:-f.dir*H*(S-k)/S,b0=sinks?lo:0,hh=Math.max(0.01,top-b0),s=shade(top),c=K.step.map(v=>v*s*(0.95+(k%2)*0.05));
   bx(xm,b0+hh/2,zc-0.02,T,hh,1.9,c);bx(xm+(f.dir>0?1:-1)*f.side*(T/2-0.03),top+0.004,zc-0.02,0.05,0.008,1.88,K.nose.map(v=>v*s));}
  if(sinks){/* the well: its walls go down to the bottom; the back wall is the building's */
   bx((f.xc+f.xi)/2,lo/2-0.004,f.z0+2+0.04,N,-lo,0.08,K.wall.map(v=>v*0.55));bx((f.xc+f.xi)/2,lo/2,f.z0-0.04,N,-lo,0.08,K.wall.map(v=>v*0.5));
   for(const ex of [f.xc,f.xi])bx(ex+(ex===f.xc?f.side:-f.side)*0.04,lo/2-0.004,zc,0.08,-lo,2,K.wall.map(v=>v*0.5));
   /* the balustrade round the opening, at floor level */
   const ra=f.go?f.xc-f.side:f.xc,rb=f.xi;bx((ra+rb)/2,0.92,zr+0.05,Math.abs(rb-ra),0.06,0.07,K.rail);bx((ra+rb)/2,0.03,zr+0.05,Math.abs(rb-ra),0.06,0.1,K.post);
   for(let n=0;n<=Math.round(Math.abs(rb-ra)*2);n++){const x=ra+(rb-ra)*n/Math.round(Math.abs(rb-ra)*2);bx(x,0.46,zr+0.05,0.045,0.9,0.045,K.post);}
   if(f.go){bx(f.xi-f.side*0.05,0.92,zc,0.07,0.06,2,K.rail);for(let n=0;n<=4;n++)bx(f.xi-f.side*0.05,0.46,f.z0+0.06+n*0.47,0.045,0.9,0.045,K.post);}
   else if(!(g.solid[f.z0*g.W+Math.floor(f.xc+f.side*0.5)]===1)){bx(f.xc,0.92,zc,0.07,0.06,2,K.rail);}}
  else{/* a flight standing on the floor: the stringer on the room side, the handrail following the slope on posts */
   const ya=flightY(f,f.xc),yb=flightY(f,f.xi);bar(f.xc,ya+0.05,f.xi,yb+0.05,zr+0.03,0.1,K.wall.map(v=>v*0.7));
   const ra=f.go?f.xc-f.side:f.xc,y0=flightY(f,ra);bar(ra,y0+0.92,f.xi,yb+0.92,zr+0.03,0.06,K.rail);
   for(let n=0;n<=4;n++){const x=ra+(f.xi-ra)*n/4,yy=flightY(f,x);bx(x,yy+0.46,zr+0.03,0.045,0.92,0.045,K.post);}
   bar(f.xc,ya+0.88,f.xi,yb+0.88,f.z0+0.06,0.05,K.rail);
   if(f.go){bx(f.xi-f.side*0.04,yb+0.92,zc,0.06,0.06,2,K.rail);for(let n=0;n<=4;n++)bx(f.xi-f.side*0.04,yb+0.46,f.z0+0.06+n*0.47,0.045,0.92,0.045,K.post);}}
  /* the sign on the wall over the far end of the way out */
  if(f.go){const x=f.top+0.5;bx(x,2.05,f.z0+0.04,0.62,0.24,0.04,[0.05,0.2,0.08]);bx(x,2.05,f.z0+0.065,0.5,0.14,0.01,K.sign,true);
   const d=-f.side,y=2.05,z=f.z0+0.075,wb=(px,py,a,L)=>B.box(A.mul(A.mul(A.T(px,py,z),A.RZ(a)),A.S(L,0.032,0.01)),[0.92,1,0.92],true);
   wb(x-d*0.03,y,0,0.26);wb(x+d*0.06,y+0.042,-d*0.785,0.13);wb(x+d*0.06,y-0.042,d*0.785,0.13);}}
 B.round=r0;}
