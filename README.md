# Neon Vice: Ocean Drive

A gory, top-down 3D action game in the spirit of Hotline Miami, set in 1986 Miami with a PS2 / Vice City look. It runs entirely in the browser, with no runtime build step or dependencies. `index.html` contains gameplay and scene orchestration; ordinary classic scripts hold artwork, campaign content, model implementation and renderer primitives.

**Play:** keep `index.html` and the classic scripts listed in `scripts/build.cjs` together, then open `index.html` in a WebGL-capable browser, or serve them from any static host.
The authoritative repository is [GitLab](https://gitlab.com/srk7630145/neon-vice).
GitLab Pages publishes the checked and browser-tested `public` artifact on the default branch.

## The crew
- **The Consigliere**: a big bruiser with gold knuckle dusters. Punches kill outright, and a vest under the suit soaks up one bullet.
- **The Money Man**: throws stacks of cash to lure guards and sees every enemy on radar. Drives the red Countach.
- **The Don**: starts with a .357 Magnum that goes through bodies. Executions are lightning fast. Drives the Rolls.

Jobs come from **McWey**, from his office on the 52nd floor of McWey Tower, next to his shark tank.

## Controls
| | Keyboard / mouse | Xbox controller | Touch |
|---|---|---|---|
| Move | WASD | Left stick | Left thumb |
| Aim | Mouse | Right stick | Right thumb |
| Attack / execute downed enemy | Click | RT | Push right thumb |
| Grab / throw weapon | E / right-click | A | GRAB button |
| Cash (Money Man) | Q | X | CASH button |
| Sprint | Shift | LB / L3 | Push stick to edge |
| Reload (press again in the green window for an instant reload; a miss jams it) | R | LT | RELOAD button |
| Switch weapon (two gun slots + melee) | Mouse wheel / Tab, or 1 / 2 / 3 | Y | SWITCH button |
| Restart floor | Backspace | Back | &#8635; button |

## Features
- PS2-style low-poly characters with faces taken from the original artwork, skinned animation and Vice City colour trails.
- Extreme gore mode: dismemberment, head pops, blood-soaked clothes and real execution animations. You can switch it to NORMAL in the pause menu.
- A pump-action shotgun, dual 9mms, an M16, a bat, a machete and more, each with its own sound.
- A Miami Vice-style drive cutscene, McWey Tower's lobby, elevator and office, and an RPG perk system.
- Music that changes per level and on every death.
- Pause menu settings: graphics (enhanced / PS1 retro), film grain, VHS glitch, gore, hints, sound and screen shake.

Progress and settings are saved locally in your browser (`nb86`, `nb86prog`, `nb86jobs`).
Different origins, browsers and profiles have separate saves; direct-open and hosted play
do not share progress. A persistent storage warning means an unreadable save is preserved,
but changes to that key will not save in the current session. Back up the original key in
browser developer tools before repairing/removing it and reloading. A write failure warning
clears after a later successful save; keep the tab open until storage works again.

Title characters wait for their detailed models instead of flashing simplified models
during loading. If artwork or its shader fails, an explicit warning appears and simplified
characters remain usable; reload to retry. Other successfully loaded models remain available.

Losing focus pauses play and clears held inputs. Controllers must return to neutral before
re-arming. Suspended audio retries on browser-supported user interaction; recovery failures
are visible and silent play remains available. Controller-generated clicks alone may not
provide the browser permission needed for audio.

Graphics context loss stops play and displays a reload action without resetting existing
saves. Automatic graphics-resource reconstruction is not supported; even if the browser
restores the context, reload is required.

## Development

Node.js 22 or newer is needed for tooling only, not for playing:

```sh
npm ci
npx playwright install chromium
npm test
```

`npm run check` compiles the ordered classic scripts, checks artwork loading order and the production allowlist, and validates level/loader data without a browser.
`npm run build` assembles an explicit production allowlist into `public`.
The ordered classic scripts declare artwork, campaign data and the model implementation
before the inline settings/math prelude. Renderer primitives then initialize before gameplay
and scene orchestration. Detailed models initialize at their original gameplay startup point.
Campaign
maps, shared map glyphs/collision tables, par/grade tables, cassette locations and level
tracks stay together in `levels.js`; mutable run state and reward handling stay in the game.
`models.js` keeps the existing `PS2C` closure and public lifecycle/drawing API. It reads game
state through the existing globals only when called. `renderer.js` groups shader/atlas setup,
batches, render targets, shadows and quality helpers; it remains a shared classic-script
implementation, not an independent engine or module. Gameplay-owned world/input state and
transactional resource ownership are unchanged by these file moves.
`npm run test:browser` tests the already assembled artifact using an isolated ephemeral
localhost server, Chromium/SwiftShader and fresh save contexts; it never uses preview saves.
Software rendering uses the existing lowest quality lock while retaining the real enhanced
pipeline; tests assert simulation/frame progress, not GPU performance or pixel fidelity.
One direct-open check verifies the assembled `file://` game loads its artwork and models.
Four compact groups cover hosted boot/settings, one real first-mission UI route, an all-eight-floor
integration smoke (not a full campaign), and historical/current/corrupt save regressions.
Only external Google Fonts are replaced with an empty response for deterministic offline tests.
Failure traces/screenshots are in `test-results`; the HTML report is in `playwright-report`.

GitLab merge-request and default-branch pipelines use matching pinned Playwright package/image
versions, without blanket retries. Pages downloads the exact tested assembly, never a second
build. Run the applicable local suite before a direct main merge/push. The published game
contains no Node packages.
