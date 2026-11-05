import { useLayoutEffect, type RefObject } from "react";
import type { Group } from "three";

/** Three normally updates every hidden descendant's matrices every frame.
 * Floor/city roots can skip that traversal until their visibility gate opens.
 * The first visible frame forces propagation, including transforms made asleep. */
export function sleepHiddenTree(group: Group) {
  const update = group.updateMatrixWorld;
  let sleeping = false;
  group.updateMatrixWorld = function (force) {
    if (!this.visible) {
      sleeping = true;
      return;
    }
    update.call(this, force || sleeping);
    sleeping = false;
  };
  return () => {
    group.updateMatrixWorld = update;
  };
}
export function useVisibilityUpdates(ref: RefObject<Group | null>) {
  useLayoutEffect(() => {
    if (ref.current) return sleepHiddenTree(ref.current);
  }, [ref]);
}
