import {
  AnimationAction,
  AnimationMixer,
  Bone,
  CanvasTexture,
  Group,
  LoopOnce,
  LoopRepeat,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  SkinnedMesh,
  Vector3,
} from "three";
import { loadGLB } from "./assets";
import { dynMaterial, type Look } from "./materials";

const WALK_SPEED = 1.347; // m/s that matches the Walk clip's foot contacts (engineer.meta.json)
const UP = new Vector3(0, 1, 0);
const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const q1 = new Quaternion();
const q2 = new Quaternion();
const q3 = new Quaternion();

let shadowTex: CanvasTexture | null = null;
function blobTexture() {
  if (!shadowTex) {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(0,0,0,0.62)");
    g.addColorStop(0.5, "rgba(0,0,0,0.3)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    shadowTex = new CanvasTexture(c);
  }
  return shadowTex;
}
function blob(size: number, opacity: number) {
  const m = new Mesh(new PlaneGeometry(size, size), new MeshBasicMaterial({ map: blobTexture(), transparent: true, opacity, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 2;
  return m;
}

/**
 * The FAST engineer. Walks between stands at a natural pace (never scrubbed by scroll), turns to the
 * visitor, looks at them, and points a straight arm at the exact component being discussed.
 */
export class Guide {
  readonly root = new Group();
  private model: Object3D | null = null;
  private mixer: AnimationMixer | null = null;
  private actions: Record<string, AnimationAction> = {};
  private bones: Record<string, Bone> = {};
  private mats: MeshStandardMaterial[] = [];
  private path: Vector3[] = [];
  private speed = 0;
  private heading = 0;
  private faceTarget: Vector3 | null = null;
  private pointTarget: Vector3 | null = null;
  private pointW = 0;
  private pointSide: "Left" | "Right" = "Right";
  private lookW = 0;
  private talkW = 0;
  private waving = 0;
  private body = blob(1.05, 0.55);
  private feet = [blob(0.34, 0.7), blob(0.34, 0.7)];
  readonly pos = new Vector3();
  lookTarget = new Vector3();
  groundY = 0;
  talking = false;
  loaded = false;

  async load() {
    const gltf = await loadGLB("models/engineer.glb");
    this.model = gltf.scene;
    this.root.add(gltf.scene, this.body, ...this.feet);
    this.mixer = new AnimationMixer(gltf.scene);
    for (const clip of gltf.animations) {
      const a = this.mixer.clipAction(clip);
      this.actions[clip.name] = a;
      if (clip.name === "Wave") {
        a.setLoop(LoopOnce, 1);
        a.clampWhenFinished = false;
      } else a.setLoop(LoopRepeat, Infinity);
    }
    for (const n of ["Idle", "Walk", "Talk"]) {
      const a = this.actions[n];
      if (a) {
        a.play();
        a.setEffectiveWeight(n === "Idle" ? 1 : 0);
      }
    }
    gltf.scene.traverse((o) => {
      if ((o as Bone).isBone) this.bones[o.name] = o as Bone;
      const sm = o as SkinnedMesh;
      if (sm.isSkinnedMesh) {
        sm.frustumCulled = false;
        this.mats.push(sm.material as MeshStandardMaterial);
      }
    });
    this.loaded = true;
  }

  /** Re-light for the scene the guide is entering. */
  setLook(look: Look) {
    if (!this.model) return;
    let i = 0;
    this.model.traverse((o) => {
      const sm = o as SkinnedMesh;
      if (!sm.isSkinnedMesh) return;
      const base = this.mats[i++];
      sm.material = dynMaterial(base, look);
    });
  }

  place(pos: Vector3, face?: Vector3) {
    this.pos.copy(pos);
    this.path.length = 0;
    this.speed = 0;
    if (face) this.heading = Math.atan2(face.x - pos.x, face.z - pos.z);
    this.faceTarget = face ?? null;
    this.pointW = 0;
    this.apply();
  }

  /** Walk to `to` (optionally through way-points), then turn towards `face`. */
  walkTo(to: Vector3, face?: Vector3, via: Vector3[] = []) {
    const last = this.path.length ? this.path[this.path.length - 1] : this.pos;
    if (last.distanceToSquared(to) < 0.01 && (this.path.length || this.pos.distanceToSquared(to) < 0.01)) {
      this.faceTarget = face ?? this.faceTarget;
      return;
    }
    this.path = [...via.map((v) => v.clone()), to.clone()];
    this.faceTarget = face ?? null;
  }

  get moving() {
    return this.path.length > 0;
  }

  distanceTo(p: Vector3) {
    return Math.hypot(this.pos.x - p.x, this.pos.z - p.z);
  }

  /** Point the right arm at a world position (null lowers it). */
  pointAt(p: Vector3 | null) {
    this.pointTarget = p ? p.clone() : null;
  }

  wave() {
    const a = this.actions.Wave;
    if (!a || this.waving > 0) return;
    a.reset().setEffectiveWeight(1).fadeIn(0.25).play();
    this.waving = a.getClip().duration;
  }

  private apply() {
    this.root.position.set(this.pos.x, this.pos.y, this.pos.z);
    if (this.model) this.model.rotation.y = this.heading;
  }

  update(dt: number) {
    if (!this.mixer || !this.model) return;
    // --- locomotion
    let targetSpeed = 0;
    if (this.path.length) {
      const next = this.path[0];
      v1.set(next.x - this.pos.x, 0, next.z - this.pos.z);
      const d = v1.length();
      let remaining = d;
      for (let i = 1; i < this.path.length; i++) remaining += this.path[i].distanceTo(this.path[i - 1]);
      const hurry = remaining > 9 ? 1.45 : 1;
      targetSpeed = Math.min(WALK_SPEED * hurry, Math.max(0.35, remaining * 1.8));
      if (d < Math.max(0.04, this.speed * dt * 1.1)) {
        this.pos.copy(next);
        this.path.shift();
      } else {
        const want = Math.atan2(v1.x, v1.z);
        this.heading = turn(this.heading, want, dt * 7);
        // only stride once roughly facing the way we are going
        const align = Math.cos(want - this.heading);
        const step = Math.min(this.speed * dt * MathUtils.clamp(align, 0, 1), d);
        this.pos.y += (next.y - this.pos.y) * Math.min(1, step / Math.max(d, 1e-3));
        this.pos.addScaledVector(v1.normalize(), step);
      }
    } else if (this.faceTarget) {
      let want = Math.atan2(this.faceTarget.x - this.pos.x, this.faceTarget.z - this.pos.z);
      if (this.pointTarget) {
        // open the body towards what is being shown, like a person presenting
        const tp = Math.atan2(this.pointTarget.x - this.pos.x, this.pointTarget.z - this.pos.z);
        const d = MathUtils.euclideanModulo(tp - want + Math.PI, Math.PI * 2) - Math.PI;
        want += MathUtils.clamp(d * 0.36, -0.75, 0.75);
      }
      this.heading = turn(this.heading, want, dt * 3.2);
    }
    this.speed = MathUtils.damp(this.speed, targetSpeed, 6, dt);
    const walkW = MathUtils.clamp(this.speed / (WALK_SPEED * 0.75), 0, 1);
    const standing = 1 - walkW;
    this.talkW = MathUtils.damp(this.talkW, this.talking && standing > 0.9 ? 0.85 : 0, 3, dt);
    this.actions.Walk?.setEffectiveWeight(walkW);
    this.actions.Walk?.setEffectiveTimeScale(Math.max(0.6, this.speed / WALK_SPEED));
    this.actions.Talk?.setEffectiveWeight(this.talkW * standing);
    this.actions.Idle?.setEffectiveWeight(Math.max(0.001, standing * (1 - this.talkW)));
    if (this.waving > 0) {
      this.waving -= dt;
      if (this.waving <= 0.3) this.actions.Wave?.fadeOut(0.3);
    }
    this.apply();
    this.mixer.update(dt);

    // --- procedural layers on top of the clips
    this.model.updateMatrixWorld(true);
    const still = standing > 0.85 && this.waving <= 0;
    this.lookW = MathUtils.damp(this.lookW, standing > 0.5 ? 1 : 0.25, 4, dt);
    this.pointW = MathUtils.damp(this.pointW, this.pointTarget && still ? 1 : 0, this.pointTarget ? 3.2 : 5, dt);
    if (this.lookW > 0.01) this.aimHead(this.lookW);
    if (this.pointTarget && this.pointW < 0.05) {
      // choose the arm on the same side as the component, once, before the arm rises
      const yaw = Math.atan2(this.pointTarget.x - this.pos.x, this.pointTarget.z - this.pos.z);
      const rel = MathUtils.euclideanModulo(yaw - this.heading + Math.PI, Math.PI * 2) - Math.PI;
      this.pointSide = rel > 0.1 ? "Left" : "Right";
    }
    if (this.pointW > 0.01 && this.pointTarget) this.aimArm(this.pointTarget, this.pointW);

    // --- contact shadows: one soft body shadow and one tight shadow under each shoe
    this.body.position.set(0, 0.012, 0);
    this.model.updateMatrixWorld(true);
    (["LeftFoot", "RightFoot"] as const).forEach((n, i) => {
      const b = this.bones[n];
      if (!b) return;
      b.getWorldPosition(v1);
      const f = this.feet[i];
      const lift = MathUtils.clamp((v1.y - this.pos.y - 0.1) / 0.16, 0, 1);
      f.position.set(v1.x - this.root.position.x, 0.014, v1.z - this.root.position.z);
      (f.material as MeshBasicMaterial).opacity = 0.75 * (1 - lift);
      f.scale.setScalar(1 + lift * 0.9);
    });
  }

  /** Rotate bone so that its local `axis` points along world direction `dir`, blended by w. */
  private aim(bone: Bone, axis: Vector3, dir: Vector3, w: number, maxAngle = Math.PI) {
    bone.getWorldQuaternion(q1);
    v3.copy(axis).applyQuaternion(q1).normalize();
    let ang = v3.angleTo(dir);
    if (ang < 1e-4) return;
    q2.setFromUnitVectors(v3, dir);
    if (ang > maxAngle) {
      q3.identity();
      q2.copy(q3.slerp(q2, maxAngle / ang));
      ang = maxAngle;
    }
    q2.multiply(q1); // desired world orientation
    bone.parent!.getWorldQuaternion(q3).invert();
    q3.multiply(q2); // desired local orientation
    bone.quaternion.slerp(q3, w);
    bone.updateMatrixWorld(true);
  }

  private aimHead(w: number) {
    const head = this.bones.Head;
    const neck = this.bones.Neck;
    if (!head || !neck) return;
    head.getWorldPosition(v1);
    v2.copy(this.lookTarget).sub(v1);
    // keep the gaze within what a neck can do relative to the body
    const yaw = Math.atan2(v2.x, v2.z);
    const rel = MathUtils.euclideanModulo(yaw - this.heading + Math.PI, Math.PI * 2) - Math.PI;
    const cl = MathUtils.clamp(rel, -1.15, 1.15) + this.heading;
    const flat = Math.hypot(v2.x, v2.z);
    const pitch = MathUtils.clamp(Math.atan2(v2.y, flat), -0.45, 0.5);
    v2.set(Math.sin(cl) * Math.cos(pitch), Math.sin(pitch), Math.cos(cl) * Math.cos(pitch));
    const FWD = v1.set(-1, 0, 0); // head / neck bones look along local -X (engineer.meta.json)
    this.aim(neck, FWD.clone(), v2, w * 0.4, 0.6);
    this.aim(head, FWD.clone(), v2, w * 0.75, 0.9);
  }

  private aimArm(target: Vector3, w: number) {
    const side = this.pointSide;
    const upper = this.bones[side + "Arm"];
    const fore = this.bones[side + "ForeArm"];
    const hand = this.bones[side + "Hand"];
    if (!upper || !fore || !hand) return;
    const ALONG = new Vector3(0, 1, 0); // limb bones run along local +Y
    upper.getWorldPosition(v1);
    const dir = v2.copy(target).sub(v1);
    // do not twist the arm behind the back: clamp to the front / right hemisphere of the body
    const yaw = Math.atan2(dir.x, dir.z);
    const rel = MathUtils.euclideanModulo(yaw - this.heading + Math.PI, Math.PI * 2) - Math.PI;
    const cl = (side === "Right" ? MathUtils.clamp(rel, -1.9, 0.45) : MathUtils.clamp(rel, -0.45, 1.9)) + this.heading;
    const flat = Math.hypot(dir.x, dir.z);
    const pitch = MathUtils.clamp(Math.atan2(dir.y, flat), -0.9, 1.1);
    dir.set(Math.sin(cl) * Math.cos(pitch), Math.sin(pitch), Math.cos(cl) * Math.cos(pitch));
    // a relaxed point keeps a little bend at the elbow: lead with the upper arm slightly low and outside
    const upperDir = dir.clone().addScaledVector(UP, -0.16).normalize();
    this.aim(upper, ALONG, upperDir, w);
    fore.getWorldPosition(v1);
    this.aim(fore, ALONG, dir.clone(), w);
    this.aim(hand, ALONG, dir.clone(), w * 0.9);
    for (const n of [side + "HandIndex1", side + "HandIndex2", side + "HandIndex3"]) {
      const b = this.bones[n];
      if (b) this.aim(b, ALONG, dir.clone(), w);
    }
  }
}

function turn(cur: number, want: number, maxStep: number) {
  const d = MathUtils.euclideanModulo(want - cur + Math.PI, Math.PI * 2) - Math.PI;
  return cur + MathUtils.clamp(d, -maxStep, maxStep);
}
