"""Shared scaffolding for the service-floor exhibits.

An exhibit script does:
    G, m = begin()
    ... build equipment on the platform, call station(...) for every stop ...
    finish(G, "electrical")
Run:  blender -b --factory-startup -P tools/blender/ex_<id>.py -- [--preview] [--nobake] [--fast] [--still]
"""
import sys, os, json, math
from fastlib import *
import kit, eq, building as B, gallery as GA

_state = {}


def begin():
    reset_scene()
    m = eq.emats(kit.mats())
    G = Geo()
    GA.gallery(G, m)
    _state["n_shell_markers"] = len(G.markers)
    _state["shots"] = []
    return G, m


def spin(axis, speed):
    """Spin property for a pivot group, expressed in three.js axes: [x, y, z, rad/s]."""
    v = {"x": (1, 0, 0), "y": (0, 0, -1), "z": (0, 1, 0)}[axis]
    return [v[0], v[1], v[2], speed]


def flow(G, id, pts, speed=2.0, color="#27a8ee", count=None, size=0.18):
    """A path that the engine animates with moving light pulses (power, water, data...)."""
    flat = []
    for p in pts:
        w = G.world(p)
        flat += [round(w.x, 3), round(w.z, 3), round(-w.y, 3)]
    G.marker("flow", id, pts[0], pts=flat, speed=speed, color=color, count=count or max(3, int(len(pts) * 1.5)), size=size)


def station(G, id, hs, cam=None, target=None, stand=None, fov=50):
    """One guided stop: hotspot on the component, a camera shot from the visitor aisle, and the guide's
    stand on the camera's right-hand side (the engine mirrors it for right-to-left layouts)."""
    # The aisle camera looks towards -Y, so screen-right is -X: the guide stands on the platform at -X.
    x = hs[0]
    cam = cam or (x + 1.25, 11.4, 1.62)
    target = target or (x - 0.3, hs[1] - 0.3, max(1.0, min(1.5, hs[2] * 0.85)))
    stand = stand or (x - 0.85, 8.3, 0.12)
    G.hotspot(id, hs)
    G.shot(id, cam, target, fov=fov)
    G.stand(id, stand, cam)
    _state["shots"].append((id, cam, target, fov, stand))


def overview(G, cam=(-8.0, 11.9, 2.15), target=(4.0, 6.6, 1.15), stand=(-5.75, 9.4, 0), fov=58):
    G.shot("overview", cam, target, fov=fov)
    G.stand("overview", stand, cam)
    _state["overview"] = (cam, target, fov, stand)


def _dummy(pos):
    """Human-sized stand-in used only in preview renders to judge framing against the guide."""
    import bmesh
    me = bpy.data.meshes.new("dummy")
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.2, radius2=0.17, depth=1.45)
    bmesh.ops.translate(bm, verts=bm.verts[:], vec=(0, 0, 0.725))
    r = bmesh.ops.create_uvsphere(bm, u_segments=10, v_segments=6, radius=0.12)
    bmesh.ops.translate(bm, verts=r["verts"], vec=(0, 0, 1.6))
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("dummy", me)
    ob.location = pos
    me.materials.append(M("dummy", "#d6e023", rough=0.8))
    bpy.context.scene.collection.objects.link(ob)
    return ob


def finish(G, floor_id, glass=None):
    name = f"ex_{floor_id}"
    objs = G.finish()
    SKY = json.load(open(os.path.join(WORK, "sky.json")))["sunset"]
    GA.gallery_lighting(SKY["rot_z"], os.path.join(DOWNLOADS, "hdri", "industrial_sunset_puresky_4k.hdr"))
    sc = bpy.context.scene
    mine = [o for o in sc.objects if o.type == "MESH" and not o.get("shell")]
    shell_marker_names = {f"{mk['kind']}:{mk['id']}" for mk in G.markers[: _state["n_shell_markers"]]}
    empties = [o for o in sc.objects if o.type == "EMPTY" and o.name not in shell_marker_names]

    if arg("--preview"):
        dummies = []
        ov = _state.get("overview")
        shots = ([("overview",) + ov] if ov else []) + _state["shots"]
        for sid, cam, tgt, fov, stand in shots:
            d = _dummy(stand)
            render_preview(f"{name}_{sid}", cam, tgt, fov=fov, res=(800, 450), samples=24)
            bpy.data.objects.remove(d)
    if arg("--still") and _state.get("overview"):
        cam, tgt, fov, _ = _state["overview"]
        render_still(f"floor-{floor_id}", cam, tgt, fov=fov, res=(1280, 880), samples=128)
    if not arg("--nobake"):
        bake_vertex(samples=32 if arg("--fast") else 160, all_objs=mine)
        export_glb(name, mine + empties)
    return objs
