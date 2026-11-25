import { Color, MathUtils, Matrix4, Mesh, MeshBasicMaterial, Object3D, Vector3 } from "three";
import { floors } from "../../content/floors";
import type { Floor } from "../../content/types";
import { t, tr } from "../../i18n";
import { liftPanel } from "../../state";
import { loadTexture } from "../assets";
import { collectSpinners, Flow, type Spinner } from "../fx";
import { collectMotions, glowMotion, Sparks, Spray } from "../motion";
import { Screens } from "../screens";
import type { Guide } from "../guide";
import type { LabelDef } from "../labels";
import { TourScene } from "../scene";
import { floorSignTexture } from "../signs";
import { loadEnv, makeGlow } from "../sky";
import { animators, type FloorAnimator } from "./exhibits";

type Slider = { node: Object3D; x0: number; slide: number };

/** Finished floor level of gallery k (1..8) above the plaza; must match tools/blender/building.py. */
export const floorElevation = (k: number) => 8.6 + (k - 1) * 6.4;

/**
 * One gallery floor: the shared shell (baked once), the floor's own exhibit, the city outside the
 * glass at the right height, and a rail that runs lift -> overview -> each component -> back to the lift.
 */
export class FloorScene extends TourScene {
  readonly floor: Floor = floors.find((f) => f.id === this.id)!;
  private liftDoors: Slider[] = [];
  private liftOpen = 0;
  private liftFront = new Vector3(-8, 1.6, -13.6);
  private flows: Flow[] = [];
  private spinners: Spinner[] = [];
  private motions: ((t: number, dt: number) => void)[] = [];
  private screens: Screens | null = null;
  private sparks: Sparks[] = [];
  private sprays: Spray[] = [];
  private animator: FloorAnimator | null = null;
  private overviewStand: { pos: Vector3; face: Vector3 } | null = null;
  exhibit: Object3D | null = null;

  protected async build() {
    const f = this.floor;
    const level = floors.indexOf(f) + 1;
    await Promise.all([
      this.setSky("sunset", { env: 1.2 }),
      this.loadTextures(),
      this.loadLightmaps(["lm_floor"]),
      loadEnv(this.engine.renderer, "floor").then((tex) => (this.look.envs.floor = tex)),
    ]);
    this.look.exposure.value = 0.92;
    this.guideLook = {
      ...this.look,
      env: this.look.envs.floor,
      envIntensity: 0.8,
      sky: { value: new Color(0.95, 0.93, 0.9) },
      ground: { value: new Color(0.4, 0.39, 0.37) },
      sunCol: { value: new Color(0.25, 0.2, 0.14) },
      sunDir: { value: new Vector3(-0.3, 0.25, 0.9).normalize() },
    };

    const [shell, ex] = await Promise.all([this.addModel("models/floor.glb", { clone: true, lm: "lm_floor" }), this.addModel(`models/ex_${f.id}.glb`, { clone: true })]);
    this.exhibit = ex.inst;

    // the city outside, dropped so this floor sits at its real height in the tower
    await this.addCity(floorElevation(level)).catch(() => {
      /* the backdrop is optional */
    });

    // signs: floor graphic, real project photographs, accent colour
    const accent = new Color(f.accent);
    // a floor with fewer than three photographs of its own borrows the lead picture of other floors
    const pool = [...f.photos, ...floors.filter((o) => o.id !== f.id && o.id !== "roof").map((o) => o.photos[0]).filter(Boolean)];
    const photoTex = await Promise.all(pool.slice(0, 3).map((p) => loadTexture(p.src, { mips: true }).catch(() => null)));
    for (const inst of [shell.inst, ex.inst]) {
      inst.traverse((o) => {
        const m = o as Mesh;
        if (!m.isMesh) return;
        const mat = m.material as MeshBasicMaterial;
        if (mat.name === "sign_floor") {
          m.material = new MeshBasicMaterial({ map: floorSignTexture(f.level, f.name, f.accent, 3), transparent: true, toneMapped: false });
        } else if (mat.name.startsWith("sign_photo")) {
          const tex = photoTex[Number(mat.name.slice(10))];
          if (tex) {
            m.material = new MeshBasicMaterial({ map: tex, toneMapped: false });
            // cover-fit the photograph in its 1.5 x 1.12 frame
            const img = tex.image as { width: number; height: number };
            const ia = img.width / img.height;
            const fa = 1.5 / 1.12;
            if (ia > fa) {
              tex.repeat.set(fa / ia, 1);
              tex.offset.set((1 - fa / ia) / 2, 0);
            } else {
              tex.repeat.set(1, ia / fa);
              tex.offset.set(0, (1 - ia / fa) / 2);
            }
          } else m.visible = false;
        } else if (mat.name === "accent") {
          m.material = new MeshBasicMaterial({ color: accent.clone().multiplyScalar(1.7), toneMapped: true });
        }
      });
    }

    for (const n of ["liftDoorL", "liftDoorR"]) {
      const node = this.pivot(n);
      if (node) this.liftDoors.push({ node, x0: node.position.x, slide: Number(node.userData.slide) });
    }
    const exMatrix = new Matrix4().copy(ex.inst.matrixWorld);
    for (const mk of this.markers) {
      if (mk.kind === "glow") {
        const g = makeGlow(String(mk.data.color ?? "#ffffff"), Number(mk.data.size ?? 1.2), mk.pos, 0.7);
        this.root.add(g);
        const gm = glowMotion(g, mk.data);
        if (gm) this.motions.push(gm);
      } else if (mk.kind === "sparks") {
        const sp = new Sparks(mk.pos);
        this.sparks.push(sp);
        this.root.add(sp.points);
      } else if (mk.kind === "spray") {
        const sp = new Spray(Number(mk.data.radius ?? 1), Number(mk.data.height ?? 1.6), { count: 150, cone: true });
        sp.points.position.copy(mk.pos);
        this.sprays.push(sp);
        this.root.add(sp.points);
      } else if (mk.kind === "flow") {
        const fl = new Flow(mk, exMatrix);
        fl.points.name = `flow:${mk.id}`;
        this.flows.push(fl);
        this.root.add(fl.points);
      }
    }
    this.spinners = collectSpinners(ex.inst);
    this.motions.push(...collectMotions(ex.inst));
    this.screens = new Screens(ex.inst);

    // rail: lift -> overview -> every station -> back to the lift
    const plan: [string, number, number][] = [
      ["arrive", 460, 0],
      ["overview", 360, 0],
    ];
    f.stations.forEach((s, i) => plan.push([s.id, 540, i + 1]));
    plan.push(["lift", 420, f.stations.length + 1]);
    this.buildRail(plan);
    this.stations = [this.stationFrom("intro", "-", "arrive"), ...f.stations.map((s) => this.stationFrom(s.id)), this.stationFrom("lift", "lift", "lift")];
    const ov = this.marker("stand", "overview");
    if (ov?.target) this.overviewStand = { pos: ov.pos.clone(), face: ov.target.clone() };

    const make = animators[f.id];
    if (make) this.animator = make({ scene: this, exhibit: ex.inst, flows: this.flows, look: this.look });
  }

  labels(): LabelDef[] {
    const out = super.labels();
    return out;
  }

  protected labelText(i: number) {
    if (i === 0) return "";
    const s = this.floor.stations[i - 1];
    return s ? tr(s.label) : t("lift");
  }

  enter() {
    this.liftOpen = 1;
    this.animator?.enter?.();
  }

  guidePlan(st: number, guide: Guide, key = -1) {
    if (st === 0 && this.overviewStand && this.rail.keys[key]?.id === "overview") {
      guide.walkTo(this.overviewStand.pos, this.overviewStand.face);
      return;
    }
    super.guidePlan(st, guide, key);
  }

  protected pointsAt(st: number) {
    return st >= 1;
  }

  onEnd() {
    liftPanel.value = true;
  }

  update(dt: number, time: number, px: number) {
    const cam = this.engine.camera.position;
    this.liftOpen = MathUtils.damp(this.liftOpen, cam.distanceTo(this.liftFront) < 6.5 ? 1 : 0, 2.6, dt);
    for (const d of this.liftDoors) d.node.position.x = d.x0 + d.slide * this.liftOpen;
    for (const s of this.spinners) s.node.rotateOnAxis(s.axis, s.speed * dt);
    for (const f of this.flows) f.update(time);
    for (const mo of this.motions) mo(time, dt);
    for (const sp of this.sparks) sp.update(dt);
    for (const sp of this.sprays) sp.update(dt);
    this.screens?.update(dt, time);
    this.animator?.update(dt, time, px);
  }
}
