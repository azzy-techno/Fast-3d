# Homepage direction and content inventory

On this page, FAST's combination of operations, engineering and industrial intelligence becomes one building whose systems unfold as the visitor scrolls. The live interaction is the continuous camera route, with a chapter navigator for direct access to every capability.

The user approved a large mall-like building and a service-by-service descent, followed by intelligent manufacturing. The `design-taste-frontend` direction is “The place carries it”: architectural imagery dominates; copy stays beside the work, with a narrow, consistent reading column. The specific 3D tour and original FAST brand take precedence over the direction generator's generic photography-only layout suggestions.

## Source inventory

Source: https://fast-arabia.com, its service pages and service-data script, retrieved 14 October 2026. Original asset URLs are recorded in `asset-sources.json`.

- Brand: FAST Operations & Maintenance, Dammam, Saudi Arabia.
- Original headline: “Engineering the Backbone of Saudi Industry”.
- Colours: navy #0A1F38, blue #2169AE, cyan #17AAD9; source service colours inform equipment accents.
- Fonts: Sora, Plus Jakarta Sans, Cairo; served locally from installed Fontsource packages.
- Source imagery: cooling/mechanical, electrical, fabrication, civil, fire, IT, automation, digital engineering, team, original logo.
- Established source claims retained: ISO 9001 / 14001 / 45001 and Saudi Aramco registered vendor. No invented customer statistics or performance claims.
- Business contact: info@fast-arabia.com, +966 13 831 1137, existing contact/RFQ pages.
- Homepage copy deck and faithful Arabic summaries are in `src/data/chapters.ts`; navigation and arrival/closing copy are in `src/App.tsx`.

## Story and layout

The building exterior sets the scale. The camera approaches the cooling deck, then moves between the electrical, mechanical, fabrication, civil, fire and IT systems. A connected industrial hall reveals robotics, control systems, sensors and computer vision. The last view returns to the complete facility and a real enquiry link.

Each section has a camera approach, a stable reading interval and a departure toward the next system. The entire route is reversible. Adjacent rooms and a faint building outline preserve spatial context. Source photographs connect the conceptual machinery to the service portfolio. The photo-tour mode promotes those same photographs to large service illustrations.

The desktop places equipment to the right of the reading column; Arabic reverses the composition. Phones move the equipment above the copy and widen the camera. The footer contains actual contact destinations. Sound starts off and is activated only by a user gesture.

## Deliberate rule exceptions

- The supplied multi-chapter 3D brief requires repeated service presentation and numbered wayfinding. Chapter numbers indicate the visitor's actual position; they are not decorative section labels.
- A soft neutral scrim keeps text readable over moving 3D geometry. It does not add a decorative colour gradient.
- FAST's existing typefaces are retained, including Plus Jakarta Sans, even when a generic font linter flags it.
- Equipment displays are visibly schematic geometry, not fabricated operating metrics.
- Small source photographs support the immersive 3D view. The full photo tour exposes large images and all service content.
- The generic inspector's whole-page screenshots timed out on the software-rendered 3D view. Separate production-browser screenshots inspect the actual canvas; the generic inspector is additionally run on `?view=list`.

## Visual review

ROUND 1
Seen in one second: a branded commercial building with its rooftop cooling system.
Idea: one connected facility reveals the breadth of FAST's engineering services.
Live thing: scroll moves the camera between real 3D equipment rooms.
Layout words by section: arrival=architectural panorama / services=cutaway with reading column / closing=facility and enquiry.
Scores: design 7 · usability 6 · creativity 7 · content 8 → overall 6.8 before collision cap.
Caps applied: label collisions and mobile crop limited usability to 6.
Top three problems:

1. `desktop-cooling.png`: writing-mode made scene labels appear over copy. Replace logical positioning with explicit physical placement for vertical labels.
2. `mobile-arrival.png`: the phone crop hid most of the building. Widen the mobile camera and move its focal area above the copy.
3. `desktop-manufacturing.png`: the link arrow wrapped to a separate line, pushing the source photo below the controls. Keep the arrow in a flex row and tighten the heading/column proportions.

ROUND 2
Seen in one second: a FAST building; the services become distinct rooms on approach.
Idea: the building connects the industrial disciplines to the intelligent factory.
Live thing: the camera route, reversible scrolling and service chapter jumps.
Layout words by section: arrival=architectural panorama / services=equipment exhibit / photo mode=source image split / closing=enquiry.
Scores: design 7 · usability 8 · creativity 7 · content 8 → overall 7.4 (internal critique, not an external award score).
Caps applied: none in the inspected desktop service views; phone and generic-inspector findings are recorded in the test artifacts.
Fixes: moved vertical annotations away from the copy; enlarged readable text; preserved source imagery above controls; added partial room walls and a building outline; replaced spherical palm foliage with fronds. The architectural model remains a stylized concept and can later be replaced by production GLB assets without changing the narrative content.

ROUND 3
Seen in one second: the whole FAST building on desktop, tablet and phone, followed by recognisable service equipment.
Idea: one architectural journey connects the physical engineering systems with the intelligent factory.
Live thing: a reversible 3D scroll route, chapter jumps, and native service-page links.
Layout words by section: arrival=architectural panorama / services=cutaway rooms / photo mode=source image split or stack / closing=enquiry.
Scores: design 7 · usability 8 · creativity 7 · content 8 → overall 7.4 (internal critique only).
Caps applied: no unresolved layout failures in the final measured photo layouts. The inspector explicitly permits transient occlusion by the persistent navigation requested for this tour (`--allow covered-text`); source copy is readable at each chapter stop and can scroll fully clear of both controls.
Top three final refinements:

1. `tablet-arrival.png`: widened the portrait camera and switched the tablet to an above-copy scene composition.
2. `mobile-cooling.png`: moved the equipment focal area up and strengthened the neutral scrim where the service copy begins.
3. Photo-tour sheets: moved location notes below headings, removed redundant introductory lines, and raised all visible supporting copy to at least 13px.

Final checks: source style lint has 0 failures and 0 warnings. Photo-tour inspection at 1440, 768 and 390px has 0 failures and 2 warnings: no video, and intentionally restrained motion. These are deliberate because the requested moving visual is the real 3D canvas, while the photo tour is also the reduced-motion fallback. No stock video was introduced. All listed photo-tour sheets, the 3D desktop arrival/service views and the 3D tablet/phone captures were inspected.

Production TypeScript/Vite build and `npm run test:browser` pass. Axe-core reports no WCAG A/AA violations in the tested photo-tour state; this is an automated check, not an accessibility certification. The test covers service destinations, real canvas rendering, loading, modal keyboard focus, smooth/reverse navigation, opt-in audio controls, Arabic layout, view switching, 320/390/768px widths, reduced motion and missing-WebGL recovery. The full optional ThreeUI/GSAP import example also bundles successfully. Screenshots and machine-readable results are in `artifacts/`.

The cloud environment draft now includes the homepage install/build commands and current startup instructions. The save is confirmed; environment publication is a separate user action. No public deployment or fresh-task restoration was claimed.

## Homepage continuation — 15 October 2026

Completed the interaction lifecycle review. GSAP now reverts the previous scroll context when the view or language changes, releasing the associated ResizeObserver. Enabling sound plays a single chime; chapter changes handle their own playback. Returning from the photo tour waits for the new canvas and starts the camera at the current service location.

The production browser suite now captures and validates rendered equipment and active navigation in every one of the 11 service scenes. It also measures actual audio playback starts and verifies that only one homepage scroll observer remains after view/language changes. TypeScript/Vite build, expanded browser checks, source lint and the existing automated accessibility checks pass. All newly captured service scenes were visually reviewed.

## Exterior detail pass — 17 October 2026

Expanded the arrival into a surrounding business district with varied building heights, layered windows, connected roads, moving vehicles, animated pedestrians, palm leaflets, planted borders, seating, street lighting, water and a small bird flock. Refined the main facade with reflective glazing, recessed panels, stone grain and shaded entrance details. Local HDR lighting, distance haze, adaptive desktop contact shading/bloom and a descending approach arc support the architectural view. Service geometry and content remain unchanged; exterior lighting blends back toward the established service lighting during entry.

The imported character rig was checked for correct metre-scale placement, changing bone poses and pavement movement; desktop has six figures and mobile three. Desktop and phone arrival compositions were visually inspected. Assets, provenance, adaptive rendering and the remaining limits on photorealism are recorded in `exterior-assets.md`.

Validation: the `/Fast-3d/` production build and full browser suite pass, including all service scenes, navigation, sound, view restoration, Arabic, responsive widths, reduced motion, missing-WebGL recovery and automated accessibility checks. The final exterior rendering is additionally checked for successful local character/HDR loading under the project URL and browser runtime errors. Real hardware frame-rate benchmarking remains outstanding.

## City continuity and pedestrian direction — 22 October 2026

Corrected the pedestrian heading to respect the imported model's local −Z forward axis. Expanded the district from 16 to 35 buildings, with additional rows on the left. Extended road surfaces, lane markings and pavements beyond the camera's visible range, opened intersections and moved building footprints clear of the through roads. The model's foot orientation was checked against both travel directions, and all 35 building footprints were checked for building/road collisions.

Lenis now receives monotonic elapsed time so low rendering frame rates cannot stretch a chapter jump through GSAP ticker lag smoothing.

## Uploaded exterior materials — 22 October 2026

Applied the repository owner's glass image to the FAST curtain walls and selected city towers, replacing flat window overlays. Added the supplied stone/apartment/villa/storefront facades and industrial, rooftop, paving, asphalt, grass and sand textures to their matching exterior surfaces. World-scale UVs keep windows and ground detail proportional, while merged surfaces limit draw calls. WebP delivery reduces the twelve texture files from 30.07 MiB to 4.00 MiB; originals remain available. The glass uses moderate physical reflections so the supplied image remains visible. This is a material-detail improvement, not a change to the interior tour or its content.

Validation: the `/Fast-3d/` production build and browser suite pass, including loading all twelve supplied textures from the deployment base path, all eleven service scenes, responsive layouts, navigation, audio, Arabic, accessibility checks and fallback modes. Desktop and phone arrival screenshots were inspected.
