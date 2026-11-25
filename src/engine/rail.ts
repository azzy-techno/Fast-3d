import { CatmullRomCurve3, MathUtils, Vector3 } from "three";

export type Shot = {
  id: string;
  pos: Vector3;
  target: Vector3;
  fov: number;
  /** Scroll distance (px) the camera rests here. 0 = pass through without stopping. */
  hold: number;
  /** Index into the scene's stations, or -1. */
  station: number;
};

const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeIn = (t: number) => t * t * (1.6 - 0.6 * t);
const easeOut = (t: number) => 1 - easeIn(1 - t);

/**
 * A camera path through authored shots. Scroll distance maps to the path with a rest at every stop,
 * so each move starts gently and lands deliberately instead of drifting past.
 */
export class Rail {
  readonly centers: number[] = [];
  readonly length: number;
  private posCurve: CatmullRomCurve3 | null = null;
  private tgtCurve: CatmullRomCurve3 | null = null;

  constructor(readonly keys: Shot[]) {
    let x = 0;
    keys.forEach((k, i) => {
      if (i === 0) {
        this.centers.push(0);
        return;
      }
      const prev = keys[i - 1];
      const dist = prev.pos.distanceTo(k.pos) + prev.target.distanceTo(k.target) * 0.35;
      const travel = MathUtils.clamp(300 + dist * 46, 480, 1200);
      x += prev.hold / 2 + travel + k.hold / 2;
      this.centers.push(x);
    });
    this.length = x;
    if (keys.length > 1) {
      this.posCurve = new CatmullRomCurve3(
        keys.map((k) => k.pos),
        false,
        "centripetal",
      );
      this.tgtCurve = new CatmullRomCurve3(
        keys.map((k) => k.target),
        false,
        "centripetal",
      );
    }
  }

  sample(px: number, pos: Vector3, target: Vector3): number {
    const { keys, centers } = this;
    const n = keys.length;
    if (n === 1 || !this.posCurve || !this.tgtCurve) {
      pos.copy(keys[0].pos);
      target.copy(keys[0].target);
      return keys[0].fov;
    }
    px = MathUtils.clamp(px, 0, this.length);
    let i = 0;
    while (i < n - 2 && px > centers[i + 1]) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const start = centers[i] + a.hold / 2;
    const end = centers[i + 1] - b.hold / 2;
    let s = MathUtils.clamp((px - start) / Math.max(1, end - start), 0, 1);
    const stopA = a.hold > 0 || i === 0;
    const stopB = b.hold > 0 || i === n - 2;
    s = stopA && stopB ? inOut(s) : stopA ? easeIn(s) : stopB ? easeOut(s) : s;
    const u = (i + s) / (n - 1);
    this.posCurve.getPoint(u, pos);
    this.tgtCurve.getPoint(u, target);
    return MathUtils.lerp(a.fov, b.fov, s);
  }

  nearest(px: number): number {
    let best = 0;
    let bd = Infinity;
    this.centers.forEach((c, i) => {
      const d = Math.abs(c - px);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  }

  /** Next key with a rest in the given direction, from scroll position px. */
  nextStop(px: number, dir: 1 | -1): number {
    const { keys, centers } = this;
    if (dir > 0) {
      for (let i = 0; i < keys.length; i++) if (centers[i] > px + 24 && (keys[i].hold > 0 || i === keys.length - 1)) return i;
      return keys.length - 1;
    }
    for (let i = keys.length - 1; i >= 0; i--) if (centers[i] < px - 24 && (keys[i].hold > 0 || i === 0)) return i;
    return 0;
  }

  indexOf(id: string) {
    return this.keys.findIndex((k) => k.id === id);
  }
}
