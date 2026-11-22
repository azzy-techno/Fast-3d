import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { openBrowser } from "@remotion/renderer";
const gallery =
  ["civil", "fabrication", "mechanical"].find((id) =>
    process.argv.includes(`--${id}`),
  ) ?? "electrical";
const expectations = {
  electrical: { exit: 2.8, caption: "Ducted axial fan" },
  mechanical: {
    exit: 3.8,
    caption: "Electric superheater & element bank",
    projects: 11,
  },
  fabrication: {
    exit: 4.8,
    caption: "Fitted stainless cabinet run",
    projects: 9,
  },
  civil: {
    exit: 5.8,
    caption: "Precast seat & recessed supports",
    projects: 14,
  },
};
const last = 16;
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
    const state = await page.evaluate(() => ({
      journey: document.querySelector("canvas")?.dataset.journey,
      scroll: scrollY,
      height: document.documentElement.scrollHeight,
      liftOpen: document.querySelector(".lift-dialog")?.open,
    }));
    throw Error(`Timeout: ${label} ${JSON.stringify(state)}`);
  }
  await wait(
    () =>
      !!document.querySelector("canvas[data-ready]") &&
      !document.querySelector(".loader"),
    "ready",
  );
  await page.evaluate(() => document.querySelector(".lift-toggle").click());
  await wait(() => document.querySelector(".lift-dialog").open, "floor picker");
  await page.evaluate(
    ({ gallery, last, expected }) => {
      window.__galleryExpected = expected;
      window.__gallery = gallery;
      window.__last = last;
      document.querySelector(`[data-destination="${gallery}"]`).click();
    },
    { gallery, last, expected: expectations[gallery] },
  );
  await wait(
    () =>
      document.querySelector("main").dataset.floor === window.__gallery &&
      !document.querySelector(".lift-dialog").open &&
      !!document.querySelector(".electrical-welcome"),
    "gallery arrival",
  );
  assert(
    await page.evaluate(
      () => document.getElementById(window.__gallery).offsetHeight >= 18000,
    ),
    "Gallery provides a paced scroll",
  );
  const projectsOnly =
    gallery !== "electrical" && process.argv.includes("--projects");
  const initialStop = projectsOnly
    ? expectations[gallery].projects
    : process.env.ELECTRICAL_MOBILE_ONLY
      ? last
      : 1;
  if (projectsOnly) {
    await page.evaluate(() =>
      Array.from(document.querySelectorAll(".electrical-welcome button"))
        .find((b) => b.textContent.includes("Go to FAST projects"))
        .click(),
    );
  } else if (initialStop === 1) {
    await page.evaluate(() =>
      document.querySelector(".electrical-welcome button").click(),
    );
  } else {
    await page.evaluate(() => {
      const finalHold = 0.711;
      scrollTo(
        0,
        (document.getElementById("together").offsetTop * finalHold) / 0.8,
      );
    });
  }
  const axeSource = await fs.readFile(
    "node_modules/axe-core/axe.min.js",
    "utf8",
  );
  await page.evaluate((s) => (0, eval)(s), axeSource);
  await fs.mkdir(`artifacts/${gallery}-tour`, { recursive: true });
  async function screenshot(name) {
    const r = await page
      ._client()
      .send("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(
      `artifacts/${gallery}-tour/${name}.png`,
      Buffer.from(r.value.data, "base64"),
    );
  }
  for (let stop = initialStop; stop <= last; stop++) {
    await page.evaluate((n) => (window.__expectedStop = n), stop);
    await wait(() => {
      const d = document.querySelector("canvas").dataset;
      return (
        Number(d[window.__gallery + "Station"]) === window.__expectedStop &&
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
    assert(
      await page.evaluate(() => {
        const label = document.querySelector(".equipment-caption");
        return (
          label?.textContent.trim() && label.getBoundingClientRect().height > 0
        );
      }),
      "Active component has a visible caption",
    );
    await screenshot(`stop-${stop}`);
    console.log(`PASS stop ${stop}: guide presents beside equipment`);
    if (stop === initialStop) {
      // Observe the live skeleton over time while the camera and feet hold.
      // The supporting hand should move, while the pointing arm stays on target.
      const hands = [];
      for (let i = 0; i < 40; i++) {
        const pose = await page.evaluate(() => ({
          hand: document.querySelector("canvas").dataset.guidePresentationHand,
          aim: document.querySelector("canvas").dataset.guideAim,
        }));
        if (pose.hand) {
          hands.push(pose.hand.split(",").map(Number));
          assert(
            Number(pose.aim) > 0.98,
            "Pointing stays aimed during presentation",
          );
        }
        await delay(150);
      }
      assert(hands.length > 5, "Supporting gesture is rendered");
      const excursion = Math.max(
        ...hands.map((p) => Math.hypot(...p.map((v, i) => v - hands[0][i]))),
      );
      assert(excursion > 0.04, `Supporting hand must animate: ${excursion}`);
      console.log(
        `PASS live presentation gesture: ${excursion.toFixed(3)} m movement`,
      );
    }
    if (stop < last)
      await page.evaluate(() =>
        document
          .querySelector(".electrical-tour-actions button:last-child")
          .click(),
      );
  }
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  // Allow resize observers and camera smoothing to settle before checking.
  await delay(1800);
  await wait(() => {
    const d = document.querySelector("canvas").dataset;
    return (
      +d[window.__gallery + "Station"] === window.__last &&
      d.guide === "presenting"
    );
  }, "phone final station");
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
  await screenshot(`phone-stop-${last}`);
  await page.evaluate(() => document.querySelector(".cinema-toggle").click());
  assert(
    await page.evaluate(() => {
      const label = document.querySelector(".equipment-caption");
      return (
        label.textContent === window.__galleryExpected.caption &&
        label.getBoundingClientRect().height > 0
      );
    }),
    "Cinema view retains the component name",
  );
  await page.evaluate(() => document.querySelector(".language").click());
  assert(
    await page.evaluate(() =>
      /[\u0600-\u06FF]/.test(
        document.querySelector(".equipment-caption").textContent,
      ),
    ),
    "Arabic component caption",
  );
  await page.evaluate(() => document.querySelector(".language").click());
  await page.evaluate(() => document.querySelector(".cinema-toggle").click());
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
  await page.evaluate(() => (window.__expectedStop = window.__last - 1));
  await wait(() => {
    const d = document.querySelector("canvas").dataset;
    return (
      +d[window.__gallery + "Station"] === window.__last - 1 &&
      d.guide === "presenting"
    );
  }, "reverse one station");
  await page.evaluate(() =>
    document.querySelector(".electrical-tour nav button:last-child").click(),
  );
  await wait(() => {
    const d = document.querySelector("canvas").dataset;
    return (
      +d[window.__gallery + "Station"] === window.__last &&
      d.guide === "presenting"
    );
  }, "return to final station");
  await page.evaluate(() =>
    document
      .querySelector(".electrical-tour-actions button:last-child")
      .click(),
  );
  await wait(
    () =>
      document.querySelector(".lift-dialog").open &&
      Math.abs(
        +document.querySelector("canvas").dataset.journey -
          window.__galleryExpected.exit,
      ) < 0.001,
    "leave gallery",
  );
  assert.deepEqual(await page.evaluate(() => window.__errors), []);
  console.log(
    `PASS: presentations ${initialStop}–${last}, Next/Previous/direct selection, long chapter, phone layout, WCAG A/AA and return to lift.`,
  );
} finally {
  if (browser) await browser.close({ silent: true });
  server.kill("SIGTERM");
}
