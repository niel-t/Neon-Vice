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
// {kid} reads "kid" until the loan is square, "partner" after (voice sheet).
const DLG_TOKENS=['kid'];

/* ---- McWey: every visit is at most ~6 lines (docs/STYLE-DIALOGUE.md §2) ---- */
const MC_FIRST="Sit. Don't mind the shark. He's only eaten one accountant.";
const MC_LOAN_LINES=["The {car} the valet parked? Ugly, yours, and twelve grand.","I take sixty percent of every job till we're square."];
const MC_HI={kid:["Wipe your feet. That carpet cost more than your car.","Still employed. Good for you."],partner:["Partner. No, the good chair.","Drink? I'm pouring either way."]};
// Debrief = one consequence line, then the grade and the money in one line.
const MC_DEBRIEF=[["The news says gas leak. I love the news."],["Club Flamingo is closed for renovations."],["Moreau's watch stopped at 11:52. I checked."],
 ["Lex called me crying. I told him boats sink."],["Lex is counting the quarters in his couch."],["Lex hit your ride. You hit his mall. Call it even."],
 ["The singer sang. The album's still terrible."],["Lex is fish food. The Royal Flush is in my harbour."]];
const DEB_STYLE={clean:[["Not a scratch, and the motel never woke up. I like quiet."],["Flamingo closed without a siren. Nobody spilled a drink."],["Coral Tower looks untouched. Who taught you tidy?"]],
 gore:[["The news has no word for what you did to that motel. I do."],["They'll be scrubbing Flamingo's walls till spring. Good."],["Coral Tower needs a new lobby. Moreau needs nothing."]],
 ruthless:[["Every man in that motel got a personal goodbye."],["You finished the VIP room face to face. The Family noticed."],["Moreau begged. I won't ask how you got the watch."]],
 mixed:MC_DEBRIEF};
const MC_GRADE={S:"Not a hair out of place.",'A+':"Sharp work.",A:"Sharp work.",B:"Solid.",C:"Messy. Pays the same.",D:"I had to buy a mop."};
const MC_PAY={owe:"${take} yours. ${cut} mine. You owe ${debt}.",near:"${take} yours. ${cut} mine. ${debt} and we're square.",
 square:"${take} yours. ${cut} mine. That's the last of it.",free:"${take}. All yours. Count it in front of me.",yacht:"${take}. All yours. And the yacht.",
 yacht2:"Whatever you still owed me? Gone. You work with me now."};
const UNLOCK_LINE={3:"Lex's best speedboat didn't sink. It's under your window. Souvenir.",4:"And lose the street clothes. My tailor's waiting. On the house.",5:"Lex torched your ride, so you fly now. Helicopter's on the roof."};
// Header quote for each job; the log never repeats it.
const MC_QUOTE=["In Miami, gold doesn't lie. People do.","Loyalty's like gold. Heavy, and it looks good on you.","Sharks don't sleep. Neither does McWey.","Gold sinks. Remember that.","Everybody launders. The trick is not getting caught in the dryer.","Revenge is a dish best served at the food court.","Every song ends. Make sure his ends tonight.","On the water, the biggest fish eats first.","Everybody wants the crown. Nobody wants the weight."];
const END_STYLE={clean:{title:'THE QUIET HAND',line:"Tidy, quiet, and nobody saw your face. That's how families last.",quote:"Quiet men hold the most keys."},
 gore:{title:'THE RED TIDE',line:"Half of Miami still talks about the blood. Fear is cheap security.",quote:"Blood makes the best receipts."},
 ruthless:{title:'NO WITNESSES',line:"Nobody left in this city says your name twice.",quote:"Mercy is for people who can afford it."},
 mixed:{title:'STEADY HANDS',line:"Steady all the way up. The Family likes steady.",quote:MC_QUOTE[8]}};
// At most one reaction per visit, in this order; the rest wait for later visits.
const MC_SUIT={pinstripe:"Pinstripes. Now you look like you work for me.",camo:"Camo? In my office? What is this, the Everglades?",pink:"Hot pink. Bold. Miami approves.",power:"Double-breasted. You're learning.",linen:"Linen, sleeves up. Very Ocean Drive."};
const MC_GUN={kid:"Is that a {gun} under your jacket? Don't point it at the shark.",partner:"A {gun}, in my office? Relax. I'd carry one too."};
const MC_JEWEL={kid:"Nice gold. You know where it'd look nicer? My ledger.",partner:"Gold suits you, partner. Heavy, rare."};
const MC_CAR={kid:"New wheels before you've paid for the old ones? Bold.",partner:"You drove that up my driveway? Now I'm jealous."};
const MC_HAUL=[null,"See the pallet by my desk? That's the motel money.","Gold bars now. I had to buy a plinth. A plinth.","I'm putting up a gun wall. My decorator cried.","Champagne's on ice permanently now. That's on you.","Had a sculptor do my bust. In gold. Tasteful.","The pile keeps growing. I like the pile.","The safe won't close any more. Good problem to have.","Look around. All of this? Your work. My money."];

// One scene: McWey's lines, then options; each option may get one McWey answer, then all rejoin at `end`.
const mcSay=ts=>ts.map(t=>['MCWEY',t]);
function dlgScene(lines,opts,end){const nodes={a:{say:mcSay(lines),choose:[]}};if(end)nodes.end={say:mcSay([end])};
 opts.forEach((o,i)=>{const c={t:o.t};for(const k of ['say','set','req'])if(o[k])c[k]=o[k];
  if(o.a){nodes['r'+i]={say:mcSay([o.a])};if(end)nodes['r'+i].next='end';c.to='r'+i;}else if(end)c.to='end';nodes.a.choose.push(c);});
 return {start:'a',nodes};}
// Options are different actions: do it (in the crew member's own voice), press McWey, or push back.
const DLG={
 brief0:dlgScene(["Sunset Motel, Route 1. New faces selling on my corners.","Nobody asked me. Go ask them why."],[
  {t:{don:"They'll tell me.",consigliere:"I'll ask nicely. Once.",money:"I'll ask what they're clearing."}},
  {t:"Who are they?",a:"Nobody, by morning."},
  {t:"What's in it for me?",a:"Your car stays out of the canal.",set:{rel:{mcwey:-1}}}]),
 brief1:dlgScene(["The motel was a front. The money runs through Club Flamingo.","VIP lounge, back room. Close it for good."],[
  {t:{don:"It's closed.",consigliere:"I'll explain the new hours.",money:"Closed. The cash drawer comes with me."}},
  {t:"I'll take the back door.",a:"Tony leaves it open for deliveries. Be a delivery.",set:{flag:'flamingo_back'}},
  {t:"Who runs it?",a:"A man who thinks bouncers are a business plan."}]),
 brief2:dlgScene(["Moreau. Top floor, Coral Tower.","Bring me his watch. I want to know what time it was."],[
  {t:{don:"You'll have it by midnight.",consigliere:"I'll ask him the time.",money:"The watch is yours. The wallet's mine."}},
  {t:"Just Moreau?",a:"Everybody up there works for Moreau. Work's over."},
  {t:"Anything else, Mr McWey?",a:"Yes. Wipe your feet on the way out.",set:{rel:{mcwey:1}}}]),
 brief3:dlgScene(["Lex swears his marina deliveries are clean. My corners say different.","I can't touch my golden boy. You were never here. Sink his boats."],[
  {t:{don:"Every boat.",consigliere:"The sea can have a word with him.",money:"Sinking money. Hurts to watch."}},
  {t:"I thought Lex was yours.",a:"So did Lex."},
  {t:"And if one floats?",a:"Then it's yours. I hear speedboats are fun."}]),
 brief4:dlgScene(["Lex runs his laundry through the Starlight Arcade. Quarters in, clean dollars out.","Unplug every cabinet."],[
  {t:{don:"Game over.",consigliere:"I'll pull the plug myself.",money:"I'm keeping the quarters."}},
  {t:"Kids play there.",a:"Not after midnight they don't."},
  {t:"Can I beat a high score first?",a:"One game. Then you break the machine.",set:{rel:{mcwey:-1}}}]),
 brief5:dlgScene(["You've been working too hard, {kid}. Ocean View Mall. My treat.","Relax. What's the worst that could happen?"],[
  {t:{don:"Shopping. Sure.",consigliere:"I could use a new tie.",money:"Your treat. Your card."}},
  {t:"You never treat anybody.",a:"I'm treating you. Don't make it weird."},
  {t:"Who else knows I'm going?",a:"Me. And whoever I told."}]),
 brief6:dlgScene(["Lex is hiding. His last friend is a pop singer he pays to make an album.","Sunset Sound. Crash the session. Make the singer tell you where Lex sleeps."],[
  {t:{don:"He'll sing.",consigliere:"We'll discuss the lyrics.",money:"I'll outbid Lex."}},
  {t:"Why crash it? I'll buy the session.",a:"Your money. Don't expense it.",set:{flag:'singer_paid'}},
  {t:"Is the album any good?",a:"I heard the demo. Take the tapes as well."}]),
 brief7:dlgScene(["Lex is on the Royal Flush. Two miles out. Glass floor, sharks underneath.","Bring me the yacht. Lex is optional."],[
  {t:{don:"Tell the shark I'm coming.",consigliere:"Lex and I need a word.",money:"I'll bring the yacht. You bring a bigger cut."}},
  {t:"Sharks?",a:"Lex has a theme."},
  {t:"Optional how?",a:"Optional."},
  {t:"The singer says he sleeps aft.",a:"Then start aft.",req:{flag:'singer_paid'}}]),
 square:dlgScene(["The car's yours. And no more 'kid'. Now I ask favours."],[
  {t:{don:"Then we understand each other.",consigliere:"Free advice, then: don't forget it.",money:"Best investment I ever made."}},
  {t:"And if I say no?"},
  {t:"Thank you, Mr McWey.",set:{rel:{mcwey:1}}}],"Nobody says no."),
 lex:dlgScene(["Moreau's tower needs a new man. I'm giving it to Lex Sterling."],[
  {t:{don:"Lex Sterling. No socks.",consigliere:"The man who insulted my name.",money:"The guy who tossed me a quarter."},a:"Don't look at me like that. Business is business."},
  {t:"Never heard of him.",a:"You will."},
  {t:"I took that tower. Not Lex.",a:"And I'm the one who decides who keeps it.",set:{rel:{mcwey:-1}}}]),
 finale:dlgScene(["Take this. Solid gold. You earned it."],[
  {t:{don:"Done is done.",consigliere:"I'll wear it to the funeral.",money:"I'll have it weighed."}},
  {t:"What now?",a:"Now nothing. That's the reward."},
  {t:"Thank you, Mr McWey.",set:{rel:{mcwey:1}}}],"Get out before I get sentimental.")};
// Every McWey string outside DLG, for the style lint in scripts/dlg-check.cjs.
const mcLines=()=>[MC_FIRST,...MC_LOAN_LINES,...Object.values(MC_HI).flat(),...MC_DEBRIEF.flat(),...['clean','gore','ruthless'].flatMap(k=>DEB_STYLE[k].flat()),
 ...Object.values(MC_GRADE),...Object.values(UNLOCK_LINE),...MC_QUOTE,...Object.values(END_STYLE).flatMap(e=>[e.line,e.quote]),
 ...Object.values(MC_SUIT),...Object.values(MC_GUN),...Object.values(MC_JEWEL),...Object.values(MC_CAR),...MC_HAUL.slice(1),MC_PAY.yacht2,
 ...Object.values(MC_GRADE).flatMap(g=>['owe','near','square','free','yacht'].map(k=>g+' '+MC_PAY[k].replace(/\{(take|cut|debt)\}/g,'120,000')))];

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
const dlgKid=()=>{const p=dlgProg();return p&&p.paid?'partner':'kid';};
const dlgSub=s=>s.replace(/\{kid\}/g,dlgKid);
const dlgText=v=>dlgSub(typeof v==='string'?v:(v[CHARS[selIdx].id]??v._));
const dlgStart=id=>({dlg:id,n:DLG[id].start});
// Expands one node into chat queue items: its lines, then its choice or a pointer to the next node.
function dlgItems(id,n){const node=DLG[id].nodes[n],out=(node.say||[]).map(([w,t])=>({who:w==='P'?'p':'m',name:w,t:dlgText(t)}));
 if(node.choose)out.push({choose:node.choose,dlg:id});else if(node.next)out.push({dlg:id,n:node.next});return out;}
function dlogScrollBy(px){const s=$('dlogScroll');if(s)s.scrollTop+=px;}
