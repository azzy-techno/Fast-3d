import {
  Color,
  DoubleSide,
  FrontSide,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Texture,
  Vector2,
  Vector3,
  type Material,
} from "three";

/** Baked lighting is stored as sqrt(value / RANGE); see tools/blender/fastlib.py. */
export const RANGE = 4;

/** Per-scene lighting state shared by every material in that scene. */
export type Look = {
  env: Texture | null;
  envIntensity: number;
  exposure: { value: number };
  sky: { value: Color };
  ground: { value: Color };
  sunDir: { value: Vector3 };
  sunCol: { value: Color };
  lightmaps: Record<string, Texture>;
  textures: Record<string, Texture>;
  /** Named reflection maps for parts of the scene (e.g. an interior seen from outside). */
  envs: Record<string, Texture>;
  /** City facades: x = share of windows that are lit, y = brightness of lit windows. */
  windows: { value: Vector2 };
};

export const makeLook = (): Look => ({
  env: null,
  envIntensity: 1,
  exposure: { value: 1 },
  sky: { value: new Color(0.55, 0.6, 0.7) },
  ground: { value: new Color(0.22, 0.2, 0.18) },
  sunDir: { value: new Vector3(0.4, 0.5, 0.6).normalize() },
  sunCol: { value: new Color(1.2, 0.95, 0.7) },
  lightmaps: {},
  textures: {},
  envs: {},
  windows: { value: new Vector2(0.22, 1.1) },
});

type Mode = "lm" | "vc" | "dyn";

const DECL = /* glsl */ `
uniform float fastExposure;
uniform vec3 fastSky;
uniform vec3 fastGround;
uniform vec3 fastSunDir;
uniform vec3 fastSunCol;
uniform vec2 fastWindows;
`;

// Replaces the stock lights_fragment_maps chunk: irradiance comes from the bake (or a tiny analytic rig
// for moving objects) instead of image-based diffuse, and reflections are occluded where the bake is dark.
const MAPS = /* glsl */ `
#if defined( RE_IndirectDiffuse )
  #if defined( FAST_LM )
    vec3 fastBake = texture2D( lightMap, vLightMapUv ).rgb;
    fastBake = fastBake * fastBake * ${RANGE.toFixed(1)};
  #elif defined( FAST_VC )
    vec3 fastBake = vColor.rgb;
    fastBake = fastBake * fastBake * ${RANGE.toFixed(1)};
  #else
    vec3 fastN = inverseTransformDirection( geometryNormal, viewMatrix );
    vec3 fastBake = mix( fastGround, fastSky, fastN.y * 0.5 + 0.5 ) + fastSunCol * max( dot( fastN, fastSunDir ), 0.0 );
  #endif
  irradiance = fastBake * PI * fastExposure;
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
  float fastOcc = clamp( dot( fastBake, vec3( 0.5 ) ) + 0.12, 0.0, 1.0 );
  radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness ) * fastOcc;
#endif
`;

// City facades get their window grid in the shader: no textures, and the lit share follows the time of day.
const WINDOWS = /* glsl */ `
#ifdef FAST_WINDOWS
  {
    vec3 wN = inverseTransformDirection( normal, viewMatrix );
    if ( abs( wN.y ) < 0.5 ) {
      vec2 cell = vUv / vec2( 2.4, 3.4 );
      vec2 fw = fwidth( cell );
      float lod = clamp( 1.0 - max( fw.x, fw.y ) * 1.4, 0.0, 1.0 );
      vec2 id = floor( cell );
      vec2 f = fract( cell );
      float win = step( 0.16, f.x ) * step( f.x, 0.84 ) * step( 0.34, f.y ) * step( f.y, 0.8 );
      win = mix( 0.42, win, lod );
      float h = fract( sin( dot( id, vec2( 127.1, 311.7 ) ) ) * 43758.5453 );
      float lit = step( 1.0 - fastWindows.x, h ) * ( 0.55 + 0.45 * fract( h * 7.31 ) );
      diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * vec3( 0.22, 0.27, 0.34 ), win * 0.85 );
      totalEmissiveRadiance += vec3( 1.0, 0.74, 0.46 ) * 0.8 * win * mix( fastWindows.x, lit, lod ) * fastWindows.y;
    }
  }
#endif
`;

export function patchBaked(m: MeshStandardMaterial, mode: Mode, look: Look, windows = false) {
  const md = m as MeshStandardMaterial & { defines?: Record<string, string> };
  md.defines = { ...(md.defines ?? {}), [mode === "lm" ? "FAST_LM" : mode === "vc" ? "FAST_VC" : "FAST_DYN"]: "" };
  if (windows) {
    md.defines.FAST_WINDOWS = "";
    md.defines.USE_UV = "";
  }
  m.onBeforeCompile = (shader) => {
    shader.uniforms.fastExposure = look.exposure;
    shader.uniforms.fastSky = look.sky;
    shader.uniforms.fastGround = look.ground;
    shader.uniforms.fastSunDir = look.sunDir;
    shader.uniforms.fastSunCol = look.sunCol;
    shader.uniforms.fastWindows = look.windows;
    let f = shader.fragmentShader;
    f = f.replace("#include <common>", "#include <common>\n" + DECL);
    f = f.replace("#include <lights_fragment_maps>", MAPS);
    if (mode === "vc") f = f.replace("#include <color_fragment>", "");
    if (windows) f = f.replace("#include <normal_fragment_maps>", "#include <normal_fragment_maps>\n" + WINDOWS);
    shader.fragmentShader = f;
  };
  m.customProgramCacheKey = () => "fast-" + mode + (windows ? "-w" : "");
  return m;
}

export type MatExtras = {
  kind?: string;
  tex?: string;
  rough?: number;
  metal?: number;
  emit?: number;
  glass?: string;
  side?: string;
  env?: number;
  windows?: number;
};

/**
 * Replace the plain glTF materials under `root` with baked / emissive / glass materials according to the
 * extras written by the Blender scripts. Returns materials by their Blender name for scene-specific tweaks.
 */
export function applyMaterials(root: Object3D, look: Look, defaultLm = "") {
  const cache = new Map<string, Material>();
  const byName = new Map<string, Material[]>();
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const src = mesh.material as MeshStandardMaterial;
    const ex = (src.userData ?? {}) as MatExtras;
    const bake = (mesh.userData.bake as string) || "none";
    const lmName = (mesh.userData.lm as string) || defaultLm;
    const kind = ex.kind || "";
    const envName = (mesh.userData.env as string) || "";
    const key = `${src.uuid}|${bake}|${lmName}|${envName}`;
    let m = cache.get(key);
    if (!m) {
      m = build(src, ex, kind, bake, lmName, look, mesh, look.envs[envName] ?? look.env, envName ? 1 : look.envIntensity);
      m.name = src.name;
      cache.set(key, m);
      const list = byName.get(src.name) ?? [];
      list.push(m);
      byName.set(src.name, list);
    }
    mesh.material = m;
  });
  return byName;
}

function build(src: MeshStandardMaterial, ex: MatExtras, kind: string, bake: string, lmName: string, look: Look, mesh: Mesh, env: Texture | null, envK: number): Material {
  const side = ex.side === "double" ? DoubleSide : FrontSide;
  if (kind === "emit" || kind === "sign" || kind === "screen") {
    const k = ex.emit ?? 1;
    const lit = src.emissive && src.emissive.r + src.emissive.g + src.emissive.b > 0;
    const c = lit ? src.emissive.clone() : src.color.clone();
    // Blender emission strengths are tuned for baking; compress them for display.
    const gain = kind === "emit" ? Math.min(6, 0.9 + Math.log2(1 + k) * 0.55) : 1;
    return new MeshBasicMaterial({ color: c.multiplyScalar(gain), side, fog: kind === "emit" });
  }
  if (kind === "glass") {
    const mirror = ex.glass === "mirror";
    return new MeshStandardMaterial({
      color: src.color,
      metalness: mirror ? 1 : 0.9,
      roughness: ex.rough ?? 0.06,
      envMap: env,
      envMapIntensity: envK * (ex.env ?? 1),
      transparent: !mirror,
      opacity: mirror ? 1 : src.opacity < 1 ? src.opacity : 0.28,
      depthWrite: mirror,
      side,
      emissive: ex.emit ? src.emissive : new Color(0),
      emissiveIntensity: ex.emit ? 2.2 : 0,
    });
  }
  const mode: Mode = bake === "lm" && look.lightmaps[lmName] ? "lm" : bake === "vc" && mesh.geometry.attributes.color ? "vc" : "dyn";
  const m = new MeshStandardMaterial({
    color: src.color,
    roughness: ex.rough ?? src.roughness,
    metalness: ex.metal ?? src.metalness,
    envMap: env,
    envMapIntensity: envK * (ex.env ?? 1),
    side,
  });
  if (ex.tex && look.textures[ex.tex]) m.map = look.textures[ex.tex];
  if (mode === "lm") {
    m.lightMap = look.lightmaps[lmName];
    m.lightMap.channel = 1;
  }
  if (mode === "vc") m.vertexColors = true;
  if (kind === "water") {
    m.roughness = 0.05;
    m.metalness = 0.6;
  }
  return patchBaked(m, mode, look, !!ex.windows);
}

/** Material for runtime-lit dynamic objects (characters, cars). */
export function dynMaterial(base: MeshStandardMaterial, look: Look) {
  const m = base.clone();
  m.envMap = look.env;
  m.envMapIntensity = look.envIntensity * 0.6;
  return patchBaked(m, "dyn", look);
}
