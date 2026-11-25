import { CanvasTexture, SRGBColorSpace, LinearMipmapLinearFilter } from "three";
import { effect } from "@preact/signals";
import { floors } from "../content/floors";
import { lang } from "../state";
import { url } from "./assets";

const FONT_LATIN = `"Sora Variable", "Plus Jakarta Sans Variable", system-ui, sans-serif`;
const FONT_AR = `"Cairo", "Segoe UI", Tahoma, sans-serif`;
export const fontFor = (l: string) => (l === "ar" ? FONT_AR : FONT_LATIN);

function finish(c: HTMLCanvasElement) {
  const t = new CanvasTexture(c);
  t.flipY = false; // matches glTF UVs
  t.colorSpace = SRGBColorSpace;
  t.minFilter = LinearMipmapLinearFilter;
  t.anisotropy = 4;
  return t;
}

const bitmaps = new Map<string, Promise<ImageBitmap>>();
const bitmap = (path: string) => {
  let p = bitmaps.get(path);
  if (!p) {
    p = fetch(url(path))
      .then((r) => r.blob())
      .then((b) => createImageBitmap(b));
    bitmaps.set(path, p);
  }
  return p;
};

/** The logo centred on a transparent plate of the given aspect, so it is never stretched. */
export async function logoTexture(path: string, aspect: number, pad = 0.04, plate = "") {
  const img = await bitmap(path);
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = Math.round(1024 / aspect);
  const x = c.getContext("2d")!;
  if (plate) {
    // a light sign face, so the logo keeps its own colours on a dark wall
    x.fillStyle = plate;
    x.beginPath();
    x.roundRect(0, 0, c.width, c.height, c.height * 0.1);
    x.fill();
  }
  const s = Math.min((c.width * (1 - pad * 2)) / img.width, (c.height * (1 - pad * 2)) / img.height);
  const w = img.width * s;
  const h = img.height * s;
  x.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
  return finish(c);
}

/** A two-line name plate (title above, name below) that follows the visitor's language. */
export function nameplateTexture(title: { en: string; ar: string }, name: { en: string; ar: string }) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 198;
  const tex = finish(c);
  const draw = () => {
    const l = lang.value;
    const x = c.getContext("2d")!;
    x.fillStyle = "#15181c";
    x.fillRect(0, 0, c.width, c.height);
    x.direction = l === "ar" ? "rtl" : "ltr";
    x.textAlign = "center";
    x.textBaseline = "alphabetic";
    const fit = (text: string, weight: number, size: number) => {
      for (let s = size; s >= 18; s -= 2) {
        x.font = `${weight} ${s}px ${fontFor(l)}`;
        if (x.measureText(text).width <= c.width - 60) break;
      }
    };
    x.fillStyle = "#c9a55a";
    fit(title[l], 500, 44);
    x.fillText(title[l], c.width / 2, 78);
    x.fillStyle = "#f5f2ea";
    fit(name[l], 600, 58);
    x.fillText(name[l], c.width / 2, 152);
    tex.needsUpdate = true;
  };
  effect(draw);
  document.fonts?.ready.then(draw);
  return tex;
}

/** Lift-lobby directory: every floor, in the visitor's language. Redraws when the language changes. */
export function directoryTexture() {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 820;
  const tex = finish(c);
  const draw = () => {
    const l = lang.value;
    const rtl = l === "ar";
    const x = c.getContext("2d")!;
    x.fillStyle = "#14181d";
    x.fillRect(0, 0, c.width, c.height);
    x.direction = rtl ? "rtl" : "ltr";
    x.textBaseline = "middle";
    x.fillStyle = "#7fc4f2";
    x.font = `600 30px ${fontFor(l)}`;
    x.textAlign = rtl ? "right" : "left";
    const edge = rtl ? c.width - 56 : 56;
    x.fillText(rtl ? "دليل الطوابق" : "FLOOR DIRECTORY", edge, 64);
    x.fillStyle = "rgba(255,255,255,0.16)";
    x.fillRect(56, 104, c.width - 112, 2);
    const rows = [...floors].reverse();
    rows.forEach((f, i) => {
      const y = 152 + i * 70;
      x.fillStyle = f.accent;
      x.fillRect(rtl ? c.width - 56 - 6 : 56, y - 20, 6, 40);
      x.fillStyle = "#ffffff";
      x.font = `600 34px ${FONT_LATIN}`;
      x.textAlign = rtl ? "right" : "left";
      x.direction = "ltr";
      x.fillText(f.level, rtl ? c.width - 84 : 84, y);
      x.direction = rtl ? "rtl" : "ltr";
      x.font = `500 30px ${fontFor(l)}`;
      x.fillStyle = "rgba(255,255,255,0.86)";
      x.fillText(f.name[l], rtl ? c.width - 170 : 170, y);
    });
    const y = 152 + rows.length * 70;
    x.fillStyle = "rgba(255,255,255,0.5)";
    x.font = `600 34px ${FONT_LATIN}`;
    x.direction = "ltr";
    x.fillText("G", rtl ? c.width - 84 : 84, y);
    x.direction = rtl ? "rtl" : "ltr";
    x.font = `500 30px ${fontFor(l)}`;
    x.fillText(rtl ? "الاستقبال" : "Reception", rtl ? c.width - 170 : 170, y);
    tex.needsUpdate = true;
  };
  effect(draw);
  document.fonts?.ready.then(draw);
  return tex;
}

/**
 * Feature-wall graphic for a gallery floor: level numeral, service name and a rule in the floor's accent.
 * Drawn at runtime so it follows the language and stays sharp.
 */
export function floorSignTexture(level: string, name: { en: string; ar: string }, accent: string, aspect = 3) {
  const c = document.createElement("canvas");
  c.width = 1536;
  c.height = Math.round(1536 / aspect);
  const tex = finish(c);
  const draw = () => {
    const l = lang.value;
    const rtl = l === "ar";
    const x = c.getContext("2d")!;
    x.clearRect(0, 0, c.width, c.height);
    const H = c.height;
    x.textBaseline = "alphabetic";
    x.direction = "ltr";
    x.fillStyle = accent;
    x.font = `700 ${Math.round(H * 0.78)}px ${FONT_LATIN}`;
    x.textAlign = rtl ? "right" : "left";
    const numX = rtl ? c.width - 40 : 40;
    x.fillText(level, numX, H * 0.8);
    const numW = x.measureText(level).width;
    x.fillStyle = "#f4f1ea";
    x.direction = rtl ? "rtl" : "ltr";
    let size = Math.round(H * 0.3);
    x.font = `600 ${size}px ${fontFor(l)}`;
    const avail = c.width - numW - 150;
    const label = rtl ? name.ar : name.en.toUpperCase();
    while (x.measureText(label).width > avail && size > 40) {
      size -= 6;
      x.font = `600 ${size}px ${fontFor(l)}`;
    }
    const tx = rtl ? c.width - numW - 100 : numW + 100;
    x.fillText(label, tx, H * 0.62);
    x.fillStyle = accent;
    const ruleW = Math.min(avail, 420);
    x.fillRect(rtl ? tx - ruleW : tx, H * 0.72, ruleW, Math.max(6, H * 0.022));
    tex.needsUpdate = true;
  };
  effect(draw);
  document.fonts?.ready.then(draw);
  return tex;
}
