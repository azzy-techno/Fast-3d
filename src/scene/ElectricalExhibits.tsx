import { Box, Cylinder, Pipe, Screen } from "./Primitives";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, TorusGeometry, MeshStandardMaterial } from "three";
import { journeyState } from "./journey";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const paintedHousing = new RoundedBoxGeometry(1, 1, 1, 2, 0.025);
const cabinetPaint = new MeshStandardMaterial({
  color: "#b6c4bd",
  roughness: 0.42,
  metalness: 0.4,
});
const transformerPaint = new MeshStandardMaterial({
  color: "#567f8b",
  roughness: 0.42,
  metalness: 0.45,
});

const guardRing = new TorusGeometry(1, 0.012, 6, 64);
const guardMaterial = new MeshStandardMaterial({
  color: "#a4b3b2",
  roughness: 0.32,
  metalness: 0.7,
});
function FanRotor() {
  const rotor = useRef<Group>(null);
  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)"),
    [],
  );
  useFrame((_, dt) => {
    if (
      rotor.current &&
      !reduced.matches &&
      journeyState.progress > 1.94 &&
      journeyState.progress < 3
    )
      rotor.current.rotation.z += Math.min(dt, 0.1) * 1.8;
  });
  return (
    <group
      ref={rotor}
      position={[0, 1.9, 0]}
      userData={{ dynamic: true }}
      name="electrical-demonstration-fan-rotor"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
          <Box
            p={[0.6, 0.2, 0.46]}
            s={[1.15, 0.32, 0.08]}
            r={[0.2, 0, 0.4]}
            c="#bac6be"
            metal={0.65}
          />
        </group>
      ))}
    </group>
  );
}

function Cabinet({
  x = 0,
  z = 0,
  small = false,
  open = false,
}: {
  x?: number;
  z?: number;
  small?: boolean;
  open?: boolean;
}) {
  const h = small ? 1.4 : 2.8;
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.12, 0]} s={[1.5, 0.24, 1.2]} c="#607b83" />
      <mesh
        geometry={paintedHousing}
        material={cabinetPaint}
        position={[0, h / 2 + 0.2, 0]}
        scale={[1.35, h, 1]}
        castShadow
        receiveShadow
      />
      <Box
        p={[0, h / 2 + 0.2, 0.52]}
        s={[1.16, h - 0.2, 0.04]}
        c={open ? "#203d48" : "#c8d3cd"}
      />
      <Screen p={[0, h - 0.25, 0.56]} s={[0.7, 0.42, 0.035]} color="#99c9bc" />
      {Array.from({ length: open ? 4 : 3 }, (_, i) => (
        <group key={i}>
          <Box
            p={[open ? -0.2 : 0, 0.5 + i * 0.26, 0.58]}
            s={[open ? 0.55 : 0.9, 0.09, 0.045]}
            c={open ? "#b3a272" : "#6d8389"}
          />
        </group>
      ))}
      {open &&
        [-0.3, 0, 0.3].map((x) => (
          <group key={x}>
            <Pipe
              a={[x, 0.35, 0.58]}
              b={[x, h - 0.7, 0.58]}
              radius={0.025}
              c="#b99b60"
            />
            {[0.45, h - 0.8].map((y) => (
              <Box key={y} p={[x, y, 0.55]} s={[0.12, 0.1, 0.06]} c="#775548" />
            ))}
          </group>
        ))}
      <Box p={[0.46, 1.1, 0.58]} s={[0.05, 0.28, 0.06]} c="#2b4652" />
      {/* Panel seams, fasteners, push buttons and cable entries add close-up scale. */}
      {[-0.61, 0.61].flatMap((x) =>
        [0.3, h + 0.05].map((y) => (
          <Cylinder
            key={`${x}-${y}`}
            p={[x, y, 0.555]}
            radius={0.026}
            height={0.025}
            r={[Math.PI / 2, 0, 0]}
            c="#6d7e80"
          />
        )),
      )}
      {[0.45, h - 0.1].map((y) => (
        <Box
          key={y}
          p={[-0.65, y, 0.52]}
          s={[0.08, 0.16, 0.08]}
          c="#7c8d90"
          metal={0.75}
        />
      ))}
      {[-0.27, -0.09, 0.09].map((x, i) => (
        <Cylinder
          key={x}
          p={[x, h * 0.52, 0.57]}
          radius={0.04}
          height={0.04}
          r={[Math.PI / 2, 0, 0]}
          c={["#5d8c70", "#ba6650", "#c4ad70"][i]}
        />
      ))}
      {[-0.45, -0.15, 0.15, 0.45].map((x) => (
        <group key={x}>
          <Cylinder
            p={[x, 0.24, 0.2]}
            radius={0.06}
            height={0.16}
            c="#788e95"
          />
          <Pipe
            a={[x, 0.17, 0.2]}
            b={[x, 0.06, 0.7]}
            radius={0.032}
            c="#263b47"
          />
        </group>
      ))}
      <Box
        p={[0, h * 0.69, 0.55]}
        s={[0.24, 0.15, 0.015]}
        c="#d3b66e"
        metal={0.1}
      />
      <Box
        p={[0, h * 0.69, 0.563]}
        s={[0.035, 0.11, 0.008]}
        r={[0, 0, -0.3]}
        c="#283a40"
      />
      {Array.from({ length: 7 }, (_, i) => (
        <Box
          key={i}
          p={[-0.35 + i * 0.12, 0.34, 0.56]}
          s={[0.065, 0.055, 0.025]}
          c="#2d4651"
        />
      ))}
      {open && (
        <group position={[-0.61, 0.2, 0.54]} rotation={[0, -1.2, 0]}>
          <Box
            p={[0.58, h / 2, 0]}
            s={[1.16, h - 0.2, 0.045]}
            c="#b8c6c0"
            metal={0.6}
          />
          <Box p={[0.58, h / 2, 0.03]} s={[0.9, h - 0.55, 0.015]} c="#536d78" />
          <Box p={[1.03, h * 0.4, 0.06]} s={[0.05, 0.24, 0.06]} c="#1d3540" />
        </group>
      )}
    </group>
  );
}
function Bench({ joints = false }: { joints?: boolean }) {
  return (
    <group>
      <Box p={[0, 0.95, 0]} s={[4.6, 0.15, 1.7]} c="#c1ad87" />
      <Box p={[0, 0.62, 0]} s={[3.7, 0.48, 1.35]} c="#536c75" metal={0.4} />
      {[-1.2, 0, 1.2].map((x) => (
        <group key={x}>
          <Box p={[x, 0.64, 0.69]} s={[1.14, 0.36, 0.04]} c="#a8b9b3" />
          <Box
            p={[x, 0.72, 0.73]}
            s={[0.42, 0.035, 0.055]}
            c="#334c57"
            metal={0.7}
          />
        </group>
      ))}
      {[-2, 2].map((x) => (
        <Box key={x} p={[x, 0.48, 0]} s={[0.1, 0.95, 1.5]} c="#627e85" />
      ))}
      {joints ? (
        [-0.5, 0, 0.5].map((z, i) => (
          <group key={z}>
            <Pipe
              a={[-1.8, 1.1, z]}
              b={[1.8, 1.1, z]}
              radius={0.07}
              c="#293f4b"
            />
            <Pipe
              a={[-0.55, 1.1, z]}
              b={[0.55, 1.1, z]}
              radius={0.15}
              c={["#bb915a", "#869ea2", "#425a63"][i]}
            />
            <Pipe
              a={[1.8, 1.1, z]}
              b={[2.1, 1.1, z]}
              radius={0.04}
              c="#b47f4d"
            />
          </group>
        ))
      ) : (
        <>
          <Box p={[-1, 1.25, 0]} s={[1.1, 0.5, 0.6]} c="#ceaf67" />
          <Screen p={[-1, 1.3, 0.32]} s={[0.75, 0.3, 0.03]} color="#9dd3c5" />
          <Box p={[0.8, 1.12, 0.1]} s={[0.8, 0.22, 0.65]} c="#466f7c" />
          {[-0.5, 0, 0.5].map((x) => (
            <Pipe
              key={x}
              a={[x, 1.04, 0.3]}
              b={[x + 0.6, 1.04, 0.5]}
              radius={0.022}
              c="#a78c50"
            />
          ))}
        </>
      )}
    </group>
  );
}
function Transformer() {
  return (
    <group>
      <Box p={[0, 0.15, 0]} s={[4.3, 0.3, 3]} c="#738b90" />
      <mesh
        geometry={paintedHousing}
        material={transformerPaint}
        position={[0, 1.4, 0]}
        scale={[3, 2.2, 2]}
        castShadow
        receiveShadow
      />
      {[-1.7, 1.7].flatMap((x) =>
        Array.from({ length: 12 }, (_, i) => (
          <Box
            key={`${x}-${i}`}
            p={[x, 1.4, -1 + i * 0.18]}
            s={[0.35, 2, 0.06]}
            c="#a3bab7"
            metal={0.6}
          />
        )),
      )}
      {[-0.9, 0, 0.9].map((x) => (
        <group key={x}>
          <Cylinder p={[x, 2.9, 0]} radius={0.12} height={0.9} c="#b3a588" />
          {[0, 1, 2, 3, 4].map((i) => (
            <Cylinder
              key={i}
              p={[x, 2.6 + i * 0.15, 0]}
              radius={0.23}
              height={0.06}
              c="#c2b69d"
            />
          ))}
        </group>
      ))}
      <Pipe
        a={[-1.5, 0.3, 1.2]}
        b={[1.5, 0.3, 1.2]}
        radius={0.08}
        c="#c0a15c"
      />
      <Cylinder
        p={[0, 3.65, -0.8]}
        radius={0.3}
        height={2.7}
        r={[0, 0, Math.PI / 2]}
        c="#738e94"
      />
      {[-1, 1].map((x) => (
        <Pipe
          key={x}
          a={[x, 2.4, -0.8]}
          b={[x, 3.5, -0.8]}
          radius={0.055}
          c="#7f979a"
        />
      ))}
      <Cylinder
        p={[0.75, 2.1, 1.06]}
        radius={0.16}
        height={0.04}
        r={[Math.PI / 2, 0, 0]}
        c="#d8d7c2"
      />
      <Box
        p={[0.75, 2.1, 1.09]}
        s={[0.025, 0.17, 0.015]}
        r={[0, 0, 0.5]}
        c="#274653"
      />
      <Box p={[-0.6, 1.45, 1.025]} s={[0.7, 0.4, 0.025]} c="#c0c6b6" />
      {[-1.4, 1.4].flatMap((x) =>
        [-0.9, 0.9].map((z) => (
          <Cylinder
            key={`${x}-${z}`}
            p={[x, 2.52, z]}
            radius={0.055}
            height={0.05}
            c="#bbc5bb"
          />
        )),
      )}
    </group>
  );
}
function Lighting({ outdoor = false }: { outdoor?: boolean }) {
  return (
    <group>
      {outdoor ? (
        <>
          <Cylinder p={[1.8, 2, 0]} radius={0.08} height={4} c="#90a7ac" />
          <Pipe a={[1.8, 4, 0]} b={[0.9, 4.4, 0]} radius={0.07} c="#90a7ac" />
          <Box p={[0.65, 4.4, 0]} s={[1, 0.18, 0.45]} c="#365867" />
          <Box p={[0.65, 4.3, 0]} s={[0.8, 0.04, 0.3]} c="#f0dcae" glow />
          <Box p={[-1.8, 2.8, 0]} s={[0.65, 1.2, 0.16]} c="#e5d6ad" glow />
        </>
      ) : (
        [-2, 0, 2].map((x) => (
          <group key={x}>
            <Pipe a={[x, 5.3, 0]} b={[x, 3.7, 0]} radius={0.025} c="#516c77" />
            <Cylinder p={[x, 3.6, 0]} radius={0.6} height={0.25} c="#355464" />
            <Cylinder
              p={[x, 3.46, 0]}
              radius={0.5}
              height={0.03}
              c="#e7d9b6"
              metal={0}
            />
          </group>
        ))
      )}
      <Box p={[0, 4.8, -1.3]} s={[5, 0.1, 0.2]} c="#f0dcae" glow />
    </group>
  );
}
export function ElectricalStationModel({ index }: { index: number }) {
  if (index === 3) return <Transformer />;
  if (index === 4) return <Bench joints />;
  if (index === 5)
    return (
      <group>
        <Cylinder
          p={[-1.5, 1.05, 0]}
          radius={0.8}
          height={1.4}
          r={[0, 0, Math.PI / 2]}
          c="#293f48"
        />
        {[-2.3, -0.7].map((x) => (
          <Cylinder
            key={x}
            p={[x, 1.05, 0]}
            radius={1}
            height={0.15}
            r={[0, 0, Math.PI / 2]}
            c="#bda57e"
            metal={0}
          />
        ))}
        {[-0.65, 0.65].map((z) => (
          <Box key={z} p={[1.5, 0.35, z]} s={[3.5, 0.15, 0.08]} c="#99afb2" />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <Box
            key={i}
            p={[i * 0.35, 0.32, 0]}
            s={[0.06, 0.06, 1.3]}
            c="#99afb2"
          />
        ))}
        {[-0.3, 0, 0.3].map((z) => (
          <Pipe
            key={z}
            a={[-0.2, 0.45, z]}
            b={[3, 0.45, z]}
            radius={0.06}
            c="#344d59"
          />
        ))}
      </group>
    );
  if (index === 7)
    return (
      <>
        <Cabinet x={-1.4} />
        <Cabinet x={1.4} small />
      </>
    );
  if (index === 8)
    return (
      <group>
        <Box p={[-0.7, 0.2, 0]} s={[4, 0.4, 2]} c="#526f7a" />
        <Box p={[-0.7, 1.25, 0]} s={[3.6, 1.7, 1.8]} c="#c6ae72" />
        <Box p={[-1.3, 1.25, 0.92]} s={[1.3, 1.3, 0.03]} c="#304a56" />
        {Array.from({ length: 10 }, (_, i) => (
          <Box
            key={i}
            p={[-1.3, 0.7 + i * 0.12, 0.95]}
            s={[1.2, 0.035, 0.05]}
            c="#9ab0ae"
          />
        ))}
        <Screen p={[0.5, 1.55, 0.93]} s={[0.6, 0.3, 0.03]} color="#a6c9bc" />
        <Pipe a={[-1.3, 2.1, 0]} b={[-1.3, 2.9, 0]} radius={0.1} c="#728c94" />
        <Cabinet x={3} small />
        <Pipe
          a={[1.1, 0.35, 1.2]}
          b={[3, 0.35, 1.2]}
          radius={0.08}
          c="#293f48"
        />
      </group>
    );
  if (index === 9 || index === 12 || index === 2)
    return (
      <group>
        <group position={[-2, 0, -0.7]}>
          <Cabinet open={index === 9} />
        </group>
        <group position={[1, 0, 0.9]} scale={0.8}>
          <Bench />
        </group>
      </group>
    );
  if (index === 10)
    return (
      <group>
        <Cabinet x={-2} />
        <Box p={[1, 1.6, 0]} s={[2.7, 3.2, 0.4]} c="#355969" />
        {[0.6, 1.5, 2.4].flatMap((y) =>
          [0.2, 1, 1.8].map((x) => (
            <Cylinder
              key={`${x}-${y}`}
              p={[x, y, 0.5]}
              radius={0.25}
              height={0.65}
              c="#bcb18c"
            />
          )),
        )}
      </group>
    );
  if (index === 11)
    return (
      <group>
        <Box p={[0, 1.8, 0]} s={[5, 3.6, 0.4]} c="#345969" />
        {[-1.6, 0, 1.6].map((x) => (
          <group key={x}>
            <Box p={[x, 2.1, 0.3]} s={[1.1, 1.4, 0.25]} c="#c5d0c9" />
            <Screen p={[x, 2.35, 0.45]} s={[0.8, 0.5, 0.03]} color="#9dcfc2" />
            <Pipe
              a={[x, 0.35, 0.3]}
              b={[x, 1.4, 0.3]}
              radius={0.06}
              c="#8eaaa9"
            />
          </group>
        ))}
      </group>
    );
  if (index === 13 || index === 14) return <Lighting outdoor={index === 14} />;
  if (index === 15)
    return (
      <group>
        <Box p={[0, 1.9, 0]} s={[3, 3, 0.7]} c="#9ab4b8" />
        <Cylinder
          p={[0, 1.9, 0.38]}
          radius={1.3}
          height={0.08}
          r={[Math.PI / 2, 0, 0]}
          c="#203e4c"
        />
        <FanRotor />
        <Cylinder
          p={[0, 1.9, 0.55]}
          radius={0.3}
          height={0.12}
          r={[Math.PI / 2, 0, 0]}
          c="#c2ad78"
        />
        {[0.45, 0.8, 1.15, 1.3].map((radius) => (
          <mesh
            key={radius}
            geometry={guardRing}
            material={guardMaterial}
            position={[0, 1.9, 0.72]}
            scale={[radius, radius, 1]}
            castShadow
          />
        ))}
        {Array.from({ length: 24 }, (_, i) => (
          <group
            key={i}
            position={[0, 1.9, 0.72]}
            rotation={[0, 0, (i * Math.PI) / 12]}
          >
            <Box
              p={[0, 0.67, 0]}
              s={[0.013, 1.3, 0.018]}
              c="#a4b3b2"
              metal={0.7}
            />
          </group>
        ))}
      </group>
    );
  return (
    <group>
      {[-1.6, 0, 1.6].map((x) => (
        <group key={x}>
          <Cabinet x={x} small={index === 6} />
          {index === 1 && (
            <Cylinder
              p={[x, 1.55, 0.6]}
              radius={0.18}
              height={0.05}
              r={[Math.PI / 2, 0, 0]}
              c="#d0ad64"
            />
          )}
        </group>
      ))}
    </group>
  );
}
