# Exterior assets and rendering

This exterior is a conceptual Saudi business district, not a surveyed representation of FAST's premises or Dammam. The exterior enhancement adds 35 neighbouring buildings, curtain-wall glazing, shaded entry details, a paved arrival court, water, 20 palms with individual leaflets, planted borders, benches, streetlights, traffic, walking figures and seven animated birds.

## Third-party sources

- `public/assets/exterior/pedestrian.glb`: the animated **Soldier** character from the [Three.js skinning/blending example](https://threejs.org/examples/webgl_animation_skinning_blending.html), which credits [Mixamo](https://www.mixamo.com/). Downloaded from [Three.js examples](https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/Soldier.glb). Adobe/Mixamo character content, used as an embedded animated background figure; not an original FAST asset and not claimed to be CC0. Retains the source textures and Walk clip. The source rig already uses a centimetre-to-metre transform; its scale must not be inferred from unposed skinned bounds.
- `public/assets/exterior/sunset.hdr`: **Venice Sunset**, [Poly Haven](https://polyhaven.com/a/venice_sunset), CC0 HDR environment, distributed in [Three.js examples](https://github.com/mrdoob/three.js/blob/dev/examples/textures/equirectangular/venice_sunset_1k.hdr).
- FAST logo and service imagery retain their existing sources in `asset-sources.json`.

Downloaded assets are served locally, including under the GitHub Pages base path. Geometry for buildings, palms, vehicles, streets, water and birds, and deterministic surface textures, is generated in the application. No external API or new account is required.

## Rendering and performance

The exterior uses HDR reflections, physical glass and vehicle coatings, a procedural atmospheric sky, directional shadows and distance haze. Desktop adds half-resolution ambient occlusion and restrained bloom in a separately loaded chunk. These effects are omitted on phones and disabled when PerformanceMonitor observes a sustained low frame rate. Phones also use three walking figures and two moving cars, versus six and four on desktop, plus lower shadow resolution and pixel density. Repeated windows, facade bands, trunks and planting use instanced geometry.

Exterior animation work pauses while service interiors are visible. The entry camera follows a descending arc. Photo-tour and reduced-motion behaviour is preserved. This remains a browser architectural visualization: it does not use ray tracing, scanned buildings, or AAA-game character/vehicle assets. Hardware GPU performance still needs checking on representative real devices; cloud Chromium uses software WebGL.

The pedestrian heading follows the source rig’s local −Z forward axis. Road surfaces and lane markings span 1,000 metres, beyond the camera range and distance fog; pavements leave gaps at intersections. Buildings are offset to keep both through-road corridors clear.
