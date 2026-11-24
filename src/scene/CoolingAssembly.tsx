import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import {
  coolingFocus,
  coolingIndex,
  coolingStops,
  moduleOpening,
  placeModule,
  towerModules,
  towerOrigin,
  type TowerModule,
} from "../data/cooling";
import { assetUrl } from "../lib/assets";
import { journeyState } from "./journey";

export function CoolingAssembly() {
  const { nodes } = useGLTF(assetUrl("cooling/tower.glb"));
  const parts = useMemo(
    () =>
      (Object.keys(towerModules) as TowerModule[]).map((name) => {
        const carrier = new Group();
        const mesh = nodes[name].clone();
        const finishes = new Map<MeshStandardMaterial, MeshStandardMaterial>();
        mesh.traverse((object) => {
          if (!(object instanceof Mesh)) return;
          const tint = (original: MeshStandardMaterial) => {
            let finish = finishes.get(original);
            if (!finish) {
              finish = original.clone();
              finish.emissive.set("#47cab8");
              finish.emissiveIntensity = 0;
              finishes.set(original, finish);
            }
            return finish;
          };
          object.material = Array.isArray(object.material)
            ? object.material.map(tint)
            : tint(object.material);
          object.castShadow = object.receiveShadow = true;
        });
        carrier.add(mesh);
        return { name, carrier, finishes, stage: towerModules[name].stage };
      }),
    [nodes],
  );
  useEffect(
    () => () =>
      parts.forEach((part) =>
        part.finishes.forEach((material) => material.dispose()),
      ),
    [parts],
  );
  const projected = useMemo(() => new Vector3(), []);
  const marker = useRef<HTMLElement | null>(null);
  const previous = useRef<number | null>(null);
  const rotor = parts.find((part) => part.name === "Rotor")!.carrier;
  const motionPreference = useMemo(
    () => matchMedia("(prefers-reduced-motion: reduce)"),
    [],
  );
  useFrame(({ camera, size }, dt) => {
    const p = journeyState.progress;
    const pose = Math.max(0.7, Math.min(1.121, p));
    if (p >= 1.02 && p <= 1.121 && !motionPreference.matches) {
      // The drive slows as the casing opens, before the rotor leaves its shaft.
      const speed = 1 - moduleOpening(p, 1);
      rotor.rotation.y += Math.min(0.1, dt) * speed * 2.1;
    }
    if (pose !== previous.current) {
      const index = coolingIndex(p);
      for (const part of parts) {
        const yaw = placeModule(part.name, p, part.carrier.position);
        if (part.name !== "Rotor") part.carrier.rotation.y = yaw;
        const active = index > 0 && part.stage === index;
        part.finishes.forEach((material) => {
          material.emissiveIntensity = active ? 0.24 : 0;
        });
      }
      previous.current = pose;
    }
    if (p < 0.744 || p > 1.121) return;
    if (!marker.current?.isConnected)
      marker.current = document.getElementById("cooling-callout");
    if (!marker.current) return;
    const index = coolingIndex(p);
    coolingFocus(index, p, projected);
    projected.project(camera);
    const x = ((projected.x + 1) * size.width) / 2;
    const y = ((1 - projected.y) * size.height) / 2;
    marker.current.classList.toggle("pin-left", x > size.width - 52);
    marker.current.style.transform = `translate(${x}px,${y}px)`;
    marker.current.dataset.part = coolingStops[index].part;
    const badge = String(index + 1).padStart(2, "0");
    if (marker.current.textContent !== badge)
      marker.current.textContent = badge;
  });
  return (
    <group
      name="exploded-cooling-tower"
      position={towerOrigin}
      userData={{ dynamic: true }}
    >
      {parts.map((part) => (
        <primitive key={part.name} object={part.carrier} />
      ))}
    </group>
  );
}
