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
    "4180",
    "--strictPort",
  ],
  { stdio: "pipe", env: { ...process.env, BASE_PATH: "/Fast-3d/" } },
);
let browser;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch("http://127.0.0.1:4180/Fast-3d/")).ok) break;
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
  async function wait(fn, label) {
    for (let i = 0; i < 500; i++) {
      if (await page.evaluate(fn)) return;
      await delay(200);
    }
    throw Error("Timeout " + label);
  }
  async function click(s) {
    await page.evaluate((s) => {
      const e = document.querySelector(s);
      e.focus();
      e.click();
    }, s);
  }
  async function shot(name) {
    const r = await page
      ._client()
      .send("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(
      "artifacts/about-hall/" + name + ".png",
      Buffer.from(r.value.data, "base64"),
    );
  }
  async function choose(n) {
    await page.evaluate((n) => {
      const s = document.querySelector(".about-stop-select select");
      s.value = String(n);
      s.dispatchEvent(new Event("change", { bubbles: true }));
    }, n);
  }
  await fs.mkdir("artifacts/about-hall", { recursive: true });
  await page.goto({ url: "http://127.0.0.1:4180/Fast-3d/", timeout: 120000 });
  await wait(
    () =>
      !!document.querySelector("canvas[data-ready]") &&
      !document.querySelector(".loader"),
    "scene ready",
  );
  await click(".lift-toggle");
  await wait(() => document.querySelector(".lift-dialog").open, "lift");
  await click('[data-destination="about"]');
  await wait(
    () =>
      !document.querySelector(".lift-dialog").open &&
      !!document.querySelector(".about-welcome"),
    "about intro",
  );
  await shot("entrance");
  await click(".about-continue");
  const first = Number(process.env.ABOUT_HALL_START || 1);
  if (first > 1) {
    await wait(
      () => !!document.querySelector(".about-stop-select select"),
      "tour",
    );
    await choose(first);
  }
  for (let n = first; n <= 33; n++) {
    await page.evaluate((n) => (window.__stop = n), n);
    await wait(() => {
      const d = document.querySelector("canvas").dataset;
      return (
        +d.aboutStation === window.__stop &&
        d.guide === "presenting" &&
        +d.guideAim > 0.98
      );
    }, "presentation " + n);
    const d = await page.evaluate(() => ({
      ...document.querySelector("canvas").dataset,
    }));
    assert(+d.guideCameraDistance > 4);
    assert.equal(
      await page.evaluate(
        () => +document.querySelector(".about-stop-select select").value,
      ),
      n,
    );
    if ([1, 5, 6, 20, 21, 33].includes(n)) await shot("stop-" + n);
    if (n === first) {
      const hands = [];
      for (let j = 0; j < 25; j++) {
        const h = await page.evaluate(
          () => document.querySelector("canvas").dataset.guidePresentationHand,
        );
        if (h) hands.push(h.split(",").map(Number));
        await delay(140);
      }
      assert(hands.length > 5);
      const change = Math.max(
        ...hands.map((p) => Math.hypot(...p.map((v, k) => v - hands[0][k]))),
      );
      assert(change > 0.03, "Supporting hand presents");
      console.log("PASS live gesture", change);
    }
    console.log(
      `PASS stop ${n}: stationary presentation, pointing and camera clearance`,
    );
    if (n < 33) await click(".about-tour-actions button:last-child");
  }
  const axe = await fs.readFile("node_modules/axe-core/axe.min.js", "utf8");
  await page.evaluate((s) => (0, eval)(s), axe);
  async function a11y() {
    assert.deepEqual(
      await page.evaluate(async () =>
        (
          await window.axe.run(".about-guided-tour", {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
          })
        ).violations.map((v) => v.id),
      ),
      [],
    );
  }
  await a11y();
  await click(".about-display-detail");
  await wait(
    () => document.querySelector(".about-projection").open,
    "partner projection",
  );
  assert(
    (
      await page.evaluate(
        () => document.querySelector(".partner-detail").textContent,
      )
    ).includes("PCT Group"),
  );
  await click(".projection-close");
  await click(".about-tour-actions button:first-child");
  await wait(
    () =>
      +document.querySelector("canvas").dataset.aboutStation === 32 &&
      document.querySelector("canvas").dataset.guide === "presenting",
    "reverse stop",
  );
  await choose(1);
  await wait(
    () =>
      +document.querySelector("canvas").dataset.aboutStation === 1 &&
      document.querySelector("canvas").dataset.guide === "presenting",
    "direct first",
  );
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await delay(500);
  await choose(33);
  await wait(
    () =>
      +document.querySelector("canvas").dataset.aboutStation === 33 &&
      document.querySelector("canvas").dataset.guide === "presenting",
    "phone last",
  );
  await a11y();
  await shot("phone-stop-33");
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  const bounds = await page.evaluate(() => {
    const a = document
        .querySelector(".about-guided-tour")
        .getBoundingClientRect(),
      b = document.querySelector(".tour-controls").getBoundingClientRect();
    return { top: a.top, bottom: a.bottom, footer: b.top };
  });
  assert(bounds.top > 130 && bounds.bottom <= bounds.footer);
  await click(".language");
  await a11y();
  assert(await page.evaluate(() => document.documentElement.dir === "rtl"));
  await shot("phone-arabic");
  await click(".about-tour-actions button:last-child");
  await wait(
    () => +document.querySelector("canvas").dataset.journey >= 1.74,
    "exit hall",
  );
  await click(".lift-toggle");
  await wait(() => document.querySelector(".lift-dialog").open, "exit lift");
  await click('[data-destination="electrical"]');
  await wait(
    () =>
      !document.querySelector(".lift-dialog").open &&
      Math.abs(+document.querySelector("canvas").dataset.journey - 2) < 0.003,
    "electrical landing",
  );
  assert(
    await page.evaluate(() => !!document.querySelector(".electrical-welcome")),
  );
  assert.deepEqual(await page.evaluate(() => window.__errors), []);
  console.log(
    `PASS: stops ${first}–33, gestures, projections, reverse/direct navigation, phone, Arabic, WCAG and electrical lift destination`,
  );
} finally {
  if (browser) await browser.close({ silent: true });
  server.kill("SIGTERM");
}
