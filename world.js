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
  const EPS=1e-9,SKIN=1e-4,MOVE_H=1;
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
   return{v:2,policy,id,bounds:Object.freeze(bounds.slice()),combat,ground:[],panels:[],cells:[],doors:[],props:[],buckets:new Map(),rooms:[],spawns:[]};
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
   record(stage,['id','bounds','combat','ground','walls','props','rooms','spawns'],'stage');
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
   }
   for(const p of stage.props||[]){
    record(p,['id','poly','build','cov','h'],'prop');id(p.id);surface('prop',p);const poly=polygon(p.poly,'prop',true);poly.forEach(within);
    const prop=Object.freeze({id:p.id,poly:Object.freeze(poly),build:p.build,cov:p.cov,h:p.h});st.props.push(prop);addBucket(st,'prop',st.props.length-1,poly);
   }
   for(const r of stage.rooms||[]){if(!r||typeof r!=='object'||Array.isArray(r)||!Object.prototype.hasOwnProperty.call(r,'id'))throw new TypeError('Room must have its own id');id(r.id);if(r.combat!==undefined&&typeof r.combat!=='boolean')throw new TypeError('Room combat must be boolean');}
   st.rooms=copyData(stage.rooms||[]);st.spawns=copyData(stage.spawns||[]);
   return st;
  }
  function fromCells(g){
   if(!g||!g.solid||!g.furn||!g.wh)throw new TypeError('fromCells requires a loaded grid');
   const st=base(g.def.name,[0,0,g.W,g.H],!g.def.hub,'legacy');st.legacy=g;st.legacyPanel=new Int32Array(g.W*g.H).fill(-1);st.doors=g.doors||[];
   for(let z=0;z<g.H;z++)for(let x=0;x<g.W;x++){
    const i=z*g.W+x;
    // Empty cells are reserved as inactive panels so solidification can sync safely.
    const p=Object.freeze({ref:i,ax:x,az:z+.5,bx:x+1,bz:z+.5,ux:1,uz:0,nx:0,nz:1,half:.5,kind:'wall',build:null,cov:'full',c0:st.cells.length,c1:st.cells.length+1,
     poly:Object.freeze([[x,z],[x+1,z],[x+1,z+1],[x,z+1]].map(q=>Object.freeze(q)))});
    st.cells.push({panel:st.panels.length,y0:0,y1:g.wh[i]||WALL_H,hp:null,active:!!g.solid[i]});
    st.legacyPanel[i]=st.panels.length;st.panels.push(p);addBucket(st,'panel',st.panels.length-1,p.poly);
    if(g.furn[i]){const poly=p.poly;st.props.push(Object.freeze({id:`furn:${i}`,ref:i,poly,build:null,cov:'full',h:1.15}));addBucket(st,'prop',st.props.length-1,poly);}
   }
   return st;
  }
  function syncCell(st,g,i){
   if(st.policy!=='legacy'||st.legacy!==g||!Number.isInteger(i)||i<0||i>=st.legacyPanel.length)throw new RangeError('Invalid adapter sync');
   const p=st.panels[st.legacyPanel[i]],c=st.cells[p.c0];c.active=!!g.solid[i];c.y1=g.wh[i]||WALL_H;
   // Furniture footprints were captured at compile; additions require recompilation.
   if(g.furn[i]&&!st.props.some(p=>p.ref===i))throw new Error('New furniture requires adapter recompile');
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
  return{compile,fromCells,syncCell,sight,trace,move,groundY,coverAt};
 })();
 return Object.freeze({version:2,materials,...freeform,buildGrid,hsh,cell:Object.freeze({isSolid,isBlock,isCover,rayBlock,doorHit,rayLen,los,rayWall,collideGrid,moveClear,collideDoors,bfs}),
  geometry:Object.freeze({doorEnd,segDist,segInt})});
})();
