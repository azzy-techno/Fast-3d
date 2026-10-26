# Skyscraper journey — staged approval

The cooling-tower roof and engineer were approved by the user. The next approval preview is the electrical floor in the new 83 m tower. Ten services now occupy separate levels, reached through a continuous enclosed lift journey. Detailed content for the remaining services is still subject to individual review.

## Proposed vertical story

The implemented tower has an 83 m mechanical roof, a workplace at 76 m and service floors from 66 m down to 12 m at 6 m intervals. Every service gets its own occupied floor, with a continuous enclosed lift core, a landing, a demonstration area and a real project reference. The reception remains at ground level. Floors are authored individually after approval, rather than duplicating the existing gallery ten times.

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


## Electrical floor approval preview

Source: https://fast-arabia.com/services/electrical (reviewed 2026-10-26).

The electrical floor is level 11 at 66 m. The scroll starts beside the LV panels, pulls back to reveal the RMU bays, cable ladder, transformer and commissioning bench, then returns to the enclosed lift. Model details include switching handles, relay displays, cable routes, transformer cooling fins and bushings, work surfaces and testing instruments. These are conceptual educational models, not live measurements or an as-built installation.

The expandable electrical panel cites FAST's published scope: LV/power panels, smart RMUs, transformer installation/alignment, LV/MV cable termination/jointing and testing. Project references are RMU replacements for CCS / SGCC, RMU replacement at DACO for Energia, and cable pulling/testing for Al Hajry Overseas. No invented electrical ratings or live operational values are displayed.

The later floors currently reuse the existing service equipment and copy. Their individual service treatment is pending approval, rather than being presented as a complete content redesign. The floor plan now shows a vertical building section. Roof, workplace, service and reception labels correspond to the new elevations.

The camera and guide share the same vertical lift interpolation. Doors close before each of the nine inter-floor descents; floor slabs leave real shaft openings. The bottom landing is solid, and the reception route has a separate rear opening and lift. Cars wrap at ±1,000 m, beyond the exterior fog, with the foreground streets extending to ±1,200 m.

Validation for the tower pass: the deployment-base build, full browser suite, 12,001-sample route checks, sound lifecycle checks and travel-motion tests pass. Route checks verify ten distinct elevations and exact camera/cabin alignment through all nine inter-floor descents. Minimum guide/camera horizontal clearance remains 1.05 m and guide/equipment-envelope clearance 0.40 m. Follow-up captures review the enclosed shaft, rear reception passage, electrical panorama and portrait transformer/commissioning framing. The upcoming service card stays hidden during lift travel. Hardware frame rates are not benchmarked by the software-WebGL browser checks.
