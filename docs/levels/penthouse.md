# The Penthouse (Coral Tower): floorplan reference and layout brief

> **Status:** W3 research deliverable (wave 1). This is docs only, not a runtime map.
> **Consumers:** W2 (level designer) builds the stage from it. W1's floorplan
> visualiser and query tools check the result against §5 and §6. W4 (decor)
> uses §8.
> **Mission brief (levels.js):** *"The man who owns the club lives on top of
> Coral Tower … best people … real hardware."*
> **Evidence tags:** **V** verified from a cited source, **D** derived from
> sources, **P** proposed design choice (plausible, not measured), **G**
> gameplay override.
> **Validated:** room bounds, door geometry, reachability, m² totals, loops and
> sightlines S1–S18 were checked by script against the table data in §5–§6
> (no overlaps; interior 596.16 m² + terraces 123.84 m² = 720 m² gross plate).

---

## 1. Design intent

The legacy level (levels.js lines 49–66) is a single floor of rooms. It reads
as a large house rather than the top of an early-1980s Brickell Avenue tower.
The goal is a believable full-floor penthouse on a 30 × 24 m plate, with
the main structure fixed by the tower around it:

- **Plasterboard paradise.** Everything inside the unit is steel stud and
  gypsum (MATERIALS §4). Every gun the player owns goes through every room
  partition, wooden door, cabinet and sofa. **Positioning beats hiding:** only the
  concrete core, a few structural columns and the panic room stop bullets. This
  inverts the motel, where block walls make rooms into boxes. (Buckshot is
  the exception: it stops in the hollow-metal stair and lift doors.) It is the
  mission where wall-banging is the main skill.
- **The tower decides the plan.** A fixed concrete core (two stairs, three
  lifts, shafts) sits off-centre, as at Atlantis and The Palace, which spread
  their cores (P5, P6). The flat is wrapped around it. Two stairs are far
  apart and neither sits behind the owner's bedroom (§4).
- **Three social zones, read from the arrival.** The arrival sequence is
  *lift → vestibule → foyer → gallery → great room*, as in the reference
  units (P1, P3). The **public zone** (great room, dining, bar, terraces) faces
  the bay to the east. The **private zone** (master suite, study) is
  south-east. The **guest wing** and the **service zone** (kitchen, staff,
  laundry, service hall, service lift) lie west and north, towards the city.
- **Several real ways in.** Owners arrive by private lift, staff by
  service lift and both fire stairs serve the floor. That gives five honest
  entries (§6.1, E1–E5, plus an optional roof start E6), each a real
  opening, with no "secret vent".
- **Long glass lanes.** The great room, galleries and terraces give
  11–29 m sightlines. Fights here are long-range across glossy, open rooms,
  then short and chaotic in the bedroom wings.
- **Panic room as a finale.** A grouted-block safe room off the west gallery
  is the one masonry box on the floor. The boss tries to reach it (§6.6).

## 2. References and what each contributes

Cite by key. Links and descriptions only; no plan images are copied.

| Key | Building | What it documents | What we borrow | Rationale |
|---|---|---|---|---|
| **P2** | **Imperial**, 1627 Brickell Ave. Floorplan schedule. <https://www.dienerproperties.com/imperial-condo-brickell-avenue.htm> | Floor-30 penthouse, 5 bed / 3½ bath, 5 034 ft² ≈ **468 m²** (V) | Total area class: a 5-bedroom-equivalent full-floor unit around 470–600 m² | Best area precedent for a large single-level Brickell residence. It does not show lift or wall details. |
| **P1** | **The Palace**, unit A4000, 1541 Brickell. Broker plan. <https://www.condoblackbook.com/brickell/the-palace-condo/unit-A4000-for-sale> | ≈ 5 800 ft² / **539 m²** over three levels, open-to-below area (V); bedroom counts disagree between sources | The multi-level idea, kept off the main floor: a roof stage (§7.3) instead of an internal stair | Shows that the grandest Brickell penthouses stack levels. Area is the total, not per floor. |
| **P5** | The Palace, Architizer project page. <https://architizer.com/projects/the-palace/> | Top three-storey glass cube is one penthouse; **three cores serving two apartments each** (V, indexed text) | Distributed core; service separate from the main arrival | Supports placing stair B away from the main core. |
| **P3** | **Atlantis**, residence 01 / unit 1901, 2025 Brickell. Developer plan. <https://www.condoblackbook.com/brickell/atlantis-on-brickell/unit-1901-for-sale> | 2 149 ft² / 199.65 m², 3 bed / 3 bath; **foyer, utility, living/dining, kitchen, breakfast, master suite, balcony** (V) | Room adjacency: foyer → living/dining; kitchen + breakfast pairing; master suite with its own balcony | The cleanest documented adjacency chain of the four. |
| **P6** | Atlantis, Architizer project page. <https://architizer.com/projects/the-atlantis/> | ≈ 91.4 × 11.3 m slab and **two lift cores** (V, indexed text) | Two separate stairs and cores, fixed by the structure | Arquitectonica's Atlantis (1982) is the period's signature Brickell tower. Only the multi-core idea is borrowed: Atlantis is an 11.3 m-deep slab, while our 30 × 24 m plate is a point-tower floor (P). |
| **P4** | **Villa Regina**, Suite F / PH106, 1581 Brickell. <https://www.condoblackbook.com/brickell/villa-regina-condo/unit-PH106-for-rent> | 2 403 ft² / 223.25 m²; foyer, laundry, kitchen/breakfast, living/dining, walk-in closets, balconies (V; matched plan not verified by owner) | Service grouping (laundry beside kitchen); walk-in dressing rooms; balcony depth | Good domestic and service organisation. |
| **C1** | Miami-Dade building code history. <https://www.miamidade.gov/global/economy/board-and-code/building-code-history.page> | Pre-1992 South Florida Building Code era | Constructions in §7 (via MATERIALS §3–§4) | Period-correct walls. |
| **F1** | 1986 Sears Christmas Wishbook. <https://archive.org/details/1986-sears-christmas-wishbook-catalog> | 1986 consumer electronics and furnishings | Prop period check (§8) | Availability only, not a penthouse inventory. |

**Composite, not a reconstruction.** No source gives a full-floor
1980s Brickell penthouse plan with walls. The plan combines Imperial's area,
Atlantis's and Villa Regina's room adjacencies, and the Palace/Atlantis
distributed cores. Room sizes start from the research kit below. Those
sizes are **P**: proposed by W3 from the reference plans (no reference gives
measured room dimensions in text). Anything larger is flagged **G** in §5.

| Research-kit size (P) | Value | Drawn from |
|---|---|---|
| Private lift vestibule | 3.2 × 3.6 | P1, P2 (arrival sequence) |
| Foyer; gallery width | 4 × 4; 1.5–1.8 wide | P3, P4 |
| Great room | 8 × 7 | P1, P5 |
| Dining | 5 × 4.5 | P1, P3, P4 |
| Kitchen; breakfast; pantry | 5 × 4; 3 × 3; 2 × 2.5 | P3, P4 |
| Master bedroom; dressing; bath | 6 × 5; 3 × 3; 4 × 3.5 | P3, P4 |
| Guest bedroom; guest bath | 4.2 × 4; 2.2 × 2.6 | P1, P3 |
| Study | 4 × 4 | P4 |
| Staff bedroom + bath; laundry | 3 × 3 + 2 × 2.2; 3 × 3 | P3, P4 |
| Terrace depth | 2.4 (3–4 at seating) | P4 (balconies) |
| Passenger lift; service lift; fire stair | 2.4 × 2.6; 2.6 × 2.8; 3 × 4.5 | preliminary blocks, not manufacturer data |
| Core + service allowance | 110–140 m² | P5, P6 |

## 3. Site and coordinate frame

- **Axes:** x runs east (towards Biscayne Bay), z runs south. Origin is the
  north-west corner of the plate. 1 unit = 1 m. The west façade (x = 0)
  faces Brickell Avenue.
- **Stage `ph`** (main floor) bounds: **[0, 0, 30, 24]**. Interior
  **[0, 0, 27.6, 21.6]** (27.6 × 21.6 m). Terraces wrap the east and south
  sides at 2.4 m depth (P4).
- **Floor-to-floor** 3.3 m, with a 2.7 m clear ceiling (P; typical
  post-tensioned slab tower).
- **Stage `lobby`** (ground) and **`roof`**: see §7.3. The `ph` stage
  uses the city at night as a backdrop (the bay to the east, downtown to the
  north). It sits high enough that no neighbouring roof is in sightline.

### 3.1 Plan (schematic; tables in §5–§6 are authoritative)

```
      x: 0    2    4    6    8   10   12   14   16   18   20   22   24   26   28   30
  0.0  +---------+-------+-----+-----------+--------+----------------########::::::
  0.8  |         |       |     |           |                         #      #::::::
  1.6  |         |       |     |           |                         #      #::::::
  2.4  |  STAFF  | LAUN  |PANT    KITCHEN  |        |                # STB  #::::::
  3.2  |         |       |     |           |  BRKF  |  DINING+BAR    #      #::::::
  4.0  |         |       |     |                    |                #      #::::::
  4.8  +---ddd---+--hh---+-hh--+-------dd--+        |                ##mmm###::::::
  5.6  |           SERVICE HALL            d        |                  lob  |::::::
  6.4  +---------+-------+dd-###mmm####mmm#d####----+-            ---+-   --+::::::
  7.2  |         |       |   #       #     #   #                            "::::::
  8.0  |         | bath  |   #       # SVL #   #                            "::::::
  8.8  | GUEST A |       |   #  STA  #     #   #                            "::::::
  9.6  |         h--hhh--d   #       #######   #     GREAT ROOM             "::::::
 10.4  |         h pass  d   #       #     #   #                            "::::::
 11.2  +---------h-------d   ###################                            "::::::
 12.0  |         h pass  d   #    #     #     ##                            "::T:::
 12.8  | GUEST B +--hhh--+   #    # P1  # P2  #     ---------+--------------+::::::
 13.6  |         | bath  |   #    #     #     ##   |         |              |::::::
 14.4  |         |       | G #######mmm###mmm###   |  DRESS                 "::::::
 15.2  +---------+-+-----+   #    #            |   |         |  MASTER BED  "::::::
 16.0  |   WINE    | pwd h   #    #  VESTIBULE |   +---   ---+              "::::::
 16.8  |           |     h   VPNC #---      ---+   d  ANTE   d              "::::::
 17.6  +----ddd----+-----+   #    #            |GE d---------d------hh------+::::::
 18.4  |                 |   #    #                |         |              |::::::
 19.2  |       DEN           #    #    FOYER       d         |              |::::::
 20.0  |                      ####                 d  STUDY  |  MASTER BATH |::::::
 20.8  |                 |    gs               |   |         |              |::::::
 21.6  +--""""""""-------+--- ---- ------------+""""---------+-------------- ::::::
 22.4  ::::::::::::::::::::::::::::SOUTH TERRACE:::::::::::::::::::::::::::: ::::::
 23.2  ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: ::::::
 24.0  ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: ::::::
```

Legend: `#` concrete core / panic room, `- | +` stud partitions, `d` solid
door, `h` hollow door, `m` hollow-metal door, `V` vault door, `"` glass slider,
gaps are open doorways, `:` terrace (`T` labels the east terrace). Cells are 0.4 m (x) × 0.8 m (z). Doors
narrower than a cell may render displaced by one character, and the x tick
labels are approximate (read coordinates from the tables). **G** gallery,
**GE** east gallery, **gs** south gallery, **PNC** panic room, **STA/STB**
stairs, **SVL** service lift, **P1/P2** private/passenger lifts.

## 4. Typology rules the layout must keep

1. **The core is fixed and concrete.** Stairs A and B, the three lifts and the
   shafts are `rc_wall_20` and never move between iterations. The flat is
   fitted around them (P5, P6).
2. **Two independent exits.** Stair doors D8 (stair A) and D15 (stair B) are
   **15.97 m** apart. That is more than ⅓ of the interior diagonal (11.68 m,
   the usual sprinklered-building rule) but less than ½ (17.52 m). Neither
   stair is reached only through the master suite. This is a plausible
   arrangement, **not** a certified 1984 code check (C1; **P**).
3. **Owner's arrival is ceremonial, staff arrival is hidden.** The private
   lift opens into a vestibule, then the foyer. The service lift and stair A
   open into the service hall, which reaches the living rooms only through
   the kitchen/breakfast room or a solid door to the west gallery (P3, P4).
4. **Wet rooms stack.** Baths, kitchen and laundry sit beside the shafts or
   on the west and north sides where risers can run. The powder room and
   guest baths sit on the west gallery spine. **Exception:** the master
   bath takes the south-east corner for the view, fed by risers rising
   through the identical master bath on the floor below. **P**
5. **Glass to the view, solid to the city.** The east and south façades are
   floor-to-ceiling glass with sliders to the terraces. The west (Brickell)
   and north façades are `cbs_ext` spandrel with ribbon windows above
   0.9 m. **P** (MATERIALS §4)
6. **No spawn room is an accidental dead end.** Every room with a spawn in
   §6.6 either has two entrances or is a deliberate dead end used for a
   scripted beat (staff room, laundry, study, guest bedrooms, master bath,
   panic room). Civilians fleeing into a dead end is intended: they are
   cornered, not hidden.
7. **Galleries are 1.8 m wide** (research 1.5–1.8 m, P3/P4). They are the
   spine lanes of the level.

## 5. Room schedule (checkable)

Bounds are `[x0, z0, x1, z1]`. **Ent** counts doorways and openings a pawn
can walk through, including sliders. Windows are not entrances. **Research**
is the target size from the research kit (§2); rooms drawn at that size are
**P**. **G** marks rooms deliberately
larger than research for gameplay. Builds refer to MATERIALS §3.

### 5.1 Stage `ph`

| id | Name | Kind | Bounds | Dims (m) | m² | Ent | Entrances | Research | Tag |
|---|---|---|---|---|---:|:-:|---|---|:-:|
| `staff` | Staff bedroom | service | 0, 0, 4, 5 | 4 × 5 | 20.0 | 1 | D1 | 3 × 3 + bath 2 × 2.2 | G (includes the en-suite as a prop corner) |
| `laundry` | Laundry | service | 4, 0, 7, 5 | 3 × 5 | 15.0 | 1 | D2 | 3 × 3 | G |
| `pantry` | Butler's pantry | service | 7, 0, 9.5, 5 | 2.5 × 5 | 12.5 | 2 | D3, D4 | 2 × 2.5 | G |
| `kitchen` | Kitchen | service | 9.5, 0, 14.5, 5 | 5 × 5 | 25.0 | 3 | D4, D5, D6 | 5 × 4 || P |
| `svc_hall` | Service hall | circulation | 0, 5, 14.5, 6.8 | 14.5 × 1.8 | 26.1 | 8 | D1, D2, D3, D5, D7, D8, D9, D10 | — | P |
| `breakfast` | Breakfast room | living | 14.5, 0, 18, 6.8 | 3.5 × 6.8 | 23.8 | 3 | D6, D7, D11 | 3 × 3 | G |
| `dining` | Dining room + bar | living | 18, 0, 24.6, 6.8 | 6.6 × 6.8 | 44.9 | 3 | D11, D12, D14 | 5 × 4.5 | G (bar added) |
| `stair_b` | Stair B | core | 24.6, 0, 27.6, 4.5 | 3 × 4.5 | 13.5 | 1 | D15 | 3 × 4.5 || P |
| `stair_b_lobby` | Stair B lobby | circulation | 24.6, 4.5, 27.6, 6.8 | 3 × 2.3 | 6.9 | 3 | D13, D14, D15 | — | P |
| `stair_a` | Stair A | core | 8.8, 6.8, 11.8, 11.4 | 3 × 4.6 | 13.8 | 1 | D8 | 3 × 4.5 || P |
| `svc_lift` | Service lift | core | 11.8, 6.8, 14.4, 9.6 | 2.6 × 2.8 | 7.3 | 1 | D9 | 2.6 × 2.8 || P |
| `shaft_1` | Shafts | core | 14.4, 6.8, 16, 11.4 | 1.6 × 4.6 | 7.4 | 0 | — | — | P |
| `shaft_2` | Shafts | core | 11.8, 9.6, 14.4, 11.4 | 2.6 × 1.8 | 4.7 | 0 | — | — | P |
| `shaft_3` | Shafts | core | 8.8, 11.4, 10.8, 14 | 2 × 2.6 | 5.2 | 0 | — | — | P |
| `lift_p1` | Private lift | core | 10.8, 11.4, 13.2, 14 | 2.4 × 2.6 | 6.2 | 1 | D28 | 2.4 × 2.6 || P |
| `lift_p2` | Passenger lift | core | 13.2, 11.4, 15.6, 14 | 2.4 × 2.6 | 6.2 | 1 | D29 | 2.4 × 2.6 || P |
| `shaft_4` | Shaft | core | 15.6, 11.4, 16, 14 | 0.4 × 2.6 | 1.0 | 0 | — | — | P |
| `gal_w` | West gallery | circulation | 7, 6.8, 8.8, 21.6 | 1.8 × 14.8 | 26.6 | 7 | D10, D16, D19, D22, D23, D25, D27 | 1.5–1.8 wide || P |
| `ga_bed` | Guest A bedroom | bedroom | 0, 6.8, 4.2, 11 | 4.2 × 4.2 | 17.6 | 1 | D17 | 4.2 × 4 || P |
| `ga_bath` | Guest A bath | bath | 4.2, 6.8, 7, 9.4 | 2.8 × 2.6 | 7.3 | 1 | D18 | 2.2 × 2.6 || P |
| `ga_pass` | Guest A dressing passage | closet | 4.2, 9.4, 7, 11 | 2.8 × 1.6 | 4.5 | 3 | D16, D17, D18 | — | P |
| `gb_bed` | Guest B bedroom | bedroom | 0, 11, 4.2, 15.2 | 4.2 × 4.2 | 17.6 | 1 | D20 | 4.2 × 4 || P |
| `gb_pass` | Guest B dressing passage | closet | 4.2, 11, 7, 12.6 | 2.8 × 1.6 | 4.5 | 3 | D19, D20, D21 | — | P |
| `gb_bath` | Guest B bath | bath | 4.2, 12.6, 7, 15.2 | 2.8 × 2.6 | 7.3 | 1 | D21 | 2.2 × 2.6 || P |
| `wine` | Wine room | closet | 0, 15.2, 5, 17.6 | 5 × 2.4 | 12.0 | 1 | D24 | — | P |
| `powder` | Powder room | bath | 5, 15.2, 7, 17.6 | 2 × 2.4 | 4.8 | 1 | D22 | — | P |
| `den` | Den / TV room | living | 0, 17.6, 7, 21.6 | 7 × 4 | 28.0 | 3 | D23, D24, D43 | — | P |
| `panic` | Panic room | secure | 8.8, 14, 10.8, 19.8 | 2 × 5.8 | 11.6 | 1 | D27 | — | P |
| `gal_s` | South gallery | circulation | 8.8, 19.8, 10.8, 21.6 | 2 × 1.8 | 3.6 | 2 | D25, D26 | — | P |
| `vest` | Lift vestibule | circulation | 10.8, 14, 16, 17.2 | 5.2 × 3.2 | 16.6 | 3 | D28, D29, D30 | 3.2 × 3.6 | G (serves two lifts) |
| `foyer` | Foyer | circulation | 10.8, 17.2, 16, 21.6 | 5.2 × 4.4 | 22.9 | 3 | D26, D30, D31 | 4 × 4 | G |
| `great` | Great room | living | 16, 6.8, 27.6, 13 | 11.6 × 6.2 | 71.9 | 5 | D12, D13, D32, D39, D40 | 8 × 7 | G |
| `gal_e` | East gallery | circulation | 16, 13, 17.8, 21.6 | 1.8 × 8.6 | 15.5 | 5 | D31, D32, D33, D34, D42 | 1.5–1.8 wide || P |
| `m_dress` | Master dressing room | closet | 17.8, 13, 21.6, 16 | 3.8 × 3 | 11.4 | 2 | D35, D37 | 3 × 3 || P |
| `m_ante` | Master anteroom | circulation | 17.8, 16, 21.6, 18 | 3.8 × 2 | 7.6 | 3 | D33, D35, D36 | — | P |
| `study` | Study | office | 17.8, 18, 21.6, 21.6 | 3.8 × 3.6 | 13.7 | 1 | D34 | 4 × 4 || P |
| `m_bed` | Master bedroom | bedroom | 21.6, 13, 27.6, 18 | 6 × 5 | 30.0 | 4 | D36, D37, D38, D41 | 6 × 5 || P |
| `m_bath` | Master bath | bath | 21.6, 18, 27.6, 21.6 | 6 × 3.6 | 21.6 | 1 | D38 | 4 × 3.5 | G |
| `ter_e` | East terrace | exterior | 27.6, 0, 30, 24 | 2.4 × 24 | 57.6 | 4 | D39, D40, D41, D44 | 2.4 deep || P |
| `ter_s` | South terrace | exterior | 0, 21.6, 27.6, 24 | 27.6 × 2.4 | 66.2 | 3 | D42, D43, D44 | 2.4 deep || P |

**Totals (checkable):** interior rooms 596.16 m², terraces 123.84 m², plate
720 m². Core (stairs, lifts, shafts) 65.3 m². Core plus service hall, vestibule
and stair B lobby is 115 m², inside the research 110–140 m² allowance. The
interior is above Imperial's 468 m² (P2) because the core is counted in it and
the great room, dining and service rooms are enlarged (**G**).

### 5.2 Doors

`x=c` is a wall on the line x = c, with the door centred at the stated z (and
vice versa). **Kind** maps to MATERIALS §3 builds; `open` is a doorway with no
leaf; `glass` is a `glass_tempered_6` slider; `door_vault` (MATERIALS §3) is the panic-room door. The machine-readable
layout is `docs/levels/penthouse.layout.json` (STYLE-LEVELS §3.1).

| Door | Rooms | Wall, centre | Width | Kind |
|---|---|---|---:|---|
| D1 | `staff` ↔ `svc_hall` | z=5, x 2 | 0.9 | door_solid |
| D2 | `laundry` ↔ `svc_hall` | z=5, x 5.5 | 0.9 | door_hollow |
| D3 | `pantry` ↔ `svc_hall` | z=5, x 8.2 | 0.9 | door_hollow |
| D4 | `pantry` ↔ `kitchen` | x=9.5, z 2.5 | 1.0 | open |
| D5 | `kitchen` ↔ `svc_hall` | z=5, x 13 | 0.9 | door_solid |
| D6 | `kitchen` ↔ `breakfast` | x=14.5, z 4 | 1.2 | open |
| D7 | `svc_hall` ↔ `breakfast` | x=14.5, z 5.9 | 0.9 | door_solid |
| D8 | `svc_hall` ↔ `stair_a` | z=6.8, x 10.3 | 1.0 | door_metal |
| D9 | `svc_hall` ↔ `svc_lift` | z=6.8, x 13.1 | 1.1 | door_metal |
| D10 | `svc_hall` ↔ `gal_w` | z=6.8, x 7.9 | 0.9 | door_solid |
| D11 | `breakfast` ↔ `dining` | x=18, z 1 | 1.5 | open |
| D12 | `dining` ↔ `great` | z=6.8, x 21 | 5.0 | open |
| D13 | `stair_b_lobby` ↔ `great` | z=6.8, x 26.1 | 1.2 | open |
| D14 | `stair_b_lobby` ↔ `dining` | x=24.6, z 5.6 | 0.9 | open |
| D15 | `stair_b` ↔ `stair_b_lobby` | z=4.5, x 26.1 | 1.0 | door_metal |
| D16 | `gal_w` ↔ `ga_pass` | x=7, z 10.2 | 0.9 | door_solid |
| D17 | `ga_pass` ↔ `ga_bed` | x=4.2, z 10.2 | 0.9 | door_hollow |
| D18 | `ga_pass` ↔ `ga_bath` | z=9.4, x 5.6 | 0.8 | door_hollow |
| D19 | `gal_w` ↔ `gb_pass` | x=7, z 11.8 | 0.9 | door_solid |
| D20 | `gb_pass` ↔ `gb_bed` | x=4.2, z 11.8 | 0.9 | door_hollow |
| D21 | `gb_pass` ↔ `gb_bath` | z=12.6, x 5.6 | 0.8 | door_hollow |
| D22 | `gal_w` ↔ `powder` | x=7, z 16.4 | 0.8 | door_hollow |
| D23 | `gal_w` ↔ `den` | x=7, z 19.6 | 1.2 | open |
| D24 | `den` ↔ `wine` | z=17.6, x 2.5 | 0.9 | door_solid |
| D25 | `gal_w` ↔ `gal_s` | x=8.8, z 20.7 | 1.8 | open |
| D26 | `gal_s` ↔ `foyer` | x=10.8, z 20.7 | 1.8 | open |
| D27 | `gal_w` ↔ `panic` | x=8.8, z 16.9 | 0.9 | door_vault |
| D28 | `vest` ↔ `lift_p1` | z=14, x 12 | 1.1 | door_metal |
| D29 | `vest` ↔ `lift_p2` | z=14, x 14.4 | 1.1 | door_metal |
| D30 | `vest` ↔ `foyer` | z=17.2, x 13.4 | 2.4 | open |
| D31 | `foyer` ↔ `gal_e` | x=16, z 19.4 | 1.8 | open |
| D32 | `gal_e` ↔ `great` | z=13, x 16.9 | 1.8 | open |
| D33 | `gal_e` ↔ `m_ante` | x=17.8, z 17 | 0.9 | door_solid |
| D34 | `gal_e` ↔ `study` | x=17.8, z 19.8 | 0.9 | door_solid |
| D35 | `m_ante` ↔ `m_dress` | z=16, x 19.7 | 0.9 | open |
| D36 | `m_ante` ↔ `m_bed` | x=21.6, z 17 | 0.9 | door_solid |
| D37 | `m_dress` ↔ `m_bed` | x=21.6, z 14.5 | 0.9 | open |
| D38 | `m_bed` ↔ `m_bath` | z=18, x 24.6 | 0.9 | door_hollow |
| D39 | `great` ↔ `ter_e` | x=27.6, z 8.6 | 2.4 | glass |
| D40 | `great` ↔ `ter_e` | x=27.6, z 11.2 | 2.4 | glass |
| D41 | `m_bed` ↔ `ter_e` | x=27.6, z 15.5 | 3.0 | glass |
| D42 | `gal_e` ↔ `ter_s` | z=21.6, x 16.9 | 1.5 | glass |
| D43 | `den` ↔ `ter_s` | z=21.6, x 2.5 | 3.0 | glass |
| D44 | `ter_s` ↔ `ter_e` | x=27.6, z 22.8 | 2.4 | open (terrace corner) |

The lift doors D28/D29 are lift landing doors (hollow-metal, `door_metal`).
Whether they open on call is a W1/W2 decision (§9).

**Windows (not entrances):** fixed `glass_annealed_6` between the sliders on
the east façade (except stair B's concrete wall, z 0–4.5) and the south façade, including the foyer's south wall (it is
the view at the end of S8). Ribbon windows above a 0.9 m `cbs_ext` spandrel on
the north (staff, laundry, kitchen, breakfast, dining) and west (guest
bedrooms and den; the wine room is windowless). **P**

## 6. Gameplay overlay (checkable targets)

### 6.1 Entries into the floor

| # | Entry | Arrives in | Use |
|---|---|---|---|
| E1 | Private lift (`lift_p1`, D28) | `vest` | Front-door arrival. Ambush: the vestibule is watched from the foyer and the open D30. The "invited guest" approach. |
| E2 | Passenger lift (`lift_p2`, D29) | `vest` | Same vestibule. A second car the player or the enemy can use; a natural spot for reinforcements. |
| E3 | Service lift (`svc_lift`, D9) | `svc_hall` | Staff arrival. Quiet start among civilians (cook, maid); route into the kitchen or west gallery. |
| E4 | Stair A (D8) | `svc_hall` | Fire stair from below; same zone as E3, beside it. |
| E5 | Stair B (D15) | `stair_b_lobby` → `great`/`dining` | The bold entry: straight into the public zone beside the bar. |
| E6 | Roof (stair A or B from `roof` stage) | as E4/E5 | Optional helicopter or roof approach (§7.2). |

### 6.2 Sightlines (W1 query targets)

Standing eye height 1.6 m to a standing target. Per the roadmap stance
heights (chest 1.2 m, waist 0.9 m), only `full` walls and **closed leaf doors
of any kind** (`door_hollow`, `door_solid`, `door_metal`, `door_vault`) block
a standing sightline. Open doorways, glass (sliders and fixed panes),
counters, spandrels, planters and rails do not. Props never block. Floor
steps never break line of sight (user decision Q9).

| # | From → to | Length | Expected | Intent |
|---|---|---:|---|---|
| S1 | great (16.3, 10) → (27.3, 10) | 11.0 | **clear** | The great room is one open lane, west wall to the bay glass. |
| S2 | gal_w (7.9, 7) → (7.9, 21.4) | 14.4 | **clear** | West gallery spine. The panic-room door and all guest doors open onto it. |
| S3 | gal_e (16.9, 13.2) → (16.9, 21.4) | 8.2 | **clear** | East gallery spine; master suite and study doors. |
| S4 | svc_hall (0.3, 5.9) → (14.4, 5.9) | 14.1 | **clear** | Service lane, staff to breakfast-room door. |
| S5 | ter_e (28.8, 0.3) → (28.8, 23.7) | 23.4 | **clear** | Whole east terrace. Anyone outside the glass is exposed. |
| S6 | ter_s (0.3, 22.8) → (29.7, 22.8) | 29.4 | **clear** | Whole south terrace, through the open corner D44. Longest line on the floor. |
| S7 | dining (21, 3) → great (21, 12.8) | 9.8 | **clear** | Through the 5 m opening D12: dining and great room are one space. |
| S8 | vest (13.4, 14.2) → foyer (13.4, 21.4) | 7.2 | **clear** | From the lift doors the guest sees the foyer and the view south. |
| S9 | foyer (12, 20) → great (20, 10) | 12.8 | **blocked** | From the middle of the foyer the great room is hidden; only a narrow wedge through D31 and D32 shows it. The full reveal comes in the east gallery (S10). |
| S10 | gal_e (16.9, 20) → great (16.9, 7) | 13.0 | **clear** | The reveal: east gallery opens straight into the great room. |
| S11 | stair_b_lobby (26.1, 4.7) → great (26.1, 12.8) | 8.1 | **clear** | Stair B arrival looks across the great room. |
| S12 | great (27, 10) → m_bed (27, 15.5) | 5.5 | **blocked** | Great room cannot see into the master bedroom (but can shoot through, §6.7). |
| S13 | great (20, 8.6) → ter_e (29.5, 8.6) | 9.5 | **clear** | Through slider D39 to the terrace. |
| S14 | gal_w (7.4, 20.7) → foyer (15.8, 20.7) | 8.4 | **clear** | West and east halves join through the south gallery. |
| S15 | kitchen (10, 4) → breakfast (17.8, 4) | 7.8 | **clear** | Kitchen to breakfast room through D6. |
| S16 | breakfast (14.8, 1) → dining (24.4, 1) | 9.6 | **clear** | Breakfast to dining through D11. |
| S17 | vest (15, 15.6) → gal_e (17, 15.6) | 2.0 | **blocked** | No direct view through the partition between vestibule and private gallery; the only view is the dog-leg through the foyer (D30, D31). |
| S18 | kitchen (10, 2.5) → dining (24.4, 2.5) | 14.4 | **blocked** | D6 (z 3.4–4.6) and D11 (z 0.25–1.75) do not overlap, so no straight line from the kitchen reaches the dining room or great room. |

### 6.3 Cover inventory

The point of the floor is that most cover is soft. **Coverage** uses the
MATERIALS §3 classes (`full`, `chest`, `waist`, `rail`, `glass`).

| Zone | Cover | Coverage | Stops (BALLISTICS §4) | Notes |
|---|---|---|---|---|
| Core faces (stairs A/B, lifts, shafts) | `rc_wall_20` | full | everything, including a single .50 BMG; ≈ 13 .50 BMG rounds remove a cell | The hard anchor of the floor; corners at (8.8, 6.8), (16, 6.8), (16, 14), (10.8, 14), (24.6, 4.5). |
| Great room | two `rc_column_40` at (19.8, 11.4) and (23.8, 11.4) | full (0.4 × 0.4) | everything (indestructible) | **G**: a 4 m interior bay is tighter than the façade grid; chosen for cover. Verified not to block any §6.2 line. |
| Façades | `rc_column_40` (0.4 × 0.4) at the centres listed in §7.1 | full | everything (indestructible) | P, ≈ 6–7 m spacing |
| Great room, den | sofas (`sofa`), armchairs, coffee tables | waist (props) | nothing | Concealment only. |
| Bar (dining) | `counter_cabinet` bar front | waist | nothing (9mm keeps 69 %) | Looks like cover, isn't. |
| Kitchen | island and runs, `counter_cabinet` | waist | nothing | Same. |
| Panic room | `cmu_filled` walls + `door_vault` | full | everything except the .50 BMG (59 % through the wall, 33 % through the door); neither can be removed | The one hard box. |
| Terraces | planters (`cbs_ext` as a proxy for a concrete box of soil, P), rail | planters `waist`; rail `rail` | planters stop handguns, buckshot and the Uzi, as `cbs_ext` does; the rail stops nothing | Rail material is open (§9). |

### 6.4 Flank loops (each must be a closed walkable cycle)

Length is the sum of straight segments between consecutive door centres
(a lower bound on the walked distance). `Dn (or Dm)` means either door closes
the loop.

| Loop | Path | Length (approx.) |
|---|---|---:|
| L1 grand ring | foyer → D31 → gal_e → D32 → great → D12 → dining → D11 → breakfast → D6 → kitchen → D5 → svc_hall → D10 → gal_w → D25 → gal_s → D26 → foyer | ≈ 62 m |
| L2 terrace ring | great → D39 (or D40) → ter_e → D44 → ter_s → D42 → gal_e → D32 → great | ≈ 45 m |
| L3 master ring | gal_e → D33 → m_ante → D36 → m_bed → D41 → ter_e → D44 → ter_s → D42 → gal_e | ≈ 33 m |
| L4 dressing ring | m_ante → D35 → m_dress → D37 → m_bed → D36 → m_ante | ≈ 9 m |
| L5 bar loop | great → D13 → stair_b_lobby → D14 → dining → D12 → great | ≈ 11 m |
| L6 service triangle | kitchen → D6 → breakfast → D7 → svc_hall → D5 → kitchen | ≈ 13 m |
| L7 west terrace ring | gal_w → D23 → den → D43 → ter_s → D42 → gal_e → D31 → foyer → D26 → gal_s → D25 → gal_w | ≈ 40 m |

**Checkable connectivity targets:** removing edge D31 (foyer ↔ gal_e) still
leaves a path vest → great (via gal_s, gal_w, svc_hall, kitchen). Removing
D11 (breakfast ↔ dining) still leaves a path great → svc_hall (via gal_e,
foyer, gal_s, gal_w). Every room except `shaft_*` is reachable from every
entry E1–E5.

### 6.5 Approach variety

| Start | First contact | Main risk |
|---|---|---|
| E1/E2 (lift) | vest → foyer, 2 guards | Doors open onto a watched box; foyer guards fire through the vestibule partitions. |
| E3/E4 (service) | svc_hall, civilians | Noise; staff civilians in the line of fire; kitchen is soft. |
| E5 (stair B) | dining/bar, great room | Arrives in the largest enemy group; strongest start, worst exposure. |

### 6.6 Spawns and enemy placement (by role, for W2 to tune)

"Best people … real hardware": enemies carry rifles and SMGs and wear IIIA
vests (BALLISTICS §5), so handguns struggle and rifles are rewarded.

| Zone | Count | Role | Behaviour hint |
|---|:-:|---|---|
| `vest` / `foyer` | 2 | door guards | Hold the foyer facing D30; respond to E1/E2. |
| `great` | 3–4 | party / bodyguards | Seated, then use columns and core corners. |
| `dining` (bar) | 1–2 | bartender (civilian) + guard | Guard flanks via L5. |
| `kitchen`, `svc_hall` | 2 civ + 1 | cook, maid, guard | Civilians flee to `staff` or `laundry`. |
| `gal_w` / `den` | 1–2 | rover | Patrol the west gallery spine (S2). |
| `m_bed` / `study` | boss + 1 | boss, close protection | On alarm: boss runs gal_e → foyer → gal_s → gal_w → D27 into `panic` (≈ 22 m). Intercept before he reaches it, or breach it (§9). |
| `ter_e` / `ter_s` | 1 | smoker | Outside the glass; sees into the great room. |

### 6.7 Penetration play notes (from BALLISTICS §4)

- **Every interior partition is see-through for bullets.** `stud_steel_gyp`
  lets a 9mm keep 84 % of its energy, 5.56 95 %. The double-board
  `stud_steel_gyp2` (vestibule, service hall, staff/guest demising) still lets
  a 9mm keep 64 % and buckshot 38 % per pellet. Firing through S9, S12 and
  S17 (all "blocked" for sight) is legitimate and should be rewarded with
  audio or thermal-style cues, not punished.
- **Doors** `door_solid` keep 60 % (9mm) and 31 % (buck). Stair and lift
  doors are `door_metal`: 9mm keeps 27 %, buckshot stops. Shooting the lock
  (slug) opens a solid door in one shell, a metal door in two.
- **Glass** `glass_tempered_6` sliders barely slow anything (9mm 93 %), but
  each hit should shatter the pane in one go (tempered) with the full VFX
  set. Fixed `glass_annealed_6` cracks and holes.
- **Bar and kitchen counters** stop nothing. Tooltips should warn the player
  (W7 TIPS).
- **Core and columns** stop every single round, the .50 BMG included;
  sustained .50 BMG fire (≈ 13 rounds) removes a core cell, and columns never
  break. The panic room stops everything but the .50 BMG (59 % retained
  through `cmu_filled`, 33 % through `door_vault`).
- **40 mm HE** removes `stud_steel_gyp` cells within 0.60 m of the blast
  (≈ 0.52 m for `stud_steel_gyp2`), leaving a firing hole up to about
  1.5 × 1.5 m. It is not a walkable doorway (MATERIALS §5), so the
  connectivity targets in §6.4 are unchanged. It never removes core
  concrete, the panic room's grouted block or the vault door.

## 7. Construction summary

Builds come from MATERIALS §3 and the §4 Brickell-tower palette.

| Element | Build | Coverage | Tag |
|---|---|---|:-:|
| Core walls (stairs, lifts, shafts) | `rc_wall_20` | full | D |
| Façade structure | `rc_column_40` | full | D |
| East/south façade infill | `glass_annealed_6` fixed, `glass_tempered_6` sliders | `glass` | D/P |
| North/west façade | `cbs_ext` spandrel to 0.9 m + ribbon `glass_annealed_6` above | `waist` spandrel + `glass` | P |
| Acoustic/privacy walls (list in §7.2) | `stud_steel_gyp2` | full | P |
| Other interior partitions | `stud_steel_gyp` | full | D |
| Panic room walls | `cmu_filled` | full | P |
| Panic door D27 | `door_vault` (MATERIALS §3) | full | P (§9) |
| Kitchen, bar, vanities | `counter_cabinet` | `waist` | D |
| Terrace rail | aluminium picket (`rail` coverage) | rail | P (§9) |
| Terrace planters | `cbs_ext` (proxy: concrete planter with soil) | waist | P |

Any interior edge that touches a core room uses `rc_wall_20`, and any edge of
the panic room uses `cmu_filled`; those rules override the rows above.

### 7.1 Columns

All `rc_column_40`, 0.4 × 0.4, centred at:

- **Great room, free-standing (G):** (19.8, 11.4), (23.8, 11.4).
- **East façade (P):** (27.6, 6.8), (27.6, 13.0), (27.6, 18.0), and the
  corners (27.6, 0) and (27.6, 21.6). These sit at slider ends and room
  junctions, clear of D39–D41.
- **South façade (P):** (0, 21.6), (7.0, 21.6), (14.0, 21.6), (21.6, 21.6),
  clear of D42 and D43.
- **North and west façades (P):** (7.0, 0), (14.5, 0), (21.0, 0), (0, 7.0),
  (0, 14.0), embedded in the `cbs_ext` spandrel wall.

Further interior columns are assumed buried in the core and partitions.

### 7.2 Which partitions are `stud_steel_gyp2`

Double-board walls go where a real flat needs acoustic or privacy
separation (P):

| Edge | Between |
|---|---|
| z = 5, x 0–14.5 | service rooms (staff, laundry, pantry, kitchen) ↔ `svc_hall` |
| x = 14.5, z 5–6.8 | `svc_hall` ↔ `breakfast` |
| x = 7, z 6.8–21.6 | guest wing, powder room and den ↔ `gal_w` |
| z = 11, x 0–7; z = 15.2, x 0–7 | guest A ↔ guest B; guest B ↔ wine and powder room |
| x = 16, z 14–17.2; z = 17.2, x 10.8–16 either side of D30 | `vest` ↔ `gal_e`; `vest` ↔ `foyer` |
| x = 17.8, z 13–21.6 | `gal_e` ↔ master dressing room, anteroom and study |
| x = 21.6, z 13–21.6; z = 13, x 21.6–27.6 | master bedroom and bath ↔ dressing room, anteroom and study; master bedroom ↔ great room |

Every other non-core, non-panic interior edge is `stud_steel_gyp`.

### 7.3 Supporting stages (brief)

- **`lobby`** (optional opening stage, ground floor, ≈ 30 × 24 m footprint
  plus drop-off): wind lobby off Brickell Avenue; concierge desk; lift lobby
  for the three cars; mail room; management office; security/CCTV room;
  service corridor to the loading dock and the service lift. Concierge and
  guard are the soft gate; the player chooses lift (E1/E2) or service (E3).
  Builds: lobby glazing + `rc_column_40`; back-of-house `cmu_hollow`. **P**
- **`roof`** (optional finale or escape): both stairs reach it. A 3 × 6 m
  pool on a separate deck (P1/P5 suggest the type, **not verified** as
  standard), lift machine room (`cmu_hollow`), cooling tower, and parapet.
  A helicopter extraction can stage here. **P**

## 8. Props by zone (circa 1986)

Period availability checked against F1 where possible; the rest is proposed
dressing. Do not import a modern renovation (no induction hobs, quartz, flat
screens).

| Zone | Props |
|---|---|
| `vest` | Stone (travertine) floor, console table, wall mirror, wall intercom/handset, large abstract canvas, uplighters |
| `foyer` | Console, sculpture plinth, coat cupboard, framed art, track lighting, palm in a brass pot |
| `great` | Low white leather sectional, glass-and-chrome coffee tables, armchairs, Arco-style floor lamps, rack stereo (turntable, cassette deck, amp) (F1), console CRT TV + VCR (F1), drinks trolley, baby grand piano, large potted palms |
| `dining` | Eight-seat lacquered table, upholstered chairs, sideboard, glassware cabinet, chandelier; **bar**: mirrored back bar, stools, ice bucket, bottles |
| `breakfast` | Round table, four chairs, wall phone (F1), hanging plant |
| `kitchen` | Full-size fridge, range + wall oven, dishwasher, countertop microwave (F1), laminate counters, island, knife block, small appliances |
| `pantry` | Shelving, silver cabinet, champagne fridge, cases of bottles |
| `svc_hall` | Utility shelving, mop bucket, linen trolley, intercom panel |
| `staff` | Single bed, wardrobe, small TV, chair; compact bath corner |
| `laundry` | Washer/dryer pair, ironing board, linen shelves, cleaning cupboard |
| `ga_bed` / `gb_bed` | Queen or twin beds, dresser, bedside lamps, luggage stand, telephone |
| `ga_bath` / `gb_bath` / `powder` | Vanity, mirror, toilet, tub/shower (guest), towels |
| `den` | Sofa, TV + VCR, video-tape shelf, games console (Atari 7800/NES, F1), bar fridge |
| `wine` | Racking, tasting table |
| `panic` | Steel shelving, bottled water, radio, CCTV monitor wall, gun rack, cash bags |
| `study` | Desk, leather chair, corded phone, electric typewriter (F1), filing cabinets, safe, bookcases, ledger |
| `m_bed` | King bed on a platform, bedside tables and lamps, dresser, upholstered bench, armchair, telephone, mirrored wall |
| `m_dress` | Mirrored wardrobes, dressing table, shoe racks, luggage |
| `m_bath` | Double vanity, sunken tub, separate shower, toilet and bidet, brass fittings |
| `ter_e` / `ter_s` | Loungers, outdoor table and chairs, concrete planters with palms, low lighting, a telescope |

## 9. Open questions for W2 and W1

1. **Panic-room breach.** `door_vault` has no lock breach (`lockHp` ∞), so
   the options are: (a) intercept the boss before he reaches it; (b) a
   scripted keycard or code from the boss's study safe; (c) the .50 BMG
   through the door (33 % retained) to kill him inside without opening it.
   W3 recommends (a) with (b) as the fallback. W1/W5 decide.
2. **Terrace rail.** Aluminium picket rail (rail coverage, stops nothing) or
   a period glass-panel rail on a low concrete curb? Both are plausible for
   1980s Brickell (P). Shared with the motel water/rail question already sent
   to W1.
3. **Falling from the terraces.** Is the plate edge lethal, or blocked?
   W1 decides.
4. **Lift doors as entries.** Do D28/D29 open on call, and can enemies arrive
   by lift as reinforcements (E2)?
5. **Interior columns** at (19.8, 11.4) and (23.8, 11.4) are a gameplay
   choice. W2 may remove them if the great room should be pure concealment.
6. **Sunken conversation pit** (period-typical) inside the great room, about
   x 20.4–25.2, z 7.6–11.0. Per user decision Q9, floor steps never break
   line of sight, so it is decor only, not cover. W2 decides whether to
   include it.
7. **Stages.** `lobby` and `roof` are optional; the brief needs only `ph`.
