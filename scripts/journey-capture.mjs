import fs from "node:fs/promises";
import assert from "node:assert/strict";
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
    "4175",
    "--strictPort",
  ],
  { stdio: "pipe", env: { ...process.env, BASE_PATH: "/Fast-3d/" } },
);
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let browser;
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch("http://127.0.0.1:4175/Fast-3d/")).ok) break;
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
    onBrowserLog: (log) => {
      if (log.type === "error") console.log("BROWSER", log.text);
    },
    onLog: () => {},
  });
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.goto({ url: "http://127.0.0.1:4175/Fast-3d/", timeout: 120000 });
  for (let i = 0; i < 240; i++) {
    if (
      await page.evaluate(
        () =>
          !!document.querySelector("canvas[data-ready]") &&
          !document.querySelector(".loader"),
      )
    )
      break;
    await delay(500);
  }
  console.log(
    "READY",
    await page.evaluate(() => ({
      ready: !!document.querySelector("canvas[data-ready]"),
      failure: document.querySelector(".fallback-message")?.textContent,
    })),
  );
  assert.equal(
    await page.evaluate(
      () =>
        !!document.querySelector("canvas[data-ready]") &&
        !document.querySelector(".fallback-message"),
    ),
    true,
    "The real 3D scene must be ready before capture",
  );
  await fs.mkdir("artifacts/journey", { recursive: true });
  async function capture(p, name, mobile = false) {
    if (
      process.env.JOURNEY_SHOTS &&
      !process.env.JOURNEY_SHOTS.split(",").includes(name)
    )
      return;
    if (mobile)
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.evaluate((p) => {
      const ids = [
        "arrival",
        "cooling",
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
        "together",
      ];
      const i = Math.min(11, Math.floor(p));
      const a = document.getElementById(ids[i]).offsetTop;
      const b =
        i === 11
          ? document.documentElement.scrollHeight - innerHeight
          : document.getElementById(ids[i + 1]).offsetTop;
      scrollTo(0, a + (b - a) * (p - i));
    }, p);
    let settled = false;
    for (let i = 0; i < 300; i++) {
      const actual = await page.evaluate(() =>
        Number(document.querySelector("canvas")?.dataset.journey),
      );
      if (Math.abs(actual - p) < 0.01) {
        settled = true;
        break;
      }
      await delay(200);
    }
    assert(settled, `Camera must settle before capture: ${name}`);
    await delay(300);
    if (
      name === "service-corridor" ||
      name === "electrical" ||
      name === "mechanical" ||
      name.includes("electrical-stop-")
    ) {
      const expected =
        name === "service-corridor" || name === "electrical"
          ? "standing"
          : "presenting";
      let state;
      for (let wait = 0; wait < 150; wait++) {
        state = await page.evaluate(() => ({
          ...document.querySelector("canvas").dataset,
        }));
        if (
          state.guide === expected &&
          (expected !== "presenting" || Number(state.guideAim) > 0.98)
        )
          break;
        await delay(200);
      }
      assert.equal(
        state.guide,
        expected,
        "Gestures occur only at showcase stops",
      );
      if (expected === "presenting") {
        assert(
          Number(state.guideCameraDistance) > 4,
          "Guide stays out of the foreground",
        );
        assert(
          Number(state.guideAim) > 0.98,
          `Hand aims at the actual exhibit: ${JSON.stringify(state)}`,
        );
      }
    }
    if (name === "electrical-lift")
      assert.equal(
        await page.evaluate(
          () =>
            getComputedStyle(
              document.querySelector("#mechanical .chapter-copy"),
            ).visibility,
        ),
        "hidden",
        "Upcoming service copy stays hidden inside lift",
      );
    if (name.endsWith("electrical-scope")) {
      await page.evaluate(() =>
        document.querySelector(".electrical-scope > summary").click(),
      );
      await delay(250);
      const bounds = await page.evaluate(() => {
        const scope = document
          .querySelector(".electrical-scope")
          .getBoundingClientRect();
        const footer = document
          .querySelector(".tour-controls")
          .getBoundingClientRect();
        return {
          top: scope.top,
          bottom: scope.bottom,
          footer: footer.top,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      assert(
        bounds.top > 84 && bounds.bottom < bounds.footer,
        `Scope fits between navigation and footer: ${JSON.stringify(bounds)}`,
      );
      assert.equal(bounds.overflow, false);
    }
    const result = await page
      ._client()
      .send("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(
      `artifacts/journey/${name}.png`,
      Buffer.from(result.value.data, "base64"),
    );
    console.log(
      "HOST",
      await page.evaluate(() => ({
        ...document.querySelector("canvas").dataset,
      })),
    );
    console.log(
      "SHOT",
      name,
      await page.evaluate(
        () => document.querySelector("canvas")?.dataset.journey,
      ),
    );
    if (name.endsWith("electrical-scope"))
      await page.evaluate(() =>
        document.querySelector(".electrical-scope > summary").click(),
      );
  }
  await capture(0.61, "host-welcome");
  await capture(0.9, "host-follow");
  await capture(11.445, "exit-corridor");
  await capture(11.55, "exit-lift");
  await capture(11.68, "reception-entry");
  await capture(11.69, "reception-premium");
  await capture(11.73, "reception");
  await capture(11.8, "exit-walk");
  await capture(11.86, "host-goodbye");
  await capture(11.96, "drone");
  await capture(0, "arrival");
  await capture(1, "roof");
  await capture(1.34, "roof-door");
  await capture(1.4, "roof-lift-turn");
  await capture(1.44, "roof-lift-descent");
  await capture(1.85, "service-lift-turn");
  await capture(1.88, "service-lift-descent");
  await capture(1.53, "workplace-entry");
  await capture(1.65, "offices");
  await capture(1.74, "office-corridor");
  await capture(1.94, "systems-entry");
  await capture(2, "electrical");
  await capture(2, "electrical-scope");
  await capture(2.2, "electrical-overview");
  await capture(2.28, "electrical-infrastructure");
  await capture(2.906, "electrical-lift");
  for (let i = 0; i < 16; i++)
    await capture(
      2.051 + i * 0.044,
      `electrical-stop-${String(i + 1).padStart(2, "0")}`,
    );
  await capture(2.208, "electrical-walk");
  await capture(3.0, "mechanical-landing");
  await capture(2.858, "service-corridor");
  await capture(3, "mechanical");
  await capture(8, "manufacturing");
  await capture(10, "iiot");
  await capture(1, "phone-host", true);
  await capture(11.86, "phone-farewell", true);
  await capture(2, "phone-electrical", true);
  await capture(2.051, "phone-electrical-stop-01", true);
  await capture(2.711, "phone-electrical-stop-16", true);
  await capture(2, "phone-electrical-scope", true);
  await capture(2.2, "phone-electrical-overview", true);
  await capture(2.28, "phone-electrical-infrastructure", true);
  if (process.env.JOURNEY_CHECK_RETURN) {
    await page.evaluate(() => document.querySelector(".plan-toggle").click());
    await page.evaluate(() =>
      document.querySelector(".plan-drawing li:first-child button").click(),
    );
    for (let i = 0; i < 150; i++) {
      if (
        await page.evaluate(
          () =>
            Math.abs(
              scrollY - document.getElementById("electrical").offsetTop,
            ) < 8,
        )
      )
        break;
      await delay(200);
    }
    await capture(0, "return-arrival", true);
  }
  await capture(1.65, "phone-offices", true);
} finally {
  if (browser) await browser.close({ silent: true });
  server.kill("SIGTERM");
}
