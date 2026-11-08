import { Group, type Camera, type Scene, type WebGLRenderer } from "three";

/** Three.compileAsync traverses hidden meshes too. Supply a visible-only view
 * without reparenting objects or temporarily revealing every floor. */
export function visibleCompileRoot(scene: Scene) {
  const visible = new Group();
  visible.traverse = (visit) => scene.traverseVisible(visit);
  return visible;
}
export function compileVisible(
  gl: WebGLRenderer,
  scene: Scene,
  camera: Camera,
) {
  return gl.compileAsync(visibleCompileRoot(scene), camera, scene);
}
