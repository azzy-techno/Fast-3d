# Skyscraper journey — staged approval

The user selected the cooling-tower roof as the first service approval preview. This pass updates the current roof, character styling, street continuity and lift enclosure. The existing three-level route remains until the new vertical layout is implemented; it is not yet a skyscraper.

## Proposed vertical story

An approximately 80–90 m tower with a recessed crown and mechanical roof. Every service gets its own occupied floor, with a continuous enclosed lift core, a landing, a demonstration area and a real project reference. The reception remains at ground level. Floors are authored individually after approval, rather than duplicating the existing gallery ten times.

Proposed descent: roof cooling → electrical → mechanical → fabrication → civil → fire protection → IT → smart manufacturing → Industry 4.0 → IIoT → computer vision → reception → forecourt farewell → drone reveal.

FAST's current navigation groups technology under IT Services, Industrial Automation, 3D & Digital, and ERP Solutions. Smart manufacturing, Industry 4.0, IIoT and computer vision should be checked against these scopes before publishing detailed claims. Do not imply unsupported services or fabricated client results.

## Roof approval preview

Source: https://fast-arabia.com/services/mechanical (reviewed 2026-10-26).

Confirmed scope: cooling tower design, supply and retrofit; HVAC; piping; hot tapping; industrial equipment; water treatment. Delivery stages: assessment, engineering/design, execution, testing/commissioning/handover.

The roof adds access ladders, panel seams, fasteners and gauges to the existing fan, valve, header, duct and air-handling models. The expandable service panel cites Dammam Airport (SPIG / DACO), AK Tower (Al Abdulkarim Holding), and NFIC Jeddah (Enjaz Energy), as listed by FAST. All displayed equipment is a conceptual installation, not a digital twin of those projects. Gauges do not represent live telemetry.

## Visual direction and remaining work

Use authored PBR assets with real material roughness and normal maps, detailed models near the camera, lower-detail instanced city blocks in the distance, and consistent sun/environment lighting. Keep exposure and shadow quality stable through transitions. The current character remains a stylized adaptation of the licensed Ready Player Me source, with workwear and attached accessories; it is not a newly scanned human. Pedestrians share the skeleton but have varied silhouettes, hair, skin, clothing and accessories.

A GTA/Forza-style reference does not mean equivalent game-engine asset density or ray-traced performance in a browser. Evaluate the tower/first-floor prototype on representative desktop and mobile hardware before increasing the asset budget.

## Checks for this pass

The deployment-base TypeScript/Vite build, 12,001-sample journey route checks, audio lifecycle checks and `node scripts/travel-motion-test.mjs` pass. The motion regression checks sample all three lift descents with sealed doors, bounded smooth door opening, and 1,000 seconds of traffic motion in both directions. Browser captures cover the roof, character presentation, both interior descents and the reception lift. The source coat geometry is shortened using skinned bind-pose positions, preserving animation and shadow geometry.
