# Decor style and kit spec (R3)

Status: v1, written by W3 on gitlab/main 5c37459. The room-kind vocabulary
(§1) is confirmed by W2 (2026-11-09). The solid-vs-visual split (§5) is a
proposal awaiting a W1/W2b decision.

Consumers:
- **W4** `decor.js`: `DECOR.items` (§2), `DECOR.kits` (§3), and the
  `DECOR.place` rules (§4) and checklist (§6).
- **W2** plans: `rooms[].kind` and `style` (§1).
- **W1/W2b**: the visual-only dressing layer (§5).

Sources:
- [STYLE-LEVELS](../STYLE-LEVELS.md): §5 decor boards; §2 coverage classes;
  §1 rule 2 door and corridor widths; §1 rule 7 period check.
- The §8 "props by zone" of each level brief.
- [PLAN-FORMAT](../PLAN-FORMAT.md): the prop schema.
- [MATERIALS](../research/MATERIALS.md) §3: build ids.
- plans/motel.js: the authored prop precedents.

Where this doc and a level brief's §8 disagree, the brief wins for that room.
Where an explicit plan prop exists, it wins over anything a kit generates.

## 0. Conventions

- Units are metres. Plan axes: x runs east, z runs south. `w` is the width
  along the host wall (or along the item's front), `d` is the depth away from
  it, and `h` is the height of the top above the floor.
- **Host** (W4 scope names):

  | Host | Placement |
  |---|---|
  | `wall` | Stands on the floor with its back against a wall face. |
  | `corner` | Stands in a room corner, against two walls. |
  | `free` | Stands on the floor, away from walls. |
  | `wallMount` | Hangs on a wall face; `y` is its centre height. |
  | `ceiling` | Hangs from a roofed ceiling; `y` is its lowest point. |
  | `top` | Sits on a host item's top surface (`on:` lists the hosts). |
  | `scatter` | Floor clutter: rugs, bags, buckets, pallets. |

- **Facing:**

  | Facing | Meaning |
  |---|---|
  | `out` | The front faces away from the host wall, into the room. |
  | `pair` | Faces its group partner (sofa ↔ TV, chair ↔ desk). |
  | `table` | Faces the table centre. |
  | `path` | Faces the nearest circulation or door. |
  | `street` | Faces the street edge. |
  | `any` | Random, in 90° steps. |

- **Coverage** uses only the MATERIALS/STYLE-LEVELS classes. For solid props,
  choose the class from the real height:

  | Real height | Class |
  |---|---|
  | h ≥ 1.6 m | `full` |
  | 1.2 ≤ h < 1.6 m | `chest` |
  | h < 1.2 m | `waist` |

  `rail` and `glass` are for railings and glazing, not furniture. The
  low-item rule (lounger h 0.4 as `waist`) follows the plans/motel.js
  precedent. **Props never block sight** (STYLE-LEVELS §3.4, user Q9). The
  class only affects shots and stance cover.
- **Builds** come only from MATERIALS §3; no new ids are invented here. Wood
  case furniture uses `counter_cabinet` (ply skins around a void). Appliances
  and filing cabinets use `car_door` (two thin steel skins around a void).
  Heavy steel equipment uses `steel_3mm`, and safes use `steel_10mm`. §7 Q1
  asks W5 whether dedicated builds are wanted.
- **Period:** everything must be available by 1986 (STYLE-LEVELS §1 rule 7;
  F1 = Sears Wishbook). Imperial nominal sizes are given where the trade
  sized items in inches.

## 1. Room-kind vocabulary

### 1.1 Canonical kinds

`rooms[].kind` names the room's **function**, from this closed set.
`plan.js validate` warns on any other value (W2f). The kit lookup is
`DECOR.kits[kind][style]`.

| Kind | Zone | What it is | Kit |
|---|---|---|---|
| `living` | int | Living, great room, den, TV room, manager's sitting room | yes |
| `dining` | int | Dining room, breakfast room, dinette, dining saloon | yes |
| `kitchen` | int | Domestic kitchen, commercial kitchen, food counter, galley | yes |
| `bedroom` | int | Guest room, bedroom, stateroom, staff bedroom | yes |
| `bath` | int | Private bath, powder room, public restroom | yes |
| `closet` | int | Walk-in, dressing room or passage, coat check | yes |
| `reception` | int | Lobby or foyer with a desk or cashier: motel office, club foyer, studio reception | yes |
| `lounge` | int | Seated social room: VIP, card or poker room, client or artists' lounge | yes |
| `assembly` | int | Large open floor: dance hall, arcade floor, food court, ballroom | yes |
| `retail` | int | Shop floor | yes |
| `office` | int | Desk work: back office, study, dockmaster, producer's office | yes |
| `secure` | int | Cash or valuables room: count room, panic room, tape vault | yes |
| `control` | int | Console or monitor room: studio control room, security room, programming suite, tape copy | yes |
| `studio` | int | Recording live room, vocal booth, isolation room | yes |
| `workshop` | int | Workbench room: maintenance, repair or tech shop, boat workshop | yes |
| `staff` | int | Break room or crew mess | yes |
| `utility` | int | Laundry, housekeeping, janitor | yes |
| `store` | int | Storeroom, pantry, wine room, gear store, liquor store | yes |
| `plant` | int | Electrical, pump or machine room | yes |
| `circulation` | int | Corridor, gallery, vestibule, sound lock, stair lobby, concourse | yes (wall items only) |
| `stair` | int/ext | Stair or stair head | no |
| `core` | int | Lift, shaft or sealed chase | no |
| `walk` | ext | Exterior walkway, balcony, side deck, shore path | yes |
| `terrace` | ext | Private terrace, roof terrace, aft deck | yes |
| `court` | ext | Pool court, entrance plaza | yes |
| `lot` | ext | Parking lot, car park, service driveway with stalls | yes |
| `street` | ext | Sidewalk | yes |
| `road` | ext | Carriageway, including a parking lane | yes (parked cars only) |
| `alley` | ext | Service alley, gangway, service drive | yes |
| `yard` | ext | Service yard, boat yard, loading dock apron | yes |
| `pier` | ext | Quay, finger, T-head, fuel dock | yes |
| `planter` | ext | Landscape island or bed | yes (planting) |
| `canopy` | ext | Porte-cochère or roofed drive-under | no |
| `roof` | ext | Non-occupied roof | no |
| `special` | any | One-off room dressed only by explicit plan props: ice nook, DJ booth, wheelhouse, dry-stack shed, foredeck | **no**: the plan authors every prop |

`stair`, `core`, `canopy`, `roof` and `special` get no generated decor.
`room` and `yard` used as the plan.js fallback are not kinds; the fallback
warns (W2f).

### 1.2 Style variants

The optional `style` field sets the finish. It is written at plan level
(`PLANS.x.style`) and can be overridden per room. A kit that has no entry
for a style falls back to `commercial`, then to the kit's first style.

| Style | Character (circa 1986) | Default for |
|---|---|---|
| `motel` | 1950s–70s budget roadside: chenille, wood-grain laminate, bolted CRT, terrazzo or vinyl, framed prints, through-wall AC | Motel Sunset |
| `high_end` | 1980s luxury condo: white leather, lacquer, glass and chrome, brass, mirror walls, travertine, large abstract canvases, palms | The Penthouse; yacht owner's areas |
| `deco` | 1930s Deco shell, 1980s nightlife fit-out: neon, glass block, terrazzo, chrome stools, mirror, booths | Club Flamingo |
| `marine` | Boat or waterfront: everything fixed down, fiddle rails, teak, stainless, life rings, rope, portholes | Vice Marina; yacht working areas |
| `commercial` | 1980s tenant fit-out: dropped ceilings, fluorescent tubes, carpet tile, laminate, steel shelving, signage | Starlight Arcade, Ocean View Mall, The Recording Studio; back-of-house anywhere |

### 1.3 Mapping from `plans/motel.js` (applied by W2f)

| Old kind | Rooms | New kind |
|---|---|---|
| `guest` | `r101`…, `r201`… (rearBlock and the west block) | `bedroom` |
| `apartment` | `mgr_bed` / `mgr_liv` | `bedroom` / `living` |
| `office` | `lobby` / `bo` | `reception` / `office` |
| `service` | `laundry`, `hk` | `utility` |
| `service` | `maint` | `workshop` |
| `service` | `pump` | `plant` |
| `service` | `ice` | `special` (the plan already authors its ice and cola machines) |
| `shaft` | `chase` | `core` |

These keep their kind: `bath`, `walk`, `lot`, `court`, `planter`, `canopy`,
`stair`, `yard`, `alley`, `street`, `road`, `roof`. The plan-level `style`
is `motel`. `extras.finish` keys that name a room kind must use the new
names too, and so must the W2b mesher's FLOOR_KIND and WALL_KIND tables.

### 1.4 Sidecar room-kind mapping (W2 compiler)

The `.layout.json` kinds are coarse (`exterior`, `service`, `lounge`,
`circulation`), so the compiler maps each **room id**. The columns are the
plan-level style, then the canonical kind and its sidecar room ids, then any
per-room style overrides.

| Level (sidecar) | Style | Canonical kind ← sidecar room ids | Style overrides |
|---|---|---|---|
| arcade | commercial | `alley` ← alley, walk_w, walk_e · `street` ← side · `road` ← street · `secure` ← count · `workshop` ← shop · `lounge` ← poker · `circulation` ← back · `bath` ← wc · `plant` ← elec · `assembly` ← hall, annex | — |
| club | deco | `alley` ← alley · `street` ← side, front · `road` ← street · `kitchen` ← kitchen · `store` ← stores · `circulation` ← back_hall · `secure` ← office · `bath` ← vip_wc, wc_m, wc_f · `lounge` ← vip · `assembly` ← hall · `control` ← staff · `reception` ← foyer · `closet` ← coat | kitchen, stores, back_hall, staff → `commercial` |
| mall | commercial | `yard` ← dock · `court` ← plaza · `lot` ← lot · `circulation` ← svc, svc_sw, svc_se, mall_w, mall_e, entry · `retail` ← records, shoes, jewel, anchor, toys, photo, florist, electronics · `kitchen` ← fc1, fc2, fc3, fc4 · `control` ← security · `bath` ← wc · `assembly` ← court | — |
| marina | marine | `pier` ← quay, fa0–fa4, pierb, fuel, fb1–fb3 · `walk` ← walk_w · `retail` ← store · `office` ← dockmaster, shed_off · `circulation` ← hall_o · `bath` ← wc_m, wc_f · `store` ← stores_o · `secure` ← count · `yard` ← yard · `lot` ← lot · `special` ← shed · `workshop` ← shed_shop · `alley` ← alley | lot, alley, shed, shed_shop, shed_off → `commercial` |
| penthouse | high_end | `bedroom` ← staff, ga_bed, gb_bed, m_bed · `utility` ← laundry · `store` ← pantry, wine · `kitchen` ← kitchen · `circulation` ← svc_hall, stair_b_lobby, gal_w, gal_s, gal_e, vest, foyer, m_ante · `dining` ← breakfast, dining · `stair` ← stair_a, stair_b · `core` ← svc_lift, shaft_1–shaft_4, lift_p1, lift_p2 · `bath` ← ga_bath, gb_bath, powder, m_bath · `closet` ← ga_pass, gb_pass, m_dress · `living` ← den, great · `secure` ← panic · `office` ← study · `terrace` ← ter_e, ter_s | staff, laundry, svc_hall → `commercial` |
| studio | commercial | `yard` ← yard · `alley` ← drive · `lot` ← lot · `studio` ← live_a, live_b, booth_a, booth_b, iso_a · `control` ← ctrl_a, ctrl_b, midi, copy · `circulation` ← lock_a, lock_b, hall · `plant` ← mach · `store` ← gear · `workshop` ← tech · `bath` ← wc · `kitchen` ← kitchen · `lounge` ← lounge, lounge_b · `secure` ← vault · `office` ← office, mgr · `reception` ← reception | lounge_b → `high_end` |
| yacht | marine | `terrace` ← aft · `special` ← swim, fore, bridge · `walk` ← side_p, side_s · `bedroom` ← master · `closet` ← m_dress · `bath` ← m_bath · `office` ← study · `circulation` ← lobby, crew_stair · `assembly` ← ballroom · `dining` ← dining · `kitchen` ← galley · `staff` ← mess | master, m_dress, m_bath, study, ballroom, dining, lobby → `high_end` |

Notes:
- Motel Sunset has no sidecar; §1.3 covers it.
- The sidecar kind of yacht `m_dress` is `bedroom`; the canonical kind is
  `closet`.
- The sidecar kind of yacht `ballroom` is `lounge`; the canonical kind is
  `assembly`, because it holds a dance floor and a bar.
- Studio `drive` is a vehicle drive, so it is an `alley`, not a `walk`.
- The marina `shed` is `special` because its dry-stack racks are structure
  that the plan authors (brief §8).

## 2. Item spec

The columns:
- **Size** is w × d × h in metres.
- **Solid** gives the build and cov for an item that becomes a WORLD prop
  (§5). `vis` marks a visual-only item.
- **Clear** is the depth that must stay free in front of the item's face (§4).
- **Style** lists the variants that use the item. `all` means all of them.

Dimensions are nominal US trade sizes of the period: mattresses from
[Bed size](https://en.wikipedia.org/wiki/Bed_size) (US twin 39×75″, full
54×75″, queen 60×80″, king 76×80″). Counters, desks and tables follow
standard heights (counter 36″ ≈ 0.9 m, desk and table 29–30″ ≈ 0.75 m, bar
42″ ≈ 1.07 m). Machines use measured cabinet sizes where noted. Everything
else is P (proposed from typical products) and is fine to vary by ±10 %.

### 2.1 Bedroom, living, dining

| id | Item | Size | Host | Facing | Solid | Clear | Style | Note |
|---|---|---|---|---|---|---|---|---|
| `bed_twin` | Twin bed | 0.99 × 1.91 × 0.55 | wall (head) | out | `mattress` / waist | 0.6 side, 0.9 foot | all | staff rooms, crew, 2-up motel |
| `bed_double` | Double (full) bed | 1.37 × 1.91 × 0.55 | wall (head) | out | `mattress` / waist | 0.6 side, 0.9 foot | motel, commercial | motel "two doubles" |
| `bed_queen` | Queen bed | 1.52 × 2.03 × 0.55 | wall (head) | out | `mattress` / waist | 0.6 side, 0.9 foot | motel, high_end, marine | |
| `bed_king_platform` | King bed on a lacquer platform | 2.15 × 2.25 × 0.45 | wall (head) | out | `mattress` / waist | 0.75 side, 0.9 foot | high_end | penthouse, yacht owner |
| `mattress_floor` | Mattress on the floor | 1.37 × 1.91 × 0.2 | scatter | any | vis | — | all | motel crew rooms (f2) |
| `nightstand` | Nightstand | 0.5 × 0.4 × 0.6 | wall | out | vis | — | all | beside the bed head |
| `dresser` | Dresser, 6 drawers | 1.5 × 0.5 × 0.8 | wall | out | `counter_cabinet` / waist | 0.9 | all | the motel TV sits on it |
| `wardrobe` | Wardrobe, freestanding | 1.2 × 0.6 × 2.0 | wall | out | `counter_cabinet` / full | 0.9 | motel, commercial, marine | |
| `wardrobe_mirror` | Built-in mirrored sliding wardrobe | 2.4 × 0.65 × 2.4 | wall | out | `counter_cabinet` / full | 0.9 | high_end | the mirror face is visual |
| `luggage_rack` | Folding luggage rack | 0.65 × 0.45 × 0.5 | wall | out | vis | — | motel, high_end | |
| `bench_bed_end` | Upholstered bench at the bed foot | 1.3 × 0.45 × 0.45 | free | pair (bed) | vis | — | high_end | |
| `ac_sleeve` | Through-wall AC unit | 0.66 × 0.3 × 0.4 | wallMount, y 0.55 | out | vis | 0.6 | motel, commercial | exterior wall, below the window |
| `sofa_3` | Three-seat sofa | 2.1 × 0.9 × 0.8 | wall or free | pair (TV/table) | `sofa` / waist | 0.45 to the coffee table | all | |
| `sofa_sectional` | White leather L sectional | 3.0 × 2.4 × 0.7 (0.95-deep legs) | free | pair | `sofa` / waist (poly) | 0.45 | high_end | |
| `banquette` | Built-in banquette / booth seat | 1.5 × 0.6 × 1.1 | wall or free | table | `sofa` / waist | 0.45 | deco, high_end, commercial | booths pair two |
| `armchair` | Armchair / club chair | 0.85 × 0.85 × 0.8 | free | pair | `sofa` / waist | 0.45 | all | |
| `coffee_table` | Glass-and-chrome coffee table | 1.2 × 0.6 × 0.4 | free | pair (sofa) | `counter_cabinet` / waist | — | high_end, motel (laminate) | |
| `side_table` | Side or end table | 0.5 × 0.5 × 0.55 | free | any | vis | — | all | |
| `console_table` | Console table | 1.2 × 0.4 × 0.8 | wall | out | `counter_cabinet` / waist | 0.6 | high_end | vestibule, foyer |
| `tv_console` | Console CRT TV in a wood cabinet (F1) | 1.0 × 0.5 × 0.8 | wall | pair (sofa) | `counter_cabinet` / waist | 2.4–3.5 to the sofa | motel, high_end | |
| `tv_crt` | 19–26″ CRT TV | 0.6 × 0.5 × 0.5 | top (dresser, tv stand, bar) | pair | vis | — | all | |
| `vcr` | VCR | 0.43 × 0.35 × 0.1 | top (tv_console) | out | vis | — | all | |
| `rack_stereo` | Rack stereo: turntable, cassette deck, amp (F1) | 0.5 × 0.45 × 1.2 | wall | out | vis | 0.6 | high_end, commercial | |
| `bookcase` | Bookcase | 0.9 × 0.35 × 2.0 | wall | out | `counter_cabinet` / full | 0.6 | high_end, commercial | |
| `piano_grand` | Baby grand piano | 1.5 × 1.6 × 1.0 | free | any | `counter_cabinet` / waist | 0.9 at the keyboard | high_end, studio | the cast-iron frame is §7 Q1 |
| `drinks_trolley` | Drinks trolley | 0.8 × 0.45 × 0.8 | free | any | vis | — | high_end | |
| `lamp_floor_arc` | Arco-style floor lamp | 0.4 base, 1.8 reach × 2.0 | free | pair (sofa) | vis | — | high_end | the marble base is visual |
| `palm_pot` | Palm in a brass or ceramic pot | 0.6 × 0.6 × 1.8 | corner or free | any | vis | — | high_end, deco, commercial | |
| `dining_table_4` | Dinette / breakfast table, round 1.0 m | 1.0 × 1.0 × 0.75 | free | — | `counter_cabinet` / waist | 0.75 pull-back | all | |
| `dining_table_8` | Lacquered dining table, 8 seats | 2.4 × 1.1 × 0.75 | free | — | `counter_cabinet` / waist | 0.9 pull-back | high_end | |
| `dining_table_12` | Saloon table, 12 seats | 3.6 × 1.2 × 0.75 | free | — | `counter_cabinet` / waist | 0.9 pull-back | high_end, marine | yacht dining |
| `dining_chair` | Dining chair | 0.45 × 0.5 × 0.9 | free | table | vis | — | all | 0.6 m pitch |
| `sideboard` | Sideboard or glassware cabinet | 1.8 × 0.5 × 0.85 | wall | out | `counter_cabinet` / waist | 0.9 | high_end, deco | |

### 2.2 Kitchen, bath, utility

| id | Item | Size | Host | Facing | Solid | Clear | Style | Note |
|---|---|---|---|---|---|---|---|---|
| `counter_run` | Base cabinets and laminate top, per metre | 1.0 × 0.6 × 0.9 | wall | out | `counter_cabinet` / waist | 1.0 (1.2 between runs) | all | chains along the wall; stainless and fiddle rail in marine |
| `island` | Kitchen island | 1.8 × 0.9 × 0.9 | free | any | `counter_cabinet` / waist | 1.0 all round | high_end | |
| `fridge` | Refrigerator, almond or white | 0.8 × 0.75 × 1.75 | wall (in the run) | out | `car_door` / full | 1.0 | all | |
| `range` | Range, 30″ | 0.76 × 0.65 × 0.9 | wall (in the run) | out | `car_door` / waist | 1.0 | all | |
| `range_commercial` | Commercial range and hood | 1.5 × 0.8 × 0.9 (hood 2.0–2.4) | wall | out | `steel_3mm` / waist | 1.2 | commercial, deco, marine | the hood is ceiling and visual |
| `prep_table` | Stainless prep table | 1.8 × 0.75 × 0.9 | wall or free | any | `car_door` / waist | 1.0 | commercial | |
| `hotplate_2` | Two-burner hot plate | 0.5 × 0.3 × 0.1 | top (counter, folding table) | out | vis | — | motel | kitchenette, cook rooms |
| `microwave` | Countertop microwave (F1) | 0.5 × 0.38 × 0.3 | top (counter) | out | vis | — | all | |
| `wall_phone` | Wall phone with a long cord (F1) | 0.1 × 0.08 × 0.22 | wallMount, y 1.4 | out | vis | — | all | |
| `wc` | Toilet | 0.4 × 0.7 × 0.75 | wall | out | vis | 0.6 front, 0.4 to the side of the centreline | all | |
| `urinal` | Urinal | 0.4 × 0.35 × 0.6 | wallMount, y 0.6 | out | vis | 0.6 | commercial, deco | |
| `basin_pedestal` | Pedestal basin | 0.55 × 0.45 × 0.85 | wall | out | vis | 0.6 | motel | |
| `vanity` | Vanity, single / double | 0.9 or 1.8 × 0.55 × 0.85 | wall | out | `counter_cabinet` / waist | 0.75 | all | |
| `tub` | Enamelled steel tub in an alcove | 1.52 × 0.76 × 0.5 | wall (3 sides) | out | `steel_3mm` / waist | 0.75 | all | sunken tubs are plan `ground`, not a prop |
| `shower_stall` | Shower stall with a glass door | 0.9 × 0.9 × 2.0 | corner | out | vis | 0.75 | all | |
| `mirror_cabinet` | Mirror or mirror cabinet | 0.6 × 0.12 × 0.75 | wallMount, y 1.5 | out | vis | — | all | above the basin |
| `towel_rail` | Towel rail | 0.6 × 0.1 × 0.1 | wallMount, y 1.2 | out | vis | — | all | |
| `stall_partition` | Toilet stall partition | path × 0.03 × 1.8 | — | — | plan `walls`, `particle_divider` / chest | — | commercial, deco | author as a plan wall, not a prop |
| `washer` / `dryer` | Front-loading washer or dryer | 0.69 × 0.7 × 0.9 | wall | out | `car_door` / waist | 1.0 | all | pairs |
| `folding_table` | Folding table | 1.8 × 0.75 × 0.75 | free or wall | any | `counter_cabinet` / waist | 0.6 | all | laundry, cook room, count room |
| `shelving_steel` | Steel shelving unit, loaded | 1.2 × 0.45 × 2.0 | wall | out | `steel_3mm` / full | 0.9 | all | storerooms, tape vault, panic room |
| `linen_cart` | Linen or housekeeping cart | 1.0 × 0.55 × 1.0 | wall or free | any | vis | — | motel, high_end, commercial | |
| `mop_bucket` | Mop bucket and wringer | 0.45 × 0.35 × 0.6 | scatter | any | vis | — | all | |
| `mop_sink` | Mop sink | 0.6 × 0.6 × 0.3 | corner | out | vis | 0.6 | commercial | |
| `workbench` | Workbench | 1.8 × 0.75 × 0.9 | wall | out | `counter_cabinet` / waist | 1.0 | all | |
| `tool_board` | Pegboard tool board | 1.2 × 0.05 × 0.9 | wallMount, y 1.5 | out | vis | — | all | above the workbench |
| `switchboard` | Main switchboard | 2.4 × 0.6 × 2.1 | wall | out | `steel_3mm` / full | 1.0 (code working space) | commercial | arcade elec |
| `fuse_board` | Fuse or breaker panel | 0.5 × 0.15 × 0.8 | wallMount, y 1.5 | out | vis | 0.9 | all | |

### 2.3 Office, control, studio, secure

| id | Item | Size | Host | Facing | Solid | Clear | Style | Note |
|---|---|---|---|---|---|---|---|---|
| `desk_office` | Steel or laminate office desk | 1.5 × 0.75 × 0.75 | wall or free | out / path | `counter_cabinet` / waist | 0.9 chair zone | commercial, motel | |
| `desk_exec` | Executive desk, lacquer or rosewood | 2.0 × 0.9 × 0.76 | free | path (door) | `counter_cabinet` / waist | 1.0 chair zone | high_end | the study, producer's office |
| `office_chair` | Swivel office chair | 0.6 × 0.6 × 1.0 | free | pair (desk) | vis | — | all | |
| `visitor_chair` | Visitor chair | 0.55 × 0.55 × 0.85 | free | pair (desk) | vis | — | all | two in front of the desk |
| `filing_cabinet` | Four-drawer filing cabinet | 0.4 × 0.7 × 1.33 | wall | out | `car_door` / chest | 0.9 (drawer pull) | commercial, motel, marine | |
| `safe` | Floor safe | 0.7 × 0.7 × 1.7 | wall or corner | out | `steel_10mm` / full | 0.9 | all | plans/motel.js precedent |
| `safe_small` | Under-desk safe | 0.5 × 0.5 × 0.6 | wall | out | `steel_10mm` / waist | 0.6 | all | |
| `count_table` | Count table | 2.0 × 0.9 × 0.9 | free | any | `counter_cabinet` / waist | 0.9 | commercial | sits under the money-counter stack |
| `money_counter` | Banknote counter | 0.3 × 0.3 × 0.25 | top (count_table) | any | vis | — | commercial | |
| `typewriter` | IBM Selectric-type typewriter | 0.48 × 0.4 × 0.2 | top (desk) | out | vis | — | all | |
| `computer_8bit` | Home or office micro with a monitor (F1) | 0.5 × 0.45 × 0.4 | top (desk) | out | vis | — | commercial, high_end | |
| `cctv_bank` | Monitor bank: 4–9 CRTs in a 19″ rack | 1.5 × 0.6 × 1.8 | wall | out | `steel_3mm` / full | 1.0 operator | commercial, deco | club security, mall security |
| `rack_19` | 19″ equipment rack (tape, outboard, comms) | 0.6 × 0.8 × 1.8 | wall | out | `steel_3mm` / full | 0.9 | commercial | |
| `console_desk` | Large-format mixing console (SSL/Neve class) | 2.6 × 1.1 × 0.95 | free (aimed at the glass) | out → studio | `counter_cabinet` / waist | 1.0 operator, 1.0 behind | commercial | studio control rooms |
| `producer_desk` | Producer's desk behind the console | 2.4 × 0.7 × 0.75 | free | out → glass | `counter_cabinet` / waist | 0.9 | commercial | |
| `tape_machine` | 24-track 2″ tape machine | 0.9 × 0.8 × 1.1 | wall or free | out | `steel_3mm` / waist | 1.0 | commercial | |
| `monitor_soffit` | Soffit-mounted main monitors | 1.0 × 0.6 × 0.8 | wallMount, y 2.0 | out | vis | — | commercial | the glass wall's side |
| `mic_stand` | Mic stand with a boom | 0.6 × 0.6 × 1.8 | free | any | vis | — | commercial | live rooms, booths |
| `gobo` | Acoustic gobo panel | 1.2 × 0.15 × 1.8 | free | any | vis | — | commercial | its build is §7 Q2 |
| `drum_kit` | Drum kit on a riser | 2.0 × 1.8 × 1.2 | free | any | vis | — | commercial | |
| `amp_stack` | Guitar amp half stack | 0.75 × 0.4 × 1.3 | wall or free | out | `counter_cabinet` / chest | — | commercial | |
| `tape_shelving` | Tape-library shelving | 1.2 × 0.45 × 2.1 | wall | out | `steel_3mm` / full | 0.9 | commercial | the tape vault; densely packed reels |

### 2.4 Commercial, arcade, bar, retail

| id | Item | Size | Host | Facing | Solid | Clear | Style | Note |
|---|---|---|---|---|---|---|---|---|
| `arcade_upright` | Upright video cabinet | 0.64 × 0.88 × 1.73 | wall (in a row) | out | `counter_cabinet` / full | 1.2 player zone | commercial | rows of 5–10, 0.05 m gap |
| `arcade_cocktail` | Cocktail-table cabinet | 0.56 × 0.81 × 0.74 | free | any | `counter_cabinet` / waist | 0.6 both ends | commercial | |
| `arcade_driver` | Sit-down driving cabinet | 0.9 × 1.7 × 1.8 | wall | out | `counter_cabinet` / full | 0.9 | commercial | |
| `pinball` | Pinball machine | 0.74 × 1.4 × 1.9 (playfield 0.95) | wall (in a row) | out | `counter_cabinet` / waist | 1.0 player zone | commercial | treat the backbox as visual |
| `change_machine` | Coin changer | 0.55 × 0.5 × 1.5 | wall | out | `steel_3mm` / chest | 0.9 | commercial | |
| `pool_table` | Pool table, 7 ft | 2.0 × 1.15 × 0.8 | free | any | `counter_cabinet` / waist | 1.5 cue zone all round | commercial, deco | the slate is §7 Q1 |
| `poker_table` | Oval poker table | 2.4 × 1.2 × 0.76 | free | — | `counter_cabinet` / waist | 0.9 pull-back | commercial, deco | |
| `bar_counter` | Bar die and top, per metre | 1.0 × 0.65 × 1.07 | wall-parallel or free | out → customers | `counter_cmu` / waist; deco variant `glass_block` / waist | 0.9 stool zone and 0.9 passage; back bar 0.9 | deco, commercial, high_end | |
| `back_bar` | Back bar with mirrors and shelves | 1.0 × 0.5 × 0.9 (mirror to 2.4) | wall | out | `counter_cabinet` / waist | 0.9 behind the bar | deco, high_end | |
| `bar_stool` | Chrome bar stool | 0.4 × 0.4 × 0.75 | free | pair (bar) | vis | — | deco, commercial | 0.6 m pitch |
| `cocktail_table` | Round cocktail table and two chairs | 0.6 × 0.6 × 0.75 (1.5 m group) | free | any | vis | — | deco, high_end | |
| `dj_booth` | DJ booth: turntables and mixer on a riser | 2.4 × 1.2 × 1.1 | — | — | plan-authored | — | deco | `special`; brief §8 |
| `speaker_stack` | PA speaker stack | 0.8 × 0.6 × 1.8 | free or corner | out → floor | `counter_cabinet` / full | — | deco | |
| `cigarette_machine` | Cigarette machine | 0.75 × 0.55 × 1.6 | wall | out | `steel_3mm` / full | 0.9 | deco, commercial | |
| `vending_cola` | Cola or ice machine | 0.8 × 0.7 × 1.5 | wall | out | `steel_3mm` / chest | 0.9 | all | plans/motel.js precedent |
| `jukebox` | Jukebox | 0.95 × 0.65 × 1.5 | wall | out | `counter_cabinet` / chest | 0.9 | deco, commercial | |
| `reception_desk` | Reception or cashier counter | 2.4 × 0.7 × 1.07 (desk 0.75 behind) | free or wall-parallel | out → door | `counter_cabinet` / waist | 1.0 front, 0.9 behind | all | motel lobby, studio, club foyer |
| `bell_ledge` | Lobby ledge with a bell and brochure rack | 1.2 × 0.3 × 1.07 | wall | out | vis | — | motel | |
| `retail_gondola` | Double-sided gondola shelving | 1.2 × 0.9 × 1.5 | free (in rows) | aisle | `steel_3mm` / chest | 1.2 aisle | commercial | |
| `wall_shelving_retail` | Wall shelving | 1.2 × 0.4 × 2.1 | wall | out | `steel_3mm` / full | 1.2 | commercial | |
| `display_case` | Glass display counter | 1.5 × 0.6 × 0.95 | free or wall | out → customers | `glass_tempered_6` (top) / waist | 1.0 front | commercial, high_end | jewel; it breaks; §7 Q3 |
| `cash_wrap` | Cash wrap counter | 1.8 × 0.75 × 1.0 | free | out → door | `counter_cabinet` / waist | 1.0 front, 0.9 behind | commercial | |
| `record_bin` | LP browser bin | 1.2 × 0.75 × 0.9 | free (in rows) | aisle | `counter_cabinet` / waist | 1.0 aisle | commercial | |
| `clothes_rail` | Clothes rail / round rack | 1.2 × 0.6 × 1.4 | free | any | vis | 0.9 | commercial | |
| `shoe_bench` | Fitting bench | 1.5 × 0.45 × 0.45 | free | any | vis | — | commercial | |
| `flower_bucket_stand` | Stepped flower-bucket stand | 1.5 × 0.6 × 1.0 | wall | out | vis | 0.9 | commercial | |
| `food_counter` | Food-court counter with a sneeze guard | 1.0 × 0.7 × 1.07 per m | wall-parallel | out → court | `counter_cabinet` / waist | 1.2 queue | commercial | |
| `fc_table` | Food-court table, 48″ round, with four fixed seats | 1.22 dia × 0.75 (2.2 m group) | free | — | vis | 0.9 between groups | commercial | the W4 backlog had these oversized; use this size |
| `bench_mall` | Mall bench | 1.8 × 0.5 × 0.45 | free | path | vis | — | commercial | |
| `planter_mall` | Raised mall planter | 1.5 × 1.5 × 0.6 | free | — | `brick_1w` / waist | 1.2 all round | commercial | |

### 2.5 Store, yard, exterior, marine

| id | Item | Size | Host | Facing | Solid | Clear | Style | Note |
|---|---|---|---|---|---|---|---|---|
| `crate_stack` | Wooden crates, stacked | 1.2 × 1.0 × 1.3 | wall or free | any | `counter_cabinet` / chest | 1.2 from doors | all | never in a door swing (W4 backlog) |
| `pallet_racking` | Pallet racking bay, loaded | 2.7 × 1.1 × 3.0 | wall (in a row) | aisle | `steel_3mm` / full | 2.4 aisle | commercial | mall dock, marina stores |
| `pallet` | Pallet with a load | 1.2 × 1.0 × 0.9 | scatter | any | `counter_cabinet` / waist | — | commercial, marine | |
| `drum_55` | 55-gallon steel drum | 0.6 dia × 0.9 | free or scatter | any | `steel_3mm` / waist | — | all | designated cover |
| `dumpster` | Front-load dumpster | 1.8 × 1.1 × 1.3 | wall | street / alley | `steel_3mm` / chest | 1.2 front | all | plans/motel.js precedent |
| `trash_can` | Galvanised trash can | 0.55 dia × 0.75 | scatter | any | vis | — | all | |
| `hand_truck` | Hand truck or pallet jack | 0.5 × 0.6 × 1.2 | scatter | any | vis | — | commercial | |
| `car_parked` | Parked car, 1980s sedan | 1.85 × 4.9 × 1.4 | free (in a stall) | stall | body `car_door` + `car_engine` block / chest | 0.9 at the doors | all | plans/motel.js precedent; 2.7 × 5.5 stall |
| `van_parked` | Panel van | 2.0 × 5.0 × 2.0 | free | stall | body `car_door` + `car_engine` block / full | 0.9 | commercial | the dock, the studio yard |
| `lounger` | Pool lounger | 0.7 × 1.9 × 0.4 | free | court / sun | `mattress` / waist | 0.6 | motel, high_end, marine | plans/motel.js precedent |
| `patio_set` | Patio table, umbrella and four chairs | 1.0 dia × 0.75 (2.4 m group; umbrella 2.4 dia, h 2.3) | free | — | vis | 0.9 | all | |
| `palm_ground` | Palm in the ground or a planter | 0.4 trunk, 3 m crown × 4.0 | free (planter, court) | — | `timber_pile` / full (trunk only) | — | all exterior | |
| `planter_box` | Built planter | 1.2 × 0.6 × 0.6 | wall or free | — | `brick_1w` / waist | — | all exterior | |
| `light_pole` | Lot light pole | 0.25 dia × 6.0 | free | — | vis | — | all exterior | |
| `newspaper_box` | Newspaper vending box | 0.5 × 0.45 × 1.1 | street edge | street | vis | — | commercial, deco | |
| `payphone` | Payphone on a post or wall | 0.35 × 0.3 × 1.9 | wallMount or free | street | vis | — | all | |
| `bus_bench` | Bus bench with an advert back | 1.8 × 0.6 × 1.0 | street edge | street | vis | — | all | |
| `fire_hydrant` | Fire hydrant | 0.3 dia × 0.7 | street edge | street | vis | — | all | |
| `dock_box` | Dock box | 1.5 × 0.65 × 0.75 | pier edge | pier | `dock_box` / waist | — | marine | per the marina brief |
| `bollard_cleat` | Cleat or bollard | 0.3 × 0.15 × 0.2–0.5 | pier edge | — | vis | — | marine | |
| `pedestal_power` | Shore-power and water pedestal | 0.3 × 0.3 × 1.1 | pier edge | pier | vis | — | marine | one per two slips |
| `fuel_pump_marine` | Marine fuel pump | 0.6 × 0.5 × 1.5 | — | — | plan-authored | — | marine | marina brief §8 |
| `life_ring` | Life ring | 0.75 dia × 0.1 | wallMount, y 1.5 | out | vis | — | marine | |
| `rope_coil` | Coiled line | 0.5 dia × 0.15 | scatter | any | vis | — | marine | |
| `boat_trailer` | Boat on a trailer | 2.5 × 7.0 × 2.5 | free | — | hull `grp_hull` / full | 0.9 | marine, commercial | yard; plan-authored if it is cover |
| `deck_chair_marine` | Teak deck chair | 0.6 × 0.7 × 0.85 | free (fixed in marine) | any | vis | — | marine | |
| `outboard_stand` | Outboard engine on a stand | 0.6 × 0.9 × 1.4 | free | any | `steel_3mm` / chest | 0.9 | marine | the workshop |

### 2.6 Wall art, wall-mount, ceiling, tabletop, scatter (all visual)

Everything in this section is `vis`. These items never collide, never stop
rays and never block nav.

| id | Item | Size | Host | Style | Note |
|---|---|---|---|---|---|
| `art_print` | Framed print: seascape, flamingo or palm | 0.6 × 0.03 × 0.45 | wallMount, y 1.5 | motel, commercial | one above each motel bed |
| `art_canvas` | Large abstract canvas | 1.5 × 0.04 × 1.2 | wallMount, y 1.55 | high_end | Nagel-style or colour-field |
| `art_poster` | Framed band, film or gig poster | 0.6 × 0.02 × 0.9 | wallMount, y 1.5 | commercial, deco | studio corridors |
| `gold_disc` | Framed gold or platinum disc | 0.4 × 0.03 × 0.5 | wallMount, y 1.5 | commercial | studio, in a row of 3–8 |
| `mirror_wall` | Mirror panel | 1.2 × 0.01 × 2.0 | wallMount, y 1.2 | high_end, deco | does not reflect (renderer) |
| `neon_sign` | Neon sign or tube | 1.2 × 0.1 × 0.5 | wallMount, y 2.1 | deco, commercial | emissive |
| `clock_wall` | Wall clock | 0.3 dia | wallMount, y 2.0 | commercial, motel | |
| `calendar_pinup` | Calendar or pin-up | 0.3 × 0.01 × 0.45 | wallMount, y 1.5 | commercial | workshop, office, mess |
| `sign_exit` | Lit EXIT sign | 0.35 × 0.1 × 0.2 | wallMount, y 2.2 (above the door) | commercial, deco | public doors only |
| `noticeboard` | Cork noticeboard | 0.9 × 0.03 × 0.6 | wallMount, y 1.5 | commercial | |
| `fire_ext` | Fire extinguisher | 0.2 × 0.15 × 0.55 | wallMount, y 1.1 | all | 1 per corridor run |
| `chart_nautical` | Framed nautical chart | 0.9 × 0.03 × 0.6 | wallMount, y 1.5 | marine | |
| `porthole` | Porthole | 0.4 dia | wallMount, y 1.5 | marine | hull walls only |
| `fluoro_troffer` | 2×4 fluorescent troffer | 0.6 × 1.2 × 0.1 | ceiling | commercial | on a 2.4–3.6 m grid |
| `ceiling_fan` | Ceiling fan | 1.3 dia × 0.4 | ceiling, y 2.3 | motel, high_end | |
| `chandelier` | Crystal or brass chandelier | 0.9 dia × 0.9 | ceiling, y ≥ 2.1 | high_end | over the dining table |
| `track_light` | Track light | 1.5 × 0.1 × 0.15 | ceiling | high_end, commercial | |
| `mirror_ball` | Mirror ball | 0.5 dia | ceiling | deco | over the dance floor |
| `light_rig` | Lighting truss with cans | 3.0 × 0.3 × 0.3 | ceiling | deco | |
| `smoke_detector` | Smoke detector | 0.15 dia | ceiling | all | |
| `ashtray` | Ashtray | 0.15 dia | top (table, bar, desk) | all | |
| `phone_desk` | Desk phone | 0.22 × 0.22 × 0.1 | top (desk, nightstand) | all | |
| `lamp_table` | Table lamp | 0.35 dia × 0.6 | top (nightstand, side table, desk) | all | |
| `glasses_bottles` | Glasses and bottles | 0.4 × 0.2 × 0.3 | top (bar, back bar, table) | deco, high_end | |
| `cash_register` | Cash register | 0.4 × 0.45 × 0.3 | top (counter, cash wrap, bar) | commercial, deco | |
| `paperwork` | Paper stack, ledger, files | 0.3 × 0.25 × 0.05 | top (desk, table) | commercial | |
| `money_stacks` | Banded cash | 0.4 × 0.3 × 0.15 | top (count table, safe) | — | mission props are plan-authored |
| `magazine_pile` | Magazines | 0.3 × 0.25 × 0.05 | top or scatter | all | |
| `rug` | Rug or shag carpet | 2.4 × 1.7 × 0.01 | scatter (under a group) | high_end, motel | centred under the sofa or bed group |
| `bags_luggage` | Suitcase or holdall | 0.7 × 0.25 × 0.5 | scatter | all | |
| `boxes_cardboard` | Cardboard boxes | 0.5 × 0.4 × 0.4 | scatter | commercial | stores, dock, back halls |
| `litter` | Litter, cans, newspaper | 0.3 × 0.3 × 0.02 | scatter | exterior | alleys and lots only |
| `cone_wet` | Wet-floor sign | 0.3 × 0.3 × 0.6 | scatter | commercial | |

## 3. Kits per kind

Fields:
- **Req** items always appear, provided they fit (§4).
- **Opt** items are drawn by weight until the density cap is met.
- **Groups** place together as one unit and are kept or dropped as one.
- **Solid cap** is the maximum fraction of the room's floor (m²) that solid
  props may cover. This keeps the nav and flank loops of the brief overlays
  open. Explicit plan props count toward the cap.
- **Scatter / 10 m²** is the target count of `scatter` items per 10 m² of
  floor.
- **Art** is the wall-art budget: items per metre of free wall run (wall
  without doors, windows or a wall-hosted item), plus a hard maximum.

Selection is deterministic: seed it from `levelId + roomId`, so the same plan
always dresses the same way. A room below the **min m²** for a required item
drops that item (it does not overflow).

### 3.1 Groups

| Group | Members and layout | Footprint guide |
|---|---|---|
| `G.bed` | The bed against the longest windowless wall, head on the wall; a nightstand on each side if ≥ 0.5 free, else one; a `lamp_table` on each nightstand; `art_print`/`art_canvas` above the head | bed + 0.6 sides + 0.9 foot |
| `G.sofa_tv` | A sofa facing a `tv_console` or `tv_crt` 2.4–3.5 m away; a `coffee_table` 0.45 in front of the sofa; a `rug` under it; optional armchairs at 90° | 3.5 × 4.5 |
| `G.dine` | A table, with chairs at a 0.6 pitch on all usable sides, and a 0.75–0.9 pull-back | table + 0.9 all round |
| `G.desk` | A desk facing the door or with its back to a wall; an `office_chair`; 0–2 `visitor_chair`s in front; `phone_desk`, `paperwork` and `lamp_table` on top | desk + 0.9 chair zone + 0.6 visitors |
| `G.bath` | A wet wall: `wc` + `vanity`/`basin_pedestal` + `tub` or `shower_stall`, with `mirror_cabinet` above the basin and a `towel_rail` | §4 WC clearances |
| `G.kitchen` | A `counter_run` along a wall or in an L, with the `fridge` at a run end, the `range` within the run, a `microwave` on top, and a `wall_phone` near the door | 1.0 clear in front of the run |
| `G.bar` | `bar_counter` + `back_bar` 0.9 behind + `bar_stool` at a 0.6 pitch; `glasses_bottles` and a `cash_register` on top | bar + 0.9 stool zone + 0.9 passage |
| `G.car` | `car_parked` centred in a 2.7 × 5.5 stall, nose in | per stall |
| `G.cab_row` | 4–10 `arcade_upright`/`pinball` in a row on a wall, 0.05 m apart | row + 1.2 player zone |
| `G.console` | `console_desk` aimed at the studio glass, `producer_desk` 1.0 behind, `monitor_soffit` above the glass, `rack_19` on a side wall | 4.0 × 3.5 |
| `G.count` | `count_table` + `money_counter` + 2 `office_chair`s + a `safe` on the wall | 3.0 × 2.5 |
| `G.patio` | `patio_set` | 2.4 dia |

### 3.2 Kit table

`style` cells give the per-style differences. A dash means the same as the
row's default. Weights are relative.

| Kind | Style | Req | Opt (weight) | Solid cap | Scatter / 10 m² | Art (per m, max) | min m² |
|---|---|---|---|---|---|---|---|
| `bedroom` | motel | `G.bed` (double ×1–2 by room width ≥ 3.6, else queen), `dresser` + `tv_crt` on top, `ac_sleeve` under the window | `wardrobe` 2, `luggage_rack` 2, `armchair` 1, `dining_table_4` with 2 chairs 1, `bags_luggage` 2 | 0.35 | 0.5 | 0.25, 2 | 9 |
| | high_end | `G.bed` (`bed_king_platform`), `wardrobe_mirror` | `bench_bed_end` 2, `armchair` ×2 3, `side_table` 2, `palm_pot` 2, `rug` 3, `tv_console` 1 | 0.30 | 0.3 | 0.15, 2 | 12 |
| | marine | `G.bed` (queen, fixed), `dresser` | `wardrobe` 2, `porthole` (hull wall) 3 | 0.40 | 0.2 | 0.2, 2 | 8 |
| | commercial | `G.bed` (`bed_twin` ×1–2) | `dresser` 2, `wardrobe` 1, `tv_crt` 1, `calendar_pinup` 2 | 0.35 | 0.6 | 0.2, 2 | 7 |
| `living` | motel | `G.sofa_tv` | `armchair` 2, `dining_table_4` + 2 chairs 2, `bookcase` 1, `ceiling_fan` 2 | 0.30 | 0.6 | 0.25, 3 | 12 |
| | high_end | `G.sofa_tv` with `sofa_sectional`, `rug` | `piano_grand` 1 (≥ 50 m²), `rack_stereo` 2, `lamp_floor_arc` 2, `palm_pot` 3, `drinks_trolley` 2, `console_table` 1, `bookcase` 1 | 0.25 | 0.2 | 0.12, 4 | 20 |
| `dining` | all | `G.dine` (`dining_table_4` < 14 m²; `dining_table_8` 14–30; `dining_table_12` ≥ 30) | `sideboard` 3, `chandelier` (high_end) 3, `palm_pot` 1 | 0.30 | 0.1 | 0.15, 2 | 7 |
| `kitchen` | motel, high_end, marine | `G.kitchen` | `island` (high_end, ≥ 16 m²) 3, `dining_table_4` 1 | 0.40 | 0.3 | 0.1, 1 | 5 |
| | commercial, deco | `counter_run` (stainless), `range_commercial`, `prep_table` | `fridge` ×2 2, `shelving_steel` 2, `mop_bucket` 1, `boxes_cardboard` 2 | 0.45 | 0.6 | 0.05, 1 | 6 |
| `bath` | all, private (≤ 8 m²) | `G.bath` | `towel_rail` 2, `rug` 1 | 0.20 | 0.2 | 0, 0 | 2.5 |
| | commercial, deco, public (> 8 m²) | `wc` ×N (one per 1.5 m of stall run; author the stall partitions as plan walls), `vanity` (double), `mirror_cabinet` per basin | `urinal` ×N (men's) 3, `cone_wet` 1 | 0.20 | 0.2 | 0, 0 | 8 |
| `closet` | all | `wardrobe` or `wardrobe_mirror` on the longest wall | `dresser` 2, `bags_luggage` 2, `shelving_steel` (coat check) 2 | 0.45 | 0.4 | 0.1, 1 | 2 |
| `reception` | all | `reception_desk` facing the main door | `G.sofa_tv` without the TV (seating) 2, `palm_pot` 2, `bell_ledge` (motel) 2, `cigarette_machine` 1, `vending_cola` (motel) 1 | 0.25 | 0.3 | 0.15, 3 | 8 |
| `lounge` | deco, high_end | `banquette` ×2 + `coffee_table` | `G.bar` (≥ 25 m²) 2, `cocktail_table` 3, `palm_pot` 2, `poker_table` 1 | 0.30 | 0.2 | 0.15, 3 | 12 |
| | commercial | `sofa_3` + `coffee_table` | `armchair` 2, `vending_cola` 2, `tv_crt` 1, `gold_disc` (studio) 3, `poker_table` (arcade) 3 | 0.30 | 0.4 | 0.2, 4 | 10 |
| `assembly` | deco (club hall) | `G.bar` (if no explicit bar), `speaker_stack` ×2 | `cocktail_table` 3, `banquette` (perimeter) 2, `mirror_ball` 3, `light_rig` 2 | 0.20 | 0.2 | 0.1, 4 | 60 |
| | commercial (arcade) | `G.cab_row` along every free wall | `arcade_cocktail` 2, `pool_table` 1, `change_machine` 2, `pinball` 2, `fluoro_troffer` | 0.30 | 0.2 | 0.1, 4 | 40 |
| | commercial (food court) | `fc_table` groups on a 3.2 m grid | `bench_mall` 1, `trash_can` 3, `planter_mall` 1 | 0.10 | 0.3 | 0, 0 | 60 |
| | high_end (ballroom) | `G.bar`, `banquette` (perimeter) | `cocktail_table` 3, `piano_grand` 2, `chandelier` 3 | 0.20 | 0.1 | 0.1, 4 | 40 |
| `retail` | commercial | `cash_wrap` facing the door, plus a stock fixture: records `record_bin`; shoes `wall_shelving_retail` + `shoe_bench`; jewel `display_case`; toys/electronics/anchor `retail_gondola` rows + `wall_shelving_retail`; photo `display_case` + `wall_shelving_retail`; florist `flower_bucket_stand`; marine store `retail_gondola` | `clothes_rail` (anchor) 3, `palm_pot` 1, `boxes_cardboard` 1 | 0.35 | 0.3 | 0.1, 3 | 15 |
| `office` | commercial, motel, marine | `G.desk` | `filing_cabinet` 3, `safe_small` 1, `bookcase` 1, `chart_nautical` (marine) 2, `noticeboard` 2 | 0.30 | 0.4 | 0.2, 3 | 5 |
| | high_end | `G.desk` with `desk_exec` | `bookcase` ×2 3, `armchair` ×2 2, `drinks_trolley` 1, `art_canvas` 3 | 0.25 | 0.2 | 0.15, 3 | 10 |
| `secure` | all | `safe` | `G.count` (count rooms) 3, `shelving_steel` 3, `filing_cabinet` 1, `tape_shelving` (studio vault) 3 | 0.40 | 0.2 | 0, 0 | 3 |
| `control` | commercial | studio: `G.console`; security: `cctv_bank` + `desk_office`; programming/copy: `desk_office` + `rack_19` | `tape_machine` 3, `rack_19` 2, `office_chair` 2 | 0.40 | 0.3 | 0.1, 2 | 6 |
| `studio` | commercial | `mic_stand` ×1–3 | `drum_kit` (≥ 30 m²) 2, `piano_grand` (≥ 40 m²) 1, `amp_stack` 2, `gobo` 2 | 0.25 | 0.3 | 0, 0 | 3 |
| `workshop` | all | `workbench` + `tool_board` | `shelving_steel` 3, `drum_55` 2, `outboard_stand` (marine) 2, `crate_stack` 1, `calendar_pinup` 2 | 0.40 | 0.8 | 0.1, 2 | 6 |
| `staff` | all | `dining_table_4` + 4 chairs | `vending_cola` 2, `counter_run` 2, `sofa_3` 1, `tv_crt` 1, `noticeboard` 2 | 0.30 | 0.5 | 0.15, 3 | 6 |
| `utility` | all | laundry: `washer` + `dryer` ×1–3 pairs, `folding_table`; housekeeping: `shelving_steel`, `linen_cart` | `mop_sink` 2, `mop_bucket` 2 | 0.45 | 0.6 | 0, 0 | 4 |
| `store` | all | `shelving_steel` on every long wall | `crate_stack` 2, `pallet` (≥ 20 m²) 2, `boxes_cardboard` 3; wine room: `shelving_steel` → racking with bottles | 0.50 | 0.8 | 0, 0 | 2 |
| `plant` | commercial | arcade elec: `switchboard`; pump: `drum_55` + plan pump; mach: `rack_19` | `fuse_board` 3, `drum_55` 1 | 0.40 | 0.3 | 0, 0 | 3 |
| `circulation` | all | none | wall-hosted only, with d ≤ 0.35: `fire_ext` 1 per corridor run, `sign_exit` at public exits, `art_print`/`art_poster`/`gold_disc`/`art_canvas` by style | 0.05 | 0.1 | 0.2, 6 | — |
| `walk` | motel | none | `vending_cola` (niche) 1, `lounger` (balcony ≥ 2.0 deep) 1, `trash_can` 1 | 0.10 | 0.1 | 0, 0 | — |
| | marine | none | `life_ring` 3, `rope_coil` 2, `deck_chair_marine` 1 | 0.10 | 0.2 | 0, 0 | — |
| `terrace` | high_end, marine | `lounger` ×2 | `patio_set` 3, `palm_pot` 3, `planter_box` 2 | 0.20 | 0.1 | 0, 0 | 8 |
| `court` | motel, high_end | `lounger` ×N (pool edge, 1 per 3 m of deck) | `patio_set` 3, `palm_ground` 2, `trash_can` 1 | 0.15 | 0.1 | 0, 0 | — |
| | commercial (plaza) | none | `bench_mall` 2, `planter_mall` 2, `palm_ground` 2, `light_pole` 2, `payphone` 1 | 0.10 | 0.1 | 0, 0 | — |
| `lot` | all | `G.car` in 40–70 % of marked stalls | `light_pole` 2, `dumpster` (edge) 1, `trash_can` 1, `litter` 2 | 0.30 | 0.2 | 0, 0 | — |
| `street` | all | none | `newspaper_box` 2, `payphone` 1, `bus_bench` 1, `fire_hydrant` 2, `trash_can` 2, `palm_ground` (in a tree pit) 2 | 0.05 | 0.2 | 0, 0 | — |
| `road` | all | none | `car_parked` in the parking lane only, 1 per 6.5 m, 30–60 % filled | 0.20 | 0 | 0, 0 | — |
| `alley` | all | `dumpster` ×1 per 25 m | `drum_55` 2, `crate_stack` 2, `trash_can` 2, `litter` 3, `boxes_cardboard` 2 | 0.15 | 0.6 | 0, 0 | — |
| `yard` | commercial, marine | none | `pallet` 3, `drum_55` 2, `crate_stack` 2, `van_parked` 1, `boat_trailer` (marine) 2, `hand_truck` 1 | 0.25 | 0.4 | 0, 0 | — |
| `pier` | marine | `bollard_cleat` 1 per 3 m of edge, `pedestal_power` 1 per 2 slips | `dock_box` 1 per slip 3, `rope_coil` 2, `life_ring` 1 | 0.05 | 0.2 | 0, 0 | — |
| `planter` | all | `palm_ground` 1 per 12 m² | shrubs (vis) | — | 0 | 0, 0 | — |

Rules for kits:
1. Place in this order: explicit plan props, required groups, required
   items, optional items, wall art, ceiling items, tabletop items, scatter.
2. If a required group does not fit (§4), try the next smaller size
   (king → queen → double → twin; dining 12 → 8 → 4). If nothing fits,
   drop it and log a `DECOR.place` warning naming the room.
3. **Mission rooms are not exempt from §4.** Spawns, objectives, stash
   points and home lockers are reserved first, as keep-out discs.
4. Exterior kinds never get ceiling items. `circulation` and `stair` never
   get free or scatter items in the walking path.

## 4. Clearances

The basis is the ICC/ANSI A117.1 / [2010 ADA Standards](https://www.access-board.gov/ada/)
(36″ ≈ 0.9 m accessible route, 60″ ≈ 1.5 m turning circle). These bound the
real-world minimum. The game's nav sets the practical floor: `plan.js`
`raster(st, step=.25, r=.3)` (line 425) erodes every solid prop by the agent
radius 0.3 (line 439). So any passage under **0.6 m + one 0.25 raster cell**
closes for AI. Treat 0.9 m as the hard minimum everywhere.

| Rule | Value | Applies to |
|---|---|---|
| C1 Circulation path | ≥ 0.9 m clear; ≥ 1.2 m in public rooms (`assembly`, `retail`, `reception`, `court`) and on any route marked in a brief's gameplay overlay | all solid props |
| C2 Corridors | `circulation` gets wall-hosted items only, with d ≤ 0.35, and the path stays ≥ 0.9 (STYLE-LEVELS §1 rule 2 corridor widths stand) | |
| C3 Door swing | Keep the swept arc of every leaf clear (radius = leaf width + 0.05), on the swing side | all props, including visual floor items and scatter |
| C4 Door approach | A 1.2 m deep × (door width + 0.6) zone on both sides of every doorway | solid props and scatter |
| C5 Exits | Exterior doors and exit routes keep 1.2 m clear for 2.0 m | all |
| C6 Windows | 0.6 m clear in front of a window, unless the item's h is below the sill (h ≤ 0.8: sofas, beds, desks are fine) | solid props |
| C7 Bed | 0.6 on the access sides, 0.9 at the foot (0.75 sides for king) | `G.bed` |
| C8 Dining | 0.75 chair pull-back (0.9 at 8+ seats) | `G.dine` |
| C9 Kitchen | 1.0 in front of a run; 1.2 between parallel runs or a run and an island | `G.kitchen` |
| C10 Bar | 0.9 stool zone + 0.9 passage; 0.9 between bar and back bar | `G.bar` |
| C11 WC | 0.4 from the centreline to a side wall or fixture; 0.6 clear in front | `wc`, `urinal` |
| C12 Working space | 1.0 in front of `switchboard`, `cctv_bank`, `rack_19` and `tape_machine` (NEC 110.26 working-space spirit) | |
| C13 Item spacing | ≥ 0.45 between free solid items that are not in the same group (lets a player squeeze through and keeps cover readable); no gap of 0.05–0.6 (an AI trap) | free solid props |
| C14 Reserved | Keep-out discs: spawns 0.8 m, objectives 1.0 m, stash points 0.6 m, stairs and portals 1.2 m, and any home/locker interaction point 1.0 m | all props |
| C15 Overlay routes | A brief's flank loops and sightline corridors (§6 of each level doc) are C1 paths, even through open rooms | solid props |
| C16 Ceiling | `ceiling` items keep ≥ 2.1 m above the floor (a chandelier over a table may hang to 1.9) | ceiling |

## 5. Solid WORLD props vs visual-only (W1/W2b decision)

**Decision needed (W1 + W2b):** today plan `props[]` are solid WORLD props.
They collide, they take shots by build and cov, and plan.js treats them as
nav blockers. There is no non-colliding dressing layer. Dressing every room
with solid items would choke nav and make the cover map noisy, so this spec
proposes two layers:

- **Solid** (`props[]`, current contract), when **any** of these holds:
  - footprint ≥ 0.45 m² **and** h ≥ 0.4;
  - h ≥ 1.2 **and** footprint ≥ 0.25 m²;
  - the item is designated cover (`drum_55`, `safe_small`, `amp_stack`).

  The **Solid** column of §2 is this rule applied, with judgement overrides
  noted there (for example, `fc_table` and `patio_set` are visual so that
  open courts stay open; `shower_stall` is visual).
- **Visual** (a proposed new layer): chairs, stools, nightstands, side
  tables, lamps, palms in pots, toilets, basins, every `wallMount`, `ceiling`
  and `top` item, and all scatter. A proposed shape:

  ```js
  decor: [{ id, item, at:[x,z], rot, y, host, on? }]   // per stage, generated or authored
  ```

  These items do not collide, are ignored by rays, nav and BlocksSight, and
  carry no build. The renderer draws them, and save state ignores them
  (they are deterministic from the seed).

**Until W1/W2b decide**, W4 emits only the solid items into `props[]` and
keeps the visual items in a separate array that the renderer may draw or
skip. W4 must not promote a visual item to solid to get it drawn.

Open points for the decision:
1. Do bullets pass through visual items silently, or do visual items take a
   puff and decal VFX? This spec assumes they pass silently, with no
   gameplay effect.
2. Do grenades and explosions knock visual items about? Out of scope for v1.
3. Should `glass` items such as `display_case` and `mirror_wall` break?
   `display_case` is solid glass (it breaks, per the W1c gate). `mirror_wall`
   is visual for now.

## 6. W4d visual inspection checklist

Run it per level, using the W1 floorplan visualiser (Q-E), the
`scripts/levels-review.cjs` viewer and in-game screenshots. Each item is
pass or fail, with the room id.

**Vocabulary and data**
- [ ] Every room has a §1.1 kind. There are no fallback-kind warnings, and
  the `style` is set at plan level.
- [ ] Every generated item id exists in `DECOR.items`. Every solid build is
  a MATERIALS §3 id, and every cov is a §0 class.
- [ ] Regenerating with the same plan gives the same props (seeded).

**Scale and period**
- [ ] Beds, sofas and tables read at true scale beside a player (1.8 m). Mall
  tables are the 1.22 m size (W4 backlog).
- [ ] No anachronisms: no flat screens, no mobiles or laptops; CRTs and
  rack stereos only (STYLE-LEVELS §1 rule 7).
- [ ] The style reads: motel laminate, not high_end lacquer; marine items
  are fixed down.

**Placement**
- [ ] Wall items sit flush against the wall: no gap > 0.05 and no
  clipping into the wall.
- [ ] Facing is right: TVs face sofas, desks face doors, machines face
  out, and cars sit nose-in in their stalls.
- [ ] No item inside another, or in a doorway, stair, lift or shaft.
- [ ] No toilets, basins or other interior fixtures on open exterior floors
  (W4 backlog: toilets on the open marina dock).
- [ ] Wall art stays within its §3 budget. None sits over windows, doors,
  mirrors or other art, and none is on glass, glass-block or hull-only
  walls (except `porthole`).
- [ ] Ceiling items appear only in roofed rooms and stay ≥ 2.1 m high (C16).

**Clearances (§4)**
- [ ] Every door's swing arc and approach zone is clear (C3, C4). In
  particular, no crate stack blocks a door (W4 backlog).
- [ ] Use the visualiser's sightline and nav tools to check that each
  brief's §6 entries, flank loops and sightlines are still open (C15).
- [ ] Spawns, objectives, stash points and stairs have their keep-out
  discs (C14).
- [ ] The nav raster has no newly sealed rooms or islands compared with the
  undressed plan (diff the `world-plan` nav output).
- [ ] The solid-cap fraction per room is within §3, explicit plan props
  included.

**Ballistics feel**
- [ ] Furniture behaves as BALLISTICS §4 predicts: sofas, beds and wood
  counters are concealment that every calibre perforates; appliances
  (`car_door`) stop little; safes (`steel_10mm`) stop pistols and buckshot.
  Spot-check three props per level against the §4 outcome matrix.
- [ ] Glass items (`display_case`) break and are not used as hard cover.

## 7. Open questions

| # | To | Question |
|---|---|---|
| Q1 | W5 | Wood case furniture borrows `counter_cabinet`, and pianos and pool tables borrow it too. That understates a grand piano's cast-iron plate and a pool table's 25 mm slate. Add a `case_wood` build, or a `slate_25` layer for these? Until then, use `counter_cabinet`. |
| Q2 | W5 | Studio `gobo` panels (MDF plus mineral wool) are visual for now. Should they be soft cover, built from `joinery_ply` + `insul`? |
| Q3 | W1/W5 | `display_case` uses `glass_tempered_6`. Per the W1c gate, glass is breakable and lock state is not immunity. Confirm that the item's top is the only glass face, and that the cabinet below it is `counter_cabinet`. |
| Q4 | W1/W2b | The §5 visual-layer contract (shape, rays, nav, save). Blocking for W4 visual items. |
| Q5 | W2 | The marina `shed` dry-stack racks and the club `dj_booth` stay plan-authored (`special`). Confirm W2b will author them. |
| Q6 | W1 | Should `decor` generation run at build time (in plan.js, output checked into the compiled plan) or at load time (`DECOR.place` in the browser)? Seeded either way. |
