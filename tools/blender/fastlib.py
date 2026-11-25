"""fastlib — procedural scene authoring, light baking and glTF export for the FAST Tower site.

Run scene scripts headless:  blender -b --factory-startup -P tools/blender/<scene>.py -- [--preview] [--nobake]

Conventions
- Blender units are metres, Z up. Export is glTF Y-up, so Blender (x, y, z) becomes three.js (x, z, -y).
- Geometry is accumulated into buckets keyed by (group, material) and written as one mesh per bucket,
  which keeps runtime draw calls low. A group can have a pivot (it then exports as its own node,
  so the engine can rotate / move it) and a bake mode:
    'lm'   lighting baked to a shared lightmap texture (large architectural surfaces)
    'vc'   lighting baked to vertex colours (props, equipment)
    'none' not baked (emissive, glass, dynamic parts lit at runtime)
- Baked lighting is stored as sqrt(value / RANGE) so 8 bits survive; the engine squares it again.
"""
import bpy, bmesh, math, os, sys, json, time
from contextlib import contextmanager
from mathutils import Vector, Matrix, Euler
import numpy as np

RANGE = 4.0
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT_MODELS = os.path.join(REPO, "public", "models")
OUT_TEX = os.path.join(REPO, "public", "tex")
WORK = os.path.abspath(os.path.join(REPO, "..", "_work"))
PREVIEWS = os.path.abspath(os.path.join(REPO, "..", "_previews"))
DOWNLOADS = os.path.abspath(os.path.join(REPO, "..", "_downloads"))
for _d in (OUT_MODELS, OUT_TEX, WORK, PREVIEWS):
    os.makedirs(_d, exist_ok=True)

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def arg(flag):
    return flag in ARGS


def log(*a):
    print("[fast]", *a, flush=True)


# ----------------------------------------------------------------------------- scene setup
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = "METRIC"
    sc.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    try:
        prefs.compute_device_type = "OPTIX"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = d.type == "OPTIX"
        sc.cycles.device = "GPU"
    except Exception as e:  # CPU fallback
        log("GPU unavailable:", e)
    sc.cycles.samples = 64
    sc.cycles.use_denoising = True
    try:
        sc.cycles.denoiser = "OPTIX"
    except Exception:
        pass
    sc.cycles.max_bounces = 6
    sc.cycles.diffuse_bounces = 4
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    try:
        sc.view_settings.view_transform = "AgX"
        sc.view_settings.look = "AgX - Medium High Contrast"
    except Exception:
        pass
    return sc


def hexc(h, a=1.0):
    """sRGB hex -> linear RGBA tuple."""
    h = h.lstrip("#")
    rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return (lin[0], lin[1], lin[2], a)


def _col(c):
    if isinstance(c, str):
        return hexc(c)
    if len(c) == 3:
        return (c[0], c[1], c[2], 1.0)
    return tuple(c)


# ----------------------------------------------------------------------------- materials
MATS = {}


def M(name, color="#cccccc", rough=0.6, metal=0.0, emit=0.0, emit_color=None, alpha=1.0,
      kind="", tex=None, tile=1.0, transmission=0.0, ior=1.45, **extras):
    """Create (or fetch) a Principled material. `kind`, `tex` and extras are exported as glTF extras.

    kind: '' opaque baked | 'glass' | 'emit' | 'water' | 'screen' | 'sign' | 'dyn' (runtime lit)
    tex:  name of a shared tiling texture in public/tex (applied by the engine); `tile` = metres per repeat.
    """
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    c = _col(color)
    bsdf.inputs["Base Color"].default_value = c
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["IOR"].default_value = ior
    if emit > 0:
        bsdf.inputs["Emission Color"].default_value = _col(emit_color or color)
        bsdf.inputs["Emission Strength"].default_value = emit
    if transmission > 0:
        bsdf.inputs["Transmission Weight"].default_value = transmission
    if alpha < 1:
        bsdf.inputs["Alpha"].default_value = alpha
        try:
            m.surface_render_method = "BLENDED"
        except Exception:
            pass
    if tex:
        path = os.path.join(OUT_TEX, tex + ".webp")
        if not os.path.exists(path):
            path = os.path.join(OUT_TEX, tex + ".jpg")
        if os.path.exists(path):
            img = bpy.data.images.load(path, check_existing=True)
            tn = nt.nodes.new("ShaderNodeTexImage")
            tn.image = img
            mix = nt.nodes.new("ShaderNodeMixRGB")
            mix.blend_type = "MULTIPLY"
            mix.inputs[0].default_value = 1.0
            mix.inputs[1].default_value = c
            nt.links.new(tn.outputs["Color"], mix.inputs[2])
            nt.links.new(mix.outputs["Color"], bsdf.inputs["Base Color"])
        m["tex"] = tex
    if kind == "sign" and extras.get("sign") == "logo":
        lp = os.path.join(REPO, "public", "brand", "fast-logo-white.png")
        if os.path.exists(lp):
            img = bpy.data.images.load(lp, check_existing=True)
            tn = nt.nodes.new("ShaderNodeTexImage")
            tn.image = img
            tn.extension = "CLIP"
            nt.links.new(tn.outputs["Color"], bsdf.inputs["Emission Color"])
            nt.links.new(tn.outputs["Alpha"], bsdf.inputs["Alpha"])
            bsdf.inputs["Base Color"].default_value = (0, 0, 0, 1)
            try:
                m.surface_render_method = "DITHERED"
            except Exception:
                pass
    m["kind"] = kind
    m["rough"] = rough
    m["metal"] = metal
    if emit > 0:
        m["emit"] = emit
    for k, v in extras.items():
        m[k] = v
    m.diffuse_color = c
    MATS[name] = m
    m["_tile"] = tile
    return m


# ----------------------------------------------------------------------------- geometry builder
class Geo:
    def __init__(self):
        self.buckets = {}      # (group, matname) -> dict(v=[], f=[], uv=[])
        self.groups = {"static": dict(pivot=None, bake="vc", parent=None, props={})}
        self.stack = [Matrix.Identity(4)]
        self.cur_group = "static"
        self.markers = []
        self.objects = []

    # --- transform / grouping context
    @contextmanager
    def at(self, pos=(0, 0, 0), rz=0.0, rx=0.0, ry=0.0, s=1.0):
        m = Matrix.Translation(Vector(pos)) @ Euler((math.radians(rx), math.radians(ry), math.radians(rz)), "XYZ").to_matrix().to_4x4()
        if s != 1.0:
            m = m @ Matrix.Scale(s, 4)
        self.stack.append(self.stack[-1] @ m)
        try:
            yield
        finally:
            self.stack.pop()

    @contextmanager
    def group(self, name, bake="vc", pivot=None, parent=None, **props):
        """Everything added inside goes into `name`. pivot (in current local space) makes it a movable node."""
        if name not in self.groups:
            wp = None
            if pivot is not None:
                wp = self.stack[-1] @ Vector(pivot)
            self.groups[name] = dict(pivot=wp, bake=bake, parent=parent, props=props)
        prev = self.cur_group
        self.cur_group = name
        try:
            yield
        finally:
            self.cur_group = prev

    @property
    def mtx(self):
        return self.stack[-1]

    def world(self, p):
        return self.stack[-1] @ Vector(p)

    # --- low level append
    def _bucket(self, mat):
        key = (self.cur_group, mat.name)
        b = self.buckets.get(key)
        if b is None:
            b = dict(v=[], f=[], uv=[], mat=mat)
            self.buckets[key] = b
        return b

    def add_bm(self, bm, mat, local=None, tile=None, uv=True, maxseg=None):
        """Append a bmesh (in primitive-local space) transformed by local @ stack."""
        if maxseg:
            _grid_cut(bm, maxseg)
        b = self._bucket(mat)
        Mx = self.stack[-1] @ (local if local is not None else Matrix.Identity(4))
        tile = tile or mat.get("_tile", 1.0)
        base = len(b["v"])
        bm.verts.index_update()
        scale = Mx.to_scale()
        sc = (abs(scale.x) + abs(scale.y) + abs(scale.z)) / 3.0
        for v in bm.verts:
            b["v"].append(tuple(Mx @ v.co))
        flip = Mx.determinant() < 0
        for f in bm.faces:
            idx = [base + v.index for v in f.verts]
            n = f.normal
            ax, ay, az = abs(n.x), abs(n.y), abs(n.z)
            if az >= ax and az >= ay:
                uvs = [(v.co.x * sc / tile, v.co.y * sc / tile) for v in f.verts]
            elif ax >= ay:
                uvs = [(v.co.y * sc / tile, v.co.z * sc / tile) for v in f.verts]
            else:
                uvs = [(v.co.x * sc / tile, v.co.z * sc / tile) for v in f.verts]
            if flip:
                idx.reverse()
                uvs.reverse()
            b["f"].append(idx)
            b["uv"].append(uvs)
        bm.free()

    def add_raw(self, mat, verts, faces, uvs=None):
        """verts in current local space; faces = index lists; uvs per face-corner or None."""
        b = self._bucket(mat)
        Mx = self.stack[-1]
        base = len(b["v"])
        for v in verts:
            b["v"].append(tuple(Mx @ Vector(v)))
        flip = Mx.determinant() < 0
        for i, f in enumerate(faces):
            idx = [base + j for j in f]
            u = list(uvs[i]) if uvs else [(0.0, 0.0)] * len(f)
            if flip:
                idx.reverse()
                u.reverse()
            b["f"].append(idx)
            b["uv"].append(u)

    # --- primitives (all centred on `at` unless noted)
    def box(self, mat, size, at=(0, 0, 0), rot=(0, 0, 0), bevel=0.0, tile=None, maxseg=None, base=False):
        """Axis-aligned box. base=True puts `at` at the bottom-centre instead of the centre."""
        sx, sy, sz = size
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts:
            v.co.x *= sx
            v.co.y *= sy
            v.co.z *= sz
        bv = min(bevel, 0.45 * min(sx, sy, sz))
        if bv > 0:
            bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bv, offset_type="OFFSET", segments=1, profile=0.5, affect="EDGES")
        p = Vector(at)
        if base:
            p = p + Vector((0, 0, sz / 2))
        L = Matrix.Translation(p) @ Euler([math.radians(a) for a in rot], "XYZ").to_matrix().to_4x4()
        self.add_bm(bm, mat, L, tile, maxseg=maxseg)

    def cyl(self, mat, r, h, at=(0, 0, 0), rot=(0, 0, 0), seg=24, r2=None, cap=True, base=False, axis="z", tile=None):
        """Cylinder / cone along local Z (or axis 'x' / 'y')."""
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=cap, cap_tris=False, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=h)
        p = Vector(at)
        R = Euler([math.radians(a) for a in rot], "XYZ").to_matrix().to_4x4()
        if axis == "x":
            R = R @ Euler((0, math.radians(90), 0)).to_matrix().to_4x4()
        elif axis == "y":
            R = R @ Euler((math.radians(-90), 0, 0)).to_matrix().to_4x4()
        if base:
            L = Matrix.Translation(p) @ R @ Matrix.Translation((0, 0, h / 2))
        else:
            L = Matrix.Translation(p) @ R
        self.add_bm(bm, mat, L, tile)

    def sphere(self, mat, r, at=(0, 0, 0), seg=20, rings=12, scale=(1, 1, 1)):
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=r)
        L = Matrix.Translation(Vector(at)) @ Matrix.Diagonal((scale[0], scale[1], scale[2], 1))
        self.add_bm(bm, mat, L)

    def plane(self, mat, size, at=(0, 0, 0), rot=(0, 0, 0), sub=(1, 1), tile=None, uvfit=False):
        """Flat quad grid in local XY facing +Z. uvfit maps UV 0..1 across the plane (for signs/screens)."""
        sx, sy = size
        nx, ny = sub
        verts, faces, uvs = [], [], []
        t = tile
        for j in range(ny + 1):
            for i in range(nx + 1):
                verts.append((-sx / 2 + sx * i / nx, -sy / 2 + sy * j / ny, 0))
        for j in range(ny):
            for i in range(nx):
                a = j * (nx + 1) + i
                faces.append([a, a + 1, a + nx + 2, a + nx + 1])
        L = Matrix.Translation(Vector(at)) @ Euler([math.radians(a) for a in rot], "XYZ").to_matrix().to_4x4()
        tl = t or mat.get("_tile", 1.0)
        for f in faces:
            if uvfit:
                uvs.append([((verts[k][0] + sx / 2) / sx, (verts[k][1] + sy / 2) / sy) for k in f])
            else:
                uvs.append([(verts[k][0] / tl, verts[k][1] / tl) for k in f])
        self.stack.append(self.stack[-1] @ L)
        self.add_raw(mat, verts, faces, uvs)
        self.stack.pop()

    def extrude(self, mat, outline, h, at=(0, 0, 0), rot=(0, 0, 0), bevel=0.0, tile=None, maxseg=None):
        """Extrude a 2D outline (list of (x, y), CCW) upward by h from z=0."""
        bm = bmesh.new()
        vs = [bm.verts.new((x, y, 0)) for x, y in outline]
        f = bm.faces.new(vs)
        r = bmesh.ops.extrude_face_region(bm, geom=[f])
        bmesh.ops.translate(bm, verts=[e for e in r["geom"] if isinstance(e, bmesh.types.BMVert)], vec=(0, 0, h))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        if bevel > 0:
            bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bevel, offset_type="OFFSET", segments=1, profile=0.5, affect="EDGES")
        L = Matrix.Translation(Vector(at)) @ Euler([math.radians(a) for a in rot], "XYZ").to_matrix().to_4x4()
        self.add_bm(bm, mat, L, tile, maxseg=maxseg)

    def lathe(self, mat, profile, at=(0, 0, 0), rot=(0, 0, 0), seg=24, axis="z"):
        """Revolve a profile [(r, z), ...] around Z. Open ends are left open unless r == 0."""
        verts, faces = [], []
        n = len(profile)
        for i in range(seg):
            a = 2 * math.pi * i / seg
            ca, sa = math.cos(a), math.sin(a)
            for r, z in profile:
                verts.append((r * ca, r * sa, z))
        for i in range(seg):
            i2 = (i + 1) % seg
            for k in range(n - 1):
                a, b = i * n + k, i2 * n + k
                faces.append([a, b, b + 1, a + 1])
        R = Euler([math.radians(a) for a in rot], "XYZ").to_matrix().to_4x4()
        if axis == "x":
            R = R @ Euler((0, math.radians(90), 0)).to_matrix().to_4x4()
        elif axis == "y":
            R = R @ Euler((math.radians(-90), 0, 0)).to_matrix().to_4x4()
        bm = bmesh.new()
        bv = [bm.verts.new(v) for v in verts]
        for f in faces:
            try:
                bm.faces.new([bv[i] for i in f])
            except ValueError:
                pass
        bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        self.add_bm(bm, mat, Matrix.Translation(Vector(at)) @ R)

    def tube(self, mat, pts, r, seg=12, bend=None, cap=True, tile=None):
        """Round pipe through polyline `pts` with filleted corners (bend radius default 1.6 r)."""
        P = [Vector(p) for p in pts]
        bend = bend if bend is not None else 1.6 * r
        path = [P[0]]
        for i in range(1, len(P) - 1):
            a, b, c = P[i - 1], P[i], P[i + 1]
            d1, d2 = (a - b), (c - b)
            l1, l2 = d1.length, d2.length
            if l1 < 1e-6 or l2 < 1e-6:
                continue
            d1 /= l1
            d2 /= l2
            ang = d1.angle(d2)
            if ang > math.pi - 1e-3 or bend <= 0:
                path.append(b)
                continue
            t = min(bend / math.tan(ang / 2), l1 * 0.49, l2 * 0.49)
            rr = t * math.tan(ang / 2)
            p1, p2 = b + d1 * t, b + d2 * t
            bis = (d1 + d2).normalized()
            centre = b + bis * (rr / math.sin(ang / 2))
            steps = max(3, int((math.pi - ang) / math.radians(15)))
            v1, v2 = p1 - centre, p2 - centre
            for k in range(steps + 1):
                # mathutils slerp returns a unit vector: restore the fillet radius
                path.append(centre + v1.slerp(v2, k / steps).normalized() * rr)
        path.append(P[-1])
        # parallel transport frames
        tang = []
        for i in range(len(path)):
            if i == 0:
                t = path[1] - path[0]
            elif i == len(path) - 1:
                t = path[-1] - path[-2]
            else:
                t = path[i + 1] - path[i - 1]
            tang.append(t.normalized())
        up = Vector((0, 0, 1)) if abs(tang[0].z) < 0.9 else Vector((1, 0, 0))
        n = tang[0].cross(up).normalized()
        verts, faces, uvs = [], [], []
        dist = 0.0
        tl = tile or mat.get("_tile", 1.0)
        ringd = []
        for i, c in enumerate(path):
            if i > 0:
                q = tang[i - 1].rotation_difference(tang[i])
                n = (q @ n).normalized()
                dist += (path[i] - path[i - 1]).length
            bn = tang[i].cross(n).normalized()
            ringd.append(dist)
            for k in range(seg):
                a = 2 * math.pi * k / seg
                verts.append(tuple(c + (n * math.cos(a) + bn * math.sin(a)) * r))
        for i in range(len(path) - 1):
            for k in range(seg):
                k2 = (k + 1) % seg
                a, b = i * seg + k, i * seg + k2
                faces.append([a, b, b + seg, a + seg])
                u0, u1 = k / seg * (2 * math.pi * r) / tl, (k + 1) / seg * (2 * math.pi * r) / tl
                uvs.append([(u0, ringd[i] / tl), (u1, ringd[i] / tl), (u1, ringd[i + 1] / tl), (u0, ringd[i + 1] / tl)])
        if cap:
            m = len(path) - 1
            faces.append(list(range(seg - 1, -1, -1)))
            uvs.append([(0, 0)] * seg)
            faces.append([m * seg + k for k in range(seg)])
            uvs.append([(0, 0)] * seg)
        self.add_raw(mat, verts, faces, uvs)

    def ibeam(self, mat, length, h=0.3, w=0.15, tf=0.012, tw=0.008, at=(0, 0, 0), rot=(0, 0, 0)):
        """I-section along local X, centred."""
        hw, hh = w / 2, h / 2
        o = [(-hw, -hh), (hw, -hh), (hw, -hh + tf), (tw / 2, -hh + tf), (tw / 2, hh - tf), (hw, hh - tf),
             (hw, hh), (-hw, hh), (-hw, hh - tf), (-tw / 2, hh - tf), (-tw / 2, -hh + tf), (-hw, -hh + tf)]
        L = Matrix.Translation(Vector(at)) @ Euler([math.radians(a) for a in rot], "XYZ").to_matrix().to_4x4() \
            @ Euler((math.radians(90), 0, math.radians(90))).to_matrix().to_4x4() @ Matrix.Translation((0, 0, -length / 2))
        self.stack.append(self.stack[-1] @ L)
        self.extrude(mat, o, length)
        self.stack.pop()

    # --- markers: hotspots, camera shots, guide stands (exported as empties with extras)
    def marker(self, kind, id, pos, target=None, **props):
        wp = self.world(pos)
        d = dict(kind=kind, id=id, pos=wp, props=dict(props))
        if target is not None:
            wt = self.world(target)
            d["props"]["target"] = [round(wt.x, 3), round(wt.z, 3), round(-wt.y, 3)]
        self.markers.append(d)
        return wp

    def hotspot(self, id, pos, **props):
        return self.marker("hs", id, pos, **props)

    def shot(self, id, pos, target, fov=45, **props):
        return self.marker("cam", id, pos, target=target, fov=fov, **props)

    def stand(self, id, pos, target, **props):
        return self.marker("stand", id, pos, target=target, **props)

    # --- finish: create Blender objects
    def finish(self, collection=None, smooth_angle=38):
        coll = collection or bpy.context.scene.collection
        empties = {}
        for gname, g in self.groups.items():
            if g["pivot"] is not None:
                e = bpy.data.objects.new(gname, None)
                e.location = g["pivot"]
                coll.objects.link(e)
                empties[gname] = e
                for k, v in g["props"].items():
                    e[k] = v
        for gname, g in self.groups.items():
            if g["parent"] and gname in empties and g["parent"] in empties:
                e, p = empties[gname], empties[g["parent"]]
                e.parent = p
                e.location = g["pivot"] - self.groups[g["parent"]]["pivot"]
        out = []
        for (gname, mname), b in self.buckets.items():
            if not b["v"]:
                continue
            g = self.groups[gname]
            me = bpy.data.meshes.new(f"{gname}.{mname}")
            piv = g["pivot"]
            verts = b["v"]
            if piv is not None:
                verts = [(v[0] - piv.x, v[1] - piv.y, v[2] - piv.z) for v in verts]
            me.from_pydata(verts, [], b["f"])
            uvl = me.uv_layers.new(name="uv")
            flat = [c for face in b["uv"] for uv in face for c in uv]
            uvl.data.foreach_set("uv", flat)
            me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
            me.update()
            try:
                me.set_sharp_from_angle(angle=math.radians(smooth_angle))
            except Exception:
                pass
            me.materials.append(b["mat"])
            ob = bpy.data.objects.new(f"{gname}.{mname}", me)
            coll.objects.link(ob)
            if piv is not None:
                ob.parent = empties[gname]
            ob["bake"] = g["bake"] if b["mat"].get("kind", "") in ("", "sign") else "none"
            ob["group"] = gname
            ob["lm"] = g["props"].get("lm", "")
            for k, v in g["props"].items():
                if k not in ("lm",):
                    ob[k] = v
            out.append(ob)
        for mk in self.markers:
            e = bpy.data.objects.new(f"{mk['kind']}:{mk['id']}", None)
            e.empty_display_size = 0.2
            e.location = mk["pos"]
            coll.objects.link(e)
            e["kind"] = mk["kind"]
            e["id"] = mk["id"]
            for k, v in mk["props"].items():
                e[k] = v
        self.objects = out
        bpy.context.view_layer.update()
        ntri = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in out)
        log(f"built {len(out)} meshes, {ntri} tris, {len(self.markers)} markers")
        return out


def _grid_cut(bm, maxseg):
    """Slice a bmesh with axis-aligned planes every `maxseg` metres (gives vertex bakes more samples)."""
    if not bm.verts:
        return
    xs = [v.co for v in bm.verts]
    for ax in range(3):
        lo = min(c[ax] for c in xs)
        hi = max(c[ax] for c in xs)
        n = int((hi - lo) / maxseg)
        if n < 1:
            continue
        step = (hi - lo) / (n + 1)
        no = Vector((0, 0, 0))
        no[ax] = 1
        for i in range(1, n + 1):
            co = Vector((0, 0, 0))
            co[ax] = lo + step * i
            bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=co, plane_no=no, dist=1e-5)


# ----------------------------------------------------------------------------- world / lights
def set_world_hdri(path, strength=1.0, rot_z=0.0):
    sc = bpy.context.scene
    w = bpy.data.worlds.new("World")
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(path, check_existing=True)
    mp = nt.nodes.new("ShaderNodeMapping")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp.inputs["Rotation"].default_value = (0, 0, math.radians(rot_z))
    nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], env.inputs["Vector"])
    nt.links.new(env.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength
    return w


def set_world_color(color, strength=1.0):
    sc = bpy.context.scene
    w = bpy.data.worlds.new("World")
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = _col(color)
    bg.inputs["Strength"].default_value = strength
    return w


def add_sun(direction, strength=3.0, color=(1, 0.85, 0.7), angle=2.0):
    """direction = vector the light travels along."""
    l = bpy.data.lights.new("Sun", "SUN")
    l.energy = strength
    l.color = color[:3]
    l.angle = math.radians(angle)
    ob = bpy.data.objects.new("Sun", l)
    bpy.context.scene.collection.objects.link(ob)
    d = Vector(direction).normalized()
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return ob


def add_area(pos, size, power, color=(1, 1, 1), target=None, rot=None, shape="RECTANGLE"):
    l = bpy.data.lights.new("Area", "AREA")
    l.energy = power
    l.color = color[:3]
    l.shape = shape
    if isinstance(size, (tuple, list)):
        l.size, l.size_y = size
    else:
        l.size = size
        if shape == "RECTANGLE":
            l.size_y = size
    ob = bpy.data.objects.new("Area", l)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = pos
    if target is not None:
        d = (Vector(target) - Vector(pos)).normalized()
        ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    elif rot is not None:
        ob.rotation_euler = [math.radians(a) for a in rot]
    return ob


def add_point(pos, power, color=(1, 1, 1), radius=0.05):
    l = bpy.data.lights.new("Point", "POINT")
    l.energy = power
    l.color = color[:3]
    l.shadow_soft_size = radius
    ob = bpy.data.objects.new("Point", l)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = pos
    return ob


# ----------------------------------------------------------------------------- preview renders
def render_preview(name, pos, target, fov=45, res=(1280, 720), samples=48, exposure=0.0, film_transparent=False):
    sc = bpy.context.scene
    cam = bpy.data.cameras.new("PreviewCam")
    ob = bpy.data.objects.new("PreviewCam", cam)
    sc.collection.objects.link(ob)
    ob.location = pos
    d = (Vector(target) - Vector(pos)).normalized()
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    cam.sensor_fit = "VERTICAL"
    cam.angle_y = math.radians(fov)
    cam.clip_start = 0.05
    cam.clip_end = 2000
    sc.camera = ob
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.cycles.samples = samples
    sc.view_settings.exposure = exposure
    sc.render.film_transparent = film_transparent
    sc.render.image_settings.file_format = "JPEG"
    sc.render.image_settings.quality = 88
    path = os.path.join(PREVIEWS, name + ".jpg")
    sc.render.filepath = path
    t = time.time()
    bpy.ops.render.render(write_still=True)
    log(f"preview {name} {time.time() - t:.1f}s -> {path}")
    bpy.data.objects.remove(ob)
    return path


def render_env(name, pos, res=(1024, 512), samples=48, exposure=0.0):
    """Equirect panorama of the scene from `pos`, saved in three.js orientation as WORK/env_<name>.png.
    Used as the reflection map for interiors, so polished floors and steel reflect the actual room."""
    sc = bpy.context.scene
    cam = bpy.data.cameras.new("EnvCam")
    cam.type = "PANO"
    try:
        cam.panorama_type = "EQUIRECTANGULAR"
    except Exception:
        cam.cycles.panorama_type = "EQUIRECTANGULAR"
    ob = bpy.data.objects.new("EnvCam", cam)
    sc.collection.objects.link(ob)
    ob.location = pos
    ob.rotation_euler = (math.pi / 2, 0, 0)   # looking along +Y, Z up
    cam.clip_start = 0.02
    sc.camera = ob
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.cycles.samples = samples
    vt, look, ex = sc.view_settings.view_transform, sc.view_settings.look, sc.view_settings.exposure
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = exposure
    sc.render.image_settings.file_format = "PNG"
    tmp = os.path.join(WORK, f"_envraw_{name}.png")
    sc.render.filepath = tmp
    bpy.ops.render.render(write_still=True)
    sc.view_settings.view_transform, sc.view_settings.look, sc.view_settings.exposure = vt, look, ex
    bpy.data.objects.remove(ob)
    img = bpy.data.images.load(tmp)
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    px = np.roll(px.reshape(h, w, 4), -w // 4, axis=1)   # Blender pano -> three.js equirect convention
    out = bpy.data.images.new("envout", w, h, alpha=False)
    out.pixels.foreach_set(px.ravel())
    out.filepath_raw = os.path.join(WORK, f"env_{name}.png")
    out.file_format = "PNG"
    out.save()
    log("env", name)


def render_still(name, pos, target, fov=45, res=(1920, 1080), samples=128, exposure=0.0):
    """Higher quality still (poster / overview imagery) written to WORK/<name>.jpg."""
    p = render_preview(name, pos, target, fov=fov, res=res, samples=samples, exposure=exposure)
    dst = os.path.join(WORK, name + ".jpg")
    import shutil
    shutil.copyfile(p, dst)
    return dst


# ----------------------------------------------------------------------------- baking
def _clay_twin(mat, image=None):
    """Diffuse-only stand-in used while baking irradiance: keeps colour for bounce light, emission and glass."""
    name = mat.name + "__bake"
    tw = bpy.data.materials.get(name)
    if tw is None:
        tw = bpy.data.materials.new(name)
        tw.use_nodes = True
        nt = tw.node_tree
        nt.nodes.clear()
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        src = mat.node_tree.nodes.get("Principled BSDF")
        base = tuple(mat.diffuse_color)
        kind = mat.get("kind", "")
        emit = mat.get("emit", 0.0)
        if kind == "glass":
            tr = nt.nodes.new("ShaderNodeBsdfTransparent")
            tr.inputs["Color"].default_value = (0.82, 0.86, 0.9, 1)
            nt.links.new(tr.outputs[0], out.inputs["Surface"])
        elif emit and emit > 0:
            em = nt.nodes.new("ShaderNodeEmission")
            em.inputs["Color"].default_value = src.inputs["Emission Color"].default_value
            em.inputs["Strength"].default_value = emit
            nt.links.new(em.outputs[0], out.inputs["Surface"])
        else:
            df = nt.nodes.new("ShaderNodeBsdfDiffuse")
            # metals have no diffuse; give them a mid albedo so they still receive baked light
            c = base
            if mat.get("metal", 0) > 0.5:
                c = tuple(0.35 + 0.4 * x for x in base[:3]) + (1,)
            c = tuple(min(0.85, x) for x in c[:3]) + (1,)
            df.inputs["Color"].default_value = c
            nt.links.new(df.outputs[0], out.inputs["Surface"])
    if image is not None:
        nt = tw.node_tree
        tn = nt.nodes.get("BakeTarget") or nt.nodes.new("ShaderNodeTexImage")
        tn.name = "BakeTarget"
        tn.image = image
        for n in nt.nodes:
            n.select = False
        tn.select = True
        nt.nodes.active = tn
    return tw


def _swap_to_clay(objs, image=None):
    saved = []
    for o in objs:
        if o.type != "MESH":
            continue
        for slot in o.material_slots:
            if slot.material is None or slot.material.name.endswith("__bake"):
                continue
            saved.append((slot, slot.material))
            slot.material = _clay_twin(slot.material, image if o.get("bake") == "lm" else None)
    return saved


def _restore(saved):
    for slot, m in saved:
        slot.material = m


def _select(objs, active=None):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = active or objs[0]


def unwrap_lightmap(objs, margin=0.004, angle=66):
    """Second UV set ('lm') shared by all objs, packed into one 0..1 atlas."""
    for o in objs:
        me = o.data
        if "lm" not in me.uv_layers:
            me.uv_layers.new(name="lm")
        me.uv_layers.active = me.uv_layers["lm"]
    _select(objs)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(angle), island_margin=margin, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)
    bpy.ops.object.mode_set(mode="OBJECT")
    for o in objs:
        o.data.uv_layers.active = o.data.uv_layers["lm"]
        o.data.uv_layers["uv"].active_render = True


def _encode(arr):
    return np.sqrt(np.clip(arr / RANGE, 0.0, 1.0))


def bake_lightmap(name, size=2048, samples=96, margin=12, all_objs=None):
    """Bake diffuse irradiance for all objects flagged bake='lm' into public/tex/<name>.webp."""
    sc = bpy.context.scene
    objs = [o for o in (all_objs or sc.objects) if o.type == "MESH" and o.get("bake") == "lm" and o.get("lm", "") in ("", name)]
    if not objs:
        return None
    t0 = time.time()
    unwrap_lightmap(objs)
    img = bpy.data.images.new(name + "_f", size, size, alpha=False, float_buffer=True)
    img.colorspace_settings.name = "Non-Color"
    meshes = [o for o in sc.objects if o.type == "MESH"]
    saved = _swap_to_clay(meshes, img)
    sc.cycles.samples = samples
    sc.cycles.bake_type = "DIFFUSE"
    bk = sc.render.bake
    bk.use_pass_direct = True
    bk.use_pass_indirect = True
    bk.use_pass_color = False
    bk.target = "IMAGE_TEXTURES"
    bk.margin = margin
    try:
        bk.margin_type = "EXTEND"
    except Exception:
        pass
    bk.use_clear = True
    bk.use_selected_to_active = False
    _select(objs)
    bpy.ops.object.bake(type="DIFFUSE")
    _restore(saved)
    px = np.empty(size * size * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(size, size, 4)
    enc = _encode(px[:, :, :3])
    out = bpy.data.images.new(name + "_8", size, size, alpha=False, float_buffer=False)
    out.colorspace_settings.name = "Non-Color"
    o4 = np.ones((size, size, 4), dtype=np.float32)
    o4[:, :, :3] = enc
    out.pixels.foreach_set(o4.ravel())
    png = os.path.join(WORK, name + ".png")
    out.filepath_raw = png
    out.file_format = "PNG"
    out.save()
    log(f"lightmap {name} {size}px {time.time() - t0:.1f}s (mean {float(px[:, :, :3].mean()):.3f}, max {float(px[:, :, :3].max()):.2f})")
    return png


def bake_vertex(samples=128, all_objs=None, extra_subdiv=None):
    """Bake diffuse irradiance into the 'Col' corner colour attribute of all bake='vc' objects."""
    sc = bpy.context.scene
    objs = [o for o in (all_objs or sc.objects) if o.type == "MESH" and o.get("bake") == "vc"]
    if not objs:
        return
    t0 = time.time()
    for o in objs:
        me = o.data
        if "Col" not in me.color_attributes:
            me.color_attributes.new("Col", "FLOAT_COLOR", "CORNER")
        me.color_attributes.active_color = me.color_attributes["Col"]
        me.color_attributes.render_color_index = list(me.color_attributes.keys()).index("Col")
    meshes = [o for o in sc.objects if o.type == "MESH"]
    saved = _swap_to_clay(meshes, None)
    sc.cycles.samples = samples
    sc.cycles.bake_type = "DIFFUSE"
    bk = sc.render.bake
    bk.use_pass_direct = True
    bk.use_pass_indirect = True
    bk.use_pass_color = False
    bk.target = "VERTEX_COLORS"
    bk.use_selected_to_active = False
    _select(objs)
    bpy.ops.object.bake(type="DIFFUSE")
    _restore(saved)
    tot = 0
    for o in objs:
        me = o.data
        attr = me.color_attributes["Col"]
        n = len(attr.data)
        buf = np.empty(n * 4, dtype=np.float32)
        attr.data.foreach_get("color", buf)
        buf = buf.reshape(n, 4)
        buf[:, :3] = _encode(buf[:, :3])
        buf[:, 3] = 1.0
        attr.data.foreach_set("color", buf.ravel())
        tot += n
    log(f"vertex bake {len(objs)} objs, {tot} corners, {time.time() - t0:.1f}s")


# ----------------------------------------------------------------------------- export
def export_glb(name, objs=None, extra_empties=True):
    """Export selected content to WORK/<name>.raw.glb; tools/pack.mjs then optimises into public/models."""
    sc = bpy.context.scene
    bpy.ops.object.select_all(action="DESELECT")
    pool = objs if objs is not None else [o for o in sc.objects if o.type in ("MESH", "EMPTY")]
    for o in pool:
        if o.type == "MESH":
            me = o.data
            # vertex colour must be the active attribute to be exported
            if "Col" in me.color_attributes:
                me.color_attributes.active_color = me.color_attributes["Col"]
            if "lm" in me.uv_layers:
                me.uv_layers["uv"].active_render = True
        o.select_set(True)
    path = os.path.join(WORK, name + ".raw.glb")
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True, export_yup=True, export_apply=True,
        export_extras=True, export_texcoords=True, export_normals=True, export_materials="EXPORT",
        export_image_format="NONE", export_vertex_color="ACTIVE", export_all_vertex_colors=False,
        export_active_vertex_color_when_no_material=True, export_cameras=False, export_lights=False,
        export_animations=False, export_skins=False, export_morph=False,
    )
    log("exported", path, f"{os.path.getsize(path) / 1024:.0f} KB")
    return path


def save_blend(name):
    p = os.path.join(WORK, name + ".blend")
    bpy.ops.wm.save_as_mainfile(filepath=p, compress=True)
    return p
