import { EffectComposer, N8AO, Bloom } from "@react-three/postprocessing";

/** Optional desktop enhancement, loaded separately from the core scene. */
export default function ExteriorEffects() {
  return (
    <EffectComposer multisampling={4}>
      <N8AO
        halfRes
        quality="medium"
        aoRadius={1.8}
        intensity={1.1}
        distanceFalloff={1}
      />
      <Bloom luminanceThreshold={1.5} intensity={0.18} mipmapBlur />
    </EffectComposer>
  );
}
