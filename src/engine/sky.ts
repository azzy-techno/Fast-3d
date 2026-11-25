import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  EquirectangularReflectionMapping,
  ImageBitmapLoader,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
  WebGLRenderer,
  LinearFilter,
} from "three";
import { loadTexture, url } from "./assets";
import type { Look } from "./materials";

export type SkyName = "sunset" | "dusk";

/** Lighting rig values per sky for objects that are lit at runtime (people, cars). From tools/blender/sky.py. */
export const SKY_RIG: Record<SkyName, { sunDir: [number, number, number]; sun: [number, number, number]; sky: [number, number, number]; ground: [number, number, number]; fog: number; fogDensity: number }> = {
  // Blender (x, y, z) -> three (x, z, -y)
  sunset: { sunDir: [-0.386, 0.2, 0.9], sun: [1.5, 1.0, 0.62], sky: [0.42, 0.5, 0.66], ground: [0.3, 0.26, 0.22], fog: 0xb9bfc8, fogDensity: 0.0026 },
  dusk: { sunDir: [-0.38, 0.2, 0.9], sun: [0.75, 0.5, 0.55], sky: [0.4, 0.4, 0.6], ground: [0.2, 0.17, 0.2], fog: 0x9d93b5, fogDensity: 0.0024 },
};

const envCache = new Map<string, Promise<Texture>>();
const flipLoader = new ImageBitmapLoader();
flipLoader.setOptions({ imageOrientation: "flipY", premultiplyAlpha: "none", colorSpaceConversion: "none" });

/** Prefiltered reflection map from the small equirect image for this sky. */
export function loadEnv(renderer: WebGLRenderer, name: string): Promise<Texture> {
  let p = envCache.get(name);
  if (!p) {
    p = flipLoader.loadAsync(url(`tex/env_${name}.webp`)).then((bmp) => {
      const eq = new CanvasTexture(bmp as unknown as HTMLCanvasElement);
      eq.flipY = false;
      eq.mapping = EquirectangularReflectionMapping;
      eq.colorSpace = SRGBColorSpace;
      eq.generateMipmaps = false;
      eq.minFilter = LinearFilter;
      const pm = new PMREMGenerator(renderer);
      const rt = pm.fromEquirectangular(eq);
      pm.dispose();
      eq.dispose();
      return rt.texture;
    });
    envCache.set(name, p);
  }
  return p;
}

/** Sky dome: the top of the equirect image (zenith to 9 degrees below the horizon). */
export async function makeSky(name: SkyName): Promise<Mesh> {
  const tex = await loadTexture(`tex/sky_${name}.webp`, { mips: false });
  const R = 1800;
  const segU = 48;
  const segV = 14;
  const latTop = Math.PI / 2;
  const latBot = (-9 * Math.PI) / 180;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let j = 0; j <= segV; j++) {
    const v = j / segV;
    const lat = latTop + (latBot - latTop) * v;
    for (let i = 0; i <= segU; i++) {
      const u = i / segU;
      // three.js equirect convention: u = atan2(z, x) / 2pi + 0.5
      const az = (u - 0.5) * Math.PI * 2;
      pos.push(Math.cos(az) * Math.cos(lat) * R, Math.sin(lat) * R, Math.sin(az) * Math.cos(lat) * R);
      uv.push(u, v);
    }
  }
  for (let j = 0; j < segV; j++)
    for (let i = 0; i < segU; i++) {
      const a = j * (segU + 1) + i;
      idx.push(a, a + 1, a + segU + 1, a + 1, a + segU + 2, a + segU + 1);
    }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("uv", new BufferAttribute(new Float32Array(uv), 2));
  g.setIndex(idx);
  const m = new MeshBasicMaterial({ map: tex, side: BackSide, depthWrite: false, fog: false, toneMapped: false });
  const mesh = new Mesh(g, m);
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  mesh.matrixAutoUpdate = false;
  return mesh;
}

export function applyRig(look: Look, name: SkyName, scale = 1) {
  const r = SKY_RIG[name];
  look.sunDir.value.set(...r.sunDir).normalize();
  look.sunCol.value.setRGB(r.sun[0] * scale, r.sun[1] * scale, r.sun[2] * scale);
  look.sky.value.setRGB(r.sky[0] * scale, r.sky[1] * scale, r.sky[2] * scale);
  look.ground.value.setRGB(r.ground[0] * scale, r.ground[1] * scale, r.ground[2] * scale);
}

let glowTex: CanvasTexture | null = null;
/** Soft additive halo used on lamps and headlights: the cheap half of bloom. */
export function makeGlow(color: string | number, size: number, at: Vector3, opacity = 0.9): Sprite {
  if (!glowTex) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(255,255,255,0.55)");
    g.addColorStop(0.45, "rgba(255,255,255,0.14)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    glowTex = new CanvasTexture(c);
  }
  const m = new SpriteMaterial({ map: glowTex, color: new Color(color), blending: AdditiveBlending, depthWrite: false, transparent: true, opacity, fog: false, toneMapped: false });
  const s = new Sprite(m);
  s.scale.setScalar(size);
  s.position.copy(at);
  s.renderOrder = 5;
  return s;
}
