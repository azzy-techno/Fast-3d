// Build the reception host from the licensed, retargeted FAST rig.
import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  copyToDocument,
  meshopt,
  prune,
  unpartition,
} from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.decoder": MeshoptDecoder,
    "meshopt.encoder": MeshoptEncoder,
  });
const directory = await mkdtemp(join(tmpdir(), "fast-engineer-"));
try {
  const file = join(directory, "hair.glb");
  execFileSync(
    "blender",
    ["-b", "-P", "scripts/blender/engineer-hair.py", "--", file],
    { stdio: "inherit" },
  );
  const doc = await io.read("public/assets/guide/host.glb");
  const nodes = doc.getRoot().listNodes();
  for (const node of nodes.filter((n) => /Headwear|Beard/.test(n.getName())))
    node.dispose();
  const groom = await io.read(file);
  const hair = groom
    .getRoot()
    .listNodes()
    .find((n) => n.getMesh());
  nodes
    .find((n) => n.getName() === "Head")
    .addChild(copyToDocument(doc, groom, [hair]).get(hair));
  const face = nodes
    .find((n) => n.getName() === "Wolf3D_Head")
    .getMesh()
    .listPrimitives()[0]
    .getAttribute("POSITION");
  const pos = [];
  // Shape the chin and cheek planes while retaining the eye line, UVs and skin weights.
  const min = face.getElement(0, []),
    max = [...min];
  for (let i = 1; i < face.getCount(); i++) {
    face.getElement(i, pos);
    for (let j = 0; j < 3; j++) {
      min[j] = Math.min(min[j], pos[j]);
      max[j] = Math.max(max[j], pos[j]);
    }
  }
  for (let i = 0; i < face.getCount(); i++) {
    face.getElement(i, pos);
    const height = (pos[1] - min[1]) / (max[1] - min[1]);
    const front = Math.max(
      0,
      ((pos[2] - (min[2] + max[2]) / 2) / (max[2] - min[2])) * 2,
    );
    const jaw = Math.exp(-(((height - 0.4) / 0.13) ** 2));
    const cheek = Math.exp(-(((height - 0.59) / 0.1) ** 2));
    pos[0] *= 1 + 0.073 * jaw + 0.028 * cheek;
    pos[2] += (max[2] - min[2]) * 0.025 * front * jaw;
    face.setElement(i, pos);
  }
  await doc.transform(
    unpartition(),
    prune({ keepLeaves: true }),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
  await io.write("public/assets/guide/engineer.glb", doc);
} finally {
  await rm(directory, { recursive: true, force: true });
}
