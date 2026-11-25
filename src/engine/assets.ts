import {
  ImageBitmapLoader,
  CanvasTexture,
  Texture,
  SRGBColorSpace,
  NoColorSpace,
  RepeatWrapping,
  ClampToEdgeWrapping,
  LinearMipmapLinearFilter,
  LinearFilter,
  type ColorSpace,
} from "three";
import { Float32BufferAttribute, type Mesh } from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export const BASE = import.meta.env.BASE_URL;
export const url = (p: string) => BASE + p.replace(/^\//, "");

const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const bitmapLoader = new ImageBitmapLoader();
bitmapLoader.setOptions({ premultiplyAlpha: "none", colorSpaceConversion: "none" });

const glbCache = new Map<string, Promise<GLTF>>();
const texCache = new Map<string, Promise<Texture>>();

let pending = 0;
let done = 0;
const listeners = new Set<(done: number, total: number) => void>();
export const onProgress = (fn: (done: number, total: number) => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const track = <T>(p: Promise<T>): Promise<T> => {
  pending++;
  listeners.forEach((l) => l(done, pending));
  const fin = () => {
    done++;
    listeners.forEach((l) => l(done, pending));
  };
  p.then(fin, fin);
  return p;
};

export function loadGLB(path: string): Promise<GLTF> {
  let p = glbCache.get(path);
  if (!p) {
    p = track(gltfLoader.loadAsync(url(path)).then(expandUvs));
    glbCache.set(path, p);
  }
  return p;
}

export type TexOpts = { srgb?: boolean; repeat?: boolean; mips?: boolean; anisotropy?: number };

/** Decodes off the main thread (createImageBitmap). Orientation matches glTF UVs (flipY = false). */
export function loadTexture(path: string, o: TexOpts = {}): Promise<Texture> {
  const key = path + JSON.stringify(o);
  let p = texCache.get(key);
  if (!p) {
    p = track(
      bitmapLoader.loadAsync(url(path)).then((bmp) => {
        const t = new CanvasTexture(bmp as unknown as HTMLCanvasElement);
        t.flipY = false;
        t.colorSpace = (o.srgb === false ? NoColorSpace : SRGBColorSpace) as ColorSpace;
        t.wrapS = t.wrapT = o.repeat ? RepeatWrapping : ClampToEdgeWrapping;
        t.generateMipmaps = o.mips !== false;
        t.minFilter = o.mips !== false ? LinearMipmapLinearFilter : LinearFilter;
        t.anisotropy = o.anisotropy ?? 1;
        t.needsUpdate = true;
        return t as Texture;
      }),
    );
    texCache.set(key, p);
  }
  return p;
}

/** Warm the HTTP cache for something a later scene will need. */
export function prefetch(paths: string[]) {
  for (const p of paths) {
    if (p.endsWith(".glb")) void loadGLB(p).catch(() => {});
    else void fetch(url(p)).catch(() => {});
  }
}

/** tools/pack.mjs stores tiling UVs as 16-bit + a scale/offset in the primitive extras; expand them once. */
function expandUvs(gltf: GLTF) {
  gltf.scene.traverse((o) => {
    const mesh = o as Mesh;
    const t = mesh.isMesh ? (mesh.geometry.userData.uvt as number[] | undefined) : undefined;
    if (!t) return;
    const uv = mesh.geometry.attributes.uv;
    const out = new Float32Array(uv.count * 2);
    for (let i = 0; i < uv.count; i++) {
      out[i * 2] = uv.getX(i) * t[0] + t[2];
      out[i * 2 + 1] = uv.getY(i) * t[1] + t[3];
    }
    mesh.geometry.setAttribute("uv", new Float32BufferAttribute(out, 2));
    delete mesh.geometry.userData.uvt;
  });
  return gltf;
}
