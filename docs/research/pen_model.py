# Neon Vice penetration + destruction model (docs/research). Reproduces the tables in
# BALLISTICS.md §3-§4 and MATERIALS.md §5.  Run: python docs/research/pen_model.py
import math
MAT={'gyp':(25,0),'timber':(30,0),'ply':(40,0),'particle':(45,0),'plaster':(60,0),'stucco':(100,0),
 'cmu':(345,1),'grout':(345,1),'brick':(400,1),'clay':(400,1),'concrete':(900,1),
 'glass':(60,0),'glass_lam':(300,0),'steel':(1500,1),'alu':(600,1),'grp':(80,0),
 'foam':(3,0),'mattress':(5,0),'insul':(2,0),'void':(0,0)}
METAL={'steel','alu'}
# name: (layers, coreE, cellHp)   coreE None = any hit counts
CON={
 'stud_wood_gyp':([('gyp',1.27),('void',8.9),('gyp',1.27)],None,600),
 'stud_wood_gyp@stud':([('gyp',1.27),('timber',8.9),('gyp',1.27)],None,600),
 'stud_steel_gyp':([('gyp',1.59),('void',9.2),('gyp',1.59)],None,700),
 'stud_steel_gyp2':([('gyp',3.18),('insul',9.2),('gyp',3.18)],None,1400),
 'particle_divider':([('particle',1.9)],None,400),
 'plaster_lath':([('plaster',2.0),('timber',0.6),('void',9),('timber',0.6),('plaster',2.0)],None,1500),
 'plaster_lath@stud':([('plaster',2.0),('timber',10.2),('plaster',2.0)],None,1500),
 'clay_tile_4':([('plaster',1.5),('clay',1.0),('void',7.6),('clay',1.0),('plaster',1.5)],800,8000),
 'cbs_ext':([('stucco',1.9),('cmu',3.2),('void',13),('cmu',3.2),('plaster',1.3)],1600,35000),
 'cbs_ext@web':([('stucco',1.9),('cmu',19.4),('plaster',1.3)],1600,35000),
 'cmu_hollow':([('plaster',1.3),('cmu',3.2),('void',13),('cmu',3.2),('plaster',1.3)],1600,35000),
 'cmu_hollow@web':([('plaster',1.3),('cmu',19.4),('plaster',1.3)],1600,35000),
 'cmu_filled':([('plaster',1.3),('grout',19.4),('plaster',1.3)],1600,70000),
 'brick_1w':([('brick',9)],1600,52000),
 'brick_2w':([('brick',21.5)],1600,105000),
 'brick_cmu_ext':([('brick',9),('void',2.5),('cmu',3.2),('void',13),('cmu',3.2)],1600,90000),
 'brick_cmu_ext@web':([('brick',9),('void',2.5),('cmu',19.4)],1600,90000),
 'rc_wall_20':([('plaster',1.3),('concrete',20),('plaster',1.3)],2700,210000),
 'rc_column_40':([('concrete',40)],None,math.inf),
 'glass_annealed_6':([('glass',0.6)],None,1),
 'glass_tempered_6':([('glass',0.6)],None,1),
 'glass_lam_windshield':([('glass_lam',0.76)],None,1500),
 'glass_studio':([('glass_lam',1.2),('void',20),('glass_lam',1.0)],None,6000),
 'door_hollow':([('ply',0.3),('void',2.9),('ply',0.3)],None,300),
 'door_solid':([('ply',0.3),('particle',3.85),('ply',0.3)],None,1500),
 'door_metal':([('steel',0.12),('void',4.2),('steel',0.12)],None,4000),
 'door_vault':([('steel',0.95),('void',4),('steel',0.95)],None,math.inf),
 'car_door':([('steel',0.08),('void',10),('steel',0.08)],None,3000),
 'car_door@reg':([('steel',0.08),('steel',0.3),('void',10),('steel',0.08)],None,3000),
 'car_engine':([('steel',6)],None,math.inf),
 'steel_3mm':([('steel',0.32)],None,math.inf),
 'steel_10mm':([('steel',0.95)],None,math.inf),
 'corrugated':([('steel',0.05)],None,800),
 'alu_bulkhead':([('alu',0.6),('insul',5),('ply',1.2)],None,5000),
 'joinery_ply':([('ply',1.9),('insul',5),('ply',1.2)],None,1200),
 'grp_hull':([('grp',1.5)],None,2500),
 'acoustic_double':([('gyp',3.18),('insul',9),('void',5),('insul',9),('gyp',3.18)],None,3000),
 'sofa':([('foam',60),('timber',2)],None,1500),
 'mattress':([('mattress',22)],None,800),
 'counter_cmu':([('ply',0.6),('cmu',3.2),('void',3.6),('cmu',3.2)],1600,20000),
 'counter_cabinet':([('ply',1.9),('void',55),('ply',1.9)],None,1200),
}
# id: (e0 J per projectile, hard, pellets, metal) ; metal multiplies losses in steel/alu (bullet diameter / construction)
CAL={'9mm':(490,1.0,1,1.0),'9mm_smg':(600,1.0,1,1.0),'.45':(548,1.0,1,1.25),'.357':(731,0.9,1,1.0),
 '.50ae':(1965,0.8,1,1.5),'5.56':(1750,1.0,1,1.0),'7.62x39':(2030,1.3,1,1.0),'12ga_00':(287,0.5,9,1.0),
 '12ga_slug':(3413,0.5,1,2.0),'.50bmg':(16900,1.0,1,4.0)}
EMIN=30; TUMBLE=2.0
def through(cal,con,e,tum):
  _,hard,_,metal=CAL[cal]; hit=False
  for (m,t) in CON[con][0]:
    res,h=MAT[m]
    if res==0: continue
    loss=res*t*tum
    if h: loss/=hard
    if m in METAL: loss*=metal
    e-=loss
    if e<EMIN: return None,hit
    if h and t>=3: hit=True
  return e,hit
def run(cal,cons):
  e0=CAL[cal][0]; e=e0; tum=1.0
  for ci,con in enumerate(cons):
    e,hard=through(cal,con,e,tum)
    if e is None: return 'stop' if len(cons)==1 else 'stop@%d'%(ci+1)
    if hard: tum=TUMBLE
  return '%d%%'%round(100*e/e0)
def rounds_per_cell(cal,con):
  e0,hard,n,_=CAL[cal]; coreE,hp=CON[con][1],CON[con][2]
  if hp==math.inf: return 'never'
  if coreE is not None and e0*hard<coreE: return 'never'
  out,_=through(cal,con,e0,1.0)
  dep=(e0-(out or 0))*n
  return '%d'%math.ceil(hp/dep)
cals=list(CAL)
def table(rows):
  print('| construction | '+' | '.join(cals)+' |'); print('|---|'+'---:|'*len(cals))
  for name,cons in rows: print('| %s | '%name+' | '.join(run(k,cons) for k in cals)+' |')
print('## Matrix: retained energy, single wall'); table([('`%s`'%c,[c]) for c in CON])
print('\n## Chains')
table([('2x stud_wood_gyp',['stud_wood_gyp']*2),('4x stud_wood_gyp',['stud_wood_gyp']*4),('5x stud_wood_gyp',['stud_wood_gyp']*5),
 ('door_hollow + stud_wood_gyp',['door_hollow','stud_wood_gyp']),('car_door x2 (through car)',['car_door','car_door']),
 ('brick_cmu_ext + ply + brick_cmu_ext',['brick_cmu_ext','particle_divider','brick_cmu_ext'])])
print('\n## Rounds (shells) to remove one 0.5 m cell')
dc=['stud_wood_gyp','door_solid','clay_tile_4','cmu_hollow','cmu_filled','brick_1w','brick_2w','brick_cmu_ext','rc_wall_20']
print('| construction | '+' | '.join(cals)+' |'); print('|---|'+'---:|'*len(cals))
for c in dc: print('| `%s` | '%c+' | '.join(rounds_per_cell(k,c) for k in cals)+' |')
print('\n## Timber stop depth (BOT1 anchor): 9mm %.1f cm, .45 %.1f cm'%((490-EMIN)/30,(548-EMIN)/30))
print('## Steel stop depth: '+', '.join('%s %.1f cm'%(k,(CAL[k][0]-EMIN)*CAL[k][1]/1500/CAL[k][3]) for k in cals))
# 40 mm HE: J(d)=55000*(0.25/max(d,0.25))**5 applied straight to cellHp (bypasses coreE)
def blast(d): return 55000*(0.25/max(d,0.25))**5
print('\n## 40mm HE reach: distance (m) from burst to cell centre at which the cell is removed')
for c in ['stud_wood_gyp','stud_steel_gyp','door_solid','door_metal','clay_tile_4','cmu_hollow','brick_1w','cmu_filled','rc_wall_20']:
  hp=CON[c][2]; r=0.25*(55000/hp)**0.2 if hp<=55000 else 0
  print('- %s: %s'%(c,'%.2f m'%r if r else 'never (decal only)'))
# Lock/hinge breach: hits within 0.25 m of hardware apply full incoming energy (all pellets) to lockHp
LOCK={'door_hollow':800,'door_solid':3000,'door_metal':6000}
print('\n## Hits to defeat a lock/hinge')
for d,hp in LOCK.items(): print('- %s (%d J): '%(d,hp)+', '.join('%s %d'%(k,math.ceil(hp/(CAL[k][0]*CAL[k][2]))) for k in cals))

