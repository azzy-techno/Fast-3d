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
    "4183",
    "--strictPort",
  ],
  { stdio: "pipe", env: { ...process.env, BASE_PATH: "/Fast-3d/" } },
);
let browser;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch("http://127.0.0.1:4183/Fast-3d/")).ok) break;
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
    source: `window.__errors=[];window.__draws=0;addEventListener('error',e=>window.__errors.push(e.message));addEventListener('unhandledrejection',e=>window.__errors.push(String(e.reason)));for(const C of [WebGLRenderingContext,WebGL2RenderingContext])for(const k of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){const f=C.prototype[k];if(f)C.prototype[k]=function(...args){window.__draws++;return f.apply(this,args)}}`,
  });
  async function wait(fn, label) {
    for (let i = 0; i < 1800; i++) {
      if (await page.evaluate(fn)) return;
      await delay(200);
    }
    throw Error(
      "Timeout " +
        label +
        " " +
        JSON.stringify(
          await page.evaluate(() => ({
            errors: window.__errors,
            canvas: document.querySelector("canvas")?.dataset,
          })),
        ),
    );
  }
  async function click(s) {
    await page.evaluate((s) => {
      const e = document.querySelector(s);
      if (!e) throw Error("Missing " + s);
      e.focus();
      e.click();
    }, s);
  }
  async function key(key) {
    await page._client().send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key,
      code: key,
      windowsVirtualKeyCode:
        key === "Escape" ? 27 : key === "ArrowRight" ? 39 : 0,
    });
    await page
      ._client()
      .send("Input.dispatchKeyEvent", { type: "keyUp", key, code: key });
  }
  async function shot(name) {
    const r = await page
      ._client()
      .send("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(
      "artifacts/observatory/" + name + ".png",
      Buffer.from(r.value.data, "base64"),
    );
  }
  const performanceResults = [];
  async function measure(name) {
    if (!process.env.PROFILE_RENDERING) return;
    const result = await page.evaluate(async (name) => {
      const frames = [];
      let previous = window.__draws,
        last = performance.now();
      await new Promise((resolve) => {
        function tick(t) {
          const now = window.__draws;
          frames.push({ ms: t - last, draws: now - previous });
          last = t;
          previous = now;
          if (frames.length < 25) requestAnimationFrame(tick);
          else resolve();
        }
        requestAnimationFrame(tick);
      });
      const values = frames.slice(-20),
        timings = values.map((f) => f.ms).sort((a, b) => a - b);
      return {
        name,
        drawCalls: Math.round(values.reduce((n, f) => n + f.draws, 0) / 20),
        medianMs: timings[10],
        p95Ms: timings[18],
        journey: document.querySelector("canvas").dataset.journey,
      };
    }, name);
    performanceResults.push(result);
    console.log("RENDER", JSON.stringify(result));
  }
  await fs.mkdir("artifacts/observatory", { recursive: true });
  await page.goto({ url: "http://127.0.0.1:4183/Fast-3d/", timeout: 120000 });
  await wait(() => !!document.querySelector(".arrival-loader"), "loader");
  await shot("loader");
  await wait(
    () =>
      !!document.querySelector("canvas[data-ready]") &&
      !document.querySelector(".loader"),
    "scene ready",
  );
  console.log("PASS new loader and scene ready");
  await click(".lift-toggle");
  await wait(() => document.querySelector(".lift-dialog").open, "lift");
  await click('[data-destination="about"]');
  await wait(
    () =>
      !document.querySelector(".lift-dialog").open &&
      !!document.querySelector(".about-welcome"),
    "hall",
  );
  await shot("hall");
  await measure("about");
  // Ordinary scroll reaches the optical approach; no entry click is required.
  await page.evaluate(() => {
    window.__lensPeak = 0;
    window.__lensTimer = setInterval(() => {
      window.__lensPeak = Math.max(
        window.__lensPeak,
        +document.getElementById("optical-transition").style.opacity,
      );
    }, 50);
    const a = document.getElementById("about-hall").offsetTop;
    const b = document.getElementById("about-departure").offsetTop;
    window.scrollTo({
      top: a + (b - a) * ((1.595 - 1.53) / 0.21),
      behavior: "instant",
    });
  });
  await wait(
    () => document.querySelector(".observatory").open,
    "first-person transition",
  );
  await delay(1500);
  const lensPeak = await page.evaluate(() => {
    clearInterval(window.__lensTimer);
    return window.__lensPeak;
  });
  assert(lensPeak > 0.4, "A visible optical transition bridges the approach");
  console.log("PASS automatic entry and lens transition", lensPeak);
  await shot("welcome");
  assert.deepEqual(
    await page.evaluate(() => ({
      background: getComputedStyle(document.querySelector(".observatory"))
        .backgroundColor,
      backdrop: getComputedStyle(
        document.querySelector(".observatory"),
        "::backdrop",
      ).backgroundColor,
      scene: getComputedStyle(document.querySelector(".scene")).visibility,
      chrome: getComputedStyle(document.querySelector(".header")).visibility,
    })),
    {
      background: "rgba(0, 0, 0, 0)",
      backdrop: "rgba(0, 0, 0, 0)",
      scene: "visible",
      chrome: "hidden",
    },
  );
  const draws = await page.evaluate(() => window.__draws);
  await delay(1500);
  assert.equal(
    await page.evaluate(() => window.__draws),
    draws,
    "The real hall stops drawing while the AR view is idle",
  );
  const axe = await fs.readFile("node_modules/axe-core/axe.min.js", "utf8");
  await page.evaluate((s) => (0, eval)(s), axe);
  async function access() {
    const violations = await page.evaluate(async () =>
      (
        await window.axe.run(".observatory", {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        })
      ).violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    );
    assert.deepEqual(violations, []);
  }
  await access();
  for (const [index, count] of [
    [2, 5],
    [3, 15],
    [4, 13],
  ]) {
    await click(".observatory-nav button:nth-child(" + index + ")");
    await wait(
      () =>
        [...document.querySelectorAll(".observatory-card img")].every(
          (i) => i.complete && i.naturalWidth > 0,
        ),
      "logos",
    );
    assert.equal(
      await page.evaluate(
        () => document.querySelectorAll(".observatory-card").length,
      ),
      count,
    );
    await access();
    if (index === 2) {
      await page.evaluate(() =>
        document.querySelector(".observatory-viewport").focus(),
      );
      await key("ArrowRight");
      await wait(
        () =>
          +document.querySelector("canvas").dataset.opticalPose.split(",")[0] >
          0.05,
        "live hall turns with keyboard",
      );
      const transform = await page.evaluate(
        () => document.querySelector(".observatory-world").style.transform,
      );
      assert(!transform.includes("translate3d(0px, 0px, 0px)"));
      await shot("certifications");
      await click(".observatory-card");
      await wait(
        () => !!document.querySelector(".observatory-detail"),
        "detail",
      );
      assert(
        (
          await page.evaluate(
            () => document.querySelector(".observatory-detail a").href,
          )
        ).includes("iso-9001.pdf"),
      );
      await access();
      await key("Escape");
    }
    if (index === 3) {
      await click(".observatory-card");
      assert(
        (
          await page.evaluate(
            () => document.querySelector(".observatory-detail").textContent,
          )
        ).includes("10112399"),
      );
      await shot("approval-detail");
      await click(".observatory-detail-close");
    }
    if (index === 4) {
      await shot("partners");
      await click(".observatory-card:last-child");
      assert(
        (
          await page.evaluate(
            () => document.querySelector(".observatory-detail h3").textContent,
          )
        ).includes("PCT"),
      );
      await click(".observatory-detail-close");
    }
  }
  await page
    ._client()
    .send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1200, y: 650 });
  await delay(500);
  assert(
    await page.evaluate(
      () => !!document.querySelector(".observatory-world").style.transform,
    ),
  );
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await wait(
    () => document.querySelector(".observatory").classList.contains("is-grid"),
    "touch grid",
  );
  await access();
  await shot("phone");
  assert(
    await page.evaluate(
      () =>
        document.querySelector(".observatory").scrollWidth <= innerWidth + 1,
    ),
  );
  await click(".observatory-language");
  assert.equal(
    await page.evaluate(() => document.querySelector(".observatory-shell").dir),
    "rtl",
  );
  await access();
  await shot("arabic");
  await click(".observatory-language");
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await click(".observatory-exit");
  await wait(() => !document.querySelector(".observatory").open, "exit");
  await wait(
    () =>
      Math.abs(+document.querySelector("canvas").dataset.journey - 1.585) <
      0.001,
    "return camera",
  );
  console.log("PASS smooth return to presentation point");
  await delay(800);
  assert.equal(
    await page.evaluate(() => document.querySelector(".observatory").open),
    false,
    "Stepping away does not reopen the viewer",
  );
  const resumed = await page.evaluate(() => window.__draws);
  await delay(1000);
  assert(
    (await page.evaluate(() => window.__draws)) > resumed,
    "Main scene resumes",
  );
  await click(".lift-toggle");
  await wait(
    () => document.querySelector(".lift-dialog").open,
    "outgoing lift",
  );
  await click('[data-destination="electrical"]');
  await wait(
    () =>
      !document.querySelector(".lift-dialog").open &&
      !!document.querySelector(".electrical-welcome"),
    "electrical",
  );
  await wait(
    () =>
      Math.abs(+document.querySelector("canvas").dataset.journey - 2) < 0.001,
    "electrical camera",
  );
  await measure("electrical");
  if (performanceResults.length)
    await fs.writeFile(
      "artifacts/observatory/after.json",
      JSON.stringify(performanceResults, null, 2),
    );
  assert.deepEqual(await page.evaluate(() => window.__errors), []);
  console.log(
    "PASS automatic scroll entry, transparent AR over live hall, pointer/keyboard camera, 33 displays, idle rendering, smooth exit without reopening, lift, phone, Arabic, WCAG, zero runtime errors",
  );
} finally {
  await browser?.close({ silent: true });
  server.kill("SIGTERM");
}
