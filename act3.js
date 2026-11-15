'use strict';
/* ================= ACT 3 SETS: Ocean Drive Demolition, the Grand Biscayne Gala and Kade Tower =================
   Kade's three jobs used to be the stock rooms with chequered floors and white fridges. Each now reads as the place it is:
   - OCEAN DRIVE DEMOLITION: a gutted building. Cracked bare slab and patched concrete underfoot, stained stripped plaster on the
     walls, scaffolding, drywall stacks, tool chests, paint buckets, rubble in the corners, sawhorse barricades, explosives crates,
     tripod work lights; the fridges are site generators, the crates brick pallets and cement bags.
   - THE GRAND BISCAYNE GALA: black tie. A black-and-gold marble dance floor with a red carpet up from the doors, round banquet
     tables in white cloth with candles and flowers, buffet and bar stations, champagne towers, flower pedestals, an ice swan,
     a grand piano, gilt chairs and Kade's architectural model of his tower; the office with the safe is panelled in wood.
   - KADE TOWER (site gate, steel stairs, the unfinished top floor): poured slab and steel grating, I-beam stacks, rebar
     bundles, cement bag pallets, block pallets, cable spools, oil drums, a cement mixer, tarps and work lights. From the top floor
     you look down on the lights of Miami forty floors below.
   Props stand against the walls, out of the walkways, and never on a door, a stair, an arrival spot, an objective or the
   crane console. Everything goes into the level's static batch (built once), so both renderers draw it and a phone pays nothing
   per frame for it. The furniture keeps its cells and its cover; only the look changes.
   Loaded after marina.js, before the main inline script: nothing here touches main-script globals at load time. */

const A3_KIND={'OCEAN DRIVE DEMOLITION':'demo','THE GRAND BISCAYNE GALA':'gala','KADE TOWER: SITE GATE':'site','KADE TOWER: STEEL STAIRS':'stair','KADE TOWER':'roof'};
const a3Of=g=>g&&g.def&&!g.def.hub&&Object.prototype.hasOwnProperty.call(A3_KIND,g.def.name)?A3_KIND[g.def.name]:null;
const A3_POOL={
 demo:['scaffold','drywall','tools','buckets','horses','wheel','boom','fixtures','scaffold','drywall'],
 gala:['flowers','buffet','champ','chairs','palm','flowers','chairs','coat'],
 site:['rebar','beams','bags','spool','blocks','drums','tarp','cones'],
 stair:['bags','spool','drums','rebar','blocks','cones'],
 roof:['rebar','beams','tarp','spool','drums','blocks','bags']};
const A3_CORNER={demo:['rubble','light','rubble'],gala:['piano','ice','model','palm'],site:['mixer','light','tarp'],stair:['light','drums'],roof:['mixer','light','tarp']};
/* colours */
const A3C={steel:[0.62,0.64,0.68],dk:[0.12,0.12,0.14],wood:[0.62,0.46,0.26],dwood:[0.36,0.24,0.14],ply:[0.78,0.64,0.42],conc:[0.6,0.59,0.56],brick:[0.62,0.28,0.2],
 rust:[0.45,0.24,0.14],prim:[0.66,0.22,0.15],yel:[0.96,0.76,0.12],org:[1,0.45,0.1],wh:[0.94,0.93,0.9],cloth:[0.97,0.96,0.94],gold:[0.92,0.74,0.32],
 silver:[0.82,0.84,0.88],red:[0.72,0.08,0.12],green:[0.16,0.42,0.2],blue:[0.16,0.36,0.72],black:[0.05,0.05,0.06],bag:[0.82,0.76,0.62],cmu:[0.55,0.55,0.56]};

/* a local frame at (x,z) turned a: local -z is the wall behind a prop */
function a3Kit(B,x,z,a,y){const m=A.mul(A.T(x,y||0,z),A.RY(a||0));const K={
 b(px,py,pz,sx,sy,sz,c,em,ry,uv){B.box(A.mul(m,A.mul(A.mul(A.T(px,py,pz),A.RY(ry||0)),A.S(sx,sy,sz))),c,!!em,uv);},
 t(px,py,pz,ry,rx,rz,sx,sy,sz,c,em){B.box(A.mul(m,A.mul(A.mul(A.mul(A.T(px,py,pz),A.RY(ry||0)),A.mul(A.RX(rx||0),A.RZ(rz||0))),A.S(sx,sy,sz))),c,!!em);},
 /* an upright eight-sided post of radius r (four boxes 45 degrees apart) */
 cyl(px,py,pz,r,h,c,em){for(let i=0;i<4;i++)K.b(px,py+h/2,pz,0.83*r,h,2*r,c,em,i*Math.PI/4);},
 /* the same lying along local x (a drum on its side, a spool, a pipe) */
 cylX(px,py,pz,r,l,c){for(let i=0;i<4;i++)K.t(px,py,pz,0,i*Math.PI/4,0,l,0.83*r,2*r,c);}};return K;}

/* the stage def this map belongs to (stairs and arrivals stay clear) */
function a3StageDef(g){if(typeof MISSIONS==='undefined')return null;for(const m of Object.values(MISSIONS))if(m.stageDefs)for(const s of Object.values(m.stageDefs))if(s.def&&s.def.name===g.def.name)return s;return null;}

/* ---- set-up (dressStreet): floors, walls, the prop spots, work lights ---- */
function act3Dress(g){const k=a3Of(g);if(!k||!g.rows)return;const W=g.W,H=g.H,zT=g.front?g.front.zT-1:H-1,rows=g.rows,A3=g.a3={k,props:[],ceil:[]};
 const mapAt=(x,z)=>rows[z]&&rows[z][x]||' ';
 for(let z=1;z<zT;z++)for(let x=1;x<W-1;x++){const i=z*W+x,mx=x-1,mz=z-1,ch=mapAt(x,z);
  if(g.solid[i]){if(!g.wallX||!g.topX||g.wallX[i])continue;if(k==='demo'&&g.wallT[i]===g.def.wall){g.wallX[i]=48;}else if(k==='roof'&&g.wallT[i]===g.def.wall){g.wallX[i]=34;g.topX[i]=37;}continue;}
  let f=g.floorT[i];const h=hsh(x,z,61);
  if(k==='demo')f=h<0.22?27:34;
  else if(k==='site')f=mx>=9&&mx<=26?(h<0.15?27:34):37;
  else if(k==='stair')f=mx<=8?60:37;
  else if(k==='roof')f=h<0.1?27:37;
  else if(k==='gala'){if(mx>=1&&mx<=8)f=14;else if(mx>=16&&mx<=23&&mz>=2&&mz<=8)f=43;else if(mx>=34&&mz<=3)f=4;else if(mx>=10&&mx<=28)f=63;}
  if(ch!=='N')g.floorT[i]=f;}
 /* keep clear of doors, front gaps, stairs, arrivals, objectives, the spawn and the crane console */
 const sd=a3StageDef(g),clear=[];
 if(sd){for(const s of sd.stairs||[])clear.push([s.at[0],s.at[1],2.2]);for(const q of Object.values(sd.arrivals||{}))clear.push([q.at[0],q.at[1],2]);}
 if(g.player)clear.push([g.player.x,g.player.z,1.6]);if(k==='roof')clear.push([2.5,H-2.5,1.8]);
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){const c=mapAt(x,z);if('DNenPC'.includes(c))clear.push([x+0.5,z+0.5,c==='D'?1.6:1.3]);}
 if(g.front)for(let x=1;x<W-1;x++)if(!g.solid[(zT)*W+x])clear.push([x+0.5,zT-0.5,1.8]);
 const ok=(x,z)=>{if(x<1||z<1||x>=W-1||z>=zT)return false;const i=z*W+x;if(g.solid[i]||g.furn[i]||g.glass&&g.glass[i])return false;const cx=x+0.5,cz=z+0.5;
  for(const [qx,qz,r] of clear)if(Math.abs(qx-cx)<r&&Math.abs(qz-cz)<r)return false;return true;};
 const sol=(x,z)=>x<0||z<0||x>=W||z>=H||g.solid[z*W+x]&&!(g.glass&&g.glass[z*W+x]);
 const taken=[],far=(x,z,d)=>taken.every(([a,b])=>Math.max(Math.abs(a-x),Math.abs(b-z))>=d);
 const pool=A3_POOL[k],corner=A3_CORNER[k];let lights=0;
 /* corners first (the bigger pieces), then wall spots */
 for(let pass=0;pass<2;pass++)for(let z=1;z<zT;z++)for(let x=1;x<W-1;x++){if(!ok(x,z))continue;
  const n=sol(x,z-1),s=sol(x,z+1),w=sol(x-1,z),e=sol(x+1,z);if(n&&s||w&&e)continue; /* one-cell corridor */
  const cor=(n||s)&&(w||e);if(pass===0&&!cor)continue;if(pass===1&&cor)continue;if(!n&&!s&&!w&&!e)continue;
  const h=hsh(x,z,62);if(pass===1&&h>0.42)continue;if(!far(x,z,pass?2:3))continue;
  let a=n?0:w?Math.PI/2:e?-Math.PI/2:Math.PI;
  let t=pass===0?corner[Math.floor(hsh(x,z,63)*corner.length)]:pool[Math.floor(hsh(x,z,64)*pool.length)];
  if(t==='light'){if(lights>=3)t=pass===0?(k==='demo'?'rubble':'drums'):'drums';else lights++;}
  /* a corner piece sits into the corner: nudge it toward the side wall */
  const sx=pass===0?(w?-0.12:e?0.12:0):0,sz=pass===0?(n?-0.12:s?0.12:0):0;
  if(t==='piano'&&!(mapAt(x,z)!=='#'&&x>10&&x<30)){t='palm';}
  A3.props.push({t,x:x+0.5+sx,z:z+0.5+sz,a,c:cor?(w?-1:1):0,s:hsh(x,z,65)});taken.push([x,z]);
  if(t==='light'){const lx=x+0.5-Math.sin(a)*0.1,lz=z+0.5-Math.cos(a)*0.1;g.lights.push({x:lx+Math.sin(a)*0.6,y:1.2,z:lz+Math.cos(a)*0.6,r:5,c:[1,0.92,0.7]});}}
 if(k==='gala'){g.lights.push({x:20.5,y:2.2,z:6.5,r:6,c:[1,0.8,0.55]});
  /* the red carpet: up from the street doors to the dance floor */
  let z0=zT;while(z0>1&&!g.solid[(z0-1)*W+20]&&g.floorT[(z0-1)*W+20]!==43)z0--;A3.carpet={x:21,z0,z1:zT+(g.front?0.6:0)};}}

/* ---- the props ---- */
function a3Prop(B,g,p){const K=a3Kit(B,p.x,p.z,p.a),C=A3C,s=p.s,back=-0.3;
 switch(p.t){
 /* --- demolition --- */
 case 'scaffold':{for(const ox of [-0.44,0.44])for(const oz of [-0.4,-0.06]){K.b(ox,0.52,oz,0.04,1.04,0.04,C.steel);K.b(ox,0.02,oz,0.12,0.03,0.12,C.dk);}
  for(const oz of [-0.4,-0.06])K.t(0,0.5,oz,0,0,0.98,0.9,0.025,0.03,C.steel);for(const ox of [-0.44,0.44])K.b(ox,0.98,-0.23,0.04,0.04,0.38,C.steel);
  for(let i=0;i<3;i++)K.b(0,0.58,-0.36+i*0.12,0.98,0.035,0.11,i%2?C.ply:C.wood);K.b(0,0.62,-0.03,0.98,0.08,0.02,C.yel);
  K.cyl(-0.2,0.6,-0.25,0.06,0.12,C.wh);K.b(-0.2,0.725,-0.25,0.1,0.01,0.1,[0.3,0.6,0.9]);K.cyl(0.25,0,-0.1,0.09,0.22,[0.86,0.86,0.82]);break;}
 case 'drywall':{for(let i=0;i<5;i++)K.t(-0.05+i*0.015,0.47,-0.38+i*0.035,0,-0.16,0,0.92,0.94,0.025,i===4?[0.9,0.9,0.86]:[0.78,0.78,0.74]);
  for(let i=0;i<3;i++)K.t(0.4-i*0.06,0.5,-0.3+i*0.05,0,-0.2,0.08*i,0.06,1.0,0.035,C.ply);K.b(-0.3,0.03,0.12,0.4,0.06,0.25,[0.8,0.78,0.72]);break;}
 case 'tools':{K.b(-0.12,0.32,-0.25,0.56,0.6,0.36,[0.78,0.1,0.1]);for(let i=0;i<4;i++)K.b(-0.12,0.12+i*0.13,-0.065,0.5,0.008,0.01,C.dk);K.b(-0.12,0.45,-0.06,0.3,0.02,0.02,C.silver);
  K.b(-0.12,0.635,-0.25,0.58,0.03,0.38,C.dk);K.b(-0.2,0.7,-0.25,0.24,0.1,0.24,C.yel);K.b(-0.2,0.66,-0.25,0.3,0.02,0.3,C.yel);
  K.t(0.36,0.42,-0.36,0,-0.15,0.08,0.035,0.84,0.035,C.wood);K.b(0.38,0.06,-0.28,0.16,0.1,0.1,[0.25,0.25,0.28]);break;}
 case 'buckets':{const cols=[[0.92,0.92,0.9],[0.85,0.85,0.8],[0.92,0.92,0.9]];for(let i=0;i<3;i++){const ox=-0.3+i*0.22+(i===2?0.06:0),oz=i===1?-0.12:-0.3;K.cyl(ox,0,oz,0.1,0.24,cols[i]);K.b(ox,0.245,oz,0.17,0.01,0.17,[[0.2,0.6,0.9],[0.9,0.3,0.5],[0.95,0.8,0.2]][i]);}
  K.t(0.32,0.5,-0.38,0,-0.12,0,0.4,1.0,0.03,C.steel);K.t(0.32,0.45,-0.14,0,0.3,0,0.4,0.92,0.03,C.steel);for(let i=0;i<4;i++)K.b(0.32,0.2+i*0.22,-0.31+i*0.02,0.38,0.025,0.06,C.silver);
  K.b(0.0,0.02,0.1,0.32,0.04,0.22,[0.3,0.3,0.34]);K.b(0.0,0.045,0.1,0.26,0.01,0.16,[0.9,0.3,0.5]);break;}
 case 'rubble':{const cs=[C.conc,C.brick,[0.5,0.48,0.45],C.conc,[0.7,0.68,0.64],C.brick];for(let i=0;i<10;i++){const a=hsh(i,p.x|0,66)*6.3,r=0.08+hsh(i,p.z|0,67)*0.32,sz=0.12+hsh(i,7,68)*0.22;
   K.t(Math.cos(a)*r*0.9-0.05,sz*0.4+(r<0.18?0.12:0),Math.sin(a)*r*0.7-0.12,a,hsh(i,3,69)*0.6,hsh(i,4,69)*0.5,sz*1.4,sz,sz*1.1,cs[i%cs.length]);}
  for(let i=0;i<3;i++)K.t(-0.15+i*0.15,0.35,-0.15,i,0.5+i*0.2,0.3,0.018,0.7,0.018,C.rust);K.b(0,0.005,0,1.0,0.008,0.9,[0.5,0.48,0.44]);break;}
 case 'light':{for(let i=0;i<3;i++){const a=i*2.1;K.t(Math.sin(a)*0.15,0.22,-0.15+Math.cos(a)*0.15,a,-0.35,0,0.025,0.48,0.025,C.dk);}
  K.b(0,0.65,-0.15,0.035,0.9,0.035,C.dk);K.b(0,1.08,-0.1,0.34,0.24,0.16,[0.95,0.75,0.1]);K.b(0,1.08,-0.015,0.28,0.18,0.02,[1,0.95,0.78],true);
  K.t(0,0.02,0.3,0.6,0,0,0.6,0.012,0.03,C.dk);break;}
 case 'horses':{for(const ox of [-0.38,0.38]){K.t(ox,0.32,-0.3,0,0.3,0,0.06,0.66,0.04,C.wood);K.t(ox,0.32,-0.12,0,-0.3,0,0.06,0.66,0.04,C.wood);}
  for(let i=0;i<6;i++)K.b(-0.42+i*0.168,0.62,-0.21,0.168,0.14,0.04,i%2?C.wh:C.org);K.b(0,0.42,-0.21,0.96,0.06,0.04,C.wood);
  K.b(0.15,0.005,0.15,0.6,0.008,0.05,C.yel);K.b(-0.2,0.005,0.2,0.5,0.008,0.05,C.yel);break;}
 case 'wheel':{K.t(0,0.36,-0.15,0,0.12,0,0.5,0.06,0.62,[0.2,0.45,0.32]);K.t(0,0.44,-0.15,0,0.12,0,0.56,0.14,0.68,[0.24,0.52,0.36]);
  for(let i=0;i<4;i++)K.b(-0.12+(i%2)*0.22,0.53+Math.floor(i/2)*0.07,-0.18+(i%2)*0.05,0.2,0.065,0.1,C.brick);
  K.t(0,0.18,0.25,Math.PI/2,0,0,0.05,0.3,0.3,C.dk);for(const ox of [-0.2,0.2]){K.t(ox,0.32,-0.5,0,-0.25,0,0.03,0.03,0.4,C.dk);K.b(ox,0.15,-0.35,0.03,0.3,0.03,C.dk);}break;}
 case 'boom':{K.b(0,0.18,-0.25,0.6,0.36,0.38,[0.6,0.42,0.22]);K.b(0,0.37,-0.25,0.62,0.02,0.4,[0.45,0.3,0.15]);K.b(0,0.22,-0.055,0.4,0.12,0.01,C.org,true);
  for(let i=0;i<5;i++)K.t(-0.18+i*0.09,0.42,-0.25,0,0,Math.PI/2,0.05,0.24,0.05,[0.8,0.12,0.1]);K.t(0.2,0.01,0.05,0.8,0,0,0.5,0.01,0.012,[0.85,0.2,0.2]);
  K.b(-0.3,0.1,0.15,0.2,0.2,0.2,C.wood);break;}
 case 'fixtures':{K.b(-0.2,0.18,-0.25,0.3,0.36,0.42,C.wh);K.b(-0.2,0.42,-0.4,0.34,0.3,0.14,C.wh);K.b(-0.2,0.37,-0.2,0.28,0.02,0.3,[0.86,0.86,0.9]);
  K.t(0.25,0.1,-0.2,0.4,0,1.2,0.45,0.15,0.34,C.wh);for(let i=0;i<4;i++)K.t(0.1,0.03+i*0.035,0.15,0.2,0,Math.PI/2,0.035,0.9,0.035,[0.75,0.45,0.25]);break;}
 /* --- the gala --- */
 case 'flowers':{K.b(0,0.02,-0.2,0.38,0.04,0.38,C.wh);K.cyl(0,0.04,-0.2,0.12,0.66,C.wh);K.b(0,0.72,-0.2,0.34,0.04,0.34,C.wh);K.cyl(0,0.74,-0.2,0.07,0.18,C.gold);
  const fc=[[1,0.55,0.7],[1,1,1],[0.95,0.3,0.45],[1,0.85,0.9],[1,1,1]];for(let i=0;i<9;i++){const a=i*0.7,r=0.04+0.06*(i%3);K.b(Math.cos(a)*r,0.97+0.06*(i%2),-0.2+Math.sin(a)*r,0.08,0.07,0.08,fc[i%5]);}
  for(let i=0;i<5;i++){const a=i*1.26;K.t(Math.cos(a)*0.1,0.95,-0.2+Math.sin(a)*0.1,a,0.9,0,0.04,0.2,0.012,C.green);}break;}
 case 'buffet':{K.b(0,0.37,-0.22,0.96,0.74,0.46,C.cloth);K.b(0,0.12,-0.0,0.97,0.22,0.02,[0.86,0.82,0.74]);K.b(0,0.745,-0.22,0.98,0.01,0.48,C.cloth);
  for(const ox of [-0.28,0.08]){K.b(ox,0.79,-0.24,0.26,0.06,0.2,C.silver);K.b(ox,0.85,-0.24,0.22,0.05,0.16,C.silver);K.b(ox,0.885,-0.24,0.05,0.025,0.03,C.gold);}
  K.cyl(0.36,0.75,-0.3,0.09,0.06,C.wh);for(let i=0;i<5;i++)K.cyl(0.28+i*0.035,0.75,-0.08,0.014,0.09,[0.95,0.9,0.7]);break;}
 case 'champ':{K.cyl(0,0,-0.15,0.28,0.72,C.cloth);K.cyl(0,0.72,-0.15,0.3,0.02,C.cloth);
  const tiers=[[4,0.15],[3,0.1],[2,0.05],[1,0]];tiers.forEach(([n,r],t)=>{for(let i=0;i<n*n;i++){const ix=i%n,iz=Math.floor(i/n),ox=(ix-(n-1)/2)*0.07,oz=(iz-(n-1)/2)*0.07;K.b(ox,0.78+t*0.075,-0.15+oz,0.05,0.07,0.05,[1,0.9,0.6],t===3);}});
  K.cyl(0.22,0.74,-0.32,0.06,0.14,C.silver);K.b(0.22,0.9,-0.32,0.04,0.16,0.04,[0.1,0.3,0.15]);break;}
 case 'chairs':{for(const ox of [-0.24,0.24]){K.b(ox,0.44,-0.2,0.36,0.04,0.34,C.gold);K.b(ox,0.47,-0.2,0.32,0.03,0.3,C.red);for(const lx of [-0.15,0.15])for(const lz of [-0.35,-0.05])K.b(ox+lx,0.22,lz,0.03,0.44,0.03,C.gold);
  for(const lx of [-0.15,0.15])K.b(ox+lx,0.7,-0.36,0.03,0.5,0.03,C.gold);for(let i=0;i<3;i++)K.b(ox,0.6+i*0.13,-0.36,0.3,0.025,0.025,C.gold);}break;}
 case 'palm':{K.cyl(0,0,-0.15,0.16,0.36,[0.86,0.82,0.72]);K.b(0,0.37,-0.15,0.28,0.02,0.28,[0.25,0.18,0.12]);
  for(let i=0;i<9;i++){const a=i*0.7+s*3,l=0.32+0.12*(i%3);K.t(Math.sin(a)*l*0.45,0.62+0.12*(i%2),-0.15+Math.cos(a)*l*0.45,a,0.9-0.15*(i%3),0,0.07,l,0.015,i%2?[0.2,0.55,0.28]:[0.15,0.45,0.22]);}
  for(let i=0;i<3;i++)K.b((i-1)*0.04,0.5,-0.15,0.025,0.3,0.025,[0.4,0.32,0.2]);break;}
 case 'coat':{K.b(0,0.02,-0.25,0.3,0.03,0.3,C.dwood);K.b(0,0.55,-0.25,0.04,1.06,0.04,C.dwood);for(let i=0;i<4;i++){const a=i*Math.PI/2+0.4;K.t(Math.sin(a)*0.1,1.02,-0.25+Math.cos(a)*0.1,a,0.7,0,0.02,0.18,0.02,C.gold);}
  K.t(0.1,0.7,-0.2,0.3,0,0.1,0.22,0.52,0.1,[0.08,0.08,0.1]);K.t(-0.1,0.72,-0.28,-0.4,0,-0.1,0.2,0.46,0.1,[0.55,0.12,0.2]);break;}
 case 'piano':{const bk=[0.03,0.03,0.035];K.b(-0.05,0.72,-0.05,1.02,0.26,0.62,bk,false,0.2);K.b(0.38,0.72,-0.22,0.4,0.26,0.4,bk,false,0.7);
  K.t(-0.05,1.0,-0.24,0.2,-0.55,0,0.96,0.02,0.58,bk);K.t(-0.05,0.94,-0.05,0.2,0,0,0.035,0.42,0.035,C.gold);
  K.b(-0.12,0.83,0.29,0.86,0.03,0.12,C.wh,false,0.2);for(let i=0;i<12;i++)K.b(-0.5+i*0.07+0.1,0.85,0.27-(-0.5+i*0.07)*0.2,0.025,0.02,0.07,bk,false,0.2);
  for(const [lx,lz] of [[-0.48,0.18],[0.42,0.15],[0.3,-0.35]])K.b(lx,0.3,lz,0.07,0.6,0.07,bk);K.b(-0.05,0.25,0.62,0.6,0.05,0.3,bk,false,0.2);K.b(-0.05,0.29,0.62,0.56,0.03,0.26,C.red,false,0.2);break;}
 case 'ice':{K.b(0,0.3,-0.1,0.62,0.6,0.5,C.cloth);K.b(0,0.61,-0.1,0.64,0.02,0.52,C.silver);const ic=[0.62,0.85,1];
  K.t(0,0.78,-0.1,0,0,0,0.36,0.24,0.22,ic,true);K.t(0.16,1.0,-0.1,0,0,-0.35,0.07,0.4,0.07,ic,true);K.b(0.24,1.18,-0.1,0.12,0.08,0.08,ic,true);
  for(const oz of [-0.21,0.01])K.t(-0.05,0.86,oz,0,oz<0?-0.6:0.6,0.3,0.32,0.2,0.03,[0.75,0.92,1],true);for(let i=0;i<6;i++)K.b(-0.25+i*0.1,0.63,0.13,0.06,0.04,0.06,[0.85,0.95,1],true);break;}
 case 'model':{K.b(0,0.38,-0.15,0.8,0.76,0.6,C.black);K.b(0,0.77,-0.15,0.82,0.02,0.62,[0.2,0.24,0.2]);K.b(0.05,1.02,-0.18,0.16,0.5,0.16,C.wh);K.b(0.05,1.28,-0.18,0.12,0.04,0.12,C.gold,true);
  for(const [ox,oz,h] of [[-0.25,-0.3,0.18],[-0.22,0.02,0.12],[0.28,-0.32,0.14],[0.3,0.0,0.09],[-0.05,0.05,0.07]])K.b(ox,0.78+h/2,-0.15+oz+0.15,0.12,h,0.12,[0.85,0.85,0.82]);
  for(let i=0;i<4;i++)K.cyl(-0.32+i*0.2,0.78,0.08,0.025,0.06,C.green);K.b(0,0.5,0.157,0.3,0.1,0.01,C.gold);break;}
 /* --- Kade Tower --- */
 case 'rebar':{for(const ox of [-0.32,0.32])K.b(ox,0.05,-0.2,0.12,0.1,0.42,C.wood);for(let i=0;i<12;i++)K.b(0,0.13+Math.floor(i/6)*0.035,-0.33+(i%6)*0.05,1.0,0.025,0.025,C.rust);
  for(const ox of [-0.15,0.2])K.b(ox,0.15,-0.2,0.02,0.1,0.34,[0.3,0.3,0.32]);break;}
 case 'beams':{for(const ox of [-0.32,0.32])K.b(ox,0.04,-0.2,0.14,0.08,0.44,C.wood);for(let j=0;j<2;j++)for(let i=0;i<(j?1:2);i++){const oz=-0.3+i*0.22+(j?0.11:0),y=0.08+j*0.18;
   K.b(0,y+0.01,oz,1.0,0.02,0.16,C.prim);K.b(0,y+0.09,oz,1.0,0.16,0.025,C.prim);K.b(0,y+0.17,oz,1.0,0.02,0.16,C.prim);}break;}
 case 'bags':{K.b(0,0.06,-0.2,0.86,0.12,0.56,C.wood);for(let i=0;i<3;i++)K.b(0,0.015,-0.4+i*0.2,0.86,0.03,0.1,C.dwood);
  for(let l=0;l<3;l++)for(let i=0;i<2;i++){const r=(l%2?0.1:0);K.b((i-0.5)*0.4,0.17+l*0.1,-0.2+r-0.05,0.38,0.09,0.24,l===2&&i?[0.75,0.7,0.58]:C.bag,false,(l%2)*0.05);}
  K.b(0,0.47,-0.2,0.2,0.005,0.12,[0.3,0.3,0.6]);break;}
 case 'spool':{for(const ox of [-0.24,0.24])K.cylX(ox,0.32,-0.18,0.32,0.05,C.wood);K.cylX(0,0.32,-0.18,0.2,0.44,[0.08,0.08,0.09]);K.cylX(0,0.32,-0.18,0.08,0.52,C.dwood);
  K.t(0.1,0.02,0.15,0.6,0,0,0.6,0.02,0.03,[0.08,0.08,0.09]);break;}
 case 'blocks':{K.b(0,0.06,-0.2,0.9,0.12,0.6,C.wood);for(let l=0;l<3;l++)for(let i=0;i<4;i++){const ox=(i%2-0.5)*0.42,oz=-0.2+(Math.floor(i/2)-0.5)*0.22;K.b(ox,0.22+l*0.2,oz,0.4,0.19,0.2,C.cmu);
   if(l===2)for(const hx of [-0.09,0.09])K.b(ox+hx,0.32+l*0.2-0.0,oz,0.12,0.005,0.1,[0.25,0.25,0.26]);}break;}
 case 'drums':{const cs=[[0.12,0.3,0.62],[0.85,0.62,0.1],[0.2,0.4,0.25]];for(let i=0;i<3;i++){const ox=-0.25+i*0.26,oz=i===1?-0.1:-0.3,c=cs[Math.floor(s*3+i)%3];
   K.cyl(ox,0,oz,0.13,0.6,c);for(const y of [0.2,0.4])K.cyl(ox,y,oz,0.135,0.025,c.map(v=>v*0.7));K.cyl(ox,0.6,oz,0.12,0.01,[0.3,0.3,0.32]);}break;}
 case 'tarp':{const bl=[0.14,0.34,0.72];K.b(0,0.18,-0.2,0.9,0.36,0.56,[0.4,0.4,0.42]);K.t(0,0.38,-0.2,0,0,0,0.96,0.08,0.62,bl);K.t(0,0.2,0.1,0,0.35,0,0.96,0.36,0.04,bl);
  K.t(-0.47,0.2,-0.2,0,0,-0.12,0.04,0.38,0.6,bl);K.t(0.47,0.2,-0.2,0,0,0.12,0.04,0.38,0.6,bl);for(const ox of [-0.3,0.3])K.b(ox,0.43,-0.2,0.02,0.01,0.64,[0.9,0.2,0.2]);break;}
 case 'cones':{for(let i=0;i<3;i++){const ox=-0.3+i*0.3;K.b(ox,0.015,-0.2,0.26,0.03,0.26,C.dk);for(let l=0;l<4;l++){const w=0.18-l*0.04;K.b(ox,0.07+l*0.1,-0.2,w,0.1,w,l===2?C.wh:C.org);}}
  K.b(0,0.48,-0.35,0.9,0.12,0.04,C.org);for(let i=0;i<4;i++)K.b(-0.34+i*0.22,0.48,-0.33,0.08,0.12,0.01,C.wh);break;}
 case 'mixer':{K.b(0,0.2,-0.1,0.6,0.08,0.5,C.dk);K.t(0,0.2,0.2,Math.PI/2,0,0,0.05,0.26,0.26,C.dk);K.t(0,0.2,-0.4,Math.PI/2,0,0,0.05,0.26,0.26,C.dk);
  for(let i=0;i<4;i++)K.t(0,0.62,-0.1,i*Math.PI/4,0.55,0,0.38,0.62,0.46,i%2?[0.95,0.48,0.1]:[1,0.55,0.12]);K.t(0,0.9,0.12,0,0.55,0,0.2,0.1,0.2,C.dk);K.b(0.34,0.42,-0.15,0.16,0.22,0.24,[0.8,0.8,0.82]);break;}
 }}

/* clutter on bare floor cells (replaces the generic bottles and pizza boxes on Act 3 floors) */
function act3Clutter(B,g,x,z){const k=g.a3&&g.a3.k;if(!k)return false;if(g.front&&z>=g.front.zT-1)return true;if(hsh(x,z,1)>0.2)return true;
 const near=g.a3.props.some(p=>Math.abs(p.x-x-0.5)<0.9&&Math.abs(p.z-z-0.5)<0.9);if(near)return true;
 const u=x+0.2+hsh(x,z,3)*0.6,v=z+0.2+hsh(x,z,4)*0.6,r=hsh(x,z,5)*TAU,h=hsh(x,z,2),C=A3C,bx=(dx,y,dz,sx,sy,sz,c,ry,em)=>B.box(TRS(u+dx,y,v+dz,r+(ry||0),sx,sy,sz),c,!!em);
 if(k==='gala'){
  if(h<0.3){for(let i=0;i<9;i++)bx((hsh(x,z,70+i)-0.5)*0.6,0.003,(hsh(x,z,80+i)-0.5)*0.6,0.04,0.004,0.04,[[1,0.3,0.7],[0.3,0.9,1],[1,0.85,0.3],[1,1,1]][i%4],i);}
  else if(h<0.5){bx(0,0.02,0,0.045,0.04,0.045,[0.95,0.92,0.8]);bx(0.03,0.02,0.05,0.02,0.02,0.12,[0.95,0.92,0.8],0.4);}
  else if(h<0.7){for(let i=0;i<5;i++)bx((hsh(x,z,90+i)-0.5)*0.4,0.004,(hsh(x,z,95+i)-0.5)*0.4,0.06,0.006,0.04,[0.8,0.05,0.12],i);}
  else if(h<0.85){bx(0,0.004,0,0.22,0.006,0.22,C.wh);bx(0.03,0.008,0.02,0.1,0.004,0.06,C.gold);}
  else{bx(0,0.006,0,0.16,0.012,0.07,[0.35,0.75,0.4]);bx(0.05,0.012,0.02,0.16,0.012,0.07,[0.4,0.8,0.45],0.3);}
  return true;}
 /* building sites */
 if(h<0.3){for(let i=0;i<4;i++)bx((hsh(x,z,70+i)-0.5)*0.5,0.03,(hsh(x,z,80+i)-0.5)*0.5,0.08+hsh(x,z,75+i)*0.08,0.06,0.07+hsh(x,z,85+i)*0.06,i%2?C.conc:C.brick,i);}
 else if(h<0.45){bx(0,0.006,0,0.7,0.012,0.03,[0.08,0.08,0.09]);bx(0.3,0.006,0.15,0.35,0.012,0.03,[0.08,0.08,0.09],0.9);}
 else if(h<0.6){bx(0,0.06,0,0.24,0.12,0.24,C.yel);bx(0,0.02,0,0.3,0.02,0.3,C.yel);}
 else if(h<0.75){bx(0,0.05,0,0.07,0.1,0.07,C.wh);bx(0.1,0.01,0.06,0.07,0.02,0.07,[0.4,0.25,0.15]);}
 else if(h<0.9){bx(0,0.03,0,0.5,0.05,0.05,[0.85,0.85,0.92]);bx(0.05,0.03,0,0.42,0.051,0.06,[0.3,0.5,0.85]);}
 else{for(let i=0;i<6;i++)bx((hsh(x,z,70+i)-0.5)*0.4,0.005,(hsh(x,z,80+i)-0.5)*0.4,0.06,0.006,0.008,[0.55,0.55,0.6],i);}
 return true;}

/* furniture with an Act 3 look; same cell, same cover */
function act3Furn(B,g,x,z,f){const k=g.a3&&g.a3.k;if(!k)return false;const cx=x+0.5,cz=z+0.5,W=g.W,C=A3C,same=(ox,oz)=>g.furn[(z+oz)*W+x+ox]===f;
 const wd=()=>{for(const [ox,oz,a] of [[0,-1,0],[-1,0,Math.PI/2],[1,0,-Math.PI/2],[0,1,Math.PI]])if(isSolid(x+ox,z+oz))return a;return 0;};
 const K=a3Kit(B,cx,cz,0);
 if(f===1){
  if(k==='gala'){K.cyl(0,0,0,0.42,0.74,C.cloth);K.cyl(0,0.74,0,0.45,0.02,C.cloth);K.cyl(0,0.08,0,0.44,0.1,[0.88,0.85,0.78]);
   for(let i=0;i<6;i++){const a=i*Math.PI/3;K.b(Math.sin(a)*0.3,0.765,Math.cos(a)*0.3,0.11,0.006,0.11,C.wh,false,a);K.b(Math.sin(a)*0.3,0.77,Math.cos(a)*0.3,0.05,0.006,0.05,C.gold,false,a);
    K.b(Math.sin(a)*0.62,0.42,Math.cos(a)*0.62,0.26,0.04,0.26,C.gold,false,a);K.b(Math.sin(a)*0.62,0.45,Math.cos(a)*0.62,0.22,0.03,0.22,C.red,false,a);K.b(Math.sin(a)*0.74,0.62,Math.cos(a)*0.74,0.24,0.36,0.03,C.gold,false,a);}
   K.cyl(0,0.76,0,0.07,0.05,C.gold);const fc=[[1,0.55,0.7],[1,1,1],[0.95,0.3,0.45]];for(let i=0;i<6;i++){const a=i;K.b(Math.cos(a)*0.06,0.84,Math.sin(a)*0.06,0.07,0.06,0.07,fc[i%3]);}
   for(const a of [0.9,2.9,4.9]){K.cyl(Math.sin(a)*0.16,0.76,Math.cos(a)*0.16,0.015,0.12,C.wh);K.b(Math.sin(a)*0.16,0.9,Math.cos(a)*0.16,0.02,0.03,0.02,[1,0.8,0.4],true);}
   if(!g._a3c)g._a3c=0;if(g._a3c++<4)g.lights.push({x:cx,y:1.1,z:cz,r:2.4,c:[1,0.7,0.4]});return true;}
  /* sawhorse table with plans on it */
  for(const ox of [-0.36,0.36]){K.t(ox,0.33,-0.15,0,0.25,0,0.05,0.68,0.04,C.wood);K.t(ox,0.33,0.15,0,-0.25,0,0.05,0.68,0.04,C.wood);}
  K.b(0,0.68,0,0.98,0.035,0.62,C.ply);K.b(0.05,0.705,0,0.6,0.004,0.42,[0.7,0.82,0.95]);K.b(0.05,0.708,0,0.5,0.002,0.008,[1,1,1]);K.b(-0.3,0.73,0.15,0.3,0.05,0.05,[0.85,0.85,0.92],0.4);K.cyl(0.35,0.7,-0.18,0.04,0.09,C.wh);return true;}
 if(f===7){const a=k==='gala'?wd():0,KK=a3Kit(B,cx,cz,a);
  if(k==='gala'){KK.b(0,0.45,0,1.0,0.9,0.86,[0.22,0.12,0.08]);KK.b(0,0.92,0,1.02,0.04,0.9,C.black);KK.b(0,0.45,0.44,1.0,0.86,0.01,C.gold);
   for(let i=0;i<3;i++)KK.cyl(-0.3+i*0.3,0.94,-0.15,0.035,0.24,[[0.1,0.3,0.15],[0.9,0.85,0.7],[0.4,0.1,0.1]][i]);for(let i=0;i<3;i++)KK.cyl(-0.25+i*0.25,0.94,0.18,0.02,0.1,[1,0.92,0.7]);
   KK.cyl(0.32,0.94,0.15,0.08,0.12,C.silver);return true;}
  /* workbench */
  KK.b(0,0.84,0,1.0,0.06,0.9,C.ply);for(const ox of [-0.44,0.44])for(const oz of [-0.38,0.38])KK.b(ox,0.4,oz,0.06,0.8,0.06,C.dk);KK.b(0,0.2,0,0.96,0.03,0.82,C.wood);
  KK.b(-0.2,0.9,-0.1,0.3,0.06,0.18,[0.8,0.1,0.1]);KK.b(0.25,0.92,0.1,0.18,0.1,0.12,C.yel);KK.b(0.3,0.88,-0.25,0.35,0.02,0.04,C.silver,false,0.5);return true;}
 if(f===9){const a=wd(),KK=a3Kit(B,cx,cz,a);
  if(k==='gala'){KK.b(0,0.65,-0.05,0.86,1.3,0.5,[0.3,0.17,0.1]);for(let r=0;r<4;r++){KK.b(0,0.18+r*0.3,0.205,0.78,0.26,0.01,[0.36,0.21,0.12]);KK.b(0,0.25+r*0.3,0.215,0.14,0.03,0.02,C.gold);}KK.b(0,1.31,-0.05,0.9,0.03,0.54,C.dwood);return true;}
  if(k==='demo'){/* site generator */KK.b(0,0.42,-0.05,0.86,0.6,0.56,C.yel);KK.b(0,0.1,-0.05,0.92,0.12,0.6,C.dk);for(const ox of [-0.4,0.4])KK.b(ox,0.5,-0.05,0.04,0.86,0.62,C.dk);KK.b(0,0.9,-0.05,0.86,0.04,0.04,C.dk);
   KK.b(-0.2,0.45,0.23,0.3,0.24,0.01,[0.2,0.2,0.22]);KK.b(-0.26,0.5,0.236,0.04,0.04,0.01,[0.2,1,0.3],true);KK.b(0.22,0.78,-0.05,0.08,0.18,0.08,C.dk);KK.t(0.15,0.02,0.45,0.4,0,0,0.6,0.02,0.03,C.black);return true;}
  /* stacked I-beams along the run of F cells */
  const along=same(-1,0)||same(1,0),ry=along?0:Math.PI/2,KB=a3Kit(B,cx,cz,ry);for(const ox of [-0.3,0.3])KB.b(ox,0.04,0,0.14,0.08,0.86,C.wood);
  for(let j=0;j<3;j++)for(let i=0;i<(j===2?2:3);i++){const oz=-0.3+i*0.3+(j===2?0.15:0),y=0.08+j*0.2;KB.b(0,y+0.01,oz,1.0,0.02,0.2,C.prim);KB.b(0,y+0.1,oz,1.0,0.18,0.03,C.prim);KB.b(0,y+0.19,oz,1.0,0.02,0.2,C.prim);}return true;}
 if(f===19){const h=hsh(x,z,11),KK=a3Kit(B,cx,cz,(h-0.5)*0.3);
  if(k==='gala'){for(let l=0;l<2;l++)for(let i=0;i<2;i++){const ox=(i-0.5)*0.42,y=0.16+l*0.3;KK.b(ox,y,0,0.4,0.28,0.56,[0.55,0.38,0.2],false,l*0.1);KK.b(ox,y,0.282,0.3,0.1,0.01,C.gold,false,l*0.1);
    if(l===1)for(let q=0;q<4;q++)KK.cyl(ox+(q%2-0.5)*0.16,0.44,(Math.floor(q/2)-0.5)*0.2,0.03,0.1,[0.1,0.3,0.15]);}return true;}
  if(h<0.5){/* brick pallet */KK.b(0,0.06,0,0.9,0.12,0.8,C.wood);for(let l=0;l<5;l++)for(let i=0;i<3;i++)KK.b((i-1)*0.28,0.17+l*0.1,0,0.27,0.09,0.76,C.brick,false,l%2?0.02:0);return true;}
  KK.b(0,0.06,0,0.9,0.12,0.8,C.wood);for(let l=0;l<4;l++)for(let i=0;i<2;i++)KK.b((i-0.5)*0.42,0.17+l*0.11,(l%2?0.06:-0.06),0.4,0.1,0.62,l===3&&i?[0.75,0.7,0.58]:C.bag);return true;}
 return false;}

function drawAct3(B,g){const A3=g.a3;if(!A3||a3Of(g)!==A3.k)return;const r0=B.round;B.round=0;
 for(const p of A3.props)a3Prop(B,g,p);
 if(A3.carpet){const c=A3.carpet,L=c.z1-c.z0,zc=(c.z0+c.z1)/2;B.box(TRS(c.x,0.008,zc,0,1.7,0.012,L),[0.62,0.04,0.08]);for(const s of [-0.8,0.8])B.box(TRS(c.x+s,0.012,zc,0,0.07,0.012,L),A3C.gold);
  for(const s of [-1.05,1.05])for(let z=c.z0+0.5;z<c.z1-0.3;z+=1.5){B.box(TRS(c.x+s,0.03,z,0,0.16,0.06,0.16),A3C.gold);B.box(TRS(c.x+s,0.42,z,0,0.05,0.8,0.05),A3C.gold);B.box(TRS(c.x+s,0.85,z,0,0.1,0.07,0.1),A3C.gold);}
  for(const s of [-1.05,1.05])for(let z=c.z0+0.5;z+1.5<c.z1-0.3;z+=1.5)for(let k=0;k<6;k++){const t=(k+0.5)/6;B.box(TRS(c.x+s,0.78-Math.sin(t*Math.PI)*0.16,z+t*1.5,0,0.05,0.05,0.27),[0.6,0.05,0.1]);}}
 /* the top floor of Kade Tower: Miami forty floors down, all round the edge */
 if(A3.k==='roof'||A3.k==='stair'){const W=g.W,H=g.H,y=-14,cols=[[1,0.85,0.55],[1,0.95,0.85],[1,0.4,0.75],[0.4,0.9,1],[1,0.7,0.3]];
  for(let i=0;i<220;i++){const a=hsh(i,1,91),b=hsh(i,2,92),side=i%4;let x,z;const m=16;
   if(side===0){x=-m+a*(W+2*m);z=-m+b*m*0.9;}else if(side===1){x=-m+a*(W+2*m);z=H+0.1*m+b*m*0.9;}else if(side===2){x=-m+b*m*0.9;z=a*H;}else{x=W+0.1*m+b*m*0.9;z=a*H;}
   const big=hsh(i,3,93);if(big<0.25){B.box(TRS(x,y+0.6,z,0,1.6+big*3,1.2,1.4+big*2),[0.06,0.05,0.1]);continue;}
   B.box(TRS(x,y,z,0,0.18+big*0.3,0.1,0.18+big*0.3),cols[i%cols.length],true);}
  for(let i=0;i<14;i++){const zz=-10+i*((H+20)/13);B.box(TRS(-9,y,zz,0,0.25,0.05,2.6),[1,0.6,0.25],true);B.box(TRS(W+9,y,zz,0,0.25,0.05,2.6),[1,0.6,0.25],true);}}
 B.round=r0;}
