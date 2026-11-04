# About FAST gallery — level 12

The workplace landing directly below the cooling-tower roof now contains the About FAST gallery. It keeps the continuous camera and guide path, with a stationary gallery reveal at progress 1.56–1.60 (progress 1.51–1.735, floor elevation 76 m). Both lift shafts remain open and the screen, table and ceiling fittings stay outside the walking and cabin lanes. The electrical exhibition and other service models are unchanged.

The right-hand boardroom has become a projection table with an illuminated emitter, transparent rising light cone, slowly rotating rings, scan line and contextual floating screen. Original certificate pages sit in bronze frames against the rear wall. Timber ceiling slats, warm coves, bronze inlays, a brand wall and lounge signage complete the room. The dynamic projection is outside StaticInstances; repeated architectural fittings are batched.

Four buttons open About FAST, Certifications, Approvals & registrations, or Technology partners. The projection is a native modal dialog with translucent cyan styling, a restrained opening animation and orbit graphic. It is ordinary browser 3D and accessible HTML, not an AR/headset integration. The original 13 partner logos appear in a selectable collection, with bilingual country/capability information, search and official website links. The viewer can open each ISO PDF or follow the public credential links. Expanded vendor names are available in a disclosure.

The About FAST lift destination lands at progress 1.57. The header Partners action travels there behind closed lift doors before opening its projection. The floor-plan control also links to the gallery. Visitors can close the display and continue scrolling, choose a different floor or use the gallery's onward action. During a projection the tour scroll is locked; the content scrolls independently. Escape closes the dialog, focus returns to its opener, and arrow/Home/End keys operate the tabs. Reduced motion disables the projection and orbit animations. List view provides the same content without WebGL, including on mobile.

## Content sources and relationship labels

Reviewed 3 November 2026:

- User-supplied `FAST_OM_2026_SA.pdf`, 54 physical pages: introduction p3, vision/mission p4, selected supplier portals p5, thirteen technology partners pp25–26, vendor approval p46, additional vendor registrations p51. The raster introduction states established 2017, Dammam headquarters, Aramco vendor 10112399 and Saudi Energy vendor 2017011.
- User-supplied one-page ISO 9001, ISO 14001 and ISO 45001 certificates, issued by ANS System Certification on 27 October 2026. Registration numbers: CN-QMS-15252924, CN-EMS-15252925, CN-OH&SMS-15252926. The printed expiry is 26 October 2027. The later recertification date is not treated as the current expiry.
- https://fast-arabia.com/partners and its `assets/js/site.js?v=174`: thirteen partner names, original logo files, bilingual capabilities, countries and official website URLs. The latest live URLs resolve the older profile's Meta 2i/Vision Lasertechnik spelling/domain differences.
- https://fast-arabia.com/downloads: public LCGPA certificate (valid to July 2027), Civil Defense Salamah activity license 100001481 (valid to August 2028), public company profile and Aramco registration letter. Commercial Registration, CCC, GOSI and ZATCA are described as available on request, matching the documents page.

Aramco is labeled approved vendor; Saudi Energy carries the supplier registration and vendor code. The other selected names are supplier portal registrations, matching the profile. SAP is SAP Ariba Network registration, not an asserted technology partnership or certification. The thirteen technology partners are a separate collection. The additional profile vendors are not presented as technology partners. These are company-supplied statements; the implementation does not claim independent registry verification.

Only the three explicitly supplied ISO certificate PDFs and their compressed previews are copied into the site. Other credential links point to FAST's public document library. Private company-profile attachments are not republished. The supplied banner's headline and engineering/operations/digital positioning inform the room's brand wall; no local Windows path is assumed accessible to the cloud workspace.

## Validation

Completed 4 November 2026: production build, 12,001 route samples, gallery viewing-hold/table-clearance checks and lift/traffic checks pass. The full About browser walkthrough passed partner search and selection, all three PDF responses, registration content, keyboard tabs, scroll isolation, focus return, travel to Electrical and back, phone layout, Arabic, reduced motion and WCAG A/AA checks, with no runtime errors. Final desktop and phone scene captures confirm the projector clears the open lift door and fits the wider phone framing.

`BASE_PATH=/Fast-3d/ npm run build` checks TypeScript and the production deployment base. `npm run test:journey` checks 12,001 route samples; `node scripts/travel-motion-test.mjs` checks lift and traffic choreography. `node scripts/about-browser-test.mjs` exercises the header-to-gallery lift transition, partner search/detail, certification PDFs, supplier disclosures, keyboard tabs, scroll isolation, focus return, lift departure/return, mobile layout, Arabic, reduced motion, list fallback and axe WCAG A/AA. Set `ABOUT_LIST_ONLY=1` for the content-only pass. Captures are saved in `artifacts/about/`. Software-rendered checks do not benchmark hardware frame rates.
