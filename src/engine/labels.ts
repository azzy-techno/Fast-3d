import { PerspectiveCamera, Vector3 } from "three";

export type LabelDef = { pos: Vector3; text: string; index: number };

const v = new Vector3();

/**
 * Component labels are DOM, not textures: always crisp at any camera distance, real text for screen
 * readers, and Arabic shapes correctly. Each one is a button that returns the visitor to that stop.
 */
export class Labels {
  private items: { def: LabelDef; el: HTMLButtonElement; x: number; y: number; shown: boolean }[] = [];
  private active = -1;
  onPick: (index: number) => void = () => {};

  constructor(private host: HTMLElement) {}

  set(defs: LabelDef[]) {
    this.host.textContent = "";
    this.items = defs.map((def) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "hs";
      el.innerHTML = `<span class="hs-dot" aria-hidden="true"></span><span class="hs-text"></span>`;
      (el.lastChild as HTMLElement).textContent = def.text;
      el.setAttribute("aria-label", def.text);
      el.addEventListener("click", () => this.onPick(def.index));
      this.host.appendChild(el);
      return { def, el, x: -1, y: -1, shown: false };
    });
    this.active = -2;
  }

  setActive(index: number) {
    if (index === this.active) return;
    this.active = index;
    for (const it of this.items) it.el.classList.toggle("is-active", it.def.index === index);
  }

  update(camera: PerspectiveCamera, w: number, h: number) {
    for (const it of this.items) {
      v.copy(it.def.pos).project(camera);
      const visible = v.z < 1 && v.z > -1 && Math.abs(v.x) < 0.96 && Math.abs(v.y) < 0.92;
      if (visible !== it.shown) {
        it.shown = visible;
        it.el.classList.toggle("is-shown", visible);
        it.el.tabIndex = visible ? 0 : -1;
      }
      if (!visible) continue;
      const x = Math.round((v.x * 0.5 + 0.5) * w);
      const y = Math.round((-v.y * 0.5 + 0.5) * h);
      if (x !== it.x || y !== it.y) {
        it.x = x;
        it.y = y;
        it.el.style.transform = `translate3d(${x}px,${y}px,0)`;
      }
    }
  }
}
