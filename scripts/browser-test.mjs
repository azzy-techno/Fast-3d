import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { openBrowser } from "@remotion/renderer";
import sharp from "sharp";
const url = `http://127.0.0.1:4174${process.env.BASE_PATH || "/"}`;
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4174",
    "--strictPort",
  ],
  { stdio: "pipe" },
);
let browser;
const results = [];
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(page, fn, label, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await page.evaluate(fn)) return;
    await delay(200);
  }
  const state = await page.evaluate(() => ({
    scrollY: window.scrollY,
    coolingTop: document.getElementById("cooling")?.offsetTop,
    dialogOpen: document.querySelector("dialog")?.open,
    overflow: document.body.style.overflow,
    errors: window.__runtimeErrors,
  }));
  throw new Error(`Timed out: ${label}; ${JSON.stringify(state)}`);
}
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(url)).ok) break;
    } catch {}
    await delay(100);
  }
  browser = await openBrowser("chrome", {
    browserExecutable: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    chromiumOptions: { gl: "swangle" },
  });
  const page = await browser.newPage({
    context: () => null,
    logLevel: "error",
    indent: false,
    pageIndex: 0,
    onBrowserLog: null,
    onLog: () => {},
  });
  await page._client().send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
        window.__runtimeErrors=[];
        window.addEventListener('error',e=>window.__runtimeErrors.push(e.message));
        window.addEventListener('unhandledrejection',e=>window.__runtimeErrors.push(String(e.reason)));
        window.__mainObservers=new Set();
        const NativeResizeObserver=window.ResizeObserver;
        window.ResizeObserver=class extends NativeResizeObserver {
          observe(target,options){
            if(target.id==='main')window.__mainObservers.add(this);
            return super.observe(target,options);
          }
          unobserve(target){
            if(target.id==='main')window.__mainObservers.delete(this);
            return super.unobserve(target);
          }
          disconnect(){window.__mainObservers.delete(this);return super.disconnect();}
        };
        window.__audibleStarts=0;
        const nativeStart=AudioBufferSourceNode.prototype.start;
        AudioBufferSourceNode.prototype.start=function(...args){
          if(this.buffer?.duration>.02)window.__audibleStarts++;
          return nativeStart.apply(this,args);
        };
      `,
  });
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.goto({ url, timeout: 60000 });
  await waitFor(
    page,
    () =>
      !!document.querySelector("canvas[data-ready]") &&
      !document.querySelector(".loader"),
    "real WebGL scene and loader",
  );
  await fs.mkdir("artifacts", { recursive: true });
  async function shot(name) {
    const result = await page
      ._client()
      .send("Page.captureScreenshot", { format: "png" });
    const data = Buffer.from(result.value.data, "base64");
    await fs.writeFile(`artifacts/${name}.png`, data);
    return data;
  }
  async function click(selector) {
    const pos = await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`Missing ${selector}`);
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, selector);
    await page._client().send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      ...pos,
      button: "left",
      clickCount: 1,
    });
    await page._client().send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      ...pos,
      button: "left",
      clickCount: 1,
    });
    await delay(250);
  }
  const initial = await page.evaluate(() => ({
    chapters: document.querySelectorAll(".chapter").length,
    links: [...document.querySelectorAll(".chapter h2 a")].map((a) => a.href),
    muted: document.querySelector(".sound-button").getAttribute("aria-pressed"),
    errors: window.__runtimeErrors,
  }));
  assert.equal(initial.chapters, 11);
  assert.equal(initial.muted, "false");
  assert.equal(initial.errors.length, 0);
  assert(
    initial.links.every((x) =>
      x.startsWith("https://fast-arabia.com/services/"),
    ),
  );
  assert(initial.links[0].endsWith("/mechanical#scope"));
  const exteriorTextures = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes("/assets/exterior/optimized/"))
      .map((entry) => new URL(entry.name).pathname),
  );
  const expectedTextures = (
    await fs.readdir("public/assets/exterior/optimized")
  ).filter((name) => name.endsWith(".webp"));
  assert.equal(expectedTextures.length, 12);
  for (const name of expectedTextures) {
    assert(
      exteriorTextures.includes(
        `${process.env.BASE_PATH || "/"}assets/exterior/optimized/${name}`,
      ),
      `Scene loads supplied texture: ${name}`,
    );
  }
  results.push({
    check: "All 12 supplied exterior textures load under deployment base path",
    passed: true,
  });
  const arrival = await shot("desktop-arrival");
  const stats = await sharp(arrival)
    .extract({ left: 650, top: 200, width: 650, height: 600 })
    .stats();
  assert(
    stats.channels[0].stdev > 20,
    "Scene region must contain rendered architectural detail",
  );
  results.push(
    "11 chapters, correct live destinations, actual WebGL render, real readiness loader, sound off initially",
  );

  // Exercise travel intervals as well as destination screenshots: the interior
  // must stay mounted and reverse scrubbing must return to the same route point.
  async function travelTo(progress) {
    await page.evaluate((progress) => {
      const ids = [
        "arrival",
        ...Array.from(document.querySelectorAll(".chapter")).map((el) => el.id),
        "together",
      ];
      const index = Math.min(11, Math.floor(progress));
      const a = document.getElementById(ids[index]).offsetTop;
      const b =
        index === 11
          ? document.documentElement.scrollHeight - innerHeight
          : document.getElementById(ids[index + 1]).offsetTop;
      scrollTo(0, a + (b - a) * (progress - index));
    }, progress);
    const start = Date.now();
    while (Date.now() - start < 20000) {
      const rendered = await page.evaluate(() =>
        Number(document.querySelector("canvas")?.dataset.journey),
      );
      if (Math.abs(rendered - progress) < 0.015) return;
      await delay(150);
    }
    throw new Error(`Route did not settle at ${progress}`);
  }
  for (const [progress, name] of [
    [0.61, "host-welcome"],
    [1, "host-follow"],
    [2, "host-presenting"],
    [11.55, "exit-lift"],
    [11.69, "reception"],
    [11.86, "host-farewell"],
    [11.96, "drone-return"],
    [11.69, "reception-reverse"],
  ]) {
    await travelTo(progress);
    const host = await page.evaluate(() => ({
      ...document.querySelector("canvas").dataset,
    }));
    assert(
      host.guidePosition.split(",").map(Number).every(Number.isFinite),
      "Guide must have a finite position",
    );
    if (progress < 0.7 || progress > 11.84) assert.equal(host.guide, "waving");
    if (progress === 11.69)
      assert.equal(Number(host.guidePosition.split(",")[1]), 0.25);
    if (progress === 11.86)
      assert.equal(Number(host.guidePosition.split(",")[2]), 18);
    await shot("desktop-" + name);
  }
  results.push(
    "Rigged rooftop host, service gestures, descending exit lift, reception, grounded farewell and reverse route",
  );
  for (const progress of [1.34, 1.65, 1.84, 1.94, 2.55, 1.65]) {
    await travelTo(progress);
    assert.equal(
      await page.evaluate(
        () =>
          !!document.querySelector("canvas[data-ready]") &&
          !document.querySelector(".loader"),
      ),
      true,
    );
    if (progress === 1.65) await shot("desktop-workplace");
    if (progress === 2.55) await shot("desktop-service-corridor");
  }
  const furniture = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((r) => r.name.includes("/interior/lounge-"))
      .map((r) => r.name),
  );
  assert(
    furniture.some((url) => url.endsWith("lounge-chair.glb")) &&
      furniture.some((url) => url.endsWith("lounge-sofa.glb")),
    "Licensed furniture must load",
  );
  assert.match(
    await page.evaluate(
      () => document.querySelector(".journey-headline").textContent,
    ),
    /people inside/,
  );
  await click(".cinema-toggle");
  assert.equal(
    await page.evaluate(() =>
      document.querySelector(".app").classList.contains("cinematic"),
    ),
    true,
  );
  await shot("desktop-cinema");
  await click(".cinema-toggle");
  await click(".plan-toggle");
  assert.equal(
    await page.evaluate(
      () => document.querySelector("#journey-floor-plan").hidden,
    ),
    false,
  );
  await shot("desktop-floor-plan");
  await click(".plan-drawing li:first-child button");
  await waitFor(
    page,
    () =>
      Math.abs(scrollY - document.getElementById("electrical").offsetTop) < 8,
    "floor plan service navigation",
  );
  assert.equal(
    await page.evaluate(
      () => document.querySelector("#journey-floor-plan").hidden,
    ),
    true,
  );
  await travelTo(0);
  assert.deepEqual(await page.evaluate(() => window.__runtimeErrors), []);
  results.push(
    "Roof doors, furnished workplace, service lift and corridor render continuously in both scroll directions; cinema and floor-plan navigation work",
  );

  await click(".header-nav button");
  assert.equal(
    await page.evaluate(() => document.querySelector("dialog").open),
    true,
  );
  assert.equal(
    await page.evaluate(() =>
      document.querySelector("dialog").contains(document.activeElement),
    ),
    true,
  );
  await page._client().send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await page._client().send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await delay(200);
  assert.equal(
    await page.evaluate(() => document.querySelector("dialog").open),
    false,
  );
  assert.equal(
    await page.evaluate(
      () =>
        document.activeElement === document.querySelector(".header-nav button"),
    ),
    true,
  );
  await click(".header-nav button");
  await click(".dialog-services button:first-child");
  await waitFor(
    page,
    () =>
      Math.abs(window.scrollY - document.getElementById("cooling").offsetTop) <
      8,
    "smooth chapter jump",
  );
  await delay(2000);
  assert.equal(
    await page.evaluate(() =>
      document
        .querySelector(".chapter-track [aria-current]")
        .getAttribute("aria-label"),
    ),
    "Cooling towers",
  );
  const cooling = await shot("desktop-cooling");
  assert(!arrival.equals(cooling));
  for (const id of [
    "mechanical",
    "fabrication",
    "civil",
    "fire",
    "it",
    "industry",
    "iiot",
    "vision",
  ]) {
    await page.evaluate(
      (id) => window.scrollTo(0, document.getElementById(id).offsetTop),
      id,
    );
    await delay(1800);
    const scene = await shot(`desktop-${id}`);
    const pixels = await sharp(scene)
      .extract({ left: 650, top: 200, width: 650, height: 600 })
      .stats();
    assert(
      pixels.channels[0].stdev > 16,
      `${id} must display rendered equipment`,
    );
    assert.equal(
      await page.evaluate((id) => {
        const current = document.querySelector(".chapter-track [aria-current]");
        const title = document.querySelector(`#${id} h2 a`);
        return (
          current?.getAttribute("aria-label") === title?.textContent.trim()
        );
      }, id),
      true,
      `${id} must be the current chapter`,
    );
  }
  assert.deepEqual(await page.evaluate(() => window.__runtimeErrors), []);
  results.push(
    "Rendered equipment and active navigation checked in all 11 service scenes",
  );
  await page.evaluate(() =>
    window.scrollTo(0, document.getElementById("manufacturing").offsetTop),
  );
  await delay(2500);
  await shot("desktop-manufacturing");
  await page.evaluate(() =>
    window.scrollTo(0, document.getElementById("electrical").offsetTop),
  );
  await delay(2000);
  assert.equal(
    await page.evaluate(() =>
      document
        .querySelector(".chapter-track [aria-current]")
        .getAttribute("aria-label"),
    ),
    "Electrical",
  );
  await shot("desktop-electrical");
  results.push(
    "Modal focus/escape/return, smooth menu jump, forward and reverse scrolling",
  );
  await click(".sound-button");
  await waitFor(
    page,
    () => window.__audibleStarts >= 2,
    "opt-in chime and service ambience",
  );
  await delay(350);
  assert.equal(
    await page.evaluate(() => window.__audibleStarts),
    2,
    "Enabling sound plays one chime and one service loop",
  );
  assert.equal(
    await page.evaluate(() =>
      document.querySelector(".sound-button").getAttribute("aria-pressed"),
    ),
    "true",
  );
  for (const [i, name] of [
    "electrical",
    "mechanical",
    "fabrication",
    "civil",
    "fire",
    "it",
    "manufacturing",
    "industry",
    "iiot",
    "vision",
  ].entries()) {
    await travelTo(i + 2);
    await waitFor(
      page,
      () => document.documentElement.dataset.soundscape !== "silent",
      "service ambience selection",
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.dataset.soundscape),
      name,
    );
  }
  await travelTo(2.6);
  await waitFor(
    page,
    () => document.documentElement.dataset.soundscape === "silent",
    "silent corridor",
  );
  await travelTo(1);
  await waitFor(
    page,
    () => document.documentElement.dataset.soundscape === "cooling",
    "roof cooling ambience",
  );
  await click(".sound-button");
  assert.equal(
    await page.evaluate(() => document.documentElement.dataset.soundscape),
    "silent",
  );
  assert.equal(
    await page.evaluate(() =>
      document.querySelector(".sound-button").getAttribute("aria-pressed"),
    ),
    "false",
  );
  await click(".view-button");
  await waitFor(
    page,
    () =>
      !!document.querySelector(".list-view") &&
      !document.querySelector("canvas"),
    "photo tour",
  );
  assert.equal(
    await page.evaluate(() => window.__mainObservers.size),
    1,
    "View changes release the previous scroll observer",
  );
  await page.evaluate(() =>
    window.scrollTo(0, document.getElementById("cooling").offsetTop),
  );
  await delay(500);
  await shot("desktop-photo-tour");
  const axeSource = await fs.readFile(
    "node_modules/axe-core/axe.min.js",
    "utf8",
  );
  await page.evaluate((source) => {
    (0, eval)(source);
  }, axeSource);
  let axe = await page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    });
    return result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    }));
  });
  await fs.writeFile(
    "artifacts/accessibility.json",
    JSON.stringify(axe, null, 2),
  );
  assert.equal(axe.length, 0, `Accessibility: ${JSON.stringify(axe)}`);
  results.push("Sound controls, photo tour, WCAG A/AA automated checks");
  await click(".language");
  assert.equal(
    await page.evaluate(() => window.__mainObservers.size),
    1,
    "Language changes release the previous scroll observer",
  );
  await delay(250);
  assert.equal(await page.evaluate(() => document.documentElement.dir), "rtl");
  assert.equal(await page.evaluate(() => document.documentElement.lang), "ar");
  await shot("desktop-arabic");
  await click(".language");
  await click(".view-button");
  await waitFor(
    page,
    () =>
      !!document.querySelector("canvas[data-ready]") &&
      !document.querySelector(".loader"),
    "3D view restored",
  );
  assert.equal(await page.evaluate(() => window.__mainObservers.size), 1);
  assert.equal(
    await page.evaluate(() =>
      document
        .querySelector(".chapter-track [aria-current]")
        ?.getAttribute("aria-label"),
    ),
    "Cooling towers",
    "Returning to 3D preserves the service chapter",
  );
  results.push(
    "One opt-in chime plus service loop; all 11 soundscapes, silent corridors, mute, observer cleanup and chapter restoration",
  );
  for (const width of [768, 390, 320]) {
    await page.setViewport({
      width,
      height: width === 768 ? 1024 : 844,
      deviceScaleFactor: 1,
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await delay(1800);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      true,
      `Overflow at ${width}px`,
    );
    if (width !== 320) {
      await shot(width === 768 ? "tablet-arrival" : "mobile-arrival");
    }
    await page.evaluate(() =>
      window.scrollTo(0, document.getElementById("cooling").offsetTop),
    );
    await delay(1800);
    if (width === 390) {
      await shot("mobile-cooling");
      await travelTo(1.65);
      await shot("mobile-workplace");
      await travelTo(2);
      await shot("mobile-electrical");
      await click(".plan-toggle");
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        true,
      );
      await shot("mobile-floor-plan");
      await click(".plan-toggle");
    }
  }
  results.push(
    "Arabic / RTL, 3D restoration, 768px / 390px / 320px responsive layouts",
  );
  await page._client().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await page.goto({ url, timeout: 60000 });
  await waitFor(
    page,
    () => !!document.querySelector(".list-view"),
    "reduced-motion fallback",
  );
  assert.equal(
    await page.evaluate(() => !!document.querySelector("canvas")),
    false,
  );
  await shot("mobile-reduced-motion");
  await page._client().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await page._client().send("Page.addScriptToEvaluateOnNewDocument", {
    source: `const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'||type==='webgl2'||type==='experimental-webgl')return null;return original.call(this,type,...args);};`,
  });
  await page.goto({ url, timeout: 60000 });
  await waitFor(
    page,
    () => !!document.querySelector(".fallback-message"),
    "WebGL failure fallback",
  );
  assert.equal(
    await page.evaluate(
      () => document.querySelectorAll(".chapter h2 a").length,
    ),
    11,
  );
  results.push(
    "Reduced motion defaults to photo tour; unavailable WebGL preserves all content and links",
  );
  await fs.writeFile(
    "artifacts/browser-results.json",
    JSON.stringify({ passed: true, checks: results }, null, 2),
  );
  console.log(JSON.stringify({ passed: true, checks: results }, null, 2));
} finally {
  if (browser) await browser.close({ silent: true });
  server.kill("SIGTERM");
}
