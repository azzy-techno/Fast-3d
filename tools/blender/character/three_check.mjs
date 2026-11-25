// Loads a final GLB with the real three.js GLTFLoader (+ meshopt decoder) in Node and prints what
// the engine will see: skinned meshes, bone names, clips, posed bounding box.
//   node tools/blender/character/three_check.mjs public/models/engineer.glb [clipToPose]
import fs from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// minimal browser stubs: textures are not decoded, only their presence is checked
globalThis.self = globalThis;
globalThis.createImageBitmap = async (blob) => ({ width: 1, height: 1, close() {}, _bytes: blob.size });
// GLTFLoader looks at navigator.userAgent to decide between ImageBitmapLoader and TextureLoader
if (!globalThis.navigator) globalThis.navigator = { userAgent: 'node' };

// optional: --clips=<other.glb> take the animation clips from another file (clip sharing by bone name)
//           --check=<ped_pose_check.json>:<id> compare posed joint positions with Blender's own retarget
const pos = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
const [file, poseClip = 'Idle'] = pos;
const buf = fs.readFileSync(file);
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const gltf = await new Promise((res, rej) => loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', res, rej));
const scene = gltf.scene;
if (opt.clips) {
  const b2 = fs.readFileSync(opt.clips);
  const other = await new Promise((res, rej) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parse(b2.buffer.slice(b2.byteOffset, b2.byteOffset + b2.byteLength), '', res, rej));
  gltf.animations = other.animations;
  console.log('clips taken from', opt.clips);
}
scene.updateMatrixWorld(true);
const skinned = [];
scene.traverse((o) => { if (o.isSkinnedMesh) skinned.push(o); });
console.log('file', file, (buf.byteLength / 1024).toFixed(1), 'KB');
console.log('scene children:', scene.children.map((c) => `${c.type}:${c.name} pos=${c.position.toArray().map((v) => +v.toFixed(4))} quat=${c.quaternion.toArray().map((v) => +v.toFixed(4))} scale=${c.scale.toArray().map((v) => +v.toFixed(4))}`));
console.log('skinned meshes:', skinned.map((m) => `${m.name} bones=${m.skeleton.bones.length} mat=${m.material.name} map=${!!m.material.map} rough=${m.material.roughness} metal=${m.material.metalness} side=${m.material.side} transparent=${m.material.transparent}`));
const skeletons = new Set(skinned.map((m) => m.skeleton.uuid));
console.log('distinct skeleton bone lists:', new Set(skinned.map((m) => m.skeleton.bones.map((b) => b.name).join(','))).size, '(skeleton objects:', skeletons.size + ')');
console.log('bones:', skinned[0].skeleton.bones.map((b) => b.name).join(' '));
console.log('clips:', gltf.animations.map((a) => `${a.name} ${a.duration.toFixed(3)}s tracks=${a.tracks.length} keys=${a.tracks.reduce((n, t) => n + t.times.length, 0)}`));
const missing = new Set();
for (const a of gltf.animations) for (const t of a.tracks) { const n = t.name.split('.')[0]; if (!scene.getObjectByName(n)) missing.add(n); }
console.log('tracks whose target node is missing:', [...missing]);
for (const a of gltf.animations) {
  // loop closure as three.js sees it: first vs last key of every track
  let worst = 0;
  for (const t of a.tracks) { const s = t.getValueSize(); for (let k = 0; k < s; k++) worst = Math.max(worst, Math.abs(Math.abs(t.values[k]) - Math.abs(t.values[t.values.length - s + k]))); }
  console.log(`  ${a.name}: max |first-last| key difference ${worst.toExponential(2)}`);
}
function bbox(label) {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3();
  for (const m of skinned) { m.skeleton.update(); m.computeBoundingBox(); box.union(m.boundingBox.clone().applyMatrix4(m.matrixWorld)); }
  console.log(label, 'bbox min', box.min.toArray().map((v) => +v.toFixed(3)), 'max', box.max.toArray().map((v) => +v.toFixed(3)));
}
bbox('bind pose');
const clip = gltf.animations.find((a) => a.name === poseClip);
if (clip) {
  const mixer = new THREE.AnimationMixer(scene);
  mixer.clipAction(clip).play();
  mixer.setTime(0);
  bbox(`${poseClip} t=0`);
  const head = scene.getObjectByName('Head'), hips = scene.getObjectByName('Hips'), rh = scene.getObjectByName('RightHand');
  const p = new THREE.Vector3();
  console.log('  Hips', hips.getWorldPosition(p).toArray().map((v) => +v.toFixed(3)), 'Head', head.getWorldPosition(p).toArray().map((v) => +v.toFixed(3)), 'RightHand', rh.getWorldPosition(p).toArray().map((v) => +v.toFixed(3)));
}

if (opt.check) {
  const [jsonFile, id] = opt.check.split(/:(?=[^:]*$)/);
  const ref = JSON.parse(fs.readFileSync(jsonFile, 'utf8'))[id];
  const walk = gltf.animations.find((a) => a.name === 'Walk');
  const mixer = new THREE.AnimationMixer(scene);
  mixer.clipAction(walk).play();
  let worst = 0, lowest = Infinity;
  const p = new THREE.Vector3();
  for (const [frame, bones] of Object.entries(ref)) {
    mixer.setTime(+frame / 30);
    scene.updateMatrixWorld(true);
    for (const [name, want] of Object.entries(bones)) {
      scene.getObjectByName(name).getWorldPosition(p);
      worst = Math.max(worst, Math.hypot(p.x - want[0], p.y - want[1], p.z - want[2]));
      if (name.includes('Toe')) lowest = Math.min(lowest, p.y);
    }
  }
  console.log(`clip-sharing check (${id}, Walk frames ${Object.keys(ref).join('/')}): max joint position difference vs Blender retarget = ${(worst * 1000).toFixed(2)} mm; lowest toe joint y = ${lowest.toFixed(3)}`);
}
