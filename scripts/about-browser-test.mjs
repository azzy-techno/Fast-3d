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
    "4179",
    "--strictPort",
  ],
  { stdio: "pipe", env: { ...process.env, BASE_PATH: "/Fast-3d/" } },
);
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let browser;
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch("http://127.0.0.1:4179/Fast-3d/")).ok) break;
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
    for (let i = 0; i < 400; i++) {
      if (await page.evaluate(fn)) return;
      await delay(200);
    }
    throw Error("Timeout: " + label);
  }
  await fs.mkdir("artifacts/about", { recursive: true });
  async function shot(name) {
    const r = await page
      ._client()
      .send("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(
      `artifacts/about/${name}.png`,
      Buffer.from(r.value.data, "base64"),
    );
  }
  async function click(sel) {
    await page.evaluate((s) => {
      const b = document.querySelector(s);
      b.focus();
      b.click();
    }, sel);
  }
  async function key(key, code = key) {
    await page._client().send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key,
      code,
      windowsVirtualKeyCode:
        key === "Escape" ? 27 : key === "ArrowRight" ? 39 : 0,
    });
    await page
      ._client()
      .send("Input.dispatchKeyEvent", { type: "keyUp", key, code });
  }
  const axe = await fs.readFile("node_modules/axe-core/axe.min.js", "utf8");
  async function access() {
    await page.evaluate((s) => (0, eval)(s), axe);
    const v = await page.evaluate(async () =>
      (
        await window.axe.run(".about-projection", {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        })
      ).violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    );
    assert.deepEqual(v, []);
  }
  await page.goto({
    url:
      "http://127.0.0.1:4179/Fast-3d/" +
      (process.env.ABOUT_LIST_ONLY ? "?view=list" : ""),
    timeout: 120000,
  });
  if (!process.env.ABOUT_LIST_ONLY) {
    await wait(
      () =>
        !!document.querySelector("canvas[data-ready]") &&
        !document.querySelector(".loader"),
      "3D ready",
    );
    await click(".partner-link");
    await wait(
      () =>
        document.querySelector(".about-projection").open &&
        !document.querySelector(".lift-dialog").open,
      "partner lift destination",
    );
    assert(
      Math.abs(
        (await page.evaluate(
          () => +document.querySelector("canvas").dataset.journey,
        )) - 1.57,
      ) < 0.003,
    );
    assert(
      await page.evaluate(() => !!document.querySelector(".about-welcome")),
    );
    console.log(
      "PASS: header Partners travels to level 12 before projection opens",
    );
  } else {
    await click(".partner-link");
    await wait(
      () => document.querySelector(".about-projection").open,
      "list projection",
    );
  }
  await wait(
    () => document.querySelectorAll(".partner-tile").length === 13,
    "13 partners",
  );
  await access();
  await shot("partners");
  await click(".partner-tile:last-child");
  assert(
    (
      await page.evaluate(
        () => document.querySelector(".partner-detail").textContent,
      )
    ).includes("PCT Group"),
  );
  await page.evaluate(() => {
    const i = document.querySelector(".partner-search input");
    const set = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    ).set;
    set.call(i, "Portugal");
    i.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await wait(
    () => document.querySelectorAll(".partner-tile").length === 1,
    "partner search",
  );
  assert(
    (
      await page.evaluate(
        () => document.querySelector(".partner-tile").textContent,
      )
    ).includes("ManWinWin"),
  );
  await click("#about-tab-certifications");
  await wait(
    () => document.querySelectorAll(".certificate-card").length === 3,
    "certificates",
  );
  await access();
  await shot("certifications");
  const urls = await page.evaluate(() =>
    [...document.querySelectorAll(".certificate-card")].map((a) => a.href),
  );
  for (const url of urls) {
    const r = await fetch(url);
    assert(r.ok);
    assert(
      Buffer.from(await r.arrayBuffer())
        .subarray(0, 4)
        .equals(Buffer.from("%PDF")),
    );
  }
  assert(
    (
      await page.evaluate(
        () => document.querySelector(".projection-content").textContent,
      )
    ).includes("26 October 2027"),
  );
  await click("#about-tab-approvals");
  await wait(
    () => document.querySelectorAll(".registration-grid article").length === 15,
    "registrations",
  );
  await access();
  await shot("approvals");
  const text = await page.evaluate(
    () => document.querySelector(".registration-grid").textContent,
  );
  for (const name of [
    "Saudi Aramco",
    "Saudi Energy",
    "Ma’aden",
    "Hadeed",
    "Petro Rabigh",
    "Siemens Energy",
    "SAP Ariba Network",
  ])
    assert(text.includes(name));
  await click(".other-vendors summary");
  assert(
    await page.evaluate(
      () => document.querySelectorAll(".other-vendors li").length > 45,
    ),
  );
  await click("#about-tab-story");
  await key("ArrowRight");
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "about-tab-certifications",
  );
  const before = await page.evaluate(() => scrollY);
  await page._client().send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: 600,
    y: 500,
    deltaY: 400,
    deltaX: 0,
  });
  await delay(300);
  assert.equal(
    await page.evaluate(() => scrollY),
    before,
    "Projection scrolling does not move the building tour",
  );
  await key("Escape");
  await wait(() => !document.querySelector(".about-projection").open, "Escape");
  assert.equal(
    await page.evaluate(
      () =>
        document.activeElement.getAttribute("data-about-open") ||
        document.activeElement.className,
    ),
    process.env.ABOUT_LIST_ONLY ? "partner-link" : "partners",
  );
  console.log(
    "PASS: 13 partners, search, selection, 3 PDFs, 15 registrations, keyboard tabs, Escape, focus return, scroll lock, WCAG",
  );
  if (!process.env.ABOUT_LIST_ONLY) {
    await shot("gallery");
    await click(".lift-toggle");
    await wait(
      () => document.querySelector(".lift-dialog").open,
      "lift selector",
    );
    assert.equal(
      await page.evaluate(
        () => document.querySelectorAll(".lift-floor-buttons button").length,
      ),
      13,
    );
    await click('[data-destination="electrical"]');
    await wait(
      () =>
        !document.querySelector(".lift-dialog").open &&
        Math.abs(+document.querySelector("canvas").dataset.journey - 2) < 0.003,
      "electrical arrival",
    );
    assert(
      await page.evaluate(
        () => !!document.querySelector(".electrical-welcome"),
      ),
    );
    await click(".lift-toggle");
    await wait(
      () => document.querySelector(".lift-dialog").open,
      "return selector",
    );
    await click('[data-destination="about"]');
    await wait(
      () =>
        !document.querySelector(".lift-dialog").open &&
        Math.abs(+document.querySelector("canvas").dataset.journey - 1.57) <
          0.003,
      "return to about",
    );
    console.log("PASS: lift can leave for electrical and return to About FAST");
  }
  assert.deepEqual(await page.evaluate(() => window.__errors), []);
  if (!process.env.ABOUT_LIST_ONLY) {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await delay(500);
    await click(".lift-toggle");
    await wait(() => document.querySelector(".lift-dialog").open, "phone lift");
    await click('[data-destination="about"]');
    await wait(
      () =>
        !document.querySelector(".lift-dialog").open &&
        Math.abs(+document.querySelector("canvas").dataset.journey - 1.57) <
          0.003,
      "phone gallery",
    );
    await shot("phone-gallery");
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
  }
  // List mode makes the same content reachable without WebGL, including phones and reduced motion.
  await page._client().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto({
    url: "http://127.0.0.1:4179/Fast-3d/?view=list",
    timeout: 120000,
  });
  await wait(() => !!document.querySelector(".about-list"), "list about");
  await click('.about-list [data-about-open="partners"]');
  await wait(
    () => document.querySelector(".about-projection").open,
    "phone partners",
  );
  await access();
  await shot("phone-partners");
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  assert(
    await page.evaluate(() => {
      const r = document
        .querySelector(".projection-shell")
        .getBoundingClientRect();
      return (
        r.top >= 0 &&
        r.bottom <= innerHeight &&
        r.left >= 0 &&
        r.right <= innerWidth
      );
    }),
  );
  assert.equal(
    await page.evaluate(
      () =>
        getComputedStyle(document.querySelector(".projection-shell"))
          .animationName,
    ),
    "none",
  );
  await key("Escape");
  await click(".language");
  await click('.about-list [data-about-open="certifications"]');
  await wait(
    () => document.querySelector(".about-projection").open,
    "Arabic certificates",
  );
  await access();
  await shot("phone-arabic-certifications");
  assert.equal(await page.evaluate(() => document.documentElement.dir), "rtl");
  await click("#about-tab-partners");
  assert(
    (
      await page.evaluate(
        () => document.querySelector(".partner-detail").textContent,
      )
    ).includes("ميتا"),
  );
  assert.deepEqual(await page.evaluate(() => window.__errors), []);
  console.log(
    "PASS: phone, Arabic, reduced motion, non-WebGL access and zero runtime errors",
  );
} finally {
  if (browser) await browser.close({ silent: true });
  server.kill("SIGTERM");
}
