'use strict';
// Shared mission table and world flags. DOM/GL-free: must load in Node vm.
/* ================= MISSIONS (contract MISSIONS v1, owner W14) =================
   Campaign missions wrap LEVELS by index: cN = {idx:N, kind:'campaign', stages, start}. idx 0..CAMPAIGN_LEN-1 is the key for
   every index-keyed save/story structure (JOBS.best/top, stash, CHALLENGES, PAR, LEVEL_TRACKS, payout flags, the ending), so
   campaign ids and indexes never move. Unmigrated missions have one stage, 'legacy' = LEVELS[idx].
   run.mission is a MISSIONS id and run.stage one of its stages (shared with W6's run v1); run.var is the variant chosen at entry.
   Non-campaign missions (kind 'bonus'|'story'|'side'; ids never cN) have no index: {kind, name, base:<LEVELS idx the 'legacy'
   stage borrows>, stages, start, unlock:<cond>, rewards:[{flag}], rev}. Their records live in nb86jobs.m[id]={done, best:{'<rev>.<var>':{g,t,s,c,ch,d}}};
   they never touch index-keyed saves, story flags, McWey's cut or the campaign's next job.
   Conditions: {all:[c]}|{any:[c]}|{not:c}|{done:missionId}|{flag:wflag}|{has:collectId}; evaluated against ctx {done(id),flag(f),has(id)}.
   variants: {id:{when:<cond>, spawn?:[x,z] player start cell on the legacy map, clear?}}; the first match wins, else 'base'.
   briefFlags: wflags a mission's McWey brief sets; cleared when that brief starts so the latest choice wins.
   clear: {boss:'required'|'optional'} (default required): whether the floor clears with the boss still standing. */
const CAMPAIGN_LEN=8;
const MISSIONS={
 c0:{idx:0,kind:'campaign',stages:['legacy'],start:'legacy'},
 c1:{idx:1,kind:'campaign',stages:['legacy'],start:'legacy',briefFlags:['flamingo_back'],
  variants:{back:{when:{flag:'flamingo_back'},spawn:[21,15]}}}, // Tony leaves the delivery door open: start at the east entrance
 c2:{idx:2,kind:'campaign',stages:['legacy'],start:'legacy'},
 c3:{idx:3,kind:'campaign',stages:['legacy'],start:'legacy'},
 c4:{idx:4,kind:'campaign',stages:['legacy'],start:'legacy'},
 c5:{idx:5,kind:'campaign',stages:['legacy'],start:'legacy'},
 c6:{idx:6,kind:'campaign',stages:['legacy'],start:'legacy',briefFlags:['singer_paid']}, // read by brief7; no map change until W2's studio plan
 c7:{idx:7,kind:'campaign',stages:['legacy'],start:'legacy'},
};
const ownKey=(o,k)=>typeof k==='string'&&Object.prototype.hasOwnProperty.call(o,k);
const missionId=i=>'c'+i;
const missionKnown=id=>ownKey(MISSIONS,id);
/* campaign index of a mission id, -1 for anything else (non-index missions, unknown ids) */
function missionIdx(id){const m=missionKnown(id)&&MISSIONS[id];return m&&m.kind==='campaign'&&Number.isInteger(m.idx)?m.idx:-1;}
const campaignIds=()=>Array.from({length:CAMPAIGN_LEN},(_,i)=>missionId(i));
/* the stage a mission begins at; null for unknown missions (a run naming one is dropped) */
const missionStart=id=>missionKnown(id)?MISSIONS[id].start:null;
const missionStageOK=(id,st)=>missionKnown(id)&&MISSIONS[id].stages.includes(st);
/* run-resume resolver for W6's normRun: null = unknown mission (drop the run); otherwise {stage, keep}.
   A stage the mission has resumes as-is. A mission that is still one 'legacy' stage resumes there with the stage kit kept,
   whatever stage id was stored: pre-MISSIONS runs saved free-form ids ('s0', 's1', ...) that all meant "this map".
   Only a stage a migrated mission no longer has restarts it from the beginning (keep:false = entry kit, no stow). */
const missionStage=(id,st)=>{if(!missionKnown(id))return null;const m=MISSIONS[id];
 if(missionStageOK(id,st))return {stage:st,keep:true};
 if(m.stages.length===1&&m.stages[0]==='legacy')return {stage:'legacy',keep:true};
 return {stage:m.start,keep:false};};
const missionIsCampaign=id=>missionIdx(id)>=0;
/* the LEVELS index whose map a mission's 'legacy' stage plays on (-1 if none) */
function missionBase(id){if(!missionKnown(id))return -1;const m=MISSIONS[id];return m.kind==='campaign'?missionIdx(id):Number.isInteger(m.base)?m.base:-1;}
function missionName(id){if(!missionKnown(id))return '';const m=MISSIONS[id];return m.name||(typeof LEVELS!=='undefined'&&LEVELS[missionBase(id)]||{}).name||id;}
const missionRev=id=>missionKnown(id)&&Number.isInteger(MISSIONS[id].rev)?MISSIONS[id].rev:1;
const extraIds=()=>Object.keys(MISSIONS).filter(id=>!missionIsCampaign(id));
function condOK(c,ctx){if(c==null)return true;if(typeof c!=='object')return false;
 if(Array.isArray(c.all))return c.all.every(x=>condOK(x,ctx));if(Array.isArray(c.any))return c.any.some(x=>condOK(x,ctx));
 if('not' in c)return !condOK(c.not,ctx);if(typeof c.done==='string')return !!ctx.done(c.done);if(typeof c.flag==='string')return !!ctx.flag(c.flag);
 if(typeof c.has==='string')return !!ctx.has(c.has);return false;}
const missionUnlocked=(id,ctx)=>missionKnown(id)&&condOK(MISSIONS[id].unlock,ctx);
const missionVariantOK=(id,v)=>v==='base'||missionKnown(id)&&ownKey(MISSIONS[id].variants||{},v);
function missionVariant(id,ctx){const vs=missionKnown(id)&&MISSIONS[id].variants||{};for(const v of Object.keys(vs))if(condOK(vs[v].when,ctx))return v;return 'base';}
const missionVar=(id,v)=>v!=='base'&&missionVariantOK(id,v)?MISSIONS[id].variants[v]:{};
/* clear rules: the variant's override, then the mission's, then the default */
function missionClear(id,v){const m=missionKnown(id)?MISSIONS[id]:{};return Object.assign({boss:'required'},m.clear,missionVar(id,v).clear);}
const missionBriefFlags=id=>missionKnown(id)&&MISSIONS[id].briefFlags||[];
/* reset a brief's own choices on the character's wflags before the brief replays them; true if anything changed */
function missionBriefReset(id,wflags){let ch=false;for(const f of missionBriefFlags(id))if(wflags&&ownKey(wflags,f)){delete wflags[f];ch=true;}return ch;}
