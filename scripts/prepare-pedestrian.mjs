// The tour reaches the guide at arm's length. Civilians are viewed from the
// boulevard or the tower; retain their skeleton and spend fewer vertices there.
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { meshopt, simplify, textureCompress } from "@gltf-transform/functions";
import {
  MeshoptDecoder,
  MeshoptEncoder,
  MeshoptSimplifier,
} from "meshoptimizer";
import sharp from "sharp";

await Promise.all([
  MeshoptDecoder.ready,
  MeshoptEncoder.ready,
  MeshoptSimplifier.ready,
]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.decoder": MeshoptDecoder,
    "meshopt.encoder": MeshoptEncoder,
  });
const document = await io.read("public/assets/guide/host.glb");
await document.transform(
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.28, error: 0.025 }),
  textureCompress({
    encoder: sharp,
    resize: [128, 128],
    targetFormat: "webp",
    quality: 78,
  }),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);
await io.write("public/assets/guide/pedestrian.glb", document);
