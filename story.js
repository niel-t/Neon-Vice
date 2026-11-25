'use strict';
/* ================= STORY LAYER =================
   Gives each act a face and makes the floors follow on from each other, through people talking rather than text on a card.
   - ACT OPENERS (ACTS): the first time you start an act's first floor, the villain speaks before the objective card.
   - VOICES (STORY[i].v): short lines in a box at the bottom of the screen that never pause play. Keys are events:
     'arrive' (or 'st_<stage id>' on multi-stage floors), 'half' (half the guards down), 'obj' (the floor's objective done),
     'boss' (the boss seen), 'clear' (floor clear) and 'lead' (the lead picked up). Act code can call storySay(key) for its own beats.
   - THE LEAD (STORY[i].lead): when the floor clears, something drops by the last guard that points to the next floor.
     Walk over it to take it (+$300). Some floors hand it over on their own (auto).
   - THE CALL (STORY[i].call): the first time you head home from a floor, a short phone call says where the lead goes.
   Lines follow docs/STYLE-DIALOGUE.md: one line each, 140 characters at most. Indexes are campaign floor indexes (LEVELS).
   window.NOSTORY turns the whole layer off (the browser tests set it, story.spec.cjs turns it back on). */
const SPEAKER={
 mcwey:{n:'McWEY',c:'#ffd36b'},
 moreau:{n:"VICTOR 'THE SHARK' MOREAU",c:'#2de2e6'},
 lex:{n:'LEX "SILKS" STERLING',c:'#ffa6c9'},
 kade:{n:'DORIAN KADE',c:'#f4f1ea'},
 vale:{n:'CONRAD VALE',c:'#b8c4d8'},
 cardinal:{n:'THE CARDINAL',c:'#ff5a6a'},
 radio:{n:'THEIR RADIO',c:'#9fd8ff'},
 rico:{n:'RICO, CLUB MANAGER',c:'#ff9a4a'},
 dj:{n:'THE DJ',c:'#ff5fb8'},
 singer:{n:'THE SINGER',c:'#ffd0f0'},
 pilot:{n:'THE PILOT',c:'#c9e8ff'},
 you:{n:'YOU',c:'#7dff9a'}
};
/* act openers, keyed by the act's first floor index */
const ACTS={
 0:{n:'ACT I',t:'THE STREET',who:'moreau',tag:'Owns Club Flamingo and the top of Coral Tower',
  lines:[['moreau',"Somebody's crew is asking questions about my motel. Double the men on Route 1, and double them again at the club."],
   ['moreau',"McWey's old money thinks it still runs this town. Let him send whoever he likes. There's only one shark in Miami."]]},
 3:{n:'ACT II',t:'SILKS',who:'lex',tag:'Moves knock-off gold by sea and washes it through Miami Beach',
  lines:[['lex',"Moreau's gone, so the gold trade is mine. The marina, the arcade, the studio: every quarter in Miami comes home to Silks."],
   ['lex',"And that suit from the Flamingo? If he walks into one of my places, put him on the boat. I'll feed him to the fish myself."]]},
 8:{n:'ACT III',t:'CONDEMNED',who:'kade',tag:'Buys the city one block at a time, then knocks it down',
  lines:[['kade',"Nobody shoots a man in this town any more. You buy his block. McWey's tower is standing on my parking lot."],
   ['kade',"Tonight the wrecking ball does the talking. By Sunday his office is a hole in the ground with my name on the fence."]]},
 11:{n:'ACT IV',t:'WHEELS UP',who:'vale',tag:'Banker to the Family, holder of the black book',
  lines:[['vale',"Kade borrowed three hundred million from my bank and now he's a stain on a crane. Load the gold. All of it. We leave Saturday."],
   ['vale',"Keep the black book on me. Every man in Miami has a price in it, and McWey's is the most interesting."]]},
 14:{n:'ACT V',t:'OLD GOLD',who:'cardinal',tag:'Ran the Family\'s Havana casinos, and remembers a bellboy',
  lines:[['cardinal',"Forty bars left Havana in a bellboy's suitcase in 1959. I have waited twenty-seven years to ask for them politely."],
   ['cardinal',"Take his hotel. Take his ship. Then his tower. Leave the kid for me."]]}
};
const STORY=[
 /* 0 Motel Sunset */
 {v:{arrive:[['mcwey',"Room nine cooks, the rest of them sell. Make it loud enough that the whole of Route 1 hears about it."]],
   half:[['radio',"Who is that? Call the Flamingo, tell Rico we've got a problem at the Sunset!"]],
   clear:[['mcwey',"Good. Check his pockets. A crew this organised writes things down."]]},
  lead:{n:'A CLUB FLAMINGO MATCHBOOK',d:'"Rico, VIP lounge, Thursday" written inside the flap'},
  call:[['mcwey',"Club Flamingo? That's Victor Moreau's place."],['you',"Who's Moreau?"],
   ['mcwey',"A man who calls himself the only shark in Miami. I own the other one. Go and see his manager tomorrow night."]]},
 /* 1 Club Flamingo */
 {v:{arrive:[['dj',"Club Flamingo is open late tonight, by order of Mr Moreau! Drinks are on the house, trouble is not!"]],
   half:[['rico',"Lock the VIP lounge! Nobody touches the books, you hear me? Nobody!"]],
   clear:[['mcwey',"Rico had a key on him with a tower on the fob. Bring it to me."]]},
  lead:{n:'A CORAL TOWER KEY',d:'Brass, on a fob stamped PENTHOUSE · 69'},
  call:[['mcwey',"Coral Tower, sixty-nine floors, and Moreau sleeps on the top one."],
   ['mcwey',"He knows you're coming now. Good. Scared men make mistakes in their own homes."]]},
 /* 2 The Penthouse (lobby, stairwell, penthouse) */
 {v:{st_lobby:[['moreau',"I can see you on the lobby camera. Nice jacket. They'll bury you in it."]],
   st_stair:[['moreau',"Taking the stairs? Good for the heart. I'll finish my dinner while you climb."]],
   st_pent:[['moreau',"Fine, you made it. Come in and meet the only shark in Miami."]],
   clear:[['mcwey',"That's the Shark finished, and Miami belongs to the Family again. Mostly. Check his desk on your way out."]]},
  lead:{n:"MOREAU'S ADDRESS BOOK",d:'One name underlined twice in gold ink: LEX STERLING'},
  call:[['mcwey',"Remember the blond at the Flamingo who laughed at your watch? Lex Sterling. He's picking up Moreau's gold trade."],
   ['mcwey',"Come up to the office when you've slept. We need to talk about Mr Sterling."]]},
 /* 3 Vice Marina */
 {v:{arrive:[['lex',"Dock crew, the gold goes out at midnight. Anybody on my pier who isn't mine goes in the water."]],
   obj:[['lex',"My boats! Do you have any idea what a Riva costs? Any idea at all?"]],
   clear:[['mcwey',"His bookkeeper dropped something running for the office. Pick it up."]]},
  lead:{n:'A ROLL OF STARLIGHT TOKENS',d:'Wrapped in a deposit slip for $90,000'},
  call:[['mcwey',"Ninety thousand dollars in arcade tokens. Nobody plays that much Galaga."],
   ['mcwey',"The Starlight, a block off the beach. That's where Lex washes it. Pull the plug."]]},
 /* 4 Starlight Arcade */
 {v:{arrive:[['lex',"Welcome to the Starlight! Tonight's high score is a man in a nice suit. Let's see how long he lasts."]],
   half:[['radio',"Get the cash out the back! Silks says the counting room goes first!"]],
   clear:[['mcwey',"Lex left you something at the prize counter. He thinks he's funny."]]},
  lead:{n:'A NOTE FROM LEX',d:'"McWey is sending you to the Ocean View Mall on Saturday. Enjoy your night off."'},
  call:[['mcwey',"Take the night off, kid. The Ocean View Mall, my treat."],['you',"Lex already knows I'm going."],
   ['mcwey',"Then don't go unarmed. It's a mall. What's the worst that could happen?"]]},
 /* 5 Ocean View Mall */
 {v:{arrive:[['lex',"Attention shoppers. A gentleman in a nice suit is about to have a very bad Saturday."]],
   half:[['lex',"You're making a mess of my food court. Somebody's going to have to clean that up."]],
   clear:[['mcwey',"So much for the night off. His shooters came in a van. Look for the plates."]]},
  lead:{n:'A PARKING STUB',d:'SUNSHINE SOUND STUDIOS · UNIT 4 · VALIDATED BY L.S.'},
  call:[['mcwey',"Lex is paying for a pop record, of all things. His singer would know where he sleeps."],
   ['mcwey',"Ask her nicely first. Then ask her less nicely."]]},
 /* 6 The Recording Studio */
 {v:{arrive:[['singer',"Can we take it again from the chorus? Lex says this is the single."]],
   obj:[['singer',"He's on the boat! The Royal Flush, two miles out. Please don't tell him it was me."]],
   clear:[['mcwey',"The Royal Flush. A glass floor over a shark tank. Lex always did have taste, just none of it good."]]},
  lead:{n:'A BOARDING PASS',d:'ROYAL FLUSH TENDER · VICE MARINA · 11 PM'},
  call:[['mcwey',"The tender leaves the marina at eleven. Be on it."],
   ['mcwey',"Bring me the yacht. Whether Lex comes back with it is up to you."]]},
 /* 7 The Royal Flush */
 {v:{arrive:[['lex',"You came all this way by boat? You should have called. I'd have sent the sharks to pick you up."]],
   half:[['lex',"Stop shooting the bar! That cognac is older than you are!"]],
   boss:[['lex',"Fine. Just you, me, and a very hungry fish."]],
   clear:[['mcwey',"The yacht's mine. Have a look round his stateroom before you bring her in."]]},
  lead:{n:'A SURVEY MAP OF OCEAN DRIVE',d:'McWey\'s block circled in red, and a card: DORIAN KADE, KADE DEVELOPMENT'},
  call:[['mcwey',"Dorian Kade? Never heard of him."],
   ['mcwey',"Come up to the office. I'd like to know why somebody has drawn a circle round my building."]]},
 /* 8 Ocean Drive Demolition */
 {v:{arrive:[['kade',"Crew, the charges blow at the top of the hour. If anybody's still inside, that's a scheduling problem."]],
   obj:[['kade',"You cut my wires? Do you know what overtime costs on a Sunday?"]],
   clear:[['mcwey',"His foreman had a guest list in his hard hat. Bring it."]]},
  lead:{n:'A GALA INVITATION',d:'THE GRAND BISCAYNE · BLACK TIE · COUNCILMAN REYES\'S TABLE'},
  call:[['mcwey',"Kade is buying the city council tonight, one glass of champagne at a time."],
   ['mcwey',"Somewhere in that hotel is a ledger with every name on it. Wear something nice."]]},
 /* 9 The Grand Biscayne Gala */
 {v:{arrive:[['kade',"Ladies and gentlemen of the council, thank you. Tonight we build the Miami of tomorrow."]],
   half:[['kade',"Keep the band playing! Nobody leaves before dessert."]],
   obj:[['kade',"He has the ledger. Get it back before it ends up on the front page of the Herald!"]],
   clear:[['mcwey',"Every councilman in Dade County on one page. Read me the last one."]]},
  lead:{n:'THE LAST PAGE OF THE LEDGER',d:'"Kade Tower, top floor, Friday: the final deeds"',auto:true},
  call:[['mcwey',"Kade signs the last deeds tonight, on top of his own tower, with the whole skyline watching."],
   ['mcwey',"The hoist needs the foreman's key, and the stairs are forty floors. Finish it and I get my block back."]]},
 /* 10 Kade Tower (site, steel stairs, top floor) */
 {v:{st_site:[['kade',"Is that McWey's errand boy at my gate? Somebody drop a pallet on him."]],
   st_stair:[['kade',"Forty floors and no handrail yet. Mind your step."]],
   st_pent:[['kade',"Welcome to the top of Miami. Everything you can see from up here, I own on paper."]],
   clear:[['mcwey',"The developer's finished. My block is my block. See who was lending him the money."]]},
  lead:{n:"KADE'S LOAN PAPERS",d:'$300,000,000 · VALE TRUST BANK, BRICKELL · SIGNED, CONRAD VALE'},
  call:[['mcwey',"Kade borrowed from Conrad Vale's bank. Vale's bank holds the Family's gold."],
   ['mcwey',"Come up to the office, kid. When a banker gets nervous, he runs, and he takes the vault with him."]]},
 /* 11 Vale Trust Garage (P1, P2, vault dock) */
 {v:{st_p1:[['vale',"Vans one to three, you leave on my signal. Nobody stops for anything. Not red lights, not people."]],
   st_dock:[['radio',"Dock to Mr Vale, the first van is loaded. Somebody is shooting their way down the ramps."]],
   clear:[['mcwey',"Vale wasn't in the garage. Find out where he eats."]]},
  lead:{n:'A RESERVATION CARD',d:'THE CORAL ROOM · SATURDAY · TABLE FOR TWO: MR VALE AND HIS PILOT'},
  call:[['mcwey',"Vale eats lobster at the Coral Room every Saturday, and his pilot eats with him."],
   ['mcwey',"Vale won't stay for dessert. The pilot always does. Get his hangar pass."]]},
 /* 12 The Coral Room */
 {v:{arrive:[['vale',"Finish your lobster, Teddy, then meet me at Opa-locka. Wheels up at midnight. Don't be late."]],
   half:[['pilot',"I just fly the plane! I just fly the plane!"]],
   clear:[['mcwey',"The pilot always carries his pass in his jacket. Take it."]]},
  lead:{n:"THE PILOT'S HANGAR PASS",d:'OPA-LOCKA · HANGAR 7 · ALL AREAS'},
  call:[['mcwey',"Vale's jet leaves tonight with the Family's gold in the hold and his black book in his pocket."],
   ['mcwey',"Make it look like an accident. Bankers have so many of them."]]},
 /* 13 Opa-locka Hangar 7 (apron, hangar, jet) */
 {v:{st_apron:[['vale',"Tower, this is November Victor One, requesting an early departure. We have uninvited guests."]],
   st_hangar:[['vale',"Load the gold. If the man in the suit gets near the stairs, shoot him."]],
   st_jet:[['vale',"You're on my plane? I'd offer you a parachute, but we don't carry any."]],
   clear:[['mcwey',"A tragic accident on the runway. The book, kid. Did you get the book?"]]},
  lead:{n:"CONRAD VALE'S BLACK BOOK",d:'Every price in Miami, McWey\'s included',auto:true},
  call:[['mcwey',"Put the book on my desk, and don't read it."],['you',"Too late. There's a page about Havana."],
   ['mcwey',"Then you know more than is healthy. Get some sleep, and come up when you wake."]]},
 /* 14 The Grand Biscayne Hotel (lobby, laundry, roof) */
 {v:{st_lobby:[['cardinal',"Good evening. The Grand Biscayne is closed tonight, for a private family matter."]],
   st_laundry:[['mcwey',"My mother worked down here for eleven years. Mind the steam, it took the skin off her hands."]],
   st_roof:[['mcwey',"She hung the sheets up there to dry. When I was small I hid between them. Nobody could see me."]],
   obj:[['mcwey',"That's the bell captain's handwriting. Forty bars, and a bellboy's name next to them. Mine."]],
   clear:[['cardinal',"So now you've seen the book. Ask him what else he carried home."]]},
  lead:{n:'A CAGE RECEIPT',d:'LA HABANA · 40 BARS · RECEIVED FOR THE FAMILY, E.B.'},
  call:[['mcwey',"They've got my forty bars in the cage on La Habana, anchored off Government Cut."],
   ['mcwey',"I get seasick, kid. You're on your own on this one."]]},
 /* 15 La Habana (pier, deck, casino) */
 {v:{st_pier:[['cardinal',"Bienvenido. The house always wins, but tonight it would settle for its gold."]],
   st_deck:[['mcwey',"I can see the ship from my window. Don't make me watch you drown."]],
   st_casino:[['cardinal',"Play a hand if you like. I already know how this one ends."]],
   obj:[['cardinal',"In his tower or on the bottom of the bay, it makes no difference to me. I'm coming for it either way."]],
   clear:[['mcwey',"He's coming here, isn't he? Find out when."]]},
  lead:{n:"THE CARDINAL'S ITINERARY",d:'HELICOPTER · McWEY TOWER ROOF · TOMORROW, 10 PM'},
  call:[['mcwey',"Bastiani is coming to my tower tomorrow night, with everybody he has left."],
   ['mcwey',"Come and stand with me, kid. Or don't come at all."]]},
 /* 16 McWey Tower (lobby, office, roof): the ending follows, so no lead and no call */
 {v:{st_lobby:[['cardinal',"Your doorman sends his apologies. He's having a lie down."]],
   st_office:[['mcwey',"Took you long enough. Grab a gun off the wall, they're all loaded."]],
   st_roof:[['cardinal',"Come up, then. Let's talk like two men from Havana."]],
   boss:[['cardinal',"You could have his chair, you know. All you have to do is step aside."]]}}
];
const LEAD_PAY=300;
const storyOff=()=>typeof window!=='undefined'&&!!window.NOSTORY;
const storyFloor=()=>{if(typeof MISSION==='undefined'||!missionIsCampaign(MISSION))return -1;const i=missionIdx(MISSION);return i>=0&&STORY[i]?i:-1;};
function storySeen(){const p=myProg();if(!p.story||typeof p.story!=='object')p.story={};return p.story;}
/* ---- voices ---- */
let STORY_RUN={g:null,fired:new Set(),q:[],cur:null,obj:false};
function storySay(key,i){if(storyOff())return false;if(i==null)i=storyFloor();const S=STORY[i];if(!S||!S.v||STORY_RUN.fired.has(key))return false;
 const L=S.v[key];if(!L)return false;STORY_RUN.fired.add(key);for(const [who,t] of L)storyRadio(who,t);return true;}
function storyRadio(who,t){const Q=STORY_RUN.q;if(Q.length>=3)Q.shift();Q.push({who,t});}
function storyTick(dt,g){if(storyOff()||!g||g.def.hub)return;const i=storyFloor();if(i<0)return;const R=STORY_RUN;
 if(R.g!==g){const M=MISSIONS[MISSION];if(!g.sid||!M||g.sid===M.start)R.fired=new Set();R.g=g;R.q=[];R.cur=null;R.obj=false;g.lead=null;}
 if(g.T>0.8&&!g.cameo)storySay(g.sid&&g.sid!=='legacy'?'st_'+g.sid:'arrive',i);
 const tot=g.enemies.length,alive=g.enemies.filter(e=>e.alive).length;if(tot>=4&&alive<=tot/2&&!g.cleared)storySay('half',i);
 if(g.obj&&typeof g.obj==='object'){R.obj=true;if(g.obj.done)storySay('obj',i);}else if(R.obj){R.obj=false;storySay('obj',i);}
 if(g.bossSeen&&g.boss)storySay('boss',i);
 if(g.cleared&&!R.fired.has('clear')){storySay('clear',i);storyDropLead(g,i);}
 if(g.lead&&!g.lead.taken&&g.player&&g.player.alive&&Math.hypot(g.player.x-g.lead.x,g.player.z-g.lead.z)<0.9)storyTakeLead(g,i);
 /* the box: one line at a time, typed out, held long enough to read */
 if(!R.cur&&R.q.length){R.cur=Object.assign(R.q.shift(),{k:0});if(typeof sfx==='function')sfx('blip');}
 if(R.cur){R.cur.k+=dt;if(R.cur.k>1.8+R.cur.t.length*0.055)R.cur=null;}}
function storyDropLead(g,i){const S=STORY[i];if(!S||!S.lead||g.lead)return;const p=g.player;
 if(S.lead.auto||!p){g.lead={x:p?p.x:0,z:p?p.z:0,taken:false};storyTakeLead(g,i);return;}
 let best=g.boss&&!g.boss.alive?g.boss:null,bd=1e9;if(!best)for(const e of g.enemies){if(e.alive)continue;const d=Math.hypot(e.x-p.x,e.z-p.z);if(d<bd){bd=d;best=e;}}
 const at=best||p;g.lead={x:at.x+0.35,z:at.z,taken:false,t:0};
 g.hint={txt:'He dropped something: walk over it to take the lead',t:0};}
function storyTakeLead(g,i){const L=g.lead,S=STORY[i];if(!L||L.taken)return;L.taken=true;const st=storySeen();st.leads=st.leads||{};st.leads[i]=1;
 if(!S.lead.auto){g.score+=LEAD_PAY;g.gpts=(g.gpts||0)+LEAD_PAY;if(typeof sfx==='function')sfx('pick');}
 if(typeof popup==='function'&&g.player)popup(g.player.x,g.player.z-0.5,'LEAD: '+S.lead.n+(S.lead.auto?'':'  +$'+LEAD_PAY),'#ffd36b');
 if(typeof banner==='function')banner('LEAD: '+S.lead.n,S.lead.d);storySay('lead',i);}
function drawStory(B,g){const L=g&&g.lead;if(!L||L.taken||storyOff())return;const T=g.T||0,y=0.25+Math.sin(T*3)*0.06;
 B.box(TRS(L.x,y,L.z,T*1.6,0.34,0.06,0.24),[1,0.83,0.35],true);B.box(TRS(L.x,1.3,L.z,0,0.07,2.6,0.07),[1,0.8,0.3],true);B.box(TRS(L.x,0.02,L.z,T*0.8,0.7,0.01,0.7),[0.9,0.6,0.15],true);}
function drawStoryHUD(c,g,u){if(storyOff())return;const L=g.lead;if(L&&!L.taken&&typeof project==='function'){const s=project(L.x,1.0,L.z);if(s){c.textBaseline='top';c.font=PXF(7*u);txt(c,'LEAD',s[0],s[1]-14*u-Math.sin((g.T||0)*3)*3*u,'#ffd36b','center',7*u);}}
 const R=STORY_RUN;if(R.g!==g||!R.cur)return;const V=SPEAKER[R.cur.who]||SPEAKER.radio,txt0=R.cur.t,n=Math.min(txt0.length,Math.floor(R.cur.k*50)),shown=txt0.slice(0,n);
 const fs=(touchMode?15:17)*u,maxW=touchMode?vw*0.44:Math.min(vw*0.36,480*u),m=Math.max(12,14*u);c.font=VTF(fs);
 const lines=[];let cur='';for(const w of txt0.split(' ')){const t2=cur?cur+' '+w:w;if(c.measureText(t2).width>maxW&&cur){lines.push(cur);cur=w;}else cur=t2;}if(cur)lines.push(cur);
 const lh=fs*1.05,bw=maxW+24*u,bh=lines.length*lh+24*u,bx=vw/2-bw/2,by=touchMode?vh-m-38*u-bh:vh-m-bh,fade=Math.min(1,R.cur.k*6,(1.8+txt0.length*0.055-R.cur.k)*3);
 c.globalAlpha=clamp(fade,0,1);c.fillStyle='rgba(12,4,22,.88)';c.fillRect(bx,by,bw,bh);c.fillStyle=V.c;c.fillRect(bx,by,4*u,bh);
 c.textBaseline='top';c.font=PXF(6*u);txt(c,V.n,bx+12*u,by+6*u,V.c,'left',6*u);
 c.font=VTF(fs);let left=n;lines.forEach((ln,k)=>{if(left<=0)return;const part=ln.slice(0,left);left-=ln.length+1;txt(c,part,bx+12*u,by+16*u+k*lh,'#f6ecff','left',fs);});
 c.globalAlpha=1;}
/* ---- act openers: before the objective card, once per act and operator ---- */
let ACTCARD=null;
function storyOpener(){if(storyOff())return false;const i=storyFloor(),A=ACTS[i];if(!A||!G||G.def.hub)return false;const st=storySeen();st.acts=st.acts||{};if(st.acts[i])return false;
 st.acts[i]=1;saveProg();const V=SPEAKER[A.who],esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
 $('acN').textContent=A.n;$('acT').textContent=A.t;$('acWho').textContent=V.n;$('acWho').style.color=V.c;$('acTag').textContent=A.tag;
 $('acLines').innerHTML=A.lines.map(([w,t],k)=>'<div class="acL" style="animation-delay:'+(0.6+k*1.6)+'s"><b style="color:'+(SPEAKER[w]||V).c+'">'+esc((SPEAKER[w]||V).n)+'</b>'+esc(t)+'</div>').join('');
 $('acGo').textContent=touchMode?'TAP TO CONTINUE':padMode?'PRESS A TO CONTINUE':'CLICK OR PRESS ENTER TO CONTINUE';
 ACTCARD={t:performance.now()};state='actcard';show('sAct');if(typeof sfx==='function')sfx('boss');return true;}
function actCardGo(){if(state!=='actcard'||!ACTCARD||performance.now()-ACTCARD.t<450)return;ACTCARD=null;state='play';show(null);if(typeof sfx==='function')sfx('pick');showObjCard();}
/* ---- the call on the way home ---- */
let CALLCARD=null;
function storyCall(i,then){if(storyOff())return false;const S=STORY[i];if(!S||!S.call)return false;const st=storySeen();st.calls=st.calls||{};if(st.calls[i])return false;
 st.calls[i]=1;saveProg();const me=typeof CHARS!=='undefined'&&CHARS[selIdx]?CHARS[selIdx].name:'YOU',esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
 const lead=S.lead,had=(st.leads||{})[i];
 $('clLead').innerHTML=lead?(had?'<b>YOU TOOK</b> ':'<b>YOU LEFT BEHIND</b> ')+esc(lead.n)+'<br><i>'+esc(lead.d)+'</i>':'';
 $('clLines').innerHTML=S.call.map(([w,t],k)=>{const V=SPEAKER[w]||SPEAKER.radio;return '<div class="clL'+(w==='you'?' me':'')+'" style="animation-delay:'+(0.3+k*1.2)+'s"><b style="color:'+V.c+'">'+esc(w==='you'?me:V.n)+'</b>'+esc(t)+'</div>';}).join('');
 $('clGo').innerHTML='HANG UP<span class="kbhint"> (ENTER)</span><span class="padhint"> (A)</span>';
 CALLCARD={t:performance.now(),then};state='call';show('sCall');if(typeof sfx==='function')sfx('ring');return true;}
function callGo(){if(state!=='call'||!CALLCARD||performance.now()-CALLCARD.t<450||fading)return;const f=CALLCARD.then;CALLCARD=null;if(typeof sfx==='function')sfx('pick');f();}
