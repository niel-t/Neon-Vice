# Working on Neon Vice

- GitLab `gitlab/main` is authoritative: https://gitlab.com/srk7630145/neon-vice.
  App/GitHub metadata can be stale. Do not reset to `origin/main` or rewrite shared checkouts.
- The game uses `index.html` and ordered classic scripts `art.js`, `levels.js`,
  `world.js`, `missions.js`, `models.js`, `renderer.js`, `weapons.js`, `ai.js`,
  `dialogue.js` and `overworld.js` (order in `scripts/check.cjs`); no framework or runtime npm dependencies.
  Coordinate edits to shared globals. Keep broad extraction separate from save/level fixes.
- Run `npm run check` for classic-script/data changes. Run `npm test` for gameplay,
  save, rendering, input, assembly or test-tooling changes. The all-floor integration
  smoke uses real `startLevel` and simulation, not a complete UI campaign.
  Run the applicable local integration suite before merging/pushing main.
- Level indexes are stored in saves and story flags. Keep existing indexes stable;
  append levels or implement a deliberate migration. Ragged maps are padded by the loader.
- Preserve origin-local `nb86`, `nb86prog`, `nb86jobs` and unknown save fields.
  Never overwrite unreadable existing saves; keep storage failures visible.
- Add production assets to `scripts/build.cjs` alongside HTML references. Browser tests
  exercise `public`; Pages deploys that same artifact only after checks succeed.
- Documentation-only edits need no game tests. Keep checks proportional to the risk.
