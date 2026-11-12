# next/ : the Three.js renderer (default)

Gameplay is drawn with Three.js by default. GRAPHICS in the options menu cycles NEW, ENHANCED
(the classic renderer) and PS1 RETRO; `?gfx=old` and `?gfx=next` do the same from the address bar.
The choice is remembered in this browser. While the new renderer is on, F9 flips between the two
so you can compare. With the classic renderer chosen, or when the page is opened from disk, none
of this code runs. The browser tests run the classic renderer unless a test asks for the new one.

- `../gfxnext.js` is a small classic script loaded before `renderer.js`. It records the textures and
  buffers the game uploads and, while the new renderer is live, turns the old renderer's
  draw calls into no-ops. If the new renderer fails to load or throws, the classic one takes over.
- `three-renderer.js` is the renderer. It does not rebuild levels: it draws the geometry the game
  already produces (static level batch, dynamic batch, instanced rounded boxes, skinned
  characters) with real lights, soft shadows, HDR bloom and a film pass. Tune the look in
  the `LOOK` block at the top.
- `three/` is three.js r187 (MIT) copied from the npm package: the two `build/` files and the ten post-processing files the renderer uses. The only change is that those ten import `../../../build/three.module.js` instead of the bare name `three`. Do not edit.

Menus, briefings, the elevator, the shop and retro mode still use the classic renderer.

The game talks to it in four places, all guarded by `NX` (which is null when the switch is off):
`NX.wrapGL(gl)` after the WebGL context is created in `renderer.js`, `NX.begin(...)` at the top of `render()`,
`NX.draw({...})` at the end of `render()`, and `NX.takeChars(...)` in `PS2C.flush()` in `models.js`. All three files are listed in `scripts/build.cjs`.

Warm-up: on the first gameplay frame the level is handed to Three and every scene shader is built in the
background while the classic renderer keeps drawing; the new renderer takes over when they are ready
(`NX.warmMs` is how long that took).
