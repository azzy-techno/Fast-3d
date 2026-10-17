import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PerspectiveCamera,
  Vector3,
  Group,
  ACESFilmicToneMapping,
  BufferGeometry,
  Float32BufferAttribute,
  Color,
  Fog,
  DirectionalLight,
  HemisphereLight,
  AmbientLight,
} from "three";
import { Environment, Sky, PerformanceMonitor } from "@react-three/drei";

import { Exterior } from "./Exterior";
import { assetUrl } from "../lib/assets";
import { chapters, type Point } from "../data/chapters";
import { useTour } from "../store";
import { Building } from "./Building";
import { Room } from "./Primitives";
import { equipment } from "./Equipment";

const ExteriorEffects = lazy(() => import("./ExteriorEffects"));

const overview: Point = [49, 29, 67];
const overviewTarget: Point = [0, 10, -5];
const route = [
  { p: overview, target: overviewTarget },
  ...chapters.map((c, i) => ({
    p: [
      c.origin[0] + (i === 7 ? 12 : 11),
      c.origin[1] + (i === 4 ? 9 : 6.7),
      c.origin[2] + 15.5,
    ] as Point,
    target: [c.origin[0], c.origin[1] + 1.7, c.origin[2]] as Point,
  })),
  { p: [57, 43, 50] as Point, target: [0, 8, -9] as Point },
];
const fromPos = new Vector3(),
  toPos = new Vector3(),
  fromTarget = new Vector3(),
  toTarget = new Vector3(),
  focus = new Vector3(...overviewTarget),
  desired = new Vector3();

function World({
  onReady,
  rtl,
  mobile,
}: {
  onReady: () => void;
  rtl: boolean;
  mobile: boolean;
}) {
  const shell = useRef<Group>(null);
  const structure = useRef<Group>(null);
  const rooms = useRef<(Group | null)[]>([]);
  const { camera, size, gl, scene } = useThree();
  const exteriorFog = useMemo(() => new Color("#a2acac"), []);
  const interiorFog = useMemo(() => new Color("#0d2435"), []);
  const ready = useRef(false);
  const cameraInitialized = useRef(false);
  const sun = useRef<DirectionalLight>(null);
  const fill = useRef<DirectionalLight>(null);
  const hemisphere = useRef<HemisphereLight>(null);
  const ambient = useRef<AmbientLight>(null);
  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    const offset = mobile ? -0.02 : rtl ? 0.19 : -0.19;
    cam.setViewOffset(
      size.width,
      size.height,
      size.width * offset,
      mobile ? size.height * 0.19 : 0,
      size.width,
      size.height,
    );
    cam.updateProjectionMatrix();
  }, [camera, size, rtl, mobile]);
  useFrame((state, dt) => {
    const progress = useTour.getState().progress;
    const index = Math.min(11, Math.floor(progress));
    let blend = Math.max(0, Math.min(1, (progress - index - 0.25) / 0.65));
    blend = blend * blend * (3 - 2 * blend);
    const a = route[index],
      b = route[index + 1];
    fromPos.set(...a.p);
    toPos.set(...b.p);
    fromTarget.set(...a.target);
    toTarget.set(...b.target);
    desired.copy(fromPos).lerp(toPos, blend);
    // A gentle descending arc gives the arrival-to-rooftop movement spatial depth.
    if (index === 0) {
      desired.x += Math.sin(blend * Math.PI) * 5;
      desired.y += Math.sin(blend * Math.PI) * 3;
    }
    if (mobile) {
      const transition = Math.min(1, progress, 12 - progress);
      const scale = Math.max(
        1.08,
        (size.height / size.width) * (1.02 - 0.26 * transition),
      );
      const cam = camera as PerspectiveCamera;
      const shift = size.height * (0.19 + 0.055 * transition);
      if (cam.view && Math.abs(cam.view.offsetY - shift) > 0.1) {
        cam.view.offsetY = shift;
        cam.updateProjectionMatrix();
      }
      desired
        .sub(fromTarget.clone().lerp(toTarget, blend))
        .multiplyScalar(scale)
        .add(fromTarget.clone().lerp(toTarget, blend));
    }
    const desiredFocus = fromTarget.lerp(toTarget, blend);
    if (!cameraInitialized.current) {
      camera.position.copy(desired);
      focus.copy(desiredFocus);
      cameraInitialized.current = true;
    } else {
      const damping = 1 - Math.exp(-Math.min(dt, 0.08) * 7);
      camera.position.lerp(desired, damping);
      focus.lerp(desiredFocus, damping);
    }
    camera.lookAt(focus);
    const outside = 1 - Math.min(1, Math.max(0, (progress - 0.48) / 0.25));
    const exteriorAmount =
      progress > 11.65 ? Math.min(1, (progress - 11.65) / 0.3) : outside;
    if (sun.current) {
      sun.current.position.set(
        25 - 65 * exteriorAmount,
        55 - 25 * exteriorAmount,
        35 + 5 * exteriorAmount,
      );
      sun.current.intensity = 3.5 - 0.4 * exteriorAmount;
    }
    if (fill.current) fill.current.intensity = 2 - 1.1 * exteriorAmount;
    if (hemisphere.current)
      hemisphere.current.intensity = 2 - 1.2 * exteriorAmount;
    if (ambient.current) ambient.current.intensity = 0.7 - 0.3 * exteriorAmount;
    if (scene.fog instanceof Fog) {
      scene.fog.color.copy(interiorFog).lerp(exteriorFog, exteriorAmount);
      scene.fog.near = 90 + exteriorAmount * 20;
      scene.fog.far = 220 + exteriorAmount * 100;
    }
    if (scene.background instanceof Color)
      scene.background.copy(interiorFog).lerp(exteriorFog, exteriorAmount);
    if (shell.current)
      shell.current.visible = progress < 0.72 || progress > 11.7;
    if (structure.current)
      structure.current.visible = progress >= 0.6 && progress <= 11.8;
    rooms.current.forEach((g, i) => {
      if (g) g.visible = Math.abs(progress - (i + 1)) < 0.95;
    });
    if (!ready.current && state.clock.elapsedTime > 0.15) {
      ready.current = true;
      gl.domElement.dataset.ready = "true";
      onReady();
    }
  });
  return (
    <>
      <color attach="background" args={["#0d2435"]} />
      <fog attach="fog" args={["#0d2435", 110, 240]} />
      <ambientLight ref={ambient} intensity={0.4} />
      <hemisphereLight ref={hemisphere} args={["#bbd6e4", "#756b52", 0.8]} />
      <directionalLight
        ref={sun}
        position={[-40, 30, 40]}
        intensity={3.1}
        color="#ffe0af"
        castShadow
        shadow-mapSize={mobile ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-far={160}
        shadow-bias={-0.0007}
        shadow-normalBias={0.05}
      />
      <directionalLight
        ref={fill}
        position={[-25, 30, -15]}
        intensity={0.9}
        color="#7fb9e3"
      />
      <Environment
        files={assetUrl("exterior/sunset.hdr")}
        environmentIntensity={0.7}
      />
      <group ref={shell}>
        <Sky
          distance={450}
          sunPosition={[-100, 28, -70]}
          turbidity={7}
          rayleigh={1.2}
          mieCoefficient={0.008}
          mieDirectionalG={0.85}
        />
        <Exterior mobile={mobile} />
        <Building />
      </group>
      <group ref={structure} visible={false}>
        <Structure />
      </group>
      {chapters.map((chapter, i) => {
        const Equipment = equipment[i];
        return (
          <group
            key={chapter.id}
            ref={(el) => {
              rooms.current[i] = el;
            }}
            position={chapter.origin}
            visible={false}
          >
            <Room color={chapter.color}>
              <Equipment />
            </Room>
          </group>
        );
      })}
    </>
  );
}
export default function Experience({
  onReady,
  onFailure,
  rtl,
}: {
  onReady: () => void;
  onFailure: () => void;
  rtl: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mobile, setMobile] = useState(window.innerWidth < 900);
  const [enhanced, setEnhanced] = useState(true);
  const outside = useTour((s) => s.active === 0 || s.active === 12);
  useEffect(() => {
    const canvas = canvasRef.current;
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    canvas?.addEventListener("webglcontextlost", lost);
    return () => canvas?.removeEventListener("webglcontextlost", lost);
  }, [onFailure]);
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        ref={canvasRef}
        dpr={mobile ? 1 : [1, 1.25]}
        shadows
        camera={{
          position: overview,
          fov: mobile ? 48 : 42,
          near: 0.1,
          far: 400,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: ACESFilmicToneMapping,
        }}
        fallback={<span>3D rendering is unavailable. Use the photo tour.</span>}
        onCreated={({ gl }) => {
          gl.setClearColor("#0d2435");
        }}
      >
        <Suspense fallback={null}>
          <World onReady={onReady} rtl={rtl} mobile={mobile} />
          <PerformanceMonitor
            ms={400}
            iterations={3}
            bounds={() => [24, 45]}
            onDecline={() => setEnhanced(false)}
          />
          {!mobile && enhanced && outside && (
            <Suspense fallback={null}>
              <ExteriorEffects />
            </Suspense>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
function Structure() {
  const geometry = useMemo(() => {
    const vertices: number[] = [];
    const line = (a: Point, b: Point) => vertices.push(...a, ...b);
    for (const y of [-5, 3, 8, 15, 23]) {
      line([-17, y, 9], [17, y, 9]);
      line([17, y, 9], [17, y, -36]);
      line([17, y, -36], [-17, y, -36]);
      line([-17, y, -36], [-17, y, 9]);
    }
    for (const x of [-17, 17])
      for (const z of [-36, -14, 9]) line([x, -5, z], [x, 23, z]);
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#7ba9c1"
        transparent
        opacity={0.13}
        depthWrite={false}
      />
    </lineSegments>
  );
}
