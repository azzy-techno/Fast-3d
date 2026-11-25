"""Build the FAST site-engineer character from Microsoft Rocketbox "Construction_Male_08" (MIT).

Run headless (see build.sh):
  blender -b --factory-startup -P build_engineer.py -- \
      --src D:/Fast-3D-Codex/_downloads/rocketbox --work D:/Fast-3D-Codex/_previews/character/work \
      --previews D:/Fast-3D-Codex/_previews/character --logo <repo>/public/assets/fast-logo.png

Outputs (in --work): engineer_raw.glb (uncompressed, PNG textures), engineer_build.json (walk speed,
clip lengths, measurements), tex/*.png, engineer.blend; preview stills in --previews.
optimize.mjs turns engineer_raw.glb into public/models/engineer.glb + engineer.meta.json.
"""
import bpy
import sys
import os
import json
import math
import argparse
import numpy as np
from mathutils import Vector, Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rb_common as rb  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--src", required=True)
ap.add_argument("--work", required=True)
ap.add_argument("--previews", required=True)
ap.add_argument("--logo", required=True)
ap.add_argument("--height", type=float, default=1.76)
ap.add_argument("--stage", default="all", help="rest | all")
args = ap.parse_args(sys.argv[sys.argv.index("--") + 1:])

AV = os.path.join(args.src, "Construction_Male_08")
ANIM = os.path.join(args.src, "anim")
TEX = os.path.join(args.work, "tex")
os.makedirs(TEX, exist_ok=True)
os.makedirs(args.previews, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = 30

# ------------------------------------------------------------------ avatar
arm, mesh, info = rb.import_avatar(os.path.join(AV, "Construction_Male_08.fbx"), target_height=args.height)
corr = rb.rebuild_skeleton(arm, mesh, info)
arm.name = "Engineer"
arm.data.name = "EngineerRig"
mesh.name = "EngineerMesh"
mesh.data.name = "EngineerMesh"
rb.log("child axis (pre-reorientation):", info['child_axis_report'])
S = info['scale']

mat_index = {m.name: i for i, m in enumerate(mesh.data.materials)}
rb.log("materials", mat_index)
I_BODY = mat_index["m108_body"]
I_HEAD = mat_index["m108_head"]
I_HELMET = mat_index["m108_helmet"]

# ------------------------------------------------------------------ textures
body = rb.load_pixels(os.path.join(AV, "m108_body_color.tga"))[..., :3].copy()
head = rb.load_pixels(os.path.join(AV, "m108_head_color.tga"))[..., :3].copy()
helmet = rb.load_pixels(os.path.join(AV, "m108_helmet_color.tga"))[..., :3].copy()
logo = rb.load_pixels(args.logo)
rb.log("texture sizes", body.shape, head.shape, helmet.shape, "logo", logo.shape,
       "logo alpha range", float(logo[..., 3].min()), float(logo[..., 3].max()))

# --- recolour workwear: Rocketbox royal blue -> FAST navy; vest/glove yellow -> fluorescent hi-vis yellow
hsv = rb.rgb_to_hsv(body)
h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
blue = rb.hue_band(h, 218, 22, 12) * rb.smooth_mask(s, 0.25, 0.45)
navy_h = 222 / 360.0
hsv_n = hsv.copy()
hsv_n[..., 0] = navy_h
hsv_n[..., 1] = np.clip(s * 0.86, 0, 1)
hsv_n[..., 2] = np.clip(v * 0.50 + 0.015, 0, 1)
navy = rb.hsv_to_rgb(hsv_n)
body = body * (1 - blue[..., None]) + navy * blue[..., None]

hsv = rb.rgb_to_hsv(body)
h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
yellow = rb.hue_band(h, 50, 9, 6) * rb.smooth_mask(s, 0.45, 0.62) * rb.smooth_mask(v, 0.35, 0.55)
hsv_y = hsv.copy()
hsv_y[..., 0] = (h * 360 + 13) / 360.0          # ~50deg -> ~63deg (fluorescent yellow, slight lime)
hsv_y[..., 1] = np.clip(s * 1.04, 0, 0.93)
hsv_y[..., 2] = np.clip(v * 1.03, 0, 1)
hivis = rb.hsv_to_rgb(hsv_y)
body = body * (1 - yellow[..., None]) + hivis * yellow[..., None]
rb.log("recolour coverage: navy %.1f%%, hi-vis %.1f%%" % (100 * float(blue.mean()), 100 * float(yellow.mean())))

# --- FAST logo decals (planar projection through the UV map; avatar faces -Y)
me = mesh.data


def tri_stats(mi, pred):
    me.calc_loop_triangles()
    pts = []
    for t in me.loop_triangles:
        if t.material_index == mi and pred(t):
            pts += [me.vertices[i].co.copy() for i in t.vertices]
    return pts


# helmet geometry (front = -Y)
hp = tri_stats(I_HELMET, lambda t: True)
hx = [p.x for p in hp]; hy = [p.y for p in hp]; hz = [p.z for p in hp]
rb.log("helmet bbox x[%.3f,%.3f] y[%.3f,%.3f] z[%.3f,%.3f]" % (min(hx), max(hx), min(hy), max(hy), min(hz), max(hz)))
front = tri_stats(I_HELMET, lambda t: t.normal.y < -0.5 and abs(t.center.x) < 0.03)
prof = sorted({(round(p.z, 3), round(p.y, 3)) for p in front})
rb.log("helmet front profile (z, y):", prof)
back = tri_stats(I_BODY, lambda t: t.normal.y > 0.5 and abs(t.center.x) < 0.04 and t.center.z > 0.8 * S)
prof = sorted({(round(p.z, 3), round(p.y, 3)) for p in back})
rb.log("body back profile (z, y):", prof[:: max(1, len(prof) // 40)])

DECALS = json.loads(os.environ.get("RB_DECALS", "null")) or dict(
    vest_back=dict(z=1.300, width=0.235),
    helmet_front=dict(z=1.700, width=0.085),
    chest=dict(x=-0.088, z=1.335, width=0.078),
)
if DECALS.get("vest_back"):
    d = DECALS["vest_back"]
    ys = [p.y for p in back if abs(p.z - d["z"]) < 0.06] or [0.12]
    n = rb.project_decal(body, mesh, I_BODY, logo, (0, max(ys), d["z"]), d["width"], (0, -1, 0), max_depth=0.10)
    rb.log("vest back logo texels:", n)
if DECALS.get("chest"):
    d = DECALS["chest"]
    fr = tri_stats(I_BODY, lambda t: t.normal.y < -0.4 and abs(t.center.x - d["x"]) < 0.05 and abs(t.center.z - d["z"]) < 0.05)
    y = min(p.y for p in fr) if fr else -0.12
    n = rb.project_decal(body, mesh, I_BODY, logo, (d["x"], y, d["z"]), d["width"], (0, 1, 0), max_depth=0.06)
    rb.log("chest logo texels:", n, "at y", y)
if DECALS.get("helmet_front"):
    d = DECALS["helmet_front"]
    ys = [p.y for p in front if abs(p.z - d["z"]) < 0.03] or [min(hy)]
    n = rb.project_decal(helmet, mesh, I_HELMET, logo, (0, min(ys), d["z"]), d["width"], (0, 1, 0),
                         max_depth=0.07, shade=False, facing_min=0.25)
    rb.log("helmet logo texels:", n)

img_body = rb.save_pixels(rb.box_downscale(body, 2), os.path.join(TEX, "engineer_body.png"))
img_head = rb.save_pixels(rb.box_downscale(head, 2), os.path.join(TEX, "engineer_head.png"))
img_helmet = rb.save_pixels(rb.box_downscale(helmet, 2), os.path.join(TEX, "engineer_helmet.png"))

mats = {
    I_BODY: rb.make_material("EngineerBody", img_body, roughness=0.85),
    I_HEAD: rb.make_material("EngineerHead", img_head, roughness=0.75),
    I_HELMET: rb.make_material("EngineerHelmet", img_helmet, roughness=0.7),
}
for i, m in mats.items():
    old = mesh.data.materials[i]
    mesh.data.materials[i] = m
for m in list(bpy.data.materials):
    if m.users == 0:
        bpy.data.materials.remove(m)

# ------------------------------------------------------------------ previews: rest pose
studio = rb.setup_studio()
if args.stage == "rest":
    for name, az in (("rest_front", 0), ("rest_back", 180), ("rest_side", 90)):
        rb.render_view(studio, os.path.join(args.previews, "work", f"{name}.png"), az, target=(0, 0, 0.92))
    # close-ups for decal placement
    studio['cam'].data.lens = 150
    rb.render_view(studio, os.path.join(args.previews, "work", "rest_back_close.png"), 180, target=(0, 0, 1.35))
    rb.render_view(studio, os.path.join(args.previews, "work", "rest_front_close.png"), 0, target=(0, 0, 1.45))
    rb.render_view(studio, os.path.join(args.previews, "work", "rest_34_close.png"), 35, target=(0, 0, 1.45))
    sys.exit(0)

# ------------------------------------------------------------------ animation
build = dict(scale=S, height=args.height, clips={}, sources={})


def load(name):
    frames, world, fps = rb.sample_animation(os.path.join(ANIM, name))
    assert fps == 30, fps
    drift = rb.translation_drift_report(arm, info, corr, world)
    rb.log(name, "frames", frames[0], frames[-1], "| local translation deviation from rest (m), top 5:",
           [(round(a, 4), round(b, 4), n) for a, b, n in drift[:5]])
    clip = rb.retarget(arm, info, corr, world)
    return clip, world


def best_loop_end(clip, start, lo, hi, weights=None):
    """Loop lengths in [lo, hi] ranked by how closely the pose at start+L matches the pose at start."""
    return sorted((rb.pose_distance(clip['rot'], start, (start + L) % (clip['n'] - 1), weights), L) for L in range(lo, hi + 1))


def pick_longest(cands, slack=1.15):
    """Longest loop whose closure error is within `slack` of the best one (longer == less repetitive)."""
    best = cands[0][0]
    return max(L for d, L in cands if d <= best * slack)


actions = []

# --- Idle: m_idle_neutral_01 (11.7 s loop) -> <= 8 s window starting at the common base pose
src, _ = load("m_idle_neutral_01.fbx")
c = best_loop_end(src, 0, 150, 240)
rb.log("Idle loop candidates (max joint diff rad, length):", c[:5])
L = pick_longest(c)
idle = rb.take_window(src, 0, L, fade=36)
act, _ = rb.write_action(arm, "Idle", idle)
actions.append(act)
build['clips']['Idle'] = dict(frames=L, seconds=L / 30, source="m_idle_neutral_01", window=[0, L], fade=36)

# --- Walk: m_walk_neutral (root motion along -Y) -> in place
src, world = load("m_walk_neutral.fbx")
n = src['n']
hw = src['hips_world']
dist = (hw[-1] - hw[0])
dur = (n - 1) / 30
speed = Vector((dist.x, dist.y, 0)).length / dur
rb.log("Walk: root travel", tuple(round(x, 4) for x in dist), "in", dur, "s ->", round(speed, 4), "m/s (already scaled)")
# stance-phase estimate: foot world speed while planted, vs root speed in the same frames
X = info['X']
stance = []
for foot in ("Bip01 L Toe0", "Bip01 R Toe0"):
    pos = [(X @ m).to_translation() for m in world[foot]]
    zmin = min(p.z for p in pos)
    for i in range(n - 1):
        foot_v = (pos[i + 1] - pos[i]) * 30
        root_v = (hw[i + 1] - hw[i]) * 30
        if pos[i].z < zmin + 0.015 and pos[i + 1].z < zmin + 0.015 and abs(foot_v.y) < 0.25:
            stance.append((-root_v.y, abs(foot_v.y)))
stance_speed = sum(a for a, _ in stance) / len(stance)
stance_slide = sum(b for _, b in stance) / len(stance)
rb.log("Walk: stance frames", len(stance), "mean root speed during stance", round(stance_speed, 4),
       "mean residual foot slide in source", round(stance_slide, 4), "m/s")
# remove the linear forward travel, keep bob / sway / fore-aft oscillation, centre over the origin
rest_inv = arm.data.bones["Hips"].matrix_local.inverted()
fixed = []
for i in range(n):
    t = i / (n - 1)
    p = hw[i] - Vector((dist.x * t, dist.y * t, 0))
    fixed.append(p)
cx = sum(p.x for p in fixed[:-1]) / (n - 1)
cy = sum(p.y for p in fixed[:-1]) / (n - 1)
src['loc'] = [rest_inv @ Vector((p.x - cx, p.y - cy, p.z)) for p in fixed]
walk = rb.close_loop(src)
act, _ = rb.write_action(arm, "Walk", walk)
actions.append(act)
build['clips']['Walk'] = dict(frames=n - 1, seconds=dur, source="m_walk_neutral")
build['walkSpeed'] = speed
build['walkSpeedStance'] = stance_speed
build['walkStride'] = Vector((dist.x, dist.y, 0)).length

# --- Wave: m_wave_01 one-shot (starts and ends in the common base pose)
src, _ = load("m_wave_01.fbx")
act, _ = rb.write_action(arm, "Wave", src)
actions.append(act)
build['clips']['Wave'] = dict(frames=src['n'] - 1, seconds=(src['n'] - 1) / 30, source="m_wave_01")

# --- Talk: window out of a long talking-gesture clip, looped
TALK = json.loads(os.environ.get("RB_TALK", "null")) or dict(file="m_gestic_talk_relaxed_02.fbx", start_lo=150, start_hi=195, lo=240, hi=300, fade=24)
src, world = load(TALK["file"])
if TALK.get("scan"):
    # print hand-height activity per second to choose a window
    for hand in ("Bip01 R Hand", "Bip01 L Hand"):
        zs = [(X @ m).to_translation().z for m in world[hand]]
        rb.log(hand, "height per 0.5 s:", [round(max(zs[i:i + 15]), 2) for i in range(0, len(zs), 15)])
# the window should start (and so end) close to the common base pose so Idle <-> Talk blends are clean
base = idle['rot']
cands = []
for st in range(TALK["start_lo"], TALK["start_hi"] + 1):
    d_base = max(rb.quat_angle(src['rot'][k][st], base[k][0]) for k in base if k in src['rot'])
    for d, L in best_loop_end(src, st, TALK["lo"], TALK["hi"])[:3]:
        cands.append((d + 0.5 * d_base, d, d_base, st, L))
cands.sort()
rb.log("Talk loop candidates (score, closure rad, dist to idle base rad, start, length):", [tuple(round(x, 3) for x in c) for c in cands[:6]])
TALK["start"], L = cands[0][3], cands[0][4]
talk = rb.take_window(src, TALK["start"], L, fade=TALK["fade"])
act, _ = rb.write_action(arm, "Talk", talk)
actions.append(act)
build['clips']['Talk'] = dict(frames=L, seconds=L / 30, source=os.path.splitext(TALK["file"])[0], window=[TALK["start"], TALK["start"] + L], fade=TALK["fade"])

# ------------------------------------------------------------------ verification renders
sc.frame_start = 0


def render_clip(act, frames, prefix, az=25):
    rb.assign_action(arm, act)
    for f in frames:
        sc.frame_set(f)
        rb.render_view(studio, os.path.join(args.previews, f"{prefix}_f{f:03d}.png"), az, target=(0, 0, 0.92))


A = {a.name: a for a in actions}
# hero stills use the first Idle frame
rb.assign_action(arm, A["Idle"])
sc.frame_set(0)
rb.render_view(studio, os.path.join(args.previews, "engineer_front.png"), 0, target=(0, 0, 0.92))
rb.render_view(studio, os.path.join(args.previews, "engineer_three_quarter.png"), 35, target=(0, 0, 0.92))
rb.render_view(studio, os.path.join(args.previews, "engineer_back.png"), 180, target=(0, 0, 0.92))
studio['cam'].data.lens = 150
rb.render_view(studio, os.path.join(args.previews, "engineer_closeup_front.png"), 20, target=(0, 0, 1.45))
rb.render_view(studio, os.path.join(args.previews, "engineer_closeup_back.png"), 180, target=(0, 0, 1.38))
studio['cam'].data.lens = 70
fi = int(A["Idle"].frame_end)
render_clip(A["Idle"], [0, fi // 3, 2 * fi // 3], "idle")
fw = int(A["Walk"].frame_end)
render_clip(A["Walk"], [0, fw // 3, 2 * fw // 3], "walk", az=70)
ft = int(A["Talk"].frame_end)
render_clip(A["Talk"], [ft // 4, ft // 2, 3 * ft // 4], "talk")
fv = int(A["Wave"].frame_end)
render_clip(A["Wave"], [fv // 3, fv // 2, 2 * fv // 3], "wave", az=10)

# foot grounding check per clip (lowest toe/foot bone height over the clip)
for a in actions:
    rb.assign_action(arm, a)
    lows = []
    for f in range(0, int(a.frame_end) + 1, 2):
        sc.frame_set(f)
        lows.append(min((arm.matrix_world @ arm.pose.bones[b].head).z for b in ("LeftToeBase", "RightToeBase")))
    rb.log(a.name, "toe-joint height min/max over clip: %.3f / %.3f (rest %.3f)" % (min(lows), max(lows), arm.data.bones["LeftToeBase"].head_local.z))

# ------------------------------------------------------------------ export
for o in (studio['ground'], studio['sun'], studio['cam']):
    o.hide_render = True
rb.assign_action(arm, None)
rb.reset_pose(arm)
rb.push_nla(arm, actions)
sc.frame_set(0)
rb.select_only([arm, mesh], arm)
out = os.path.join(args.work, "engineer_raw.glb")
bpy.ops.export_scene.gltf(
    filepath=out, export_format='GLB', use_selection=True,
    export_yup=True, export_apply=False,
    export_animations=True, export_animation_mode='NLA_TRACKS',
    export_force_sampling=True, export_optimize_animation_size=True,
    export_optimize_animation_keep_anim_armature=True,
    export_anim_slide_to_zero=True, export_frame_range=False,
    export_skins=True, export_influence_nb=4, export_all_influences=False,
    export_def_bones=False, export_rest_position_armature=True,
    export_morph=False, export_tangents=False, export_normals=True,
    export_image_format='AUTO', export_materials='EXPORT',
    export_extras=False, export_cameras=False, export_lights=False,
)
rb.log("exported", out, os.path.getsize(out), "bytes")
build['bones'] = [b.name for b in arm.data.bones]
build['hipsHeight'] = arm.data.bones['Hips'].head_local.z
build['tris'] = sum(len(p.vertices) - 2 for p in mesh.data.polygons)
with open(os.path.join(args.work, "engineer_build.json"), "w") as f:
    json.dump(build, f, indent=1)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(args.work, "engineer.blend"))
rb.log("done")
