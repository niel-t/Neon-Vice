# Cuts the gun clips in audio/guns.mp3 from the CC0 Free Firearm Sound Library (see audio/CREDITS.md).
# Usage: download the listed WAVs from https://github.com/buddingmonkey/FreeFirearmsSFXLibrary into one folder, then
#   python3 scripts/gun-audio.py <wav folder> audio/guns   (needs numpy + ffmpeg; writes guns.mp3 + guns.json for GUNCLIP in weapons.js)
# Cuts clips from the Free Firearm Sound Library (CC0) into one mono MP3 sprite + offsets JSON.
import subprocess,numpy as np,json,sys,os
SR=44100;RAW=sys.argv[1];OUT=sys.argv[2]
def load(f):
    raw=subprocess.run(['ffmpeg','-v','error','-i',os.path.join(RAW,f),'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(raw,dtype=np.float32).copy()
# name: (file, approx onset s, length s, peak dB)
SHOT=-1.0;MECH=-3.0
C={
 'pistol1':('X_39P.wav',1.41,0.55,SHOT),'pistol2':('X_39P.wav',6.44,0.55,SHOT),'pistol3':('X_39P.wav',10.66,0.55,SHOT),
 'silenced1':('X_43.wav',1.77,0.35,SHOT),'silenced2':('X_43.wav',5.79,0.35,SHOT),
 'revolver1':('V_27P.wav',0.81,0.6,SHOT),'revolver2':('V_27P.wav',6.21,0.6,SHOT),
 'shotgun1':('H_21P.wav',0.46,0.7,SHOT),'shotgun2':('H_21P.wav',3.08,0.7,SHOT),
 'double1':('O_21P.wav',0.43,0.7,SHOT),'double2':('O_21P.wav',3.46,0.7,SHOT),
 'smg1':('G_31P.wav',0.31,0.4,SHOT),'smg2':('G_31P.wav',3.50,0.4,SHOT),'smg3':('G_31P.wav',6.72,0.4,SHOT),
 'rifle1':('D_32P.wav',0.70,0.55,SHOT),'rifle2':('D_32P.wav',5.64,0.55,SHOT),
 'ak1':('C_28P.wav',0.61,0.55,SHOT),'ak2':('C_28P.wav',3.25,0.55,SHOT),'ak3':('C_28P.wav',6.02,0.55,SHOT),
 'deagle1':('A_42P.wav',0.94,0.6,SHOT),'deagle2':('A_42P.wav',5.00,0.6,SHOT),
 'gl1':('N_30P.wav',4.96,0.6,SHOT),'gl2':('N_30P.wav',1.70,0.6,SHOT),
 # mechanics
 'ppq_out':('X_3.wav',0.81,0.4,MECH),'ppq_in':('X_4.wav',3.0,0.35,MECH),'ppq_slide':('X_11.wav',0.76,0.3,MECH),'ppq_dry':('X_18.wav',0.58,0.15,MECH),
 'sw_open':('V_9.wav',1.24,0.5,MECH),'sw_eject':('V_3.wav',0.75,0.85,MECH),'sw_load':('V_2.wav',8.9,0.8,MECH),'sw_close':('V_10.wav',1.38,0.4,MECH),'sw_dry':('V_5.wav',1.54,0.2,MECH),
 'pump_shell':('H_7.wav',0.96,0.65,MECH),'pump_cycle':('H_6.wav',1.24,0.6,MECH),'pump_dry':('H_8.wav',1.01,0.15,MECH),
 'brk_open':('O_0.wav',1.31,0.35,MECH),'brk_shell':('O_7.wav',1.58,0.4,MECH),'brk_close':('O_1.wav',1.44,0.45,MECH),
 'smg_out':('G_9.wav',1.2,0.3,MECH),'smg_in':('G_8.wav',1.70,0.4,MECH),'smg_bolt':('G_2.wav',0.94,0.4,MECH),
 'ar_out':('D_3.wav',3.81,0.35,MECH),'ar_in':('D_4.wav',0.93,0.5,MECH),'ar_bolt':('D_13.wav',0.34,0.5,MECH),'ar_dry':('D_16.wav',0.37,0.15,MECH),
 'ak_out':('C_11.wav',0.23,0.3,MECH),'ak_in':('C_10.wav',0.21,0.3,MECH),'ak_back':('C_14.wav',0.24,0.4,MECH),'ak_fwd':('C_14.wav',1.42,0.35,MECH),
 'm1911_out':('A_3.wav',1.15,0.35,MECH),'m1911_in':('A_4.wav',0.90,0.35,MECH),'m1911_slide':('A_11.wav',0.74,0.4,MECH),
}
GAP=0.12;cache={};parts=[np.zeros(int(GAP*SR),np.float32)];pos=GAP;meta={}
for name,(f,t,ln,pk) in C.items():
    x=cache.get(f)
    if x is None: x=cache[f]=load(f)
    a=max(0,int((t-0.12)*SR));w=x[a:a+int(0.5*SR)];m=np.abs(w).max()
    on=a+int(np.argmax(np.abs(w)>m*0.08))-int(0.004*SR)   # 4 ms of pre-roll before the transient
    seg=x[on:on+int(ln*SR)].copy()
    n=len(seg);fi=int(0.002*SR);seg[:fi]*=np.linspace(0,1,fi)
    fo=int(n*0.4);seg[n-fo:]*=np.linspace(1,0,fo)**2
    seg*=10**(pk/20)/max(1e-6,np.abs(seg).max())
    meta[name]=[round(pos,4),round(n/SR,4)]
    parts+= [seg,np.zeros(int(GAP*SR),np.float32)];pos+=n/SR+GAP
    print(name,f,f'{on/SR:.3f}',f'{n/SR:.2f}s')
pcm=np.concatenate(parts)
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','-','-c:a','libmp3lame','-q:a','3',OUT+'.mp3'],input=pcm.tobytes(),check=True)
json.dump(meta,open(OUT+'.json','w'),separators=(',',':'))
print('total',f'{pos:.1f}s',os.path.getsize(OUT+'.mp3'),'bytes')
