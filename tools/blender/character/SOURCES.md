# Character sources and licences

Everything in `public/models/engineer.glb`, `ped-1.glb`, `ped-2.glb`, `ped-3.glb` is derived from the
**Microsoft Rocketbox Avatar Library** — https://github.com/microsoft/Microsoft-Rocketbox —
**MIT License, Copyright (c) 2020 Microsoft** (licence text: `LICENSE.md` in that repository; a copy is
saved next to the downloads as `_downloads/rocketbox/LICENSE.md`). The MIT licence allows commercial
use, modification and redistribution provided the copyright and permission notice are kept, which
this file does:

> MIT License — Copyright (c) 2020 Microsoft
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
> associated documentation files (the "Software"), to deal in the Software without restriction,
> including without limitation the rights to use, copy, modify, merge, publish, distribute,
> sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or
> substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
> NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
> DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
> OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

No Mixamo, Ready Player Me or three.js example assets are used. The only non-Rocketbox input is the
project's own `public/assets/fast-logo.png`.

All paths below are relative to
`https://raw.githubusercontent.com/microsoft/Microsoft-Rocketbox/master/` (repository tree
`0943055db6ec570bcef9f2c8b41c9e5467c808f9`, fetched 2026-11-24). `fetch_sources.sh` downloads exactly
this list.

## engineer.glb

| Source file | Used for |
| --- | --- |
| `Assets/Avatars/Professions/Construction_Male_08/Export/Construction_Male_08.fbx` | mesh (hipoly LOD, 8,474 tris), skin weights, Bip01 skeleton |
| `Assets/Avatars/Professions/Construction_Male_08/Textures/m108_body_color.tga` | body base colour |
| `Assets/Avatars/Professions/Construction_Male_08/Textures/m108_head_color.tga` | head base colour |
| `Assets/Avatars/Professions/Construction_Male_08/Textures/m108_helmet_color.tga` | helmet base colour |
| `Assets/Animations/all_animations_max_motextr_static/m_idle_neutral_01.max.fbx` | `Idle` |
| `Assets/Animations/all_animations_max_motextr_xy/m_walk_neutral.max.fbx` | `Walk` |
| `Assets/Animations/all_animations_max_motextr_static/m_gestic_talk_relaxed_02.max.fbx` | `Talk` |
| `Assets/Animations/all_animations_max_motextr_static/m_wave_01.max.fbx` | `Wave` |

Changes made (all in `build_engineer.py` / `rb_common.py` / `optimize.mjs`):

- Uniformly scaled by 0.9602 so the character (helmet included) is 1.76 m tall; transforms applied
  (identity armature/root), feet on the ground plane, facing glTF +Z.
- Skeleton: 80 Bip01 bones -> 53. Facial bones folded into `Head` (lower-lip bones into `Jaw`);
  thighs re-parented from Spine to Hips and clavicles from Neck to Spine2; every bone re-oriented by
  a constant rotation so local +Y runs along the bone; bones renamed to Mixamo-style names without
  spaces (`Bip01 R UpperArm` -> `RightArm`, ...). Five vertices that were skinned only to the Biped
  root received their neighbours' weights. Max 4 influences, normalised.
- Textures: royal-blue workwear recoloured to navy; vest/glove yellow shifted to fluorescent hi-vis
  yellow (reflective bands untouched); FAST logo planar-projected onto the vest back, the right chest
  and the helmet front; 2048 px -> 1024 px (helmet 1024x512), WebP. Normal/specular maps are not
  used. Materials: base colour only, metallic 0, roughness 0.85 / 0.75 / 0.70, opaque, single-sided.
- Animation: sampled at 30 fps and retargeted in world space per bone
  (`pose_world_new = pose_world_src @ C`, the same constant re-orientation `C` as the rest pose),
  rotations only except the hips translation (scaled by the leg-length ratio).
  - `Idle`: first 181 frames (6.03 s) of the 11.7 s source loop; the last 36 frames are cross-faded
    into the wrapped source so it loops seamlessly.
  - `Walk`: the 32-frame cycle with the linear forward root travel removed (bob, sway and fore-aft
    oscillation kept, centred on the origin); 1.438 m per cycle => 1.348 m/s.
  - `Talk`: source frames 172-428 (8.53 s, the left-hand explaining passage), 24-frame cross-fade to
    loop.
  - `Wave`: the complete clip (2.83 s), timing unchanged.
  - Scale tracks, non-hips translation tracks and never-moving channels removed; redundant keyframes
    removed (`resample`, tolerance 1e-4); no face animation.
- `EXT_meshopt_compression` + `KHR_mesh_quantization` (glTF-Transform `meshopt`, level medium).

## ped-1.glb / ped-2.glb / ped-3.glb

| File | Source avatar | Source files |
| --- | --- | --- |
| `ped-1.glb` | `Assets/Avatars/Adults/Male_Adult_14` | `Export/Male_Adult_14.fbx`, `Textures/m012_body_color.tga`, `Textures/m012_head_color.tga` |
| `ped-2.glb` | `Assets/Avatars/Adults/Female_Adult_10` | `Export/Female_Adult_10.fbx`, `Textures/f201_body_color.tga`, `Textures/f201_head_color.tga` |
| `ped-3.glb` | `Assets/Avatars/Adults/Male_Adult_21` | `Export/Male_Adult_21.fbx`, `Textures/m251_body_color.tga`, `Textures/m251_head_color.tga`, `Textures/m251_keffiyeh_color.tga` |

Clips (stored in `ped-1.glb` only): `Idle` from `m_idle_neutral_01.max.fbx` (same window as the
engineer) and `Walk` from `Assets/Animations/all_animations_max_motextr_xy/m_walk_neutral_01.max.fbx`
(36-frame cycle, in place, 1.167 m per cycle => 0.972 m/s).

Changes made (`build_pedestrians.py`): same normalisation and skeleton conventions as the engineer,
but each avatar is scaled so its hips sit 0.8604 m above the ground (the engineer's hips height) —
that is what makes one clip set valid for all of them; fingers baked into the relaxed idle curl and
folded into the hands, jaw folded into the head (22 bones); the eyelash alpha cards of
`Female_Adult_10` deleted (no transparent material); Decimate (collapse) applied down to <= 5,000
triangles; textures box-filtered to 512 px, WebP; meshopt compression.

## Regenerating

```bash
tools/blender/character/fetch_sources.sh     # downloads into ../_downloads/rocketbox
tools/blender/character/build.sh all         # Blender 5.2 headless + node (repo devDependencies)
node tools/blender/character/three_check.mjs public/models/engineer.glb Idle   # three.js load check
```

Scripts: `rb_common.py` (shared: import/normalise, skeleton rebuild, retarget, loop tools, texture
decals, preview rendering), `build_engineer.py`, `build_pedestrians.py`, `optimize.mjs` (channel
pruning, resample, WebP, meshopt; writes the meta JSON files), `verify_glb.py` (re-imports a final GLB
in a fresh Blender and renders stills), `three_check.mjs` (loads a final GLB with the three.js
GLTFLoader), `inspect_fbx.py` / `probe_anim.py` / `tga2png.py` (inspection helpers used while choosing
sources).
