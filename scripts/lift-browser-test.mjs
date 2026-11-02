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
    "4178",
    "--strictPort",
  ],
  { stdio: "pipe", env: { ...process.env, BASE_PATH: "/Fast-3d/" } },
);
let browser;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch("http://127.0.0.1:4178/Fast-3d/")).ok) break;
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
  await page.goto({ url: "http://127.0.0.1:4178/Fast-3d/", timeout: 120000 });
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

  await fs.mkdir("artifacts/lift", { recursive: true });
  async function shot(name) {
    const r = await page
      ._client()
      .send("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(
      `artifacts/lift/${name}.png`,
      Buffer.from(r.value.data, "base64"),
    );
  }
  async function choose(id, at) {
    await page.evaluate(() => {
      const b = document.querySelector(".lift-toggle");
      b.focus();
      b.click();
    });
    await wait(
      () => document.querySelector(".lift-dialog")?.open,
      "lift opens",
    );
    await page.evaluate(
      (id) => document.querySelector(`[data-destination="${id}"]`).click(),
      id,
    );
    await wait(
      () => !document.querySelector(".lift-dialog").open,
      "lift arrives",
    );
    const p = await page.evaluate(
      () => +document.querySelector("canvas").dataset.journey,
    );
    assert(Math.abs(p - at) < 0.003, `Destination ${id}: ${p}`);
  }
  async function seek(p) {
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
      const i = Math.min(11, Math.floor(p)),
        a = document.getElementById(ids[i]).offsetTop;
      const b =
        i === 11
          ? document.documentElement.scrollHeight - innerHeight
          : document.getElementById(ids[i + 1]).offsetTop;
      window.__wanted = p;
      scrollTo(0, a + (b - a) * (p - i));
    }, p);
    await wait(
      () =>
        Math.abs(
          +document.querySelector("canvas").dataset.journey - window.__wanted,
        ) < 0.0003,
      "scroll settles",
    );
  }
  // The existing services menu must use the new destination transition too.
  await page.evaluate(() =>
    document.querySelector(".header-nav button").click(),
  );
  await wait(
    () => document.querySelector(".chapter-dialog").open,
    "services menu",
  );
  await page.evaluate(() =>
    document.querySelectorAll(".dialog-services button")[1].click(),
  );
  await wait(
    () =>
      !document.querySelector(".lift-dialog").open &&
      Math.abs(+document.querySelector("canvas").dataset.journey - 2) < 0.003,
    "electrical introduction",
  );
  assert(
    await page.evaluate(() => !!document.querySelector(".electrical-welcome")),
  );
  await shot("electrical-intro");
  console.log("PASS: electrical menu selection arrives at introduction");

  if (!process.env.LIFT_DETAILS_ONLY) {
    await page.evaluate(() => {
      const b = document.querySelector(".lift-toggle");
      b.focus();
      b.click();
    });
    await wait(
      () => document.querySelector(".lift-dialog").open,
      "lift selector",
    );
    assert.equal(
      await page.evaluate(
        () => document.querySelectorAll(".lift-floor-buttons button").length,
      ),
      12,
    );
    const axe = await fs.readFile("node_modules/axe-core/axe.min.js", "utf8");
    await page.evaluate((s) => (0, eval)(s), axe);
    const violations = await page.evaluate(async () =>
      (
        await window.axe.run(".lift-dialog", {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        })
      ).violations.map((v) => v.id),
    );
    assert.deepEqual(violations, []);
    await shot("floor-selector");
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
    await wait(
      () => !document.querySelector(".lift-dialog").open,
      "Escape closes",
    );
    assert(
      await page.evaluate(() =>
        document.activeElement?.classList.contains("lift-toggle"),
      ),
      "Focus returns to lift opener",
    );

    // Observe only exposed scene frames; skipped service floors must never appear.
    await page.evaluate(() => {
      window.__exposed = [];
      window.__watch = setInterval(() => {
        const d = document.querySelector(".lift-dialog");
        if (!d.open || d.dataset.phase === "opening")
          window.__exposed.push(
            +document.querySelector("canvas").dataset.journey,
          );
      }, 30);
    });
    await choose("fire", 6);
    const exposed = await page.evaluate(() => {
      clearInterval(window.__watch);
      return window.__exposed;
    });
    assert(
      exposed.every((p) => Math.abs(p - 2) < 0.01 || Math.abs(p - 6) < 0.01),
      `Skipped floor exposed: ${exposed}`,
    );
    await choose("electrical", 2);
    console.log(
      "PASS: service selection skips intermediate floors behind doors; reverse navigation works",
    );
    await page.evaluate(() =>
      document.querySelector(".electrical-welcome button").click(),
    );
    await wait(
      () =>
        document.querySelector("canvas").dataset.electricalStation === "1" &&
        document.querySelector("canvas").dataset.guide === "presenting",
      "station01",
    );
    await shot("first-station");
    await seek(2.711);
    await page.evaluate(() =>
      document
        .querySelector(".electrical-tour-actions button:last-child")
        .click(),
    );
    await wait(
      () => +document.querySelector("canvas").dataset.journey > 2.845,
      "rear lift approach",
    );
    const guide = await page.evaluate(() =>
      document
        .querySelector("canvas")
        .dataset.guidePosition.split(",")
        .map(Number),
    );
    assert(guide[2] > 50 && guide[0] < -18, "Exit stays beside final display");
    assert(await page.evaluate(() => !!document.querySelector(".lift-prompt")));
    await seek(2.82);
    await shot("rear-lift");
    await seek(2.906);
    await shot("rear-cabin");
    await seek(2.914);
    await shot("destination-cabin");
    console.log("PASS: rear exit and sealed cabin transition");
  }
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await choose("electrical", 2);
  await shot("phone-intro");
  await page.evaluate(() =>
    document
      .querySelector(".electrical-welcome .electrical-scope summary")
      .click(),
  );
  assert.equal(
    await page.evaluate(
      () => document.querySelectorAll("#electrical-scope-content").length,
    ),
    1,
    "Only one scope panel is mounted",
  );
  assert(
    await page.evaluate(() => {
      const box = document
        .querySelector(".electrical-welcome")
        .getBoundingClientRect();
      const footer = document
        .querySelector(".tour-controls")
        .getBoundingClientRect();
      return box.top > 135 && box.bottom <= footer.top;
    }),
    "Expanded scope fits between header and footer",
  );
  await shot("phone-scope");
  await page.evaluate(() =>
    document
      .querySelector(".electrical-welcome .electrical-scope summary")
      .click(),
  );

  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.evaluate(() => {
    const b = document.querySelector(".lift-toggle");
    b.focus();
    b.click();
  });
  await wait(() => document.querySelector(".lift-dialog").open, "phone lift");
  await shot("phone-selector");
  assert(
    await page.evaluate(() => {
      const d = document.querySelector(".lift-dialog").getBoundingClientRect();
      return (
        d.left >= 0 &&
        d.right <= innerWidth &&
        d.top >= 0 &&
        d.bottom <= innerHeight + 1
      );
    }),
  );
  await page.evaluate(() =>
    document.querySelector('[data-destination="reception"]').click(),
  );
  await wait(
    () => !document.querySelector(".lift-dialog").open,
    "reception arrival",
  );
  assert(
    Math.abs(
      (await page.evaluate(
        () => +document.querySelector("canvas").dataset.journey,
      )) - 11.69,
    ) < 0.003,
  );
  assert.deepEqual(await page.evaluate(() => window.__errors), []);
  console.log(
    "PASS: phone layout, floor panel, reception shortcut and no runtime errors",
  );
} finally {
  if (browser) await browser.close({ silent: true });
  server.kill("SIGTERM");
}
