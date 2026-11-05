import type { Scene, WebGLRenderer, Camera } from "three";

/** Opt-in local profiling. No collection or network requests during normal use. */
export function installRenderProbe(gl: WebGLRenderer, scene: Scene) {
  if (!new URLSearchParams(location.search).has("profile-renderer")) return;
  const frames: { submitMs: number; calls: number; triangles: number }[] = [];
  const render = gl.render.bind(gl);
  gl.render = (world: Scene, camera: Camera) => {
    const start = performance.now();
    render(world, camera);
    if (world === scene) {
      frames.push({
        submitMs: performance.now() - start,
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
      });
      if (frames.length > 120) frames.shift();
    }
  };
  Object.assign(window, {
    __fastRenderProbe: {
      reset: () => {
        frames.length = 0;
      },
      snapshot: () => {
        let objects = 0,
          visibleObjects = 0;
        scene.traverse(() => objects++);
        scene.traverseVisible(() => visibleObjects++);
        return {
          frames: frames.slice(),
          objects,
          visibleObjects,
          memory: { ...gl.info.memory },
          programs: gl.info.programs?.length,
        };
      },
    },
  });
}
