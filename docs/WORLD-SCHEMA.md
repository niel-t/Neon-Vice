# WORLD geometry v2 and materials/build v1

`WORLD.materials` is an additive, DOM/GL-free schema in the ordered classic
`world.js`. It does **not** migrate legacy levels, change their sight rules, or
implement penetration, destruction, or rendering. `WORLD.version === 2` adds
the freeform compiler/query API described below; material schema version stays 1.

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
and `spawns` arrays are copied as JSON-like metadata; room IDs and optional
boolean `combat` are checked, but navigation, entrance counts and spawn
semantics are **not** implemented in this gate. Geometry records reject unknown
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
