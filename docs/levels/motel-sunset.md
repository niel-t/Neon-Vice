# Motel Sunset: floorplan reference and layout brief

> **Status:** W3 research deliverable (wave 1). This is docs only, not a runtime map.
> **Consumers:** W2 (level designer) builds the stage from it. W1's floorplan
> visualiser and query tools check the result against §6. W4 (decor) uses §8.
> **Mission brief (levels.js):** *"Some out-of-town crew moved into the Sunset
> Motel on Route 1 and they're dealing on our streets … Car's out front."*
> **Evidence tags:** **V** verified from a cited source, **D** derived from
> sources, **P** proposed design choice (plausible, not measured), **G**
> gameplay override.

---

## 1. Design intent

The legacy level is a 34 × 17 grid of rooms around a corridor. That is an
*interior*: a real US-1 motel has almost no interior circulation. Each guest
room opens straight onto an exterior walkway, and the courtyard holds the
parking and the pool. The goal is to make the player feel they have pulled
off Biscayne Boulevard into a tired 1953 MiMo motel at night:

- **Read the building in one glance from the street.** The ground plan is a
  **U**: one-storey west wing, two-storey rear block, with the office and
  porte-cochère on the road. You see every door from the lot. This is the
  Vagabond and New Yorker organisation (M1, M2).
- **Exposure is the mission.** Approaching across an open lot towards a
  balcony that the enemy holds is a real tactical problem: parked cars are
  the only cover. This replaces the legacy "door-by-door corridor" with a
  **lot, then the stairs, then the upper walkway** escalation.
- **Masonry country.** CBS shells and CMU demising walls mean pistols do not
  go room-to-room (MATERIALS §4). Bath partitions and doors are the only soft
  spots. Rifles and the shotgun slug can wear firing ports through block (≈
  11–20 rounds per cell), and the AK sometimes punches through, so loadout
  choice matters.
- **The crew's set-up is legible.** Upstairs is the business: lookout, cook
  rooms knocked together, count room and boss. Downstairs is ordinary
  motel, with a few civilians and the crew's cars. The difficulty gradient
  runs south to north and ground to f2.
- **Not symmetrical.** Shalimar grew from an I-plan into a U, and its pool
  came two years later (M2). The plan keeps that "assembled in phases"
  feel: the service yard, the manager's apartment and the porte-cochère are
  added on the east side, and the west wing is shorter than the rear block.

## 2. References and what each contributes

Cite by key. Links and descriptions only; no plan images are copied.

| Key | Building | What it documents | What we borrow | Rationale |
|---|---|---|---|---|
| **M1** | **Vagabond Motel**, 7301 Biscayne Blvd, 1953. NRHP nomination with ground- and second-floor plans (PDF p.19). <https://npgallery.nps.gov/GetAsset/ec11f82c-6ef5-475f-87da-edf2b2226f08> | U-plan; one-storey side wings; two-storey rear wing; courtyard holding parking **and** pool; exterior walkways; paired stairs; road-facing office; masonry walls, jalousie windows, terrazzo (§7) | The whole organising diagram; materials palette; stairs at both ends of the upper block | The most complete documented plan of the type, a few blocks from the fictional site. The nomination shows the rehabilitation-era plan; we reverse later changes for 1986 (no impact glazing). |
| **M3** | Vagabond designation report. <https://www.historicpreservationmiami.com/pdfs/vagabond%20motel.pdf> | Pool-court furnishing (tables, chairs, landscaping), courtyard and rear entrances | Pool deck dressing; rear service access | Primary source for the pool-court props. |
| **M2** | MiMo/Biscayne Blvd Historic District designation report. <https://www.historicpreservationmiami.com/pdfs/MiMoBiscayneBlvdHD_DesignationReport.pdf> | **New Yorker** (6500): 18 units, two-storey L, office near the road (p.15). **Shalimar** (6200): I-plan grown to U, pool added 1955 (p.15). **Stardust** (6730): 54 units, H-plan, central pool, office with porte-cochère (p.16). **Saturn** (6999): 16 units, simple rectangle (p.16). **Sunshine** (7350): 25 × 113 ft lot, three storeys (pp.17–18) | Unit count (21 keys); the porte-cochère (Stardust); asymmetric phased growth (Shalimar); office addressing the road (New Yorker) | Gives the range of sizes and plan shapes on the strip, so the composite sits inside real variation rather than copying one building. |
| **C6** | City of Miami off-street parking guide (archived). <https://archive.miamigov.com/planning/docs/guidelines/Offstreet_Parking_Guides_and_standards.pdf> | Minimum stall 8½ × 18 ft (2.59 × 5.49 m) | Stall 2.74 × 5.49 m; aisle 6.1 m | Makes the lot read at real car scale; the effective date was not established. |
| **C1, C3, C5** | Dade code history; FEMA Andrew report; CMHA CMU data (see MATERIALS §9) | CBS shells pre-date 1992; 8″ CMU dimensions | Wall builds in §7 | Period-correct ballistics. |
| **F1** | 1986 Sears Christmas Wishbook. <https://archive.org/details/1986-sears-christmas-wishbook-catalog> | 1986 consumer goods | Prop period check (§8) | Availability only, not a motel inventory. |

**Composite, not a reconstruction.** No measured Biscayne guest-room
dimensions were recovered. The 4.1 × 7.6 m bay is a **P** choice inside the
3.6–4.3 × 6–8 m range typical of the type.

## 3. Site and coordinate frame

- **Axes:** x runs east, z runs south (towards US-1). Origin is the north-west
  corner of the building. 1 unit = 1 m.
- **Stage `lot`** (ground) bounds: **[-2, 0, 52, 44]**. The site is 50 × 32 m
  inside alleys, sidewalk and road. That is smaller than the research
  55 × 65 m because the play space only needs the frontage and courtyard;
  the rear property line is the back wall of the rear block. **G**
- **Stage `f2`** bounds: **[8, 0, 46, 14]**. The backdrop is the `lot` stage
  at dy −3.0 (floor-to-floor 3.0 m, **P**).
- **Perimeter:**
  - West alley x −2…0; east alley x 50…52 (`ground`, unlit).
  - Planter wall z 31.6–32: `cbs_ext`, `cov: waist`. It has gaps at the
    pedestrian walk (x 7.6–9.4), the **IN** drive (x 15–21) and the **OUT**
    drive (x 35–41). It stops at x 41, where the office takes the frontage.
  - Sidewalk z 32–34; road US-1 z 34–44 (backdrop traffic only).

```
lot (1 char = 1 m, quantised; tables in §5 are authoritative)
 #=wall  -=walkway  ^=stair  |=stall lines  o=pool fence  w=water
 ~=planter wall  %=porte-cochere edge  +=yard wall  :=alley  .=sidewalk  ==road
 0 ::#############################################+++++::
 1 ::#   #    #   #   #   #   #   #   ##   #   # #+   +::
 2 ::#   #    #   #   #   #   #   #   ##   #   # #+   +::
 3 ::#LDY#MNT #   #   #   #   #   #   ##   #   HK#+   +::
 4 ::#   #    #101#102#103#104#105#106##107#108# #+   +::
 5 ::#   #    #   #   #   #   #   #   ##   #   # #+   +::
 6 ::#   #    #   #   #   #   #   #   ##   #   # #+   +::
 7 ::#############################################+   +::
 8 ::---------------------------------------------+   +::
 9 ::########-^^------------------------------###^+   +::
10 ::#      #-^^               oooooooooooooooIC#^+YARD::
11 ::# 109  #-^^               o             o# #^+   +::
12 ::#      #-^^               o wwwwwwwwwwwwo###^+   +::
13 ::########-^^               o wwwwwwwwwwwwo  ^^+   +::
14 ::#      #-||||||      |||||o wwwwwwwwwwwwo####+   +::
15 ::# 110  #-|    |      |    o wwwPOOLwwwwwo#  #+   +::
16 ::#      #-|    |      |    o wwwwwwwwwwwwo#  #+   +::
17 ::########-||||||      |||||o wwwwwwwwwwwwo#PMP+   +::
18 ::#      #-|    |      |    o wwwwwwwwwwwwo#  #+   +::
19 ::# 111  #-||||||      |||||ooooooooooooooo####+++++::
20 ::#      #-|    |            ||||||||||||||#########::
21 ::########-|    |            | |  |  | |  |BR##    #::
22 ::#      #-||||||            | |  |  | |  |# ##    #::
23 ::# 112  #-|    |            | |  |  | |  |####MGR #::
24 ::#      #-|    |            | |  |  | |  |BA##    #::
25 ::########-||||||            ||||||||||||||#########::
26 ::#      #-|    |                     %%%%%#########::
27 ::# 113  #-|    |                          #    #  #::
28 ::#      #-||||||                          #    #  #::
29 ::########-|    |                          #LOBB#BO#::
30 ::       --|||||| IN                       #    #  #::
31 ::~~~~~~~--~~~~~~      ~~~~~~~~~~~~~~ %%%%%#########::
32 ......................................................
33 .......................................OUT............
34 ======================================================
     0         1         2         3         4         5

f2 (x from 8; d = guest door, X = knocked-through hole, D = connecting door)
 0  ##################################
 1  #   #   #   #   #   #   ##   #   #
 2  #201#202#203#204#205#206#207 208 #
 3  #   #   #   #   X   #   ##   #   #
 4  #   #   #LKT#COKXCOK#CNT#CRW BOS #
 5  #   #   #   #   #   #   #D   #   #
 6  #   #   #   #   #   #   ##   #   #
 7  ##d###d###d###d###d###d####d###d##--
 8  ------------------------------------   <- balcony walkway, rail on z 9.4
 9  ^___________________________________
10  ^^                                ^^   <- stairs down to lot
     1         2         3         4
```

## 4. Typology rules the layout must keep

1. **No interior corridors.** Every guest room is entered only from an
   exterior walkway. (Connecting doors between pairs are allowed.) **V** M1
2. **Wet cores back-to-back and stacked.** Each bathroom sits at the rear
   (z 0–2.3 in the rear block, x 0–2.3 in the west wing), paired across the
   demising wall with its neighbour. The f2 baths sit over the lot baths.
   **V** M1, M2 (practice); **P** exact size.
3. **Repetitive bays.** Every guest room is 4.1 m wide; only service rooms
   break the rhythm. **P**
4. **Pool separate from cars.** The pool court is fenced, with gates; no
   vehicle touches it. **V** M1, M3
5. **The office addresses the road**, with glass towards the arriving car
   and a porte-cochère for drop-off. **V** M2 (New Yorker, Stardust)
6. **Two stairs**, at opposite ends of the upper block. **V** M1
7. **Back-of-house stays behind.** Laundry, maintenance, housekeeping and
   the service yard sit along the rear and the east alley, reached from
   service doors. **P** (M1 documents rear entrances)

## 5. Room schedule (checkable)

Bounds are `[x0, z0, x1, z1]`. **Ent** is the count of doorways and openings
a pawn can walk through. Windows are not entrances. Builds refer to
MATERIALS §3. **Kind** proposes values for the `rooms[].kind` field.

### 5.1 Stage `lot`

| id | Name | Bounds | Dims (m) | m² | Ent | Entrances | Kind / zone | Roof | Exterior / demising build |
|---|---|---|---|---:|:-:|---|---|---|---|
| `r101`…`r108` | Guest rooms 101–108 | x = 9.4 + 4.1k … +4.1, z 0–7.6 | 4.1 × 7.6 | 31.2 | 1 (103, 104, 106, 107: **2**) | door to rear walkway at z 7.6; connecting doors 103↔104 and 106↔107 | `guest` / rear | f2 above | front and back `cbs_ext`; demising `cmu_hollow`; door `door_solid`; front jalousie `glass_annealed_6` with curtain fill |
| ↳ bath | Bath 1xx | rear 2.3 m: 2.1 × 2.3 against the shared demising wall | 2.1 × 2.3 | 4.8 | 1 | from bedroom | `bath` | — | `stud_wood_gyp`; door `door_hollow` |
| `r109`…`r113` | Guest rooms 109–113 | x 0–7.6, z = 9.4 + 4.1k … +4.1 | 7.6 × 4.1 | 31.2 | 1 | door to west walkway at x 7.6 | `guest` / west | flat roof | as above (bath at x 0–2.3) |
| `laundry` | Laundry | 0, 0, 4.5, 7.6 | 4.5 × 7.6 | 34.2 | 3 | walkway (z 7.6); maintenance; west alley (x 0) | `service` | flat | `cbs_ext`; doors `door_metal` |
| `maint` | Maintenance / store | 4.5, 0, 9.4, 7.6 | 4.9 × 7.6 | 37.2 | 2 | walkway; laundry | `service` | flat | `cbs_ext` / `cmu_hollow`; `door_metal` |
| `hk` | Housekeeping / linen | 42.2, 0, 45, 7.6 | 2.8 × 7.6 | 21.3 | 2 | walkway; service yard (x 45) | `service` | flat | `cbs_ext`; `door_metal` |
| `walk_r` | Rear walkway (ground) | 0, 7.6, 45, 9.4 | 45 × 1.8 | 81.0 | open | open to lot; ends at the west alley gate (x 0) and the east stair | `walk` | f2 balcony above | — (steel pipe columns every 4.1 m) |
| `walk_w` | West walkway | 7.6, 9.4, 9.4, 31.6 | 1.8 × 22.2 | 40.0 | open | open to lot; south end meets the planter gap and sidewalk | `walk` | canopy | — |
| `st_w` | West stair | 9.4, 9.4, 10.8, 13.8 | 1.4 × 4.4 | 6.2 | 2 | foot at z 13.8 (lot); head at about (10.1, 8.5) on f2 | `stair` | open | open riser; steel rail `cov: rail` |
| `st_e` | East stair | 43.6, 9.4, 45, 13.8 | 1.4 × 4.4 | 6.2 | 2 | foot at z 13.8; head at about (44.3, 8.5) on f2 | `stair` | open | as above |
| `ice` | Ice / vending nook | 41, 9.4, 43.5, 12.4 | 2.5 × 3.0 | 7.5 | 1 | open side to walkway (z 9.4) | `service` | flat | `cmu_hollow` |
| `pool` | Pool court | 26.5, 10.6, 41, 20 | 14.5 × 9.4 | 136.3 | 3 gates + 1 door | N gate (x 33–34.2, z 10.6); W gate (x 26.5, z 15–16.2); S gate (x 33–34.2, z 20); pump-room door (x 41) | `court` | open | fence: aluminium picket, `cov: rail`, shoot-through |
| ↳ water | Pool (water) | 28.5, 12.6, 39.5, 18.1 | 11 × 5.5 | 60.5 | — | ladders N and S | `water` | — | coping `cov: none`; water slows rounds (W5) |
| `pump` | Pump / filter room | 41, 14, 45, 20 | 4 × 6 | 24.0 | 2 | pool court (x 41); service yard (x 45) | `service` | flat | `cmu_hollow`; `door_metal` |
| `yard` | Service yard | 45, 0, 50, 20 | 5 × 20 | 100.0 | 3 | housekeeping; pump room; alley gate (x 50, z 9–11) | `yard` | open | yard wall `cmu_hollow`, `cov: full` (2.1 m); chain-link gate |
| `parking` | Courtyard lot (aisles, stalls) | remainder of 9.4, 9.4, 41, 31.6 after pool court, island, west stair and porte-cochère | — | ≈ 500 | — | IN/OUT drives; open to walkways | `lot` | open | stalls 2.74 × 5.49; aisles 6.1 |
| `island` | Landscape island | 21, 20, 27, 25.5 | 6 × 5.5 | 33.0 | — | — | `planter` | open | kerb `brick_1w` at 0.3 m (step); two palms |
| `mgr_liv` | Manager's living / kitchenette | 44, 20, 50, 26 | 6 × 6 | 36.0 | 3 | private door at (47.5, 20) to the yard side; bedroom (x 44); back office (z 26) | `apartment` | flat | `cbs_ext`; internal `stud_wood_gyp`; entry `door_solid` |
| `mgr_bed` | Manager's bedroom | 41, 20, 44, 23.6 | 3 × 3.6 | 10.8 | 2 | living; bath | `apartment` | flat | `stud_wood_gyp` |
| `mgr_bath` | Manager's bath | 41, 23.6, 44, 26 | 3 × 2.4 | 7.2 | 1 | bedroom | `bath` | flat | `stud_wood_gyp` |
| `lobby` | Office / lobby | 41, 26, 46.5, 32 | 5.5 × 6 | 33.0 | 3 | glass door W (x 41, to porte-cochère); street door S (z 32); counter flap to back office | `office` | flat | W wall `glass_tempered_6` storefront on 0.6 m `cbs_ext` sill; counter `counter_cabinet` along x 44 |
| `bo` | Back office | 46.5, 26, 50, 32 | 3.5 × 6 | 21.0 | 3 | lobby; manager's living (z 26); east alley (x 50) | `office` | flat | `cbs_ext`; `door_metal` to alley; safe `steel_10mm` |
| `pc` | Porte-cochère | 36, 26, 41, 31.6 | 5 × 5.6 | 28.0 | open | drive-through from OUT drive | `canopy` | canopy | two `rc_column_40`-style piers 0.4 × 0.4 (use `cmu_filled`) at (36.2, 26.2) and (36.2, 31.4) |

**Totals:** **21 guest keys**: 13 on the lot (101–108, 109–113) and 8 on
f2 (201–208). The research range on the strip is 16–54 (M2). The apartment
totals 54 m², slightly above the 35–50 m² research range, because the 6 m
bay gives a usable kitchenette (**G**). The lot has **13 stalls** (6 west, 2
east, 5 front) for 21 keys. That is below one per key, which suits a
run-down off-season motel; overflow parks on the street (**G**).

**Guest door position:** every guest door is a 0.91 m leaf centred 3.0 m
from the room's left wall as seen from the walkway (west wall for the rear
block, north wall for the west wing). The bath door is on the rear wall,
next to the shared demising wall.

### 5.2 Stage `f2`

| id | Name | Bounds | Dims | m² | Ent | Entrances | Role (gameplay) | Build notes |
|---|---|---|---|---:|:-:|---|---|---|
| `r201`, `r202` | Guest rooms 201–202 | x 9.4–17.6, z 0–7.6 | 4.1 × 7.6 each | 31.2 | 1 | balcony door | Vacant; one has a civilian (W10) | as `r1xx` |
| `r203` | 203 "lookout" | 17.6, 0, 21.7, 7.6 | 4.1 × 7.6 | 31.2 | 1 | balcony door | Lookout at the jalousie facing the IN drive (§6.3) | as `r1xx` |
| `r204` + `r205` | 204/205 "cook rooms" | 21.7, 0, 29.9, 7.6 | 2 × (4.1 × 7.6) | 62.3 | 2 + hole | two balcony doors; **hole** in demising wall x 25.8, z 3.4–4.6 (1.2 m) | Knocked-through drug lab; the crew's main fighting position | the hole is a pre-broken `cmu_hollow` gap with rubble decals; `obj` lab equipment |
| `r206` | 206 "count room" | 29.9, 0, 34, 7.6 | 4.1 × 7.6 | 31.2 | 2 | balcony door; connecting door to 207 at x 34, z 4.6–5.5 | Money objective | `door_solid` connecting door (locked from 207's side) |
| `r207` | 207 "crew" | 34, 0, 38.1, 7.6 | 4.1 × 7.6 | 31.2 | 2 | balcony door; 206 | Crew sleeping, reinforcement source | — |
| `r208` | 208 "boss" | 38.1, 0, 42.2, 7.6 | 4.1 × 7.6 | 31.2 | 1 | balcony door | Boss and bodyguard | — |
| `balc` | Upper balcony walkway | 9.4, 7.6, 45, 9.4 | 35.6 × 1.8 | 64.1 | open | stairs at both ends | Main f2 fighting lane | rail on z 9.4: steel pipe, `cov: rail` |

The f2 roof over housekeeping (x 42.2–45) is the landing for the east stair
head. The laundry, maintenance and west-wing roofs are not walkable (they are
`backdrop`).

## 6. Gameplay overlay (checkable targets)

### 6.1 Entries into the site

| # | Entry | Location | Use |
|---|---|---|---|
| E1 | **IN drive** | x 15–21, z 31.6–32 | Default player start. "Car's out front": the player's car parks on US-1 at (18, 35) |
| E2 | **OUT drive** | x 35–41, z 31.6–32 | Alternative start; under the porte-cochère, next to the lobby |
| E3 | Pedestrian walk | x 7.6–9.4, z 31.6 | Quiet approach up the west walkway |
| E4 | West alley gate | x 0, z 7.6–9.4 | Flank into the rear walkway, out of sight from the courtyard |
| E5 | Laundry alley door | x 0, z 4–5 | Through laundry and maintenance to the walkway |
| E6 | Lobby street door | x 43–44.2, z 32 | Into the office |
| E7 | Back-office alley door | x 50, z 28–29 | Into back office, then apartment, then service yard |
| E8 | Service yard gate | x 50, z 9–11 | To housekeeping or the pump room, then the pool court or the east stair |

**Target:** at least 3 site entries from each of three sides (S: E1, E2,
E3, E6; W: E4, E5; E: E7, E8). Total **8**.

### 6.2 Vertical links

| Link | Lot foot | f2 head | Note |
|---|---|---|---|
| West stair | (10.1, 13.8) | (10.1, 8.5) | Climbs north. Exposed to the parking aisle |
| East stair | (44.3, 13.8) | (44.3, 8.5) | Climbs north. Shielded by the ice nook and pump room |

### 6.3 Sightlines (W1 query targets)

Eye height is 1.6 m (standing). "Clear" means no `full` wall or closed
leaf door blocks it (STYLE-LEVELS §3.4; chest walls block only crouched
sight). Parked cars are props and are excluded from the query.

| # | Stage | From → to | Length | Expected | Intent |
|---|---|---|---:|---|---|
| S1 | lot | (18, 32.5) → (18, 8.5) | 24.0 | **clear** | From the IN drive straight down the west aisle to the doors of 103/203. The lookout in 203 owns the arrival. |
| S2 | lot | (9.6, 8.5) → (44.8, 8.5) | 35.2 | **clear** | Full length of the rear walkway: long, dangerous lane |
| S3 | lot | (42, 29) → (16, 29) | 26.0 | **clear** (through storefront glass) | The clerk sees anything that comes in the IN drive |
| S4 | lot | (42, 29) → (47, 23) | 7.8 | **blocked** | The lobby cannot see into the manager's apartment |
| S5 | lot | (27, 11) → (40.5, 19.5) | 16.0 | **clear** (over the water, rail fence) | Pool-court diagonal: a court is a killing ground, not cover |
| S6 | lot | (8.5, 30) → (8.5, 10) | 20.0 | **clear** | West walkway lane |
| S7 | lot | (20.6, 4) → (20.6, 12) through 103's door | 8.0 | **blocked** (door closed); clear when open | Rooms are boxes; doors are the only view in |
| S8 | f2 | (9.8, 8.5) → (44.5, 8.5) | 34.7 | **clear** | Balcony lane; whoever holds a stair head controls it |
| S9 | f2 | (23.5, 4) → (28, 4) | 4.5 | **clear** (through the hole) | The cook rooms are one fighting space |
| S10 | f2 | (32, 5) → (36, 5) through the connecting door | 4.0 | **blocked** (door closed) | Count room is hidden from the crew room until breached |

**Cross-stage intent (not a 2D query):** from 203's window at
(19.6, 7.6, f2) the IN drive and both aisles are in view. A player on the
lot is visible from the balcony anywhere south of z 9.4.

### 6.4 Cover inventory

| Zone | Cover | Coverage | Stops | Notes |
|---|---|---|---|---|
| Lot | Parked cars (8 of 13 stalls filled) | `car_engine` (indestructible core) + `car_door` | The engine line stops every calibre, .50 included; through the doors, 9mm perforates the near door and stops in the far one (BALLISTICS §4) | Players learn "get behind the engine" |
| Lot | Planter wall | `cbs_ext`, waist | Pistols, buckshot, 5.56 mostly | Street-side cover on the approach |
| Lot | Landscape island | kerb step + palm trunks | Palm trunk `timber` 30 cm: stops pistols | Mid-lot stepping stone between aisles |
| Lot | Porte-cochère piers | `cmu_filled`, full | Everything except .50 | Two 0.4 m piers |
| Pool | Loungers, umbrella tables | props, `cov: waist`, soft | Nothing | Concealment only (deliberate) |
| Pool | Pump room corner | `cmu_hollow` | Pistols; AK/rifle pass | — |
| Walkways | Steel pipe columns | 10 cm | Negligible | Visual rhythm, not cover |
| Walkways | Ice machine, cola machine | `steel_3mm` box with internals | Pistols | Mid-walkway cover near the east stair |
| f2 | Barricade at 205's door | `mattress` + overturned dresser | Pistols partially | Crew prepared position |
| Yard | Dumpster | `steel_3mm` ×2 + contents | Pistols, buckshot | — |

### 6.5 Flank loops (each must be a closed walkable cycle)

| Loop | Path | Length (approx.) |
|---|---|---:|
| L1 | IN drive → west aisle → rear walkway → east aisle around the island → front aisle → IN | 80 m |
| L2 | West walkway → rear walkway → pool N gate → pool S gate → front aisle → west walkway | 75 m |
| L3 | Lobby → back office → manager's living → yard side → service yard → pump room → pool court → front aisle → porte-cochère → lobby | 70 m |
| L4 (cross-stage) | West stair → balcony → east stair → rear walkway → west stair | 75 m |
| L5 (f2 internal) | 204 door → hole → 205 → 205 door → balcony → 204 door | 12 m |
| L6 | West alley gate (E4) → laundry → alley door (E5) → alley | 15 m (escape loop) |

### 6.6 Spawns and enemy placement (by role, for W2 to tune)

| Zone | Count | Role | Behaviour hint |
|---|---:|---|---|
| Parked car in the west row near S1 | 1 | lookout | Alerts f2 if the player enters through E1 |
| Pool court | 2 | dealers with clients | Civilians (clients) scatter (W10 barks) |
| Lobby | 1 | clerk (paid off) | Non-hostile unless the player draws a weapon |
| Rear walkway | 2 | patrol | Walk S2 between the stairs |
| West wing room 111 | 1 | dealer's stash room | Unlocked door; small stash pickup |
| f2 203 | 1 | lookout | Sees S1; shoots from the window |
| f2 204/205 | 3 | cooks + guard | Fight through the hole |
| f2 206 | 1 + `obj` cash | counter | — |
| f2 207 | 3 | crew | Reinforce via the balcony when the alarm is raised |
| f2 208 | 2 | boss + bodyguard | Boss holds the far stair head (east) |

### 6.7 Penetration play notes (from BALLISTICS §4)

- Pistol fire into a guest room **through the front wall** (`cbs_ext`)
  stops. Only the door (`door_solid`) and the jalousie pass rounds.
- Rifles (AK) perforate one `cmu_hollow` demising wall at about 9 % energy
  (web hits stop): room-to-room shots are possible but weak.
- Bath partitions (`stud_wood_gyp`) pass everything. Enemies in bathrooms
  are not safe.
- The 205 barricade and the cook-room hole are the designed "shoot-through"
  moments.
- .50 BMG (if unlocked) perforates every wall in this level.

## 7. Construction summary

Follows MATERIALS §4 ("1950s MiMo motel").

| Element | Build | Coverage | Source |
|---|---|---|---|
| Exterior shell | `cbs_ext` | full | **V** M1, C3, C5 |
| Guest-room demising walls | `cmu_hollow` | full | **P** M1 |
| Bath and closet partitions | `stud_wood_gyp` | full | **P** M1, C4 |
| Guest doors | `door_solid` | — | **P** |
| Bath doors | `door_hollow` | — | **P** |
| Service, alley and yard doors | `door_metal` | — | **P** |
| Guest-room windows | `glass_annealed_6` jalousie + curtain fill | glass | **V** M1 (jalousies) |
| Office storefront | `glass_tempered_6` on `cbs_ext` sill (0.6 m) | glass | **P** |
| Planter wall | `cbs_ext` | waist | **P** |
| Yard wall | `cmu_hollow` | full (2.1 m) | **P** |
| Balcony and stair rails, pool fence | open pipe or picket (no build) | rail | **P** |

## 8. Props by zone (circa 1986)

Suggested dressing, not an inventory of the named motels. F1 is the period
check for consumer goods.

| Zone | Props |
|---|---|
| Guest room | queen bed **or** two doubles; nightstands with lamps; dresser with a CRT TV (wood-grain 19″, F1); luggage rack; corded phone; small table and two chairs; glass ashtray; heavy curtains; through-wall AC under the window; framed seascape print |
| Bath | tub/shower with curtain; toilet; vanity; mirror; towel rail; small tiles; paper-wrapped soap |
| Crew rooms (f2) | mattresses on the floor; duffel bags; takeaway boxes; boom box (F1); pager on the dresser; guns on the bed |
| Cook rooms 204/205 | folding tables; glassware; hot plates; propane bottles; box fan in the window; plastic sheeting; rubble from the hole |
| Count room 206 | card table; money counter; rubber-banded stacks; scales; adding machine |
| Walkways | numbered door plaques; wall lamps; housekeeping cart; a single plastic chair; "DO NOT DISTURB" tags |
| Ice nook | ice machine; cola machine (lit); bin |
| Pool court | loungers; umbrella tables; life ring; "NO LIFEGUARD ON DUTY" sign; planters; cabana towel shelf (M3) |
| Lot | wheel stops; pole lights; palms; 1970s–80s sedans and one van; a pay phone by the sidewalk |
| Lobby | registration counter; key rack with numbered fobs; corded phones; cash drawer; paper ledger; brochure rack; wall clock; two upholstered chairs; "VACANCY" neon sign in the window |
| Back office | desk; filing cabinet; floor safe; adding machine; spare key board. No CCTV monitor: not typical of a small 1986 motel |
| Manager's apartment | dinette set; sofa; console TV; kitchenette (two-burner, small fridge); household phone; family photos |
| Laundry | front-loading washers and dryers; folding table; linen shelves; carts; mop sink |
| Maintenance | workbench; paint cans; spare AC unit; ladders; tool board |
| Service yard | dumpster; propane cage; chain-link gate; pallets |
| Frontage | tall pole sign "MOTEL SUNSET — COLOR TV — AIR COND — POOL" (MiMo neon, M2) |

## 9. Open questions for W2 and W1

1. **Pool water and ballistics:** water as a material (rounds stop within
   about 1 m) is not in MATERIALS yet. Propose `water` `res` ≈ 50 J/cm for
   W5 if pool shots matter.
2. **Rails:** "open, `cov: rail`" needs a contract value with no build (or a
   `rail_pipe` build with `res` 0 and a bullet-catch chance). W1 to decide.
3. **Curtain fill** for jalousies (MATERIALS §3 "Coverage is separate") is
   assumed here.
4. Parked-car density (8 of 13) is a W2 tuning knob.
