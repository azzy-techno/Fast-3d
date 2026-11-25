"""Probe Rocketbox animation FBX files: root/pelvis/feet paths and loop closure. Usage: blender -b --factory-startup -P probe_anim.py -- a.fbx b.fbx ..."""
import bpy, sys, math
from mathutils import Vector
argv = sys.argv[sys.argv.index("--") + 1:]
for path in argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.wm.fbx_import(filepath=path)
    sc = bpy.context.scene
    arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    act = bpy.data.actions[0]
    f0, f1 = int(act.frame_range[0]), int(act.frame_range[1])
    print("#####", path.split('/')[-1], "frames", f0, f1, "fps", sc.render.fps, "objs", [(o.name, o.type, o.parent.name if o.parent else None) for o in bpy.data.objects])
    names = ['Bip01 Pelvis', 'Bip01 L Foot', 'Bip01 R Foot', 'Bip01 L Toe0', 'Bip01 R Toe0', 'Bip01 Head', 'Bip01 R Hand', 'Bip01 L Hand']
    rows = {}
    quats = {}
    for f in range(f0, f1 + 1):
        sc.frame_set(f)
        mw = arm.matrix_world
        rows[f] = {n: (mw @ arm.pose.bones[n].matrix).translation.copy() for n in names}
        rows[f]['OBJ'] = mw.translation.copy()
        h = bpy.data.objects.get('MotionExtractionHelper')
        if h: rows[f]['HELP'] = h.matrix_world.translation.copy()
        quats[f] = {pb.name: (mw @ pb.matrix).to_quaternion() for pb in arm.pose.bones}
    step = max(1, (f1 - f0) // 16)
    for f in list(range(f0, f1 + 1, step)) + [f1]:
        r = rows[f]
        print(f"f{f:4d} " + " ".join(f"{k.replace('Bip01 ','')}=({v.x:+.3f},{v.y:+.3f},{v.z:+.3f})" for k, v in r.items()))
    # loop closure
    mx = max((quats[f0][n].rotation_difference(quats[f1][n]).angle, n) for n in quats[f0])
    dp = (rows[f0]['Bip01 Pelvis'] - rows[f1]['Bip01 Pelvis'])
    print("loop closure: max bone world-rot diff first/last = %.2f deg (%s); pelvis delta = (%.3f,%.3f,%.3f)" % (math.degrees(mx[0]), mx[1], dp.x, dp.y, dp.z))
    # ranges
    for n in names:
        xs = [rows[f][n] for f in rows]
        print("  range", n, "x[%.3f,%.3f] y[%.3f,%.3f] z[%.3f,%.3f]" % (min(v.x for v in xs), max(v.x for v in xs), min(v.y for v in xs), max(v.y for v in xs), min(v.z for v in xs), max(v.z for v in xs)))
