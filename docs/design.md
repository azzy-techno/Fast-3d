# Direction and decisions

## What the previous version taught us

Walked as a visitor on a laptop with integrated graphics (Intel UHD, Chrome, 1440 × 900) and on a
phone-sized viewport:

- **First load**: 11.4 MB transferred and about 28 s behind a progress bar before anything could be done.
- **Frame time**: 24–31 ms while scrolling the street and reception, with single frames of 60–100 ms and
  one stall of more than two seconds when the lobby came into view; 330–560 ms stalls after lift rides.
- **Camera and guide competed**: the guide stood in the centre of the frame with his back to the visitor,
  in a hunched stance retargeted from a combat idle.
- **Scale and material**: flat-shaded procedural boxes lit by real-time lights read as a diorama; the
  reception stood open to the street; labels in the scene were too small to read and the toolbar sat on
  top of them.
- **Length**: 60 % of the first scroll was spent before reaching reception; one floor was 27,000 px long.

The ideas were right: arrive from the street, meet a young engineer, choose a floor in the lift, see
what the company builds, end above the city. They are all kept and re-made.

## Direction: an evening visit to one designed building

- **Light tells the time.** Arrival is late afternoon with a low sun behind the visitor; the galleries
  look out at the same sunset through their glazing; the roof is at dusk with the city's windows on. One
  sky model lights the bakes and draws the dome, so reflections, shadows and background agree.
- **One building.** The lift is in the same place on every level. The lobby, each gallery and the roof
  share materials (pale stone, polished concrete, graphite metal, champagne fins) and each floor adds a
  single accent colour, used for its wall numeral, platform edge, card rule and lift button.
- **Baked, not faked.** Global illumination is path-traced offline and stored; the runtime only
  multiplies and reflects. Contact shadows, soft daylight through glass and light bouncing off the floor
  come for free, and the frame budget goes to resolution and smoothness.
- **The exhibit is the explanation.** Every floor is a line of five real assemblies in working order,
  so the service is recognisable before the heading is read: a ring main unit feeding a transformer and
  an open switchboard; colour-coded pipework with a hot tap; a skid on trestles under a welding arc; a
  cut block of ground with rebar and road courses; red pipework from pump set to sprinkler head; racks,
  cameras and turnstiles; a robot cell with its digital twin; a cooling tower that comes apart.
- **Text is never painted into the scene.** Labels and signs are real text (DOM or runtime canvas), so
  they are sharp at any distance, follow the language, and work with assistive technology.
- **The guide leads and yields.** He walks at a human pace ahead of the camera, stands on the side away
  from the text card (and changes side in Arabic), looks at the visitor and points a straight arm at
  the component. A soft shadow sits under each shoe.
- **Thirty seconds or ten minutes.** The header always offers Services (every floor and its official
  page), Contact and the quick overview. The tour itself rests at each stop and never forces a sequence.

## Interface

Graphite panels, warm white type, FAST blue for primary actions. Sora for headings, Plus Jakarta Sans
for text, Cairo for Arabic (the company site's families). One card for the story, one dock for where
you are, a lift panel styled as a control panel. No decoration that is not also navigation.

## Accuracy rules

Company statements come only from the FAST O&M Company Profile 2026 and fast-arabia.com; where the two
disagree the profile wins and the difference is noted in `src/content`. Nothing is invented: no
statistics, ratings or clients beyond those sources. Equipment is illustrative of the service scope, not
a record of a specific installation; screens are labelled as demos.
