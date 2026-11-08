'use strict';
// Shared mission table and world flags. DOM/GL-free: must load in Node vm.
/* ================= MISSIONS (contract MISSIONS v1, owner W14) =================
   Campaign missions wrap LEVELS by index: cN = {idx:N, kind:'campaign', stages, start}. idx 0..CAMPAIGN_LEN-1 is the key for
   every index-keyed save/story structure (JOBS.best/top, stash, CHALLENGES, PAR, LEVEL_TRACKS, payout flags, the ending), so
   campaign ids and indexes never move. Unmigrated missions have one stage, 'legacy' = LEVELS[idx].
   run.mission is a MISSIONS id and run.stage one of its stages (shared with W6's run v1). */
const CAMPAIGN_LEN=8;
const MISSIONS={
 c0:{idx:0,kind:'campaign',stages:['legacy'],start:'legacy'},
 c1:{idx:1,kind:'campaign',stages:['legacy'],start:'legacy'},
 c2:{idx:2,kind:'campaign',stages:['legacy'],start:'legacy'},
 c3:{idx:3,kind:'campaign',stages:['legacy'],start:'legacy'},
 c4:{idx:4,kind:'campaign',stages:['legacy'],start:'legacy'},
 c5:{idx:5,kind:'campaign',stages:['legacy'],start:'legacy'},
 c6:{idx:6,kind:'campaign',stages:['legacy'],start:'legacy'},
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
