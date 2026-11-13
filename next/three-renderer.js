/* Neon Vice "next" renderer: draws the live game with Three.js.
   It does not rebuild the levels. It takes the geometry the game already builds
   every frame (static level, dynamic props, instanced rounded boxes, skinned
   characters) and draws it with real lights, soft shadows, HDR bloom and a film pass.
   Everything tunable is in LOOK below. */
import * as THREE from './three/build/three.module.js';
import {EffectComposer} from './three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from './three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from './three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from './three/examples/jsm/postprocessing/ShaderPass.js';
import {OutputPass} from './three/examples/jsm/postprocessing/OutputPass.js';

const LOOK={
 exposure:1.15,
 bloom:{strength:0.5,radius:0.6,threshold:1.0},
 glow:3.2,          // how far past white emissive things (signs, bullets, flashes) go
 pointLight:2.6,    // brightness of the level's lamps and neon lights
 sun:3.0,           // moonlight / key light
 ambient:3.7,
 shadowSize:2048,
 maxLights:10,
 pixelRatioMax:1.5,
};

/* A single not-a-number pixel is smeared over the whole screen by the bloom blur and shows as a black frame, and real
   graphics chips produce one from a zero-length normal or a negative colour where software GL does not. So normals are
   normalised safely, colours are clamped before pow(), and every lit material ends with OUTGUARD. */
const NVN=`vec3 nvN(vec3 v){float l=length(v);return l>1e-6?v/l:vec3(0.0,1.0,0.0);}`;
const OUTGUARD=`#include <dithering_fragment>
if(!(gl_FragColor.r>=0.0&&gl_FragColor.g>=0.0&&gl_FragColor.b>=0.0))gl_FragColor.rgb=vec3(0.0);gl_FragColor.rgb=min(gl_FragColor.rgb,vec3(64.0));`;
const GEOM=NVN+`
attribute vec4 iR0;attribute vec4 iR1;attribute vec4 iR2;attribute vec4 iC;attribute vec4 iU;attribute vec2 iS;
vec3 gW;vec3 gN;
void geomNV(){vec3 c0=vec3(iR0.x,iR1.x,iR2.x),c1=vec3(iR0.y,iR1.y,iR2.y),c2=vec3(iR0.z,iR1.z,iR2.z),tr=vec3(iR0.w,iR1.w,iR2.w);
 vec3 S=vec3(length(c0),length(c1),length(c2))+vec3(1e-6);float tp=1.0-iS.y*(position.y+0.5);vec2 tf=iS.y<0.0?vec2(tp,1.0):vec2(tp);
 vec3 hs=S*0.5;hs.xz*=tf;vec3 q=position*S;q.xz*=tf;float r=iS.x*min(min(hs.x,hs.y),hs.z);
 vec3 cc=clamp(q,-hs+r,hs-r);vec3 d=q-cc;float dl=length(d);vec3 n=normal;vec3 ps=q;if(r>1e-5&&dl>1e-6){n=d/dl;ps=cc+n*r;}
 gW=(c0/S.x)*ps.x+(c1/S.y)*ps.y+(c2/S.z)*ps.z+tr;gN=nvN((c0/S.x)*n.x+(c1/S.y)*n.y+(c2/S.z)*n.z);}`;
const SKIN=NB=>NVN+`
attribute vec4 aBi;attribute vec4 aBw;uniform mat4 uB[${NB}];
mat4 boneNV(){return uB[int(aBi.x)]*aBw.x+uB[int(aBi.y)]*aBw.y+uB[int(aBi.z)]*aBw.z+uB[int(aBi.w)]*aBw.w;}`;
/* the atlas cell the game draws see-through (glass, light cones): renderer.js GLASS, the same test its own shader uses */
const GL_=typeof GLASS!=='undefined'?GLASS:[['0.25','0.3125'],['0.125','0.1875']];
/* atlas alpha doubles as a material id in the game: <0.84 wet, <0.9 shiny, else matte */
const ROUGH=`float roughnessFactor=roughness;{float ta=texture2D(map,vMapUv).a;if(ta<0.84)roughnessFactor=0.2;else if(ta<0.9)roughnessFactor=0.34;}`;

export function create(N,oldGL){
 const oldCanvas=oldGL.canvas;
 const canvas=document.createElement('canvas');canvas.id='glnext';canvas.style.display='none';oldCanvas.after(canvas);
 /* a phone can drop this second WebGL context at any time: hand the frame back to the classic renderer for good */
 canvas.addEventListener('webglcontextlost',()=>{N.failed=true;N.live=false;show(false);console.warn('NVNEXT: graphics context lost, using the classic renderer');});
 const renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:false,powerPreference:'high-performance'});
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=LOOK.exposure;
 const scene=new THREE.Scene();scene.background=new THREE.Color();scene.fog=new THREE.Fog(0,10,30);
 const camera=new THREE.PerspectiveCamera(50,1,2,80);

 /* ---- lights ---- */
 const hemi=new THREE.HemisphereLight(0xffffff,0x221830,1);scene.add(hemi);
 const sun=new THREE.DirectionalLight(0xffffff,1);sun.castShadow=true;sun.shadow.mapSize.set(LOOK.shadowSize,LOOK.shadowSize);
 Object.assign(sun.shadow.camera,{left:-15,right:15,top:15,bottom:-15,near:1,far:70});sun.shadow.bias=-0.0008;sun.shadow.normalBias=0.035;sun.shadow.radius=3;scene.add(sun,sun.target);
 const points=[];for(let i=0;i<LOOK.maxLights;i++){const l=new THREE.PointLight(0xffffff,0,1,1.1);scene.add(l);points.push(l);}

 /* ---- ground under and around the level, so the world does not end in a void ---- */
 {const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#2a2140';x.fillRect(0,0,128,128);
  for(let i=0;i<900;i++){x.fillStyle=`rgba(${90+Math.random()*60|0},${70+Math.random()*40|0},${130+Math.random()*60|0},${0.05+Math.random()*0.1})`;x.fillRect(Math.random()*128,Math.random()*128,2,2);}
  x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=2;x.strokeRect(0,0,128,128);x.strokeRect(0,0,64,64);x.strokeRect(64,64,64,64);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(200,200);t.magFilter=THREE.NearestFilter;
  const g=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({map:t,roughness:0.5}));g.rotation.x=-Math.PI/2;g.position.y=-0.03;g.receiveShadow=true;g.name='ground';scene.add(g);N._ground=g;}

 /* ---- textures taken from the game ---- */
 const texCache=new WeakMap();
 function texOf(glTex,atlas){const r=N.tex.get(glTex);if(!r||!r.src)return null;let e=texCache.get(glTex);
  if(!e||e.src!==r.src){const t=new THREE.CanvasTexture(r.src);t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;if(atlas){t.magFilter=THREE.NearestFilter;}e={t,src:r.src,ver:r.ver};texCache.set(glTex,e);}
  else if(e.ver!==r.ver){e.ver=r.ver;e.t.needsUpdate=true;}
  return e.t;}

 /* ---- materials ---- */
 const uGlow={value:LOOK.glow};
 function batchMat(opts){const m=new THREE.MeshStandardMaterial(Object.assign({vertexColors:true,alphaTest:0.5,side:THREE.DoubleSide,roughness:0.82,metalness:0},opts));
  const glass=!!opts.transparent;
  m.onBeforeCompile=s=>{s.uniforms.uGlow=uGlow;
   s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying float vEm;')
    .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nvEm=dot(objectNormal,objectNormal)<0.01?1.0:0.0;if(vEm>0.5)objectNormal=vec3(0.0,1.0,0.0);')
    .replace('#include <color_vertex>','#include <color_vertex>\nvColor.rgb=pow(max(vColor.rgb,vec3(0.0)),vec3(2.2));');
   s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying float vEm;uniform float uGlow;')
    .replace('#include <roughnessmap_fragment>',ROUGH)
    .replace('#include <alphatest_fragment>','#include <alphatest_fragment>\n'+(glass?`diffuseColor.a=(vMapUv.x>${GL_[0][0]}&&vMapUv.x<${GL_[0][1]}&&vMapUv.y>${GL_[1][0]}&&vMapUv.y<${GL_[1][1]})?0.3:1.0;`:''))
    .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nif(vEm>0.5){totalEmissiveRadiance=diffuseColor.rgb*uGlow;diffuseColor.rgb=vec3(0.0);roughnessFactor=1.0;}')
    .replace('#include <dithering_fragment>',OUTGUARD);};
  m.customProgramCacheKey=()=>'nvbatch'+(glass?'g':'');return m;}
 function instPatch(s,lit){s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\n'+GEOM+(lit?'\nvarying vec4 vIC;':''));
  if(lit)s.vertexShader=s.vertexShader.replace('#include <beginnormal_vertex>','geomNV();vec3 objectNormal=gN;vIC=vec4(pow(max(iC.rgb,vec3(0.0)),vec3(2.2)),iC.w);')
   .replace('#include <begin_vertex>','vec3 transformed=gW;').replace('#include <uv_vertex>','#include <uv_vertex>\nvMapUv=mix(iU.xy,iU.zw,uv);');
  else s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','geomNV();vec3 transformed=gW;');}
 function instMat(){const m=new THREE.MeshStandardMaterial({alphaTest:0.5,roughness:0.6,metalness:0,side:THREE.DoubleSide});
  m.onBeforeCompile=s=>{s.uniforms.uGlow=uGlow;instPatch(s,true);
   s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec4 vIC;uniform float uGlow;')
    .replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=vIC.rgb;')
    .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nif(vIC.w>0.5){totalEmissiveRadiance=diffuseColor.rgb*uGlow;diffuseColor.rgb=vec3(0.0);}')
    .replace('#include <dithering_fragment>',OUTGUARD);};
  m.customProgramCacheKey=()=>'nvinst';return m;}
 function instDepth(){const m=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});m.onBeforeCompile=s=>instPatch(s,false);m.customProgramCacheKey=()=>'nvinstd';return m;}
 function skinMats(NB){const uB={value:null};
  const m=new THREE.MeshStandardMaterial({roughness:0.62,metalness:0,side:THREE.DoubleSide});
  m.onBeforeCompile=s=>{s.uniforms.uB=uB;s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\n'+SKIN(NB))
   .replace('#include <beginnormal_vertex>','mat4 MB=boneNV();vec3 objectNormal=nvN((MB*vec4(normal,0.0)).xyz);')
   .replace('#include <begin_vertex>','vec3 transformed=(MB*vec4(position,1.0)).xyz;');
   s.fragmentShader=s.fragmentShader.replace('#include <dithering_fragment>',OUTGUARD);};
  m.customProgramCacheKey=()=>'nvskin'+NB;
  const d=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});
  d.onBeforeCompile=s=>{s.uniforms.uB=uB;s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\n'+SKIN(NB)).replace('#include <begin_vertex>','vec3 transformed=(boneNV()*vec4(position,1.0)).xyz;');};
  d.customProgramCacheKey=()=>'nvskind'+NB;return{m,d,uB};}

 /* the game's buffers are bigger than what is drawn, so never let Three measure them */
 const BIG=new THREE.Sphere(new THREE.Vector3(),1e6);
 /* ---- game Batch (12 floats per vertex, renderer.js VSTRIDE: pos, normal, uv, colour, then 4 packed bytes Three does not read) -> Three mesh, zero copy ---- */
 function batchMesh(mat,opts={}){const mesh=new THREE.Mesh(new THREE.BufferGeometry(),mat);mesh.geometry.boundingSphere=BIG;mesh.frustumCulled=false;mesh.castShadow=!!opts.cast;mesh.receiveShadow=opts.receive!==false;
  if(opts.order!==undefined)mesh.renderOrder=opts.order;mesh.userData={arr:null,ib:null,ver:-1};scene.add(mesh);return mesh;}
 function syncBatch(mesh,B,isStatic){const u=mesh.userData;if(!B||!B.n){mesh.visible=false;return;}mesh.visible=true;
  if(u.arr!==B.f){mesh.geometry.dispose();const g=new THREE.BufferGeometry(),ib=new THREE.InterleavedBuffer(B.f,12);ib.setUsage(isStatic?THREE.StaticDrawUsage:THREE.DynamicDrawUsage);
   g.setAttribute('position',new THREE.InterleavedBufferAttribute(ib,3,0));g.setAttribute('normal',new THREE.InterleavedBufferAttribute(ib,3,3));
   g.setAttribute('uv',new THREE.InterleavedBufferAttribute(ib,2,6));g.setAttribute('color',new THREE.InterleavedBufferAttribute(ib,3,8));g.boundingSphere=BIG;mesh.geometry=g;u.arr=B.f;u.ib=ib;u.ver=-1;}
  if(isStatic){const r=N.buf.get(B.buf),v=r?r.ver:0;if(v!==u.ver){u.ver=v;u.ib.needsUpdate=true;}}
  else{u.ib.clearUpdateRanges();u.ib.addUpdateRange(0,B.n*12);u.ib.needsUpdate=true;}
  mesh.geometry.setDrawRange(0,B.n);}

 /* ---- game InstBatch (24 floats per rounded box) -> instanced mesh ---- */
 function template(Nn){const v=[],n=[],t=[],ix=[];const F=[[0,1,2,1],[0,1,2,-1],[1,2,0,1],[1,2,0,-1],[2,0,1,1],[2,0,1,-1]];
  for(const [ax,ua,va,sg] of F){const b=v.length/3;for(let j=0;j<=Nn;j++)for(let i=0;i<=Nn;i++){const u=i/Nn,w=j/Nn,p=[0,0,0],q=[0,0,0];p[ax]=0.5*sg;p[ua]=(u-0.5)*sg;p[va]=w-0.5;q[ax]=sg;v.push(...p);n.push(...q);t.push(u,w);}
   for(let j=0;j<Nn;j++)for(let i=0;i<Nn;i++){const a=b+j*(Nn+1)+i,c=a+Nn+1;ix.push(a,a+1,c+1,a,c+1,c);}}return{v,n,t,ix};}
 function instMesh(Nn){const mesh=new THREE.Mesh(new THREE.InstancedBufferGeometry(),instMat());mesh.geometry.boundingSphere=BIG;mesh.customDepthMaterial=instDepth();mesh.frustumCulled=false;mesh.castShadow=mesh.receiveShadow=true;mesh.userData={arr:null,ib:null,tpl:template(Nn)};scene.add(mesh);return mesh;}
 function syncInst(mesh,B){const u=mesh.userData;if(!B||!B.n){mesh.visible=false;return;}mesh.visible=true;
  if(u.arr!==B.f){mesh.geometry.dispose();const g=new THREE.InstancedBufferGeometry(),T=u.tpl;g.setAttribute('position',new THREE.Float32BufferAttribute(T.v,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(T.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(T.t,2));g.setIndex(T.ix);
   const ib=new THREE.InstancedInterleavedBuffer(B.f,24,1);ib.setUsage(THREE.DynamicDrawUsage);const at=(nm,sz,off)=>g.setAttribute(nm,new THREE.InterleavedBufferAttribute(ib,sz,off));
   at('iR0',4,0);at('iR1',4,4);at('iR2',4,8);at('iC',4,12);at('iU',4,16);at('iS',2,20);g.boundingSphere=BIG;mesh.geometry=g;u.arr=B.f;u.ib=ib;}
  u.ib.clearUpdateRanges();u.ib.addUpdateRange(0,B.n*24);u.ib.needsUpdate=true;mesh.geometry.instanceCount=B.n;}

 /* ---- skinned characters: the game's own models, textures and bone matrices ---- */
 const charGeo=new WeakMap(),charPool=[];
 function geoOf(mm){let g=charGeo.get(mm);if(g)return g;const d=k=>{const r=N.buf.get(mm[k]);return r&&r.data;};const p=d('p'),n=d('n'),t=d('t'),bi=d('bi'),bw=d('bw'),ix=d('i');if(!p||!n||!t||!bi||!bw||!ix)return null;
  g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('normal',new THREE.BufferAttribute(n,3));g.setAttribute('uv',new THREE.BufferAttribute(t,2));
  g.setAttribute('aBi',new THREE.BufferAttribute(bi,4));g.setAttribute('aBw',new THREE.BufferAttribute(bw,4));g.setIndex(new THREE.BufferAttribute(ix,1));g.boundingSphere=BIG;charGeo.set(mm,g);return g;}
 function syncChars(){let k=0;const M=N.models;
  if(M)for(const q of N.chars){const parts=M[q.id];if(!parts)continue;const NB=q.B.length/16;
   for(const mm of parts){const g=geoOf(mm),tx=texOf(mm.tex,false);if(!g||!tx)continue;let s=charPool[k];
    if(!s||s.NB!==NB){const mats=skinMats(NB),mesh=new THREE.Mesh(g,mats.m);mesh.customDepthMaterial=mats.d;mesh.frustumCulled=false;mesh.castShadow=mesh.receiveShadow=true;scene.add(mesh);if(s)scene.remove(s.mesh);s=charPool[k]={mesh,mats,NB};}
    s.mesh.geometry=g;if(s.mats.m.map!==tx){const had=!!s.mats.m.map;s.mats.m.map=tx;if(!had)s.mats.m.needsUpdate=true;}s.mats.uB.value=q.B;s.mesh.visible=true;k++;}}
  for(;k<charPool.length;k++)charPool[k].mesh.visible=false;}

 const mStatic=batchMesh(batchMat({}),{cast:true});
 const mDecal=batchMesh(batchMat({depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}),{order:1});
 const mPool=batchMesh(batchMat({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}),{order:2});
 const mDyn=batchMesh(batchMat({}),{cast:true,order:3});
 const mOver=batchMesh(batchMat({depthTest:false,depthWrite:false,transparent:true}),{order:10,receive:false});
 const mHi=instMesh(3),mLo=instMesh(1);

 /* ---- post-processing: HDR bloom -> tonemap -> film ---- */
 const composer=new EffectComposer(renderer,new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:window.QLOCK>=2?0:4}));
 composer.addPass(new RenderPass(scene,camera));
 const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),LOOK.bloom.strength,LOOK.bloom.radius,LOOK.bloom.threshold);composer.addPass(bloom);
 composer.addPass(new OutputPass());
 const film=new ShaderPass({uniforms:{tDiffuse:{value:null},t:{value:0},grain:{value:0.35},flash:{value:new THREE.Vector4()}},
  vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform sampler2D tDiffuse;uniform float t;uniform float grain;uniform vec4 flash;varying vec2 v;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+t)*43758.5453);}
  void main(){vec2 d=v-0.5;float r2=dot(d,d);vec2 o=d*r2*0.004;vec3 c=vec3(texture2D(tDiffuse,v+o).r,texture2D(tDiffuse,v).g,texture2D(tDiffuse,v-o).b);
   float l=dot(c,vec3(0.299,0.587,0.114));c=mix(vec3(l),c,1.1);c*=mix(vec3(0.94,0.96,1.08),vec3(1.05,1.0,0.95),smoothstep(0.0,0.7,l));
   c*=1.0-r2*0.75;c+=(h(v*900.0)-0.5)*0.08*grain;c=mix(c,flash.rgb,flash.a);gl_FragColor=vec4(c,1.0);}`});composer.addPass(film);

 /* ---- sizing and quality. Levels: 0 full, 1 lower resolution, 2 no shadows, 3 no bloom and half resolution.
    Automatic by frame time, or forced by window.QLOCK (the same switch the classic renderer and the tests use). ---- */
 const SCALE=[1,0.8,0.7,0.5];let W=0,H=0,pr=0,q=-1,ema=16,slowT=0,last=performance.now();
 function setQ(n){n=Math.max(0,Math.min(3,n|0));if(n===q)return;q=n;sun.castShadow=q<2;bloom.enabled=q<3;}
 function resize(){const want=Math.min(devicePixelRatio||1,LOOK.pixelRatioMax)*SCALE[q];if(innerWidth===W&&innerHeight===H&&want===pr)return;W=innerWidth;H=innerHeight;pr=want;
  renderer.setPixelRatio(pr);renderer.setSize(W,H,false);composer.setPixelRatio(pr);composer.setSize(W,H);camera.aspect=W/H;}
 function quality(){if(window.QLOCK!==undefined){setQ(window.QLOCK);return;}if(q<0)setQ(0);const now=performance.now(),dt=now-last;last=now;if(dt>250)return;ema=ema*0.95+dt*0.05;
  if(ema>24){slowT+=dt;if(slowT>2500&&q<3){setQ(q+1);slowT=0;}}else if(ema<14){slowT-=dt;if(slowT<-8000&&q>0){setQ(q-1);slowT=0;}}else slowT*=0.98;}

 /* ---- warm-up: the first gameplay frame only hands the level to Three and asks the driver to build every
    shader in the background (KHR_parallel_shader_compile). The classic renderer keeps drawing until that is
    done, so the switch to the new renderer does not freeze the game. Programs are built for the HDR target
    the scene is really drawn into, otherwise Three would build them a second time on the first frame. ---- */
 let warm=0;
 function warmUp(){warm=1;N.warming=true;N.live=false;show(false);const t0=performance.now();let p;
  try{renderer.setRenderTarget(composer.readBuffer);if(renderer.extensions.has('KHR_parallel_shader_compile'))p=renderer.compileAsync(scene,camera);else{renderer.compile(scene,camera);p=Promise.resolve();}}catch(e){p=Promise.resolve();}renderer.setRenderTarget(null);
  const done=()=>{if(warm===2)return;warm=2;N.warming=false;N.warmMs=Math.round(performance.now()-t0);N.warmPrograms=renderer.info.programs?renderer.info.programs.length:0;};
  p.then(done,done);setTimeout(done,8000);}

 const V=new THREE.Vector3();
 function draw(o){quality();resize();const G=o.G;
  camera.fov=o.fovy*180/Math.PI;camera.near=G.cine?0.3:1;camera.far=G.cine?150:90;camera.position.set(o.eye[0],o.eye[1],o.eye[2]);camera.up.set(0,1,0);camera.lookAt(o.tgt[0],o.tgt[1],o.tgt[2]);camera.updateProjectionMatrix();
  scene.background.setRGB(o.fogC[0],o.fogC[1],o.fogC[2],THREE.SRGBColorSpace);scene.fog.color.copy(scene.background);scene.fog.near=o.fog[0];scene.fog.far=o.fog[1]*1.1;
  hemi.color.setRGB(o.amb[0],o.amb[1],o.amb[2]);hemi.groundColor.copy(hemi.color).multiplyScalar(0.6);hemi.intensity=LOOK.ambient;
  sun.color.setRGB(o.lc[0],o.lc[1],o.lc[2]);sun.intensity=LOOK.sun;
  {const s=30/sun.shadow.mapSize.x*4,tx=Math.round(o.tgt[0]/s)*s,tz=Math.round(o.tgt[2]/s)*s;sun.target.position.set(tx,0,tz);sun.position.set(tx-o.ld[0]*30,-o.ld[1]*30,tz-o.ld[2]*30);}
  const ls=o.lights||[];for(let i=0;i<points.length;i++){const p=points[i],l=ls[i];if(!l){p.intensity=0;continue;}p.position.set(l.x,l.y,l.z);p.color.setRGB(Math.min(l.c[0],1),Math.min(l.c[1],1),Math.min(l.c[2],1),THREE.SRGBColorSpace);
   p.intensity=LOOK.pointLight*Math.max(1,l.c[0],l.c[1],l.c[2]);p.distance=l.r*1.35;}
  const atlas=texOf(o.atlasTex,true);if(!atlas)return;for(const m of [mStatic,mDecal,mPool,mDyn,mOver,mHi,mLo])if(m.material.map!==atlas){m.material.map=atlas;m.material.needsUpdate=true;}
  syncBatch(mStatic,G.staticB,true);syncBatch(mDecal,G.decalB,true);syncBatch(mPool,o.poolB,false);syncBatch(mDyn,o.dynB,false);syncBatch(mOver,o.ovB,false);
  syncInst(mHi,o.IBhi);syncInst(mLo,o.IBlo);syncChars();
  N._ground.position.x=Math.round(o.tgt[0]/2)*2;N._ground.position.z=Math.round(o.tgt[2]/2)*2;
  film.uniforms.t.value=o.time%10;film.uniforms.grain.value=o.grain||0;const fl=Math.min(Math.max(G.flash||0,0),0.7),fc=G.flashC||[0,0,0];film.uniforms.flash.value.set(fc[0],fc[1],fc[2],fl);
  if(!warm){warmUp();return;}
  composer.render();N.frames=(N.frames||0)+1;}
 function show(live){canvas.style.display=live?'block':'none';oldCanvas.style.visibility=live?'hidden':'';}
 return{draw,show,LOOK,scene,camera,renderer,bloom,get quality(){return q;}};
}
