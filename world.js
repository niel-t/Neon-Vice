'use strict';
// Legacy cell adapter. All state belongs to the caller; no DOM/GL or gameplay globals.
const WORLD=(()=>{
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
 return Object.freeze({version:1,buildGrid,hsh,cell:Object.freeze({isSolid,isBlock,isCover,rayBlock,doorHit,rayLen,los,rayWall,collideGrid,moveClear,collideDoors,bfs}),
  geometry:Object.freeze({doorEnd,segDist,segInt})});
})();
