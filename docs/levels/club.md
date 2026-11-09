# Club Flamingo: floorplan reference and layout brief

> **Status:** W3 research deliverable (wave 1). This is docs only, not a runtime map.
> **Consumers:** W2 (level designer) builds the stage from it. W1's floorplan
> visualiser and query tools check the result against §5 and §6. W4 (decor)
> uses §8. W5 uses §6.7 and §7.
> **Mission brief:** levels.js line 30: *"The money runs through Club Flamingo
> on the strip, VIP lounge in the back. Shut it down. Permanently. Lot of
> guards tonight, so watch the doors."* W10d script draft (Job 2, team file,
> not in the repo): the back-door option `[flag: flamingo_back]`, *"Tony leaves
> it open for deliveries. Be a delivery."*, and a cash-drawer option.
> **Evidence tags:** **V** verified from a cited source, **D** derived from
> sources, **P** proposed design choice (plausible, not measured), **G**
> gameplay override.
> **Validated:** area bounds, door and window geometry, reachability, m²
> totals, loops L1–L5, connectivity C1–C7 and sightlines S1–S15 were checked
> by script against the table data in §5–§6 (no overlaps; enclosed 800 m² +
> exterior 640 m² = 1 440 m² of walkable site).
> **Machine-readable layout:** `docs/levels/club.layout.json` (STYLE-LEVELS
> §3.1), with `R`, `D`, `W` (glass-block panels), `B` (props with roles) and
> `S` (sightline targets).

---

## 1. Design intent

The legacy level (levels.js lines 29–48) has the right parts: a street to the
south, a dance floor in the middle, a bar, a kitchen, a VIP lounge with a
pool table in the back. It reads as a grid of equal boxes. The goal is a
believable South Beach club of 1986: a **one-storey 1940 Streamline Moderne
cafeteria converted into a nightclub**, the real history of 1450 Collins
Avenue (Hoffman's Cafeteria → Warsaw Ballroom; K1, K2). The building keeps
its 1940 bones (masonry shell, clay-tile back-of-house, one tall open hall)
and wears a 1980s club fit-out (drywall VIP, foyer and staff rooms).

- **"Watch the doors."** The hall has three ways in from the street side
  (the front door through the foyer, the side fire exit, the delivery door
  through the kitchen and back corridor). The guards know it. Every door is
  a choke point, and the player picks which one to fight through (§6.1).
- **The delivery door is the quiet route** (`flamingo_back`): alley → kitchen
  → back corridor, which reaches the VIP, the count room and the hall without
  crossing the dance floor (C6).
- **The hall is a box with almost no hard cover.** 400 m² under a 4.2 m
  ceiling. The only things that stop a pistol are the masonry bar die and four
  structural columns. Booths, the DJ booth and the back bar are concealment.
  A fight in the hall is about angles and movement.
- **The VIP is hidden, not protected.** It sits behind the hall's back wall.
  The foyer arch D2 is offset from the glass front door, so nobody on the
  sidewalk can see the VIP doors, open or shut (S14 and a sweep of the whole
  sidewalk), and the closed doors hide it from the bar (S3, S4). Its wall to
  the hall is 1986 steel-stud drywall: a 9mm keeps 84 % through it. Shooting
  the boss through that wall is a valid play once you know where he sits. Its
  back walls are older and harder: clay tile to the corridor, block to the
  count room (§7).
- **The count room is the hard box.** The manager's office, where the night's
  take is counted, has hollow-block walls (`cmu_hollow`) and a steel door to
  the back corridor. Its second door opens into the VIP (L2), so the boss and
  the money are one room apart.
- **Glass block hides, it doesn't protect.** The Deco glass-block panels on
  the facades block sight (STYLE-LEVELS §3.4) but every gun shoots through
  them (9mm keeps 80 %).
- **Real ways in.** Front door (Collins Avenue), side fire exit (Española
  Way), delivery door (the service alley). No secret routes.

## 2. References and what each contributes

Cite by key. Links and descriptions only; no images or plans are copied.
A1–A3 and GB1 are also in MATERIALS §9.

| Key | Source | What it documents | What we borrow | Rationale |
|---|---|---|---|---|
| **K1** | Miami Design Preservation League, "The Many Lives of 1450 Collins Avenue" (2020). <https://mdpl.org/archives/2020/09/1450-collins-avenue/> | Henry Hohauser, Nautical/Streamline Moderne; opened 24 Dec 1940 as **Hoffman's Cafeteria, for 500 customers**, mostly self-service with a restaurant portion (V). Became the Warsaw Ballroom (1975), Ovo at the Warsaw Ballroom supper club (1986), **The China Club (1987) with a 2,500-gallon shark tank** (V), then the Warsaw Ballroom nightclub (1988–99) (V). | Typology: a cafeteria shell turned club; a big hall (P: the plan is not published); the shark tank as an optional prop | The archetypal South Beach Deco club building, in our year. |
| **K2** | RIBApix, RIBA90958 (photo record of the Warsaw Ballroom). <https://www.ribapix.com/> (search RIBA90958) | Caption: originally Hoffman's Cafeteria, later the Warsaw Ballroom, opened as a club in 1987 (V) | Confirms the conversion. K1 dates the first club (Ovo) to 1986; we take 1986 (the game year) | Second, independent source for K1. |
| **K3** | Miami-Dade property record for 1450 Collins Ave (via countyoffice.org and LoopNet listing) | Built 1940; **1 storey; exterior concrete block**; lot 73.32 × 142 ft (22.3 × 43.3 m, 10,411 sf), less 8.65 ft taken for the street; today's building 12,772 sf, sprinklered, with an elevator (V) | Footprint scale; one storey; `cbs_ext` shell | Real dimensions of the real building. |
| **A1** | Colony Hotel survey (MDPL). <https://www.ruskinarc.com/mdpl/Ocean-CollinsDistrict/4626-736%20Ocean%20Dr/detail> | Deco district construction: cement block on RC foundation (V) | `cbs_ext` shell | Typical district fabric. |
| **A2** | Carlton Hotel survey (MDPL). <https://www.ruskinarc.com/mdpl/Ocean-CollinsDistrict/4757-1433%20Collins%20Ave/view> | Concrete block and stucco; neighbouring block of Collins Avenue (V) | Shell; ground-floor storey heights 3.3–4.2 m (D, session research) | Same street, same decade. |
| **A3** | Flamingo Park historic district designation report. <https://events.miamibeachfl.gov/wp-content/uploads/2017/08/Flamingo-Park.pdf> | Deco finishes: terrazzo, keystone, glass block, porthole windows, eyebrows (V) | Facade and finish palette (§8) | Period vocabulary for W4. |
| **NFPA** | NFPA 101 *Life Safety Code*: §7.4 exits table and main-entrance rule via the NFPA blog "Egress Challenges Related to Assembly Spaces…" (Zevotek, 16 Dec 2021) <https://www.nfpa.org/news-blogs-and-articles/blogs/2021/12/16/egress-challenges-related-to-assembly-spaces-located-at-the-top-of-high-rise-buildings>; Table 7.3.1.2 load factors and §7.5 remoteness via secondary code summaries (shared4.info, dgaconsulting) | Assembly = 50 or more people (V). **2 exits below 500 occupants**, 3 for 500–1,000 (V). Main entrance sized for ½ (or ⅔) of the load (V). From the secondary summaries, not checked against the code text (D): occupant load factors **0.65 m² (7 sf)/person concentrated** (dance floor), **1.39 m² (15 sf)/person less concentrated** (tables); exits at least **½ the diagonal apart** (⅓ sprinklered). | Exit count, exit separation, door widths (§4, §5.2) | Why a club has a side fire exit and a back door, and where they go. |
| **BAR** | Cabaret Designers, "Bar dimensions". <https://cabaretdesigners.com/bar-dimensions/> | Bar 42–44″ high, top 24–30″ deep; bartender aisle 36–42″ (one) or 42–48″ (two); back bar 18–24″ deep; 36–48″ clear behind stools (V) | Bar, aisle and back-bar sizes (§5.3) | Industry rule of thumb. |
| **GB1** | Pittsburgh Glass Block / Mulia glass block brochure. <https://www.pittsburghglassblock.com/sites/default/files/userfiles/file/Mulia%20Brochure.pdf> | 8×8×4 nominal block = 7¾ × 7¾ × 3⅞″, 5.9 lb (V) | `glass_block` build (MATERIALS §3) | Deco glass-block panels. |

**What the references do not give us:** a published floor plan of the Warsaw
Ballroom or Hoffman's Cafeteria interior. Room positions are a typological
composite (P): a cafeteria puts its kitchen and stores at the back on the
service alley, its dining hall in front, and its entrance on the main street.
A club conversion turns the dining hall into the dance floor and carves VIP,
office and staff rooms out of the back and the entrance zone.

## 3. Site and coordinate frame

Metres. **x** runs west → east (0–48), **z** runs north → south (0–30). The
building is x 4–44 × z 0–20 (40 × 20 m). Collins Avenue lies east (the
`front` sidewalk, x 44–48); Española Way lies south (`side` sidewalk and the
`street`, z 20–30); the service alley (Collins Court) lies west (x 0–4). The
north edge (z = 0) is a party wall with the neighbour (stage edge). One
storey; ceiling 4.2 m (P, top of A2's 3.3–4.2 m range for a tall hall).
Floors are one level except the DJ riser (+0.6 m, P); floor steps never
block sight (user decision Q9).

The real lot is 22.3 m on Collins by 43.3 m deep (K3). We keep the 40 m depth
along Española Way but use a 20 m frontage (G) and one floor of 800 m²
against the real 1 187 m² (K3). On a 967 m² lot at one storey that
figure implies a mezzanine or upper level (the record lists an elevator);
this brief does not model it. Which corner of the block faces Española Way, and the alley's
name, are P.

### 3.1 Plan (generated from the sidecar; tables in §5–§6 are authoritative)

1 char = 1 m × 1 m cell; walls are drawn on the room's own edge cells, so
they look 1 m thick. `a` alley, `s` Española Way sidewalk, `=` street,
`f` Collins Avenue sidewalk, `.` hall, `v` VIP, `t` VIP restroom, `$` count
room, `k` kitchen, `l` stores, `m` men's room, `g` staff (security), `o`
foyer, `w` ladies' room, `q` coat check, `O` columns, `C` player car.
Openings: `D` door, `+` glass-block window.
The back corridor (z 11–13) is drawn as wall cells; the arch D2 is the
blank gap at x 35–36, z 11–13; the bar, booths and DJ
booth are not drawn (see §5.3).

```text
          11111111112222222222333333333344444444
012345678901234567890123456789012345678901234567  x
aaaa########################################ffff  z 0
aaaa#tt##vvvvvv##..................##mm##gg#ffff
aaaa#ttDDvvvvvv##..................##mm##gg#ffff
aaaa#####vvvvvvDD..................DDmm##gg#ffff
aaaa#####vvvvvvDD..................##mm##gg#ffff
aaaa#$$##vvvvvv##..................#######D#ffff
aaaa#$$##vvvvvv##....O..........O..#######D#ffff
aaaa#$$##vvvvvv##..................##oooooo+ffff
aaaa#$$DDvvvvvv##..................##oooooo#ffff
aaaa#$$##vvvvvv##..................##ooooooDffff
aaaa##D#######D##..................##ooooooDffff  z 10
aaaa##D#######D##..................  oooooo#ffff
aaaa###D######DDD..................  oooooo+ffff
aaaa###D######D##..................  #####D#ffff
aaaa#kkkkkk##ll##..................#######D#ffff
aaaa#kkkkkk##ll##....O..........O..##ww##qq#ffff
aaaaDkkkkkk##ll##..................##ww##qq#ffff
aaaa#kkkkkk##ll##..................DDww##qq#ffff
aaaa#kkkkkk##ll##..................##ww##qq#ffff
aaaa#############++##DD######+++############ffff
ssssssssssssssssssssssssssssssssssssssssssssssss  z 20
ssssssssssssssssssssssssssssssssssssssssssssssss
ssssssssssssssssssssssssssssssssssssssssssssssss
================================================
==============CCCCC=============================
==============CCCCC=============================
================================================
================================================
================================================
================================================  z 29
```

## 4. Typology rules the layout must keep

1. **One tall hall.** The 1940 cafeteria served 500 customers (K1); we
   read that as one big dining hall (P). Keep the hall a single room with a 4.2 m ceiling and only structural
   columns inside it (P: 4 columns on an ≈ 11 × 9 m grid). Don't subdivide it.
2. **Front of house on the main street, back of house on the alley.** The
   entrance is on Collins (K1, K3); kitchen, stores and the delivery door are
   on the alley side (P, cafeteria typology).
3. **Masonry shell, mixed partitions.** Exterior concrete block (K3, A1, A2):
   `cbs_ext`. Original 1940 back-of-house partitions are clay tile (P,
   MATERIALS §4). The 1986 fit-out is steel-stud drywall (MATERIALS §4).
4. **At least two exits, far apart** (NFPA 7.4, 7.5). The design load is about
   400 (§5.4), so two exits are the minimum; the club has three to the
   outside (D1, D7, D16). The hall's two exits (the arch D2 toward D1, and D7)
   are 16.0 m apart, more than half the hall's diagonal (14.1 m).
5. **The VIP gets two ways out.** It seats ≈ 63 (§5.4), over the 50 that
   makes a space an assembly (NFPA), so we give it two exits (P, following
   the building-wide rule): D8 to the hall and D10 to the back corridor.
6. **Bar to the rules of thumb** (BAR): die 1.1 m high (chest coverage),
   0.6 m top, 0.5 m back bar. The 1.3 m bartender aisle is a little over the
   42–48″ for two (G: room for two pawns to pass).
7. **Glass block on the street faces**, never as the only wall of a room
   (A3, GB1): panels W1–W4 sit in masonry walls.
8. **The money is out of public sight.** The count room is invisible from
   the hall, foyer and street; it opens only to the back corridor and the
   VIP.
9. **No straight line from the street to the VIP.** The arch D2 is offset
   from the front door D1 (a dog-leg foyer), so the glass doors and the arch
   never line up on the VIP doors (P, the usual club foyer that hides the
   room from the queue).

## 5. Area schedule (checkable)

Bounds are `[x0, z0, x1, z1]`. **Ent** counts doorways and openings a pawn
can walk through. Windows are not entrances. Where exterior areas meet, the
edge is unwalled and §5.2 lists it as an `open` row; their edges against
nothing are stage edges. Every other room edge is a wall. Builds refer to
MATERIALS §3.

### 5.1 Stage `club`

| id | Name | Kind | Bounds | Dims (m) | m² | Ent | Entrances | Research | Tag |
|---|---|---|---|---|---:|:-:|---|---|:-:|
| `alley` | Service alley (Collins Court) | exterior | 0, 0, 4, 20 | 4 × 20 | 80.0 | 2 | D16, D17 (+ north stage edge) | — | P |
| `side` | Española Way sidewalk | exterior | 0, 20, 48, 23 | 48 × 3 | 144.0 | 4 | D7, D17, D18, D19 | — | P |
| `front` | Collins Avenue sidewalk | exterior | 44, 0, 48, 20 | 4 × 20 | 80.0 | 2 | D1, D18 (+ north stage edge) | — | P |
| `street` | Española Way | exterior | 0, 23, 48, 30 | 48 × 7 | 336.0 | 1 | D19 (+ stage edges) | — | P |
| `kitchen` | Kitchen | service | 4, 13, 12, 20 | 8 × 7 | 56.0 | 2 | D14, D16 | — | P |
| `stores` | Liquor store and walk-in | closet | 12, 13, 16, 20 | 4 × 7 | 28.0 | 1 | D15 | — | P |
| `back_hall` | Service corridor | circulation | 4, 11, 16, 13 | 12 × 2 | 24.0 | 5 | D9, D10, D11, D14, D15 | — | P |
| `office` | Count room (manager's office) | secure | 4, 4, 8, 11 | 4 × 7 | 28.0 | 2 | D11, D12 | — | P |
| `vip_wc` | VIP restroom | bath | 4, 0, 8, 4 | 4 × 4 | 16.0 | 1 | D13 | — | P |
| `vip` | VIP lounge | lounge | 8, 0, 16, 11 | 8 × 11 | 88.0 | 4 | D8, D10, D12, D13 | — | P |
| `hall` | Main hall and dance floor | assembly | 16, 0, 36, 20 | 20 × 20 | 400.0 | 6 | D2, D5, D6, D7, D8, D9 | 500 customers (K1) | P |
| `wc_m` | Men's room | bath | 36, 0, 40, 6 | 4 × 6 | 24.0 | 1 | D5 | — | P |
| `staff` | Security room | service | 40, 0, 44, 6 | 4 × 6 | 24.0 | 1 | D3 | — | P |
| `foyer` | Foyer and cashier | circulation | 36, 6, 44, 14 | 8 × 8 | 64.0 | 4 | D1, D2, D3, D4 | — | P |
| `wc_f` | Ladies' room | bath | 36, 14, 40, 20 | 4 × 6 | 24.0 | 1 | D6 | — | P |
| `coat` | Coat check | closet | 40, 14, 44, 20 | 4 × 6 | 24.0 | 1 | D4 | — | P |

Totals: enclosed 800.0 m² (12 rooms); exterior 640.0 m².

### 5.2 Doors and openings

`x=c` is a wall on the line x = c, with the opening centred at the stated z
(and vice versa). **Kind** maps to MATERIALS §3 builds; `open` is an opening
with no leaf; `glass` is a `glass_tempered_6` storefront door.

| Door | Rooms | Wall, centre | Width | Kind |
|---|---|---|---:|---|
| D1 | `front` ↔ `foyer` | x=44, z 10 | 2.4 | glass (double; main entrance) |
| D2 | `foyer` ↔ `hall` | x=36, z 12.2 | 2.8 | open (arch, offset from D1) |
| D3 | `foyer` ↔ `staff` | z=6, x 42 | 0.9 | door_metal |
| D4 | `foyer` ↔ `coat` | z=14, x 42 | 0.9 | door_solid (Dutch door, P) |
| D5 | `hall` ↔ `wc_m` | x=36, z 3 | 0.9 | door_solid |
| D6 | `hall` ↔ `wc_f` | x=36, z 17 | 0.9 | door_solid |
| D7 | `hall` ↔ `side` | z=20, x 22 | 1.8 | door_metal (fire-exit pair, panic bars) |
| D8 | `hall` ↔ `vip` | x=16, z 4 | 1.8 | door_solid (double, padded) |
| D9 | `hall` ↔ `back_hall` | x=16, z 12 | 0.9 | door_solid ("STAFF ONLY") |
| D10 | `back_hall` ↔ `vip` | z=11, x 14 | 0.9 | door_solid |
| D11 | `back_hall` ↔ `office` | z=11, x 6 | 0.9 | door_metal |
| D12 | `office` ↔ `vip` | x=8, z 8 | 0.9 | door_solid |
| D13 | `vip` ↔ `vip_wc` | x=8, z 2 | 0.8 | door_hollow |
| D14 | `back_hall` ↔ `kitchen` | z=13, x 8 | 1.2 | door_solid (double-swing) |
| D15 | `back_hall` ↔ `stores` | z=13, x 14 | 0.9 | door_metal |
| D16 | `kitchen` ↔ `alley` | x=4, z 17 | 1.2 | door_metal (delivery door; `flamingo_back`) |
| D17 | `alley` ↔ `side` | z=20, x 2 | 4.0 | open (whole edge) |
| D18 | `side` ↔ `front` | z=20, x 46 | 4.0 | open (whole edge) |
| D19 | `side` ↔ `street` | z=23, x 24 | 48.0 | open (kerb, whole edge) |

**Windows** (not entrances; all `glass_block`, which **blocks sight**
(STYLE-LEVELS §3.4) but not bullets):

| Window | Rooms | Wall, centre | Width |
|---|---|---|---:|
| W1 | `hall` ↔ `side` | z=20, x 18.5 | 2.4 |
| W2 | `hall` ↔ `side` | z=20, x 30 | 3.0 |
| W3 | `foyer` ↔ `front` | x=44, z 7.6 | 1.2 |
| W4 | `foyer` ↔ `front` | x=44, z 12.4 | 1.2 |

Egress checks (D, NFPA): D1 2.4 m serves the main-entrance half of the load
(≈ 200 × 5 mm ≈ 1.0 m needed). D1 ↔ D7 = 24.2 m and D1 ↔ D16 = 40.6 m,
both more than half the building diagonal (22.4 m).

### 5.3 Props with gameplay roles (sidecar `B`)

| id | Role | Footprint `[x0, z0, x1, z1]` | Size | Build | Coverage | Tag |
|---|---|---|---|---|---|:-:|
| BAR | Bar die (front of the bar) | 20, 1.8, 31, 2.4 | 11 × 0.6, 1.1 m high | `counter_cmu` | chest | D BAR |
| BB | Back bar | 20, 0, 32, 0.5 | 12 × 0.5 | `counter_cabinet` | chest | D BAR |
| DJ | DJ booth on a 0.6 m riser | 16.6, 7, 19, 11 | 2.4 × 4 | `counter_cabinet` | chest | P |
| COL1–COL4 | Structural columns | 0.4 × 0.4 at (21.5, 6.5), (32.5, 6.5), (21.5, 15.5), (32.5, 15.5) | 0.4 × 0.4 | `rc_column_40` | full | P |
| BK1 | Booths, south wall | 24, 18.9, 35.5, 20 | 11.5 × 1.1 | `sofa` | waist | P |
| BK2 | Booths, west wall | 16, 14, 17, 19 | 1 × 5 | `sofa` | waist | P |
| VB | VIP banquette | 8.5, 0.2, 15.5, 1.2 | 7 × 1 | `sofa` | waist | P |
| SAFE | Objective safe (count room) | 4.2, 9.6, 5.2, 10.8 | 1 × 1.2 | `steel_10mm` | waist | P |
| CAR | Player car | 14, 24, 18.8, 25.9 | 4.8 × 1.9 | `car_door` | waist | P |

The bartender aisle (z 0.5–1.8) is 1.3 m (BAR: 42–48″ for two; G). The
4.6 m between the bar die and the dance floor is the bar crowd and the stool
zone (BAR: ≥ 36–48″). The **dance floor** (lit floor, no collision) is
x 22–32, z 7–15 (10 × 8 = 80 m², P); it is a floor finish, not a `B` row. The
DJ booth stops at z 11, clear of the staff door D9.

### 5.4 Occupant load (D, NFPA Table 7.3.1.2)

| Zone | m² | Factor | Persons |
|---|---:|---|---:|
| Dance floor | 80 | 0.65 (concentrated) | 123 |
| Rest of the hall (less bar, back bar and DJ booth) | ≈ 298 | 1.39 (tables) | 214 |
| VIP | 88 | 1.39 | 63 |
| **Total** | | | **≈ 400** |

Under 500, so two exits are the minimum (NFPA 7.4); the club has three.
Factors are D (§2 NFPA). This is a **design** load: how many patrons spawn is W2's call (§9 Q1).

## 6. Gameplay overlay (checkable targets)

### 6.1 Entries

| # | Entry | Arrives in | Use |
|---|---|---|---|
| E1 | Front door D1 (Collins Avenue) | `front` → `foyer` | Default and loud. Bouncers at the door, the security room (D3) beside the foyer: the fight starts in a small room. |
| E2 | Side fire exit D7 (Española Way) | `side` → `hall` | Straight onto the dance floor's flank. A fire exit opens from inside; from outside it is locked unless propped (smokers) or breached (§9 Q3). |
| E3 | Delivery door D16 (the alley) | `alley` → `kitchen` → `back_hall` | The `flamingo_back` route: "Tony leaves it open for deliveries." Reaches the VIP (D10), count room (D11) and hall (D9) without the dance floor. |

The player arrives by car on Española Way (`street`, CAR) and walks to the
entry of choice: front door 30 m east, fire exit 6 m, alley 14 m west.

### 6.2 Sightlines (W1 query targets)

Standing eye 1.6 m to a standing target. Only `full` walls, **closed leaf
doors** and **`glass_block` windows** block. The open arch D2, the glass
door D1, props, booths, the bar and columns do not block standing sight
(columns are 0.4 m and are ignored by the line test). Targets assume every
leaf door is closed; an open leaf still blocks rays that cross its swung
position (STYLE-LEVELS §3.4).

| # | From → to | Length | Expected | Intent |
|---|---|---:|---|---|
| S1 | front (46, 10) → hall (27, 14) | 19.4 | **clear** | From the sidewalk you see through the glass doors and the arch to the dance floor's south side: the bouncers see you coming. |
| S2 | hall (16.5, 2.9) → hall (35.5, 2.9) | 19.0 | **clear** | The bar lane runs the hall's full width: one gun at either end rakes the bar crowd. |
| S3 | hall (24, 4) → vip (12, 4) | 12.0 | **blocked** | The closed VIP doors D8 hide the lounge from the bar. |
| S4 | vip (10, 2) → hall (27, 11) | 19.2 | **blocked** | The VIP can't see the dance floor; the boss doesn't know the fight has started until it reaches his doors. |
| S5 | hall (18, 9) → foyer (40, 12) | 22.2 | **clear** | The DJ watches the arch and the foyer: a lookout spot. |
| S6 | side (22, 21.5) → hall (22, 10) | 11.5 | **blocked** | The closed fire exit D7 hides the hall from the street. |
| S7 | side (30, 21.5) → hall (30, 10) | 11.5 | **blocked** | Glass block W2 hides the hall from the sidewalk (and you can still shoot through it, §6.7). |
| S8 | front (46, 1) → side (46, 22) | 21.0 | **clear** | The Collins sidewalk sees round the corner onto Española Way. |
| S9 | street (1, 26) → street (47, 26) | 46.0 | **clear** | The street is one long open lane for arriving reinforcements. |
| S10 | alley (2, 1) → side (2, 22) | 21.0 | **clear** | The alley is a straight lane: whoever stands at its mouth sees the delivery door. |
| S11 | back_hall (10, 12) → hall (30, 12) | 20.0 | **blocked** | The closed staff door D9 hides the back corridor from the hall. |
| S12 | foyer (40, 10) → staff (42, 3) | 7.3 | **blocked** | The security room is out of sight of the foyer; its guards come out through D3. |
| S13 | hall (17, 19) → hall (35, 1) | 25.5 | **clear** | Corner to corner across the dance floor: the hall's longest line. |
| S14 | front (46, 11) → hall (16.5, 4) | 30.3 | **blocked** | From the street you can't see the VIP doors. Holds from every sidewalk point: a sweep of `front` (0.1 m grid) against the D8 face found no clear ray, because D2 is offset from D1. |
| S15 | alley (2, 17) → kitchen (10, 17) | 8.0 | **blocked** | The closed delivery door hides the kitchen from the alley. |

### 6.3 Cover inventory

"Stops" quotes BALLISTICS §4 (retained energy, calibre order 9mm, 9mm SMG,
.45, .357, .50 AE, 5.56, 7.62×39, 12ga 00, 12ga slug, .50 BMG).

| Zone | Cover | Coverage | Stops | Notes |
|---|---|---|---|---|
| Shell | `cbs_ext` | full | everything except 7.62×39 (3 %) and .50 BMG (85 %) | The street can't shoot in, except through glass. |
| Back of house, restrooms, VIP ↔ corridor | `clay_tile_4` | full | 9mm, .45, .357 and buckshot; .50 AE keeps 40 %, 5.56 44 %, 7.62×39 61 %, slug 48 % | Stops most pistols; the .50 AE, slugs and rifles go through. |
| Count room | `cmu_hollow` walls, `door_metal` D11 | full | walls: all but 7.62×39 (9 %) and .50 BMG (86 %); the steel door stops only buckshot (9mm keeps 27 %) | A masonry box whose doors are the weak points. |
| Hall ↔ VIP, VIP ↔ VIP restroom, foyer, staff and coat partitions | `stud_steel_gyp` | full (sight only) | nothing (9mm keeps 84 %, buckshot 72 %) | Concealment. |
| Bar | `counter_cmu` die | chest | everything except 7.62×39 (15 %) and .50 BMG (87 %) | The best cover in the hall; 11 m long. |
| Columns COL1–COL4 | `rc_column_40` | full (narrow) | everything | Four slim stops in the open hall. |
| Back bar, DJ booth | `counter_cabinet` | chest | nothing (9mm keeps 69 %, buckshot 47 %) | Looks solid, isn't. |
| Booths, VIP banquette | `sofa` | waist | buckshot mostly (16 % kept); 9mm keeps 51 % | Soft. |
| Glass-block panels W1–W4 | `glass_block` | full (sight only) | nothing (9mm keeps 80 %, buckshot 67 %) | Hides you; doesn't protect you. |
| Safe | `steel_10mm` | waist | everything except 5.56 (19 %), 7.62×39 (46 %), .50 BMG (66 %) | Hard cover in the count room. |
| Doors | `door_solid` / `door_metal` / `door_hollow` | full | solid: buckshot partly (31 % kept), 9mm keeps 60 %; metal: buckshot only (9mm 27 %); hollow: nothing | Every door is shoot-through. |
| Street | CAR, `car_door` / `car_engine` | waist | engine block stops everything; doors stop only buckshot (9mm keeps 51 %) | Hide behind the engine. |

### 6.4 Flank loops (each must be a closed walkable cycle)

Length is the sum of straight segments between consecutive door centres (a
lower bound).

| # | Cycle | ≈ Length | Intent |
|---|---|---:|---|
| L1 | `hall` –D8– `vip` –D10– `back_hall` –D9– `hall` | 17.5 m | The VIP has a back door: a guard can go round, and so can you. |
| L2 | `vip` –D12– `office` –D11– `back_hall` –D10– `vip` | 18.3 m | Boss and money are linked: the count room can be entered from the VIP or the corridor. |
| L3 | `hall` –D7– `side` –D18– `front` –D1– `foyer` –D2– `hall` | 58.5 m | Outside loop: out the fire exit, round the corner, back in the front. |
| L4 | `hall` –D9– `back_hall` –D14– `kitchen` –D16– `alley` –D17– `side` –D7– `hall` | 47.3 m | Back-of-house loop through the kitchen and alley. |
| L5 | `front` –D1– `foyer` –D2– `hall` –D9– `back_hall` –D14– `kitchen` –D16– `alley` –D17– `side` –D18– `front` | 99.8 m | The whole building, front to back and round. |

**Checkable connectivity targets** (door ids removed = treat as walls):

| # | Check | Expected |
|---|---|---|
| C1 | Every room reachable on foot from `street` | yes |
| C2 | `street` → `hall` without D1 | yes, via D7 or D16 |
| C3 | `street` → `vip` without D8 | yes, via D16 → D10 (or D9 → D10) |
| C4 | `street` → `office` without D11 | yes, via the VIP (D12) |
| C5 | `street` → `kitchen` without D16 | yes, via the hall and D9 → D14 |
| C6 | `street` → `hall` without D1 and D7 | yes, via the delivery door D16 (`flamingo_back`) |
| C7 | `street` → `office` without D11 and D12 | **no**: the count room has only two doors |

### 6.5 Approach variety

- **Loud:** front door → foyer (bouncers, security room) → arch → hall →
  VIP doors.
- **Flank:** fire exit D7 straight onto the dance floor, behind the guards
  facing the foyer.
- **Quiet (`flamingo_back`):** alley → delivery door → kitchen → back
  corridor → count room (D11) or VIP back door (D10). The hall can be
  skipped entirely.

### 6.6 Spawns and enemy placement (by role, for W2 to tune)

- **Door (2):** bouncers on the `front` sidewalk by D1.
- **Security room (2–3):** responders through D3 into the foyer.
- **Foyer (1):** cashier at the cash booth (the cash-drawer option).
- **Hall (3–4):** guards at the bar ends (S2), by the DJ booth (S5), and by
  the fire exit.
- **VIP (3):** the boss on the banquette with two bodyguards; one bodyguard
  at D8.
- **Count room (1):** the manager at the safe; runs to the VIP via D12.
- **Back of house (1–2):** a cook in the kitchen; a smoker in the alley
  (E3's first contact).
- **Reinforcements:** a car on Española Way, entering by the front door.
- **Civilians:** patrons on the dance floor, at the bar and in the booths;
  bartenders; the DJ (§9 Q1).

### 6.7 Penetration play notes (from BALLISTICS §4)

- **Shoot the VIP through its wall.** The hall–VIP wall at x = 16 is
  `stud_steel_gyp`: every gun goes through (9mm keeps 84 %). The banquette
  runs along the north wall, so a shot from the hall usually meets it end-on;
  through wall and banquette a 9mm keeps ≈ 35 % (pen_model). From the back
  corridor it is different: the VIP's south wall is 1940 clay tile, which
  stops a 9mm.
- **The count room is not.** Its `cmu_hollow` walls stop everything short of
  the AK (9 %) and the .50; the way in is its doors.
- **The bar is the only real cover in the hall.** `counter_cmu` stops all
  handguns, SMGs, 5.56 and buckshot; only the AK (15 %) and .50 BMG get
  through. The back bar behind it is cabinetry (9mm keeps 69 %).
- **Glass block is a trap for the sidewalk.** From the side sidewalk the
  hall is invisible (S7), but a burst through W1 or W2 reaches the booths
  (9mm keeps 80 %). The same works in reverse on guards outside.
- **Back of house stops most pistols.** The 1940 clay-tile walls stop the
  9mm, .45, .357 and buckshot, so the kitchen and corridor fights go through
  doors. The .50 AE, slugs and rifles get through (40–61 % kept).
- **Every door is shoot-through.** A guard holding a closed `door_solid` is
  hit by a 9mm at 60 %.

## 7. Construction summary

Where two rooms share a wall, the first matching row wins. So the VIP's
walls are mixed: drywall to the hall and its restroom, clay tile to the
back corridor, hollow block to the count room. The staff and coat rooms
meet the restrooms in clay tile.

| Element | Build (MATERIALS §3) | Tag |
|---|---|---|
| Shell (every edge against an exterior area or the north party wall) | `cbs_ext` | V K3 (concrete block), A1, A2 |
| Count room `office` walls | `cmu_hollow` | P (cash room) |
| 1940 back of house: `kitchen`, `stores`, `back_hall`, `wc_m`, `wc_f` walls | `clay_tile_4` | P (MATERIALS §4 Deco palette) |
| 1986 fit-out: remaining `vip`, `vip_wc`, `staff`, `coat`, `foyer` walls (hall ↔ VIP, VIP ↔ VIP restroom, hall ↔ foyer, foyer ↔ staff and coat) | `stud_steel_gyp` | P (MATERIALS §4 club palette) |
| Glass-block panels W1–W4 | `glass_block` | V GB1; D A3 (Deco glass block) |
| Front doors D1 | `glass_tempered_6` | P |
| Other doors | per §5.2 | P |
| Bar die | `counter_cmu` | P (MATERIALS §4) |
| Back bar, DJ booth | `counter_cabinet` | P |
| Columns | `rc_column_40` | P |
| Booths, banquette | `sofa` | P (MATERIALS §4) |
| Safe | `steel_10mm` | P |

## 8. Props by zone (circa 1986)

- **Front sidewalk:** pink and blue neon sign "FLAMINGO" on a Deco fin over
  the door, velvet rope and brass stanchions, a bouncer's stool, palm in a
  planter, a parked Testarossa.
- **Foyer:** cash booth with a window and drawer (the cash-drawer option),
  terrazzo floor with a flamingo inlay (A3), mirrored walls, a payphone,
  cigarette machine.
- **Coat check:** Dutch door, coat racks, tickets.
- **Security room:** CCTV monitors (black and white), lockers, a gun rack,
  a coffee maker.
- **Hall:** lit dance floor, mirror ball, laser and par-can
  rigs on a truss, speaker stacks, neon tubes along the cornice, chrome bar
  stools along the bar, booths (BK1, BK2), small cocktail tables, two of the
  original 1940 columns clad in mirror.
- **Bar:** glass-block bar front or terrazzo die, back-bar mirror and bottle
  shelves, beer taps, ice wells, a cash register, a blender.
- **DJ booth:** two turntables, a mixer, record crates, a lighting board.
- **VIP:** curved banquette, smoked-glass tables, pool table (legacy),
  bottle service on ice, palm fronds, a fish tank or **the shark tank**
  (K1, China Club 1987; optional, §9 Q4).
- **Count room:** desk, money counter, bundled cash, duffel bags, the safe,
  a small CCTV monitor of the VIP.
- **Kitchen:** stainless prep tables, range and hood, walk-in door, mop sink,
  crates.
- **Stores:** liquor cases, beer kegs, CO₂ bottles, cleaning supplies.
- **Back corridor:** "STAFF ONLY" sign, time clock, crates, a fire
  extinguisher.
- **Restrooms:** stalls, mirrors, sinks, a lounge chair in the ladies'.
- **Alley:** dumpster, delivery crates, a beer truck or van, a smoker's
  bucket, a propped door.
- **Street:** parked cars, a taxi, palm trees, a newspaper box.

## 9. Open questions for W2, W1, W5 and W10

1. **Civilians.** A club full of patrons changes everything: stray rounds,
   panic and blocked lines. How many patrons spawn, and do they flee through
   D1 and D7 when shooting starts? W2/W10 to decide. Proposal: a light crowd
   (10–20) that flees on the first shot.
2. **Glass-block sight.** STYLE-LEVELS §3.4 now says `glass_block` windows
   block sight. W1 needs a W-row kind check for this, or the club's S7
   target fails.
3. **Fire exit from outside.** D7 has panic bars inside. Proposal: locked
   from outside (`door_metal` with a lock, breachable per MATERIALS §5),
   unless the script props it open. W1/W10 to decide.
4. **Shark tank.** The China Club's 2,500-gallon tank (K1) is a 1987 detail
   that fits the yacht's shark tie-in. Optional VIP prop; if it's breakable,
   it's a glass-and-water effect for W5. W4/W10 to decide.
5. **Objective.** Is the target the boss in the VIP, the safe in the count
   room, the cash drawer in the foyer, or a choice? The layout supports all
   three. W10 to decide.
6. **Columns.** The 0.4 m columns COL1–COL4 are `full` cover but too narrow for the
   line test; they don't block sightlines here. W1 to confirm whether props
   of `full` coverage should block sight (STYLE-LEVELS §3.4 says props never
   do). **Resolved (W1c schema gate, as arcade §9 Q5):** props never block
   sight, so the columns are cover only.
