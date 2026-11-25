// Optimise a raw Blender export into public/models and convert its lightmaps.
//   node tools/pack.mjs <name> [--lm <lightmapName>[:size]]...
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { dedup, prune, weld, reorder, quantize } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const work = path.resolve(repo, "..", "_work");
const args = process.argv.slice(2);
const name = args[0];
const lms = [];
for (let i = 1; i < args.length; i++) if (args[i] === "--lm") lms.push(args[++i]);

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const src = path.join(work, `${name}.raw.glb`);
const doc = await io.read(src);
const keep = { keepExtras: true, keepLeaves: true, keepAttributes: true };
await doc.transform(dedup(), prune(keep), weld());

// Tiling UVs run far beyond 0..1 and no texture is embedded to carry a compensating transform, so
// quantise them here: 16-bit normalised, with [scaleU, scaleV, offsetU, offsetV] in the primitive extras.
// The engine expands them again on load (see src/engine/assets.ts).
const buffer = doc.getRoot().listBuffers()[0];
for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const uv = prim.getAttribute("TEXCOORD_0");
    if (!uv || uv.getComponentType() !== 5126) continue;
    const arr = uv.getArray();
    let minU = Infinity;
    let minV = Infinity;
    let maxU = -Infinity;
    let maxV = -Infinity;
    for (let i = 0; i < arr.length; i += 2) {
      minU = Math.min(minU, arr[i]);
      maxU = Math.max(maxU, arr[i]);
      minV = Math.min(minV, arr[i + 1]);
      maxV = Math.max(maxV, arr[i + 1]);
    }
    const su = Math.max(1e-6, maxU - minU);
    const sv = Math.max(1e-6, maxV - minV);
    const q = new Uint16Array(arr.length);
    for (let i = 0; i < arr.length; i += 2) {
      q[i] = Math.round(((arr[i] - minU) / su) * 65535);
      q[i + 1] = Math.round(((arr[i + 1] - minV) / sv) * 65535);
    }
    const acc = doc.createAccessor().setType("VEC2").setArray(q).setNormalized(true).setBuffer(buffer);
    prim.setAttribute("TEXCOORD_0", acc);
    prim.setExtras({ ...prim.getExtras(), uvt: [su, sv, minU, minV].map((v) => +v.toFixed(5)) });
  }
}

await doc.transform(
  prune(keep),
  reorder({ encoder: MeshoptEncoder }),
  quantize({ pattern: /^(POSITION|NORMAL|COLOR(_\d+)?|TEXCOORD_1)$/, quantizePosition: 16, quantizeNormal: 10, quantizeColor: 8, quantizeTexcoord: 16 }),
);
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
const out = path.join(repo, "public", "models", `${name}.glb`);
await io.write(out, doc);
let tris = 0;
for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) tris += p.getIndices().getCount() / 3;
console.log(`${name}.glb ${(fs.statSync(out).size / 1024).toFixed(0)} KB, ${doc.getRoot().listMeshes().length} meshes, ${Math.round(tris)} tris`);

for (const spec of lms) {
  const [lm, size] = spec.split(":");
  const png = path.join(work, `${lm}.png`);
  let img = sharp(png);
  if (size) img = img.resize(Number(size), Number(size), { kernel: "lanczos3" });
  const dst = path.join(repo, "public", "tex", `${lm}.webp`);
  await img.webp({ quality: 84, smartSubsample: true, effort: 5 }).toFile(dst);
  console.log(`${lm}.webp ${(fs.statSync(dst).size / 1024).toFixed(0)} KB`);
}
