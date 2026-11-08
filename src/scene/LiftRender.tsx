import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTour } from "../store";
import { compileVisible } from "./compileVisible";

/** Own the draw step so no scene work competes with the compositor's doors. */
export function LiftRender({ onFailure }: { onFailure: () => void }) {
  const phase = useTour((s) => s.liftPhase);
  const invalidate = useThree((s) => s.invalidate);
  const pending = useRef(-1);
  const elapsed = useRef(0);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (phase === "travelling") invalidate();
  }, [phase, invalidate]);
  useFrame(({ clock }) => {
    // R3F resets its clock when changing frame-loop mode. Preserve animation
    // time so traffic and the engineer do not jump back when the lift reopens.
    if (clock.elapsedTime < elapsed.current)
      clock.elapsedTime += elapsed.current;
    elapsed.current = clock.elapsedTime;
  }, -2);
  useFrame(({ gl, scene, camera }) => {
    const tour = useTour.getState();
    if (tour.liftPhase === "idle") {
      gl.render(scene, camera);
      return;
    }
    if (tour.liftPhase !== "travelling" || pending.current === tour.jumpVersion)
      return;
    const version = tour.jumpVersion;
    pending.current = version;
    const current = () =>
      alive.current &&
      useTour.getState().liftPhase === "travelling" &&
      useTour.getState().jumpVersion === version;
    // Camera, visible floor and lighting have been updated by earlier useFrame
    // callbacks. Prepare just that destination, then draw exactly once.
    compileVisible(gl, scene, camera)
      .then(() => {
        if (!current()) return;
        gl.render(scene, camera);
        gl.domElement.dataset.renderedJumpVersion = String(version);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (current()) useTour.getState().setLiftFrameReady(version);
          }),
        );
      })
      .catch(() => {
        if (current()) onFailure();
      });
  }, 1);
  return null;
}
