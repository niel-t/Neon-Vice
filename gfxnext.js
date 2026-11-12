'use strict';
/* Opt-in Three.js renderer hook. Does nothing unless the page is opened with ?gfx=next
   (remembered in this browser; ?gfx=old switches back). When on, it (1) remembers the
   source of every texture and buffer the game uploads, so next/three-renderer.js can reuse
   the game's own geometry and art, and (2) turns the classic renderer's draw calls into
   no-ops while the new renderer is live. NX is null when the switch is off. See next/README.md. */
const NX=(()=>{
 let on=/[?&]gfx=next\b/.test(location.search);
 try{if(/[?&]gfx=old\b/.test(location.search))localStorage.removeItem('nvgfx');else if(on)localStorage.setItem('nvgfx','next');else on=localStorage.getItem('nvgfx')==='next';}catch(e){}
 const N=window.NVNEXT={on,live:false,ready:false,failed:false,tex:new WeakMap(),buf:new WeakMap(),chars:[],models:null,impl:null};
 if(!on)return null;
 N.wrapGL=function(gl){
  if(!gl)return;let curTex=null;const curBuf={};
  const wrap=(obj,name,fn)=>{const o=obj[name].bind(obj);obj[name]=function(){return fn(o,arguments);};};
  wrap(gl,'bindTexture',(o,a)=>{curTex=a[1];return o(a[0],a[1]);});
  wrap(gl,'texImage2D',(o,a)=>{if(a.length===6&&curTex&&a[5]&&typeof a[5]==='object'){const r=N.tex.get(curTex)||{src:null,ver:0};r.src=a[5];r.ver++;N.tex.set(curTex,r);}return o.apply(null,a);});
  wrap(gl,'bindBuffer',(o,a)=>{curBuf[a[0]]=a[1];return o(a[0],a[1]);});
  wrap(gl,'bufferData',(o,a)=>{const b=curBuf[a[0]];if(b&&a[1]&&a[1].buffer){const r=N.buf.get(b)||{data:null,ver:0};r.data=a[1];r.ver++;N.buf.set(b,r);}return o(a[0],a[1],a[2]);});
  for(const k of ['drawArrays','drawElements','clear'])wrap(gl,k,(o,a)=>{if(N.live)return;return o.apply(null,a);});
  wrap(gl,'getExtension',(o,a)=>{const e=o(a[0]);if(e&&a[0]==='ANGLE_instanced_arrays'&&!e.__nv){e.__nv=1;for(const k of ['drawElementsInstancedANGLE','drawArraysInstancedANGLE'])wrap(e,k,(oo,aa)=>{if(N.live)return;return oo.apply(null,aa);});}return e;});
  import('./next/three-renderer.js').then(m=>{N.impl=m.create(N,gl);N.ready=true;}).catch(e=>{N.failed=true;console.warn('NVNEXT: new renderer failed to load, using the classic one',e);});
 };
 /* called at the top of the game's render(): decides who draws this frame */
 N.begin=function(menu,enhanced){const live=N.ready&&!N.failed&&!N.paused&&!menu&&enhanced;if(live!==N.live){N.live=live;if(N.impl)N.impl.show(live);}N.chars.length=0;};
 /* F9 flips between the new and the classic renderer, for comparing */
 addEventListener('keydown',e=>{if(e.key==='F9'){N.paused=!N.paused;e.preventDefault();}});
 /* called from PS2C.flush(): hands over the skinned characters queued this frame */
 N.takeChars=function(queue,models){N.models=models;for(const q of queue)N.chars.push(q);};
 /* called at the end of the game's render() */
 N.draw=function(view){try{N.impl.draw(view);}catch(e){console.error('NVNEXT: draw failed, falling back to the classic renderer',e);N.failed=true;N.live=false;N.impl.show(false);}};
 return N;
})();
