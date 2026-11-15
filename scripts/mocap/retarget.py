import numpy as np
from bvh import parse,fk
AA=np.radians(38);AD=np.array([np.sin(AA),-np.cos(AA),0])
SH=np.array([0.215,1.425,-0.01]);EL=SH+AD*0.3;WR=EL+AD*0.27;HT=WR+AD*0.18;mir=lambda p:np.array([-p[0],p[1],p[2]])
BONES=[('pelvis',-1,[0,0.95,0],[0,1.06,0]),('spine',0,[0,1.06,0],[0,1.26,0]),('chest',1,[0,1.26,0],[0,1.47,0]),('neck',2,[0,1.47,0],[0,1.6,0]),('head',3,[0,1.6,0],[0,1.82,0]),
 ('uarmL',2,SH,EL),('farmL',5,EL,WR),('handL',6,WR,HT),('uarmR',2,mir(SH),mir(EL)),('farmR',8,mir(EL),mir(WR)),('handR',9,mir(WR),mir(HT)),
 ('thighL',0,[0.1,0.93,0],[0.105,0.51,0.01]),('shinL',11,[0.105,0.51,0.01],[0.11,0.1,-0.01]),('footL',12,[0.11,0.1,-0.01],[0.115,0.03,0.17]),
 ('thighR',0,[-0.1,0.93,0],[-0.105,0.51,0.01]),('shinR',14,[-0.105,0.51,0.01],[-0.11,0.1,-0.01]),('footR',15,[-0.11,0.1,-0.01],[-0.115,0.03,0.17])]
BONES=[(n,p,np.array(a,float),np.array(b,float)) for n,p,a,b in BONES]
FULL={'pelvis':'Hips','spine':'Spine','chest':'Spine1','neck':'Neck1','head':'Head'}
DIRS={'uarmL':('LeftArm','LeftForeArm'),'farmL':('LeftForeArm','LeftHand'),'handL':('LeftHand','LeftHandIndex1'),
 'uarmR':('RightArm','RightForeArm'),'farmR':('RightForeArm','RightHand'),'handR':('RightHand','RightHandIndex1'),
 'thighL':('LeftUpLeg','LeftLeg'),'shinL':('LeftLeg','LeftFoot'),'footL':('LeftFoot','LeftToeBase'),
 'thighR':('RightUpLeg','RightLeg'),'shinR':('RightLeg','RightFoot'),'footR':('RightFoot','RightToeBase')}
def align(a,b):
    a=a/np.linalg.norm(a);b=b/np.linalg.norm(b);v=np.cross(a,b);c=np.dot(a,b)
    if c<-0.9999:
        ax=np.cross(a,[1,0,0]);ax=ax if np.linalg.norm(ax)>1e-3 else np.cross(a,[0,1,0]);ax/=np.linalg.norm(ax);return 2*np.outer(ax,ax)-np.eye(3)
    K=np.array([[0,-v[2],v[1]],[v[2],0,-v[0]],[-v[1],v[0],0]]);return np.eye(3)+K+K@K/(1+c)
def Ry(a):c,s=np.cos(a),np.sin(a);return np.array([[c,0,s],[0,1,0],[-s,0,c]])
def smooth(x,w):
    k=np.ones(w)/w;pad=np.pad(x,((w//2,w-1-w//2),)+((0,0),)*(x.ndim-1),mode='edge');return np.stack([np.convolve(pad[:,i],k,'valid') for i in range(x.shape[1])],1) if x.ndim>1 else np.convolve(pad,k,'valid')
def q_of(M):
    t=np.trace(M)
    if t>0:s=np.sqrt(t+1)*2;return np.array([(M[2,1]-M[1,2])/s,(M[0,2]-M[2,0])/s,(M[1,0]-M[0,1])/s,0.25*s])
    i=np.argmax(np.diag(M))
    if i==0:s=np.sqrt(1+M[0,0]-M[1,1]-M[2,2])*2;return np.array([0.25*s,(M[0,1]+M[1,0])/s,(M[0,2]+M[2,0])/s,(M[2,1]-M[1,2])/s])
    if i==1:s=np.sqrt(1+M[1,1]-M[0,0]-M[2,2])*2;return np.array([(M[0,1]+M[1,0])/s,0.25*s,(M[1,2]+M[2,1])/s,(M[0,2]-M[2,0])/s])
    s=np.sqrt(1+M[2,2]-M[0,0]-M[1,1])*2;return np.array([(M[0,2]+M[2,0])/s,(M[1,2]+M[2,1])/s,0.25*s,(M[1,0]-M[0,1])/s])
def convert(fn,mode,heading='path'):
    """mode 'walk': heading follows the travel path, travel removed (in place); 'still': fixed mean heading, slow drift removed"""
    J,D,ft=parse(fn);step=max(1,round(1/30/ft));D=D[::step];G,P=fk(J,D);nm={j['name']:i for i,j in enumerate(J)}
    L=np.linalg.norm(J[nm['LeftLeg']]['off'])+np.linalg.norm(J[nm['LeftFoot']]['off']);s=0.83/L
    hp=P[:,nm['Hips']]*s;nf=len(D)
    fwd=G[:,nm['Hips']][:,:,2];yaw=np.unwrap(np.arctan2(fwd[:,0],fwd[:,2]))
    if mode=='walk':
        sp=smooth(hp[:,[0,2]],31);vel=np.gradient(sp,axis=0);yaw=np.unwrap(np.arctan2(vel[:,0],vel[:,1]));yaw=smooth(yaw,31)
        base=sp
    else:
        yaw=np.full(nf,np.arctan2(np.mean(np.sin(yaw)),np.mean(np.cos(yaw))));base=smooth(hp[:,[0,2]],61)
    out=[];speed=np.linalg.norm(np.gradient(base,axis=0),axis=1)*30
    for f in range(nf):
        Ri=Ry(-yaw[f]);W={}
        for i,(n,p,pv,en) in enumerate(BONES):
            if n in FULL:W[i]=Ri@G[f,nm[FULL[n]]]
            else:
                a,b=DIRS[n];d=Ri@(P[f,nm[b]]-P[f,nm[a]]);Wp=W[p];W[i]=align(Wp@(en-pv),d)@Wp
        loc=[W[i] if p<0 else W[p].T@W[i] for i,(n,p,pv,en) in enumerate(BONES)]
        rel=hp[f].copy();rel[[0,2]]-=base[f];rel=Ri@rel
        root=np.array([rel[0],0,rel[2]]) - np.array([0,0,0])
        # FK of our rig to put the lower foot on the floor
        Wm={};pos={}
        for i,(n,p,pv,en) in enumerate(BONES):
            if p<0:Wm[i]=W[i];org=np.array([root[0],0,root[2]])+pv-W[i]@pv;pos[i]=org
            else:Wm[i]=W[i];pos[i]=pos[p]+Wm[p]@pv-W[i]@pv
        pt=lambda i,x:pos[i]+Wm[i]@x
        low=min(pt(13,BONES[13][3])[1],pt(16,BONES[16][3])[1],pt(13,BONES[13][2])[1]-0.07,pt(16,BONES[16][2])[1]-0.07)
        root[1]=0.03-low
        out.append((root,[q_of(M) for M in loc]))
    R=np.array([o[0] for o in out]);Q=np.array([o[1] for o in out])
    for i in range(1,nf):  # quaternion hemisphere continuity
        sg=np.sign(np.sum(Q[i]*Q[i-1],axis=1));sg[sg==0]=1;Q[i]*=sg[:,None]
    R[:,1]=smooth(R[:,1],3)
    return R,Q,speed,yaw
