# Neon Vice — wall materials and constructions (1986 Miami)

Owner: W3 (reference research). Consumers: W1 world core (`MAT`, construction
ids on `walls[].build`, destruction), W5 ballistics (`CAL`, penetration
tables), W2 level design (which wall goes where), W4 decor (debris, decals).

This doc answers the user's Q9: walls have a **material build** (what they are
made of, backed by research) and a **coverage** (full/chest/waist/rail/glass).
This file covers the build side. Penetration by calibre is in
[BALLISTICS.md](BALLISTICS.md), which uses the same ids.

Nothing in this file is runtime code. The JS literals at the end are
proposals for W1 to adopt or adapt through the contract-change protocol.

## How to read the evidence tags

| Tag | Meaning |
|---|---|
| **V** verified | Number or arrangement stated in a cited source. |
| **D** derived | Calculated from a cited source (shown in the notes). |
| **P** provisional | Engineering estimate or gameplay choice; no direct source. Change freely. |
| **G** gameplay | Deliberate compression of reality for playability. Flagged for the user. |

Source keys are listed at the bottom (§9). Ballistic keys (`BOT*`, `CAN`, `A`,
`AFTE`...) are shared with BALLISTICS.md.

---

## 1. Model in one paragraph

A wall is a **stack of layers** (outer → inner), each a material and a
thickness in cm. A projectile carries energy `e` (J). Each layer removes
`res × thickness` joules, divided by the calibre's `hard` factor if the layer
is a hard material (masonry, concrete, steel), and multiplied by the calibre's
`metal` factor in steel and aluminium (wide or soft bullets lose more in
plate; BALLISTICS.md §1). The projectile stops when
`e < eMin` (30 J). After it perforates a hard layer ≥ 3 cm thick it is
**tumbling**: every later construction costs 2×. Studs and block webs are
**stochastic**: a hit has a fixed chance of striking the solid member instead
of the cavity, which swaps in an alternate stack. Full formula, calibre values
and the outcome matrix are in BALLISTICS.md §2–§4.

Destruction is per 0.5 m cell (roadmap §2.3). A construction has `cellHp`
(joules of deposited energy to remove one cell) and a `coreE` threshold: hits
with effective energy below `coreE` only spall/decal masonry and never count
toward its `cellHp`. That is why no handgun (the .50 AE included) digs
through block, brick or concrete, while rifles and slugs eventually do. The
one exception is hollow clay tile (`coreE` 800), which the .50 AE can chip
away. Reinforced concrete (`coreE` 2 700) yields only to the .50 BMG and
explosives.

---

## 2. Material table (`MAT`)

`res` is energy loss per cm of material in J/cm. `hard` = 1 means the
calibre's hardness factor applies. Debris colours are sRGB hex for W4/W1.

| id | res J/cm | hard | Evidence | Debris (size, colour) | Decal | Hit VFX / SFX id |
|---|---:|:-:|---|---|---|---|
| `gyp` | 25 | 0 | **D** — AFTE: 9mm loses ≈12 m/s per ½″ sheet ⇒ ≈32 J per 1.27 cm sheet (≈64 J per two-sheet partition) | fine powder + small flakes, `#e8e4dc` | clean round hole, paper tear ring | `vfx_gyp_plume` (white puff normal to exit face) / `sfx_board_thud` |
| `timber` | 30 | 0 | **D** — BOT1: 9mm JHP passed 8 ¾″ pine boards and stopped in the 9th (≈15.2 cm); model stops a 9mm in 15.3 cm, and a 9mm hitting a stud keeps ≈33 % | splinters, `#b88a55` | splintered hole | `vfx_splinter` / `sfx_wood_crack` |
| `ply` | 40 | 0 | **P** — denser than pine, below particleboard | splinters, `#c49a6c` | splintered hole | `vfx_splinter` / `sfx_wood_crack` |
| `particle` | 45 | 0 | **P** — MDF study (Liu 2021) confirms pistol perforation; no extracted J/cm | crumbs, `#b59a76` | ragged hole | `vfx_chipdust` / `sfx_board_thud` |
| `plaster` | 60 | 0 | **P** — lime/gypsum plaster ≈ 2× gypsum board density | chunks + dust, `#efe9df` | crater with cracks | `vfx_plaster_burst` / `sfx_plaster` |
| `stucco` | 100 | 0 | **P** — cement render; CAN notes stucco face only | gritty chunks, `#f1d9c4` (paint) over `#9a958c` | crater, painted rim | `vfx_stucco_burst` / `sfx_masonry_hit` |
| `cmu` | 345 | 1 | **D** — A: 2″ concrete stops 5.56 ⇒ ≥ 345; CAN: 5.56 perforates a 3.2 cm face shell, stops on the back shell | grey chunks 2–5 cm, `#8d8a84` | crater + radial cracks; rear-face spall | `vfx_masonry_dust` / `sfx_masonry_hit` |
| `grout` | 345 | 1 | **P** — treat like block concrete | as `cmu` | as `cmu` | as `cmu` |
| `brick` | 400 | 1 | **D** — CAN: 90 mm brick stopped .223 and .308 ⇒ ≥ 390 | red chunks, `#a2513a` | crater, red dust | `vfx_brick_dust` / `sfx_masonry_hit` |
| `clay` | 400 | 1 | **P** — hollow clay tile shells (Deco interiors); brittle | terracotta shards, `#c0703f` | shatter crater | `vfx_brick_dust` / `sfx_tile_crack` |
| `concrete` | 900 | 1 | **G** — lower bound 345 (A, 2″ stops 5.56); A Table 7-3 implies ≈650 J/cm for structural concrete. Raised to 900 so a single .50 ball does **not** perforate 20 cm RC, matching A's tables that need repeated .50 rounds for 10″ RC | grey chunks, `#a19d95` | shallow crater, scab on rear | `vfx_concrete_dust` / `sfx_concrete_hit` |
| `glass` | 60 | 0 | **P** — annealed/tempered 6 mm; pistols pass easily (TEMP, H) | annealed: shards; tempered: 1 cm cubes `#cfe6e8` | annealed: star hole; tempered: whole pane crazes then falls | `vfx_glass_shatter` / `sfx_glass_break` |
| `glass_lam` | 300 | 0 | **P** — laminated windshield / studio glass; GLASS gives a ballistic limit for 7.62 AP only | none (retained) | radial cracks, interlayer holds | `vfx_glass_craze` / `sfx_glass_crunch` |
| `steel` | 1500 | 1 | **D** — A: 5.56 perforates ⅜″ mild steel door (≈19 % left in model); CAR: 9mm passes one car-door skin pair, stops in the next. Per-calibre `metal` factor applies | sparks only | lead splash / bright crater | `vfx_spark` / `sfx_ricochet_metal` |
| `alu` | 600 | 1 | **P** — ≈ 0.4× mild steel | sparks + flakes, `#c8ccd0` | bright dent hole | `vfx_spark` / `sfx_metal_hit` |
| `grp` | 80 | 0 | **P** — glass-reinforced plastic hull/panels | white fibre fluff, `#f0f0ea` | fuzzy hole | `vfx_fibre` / `sfx_hull_hit` |
| `foam` | 3 | 0 | **P** — upholstery | foam flecks + fabric | tear | `vfx_stuffing` / `sfx_cloth` |
| `mattress` | 5 | 0 | **P** — innerspring + batting | stuffing | tear | `vfx_stuffing` / `sfx_cloth` |
| `insul` | 2 | 0 | **P** — mineral / glass-fibre batt | yellow fluff, `#d8c070` | — | (inherits outer layer) |
| `void` | 0 | 0 | air cavity | — | — | — |

Notes:

- Gypsum removes velocity more like a constant Δv than a constant ΔE
  (AFTE). Constant J/cm slightly overstates the loss for slow rounds. Accept it
  for v1; revisit if W5's Node tables show buckshot stopping too early.
- `cmu` is **block** concrete (lower strength than structural concrete). It is
  the same material as `grout` for gameplay purposes.
- `concrete` is the only material where the value is set by a gameplay
  constraint (G). See §6.

---

## 3. Construction table (wall builds)

Thickness in cm, outer → inner. "Alt" is the stochastic alternate stack.
`cellHp` and `coreE` drive cell destruction (roadmap §2.3).

| id | What it is in 1986 Miami | Layers (cm) | Total | Alt (chance) | coreE J | cellHp J | Evidence |
|---|---|---|---:|---|---:|---:|---|
| `stud_wood_gyp` | ½″ drywall on 2×4 wood studs @16″ — motel bathrooms, closets, cheap partitions | gyp 1.27 · void 8.9 · gyp 1.27 | 11.4 | **stud**: timber 8.9 replaces void (9 %) | — | 600 | V (dims) C4, M1; D (res) |
| `stud_steel_gyp` | ⅝″ drywall on 3⅝″ steel studs — tower/office/retail partitions | gyp 1.59 · void 9.2 · gyp 1.59 | 12.4 | stud flange: negligible, ignore | — | 700 | V C4 |
| `stud_steel_gyp2` | 2 layers ⅝″ each side + batt — unit separation, corridor, rated walls | gyp 3.18 · insul 9.2 · gyp 3.18 | 15.6 | — | — | 1 400 | P (typical rated assembly) |
| `particle_divider` | ¾″ particleboard divider, office cubicle, booth back, partition screen | particle 1.9 | 1.9 | — | — | 400 | P |
| `plaster_lath` | Plaster on wood lath, 1930s Deco interiors | plaster 2 · timber 0.6 · void 9 · timber 0.6 · plaster 2 | 14.2 | stud 9 %: plaster 2 · timber 10.2 · plaster 2 | — | 1 500 | V (era) A1, A3; P (dims) |
| `clay_tile_4` | 4″ hollow clay tile partition, plastered, Deco hotels | plaster 1.5 · clay 1.0 · void 7.6 · clay 1.0 · plaster 1.5 | 12.6 | — | 800 | 8 000 | P (A1 warns not to assume it everywhere) |
| `cbs_ext` | **CBS**: 8″ hollow CMU + stucco outside, plaster inside — motel, Deco shell, strip mall | stucco 1.9 · cmu 3.2 · void 13 · cmu 3.2 · plaster 1.3 | 22.6 | **web**: cmu 19.4 solid (19 %) | 1 600 | 35 000 | V M1, A1, A2, C3, C5 |
| `cmu_hollow` | 8″ hollow CMU plastered both sides — motel demising walls, back-of-house | plaster 1.3 · cmu 3.2 · void 13 · cmu 3.2 · plaster 1.3 | 22.0 | web 19 % | 1 600 | 35 000 | V C5; P (use between rooms, M1) |
| `cmu_filled` | Grouted / reinforced CMU — tie columns, bond beams, stair & shaft walls | plaster 1.3 · grout 19.4 · plaster 1.3 | 22.0 | — | 1 600 | 70 000 | V C3 (tie columns), CMHA |
| `brick_1w` | Single-wythe brick / Roman-brick veneer, planters, screen walls | brick 9 | 9 | — | 1 600 | 52 000 | V M1 (Roman brick), CAN |
| `brick_2w` | Double-wythe brick (rare in Miami; use sparingly) | brick 21.5 | 21.5 | — | 1 600 | 105 000 | P |
| `brick_cmu_ext` | Brick veneer + air gap + CMU — 1980s low-rise commercial facade | brick 9 · void 2.5 · cmu 3.2 · void 13 · cmu 3.2 | 30.9 | web 19 %: brick 9 · void 2.5 · cmu 19.4 | 1 600 | 90 000 | V CAN (tested assembly) |
| `rc_wall_20` | 20 cm reinforced concrete — tower core, shear wall, stair/elevator shaft, parking structure | plaster 1.3 · concrete 20 · plaster 1.3 | 22.6 | — | 2 700 | 210 000 | V (tower RC) P5, P6; P (thickness) |
| `rc_column_40` | 40 cm RC column (tower), pier | concrete 40 | 40 | — | ∞ | ∞ (indestructible) | P |
| `glass_annealed_6` | Old plate glass, jalousie slats, mirrors | glass 0.6 | 0.6 | — | — | 1 (whole pane) | P |
| `glass_tempered_6` | Storefront doors, sliding patio doors, shower screens | glass 0.6 | 0.6 | — | — | 1 (whole pane, crazes) | P; TEMP |
| `glass_lam_windshield` | Car windshield | glass_lam 0.76 | 0.76 | — | — | 1 500 (crazes, stays) | P; GLASS |
| `glass_studio` | Studio control-room window: 2 laminated leaves, 20 cm gap | glass_lam 1.2 · void 20 · glass_lam 1.0 | 22.2 | — | — | 6 000 | V S5 (period detail) |
| `door_hollow` | Hollow-core interior door | ply 0.3 · void 2.9 · ply 0.3 | 3.5 | — | — | 300 (lock: 800, §5) | P |
| `door_solid` | Solid-core (particle) door — motel guest door, apartment entry | ply 0.3 · particle 3.85 · ply 0.3 | 4.45 | — | — | 1 500 (lock: 3 000, §5) | P (≈1¾″ standard) |
| `door_metal` | Hollow-metal door — service, stair, shaft, back-of-house | steel 0.12 · void 4.2 · steel 0.12 | 4.44 | — | — | 4 000 (lock/hinge: 6 000, §5) | P (18-gauge skins) |
| `car_door` | 1980s sedan door | steel 0.08 · void 10 · steel 0.08 | 10.2 | window mech 15 %: + steel 0.3 | — | 3 000 | V CAR (qualitative) |
| `car_engine` | Engine block line through a car | steel 6 | 6 | — | ∞ | ∞ | P; A (engine block is cover) |
| `steel_3mm` | ⅛″ plate: dumpster, cabinet, shed panel | steel 0.32 | 0.32 | — | ∞ | ∞ | P |
| `steel_10mm` | ⅜″ plate: safe door, yacht structural bulkhead | steel 0.95 | 0.95 | — | ∞ | ∞ | V A (⅜″ door) |
| `corrugated` | Corrugated steel shed cladding | steel 0.05 | 0.05 | — | — | 800 | V R1 |
| `alu_bulkhead` | Yacht aluminium superstructure lined | alu 0.6 · insul 5 · ply 1.2 | 6.8 | — | — | 5 000 | V Y2, Y3; P (dims) |
| `joinery_ply` | Yacht cabin joinery partition | ply 1.9 · insul 5 · ply 1.2 | 8.1 | — | — | 1 200 | P (Y2, Y3) |
| `grp_hull` | GRP small boat hull / runabout | grp 1.5 | 1.5 | — | — | 2 500 | P |
| `acoustic_double` | Studio double-leaf wall | gyp 3.18 · insul 9 · void 5 · insul 9 · gyp 3.18 | 29.4 | — | — | 3 000 | V S4, S5 (approach); P (dims) |
| `sofa` | Upholstered sofa / booth seat (prop) | foam 60 · timber 2 | 62 | — | — | 1 500 | P |
| `mattress` | Mattress on edge (barricade prop) | mattress 22 | 22 | — | — | 800 | P |
| `counter_cmu` | Bar die built of CMU with ply face | ply 0.6 · cmu 3.2 · void 3.6 · cmu 3.2 | 10.6 | — | 1 600 | 20 000 | P |
| `counter_cabinet` | Kitchen / reception cabinet run | ply 1.9 · void 55 · ply 1.9 | 58.8 | — | — | 1 200 | P |

### Stochastic members

- **Wood studs**: 3.8 cm wide at 40.6 cm centres ⇒ 9.4 % of hits strike a
  stud. Roll per hit (or derive from the hit's position along the wall:
  `frac((s + phase)/0.406) < 0.094`, which is deterministic and lets the
  visualiser draw the studs). Steel stud flanges are 1 mm and ignored.
- **CMU webs**: an 8″ block has three webs ≈ 3.2 cm each per 40.6 cm block ⇒
  ≈ 19 % (rounded from 23 % to allow for tapered webs). A web hit uses
  19.4 cm solid `cmu`. Webs are what make some rifle hits on block stop dead
  while others punch through the front shell.
- **Car window regulator**: 15 % of hits on a `car_door` add a 3 mm steel
  layer. P only; gives the "sometimes stopped" feel from CAR.

### Coverage is separate

`cov` (full/chest/waist/rail/glass) is the wall's **height** class from the
roadmap. Build and coverage combine freely: a `cbs_ext` at `waist` is a
frontage planter wall; a `stud_wood_gyp` at `full` is a bathroom wall;
`glass_tempered_6` at `full` is a sliding door. A "curtain" open fill (blocks
sight, not bullets: `res` 0, `sight` false) is suggested for W1 for motel
windows and bead curtains.

---

## 4. Construction palette by mission typology

What a level designer should pick by default. Exceptions need a reason in the
level doc.

| Typology (missions) | Exterior | Room-to-room | Inside a unit | Doors | Glazing | Other |
|---|---|---|---|---|---|---|
| **1950s MiMo motel** (Motel Sunset) | `cbs_ext` | `cmu_hollow` (between guest rooms) | `stud_wood_gyp` (bath, closet) | `door_solid` guest; `door_metal` service; `door_hollow` bath | `glass_annealed_6` jalousies; `glass_tempered_6` office storefront | planters `brick_1w`/`cbs_ext` waist; cars |
| **1930s Deco hotel → nightclub** (Club Flamingo) | `cbs_ext` | `cmu_hollow` or `clay_tile_4` | `plaster_lath`; new club fit-out `stud_steel_gyp` | `door_solid`; `door_metal` back-of-house | `glass_annealed_6` | `counter_cmu` bar die; booths `sofa` |
| **1980s Brickell tower** (Penthouse) | glazing + `rc_column_40`; spandrel `cbs_ext` | `stud_steel_gyp2` (unit/corridor); `rc_wall_20` core | `stud_steel_gyp` | `door_solid`; `door_metal` stairs/service | `glass_tempered_6` sliding doors; `glass_annealed_6` (P) fixed | `counter_cabinet` kitchen |
| **Marina** (Marina) | office `cbs_ext`; shed `corrugated` on steel frame | `stud_steel_gyp` | `stud_steel_gyp` | `door_metal`; big shed doors `corrugated` | `glass_annealed_6` | boats `grp_hull`; fuel tanks `steel_3mm`; dock piles `rc_column_40` |
| **Strip centre arcade** (Arcade) | `cbs_ext` or `brick_cmu_ext` | `stud_steel_gyp2` (tenant demising) | `stud_steel_gyp`, `particle_divider` | `door_metal` rear; storefront `glass_tempered_6` | `glass_tempered_6` | arcade cabinets ≈ `counter_cabinet` |
| **Mall** (Mall) | `rc_wall_20` / `cbs_ext` | `stud_steel_gyp2` | `stud_steel_gyp`, `particle_divider` | storefront `glass_tempered_6`; roll-down grille (rail cov) | `glass_tempered_6` | kiosks `counter_cabinet` |
| **Recording studio** (Studio) | `cbs_ext` | `acoustic_double` | `stud_steel_gyp` (offices) | `door_solid` ×2 sound lock | `glass_studio` | consoles `counter_cabinet` |
| **1980s motor yacht** (Royal Flush) | hull `steel_10mm`; superstructure `alu_bulkhead` | `joinery_ply` | `joinery_ply` | `door_hollow` cabin; `door_metal` watertight | `glass_lam_windshield` (P, marine glazing) | engine room `steel_10mm` |

Why it matters for play: the motel is **masonry country** — shooting through
walls is limited to bathroom partitions and doors, so cover is reliable and
fights happen through doorways and windows. The penthouse is **plasterboard
paradise** — almost every interior wall is penetrable by everything, so cover
is concealment and positioning beats hiding. The yacht and marina sit in
between. This contrast is the main gameplay reason to model builds at all.

---

## 5. Destruction targets (cells, holes, breaching)

Roadmap §2.3 has 0.5 m cells. These are the targets the world core should
meet; they are **G** where marked.

### Rounds to remove one 0.5 m cell

`cellHp ÷ energy deposited per hit` (energy deposited = `eIn − eOut` in that
construction, all pellets of a shell together, counted only if
`eIn × hard ≥ coreE`). Computed by `rounds_per_cell()` in `pen_model.py`, the
same script as the BALLISTICS.md matrix; numbers below are its output.

| Construction | 9mm / Uzi / .45 / .357 | .50 AE | 12ga 00 (shells) | slug | 5.56 | 7.62×39 | .50 BMG |
|---|---:|---:|---:|---:|---:|---:|---:|
| `stud_wood_gyp` | 10 | 10 | 2 | 10 | 10 | 10 | 10 |
| `door_solid` | 8 | 8 | 1 | 8 | 8 | 8 | 8 |
| `clay_tile_4` | never | 7 | never | 5 | 9 | 11 | 9 |
| `cmu_hollow` / `cbs_ext` | never | never | never | 11 | **20 G** | 19 | 15 |
| `cmu_filled` | never | never | never | 21 | 40 | 35 | 11 |
| `brick_1w` | never | never | never | 16 | **30 G** | 26 | 15 |
| `brick_2w` | never | never | never | 31 | **60** | 52 | 13 |
| `brick_cmu_ext` | never | never | never | 27 | **52 G** | 45 | 16 |
| `rc_wall_20` | never | never | never | never | never | never | 13 |

Comparison with the Army breaching table (A, FM 3-06.11 Table 7-2, 5.56
M855 at close range; "loophole" ≈ a firing port, "breach hole" ≈ a
man-sized hole, i.e. several of our cells):

| A Table 7-2 target | Rounds (A) | Nearest construction | Model, rounds per cell | Ratio |
|---|---|---|---:|---|
| 9″ double brick wall | 70 to loophole, 120 to breach hole | `brick_2w` (21.5 cm) | 60 | ≈ 1.2× fewer to loophole; a breach hole (≈ 4 cells) costs ≈ 240, 2× more than A |
| 12″ CMU + brick veneer | 60 to loophole, 250 to breach hole | `brick_cmu_ext` (30.9 cm) | 52 | ≈ 1.2× fewer to loophole; breach hole ≈ 210, close to A |
| 8″ reinforced concrete | 35 to initial penetration, 250 to loophole | `rc_wall_20` | never (5.56 below `coreE`) | **G**: we forbid rifle breaching of RC outright |
| 10″ RC vs .50 cal | ≈ 50 rounds for a 12″ hole | `rc_wall_20` | 13 per cell (one cell ≈ a 12″ hole) | ≈ 4× fewer (**G**: the anti-materiel rifle should visibly work) |

So the gap to the Army tables is **not** a uniform factor. Brick and
brick-faced block are close to real; single-wythe brick and hollow CMU have no
direct Army row (A gives no single-block figure), and their 20–30 rounds per
cell are **G**: one committed M16 magazine opens a firing port in a motel
wall. RC is stricter than reality for rifles (G) so tower cores stay
reliable. If the user wants strict realism, multiply hollow-CMU and
single-brick `cellHp` by ≈2.

Rules:

1. **Handguns (including the .50 AE), SMGs and buckshot never breach
   masonry or concrete.** They spall the face (decal + dust) but
   `eIn × hard < coreE` (1 600 J for block and brick; the .50 AE delivers
   1 965 × 0.8 = 1 572 J). This matches every source (GEAR, CAN, A).
   **Exception:** hollow clay tile (`coreE` 800) is brittle; the .50 AE and
   all rifles and slugs wear it away. Pistols, .357 and buck still only spall
   it.
2. **Partitions fall apart under sustained fire** from anything: a 32-round
   Uzi magazine removes ≈3 cells of drywall (a hole you can see and shoot
   through, not yet walk through). BOT14 supports easy perforation; hole size
   is **G**.
3. **Doors: locks and hinges are a separate target.** A hit within 0.25 m of
   the lock or a hinge applies the **full incoming energy** (all pellets of a
   buck shell) to the door's `lockHp`, not the energy deposited in the leaf.
   That is how real breaching rounds work: they destroy the hardware, not the
   slab. `lockHp` (P): `door_hollow` 800, `door_solid` 3 000, `door_metal`
   6 000. Hits needed (`pen_model.py`): `door_solid` 1 slug or 2 buck shells
   or ≈7 9mm; `door_metal` 2 slugs or 3 buck shells or ≈13 9mm. Hits on the
   leaf away from hardware use the ordinary energy-deposit rule, so buck
   (which stops in the leaf and deposits everything) chews a hole in a solid
   door in 1 shell while a slug passes through and barely marks it.
4. Removing the cell of a wall containing a stud or web leaves a jagged edge:
   W1 can keep the cell visible as "damaged" (alpha-cut) for one extra hit.

### Explosives (40 mm HE, M406)

32 g Composition B ≈ 160 kJ chemical energy (GRENADE, HE). Suggested wall
damage, applied directly to `cellHp` (bypasses `coreE`):

`Jwall(d) = 55 000 × (0.25 / max(d, 0.25))⁵`

- `d` is the 3D distance in metres from the burst point to the **centre of
  the cell** on the wall-face grid. Cells are 2D: 0.5 m along the wall × 0.5 m
  high (rows from the floor), so a contact burst at chest height affects cells
  in the rows above and below too.
- The steep exponent makes the effect local: real 40 mm HE breaches only
  light construction. FM 3-06.11 §7-4b(1) notes that even the HEDP round
  makes only a rifle-sized hole in plaster or plywood; ours is generous
  (**G**) so the grenade launcher is useful against partitions.

Removal reach (`Jwall(d) ≥ cellHp`, from `pen_model.py`):

| Construction | Cells removed out to `d` | At contact | Check |
|---|---:|---|---|
| `stud_wood_gyp` / `stud_steel_gyp` | 0.62 / 0.60 m | hole 2–3 cells wide × 2–3 rows | **G target** |
| `door_solid` / `door_metal` | 0.51 / 0.42 m | door leaf holed; door destroyed if the burst is within 0.25 m of the lock (full 55 kJ ≥ `lockHp`) | — |
| `clay_tile_4` | 0.37 m | 1–2 cells | — |
| `cmu_hollow` / `cbs_ext` | 0.27 m | 1 cell + spall decal around | **G target** |
| `brick_1w` | 0.25 m | 1 cell only on direct contact | — |
| `cmu_filled`, `brick_2w`, `brick_cmu_ext`, `rc_wall_20` | never | scorch/crater decal only | **G target** |

**Glass:** every pane within 5 m of the burst shatters (the M406 casualty
radius, HE), regardless of `Jwall`.

Personnel: 5 m casualty radius (HE). Fragments do not penetrate masonry; they
do pass drywall (treat as 12ga 00 pellets with e0 ≈ 150 J, P).
---

## 6. Open issues and contradictions

1. **"5.56 only chips CMU"** (roadmap §2.2 calibration target) is too
   categorical. CAN shows 5.56 perforates the **front shell** of hollow CMU and
   stops on the back shell. The model reproduces that. Proposed new target:
   "5.56 perforates the front shell of hollow CMU but not the wall."
   **Conflict disclosed:** A §7-2b(3) says a single cinder block "offers
   little protection" from 5.56, which suggests full perforation. CAN tested
   a 140 mm block and saw the round stop on the back shell. We follow CAN
   (instrumented test, closer to Miami 8″ block) and keep this tagged **P**.
2. **"Buckshot stops quickly"** (roadmap) is contradicted by BOT14: 00 buck
   passed four separated drywall walls. The model leaves 11 % per pellet after
   4 partitions and stops on the 5th. Proposed target: "buck passes up to 4
   partitions, stops in a car door or any masonry."
3. **7.62×39 M43 through hollow CMU** perforates with ≈ 9 % retained (the
   steel core's hardness 1.3). No source tested M43 against CMU; this is **P**.
   Real-world anecdote supports AK rounds passing single block walls; keep it.
4. **TIPS text "Bar counters and kitchen counters stop bullets"** is wrong for
   kitchen counters (`counter_cabinet` passes everything). Only a CMU bar die
   (`counter_cmu`) stops pistols and 5.56. Suggest W5/W7 amend the tip to
   "Masonry bar fronts stop most bullets; kitchen cabinets don't."
5. **Concrete `res` 900 and RC `coreE` 2 700** are gameplay-set (G): one
   .50 BMG ball does not pass 20 cm RC, and no rifle short of the .50 can
   chip RC (A says 5.56 eventually holes 8″ RC). If W14's anti-materiel rifle
   needs to shoot through tower shear walls, that is a design decision, not a
   research one.
6. **Gypsum Δv vs ΔE** (§2 note). Accept for v1.
7. **Knife-edge cells.** Two outcomes sit within a few joules of `eMin`:
   4× `stud_wood_gyp` with buck ends at ≈33 J per pellet, and 7.62×39 through
   `cbs_ext` exits with ≈60 J (3 %). W5's tests should run with stochastic
   rolls disabled and assert that a pass stays a pass. Small tuning of
   `res` can flip these; rerun `pen_model.py` after any change.

---

## 7. Florida code history (why these builds are period-correct)

| Period | What applies | Consequence for 1986 |
|---|---|---|
| 1957 | Dade adopts the South Florida Building Code (SFBC). C1 | 1950s motels were built to early SFBC: CBS shells. |
| 1979, 1984 | SFBC editions. C1, C2 | A 1986 build would follow the 1984 edition. |
| 1986 | Game year. | No impact glazing; jalousies and plain plate glass are period-correct. |
| 1992 | Hurricane Andrew. FEMA FIA-22 finds CBS outperformed wood framing; failures traced to missing reinforcement, tie beams and roof straps. C3 | CBS was standard **before** Andrew. Pre-1992 ≠ timber walls. |
| 1994 / 2002 | Post-Andrew SFBC (1 Sept 1994); statewide FBC replaces SFBC (2002). C1, C2 | Do not use modern impact glass or modern product approvals. |

Steel studs + gypsum were standard commercial/high-rise practice from the
1950s–60s (C4). Timber studs remain plausible in low-rise motels (M1).

---

## 8. JS literal proposals (for W1/W5; not runtime yet)

```js
// res J/cm; hard: 1 = calibre hardness factor applies. Colours sRGB.
const MAT = {
  gyp:{res:25,hard:0,debris:0xe8e4dc,vfx:'gyp_plume',sfx:'board_thud'},
  timber:{res:30,hard:0,debris:0xb88a55,vfx:'splinter',sfx:'wood_crack'},
  ply:{res:40,hard:0,debris:0xc49a6c,vfx:'splinter',sfx:'wood_crack'},
  particle:{res:45,hard:0,debris:0xb59a76,vfx:'chipdust',sfx:'board_thud'},
  plaster:{res:60,hard:0,debris:0xefe9df,vfx:'plaster_burst',sfx:'plaster'},
  stucco:{res:100,hard:0,debris:0x9a958c,vfx:'stucco_burst',sfx:'masonry_hit'},
  cmu:{res:345,hard:1,debris:0x8d8a84,vfx:'masonry_dust',sfx:'masonry_hit',spall:1},
  grout:{res:345,hard:1,debris:0x8d8a84,vfx:'masonry_dust',sfx:'masonry_hit',spall:1},
  brick:{res:400,hard:1,debris:0xa2513a,vfx:'brick_dust',sfx:'masonry_hit',spall:1},
  clay:{res:400,hard:1,debris:0xc0703f,vfx:'brick_dust',sfx:'tile_crack',spall:1},
  concrete:{res:900,hard:1,debris:0xa19d95,vfx:'concrete_dust',sfx:'concrete_hit',spall:1},
  glass:{res:60,hard:0,debris:0xcfe6e8,vfx:'glass_shatter',sfx:'glass_break',pane:1},
  glass_lam:{res:300,hard:0,debris:0,vfx:'glass_craze',sfx:'glass_crunch'},
  steel:{res:1500,hard:1,debris:0,vfx:'spark',sfx:'ricochet_metal'},
  alu:{res:600,hard:1,debris:0xc8ccd0,vfx:'spark',sfx:'metal_hit'},
  grp:{res:80,hard:0,debris:0xf0f0ea,vfx:'fibre',sfx:'hull_hit'},
  foam:{res:3,hard:0,debris:0,vfx:'stuffing',sfx:'cloth'},
  mattress:{res:5,hard:0,debris:0,vfx:'stuffing',sfx:'cloth'},
  insul:{res:2,hard:0}, void:{res:0,hard:0},
};
// layers outer→inner [mat, cm]; alt = stochastic member {p, layers}; lockHp = §5 rule 3
const BUILD = {
  stud_wood_gyp:{layers:[['gyp',1.27],['void',8.9],['gyp',1.27]],alt:{p:0.094,layers:[['gyp',1.27],['timber',8.9],['gyp',1.27]]},cellHp:600},
  stud_steel_gyp:{layers:[['gyp',1.59],['void',9.2],['gyp',1.59]],cellHp:700},
  stud_steel_gyp2:{layers:[['gyp',3.18],['insul',9.2],['gyp',3.18]],cellHp:1400},
  particle_divider:{layers:[['particle',1.9]],cellHp:400},
  plaster_lath:{layers:[['plaster',2],['timber',0.6],['void',9],['timber',0.6],['plaster',2]],alt:{p:0.094,layers:[['plaster',2],['timber',10.2],['plaster',2]]},cellHp:1500},
  clay_tile_4:{layers:[['plaster',1.5],['clay',1],['void',7.6],['clay',1],['plaster',1.5]],coreE:800,cellHp:8000},
  cbs_ext:{layers:[['stucco',1.9],['cmu',3.2],['void',13],['cmu',3.2],['plaster',1.3]],alt:{p:0.19,layers:[['stucco',1.9],['cmu',19.4],['plaster',1.3]]},coreE:1600,cellHp:35000},
  cmu_hollow:{layers:[['plaster',1.3],['cmu',3.2],['void',13],['cmu',3.2],['plaster',1.3]],alt:{p:0.19,layers:[['plaster',1.3],['cmu',19.4],['plaster',1.3]]},coreE:1600,cellHp:35000},
  cmu_filled:{layers:[['plaster',1.3],['grout',19.4],['plaster',1.3]],coreE:1600,cellHp:70000},
  brick_1w:{layers:[['brick',9]],coreE:1600,cellHp:52000},
  brick_2w:{layers:[['brick',21.5]],coreE:1600,cellHp:105000},
  brick_cmu_ext:{layers:[['brick',9],['void',2.5],['cmu',3.2],['void',13],['cmu',3.2]],alt:{p:0.19,layers:[['brick',9],['void',2.5],['cmu',19.4]]},coreE:1600,cellHp:90000},
  rc_wall_20:{layers:[['plaster',1.3],['concrete',20],['plaster',1.3]],coreE:2700,cellHp:210000},
  rc_column_40:{layers:[['concrete',40]],cellHp:Infinity},
  glass_annealed_6:{layers:[['glass',0.6]],cellHp:1,pane:1},
  glass_tempered_6:{layers:[['glass',0.6]],cellHp:1,pane:1,tempered:1},
  glass_lam_windshield:{layers:[['glass_lam',0.76]],cellHp:1500},
  glass_studio:{layers:[['glass_lam',1.2],['void',20],['glass_lam',1]],cellHp:6000},
  door_hollow:{layers:[['ply',0.3],['void',2.9],['ply',0.3]],cellHp:300,lockHp:800},
  door_solid:{layers:[['ply',0.3],['particle',3.85],['ply',0.3]],cellHp:1500,lockHp:3000},
  door_metal:{layers:[['steel',0.12],['void',4.2],['steel',0.12]],cellHp:4000,lockHp:6000},
  car_door:{layers:[['steel',0.08],['void',10],['steel',0.08]],alt:{p:0.15,layers:[['steel',0.08],['steel',0.3],['void',10],['steel',0.08]]},cellHp:3000},
  car_engine:{layers:[['steel',6]],cellHp:Infinity},
  steel_3mm:{layers:[['steel',0.32]],cellHp:Infinity},
  steel_10mm:{layers:[['steel',0.95]],cellHp:Infinity},
  corrugated:{layers:[['steel',0.05]],cellHp:800},
  alu_bulkhead:{layers:[['alu',0.6],['insul',5],['ply',1.2]],cellHp:5000},
  joinery_ply:{layers:[['ply',1.9],['insul',5],['ply',1.2]],cellHp:1200},
  grp_hull:{layers:[['grp',1.5]],cellHp:2500},
  acoustic_double:{layers:[['gyp',3.18],['insul',9],['void',5],['insul',9],['gyp',3.18]],cellHp:3000},
  sofa:{layers:[['foam',60],['timber',2]],cellHp:1500},
  mattress:{layers:[['mattress',22]],cellHp:800},
  counter_cmu:{layers:[['ply',0.6],['cmu',3.2],['void',3.6],['cmu',3.2]],coreE:1600,cellHp:20000},
  counter_cabinet:{layers:[['ply',1.9],['void',55],['ply',1.9]],cellHp:1200},
};
```

Roadmap §2.2 names a single `res` and `thick` per material; this proposal
moves thickness into `BUILD` layer stacks so one material can appear at
several thicknesses. That is a **contract change** for W1 to accept or
reject. A flattening fallback is trivial: `res_eff = Σ res·t` per build.

---

## 9. Sources

Ballistics and materials testing (full descriptions in BALLISTICS.md §9):

- **BOT1** Box O' Truth #1, drywall and pine boards — <https://www.theboxotruth.com/threads/the-box-o-truth-1-the-original-box-o-truth.278/>
- **BOT14** Box O' Truth #14, separated drywall walls — <https://www.theboxotruth.com/threads/the-box-o-truth-14-rifles-shotguns-and-walls.310/>
- **CAR** Buick O' Truth #3, pistols vs car doors — <https://www.theboxotruth.com/threads/the-buick-o-truth-3-pistols-and-car-doors.343/>
- **CAN** Resistance of Exterior Walls to High Velocity Projectiles (Canadian police/masonry study) — <https://masoncontractors.org/public/documents/pdf/technical-resources/resistance_of_exterior_walls_to_high_velocity_projectiles.pdf>
- **A** US Army FM 3-06.11 ch. 7, penetration and breaching tables — <https://www.usarmorment.com/pdf/FM3-06_Urban_Combat.pdf>
- **AFTE** Haag & Jason, Drywall terminal ballistics — <https://www.academia.edu/40035203/Drywall_Terminal_Ballistic_Properties_of_Forensic_Interest>
- **GLASS** Osnes et al. 2021, laminated glass ballistic impact — <https://www.glassonweb.com/article/experimental-tests-and-numerical-simulations-ballistic-impact-laminated-glass>
- **GEAR** 9mm vs cement block — <https://gear-report.com/9mm-ammunition-barrier-penetration-test-cement-block/>
- **CMHA** CMU ballistic resistance FAQ — <https://www.cmha.org/resource/cmu-faq-016/>
- **MDF** Liu et al. 2021, 9mm vs MDF — <https://www.bzycj.cn/en/article/doi/10.11883/bzycj-2020-0148?viewType=HTML>
- **TEMP** Thornton & Cashman 1986, tempered glass deflection — <https://books.google.com/books/about/The_Effect_of_Tempered_Glass_on_Bullet_T.html?id=IFd9zgEACAAJ>
- **GRENADE** TM 43-0001-28 ammunition data sheets (M406) — <https://ia803109.us.archive.org/9/items/milmanual-tm-43-0001-28-army-ammunition-data-sheets/tm_43-0001-28_army_ammunition_data_sheets.pdf>
- **HE** FAS M406 — <https://man.fas.org/dod-101/sys/land/docs/m406.htm>

Construction and typology:

- **C1** Miami-Dade SFBC history — <https://www.miamidade.gov/global/economy/board-and-code/building-code-history.page>
- **C2** Florida Building Commission milestones — <https://floridabuilding.org/fbc/commission/FBC_0824/Commission/Updated-Commission-Milestones_061824.pdf>
- **C3** FEMA FIA-22 Hurricane Andrew report — <https://www.fema.gov/sites/default/files/2020-08/fia22_complete.pdf>
- **C4** BuildSteel, history of cold-formed steel framing — <https://buildsteel.org/why-steel/cold-formed-steel-101/evolution-and-revolution-of-cold-formed-steel-framing/>
- **C5** CMHA concrete masonry unit reference — <https://www.cmha.org/resource/cmu-tec-001/>
- **M1** Vagabond Motel NRHP nomination (§7: masonry, wood roofs, jalousies, terrazzo) — <https://npgallery.nps.gov/GetAsset/ec11f82c-6ef5-475f-87da-edf2b2226f08>
- **A1** Colony Hotel survey (cement block, RC foundation) — <https://www.ruskinarc.com/mdpl/Ocean-CollinsDistrict/4626-736%20Ocean%20Dr/detail>
- **A2** Carlton Hotel survey (concrete block + stucco) — <https://www.ruskinarc.com/mdpl/Ocean-CollinsDistrict/4757-1433%20Collins%20Ave/view>
- **A3** Flamingo Park designation report (finishes) — <https://events.miamibeachfl.gov/wp-content/uploads/2017/08/Flamingo-Park.pdf>
- **P5** Arquitectonica, The Palace (cores, glazing) — <https://architizer.com/projects/the-palace/>
- **P6** Arquitectonica, The Atlantis — <https://architizer.com/projects/the-atlantis/>
- **R1** Pan American Seaplane Base designation (steel frame, corrugated hangars) — <https://www.historicpreservationmiami.com/pdfs/Pan%20American%20Seaplane%20Base%20and%20Terminal%20Building.pdf>
- **S4** Gilby 1984, floating studio floor — <https://www.muzines.co.uk/articles/constructing-a-floating-studio-floor/1339>
- **S5** Gilby 1984, control-room window — <https://www.muzines.co.uk/articles/building-a-control-room-window/2884?theme=1>
- **Y2** Lady Sandals (ex-Gallant Lady, 1985) spec: steel hull, aluminium superstructure — <https://www.boatinternational.com/yachts-for-sale/lady-sandals-feadship-1985>
- **Y3** 1985 Broward Harlina: aluminium hull — <https://www.yachtbuyer.com/en-us/fleet/harlina-100-broward>
