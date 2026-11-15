import numpy as np,base64,json,os
CMU=os.environ.get('CMU_DIR','cmu')
import sys;sys.path.insert(0,os.path.dirname(__file__))
from retarget import convert,BONES
def dist(R,Q,a,b):return np.sum(1-np.abs(np.sum(Q[a]*Q[b],axis=1)))+4*np.linalg.norm(R[a]-R[b])
def findloop(R,Q,a0,a1,pmin,pmax):
    best=(1e9,0,0)
    for a in range(a0,a1-pmin):
        for P in range(pmin,min(pmax,a1-a)+1):
            d=dist(R,Q,a,a+P)+dist(R,Q,a+1,a+P+1)
            if d<best[0]:best=(d,a,P)
    return best
def bake(R,Q,a,P,fade=6):
    R=R[a:a+P+fade].copy();Q=Q[a:a+P+fade].copy()
    for k in range(fade):  # blend the tail into the head so the loop is seamless
        w=(k+1)/(fade+1);i=P+k;j=k
        sg=np.sign(np.sum(Q[i]*Q[j],axis=1));sg[sg==0]=1
        Q[j]=Q[j]*w+Q[i]*sg[:,None]*(1-w);R[j]=R[j]*w+R[i]*(1-w)
    Q=Q[:P];R=R[:P];Q/=np.linalg.norm(Q,axis=2,keepdims=True)
    for i in range(len(Q)):
        if Q[i][0][3]<0:pass
    return R,Q
def pack(R,Q):
    n=len(Q);a=np.zeros((n,3+17*4),np.int8)
    a[:,0:3]=np.clip(np.round(R/0.25*127),-127,127)
    a[:,3:]=np.clip(np.round(Q.reshape(n,-1)*127),-127,127)
    return base64.b64encode(a.tobytes()).decode()
CLIPS=[('walk',CMU+'/137_38.bvh','walk',90,190,40,60,'Sexy Lady Walk 137_38'),
 ('walk2',CMU+'/142_18.bvh','walk',None,None,26,60,'Sexy walk 142_18'),
 ('idle',CMU+'/137_37.bvh','still',None,None,150,300,'Sexy Lady Wait 137_37'),
 ('idle2',CMU+'/137_23.bvh','still',None,None,150,300,'Graceful Lady Wait 137_23'),
 ('lambada',CMU+'/55_02.bvh','still',30,520,180,330,'Lambada 55_02')]
out={}
for key,fn,mode,a0,a1,pmin,pmax,src in CLIPS:
    R,Q,sp,yaw=convert(fn,mode)
    if a0 is None:
        if mode=='walk':
            ok=np.where(sp>0.5)[0];a0,a1=ok[10],ok[-10]
        else:a0,a1=15,len(Q)-15
    d,a,P=findloop(R,Q,a0,min(a1,a0+pmax*3) if mode!='walk' else a1,pmin,pmax) if True else None
    stride=float(np.mean(sp[a:a+P]))*P/30 if mode=='walk' else 0
    R2,Q2=bake(R,Q,a,P)
    out[key]={'src':src,'n':P,'stride':round(stride,3),'d':pack(R2,Q2)}
    print(key,'start',a,'len',P,'err',round(d,3),'stride',round(stride,2),'speed',round(float(np.mean(sp[a:a+P])),2))
js="'use strict';\n/* motion capture for the girls: CMU Graphics Lab Motion Capture Database (mocap.cs.cmu.edu), BVH conversion by Bruce Hahne\n   (cgspeed), free for any use. Retargeted to our 17-bone rig by scripts outside the game; per clip: n frames at 30 fps, each frame\n   int8 root offset (x,y,z * 0.25/127 m) then 17 local bone rotations as quaternions (x,y,z,w / 127), base64. stride: metres per walk loop. */\nconst MOCAP_SRC="+json.dumps(out,indent=0)+";\n"
open(os.path.join(os.path.dirname(__file__),'..','..','mocap.js'),'w').write(js)
print(len(js))
