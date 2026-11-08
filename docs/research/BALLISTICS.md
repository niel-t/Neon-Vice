# Neon Vice — ballistics reference (calibres vs walls)

Owner: W3. Consumers: W5 ballistics (CAL table, Node tables), W1 world core
(penetration loop, destruction), W6 loadout (calibre labels, tooltips), W7
TIPS text.

Answers user decision Q20: "Calibers penetration should be realistic and in
line with real-world ballistics." Every number is tagged **V** verified,
**D** derived, **P** provisional or **G** gameplay, as in
[MATERIALS.md](MATERIALS.md). Construction ids are defined there.

The matrix in §4 is produced by [`pen_model.py`](pen_model.py) (run
`python docs/research/pen_model.py`). Change a number there, rerun, paste.

---

## 1. Calibres in the game (`CAL`)

Current weapons (`WD` in index.html) and planned ones. Energies are muzzle
values for period-appropriate loads.

| id | Weapons | Load | Mass g | v m/s | e0 J | hard | Pellets | Evidence |
|---|---|---|---:|---:|---:|---:|---:|---|
| `9mm` | pistol, silenced, dual | 115–124 gr FMJ | 7.5–8.0 | 350–360 | **490** | 1.0 | 1 | **V** Federal AE9DP/AE9AP (482 / 494 J) |
| `9mm_smg` | Uzi (`smg`) | same, 260 mm barrel | 7.5–8.0 | ≈400 | **600** | 1.0 | 1 | **D** Small Arms Survey Uzi sheet (400 m/s) |
| `.45` | planned | 230 gr FMJ | 14.9 | 271 | **548** | 1.0 | 1 | **V** Federal AE45A |
| `.357` | revolver | 158 gr JSP | 10.2 | 378 | **731** | 0.9 | 1 | **V** Federal AE357A; hard 0.9 = soft-point (P) |
| `.50ae` | golddeagle | 300 gr XTP | 19.4 | 450 | **1965** | 0.8 | 1 | **V** Hornady (via retailer); hard 0.8 = hollow point (P) |
| `5.56` | m16 | M193 55 gr (M16A1 era) | 3.56 | 991 | **1750** | 1.0 | 1 | **V** FM 3-22.9 Table 2-1; CBC |
| `7.62x39` | goldak | M43 steel core | 7.9 | 718 | **2030** | 1.3 | 1 | **D** Arsenal spec (at 25 m); hard 1.3 = mild-steel core (P) |
| `12ga_00` | pump, double barrel | 9 × 00 buck | 3.52 each | 404 | **287 each** (2585 total) | 0.5 | 9 | **D** Federal F127 00 |
| `12ga_slug` | planned | 1 oz Foster slug | 28.4 | 491 | **3413** | 0.5 | 1 | **D** Federal F127RS |
| `.50bmg` | planned (W14 anti-materiel) | M2 ball | ≈46 | 857 | **16 900** | 1.0 | 1 | **V** TM 43-0001-27 p. 9-13; M8 API would be 15 870 J, hard 1.5 (P) |
| `40mm` | goldgl | M406 HE | — | 76 | blast only | — | — | **V** TM 43-0001-28: 32 g Comp B; FAS: 5 m casualty radius |

Notes:

- **Uzi**: the weapon fires the same cartridge as the pistol but from a
  longer barrel. Suggest a per-weapon `eMul: 1.22` in `WD` rather than a
  separate calibre, so loadout UI still says "9mm".
- **Hardness factor** `hard`: divides losses in hard materials (masonry,
  concrete, steel, aluminium). Soft points/hollow points (< 1) deform on hard
  targets; steel-core M43 (1.3) resists deformation. The values are **P**,
  chosen to reproduce §5 anchors.
- **Metal factor** `metal` (**P**): multiplies losses in `steel` and `alu`
  only. Plate resistance grows with the bullet's diameter and softness, which
  a pure energy model misses: without it the .45 would out-penetrate the 9mm
  in steel, and the slug and .50 AE would pass ⅜″ plate. Values: 9mm,
  9mm_smg, .357, 5.56, 7.62×39, 00 pellet **1.0**; .45 **1.25**; .50 AE
  **1.5**; slug **2.0**; .50 BMG **4.0** (a gameplay choice so the engine
  block stays cover against everything, **G**). Resulting stop depths in
  steel: 9mm 3 mm, .45 3 mm, .50 AE 7 mm, 5.56 11 mm, 7.62×39 17 mm,
  slug 6 mm, .50 BMG 28 mm.
- **Buckshot** is simulated per pellet. Spread is W5's call; the realistic
  pattern is ≈ 2.5 cm per metre for a cylinder bore (P).
- The legacy `pierce` flag on m16/revolver/goldak/golddeagle becomes
  redundant: penetration falls out of `e0` and `hard`.

---

## 2. Penetration formula

For each wall the ray crosses, look up its build's layer stack (alt stack
if the stud/web roll hits). For each layer:

```
loss = MAT[m].res * t_cm * (MAT[m].hard ? 1 / CAL.hard : 1)
       * (m is steel or alu ? CAL.metal : 1) * tumble
e   -= loss
if (e < eMin) stop                       // eMin = 30 J
```

After the wall, if the projectile perforated any hard layer ≥ 3 cm thick,
set `tumble = 2` for all later walls (yawing bullet, CAN p. 9). The 3 cm test
uses the layer's **nominal** thickness (before the obliquity multiplier), so
an angled hit on a thin skin does not trigger tumbling.

Damage on the target behind: `dmg * (e / e0) ** 0.7 * (1 - armour)`
(roadmap §2.2, unchanged).

Oblique hits: multiply each layer's `t` by `1 / cos(θ)`, capped at 3× (θ ≈
70°). Above 75° on hard layers, ricochet (P): spawn a spark, reflect with
50 % energy. W5 decides whether ricochets are in scope.

Energy deposited in the wall (`eIn − eOut`) feeds destruction
(MATERIALS.md §5), but only when `eIn × CAL.hard ≥ BUILD.coreE`. Hits within
0.25 m of a door's lock or hinge instead apply full `eIn` (all pellets) to
`lockHp` (MATERIALS.md §5 rule 3).

---

## 3. Calibration anchors

The model's free parameters (`res`, `hard`, tumble) were fitted to these
observations. W5's Node tests should assert all of them.

| # | Observation (source) | Model result | Status |
|---|---|---|---|
| 1 | 9mm passes an ordinary drywall partition between studs (BOT14, H) | 87 % retained | ✔ |
| 2 | 9mm loses ≈12 m/s per ½″ sheet ⇒ ≈87 % energy after a 2-sheet partition (AFTE, D) | 87 % | ✔ fitted |
| 3 | 5.56 M193 passes 4 separated partitions (BOT14) | 85 % after 4 | ✔ |
| 4 | 00 buck: pellets pass 4 separated partitions (BOT14, BOT3) | 11 % per pellet after 4, stops in 5th | ✔ |
| 5 | 9mm JHP passed 8 ¾″ pine boards and stopped in the 9th (≈15.2 cm); .45 JHP passed 7 (≈13.3 cm) (BOT1) | 9mm stops after 15.3 cm `timber`; .45 after 17.3 cm | ✔ 9mm fitted; .45 ≈1 board long (JHP vs FMJ) |
| 6 | 9mm stops in hollow CMU (GEAR: none of 6 loads passed both shells) | stops in front shell | ✔ |
| 7 | .223 perforates the front shell of hollow CMU, not the wall (CAN p. 8) | perforates front shell, stops on back shell | ✔ |
| 8 | 90 mm brick stops .223 and .308 (CAN pp. 6–7) | brick_1w stops 5.56 and 7.62×39 | ✔ |
| 9 | 2″ plain concrete stops 5.56 (A §7-2) | 5.56 stops in 5.1 cm `cmu`/`concrete` | ✔ (bound) |
| 10 | 5.56 perforates ⅜″ mild-steel door (A Tables 7-2, 7-5) | steel_10mm: 19 % retained | ✔ |
| 11 | 9mm ball passes near car door, stops in far door (CAR) | 51 % after one door, stops in second | ✔ |
| 12 | .50 BMG passes brick + hollow CMU + ¾″ ply; against a second wall set back-to-back it only chipped the brick veneer, hitting sideways (CAN p. 9) | 66 % after first; stops in second | ◐ partial: CAN's walls touched and only the second veneer was struck; the model needs tumble 2 to stop it |
| 13 | Repeated .50 hits needed to hole 10″ RC (A Table 7-6) | single .50 stops in rc_wall_20 | ✔ (G-constrained) |
| 14 | .308 Win FMJ (3 474 J) passes both face shells of a grey hollow block and stops on the brick behind (CAN p. 8) | a 3 474 J, hard 1.0 round keeps 32 % through `cmu_hollow` | ✔ brackets the M43 result (7.62×39: 9 %) |

---

## 4. Outcome matrix — checkable targets

Retained energy (`eOut / e0`, single wall, perpendicular hit) or `stop`. For
`12ga_00` the value is per pellet. `@stud` and `@web` rows are the
stochastic alternate stacks (`@stud` wood stud or lath stud, `@web` block
web, `@reg` car window regulator). Tolerance for W5's tests: ±3 percentage
points with stochastic rolls disabled; `stop` must stay `stop` and a pass must
stay a pass (see the knife-edge cells in MATERIALS.md §6).

| construction | 9mm | 9mm_smg | .45 | .357 | .50ae | 5.56 | 7.62x39 | 12ga_00 | 12ga_slug | .50bmg |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `stud_wood_gyp` | 87% | 89% | 88% | 91% | 97% | 96% | 97% | 78% | 98% | 100% |
| `stud_wood_gyp@stud` | 33% | 45% | 40% | 55% | 83% | 81% | 84% | stop | 90% | 98% |
| `stud_steel_gyp` | 84% | 87% | 85% | 89% | 96% | 95% | 96% | 72% | 98% | 100% |
| `stud_steel_gyp2` | 64% | 70% | 68% | 76% | 91% | 90% | 91% | 38% | 95% | 99% |
| `particle_divider` | 83% | 86% | 84% | 88% | 96% | 95% | 96% | 70% | 97% | 99% |
| `plaster_lath` | 44% | 54% | 50% | 62% | 86% | 84% | 86% | stop | 92% | 98% |
| `plaster_lath@stud` | stop | 9% | stop | 25% | 72% | 69% | 73% | stop | 84% | 97% |
| `clay_tile_4` | stop | stop | stop | stop | 40% | 44% | 61% | stop | 48% | 94% |
| `cbs_ext` | stop | stop | stop | stop | stop | stop | 3% | stop | stop | 85% |
| `cbs_ext@web` | stop | stop | stop | stop | stop | stop | stop | stop | stop | 59% |
| `cmu_hollow` | stop | stop | stop | stop | stop | stop | 9% | stop | stop | 86% |
| `cmu_hollow@web` | stop | stop | stop | stop | stop | stop | stop | stop | stop | 59% |
| `cmu_filled` | stop | stop | stop | stop | stop | stop | stop | stop | stop | 59% |
| `brick_1w` | stop | stop | stop | stop | stop | stop | stop | stop | stop | 79% |
| `brick_2w` | stop | stop | stop | stop | stop | stop | stop | stop | stop | 49% |
| `brick_cmu_ext` | stop | stop | stop | stop | stop | stop | stop | stop | stop | 66% |
| `brick_cmu_ext@web` | stop | stop | stop | stop | stop | stop | stop | stop | stop | 39% |
| `rc_wall_20` | stop | stop | stop | stop | stop | stop | stop | stop | stop | stop |
| `rc_column_40` | stop | stop | stop | stop | stop | stop | stop | stop | stop | stop |
| `glass_annealed_6` | 93% | 94% | 93% | 95% | 98% | 98% | 98% | 87% | 99% | 100% |
| `glass_tempered_6` | 93% | 94% | 93% | 95% | 98% | 98% | 98% | 87% | 99% | 100% |
| `glass_lam_windshield` | 53% | 62% | 58% | 69% | 88% | 87% | 89% | 21% | 93% | 99% |
| `glass_studio` | stop | stop | stop | 10% | 66% | 62% | 67% | stop | 81% | 96% |
| `door_hollow` | 95% | 96% | 96% | 97% | 99% | 99% | 99% | 92% | 99% | 100% |
| `door_solid` | 60% | 67% | 64% | 73% | 90% | 89% | 90% | 31% | 94% | 99% |
| `door_metal` | 27% | 40% | 18% | 45% | 66% | 79% | 86% | stop | 58% | 91% |
| `car_door` | 51% | 60% | 45% | 64% | 77% | 86% | 91% | stop | 72% | 94% |
| `car_door@reg` | stop | stop | stop | stop | 34% | 61% | 74% | stop | 19% | 84% |
| `car_engine` | stop | stop | stop | stop | stop | stop | stop | stop | stop | stop |
| `steel_3mm` | stop | 20% | stop | 27% | 54% | 73% | 82% | stop | 44% | 89% |
| `steel_10mm` | stop | stop | stop | stop | stop | 19% | 46% | stop | stop | 66% |
| `corrugated` | 85% | 88% | 83% | 89% | 93% | 96% | 97% | 48% | 91% | 98% |
| `alu_bulkhead` | 15% | 30% | 7% | 37% | 63% | 76% | 84% | stop | 56% | 91% |
| `joinery_ply` | 73% | 78% | 76% | 82% | 93% | 92% | 93% | 53% | 96% | 99% |
| `grp_hull` | 76% | 80% | 78% | 84% | 94% | 93% | 94% | 58% | 96% | 99% |
| `acoustic_double` | 60% | 68% | 64% | 73% | 90% | 89% | 90% | 32% | 94% | 99% |
| `sofa` | 51% | 60% | 56% | 67% | 88% | 86% | 88% | 16% | 93% | 99% |
| `mattress` | 78% | 82% | 80% | 85% | 94% | 94% | 95% | 62% | 97% | 99% |
| `counter_cmu` | stop | stop | stop | stop | stop | stop | 15% | stop | stop | 87% |
| `counter_cabinet` | 69% | 75% | 72% | 79% | 92% | 91% | 93% | 47% | 96% | 99% |

Multi-wall chains (tumble applies after a hard layer ≥ 3 cm):

| chain | 9mm | 9mm_smg | .45 | .357 | .50ae | 5.56 | 7.62x39 | 12ga_00 | 12ga_slug | .50bmg |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2× stud_wood_gyp | 74% | 79% | 77% | 83% | 94% | 93% | 94% | 56% | 96% | 99% |
| 4× stud_wood_gyp | 48% | 58% | 54% | 65% | 87% | 85% | 87% | 11% | 93% | 98% |
| 5× stud_wood_gyp | 35% | 47% | 42% | 57% | 84% | 82% | 84% | stop@5 | 91% | 98% |
| door_hollow + stud_wood_gyp | 82% | 85% | 84% | 88% | 96% | 95% | 96% | 70% | 97% | 99% |
| car_door ×2 (through a car) | stop@2 | 20% | stop@2 | 27% | 54% | 73% | 82% | stop@1 | 44% | 89% |
| brick_cmu_ext + ply + brick_cmu_ext | stop@1 | stop@1 | stop@1 | stop@1 | stop@1 | stop@1 | stop@1 | stop@1 | stop@1 | stop@3 |

### What this means in play (for W6 tooltips and W7 TIPS)

Each bullet is checked against the matrix above.

- **Every gun shoots through drywall, wooden doors, glass, sofas and
  cabinets.** Concealment is not cover. Even a 9mm keeps ≈ ¾ of its energy
  through two partitions.
- **Handguns, the Uzi and buckshot are stopped by block, brick and
  concrete.** The .50 AE is the one handgun that passes hollow clay tile
  (40 %), as do rifles and the slug (48 %).
- **Buckshot pellets pass up to four drywall partitions** but stop in a
  hollow-metal door, a car door or any masonry.
- **Car doors stop only some rounds.** 9mm passes one door (51 %) and stops
  in the second. The Uzi, .357, .50 AE, rifles and slug go through the whole car,
  except where they hit the window regulator (15 % of hits), which stops
  pistols. **The engine block stops everything**, the .50 BMG included.
- **The M16 chews block**: it perforates the front shell, never the wall,
  and a magazine opens a firing port (≈ 20 rounds per cell).
- **The gold AK** sometimes punches through hollow block walls with little
  energy left (steel core, 3–9 %). Grouted block, brick and web hits stop it.
- **.50 BMG** goes through every wall except reinforced concrete, the engine
  block and ⅜″+ steel stacks; it tumbles after masonry and stops in the next
  wall.
- **The slug** passes doors, cars and clay tile, and is the best door-opener
  when aimed at the lock (1 shell for a solid door, 2 for a metal one). It
  never passes block or brick, but chips them (≈ 11 rounds per cell).

---

## 5. Body armour (for the `armour` term)

NIJ 0101.02 (1985) and 0101.03 (1987) are the period standards: soft armour
levels I–IIIA (handgun) and hard plates III–IV (rifle). Suggested mapping
(**P**, check with W5):

| Armour in game | NIJ level (period) | Stops (armour ≈ 1.0 on torso) | Passes (armour ≈ 0.1) |
|---|---|---|---|
| Soft vest (cops, bodyguards) | II / IIA | 9mm, .45, .357, buck pellets; 9mm_smg **G** (≈400 m/s is between the level II and IIIA 9mm test velocities) | 5.56, 7.62×39, slug (blunt trauma 0.5), .50 AE (0.5) |
| Heavy vest (penthouse "best people") | IIIA | add 9mm_smg (rated), .50 AE, slug | rifles |
| Plates (SWAT, end game) | III | add 5.56 M193, 7.62×39 lead core | M43 steel core 50 %, .50 BMG |

Rule of thumb for W5: soft armour stops a projectile if `e × hard < 900 J`
and the projectile is not a rifle bullet. A projectile that has already
perforated a wall arrives with less energy and is more likely to be stopped.

---

## 6. Hit effects and VFX

| Interaction | Behaviour | VFX / SFX suggestion | Evidence |
|---|---|---|---|
| Handgun through drywall | Little deflection (< 3°); gypsum plume exits **normal to the wall face**, not along the bullet | white puff on exit side, clean entry hole | AFTE |
| Rifle through partitions | Yaw/keyhole after 2+ walls: increase spread 1–2° per wall | elongated exit holes | BOT14 |
| Buckshot through partition | Pattern opens ≈ 30 % per wall | multiple small holes, dust | BOT3, BOT14 (P) |
| Wood / doors | Splinters on exit face; bullet may deflect ≤ 5° | splinter burst | BOT1, MDF |
| Masonry, stopped | Entry crater + radial cracks; rear-face spall when energy deposited > 50 % of `coreE` | grey/red dust cone on entry, chips on rear | FM5 pp. 3-14–3-16 |
| Masonry, perforated | Bullet tumbles (§2) | larger rear crater | CAN p. 9 |
| Tempered glass | Whole pane crazes and drops; deflection up to ≈ 26° (JHP) / 11° (lead) observed maxima, randomise ±5° | pane-wide crack decal → cube shower | TEMP, CAR |
| Annealed glass | Star hole, pane may drop if ≥ 3 hits | shards | P |
| Laminated (windshield, studio) | Radial cracks, fragments retained, pane stays | spiderweb decal | GLASS |
| Car door | Keyholing, mixed debris (paint, plastic, glass) | sparks + plastic bits | CAR |
| Steel, stopped | Spark + lead splash; ricochet above 75° | spark | A (P) |
| 40 mm HE | Blast + fragments; see MATERIALS.md §5 | fireball, dust ring, wall holes | GRENADE, HE |

---

## 7. Gaps and proposals

Known gaps (no source found; values are **P**):

- Hollow-core and solid-core doors, mattresses, sofas, hollow clay tile,
  stucco over CMU, single-shot .50 vs 10–20 cm RC.
- M43 vs CMU: no direct test. CAN p. 8 brackets it: 5.56 (1 735 J) holed only
  the front shell, .308 (3 474 J) passed both. M43 at 2 030 J with a steel
  core sits between, and the model gives a marginal perforation (P).
- Lock/hinge `lockHp` values (MATERIALS.md §5) and the `metal` factors (§1).
- A §7-2b(3) says single cinder block "offers little protection" from 5.56;
  we follow CAN's instrumented result instead (MATERIALS.md §6).
- `ply`, `particle`, `plaster`, `stucco`, `glass`, `glass_lam`, `alu`, `grp`
  resistances are estimates bracketed by neighbours.
- The FBI barrier protocol was seen only via Hornady's implementation (H).

Contradictions with the roadmap's calibration targets (§2.2):

1. "5.56 only chips CMU" → evidence says it perforates the front shell.
   Proposed target: "5.56 perforates the front shell, not the wall."
2. "Buckshot loses effectiveness quickly" → evidence says pellets pass 4
   separated partitions. Proposed target as in §3 #4.

Proposals for other workstreams:

- **W5**: adopt `pen_model.py` outcomes as Node table tests (§4, ±3 pp),
  including `rounds_per_cell()` (MATERIALS.md §5). Add `metal` to `CAL`.
- **W5/W6**: `WD.smg.eMul = 1.22`; drop `pierce` once penetration lands.
- **W7**: TIPS "Bar counters and kitchen counters stop bullets" is wrong for
  kitchen counters; suggest "Masonry bar fronts stop most bullets; kitchen
  cabinets and car doors don't. Hide behind the engine."
- **W1**: stochastic stud/web member from hit position (MATERIALS.md §3);
  a "curtain" window fill that blocks sight but not bullets.

---

## 8. Period protective standards (sanity checks)

| Standard | What it covers | Use |
|---|---|---|
| UL 752 (legacy levels 1–10) | Bullet-resisting glazing/panels: L1 9mm 124 gr, L2 .357 158 gr, L6 9mm SMG, L7 5.56 55 gr, L8 7.62 NATO, L10 .50 ball | Bank/jeweller counters, the penthouse panic room if any: a UL-rated glazing should stop the matching calibre (UL, SPAR) |
| NIJ 0108.01 (1985) | Ballistic-resistant protective materials, period | Same use (NIJ) |
| NIJ 0101.02 (1985) / 0101.03 (1987) | Police body armour | §5 |

---

## 9. Sources

- **BOT1** Box O' Truth #1: stacked drywall and pine boards; informal — <https://www.theboxotruth.com/threads/the-box-o-truth-1-the-original-box-o-truth.278/>
- **BOT3** Box O' Truth #3: buckshot and slugs vs drywall; corrects stacked-sheet method — <https://www.theboxotruth.com/threads/the-box-o-truth-3-the-shotgun-meets-the-box-o-truth.284/>
- **BOT14** Box O' Truth #14: separated walls; 5.56 and 00 buck pass 4 walls — <https://www.theboxotruth.com/threads/the-box-o-truth-14-rifles-shotguns-and-walls.310/>
- **CAR** Buick O' Truth #3: pistols vs car doors — <https://www.theboxotruth.com/threads/the-buick-o-truth-3-pistols-and-car-doors.343/>
- **CAN** Resistance of Exterior Walls to High Velocity Projectiles: brick, CMU, stucco, Barrett M82A1 — <https://masoncontractors.org/public/documents/pdf/technical-resources/resistance_of_exterior_walls_to_high_velocity_projectiles.pdf>
- **A** US Army FM 3-06.11 ch. 7: penetration and rounds-to-breach tables (7.62 there is NATO, not M43) — <https://www.usarmorment.com/pdf/FM3-06_Urban_Combat.pdf>
- **H** Hornady LE/Military catalogue 2023: FBI-style barrier protocol results — <https://glomex-ms.com/wp-content/uploads/2024/10/Hornady-LE-Military-Catalog-2023.pdf>
- **AFTE** Haag & Jason, Drywall terminal ballistics (velocity loss per sheet; provisional, full tables inaccessible) — <https://www.academia.edu/40035203/Drywall_Terminal_Ballistic_Properties_of_Forensic_Interest>
- **GLASS** Osnes et al. 2021, laminated glass vs 7.62 AP — <https://www.glassonweb.com/article/experimental-tests-and-numerical-simulations-ballistic-impact-laminated-glass>
- **GEAR** 9mm vs cement block (small sample) — <https://gear-report.com/9mm-ammunition-barrier-penetration-test-cement-block/>
- **CMHA** CMU ballistic resistance FAQ — <https://www.cmha.org/resource/cmu-faq-016/>
- **FM5** FM 5-103 Survivability (concrete spall, steel) — <https://ia601500.us.archive.org/28/items/MManuals/Fm5-103Survivability.pdf>
- **NIJ** NIJ 0108.01 (1985) protective materials — <https://www.ojp.gov/pdffiles1/nij/099859.pdf>
- **NIJ-ARMOUR** NIJ 0101.02 (1985) body armour — <https://www.ojp.gov/pdffiles1/nij/97211.pdf>
- **UL** International ballistic standards chart (manufacturer-hosted; not the US Army Corps of Engineers) — <https://usace.com/wp-content/uploads/2024/01/International-Ballistic-Standards.pdf>
- **SPAR** Spartech Acryshield bulletin (UL-rated acrylic thicknesses) — <https://spartech.com/media/bulletins/Polycast-Acryshield-Bulletin.pdf>
- **MDF** Liu et al. 2021, 9mm vs MDF — <https://www.bzycj.cn/en/article/doi/10.11883/bzycj-2020-0148?viewType=HTML>
- **TEMP** Thornton & Cashman 1986, tempered glass deflection — <https://books.google.com/books/about/The_Effect_of_Tempered_Glass_on_Bullet_T.html?id=IFd9zgEACAAJ>
- **BF** Brassfetcher 9mm interior wall — <https://brassfetcher.com/Handguns/9mm%20Luger/9mm%20Luger/9mm%20Luger%20Interior%20Wall.pdf>
- **RIFLE** FM 3-22.9 (M16A1/A2 velocities) — <https://www.bits.de/NRANEU/others/amd-us-archive/FM3-22.9(03).pdf>
- **CBC** CBC 5.56×45 specifications — <https://cbcdefense.com/wp-content/uploads/2021/12/CBC-5.56x45mm.pdf>
- **AMMO** TM 43-0001-27 small-arms ammunition data (.50 M2, M8) — <https://files.uslweb.com/production/files/tm-43-0001-27.pdf>
- **GRENADE** TM 43-0001-28 (M406 HE) — <https://ia803109.us.archive.org/9/items/milmanual-tm-43-0001-28-army-ammunition-data-sheets/tm_43-0001-28_army_ammunition_data_sheets.pdf>
- **HE** FAS M406 (5 m casualty radius) — <https://man.fas.org/dod-101/sys/land/docs/m406.htm>
- **M2** .50 Browning ball reference (mass) — <https://sites.google.com/site/britmilammo/-50-inch-browning/-50-inch-browning-ball>
- Calibre load pages: Federal AE9DP <https://www.federalpremium.com/handgun/american-eagle/american-eagle-handgun/11-AE9DP.html>, AE45A <https://www.federalpremium.com/handgun/american-eagle/american-eagle-handgun/11-AE45A.html>, AE357A <https://www.federalpremium.com/handgun/american-eagle/american-eagle-handgun/11-AE357A.html>, F127 00 <https://www.federalpremium.com/shotshell/power-shok/power-shok-buckshot/11-F127%2000.html>, F127RS <https://www.federalpremium.com/shotshell/power-shok/power-shok-rifled-slug/11-F127%20RS.html>; Hornady .50 AE <https://store.theshootingcentre.com/hornady-custom-bulk-ammunition-50-action-express-300-grain-hp-xtp-1475-fps-qty-200-9245/>; Arsenal 7.62×39 <https://www.arsenal-bg.com/c/product-0/762x39-mm-cartridges-252>; Small Arms Survey Uzi <https://www.smallarmssurvey.org/sites/default/files/SAS_weapons-sub-machine-guns-Uzi.pdf>
