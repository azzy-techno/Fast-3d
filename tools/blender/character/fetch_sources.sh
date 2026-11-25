#!/usr/bin/env bash
# Downloads the third-party source files (Microsoft Rocketbox, MIT) used by build.sh.
# Usage: tools/blender/character/fetch_sources.sh [dest]   (default: <repo>/../_downloads/rocketbox)
# The destination is treated as untrusted data: nothing in it is executed; Blender is always run
# with --factory-startup and the scripts live in this folder.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="${1:-$(cd "$HERE/../../../.." && pwd)/_downloads/rocketbox}"
BASE="https://raw.githubusercontent.com/microsoft/Microsoft-Rocketbox/master"
get() { # get <repo path> <local path>
  mkdir -p "$(dirname "$DEST/$2")"
  [ -s "$DEST/$2" ] || curl -fsSL --retry 3 -m 900 "$BASE/$1" -o "$DEST/$2"
}
get "LICENSE.md" "LICENSE.md"

# --- engineer: Construction_Male_08
P="Assets/Avatars/Professions/Construction_Male_08"
get "$P/Export/Construction_Male_08.fbx" "Construction_Male_08/Construction_Male_08.fbx"
for t in body_color head_color helmet_color; do get "$P/Textures/m108_$t.tga" "Construction_Male_08/m108_$t.tga"; done

# --- animations (shared Bip01 skeleton)
A="Assets/Animations"
get "$A/all_animations_max_motextr_static/m_idle_neutral_01.max.fbx"        "anim/m_idle_neutral_01.fbx"
get "$A/all_animations_max_motextr_xy/m_walk_neutral.max.fbx"               "anim/m_walk_neutral.fbx"
get "$A/all_animations_max_motextr_xy/m_walk_neutral_01.max.fbx"            "anim/m_walk_neutral_01.fbx"
get "$A/all_animations_max_motextr_static/m_wave_01.max.fbx"                "anim/m_wave_01.fbx"
get "$A/all_animations_max_motextr_static/m_gestic_talk_relaxed_02.max.fbx" "anim/m_gestic_talk_relaxed_02.fbx"

# --- pedestrians
ped() { # ped <avatar> <texture stem>...
  local n="$1"; shift
  get "Assets/Avatars/Adults/$n/Export/$n.fbx" "$n/$n.fbx"
  for t in "$@"; do get "Assets/Avatars/Adults/$n/Textures/$t.tga" "$n/$t.tga"; done
}
ped Male_Adult_14   m012_body_color m012_head_color
ped Female_Adult_10 f201_body_color f201_head_color
ped Male_Adult_21   m251_body_color m251_head_color m251_keffiyeh_color
echo "sources ready in $DEST"
