const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test, expect } = require('./fixtures.cjs');
const { gridSnapshot, digest, captureLoads } = require('../scripts/world-snapshot.cjs');

test('legacy world grid and seeded loader retain browser-captured parity', async ({ openGame }) => {
  const page = await openGame();
  const records = await page.evaluate(captureLoads, gridSnapshot.toString());
  const fixture = resolve(__dirname, '..', 'scripts', 'fixtures', 'grid-hashes.json');
  const values = records.map(({ key, idx, input, grid, loaded, queries }) => ({
    key, idx, input, gridHash: digest(grid), loadedHash: digest(loaded), queryHash: digest(queries),
    cellHash: digest([queries.slice(0, -1).map(q => [q[0], q[1], q[2], q[6]]), queries.at(-1)])
  }));
  if (process.env.WORLD_CAPTURE === '1') {
    writeFileSync(fixture, `${JSON.stringify({ baseline: 'c2385f8', cases: values }, null, 2)}\n`);
  }
  // Collision parity is independent of intentional sight/placement changes.
  const withoutRays = cases => cases.map(({ queryHash, ...value }) => value);
  expect(withoutRays(values)).toEqual(withoutRays(JSON.parse(readFileSync(fixture, 'utf8')).cases));
});
