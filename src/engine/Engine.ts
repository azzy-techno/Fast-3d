import { ACESFilmicToneMapping, MathUtils, Object3D, PerspectiveCamera, SRGBColorSpace, Vector3, WebGLRenderer } from "three";
import { effect } from "@preact/signals";
import { floors } from "../content/floors";
import { finale, lang, liftFrom, liftPanel, liftPhase, liftTo, loadProgress, moved, ready3d, scene, station, struggling, anyModal, type SceneId, arrived } from "../state";
import { onProgress, prefetch } from "./assets";
import { Guide } from "./guide";
import { ScrollInput } from "./input";
import { Labels, type LabelDef } from "./labels";
import type { TourScene } from "./scene";

const DOOR_MS = 620;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const tmpPos = new Vector3();
const tmpTgt = new Vector3();
const right = new Vector3();

export class Engine {
  readonly renderer: WebGLRenderer;
  readonly camera = new PerspectiveCamera(50, 1, 0.1, 4000);
  readonly input: ScrollInput;
  readonly labels: Labels;
  readonly guide = new Guide();
  readonly lowTier: boolean;
  current: TourScene | null = null;
  /** Scene-specific label text provider (set by scenes on enter). */
  labelDefs: () => LabelDef[] = () => [];
  private scenes = new Map<SceneId, TourScene>();
  private raf = 0;
  private last = 0;
  private time = 0;
  private running = false;
  private paused = false;
  private w = 1;
  private h = 1;
  private pr = 1;
  private prMax = 1;
  private prMin = 0.7;
  private ema = 16;
  private slowFor = 0;
  private fastFor = 0;
  private badFor = 0;
  private trial: { before: number; pr: number; t: number } | null = null;
  private prLocked = false;
  /** Set when the device cannot hold frame rate: scenes drop optional background life. */
  lean = false;
  private wanted: SceneId = "arrival";
  private travelling = false;
  private lastStation = -2;
  private aheadStation = -2;
  private px = 0;
  private pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  private offset = { x: 0, y: 0, tx: 0, ty: 0 };
  private frameTimes: number[] | null = null;
  private factory: (id: SceneId, engine: Engine) => TourScene;

  constructor(
    private canvas: HTMLCanvasElement,
    private stage: HTMLElement,
    labelsHost: HTMLElement,
    factory: (id: SceneId, engine: Engine) => TourScene,
  ) {
    this.factory = factory;
    const coarse = matchMedia("(pointer: coarse)").matches;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    this.lowTier = coarse || mem <= 4;
    this.renderer = new WebGLRenderer({ canvas, antialias: !this.lowTier || devicePixelRatio < 2, powerPreference: "high-performance", alpha: false, stencil: false });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.info.autoReset = true;
    this.prMax = Math.min(devicePixelRatio || 1, this.lowTier ? 1.6 : 1.5);
    this.pr = this.prMax;
    this.input = new ScrollInput(stage);
    this.input.onStep = (d) => this.step(d);
    this.input.onOverscroll = (d) => {
      if (d > 0) this.current?.onEnd();
    };
    this.labels = new Labels(labelsHost);
    this.labels.onPick = (i) => this.goStation(i);
    if (!coarse)
      window.addEventListener("pointermove", (e) => {
        this.pointer.x = (e.clientX / innerWidth) * 2 - 1;
        this.pointer.y = (e.clientY / innerHeight) * 2 - 1;
      });
    new ResizeObserver(() => this.resize()).observe(stage);
    this.resize();
    onProgress((d, t) => {
      if (!ready3d.value) loadProgress.value = Math.max(loadProgress.value, t ? d / (t + 1) : 0);
    });
    // Labels follow the language; modals pause scroll input.
    effect(() => {
      void lang.value;
      this.refreshLabels();
      this.aheadStation = -2; // the guide changes side with the text card
    });
    effect(() => {
      this.input.enabled = !anyModal.value && liftPhase.value === "idle" && finale.value !== "farewell";
    });
    if (new URLSearchParams(location.search).has("probe")) {
      this.frameTimes = [];
      (window as unknown as { __fast: unknown }).__fast = { engine: this, frames: this.frameTimes };
    }
  }

  sceneFor(id: SceneId) {
    let s = this.scenes.get(id);
    if (!s) {
      s = this.factory(id, this);
      this.scenes.set(id, s);
    }
    return s;
  }

  // ------------------------------------------------------------------------------------ lifecycle
  async start(id: SceneId) {
    this.wanted = id;
    const s = this.sceneFor(id);
    await s.load();
    await this.swap(s);
    this.run();
    // two frames so the first presented image is complete before the poster lifts
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    loadProgress.value = 1;
    ready3d.value = true;
    this.guide.load().then(() => {
      if (this.current) this.attachGuide(this.current);
      this.prefetchNext();
    });
  }

  run() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private attachGuide(s: TourScene) {
    if (!this.guide.loaded) return;
    s.root.add(this.guide.root);
    this.guide.groundY = s.groundY;
    this.guide.setLook(s.guideLook ?? s.look);
    s.placeGuide(this.guide);
    this.aheadStation = -2;
  }

  private async swap(s: TourScene) {
    this.current?.exit();
    this.current = s;
    scene.value = s.id;
    finale.value = "none";
    this.input.setRange(s.rail.length, s.entryPx());
    this.px = this.input.x;
    this.lastStation = -2;
    this.aheadStation = -2;
    this.attachGuide(s);
    s.enter();
    this.refreshLabels();
    this.sampleCamera(0);
    await this.warm(s);
    history.replaceState(null, "", s.id === "arrival" ? location.pathname + location.search : `#${s.id}`);
  }

  /**
   * Compile programs and push every buffer / texture to the GPU while the picture is covered (poster or
   * lift doors). Compilation runs in parallel in the driver where the browser supports it, so the door
   * animation stays smooth; the draw that follows goes to the canvas itself, because a render target
   * would need a second, different set of shader variants.
   */
  private async warm(s: TourScene) {
    try {
      await this.renderer.compileAsync(s.root, this.camera);
    } catch {
      /* compileAsync is an optimisation only */
    }
    const culled: Object3D[] = [];
    s.root.traverse((o) => {
      if (o.frustumCulled) {
        o.frustumCulled = false;
        culled.push(o);
      }
    });
    this.renderer.render(s.root, this.camera);
    culled.forEach((o) => (o.frustumCulled = true));
  }

  /**
   * Get a scene the visitor is likely to choose next ready in the background: download it and compile its
   * programs without blocking, so the first lift ride is as quick as the later ones.
   */
  private prewarming = new Set<SceneId>();
  private pendingPrewarm: SceneId | null = null;
  private idleFor = 0;
  private prewarm(id: SceneId) {
    if (this.prewarming.has(id) || this.current?.id === id) return;
    this.prewarming.add(id);
    const s = this.sceneFor(id);
    void s
      .load()
      .then(() => this.renderer.compileAsync(s.root, this.camera))
      .catch(() => {});
  }

  // ------------------------------------------------------------------------------------ navigation
  /** Ride the lift to another scene. Safe to call again mid-ride: the latest choice wins. */
  async travel(to: SceneId) {
    this.wanted = to;
    liftPanel.value = false;
    if (this.travelling) {
      liftTo.value = to;
      return;
    }
    if (this.current?.id === to) {
      this.input.goTo(this.current.entryPx());
      return;
    }
    this.travelling = true;
    liftFrom.value = scene.value;
    liftTo.value = to;
    liftPhase.value = "closing";
    await wait(DOOR_MS);
    liftPhase.value = "moving";
    this.paused = true;
    const started = performance.now();
    let target = this.wanted;
    for (;;) {
      liftTo.value = target;
      const s = this.sceneFor(target);
      try {
        await s.load();
      } catch (e) {
        console.error("[fast] scene failed to load", target, e);
        if (!this.current) break;
        target = this.wanted = this.current.id;
        break;
      }
      if (this.wanted !== target) {
        target = this.wanted;
        continue;
      }
      if (this.current !== s) await this.swap(s);
      const min = 1100 - (performance.now() - started);
      if (min > 0) await wait(min);
      if (this.wanted !== target) {
        target = this.wanted;
        continue;
      }
      break;
    }
    this.paused = false;
    this.last = performance.now();
    // present one finished frame behind the doors before they part
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    liftPhase.value = "opening";
    await wait(DOOR_MS);
    liftPhase.value = "idle";
    this.travelling = false;
    this.prefetchNext();
    if (this.wanted !== this.current?.id) void this.travel(this.wanted);
  }

  /** After settling somewhere, prepare the floor the visitor is most likely to ride to next. */
  private prefetchNext() {
    const id = this.current?.id;
    const i = floors.findIndex((f) => f.id === id);
    const next = floors[i + 1];
    // deferred to the frame loop: it starts once the visitor has stood still for a moment
    if (next) this.pendingPrewarm = next.id;
    else if (id === "roof") prefetch(["models/arrival.glb"]);
  }

  goStation(i: number) {
    const s = this.current;
    if (!s) return;
    const k = s.rail.keys.findIndex((key) => key.station === i);
    if (k >= 0) {
      this.input.goTo(s.rail.centers[k]);
      moved.value = true;
    }
  }

  step(dir: 1 | -1) {
    const s = this.current;
    if (!s) return;
    const atEnd = this.input.target >= s.rail.length - 2;
    if (dir > 0 && atEnd) {
      s.onEnd();
      return;
    }
    const k = s.rail.nextStop(this.input.target, dir);
    this.input.goTo(s.rail.centers[k]);
    moved.value = true;
  }

  /** Jump the scroll position (used by "skip"). */
  jumpTo(shotId: string, instant = false) {
    const s = this.current;
    if (!s) return;
    const k = s.rail.indexOf(shotId);
    if (k < 0) return;
    if (instant) this.input.setRange(s.rail.length, s.rail.centers[k]);
    else this.input.goTo(s.rail.centers[k]);
  }

  /** Fraction of the viewport to shift the picture by, so the subject clears the text panel. */
  setLayout(x: number, y: number) {
    this.offset.tx = x;
    this.offset.ty = y;
  }

  refreshLabels() {
    this.labels.set(this.current ? this.current.labels() : []);
    this.labels.setActive(station.value);
  }

  // ------------------------------------------------------------------------------------ frame
  private resize() {
    const r = this.stage.getBoundingClientRect();
    this.w = Math.max(1, Math.round(r.width));
    this.h = Math.max(1, Math.round(r.height));
    this.renderer.setPixelRatio(this.pr);
    this.renderer.setSize(this.w, this.h, false);
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
  }

  private sampleCamera(dt: number) {
    const s = this.current!;
    const fov = s.rail.sample(this.px, tmpPos, tmpTgt);
    // portrait screens need a wider lens to hold the same subject
    const aspect = this.w / this.h;
    const over = s.cameraOverride(tmpPos, tmpTgt, this.time);
    const fv = typeof over === "number" ? over : fov;
    const fovAdj = aspect < 1 ? MathUtils.clamp(fv * (1 + (1 - aspect) * 0.55), fv, 86) : fv;
    const p = this.pointer;
    p.sx = MathUtils.damp(p.sx, p.x, 3, dt);
    p.sy = MathUtils.damp(p.sy, p.y, 3, dt);
    this.camera.position.copy(tmpPos);
    this.camera.lookAt(tmpTgt);
    if (p.sx || p.sy) {
      // a small look-around: the visitor's own head, not a camera move
      const d = tmpPos.distanceTo(tmpTgt);
      right.setFromMatrixColumn(this.camera.matrixWorld, 0);
      tmpTgt.addScaledVector(right, p.sx * d * 0.035);
      tmpTgt.y -= p.sy * d * 0.022;
      this.camera.lookAt(tmpTgt);
    }
    if (Math.abs(this.camera.fov - fovAdj) > 0.01) {
      this.camera.fov = fovAdj;
      this.camera.updateProjectionMatrix();
    }
    const o = this.offset;
    const nx = MathUtils.damp(o.x, o.tx, 3.5, dt || 1);
    const ny = MathUtils.damp(o.y, o.ty, 3.5, dt || 1);
    if (Math.abs(nx - o.x) > 0.0005 || Math.abs(ny - o.y) > 0.0005 || !this.camera.view) {
      o.x = nx;
      o.y = ny;
      this.camera.setViewOffset(this.w, this.h, -o.x * this.w, o.y * this.h, this.w, this.h);
    } else if (this.camera.view && (this.camera.view.fullWidth !== this.w || this.camera.view.fullHeight !== this.h)) {
      this.camera.setViewOffset(this.w, this.h, -o.x * this.w, o.y * this.h, this.w, this.h);
    }
  }

  private frame = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    const raw = now - this.last;
    this.last = now;
    const dt = Math.min(0.1, raw / 1000);
    const s = this.current;
    if (!s || this.paused) return;
    this.frameTimes?.push(raw);
    this.govern(raw, dt);
    this.time += dt;
    this.idleFor = this.input.settled ? this.idleFor + dt : 0;
    if (this.pendingPrewarm && this.idleFor > 0.9) {
      const id = this.pendingPrewarm;
      this.pendingPrewarm = null;
      this.prewarm(id);
    }
    this.px = this.input.update(dt);
    if (!moved.peek() && this.px > 60) moved.value = true;
    this.sampleCamera(dt);

    // stops: where the camera is, and where it is heading (the guide walks ahead of the camera)
    const k = s.rail.nearest(this.px);
    const st = s.rail.keys[k].station;
    if (st !== this.lastStation) {
      this.lastStation = st;
      station.value = st;
      this.labels.setActive(st);
    }
    const ka = s.rail.nearest(this.input.target);
    const ahead = s.rail.keys[ka].station;
    if (ahead * 1000 + ka !== this.aheadStation) {
      this.aheadStation = ahead * 1000 + ka;
      if (this.guide.loaded) s.guidePlan(ahead, this.guide, ka);
    }
    const settled = Math.abs(this.px - s.rail.centers[k]) < s.rail.keys[k].hold / 2 + 60;
    arrived.value = settled;
    if (this.guide.loaded) {
      s.guideFrame(this.guide, st, settled, dt);
      this.guide.lookTarget.copy(this.camera.position);
      this.guide.update(dt);
    }
    s.update(dt, this.time, this.px);
    this.renderer.render(s.root, this.camera);
    this.labels.update(this.camera, this.w, this.h);
  };

  /** Keep frame time under control by trading resolution first; report when even that is not enough. */
  private govern(raw: number, dt: number) {
    if (raw > 250) return; // tab switch / load hitch, not a rendering cost
    this.ema += (raw - this.ema) * 0.08;
    if (this.ema > 22) {
      this.slowFor += dt;
      this.fastFor = 0;
    } else if (this.ema < 13.5) {
      this.fastFor += dt;
      this.slowFor = 0;
    } else {
      this.slowFor = Math.max(0, this.slowFor - dt);
      this.fastFor = 0;
    }
    if (this.trial) {
      // judge the last resolution cut: if frame time did not improve, the device is CPU-bound, so give
      // the pixels back and shed background life instead
      this.trial.t += dt;
      if (this.trial.t > 1.6) {
        if (this.ema > this.trial.before * 0.88) {
          this.pr = this.trial.pr;
          this.prLocked = true;
          this.lean = true;
          this.resize();
        }
        this.trial = null;
        this.slowFor = 0;
      }
    } else if (this.slowFor > 1.2 && this.pr > this.prMin + 0.01 && !this.prLocked) {
      this.trial = { before: this.ema, pr: this.pr, t: 0 };
      this.pr = Math.max(this.prMin, this.pr * 0.8);
      this.slowFor = 0;
      this.resize();
    } else if (this.slowFor > 2.5 && !this.lean) {
      this.lean = true;
    } else if (this.fastFor > 5 && this.pr < this.prMax - 0.01) {
      this.pr = Math.min(this.prMax, this.pr * 1.1);
      this.fastFor = 0;
      this.resize();
    }
    if (this.ema > 42 && (this.pr <= this.prMin + 0.01 || this.prLocked)) {
      this.badFor += dt;
      if (this.badFor > 6) struggling.value = true;
    } else this.badFor = Math.max(0, this.badFor - dt * 2);
  }

  get portrait() {
    return this.w < 900 || this.w <= this.h;
  }

  get pixelRatio() {
    return this.pr;
  }
}
