import { ContactShadow } from "./ContactShadow";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Quaternion, Vector3, MathUtils } from "three";
import { useHumanRig, groundHuman, standHuman } from "./HumanRig";
import { electricalStationAt, ELECTRICAL_EXIT } from "./electricalTour";
import { useTour } from "../store";
import {
  journeyState,
  routeDistance,
  sampleGuide,
  guideIsPresenting,
} from "./journey";
export function Host() {
  const root = useRef<Group>(null);
  const rig = useHumanRig();
  const state = useMemo(
    () => ({
      p: new Vector3(),
      face: new Vector3(),
      previous: new Vector3(),
      delta: new Vector3(),
      a: new Vector3(),
      b: new Vector3(),
      direction: new Vector3(),
      q: new Quaternion(),
      parent: new Quaternion(),
      world: new Quaternion(),
      walking: 0,
      initialized: false,
      angle: 0,
      gaze: 0,
      rightPresents: true,
      telemetry: 0,
      phase: 0,
      wave: 1,
      presentation: 0,
      presentationTime: 0,
      previousProgress: 0,
      jumpVersion: 0,
      up: new Vector3(0, 1, 0),
    }),
    [],
  );
  useFrame(({ clock, camera, gl }, dt) => {
    if (!root.current) return;
    const p = journeyState.progress;
    state.telemetry += dt;
    const report = state.telemetry >= 0.1;
    if (report) state.telemetry = 0;
    root.current.visible = !(p >= 1.602 && p < 1.67);
    if (!root.current.visible) {
      state.initialized = false;
      return;
    }
    sampleGuide(p, state.p, state.face);
    const cut =
      state.previousProgress < ELECTRICAL_EXIT.cut !== p < ELECTRICAL_EXIT.cut;
    const arriving =
      state.jumpVersion !== useTour.getState().jumpVersion ||
      !state.initialized;
    if (cut || arriving) {
      state.previous.copy(state.p);
      state.walking = 0;
      if (cut) state.angle += Math.PI;
      state.jumpVersion = useTour.getState().jumpVersion;
    }
    state.previousProgress = p;
    const distance = state.initialized
      ? Math.hypot(state.p.x - state.previous.x, state.p.z - state.previous.z)
      : 0;
    state.delta.copy(state.p).sub(state.previous);
    state.previous.copy(state.p);
    state.initialized = true;
    const walking =
      distance / Math.max(dt, 0.001) > 0.06 && p > 0.7 && p < 11.87 ? 1 : 0;
    state.walking = MathUtils.damp(
      state.walking,
      walking,
      10,
      Math.min(dt, 0.1),
    );
    state.phase += (distance / rig.strideLength) * rig.walk.getClip().duration;
    rig.walk.time = state.phase % rig.walk.getClip().duration;
    rig.idle.time = clock.elapsedTime % rig.idle.getClip().duration;
    rig.walk.setEffectiveWeight(state.walking);
    rig.idle.setEffectiveWeight(1 - state.walking);
    rig.mixer.update(0);
    standHuman(rig, 1 - state.walking);
    const waving = p < 0.7 || p >= 11.87 || (p >= 11.68 && p <= 11.69);
    if (arriving) state.wave = waving ? 1 : 0;
    state.wave = MathUtils.damp(
      state.wave,
      waving ? 1 : 0,
      8,
      Math.min(dt, 0.1),
    );
    const presentingHere = guideIsPresenting(p);

    const settled = presentingHere && state.walking < 0.2;
    state.presentation = MathUtils.damp(
      state.presentation,
      settled ? 1 : 0,
      5,
      Math.min(dt, 0.1),
    );
    state.presentationTime = settled ? state.presentationTime + dt : 0;
    // Each stop gets its own explanatory rhythm. Feet stay planted while the
    // upper body turns, nods and uses an open supporting hand.
    const rhythm =
      state.presentationTime * 1.6 +
      (electricalStationAt(p)?.number ?? 0) * 0.7;
    const emphasis = (Math.sin(rhythm) + 1) / 2;
    const gestureWeight = state.presentation;
    if (gestureWeight > 0.001) {
      rig.bones
        .get("Spine2")
        ?.rotateY(Math.sin(rhythm * 0.45) * 0.045 * gestureWeight);
      // Alternate eye contact with the visitor and a glance along the pointing arm.
      const visitor = MathUtils.smoothstep(
        Math.cos(rhythm * 0.52),
        -0.45,
        0.45,
      );
      state.a.copy(state.face).sub(state.p).setY(0).normalize();
      state.b.copy(camera.position).sub(state.p).setY(0).normalize();
      state.a.lerp(state.b, visitor);
      const azimuth = Math.atan2(state.a.x, state.a.z) - state.angle;
      const glance = Math.atan2(Math.sin(azimuth), Math.cos(azimuth));
      state.gaze = MathUtils.damp(
        state.gaze,
        MathUtils.clamp(glance, -0.52, 0.52),
        5,
        Math.min(dt, 0.1),
      );
      rig.bones.get("Head")?.rotateY(state.gaze * gestureWeight);
      rig.bones
        .get("Head")
        ?.rotateX(Math.sin(rhythm * 1.4) * 0.055 * gestureWeight);
    }
    const direction = waving
      ? state.delta.copy(camera.position).sub(state.p)
      : walking
        ? state.delta
        : presentingHere
          ? state.delta.copy(state.face).sub(state.p)
          : state.delta.set(Math.sin(state.angle), 0, Math.cos(state.angle));
    if (!walking && presentingHere) {
      // Stand side-on between the visitor and the exhibit, so the presenting
      // arm is visible instead of disappearing behind the engineer's torso.
      state.a.copy(state.face).sub(state.p).setY(0).normalize();
      state.b.copy(camera.position).sub(state.p).setY(0).normalize();
      direction.copy(state.a).add(state.b);
    }
    if (direction.lengthSq() > 0.000001) {
      const desired = Math.atan2(direction.x, direction.z);
      if (arriving) state.angle = desired;
      state.angle +=
        Math.atan2(
          Math.sin(desired - state.angle),
          Math.cos(desired - state.angle),
        ) *
        (1 - Math.exp(-Math.min(dt, 0.1) * 9));
    }
    root.current.position.copy(state.p);
    root.current.rotation.y = state.angle;
    root.current.updateMatrixWorld(true);
    groundHuman(rig, state.p.y);
    // Layer world-space arm gestures onto the walk/idle skeleton. The imported
    // mesh has articulated hands and fingers; no separate cartoon limb meshes.
    const aim = (
      boneName: string,
      childName: string,
      x: number,
      y: number,
      z: number,
      weight: number,
    ) => {
      const bone = rig.bones.get(boneName),
        child = rig.bones.get(childName);
      if (!bone || !child) return;
      bone.getWorldPosition(state.a);
      child.getWorldPosition(state.b);
      state.b.sub(state.a).normalize();
      state.direction
        .set(x, y, z)
        .normalize()
        .applyAxisAngle(state.up, state.angle);
      state.q.setFromUnitVectors(state.b, state.direction);
      bone.getWorldQuaternion(state.world);
      state.q.multiply(state.world);
      bone.parent!.getWorldQuaternion(state.parent).invert();
      state.q.premultiply(state.parent);
      bone.quaternion.slerp(state.q, weight);
      bone.updateMatrixWorld(true);
    };
    // Choose the exhibit-side arm in the guide's local frame. Hysteresis
    // keeps the arm stable for exhibits almost directly ahead.
    if (settled) {
      const localX = state.a
        .copy(state.face)
        .sub(state.p)
        .normalize()
        .applyAxisAngle(state.up, -state.angle).x;
      if (Math.abs(localX) > 0.25) state.rightPresents = localX < 0;
    }
    const lead = state.rightPresents ? "Right" : "Left";
    const support = state.rightPresents ? "Left" : "Right";
    const supportSide = state.rightPresents ? 1 : -1;
    // A previous station's aim must not masquerade as a settled new gesture.
    if (report) delete gl.domElement.dataset.guideAim;
    if (state.wave > 0.01) {
      const beat = Math.sin(clock.elapsedTime * 4.8);
      const waveArc =
        0.18 + 0.82 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 1.25));
      aim(
        "RightArm",
        "RightForeArm",
        -0.73,
        0.45 + 0.07 * waveArc,
        0.17,
        state.wave,
      );
      aim(
        "RightForeArm",
        "RightHand",
        beat * 0.42 * waveArc,
        1,
        0.12,
        state.wave,
      );
      rig.bones
        .get("RightHand")
        ?.rotateY(
          Math.sin(clock.elapsedTime * 4.8 - 0.4) * 0.21 * waveArc * state.wave,
        );
    } else if (state.walking < 0.2 && presentingHere) {
      // Aim in world space at this exhibit, then transform into the guide frame.
      // The hand extends along the same ray, not a fixed local "point right" pose.
      const shoulder = rig.bones.get(lead + "Arm")!;
      shoulder.getWorldPosition(state.a);
      state.direction
        .copy(state.face)
        .sub(state.a)
        .normalize()
        .applyAxisAngle(state.up, -state.angle);
      const dx = state.direction.x,
        dy = state.direction.y,
        dz = state.direction.z;
      const presenting = 1 - state.walking;
      // Vary the elbow's emphasis while keeping the forearm aimed at the
      // actual equipment surface, including overhead lighting fixtures.
      aim(
        lead + "Arm",
        lead + "ForeArm",
        dx,
        dy - 0.25 - emphasis * 0.22 * gestureWeight,
        dz,
        presenting,
      );
      const elbow = rig.bones.get(lead + "ForeArm")!;
      elbow.getWorldPosition(state.a);
      state.direction
        .copy(state.face)
        .sub(state.a)
        .normalize()
        .applyAxisAngle(state.up, -state.angle);
      aim(
        lead + "ForeArm",
        lead + "Hand",
        state.direction.x,
        state.direction.y,
        state.direction.z,
        presenting,
      );
      const hand = rig.bones.get(lead + "Hand")!;
      // Direct the index knuckle at the equipment after the shoulder and elbow settle.
      hand.getWorldPosition(state.a);
      state.direction
        .copy(state.face)
        .sub(state.a)
        .normalize()
        .applyAxisAngle(state.up, -state.angle);
      aim(
        lead + "Hand",
        lead + "HandIndex1",
        state.direction.x,
        state.direction.y,
        state.direction.z,
        presenting * 0.9,
      );
      elbow.getWorldPosition(state.a);
      hand.getWorldPosition(state.b);
      state.direction.copy(state.face).sub(state.a).normalize();
      if (report)
        gl.domElement.dataset.guideAim = state.b
          .sub(state.a)
          .normalize()
          .dot(state.direction)
          .toFixed(4);
    }
    if (gestureWeight > 0.001) {
      aim(
        support + "Arm",
        support + "ForeArm",
        supportSide * 0.35,
        -0.83 + emphasis * 0.17,
        0.5,
        gestureWeight,
      );
      aim(
        support + "ForeArm",
        support + "Hand",
        supportSide * (0.18 + emphasis * 0.22),
        -0.08 + emphasis * 0.34,
        0.85,
        gestureWeight,
      );
      rig.bones
        .get(support + "Hand")
        ?.rotateZ(supportSide * (-0.5 + emphasis * 0.25) * gestureWeight);
      if (!report) return;
      root.current.updateMatrixWorld(true);
      rig.bones.get(support + "Hand")?.getWorldPosition(state.a);
      gl.domElement.dataset.guidePresentationHand = state.a
        .toArray()
        .map((n) => n.toFixed(4))
        .join(",");
    } else if (report) {
      delete gl.domElement.dataset.guidePresentationHand;
    }
    if (!report) return;
    state.b.set(state.p.x, state.p.y + 1, state.p.z).project(camera);
    gl.domElement.dataset.guideScreen = [state.b.x, state.b.y]
      .map((n) => n.toFixed(3))
      .join(",");
    gl.domElement.dataset.guideCameraDistance = Math.hypot(
      camera.position.x - state.p.x,
      camera.position.z - state.p.z,
    ).toFixed(3);
    gl.domElement.dataset.hostScale = rig.model.scale.x.toFixed(4);
    gl.domElement.dataset.guide = waving
      ? "waving"
      : state.walking > 0.5
        ? "walking"
        : presentingHere
          ? "presenting"
          : "standing";
    gl.domElement.dataset.guidePosition = state.p
      .toArray()
      .map((n) => n.toFixed(2))
      .join(",");
    gl.domElement.dataset.guideDistance = routeDistance(p).toFixed(2);
  });
  return (
    <group ref={root} name="FAST-human-guide">
      <ContactShadow width={1.12} length={1.45} height={0.045} />
      <primitive object={rig.model} />
    </group>
  );
}
