# W5 ballistics: engine notes and level-brief answers

Owner: W5. Numbers come from `BAL.chain` over `WORLD.materials` (the shipped
engine in `weapons.js`), so they match the game, not just `pen_model.py`.
"Keeps" is the energy fraction left after one crossing at normal incidence.

## 1. What shipped in W5a/W5b

- **CAL v2** (`weapons.js`): each calibre has `e0` (J), `hard`, `metal`, `dmg`
  and, for 5.56 and 7.62, `rifle`. `WD.smg.eMul = 1.22` (SMG barrel).
- **Damage** is fractional: `dmg × min(1, (e / 250 J)^0.7)`. A full-energy
  round does its full damage; a round that lost most of its energy in a wall
  wounds. HP is a float, and a target is dead at `hp ≤ 0.1` (`BAL.HP_EPS`).
- **Armour** (`ARMOUR.lv`, `BAL.absorb`): vest II, carrier III. Each hit's
  damage is reduced by the plate's absorb; a plate is consumed only when it
  absorbs more than 0.1.
- **Bullets** (`updateBulletsW5`, index.html) trace `WORLD.trace` with energy
  carried through every crossing. Same-wall seam and corner hits are unioned
  before energy is spent. Bullets fly at the shooter's muzzle height
  (`c.eyeY − 0.3`, from W7's stance), and a standing shooter hugging low
  cover shoots over it. Doors use their build: a 9 mm passes `door_solid`.
  Rounds deflect off hard faces at grazing angles, and each material has its
  own decal, particles and sound.
- **CP2 toggles:** `?ballistics=legacy` restores the old grid-stepping path;
  `?enemypen=0` stops enemy rounds at the first non-glass wall.
- **Tests:** `scripts/ballistics-check.cjs` (in `npm run check`) checks the
  BALLISTICS §4 table (±3 pp), the chains, rounds-per-cell, armour, kill and
  no-kill cases, and a sliced run of `updateBulletsW5`.

## 2. Answers to level-brief questions (proposals)

These are W5 proposals. Any new MATERIALS row goes to W1/W3 for the schema.

### arcade §9 Q2 — CRT cabinets

Yes: a cabinet should be hard from the front and soft from the side.
Proposed `crt_cabinet` with two faces:

| Face | Layers (cm) | 9 mm | buck | 5.56 | 7.62 | cellHp |
|---|---|---:|---:|---:|---:|---:|
| front (screen) | glass 1.2 · void 40 · steel 0.3 (yoke, transformer) · particle 1.6 | stops | stops | 66 % | 76 % | 3 000 |
| side / back | particle 1.6 · void 60 · particle 1.6 | 71 % | 50 % | 92 % | 93 % | 1 200 |

The screen face is real cover against handguns and buckshot, and the sides
are concealment. This needs a per-face build on props, which `WORLD.trace`
does not have yet (props have one build). Until W1 adds it, keep
`counter_cabinet` (9 mm keeps 69 %).

### mall §9 Q1 and studio §9 Q6 — shutters, grilles and the roll-up door

- **Slat shutter.** Add a `shutter` build: `steel 0.07`, cellHp 1 500. A 9 mm
  keeps 79 %, buck 27 %, 5.56 94 %. It hides, but it is not cover. That is
  realistic: a slat shutter is one thin roll-formed skin. `door_metal`
  (9 mm keeps 27 %, buck stops) is two skins, so it is too strong for a
  shutter, and mall §6.7's "pistol-resistant in pairs" does not hold.
- **Open grille.** Add a door kind `grille`: sight passes, and so do
  bullets, except a share equal to the bar coverage (about 30 %). Those hit
  a bar (`steel 0.6`), which stops handguns and buck. The hit is a
  deterministic hash of the cell and the bullet, not a random roll, so tests
  stay stable.
- **Studio D15 roll-up.** Use `shutter`. The 3 m width is fine; it is a
  vehicle door, not a door pair.

### studio §9 Q2 — the singer behind `acoustic_double`

Stray fire does go through. A 9 mm keeps 60 % (≈ 294 J) through one
`acoustic_double` wall, which is full damage, so it kills. After two walls
it keeps 36 %, which is ≈ 0.78 damage, so it wounds. A scripted exemption
would contradict the rule that penetration is realistic. Proposal for W10:
give the singer HP 3 and make his death a fail state ("He can't talk now").
W8 enemies should not aim at him. If playtests show too many cheap fails,
the fallback is to drop his HP loss through walls to 0.5×, which is a
gameplay tag (**G**), not an exemption.

### studio §9 Q4 — `glass_studio` generosity

It is generous. The model treats 12 + 10 mm annealed-laminate leaves as
`glass_lam` at 300 J/cm, so it stops 9 mm, .45 and buck. Real 9 mm-rated
glazing (UL 752 Level 1) is about 30 mm of glass-clad polycarbonate, and
plain 12 mm laminate is usually perforated by a 9 mm. Proposal: keep it as a
**G** tag, because the control-room window is the level's cover set-piece.
Rifles still pass (5.56 keeps 62 %). The window stays breakable by cellHp
(6 000 J, about nine 5.56 rounds). Until W1 wires `glass_studio` to the
studio pane, the game uses `glass_annealed_6` so the window still breaks.

### yacht §9 Q3 — the acrylic dance floor

It cannot be shot. Bullets travel horizontally at muzzle height, so they
never cross a floor. Thick aquarium acrylic (about 7–10 cm of PMMA) would
stop every handgun anyway. Proposal: the floor is not breakable, and no
pawn falls into the tank. No construction is needed for ballistics; W1 can
add it as a non-cover floor material for decals only.

### yacht §9 Q9 — 40 mm HE reach

From `Jwall(d) = 55 000 × (0.25 / max(d, 0.25))⁵`, the removal reach is
`d = 0.25 × (55 000 / cellHp)^0.2`:

| Construction | cellHp J | Cells removed out to `d` |
|---|---:|---:|
| `joinery_ply` | 1 200 | 0.54 m |
| `alu_bulkhead` | 5 000 | 0.40 m |
| `steel_10mm` | ∞ | never (scorch only) |

Add these rows to MATERIALS §5. Lex's grenades hole the cabin partitions
and the superstructure, but never the hull or the engine room.

## 3. Open items for later waves

- The consigliere's plate uses the kit's armour level, not its own.
- Props have one build. Per-face builds (CRT front/side) and two merged car
  door cells (costed by path length) need a W1 trace change.
- `scripts/world-check.cjs` (W1's) still tests the legacy `updateBullets`
  path. W1 can retarget it after CP2.
