import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import { openBrowser } from "@remotion/renderer";

const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4189",
    "--strictPort",
  ],
  { env: { ...process.env, BASE_PATH: "/Fast-3d/" }, stdio: "ignore" },
);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let browser;
try {
  browser = await openBrowser("chrome", {
    browserExecutable: "/usr/bin/chromium",
    chromiumOptions: { gl: "swangle" },
  });
  const errors = [];
  const page = await browser.newPage({
    context: () => null,
    logLevel: "error",
    indent: false,
    pageIndex: 0,
    onLog: () => {},
    onBrowserLog: (event) => {
      if (event.type === "error") errors.push(event.text);
    },
  });
  await page.setViewport({ width: 1100, height: 720, deviceScaleFactor: 1 });
  await page.goto({ url: "http://127.0.0.1:4189/Fast-3d/", timeout: 120000 });
  async function wait(label, fn, arg) {
    for (let i = 0; i < 320; i++) {
      if (await page.evaluate(fn, arg)) return;
      await delay(200);
    }
    throw new Error(
      label +
        " " +
        JSON.stringify(
          await page.evaluate(() => ({
            y: scrollY,
            range: document.documentElement.scrollHeight - innerHeight,
            data: { ...document.querySelector("canvas")?.dataset },
            lift: document.querySelector(".lift-dialog")?.dataset.phase,
            floor: document.querySelector("main").dataset.floor,
          })),
        ),
    );
  }
  async function capture(name) {
    await fs.mkdir("artifacts/floor-visits", { recursive: true });
    const shot = await page
      ._client()
      .send("Page.captureScreenshot", { format: "jpeg", quality: 80 });
    await fs.writeFile(
      "artifacts/floor-visits/" + name + ".jpg",
      Buffer.from(shot.value.data, "base64"),
    );
  }
  const click = (selector) =>
    page.evaluate((s) => document.querySelector(s).click(), selector);
  await wait(
    "ready",
    () =>
      document.querySelector("canvas")?.dataset.ready &&
      !document.querySelector(".loader"),
  );
  assert.equal(
    await page.evaluate(() => document.querySelector("main").dataset.floor),
    "reception",
  );
  await wait(
    "exterior opening",
    () =>
      Math.abs(+document.querySelector("canvas").dataset.journey - 12) < 0.001,
  );
  await capture("tower-exterior");
  const visitArrival = async (fraction, pose, name) => {
    await page.evaluate(
      (f) =>
        window.scrollTo(
          0,
          f * (document.documentElement.scrollHeight - innerHeight),
        ),
      fraction,
    );
    await wait(
      name,
      (pose) =>
        Math.abs(+document.querySelector("canvas").dataset.journey - pose) <
        0.001,
      pose,
    );
    assert.equal(
      await page.evaluate(() => document.querySelector(".lift-dialog").open),
      false,
    );
    await capture(name);
  };
  await click(".enter-button");
  await wait(
    "approach the gate",
    () =>
      Math.abs(+document.querySelector("canvas").dataset.journey - 11.89) <
      0.001,
  );
  await capture("main-gate");
  await visitArrival(0.64, 11.77, "lobby-doors");
  await visitArrival(0.75, 11.69, "reception");
  console.log("PASS exterior, visitor gate, lobby doors and reception");
  const toLanding = async () => {
    await page.evaluate(() =>
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      }),
    );
    await wait(
      "landing picker",
      () => document.querySelector(".lift-dialog").open,
    );
  };
  const ride = async (id, at) => {
    await click('[data-destination="' + id + '"]');
    await wait(
      "destination revealed",
      (id) =>
        document.querySelector("main").dataset.floor === id &&
        !document.querySelector(".lift-dialog").open,
      id,
    );
    await wait(
      "destination frame",
      (at) =>
        Math.abs(+document.querySelector("canvas").dataset.journey - at) <
        0.002,
      at,
    );
    assert.equal(await page.evaluate(() => scrollY), 0);
    assert(
      await page.evaluate(() => {
        const d = document.querySelector("canvas").dataset;
        return d.renderedJumpVersion === d.jumpVersion;
      }),
    );
  };
  await toLanding();
  await capture("lift");
  assert.equal(
    await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("[data-destination]"),
        (el) => el.dataset.destination,
      )
        .slice(0, 3)
        .join(","),
    ),
    "reception,electrical,mechanical",
  );
  await click(".lift-console-top button");
  await delay(600);
  assert.equal(
    await page.evaluate(() => document.querySelector(".lift-dialog").open),
    false,
  );
  await click(".lift-toggle");
  await ride("electrical", 2);
  await click(".electrical-welcome button");
  await wait(
    "first station",
    () => document.querySelector("canvas").dataset.electricalStation === "1",
  );
  await toLanding();
  await ride("mechanical", 3);
  await toLanding();
  await ride("about", 1.535);
  await click(".lift-toggle");
  await ride("cooling", 1.12);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.evaluate(() =>
    window.scrollTo(0, document.getElementById("together").offsetTop * 0.68),
  );
  await wait("rooftop farewell", () => {
    const pose = document.querySelector("canvas").dataset;
    return Math.abs(+pose.journey - 0.55) < 0.002 && pose.guide === "waving";
  });
  const waveDistance = await page.evaluate(
    () => +document.querySelector("canvas").dataset.guideCameraDistance,
  );
  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  await wait(
    "roof finale",
    () => +document.querySelector("canvas").dataset.journey < 0.002,
  );
  assert(
    (await page.evaluate(
      () => +document.querySelector("canvas").dataset.guideCameraDistance,
    )) >
      waveDistance * 6,
    "Camera pulls back to a wide shot",
  );
  await capture("roof-finale");
  assert.equal(
    await page.evaluate(() => document.querySelector(".lift-dialog").open),
    false,
  );
  await click(".replay-tour");
  await wait(
    "replay",
    () =>
      document.querySelector("main").dataset.floor === "reception" &&
      !document.querySelector(".lift-dialog").open,
  );
  await wait(
    "replay exterior",
    () => +document.querySelector("canvas").dataset.journey === 12,
  );
  await capture("phone-exterior");
  await click(".lift-toggle");
  await click('[data-destination="reception"]');
  await wait(
    "lift returns directly to desk",
    () =>
      !document.querySelector(".lift-dialog").open &&
      Math.abs(+document.querySelector("canvas").dataset.journey - 11.69) <
        0.001,
  );
  await click(".view-button");
  assert.equal(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("main .chapter"))
        .map((el) => el.id)
        .at(-1),
    ),
    "cooling",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS automatic landing picker, dismiss, direct masked rides, station 01, roof finale, phone replay and list order",
  );
} finally {
  await browser?.close({ silent: true });
  server.kill("SIGTERM");
}
