'use strict';
/* VENUE FRONTS: the mall, Velvet Palms and Nine of Nine's all face the camera now. Each map ends (at the bottom, the south)
   with its front wall and doors, a sidewalk ('s', lamps 'l'), a parking lay-by ('p', your bay 'C'), a two-lane road (',') and a
   grass verge ('v'). You drive in along the road, pull into your bay, get out on the kerb side and walk up the sidewalk to the doors;
   leaving, you pull out of the bay and drive off along the road. Other cars sit in some of the bays.
   venueLot() reads those rows from the map; the hub setups call it, and buildStatic bakes drawVenueLot() into the static batch (venueStatic).
   Loaded after mall.js, before the main inline script: nothing here touches main-script globals at load time. */
function venueLot(g){const W=g.W,H=g.H,row=ch=>{for(let z=H-1;z>=0;z--)if(g.rows[z]&&g.rows[z].includes(ch))return z;return -1;};
 const pz=row('p');if(pz<0)return null;let rz=pz+1;while(rz<H&&!(g.rows[rz]&&g.rows[rz].includes(',')))rz++;
 const L=g.lot={bayZ:pz+0.5,roadZ:rz+1.0,kerbZ:pz,top:pz,cars:[]};
 /* the loader's padding ring would stand as a dark wall across the road and the verge: flatten it from the lay-by down */
 for(let z=pz;z<H;z++)for(let x=0;x<W;x++){if(z<H-1&&x>0&&x<W-1)continue;const i=z*W+x,road=g.rows[z]&&(g.rows[z][Math.min(W-2,Math.max(1,x))]===','||g.rows[z][Math.min(W-2,Math.max(1,x))]==='p');
  g.wh[i]=0.02;g.wallT[i]=g.topT[i]=road?7:38;g.glow[i]=0;}
 /* parked cars in some of the other bays (never next to yours) */
 const px=g.park?g.park.x:-99,cols=[[0.92,0.92,0.9],[0.1,0.1,0.12],[0.75,0.12,0.15],[0.2,0.45,0.85],[0.95,0.75,0.2],[0.3,0.75,0.65],[0.9,0.5,0.7]];
 for(let x=2.6,i=0;x<W-2;x+=2.8,i++){if(Math.abs(x-px)<3.4)continue;const h=WORLD.hsh(x|0,pz,7,g.W*31+g.H);if(h<0.45)continue;
  const c={x,z:L.bayZ,col:cols[Math.floor(h*977)%cols.length],dir:h>0.72?1:-1};L.cars.push(c);g.solids=g.solids||[];g.solids.push({x,z:L.bayZ,w:2.35,d:1.05});}
 /* the lot and its parked cars are baked into the static batch (venueStatic), so rebuild it now the cars are placed */
 if(typeof buildStatic==='function'&&g.staticB)buildStatic(g);
 return L;}
/* bay lines, the kerb, the road's centre dashes and edge lines, the parked cars */
function drawVenueLot(B,g){const L=g.lot;if(!L)return;const W=g.W,WH=[0.92,0.92,0.88],YL=[0.95,0.78,0.2],z0=L.top,z1=L.top+1;
 B.box(TRS(W/2,0.07,z0+0.02,0,W,0.14,0.12),[0.78,0.78,0.76]);
 for(let x=1.2;x<W-1;x+=2.8)B.box(TRS(x,0.012,(z0+z1)/2,0,0.07,0.012,0.95),WH);
 B.box(TRS(W/2,0.012,z1-0.04,0,W,0.012,0.06),WH);
 for(let x=0.5;x<W;x+=1.6)B.box(TRS(x,0.012,L.roadZ,0,0.8,0.012,0.07),YL);
 B.box(TRS(W/2,0.012,L.roadZ+0.94,0,W,0.012,0.06),WH);
 if(g.park){const p=g.park;B.box(TRS(p.x,0.013,p.z,0,1.4,0.012,0.12),[0.3,0.75,1],true);}
 for(const c of L.cars)drawCar(B,c.x,c.z,c.col,c.dir,0);}
/* drive in along the road, swing into the bay; get out on the kerb side */
function venueArrivePath(g,c){const L=g.lot,x1=c.x,z=c.z;return[[x1-18,L.roadZ],[x1-4.2,L.roadZ],[x1-1.6,z+0.1],[x1,z]];}
function venueDepartPath(g,c){const L=g.lot,x=c.x,z=c.z;return[[x,z],[x+1.8,z+0.15],[x+4.4,L.roadZ],[x+26,L.roadZ]];}
/* the parts of a venue that never move, baked into the static batch once (buildStatic calls this at its end): the lot, and the
   whole mall apart from its moving bits (mall.js drawMall) */
function venueStatic(B,g){if(g.lot)drawVenueLot(B,g);if(g.mall&&typeof drawMall==='function')drawMall(B,g);}
