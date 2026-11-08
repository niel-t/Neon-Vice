# Starlight Arcade: floorplan reference and layout brief

> **Status:** W3 research deliverable (wave 1). This is docs only, not a runtime map.
> **Consumers:** W2 (level designer) builds the stage from it. W1's floorplan
> visualiser and query tools check the result against §5 and §6. W4 (decor)
> uses §8. W5 uses §6.7 and §7.
> **Mission brief:** levels.js line 84: *"Lex washes his money through the
> Starlight Arcade on the beach. Quarters in, clean dollars out. Unplug it."*
> W10d script draft (Job 5, team file, not in the repo): *"Unplug every
> cabinet."*; *"Kids play there." / "Not after midnight they don't."*; and a
> "beat a high score first" option.
> **Evidence tags:** **V** verified from a cited source, **D** derived from
> sources, **P** proposed design choice (plausible, not measured), **G**
> gameplay override.
> **Validated:** area bounds, door and window geometry, reachability, m²
> totals, loops L1–L6, connectivity C1–C7 and sightlines S1–S15 were checked
> by script against the table data in §5–§6, plus a 0.6 m prop-free strip
> on both sides of every door (no overlaps; enclosed 648 m² +
> exterior 592 m² = 1 240 m² of walkable site).
> **Machine-readable layout:** `docs/levels/arcade.layout.json` (STYLE-LEVELS
> §3.1), with `R`, `D`, `W` (storefront glass), `B` (props with roles) and
> `S` (sightline targets).

---

## 1. Design intent

The legacy level (levels.js lines 84–99) has three rooms side by side: a
cabinet room with a bar and toilet on the west, a big cabinet hall in the
middle, a smaller cabinet room on the east, and the beach to the south. That
is already the shape of the real thing: an arcade in a **one-storey strip of
shop bays**, where a growing operator knocks through into the next bay. The
goal is a believable 1986 beach-town arcade: **three 1950s concrete-block shop
bays on 71st Street, just west of Collins Avenue and one block from the sand** (P), taken over by the
Starlight Arcade.

- **Quarters in, clean dollars out.** An arcade takes in cash in small coins
  with no receipts, which is why it launders well (P). The bright public half
  (the arcade floor and the pinball annex) is the front. The money half is the
  **blacked-out west bay**: a back room of video-poker machines (the
  gambling machines that period raids seized, PL1), the count room where the
  coin is counted and bagged, and a repair shop full of spare boards (and, in
  1984, counterfeit ones, UPI1).
- **"Not after midnight."** The mission happens after closing. The arcade
  floor is dark except for the attract screens, with no kids and no
  civilians. The back room is still open for adults who know the knock (P).
  The game uses this contrast: one dark, empty, glass-fronted hall, and one
  lit, crowded, windowless room.
- **"Unplug every cabinet."** All 63 video cabinets, 10 pinballs and the
  poker machines run off one service. The objective is the **main panel** in
  the electrical room (PANEL, §5.3): pull it and the whole place goes dark.
  The count-room safe is a secondary target (§9 Q1).
- **Glass in front, block behind.** The arcade's storefront is plate glass,
  so the street sees in and the hall sees out (S1, S2, S7). The back room's
  storefront was bricked up, so nobody sees in (S5, S13). Every shop-to-shop
  wall is drywall, so every gun shoots between bays (§6.7).
- **Real ways in.** The front door, the back-room "members" door, the service
  doors on the alley (one per tenant, as strip centres are built; the east bay uses its side fire exit) and the side
  fire exit. No secret routes.

## 2. References and what each contributes

Cite by key. Links and descriptions only; no images or plans are copied.
Shell sources (concrete block, MATERIALS §9 M1, C3, C5) and NFPA (club.md §2)
are reused, not repeated.

| Key | Source | What it documents | What we borrow | Rationale |
|---|---|---|---|---|
| **SC1** | Innowave Studio, "Retail Site Plan: Strip Centers, Pads and Outparcels" (reviewed 2026). <https://www.innowave-studio.com/site-plan/retail-site-plan> | Inline (strip) building depth 50, 60 or 70 ft by practitioner convention, about 70 ft optimal, never over 100 ft; bay module **20 ft**, or 25 ft for wider storefronts; multiples (40, 60, 80 ft) align with column spacing. These are conventions, not code (V) | Building 18 m (≈ 59 ft) deep; 6 m (≈ 20 ft) bay module; the arcade takes 3 modules, the west and east tenants 2 and 1 (D) | Why the bays have these sizes. |
| **SC2** | GTA Steel Building, "Strip Mall Building: Multi-Tenant Retail in Steel" (2026). <https://www.gtasteelbuilding.com/blog/strip-mall-building/> | A strip centre is a grid of tenant bays. A tenant who needs more space combines bays; demising walls separate tenants; retail has a storefront, an open sales floor and a back stockroom; service tenants may have a rear overhead door; each tenant usually gets a rear service door (V) | Knocked-through demising wall (D3, D4); a rear stock corridor; a rear door per tenant (D) | The bay-combining logic behind the annex. |
| **PM1** | Midway Mfg. Co., *Pac-Man Parts and Operating Manual*, Dec 1980 (Internet Archive). <https://archive.org/details/ArcadeGameManualMidwaysPac-manPartsAndOperating> | Games #932 upright, #933 cocktail, #934 mini; coin door and cash box (V) | Cabinet types on the floor; the cash box inside every cabinet (the money) | The period's best-selling game, as it shipped. |
| **PM2** | Christie's, lot 34, sale 23617: Pac-Man upright, Bally Midway, 1980 (serial PM11620). <https://www.christies.com/en/lot/lot-6495106> | Upright cabinet **68 × 24¾ × 33 in (172.7 × 62.9 × 83.8 cm)** (V) | Cabinet footprint 0.63 × 0.84 m; standing height 1.73 m (taller than eye level: `full` coverage) | A measured original cabinet. |
| **FS1** | International Arcade Museum (KLOV) forum, "Stop n' Play – Funspot – Port Richey, FL 1983", post by Gary (Funspot staff), 2011. <https://forums.arcade-museum.com/threads/stop-n-play-funspot-port-richey-fl-1983.207106/> | First-hand: a Florida roadside arcade on US 19 opened Nov 1983; the overnight fit-out was game set-up, a sound system and **replacing ceiling tiles**; planters out front; still trading 28 years later (V, anecdotal) | Suspended acoustic-tile ceiling (P height 3.0 m); front planters (§8) | A real 1983 Florida roadside arcade. |
| **VPH** | Atlas Arcadia, "Video Powerhouse", Miami 1982–1986 (user-contributed). <https://atlasarcadia.com/locations/video-powerhouse/> | A Miami family entertainment centre at 2501 Coral Way, 1982–86, reportedly over 100 games plus rides and dining (V, secondary) | Scale check: our 63 video + 10 pinball games is a mid-size arcade, not an FEC | Miami arcades of our years. |
| **BB1** | Burger Beast, "Remember These Lost Miami Amusement Centers from the 1980s?" (2026). <https://burgerbeast.com/miami-amusement-centers-1980s/> | Paraphrases a 1983 *Miami Herald* arcade guide (dozens of video games, rides, Mark Twain's Riverboat Playhouse in a mall); the blogger recalls trading tickets for prizes at Pirates (V, secondary, partly memoir) | The prize counter and redemption games (§8) | The Miami arcade mix in 1983. |
| **PL1** | *Play Meter*, 15 April 1985, p. 10, "Arrests made in New York & New Jersey" (International Arcade Museum eLibrary). <https://elibrary.arcade-museum.com/Play-Meter/1985-April-15/10> | Raids ("Slot Stop II") seized slot, **video poker** and horse-racing machines from locations. Police said poker machines were hard to prosecute because payouts had to be proved (V) | The video-poker back room; why it is hidden behind a blank storefront (P) | The trade press on gambling machines in arcades in our decade. |
| **UPI1** | UPI, "FBI agents smash video game piracy ring", 22 Sep 1984. <https://www.upi.com/Archives/1984/09/22/FBI-agents-smash-video-game-piracy-ring/8839464673600/> | FBI sting seized counterfeit Pac-Man, Ms. Pac-Man, Galaga and Time Pilot games worth $1 million. Industry estimate: up to 30 % of a $5–7 billion business lost to counterfeits (V) | The repair shop's stack of boards; a crooked operator buys bootleg boards (P) | The arcade trade's own organised crime, in our decade. |
| **AC1** | The Arcade Archives, "Arcade memories… Aladdin's Castle arcade from the 1980s" (2022). <https://arcadearchives.wordpress.com/2022/04/28/arcade-memories-aladdins-castle-arcade-from-the-1980s/> | Bally's arcade chain Aladdin's Castle grew from 20 locations (1974) to 221 (1980) and 360 (1989) (secondary; the figures trace to a fan wiki, so treat as approximate) | Arcades were a common chain tenant of malls (strip location is P); the change booth and the token economy (§8, P) | How common the type was. |
| **BL1** | BLEE Arcade, "Arcade Planning Guide" (2025). <https://www.bleearcade.com/arcade-planning-guide-how-much-space-you-need-for-a-full-game-center-setup/> | A modern operator guide: small arcade 80–150 m² with 15–25 machines; 200 m² holds 25–40 machines; main walkways 1.8–2.2 m, side walkways 1.2–1.5 m (V, modern) | Density check: 73 games in 360 m² (≈ 4.9 m² each) is just denser than BL1's modern 5–8 m² per machine (D) | A density yardstick (modern, so D only). |

**What the references do not give us:** a published floor plan of a 1980s
Miami Beach arcade. The plan is a typological composite (P). The strip-centre
shell and bay module come from SC1 and SC2, the cabinet sizes from PM2, and
the fit-out (ceiling tiles, change booth, prize counter) from FS1, BB1 and
AC1. The location is P: the east–west streets of North Beach (71st Street
and its neighbours) have one-storey commercial strips a block from the beach, but we cite no specific building.

## 3. Site and coordinate frame

Metres. **x** runs west → east (0–40), **z** runs north → south (0–31). The
building is x 2–38 × z 3–21 (36 × 18 m, one storey). 71st Street lies
south (the `side` sidewalk, z 21–24, then the `street` with its parking
lane, z 24–31). The service alley lies north (z 0–3). Gangways (x 0–2 and
x 38–40) run down both ends of the strip between the alley and the sidewalk.
The stage edges are the north side of the alley, the far side of the street,
and the outer sides of the gangways. Collins Avenue crosses one block east and
the beach lies just beyond it, off stage (P; it can be a backdrop).

Ceiling: a suspended tile ceiling at 3.0 m (P; FS1 records ceiling tiles).
There is one floor level and no steps.

Bays (6 m module, SC1): **west bay** x 2–14 (two modules: the back room,
count room and repair shop); **arcade bay** x 14–32 (three modules: the
arcade floor and rear corridor); **east bay** x 32–38 (one module: the
pinball annex, the restroom and the electrical room). Demising walls are at
x = 14 and x = 32.

### 3.1 Plan (generated from the sidecar; tables in §5–§6 are authoritative)

1 char = 1 m × 1 m cell; walls are drawn on the room's own edge cells, so
they look 1 m thick. `a` alley, `g` gangways, `s` sidewalk, `=` street,
`$` count room, `r` repair shop, `p` back room, `k` rear corridor,
`t` restroom, `e` electrical room (drawn as walls; 3 × 3 m), `.` arcade
floor, `n` pinball annex, `c` cabinet rows and islands, `b` change booth
and prize counter, `X` objective (safe; main panel), `C` player car.
Openings: `D` door, `+` storefront glass, blank gap in a wall = open
opening (D3, D4). CR1, CR6 and VP1 stand against walls and are hidden
under the wall cells (see §5.3).

```text
          111111111122222222223333333333
0123456789012345678901234567890123456789  x
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  z 0
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
gg#########D###############DD#########gg
gg#X$$$##rrrrDDkkkkkkkkkkkkkkkkDDt##X#gg
gg#$$$$##rrrr#########D#############D#gg  z 5
gg#$$$$DDrrrr#########D#############D#gg
gg#$$$$##rrrr##...........bbbbb##nnnn#gg
gg###D#########...........bbbbb  nnnc#gg
gg###D#########................  nnnc#gg
gg#pppppppppp##..ccccc..ccccc..##nnnc#gg  z 10
gg#ppppppppppDD..ccccc..ccccc..##nnnc#gg
gg#pppppppppp##................  nnnc#gg
gg#pppcccccpp##................  nnnc#gg
gg#pppcccccpp##..ccccc..ccccc..  nnnc#gg
gg#pppppppppp##..ccccc..ccccc..  nnnc#gg  z 15
gg#pppppppppp##..ccccc..ccccc..##nnnn#gg
gg#pppppppppp##................##nnnn#gg
gg#pppppppppp##................##nnnnDgg
gg#pppppppppp##..........bbbbbb##nnnn#gg
gg######D#######++++##DD###++++##++++#gg  z 20
ssssssssssssssssssssssssssssssssssssssss
ssssssssssssssssssssssssssssssssssssssss
ssssssssssssssssssssssssssssssssssssssss
========================================
========================================  z 25
================CCCCC===================
================CCCCC===================
========================================
========================================
========================================  z 30
```

## 4. Typology rules the layout must keep

1. **Strip-centre shell.** One storey, concrete block (`cbs_ext`), 18 m
   deep, on a 6 m bay module (SC1; D). Don't add a second storey, a
   basement or a mezzanine.
2. **Bays stay readable.** The demising walls at x = 14 and x = 32 stay in
   place (`stud_steel_gyp2`, MATERIALS §4). Where the arcade took the next
   bay, it cut openings (D3, D4) and kept a wall pier between them (SC2: a
   tenant combines bays). Don't remove a demising wall entirely.
3. **Storefront to the street, service to the alley.** Every bay faces
   71st Street. Every bay has a rear way out: the alley or, for the east bay, a gangway: the west
   bay by D11, the arcade bay by D7 (a double door for cabinet deliveries:
   0.63 m cabinets on a dolly, PM2), and the east bay by the side fire exit
   D14 (SC2, P).
4. **The public floor is on show.** The arcade's storefront glass (W1, W2,
   W3, D1) shows the whole lit floor to the street. That is how arcades
   advertised (P), and it is why the street and the hall see each other
   (S2, S7).
5. **The money is out of sight.** The west bay's storefront was filled in
   with block (`cbs_ext`, P). Its only street door is the steel "members"
   door D2. The count room has no outside wall to the street, no window, and
   only two doors: to the repair shop (D9) and to the back room (D10).
6. **The change booth faces the door.** The booth (BOOTH) sits on the rear
   wall of the arcade floor, raised, and looks over the islands at the front
   door D1 (S1) and across at the back-room door D5 (S15) (P, the usual
   attendant post). The raised floor is what lets it see over 1.73 m
   cabinets if W1 makes them block sight (§9 Q5).
7. **Cabinets to real sizes.** Uprights are 0.63 × 0.84 m (PM2). Islands
   are two rows back to back (1.7 m deep); wall rows are one deep. Pinball
   machines are about 0.74 × 1.4 m (P). Aisles are 1.6–3.4 m between
   props (1.6 m only between the booth and CR3). Most are wider than BL1's
   1.8–2.2 m main walkway, against its 1.2–1.5 m side walkways (G: room to
   move and fight between islands).
8. **At least two exits, far apart** (NFPA 7.4, 7.5, club.md §2). The design
   load is about 310 (§5.4), so two exits are the minimum. The arcade floor
   and annex have three to the outside (D1, D14 and, via the corridor, D7).
   D1 ↔ D14 = 15.3 m, more than half the floor-plus-annex diagonal (14.2 m).
   The back room (≈ 92, an assembly) has D2 and D5, 11.7 m apart, more than
   half its diagonal (8.5 m).

## 5. Area schedule (checkable)

Bounds are `[x0, z0, x1, z1]`. **Ent** counts doorways and openings a pawn
can walk through. Windows are not entrances. Where exterior areas meet, the
edge is unwalled and §5.2 lists it as an `open` row; their edges against
nothing are stage edges. Every other room edge is a wall. Builds refer to
MATERIALS §3.

### 5.1 Stage `arcade`

| id | Name | Kind | Bounds | Dims (m) | m² | Ent | Entrances | Research | Tag |
|---|---|---|---|---|---:|:-:|---|---|:-:|
| `alley` | Service alley | exterior | 0, 0, 40, 3 | 40 × 3 | 120.0 | 4 | D7, D11, D15, D16 (+ north stage edge) | SC2 | P |
| `walk_w` | West gangway | exterior | 0, 3, 2, 21 | 2 × 18 | 36.0 | 2 | D15, D17 (+ west stage edge) | — | P |
| `walk_e` | East gangway | exterior | 38, 3, 40, 21 | 2 × 18 | 36.0 | 3 | D14, D16, D18 (+ east stage edge) | — | P |
| `side` | 71st Street sidewalk | exterior | 0, 21, 40, 24 | 40 × 3 | 120.0 | 5 | D1, D2, D17, D18, D19 | — | P |
| `street` | 71st Street and parking lane | exterior | 0, 24, 40, 31 | 40 × 7 | 280.0 | 1 | D19 (+ stage edges) | — | P |
| `count` | Count room | secure | 2, 3, 8, 9 | 6 × 6 | 36.0 | 2 | D9, D10 | — | P |
| `shop` | Repair shop | service | 8, 3, 14, 9 | 6 × 6 | 36.0 | 3 | D8, D9, D11 | boards (UPI1) | P |
| `poker` | Back room (video poker) | lounge | 2, 9, 14, 21 | 12 × 12 | 144.0 | 3 | D2, D5, D10 | video poker (PL1) | P |
| `back` | Rear corridor and stock | circulation | 14, 3, 32, 6 | 18 × 3 | 54.0 | 4 | D6, D7, D8, D13 | stockroom (SC2) | P |
| `wc` | Restroom | bath | 32, 3, 35, 6 | 3 × 3 | 9.0 | 1 | D13 | — | P |
| `elec` | Electrical room | service | 35, 3, 38, 6 | 3 × 3 | 9.0 | 1 | D12 | — | P |
| `hall` | Arcade floor | assembly | 14, 6, 32, 21 | 18 × 15 | 270.0 | 5 | D1, D3, D4, D5, D6 | 3 bays (SC1) | D |
| `annex` | Pinball annex | assembly | 32, 6, 38, 21 | 6 × 15 | 90.0 | 4 | D3, D4, D12, D14 | 1 bay (SC1, SC2) | D |

Totals: enclosed 648.0 m² (8 rooms); exterior 592.0 m².

### 5.2 Doors and openings

`x=c` is a wall on the line x = c, with the opening centred at the stated z
(and vice versa). **Kind** maps to MATERIALS §3 builds; `open` is an opening
with no leaf; `glass` is a `glass_tempered_6` storefront door.

| Door | Rooms | Wall, centre | Width | Kind |
|---|---|---|---:|---|
| D1 | `hall` ↔ `side` | z=21, x 23 | 1.8 | glass (storefront pair; locked after midnight) |
| D2 | `poker` ↔ `side` | z=21, x 8 | 0.9 | door_metal ("members" door with a peephole) |
| D3 | `hall` ↔ `annex` | x=32, z 14 | 4.0 | open (cut in the demising wall) |
| D4 | `hall` ↔ `annex` | x=32, z 9 | 2.0 | open (cut in the demising wall) |
| D5 | `hall` ↔ `poker` | x=14, z 11 | 0.9 | door_solid ("PRIVATE") |
| D6 | `hall` ↔ `back` | z=6, x 22 | 0.9 | door_solid ("EMPLOYEES ONLY") |
| D7 | `back` ↔ `alley` | z=3, x 28 | 1.8 | door_metal (delivery pair) |
| D8 | `back` ↔ `shop` | x=14, z 4.5 | 0.9 | door_solid |
| D9 | `shop` ↔ `count` | x=8, z 6 | 0.9 | door_metal |
| D10 | `count` ↔ `poker` | z=9, x 5 | 0.9 | door_metal (cash window beside it, §8) |
| D11 | `shop` ↔ `alley` | z=3, x 11 | 0.9 | door_metal (west bay's rear door) |
| D12 | `elec` ↔ `annex` | z=6, x 36.5 | 0.9 | door_metal (locked; objective) |
| D13 | `wc` ↔ `back` | x=32, z 4.5 | 0.8 | door_hollow |
| D14 | `annex` ↔ `walk_e` | x=38, z 18 | 0.9 | door_metal (fire exit, panic bar) |
| D15 | `alley` ↔ `walk_w` | z=3, x 1 | 2.0 | open (whole edge) |
| D16 | `alley` ↔ `walk_e` | z=3, x 39 | 2.0 | open (whole edge) |
| D17 | `walk_w` ↔ `side` | z=21, x 1 | 2.0 | open (whole edge) |
| D18 | `walk_e` ↔ `side` | z=21, x 39 | 2.0 | open (whole edge) |
| D19 | `side` ↔ `street` | z=24, x 20 | 40.0 | open (kerb, whole edge) |

**Windows** (not entrances; storefront `glass_tempered_6`, which does
**not** block sight (STYLE-LEVELS §3.4) or bullets):

| Window | Rooms | Wall, centre | Width |
|---|---|---|---:|
| W1 | `hall` ↔ `side` | z=21, x 17.5 | 4.0 |
| W2 | `hall` ↔ `side` | z=21, x 28.5 | 4.0 |
| W3 | `annex` ↔ `side` | z=21, x 35 | 4.0 |

Egress checks (D, NFPA): D1 1.8 m serves the main-entrance half of the
floor-and-annex load (≈ 108 × 5 mm ≈ 0.5 m needed). D1 ↔ D7 = 18.7 m and
D1 ↔ D14 = 15.3 m.

### 5.3 Props with gameplay roles (sidecar `B`)

| id | Role | Footprint `[x0, z0, x1, z1]` | Size | Build | Coverage | Tag |
|---|---|---|---|---|---|:-:|
| BOOTH | Change booth (raised, plexiglass front) | 26.5, 6, 30.5, 8.4 | 4 × 2.4 | `counter_cabinet` | chest | P AC1 |
| CR1 | Cabinet row, west wall (9 uprights) | 14, 14.5, 14.85, 20.5 | 0.85 × 6 | `counter_cabinet` | full | D PM2 |
| CR2 | Cabinet island, back to back (12) | 17.5, 10, 21.3, 11.7 | 3.8 × 1.7 | `counter_cabinet` | full | D PM2 |
| CR3 | Cabinet island (12) | 24.5, 10, 28.3, 11.7 | 3.8 × 1.7 | `counter_cabinet` | full | D PM2 |
| CR4 | Cabinet island (12) | 17.5, 14.5, 21.3, 16.2 | 3.8 × 1.7 | `counter_cabinet` | full | D PM2 |
| CR5 | Cabinet island (12) | 24.5, 14.5, 28.3, 16.2 | 3.8 × 1.7 | `counter_cabinet` | full | D PM2 |
| CR6 | Cabinet row, annex west wall (6) | 32, 16.5, 32.85, 20.5 | 0.85 × 4 | `counter_cabinet` | full | D PM2 |
| PIN | Pinball row, annex east wall (10) | 36.6, 8, 38, 16 | 1.4 × 8 | `counter_cabinet` | waist | P |
| PRIZE | Prize counter (glass showcase) | 25.5, 19.6, 30.5, 20.4 | 5 × 0.8 | `counter_cabinet` | chest | P BB1 |
| VP1 | Video-poker row, back-room west wall (≈ 14) | 2, 10, 2.85, 19 | 0.85 × 9 | `counter_cabinet` | chest | P PL1 |
| VP2 | Poker bar (bar-top machines, 6 stools) | 6, 13, 10.5, 15 | 4.5 × 2 | `counter_cabinet` | chest | P PL1 |
| SAFE | Safe (secondary objective) | 2.2, 3.2, 3.2, 4.4 | 1 × 1.2 | `steel_10mm` | waist | P |
| COIN | Coin-counting table | 4, 3.2, 7, 4.2 | 3 × 1 | `counter_cabinet` | waist | P |
| BENCH | Repair bench | 9, 8.2, 13, 9 | 4 × 0.8 | `counter_cabinet` | waist | P |
| PANEL | Main electrical panel (objective) | 37.6, 3.4, 38, 5.6 | 0.4 × 2.2 | `steel_3mm` | full | P |
| CAR | Player car | 16, 26, 20.8, 27.9 | 4.8 × 1.9 | `car_door` | waist | P |

Upright cabinets are 1.73 m tall (PM2), so a row is `full` cover against a
standing pawn, but props never block sight (STYLE-LEVELS §3.4; §9 Q5).
Game count: 63 video uprights (CR1 9 + CR2–CR5 48 + CR6 6) and 10 pinballs
on the public side; about 20 poker machines in the back room. Island
spacing: 3.2 m between islands east–west, 2.8 m north–south. CR1 is 2.65 m
from CR4, the booth is 1.6 m from CR3, and the prize counter is 3.4 m from
CR5. The main aisle (x 21.3–24.5) runs from the front door D1 to the
corridor door D6.

### 5.4 Occupant load (D, NFPA Table 7.3.1.2)

| Zone | Net m² (less props) | Factor | Persons |
|---|---:|---|---:|
| Arcade floor | ≈ 225 | 1.39 (less concentrated) | 162 |
| Pinball annex | ≈ 75 | 1.39 | 54 |
| Back room | ≈ 127 | 1.39 | 92 |
| **Total** | | | **≈ 310** |

Under 500, so two exits are the minimum. The factor is D (club.md §2 NFPA).
This is a **design** load. After midnight the public side is empty, and only
the back room has patrons (§6.6).

## 6. Gameplay overlay (checkable targets)

### 6.1 Entries

| # | Entry | Arrives in | Use |
|---|---|---|---|
| E1 | Front door D1 (71st Street) | `side` → `hall` | Loud. The doors are locked after midnight. Shoot or breach the glass (§9 Q3). The change booth looks straight at them (S1). |
| E2 | "Members" door D2 | `side` → `poker` | The social route: knock and get let in as a gambler (W10 hook, §9 Q4). It opens into the lit, crowded back room; the count room's door D10 is at the far end. |
| E3 | Delivery doors D7 (the alley) | `alley` → `back` | Quiet. The rear corridor reaches the repair shop (D8, then D9 to the count room) and the arcade floor (D6) without the storefront. |
| E4 | West bay rear door D11 | `alley` → `shop` | The shortest way to the money: shop → count room (D9). |
| E5 | Fire exit D14 (east gangway) | `walk_e` → `annex` | Locked from outside (panic bar inside); breach it. The electrical-room door D12 is 12 m up the annex: the shortest interior route to the objective. |

The player arrives by car on 71st Street (`street`, CAR). The walk is
about 6 m to D1, 10 m to D2, 23 m to D14, and 45–50 m round a gangway to
the alley doors (D11 west, D7 east).

### 6.2 Sightlines (W1 query targets)

Standing eye 1.6 m to a standing target. Only `full` walls and **closed leaf
doors** block. The glass door D1, storefront windows W1–W3, the open
cuts D3 and D4, and every prop (including the 1.73 m cabinets) do not
block standing sight. Targets assume every leaf door is closed; an open leaf
still blocks rays that cross its swung position (STYLE-LEVELS §3.4).

| # | From → to | Length | Expected | Intent |
|---|---|---:|---|---|
| S1 | side (23, 22.5) → hall (28.5, 9) | 14.6 | **clear** | The change booth sees the front door through the glass: whoever is in the booth sees you coming. |
| S2 | street (17, 27) → hall (17, 12) | 15.0 | **clear** | From the car you can see the floor through the plate glass. Guards on the floor can see the street. |
| S3 | poker (8, 15) → hall (20, 18) | 12.4 | **blocked** | The demising wall and the closed door D5 hide the back room from the arcade floor. |
| S4 | hall (23, 18) → annex (35, 12) | 13.4 | **clear** | Through the wide cut D3, the floor sees into the annex. |
| S5 | side (8, 22.5) → poker (8, 15) | 7.5 | **blocked** | The steel members' door D2 and the block-filled storefront hide the back room from the street. |
| S6 | back (15, 4.5) → back (31, 4.5) | 16.0 | **clear** | The rear corridor is one straight lane: whoever holds an end owns it. |
| S7 | street (35, 28) → annex (35, 10) | 18.0 | **clear** | The annex window W3 shows the pinball row from the street. |
| S8 | hall (22, 7) → hall (23, 20.5) | 13.5 | **clear** | The main aisle runs from the corridor door D6 to the front door D1. |
| S9 | alley (1, 1.5) → alley (39, 1.5) | 38.0 | **clear** | The alley is one long lane past both rear doors and the delivery doors. |
| S10 | walk_e (39, 4) → walk_e (39, 20) | 16.0 | **clear** | The east gangway is a 2 m slot: anyone in it is exposed end to end. |
| S11 | count (5, 6) → shop (11, 6) | 6.0 | **blocked** | The count room's block wall and steel door D9 hide it from the shop. |
| S12 | annex (36.5, 8) → elec (36.5, 4.5) | 3.5 | **blocked** | Straight through the closed steel door D12: the objective can't be seen from the annex until D12 opens. |
| S13 | side (12, 22.5) → hall (20, 8) | 16.6 | **blocked** | From the sidewalk in front of the west bay, the block infill hides the back of the arcade floor. The front of the floor shows at an angle through W1, and anyone there can see you. |
| S14 | hall (15.5, 20) → hall (31, 7) | 20.2 | **clear** | Corner to corner across the floor, over and past the islands: its longest line. |
| S15 | hall (28.5, 8.8) → hall (14.5, 11) | 14.2 | **clear** | The change booth watches the back-room door D5: who goes in, and how often. |

### 6.3 Cover inventory

"Stops" quotes BALLISTICS §4 (retained energy, calibre order 9mm, 9mm SMG,
.45, .357, .50 AE, 5.56, 7.62×39, 12ga 00, 12ga slug, .50 BMG).

| Zone | Cover | Coverage | Stops | Notes |
|---|---|---|---|---|
| Shell, block-filled west storefront | `cbs_ext` | full | everything except 7.62×39 (3 %) and .50 BMG (85 %) | The alley and the gangways can't shoot in, except through doors. |
| Demising walls (x = 14, x = 32) | `stud_steel_gyp2` | full (sight only) | nothing (9mm keeps 64 %, buckshot 38 %) | Bay to bay is shoot-through. |
| Count room | `cmu_hollow` walls, `door_metal` D9 and D10 | full | walls: all but 7.62×39 (9 %) and .50 BMG (86 %); steel doors stop only buckshot (9mm keeps 27 %) | A block box whose doors are the weak points. |
| Corridor, restroom and electrical room partitions | `stud_steel_gyp` | full (sight only) | nothing (9mm keeps 84 %, buckshot 72 %) | Concealment. |
| Storefront W1–W3, D1 | `glass_tempered_6` | full (no sight block) | nothing (9mm keeps 93 %) | Not cover at all. |
| Upright cabinet, one deep (CR1, CR6, one face of an island) | `counter_cabinet` | full | nothing (9mm keeps 69 %, buckshot 47 %) | Looks solid, isn't (§9 Q2 on the CRT). |
| Island, through both rows | 2 × `counter_cabinet` | full | buckshot (stops in the second cabinet); 9mm keeps 38 %, .45 45 %, .357 58 %, 5.56 83 %, slug 91 % | The best concealment on the floor, and fair cover against pistols. |
| Change booth, prize counter, poker machines and bar | `counter_cabinet` | chest | nothing (9mm keeps 69 %) | Soft. |
| Pinball row | `counter_cabinet` | waist | nothing | Crouch cover from sight only. |
| Safe | `steel_10mm` | waist | everything except 5.56 (19 %), 7.62×39 (46 %), .50 BMG (66 %) | The only hard cover in the west bay. |
| Doors | `door_solid` / `door_metal` / `door_hollow` | full | solid: buckshot partly (31 % kept), 9mm keeps 60 %; metal: buckshot only (9mm 27 %); hollow: nothing | Every door is shoot-through. |
| Street | CAR, `car_door` / `car_engine` | waist | engine block stops everything; doors stop only buckshot (9mm keeps 51 %) | Hide behind the engine. |

### 6.4 Flank loops (each must be a closed walkable cycle)

Length is the sum of straight segments between consecutive door centres (a
lower bound).

| # | Cycle | ≈ Length | Intent |
|---|---|---:|---|
| L1 | `hall` –D3– `annex` –D4– `hall` | 10.0 m | A tight loop round the 2 m demising-wall pier between the two cuts: a dance between floor and annex. |
| L2 | `hall` –D6– `back` –D8– `shop` –D9– `count` –D10– `poker` –D5– `hall` | 37.2 m | The money loop: floor → corridor → shop → count room → back room → floor. |
| L3 | `hall` –D1– `side` –D2– `poker` –D5– `hall` | 40.1 m | Out the front, along the sidewalk, in at the members' door. |
| L4 | `hall` –D3– `annex` –D14– `walk_e` –D18– `side` –D1– `hall` | 37.8 m | Out the fire exit, down the gangway, back in at the front. |
| L5 | `back` –D7– `alley` –D15– `walk_w` –D17– `side` –D1– `hall` –D6– `back` | 88.7 m | Round the whole strip: alley, west gangway, sidewalk, floor, corridor. |
| L6 | `back` –D7– `alley` –D11– `shop` –D8– `back` | 34.4 m | Two rear doors on the alley: a short outside loop to flank the shop. |

**Checkable connectivity targets** (door ids removed = treat as walls):

| # | Check | Expected |
|---|---|---|
| C1 | Every room reachable on foot from `street` | yes |
| C2 | `street` → `hall` without D1 | yes, via D7 → D6, D14 → D3, or D2 → D5 |
| C3 | `street` → `count` without D10 | yes, via the shop (D11 or D8, then D9) |
| C4 | `street` → `count` without D9 and D10 | **no**: the count room has only two doors |
| C5 | `street` → `elec` without D12 | **no**: the objective room has one door |
| C6 | `street` → `poker` without D2 | yes, via the floor (D5) or the count room (D10) |
| C7 | `street` → `annex` without D3 and D4 | yes, via the fire exit D14 |

### 6.5 Approach variety

- **Loud:** front glass → down the main aisle under the booth's eye →
  through D3 into the annex → steel door D12 → panel.
- **Social / money:** members' door D2 → back room → count room (D10) →
  shop (D9) → corridor (D8) → floor (D6) → annex → panel. The whole of L2.
- **Quiet:** an alley door (D7 or D11) → corridor or shop → floor or count
  room. No storefront glass on the way.
- **Direct:** breach the fire exit D14; the panel door D12 is 12 m up the annex.

### 6.6 Spawns and enemy placement (by role, for W2 to tune)

- **Change booth (1):** an armed attendant (S1, S15).
- **Arcade floor (2–3):** guards walking the dark aisles; one by D5.
- **Annex (1):** a guard by the panel door D12.
- **Electrical room (0–1):** optionally a guard inside, at the panel.
- **Back room (2 + civilians):** two guards (door D2 and bar); 6–10 adult
  gamblers at VP1/VP2 as civilians who flee through D2 when shooting
  starts (§9 Q4).
- **Count room (1–2):** the counter at COIN; a bagman who runs for the
  alley via the shop (D9, D11).
- **Repair shop (1):** a technician at the bench.
- **Alley (1):** a lookout by a van at D7.
- **Reinforcements:** a car on 71st Street, using D1 and D2.
- **No kids.** "Not after midnight they don't" (W10d).

### 6.7 Penetration play notes (from BALLISTICS §4)

- **The bays are paper to each other.** Both demising walls are double-board
  drywall. A 9mm keeps 64 % through one, a .45 68 %. From the arcade floor
  you can shoot into the back room through the x = 14 wall. Through the
  wall and a poker machine on the far side, a 9mm still keeps 33 %
  (pen_model).
- **Islands are the floor's cover.** One cabinet is concealment (9mm keeps
  69 %). Shooting through a whole island (two cabinets back to back) leaves a
  9mm with 38 % and stops buckshot. Through a demising wall (double board,
  x = 14) and both rows of an island, a 9mm stops and 5.56 keeps 72 %. Through
  the single-board corridor wall (z = 6) and both rows, a 9mm keeps about
  22 % and 5.56 about 78 % (pen_model).
- **The count room is not paper.** Its `cmu_hollow` walls stop everything
  short of the AK (9 %) and the .50. The way in is through its steel doors,
  which a 9mm passes at 27 %.
- **The storefront is glass.** The street and the floor can shoot each
  other freely (9mm keeps 93 %). Reinforcements on 71st Street can fire
  into the hall through W1 and W2, and the player can do the same from the
  car.
- **The panel room.** Its drywall walls (9mm keeps 84 %) let you shoot a
  guard inside (if §6.6 puts one there) without opening D12. The panel's 3 mm steel stops 9mm, .45
  and buckshot (W5 decides whether shooting the panel counts as "unplugging"
  it; §9 Q1).

## 7. Construction summary

Where two rooms share a wall, the first matching row wins.

| Element | Build (MATERIALS §3) | Tag |
|---|---|---|
| Shell (every edge against an exterior area), including the block-filled west storefront | `cbs_ext` | D MATERIALS §4 (strip centre); P infill |
| Count room walls (to the shop at x = 8 and to the back room at z = 9) | `cmu_hollow` | P (cash room) |
| Demising walls x = 14 (`count`/`shop`/`poker` ↔ `back`/`hall`) and x = 32 (`back`/`hall` ↔ `wc`/`annex`) | `stud_steel_gyp2` | D MATERIALS §4; SC2 |
| Other partitions: `hall` ↔ `back`, `shop` ↔ `poker`, `wc` ↔ `elec`, `wc`/`elec` ↔ `annex` | `stud_steel_gyp` | D MATERIALS §4 |
| Storefront W1–W3 and door D1 | `glass_tempered_6` | D MATERIALS §4 |
| Other doors | per §5.2 | P |
| Cabinets, pinballs, poker machines, booth, prize counter, bench, coin table | `counter_cabinet` | D MATERIALS §4 (arcade cabinets ≈ `counter_cabinet`) |
| Main panel | `steel_3mm` | P (sheet-steel switchboard) |
| Safe | `steel_10mm` | P |

## 8. Props by zone (circa 1986)

- **Sidewalk:** a neon "STARLIGHT ARCADE" sign with a star burst over the
  glass, roll-down security grilles over W1–W3 (raised on the night, P),
  concrete planters (FS1), a bike rack, a newspaper box, a payphone by D2.
- **Arcade floor:** dark, lit by attract-mode screens and neon tubing on the
  soffits; upright cabinets of 1980–86 (Pac-Man, Ms. Pac-Man, Galaga, Time
  Pilot: UPI1, PM1), a few sit-down racers, a token-change machine on the
  wall, carpet with a starfield pattern, a dropped tile ceiling (FS1),
  trash cans, a "NO FOOD OR DRINK" sign, a high-score chalkboard (the "beat
  a high score first" hook).
- **Change booth:** raised floor, plexiglass front with a coin trough,
  token rolls, a cash drawer, a coin scale, a CCTV monitor, a buzzer for D5.
- **Prize counter:** glass showcase of plush toys, rubber snakes and
  sunglasses; ticket-redemption games beside it (BB1).
- **Pinball annex:** a row of pinball machines, an air-hockey table (P),
  beach-themed murals from the previous tenant's surf shop (P).
- **Back room:** low light, a carpet, video-poker uprights along the wall,
  a bar-top poker bar with stools, an ashtray on every machine, a TV with
  the Dolphins game, a cooler of beer, a cash window to the count room by
  D10, a sign "AMUSEMENT ONLY: NO PAYOUTS" (PL1's legal fig leaf).
- **Count room:** coin counter and wrapper, canvas coin bags, bank deposit
  bags, rolled quarters in trays, a ledger, the safe, a CCTV monitor of the
  floor.
- **Repair shop:** workbench with a test monitor, PCB racks of game boards
  (some bootleg, UPI1), a soldering station, cabinet shells, a dolly.
- **Rear corridor:** cabinet cartons, spare marquees, a mop sink, a time
  clock, a fire extinguisher.
- **Electrical room:** a grey main switchboard (PANEL), meters, conduit,
  a breaker schedule taped to the door.
- **Alley:** dumpster, a box van with an operator's logo, cabinet crates,
  air-conditioning condensers, a stray cat.
- **Street:** parked cars, a city bus stop, palm trees, the glow of the
  beach hotels one block east.

## 9. Open questions for W2, W1, W5 and W10

1. **Objective.** Is "unplug it" the main panel (one switch; the whole
   place goes dark, a strong set piece), every cabinet in turn (63 + 10
   interactions: too many), or the panel plus the count-room safe? Proposal:
   the panel is required, the safe is optional (the "Money" briefing
   choice). W10 to decide. If the panel can also be shot out, W5 needs a
   rule for that.
2. **CRT monitors.** A real upright has a 19″ CRT and a transformer inside.
   That glass and iron would stop more than a particle-board box. MATERIALS
   §4 maps cabinets to `counter_cabinet`, so this brief uses that build.
   W5 to decide whether a cabinet needs a stronger front (a CRT) and a
   soft side; that would be new MATERIALS data (a `crt_cabinet` row) and is
   not added here.
3. **Locked storefront.** After midnight D1 is locked glass. Proposal: it
   shatters as `glass_tempered_6` (any hit), which makes the front entry
   loud by nature. The roll-down grilles are raised (P) so the glass stays
   in play. W1/W10 to decide.
4. **Members' door.** Does D2 open to a knock (social entry, W10 dialogue),
   or only by force? And do the back-room gamblers count as civilians for
   scoring? W10 to decide.
5. **Cabinet sight.** Cabinets stand 1.73 m (PM2), above eye height, so in
   reality they block sight. STYLE-LEVELS §3.4 says props never block sight,
   so S1, S4, S8, S14 and S15 are clear over and past the islands. If W1
   makes `full` props block sight (club.md §9 Q6), S1 (CR3, CR5), S4 (CR5),
   S14 (CR4, CR3, BOOTH) and S15 (CR2) become blocked unless the raised booth
   gets an eye-height exception; W2 can then use the islands as sight screens. W1 to confirm.
6. **"On the beach."** The legacy map puts the beach directly south of the
   storefront. This brief puts 71st Street in front and the beach one
   block east, across Collins Avenue (P). Miami Beach strips face a street,
   not the sand, and Collins runs north–south along the shore.
   W10 to confirm the wording still fits.
