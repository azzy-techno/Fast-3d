// Build the shared tiling "detail" textures in public/tex from CC0 Poly Haven sources.
// Each map is normalised to a light neutral mean so the material colour set in Blender tints it.
// Sources (all CC0, https://polyhaven.com/a/<name>): see MAP below. Download the 1k diffuse JPGs into
// ../_downloads/tex/<name>.jpg first (https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/<name>/<name>_diff_1k.jpg).
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.resolve(repo, "..", "_downloads", "tex");
const MAP = {
  asphalt: ["asphalt_02", 512, 0.86],
  concrete: ["concrete_floor_02", 512, 0.88],
  paving: ["concrete_pavers", 768, 0.86],
  stone: ["large_floor_tiles_02", 768, 0.9],
  wood: ["oak_veneer_01", 512, 0.86],
  precast: ["brushed_concrete", 512, 0.88],
};
const sheet = [];
for (const [name, [file, size, mean]] of Object.entries(MAP)) {
  const img = sharp(path.join(src, file + ".jpg")).resize(size, size);
  const st = await img.clone().stats();
  const m = st.channels.slice(0, 3).map((c) => c.mean / 255);
  const lum = 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2];
  const k = mean / lum;
  // keep 35 % of the original hue so stone / wood still read as themselves under the tint
  const gains = m.map((c) => k * (0.35 + 0.65 * (lum / c)));
  const out = path.join(repo, "public", "tex", name + ".webp");
  const info = await img.linear(gains, [0, 0, 0]).webp({ quality: 66, effort: 6 }).toFile(out);
  console.log(name, file, size, (info.size / 1024).toFixed(0) + " KB");
  sheet.push({ input: await sharp(out).resize(256, 256).toBuffer(), left: sheet.length * 256, top: 0 });
}
await sharp({ create: { width: 256 * sheet.length, height: 256, channels: 3, background: "#000" } }).composite(sheet).jpeg({ quality: 75 }).toFile(path.resolve(repo, "..", "_previews", "tex_sheet.jpg"));
