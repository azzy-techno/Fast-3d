import { openBrowser } from "@remotion/renderer";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4182",
    "--strictPort",
    ...(process.env.PROFILE_BUILD
      ? ["--outDir", process.env.PROFILE_BUILD]
      : []),
  ],
  { stdio: "ignore", env: { ...process.env, BASE_PATH: "/Fast-3d/" } },
);
let browser;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  await delay(600);
  browser = await openBrowser("chrome", {
    browserExecutable: "/usr/bin/chromium",
    chromiumOptions: { gl: "swangle" },
  });
  const page = await browser.newPage({
    context: () => null,
    logLevel: "error",
    indent: false,
    pageIndex: 0,
    onBrowserLog: (log) => {
      if (log.type === "error") console.log("BROWSER", log.text);
    },
    onLog: () => {},
  });
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page._client().send("Page.addScriptToEvaluateOnNewDocument", {
    source: `window.__frames=[];let draws=0,last=performance.now();for(const C of [WebGLRenderingContext,WebGL2RenderingContext])for(const k of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){const f=C.prototype[k];if(f)C.prototype[k]=function(...a){draws++;return f.apply(this,a)}}function tick(t){window.__frames.push({ms:t-last,draws});if(window.__frames.length>120)window.__frames.shift();draws=0;last=t;requestAnimationFrame(tick)}requestAnimationFrame(tick);`,
  });
  await page.goto({
    url: "http://127.0.0.1:4182/Fast-3d/?profile-renderer",
    timeout: 120000,
  });
  async function wait(fn) {
    for (let i = 0; i < 1800; i++) {
      if (await page.evaluate(fn)) return;
      await delay(200);
    }
    throw Error("timeout");
  }
  await wait(
    () =>
      !!document.querySelector("canvas[data-ready]") &&
      !document.querySelector(".loader"),
  );
  const results = [];
  await fs.mkdir("artifacts/performance", { recursive: true });
  const capture = async (name) => {
    const screenshot = await page
      ._client()
      .send("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(
      "artifacts/performance/" + name + ".png",
      Buffer.from(screenshot.value.data, "base64"),
    );
  };
  for (const name of ["arrival", "about", "electrical"]) {
    if (name !== "arrival") {
      await page.evaluate(() => document.querySelector(".lift-toggle").click());
      await wait(() => document.querySelector(".lift-dialog").open);
      await page.evaluate(
        (name) =>
          document.querySelector('[data-destination="' + name + '"]').click(),
        name,
      );
      await wait(() => !document.querySelector(".lift-dialog").open);
      const at = name === "about" ? 1.535 : 2;
      for (let i = 0; i < 300; i++) {
        if (
          await page.evaluate(
            (at) =>
              Math.abs(+document.querySelector("canvas").dataset.journey - at) <
              0.001,
            at,
          )
        )
          break;
        await delay(200);
      }
    }
    await page.evaluate(() => window.__fastRenderProbe.reset());
    await wait(() => window.__fastRenderProbe.snapshot().frames.length >= 8);
    const result = await page.evaluate((name) => {
      const s = window.__fastRenderProbe.snapshot(),
        f = s.frames.slice(-6);
      return {
        name,
        ...s,
        frames: f,
        averageDraws: f.reduce((n, x) => n + x.calls, 0) / f.length,
        averageTriangles: f.reduce((n, x) => n + x.triangles, 0) / f.length,
        averageSubmitMs: f.reduce((n, x) => n + x.submitMs, 0) / f.length,
      };
    }, name);
    results.push(result);
    console.log(name, JSON.stringify(result));
    if (process.env.PROFILE_SHOTS) await capture(name);
  }
  if (process.env.PROFILE_SHOTS) {
    for (const [at, aId, bId, aAt, bAt, name] of [
      [2.2, "electrical", "mechanical", 2, 3, "electrical-models"],
      [2.906, "electrical", "mechanical", 2, 3, "rear-lift"],
      [3, "mechanical", "fabrication", 3, 4, "mechanical"],
      [1.88, "about-departure", "electrical", 1.74, 2, "service-lift"],
    ]) {
      await page.evaluate(
        ({ at, aId, bId, aAt, bAt }) => {
          const a = document.getElementById(aId).offsetTop,
            b = document.getElementById(bId).offsetTop;
          window.scrollTo({
            top: a + ((b - a) * (at - aAt)) / (bAt - aAt),
            behavior: "instant",
          });
        },
        { at, aId, bId, aAt, bAt },
      );
      for (let i = 0; i < 600; i++) {
        if (
          await page.evaluate(
            (at) =>
              Math.abs(+document.querySelector("canvas").dataset.journey - at) <
              0.001,
            at,
          )
        )
          break;
        await delay(200);
      }
      await capture(name);
    }
  }
  await fs.writeFile(
    "artifacts/performance/" +
      (process.env.PROFILE_NAME || "profile") +
      ".json",
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser?.close({ silent: true });
  server.kill("SIGTERM");
}
