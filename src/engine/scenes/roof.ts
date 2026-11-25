import { CatmullRomCurve3, Color, MathUtils, Mesh, MeshBasicMaterial, Object3D, Vector3, type FogExp2 } from "three";
import { floors } from "../../content/floors";
import { t, tr } from "../../i18n";
import { finale, liftPanel, station } from "../../state";
import { collectSpinners, type Spinner } from "../fx";
import type { Guide } from "../guide";
import { collectMotions, glowMotion, Spray } from "../motion";
import { TourScene } from "../scene";
import { logoTexture } from "../signs";
import { makeGlow } from "../sky";
import { floorElevation } from "./floor";

type Part = { node: Object3D; base: Vector3; off: Vector3 };
type Slider = { node: Object3D; x0: number; slide: number };
const EDGE = 7; // station index of the roof edge, where the closing drone shot starts
const FLIGHT = 12; // seconds for the farewell pull-back

const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

/**
 * The roof at dusk. One cooling-tower cell opens layer by layer (fan, drive, eliminators and nozzles,
 * fill, basin); at the edge the visitor either follows the engineer back to the lift or flies out over
 * the city for the farewell.
 */
export class RoofScene extends TourScene {
  readonly floor = floors.find((f) => f.id === "roof")!;
  private parts: Part[] = [];
  private explode = 0;
  private spinners: Spinner[] = [];
  private motions: ((t: number, dt: number) => void)[] = [];
  private spray: Spray | null = null;
  private liftDoors: Slider[] = [];
  private liftOpen = 0;
  private liftFront = new Vector3(-8, 1.6, -13.6);
  private flying = false;
  private flight = 0;
  private farePos: CatmullRomCurve3 | null = null;
  private fareTgt: CatmullRomCurve3 | null = null;
  private fareFov: number[] = [];
  private waved = false;
  private fareSeen = false;

  protected async build() {
    await Promise.all([this.setSky("dusk", { env: 1.25 }), this.loadTextures(["paving", "precast", "stone", "asphalt", "concrete", "wood"]), this.loadLightmaps(["lm_roof"])]);
    this.look.exposure.value = 1.15;
    this.look.windows.value.set(0.5, 1.7);
    this.guideLook = {
      ...this.look,
      sky: { value: new Color(0.62, 0.58, 0.8) },
      ground: { value: new Color(0.3, 0.25, 0.26) },
      sunCol: { value: new Color(0.9, 0.62, 0.45) },
      sunDir: { value: new Vector3(0.2, 0.5, -0.8).normalize() },
    };
    const { inst } = await this.addModel("models/roof.glb", { lm: "lm_roof" });
    // the city sits a full tower height below, and is lit for dusk rather than for the afternoon bake
    await this.addCity(floorElevation(9)).catch(() => {});

    // the tower's two signs, seen in the closing drone shot: original colours, as on arrival
    const [logo, logoPlate] = await Promise.all([logoTexture("brand/fast-logo-hd.png", 3.357, 0), logoTexture("brand/fast-logo-hd.png", 3.357, 0.085, "#f6f8fa")]);
    inst.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh || (mesh.material as MeshBasicMaterial).name !== "sign_logo") return;
      const crown = /crown/.test(String(mesh.userData.group));
      mesh.material = new MeshBasicMaterial({ map: crown ? logoPlate : logo, transparent: true, alphaTest: 0.04, toneMapped: false, fog: false });
    });

    inst.traverse((o) => {
      const e = o.userData.explode as number[] | undefined;
      if (e && !(o as { isMesh?: boolean }).isMesh) {
        o.userData.movable = true;
        o.traverse((c) => (c.matrixAutoUpdate = true));
        this.parts.push({ node: o, base: o.position.clone(), off: new Vector3(e[0], e[1], e[2]) });
      }
    });
    this.spinners = collectSpinners(inst);
    this.motions = collectMotions(inst);
    for (const n of ["liftDoorL", "liftDoorR"]) {
      const node = this.pivot(n);
      if (node) this.liftDoors.push({ node, x0: node.position.x, slide: Number(node.userData.slide) });
    }
    for (const mk of this.markers) {
      if (mk.kind === "glow") {
        const g = makeGlow(String(mk.data.color ?? "#ffd9a0"), Number(mk.data.size ?? 2), mk.pos, 0.75);
        this.root.add(g);
        const gm = glowMotion(g, mk.data);
        if (gm) this.motions.push(gm);
      } else if (mk.kind === "spray") {
        // the rain inside the cell hangs from the distribution layer, so it travels with it
        const host = inst.getObjectByName(String(mk.data.attach ?? "")) ?? inst;
        const sp = new Spray(Number(mk.data.radius ?? 1.9), Number(mk.data.height ?? 2.3), { count: this.engine.lowTier ? 180 : 340, square: true, size: 0.05 });
        host.updateWorldMatrix(true, false);
        sp.points.position.copy(host.worldToLocal(mk.pos.clone()));
        host.add(sp.points);
        this.spray = sp;
      }
    }

    const f = this.floor;
    const plan: [string, number, number][] = [["arrive", 460, 0]];
    f.stations.forEach((s, i) => plan.push([s.id, 540, i + 1]));
    plan.push(["edge", 520, EDGE]);
    this.buildRail(plan);
    this.stations = [this.stationFrom("intro", "-", "arrive"), ...f.stations.map((s) => this.stationFrom(s.id)), this.stationFrom("edge", "-", "edge")];

    const shots = ["edge", "fare1", "fare2", "fare3"].map((id) => this.marker("cam", id)).filter((m) => m && m.target) as NonNullable<ReturnType<RoofScene["marker"]>>[];
    if (shots.length === 4) {
      this.farePos = new CatmullRomCurve3(
        shots.map((s) => s.pos),
        false,
        "centripetal",
      );
      this.fareTgt = new CatmullRomCurve3(
        shots.map((s) => s.target!),
        false,
        "centripetal",
      );
      this.fareFov = shots.map((s) => Number(s.data.fov ?? 50));
    }
  }

  protected labelText(i: number) {
    if (i === 0 || i === EDGE) return "";
    const s = this.floor.stations[i - 1];
    return s ? tr(s.label) : t("lift");
  }

  protected pointsAt(st: number) {
    return st >= 1 && st !== EDGE;
  }

  enter() {
    this.explode = 0;
    this.flying = false;
    this.flight = 0;
    this.liftOpen = 1;
    this.waved = false;
    this.fareSeen = false;
  }

  exit() {
    this.flying = false;
    this.flight = 0;
    finale.value = "none";
  }

  onEnd() {
    this.startFarewell();
  }

  // --- the two endings (called from the interface) -----------------------------------------------
  startFarewell() {
    if (!this.farePos) return;
    this.flying = true;
    finale.value = "farewell";
    this.waved = false;
  }

  /** Come back down to the last cooling-tower stop. */
  endFarewell() {
    this.flying = false;
    finale.value = "none";
    this.engine.goStation(EDGE - 1);
  }

  cameraOverride(pos: Vector3, target: Vector3): number | void {
    if (this.flight <= 0 || !this.farePos || !this.fareTgt) return;
    const u = ease(MathUtils.clamp(this.flight / FLIGHT, 0, 1));
    this.farePos.getPoint(u, pos);
    this.fareTgt.getPoint(u, target);
    const f = u * (this.fareFov.length - 1);
    const i = Math.min(this.fareFov.length - 2, Math.floor(f));
    return MathUtils.lerp(this.fareFov[i], this.fareFov[i + 1], f - i);
  }

  guideFrame(guide: Guide, st: number, settled: boolean, dt: number) {
    super.guideFrame(guide, st, settled, dt);
    if (this.flying && !this.waved && this.flight > 0.6) {
      this.waved = true;
      guide.wave();
    }
  }

  update(dt: number, time: number) {
    const st = station.value;
    // the cell is open from the fan stop to the basin stop, and closed for arrival and for the endings
    const open = st >= 2 && st < EDGE && !this.flying ? 1 : 0;
    this.explode = MathUtils.damp(this.explode, open, 1.6, dt);
    const e = ease(this.explode);
    for (const p of this.parts) p.node.position.copy(p.base).addScaledVector(p.off, e);
    if (this.spray) {
      this.spray.amount = 0.35 + 0.65 * this.explode;
      this.spray.update(dt);
    }
    for (const s of this.spinners) s.node.rotateOnAxis(s.axis, s.speed * dt);
    for (const mo of this.motions) mo(time, dt);

    const cam = this.engine.camera.position;
    this.liftOpen = MathUtils.damp(this.liftOpen, cam.distanceTo(this.liftFront) < 6.5 ? 1 : 0, 2.6, dt);
    for (const d of this.liftDoors) d.node.position.x = d.x0 + d.slide * this.liftOpen;

    // endings
    if (this.flying) this.flight = Math.min(FLIGHT, this.flight + dt);
    // the dusk haze thins as the camera pulls away, so streets and park stay crisp in the closing shot
    const fog = this.root.fog as FogExp2 | null;
    if (fog && "density" in fog) fog.density = MathUtils.lerp(0.0024, 0.0011, MathUtils.clamp(this.flight / FLIGHT, 0, 1));
    else if (this.flight > 0) {
      this.flight = Math.max(0, this.flight - dt * 4.5);
      if (this.flight === 0 && finale.value === "farewell") finale.value = "none";
    }
    if (!this.flying && this.flight === 0) {
      // past the last stop the camera lifts off the roof by itself: no choice, no walk back to the lift
      if (st !== EDGE) this.fareSeen = false;
      else if (!this.fareSeen && this.engine.input.settled) {
        this.fareSeen = true;
        this.startFarewell();
      }
    }
  }
}
