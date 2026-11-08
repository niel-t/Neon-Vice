const assert=require('node:assert/strict');
const {worldData}=require('./world-snapshot.cjs');

function checkStages(){
 const {WORLD:W}=worldData();
 const mission={id:'fixture',stages:['a','b'],start:'a'},descs={
  a:{id:'a',kind:'grid',rev:1,arrivals:{down:{at:[1,1],dir:0}},stairs:[{id:'up',to:'b',at:[3,3],arrive:'up'}],backdrop:[]},
  b:{id:'b',kind:'grid',rev:2,arrivals:{up:{at:[1,1]}},stairs:[{id:'down',to:'a',at:[3,3],arrive:'down'}],backdrop:[{stage:'a',dy:-3.4,dim:.6}]}
 };
 const make=(d=descs,o)=>W.stageRun(mission,id=>d[id],o);
 const run=make(),before=JSON.stringify(run.encode()),initial=run.prepare('a');
 assert.equal(JSON.stringify(run.encode()),before,'Prepare does not mutate');
 const a0={doors:{d:0},enemies:[{id:0,hp:1}],items:[{id:'gun',mag:3}],hp:2};
 run.commit(initial,null,a0,{time:0,score:0});
 assert(run.active&&run.current==='a');
 const a1={...a0,doors:{d:1},enemies:[{id:0,hp:0}],items:[],hp:1.4};
 const toB=run.prepareStair('up');
 assert.equal(toB.to,'b');assert.deepEqual(Array.from(toB.arrival.at),[1,1]);
 const b0={doors:{b:0},enemies:[{id:0,hp:1}],items:[{id:'ammo'}],hp:1.4};
 const notCommitted=JSON.stringify(run.encode()),preview=run.preview(toB,a1,b0,{time:20,score:700});
 assert.equal(preview.current,'b');assert.equal(JSON.stringify(run.encode()),notCommitted,'Preview validates prospective save without mutation');
 run.commit(toB,a1,b0,{time:20,score:700});
 assert.throws(()=>run.commit(toB,a1,b0),/Stale/);
 const retry=run.retry();assert.equal(retry.sid,'b');assert.equal(retry.bag.time,20);assert.equal(retry.snapshot.hp,1.4);
 const encoded=JSON.parse(JSON.stringify(run.encode())),resumed=make().decode(encoded);
 assert.equal(resumed.current,'b');assert.equal(resumed.retry().bag.score,700);
 encoded.entry.data.hp=99;assert.equal(resumed.retry().snapshot.hp,1.4,'Decode owns data');
 const b1={...b0,enemies:[{id:0,hp:0}],items:[],doors:{b:.9}};
 const toA=run.prepareStair('down');assert.equal(toA.snapshot.enemies[0].hp,0);assert.equal(toA.snapshot.items.length,0);
 run.commit(toA,b1,{...toA.snapshot,hp:1.1},{time:40,score:1400});
 const revisit=run.prepareStair('up');assert.equal(revisit.snapshot.enemies[0].hp,0);assert.equal(revisit.snapshot.doors.b,.9);
 assert.equal(run.backdrops('b')[0].stage,'a');
 assert(Object.isFrozen(run.backdrops('b')[0]));
 const old=JSON.stringify(run.encode()),prepared=run.prepareStair('up');
 assert.throws(()=>{throw new Error('detached factory failed');},/factory/);
 assert.equal(JSON.stringify(run.encode()),old,'Factory failure before commit leaves run unchanged');
 assert.throws(()=>run.commit(prepared,a1,{bad:Infinity}),/finite/);assert.equal(JSON.stringify(run.encode()),old,'Invalid incoming snapshot is atomic');
 class Model{constructor(){this.vertex=1;}}
 assert.throws(()=>run.commit(prepared,a1,{model:new Model()}),/plain JSON/);
 run.restart();assert(!run.active&&run.current==='a');assert.equal(Object.keys(run.encode().states).length,0);
 assert.throws(()=>run.commit(revisit,a1,b0),/Stale/);
 const foreign=make().prepare('a');assert.throws(()=>run.commit(foreign,null,a0),/foreign/);
 const drift=JSON.parse(JSON.stringify(resumed.encode()));drift.entry.rev=99;
 const clean=make(),empty=JSON.stringify(clean.encode());assert.throws(()=>clean.decode(drift),/revision/);assert.equal(JSON.stringify(clean.encode()),empty);
 const malformed={...JSON.parse(JSON.stringify(resumed.encode())),v:2};assert.throws(()=>clean.decode(malformed),/Invalid/);
 const nullState=JSON.parse(JSON.stringify(resumed.encode()));nullState.states.b.data=null;
 assert.throws(()=>clean.decode(nullState),/cannot be null/);assert.equal(JSON.stringify(clean.encode()),empty,'Null retained data rejection is atomic');
 const tooLarge=make(descs,{maxStageBytes:256,maxRunBytes:1024});
 assert.throws(()=>tooLarge.commit(tooLarge.prepare('a'),null,{text:'x'.repeat(300)}),/budget/);
 assert.throws(()=>tooLarge.commit(tooLarge.prepare('a'),null,{text:'\u00e9'.repeat(150)}),/budget/,'Budget counts UTF-8 bytes, not string length');
 const clone=()=>JSON.parse(JSON.stringify(descs));
 let bad=clone();bad.a.stairs[0].arrive='missing';assert.throws(()=>make(bad),/arrival missing/);
 bad=clone();bad.a.stairs[0].to='missing';assert.throws(()=>make(bad),/reference/);
 bad=clone();bad.b.arrivals.up.at=[3,3];assert.throws(()=>make(bad),/outside/);
 bad=clone();bad.b.arrivals.unsafe={at:[3,3]};assert.throws(()=>make(bad),/outside/,'Unreferenced selectable arrivals must also avoid stair triggers');
 bad=clone();bad.b.stairs=[];assert.throws(()=>make(bad),/paired/);
 bad=clone();bad.b.backdrop[0].stage='b';assert.throws(()=>make(bad),/backdrop/);
 bad=clone();bad.b.backdrop[0].dy=NaN;assert.throws(()=>make(bad),/finite/);
 bad=clone();bad.a.stairs.push({...bad.a.stairs[0]});assert.throws(()=>make(bad),/reference/);
 const fresh=make();assert.equal(fresh.decode(JSON.parse(JSON.stringify(fresh.encode()))).active,false);
 console.log('WORLD stages: detached prepare/commit, retained snapshots, entry retry, revision, rollback and budgets checked');
}
module.exports={checkStages};
if(require.main===module)checkStages();
