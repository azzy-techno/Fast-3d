import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, MathUtils, NormalBlending, Object3D, Points, PointsMaterial, Sprite, Vector3 } from "three";

/**
 * Small motions authored in the Blender scripts as node properties (see tools/blender/ex_*.py):
 *   blink [period s, duty 0..1, phase s]      visibility pulse (beacons, status LEDs, weld arc)
 *   sway  [amplitude rad, frequency Hz]       hanging loads
 *   bob   [amplitude m, frequency Hz]         hovering / suspended parts
 *   pan   [amplitude rad, frequency Hz]       cameras
 *   swing [angle rad, period s, phase s]      gates that open, wait and close
 *   scan  [amplitude m, frequency Hz]         scan line along X
 *   conveyor [x start, x end, speed m/s]      cartons riding a belt
 */
type Motion = (t: number, dt: number) => void;

export function collectMotions(root: Object3D): Motion[] {
  const out: Motion[] = [];
  root.traverse((o) => {
    if ((o as { isMesh?: boolean }).isMesh) return;
    const d = o.userData;
    const movable = () => {
      o.userData.movable = true;
      o.traverse((c) => (c.matrixAutoUpdate = true));
    };
    if (Array.isArray(d.blink)) {
      const [period, duty, phase] = d.blink as number[];
      out.push((t) => {
        o.visible = (((t + phase) / period) % 1) < duty;
      });
    }
    if (Array.isArray(d.sway)) {
      movable();
      const [amp, f] = d.sway as number[];
      out.push((t) => {
        o.rotation.x = Math.sin(t * f * 6.283) * amp;
        o.rotation.z = Math.sin(t * f * 6.283 * 0.71 + 1.3) * amp * 0.6;
      });
    }
    if (Array.isArray(d.bob)) {
      movable();
      const [amp, f] = d.bob as number[];
      const y0 = o.position.y;
      out.push((t) => {
        o.position.y = y0 + Math.sin(t * f * 6.283) * amp;
      });
    }
    if (Array.isArray(d.pan)) {
      movable();
      const [amp, f] = d.pan as number[];
      out.push((t) => {
        o.rotation.y = Math.sin(t * f * 6.283) * amp;
      });
    }
    if (Array.isArray(d.swing)) {
      movable();
      const [angle, period, phase] = d.swing as number[];
      out.push((t) => {
        const u = ((t + phase) % period) / period;
        // open for the first 40 % of the cycle
        const open = MathUtils.smoothstep(u, 0.02, 0.12) * (1 - MathUtils.smoothstep(u, 0.34, 0.46));
        o.rotation.y = angle * open;
      });
    }
    if (Array.isArray(d.scan)) {
      movable();
      const [amp, f] = d.scan as number[];
      const x0 = o.position.x;
      out.push((t) => {
        o.position.x = x0 + Math.sin(t * f * 6.283) * amp;
      });
    }
    if (Array.isArray(d.conveyor)) {
      movable();
      const [a, b, speed] = d.conveyor as number[];
      const span = Math.abs(b - a);
      const dir = Math.sign(b - a);
      let s = Math.abs(o.position.x - a);
      out.push((_t, dt) => {
        s = (s + speed * dt) % span;
        o.position.x = a + dir * s;
        // shrink away at the pick-up end so the carton does not pop
        const k = MathUtils.clamp((span - s) / 0.25, 0, 1);
        o.scale.setScalar(Math.max(0.001, k));
      });
    }
  });
  return out;
}

/** Glow sprites can blink / flicker too (obstruction light, weld arc). */
export function glowMotion(sprite: Sprite, data: Record<string, unknown>): Motion | null {
  const base = sprite.material.opacity;
  if (Array.isArray(data.blink)) {
    const [period, duty, phase] = data.blink as number[];
    return (t) => {
      sprite.material.opacity = (((t + phase) / period) % 1) < duty ? base : 0;
    };
  }
  if (data.flicker) {
    return (t) => {
      const n = Math.sin(t * 61.3) * Math.sin(t * 37.1 + 1.7);
      sprite.material.opacity = base * (0.35 + 0.65 * Math.abs(n));
      sprite.scale.setScalar(1.0 + 0.5 * Math.abs(n));
    };
  }
  return null;
}

let softDot: CanvasTexture | null = null;
function dotTexture() {
  if (!softDot) {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.5, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 32, 32);
    softDot = new CanvasTexture(c);
  }
  return softDot;
}

/** Welding sparks: a short burst fountain with gravity. */
export class Sparks {
  readonly points: Points;
  private vel: Float32Array;
  private life: Float32Array;
  private n: number;

  constructor(
    private origin: Vector3,
    n = 46,
  ) {
    this.n = n;
    this.vel = new Float32Array(n * 3);
    this.life = new Float32Array(n);
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(n * 3), 3));
    this.points = new Points(g, new PointsMaterial({ map: dotTexture(), color: new Color(1, 0.72, 0.35), size: 0.05, transparent: true, depthWrite: false, blending: AdditiveBlending, fog: false, toneMapped: false }));
    this.points.frustumCulled = false;
    for (let i = 0; i < n; i++) this.life[i] = Math.random() * 0.6;
  }

  update(dt: number) {
    const pos = this.points.geometry.attributes.position as BufferAttribute;
    const a = pos.array as Float32Array;
    for (let i = 0; i < this.n; i++) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        this.life[i] = 0.25 + Math.random() * 0.55;
        a[i * 3] = this.origin.x;
        a[i * 3 + 1] = this.origin.y;
        a[i * 3 + 2] = this.origin.z;
        const ang = Math.random() * 6.283;
        const sp = 0.6 + Math.random() * 1.8;
        this.vel[i * 3] = Math.cos(ang) * sp;
        this.vel[i * 3 + 1] = 0.8 + Math.random() * 1.8;
        this.vel[i * 3 + 2] = Math.sin(ang) * sp;
      } else {
        this.vel[i * 3 + 1] -= 9.8 * dt;
        a[i * 3] += this.vel[i * 3] * dt;
        a[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
        a[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      }
    }
    pos.needsUpdate = true;
  }
}

/** Falling water: sprinkler discharge or the rain inside a cooling tower. Positions are local to `points`. */
export class Spray {
  readonly points: Points;
  private n: number;
  private speed: Float32Array;
  private px: Float32Array;
  private pz: Float32Array;
  /** 0 = off, 1 = full. */
  amount = 1;

  constructor(
    private radius: number,
    private height: number,
    opts: { count?: number; square?: boolean; cone?: boolean; size?: number } = {},
  ) {
    this.n = opts.count ?? 160;
    this.speed = new Float32Array(this.n);
    this.px = new Float32Array(this.n);
    this.pz = new Float32Array(this.n);
    const a = new Float32Array(this.n * 3);
    for (let i = 0; i < this.n; i++) {
      if (opts.square) {
        this.px[i] = (Math.random() * 2 - 1) * radius;
        this.pz[i] = (Math.random() * 2 - 1) * radius;
      } else {
        const r = Math.sqrt(Math.random()) * radius;
        const ang = Math.random() * 6.283;
        this.px[i] = Math.cos(ang) * r;
        this.pz[i] = Math.sin(ang) * r;
      }
      this.speed[i] = 2.2 + Math.random() * 1.6;
      a[i * 3 + 1] = -Math.random() * height;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(a, 3));
    this.points = new Points(g, new PointsMaterial({ map: dotTexture(), color: new Color(0.82, 0.92, 1), size: opts.size ?? 0.045, transparent: true, opacity: 0.55, depthWrite: false, blending: NormalBlending, fog: false }));
    this.points.frustumCulled = false;
    this.cone = !!opts.cone;
  }
  private cone: boolean;

  update(dt: number) {
    const pos = this.points.geometry.attributes.position as BufferAttribute;
    const a = pos.array as Float32Array;
    for (let i = 0; i < this.n; i++) {
      let y = a[i * 3 + 1] - this.speed[i] * dt;
      if (y < -this.height) y = 0;
      a[i * 3 + 1] = y;
      // a sprinkler opens into a cone; tower rain falls straight
      const k = this.cone ? Math.min(1, -y / (this.height * 0.45)) : 1;
      a[i * 3] = this.px[i] * k;
      a[i * 3 + 2] = this.pz[i] * k;
    }
    pos.needsUpdate = true;
    (this.points.material as PointsMaterial).opacity = 0.55 * this.amount;
    this.points.visible = this.amount > 0.02;
  }
}
