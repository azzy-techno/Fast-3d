#!/usr/bin/env bash
# Regenerates public/models/engineer.glb (+ meta) and the pedestrians from the Rocketbox downloads.
# Usage (Git Bash, from anywhere):  tools/blender/character/build.sh [engineer|pedestrians|all]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
BLENDER="${BLENDER:-/c/Program Files/Blender Foundation/Blender 5.2/blender.exe}"
ROOT="$(cd "$REPO/.." && pwd)"
SRC="${RB_SRC:-$ROOT/_downloads/rocketbox}"
PREV="${RB_PREVIEWS:-$ROOT/_previews/character}"
WORK="$PREV/work"
w() { cygpath -m "$1"; }
what="${1:-all}"
mkdir -p "$WORK" "$REPO/public/models"
if [[ "$what" == "engineer" || "$what" == "all" ]]; then
  "$BLENDER" -b --factory-startup -P "$(w "$HERE/build_engineer.py")" -- \
    --src "$(w "$SRC")" --work "$(w "$WORK")" --previews "$(w "$PREV")" \
    --logo "$(w "$REPO/public/assets/fast-logo.png")" 2>&1 | grep -v "^Fra:"
  (cd "$REPO" && node "$(w "$HERE/optimize.mjs")" engineer "$(w "$WORK")" "$(w "$REPO/public/models")")
  "$BLENDER" -b --factory-startup -P "$(w "$HERE/verify_glb.py")" -- \
    "$(w "$REPO/public/models/engineer.glb")" "$(w "$PREV")" verify_engineer Walk 8 Idle 60 2>&1 | grep -v "^Fra:"
fi
if [[ "$what" == "pedestrians" || "$what" == "all" ]]; then
  "$BLENDER" -b --factory-startup -P "$(w "$HERE/build_pedestrians.py")" -- \
    --src "$(w "$SRC")" --work "$(w "$WORK")" --previews "$(w "$PREV")" 2>&1 | grep -v "^Fra:"
  (cd "$REPO" && node "$(w "$HERE/optimize.mjs")" pedestrians "$(w "$WORK")" "$(w "$REPO/public/models")")
  for i in 1 2 3; do
    "$BLENDER" -b --factory-startup -P "$(w "$HERE/verify_glb.py")" -- \
      "$(w "$REPO/public/models/ped-$i.glb")" "$(w "$PREV")" "verify_ped-$i" 2>&1 | grep -v "^Fra:"
  done
fi
