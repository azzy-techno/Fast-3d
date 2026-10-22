import sharp from "sharp";
import { mkdir, readdir, readFile, stat } from "node:fs/promises";
const source = new URL("../public/assets/exterior/", import.meta.url);
const destination = new URL("optimized/", source);
await mkdir(destination, { recursive: true });
let originals = 0,
  optimized = 0;
for (const name of (await readdir(source))
  .filter((name) => /^(facade-|ground-|roof-).*\.png$/.test(name))
  .sort()) {
  const input = new URL(name, source);
  const output = new URL(name.replace(/\.png$/, ".webp"), destination);
  await sharp(await readFile(input))
    .resize({
      width: 1536,
      height: 1536,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 88, effort: 6 })
    .toFile(output.pathname);
  originals += (await stat(input)).size;
  optimized += (await stat(output)).size;
}
console.log(
  `Exterior textures: ${(originals / 1048576).toFixed(2)} MiB → ${(optimized / 1048576).toFixed(2)} MiB. Original PNGs preserved.`,
);
