'use strict';
/* ================= STREETS: every block on a street is somebody's building =================
   Hub streets used to be rows of 'b' cells: one window box in random pastel heights, the same all the way along.
   streetPlan() (from dressStreet, before buildStatic) cuts each frontage into lots and gives every lot its own
   building from LOT_TYPES: a deco hotel with its name in neon down the fin, a chrome diner, a pawn shop behind
   shutters, a cinema marquee, a parking deck, MiMo apartments with balconies, a glass office, a bank, a club.
   The lot sets the cells' wall tile, tint, height and roof, so the classic cell renderer (and the new renderer,
   which draws the same static batch) builds the shell; drawStreetscape() adds the shop fronts, signs, awnings,
   rooftops, kerb furniture and the road's manholes, patches and crossings. Everything is placed from hashes of
   the hub's name, so each street is the same every visit and different from every other street.
   Mission streets (dressStreet) get irregular lamps and a wider kit of kerb props through streetDecoPick().
   The McWey Tower lobby's random guests are replaced by a cast (LOBBY_CAST), each with a look, a job, a routine,
   props and their own lines. Tiles 172-183 and 200-217 are painted in renderer.js; their ids do not fit the grid's Int8 wallT/topT, so lots
   keep them in g.wallX/g.topX, which buildStatic reads first. */

const SK={deco:172,brick:173,jal:174,glass:175,breeze:176,deck:177,shop:178,shutter:179,gravel:180,membrane:181,gblock:182,stone:183};
/* 5x5 neon letters, one number per row, high bit on the left */
const SNFONT={A:[14,17,31,17,17],B:[30,17,30,17,30],C:[15,16,16,16,15],D:[30,17,17,17,30],E:[31,16,30,16,31],F:[31,16,30,16,16],G:[15,16,19,17,15],H:[17,17,31,17,17],I:[31,4,4,4,31],
 J:[7,1,1,17,14],K:[17,18,28,18,17],L:[16,16,16,16,31],M:[17,27,21,17,17],N:[17,25,21,19,17],O:[14,17,17,17,14],P:[30,17,30,16,16],Q:[14,17,21,18,13],R:[30,17,30,18,17],S:[15,16,14,1,30],
 T:[31,4,4,4,4],U:[17,17,17,17,14],V:[17,17,17,10,4],W:[17,17,21,27,17],X:[17,10,4,10,17],Y:[17,10,4,4,4],Z:[31,2,4,8,31],'0':[14,19,21,25,14],'1':[4,12,4,4,14],'2':[30,1,14,16,31],
 '3':[30,1,6,1,30],'4':[18,18,31,2,2],'5':[31,16,30,1,30],'6':[14,16,30,17,14],'7':[31,1,2,4,4],'8':[14,17,14,17,14],'9':[14,17,15,1,14],'&':[12,18,13,18,13],'$':[15,20,14,5,30],
 "'":[4,4,0,0,0],'-':[0,0,31,0,0],'.':[0,0,0,0,4],'!':[4,4,4,0,4]};
const shx=h=>[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255];
const NEONS={pink:[1,0.25,0.65],cyan:[0.3,0.95,1],gold:[1,0.82,0.35],green:[0.45,1,0.55],red:[1,0.22,0.2],violet:[0.75,0.45,1],white:[1,0.95,0.9]};
/* every kind of building a street can hold: width range (cells), storeys, facade tile, roof tile, body tints, signage colours, names */
const LOT_TYPES={
 hotel:{w:[5,7],fl:[3,3],face:'deco',roof:'membrane',tints:[0xffc2d6,0xb6f0e6,0xffd9b0,0xd9c8ff,0xfff2b0,0xbfe4ff,0xffffff],neon:['pink','cyan','green','violet','gold'],
  names:['THE ARCADIA','SEA SPRAY','PELICAN','THE BELMAR','STARLITE','CORAL REEF','THE OSPREY','SUNRISE','THE MARLIN','SANDPIPER','THE AVALON','BAYSIDE']},
 apts:{w:[5,6],fl:[3,3],face:'jal',roof:'gravel',tints:[0xffffff,0xfff4e0,0xe8f6ff,0xffe8ee],neon:['cyan','gold'],names:['THE PALMS','LA CORAL','SEAGATE','ISLA VERDE','BAY TOWERS']},
 diner:{w:[4,5],fl:[1,1],face:'deco',roof:'membrane',tints:[0xffffff,0xfff0f0],neon:['red','cyan','pink'],names:['DINER','EAT','24 HRS']},
 pawn:{w:[3,3],fl:[2,2],face:'brick',roof:'gravel',tints:[0xffffff,0xe8d0c0],neon:['gold'],names:['PAWN','LOANS','GOLD $']},
 liquor:{w:[3,4],fl:[1,2],face:'jal',roof:'gravel',tints:[0xfff2b0,0xd8f0ff,0xffd0d8],neon:['red','green','cyan'],names:['LIQUOR','LIQUORS','BEER WINE']},
 shop:{w:[3,4],fl:[1,2],face:'deco',roof:'gravel',tints:[0xffd9b0,0xb6f0e6,0xffc2d6,0xd9c8ff,0xffffff,0xfff2b0],neon:['pink','cyan','gold','green','violet'],
  names:['RECORDS','VIDEO','SURF SHOP','TATTOO','PHARMACY','PIZZA','ARCADE','CAFE CUBANO','LAUNDRY','BAIT TACKLE','BODEGA','PHOTO','SHOES','JEWELRY']},
 cinema:{w:[5,6],fl:[2,2],face:'stone',roof:'membrane',tints:[0xffe8c8,0xffd0e0],neon:['gold','red','pink'],names:['BISCAYNE','THE TOWER','RIALTO','LYRIC']},
 garage:{w:[6,7],fl:[3,3],face:'deck',roof:'gravel',tints:[0xffffff,0xf0ece4],neon:['green','cyan'],names:['PARK']},
 office:{w:[5,6],fl:[2,2],back:[4,4],face:'glass',roof:'membrane',tints:[0xffffff,0xd8ecff,0xe0fff4],neon:['cyan','white'],names:['SUNTRUST','ATLANTIC','GULFSTAR','BAYCORP']},
 bank:{w:[4,5],fl:[2,2],face:'stone',roof:'membrane',tints:[0xffffff,0xf4ecdc],neon:['gold','white'],names:['FIRST DADE','BANK','SAVINGS']},
 club:{w:[4,5],fl:[2,2],face:'deco',roof:'gravel',tints:[0x3a2a48,0x23202e,0x402030],neon:['pink','cyan','violet'],names:['CLUB 54','NEON','SPLASH','THE GROTTO','VOLT']}};
/* which buildings each hub street favours; the first entries come up most */
const STREET_DECK={drive:['hotel','shop','diner','hotel','apts','liquor','hotel','cinema','shop','pawn','hotel','garage','club','shop','office','hotel','bank'],
 dealer:['office','diner','bank','garage','shop','office','liquor','apts','shop','pawn'],
 bunker:['pawn','liquor','shop','apts','hotel','diner','shop','club','garage'],
 club:['club','liquor','hotel','shop','diner','pawn','shop','apts']};
const strSeed=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;};
/* lot body colours: their own list, stored in the grid's tint as 100+index (PASTEL stays the grid's random palette) */
const STREET_TINT=[];
function tintIdx(hx){const c=shx(hx);for(let i=0;i<STREET_TINT.length;i++){const p=STREET_TINT[i];if(Math.abs(p[0]-c[0])+Math.abs(p[1]-c[1])+Math.abs(p[2]-c[2])<0.01)return 100+i;}if(STREET_TINT.length>=27)return 100;STREET_TINT.push(c);return 100+STREET_TINT.length-1;}
function streetKey(g){const d=g.def;if(!d||!d.hub)return null;if(d.hub==='drive')return'drive';for(const k of ['dealer','bunker','club'])if(typeof HUBS!=='undefined'&&d===HUBS[k])return k;return'drive';}

/* ---- planning: lots, cell materials, kerb furniture ---- */
function streetPlan(g){g.lots=null;g.kerb=[];const W=g.W,H=g.H,key=streetKey(g);g.wallX=new Uint8Array(W*H);g.topX=new Uint8Array(W*H);
 const isB=i=>g.solid[i]===1&&g.wallT[i]===33&&g.tint[i]>=0;
 const front=new Int16Array(W).fill(-1),back=new Int16Array(W).fill(-1);
 for(let x=0;x<W;x++)for(let z=H-2;z>=0;z--){const i=z*W+x;if(isB(i)&&!g.solid[i+W]&&g.floorT[i+W]>=0){front[x]=z;let b=z;while(b>0&&isB((b-1)*W+x))b--;back[x]=b;break;}}
 const runs=[];for(let x=0;x<W;){if(front[x]<0){x++;continue;}let e=x;while(e+1<W&&front[e+1]===front[x])e++;runs.push([x,e,front[x]]);x=e+1;}
 if(!key&&!runs.length)return;
 const seed=strSeed((g.def.name||'')+'|'+(key||'')),deck=STREET_DECK[key]||STREET_DECK.drive,used={},lots=[];let di=Math.floor(ihash(seed,1,3)*deck.length),li=0;
 const R=(k,s)=>ihash(seed+k*7919,s,17);
 const nameOf=t=>{const T=LOT_TYPES[t],n=used[t]=(used[t]||0)+1;return T.names[(Math.floor(ihash(seed,t.length*31+t.charCodeAt(0),5)*T.names.length)+n-1)%T.names.length];};
 for(const [a,b,zf] of runs){let x=a;
  while(x<=b){const left=b-x+1;let t=deck[di%deck.length];di++;const T=LOT_TYPES[t];
   if(left<T.w[0]){if(left>=3)t='shop';else if(lots.length&&lots[lots.length-1].zf===zf&&lots[lots.length-1].x1===x-1){lots[lots.length-1].x1=b;break;}else t='shop';}
   const TT=LOT_TYPES[t],w=Math.min(left,TT.w[0]+Math.floor(R(li,1)*(TT.w[1]-TT.w[0]+1)));
   const fl=TT.fl[0]+Math.floor(R(li,2)*(TT.fl[1]-TT.fl[0]+1));
   lots.push({t,x0:x,x1:x+w-1,zf,fl,tint:TT.tints[Math.floor(R(li,3)*TT.tints.length)],neon:NEONS[TT.neon[Math.floor(R(li,4)*TT.neon.length)]],name:nameOf(t),s:seed+li*131,i:li});x+=w;li++;}}
 /* no two neighbours in the same colour, and never two hotels in the same neon */
 for(let k=1;k<lots.length;k++){const L=lots[k],P=lots[k-1],T=LOT_TYPES[L.t];if(L.tint===P.tint&&T.tints.length>1)L.tint=T.tints[(T.tints.indexOf(L.tint)+1)%T.tints.length];
  if(L.neon===P.neon){const ks=T.neon;L.neon=NEONS[ks[(ks.indexOf(Object.keys(NEONS).find(n=>NEONS[n]===L.neon))+1)%ks.length]];}}
 for(const L of lots){const T=LOT_TYPES[L.t],ti=tintIdx(L.tint),h=L.fl*WALL_H,hb=(T.back?T.back[0]:L.fl)*WALL_H;
  L.h=h;L.zb=front[L.x0];for(let x=L.x0;x<=L.x1;x++){L.zb=Math.min(L.zb,back[x]);
   for(let z=back[x];z<=front[x];z++){const i=z*W+x,deep=front[x]-z;g.wallX[i]=SK[T.face];g.tint[i]=ti;g.topX[i]=SK[T.roof];g.wh[i]=deep>=2&&T.back?hb:h;
    if(L.t==='apts'&&x===L.x1)g.wallX[i]=SK.breeze;if(L.t==='hotel'&&L.x1-L.x0>=5&&(x===L.x0))g.wallX[i]=SK.gblock;}}}
 /* 'b' cells no lot owns (the side walls of a street): plain brick at a storey height, not window boxes */
 for(let i=0;i<W*H;i++)if(isB(i)&&!g.wallX[i]){g.wallX[i]=SK.brick;g.tint[i]=tintIdx(0xf2e6dc);g.wh[i]=Math.max(WALL_H,Math.round(g.wh[i]/WALL_H)*WALL_H);g.topX[i]=SK.gravel;}
 g.lots=lots;if(lots.length)kerbPlan(g,lots);}
/* sidewalk furniture in front of each lot; box props also go in g.solids so you walk round them, not through */
function kerbPlan(g,lots){const W=g.W,K=g.kerb,lampX=new Set(g.deco.filter(d=>d.t==='lamp').map(d=>d.x+','+d.z));
 const free=(x,z)=>x>0&&x<W-1&&z<g.H&&!g.solid[z*W+x]&&!g.furn[z*W+x]&&!lampX.has(x+','+z)&&!g.trigs.some(t=>Math.abs(t.x-x-0.5)<1&&Math.abs(t.z-z-0.5)<1.2)&&!(g.car&&Math.hypot(g.car.x-x-0.5,g.car.z-z-0.5)<1.6)&&!(g.player&&Math.hypot(g.player.x-x-0.5,g.player.z-z-0.5)<1.1);
 const add=(t,x,z,o)=>{K.push(Object.assign({t,x,z},o||{}));};let bus=false;
 for(const L of lots){const z=L.zf+1,ZF=z,w=L.x1-L.x0+1,R=k=>ihash(L.s,k,23),door=doorX(L);if(z>=g.H||g.floorT[z*W+L.x0]<0)continue;
  const wall=(t,x,dz,o)=>{if(free(x,z))add(t,x+0.5,ZF+dz,o);},kerb=(t,x,o)=>{if(free(x,z))add(t,x+0.5,ZF+0.82,o);};
  if(L.t==='hotel'){wall('planter',L.x0+0.5|0,0.3);wall('planter',L.x1,0.3);if(w>=6){wall('cafe',L.x0+1,0.42);wall('cafe',L.x1-1,0.42);}if(g.def.hub==='drive')kerb('podium',door+1);}
  else if(L.t==='shop'||L.t==='liquor'||L.t==='pawn'){const a=L.x0+(door===L.x0?1:0);if(R(1)<0.6)kerb('news',a,{n:2+(R(2)*2|0)});else kerb('trash',a);if(R(3)<0.5&&door!==L.x1)wall('phone',L.x1,0.22);if(R(4)<0.7)kerb('meter',L.x1);}
  else if(L.t==='diner'){wall('bench',L.x0,0.25);kerb('news',L.x1,{n:3});}
  else if(L.t==='office'||L.t==='bank'){wall('planter',L.x0,0.3);wall('planter',L.x1,0.3);kerb('mailbox',L.x0+1);}
  else if(L.t==='apts'){kerb('trash',L.x0);kerb('trash',L.x0+1);kerb('mailbox',L.x1-1);}
  else if(L.t==='club'){wall('rope',door,0.55);}
  else if(L.t==='cinema'){wall('posters',L.x0,0.05);wall('posters',L.x1,0.05);}
  if(!bus&&w>=4&&(L.t==='apts'||L.t==='shop'||L.t==='office'||L.t==='liquor')){let ok=true;for(let x=L.x0;x<L.x0+3;x++)if(!free(x,z))ok=false;if(ok){add('bus',L.x0+1.5,ZF+0.6);bus=true;}}}
 g.solids=g.solids||[];const SZ={planter:[0.5,0.5],podium:[0.4,0.35],news:[0.85,0.35],trash:[0.4,0.4],phone:[0.45,0.3],bench:[0.9,0.4],mailbox:[0.45,0.45],cafe:[0.8,0.6],bus:[2.4,0.5],rope:[1.0,0.12]};
 for(const k of K){const s=SZ[k.t];if(s)g.solids.push({x:k.x,z:k.z,w:s[0],d:s[1]});}}
/* the lot's front door column: hotels and banks in the middle, shops at one end */
function doorX(L){const w=L.x1-L.x0+1;if(L.t==='hotel'||L.t==='bank'||L.t==='cinema'||L.t==='office'||L.t==='apts'||L.t==='club')return L.x0+(w>>1);return ihash(L.s,9,23)<0.5?L.x0:L.x1;}

/* ---- drawing helpers ---- */
const fq=(B,x0,x1,y0,y1,z,uv,c,em)=>B.quad([[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]],0,0,em?0:1,uv,c);
const sbox=(B,x,y,z,sx,sy,sz,c,em,uv,ry)=>B.box(TRS(x,y,z,ry||0,sx,sy,sz),c,!!em,uv);
const tilt=(B,x,y,z,ax,sx,sy,sz,c,em)=>B.box(A.mul(A.mul(A.T(x,y,z),A.RX(ax)),A.S(sx,sy,sz)),c,!!em);
/* neon text on a plane facing +z (or stacked down a fin when vert); px is one font pixel. Each lit run is one emissive
   quad (6 vertices, not a 36-vertex box), so a hotel's name costs a few hundred vertices */
function neonText(B,s,cx,cy,z,px,col,vert){const L=s.length,adv=6*px;
 for(let k=0;k<L;k++){const gl=SNFONT[s[k]];if(!gl)continue;const ox=vert?cx-2.5*px:cx-(L*adv-px)/2+k*adv,oy=vert?cy+(L*adv-px)/2-k*adv:cy+2.5*px;
  for(let r=0;r<5;r++){const row=gl[r];let c=0;while(c<5){if(row>>(4-c)&1){let e=c;while(e+1<5&&(row>>(3-e)&1))e++;const x0=ox+c*px+px*0.03,x1=ox+(e+1)*px-px*0.03,y1=oy-r*px-px*0.09,y0=y1-px*0.82;B.quad([[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]],0,0,0,WUV,col);c=e+1;}else c++;}}}}
const textW=(s,px)=>s.length*6*px-px;
const sdim=(c,k)=>c.map(v=>v*k);
const S_GREY=[0.55,0.56,0.6],S_DGREY=[0.16,0.16,0.19],S_CHROME=[0.85,0.87,0.9],S_WHITE=[0.96,0.95,0.92];

/* ---- the buildings ---- */
function drawLot(B,g,L){const X0=L.x0,X1=L.x1+1,Wd=X1-X0,cx=(X0+X1)/2,ZF=L.zf+1,h=L.h,T=LOT_TYPES[L.t],R=k=>ihash(L.s,k,29),col=shx(L.tint),ac=sdim(col,0.72),dx=doorX(L)+0.5,N=L.neon,z1=ZF+0.02;
 /* cornice and parapet cap along the street face, in a darker shade of the body */
 if(L.t!=='garage'){sbox(B,cx,h+0.06,ZF-0.08,Wd+0.06,0.12,0.26,L.t==='club'?[0.12,0.1,0.14]:ac);}
 const door=(x,w,hh,c)=>{fq(B,x-w/2-0.06,x+w/2+0.06,0,hh+0.06,z1,WUV,c||S_DGREY);fq(B,x-w/2,x+w/2,0,hh,z1+0.004,TUV[SK.shop],[0.75,0.75,0.8]);sbox(B,x,hh*0.45,z1+0.03,w*0.7,0.03,0.02,S_CHROME);};
 const storefront=(x0,x1,c)=>{for(let x=x0;x<x1;x++)fq(B,x,x+1,0,WALL_H*0.8,z1,TUV[SK.shop],c||[1,1,1]);};
 const fascia=(x0,x1,c,txt,nc)=>{sbox(B,(x0+x1)/2,WALL_H*0.9,ZF+0.05,x1-x0,0.2,0.1,c);if(txt){const px=Math.min(0.03,(x1-x0-0.3)/(txt.length*6));neonText(B,txt,(x0+x1)/2,WALL_H*0.9,ZF+0.12,px,nc);}};
 const awning=(x0,x1,y,c1,c2,deep)=>{const n=Math.max(2,Math.round((x1-x0)/0.4)),w=(x1-x0)/n,d=deep||0.55;for(let k=0;k<n;k++)tilt(B,x0+(k+0.5)*w,y-d*0.25,ZF+d/2,0.45,w,0.03,d*1.08,k%2?c2:c1);sbox(B,(x0+x1)/2,y-d*0.5,ZF+d,x1-x0,0.08,0.03,c1);};
 const rooftop=()=>{const deep=ZF-L.zb,ry=g.wh[L.zb*g.W+L.x0]||h,top=Math.max(h,ry);let k=0;
  for(let x=X0+0.6;x<X1-0.5;x+=1.3+R(40+k)*1.4){k++;const q=R(50+k),zz=L.zb+0.4+R(60+k)*Math.max(0.2,deep-0.9),hh=g.wh[Math.floor(zz)*g.W+Math.floor(x)]||h;
   if(q<0.4){sbox(B,x,hh+0.18,zz,0.5,0.34,0.4,[0.7,0.7,0.72]);sbox(B,x,hh+0.36,zz,0.36,0.02,0.3,S_DGREY);}
   else if(q<0.55&&deep>=2){for(let a=0;a<4;a++)sbox(B,x,hh+0.75,zz,0.55,0.6,0.55,[0.55,0.42,0.3],0,undefined,a*Math.PI/8);sbox(B,x,hh+1.1,zz,0.4,0.12,0.4,[0.4,0.3,0.22],0,undefined,Math.PI/8);for(const o of [-0.2,0.2])sbox(B,x+o,hh+0.22,zz,0.05,0.44,0.05,S_DGREY);}
   else if(q<0.7){sbox(B,x,hh+0.6,zz,0.035,1.2,0.035,S_GREY);sbox(B,x,hh+1.0,zz,0.4,0.02,0.02,S_GREY);sbox(B,x,hh+0.8,zz,0.3,0.02,0.02,S_GREY);sbox(B,x,hh+1.2,zz,0.05,0.05,0.05,[1,0.15,0.1],true);}
   else sbox(B,x,hh+0.1,zz,0.18,0.2,0.18,[0.6,0.6,0.62]);}
  return top;};
 const neonEdge=c=>{sbox(B,cx,h+0.125,ZF+0.06,Wd+0.06,0.03,0.03,c,true);for(const ex of [X0,X1])sbox(B,ex+(ex===X0?0.02:-0.02),h/2,ZF+0.06,0.03,h,0.03,c,true);};
 if(L.t==='hotel'){
  /* porch: the ground floor is a shaded terrace behind deco piers, the door under the fin */
  fq(B,X0,X1,0,WALL_H*0.86,z1,WUV,sdim(col,0.38));for(let x=X0;x<X1;x++)if(Math.abs(x+0.5-dx)>0.6)fq(B,x+0.12,x+0.88,0.12,WALL_H*0.7,z1+0.004,TUV[SK.shop],[0.9,0.85,0.8]);
  for(let x=X0;x<=X1;x++)sbox(B,x+(x===X0?0.08:x===X1?-0.08:0),WALL_H*0.43,ZF+0.08,0.16,WALL_H*0.86,0.16,col);
  door(dx,0.6,WALL_H*0.72,ac);sbox(B,cx,WALL_H*0.9,ZF+0.18,Wd,0.06,0.36,ac);
  /* eyebrows over every storey's windows, a vertical fin in the middle with the name down it, neon on the edges */
  for(let f=1;f<L.fl;f++)sbox(B,cx,f*WALL_H+WALL_H*0.74,ZF+0.09,Wd,0.03,0.18,S_WHITE);
  const fx=dx,nm=L.name.replace('THE ',''),fh=Math.max(h-WALL_H+0.9,nm.length*6*0.05+0.3);sbox(B,fx,WALL_H+fh/2,ZF+0.14,0.36,fh,0.28,S_WHITE);sbox(B,fx,WALL_H+fh/2,ZF+0.29,0.28,fh-0.1,0.02,sdim(col,0.3));
  neonText(B,nm,fx,WALL_H+fh/2,ZF+0.31,Math.min(0.05,(fh-0.2)/(nm.length*6)),N,true);
  if(Wd>=6){const tx=L.name.startsWith('THE ')?'HOTEL':'HOTEL';neonText(B,tx,dx,WALL_H*0.9,ZF+0.37,0.024,N);}
  neonEdge(N);
  /* striped awnings over the terrace windows either side of the door */
  const c2=R(7)<0.5?[0.95,0.95,0.92]:sdim(col,0.9),c1=[N[0]*0.8,N[1]*0.8,N[2]*0.8];if(dx-X0>1.2)awning(X0+0.1,dx-0.45,WALL_H*0.86,c1,c2,0.5);if(X1-dx>1.2)awning(dx+0.45,X1-0.1,WALL_H*0.86,c1,c2,0.5);
  const top=rooftop();if(R(8)<0.55){const nw=textW(L.name,0.05);sbox(B,cx,top+0.05,L.zf+0.4,0.04,0.1,0.04,S_DGREY);for(const o of [-nw/2,nw/2])sbox(B,cx+o,top+0.2,L.zf+0.4,0.04,0.4,0.04,S_DGREY);neonText(B,L.name,cx,top+0.45,L.zf+0.45,0.05,N);}
  g.lights.push({x:fx,y:1.6,z:ZF+0.8,r:3.2,c:N});}
 else if(L.t==='apts'){
  storefront(X0,X1,[0.75,0.82,0.9]);door(dx,0.55,WALL_H*0.75,[0.3,0.3,0.34]);sbox(B,dx,WALL_H*0.92,ZF+0.35,0.9,0.05,0.7,S_WHITE);for(const o of [-0.4,0.4])sbox(B,dx+o,WALL_H*0.45,ZF+0.66,0.04,WALL_H*0.9,0.04,S_CHROME);
  neonText(B,L.name,dx,WALL_H*0.92+0.07,ZF+0.71,0.022,N);
  /* cantilevered balconies with pipe railings on every upper storey, staggered */
  for(let f=1;f<L.fl;f++)for(let x=X0+(f%2);x<X1-1;x+=2){const y=f*WALL_H;sbox(B,x+1,y+0.03,ZF+0.24,1.7,0.06,0.48,S_WHITE);sbox(B,x+1,y+0.32,ZF+0.47,1.7,0.03,0.03,S_CHROME);for(let k=0;k<=6;k++)sbox(B,x+0.17+k*0.277,y+0.18,ZF+0.47,0.02,0.28,0.02,S_CHROME);}
  rooftop();}
 else if(L.t==='diner'){
  /* stainless bands, wraparound glass, the sign up on poles */
  storefront(X0,X1);door(dx,0.55,WALL_H*0.72,S_CHROME);for(const y of [0.05,WALL_H*0.82,WALL_H*0.98])sbox(B,cx,y,ZF+0.04,Wd,0.08,0.08,S_CHROME);sbox(B,cx,WALL_H*0.9,ZF+0.05,Wd,0.1,0.07,[0.85,0.1,0.15]);
  for(let x=X0+0.5;x<X1;x+=1)sbox(B,x,WALL_H*0.9,ZF+0.09,0.08,0.06,0.01,[1,0.9,0.6],true);
  const sx=cx,sy=h+0.95,txt=L.name;for(const o of [-0.7,0.7])sbox(B,sx+o,h+0.4,L.zf+0.5,0.05,0.8,0.05,S_DGREY);sbox(B,sx,sy,L.zf+0.5,textW(txt,0.07)+0.3,0.55,0.08,[0.1,0.08,0.12]);neonText(B,txt,sx,sy,L.zf+0.56,0.07,N);
  sbox(B,sx,sy-0.36,L.zf+0.55,textW(txt,0.07)+0.3,0.03,0.03,[1,0.85,0.3],true);g.lights.push({x:sx,y:sy,z:ZF,r:3.5,c:N});rooftop();}
 else if(L.t==='pawn'){
  /* shutters down on one window, bars on the other, the three gold balls on a bracket */
  for(let x=X0;x<X1;x++){if(Math.abs(x+0.5-dx)<0.6)continue;const shut=ihash(L.s,x,31)<0.5;fq(B,x,x+1,0,WALL_H*0.8,z1,TUV[shut?SK.shutter:SK.shop],[1,1,1]);if(!shut)for(let k=1;k<6;k++)sbox(B,x+k/6,WALL_H*0.4,z1+0.03,0.025,WALL_H*0.78,0.025,S_DGREY);}
  door(dx,0.55,WALL_H*0.75,[0.25,0.22,0.2]);fascia(X0,X1,[0.1,0.08,0.06],L.name,N);
  const bx=X1-0.3;sbox(B,bx,WALL_H*1.3,ZF+0.25,0.04,0.04,0.5,S_DGREY);for(const [ox,oy] of [[-0.12,0],[0.12,0],[0,-0.2]])sbox(B,bx+ox,WALL_H*1.3-0.22+oy,ZF+0.48,0.18,0.18,0.18,GOLD);
  neonText(B,'GUNS',cx,WALL_H*1.55,ZF+0.04,0.035,NEONS.red);rooftop();}
 else if(L.t==='liquor'||L.t==='shop'){
  /* glass shop front, a lit fascia with the trade in neon, a striped awning or a blade sign */
  for(let x=X0;x<X1;x++){if(Math.abs(x+0.5-dx)<0.6)continue;fq(B,x,x+1,0,WALL_H*0.8,z1,TUV[R(70+x)<0.25?211:SK.shop],[1,1,1]);}
  door(dx,0.55,WALL_H*0.75,sdim(col,0.5));const fc=R(11)<0.5?[0.08,0.07,0.1]:sdim(col,0.55);fascia(X0,X1,fc,L.name,N);
  if(R(12)<0.6){const pal=[[1,0.3,0.55],[0.2,0.75,0.8],[0.95,0.75,0.2],[0.3,0.75,0.4],[0.9,0.2,0.2]],c1=pal[Math.floor(R(13)*pal.length)];awning(X0+0.05,X1-0.05,WALL_H*0.78,c1,S_WHITE,0.5);}
  else{const by=WALL_H+0.45,bx=dx+(dx<cx?-0.3:0.3);sbox(B,bx,by,ZF+0.3,0.06,0.9,0.5,[0.1,0.08,0.12]);neonText(B,L.name.split(' ')[0].slice(0,6),bx+0.04,by,ZF+0.3,0.045,N,true);}
  if(L.fl>1)for(let x=X0;x<X1;x++)sbox(B,x+0.5,WALL_H+0.3,ZF+0.04,0.7,0.03,0.08,S_WHITE);
  rooftop();g.lights.push({x:cx,y:1.2,z:ZF+0.6,r:2.6,c:N});}
 else if(L.t==='cinema'){
  /* the marquee: a lit box over the doors with bulbs round it and the feature in letters, the name up a tall blade */
  for(let x=X0;x<X1;x++)fq(B,x,x+1,0,WALL_H*0.75,z1,TUV[x===X0||x===X1-1?212:SK.shop],[1,1,1]);door(dx,0.8,WALL_H*0.75,[0.5,0.1,0.15]);
  const my=WALL_H*0.98,md=0.9;sbox(B,cx,my,ZF+md/2,Wd-0.4,0.42,md,[0.12,0.08,0.12]);fq(B,X0+0.2,X1-0.2,my-0.21,my+0.21,ZF+md+0.003,WUV,[0.95,0.92,0.8],true);
  neonText(B,'NIGHT HEAT',cx,my+0.05,ZF+md+0.03,Math.min(0.026,(Wd-0.8)/60),[0.12,0.08,0.12]);
  for(let x=X0+0.3;x<X1-0.2;x+=0.2){sbox(B,x,my+0.24,ZF+md+0.01,0.05,0.05,0.05,[1,0.85,0.45],true);sbox(B,x,my-0.24,ZF+md+0.01,0.05,0.05,0.05,[1,0.85,0.45],true);}
  const nm=L.name.replace('THE ',''),bh=h+1.2,bx=cx,by=WALL_H+bh/2-0.05;sbox(B,bx,by,ZF+0.2,0.5,bh,0.14,sdim(col,0.45));sbox(B,bx,by,ZF+0.21,0.58,bh+0.08,0.1,[1,0.85,0.45],true);sbox(B,bx,by,ZF+0.24,0.5,bh,0.14,sdim(col,0.45));neonText(B,nm,bx,by,ZF+0.32,Math.min(0.06,(bh-0.3)/(nm.length*6)),N,true);
  neonEdge(N);g.lights.push({x:cx,y:1.2,z:ZF+1,r:4,c:[1,0.85,0.5]});rooftop();}
 else if(L.t==='garage'){
  /* open decks; the entrance has a striped barrier, a PARK sign stands out on the corner */
  const ex=L.x0+1;fq(B,ex,ex+2,0,WALL_H*0.85,z1,WUV,[0.05,0.05,0.07]);for(let k=0;k<6;k++)sbox(B,ex+0.2+k*0.27,0.6,z1+0.05,0.26,0.06,0.04,k%2?[0.9,0.85,0.2]:[0.1,0.1,0.1]);
  sbox(B,ex+1,WALL_H*0.95,ZF+0.04,2,0.18,0.06,[0.95,0.8,0.2]);neonText(B,'ENTER',ex+1,WALL_H*0.95,ZF+0.09,0.025,[0.1,0.1,0.1]);
  const px=X1-0.35,ph=h+0.4;sbox(B,px,ph/2+0.3,ZF+0.2,0.42,ph,0.12,[0.1,0.25,0.6]);neonText(B,'PARK',px,ph/2+0.3,ZF+0.27,0.06,NEONS.white,true);
  for(let f=1;f<=L.fl;f++)sbox(B,cx,f*WALL_H,ZF+0.04,Wd,0.04,0.1,[1,0.85,0.2]);
  const deep=ZF-L.zb;if(deep>=2)for(let k=0;k<2;k++){const cxx=X0+1.5+k*2.6,cz=L.zb+0.7;sbox(B,cxx,h+0.18,cz,0.9,0.22,0.45,[[0.85,0.1,0.15],[0.95,0.95,0.92],[0.2,0.6,0.9]][(L.s+k)%3]);sbox(B,cxx-0.05,h+0.34,cz,0.45,0.12,0.4,[0.1,0.1,0.14]);}
  g.lights.push({x:ex+1,y:1,z:ZF+0.5,r:2.5,c:[0.6,1,0.7]});}
 else if(L.t==='office'){
  /* a glass box, a canopy over revolving doors, the company name in white along the parapet */
  for(let x=X0;x<X1;x++)fq(B,x,x+1,0,WALL_H*0.8,z1,TUV[SK.glass],[0.9,0.95,1]);door(dx,0.8,WALL_H*0.75,S_CHROME);sbox(B,dx,WALL_H*0.85,ZF+0.4,1.4,0.05,0.8,S_CHROME);
  const top=g.wh[L.zb*g.W+L.x0]||h;if(top>h+0.5)neonText(B,L.name,cx,top-0.2,L.zf-1+0.03,Math.min(0.045,(Wd-0.4)/(L.name.length*6)),N);
  neonText(B,L.name,cx,h-0.22,ZF+0.03,Math.min(0.03,(Wd-0.4)/(L.name.length*6)),N);rooftop();}
 else if(L.t==='bank'){
  /* stone, four columns and a pediment, a clock over the door */
  for(let x=X0;x<X1;x++)fq(B,x,x+1,0,WALL_H*0.8,z1,TUV[SK.stone],[1,1,1]);door(dx,0.6,WALL_H*0.8,[0.35,0.25,0.15]);sbox(B,cx,0.05,ZF+0.3,Wd,0.1,0.6,sdim(col,0.85));
  for(let k=0;k<4;k++){const x=X0+0.5+k*(Wd-1)/3;sbox(B,x,WALL_H*0.75,ZF+0.35,0.22,WALL_H*1.4,0.22,S_WHITE);sbox(B,x,WALL_H*1.47,ZF+0.35,0.3,0.06,0.3,S_WHITE);}
  sbox(B,cx,WALL_H*1.6,ZF+0.35,Wd+0.1,0.2,0.4,S_WHITE);sbox(B,cx,h+0.3,ZF-0.08,Wd*0.5,0.35,0.16,S_WHITE);sbox(B,cx,h+0.3,ZF+0.01,0.3,0.3,0.02,[0.95,0.92,0.75],true);sbox(B,cx,h+0.33,ZF+0.03,0.02,0.12,0.01,S_DGREY);
  neonText(B,L.name,cx,WALL_H*1.6,ZF+0.56,Math.min(0.025,(Wd-0.3)/(L.name.length*6)),sdim(N,0.5));rooftop();}
 else if(L.t==='club'){
  /* black stucco, neon stripes up the front, a bulb-lit canopy and a velvet rope */
  door(dx,0.7,WALL_H*0.8,[0.05,0.05,0.07]);for(let x=X0;x<X1;x++){if(Math.abs(x+0.5-dx)<0.6)continue;fq(B,x,x+1,0,WALL_H*0.8,z1,WUV,[0.05,0.04,0.07]);}
  const c2=N===NEONS.cyan?NEONS.pink:NEONS.cyan;for(let k=0;k<3;k++){const x=X0+0.35+k*0.15;sbox(B,x,h/2+0.1,ZF+0.04,0.04,h-0.3,0.03,k%2?c2:N,true);sbox(B,X1-0.35-k*0.15,h/2+0.1,ZF+0.04,0.04,h-0.3,0.03,k%2?c2:N,true);}
  sbox(B,dx,WALL_H*0.92,ZF+0.4,1.3,0.08,0.8,[0.08,0.06,0.1]);for(let k=0;k<7;k++)sbox(B,dx-0.6+k*0.2,WALL_H*0.87,ZF+0.8,0.05,0.05,0.05,[1,0.85,0.5],true);
  neonText(B,L.name,cx,h-0.45,ZF+0.05,Math.min(0.05,(Wd-1)/(L.name.length*6)),N);g.lights.push({x:dx,y:1.4,z:ZF+0.9,r:3.4,c:N});rooftop();}
 /* a billboard on the roof of every third low building */
 if(L.fl<=2&&L.t!=='bank'&&ihash(L.s,77,5)<0.4&&ZF-L.zb>=1){const ad=[200,202,204][Math.floor(ihash(L.s,78,5)*3)],bw=2.4,bh2=0.9,by=h+0.55+bh2/2,bz=L.zb+0.5,bx=Math.min(Math.max(cx,X0+1.3),X1-1.3);
  for(const o of [-0.8,0.8]){sbox(B,bx+o,by/2+h/2,bz-0.05,0.05,by-h,0.05,S_DGREY);}sbox(B,bx,by,bz-0.06,bw+0.1,bh2+0.1,0.05,[0.9,0.9,0.92]);
  fq(B,bx-bw/2,bx,by-bh2/2,by+bh2/2,bz-0.03,TUV[ad],[1,1,1]);fq(B,bx,bx+bw/2,by-bh2/2,by+bh2/2,bz-0.03,TUV[ad+1],[1,1,1]);for(const o of [-0.7,0,0.7])sbox(B,bx+o,by+bh2/2+0.1,bz+0.1,0.08,0.04,0.12,[1,0.95,0.8],true);}}

/* ---- kerb furniture ---- */
function drawKerb(B,g,k){const x=k.x,z=k.z,R=s=>ihash(x*10|0,z*10|0,s);
 switch(k.t){
  case'planter':sbox(B,x,0.2,z,0.48,0.4,0.48,[0.85,0.8,0.72]);sbox(B,x,0.41,z,0.4,0.03,0.4,[0.25,0.18,0.12]);for(let i=0;i<5;i++)sbox(B,x+(R(i)-0.5)*0.25,0.55+R(i+9)*0.1,z+(R(i+5)-0.5)*0.25,0.2,0.22,0.2,i%2?[0.2,0.55,0.25]:[0.15,0.42,0.2]);break;
  case'cafe':sbox(B,x,0.36,z,0.42,0.03,0.42,S_WHITE);sbox(B,x,0.18,z,0.05,0.36,0.05,S_CHROME);for(const o of [-0.3,0.3]){sbox(B,x+o,0.22,z,0.22,0.03,0.22,[0.95,0.4,0.55]);sbox(B,x+o*1.35,0.38,z,0.03,0.3,0.22,[0.95,0.4,0.55]);}
   sbox(B,x,0.62,z,0.03,0.55,0.03,S_CHROME);for(let a=0;a<4;a++)B.box(A.mul(A.mul(A.T(x,0.92,z),A.RY(a*Math.PI/4)),A.S(0.9,0.03,0.18)),a%2?S_WHITE:[1,0.35,0.5]);break;
  case'podium':sbox(B,x,0.32,z,0.32,0.64,0.26,[0.15,0.1,0.08]);sbox(B,x,0.66,z,0.38,0.04,0.3,GOLD);sbox(B,x,0.72,z-0.05,0.06,0.08,0.06,[1,0.9,0.6],true);break;
  case'news':{const n=k.n||2,cols=[[0.15,0.3,0.75],[0.95,0.8,0.15],[0.85,0.12,0.15],[0.95,0.95,0.92]];for(let i=0;i<n;i++){const xx=x+(i-(n-1)/2)*0.3,c=cols[(i+(x|0))%4];sbox(B,xx,0.32,z,0.26,0.5,0.26,c);sbox(B,xx,0.45,z+0.131,0.18,0.12,0.005,[0.85,0.85,0.8]);sbox(B,xx,0.04,z,0.2,0.08,0.2,S_DGREY);}break;}
  case'trash':sbox(B,x,0.24,z,0.32,0.46,0.32,[0.2,0.35,0.25]);sbox(B,x,0.5,z,0.36,0.05,0.36,[0.15,0.25,0.18]);for(let i=0;i<4;i++)sbox(B,x,0.08+i*0.12,z,0.335,0.015,0.335,[0.12,0.2,0.14]);break;
  case'phone':sbox(B,x,0.5,z,0.05,1.0,0.05,S_GREY);sbox(B,x,0.95,z+0.02,0.38,0.42,0.22,[0.7,0.72,0.78]);sbox(B,x,1.18,z+0.06,0.42,0.04,0.3,[0.15,0.3,0.75]);sbox(B,x,0.92,z+0.14,0.14,0.22,0.02,S_DGREY);sbox(B,x-0.1,0.95,z+0.15,0.05,0.16,0.04,[0.1,0.1,0.1]);break;
  case'bench':sbox(B,x,0.24,z,0.85,0.04,0.3,[0.55,0.32,0.18]);sbox(B,x,0.42,z-0.13,0.85,0.18,0.03,[0.55,0.32,0.18]);for(const o of [-0.36,0.36])sbox(B,x+o,0.12,z,0.04,0.24,0.28,S_DGREY);break;
  case'mailbox':sbox(B,x,0.3,z,0.32,0.42,0.38,[0.12,0.25,0.62]);sbox(B,x,0.53,z,0.32,0.06,0.3,[0.12,0.25,0.62]);sbox(B,x,0.4,z+0.195,0.16,0.03,0.01,[0.85,0.85,0.85]);for(const o of [-0.12,0.12])sbox(B,x+o,0.05,z,0.05,0.1,0.3,S_DGREY);break;
  case'meter':for(const o of [-0.2,0.25]){sbox(B,x+o,0.3,z,0.04,0.6,0.04,S_GREY);sbox(B,x+o,0.66,z,0.12,0.16,0.09,[0.6,0.62,0.66]);sbox(B,x+o,0.68,z+0.046,0.07,0.06,0.005,[0.85,0.8,0.5],true);}break;
  case'rope':for(const o of [-0.45,0.45]){sbox(B,x+o,0.25,z,0.05,0.5,0.05,GOLD);sbox(B,x+o,0.5,z,0.09,0.06,0.09,GOLD);}for(let i=0;i<6;i++)sbox(B,x-0.375+i*0.15,0.4-Math.sin((i+0.5)/6*Math.PI)*0.08,z,0.16,0.035,0.035,[0.7,0.05,0.12]);break;
  case'posters':sbox(B,x,0.55,z,0.5,0.75,0.06,GOLD);fq(B,x-0.21,x+0.21,0.22,0.88,z+0.035,TUV[212],[1,1,1]);break;
  case'bus':{const c=[0.85,0.87,0.9];for(const o of [-1.1,1.1])sbox(B,x+o,0.55,z,0.05,1.1,0.05,c);sbox(B,x,1.12,z-0.05,2.4,0.05,0.6,[0.25,0.6,0.7]);sbox(B,x,0.6,z-0.28,2.3,0.9,0.02,[0.6,0.8,0.9]);
   fq(B,x+0.15,x+1.05,0.25,0.95,z-0.26,TUV[202],[1,1,1]);fq(B,x+1.05,x+1.95-0.9,0.25,0.95,z-0.26,TUV[203],[1,1,1]);sbox(B,x-0.4,0.25,z-0.12,1.2,0.04,0.28,[0.55,0.32,0.18]);
   sbox(B,x-1.1,1.3,z+0.2,0.36,0.3,0.03,[0.15,0.3,0.75]);neonText(B,'BUS',x-1.1,1.3,z+0.22,0.018,S_WHITE);break;}}}
function drawKerbDeco(B,g,d){const k={t:d.t.slice(2),x:d.x+0.5,z:d.z+(d.t==='k_meter'||d.t==='k_news'||d.t==='k_mailbox'||d.t==='k_trash'?0.25:0.35),n:2};drawKerb(B,g,k);}

/* ---- the road: patches, cracks, oil, manholes, drains at the kerb, a zebra crossing outside McWey Tower ---- */
function drawRoad(B,g){const W=g.W,H=g.H;if(typeof HUBS!=='undefined'&&g.def===HUBS.garage)return;
 const road=(x,z)=>x>=0&&z>=0&&x<W&&z<H&&!g.solid[z*W+x]&&g.floorT[z*W+x]===7&&!g.furn[z*W+x];
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){if(!road(x,z))continue;const r=ihash(x,z,401),u=ihash(x,z,402),v=ihash(x,z,403);
  const kerbN=z>0&&!road(x,z-1)&&g.floorT[(z-1)*W+x]!==7,kerbS=z<H-1&&!road(x,z+1)&&g.floorT[(z+1)*W+x]!==7;
  if(r<0.03)floorQuad(B,x+0.3+u*0.4,z+0.3+v*0.4,0.62,0,TUV[206],[1,1,1],0.008);
  else if(r<0.06)floorQuad(B,x+0.5,z+0.5,0.7+u*0.4,u*6.28,TUV[209],[1,1,1],0.007);
  else if(r<0.1)floorQuad(B,x+0.5,z+0.5,1.0,u*6.28,TUV[207],[1,1,1],0.0075);
  else if(r<0.13)floorQuad(B,x+0.5,z+0.5,0.5+u*0.4,u*6.28,TUV[210],[1,1,1],0.0078);
  if((kerbN||kerbS)&&ihash(x,z,404)<0.12){const zz=kerbN?z+0.12:z+0.88;B.quad([[x+0.25,0.009,zz+0.08],[x+0.75,0.009,zz+0.08],[x+0.75,0.009,zz-0.08],[x+0.25,0.009,zz-0.08]],0,1,0,TUV[208],[1,1,1]);}}
 /* McWey Tower's crossing: white bars across the road in front of the doors, with stop lines */
 const T0=g.def&&g.def.hub==='drive'?(g.tower||g.car):null;if(T0){const cx=T0.x;let z0=-1,z1=-1;for(let z=0;z<H;z++)if(g.rows[z]&&g.rows[z][Math.floor(cx)]==='='){if(z0<0)z0=z;z1=z;}
  if(z0>=0){for(let k=0;k<6;k++)B.quad([[cx-1.4+k*0.5,0.01,z1+1],[cx-1.15+k*0.5,0.01,z1+1],[cx-1.15+k*0.5,0.01,z0],[cx-1.4+k*0.5,0.01,z0]],0,1,0,WUV,[0.92,0.92,0.9]);
   for(const zz of [z0+0.05,z1+0.95])B.quad([[cx-1.6,0.011,zz+0.05],[cx+1.6,0.011,zz+0.05],[cx+1.6,0.011,zz-0.05],[cx-1.6,0.011,zz-0.05]],0,1,0,WUV,[0.92,0.92,0.9]);}}}

/* called at the end of buildStatic */
function drawStreetscape(B,g){const r0=B.round;B.round=0;/* plain boxes: rounded ones cost four times the vertices, and phones draw this every frame */if(g.lots)for(const L of g.lots)drawLot(B,g,L);if(g.kerb)for(const k of g.kerb)drawKerb(B,g,k);drawRoad(B,g);B.round=r0;}

/* ---- mission streets: irregular lamp spacing and a wider choice of kerb props (dressStreet asks per cell) ----
   returns what goes at a kerb cell beside a building wall: 'lamp', 'hydrant', one of the k_ props, or null */
function streetDecoPick(g,x,z){const r=ihash(x,z,501),gap=ihash(Math.floor(x/7),z,502);
 if(x%7===Math.floor(gap*7))return'lamp';
 if(r<0.06)return'hydrant';if(r<0.11)return'k_news';if(r<0.15)return'k_meter';if(r<0.18)return'k_phone';if(r<0.21)return'k_mailbox';if(r<0.25)return'k_trash';return null;}

/* ================= McWEY TOWER LOBBY: the regulars =================
   Instead of rolled-up random guests, the lobby has its own people, each with a job and a routine: the bellhop
   pushing a luggage cart between the doors and the elevators, the janitor mopping round the fountain, a tourist
   circling it with a camera, a widow complaining at the desk with her shopping, a courier waiting to sign, a lawyer
   pacing with a car phone, a starlet posing for a photographer, and in the lounge a banker behind his paper and a
   retired couple. castSetup() spawns them from lobbySetup; castStep() runs their routine from npcStep. */
const LOBBY_CAST=[
 {kind:'bellhop',at:[14.6,3.4],look:()=>({skin:hex(0x8a5a3a),jacket:hex(0x8a1426),shirt:hex(0xf4efe6),tie:hex(0xc9a24a),pants:hex(0x1a1418),shoes:hex(0x111111),hs:'slick',hair:hex(0x141010),hat:'cap',hatC:hex(0x8a1426),bw:0.98,bd:0.98,bh:1.0}),
  job:'loop',path:[[14.6,3.4],[17.2,6.2],[16.4,10.6],[13.6,11.2],[9.2,10.2],[8.2,6.8],[8.4,3.6]],sp:0.8,prop:'cart',
  greet:["Bags, sir? No? Just the attitude, then.","Watch the cart. It's got a mind of its own."],chat:["Room service is upstairs. I'm downstairs service.","Mr. McWey tips in gold. Little bars. I'm not kidding.","Twelve years on this cart. It's paid off, I own it now."]},
 {kind:'janitor',at:[14.2,8.6],look:()=>({skin:hex(0xc58a5e),jacket:hex(0x4a5a6e),shirt:hex(0x4a5a6e),pants:hex(0x4a5a6e),shoes:hex(0x1a1414),hs:'buzz',hair:hex(0x9a9a9a),stache:true,hat:'cap',hatC:hex(0x3a4a5e),bw:1.06,bd:1.08,bh:0.98,belly:true}),
  job:'mop',prop:'mop',greet:["Careful, it's wet. It's always wet."],chat:["People throw coins in the fountain. I fish 'em out. Don't tell the boss.","You track one more drop of blood in here, I quit.","Marble shows everything. Everything."]},
 {kind:'tourist',at:[11.5,4.9],look:()=>({skin:hex(0xf2b49a),jacket:hex(0x2de2e6),shirt:hex(0x2de2e6),tee:true,torsoTile:29,pants:hex(0xe8d8b8),shoes:hex(0xf2f2f2),hs:'normal',hair:hex(0xd8b060),shades:true,body:'fat',belly:true,bw:1.12,bd:1.1,bh:0.98}),
  job:'orbit',c:[11.5,7.5],r:2.45,sp:0.5,prop:'camera',greet:["Say cheese! Oh. You're not famous? You look famous."],chat:["We're from Ohio. Is it always this pink here?","They said Miami had a gold fountain. They weren't kidding!","Could you take one of me? Just press the... no, the other one."]},
 {kind:'widow',at:[5.6,6.35],a0:Math.PI,look:()=>femWear({fem:true,calm:1,sleeves:true,skirt:0.6,skin:hex(0xf0d0b8),jacket:hex(0xf4ecdc),shirt:hex(0xf4ecdc),pants:hex(0xf0d0b8),shoes:hex(0xc9a24a),hs:'big',hair:hex(0xf2f2f2),medallion:true,glasses:true,bw:0.92,bd:0.95,bh:0.95}),
  job:'idle',fidget:1,prop:'bags',greet:["Young man, are you staff? No? Then make yourself useful."],chat:["I've been waiting forty minutes for my car. Forty!","My late husband built half of Coral Gables. The ugly half.","These bags are from Bal Harbour. Don't touch them."]},
 {kind:'courier',at:[7.7,6.4],a0:Math.PI,look:()=>({skin:hex(0x6b4226),jacket:hex(0xffd36b),shirt:hex(0x1a1a22),pants:hex(0x2a2a33),shoes:hex(0xf2f2f2),hs:'buzz',hair:hex(0x101010),hat:'cap',hatC:hex(0x1a1a22),bw:0.95,bd:0.95,bh:1.02}),
  job:'idle',fidget:1,prop:'parcel',greet:["Package for McWey. Signature required. Nobody wants to sign."],chat:["Third time this week. Same box. Never asked what's in it.","Ring the bell, they say. There's no bell.","I got four more drops on Brickell. Come on, lady."]},
 {kind:'lawyer',at:[18.7,9.2],look:()=>({skin:hex(0xefcaa8),jacket:hex(0x2a2a33),shirt:hex(0xc9e4ff),tie:hex(0xc0182a),pants:hex(0x2a2a33),shoes:hex(0x0a0a0c),hs:'slick',hair:hex(0x2a1a10),watch:true,bw:1.0,bd:0.98,bh:1.04}),
  job:'pace',path:[[18.7,9.2],[18.7,6.4]],sp:0.7,prop:'phone',greet:["...no, Sal, I said OFFSHORE. Hold on. Can I help you?"],chat:["Billable hours, my friend. Even this is billable.","Whatever you did, you didn't do it. Call me.","This phone cost three grand and it still drops in the elevator."]},
 {kind:'starlet',at:[20.2,4.3],a0:-Math.PI*0.75,look:()=>femWear({fem:true,calm:1,sleeves:false,skirt:0.5,skin:hex(0xd9a37c),jacket:hex(0xffffff),shirt:hex(0xffffff),pants:hex(0xd9a37c),shoes:hex(0xffffff),hs:'big',hair:hex(0x1a1010),shades:true,medallion:true,bw:0.86,bd:0.86,bh:1.02}),
  job:'pose',greet:["No photos. Okay, one photo. My good side is... all of them."],chat:["I'm in the new Night Heat. Second girl on the left.","McWey's throwing a party. I'm the party.","Darling, the sunglasses stay on. Even indoors. Especially indoors."]},
 {kind:'photog',at:[18.4,5.6],look:()=>({skin:hex(0xd9a37c),jacket:hex(0x5a4a36),shirt:hex(0x1a1a22),vest:hex(0x6a5a40),pants:hex(0x3a3a44),shoes:hex(0x2a1a14),hs:'big',hair:hex(0x3a2414),beard:hex(0x3a2414),bw:1.0,bd:1.0,bh:1.0}),
  job:'photog',look2:'starlet',prop:'camera',greet:["Out of the shot, pal! Okay, stay in. You've got a look."],chat:["Page six, baby. Page six.","She hates me. Hate sells.","I got McWey once leaving a bank with a shark. Long story."]}];
const LOUNGE_CAST=[
 {kind:'banker',look:()=>({skin:hex(0xefcaa8),jacket:hex(0x5a5e6a),shirt:hex(0xffffff),tie:hex(0x1d3557),pants:hex(0x5a5e6a),shoes:hex(0x1a1414),hs:'slick',hair:hex(0xb8b8b8),glasses:true,watch:true,bw:1.04,bd:1.04,bh:1.0}),
  prop:'paper',greet:["Hm? Oh. Rates are up. Everything's up."],chat:["McWey Holdings, up again. I don't ask how.","I'm told this is a bank meeting. In a lobby. With a fountain.","Don't block my light, I'm reading the futures."]},
 {kind:'retiree',look:()=>({skin:hex(0xf0c8a0),jacket:hex(0xff8fb8),shirt:hex(0xffffff),pants:hex(0xf2f2f2),shoes:hex(0xffffff),hs:'normal',hair:hex(0xe0e0e0),glasses:true,hat:'fedora',hatC:hex(0xe8dcb8),bw:1.0,bd:1.04,bh:0.96,belly:true}),
  greet:["Sit, sit! Doris and I are waiting on the man upstairs."],chat:["Forty years in Newark. This is our reward.","Doris wants a picture with the fountain. I want a sandwich.","You're the one from the news? Doris! It's the one from the news!"]}];
function castSetup(g){castLines();
 for(const C of LOBBY_CAST){const n=makeChar(C.at[0],C.at[1],C.look(),false);Object.assign(n,{kind:C.kind,state:'idle',a:C.a0||0,a0:C.a0||0,r:0.3,said:false,cast:C,hx:C.at[0],hz:C.at[1],wi:1,wait:ihash(C.at[0]*10|0,3,1)*2,t0:ihash(C.at[1]*10|0,4,1)*6,flashT:0});n.body=n.look.body;g.npcs.push(n);}
 /* the lounge sitters become the banker and Vern */
 const sit=g.npcs.filter(n=>n.kind==='sitter');sit.forEach((s,i)=>{const C=LOUNGE_CAST[i%LOUNGE_CAST.length],n=makeChar(s.x,s.z,C.look(),false);Object.assign(n,{kind:C.kind,state:'idle',y:s.y,seat:true,a:s.a,a0:s.a0,r:0.3,said:false,cast:C,t0:i*2,flashT:0});n.body=n.look.body;g.npcs[g.npcs.indexOf(s)]=n;});
 g.cast=true;}
/* the cast's lines go into the game's greeting and TALK tables (defined by the inline script, so on first setup) */
function castLines(){if(castLines.done)return;castLines.done=1;for(const C of [...LOBBY_CAST,...LOUNGE_CAST]){NPCLINES[C.kind]=[[C.greet[0]],[C.greet[1]||C.greet[0]]];NPC_CHAT[C.kind]=C.chat;}}
function castStep(n,dt,g,p){const C=n.cast,d=Math.hypot(p.x-n.x,p.z-n.z);n.vx=0;n.vz=0;n.t0+=dt;if(n.flashT>0)n.flashT-=dt;
 const walkTo=(tx,tz,sp)=>{const dx=tx-n.x,dz=tz-n.z,L=Math.hypot(dx,dz);if(L<0.08)return true;const s=Math.min(sp,L/dt);n.vx=dx/L*s;n.vz=dz/L*s;const ox=n.x,oz=n.z;n.x+=n.vx*dt;n.z+=n.vz*dt;collideGrid(n);
  const m=Math.hypot(n.x-ox,n.z-oz);n.walk=(n.walk||0)+m*9;if(m<s*dt*0.3)n.stuck=(n.stuck||0)+dt;else n.stuck=0;n.a0=Math.atan2(dx,dz);n.a+=clamp(angDiff(n.a,n.a0),-5*dt,5*dt);return false;};
 if(C.job==='loop'||C.job==='pace'){if(d<1.7)return;if(n.wait>0){n.wait-=dt;return;}const P=C.path,t=P[n.wi%P.length];if(walkTo(t[0],t[1],C.sp)||n.stuck>1.5){n.wi=(n.wi+1)%P.length;n.stuck=0;n.wait=C.job==='pace'?1.2:(n.wi===1||n.wi===0?2.5:0.4);}}
 else if(C.job==='orbit'){if(d<1.6)return;if(n.wait>0){n.wait-=dt;n.a0=Math.atan2(C.c[0]-n.x,C.c[1]-n.z);if(n.wait<0.4&&!n.snap){n.snap=1;n.flashT=0.12;}return;}
  n.ang=(n.ang===undefined?Math.atan2(n.x-C.c[0],n.z-C.c[1]):n.ang)+dt*C.sp/C.r;const tx=C.c[0]+Math.sin(n.ang)*C.r,tz=C.c[1]+Math.cos(n.ang)*C.r;walkTo(tx,tz,C.sp*1.6);
  if(n.t0>4){n.t0=0;n.wait=2;n.snap=0;}}
 else if(C.job==='mop'){const ph=n.t0*1.6;n.x=n.hx+Math.sin(ph*0.5)*0.35;n.walk=(n.walk||0)+Math.abs(Math.cos(ph*0.5))*dt*2;n.a0=Math.PI*0.5+Math.sin(ph)*0.5;n.mopP=ph;}
 else if(C.job==='pose'){const k=Math.floor(n.t0/2.2)%4;n.a0=(C.a0||0)+[0,0.5,-0.4,0.9][k];}
 else if(C.job==='photog'){const s=g.npcs.find(q=>q.kind===C.look2);if(s){n.a0=Math.atan2(s.x-n.x,s.z-n.z);if(n.t0>1.6+ihash(Math.floor(n.t0*3),1,7)){n.t0=0;n.flashT=0.12;}}}
 else if(C.fidget){const k=Math.floor(n.t0/3)%3;n.a0=(C.a0||0)+[0,0.35,-0.3][k];}}
/* per-frame props that go with the cast: the cart in front of the bellhop, the janitor's mop, bucket and sign, cameras and flashes */
function drawCast(B,g){for(const n of g.npcs){const C=n.cast;if(!C||!C.prop&&!(n.flashT>0))continue;const s=Math.sin(n.a),c=Math.cos(n.a),at=(f,sd,y,sx,sy,sz,col,em,ry)=>B.box(TRS(n.x+s*f+c*sd,y,n.z+c*f-s*sd,(ry||0)+n.a,sx,sy,sz),col,!!em);
  if(C.prop==='cart'){const f=0.7;at(f,0,0.14,0.55,0.04,0.8,[0.55,0.08,0.14]);for(const sd of [-0.25,0.25]){at(f-0.38,sd,0.6,0.03,0.95,0.03,GOLD);at(f+0.38,sd,0.6,0.03,0.95,0.03,GOLD);}at(f,0,1.06,0.55,0.03,0.82,GOLD);
   at(f-0.1,0,0.33,0.44,0.34,0.3,[0.35,0.22,0.12]);at(f+0.18,0.05,0.28,0.36,0.24,0.24,[0.15,0.3,0.55]);at(f-0.05,-0.02,0.58,0.32,0.18,0.42,[0.85,0.75,0.55]);for(const q of [-0.3,0.3])for(const sd of [-0.22,0.22])at(f+q,sd,0.05,0.06,0.1,0.1,S_DGREY);}
  else if(C.prop==='mop'){const f=0.45+Math.sin((n.mopP||0)*0.5)*0.05;B.box(A.mul(A.mul(A.T(n.x+s*(f-0.2),0.45,n.z+c*(f-0.2)),A.mul(A.RY(n.a),A.RX(0.5))),A.S(0.03,0.95,0.03)),[0.6,0.45,0.3]);at(f+0.05,0,0.04,0.3,0.06,0.12,[0.85,0.85,0.8]);
   B.box(TRS(n.hx-0.9,0.17,n.hz+0.3,0.3,0.34,0.32,0.3),[0.95,0.8,0.15]);B.box(TRS(n.hx-0.9,0.33,n.hz+0.3,0.3,0.28,0.01,0.24),[0.55,0.6,0.55]);
   for(const sg of [-1,1])B.box(A.mul(A.mul(A.T(n.hx+0.9,0.3,n.hz-0.4+sg*0.07),A.RX(sg*0.25)),A.S(0.34,0.6,0.02)),[1,0.85,0.1]);}
  else if(C.prop==='camera'){at(0.26,0.06,1.1,0.13,0.09,0.07,[0.1,0.1,0.12]);if(n.flashT>0){at(0.32,0.06,1.16,0.1,0.06,0.03,[1,1,1],true);}}
  else if(C.prop==='bags'){at(0.05,0.36,0.17,0.3,0.32,0.12,[1,0.6,0.75]);at(0.15,0.42,0.38,0.2,0.04,0.02,[0.1,0.1,0.1]);at(-0.1,0.4,0.14,0.26,0.26,0.12,[0.95,0.95,0.92]);}
  else if(C.prop==='parcel'){at(0.27,0,0.8,0.36,0.26,0.26,[0.72,0.55,0.36]);at(0.27,0,0.94,0.37,0.02,0.06,[0.85,0.8,0.6]);}
  else if(C.prop==='phone'){at(0.04,0.14,1.24,0.06,0.2,0.08,[0.12,0.12,0.14]);at(0.04,0.14,1.38,0.015,0.12,0.015,[0.1,0.1,0.1]);}
  else if(C.prop==='paper'){at(0.32,0,0.78+(n.y||0),0.5,0.36,0.02,[0.92,0.9,0.84]);at(0.335,0,0.88+(n.y||0),0.42,0.04,0.005,[0.25,0.25,0.25]);}}}
