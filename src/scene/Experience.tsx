import { electricalStationAt } from "./electricalTour";
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PerspectiveCamera,
  Vector3,
  Group,
  ACESFilmicToneMapping,
  Color,
  Fog,
  DirectionalLight,
  HemisphereLight,
  AmbientLight,
  SpotLight,
} from "three";
import { Environment, Sky, PerformanceMonitor } from "@react-three/drei";
import { Host } from "./Host";
import { Reception } from "./PremiumInterior";
import { Exterior } from "./Exterior";
import { assetUrl } from "../lib/assets";
import { useTour } from "../store";
import { Building } from "./Building";
import { Interior, RoofAccess } from "./Architecture";
import { Atmosphere } from "./Atmosphere";
import { journeyState, sampleJourney } from "./journey";
const ExteriorEffects = lazy(() => import("./ExteriorEffects"));

function World({
  onReady,
  rtl,
  mobile,
}: {
  onReady: () => void;
  rtl: boolean;
  mobile: boolean;
}) {
  const shell = useRef<Group>(null),
    city = useRef<Group>(null);
  const { camera, size, gl, scene } = useThree();
  const ready = useRef(false),
    initialized = useRef(false),
    warmed = useRef(false);
  const progress = useRef(useTour.getState().progress);
  const sun = useRef<DirectionalLight>(null),
    hemisphere = useRef<HemisphereLight>(null),
    ambient = useRef<AmbientLight>(null),
    localLight = useRef<SpotLight>(null);
  const vectors = useMemo(
    () => ({
      p: new Vector3(),
      target: new Vector3(),
      exterior: new Color("#aebfc1"),
      interior: new Color("#bdc4bc"),
    }),
    [],
  );
  useEffect(() => {
    let cancelled = false;
    const hidden: Group[] = [];
    scene.traverse((object) => {
      if (!object.visible) {
        hidden.push(object as Group);
        object.visible = true;
      }
    });
    const compile = gl.compileAsync(scene, camera);
    hidden.forEach((object) => {
      object.visible = false;
    });
    compile
      .then(() => {
        if (!cancelled) warmed.current = true;
      })
      .catch(() => {
        if (!cancelled) warmed.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);
  useFrame((_, dt) => {
    const requested = useTour.getState().progress;
    if (!initialized.current) {
      progress.current = requested;
      initialized.current = true;
    }
    // Smooth a single scalar, then sample the constrained route. Interpolating
    // camera positions independently would cut corners through corridor walls.
    progress.current +=
      (requested - progress.current) * (1 - Math.exp(-Math.min(dt, 0.1) * 13));
    const p = progress.current;
    journeyState.progress = p;
    const fov =
      sampleJourney(p, vectors.p, vectors.target) +
      (mobile && p >= 2 && p < 2.84 ? 12 : 0);
    const inside =
      Math.min(1, Math.max(0, (p - 1.3) / 0.13)) *
      (1 - Math.min(1, Math.max(0, (p - 11.77) / 0.08)));
    const outside = 1 - inside;
    const cam = camera as PerspectiveCamera;
    if (mobile && outside > 0) {
      const scale =
        1 +
        Math.min(0.45, Math.max(0, (size.height / size.width) * 0.95 - 1)) *
          outside;
      vectors.p.sub(vectors.target).multiplyScalar(scale).add(vectors.target);
    }
    camera.position.copy(vectors.p);
    camera.lookAt(vectors.target);
    // Lens shifts compose the architecture beside/beyond the copy without
    // moving the camera out through an interior wall on narrow screens.
    const offsetX = mobile
      ? 0
      : (rtl ? 1 : -1) * (0.19 * outside + 0.03 * inside);
    const offsetY = mobile ? 0.19 * outside + 0.1 * inside : 0;
    const nextFov = fov + (mobile ? inside * 8 : 0);
    if (
      Math.abs(cam.fov - nextFov) > 0.02 ||
      !cam.view ||
      Math.abs(cam.view.offsetX - size.width * offsetX) > 0.1 ||
      Math.abs(cam.view.offsetY - size.height * offsetY) > 0.1 ||
      cam.view.fullWidth !== size.width ||
      cam.view.fullHeight !== size.height
    ) {
      cam.fov = nextFov;
      cam.setViewOffset(
        size.width,
        size.height,
        size.width * offsetX,
        size.height * offsetY,
        size.width,
        size.height,
      );
      cam.updateProjectionMatrix();
    }
    if (sun.current) sun.current.intensity = 2.6 * outside + 0.8 * inside;
    if (ambient.current)
      ambient.current.intensity = 0.36 * outside + 0.38 * inside;
    if (hemisphere.current)
      hemisphere.current.intensity = 0.85 * outside + 0.75 * inside;
    if (localLight.current) {
      localLight.current.position.set(
        vectors.p.x,
        vectors.p.y + 1,
        vectors.p.z + 1,
      );
      localLight.current.intensity = 32 * inside;
      localLight.current.target.position.set(
        vectors.target.x,
        vectors.target.y - 1.1,
        vectors.target.z,
      );
      localLight.current.target.updateMatrixWorld();
    }
    if (scene.fog instanceof Fog) {
      scene.fog.color.copy(vectors.interior).lerp(vectors.exterior, outside);
      scene.fog.near = 35 + outside * 165;
      scene.fog.far = 100 + outside * 400;
    }
    if (scene.background instanceof Color)
      scene.background.copy(vectors.interior).lerp(vectors.exterior, outside);
    if (shell.current) shell.current.visible = p < 1.38 || p > 11.825;
    if (city.current) city.current.visible = true;
    gl.domElement.dataset.journey = p.toFixed(4);
    gl.domElement.dataset.cameraHeight = camera.position.y.toFixed(3);
    gl.domElement.dataset.towerHeight = "83";
    gl.domElement.dataset.electricalStation = String(
      electricalStationAt(p)?.number ?? 0,
    );
    if (warmed.current && !ready.current) {
      ready.current = true;
      gl.domElement.dataset.ready = "true";
      onReady();
    }
  }, -1);
  return (
    <>
      <color attach="background" args={["#aebfc1"]} />
      <fog attach="fog" args={["#aebfc1", 125, 350]} />
      <ambientLight ref={ambient} intensity={0.36} />
      <hemisphereLight ref={hemisphere} args={["#d4e6eb", "#82745e", 0.85]} />
      <directionalLight
        ref={sun}
        position={[-60, 120, 65]}
        intensity={2.6}
        color="#ffdfb1"
        castShadow
        shadow-mapSize={mobile ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={110}
        shadow-camera-bottom={-100}
        shadow-camera-far={260}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
      />
      <directionalLight
        position={[20, 30, -15]}
        intensity={0.65}
        color="#bedce9"
      />
      <spotLight
        ref={localLight}
        color="#fff1d9"
        intensity={0}
        distance={18}
        decay={1.7}
        angle={1.15}
        penumbra={0.8}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-near={0.2}
        shadow-camera-far={20}
        shadow-bias={-0.0003}
        shadow-normalBias={0.015}
      />
      <Environment
        files={assetUrl("exterior/sunset.hdr")}
        environmentIntensity={0.65}
      />
      <group ref={city}>
        <Sky
          distance={450}
          sunPosition={[-100, 40, -70]}
          turbidity={3.2}
          rayleigh={1.5}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
        <Exterior mobile={mobile} />
      </group>
      <Atmosphere mobile={mobile} />
      <group ref={shell}>
        <Building />
      </group>
      <RoofAccess />
      <Interior />
      <Reception />
      <Host />
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
        dpr={mobile ? 1 : enhanced ? [1, 1.25] : 1}
        shadows
        camera={{ position: [49, 29, 67], fov: 42, near: 0.08, far: 1000 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: ACESFilmicToneMapping,
        }}
        fallback={<span>3D rendering is unavailable. Use the photo tour.</span>}
      >
        <Suspense fallback={null}>
          <World onReady={onReady} rtl={rtl} mobile={mobile} />
          <PerformanceMonitor
            ms={500}
            iterations={4}
            bounds={() => [24, 45]}
            onDecline={() => setEnhanced(false)}
          />
          {!mobile && enhanced && (
            <Suspense fallback={null}>
              <ExteriorEffects />
            </Suspense>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
