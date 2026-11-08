# The Recording Studio: floorplan reference and layout brief

> **Status:** W3 research deliverable (wave 1). This is docs only, not a runtime map.
> **Consumers:** W2 (level designer) builds the stage from it. W1's floorplan
> visualiser and query tools check the result against §5 and §6. W4 (decor)
> uses §8. W5 uses §6.7 and §7.
> **Mission brief:** levels.js line 117: *"Lex is financing a terrible pop
> album. Crash the session and make the singer tell you where Lex is
> hiding."* W10d script draft (Job 7, team file, not in the repo): header
> *"Every song ends. Make sure his ends tonight."*; McWey: *"They're at
> Sunset Sound tonight. Crash the session and get the singer to tell you
> where Lex sleeps."*; option *"Why crash it? I'll buy the session."*
> (`singer_paid`); *"Bring me the tapes as well, so nobody else ever has
> to."*
> **Evidence tags:** **V** verified from a cited source, **D** derived from
> sources, **P** proposed design choice (plausible, not measured), **G**
> gameplay override.
> **Validated:** area bounds, door and window geometry, reachability, m²
> totals, loops L1–L5, connectivity C1–C8 and sightlines S1–S15 were checked
> by script against the table data in §5–§6, plus a 0.6 m prop-free strip on
> both sides of every door and window (no overlaps; enclosed 1 040.0 m² +
> exterior 632.0 m² = 1 672.0 m² of walkable site).
> **Machine-readable layout:** `docs/levels/studio.layout.json` (STYLE-LEVELS
> §3.1), with `R`, `D`, `W` (glazing, including `glass_studio`), `B` (props
> with roles) and `S` (sightline targets).

---

## 1. Design intent

The legacy level (levels.js lines 117–132) is a 38 × 15 cell box: three
rooms north and three south of a corridor, each with a counter of consoles
(`K`), a road and parking to the south, two gaps out to it. Its partitions
(`%`) and the marked cell (`!`) are plain floor in the level legend
(`f: 43`), so the "rooms" are drawn on the floor and block nothing. It reads
as an office, not a studio: no control-room windows, no sound locks, no
booths, no machine room, no back door for the gear.

This brief keeps the legacy reading (rooms either side of one corridor,
parking south, consoles in several rooms) and makes it a real **mid-1980s
two-studio commercial facility** in North Miami, modelled on what is known
of Criteria (CR1–CR4) and on period studio profiles (ST1, ST2):

- **Two studios, each a suite.** A live room, a control room looking into
  it through a double-glazed window, a vocal booth or iso room off the live
  room, and a two-door sound lock from the corridor (ST3, ST5). Studio A is
  the big room; B is the overdub room (CR2).
- **A shared machine room** behind both control rooms, holding the
  24-track machines (CR4, which dates from 2000; P for 1986, §4 rule 4).
- **A quiet corridor** between the studios (north) and the front of house
  (south): reception, offices, the tape vault, the client lounge with its
  pool table (CR4), a programming suite for a 1986 pop record (EQ5–EQ7)
  and the artists' lounge with its own private entrance (CR2).
- **Back of house:** a loading bay with a roll-up door to the rear yard,
  next to the tech shop (ST2: a gear-loading side door).

**Gameplay frame.** It is about 11 p.m. and the session is on in Studio A.
The singer is in the vocal booth (`booth_a`) at the bottom of the deepest
box in the building: lot → reception → buzzer door → corridor → two
sound-lock doors → live room → booth door. The producer and engineer sit
behind the console in control room A, watching through the glass (S3).
Lex's bodyguards are in the lounges and the corridor. Every route to the
singer funnels through the sound lock (C3), and pistol rounds stop in the
control-room glass (§6.7), so the obvious approach is a door-by-door push.
Going round the back (the loading door) is quiet but long: it lands at the
east end, a corridor's length from Studio A. Its payoff is the machine
room: control room B → machine room → control room A (L1) takes the
producer from behind, without using the corridor door D7.

**Why a Miami studio, not Sunset Sound.** The script names Sunset Sound,
which is at 6650 Sunset Boulevard, Hollywood (SS1). The level is in Miami
(§9 Q1).

## 2. References and what each contributes

Images are not copied; read the sources at the links.

| id | Source | What it shows (evidence) | Used for | Why it matters |
|---|---|---|---|---|
| **CR1** | Criteria Studios, "History". <https://www.criteriastudios.com/history> | Founded 1958; Studio A built 1966–67; C completed 1972 (V) | A long-established North Miami studio in 1986 | Period fit. |
| **CR2** | W. Johnston, "Criteria", *Studio Sound*, July 1987, pp. 126, 128. <https://worldradiohistory.com/Archive-All-Audio/Archive-Studio-Sound/80s/Studio-Sound-1987-07.pdf#page=132> | Original building 30 × 60 ft; Studio A live room 46 × 67 × 22 ft (14.0 × 20.4 × 6.7 m); Studio D's control room 17 × 19 × 11 ft (5.2 × 5.8 × 3.4 m); the 1982 east wing with private entrances, client lounges, offices; Studio E with two isolation booths and floating floors; two SSL 6000E rooms and MCI JH-24 machines by 1987 (V) | Room sizes (`live_a`, `ctrl_b`), the iso room and booth, the artists' private entrance (D28), the lounges | The best period description of a Miami studio. |
| **CR3** | Criteria chronology, History of Recording. <https://www.historyofrecording.com/Criteria_Recording_Studios_Miami_FL_Carla_Harned.html> | Studio E built 1981 with a 56-channel MCI console, replaced by the first SSL in 1984; second SSL mid-1986; Studio D kept its MCI 532 into the early 1990s (V) | Console A (MCI, as Studio D's 532) and console B (SSL) | Exactly which desks a 1986 Miami studio had. |
| **CR4** | D. Daley, "The Merger of Two Classic Facilities", *Mix*, May 2000. <https://www.mixonline.com/recording/merger-two-classic-facilities-hit-factory-criteria-miami-373598> | Low-rise building, a parking lot, an entrance foyer and a **billiards lounge**, **shared machine rooms** (V, as of 1999–2000) | `mach`, the pool table in `lounge`, `lot` | Real features, though dated 2000, not 1986. |
| **CR5** | R. Buskin, "Classic Tracks: The Eagles 'Hotel California'", *Sound On Sound*, Sep. 2010. <https://www.soundonsound.com/techniques/classic-tracks-eagles-hotel-california> | Recorded at Criteria's Studio C in 1976 on a custom MCI console, with booths and gobos used to separate the band (V) | Gobos, booths, the outboard in `ctrl_a` | How a Criteria session was laid out. |
| **CR11** | *Primitive Love* (Miami Sound Machine), Wikipedia. <https://en.wikipedia.org/wiki/Primitive_Love> | Recorded 1984–85 at New River Studios (Fort Lauderdale) and International Sound (Miami) (S) | Not used for geometry (see below) | Not every Miami pop record was made at Criteria. |
| **CR12** | C. Pittman, "Behind the scenes in Miami's Criteria Recording Studios", *Flamingo*, Nov. 2024. <https://flamingomag.com/2024/11/11/behind-the-scenes-in-miamis-criteria-recording-studios/> | Basketball in the parking lot; Bee Gees sessions in the evenings and late into the night (S) | The night session | Night work was normal. |
| **SS1** | Sunset Sound, "Our History". <https://www.sunsetsound.com/about-us/> | 6650 Sunset Blvd, Hollywood, California; a converted auto-repair shop; three studios (V) | §9 Q1 | The script's name is a Los Angeles studio. |
| **ST1** | P. Hunt, "Studio of the Month: The Music Works", *International Musician*, Feb. 1985. <https://www.muzines.co.uk/articles/studio-of-the-month/5064> | Control room 6.10 × 5.49 m; live room 6.71 × 6.71 m with a 6.10 m ceiling; a relaxation room 6.71 × 3.05 m; two studios, TV lounge, kitchen (V) | `ctrl_a`, `live_a` height, `lounge`, `kitchen` | Measured mid-1980s rooms. |
| **ST2** | T. Reed, "Studio of the Month: The Strongroom", *International Musician*, July 1986. <https://www.muzines.co.uk/articles/studio-of-the-month/11021> | Control room 18 × 25 ft (5.5 × 7.6 m); live room 32 × 20 ft (9.8 × 6.1 m); reception, offices, lounge and kitchen; rear parking and a direct gear-loading side door; Otari MTR-90, DX7, AMS (V) | `ctrl_a` (6 × 8 m), `live_b`, `gear` and `yard`, `reception`, `mgr` | A 1986 studio with its whole support plan. |
| **ST3** | P. Gilby, "Building a Control Room Window", *Home & Studio Recording*, May 1984. <https://www.muzines.co.uk/articles/building-a-control-room-window/2884> | A 6 × 4 ft window; two panes of different thickness (9/10/12 mm) in separate frames, 200 mm apart, angled (V) | W1–W5 (`glass_studio`, MATERIALS S5) | The window build. |
| **ST4** | P. White, "Walls and Partitions", *Sound On Sound*, Oct. 1993. <https://www.muzines.co.uk/articles/practical-studio-design/10746> | Double stud walls, about 100 mm gap, two 12 mm plasterboard layers each side, mineral wool (V; 1993) | `acoustic_double` (MATERIALS cites S4, S5 for the approach; ST4 corroborates the build) | The wall build, from slightly later guidance. |
| **ST5** | National Park Service, Sound 80 (Minneapolis) NRHP nomination, pp. 7–9. <https://npgallery.nps.gov/NRHP/GetAsset/47ac4339-883c-4e98-9499-ef514206e9bf> | A preserved 1970–71 studio: corridor → sound lock → live and control rooms; separate heavy doors; kitchen, offices, storage; control windows of double ¼ in plate glass (V) | `lock_a`, `lock_b`, the corridor plan | A surviving period plan. |
| **EQ2** | Blevins Audio, "MCI JH-16/JH-24". <https://www.blevinsaudio.net/JH16-24geninfo.html> | JH-24 built 1980–88 (S) | TM1, TM2 | Period tape machine (MCI was in Fort Lauderdale; CR2). |
| **EQ3** | Solid State Logic, "Our History". <https://www.solidstatelogic.com/our-history> | SL 4000E introduced 1979 (V) | Console B | Period desk. |
| **EQ5** | Roger Linn, "Museum". <https://www.rogerlinndesign.com/about/about-museum> | LinnDrum 1982, about $3,000; Linn Electronics closed Feb. 1986 (V) | `midi` | Period drum machine. |
| **EQ6** | Yamaha Design Laboratory, "DX7". <https://www.yamaha.com/en/tech-design/design/insights/id_009/> | Released 1983 (V) | `midi`, `live_b` | The sound of 1986 pop. |
| **EQ7** | "Sampling Synths", *Electronic Soundmaker*, Oct. 1983. <https://www.muzines.co.uk/articles/sampling-synths/3159> | Fairlight CMI sampling; about £18,000 (V) | `midi` | A premium studio's showpiece. |
| **EQ8** | "Tape Maintenance", *Home & Studio Recording*, Apr. 1984. <https://www.muzines.co.uk/articles/tape-maintenance/2860> | Store masters tails-out, cool, away from magnetic fields; boxes labelled with artist, songs, speed, format, date (V) | `vault` and its dressing; "the tapes" objective | Where the masters are and what they look like. |

**Not used, and why.** Middle Ear (the Bee Gees' private studio, 1980–2005)
and Quadradial are known only from secondary listings. Studio Center's
Miami Lakes building dates from 1990. Miami Sound Machine's *Primitive
Love* was cut at New River (Fort Lauderdale) and International Sound
(Miami) (CR11, S), a reminder that not every Miami pop record was made at
Criteria. Criteria's 1986 floorplan, wall construction and security
arrangements were not found: the plan here is a composite (P).

## 3. Site and coordinate frame

Metres. **x** runs west → east (0–44), **z** runs north → south (0–38). The
building is x 0–40 × z 3–29, one storey (P; Criteria's 1982 wing had an
upper floor, CR2, but a single storey suits the level). The rear yard and
loading area lie north (z 0–3), a driveway runs down the east side (x
40–44) and the parking lot lies south (z 29–38). The stage edges are the
north side of the yard, the east side of the driveway, the south side of
the lot and x = 0.

Heights (P): live room A 6 m (ST1 6.1 m), live room B 4.5 m, control rooms
3.4 m (CR2), the rest 2.7 m. One floor level; studio floors float on a
pad, but sit flush (MATERIALS S4).

### 3.1 Plan (generated from the sidecar; tables in §5–§6 are authoritative)

```
0         1         2         3         4   
01234567890123456789012345678901234567890123
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaCCCCCaaaaaaaaaa  z 0
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaCCCCCaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaCCCCCaaaaaaaaaa
###################################DDD##aaaa
#xxxLLLLLxxx##xxmmmmmmmx##LLLLLL##ggggx#aaaa
#xxxLLLLLLLL##mmmmmmmmmm##LLLLLLDDggggx#aaaa  z 5
#xxxLLxLLLLL####D#####D###LLLLLLDDggggx#aaaa
#LLLLLxLLLLL####D#####D###LLLLLL##ggggx#aaaa
#LLLLLxLLLLL++xxcc##cccx++LLLLLL####D###aaaa
#LLLLLLLLLLL++xxcc##cccx++LLLLLL####D###aaaa
#LLLLLLLLLLL##xxcc##cccx##LLLLLL##ggggx#aaaa  z 10
#D+##D##D##+##xxcc##cccx##D##D#+##ggggx#aaaa
#D+##D##D##+##xxcc##cccx##D##D#+##ggggx#aaaa
#bb##k##bbxx##cccc##cccc##k##bbb##ggggx#aaaa
#####D##########D#####D###D#########D###aaaa
#####D##########D#####D###D#########D###aaaa  z 15
##D#### #####D#####D#####D########D####Daaaa
##D#### #####D#####D#####D########D#####aaaa
#tt##oooo##vvvv##....##rrrr##rrrrrrrrrr#aaaa
#tt##oooo##vvvv##....##rrrr##rrrrrrrrrr#aaaa
######  ###vvvv##....##rrrr##xxxxxxrrrr#aaaa  z 20
######  ###vvvv##....##rrrr##rrrrrrrrrr#aaaa
#oooooooo########....########rrrrrrrrrr#aaaa
#oxxooooo########....##########D########aaaa
#oxxooooo##xxxr##....##rrrr####D########aaaa
#oxxooooo##rrrr##xxxx##rrrr##oooooooooo#aaaa  z 25
#oxxooxxx##rrrrDDxxxxDDrrrr##ooooooooooDaaaa
#oooooxxx##rrrr##....##rrrr##oooooooxxx#aaaa
##DD##+++###++####DD++##++######++++####aaaa
============================================
============================================  z 30
============================================
=====CCCCCC=====CCCCCC======================
=====CCCCCC=====CCCCCC======================
============================================
============================================  z 35
============================================
============================================
```

Key: `#` wall, `D` door leaf, `+` glazing (control and booth windows are
`glass_studio`), space = open opening; `L` live rooms, `b` booths and iso
room, `k` sound locks, `c` control rooms, `m` machine room, `g` gear store
and tech shop, `.` corridor and reception, `o` lounges and kitchen, `t`
restroom, `v` tape vault, `r` offices, copy room and programming suite, `a`
yard and drive, `=` lot; props: `x` furniture and equipment, `C` vehicles.
The `z` labels give the row's north coordinate. Cells are 1 m.

## 4. Typology rules the layout must keep

1. **Every live room has a control room with a window.** The control room
   looks into its live room through a `glass_studio` window (W1, W2), and
   each booth or iso room has its own window to the live room (W3–W5).
2. **Live rooms are entered through a sound lock.** Two `door_solid` doors
   with a small lobby between them (ST5; MATERIALS §4 "door_solid ×2 sound
   lock"). There is no other door from the corridor into a live room.
3. **Studio walls are double.** Every wall of a live room, booth, iso room,
   sound lock or control room is `acoustic_double` (ST4), except outer
   walls (`cbs_ext`).
4. **The tape machines are in a machine room**, not the control room,
   entered from both control rooms (P/G: CR4 describes shared machine
   rooms at Criteria in 2000; in 1986 the multitrack often stood in the
   control room. Kept because it gives L1, the route behind the control
   rooms).
5. **Gear comes in the back.** A roll-up door from the yard into the gear
   store, which opens straight into a live room (ST2). The public never
   sees the gear.
6. **Front and back are separate.** The public part (reception, offices,
   lounges) is south of the corridor. The buzzer door D2 is the only way
   a visitor at reception gets into the studios. The client lounge and
   kitchenette are semi-public: clients reach them from the corridor, and
   their patio slider D31 is locked from inside (G: breaking its glass is
   the loud back door). Artists use their own entrance (D28) from the
   driveway (CR2).

## 5. Area schedule (checkable)

Bounds are `[x0, z0, x1, z1]`. **Ent** counts doorways and openings a pawn
can walk through. Windows are not entrances. Where exterior areas meet, the
edge is unwalled and §5.2 lists it as an `open` row; their edges against
nothing are stage edges. Every other room edge is a wall. Builds refer to
MATERIALS §3.

### 5.1 Stage `studio`

| id | Name | Kind | Bounds | Dims (m) | m² | Ent | Entrances | Research | Tag |
|---|---|---|---|---|---:|:-:|---|---|:-:|
| `yard` | Rear yard and loading | exterior | 0, 0, 44, 3 | 44 × 3 | 132.0 | 2 | D15, D29 (+ north stage edge) | ST2 | D |
| `drive` | Side driveway | exterior | 40, 3, 44, 29 | 4 × 26 | 104.0 | 4 | D18, D28, D29, D30 (+ east stage edge) | — | P |
| `lot` | Parking lot | exterior | 0, 29, 44, 38 | 44 × 9 | 396.0 | 3 | D1, D30, D31 (+ stage edges) | CR4, CR12 | P |
| `live_a` | Studio A live room | studio | 0, 3, 13, 12 | 13 × 9 | 117.0 | 3 | D4, D5, D6 | ST1, CR2 | G |
| `booth_a` | Studio A vocal booth | studio | 0, 12, 4, 15 | 4 × 3 | 12.0 | 1 | D5 | CR2 | P |
| `lock_a` | Studio A sound lock | circulation | 4, 12, 7, 15 | 3 × 3 | 9.0 | 2 | D3, D4 | ST5 | D |
| `iso_a` | Studio A drum isolation room | studio | 7, 12, 13, 15 | 6 × 3 | 18.0 | 1 | D6 | CR2 | D |
| `mach` | Machine room (shared) | service | 13, 3, 25, 7 | 12 × 4 | 48.0 | 2 | D8, D9 | CR4 | D |
| `ctrl_a` | Studio A control room | studio | 13, 7, 19, 15 | 6 × 8 | 48.0 | 2 | D7, D8 | ST1, ST2 | D |
| `ctrl_b` | Studio B control room | studio | 19, 7, 25, 15 | 6 × 8 | 48.0 | 2 | D9, D10 | CR2 | D |
| `live_b` | Studio B live room | studio | 25, 3, 33, 12 | 8 × 9 | 72.0 | 3 | D12, D13, D14 | ST2 | D |
| `lock_b` | Studio B sound lock | circulation | 25, 12, 28, 15 | 3 × 3 | 9.0 | 2 | D11, D12 | ST5 | D |
| `booth_b` | Studio B vocal booth | studio | 28, 12, 33, 15 | 5 × 3 | 15.0 | 1 | D13 | CR2 | P |
| `gear` | Gear store and loading bay | service | 33, 3, 40, 9 | 7 × 6 | 42.0 | 3 | D14, D15, D16 | ST2 | D |
| `tech` | Tech shop | service | 33, 9, 40, 15 | 7 × 6 | 42.0 | 2 | D16, D17 | — | P |
| `hall` | Studio corridor | circulation | 0, 15, 40, 17 | 40 × 2 | 80.0 | 12 | D2, D3, D7, D10, D11, D17, D18, D19, D20, D22, D24, D26 | ST5 | D |
| `wc` | Restroom | bath | 0, 17, 4, 21 | 4 × 4 | 16.0 | 1 | D19 | — | P |
| `kitchen` | Kitchenette | kitchen | 4, 17, 10, 21 | 6 × 4 | 24.0 | 2 | D20, D21 | ST1, ST5 | D |
| `lounge` | Client lounge and billiards | lounge | 0, 21, 10, 29 | 10 × 8 | 80.0 | 2 | D21, D31 | CR4, ST1 | D |
| `vault` | Tape vault | service | 10, 17, 16, 23 | 6 × 6 | 36.0 | 1 | D22 | EQ8 | P |
| `office` | Producer's office | office | 10, 23, 16, 29 | 6 × 6 | 36.0 | 1 | D23 | ST5 | P |
| `reception` | Reception | circulation | 16, 17, 22, 29 | 6 × 12 | 72.0 | 4 | D1, D2, D23, D25 | ST2 | D |
| `copy` | Tape copy room | service | 22, 17, 28, 23 | 6 × 6 | 36.0 | 1 | D24 | — | P |
| `mgr` | Studio manager's office | office | 22, 23, 28, 29 | 6 × 6 | 36.0 | 1 | D25 | ST2 | P |
| `midi` | Programming suite | studio | 28, 17, 40, 24 | 12 × 7 | 84.0 | 2 | D26, D27 | EQ5–EQ7 | P |
| `lounge_b` | Artists' lounge | lounge | 28, 24, 40, 29 | 12 × 5 | 60.0 | 2 | D27, D28 | CR2 | D |

Totals: enclosed 1 040.0 m² (23 rooms); exterior 632.0 m².

Sizes against the sources: control room A (48 m²) is ST2's 5.5 × 7.6 m
(42 m²) rounded up; control room B matches the depth of Criteria D's 5.2 × 5.8 m control room (CR2).
Live room A (117 m²) is G: Criteria A's live room is 286 m² (CR2) and
ST2's is 60 m²; 117 m² keeps a big-room feel without swallowing the level. Live room B (72 m²) is ST2's
live room. The booths and iso room (12–18 m²) are P, sized after CR2's isolation
booths in Studio E (no dimensions given) and CR5's booths.

### 5.2 Doors and openings

`x=c` is a wall on the line x = c, with the opening centred at the stated z
(and vice versa). **Kind** maps to MATERIALS §3 builds; `open` is an opening
with no leaf; `glass` is a `glass_tempered_6` door or window; `glass_studio`
is the control-room build.

| Door | Rooms | Wall, centre | Width | Kind |
|---|---|---|---:|---|
| D1 | `reception` ↔ `lot` | z=29, x 19 | 1.8 | glass (front doors) |
| D2 | `reception` ↔ `hall` | z=17, x 19 | 0.9 | door_solid (buzzer door, locked from reception) |
| D3 | `hall` ↔ `lock_a` | z=15, x 5.5 | 0.9 | door_solid (sound lock, outer) |
| D4 | `lock_a` ↔ `live_a` | z=12, x 5.5 | 0.9 | door_solid (sound lock, inner) |
| D5 | `live_a` ↔ `booth_a` | z=12, x 1 | 0.9 | door_solid (booth door) |
| D6 | `live_a` ↔ `iso_a` | z=12, x 8.5 | 1.2 | door_solid (iso room door) |
| D7 | `hall` ↔ `ctrl_a` | z=15, x 16 | 0.9 | door_solid (control room A) |
| D8 | `ctrl_a` ↔ `mach` | z=7, x 16 | 0.9 | door_solid (machine room) |
| D9 | `mach` ↔ `ctrl_b` | z=7, x 22 | 0.9 | door_solid (machine room) |
| D10 | `ctrl_b` ↔ `hall` | z=15, x 22 | 0.9 | door_solid (control room B) |
| D11 | `hall` ↔ `lock_b` | z=15, x 26.5 | 0.9 | door_solid (sound lock, outer) |
| D12 | `lock_b` ↔ `live_b` | z=12, x 26.5 | 0.9 | door_solid (sound lock, inner) |
| D13 | `live_b` ↔ `booth_b` | z=12, x 29.5 | 0.9 | door_solid (booth door) |
| D14 | `live_b` ↔ `gear` | x=33, z 6 | 1.8 | door_solid (double gear door into live B) |
| D15 | `gear` ↔ `yard` | z=3, x 36.5 | 3.0 | door_metal (roll-up loading door, down) |
| D16 | `gear` ↔ `tech` | z=9, x 36.5 | 1.2 | door_solid |
| D17 | `tech` ↔ `hall` | z=15, x 36.5 | 0.9 | door_solid |
| D18 | `hall` ↔ `drive` | x=40, z 16 | 0.9 | door_metal (fire exit, panic bar) |
| D19 | `wc` ↔ `hall` | z=17, x 2 | 0.8 | door_hollow |
| D20 | `kitchen` ↔ `hall` | z=17, x 7 | 0.9 | open (kitchenette) |
| D21 | `kitchen` ↔ `lounge` | z=21, x 7 | 1.5 | open |
| D22 | `vault` ↔ `hall` | z=17, x 13 | 0.9 | door_metal (vault, locked) |
| D23 | `office` ↔ `reception` | x=16, z 26 | 0.9 | door_solid |
| D24 | `copy` ↔ `hall` | z=17, x 25 | 0.9 | door_solid |
| D25 | `mgr` ↔ `reception` | x=22, z 26 | 0.9 | door_solid |
| D26 | `midi` ↔ `hall` | z=17, x 34 | 0.9 | door_solid |
| D27 | `midi` ↔ `lounge_b` | z=24, x 31 | 0.9 | door_solid |
| D28 | `lounge_b` ↔ `drive` | x=40, z 26.5 | 0.9 | door_metal (artists' private entrance) |
| D29 | `yard` ↔ `drive` | z=3, x 42 | 4.0 | open (driveway) |
| D30 | `drive` ↔ `lot` | z=29, x 42 | 4.0 | open (driveway) |
| D31 | `lounge` ↔ `lot` | z=29, x 3 | 1.8 | glass (lounge patio slider, locked from inside) |
| W1 | `live_a` ↔ `ctrl_a` | x=13, z 9.5 | 2.4 | glass_studio (control window A) |
| W2 | `ctrl_b` ↔ `live_b` | x=25, z 9.5 | 2.4 | glass_studio (control window B) |
| W3 | `live_a` ↔ `booth_a` | z=12, x 3 | 1.2 | glass_studio (booth window) |
| W4 | `live_a` ↔ `iso_a` | z=12, x 11.5 | 1.2 | glass_studio (iso window) |
| W5 | `live_b` ↔ `booth_b` | z=12, x 31.5 | 1.2 | glass_studio (booth window) |
| W6 | `lounge` ↔ `lot` | z=29, x 7.5 | 3.0 | glass (window) |
| W7 | `office` ↔ `lot` | z=29, x 13 | 2.0 | glass (window) |
| W8 | `reception` ↔ `lot` | z=29, x 21 | 1.6 | glass (window) |
| W9 | `mgr` ↔ `lot` | z=29, x 25 | 2.0 | glass (window) |
| W10 | `lounge_b` ↔ `lot` | z=29, x 34 | 4.0 | glass (window) |

### 5.3 Props with gameplay roles (sidecar `B`)

Footprints keep a 0.6 m clear strip on both sides of every door and window.

| id | Role | Footprint `[x0, z0, x1, z1]` | Size | Build | Coverage |
|---|---|---|---|---|---|
| CON_A | Console A (MCI JH-600 class, 56-channel) | 14.8, 8, 16, 12.5 | 1.2 × 4.5 | `counter_cabinet` | waist |
| CON_B | Console B (SSL 4000E) | 23, 8, 24.2, 12.5 | 1.2 × 4.5 | `counter_cabinet` | waist |
| SOFA_A | Producer's couch | 18, 8, 18.9, 11 | 0.9 × 3 | `sofa` | waist |
| TM1 | 24-track tape machine A (MCI JH-24) | 14, 3.3, 15.2, 4.3 | 1.2 × 1 | `steel_3mm` | chest |
| TM2 | 24-track tape machine B | 23.3, 3.3, 24.5, 4.3 | 1.2 × 1 | `steel_3mm` | chest |
| RACK | Outboard and patch racks | 17.5, 3.3, 20.5, 4 | 3 × 0.7 | `counter_cabinet` | chest |
| PIANO | Grand piano | 1.5, 4, 3.1, 6.7 | 1.6 × 2.7 | `counter_cabinet` | waist |
| GOBO1 | Gobo (movable acoustic screen) | 6, 6, 6.3, 8.5 | 0.3 × 2.5 | `particle_divider` | chest |
| GOBO2 | Gobo | 9, 4.5, 11.5, 4.8 | 2.5 × 0.3 | `particle_divider` | chest |
| DRUMS | Drum riser and kit | 10.3, 13, 12.5, 14.6 | 2.2 × 1.6 | `particle_divider` | waist |
| POOL | Pool table | 2.5, 23.5, 3.9, 26.2 | 1.4 × 2.7 | `counter_cabinet` | waist |
| LSOFA | Lounge sofa | 6.5, 26.5, 9.5, 27.4 | 3 × 0.9 | `sofa` | waist |
| KC | Kitchen counter | 4.1, 18, 5, 20.9 | 0.9 × 2.9 | `counter_cabinet` | waist |
| VS1 | Tape shelving | 10.2, 18, 10.8, 22.7 | 0.6 × 4.7 | `counter_cabinet` | full |
| VS2 | Tape shelving | 15.2, 18, 15.8, 22.7 | 0.6 × 4.7 | `counter_cabinet` | full |
| DESK | Reception desk | 17, 25.5, 21, 26.4 | 4 × 0.9 | `counter_cabinet` | chest |
| ODESK | Producer's desk | 11, 24, 14, 25 | 3 × 1 | `counter_cabinet` | waist |
| MIDI | Programming desk (Fairlight, LinnDrum, DX7) | 29, 20, 35, 21 | 6 × 1 | `counter_cabinet` | waist |
| BSOFA | Artists' sofa | 36, 27.5, 39.3, 28.4 | 3.3 × 0.9 | `sofa` | waist |
| CASES | Flight cases | 38, 4, 39.6, 8 | 1.6 × 4 | `counter_cabinet` | chest |
| BENCH | Tech bench | 38, 10, 39.7, 14.2 | 1.7 × 4.2 | `counter_cabinet` | waist |
| VAN | Gear van | 29, 0.4, 34, 2.3 | 5 × 1.9 | `car_door` | waist |
| LIMO | Singer's limousine | 5, 32, 11, 33.9 | 6 × 1.9 | `car_door` | waist |
| CAR | Player car | 16.5, 32, 21.3, 33.9 | 4.8 × 1.9 | `car_door` | waist |

The consoles face their windows: an engineer sits on the console's room
side and looks through the glass. Tape machines are `steel_3mm` (P: a steel
transport cabinet).

### 5.4 Who is in the building at 11 p.m. (P)

A session needs a producer, an engineer and an assistant in control room A,
the singer in the booth, two or three session players, a receptionist or
night manager, and an entourage in the lounges. Studio B is dark or doing a
late overdub (an engineer and one player). With Lex's guards that is about
20 people, half of them non-combatants (§6.6, §9 Q3).

## 6. Gameplay overlay (checkable targets)

### 6.1 Entries

| # | Entry | Arrives in | Use |
|---|---|---|---|
| E1 | Front doors D1 | `lot` → `reception` | The front: reception sees you coming (S1) and the buzzer door D2 is locked. With `singer_paid`, the receptionist buzzes you in. |
| E2 | Lounge patio slider D31 | `lot` → `lounge` | Glass, locked from inside: break it (loud), or wait for a smoker to open it. Through the kitchenette to the corridor's west end, nearest Studio A's sound lock (D3). |
| E3 | Artists' entrance D28 | `drive` → `lounge_b` | Steel, locked; breach it. Through the programming suite to the corridor's east end. |
| E4 | Fire exit D18 | `drive` → `hall` | Steel, panic bar inside; breach it. Straight into the corridor's east end. |
| E5 | Loading door D15 | `yard` → `gear` | The roll-up door, down. Breach it (or find it open, with the gear van parked alongside) and come in behind Studio B through D14, or through the tech shop. |

The player parks in the lot (CAR). Walking distances from the front doors
D1, door centre to door centre as in §6.4: 28.6 m to Studio A's inner lock
door D4 (via D2, D3), 22.8 m to Studio B's (D12, via D2, D11). Through the
lounge slider D31 instead: 18.4 m to D4 (via D21, D20, D3).

### 6.2 Sightlines (W1 query targets)

Standing eye 1.6 m to a standing target. Only `full` walls and **closed
leaf doors** block. Every glass window, including `glass_studio`, and
every prop do not block sight (STYLE-LEVELS §3.4). Targets assume every
leaf door is closed; an open leaf still blocks rays that cross its swung
position. The roll-up loading door D15 rolls up rather than swinging: once
raised or breached it clears the whole doorway.

| # | From → to | Length | Expected | Intent |
|---|---|---:|---|---|
| S1 | lot (19, 31) → reception (19, 22) | 9.0 | **clear** | From the lot through the glass front doors: reception sees you park. |
| S2 | reception (19, 20) → hall (19, 16) | 4.0 | **blocked** | The buzzer door hides the studio corridor from reception. |
| S3 | ctrl_a (17, 10) → live_a (6, 10) | 11.0 | **clear** | Through control window A: the producer at the console watches the whole live room. |
| S4 | ctrl_b (21, 10) → live_b (30, 10) | 9.0 | **clear** | Through control window B into live room B. |
| S5 | hall (1, 16) → hall (39, 16) | 38.0 | **clear** | The studio corridor is one 38 m lane from end to end. |
| S6 | hall (5.5, 16) → live_a (5.5, 9) | 7.0 | **blocked** | Two sound-lock doors hide live room A from the corridor. |
| S7 | live_a (2, 9) → booth_a (3, 14) | 5.1 | **clear** | Through the booth window: the live room sees the singer, and the singer sees it. |
| S8 | ctrl_a (16, 9.5) → ctrl_b (22, 9.5) | 6.0 | **blocked** | The two control rooms are blind to each other (shared acoustic wall). |
| S9 | lot (34, 31) → lounge_b (34, 26) | 5.0 | **clear** | The artists' lounge window faces the lot. |
| S10 | live_b (28, 6) → gear (37, 6) | 9.0 | **blocked** | The double gear door hides the gear store from live room B. |
| S11 | lot (8, 31) → lounge (8, 23) | 8.0 | **clear** | The client lounge window faces the lot. |
| S12 | yard (36.5, 1) → gear (36.5, 6) | 5.0 | **blocked** | The roll-up loading door, down, hides the gear store from the yard. |
| S13 | live_a (11, 8) → iso_a (11.5, 14) | 6.0 | **clear** | Through the iso window: the drummer sees the live room. |
| S14 | drive (42, 16) → hall (30, 16) | 12.0 | **blocked** | The fire-exit door hides the corridor from the driveway. |
| S15 | lot (13, 31) → office (13, 26.5) | 4.5 | **clear** | The producer's office window faces the lot. |

### 6.3 Cover inventory

"Stops" quotes BALLISTICS §4 and pen_model (retained energy; calibre order
9mm, .45, .357, 12ga 00, 12ga slug, 5.56, 7.62×39).

| Zone | Cover | Coverage | Stops | Notes |
|---|---|---|---|---|
| Outer walls | `cbs_ext` | full | everything except 7.62×39 (3 %) and .50 BMG | The outside can't shoot in, except through doors and glass. |
| Studio walls (live rooms, booths, locks, control rooms, machine room) | `acoustic_double` | full (sight only) | nothing (9mm keeps 60 %, buckshot 32 %) | Soundproof, not bulletproof. |
| Control and booth windows W1–W5 | `glass_studio` | full (no sight block) | 9mm, .45, Uzi (9mm_smg), buckshot; .357 keeps 10 %, .50 AE 66 %, slug 81 %, 5.56 62 % | Stops most handguns but not the magnums; you can see through it (§6.7, §9 Q4). |
| Sound lock (two `door_solid`) | `door_solid` ×2 | full | buckshot at the second door (9mm keeps 19 %) | Two doors in a row. |
| Front-of-house partitions | `stud_steel_gyp` | full (sight only) | nothing (9mm keeps 84 %) | Concealment. |
| Tape vault | `cmu_hollow` | full | everything except 7.62×39 (9 %) and .50 BMG | The safest room in the building. |
| Tape machines TM1, TM2 | `steel_3mm` | chest | 9mm pistol, .45, buckshot; Uzi keeps 20 %, .357 27 %, .50 AE 54 % | The best cover in the machine room. |
| Consoles, racks, desks, piano, pool table, cases | `counter_cabinet` | waist / chest | nothing (9mm keeps 69 %, buckshot 47 %) | Soft. |
| Sofas | `sofa` | waist | nothing (9mm keeps 51 %, buckshot 16 %) | Soft. |
| Gobos, drum riser | `particle_divider` | chest / waist | nothing | Concealment. |
| Lot and yard | vehicles (`car_door` / `car_engine`) | waist | engine stops everything; doors only buckshot | Cars as cover. |

### 6.4 Flank loops (each must be a closed walkable cycle)

Length is the sum of straight segments between consecutive door centres (a
lower bound).

| # | Cycle | ≈ Length | Intent |
|---|---|---:|---|
| L1 | `hall` –D7– `ctrl_a` –D8– `mach` –D9– `ctrl_b` –D10– `hall` | 28.0 m | Round the back of both control rooms through the machine room. |
| L2 | `hall` –D11– `lock_b` –D12– `live_b` –D14– `gear` –D16– `tech` –D17– `hall` | 32.5 m | Through Studio B and out the back through the gear store. |
| L3 | `lot` –D1– `reception` –D2– `hall` –D18– `drive` –D30– `lot` | 69.2 m | In the front, out the fire exit, round by the drive. |
| L4 | `lot` –D31– `lounge` –D21– `kitchen` –D20– `hall` –D26– `midi` –D27– `lounge_b` –D28– `drive` –D30– `lot` | 99.1 m | The whole front of house, lounge to lounge. |
| L5 | `lot` –D30– `drive` –D29– `yard` –D15– `gear` –D16– `tech` –D17– `hall` –D2– `reception` –D1– `lot` | 96.1 m | Round the back to the loading door, through the building, out the front. |

**Checkable connectivity targets** (door ids removed = treat as walls):

| # | Check | Expected |
|---|---|---|
| C1 | Every room reachable on foot from `lot` | yes |
| C2 | `lot` → `hall` without D2 | yes (D31, D18, D28 or D15) |
| C3 | `lot` → `live_a` without D4 | **no**: the sound lock is the only way into Studio A |
| C4 | `lot` → `gear` without D15 | yes, via the corridor and the tech shop, or Studio B |
| C5 | `lot` → `ctrl_b` without D10 | yes, via control room A and the machine room |
| C6 | `lot` → `vault` without D22 | **no**: the tape vault has one door |
| C7 | `lot` → `lounge` without D31 | yes, via the kitchenette |
| C8 | `lot` → `live_b` without D12 | yes, via the gear store (D14) |

### 6.5 Approach variety

- **Bought in (`singer_paid`):** front doors, buzzed through D2, walked to
  the session. Combat starts only if Lex's men object.
- **Front push:** front doors, shoot the buzzer door's lock, corridor west
  to the sound lock D3–D4, then the live room. Two doors in a row is a
  slow, loud breach.
- **The smokers' door:** break the lounge slider D31 (or catch a smoker
  coming out), kitchenette, and out into the corridor 1.5 m from Studio A's
  lock. The shortest route to the singer, but breaking the glass is heard
  in the lounge.
- **Round the back:** the loading door D15 into the gear store, through
  Studio B (D14, D12, D11) or the tech shop. Then either west along the
  corridor (S5: 38 m with no cover; use the doorways), or a short hop to
  control room B (D10) and through the machine room into control room A
  (D9, D8) from behind.
- **Through the control room:** take control room A (D7) first, so the
  engineer stops the session and the producer can't warn the live room;
  the glass shows you the whole live room (S3) but stops your pistol
  (§6.7).

### 6.6 Spawns and enemy placement (by role, for W2 to tune)

The legacy map has eleven enemies (`g` ×3, `u` ×2, `s`, `d`, `b`, `m`,
`x`, and an unarmed `i`) and three pickups (knife `5`, SMG `3`, double barrel `8`). Keep
the count, sorted by role:

- **Studio A (2):** a bodyguard in the live room by the booth (S7), one in
  the sound lock or by D3. Legacy `u`, `s`.
- **Control room A (1 + civilians):** a guard behind the producer's couch;
  the producer and engineer are civilians. Legacy `g`.
- **Lounges (3):** the entourage at the pool table and in the artists'
  lounge. Legacy `b`, `x`, `i`.
- **Corridor and reception (2):** a guard at each end of the corridor
  (S5), a doorman at reception. Legacy `g`, `d`.
- **Back of house (2):** the gear store and the tech shop. Legacy `m`,
  `g`.
- **Studio B (1):** an overdub, one guard. Legacy `u`.
- **Pickups:** the knife in the kitchenette, the SMG in the tech shop, the
  double barrel in the singer's limousine.
- **The singer** is in `booth_a` and must survive to talk (§9 Q2). **The
  tapes** are on TM1 in the machine room, or boxed in the vault (§9 Q5).

### 6.7 Penetration play notes (from BALLISTICS §4 and pen_model)

- **Soundproof is not bulletproof.** `acoustic_double` lets a 9mm through
  with 60 % of its energy, buckshot 32 %. Two studio walls: 9mm 20 %, 5.56
  78 %. A firefight in a live room puts rounds into the next room.
- **The glass nearly is.** `glass_studio` (two laminated leaves, 20 cm
  apart) stops 9mm (pistol and Uzi), .45 and buckshot; a .357 keeps 10 %,
  a .50 AE 66 %, a slug 81 %, 5.56 62 %. A guard behind the control-room
  window is safe from most handguns and can see you. Bring a magnum, a
  rifle or a slug, or go round.
- **The singer is behind both.** The booth window W3 is `glass_studio` and
  the booth walls are `acoustic_double`: a stray rifle round in the live
  room can kill the singer through the wall (9mm keeps 60 %). Keep fire
  away from `booth_a` (§9 Q2).
- **The vault is the hard room.** `cmu_hollow` stops everything but the
  7.62×39 (9 %) and .50 BMG.
- **Through the console:** a studio wall and a console in a row still pass
  a 9mm at 29 %.

## 7. Construction summary

The first matching row wins.

| Element | Build | Basis |
|---|---|---|
| Outer walls (to the yard, the drive, the lot and the x = 0 edge) | `cbs_ext` | D MATERIALS §4 (Recording studio row) |
| Every other wall of a live room, booth, iso room, sound lock, control room or the machine room | `acoustic_double` | D MATERIALS §4; ST4 |
| Tape vault walls | `cmu_hollow` | P (fire-rated storage, EQ8) |
| Corridor's south wall and all front-of-house partitions; gear store and tech shop walls not covered above | `stud_steel_gyp` | D MATERIALS §4 (offices) |
| Control and booth windows W1–W5 | `glass_studio` | D MATERIALS §4; ST3 |
| Front doors, lounge slider, office and lounge windows | `glass_tempered_6` | P |
| Sound-lock and studio doors | `door_solid` | D MATERIALS §4 ("door_solid ×2 sound lock") |
| Exterior steel doors, vault door, roll-up loading door | `door_metal` | P |
| Consoles, racks, desks, cases | `counter_cabinet` | D MATERIALS §4 (consoles) |
| Tape machines | `steel_3mm` | P |

## 8. Props by zone (circa 1986)

- **Control room A:** a long MCI console, as Studio D's 532 (CR3) under a meter bridge, near-
  field monitors on the bridge (Yamaha NS-10s), big soffit-mounted
  monitors over the window, a producer's couch, a patch bay, an ashtray, a
  rack of outboard (AMS, Lexicon, 1176s; ST2, CR5).
- **Control room B:** an SSL 4000E (EQ3), a Fairlight terminal on a side
  desk.
- **Machine room:** two brown MCI JH-24 machines (EQ2), a 2-track for
  mixdown, racks with blinking meters, cooling fans.
- **Live room A:** a grand piano, drum gobos, mic stands with pop filters,
  headphone boxes, cables taped to the floor, a Persian rug, wood slat and
  fabric walls, a big clock.
- **Vocal booth A:** a Neumann on a stand, a music stand with the lyrics, a
  stool, a "QUIET — RECORDING" light over the lock (red: on).
- **Studio B:** a DX7 (EQ6), a bass rig, a LinnDrum (EQ5) feeding the desk.
- **Programming suite:** the Fairlight CMI with its light-pen screen (EQ7),
  stacks of floppy disks, a 4-track for demos.
- **Tape vault:** steel shelving of two-inch tape boxes, tails-out, labelled
  in marker with artist, song, speed, date (EQ8). The singer's masters,
  boxed and labelled.
- **Corridor:** gold and platinum discs in frames, studio rules on a board,
  the session sheet on a clipboard.
- **Reception:** a desk with a multi-line phone and the buzzer, a sofa,
  music magazines, a fern.
- **Client lounge:** a pool table (CR4), a TV with MTV on, a fridge full of
  beer, a pinball machine.
- **Artists' lounge:** a white leather sofa, a mirror on the table, a
  bottle of champagne on ice.
- **Gear store and yard:** flight cases stencilled with the band's name, a
  hand truck, the gear van parked in the yard alongside the roll-up door; the singer's
  white stretch limousine in the lot.

## 9. Open questions for W2, W5 and W10

1. **"Sunset Sound."** The script's studio is real and in Hollywood (SS1).
   Rename it for Miami (a fictional name, or "Criteria" by allusion only)?
   W10 to decide.
2. **The singer.** He must survive to talk. Can stray fire through the
   booth's `acoustic_double` walls kill him (§6.7)? If so, the level needs
   a fail state; if not, he needs a scripted exemption. W10 and W5 to
   decide.
3. **Civilians.** The producer, engineer, players and receptionist are
   non-combatants (§5.4). Do they flee (through which door?), hide, or
   count against scoring? W10 to decide.
4. **The glass.** pen_model has `glass_studio` stopping 9mm and .45. Real
   ballistic glazing rated for 9mm (UL 752 Level 1) is about 30 mm of
   laminate; this window is 22 mm of glass with a gap, so the model may be
   generous. MATERIALS tags the `glass_lam` resistance P. W5 to check.
5. **The tapes.** "Bring me the tapes as well." Is that an optional
   objective, and are the tapes on the machine (TM1, in the machine room)
   or boxed in the vault (one steel door, C6)? W10 to decide.
6. **The roll-up door.** D15 is a 3 m roll-up modelled as `door_metal`,
   wider than STYLE-LEVELS §1.2's 2.4 m door pair and tougher than a
   real slat shutter (MATERIALS `corrugated`: 9mm keeps about 85 %). Same
   convention and question as mall §9 Q1. W5 to decide.
7. **The ending.** The header ("Make sure his ends tonight") and the brief
   (make him talk) pull in different directions. W10 to confirm whether
   the singer may be killed after he talks.
