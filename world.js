'use strict';
// Legacy cell adapter. All state belongs to the caller; no DOM/GL or gameplay globals.
const WORLD=(()=>{
 const materials=(()=>{
  const freeze=o=>{for(const v of Object.values(o))if(v&&typeof v==='object')freeze(v);return Object.freeze(o);};
  // W3 MATERIALS section 8: resistance J/cm, layer thickness cm, energy J.
  const MAT=freeze({
   gyp:{res:25,hard:0,debris:0xe8e4dc,vfx:'gyp_plume',sfx:'board_thud'},
   timber:{res:30,hard:0,debris:0xb88a55,vfx:'splinter',sfx:'wood_crack'},
   pile:{res:80,hard:0,debris:0x8a6a45,vfx:'splinter',sfx:'wood_crack'},
   ply:{res:40,hard:0,debris:0xc49a6c,vfx:'splinter',sfx:'wood_crack'},
   particle:{res:45,hard:0,debris:0xb59a76,vfx:'chipdust',sfx:'board_thud'},
   plaster:{res:60,hard:0,debris:0xefe9df,vfx:'plaster_burst',sfx:'plaster'},
   stucco:{res:100,hard:0,debris:0x9a958c,vfx:'stucco_burst',sfx:'masonry_hit'},
   cmu:{res:345,hard:1,debris:0x8d8a84,vfx:'masonry_dust',sfx:'masonry_hit',spall:1},
   grout:{res:345,hard:1,debris:0x8d8a84,vfx:'masonry_dust',sfx:'masonry_hit',spall:1},
   brick:{res:400,hard:1,debris:0xa2513a,vfx:'brick_dust',sfx:'masonry_hit',spall:1},
   clay:{res:400,hard:1,debris:0xc0703f,vfx:'brick_dust',sfx:'tile_crack',spall:1},
   concrete:{res:900,hard:1,debris:0xa19d95,vfx:'concrete_dust',sfx:'concrete_hit',spall:1},
   glass:{res:60,hard:0,debris:0xcfe6e8,vfx:'glass_shatter',sfx:'glass_break',pane:1},
   glass_lam:{res:300,hard:0,debris:0,vfx:'glass_craze',sfx:'glass_crunch'},
   steel:{res:1500,hard:1,debris:0,vfx:'spark',sfx:'ricochet_metal'},
   alu:{res:600,hard:1,debris:0xc8ccd0,vfx:'spark',sfx:'metal_hit'},
   grp:{res:80,hard:0,debris:0xf0f0ea,vfx:'fibre',sfx:'hull_hit'},
   foam:{res:3,hard:0,debris:0,vfx:'stuffing',sfx:'cloth'},
   mattress:{res:5,hard:0,debris:0,vfx:'stuffing',sfx:'cloth'},
   insul:{res:2,hard:0},void:{res:0,hard:0}
  });
  const BUILD=freeze({
   stud_wood_gyp:{layers:[['gyp',1.27],['void',8.9],['gyp',1.27]],alt:{p:0.094,layers:[['gyp',1.27],['timber',8.9],['gyp',1.27]]},cellHp:600},
   stud_steel_gyp:{layers:[['gyp',1.59],['void',9.2],['gyp',1.59]],cellHp:700},
   stud_steel_gyp2:{layers:[['gyp',3.18],['insul',9.2],['gyp',3.18]],cellHp:1400},
   particle_divider:{layers:[['particle',1.9]],cellHp:400},
   plaster_lath:{layers:[['plaster',2],['timber',0.6],['void',9],['timber',0.6],['plaster',2]],alt:{p:0.094,layers:[['plaster',2],['timber',10.2],['plaster',2]]},cellHp:1500},
   clay_tile_4:{layers:[['plaster',1.5],['clay',1],['void',7.6],['clay',1],['plaster',1.5]],coreE:800,cellHp:8000},
   cbs_ext:{layers:[['stucco',1.9],['cmu',3.2],['void',13],['cmu',3.2],['plaster',1.3]],alt:{p:0.19,layers:[['stucco',1.9],['cmu',19.4],['plaster',1.3]]},coreE:1600,cellHp:35000},
   cmu_hollow:{layers:[['plaster',1.3],['cmu',3.2],['void',13],['cmu',3.2],['plaster',1.3]],alt:{p:0.19,layers:[['plaster',1.3],['cmu',19.4],['plaster',1.3]]},coreE:1600,cellHp:35000},
   cmu_filled:{layers:[['plaster',1.3],['grout',19.4],['plaster',1.3]],coreE:1600,cellHp:70000},
   brick_1w:{layers:[['brick',9]],coreE:1600,cellHp:52000},
   brick_2w:{layers:[['brick',21.5]],coreE:1600,cellHp:105000},
   brick_cmu_ext:{layers:[['brick',9],['void',2.5],['cmu',3.2],['void',13],['cmu',3.2]],alt:{p:0.19,layers:[['brick',9],['void',2.5],['cmu',19.4]]},coreE:1600,cellHp:90000},
   rc_wall_20:{layers:[['plaster',1.3],['concrete',20],['plaster',1.3]],coreE:2700,cellHp:210000},
   rc_column_40:{layers:[['concrete',40]],cellHp:Infinity},
   glass_annealed_6:{layers:[['glass',0.6]],cellHp:1,pane:1},
   glass_tempered_6:{layers:[['glass',0.6]],cellHp:1,pane:1,tempered:1},
   glass_lam_windshield:{layers:[['glass_lam',0.76]],cellHp:1500},
   glass_block:{layers:[['glass',0.8],['void',8.2],['glass',0.8]],cellHp:2000},
   glass_studio:{layers:[['glass_lam',1.2],['void',20],['glass_lam',1]],cellHp:6000},
   door_hollow:{layers:[['ply',0.3],['void',2.9],['ply',0.3]],cellHp:300,lockHp:800},
   door_solid:{layers:[['ply',0.3],['particle',3.85],['ply',0.3]],cellHp:1500,lockHp:3000},
   door_metal:{layers:[['steel',0.12],['void',4.2],['steel',0.12]],cellHp:4000,lockHp:6000},
   door_vault:{layers:[['steel',0.95],['void',4],['steel',0.95]],cellHp:Infinity,lockHp:Infinity},
   car_door:{layers:[['steel',0.08],['void',10],['steel',0.08]],alt:{p:0.15,layers:[['steel',0.08],['steel',0.3],['void',10],['steel',0.08]]},cellHp:3000},
   car_engine:{layers:[['steel',6]],cellHp:Infinity},
   steel_3mm:{layers:[['steel',0.32]],cellHp:Infinity},
   steel_10mm:{layers:[['steel',0.95]],cellHp:Infinity},
   corrugated:{layers:[['steel',0.05]],cellHp:800},
   alu_bulkhead:{layers:[['alu',0.6],['insul',5],['ply',1.2]],cellHp:5000},
   joinery_ply:{layers:[['ply',1.9],['insul',5],['ply',1.2]],cellHp:1200},
   grp_hull:{layers:[['grp',1.5]],cellHp:2500},
   timber_pile:{layers:[['pile',30]],cellHp:Infinity},
   dock_box:{layers:[['grp',0.5],['void',60],['grp',0.5]],cellHp:800},
   acoustic_double:{layers:[['gyp',3.18],['insul',9],['void',5],['insul',9],['gyp',3.18]],cellHp:3000},
   sofa:{layers:[['foam',60],['timber',2]],cellHp:1500},
   mattress:{layers:[['mattress',22]],cellHp:800},
   counter_cmu:{layers:[['ply',0.6],['cmu',3.2],['void',3.6],['cmu',3.2]],coreE:1600,cellHp:20000},
   counter_cabinet:{layers:[['ply',1.9],['void',55],['ply',1.9]],cellHp:1200}
  });
  const OPTICS=freeze({glass_annealed_6:'clear',glass_tempered_6:'clear',glass_lam_windshield:'clear',glass_studio:'clear',glass_block:'translucent'});
  const COVERAGE=freeze({full:{},chest:{nominalHeight:1.2},waist:{nominalHeight:0.9},rail:{},glass:{}});
  const own=(o,k)=>Object.hasOwn(o,k);
  function build(id){
   if(typeof id!=='string'||!own(BUILD,id))throw new RangeError(`Unknown construction ${String(id)}; layout 'glass' maps to glass_tempered_6, 'open' has no surface`);
   return BUILD[id];
  }
  const thickness=layers=>Math.round(layers.reduce((sum,l)=>sum+l[1],0)*1e6)/1e6;
  function describe(id){
   const b=build(id),copy=layers=>layers.map(l=>l.slice());
   return{id,layers:copy(b.layers),thicknessCm:thickness(b.layers),alt:b.alt?{p:b.alt.p,layers:copy(b.alt.layers),thicknessCm:thickness(b.alt.layers)}:null,
    coreE:b.coreE||0,cellHp:Number.isFinite(b.cellHp)?b.cellHp:null,indestructible:b.cellHp===Infinity,
    lockHp:Number.isFinite(b.lockHp)?b.lockHp:null,lockIndestructible:b.lockHp===Infinity,
    pane:!!b.pane,tempered:!!b.tempered,optics:OPTICS[id]||'opaque'};
  }
  // Caller supplies a reproducible per-hit or surface-local sample; no RNG policy here.
  function selectLayers(id,u){
   const b=build(id);if(!Number.isFinite(u)||u<0||u>=1)throw new RangeError('Layer sample u must be finite in [0,1)');
   return b.alt&&u<b.alt.p?b.alt.layers:b.layers;
  }
  function validateSurface(s){
   if(!s||typeof s!=='object'||Array.isArray(s))throw new TypeError('Surface must be a record');
   const fields=['kind','build','cov','h'];
   for(const k of Reflect.ownKeys(s))if(!fields.includes(k))throw new TypeError(`Unknown surface field ${String(k)}`);
   for(const k of fields)if(!own(s,k))throw new TypeError(`Missing surface field ${k}`);
   if(!['wall','window','door','prop'].includes(s.kind))throw new RangeError('Surface kind must be wall, window, door or prop');
   build(s.build);
   if(typeof s.cov!=='string'||!own(COVERAGE,s.cov))throw new RangeError('Surface cov must be full, chest, waist, rail or glass');
   if(!Number.isFinite(s.h)||s.h<=0)throw new RangeError('Surface h must be positive finite metres');
   const optics=OPTICS[s.build]||'opaque';
   if(optics==='opaque'&&s.cov==='glass')throw new RangeError('Opaque construction cannot use glass coverage');
   if(s.build==='glass_block'&&s.cov!=='full')throw new RangeError('glass_block requires full coverage');
   if((s.kind==='door'||s.kind==='window')&&s.cov!=='full'&&!(optics==='clear'&&s.cov==='glass'))throw new RangeError('Door/window coverage must be full, or glass for clear glazing');
   return Object.freeze({kind:s.kind,build:s.build,cov:s.cov,h:s.h});
  }
  function blocksSight(surface,stance='standing'){
   const s=validateSurface(surface);
   if(stance!=='standing'&&stance!=='crouched')throw new RangeError('Sight stance must be standing or crouched');
   if(s.kind==='prop'||OPTICS[s.build]==='clear'||s.cov==='rail'||s.cov==='waist'||s.cov==='glass')return false;
   return s.cov==='full'||(s.cov==='chest'&&stance==='crouched');
  }
  return Object.freeze({version:1,MAT,BUILD,OPTICS,COVERAGE,build,describe,selectLayers,validateSurface,blocksSight});
 })();
 const clamp=(v,a,b)=>v<a?a:v>b?b:v;
 const isW=c=>c==='#'||c===' ';
 function hsh(x,z,k,idx){
  if(!Number.isInteger(idx))throw new TypeError('WORLD.hsh requires an integer level seed');
  let h=(x*374761393+z*668265263+k*2246822519+idx*326648991)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;
 }
 function buildGrid(def,idx,{paletteSize=6}={}){
  if(!Number.isInteger(idx))throw new TypeError('WORLD.buildGrid requires an integer level seed');
  if(!Number.isInteger(paletteSize)||paletteSize<1)throw new RangeError('WORLD.buildGrid requires a positive palette size');
  let rows=def.map.slice();const W0=Math.max(...rows.map(r=>r.length));
  rows=rows.map(r=>' '+r.padEnd(W0,' ')+' ');const W=W0+2;rows.unshift(' '.repeat(W));rows.push(' '.repeat(W));const H=rows.length;
  const g={def,W,H,rows,solid:new Uint8Array(W*H),furn:new Uint8Array(W*H),floorT:new Int8Array(W*H).fill(-1),wallT:new Int8Array(W*H),
   rug:new Uint8Array(W*H),wh:new Float32Array(W*H),topT:new Int8Array(W*H),tint:new Int8Array(W*H).fill(-1),glow:new Uint8Array(W*H),doorSpecs:[]};
  const ch=(x,z)=>(x<0||z<0||x>=W||z>=H)?' ':rows[z][x];
  for(let z=0;z<H;z++)for(let x=0;x<W;x++){
   const c=ch(x,z),lg=def.legend&&def.legend[c],ii=z*W+x;
   if(lg){
    if(lg.w){g.solid[ii]=1;g.wallT[ii]=lg.w;g.wh[ii]=lg.h==='rand'?1.5+hsh(Math.floor(x/3),z>>1,9,idx)*2:(lg.h!==undefined?lg.h:WALL_H);g.topT[ii]=lg.top||0;if(lg.tint)g.tint[ii]=Math.floor(hsh(Math.floor(x/3),0,4,idx)*paletteSize);if(lg.glow)g.glow[ii]=1;if(lg.water)g.glow[ii]=2;continue;}
    g.floorT[ii]=(def.floorFn&&def.floorFn(x,z,W,H))||lg.f||def.floor||1;if(lg.furn)g.furn[ii]=lg.furn;if(lg.rug)g.rug[ii]=1;continue;
   }
   if(isW(c)){g.solid[ii]=1;g.wallT[ii]=c==='#'?def.wall:6;continue;}
   let ft=FLOORCH[c];if(ft===undefined&&def.floor)ft=def.floor;if(ft===undefined){for(const [ox,oz] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-2,0],[2,0]]){const f=FLOORCH[ch(x+ox,z+oz)];if(f!==undefined){ft=f;break;}}if(ft===undefined)ft=1;}
   g.floorT[ii]=ft;if(c==='r')g.rug[ii]=1;
   if(FURN[c]){g.furn[ii]=FURN[c];continue;}
   if(c==='D'){const sx=isW(ch(x-1,z))&&isW(ch(x+1,z));g.doorSpecs.push(sx?{hx:x,hz:z+0.5,base:0}:{hx:x+0.5,hz:z,base:Math.PI/2});}
  }
  return g;
 }
 function isSolid(g,cx,cz){if(!g||cx<0||cz<0||cx>=g.W||cz>=g.H)return true;return g.solid[cz*g.W+cx]===1;}
 function isBlock(g,cx,cz){if(!g||cx<0||cz<0||cx>=g.W||cz>=g.H)return true;const i=cz*g.W+cx;return g.solid[i]===1||g.furn[i]>0;}
 function isCover(g,cx,cz){if(!g||cx<0||cz<0||cx>=g.W||cz>=g.H)return true;const i=cz*g.W+cx;return g.solid[i]===1||COVER[g.furn[i]]===1;}
 // wh=0 is the legacy default height, not a zero-height wall.
 function rayBlock(g,cx,cz,cover){if(!g||cx<0||cz<0||cx>=g.W||cz>=g.H)return true;const i=cz*g.W+cx;return(g.solid[i]===1&&(g.wh[i]||WALL_H)>=0.6)||(!!cover&&COVER[g.furn[i]]===1);}
 function doorHit(g,ax,az,bx,bz){
  const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz);if(len<1e-12)return null;
  let nearest=null;
  for(const door of g.doors||[]){
   const angle=door.base+door.th,ux=Math.cos(angle),uz=Math.sin(angle),vx=-uz,vz=ux;
   const px=ax-door.hx,pz=az-door.hz;
   let lo=0,hi=1,nx=-dx/len,nz=-dz/len,miss=false;
   for(const [p,d,min,max,ex,ez] of [[px*ux+pz*uz,dx*ux+dz*uz,0,0.98,ux,uz],[px*vx+pz*vz,dx*vx+dz*vz,-0.035,0.035,vx,vz]]){
    if(Math.abs(d)<1e-12){if(p<min-1e-12||p>max+1e-12){miss=true;break;}continue;}
    const t0=(min-p)/d,t1=(max-p)/d,enter=Math.min(t0,t1),exit=Math.max(t0,t1);
    if(enter>lo){lo=enter;nx=d>0?-ex:ex;nz=d>0?-ez:ez;}
    hi=Math.min(hi,exit);if(lo>hi){miss=true;break;}
   }
   if(!miss&&(!nearest||lo<nearest.t))nearest={x:ax+dx*lo,z:az+dz*lo,nx,nz,t:lo,d:len*lo,door};
  }
  return nearest;
 }
 function rayLen(g,x,z,dx,dz,max){
  let len=max;for(let s=0.25;s<max;s+=0.15){if(rayBlock(g,Math.floor(x+dx*s),Math.floor(z+dz*s),false)){len=s;break;}}
  const hit=doorHit(g,x,z,x+dx*len,z+dz*len);return hit?hit.d:len;
 }
 function doorEnd(d){const a=d.base+d.th;return[d.hx+Math.cos(a)*0.98,d.hz+Math.sin(a)*0.98];}
 function segDist(px,pz,ax,az,bx,bz){const sx=bx-ax,sz=bz-az;let t=((px-ax)*sx+(pz-az)*sz)/(sx*sx+sz*sz);t=clamp(t,0,1);return Math.hypot(px-ax-sx*t,pz-az-sz*t);}
 function segInt(ax,az,bx,bz,cx,cz,dx,dz){const d=(bx-ax)*(dz-cz)-(bz-az)*(dx-cx);if(Math.abs(d)<1e-9)return false;const t=((cx-ax)*(dz-cz)-(cz-az)*(dx-cx))/d,u=((cx-ax)*(bz-az)-(cz-az)*(bx-ax))/d;return t>0&&t<1&&u>0&&u<1;}
 function los(g,x0,z0,x1,z1){const dx=x1-x0,dz=z1-z0,d=Math.hypot(dx,dz),n=Math.ceil(d/0.15);for(let i=1;i<n;i++){const t=i/n;if(rayBlock(g,Math.floor(x0+dx*t),Math.floor(z0+dz*t),false))return false;}
  return !doorHit(g,x0,z0,x1,z1);}
 function rayCells(g,x,z,dx,dz,max,cover){let px=x,pz=z;for(let s=0;s<max;s+=0.05){const nx=x+dx*s,nz=z+dz*s;const cx=Math.floor(nx),cz=Math.floor(nz);
  if(rayBlock(g,cx,cz,cover)){const ocx=Math.floor(px),ocz=Math.floor(pz);if(cx!==ocx){const wx=cx>ocx?cx:ocx;return{x:wx,z:pz,nx:cx>ocx?-1:1,nz:0,d:s};}else{const wz=cz>ocz?cz:ocz;return{x:px,z:wz,nx:0,nz:cz>ocz?-1:1,d:s};}}px=nx;pz=nz;}return null;}
 function rayWall(g,x,z,dx,dz,max,cover){
  const wall=rayCells(g,x,z,dx,dz,max,cover),door=doorHit(g,x,z,x+dx*max,z+dz*max);
  return door&&(!wall||door.d<Math.hypot(wall.x-x,wall.z-z))?door:wall;
 }
 function collideGrid(g,c){const r=c.r;for(let it=0;it<2;it++){const x0=Math.floor(c.x-r),x1=Math.floor(c.x+r),z0=Math.floor(c.z-r),z1=Math.floor(c.z+r);
  for(let cz=z0;cz<=z1;cz++)for(let cx=x0;cx<=x1;cx++){if(!isBlock(g,cx,cz))continue;const nx=clamp(c.x,cx,cx+1),nz=clamp(c.z,cz,cz+1);const dx=c.x-nx,dz=c.z-nz,d2=dx*dx+dz*dz;
   if(d2<r*r){const d=Math.sqrt(d2);if(d>1e-6){c.x+=dx/d*(r-d);c.z+=dz/d*(r-d);}else{c.x+=(c.x-(cx+0.5))>0?r:-r;}}}}}
 // Doors are pushed open by movement; this corridor tests static cell obstacles only.
 function moveClear(g,ax,az,bx,bz,r=0){
  if(!Number.isFinite(r)||r<0)throw new RangeError('WORLD.cell.moveClear requires a nonnegative radius');
  if(![ax,az,bx,bz].every(Number.isFinite))throw new TypeError('WORLD.cell.moveClear requires finite coordinates');
  const nonzero=Math.hypot(bx-ax,bz-az)>1e-12;
  const overlaps=d=>d<r-1e-9||d<=1e-12;
  for(let z=Math.floor(Math.min(az,bz)-r);z<=Math.floor(Math.max(az,bz)+r);z++)for(let x=Math.floor(Math.min(ax,bx)-r);x<=Math.floor(Math.max(ax,bx)+r);x++){
   if(!isBlock(g,x,z))continue;
   const pointDist=(px,pz)=>Math.hypot(px-clamp(px,x,x+1),pz-clamp(pz,z,z+1));
   if(overlaps(pointDist(ax,az))||overlaps(pointDist(bx,bz)))return false;
   if(nonzero){
    const corners=[[x,z],[x+1,z],[x+1,z+1],[x,z+1]];
    for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4];
     if(segInt(ax,az,bx,bz,...a,...b)||overlaps(segDist(...a,ax,az,bx,bz)))return false;}
   }
  }
  return true;
 }
 function collideDoors(g,c,isP){let sounds=0;for(const d of g.doors){const e=doorEnd(d),sx=e[0]-d.hx,sz=e[1]-d.hz;let t=((c.x-d.hx)*sx+(c.z-d.hz)*sz)/(sx*sx+sz*sz);t=clamp(t,0,1);
  const px=d.hx+sx*t,pz=d.hz+sz*t,dx=c.x-px,dz=c.z-pz,dist=Math.hypot(dx,dz),rr=c.r+0.06;if(dist>=rr||dist<1e-6)continue;
  const side=Math.sign(sx*(c.z-d.hz)-sz*(c.x-d.hx))||1;const nx=dx/dist,nz=dz/dist,pen=rr-dist;c.x+=nx*pen;c.z+=nz*pen;if(t<0.1)continue;
  const vn=Math.max(0,-(c.vx*nx+c.vz*nz));const target=vn/Math.max(t,0.35)*1.7+pen*25;
  if(Math.abs(d.w)<target||Math.sign(d.w)!==-side){if(isP&&vn>2&&Math.abs(d.w)<2)sounds++;d.w=-side*target;d.pusher=isP?'p':'e';}}return sounds;}
 function bfs(g,f,sx,sz){const W=g.W;f.fill(-1);if(isBlock(g,sx,sz))return;const q=[sz*W+sx];f[q[0]]=0;let h=0;
  while(h<q.length){const i=q[h++];const d=f[i];for(const o of [1,-1,W,-W]){const j=i+o;if(j<0||j>=f.length||g.solid[j]||g.furn[j]||f[j]>=0)continue;f[j]=d+1;q.push(j);}}}
 const freeform=(()=>{
  const EPS=1e-9,SKIN=1e-4,MOVE_H=1,geometryVersions=new WeakMap(),breachAxes=new WeakMap();
  const NO_DAMAGE=Object.freeze({removed:false,cells:Object.freeze([]),dirty:false,nav:Object.freeze([]),portal:null});
  const NO_BREACH=Object.freeze({breached:false});
  const finite=(v,name)=>{if(!Number.isFinite(v))throw new TypeError(`${name} must be finite`);return v;};
  function record(o,keys,name){
   if(!o||typeof o!=='object'||Array.isArray(o))throw new TypeError(`${name} must be a record`);
   for(const k of Reflect.ownKeys(o))if(!keys.includes(k))throw new TypeError(`Unknown ${name} field ${String(k)}`);
   for(const k of keys)if(k in o&&!Object.prototype.hasOwnProperty.call(o,k))throw new TypeError(`Inherited ${name} field ${k}`);
  }
  const point=(p,name)=>{if(!Array.isArray(p)||p.length!==2)throw new TypeError(`${name} must be [x,z]`);return[finite(p[0],name),finite(p[1],name)];};
  function copyData(value,seen=new Set()){
   if(value===null||typeof value==='string'||typeof value==='boolean')return value;
   if(typeof value==='number')return finite(value,'stage metadata');
   if(!value||typeof value!=='object'||seen.has(value))throw new TypeError('Stage metadata must be acyclic data');
   if(!Array.isArray(value)&&Object.prototype.toString.call(value)!=='[object Object]')throw new TypeError('Stage metadata must be JSON-like data');
   seen.add(value);const out=Array.isArray(value)?value.map(v=>copyData(v,seen)):Object.fromEntries(Object.keys(value).map(k=>[k,copyData(value[k],seen)]));seen.delete(value);return out;
  }
  const cross=(ax,az,bx,bz)=>ax*bz-az*bx;
  function onSegment(x,z,a,b){return Math.abs(cross(x-a[0],z-a[1],b[0]-a[0],b[1]-a[1]))<EPS&&x>=Math.min(a[0],b[0])-EPS&&x<=Math.max(a[0],b[0])+EPS&&z>=Math.min(a[1],b[1])-EPS&&z<=Math.max(a[1],b[1])+EPS;}
  function inside(poly,x,z,boundary=true){
   let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[j],b=poly[i];if(boundary&&onSegment(x,z,a,b))return true;
    if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])yes=!yes;
   }return yes;
  }
  function polygon(p,name,convex=false){
   if(!Array.isArray(p)||p.length<3)throw new TypeError(`${name} needs at least three points`);
   const out=p.map(q=>point(q,name));let area=0,turn=0;
   for(let i=0;i<out.length;i++){
    const a=out[i],b=out[(i+1)%out.length],c=out[(i+2)%out.length];
    if(Math.hypot(b[0]-a[0],b[1]-a[1])<EPS)throw new RangeError(`${name} has a zero edge`);
    area+=cross(a[0],a[1],b[0],b[1]);
    const t=cross(b[0]-a[0],b[1]-a[1],c[0]-b[0],c[1]-b[1]);
    if(convex&&Math.abs(t)>EPS){if(turn&&turn*Math.sign(t)<0)throw new RangeError(`${name} must be convex`);turn=Math.sign(t);}
    for(let j=i+2;j<out.length;j++){
     if(i===0&&j===out.length-1)continue;
     const d=out[j],e=out[(j+1)%out.length];
     if(segInt(...a,...b,...d,...e)||onSegment(...d,a,b)||onSegment(...e,a,b)||onSegment(...a,d,e)||onSegment(...b,d,e))throw new RangeError(`${name} must be simple`);
    }
   }
   if(Math.abs(area)<1e-12)throw new RangeError(`${name} has no area`);
   return out.map(q=>Object.freeze(q));
  }
  function box(ax,az,bx,bz,half){
   const len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len,nx=-uz,nz=ux;
   return[[ax-nx*half,az-nz*half],[bx-nx*half,bz-nz*half],[bx+nx*half,bz+nz*half],[ax+nx*half,az+nz*half]];
  }
  function clip(poly,ax,az,bx,bz){
   let area=0;for(let i=0;i<poly.length;i++)area+=cross(...poly[i],...poly[(i+1)%poly.length]);
   const sign=area>0?1:-1,dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz);
   let t0=0,t1=1,nx=len?-dx/len:0,nz=len?-dz/len:0;
   for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],ex=b[0]-a[0],ez=b[1]-a[1];
    const p=sign*cross(ex,ez,ax-a[0],az-a[1]),d=sign*cross(ex,ez,dx,dz);
    if(Math.abs(d)<EPS){if(p<-EPS)return null;continue;}
    const t=-p/d;
    if(d>0){if(t>t0||t0===0&&Math.abs(t)<=EPS&&Math.abs(p)<=EPS){t0=Math.max(t0,t);const l=Math.hypot(ex,ez);nx=sign*ez/l;nz=-sign*ex/l;}}
    else t1=Math.min(t1,t);
    if(t0>t1+EPS)return null;
   }
   return t1<0||t0>1?null:{t0:Math.max(0,t0),t1:Math.min(1,t1),nx,nz};
  }
  const aabb=poly=>[Math.min(...poly.map(p=>p[0])),Math.min(...poly.map(p=>p[1])),Math.max(...poly.map(p=>p[0])),Math.max(...poly.map(p=>p[1]))];
  function addBucket(st,type,index,poly){
   const [x0,z0,x1,z1]=aabb(poly);
   for(let z=Math.floor(z0/2);z<=Math.floor(z1/2);z++)for(let x=Math.floor(x0/2);x<=Math.floor(x1/2);x++){
    const key=`${x},${z}`;let items=st.buckets.get(key);if(!items)st.buckets.set(key,items=[]);items.push([type,index]);
   }
  }
  function candidates(st,ax,az,bx,bz,r=0){
   const result=[],seen=new Set();
   for(let z=Math.floor((Math.min(az,bz)-r)/2);z<=Math.floor((Math.max(az,bz)+r)/2);z++)for(let x=Math.floor((Math.min(ax,bx)-r)/2);x<=Math.floor((Math.max(ax,bx)+r)/2);x++){
    for(const item of st.buckets.get(`${x},${z}`)||[]){const key=`${item[0]}:${item[1]}`;if(!seen.has(key)){seen.add(key);result.push(item);}}
   }return result;
  }
  function base(id,bounds,combat,policy){
   return{v:3,policy,id,bounds:Object.freeze(bounds.slice()),combat,ground:[],panels:[],cells:[],doors:[],props:[],buckets:new Map(),rooms:[],openings:[],portals:[],spawns:[]};
  }
  function addPanel(st,ref,ax,az,bx,bz,half,kind,build,cov,spans,polyOverride){
   const len=Math.hypot(bx-ax,bz-az),poly=polyOverride||box(ax,az,bx,bz,half);
   const p={ref,ax,az,bx,bz,ux:(bx-ax)/len,uz:(bz-az)/len,nx:-(bz-az)/len,nz:(bx-ax)/len,half,kind,build,cov,
    c0:st.cells.length,c1:st.cells.length,poly:Object.freeze(poly.map(q=>Object.freeze(q.slice())))};
   const index=st.panels.length;
   for(const [y0,y1] of spans)for(let y=y0;y<y1-EPS;y+=.5)st.cells.push({panel:index,y0:y,y1:Math.min(y+.5,y1),hp:materials.build(build).cellHp,active:true});
   p.c1=st.cells.length;st.panels.push(Object.freeze(p));addBucket(st,'panel',index,poly);return index;
  }
  function pathPieces(path,closed){
   if(Array.isArray(path)){
    if(path.length<2)throw new RangeError('Wall path needs two points');
    const pts=path.map(p=>point(p,'wall path'));if(Math.hypot(pts[0][0]-pts.at(-1)[0],pts[0][1]-pts.at(-1)[1])<EPS)throw new RangeError('Use closed with a non-repeated path endpoint');if(closed)pts.push(pts[0].slice());
    let s=0;return pts.slice(1).map((b,i)=>{const a=pts[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<EPS)throw new RangeError('Wall path has a zero edge');const piece={a,b,s0:s,s1:s+len};s+=len;return piece;});
   }
   record(path,['arc'],'path');
   if(!Array.isArray(path.arc)||path.arc.length!==5)throw new TypeError('Arc needs [cx,cz,r,a0,a1]');
   if(closed)throw new RangeError('Arc cannot be closed');
   const [cx,cz,r,a0,a1]=path.arc.map(v=>finite(v,'arc'));
   if(r<.5||a0===a1||Math.abs(a1-a0)>=Math.PI*2-EPS)throw new RangeError('Arc radius/angle range is invalid');
   const len=Math.abs(a1-a0)*r,n=Math.ceil(len/.5),out=[];
   for(let i=0;i<n;i++){const a=a0+(a1-a0)*i/n,b=a0+(a1-a0)*(i+1)/n;out.push({a:[cx+Math.cos(a)*r,cz+Math.sin(a)*r],b:[cx+Math.cos(b)*r,cz+Math.sin(b)*r],s0:len*i/n,s1:len*(i+1)/n});}return out;
  }
  function jointShapes(pieces,closed,half){
   const normals=pieces.map(p=>{const dx=p.b[0]-p.a[0],dz=p.b[1]-p.a[1],l=Math.hypot(dx,dz);return[-dz/l,dx/l];});
   const join=(a,b)=>{const dot=a[0]*b[0]+a[1]*b[1];if(dot<Math.cos(Math.PI*.75)-EPS)throw new RangeError('Wall turn exceeds 135 degrees');return[(a[0]+b[0])/(1+dot),(a[1]+b[1])/(1+dot)];};
   const vectors=[closed?join(normals.at(-1),normals[0]):normals[0]];
   for(let i=1;i<pieces.length;i++)vectors.push(join(normals[i-1],normals[i]));
   vectors.push(closed?vectors[0]:normals.at(-1));
   const section=(a,v)=>[[a[0]-v[0]*half,a[1]-v[1]*half],[a[0]+v[0]*half,a[1]+v[1]*half]];
   const sections=pieces.map((p,i)=>section(p.a,vectors[i]));sections.push(closed?sections[0]:section(pieces.at(-1).b,vectors.at(-1)));
   return pieces.map((p,i)=>({poly:polygon([sections[i][0],sections[i+1][0],sections[i+1][1],sections[i][1]],'mitred wall piece',true),
    inset0:half*Math.abs(vectors[i][0]*(-normals[i][1])+vectors[i][1]*normals[i][0]),
    inset1:half*Math.abs(vectors[i+1][0]*(-normals[i][1])+vectors[i+1][1]*normals[i][0])}));
  }
  function bandPoly(poly,piece,left,right){
   const dx=piece.b[0]-piece.a[0],dz=piece.b[1]-piece.a[1],len=Math.hypot(dx,dz),scale=(piece.s1-piece.s0)/len,ux=dx/len,uz=dz/len;
   const cut=(input,t,sign)=>{
    const distance=p=>sign*((p[0]-piece.a[0])*ux+(p[1]-piece.a[1])*uz-(t-piece.s0)/scale),out=[];
    for(let i=0;i<input.length;i++){const a=input[i],b=input[(i+1)%input.length],da=distance(a),db=distance(b),ina=da>=0,inb=db>=0;
     if(ina)out.push(a);if(ina!==inb){const u=da/(da-db);out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]);}
    }return out;
   };
   let out=poly;
   if(left>piece.s0+EPS)out=cut(out,left,1);
   if(right<piece.s1-EPS)out=cut(out,right,-1);
   out=out.filter((p,i)=>Math.hypot(p[0]-out[(i+out.length-1)%out.length][0],p[1]-out[(i+out.length-1)%out.length][1])>=EPS);
   let area=0;for(let i=0;i<out.length;i++)area+=cross(...out[i],...out[(i+1)%out.length]);
   return Math.abs(area)<1e-12?null:polygon(out,'wall panel',true);
  }
  function compile(stage){
   record(stage,['id','bounds','combat','ground','walls','props','rooms','portals','spawns'],'stage');
   const ids=new Set(),id=v=>{if(typeof v!=='string'||!v.length||v.includes(':')||ids.has(v))throw new RangeError(`Invalid/duplicate geometry id ${String(v)}`);ids.add(v);return v;};
   id(stage.id);if(!Array.isArray(stage.bounds)||stage.bounds.length!==4)throw new TypeError('Stage bounds need [x0,z0,x1,z1]');
   const bounds=stage.bounds.map(v=>finite(v,'bounds'));if(bounds[2]<=bounds[0]||bounds[3]<=bounds[1])throw new RangeError('Stage bounds have no area');
   if(typeof stage.combat!=='boolean')throw new TypeError('Stage combat must be explicit boolean');
   for(const k of ['ground','walls','props'])if(!Array.isArray(stage[k]))throw new TypeError(`Stage ${k} must be an array`);
   for(const k of ['rooms','spawns'])if(stage[k]!==undefined&&!Array.isArray(stage[k]))throw new TypeError(`Stage ${k} must be an array`);
   const st=base(stage.id,bounds,stage.combat,'v2'),wallEnds=[];
   const within=p=>{if(p[0]<bounds[0]-EPS||p[1]<bounds[1]-EPS||p[0]>bounds[2]+EPS||p[1]>bounds[3]+EPS)throw new RangeError('Geometry outside stage bounds');};
   const surface=(kind,o)=>{const s=materials.validateSurface({kind,build:o.build,cov:o.cov,h:o.h});if(kind==='wall'&&(s.cov==='full'&&s.h<=1.6||s.cov==='chest'&&(s.h<=1.1||s.h>=1.6)))throw new RangeError('Full/chest coverage height is inconsistent');return s;};
   for(const g of stage.ground||[]){
    record(g,['id','poly','y','surf'],'ground');id(g.id);const poly=polygon(g.poly,'ground');poly.forEach(within);
    if(typeof g.surf!=='string')throw new TypeError('Ground surf must be string');
    st.ground.push(Object.freeze({id:g.id,poly:Object.freeze(poly),y:finite(g.y,'ground y'),surf:g.surf}));
   }
   for(const w of stage.walls||[]){
    record(w,['id','path','closed','build','cov','h','surf','open'],'wall');id(w.id);const s=surface('wall',w),pieces=pathPieces(w.path,w.closed);
    if(w.closed!==undefined&&typeof w.closed!=='boolean')throw new TypeError('Wall closed must be boolean');
    const L=pieces.at(-1).s1,half=materials.describe(w.build).thicknessCm/200,shapes=jointShapes(pieces,!!w.closed,half),fillShapes=new Map();
    if(!w.closed)for(const [p,at] of [[pieces[0],'a'],[pieces.at(-1),'b']]){
     const v=[p.b[0]-p.a[0],p.b[1]-p.a[1]],len=Math.hypot(...v),a=p[at];
     for(const end of wallEnds)if(Math.hypot(a[0]-end.a[0],a[1]-end.a[1])<1e-6&&Math.abs((v[0]*end.v[0]+v[1]*end.v[1])/len)<Math.cos(Math.PI/180))throw new RangeError('Shared wall corner must be one path');
     wallEnds.push({a,v:v.map(q=>q/len)});
    }
    const opens=(w.open||[]).map(o=>{
     record(o,['id','s0','s1','y0','y1','kind','build','cov','door'],'opening');id(o.id);
     for(const k of ['s0','s1','y0','y1'])finite(o[k],`opening ${k}`);
     if(o.s0<0||o.s1<=o.s0||o.s1>L+EPS||o.y0<0||o.y1<=o.y0||o.y1>w.h)throw new RangeError('Opening bounds invalid');
     if(!['door','double','slide','arch','window'].includes(o.kind))throw new RangeError('Opening kind invalid');
     if(o.kind==='arch'){if(o.build!==undefined||o.cov!==undefined||o.door!==undefined)throw new TypeError('Arch has no fill/leaf');}
     else{
      surface(o.kind==='window'?'window':'door',{build:o.build,cov:o.cov,h:o.y1-o.y0});
      if(o.kind!=='window'){
       if(o.y0!==0||!Array.isArray(w.path)||!pieces.some((p,i)=>o.s0>=p.s0+shapes[i].inset0-EPS&&o.s1<=p.s1-shapes[i].inset1+EPS))throw new RangeError('Door must start at ground on one straight path segment, clear of its mitre insets');
       record(o.door||{},['hinge','th','slide'],'door');
       const d=o.door||{},th=d.th??0,slide=d.slide??0;finite(th,'door th');finite(slide,'door slide');
       if(d.hinge!==undefined&&!['start','end'].includes(d.hinge)||Math.abs(th)>Math.PI/2+EPS||slide<0||slide>1||o.kind==='slide'&&th!==0||o.kind!=='slide'&&slide!==0)throw new RangeError('Door hinge/motion invalid');
      }else if(o.door!==undefined)throw new TypeError('Window has no door motion');
     }
     return o;
    }).sort((a,b)=>a.s0-b.s0);
    for(let i=1;i<opens.length;i++)if(opens[i].s0<opens[i-1].s1-EPS)throw new RangeError('Overlapping openings');
    for(let pi=0;pi<pieces.length;pi++){
     const piece=pieces[pi];
     const at=t=>{const u=(t-piece.s0)/(piece.s1-piece.s0);return[piece.a[0]+(piece.b[0]-piece.a[0])*u,piece.a[1]+(piece.b[1]-piece.a[1])*u];};
     const cuts=[piece.s0,piece.s1,...opens.flatMap(o=>[o.s0,o.s1]).filter(t=>t>piece.s0&&t<piece.s1)].sort((a,b)=>a-b);
     for(let k=1;k<cuts.length;k++){
      const left=cuts[k-1],right=cuts[k],mid=(left+right)/2,o=opens.find(v=>mid>v.s0-EPS&&mid<v.s1+EPS);
      const spans=o?[[0,o.y0],[o.y1,w.h]].filter(v=>v[1]>v[0]):[[0,w.h]],n=Math.ceil((right-left)/.5);
      for(let j=0;j<n;j++){
       const sa=left+(right-left)*j/n,sb=left+(right-left)*(j+1)/n,a=at(sa),b=at(sb),poly=bandPoly(shapes[pi].poly,piece,sa,sb);
       if(poly){poly.forEach(within);if(spans.length)addPanel(st,w.id,...a,...b,half,'wall',w.build,w.cov,spans,poly);}
       if(o?.kind==='window'){
        const fillHalf=materials.describe(o.build).thicknessCm/200;if(!fillShapes.has(fillHalf))fillShapes.set(fillHalf,jointShapes(pieces,!!w.closed,fillHalf));
        const fill=bandPoly(fillShapes.get(fillHalf)[pi].poly,piece,sa,sb);
        if(fill){fill.forEach(within);addPanel(st,o.id,...a,...b,fillHalf,'window',o.build,o.cov,[[o.y0,o.y1]],fill);}
       }
      }
     }
    }
    for(const o of opens.filter(o=>!['window','arch'].includes(o.kind))){
     const piece=pieces.find(p=>o.s0>=p.s0-EPS&&o.s1<=p.s1+EPS),u0=(o.s0-piece.s0)/(piece.s1-piece.s0),u1=(o.s1-piece.s0)/(piece.s1-piece.s0);
     const a=[piece.a[0]+(piece.b[0]-piece.a[0])*u0,piece.a[1]+(piece.b[1]-piece.a[1])*u0],b=[piece.a[0]+(piece.b[0]-piece.a[0])*u1,piece.a[1]+(piece.b[1]-piece.a[1])*u1];
     const len=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=Math.atan2(b[1]-a[1],b[0]-a[0]),half=materials.describe(o.build).thicknessCm/200,d=o.door||{};
     const make=(leafId,hinge,baseAngle,leafLen,th)=>{
      const leaf={id:leafId,kind:o.kind,hx:hinge[0],hz:hinge[1],base:baseAngle,len:leafLen,half,h:o.y1,th,slide:d.slide||0,sdir:1,w:0,pusher:'',build:o.build,cov:o.cov};
      for(const k of Object.keys(leaf))if(!['th','slide','w','pusher'].includes(k))Object.defineProperty(leaf,k,{writable:false,configurable:false});
      st.doors.push(leaf);
     };
     if(o.kind==='double'){make(`${o.id}:0`,a,angle,len/2,d.th||0);make(`${o.id}:1`,b,angle+Math.PI,len/2,-(d.th||0));}
     else if(d.hinge==='end')make(o.id,b,angle+Math.PI,len,d.th||0);
     else make(o.id,a,angle,len,d.th||0);
    }
    for(const o of opens){
     const segments=[];
     for(const p of pieces){
      const s0=Math.max(p.s0,o.s0),s1=Math.min(p.s1,o.s1);if(s1<=s0+EPS)continue;
      const at=s=>{const u=(s-p.s0)/(p.s1-p.s0);return[p.a[0]+(p.b[0]-p.a[0])*u,p.a[1]+(p.b[1]-p.a[1])*u];};
      segments.push([at(s0),at(s1)]);
     }
     st.openings.push(freezeData({id:o.id,wall:w.id,kind:o.kind,build:o.build??null,cov:o.cov??null,s0:o.s0,s1:o.s1,y0:o.y0,y1:o.y1,half,segments,
      doors:st.doors.filter(d=>d.id===o.id||d.id.startsWith(`${o.id}:`)).map(d=>d.id)}));
    }
   }
   for(const p of stage.props||[]){
    record(p,['id','poly','build','cov','h'],'prop');id(p.id);surface('prop',p);const poly=polygon(p.poly,'prop',true);poly.forEach(within);
    const prop=Object.freeze({id:p.id,poly:Object.freeze(poly),build:p.build,cov:p.cov,h:p.h});st.props.push(prop);addBucket(st,'prop',st.props.length-1,poly);
   }
   buildRooms(st,stage.rooms||[],id,within);
   buildPortals(st,stage.portals||[],id);
   st.spawns=copyData(stage.spawns||[]);
   return st;
  }
  function fromCells(g){
   if(!g||!g.solid||!g.furn||!g.wh)throw new TypeError('fromCells requires a loaded grid');
   const st=base(g.def.name,[0,0,g.W,g.H],!g.def.hub,'legacy');st.legacy=g;st.legacyPanel=new Int32Array(g.W*g.H).fill(-1);st.doors=g.doors||[];st.syncedFurn=g.furn.slice();
   for(let z=0;z<g.H;z++)for(let x=0;x<g.W;x++){
    const i=z*g.W+x;
    // Empty cells are reserved as inactive panels so solidification can sync safely.
    const p=Object.freeze({ref:i,ax:x,az:z+.5,bx:x+1,bz:z+.5,ux:1,uz:0,nx:0,nz:1,half:.5,kind:'wall',build:null,cov:'full',c0:st.cells.length,c1:st.cells.length+1,
     poly:Object.freeze([[x,z],[x+1,z],[x+1,z+1],[x,z+1]].map(q=>Object.freeze(q)))});
    st.cells.push({panel:st.panels.length,y0:0,y1:g.wh[i]||WALL_H,hp:null,active:!!g.solid[i]});
    st.legacyPanel[i]=st.panels.length;st.panels.push(p);addBucket(st,'panel',st.panels.length-1,p.poly);
    if(g.furn[i]){const poly=p.poly;st.props.push(Object.freeze({id:`furn:${i}`,ref:i,poly,build:null,cov:'full',h:1.15}));addBucket(st,'prop',st.props.length-1,poly);}
   }
   adapterRooms(st);return st;
  }
  function syncCell(st,g,i){
   if(st.policy!=='legacy'||st.legacy!==g||!Number.isInteger(i)||i<0||i>=st.legacyPanel.length)throw new RangeError('Invalid adapter sync');
   // Furniture footprints were captured at compile; additions require recompilation.
   if(g.furn[i]&&!st.props.some(p=>p.ref===i))throw new Error('New furniture requires adapter recompile');
   const p=st.panels[st.legacyPanel[i]],c=st.cells[p.c0],active=!!g.solid[i],height=g.wh[i]||WALL_H;
   if(c.active!==active||c.y1!==height||st.syncedFurn[i]!==g.furn[i])geometryVersions.set(st,(geometryVersions.get(st)||0)+1);
   c.active=active;c.y1=height;st.syncedFurn[i]=g.furn[i];
  }
  function damageTiles(st,poly){
   const [ox,oz,x1,z1]=st.bounds,W=Math.ceil((x1-ox)/.5),H=Math.ceil((z1-oz)/.5),b=aabb(poly),tiles=[];
   // Maximum supported body radius plus an edge's diagonal reach.
   const pad=2+Math.SQRT2*.5;
   for(let z=Math.max(0,Math.floor((b[1]-pad-oz)/.5));z<=Math.min(H-1,Math.floor((b[3]+pad-oz)/.5));z++)
    for(let x=Math.max(0,Math.floor((b[0]-pad-ox)/.5));x<=Math.min(W-1,Math.floor((b[2]+pad-ox)/.5));x++)tiles.push(z*W+x);
   return Object.freeze(tiles);
  }
  function lowGap(st,p){
   const wall=st.openings.find(o=>o.id===p.ref)?.wall??p.ref,opens=st.openings.filter(o=>o.wall===wall),refs=new Set([wall,...opens.map(o=>o.id)]);
   const at=q=>(q[0]-p.ax)*p.ux+(q[1]-p.az)*p.uz;
   const aligned=(a,b)=>Math.abs(cross(a[0]-p.ax,a[1]-p.az,p.ux,p.uz))<1e-6&&Math.abs(cross(b[0]-p.ax,b[1]-p.az,p.ux,p.uz))<1e-6;
   const domain=[],blocked=[],add=(a,b,block)=>{if(!aligned(a,b))return;const span=[Math.min(at(a),at(b)),Math.max(at(a),at(b))];domain.push(span);if(block)blocked.push(span);};
   for(const q of st.panels)if(refs.has(q.ref))add([q.ax,q.az],[q.bx,q.bz],st.cells.slice(q.c0,q.c1).some(c=>c.active&&c.y0<MOVE_H));
   for(const o of opens)for(const [a,b] of o.segments)add(a,b,o.doors.some(id=>st.doors.find(d=>d.id===id)?.locked===true));
   const union=spans=>{spans.sort((a,b)=>a[0]-b[0]);const out=[];for(const [lo,hi] of spans){const last=out.at(-1);if(last&&lo<=last[1]+EPS)last[1]=Math.max(last[1],hi);else out.push([lo,hi]);}return out;};
   const gaps=[];
   for(const [lo,hi] of union(domain)){let start=lo;for(const [a,b] of union(blocked)){if(b<=start||a>=hi)continue;if(a>start+EPS)gaps.push([start,a]);start=Math.max(start,b);}if(start<hi-EPS)gaps.push([start,hi]);}
   const mid=Math.hypot(p.bx-p.ax,p.bz-p.az)/2,span=gaps.find(([a,b])=>mid>a-EPS&&mid<b+EPS);
   return{wall,ends:span?span.map(t=>[p.ax+p.ux*t,p.az+p.uz*t]):[[p.ax,p.az],[p.bx,p.bz]],walk:!!span};
  }
  function holeRecord(st,id,idx,a,b,ends,p,walk){
   const [v,w]=ends,width=Math.hypot(w[0]-v[0],w[1]-v[1]);
   return Object.freeze({id,idx,a,b,kind:'hole',ref:p.ref,build:p.build,cov:null,half:p.half,y0:0,y1:Infinity,
    ends:freezeData(ends),segments:freezeData([ends]),mid:Object.freeze([(v[0]+w[0])/2,(v[1]+w[1])/2]),width,nx:p.nx,nz:p.nz,
    walk,sight:Object.freeze({standing:true,crouched:true}),doors:Object.freeze([])});
  }
  function breachPortal(st,p,index){
   if(st.policy==='legacy'){
    const g=st.legacy,i=p.ref,x=i%g.W,z=Math.floor(i/g.W),labels=[];
    for(const [X,Z] of [[x-1,z],[x+1,z],[x,z-1],[x,z+1]])if(X>=0&&Z>=0&&X<g.W&&Z<g.H){const r=st.roomTiles[Z*g.W+X];if(r>=0&&!labels.includes(r))labels.push(r);}
    if(labels.length<2)return null;
    let first=null,next=st.portals.slice();
    for(let a=0;a<labels.length;a++)for(let b=a+1;b<labels.length;b++){
     const id=`breach:${i}:${labels[a]}:${labels[b]}`;if(next.some(p=>p.id===id))continue;
     const centre=[x+.5,z+.5],samples=r=>[[x-1,z],[x+1,z],[x,z-1],[x,z+1]].filter(([X,Z])=>X>=0&&Z>=0&&X<g.W&&Z<g.H&&st.roomTiles[Z*g.W+X]===r).map(([X,Z])=>[X+.5,Z+.5]);
     const A=samples(labels[a])[0],B=samples(labels[b])[0],L=Math.hypot(B[0]-A[0],B[1]-A[1]),nx=(B[0]-A[0])/L,nz=(B[1]-A[1])/L;
     const q=holeRecord(st,id,next.length,labels[a],labels[b],[[centre[0]+nz*.5,centre[1]-nx*.5],[centre[0]-nz*.5,centre[1]+nx*.5]],{...p,nx,nz},true);
     next.push(q);first??=q;
    }if(first){st.portals=next;finishGraph(st);}return first;
   }
   if(!st.rooms.length)return null;
   const raw=[[p.ax,p.az],[p.bx,p.bz]];
   const covered=st.portals.find(q=>q.kind!=='hole'&&coversSegment(q.segments,...raw));
   if(covered){
    const gap=lowGap(st,p),axes=(breachAxes.get(st)||[]).filter(a=>a.panel!==index&&!(a.portal===covered.idx&&coversSegment([gap.ends],a.a,a.b)));
    axes.push(Object.freeze({panel:index,portal:covered.idx,a:gap.ends[0],b:gap.ends[1],half:p.half,walk:gap.walk}));
    breachAxes.set(st,axes);return covered;
   }
   const gap=lowGap(st,p),wall=gap.wall;
   let ends=gap.ends,mid=[(ends[0][0]+ends[1][0])/2,(ends[0][1]+ends[1][1])/2];
   const sides=()=>[roomAt(st,mid[0]-p.nx*(p.half+.02),mid[1]-p.nz*(p.half+.02)),roomAt(st,mid[0]+p.nx*(p.half+.02),mid[1]+p.nz*(p.half+.02))];
   let [a,b]=sides();
   if(a&&!segmentRoom(a,...ends)||b&&!segmentRoom(b,...ends)){ends=raw;mid=[(p.ax+p.bx)/2,(p.az+p.bz)/2];[a,b]=sides();}
   if(!a&&!b||a===b||a&&!segmentRoom(a,...ends)||b&&!segmentRoom(b,...ends))return null;
   if(!a){a=b;b=null;}
   const previous=st.portals.filter(q=>q.kind==='hole'&&!q.inactive&&q.ref===wall&&q.a===a.idx&&q.b===(b?.idx??null)&&q.segments.some(([v,w])=>coversSegment([ends],v,w)));
   const idx=previous.length?previous[0].idx:st.portals.length,id=previous.length?previous[0].id:`breach:${index}`;
   const portal=holeRecord(st,id,idx,a.idx,b?.idx??null,ends,{...p,ref:wall},gap.walk),next=st.portals.slice();
   for(const q of previous.slice(1))next[q.idx]=Object.freeze({...q,inactive:true});
   next[idx]=portal;st.portals=next;finishGraph(st);return portal;
  }
  function damage(st,target,cell,J,kind){
   finite(J,'Damage energy');if(J<0||!['bullet','blast','melee'].includes(kind))throw new RangeError('Invalid damage energy/kind');
   if(!st||!Number.isInteger(cell)||cell<0||cell>=st.cells.length)throw new RangeError('Invalid damage cell');
   const c=st.cells[cell],p=st.panels[c.panel];
   if(!p||(typeof target==='number'?!Number.isInteger(target)||target!==c.panel:typeof target!=='string'||p.ref!==target))throw new RangeError('Damage target/cell mismatch');
   if(st.policy==='legacy'&&st.legacy.glassSet?.has(p.ref))throw new Error('Legacy panes require hitGlass and syncCell');
   if(!c.active)return NO_DAMAGE;
   if(c.hp!==Infinity&&(!Number.isFinite(c.hp)||c.hp<=0))throw new TypeError('Damage requires initialized positive cell HP');
   if(J===0||c.hp===Infinity||p.build!==null&&materials.build(p.build).cellHp===Infinity)return NO_DAMAGE;
   if(J<c.hp){c.hp-=J;return NO_DAMAGE;}
   c.hp=0;c.active=false;
   if(st.policy==='legacy'){
    const g=st.legacy;g.solid[p.ref]=0;if(g.floorT?.[p.ref]<0)g.floorT[p.ref]=g.def.floor||1;g.navVer=(g.navVer|0)+1;
   }
   geometryVersions.set(st,(geometryVersions.get(st)||0)+1);
   const portal=breachPortal(st,p,c.panel);
   return Object.freeze({removed:true,cells:Object.freeze([cell]),dirty:true,nav:damageTiles(st,p.poly),portal});
  }
  function damageLock(st,door,J){
   finite(J,'Lock energy');if(J<0||!st||!st.doors.includes(door))throw new RangeError('Invalid lock target/energy');
   const build=door.build;if(typeof build!=='string'||materials.build(build).lockHp===undefined)throw new TypeError('Door build has no lock HP');
   const hp=door.lockHp??materials.build(build).lockHp;
   if(hp!==Infinity&&(!Number.isFinite(hp)||hp<0))throw new TypeError('Invalid live lock HP');
   if(J===0||hp===Infinity||materials.build(build).lockHp===Infinity||door.breached===true)return NO_BREACH;
   if(J<hp){door.lockHp=hp-J;return NO_BREACH;}
   const opening=st.openings.find(o=>o.doors.includes(door.id)),leaves=opening?st.doors.filter(d=>opening.doors.includes(d.id)):[door];
   for(const d of leaves){d.lockHp=0;d.locked=false;d.breached=true;}
   return Object.freeze({breached:true});
  }
  function leafPoly(d,legacy){
   if(!legacy){finite(d.th,'live door th');finite(d.slide,'live door slide');if(Math.abs(d.th)>Math.PI/2+EPS||d.slide<0||d.slide>1||d.kind==='slide'&&d.th!==0||d.kind!=='slide'&&d.slide!==0)throw new RangeError('Invalid live door motion');}
   const angle=d.base+(d.th||0),len=d.len??.98,half=d.half??.035,offset=d.kind==='slide'?(d.slide||0)*len*(d.sdir||1):0;
   const ux=Math.cos(angle),uz=Math.sin(angle),ax=d.hx+ux*offset,az=d.hz+uz*offset;
   return box(ax,az,ax+ux*len,az+uz*len,half);
  }
  const selected=(st,p,y,sightQuery)=>{
   for(let i=p.c0;i<p.c1;i++){const c=st.cells[i];if(c.active&&(st.policy==='legacy'?c.y1>=.6:y>=c.y0&&y<c.y1))return i;}return-1;
  };
  function trace(st,ax,az,bx,bz,y=.7,out=[]){
   [ax,az,bx,bz,y].forEach(v=>finite(v,'trace coordinate'));out.length=0;const L=Math.hypot(bx-ax,bz-az);
   for(const [type,index] of candidates(st,ax,az,bx,bz)){
    const p=type==='panel'?st.panels[index]:st.props[index];
    const cell=type==='panel'?selected(st,p,y,false):-1;
    if(type==='panel'&&cell<0||type==='prop'&&(st.policy==='legacy'?!COVER[st.legacy.furn[p.ref]]:y<0||y>=p.h))continue;
    const hit=clip(p.poly,ax,az,bx,bz);if(!hit)continue;
    const nx=type==='panel'&&st.policy!=='legacy'?p.nx:hit.nx,nz=type==='panel'&&st.policy!=='legacy'?p.nz:hit.nz;
    const cos=L?Math.abs((bx-ax)*nx+(bz-az)*nz)/L:1;
    out.push({...hit,x:ax+(bx-ax)*hit.t0,z:az+(bz-az)*hit.t0,kind:type==='panel'?p.kind:'prop',ref:p.ref??p.id,panel:type==='panel'?index:null,cell,build:p.build,path:(hit.t1-hit.t0)*L,cos});
   }
   for(const d of st.doors){
    if(st.policy!=='legacy'&&(y<0||y>=d.h))continue;
    const hit=clip(leafPoly(d,st.policy==='legacy'),ax,az,bx,bz);if(!hit)continue;
    const angle=d.base+(d.th||0),cos=L?Math.abs(-(bx-ax)*Math.sin(angle)+(bz-az)*Math.cos(angle))/L:1;
    out.push({...hit,x:ax+(bx-ax)*hit.t0,z:az+(bz-az)*hit.t0,kind:'door',ref:d.id??d,door:d,cell:-1,build:d.build??null,path:(hit.t1-hit.t0)*L,cos});
   }
   out.sort((a,b)=>a.t0-b.t0);return out;
  }
  function sight(st,ax,az,bx,bz,eyeA=1.6,topB=1.8){
   [ax,az,bx,bz,eyeA,topB].forEach(v=>finite(v,'sight coordinate'));if(eyeA<=0||topB<=0)throw new RangeError('Sight heights must be positive');
   const bounds=st.bounds;
   if([ax,bx].some(x=>x<bounds[0]||x>=bounds[2])||[az,bz].some(z=>z<bounds[1]||z>=bounds[3]))return{clear:false,t:0,kind:'bounds',ref:null};
   const y=Math.min(eyeA,topB);let nearest=null;
   for(const [type,index] of candidates(st,ax,az,bx,bz)){
    if(type!=='panel')continue;const p=st.panels[index],cell=selected(st,p,y,true);if(cell<0)continue;
    if(st.policy!=='legacy'&&!materials.blocksSight({kind:p.kind,build:p.build,cov:p.cov,h:st.cells[p.c1-1].y1},'crouched'))continue;
    const hit=clip(p.poly,ax,az,bx,bz);
    if(hit&&(!nearest||hit.t0<nearest.t))nearest={clear:false,t:hit.t0,kind:p.kind,ref:p.ref,cell};
   }
   for(const d of st.doors){
    if(st.policy!=='legacy'&&(y>=d.h||!materials.blocksSight({kind:'door',build:d.build,cov:d.cov,h:d.h},'crouched')))continue;
    const hit=clip(leafPoly(d,st.policy==='legacy'),ax,az,bx,bz);if(hit&&(!nearest||hit.t0<nearest.t))nearest={clear:false,t:hit.t0,kind:'door',ref:d.id??d,door:d};
   }
   return nearest||{clear:true,t:1,kind:null,ref:null};
  }
  function groundY(st,x,z){
   finite(x,'ground x');finite(z,'ground z');
   if(st.policy==='legacy')return x>=0&&z>=0&&x<st.legacy.W&&z<st.legacy.H?0:null;
   const g=st.ground.find(g=>inside(g.poly,x,z));return g?g.y:null;
  }
  function nearPoly(poly,x,z){
   let area=0;for(let i=0;i<poly.length;i++)area+=cross(...poly[i],...poly[(i+1)%poly.length]);const sign=area>0?1:-1;
   let best=null;for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);
    const px=a[0]+dx*t,pz=a[1]+dz*t,d=Math.hypot(x-px,z-pz);
    if(!best||d<best.d){const len=Math.hypot(dx,dz);best={x:px,z:pz,d,enx:sign*dz/len,enz:-sign*dx/len,nx:d?(x-px)/d:sign*dz/len,nz:d?(z-pz)/d:-sign*dx/len};}
   }return best;
  }
  function sweep(poly,x,z,r,dx,dz){
   const near=nearPoly(poly,x,z),insideStart=inside(poly,x,z,false),boundary=near.d<=EPS,overlap=boundary||insideStart||near.d<r-EPS;
   if(overlap){
    let nx=boundary?near.enx:near.nx,nz=boundary?near.enz:near.nz;if(insideStart&&!boundary){nx=-nx;nz=-nz;}
    return dx*nx+dz*nz>=-EPS?{escape:true,overlap:true}: {t:0,nx,nz,overlap:true};
   }
   let best=null;const test=(t,nx,nz)=>{if(t>=-EPS&&t<=1&&dx*nx+dz*nz<-EPS&&(!best||t<best.t))best={t:Math.max(0,t),nx,nz,overlap:false};};
   let area=0;for(let i=0;i<poly.length;i++)area+=cross(...poly[i],...poly[(i+1)%poly.length]);const sign=area>0?1:-1;
   for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],ex=b[0]-a[0],ez=b[1]-a[1],len=Math.hypot(ex,ez),nx=sign*ez/len,nz=-sign*ex/len,v=dx*nx+dz*nz;
    if(v<-EPS){
     const d=(x-a[0])*nx+(z-a[1])*nz,t=(r-d)/v,px=x+dx*t-nx*r,pz=z+dz*t-nz*r,along=((px-a[0])*ex+(pz-a[1])*ez)/(len*len);
     if(along>=0&&along<=1)test(t,nx,nz);
    }
    const fx=x-a[0],fz=z-a[1],A=dx*dx+dz*dz,B=2*(fx*dx+fz*dz),C=fx*fx+fz*fz-r*r,disc=B*B-4*A*C;
    if(A>EPS&&disc>=0){const t=(-B-Math.sqrt(disc))/(2*A),px=fx+dx*t,pz=fz+dz*t,l=Math.hypot(px,pz);if(l>EPS)test(t,px/l,pz/l);}
   }
   return best;
  }
  function movementFeatures(st,x,z,bx,bz,r){
   const out=[];for(const [type,index] of candidates(st,x,z,bx,bz,r)){
    if(type==='prop'){const p=st.props[index];if(st.policy!=='legacy'||st.legacy.furn[p.ref])out.push(p.poly);}
    else{const p=st.panels[index];if(st.cells.slice(p.c0,p.c1).some(c=>c.active&&c.y0<MOVE_H))out.push(p.poly);}
   }
   // Bounds are a movement barrier even where ground polygons end.
   const [a,b,c,d]=st.bounds,pad=Math.max(Math.abs(bx-x),Math.abs(bz-z),r)+2;
   out.push([[a-pad,b-pad],[a,b-pad],[a,d+pad],[a-pad,d+pad]],[[c,b-pad],[c+pad,b-pad],[c+pad,d+pad],[c,d+pad]],
    [[a-pad,b-pad],[c+pad,b-pad],[c+pad,b],[a-pad,b]],[[a-pad,d],[c+pad,d],[c+pad,d+pad],[a-pad,d+pad]]);
   return out;
  }
  function move(st,x,z,r,dx,dz){
   [x,z,r,dx,dz].forEach(v=>finite(v,'move coordinate'));if(r<0)throw new RangeError('Move radius must be nonnegative');
   let rx=dx,rz=dz,hit=false,overlap=false;const normals=[];
   for(let it=0;it<4&&Math.hypot(rx,rz)>EPS;it++){
    let contact=null;
    for(const poly of movementFeatures(st,x,z,x+rx,z+rz,r)){
     const h=sweep(poly,x,z,r,rx,rz);if(h?.overlap)overlap=true;if(h&&!h.escape&&(!contact||h.t<contact.t))contact=h;
    }
    if(!contact){x+=rx;z+=rz;rx=rz=0;break;}
    hit=true;const l=Math.hypot(rx,rz),t=Math.max(0,contact.t-SKIN/l);x+=rx*t;z+=rz*t;rx*=1-t;rz*=1-t;
    const dot=rx*contact.nx+rz*contact.nz;rx-=dot*contact.nx;rz-=dot*contact.nz;
    if(normals.some(n=>rx*n[0]+rz*n[1]<-EPS)){rx=rz=0;break;}normals.push([contact.nx,contact.nz]);
   }
   return{x,z,hit,rem:[rx,rz],overlap,groundY:groundY(st,x,z)};
  }
  function coverAt(st,x,z,dirx,dirz,r){
   [x,z,dirx,dirz,r].forEach(v=>finite(v,'cover coordinate'));if(r<0||Math.hypot(dirx,dirz)<EPS)throw new RangeError('Cover radius/direction invalid');
   const byRef=new Map();
   for(const [type,index] of candidates(st,x,z,x,z,r)){
    const p=type==='panel'?st.panels[index]:st.props[index];let h=type==='prop'?p.h:0;
    if(type==='panel'){for(let i=p.c0;i<p.c1;i++){const c=st.cells[i];if(!c.active||c.y0>h+EPS)break;h=c.y1;}}
    if(h<=0)continue;if(st.policy==='legacy'&&type==='prop'&&!st.legacy.furn[p.ref])continue;
    const n=nearPoly(p.poly,x,z);if(n.d>r||(n.x-x)*dirx+(n.z-z)*dirz<-EPS)continue;
    const ref=p.ref??p.id,old=byRef.get(ref);if(!old||n.d<old.d)byRef.set(ref,{...n,h,ref,kind:type==='prop'?'prop':p.kind,cov:p.cov});
   }return[...byRef.values()].sort((a,b)=>a.d-b.d);
  }
  function freezeData(value){
   if(value&&typeof value==='object'){for(const v of Object.values(value))freezeData(v);Object.freeze(value);}return value;
  }
  function polyArea(poly){
   let a=0,x=0,z=0;
   for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],c=cross(...p,...q);a+=c;x+=(p[0]+q[0])*c;z+=(p[1]+q[1])*c;}
   return{area:Math.abs(a)/2,centroid:[x/(3*a),z/(3*a)]};
  }
  function strictInside(poly,x,z){return !poly.some((p,i)=>onSegment(x,z,p,poly[(i+1)%poly.length]))&&inside(poly,x,z,false);}
  function roomOverlap(a,b){
   for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)if(segInt(...a[i],...a[(i+1)%a.length],...b[j],...b[(j+1)%b.length]))return true;
   if(a.some(p=>strictInside(b,...p))||b.some(p=>strictInside(a,...p)))return true;
   for(const [p,q] of [[a,b],[b,a]]){
    const signed=p.reduce((s,v,i)=>s+cross(...v,...p[(i+1)%p.length]),0),sign=Math.sign(signed);
    for(let i=0;i<p.length;i++){
     const v=p[i],w=p[(i+1)%p.length],dx=w[0]-v[0],dz=w[1]-v[1],len=Math.hypot(dx,dz);
     for(const t of [.25,.5,.75]){const x=v[0]+dx*t-sign*dz/len*1e-6,z=v[1]+dz*t+sign*dx/len*1e-6;if(strictInside(q,x,z))return true;}
    }
   }return false;
  }
  function buildRooms(st,rooms,id,within){
   if(rooms.length>255)throw new RangeError('Stage exceeds 255 rooms (byte room id reserves zero)');
   for(const r of rooms){
    if(!r||typeof r!=='object'||Array.isArray(r)||!Object.prototype.hasOwnProperty.call(r,'id')||!Object.prototype.hasOwnProperty.call(r,'poly'))throw new TypeError('Room must have its own id and polygon');
    id(r.id);const poly=polygon(r.poly,'room');poly.forEach(within);
    if(r.combat!==undefined&&typeof r.combat!=='boolean')throw new TypeError('Room combat must be boolean');
    for(const prev of st.rooms)if(roomOverlap(poly,prev.poly))throw new RangeError(`Room interiors overlap: ${r.id}/${prev.id}`);
    const info=polyArea(poly),samples=[];
    if(strictInside(poly,...info.centroid))samples.push(info.centroid.slice());
    const [x0,z0,x1,z1]=aabb(poly);
    for(let n=3;n<=17&&samples.length<4;n+=2)for(let z=0;z<n&&samples.length<4;z++)for(let x=0;x<n&&samples.length<4;x++){
     const p=[x0+(x+.5)*(x1-x0)/n,z0+(z+.5)*(z1-z0)/n];
     if(strictInside(poly,...p)&&samples.every(q=>Math.hypot(p[0]-q[0],p[1]-q[1])>Math.min(x1-x0,z1-z0)/8))samples.push(p);
    }
    if(!samples.length){
     const sign=Math.sign(poly.reduce((s,v,i)=>s+cross(...v,...poly[(i+1)%poly.length]),0));
     for(let i=0;i<poly.length;i++){
      const a=poly[(i+poly.length-1)%poly.length],b=poly[i],c=poly[(i+1)%poly.length];
      if(sign*cross(b[0]-a[0],b[1]-a[1],c[0]-b[0],c[1]-b[1])<=EPS)continue;
      if(poly.some((p,j)=>j!==i&&j!==(i+1)%poly.length&&j!==(i+poly.length-1)%poly.length&&inside([a,b,c],...p)))continue;
      const p=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3];if(strictInside(poly,...p)){samples.push(p);break;}
     }
    }
    if(!samples.length)throw new RangeError(`Room ${r.id} has no interior samples`);
    st.rooms.push(freezeData({...copyData(r),poly,idx:st.rooms.length,combat:r.combat??st.combat,...info,samples}));
   }Object.freeze(st.rooms);
  }
  function roomAt(st,x,z){
   finite(x,'room x');finite(z,'room z');
   if(st.policy==='legacy'){
    const ix=Math.floor(x),iz=Math.floor(z);if(ix<0||iz<0||ix>=st.legacy.W||iz>=st.legacy.H)return null;
    const idx=st.roomTiles[iz*st.legacy.W+ix];return idx<0?null:st.rooms[idx];
   }return st.rooms.find(r=>inside(r.poly,x,z))||null;
  }
  function segmentRoom(r,a,b){
   if(!r)return false;
   return coversSegment(r.poly.map((v,i)=>[v,r.poly[(i+1)%r.poly.length]]),a,b);
  }
  function coversSegment(segments,a,b){
   const dx=b[0]-a[0],dz=b[1]-a[1],L=dx*dx+dz*dz,spans=[];
   for(const [v,w] of segments){
    if(Math.abs(cross(v[0]-a[0],v[1]-a[1],dx,dz))>EPS||Math.abs(cross(w[0]-a[0],w[1]-a[1],dx,dz))>EPS)continue;
    const t=p=>((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L,lo=Math.max(0,Math.min(t(v),t(w))),hi=Math.min(1,Math.max(t(v),t(w)));if(hi>lo)spans.push([lo,hi]);
   }
   spans.sort((a,b)=>a[0]-b[0]);let end=0;for(const [lo,hi] of spans){if(lo>end+EPS)return false;end=Math.max(end,hi);}return end>=1-EPS;
  }
  function buildPortals(st,portals,id){
   if(!Array.isArray(portals))throw new TypeError('Stage portals must be an array');
   for(const p of portals){
    record(p,['id','a','b','open','seg','wall'],'portal');id(p.id);
    const a=st.rooms.find(r=>r.id===p.a),b=p.b===null?null:st.rooms.find(r=>r.id===p.b);
    if(!a||p.b!==null&&!b||a===b)throw new RangeError('Portal room references invalid');
    if((p.open!==undefined)===(p.seg!==undefined))throw new TypeError('Portal needs exactly one of open or seg');
    let segments,kind,build,cov,half,y0,y1,doors=[],ref;
    if(p.open!==undefined){
     if(p.wall!==undefined)throw new TypeError('Opening portal does not need wall');
     const o=st.openings.find(o=>o.id===p.open);if(!o)throw new RangeError('Unknown portal opening');
     ({segments,kind,build,cov,half,y0,y1}=o);doors=o.doors.map(id=>st.doors.find(d=>d.id===id));ref=o.id;
    }else{
     if(!Array.isArray(p.seg)||p.seg.length!==2)throw new TypeError('Portal seg needs two points');
     const ends=p.seg.map(q=>point(q,'portal'));if(Math.hypot(ends[1][0]-ends[0][0],ends[1][1]-ends[0][1])<1e-6)throw new RangeError('Portal has no width');
     segments=[ends];kind='open';build=null;cov=null;half=0;y0=0;y1=Infinity;ref=p.id;
     if(p.wall!==undefined){
      const panels=st.panels.filter(q=>q.ref===p.wall);
      if(!panels.length)throw new RangeError('Unknown portal wall');
      if(!coversSegment(panels.map(q=>[[q.ax,q.az],[q.bx,q.bz]]),...ends))throw new RangeError('Wall portal must lie on intact wall path');
      const q=panels[0];kind='wall';build=q.build;cov=q.cov;half=q.half;y1=Math.max(...panels.flatMap(q=>st.cells.slice(q.c0,q.c1).map(c=>c.y1)));ref=p.wall;
     }else for(const q of st.panels)if(segments.some(([a,b])=>{const h=clip(q.poly,...a,...b);return h&&h.t1-h.t0>1e-6;}))throw new RangeError('Open portal crosses a wall; reference its opening or wall');
    }
    for(const [v,w] of segments)if(!segmentRoom(a,v,w)||b&&!segmentRoom(b,v,w))throw new RangeError('Portal must lie on shared room boundary');
    const v=segments[0][0],w=segments.at(-1)[1],dx=segments[0][1][0]-v[0],dz=segments[0][1][1]-v[1],len=Math.hypot(dx,dz);
    let nx=-dz/len,nz=dx/len;
    const mid=[(v[0]+segments[0][1][0])/2,(v[1]+segments[0][1][1])/2];
    if(inside(a.poly,mid[0]+nx*1e-5,mid[1]+nz*1e-5)){nx=-nx;nz=-nz;}
    const width=segments.reduce((sum,[a,b])=>sum+Math.hypot(b[0]-a[0],b[1]-a[1]),0);
    const flags=kind==='open'||kind==='arch'?{standing:true,crouched:true}:{standing:materials.blocksSight({kind:kind==='wall'?'wall':kind==='window'?'window':'door',build,cov,h:y1-y0},'standing')===false,crouched:materials.blocksSight({kind:kind==='wall'?'wall':kind==='window'?'window':'door',build,cov,h:y1-y0},'crouched')===false};
    // Leaf doors are candidates even when currently closed; sight tests the live leaf.
    if(doors.length)flags.standing=flags.crouched=true;
    const portal={id:p.id,idx:st.portals.length,a:a.idx,b:b?.idx??null,kind,ref,build,cov,half,y0,y1,ends:freezeData([v.slice(),w.slice()]),segments,mid:Object.freeze(mid),width,nx,nz,
     walk:kind!=='window'&&kind!=='wall'&&y0===0&&y1>=1,sight:Object.freeze(flags),doors:Object.freeze(doors)};
    Object.freeze(portal);st.portals.push(portal);
   }finishGraph(st);
  }
  function finishGraph(st){
   st.adjacency=Object.freeze(st.rooms.map(r=>Object.freeze(st.portals.filter(p=>!p.inactive&&(p.a===r.idx||p.b===r.idx)).map(p=>p.idx))));
   Object.freeze(st.portals);
  }
  function adapterRooms(st){
   const g=st.legacy,W=g.W,H=g.H,labels=new Int16Array(W*H).fill(-1),doorCells=new Set((g.doorSpecs||[]).map(d=>Math.floor(d.hz+Math.sin(d.base)*.49)*W+Math.floor(d.hx+Math.cos(d.base)*.49)));
   st.roomTiles=labels;
   const zone=i=>g.floorT?.[i]===7?'exterior':'interior';
   for(let i=0;i<labels.length;i++){
    if(g.solid[i]||doorCells.has(i)||labels[i]>=0)continue;
    if(st.rooms.length>=255)throw new RangeError('Adapter exceeds 255 topological rooms');
    const idx=st.rooms.length,queue=[i],cells=[];labels[i]=idx;
    for(let n=0;n<queue.length;n++){
     const j=queue[n];cells.push(j);
     for(const k of [j%W<W-1?j+1:-1,Math.floor(j/W)<H-1?j+W:-1,j%W?j-1:-1,j>=W?j-W:-1])if(k>=0&&!g.solid[k]&&!doorCells.has(k)&&labels[k]<0&&zone(k)===zone(i)){labels[k]=idx;queue.push(k);}
    }
    const points=cells.map(j=>[j%W+.5,Math.floor(j/W)+.5]),centroid=[points.reduce((s,p)=>s+p[0],0)/cells.length,points.reduce((s,p)=>s+p[1],0)/cells.length];
    st.rooms.push(freezeData({id:`region:${idx}`,idx,derived:true,kind:'region',zone:zone(i),combat:st.combat,area:cells.length,centroid,samples:points.filter((p,j)=>j%Math.max(1,Math.ceil(points.length/4))===0).slice(0,4)}));
   }
   const add=(a,b,ends,kind,door=null)=>{
    if(a<0||b<0||a===b)return;const [v,w]=ends,dx=w[0]-v[0],dz=w[1]-v[1],width=Math.hypot(dx,dz);
    const p={id:`portal:${st.portals.length}`,idx:st.portals.length,a,b,kind,ref:door??null,build:null,half:door?.half??.035,y0:0,y1:WALL_H,ends:freezeData(ends),segments:freezeData([ends]),mid:Object.freeze([(v[0]+w[0])/2,(v[1]+w[1])/2]),width,nx:-dz/width,nz:dx/width,walk:true,sight:Object.freeze({standing:true,crouched:true}),doors:Object.freeze(door?[door]:[])};
    st.portals.push(Object.freeze(p));
   };
   for(const d of st.doors){
    const cx=d.hx+Math.cos(d.base)*.49,cz=d.hz+Math.sin(d.base)*.49,nx=-Math.sin(d.base),nz=Math.cos(d.base);
    const label=(x,z)=>{x=Math.floor(x);z=Math.floor(z);return x<0||z<0||x>=W||z>=H?-1:labels[z*W+x];};
    add(label(cx-nx*.6,cz-nz*.6),label(cx+nx*.6,cz+nz*.6),[[d.hx,d.hz],[d.hx+Math.cos(d.base)*.98,d.hz+Math.sin(d.base)*.98]],'door',d);
   }
   for(let z=0;z<H;z++)for(let x=0;x<W;x++){
    const i=z*W+x;if(labels[i]<0)continue;
    if(x<W-1&&labels[i+1]>=0&&labels[i+1]!==labels[i])add(labels[i],labels[i+1],[[x+1,z+1],[x+1,z]],'open');
    if(z<H-1&&labels[i+W]>=0&&labels[i+W]!==labels[i])add(labels[i],labels[i+W],[[x,z+1],[x+1,z+1]],'open');
   }Object.freeze(st.rooms);finishGraph(st);
  }
  function portals(st,room){
   const idx=typeof room==='number'?room:typeof room==='string'?st.rooms.find(r=>r.id===room)?.idx:room?.idx;
   if(!Number.isInteger(idx)||idx<0||idx>=st.rooms.length)throw new RangeError('Unknown room');
   return st.adjacency[idx];
  }
  function portalAt(st,x,z){
   finite(x,'portal x');finite(z,'portal z');
   return st.portals.find(p=>!p.inactive&&p.segments.some(([a,b])=>segDist(x,z,...a,...b)<=p.half+.01))||null;
  }
  function lockedClear(st,ax,az,bx,bz,r){
   for(const d of st.doors)if(d.locked===true){
    const poly=leafPoly(d,st.policy==='legacy');
    if(inside(poly,ax,az)||inside(poly,bx,bz)||clip(poly,ax,az,bx,bz))return false;
    for(let i=0;i<poly.length;i++)if(segmentDistance(ax,az,bx,bz,poly[i],poly[(i+1)%poly.length])<r-1e-8)return false;
   }return true;
  }
  function portalOpen(st,p,mode,eye=mode==='move'?.3:1.6,top=1.8){
   if(!p||st.portals[p.idx]!==p)throw new RangeError('Foreign portal');
   if(p.inactive)return false;
   if(mode==='move'){
    if(!p.walk&&!(geometryVersions.get(st)&&['wall','window'].includes(p.kind))||p.doors.some(d=>d.locked===true))return false;
    if(p.kind!=='hole'&&!['wall','window'].includes(p.kind))return true;
    finite(eye,'Portal movement radius');if(eye<0||eye>2)throw new RangeError('Invalid portal movement radius');
    const offset=p.half+eye+.02,points=[p.mid,...(breachAxes.get(st)||[]).filter(a=>a.portal===p.idx&&a.walk).map(a=>[(a.a[0]+a.b[0])/2,(a.a[1]+a.b[1])/2])];
    return points.some(([x,z])=>{const ax=x-p.nx*offset,az=z-p.nz*offset,bx=x+p.nx*offset,bz=z+p.nz*offset;return clear(st,ax,az,bx,bz,eye)&&lockedClear(st,ax,az,bx,bz,eye);});
   }
   if(mode!=='sight')throw new RangeError('Portal mode must be move or sight');
   const offset=p.half+.02;
   const points=[p.mid,...(breachAxes.get(st)||[]).filter(a=>a.portal===p.idx).map(a=>[(a.a[0]+a.b[0])/2,(a.a[1]+a.b[1])/2])];
   return points.some(([x,z])=>sight(st,x-p.nx*offset,z-p.nz*offset,x+p.nx*offset,z+p.nz*offset,eye,top).clear);
  }
  const groundEdges=new WeakMap(),navData=new WeakMap(),fieldData=new WeakMap();
  function segmentCuts(a,b,c,d){
   const dx=b[0]-a[0],dz=b[1]-a[1],ex=d[0]-c[0],ez=d[1]-c[1],den=cross(dx,dz,ex,ez);
   if(Math.abs(den)>EPS){
    const t=cross(c[0]-a[0],c[1]-a[1],ex,ez)/den,u=cross(c[0]-a[0],c[1]-a[1],dx,dz)/den;return u>=-EPS&&u<=1+EPS&&t>=-EPS&&t<=1+EPS?[clamp(t,0,1)]:[];
   }
   if(Math.abs(cross(c[0]-a[0],c[1]-a[1],dx,dz))>EPS)return[];
   const L=dx*dx+dz*dz;return[c,d].map(p=>((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L).filter(t=>t>=0&&t<=1);
  }
  function boundaries(st){
   if(groundEdges.has(st))return groundEdges.get(st);
   if(st.policy==='legacy'){groundEdges.set(st,[]);return[];}
   const edges=st.ground.flatMap(g=>g.poly.map((p,i)=>[p,g.poly[(i+1)%g.poly.length]]));
   if(edges.length>8192)throw new RangeError('Ground exceeds 8192 edges');
   const out=[];
   for(const [a,b] of edges){
    const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),cuts=[0,1,...edges.flatMap(([c,d])=>segmentCuts(a,b,c,d))].sort((a,b)=>a-b);
    for(let i=1;i<cuts.length;i++){
     if(cuts[i]-cuts[i-1]<EPS)continue;
     const t=(cuts[i]+cuts[i-1])/2,x=a[0]+dx*t,z=a[1]+dz*t,nx=-dz/len,nz=dx/len;
     const y0=groundY(st,x-nx*1e-6,z-nz*1e-6),y1=groundY(st,x+nx*1e-6,z+nz*1e-6);
     if(y0!==y1)out.push([[a[0]+dx*cuts[i-1],a[1]+dz*cuts[i-1]],[a[0]+dx*cuts[i],a[1]+dz*cuts[i]],y0,y1]);
    }
   }groundEdges.set(st,out);return out;
  }
  function segmentDistance(ax,az,bx,bz,a,b){
   if(Math.hypot(bx-ax,bz-az)<EPS)return segDist(ax,az,...a,...b);
   if(segmentCuts([ax,az],[bx,bz],a,b).length)return 0;
   return Math.min(segDist(ax,az,...a,...b),segDist(bx,bz,...a,...b),segDist(...a,ax,az,bx,bz),segDist(...b,ax,az,bx,bz));
  }
  function clear(st,ax,az,bx,bz,r=0){
   [ax,az,bx,bz,r].forEach(v=>finite(v,'clear coordinate'));if(r<0)throw new RangeError('Clear radius must be nonnegative');
   if(groundY(st,ax,az)===null||groundY(st,bx,bz)===null)return false;
   if(st.policy==='legacy')return moveClear(st.legacy,ax,az,bx,bz,r);
   const zero=Math.hypot(bx-ax,bz-az)<EPS;
   let features;
   if(st.navFeatures){
    const [x0,z0,x1,z1]=st.bounds;if(Math.min(ax,bx)-r<x0||Math.min(az,bz)-r<z0||Math.max(ax,bx)+r>x1||Math.max(az,bz)+r>z1)return false;
    const unique=new Set();for(let z=Math.floor((Math.min(az,bz)-r)/2);z<=Math.floor((Math.max(az,bz)+r)/2);z++)for(let x=Math.floor((Math.min(ax,bx)-r)/2);x<=Math.floor((Math.max(ax,bx)+r)/2);x++)for(const p of st.navFeatures.get(`${x},${z}`)||[])unique.add(p);
    features=unique;
   }else features=movementFeatures(st,ax,az,bx,bz,r);
   for(const poly of features){
    if(inside(poly,ax,az)||inside(poly,bx,bz))return false;
    if(zero){if(nearPoly(poly,ax,az).d<r-1e-8)return false;continue;}
    if(!zero&&clip(poly,ax,az,bx,bz))return false;
    for(let i=0;i<poly.length;i++)if(segmentDistance(ax,az,bx,bz,poly[i],poly[(i+1)%poly.length])<r-1e-8)return false;
   }
   for(const [a,b] of boundaries(st)){const d=segmentDistance(ax,az,bx,bz,a,b);if(d<=EPS||d<r-1e-8)return false;}
   return true;
  }
  const directions=Object.freeze([[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[-1,-1],[1,-1]].map(Object.freeze));
  function nav(st,opts={}){
   record(opts,['cellSize','radius','diagonal','maxTiles'],'nav option');
   const size=opts.cellSize??.5,r=opts.radius??.3,diagonal=opts.diagonal??true,max=opts.maxTiles??262144;
   finite(size,'cellSize');finite(r,'radius');
   if(size<.1||size>2||r<0||r>2||!Number.isInteger(max)||max<1||max>262144)throw new RangeError('Nav size/radius/budget invalid');
   if(typeof diagonal!=='boolean')throw new TypeError('Nav diagonal must be boolean');
   const [ox,oz,x1,z1]=st.bounds,W=Math.ceil((x1-ox)/size),H=Math.ceil((z1-oz)/size),N=W*H;
   if(N>max)throw new RangeError('Nav tile budget exceeded');
   const geometry={...st,ground:st.ground.slice(),panels:st.panels.slice(),props:st.props.slice(),buckets:new Map([...st.buckets].map(([k,v])=>[k,v.map(p=>p.slice())])),cells:st.cells.map(c=>({...c}))};
   if(st.policy==='legacy')geometry.legacy={...st.legacy,solid:st.legacy.solid.slice(),furn:st.legacy.furn.slice(),wh:st.legacy.wh.slice()};
   else{
    geometry.navFeatures=new Map();
    for(const [key,items] of geometry.buckets){
     const polys=[];for(const [type,i] of items){
      const p=type==='prop'?geometry.props[i]:geometry.panels[i];
      if(type==='prop'||geometry.cells.slice(p.c0,p.c1).some(c=>c.active&&c.y0<MOVE_H))polys.push(p.poly);
     }if(polys.length)geometry.navFeatures.set(key,polys);
    }
   }
   const navClear=(ax,az,bx,bz)=>clear(geometry,ax,az,bx,bz,r+1e-5);
   const unit=st.policy==='legacy'&&size===1&&Number.isInteger(ox)&&Number.isInteger(oz)&&r<.499;
   const xs=new Float64Array(N),zs=new Float64Array(N),walk=new Uint8Array(N),masks=new Uint8Array(N),rooms=new Int16Array(N).fill(-1),tags=new Map();
   const revision=geometryVersions.get(st)||0;
   const axes=st.openings.filter(o=>o.kind!=='window'&&o.y0===0&&o.y1>=1).flatMap(o=>o.segments.map(([a,b])=>({a,b,half:o.half})));
   if(revision)for(const p of st.portals)if(!p.inactive&&(p.kind==='hole'||p.kind==='wall'||p.kind==='window'))for(const [a,b] of p.segments)axes.push({a,b,half:p.half});
   for(const axis of breachAxes.get(st)||[])if(axis.walk)axes.push(axis);
   if(st.policy==='legacy')for(const d of st.doors)axes.push({a:[d.hx,d.hz],b:[d.hx+Math.cos(d.base)*.98,d.hz+Math.sin(d.base)*.98],half:.5});
   const tile=(x,z)=>{finite(x,'tile x');finite(z,'tile z');return x<ox||z<oz||x>=x1||z>=z1?-1:Math.floor((z-oz)/size)*W+Math.floor((x-ox)/size);};
   for(let i=0;i<N;i++){
    const x0=ox+i%W*size,z0=oz+Math.floor(i/W)*size,xhi=Math.min(x0+size,x1),zhi=Math.min(z0+size,z1),cx=(x0+xhi)/2,cz=(z0+zhi)/2,choices=[[cx,cz]],snaps=[];
    if(unit){xs[i]=cx;zs[i]=cz;walk[i]=!isBlock(geometry.legacy,Math.floor(cx),Math.floor(cz));if(walk[i])rooms[i]=roomAt(st,cx,cz)?.idx??-1;continue;}
    if(!revision&&navClear(cx,cz,cx,cz)){xs[i]=cx;zs[i]=cz;walk[i]=1;rooms[i]=roomAt(st,cx,cz)?.idx??-1;continue;}
    if(st.policy==='legacy'&&Math.floor(x0)===Math.ceil(xhi)-1&&Math.floor(z0)===Math.ceil(zhi)-1&&isBlock(st.legacy,Math.floor(cx),Math.floor(cz))){xs[i]=cx;zs[i]=cz;continue;}
    for(const {a,b,half} of axes){
     const ux=(b[0]-a[0]),uz=(b[1]-a[1]),L=Math.hypot(ux,uz),nx=-uz/L,nz=ux/L,mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
     const along=(cx-mx)*ux/L+(cz-mz)*uz/L,normal=(cx-mx)*nx+(cz-mz)*nz;
     if(Math.abs(along)>L/2+size||Math.abs(normal)>half+r+size)continue;
     const x=cx-along*ux/L,z=cz-along*uz/L;
     if(x>=x0-EPS&&x<=xhi+EPS&&z>=z0-EPS&&z<=zhi+EPS)snaps.push([x,z]);
    }
    if(st.policy==='legacy'){
     const lx=Math.floor(cx)+.5,lz=Math.floor(cz)+.5;
     if(lx>=x0-EPS&&lx<=xhi+EPS)choices.push([lx,cz]);
     if(lz>=z0-EPS&&lz<=zhi+EPS)choices.push([cx,lz]);
     if(lx>=x0-EPS&&lx<=xhi+EPS&&lz>=z0-EPS&&lz<=zhi+EPS)choices.push([lx,lz]);
    }
    for(let z=0;z<5;z++)for(let x=0;x<5;x++)choices.push([x0+(x+.5)*(xhi-x0)/5,z0+(z+.5)*(zhi-z0)/5]);
    // Opening-axis points win, then deterministic closest clear sub-sample.
    choices.sort((a,b)=>Math.hypot(a[0]-cx,a[1]-cz)-Math.hypot(b[0]-cx,b[1]-cz));
    snaps.sort((a,b)=>Math.hypot(a[0]-cx,a[1]-cz)-Math.hypot(b[0]-cx,b[1]-cz));
    const best=snaps.find(p=>navClear(...p,...p))||choices.find(p=>navClear(...p,...p));
    if(best){xs[i]=best[0];zs[i]=best[1];walk[i]=1;rooms[i]=roomAt(st,...best)?.idx??-1;}else{xs[i]=cx;zs[i]=cz;}
   }
   const doorPorts=st.portals.filter(p=>!p.inactive);
   const openingTags=(ax,az,bx,bz)=>{
    const result=[];
    for(const p of doorPorts)if(p.segments.some(([a,b])=>segmentCuts([ax,az],[bx,bz],a,b).length))result.push(p.idx);
    return result;
   };
   for(let i=0;i<N;i++)if(walk[i])for(let k=0;k<(diagonal?8:4);k++){
    const [dx,dz]=directions[k],x=i%W+dx,z=Math.floor(i/W)+dz;if(x<0||z<0||x>=W||z>=H)continue;const j=z*W+x;
    if(!walk[j]||!(unit&&k<4)&&!navClear(xs[i],zs[i],xs[j],zs[j]))continue;
    masks[i]|=1<<k;const edgeTags=openingTags(xs[i],zs[i],xs[j],zs[j]);if(edgeTags.length)tags.set(i*8+k,edgeTags);
   }
   const check=i=>{if((geometryVersions.get(st)||0)!==revision)throw new Error('Geometry changed; rebuild navigation');if(!Number.isInteger(i)||i<0||i>=N)throw new RangeError('Nav tile out of bounds');return i;};
   const handle=Object.freeze({v:1,stage:st,origin:Object.freeze([ox,oz]),W,H,cellSize:size,radius:r,diagonal,revision,
    tileAt:(x,z)=>{check(0);return tile(x,z);},rep:i=>Object.freeze([xs[check(i)],zs[i]]),walkable:i=>!!walk[check(i)],edges:i=>masks[check(i)],room:i=>rooms[check(i)],
    edgePortals:(i,k)=>{check(i);if(!Number.isInteger(k)||k<0||k>7)throw new RangeError('Nav direction invalid');return Object.freeze((tags.get(i*8+k)||[]).slice());}});
   navData.set(handle,{st,geometry,W,H,N,xs,zs,walk,masks,tags,tile,r,revision});return handle;
  }
  function newField(n){
   const handle={target:null,reachable:false,revision:0};
   const data={nav:n,cost:new Int32Array(navData.get(n).N),next:new Int32Array(navData.get(n).N),heap:new Int32Array(navData.get(n).N),pos:new Int32Array(navData.get(n).N),closed:new Uint8Array(n.stage.portals.length),locked:new Uint8Array(n.stage.portals.length),
    lockedDoors:new Uint8Array(n.stage.doors.length),lockAngles:new Float64Array(n.stage.doors.length),lockSlides:new Float64Array(n.stage.doors.length),count:0};
   fieldData.set(handle,data);return Object.seal(handle);
  }
  function flow(n,targets,out,opts={}){
   const d=navData.get(n);if(!d)throw new TypeError('Unknown nav snapshot');
   if((geometryVersions.get(d.st)||0)!==d.revision)throw new Error('Geometry changed; rebuild navigation');
   record(opts,['closed'],'flow option');
   if(!Array.isArray(targets)||!targets.length)throw new TypeError('Flow needs at least one target');
   // Scalar point and multi-source list are both accepted.
   const sources=typeof targets[0]==='number'?[targets]:targets;
   for(const p of sources)point(p,'flow target');
   const f=out??newField(n),q=fieldData.get(f);if(!q||q.nav!==n)throw new RangeError('Flow buffer belongs to another nav snapshot');
   q.cost.fill(-1);q.next.fill(-1);q.pos.fill(-1);q.closed.fill(0);q.count=0;
   for(const p of d.st.portals)q.locked[p.idx]=p.doors.some(d=>d.locked===true)?1:0;
   d.st.doors.forEach((door,i)=>{q.lockedDoors[i]=Number(door.locked===true);q.lockAngles[i]=door.th||0;q.lockSlides[i]=door.slide||0;});
   if(opts.closed!==undefined){
    if(!Array.isArray(opts.closed))throw new TypeError('Flow closed must be portal ids');
    for(const id of opts.closed){const matches=d.st.portals.filter(p=>p.id===id||p.ref===id);if(!matches.length)throw new RangeError(`Unknown closed portal ${id}`);for(const p of matches)q.closed[p.idx]=1;}
   }
   const less=(a,b)=>q.cost[a]<q.cost[b]||q.cost[a]===q.cost[b]&&a<b;
   const swap=(a,b)=>{const x=q.heap[a];q.heap[a]=q.heap[b];q.heap[b]=x;q.pos[q.heap[a]]=a;q.pos[q.heap[b]]=b;};
   const put=i=>{let pos=q.pos[i];if(pos<0){pos=q.count++;q.heap[pos]=i;q.pos[i]=pos;}while(pos){const p=(pos-1)>>1;if(!less(q.heap[pos],q.heap[p]))break;swap(pos,p);pos=p;}};
   const take=()=>{const i=q.heap[0];q.pos[i]=-1;q.count--;if(q.count){q.heap[0]=q.heap[q.count];q.pos[q.heap[0]]=0;let p=0;while(true){let k=p*2+1;if(k>=q.count)break;if(k+1<q.count&&less(q.heap[k+1],q.heap[k]))k++;if(!less(q.heap[k],q.heap[p]))break;swap(k,p);p=k;}}return i;};
   const blocked=(i,k)=>{const [dx,dz]=directions[k],j=i+dx+dz*d.W;return(d.tags.get(i*8+k)||[]).some(p=>q.closed[p]||q.locked[p])||!lockedClear(d.st,d.xs[i],d.zs[i],d.xs[j],d.zs[j],d.r);};
   for(const target of sources){
    const ti=d.tile(...target);if(ti<0||!clear(d.geometry,...target,...target,0)||!lockedClear(d.st,...target,...target,0))continue;
    const tx=ti%d.W,tz=Math.floor(ti/d.W);
    for(let z=Math.max(0,tz-1);z<=Math.min(d.H-1,tz+1);z++)for(let x=Math.max(0,tx-1);x<=Math.min(d.W-1,tx+1);x++){
     const i=z*d.W+x;if(d.walk[ti]&&Math.hypot(d.xs[ti]-target[0],d.zs[ti]-target[1])<EPS&&i!==ti)continue;
     if(!d.walk[i]||!clear(d.geometry,d.xs[i],d.zs[i],...target,0)||!lockedClear(d.st,d.xs[i],d.zs[i],...target,d.r))continue;
     if(d.st.portals.some(p=>(q.closed[p.idx]||q.locked[p.idx])&&p.segments.some(([a,b])=>segmentDistance(d.xs[i],d.zs[i],...target,a,b)<=EPS)))continue;
     const c=Math.round(Math.hypot(d.xs[i]-target[0],d.zs[i]-target[1])*100);
     if(q.cost[i]<0||c<q.cost[i]){q.cost[i]=c;q.next[i]=-1;put(i);}
    }
   }
   f.target=freezeData(sources.map(p=>p.slice()));f.reachable=q.count>0;
   while(q.count){
    const i=take(),ix=i%d.W,iz=Math.floor(i/d.W);
    for(let k=0;k<8;k++){
     if(!(d.masks[i]&(1<<k))||blocked(i,k))continue;
     const [dx,dz]=directions[k],j=(iz+dz)*d.W+ix+dx,c=q.cost[i]+Math.max(1,Math.round(Math.hypot(d.xs[i]-d.xs[j],d.zs[i]-d.zs[j])*100));
     if(q.cost[j]<0||c<q.cost[j]){q.cost[j]=c;q.next[j]=i;put(j);}
    }
   }return f;
  }
  function fieldIndex(n,f,x,z){
   const d=navData.get(n),q=fieldData.get(f);if(!d||!q||q.nav!==n)throw new RangeError('Field/nav snapshot mismatch');
   if((geometryVersions.get(d.st)||0)!==d.revision)throw new Error('Geometry changed; rebuild navigation');
   d.st.doors.forEach((door,i)=>{if(q.lockedDoors[i]!==Number(door.locked===true)||door.locked===true&&(q.lockAngles[i]!== (door.th||0)||q.lockSlides[i]!== (door.slide||0)))throw new Error('Door lock changed; recompute flow field');});
   for(const p of d.st.portals)if(q.locked[p.idx]!==Number(p.doors.some(d=>d.locked===true)))throw new Error('Door lock changed; recompute flow field');
   finite(x,'field x');finite(z,'field z');const ti=d.tile(x,z);if(ti<0)return-1;
   const available=i=>q.cost[i]>=0&&clear(d.geometry,x,z,d.xs[i],d.zs[i],d.r)&&lockedClear(d.st,x,z,d.xs[i],d.zs[i],d.r)&&!d.st.portals.some(p=>(q.closed[p.idx]||q.locked[p.idx])&&p.segments.some(([a,b])=>segmentDistance(x,z,d.xs[i],d.zs[i],a,b)<=EPS));
   let best=-1,score=Infinity,tx=ti%d.W,tz=Math.floor(ti/d.W);
   for(let zz=Math.max(0,tz-1);zz<=Math.min(d.H-1,tz+1);zz++)for(let xx=Math.max(0,tx-1);xx<=Math.min(d.W-1,tx+1);xx++){
    const i=zz*d.W+xx;if(!available(i))continue;
    if(Math.hypot(x-d.xs[i],z-d.zs[i])<EPS)return i;
    const s=q.cost[i]+Math.hypot(x-d.xs[i],z-d.zs[i])*100;if(s<score){score=s;best=i;}
   }return best;
  }
  function dist(n,f,x,z){
   const i=fieldIndex(n,f,x,z);if(i<0)return-1;const d=navData.get(n);return fieldData.get(f).cost[i]/100+Math.hypot(x-d.xs[i],z-d.zs[i]);
  }
  function step(n,f,x,z,out=[0,0]){
   const i=fieldIndex(n,f,x,z);if(i<0)return null;
   const d=navData.get(n),q=fieldData.get(f);let at=i;
   if(Math.hypot(x-d.xs[i],z-d.zs[i])<.05){
    const next=q.next[i];if(next<0)return null;
    if(clear(d.geometry,x,z,d.xs[next],d.zs[next],d.r+1e-5)&&lockedClear(d.st,x,z,d.xs[next],d.zs[next],d.r)&&!d.st.portals.some(p=>(q.closed[p.idx]||q.locked[p.idx])&&p.segments.some(([a,b])=>segmentDistance(x,z,d.xs[next],d.zs[next],a,b)<=EPS)))at=next;
   }
   if(at<0)return null;out[0]=d.xs[at];out[1]=d.zs[at];return out;
  }
  function stageRun(mission,describe,opts={}){
   record(opts,['maxStageBytes','maxRunBytes'],'stage run option');
   if(!mission||typeof mission.id!=='string'||!Array.isArray(mission.stages)||!mission.stages.length||!mission.stages.every(id=>typeof id==='string'&&id.length)||new Set(mission.stages).size!==mission.stages.length||!mission.stages.includes(mission.start))throw new TypeError('Invalid stage mission');
   if(typeof describe!=='function')throw new TypeError('Stage descriptor resolver required');
   const stageLimit=opts.maxStageBytes??16384,runLimit=opts.maxRunBytes??262144;
   if(!Number.isInteger(stageLimit)||stageLimit<256||!Number.isInteger(runLimit)||runLimit<stageLimit)throw new RangeError('Stage snapshot budget invalid');
   const mid=mission.id,start=mission.start,descs=new Map(),tokens=new WeakMap();
   const bytes=s=>{let n=0;for(const c of s){const k=c.codePointAt(0);n+=k<128?1:k<2048?2:k<65536?3:4;}return n;};
   const data=(value,limit)=>{
    const out=copyData(value);
    const validate=v=>{if(!v||typeof v!=='object')return;const proto=Object.getPrototypeOf(v);if(!Array.isArray(v)&&proto!==null&&proto.constructor?.name!=='Object')throw new TypeError('Stage snapshots must be plain JSON data');for(const k of Reflect.ownKeys(v)){if(typeof k!=='string')throw new TypeError('Stage snapshot symbol key');validate(v[k]);}};
    validate(value);if(bytes(JSON.stringify(out))>limit)throw new RangeError('Stage snapshot byte budget exceeded');return freezeData(out);
   };
   for(const sid of mission.stages){
    const raw=describe(sid);record(raw,['id','kind','rev','arrivals','stairs','backdrop'],'stage descriptor');
    if(raw.id!==sid||!['grid','plan'].includes(raw.kind)||!Number.isInteger(raw.rev)||raw.rev<1)throw new TypeError(`Invalid descriptor ${sid}`);
    const arrivals=raw.arrivals??{};if(!arrivals||typeof arrivals!=='object'||Array.isArray(arrivals))throw new TypeError('Stage arrivals must be a record');
    const entries={};
    for(const id of Object.keys(arrivals)){
     const a=arrivals[id];record(a,['at','dir'],'stage arrival');const at=point(a.at,'arrival');if(a.dir!==undefined)finite(a.dir,'arrival direction');Object.defineProperty(entries,id,{value:freezeData({at,dir:a.dir??null}),enumerable:true});
    }
    if(raw.stairs!==undefined&&!Array.isArray(raw.stairs)||raw.backdrop!==undefined&&!Array.isArray(raw.backdrop))throw new TypeError('Stairs/backdrop must be arrays');
    const ids=new Set(),stairs=(raw.stairs||[]).map(s=>{
     record(s,['id','to','at','arrive','r','oneWay'],'stair');
     if(typeof s.id!=='string'||!s.id||ids.has(s.id)||!mission.stages.includes(s.to)||s.to===sid||typeof s.arrive!=='string')throw new RangeError('Invalid stair reference');
     ids.add(s.id);const r=s.r??.65;finite(r,'stair radius');if(r<=0||s.oneWay!==undefined&&typeof s.oneWay!=='boolean')throw new RangeError('Invalid stair trigger');
     return freezeData({...copyData(s),at:point(s.at,'stair'),r});
    });
    const backdrop=(raw.backdrop||[]).map(b=>{
     record(b,['stage','city','dy','dim'],'backdrop');finite(b.dy,'backdrop dy');
     if((b.stage!==undefined)===(b.city!==undefined)||b.dy===0||b.stage!==undefined&&(!mission.stages.includes(b.stage)||b.stage===sid)||b.city!==undefined&&(typeof b.city!=='string'||!b.city))throw new RangeError('Invalid backdrop reference');
     const dim=b.dim??.6;finite(dim,'backdrop dim');if(dim<0||dim>1)throw new RangeError('Invalid backdrop dim');return freezeData({...copyData(b),dim});
    });
    descs.set(sid,freezeData({id:sid,kind:raw.kind,rev:raw.rev,arrivals:entries,stairs,backdrop}));
   }
   for(const desc of descs.values()){
    for(const arrival of Object.values(desc.arrivals))if(desc.stairs.some(s=>Math.hypot(s.at[0]-arrival.at[0],s.at[1]-arrival.at[1])<=s.r))throw new RangeError('Arrival must be outside every stair trigger');
    for(const stair of desc.stairs){
     const target=descs.get(stair.to);if(!Object.prototype.hasOwnProperty.call(target.arrivals,stair.arrive))throw new RangeError('Stair arrival missing');
     if(!stair.oneWay&&!target.stairs.some(s=>s.to===desc.id))throw new RangeError('Stair must be paired or marked oneWay');
    }
   }
   let current=start,active=false,states=new Map(),entry=null,bag=freezeData({}),revision=0;
   const envelope=(sid,value)=>value===null?null:freezeData({sid,rev:descs.get(sid).rev,data:data(value,stageLimit)});
   const encoded=(cur,store,checkpoint,b)=>data({v:1,mission:mid,current:cur,states:Object.fromEntries(store),entry:checkpoint,bag:b},runLimit);
   const prepare=(to,arrive=null)=>{
    if(!descs.has(to))throw new RangeError('Unknown target stage');
    const desc=descs.get(to);
    if(arrive!==null&&!Object.prototype.hasOwnProperty.call(desc.arrivals,arrive))throw new RangeError('Unknown stage arrival');
    const plan=Object.freeze({from:active?current:null,to,arrive,arrival:arrive===null?null:desc.arrivals[arrive],desc,snapshot:states.get(to)?.data??null});
    tokens.set(plan,revision);return plan;
   };
   const candidate=(plan,leaving,checkpoint,nextBag)=>{
    if(!tokens.has(plan)||tokens.get(plan)!==revision)throw new Error('Stale or foreign stage transition');
    const next=new Map(states),saved=plan.from===null?null:envelope(plan.from,leaving),incoming=envelope(plan.to,checkpoint),b=data(nextBag,runLimit);
    if(!incoming||plan.from!==null&&!saved)throw new TypeError('Stage entry/leaving snapshots required');
    if(saved)next.set(plan.from,saved);next.set(plan.to,incoming);
    return{next,incoming,b,encoded:encoded(plan.to,next,incoming,b)};
   };
   const manager={
    version:1,mission:mid,get current(){return current;},get active(){return active;},
    describe:sid=>{if(!descs.has(sid))throw new RangeError('Unknown stage');return descs.get(sid);},
    prepare,
    prepareStair:id=>{
     if(!active)throw new Error('Stage run has not entered a stage');
     const stair=descs.get(current).stairs.find(s=>s.id===id);if(!stair)throw new RangeError('Unknown stair');return prepare(stair.to,stair.arrive);
    },
    preview:(plan,leaving,checkpoint,nextBag={})=>candidate(plan,leaving,checkpoint,nextBag).encoded,
    commit:(plan,leaving,checkpoint,nextBag={})=>{
     const c=candidate(plan,leaving,checkpoint,nextBag);
     states=c.next;current=plan.to;entry=c.incoming;bag=c.b;active=true;revision++;tokens.delete(plan);return c.encoded;
    },
    retry:()=>{if(!active)throw new Error('Stage run has not entered a stage');return freezeData({sid:current,snapshot:entry.data,bag});},
    restart:()=>{current=start;states=new Map();entry=null;bag=freezeData({});active=false;revision++;},
    encode:()=>encoded(current,states,entry,bag),
    decode:saved=>{
     record(saved,['v','mission','current','states','entry','bag'],'stage checkpoint');
     if(saved.v!==1||saved.mission!==mid||!descs.has(saved.current)||!saved.states||typeof saved.states!=='object'||Array.isArray(saved.states))throw new TypeError('Invalid stage checkpoint');
     data(saved,runLimit);const next=new Map();
     const restore=(sid,v)=>{
      record(v,['sid','rev','data'],'stage snapshot');
      if(!descs.has(sid)||v.sid!==sid||v.rev!==descs.get(sid).rev)throw new RangeError('Stage snapshot revision changed');
      if(v.data===null)throw new TypeError('Retained stage snapshot data cannot be null');
      return envelope(sid,v.data);
     };
     for(const [sid,v] of Object.entries(saved.states))next.set(sid,restore(sid,v));
     const checkpoint=saved.entry===null?null:restore(saved.current,saved.entry),b=data(saved.bag,runLimit);
     if(!checkpoint&&(next.size||saved.current!==start)||checkpoint&&!next.has(saved.current))throw new TypeError('Checkpoint entry missing');
     states=next;current=saved.current;entry=checkpoint;bag=b;active=checkpoint!==null;revision++;return manager;
    },
    backdrops:sid=>{if(!descs.has(sid))throw new RangeError('Unknown backdrop stage');return descs.get(sid).backdrop;}
   };
   return Object.freeze(manager);
  }
  return{compile,fromCells,syncCell,damage,damageLock,sight,trace,move,groundY,coverAt,roomAt,portals,portalAt,portalOpen,clear,nav,flow,step,dist,stageRun};
 })();
 return Object.freeze({version:3,materials,...freeform,buildGrid,hsh,cell:Object.freeze({isSolid,isBlock,isCover,rayBlock,doorHit,rayLen,los,rayWall,collideGrid,moveClear,collideDoors,bfs}),
  geometry:Object.freeze({doorEnd,segDist,segInt})});
})();
