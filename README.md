# FAST — an integrated world of engineering

The FAST homepage is a continuous 3D journey through a conceptual commercial building and its connected industrial hall. It uses FAST's original logo, photography, service scope and destination URLs from **fast-arabia.com**. Only the homepage is implemented here; service headings and enquiry links open the existing FAST pages.

## Run

```bash
npm ci
npm run dev -- --port 5174 --strictPort
```

Build and test:

```bash
npm run build
npm run test:journey
npm run test:browser
```

The browser suite checks rendered equipment in all 11 service scenes, verifies single-chime audio playback and scroll cleanup, and starts and closes its own production preview on port 4174. It uses system Chromium at `/usr/bin/chromium`, or `CHROMIUM_PATH`, with software WebGL in this cloud. Screenshots and results are saved to the ignored `artifacts/` directory. Hardware GPU frame-rate benchmarking remains separate from these software-WebGL functional checks.

## The journey

Arrival → cooling towers → roof lift → furnished workplace → service lift → connected service gallery → electrical → mechanical → fabrication → civil & structural → fire & protection → IT → smart manufacturing → Industry 4.0 → industrial IoT → computer vision → project enquiry.

- Scroll or use the chapter controls/menu; reverse scrolling retraces the route.
- Cinema view clears the copy; the interactive floor plan jumps to service rooms.
- Offices, a lounge and meeting room lead into a corridor with real room openings. Signals, flow particles, sparks, articulated robotics and inspection sweeps animate the systems.
- Camera continuity and doorway clearance are sampled at 12,001 route positions by `npm run test:journey`.
- Service headings are native links, with actual FAST destinations.
- English and Arabic layouts, keyboard-accessible modal navigation, opt-in sound.
- Readiness loader waits for fonts, initial images, model loading and shader compilation; visitors can skip it for the photo tour.
- Reduced-motion visitors start in the photo tour. A rendering failure also preserves the complete service content.
- `?view=list` opens the photo tour directly. Both views have the same service information.
- Local assets and fonts: the homepage needs no runtime CDN or account key.

## Exterior detail

The arrival now sits within a surrounding business district, with detailed palms, planted borders, animated pedestrians and birds, traffic, street furniture, reflective glass and a water feature. HDR lighting, atmospheric haze and a descending entry camera add depth. Desktop contact shading and bloom adapt to measured frame rate; phones use a lighter scene. Asset credits and rendering limits are documented in [exterior notes](docs/exterior-assets.md).

## Implementation

| File                       | Responsibility                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/App.tsx`              | Semantic homepage, loader, scrolling, navigation, language and audio                              |
| `src/data/chapters.ts`     | Service copy, original page links, colors and room positions                                     |
| `src/scene/Experience.tsx` | Route sampling, lighting, readiness and device framing                                          |
| `src/scene/Building.tsx`   | Procedural building, industrial hall and landscaped arrival                                       |
| `src/scene/Equipment.tsx`  | Animated cooling fans, pumps, switchgear, fabrication, server racks, robotics and inspection line |
| `src/scene/Primitives.tsx` | Shared geometry/materials and schematic equipment screens                                                       |
| `src/styles.css`           | Desktop, tablet, phone, Arabic and photo-tour layouts                                             |
| `docs/asset-sources.json`  | Original asset URLs                                                                               |

Runtime: React, TypeScript, Vite, Three.js / React Three Fiber / Drei, GSAP / ScrollTrigger / useGSAP, Lenis, Motion, Howler and Zustand. The 3D renderer is loaded as a separate chunk; photo-tour visitors do not load it. Mobile uses a wider camera and lower pixel density. Only nearby service rooms are visible during the journey.

The requested extended toolkit is also installed: ThreeUI, all GSAP plugins, Remotion, React Three Postprocessing, Rapier, Leva, BVH, Meshoptimizer, glTF Transform and Sharp. `examples/animation-kit.jsx` contains the requested ThreeUI stylesheet/component imports and complete GSAP registration, with dependency order preserved. The homepage imports the tools its interactions need; unused tools are available for later development.

The global UI/UX Pro Max, skills and 21st CLIs are in `/workspace/tools/bin`; installed taste and UI/UX skills are under `/workspace/design-toolkit/.agents/skills`. Remotion Studio and validated sample compositions remain in `/workspace/design-toolkit`. The 21st CLI supports local review; online component retrieval requires the optional `API_KEY_21ST` account credential. No 21st credential is needed to run this site.

Research, camera decisions and downloaded furniture licenses are recorded in [the connected journey notes](docs/immersive-journey.md). The interactive blueprint is a conceptual layout, designed around this story.

## Source and design notes

This is a conceptual architectural visualization of FAST's service capabilities, not a surveyed model of a FAST-owned building. Service descriptions paraphrase the original service scope. Cooling, Industry 4.0, IIoT and computer vision use existing parent service-page anchors because separate source pages were not found. Equipment screens are schematic illustrations, not live plant readings. See `docs/design.md` for the composition and source decisions.

GitHub Pages deployment is configured in `.github/workflows/deploy-pages.yml`. See [deployment instructions](docs/deployment.md) for activation and the public address. The existing FAST website remains separate.

The guided tour adds a rigged rooftop host, distance-driven walking, greeting/presentation/farewell gestures, and a third-person approach to cooling. The exit descends through a rear lift to a furnished reception, opens the front doors, then switches to a drone pullback while the guide stays outside. Office and reception details include stone finishes, brass trim, pendants, rugs, art and meeting-table accessories. Character sources and limitations are documented in `docs/immersive-journey.md` and the public asset credits.
