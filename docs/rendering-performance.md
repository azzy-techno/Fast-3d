# Rendering performance

The continuous tour runs locally in WebGL. Rendering cost, React updates and
shader compilation affect interaction after assets have loaded.

The November 5 performance pass addresses several sources of unnecessary work:

- `Experience` and its world are memoized. Scroll percentage and UI state changes
  no longer reconcile the thousands of scene elements or regenerate facade
  geometry from freshly allocated component props.
- Static painted primitives share instanced draws across colors, preserving their
  exact original tint in instance attributes. The exterior building and individual
  cars now use the same batching. Animated subtrees remain independent.
- Hidden floor and city roots skip matrix traversal and force a complete update
  when they become visible again. Floor visibility no longer includes multiple
  enclosed neighboring floors during a presentation. Lift cabins remain separate.
- The About hall stops rendering once the outgoing cabin hands off at 1.96.
  Clouds and sunlight shadow passes stop indoors. The Electrical exhibition keeps
  its local key lighting.
- Sustained low frame rate disables expensive real-time shadows and reduces
  render resolution. The performance monitor is suspended during the demand-rendered
  AR view, so idle time is not mistaken for poor frame rate.
- The hidden engineer stops skeletal animation during binocular POV. Electrical
  lights stop animating outside their section. The lift UI subscribes to its current
  floor instead of rerendering on every scroll sample. Scroll layout measurements
  are cached until a refresh.

## Validation

`node scripts/render-optimizations-test.mjs` checks color/transform preservation,
animated subtree exclusion, cleanup and correct transforms when hidden trees wake.
The existing route, lift travel and Observatory browser checks cover presentation
positions, first-person entry/exit, mobile, Arabic and keyboard access.

For local profiling, build with `BASE_PATH=/Fast-3d/ npm run build`, then run
`PROFILE_NAME=after PROFILE_SHOTS=1 node scripts/render-profile.mjs`.
`PROFILE_BUILD` optionally selects a saved Vite output for a baseline. It records
main-pass draw calls, triangles, scene counts, submission time and screenshots at
the exterior, About hall and Electrical floor, plus lift/model inspection shots.
The probe is inactive unless the URL includes `?profile-renderer`; it sends no data.

Software-rendered Chromium timings are not hardware FPS estimates. Compare draw
counts at the same viewport and route position, and verify perceived smoothness
on the visitor's actual browser and GPU. Performance adaptation trades dynamic
shadow detail for responsiveness on slower devices; all service models remain.

At the same 1280 × 800 viewport, the saved baseline/final samples measured 696 →
343 average main-pass draws at arrival (51% fewer), 154 → 131 at the About landing,
and 476 → 224 at Electrical (53% fewer). Electrical main-pass triangles dropped
from 122,846 to 80,653 as neighboring enclosed floors stopped rendering. These
main-pass counts do not include the additional savings from shadow passes.
Route and animation tests, the complete Observatory browser walkthrough and
inspection of both lift cabins, exterior and service models passed.
