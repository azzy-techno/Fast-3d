# About FAST gallery — level 12

The landing immediately below the cooling-tower roof opens into a 66 × 80 m hall at elevation 76 m. Its coffered ceiling, limestone floor, bronze detailing, seating and globe installation remain. The 33-stop wall circuit has been replaced by a central binocular instrument and a short guided approach. Both lift shaft openings stay clear.

The About FAST lift destination lands at progress 1.535. Ordinary scrolling guides the engineer around the pedestal. Reaching 1.592 automatically aligns the camera with the binoculars and eases into the optical viewpoint at 1.605. A twin-lens focus veil bridges the handoff. The guide and optical housing disappear behind the lenses; the actual hall stays visible. An optional keyboard-only approach button provides an accessible alternative. Selecting a different floor bypasses entry. After “Step away,” the overlays fade and the camera eases back to 1.585; entry stays disarmed until the visitor leaves the approach area, avoiding a reopen loop.

The Observatory is a transparent native modal with composited CSS 3D displays over the same WebGL hall. The dialog and its backdrop are transparent; the regular tour interface is hidden while optical corner markers and translucent information panels appear. Pointer movement gently turns the real hall camera and shifts the displays together; arrow keys and Home provide keyboard control. A grid mode supports touch, narrow screens and reduced motion. It includes five certificate/license displays, fifteen organization registrations and thirteen technology partners. Selecting an item opens its details and original document or partner link. Organization logos come from the supplied profile; the certificates and relationship labels are unchanged. English and Arabic are available inside the viewer.

The original entrance projection and header Partners action remain available as an alternate searchable content view. The original projection pauses WebGL. The optical Observatory renders on demand: pointer or keyboard movement invalidates the hall camera, while a settled view stops drawing. Native dialog focus containment, Escape, explicit exit buttons and focus restoration support keyboard navigation. List view retains the company information without requiring WebGL.

## Rendering and loading changes

- The exterior city and its animated pedestrians/birds/cars stop rendering or updating once the camera enters the building, then resume near reception’s exit.
- Startup warms the visible scene, rather than revealing and compiling hidden floors. Hidden floor groups start invisible.
- The full-screen ambient-occlusion/bloom pass is removed from the default tour. Sun shadows use 1024px maps; the moving camera light does not add another shadow pass. Pixel density adapts downward on slower devices.
- The WebGL frame loop stops behind the original company dialog and in hidden browser tabs. The Observatory renders the hall on demand during damped head movement and stops drawing when settled. Its floating displays use CSS transforms; the city remains hidden.
- Equipment animations skip hidden ancestors. Camera diagnostics update at 10 Hz rather than every frame.
- Equipment plaques size their canvas and physical background from the measured title width. Wayfinding subtitles fit within their panel, and long headings wrap into two lines.
- The retained repository logo has a light backing in the header, footer, preloader, Observatory and engineer’s badge. The architectural preloader draws a building, reports asset readiness and opens two doors into the scene. Reduced motion removes decorative scanning and drawing.

## Content sources and relationship labels

Reviewed 3 November 2026:

- User-supplied `FAST_OM_2026_SA.pdf`, 54 physical pages: introduction p3, vision/mission p4, selected supplier portals p5, thirteen technology partners pp25–26, vendor approval p46, additional vendor registrations p51. The raster introduction states established 2017, Dammam headquarters, Aramco vendor 10112399 and Saudi Energy vendor 2017011.
- User-supplied one-page ISO 9001, ISO 14001 and ISO 45001 certificates, issued by ANS System Certification on 27 October 2026. Registration numbers: CN-QMS-15252924, CN-EMS-15252925, CN-OH&SMS-15252926. The printed expiry is 26 October 2027. The later recertification date is not treated as the current expiry.
- https://fast-arabia.com/partners and its `assets/js/site.js?v=174`: thirteen partner names, original logo files, bilingual capabilities, countries and official website URLs. The latest live URLs resolve the older profile's Meta 2i/Vision Lasertechnik spelling/domain differences.
- https://fast-arabia.com/downloads: public LCGPA certificate (valid to July 2027), Civil Defense Salamah activity license 100001481 (valid to August 2028), public company profile and Aramco registration letter. Commercial Registration, CCC, GOSI and ZATCA are described as available on request, matching the documents page.

Aramco is labeled approved vendor; Saudi Energy carries the supplier registration and vendor code. The other selected names are supplier portal registrations, matching the profile. SAP is SAP Ariba Network registration, not an asserted technology partnership or certification. The thirteen technology partners are a separate collection. The additional profile vendors are not presented as technology partners. These are company-supplied statements; the implementation does not claim independent registry verification.

The three explicitly supplied ISO certificate PDFs and compressed previews are copied into the site. LCGPA and Salamah display previews are rendered from FAST’s public PDFs; their full-document links continue to point to FAST’s public document library. Private company-profile attachments are not republished. The supplied banner's headline and engineering/operations/digital positioning inform the room's brand wall; no local Windows path is assumed accessible to the cloud workspace.

## Validation

`BASE_PATH=/Fast-3d/ npm run build` checks TypeScript and the deployment base. `npm run test:about` samples 50,001 positions across the approach and return, checks pedestal clearance and the presentation/POV holds, and verifies scroll/progress round trips. `npm run test:journey` covers the complete route; `node scripts/travel-motion-test.mjs` checks lift and traffic choreography.

`npm run test:observatory` exercises the loader, lift arrival, automatic scroll entry without clicking, transparent overlays over the real hall, all 33 displays, document links, pointer/keyboard controls, idle rendering, smooth exit without automatic reopening, return to the hall, onward travel, phone layout, Arabic and axe WCAG A/AA. The previous `test:about:hall` command is a compatibility entry point for this test. Captures are saved in `artifacts/observatory/`. `ABOUT_LIST_ONLY=1 node scripts/about-browser-test.mjs` checks the alternate content view.

Software-rendered frame timings are diagnostic and do not represent desktop or phone hardware frame rates. Rendering-call comparisons use the same viewport and route positions; the saved measurements are in `artifacts/observatory/before.json` and `after.json`.

The transparent AR revision passed the automated scroll-only entry, visible lens transition, transparent backdrop, live camera steering, idle drawing, all 33 displays, smooth pullback, no immediate reopen, onward lift travel, mobile, Arabic and WCAG checks with zero runtime errors. Rendering comparisons are optional via `PROFILE_RENDERING=1 npm run test:observatory`; normal interaction tests preserve the previous profiling results.

Validated 5 November 2026: the Observatory browser walkthrough passed desktop, phone and Arabic, all 33 displays, original document links, keyboard and pointer input, WCAG checks, renderer pause/resume and the outgoing Electrical lift, with no runtime errors. At 1440 × 1000 in the same software-rendered browser, average drawing calls fell from 1,474 to 348 at the About landing (76%) and from 2,738 to 1,158 at the Electrical landing (58%). In the original opaque viewer, background WebGL drawing was zero. The subsequent transparent AR viewer draws the hall only when its optical pose changes and becomes idle again when movement settles. These are rendering-work reductions, not hardware frame-rate guarantees.
