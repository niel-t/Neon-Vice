# Level plan format v1 (W2a)

`plan.js` defines the global `PLAN`. It turns a level designer's room-level
plan into a WORLD stage record for `WORLD.compile` (see WORLD-SCHEMA.md), plus
extras that compile does not take. Plans live in `plans/<id>.js` and register
on the global `PLANS` (`PLANS.motel = {...}`). A plan is data only. The game
does not load any plan yet; no level has switched to one.

Per user decision Q9, this is not a cell grid. Plans are 2.5D: each stage is
one floor, with rooms as polygons in metres and no overlapping floors on one
stage. Multi-storey sites use one stage per floor, linked by `stairs`.

## 1. Shape

```js
PLANS.motel = { id: 'motel', v: 1, name: 'Motel Sunset', stages: { lot: {...}, f2: {...} } };
```

Coordinates are metres: x runs east and z runs south. Stage keys:

| key | meaning |
|---|---|
| `bounds [x0,z0,x1,z1]` | Brief bounds. The emitted stage pads them by 0.5 m so that boundary walls fit. |
| `combat`, `elevated`, `floorH` | Copied to the stage or extras. On an `elevated` stage, any edge open to nothing is an error ("drop edge"). |
| `defaults` | `{shell:'cbs_ext', part:'cmu_hollow', inner:'stud_wood_gyp', h:2.8, surf:'concrete'}`, each overridable. |
| `rooms` | `{id, rect:[x0,z0,x1,z1] \| poly, zone:'interior'\|'exterior', kind, style, name, in, part, shell, h, y, surf, roof, combat, sealed}`. `kind` is the room's function from the closed set in docs/levels/STYLE.md §1 (`special` = no decor kit); a missing or unknown kind warns. `style` (`motel`\|`high_end`\|`deco`\|`marine`\|`commercial`) overrides the plan-level `style` and passes through to stage rooms for W4 decor kits. |
| `edges` | Overrides: `{rooms:[a, b\|null\|[...]], none:true \| build, cov, h}`. `null` means the void outside the stage. |
| `doors` | `{id, rooms:[a,b], at:[x,z], w, kind: <door build> \| 'open' \| 'glass', double, slide, hinge:'n'\|'s'\|'e'\|'w'\|'start'\|'end', y1}` |
| `windows` | `{id, rooms:[a,b], at, w, y0=0.9, y1=2.1, build='glass_annealed_6', cov='glass'}` |
| `walls` | Free-standing walls `{id, path, build, cov, h}` (fences, planter kerbs). |
| `ground` | Extra ground polygons `{id, poly, y, surf}` (pools, steps). |
| `props` | `{id, at, size:[w,d], rot, build, cov, h}` or `{id, poly, ...}`. |
| `spawns` | `{id, kind:'player'\|'arrive'\|'enemy'\|'civ'\|'item'\|'exit', at, role, a}` |
| `stairs` | `{id, room, at, to:<stage>, arrive:<spawn id>, rise}` |
| `obj` | `{id, kind, room?, at, what?}`. `kind` is `target` (destroy or kill), `use` (interact) or `exit` (an alternative to C). `room` defaults to the plan room at `at` and must match it. MISSIONS `clear:{boss, need, exits}` references these ids (W14). |
| `stash`, `items`, `backdrop` | Passed to extras for W14 and the mesher. |
| `finish` | `{wall:{key:tile}, floor:{key:tile}}` atlas tile ids (0–255) for the mesher (§9). A plan-level `finish` applies to every stage; stage keys override it. Keys must be a room id, parent id, room kind, ground `surf`, `exterior` or `interior`. |
| `targets` | Brief checks: `area {room:m²}`, `ent {room:n}`, `entries {outside:[rooms], n}`, `sight [{id, from, to, stance, open:[door ids], expect:'clear'\|'blocked'}]`, `links [{from, to, without}]`, `loops [{id, rooms:[a,b,…,a]}]` (consecutive rooms joined by distinct walkable portals) |

Room nesting (`in`) is explicit, and a child must lie inside its parent. Rooms
with the same parent must not overlap. Exterior rooms (yards, lots, walks)
hold interior rooms.

## 2. Walls: derived, not drawn

Walls come from room edges. On each boundary segment between rooms A and B:

1. An `edges` override wins (`none` means open; `build` forces a wall).
2. If neither room is interior, there is no wall (yard to street is open).
3. If one room is interior, the wall uses that room's inherited `shell`, else `defaults.shell`.
4. If both rooms are interior in the same unit (the outermost interior
   ancestor), the wall uses the deeper room's `part`. Siblings must agree;
   otherwise the parent's `part`, then `defaults.inner`, applies. If the
   rooms are in different units, the wall uses `defaults.part` (a demising
   wall).

Collinear segments with the same build chain into one wall path with joints.
Each wall gets a stable id `wl_<a>_<b>`. Doors and windows are located on the
chain that holds the shared edge. A leaf door must clear the junction, its
wall ends, and the corner mitre inset (WORLD's rule), or fromPlan reports it.

## 3. Output and stage rooms and portals (the W1 contract)

`PLAN.fromPlan(plan, sid)` returns `{stage, extras, info}`.

- `stage` is a strict WORLD v2/v3 stage record: `bounds`, `ground`, `walls`
  (with openings), `props`, `rooms`, `portals` and `spawns`. It is
  JSON-clean and deterministic.
- **Stage rooms are simple polygons with no holes** (agreed with W1 for v3).
  A parent whose children make holes in it is split into simple pieces. One
  piece keeps the room id; several become `<id>.1`, `<id>.2`… ordered by min
  z, then min x. Each piece carries `parent` (and `name`/`kind` as
  metadata). Splitting needs the parent and its children to be axis-aligned
  for now. Seams run through hole vertices and avoid doors and windows, so
  an opening never straddles two pieces.
- **Portals** use the strict forms `{id, a, b, open}` (door, window, arch)
  and `{id, a, b, seg, wall?}` (an open shared edge, a see-through wall with
  its `wall` ref, or a split cut). `a`/`b` are stage room (piece) ids. Edge
  portals are clipped to the pieces they touch and to the spans free of wall
  footprints, because mitred wall ends reach into open edges. See-through
  portals keep only the wall's intact path; its openings have their own
  portals. A pair that touches along
  several segments emits one record per segment, `<id>.1`, `<id>.2`, and so on
  (with `_2`… appended if that would collide with another portal id).
  When `WORLD.version >= 3` they go in `stage.portals`. Under today's v2
  compile, which rejects the key, they sit in `extras.stagePortals`. WORLD
  derives kind and flags from the physical opening. The plan-level fields
  live only in `extras.portals`: `ra`/`rb` (plan room ids), `walk`, `kind`
  (`door`, `window`, `edge`, `sight`, `cut`), `group`, `w`, `at`, `u` and `segs`.
  `group` names the logical opening: edge and sight pieces of one plan-room
  boundary share it, so entrance counts, `entries` targets and loops count a
  split boundary once.
- Stage portal ids are unique across the whole stage. An opening portal is
  `<opening>~p`, and its opening id stays in `open`. In `extras.portals`,
  doors and windows keep their own ids. Open edges are
  `pieceA~pieceB`, see-through walls `pieceA^pieceB`, and split cuts
  `room.i~room.j` (kind `cut`, same plan room on both sides). Plan room ids
  use letters, digits, `_` and `-`; `.` is reserved for pieces.
- `info` holds `rooms` (a Map of plan rooms with `gross`/`net` m², `kids`
  and `depth`), `pieces` (room id → stage pieces) and `pieceAt(x,z)`.

## 4. Validator

`PLAN.validate(plan)` returns `{errors, warnings, stages, outs}`. It
compiles every stage with `WORLD.compile` and then checks:

- **Structure:** unknown builds and constructions, overlap, children outside
  their parent, a door or window off a shared edge, or at a junction or mitre;
  drop edges; and stair targets (`to` stage and `arrive` spawn exist; the arrival lies
  outside every stair zone on the target stage, radius `r` (default 0.65 m);
  each stair has a return stair unless marked `oneWay`), matching W1
  `stageRun` v1.
- **Rooms:** every non-`sealed` room has a walkable entrance, and spawns lie
  in rooms.
- **Reachability:** a 0.25 m raster at pawn radius 0.3, cross-checked
  against `WORLD.move` (0 differences on the Motel). Door bridges sample
  each door axis with `WORLD.move`, so 0.76 m doors connect. Every spawn,
  `obj`, `stash` and item must be reachable from the player or arrival
  spawn. A door under 0.8 m gives a "tight" warning.
- **Brief targets:** `area` (±2 %, at least 0.5 m²), `ent`, `entries`,
  `sight` with stance and opened doors (WORLD `sight`; props never block),
  `links` and `loops`.

The raster is a stopgap. It moves to W1d's `nav`/`flow`/`clear` once that
lands.

## 5. Tools for agents and the user

```
node scripts\world-plan.cjs validate --plan motel
node scripts\world-plan.cjs stats    --plan motel --stage lot
node scripts\world-plan.cjs room     --plan motel --stage lot --room r101
node scripts\world-plan.cjs sight    --plan motel --stage lot --from 6,9 --to 40,9 [--stance crouched] [--open d101]
node scripts\world-plan.cjs render   --plan motel --stage f2 --out motel-f2.svg [--from x,z --to x,z]
```

`render` draws a colour-coded floorplan:
- rooms by kind, with id, gross m² and walkable entrance count;
- walls at true thickness, coloured by build (overhead-only lintels faded);
- windows, door leaves and open portals;
- props, spawns, stairs, objectives and stashes;
- every brief sightline, coloured clear or blocked.

Hovering shows details. Legacy `--level 0-7` mode is unchanged.
`npm run check` runs `scripts/plan-check.cjs`, which validates every plan
and fixture case and smoke-tests the renderer.

## 6. Limits (v1)

- Splitting a parent needs axis-aligned parent and child rectangles.
- Sidecar `*.layout.json` files are not ingested yet; plans are authored from
  the briefs.
- Floor steps inside a room (pits) wait for W1e `maxStep`. Stairs are records
  only until W1e.
- Room-level brief targets cannot express prop-level loops (Motel L1, L4).

## 7. Motel settlements (plans/motel.js vs docs/levels/motel-sunset.md)

- Bounds are padded 0.5 m. The planter centreline is z 31.8, and `pc` and
  the walkways extend to 31.8.
- E2's drive is 5 m wide. The yard has 4 entrances. The pool gates are
  arches.
- The ice room is snapped to x 43.6 (7.8 m²). `st_e` extends to z 14. The
  leftover pocket is a sealed `chase`.
- Room 203's window is centred at x 19.0.
- Parked cars are props. Front stall k=2 is left empty for the pool's south
  gate.
- The parking net region has no hole, so it stays one concave piece.
- The bath doors are 0.76 m (period-correct). The validator warns that they
  are tight, but they are reachable.

### Penthouse settlements (plans/penthouse.js vs docs/levels/penthouse.md)

- This is layout only: one stage, `ph`. The lobby and roof stages, E6 and
  stair links wait for W2c. Decor waits for W4.
- Every brief room is its own top-level room. Shafts are `sealed` cores.
  `staff`, `laundry` and `svc_hall` use style `commercial`. The rest use the
  plan style `high_end`.
- Edge precedence: core `rc_wall_20` > panic room `cmu_filled` > façade
  glass to terraces (`glass_annealed_6`) > the §7.2 `stud_steel_gyp2` list.
  The terrace rail to the void is `steel_3mm`, 1.1 m high (an open brief
  question).
- D25, D26 and D32 are narrowed from 1.8 m to 1.4 m arches to clear wall
  junctions. D44 (the open terrace corner) is an edge portal, not a door, so
  the entrance count is not doubled.
- The player starts in the private lift (E1). E2–E5 are `arrive` spawns with
  no stair records yet. There is no `obj`: the boss is the objective.
- The validator reports 0 errors and 0 warnings. The entrances are D8, D9,
  D15, D28 and D29 (5).
- User rulings are recorded in the plan-level `rules` object, which plan.js
  ignores until the runtime lands:
  - The panic door D27 can be breached by explosives only; otherwise it needs
    a key or a script.
  - The terrace rail blocks the player, but enemies can be knocked over it.
  - The lift doors stay closed until W2c.

## 8. Backlog for W2f (map content, from W4)

- Marina: there are toilets on the open dock and in the crate storerooms.
  Move them into a WC.
- Marina: a crate stack blocks a warehouse door to the street.
- Mall: the big yellow tables read as oversized; resize them to period food-court tables.
- Home: keep decor off the gun-locker cells `HOME_LOCKER_WORLD` (16.72, 6.5),
  (20.72, 5.5) and (24.72, 9.5) (W6d).
- stageRun descriptor adapter (W2b, agreed with W1): `arrivals` from
  `arrive` spawns (`a` → `dir`); `stairs` keep `id/to/at/arrive/r/oneWay`,
  dropping `room`/`rise`; `rev` is a deterministic positive-integer hash of
  the plan stage (0 → 1). A revision mismatch on decode must surface an
  explicit migrate/reset choice and never overwrite the original checkpoint.
- Objective `obj` entries per W14 (2026-11-08), to author with each plan:
  - Motel (authored): `obj_lab` `target` (required, `need`) and `obj_cash`
    `use` (optional, sets `wflags.motel_cash`).
  - Marina: `t1`–`t4` `target` (required) and `u` `target` (optional).
  - Arcade: main panel `use` (required) and count-room safe `use` (optional).
  - Club: count-room safe `use` (optional); the boss is the objective.
  - Studio: tapes `use` at TM1 in the machine room (optional).
  - Yacht: helm `use` (required) and swim-platform speedboat `exit`.
  - Mall: none (clear the floor, reach C).
  - Civilians flee to exits, so keep those routes open: club D1/D7,
    studio reception, yacht tender.

## 9. Mesher (W2b, `mesh.js`)

`MESH.build(st, opts, sink)` turns a compiled WORLD v3 plan stage into static triangles in vertex format v2
(48 B; `sink` is a renderer `Batch` or anything with `ensure(k)`, `vtx(x,y,z,nx,ny,nz,u,v,c)` and `room`). It is
DOM/GL-free and deterministic, and returns `{verts, tris, floorArea, ms, prof}`. Legacy grid stages keep
`buildStatic`; the gameplay loader branch for plan stages lands with W1e's factory bridge.

`opts`: `uv(tile)` (required, e.g. `t => TUV[t]`), `white` (UV rect for flat colour, `WUV`), `tint(x,z)` (`surfTint`),
`pick(tile,x,z,salt) -> [tile, D8 index]` (`surfPick`), `finish` (`extras.finish`), `cut` (cutaway below;
`false` = full walls, or `{h=1.2, eye=8, back=4.6}`).

- **Walls**: one face per panel edge over its active cell spans; faces hidden by a collinear, opposite-facing neighbour
  edge are cut away. Faces are split at whole metres along the wall and where they cross a room outline, so tiles
  stay 1 m and each piece takes the room byte and finish of the room it looks into. Window panels draw glass
  (tile 20); rail covers draw flat.
- **Cutaway** (user decision): sight, ballistics and plan data keep the real wall heights; only the render cuts.
  The game camera has a fixed yaw (looking -z from `back` m behind and `eye` m above the player). A wall panel
  renders at `cut.h` when, for some camera over a playable point (inside a stage room), its part above `cut.h`
  would hide playable floor; otherwise (back walls and shells with only void behind them) it stays full height.
  Headers over doors in cut panels and door lintels drop out; jambs stop at `cut.h`. `?planview=...&cut=0` previews
  full walls.
- **Caps and soffits**: room byte 0, so wall tops stay visible under room fog. Glass gets none.
- **Door casings**: jamb and head trims on both faces of door, double and slide openings.
- **Props**: coloured prisms by build (placeholder until W2f/W13 decor).
- **Floors**: every stage room piece is cut into 1 m cells. Each part takes the first stage ground containing it
  (`WORLD.groundY` order), so floor area equals room area. Corners near walls darken (AO, 0.6 m).
  Plan grounds outside every room are not drawn.
- **Risers**: every effective (first-wins) ground boundary with a height step gets a vertical face looking toward the
  lower side (sunken floors and pools included); edges over void get a 0.3 m lip.
- **Decor** (`st.decor`, render-only, retained by WORLD; generated by W4 `DECOR.place`): oriented boxes
  `{id, kind, at:[x,z], size:[w,d], h, rot=0, y=0, col?, tile?, room?}` standing on the first-wins ground at `at`
  (+`y`). A `tile` textures them; otherwise they're flat `col`. The room byte comes from `roomAt(at)`. Decor never
  collides, blocks sight or enters nav.
- **Finish lookup**: walls are `finish.wall[room id → parent → kind]`, then the kind default, then
  `exterior`/`interior`. Floors are `finish.floor[room id → parent → kind]`, then `finish.floor[surf]`, then the surf
  default (unless `concrete`), then the kind default.
- **Triangles** are wound counter-clockwise about their normal. Blend tile and room byte are constant per triangle;
  `blT`/`blW` are 0 until W13c.

`scripts/mesh-check.cjs` (in `npm run check`) meshes every plan stage and checks:

- finite data, unit normals, winding and no degenerate triangles;
- room byte constant per triangle and equal to `roomAt` on floors;
- floor area equal to room area;
- no wall face inside a door opening;
- the cutaway (void-backed wall stays full, occluding wall and door casing cut);
- determinism, the ≤ 200k vertex budget and the finish overrides and validation.

Run it with `MESH_TIMING=1` to print per-section timings.

Preview: `public/index.html?planview=motel/lot[&at=x,z][&h=m]` draws the stage on the title screen.

## 10. Gameplay loader (W2f, dev-gated)

`?planplay=motel` registers the side errand `plan_motel` (job list) from `PLAN.stageDefs(PLAN.playable(PLANS.motel))`.
It is a preview: no shipped mission uses a plan stage until the user's layout review and the coordinator's rollout gate.

- `PLAN.playable(plan)` shifts every stage together so the lowest bound is 0 (the legacy grid needs non-negative bounds).
- `PLAN.cells(st,W,H)` rasterises a compiled stage into `{solid,wh,ground}` per 1 m cell.
- `stageBuild` dispatches `kind:'plan'` to `planStageBuild` in `index.html`.
  `WORLD.compile(PLAN.fromPlan(...).stage)` is authoritative for movement (`WORLD.move`/`clear`), sight, bullet traces,
  doors (stage door leaves, the same push/swing logic) and pathing (`WORLD.nav`/`flow`/`step`, also used by `ai.js`).
  `loadLevel` only builds a synthetic compatibility grid from `PLAN.cells` for the radar, decals and particles; it is never
  consulted for plan collision, LOS or pathing. `MESH.build` replaces the static batch.
- Spawns: the player spawn (or the arrival), and enemies from `spawns` with weapons by `role`.
- Plan snapshots are `{v:2,kind:'plan',player,enemies,items,doors:[{i,th,w,pusher}]}`. Grid and plan snapshots reject each other.
- Sliding doors auto-open when a live actor is within 1.1 m of the closed doorway (2.2 m/s); they never close onto an actor, and their `slide` fraction is saved in the plan snapshot. Pathing treats unlocked doors as open.
- Explicitly refused: locked doors; civilians, item/exit spawns, objectives and stashes unless the stage's `def.preview`
  is true (the dev gate sets it and the loader then drops them). Not yet supported: cover hugging (disabled on plan stages),
  bosses (a `boss` role spawns a plain enemy), glass shatter, wall damage, backdrops and plan lights.
