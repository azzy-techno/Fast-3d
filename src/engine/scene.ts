import { Fog, FogExp2, Group, Matrix4, Mesh, Object3D, Scene, Vector3, type Material, type Texture } from "three";
import { lang, type SceneId } from "../state";
import { loadGLB, loadTexture } from "./assets";
import { applyMaterials, makeLook, type Look } from "./materials";
import { Rail, type Shot } from "./rail";
import { applyRig, loadEnv, makeSky, SKY_RIG, type SkyName } from "./sky";
import type { Engine } from "./Engine";
import type { Guide } from "./guide";
import type { LabelDef } from "./labels";

export type Marker = { kind: string; id: string; pos: Vector3; target?: Vector3; data: Record<string, unknown>; node: Object3D };
export type StationPoint = { id: string; hotspot?: Vector3; stand?: { pos: Vector3; face: Vector3 } };

const TILING = ["asphalt", "paving", "stone", "precast", "wood", "concrete"] as const;

/** One place the visitor can be: owns its scene graph, lighting look, camera rail and stops. */
export abstract class TourScene {
  readonly root = new Scene();
  readonly look: Look = makeLook();
  rail: Rail = new Rail([{ id: "origin", pos: new Vector3(0, 1.6, 6), target: new Vector3(0, 1.4, 0), fov: 50, hold: 0, station: -1 }]);
  stations: StationPoint[] = [];
  markers: Marker[] = [];
  ready = false;
  /** Height of the walking surface for the guide. */
  groundY = 0;
  /** Lighting used for the guide in this scene (defaults to the scene look). */
  guideLook: Look | null = null;
  private loading: Promise<void> | null = null;

  constructor(
    readonly id: SceneId,
    readonly engine: Engine,
  ) {
    this.root.matrixWorldAutoUpdate = true;
  }

  load(): Promise<void> {
    if (!this.loading) {
      this.loading = this.build().then(() => {
        this.ready = true;
      });
      this.loading.catch(() => {
        this.loading = null;
      });
    }
    return this.loading;
  }

  protected abstract build(): Promise<void>;
  /** Called with the doors closed, just before the first frame. */
  enter(): void {}
  exit(): void {}
  update(_dt: number, _t: number, _px: number): void {}
  /** Visitor pushed past the last stop. */
  onEnd(): void {}
  /** Scroll position to start from. */
  entryPx(): number {
    return 0;
  }
  /** Hotspot labels for the current language. */
  labels(): LabelDef[] {
    const out: LabelDef[] = [];
    this.stations.forEach((st, i) => {
      const text = this.labelText(i);
      if (st.hotspot && text) out.push({ pos: st.hotspot, text, index: i });
    });
    return out;
  }
  protected labelText(_i: number): string {
    return "";
  }
  /** Lets a scene bend the rail camera (e.g. the farewell fly-out). */
  cameraOverride(_pos: Vector3, _target: Vector3, _t: number): number | void {}

  // --- the guide ---------------------------------------------------------------------------------
  /** Put the guide where they belong when the visitor arrives in this scene. */
  placeGuide(guide: Guide) {
    const i = this.stations.findIndex((s) => s.stand);
    guide.root.visible = i >= 0;
    const st = this.standFor(i);
    if (st) guide.place(st.pos, st.face);
  }

  /**
   * Where the guide stands for stop i. Stands are authored on the camera's right, clear of the text card;
   * in right-to-left layouts the card moves to the right, so the stand is mirrored across the view axis.
   */
  standFor(i: number): { pos: Vector3; face: Vector3 } | undefined {
    const st = this.stations[i]?.stand;
    if (!st) return undefined;
    if (lang.peek() !== "ar" || this.engine.portrait) return st;
    const key = this.rail.keys.find((k) => k.station === i);
    if (!key) return st;
    const axis = new Vector3().subVectors(key.target, key.pos).setY(0).normalize();
    const r = new Vector3(-axis.z, 0, axis.x);
    const d = new Vector3().subVectors(st.pos, key.pos).dot(r);
    return { pos: st.pos.clone().addScaledVector(r, -2 * d), face: st.face };
  }
  /** The camera is heading for stop : send the guide there ahead of it. */
  guidePlan(st: number, guide: Guide, _key = -1) {
    const stand = this.standFor(st);
    if (stand) guide.walkTo(stand.pos, stand.face);
  }
  /** Per-frame gesture logic: point at the component once the camera has landed. */
  guideFrame(guide: Guide, st: number, settled: boolean, _dt: number) {
    const sp = this.stations[st];
    const stand = this.standFor(st);
    const here = !!stand && guide.distanceTo(stand.pos) < 0.4 && !guide.moving;
    guide.pointAt(here && settled && sp?.hotspot && this.pointsAt(st) ? sp.hotspot : null);
    guide.talking = here && settled;
  }
  protected pointsAt(_st: number) {
    return true;
  }

  // --- helpers for subclasses -------------------------------------------------------------------
  protected async setSky(name: SkyName, opts: { fog?: boolean; rig?: number; env?: number } = {}) {
    const [env, sky] = await Promise.all([loadEnv(this.engine.renderer, name), makeSky(name)]);
    this.look.env = env;
    this.look.envIntensity = opts.env ?? 1;
    applyRig(this.look, name, opts.rig ?? 1);
    this.root.add(sky);
    if (opts.fog !== false) this.root.fog = new FogExp2(SKY_RIG[name].fog, SKY_RIG[name].fogDensity);
    return sky;
  }

  protected async loadTextures(names: readonly string[] = TILING) {
    const max = this.engine.renderer.capabilities.getMaxAnisotropy();
    const list = await Promise.all(names.map((n) => loadTexture(`tex/${n}.webp`, { repeat: true, anisotropy: Math.min(this.engine.lowTier ? 2 : 8, max) })));
    names.forEach((n, i) => (this.look.textures[n] = list[i]));
  }

  protected async loadLightmaps(names: string[]) {
    const list = await Promise.all(names.map((n) => loadTexture(`tex/${n}.webp`, { srgb: false, mips: false })));
    names.forEach((n, i) => (this.look.lightmaps[n] = list[i] as Texture));
  }

  /** Add a GLB to the scene with baked materials; returns the instance and its material table. */
  protected async addModel(path: string, opts: { lm?: string; parent?: Object3D; clone?: boolean; matrix?: Matrix4 } = {}) {
    const gltf = await loadGLB(path);
    const inst = (opts.clone ? gltf.scene.clone(true) : gltf.scene) as Group;
    if (opts.matrix) inst.applyMatrix4(opts.matrix);
    (opts.parent ?? this.root).add(inst);
    inst.updateMatrixWorld(true);
    const mats = applyMaterials(inst, this.look, opts.lm ?? "");
    this.collect(inst);
    inst.traverse((o) => {
      // Everything baked is static: skip per-frame matrix work unless it is a movable pivot.
      const m = o as Mesh;
      if (m.isMesh && !(m.parent && m.parent !== inst && (m.parent as Object3D).userData.movable)) m.matrixAutoUpdate = false;
    });
    return { inst, mats };
  }

  private collect(root: Object3D) {
    const tmp = new Vector3();
    root.traverse((o) => {
      const kind = o.userData.kind as string | undefined;
      if (!kind || (o as Mesh).isMesh) return;
      o.getWorldPosition(tmp);
      const mk: Marker = { kind, id: String(o.userData.id), pos: tmp.clone(), data: o.userData, node: o };
      const t = o.userData.target as number[] | undefined;
      if (t) mk.target = new Vector3(t[0], t[1], t[2]).applyMatrix4(root.matrixWorld);
      this.markers.push(mk);
    });
  }

  /** The surrounding district (shared model). `drop` lowers it so a floor sits at its real height. */
  protected async addCity(drop = 0, hideNear = false) {
    const gltf = await loadGLB("models/city.glb");
    const inst = gltf.scene.clone(true);
    inst.position.y = -drop;
    inst.updateMatrixWorld(true);
    applyMaterials(inst, this.look);
    inst.traverse((o) => {
      o.matrixAutoUpdate = false;
      if (hideNear && o.userData.near) o.visible = false;
    });
    this.root.add(inst);
    return inst;
  }

  marker(kind: string, id: string) {
    return this.markers.find((m) => m.kind === kind && m.id === id);
  }

  /** Build the rail from shot markers. `plan` lists [shotId, hold px, station index]. */
  protected buildRail(plan: [string, number, number][]) {
    const keys: Shot[] = [];
    for (const [id, hold, station] of plan) {
      const mk = this.marker("cam", id);
      if (!mk || !mk.target) {
        console.warn(`[scene ${this.id}] missing shot ${id}`);
        continue;
      }
      keys.push({ id, pos: mk.pos.clone(), target: mk.target.clone(), fov: Number(mk.data.fov ?? 50), hold, station });
    }
    if (keys.length) this.rail = new Rail(keys);
  }

  protected stationFrom(id: string, hs = id, stand = id): StationPoint {
    const h = this.marker("hs", hs);
    const s = this.marker("stand", stand);
    return { id, hotspot: h?.pos.clone(), stand: s && s.target ? { pos: s.pos.clone(), face: s.target.clone() } : undefined };
  }

  /** Find a pivot node exported from a fastlib group and mark it movable. */
  protected pivot(name: string): Object3D | null {
    const o = this.root.getObjectByName(name);
    if (!o) return null;
    o.userData.movable = true;
    o.traverse((c) => {
      c.matrixAutoUpdate = true;
    });
    return o;
  }

  protected materialsNamed(mats: Map<string, Material[]>, name: string) {
    return mats.get(name) ?? [];
  }
}

export { Fog };
