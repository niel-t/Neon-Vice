'use strict';
// Dialogue data and log presentation.

/* ---- text size (SET.textSize, shared by the dialogue log, drawSay and banner) ---- */
const TEXT_SIZES={S:{name:'SMALL',k:0.85},M:{name:'MEDIUM',k:1},L:{name:'LARGE',k:1.2},XL:{name:'HUGE',k:1.45}};
const TEXT_ORDER=['S','M','L','XL'];
const textKey=()=>TEXT_ORDER.includes(SET.textSize)?SET.textSize:'M';
const textScale=()=>TEXT_SIZES[textKey()].k;
function applyTextSize(){document.documentElement.style.setProperty('--tx',String(textScale()));const b=$('bText');if(b)b.textContent='TEXT SIZE: '+TEXT_SIZES[textKey()].name;}
function cycleTextSize(){SET.textSize=TEXT_ORDER[(TEXT_ORDER.indexOf(textKey())+1)%TEXT_ORDER.length];saveSet();applyTextSize();dlogFollow();}

/* ---- right-side scrolling conversation log (Disco Elysium style) ---- */
// Earlier visits this session stay in the log, collapsed; nothing here is saved.
const DLOG={hist:[],cur:null,max:8,follow:true,bound:false};
const dlogEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dlogRow=L=>'<div class="dl'+(L.me?' me':'')+'"><span class="who">'+dlogEsc(L.who)+'</span><span class="txt">'+dlogEsc(L.t)+'</span></div>';
function dlogBegin(title){
 if(DLOG.cur&&DLOG.cur.lines.length){DLOG.hist.push(DLOG.cur);if(DLOG.hist.length>DLOG.max)DLOG.hist.shift();}
 DLOG.cur={title,lines:[]};
 $('dlogHist').innerHTML=DLOG.hist.map(v=>'<details class="dlv"><summary>'+dlogEsc(v.title)+'</summary>'+v.lines.map(dlogRow).join('')+'</details>').join('');
 $('dlogTitle').textContent=title;$('dlogLines').innerHTML='';dlogScrollEnd();}
// Adds a speaker line and returns its text element; t is the full line, recorded for history.
function dlogLine(who,me,t){
 const box=$('dlogLines');for(const o of box.children)o.classList.add('old');
 const el=document.createElement('div');el.className='dl'+(me?' me':'');el.innerHTML='<span class="who"></span><span class="txt"></span>';
 el.firstChild.textContent=who;box.appendChild(el);if(DLOG.cur)DLOG.cur.lines.push({who,me,t});dlogFollow();return el.lastChild;}
// Stick to the newest line unless the player has scrolled up to reread.
function dlogScrollEnd(){const s=$('dlogScroll');if(!s)return;
 if(!DLOG.bound){DLOG.bound=true;s.addEventListener('scroll',()=>{DLOG.follow=s.scrollHeight-s.scrollTop-s.clientHeight<40;},{passive:true});}
 DLOG.follow=true;s.scrollTop=s.scrollHeight;}
function dlogFollow(){if(DLOG.follow)dlogScrollEnd();}
// Numbered choices sit inline at the end of the log until one is picked.
function dlogChoices(opts,sel,onPick,onHover){
 const ol=document.createElement('ol');ol.className='dlChoices';ol.id='dlChoices';
 opts.forEach((o,k)=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.innerHTML='<b></b><span></span>';
  b.firstChild.textContent=(k+1)+'.';b.lastChild.textContent=dlgText(o.t);
  b.onclick=e=>{e.stopPropagation();onPick(k);};b.onmouseenter=()=>onHover(k);li.appendChild(b);ol.appendChild(li);});
 $('dlogLines').appendChild(ol);dlogChoiceSel(sel);dlogFollow();}
function dlogChoiceSel(k){const ol=$('dlChoices');if(ol)ol.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('sel',i===k));}
function dlogChoicesClear(){const ol=$('dlChoices');if(ol)ol.remove();}

/* ---- branching dialogue data (roadmap §2.7, docs/STYLE-DIALOGUE.md) ----
 DLG[id]={start:'n0',nodes:{
   n0:{say:[['MCWEY','line'],['P','player line']],next:'n1'},
   n1:{say:[...],choose:[{t:'shown and spoken',say:'spoken, if different',to:'n2',tone:'cold',set:{rel:{mcwey:-1}},req:{has:'c_ledger'}}, ...]}}}
 - Text is a string, or {don,consigliere,money,_} keyed by the player's character.
 - A choice without `to`, or a node with neither `next` nor `choose`, ends the DLG; the visit carries on.
 - Every choice offers at least 3 ungated options (scripts/dlg-check.cjs enforces this and the style lint).
 - req: {has:collectId, flag, noFlag, char, rel:{who:min}}. set: {rel:{who:±1}, flag}.
 - Consequences are light (decision Q-D): rel runs -REL_MAX..REL_MAX and relMul() turns it into ±10% on prices. */
const DLG_WHO={MCWEY:'McWEY',P:null};
const REL_MAX=3,REL_PCT=0.10;
const DLG_LINT={maxLine:90,maxOpt:60,maxDash:1,banned:['delve','tapestry','landscape','testament','realm','journey','navigate','unleash','embark','symphony','dance of','a sea of',"it's not just","isn't about",'not just about',"let's be honest",'at the end of the day',"here's the thing",'make no mistake','mark my words',"no idea who you're dealing with","you'll regret"]};
// Player responses, one voice per crew member. Until the W10d rewrite each becomes a three-way choice.
const REPLY={don:["Consider it done.","This city answers to one family.","He'll be swimming with the fishes. Not yours, of course.","Then let's sink his boats.","Game over, Silks.","Shopping. Sure.","I'll make the singer sing.","Tell the shark I'm coming."],consigliere:["I'll give them some advice.","My knuckles will do the talking.","Then let's go have a word with him.","I'll give his boats some advice.","I'll pull the plug myself.","I could use a new tie.","Let's hear the album.","Time for Lex to take a swim."],money:["What's my cut?","Everybody has a price. I'll find theirs.","His watch, his wallet — same thing.","Fake gold? That's just insulting.","Clean money, my foot.","Finally. Retail therapy.","I'll pay the singer double.","Keep the change, Silks."]};
const SQUARE_REPLY={don:"Then we understand each other.",consigliere:"Free advice, then: don't forget it.",money:"Best investment I ever made."};
const dlgTrio=pick=>({start:'pick',nodes:{pick:{choose:['don','consigliere','money'].map(c=>({t:pick(c),tone:c}))}}});
const DLG={square:dlgTrio(c=>SQUARE_REPLY[c])};
REPLY.don.forEach((_,i)=>{DLG['reply'+i]=dlgTrio(c=>REPLY[c][i]);});

/* ---- DLG runtime hooks: rel (PROG[c].rel), world flags (PROG[c].wflags), collectibles (hasCollect, W14) ---- */
const dlgProg=()=>typeof myProg==='function'?myProg():null;
const dlgObj=(p,k)=>p[k]&&typeof p[k]==='object'&&!Array.isArray(p[k])?p[k]:(p[k]={});
function relGet(who){const p=dlgProg(),v=p&&p.rel&&p.rel[who];return Number.isInteger(v)?Math.max(-REL_MAX,Math.min(REL_MAX,v)):0;}
const relMul=who=>1-REL_PCT*relGet(who)/REL_MAX; // price multiplier: a friend of McWey's pays up to 10% less
function dlgFlag(f){const p=dlgProg();return !!(p&&p.wflags&&p.wflags[f]);}
const dlgHas=id=>typeof hasCollect==='function'&&!!hasCollect(id);
function dlgReqOk(r){if(!r)return true;
 if(r.has&&!dlgHas(r.has))return false;if(r.flag&&!dlgFlag(r.flag))return false;if(r.noFlag&&dlgFlag(r.noFlag))return false;
 if(r.char&&CHARS[selIdx].id!==r.char)return false;if(r.rel)for(const w in r.rel)if(relGet(w)<r.rel[w])return false;return true;}
function dlgApply(s){const p=dlgProg();if(!s||!p)return;
 if(s.rel){const R=dlgObj(p,'rel');for(const w in s.rel)R[w]=Math.max(-REL_MAX,Math.min(REL_MAX,relGet(w)+s.rel[w]));}
 if(s.flag)dlgObj(p,'wflags')[s.flag]=1;saveProg();}
const dlgText=v=>typeof v==='string'?v:(v[CHARS[selIdx].id]??v._);
const dlgStart=id=>({dlg:id,n:DLG[id].start});
// Expands one node into chat queue items: its lines, then its choice or a pointer to the next node.
function dlgItems(id,n){const node=DLG[id].nodes[n],out=(node.say||[]).map(([w,t])=>({who:w==='P'?'p':'m',name:w,t:dlgText(t)}));
 if(node.choose)out.push({choose:node.choose,dlg:id});else if(node.next)out.push({dlg:id,n:node.next});return out;}
function dlogScrollBy(px){const s=$('dlogScroll');if(s)s.scrollTop+=px;}
