# Exterior assets and rendering

This exterior is a conceptual Saudi business district, not a surveyed representation of FAST's premises or Dammam. The exterior enhancement adds 35 neighbouring buildings, curtain-wall glazing, shaded entry details, a paved arrival court, water, 20 palms with individual leaflets, planted borders, benches, streetlights, traffic, walking figures and seven animated birds.

## Third-party sources

- `public/assets/exterior/pedestrian.glb`: the animated **Soldier** character from the [Three.js skinning/blending example](https://threejs.org/examples/webgl_animation_skinning_blending.html), which credits [Mixamo](https://www.mixamo.com/). Downloaded from [Three.js examples](https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/Soldier.glb). Adobe/Mixamo character content, used as an embedded animated background figure; not an original FAST asset and not claimed to be CC0. Retains the source textures and Walk clip. The source rig already uses a centimetre-to-metre transform; its scale must not be inferred from unposed skinned bounds.
- `public/assets/exterior/sunset.hdr`: **Venice Sunset**, [Poly Haven](https://polyhaven.com/a/venice_sunset), CC0 HDR environment, distributed in [Three.js examples](https://github.com/mrdoob/three.js/blob/dev/examples/textures/equirectangular/venice_sunset_1k.hdr).
- FAST logo and service imagery retain their existing sources in `asset-sources.json`.

Downloaded assets are served locally, including under the GitHub Pages base path. Geometry for buildings, palms, vehicles, streets, water and birds, is generated in the application; surface imagery uses the uploaded textures described below, with procedural water ripples and stone trim. No external API or new account is required.

## Rendering and performance

The exterior uses HDR reflections, physical glass and vehicle coatings, a procedural atmospheric sky, directional shadows and distance haze. Desktop adds half-resolution ambient occlusion and restrained bloom in a separately loaded chunk. These effects are omitted on phones and disabled when PerformanceMonitor observes a sustained low frame rate. Phones also use three walking figures and two moving cars, versus six and four on desktop, plus lower shadow resolution and pixel density. Facade surfaces are merged by material; repeated structural masses, bands, trunks and planting use instanced geometry.

Exterior animation work pauses while service interiors are visible. The entry camera follows a descending arc. Photo-tour and reduced-motion behaviour is preserved. This remains a browser architectural visualization: it does not use ray tracing, scanned buildings, or AAA-game character/vehicle assets. Hardware GPU performance still needs checking on representative real devices; cloud Chromium uses software WebGL.

The pedestrian heading follows the source rig’s local −Z forward axis. Road surfaces and lane markings span 1,000 metres, beyond the camera range and distance fog; pavements leave gaps at intersections. Buildings are offset to keep both through-road corridors clear.

## Uploaded surface textures (October 22, 2026)

The twelve `facade-*.png`, `ground-*.png`, and `roof-flat.png` images were supplied by the repository owner in commit `2a4a32f`. Their original files are preserved; no third-party license is inferred. Run `node scripts/optimize-exterior.mjs` to reproduce the WebP copies in `public/assets/exterior/optimized/` (1536-pixel maximum dimension, quality 88). The browser loads approximately 4.00 MiB of WebP instead of 30.07 MiB of PNG.

The supplied reflective glass covers the FAST office curtain walls and selected neighbouring towers. Stone, sand and white apartment facades vary the district; the villa facade is limited to the low-rise building, and cropped retail fronts occupy the near-left ground floors. Warehouse walls use the industrial facade; roof plans cover horizontal roof decks while modeled machinery remains. Asphalt, paving, grass borders and sand are mapped at consistent world scales. Baked reflections and rooftop equipment are color detail, not displacement or normal maps.

`ExteriorSurfaces.tsx` merges planes by material and bakes each surface's repeat/crop into its UV coordinates. This keeps the district to one draw call per facade style, avoids shared repeat-state bugs and preserves proportional windows and paving. Color maps use sRGB with mipmaps and bounded anisotropic filtering. Existing flat window patches were removed so they cannot obscure the uploaded glass.
