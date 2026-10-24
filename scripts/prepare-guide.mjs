// Bake the licensed Mixamo walk onto the host's own proportions, once at build-authoring time.
import fs from "node:fs/promises";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  AnimationMixer,
  Quaternion,
  Vector3,
  QuaternionKeyframeTrack,
  AnimationClip,
} from "three";
globalThis.ProgressEvent ??= class ProgressEvent {
  constructor(type, init) {
    this.type = type;
    Object.assign(this, init);
  }
};
async function load(file) {
  const b = file.startsWith("https:")
    ? Buffer.from(await (await fetch(file)).arrayBuffer())
    : await fs.readFile(file);
  const n = b.readUInt32LE(12);
  const json = JSON.parse(b.subarray(20, 20 + n));
  json.images = [];
  json.textures = [];
  json.materials = [{}];
  for (const mesh of json.meshes)
    for (const p of mesh.primitives) p.material = 0;
  const binary = b.subarray(28 + n);
  json.buffers = [
    {
      uri: "data:application/octet-stream;base64," + binary.toString("base64"),
      byteLength: binary.length,
    },
  ];
  return new GLTFLoader().parseAsync(JSON.stringify(json), "");
}
const source = await load("public/assets/exterior/pedestrian.glb"),
  target = await load(
    process.argv[2] ||
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/readyplayer.me.glb",
  );
source.scene.rotation.y = Math.PI;
const sm = new AnimationMixer(source.scene),
  tm = new AnimationMixer(target.scene);
sm.clipAction(source.animations.find((a) => a.name === "TPose")).play();
sm.update(0);

source.scene.updateMatrixWorld(true);
target.scene.updateMatrixWorld(true);
// Align the avatar's rest limbs to the source T pose before recording offsets.
const targetBones = [];
target.scene.traverse((b) => {
  if (b.isBone) targetBones.push(b);
});
for (const b of targetBones) {
  const child = b.children.find((c) => c.isBone);
  if (!child) continue;
  const src = source.scene.getObjectByName("mixamorig" + b.name),
    sc = source.scene.getObjectByName("mixamorig" + child.name);
  if (!src || !sc) continue;
  const a = child
    .getWorldPosition(new Vector3())
    .sub(b.getWorldPosition(new Vector3()))
    .normalize();
  const d = sc
    .getWorldPosition(new Vector3())
    .sub(src.getWorldPosition(new Vector3()))
    .normalize();
  const q = new Quaternion()
    .setFromUnitVectors(a, d)
    .multiply(b.getWorldQuaternion(new Quaternion()));
  b.quaternion.copy(
    b.parent.getWorldQuaternion(new Quaternion()).invert().multiply(q),
  );
  b.updateMatrixWorld(true);
}
const sb = new Map(),
  tb = [];
source.scene.traverse((b) => {
  if (b.isBone)
    sb.set(b.name.replace(/^mixamorig:?/, ""), {
      bone: b,
      bind: b.getWorldQuaternion(new Quaternion()),
    });
});
target.scene.traverse((b) => {
  if (b.isBone)
    tb.push({
      bone: b,
      bind: b.getWorldQuaternion(new Quaternion()),
      source: sb.get(b.name.replace(/^mixamorig:?/, "")),
      values: [],
    });
});

sm.stopAllAction();
tm.stopAllAction();
const clips = [];
for (const name of ["Walk", "Idle"]) {
  const c = source.animations.find((a) => a.name === name);
  sm.stopAllAction();
  sm.clipAction(c).play();
  const times = [];
  tb.forEach((b) => (b.values = []));
  for (let i = 0; i <= 60; i++) {
    const t = (i * c.duration) / 60;
    sm.setTime(t);
    source.scene.updateMatrixWorld(true);
    times.push(t);
    for (const b of tb) {
      if (!b.source) continue;
      const q = b.source.bone
        .getWorldQuaternion(new Quaternion())
        .multiply(b.source.bind.clone().invert())
        .multiply(b.bind);
      const parent = b.bone.parent
        .getWorldQuaternion(new Quaternion())
        .invert();
      b.bone.quaternion.copy(parent.multiply(q));
      b.bone.updateMatrixWorld(true);
      b.values.push(...b.bone.quaternion.toArray());
    }
  }
  const tracks = tb
    .filter((b) => b.source)
    .map(
      (b) =>
        new QuaternionKeyframeTrack(
          b.bone.name.replaceAll(":", "") + ".quaternion",
          times,
          b.values,
        ),
    );
  clips.push(AnimationClip.toJSON(new AnimationClip(name, c.duration, tracks)));
}
await fs.writeFile("public/assets/guide/motion.json", JSON.stringify(clips));
