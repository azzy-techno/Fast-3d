import { MathUtils, type Object3D } from "three";
import type { FloorId } from "../../content/types";
import { attachAboutWalls } from "../aboutWalls";
import type { Flow } from "../fx";
import type { Look } from "../materials";
import type { FloorScene } from "./floor";

export type FloorCtx = { scene: FloorScene; exhibit: Object3D; flows: Flow[]; look: Look };
export type FloorAnimator = { enter?(): void; update(dt: number, t: number, px: number): void };

/** Pick-and-place cycle for the palletising robot: [time s, base yaw, shoulder, elbow] key poses. */
const ROBOT: [number, number, number, number][] = [
  [0.0, 0.0, 0.1, -0.05],
  [1.0, 0.0, 0.5, -0.62],
  [1.5, 0.0, 0.5, -0.62],
  [2.3, 0.0, 0.05, -0.1],
  [3.5, 0.55, 0.3, -0.1],
  [4.3, 0.55, 0.78, -0.52],
  [4.8, 0.55, 0.78, -0.52],
  [5.6, 0.55, 0.3, -0.1],
  [6.8, 0.0, 0.1, -0.05],
];

function robot(ctx: FloorCtx): FloorAnimator {
  const base = ctx.exhibit.getObjectByName("robot_base");
  const arm1 = ctx.exhibit.getObjectByName("robot_arm1");
  const arm2 = ctx.exhibit.getObjectByName("robot_arm2");
  for (const n of [base, arm1, arm2]) {
    if (!n) continue;
    n.userData.movable = true;
    n.traverse((c) => (c.matrixAutoUpdate = true));
  }
  const total = ROBOT[ROBOT.length - 1][0];
  return {
    update(_dt, t) {
      if (!base || !arm1 || !arm2) return;
      const u = t % total;
      let i = 0;
      while (i < ROBOT.length - 2 && ROBOT[i + 1][0] < u) i++;
      const a = ROBOT[i];
      const b = ROBOT[i + 1];
      const f = MathUtils.smootherstep((u - a[0]) / (b[0] - a[0]), 0, 1);
      base.rotation.y = MathUtils.lerp(a[1], b[1], f);
      // the arm reaches towards -Z (Blender +Y): tilt forward about X
      arm1.rotation.x = -MathUtils.lerp(a[2], b[2], f);
      arm2.rotation.x = -MathUtils.lerp(a[3], b[3], f);
    },
  };
}

/** Floor-specific behaviour beyond the generic node motions, flows and screens. */
export const animators: Partial<Record<FloorId, (ctx: FloorCtx) => FloorAnimator>> = {
  digital: robot,
  about: (ctx) => {
    attachAboutWalls(ctx.exhibit);
    return { update() {} };
  },
};
