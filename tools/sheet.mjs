// Contact sheet of exhibit preview renders:  node tools/sheet.mjs <floorId> <station ids...>
import sharp from "sharp";
const d = "../_previews/";
const [id, ...names] = process.argv.slice(2);
const n = ["overview", ...names];
const c = [];
for (let i = 0; i < n.length; i++) c.push({ input: await sharp(`${d}ex_${id}_${n[i]}.jpg`).resize(800, 450).toBuffer(), left: (i % 2) * 800, top: Math.floor(i / 2) * 450 });
await sharp({ create: { width: 1600, height: 450 * Math.ceil(n.length / 2), channels: 3, background: "#000" } }).composite(c).jpeg({ quality: 74 }).toFile(`${d}sheet_${id}.jpg`);
