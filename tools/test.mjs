// End-to-end checks of the production build through its normal controls.
//   node tools/serve.mjs dist 4173 /Fast-3d/   then   node tools/test.mjs
// Uses the installed Chrome with its real GPU. Writes artifacts/test-report.json and screenshots.
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.URL || "http://127.0.0.1:4173/Fast-3d/";
const out = path.resolve("artifacts", "test");
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass: !!pass, detail: String(detail).slice(0, 240) });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + String(detail).slice(0, 160) : ""}`);
};
const RECORDER = `window.__ft=[];(function loop(l){requestAnimationFrame(function(t){window.__ft.push(t-l);loop(t);});})(performance.now());`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  args: ["--window-size=1480,1040", "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding", "--no-first-run", "--no-default-browser-check"],
  defaultViewport: null,
});

async function open(url, opts = {}) {
  const page = await browser.newPage();
  const cdp = await page.createCDPSession();
  await page.setViewport(opts.viewport ?? { width: 1440, height: 900, deviceScaleFactor: 1 });
  if (opts.ua) await page.setUserAgent(opts.ua);
  if (opts.reduced) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  if (opts.init) await page.evaluateOnNewDocument(opts.init);
  await page.evaluateOnNewDocument(RECORDER);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon|net::ERR/.test(m.text())) errors.push(m.text().slice(0, 200));
  });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  return { page, cdp, errors };
}
const shot = (page, name) => page.screenshot({ path: path.join(out, name + ".jpg"), type: "jpeg", quality: 84 });
const ready = (page) => page.waitForSelector('.stage[data-ready="true"]', { timeout: 90000 });
const idle = (page, id) => page.waitForSelector(`.stage[data-scene="${id}"][data-lift="idle"]`, { timeout: 90000 });
const title = (page) => page.$eval(".card h2", (e) => e.innerText.trim()).catch(() => "");
const eyebrow = (page) => page.$eval(".card .eyebrow", (e) => e.innerText.trim()).catch(() => "");
const text = (page, sel) => page.$eval(sel, (e) => e.innerText.trim()).catch(() => "");
const wheel = async (cdp, notches, gap = 45) => {
  for (let i = 0; i < notches; i++) {
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 760, y: 420, deltaX: 0, deltaY: 100 });
    await sleep(gap);
  }
};
const settle = (page) => page.waitForFunction(() => window.__fast && window.__fast.engine.input.settled, { timeout: 30000, polling: 100 });
const clickText = (page, sel, re) =>
  page.evaluate(
    (sel, src) => {
      const b = [...document.querySelectorAll(sel)].find((x) => new RegExp(src, "i").test(x.innerText) && x.offsetParent !== null);
      if (b) b.click();
      return !!b;
    },
    sel,
    re.source,
  );
const ride = async (page, re, id) => {
  await page.click(".lift-call");
  await page.waitForSelector(".lift-buttons button", { visible: true });
  const t0 = Date.now();
  await page.evaluate(() => (window.__ft.length = 0));
  await clickText(page, ".lift-buttons button", re);
  await idle(page, id);
  const worst = await page.evaluate(() => Math.round(Math.max(0, ...window.__ft.splice(0))));
  return { ms: Date.now() - t0, worst };
};

try {
  // ------------------------------------------------------------------ desktop, English
  const d = await open(BASE + "?probe");
  const { page, cdp } = d;
  const t0 = Date.now();
  await page.waitForSelector(".poster-copy h1");
  check("first view shows headline, services and contact before 3D is ready", (await text(page, ".poster-copy h1")).length > 10 && (await page.$(".top .btn.primary")) !== null, `${Date.now() - t0} ms`);
  await ready(page);
  check("3D arrival ready", true, `${Date.now() - t0} ms`);
  await sleep(1200);
  await shot(page, "01-street");
  check("street stop shows the company headline", /backbone of Saudi industry/i.test(await title(page)), await title(page));

  // walk in from the street with the wheel
  const wheelUntil = async (re, max = 120) => {
    let n = 0;
    while (n < max && !re.test(await title(page))) {
      await wheel(cdp, 4);
      n += 4;
    }
    await settle(page);
    return n;
  };
  const n2 = await wheelUntil(/Eight floors/i);
  await sleep(600);
  await shot(page, "02-plaza");
  const t2 = await title(page);
  const n3 = await wheelUntil(/Welcome to FAST/i);
  await sleep(2500);
  await shot(page, "03-reception");
  const t3 = await title(page);
  check("scrolling walks street -> entrance -> reception", /Eight floors/i.test(t2) && /Welcome to FAST/i.test(t3), `${n2} + ${n3} wheel notches`);
  for (let i = 0; i < 12 && !(await page.$("dialog.lift-panel[open]")); i++) await wheel(cdp, 5);
  await page.waitForSelector("dialog.lift-panel[open]", { timeout: 30000 }).catch(() => {});
  check("reaching the lift opens the floor selector", (await page.$("dialog.lift-panel[open]")) !== null);
  await shot(page, "04-lift-panel");
  check("selector lists reception, 8 floors and the roof", (await page.$$eval(".lift-buttons button", (b) => b.length)) === 10);
  // focus is inside the dialog and Escape closes it
  check("focus moves into the selector", await page.evaluate(() => !!document.activeElement?.closest("dialog.lift-panel")));
  await page.keyboard.press("Escape");
  await sleep(300);
  check("Escape closes the selector", (await page.$("dialog.lift-panel[open]")) === null);
  await page.keyboard.press("l");
  await page.waitForSelector("dialog.lift-panel[open]", { timeout: 5000 }).catch(() => {});
  check("L key calls the lift", (await page.$("dialog.lift-panel[open]")) !== null);
  await clickText(page, ".lift-buttons button", /About FAST/);
  await idle(page, "about");
  await sleep(1200);
  await shot(page, "05-about");
  check("lift ride arrives on Level 01 About", /LEVEL 01/i.test(await eyebrow(page)), await eyebrow(page));

  // keyboard navigation
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await settle(page);
  await sleep(400);
  const k1 = await eyebrow(page);
  await page.keyboard.press("ArrowDown");
  await settle(page);
  await sleep(400);
  const k2 = await eyebrow(page);
  check("arrow keys step between stops", /1 \/ 5/.test(k1) && /2 \/ 5/.test(k2), `${k1} | ${k2}`);
  await sleep(1500);
  await shot(page, "06-about-credentials");
  // About viewer
  check("credentials stop offers the viewer", await clickText(page, ".card .btn", /Inspect/));
  await page.waitForSelector("dialog.viewer[open] .inspect-art img", { timeout: 8000 }).catch(() => {});
  await sleep(800);
  const certOk = await page.evaluate(() => {
    const i = document.querySelector("dialog.viewer[open] .inspect-art img");
    return !!i && i.naturalWidth > 100;
  });
  check("About viewer shows a real certificate image", certOk);
  const v1 = await text(page, "dialog.viewer .inspect-text h2");
  await page.keyboard.press("ArrowRight");
  await sleep(300);
  const v2 = await text(page, "dialog.viewer .inspect-text h2");
  check("viewer steps with the arrow keys", v1 && v2 && v1 !== v2, `${v1} -> ${v2}`);
  await shot(page, "07-about-viewer");
  await clickText(page, "dialog.viewer .tabs button", /partners/);
  await sleep(500);
  check("viewer lists the partners with logos", (await page.$$eval("dialog.viewer .thumbs img", (i) => i.length)) >= 12);
  await page.keyboard.press("Escape");
  await sleep(300);

  // direct route to a service from the header
  await page.click(".top-nav .btn.ghost");
  await page.waitForSelector("dialog.menu[open]");
  check("services menu lists every floor with its official page link", (await page.$$eval("dialog.menu .menu-ext", (a) => a.filter((x) => /fast-arabia\.com/.test(x.href)).length)) === 9);
  const tm = Date.now();
  await clickText(page, "dialog.menu .menu-go", /Fire Protection/);
  await idle(page, "fire");
  check("services menu jumps straight to a floor", /Fire/i.test(await eyebrow(page)), `${Date.now() - tm} ms`);
  await sleep(1500);
  await page.evaluate(() => window.__fast.engine.goStation(3));
  await settle(page);
  await sleep(2500);
  await shot(page, "08-fire-sprinklers");

  // contact in seconds
  await page.click(".top .btn.primary");
  await page.waitForSelector("dialog.contact[open]");
  const mail = await page.$eval('dialog.contact a[href^="mailto:"]', (a) => a.href).catch(() => "");
  const rfq = await page.$eval("dialog.contact a.btn.primary", (a) => a.href).catch(() => "");
  check("contact sheet has email and the RFQ link", /info@fast-arabia\.com/.test(mail) && /fast-arabia\.com\/contact/.test(rfq), `${mail} | ${rfq}`);
  await shot(page, "09-contact");
  await page.keyboard.press("Escape");
  await sleep(300);

  // Arabic / RTL
  await page.click(".top .lang");
  await sleep(700);
  const ar = await page.evaluate(() => ({
    dir: document.documentElement.dir,
    lang: document.documentElement.lang,
    card: document.querySelector(".card h2")?.innerText ?? "",
    cardRight: (() => {
      const r = document.querySelector(".card")?.getBoundingClientRect();
      return r ? r.left + r.width / 2 > innerWidth / 2 : null;
    })(),
    dockLeft: (() => {
      const r = document.querySelector(".dock")?.getBoundingClientRect();
      return r ? r.left < innerWidth / 2 : null;
    })(),
  }));
  check("Arabic switches the document to RTL", ar.dir === "rtl" && ar.lang === "ar");
  check("Arabic card text is Arabic", /[\u0600-\u06FF]{3,}/.test(ar.card), ar.card);
  check("RTL layout mirrors: card on the right, dock on the left", ar.cardRight === true && ar.dockLeft === true);
  await sleep(2500);
  await shot(page, "10-arabic");
  await page.click(".lift-call");
  await page.waitForSelector("dialog.lift-panel[open]");
  check("floor names are Arabic in the selector", /[\u0600-\u06FF]{3,}/.test(await text(page, ".lift-buttons button .lb-name")));
  await shot(page, "11-arabic-lift");
  await page.keyboard.press("Escape");
  await page.click(".top .lang");
  await sleep(500);

  // repeated lift rides through every floor
  const order = [
    [/Electrical/, "electrical"],
    [/Mechanical/, "mechanical"],
    [/Fabrication/, "fabrication"],
    [/Civil/, "civil"],
    [/Industrial ICT/, "ict"],
    [/Digital Manufacturing/, "digital"],
    [/Cooling Towers/, "roof"],
    [/About FAST/, "about"],
    [/Reception/, "arrival"],
    [/Electrical/, "electrical"],
  ];
  const rides = [];
  for (const [re, id] of order) {
    const r = await ride(page, re, id);
    rides.push({ id, ...r });
    await sleep(1400);
    if (["mechanical", "civil", "digital", "ict", "fabrication", "electrical"].includes(id) && !fs.existsSync(path.join(out, `floor-${id}.jpg`))) {
      await page.evaluate(() => window.__fast.engine.goStation(2));
      await settle(page);
      await sleep(2600);
      await shot(page, `floor-${id}`);
    }
  }
  check("ten consecutive lift rides all arrive", rides.length === 10, rides.map((r) => `${r.id}:${r.ms}ms`).join(" "));
  check("no frame gap over 250 ms during any ride", Math.max(...rides.map((r) => r.worst)) < 250, rides.map((r) => `${r.id}:${r.worst}`).join(" "));

  // interrupted transitions: the latest choice wins
  await page.evaluate(() => {
    const e = window.__fast.engine;
    e.travel("fire");
    setTimeout(() => e.travel("mechanical"), 300);
    setTimeout(() => e.travel("civil"), 500);
  });
  await idle(page, "civil");
  check("changing floor mid-ride ends on the last choice", (await page.$eval(".stage", (s) => s.dataset.scene)) === "civil");
  await page.evaluate(() => {
    window.__fast.engine.travel("fire");
  });
  await page.waitForSelector('.stage[data-lift="opening"]', { timeout: 60000 });
  await page.evaluate(() => {
    window.__fast.engine.travel("ict");
  });
  await idle(page, "ict");
  check("choosing again while the doors open rides on to the new floor", (await page.$eval(".stage", (s) => s.dataset.scene)) === "ict");
  // interrupt a camera move with a reverse scroll
  await page.evaluate(() => window.__fast.engine.goStation(4));
  await sleep(700);
  await page.evaluate(() => window.__fast.engine.goStation(1));
  await settle(page);
  check("reversing during a camera move settles on the new stop", /1 \/ 5/.test(await eyebrow(page)), await eyebrow(page));

  // rooftop: explode, return to lift, farewell
  await ride(page, /Cooling Towers/, "roof");
  await sleep(1000);
  await shot(page, "12-roof-arrive");
  await page.evaluate(() => window.__fast.engine.goStation(3));
  await settle(page);
  await sleep(3500);
  await shot(page, "13-roof-exploded");
  await page.evaluate(() => window.__fast.engine.goStation(7));
  await page.waitForSelector(".farewell", { timeout: 40000 }).catch(() => {});
  check("past the last cooling-tower stop the drone pull-out starts by itself", (await page.$(".farewell")) !== null && (await page.$(".card.finale")) === null);
  await sleep(13500);
  const fare = await page.evaluate(() => ({ flight: window.__fast.engine.current.flight, txt: document.querySelector(".farewell h2")?.innerText ?? "", y: window.__fast.engine.camera.position.y }));
  check("skyline farewell flies out and shows the closing message", fare.flight >= 11.5 && /Thank you/i.test(fare.txt) && fare.y > 30, JSON.stringify(fare));
  await shot(page, "16-farewell");
  await clickText(page, ".farewell .btn", /Back to the rooftop/);
  await page.waitForFunction(() => !document.querySelector(".farewell") && /6 \/ 6/.test(document.querySelector(".card .eyebrow, .card-eyebrow")?.innerText ?? document.querySelector(".card")?.innerText ?? ""), { timeout: 30000 }).catch(() => {});
  check("back to the rooftop returns to the last cooling-tower stop", (await page.$(".farewell")) === null && /6 \/ 6/.test(await eyebrow(page)), await eyebrow(page));
  check("no runtime errors on desktop", d.errors.length === 0, d.errors.join(" | "));
  await page.close();

  // ------------------------------------------------------------------ reduced motion: fast route
  const r = await open(BASE, { reduced: true });
  await r.page.waitForSelector(".lite h1", { timeout: 20000 });
  const lite = await r.page.evaluate(() => ({
    canvas: !!document.querySelector("canvas"),
    floors: document.querySelectorAll(".lite-floor").length,
    links: [...document.querySelectorAll(".lite-floor a.btn")].filter((a) => /fast-arabia\.com\/services/.test(a.href)).length,
    mail: !!document.querySelector('.lite a[href^="mailto:"]'),
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  }));
  check("reduced motion starts in the still overview with no WebGL", !lite.canvas && lite.floors === 8, JSON.stringify(lite));
  check("overview links every service to its official page and has contact", lite.links >= 8 && lite.mail);
  await shot(r.page, "20-overview");
  await clickText(r.page, ".lite .btn", /Enter the 3D tour/);
  await ready(r.page).catch(() => {});
  check("overview can opt in to the 3D tour", (await r.page.$('.stage[data-ready="true"]')) !== null);
  check("no runtime errors in the overview", r.errors.length === 0, r.errors.join(" | "));
  await r.page.close();

  // ------------------------------------------------------------------ no WebGL: falls back to the overview
  const n = await open(BASE, { init: "HTMLCanvasElement.prototype.getContext = function(){ return null; };" });
  await n.page.waitForSelector(".lite h1", { timeout: 30000 }).catch(() => {});
  check("without WebGL the complete overview is shown", (await n.page.$(".lite h1")) !== null && /3D is not available/i.test(await text(n.page, ".lite .note")));
  await n.page.close();

  // ------------------------------------------------------------------ phone
  const mob = await open(BASE + "?probe", {
    viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  });
  const mp = mob.page;
  await ready(mp);
  await sleep(1500);
  await shot(mp, "30-phone-street");
  const swipe = async () => {
    await mob.cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 420 }] });
    for (let k = 1; k <= 12; k++) {
      await mob.cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: 420 - k * 26 }] });
      await sleep(16);
    }
    await mob.cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await sleep(350);
  };
  const m1 = await title(mp);
  for (let i = 0; i < 30; i++) {
    await swipe();
    await settle(mp); // the card is hidden while the camera travels between stops
    await sleep(300);
    const now = await title(mp);
    if (now && now !== m1) break;
  }
  await settle(mp);
  await sleep(500);
  const m2 = await title(mp);
  check("phone: swiping walks the visitor in", m1 !== m2 && m2.length > 0, `${m1} -> ${m2}`);
  const fit = await mp.evaluate(() => {
    const c = document.querySelector(".card")?.getBoundingClientRect();
    return !!c && c.left >= 0 && c.right <= innerWidth && c.bottom <= innerHeight && c.height < innerHeight * 0.5;
  });
  check("phone: the text card fits the lower part of the screen", fit);
  await mp.tap(".lift-call");
  await mp.waitForSelector("dialog.lift-panel[open]");
  await shot(mp, "31-phone-lift");
  await clickText(mp, ".lift-buttons button", /Mechanical/);
  await idle(mp, "mechanical");
  await sleep(1200);
  await mp.evaluate(() => window.__fast.engine.goStation(1));
  await settle(mp);
  await sleep(3000);
  await shot(mp, "32-phone-mechanical");
  check("phone: lift ride to a floor works", /Mechanical/i.test(await eyebrow(mp)), await eyebrow(mp));
  await mp.tap(".top .lang");
  await sleep(1500);
  await shot(mp, "33-phone-arabic");
  check("phone: Arabic layout applies", (await mp.evaluate(() => document.documentElement.dir)) === "rtl");
  check("no runtime errors on phone", mob.errors.length === 0, mob.errors.join(" | "));
  await mp.close();
} catch (e) {
  check("test run completed", false, String(e).slice(0, 300));
  console.log(String(e.stack).split(/\n/).filter((l) => /test\.mjs/.test(l)).join(" | "));
}
await browser.close();
const failed = results.filter((r) => !r.pass);
fs.writeFileSync(path.join(out, "..", "test-report.json"), JSON.stringify({ when: new Date().toISOString(), passed: results.length - failed.length, failed: failed.length, results }, null, 1));
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
