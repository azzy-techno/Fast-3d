import fs from "node:fs/promises";
import { openBrowser } from "@remotion/renderer";
const browser = await openBrowser("chrome", {
  browserExecutable: "/usr/bin/chromium",
  chromiumOptions: { gl: "swangle" },
});
try {
  const page = await browser.newPage({
    context: () => null,
    logLevel: "error",
    indent: false,
    pageIndex: 0,
    onBrowserLog: (log) => console.log("BROWSER", log.text),
    onLog: () => {},
  });
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.goto({ url: "http://127.0.0.1:5174", timeout: 60000 });
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      const i = setInterval(() => {
        if (!document.querySelector(".loader")) {
          clearInterval(i);
          resolve(null);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(i);
        resolve(null);
      }, 30000);
    });
  });
  await new Promise((r) => setTimeout(r, 1800));
  await fs.mkdir("artifacts", { recursive: true });
  async function capture(name) {
    const shot = await page
      ._client()
      .send("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(
      `artifacts/${name}.png`,
      Buffer.from(shot.value.data, "base64"),
    );
  }
  console.log(
    await page.evaluate(() => ({
      title: document.title,
      canvas: !!document.querySelector("canvas[data-ready]"),
      loader: !!document.querySelector(".loader"),
      errors: document.querySelector(".fallback-message")?.textContent,
      scroll: document.documentElement.scrollHeight,
      width: document.documentElement.scrollWidth,
    })),
  );
  await capture("desktop-arrival");
  for (const id of ["cooling", "electrical", "manufacturing"]) {
    await page.evaluate(
      (id) => window.scrollTo(0, document.getElementById(id).offsetTop),
      id,
    );
    await new Promise((r) => setTimeout(r, 2000));
    await capture(`desktop-${id}`);
  }
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1500));
  await capture("mobile-arrival");
  await page.evaluate(() =>
    window.scrollTo(0, document.getElementById("cooling").offsetTop),
  );
  await new Promise((r) => setTimeout(r, 1600));
  await capture("mobile-cooling");
} finally {
  await browser.close({ silent: true });
}
