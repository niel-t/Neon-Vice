# Neon Vice production board

Owner: Producer and quality lead. The integrator merges this file. Last played: GitLab main `7b0cd67`, 2026-11-09, Playwright at 1280x720, Normal difficulty.

**Definition of done:** the feature visibly works in play at `?planplay=motel` and `?planplay=penthouse` (plus any shipped level it touches), and a player reads it without being told. "Tests pass" doesn't count as done. Every handoff carries at least 2 in-play screenshots, goes to the integrator, and is cc'd to the producer.

**Velocity rules:**
- Player playtests validate work; they never gate it. The producer makes design, art and scope calls.
- Deliverables are sized at half a day or less. If a worker is stalled for more than 2 hours, they report a blocker or the producer re-scopes.
- CPU rule: `npm run check` plus your own spec files only, one browser process at a time, and never the full `npm test`.
- Level indexes 0–7 and the save keys `nb86`, `nb86prog` and `nb86jobs` stay stable.

Status: **absent**, **broken**, **partial**, **done-in-play**.

## Core features

| Feature | Owner | Status | What a player sees today | Next concrete step |
|---|---|---|---|---|
| Player cover | W7 | absent | SET.cover is false and disabled on plan stages. Crouching behind a courtyard car does nothing. | Plan-stage cover adapter on `WORLD.coverAt`. Behind a car or counter, enemy shots are blocked and a clear cover pose and HUD tick appear. Default it on once it works on the motel courtyard. |
| Enemy cover | W8 | absent | Penthouse living room: all 12 enemies converge in the open within 8 s. | Alerted enemies pick cover nodes behind cars, counters and sofas and peek-fire, staggered so it isn't a swarm. Needs W7's coverAt. |
| Room darkening (fog) | W12 | absent | On Normal, the whole motel and Penthouse are lit and visible from spawn. | W12b to spec. Easy: off. Normal: unseen rooms are pitch black. Hard: seen rooms out of sight go grey and their enemies are hidden. |
| Destructible glass | W5, with W2 for data | absent | Plan stages have 0 glass cells (`G.glass` is all zero) and 0 panes. Shipped levels have 8–13. | Register plan windows and glass doors into `G.glass` and panes in the loader, then shatter with shards and sound. Proof: one motel office window and one Penthouse terrace slider shot out in play. |
| Wall damage and materials | W5 | partial | Shipped only | Do this after plan glass. |
| VFX (muzzle, impacts, blood, shards, explosions) | W6 (new) | partial | Shots show a thin tracer and an aim laser. There's no visible muzzle flash, no wall-impact sparks or dust, and no shard spray. Blood decals exist. | Muzzle flash light and sprite, wall-impact sparks and dust, glass shard spray (hook into W5), a bigger blood spray, and a 30–50 ms hit-stop on kills. |
| Interior decor | W4 | absent | Plan stages have 0 decor (`G.deco` is 0). Motel rooms are empty carpet boxes; the Penthouse has untextured grey blocks. Shipped levels have about 32 pieces each. | Wire `DECOR.apply` into the plan loader. Motel rooms: bed, TV, nightstand, bath fixtures. Penthouse: sofa, island, bar, bed, piano. Cover-height pieces register as cover for W7. |
| Plan lights | W1 (new) | absent | Plan stages have 0 lights, against 10–15 in shipped levels. Interiors are flat and lifeless. | Loader reads plan lights, or derives them per room type: lamps, neon signs, pool glow and the courtyard sodium light. |
| Readable plan geometry | W2 | broken | Courtyard "cars" are big red slabs that you can see and shoot through. Cut walls look the same as low walls. Windows are invisible. There are no stairs and no ground below the Penthouse. | (1) Cars block sight and bullets at car height and read as cars. (2) Windows render as glass and register for W5. (3) Cut-wall caps get a distinct colour. (4) Stair meshes, and street-level ground below elevated stages. |
| Penthouse layout | W2f | partial | It plays, but reads as a warren: about 40 rooms, many only 1–2 tiles. The terrace sits behind an opaque wall with a void beyond. | Revision 1: about 25 rooms, an open-plan living room with a glass wall onto the terrace, a glass rail, and long sightlines. |
| Penthouse surfaces | W13 | broken | The sliders are stretched wood, the lift looks like a closet, and the luxury flat uses motel wallpaper. | Glass sliders, a lift with brushed-metal doors and a call panel, and a luxury palette of marble, white lacquer and gold trim. |
| Floor-clear exits | W14 | absent | The plan preview says "completion policy not enabled", so a stage can't be finished. | Make plan previews completable: clear the floor, the exit lights up, take the next stage, and the run finishes. Then add exit highlighting. |
| Bosses, locked doors, objectives and civilians on plan stages | W1, W14 | absent | Bosses are plain enemies. Objectives and civilians appear only in preview. | W1: boss spawn and locked doors in the loader. W14: objectives and civilians, after completion works. |
| Shipped levels 0–7 | none | done-in-play | Decor, lights, glass and dialogue all work. | Keep stable. |

## Improvements, ranked by player impact against cost

| # | Improvement | Impact | Cost | Owner | Status |
|---|---|---|---|---|---|
| 1 | Muzzle flash, impact sparks and kill hit-stop. Gunplay currently feels like a laser pointer next to Hotline Miami's punch. | High | Low | W6 | assigned |
| 2 | Plan-stage lights and neon. Flat lighting kills the Miami mood. | High | Low–Med | W1 | assigned |
| 3 | Make plan stages completable. Nobody can play one through. | High | Low | W14 | assigned |
| 4 | Clean up the HUD clutter: the glitch title card covers the objective, and the tutorial hints (WASD, door swing, laser) replay on every mission and cover the play area. Show each hint once per save, and dock it lower and smaller. | Med–High | Low | W10 | assigned |
| 5 | Camera peek (Shift plus mouse look-ahead, as in Hotline Miami). At this zoom you see about 10 tiles ahead, which is too little to plan a room clear. | High | Low | W10 | assigned |
| 6 | Combat audio: glass break, bullet impacts by material, door-kick thud, shell casings. | Med–High | Low | W3 | assigned |
| 7 | Stagger enemy alerts and add patrol routes, so the Penthouse doesn't become a 12-man conga line. | High | Med | W8, after cover | queued |
| 8 | Backdrops beyond the stage edge: Ocean Drive street at the motel, ocean and skyline at the Penthouse. The void edge looks unfinished. | Med | Med | W13, after sliders | queued |
| 9 | `npm run shots` for plan previews: one command captures fixed review spots on both previews, so handoff screenshots are standard. | Med (velocity) | Low | W4, second item | queued |
| 10 | Real car and hero-prop models (cars, sofa, piano, bar) to replace extruded boxes. | Med–High | Med | W9 | assigned |

**Bigger proposals for the user (not yet decided):**
- Turn cover on by default for every difficulty once W7 lands.
- Multi-floor readability, where you see the floor below through stairwells and atriums (Intravenous-style).
- A replay-scoring screen after each stage (Hotline Miami-style grade).
