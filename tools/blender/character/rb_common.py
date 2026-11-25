"""Shared helpers for building web-ready characters from Microsoft Rocketbox avatars (Blender 5.x, headless).

Everything here works on data only (no UI context besides mode switches) and is used by
build_engineer.py and build_pedestrians.py.
"""
import bpy
import math
import os
import numpy as np
from mathutils import Matrix, Vector, Quaternion

# ----------------------------------------------------------------------------------------------
# Skeleton mapping: Rocketbox "Bip01" (3ds Max Biped) -> three.js friendly Mixamo-style names
# (no spaces: three.js GLTFLoader would otherwise rewrite "Bip01 R UpperArm" to "Bip01_R_UpperArm").
# ----------------------------------------------------------------------------------------------
_FINGERS = {"0": "Thumb", "1": "Index", "2": "Middle", "3": "Ring", "4": "Pinky"}


def _side_map(s, side):
    m = {
        f"Bip01 {s} Clavicle": f"{side}Shoulder",
        f"Bip01 {s} UpperArm": f"{side}Arm",
        f"Bip01 {s} Forearm": f"{side}ForeArm",
        f"Bip01 {s} Hand": f"{side}Hand",
        f"Bip01 {s} Thigh": f"{side}UpLeg",
        f"Bip01 {s} Calf": f"{side}Leg",
        f"Bip01 {s} Foot": f"{side}Foot",
        f"Bip01 {s} Toe0": f"{side}ToeBase",
    }
    for d, fname in _FINGERS.items():
        m[f"Bip01 {s} Finger{d}"] = f"{side}Hand{fname}1"
        m[f"Bip01 {s} Finger{d}1"] = f"{side}Hand{fname}2"
        m[f"Bip01 {s} Finger{d}2"] = f"{side}Hand{fname}3"
    return m


BONE_MAP = {
    "Bip01 Pelvis": "Hips",
    "Bip01 Spine": "Spine",
    "Bip01 Spine1": "Spine1",
    "Bip01 Spine2": "Spine2",
    "Bip01 Neck": "Neck",
    "Bip01 Head": "Head",
    "Bip01 MJaw": "Jaw",
}
BONE_MAP.update(_side_map("L", "Left"))
BONE_MAP.update(_side_map("R", "Right"))

# Rocketbox exports thighs as children of Spine and clavicles as children of Neck.  That is a trap
# for procedural layers (a head look-at that turns Neck would swing both arms), so re-parent to the
# conventional humanoid hierarchy.  Keys/values are Rocketbox names.
REPARENT = {
    "Bip01 L Thigh": "Bip01 Pelvis",
    "Bip01 R Thigh": "Bip01 Pelvis",
    "Bip01 L Clavicle": "Bip01 Spine2",
    "Bip01 R Clavicle": "Bip01 Spine2",
}
# Facial bones below the jaw are folded into the jaw, every other facial bone into the head.
JAW_CHILDREN = ["Bip01 MBottomLip", "Bip01 MTongue", "Bip01 LMouthBottom", "Bip01 RMouthBottom"]
ROOT = "Bip01 Pelvis"
SRC_HIPS_HEIGHT = 0.895185  # standing hips height (m) of the skeleton in the Rocketbox m_* animation files
# Bones that never receive animation (kept at rest pose).
UNANIMATED = {"Bip01 MJaw"}


def log(*a):
    print("[rb]", *a, flush=True)


def ensure_object_mode():
    if bpy.context.object and bpy.context.object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')


def select_only(objs, active=None):
    ensure_object_mode()
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = active or objs[0]


def rot_only(m):
    """4x4 with the scale stripped from the rotation part (translation kept)."""
    loc, rot, _ = m.decompose()
    return Matrix.Translation(loc) @ rot.to_matrix().to_4x4()


# ----------------------------------------------------------------------------------------------
# Avatar import / normalisation
# ----------------------------------------------------------------------------------------------
def import_avatar(fbx_path, target_height=None, scale=None, target_hips=None):
    """Import a Rocketbox avatar FBX and normalise it: identity object transforms, metres, feet on
    z=0, facing -Y (Blender front == glTF +Z).  Returns (armature, mesh, info).

    info['X'] is the world transform that was applied to the source data (uniform scale + drop to
    ground) and info['bind'] the original (un-normalised) world rest matrices of every bone, which
    is what animation sampled from the Rocketbox animation FBX files has to be related to.
    """
    before = set(bpy.data.objects)
    bpy.ops.wm.fbx_import(filepath=fbx_path)
    new = [o for o in bpy.data.objects if o not in before]
    arm = next(o for o in new if o.type == 'ARMATURE')
    meshes = [o for o in new if o.type == 'MESH']
    # Rocketbox FBX files may hold several LODs; keep the highest-poly skinned mesh.
    meshes.sort(key=lambda o: -len(o.data.polygons))
    mesh = meshes[0]
    for o in new:
        if o not in (arm, mesh):
            bpy.data.objects.remove(o, do_unlink=True)
    arm.animation_data_clear()
    while mesh.data.color_attributes:  # unused vertex colours would be exported as COLOR_n
        mesh.data.color_attributes.remove(mesh.data.color_attributes[0])
    for a in list(bpy.data.actions):
        bpy.data.actions.remove(a)
    bpy.context.view_layer.update()

    mw = mesh.matrix_world.copy()
    mesh.parent = None
    mesh.matrix_world = mw
    zs = [(mw @ v.co).z for v in mesh.data.vertices]
    minz, maxz = min(zs), max(zs)
    bind = {b.name: arm.matrix_world @ b.matrix_local for b in arm.data.bones}
    if scale is None:
        if target_hips:  # normalise leg length instead of stature (lets characters share clips)
            scale = target_hips / (bind[ROOT].to_translation().z - minz)
        else:
            scale = (target_height / (maxz - minz)) if target_height else 1.0
    X = Matrix.Scale(scale, 4) @ Matrix.Translation((0, 0, -minz))
    mesh.matrix_world = X @ mw
    arm.matrix_world = X @ arm.matrix_world
    bpy.context.view_layer.update()
    select_only([arm, mesh], arm)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    mesh.parent = arm
    mesh.matrix_parent_inverse = Matrix.Identity(4)
    bpy.context.view_layer.update()
    info = dict(X=X, scale=scale, minz=minz, src_height=maxz - minz, bind=bind)
    log(f"avatar {os.path.basename(fbx_path)}: source height {maxz - minz:.4f} m, scale {scale:.4f}, "
        f"tris {sum(len(p.vertices) - 2 for p in mesh.data.polygons)}, bones {len(arm.data.bones)}")
    return arm, mesh, info


def merge_vertex_groups(mesh, src_names, dst_name):
    vg = mesh.vertex_groups
    if dst_name not in vg:
        vg.new(name=dst_name)
    dst = vg[dst_name]
    src_idx = {vg[n].index for n in src_names if n in vg}
    if not src_idx:
        return
    for v in mesh.data.vertices:
        add = sum(g.weight for g in v.groups if g.group in src_idx)
        if add > 0:
            dst.add([v.index], add, 'ADD')
    for n in src_names:
        if n in vg:
            vg.remove(vg[n])


def fix_unweighted(mesh):
    """A few Rocketbox vertices are skinned to the Biped root node only (which becomes the armature
    object, not a bone).  Give them the averaged weights of their edge-connected neighbours so the
    glTF exporter does not have to invent a 'neutral_bone'."""
    me = mesh.data
    vg = mesh.vertex_groups
    un = {v.index for v in me.vertices if sum(g.weight for g in v.groups) < 1e-4}
    if not un:
        return 0
    nbrs = {i: set() for i in un}
    for e in me.edges:
        a, b = e.vertices
        if a in un:
            nbrs[a].add(b)
        if b in un:
            nbrs[b].add(a)
    for i in un:
        src = [j for j in nbrs[i] if j not in un]
        if not src:  # isolated: fall back to the nearest weighted vertex
            co = me.vertices[i].co
            src = [min((v for v in me.vertices if v.index not in un), key=lambda v: (v.co - co).length_squared).index]
        acc = {}
        for j in src:
            for g in me.vertices[j].groups:
                acc[g.group] = acc.get(g.group, 0.0) + g.weight / len(src)
        for gi, w in acc.items():
            vg[gi].add([i], w, 'REPLACE')
    log(f"re-weighted {len(un)} root-only vertices from their neighbours")
    return len(un)


def limit_and_normalise_weights(mesh, limit=4):
    vg = mesh.vertex_groups
    for v in mesh.data.vertices:
        gs = sorted(((g.weight, g.group) for g in v.groups), reverse=True)
        keep = [g for g in gs[:limit] if g[0] > 1e-4]
        for w, gi in gs:
            if (w, gi) not in keep:
                vg[gi].remove([v.index])
        tot = sum(w for w, _ in keep)
        if tot <= 0:
            continue
        for w, gi in keep:
            vg[gi].add([v.index], w / tot, 'REPLACE')


def drop_material_faces(mesh, keyword):
    """Delete faces whose material name contains keyword (e.g. Rocketbox 'opacity' eyelash cards)."""
    import bmesh
    idx = [i for i, m in enumerate(mesh.data.materials) if m and keyword in m.name]
    if not idx:
        return 0
    bm = bmesh.new()
    bm.from_mesh(mesh.data)
    faces = [f for f in bm.faces if f.material_index in idx]
    n = len(faces)
    bmesh.ops.delete(bm, geom=faces, context='FACES')
    bm.to_mesh(mesh.data)
    bm.free()
    for i in sorted(idx, reverse=True):
        mesh.data.materials.pop(index=i)
    return n


def armature_modifier(mesh, arm):
    for m in list(mesh.modifiers):
        if m.type == 'ARMATURE':
            mesh.modifiers.remove(m)
    m = mesh.modifiers.new("Armature", 'ARMATURE')
    m.object = arm
    return m


def bake_pose_into_mesh(arm, mesh, rot, bones):
    """Pose only `bones` with rot[bone] (basis quaternions), apply the armature deformation to the
    mesh and reset the pose - i.e. make that pose the new rest shape for those bones."""
    reset_pose(arm)
    for b in bones:
        if b in rot and b in arm.pose.bones:
            arm.pose.bones[b].rotation_quaternion = rot[b]
    bpy.context.view_layer.update()
    select_only([mesh], mesh)
    for m in [m for m in mesh.modifiers if m.type == 'ARMATURE']:
        bpy.ops.object.modifier_apply(modifier=m.name)
    reset_pose(arm)
    armature_modifier(mesh, arm)
    bpy.context.view_layer.update()


def fold_bones(arm, mesh, mapping):
    """mapping {bone_to_remove: bone_that_takes_its_weights}; removes the bones."""
    by_dst = {}
    for src, dst in mapping.items():
        if src in arm.data.bones:
            by_dst.setdefault(dst, []).append(src)
    for dst, srcs in by_dst.items():
        merge_vertex_groups(mesh, srcs, dst)
    limit_and_normalise_weights(mesh, 4)
    select_only([arm], arm)
    bpy.ops.object.mode_set(mode='EDIT')
    eb = arm.data.edit_bones
    for src in mapping:
        if src in eb:
            eb.remove(eb[src])
    bpy.ops.object.mode_set(mode='OBJECT')


def decimate(mesh, arm, max_tris):
    tris = sum(len(p.vertices) - 2 for p in mesh.data.polygons)
    if tris <= max_tris:
        return tris
    for m in list(mesh.modifiers):
        if m.type == 'ARMATURE':
            mesh.modifiers.remove(m)
    d = mesh.modifiers.new("Decimate", 'DECIMATE')
    d.decimate_type = 'COLLAPSE'
    d.ratio = (max_tris - 20) / tris
    d.use_collapse_triangulate = True
    select_only([mesh], mesh)
    bpy.ops.object.modifier_apply(modifier=d.name)
    armature_modifier(mesh, arm)
    limit_and_normalise_weights(mesh, 4)
    return sum(len(p.vertices) - 2 for p in mesh.data.polygons)


def rebuild_skeleton(arm, mesh, info):
    """Fold facial bones into Head/Jaw, re-parent to a conventional hierarchy, re-orient every bone
    so that local +Y runs along the bone (toward its child) and rename to Mixamo-style names.

    Returns corr: {rocketbox_bone_name: 4x4 C} with new_rest_world = old_rest_world @ C.  The same
    constant offset is applied to sampled animation (pose_world_new = pose_world_old @ C).
    """
    bones = arm.data.bones
    keep = set(BONE_MAP)
    facial = [b.name for b in bones if b.name not in keep]
    jaw_kids = [n for n in facial if n in JAW_CHILDREN]
    head_kids = [n for n in facial if n not in JAW_CHILDREN]
    merge_vertex_groups(mesh, jaw_kids, "Bip01 MJaw")
    merge_vertex_groups(mesh, head_kids, "Bip01 Head")
    fix_unweighted(mesh)
    limit_and_normalise_weights(mesh, 4)

    # Which local axis points to the child?  (3ds Max Biped: +X or -X.)
    child_of = {}
    for b in bones:
        if b.name in keep and b.parent and b.parent.name in keep:
            # primary child: prefer the chain continuation (not fingers of a hand / legs of pelvis)
            child_of.setdefault(b.parent.name, []).append(b.name)
    primary = {
        "Bip01 Pelvis": "Bip01 Spine", "Bip01 Spine": "Bip01 Spine1", "Bip01 Spine2": "Bip01 Neck",
        "Bip01 Neck": "Bip01 Head", "Bip01 L Hand": "Bip01 L Finger2", "Bip01 R Hand": "Bip01 R Finger2",
    }
    corr = {}
    lengths = {}
    report = []
    for b in bones:
        if b.name not in keep:
            continue
        kids = child_of.get(b.name, [])
        child = primary.get(b.name) or (kids[0] if kids else None)
        if child and child in bones:
            d = b.matrix_local.inverted() @ bones[child].head_local
            lengths[b.name] = d.length
            dn = d.normalized()
            ax = max(range(3), key=lambda i: abs(dn[i]))
            sign = 1 if dn[ax] > 0 else -1
            report.append((b.name, child, "+-"[sign < 0] + "xyz"[ax], round(abs(dn[ax]), 4)))
            if ax == 0:
                # new Y = +-old X, Z unchanged (keeps the Biped hinge axis on local Z)
                corr[b.name] = Matrix.Rotation(math.radians(-90 * sign), 4, 'Z')
            elif ax == 1:
                corr[b.name] = Matrix.Identity(4) if sign > 0 else Matrix.Rotation(math.pi, 4, 'Z')
            else:
                corr[b.name] = Matrix.Rotation(math.radians(-90 * sign), 4, 'X')
    for b in bones:  # leaves inherit the parent's correction
        if b.name in keep and b.name not in corr:
            p = b.parent
            while p and p.name not in corr:
                p = p.parent
            corr[b.name] = corr[p.name].copy() if p else Matrix.Identity(4)
            lengths[b.name] = max(0.02, 0.6 * lengths.get(b.parent.name, 0.05)) if b.parent else 0.05
    info['child_axis_report'] = report

    select_only([arm], arm)
    bpy.ops.object.mode_set(mode='EDIT')
    eb = arm.data.edit_bones
    for n in facial:
        eb.remove(eb[n])
    for e in eb:
        e.use_connect = False
    for c, p in REPARENT.items():
        eb[c].parent = eb[p]
    for e in eb:
        m = e.matrix @ corr[e.name]
        e.matrix = m
        e.length = max(lengths[e.name], 0.01)
        e.matrix = m  # length changes keep head/orientation; re-assert to be safe
    bpy.ops.object.mode_set(mode='OBJECT')
    for old, new in BONE_MAP.items():
        if old in arm.data.bones:
            arm.data.bones[old].name = new
    # vertex groups follow bone renames automatically when the mesh has an Armature modifier, but
    # make sure (the mesh was re-parented by hand).
    for old, new in BONE_MAP.items():
        if old in mesh.vertex_groups:
            mesh.vertex_groups[old].name = new
    missing = [g.name for g in mesh.vertex_groups if g.name not in arm.data.bones]
    if missing:
        log("WARNING vertex groups without bone:", missing)
        for n in missing:
            mesh.vertex_groups.remove(mesh.vertex_groups[n])
    for pb in arm.pose.bones:
        pb.rotation_mode = 'QUATERNION'
    return corr


# ----------------------------------------------------------------------------------------------
# Animation sampling / retargeting
# ----------------------------------------------------------------------------------------------
def sample_animation(fbx_path):
    """Import a Rocketbox animation FBX (skeleton only) and return
    (frames, {rocketbox_bone: [world 4x4 per frame]}, fps).  The imported data is removed again."""
    before_o = set(bpy.data.objects)
    before_a = set(bpy.data.actions)
    before_arm = set(bpy.data.armatures)
    bpy.ops.wm.fbx_import(filepath=fbx_path)
    new = [o for o in bpy.data.objects if o not in before_o]
    src = next(o for o in new if o.type == 'ARMATURE')
    acts = [a for a in bpy.data.actions if a not in before_a]
    f0 = int(round(min(a.frame_range[0] for a in acts)))
    f1 = int(round(max(a.frame_range[1] for a in acts)))
    sc = bpy.context.scene
    fps = sc.render.fps
    names = [n for n in BONE_MAP if n in src.pose.bones]
    out = {n: [] for n in names}
    for f in range(f0, f1 + 1):
        sc.frame_set(f)
        mw = src.matrix_world
        for n in names:
            out[n].append(mw @ src.pose.bones[n].matrix)
    for o in new:
        bpy.data.objects.remove(o, do_unlink=True)
    for a in acts:
        bpy.data.actions.remove(a)
    for ad in [a for a in bpy.data.armatures if a not in before_arm]:
        bpy.data.armatures.remove(ad)
    sc.frame_set(0)
    return list(range(f0, f1 + 1)), out, fps


def retarget(arm, info, corr, world):
    """World-space retarget of sampled Rocketbox animation onto the rebuilt armature.

    Returns dict(rot={new_bone: [Quaternion basis per frame]}, loc=[Vector hips basis location per
    frame], hips_world=[Vector]).  Rotations only for every bone except the hips (the two skeletons
    share proportions; rest offsets are kept so limbs never stretch)."""
    X = info['X']
    inv = {v: k for k, v in BONE_MAP.items()}
    n = len(next(iter(world.values())))
    rest = {b.name: b.matrix_local.copy() for b in arm.data.bones}  # armature space == world
    # hips translation is scaled by the leg-length ratio target/source (source = Rocketbox male
    # animation skeleton, hips SRC_HIPS_HEIGHT above the ground)
    k_hips = rest[BONE_MAP[ROOT]].to_translation().z / SRC_HIPS_HEIGHT
    parent = {b.name: (b.parent.name if b.parent else None) for b in arm.data.bones}
    order = [b.name for b in arm.data.bones]  # parents first
    rot = {}
    loc = []
    hips_world = []
    pose = {}
    for name in order:
        old = inv[name]
        if old not in world or old in UNANIMATED:
            continue
        C = corr[old]
        pose[name] = [rot_only(X @ m) @ C for m in world[old]]
    hips = BONE_MAP[ROOT]
    for name in order:
        if name not in pose:
            continue
        p = parent[name]
        qs = []
        if p is None or p not in pose:
            rinv = rest[name].inverted()
            for i in range(n):
                b = rinv @ pose[name][i]
                qs.append(b.to_quaternion())
                if name == hips:
                    hw = world[ROOT][i].to_translation() * k_hips
                    loc.append(rinv @ hw)
                    hips_world.append(hw)
        else:
            rl_inv = (rest[p].inverted() @ rest[name]).to_quaternion().inverted()
            for i in range(n):
                lq = (pose[p][i].inverted() @ pose[name][i]).to_quaternion()
                qs.append(rl_inv @ lq)
        rot[name] = make_continuous([q.normalized() for q in qs])
    return dict(rot=rot, loc=loc, hips_world=hips_world, n=n)


def translation_drift_report(arm, info, corr, world):
    """How much do bone-local translations vary in the source (under the NEW parenting)?  Small
    numbers mean rotation-only retargeting loses nothing."""
    X = info['X']
    inv = {v: k for k, v in BONE_MAP.items()}
    res = []
    for b in arm.data.bones:
        if not b.parent:
            continue
        o, po = inv[b.name], inv[b.parent.name]
        if o not in world or po not in world:
            continue
        ts = [(rot_only(X @ pm).inverted() @ rot_only(X @ m)).to_translation() for pm, m in zip(world[po], world[o])]
        rest_t = (b.parent.matrix_local @ corr[po].inverted()).inverted() @ (b.matrix_local @ corr[o].inverted())
        rest_t = rest_t.to_translation()
        dev = max((t - rest_t).length for t in ts)
        var = max((t - ts[0]).length for t in ts)
        res.append((dev, var, b.name))
    res.sort(reverse=True)
    return res


def make_continuous(qs):
    out = [qs[0].copy()]
    for q in qs[1:]:
        q = q.copy()
        if out[-1].dot(q) < 0:
            q.negate()
        out.append(q)
    return out


def quat_angle(a, b):
    """Angle (radians, 0..pi) between two unit quaternions regardless of hemisphere."""
    return 2 * math.acos(min(1.0, abs(a.dot(b))))


def pose_distance(rot, i, j, weights=None):
    """Largest local rotation difference (radians) between frames i and j."""
    worst = 0.0
    for name, qs in rot.items():
        a = quat_angle(qs[i], qs[j])
        w = 1.0 if weights is None else weights.get(name, 1.0)
        worst = max(worst, a * w)
    return worst


def take_window(clip, start, length, fade, circular=True):
    """Cut frames [start, start+length] out of a clip and make them loop seamlessly by cross-fading
    the last `fade` frames into the frames that precede `start` (wrapping around when the source
    clip itself is a loop).  Output has length+1 samples; sample[length] == sample[0]."""
    n = clip['n']
    L = n - 1  # source loop length (last == first when circular)

    def idx(i):
        return i % L if circular else max(0, min(n - 1, i))

    out_rot = {k: [] for k in clip['rot']}
    out_loc = []
    for i in range(length + 1):
        a = idx(start + i)
        b = idx(start + i - length)
        t = 0.0
        if fade > 0 and i > length - fade:
            t = (i - (length - fade)) / fade
            t = t * t * (3 - 2 * t)
        for k, qs in clip['rot'].items():
            out_rot[k].append(qs[a].slerp(qs[b], t) if t > 0 else qs[a].copy())
        if clip['loc']:
            out_loc.append(clip['loc'][a].lerp(clip['loc'][b], t))
    for k in out_rot:
        out_rot[k] = make_continuous(out_rot[k])
        out_rot[k][-1] = out_rot[k][0].copy() if out_rot[k][-1].dot(out_rot[k][0]) > 0 else -out_rot[k][0]
    if out_loc:
        out_loc[-1] = out_loc[0].copy()
    return dict(rot=out_rot, loc=out_loc, n=length + 1)


def close_loop(clip):
    """Force sample[-1] == sample[0] for a clip that is already cyclic (spreads the tiny residual)."""
    n = clip['n']
    for k, qs in clip['rot'].items():
        d = qs[-1].rotation_difference(qs[0])
        for i in range(n):
            t = i / (n - 1)
            qs[i] = (Quaternion().slerp(d, t) @ qs[i]).normalized() if d.angle > 1e-6 else qs[i]
        clip['rot'][k] = make_continuous(qs)
        clip['rot'][k][-1] = clip['rot'][k][0].copy() if clip['rot'][k][-1].dot(clip['rot'][k][0]) > 0 else -clip['rot'][k][0]
    if clip['loc']:
        d = clip['loc'][0] - clip['loc'][-1]
        for i in range(n):
            clip['loc'][i] = clip['loc'][i] + d * (i / (n - 1))
    return clip


def write_action(arm, name, clip, fps=30, loc_bone="Hips"):
    """Create a (slotted) Action called `name` holding the clip, 1 key per frame starting at 0."""
    act = bpy.data.actions.new(name)
    slot = act.slots.new(id_type='OBJECT', name=arm.name)
    layer = act.layers.new("Layer")
    strip = layer.strips.new(type='KEYFRAME')
    cb = strip.channelbag(slot, ensure=True)
    n = clip['n']
    frames = np.arange(n, dtype=np.float32)

    def add(path, index, values, group):
        fc = cb.fcurves.new(path, index=index, group_name=group)
        fc.keyframe_points.add(n)
        co = np.empty(n * 2, dtype=np.float32)
        co[0::2] = frames
        co[1::2] = values
        fc.keyframe_points.foreach_set("co", co)
        fc.keyframe_points.foreach_set("interpolation", np.full(n, 1, dtype=np.int32))  # LINEAR
        fc.update()

    for bone, qs in clip['rot'].items():
        path = f'pose.bones["{bone}"].rotation_quaternion'
        arr = np.array([[q.w, q.x, q.y, q.z] for q in qs], dtype=np.float32)
        for i in range(4):
            add(path, i, arr[:, i], bone)
    if clip['loc']:
        path = f'pose.bones["{loc_bone}"].location'
        arr = np.array([[v.x, v.y, v.z] for v in clip['loc']], dtype=np.float32)
        for i in range(3):
            add(path, i, arr[:, i], loc_bone)
    act.use_fake_user = True
    act.use_frame_range = True
    act.frame_start = 0
    act.frame_end = n - 1
    return act, slot


def assign_action(arm, act):
    ad = arm.animation_data or arm.animation_data_create()
    ad.action = act
    if act is not None:
        ad.action_slot = act.slots[0]


def push_nla(arm, actions):
    """One NLA track per action (track name == clip name) for the glTF exporter (NLA_TRACKS mode)."""
    ad = arm.animation_data or arm.animation_data_create()
    ad.action = None
    for t in list(ad.nla_tracks):
        ad.nla_tracks.remove(t)
    for act in actions:
        tr = ad.nla_tracks.new()
        tr.name = act.name
        st = tr.strips.new(act.name, 0, act)
        st.action_slot = act.slots[0]
        st.action_frame_start = 0
        st.action_frame_end = act.frame_end
        st.frame_start = 0
        st.frame_end = act.frame_end
        tr.mute = True


def reset_pose(arm):
    for pb in arm.pose.bones:
        pb.location = (0, 0, 0)
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.scale = (1, 1, 1)


# ----------------------------------------------------------------------------------------------
# Textures (numpy; rows are bottom-up like UV space)
# ----------------------------------------------------------------------------------------------
def load_pixels(path):
    img = bpy.data.images.load(path, check_existing=False)
    w, h = img.size
    a = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(a)
    bpy.data.images.remove(img)
    return a.reshape(h, w, 4)


def save_pixels(arr, path, name=None):
    h, w = arr.shape[:2]
    rgba = np.ones((h, w, 4), dtype=np.float32)
    rgba[..., :arr.shape[2]] = arr
    img = bpy.data.images.new(name or os.path.splitext(os.path.basename(path))[0], w, h, alpha=False)
    img.pixels.foreach_set(np.clip(rgba, 0, 1).ravel())
    img.filepath_raw = path
    img.file_format = 'PNG'
    img.save()
    return img


def box_downscale(arr, factor):
    h, w, c = arr.shape
    return arr.reshape(h // factor, factor, w // factor, factor, c).mean(axis=(1, 3))


def rgb_to_hsv(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = rgb.max(axis=-1)
    mn = rgb.min(axis=-1)
    d = mx - mn
    h = np.zeros_like(mx)
    m = d > 1e-8
    rc = np.where(m, (mx - r) / np.where(m, d, 1), 0)
    gc = np.where(m, (mx - g) / np.where(m, d, 1), 0)
    bc = np.where(m, (mx - b) / np.where(m, d, 1), 0)
    h = np.where(mx == r, bc - gc, np.where(mx == g, 2.0 + rc - bc, 4.0 + gc - rc))
    h = (h / 6.0) % 1.0
    h = np.where(m, h, 0)
    s = np.where(mx > 1e-8, d / np.where(mx > 1e-8, mx, 1), 0)
    return np.stack([h, s, mx], axis=-1)


def hsv_to_rgb(hsv):
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    i = np.floor(h * 6.0)
    f = h * 6.0 - i
    p = v * (1 - s)
    q = v * (1 - s * f)
    t = v * (1 - s * (1 - f))
    i = i.astype(np.int32) % 6
    r = np.choose(i, [v, q, p, p, t, v])
    g = np.choose(i, [t, v, v, q, p, p])
    b = np.choose(i, [p, p, t, v, v, q])
    return np.stack([r, g, b], axis=-1)


def smooth_mask(x, lo, hi):
    t = np.clip((x - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def hue_band(h, centre, half_width, soft):
    """1 inside centre+-half_width (degrees), fading to 0 over `soft` degrees."""
    d = np.abs(((h * 360 - centre + 180) % 360) - 180)
    return 1 - smooth_mask(d, half_width, half_width + soft)


def sample_bilinear(img, u, v):
    """img: (h, w, c) bottom-up; u, v in [0, 1] arrays."""
    h, w = img.shape[:2]
    x = np.clip(u * w - 0.5, 0, w - 1)
    y = np.clip(v * h - 0.5, 0, h - 1)
    x0 = np.floor(x).astype(np.int32)
    y0 = np.floor(y).astype(np.int32)
    x1 = np.minimum(x0 + 1, w - 1)
    y1 = np.minimum(y0 + 1, h - 1)
    fx = (x - x0)[..., None]
    fy = (y - y0)[..., None]
    return (img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x1] * fx * (1 - fy)
            + img[y1, x0] * (1 - fx) * fy + img[y1, x1] * fx * fy)


def project_decal(tex, mesh, material_index, decal, centre, width, view_dir, margin_px=1.5,
                  shade=True, max_depth=None, opacity=1.0, facing_min=0.15):
    """Planar-project `decal` (RGBA, straight alpha, bottom-up rows) onto the mesh surface and paint
    it into the base-colour texture `tex` through the UV map.

    centre: world position of the decal centre; width: decal width in metres; view_dir: unit vector
    pointing from the viewer toward the surface (e.g. (0,-1,0) when looking at the back of an avatar
    that faces -Y).  The decal reads correctly (not mirrored) for that viewer.  Works across UV
    islands and is independent of how the island is rotated in the texture."""
    H, W = tex.shape[:2]
    dh, dw = decal.shape[:2]
    height = width * dh / dw
    view = Vector(view_dir).normalized()
    up = Vector((0, 0, 1))
    right = view.cross(up).normalized()
    up = right.cross(view).normalized()
    c = Vector(centre)
    pre = decal.copy()
    pre[..., :3] *= pre[..., 3:4]
    me = mesh.data
    uvl = me.uv_layers.active.data
    me.calc_loop_triangles()
    painted = 0
    orig = tex.copy()  # always composite over the untouched texture so overlapping margins are idempotent
    covered = np.zeros((H, W), dtype=bool)
    ref_lum = None
    for tri in me.loop_triangles:
        if tri.material_index != material_index:
            continue
        if Vector(tri.normal).dot(view) > -facing_min:
            continue
        ps = [me.vertices[i].co for i in tri.vertices]
        rel = [p - c for p in ps]
        us = [r.dot(right) / width + 0.5 for r in rel]
        vs = [r.dot(up) / height + 0.5 for r in rel]
        ds = [r.dot(view) for r in rel]
        if max(us) < 0 or min(us) > 1 or max(vs) < 0 or min(vs) > 1:
            continue
        if max_depth is not None and min(abs(d) for d in ds) > max_depth:
            continue
        uv = [uvl[l].uv for l in tri.loops]
        px = np.array([[t.x * W - 0.5, t.y * H - 0.5] for t in uv])
        x0 = int(max(0, math.floor(px[:, 0].min() - margin_px)))
        x1 = int(min(W - 1, math.ceil(px[:, 0].max() + margin_px)))
        y0 = int(max(0, math.floor(px[:, 1].min() - margin_px)))
        y1 = int(min(H - 1, math.ceil(px[:, 1].max() + margin_px)))
        if x1 < x0 or y1 < y0:
            continue
        gx, gy = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1))
        a, b, cc = px
        den = (b[1] - cc[1]) * (a[0] - cc[0]) + (cc[0] - b[0]) * (a[1] - cc[1])
        if abs(den) < 1e-9:
            continue
        w0 = ((b[1] - cc[1]) * (gx - cc[0]) + (cc[0] - b[0]) * (gy - cc[1])) / den
        w1 = ((cc[1] - a[1]) * (gx - cc[0]) + (a[0] - cc[0]) * (gy - cc[1])) / den
        w2 = 1 - w0 - w1
        # signed distance (px) to each edge ~ barycentric * triangle height
        e = [np.linalg.norm(b - cc), np.linalg.norm(cc - a), np.linalg.norm(a - b)]
        hgt = [abs(den) / max(x, 1e-9) for x in e]
        inside = (w0 * hgt[0] > -margin_px) & (w1 * hgt[1] > -margin_px) & (w2 * hgt[2] > -margin_px)
        strict = (w0 >= 0) & (w1 >= 0) & (w2 >= 0)
        inside &= strict | ~covered[y0:y1 + 1, x0:x1 + 1]
        if not inside.any():
            continue
        du = w0 * us[0] + w1 * us[1] + w2 * us[2]
        dv = w0 * vs[0] + w1 * vs[1] + w2 * vs[2]
        inside &= (du >= 0) & (du <= 1) & (dv >= 0) & (dv <= 1)
        if not inside.any():
            continue
        smp = sample_bilinear(pre, du[inside], dv[inside])
        region = tex[y0:y1 + 1, x0:x1 + 1]
        dst = orig[y0:y1 + 1, x0:x1 + 1][inside][:, :3]
        rgb = smp[:, :3]
        alpha = smp[:, 3:4] * opacity
        if shade:
            lum = dst @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
            if ref_lum is None:
                ref_lum = float(np.percentile(lum, 80)) or 1.0
            k = np.clip(lum / ref_lum, 0.55, 1.08)[:, None]
            rgb = rgb * k
        out = rgb * opacity + dst * (1 - alpha)
        tmp = region[inside]
        tmp[:, :3] = out
        region[inside] = tmp
        covered[y0:y1 + 1, x0:x1 + 1] |= strict & inside
        painted += int(inside.sum())
    return painted


def make_material(name, image, roughness=0.8, double_sided=False, alpha_clip=False):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = image
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0.0
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    mat.use_backface_culling = not double_sided
    return mat


# ----------------------------------------------------------------------------------------------
# Preview rendering
# ----------------------------------------------------------------------------------------------
def setup_studio(res=(600, 800), samples=32):
    sc = bpy.context.scene
    for eng in ('BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT'):
        try:
            sc.render.engine = eng
            break
        except TypeError:
            continue
    try:
        sc.eevee.taa_render_samples = samples
    except Exception:
        pass
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = 'PNG'
    try:
        sc.view_settings.view_transform = 'Standard'
    except Exception:
        pass
    world = bpy.data.worlds.new("PreviewWorld")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.45, 0.45, 0.45, 1)
    bg.inputs[1].default_value = 1.0
    sc.world = world
    # ground
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
    ground = bpy.context.object
    ground.name = "PreviewGround"
    gm = bpy.data.materials.new("PreviewGroundMat")
    gm.use_nodes = True
    gm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.42, 0.42, 0.42, 1)
    gm.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.9
    ground.data.materials.append(gm)
    sun_d = bpy.data.lights.new("PreviewSun", 'SUN')
    sun_d.energy = 2.5
    sun_d.angle = math.radians(8)
    sun = bpy.data.objects.new("PreviewSun", sun_d)
    sc.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(50), 0, math.radians(-30))
    cam_d = bpy.data.cameras.new("PreviewCam")
    cam_d.lens = 70
    cam = bpy.data.objects.new("PreviewCam", cam_d)
    sc.collection.objects.link(cam)
    sc.camera = cam
    return dict(cam=cam, sun=sun, ground=ground)


def render_view(studio, path, azimuth_deg, target=(0, 0, 0.9), distance=5.2, elevation_deg=6, sun_follow=True):
    """azimuth 0 = camera in front of an avatar that faces -Y; 180 = behind."""
    sc = bpy.context.scene
    az = math.radians(azimuth_deg)
    el = math.radians(elevation_deg)
    t = Vector(target)
    pos = t + Vector((math.sin(az) * math.cos(el) * distance, -math.cos(az) * math.cos(el) * distance, math.sin(el) * distance))
    cam = studio['cam']
    cam.location = pos
    cam.rotation_euler = (t - pos).to_track_quat('-Z', 'Y').to_euler()
    if sun_follow:
        studio['sun'].rotation_euler = (math.radians(50), 0, az + math.radians(-35))
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
