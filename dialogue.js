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
// cadence: a sentence of `short` words or fewer is clipped; no `run` of them in a row, and at most `shareMax` of a scene's
// sentences once it has `min` of them. Every scene needs one sentence of `long`+ words (docs/STYLE-DIALOGUE.md §2a).
const DLG_LINT={maxLine:140,maxOpt:60,maxDash:1,cadence:{short:4,run:3,shareMax:0.4,min:5,long:10},banned:['delve','tapestry','landscape','testament','realm','journey','navigate','unleash','embark','symphony','dance of','a sea of',"it's not just","isn't about",'not just about',"let's be honest",'at the end of the day',"here's the thing",'make no mistake','mark my words',"no idea who you're dealing with","you'll regret"]};
// {kid} reads "kid" until the loan is square, "partner" after (voice sheet).
const DLG_TOKENS=['kid'];

/* ---- McWey: at most 6 lines a visit on the default path (docs/STYLE-DIALOGUE.md §2) ----
 He talks in full, easy sentences and saves the short ones for the order or the threat (§3). */
const MC_FIRST="Sit down, sit. Don't mind the shark; he's only ever eaten one accountant, and between us, the accountant had it coming.";
const MC_LOAN_LINES=["That {car} the valet parked for you? Ugly as sin, it's yours, and it cost me twelve thousand dollars.","So here's how we do it: sixty percent of every job comes to me until we're square, and then we talk about your future."];
const MC_HI={kid:["Wipe your feet, would you? That carpet cost more than your car, and your car cost me plenty.","Look who's still employed. Sit, I've got about four minutes and you're in all of them."],
 partner:["Partner! Not that chair, the good one by the window. I had it reupholstered for people I like.","Drink? Don't answer, I'm pouring anyway. It's a Tuesday and I've earned it."]};
// Debrief = one consequence line, then the grade and the money in one line.
const MC_DEBRIEF=[["The TV says the Sunset Motel had a gas leak. I love the TV; it never asks me any questions."],
 ["Club Flamingo is closed for renovations, according to the very nice sign I had made this morning."],
 ["Moreau's watch stopped at 11:52. I checked it twice, then I had it cleaned, because I'm sentimental like that."],
 ["Lex called me crying about his boats. I told him I was sorry, the sea is very big and he's very careless."],
 ["Lex is going through his couch cushions for quarters now. I hear it's a big couch, but not that big."],
 ["Lex hit your ride and you hit his mall, so I'm calling it even. He's calling his insurance company."],
 ["The singer sang every word, God bless him. The album's still terrible, but that was never your job."],
 ["Lex is down there with the sharks he paid for, and the Royal Flush is tied up in my harbour. Look at her."]];
const DEB_STYLE={clean:[["Not a scratch on you, and the motel manager slept right through it. I do like a quiet worker."],["Flamingo closed without a single siren, and the people at the bar finished their drinks. That's craft."],["Coral Tower looks like nothing happened up there, which is the nicest thing anybody's done for me all year."]],
 gore:[["The news doesn't have a word for what you did to that motel. I do, but I'm not saying it at dinner."],["They'll be scrubbing Flamingo's walls until spring, and good. Let them smell the bleach and think of me."],["Coral Tower needs a new lobby, new carpets and probably a priest. Moreau doesn't need anything now."]],
 ruthless:[["Every man in that motel got a personal goodbye from you. Thorough. I'd hate to be on your Christmas list."],["You finished the VIP room face to face, one at a time. The Family noticed, and so did I."],["Moreau begged, I'm told. I won't ask how you got the watch off him, and please don't tell me."]],
 mixed:MC_DEBRIEF};
const MC_GRADE={S:"Not a hair out of place, beautiful.",'A+':"Sharp work, really sharp.",A:"Sharp work.",B:"Solid, no complaints.",C:"Messy, but messy pays the same.",D:"I had to send a man with a mop, and he quit."};
const MC_PAY={owe:"${take} for you, ${cut} for me, and you still owe me ${debt}.",near:"${take} for you, ${cut} for me, and ${debt} more and we're square. Nearly there.",
 square:"${take} for you, ${cut} for me, and that, believe it or not, is the last of it.",free:"${take}, all of it yours. Count it here where I can watch; I enjoy it.",yacht:"${take}, all yours, and she comes with a yacht.",
 yacht2:"Whatever you still owed me, forget it. You don't work for me any more, you work with me."};
// [3] is keyed on the marina_u_kept wflag (W14): kept afloat vs. all sunk. The boat itself is always granted.
const UNLOCK_LINE={3:{kept:"One of Lex's speedboats somehow didn't sink. It's tied up under your window, with a bow on it.",sunk:"Every one of Lex's boats is on the bottom, so I bought you one of your own. It's under your window; try not to sink it out of habit."},4:"And for God's sake lose the street clothes. My tailor's waiting downstairs, and he's already measured you by eye.",5:"Lex torched your car, so you're flying from now on. There's a helicopter on the roof; try not to scratch the pad."};
// Header quote card for each job; the log never repeats it. The only place a motto belongs (§4).
const MC_QUOTE=["In Miami, gold doesn't lie. People do.","Loyalty's like gold. Heavy, and it looks good on you.","Sharks don't sleep. Neither does McWey.","Gold sinks. Remember that.","Everybody launders. The trick is not getting caught in the dryer.","Revenge is a dish best served at the food court.","Every song ends. Make sure his ends tonight.","On the water, the biggest fish eats first.","Everybody wants the crown. Nobody wants the weight."];
const END_STYLE={clean:{title:'THE QUIET HAND',line:"You did it quietly, start to finish, and nobody in this city could pick your face out of a lineup.",quote:"Quiet men hold the most keys."},
 gore:{title:'THE RED TIDE',line:"Half of Miami is still talking about the blood. Let them talk; frightened people pay on time.",quote:"Blood makes the best receipts."},
 ruthless:{title:'NO WITNESSES',line:"There's nobody left in this city who'll say your name twice, and the ones who say it once, whisper.",quote:"Mercy is for people who can afford it."},
 mixed:{title:'STEADY HANDS',line:"You were steady all the way up, no drama and no excuses, and the Family likes steady. So do I.",quote:MC_QUOTE[8]}};
// At most one reaction per visit, in this order; the rest wait for later visits.
const MC_SUIT={pinstripe:"Pinstripes! Now you look like you work for me, instead of like you rob people who work for me.",camo:"Camo? In my office? What is this, the Everglades? Take it off before the shark gets ideas.",pink:"Hot pink. That's bold. I wouldn't, but I'm not you, and Miami seems to approve.",power:"Double-breasted. Finally you're listening to somebody.",linen:"Linen, sleeves rolled up, very Ocean Drive. You'll sweat through it by noon, but it's a look."};
const MC_GUN={kid:"Is that a {gun} under your jacket? Keep it there, and for God's sake don't point it at the shark.",partner:"A {gun}, in my office? Relax, I'm not complaining. In this town I'd carry two."};
const MC_JEWEL={kid:"Nice gold. You know where it would look even nicer? In my ledger, next to your name.",partner:"Gold suits you. It's heavy, it's honest, and it's never once asked me for a raise."};
const MC_CAR={kid:"New wheels, and you haven't finished paying for the old ones? I admire the nerve, I really do.",partner:"You drove that up my driveway on purpose, didn't you? Now I'm jealous. Leave the keys, I want a go."};
const MC_HAUL=[null,"See the pallet by my desk? That's the motel money. I like to keep the first one where I can look at it.","Gold bars now. I had to buy a plinth for them, a plinth! My mother would be so proud.","I'm putting in a gun wall. My decorator cried, so I bought her a smaller gun wall.","The champagne's on ice permanently now. That's your fault, and I'd like it to stay your fault.","I had a sculptor do my bust, in gold, and I said tasteful. He did the shark as well.","The pile keeps growing, and every morning I come in and say hello to it.","The safe won't close any more, which as problems go is the best one I've ever had.","Look around you. All of this came out of your work, and I want you to know I'm keeping it."];

// One scene: McWey's lines, then options. An option's answer `a` is one McWey line, or a short exchange
// where ['P',text] is the player's follow-up; every answer then rejoins at `end`.
const mcSay=ts=>ts.map(t=>Array.isArray(t)?t:['MCWEY',t]);
function dlgScene(lines,opts,end){const nodes={a:{say:mcSay(lines),choose:[]}};if(end)nodes.end={say:mcSay([end])};
 opts.forEach((o,i)=>{const c={t:o.t};for(const k of ['say','set','req'])if(o[k])c[k]=o[k];
  if(o.a){nodes['r'+i]={say:mcSay(Array.isArray(o.a)?o.a:[o.a])};if(end)nodes['r'+i].next='end';c.to='r'+i;}else if(end)c.to='end';nodes.a.choose.push(c);});
 return {start:'a',nodes};}
// Options are different actions: do it (in the crew member's own voice), press McWey, or push back.
const DLG={
 brief0:dlgScene(["Sunset Motel, out on Route 1. There's a new crew there selling on my corners, and not one of them came and asked me first.","So go and ask them why. Politely, if they let you."],[
  {t:{don:"They'll tell me why.",consigliere:"I'll ask nicely. Once.",money:"I'll ask what they're clearing a week."}},
  {t:"Who are they?",a:["Out-of-towners. Jersey plates, cheap shoes, more guns than sense.",['P',"So, nobody."],"Nobody, by tomorrow morning."]},
  {t:"What's in it for me?",a:"Your car stays out of the canal, for a start. Ask me again when you've paid something off.",set:{rel:{mcwey:-1}}}]),
 brief1:dlgScene(["The motel was only a front. The money runs through Club Flamingo, the back room off the VIP lounge.","Close it, and I don't mean for the night."],[
  {t:{don:"It's closed.",consigliere:"I'll explain the new hours to them.",money:"Closed, and the cash drawer comes with me."}},
  {t:"I'll take the back door.",a:["Tony leaves it open for deliveries. Carry a crate and nobody looks twice.",['P',"And if somebody looks twice?"],"Then put the crate down."],set:{flag:'flamingo_back'}},
  {t:"Who runs the place?",a:"A man who thinks two bouncers and a velvet rope count as a business plan. You'll see."}]),
 brief2:dlgScene(["Now the big one: Moreau, top floor of Coral Tower, with the view I was supposed to have.","Bring me his watch, because I'd like to know exactly what time it was."],[
  {t:{don:"You'll have it by midnight.",consigliere:"I'll ask him the time myself.",money:"You get the watch. I get the wallet."}},
  {t:"Just Moreau?",a:"Everybody up there works for Moreau, and as of tonight, their jobs are over. Include them."},
  {t:"Anything else, Mr McWey?",a:["Yes, actually. Wipe your feet on the way out.",['P',"That's it?"],"You'd be amazed how few people do."],set:{rel:{mcwey:1}}}]),
 brief3:dlgScene(["Lex swears his marina deliveries are clean. My corners say different, and I trust my corners more than I trust Lex.","I can't be seen touching my golden boy, so you were never here. Sink his boats."],[
  {t:{don:"Every boat.",consigliere:"The sea and Lex can have a word.",money:"Sinking money. That hurts to watch."}},
  {t:"I thought Lex was yours.",a:["So did Lex.",['P',"And now?"],"Now I'm asking you to sink his boats, aren't I? Keep up."]},
  {t:"And if one of them floats?",a:"Then it's yours, and I'm told speedboats are a lot of fun. I wouldn't know, I get seasick."}]),
 brief4:dlgScene(["Lex washes his money through the Starlight Arcade. Quarters go into the machines and clean dollars come out the back.","Unplug every cabinet in the place."],[
  {t:{don:"Game over.",consigliere:"I'll pull the plugs myself.",money:"I'm keeping the quarters, though."}},
  {t:"Kids play there.",a:"Not after midnight they don't, and if they do, call their mothers. Then unplug the cabinets."},
  {t:"Can I beat a high score first?",a:["One game.",['P',"Two?"],"One game, then you break the machine. I'm not paying you by the hour."],set:{rel:{mcwey:-1}}}]),
 brief5:dlgScene(["You've been working too hard, {kid}. Go to the Ocean View Mall and buy yourself something nice; it's on me.","Relax for once. What's the worst that could happen?"],[
  {t:{don:"Shopping. Sure.",consigliere:"I could use a new tie.",money:"Your treat means your card, right?"}},
  {t:"You never treat anybody.",a:["I'm treating you, aren't I?",['P',"That's what worries me."],"Don't make it weird, just go and buy yourself a shirt."]},
  {t:"Who else knows I'm going?",a:"Me, and whoever I happened to mention it to. Why, are you nervous?"}]),
 brief6:dlgScene(["Lex is hiding, and his last friend in the world is a pop singer he's paying to make an album.","They're at Biscayne Sound tonight. Crash the session and get the singer to tell you where Lex sleeps."],[
  {t:{don:"He'll sing.",consigliere:"We'll discuss the lyrics.",money:"I'll just outbid Lex."}},
  {t:"Why crash it? I'll buy the session.",a:"Your money, your idea. Just keep it off my expenses; my accountant's nervous enough.",set:{flag:'singer_paid'}},
  {t:"Is the album any good?",a:"I heard the demo. Bring me the tapes as well, so nobody else ever has to."}]),
 brief7:dlgScene(["Lex is out on the Royal Flush, two miles offshore, with a glass floor in the ballroom and sharks underneath.","Bring me that yacht. Lex is optional."],[
  {t:{don:"Tell the sharks I'm coming.",consigliere:"Lex and I are overdue a word.",money:"I'll bring the yacht. You bring a bigger cut."}},
  {t:"Sharks? Really?",a:"Lex has a theme and he commits to it. It's the only thing I ever liked about him."},
  {t:"Optional how?",a:["Optional.",['P',"That's not an answer."],"It's the only one you're getting, {kid}."]},
  {t:"The singer says he sleeps aft.",a:"Then start aft, and give the singer my regards. My condolences on the album, too.",req:{flag:'singer_paid'}}]),
 square:dlgScene(["That's it, you're square. The car's yours, and God help the other drivers.","And I'll stop calling you 'kid'. From now on I ask you for favours, and you say yes, because you like me."],[
  {t:{don:"Then we understand each other.",consigliere:"Free advice, then: ask nicely.",money:"Best investment I ever made."}},
  {t:"And if I say no?",a:"Then I'd ask again, nicer. Nobody has ever needed a third time."},
  {t:"Thank you, Mr McWey.",set:{rel:{mcwey:1}}}],"Have a cigar, partner. Go on, take two, they're Cuban and I'm in a good mood."),
 lex:dlgScene(["Moreau's tower needs somebody running it, and I've decided to give it to Lex Sterling."],[
  {t:{don:"Lex Sterling. No socks.",consigliere:"The man who insulted my name.",money:"The guy who tossed me a quarter."},a:"Don't look at me like that. It's business; Lex earns, and I like people who earn."},
  {t:"Never heard of him.",a:"You will, believe me. He makes sure everybody does."},
  {t:"I took that tower. Not Lex.",a:["You did, and I'm grateful.",['P',"Grateful isn't a tower."],"No, it's a lot cheaper. And I decide who keeps what, so don't forget that."],set:{rel:{mcwey:-1}}}]),
 finale:dlgScene(["Here, take this. It's solid gold, it weighs a ton, and you earned every ounce of it."],[
  {t:{don:"Done is done.",consigliere:"I'll wear it to the funeral.",money:"I'll have it weighed."}},
  {t:"What happens now?",a:"Nothing happens, for once, and that's the reward. Enjoy it."},
  {t:"Thank you, Mr McWey.",set:{rel:{mcwey:1}}}],"Now get out before I say something sentimental and we both have to pretend I didn't.")};
// Every McWey string outside DLG, for the style lint in scripts/dlg-check.cjs.
const mcLines=()=>[MC_FIRST,...MC_LOAN_LINES,...Object.values(MC_HI).flat(),...MC_DEBRIEF.flat(),...['clean','gore','ruthless'].flatMap(k=>DEB_STYLE[k].flat()),
 ...Object.values(MC_GRADE),...Object.values(UNLOCK_LINE).flatMap(u=>typeof u==='string'?u:Object.values(u)),...MC_QUOTE,...Object.values(END_STYLE).flatMap(e=>[e.line,e.quote]),
 ...Object.values(MC_SUIT),...Object.values(MC_GUN),...Object.values(MC_JEWEL),...Object.values(MC_CAR),...MC_HAUL.slice(1),MC_PAY.yacht2,
 ...Object.values(MC_GRADE).flatMap(g=>['owe','near','square','free','yacht'].map(k=>g+' '+MC_PAY[k].replace(/\{(take|cut|debt)\}/g,'120,000')))];

/* ---- DLG runtime hooks: rel (PROG[c].rel), world flags (PROG[c].wflags), collectibles (hasCollect, W14) ---- */
const dlgProg=()=>typeof myProg==='function'?myProg():null;
const dlgObj=(p,k)=>p[k]&&typeof p[k]==='object'&&!Array.isArray(p[k])?p[k]:(p[k]={});
function relGet(who){const p=dlgProg(),v=p&&p.rel&&p.rel[who];return Number.isInteger(v)?Math.max(-REL_MAX,Math.min(REL_MAX,v)):0;}
const relMul=who=>1-REL_PCT*relGet(who)/REL_MAX; // price multiplier: a friend of McWey's pays up to 10% less
function dlgFlag(f){const p=dlgProg();return !!(p&&p.wflags&&p.wflags[f]);}
const unlockLine=lvl=>{const u=UNLOCK_LINE[lvl];return u&&typeof u==='object'?u[dlgFlag('marina_u_kept')?'kept':'sunk']:u;};
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
