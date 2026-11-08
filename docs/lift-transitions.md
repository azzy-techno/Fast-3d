# Lift rendering and door transitions

The floor selector now coordinates with the WebGL renderer through a shared phase:

1. **Select:** retain the last scene frame and stop the render loop.
2. **Closing:** slide the two composited door panels over that stable frame (450 ms).
3. **Travelling:** teleport while covered, update the destination camera/visibility,
   asynchronously compile its visible materials, and render the destination once.
4. **Opening:** after the destination frame has been submitted and the browser has
   had a paint opportunity, slide the doors apart over the stable frame (520 ms).
5. **Idle:** resume the ordinary tour or demand-rendered binocular view.

Door animation no longer competes with continuous WebGL rendering. Readiness uses
the completed destination draw, rather than the camera's pre-render jump marker.
The polling interval was removed. Animation time survives R3F frame-loop resets,
so traffic and the engineer do not restart when leaving the lift.

Three.js `compileAsync()` traverses hidden objects. `compileVisible()` supplies a
visible-only traversal without changing parent relationships or visibility flags,
while retaining the real scene's lighting and environment. It excludes inactive
floors and hidden original meshes already replaced by instances. The same helper
corrects startup shader warming.

First visits can still take longer to prepare on slow GPUs: shader compilation and
texture upload have real costs. Those costs occur while the doors are fully closed,
rather than interrupting their movement. The 970 ms combined door animation is not
a promise about total trip duration or hardware frame rate. Normal scroll-guided
lift choreography and the sealed cabin routes remain unchanged.

Validation:

- `node scripts/lift-transition-test.mjs`: visible-only shader traversal, unchanged
  graph/visibility and no duplicate destination lights.
- `node scripts/lift-browser-test.mjs`: one destination render, zero rendering in
  selector/door phases, readiness, animation time, forward/return trips, roof,
  About FAST, Electrical, Fire, reception, mobile, accessibility and sealed cabins.
- `node scripts/observatory-browser-test.mjs`: first-person viewer and outgoing
  lift remain functional with the shared render controller.
- Existing journey and travel-motion tests cover camera routes and lift doors.
