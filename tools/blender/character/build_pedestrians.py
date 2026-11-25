"""Build three low-poly pedestrians from Microsoft Rocketbox adult avatars (MIT).

  blender -b --factory-startup -P build_pedestrians.py -- --src <downloads/rocketbox> --work <work> --previews <previews>

Each pedestrian: <= 5k triangles (Decimate applied to the skinned mesh), <= 512 px textures, 22 bones
(fingers baked into a relaxed curl and folded into the hands, face folded into the head) with exactly
the same bone names / rest orientations-independent clip data, so the Walk + Idle clips stored in
ped-1.glb drive ped-2.glb and ped-3.glb by bone name.  All three are scaled to the same hips height
as the engineer (0.8604 m) - that is what makes one Hips translation track valid for all of them.

Outputs in --work: ped-N_raw.glb, pedestrians_build.json, ped_pose_check.json; previews in --previews.
"""
import bpy
import sys
import os
import json
import argparse
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rb_common as rb  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--src", required=True)
ap.add_argument("--work", required=True)
ap.add_argument("--previews", required=True)
ap.add_argument("--hips", type=float, default=0.8604, help="rest hips height shared with engineer.glb")
ap.add_argument("--max-tris", type=int, default=5000)
args = ap.parse_args(sys.argv[sys.argv.index("--") + 1:])
ANIM = os.path.join(args.src, "anim")
TEX = os.path.join(args.work, "tex")
os.makedirs(TEX, exist_ok=True)

PEDS = [
    dict(id="ped-1", source="Male_Adult_14", description="business-casual man (grey shirt, khaki trousers)",
         textures={"m012_body": "m012_body_color.tga", "m012_head": "m012_head_color.tga"}, suggested_scale=1.02),
    dict(id="ped-2", source="Female_Adult_10", description="woman in black abaya and hijab",
         textures={"f201_body": "f201_body_color.tga", "f201_head": "f201_head_color.tga"}, suggested_scale=1.0),
    dict(id="ped-3", source="Male_Adult_21", description="man in white thobe and red-checked shemagh",
         textures={"m251_body": "m251_body_color.tga", "m251_head": "m251_head_color.tga", "m251_keffiyeh": "m251_keffiyeh_color.tga"},
         suggested_scale=1.03),
]
FINGERS = [f"{s}Hand{f}{i}" for s in ("Left", "Right") for f in ("Thumb", "Index", "Middle", "Ring", "Pinky") for i in (1, 2, 3)]
FOLD = {b: ("LeftHand" if b.startswith("Left") else "RightHand") for b in FINGERS}
FOLD["Jaw"] = "Head"

# sample the shared animation sources once per avatar (cheap) -------------------------------------
build = dict(peds=[], meta=dict(
    note="ped-1.glb carries the Walk and Idle clips; apply them to ped-2/ped-3 by bone name (identical names, same hips height).",
    units="metres, Y up, facing +Z, feet on y=0", hipsHeight=args.hips))
pose_check = {}
ref_corr = None

for ped in PEDS:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.fps = 30
    av = os.path.join(args.src, ped["source"])
    arm, mesh, info = rb.import_avatar(os.path.join(av, ped["source"] + ".fbx"), target_hips=args.hips)
    n_drop = rb.drop_material_faces(mesh, "opacity")  # eyelash cards: not worth an alpha material
    corr = rb.rebuild_skeleton(arm, mesh, info)
    if ref_corr is None:
        ref_corr = {k: [list(r) for r in v] for k, v in corr.items()}
    else:  # identical axis conventions are what make clips shareable
        for k, v in corr.items():
            assert all(abs(a - b) < 1e-6 for r1, r2 in zip(v, ref_corr[k]) for a, b in zip(r1, r2)), f"bone axis convention differs on {k}"
    arm.name = "Pedestrian"
    arm.data.name = "PedestrianRig"
    mesh.name = "PedestrianMesh"
    mesh.data.name = f"{ped['id']}_mesh"

    # --- animation sources (retargeted on the full skeleton, fingers included)
    frames, world, fps = rb.sample_animation(os.path.join(ANIM, "m_idle_neutral_01.fbx"))
    idle_src = rb.retarget(arm, info, corr, world)
    frames, world, fps = rb.sample_animation(os.path.join(ANIM, "m_walk_neutral_01.fbx"))
    walk_src = rb.retarget(arm, info, corr, world)

    # --- relaxed fingers baked into the mesh, then fingers/jaw folded away
    rb.bake_pose_into_mesh(arm, mesh, {b: idle_src['rot'][b][0] for b in FINGERS if b in idle_src['rot']}, FINGERS)
    rb.fold_bones(arm, mesh, FOLD)
    for clip in (idle_src, walk_src):
        for b in FOLD:
            clip['rot'].pop(b, None)
    tris = rb.decimate(mesh, arm, args.max_tris)
    rb.log(ped["id"], ped["source"], "eyelash faces dropped", n_drop, "-> tris", tris, "bones", len(arm.data.bones),
           "height %.3f" % max(v.co.z for v in mesh.data.vertices))

    # --- textures / materials
    for i, m in enumerate(list(mesh.data.materials)):
        tga = ped["textures"][m.name]
        px = rb.load_pixels(os.path.join(av, tga))[..., :3]
        f = px.shape[0] // 512
        img = rb.save_pixels(rb.box_downscale(px, f) if f > 1 else px, os.path.join(TEX, f"{ped['id']}_{m.name.split('_', 1)[1]}.png"))
        mesh.data.materials[i] = rb.make_material(f"{ped['id']}_{m.name.split('_', 1)[1]}", img, roughness=0.85)
    for m in list(bpy.data.materials):
        if m.users == 0:
            bpy.data.materials.remove(m)

    # --- clips
    idle = rb.take_window(idle_src, 0, 181, fade=36)          # same window as the engineer's Idle
    n = walk_src['n']
    hw = walk_src['hips_world']
    dist = hw[-1] - hw[0]
    dur = (n - 1) / 30
    speed = Vector((dist.x, dist.y, 0)).length / dur
    rest_inv = arm.data.bones["Hips"].matrix_local.inverted()
    fixed = [hw[i] - Vector((dist.x, dist.y, 0)) * (i / (n - 1)) for i in range(n)]
    cx = sum(p.x for p in fixed[:-1]) / (n - 1)
    cy = sum(p.y for p in fixed[:-1]) / (n - 1)
    walk_src['loc'] = [rest_inv @ Vector((p.x - cx, p.y - cy, p.z)) for p in fixed]
    walk = rb.close_loop(walk_src)
    a_idle, _ = rb.write_action(arm, "Idle", idle)
    a_walk, _ = rb.write_action(arm, "Walk", walk)
    rb.log(ped["id"], "Walk %.3f s, stride %.3f m -> %.3f m/s; Idle %.3f s" % (dur, dist.length, speed, 181 / 30))

    # --- previews + reference joint positions (glTF axes) for the clip-sharing check in three.js
    studio = rb.setup_studio()
    rb.assign_action(arm, a_idle)
    sc.frame_set(0)
    rb.render_view(studio, os.path.join(args.previews, f"{ped['id']}_front.png"), 25, target=(0, 0, 0.92))
    rb.render_view(studio, os.path.join(args.previews, f"{ped['id']}_back.png"), 180, target=(0, 0, 0.92))
    rb.assign_action(arm, a_walk)
    chk = {}
    for f in (0, 9, 18, 27):
        sc.frame_set(f)
        chk[f] = {b: [round(v, 5) for v in ((arm.matrix_world @ arm.pose.bones[b].head).x, (arm.matrix_world @ arm.pose.bones[b].head).z, -(arm.matrix_world @ arm.pose.bones[b].head).y)]
                  for b in ("Hips", "Head", "LeftHand", "RightHand", "LeftFoot", "RightFoot", "LeftToeBase", "RightToeBase")}
    pose_check[ped["id"]] = chk
    for f in (4, 16, 28):
        sc.frame_set(f)
        rb.render_view(studio, os.path.join(args.previews, f"{ped['id']}_walk_f{f:03d}.png"), 65, target=(0, 0, 0.92))

    # --- export
    for o in (studio['ground'], studio['sun'], studio['cam']):
        o.hide_render = True
    rb.assign_action(arm, None)
    rb.reset_pose(arm)
    rb.push_nla(arm, [a_idle, a_walk])
    sc.frame_set(0)
    rb.select_only([arm, mesh], arm)
    out = os.path.join(args.work, f"{ped['id']}_raw.glb")
    bpy.ops.export_scene.gltf(
        filepath=out, export_format='GLB', use_selection=True, export_yup=True, export_apply=False,
        export_animations=True, export_animation_mode='NLA_TRACKS', export_force_sampling=True,
        export_optimize_animation_size=True, export_optimize_animation_keep_anim_armature=True,
        export_anim_slide_to_zero=True, export_frame_range=False,
        export_skins=True, export_influence_nb=4, export_all_influences=False, export_def_bones=False,
        export_rest_position_armature=True, export_morph=False, export_tangents=False, export_normals=True,
        export_image_format='AUTO', export_materials='EXPORT', export_extras=False, export_cameras=False, export_lights=False,
    )
    rb.log("exported", out, os.path.getsize(out), "bytes")
    build['peds'].append(dict(id=ped["id"], source=ped["source"], description=ped["description"],
                              height=round(max(v.co.z for v in mesh.data.vertices), 3), tris=tris,
                              suggestedScale=ped["suggested_scale"]))
    build['meta'].update(walkSpeed=round(speed, 3), walkStride=round(dist.length, 3),
                         clips={"Idle": round(181 / 30, 4), "Walk": round(dur, 4)},
                         bones=[b.name for b in arm.data.bones])

with open(os.path.join(args.work, "pedestrians_build.json"), "w") as f:
    json.dump(build, f, indent=1)
with open(os.path.join(args.work, "ped_pose_check.json"), "w") as f:
    json.dump(pose_check, f)
rb.log("done")
