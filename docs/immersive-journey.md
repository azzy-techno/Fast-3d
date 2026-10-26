# Connected building journey

## Research and design decisions

Researched October 22, 2026. The redesign replaces floating service stages with a continuous architectural route. The original building is a conceptual FAST facility, not a surveyed floor plan; the new interior is purpose-built for this story and is not represented as a real FAST blueprint.

Sources inspected:

- [React Three Fiber: scaling performance](https://github.com/pmndrs/react-three-fiber/blob/master/docs/advanced/scaling-performance.mdx): reuse assets and materials, instance repeated geometry, bound pixel density and adapt expensive effects. Architecture and static equipment are instanced; furnished models share geometries/materials; only nearby service equipment is drawn.
- [React Three Fiber: performance pitfalls](https://github.com/pmndrs/react-three-fiber/blob/master/docs/advanced/pitfalls.mdx): mutate frame data, avoid mounting/unmounting during navigation and avoid allocation in animation loops. The camera and door states are sampled from one scalar route; rooms remain mounted.
- [Drei: preload](https://github.com/pmndrs/drei/blob/master/docs/performances/preload.mdx): compile materials before they enter view. The readiness loader waits for `compileAsync` before revealing the journey.
- [Lenis](https://github.com/darkroomengineering/lenis): one animation driver and ScrollTrigger synchronization. The existing monotonic-time driver is retained; there is no second independent scrolling or camera animation engine.
- [Bruno Simon's 2019 portfolio source](https://github.com/brunosimon/folio-2019), especially [Camera.js](https://github.com/brunosimon/folio-2019/blob/master/src/javascript/Camera.js): a coherent world with purposeful camera framing and reusable scene construction. Used as a technical reference, not copied as an art style or source asset.
- [Lenis showcase](https://www.lenis.dev/showcase) and [Immersive Garden](https://immersive-g.com/), [Chartogne-Taillet](https://chartogne-taillet.com/), [Bruno Simon](https://bruno-simon.com/) are further visual references. Their live sites were blocked by this environment's network policy, so their current appearance and performance were not verified. The implementation choices above are grounded in the source and documentation that were accessible.

## The story

1. Approach the building through the surrounding city; clouds, birds, landscaping, traffic and water establish a living place.
2. Rise to the roof to see cooling equipment working in context, with moving fans and a restrained vapor effect.
3. Enter a roof-access lift and descend into the workplace.
4. Pass a furnished lounge, office desks, meeting room and glass-partitioned corridor. The interior has a ceiling, slabs, mullions, light strips, planters and wayfinding.
5. Take the service lift into the systems gallery. Openings in the slabs and corridor partitions follow the actual camera route.
6. Visit ten service rooms through their doorways, returning to the corridor between them. Electrical signals, moving fluid markers, fabrication sparks, an articulated robot, conveyor products, network pulses and inspection sweeps describe the equipment in motion.
7. Return outside for the closing view.

The cooling section contains extra scroll distance for the roof-to-workplace-to-gallery sequence. Each service has a reading interval and a travel interval. Scene captions explain transitions, a navigable conceptual floor plan locates the service rooms, and Cinema view clears narrative copy without changing scroll progress. All original service links and photo/reduced-motion fallbacks remain available.

## Camera and performance contract

`journey.ts` defines camera positions, targets and lens changes. Shape-preserving cubic Hermite interpolation is continuous and cannot overshoot control-point coordinate bounds. A single damped scroll scalar is sampled into the path, rather than damping XYZ independently and cutting through corners. Camera direction never intentionally crosses the target. Mobile uses lens composition, not backing an interior camera through walls.

Exterior and office architecture remain resident, with visibility determined by the route. Repeated static equipment is consolidated after its world transforms are established; animated groups opt out explicitly. Exterior effects scale down on low frame rates; phones omit the compositor and use lower pixel/shadow budgets. Cloud counts are bounded. Floor grain is a deterministic material, with consistent world-space UVs; the user-provided exterior maps are retained because they are stable local assets, not the cause of the old camera jumps.

This is real-time WebGL, not a streamed or prerendered video. Hardware-dependent frame rates cannot be guaranteed. Cloud Chromium uses software WebGL; browser tests demonstrate functional rendering and route continuity, not a claim of 60 FPS on every device.

## Downloaded assets and attribution

- `public/assets/interior/lounge-chair.glb`: [Sheen Chair](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SheenChair), © 2020 Wayfair LLC, Eric Chadwick. **CC0 1.0**. Material sheen and original textures retained; simplified and WebP/Meshopt encoded for browser delivery.
- `public/assets/interior/lounge-sofa.glb`: [Sheen Wood Leather Sofa](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SheenWoodLeatherSofa). Original by Fran Calvente, 2021, **CC0**, from [Poly Haven sofa_03](https://polyhaven.com/a/sofa_03). Improvements by Eric Chadwick, © 2024 Darmstadt Graphics Group GmbH, **CC BY 4.0**. Simplified geometry and resized/compressed textures; attribution retained here and in the public asset notice.
- `public/assets/exterior/cloud.png`: [Drei cloud asset](https://github.com/pmndrs/drei-assets/blob/master/cloud.png), used with the Drei Cloud renderer. No image generation or remote runtime request.

Furniture optimization: `gltf-transform optimize INPUT OUTPUT --texture-size 512` (chair) / `768` (sofa), `--texture-compress webp --simplify-error 0.001 --simplify-ratio 0.55`, with Meshopt compression. Originals were 4.13 MB and 10.11 MB; delivery copies are approximately 429 KB and 782 KB. No additional runtime package was necessary.

## Validation

`npm run test:journey` checks 12,001 samples for finite values, a nonzero look direction, bounded step size, service-floor bounds, and actual doorway crossings (172 samples near partitions). The smallest camera-to-target distance is 1.774 m. The full browser suite also traverses roof access, workplace, lift and corridor intervals forward and backward; loads the licensed models; exercises Cinema view, floor-plan service links and all eleven service destinations; checks mobile widths, Arabic, audio, reduced motion, WebGL recovery and automated WCAG A/AA rules. Visual captures include the boardroom pass and the final interior lighting. Screenshots and current machine-readable results remain in the ignored `artifacts/` directory.

## Guided tour and ground-floor exit — 24 October 2026

The host is a locally hosted Ready Player Me skinned avatar, with retargeted Mixamo idle/walk clips. It is a real-time avatar, not a photoreal scanned person. The source headwear is hidden and the outfit tinted navy. Credits are in the public attribution file. Source provider terms remain applicable; no CC0 grant is inferred. Adobe and Ready Player Me terms pages could not be retrieved through the environment proxy.

The source walking rig faces -Z; the retargeting process rotates it into the host's +Z convention. `scripts/prepare-guide.mjs [original-avatar.glb]` creates the committed motion JSON. Retargeting is done once offline, with only the resulting tracks loaded by the browser. The wave and open-hand presentation use world-space bone direction overlays. Idle/walk weights blend when scrolling stops, and walking phase advances by distance instead of elapsed time. The lowest foot is grounded after posing. Lift travel does not trigger a walking cycle.

The camera settles behind the guide near the cooling towers. Outside the service floor, arc-length lookahead fades into a companion position in each lift. The separate service-floor route is described below. Reverse scroll follows the same route; the character turns toward its current travel direction.

The final gallery now leads into a rear lift at z=-37. The cabin descends from level 01 to ground before the camera walks through the reception approach. Reception includes a veined stone desk, brass detailing, lounge furniture, art, rugs, pendants and automatically opening glass doors. The office floor receives meeting-table accessories, rugs, lighting and artwork. Furniture and trim reuse static instancing; no additional full-screen effects or live render-to-texture mirrors are added.

Outside, the guide stops on the forecourt and waves while the camera arcs to the front and rises into the city view. The final chapter has extra scroll length to accommodate the descent and ground-floor sequence. The public footer links character and furniture credits.

Validation: deployment-base TypeScript/Vite build passed; 12,001 numerical samples check camera/guide continuity, doorway clearance, descent to ground and a stationary farewell position. The browser suite passed the guide/reception sequence, all 11 services, reverse navigation, cinema/floor-plan controls, audio, automated accessibility, Arabic/RTL, responsive layouts and reduced-motion/WebGL fallbacks. Final desktop/phone captures additionally check roof following, lift clearance, reception framing and farewell composition. Browser rendering uses software WebGL in this cloud environment; hardware frame rates have not been benchmarked.

## Roof, visitor clearance and work sounds

The FAST roof no longer uses the roof photo. `RooftopPlant` supplies an air-handling unit, flange-jointed ducts, chilled-water headers/valves, supports, cable ladders, drains, guardrails and service paving as geometry. Nearby city buildings keep their existing facade/roof materials.

The guide has a separate, authored service-floor route. It arrives ahead of the camera, waits in a side bay, and uses the front aisle to leave after the camera starts moving out. Left-hand rooms use the near-side bay; right-hand rooms use the outer bay so the person stays beside the exhibit and clear of the text. Equipment uses a defined envelope and the camera/guide take different lanes through the doors. `test:journey` samples both routes at 12,001 points: minimum service camera-to-guide horizontal separation is 1.05 m and minimum guide-centre-to-equipment-envelope clearance is 0.40 m (body radius allowance 0.32 m). The forearm/hand direction is computed toward an explicit component in each service, rather than a fixed local gesture.

`HumanRig` is shared by the host and civilian pedestrians. Street figures use varied outfit tones, heights and facial-hair visibility, the same +Z-facing retargeted walk, travelled-distance stride timing, smooth direction changes and foot grounding. Neutral lower-body posing replaces the crouched source idle stance when stopped. The old Soldier file is retained only as an offline animation source; it is no longer loaded by the website.

Eleven original procedural 12-second Ogg loops add cooling airflow, electrical hum/relays, pumps, metalworking, construction, fire-pump testing, servers/typing, conveyors/servos, control consoles, IIoT and vision-inspection sounds. They total approximately 430 KB, load on demand, crossfade between service stops, and fade to silence during corridor/lift travel. Sound stays off until the user enables it. Mute, photo mode and hidden tabs stop the ambience; stale downloads cannot start after muting or changing rooms. See `public/assets/audio/README.txt` and `scripts/generate-service-sounds.py` for provenance and reproduction. `test:sound` covers lifecycle races with controlled asynchronous loads; browser tests also exercise the actual Ogg assets and opt-in playback.

The lower service landing has a continuous floor; only the upper lift shaft remains open. Final desktop captures verify a stationary guide beside the electrical and mechanical exhibits, an aligned hand-to-component ray, and no presentation gesture while paused in the corridor. A phone capture checks the compact service layout. The full browser suite, deployment-base build, numerical route checks and audio lifecycle tests pass.


## Approved roof → tower and electrical preview (2026-10-26)

The former single service gallery has been replaced by ten occupied floors. The roof is at 83 m, workplace at 76 m, electrical at 66 m, and subsequent services descend in 6 m increments to computer vision at 12 m. `ServiceFloors` mounts the structure and equipment for each floor, displaying floors near the camera; `towerLayout` defines the service elevation spacing. The electrical floor adds RMU, cable, transformer and commissioning demonstrations, plus sourced project references. See `skyscraper-preview.md` for the review scope and remaining approvals.

`travelMotion` provides the stacked lift trajectory and door envelope. `test:journey` verifies camera/cabin alignment across every inter-floor descent, independent guide/equipment clearance, and correct elevations at each chapter. The electrical overview intentionally moves into the open front visitor area to reveal the whole floor. The exit returns through a rear lift to reception before the drone reveal.
