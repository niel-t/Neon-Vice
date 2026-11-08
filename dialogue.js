'use strict';
// Dialogue data and log presentation.

/* ---- text size (SET.textSize, shared by the dialogue log, drawSay and banner) ---- */
const TEXT_SIZES={S:{name:'SMALL',k:0.85},M:{name:'MEDIUM',k:1},L:{name:'LARGE',k:1.2},XL:{name:'HUGE',k:1.45}};
const TEXT_ORDER=['S','M','L','XL'];
const textKey=()=>TEXT_SIZES[SET.textSize]?SET.textSize:'M';
const textScale=()=>TEXT_SIZES[textKey()].k;
function applyTextSize(){document.documentElement.style.setProperty('--tx',String(textScale()));const b=$('bText');if(b)b.textContent='TEXT SIZE: '+TEXT_SIZES[textKey()].name;}
function cycleTextSize(){SET.textSize=TEXT_ORDER[(TEXT_ORDER.indexOf(textKey())+1)%TEXT_ORDER.length];saveSet();applyTextSize();dlogScrollEnd();}

/* ---- right-side scrolling conversation log (Disco Elysium style) ---- */
// Earlier visits this session stay in the log, collapsed; nothing here is saved.
const DLOG={hist:[],cur:null,max:8};
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
 el.firstChild.textContent=who;box.appendChild(el);if(DLOG.cur)DLOG.cur.lines.push({who,me,t});dlogScrollEnd();return el.lastChild;}
function dlogScrollEnd(){const s=$('dlogScroll');if(s)s.scrollTop=s.scrollHeight;}
function dlogScrollBy(px){const s=$('dlogScroll');if(s)s.scrollTop+=px;}
