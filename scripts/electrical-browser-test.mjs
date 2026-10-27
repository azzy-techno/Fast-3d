import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { openBrowser } from "@remotion/renderer";
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4177",
    "--strictPort",
  ],
  { stdio: "pipe", env: { ...process.env, BASE_PATH: "/Fast-3d/" } },
);
let browser;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch("http://127.0.0.1:4177/Fast-3d/")).ok) break;
    } catch {}
    await delay(100);
  }
  browser = await openBrowser("chrome", {
    browserExecutable: "/usr/bin/chromium",
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
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page._client().send("Page.addScriptToEvaluateOnNewDocument", {
    source:
      'window.__errors=[];addEventListener("error",e=>window.__errors.push(e.message));addEventListener("unhandledrejection",e=>window.__errors.push(String(e.reason)));',
  });
  await page.goto({ url: "http://127.0.0.1:4177/Fast-3d/", timeout: 120000 });
  async function wait(fn, label) {
    for (let i = 0; i < 300; i++) {
      if (await page.evaluate(fn)) return;
      await delay(200);
    }
    throw Error(`Timeout: ${label}`);
  }
  await wait(
    () =>
      !!document.querySelector("canvas[data-ready]") &&
      !document.querySelector(".loader"),
    "ready",
  );
  assert(
    await page.evaluate(
      () => document.getElementById("electrical").offsetHeight >= 18000,
    ),
    "Electrical has enough scroll length for 16 guided stops",
  );
  const initialStop = process.env.ELECTRICAL_MOBILE_ONLY ? 16 : 1;
  await page.evaluate((initialStop) => {
    const a = document.getElementById("electrical").offsetTop,
      b = document.getElementById("mechanical").offsetTop;
    scrollTo(0, a + (b - a) * (0.051 + (initialStop - 1) * 0.044));
  }, initialStop);
  const axeSource = await fs.readFile(
    "node_modules/axe-core/axe.min.js",
    "utf8",
  );
  await page.evaluate((s) => (0, eval)(s), axeSource);
  await fs.mkdir("artifacts/electrical-tour", { recursive: true });
  async function screenshot(name) {
    const r = await page
      ._client()
      .send("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(
      `artifacts/electrical-tour/${name}.png`,
      Buffer.from(r.value.data, "base64"),
    );
  }
  for (let stop = initialStop; stop <= 16; stop++) {
    await page.evaluate((n) => (window.__expectedStop = n), stop);
    await wait(() => {
      const d = document.querySelector("canvas").dataset;
      return (
        Number(d.electricalStation) === window.__expectedStop &&
        d.guide === "presenting" &&
        Number(d.guideAim) > 0.98
      );
    }, `station ${stop}`);
    assert.equal(
      await page.evaluate(
        () =>
          document.querySelector(".electrical-tour [aria-current]").textContent,
      ),
      String(stop).padStart(2, "0"),
    );
    assert(
      Number(
        await page.evaluate(
          () => document.querySelector("canvas").dataset.guideCameraDistance,
        ),
      ) > 3.5,
    );
    if ([1, 4, 11, 14, 16].includes(stop)) await screenshot(`stop-${stop}`);
    console.log(`PASS stop ${stop}: guide presents beside equipment`);
    if (stop < 16)
      await page.evaluate(() =>
        document
          .querySelector(".electrical-tour-actions button:last-child")
          .click(),
      );
  }
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await delay(1000);
  // Reposition after the viewport change: the chapter's svh-based length and
  // the height of the preceding roof/workplace chapter have both changed.
  await page.evaluate(() => {
    const a = document.getElementById("electrical").offsetTop;
    const b = document.getElementById("mechanical").offsetTop;
    scrollTo(0, a + (b - a) * 0.711);
  });
  await wait(() => {
    const d = document.querySelector("canvas").dataset;
    return +d.electricalStation === 16 && d.guide === "presenting";
  }, "phone station 16");
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  const bounds = await page.evaluate(() => {
    const a = document
        .querySelector(".electrical-tour")
        .getBoundingClientRect(),
      b = document.querySelector(".tour-controls").getBoundingClientRect();
    return { top: a.top, bottom: a.bottom, footer: b.top };
  });
  assert(bounds.top > 135 && bounds.bottom <= bounds.footer);
  await screenshot("phone-stop-16");
  const violations = await page.evaluate(async () =>
    (
      await window.axe.run(".electrical-tour", {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      })
    ).violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  );
  assert.deepEqual(violations, []);
  await page.evaluate(() =>
    document
      .querySelector(".electrical-tour-actions button:first-child")
      .click(),
  );
  await page.evaluate(() => (window.__expectedStop = 15));
  await wait(() => {
    const d = document.querySelector("canvas").dataset;
    return +d.electricalStation === 15 && d.guide === "presenting";
  }, "reverse to station 15");
  await page.evaluate(() =>
    document.querySelector(".electrical-tour nav button:last-child").click(),
  );
  await wait(() => {
    const d = document.querySelector("canvas").dataset;
    return +d.electricalStation === 16 && d.guide === "presenting";
  }, "return to station16");
  await page.evaluate(() =>
    document
      .querySelector(".electrical-tour-actions button:last-child")
      .click(),
  );
  await wait(
    () => +document.querySelector("canvas").dataset.journey > 2.84,
    "leave gallery",
  );
  assert.deepEqual(await page.evaluate(() => window.__errors), []);
  console.log(
    `PASS: presentations ${initialStop}–16, Next/Previous/direct selection, long chapter, phone layout, WCAG A/AA and return to lift.`,
  );
} finally {
  if (browser) await browser.close({ silent: true });
  server.kill("SIGTERM");
}
