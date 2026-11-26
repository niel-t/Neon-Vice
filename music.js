'use strict';
/* ================= MUSIC PACK 2 =================
   New original tracks, synthesized live on the same music bus as the rest of the game (index.html: TRACKS, theme(), mKick...).
   - Missions: six upbeat synthwave / darksynth tracks (n_ prefix, so the combo layers and bar-synced switching still apply)
   - After a floor is clear: three slow tracks in the same style (c_ prefix), matched to the key of the mission track
   - Hubs: McWey Tower lobby + office, Nine of Nine's, Velvet Palms (hip-hop and club), Biscayne Galleria (bossa / lounge muzak)
   Loaded after the main inline script; nothing here runs until audio is started by a tap/click. */

/* --- small parsers: melodies are written "step:NOTE:length" per bar, bars split by | --- */
function mxNote(s){const m=/^([A-G])([#b]?)(-?\d)$/.exec(s);if(!m)throw new Error('bad note '+s);return 12*(+m[3]+1)+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);}
function mxMel(str){const bars=str.split('|'),out=new Array(bars.length*16).fill(null);
 bars.forEach((b,i)=>{for(const tok of b.trim().split(/\s+/)){if(!tok)continue;const [p,n,l]=tok.split(':');out[i*16+(+p)]=[mxNote(n),+(l||2)];}});return out;}
function mxPat(p,bar,st){if(!p)return '.';const nb=Math.max(1,p.length>>4);return p[(bar%nb)*16+st]||'.';}
function mxArr(a,bar,st){if(!a)return null;const nb=Math.max(1,a.length>>4),v=a[(bar%nb)*16+st];return v===undefined?null:v;}

/* --- new voices (all short-lived nodes, stopped explicitly) --- */
function mxOsc(type,f,dt,t,end,dest){const o=AC.createOscillator();o.type=type;o.frequency.value=f;if(dt)o.detune.value=dt;o.connect(dest);o.start(t);o.stop(end);return o;}
function mxEnv(t,a,v,hold,rel){const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+a);if(hold>a)g.gain.setValueAtTime(v,t+hold);g.gain.exponentialRampToValueAtTime(0.0001,t+Math.max(hold,a)+rel);return g;}
/* supersaw lead: five detuned saws + a sub square. dirty = through the lead distortion (darksynth), else clean (synthpop) */
function mxSuper(t,f,dur,v,dirty){const end=t+dur+0.3,fl=AC.createBiquadFilter();fl.type='lowpass';fl.Q.value=1.2;fl.frequency.setValueAtTime(6000,t);fl.frequency.exponentialRampToValueAtTime(2000,t+Math.max(0.06,dur));
 const g=mxEnv(t,0.012,v,Math.max(0.02,dur-0.05),0.2);for(const dt of [-21,-8,0,8,21])mxOsc('sawtooth',f,dt,t,end,fl);
 const sg=AC.createGain();sg.gain.value=0.45;sg.connect(fl);mxOsc('square',f/2,0,t,end,sg);
 fl.connect(g);g.connect(dirty?leadDist:scBus);g.connect(dlyIn);g.connect(revIn);}
/* plucky synth: saw + square with a snappy filter */
function mxPluck(t,f,dur,v){const d=Math.min(dur,0.4),end=t+d+0.1,fl=AC.createBiquadFilter();fl.type='lowpass';fl.Q.value=5;fl.frequency.setValueAtTime(5200,t);fl.frequency.exponentialRampToValueAtTime(380,t+Math.max(0.08,d));
 const g=mxEnv(t,0.002,v,0.002,d);mxOsc('sawtooth',f,-6,t,end,fl);mxOsc('square',f,7,t,end,fl);fl.connect(g);g.connect(scBus);g.connect(dlyIn);}
/* 808: sine with a pitch drop, a little triangle for phone speakers */
function mxSub(t,f,dur,v){const end=t+dur+0.1,g=mxEnv(t,0.004,v,dur*0.55,dur*0.45);
 const o=AC.createOscillator();o.type='sine';o.frequency.setValueAtTime(f*2.3,t);o.frequency.exponentialRampToValueAtTime(f,t+0.045);o.connect(g);o.start(t);o.stop(end);
 const tg=AC.createGain();tg.gain.value=0.35;tg.connect(g);const o2=mxOsc('triangle',f*2,0,t,end,tg);o2.frequency.setValueAtTime(f*4.6,t);o2.frequency.exponentialRampToValueAtTime(f*2,t+0.045);g.connect(scBus);}
/* acid: one resonant saw */
function mxAcid(t,f,dur,v,acc){const end=t+dur+0.1,fl=AC.createBiquadFilter();fl.type='lowpass';fl.Q.value=14;fl.frequency.setValueAtTime(260,t);fl.frequency.exponentialRampToValueAtTime(acc?3000:1400,t+0.012);fl.frequency.exponentialRampToValueAtTime(280,t+0.2);
 const g=mxEnv(t,0.003,v,0.003,dur);mxOsc('sawtooth',f,0,t,end,fl);fl.connect(g);g.connect(scBus);g.connect(dlyIn);}
/* growling darksynth bass, into the crushed bass bus */
function mxGrowl(t,f,dur,v){const end=t+dur+0.1,fl=AC.createBiquadFilter();fl.type='lowpass';fl.Q.value=7;fl.frequency.setValueAtTime(300,t);fl.frequency.exponentialRampToValueAtTime(1700,t+0.03);fl.frequency.exponentialRampToValueAtTime(320,t+Math.max(0.06,dur));
 const g=mxEnv(t,0.003,v,dur*0.6,dur*0.4);mxOsc('sawtooth',f,-9,t,end,fl);mxOsc('sawtooth',f,9,t,end,fl);mxOsc('square',f/2,0,t,end,fl);fl.connect(g);g.connect(bassDist);}
/* picked funk bass */
function mxPick(t,f,dur,v){const d=Math.min(dur,0.45),end=t+d+0.1,fl=AC.createBiquadFilter();fl.type='lowpass';fl.Q.value=4;fl.frequency.setValueAtTime(2600,t);fl.frequency.exponentialRampToValueAtTime(300,t+0.14);
 const g=mxEnv(t,0.003,v,0.003,d);mxOsc('square',f,0,t,end,fl);mxOsc('sawtooth',f,5,t,end,fl);fl.connect(g);g.connect(scBus);}
/* soft round bass (bossa, lounge) */
function mxSoft(t,f,dur,v){const end=t+dur+0.1,fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=900;
 const g=mxEnv(t,0.012,v,dur*0.3,dur*0.7);mxOsc('sine',f,0,t,end,fl);const hg=AC.createGain();hg.gain.value=0.3;hg.connect(fl);mxOsc('triangle',f*2,0,t,end,hg);fl.connect(g);g.connect(scBus);}
/* electric piano: two-operator FM per note + a short tine */
function mxEP(t,fs,dur,v){const end=t+dur+0.5,g=mxEnv(t,0.004,v,0.004,dur+0.35);
 for(const f of fs){const c=mxOsc('sine',f,0,t,end,g),mg=AC.createGain();mg.gain.setValueAtTime(f*0.9,t);mg.gain.exponentialRampToValueAtTime(f*0.08,t+0.5);mxOsc('sine',f,0,t,end,mg);mg.connect(c.frequency);
  const tg=AC.createGain();env(tg,t,0.002,0.12,0.08);mxOsc('sine',f*7,0,t,t+0.2,tg);tg.connect(g);}
 g.connect(scBus);g.connect(revIn);}
/* vibraphone: sine + bright partial, with tremolo */
function mxVibe(t,f,dur,v){const end=t+dur+0.6,g=mxEnv(t,0.003,v,0.003,dur+0.5),tr=AC.createGain();tr.gain.value=1;
 const lfo=AC.createOscillator(),lg=AC.createGain();lfo.frequency.value=5.2;lg.gain.value=0.3;lfo.connect(lg);lg.connect(tr.gain);lfo.start(t);lfo.stop(end);
 mxOsc('sine',f,0,t,end,tr);const pg=AC.createGain();env(pg,t,0.002,0.22,0.3);mxOsc('sine',f*4,0,t,t+0.4,pg);pg.connect(tr);tr.connect(g);g.connect(scBus);g.connect(revIn);g.connect(dlyIn);}
/* house organ stab */
function mxOrgan(t,fs,v){const end=t+0.4,g=mxEnv(t,0.003,v,0.03,0.24);for(const f of fs){mxOsc('sine',f,0,t,end,g);const h=AC.createGain();h.gain.value=0.55;h.connect(g);mxOsc('sine',f*2,0,t,end,h);const h3=AC.createGain();h3.gain.value=0.2;h3.connect(g);mxOsc('square',f*4,0,t,end,h3);}g.connect(scBus);g.connect(dlyIn);}
/* trance-gate chord: a short held saw chord */
function mxGate(t,fs,dur,v){const end=t+dur+0.08,fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=2600;const g=mxEnv(t,0.004,v,dur*0.7,0.05);for(const f of fs){mxOsc('sawtooth',f,-10,t,end,fl);mxOsc('sawtooth',f,10,t,end,fl);}fl.connect(g);g.connect(scBus);}
/* drums */
function mxBoom(t,v){const o=AC.createOscillator();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(46,t+0.17);const g=AC.createGain();env(g,t,0.002,v,0.42);o.connect(g);g.connect(mBus);o.start(t);o.stop(t+0.5);noise(t,0.02,'highpass',2500,1800,v*0.35,mBus);}
function mxGated(t,v){mSnare(t,v*0.6);const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=1700;f.Q.value=0.7;const g=AC.createGain();
 g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+0.003);g.gain.linearRampToValueAtTime(v*0.6,t+0.15);g.gain.linearRampToValueAtTime(0.0001,t+0.17);s.connect(f);f.connect(g);g.connect(mBus);g.connect(revIn);s.start(t,Math.random()*0.5);s.stop(t+0.2);}
function mxTom(t,f,v){tone(t,0.32,'sine',f*1.7,f,v,mBus);noise(t,0.05,'lowpass',1800,600,v*0.4,mBus);}
function mxSnap(t,v){noise(t,0.06,'bandpass',2700,2300,v,mBus,4);noise(t,0.12,'bandpass',2500,2000,v*0.4,revIn,3);}
function mxShaker(t,v){const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=6500;const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+0.014);g.gain.exponentialRampToValueAtTime(0.0001,t+0.07);s.connect(f);f.connect(g);g.connect(mBus);s.start(t,Math.random()*0.5);s.stop(t+0.1);}
function mxBrush(t,v){const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=3400;f.Q.value=0.7;const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+0.03);g.gain.exponentialRampToValueAtTime(0.0001,t+0.22);s.connect(f);f.connect(g);g.connect(mBus);s.start(t,Math.random()*0.5);s.stop(t+0.26);}
function mxScratch(t,v){const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=6;
 f.frequency.setValueAtTime(700,t);f.frequency.exponentialRampToValueAtTime(2600,t+0.06);f.frequency.exponentialRampToValueAtTime(800,t+0.12);f.frequency.exponentialRampToValueAtTime(2200,t+0.17);
 const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+0.01);g.gain.linearRampToValueAtTime(v*0.2,t+0.06);g.gain.linearRampToValueAtTime(v,t+0.08);g.gain.exponentialRampToValueAtTime(0.0001,t+0.19);s.connect(f);f.connect(g);g.connect(mBus);s.start(t,Math.random()*0.5);s.stop(t+0.22);}
function mxCrash(t,v){const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.setValueAtTime(5200,t);f.frequency.exponentialRampToValueAtTime(3000,t+1.4);
 const g=AC.createGain();env(g,t,0.003,v,1.4);s.connect(f);f.connect(g);g.connect(mBus);g.connect(revIn);s.start(t);s.stop(t+1.5);}

const MX_LEAD={super:(t,f,d,v)=>mxSuper(t,f,d,v,false),dirty:(t,f,d,v)=>mxSuper(t,f,d,v,true),pluck:mxPluck,vibe:mxVibe,ep:(t,f,d,v)=>mxEP(t,[f],d,v),
 bell:(t,f,d,v)=>mBell(t,f,d,v),whistle:(t,f,d,v)=>mWhistle(t,f,d,v),brass:(t,f,d,v)=>mBrass(t,f,d,v),lead:(t,f,d,v)=>mLead(t,f,d,v,true),twang:(t,f,d,v)=>mTwang(t,f,d,v),acid:(t,f,d,v)=>mxAcid(t,f,d,v,false)};
const MX_BASS={saw:(t,f,d,v)=>mBass(t,f,d,v),growl:mxGrowl,sub:mxSub,acid:(t,f,d,v,acc)=>mxAcid(t,f,d,v,acc),pick:mxPick,soft:mxSoft};

/* --- song(): a theme() with an arrangement. Each form section lists the parts it plays:
   k kick  s snare  c clap  h hats  p percussion  b bass  a arp  l lead  d pad/chords  t stabs  f fill on its last bar  r riser into the next  z crash on its first beat
   Patterns are 16 steps per bar (longer strings span several bars). Snare: x hit, g gated 80s, o ghost, b brush. Hats: x closed, o open, s shaker.
   Percussion: r rim, m metal clang, n snap, w scratch. Bass/arp arrays: semitones over the chord root / chord-tone index (null = rest). */
function song(o){const tr=o.tr||0,P=o.prog.map(c=>c.map(m=>m+tr)),FORM=[],L=o.L?mxMel(o.L):null;
 for(const s of o.form){s.Lp=s.L?mxMel(s.L):L;s.Pp=s.prog?s.prog.map(c=>c.map(m=>m+tr)):P;const bars=s.bars||P.length;for(let b=0;b<bars;b++)FORM.push({s,b,bars});}
 const duckAmt=o.duck==null?0.25:o.duck;
 return{bpm:o.bpm,title:o.title,dist:o.dist,cut:o.cut,hiss:o.hiss,start:0,prog:P,bars:FORM.length,
  step(n,t,spb){const bar=n>>4,st=n&15,F=FORM[bar%FORM.length],s=F.s,on=s.on,ch=s.Pp[bar%s.Pp.length],last=F.b===F.bars-1;
   const tt=(st&1)&&o.swing?t+o.swing*spb:t,fill=last&&on.includes('f')&&st>=8&&o.fill!=='scratch';
   if(on.includes('z')&&F.b===0&&st===0)mxCrash(t,o.zv||0.22);
   if(on.includes('r')&&last&&st===0)mRiser(t,spb*16);
   if(on.includes('k')&&!(fill&&st>=12)){const c=mxPat(s.K||o.K,bar,st);if(c==='x'){(o.kick==='boom'?mxBoom:mKick)(tt,o.kv||1);if(duckAmt<1)duck(tt,duckAmt,0.22);}}
   if(on.includes('s')&&!fill){const c=mxPat(s.S||o.S,bar,st),v=o.sv||0.5;if(c==='x')mSnare(tt,v);else if(c==='g')mxGated(tt,v);else if(c==='o')mSnare(tt,v*0.3);else if(c==='b')mxBrush(tt,v);}
   if(on.includes('c')&&mxPat(s.C||o.C,bar,st)==='x')mClap(tt,o.cv||0.3);
   if(on.includes('h')){const c=mxPat(s.H||o.H,bar,st),v=o.hv||0.06;if(c==='x')mHat(tt,v,false);else if(c==='o')mHat(tt,v*1.6,true);else if(c==='s')mxShaker(tt,v);}
   if(on.includes('p')){const c=mxPat(s.X||o.X,bar,st);if(c==='r')mRim(tt);else if(c==='m')mClang(tt);else if(c==='n')mxSnap(tt,o.nv||0.3);else if(c==='w')mxScratch(tt,0.3);}
   if(fill){if(o.fill==='tom'){if(!(st&1))mxTom(t,80+(15-st)*15,0.4);}else mSnare(t,0.18+(st-8)*0.06);}
   if(last&&on.includes('f')&&o.fill==='scratch'&&(st===8||st===11||st===14))mxScratch(tt,0.32);
   if(on.includes('b')){const v=mxArr(s.B||o.B,bar,st);if(v!=null)MX_BASS[o.bassV||'saw'](tt,mtof(ch[0]+(o.bassOct==null?-24:o.bassOct)+v),spb*(o.bassLen||0.85),o.bv||0.5,v>=12);}
   if(on.includes('a')){const a=mxArr(s.A||o.A,bar,st);if(a!=null){const k=ch.length,m=ch[a%k]+12*Math.floor(a/k)+12*(1+(o.arpOct||0));MX_LEAD[o.arpV||'pluck'](tt,mtof(m),spb*(o.arpLen||0.8),o.av||0.04);}}
   if(on.includes('l')&&s.Lp){const nb=s.Lp.length>>4,m=s.Lp[(bar%nb)*16+st];if(m)MX_LEAD[s.leadV||o.leadV||'super'](tt,mtof(m[0]+tr),spb*m[1]*0.95,s.lv||o.lv||0.07);}
   if(on.includes('d')){if(o.padPat){if(mxPat(o.padPat,bar,st)==='x'){let h=1;while(h<16&&mxPat(o.padPat,bar,(st+h)&15)!=='x'&&st+h<16)h++;const fs=ch.map(m=>mtof(m+(o.padOct||0)));
      if(o.padV==='organ')mxOrgan(tt,fs,o.pv||0.04);else if(o.padV==='vibe')fs.forEach(f=>mxVibe(tt,f,spb*h,(o.pv||0.04)/2));else mxEP(tt,fs,spb*Math.min(h,o.padHold||16),o.pv||0.04);}}
    else if(st===0)mPad(t,ch.map(mtof),spb*16,o.pv||0.033,o.pcut||1500);}
   if(on.includes('t')&&mxPat(s.T||o.T,bar,st)==='x'){const fs=ch.map(m=>mtof(m+(o.stabOct||0)));if(o.stabV==='organ')mxOrgan(tt,fs,o.tv||0.04);else if(o.stabV==='gate')mxGate(tt,fs,spb*0.8,o.tv||0.03);else mStab(tt,fs,o.tv||0.04);}
  }};}

/* the chill track that follows each mission track once the floor is clear (same key, same style, half the energy) */
const MX_AFTER={n_voltage:'c_afterglow',n_heat:'c_afterglow',n_sapphire:'c_comedown',n_hollow:'c_comedown',n_chrome:'c_coolant',n_killswitch:'c_coolant'};
const MX_AFTER_ROT=['c_afterglow','c_comedown','c_coolant'];
/* music once a floor is clear: during an escape sprint the mission track keeps going; once it's done (or there is none) it cools down */
function afterTrack(){const g=G;if(state==='play'&&g&&g.esc&&!g.done)return g.track||'game';return MX_AFTER[g&&g.track]||MX_AFTER_ROT[Math.abs(levelIdx|0)%MX_AFTER_ROT.length];}
let MX_CLUB=0;

(()=>{try{TRACKS;}catch(e){return;}/* the main script stopped early (no WebGL): nothing to add */
const C=s=>s.split(' ').map(mxNote);/* chord helper: 'E4 G4 B4' */
Object.assign(TRACKS,{
 /* ===== missions ===== */
 n_voltage:song({title:'VOLTAGE',bpm:134,dist:3,duck:0.22,prog:[C('E4 G4 B4'),C('C4 E4 G4'),C('D4 F#4 A4'),C('B3 D4 F#4')],
  K:'x...x...x...x...',S:'....x.......x...',C:'....x.......x...',H:'x.o.x.o.x.o.x.o.',hv:0.06,X:'..............r.',
  B:[0,12,0,12,0,12,0,12,0,12,0,12,0,12,7,12],bassLen:0.5,bv:0.5,A:[0,1,2,3,2,1,0,1],av:0.035,T:'..x..x....x..x..',stabV:'gate',tv:0.025,stabOct:12,pv:0.03,pcut:1800,
  leadV:'dirty',lv:0.065,L:'0:B5:3 3:B5:3 6:E6:2 8:D6:3 11:B5:3 14:A5:2 | 0:G5:3 3:G5:3 6:C6:2 8:B5:4 12:G5:2 14:E5:2 | 0:F#5:3 3:A5:3 6:D6:2 8:E6:4 12:D6:2 14:A5:2 | 0:B5:6 6:D6:2 8:F#6:4 12:E6:2 14:D6:2',
  form:[{on:'bdhr'},{on:'kshbad',bars:8},{on:'kschbadltz',bars:8,X:'..............r.'},{on:'dalr'},{on:'kschbadltzf',bars:8}]}),
 n_chrome:song({title:'BLACK CHROME',bpm:120,dist:2.6,cut:11000,duck:0.25,prog:[C('D4 F4 A4'),C('Bb3 D4 F4'),C('G3 Bb3 D4'),C('A3 C#4 E4')],
  K:'x...x...x...x...',S:'....x.......x...',sv:0.45,C:'....x.......x...',cv:0.22,H:'..x...x...x...x.',hv:0.05,X:'..............r.',fill:'tom',
  B:[0,0,12,0,0,0,12,0,0,0,12,0,0,12,0,10],bassLen:0.55,bv:0.45,A:[0,1,2,1,3,1,2,1],av:0.03,arpV:'pluck',T:'..x.....x.x.....',stabV:'gate',tv:0.022,pv:0.035,pcut:1300,
  leadV:'super',lv:0.06,L:'0:A5:3 3:A5:3 6:D6:2 8:C6:4 12:A5:2 14:F5:2 | 0:F5:3 3:F5:3 6:Bb5:2 8:A5:4 12:F5:2 14:D5:2 | 0:G5:3 3:Bb5:3 6:D6:2 8:C6:4 12:Bb5:2 14:A5:2 | 0:E5:6 6:A5:2 8:C#6:4 12:A5:2 14:E5:2',
  form:[{on:'dahr'},{on:'kshbad',bars:8},{on:'kschbadltz',bars:8},{on:'dalr'},{on:'kschbadltzf',bars:8}]}),
 n_heat:song({title:'HEAT SIGNATURE',bpm:146,dist:4,duck:0.2,prog:[C('B3 D4 F#4'),C('G3 B3 D4'),C('A3 C#4 E4'),C('F#3 A3 C#4')],
  K:'x..x..x...x..x..',S:'....x.......x...',C:'....x.......x...',H:'xxxxxxxxxxxxxxox',hv:0.04,
  B:[0,0,12,0,0,12,0,10,0,0,12,0,7,0,12,5],bassV:'acid',bassLen:0.6,bv:0.22,bassOct:-12,T:'..x...x...x.x.x.',tv:0.035,A:[0,1,2,4,2,1],arpV:'bell',av:0.03,pv:0.03,pcut:1600,
  leadV:'lead',lv:0.075,L:'0:F#5:2 2:B5:2 4:D6:2 6:C#6:2 8:B5:2 10:F#5:2 12:A5:2 14:B5:2 | 0:D6:2 2:B5:2 4:G5:2 6:B5:2 8:D6:4 12:E6:2 14:D6:2 | 0:C#6:2 2:A5:2 4:E5:2 6:A5:2 8:C#6:4 12:E6:4 | 0:F#6:6 6:E6:2 8:C#6:4 12:A5:2 14:C#6:2',
  form:[{on:'hbr'},{on:'kshbt',bars:8},{on:'kschbltdz',bars:8},{on:'bdar'},{on:'kschbltdzf',bars:8}]}),
 n_sapphire:song({title:'SAPPHIRE NIGHTS',bpm:116,dist:1.8,duck:0.3,prog:[C('C#4 E4 G#4'),C('A3 C#4 E4'),C('E4 G#4 B4'),C('B3 D#4 F#4')],
  K:'x...x...x...x...',S:'....g.......g...',sv:0.55,H:'..x...x...x...x.',hv:0.05,fill:'tom',
  B:[0,null,0,null,12,null,0,null,0,null,0,null,12,null,7,null],bassLen:0.8,bv:0.45,A:[0,1,2,4,2,1],arpV:'bell',av:0.03,pv:0.035,pcut:2400,
  leadV:'super',lv:0.06,L:'0:G#5:4 4:E5:2 6:G#5:2 8:C#6:6 14:B5:2 | 0:A5:4 4:E5:2 6:A5:2 8:C#6:4 12:B5:2 14:A5:2 | 0:G#5:6 6:B5:2 8:E6:6 14:D#6:2 | 0:D#6:4 4:C#6:4 8:B5:6 14:F#5:2',
  form:[{on:'dahr'},{on:'kshbad',bars:8},{on:'kshbadlz',bars:8},{on:'dlr'},{on:'kshbadlzf',bars:8}]}),
 n_killswitch:song({title:'KILL SWITCH',bpm:128,dist:5,duck:0.2,prog:[C('G3 Bb3 D4'),C('G3 Bb3 D4'),C('Bb3 D4 F4'),C('F3 A3 C4')],
  K:'x...x...x...x...',kv:1.1,C:'....x.......x...',H:'xxoxxxoxxxoxxxox',hv:0.04,X:'...m......m...m.',
  B:[null,0,0,0,null,0,0,0,null,0,0,0,null,0,12,0],bassLen:0.45,bv:0.5,A:[0,3,0,2,0,3,1,0,0,3,0,2,4,3,1,2],arpV:'acid',av:0.16,arpOct:-1,T:'x.....x.....x...',stabV:'gate',tv:0.03,stabOct:12,pv:0.03,pcut:1400,
  leadV:'dirty',lv:0.065,L:'0:D5:3 3:D5:3 6:G5:2 8:F5:2 10:D5:2 12:Bb4:4 | 0:C5:3 3:D5:3 6:F5:2 8:G5:6 14:A5:2 | 0:Bb5:3 3:A5:3 6:F5:2 8:D5:4 12:F5:4 | 0:A5:6 6:G5:2 8:F5:4 12:C5:2 14:E5:2',
  form:[{on:'kha'},{on:'kchbap',bars:8},{on:'kchbltpzd',bars:8},{on:'adr'},{on:'kchbltpzdaf',bars:8}]}),
 n_hollow:song({title:'HOLLOW POINT',bpm:138,dist:4.5,duck:0.2,prog:[C('F4 Ab4 C5'),C('Db4 F4 Ab4'),C('Eb4 G4 Bb4'),C('C4 E4 G4')],
  K:'x...x...x...x.x.',S:'....x.......x..x',C:'....x.......x...',H:'xxxxxxxxxxxxxxxx',hv:0.04,
  B:[0,0,12,0,0,12,0,0,12,0,0,12,0,12,0,12],bassV:'growl',bassLen:0.45,bv:0.45,A:[0,2,1,2],av:0.035,T:'x..x..x...x..x..',tv:0.035,pv:0.03,pcut:1600,
  leadV:'lead',lv:0.08,L:'0:C6:2 2:Ab5:2 4:F5:2 6:Ab5:2 8:C6:2 10:Db6:2 12:C6:2 14:Ab5:2 | 0:F5:4 4:Ab5:4 8:Db6:6 14:C6:2 | 0:Bb5:2 2:G5:2 4:Eb5:2 6:G5:2 8:Bb5:2 10:C6:2 12:Bb5:2 14:G5:2 | 0:E5:4 4:G5:4 8:C6:4 12:Bb5:2 14:G5:2',
  form:[{on:'bhr'},{on:'kshba',bars:8},{on:'kschbaltz',bars:8},{on:'dlr'},{on:'kschbaltzf',bars:8}]}),

 /* ===== after the floor is clear ===== */
 c_afterglow:song({title:'AFTERGLOW',bpm:82,dist:1.1,cut:3200,hiss:0.03,duck:0.5,prog:[C('E4 G4 B4 D5'),C('C4 E4 G4 B4'),C('A3 C4 E4 G4'),C('B3 D4 F#4 A4')],
  K:'x.......x.......',kv:0.55,S:'........g.......',sv:0.28,H:'..x...x...x...x.',hv:0.025,
  B:[0,null,null,null,null,null,null,null,0,null,null,null,null,null,null,null],bassLen:6,bv:0.34,A:[0,2,1,3,2,4,3,1],arpV:'bell',av:0.026,pv:0.045,pcut:1400,
  leadV:'whistle',lv:0.055,L:'0:B5:6 6:A5:2 8:G5:8 | 0:E5:6 6:G5:2 8:B5:6 14:A5:2 | 0:C6:6 6:B5:2 8:A5:4 12:E5:4 | 0:F#5:8 8:B5:4 12:A5:4',
  form:[{on:'da'},{on:'kshbda',bars:8},{on:'kshbdal',bars:8}]}),
 c_comedown:song({title:'COMEDOWN',bpm:76,dist:1.0,cut:3000,hiss:0.035,duck:0.6,prog:[C('C#4 E4 G#4 B4'),C('A3 C#4 E4 G#4'),C('F#3 A3 C#4 E4'),C('G#3 B3 D#4 F#4')],
  K:'x.........x.....',kv:0.5,S:'........x.......',sv:0.25,H:'....x.......x...',hv:0.022,
  B:[0,null,null,null,null,null,null,null,null,null,7,null,null,null,null,null],bassLen:5,bv:0.34,padV:'ep',padPat:'x.......x.......',pv:0.035,padOct:12,
  leadV:'bell',lv:0.05,L:'0:G#5:8 8:E5:4 12:F#5:4 | 0:E5:8 8:C#5:8 | 0:F#5:6 6:G#5:2 8:A5:8 | 0:G#5:8 8:D#5:8',
  form:[{on:'d'},{on:'kshbd',bars:8},{on:'kshbdl',bars:8}]}),
 c_coolant:song({title:'COOLANT',bpm:88,dist:1.3,cut:2800,hiss:0.03,duck:0.45,prog:[C('G3 Bb3 D4 F4'),C('Eb4 G4 Bb4 D5'),C('C4 Eb4 G4 Bb4'),C('D4 F4 A4 C5')],
  K:'x.....x...x.....',kv:0.55,S:'....x.......x...',sv:0.25,H:'x.x.x.x.x.x.x.x.',hv:0.02,X:'..r.......r..r..',
  B:[0,null,null,0,null,null,12,null,0,null,null,0,null,null,7,null],bassLen:1.5,bv:0.36,A:[0,null,2,null,1,null,3,null],arpV:'pluck',av:0.028,pv:0.04,pcut:1200,
  leadV:'whistle',lv:0.05,L:'0:D6:6 6:C6:2 8:Bb5:8 | 0:G5:6 6:Bb5:2 8:D6:8 | 0:Eb6:6 6:D6:2 8:C6:4 12:G5:4 | 0:A5:8 8:F5:4 12:A5:4',
  form:[{on:'da'},{on:'kshpbda',bars:8},{on:'kshpbdal',bars:8}]}),

 /* ===== McWey Tower: slick 80s corporate in the lobby, moody noir up in the office ===== */
 c_marble:song({title:'MARBLE & GLASS',bpm:100,dist:1.1,cut:5200,hiss:0.02,duck:0.6,prog:[C('Bb3 D4 F4 A4'),C('A3 C4 E4 G4'),C('G3 Bb3 D4 F4'),C('C4 E4 G4 Bb4')],
  K:'x.....x...x.....',kv:0.65,S:'....x.......x...',sv:0.32,C:'....x.......x...',cv:0.15,H:'x.x.x.x.x.x.x.x.',hv:0.028,
  B:[0,null,null,0,null,12,null,0,null,0,null,null,7,null,10,12],bassV:'pick',bassLen:1.2,bv:0.4,padV:'ep',padPat:'x.....x.....x...',padHold:6,pv:0.032,padOct:12,
  A:[0,null,1,null,2,null,3,null],arpV:'bell',av:0.022,
  leadV:'bell',lv:0.06,L:'0:F5:3 3:A5:3 6:C6:4 10:A5:2 12:G5:4 | 0:E5:3 3:G5:3 6:C6:4 10:G5:2 12:A5:4 | 0:D5:3 3:F5:3 6:Bb5:4 10:A5:2 12:G5:4 | 0:E5:6 6:G5:2 8:Bb5:4 12:C6:4',
  form:[{on:'kshbd'},{on:'kschbdl',bars:8},{on:'khbda'}]}),
 c_corner:song({title:'CORNER OFFICE',bpm:84,dist:1.2,cut:3400,hiss:0.03,duck:0.5,prog:[C('D4 F4 A4'),C('Bb3 D4 F4'),C('G3 Bb3 D4'),C('A3 C#4 E4')],
  K:'x.........x.....',kv:0.55,S:'........g.......',sv:0.3,H:'..x...x...x...x.',hv:0.025,
  B:[0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],bassLen:7,bv:0.36,A:[0,null,1,null,2,null,1,null],arpV:'bell',av:0.025,pv:0.05,pcut:1000,
  leadV:'brass',lv:0.07,L:'0:A5:8 8:F5:4 12:E5:4 | 0:D5:8 8:F5:8 | 0:G5:6 6:F5:2 8:D5:8 | 0:E5:8 8:C#5:8',
  form:[{on:'db'},{on:'ksbda'},{on:'kshbdal',bars:8}]}),
 /* ===== Nine of Nine's: gun-metal and grime ===== */
 c_iron:song({title:'IRON SIGHTS',bpm:94,dist:2,cut:6000,hiss:0.03,duck:0.4,prog:[C('E3 G3 B3'),C('E3 G3 B3'),C('C3 E3 G3'),C('B2 D#3 F#3')],
  K:'x.....x.x.......',kv:0.8,S:'....x.......x...',sv:0.45,H:'..x...x...x...x.',hv:0.04,X:'......m....r..m.',
  B:[0,null,null,0,null,null,12,null,0,null,0,null,null,null,10,null],bassV:'growl',bassOct:-12,bassLen:1.2,bv:0.42,pv:0.035,pcut:1100,
  leadV:'twang',lv:0.08,L:'0:E5:4 4:G5:2 6:B5:4 10:A5:2 12:G5:4 | 0:F#5:4 4:E5:2 6:D5:2 8:E5:8 | 0:G5:4 4:E5:2 6:C5:4 10:D5:2 12:E5:4 | 0:D#5:4 4:F#5:4 8:B4:8',
  form:[{on:'kshbdp'},{on:'kshbdpl',bars:8}]}),
 /* ===== Velvet Palms: swung boom-bap with an 808, and a house cut ===== */
 c_velvet:song({title:'VELVET ROPE',bpm:90,swing:0.2,dist:1.6,cut:9000,hiss:0.015,duck:0.85,kick:'boom',kv:0.9,fill:'scratch',prog:[C('C4 Eb4 G4 Bb4'),C('C4 Eb4 G4 Bb4'),C('Ab3 C4 Eb4 G4'),C('G3 B3 D4 F4')],
  K:'x......x..x.....',S:'....x.......x...',sv:0.5,C:'....x.......x...',cv:0.22,H:'x.x.x.x.x.x.x.o.',hv:0.05,X:'.......n.......n',
  B:[0,null,null,null,null,null,null,0,null,null,0,null,null,null,null,null],bassV:'sub',bassLen:3,bv:0.55,padV:'ep',padPat:'x.........x.....',pv:0.04,padOct:12,
  leadV:'whistle',lv:0.055,L:'0:G5:3 3:Bb5:3 6:C6:2 8:Eb6:4 12:D6:2 14:C6:2 | 0:Bb5:6 6:G5:2 8:F5:4 12:G5:4 | 0:Eb6:3 3:C6:3 6:Ab5:2 8:G5:4 12:F5:2 14:Eb5:2 | 0:F5:3 3:G5:3 6:B5:2 8:D6:6 14:B5:2',
  form:[{on:'dh'},{on:'kschbdp',bars:8},{on:'kschbdplf',bars:8}]}),
 c_strobe:song({title:'STROBE LIGHT',bpm:122,dist:1.6,cut:12000,hiss:0.01,duck:0.3,prog:[C('D4 F4 A4 C5'),C('Bb3 D4 F4 A4'),C('C4 E4 G4'),C('A3 C4 E4 G4')],
  K:'x...x...x...x...',C:'....x.......x...',cv:0.32,H:'x.o.x.o.x.o.x.o.',hv:0.05,
  B:[null,null,0,null,null,null,0,null,null,null,0,null,null,null,0,12],bassLen:0.9,bv:0.42,T:'x..x..x...x..x..',stabV:'organ',tv:0.035,pv:0.03,pcut:2000,
  leadV:'pluck',lv:0.06,L:'0:A5:2 2:C6:2 4:D6:2 7:C6:2 10:A5:2 12:G5:2 14:A5:2 | 0:F5:2 2:A5:2 4:D6:2 7:C6:2 10:A5:4 14:F5:2 | 0:G5:2 2:C6:2 4:E6:2 7:D6:2 10:C6:2 12:G5:2 14:C6:2 | 0:E6:4 4:D6:2 7:C6:2 10:A5:6',
  form:[{on:'khb'},{on:'kchbt',bars:8},{on:'kchbtl',bars:8},{on:'dlhr'},{on:'kchbtlz',bars:8}]}),
 /* ===== Casino La Perla: a swung Latin-lounge cha-cha for the high rollers ===== */
 c_highroller:song({title:'HIGH ROLLER',bpm:112,swing:0.12,dist:1.1,cut:7000,hiss:0.015,duck:0.85,kv:0.4,
  prog:[C('D4 F4 A4 C5'),C('G3 B3 D4 F4'),C('C4 E4 G4 B4'),C('A3 C#4 E4 G4')],
  K:'x.....x.x.....x.',S:'....b.......b..b',sv:0.14,H:'x.s.x.s.x.s.x.s.',hv:0.02,X:'..r..r....r.r...',
  B:[0,null,null,7,null,null,12,null,0,null,null,7,null,12,10,null],bassV:'pick',bassLen:1.4,bv:0.36,padV:'ep',padPat:'x..x....x..x....',padHold:2,pv:0.032,padOct:12,
  A:[0,2,1,3,2,1,0,null],arpV:'vibe',av:0.026,leadV:'brass',lv:0.06,
  L:'0:A5:3 3:G5:1 4:F5:2 6:A5:2 8:D6:6 14:C6:2 | 0:B5:3 3:A5:1 4:G5:2 6:B5:2 8:F5:8 | 0:E5:3 3:G5:1 4:B5:2 6:C6:2 8:E6:4 12:D6:4 | 0:C#6:3 3:B5:1 4:A5:2 6:G5:2 8:E5:4 12:A5:4',
  form:[{on:'khpbd',bars:8},{on:'khpsbdl',bars:8},{on:'khpsbdla',bars:8,leadV:'whistle',lv:0.05},{on:'khpbda',bars:8}]}),
 /* ===== Biscayne Galleria: elevator muzak (bossa downstairs, smooth lounge upstairs) ===== */
 c_galleria:song({title:'ESCALATOR BOSSA',bpm:104,dist:1.0,cut:6000,hiss:0.015,duck:0.95,kv:0.32,
  prog:[C('F4 A4 C5 E5'),C('D4 F4 A4 C5'),C('G4 Bb4 D5 F5'),C('C4 E4 G4 Bb4'),C('A3 C4 E4 G4'),C('D4 F4 A4 C5'),C('G4 Bb4 D5 F5'),C('C4 E4 G4 Bb4')],
  K:'x.....x.x.....x.',S:'....b.......b...',sv:0.12,H:'ssssssssssssssss',hv:0.018,X:'r..r..r...r.r...',
  B:[0,null,null,null,null,null,7,null,0,null,null,null,null,null,7,null],bassV:'soft',bassOct:-24,bassLen:4,bv:0.27,padV:'ep',padPat:'x..x..x...x..x..',padHold:3,pv:0.034,
  A:[0,1,2,3,2,1,0,null],arpV:'vibe',av:0.03,leadV:'vibe',lv:0.06,
  L:'0:A5:4 4:G5:2 6:A5:2 8:C6:6 14:A5:2 | 0:F5:6 6:E5:2 8:D5:4 12:F5:4 | 0:Bb5:4 4:A5:2 6:Bb5:2 8:D6:6 14:Bb5:2 | 0:A5:6 6:G5:2 8:E5:4 12:G5:4 | 0:C6:4 4:B5:2 6:C6:2 8:E6:6 14:C6:2 | 0:A5:6 6:G5:2 8:F5:4 12:A5:4 | 0:G5:4 4:A5:2 6:Bb5:2 8:D6:4 12:C6:4 | 0:Bb5:6 6:A5:2 8:G5:8',
  form:[{on:'khpbd',bars:8},{on:'khpsbdl',bars:8},{on:'khpsbdl',bars:8,leadV:'whistle',lv:0.05},{on:'khpbda',bars:8}]}),
 c_escalator:song({title:'SOFT FOCUS',bpm:92,swing:0.15,dist:1.0,cut:5500,hiss:0.015,duck:0.95,kv:0.3,prog:[C('Eb4 G4 Bb4 D5'),C('D4 F4 A4 C5'),C('C4 Eb4 G4 Bb4'),C('F4 A4 C5 Eb5')],
  K:'x.......x.......',S:'....b.......b...',sv:0.12,H:'x..xx..xx..xx..x',hv:0.016,
  B:[0,null,null,null,7,null,null,null,12,null,null,null,10,null,null,null],bassV:'soft',bassLen:3.6,bv:0.27,padV:'ep',padPat:'x.......x.......',pv:0.036,
  A:[0,null,2,null,1,null,3,null],arpV:'vibe',av:0.028,leadV:'whistle',lv:0.05,
  L:'0:G5:6 6:F5:2 8:D5:4 12:Bb4:4 | 0:C5:6 6:D5:2 8:F5:8 | 0:Eb5:6 6:D5:2 8:C5:4 12:G5:4 | 0:F5:8 8:A5:4 12:C6:4',
  form:[{on:'kshbd'},{on:'kshbdl',bars:8},{on:'kshbda'}]}),
});

/* missions: the new tracks come first; the old ones stay in the rotation (a death moves to the next one) */
const NEW=[['n_voltage','n_sapphire'],['n_sapphire','n_heat'],['n_heat','n_chrome'],['n_chrome','n_killswitch'],['n_killswitch','n_hollow'],['n_hollow','n_voltage'],['n_heat','n_killswitch'],['n_chrome','n_hollow'],['n_killswitch','n_voltage'],['n_sapphire','n_chrome'],['n_hollow','n_heat']];
LEVEL_TRACKS.forEach((list,i)=>{const add=NEW[i%NEW.length].filter(t=>!list.includes(t));list.unshift(...add);});
/* hubs */
const hub=(k,t)=>{if(HUBS[k])HUBS[k].track=t;};
hub('lobby','c_marble');hub('office','c_corner');hub('bunker','c_iron');hub('mall','c_galleria');hub('mall2','c_escalator');hub('casino','c_highroller');
/* Velvet Palms swaps between the hip-hop and the club cut on each visit */
if(HUBS.club)Object.defineProperty(HUBS.club,'track',{configurable:true,enumerable:true,get(){return (MX_CLUB++)%2?'c_strobe':'c_velvet';},set(){}});
/* the home hi-fi can play the new calm ones too */
for(const t of ['c_afterglow','c_comedown','c_coolant','c_marble','c_corner','c_iron','c_velvet','c_strobe','c_galleria','c_escalator','c_highroller'])if(!HIFI_TRACKS.includes(t))HIFI_TRACKS.push(t);
})();
