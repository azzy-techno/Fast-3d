"""Inspect an FBX: objects, meshes, armature, actions. Usage: blender -b --factory-startup -P inspect_fbx.py -- file.fbx [legacy]"""
import bpy, sys
argv = sys.argv[sys.argv.index("--") + 1:]
path = argv[0]
legacy = len(argv) > 1 and argv[1] == "legacy"
bpy.ops.wm.read_factory_settings(use_empty=True)
if legacy:
    bpy.ops.import_scene.fbx(filepath=path, use_anim=True, ignore_leaf_bones=False, automatic_bone_orientation=False)
else:
    bpy.ops.wm.fbx_import(filepath=path)
print("=== OBJECTS")
for o in bpy.data.objects:
    extra = ""
    if o.type == 'MESH':
        me = o.data
        tris = sum(len(p.vertices) - 2 for p in me.polygons)
        extra = f" verts={len(me.vertices)} tris={tris} mats={[m.name if m else None for m in me.materials]} vgroups={len(o.vertex_groups)} mods={[m.type for m in o.modifiers]} uv={[u.name for u in me.uv_layers]}"
    print(o.type, repr(o.name), "parent=", o.parent.name if o.parent else None, "loc", tuple(round(v, 4) for v in o.location), "rot", tuple(round(v, 4) for v in o.rotation_euler), "scl", tuple(round(v, 4) for v in o.scale), "hide", o.hide_get() if o.name in bpy.context.view_layer.objects else '?', extra)
for arm in [o for o in bpy.data.objects if o.type == 'ARMATURE']:
    print("=== ARMATURE", arm.name, "bones", len(arm.data.bones))
    mw = arm.matrix_world
    for b in arm.data.bones:
        h = mw @ b.head_local; t = mw @ b.tail_local
        print(f"  {b.name!r} parent={b.parent.name if b.parent else None!r} head=({h.x:.3f},{h.y:.3f},{h.z:.3f}) tail=({t.x:.3f},{t.y:.3f},{t.z:.3f}) len={b.length:.3f} connect={b.use_connect}")
print("=== MATERIALS")
for m in bpy.data.materials:
    print(m.name, [ (n.type, getattr(n, 'image', None) and n.image.filepath) for n in (m.node_tree.nodes if m.node_tree else [])])
print("=== ACTIONS")
for a in bpy.data.actions:
    n = 0
    try:
        for layer in a.layers:
            for strip in layer.strips:
                for slot in a.slots:
                    cb = strip.channelbag(slot)
                    if cb: n += len(cb.fcurves)
    except Exception as e:
        print("err", e)
    print(a.name, "range", tuple(a.frame_range), "fcurves", n, "slots", [s.name_display for s in a.slots])
print("fps", bpy.context.scene.render.fps, "unit scale", bpy.context.scene.unit_settings.scale_length)
