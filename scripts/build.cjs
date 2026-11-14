const { mkdirSync, copyFileSync, readdirSync, rmSync } = require('node:fs');
const { resolve, join, dirname } = require('node:path');

const root = resolve(__dirname, '..');
const output = join(root, 'public');
// Add runtime assets here atomically with their HTML references.
const files = ['index.html', 'art.js', 'levels.js', 'world.js', 'plan.js', 'plans/motel.js', 'plans/penthouse.js', 'mesh.js', 'missions.js', 'models.js', 'gfxnext.js', 'next/three-renderer.js', 'next/three/build/three.core.js', 'next/three/build/three.module.js', 'next/three/examples/jsm/postprocessing/EffectComposer.js', 'next/three/examples/jsm/postprocessing/MaskPass.js', 'next/three/examples/jsm/postprocessing/OutputPass.js', 'next/three/examples/jsm/postprocessing/Pass.js', 'next/three/examples/jsm/postprocessing/RenderPass.js', 'next/three/examples/jsm/postprocessing/ShaderPass.js', 'next/three/examples/jsm/postprocessing/UnrealBloomPass.js', 'next/three/examples/jsm/shaders/CopyShader.js', 'next/three/examples/jsm/shaders/LuminosityHighPassShader.js', 'next/three/examples/jsm/shaders/OutputShader.js', 'renderer.js', 'weapons.js', 'ai.js', 'cover.js', 'dialogue.js', 'overworld.js', 'cars.js', 'gunshop.js'];
function build() {
  mkdirSync(output, { recursive: true });
  for (const name of readdirSync(output)) {
    rmSync(join(output, name), { recursive: true });
  }
  for (const file of files) {
    mkdirSync(dirname(join(output, file)), { recursive: true });
    copyFileSync(join(root, file), join(output, file));
  }
  console.log(`Assembled public: ${files.join(', ')}`);
}

module.exports = { files };
if (require.main === module) build();
