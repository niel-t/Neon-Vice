import numpy as np, re
def parse(path):
    txt=open(path).read().split('MOTION')
    toks=txt[0].split()
    joints=[];stack=[];i=0;chans=[]
    while i<len(toks):
        t=toks[i]
        if t in('ROOT','JOINT'):
            joints.append({'name':toks[i+1],'parent':stack[-1] if stack else -1,'off':None,'ch':[]});i+=2
        elif t=='End':
            joints.append({'name':joints[stack[-1]]['name']+'_end','parent':stack[-1],'off':None,'ch':[]});i+=2
        elif t=='{':stack.append(len(joints)-1);i+=1
        elif t=='}':stack.pop();i+=1
        elif t=='OFFSET':joints[stack[-1]]['off']=np.array(list(map(float,toks[i+1:i+4])));i+=4
        elif t=='CHANNELS':
            n=int(toks[i+1]);joints[stack[-1]]['ch']=toks[i+2:i+2+n];i+=2+n
        else:i+=1
    m=txt[1].split('\n');nf=int(m[1].split()[1]);ft=float(m[2].split()[-1])
    data=np.array([list(map(float,l.split())) for l in m[3:3+nf] if l.strip()])
    return joints,data,ft
def R(ax,a):
    c,s=np.cos(a),np.sin(a)
    if ax=='X':return np.array([[1,0,0],[0,c,-s],[0,s,c]])
    if ax=='Y':return np.array([[c,0,s],[0,1,0],[-s,0,c]])
    return np.array([[c,-s,0],[s,c,0],[0,0,1]])
def fk(joints,data):
    nf=len(data);nj=len(joints);G=np.zeros((nf,nj,3,3));P=np.zeros((nf,nj,3))
    col=0;cols=[]
    for j in joints:cols.append(col);col+=len(j['ch'])
    for f in range(nf):
        row=data[f]
        for k,j in enumerate(joints):
            Rl=np.eye(3);t=j['off'].copy()
            for ci,c in enumerate(j['ch']):
                v=row[cols[k]+ci]
                if c.endswith('position'):t['XYZ'.index(c[0])]=v
                else:Rl=Rl@R(c[0],np.radians(v))
            if j['parent']<0:G[f,k]=Rl;P[f,k]=t
            else:
                p=j['parent'];G[f,k]=G[f,p]@Rl;P[f,k]=P[f,p]+G[f,p]@j['off']
    return G,P
