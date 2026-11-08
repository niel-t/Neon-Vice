'use strict';
/* ================= GL ================= */
const cv=$('gl'), hud=$('hud'), hctx=hud.getContext('2d');
const gl=cv.getContext('webgl',{antialias:false,alpha:false,depth:true});
let contextLost=false;
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;suspendInputs();if(master)master.gain.value=0;if(musTimer)clearInterval(musTimer);
 for(const element of document.body.children)if(element.id!=='contextWarning')element.inert=true;
 $('contextWarning').style.display='flex';$('bContextReload').focus();});
cv.addEventListener('webglcontextrestored',()=>{$('contextMessage').textContent='Graphics are available again. Reload to rebuild the scene and continue.';});
const EXT_I=gl&&gl.getExtension('ANGLE_instanced_arrays'),EXT_D=gl&&gl.getExtension('OES_standard_derivatives');
if(!gl){$('err').classList.add('on');$('sTitle').classList.remove('on');throw new Error('no webgl');}
function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
function prog(vs,fs){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;}
const NL=8;
/* atlas layout (see makeAtlas): 1024², 16×16 cells, quadrant-major tile ids */
const ATLAS=1024,ACELLS=16,TCELL=t=>{const q=t>>6,k=t&63;return[(k&7)+8*(q&1),(k>>3)+8*(q>>1)];};
const GLASS=TCELL(20).map(v=>[(v/ACELLS).toFixed(6),((v+1)/ACELLS).toFixed(6)]);
const VS=`
attribute vec3 aP;attribute vec3 aN;attribute vec2 aT;attribute vec3 aC;attribute vec4 aS;
uniform mat4 uVP;uniform vec2 uRes;uniform vec3 uLD;uniform vec3 uLC;uniform vec3 uAmb;uniform float uPix;
uniform vec4 uPL[${NL}];uniform vec3 uPC[${NL}];uniform vec3 uCam;uniform vec2 uFog;
varying vec3 vC;varying vec3 vT;varying float vF;varying vec3 vW;varying vec3 vN;varying float vE;varying vec4 vS;
void main(){
 float bid=floor(aS.x*255.0+0.5),bq=floor(bid/64.0),bk=bid-bq*64.0;
 vec2 bc=vec2(mod(bk,8.0)+8.0*mod(bq,2.0),floor(bk/8.0)+8.0*floor(bq/2.0));
 vS=vec4((bc-floor(aT*${ACELLS}.0))/${ACELLS}.0,aS.y,floor(aS.z*255.0+0.5));
 vec4 p=uVP*vec4(aP,1.0);
 if(uPix<0.5){vec2 s=uRes*0.5;p.xy=floor(p.xy/p.w*s+0.5)/s*p.w;}
 gl_Position=p;
 float nl=dot(aN,aN);vE=nl>0.01?0.0:1.0;vN=nl>0.01?aN*inversesqrt(nl):vec3(0.0,1.0,0.0);vW=aP;
 vec3 l=vec3(1.0);
 if(nl>0.01&&uPix<0.5){
  vec3 n=vN;l=uAmb+uLC*max(dot(n,-uLD),0.0);
  for(int i=0;i<${NL};i++){vec3 d=uPL[i].xyz-aP;float dist=length(d);float a=clamp(1.0-dist/max(uPL[i].w,0.001),0.0,1.0);l+=uPC[i]*a*a*max(dot(n,d/max(dist,0.001))*0.6+0.4,0.0);}
 }
 vC=aC*l;
 vT=uPix<0.5?vec3(aT*p.w,p.w):vec3(aT,1.0);
 vF=clamp((length(aP-uCam)-uFog.x)/(uFog.y-uFog.x),0.0,1.0);
}`;
const FS=(EXT_D?'#extension GL_OES_standard_derivatives : enable\n#define HAS_D 1\n':'')+`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex;uniform vec3 uFogC;uniform float uPix;uniform vec3 uLD;uniform vec3 uLC;uniform vec3 uAmb;uniform vec4 uPL[${NL}];uniform vec3 uPC[${NL}];uniform vec3 uCam;
uniform sampler2D uSh;uniform mat4 uLVP;uniform float uShOn;uniform float uHaze;uniform float uBump;uniform float uShL;uniform float uBlend;
varying vec3 vC;varying vec3 vT;varying float vF;varying vec3 vW;varying vec3 vN;varying float vE;varying vec4 vS;
float unpackD(vec4 c){return dot(c,vec4(1.0,1.0/255.0,1.0/65025.0,1.0/16581375.0));}
float shadowF(vec3 n){if(uShOn<0.5)return 1.0;vec4 lp=uLVP*vec4(vW+n*0.05,1.0);vec3 s=lp.xyz/lp.w*0.5+0.5;if(s.x<0.01||s.x>0.99||s.y<0.01||s.y>0.99||s.z>1.0)return 1.0;
 float sum=0.0;for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++){float d=unpackD(texture2D(uSh,s.xy+vec2(float(i),float(j))*0.0016));sum+=(s.z-0.004>d)?0.0:1.0;}return sum/9.0;}
void main(){float cA=1.0;vec2 uv=vT.xy/vT.z;if(uv.x>${GLASS[0][0]}&&uv.x<${GLASS[0][1]}&&uv.y>${GLASS[1][0]}&&uv.y<${GLASS[1][1]}){cA=0.3;}
 vec4 t=texture2D(uTex,uv);
 if(uBlend>0.5){vec4 tb=texture2D(uTex,uv+vS.xy);t=vec4(mix(t.rgb,tb.rgb,vS.z),vS.z<0.5?t.a:tb.a);}
 if(t.a<0.5)discard;vec3 col=t.rgb*vC;
 if(uPix>0.5&&vE<0.5){vec3 n0=normalize(vN),n=n0;
#ifdef HAS_D
  float h=dot(t.rgb,vec3(0.3,0.59,0.11));vec3 dpx=dFdx(vW),dpy=dFdy(vW);float dhx=dFdx(h),dhy=dFdy(h);vec3 r1=cross(dpy,n),r2=cross(n,dpx);float det=dot(dpx,r1);
  if(abs(det)>1e-8){vec3 gg=sign(det)*(dhx*r1+dhy*r2);n=normalize(abs(det)*n-gg*uBump);}
#endif
  float wet=1.0-step(0.84,t.a),shn=step(0.84,t.a)*(1.0-step(0.9,t.a));vec3 V=normalize(uCam-vW);float sh=shadowF(n0);
  vec3 l=uAmb*(0.75+0.25*sh)+uLC*max(dot(n,-uLD),0.0)*sh;vec3 sp=vec3(0.0);float gls=n0.y>0.9?1.0:0.25;
  for(int i=0;i<${NL};i++){vec3 d=uPL[i].xyz-vW;float dist=length(d);vec3 L=d/max(dist,0.001);float a=clamp(1.0-dist/max(uPL[i].w,0.001),0.0,1.0);a*=a;if(abs(float(i)-uShL)<0.5)a*=sh;l+=uPC[i]*a*max(dot(n,L)*0.75+0.25,0.0);vec3 hv=normalize(L+V);float nh=max(dot(n,hv),0.0);sp+=uPC[i]*a*(pow(nh,48.0)*gls*0.35+wet*pow(nh,22.0)*0.9+shn*pow(nh,24.0)*1.4);}
  float rim=pow(1.0-max(dot(n0,V),0.0),3.0)*(n0.y<0.6?0.35:0.0);
  col=col*l*(1.0-wet*0.45)+sp+rim*col*0.6;}
 if(uHaze>0.0){vec3 rd=vW-uCam;float Lr=length(rd);rd/=Lr;vec3 hz=vec3(0.0);for(int i=0;i<${NL};i++){if(uPL[i].w<5.2)continue;vec3 lc=uPL[i].xyz-uCam;float tt=clamp(dot(lc,rd),0.0,Lr);float d=length(lc-rd*tt);hz+=uPC[i]*exp(-d*d*5.0);}col+=hz*uHaze;}
 gl_FragColor=vec4(mix(col,uFogC,vF),cA);}`;
const BRFS=`precision mediump float;uniform sampler2D uS;varying vec2 vU;void main(){vec3 c=texture2D(uS,vU).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(0.6,1.0,l)*1.3,1.0);}`;
const BLFS=`precision mediump float;uniform sampler2D uS;uniform vec2 uD;varying vec2 vU;void main(){vec3 c=texture2D(uS,vU).rgb*0.227;c+=texture2D(uS,vU+uD*1.385).rgb*0.316;c+=texture2D(uS,vU-uD*1.385).rgb*0.316;c+=texture2D(uS,vU+uD*3.23).rgb*0.07;c+=texture2D(uS,vU-uD*3.23).rgb*0.07;gl_FragColor=vec4(c,1.0);}`;
const PVS=`attribute vec2 aQ;varying vec2 vU;void main(){vU=aQ*0.5+0.5;gl_Position=vec4(aQ,0.0,1.0);}`;
const PFS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uS;uniform sampler2D uB;uniform float uBloom;uniform float uEnh;uniform vec2 uRes;uniform vec4 uFlash;uniform float uDith;uniform float uVHS;uniform float uTime;uniform float uGrain;uniform float uGlitch;varying vec2 vU;
float b2(vec2 a){a=floor(a);return fract(dot(a,vec2(0.5,a.y*0.75)));}
float b4(vec2 a){return b2(0.5*a)*0.25+b2(a);}
float hs(vec2 p){p=fract(mod(p,256.0)*vec2(0.1031,0.1030));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
void main(){vec2 px=floor(vU*uRes);vec2 uv=uEnh>0.5?vU:(px+0.5)/uRes;
 float band=step(0.996,hs(vec2(floor(vU.y*40.0),floor(mod(uTime,60.0)*8.0))));uv.x+=band*0.004*uGlitch;
 vec3 c;if(uVHS>0.0){float o=uVHS/uRes.x;c=vec3(texture2D(uS,uv+vec2(o,0.0)).r,texture2D(uS,uv).g,texture2D(uS,uv-vec2(o,0.0)).b);}else c=texture2D(uS,uv).rgb;
 c+=texture2D(uB,vU).rgb*uBloom;
 if(uEnh>0.5){c*=1.1;c=(c*(2.51*c+0.03))/(c*(2.43*c+0.59)+0.14);float lu=dot(c,vec3(0.299,0.587,0.114));c=mix(c*vec3(0.9,1.0,1.12),c*vec3(1.07,0.98,0.93),smoothstep(0.15,0.7,lu));c=mix(vec3(lu),c,1.15);}
 c=mix(c,uFlash.rgb,uFlash.a);
 if(uDith>0.5){float d=b4(px);c=floor(c*31.0+d)/31.0;}
 c*=1.0-uGrain*0.14*(0.5+0.5*sin(gl_FragCoord.y*3.14159));
 c+=(hs(gl_FragCoord.xy+floor(fract(uTime*7.0)*61.0)*17.0)-0.5)*0.06*uGrain;
 vec2 q=vU-0.5;c*=1.0-dot(q,q)*0.75;gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}`;
const P1=prog(VS,FS), P2=prog(PVS,PFS), P3=prog(PVS,BRFS), P4=prog(PVS,BLFS);
const L={};['aP','aN','aT','aC','aS'].forEach(n=>L[n]=gl.getAttribLocation(P1,n));
['uVP','uRes','uLD','uLC','uAmb','uPL','uPC','uCam','uFog','uTex','uFogC','uPix','uBlend'].forEach(n=>L[n]=gl.getUniformLocation(P1,n));
const L2={aQ:gl.getAttribLocation(P2,'aQ'),uS:gl.getUniformLocation(P2,'uS'),uRes:gl.getUniformLocation(P2,'uRes'),uFlash:gl.getUniformLocation(P2,'uFlash'),uDith:gl.getUniformLocation(P2,'uDith'),uVHS:gl.getUniformLocation(P2,'uVHS'),uTime:gl.getUniformLocation(P2,'uTime'),uB:gl.getUniformLocation(P2,'uB'),uBloom:gl.getUniformLocation(P2,'uBloom'),uEnh:gl.getUniformLocation(P2,'uEnh'),uGrain:gl.getUniformLocation(P2,'uGrain'),uGlitch:gl.getUniformLocation(P2,'uGlitch')};
const L3={aQ:gl.getAttribLocation(P3,'aQ'),uS:gl.getUniformLocation(P3,'uS')},L4={aQ:gl.getAttribLocation(P4,'aQ'),uS:gl.getUniformLocation(P4,'uS'),uD:gl.getUniformLocation(P4,'uD')};
const quadBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quadBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,-1,1,1,-1,1]),gl.STATIC_DRAW);

/* atlas */
let seed=1337;const srand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
/* 1024² atlas, 16×16 cells of 64px. Quadrant-major ids: legacy ids 0–63 are drawn on a 512² canvas exactly as before
   (Skia AA differs on larger canvases) and blitted 1:1 to the top-left quadrant; the other quadrants start as mirror
   copies so mip filtering at x/y=512 matches the old CLAMP_TO_EDGE. Tiles ≥64 are drawn afterwards (srand order). */
const ATILES=new Set();
function makeAtlas(){
 const c=document.createElement('canvas');c.width=c.height=512;let cv=c,x=c.getContext('2d'),LD0=null;ATILES.clear();
 const tile=(t,fn)=>{ATILES.add(t);const [cx,cy]=TCELL(t),X=t<64?c.getContext('2d'):x;X.save();X.translate(cx*64+2,cy*64+2);X.scale(60/32,60/32);X.beginPath();X.rect(0,0,32,32);X.clip();fn(X);X.restore();};
 const gutter=t=>{const [cx,cy]=TCELL(t),ox=cx*64,oy=cy*64;x.drawImage(cv,ox+2,oy,1,64,ox,oy,1,64);x.drawImage(cv,ox+2,oy,1,64,ox+1,oy,1,64);x.drawImage(cv,ox+61,oy,1,64,ox+62,oy,1,64);x.drawImage(cv,ox+61,oy,1,64,ox+63,oy,1,64);
  x.drawImage(cv,ox,oy+2,64,1,ox,oy,64,1);x.drawImage(cv,ox,oy+2,64,1,ox,oy+1,64,1);x.drawImage(cv,ox,oy+61,64,1,ox,oy+62,64,1);x.drawImage(cv,ox,oy+61,64,1,ox,oy+63,64,1);};
 const speck=(x,n,cols,w=1)=>{x.save();x.globalAlpha=0.45;for(let i=0;i<n;i++){x.fillStyle=cols[srand()*cols.length|0];x.fillRect(srand()*32,srand()*32,w+(srand()*2|0),w);}x.restore();};
 const blob=(x,cx,cy,r)=>{x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();};
 tile(0,x=>{x.fillStyle='#fff';x.fillRect(0,0,32,32);});
 tile(1,x=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#1d1a24':'#d9d4de';x.fillRect(i*16,j*16,16,16);}speck(x,70,['#8a8590','#2c2833','#b9b3bf','#494350']);});
 tile(2,x=>{x.fillStyle='#8e2a66';x.fillRect(0,0,32,32);for(let i=0;i<2;i++)for(let j=0;j<2;j++){x.fillStyle='#e0579f';x.fillRect(i*16+1,j*16+1,14,14);x.fillStyle='#f28cc4';x.fillRect(i*16+1,j*16+1,14,2);}speck(x,30,['#c94a8c','#ff9fd0']);});
 tile(3,x=>{x.fillStyle='#165a63';x.fillRect(0,0,32,32);x.fillStyle='#22808b';for(let i=0;i<4;i++)for(let j=0;j<4;j++){if((i+j)%2===0){x.beginPath();x.moveTo(i*8+4,j*8);x.lineTo(i*8+8,j*8+4);x.lineTo(i*8+4,j*8+8);x.lineTo(i*8,j*8+4);x.fill();}}speck(x,60,['#0f454c','#2a96a2']);});
 tile(4,x=>{const cols=['#7a4a2a','#6b3f22','#835333','#714527'];for(let r=0;r<4;r++){x.fillStyle=cols[r];x.fillRect(0,r*8,32,8);x.fillStyle='#3a2212';x.fillRect(0,r*8+7,32,1);x.fillRect((r*11)%32,r*8,1,8);}speck(x,40,['#5a3519','#94613d']);});
 tile(5,x=>{x.fillStyle='#e294bb';x.fillRect(0,0,32,32);speck(x,90,['#d482ad','#f0aed0','#c97aa3']);x.fillStyle='#2bb7b9';x.fillRect(0,26,32,6);x.fillStyle='#1d8a8c';x.fillRect(0,26,32,1);x.fillStyle='#fff0f7';x.fillRect(0,0,32,2);});
 tile(6,x=>{x.fillStyle='#2e2438';x.fillRect(0,0,32,32);x.fillStyle='#4b3b5b';for(let r=0;r<4;r++)for(let i=0;i<3;i++){x.fillRect(((r%2)*6+i*12)%32,r*8+1,10,6);}speck(x,40,['#3a2e47','#5c4a6e']);});
 tile(7,x=>{x.fillStyle='#2a2830';x.fillRect(0,0,32,32);speck(x,140,['#34323b','#1f1e24','#403d48']);});
 const red=['#8f0b10','#a80f15','#7a070b'];
 tile(8,x=>{x.fillStyle=red[0];blob(x,16,16,8.5);for(let i=0;i<14;i++){const a=srand()*TAU,d=4+srand()*9;x.fillStyle=red[i%3];blob(x,16+Math.cos(a)*d,16+Math.sin(a)*d,1.5+srand()*3.5);}for(let i=0;i<10;i++){const a=srand()*TAU,d=11+srand()*4;blob(x,16+Math.cos(a)*d,16+Math.sin(a)*d,0.9+srand());}});
 tile(9,x=>{for(let i=0;i<26;i++){const t=srand();x.fillStyle=red[i%3];blob(x,3+t*27,16+(srand()-0.5)*(4+t*18),(1-t)*4.5+0.9);}x.fillStyle=red[1];x.fillRect(2,14,22,3);});
 tile(10,x=>{for(let i=0;i<9;i++){x.fillStyle=red[i%3];blob(x,6+srand()*20,6+srand()*20,1.2+srand()*3);}});
 tile(11,x=>{x.fillStyle='#4f9a5c';x.fillRect(0,0,32,32);x.fillStyle='#d9efd2';x.fillRect(12,0,8,32);x.fillStyle='#2f6b3a';x.fillRect(2,4,6,24);x.fillRect(24,4,6,24);});
 tile(12,x=>{x.fillStyle='#38a3a6';x.fillRect(0,0,32,32);speck(x,90,['#2f9093','#4dbcbf','#2a8285']);x.fillStyle='#ff4fa6';x.fillRect(0,26,32,6);x.fillStyle='#c22f7d';x.fillRect(0,26,32,1);x.fillStyle='#d7fbfb';x.fillRect(0,0,32,2);});
 tile(13,x=>{x.fillStyle='#4e3022';x.fillRect(0,0,32,32);x.fillStyle='#5f3b2a';for(let i=0;i<4;i++)x.fillRect(i*8+1,3,6,20);x.fillStyle='#2a170e';x.fillRect(0,24,32,8);x.fillStyle='#c9a24a';x.fillRect(0,24,32,1);speck(x,30,['#3d2419','#6e4632']);});
 tile(14,x=>{x.fillStyle='#e8e4ea';x.fillRect(0,0,32,32);x.strokeStyle='#b9b1c2';x.beginPath();x.moveTo(0,8);x.bezierCurveTo(10,4,20,20,32,14);x.stroke();x.fillStyle='#c9c2cf';x.fillRect(0,15,32,1);x.fillRect(15,0,1,32);});
 /* 15: paisley shirt */
 tile(15,x=>{x.fillStyle='#6a4ca8';x.fillRect(0,0,32,32);for(let i=0;i<7;i++){const cx=srand()*32,cy=srand()*32;x.fillStyle='#d8c8f2';blob(x,cx,cy,2.6);x.fillStyle='#3b2770';blob(x,cx+1,cy+1,1.2);x.fillStyle='#e9b86a';x.fillRect(cx+2,cy-3,1,2);}speck(x,40,['#8f74cf','#4a3488']);});
 /* 16: stipple shadow */
 tile(16,x=>{for(let i=0;i<32;i++)for(let j=0;j<32;j++){const d=Math.hypot(i-15.5,j-15.5);if(d<15&&((i+j)%2===0||d<8))x.fillStyle='#000',x.fillRect(i,j,1,1);}});
 /* 17: felt */
 tile(17,x=>{x.fillStyle='#1c6b3a';x.fillRect(0,0,32,32);speck(x,60,['#17592f','#22803f']);});
 /* 18: sheets */
 tile(18,x=>{x.fillStyle='#ece8f0';x.fillRect(0,0,32,32);x.fillStyle='#d6cfe0';for(let i=0;i<4;i++)x.fillRect(0,i*8+3,32,1);});
 /* 19 rug */
 tile(19,x=>{x.fillStyle='#7a1622';x.fillRect(0,0,32,32);x.fillStyle='#d9a441';x.fillRect(1,1,30,2);x.fillRect(1,29,30,2);x.fillRect(1,1,2,30);x.fillRect(29,1,2,30);x.fillStyle='#2a0a12';for(let i=0;i<3;i++)for(let j=0;j<3;j++){x.beginPath();x.moveTo(8+i*8,5+j*8);x.lineTo(11+i*8,8+j*8);x.lineTo(8+i*8,11+j*8);x.lineTo(5+i*8,8+j*8);x.fill();}x.fillStyle='#e0b860';for(let i=0;i<3;i++)for(let j=0;j<3;j++)x.fillRect(7+i*8,7+j*8,2,2);});
 tile(20,x=>{x.fillStyle='#fff';x.fillRect(0,0,32,32);});
 tile(21,x=>{const gr=x.createLinearGradient(0,0,0,32);gr.addColorStop(0,'#0a0c2a');gr.addColorStop(1,'#3a1048');x.fillStyle=gr;x.fillRect(0,0,32,32);x.fillStyle='#e8e0f0';x.fillRect(24,4,3,3);
  for(let i=0;i<8;i++){const w=3+srand()*4,h=8+srand()*16,bx=i*4.2;x.fillStyle='#05060f';x.fillRect(bx,32-h,w,h);x.fillStyle='#ffd36b';for(let k=0;k<5;k++)if(srand()<0.6)x.fillRect(bx+1+(srand()*(w-1)|0),32-h+2+(srand()*(h-3)|0),1,1);}x.fillStyle='#1a1420';x.fillRect(15,0,2,32);x.fillRect(0,15,32,1);});
 tile(22,x=>{for(let i=0;i<8;i++){x.fillStyle=['#2a0a3a','#5a1a5a','#a02a6a','#e04a7a','#ff7a5a','#ffb04a','#ffd36b','#ffe8a0'][i];x.fillRect(0,i*4,32,4);}x.fillStyle='#ffd36b';x.beginPath();x.arc(16,22,8,0,TAU);x.fill();x.fillStyle='#e04a7a';for(let i=0;i<4;i++)x.fillRect(6,20+i*3,20,1);x.fillStyle='#120818';x.fillRect(0,27,32,5);x.fillRect(22,10,2,18);for(let i=0;i<5;i++){x.save();x.translate(23,10);x.rotate(i*1.25-2.5);x.fillRect(0,-1,9,2);x.restore();}});
 tile(23,x=>{x.fillStyle='#1a0830';x.fillRect(0,0,32,32);x.strokeStyle='#ff2d95';x.lineWidth=1;for(let i=0;i<6;i++){x.beginPath();x.moveTo(0,18+i*i*0.6);x.lineTo(32,18+i*i*0.6);x.stroke();}for(let i=-4;i<=4;i++){x.beginPath();x.moveTo(16,16);x.lineTo(16+i*8,32);x.stroke();}x.fillStyle='#2de2e6';x.beginPath();x.moveTo(2,17);x.lineTo(10,7);x.lineTo(16,13);x.lineTo(22,5);x.lineTo(30,17);x.fill();x.fillStyle='#fff';x.fillRect(3,2,26,2);});
 tile(24,x=>{x.fillStyle='#1f3a2a';x.fillRect(0,0,32,32);x.fillStyle='#3a6a4a';x.fillRect(0,18,32,14);x.fillStyle='#d9b060';x.beginPath();x.arc(22,10,4,0,TAU);x.fill();x.fillStyle='#14281c';x.beginPath();x.moveTo(0,20);x.lineTo(8,12);x.lineTo(14,18);x.lineTo(20,13);x.lineTo(32,21);x.lineTo(32,24);x.lineTo(0,24);x.fill();});
 tile(25,x=>{x.fillStyle='#050510';x.fillRect(0,0,32,32);const cs=['#ff3fa4','#2de2e6','#ffd36b','#7dff9a'];for(let r=0;r<3;r++)for(let i=0;i<5;i++){x.fillStyle=cs[r];x.fillRect(3+i*6,4+r*5,3,2);x.fillRect(4+i*6,6+r*5,1,1);}x.fillStyle='#fff';x.fillRect(14,26,4,2);x.fillRect(15,25,2,1);x.fillStyle='#ffd36b';x.fillRect(2,1,10,1);});
 tile(26,x=>{for(let i=0;i<32;i++)for(let j=0;j<32;j++){const v=90+srand()*120;x.fillStyle=`rgb(${v*0.6|0},${v*0.75|0},${v})`;x.fillRect(i,j,1,1);}x.fillStyle='rgba(0,0,0,.35)';for(let j=0;j<32;j+=2)x.fillRect(0,j,32,1);});
 tile(29,x=>{x.fillStyle='#d23a5a';x.fillRect(0,0,32,32);for(let i=0;i<6;i++){const cx=srand()*32,cy=srand()*32;x.fillStyle='#ffe9a8';for(let k=0;k<5;k++){const a=k*TAU/5;blob(x,cx+Math.cos(a)*2.4,cy+Math.sin(a)*2.4,1.6);}x.fillStyle='#ffb020';blob(x,cx,cy,1.2);}x.fillStyle='#2a8a4a';for(let i=0;i<7;i++)x.fillRect(srand()*32|0,srand()*32|0,4,2);});
 tile(30,x=>{x.fillStyle='#b8b8c2';x.fillRect(0,0,32,32);x.fillStyle='#ffffff';for(let i=0;i<32;i+=4)x.fillRect(i,0,1,32);});
 tile(31,x=>{x.fillStyle='#5a6a3a';x.fillRect(0,0,32,32);for(let i=0;i<14;i++){x.fillStyle=['#3a4a2a','#7a7a4a','#2a2a1a'][i%3];blob(x,srand()*32,srand()*32,2+srand()*4);}});
 tile(32,x=>{x.fillStyle='#ffffff';x.fillRect(0,0,32,32);x.strokeStyle='#2a4a6a';x.lineWidth=2;x.beginPath();x.moveTo(4,4);x.bezierCurveTo(20,0,8,18,26,14);x.stroke();x.beginPath();x.arc(12,24,5,0,TAU);x.stroke();x.fillStyle='#a02a3a';x.beginPath();x.moveTo(22,20);x.lineTo(28,24);x.lineTo(22,28);x.fill();x.fillStyle='#2a4a6a';x.fillRect(4,12,3,3);});
 tile(33,x=>{x.fillStyle='#ece4ea';x.fillRect(0,0,32,32);x.fillStyle='#d8ccd6';x.fillRect(0,0,32,2);x.fillRect(0,15,32,2);for(let r=0;r<2;r++)for(let i=0;i<4;i++){x.fillStyle=srand()<0.35?'#ffe08a':'#203050';x.fillRect(2+i*8,4+r*16,5,8);x.fillStyle='#ffffff';x.fillRect(2+i*8,4+r*16,5,1);}});
 tile(34,x=>{x.fillStyle='#4a4650';x.fillRect(0,0,32,32);speck(x,120,['#3a3640','#5a5660','#2e2a34']);x.fillStyle='#8a8894';x.fillRect(4,6,9,7);x.fillStyle='#6a6874';x.fillRect(5,7,7,2);x.fillStyle='#2a2830';x.fillRect(20,18,6,6);});
 tile(35,x=>{const gr=x.createLinearGradient(0,0,32,32);gr.addColorStop(0,'#1c4a86');gr.addColorStop(0.5,'#3a86c0');gr.addColorStop(1,'#1a3466');x.fillStyle=gr;x.fillRect(0,0,32,32);for(let i=0;i<4;i++)for(let j=0;j<4;j++)if(srand()<0.3){x.fillStyle='#ffe9a8';x.fillRect(i*8+1,j*8+1,6,6);}
  x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.moveTo(0,10);x.lineTo(10,0);x.lineTo(16,0);x.lineTo(0,16);x.fill();x.fillStyle='#d9b060';for(let i=0;i<32;i+=8){x.fillRect(i,0,1,32);x.fillRect(0,i,32,1);}});
 tile(36,x=>{x.fillStyle='#1a1820';x.fillRect(0,0,32,32);x.strokeStyle='#d9b060';x.lineWidth=2;x.beginPath();x.arc(16,16,11,0,TAU);x.stroke();x.fillStyle='#d9b060';x.fillRect(11,10,2,12);x.fillRect(19,10,2,12);x.fillRect(11,15,10,2);});
 tile(37,x=>{x.fillStyle='#cfc3cb';x.fillRect(0,0,32,32);speck(x,50,['#bfb3bb','#ddd3db']);x.fillStyle='#a99ca6';x.fillRect(0,15,32,1);x.fillRect(15,0,1,32);});
 tile(38,x=>{x.fillStyle='#e8d0a0';x.fillRect(0,0,32,32);speck(x,140,['#d8bc88','#f4e0b4','#c8ac78']);});
 tile(39,x=>{x.fillStyle='#0b3a6c';x.fillRect(0,0,32,32);for(let i=0;i<12;i++){x.fillStyle=i%3?'#2a78b4':'#8ad0f0';x.fillRect(srand()*28|0,srand()*32|0,4+srand()*6|0,1);}});
 tile(40,x=>{x.fillStyle='#b8902e';x.fillRect(0,0,32,32);x.fillStyle='#e0bc5a';x.fillRect(2,4,13,27);x.fillRect(17,4,13,27);x.fillStyle='#7a5a14';x.fillRect(15,4,2,28);x.fillStyle='#1a1418';x.fillRect(10,0,12,3);x.fillStyle='#ff4040';x.fillRect(14,1,4,1);});
 tile(41,x=>{x.fillStyle='#f1e8dc';x.fillRect(0,0,32,32);x.strokeStyle='#cdbca6';x.lineWidth=1;for(let i=0;i<3;i++){x.beginPath();x.moveTo(srand()*32,0);x.bezierCurveTo(srand()*32,10,srand()*32,22,srand()*32,32);x.stroke();}x.strokeStyle='#d9b060';x.beginPath();x.moveTo(0,srand()*32);x.lineTo(32,srand()*32);x.stroke();x.fillStyle='#e2d6c6';x.fillRect(0,31,32,1);x.fillRect(31,0,1,32);});
 tile(42,x=>{x.fillStyle='#0a1226';x.fillRect(0,0,32,32);for(let i=0;i<7;i++){const w=3+srand()*4,h=6+srand()*18;x.fillStyle='#050812';x.fillRect(i*4.6,32-h,w,h);x.fillStyle='#ffd36b';for(let k=0;k<4;k++)if(srand()<0.6)x.fillRect(i*4.6+1+(srand()*(w-1)|0),32-h+2+(srand()*(h-3)|0),1,1);}x.fillStyle='rgba(120,180,255,.15)';x.fillRect(0,0,32,12);x.fillStyle='#c9a24a';x.fillRect(0,0,2,32);x.fillRect(30,0,2,32);x.fillRect(0,0,32,2);});
 tile(43,x=>{x.fillStyle='#16141a';x.fillRect(0,0,32,32);x.strokeStyle='#34303c';for(let i=0;i<3;i++){x.beginPath();x.moveTo(0,srand()*32);x.bezierCurveTo(10,srand()*32,22,srand()*32,32,srand()*32);x.stroke();}x.fillStyle='#c9a24a';x.fillRect(0,0,32,1);x.fillRect(0,0,1,32);});
 tile(44,x=>{x.fillStyle='#ececec';x.fillRect(0,0,32,32);for(let j=0;j<32;j++)for(let i=0;i<32;i++){if((i+j)%4===0){x.fillStyle='#e2e2e2';x.fillRect(i,j,1,1);}else if((i+j)%4===2){x.fillStyle='#f2f2f2';x.fillRect(i,j,1,1);}}
  x.strokeStyle='rgba(170,170,170,.35)';x.lineWidth=1;for(let k=0;k<3;k++){x.beginPath();const y0=srand()*32;x.moveTo(0,y0);x.bezierCurveTo(10,y0+srand()*8-4,22,y0+srand()*8-4,32,y0+srand()*6-3);x.stroke();}});
 tile(45,x=>{x.fillStyle='#f0f0f0';x.fillRect(0,0,32,32);for(let k=0;k<26;k++){x.fillStyle=srand()<0.5?'rgba(220,205,205,.5)':'rgba(255,250,250,.5)';blob(x,srand()*32,srand()*32,1+srand()*3);}speck(x,40,['#e4e0e0','#f8f6f6']);});
 tile(46,x=>{x.fillStyle='#d2d2d6';x.fillRect(0,0,32,32);for(let j=0;j<32;j++){x.fillStyle=srand()<0.5?'#c2c2c8':'#e0e0e4';x.fillRect(0,j,32,1);}x.strokeStyle='#f4f4f8';for(let k=0;k<4;k++){x.beginPath();const a=srand()*32,b=srand()*32;x.moveTo(a,b);x.lineTo(a+6,b+2);x.stroke();}});
 tile(47,x=>{x.fillStyle='#3e4e60';const c=[[16,16,10],[10,13,6],[22,19,7],[15,23,6],[20,10,5]];for(const q of c)blob(x,q[0],q[1],q[2]+1);x.fillStyle='#151d2a';for(const q of c)blob(x,q[0],q[1],q[2]);x.fillStyle='#22324a';blob(x,13,13,3);});
 tile(49,x=>{const r=['#8f0b10','#a80f15','#6a050a'];x.fillStyle=r[0];blob(x,16,16,6);for(let i=0;i<12;i++){const a=srand()*TAU,L=7+srand()*8;x.strokeStyle=r[i%3];x.lineWidth=1+srand()*2;x.beginPath();x.moveTo(16,16);x.lineTo(16+Math.cos(a)*L,16+Math.sin(a)*L);x.stroke();x.fillStyle=r[i%3];blob(x,16+Math.cos(a)*(L+1.5),16+Math.sin(a)*(L+1.5),1+srand()*1.4);}});
 tile(50,x=>{const r=['#8f0b10','#a80f15','#6a050a'];for(let i=0;i<40;i++){const t=srand();x.fillStyle=r[i%3];blob(x,2+t*29,16+(srand()-0.5)*(3+t*16),Math.max(0.6,(1-t)*3.5));}x.fillStyle=r[1];x.beginPath();x.moveTo(1,13);x.lineTo(22,15.5);x.lineTo(1,19);x.fill();});
 tile(51,x=>{const r=['#8f0b10','#a80f15','#6a050a'];for(let i=0;i<28;i++){x.fillStyle=r[i%3];blob(x,4+srand()*24,4+srand()*24,0.6+srand()*1.8);}x.fillStyle=r[0];blob(x,16,16,3.5);});
 tile(52,x=>{x.fillStyle='#8f0b10';x.beginPath();x.moveTo(6,0);x.lineTo(26,0);x.lineTo(19,6);x.lineTo(17.5,26);x.lineTo(14.5,26);x.lineTo(13,6);x.closePath();x.fill();x.fillStyle='#a80f15';blob(x,16,28,3.2);x.fillStyle='#6a050a';x.fillRect(15,4,1,20);});
 tile(53,x=>{x.fillStyle='#8a5a32';x.fillRect(0,0,32,32);for(let r=0;r<4;r++){x.fillStyle=['#7a4e2a','#8e5e36','#80542e','#946238'][r];x.fillRect(3,3+r*6.5,26,6);x.fillStyle='#4a2c14';x.fillRect(3,8.5+r*6.5,26,0.8);}
  x.fillStyle='#3e2410';x.fillRect(0,0,32,3);x.fillRect(0,29,32,3);x.fillRect(0,0,3,32);x.fillRect(29,0,3,32);x.save();x.translate(16,16);x.rotate(0.78);x.fillRect(-22,-1.5,44,3);x.restore();
  x.fillStyle='#c8a070';for(const [a,b] of [[1,1],[29,2],[2,28],[28,29],[14,1],[30,15]])x.fillRect(a,b,2+srand()*2,1+srand()*2);x.fillStyle='rgba(20,10,5,.5)';x.font='bold 8px monospace';x.fillText('86',19,26);speck(x,40,['#6a4224','#9a6a42']);});
 tile(6,x=>{x.fillStyle='#3a2f3e';x.fillRect(0,0,32,32);for(let r=0;r<5;r++)for(let i=-1;i<3;i++){const ox=(r%2)*7+i*14,v=srand();x.fillStyle=v<0.3?'#5e4a62':v<0.6?'#544258':v<0.85?'#4a3a4e':'#66506a';x.fillRect(ox+1,r*6.4+1,12,5);x.fillStyle='rgba(255,255,255,.08)';x.fillRect(ox+1,r*6.4+1,12,1);}
  speck(x,70,['#2c2430','#605066','#463a4a']);x.fillStyle='rgba(10,5,15,.35)';x.fillRect(5,18,3,14);x.fillRect(24,10,2,22);});
 tile(5,x=>{x.fillStyle='#c97aa3';x.fillRect(0,0,32,26);for(let r=0;r<4;r++)for(let i=-1;i<3;i++){const ox=(r%2)*7+i*14,v=srand();x.fillStyle=v<0.3?'#e294bb':v<0.6?'#dc8cb4':v<0.85?'#e89cc2':'#d684ad';x.fillRect(ox+1,r*6.5+1,12,5.2);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(ox+1,r*6.5+1,12,1);}
  x.fillStyle='#2bb7b9';x.fillRect(0,26,32,6);x.fillStyle='#1d8a8c';x.fillRect(0,26,32,1);x.fillStyle='#fff0f7';x.fillRect(0,0,32,1);});
 tile(12,x=>{x.fillStyle='#2a8285';x.fillRect(0,0,32,26);for(let r=0;r<4;r++)for(let i=-1;i<3;i++){const ox=(r%2)*7+i*14,v=srand();x.fillStyle=v<0.3?'#38a3a6':v<0.6?'#33989b':v<0.85?'#42b0b3':'#2f8f92';x.fillRect(ox+1,r*6.5+1,12,5.2);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(ox+1,r*6.5+1,12,1);}
  x.fillStyle='#ff4fa6';x.fillRect(0,26,32,6);x.fillStyle='#c22f7d';x.fillRect(0,26,32,1);x.fillStyle='#d7fbfb';x.fillRect(0,0,32,1);});
 tile(54,x=>{const gr=x.createLinearGradient(0,0,0,32);gr.addColorStop(0,'#0e0626');gr.addColorStop(0.35,'#3a1458');gr.addColorStop(0.65,'#b23474');gr.addColorStop(0.9,'#ff7a5a');gr.addColorStop(1,'#ffb060');x.fillStyle=gr;x.fillRect(0,0,32,32);x.fillStyle='#fff';for(let i=0;i<10;i++)x.fillRect(srand()*32|0,srand()*9|0,1,1);});
 tile(55,x=>{const gr=x.createLinearGradient(0,0,0,32);gr.addColorStop(0,'#0a0c2a');gr.addColorStop(1,'#4a1458');x.fillStyle=gr;x.fillRect(0,0,32,32);x.fillStyle='#fff';for(let i=0;i<8;i++)x.fillRect(srand()*32|0,srand()*10|0,1,1);
  for(let i=0;i<10;i++){const w=2+srand()*3,h=6+srand()*14,bx=i*3.3;x.fillStyle='#07081a';x.fillRect(bx,32-h,w,h);x.fillStyle='#ffd36b';for(let k=0;k<4;k++)if(srand()<0.6)x.fillRect(bx+(srand()*w|0),32-h+2+(srand()*(h-3)|0),1,1);}});
 tile(44,x=>{x.fillStyle='#ececec';x.fillRect(0,0,32,32);x.strokeStyle='rgba(120,120,130,.07)';x.lineWidth=0.6;for(let k=-32;k<32;k+=1.5){x.beginPath();x.moveTo(k,0);x.lineTo(k+32,32);x.stroke();}
  x.filter='blur(1.4px)';x.lineCap='round';for(let k=0;k<3;k++){const x0=srand()*32;x.strokeStyle='rgba(140,140,150,.16)';x.lineWidth=2.2;x.beginPath();x.moveTo(x0,-2);x.bezierCurveTo(x0+6,10,x0-4,20,x0+3,34);x.stroke();x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=1.2;x.beginPath();x.moveTo(x0+2,-2);x.bezierCurveTo(x0+8,10,x0-2,20,x0+5,34);x.stroke();}x.filter='none';});
 tile(56,x=>{const gr=x.createLinearGradient(0,0,0,32);gr.addColorStop(0,'#ffffff');gr.addColorStop(0.45,'#f1f1f4');gr.addColorStop(0.5,'#fbfbfd');gr.addColorStop(1,'#dcdce2');x.fillStyle=gr;x.fillRect(0,0,32,32);});
 tile(57,x=>{const gr=x.createLinearGradient(0,0,0,32);gr.addColorStop(0,'#2a3350');gr.addColorStop(1,'#07090f');x.fillStyle=gr;x.fillRect(0,0,32,32);x.fillStyle='rgba(190,210,255,.16)';x.beginPath();x.moveTo(6,0);x.lineTo(13,0);x.lineTo(4,32);x.lineTo(-3,32);x.fill();x.beginPath();x.moveTo(17,0);x.lineTo(19,0);x.lineTo(10,32);x.lineTo(8,32);x.fill();});
 tile(58,x=>{const gr=x.createLinearGradient(0,0,0,32);gr.addColorStop(0,'#fbfcff');gr.addColorStop(0.3,'#a6acb8');gr.addColorStop(0.48,'#ffffff');gr.addColorStop(0.55,'#5d636e');gr.addColorStop(1,'#d9dde6');x.fillStyle=gr;x.fillRect(0,0,32,32);});
 tile(59,x=>{x.fillStyle='#17171a';x.fillRect(0,0,32,32);x.strokeStyle='#26262b';x.lineWidth=1.2;for(let k=-32;k<32;k+=4){x.beginPath();x.moveTo(k,0);x.lineTo(k+10,32);x.stroke();}});
 tile(60,x=>{x.fillStyle='#1c1e22';x.fillRect(0,0,32,32);for(let i=1;i<32;i+=3){const gr=x.createLinearGradient(i,0,i+2,0);gr.addColorStop(0,'#8a909a');gr.addColorStop(0.5,'#ffffff');gr.addColorStop(1,'#7a808a');x.fillStyle=gr;x.fillRect(i,0,2,32);}});
 for(const t of [5,12])tile(t,x=>{x.strokeStyle='rgba(60,30,50,.5)';x.lineWidth=1;x.beginPath();let px=srand()*32,py=0;x.moveTo(px,py);for(let k=0;k<6;k++){px+=srand()*8-4;py+=4+srand()*3;x.lineTo(px,py);}x.stroke();
  x.fillStyle='rgba(70,50,40,.18)';blob(x,srand()*32,10+srand()*12,4+srand()*4);x.fillStyle='rgba(40,30,30,.25)';x.fillRect(srand()*28,12,1,14);});
 tile(28,x=>{x.fillStyle='#200810';x.fillRect(0,0,32,32);const cs=['#e02a3a','#2a8ae0','#ffd36b','#2ae07a','#ff7a2a'];for(let r=0;r<5;r++)for(let i=0;i<5;i++){x.fillStyle=cs[(r+i)%5];x.fillRect(2+i*6,2+r*6,4,4);x.fillStyle='rgba(255,255,255,.5)';x.fillRect(2+i*6,2+r*6,1,4);}});
 /* safehouse surfaces: 27 motel linoleum, 48 motel wallpaper, 61 studio terrazzo, 62 studio stucco, 63 penthouse marble */
 tile(27,x=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#7a6c50':'#b2a88c';x.fillRect(i*16,j*16,16,16);}
  x.fillStyle='rgba(35,25,12,.5)';for(let i=0;i<=2;i++){x.fillRect(i*16-0.4,0,0.8,32);x.fillRect(0,i*16-0.4,32,0.8);}
  x.fillStyle='#3e2d1f';x.beginPath();x.moveTo(16.4,16.4);x.lineTo(21,16.4);x.lineTo(16.4,20);x.fill();
  x.filter='blur(2px)';x.fillStyle='rgba(75,48,18,.3)';blob(x,7,23,6);x.fillStyle='rgba(60,50,30,.22)';blob(x,25,6,5);x.filter='none';
  for(let i=0;i<2;i++){const cx=4+srand()*24,cy=4+srand()*24;x.fillStyle='rgba(70,45,20,.5)';blob(x,cx,cy,1.2);x.fillStyle='#160e06';blob(x,cx,cy,0.55);}
  x.strokeStyle='rgba(25,18,8,.6)';x.lineWidth=0.5;x.beginPath();x.moveTo(0,20);x.lineTo(5,19);x.lineTo(9,22);x.lineTo(13,21);x.stroke();
  x.strokeStyle='rgba(20,15,10,.25)';x.lineWidth=0.8;for(let i=0;i<4;i++){const a=srand()*32,b=srand()*32;x.beginPath();x.moveTo(a,b);x.lineTo(a+2+srand()*3,b+srand()*2-1);x.stroke();}
  speck(x,60,['#4a4230','#8a7c60','#a89c80']);});
 tile(48,x=>{x.fillStyle='#b39f63';x.fillRect(0,0,32,32);for(let i=0;i<32;i+=6){x.fillStyle='rgba(115,85,35,.38)';x.fillRect(i,0,2,27);x.fillStyle='rgba(255,240,190,.12)';x.fillRect(i+3.5,0,0.8,27);}
  x.fillStyle='rgba(120,95,45,.5)';for(let r=0;r<5;r++)for(let i=0;i<6;i++)x.fillRect(i*6+3+(r%2)*0.5,r*5+2,0.9,0.9);
  x.filter='blur(2px)';x.fillStyle='rgba(105,65,25,.5)';x.beginPath();x.ellipse(9,1,8,10,0,0,TAU);x.fill();x.fillStyle='rgba(85,50,20,.35)';x.beginPath();x.ellipse(25,0,5,14,0.2,0,TAU);x.fill();
  x.fillStyle='rgba(35,45,20,.55)';for(let i=0;i<7;i++)blob(x,srand()*32,24+srand()*3,1.5+srand()*2.5);x.filter='none';
  x.strokeStyle='rgba(90,55,20,.55)';x.lineWidth=0.6;x.beginPath();x.ellipse(9,1,8,10,0,0.2,Math.PI-0.2);x.stroke();
  x.strokeStyle='rgba(40,28,12,.7)';x.lineWidth=0.5;x.beginPath();x.moveTo(4,10);x.lineTo(6,14);x.lineTo(5,18);x.lineTo(8,22);x.stroke();
  x.fillStyle='#3e2d1c';x.fillRect(0,27,32,5);x.fillStyle='#5a4228';x.fillRect(0,27,32,1);x.fillStyle='rgba(15,10,5,.6)';x.fillRect(11,28,5,1);x.fillRect(24,29,3,1);
  speck(x,110,['#9c8a52','#c8b478','#7a6838','#5a4a28']);});
 tile(61,x=>{x.fillStyle='#e9dfe0';x.fillRect(0,0,32,32);x.fillStyle='#efaec4';x.beginPath();x.moveTo(16,1.5);x.lineTo(30.5,16);x.lineTo(16,30.5);x.lineTo(1.5,16);x.closePath();x.fill();
  x.strokeStyle='#ffffff';x.lineWidth=0.8;x.stroke();x.fillStyle='#f6cdda';x.beginPath();x.moveTo(16,8);x.lineTo(24,16);x.lineTo(16,24);x.lineTo(8,16);x.closePath();x.fill();
  x.fillStyle='#4cc9c6';for(const [a,b] of [[0,0],[32,0],[0,32],[32,32]]){x.beginPath();x.moveTo(a,b-3);x.lineTo(a+3,b);x.lineTo(a,b+3);x.lineTo(a-3,b);x.closePath();x.fill();}
  speck(x,40,['#ffffff','#f0d8e0','#e8e0e6']);const gr=x.createLinearGradient(0,0,32,32);gr.addColorStop(0,'rgba(255,255,255,.25)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);});
 tile(62,x=>{x.fillStyle='#f5c3cc';x.fillRect(0,0,32,32);speck(x,140,['#eeb2bf','#fbd5dc','#e7abb8']);
  x.fillStyle='#fffafc';x.fillRect(0,0,32,2.2);x.fillStyle='#34c3c1';x.fillRect(0,3,32,2.2);x.fillStyle='#fffafc';x.fillRect(0,6,32,1);x.fillStyle='#34c3c1';x.fillRect(0,8,32,0.8);x.fillStyle='#ff6fae';x.fillRect(0,9.6,32,0.5);
  for(let i=2;i<32;i+=8){x.fillStyle='rgba(255,255,255,.35)';x.fillRect(i,11,1,14);x.fillStyle='rgba(200,120,140,.25)';x.fillRect(i+1,11,0.6,14);}
  x.fillStyle='#fffafc';x.fillRect(0,26,32,6);x.fillStyle='#34c3c1';x.fillRect(0,26,32,1.2);x.fillStyle='#ddd6e2';x.fillRect(0,31,32,1);});
 tile(63,x=>{const gr=x.createLinearGradient(0,0,32,32);gr.addColorStop(0,'#f6f3ee');gr.addColorStop(1,'#e8e2da');x.fillStyle=gr;x.fillRect(0,0,32,32);
  x.filter='blur(1.1px)';x.lineCap='round';for(let k=0;k<3;k++){x.strokeStyle=k<1?'rgba(110,105,115,.32)':'rgba(150,140,140,.2)';x.lineWidth=k<1?1:0.5;x.beginPath();const y0=4+k*11+srand()*4;x.moveTo(-2,y0);x.bezierCurveTo(10,y0+srand()*10-5,20,y0+srand()*10-5,34,y0+srand()*8-4);x.stroke();}x.filter='none';
  x.strokeStyle='rgba(201,162,74,.6)';x.lineWidth=0.4;x.beginPath();x.moveTo(6,33);x.bezierCurveTo(11,22,9,14,19,7);x.lineTo(24,-1);x.stroke();
  x.fillStyle='#c9a24a';x.fillRect(0,0,32,0.8);x.fillRect(0,0,0.8,32);});
 {/* post-pass touches legacy ids only, which all live in the top-left 512² quadrant */const id=x.getImageData(0,0,512,512),D=id.data;LD0=D;const T=(t,fn)=>{const [cx,cy]=TCELL(t),ox=cx*64+2,oy=cy*64+2;for(let j=0;j<60;j++)for(let i=0;i<60;i++)fn(((oy+j)*512+ox+i)*4,i*32/60,j*32/60);};for(const t of [11,56,57,58,60])T(t,k=>{if(D[k+3]>128)D[k+3]=222;});
  for(const t of [8,9,10,47,49,50,51,52])T(t,k=>{if(D[k+3]>128)D[k+3]=210;});
  for(const t of [5,6,12,13,48,62])T(t,(k,i,j)=>{const g=j>20?(j-20)/11:0,nz=((i*73+j*151)%17)/17;const f=1-g*g*0.6-nz*g*0.15;D[k]*=f;D[k+1]*=f;D[k+2]*=f;});
  x.putImageData(id,0,0);}
 for(let t=0;t<64;t++)gutter(t);
 /* mirror source: the post-pass data with the same gutter copies done in JS (only feeds the mirror quadrants) */
 const gutD=(d,W,t)=>{const [cx,cy]=TCELL(t),ox=cx*64,oy=cy*64,px=(i,j)=>((oy+j)*W+ox+i)*4,cp=(a,b)=>{d[b]=d[a];d[b+1]=d[a+1];d[b+2]=d[a+2];d[b+3]=d[a+3];};
  for(let j=0;j<64;j++){cp(px(2,j),px(0,j));cp(px(2,j),px(1,j));cp(px(61,j),px(62,j));cp(px(61,j),px(63,j));}
  for(let i=0;i<64;i++){cp(px(i,2),px(i,0));cp(px(i,2),px(i,1));cp(px(i,61),px(i,62));cp(px(i,61),px(i,63));}};
 for(let t=0;t<64;t++)gutD(LD0,512,t);
 const o=new ImageData(ATLAS,ATLAS),d=o.data,M=ATLAS-1,s=LD0;
 for(let j=0;j<ATLAS;j++){const sj=j<512?j:M-j;for(let i=0;i<ATLAS;i++){const si=i<512?i:M-i,k=(j*ATLAS+i)*4,l=(sj*512+si)*4;d[k]=s[l];d[k+1]=s[l+1];d[k+2]=s[l+2];d[k+3]=s[l+3];}}
 const legacy=new Set(ATILES),A=document.createElement('canvas');A.width=A.height=ATLAS;const ax=A.getContext('2d',{willReadFrequently:true});ax.putImageData(o,0,0);cv=A;x=ax;
 /* tiles ≥64 (W13b+) go here */
 for(const t of ATILES)if(!legacy.has(t)){gutter(t);const [cx,cy]=TCELL(t),n=ax.getImageData(cx*64,cy*64,64,64).data;for(let j=0;j<64;j++)d.set(n.subarray(j*256,j*256+256),((cy*64+j)*ATLAS+cx*64)*4);}
 /* the legacy canvas is uploaded over the top-left quadrant exactly as the old 512 atlas was (a canvas readback round
    trip would shift translucent texels by ±1) */
 return{img:o,legacy:c};
}
const atlasTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,atlasTex);
{const a=makeAtlas();gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,a.img);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,a.legacy);gl.generateMipmap(gl.TEXTURE_2D);}
function setAtlasFilter(sm){gl.bindTexture(gl.TEXTURE_2D,atlasTex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,sm?gl.LINEAR_MIPMAP_LINEAR:gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,sm?gl.LINEAR:gl.NEAREST);}
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
const TUV=[];for(let t=0;t<256;t++){const [tx,ty]=TCELL(t),e=2.5/ATLAS;TUV.push([tx/ACELLS+e,ty/ACELLS+e,(tx+1)/ACELLS-e,(ty+1)/ACELLS-e]);}
const WUV=[0.03*512/ATLAS,0.03*512/ATLAS,0.09*512/ATLAS,0.09*512/ATLAS];

/* render target */
let rt=null,rtW=0,rtH=0;
function setRT(w,h){if(w===rtW&&h===rtH)return;rtW=w;rtH=h;if(!rt){rt={fb:gl.createFramebuffer(),tex:gl.createTexture(),rb:gl.createRenderbuffer()};}
 gl.bindTexture(gl.TEXTURE_2D,rt.tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.bindRenderbuffer(gl.RENDERBUFFER,rt.rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);
 gl.bindFramebuffer(gl.FRAMEBUFFER,rt.fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,rt.tex,0);
 gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rt.rb);gl.bindFramebuffer(gl.FRAMEBUFFER,null);}

let bloomA=null,bloomB=null,blW=0,blH=0,rtFilt=-1;
function mkTarget(w,h){const t={fb:gl.createFramebuffer(),tex:gl.createTexture()};gl.bindTexture(gl.TEXTURE_2D,t.tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
 gl.bindFramebuffer(gl.FRAMEBUFFER,t.fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t.tex,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return t;}
function setBloom(w,h){w=Math.max(8,w>>2);h=Math.max(8,h>>2);if(w===blW&&h===blH)return;blW=w;blH=h;for(const target of [bloomA,bloomB])if(target){gl.deleteTexture(target.tex);gl.deleteFramebuffer(target.fb);}bloomA=mkTarget(w,h);bloomB=mkTarget(w,h);}
const ENH=()=>SET.gfx2!==false;
/* batches */
const CI=[];for(let i=0;i<8;i++)CI.push([(i&1)?.5:-.5,(i&2)?.5:-.5,(i&4)?.5:-.5]);
const CF=[[[1,0,0],[5,1,3,7]],[[-1,0,0],[0,4,6,2]],[[0,1,0],[6,7,3,2]],[[0,-1,0],[0,1,5,4]],[[0,0,1],[4,5,7,6]],[[0,0,-1],[1,0,2,3]]];
const Q6=[0,1,2,0,2,3];const SCR=new Float32Array(24);
/* Vertex format v2 (48 B): pos3 nrm3 uv2 col3 (f32) + aS RGBA8 normalized at byte 44 = (blendTile, blendW, roomId, 0).
   blendTile/roomId must be constant per triangle (no flat varyings in GLSL ES 1.0). roomId 0 = no room; room r is r+1. */
const VSTRIDE=12;
class Batch{
 constructor(){this.alloc(8000);this.n=0;this.buf=gl.createBuffer();this.blT=0;this.blW=0;this.room=0;this.bl=false;}
 alloc(nv,old){const ab=new ArrayBuffer(nv*VSTRIDE*4),u8=new Uint8Array(ab);if(old)u8.set(old.subarray(0,this.n*VSTRIDE*4));this.f=new Float32Array(ab);this.u8=u8;}
 reset(){this.n=0;this.blT=0;this.blW=0;this.room=0;this.bl=false;}
 ensure(k){const need=this.n+k,cap=this.f.length/VSTRIDE;if(need>cap)this.alloc(Math.max(need,cap*2),this.u8);}
 vtx(x,y,z,nx,ny,nz,u,v,c,w){const f=this.f,o=this.n*VSTRIDE,b=o*4+44;f[o]=x;f[o+1]=y;f[o+2]=z;f[o+3]=nx;f[o+4]=ny;f[o+5]=nz;f[o+6]=u;f[o+7]=v;f[o+8]=c[0];f[o+9]=c[1];f[o+10]=c[2];
  const bw=w===undefined?this.blW:Math.round(clamp(w,0,1)*255);if(bw)this.bl=true;const u8=this.u8;u8[b]=this.blT;u8[b+1]=bw;u8[b+2]=this.room;u8[b+3]=0;this.n++;}
 quad4(P,nx,ny,nz,uv,cs){this.ensure(6);const U=[uv[0],uv[2],uv[2],uv[0]],V=[uv[3],uv[3],uv[1],uv[1]];for(const i of Q6)this.vtx(P[i][0],P[i][1],P[i][2],nx,ny,nz,U[i],V[i],cs[i]);}
 quad(P,nx,ny,nz,uv,c){this.ensure(6);const U=[uv[0],uv[2],uv[2],uv[0]],V=[uv[3],uv[3],uv[1],uv[1]];for(const i of Q6)this.vtx(P[i][0],P[i][1],P[i][2],nx,ny,nz,U[i],V[i],c);}
 box(m,c,em,uv){uv=uv||WUV;this.ensure(36);const T=SCR;
  for(let i=0;i<8;i++){const a=CI[i];T[i*3]=m[0]*a[0]+m[1]*a[1]+m[2]*a[2]+m[3];T[i*3+1]=m[4]*a[0]+m[5]*a[1]+m[6]*a[2]+m[7];T[i*3+2]=m[8]*a[0]+m[9]*a[1]+m[10]*a[2]+m[11];}
  const U=[uv[0],uv[2],uv[2],uv[0]],V=[uv[3],uv[3],uv[1],uv[1]];
  for(const [n,ci] of CF){let nx=0,ny=0,nz=0;if(!em){nx=m[0]*n[0]+m[1]*n[1]+m[2]*n[2];ny=m[4]*n[0]+m[5]*n[1]+m[6]*n[2];nz=m[8]*n[0]+m[9]*n[1]+m[10]*n[2];const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;}
   for(const q of Q6){const k=ci[q]*3;this.vtx(T[k],T[k+1],T[k+2],nx,ny,nz,U[q],V[q],c);}}}
 upload(st){gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);gl.bufferData(gl.ARRAY_BUFFER,this.f.subarray(0,this.n*VSTRIDE),st?gl.STATIC_DRAW:gl.DYNAMIC_DRAW);}
 draw(){if(!this.n)return;gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
  gl.vertexAttribPointer(L.aP,3,gl.FLOAT,false,48,0);gl.vertexAttribPointer(L.aN,3,gl.FLOAT,false,48,12);
  gl.vertexAttribPointer(L.aT,2,gl.FLOAT,false,48,24);gl.vertexAttribPointer(L.aC,3,gl.FLOAT,false,48,32);
  const s=L.aS;if(s>=0){gl.enableVertexAttribArray(s);gl.vertexAttribPointer(s,4,gl.UNSIGNED_BYTE,true,48,44);}if(this.bl!==Batch.blOn){Batch.blOn=this.bl;gl.uniform1f(L.uBlend,this.bl?1:0);}
  gl.drawArrays(gl.TRIANGLES,0,this.n);if(s>=0)gl.disableVertexAttribArray(s);}
}
Batch.blOn=false;/* cached P1 uBlend (GL default 0) */
function floorQuad(B,x,z,s,r,uv,c,y){const h=s/2,cc=Math.cos(r)*h,ss=Math.sin(r)*h;
 B.quad([[x-cc-ss,y,z-ss+cc],[x+cc-ss,y,z+ss+cc],[x+cc+ss,y,z+ss-cc],[x-cc+ss,y,z-ss-cc]],0,1,0,uv,c);}
const dynB=new Batch(), poolB=new Batch(), ovB=new Batch(), stageB=new Batch();
/* ================= INSTANCED ROUNDED GEOMETRY + SHADOWS ================= */
const GEOM=`attribute vec3 aP;attribute vec3 aN;attribute vec2 aT;attribute vec4 iR0;attribute vec4 iR1;attribute vec4 iR2;attribute vec4 iC;attribute vec4 iU;attribute vec4 iS;
vec3 gW;vec3 gN;
void geom(){vec3 c0=vec3(iR0.x,iR1.x,iR2.x),c1=vec3(iR0.y,iR1.y,iR2.y),c2=vec3(iR0.z,iR1.z,iR2.z),tr=vec3(iR0.w,iR1.w,iR2.w);
 vec3 S=vec3(length(c0),length(c1),length(c2))+vec3(1e-6);float tp=1.0-iS.y*(aP.y+0.5);vec2 tf=iS.y<0.0?vec2(tp,1.0):vec2(tp);
 vec3 hs=S*0.5;hs.xz*=tf;vec3 q=aP*S;q.xz*=tf;float r=iS.x*min(min(hs.x,hs.y),hs.z);
 vec3 cc=clamp(q,-hs+r,hs-r);vec3 d=q-cc;float dl=length(d);vec3 n=aN;vec3 ps=q;if(r>1e-5&&dl>1e-6){n=d/dl;ps=cc+n*r;}
 gW=(c0/S.x)*ps.x+(c1/S.y)*ps.y+(c2/S.z)*ps.z+tr;gN=normalize((c0/S.x)*n.x+(c1/S.y)*n.y+(c2/S.z)*n.z);}`;
const VSI=GEOM+`
uniform mat4 uVP;uniform vec2 uRes;uniform vec3 uLD;uniform vec3 uLC;uniform vec3 uAmb;uniform float uPix;
uniform vec4 uPL[${NL}];uniform vec3 uPC[${NL}];uniform vec3 uCam;uniform vec2 uFog;
varying vec3 vC;varying vec3 vT;varying float vF;varying vec3 vW;varying vec3 vN;varying float vE;varying vec4 vS;
void main(){geom();vS=vec4(0.0,0.0,0.0,iS.z);vec4 p=uVP*vec4(gW,1.0);if(uPix<0.5){vec2 s=uRes*0.5;p.xy=floor(p.xy/p.w*s+0.5)/s*p.w;}gl_Position=p;
 vE=iC.w;vN=gN;vW=gW;vec3 l=vec3(1.0);
 if(iC.w<0.5&&uPix<0.5){l=uAmb+uLC*max(dot(gN,-uLD),0.0);for(int i=0;i<${NL};i++){vec3 d=uPL[i].xyz-gW;float dist=length(d);float a=clamp(1.0-dist/max(uPL[i].w,0.001),0.0,1.0);l+=uPC[i]*a*a*max(dot(gN,d/max(dist,0.001))*0.6+0.4,0.0);}}
 vC=iC.rgb*l;vec2 uv=mix(iU.xy,iU.zw,aT);vT=uPix<0.5?vec3(uv*p.w,p.w):vec3(uv,1.0);vF=clamp((length(gW-uCam)-uFog.x)/(uFog.y-uFog.x),0.0,1.0);}`;
const VSDI=GEOM+`uniform mat4 uLVP;void main(){geom();gl_Position=uLVP*vec4(gW,1.0);}`;
const VSD=`attribute vec3 aP;uniform mat4 uLVP;void main(){gl_Position=uLVP*vec4(aP,1.0);}`;
const FSD=`precision highp float;void main(){vec4 e=vec4(1.0,255.0,65025.0,16581375.0)*gl_FragCoord.z;e=fract(e);e-=e.yzww*vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);gl_FragColor=e;}`;
let PI=null,PD=null,PDI=null,LI={},LD={},LDI={};
const UNAMES=['uShL','uVP','uRes','uLD','uLC','uAmb','uPL','uPC','uCam','uFog','uTex','uFogC','uPix','uSh','uLVP','uShOn','uHaze','uBump','uBlend'];
const INAMES=['aP','aN','aT','iR0','iR1','iR2','iC','iU','iS'];
try{if(EXT_I){PI=prog(VSI,FS);INAMES.forEach(n=>LI[n]=gl.getAttribLocation(PI,n));UNAMES.forEach(n=>LI[n]=gl.getUniformLocation(PI,n));
  PDI=prog(VSDI,FSD);INAMES.forEach(n=>LDI[n]=gl.getAttribLocation(PDI,n));LDI.uLVP=gl.getUniformLocation(PDI,'uLVP');}
 PD=prog(VSD,FSD);LD.aP=gl.getAttribLocation(PD,'aP');LD.uLVP=gl.getUniformLocation(PD,'uLVP');}catch(e){console.warn('gfx2 fallback',e);PI=null;}
['uSh','uLVP','uShOn','uHaze','uBump','uShL'].forEach(n=>L[n]=gl.getUniformLocation(P1,n));
function makeTemplate(N){const v=[],ix=[];const F=[[0,1,2,1],[0,1,2,-1],[1,2,0,1],[1,2,0,-1],[2,0,1,1],[2,0,1,-1]];
 for(const [ax,ua,va,sg] of F){const b=v.length/8;for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const u=i/N,w=j/N,p=[0,0,0],n=[0,0,0];p[ax]=0.5*sg;p[ua]=(u-0.5)*sg;p[va]=w-0.5;n[ax]=sg;v.push(p[0],p[1],p[2],n[0],n[1],n[2],u,w);}
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=b+j*(N+1)+i,c=a+N+1;ix.push(a,a+1,c+1,a,c+1,c);}}
 const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STATIC_DRAW);
 const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(ix),gl.STATIC_DRAW);return{vb,ib,count:ix.length,v,ix};}
const CPU_T2=(()=>{const N=2,v=[],ix=[];const F=[[0,1,2,1],[0,1,2,-1],[1,2,0,1],[1,2,0,-1],[2,0,1,1],[2,0,1,-1]];for(const [ax,ua,va,sg] of F){const b=v.length;for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const u=i/N,w=j/N,p=[0,0,0],n=[0,0,0];p[ax]=0.5*sg;p[ua]=(u-0.5)*sg;p[va]=w-0.5;n[ax]=sg;v.push({p,n,u,w});}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=b+j*(N+1)+i,c=a+N+1;ix.push(a,a+1,c+1,a,c+1,c);}}return{v,ix};})();
Batch.prototype.rbox=function(m,c,uv,S,r){uv=uv||WUV;this.ensure(CPU_T2.ix.length);const hs=[S[0]/2,S[1]/2,S[2]/2],out=CPU_T2.v.map(t=>{const q=[t.p[0]*S[0],t.p[1]*S[1],t.p[2]*S[2]];const cc=q.map((x,k)=>clamp(x,-hs[k]+r,hs[k]-r));let d=[q[0]-cc[0],q[1]-cc[1],q[2]-cc[2]],dl=Math.hypot(d[0],d[1],d[2]);let n=t.n,ps=q;if(dl>1e-6){n=[d[0]/dl,d[1]/dl,d[2]/dl];ps=[cc[0]+n[0]*r,cc[1]+n[1]*r,cc[2]+n[2]*r];}
  const lx=ps[0]/S[0],ly=ps[1]/S[1],lz=ps[2]/S[2];const w=[m[0]*lx+m[1]*ly+m[2]*lz+m[3],m[4]*lx+m[5]*ly+m[6]*lz+m[7],m[8]*lx+m[9]*ly+m[10]*lz+m[11]];
  let nx=(m[0]*n[0])/S[0]+(m[1]*n[1])/S[1]+(m[2]*n[2])/S[2],ny=(m[4]*n[0])/S[0]+(m[5]*n[1])/S[1]+(m[6]*n[2])/S[2],nz=(m[8]*n[0])/S[0]+(m[9]*n[1])/S[1]+(m[10]*n[2])/S[2];const nl=Math.hypot(nx,ny,nz)||1;
  return[w,nx/nl,ny/nl,nz/nl,lerp(uv[0],uv[2],t.u),lerp(uv[3],uv[1],t.w)];});
 for(const i of CPU_T2.ix){const o=out[i];this.vtx(o[0][0],o[0][1],o[0][2],o[1],o[2],o[3],o[4],o[5],c);}};
{const ob=Batch.prototype.box;Batch.prototype.box=function(m,c,em,uv){if(this.round&&!em&&ENH()){const S=[Math.hypot(m[0],m[4],m[8]),Math.hypot(m[1],m[5],m[9]),Math.hypot(m[2],m[6],m[10])],mn=Math.min(S[0],S[1],S[2]);if(mn>0.045){this.rbox(m,c,uv,S,Math.min(0.07,mn*0.5*this.round));return;}}ob.call(this,m,c,em,uv);};}
Batch.prototype.drawDepth=function(loc){if(!this.n)return;gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,48,0);gl.drawArrays(gl.TRIANGLES,0,this.n);gl.disableVertexAttribArray(loc);};
class InstBatch{constructor(N){this.mesh=PI?makeTemplate(N):null;this.f=new Float32Array(24*2048);this.n=0;this.buf=gl.createBuffer();this.r=0.5;this.tp=0;this.uv=null;this.room=0;}
 reset(){this.n=0;this.r=0.5;this.tp=0;this.uv=null;this.room=0;}
 box(m,c,em,uv){if(!PI||!ENH()){dynB.box(m,c,em,uv||null);return;}if((this.n+1)*24>this.f.length){const nf=new Float32Array(this.f.length*2);nf.set(this.f);this.f=nf;}const f=this.f,o=this.n*24;
  for(let k=0;k<12;k++)f[o+k]=m[k];f[o+12]=c[0];f[o+13]=c[1];f[o+14]=c[2];f[o+15]=em?1:0;const U=uv||this.uv||WUV;f[o+16]=U[0];f[o+17]=U[1];f[o+18]=U[2];f[o+19]=U[3];f[o+20]=em?0:this.r;f[o+21]=this.tp;f[o+22]=this.room;f[o+23]=0;this.n++;}
 upload(){if(!this.n||!PI)return;gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);gl.bufferData(gl.ARRAY_BUFFER,this.f.subarray(0,this.n*24),gl.DYNAMIC_DRAW);}
 draw(Lc){if(!this.n||!PI)return;const M=this.mesh,used=[];const at=(l,sz,st,off,div,buf)=>{if(l<0||l===undefined)return;gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,sz,gl.FLOAT,false,st,off);EXT_I.vertexAttribDivisorANGLE(l,div);used.push(l);};
  gl.bindBuffer(gl.ARRAY_BUFFER,M.vb);at(Lc.aP,3,32,0,0);at(Lc.aN,3,32,12,0);at(Lc.aT,2,32,24,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);at(Lc.iR0,4,96,0,1);at(Lc.iR1,4,96,16,1);at(Lc.iR2,4,96,32,1);at(Lc.iC,4,96,48,1);at(Lc.iU,4,96,64,1);at(Lc.iS,4,96,80,1);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,M.ib);EXT_I.drawElementsInstancedANGLE(gl.TRIANGLES,M.count,gl.UNSIGNED_SHORT,0,this.n);
  for(const l of used){EXT_I.vertexAttribDivisorANGLE(l,0);gl.disableVertexAttribArray(l);}}}
const IBhi=new InstBatch(3),IBlo=new InstBatch(1);
/* shadow map */
const SHS=1024;let shT=null;
function initShadow(){shT={fb:gl.createFramebuffer(),tex:gl.createTexture(),rb:gl.createRenderbuffer()};gl.bindTexture(gl.TEXTURE_2D,shT.tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,SHS,SHS,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
 gl.bindRenderbuffer(gl.RENDERBUFFER,shT.rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,SHS,SHS);gl.bindFramebuffer(gl.FRAMEBUFFER,shT.fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,shT.tex,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shT.rb);gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
M4.ortho=(l,r,b,t,n,f)=>new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]);
let LVP=new Float32Array(16),shadowLive=false;
function renderShadow(center,ld,half,statics){if(!shT)initShadow();const e=[center[0]-ld[0]*30,center[1]-ld[1]*30,center[2]-ld[2]*30];LVP=M4.mul(M4.ortho(-half,half,-half,half,1,70),M4.lookAt(e,center,[0,0,-1]));
 gl.bindFramebuffer(gl.FRAMEBUFFER,shT.fb);gl.viewport(0,0,SHS,SHS);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
 gl.useProgram(PD);gl.uniformMatrix4fv(LD.uLVP,false,LVP);for(const b of statics)b.drawDepth(LD.aP);dynB.drawDepth(LD.aP);
 if(PDI){gl.useProgram(PDI);gl.uniformMatrix4fv(LDI.uLVP,false,LVP);IBhi.draw(LDI);IBlo.draw(LDI);}
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);shadowLive=true;}
function setFX(Lc,menu){gl.uniform1f(Lc.uBump,ENH()?0.55:0);gl.uniform1f(Lc.uHaze,ENH()&&QL<1?(menu?0.085:0.05):0);gl.uniform1f(Lc.uShOn,shadowLive?1:0);gl.uniform1f(Lc.uShL,shadowLive?SHL:-1);gl.uniformMatrix4fv(Lc.uLVP,false,LVP);
 gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,shT?shT.tex:atlasTex);gl.uniform1i(Lc.uSh,2);gl.activeTexture(gl.TEXTURE0);}
let RU=null,SHL=-1,MSH=null;
function drawInst(){if(!PI||!ENH()||(!IBhi.n&&!IBlo.n))return;for(const k of ['aP','aN','aT','aC'])gl.disableVertexAttribArray(L[k]);gl.useProgram(PI);const u=RU;
 gl.uniformMatrix4fv(LI.uVP,false,VP);gl.uniform1f(LI.uPix,1);gl.uniform2f(LI.uRes,rtW,rtH);gl.uniform3fv(LI.uLD,u.ld);gl.uniform3fv(LI.uLC,u.lc);gl.uniform3fv(LI.uAmb,u.amb);gl.uniform3fv(LI.uCam,u.eye);gl.uniform2fv(LI.uFog,u.fog);gl.uniform3fv(LI.uFogC,u.fogC);
 gl.uniform4fv(LI.uPL,LBUF);gl.uniform3fv(LI.uPC,CBUF);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,atlasTex);gl.uniform1i(LI.uTex,0);setFX(LI,u.menu);
 gl.uniform1f(LI.uBump,0.12);gl.uniform1f(LI.uBlend,0);IBhi.draw(LI);IBlo.draw(LI);gl.useProgram(P1);for(const k of ['aP','aN','aT','aC'])gl.enableVertexAttribArray(L[k]);}
/* quality */
let QL=0,qlT=0,ftEma=0.016;
function qualityTick(raw){if(window.QLOCK!==undefined){QL=window.QLOCK;return;}if(raw===null)return;ftEma=ftEma*0.95+Math.min(raw,0.1)*0.05;if(!ENH())return;
 if(ftEma>0.021){qlT+=raw;if(qlT>2.5&&QL<3){QL++;qlT=0;}}else if(ftEma<0.0135){qlT-=raw;if(qlT<-6&&QL>0){QL--;qlT=0;}}else qlT*=0.98;}
/* motes */
let MOTES=[];
function drawMotes(cx,cz,bills,t){if(MOTES.length===0)for(let i=0;i<60;i++)MOTES.push({x:rnd(-7,7),y:rnd(0.2,2.4),z:rnd(-5,5),ph:rnd(0,TAU),b:Math.random()<0.3});
 for(const m of MOTES){let x=cx+((m.x+Math.sin(t*0.15+m.ph)*0.6-cx%14+21)%14-7),z=cz+((m.z+Math.cos(t*0.12+m.ph)*0.6-cz%10+15)%10-5),y=((m.y+t*(m.b?-0.12:0.05)+Math.sin(t*0.7+m.ph)*0.08)%2.6+2.6)%2.6+0.05;
  if(m.b&&bills){IBlo.r=0;IBlo.tp=0;drawBill(IBlo,A.mul(A.mul(A.T(x,y,z),A.RY(t*0.8+m.ph)),A.RX(Math.sin(t*1.3+m.ph)*0.8)));}
  else if(!m.b)IBlo.box(A.mul(A.T(x,y,z),A.S(0.012,0.012,0.012)),[1,0.95,0.9]);}}
/* drips */
function addDrip(x,y,z,nx,nz){if(!G.drips)G.drips=[];if(G.drips.length>40)return;G.drips.push({x,y,z,nx,nz,len:0,max:Math.min(y-0.04,rnd(0.18,0.6)),w:rnd(0.03,0.07),sp:rnd(0.12,0.3)});}
function updateDrips(dt){const g=G;if(!g.drips)return;for(let i=g.drips.length-1;i>=0;i--){const d=g.drips[i];d.len+=d.sp*dt*(1.15-d.len/Math.max(d.max,0.01));if(d.len>=d.max*0.97){g.decals.push({w:1,drip:1,x:d.x,y:d.y,z:d.z,nx:d.nx,nz:d.nz,len:d.len,dw:d.w,t:52,c:[0.85,0.85,0.85]});if(g.decals.length>900)g.decals.shift();g.decalDirty=true;g.drips.splice(i,1);}}}
function dripQuad(B,d,len){const tx=-d.nz,tz=d.nx,h=(d.dw||d.w)/2,ox=d.x+d.nx*0.014,oz=d.z+d.nz*0.014;B.quad([[ox-tx*h,d.y-len,oz-tz*h],[ox+tx*h,d.y-len,oz+tz*h],[ox+tx*h,d.y,oz+tz*h],[ox-tx*h,d.y,oz-tz*h]],d.nx,0,d.nz,TUV[52],[0.85,0.85,0.85]);}


