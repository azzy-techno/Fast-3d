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
npm run test:browser
```

The browser suite checks rendered equipment in all 11 service scenes, verifies single-chime audio playback and scroll cleanup, and starts and closes its own production preview on port 4174. It uses system Chromium at `/usr/bin/chromium`, or `CHROMIUM_PATH`, with software WebGL in this cloud. Screenshots and results are saved to the ignored `artifacts/` directory. A device GPU performance benchmark is still needed before a public launch.

## The journey

Arrival → cooling towers → electrical → mechanical → fabrication → civil & structural → fire & protection → IT → smart manufacturing → Industry 4.0 → industrial IoT → computer vision → project enquiry.

- Scroll or use the chapter controls/menu; reverse scrolling retraces the route.
- Service headings are native links, with actual FAST destinations.
- English and Arabic layouts, keyboard-accessible modal navigation, opt-in sound.
- Readiness loader waits for fonts, initial images and a rendered 3D frame; visitors can skip it for the photo tour.
- Reduced-motion visitors start in the photo tour. A rendering failure also preserves the complete service content.
- `?view=list` opens the photo tour directly. Both views have the same service information.
- Local assets and fonts: the homepage needs no runtime CDN or account key.

## Implementation

| File                       | Responsibility                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/App.tsx`              | Semantic homepage, loader, scrolling, navigation, language and audio                              |
| `src/data/chapters.ts`     | Service copy, original page links, colours and room positions                                     |
| `src/scene/Experience.tsx` | Camera route, lighting, building outline, device framing                                          |
| `src/scene/Building.tsx`   | Procedural building, industrial hall and landscaped arrival                                       |
| `src/scene/Equipment.tsx`  | Animated cooling fans, pumps, switchgear, fabrication, server racks, robotics and inspection line |
| `src/scene/Primitives.tsx` | Shared geometry/materials and cutaway rooms                                                       |
| `src/styles.css`           | Desktop, tablet, phone, Arabic and photo-tour layouts                                             |
| `docs/asset-sources.json`  | Original asset URLs                                                                               |

Runtime: React, TypeScript, Vite, Three.js / React Three Fiber / Drei, GSAP / ScrollTrigger / useGSAP, Lenis, Motion, Howler and Zustand. The 3D renderer is loaded as a separate chunk; photo-tour visitors do not load it. Mobile uses a wider camera and lower pixel density. Only nearby service rooms are visible during the journey.

The requested extended toolkit is also installed: ThreeUI, all GSAP plugins, Remotion, React Three Postprocessing, Rapier, Leva, BVH, Meshoptimizer, glTF Transform and Sharp. `examples/animation-kit.jsx` contains the requested ThreeUI stylesheet/component imports and complete GSAP registration, with dependency order preserved. The homepage imports the tools its interactions need; unused tools are available for later development.

The global UI/UX Pro Max, skills and 21st CLIs are in `/workspace/tools/bin`; installed taste and UI/UX skills are under `/workspace/design-toolkit/.agents/skills`. Remotion Studio and validated sample compositions remain in `/workspace/design-toolkit`. The 21st CLI supports local review; online component retrieval requires the optional `API_KEY_21ST` account credential. No 21st credential is needed to run this site.

## Source and design notes

This is a conceptual architectural visualization of FAST's service capabilities, not a surveyed model of a FAST-owned building. Service descriptions paraphrase the original service scope. Cooling, Industry 4.0, IIoT and computer vision use existing parent service-page anchors because separate source pages were not found. Equipment screens are schematic illustrations, not live plant readings. See `docs/design.md` for the composition and source decisions.

GitHub Pages deployment is configured in `.github/workflows/deploy-pages.yml`. See [deployment instructions](docs/deployment.md) for activation and the public address. The existing FAST website remains separate.
