# Ocean View Mall: floorplan reference and layout brief

> **Status:** W3 research deliverable (wave 1). This is docs only, not a runtime map.
> **Consumers:** W2 (level designer) builds the stage from it. W1's floorplan
> visualiser and query tools check the result against §5 and §6. W4 (decor)
> uses §8. W5 uses §6.7 and §7.
> **Mission brief:** levels.js line 101: *"Take the night off. Ocean View
> Mall, my treat. What's the worst that could happen?"* W10d script draft
> (Job 6, team file, not in the repo): header *"Revenge is a dish best served
> at the food court."*; McWey: *"Who else knows I'm going?" / "Me. And
> whoever I told."*; debriefs *"Lex hit your ride. You hit his mall."* and
> *"Lex torched your ride, so you fly now. Helicopter's on the roof."*
> **Evidence tags:** **V** verified from a cited source, **D** derived from
> sources, **P** proposed design choice (plausible, not measured), **G**
> gameplay override.
> **Validated:** area bounds, door and window geometry, reachability, m²
> totals, loops L1–L5, connectivity C1–C8 and sightlines S1–S16 were checked
> by script against the table data in §5–§6, plus a 0.6 m prop-free strip on
> both sides of every door, the kiosk's clearance to the storefronts and the
> east dead end (no overlaps; enclosed 2 112.0 m² + exterior 960.0 m² = 3 072.0 m²
> of walkable site).
> **Machine-readable layout:** `docs/levels/mall.layout.json` (STYLE-LEVELS
> §3.1), with `R`, `D`, `W` (storefront glass), `B` (props with roles) and
> `S` (sightline targets).

---

## 1. Design intent

The legacy level (levels.js lines 101–116) is a 41 × 14 cell box: two shop
blocks on the west, two on the east, an open centre court with tables and
plants, and the parking lot to the south. Enemies stand in every shop and
in the court; a counter (`K`) sits in the south-west shop; three gaps lead out to the lot. That reads as a
mall, but a gamey one: the shops are open boxes, there is no back of house,
and the court has no reason to be where it is.

This brief keeps the legacy reading (shops either side of a central food
court, parking to the south, three ways in from the lot: here the entrance D1 and the exit doors D34 and D35) and makes it a real
**1986 single-level enclosed mall wing** (MI3, MI8):

- **A food court at the crossing.** A skylit seating court (P; MD1) with
  four counters on its north side, each with a kitchen behind it (FC3: shared
  seats served by several vendors). The script's set piece happens here.
- **A real concourse.** 10 m wide, inside the period's 30–40 ft norm (MD1),
  with a kiosk that keeps the 10 ft clear strip in front of the shops (MC1).
- **Back of house.** Every tenant has a rear steel door onto a service
  corridor that runs behind the shops to the exits (MD1 servicing; MC1 exit
  passageways). This is the level's hidden second network: the shops' public
  fronts and the corridors' private backs.
- **An anchor at the end.** A department store closes the east concourse
  with its shutter down. Mall egress can't run through an anchor (MC1), so
  the east concourse is a dead end, kept within the code limit.
- **Closing time.** The player arrives at about 9:25 p.m., as the mall shuts
  (P). The shops' grilles are still up until 9:30, the last shoppers are
  leaving, and the food court is the brightest space. Two of the four
  counters have already pulled their shutters fully down (D6, D7), and so
  has the anchor (D23). The two counters still open are where the ambush
  waits.

**Why closing time.** The legacy brief says "night", and the script is an
ambush ("Me. And whoever I told."). A mall that is open but emptying gives
the ambush a believable stage: the guards are Lex's, the shutters explain
which counters are closed, and the few civilians flee through the entrance when
the shooting starts (§9 Q2).

## 2. References and what each contributes

Images are not copied; read the sources at the links.

| id | Source | What it shows (evidence) | Used for | Why it matters |
|---|---|---|---|---|
| **MD1** | *Time-Saver Standards for Building Types*, 2nd ed. (1980; 1987 printing), "Regional Shopping Centers", L. Douglass, pp. 716–718. <https://archive.org/details/TimeSaverStandardsForBuildingTypes/page/n734/mode/2up> | Period design guide: frontage modules of 20, 25 and 30 ft (30 ft the most flexible); store depths of 120–140 ft; shop clear height 10–14 ft, 12 ft a good average; malls 30–40 ft wide outnumber those of 50 ft or more; skylit courts; sliding glass panels or roll-up grilles close storefronts at night; servicing by rear alleys, service courts or tunnels (V) | Concourse width, shop frontages, shop height, night closures, service corridors | The period baseline: a mall built to 1980 guidance. |
| **MD2** | Same book, "Restaurants and Eating Places", pp. 755–756, 764. <https://archive.org/details/TimeSaverStandardsForBuildingTypes/page/n773/mode/2up> | Cafeteria dining at 16–18 sq ft (1.5–1.7 m²) a seat; 14 × 18 in trays, four of which fit a 48 in square table; tray stands and refuse storage (V) | Table groups (48 in tables), seat count, tray stations (§8) | Food court furniture at real sizes. |
| **MC1** | 2021 Seattle Building Code, ch. 4, §402 (reproduces IBC §402, covered mall buildings). <https://www.seattle.gov/documents/Departments/SDCI/Codes/SeattleBuildingCode/2021SBCChapter4.pdf> | 20 ft minimum aggregate mall width, each part at least 10 ft clear of kiosks and furniture; 200 ft travel to an exit; dead-end mall no longer than twice its width; exit passageways at least 66 in; kiosks at most 300 sq ft, 20 ft apart; no mall egress through an anchor; occupant load factor 25 + 0.00007 × GLA, between 30 and 50 sq ft a person (V, modern) | Kiosk clearance, the east dead end, service-corridor widths, occupant load (§5.4) | A modern code, used as a check (D), not as 1986 Miami law. |
| **MC2** | 2021 Seattle Building Code, ch. 10, Table 1004.5, §§1008, 1020, 1024. <https://www.seattle.gov/documents/Departments/SDCI/Codes/SeattleBuildingCode/2021SBCChapter10.pdf> | Unconcentrated seating at 15 net sq ft a person; kitchens at 200 gross sq ft; 50 ft dead ends in sprinklered corridors; egress lighting of at least 1 foot-candle while occupied (V, modern) | Food court load (§5.4); service corridor dead ends; night lighting (§8) | The same check for the court and the corridors. |
| **FC1** | "Rouse Left Mark on All Malls, Not Just His Own", *Shopping Centers Today* (ICSC), 2004. <https://web.archive.org/web/20121017075432/http://www.icsc.org/srch/sct/sct0504/page42.php> | Rouse's food court at Paramus Park (1974) succeeded after an earlier failed try; the "community picnic" idea (S) | Food courts were standard by 1986 (D) | Period fit. |
| **FC2** | "Paramus Park", Wikipedia. <https://en.wikipedia.org/wiki/Paramus_Park> | Paramus Park (1974): a food court round an atrium, with skylit promenades; Sherway Gardens' Gourmet Fair (1971) as an early court (S) | Skylit court over the seating (P) | A skylit food court is a 1970s idea. |
| **FC3** | "1983: Restaurants court customers with new dining options in Indianapolis", WRTV (2020, reprinting 1983 reporting). <https://www.wrtv.com/news/1983-restaurants-court-customers-with-new-dining-options-in-indianapolis/> | A 1983 food court: four vendors sharing 500 seats (V) | Four counters round shared seating | A 1983 court with exactly this vendor count. |
| **FC4** | Dadeland Mall renovation, Bartlett Hartley & Mulkey. <https://bhmarc.com/portfolio-item/dadeland-mall/> | A skylight over Dadeland's food court, fritted against Miami sun (V; date of the skylight not established) | Fritted skylight, palms in planters (§8, P) | A Miami food court under glass, though not proven for 1986. |
| **MI2** | "Dadeland Center", Mall Hall of Fame. <https://mall-hall-of-fame.blogspot.com/2009/12/dadeland-center-southwest-88th-street.html> | Dadeland (1962, enclosed 1969–71): single-level main wings, multilevel anchors; the Terrace Food Court, 15 bays, open by 1986 (S) | A Miami food court in 1986; single-level wings | The closest local precedent. |
| **MI3** | "Miami International Mall", Wikipedia. <https://en.wikipedia.org/wiki/Miami_International_Mall> | Opened 1982: enclosed, one main shopping level, multilevel anchors (S) | One storey; anchors at the ends | The model for a single-level enclosed wing. |
| **MI5** | "163rd Street Center", Mall Hall of Fame. <https://mall-hall-of-fame.blogspot.com/search/label/Miami%20Malls> | Enclosed 1981–82 under a translucent canopy; the Grandstands Food Court, 12 bays (1982); a service tunnel (S) | Food court scale; back-of-house network | A second Miami court of the period. |
| **MI8** | "Cutler Ridge Regional Shopping Center", Mall Hall of Fame. <https://mall-hall-of-fame.blogspot.com/2009/12/cutler-ridge-regional-shopping-center.html> | Enclosed wing opened 1978, a further wing 1981; a single-level main mall (S) | Single-level enclosed wing | A third local precedent. |
| **SEC1** | K. Riismandel, "Arcade Addicts and Mallrats: Producing and Policing Suburban Public Space in 1980s America", *Environment, Space, Place* 5(2), 2013, pp. 65–89. <https://pdcnet.org/esplace/content/esplace_2013_0005_0002_0065_0089> | Professional private guards and CCTV in 1980s malls (S) | The security office with CCTV (`security`) | Why a mall has an armed office. |
| **SEC2** | "1980s CCTV Control Room", Kinolibrary clip CC21. <https://www.youtube.com/watch?v=MLlyEsMaqFA> | A mall security room lined with monitors (V, catalogue description; mall and place unknown) | The CCTV desk (SECD) and its dressing | What the room looks like. |
| **HP1** | AirNav, "84CA — Beverly Center Heliport". <https://www.airnav.com/airport/84CA> | A rooftop heliport on a Los Angeles mall, activated April 1983; today a 50 × 50 ft concrete pad, private use (V) | The roof helipad is plausible (§9 Q4) | A real 1983 mall helipad. |

**Not used, and why.** Bayside Marketplace (MI7) opened in 1987 and is open
air. The Falls (MI9) is open air. Omni's Treats food court dates from 1987.
"Mall of the Americas" was still Midway Mall in 1986 (MI4). No enclosed,
single-level, ocean-view mall in Miami was verified, so the name "Ocean
View" is the developer's marketing (P; §9 Q6).

**What is real and what is proposed.** The concourse width, the shop
modules, the night grilles, the service corridors and the skylit food court
come from MD1, MD2 and FC1–FC4. The code checks (kiosk clearance, dead end,
corridor widths, occupant load) come from MC1 and MC2 as modern yardsticks.
The tenant mix, closing time and the exact layout are P.

## 3. Site and coordinate frame

Metres. **x** runs west → east (0–64), **z** runs north → south (0–48). The
on-stage building is x 0–64 × z 3–36: one wing of a larger mall, one storey.
The west concourse, the north service corridor and the south-west service
corridor continue off stage to the west (the rest of the mall). The anchor
department store fills the east end (x 56–64) and continues off stage to the
east. The service drive and loading dock lie north (z 0–3). The entrance
walk (z 36–39) and the parking lot (z 39–48) lie south. The stage edges are
the north side of the dock, the far side of the lot, x = 0 and x = 64.

Heights (P): shops 3.7 m clear (12 ft, MD1); concourse 5.5 m with a
clerestory; food court under a pyramid skylight at about 8 m (FC2, FC4).
One floor level and no steps. The roof is not on stage (§9 Q4).

### 3.1 Plan (generated from the sidecar; tables in §5–§6 are authoritative)

```
0         1         2         3         4         5         6   
0123456789012345678901234567890123456789012345678901234567890123
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  z 0
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
############DD###############################DD############DDD##
#kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk##AAAAAA#
##D#############D##D#####D#####D#####D#######D########D##AAAAAA#  z 5
#rrrrrrr##rrrrrrr##ffff##ffff##ffff##ffff##$$$$##jjjjjj##AAAAAA#
#rrrrrrr##rrrrrrr##ffff##ffff##ffff##ffff##$$$$##jjjjjj##AAAAAA#
#rrrrrrr##rrrrrrr##ffff##ffff##ffff##ffff##$$$$##jjjjjj##AAAAAA#
#ccccccc##rrrrrrr##ffff##ffff##ffff##ffff##ccc$##jjjjjj##AAAAAA#
#ccccccc##rrrrrrr##ffff##ffff##ffff##ffff########cccccc##AccccA#  z 10
#rrrrrrr##rrrrrrr##ffff##ffff##ffff##ffff########jjjjjj##AccccA#
#rrrrrrr##rrrrrrr##ffff##ffff##ffff##ffff##tttt##jjjjjj##AAAAAA#
#rrrrrrr##rrrrrrr##ffff##ffff##ffff##ffff##tttt##jjjjjj##AAAAAA#
#rrrrrrr##rrrrrrr##cccc##cccc##cccc##cccc##tttt##jjjjjj##AAAAAA#
#++++++DD#DD++++++#cccc #DDDDD#DDDDD#cccc ##  ###DD+++++#AAAAAA#  z 15
#++++++DD#DD++++++      #DDDDD#DDDDD#      #  ###DD+++++#AAAAAA#
#................  ......................  ............DDAAAAAA#
#................  .ttt.ttt.......ttt.ttt  ............DDAAAAAA#
#......cccc......  .ttt.ttt.......ttt.ttt  ............DDAAAAAA#
#.cc...cccc......  .ttt.ttt.......ttt.ttt  ....ccc.....DDAAAAAA#  z 20
#.cc...cccc......  .........oooo.........  ....ccc.....DDAAAAAA#
#......cccc......  .........oooo.........  ............DDAAAAAA#
#................  .........oooo.........  ............DDAAAAAA#
#................  .........oooo.........  ............DDAAAAAA#
#+++++++++++++#DD  .ttt.ttt.......ttt.ttt  DD#++++++++++#AAAAAA#  z 25
#+++++++++++++#DD##.ttt.ttt.......ttt.ttt##DD#++++++++++#AccccA#
#rrrrrrrrrrrrrrrr##.ttt.ttt.......ttt.ttt##rrrrrrrrrrrr##AccccA#
#rccccccccccccccr##......................##rrrrrrrrrrrr##AAAAAA#
#rrrrrrrrrrrrrrrr##+++++#DD##DDD##DD#+++++#rrrrrrrrrrrr##AAAAAA#
#rrrrrrrrrrrrrrrr##+++++#DD##DDD##DD#+++++#rrrrrrrrrrrr##AAAAAA#  z 30
#rrrrrrrrrrrrrrrr##ccccrrr##vvvv##rrrrrrr##rrrrrrrrrrrr##AAAAAA#
#rrrrrrrrrrrrrrrr##rrrrrrr##vvvv##rrrrrcc##cccccccccccc##AAAAAA#
#########D############D#####vvvv######D##########D#######AAAAAA#
#########D############D#####vvvv######D##########D#######AAAAAA#
############DD###############DDD#############DD############DD+++  z 35
ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
================================================================
================================================================  z 40
================================================================
==============================CCCCC=============================
==============================CCCCC=============================
================================================================
================================================================  z 45
================================================================
================================================================
```

Key: `#` wall, `D` door leaf or shutter, `+` storefront glass, space = open
opening; `.` concourse and court, `f` food kitchens, `r` shops, `j`
jeweller, `$` security, `t` restrooms, `k` service corridors, `v` vestibule,
`A` anchor, `a` dock, `s` entrance walk, `=` lot; props: `c` counters and
fixtures, `t` table groups (inside the court), `o` fountain, `C` car.
The `z` labels give the row's north coordinate. Cells are 1 m; half-metre walls (z = 5.5) are drawn on the nearest row.

## 4. Typology rules the layout must keep

1. **One level, a single wing.** Like MI3 and MI8, the shopping is on one
   level; the anchor may be taller (P). Don't add a mezzanine.
2. **Concourse 9–12 m wide.** The concourse is 10 m (30–40 ft, MD1). Any
   kiosk or furniture must leave at least 3.05 m (10 ft) clear in front of
   every storefront (MC1); the kiosk leaves 3.8 m each side.
3. **Shop frontages on the module.** Shop frontages are combinations of
   MD1's 20, 25 and 30 ft modules (6, 7.6 and 9 m): jeweller 8 m, records and
   shoes 9 m, electronics 14 m, toys 18 m. Food counters are 6 m (P). Depths
   are compressed to 4–10.5 m against MD1's 37–43 m (G: the stage shows the
   sales floor only; stockrooms are implied).
4. **Every tenant has two doors.** A glass front onto the mall and a steel
   rear door onto a service corridor (MD1 servicing; MC1 secondary exits).
   The security office has only one door (C4); the restrooms, which are
   not a tenant, have one opening to the concourse.
5. **The service corridors are exits, not storage** (dressing stays against
   the walls, outside a 1.68 m clear lane). At least 1.68 m wide
   (66 in, MC1; here 2–2.5 m), each with its own exit doors to the outside
   (D21, D22, D34, D35), dead ends no longer than 15.2 m (50 ft, MC2; the
   longest is 14 m).
6. **The anchor is separate.** The anchor's shutter D23 is down and locked.
   It has its own street and dock doors (D24, D25). The east concourse,
   ending at the anchor, is a dead end of 14 m against MC1's 20 m limit
   (twice its 10 m width).
7. **The food court is the crossing.** The court opens full width onto both
   concourses (D3, D4) and to the entrance vestibule (D2). Its counters face
   the seating; their kitchens back onto the north service corridor.
8. **The entrance is a vestibule.** Two pairs of glass doors (D1, D2), 6 m
   apart (P, a weather lobby): the only public way in from the lot.

## 5. Area schedule (checkable)

Bounds are `[x0, z0, x1, z1]`. **Ent** counts doorways and openings a pawn
can walk through. Windows are not entrances. Where exterior areas meet, the
edge is unwalled and §5.2 lists it as an `open` row; their edges against
nothing are stage edges. Every other room edge is a wall. Builds refer to
MATERIALS §3.

### 5.1 Stage `mall`

| id | Name | Kind | Bounds | Dims (m) | m² | Ent | Entrances | Research | Tag |
|---|---|---|---|---|---:|:-:|---|---|:-:|
| `dock` | Service drive and loading dock | exterior | 0, 0, 64, 3 | 64 × 3 | 192.0 | 3 | D21, D22, D25 (+ north stage edge) | MD1 | P |
| `plaza` | Entrance walk | exterior | 0, 36, 64, 39 | 64 × 3 | 192.0 | 5 | D1, D24, D34, D35, D36 | — | P |
| `lot` | Parking lot | exterior | 0, 39, 64, 48 | 64 × 9 | 576.0 | 1 | D36 (+ stage edges) | — | P |
| `svc` | North service corridor | circulation | 0, 3, 56, 5.5 | 56 × 2.5 | 140.0 | 10 | D9, D10, D11, D12, D14, D16, D17, D20, D21, D22 (+ continues off stage west) | MD1, MC1 | D |
| `records` | Record store | retail | 0, 5.5, 9, 16 | 9 × 10.5 | 94.5 | 2 | D13, D14 | MD1 module | D |
| `shoes` | Shoe store | retail | 9, 5.5, 18, 16 | 9 × 10.5 | 94.5 | 2 | D15, D16 | MD1 module | D |
| `fc1` | Pizza counter and kitchen | kitchen | 18, 5.5, 24, 16 | 6 × 10.5 | 63.0 | 2 | D5, D9 | MI2, MI5 | P |
| `fc2` | Chinese counter and kitchen | kitchen | 24, 5.5, 30, 16 | 6 × 10.5 | 63.0 | 2 | D6, D10 | MI2, MI5 | P |
| `fc3` | Burger counter and kitchen | kitchen | 30, 5.5, 36, 16 | 6 × 10.5 | 63.0 | 2 | D7, D11 | MI2, MI5 | P |
| `fc4` | Cuban cafe counter and kitchen | kitchen | 36, 5.5, 42, 16 | 6 × 10.5 | 63.0 | 2 | D8, D12 | MI2, MI5 | P |
| `security` | Mall security office | service | 42, 5.5, 48, 11 | 6 × 5.5 | 33.0 | 1 | D17 | SEC1, SEC2 | P |
| `wc` | Restrooms | bath | 42, 11, 48, 16 | 6 × 5 | 30.0 | 1 | D18 | — | P |
| `jewel` | Jeweller | retail | 48, 5.5, 56, 16 | 8 × 10.5 | 84.0 | 2 | D19, D20 | MD1 module | D |
| `anchor` | Department store (anchor, slice) | retail | 56, 3, 64, 36 | 8 × 33 | 264.0 | 3 | D23, D24, D25 | MC1, MI2 | D |
| `mall_w` | West concourse | circulation | 0, 16, 18, 26 | 18 × 10 | 180.0 | 4 | D3, D13, D15, D26 (+ concourse continues off stage west) | MD1, MC1 | D |
| `court` | Food court (skylit) | assembly | 18, 16, 42, 30 | 24 × 14 | 336.0 | 9 | D2, D3, D4, D5, D6, D7, D8, D28, D30 | FC1–FC3, MD2 | D |
| `mall_e` | East concourse | circulation | 42, 16, 56, 26 | 14 × 10 | 140.0 | 5 | D4, D18, D19, D23, D32 | MD1, MC1 | D |
| `toys` | Toy store | retail | 0, 26, 18, 34 | 18 × 8 | 144.0 | 2 | D26, D27 | MD1 module | P |
| `photo` | One-hour photo | retail | 18, 30, 27, 34 | 9 × 4 | 36.0 | 2 | D28, D29 | — | P |
| `entry` | Entrance vestibule | circulation | 27, 30, 33, 36 | 6 × 6 | 36.0 | 2 | D1, D2 | — | P |
| `florist` | Florist | retail | 33, 30, 42, 34 | 9 × 4 | 36.0 | 2 | D30, D31 | — | P |
| `electronics` | Electronics store | retail | 42, 26, 56, 34 | 14 × 8 | 112.0 | 2 | D32, D33 | MD1 module | P |
| `svc_sw` | South-west service corridor | circulation | 0, 34, 27, 36 | 27 × 2 | 54.0 | 3 | D27, D29, D34 (+ continues off stage west) | MC1, MC2 | P |
| `svc_se` | South-east service corridor | circulation | 33, 34, 56, 36 | 23 × 2 | 46.0 | 3 | D31, D33, D35 | MC1, MC2 | P |

Totals: enclosed 2 112.0 m² (21 rooms); exterior 960.0 m².

### 5.2 Doors and openings

`x=c` is a wall on the line x = c, with the opening centred at the stated z
(and vice versa). **Kind** maps to MATERIALS §3 builds; `open` is an opening
with no leaf; `glass` is a `glass_tempered_6` storefront door or window. A
rolling shutter that is down is modelled as `door_metal` (§9 Q1).

| Door | Rooms | Wall, centre | Width | Kind |
|---|---|---|---:|---|
| D1 | `entry` ↔ `plaza` | z=36, x 30 | 3.0 | glass (entrance pair, outer) |
| D2 | `entry` ↔ `court` | z=30, x 30 | 3.0 | glass (entrance pair, inner) |
| D3 | `mall_w` ↔ `court` | x=18, z 21 | 10.0 | open (concourse into the court) |
| D4 | `court` ↔ `mall_e` | x=42, z 21 | 10.0 | open (court into the east concourse) |
| D5 | `fc1` ↔ `court` | z=16, x 21 | 5.0 | open (pizza counter; grille up) |
| D6 | `fc2` ↔ `court` | z=16, x 27 | 5.0 | door_metal (rolling shutter, down) |
| D7 | `fc3` ↔ `court` | z=16, x 33 | 5.0 | door_metal (rolling shutter, down) |
| D8 | `fc4` ↔ `court` | z=16, x 39 | 5.0 | open (Cuban café counter; grille up) |
| D9 | `fc1` ↔ `svc` | z=5.5, x 19 | 0.9 | door_metal (kitchen rear) |
| D10 | `fc2` ↔ `svc` | z=5.5, x 25 | 0.9 | door_metal (kitchen rear) |
| D11 | `fc3` ↔ `svc` | z=5.5, x 31 | 0.9 | door_metal (kitchen rear) |
| D12 | `fc4` ↔ `svc` | z=5.5, x 37 | 0.9 | door_metal (kitchen rear) |
| D13 | `records` ↔ `mall_w` | z=16, x 7.5 | 1.8 | glass (shop door) |
| D14 | `records` ↔ `svc` | z=5.5, x 2 | 0.9 | door_metal (shop rear) |
| D15 | `shoes` ↔ `mall_w` | z=16, x 10.5 | 1.8 | glass (shop door) |
| D16 | `shoes` ↔ `svc` | z=5.5, x 16 | 0.9 | door_metal (shop rear) |
| D17 | `security` ↔ `svc` | z=5.5, x 45 | 0.9 | door_metal (security office; the only door) |
| D18 | `wc` ↔ `mall_e` | z=16, x 45 | 1.5 | open (restroom lobby) |
| D19 | `jewel` ↔ `mall_e` | z=16, x 49.5 | 1.8 | glass (shop door) |
| D20 | `jewel` ↔ `svc` | z=5.5, x 54 | 0.9 | door_metal (shop rear) |
| D21 | `svc` ↔ `dock` | z=3, x 13 | 1.8 | door_metal (exit pair to the dock) |
| D22 | `svc` ↔ `dock` | z=3, x 46 | 1.8 | door_metal (exit pair to the dock) |
| D23 | `anchor` ↔ `mall_e` | x=56, z 21 | 8.0 | door_metal (anchor rolling shutter, down and locked) |
| D24 | `anchor` ↔ `plaza` | z=36, x 60 | 1.8 | glass (anchor street door) |
| D25 | `anchor` ↔ `dock` | z=3, x 60 | 3.0 | door_metal (anchor loading door) |
| D26 | `toys` ↔ `mall_w` | z=26, x 16 | 1.8 | glass (shop door) |
| D27 | `toys` ↔ `svc_sw` | z=34, x 9 | 0.9 | door_metal (shop rear) |
| D28 | `photo` ↔ `court` | z=30, x 25.5 | 1.8 | glass (shop door) |
| D29 | `photo` ↔ `svc_sw` | z=34, x 22 | 0.9 | door_metal (shop rear) |
| D30 | `florist` ↔ `court` | z=30, x 34.5 | 1.8 | glass (shop door) |
| D31 | `florist` ↔ `svc_se` | z=34, x 38 | 0.9 | door_metal (shop rear) |
| D32 | `electronics` ↔ `mall_e` | z=26, x 44 | 1.8 | glass (shop door) |
| D33 | `electronics` ↔ `svc_se` | z=34, x 49 | 0.9 | door_metal (shop rear) |
| D34 | `svc_sw` ↔ `plaza` | z=36, x 13 | 1.8 | door_metal (exit pair, panic bar) |
| D35 | `svc_se` ↔ `plaza` | z=36, x 46 | 1.8 | door_metal (exit pair, panic bar) |
| D36 | `plaza` ↔ `lot` | z=39, x 32 | 64.0 | open (kerb edge) |
| W1 | `records` ↔ `mall_w` | z=16, x 3.25 | 5.5 | glass (storefront window) |
| W2 | `shoes` ↔ `mall_w` | z=16, x 14.5 | 6.0 | glass (storefront window) |
| W3 | `jewel` ↔ `mall_e` | z=16, x 53.25 | 5.0 | glass (storefront window) |
| W4 | `toys` ↔ `mall_w` | z=26, x 7.5 | 13.0 | glass (storefront window) |
| W5 | `photo` ↔ `court` | z=30, x 21 | 5.0 | glass (storefront window) |
| W6 | `florist` ↔ `court` | z=30, x 39 | 5.0 | glass (storefront window) |
| W7 | `electronics` ↔ `mall_e` | z=26, x 50.5 | 10.0 | glass (storefront window) |
| W8 | `anchor` ↔ `plaza` | z=36, x 62.5 | 2.6 | glass (storefront window) |

### 5.3 Props with gameplay roles (sidecar `B`)

Footprints keep a 0.6 m clear strip on both sides of every door and window.

| id | Role | Footprint `[x0, z0, x1, z1]` | Size | Build | Coverage |
|---|---|---|---|---|---|
| FOUNT | Fountain planter, centre of the court | 28, 21.5, 32, 24.5 | 4 × 3 | `brick_1w` | waist |
| TB1 | Table group (48 in table, 4 chairs) | 20, 18.5, 22.2, 20.7 | 2.2 × 2.2 | `particle_divider` | waist |
| TB2 | Table group (48 in table, 4 chairs) | 24, 18.5, 26.2, 20.7 | 2.2 × 2.2 | `particle_divider` | waist |
| TB3 | Table group (48 in table, 4 chairs) | 34, 18.5, 36.2, 20.7 | 2.2 × 2.2 | `particle_divider` | waist |
| TB4 | Table group (48 in table, 4 chairs) | 38, 18.5, 40.2, 20.7 | 2.2 × 2.2 | `particle_divider` | waist |
| TB5 | Table group (48 in table, 4 chairs) | 20, 25, 22.2, 27.2 | 2.2 × 2.2 | `particle_divider` | waist |
| TB6 | Table group (48 in table, 4 chairs) | 24, 25, 26.2, 27.2 | 2.2 × 2.2 | `particle_divider` | waist |
| TB7 | Table group (48 in table, 4 chairs) | 34, 25, 36.2, 27.2 | 2.2 × 2.2 | `particle_divider` | waist |
| TB8 | Table group (48 in table, 4 chairs) | 38, 25, 40.2, 27.2 | 2.2 × 2.2 | `particle_divider` | waist |
| CT1 | Serving counter, pizza | 18.2, 14.6, 22.9, 15.2 | 4.7 × 0.6 | `counter_cabinet` | chest |
| CT2 | Serving counter, Chinese | 24.2, 14.6, 28.9, 15.2 | 4.7 × 0.6 | `counter_cabinet` | chest |
| CT3 | Serving counter, burgers | 30.2, 14.6, 34.9, 15.2 | 4.7 × 0.6 | `counter_cabinet` | chest |
| CT4 | Serving counter, Cuban café | 36.2, 14.6, 40.9, 15.2 | 4.7 × 0.6 | `counter_cabinet` | chest |
| KIOSK | Sunglasses kiosk | 7.5, 19.8, 10.5, 22.2 | 3 × 2.4 | `counter_cabinet` | chest |
| PL1 | Planter with palm | 2, 20, 4, 22 | 2 × 2 | `brick_1w` | waist |
| BN1 | Bench | 47, 20.5, 50, 21.5 | 3 × 1 | `counter_cabinet` | waist |
| RR | Record racks | 1, 9, 8, 10.5 | 7 × 1.5 | `particle_divider` | waist |
| JC | Jewellery cases | 49, 10, 55, 11 | 6 × 1 | `counter_cabinet` | waist |
| SECD | CCTV monitor desk | 42.2, 9.8, 46, 10.8 | 3.8 × 1 | `counter_cabinet` | chest |
| AR1 | Clothing racks | 58, 10, 62, 12 | 4 × 2 | `counter_cabinet` | chest |
| AR2 | Cosmetics counters | 58, 26, 62, 28 | 4 × 2 | `counter_cabinet` | waist |
| TS | Toy shelving | 2, 28, 16, 29 | 14 × 1 | `particle_divider` | full |
| EL | TV wall | 43, 32, 55, 33 | 12 × 1 | `counter_cabinet` | full |
| PH | Photo counter | 19, 31.4, 23, 32 | 4 × 0.6 | `counter_cabinet` | waist |
| FL | Flower cooler | 39.8, 32.5, 41.8, 33.8 | 2 × 1.3 | `counter_cabinet` | full |
| CAR | Player car | 30, 42, 34.8, 43.9 | 4.8 × 1.9 | `car_door` | waist |

The table groups are 2.2 m squares: a 48 in (1.22 m) table with four
chairs (MD2). Eight groups seat 32. The rest of the court's seating is
dressing (§8), so the floor stays open to move through.

### 5.4 Occupant load (D, MC1, MC2)

| Zone | Basis | Factor | Persons |
|---|---|---|---:|
| Food court seating | ≈ 300 m² net | 1.39 m² (15 sq ft, MC2) | ≈ 215 |
| Shops and counters on stage | 853 m² gross leasable | 4.65 m² (50 sq ft, MC1 cap for a large mall) | ≈ 184 |
| **Total** | | | **≈ 400** |

The longest walk from the court to an exit is from its north-east corner
(41, 17) to the entrance D2: about 17 m, far inside MC1's 61 m (200 ft).
This is a **design** load. At closing time only a few dozen people are in
the wing (§6.6).

## 6. Gameplay overlay (checkable targets)

### 6.1 Entries

| # | Entry | Arrives in | Use |
|---|---|---|---|
| E1 | Entrance vestibule D1 → D2 | `plaza` → `entry` → `court` | The way the script expects you in: a night off. Straight into the food court, under the eyes of both open counters (S1, S2). |
| E2 | South-west exit doors D34 | `plaza` → `svc_sw` | Locked from outside (panic bar inside); breach it. The corridor reaches the toy store (D27) and the photo shop (D29), which open onto the concourse and the court. |
| E3 | South-east exit doors D35 | `plaza` → `svc_se` | The same on the east: florist (D31) into the court, electronics (D33) into the east concourse. |
| E4 | Anchor street door D24 | `plaza` → `anchor` | Locked glass; break it. The anchor reaches the dock (D25) but not the mall: its shutter D23 is down. |
| E5 | Dock exit doors D21, D22 | `dock` → `svc` | The dock is reached on stage only through the anchor (E4, then its loading door D25); the service drive round the building is off stage. The north corridor reaches every kitchen and every north shop. |

The player arrives by car in the lot (CAR). The walk is about 7 m to D1,
21 m to D34, 15 m to D35 and 29 m to D24.

### 6.2 Sightlines (W1 query targets)

Standing eye 1.6 m to a standing target. Only `full` walls, **closed leaf
doors** and shutters that are down (`door_metal`) block. Glass doors,
storefront windows, open counters (D5, D8), the open sides of the court (D3,
D4) and every prop do not block sight (STYLE-LEVELS §3.4). Targets assume
every leaf door is closed; an open leaf still blocks rays that cross its
swung position. The rolling shutters (D6, D7, D23) and the anchor's
loading door (D25) roll up, not swing: raised or breached, they clear the
whole doorway. A locked shutter is breached like a locked `door_metal`
(its lock's hit points; about two slugs or three buckshot shells, W5 to
tune) and then becomes `open`.

| # | From → to | Length | Expected | Intent |
|---|---|---:|---|---|
| S1 | plaza (30, 37.5) → court (30, 26) | 11.5 | **clear** | From the entrance walk, through both glass pairs, into the court: whoever waits in the court sees you arrive. |
| S2 | fc1 (21, 13) → court (30, 28) | 17.5 | **clear** | The gunman behind the pizza counter covers the entrance doors D2 across the court. |
| S3 | fc2 (27, 10) → court (27, 20) | 10.0 | **blocked** | A shutter that is down hides its kitchen: the closed counters are blind boxes. |
| S4 | mall_w (2, 21) → mall_e (55, 21) | 53.0 | **clear** | The concourse long axis: the west concourse sees all the way to the anchor shutter. The ambush's main lane. |
| S5 | mall_e (50, 21) → anchor (60, 21) | 10.0 | **blocked** | The anchor's shutter D23 hides the department store from the concourse. |
| S6 | svc (1, 4.25) → svc (55, 4.25) | 54.0 | **clear** | The north service corridor is one 54 m lane: whoever holds an end owns it. |
| S7 | toys (9, 27) → mall_w (9, 18) | 9.0 | **clear** | The toy store's glass front looks over the west concourse: a shop is a sniper box. The shooter stands between the window and the toy shelf. |
| S8 | lot (32, 44) → court (30, 26) | 18.1 | **clear** | From the car, through both entrance pairs, you can see into the food court. |
| S9 | photo (22, 33) → court (22, 22.5) | 10.5 | **clear** | The photo shop window looks into the court from the south. |
| S10 | court (40, 28) → fc4 (39, 10) | 18.0 | **clear** | From the south of the court, through the open Cuban counter, into its kitchen. |
| S11 | court (25, 21.5) → svc (25, 4.5) | 17.0 | **blocked** | The closed Chinese shutter and the kitchen's rear door hide the service corridor from the court. |
| S12 | dock (30, 1.5) → svc (30, 4.25) | 2.8 | **blocked** | The service corridor's outer wall hides it from the dock, except at the exit doors. |
| S13 | mall_e (55, 18) → jewel (52, 12) | 6.7 | **clear** | The jeweller's window shows the cases from the east concourse. |
| S14 | entry (30, 33) → svc_sw (20, 35) | 10.2 | **blocked** | The vestibule's side walls hide the south-west service corridor. |
| S15 | court (19, 17) → court (41, 29) | 25.1 | **clear** | Corner to corner across the court, over the tables and the fountain: the food court is one open room. |
| S16 | plaza (60, 37.5) → anchor (60, 25) | 12.5 | **clear** | The anchor's glass street door shows its sales floor from the entrance walk. |

### 6.3 Cover inventory

"Stops" quotes BALLISTICS §4 (retained energy, calibre order 9mm, 9mm SMG,
.45, .357, .50 AE, 5.56, 7.62×39, 12ga 00, 12ga slug, .50 BMG).

| Zone | Cover | Coverage | Stops | Notes |
|---|---|---|---|---|
| Outer walls (dock, entrance walk) | `cbs_ext` | full | everything except 7.62×39 (3 %) and .50 BMG (85 %) | The outside can't shoot in, except through doors and glass. |
| Anchor walls (x = 56 and its south and north faces) | `cmu_filled` | full | everything except .50 BMG (59 %) | The fire wall: the hardest wall on stage. |
| Shop demising walls, kitchen walls, service-corridor walls | `stud_steel_gyp2` | full (sight only) | nothing (9mm keeps 64 %, buckshot 38 %) | Shop to shop and shop to corridor is shoot-through. |
| Security office and restroom partitions | `stud_steel_gyp` | full (sight only) | nothing (9mm keeps 84 %) | Concealment. |
| Storefront glass, entrance doors | `glass_tempered_6` | full (no sight block) | nothing (9mm keeps 93 %) | Not cover at all. |
| Shutters (D6, D7, D23) and rear steel doors | `door_metal` | full | buckshot only (9mm keeps 27 %) | Pistol-resistant only in pairs (§6.7). |
| Serving counters CT1–CT4 | `counter_cabinet` | chest | nothing (9mm keeps 69 %, buckshot 47 %) | The ambushers' cover is soft. |
| Fountain planter, palm planter | `brick_1w` | waist | everything except .50 BMG (79 %) | **The only hard cover in the court**: crouch behind it. |
| Table groups, record racks, toy shelves | `particle_divider` | waist / full | nothing (9mm keeps 83 %) | Concealment only. |
| Kiosk, bench, jewellery cases, TV wall, anchor racks | `counter_cabinet` | chest / waist / full | nothing (9mm keeps 69 %) | Soft. |
| Lot | CAR, `car_door` / `car_engine` | waist | engine block stops everything; doors stop only buckshot (9mm keeps 51 %) | Hide behind the engine (until Lex torches it, §9 Q3). |

### 6.4 Flank loops (each must be a closed walkable cycle)

Length is the sum of straight segments between consecutive door centres (a
lower bound).

| # | Cycle | ≈ Length | Intent |
|---|---|---:|---|
| L1 | `court` –D5– `fc1` –D9– `svc` –D12– `fc4` –D8– `court` | 57.4 m | Through one open counter, along the kitchen corridor, out the other: flank the ambush from behind its own counters. |
| L2 | `court` –D2– `entry` –D1– `plaza` –D34– `svc_sw` –D27– `toys` –D26– `mall_w` –D3– `court` | 58.5 m | Out the front, in at the south-west exit, through the toy store, back into the court from the west. |
| L3 | `mall_e` –D23– `anchor` –D24– `plaza` –D35– `svc_se` –D33– `electronics` –D32– `mall_e` | 55.6 m | Through the anchor (once its shutter is breached), out to the walk, back via electronics. |
| L4 | `court` –D4– `mall_e` –D19– `jewel` –D20– `svc` –D9– `fc1` –D5– `court` | 87.7 m | Through the jeweller to the service corridor and back in behind the pizza counter. |
| L5 | `plaza` –D24– `anchor` –D25– `dock` –D21– `svc` –D9– `fc1` –D5– `court` –D2– `entry` –D1– `plaza` | 149.8 m | Round the whole wing: anchor, dock, kitchens, court, entrance. |

**Checkable connectivity targets** (door ids removed = treat as walls):

| # | Check | Expected |
|---|---|---|
| C1 | Every room reachable on foot from `lot` | yes |
| C2 | `lot` → `court` without D1 | yes, via the exit doors D34 or D35 and a shop |
| C3 | `lot` → `court` without D2 | yes, by the same routes |
| C4 | `lot` → `security` without D17 | **no**: the security office has one door |
| C5 | `lot` → `anchor` without D23 | yes, via D24 or D25 |
| C6 | `lot` → `fc2` without D6 | yes, via the service corridor (D10) |
| C7 | `lot` → `svc` without D21 and D22 | yes, through any north shop or open counter |
| C8 | `lot` → `mall_e` without D4 | yes, via electronics (D33, D32) or the anchor (D23) |

### 6.5 Approach variety

- **As invited:** car → vestibule → food court. The ambush springs as you
  pass the fountain. Fight from the fountain's south face (the only hard
  cover; it screens the counters and tables TB1–TB4), then clear the open
  counters. Diners at TB5–TB8 would be behind you there: keep them north.
- **Back of house:** breach D34 or D35 → service corridor → a shop's rear
  door → its glass front. Only the west route (toys, D26, then D3) and the
  east route (electronics, D32, then D4) give a side angle on the counters.
  The photo shop and the florist (D28, D30) open on the same south face as
  D2, inside the counters' view (and through their windows W5, W6): another
  way in, not a flank.
- **Behind the counters:** break D24 → anchor → D25 → dock → north service corridor → kitchen rear
  doors D9 or D12 → shoot the ambushers in the back over their own
  counters (L1).
- **Through the anchor:** break D24, cross the sales floor, breach the
  shutter D23 and come down the east concourse.

### 6.6 Spawns and enemy placement (by role, for W2 to tune)

The legacy map places a dozen armed men in the shops and the court; keep
that count, sorted by role:

- **Pizza and Cuban counters (2 + 2):** the ambush, behind CT1 and CT4,
  with the kitchens behind them (S2, S10). Legacy `u` and `s`.
- **Food court (1–2):** "diners" at a north table group (TB1–TB4) who stand
  up when you pass the fountain. Legacy `m` and `x`.
- **West concourse (2):** reinforcements after the first shots. The x = 0
  edge is a wall in the sidecar: dress it as the mall's closing-time security
  gate rolled across the concourse, and spawn them there when it lifts (P).
  They use the kiosk and the planter.
- **Shops (2–3):** in the toy store (between the window and the shelf, S7)
  and the electronics store, behind the glass. Legacy `g` and `u`.
- **Security office (1):** a guard on Lex's payroll at the CCTV desk; he
  saw you arrive (SECD).
- **Service corridors (1):** one man walking the north corridor.
- **Civilians:** 4–8 late shoppers and counter staff who flee through D2 and
  D1 when shooting starts (§9 Q2).

### 6.7 Penetration play notes (from BALLISTICS §4)

- **The counters are paper.** CT1–CT4 are `counter_cabinet`: a 9mm keeps
  69 % through one, buckshot 47 %. An ambusher behind a counter is not
  safe from the court. Rounds carry on through the kitchen's back wall
  (`stud_steel_gyp2`): a 9mm keeps 33 % after counter and wall (pen_model),
  a risk to a flanker waiting at D9 or D12.
- **The fountain is the only rock.** `brick_1w` stops everything short of
  the .50 BMG. Every other piece of court furniture is concealment.
- **Shutters stop pistols in pairs.** Through a shutter (`door_metal`) and a
  counter, a 9mm and a .45 stop; a .357 keeps 24 %, a slug 53 %, 5.56 71 %.
  A closed counter is a safe box against pistols; rifles still go through.
- **Shops are shoot-through.** Glass then a display: a 9mm keeps 62 %
  through glass and a counter, 75 % through glass and shelving. Shop to shop
  through a demising wall and a counter, a 9mm keeps 33 %. Two demising
  walls: 9mm 28 %, 5.56 80 %.
- **The anchor is a fortress.** Its `cmu_filled` walls stop everything but
  the .50 BMG; the shutter D23 is the way in.

## 7. Construction summary

The first matching row wins.

| Element | Build | Basis |
|---|---|---|
| Wall between the security office and the restrooms (z = 11) | `stud_steel_gyp` | D MATERIALS §4 |
| Outer walls to the dock and the entrance walk | `cbs_ext` | D MATERIALS §4 (mall exterior `rc_wall_20` / `cbs_ext`) |
| Anchor walls (x = 56; its faces to the dock and the walk) | `cmu_filled` | P: the anchor is separated by a fire wall (MC1) |
| Demising walls between tenants, kitchen walls | `stud_steel_gyp2` | D MATERIALS §4 |
| Service-corridor walls (z = 5.5, z = 34) and the vestibule's side walls | `stud_steel_gyp2` | D: rated exit-passage enclosure (MC1, MC2) |
| Lease-line walls along the shopfronts (z = 16, 26, 30; x = 18 and 42 at z 26–30), the restrooms' front, the west edge (x = 0, the security gate) | `stud_steel_gyp2` | P |
| Storefront glass, glass doors, entrance pairs | `glass_tempered_6` | D MATERIALS §4 |
| Rear doors, exit doors, rolling shutters (down) | `door_metal` | D MATERIALS §4; P (shutters) |
| Counters, kiosk, fixtures | `counter_cabinet` | D MATERIALS §4 (kiosks `counter_cabinet`) |
| Table groups, record racks, toy shelving | `particle_divider` | P |
| Fountain planter, palm planter | `brick_1w` | P (motel planter build) |

## 8. Props by zone (circa 1986)

- **Food court:** a pyramid skylight with fritted glass (FC4, P), a tiled
  fountain with coins in it, palms in planters, moulded fibreglass chairs
  and laminate tables (48 in, MD2), tray-return stations with swing-lid
  bins (MD2), a menu board over each counter, neon tenant signs. At closing
  time: chairs up on half the tables, a mop bucket, a cleaner's cart.
- **Counters:** pizza (deck oven, a spinning slice case), Chinese (steam
  table, shutter fully down), burgers (shutter down), Cuban café (an
  espresso machine, a cafecito window, pastelitos under glass).
- **Concourses:** terrazzo floor, a sunglasses kiosk, a directory board
  ("YOU ARE HERE"), a bench, a payphone bank by the restrooms, the anchor's
  big closed shutter with its name over it.
- **Shops:** a record store (vinyl and cassette racks, a Miami Vice
  soundtrack poster), a shoe store, a jeweller (glass cases, a velvet tray),
  a toy store (Transformers, Cabbage Patch dolls), an electronics store (a
  wall of TVs all on the same channel), a one-hour photo, a florist.
- **Security office:** a wall of black-and-white monitors (SEC2), a desk, a
  key cabinet, a radio charger.
- **Service corridors:** fluorescent tubes, steel doors with tenant names
  stencilled on them, cartons and a hand truck against the wall, EXIT signs.
- **Dock:** a dumpster, grease bins, a box truck at the anchor's door.
- **Lot:** sodium lights, a few cars, shopping carts, the mall's sign with
  "OCEAN VIEW" in neon script.

Lighting at closing time (P): the court and the open counters at full
light, concourses at half, shops at half as they close, the shuttered counters
only by their night lights; MC2's 1 foot-candle egress minimum is the floor.

## 9. Open questions for W2, W1, W5 and W10

1. **Shutters.** A rolling grille can be a solid slat shutter (blocks sight
   and fire like `door_metal`) or an open mesh grille (sight passes; MATERIALS
   §4 calls it "rail cov"). This brief models the down shutters as
   `door_metal`. A real slat shutter is one thin steel skin, weaker than
   `door_metal`'s two, so §6.7's "pistol-resistant in pairs" may change.
   Do we need a `shutter` build and a `grille` door kind (sight passes,
   some shots pass)? W1 and W5 to decide.
2. **Civilians.** Closing time puts 4–8 shoppers and staff on stage. Do they
   count as civilians for scoring, and do they flee or freeze? W10 to
   decide.
3. **The car.** "Lex torched your ride" says the car burns. Does it burn on
   stage during the mission (a set piece in the lot, S8), or off stage before
   the debrief? If on stage, the player leaves on foot. W10 and W2 to decide.
4. **The roof.** "Helicopter's on the roof" unlocks a helicopter for later
   jobs (HP1 shows a real 1983 mall helipad). This brief keeps the roof off
   stage. Should the exit be by helicopter from the mall roof, which needs a
   roof stage and a stair? W10 to decide.
5. **Objective.** The legacy level is "clear the level". Keep that, or
   "survive and reach the car / the roof"? W10 to decide.
6. **"Ocean View."** No enclosed ocean-view mall existed in Miami (§2). The
   name can stay as marketing (the sign in the lot), or the mall can face
   the bay. W10 to confirm.
