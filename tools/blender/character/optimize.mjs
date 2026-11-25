// Web-optimises the raw GLBs written by build_engineer.py / build_pedestrians.py.
//   node tools/blender/character/optimize.mjs engineer    <workDir> <outDir>
//   node tools/blender/character/optimize.mjs pedestrians <workDir> <outDir>
// Steps: drop redundant animation channels -> resample (remove interpolatable keys) -> WebP textures
// -> meshopt (quantise + compress).  Never flattens/joins/simplifies, so skin + clips stay intact.
// Also writes <outDir>/engineer.meta.json measured from the final GLB.
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { resample, prune, dedup, textureCompress, meshopt } from '@gltf-transform/functions';
import { ready as resampleReady, resample as resampleWASM } from 'keyframe-resample';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';

const [mode, workDir, outDir] = process.argv.slice(2);
if (!mode || !workDir || !outDir) {
  console.error('usage: optimize.mjs <engineer|pedestrians> <workDir> <outDir>');
  process.exit(1);
}
await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

const EPS_T = 2e-4; // metres
const EPS_R = 2e-4; // quaternion component

/** Remove channels that carry nothing: scale, translations/rotations that never leave the rest pose. */
function pruneChannels(doc, { keepTranslation = ['Hips'] } = {}) {
  let removed = 0;
  for (const anim of doc.getRoot().listAnimations()) {
    for (const ch of anim.listChannels()) {
      const node = ch.getTargetNode();
      const sampler = ch.getSampler();
      const pathName = ch.getTargetPath();
      const out = sampler.getOutput().getArray();
      let drop = false;
      if (!node || pathName === 'scale' || pathName === 'weights') drop = true;
      else if (pathName === 'translation') {
        const rest = node.getTranslation();
        let dev = 0;
        for (let i = 0; i < out.length; i++) dev = Math.max(dev, Math.abs(out[i] - rest[i % 3]));
        drop = dev < EPS_T || !keepTranslation.includes(node.getName());
        if (dev >= EPS_T && drop) console.warn(`  note: dropping moving translation on ${node.getName()} (${dev.toFixed(4)} m)`);
      } else if (pathName === 'rotation') {
        const rest = node.getRotation();
        let dev = 0;
        for (let i = 0; i < out.length; i += 4) {
          const s = out[i] * rest[0] + out[i + 1] * rest[1] + out[i + 2] * rest[2] + out[i + 3] * rest[3] < 0 ? -1 : 1;
          for (let k = 0; k < 4; k++) dev = Math.max(dev, Math.abs(s * out[i + k] - rest[k]));
        }
        drop = dev < EPS_R;
      }
      if (drop) {
        anim.removeChannel(ch);
        ch.dispose();
        removed++;
      }
    }
    for (const s of anim.listSamplers()) if (s.listParents().filter((p) => p.propertyType === PropertyType.ANIMATION_CHANNEL).length === 0) { anim.removeSampler(s); s.dispose(); }
  }
  return removed;
}

async function optimise(inFile, outFile, { textureSize = 1024, quality = 82, dropAnimations = false } = {}) {
  const doc = await io.read(inFile);
  doc.getRoot().getAsset().generator = 'FAST character pipeline (Blender 5.2 + glTF-Transform)';
  if (dropAnimations) for (const a of doc.getRoot().listAnimations()) a.dispose();
  const removed = pruneChannels(doc);
  await doc.transform(
    resample({ ready: resampleReady, resample: resampleWASM, tolerance: 1e-4 }),
    dedup(),
    prune({ keepLeaves: true, keepAttributes: false }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [textureSize, textureSize], quality, effort: 6 }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  await io.write(outFile, doc);
  const size = fs.statSync(outFile).size;
  console.log(`${path.basename(outFile)}: ${(size / 1024).toFixed(1)} KB (removed ${removed} idle channels)`);
  return io.read(outFile); // re-read the compressed file so everything below reflects what ships
}

// ---------------------------------------------------------------- small math helpers (column-major, glTF)
const qmul = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];
const qrot = (q, v) => {
  const [x, y, z, w] = q;
  const ix = w * v[0] + y * v[2] - z * v[1], iy = w * v[1] + z * v[0] - x * v[2], iz = w * v[2] + x * v[1] - y * v[0], iw = -x * v[0] - y * v[1] - z * v[2];
  return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x];
};
const r4 = (v) => v.map((x) => +x.toFixed(4));
const axisName = (v) => {
  const i = [0, 1, 2].reduce((a, b) => (Math.abs(v[b]) > Math.abs(v[a]) ? b : a), 0);
  return (v[i] < 0 ? '-' : '+') + 'XYZ'[i];
};

function restWorld(node) {
  // world rest TRS (uniform scale 1 everywhere in these files)
  const chain = [];
  for (let n = node; n; n = n.getParentNode()) chain.unshift(n);
  let q = [0, 0, 0, 1], p = [0, 0, 0];
  for (const n of chain) {
    const t = qrot(q, n.getTranslation());
    p = [p[0] + t[0], p[1] + t[1], p[2] + t[2]];
    q = qmul(q, n.getRotation());
  }
  return { p, q };
}

function stats(doc) {
  const root = doc.getRoot();
  let tris = 0;
  for (const m of root.listMeshes()) for (const pr of m.listPrimitives()) tris += (pr.getIndices() ? pr.getIndices().getCount() : pr.getAttribute('POSITION').getCount()) / 3;
  const clips = {};
  for (const a of root.listAnimations()) {
    let d = 0;
    for (const s of a.listSamplers()) d = Math.max(d, s.getInput().getMax([])[0]);
    clips[a.getName()] = +d.toFixed(4);
  }
  return {
    triangles: tris,
    skins: root.listSkins().length,
    joints: root.listSkins()[0]?.listJoints().length ?? 0,
    textures: root.listTextures().map((t) => `${t.getName()} ${t.getSize()?.join('x')} ${t.getMimeType()} ${(t.getImage().byteLength / 1024).toFixed(0)}KB`),
    clips,
  };
}

/** Which local axis does a joint mostly rotate about during a clip (hinge axis)? */
function hingeAxis(doc, clip, nodeName) {
  const anim = doc.getRoot().listAnimations().find((a) => a.getName() === clip);
  const ch = anim?.listChannels().find((c) => c.getTargetNode()?.getName() === nodeName && c.getTargetPath() === 'rotation');
  if (!ch) return null;
  const out = ch.getSampler().getOutput();
  const rest = ch.getTargetNode().getRotation();
  const inv = [-rest[0], -rest[1], -rest[2], rest[3]];
  const acc = [0, 0, 0];
  const el = [];
  let n0 = null;
  for (let i = 0; i < out.getCount(); i++) {
    out.getElement(i, el);
    const d = qmul(inv, el); // rotation relative to rest, expressed in the bone's rest frame
    const s = d[3] < 0 ? -1 : 1;
    const v = [s * d[0], s * d[1], s * d[2]];
    n0 ??= v;
    const sg = v[0] * n0[0] + v[1] * n0[1] + v[2] * n0[2] < 0 ? -1 : 1;
    for (let k = 0; k < 3; k++) acc[k] += sg * v[k];
  }
  const len = Math.hypot(...acc) || 1;
  return r4(acc.map((x) => x / len));
}

function engineerMeta(doc, build) {
  const root = doc.getRoot();
  const byName = new Map(root.listNodes().map((n) => [n.getName(), n]));
  const info = (name, child) => {
    const n = byName.get(name);
    if (!n) throw new Error(`missing bone ${name}`);
    const w = restWorld(n);
    const o = { parent: n.getParentNode()?.getName() ?? null, restWorldPosition: r4(w.p) };
    if (child) {
      const t = byName.get(child).getTranslation();
      o.length = +Math.hypot(...t).toFixed(4);
      o.child = child;
      o.axisToChild = axisName(t);
    }
    // where the bone's local axes point in character space at rest (+X = character's left, +Y up, +Z forward)
    const ax = [qrot(w.q, [1, 0, 0]), qrot(w.q, [0, 1, 0]), qrot(w.q, [0, 0, 1])];
    o.restAxesWorld = { x: r4(ax[0]), y: r4(ax[1]), z: r4(ax[2]) };
    // which local axis is closest to character forward (+Z) / up (+Y) / left (+X) at rest
    const closest = (c) => axisName(ax.map((a) => a[c]));
    o.facing = { forward: closest(2), up: closest(1), left: closest(0) };
    return o;
  };
  const side = (S) => ({
    shoulder: `${S}Shoulder`, upperArm: `${S}Arm`, foreArm: `${S}ForeArm`, hand: `${S}Hand`,
    index: [`${S}HandIndex1`, `${S}HandIndex2`, `${S}HandIndex3`],
    thumb: [`${S}HandThumb1`, `${S}HandThumb2`, `${S}HandThumb3`],
    middle: [`${S}HandMiddle1`, `${S}HandMiddle2`, `${S}HandMiddle3`],
    ring: [`${S}HandRing1`, `${S}HandRing2`, `${S}HandRing3`],
    pinky: [`${S}HandPinky1`, `${S}HandPinky2`, `${S}HandPinky3`],
    upLeg: `${S}UpLeg`, leg: `${S}Leg`, foot: `${S}Foot`, toe: `${S}ToeBase`,
  });
  const detail = {};
  const chain = [
    ['Hips', 'Spine'], ['Spine', 'Spine1'], ['Spine1', 'Spine2'], ['Spine2', 'Neck'], ['Neck', 'Head'], ['Head', null], ['Jaw', null],
  ];
  for (const S of ['Left', 'Right']) {
    chain.push([`${S}Shoulder`, `${S}Arm`], [`${S}Arm`, `${S}ForeArm`], [`${S}ForeArm`, `${S}Hand`], [`${S}Hand`, `${S}HandMiddle1`],
      [`${S}HandIndex1`, `${S}HandIndex2`], [`${S}HandIndex2`, `${S}HandIndex3`], [`${S}HandIndex3`, null],
      [`${S}UpLeg`, `${S}Leg`], [`${S}Leg`, `${S}Foot`], [`${S}Foot`, `${S}ToeBase`]);
  }
  for (const [n, c] of chain) detail[n] = info(n, c);
  const st = stats(doc);
  const armature = root.listSkins()[0].listJoints()[0].getParentNode();
  return {
    asset: 'engineer.glb',
    source: 'Microsoft Rocketbox Construction_Male_08 + Rocketbox animations (MIT) - see tools/blender/character/SOURCES.md',
    height: build.height,
    units: 'metres, Y up, character faces +Z, feet on y=0, origin between the feet',
    walkSpeed: +build.walkSpeed.toFixed(3),
    walkSpeedNote: `Walk is in place; one cycle (${st.clips.Walk}s, 2 steps) covers ${build.walkStride.toFixed(3)} m in the source root motion => ${build.walkSpeed.toFixed(3)} m/s cycle average (no net slide). Root speed while a foot is planted averages ${build.walkSpeedStance.toFixed(3)} m/s.`,
    clips: st.clips,
    clipNotes: {
      Idle: 'seamless loop', Walk: 'seamless loop, in place (vertical bob + sway kept)', Talk: 'seamless loop, left-hand explaining gestures (right arm stays low, free for pointing IK)', Wave: 'one-shot right-hand wave; starts and ends in the Idle frame-0 pose',
    },
    triangles: st.triangles,
    rootNode: armature?.getName() ?? null,
    skinnedMesh: root.listNodes().find((n) => n.getMesh())?.getName(),
    bones: {
      hips: 'Hips', spine: ['Spine', 'Spine1', 'Spine2'], neck: 'Neck', head: 'Head', jaw: 'Jaw',
      left: side('Left'), right: side('Right'),
      all: root.listSkins()[0].listJoints().map((j) => j.getName()),
    },
    conventions: {
      boneAxis: 'local +Y runs along every limb/spine/finger bone toward its child (see detail.*.axisToChild); feet are the exception (local +Y points forward/down toward the toes)',
      restPose: 'A-pose (arms ~45 deg down). detail.*.restAxesWorld gives each bone\'s local X/Y/Z axes in character space at rest.',
      elbowHinge: { LeftForeArm: hingeAxis(doc, 'Talk', 'LeftForeArm'), RightForeArm: hingeAxis(doc, 'Wave', 'RightForeArm'), note: 'measured: dominant local rotation axis (relative to rest) of each forearm in the shipped clips' },
      hierarchyNote: 'Rocketbox parents thighs to Spine and clavicles to Neck; here thighs are children of Hips and shoulders children of Spine2, so Neck/Head can be driven by a look-at without moving the arms. Facial bones were folded into Head (lower-lip bones into Jaw); Jaw is kept un-animated for an optional talk flap.',
      headLookAt: 'Spine/Spine1/Spine2/Neck/Head share one frame at rest: local +Y up (yaw; +angle turns toward the character\x27s left), local +Z = character\x27s left (pitch; +angle nods down), local -X forward (roll axis).',
      jaw: 'open the mouth with a positive rotation about Jaw local +Z (0.2 rad is wide open); 0 = closed (rest).',
      elbowFlex: 'flexing either elbow is a rotation of the ForeArm about its local -Z (i.e. a negative angle about +Z); rest pose already has ~20 deg of flex.',
      threeNames: 'node names contain no spaces/dots, so three.js keeps them unchanged',
    },
    detail,
  };
}

fs.mkdirSync(outDir, { recursive: true });
if (mode === 'engineer') {
  const build = JSON.parse(fs.readFileSync(path.join(workDir, 'engineer_build.json'), 'utf8'));
  const doc = await optimise(path.join(workDir, 'engineer_raw.glb'), path.join(outDir, 'engineer.glb'), { textureSize: 1024, quality: 84 });
  console.log(stats(doc));
  const meta = engineerMeta(doc, build);
  fs.writeFileSync(path.join(outDir, 'engineer.meta.json'), JSON.stringify(meta, null, 2) + '\n');
  console.log('wrote engineer.meta.json');
} else if (mode === 'pedestrians') {
  const build = JSON.parse(fs.readFileSync(path.join(workDir, 'pedestrians_build.json'), 'utf8'));
  const meta = { ...build.meta, files: {} };
  for (const [i, p] of build.peds.entries()) {
    const out = path.join(outDir, `ped-${i + 1}.glb`);
    const doc = await optimise(path.join(workDir, `ped-${i + 1}_raw.glb`), out, { textureSize: 512, quality: 80, dropAnimations: i > 0 });
    const st = stats(doc);
    console.log(st);
    meta.files[`ped-${i + 1}.glb`] = { source: p.source, description: p.description, height: p.height, suggestedScale: p.suggestedScale, triangles: st.triangles, joints: st.joints, textures: st.textures, bytes: fs.statSync(out).size, clips: st.clips };
  }
  fs.writeFileSync(path.join(outDir, 'pedestrians.meta.json'), JSON.stringify(meta, null, 2) + '\n');
  console.log('wrote pedestrians.meta.json');
} else {
  throw new Error(`unknown mode ${mode}`);
}
