"""Re-import a final (meshopt + WebP) GLB into a fresh Blender and render stills, to prove that skin,
textures and animation survived compression.

  blender -b --factory-startup -P verify_glb.py -- file.glb outDir prefix [Clip frame]...
With no clip arguments the bind pose is rendered (front + back).
"""
import bpy
import sys
import os
import math

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rb_common as rb  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:]
glb, out_dir, prefix = argv[0], argv[1], argv[2]
pairs = [(argv[i], int(argv[i + 1])) for i in range(3, len(argv) - 1, 2)]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.fps = 30  # before import so glTF seconds map to 30 fps frames
bpy.ops.import_scene.gltf(filepath=glb)
sc = bpy.context.scene
sc.render.fps = 30
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
rb.log("armature", arm.name, "loc", tuple(round(v, 5) for v in arm.location),
       "rot", tuple(round(math.degrees(v), 3) for v in arm.rotation_euler) if arm.rotation_mode != 'QUATERNION' else tuple(round(v, 5) for v in arm.rotation_quaternion),
       "scale", tuple(round(v, 5) for v in arm.scale), "bones", len(arm.data.bones))
for m in meshes:
    zs = [(m.matrix_world @ v.co).z for v in m.data.vertices]
    ys = [(m.matrix_world @ v.co).y for v in m.data.vertices]
    rb.log("mesh", m.name, "tris", sum(len(p.vertices) - 2 for p in m.data.polygons), "z range %.3f..%.3f" % (min(zs), max(zs)),
           "materials", [(s.material.name, [n.image.size[:] for n in s.material.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image]) for s in m.material_slots])
rb.log("actions", [(a.name, tuple(a.frame_range)) for a in bpy.data.actions])
studio = rb.setup_studio()
if not pairs:
    if arm.animation_data:
        arm.animation_data.action = None
    rb.reset_pose(arm)
    rb.render_view(studio, os.path.join(out_dir, f"{prefix}_front.png"), 20, target=(0, 0, 0.92))
    rb.render_view(studio, os.path.join(out_dir, f"{prefix}_back.png"), 180, target=(0, 0, 0.92))
for clip, frame in pairs:
    act = next(a for a in bpy.data.actions if a.name == clip or a.name.startswith(clip))
    ad = arm.animation_data or arm.animation_data_create()
    for t in ad.nla_tracks:
        t.mute = True
    ad.action = act
    ad.action_slot = act.slots[0]
    sc.frame_set(frame)
    rb.render_view(studio, os.path.join(out_dir, f"{prefix}_{clip.lower()}_f{frame:03d}.png"), 60, target=(0, 0, 0.92))
rb.log("verify done")
