# WORLD geometry v3 and materials/build v1

`WORLD.materials` is an additive, DOM/GL-free schema in the ordered classic
`world.js`. It does **not** migrate legacy levels, change their sight rules, or
implement penetration, destruction, or rendering itself. `WORLD.version === 3`
exposes the freeform queries, stage manager and deposited-energy damage core
described below; material schema version stays 1.

The 21 `MAT` and 38 `BUILD` records exactly match W3's
[`MATERIALS.md` section 8](research/MATERIALS.md#8-js-literal-proposals-for-w1w5-not-runtime-yet).
`npm run check` compares the live tables with those literals, including nested
layers and `Infinity`. Research changes and canonical runtime tables must be
updated together.

## Data and units

`MAT` holds resistance in J/cm and hardness applicability. `BUILD.layers` holds
outer-to-inner `[materialId, thicknessCm]` pairs; alternate stacks use
`alt: {p, layers}`. Coverage is independent of construction.

Tables and all nested records are frozen. `build(id)` returns a canonical build
or throws for an unknown ID. `selectLayers(id, u)` requires a finite sample in
`[0,1)` and selects the alternate stack when `u < alt.p`. W5 supplies a
reproducible per-hit or surface-local sample; the schema does not impose a
random-number generator, member spacing, or world-coordinate hash.

`describe(id)` returns a fresh JSON-safe record with layer copies, rounded
`thicknessCm`, alternate stack metadata, `coreE`, `cellHp`, `indestructible`,
`lockHp`, `lockIndestructible`, pane/tempered flags, and optics. Infinite HP is
represented by `null` plus its explicit indestructible flag. Absent lock HP is
`null` with `lockIndestructible: false`. Missing core energy is zero; infinite
cell HP still forbids cell destruction. These are energy thresholds, not actor
health. Indestructibility does **not** mean bullets cannot penetrate a build.
The vault's lock cannot be breached; its opening is controlled by a key/script
in the future door implementation.

`MAT.debris: 0` means no debris colour, not black debris. VFX/SFX identifiers are
research contracts, not promises that an asset is already implemented. Clear
glass remains breakable and its break should be audible with visible feedback;
locking a glass door does not make the glass indestructible.

## Surface validation and sight classification

```js
const s = WORLD.materials.validateSurface({
  kind: 'window', build: 'glass_block', cov: 'full', h: 2.7
});
WORLD.materials.blocksSight(s, 'standing'); // true
```

`validateSurface` accepts exactly `{kind, build, cov, h}`. Kind is required:
`wall`, `window`, `door`, or `prop`. Coverage is `full`, `chest`, `waist`, `rail`,
or `glass`; `h` is an explicit positive finite height in metres. Chest and waist
have documentary nominal heights of 1.2 and 0.9 m in `COVERAGE`; full/glass/rail
have no invented default height. Layer thickness is authoritative; this schema
does not accept an unrelated `t` override.

`OPTICS` identifies clear glazing separately from translucent `glass_block`.
Unlisted builds are opaque. Glass-block coverage must be full. Opaque builds
cannot use glass coverage. Doors/windows require full coverage, or glass
coverage for clear glazing.

The classification follows [`STYLE-LEVELS.md` section 3.4](STYLE-LEVELS.md#34-sightlines):

| Surface | Standing | Crouched |
|---|---|---|
| Opaque full wall or leaf | blocks | blocks |
| Translucent glass block | blocks | blocks |
| Opaque chest wall | passes | blocks |
| Waist, rail, clear glass | passes | passes |
| Any prop, including full-height columns/piles | passes | passes |

`blocksSight(surface, stance)` accepts `standing` or `crouched` and revalidates
the surface. It classifies a surface, not a ray intersection: the future
compiler/query geometry establishes that a ray actually crosses the wall
or live swung/sliding leaf. An open door clears its doorway, not its leaf.
Floor steps and elevation do not block sight. No numeric eye-height/elevation
policy is added by this schema.

Layout shorthand is not a build ID: the future layout compiler maps a `D` row
of kind `glass` to `glass_tempered_6`; `open` creates no surface. Unsupported
curtain fills are rejected rather than treated as solid or clear by accident.
Water is ground/surface data, not a fabricated wall material. Balcony rail
construction must be explicitly selected by the level designer.

Stages carry an explicit `combat` flag; rooms can override it in metadata.
Non-combat areas have no fog; material classification does
not switch fog, movement, lock state, or gameplay.

## Geometry v2: additive compiler gate

`WORLD.compile(stage)` is DOM/GL-free and does not replace the game's existing
cell loader or queries. There is deliberately **no `?world=2` rollout yet**:
loader, door physics, glass replacement and every solid/furniture mutation
must be synchronized before a runtime flag is safe. Existing save/level indexes
and captured raw, loaded, query and movement hashes are unchanged.

Authored level plans (`plans/*.js`) compile to this stage record through
`PLAN.fromPlan`; see [PLAN-FORMAT.md](PLAN-FORMAT.md) for the room/portal
contract, validator and `world-plan.cjs --plan` tools.

All coordinates, heights, radii and displacements below are metres; angles are
radians. Required stage fields are `id`, `[x0,z0,x1,z1]` bounds, boolean `combat`,
and `ground`, `walls`, `props` arrays (empty arrays are valid). Optional `rooms`
and `spawns` arrays are copied as JSON-like metadata. Geometry v3 validates rooms and
portals and adds snapshot navigation, below; spawn semantics and entrance-count
requirements still belong to the plan validator. Geometry records reject unknown
own fields and inherited contract fields. IDs are unique across the stage,
ground, walls, openings, props and rooms; authored IDs cannot contain `:`.

```js
const st = WORLD.compile({
  id: 'sample', bounds: [0, 0, 20, 20], combat: true,
  ground: [{
    id: 'floor', poly: [[0,0], [20,0], [20,20], [0,20]],
    y: 0, surf: 'tile'
  }],
  walls: [{
    id: 'partition', path: [[10,2], [10,18]],
    build: 'cbs_ext', cov: 'full', h: 2.8,
    open: [{
      id: 'entry', s0: 5, s1: 7, y0: 0, y1: 2.2,
      kind: 'door', build: 'door_solid', cov: 'full',
      door: {hinge: 'start', th: 0, slide: 0}
    }]
  }],
  props: []
});
WORLD.sight(st, 5, 8, 15, 8); // blocked by the closed leaf
st.doors[0].th = Math.PI / 2;
WORLD.sight(st, 5, 8, 15, 8); // doorway clear; leaf still physically present
```

### Shapes, cells and openings

Ground is a simple polygon with constant finite `y` and string `surf`. The first
containing polygon wins. Prop polygons must be simple and convex, with explicit
`id`, `build`, `cov`, `h`; props block movement and shots, never sight.

Walls use a polyline `path`, optional boolean `closed`, or
`path: {arc: [cx,cz,r,a0,a1]}`. Thickness comes from `BUILD.layers`, not a texture
or independent override. Compiler wall bands require full height >1.6 and chest
height strictly between 1.1 and 1.6. Window/door/prop heights need only satisfy
the material surface validator; a short glass-block window is still opaque.

Adjacent path pieces share mitred cross-sections, partitioned by perpendicular
cuts into convex panels with centreline length <=0.5. Cells subdivide each
panel's present vertical spans into <=0.5 bands. End panels include the mitre
tip, so their footprint can extend beyond their centreline interval. Geometry
is copied/frozen; cells expose mutable `active` and energy `hp`. Damage API,
debris and rebuilding geometry after damage remain W1f/W5 work.

Turns above 135 degrees, backtracks, invalid convex mitred pieces and geometry
outside stage bounds are rejected. A closed polyline must omit the repeated
last point and use `closed: true`. Arcs require radius >=0.5 and an angular span
strictly less than a full turn; closed/full-turn arcs are rejected rather than
leaving an unjoined seam. Arc chord error is below 0.1. A corner shared by
separate open wall records must instead be one polyline; ordinary perpendicular
butt joints into the interior of another wall are allowed.

`open` entries use true path-distance `s0/s1`, vertical `y0/y1` within the wall,
and kind `arch`, `window`, `door`, `double`, or `slide`. Overlapping path ranges
are rejected, including vertically disjoint ranges. Arches have no build,
coverage or leaf. Windows need a build and coverage and may span bends/arcs.
Door leaves must start at ground, stay on one straight polyline piece, and
clear its mitre insets. `door.hinge` is `start` or `end`; swing `th` is within
[-pi/2, pi/2]. Sliding leaves use `slide` in [0,1], zero angle and slide along
their original wall plane. Non-sliding leaves require zero slide. Double doors
create opposite-hinged `id:0`/`id:1` leaves with opposite initial angles.
Changing `th`/`slide` is live, checked at query time, and never requires hash
rebuilding. Leaf geometry fields are read-only; `w`/`pusher` are reserved motion
state, not a new door-physics implementation.

### Query contract

Static panels/props are indexed in 2 m buckets; dynamic leaves are scanned live.
Caller must preserve the compiled arrays/index; active cells and leaf motion
are the supported mutations. Finite arguments are required, and invalid input
throws instead of returning a success-shaped default.

| API | Output and policy |
|---|---|
| `sight(st, ax, az, bx, bz, eyeA=1.6, topB=1.8)` | `{clear,t,kind,ref,...}` nearest blocker, or `t:1` for clear. Uses local `min(eyeA,topB)` against half-open vertical bands. Ground elevation never occludes. Bounds exclude the upper edges. |
| `trace(st, ax, az, bx, bz, y=.7, out=[])` | Sorted per-panel/prop/leaf intervals with `t0/t1`, entry `x/z`, normal `nx/nz`, `kind`, `ref`, `build`, cell, `path` length, and incidence `cos`. Reuses/clears optional output array. |
| `move(st, x, z, r, dx, dz)` | `{x,z,hit,rem,overlap,groundY}` analytic swept-circle movement; radius >=0. Up to four sliding contacts, 1e-4 skin, crease-stop. Includes bounds, props and active wall bands below 1 m. Leaves are deliberately excluded for dedicated push-door physics. |
| `groundY(st, x, z)` | Constant polygon height, or `null`. No ramp/step traversal enforcement. |
| `coverAt(st, x, z, dirx, dirz, r)` | Nearest facing footprint per source reference, sorted by distance, with contiguous intact height from floor. Nonzero direction and nonnegative search radius. No crouch/peek gameplay. |

Sight first tests whether a surface can occlude crouched sight, then its actual
vertical bands. Thus a chest wall can hide a crouched actor but not a standing
one; clear glass and waist/rail coverage never hide either. Shot tracing is
independent of optics. Trace wall cosine is relative to the construction plane;
prop/legacy-box cosine uses the actual struck face, including boundary starts.
For a ray starting strictly inside a footprint, no entry face exists: its
fallback normal opposes the ray. Corner ties select a tied face deterministically.

**Trace intervals are not energy charges.** A ray on a shared panel boundary
can appear in both cells. W5 must union same-wall intervals before accumulating
material path/energy, preserving per-cell records for damage. Do not apply the
complete BUILD stack once per emitted panel, or sum overlapping path lengths.
No penetration/durability/lock damage is calculated here.

Initial overlaps may escape or slide tangentially but cannot move deeper.
The solver does not arbitrarily depenetrate actors. An actor already embedded
in a wall can encounter another cell while sliding along the wall; perpendicular
escape remains possible. Normal collision-free slides do not snag on seams.

### Legacy adapter and measured parity

`WORLD.fromCells(g)` takes a loaded legacy grid and produces policy `legacy`.
It deliberately leaves material build and HP `null`: texture IDs are not a
research-backed material assignment. Every grid square reserves one 1 m panel
and one inactive/active cell, including empty squares, so later solidification
does not require guessing missing geometry. This adapter is exempt from the
authored 0.5 m subdivision; it is not a destructibility conversion.

`WORLD.syncCell(st, g, i)` updates that square's solidity and height after a
legacy mutation. The grid must be the identical source object. Legacy doors
remain the same live object array. Furniture removal/type changes are observed
live; **new furniture footprints require recompilation**, and `syncCell` throws
explicitly for an uncaptured addition. It does not silently patch buckets.

The adapter preserves legacy zero-height =>1.15 and solid height <0.6 movement-
only behavior, old COVER furniture shot policy, stance-blind sight and exact
live 0.98 x 0.07 door leaves. Ground remains nominal zero. It requires explicit
synchronization before it can safely replace any existing gameplay query.

`scripts/compile-check.cjs`, invoked by `npm run check`, samples 24,000 rays over
all eight legacy levels: per-level sight agreement is 99.733%-100%, and within
13 m it is 99.631%-100%. All 25 differences are additional exact blocked corner
clips shorter than 0.15 m; **zero legacy blockers are lost**. Near-range samples
contain 19 such clips in 12,319 rays. Collision-free endpoint pairs also compare
analytic body clearance with the existing corridor query, and changing door
angles compare exact entry fractions within 1e-9.

Compiler microcases cover glass/block glazing, arches, double/sliding/live
leaves, height holes, cover, high-speed sweeps, overlap escape, polygon validation
and metadata ownership. Mitred 90/120/135-degree bends, small-radius arcs, short
thick legs, a closed square and near-vertex openings check convex partitions,
area conservation/no interior overlap, corner crack rays and repeated slides.

## Geometry v3: room graphs and navigation (W1d contract)

This additive version keeps scalar sight/trace/movement signatures and material
v1 intact. It does not enable new gameplay routing, fog, damage or stage loading.
Compiled stages now report `v:3`. Existing policy names `v2` and `legacy` identify
geometry behavior, not the API version.

### Rooms and explicit authored portals

`rooms` records require `{id,poly}` with a simple polygon inside bounds. Maximum
255 rooms (idx 0..254, encoded as idx+1 in the vertex byte; zero is unroomed);
interiors must not overlap. Shared edges/vertices are allowed.
`combat` defaults to stage combat. Other JSON-like metadata (`name`, `kind`,
`roof`, `zone`, parent grouping) is copied. Holes/subtractive rings are not
implemented: W2 partitions nested parent areas into simple polygons.
Outputs are deep-frozen and have dense deterministic `idx`, `area` in m²,
polygon `centroid` and up to four deterministic interior `samples`. A concave
polygon's area centroid need not itself be inside; use `samples` for waypoints.

`roomAt(st,x,z)` returns the frozen room or `null` in unroomed space.
The first listed room wins on shared boundaries. `portalAt(st,x,z)` explicitly
identifies doorway thresholds; it tests distance to portal segments within
wall half-thickness +0.01. No silent nearest-room assignment.

Authored `stage.portals` are an optional array, with exactly one physical source:

```js
{id:'entry-link', a:'hall', b:'bedroom', open:'entry-opening'}
{id:'pier-link', a:'quay', b:'pier', seg:[[4,2],[6,2]]}
{id:'glass-link', a:'hall', b:'booth', seg:[[4,2],[6,2]], wall:'glazing'}
```

Room refs are strings; `b:null` means unroomed outside. Segments/openings must
lie on the named rooms' shared polygon boundary; portals of zero width, missing
refs and unwalled segments crossing a physical wall are rejected. A wall-source
segment must lie on its intact path. W2 owns portal completeness/entrance-count
requirements; WORLD does not infer arbitrary authored adjacency.

Compiler preserves frozen `st.openings` (including arches) with path-distance
bounds, build, coverage, vertical span, wall half-thickness, segment list and
leaf IDs. Compiled `st.portals` has dense `idx`, integer room `a`/`b|null`,
`id`, physical `kind` (`door`, `double`, `slide`, `arch`, `window`, `wall`, `open`),
`ref`, `build`, `doors` (live leaf objects), `ends`, `segments`, `mid`, `width`,
normal, vertical span, `walk` and stance `sight` candidate flags.

`portals(st, roomIdx|roomId|roomRecord)` returns the immutable **portal-index
adjacency list**, not newly allocated portal records. Use `st.portals[idx]`.
`portalOpen(st,p,'move')` means a walk candidate with no locked leaf. Door
push/open physics is still separate. `portalOpen(st,p,'sight',eye,top)` tests
the actual local crossing ray, including the live leaf; candidate flags alone
are not visibility guarantees. Glass is sight-only, glass block blocks sight,
and closed leaf doors remain graph candidates. Sound attenuation belongs to W8.

Adapter rooms are honestly **derived topological regions**, not semantic rooms:
flood-fill non-solid cells split at door squares and street texture boundaries,
ignoring movable furniture. Records expose `derived:true`, area, centroid,
samples and zone. Door portals retain actual live legacy leaves; shared
interior/street boundaries yield open portals. `roomAt` in a removed door square
returns null, with `portalAt` providing the doorway. Recompile the adapter after
topology changes to obtain a new room graph.

### Navigation snapshot and target-owned fields

`clear(st,ax,az,bx,bz,r=0)` checks static disc/capsule clearance, including ground
void/height boundaries and stage bounds, without door leaves. Use it instead
of `move(...,0,0)`, whose zero-displacement call does not detect overlap.
In W1d any ground height discontinuity is blocked; equal-height overlapping
regions follow first-wins. W1e will gate step/ramp policy separately.
Water/drops must be absent or lower ground; a same-height polygon named `water`
is not automatically unwalkable.

`nav(st,{cellSize=.5,radius=.3,diagonal=true,maxTiles=262144})` builds an immutable
static geometry snapshot with private arrays. Cell size is in [0.1,2], radius
in [0,2], tile budget <=262144. Handle fields: `v`, source `stage`, `origin`,
`W`, `H`, `cellSize`, `radius`, `diagonal`, `revision`.
Accessors: `tileAt(x,z)` (-1 outside), `rep(i)` (representative point),
`walkable(i)`, `edges(i)`, `room(i)` (-1 unroomed), `edgePortals(i,direction)`.
Direction masks use E,S,W,N,SE,SW,NW,NE. Diagonal edges must pass exact capsule
clearance; no corner cutting.

Tile centres alone disconnect 0.8/0.9 m doors and legacy passages. Blocked
centres first try projected opening-axis points, then deterministic nearest
5x5 sub-samples. Representatives are returned by `step`; do not reconstruct
them from tile centres. A 1e-5 margin avoids numerically tangential edges.
Agent radii are per snapshot; build a separate nav for larger agents.

`flow(nav,[x,z]|[[x,z],...],out?,{closed:portalIds?})` computes integer-centimetre
Dijkstra costs with a reusable indexed heap. The first call allocates an opaque
field; passing that field as `out` reuses its cost/next/heap buffers. Each field
belongs to exactly one nav snapshot. No shared player target or global search.
Target tiles seed nearby representatives that have a radius-zero clear path
to the target, allowing wall-adjacent targets. A target inside an obstacle or
with no visible seed produces `reachable:false`; no nearest-global fallback.

`dist(nav,field,x,z)` returns metres, or -1 unreachable/outside.
`step(nav,field,x,z,out=[0,0])` returns the next representative, or null at the
seed/unreachable; an optional point buffer is reused. Agent-to-representative
segments must be clear at nav radius. `field.target` records copied sources.
Closed portal IDs exclude their crossing edges. Leaf angle changes do not
invalidate nav or fields; lock changes require recomputing the field and stale
field queries throw explicitly.

Nav geometry is a snapshot: mutations do not silently patch it. Rebuild after
wall/prop/ground changes; old fields cannot be passed to the new nav. W1f will
add dirty-tile invalidation. Private arrays prevent one agent corrupting
another. Field buffers are reused, but existing scalar geometry helpers still
allocate temporary candidate arrays; this gate does not claim allocation-free
runtime queries or enable them in the game's hot path.

Static nav snapshots spatially index ground polygons, ground-height/void
boundaries, movement-feature bounds and portal crossing segments in 2 m
buckets. Ground candidates retain authored order (first-listed ground wins);
the broadphase does not replace exact capsule or boundary tests. Empty swept
buckets can pass only after endpoint ground and stage-bound checks. Near-zero
radii and tolerance-sensitive short rays keep the original exhaustive edge
and feature candidates, including radius-zero target seeding. Node regressions
cover negative coordinates, bucket edges, height steps, voids, short-ray
collinearity and acute-vertex clipping.

On the shifted playable Motel benchmark, native-realm lot nav construction
fell from 9483 ms to 536 ms and f2 from 1365 ms to 114 ms on the same host.
Walkability, representatives, edge masks, room indexes, portal crossing tags
and flow costs matched the pre-optimization snapshots exactly. These are
observed timings, not a hardware-independent load-time guarantee.
The rebuilt Chromium artifact measured 609 ms for lot and 107 ms for f2.

## Stage-run envelope v1 (W1eA, no gameplay activation)

`WORLD.stageRun(mission,describe,opts?)` is a pure state machine, not a renderer
or loader. It does not touch G, kit, HP, storage or the mission table. It accepts
`mission:{id,stages:[sid,...],start}` and a descriptor resolver. Descriptor shape:

```js
{
  id: 'f2', kind: 'grid', rev: 1,
  arrivals: {up: {at:[2,2], dir:0}},
  stairs: [{id:'down', to:'f1', at:[5,5], arrive:'down', r:.65}],
  backdrop: [{stage:'f1', dy:-3.4, dim:.6}]
}
```

Descriptors can name `kind:'plan'`; **that does not make a plan playable**.
The gameplay factory must reject unsupported kinds explicitly until W2b.
W2 maps `fromPlan` stage/extras into these descriptors; tooling-only `info`
Maps/functions and compiled geometry are never serialized. Stairs must target
a known stage/arrival, be paired or `oneWay:true`, and arrivals must be outside
the target stage's stair trigger radii. Backdrop refs are stage/city descriptors,
not active worlds; renderer support belongs to W2c.

Manager operations:

| API | Contract |
|---|---|
| `describe(sid)` | Immutable normalized descriptor. |
| `prepare(to,arrive=null)` | Immutable transaction token, arrival and retained snapshot; no mutation or save. |
| `prepareStair(id)` | Resolve a stair from the active stage, then prepare. |
| `preview(token,leaving,entry,bag={})` | Validate/copy the prospective save envelope without mutating manager state, before any save writer runs. |
| `commit(token,leaving,entry,bag={})` | Atomically copy/validate leaving and incoming entry snapshots, retain per-stage state, activate target and set retry entry. Reject stale/foreign/reused tokens. |
| `retry()` | Current `{sid,snapshot,bag}` entry checkpoint; no live world reference. |
| `restart()` | Clear all retained stages/checkpoint/bag and return to inactive start. |
| `encode()` / `decode(saved)` | Plain JSON envelope; decode validates all stage revisions before changing state. |
| `backdrops(sid)` | Immutable descriptors only; no recursive rendering or simulation. |

Envelope `{v:1,mission,current,states,entry,bag}` belongs under existing `run.st`.
State entries are `{sid,rev,data}`. Data and mission-stat `bag` are plain finite
JSON supplied by gameplay capture/hydrate; WORLD does not infer which G fields
are safe to persist. Default budgets are 16 KiB UTF-8 per stage and 256 KiB per
run, configurable with `maxStageBytes`/`maxRunBytes`; there is no stage-count cap.
Circular, non-data and over-budget snapshots throw before changing state.
Old/future/malformed envelopes and layout revision drift throw, never silently
overwrite the original save. The gameplay bridge must distinguish explicit
restart/migration from unreadable-save preservation.

Every activation must build a fresh world/player. Retaining a live G would
reactivate stale callbacks guarded by `G===g`, and applying loadout to a carried
player would duplicate armour. Correct transaction order: prepare and capture
previous world read-only, build detached, validate `preview` before assigning
prospective `run.st`/HP, then use previous G to call existing `runStage(to)` once.
Finally activate new G/apply stageKit/set checkpoint HP and commit the manager.
Factory/preview failure must leave world, run and storage unchanged.
No separate storage writer belongs in WORLD.

This milestone only verifies the pure transaction/envelope boundary. The
gameplay bridge, bounded capture/hydrate classification, HP checkpoints and
two-grid lifecycle integration are W1eB, after W14's mission baseline lands.
Multi-stage clear/finish/grade policy remains gated; no shipped mission gains
stages and no plan stage is silently replaced by a legacy map.

## Grid-stage gameplay bridge (W1eB, gated)

`enterStage(id,arrive)` is the gameplay entry boundary. Optional
`MISSIONS[id].stageDefs` supplies grid definitions and the stage-run descriptors;
the existing mission table has no shipped multistage entries. `startMission`
uses the bridge for stage-defined missions, while ordinary legacy missions keep
their existing setup and finish economics. Plan kinds, missing definitions and
unsupported stage content reject explicitly instead of loading a legacy map.
Backdrop rendering and playable plans remain W2b/W2c work.

Every activation builds a fresh world and player before changing the run.
Arrival/body clearance and the bounded prospective snapshot validate first.
For stairs, the previous world is then used by the existing `runStage` exactly
once; the same save attempt includes `run.st` and finite positive `run.stageHp`.
The new world receives that stage kit once and carries fractional HP and armour.
Storage failures stay visible through `SAVE` and preserve the previous disk
content; no second writer or silent reset is introduced.

The envelope retains stage-local enemy identities/appearance/damage, doors,
items and world-mutation data, separately from carried mission tallies. Returning
to a visited stage restores its retained state. Retry restores the current
stage's **entry** snapshot/kit/HP; restart-from-beginning and walking away discard
the stage envelope according to the existing run semantics. Historical absent
or non-finite checkpoint HP falls back to the fresh player's maximum HP.
Geometry, GL handles, callbacks and transient projectiles are not saved.
Initialized adapter cell durability and door build/lock durability/breach state
are retained sparsely with stable identities and validated after reconstruction.
Infinite durability uses the explicit JSON tag `"indestructible"`, not JSON's
ambiguous conversion of Infinity to null.

Stairs freeze simulation before the accepted fade, guard against world/run
replacement and refuse dead, finishing or otherwise unsupported player states.
Arrival validation and a trigger latch prevent immediate recursive stairs.
Managed stages do not run the legacy per-floor clear/payout path: completion
without a future explicit mission policy is visibly rejected. Injected two-grid
browser tests cover this lifecycle, not an automated objective/campaign clear.
The initial bridge rejects backdrops, gifts, objectives/NPCs/hub triggers,
active cash lures and flying items rather than silently losing their state.

## Deposited-energy damage (W1f, additive core)

`WORLD.damage(st,panelIndex|stringRef,absoluteCellIndex,J,kind)` accepts finite
nonnegative **deposited** joules and `kind:'bullet'|'blast'|'melee'`. The caller
owns penetration, interval union, core-energy gating and pellet/blast deposition.
The target must match the structural cell's panel exactly. HP decreases by J;
at zero the cell becomes inactive. `Infinity` HP never removes a cell.
There is no RNG, automatic pane cascade, debris generation or bullet-path
rollout in this API.

The frozen result is `{removed,cells,dirty,nav,portal}`. Non-removal calls reuse
one immutable result with empty arrays and `dirty:false`, even when HP changes:
`dirty` means **geometry** changed, not that HP is unchanged. Removal reports
absolute removed cell indexes, `dirty:true`, padded dirty tile indexes on the
default 0.5 m nav layout, and a created/updated breach portal or null. Padding
covers the supported 2 m maximum radius plus a default diagonal edge's reach.
These indexes are not interchangeable with custom-size nav layouts; all geometry
changes still require a fresh nav snapshot. This is not incremental mesh/nav
repair.

Removal and actual `syncCell` changes advance the stage's private geometry
revision. Old nav accessors/fields reject explicitly with a rebuild-required
error; do not keep querying a stale snapshot after a damage notification.
New snapshots retain exact capsule checks, including uneven 0.7/0.75/0.8/1 m
breaches. The pre-existing `MOVE_H=1` movement band remains unchanged; a standing
head-clearance/stance policy is not introduced by destruction.

Compiled breach portals use `kind:'hole'`, retain construction/ref metadata and
verified room boundaries (including `b:null` outside), and merge contiguous
collinear movement gaps. Original room/portal indexes stay stable; merged-away
hole records remain inactive index slots. Refresh `st.portals`/room adjacency
after removal rather than retaining an old array. Existing opening portals are
not duplicated; their passability becomes live after damage. A broad authored
wall portal retains its identity while precise breach intervals supply its
live passability and navigation axes, rather than testing only its old midpoint.
`portalOpen` uses
actual sight rays, or actual body/locked-leaf clearance for a breach; its fourth
argument in `'move'` mode is an optional radius, default 0.3 m. Nav crossing tags
include breached wall/window portals and closing a wall reference closes all
matching breaches. Lock changes, including a locked leaf's motion, require
recomputing fields.

Legacy cells keep `build:null` and initial `hp:null`: W5 must initialize HP from
its own material mapping before damage, or the core throws. Removing a legacy
structural cell updates its source solidity and AI `navVer`; derived region
indexes are never renumbered. A newly exposed wall tile receives a valid legacy
floor rather than leaving the renderer's absent-floor sentinel in place.
Existing `glassSet` panes explicitly require
`hitGlass` plus `syncCell`, preserving their separate pane bookkeeping. Props
and leaf trace records with `cell:-1` are not structural panel-cell targets.

`WORLD.damageLock(st,liveDoor,J)` uses the door's BUILD `lockHp`, lazily retaining
partial lock damage on `door.lockHp`. Missing lock durability is an explicit
error; infinite vault locks cannot breach. A successful breach returns
`{breached:true}`, unlocks the opening's leaves together (one lock for a double
door), and preserves their current angles/slide/velocity. It does not force the
door open. Caller-owned legacy doors need their material `build` assigned first.

## Render-only decor boxes (v1)

Optional stage `decor:[]` is a separate render-only namespace, copied and frozen
at `st.decor` (default `[]`). Each record is
`{id,kind,at:[x,z],size:[w,d],h,rot?,y?,col?,tile?,room?}`.
IDs are nonempty and unique within decor only; they may match geometry IDs.
`kind` is an informational nonempty kit-item name. Position must be finite and
inside stage bounds; width, depth and height must be positive finite metres.
Rotation defaults to zero radians about +y; base offset `y` defaults to zero
and must be finite/nonnegative above the ground at `at`.
Optional colour is three finite RGB components in [0,1], tile is an integer
0..255, and room names must resolve to an authored room ID. Unknown keys and
more than 8192 records reject explicitly.

Decor never creates panels, props, buckets, collision, cover, sight/trace hits,
nav/flow barriers or fog occluders. Legacy grid generation and its hash fixtures
remain unchanged. W4 generates placement at load time; W2b renders the boxes
from this retained layer, with no additional build step.
