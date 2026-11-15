'use strict';
/* ---- Velvet Palms life: the place is busy now ----
   Seated patrons in the booths, on the stage rail and at the bar, people standing round high-top tables, a DJ at his booth,
   security in black suits inside (by the VIP doors, the dressing room and the foyer arch) and a bouncer out front at the door.
   Every so often a guest picks a dancer off the stage and takes her to a free VIP room for a private dance (he makes it rain
   now and then), then she walks back to her pole and he goes back to the floor. clubLife runs at the end of clubSetup,
   clubLifeTick in clubTick, drawClubX (the fixed decor) and drawClubXDyn (lights that blink) from drawClub. */
const CLUB_NV_GAP=[16,30];
/* a seat for a club extra: kind 'patron' (they stay put; npcStep leaves them alone) */
function clubExtra(g,x,z,a,look,o){const n=makeChar(x,z,look||Object.assign(NPCLOOK.guest(),{calm:1}),false);Object.assign(n,{kind:'patron',state:'idle',a,a0:a,r:0.28},o||{});n.body=n.look.body;g.npcs.push(n);return n;}
function clubLife(g){const c=g.club,W=g.W,ch=(x,z)=>(g.rows[z]||'')[x]||'#',R=c.room,sc=c.sc;
 const cells=k=>{const o=[];for(let z=0;z<g.H;z++)for(let x=0;x<W;x++)if(g.rows[z][x]===k)o.push({x,z});return o;};
 /* the stage-rail patrons sit on their stools now, facing the stage */
 for(const n of g.npcs)if(n.kind==='patron')Object.assign(n,{seat:true,seatK:1,y:0.31,a0:n.a});
 /* booths along the west wall and the foyer sofas: every other sofa has someone on it, facing out from the wall */
 cells('h').forEach((q,i)=>{if(i%2===0)return;const a=ch(q.x-1,q.z)==='#'?Math.PI/2:ch(q.x+1,q.z)==='#'?-Math.PI/2:ch(q.x,q.z-1)==='#'?0:Math.PI;
  clubExtra(g,q.x+0.5+Math.sin(a)*0.08,q.z+0.5+Math.cos(a)*0.08,a,null,{seat:true,seatK:1,y:SEAT_Y});});
 /* two at the bar, on the stools facing Tony */
 cells('y').forEach((q,i)=>{if(i%2)return;clubExtra(g,q.x+0.5,q.z+0.5,Math.PI/2,null,{seat:true,seatK:1,y:0.31});});
 /* high-top tables on the east floor, two people standing at each */
 c.tops=[];for(const z of [13,17]){const x=21;if(isBlock(x,z))continue;c.tops.push({x:x+0.5,z:z+0.5});g.solid[z*W+x]=1;
  for(const s of [-1,1])clubExtra(g,x+0.5+s*0.62,z+0.5+0.08*s,s>0?-Math.PI/2:Math.PI/2);}
 /* the DJ booth against the north wall, and the DJ */
 c.dj={x:22.5,z:R.z0+0.62};for(let x=21;x<=23;x++)g.solid[R.z0*W+x]=1;
 const dj=clubExtra(g,c.dj.x,R.z0+0.22,0,{calm:1,skin:hex(0x8a5a3a),jacket:hex(0xf4f4f0),shirt:hex(0xff4fa6),pants:hex(0xf4f4f0),shoes:hex(0xf4f4f0),hs:'big',hair:hex(0x141010),shades:true,chain:true,medallion:true});dj.r=0.2;dj.clubdj=true;
 /* security inside, facing the floor, and the bouncer at the front door (the foyer one stays where he was) */
 const sec=(x,z,a)=>{const b=makeChar(x,z,NPCLOOK.guard(),false);Object.assign(b,{kind:'bouncer',state:'idle',a,a0:a,r:0.3,sec:true});b.body=b.look.body;g.npcs.push(b);return b;};
 const dz=c.rooms.map(r=>r.doorX);for(let i=0;i+1<dz.length;i++)sec((dz[i]+dz[i+1])/2,R.z1-0.6,Math.PI);
 sec(R.x0+6.4,R.z1-0.6,Math.PI);
 {let dd=null;for(let x=0;x<W&&!dd;x++)if(g.rows[R.z0-1]&&g.rows[R.z0-1][x]==='D')dd=x;if(dd!==null)sec(dd+2.1,R.z0+0.55,0);}
 if(c.front){c.doorman=sec(c.front.x+0.5-1.3,c.front.z+0.5,0);c.doorman.doorman=true;}
 c.nv=null;c.nvT=rnd(8,14);}
/* a VIP room someone else is using */
function clubRoomBusy(g,r){const c=g&&g.club;return !!(c&&c.nv&&c.nv.r===r);}
/* a BFS field toward world cell (x,z), kept per target */
function clubField(g,x,z){const c=g.club,k=Math.floor(x)+','+Math.floor(z);c.fields=c.fields||{};let f=c.fields[k];if(!f){f=c.fields[k]=new Int16Array(g.W*g.H);WORLD.cell.bfs(g,f,Math.floor(x),Math.floor(z));}return f;}
function clubLifeTick(g,dt){const c=g.club;if(!c||c.nv===undefined)return;const v=c.vip,p=g.player;
 /* the DJ bobs along */
 for(const n of g.npcs)if(n.clubdj){n.ph=(n.ph||0)+dt*4.2;n.a=Math.sin(n.ph*0.5)*0.35;}
 if(!c.nv){c.nvT-=dt;if(c.nvT>0)return;c.nvT=rnd(4,8);
  const free=c.rooms.filter(r=>r!==v.room&&!(p&&inRoom(r,p.x,p.z)));
  const girls=c.dancers.filter(d=>!d.walking&&!d.lapDance&&!(d.cold>0)&&!(v.escort&&v.escort.d===d));
  if(!free.length||girls.length<2||!c.dancers.length)return;
  const guests=g.npcs.filter(n=>n.kind==='guest'&&!n.busy&&inRoom(c.room,n.x,n.z));if(!guests.length)return;
  const n=pick(guests),d=pick(girls),r=pick(free),st=stageStep(g,n.x,n.z);
  n.busy=true;n.vx=n.vz=0;d.walking=true;d.npcVip=true;d.boost=0.6;
  c.nv={n,d,r,ph:'down',t:0,fx:d.x,fz:d.z,fy:d.y,tx:st.x,tz:st.z,rain:rnd(2,4)};return;}
 const s=c.nv,n=s.n,d=s.d,r=s.r;s.t+=dt;
 const walkTo=(o,x,z,sp)=>{const dd=Math.hypot(x-o.x,z-o.z);if(dd>0.25)clubStep(g,o,clubField(g,x,z),x,z,sp,dt);else{o.vx=o.vz=0;}return dd;};
 if(s.ph==='down'){/* she hops down off the stage beside him */const k=Math.min(1,s.t/0.8);d.x=s.fx+(s.tx-s.fx)*k;d.z=s.fz+(s.tz-s.fz)*k;d.y=s.fy*(1-k)+Math.sin(k*Math.PI)*0.25;d.walk=(d.walk||0)+dt*9;d.a=Math.atan2(s.tx-s.fx,s.tz-s.fz);
  n.a+=clamp(angDiff(n.a,Math.atan2(d.x-n.x,d.z-n.z)),-5*dt,5*dt);if(k>=1){d.y=0;s.ph='go';s.t=0;}}
 else if(s.ph==='go'){/* he leads her to the room; she follows a step behind */
  const left=walkTo(n,r.chairX,r.chairZ,1.5),gap=Math.hypot(n.x-d.x,n.z-d.z);
  if(gap>0.9)clubStep(g,d,clubField(g,r.chairX,r.chairZ),inRoom(r,n.x,n.z)?r.chairX:n.x,inRoom(r,n.x,n.z)?r.chairZ:n.z,1.7,dt);else d.vx=d.vz=0;
  if((left<0.3&&Math.hypot(r.chairX-d.x,r.chairZ-d.z)<1.6)||s.t>30){s.ph='dance';s.t=0;s.dur=rnd(16,24);d.walking=false;d.lapDance=true;d.boost=1.4;}}
 else if(s.ph==='dance'){Object.assign(n,{x:r.chairX,z:r.chairZ,y:0.22,vx:0,vz:0,a:Math.PI,crouchK:0.68});
  d.ph+=dt*3.2;d.vx=d.vz=0;d.x=r.chairX+Math.sin(d.ph)*0.16;d.z=r.chairZ-0.52+Math.cos(d.ph*2)*0.08;d.y=0.02+Math.abs(Math.sin(d.ph*2))*0.06;d.a=Math.atan2(n.x-d.x,n.z-d.z);
  s.rain-=dt;if(s.rain<=0){s.rain=rnd(3,6);throwBills(g,n.x,0.95,n.z,d.x,d.z,9,0.7,0.6,1.6,1.4,2.6,rnd(4,6));}
  if(s.t>s.dur){s.ph='back';s.t=0;d.lapDance=false;d.walking=true;d.y=0;d.x=r.chairX+0.6;d.z=r.chairZ-0.9;n.y=0;n.crouchK=0;n.z=r.chairZ-0.7;
   const st=stageStep(g,d.pole.x,d.pole.z);s.bx=st.x;s.bz=st.z;s.ox=r.doorX;s.oz=r.z0-1.5;s.dn=s.gn=false;}}
 else if(s.ph==='back'){/* she walks back to her pole, he walks back out onto the floor */
  if(!s.dn){if(walkTo(d,s.bx,s.bz,2.0)<0.35||s.t>25){s.dn=true;s.ut=0;s.ux=d.x;s.uz=d.z;}}
  else if(s.ut<1){s.ut=Math.min(1,s.ut+dt/0.8);const k=s.ut;d.x=s.ux+(d.pole.x-s.ux)*k;d.z=s.uz+(d.pole.z-s.uz)*k;d.y=0.36*k+Math.sin(k*Math.PI)*0.25;if(k>=1){d.walking=false;d.npcVip=false;d.vx=d.vz=0;}}
  if(!s.gn&&(walkTo(n,s.ox,s.oz,1.4)<0.35||s.t>25)){s.gn=true;n.busy=false;n.tgt=null;n.wait=rnd(1,3);}
  if(s.gn&&!d.walking){c.nv=null;c.nvT=rnd(CLUB_NV_GAP[0],CLUB_NV_GAP[1]);}}}
/* the fixed decor: palms, a jukebox and a cigarette machine, the DJ booth, high-top tables, speaker stacks and floor cans by the
   stage, the bar dressed with taps, glasses, a till and a champagne tower, drinks on the booth tables, a hostess stand in the foyer */
function drawClubX(B,g){const c=g.club,R=c.room,st=g.stage,H=WALL_H,bx=(x,y,z,sx,sy,sz,col,em,ry)=>B.box(TRS(x,y,z,ry||0,sx,sy,sz),col,!!em),
  CHROME=[0.82,0.84,0.9],BLK=[0.06,0.05,0.07],GLASS=[0.85,0.9,0.98],PINKN=[1,0.3,0.7];
 /* palms in gold pots in the corners */
 const palm=(x,z)=>{bx(x,0.2,z,0.36,0.4,0.36,GOLD);bx(x,0.41,z,0.3,0.03,0.3,[0.2,0.12,0.06]);bx(x,0.75,z,0.06,0.7,0.06,[0.42,0.28,0.12]);
  for(let i=0;i<7;i++){const a=i*TAU/7;B.box(A.mul(A.mul(A.mul(A.T(x+Math.sin(a)*0.22,1.12,z+Math.cos(a)*0.22),A.RY(a)),A.RX(0.55)),A.S(0.12,0.03,0.5)),i%2?[0.16,0.5,0.2]:[0.12,0.42,0.16]);}};
 palm(R.x0+2.5,R.z0+0.45);palm(R.x1-1.45,R.z0+0.45);palm(R.x0+0.5,R.z1-0.5);
 /* the jukebox: a glowing arch on the north wall */
 {const x=R.x0+5.5,z=R.z0+0.24;bx(x,0.45,z,0.62,0.9,0.4,[0.45,0.12,0.06]);bx(x,0.92,z,0.62,0.1,0.4,[0.55,0.16,0.08]);bx(x,0.62,z+0.205,0.46,0.34,0.01,[1,0.75,0.35],true);
  bx(x,0.32,z+0.205,0.5,0.14,0.01,PINKN,true);for(const s of [-1,1])bx(x+s*0.28,0.5,z+0.205,0.04,0.86,0.012,[0.3,0.9,1],true);}
 /* a cigarette machine beside it */
 {const x=R.x0+7.1,z=R.z0+0.22;bx(x,0.5,z,0.5,1.0,0.36,[0.7,0.08,0.1]);bx(x,0.68,z+0.185,0.38,0.42,0.01,[0.95,0.92,0.82],true);for(let i=0;i<4;i++)bx(x-0.13+i*0.087,0.36,z+0.185,0.05,0.04,0.012,CHROME);}
 /* the DJ booth: a black-and-chrome counter with a pink neon front, two turntables and a mixer; speaker stacks either side */
 if(c.dj){const x=c.dj.x,z=c.dj.z;bx(x,0.45,z,2.4,0.9,0.5,BLK);bx(x,0.92,z,2.46,0.05,0.56,CHROME);bx(x,0.5,z+0.255,2.3,0.06,0.01,PINKN,true);bx(x,0.22,z+0.255,2.3,0.03,0.01,[0.3,0.9,1],true);
  for(const s of [-1,1]){bx(x+s*0.62,0.97,z-0.05,0.42,0.04,0.36,[0.12,0.12,0.14]);bx(x+s*0.62,1.0,z-0.05,0.3,0.012,0.3,[0.05,0.05,0.05]);bx(x+s*0.76,1.01,z+0.06,0.03,0.02,0.16,CHROME);}
  bx(x,0.98,z-0.04,0.32,0.05,0.3,[0.18,0.18,0.2]);
  for(const s of [-1,1]){const sx=x+s*1.55;bx(sx,0.55,z-0.05,0.55,1.1,0.5,BLK);for(const y of [0.32,0.78]){bx(sx,y,z+0.205,0.36,0.36,0.01,[0.16,0.16,0.18]);bx(sx,y,z+0.21,0.16,0.16,0.01,[0.3,0.3,0.34]);}}}
 /* high-top tables: chrome pole, round black top, drinks */
 for(const t of c.tops||[]){for(const a of [0,Math.PI/4])bx(t.x,0.02,t.z,0.3,0.04,0.3,[0.35,0.35,0.4],false,a);bx(t.x,0.5,t.z,0.06,0.96,0.06,CHROME);for(const a of [0,Math.PI/4]){bx(t.x,0.985,t.z,0.64,0.03,0.64,GOLD,false,a);bx(t.x,1.0,t.z,0.6,0.03,0.6,[0.16,0.04,0.1],false,a);}
  bx(t.x+0.1,1.06,t.z-0.08,0.05,0.1,0.05,GLASS);bx(t.x+0.1,1.04,t.z-0.08,0.04,0.05,0.04,[1,0.6,0.2],true);bx(t.x-0.12,1.07,t.z+0.06,0.06,0.12,0.06,[0.25,0.12,0.05]);bx(t.x-0.02,1.02,t.z+0.12,0.1,0.02,0.1,[0.3,0.3,0.32]);}
 /* the stage: speaker stacks on the front corners, floor cans pointing up at the poles */
 {const zf=st.z1+0.45;for(const x of [st.x0-0.45,st.x1+0.45]){bx(x,0.5,zf,0.6,1.0,0.5,BLK);bx(x,0.3,zf-0.255,0.4,0.4,0.01,[0.18,0.18,0.2]);bx(x,0.75,zf-0.255,0.24,0.24,0.01,[0.22,0.22,0.24]);}
  for(const z of [st.z0-0.3,st.z1+0.3])for(let i=0;i<3;i++){const x=st.x0+0.8+i*(st.x1-st.x0-1.6)/2;bx(x,0.09,z,0.18,0.18,0.18,BLK);bx(x,0.19,z,0.14,0.02,0.14,[1,0.85,0.55],true);}}
 /* the bar: beer taps, a till, glasses along the top, a champagne tower at the north end, a lit shelf behind the bottles */
 {const K=[];for(let z=0;z<g.H;z++)for(let x=0;x<g.W;x++)if(g.rows[z][x]==='K')K.push({x:x+0.5,z:z+0.5});
  if(K.length){const kx=K[0].x,z0=K[0].z,z1=K[K.length-1].z;
   for(let i=0;i<3;i++){const z=z0+1.4+i*0.18;bx(kx+0.1,1.06,z,0.05,0.14,0.05,CHROME);bx(kx+0.1,1.15,z,0.08,0.05,0.03,[0.85,0.1,0.15]);}
   bx(kx+0.05,1.08,z1-0.6,0.3,0.16,0.26,[0.2,0.2,0.22]);bx(kx-0.03,1.15,z1-0.6,0.12,0.06,0.2,[0.3,1,0.5],true);
   for(let z=z0+2.4;z<z1-1.2;z+=0.55){bx(kx-0.25,1.03,z,0.05,0.08,0.05,GLASS);bx(kx-0.25,1.02,z,0.04,0.04,0.04,[1,0.75,0.3],true);}
   const cx2=kx,cz2=z0+0.1;for(let l=0;l<4;l++){const n=4-l;for(let i=0;i<n;i++)for(let j=0;j<n;j++)bx(cx2+(i-(n-1)/2)*0.07,1.02+l*0.075,cz2+(j-(n-1)/2)*0.07,0.05,0.07,0.05,[0.95,0.88,0.6]);}
   bx(cx2,1.35,cz2,0.06,0.18,0.06,[0.06,0.22,0.1]);
   for(const y of [0.62,1.06])bx(R.x1-1.08,y,(z0+z1)/2,0.03,0.035,z1-z0,[1,0.7,0.3],true);}}
 /* drinks and an ashtray on the booth tables */
 for(let z=0;z<g.H;z++)for(let x=0;x<g.W;x++){if(g.rows[z][x]!=='o')continue;const cx=x+0.5,cz=z+0.5;
  for(const [ox,oz,col] of [[0.25,-0.22,[1,0.4,0.6]],[0.25,0.24,[0.4,0.9,1]]]){bx(cx+ox,0.79,cz+oz,0.012,0.08,0.012,GLASS);bx(cx+ox,0.86,cz+oz,0.08,0.03,0.08,GLASS);bx(cx+ox,0.86,cz+oz,0.06,0.022,0.06,col,true);}
  bx(cx-0.22,0.77,cz+0.25,0.12,0.03,0.12,[0.25,0.25,0.28]);}
 /* the foyer: a hostess stand with a lamp by the arch */
 if(c.front){const x=c.front.x+0.5-2.2,z=c.front.z-3.6;bx(x,0.5,z,0.5,1.0,0.36,[0.42,0.02,0.07]);bx(x,1.02,z,0.56,0.04,0.42,GOLD);bx(x+0.15,1.12,z-0.08,0.08,0.16,0.08,[1,0.8,0.5],true);bx(x-0.08,1.05,z,0.22,0.01,0.28,[0.95,0.93,0.86]);}}
/* things that blink: the DJ's mixer, the stage cans' colour, the jukebox bubble tubes */
function drawClubXDyn(D,g){const c=g.club,T=g.T;if(!c.dj)return;const x=c.dj.x,z=c.dj.z;
 for(let i=0;i<6;i++){const on=(Math.floor(T*8)+i*3)%5<3;D.box(TRS(x-0.1+i*0.04,1.015,z-0.08,0,0.02,0.01,0.02),on?[0.3,1,0.5]:[1,0.25,0.3],true);}
 for(const s of [-1,1])D.box(TRS(x+s*0.62,1.012,z-0.05,T*(3.4*s),0.22,0.006,0.03),[0.9,0.9,0.95],true);}
