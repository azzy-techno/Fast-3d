import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, Matrix4, Object3D, Points, PointsMaterial, Vector3 } from "three";
import type { Marker } from "./scene";

let dotTex: CanvasTexture | null = null;
function dot() {
  if (!dotTex) {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.7)");
    g.addColorStop(0.6, "rgba(255,255,255,0.16)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    dotTex = new CanvasTexture(c);
  }
  return dotTex;
}

/** Light pulses travelling along a path: power in a cable, water in a pipe, data on a link. */
export class Flow {
  readonly points: Points;
  private cum: number[] = [0];
  private path: Vector3[] = [];
  private length = 0;
  private n: number;
  private speed: number;
  /** 0..1: how much of the path is energised (lets a floor "switch on" a section at a stop). */
  reach = 1;
  gain = 1;

  constructor(mk: Marker, matrix: Matrix4) {
    const flat = mk.data.pts as number[];
    for (let i = 0; i < flat.length; i += 3) this.path.push(new Vector3(flat[i], flat[i + 1], flat[i + 2]).applyMatrix4(matrix));
    for (let i = 1; i < this.path.length; i++) {
      this.length += this.path[i].distanceTo(this.path[i - 1]);
      this.cum.push(this.length);
    }
    this.n = Number(mk.data.count ?? 6);
    this.speed = Number(mk.data.speed ?? 2);
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(this.n * 3), 3));
    const m = new PointsMaterial({
      map: dot(),
      color: new Color(String(mk.data.color ?? "#27a8ee")),
      size: Number(mk.data.size ?? 0.18),
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      fog: false,
      toneMapped: false,
    });
    this.points = new Points(g, m);
    this.points.frustumCulled = false;
    this.points.renderOrder = 6;
  }

  update(t: number) {
    const pos = this.points.geometry.attributes.position as BufferAttribute;
    const L = this.length * this.reach;
    for (let i = 0; i < this.n; i++) {
      const d = (((t * this.speed) / Math.max(1, this.length) + i / this.n) % 1) * this.length;
      if (d > L) {
        pos.setXYZ(i, 0, -999, 0);
        continue;
      }
      let k = 1;
      while (k < this.cum.length - 1 && this.cum[k] < d) k++;
      const a = this.path[k - 1];
      const b = this.path[k];
      const f = (d - this.cum[k - 1]) / Math.max(1e-5, this.cum[k] - this.cum[k - 1]);
      pos.setXYZ(i, a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, a.z + (b.z - a.z) * f);
    }
    pos.needsUpdate = true;
    (this.points.material as PointsMaterial).opacity = this.gain;
  }
}

export type Spinner = { node: Object3D; axis: Vector3; speed: number };

/** Collect nodes the Blender scripts tagged with a `spin` property ([x, y, z, rad/s] in three.js axes). */
export function collectSpinners(root: Object3D): Spinner[] {
  const out: Spinner[] = [];
  root.traverse((o) => {
    const s = o.userData.spin as number[] | undefined;
    if (s && !(o as { isMesh?: boolean }).isMesh) {
      o.userData.movable = true;
      o.traverse((c) => (c.matrixAutoUpdate = true));
      out.push({ node: o, axis: new Vector3(s[0], s[1], s[2]).normalize(), speed: s[3] });
    }
  });
  return out;
}
