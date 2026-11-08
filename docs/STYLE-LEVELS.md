# Neon Vice level style guide: realistic, checkable floorplans

> **Status:** W3 research deliverable (wave 1). Docs only.
> **Consumers:** W2 (level designer) follows it when building stages. W1's
> floorplan visualiser and query tools use the conventions in §3 to check a
> stage against its level doc. W4 (decor) uses §5. Reviewers use §6.
> **Companion docs:** `docs/research/MATERIALS.md` (wall builds and the
> palette by typology), `docs/research/BALLISTICS.md` (what goes through
> what), `docs/levels/<mission>.md` (one reference brief per mission).

---

## 1. Principle: real building first, then bend it for play

A level should read as a real 1986 Miami building that the player could
find on a map, not as a set of arena rooms. Every level doc starts from
documented buildings and states each departure from them.

1. **Pick the typology before drawing rooms.** A 1950s motel, a 1930s Deco
   hotel, a 1980s condo tower, a marina, a strip centre, a mall, a studio, a
   yacht. The typology fixes circulation (exterior walkways or interior
   corridors), structure (masonry or frame), the wall palette and the plausible
   entries. Document it in §4 of the level doc as numbered rules.
2. **Use real dimensions.** Rooms start at the research sizes in the level doc.
   Anything enlarged for movement or combat is tagged **G** with its research
   size next to it, so W2 knows what is deliberate. Use 1 unit = 1 m. Keep
   doors 0.8–1.0 m (1.1 m lifts and service, 1.2–2.4 m pairs and open
   arches) and corridors 1.2–1.8 m, galleries 1.5–1.8 m. Use
   typical floor heights (motel 3.0 m, tower 3.3 m).
3. **Circulation must be honest.** People, staff and goods each need a way in.
   Real buildings have a front door, a service route and fire exits; use them
   as the player's entries rather than inventing vents. Fire stairs come in
   pairs and are not reached only through a private room.
4. **Structure does not move.** Cores, columns and exterior walls are
   fixed by the building. Partitions are the designer's freedom. This is
   also where cover comes from (§2).
5. **Asymmetry and history.** Real buildings grow in phases and get
   remodelled. A wing that is shorter, an added porte-cochère or a knocked-
   through wall makes the place feel lived in. Avoid mirror-symmetric plans
   unless the reference is symmetric.
6. **Composite, never copied.** Each level is a composite of several cited
   buildings. Cite plans by link and description; do not copy or trace plan
   images.
7. **Period dressing.** Props are what was available in 1986 (Sears
   Wishbook F1 is the check). No modern renovations in the reference
   listings (induction hobs, quartz, flat screens, impact glazing).

## 2. Materials make the gameplay

The wall build decides whether a wall is cover or concealment
(MATERIALS §4; BALLISTICS §4). Pick builds from the typology palette in
MATERIALS §4; exceptions need a reason in the level doc.

- **Masonry levels** (motel, Deco club, strip centre): rooms are boxes.
  Pistols and buckshot stop in block, so fights go through doors and windows.
  Rifles and slugs slowly open firing ports.
- **Frame levels** (penthouse, mall fit-out, studio offices): every interior
  wall is penetrable by every gun. Cover comes from the core, columns and
  a few deliberate masonry rooms. Positioning beats hiding.
- **Mixed levels** (marina, yacht): steel and GRP hulls, sheds and offices
  give a gradient.

Every level doc includes a **cover inventory** stating which surfaces stop
what (with BALLISTICS §4 percentages), and **penetration play notes**: the
places where shooting through a wall is the intended play.

Coverage (height) is separate from build: `full`, `chest`, `waist`, `rail`,
`glass` (MATERIALS §3). Do not invent other classes in level docs.

## 3. Checkable-target conventions (for W1's visualiser and query tools)

Each level doc must state the following so tools can compare the built stage
with the brief. Use these formats exactly.

### 3.1 Frame

- Axes: **x east, z south**, origin at the north-west corner of the
  building (state it if different). Metres.
- Stage ids and bounds `[x0, z0, x1, z1]`, floor-to-floor height, and the
  `dy` offset of any backdrop stage.
- **Wall model.** Walls are zero-thickness lines on room bounds. Every edge
  shared by two rooms with no door on it is a `full` wall unless the doc's
  builds table says otherwise. Plate and terrace edges, fixed glass and
  rails are walls for movement but not for sight (except `glass_block`,
  §3.4). Closed leaf doors are walls for sight; glass doors (`glass`) are not.
- **Machine-readable layout.** Each level doc has a sidecar
  `docs/levels/<mission>.layout.json` holding `R` rows
  `[id, name, kind, x0, z0, x1, z1]` and `D` rows
  `[id, roomA, roomB, axis, wallCoord, centre, width, kind]`. Optional keys:
  `W` windows (same shape as `D`, kind a glass build; not entrances), `B`
  large props with roles `[id, role, x0, z0, x1, z1, build]` (e.g. boats) and
  `S` sightline targets `[id, [x, z], [x, z], "clear"|"blocked"]`. Where two
  rooms of kind `exterior` or `pier` meet, the shared edge is unwalled and
  must be covered by `open` `D` rows; their edges against nothing are open
  (stage edge or a drop to water). Every other room edge is a wall. The tables in the doc must match it; the tools read the JSON.

### 3.2 Room schedule

One row per room, per stage:

| id | Name | Kind | Bounds | Dims (m) | m² | Ent | Entrances | Research | Tag |
|---|---|---|---|---|---:|:-:|---|---|:-:|

- **id**: lower_snake_case, unique per stage, stable across revisions
  (W1 queries by id). Repeated rooms use a numbered pattern (`r101`…).
- **Kind**: proposed `rooms[].kind` value (`service`, `circulation`,
  `living`, `bedroom`, `bath`, `closet`, `office`, `core`, `secure`,
  `exterior`, `guest`, …).
- **Bounds**: axis-aligned rectangle. Non-rectangular rooms are split into
  rectangles with suffixes (`great_a`, `great_b`) and the doc says they are
  one room.
- **m²**: to one decimal place. Give stage totals so the tool can check that
  nothing is missing or overlapping.
- **Ent**: count of walkable openings (doors, open doorways, sliders).
  **Windows are not entrances.** List the door ids.
- **Ent** may be `open` for an exterior area with no countable openings
  (a car park, a pool deck); say so in the row.
- **Research**: the target size from references, or "—". **Tag**: V, D, P or G.
- An optional **Stage** column is required when one doc covers several
  stages.
- Extra columns (roof, builds, role) are allowed; the columns above are the
  minimum. `motel-sunset.md` predates this guide and carries research sizes
  and tags in its text rather than in columns.

### 3.3 Door table

| Door | Rooms | Wall, centre | Width | Kind |
|---|---|---|---:|---|

`x=c` names a wall on the line x = c with the door centred at the stated z
(and vice versa). **Kind** is a MATERIALS §3 build (`door_hollow`,
`door_solid`, `door_metal`, `glass_tempered_6` as `glass`) or `open` for a
doorway with no leaf.

### 3.4 Sightlines

| # | From → to | Length | Expected | Intent |
|---|---|---:|---|---|

- Points as `room (x, z) → room (x, z)`, standing eye 1.6 m to a standing
  target, unless the row states a stance.
- **Expected** is `clear` or `blocked` (no third value). For standing
  sight, only `full` walls, closed leaf doors (any kind except `glass`) and
  `glass_block` windows block. Chest
  (1.2 m) walls block crouched sight only (eye 1.0 m); waist, rail and glass
  never block sight. Props and floor steps never block (user decision Q9).
- **Translucent glass.** A `W` row of kind `glass_block` blocks sight like
  a `full` wall but stops bullets only as glass (MATERIALS §3): concealment,
  not cover. Every other `W` kind is clear glass and never blocks sight.
- **Doors.** A door leaf is a physical object at whatever angle it is swung
  to (W1b traces it). Opening a door clears the doorway, not the leaf: a
  partly or fully open leaf still blocks any ray that crosses it. A doorway
  with no leaf (`open`) never blocks. Unless a row says otherwise, sightline
  targets are stated with every leaf door **closed**; a row that depends on
  a door being open names the door and its state.
- The stance (chest/crouched) and `door_vault` semantics above are W3's
  research inputs for the future W1c contract gate; they do not change the
  current legacy adapter.
- Include **blocked-by-design** lines: they protect reveals and stop one
  position raking a whole floor.
- **Intent** is mandatory. A sightline with no intent is not a target.

### 3.5 Loops and connectivity

- Flank loops as door-id paths: `room → Dn → room → … → start`, with
  approximate length. Each must be a closed walkable cycle. Length is the
  sum of straight segments between consecutive door centres (a lower bound).
  `Dn (or Dm)` means either door closes the loop.
- Connectivity targets in the form "removing edge Dn still leaves a path
  A → B", plus "every non-shaft room is reachable from every entry".

### 3.6 Entries, spawns and cover

- Entries table (`E1`…): opening, arrival room and its use.
- Spawn table by zone, count, role and behaviour hint. These are intent for W2
  to tune, not final numbers.
- Cover inventory (§2).

## 4. Writing for W2 (the level designer)

Dimensions alone do not build a good level. Each level doc must also give:

- **Design intent** (§1 of every level doc): what the player should feel,
  how the building is read on arrival, where the difficulty gradient runs,
  and what the typology contributes to play.
- **Reference rationale**: for each cited building, what is borrowed and
  *why* that reference was chosen over others.
- **Typology rules** as a short numbered list W2 must keep, so W2 can rework
  partitions freely without breaking realism.
- **The gameplay overlay**: entries, sightlines, cover, loops, spawns and
  penetration notes, each with intent.
- **Open questions** addressed to W1 or W2 by name.

W2 may change any **P** or **G** item if the checkable targets still hold
or the doc is updated with the reason, but never in a way that breaks the
doc's typology rules (§4 of the level doc). **V** and **D** items change
only with a new reference.

## 5. Decor boards by room kind (for W4)

Defaults for circa-1986 Miami. Level docs override per room in their §8.

| Kind | Board |
|---|---|
| Motel guest room | Twin or queen beds with chenille spreads, bolted CRT TV, bedside lamp, AC sleeve unit, luggage rack, wall art (flamingo or palm prints), jalousie window, terrazzo floor |
| Motel office / lobby | Reception counter, key board, postcard rack, vending machine, ceiling fan, vinyl chairs, neon VACANCY sign |
| Condo living / great room | White leather sectional, glass-and-chrome tables, lacquer, brass, Arco-style lamps, rack stereo, console CRT + VCR, large palms, abstract canvases, mirrored walls |
| Dining / bar | Lacquered table, upholstered chairs, chandelier, mirrored back bar, stools |
| Kitchen | Laminate counters, almond or white appliances, countertop microwave, wall phone with a long cord |
| Bedroom (high-end) | Platform bed, mirrored wardrobes, bench, dresser, lamps, telephone |
| Bath (high-end) | Double vanity, sunken tub, brass fittings, pastel tile |
| Bath (motel) | Pastel tile, pedestal sink, shower-tub, mirror cabinet |
| Office / study | Desk, leather chair, corded phone, electric typewriter, filing cabinets, safe |
| Service / back of house | Shelving, mop buckets, linen trolleys, fuse boards, fluorescent tubes |
| Club / bar (Deco) | Neon, booths, glass block, chrome bar stools, DJ booth, mirror ball |
| Marina / dock | Fuel pumps, bollards, rope, coolers, bait fridges, outboard motors, tackle racks, life rings |
| Exterior night | Sodium street lights, neon signs, palms, parked period cars, payphones |

## 6. Review checklist for a level doc

- [ ] Typology stated and backed by at least two cited references (links and
      descriptions only).
- [ ] Every room has an id, bounds, dims, m², entrance count with door ids,
      research size and tag.
- [ ] Stage totals given; no overlaps; every room reachable.
- [ ] Door table with kinds that exist in MATERIALS §3.
- [ ] At least 8 sightlines, including blocked-by-design ones, each with intent.
- [ ] At least two flank loops and the connectivity targets.
- [ ] Two independent ways out of every occupied floor.
- [ ] Builds from the MATERIALS §4 palette, exceptions explained.
- [ ] Cover inventory and penetration notes consistent with BALLISTICS §4.
- [ ] Props by zone, period-checked.
- [ ] Open questions addressed to a named workstream.

## 7. Level docs

| Mission | Doc | Status |
|---|---|---|
| Motel Sunset | `docs/levels/motel-sunset.md` | wave 1 |
| The Penthouse | `docs/levels/penthouse.md` | wave 1 |
| Vice Marina | `docs/levels/marina.md` | wave 1 |
| Club Flamingo | `docs/levels/club.md` | wave 1 |
| Arcade | `docs/levels/arcade.md` | wave 1 |
| Mall | `docs/levels/mall.md` | wave 1 |
| Studio | `docs/levels/studio.md` | wave 1 |
| Royal Flush (yacht) | `docs/levels/yacht.md` | wave 1 |

### 7.1 Migration task: `motel-sunset.md`

The motel doc predates this guide. To make it tool-checkable, W3 (or W2)
should: add door ids and a §3.3 door table; give loops as door-id paths;
reduce three-way sightline results to `clear` or `blocked`; replace the Ent
values "open" and "3 gates + 1 door" with a count plus door ids (`open` only
for exterior areas); replace `cov: none` with a §2 class or drop it; split
the non-rectangular remainder room into rectangles; and add the layout
sidecar JSON.
