# WORLD materials/build contract v1

`WORLD.materials` is an additive, DOM/GL-free schema in the ordered classic
`world.js`. It does **not** migrate legacy levels, change their sight rules, or
implement penetration, destruction, freeform compilation, or rendering.

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
compiler/query geometry must establish that a ray actually crosses the wall
or live swung/sliding leaf. An open door clears its doorway, not its leaf.
Floor steps and elevation do not block sight. No numeric eye-height/elevation
policy is added by this schema.

Layout shorthand is not a build ID: the future layout compiler maps a `D` row
of kind `glass` to `glass_tempered_6`; `open` creates no surface. Unsupported
curtain fills are rejected rather than treated as solid or clear by accident.
Water is ground/surface data, not a fabricated wall material. Balcony rail
construction must be explicitly selected by the level designer.

Stage and room schemas will carry an explicit `combat` flag in their subsequent
geometry contract. Non-combat areas have no fog; material classification does
not switch fog, movement, lock state, or gameplay.
