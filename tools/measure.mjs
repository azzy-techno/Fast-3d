// Compare loading and frame pacing of two builds under identical conditions.
//   node tools/serve.mjs ../baseline/Fast-3d 4174 /Fast-3d/   (old build)
//   node tools/serve.mjs dist 4173 /Fast-3d/                  (new build)
//   node tools/measure.mjs [--only old|new] [--profile desktop|mobile]
// Writes artifacts/measure.json and screenshots. Uses the installed Chrome with its real GPU.
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const onlyProfile = args.includes("--profile") ? args[args.indexOf("--profile") + 1] : null;
const out = path.resolve("artifacts");
fs.mkdirSync(out, { recursive: true });

const TARGETS = {
  old: { url: "http://127.0.0.1:4174/Fast-3d/", kind: "old" },
  new: { url: "http://127.0.0.1:4173/Fast-3d/?probe", kind: "new" },
};
const PROFILES = {
  desktop: { viewport: { width: 1440, height: 900, deviceScaleFactor: 1 }, cpu: 1, touch: false },
  mobile: {
    viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    cpu: 4,
    touch: true,
    ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  },
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const open = [];

const RECORDER = `
  window.__ft = []; window.__t0 = performance.now();
  (function loop(last){ requestAnimationFrame(function(t){ window.__ft.push([t, t - last]); loop(t); }); })(performance.now());
`;
const stats = (frames) => {
  const d = frames.map((f) => f[1]).filter((x) => x < 60000);
  if (!d.length) return { frames: 0 };
  const s = [...d].sort((a, b) => a - b);
  const sum = d.reduce((a, b) => a + b, 0);
  return {
    frames: d.length,
    avgMs: +(sum / d.length).toFixed(1),
    p95Ms: +s[Math.floor(s.length * 0.95)].toFixed(1),
    p99Ms: +s[Math.floor(s.length * 0.99)].toFixed(1),
    worstMs: Math.round(s[s.length - 1]),
    over33: d.filter((x) => x > 33.4).length,
    over50: d.filter((x) => x > 50).length,
    over100: d.filter((x) => x > 100).length,
  };
};

async function run(name, target, profName, prof) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: false,
    args: [
      `--window-size=${prof.viewport.width + 40},${prof.viewport.height + 140}`,
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--no-first-run",
      "--no-default-browser-check",
      "--autoplay-policy=no-user-gesture-required",
    ],
    defaultViewport: null,
  });
  open.push(browser);
  const page = (await browser.pages())[0];
  const cdp = await page.createCDPSession();
  await page.setViewport(prof.viewport);
  if (prof.ua) await page.setUserAgent(prof.ua);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (prof.cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: prof.cpu });
  await page.evaluateOnNewDocument(RECORDER);
  let bytes = 0;
  let requests = 0;
  cdp.on("Network.loadingFinished", (e) => {
    bytes += e.encodedDataLength;
    requests++;
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  const res = { name, profile: profName, url: target.url };
  const shot = (label) => page.screenshot({ path: path.join(out, `${name}-${profName}-${label}.jpg`), type: "jpeg", quality: 82 });
  const frames = () => page.evaluate(() => window.__ft.splice(0));
  const scroll = async (distance, seconds) => {
    // the same input for both builds: real wheel notches on desktop, real touch drags on mobile
    const x = Math.round(prof.viewport.width / 2);
    const y0 = Math.round(prof.viewport.height * 0.62);
    if (!prof.touch) {
      const notches = Math.round(distance / 100);
      const gap = (seconds * 1000) / notches;
      for (let i = 0; i < notches; i++) {
        await cdp.send("Input.dispatchMouseEvent", { type: "mouseWheel", x, y: y0, deltaX: 0, deltaY: 100 });
        await sleep(gap);
      }
      return;
    }
    const swipes = Math.max(1, Math.round(distance / 420));
    const per = (seconds * 1000) / swipes;
    for (let i = 0; i < swipes; i++) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0 }] });
      const steps = 14;
      for (let k = 1; k <= steps; k++) {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y0 - (420 * k) / steps }] });
        await sleep((per * 0.6) / steps);
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await sleep(per * 0.4);
    }
  };

  // ---- 1. cold load
  const t0 = Date.now();
  await page.goto(target.url, { waitUntil: "domcontentloaded" });
  if (target.kind === "new") {
    await page.waitForSelector(".poster-copy h1, .lite h1", { timeout: 60000 });
    res.firstUsableMs = Date.now() - t0; // headline, services menu and contact are usable from here
    res.firstUsableKB = Math.round(bytes / 1024);
    await page.waitForSelector('.stage[data-ready="true"]', { timeout: 120000 });
  } else {
    // the old loader is removed from the DOM once fonts, models and shaders are ready
    await page.waitForSelector(".arrival-loader", { timeout: 30000 });
    await page.waitForFunction(() => !document.querySelector(".arrival-loader") && !!document.querySelector("canvas"), { timeout: 240000, polling: 100 });
  }
  res.ready3dMs = Date.now() - t0;
  res.ready3dKB = Math.round(bytes / 1024);
  res.ready3dRequests = requests;
  await sleep(1500);
  res.gpu = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const e = gl && gl.getExtension("WEBGL_debug_renderer_info");
    return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : "unknown";
  });
  const canvas = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    return c ? [c.width, c.height] : null;
  });
  res.canvas = canvas;
  await shot("1-arrival");
  await frames();

  // ---- 2. scroll through the arrival
  await scroll(prof.touch ? 5200 : 6400, 13);
  await sleep(1200);
  res.scrollArrival = stats(await frames());
  await shot("2-arrival-scrolled");

  // ---- 3. floor change: reception -> Electrical
  const tLift = Date.now();
  if (target.kind === "new") {
    await page.evaluate(() => document.querySelector(".lift-call")?.click());
    await page.waitForSelector(".lift-buttons button", { timeout: 10000 });
    await frames();
    await page.evaluate(() => [...document.querySelectorAll(".lift-buttons button")].find((b) => /Electrical/.test(b.innerText))?.click());
    await page.waitForSelector('.stage[data-scene="electrical"][data-lift="opening"], .stage[data-scene="electrical"][data-lift="idle"]', { timeout: 120000 });
    res.liftCoveredMs = Date.now() - tLift;
    await page.waitForSelector('.stage[data-scene="electrical"][data-lift="idle"]', { timeout: 20000 });
  } else {
    await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /Choose floor/.test(b.innerText) && b.offsetParent)?.click());
    await sleep(900);
    await frames();
    await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.innerText.replace(/\s+/g, " ").includes("Electrical") && b.offsetParent)?.click());
    await page.waitForFunction(() => /02/.test(document.querySelector(".floor-indicator")?.innerText || ""), { timeout: 120000, polling: 50 });
    res.liftCoveredMs = Date.now() - tLift;
  }
  res.liftTotalMs = Date.now() - tLift;
  await sleep(3000);
  res.afterLift = stats(await frames()); // the ride itself plus the first three seconds on the new floor
  await shot("3-floor-arrived");

  // ---- 4. scroll on the floor
  await scroll(prof.touch ? 4200 : 5200, 10);
  await sleep(1000);
  res.scrollFloor = stats(await frames());
  await shot("4-floor-scrolled");
  res.totalKB = Math.round(bytes / 1024);
  res.errors = errors;
  await browser.close();
  return res;
}

const results = [];
for (const [name, target] of Object.entries(TARGETS)) {
  if (only && only !== name) continue;
  for (const [pn, prof] of Object.entries(PROFILES)) {
    if (onlyProfile && onlyProfile !== pn) continue;
    process.stdout.write(`measuring ${name} / ${pn} ... `);
    try {
      const r = await run(name, target, pn, prof);
      results.push(r);
      console.log("ok");
    } catch (e) {
      console.log("FAILED", String(e).slice(0, 300));
      results.push({ name, profile: pn, error: String(e).slice(0, 300) });
      for (const b of open) await b.close().catch(() => {});
    }
  }
}
const file = path.join(out, `measure${only ? "-" + only : ""}${onlyProfile ? "-" + onlyProfile : ""}.json`);
fs.writeFileSync(file, JSON.stringify(results, null, 1));
for (const r of results) console.log(JSON.stringify(r));
process.exit(0);
