'use strict';
// Enemy perception, knowledge and behaviour.
function alertNoise(x,z,r){if(r<1)return;let any=false;for(const e of G.enemies){if(!e.alive||e.down>0||e.state==='chase')continue;if(Math.hypot(e.x-x,e.z-z)<r){any=true;e.state='search';e.sx=x;e.sz=z;e.searchT=0;e.qT=1.2;}}
 if(any){G.nx=x;G.nz=z;bfs(G.nflow,Math.floor(x),Math.floor(z));}}
function bossAI(e,dt,dist,dx,dz,ang){if(e.lex)return lexAI(e,dt,dist,dx,dz,ang);const enr=e.hp<=e.maxhp/2;e.aiming=dist>=1.3;e.react-=dt;let tvx=0,tvz=0;const d=dist||1;
 if(dist>3){tvx=dx/d*2.3;tvz=dz/d*2.3;}else if(dist<1.35&&e.cd<=0){e.cd=1.0;e.atkT=e.atkDur=0.25;sfx('punch');hurtPlayer([dx/d,dz/d],'boss');shake(0.5);}
 if(dist>=1.35&&e.react<=0&&e.cd<=0&&Math.abs(angDiff(e.a,ang))<0.3){e.weapon.ammo=99;fireGun(e,e.weapon,false);e.burst=(e.burst||0)+1;if(e.burst<(enr?8:5))e.cd=0.085;else{e.burst=0;e.cd=(enr?0.85:1.4)*Dd().ecd;}}
 if(enr&&!e.enraged){e.enraged=true;popup(e.x,e.z,'HE IS PISSED','#ff2a3a');sfx('boss');}return[tvx,tvz];}
function spot(e){if(e.boss&&!G.bossSeen){G.bossSeen=true;banner(bossName(),G.def.boss?'Gold grenades. Keep moving and never stand still.':'He takes a lot of hits. Keep moving, use cover.');sfx('boss');}if(e.state!=='chase'){e.alertT=0.9;sfx('alert');for(const o of G.enemies){if(o!==e&&o.alive&&!(o.down>0)&&o.state!=='chase'&&Math.hypot(o.x-e.x,o.z-e.z)<5){o.state='search';o.sx=G.player.x;o.sz=G.player.z;o.searchT=0;o.qT=1;G.nx=o.sx;G.nz=o.sz;bfs(G.nflow,Math.floor(o.sx),Math.floor(o.sz));}}}}
function visionHalfAngle(e){return e.state==='search'?1.3:Dd().cone+(e.wary?0.35:0);}
function updateEnemy(e,dt){const g=G,p=g.player;
 if(e.hitT>0)e.hitT-=dt;if(e.alertT>0)e.alertT-=dt;if(e.qT>0)e.qT-=dt;
 if(!e.alive){slideBody(e,dt);return;}
 if(e.down>0){e.down-=dt;if(e.fall!==undefined&&e.fall<1)e.fall=Math.min(1,e.fall+dt*5);e.vx*=Math.exp(-dt*5);e.vz*=Math.exp(-dt*5);moveChar(e,dt,false);if(e.down<=0){e.state='chase';e.react=0.6*Dd().react;e.seeT=0;e.a+=Math.PI;}return;}
 e.cd-=dt;if(e.atkT>0)e.atkT-=dt;
 const wd=WD[e.weapon?e.weapon.type:'fists'];const dx=p.x-e.x,dz=p.z-e.z,dist=Math.hypot(dx,dz)||0.001,ang=Math.atan2(dx,dz);
 let see=false;if(p.alive&&dist<(e.state==='chase'?13:Dd().vision)){const cone=e.state==='chase'||dist<1.6||Math.abs(angDiff(e.a,ang))<visionHalfAngle(e);if(cone&&los(e.x,e.z,p.x,p.z))see=true;}
 if(!see&&p.alive&&e.state!=='chase'){const hear=(p.sprinting?3.2:1.4)*(Math.hypot(p.vx,p.vz)>0.6?1:0);if(dist<hear&&los(e.x,e.z,p.x,p.z)){e.state='search';e.sx=p.x;e.sz=p.z;e.searchT=0;e.qT=1;e.ta=ang;g.nx=p.x;g.nz=p.z;bfs(g.nflow,Math.floor(p.x),Math.floor(p.z));}}
 if(!see&&(e.state==='idle'||e.state==='patrol')){for(const o of g.enemies){if(o.alive||o.found||o===e)continue;const bx=o.x-e.x,bz=o.z-e.z,bd2=Math.hypot(bx,bz);if(bd2<Dd().vision*0.8&&Math.abs(angDiff(e.a,Math.atan2(bx,bz)))<Dd().cone&&los(e.x,e.z,o.x,o.z)){o.found=1;e.wary=1;e.state='search';e.sx=o.x;e.sz=o.z;e.searchT=0;e.qT=1.4;popup(e.x,e.z,'BODY!','#ffd36b');sfx('alert');g.nx=o.x;g.nz=o.z;bfs(g.nflow,Math.floor(o.x),Math.floor(o.z));for(const q of g.enemies)if(q!==e&&q.alive&&q.state!=='chase'&&Math.hypot(q.x-e.x,q.z-e.z)<6){q.state='search';q.sx=o.x;q.sz=o.z;q.searchT=0;q.qT=1;q.wary=1;}break;}}}
 if(see){if(e.state!=='chase'){spot(e);e.state='chase';e.react=(wd.melee?0.2:rnd(0.5,0.75))*Dd().react*(e.rmul||1)*(1+0.15*pk('sense'));}e.lkx=p.x;e.lkz=p.z;e.seeT=0;}else e.seeT+=dt;
 if(!p.alive&&e.state==='chase'){e.state='idle';}
 e.aiming=false;let tvx=0,tvz=0,face=null;
 switch(e.state){
  case 'idle':e.turnT-=dt;if(e.turnT<=0){e.turnT=rnd(1.5,4);e.ta=e.a+rnd(-1.3,1.3);}face=e.ta;break;
  case 'patrol':if(e.pauseT>0){e.pauseT-=dt;break;}tvx=Math.sin(e.pa)*1.3;tvz=Math.cos(e.pa)*1.3;face=e.pa;break;
  case 'distract':{const c=e.cashT;if(!c||c.life<=0){e.state='patrol';break;}const ddx=c.x-e.x,ddz=c.z-e.z,dd=Math.hypot(ddx,ddz);face=Math.atan2(ddx,ddz);if(dd>0.8){tvx=ddx/dd*2.2;tvz=ddz/dd*2.2;}break;}
  case 'search':{const dd=Math.hypot(e.sx-e.x,e.sz-e.z);if(dd>0.9){const t=flowStep(g.nflow,e,e.sx,e.sz);if(t){const ddx=t[0]-e.x,ddz=t[1]-e.z,l=Math.hypot(ddx,ddz)||1;tvx=ddx/l*2.6;tvz=ddz/l*2.6;face=Math.atan2(ddx,ddz);}else{e.searchT+=dt;}}
   else{e.searchT+=dt;face=e.a+dt*3;}if(e.searchT>(e.wary?6:3.5)){e.state=e.wary?'idle':'patrol';e.turnT=0;e.searchT=0;}break;}
  case 'chase':{
   if(!e.weapon){let bi=null,bd=4.5;for(const it of g.items){if(it.flying)continue;const d=Math.hypot(it.x-e.x,it.z-e.z);if(d<bd&&los(e.x,e.z,it.x,it.z)&&WORLD.cell.moveClear(g,e.x,e.z,it.x,it.z)){bd=d;bi=it;}}
    if(bi&&(dist>2.5||!see)){const ddx=bi.x-e.x,ddz=bi.z-e.z;tvx=ddx/(bd||1)*3.2;tvz=ddz/(bd||1)*3.2;face=Math.atan2(ddx,ddz);if(bd<0.5){e.weapon={type:bi.type,ammo:99};g.items.splice(g.items.indexOf(bi),1);e.react=0.5;}break;}}
   if(see){face=ang;
    if(SET.diff!=='easy'&&!e.boss&&p.weapon&&!WD[p.weapon.type].melee&&dist<10&&!(e.dodgeT>0)&&Math.abs(angDiff(p.a,Math.atan2(-dx,-dz)))<0.09&&Math.random()<dt*(SET.diff==='hard'?1.6:0.7)){e.dodgeT=0.3;e.dodgeD=Math.random()<0.5?-1:1;}
    if(e.boss){const r=bossAI(e,dt,dist,dx,dz,ang);tvx=r[0];tvz=r[1];}
    else if(wd.melee){const sp=e.weapon?3.6:3.4;if(dist>0.85){tvx=dx/dist*sp;tvz=dz/dist*sp;const pg=p.weapon&&!WD[p.weapon.type].melee;if(pg&&dist>2.2){const zz=Math.sin(g.T*5+e.id*1.7)*0.85;tvx+=dz/dist*sp*zz;tvz-=dx/dist*sp*zz;}}if(dist<1.05&&e.wind<=0&&e.cd<=0){e.wind=0.28*Math.min(Dd().react,1.6);e.alertT=0.3;}}
    else{e.aiming=true;e.react-=dt;const want=e.pers==='rush'?3.2:e.pers==='careful'?6.5:4.8;
     if(dist>want+1.5){tvx=dx/dist*2.2;tvz=dz/dist*2.2;}else if(dist<want-1.5&&e.pers!=='rush'){tvx=-dx/dist*1.8;tvz=-dz/dist*1.8;}
     e.strT=(e.strT||0)-dt;if(e.strT<=0){e.strT=rnd(0.7,1.6);e.strD=Math.random()<0.5?-1:1;}if(SET.diff!=='easy'||e.pers==='rush'){const sv=e.pers==='careful'?1.1:1.5;tvx+=dz/dist*sv*e.strD;tvz-=dx/dist*sv*e.strD;}
     const lead=SET.diff==='hard'?0.9:SET.diff==='normal'?0.5:0;if(lead){const tt=dist/Dd().ebSpd;face=Math.atan2(dx+p.vx*tt*lead,dz+p.vz*tt*lead);}
     if(e.react<=0&&e.cd<=0&&Math.abs(angDiff(e.a,face))<0.22){e.weapon.ammo=99;fireGun(e,e.weapon,false);
      if(wd.burst){e.burst++;if(e.burst>=wd.burst){e.burst=0;e.cd=0.9;}}else if(wd.burst3){e.burst++;if(e.burst<3)e.cd=0.08;else{e.burst=0;e.cd=wd.ecd;}}}}}
   if(see&&tvx*dx+tvz*dz>1e-6&&!WORLD.cell.moveClear(g,e.x,e.z,p.x,p.z,Math.max(0,Math.min(e.r,p.r)-0.02))){
    const t=flowStep(g.flow,e,p.x,p.z),sp=(tvx*dx+tvz*dz)/dist;
    if(t){const tx=t[0]-e.x,tz=t[1]-e.z,d=Math.hypot(tx,tz)||1;tvx=tx/d*sp;tvz=tz/d*sp;if(wd.melee)face=Math.atan2(tx,tz);}else{tvx=tvz=0;}
   }
   if(!see&&!wd.melee&&e.pers==='careful'&&e.seeT<2.2){face=Math.atan2(e.lkx-e.x,e.lkz-e.z);e.aiming=e.seeT<1.2;e.react=Math.max(e.react,0.2);}
   else if(!see){if(e.seeT<6){const t=flowStep(g.flow,e,p.x,p.z);if(t){const ddx=t[0]-e.x,ddz=t[1]-e.z,dd=Math.hypot(ddx,ddz)||1,sp=wd.melee?3.2:2.6;tvx=ddx/dd*sp;tvz=ddz/dd*sp;face=Math.atan2(ddx,ddz);}}
    else{e.state='search';e.sx=e.lkx;e.sz=e.lkz;e.searchT=0;e.qT=1;g.nx=e.sx;g.nz=e.sz;bfs(g.nflow,Math.floor(e.sx),Math.floor(e.sz));}e.react=Math.max(e.react,0.35);}
  }break;}
 if(e.wind>0){e.wind-=dt;tvx*=0.3;tvz*=0.3;if(e.wind<=0){e.atkT=e.atkDur=0.2;e.jab=Math.random()<0.5;e.cd=0.8;sfx(wd.snd||'swing_fists',0.8);const d2=Math.hypot(p.x-e.x,p.z-e.z);
  if(p.alive&&d2<1.25&&Math.abs(angDiff(e.a,Math.atan2(p.x-e.x,p.z-e.z)))<1.1){sfx('hit_'+(e.weapon?e.weapon.type:'fists'));hurtPlayer([(p.x-e.x)/(d2||1),(p.z-e.z)/(d2||1)],e.weapon?e.weapon.type:'fists');}}}
 if(e.dodgeT>0){e.dodgeT-=dt;tvx=dz/dist*5.2*e.dodgeD;tvz=-dx/dist*5.2*e.dodgeD;}
 if(face!==null){const turn=e.state==='chase'?8:3;e.a+=clamp(angDiff(e.a,face),-turn*dt,turn*dt);}
 tvx*=e.spd||1;tvz*=e.spd||1;const k=1-Math.exp(-dt*10);e.vx+=(tvx-e.vx)*k;e.vz+=(tvz-e.vz)*k;const moved=moveChar(e,dt,false);
 if(e.state==='patrol'&&e.pauseT<=0&&moved<1.3*dt*0.4){const opts=[0,Math.PI/2,Math.PI,-Math.PI/2].filter(a=>Math.abs(angDiff(a,e.pa))>0.1);e.pa=pick(opts);e.pauseT=rnd(0.3,1.2);}}
function separate(){const g=G,cs=[g.player,...g.enemies].filter(c=>c.alive&&!(c.down>0));
 for(let i=0;i<cs.length;i++)for(let j=i+1;j<cs.length;j++){const a=cs[i],b=cs[j],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz),m=a.r+b.r;if(d<m&&d>1e-4){const p=(m-d)/2,nx=dx/d,nz=dz/d;a.x-=nx*p;a.z-=nz*p;b.x+=nx*p;b.z+=nz*p;collideGrid(a);collideGrid(b);}}}
function lexAI(e,dt,dist,dx,dz,ang){const enr=e.hp<=e.maxhp/2;e.aiming=dist>=1.3;e.react-=dt;const d=dist||1;let tvx=0,tvz=0;
 if(dist>6.5){tvx=dx/d*2.2;tvz=dz/d*2.2;}else if(dist<3.2){tvx=-dx/d*1.9;tvz=-dz/d*1.9;}else{tvx=-dz/d*1.2;tvz=dx/d*1.2;}
 if(dist<1.35&&e.cd<=0){e.cd=1.0;e.atkT=e.atkDur=0.25;sfx('punch');hurtPlayer([dx/d,dz/d],'boss');shake(0.5);}
 else if(e.react<=0&&e.cd<=0&&dist<11&&los(e.x,e.z,G.player.x,G.player.z)){throwNade(e,'e',G.player.x+rnd(-0.7,0.7),G.player.z+rnd(-0.7,0.7));e.atkT=e.atkDur=0.3;e.cd=(enr?1.05:1.75)*Dd().ecd;if(Math.random()<0.25)popup(e.x,e.z,pick(['"Catch, pal!"','"Solid gold, baby!"','"This suit is linen!"','"You can\'t afford me!"']),'#ffa6c9');}
 if(enr&&!e.enraged){e.enraged=true;popup(e.x,e.z,'"MY SUIT! THIS IS LINEN!"','#ffa6c9');sfx('boss');}return[tvx,tvz];}
