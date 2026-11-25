import { CanvasTexture, LinearMipmapLinearFilter, Mesh, MeshBasicMaterial, Object3D, SRGBColorSpace } from "three";
import { effect } from "@preact/signals";
import { certificates, partners, registrations } from "../content/about";
import { company } from "../content/company";
import { floors } from "../content/floors";
import { lang } from "../state";
import { url } from "./assets";
import { fontFor } from "./signs";

/**
 * The five walls of Level 01. Each is a canvas drawn from the same content the About viewer uses:
 * the real certificate scans, the real logos of the organisations FAST is registered with, the partners.
 */
const W = 1700;
const H = 1275;
const images = new Map<string, Promise<ImageBitmap | null>>();
const img = (path: string) => {
  let p = images.get(path);
  if (!p) {
    p = fetch(url(path))
      .then((r) => r.blob())
      .then((b) => createImageBitmap(b))
      .catch(() => null);
    images.set(path, p);
  }
  return p;
};

type Ctx = CanvasRenderingContext2D;

function wrap(x: Ctx, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (x.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function header(x: Ctx, rtl: boolean, l: "en" | "ar", kicker: string, title: string, accent: string) {
  x.fillStyle = "#151a20";
  x.fillRect(0, 0, W, H);
  x.direction = rtl ? "rtl" : "ltr";
  x.textAlign = rtl ? "right" : "left";
  x.textBaseline = "alphabetic";
  const ex = rtl ? W - 90 : 90;
  x.fillStyle = accent;
  x.font = `600 34px ${fontFor(l)}`;
  x.fillText(kicker, ex, 120);
  x.fillStyle = "#f5f2ea";
  x.font = `600 84px ${fontFor(l)}`;
  x.fillText(title, ex, 222);
  x.fillStyle = accent;
  x.fillRect(rtl ? W - 90 - 150 : 90, 256, 150, 8);
  return ex;
}

function contain(x: Ctx, im: ImageBitmap, bx: number, by: number, bw: number, bh: number) {
  const s = Math.min(bw / im.width, bh / im.height);
  x.drawImage(im, bx + (bw - im.width * s) / 2, by + (bh - im.height * s) / 2, im.width * s, im.height * s);
}

async function logoGrid(x: Ctx, items: { logo: string }[], cols: number, top: number) {
  const pad = 90;
  const gap = 22;
  const rows = Math.ceil(items.length / cols);
  const cw = (W - pad * 2 - gap * (cols - 1)) / cols;
  const ch = Math.min(240, (H - top - 80 - gap * (rows - 1)) / rows);
  const ims = await Promise.all(items.map((i) => img(i.logo)));
  items.forEach((_, i) => {
    const cx = pad + (i % cols) * (cw + gap);
    const cy = top + Math.floor(i / cols) * (ch + gap);
    x.fillStyle = "#ffffff";
    x.beginPath();
    x.roundRect(cx, cy, cw, ch, 14);
    x.fill();
    const im = ims[i];
    if (im) contain(x, im, cx + 26, cy + 22, cw - 52, ch - 44);
  });
}

const PAINT: Record<string, (x: Ctx, l: "en" | "ar", rtl: boolean) => Promise<void>> = {
  async about_story(x, l, rtl) {
    const f = floors[0];
    const ex = header(x, rtl, l, l === "ar" ? "الطابق 01 · عن فاست" : "LEVEL 01 · ABOUT FAST", f.stations[0].title[l], f.accent);
    const logo = await img("brand/fast-logo-hd.png");
    const photo = await img("photos/about-1.webp");
    const colW = W * 0.5 - 110;
    x.fillStyle = "rgba(245,242,234,0.86)";
    x.font = `400 40px ${fontFor(l)}`;
    let y = 350;
    for (const line of wrap(x, company.intro[l], colW)) {
      x.fillText(line, ex, y);
      y += l === "ar" ? 68 : 58;
      if (y > H - 250) break;
    }
    if (logo) {
      const lx = rtl ? W - 90 - 400 : 90;
      x.fillStyle = "#f6f8fa";
      x.beginPath();
      x.roundRect(lx, H - 226, 400, 150, 16);
      x.fill();
      contain(x, logo, lx + 32, H - 204, 336, 106);
    }
    if (photo) {
      const bx = rtl ? 90 : W * 0.5 + 40;
      const bw = W * 0.5 - 130;
      const bh = H - 420;
      const s = Math.max(bw / photo.width, bh / photo.height);
      x.save();
      x.beginPath();
      x.roundRect(bx, 320, bw, bh, 18);
      x.clip();
      x.drawImage(photo, bx + (bw - photo.width * s) / 2, 320 + (bh - photo.height * s) / 2, photo.width * s, photo.height * s);
      x.restore();
    }
  },
  async about_credentials(x, l, rtl) {
    const f = floors[0];
    header(x, rtl, l, l === "ar" ? "الاعتمادات" : "CREDENTIALS", f.stations[1].title[l], f.accent);
    const certs = certificates.filter((c) => c.image);
    const ims = await Promise.all(certs.map((c) => img(c.image!)));
    const pad = 90;
    const gap = 24;
    const cw = (W - pad * 2 - gap * (certs.length - 1)) / certs.length;
    const chh = cw * 1.38;
    certs.forEach((_, i) => {
      const cx = pad + i * (cw + gap);
      x.fillStyle = "#fff";
      x.fillRect(cx, 320, cw, chh);
      const im = ims[i];
      if (im) contain(x, im, cx + 8, 328, cw - 16, chh - 16);
    });
    // credential badges exactly as printed in the company profile
    const facts = company.facts.slice(2);
    const fy = 320 + chh + 46;
    const fw = (W - pad * 2 - gap * (facts.length - 1)) / facts.length;
    x.textAlign = "center";
    facts.forEach((fc, i) => {
      const cx = pad + i * (fw + gap);
      x.fillStyle = "rgba(255,255,255,0.07)";
      x.beginPath();
      x.roundRect(cx, fy, fw, H - fy - 70, 14);
      x.fill();
      // both rows are fitted to the box: wrap to two lines, then shrink until the widest line fits
      const fitted = (text: string, weight: number, size: number) => {
        let lines: string[] = [];
        for (let s = size; s >= 18; s -= 2) {
          x.font = `${weight} ${s}px ${fontFor(l)}`;
          lines = wrap(x, text, fw - 36);
          if (lines.length <= 2 && lines.every((ln) => x.measureText(ln).width <= fw - 36)) break;
        }
        return lines.slice(0, 2);
      };
      x.fillStyle = "rgba(245,242,234,0.6)";
      const lab = fitted(fc.label[l], 500, 26);
      lab.forEach((ln, k) => x.fillText(ln, cx + fw / 2, fy + (lab.length === 1 ? 66 : 50) + k * 32));
      x.fillStyle = "#f5f2ea";
      const v = fitted(fc.value[l], 600, 31);
      v.forEach((ln, k) => x.fillText(ln, cx + fw / 2, fy + 132 + k * 40));
    });
  },
  async about_registrations(x, l, rtl) {
    const f = floors[0];
    header(x, rtl, l, l === "ar" ? "بوابات الموردين" : "SUPPLIER PORTALS", f.stations[2].title[l], f.accent);
    await logoGrid(x, registrations, 5, 330);
  },
  async about_partners(x, l, rtl) {
    const f = floors[0];
    header(x, rtl, l, l === "ar" ? "شركاء التقنية" : "TECHNOLOGY PARTNERS", f.stations[3].title[l], f.accent);
    await logoGrid(x, partners, 5, 330);
  },
  async about_sectors(x, l, rtl) {
    const f = floors[0];
    const ex = header(x, rtl, l, l === "ar" ? "القطاعات" : "SECTORS", f.stations[4].title[l], f.accent);
    const rows = company.sectors;
    const top = 330;
    const rh = (H - top - 90) / rows.length;
    rows.forEach((s, i) => {
      const y = top + i * rh;
      x.fillStyle = "rgba(255,255,255,0.12)";
      x.fillRect(90, y, W - 180, 2);
      x.fillStyle = f.accent;
      x.font = `600 34px "Sora Variable", sans-serif`;
      x.direction = "ltr";
      x.fillText(String(i + 1).padStart(2, "0"), ex, y + rh * 0.66);
      x.direction = rtl ? "rtl" : "ltr";
      x.fillStyle = "#f5f2ea";
      x.font = `600 60px ${fontFor(l)}`;
      x.fillText(s[l], rtl ? ex - 110 : ex + 110, y + rh * 0.7);
    });
  },
};

/** Caption plates on the two museum cases. */
function caption(x: Ctx, l: "en" | "ar", title: string, sub: string) {
  const [cw, ch] = [1024, 256];
  x.fillStyle = "#14181d";
  x.fillRect(0, 0, cw, ch);
  x.direction = l === "ar" ? "rtl" : "ltr";
  x.textAlign = "center";
  x.textBaseline = "alphabetic";
  const fit = (text: string, weight: number, size: number) => {
    for (let s = size; s >= 20; s -= 2) {
      x.font = `${weight} ${s}px ${fontFor(l)}`;
      if (x.measureText(text).width <= cw - 70) break;
    }
  };
  x.fillStyle = "#f5f2ea";
  fit(title, 600, 76);
  x.fillText(title, cw / 2, 118);
  x.fillStyle = "rgba(245,242,234,0.72)";
  fit(sub, 400, 44);
  x.fillText(sub, cw / 2, 190);
}
PAINT.cap_tower = async (x, l) =>
  caption(x, l, l === "ar" ? "بوابة بالحمر للأعمال" : "Balhamer Business Gate", l === "ar" ? "المقر الرئيسي لفاست · الدمام" : "FAST head office · Dammam");
PAINT.cap_plant = async (x, l) =>
  caption(x, l, l === "ar" ? "نموذج منشأة صناعية" : "Process plant model", l === "ar" ? "المنشآت التي تبنيها فاست وتصونها وتطوّرها" : "The kind of site FAST builds, maintains and upgrades");
const SIZE: Record<string, [number, number]> = { cap_tower: [1024, 256], cap_plant: [1024, 256] };

/** Attach the wall canvases to the About exhibit; redraws when the language changes. */
export function attachAboutWalls(root: Object3D) {
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const name = (mesh.material as MeshBasicMaterial).name?.replace(/^sign_/, "");
    const paint = PAINT[name];
    if (!paint) return;
    const c = document.createElement("canvas");
    [c.width, c.height] = SIZE[name] ?? [W, H];
    const tex = new CanvasTexture(c);
    tex.flipY = false;
    tex.colorSpace = SRGBColorSpace;
    tex.minFilter = LinearMipmapLinearFilter;
    tex.anisotropy = 8;
    mesh.material = new MeshBasicMaterial({ map: tex, toneMapped: false });
    const x = c.getContext("2d")!;
    let run = 0;
    const draw = () => {
      const id = ++run;
      const l = lang.value;
      void paint(x, l, l === "ar").then(() => {
        if (id === run) tex.needsUpdate = true;
      });
    };
    effect(draw);
    document.fonts?.ready.then(draw);
  });
}
