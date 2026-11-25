import { AnimationAction, AnimationMixer, Color, Group, MathUtils, Mesh, MeshStandardMaterial, Object3D, SkinnedMesh, Vector3, type AnimationClip } from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { loadGLB } from "./assets";
import { applyMaterials, dynMaterial } from "./materials";
import { makeGlow } from "./sky";
import type { TourScene } from "./scene";

type Car = { node: Object3D; lane: number; x: number; v: number; v0: number; len: number };
type Ped = { node: Object3D; mixer: AnimationMixer; x: number; z: number; dir: 1 | -1; speed: number; walk: AnimationAction; idle: AnimationAction | null; w: number; min: number; max: number };

// three.js coordinates (Blender y -> -z). Lanes of the boulevard in front of the tower.
const LANES = [
  { z: 19.8, dir: -1 },
  { z: 23.4, dir: -1 },
  { z: 29.4, dir: 1 },
  { z: 33.0, dir: 1 },
] as const;
const ROAD_Y = -0.15;
const HALF = 108;
const PAINTS = [0xe9eaeb, 0x2b2f35, 0xb8a98a, 0x1f4f86, 0x8c1f1f, 0xc9ccd0, 0x3d4a3a, 0x16181c];

/**
 * Life on the street that does not depend on the camera: cars keep their lanes and their distance, and
 * stop at the crossing while the visitor walks over; pedestrians stroll the pavement and pause to let
 * the visitor pass.
 */
export class Traffic {
  private cars: Car[] = [];
  private peds: Ped[] = [];
  private root = new Group();
  private crossing = 0;

  constructor(private scene: TourScene) {
    scene.root.add(this.root);
  }

  async load() {
    const low = this.scene.engine.lowTier;
    const gltf = await loadGLB("models/cars.glb");
    const src = gltf.scene.clone(true);
    applyMaterials(src, this.scene.look);
    const styles = src.children.filter((c) => c.name.startsWith("car_"));
    if (!styles.length) return;
    const perLane = low ? 2 : 3;
    let n = 0;
    LANES.forEach((lane, li) => {
      for (let i = 0; i < perLane; i++) {
        const proto = styles[(n * 3 + li) % styles.length];
        const node = proto.clone(true);
        const paint = new Color(PAINTS[(n * 5 + li * 3) % PAINTS.length]);
        node.traverse((o) => {
          const m = o as Mesh;
          if (m.isMesh && (m.material as MeshStandardMaterial).name === "carpaint") {
            const mat = (m.material as MeshStandardMaterial).clone();
            mat.onBeforeCompile = (m.material as MeshStandardMaterial).onBeforeCompile;
            mat.customProgramCacheKey = (m.material as MeshStandardMaterial).customProgramCacheKey;
            mat.color = paint;
            m.material = mat;
          }
          o.matrixAutoUpdate = true;
        });
        node.rotation.y = lane.dir > 0 ? 0 : Math.PI;
        const len = Number(proto.userData.len ?? 4.8);
        node.add(makeGlow(0xfff0d0, 2.2, new Vector3(len / 2 + 0.1, 0.62, 0), 0.55));
        node.add(makeGlow(0xff3020, 1.5, new Vector3(-len / 2 - 0.05, 0.7, 0), 0.5));
        this.root.add(node);
        const v0 = 9.5 + ((n * 37) % 10) * 0.42;
        this.cars.push({ node, lane: li, x: -HALF + ((i + ((li * 0.37) % 1)) / perLane) * HALF * 2 + ((n * 13) % 9), v: v0, v0, len });
        n++;
      }
    });
    await this.loadPeds(low ? 2 : 5);
  }

  private async loadPeds(count: number) {
    const files = ["models/ped-1.glb", "models/ped-2.glb", "models/ped-3.glb"];
    const gl = await Promise.all(files.map((f) => loadGLB(f)));
    const clips: AnimationClip[] = gl[0].animations;
    const walkClip = clips.find((c) => c.name === "Walk");
    const idleClip = clips.find((c) => c.name === "Idle");
    if (!walkClip) return;
    // pavement lines on the plaza side (three z): close to the kerb and one further in
    const lines = [16.4, 14.6, 16.4, 36.9, 14.6];
    for (let i = 0; i < count; i++) {
      const node = cloneSkinned(gl[i % gl.length].scene) as Object3D;
      node.traverse((o) => {
        const sm = o as SkinnedMesh;
        if (sm.isSkinnedMesh) {
          sm.material = dynMaterial(sm.material as MeshStandardMaterial, this.scene.look);
          sm.frustumCulled = false;
        }
      });
      const mixer = new AnimationMixer(node);
      const walk = mixer.clipAction(walkClip);
      walk.play();
      walk.time = (i * 0.37) % walkClip.duration;
      let idle = null;
      if (idleClip) {
        idle = mixer.clipAction(idleClip);
        idle.play();
        idle.setEffectiveWeight(0);
      }
      const dir = (i % 2 ? 1 : -1) as 1 | -1;
      const far = lines[i % lines.length] > 30;
      const p: Ped = { node, mixer, x: -34 + i * 15.5, z: lines[i % lines.length], dir, speed: 0.92 + (i % 3) * 0.07, walk, idle, w: 1, min: far ? -60 : -48, max: far ? 60 : 48 };
      node.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      this.root.add(node);
      this.peds.push(p);
    }
  }

  update(dt: number, _t: number) {
    const cam = this.scene.engine.camera.position;
    const lean = this.scene.engine.lean;
    // the visitor is on (or stepping onto) the carriageway: the crossing signal holds the traffic
    const onRoad = cam.z > 16.2 && cam.z < 36.2 && Math.abs(cam.x) < 14;
    this.crossing = MathUtils.damp(this.crossing, onRoad ? 1 : 0, 6, dt);
    const hold = this.crossing > 0.5;

    for (const c of this.cars) {
      const lane = LANES[c.lane];
      let limit = c.v0;
      // stop line 7.5 m before the crossing, seen from the car's direction of travel
      const s = c.x * lane.dir; // distance along travel
      const stopAt = -7.5;
      if (hold && s < stopAt) limit = Math.min(limit, Math.sqrt(Math.max(0, 2 * 4.2 * (stopAt - s - 0.4))));
      // keep distance to the car in front in the same lane
      for (const o of this.cars) {
        if (o === c || o.lane !== c.lane) continue;
        let gap = (o.x - c.x) * lane.dir;
        if (gap < 0) gap += HALF * 2;
        gap -= (o.len + c.len) / 2 + 2.2;
        if (gap < 30) limit = Math.min(limit, Math.max(0, o.v + gap * 0.9));
      }
      c.v = limit < c.v ? Math.max(limit, c.v - 6.5 * dt) : Math.min(limit, c.v + 2.4 * dt);
      c.x += c.v * dt * lane.dir;
      if (c.x > HALF) c.x -= HALF * 2;
      else if (c.x < -HALF) c.x += HALF * 2;
      c.node.position.set(c.x, ROAD_Y, lane.z);
    }

    for (const p of this.peds) {
      if (lean) {
        // a struggling device keeps the cars and drops the walkers
        p.node.visible = false;
        continue;
      }
      const dx = cam.x - p.x;
      const dz = cam.z - p.z;
      const ahead = dx * p.dir;
      const near = Math.abs(dz) < 1.6 && ahead > -0.3 && ahead < 2.6;
      p.w = MathUtils.damp(p.w, near ? 0 : 1, 5, dt);
      p.x += p.dir * p.speed * p.w * dt;
      if (p.x > p.max || p.x < p.min) {
        p.dir = (p.dir * -1) as 1 | -1;
        p.x = MathUtils.clamp(p.x, p.min, p.max);
      }
      const want = p.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      p.node.rotation.y = MathUtils.damp(p.node.rotation.y, want, 5, dt);
      p.node.position.set(p.x, 0, p.z);
      p.walk.setEffectiveWeight(Math.max(0.001, p.w));
      p.idle?.setEffectiveWeight(1 - p.w);
      // only animate skeletons that can be seen
      if (Math.abs(dx) < 70) p.mixer.update(dt);
    }
  }
}
