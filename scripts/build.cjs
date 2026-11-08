const { mkdirSync, copyFileSync, readdirSync, rmSync } = require('node:fs');
const { resolve, join } = require('node:path');

const root = resolve(__dirname, '..');
const output = join(root, 'public');
// Add runtime assets here atomically with their HTML references.
const files = ['index.html', 'art.js', 'levels.js', 'world.js', 'missions.js', 'models.js', 'renderer.js', 'weapons.js', 'ai.js', 'dialogue.js', 'overworld.js'];
function build() {
  mkdirSync(output, { recursive: true });
  for (const name of readdirSync(output)) {
    rmSync(join(output, name), { recursive: true });
  }
  for (const file of files) copyFileSync(join(root, file), join(output, file));
  console.log(`Assembled public: ${files.join(', ')}`);
}

module.exports = { files };
if (require.main === module) build();
