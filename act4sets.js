'use strict';
/* ================= ACT 4 SETS: Vale Trust Garage, the Coral Room and Opa-locka Hangar 7 =================
   Act 4 used the stock rooms: striped white floors, the generic wall posters, flat ramps painted on the floor. Each set now reads as
   the place it is (the same treatment act3.js gives Act 3):
   - VALE TRUST GARAGE (street level, P2, the vault dock): poured concrete slab with oil spots, painted block walls with a blue stripe
     and a hazard band, sprinkler and fire mains along the walls, fluorescent tubes, painted bays with wheel stops round the parked cars,
     aisle arrows, extinguisher cabinets, hose reels, electrical panels, tyre stacks, oil drums, cones, wire storage cages, a pay
     station, big stencilled level names. The cashier's lobby is black-and-gold marble. At the dock: diamond plate in the loading bays,
     numbered van bays, Vale's round vault door, gold pallets, cash carts, bollards and a hazard-hatched lane.
   - THE CORAL ROOM: coral terrazzo with brass strips, teal deco walls over a mahogany dado, round tables in coral linen with gilt
     chairs and candles, a jukebox, wine racks, palms, flamingo statues, a maitre d' stand, an aquarium, a piano and champagne stands;
     the kitchen has steel counters, a range with pots, a walk-in cooler, pan racks and produce crates; the back dock has ropes,
     fish boxes, an ice chest and a life ring.
   - OPA-LOCKA (the apron and Hangar 7): apron concrete slabs and corrugated hangar walls, baggage containers for the crates, ground
     power units, baggage carts, chocks, cones, a windsock; in the hangar epoxy floor, a jet engine on its stand, tool chests,
     workbenches, tyre stacks, maintenance stands, oxygen bottles, a yellow safety box painted round the jet and VALE TRUST on the wall.
   RAMPS (the same-corner rule from Act 3): the garage ramps are switchbacks built into the floor plan like Act 3's stairwells, but
   two cells wide. In a top corner: the lane down (the stair's 'at' sits on the line between its two cells, by the wall), a wall,
   and beside it the lane coming up from the floor below (closed off). On the floor below you come down the lane beside, facing back
   into the room, in the same corner (the arrival's 'at' is the bottom of that lane); past the divider the ramp is walled in.
   The player sinks down a lane and comes off the arrival lane from above (a4RampY). The hangar side door brings you in through the
   same top-right corner of the hangar.
   Everything here goes into the level's static batch (built once), so both renderers draw it and a phone pays nothing per frame.
   Furniture keeps its cells and its cover; only the look changes. Loaded after act4.js; nothing runs at load time. */

const A4_KIND={'VALE TRUST GARAGE: STREET LEVEL':'p1','VALE TRUST GARAGE: P2':'p2','VALE TRUST GARAGE':'dock','THE CORAL ROOM':'rest','OPA-LOCKA: THE APRON':'apron','HANGAR 7':'hangar'};
const a4Of=g=>g&&g.def&&!g.def.hub&&Object.prototype.hasOwnProperty.call(A4_KIND,g.def.name)?A4_KIND[g.def.name]:null;
const a4Gar=k=>k==='p1'||k==='p2'||k==='dock';
const A4R={N:3,RISE:0.6};
/* floorT is an Int8Array (ids up to 127), so the set's floors go in their own override, g.floorX, which buildStatic reads first */
const a4FT=(g,i)=>g.floorX&&g.floorX[i]||g.floorT[i];
const A4C={conc:[0.6,0.59,0.57],dk:[0.12,0.12,0.14],steel:[0.66,0.68,0.72],wh:[0.94,0.93,0.9],yel:[0.96,0.76,0.12],red:[0.78,0.1,0.1],org:[1,0.45,0.1],
 gold:[0.92,0.74,0.32],brass:[0.8,0.62,0.26],blue:[0.16,0.36,0.72],black:[0.05,0.05,0.06],coral:[0.95,0.5,0.42],pink:[1,0.55,0.68],teal:[0.06,0.38,0.4],
 wood:[0.62,0.46,0.26],dwood:[0.36,0.22,0.12],green:[0.16,0.42,0.2],cloth:[0.97,0.95,0.92],rubber:[0.08,0.08,0.09],alum:[0.8,0.82,0.85],glass:[0.5,0.75,0.9]};

/* the stage def a map belongs to (by its name: stage maps carry their own) */
function a4StageDef(g){if(typeof MISSIONS==='undefined')return null;for(const id of ['c11','c13']){const m=MISSIONS[id];if(m&&m.stageDefs)for(const s of Object.values(m.stageDefs))if(s.def&&s.def.name===g.def.name)return s;}return null;}

/* ---------------- the ramps ---------------- */
/* lanes on this map: {x0 (left cell), z0 (cell by the wall), k:'down' (the way down, sunken) | 'up' (closed lane coming up) | 'arrive'} */
function a4Ramps(g){if(g._a4r)return g._a4r;const out=[];g._a4r=out;if(!a4Gar(a4Of(g)))return out;const sd=a4StageDef(g);if(!sd)return out;const W=g.W;
 for(const s of sd.stairs||[])if(s.id==='ramp'){const x0=Math.round(s.at[0])-1,z0=Math.floor(s.at[1]),right=x0>W/2;out.push({x0,z0,k:'down',to:s.to,right});out.push({x0:right?x0-3:x0+3,z0,k:'up',right});}
 const ar=sd.arrivals&&sd.arrivals.ramp;if(ar){const x0=Math.round(ar.at[0])-1,right=x0>W/2;out.push({x0,z0:Math.floor(ar.at[1])-A4R.N+1,k:'arrive',right});}
 return out;}
/* height on a lane: 1 by the wall, level ground from the bottom cell's centre */
function a4RampY(g,x,z){for(const r of a4Ramps(g)){const t=(z-r.z0)/A4R.N;if(t<0||t>1)continue;const c=Math.floor(x);if(c!==r.x0&&c!==r.x0+1)continue;
  const f=Math.max(0,1-t/((A4R.N-0.5)/A4R.N));return r.k==='down'?-A4R.RISE*f:A4R.RISE*f;}return 0;}
/* how the climb out looks: down a garage ramp, flat through the hangar side door, up the jet's airstairs (the default) */
function a4ClimbMode(g,s){if(!g||!s)return null;if(s.id==='ramp'&&typeof isGarage==='function'&&isGarage(g))return 'down';if(s.id==='door')return 'flat';return null;}
/* the walk in on the next floor: off the bottom of the arrival lane, or in through the hangar's side door */
function a4ClimbArrive(g,s,ar){const p=g.player;if(!ar||!p)return;let sx,sz,y0;
 if(s.id==='ramp'){const r=a4Ramps(g).find(q=>q.k==='arrive');if(!r)return;sx=r.x0+1;sz=r.z0+0.2;y0=A4R.RISE*1.05;}
 else if(s.id==='door'){sx=ar.at[0];sz=Math.floor(ar.at[1])+0.05;y0=0;}else return;
 g.climbIn={t0:performance.now(),dur:0.9,x0:sx,z0:sz,y0,x1:p.x,z1:p.z,a:Math.atan2(p.x-sx,p.z-sz)};
 p.x=sx;p.z=sz;p.y=y0;p.a=g.climbIn.a;g.cam.x=p.x;g.cam.z=p.z-1;g.cam.lift=s.id==='door'?0.3:1;}
function a4RampTick(g){const p=g.player;if(!p||g.climb||g.climbIn||g.seatP)return;if(a4Ramps(g).length)p.y=a4RampY(g,p.x,p.z);}

/* a tiny stencil font, three by five */
const A4F={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',
 I:'111010010010111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'101111111111101',O:'010101101101010',P:'110101110100100',R:'110101110101101',
 S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',
 '1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001','7':'111001010010010','.':'000000000000010',"'":'010010000000000',' ':'000000000000000'};
/* text centred at (x,·,z): on a wall face (plane 'w', facing +z, y is the top line) or on the floor (plane 'f', readable from the south) */
function a4Text(B,str,x,y,z,px,col,em,plane){const n=str.length,w=n*4-1;for(let i=0;i<n;i++){const gl=A4F[str[i]]||A4F[' '];
  for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(gl[r*3+c]==='1'){const u=x+((i*4+c)-(w-1)/2)*px;
   if(plane==='f')B.box(TRS(u,y,z+(r-2)*px,0,px*0.92,0.004,px*0.92),col,!!em);else B.box(TRS(u,y-r*px,z,0,px*0.92,px*0.92,0.012),col,!!em);}}}

/* ---------------- set-up (dressStreet): floors, walls, prop spots ---------------- */
function act4Dress(g){const k=a4Of(g);if(!k||!g.rows)return;const W=g.W,H=g.H,zT=g.front?g.front.zT-1:H-1,rows=g.rows,A4=g.a4={k,props:[],runs:[]};g._a4r=null;
 const mapAt=(x,z)=>rows[z]&&rows[z][x]||' ',wallT=g.def.wall,FX=g.floorX=new Uint8Array(W*H);
 for(let z=1;z<zT;z++)for(let x=1;x<W-1;x++){const i=z*W+x,mx=x-1,mz=z-1;
  if(g.solid[i]){if(!g.wallX||!g.topX||g.wallX[i]||g.wallT[i]!==wallT||g.glass&&g.glass[i])continue;g.wallX[i]=a4Gar(k)?224:k==='rest'?226:218;continue;}
  const f0=g.floorT[i];let f=f0;
  if(a4Gar(k)){f=223;if(k==='p1'&&mx<=7)f=43;if(k==='dock'){if(mx<=6&&mz>=3)f=43;else if(mx>=8&&mx<=34&&mz<=2)f=229;}}
  else if(k==='rest'){if(f0===44||f0===4||mx<=9&&mz<=5)f=f0===4?4:44;else if(mx>=32&&mz<=4)f=19;else if(mx<=9&&mz>=7)f=43;else f=225;}
  else if(k==='apron'){f=mx<=9&&mz<=5?41:228;}
  else if(k==='hangar'){f=mx<=7&&mz<=5?14:227;}
  FX[i]=f;}
 /* keep clear: ramps, stairs, arrivals, doors, objectives, the spawn, the car, the street gaps and (at the dock) the vans' paths */
 const sd=a4StageDef(g),clear=[];
 if(sd){for(const s of sd.stairs||[])clear.push([s.at[0],s.at[1],2.4]);for(const q of Object.values(sd.arrivals||{}))clear.push([q.at[0],q.at[1],2.4]);}
 for(const r of a4Ramps(g))for(let dz=0;dz<A4R.N+1;dz++)for(let dx=-1;dx<3;dx++)clear.push([r.x0+dx+0.5,r.z0+dz+0.5,0.9]);
 if(g.player)clear.push([g.player.x,g.player.z,1.6]);if(g.car)clear.push([g.car.x,g.car.z,1.8]);
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){const c=mapAt(x,z);if('DNnePCqoytmj'.includes(c))clear.push([x+0.5,z+0.5,c==='D'?1.6:c==='j'?1.6:1.3]);
  if(c==='q')for(let zz=z;zz<H-1;zz++)clear.push([x+0.5,zz+0.5,1.2]);if(c==='y')for(let xx=1;xx<W-1;xx++)clear.push([xx+0.5,z+0.5,1.1]);}
 if(g.front)for(let x=1;x<W-1;x++)if(!g.solid[zT*W+x])clear.push([x+0.5,zT-0.5,1.8]);
 const ok=(x,z)=>{if(x<1||z<1||x>=W-1||z>=zT)return false;const i=z*W+x;if(g.solid[i]||g.furn[i]||g.glass&&g.glass[i])return false;const cx=x+0.5,cz=z+0.5;
  for(const [qx,qz,r] of clear)if(Math.abs(qx-cx)<r&&Math.abs(qz-cz)<r)return false;return true;};
 const sol=(x,z)=>x<0||z<0||x>=W||z>=H||g.solid[z*W+x]&&!(g.glass&&g.glass[z*W+x]);
 const taken=[],far=(x,z,d)=>taken.every(([a,b])=>Math.max(Math.abs(a-x),Math.abs(b-z))>=d);
 const pools=a4Pools(k);let lights=0;
 for(let pass=0;pass<2;pass++)for(let z=1;z<zT;z++)for(let x=1;x<W-1;x++){if(!ok(x,z))continue;
  const n=sol(x,z-1),s=sol(x,z+1),w=sol(x-1,z),e=sol(x+1,z);if(n&&s||w&&e)continue;
  const cor=(n||s)&&(w||e);if(pass===0&&!cor)continue;if(pass===1&&cor)continue;if(!n&&!s&&!w&&!e)continue;
  const h=hsh(x,z,72);if(pass===1&&h>0.45)continue;if(!far(x,z,pass?2:3))continue;
  const a=n?0:w?Math.PI/2:e?-Math.PI/2:Math.PI,room=a4Room(k,a4FT(g,z*W+x)),P=pools[room]||pools.main,list=pass===0?P.corner:P.wall;
  const t=list[Math.floor(hsh(x,z,pass?74:73)*list.length)];
  const sx=pass===0?(w?-0.12:e?0.12:0):0,sz=pass===0?(n?-0.12:s?0.12:0):0;
  A4.props.push({t,x:x+0.5+sx,z:z+0.5+sz,a,s:hsh(x,z,75)});taken.push([x,z]);}
 /* wall runs: pipes, tubes, sconces along the north walls (the faces the camera sees) */
 for(let z=2;z<zT;z++)for(let x=1;x<W-1;x++){const i=z*W+x;if(g.solid[i]||!g.solid[i-W]||g.glass&&g.glass[i-W])continue;if((g.wh[i-W]||WALL_H)<WALL_H*0.9)continue;
  if(a4Ramps(g).some(r=>x>=r.x0-1&&x<=r.x0+2&&z>=r.z0&&z<=r.z0+A4R.N))continue;A4.runs.push({x,z,lit:false});}
 for(const r of A4.runs){const m=(r.x+r.z*3)%5===0;if(!m)continue;r.lit=true;if(lights<4&&(k!=='rest'||a4FT(g,r.z*W+r.x)===225)){lights++;
  g.lights.push({x:r.x+0.5,y:1.3,z:r.z+0.4,r:a4Gar(k)?5:4,c:a4Gar(k)?[0.82,0.95,1]:k==='rest'?[1,0.72,0.5]:[0.9,0.95,1]});}}
 /* the jet's parking box in the hangar */
 if(k==='hangar'){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(mapAt(x,z)==='j'){x0=Math.min(x0,x);x1=Math.max(x1,x+1);z0=Math.min(z0,z);z1=Math.max(z1,z+1);}
  if(x0<1e9)A4.jetBox={x0:x0-1.5,x1:Math.min(W-1.6,x1+3.6),z0:Math.max(1.3,z0-1.2),z1:z1+1.6};}
 /* the apron is tarmac, not a street: no lane dashes or street lamps out there */
 if(k==='apron'){const st=new Set(['dash','lamp','hydrant','meter','news','phone','mailbox','bin','puddle']);g.deco=g.deco.filter(d=>!(d.z<zT-1&&st.has(d.t)));
  g.lights=g.lights.filter(l=>!(l.z<zT-1&&l.y===2.1&&l.r===5));}}

const a4Pools=k=>a4Gar(k)?{main:{wall:k==='dock'?['cart','pallet','bollards','ext','panel','drums','pallet','cage']:['ext','hose','panel','bins','tires','drums','cones','moto','cage','ext',...(k==='p1'?['pay','pay']:[])],
   corner:k==='dock'?['pallet','cage','drums']:['tires','drums','cage','kitty']},lobby:{wall:['palm','plant','bench','ext'],corner:['palm','plant']}}
 :k==='rest'?{main:{wall:['palm','flowers','flamingo','podium','champ','flowers','flamingo','palm'],corner:['aquarium','piano','palm','aquarium']},
   kitchen:{wall:['stove','pans','sacks','dish','mop','pans','stove'],corner:['cooler','sacks']},lounge:{wall:['barrels','champ','palm','flowers'],corner:['barrels','palm']},
   dock:{wall:['rope','fishbox','ring','ice','rope'],corner:['fishbox','rope']},priv:{wall:['flowers','champ','palm'],corner:['palm','flowers']}}
 :k==='apron'?{main:{wall:['chocks','gpu','bagcart','cones','drums','chocks','stand','fire'],corner:['windsock','gpu','bagcart']},office:{wall:['charts','filer','plant','coffee'],corner:['plant','filer']}}
 :{main:{wall:['chest','wbench','tires2','hose','drums','stand','oxy','chest','wbench'],corner:['engine','stand','tires2','engine']},office:{wall:['charts','filer','plant','coffee'],corner:['plant','filer']}};
function a4Room(k,f){if(a4Gar(k))return f===43?'lobby':'main';if(k==='rest')return f===44?'kitchen':f===4?'dock':f===43?'lounge':f===19?'priv':'main';
 if(k==='apron')return f===41?'office':'main';if(k==='hangar')return f===14?'office':'main';return 'main';}

/* ---------------- the props ---------------- */
function a4Prop(B,g,p){const K=a3Kit(B,p.x,p.z,p.a),C=A4C,s=p.s;
 switch(p.t){
 /* garage */
 case 'ext':{K.b(0,0.75,-0.42,0.34,0.5,0.14,C.red);K.b(0,0.75,-0.345,0.26,0.4,0.01,[0.7,0.85,0.9]);K.cyl(0,0.56,-0.41,0.06,0.34,[0.9,0.08,0.08]);K.b(0,1.08,-0.43,0.3,0.08,0.02,C.wh,true);
  K.b(0.3,0.02,-0.2,0.4,0.01,0.4,C.red);break;}
 case 'hose':{K.b(0,0.8,-0.45,0.5,0.5,0.08,C.red);K.cylX(0,0.8,-0.36,0.2,0.12,[0.85,0.1,0.1]);K.t(0,0.8,-0.36,0,0,Math.PI/2,0.13,0.36,0.36,[0.9,0.9,0.85]);K.b(0.22,0.4,-0.45,0.05,0.8,0.05,C.red);break;}
 case 'panel':{K.b(-0.1,0.72,-0.44,0.5,0.7,0.1,[0.62,0.64,0.66]);K.b(-0.1,0.72,-0.385,0.44,0.62,0.01,[0.55,0.57,0.6]);K.b(0.06,0.75,-0.38,0.04,0.12,0.02,C.dk);
  K.b(-0.1,1.02,-0.38,0.18,0.06,0.01,C.yel);K.b(0.28,0.72,-0.46,0.06,1.4,0.06,[0.5,0.52,0.55]);K.b(-0.1,1.25,-0.46,0.06,0.5,0.06,[0.5,0.52,0.55]);break;}
 case 'bins':{for(const ox of [-0.22,0.22]){K.cyl(ox,0,-0.28,0.17,0.62,ox<0?[0.16,0.3,0.6]:[0.25,0.25,0.27]);K.cyl(ox,0.62,-0.28,0.18,0.04,ox<0?[0.12,0.24,0.5]:[0.18,0.18,0.2]);}break;}
 case 'tires':case 'tires2':{const big=p.t==='tires2',r=big?0.3:0.24,h=big?0.2:0.16;for(let i=0;i<(big?3:4);i++){K.cyl(0.02*(i%2),i*h,-0.2,r,h-0.01,C.rubber);K.cyl(0.02*(i%2),i*h+h-0.012,-0.2,r*0.55,0.004,[0.3,0.3,0.32]);}
  if(!big){K.t(0.32,0.25,-0.32,0.3,0,Math.PI/2,0.16,0.5,0.5,C.rubber);}break;}
 case 'moto':{K.b(0,0.42,-0.2,1.0,0.5,0.4,[0.2,0.24,0.32]);K.t(0,0.62,-0.2,0,0,0,0.9,0.12,0.38,[0.24,0.28,0.38]);for(const ox of [-0.42,0.42])K.t(ox,0.18,-0.2,0,0,Math.PI/2,0.1,0.36,0.36,C.rubber);
  K.b(0.36,0.72,-0.2,0.04,0.2,0.5,[0.3,0.32,0.36]);break;}
 case 'cage':{const st=[0.5,0.52,0.56];for(const ox of [-0.45,0.45])for(const oz of [-0.45,0.05])K.b(ox,0.6,oz,0.04,1.2,0.04,st);for(const y of [0.05,1.18]){K.b(0,y,-0.45,0.94,0.03,0.03,st);K.b(0,y,0.05,0.94,0.03,0.03,st);K.b(-0.45,y,-0.2,0.03,0.03,0.5,st);K.b(0.45,y,-0.2,0.03,0.03,0.5,st);}
  for(let i=0;i<9;i++)K.b(-0.4+i*0.1,0.6,0.05,0.01,1.14,0.01,st);for(let i=0;i<5;i++)K.b(-0.45,0.6,-0.4+i*0.1,0.01,1.14,0.01,st);
  K.b(-0.2,0.2,-0.25,0.4,0.36,0.34,[0.7,0.55,0.36]);K.b(0.18,0.15,-0.28,0.34,0.26,0.3,[0.66,0.52,0.32]);K.b(-0.15,0.55,-0.3,0.3,0.3,0.26,[0.72,0.58,0.38]);break;}
 case 'kitty':{K.cyl(-0.2,0,-0.25,0.15,0.5,[0.14,0.3,0.6]);K.b(0.2,0.2,-0.28,0.3,0.4,0.22,[0.9,0.85,0.7]);K.b(0.2,0.3,-0.17,0.2,0.1,0.01,C.red);K.b(0.05,0.004,0.1,0.6,0.006,0.4,[0.75,0.7,0.6]);break;}
 case 'pay':{K.b(0,0.65,-0.3,0.46,1.3,0.34,[0.18,0.36,0.62]);K.b(0,0.95,-0.125,0.32,0.22,0.01,[0.3,0.9,0.5],true);K.b(0,0.7,-0.125,0.2,0.12,0.01,C.dk);K.b(0,1.32,-0.3,0.5,0.06,0.38,[0.12,0.24,0.44]);
  K.b(0,1.45,-0.3,0.44,0.18,0.04,C.wh,true);break;}
 case 'cart':{K.b(0,0.42,-0.2,0.8,0.5,0.5,[0.55,0.57,0.6]);for(let i=0;i<4;i++)K.b(-0.24+i*0.16,0.72,-0.2,0.13,0.1,0.42,[0.3,0.55,0.32]);K.b(0,0.8,-0.2,0.6,0.04,0.42,[0.9,0.85,0.7]);
  for(const ox of [-0.32,0.32])for(const oz of [-0.4,0.0])K.cyl(ox,0,oz,0.06,0.15,C.rubber);K.b(0.44,0.75,-0.2,0.04,0.5,0.46,[0.4,0.42,0.45]);break;}
 case 'pallet':{K.b(0,0.06,-0.15,0.9,0.12,0.7,C.wood);for(let l=0;l<3;l++)for(let i=0;i<(3-l)*2;i++){const ox=((i%(3-l))-(2-l)/2)*0.28,oz=-0.15+(Math.floor(i/(3-l))-0.5)*0.24;K.b(ox,0.17+l*0.1,oz,0.26,0.09,0.2,C.gold,l===2);}
  K.b(0,0.32,-0.15,0.94,0.42,0.74,[0.85,0.9,0.95]);break;}
 case 'bollards':{for(const ox of [-0.3,0.3]){K.cyl(ox,0,-0.15,0.1,0.9,C.yel);for(const y of [0.55,0.75])K.cyl(ox,y,-0.15,0.105,0.06,C.dk);}K.b(0,0.005,-0.15,0.9,0.008,0.4,C.yel);break;}
 case 'plant':{K.cyl(0,0,-0.2,0.18,0.42,C.brass);for(let i=0;i<8;i++){const a=i*0.8+s*3,l=0.3+0.1*(i%3);K.t(Math.sin(a)*l*0.4,0.7,-0.2+Math.cos(a)*l*0.4,a,0.6,0,0.12,l,0.02,C.green);}break;}
 case 'bench':{K.b(0,0.42,-0.25,1.0,0.06,0.4,[0.1,0.1,0.12]);K.b(0,0.7,-0.43,1.0,0.5,0.06,[0.1,0.1,0.12]);for(const ox of [-0.42,0.42])K.b(ox,0.2,-0.25,0.06,0.4,0.36,C.brass);break;}
 /* Coral Room */
 case 'palm':case 'flowers':case 'champ':case 'piano':case 'drums':case 'cones':a3Prop(B,g,p);break;
 case 'flamingo':{K.b(0,0.05,-0.2,0.34,0.1,0.34,C.gold);for(const ox of [-0.04,0.04])K.b(ox,0.4,-0.2,0.025,0.62,0.025,C.pink);K.t(0,0.82,-0.2,0,0.25,0,0.22,0.24,0.42,C.pink);
  K.t(0,1.05,-0.05,0,-0.35,0,0.05,0.4,0.05,C.pink);K.b(0,1.24,0.05,0.08,0.08,0.12,C.pink);K.b(0,1.22,0.13,0.03,0.04,0.08,C.black);break;}
 case 'podium':{K.b(0,0.55,-0.2,0.5,1.1,0.4,C.dwood);K.b(0,1.12,-0.2,0.56,0.04,0.46,C.brass);K.t(0,1.16,-0.2,0,-0.3,0,0.36,0.01,0.26,C.cloth);K.b(0,0.55,0.005,0.44,0.9,0.01,C.teal);
  K.b(0.12,1.16,-0.32,0.06,0.06,0.06,[1,0.85,0.5],true);break;}
 case 'aquarium':{K.b(0,0.3,-0.15,0.9,0.6,0.5,C.dwood);K.b(0,0.9,-0.15,0.88,0.6,0.48,[0.2,0.55,0.85],true);K.b(0,1.22,-0.15,0.92,0.05,0.52,C.dwood);
  for(let i=0;i<6;i++)K.b(-0.3+i*0.12,0.7+((i*37)%5)*0.07,-0.15+((i*13)%3-1)*0.1,0.08,0.04,0.02,[[1,0.5,0.1],[1,0.9,0.2],[0.9,0.2,0.5]][i%3],true);
  for(let i=0;i<4;i++)K.t(-0.3+i*0.2,0.72,-0.25,0,0,0.2*(i%2?1:-1),0.03,0.24,0.03,C.green);break;}
 case 'stove':{K.b(0,0.45,-0.2,0.96,0.9,0.56,C.steel);K.b(0,0.91,-0.2,0.96,0.02,0.56,[0.2,0.2,0.22]);for(const ox of [-0.24,0.24])K.cyl(ox,0.92,-0.2,0.12,0.01,[0.9,0.3,0.1],true);
  K.cyl(-0.24,0.93,-0.2,0.14,0.22,[0.75,0.76,0.8]);K.cyl(0.24,0.93,-0.22,0.1,0.08,[0.3,0.3,0.32]);K.b(0.24,0.97,0.02,0.04,0.02,0.25,C.dk);K.b(0,1.3,-0.44,0.98,0.5,0.1,C.steel);break;}
 case 'pans':{K.b(0,1.3,-0.4,0.9,0.04,0.04,C.steel);for(let i=0;i<5;i++){const ox=-0.36+i*0.18;K.b(ox,1.18,-0.4,0.02,0.2,0.02,C.dk);K.t(ox,0.98,-0.42,0,Math.PI/2,0,0.14+0.03*(i%2),0.14+0.03*(i%2),0.03,i%2?[0.75,0.45,0.25]:[0.6,0.62,0.66]);}
  K.b(0,0.45,-0.2,0.9,0.9,0.5,C.steel);K.b(0,0.91,-0.2,0.92,0.02,0.52,[0.82,0.84,0.88]);K.b(-0.2,0.96,-0.2,0.3,0.06,0.2,[0.85,0.6,0.35]);break;}
 case 'sacks':{for(let i=0;i<3;i++){const ox=-0.3+i*0.3;K.b(ox,0.15,-0.25,0.28,0.3,0.36,C.wood);K.b(ox,0.31,-0.25,0.24,0.04,0.32,[[0.9,0.2,0.1],[0.95,0.7,0.1],[0.3,0.6,0.2]][i]);}K.b(0,0.5,-0.3,0.5,0.3,0.3,[0.86,0.8,0.62]);break;}
 case 'dish':{K.b(0,0.45,-0.2,0.9,0.9,0.5,C.steel);for(let i=0;i<8;i++)K.b(-0.32+i*0.09,1.02,-0.2,0.015,0.18,0.18,C.wh);K.b(0,1.2,-0.4,0.9,0.04,0.1,C.steel);break;}
 case 'mop':{K.b(0,0.18,-0.2,0.34,0.3,0.26,C.yel);K.t(0.05,0.62,-0.25,0,0.12,0.1,0.025,0.9,0.025,C.wood);K.b(0.25,0.004,0.1,0.5,0.004,0.3,[0.75,0.82,0.85]);break;}
 case 'cooler':{K.b(0,0.65,-0.15,0.9,1.3,0.7,C.steel);K.b(0,0.62,0.205,0.6,1.1,0.01,[0.74,0.76,0.8]);K.b(0.24,0.65,0.22,0.06,0.3,0.03,C.dk);K.b(0,1.12,0.215,0.3,0.08,0.01,[0.3,0.7,1],true);break;}
 case 'barrels':{for(const ox of [-0.25,0.25])K.cylX(ox*0+0,0.26+(ox>0?0.48:0),-0.2,0.24,0.8,C.wood);K.cylX(0,0.26,-0.2,0.245,0.04,C.dk);for(let i=0;i<5;i++)K.cyl(-0.3+i*0.15,0.0,0.2,0.04,0.3,[0.2,0.08,0.1]);break;}
 case 'rope':{for(let i=0;i<4;i++)K.cyl(0,i*0.05,-0.2,0.28-i*0.04,0.05,[0.8,0.72,0.5]);K.cyl(0.3,0,-0.3,0.08,0.45,[0.3,0.3,0.32]);break;}
 case 'fishbox':{for(let l=0;l<2;l++)for(let i=0;i<2;i++){K.b((i-0.5)*0.46,0.12+l*0.24,-0.2,0.44,0.22,0.5,[0.2,0.5,0.78]);K.b((i-0.5)*0.46,0.24+l*0.24,-0.2,0.38,0.01,0.44,[0.85,0.92,0.98]);}break;}
 case 'ring':{K.t(0,0.8,-0.44,0,Math.PI/2,0,0.5,0.5,0.06,C.org);K.t(0,0.8,-0.43,0,Math.PI/2,0,0.3,0.3,0.07,C.teal);K.b(0,0.3,-0.2,0.6,0.5,0.4,[0.9,0.9,0.92]);K.b(0,0.56,-0.2,0.62,0.04,0.42,[0.2,0.5,0.78]);break;}
 case 'ice':{K.b(0,0.25,-0.2,0.8,0.5,0.5,[0.92,0.94,0.98]);K.b(0,0.51,-0.2,0.82,0.04,0.52,[0.2,0.5,0.78]);break;}
 /* Opa-locka */
 case 'chocks':{for(const ox of [-0.25,0.25])K.b(ox,0.08,-0.25,0.3,0.16,0.18,C.yel);K.b(0,0.04,-0.25,0.3,0.03,0.03,C.dk);K.t(0.1,0.03,0.15,0.4,0,0,0.9,0.04,0.06,[0.75,0.76,0.8]);break;}
 case 'gpu':{K.b(0,0.42,-0.2,0.9,0.64,0.6,C.yel);K.b(0,0.76,-0.2,0.9,0.04,0.6,C.dk);K.b(-0.2,0.5,0.105,0.3,0.24,0.01,C.dk);K.b(-0.26,0.56,0.11,0.06,0.06,0.01,[0.3,1,0.4],true);
  for(const ox of [-0.36,0.36])K.t(ox,0.1,0.1,Math.PI/2,0,0,0.05,0.2,0.2,C.rubber);K.t(0.3,0.02,0.4,0.5,0,0,0.6,0.03,0.04,C.black);break;}
 case 'bagcart':{K.b(0,0.32,-0.15,1.0,0.05,0.6,[0.3,0.32,0.36]);for(const ox of [-0.48,0.48])K.b(ox,0.6,-0.15,0.03,0.6,0.6,[0.3,0.32,0.36]);
  const bc=[[0.6,0.12,0.12],[0.1,0.2,0.45],[0.2,0.2,0.22],[0.5,0.35,0.2]];for(let i=0;i<4;i++)K.b(-0.3+i*0.2,0.48+(i%2)*0.06,-0.15,0.18,0.28+(i%2)*0.1,0.42,bc[i]);
  for(const ox of [-0.36,0.36])for(const oz of [-0.4,0.1])K.cyl(ox,0,oz,0.08,0.16,C.rubber);break;}
 case 'stand':{K.b(0,0.02,-0.2,0.8,0.04,0.6,C.yel);for(let i=0;i<4;i++)K.b(0,0.18+i*0.18,-0.2+i*0.0,0.6,0.03,0.6-i*0.12,C.yel);for(const ox of [-0.32,0.32])K.b(ox,0.55,-0.4,0.04,1.1,0.04,C.yel);
  K.b(0,1.08,-0.4,0.68,0.04,0.04,C.yel);break;}
 case 'fire':{K.b(0,0.25,-0.2,0.36,0.04,0.5,C.dk);K.cyl(0,0.25,-0.25,0.16,0.7,C.red);K.cyl(0,0.95,-0.25,0.07,0.1,C.dk);for(const oz of [-0.4,0])K.t(0,0.15,oz,Math.PI/2,0,0,0.05,0.24,0.24,C.rubber);break;}
 case 'windsock':{K.cyl(0,0,-0.2,0.04,1.8,[0.9,0.9,0.92]);K.b(0,0.01,-0.2,0.4,0.02,0.4,[0.3,0.3,0.32]);for(let i=0;i<5;i++)K.b(0.2+i*0.16,1.72-i*0.04,-0.2,0.16,0.18-i*0.02,0.18-i*0.02,i%2?C.wh:C.org);break;}
 case 'charts':{K.b(0,0.85,-0.46,0.9,0.6,0.02,[0.92,0.9,0.8]);K.b(-0.1,0.88,-0.445,0.5,0.4,0.005,[0.5,0.7,0.85]);K.t(-0.1,0.88,-0.44,0,0,0.6,0.5,0.01,0.005,C.red);K.b(0.3,0.75,-0.445,0.15,0.25,0.005,[0.95,0.95,0.6]);
  K.b(0,0.38,-0.3,0.8,0.76,0.36,[0.5,0.52,0.56]);break;}
 case 'filer':{K.b(0,0.65,-0.25,0.46,1.3,0.46,[0.55,0.57,0.6]);for(let i=0;i<4;i++){K.b(0,0.18+i*0.3,-0.015,0.4,0.26,0.01,[0.6,0.62,0.66]);K.b(0,0.26+i*0.3,-0.005,0.12,0.03,0.02,C.dk);}break;}
 case 'coffee':{K.b(0,0.42,-0.25,0.7,0.84,0.4,[0.85,0.85,0.82]);K.b(-0.1,0.95,-0.3,0.26,0.22,0.24,C.dk);K.cyl(-0.1,0.86,-0.22,0.06,0.1,[0.3,0.18,0.1]);K.b(0.2,0.86,-0.25,0.06,0.04,0.06,C.wh);break;}
 case 'chest':{K.b(0,0.5,-0.22,0.86,1.0,0.5,[0.78,0.1,0.1]);for(let i=0;i<7;i++){K.b(0,0.1+i*0.12,0.035,0.8,0.1,0.01,[0.7,0.08,0.08]);K.b(0,0.14+i*0.12,0.045,0.6,0.012,0.012,C.steel);}
  K.b(0,1.02,-0.22,0.9,0.04,0.54,C.dk);K.b(-0.2,1.08,-0.25,0.3,0.06,0.04,C.steel);K.b(0.2,1.06,-0.15,0.2,0.04,0.12,C.yel);for(const ox of [-0.36,0.36])K.cyl(ox,0,0,0.04,0.06,C.dk);break;}
 case 'wbench':{K.b(0,0.86,-0.15,1.0,0.06,0.6,[0.62,0.46,0.26]);for(const ox of [-0.45,0.45])K.b(ox,0.42,-0.15,0.06,0.84,0.56,[0.3,0.32,0.36]);K.b(0,0.15,-0.15,0.9,0.03,0.5,[0.3,0.32,0.36]);
  K.b(0.3,0.95,0.05,0.18,0.12,0.14,[0.2,0.3,0.6]);K.b(-0.2,0.91,-0.1,0.3,0.03,0.08,C.steel);K.b(0,1.2,-0.44,1.0,0.6,0.02,[0.6,0.5,0.35]);for(let i=0;i<6;i++)K.b(-0.4+i*0.16,1.2,-0.42,0.03,0.2,0.03,C.dk);break;}
 case 'oxy':{for(let i=0;i<3;i++)K.cyl(-0.25+i*0.25,0.05,-0.25,0.09,0.9,[0.2,0.6,0.25]);for(let i=0;i<3;i++)K.cyl(-0.25+i*0.25,0.95,-0.25,0.04,0.08,C.steel);K.b(0,0.03,-0.25,0.8,0.06,0.3,[0.3,0.32,0.36]);K.b(0,0.5,-0.4,0.8,0.05,0.03,C.dk);break;}
 case 'engine':{K.b(0,0.12,-0.1,0.9,0.06,0.6,C.yel);for(const ox of [-0.35,0.35])K.b(ox,0.3,-0.1,0.06,0.36,0.5,C.yel);K.cylX(0,0.72,-0.1,0.34,0.95,[0.75,0.77,0.8]);
  K.cylX(-0.48,0.72,-0.1,0.3,0.04,C.dk);K.cylX(-0.49,0.72,-0.1,0.08,0.06,[0.85,0.86,0.9]);K.cylX(0.5,0.72,-0.1,0.22,0.08,[0.4,0.38,0.36]);K.b(0.1,1.05,-0.1,0.3,0.06,0.2,C.red);break;}
 }}

/* the garage's wall runs: sprinkler main and fire main, a fluorescent tube every few cells; Opa-locka: a cable tray and floodlights;
   the Coral Room: gilt sconces */
function a4Runs(B,g){const A4=g.a4,k=A4.k,C=A4C;
 for(const r of A4.runs){const z=r.z+0.03,x=r.x,bx=(px,py,pz,sx,sy,sz,c,em)=>B.box(TRS(px,py,pz,0,sx,sy,sz),c,!!em);
  if(a4Gar(k)){bx(x+0.5,1.06,z+0.04,1.0,0.05,0.05,[0.55,0.57,0.6]);bx(x+0.5,0.98,z+0.05,1.0,0.07,0.07,[0.75,0.12,0.12]);if(x%3===0)bx(x+0.5,1.0,z+0.08,0.04,0.1,0.06,C.dk);
   if(r.lit){bx(x+0.5,0.86,z+0.06,0.8,0.06,0.08,[0.4,0.42,0.45]);bx(x+0.5,0.83,z+0.09,0.72,0.03,0.04,[0.9,0.98,1],true);}}
  else if(k==='rest'){if(r.lit&&a4FT(g,r.z*g.W+x)!==44){bx(x+0.5,0.82,z+0.04,0.12,0.24,0.06,C.gold);bx(x+0.5,0.98,z+0.07,0.22,0.12,0.12,[1,0.82,0.6],true);bx(x+0.5,0.9,z+0.06,0.3,0.03,0.08,C.gold);}}
  else{bx(x+0.5,1.08,z+0.06,1.0,0.03,0.12,[0.42,0.44,0.48]);if(r.lit){bx(x+0.5,0.98,z+0.08,0.34,0.16,0.12,[0.3,0.32,0.36]);bx(x+0.5,0.97,z+0.145,0.28,0.12,0.01,[1,0.96,0.85],true);}}}}

/* painted floors: bays and arrows (garage), the dock's van bays and lane, the apron's taxi line, the jet's parking box */
function a4Paint(B,g){const A4=g.a4,k=A4.k,W=g.W,H=g.H,C=A4C,fl=(x,z,sx,sz,c,y,ry)=>B.box(TRS(x,y||0.005,z,ry||0,sx,0.004,sz),c);
 if(a4Gar(k)){
  for(let z=1;z<H-1;z++)for(let x=1;x<W-1;x++){if(g.furn[z*W+x]!==21)continue;
   for(const ex of [-0.4,2.4])fl(x+ex,z+0.5,0.06,1.0,C.wh);fl(x+1,z+0.03,2.86,0.06,C.wh);
   B.box(TRS(x+1,0.05,z+0.2,0,0.8,0.1,0.12),[0.62,0.6,0.56]);B.box(TRS(x+1,0.1,z+0.2,0,0.8,0.005,0.12),C.yel);}
  /* aisle arrows toward the way down */
  const down=a4Ramps(g).find(r=>r.k==='down');
  if(down)for(let z=2;z<H-2;z++)for(let x=2;x<W-2;x++){const i=z*W+x;if(g.solid[i]||g.furn[i]||(x*7+z*3)%11!==0||a4FT(g,i)!==223)continue;
   if([-1,0,1].some(d=>g.furn[(z+d)*W+x]===21||g.furn[(z+d)*W+x-1]===21))continue;if(a4Ramps(g).some(r=>x>=r.x0-1&&x<=r.x0+2&&z<=r.z0+A4R.N+1))continue;
   const dir=down.x0+1>x?1:-1;fl(x+0.5,z+0.5,0.5,0.08,C.wh);for(const s of [-1,1])fl(x+0.5+dir*0.24,z+0.5+s*0.08,0.26,0.07,C.wh,0.005,dir*s*0.7);}
  if(k==='dock'){for(const q of a4Cells(g,'q')){for(const ex of [-0.65,0.65])fl(q.x+ex,q.z+0.5,0.08,1.9,C.yel);fl(q.x,q.z+1.45,1.38,0.08,C.yel);
     a4Text(B,String(a4Cells(g,'q').indexOf(q)+1),q.x,0.007,q.z+0.7,0.1,C.yel,false,'f');}
   const y=a4Cells(g,'y')[0];if(y){for(let x=9;x<y.x-0.5;x+=1){fl(x,y.z-0.55,0.5,0.06,C.yel);fl(x,y.z+0.55,0.5,0.06,C.yel);}
    for(let i=0;i<10;i++)fl(y.x-5.5+i*0.32,y.z,0.08,1.0,i%2?C.yel:C.dk,0.006,0.5);}}}
 if(k==='apron'){/* the taxi line along the apron (it used to be drawn every frame in act4.js) */for(let x=12;x<W-2;x++)fl(x+0.5,4.5,0.7,0.12,C.yel);for(let x=12;x<W-2;x+=1)if(x%2===0)fl(x+0.5,4.28,0.3,0.05,C.yel);
  for(let x=12;x<W-2;x+=3){B.box(TRS(x+0.5,0.06,2.12,0,0.08,0.12,0.08),[0.3,0.6,1],true);}a4Text(B,'HOLD',W-5,0.007,8.6,0.09,C.yel,false,'f');}
 if(k==='hangar'&&A4.jetBox){const b=A4.jetBox,c=C.yel;fl((b.x0+b.x1)/2,b.z0,b.x1-b.x0,0.1,c);fl((b.x0+b.x1)/2,b.z1,b.x1-b.x0,0.1,c);fl(b.x0,(b.z0+b.z1)/2,0.1,b.z1-b.z0,c);fl(b.x1,(b.z0+b.z1)/2,0.1,b.z1-b.z0,c);
  for(let x=b.x0+0.6;x<b.x1-0.4;x+=0.8)fl(x,b.z0-0.25,0.35,0.08,[0.9,0.2,0.15],0.006,0.6);a4Text(B,'7',b.x1+2.4,0.007,b.z1-1.6,0.32,[0.95,0.95,0.92],false,'f');}}

/* the ramps: the lane down sinks into the dark toward the wall; the lanes up (closed, or the one you came down) rise to the wall */
function a4DrawRamps(B,g){const C=A4C,N=A4R.N,R=A4R.RISE,bx=(px,py,pz,sx,sy,sz,c,em,ry)=>B.box(TRS(px,py,pz,ry||0,sx,sy,sz),c,!!em),label={p2:'P2',dock:'VAULT'};
 for(const r of a4Ramps(g)){const x=r.x0+1,z0=r.z0,zE=z0+N;
  if(r.k==='down'){bx(x,0.003,z0+N/2,2,0.006,N,[0.03,0.03,0.04]);const S=16;
   for(let i=0;i<S;i++){const t=(i+0.5)/S,kk=0.42*Math.pow(1-t,1.3)+0.03,zc=zE-(i+0.5)*N/S;bx(x,0.006,zc,1.96,0.004,N/S-0.01,[kk,kk*0.98,kk*0.96]);}
   for(const zc of [zE-0.6,zE-1.6])for(const s of [-1,1])bx(x+s*0.2,0.009,zc,0.5,0.004,0.1,C.yel,false,-s*0.7);
   for(let i=0;i<8;i++)bx(r.x0+0.12+i*0.25,0.008,zE-0.06,0.22,0.004,0.1,i%2?C.dk:C.yel);
   /* the clearance bar over the mouth, the sign on the end wall */
   for(const px of [r.x0+0.08,r.x0+1.92])bx(px,0.9,zE+0.1,0.07,1.8,0.07,C.yel);for(let i=0;i<8;i++)bx(r.x0+0.12+i*0.25,1.78,zE+0.1,0.25,0.12,0.08,i%2?C.dk:C.yel);
   bx(x,1.0,z0+0.04,1.4,0.42,0.04,[0.1,0.2,0.5]);a4Text(B,label[r.to]||'DOWN',x,1.12,z0+0.07,0.045,[1,1,1],true);}
  else{/* a raised lane: steps under a sloped plate, kerb, then a closed one gets a barrier and a no-entry sign */
   const S=10,L=N-0.5;for(let i=0;i<S;i++){const t=(i+0.5)/S,h=R*(1-(i+1)/S)+0.002,zc=z0+t*L;bx(x,h/2,zc,1.98,h,L/S,[0.5,0.49,0.47]);}
   const th=Math.atan2(R,L);B.box(A.mul(A.mul(A.T(x,R/2+0.01,z0+L/2),A.RX(th)),A.S(2,0.03,Math.hypot(L,R))),[0.58,0.57,0.55],false);
   for(let i=1;i<12;i++){const t=i/12;bx(x,R*(1-t)+0.03,z0+t*L,1.9,0.006,0.035,[0.36,0.35,0.34]);}for(const ex of [r.x0+0.12,r.x0+1.88])B.box(A.mul(A.mul(A.T(ex,R/2+0.03,z0+L/2),A.RX(th)),A.S(0.06,0.006,Math.hypot(L,R))),C.yel,false);
   const kx=r.right?r.x0+0.05:r.x0+1.95,kxo=r.right?r.x0+1.95:r.x0+0.05;
   B.box(A.mul(A.mul(A.T(kx,R/2+0.08,z0+L/2),A.RX(th)),A.S(0.1,0.14,Math.hypot(L,R))),[0.68,0.66,0.62],false);
   for(let i=0;i<5;i++){const t=(i+0.5)/5;bx(kx,R*(1-t)*0.5+0.02,z0+t*L,0.09,R*(1-t)+0.04,L/5,[0.62,0.6,0.56]);}
   if(r.k==='up'){for(let i=0;i<8;i++)bx(r.x0+0.12+i*0.25,0.75,zE-0.1,0.25,0.08,0.05,i%2?C.wh:C.red);bx(kxo,0.4,zE-0.1,0.08,0.8,0.08,C.dk);bx(kxo,0.82,zE-0.1,0.16,0.1,0.16,C.yel);
    bx(x,1.0,z0+0.04,0.42,0.42,0.04,C.red);bx(x,1.0,z0+0.07,0.3,0.07,0.02,C.wh,true);}
   else{for(const zc of [z0+1.6,z0+2.6]){bx(x,(zc<z0+L?R*(1-(zc-z0)/L):0)+0.014,zc,0.08,0.006,0.4,C.wh);for(const s of [-1,1])bx(x+s*0.1,(zc<z0+L?R*(1-(zc-z0)/L):0)+0.014,zc+0.16,0.24,0.006,0.07,C.wh,false,s*0.7);}
    bx(x,1.0,z0+0.04,1.4,0.42,0.04,[0.1,0.2,0.5]);a4Text(B,g.a4.k==='dock'?'VAULT':'P2',x,1.12,z0+0.07,0.045,[1,1,1],true);}}}}

/* big stencils and set pieces on the walls */
function a4SetPieces(B,g){const A4=g.a4,k=A4.k,C=A4C,W=g.W,bx=(px,py,pz,sx,sy,sz,c,em,ry)=>B.box(TRS(px,py,pz,ry||0,sx,sy,sz),c,!!em);
 const runs=A4.runs.filter(r=>!r.lit),pick=(n,from)=>{const o=[];const list=runs.filter(r=>from(r));for(let i=0;i<n&&list.length;i++){const j=Math.floor(list.length*(i+0.5)/n);o.push(list[j]);}return o;};
 if(a4Gar(k)){const name=k==='p1'?'P1':k==='p2'?'P2':'B';for(const r of pick(3,r=>a4FT(g,r.z*W+r.x)===223))a4Text(B,name,r.x+0.5,0.98,r.z+0.02,0.1,[0.95,0.8,0.15]);
  if(k==='p1'){const r=pick(1,r=>a4FT(g,r.z*W+r.x)===43)[0];if(r){bx(r.x+0.5,0.9,r.z+0.03,1.2,0.3,0.03,C.black);a4Text(B,'VALE TRUST',r.x+0.5,0.98,r.z+0.05,0.022,C.gold,true);}}
  if(k==='dock'){/* the vault door, on the wall above the middle van bay */const qs=a4Cells(g,'q');const q=qs[1]||qs[0];if(q){const zw=q.z-0.47;
    for(let i=0;i<4;i++)bx(q.x,0.6,zw+0.02,1.3-i*0.0,1.1,0.04,[0.45,0.46,0.5],false,i*Math.PI/4);
    for(let i=0;i<4;i++)bx(q.x,0.6,zw+0.06,1.0,0.86,0.04,[0.72,0.74,0.78],false,i*Math.PI/4);for(let i=0;i<3;i++)bx(q.x,0.6,zw+0.1,0.5,0.05,0.04,[0.4,0.4,0.44],false,i*Math.PI/3);
    bx(q.x,0.6,zw+0.11,0.14,0.14,0.04,C.gold);bx(q.x-1.6,0.95,zw+0.03,1.1,0.24,0.03,C.black);a4Text(B,'VAULT',q.x-1.6,1.02,zw+0.05,0.03,C.gold,true);}}}
 if(k==='hangar'){const r=pick(1,r=>r.x>12&&r.x<W-8)[0];if(r){bx(r.x+0.5,0.92,r.z+0.03,3.2,0.36,0.03,[0.08,0.1,0.2]);a4Text(B,'VALE TRUST',r.x+0.5,1.02,r.z+0.05,0.05,C.gold,true);}
  /* the side door you came in by */const sd=a4StageDef(g),ar=sd&&sd.arrivals&&sd.arrivals.side;if(ar){const x=ar.at[0],zw=Math.floor(ar.at[1])+0.03;
   bx(x,0.95,zw,0.95,1.9,0.04,[0.06,0.06,0.08]);bx(x+0.32,0.95,zw+0.25,0.06,1.84,0.5,[0.55,0.57,0.6],false,0.6);bx(x,1.95,zw+0.02,1.05,0.08,0.06,[0.4,0.42,0.45]);bx(x,2.08,zw+0.03,0.5,0.12,0.04,[0.3,1,0.5],true);}}
 if(k==='apron'){const sd=a4StageDef(g),s=sd&&(sd.stairs||[]).find(q=>q.id==='door');if(s){const x=s.at[0],zw=Math.floor(s.at[1])+0.03;bx(x,0.95,zw,1.05,1.95,0.03,[0.4,0.42,0.45]);
   bx(x-1.5,0.98,zw+0.01,1.2,0.3,0.03,[0.08,0.1,0.2]);a4Text(B,'HANGAR 7',x-1.5,1.05,zw+0.03,0.022,[1,1,1],true);}}
 if(k==='rest'){const r=pick(1,r=>a4FT(g,r.z*W+r.x)===225&&r.x>12)[0];if(r){bx(r.x+0.5,0.92,r.z+0.03,1.7,0.34,0.03,C.teal);a4Text(B,'CORAL ROOM',r.x+0.5,1.0,r.z+0.05,0.03,C.pink,true);}}}

/* clutter on bare floor (replaces the generic bottles and pizza boxes) */
function act4Clutter(B,g,x,z){const k=g.a4&&g.a4.k;if(!k||a4Of(g)!==k)return false;if(g.front&&z>=g.front.zT-1)return true;if(hsh(x,z,1)>0.18)return true;
 if(g.a4.props.some(p=>Math.abs(p.x-x-0.5)<0.9&&Math.abs(p.z-z-0.5)<0.9))return true;if(a4Ramps(g).some(r=>x>=r.x0-1&&x<=r.x0+2&&z>=r.z0&&z<=r.z0+A4R.N))return true;
 const u=x+0.2+hsh(x,z,3)*0.6,v=z+0.2+hsh(x,z,4)*0.6,r=hsh(x,z,5)*TAU,h=hsh(x,z,2),bx=(dx,y,dz,sx,sy,sz,c,ry,em)=>B.box(TRS(u+dx,y,v+dz,r+(ry||0),sx,sy,sz),c,!!em);
 if(k==='rest'){const f=a4FT(g,z*g.W+x);if(f===44){if(h<0.5){bx(0,0.004,0,0.2,0.006,0.14,[0.95,0.6,0.2]);}else bx(0,0.01,0,0.12,0.02,0.04,[0.75,0.76,0.8]);return true;}
  if(h<0.35){for(let i=0;i<5;i++)bx((hsh(x,z,90+i)-0.5)*0.4,0.004,(hsh(x,z,95+i)-0.5)*0.4,0.06,0.006,0.04,[0.95,0.4,0.45],i);}
  else if(h<0.6){bx(0,0.004,0,0.22,0.006,0.22,C_A4N);}else if(h<0.8){bx(0,0.02,0,0.04,0.04,0.04,[0.85,0.75,0.55]);}else bx(0,0.006,0,0.16,0.008,0.03,[0.8,0.82,0.86]);return true;}
 if(h<0.35){bx(0,0.004,0,0.4+h,0.005,0.26,[0.06,0.06,0.07]);bx(0.06,0.005,0.02,0.2,0.005,0.12,[0.2,0.14,0.3]);}
 else if(h<0.55){bx(0,0.004,0,0.8,0.004,0.1,[0.1,0.1,0.11]);bx(0,0.004,0.18,0.8,0.004,0.1,[0.1,0.1,0.11]);}
 else if(h<0.7){bx(0,0.004,0,0.12,0.005,0.08,[0.95,0.93,0.88]);}
 else if(h<0.85){bx(0,0.02,0,0.03,0.03,0.08,[0.9,0.9,0.85]);bx(0.1,0.02,0.05,0.03,0.03,0.07,[0.9,0.9,0.85],0.7);}
 else bx(0,0.01,0,0.2,0.02,0.14,[0.75,0.2,0.15]);return true;}
const C_A4N=[0.98,0.97,0.94];

/* furniture with an Act 4 look; same cell, same cover */
function act4Furn(B,g,x,z,f){const k=g.a4&&g.a4.k;if(!k||a4Of(g)!==k)return false;const cx=x+0.5,cz=z+0.5,C=A4C;
 const wd=()=>{for(const [ox,oz,a] of [[0,-1,0],[-1,0,Math.PI/2],[1,0,-Math.PI/2],[0,1,Math.PI]])if(isSolid(x+ox,z+oz))return a;return 0;};
 const K=a3Kit(B,cx,cz,0);
 if(k==='rest'){
  if(f===1){K.cyl(0,0,0,0.4,0.74,C.coral);K.cyl(0,0.74,0,0.43,0.02,C.cloth);K.cyl(0,0.08,0,0.42,0.1,[0.85,0.42,0.36]);
   for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;K.b(Math.sin(a)*0.28,0.765,Math.cos(a)*0.28,0.13,0.006,0.13,C.wh,false,a);K.b(Math.sin(a)*0.28,0.77,Math.cos(a)*0.28,0.06,0.006,0.06,C.coral,false,a);
    K.b(Math.sin(a)*0.6,0.42,Math.cos(a)*0.6,0.28,0.04,0.28,C.gold,false,a);K.b(Math.sin(a)*0.6,0.45,Math.cos(a)*0.6,0.24,0.03,0.24,C.teal,false,a);K.b(Math.sin(a)*0.73,0.64,Math.cos(a)*0.73,0.26,0.4,0.03,C.gold,false,a);}
   K.cyl(0,0.76,0,0.025,0.16,C.gold);K.b(0,0.95,0,0.03,0.05,0.03,[1,0.8,0.4],true);K.cyl(0.12,0.76,-0.1,0.03,0.18,[0.2,0.4,0.25]);
   if(!g._a4c)g._a4c=0;if(g._a4c++<3)g.lights.push({x:cx,y:1.1,z:cz,r:2.6,c:[1,0.6,0.45]});return true;}
  if(f===7){const a=wd(),KK=a3Kit(B,cx,cz,a);KK.b(0,0.45,0,1.0,0.9,0.9,C.steel);KK.b(0,0.91,0,1.02,0.02,0.92,[0.85,0.87,0.9]);for(let i=0;i<3;i++)KK.b(0,0.2+i*0.25,0.455,0.9,0.005,0.005,[0.5,0.52,0.55]);
   KK.b(-0.2,0.95,-0.1,0.36,0.04,0.26,[0.75,0.55,0.3]);KK.cyl(0.25,0.92,0.1,0.1,0.12,[0.75,0.76,0.8]);KK.b(0.15,0.94,-0.25,0.2,0.02,0.04,C.steel,false,0.5);return true;}
  if(f===11){const a=wd(),KK=a3Kit(B,cx,cz,a);KK.b(0,0.55,0,0.7,1.1,0.5,C.dwood);KK.t(0,1.15,0,0,Math.PI/2,0,0.7,0.36,0.5,C.dwood);KK.b(0,0.8,0.255,0.5,0.4,0.01,[1,0.6,0.3],true);
   for(const ox of [-0.3,0.3])KK.b(ox,0.6,0.255,0.06,1.0,0.01,[1,0.3,0.6],true);KK.b(0,0.35,0.255,0.4,0.2,0.01,C.gold);return true;}
  if(f===13){const a=wd(),KK=a3Kit(B,cx,cz,a);KK.b(0,0.9,-0.1,0.98,1.8,0.4,C.dwood);for(let r=0;r<5;r++)for(let i=0;i<6;i++)KK.cylX(-0.4+i*0.16,0.25+r*0.32,0.1,0.04,0.0001+0.02,[0.25+0.2*((r+i)%2),0.05,0.1]);
   for(let r=0;r<6;r++)KK.b(0,0.1+r*0.32,0.1,0.96,0.02,0.02,C.dwood);return true;}
  return false;}
 if(f===19){const h=hsh(x,z,11),KK=a3Kit(B,cx,cz,(h-0.5)*0.2);
  if(k==='apron'||k==='hangar'){/* an aircraft baggage container */const al=[0.78,0.8,0.84];KK.b(-0.05,0.55,0,0.82,1.1,0.86,al);KK.t(0.37,0.4,0,0,0,0.4,0.2,0.86,0.86,al);
   KK.b(-0.05,1.11,0,0.84,0.02,0.88,[0.6,0.62,0.66]);KK.b(-0.05,0.55,0.435,0.7,0.9,0.01,[0.3,0.35,0.5]);KK.b(-0.05,0.85,0.44,0.5,0.12,0.01,C.yel);KK.b(-0.05,0.03,0,0.9,0.06,0.9,C.dk);return true;}
  if(a4Gar(k)){/* Vale Trust strongboxes on a pallet */KK.b(0,0.06,0,0.9,0.12,0.8,C.wood);for(let l=0;l<3;l++)for(let i=0;i<2;i++){KK.b((i-0.5)*0.42,0.2+l*0.2,0,0.4,0.18,0.7,[0.32,0.34,0.38]);KK.b((i-0.5)*0.42,0.2+l*0.2,0.355,0.08,0.06,0.01,C.gold);}
   KK.b(0,0.32,0,0.92,0.03,0.82,C.yel);return true;}}
 if(f===7&&a4Gar(k)){const a=wd(),KK=a3Kit(B,cx,cz,a);KK.b(0,0.48,0,1.0,0.96,0.86,[0.08,0.08,0.1]);KK.b(0,0.98,0,1.04,0.05,0.9,[0.95,0.92,0.86]);KK.b(0,0.5,0.436,1.0,0.04,0.01,C.gold);
  KK.b(0,1.3,-0.2,0.96,0.6,0.02,[0.6,0.8,0.9]);KK.b(0,1.62,-0.2,1.0,0.04,0.06,C.gold);return true;}
 if((f===7||f===1)&&(k==='apron'||k==='hangar')){const a=wd(),KK=a3Kit(B,cx,cz,a);if(f===7){KK.b(0,0.46,0,1.0,0.92,0.86,[0.5,0.52,0.56]);KK.b(0,0.93,0,1.02,0.03,0.9,[0.2,0.22,0.26]);
   KK.b(-0.2,1.05,-0.15,0.36,0.2,0.26,[0.22,0.24,0.2]);KK.b(-0.2,1.08,-0.02,0.24,0.08,0.01,[0.3,1,0.5],true);KK.b(0.25,0.97,0.1,0.3,0.02,0.22,[0.92,0.92,0.85]);return true;}
  KK.b(0,0.74,0,0.96,0.05,0.96,[0.45,0.47,0.5]);for(const ox of [-0.42,0.42])for(const oz of [-0.42,0.42])KK.b(ox,0.36,oz,0.05,0.72,0.05,C.dk);KK.b(0,0.77,0,0.8,0.005,0.6,[0.6,0.78,0.88]);return true;}
 return false;}

/* static: everything above, once, into the level's batch */
function drawAct4Sets(B,g){const A4=g.a4;if(!A4||a4Of(g)!==A4.k)return;const r0=B.round;B.round=0;
 for(const p of A4.props)a4Prop(B,g,p);a4Runs(B,g);a4Paint(B,g);a4SetPieces(B,g);a4DrawRamps(B,g);B.round=r0;}
/* the generic wall posters, paintings and windows stay off the garage, the apron and the hangar (the Coral Room keeps its art) */
const a4NoArt=g=>{const k=g&&g.a4&&g.a4.k;return !!k&&k!=='rest'&&a4Of(g)===k;};
