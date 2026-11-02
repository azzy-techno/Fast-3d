import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
const N = 512,
  folder = "public/assets/electrical/materials";
await mkdir(folder, { recursive: true });
function hash(x, y, seed) {
  let n = Math.imul(x + seed, 374761393) ^ Math.imul(y + seed, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
function noise(x, y, period, seed) {
  const fx = (x / N) * period,
    fy = (y / N) * period,
    ix = Math.floor(fx),
    iy = Math.floor(fy);
  const sx = fx - ix,
    sy = fy - iy,
    u = sx * sx * (3 - 2 * sx),
    v = sy * sy * (3 - 2 * sy);
  const a = hash(ix % period, iy % period, seed),
    b = hash((ix + 1) % period, iy % period, seed),
    c = hash(ix % period, (iy + 1) % period, seed),
    d = hash((ix + 1) % period, (iy + 1) % period, seed);
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}
for (const kind of ["limestone", "travertine", "acoustic"]) {
  const albedo = Buffer.alloc(N * N * 3),
    rough = Buffer.alloc(N * N * 3),
    normal = Buffer.alloc(N * N * 3),
    height = new Float32Array(N * N);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const i = y * N + x,
        grain = hash(x, y, 18) - 0.5;
      const cloud =
        noise(x, y, 8, 4) * 0.55 +
        noise(x, y, 32, 8) * 0.3 +
        noise(x, y, 128, 12) * 0.15;
      let shade = 0,
        r = 0.7,
        h = 0.5,
        base;
      if (kind === "limestone") {
        const joint = x < 2 || y < 2;
        shade = (cloud - 0.5) * 24 + grain * 7;
        base = joint ? [117, 118, 110] : [190, 183, 164];
        r = joint ? 0.92 : 0.61 + cloud * 0.14;
        h = joint ? 0.18 : 0.5 + grain * 0.025;
        if (hash(x, y, 90) > 0.994 && !joint) {
          shade -= 35;
          h -= 0.08;
        }
      } else if (kind === "travertine") {
        const striation = noise(x, (y * 6) % N, 32, 7);
        shade = (cloud - 0.5) * 13 + (striation - 0.5) * 20 + grain * 5;
        base = [194, 184, 164];
        r = 0.78;
        h = 0.5 + (striation - 0.5) * 0.1;
      } else {
        const dx = (x % 16) - 8,
          dy = (y % 16) - 8,
          hole = dx * dx + dy * dy < 7;
        base = hole ? [45, 51, 51] : [143, 146, 137];
        shade = grain * 6;
        r = 0.94;
        h = hole ? 0.2 : 0.5;
      }
      for (let c = 0; c < 3; c++) {
        albedo[i * 3 + c] = Math.max(0, Math.min(255, base[c] + shade));
        rough[i * 3 + c] = Math.round(r * 255);
      }
      height[i] = h;
    }
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 3,
        dx =
          (height[y * N + ((x + 1) % N)] - height[y * N + ((x + N - 1) % N)]) *
          2,
        dy =
          (height[((y + 1) % N) * N + x] - height[((y + N - 1) % N) * N + x]) *
          2;
      const len = Math.hypot(dx, dy, 1);
      normal[i] = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
      normal[i + 1] = Math.round(((dy / len) * 0.5 + 0.5) * 255);
      normal[i + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
    }
  for (const [suffix, pixels] of [
    ["color", albedo],
    ["roughness", rough],
    ["normal", normal],
  ])
    await sharp(pixels, { raw: { width: N, height: N, channels: 3 } })
      .webp({ quality: 90 })
      .toFile(`${folder}/${kind}-${suffix}.webp`);
}
await writeFile(
  `${folder}/README.txt`,
  "Original procedural materials authored for the FAST conceptual exhibition.\nRegenerate with: node scripts/generate-electrical-materials.mjs\nColor maps: sRGB. Normal/roughness maps: linear data. All maps 512 x 512, tileable.\nNo third-party images or material licenses required.\n",
);
console.log("Created nine tileable color / normal / roughness maps.");
