# Vice Marina: floorplan reference and layout brief

> **Status:** W3 research deliverable (wave 1). This is docs only, not a runtime map.
> **Consumers:** W2 (level designer) builds the stage from it. W1's floorplan
> visualiser and query tools check the result against §5 and §6. W4 (decor)
> uses §8. W5 uses §6.7 and §7.
> **Mission brief:** levels.js line 68: *"Knock-off gold, undercutting your
> corners. Sink his boats."* Roadmap §2.7 sample dialogue: *"Marina. Lex runs
> coke through the fuel dock."* W10d script draft (Job 4, team file, not in
> the repo): *"And if one floats?" — "Then it's yours. I hear speedboats are
> fun."* Unlock debrief: *"Lex's best speedboat didn't sink."* Contraband
> (gold or coke) is a W10 call; this doc only needs "cargo on the fuel dock".
> **Evidence tags:** **V** verified from a cited source, **D** derived from
> sources, **P** proposed design choice (plausible, not measured), **G**
> gameplay override.
> **Validated:** area bounds, door and window geometry, reachability, m² totals,
> loops L1–L5, connectivity C1–C6 and sightlines S1–S18 were checked by script against the table
> data in §5–§6 (no overlaps; enclosed 684 m² + exterior 980 m² + pier decks
> 239.52 m² = 1 903.52 m² of walkable site).
> **Machine-readable layout:** `docs/levels/marina.layout.json` (STYLE-LEVELS
> §3.1). It adds `W` (windows), `B` (boats) and `S` (sightline targets) to the
> `R`/`D` rows used by the penthouse sidecar.

---

## 1. Design intent

The legacy level (levels.js line 67) has the right bones: water and four
boats to the north, a promenade, an office and a shed around an open yard,
and a car park and road to the south. It reads as a generic dock. The goal is a
believable mid-1980s Biscayne Bay municipal-style marina of the Dinner Key or
Miamarina kind (R3, M1), where the parts sit where real ones sit and are
sized by marina design rules (CA-DBW):

- **Two worlds, two rule sets.** Landward is masonry: the dockmaster block is
  concrete-block-and-stucco (`cbs_ext`) and stops every handgun, shotgun and
  5.56 round. Waterward, nothing does except the concrete pier piles and the
  timber mooring piles. Boats are fibreglass shells that every gun goes
  through (`grp_hull`). The shed is corrugated steel that only buckshot
  is slowed by (48 % kept) and everything else passes. **The fight is about moving from
  soft to hard**, not about hiding behind boats.
- **Piers are lanes.** Fixed walkways and finger piers are 1.2–2.4 m wide and
  have no walls (R3, CA-DBW C-1/C-2). A pier is a shooting gallery with piles
  as the only stops. Players should feel exposed on them.
- **The fuel dock is the objective hub.** It sits at the outer end of pier B
  as a T-head, 27 m (24 m of water plus the quay) from the nearest building (P,
  separation practice; §4 rule 4). A target boat is side-tied to it, being
  loaded. It has one foot approach (pier B) and a water approach.
- **Lex's boats, spread out.** Two go-fasts in the A-dock slips, one boat
  at the fuel dock and a sportfisher in the B-dock. Sinking them forces the
  player along the quay, out pier B and back. **Lex's best speedboat** sits in
  the side-tie slip by pier B: if the player leaves it afloat, it is the
  unlock (script: "And if one floats? — Then it's yours"). Sparing it means
  holding fire in a lane where stray rounds reach it (§6.7, §9 Q3).
- **Real ways in.** Car park from the road (south), the shore path (west), the
  service alley (east), and by water (any finger or the fuel dock). No secret
  routes.
- **Long and short.** The quay (63 m), the alley-to-car-park lane (52 m) and the cross-water
  lanes (32–47 m) are long rifle lines. The office block and shed rooms are
  short and boxy.
- **The count room is the masonry box.** The dockmaster's back office, where
  Lex's cash is counted, has filled-block walls (`cmu_filled`, P) and a
  steel back door to the yard: the place a cornered manager runs to.

## 2. References and what each contributes

Cite by key. Links and descriptions only; no images or plans are copied.
R1 and R3 are also in MATERIALS §9.

| Key | Source | What it documents | What we borrow | Rationale |
|---|---|---|---|---|
| **R3** | Dinner Key Marina repairs, design criteria (City of Miami). <https://archive.miamigov.com/MiamiCapital/docs/ProjectPages/ProcurementOpportunities/Dinner_Key_Design_Build_Repairs/Addend2/3DinnerKeyMarina_DesignCriteria.pdf> | Piers 1–7: **fixed concrete walkways** of prestressed U-beams on concrete pile caps and prestressed piles, FRP grating with openings (V). **Timber finger piers, typically 4 ft wide**, on rows of 2-pile timber bents (V). **Timber mooring piles**; dock boxes; piers 8–9 along concrete bulkheads; some slips have mooring piles only (V). Top of timber piles **+10 ft above MHW** (V). No fuel service (V). | Concrete main walk, timber fingers, timber mooring piles standing above deck, dock boxes, bulkhead quay | The best primary source for a Miami marina's physical fabric. Built in the 1960s–80s. |
| **CA-DBW** | California Dept. of Boating and Waterways, *Layout & Design Guidelines for Marina Berthing Facilities* (2005). <https://chetaero.files.wordpress.com/2016/11/guide05.pdf> | Fairway ≥ **1.75 × longest berth** perpendicular to it; side-tie fairway ≥ 1.5 × longest boat (Table B-2, V). Berth width ≈ beam + 2 ft (B-4, V). Finger floats **3 ft (20 ft+), 4 ft (36 ft+)** (C-1, V). Main walkway **6 ft (< 300 ft), 8 ft (≥ 300 ft)** (C-2, V). Marginal walkway 6–8 ft (C-3, V). | All pier, slip and fairway dimensions (§4, §5) | US industry guidance compiled from the 1960s–2000s practice. Not Florida, but the geometry rules are universal. |
| **R1** | Pan American Seaplane Base and Terminal, Dinner Key, historic designation report. <https://www.historicpreservationmiami.com/pdfs/Pan%20American%20Seaplane%20Base%20and%20Terminal%20Building.pdf> | Steel-framed hangars with corrugated cladding and trusses; Hangar D has full-height sliding steel-frame doors (V, pp. 10–12; our copy is a scan, so hangar dimensions were not extracted) | The dry-stack/repair shed: corrugated steel on a steel frame | The canonical Dinner Key waterfront shed. |
| **R2** | Miami Marine Stadium designation report. <https://www.historicpreservationmiami.com/pdfs/2011%20designation%20reports%20updates/Miami_Marine_Stadium-Designation_Report.pdf> | Bay-side concrete construction, 1963 | Concrete bulkhead and quay idiom | Context only. |
| **R4** | Miami-Dade County marina services. <https://www.miamidade.gov/global/service.page?Mduid_service=ser1495115031663185> | County marina functions: wet slips, dry storage, ramps, fuel and related services (V; current list, not proof of 1986 provision) | The building programme: ship's store and bait, dockmaster, dry-stack, fuel dock | Defines what a marina of this class contains. |
| **M1** | Miamarina at Bayside. *Miami Vice*: Crockett's sailboat *St. Vitus Dance* was moored there. <https://miamivice.fandom.com/wiki/St._Vitus_Dance> (fan wiki, low confidence) | The show's home marina (P) | Tone: a downtown municipal marina, sailboats and go-fasts side by side | Period and genre anchor. |
| **M2** | Flashback Miami, Bayfront Park. <https://flashbackmiami.com/2015/04/08/bayfront-park/> | Bayfront Park's decline in the early 1980s (V) | Tone: tired, under-lit waterfront | Mood, not geometry. |
| **B1** | Cigarette 38 Top Gun specs. <https://www.boatsdata.com/1989-cigarette-38-top-gun-4310/specs>, <https://cigaretteracingne.com/models/38-top-gun/> | LOA ≈ 11.5–11.6 m, beam **2.41 m**, fibreglass hull, draft 0.41 m (V) | Target-boat footprint: 11.6 × 2.4 m | The period go-fast smuggling boat. |
| **NFPA** | NFPA 303, *Fire Protection Standard for Marinas and Boatyards* | Requires extinguishers on two sides of the fuel-dispensing area (6.1.1.1.2.1, via a secondary source; low confidence) | Two extinguisher props on the fuel dock | Specific separation distances were **not** verified; the fuel-dock position is P. |
| **A** | US Army FM 3-06.11 ch. 7 (BALLISTICS §9) | Rifle penetration of pine and log walls (Tables 7-2, 7-3, 7-5, 7-6) | `timber_pile` build (MATERIALS §3) | Basis for "piles are cover". |

## 3. Site and coordinate frame

Metres. **x** runs west → east (0–64), **z** runs north → south (water at
small z, road at large z). Open water fills everything not in §5 from z = −12
(stage edge, open bay) to the bulkhead at z = 30. The road runs along z = 56
(stage edge). Deck levels (P): quay, piers and fuel dock +1.5 m above water;
land +1.8 m; boats float with gunwales roughly level with the pier deck.
Floor steps never block sight (user decision Q9).

### 3.1 Plan (generated from the sidecar; tables in §5–§6 are authoritative)

1 char = 1 m × 1 m cell; walls are drawn on the room's own edge cells, so
they look 1 m thick. Rows z 7–10 and the open bay (z < 0) are omitted.
`~` water, `#` concrete walk (pier B), `F` fuel-dock deck, `|` A-dock
timber finger (and wall), `-` B-dock timber finger (and wall), `=` quay, `:`
shore path, `.` yard, `,` car park, `;` alley. `T` target boat (T1–T4, §5.3),
`U` Lex's best speedboat. Openings: `d` leaf door, `_` open doorway, `g`
glass door, `w` window. Exterior-to-exterior openings (D19–D33) are not
marked. The road runs along the south stage edge (z = 56).

```
    0         1         2         3         4         5         6   
  0 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TTTTTTTTTTTT~~~~~~~~~~~~~~~~~~~~~
  1 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TTTTTTTTTTTT~~~~~~~~~~~~~~~~~~~~~
  2 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~FFFFFFFFFFFFFFFFFF~~~~~~~~~~~~~~~~~~
  3 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~FFFFFFFFFFFFFFFFFF~~~~~~~~~~~~~~~~~~
  4 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~FFFFFFFFFFFFFFFFFF~~~~~~~~~~~~~~~~~~
  5 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~FFFFFFFFFFFFFFFFFF~~~~~~~~~~~~~~~~~~
  6 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ... (z 7–10: pier B over water)
 11 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##-------------~~~~~~~~~~~~~~~
 12 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 13 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##~TTTTTTTTTTT~~~~~~~~~~~~~~~~
 14 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##~TTTTTTTTTTT~~~~~~~~~~~~~~~~
 15 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##~TTTTTTTTTTT~~~~~~~~~~~~~~~~
 16 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 17 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##-------------~~~~~~~~~~~~~~~
 18 ~|~~~~~|~~TT~|~~~~~|~~TT~||~~UU~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 19 ~|~~~~~|~~TT~|~~~~~|~~TT~||~~UU~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 20 ~|~~~~~|~~TT~|~~~~~|~~TT~||~~UU~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 21 ~|~~~~~|~~TT~|~~~~~|~~TT~||~~UU~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 22 ~|~~~~~|~~TT~|~~~~~|~~TT~||~~UU~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 23 ~|~~~~~|~~TT~|~~~~~|~~TT~||~~UU~~~##-------------~~~~~~~~~~~~~~~
 24 ~|~~~~~|~~TT~|~~~~~|~~TT~||~~UU~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 25 ~|~~~~~|~~TT~|~~~~~|~~TT~||~~UU~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 26 ~|~~~~~|~~TT~|~~~~~|~~TT~||~~UU~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 27 ~|~~~~~|~~TT~|~~~~~|~~TT~||~~UU~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 28 ~|~~~~~|~~TT~|~~~~~|~~TT~||~~UU~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 29 ~|~~~~~|~~TT~|~~~~~|~~TT~||~~UU~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 30 ================================================================
 31 ================================================================
 32 ================================================================
 33 ::::www-gg---++-ww--d+..................+------dddddd----------+
 34 ::::|        ||      |..................|                      |
 35 ::::w        __      w..................|                      |
 36 ::::w STORE  __DOCKM w..................d                      |
 37 ::::|        ||      |..................d                      |
 38 ::::+---dd---++d-----+..................d                      |
 39 ::::d---dd----dddd---+..................d                      |
 40 ::::+--++--++-d-+|   |..................|    DRY-STACK SHED    |
 41 ::::|M ||F ||st ||CNTd..................|                      |
 42 ::::+dd++dd++---++---+..................|                      |
 43 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,|                      |
 44 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,|                      |
 45 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,|                      |
 46 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,|                      |
 47 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,+--ddww--------__------+
 48 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,+--ddww++------__------+
 49 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,|      ||              |
 50 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,d      dd              |
 51 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,dS.OFF dd   WORKSHOP   |
 52 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,|      ||              |
 53 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,+------++----------dd--+
 54 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,;;;;;;;;;;;;;;;;;;;;;;;;
 55 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,;;;;;;;;;;;;;;;;;;;;;;;;
```

## 4. Typology rules the layout must keep

These override W2's layout freedom (STYLE-LEVELS §4). Deviations need a
**G** note.

1. **Fixed concrete main walk, timber fingers.** Pier B is a fixed concrete
   walk (`rc` deck on `rc_column_40` piles); fingers are timber on
   `timber_pile` bents (R3, V). Main walk ≥ 1.8 m (CA-DBW C-2: 6 ft); drawn
   2.4 m (P, 8 ft, matching a long concrete pier). Fingers 1.2 m (4 ft: R3
   typical; CA-DBW C-1 for 36 ft+ berths).
2. **Slips sized by the design boat.** Design berth 40 ft (12.2 m) for an
   11.6 m go-fast (B1). Finger length = berth length = 12.2 m (D). Slip
   clear width ≈ beam + 2 ft ≈ 3.0 m minimum (CA-DBW B-4); drawn 4.9 m
   (= Lsb/4 + 6 ft ≈ 16 ft, the Table B-4 single-berth formula, D), so finger
   centres are 6.1 m apart.
3. **Fairways.** A fairway in front of perpendicular berths is ≥ 1.75 × 12.2
   = **21.3 m** (CA-DBW B-2, D). The A-dock fairway runs from the finger tips
   (z = 17.8) to the stage edge (z = −12): **29.8 m** ✔. East of pier B the
   B-dock fingers open onto ≥ 15.4 m to the stage edge at x = 64 **plus the
   open bay beyond** (the stage edge is not a shore; G: W2 may extend the water
   only, z < 30, to x = 70 to show the full 21.3 m). The side-tie slip between `fa4` and pier B
   (`U`) exits north into an 11.8 m gap under the fuel dock, which meets the
   1.5 × L side-tie rule only for boats ≤ 7.9 m: **G**, accepted because the
   speedboat U leaves by script, not by AI pathing.
4. **Fuel dock at the outer end, away from buildings.** T-head at the pier
   end, open water on three sides, ≥ 25 m from every building (27 m to the
   shed and office faces, P; NFPA distances not verified). One foot access
   (pier B). Pumps and a small steel tank cabinet on deck; never a fuel tank
   beside the office.
5. **Bulkhead quay along the shore.** A continuous concrete quay (marginal
   walk, CA-DBW C-3: 6–8 ft; drawn 3 m, G for two-abreast movement) links all
   piers, as at Dinner Key piers 8–9 (R3).
6. **Landward buildings in a row behind the quay.** Dockmaster and ship's
   store face the water with windows on the quay (customers walk in from the
   docks); restrooms/showers open landward to the car park, as marina
   bathhouses do (P). The dry-stack shed has its big door on the
   quay side (boats come out by forklift) and a second big door on the yard
   (P, R1 idiom).
7. **Car park and road landward.** The only vehicle access is from the road,
   via the car park, into the yard. The alley is a service lane behind the
   shed.

## 5. Area schedule (checkable)

Bounds are `[x0, z0, x1, z1]`. **Ent** counts doorways and openings a pawn
can walk through. Windows are not entrances. Where exterior or pier areas meet, the edge is
unwalled and §5.2 lists it as an `open` row; their edges against water are
open drops. Every other room edge is a wall. Builds refer to MATERIALS §3.

### 5.1 Stage `marina`

| id | Name | Kind | Bounds | Dims (m) | m² | Ent | Entrances | Research | Tag |
|---|---|---|---|---|---:|:-:|---|---|:-:|
| `quay` | Bulkhead quay | exterior | 0, 30, 64, 33 | 64 × 3 | 192.0 | 11 | D1, D2, D12, D19, D20, D24–D29 | marginal walk 1.8–2.4 m (CA-DBW C-3) | G (3 m) |
| `fa0`–`fa4` | A-dock fingers 0–4 | pier | x0 = 1.0, 7.1, 13.2, 19.3, 25.4; z 17.8–30 | 1.2 × 12.2 each | 14.64 each (73.2) | 1 each | D24–D28 | 4 ft × 40 ft (R3, CA-DBW C-1) | D |
| `pierb` | Pier B main walk | pier | 34, 6, 36.4, 30 | 2.4 × 24 | 57.6 | 5 | D29–D33 | ≥ 6 ft (CA-DBW C-2) | P (8 ft) |
| `fuel` | Fuel dock (T-head) | pier | 28, 2.4, 46, 6 | 18 × 3.6 | 64.8 | 1 | D30 | — | P |
| `fb1`–`fb3` | B-dock fingers 1–3 | pier | x 36.4–48.6; z0 = 10.9, 17.0, 23.1 | 12.2 × 1.2 each | 14.64 each (43.92) | 1 each | D31–D33 | 4 ft × 40 ft | D |
| `walk_w` | Shore path | exterior | 0, 33, 4, 43 | 4 × 10 | 40.0 | 3 | D8, D19, D21 | — | P |
| `store` | Ship's store and bait | retail | 4, 33, 14, 39 | 10 × 6 | 60.0 | 3 | D1, D3, D4 | — | P |
| `dockmaster` | Dockmaster office | office | 14, 33, 22, 39 | 8 × 6 | 48.0 | 3 | D2, D3, D5 | — | P |
| `hall_o` | Office back corridor | circulation | 4, 39, 17, 40.5 | 13 × 1.5 | 19.5 | 5 | D4, D5, D6, D7, D8 | — | P |
| `wc_m` | Restroom and showers (M) | bath | 4, 40.5, 8, 43 | 4 × 2.5 | 10.0 | 1 | D9 | — | P |
| `wc_f` | Restroom and showers (F) | bath | 8, 40.5, 12, 43 | 4 × 2.5 | 10.0 | 1 | D10 | — | P |
| `stores_o` | Office storeroom | closet | 12, 40.5, 17, 43 | 5 × 2.5 | 12.5 | 1 | D7 | — | P |
| `count` | Counting room (manager's office) | secure | 17, 39, 22, 43 | 5 × 4 | 20.0 | 2 | D6, D11 | — | P |
| `yard` | Boat yard and forklift apron | exterior | 22, 33, 40, 43 | 18 × 10 | 180.0 | 4 | D11, D13, D20, D22 | — | P |
| `lot` | Car park | exterior | 0, 43, 40, 56 | 40 × 13 | 520.0 | 6 | D9, D10, D16, D21, D22, D23 (+ road edge) | 2 bays + aisle ≈ 16–18 m | P |
| `shed` | Dry-stack shed bay | service | 40, 33, 64, 48 | 24 × 15 | 360.0 | 4 | D12, D13, D14, D15 | — | P |
| `shed_off` | Shed office | office | 40, 48, 48, 54 | 8 × 6 | 48.0 | 3 | D14, D16, D18 | — | P |
| `shed_shop` | Workshop and parts | service | 48, 48, 64, 54 | 16 × 6 | 96.0 | 3 | D15, D17, D18 | — | P |
| `alley` | Service alley | exterior | 40, 54, 64, 56 | 24 × 2 | 48.0 | 2 | D17, D23 (+ east and road edges) | — | P |

Totals: enclosed 684.0 m²; exterior 980.0 m²; pier decks 239.52 m².

### 5.2 Doors and openings

`x=c` is a wall on the line x = c, with the opening centred at the stated z
(and vice versa). **Kind** maps to MATERIALS §3 builds; `open` is an opening
with no leaf; `glass` is a `glass_tempered_6` storefront door; `corrugated` is
a full-height sliding corrugated-steel door (R1 Hangar D idiom; MATERIALS §3).

| Door | Rooms | Wall, centre | Width | Kind |
|---|---|---|---:|---|
| D1 | `store` ↔ `quay` | z=33, x 9 | 1.8 | glass (double storefront) |
| D2 | `dockmaster` ↔ `quay` | z=33, x 20.5 | 0.9 | door_solid |
| D3 | `store` ↔ `dockmaster` | x=14, z 36 | 0.9 | open |
| D4 | `store` ↔ `hall_o` | z=39, x 9 | 0.9 | door_hollow |
| D5 | `dockmaster` ↔ `hall_o` | z=39, x 15.5 | 0.9 | door_hollow |
| D6 | `hall_o` ↔ `count` | x=17, z 39.75 | 0.9 | door_solid |
| D7 | `hall_o` ↔ `stores_o` | z=40.5, x 14.5 | 0.9 | door_hollow |
| D8 | `hall_o` ↔ `walk_w` | x=4, z 39.75 | 0.9 | door_metal |
| D9 | `wc_m` ↔ `lot` | z=43, x 6 | 0.8 | door_metal |
| D10 | `wc_f` ↔ `lot` | z=43, x 10 | 0.8 | door_metal |
| D11 | `count` ↔ `yard` | x=22, z 41.5 | 0.9 | door_metal |
| D12 | `quay` ↔ `shed` | z=33, x 50 | 6.0 | corrugated (sliding, waterside) |
| D13 | `yard` ↔ `shed` | x=40, z 38 | 4.0 | corrugated (sliding, yard) |
| D14 | `shed` ↔ `shed_off` | z=48, x 44 | 0.9 | door_hollow |
| D15 | `shed` ↔ `shed_shop` | z=48, x 56 | 2.4 | open |
| D16 | `shed_off` ↔ `lot` | x=40, z 51 | 0.9 | door_metal |
| D17 | `shed_shop` ↔ `alley` | z=54, x 60 | 0.9 | door_metal |
| D18 | `shed_off` ↔ `shed_shop` | x=48, z 51 | 0.9 | door_hollow |
| D19 | `quay` ↔ `walk_w` | z=33, x 2 | 4.0 | open |
| D20 | `quay` ↔ `yard` | z=33, x 31 | 18.0 | open (whole edge) |
| D21 | `walk_w` ↔ `lot` | z=43, x 2 | 4.0 | open (whole edge) |
| D22 | `yard` ↔ `lot` | z=43, x 31 | 18.0 | open (whole edge) |
| D23 | `lot` ↔ `alley` | x=40, z 55 | 2.0 | open (whole edge) |
| D24–D28 | `quay` ↔ `fa0`…`fa4` | z=30, x 1.6 / 7.7 / 13.8 / 19.9 / 26.0 | 1.2 | open (finger roots) |
| D29 | `quay` ↔ `pierb` | z=30, x 35.2 | 2.4 | open |
| D30 | `pierb` ↔ `fuel` | z=6, x 35.2 | 2.4 | open |
| D31–D33 | `pierb` ↔ `fb1`…`fb3` | x=36.4, z 11.5 / 17.6 / 23.7 | 1.2 | open (finger roots) |

**Windows** (not entrances; glass, do not block sight; `glass_annealed_6`):

| Window | Rooms | Wall, centre | Width |
|---|---|---|---:|
| W1 | `store` ↔ `quay` | z=33, x 5.8 | 2.4 |
| W2 | `dockmaster` ↔ `quay` | z=33, x 17 | 2.4 |
| W3 | `dockmaster` ↔ `yard` | x=22, z 36 | 1.8 |
| W4 | `store` ↔ `walk_w` | x=4, z 36 | 1.8 |
| W5 | `shed_off` ↔ `shed` | z=48, x 46 | 1.2 (interior office window) |

### 5.3 Boats (props with gameplay roles; sidecar `B`)

| id | Role | Berth | Footprint `[x0, z0, x1, z1]` | Type | Build |
|---|---|---|---|---|---|
| T1 | Target | A-dock, between `fa1` and `fa2` | 9.55, 18.4, 11.95, 30 | Go-fast, 11.6 × 2.4 (B1) | `grp_hull` |
| T2 | Target | A-dock, between `fa3` and `fa4` | 21.75, 18.4, 24.15, 30 | Go-fast, 11.6 × 2.4 | `grp_hull` |
| T3 | Target (the cargo boat) | Side-tied, fuel dock north face | 31, 0, 42.6, 2.4 | Go-fast, 11.6 × 2.4 | `grp_hull` |
| T4 | Target | B-dock, between `fb1` and `fb2` | 36.6, 13.35, 48.2, 15.75 | Sportfisher, 11.6 × 2.4 hull + flybridge (P) | `grp_hull` |
| U | Lex's best speedboat: optional target; the unlock if left afloat | Side-tie slip, `fa4` ↔ pier B | 29.1, 18.4, 31.5, 30 | Go-fast, 11.6 × 2.4 | `grp_hull` |
| c | Civilian (optional, 3–5) | other A/B slips | TBD by W2 | Sailboats and cruisers | `grp_hull` |

## 6. Gameplay overlay (checkable targets)

### 6.1 Entries

| # | Entry | Arrives in | Use |
|---|---|---|---|
| E1 | Road → car park (south edge, z = 56) | `lot` | Default arrival by car. Long, open approach across the car park; parked cars are the only soft cover. |
| E2 | Shore path (west edge, x = 0) | `walk_w` → `quay` / D8 | Walk-in along the bay. Leads to the store's side window and the office back door (D8). |
| E3 | Service alley (east edge, x = 64) | `alley` → D17 / `lot` | Quiet entry behind the shed into the workshop. |
| E4 | By water: fuel dock | `fuel` | Boat arrival straight onto the objective hub; one exit (pier B). Bold and exposed. |
| E5 | By water: any finger | `fa0`–`fa4`, `fb1`–`fb3` | Landing on a finger, among the target boats. |

### 6.2 Sightlines (W1 query targets)

Standing eye 1.6 m to a standing target. Only `full` walls and **closed leaf
doors** (including the `corrugated` sliding doors D12 and D13) block. Open
openings, glass doors, windows, boats, cars, piles and all props do not
block standing sight. Targets assume every leaf door is closed; an open leaf
still blocks rays that cross its swung position (STYLE-LEVELS §3.4). D12 and D13 slide rather than swing:
open, they clear the doorway entirely.

| # | From → to | Length | Expected | Intent |
|---|---|---:|---|---|
| S1 | quay (0.5, 31.5) → (63.5, 31.5) | 63.0 | **clear** | The quay is one long rifle lane; whoever holds an end owns it. |
| S2 | pierb (35.2, 29.5) → fuel (35.2, 4.2) | 25.3 | **clear** | Straight down pier B to the fuel dock: the approach is fully exposed. |
| S3 | fuel (35.2, 4.2) → yard (31, 38) | 34.1 | **clear** | From the fuel dock you see into the yard through the 18 m opening D20. |
| S4 | dockmaster (17, 35) → fa2 (13.8, 18.5) | 16.8 | **clear** | Through window W2 the dockmaster overlooks the A-dock (T1). |
| S5 | store (9, 36) → count (19.5, 41.5) | 11.9 | **blocked** | The count room is invisible from the public store. |
| S6 | yard (30, 41.5) → count (19.5, 41.5) | 10.5 | **blocked** | The count room's back door (D11) hides it from the yard. |
| S7 | lot (31, 55) → quay (31, 31.5) | 23.5 | **clear** | Arriving by road you see straight through the yard to the water. |
| S8 | lot (36, 50) → shed (52, 40) | 18.9 | **blocked** | The shed hides its interior from the car park (but see §6.7). |
| S9 | walk_w (2, 42) → fa0 (1.6, 18.5) | 23.5 | **clear** | Shore path looks out along finger 0. |
| S10 | shed (41, 40) → (63, 40) | 22.0 | **clear** | The shed bay is one open space between the racks (racks are props). |
| S11 | shed_off (44, 51) → shed (52, 40) | 13.6 | **clear** | Through window W5 the shed office overlooks the bay. |
| S12 | fa0 (1.6, 18.2) → fb3 (48, 23.7) | 46.7 | **clear** | Across the whole basin, finger tip to finger tip: the longest water lane. |
| S13 | quay (13.8, 31.5) → fuel (30, 4.2) | 31.7 | **clear** | The fuel dock is in plain sight of the quay across the water. |
| S14 | yard (28, 36) → dockmaster (18, 36) | 10.0 | **clear** | Through window W3 the yard sees into the office. |
| S15 | store (6, 36) → dockmaster (20, 36) | 14.0 | **clear** | Store and dockmaster office are one counter space through D3. |
| S16 | quay (60, 31.5) → shed_shop (56, 51) | 19.9 | **blocked** | The shed's north wall hides the shed and workshop from the quay. |
| S17 | alley (62, 55) → lot (10, 55) | 52.0 | **clear** | From the alley mouth you see the length of the car park. |
| S18 | lot (25, 51) → shed_off (44, 51) | 19.0 | **blocked** | Through D16: the closed car-park door hides the shed office. |

### 6.3 Cover inventory

**Coverage** uses MATERIALS §3 classes. "Stops" quotes BALLISTICS §4
(retained energy, calibre order 9mm, 9mm SMG, .45, .357, .50 AE, 5.56,
7.62×39, 12ga 00, 12ga slug, .50 BMG).

| Zone | Cover | Coverage | Stops | Notes |
|---|---|---|---|---|
| Office block faces | `cbs_ext` | full | everything except 7.62×39 (3 %) and .50 BMG (85 %) | The hard side of the map. |
| Count room | `cmu_filled` walls, `door_metal` D11 | full | walls stop all but .50 BMG (59 %); the steel door stops only buckshot (9mm keeps 27 %) | Masonry box with a soft door. |
| Office interior | `stud_steel_gyp` | full (sight only) | nothing (9mm keeps 84 %) | Shoot through to the count-room door. |
| Pier B and quay | concrete pier piles and pile caps, `rc_column_40` (0.4 × 0.4, rising 1 m above deck as bollards, P) | waist | everything | Spaced ≈ 6 m along pier B (P). |
| Fingers and B-dock | `timber_pile` (Ø 0.3 m P; top +10 ft MHW ≈ 1.5 m above deck: R3) | chest (narrow; below the 1.6 m eye) | everything up to and including buckshot; slug keeps 30 %, .50 BMG 86 % | One pile at each finger tip and each slip corner (`o`). Slim, honest cover. |
| Boats (T1–T4, U, c) | `grp_hull` | waist from the deck; full from inside a boat | nothing (9mm keeps 76 %; buckshot 58 %) | **Concealment, not cover.** |
| Fuel dock | pump islands and tank cabinet, `steel_3mm` | chest | 9mm, .45, buckshot only (5.56 keeps 73 %) | The objective has only weak cover. |
| Quay, fingers | dock boxes, `dock_box` | waist | nothing (9mm keeps 84 %) | Looks like cover, isn't. |
| Car park | cars: `car_door` / `car_engine` | waist | engine block stops everything; doors stop only buckshot (9mm keeps 51 %) | Hide behind the engine (BALLISTICS §7 tip). |
| Shed | `corrugated` walls and sliding doors | full (sight only) | buckshot only, partly (48 % kept); all else passes | The shed hides you, it does not protect you. |
| Shed bay | engine stands and outboard blocks (`car_engine` as proxy, P) | waist | everything | A few hard spots inside the soft shed. |
| Shed office / workshop walls | `cmu_hollow` | full | all but 7.62×39 (9 %) and .50 BMG (86 %) | Fire separation, P. |

### 6.4 Flank loops (each must be a closed walkable cycle)

Length is the sum of straight segments between consecutive door centres (a
lower bound).

| # | Cycle | ≈ Length | Intent |
|---|---|---:|---|
| L1 | `quay` –D20– `yard` –D22– `lot` –D21– `walk_w` –D19– `quay` | 78 m | The big outer loop: water front, yard, car park, shore path. |
| L2 | `store` –D4– `hall_o` –D5– `dockmaster` –D3– `store` | 16 m | Tight office circuit around the counter wall. |
| L3 | `lot` –D22– `yard` –D13– `shed` –D14– `shed_off` –D16– `lot` | 38 m | Car park ↔ shed: roll the shed from the yard or the office side. |
| L4 | `shed` –D15– `shed_shop` –D18– `shed_off` –D14– `shed` | 26 m | Inside the shed complex. |
| L5 | `hall_o` –D6– `count` –D11– `yard` –D20– `quay` –D2– `dockmaster` –D5– `hall_o` | 38 m | The count room has two doors: corner its occupant from either side. |

The piers are deliberately **dead ends**: pier B and the fuel dock have only
D29 as the foot route (C5).  Pushing out to the fuel dock is a commitment, unless you came by boat.

**Checkable connectivity targets** (door ids removed = treat as walls):

| # | Check | Expected |
|---|---|---|
| C1 | Every area reachable on foot from `lot` (E1), `walk_w` (E2) and `alley` (E3) | yes |
| C2 | `lot` → `quay` without D20 and D22 (yard blocked) | yes, via the shore path (D21, D19) |
| C3 | `lot` → `shed` without D12 and D13 (both big doors shut) | yes, via D16 or D17 |
| C4 | `lot` → `count` without D6 | yes, via D11 |
| C5 | `lot` → `fuel` without D29 | **no**: the fuel dock is a dead end on foot |
| C6 | `lot` → `shed_off` without D16 | yes, via D14 or D18 |

### 6.5 Approach variety

- **Loud:** road → car park → yard → quay, fight down pier B.
- **Water:** boat to the fuel dock (E4), sink T3 first, fight back to land.
- **Quiet:** shore path → office back door D8 → count room; or alley →
  workshop → shed → waterside door D12.

### 6.6 Spawns and enemy placement (by role, for W2 to tune)

- **Fuel dock crew (3–4):** loading T3; the boss's lieutenant here. Pump
  islands for cover.
- **Pier B and fingers (2–3):** guards on the targets; one at the end of the
  A-dock with a rifle covering S1/S13.
- **Office (2):** dockmaster (civilian, flees through D2) and Lex's manager in
  the count room (runs to D11 → yard if the hall is breached).
- **Shed (2–3):** mechanics and guards among the racks; one in the office
  behind W5.
- **Reinforcements:** a car to the car park via E1 (lot, south edge), or a
  boat to the fuel dock (E4).
- **Civilians:** bait-shop clerk, a fisherman on finger `fa0`, boat owners.

### 6.7 Penetration play notes (from BALLISTICS §4)

- **Boats are paper.** A guard crouched behind a go-fast is still exposed: the
  9mm keeps 76 % through a `grp_hull` (through both sides of one boat, model ≈ 51 %).
  Return fire works the same way. Stray rounds on Lex's best speedboat U are the
  real risk: §9 Q3.
- **Piles are the only stops on the water side.** `timber_pile` and
  `rc_column_40` stop every handgun, SMG, assault rifle and buckshot.
- **The shed is a sieve.** Every gun except buckshot goes through the
  corrugated cladding with ≥ 83 % kept. Enemies inside are invisible (S8) but
  not safe; a sweep with the Uzi through the wall is a valid tactic.
- **The office walls are a fortress; its windows are not.** `cbs_ext` stops
  everything short of the AK and the .50; the AK barely gets through (3 %).
  But 6.6 m of the 18 m quay face is glass (W1, W2, D1), and inside the
  partitions are drywall. The count room is the true box.
- **Fuel dock:** pumps stop the 9mm, the .45 and buckshot; the .357 (27 %),
  .50 AE (54 %) and rifles go through.
  Explosive fuel behaviour is out of scope here (§9 Q4).

## 7. Construction summary

| Element | Build (MATERIALS §3) | Tag |
|---|---|---|
| Office block exterior | `cbs_ext` | V MATERIALS §4 (Miami CBS) |
| Office partitions | `stud_steel_gyp` | V MATERIALS §4 |
| Count room walls | `cmu_filled` | P (cash room) |
| Restroom walls | `cmu_hollow` (wet room) | P |
| Shed cladding and sliding doors | `corrugated` on steel frame | V R1 |
| Shed office / workshop walls | `cmu_hollow` | P |
| Doors | per §5.2 | P |
| Windows | `glass_annealed_6` | P |
| Storefront door D1 | `glass_tempered_6` | P |
| Quay, pier B deck | concrete deck on `rc_column_40` piles and caps | V R3 |
| Fingers | timber deck on `timber_pile` bents | V R3 |
| Mooring piles | `timber_pile` | V R3; D A |
| Boats | `grp_hull` | P (B1: fibreglass) |
| Fuel pumps, tank cabinet | `steel_3mm` | P |
| Dock boxes | `dock_box` | P (R3 lists dock boxes) |

## 8. Props by zone (circa 1986)

- **Quay:** dock boxes, hose reels, life rings on posts, cleats, bollards
  (concrete pile tops), a payphone, ice machine, fish-cleaning table, sodium
  lamp posts, a "NO WAKE" sign.
- **Fingers and pier B:** timber mooring piles with rope wraps, cleats, power
  and water pedestals, FRP grating panels on pier B (R3), boarding steps.
- **Fuel dock:** two pump islands (gas, diesel), a steel tank cabinet, hose
  booms, extinguishers on two sides (NFPA), an oil drum, a "FUEL – DOCK
  MASTER ON CH 16" sign, crates of "engine parts" (the contraband).
- **Store:** counter and register, bait freezers, tackle racks, rod racks,
  charts, a cooler of beer, a pegboard wall.
- **Dockmaster office:** desk, VHF radio, slip board with keys, filing
  cabinets, tide chart, window AC unit.
- **Count room:** desk, money counter, safe (prop), duffel bags, a couch.
- **Restrooms:** showers, sinks, lockers.
- **Yard:** forklift, boats on trailers and stands, a travel-hoist (P, as a
  tall frame over the yard), pallets, drums.
- **Car park:** 6–10 period cars (Ferrari Testarossa, a Cadillac, pickups),
  light poles, dumpster near the alley.
- **Shed:** steel dry-stack racks 3 high with boats, engine stands, outboard
  motors, chain hoists, workbenches.
- **Shed office:** desk, parts counter, calendar, coffee machine.
- **Workshop:** lathes, welders, parts shelving, gas bottles.

## 9. Open questions for W2, W1 and W5

1. **Sinking.** How does a boat sink: `cellHp` on the hull, a per-boat HP pool,
   or damage below a waterline band? `grp_hull` is soft (cellHp 2 500): many
   rounds will hole it. W5/W1 to decide; this doc assumes "enough damage to
   the hull sinks it".
2. **Water traversal.** Can the player swim? If yes, every finger becomes an
   entry; if no, E5 needs a boat. Proposal: no swimming; water = fall and
   respawn on the quay. **Resolved by W2 (layout):** no swimming. Water is
   not walkable ground, and finger and quay edges are stage edges, so E5
   needs a boat. **W14:** a fall is not a death: respawn on the last walkable deck cell, no HP loss, "SPLASH" popup, no retry; enemies never path off edges (edge handling is W1's).
3. **Lex's best speedboat U.** Script: "And if one floats? — Then it's
   yours." Is U a required target (unlock = failing to sink it) or an
   optional fifth boat (mission completes with T1–T4)? Proposal: optional
   fifth, so sparing it is a choice. Stray rounds can still sink it: S12
   crosses its slip and it sits beside T2. W10/W2 to decide; W1 may want a
   hull-hit warning. **W2 (layout):** U keeps its slip beside T2 either
   way; **W14:** U is optional (not in `need`); if still afloat at clear, payout sets `wflags.marina_u_kept=1`.
4. **Fuel.** Do the pumps or T3's tanks explode? Out of BALLISTICS scope; a
   W5 call.
5. **Deck heights.** Floor steps never block sight, so the 0.3 m land/quay
   step is cosmetic. Boats sitting lower than the deck would change cover
   (a hull below deck level is no cover at all). W1 to confirm coverage class
   `waist` for hulls seen from the deck.
6. **Velocity-dependent wood.** `timber` overstates rifle penetration in
   thick wood; `pile` is a separate rifle-fitted material (BALLISTICS §7).
   W5 may prefer one velocity-dependent model.
