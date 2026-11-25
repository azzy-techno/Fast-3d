// Capture the same four moments in the old build and compose before / after pairs for the handoff.
//   node tools/compare-shots.mjs     (needs both servers from tools/measure.mjs and a finished `npm test` run)
// Output: docs/media/compare-*.jpg
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OLD = "http://127.0.0.1:4174/Fast-3d/";
const before = path.resolve("artifacts", "before");
const media = path.resolve("docs", "media");
fs.mkdirSync(before, { recursive: true });
fs.mkdirSync(media, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  args: ["--window-size=1480,1040", "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding", "--no-first-run"],
  defaultViewport: null,
});
const page = (await browser.pages())[0];
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
const shot = (n) => page.screenshot({ path: path.join(before, n + ".jpg"), type: "jpeg", quality: 86 });
const scrollTo = async (frac, ms = 3500) => {
  await page.evaluate(
    async (frac, ms) => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const from = scrollY;
      const to = max * frac;
      const t0 = performance.now();
      await new Promise((res) => {
        const f = () => {
          const k = Math.min(1, (performance.now() - t0) / ms);
          window.scrollTo(0, from + (to - from) * k);
          if (k < 1) requestAnimationFrame(f);
          else res();
        };
        f();
      });
    },
    frac,
    ms,
  );
  await sleep(2500);
};
const ride = async (name) => {
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /Choose floor/.test(b.innerText) && b.offsetParent)?.click());
  await sleep(900);
  await page.evaluate((name) => [...document.querySelectorAll("button")].find((b) => b.innerText.replace(/\s+/g, " ").includes(name) && b.offsetParent)?.click(), name);
  await sleep(7000);
};
try {
  await page.goto(OLD, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".arrival-loader", { timeout: 30000 });
  await page.waitForFunction(() => !document.querySelector(".arrival-loader") && !!document.querySelector("canvas"), { timeout: 240000, polling: 100 });
  await sleep(2500);
  await shot("arrival");
  await scrollTo(0.62);
  await shot("reception");
  await scrollTo(1.0);
  await sleep(1500);
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.innerText.replace(/\s+/g, " ").includes("Electrical") && b.offsetParent)?.click());
  await sleep(7000);
  await scrollTo(0.2, 4000);
  await shot("electrical");
  await ride("Cooling towers");
  await scrollTo(0.5, 5000);
  await shot("roof");
} catch (e) {
  console.log("old capture failed:", String(e).slice(0, 200));
}
await browser.close();

const pairs = [
  ["arrival", "artifacts/test/01-street.jpg", "Arrival"],
  ["reception", "artifacts/test/03-reception.jpg", "Reception"],
  ["electrical", "artifacts/test/floor-electrical.jpg", "Level 02 Electrical"],
  ["roof", "artifacts/test/13-roof-exploded.jpg", "Rooftop cooling tower"],
];
const label = (text) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="44"><rect width="900" height="44" fill="#0b1118"/><text x="18" y="29" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="600" fill="#f5f2ea">${text}</text></svg>`);
for (const [name, after, title] of pairs) {
  const a = path.join(before, name + ".jpg");
  if (!fs.existsSync(a) || !fs.existsSync(after)) {
    console.log("skipping", name);
    continue;
  }
  const left = await sharp(a).resize(900, 562, { fit: "cover" }).toBuffer();
  const right = await sharp(after).resize(900, 562, { fit: "cover" }).toBuffer();
  await sharp({ create: { width: 1808, height: 606, channels: 3, background: "#0b1118" } })
    .composite([
      { input: label(`${title} · before`), left: 0, top: 0 },
      { input: label(`${title} · after`), left: 908, top: 0 },
      { input: left, left: 0, top: 44 },
      { input: right, left: 908, top: 44 },
    ])
    .jpeg({ quality: 82 })
    .toFile(path.join(media, `compare-${name}.jpg`));
  console.log("wrote", `docs/media/compare-${name}.jpg`);
}
process.exit(0);
