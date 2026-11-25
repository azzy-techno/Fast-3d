import { MathUtils } from "three";

/**
 * Virtual scroll: wheel, touch and keyboard all move one target position, and the camera follows it
 * through a critically damped spring. Nothing here depends on page scroll, so the pace is the same on
 * every device and a frantic wheel cannot fling the visitor past an exhibit.
 */
export class ScrollInput {
  target = 0;
  x = 0;
  v = 0;
  max = 1;
  /** Keys ask for a discrete step; the engine resolves it against the rail. */
  onStep: (dir: 1 | -1) => void = () => {};
  /** Fired when the visitor keeps pushing past either end of the rail. */
  onOverscroll: (dir: 1 | -1) => void = () => {};
  enabled = true;
  private over = 0;
  private touchY: number | null = null;
  private touchV = 0;
  private lastTouchT = 0;
  private fling = 0;
  private stiffness = 6.2;
  private dispose: (() => void)[] = [];

  constructor(el: HTMLElement) {
    const wheel = (e: WheelEvent) => {
      if (!this.enabled || e.ctrlKey || this.blocked(e.target)) return;
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 32;
      else if (e.deltaMode === 2) d *= innerHeight;
      this.push(MathUtils.clamp(d, -260, 260));
    };
    const ts = (e: TouchEvent) => {
      if (!this.enabled || this.blocked(e.target) || e.touches.length !== 1) return;
      this.touchY = e.touches[0].clientY;
      this.touchV = 0;
      this.fling = 0;
      this.lastTouchT = performance.now();
    };
    const tm = (e: TouchEvent) => {
      if (this.touchY === null || e.touches.length !== 1) return;
      const y = e.touches[0].clientY;
      const dy = this.touchY - y;
      this.touchY = y;
      const now = performance.now();
      const dt = Math.max(1, now - this.lastTouchT);
      this.lastTouchT = now;
      this.touchV = MathUtils.lerp(this.touchV, (dy * 2.4) / dt, 0.5);
      this.push(dy * 2.4);
      if (e.cancelable) e.preventDefault();
    };
    const te = () => {
      if (this.touchY === null) return;
      this.touchY = null;
      if (performance.now() - this.lastTouchT < 80) this.fling = MathUtils.clamp(this.touchV, -2.2, 2.2);
    };
    const key = (e: KeyboardEvent) => {
      if (!this.enabled || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      // keys belong to a dialog only while it is actually open
      const modal = t?.closest?.("[data-modal]") as HTMLDialogElement | null | undefined;
      if (modal && modal.open) return;
      const onControl = !!t && (t.tagName === "BUTTON" || t.tagName === "A" || t.tagName === "SUMMARY");
      let dir: 1 | -1 | 0 = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown") dir = 1;
      else if (e.key === "ArrowUp" || e.key === "PageUp") dir = -1;
      else if (e.key === " " && !onControl) dir = e.shiftKey ? -1 : 1;
      if (dir) {
        e.preventDefault();
        this.onStep(dir);
      }
    };
    el.addEventListener("wheel", wheel, { passive: true });
    el.addEventListener("touchstart", ts, { passive: true });
    el.addEventListener("touchmove", tm, { passive: false });
    el.addEventListener("touchend", te, { passive: true });
    el.addEventListener("touchcancel", te, { passive: true });
    window.addEventListener("keydown", key);
    this.dispose.push(
      () => el.removeEventListener("wheel", wheel),
      () => el.removeEventListener("touchstart", ts),
      () => el.removeEventListener("touchmove", tm),
      () => el.removeEventListener("touchend", te),
      () => el.removeEventListener("touchcancel", te),
      () => window.removeEventListener("keydown", key),
    );
  }

  private blocked(t: EventTarget | null) {
    const el = (t as HTMLElement | null)?.closest?.("[data-scroll],[data-modal]") as HTMLDialogElement | null | undefined;
    return !!el && (el.tagName !== "DIALOG" || el.open);
  }

  push(d: number) {
    const before = this.target;
    // Never let the target run far ahead of the camera: scrolling stays readable.
    this.target = MathUtils.clamp(this.target + d, Math.max(0, this.x - 1500), Math.min(this.max, this.x + 1500));
    if (this.target === before && Math.abs(d) > 0) {
      const atEnd = this.target >= this.max - 1 && d > 0;
      const atStart = this.target <= 1 && d < 0;
      if (atEnd || atStart) {
        this.over += Math.abs(d);
        if (this.over > 420) {
          this.over = 0;
          this.onOverscroll(atEnd ? 1 : -1);
        }
      }
    } else this.over = 0;
  }

  setRange(max: number, at = 0) {
    this.max = Math.max(1, max);
    this.x = this.target = MathUtils.clamp(at, 0, this.max);
    this.v = 0;
    this.over = 0;
    this.fling = 0;
  }

  /** Glide to a position (station buttons, keyboard). */
  goTo(px: number) {
    this.target = MathUtils.clamp(px, 0, this.max);
    this.over = 0;
    this.fling = 0;
  }

  get settled() {
    return Math.abs(this.target - this.x) < 2 && Math.abs(this.v) < 4;
  }

  update(dt: number) {
    if (this.fling) {
      this.push(this.fling * dt * 1000);
      this.fling *= Math.exp(-dt * 3.2);
      if (Math.abs(this.fling) < 0.02) this.fling = 0;
    }
    const far = Math.abs(this.target - this.x) > 1600;
    const w = far ? this.stiffness * 0.75 : this.stiffness;
    let remaining = Math.min(dt, 0.1);
    while (remaining > 0) {
      const h = Math.min(remaining, 1 / 120);
      const a = w * w * (this.target - this.x) - 2 * w * this.v;
      this.v += a * h;
      this.x += this.v * h;
      remaining -= h;
    }
    if (this.x < 0) {
      this.x = 0;
      this.v = 0;
    } else if (this.x > this.max) {
      this.x = this.max;
      this.v = 0;
    }
    return this.x;
  }

  destroy() {
    this.dispose.forEach((d) => d());
  }
}
