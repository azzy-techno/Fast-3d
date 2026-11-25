import { CanvasTexture, LinearFilter, Mesh, MeshBasicMaterial, Object3D, SRGBColorSpace } from "three";

/**
 * Displays in the exhibits. Everything drawn here is a schematic illustration of what such a screen shows;
 * none of it is a reading from a real plant, and the layouts avoid numbers that could read as claims.
 */
type Painter = (x: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

const BG = "#07131d";
const INK = "#cfe6f5";
const DIM = "rgba(160,200,225,0.35)";
const BLUE = "#27a8ee";
const GREEN = "#3fe08f";
const AMBER = "#ffb53a";
const FONT = `"Sora Variable", system-ui, sans-serif`;

const frame = (x: CanvasRenderingContext2D, w: number, h: number, title: string) => {
  x.fillStyle = BG;
  x.fillRect(0, 0, w, h);
  x.fillStyle = "rgba(39,168,238,0.14)";
  x.fillRect(0, 0, w, h * 0.13);
  x.fillStyle = INK;
  x.font = `600 ${Math.round(h * 0.06)}px ${FONT}`;
  x.textBaseline = "middle";
  x.fillText(title, w * 0.03, h * 0.066);
  x.fillStyle = GREEN;
  x.beginPath();
  x.arc(w * 0.96, h * 0.066, h * 0.018, 0, 6.3);
  x.fill();
};
const n1 = (i: number, t: number) => 0.5 + 0.5 * Math.sin(i * 1.7 + t * 0.6) * Math.cos(i * 0.6 - t * 0.31);

const trend: Painter = (x, w, h, t) => {
  x.strokeStyle = DIM;
  x.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    x.beginPath();
    x.moveTo(0, (h * i) / 5);
    x.lineTo(w, (h * i) / 5);
    x.stroke();
  }
  for (const [col, ph] of [
    [BLUE, 0],
    [GREEN, 2.1],
  ] as const) {
    x.strokeStyle = col;
    x.lineWidth = Math.max(2, h * 0.012);
    x.beginPath();
    for (let i = 0; i <= 40; i++) {
      const y = h * (0.2 + 0.6 * n1(i * 0.5 + ph, t));
      if (i) x.lineTo((w * i) / 40, y);
      else x.moveTo(0, y);
    }
    x.stroke();
  }
};
const bars: Painter = (x, w, h, t) => {
  const n = 9;
  for (let i = 0; i < n; i++) {
    const v = 0.25 + 0.7 * n1(i, t);
    x.fillStyle = i % 3 === 0 ? AMBER : BLUE;
    x.fillRect((w * (i + 0.2)) / n, h * (1 - v), (w * 0.6) / n, h * v);
  }
};
const ring = (x: CanvasRenderingContext2D, cx: number, cy: number, r: number, v: number, col: string) => {
  x.lineWidth = r * 0.24;
  x.strokeStyle = DIM;
  x.beginPath();
  x.arc(cx, cy, r, 0, 6.3);
  x.stroke();
  x.strokeStyle = col;
  x.beginPath();
  x.arc(cx, cy, r, -1.57, -1.57 + 6.28 * v);
  x.stroke();
};
const sub = (x: CanvasRenderingContext2D, rx: number, ry: number, rw: number, rh: number, p: Painter, t: number) => {
  x.save();
  x.translate(rx, ry);
  x.beginPath();
  x.rect(0, 0, rw, rh);
  x.clip();
  p(x, rw, rh, t);
  x.restore();
};

const PAINTERS: Record<string, Painter> = {
  oee(x, w, h, t) {
    frame(x, w, h, "PRODUCTION OVERVIEW  ·  DEMO");
    const cols = [GREEN, BLUE, AMBER];
    ["AVAILABILITY", "PERFORMANCE", "QUALITY"].forEach((l, i) => {
      ring(x, w * (0.14 + i * 0.2), h * 0.42, h * 0.13, 0.62 + 0.3 * n1(i * 3, t * 0.4), cols[i]);
      x.fillStyle = INK;
      x.font = `500 ${Math.round(h * 0.04)}px ${FONT}`;
      x.textAlign = "center";
      x.fillText(l, w * (0.14 + i * 0.2), h * 0.66);
      x.textAlign = "left";
    });
    sub(x, w * 0.66, h * 0.2, w * 0.31, h * 0.5, bars, t);
    sub(x, w * 0.03, h * 0.74, w * 0.94, h * 0.22, trend, t);
  },
  scada(x, w, h, t) {
    frame(x, w, h, "SCADA  ·  DEMO");
    x.strokeStyle = BLUE;
    x.lineWidth = h * 0.02;
    x.strokeRect(w * 0.08, h * 0.3, w * 0.16, h * 0.4);
    x.strokeRect(w * 0.72, h * 0.3, w * 0.16, h * 0.4);
    x.fillStyle = "rgba(39,168,238,0.5)";
    const lv = 0.2 + 0.6 * n1(1, t);
    x.fillRect(w * 0.08, h * (0.7 - 0.4 * lv), w * 0.16, h * 0.4 * lv);
    x.fillRect(w * 0.72, h * (0.3 + 0.4 * lv * 0.6), w * 0.16, h * 0.4 * (1 - lv * 0.6));
    x.beginPath();
    x.moveTo(w * 0.24, h * 0.6);
    x.lineTo(w * 0.72, h * 0.6);
    x.stroke();
    x.fillStyle = GREEN;
    x.beginPath();
    x.arc(w * (0.3 + 0.38 * ((t * 0.25) % 1)), h * 0.6, h * 0.03, 0, 6.3);
    x.fill();
    x.strokeStyle = AMBER;
    x.beginPath();
    x.arc(w * 0.48, h * 0.6, h * 0.07, 0, 6.3);
    x.stroke();
    sub(x, w * 0.05, h * 0.78, w * 0.9, h * 0.18, trend, t);
  },
  mes(x, w, h, t) {
    frame(x, w, h, "MES  ·  WORK ORDERS  ·  DEMO");
    for (let i = 0; i < 6; i++) {
      const y = h * (0.2 + i * 0.13);
      x.fillStyle = i % 2 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)";
      x.fillRect(w * 0.03, y, w * 0.94, h * 0.11);
      x.fillStyle = DIM;
      x.fillRect(w * 0.05, y + h * 0.04, w * 0.2, h * 0.03);
      x.fillRect(w * 0.3, y + h * 0.04, w * 0.14, h * 0.03);
      x.fillStyle = [GREEN, BLUE, AMBER][(i + Math.floor(t * 0.2)) % 3];
      x.fillRect(w * 0.52, y + h * 0.035, w * 0.4 * (0.3 + 0.7 * n1(i, t * 0.3)), h * 0.04);
    }
  },
  ems(x, w, h, t) {
    frame(x, w, h, "ENERGY  ·  DEMO");
    sub(x, w * 0.05, h * 0.2, w * 0.9, h * 0.42, bars, t);
    sub(x, w * 0.05, h * 0.68, w * 0.9, h * 0.28, trend, t + 9);
  },
  vision(x, w, h, t) {
    frame(x, w, h, "VISION INSPECTION  ·  DEMO");
    const bx = w * (0.15 + 0.5 * ((t * 0.18) % 1));
    x.fillStyle = "#8a6b46";
    x.fillRect(bx, h * 0.38, w * 0.22, h * 0.34);
    x.fillStyle = "rgba(0,0,0,0.25)";
    x.fillRect(bx, h * 0.5, w * 0.22, h * 0.03);
    x.strokeStyle = GREEN;
    x.lineWidth = h * 0.012;
    x.strokeRect(bx - w * 0.02, h * 0.34, w * 0.26, h * 0.42);
    x.fillStyle = GREEN;
    x.font = `600 ${Math.round(h * 0.07)}px ${FONT}`;
    x.fillText("PASS", bx - w * 0.02, h * 0.28);
    x.fillStyle = DIM;
    x.fillRect(0, h * 0.86, w, h * 0.01);
  },
  cctv(x, w, h, t) {
    x.fillStyle = "#03080c";
    x.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      const ox = (i % 2) * (w / 2);
      const oy = Math.floor(i / 2) * (h / 2);
      const g = x.createLinearGradient(ox, oy, ox, oy + h / 2);
      g.addColorStop(0, ["#1b2a36", "#232a25", "#2a2620", "#1c2430"][i]);
      g.addColorStop(1, "#0a1016");
      x.fillStyle = g;
      x.fillRect(ox + 3, oy + 3, w / 2 - 6, h / 2 - 6);
      // perspective floor lines, a tracked figure
      x.strokeStyle = "rgba(255,255,255,0.08)";
      x.lineWidth = 1;
      for (let k = 0; k < 5; k++) {
        x.beginPath();
        x.moveTo(ox + (w / 2) * (k / 4), oy + h / 2);
        x.lineTo(ox + w / 4 + (w / 8) * (k / 4 - 0.5), oy + h * 0.2);
        x.stroke();
      }
      const px = ox + (w / 2) * (0.2 + 0.6 * n1(i * 4, t * 0.5));
      const py = oy + h * 0.28;
      x.fillStyle = "rgba(230,240,250,0.75)";
      x.fillRect(px, py, w * 0.022, h * 0.1);
      x.strokeStyle = i === 1 ? AMBER : GREEN;
      x.lineWidth = 2;
      x.strokeRect(px - w * 0.012, py - h * 0.02, w * 0.046, h * 0.14);
      x.fillStyle = INK;
      x.font = `500 ${Math.round(h * 0.035)}px ${FONT}`;
      x.fillText(`CAM 0${i + 1}`, ox + 12, oy + h * 0.045);
      x.fillStyle = "#ff3b2b";
      if (Math.floor(t * 1.5) % 2) {
        x.beginPath();
        x.arc(ox + w / 2 - 18, oy + h * 0.04, h * 0.012, 0, 6.3);
        x.fill();
      }
    }
  },
  facp(x, w, h) {
    x.fillStyle = "#0d2a12";
    x.fillRect(0, 0, w, h);
    x.fillStyle = "#7dff9a";
    x.font = `600 ${Math.round(h * 0.3)}px ui-monospace, monospace`;
    x.textBaseline = "middle";
    x.fillText("SYSTEM NORMAL", w * 0.04, h * 0.33);
    x.fillText("ZONES 08  OK", w * 0.04, h * 0.72);
  },
  code(x, w, h, t) {
    x.fillStyle = "#0b1016";
    x.fillRect(0, 0, w, h);
    const cols = [BLUE, GREEN, AMBER, INK];
    for (let i = 0; i < 14; i++) {
      const y = h * (0.06 + i * 0.065);
      let cx = w * (0.04 + ((i * 7) % 4) * 0.03);
      for (let k = 0; k < 4; k++) {
        const len = w * (0.06 + 0.14 * n1(i * 5 + k, 0));
        x.fillStyle = cols[(i + k) % 4];
        x.globalAlpha = 0.75;
        x.fillRect(cx, y, len, h * 0.022);
        cx += len + w * 0.02;
        if (cx > w * 0.85) break;
      }
    }
    x.globalAlpha = 1;
    if (Math.floor(t * 2) % 2) {
      x.fillStyle = INK;
      x.fillRect(w * 0.3, h * 0.905, w * 0.01, h * 0.03);
    }
  },
  bi(x, w, h, t) {
    frame(x, w, h, "ANALYTICS  ·  DEMO");
    sub(x, w * 0.04, h * 0.2, w * 0.44, h * 0.74, bars, t);
    ring(x, w * 0.75, h * 0.45, h * 0.18, 0.5 + 0.4 * n1(2, t * 0.3), BLUE);
    sub(x, w * 0.54, h * 0.74, w * 0.42, h * 0.2, trend, t);
  },
  erp(x, w, h, t) {
    frame(x, w, h, "ERP  ·  DEMO");
    const tiles = ["FINANCE", "INVENTORY", "PROCUREMENT", "PROJECTS", "MAINTENANCE", "HR"];
    tiles.forEach((l, i) => {
      const tx = w * (0.04 + (i % 3) * 0.32);
      const ty = h * (0.2 + Math.floor(i / 3) * 0.39);
      x.fillStyle = "rgba(255,255,255,0.06)";
      x.fillRect(tx, ty, w * 0.29, h * 0.35);
      x.fillStyle = [BLUE, GREEN, AMBER][i % 3];
      x.fillRect(tx, ty, w * 0.008, h * 0.35);
      x.fillStyle = INK;
      x.font = `600 ${Math.round(h * 0.045)}px ${FONT}`;
      x.fillText(l, tx + w * 0.025, ty + h * 0.06);
      sub(x, tx + w * 0.025, ty + h * 0.12, w * 0.24, h * 0.2, i % 2 ? trend : bars, t + i * 3);
    });
  },
  smartboard(x, w, h, t) {
    frame(x, w, h, "NETWORK TOPOLOGY  ·  DEMO");
    const nodes: [number, number][] = [
      [0.5, 0.3],
      [0.2, 0.55],
      [0.5, 0.6],
      [0.8, 0.55],
      [0.1, 0.85],
      [0.3, 0.85],
      [0.5, 0.88],
      [0.7, 0.85],
      [0.9, 0.85],
    ];
    const links = [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 4],
      [1, 5],
      [2, 6],
      [3, 7],
      [3, 8],
    ];
    x.strokeStyle = DIM;
    x.lineWidth = 2;
    links.forEach(([a, b], i) => {
      x.beginPath();
      x.moveTo(nodes[a][0] * w, nodes[a][1] * h);
      x.lineTo(nodes[b][0] * w, nodes[b][1] * h);
      x.stroke();
      const u = (t * 0.4 + i * 0.13) % 1;
      x.fillStyle = BLUE;
      x.beginPath();
      x.arc((nodes[a][0] + (nodes[b][0] - nodes[a][0]) * u) * w, (nodes[a][1] + (nodes[b][1] - nodes[a][1]) * u) * h, h * 0.012, 0, 6.3);
      x.fill();
    });
    nodes.forEach(([nx, ny], i) => {
      x.fillStyle = i === 0 ? BLUE : "#1b3447";
      x.strokeStyle = GREEN;
      x.beginPath();
      x.arc(nx * w, ny * h, h * (i === 0 ? 0.05 : 0.032), 0, 6.3);
      x.fill();
      x.stroke();
    });
  },
};
const portrait =
  (title: string, shift: number): Painter =>
  (x, w, h, t) => {
    frame(x, w, h * 0.5, title);
    x.fillStyle = BG;
    x.fillRect(0, h * 0.065, w, h);
    for (let i = 0; i < 5; i++) {
      const y = h * (0.1 + i * 0.175);
      x.fillStyle = "rgba(255,255,255,0.06)";
      x.fillRect(w * 0.06, y, w * 0.88, h * 0.15);
      x.fillStyle = [BLUE, GREEN, AMBER][(i + shift) % 3];
      x.fillRect(w * 0.06, y, w * 0.02, h * 0.15);
      sub(x, w * 0.14, y + h * 0.03, w * 0.74, h * 0.09, (i + shift) % 2 ? trend : bars, t + i * 2 + shift);
    }
  };
PAINTERS.erp1 = portrait("FINANCE  ·  DEMO", 0);
PAINTERS.erp2 = portrait("SUPPLY CHAIN  ·  DEMO", 1);
PAINTERS.erp3 = portrait("MAINTENANCE  ·  DEMO", 2);

export class Screens {
  private list: { x: CanvasRenderingContext2D; tex: CanvasTexture; p: Painter; w: number; h: number }[] = [];
  private next = 0;
  private acc = 0;

  constructor(root: Object3D) {
    root.traverse((o) => {
      const name = o.userData.screen as string | undefined;
      const mesh = o as Mesh;
      if (!name || !mesh.isMesh || !PAINTERS[name]) return;
      mesh.geometry.computeBoundingBox();
      const bb = mesh.geometry.boundingBox!;
      const sx = bb.max.x - bb.min.x;
      const sy = bb.max.y - bb.min.y;
      const sz = bb.max.z - bb.min.z;
      const horiz = Math.max(sx, sz);
      const aspect = horiz / Math.max(0.01, sy);
      const c = document.createElement("canvas");
      c.width = aspect >= 1 ? 512 : Math.round(512 * aspect);
      c.height = aspect >= 1 ? Math.round(512 / aspect) : 512;
      const tex = new CanvasTexture(c);
      tex.flipY = false;
      tex.colorSpace = SRGBColorSpace;
      tex.generateMipmaps = false;
      tex.minFilter = LinearFilter;
      mesh.material = new MeshBasicMaterial({ map: tex, toneMapped: false });
      const x = c.getContext("2d")!;
      const entry = { x, tex, p: PAINTERS[name], w: c.width, h: c.height };
      entry.p(x, entry.w, entry.h, 0);
      this.list.push(entry);
    });
  }

  /** Redraw one screen every ~120 ms: cheap, and enough to feel alive. */
  update(dt: number, t: number) {
    if (!this.list.length) return;
    this.acc += dt;
    if (this.acc < 0.12) return;
    this.acc = 0;
    const s = this.list[this.next++ % this.list.length];
    s.p(s.x, s.w, s.h, t);
    s.tex.needsUpdate = true;
  }
}
