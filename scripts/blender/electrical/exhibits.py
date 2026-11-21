"""Rebuild the sixteen exhibits in metres: blender -b -P scripts/blender/electrical/exhibits.py"""

import math
import subprocess
import tempfile
from pathlib import Path
import bpy
from mathutils import Vector

root = Path.cwd()
output = root / "public/assets/electrical/exhibits.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)
tmp = tempfile.TemporaryDirectory()
atlas = Path(tmp.name) / "instruments.png"
subprocess.run(
    ["python3", str(Path(__file__).with_name("faceplates.py")), str(atlas)], check=True
)

# Four shared surface finishes. Vertex colours keep differently painted parts in one draw.
paint, metal, rubber, lamp, print_face = range(5)
materials = []
for name, metallic, roughness in [
    ("Powder coat", 0.23, 0.42),
    ("Machined metal", 0.67, 0.34),
    ("Insulation", 0.02, 0.57),
    ("Opal diffuser", 0.03, 0.28),
    ("Printed fascia", 0.12, 0.42),
]:
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nodes = m.node_tree.nodes
    bs = nodes.get("Principled BSDF")
    bs.inputs["Metallic"].default_value = metallic
    bs.inputs["Roughness"].default_value = roughness
    if name == "Printed fascia":
        node = nodes.new("ShaderNodeTexImage")
        node.image = bpy.data.images.load(str(atlas))
    else:
        node = nodes.new("ShaderNodeVertexColor")
        node.layer_name = "Finish"
    m.node_tree.links.new(node.outputs["Color"], bs.inputs["Base Color"])
    if name == "Opal diffuser":
        bs.inputs["Emission Color"].default_value = (1, 0.9, 0.72, 1)
        bs.inputs["Emission Strength"].default_value = 0.65
    materials.append(m)

ivory, grey, iron, black = "e5e5da", "aab3ad", "465456", "293136"
steel, copper, brass, yellow = "adb7b8", "b87542", "c3a453", "e5af37"
red, blue, green = "aa493c", "496f95", "52836d"
phases = (red, yellow, blue)
verts, colors, faces, surface, uvfaces = [], [], [], [], {}


def vertex(p, color):
    x, y, z = p
    verts.append((x, -z, y))
    colors.append(color)
    return len(verts) - 1


def polygon(indices, material):
    faces.append(indices)
    surface.append(material)


def loft(rows, color, material):
    rings = [[vertex(v, color) for v in row] for row in rows]
    n = len(rings[0])
    polygon(rings[0][::-1], material)
    for a, b in zip(rings, rings[1:]):
        for i in range(n):
            j = (i + 1) % n
            polygon([a[i], a[j], b[j], b[i]], material)
    polygon(rings[-1], material)


def box(x, y, z, w, h, d, color=grey, material=paint):
    # Clipped corners and edge highlights survive downsampling on small screens.
    e = min(0.025, w * 0.13, h * 0.15, d * 0.13)
    rows = []
    for dy, shrink in [(-h / 2, e), (-h / 2 + e, 0), (h / 2 - e, 0), (h / 2, e)]:
        a, b = w / 2 - shrink, d / 2 - shrink
        rows.append(
            [
                (x + u, y + dy, z + v)
                for u, v in [
                    (-a + e, b),
                    (a - e, b),
                    (a, b - e),
                    (a, -b + e),
                    (a - e, -b),
                    (-a + e, -b),
                    (-a, -b + e),
                    (-a, b - e),
                ]
            ]
        )
    loft(rows, color, material)


def tube(a, b, r, color=steel, material=metal, r2=None, n=12):
    a, b = Vector(a), Vector(b)
    axis = (b - a).normalized()
    u = axis.cross(
        Vector((1, 0, 0)) if abs(axis.x) < 0.85 else Vector((0, 1, 0))
    ).normalized()
    v = axis.cross(u)
    circle = [
        u * math.cos(i * 2 * math.pi / n) + v * math.sin(i * 2 * math.pi / n)
        for i in range(n)
    ]
    loft(
        [
            [a + r * c for c in circle],
            [b + (r2 if r2 is not None else r) * c for c in circle],
        ],
        color,
        material,
    )


def wire(points, r=0.045, color=black, material=rubber):
    # Continuous bevelled cable through the intermediate knots.
    pts = [Vector(p) for p in points]
    smooth = [pts[0]]
    for i in range(1, len(pts) - 1):
        prev, mid, nxt = pts[i - 1 : i + 2]
        a = mid.lerp(prev, 0.2)
        b = mid.lerp(nxt, 0.2)
        for j in range(5):
            t = j / 4
            smooth.append((1 - t) ** 2 * a + 2 * t * (1 - t) * mid + t * t * b)
    smooth.append(pts[-1])
    rows = []
    normal = Vector((0, 1, 0))
    for i, p in enumerate(smooth):
        axis = (
            smooth[min(i + 1, len(smooth) - 1)] - smooth[max(i - 1, 0)]
        ).normalized()
        if abs(normal.dot(axis)) > 0.96:
            normal = Vector((1, 0, 0)) if abs(axis.x) < 0.9 else Vector((0, 0, 1))
        normal = (normal - axis * axis.dot(normal)).normalized()
        side = axis.cross(normal)
        rows.append(
            [
                p
                + r
                * (
                    normal * math.cos(k * math.pi / 4)
                    + side * math.sin(k * math.pi / 4)
                )
                for k in range(8)
            ]
        )
    loft(rows, color, material)


def plate(x, y, z, w, h, index):
    vs = [
        vertex((x + dx * w / 2, y + dy * h / 2, z), "ffffff")
        for dx, dy in [(-1, -1), (1, -1), (1, 1), (-1, 1)]
    ]
    u = index % 4 / 4
    v = 1 - (index // 4 + 1) / 4
    uvfaces[len(faces)] = [
        (u + a * 0.25, v + b * 0.25)
        for a, b in [(0.002, 0.002), (0.998, 0.002), (0.998, 0.998), (0.002, 0.998)]
    ]
    polygon(vs, print_face)


def export_part(name):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for m in materials:
        mesh.materials.append(m)
    attr = mesh.color_attributes.new(name="Finish", type="BYTE_COLOR", domain="POINT")
    palette = {
        c: tuple(int(c[i : i + 2], 16) / 255 for i in (0, 2, 4)) + (1,)
        for c in set(colors)
    }
    attr.data.foreach_set("color_srgb", [v for c in colors for v in palette[c]])
    if uvfaces:
        uv = mesh.uv_layers.new(name="Instrument UV")
    for poly, mat in zip(mesh.polygons, surface):
        poly.material_index = mat
        if poly.index in uvfaces:
            for j, coord in zip(poly.loop_indices, uvfaces[poly.index]):
                uv.data[j].uv = coord
    mesh.update()
    for arr in (verts, colors, faces, surface, uvfaces):
        arr.clear()


def contacts(x, y, z, count, spacing):
    for i in range(count):
        xx = x + i * spacing
        tube((xx, y, z), (xx, y, z + 0.09), 0.054, brass)
        tube((xx, y, z + 0.09), (xx, y, z + 0.11), 0.026, steel, n=6)


def mcb(x, y, z, width=0.22):
    box(x, y, z, width, 0.42, 0.20, ivory)
    box(x, y + 0.04, z + 0.12, width * 0.68, 0.15, 0.10, black, rubber)
    for yy in (y - 0.145, y + 0.15):
        tube((x, yy, z + 0.10), (x, yy, z + 0.11), 0.022, iron, n=8)


def distribution(x=0, z=0, compact=False):
    w = 1.28 if compact else 2.28
    box(x, 1.35, z, w, 2.52, 0.44, grey)
    box(x, 1.4, z + 0.24, w - 0.14, 2.26, 0.06, iron)
    for row in range(3):
        y = 0.75 + row * 0.62
        box(x, y, z + 0.30, w - 0.25, 0.095, 0.08, steel, metal)
        n = 5 if compact else 9
        for j in range(n):
            mcb(x + (j - (n - 1) / 2) * 0.21, y, z + 0.37, 0.2)
    # Open front door, edge-on, leaves all outgoing rows visible.
    box(x - w / 2, 1.35, z + 0.62, 0.075, 2.4, 1.15, ivory)
    box(x - w / 2 + 0.06, 1.36, z + 1.08, 0.065, 0.22, 0.09, black)


def switchboard():
    for i, x in enumerate((-1.88, -0.65, 0.58, 1.81)):
        box(x, 0.13, 0, 1.21, 0.26, 1.18, iron)
        box(x, 1.7, 0, 1.20, 2.94, 1.14, grey)
        for j in range(1 if i < 2 else 4):
            h = 2.77 if i < 2 else 0.67
            y = 1.69 if i < 2 else 0.68 + j * 0.695
            box(x, y, 0.60, 1.13, h, 0.095, ivory)
            box(x + 0.43, y, 0.68, 0.054, 0.20, 0.055, black)
            if i >= 2:
                box(x - 0.22, y, 0.67, 0.36, 0.20, 0.04, iron)
                contacts(x + 0.02, y + 0.12, 0.68, 2, 0.14)
        if i < 2:
            box(x, 1.68, 0.67, 0.84, 0.68, 0.12, black)
            plate(x, 1.68, 0.74, 0.71, 0.54, 0)
            for j, c in enumerate(phases):
                tube(
                    (x - 0.3 + j * 0.15, 2.68, 0.65),
                    (x - 0.3 + j * 0.15, 2.68, 0.70),
                    0.046,
                    c,
                )
        for j in range(5):
            box(x, 0.37 + j * 0.055, 0.66, 0.84, 0.021, 0.028, iron)


def rmu(x=0, z=0, count=3):
    start = x - (count - 1) * 0.55
    for i in range(count):
        xx = start + i * 1.10
        box(xx, 0.13, z, 1.09, 0.26, 1.22, iron)
        box(xx, 1.28, z, 1.08, 2.28, 1.16, ivory)
        box(xx, 0.78, z + 0.60, 0.99, 0.90, 0.08, grey)
        box(xx, 1.75, z + 0.61, 1, 0.83, 0.065, "e2dfc9")
        plate(xx, 1.75, z + 0.65, 0.93, 0.76, 2 if i == count - 1 else 1)
        tube((xx + 0.33, 1.76, z + 0.65), (xx + 0.33, 1.76, z + 0.72), 0.079, iron)
        for k in range(3):
            tube(
                (xx - 0.21 + k * 0.21, 1.19, z + 0.63),
                (xx - 0.21 + k * 0.21, 1.19, z + 0.66),
                0.04,
                phases[k],
            )
        box(xx, 0.97, z + 0.66, 0.34, 0.058, 0.05, iron)
    box(x, 2.50, z - 0.15, count * 1.1, 0.15, 0.70, grey)


def smart_rmu():
    rmu(count=4)
    # Remote terminal unit mounted above the motor-operated ring ways.
    box(0.98, 2.91, -0.05, 1.37, 0.73, 0.73, grey)
    box(0.98, 2.91, 0.34, 1.25, 0.61, 0.055, ivory)
    plate(0.88, 2.91, 0.375, 0.82, 0.49, 3)
    for j in range(3):
        tube(
            (1.46, 3.05 - j * 0.13, 0.37),
            (1.46, 3.05 - j * 0.13, 0.40),
            0.036,
            (green, yellow, red)[j],
        )
    tube((1.43, 3.28, -0.10), (1.43, 3.57, -0.10), 0.027, black, rubber)


def table(x, z, w=2.4):
    box(x, 1.02, z, w, 0.12, 1.25, "a99d87")
    for xx in (x - w * 0.43, x + w * 0.43):
        for zz in (z - 0.48, z + 0.48):
            box(xx, 0.5, zz, 0.095, 1, 0.095, iron, metal)
    box(x, 0.32, z, w * 0.87, 0.065, 0.85, grey)


def injection():
    rmu(-1.35, -0.35, 2)
    table(1.25, 0.35)
    box(1.25, 1.34, 0.35, 1.82, 0.5, 0.9, "bc6045")
    box(1.25, 1.34, 0.82, 1.66, 0.4, 0.04, ivory)
    for j in range(3):
        for k, c in enumerate((red, black, blue)):
            xx = 0.66 + k * 0.33
            yy = 1.22 + j * 0.11
            tube((xx, yy, 0.85), (xx, yy, 0.91), 0.039, c)
    plate(1.83, 1.36, 0.85, 0.42, 0.33, 3)
    for i, c in enumerate(phases):
        wire(
            [
                (0.66 + i * 0.33, 1.31, 0.91),
                (0.5 + i * 0.2, 1.05, 1.13),
                (0.10 + i * 0.12, 0.33, 0.98),
                (-0.28, 0.39, 0.66),
                (-0.82 + i * 0.15, 1.24, 0.35),
            ],
            0.032,
            c,
        )


def transformer():
    for x in (-1.15, 1.15):
        box(x, 0.08, 0, 0.22, 0.16, 2.25, steel, metal)
        for z in (-0.7, 0.72):
            tube((x - 0.13, 0.24, z), (x + 0.13, 0.24, z), 0.18, iron)
    box(0, 1.24, 0, 2.85, 1.76, 1.52, "9bada9")
    box(0, 2.14, 0, 3.02, 0.13, 1.69, grey)
    for i in range(19):
        x = -1.33 + i * 0.148
        for z in (-0.94, 0.94):
            box(x, 1.26, z, 0.043, 1.46, 0.54, grey, metal)
    for i in range(3):
        x = -0.82 + i * 0.82
        tube((x, 2.16, 0.28), (x, 2.93, 0.28), 0.105, "865d44", rubber)
        for j in range(5):
            y = 2.23 + j * 0.13
            tube((x, y, 0.28), (x, y + 0.07, 0.28), 0.19, "80523d", rubber, 0.112, 20)
        tube((x, 2.9, 0.28), (x, 3.05, 0.28), 0.07, copper)
    tube((-1.36, 2.88, -0.66), (1.36, 2.88, -0.66), 0.30, grey, n=28)
    for x in (-1, 1):
        box(x, 2.43, -0.65, 0.1, 0.53, 0.12, iron)
    for x in (-1.1, 1.1):
        box(x, 0.22, 1.2, 0.6, 0.17, 0.40, "b49a4d")
        tube((x, 0.31, 1.2), (x, 0.5, 1.2), 0.075, steel, n=6)


def terminations():
    table(0, 0.05, 4.4)
    # Open cable end with successive jacket, screen, insulation and copper steps.
    for a, b, r, c in [
        (-1.97, -0.85, 0.24, black),
        (-0.85, -0.33, 0.195, copper),
        (-0.33, 0.22, 0.17, "c0c7bd"),
        (0.22, 0.68, 0.12, "d4cfbb"),
        (0.68, 1.1, 0.084, copper),
    ]:
        tube((a, 1.34, 0.49), (b, 1.34, 0.49), r, c, n=24)
    tube((1.12, 1.34, 0.49), (1.95, 1.34, 0.49), 0.162, "535959", rubber)
    tube((1.09, 1.34, 0.49), (1.37, 1.34, 0.49), 0.115, copper)
    tube((1.91, 1.34, 0.49), (2.08, 1.34, 0.49), 0.11, black, rubber)
    for i, c in enumerate(phases):
        x = -0.56 + i * 0.57
        tube((x, 1.10, -0.33), (x, 2.31, -0.33), 0.13, "8b5149", rubber)
        for j in range(4):
            y = 1.59 + j * 0.15
            tube(
                (x, y, -0.33),
                (x, y + 0.095, -0.33),
                0.22,
                "97665c",
                rubber,
                0.115,
                n=20,
            )
        box(x, 2.41, -0.33, 0.14, 0.24, 0.067, copper, metal)
        tube((x, 2.43, -0.29), (x, 2.43, -0.28), 0.034, iron)
        tube((x, 1.40, -0.33), (x, 1.47, -0.33), 0.14, c)


def pulling():
    # Flanges, stave drum, axle stands and a cable paying off onto sheave rollers.
    for x in (-2.7, -1.42):
        box(x, 0.10, -0.22, 0.52, 0.20, 1.55, iron)
        for z in (-0.85, 0.41):
            tube((x, 0.16, z), (x, 1.22, -0.22), 0.063, yellow)
    tube((-2.87, 1.22, -0.22), (-1.23, 1.22, -0.22), 0.085, steel)
    tube((-2.55, 1.22, -0.22), (-1.56, 1.22, -0.22), 0.70, black)
    for x in (-2.58, -1.53):
        tube(
            (x - 0.07, 1.22, -0.22),
            (x + 0.07, 1.22, -0.22),
            1.02,
            "b89465",
            paint,
            n=32,
        )
        for j in range(8):
            a = j * math.pi / 4
            tube(
                (x - 0.08, 1.22 + 0.73 * math.sin(a), -0.22 + 0.73 * math.cos(a)),
                (x + 0.08, 1.22 + 0.73 * math.sin(a), -0.22 + 0.73 * math.cos(a)),
                0.044,
                iron,
                n=8,
            )
    for i in range(11):
        x = -2.46 + i * 0.084
        tube((x, 1.22, -0.22), (x + 0.046, 1.22, -0.22), 0.735, "364048", rubber, n=30)
    for x in (-0.5, 0.65, 1.8, 2.85):
        box(x, 0.075, 0.54, 0.57, 0.15, 0.85, iron)
        for z in (0.20, 0.88):
            box(x, 0.23, z, 0.18, 0.37, 0.08, yellow)
        tube((x, 0.35, 0.2), (x, 0.35, 0.88), 0.14, steel)
    wire(
        [
            (-2.1, 1.3, 0.48),
            (-1.7, 0.86, 0.55),
            (-0.6, 0.56, 0.54),
            (1, 0.55, 0.54),
            (3.3, 0.56, 0.54),
        ],
        0.075,
        black,
    )


def feeder():
    for x, w, h in [(-1.08, 1.92, 2.48), (1.36, 1.05, 1.46)]:
        box(x, 0.19, 0, w + 0.30, 0.38, 1.15, "b5b0a2")
        box(x, 0.4 + h / 2, -0.14, w, h, 0.7, "a7ada2")
        box(x, 0.4 + h + 0.06, -0.13, w + 0.17, 0.13, 0.91, "82948b")
        if x > 0:
            box(x, 0.42 + h / 2, 0.24, w - 0.10, h - 0.1, 0.065, "c5cac0")
            box(x + 0.31, 1.1, 0.30, 0.06, 0.19, 0.055, iron)
            continue
        box(x, 1.68, 0.24, w - 0.15, 2.12, 0.06, iron)
        for i in range(5):
            xx = x - 0.68 + i * 0.34
            for j in range(3):
                box(xx, 1.19 + j * 0.45, 0.32, 0.27, 0.40, 0.17, "e8e5d4")
                box(xx, 1.18 + j * 0.45, 0.423, 0.075, 0.17, 0.055, black)
            wire(
                [(xx, 0.98, 0.33), (xx, 0.65, 0.39), (xx + 0.13, 0.47, 0.35)],
                0.052,
                black,
            )
        box(x - w / 2, 1.64, 0.63, 0.07, h, 0.97, grey)


def generator():
    # FAST's site unit is an enclosed genset on a tank skid, with the radiator
    # louvres across the end face and separate engine service doors.
    box(-0.75, 0.20, 0, 4.05, 0.40, 1.65, iron)
    box(-0.75, 1.25, 0, 3.90, 1.76, 1.49, "e5e4d8")
    for x in (-1.45, -0.21, 0.73):
        box(x, 1.28, 0.77, 0.85, 1.49, 0.055, ivory)
        for y in (0.7, 1.83):
            box(x - 0.40, y, 0.81, 0.07, 0.11, 0.05, steel)
        box(x + 0.24, 1.22, 0.82, 0.07, 0.20, 0.05, black)
    for j in range(10):
        box(-2.32, 0.64 + j * 0.14, 0.786, 0.53, 0.062, 0.06, iron)
        box(1.23, 0.61 + j * 0.15, 0, 0.08, 0.08, 1.33, iron)
    tube((-0.55, 2.13, -0.47), (-0.55, 2.60, -0.47), 0.09, iron)
    tube((-0.8, 2.48, -0.47), (0.26, 2.48, -0.47), 0.14, steel)
    box(-0.20, 1.54, 0.80, 0.54, 0.29, 0.055, black)
    plate(-0.2, 1.54, 0.835, 0.50, 0.25, 0)
    distribution(2.65, -0.24, True)
    for i in range(3):
        x = 1.03 + i * 0.105
        wire(
            [
                (x, 0.72, 0.74),
                (x, 0.29, 1.12),
                (x + 0.24, 0.13, 1.27 + i * 0.09),
                (2.25 + i * 0.12, 0.13, 1.27 + i * 0.09),
                (2.25 + i * 0.12, 0.50, 0.30),
            ],
            0.043,
            black,
        )


def maintenance():
    # Accessible switchboard busbar chamber with an adjacent thermal inspection kit.
    box(-0.96, 1.35, -0.24, 2.14, 2.7, 0.65, grey)
    box(-0.96, 1.37, 0.105, 1.95, 2.5, 0.05, "3f4744")
    for i, c in enumerate(phases):
        x = -1.56 + i * 0.56
        for y in (0.56, 1.45, 2.17):
            box(x, y, 0.17, 0.26, 0.20, 0.15, "824f41")
        box(x, 1.38, 0.28, 0.18, 2.13, 0.065, copper, metal)
        for y in (0.59, 1.51, 2.23):
            tube((x, y, 0.31), (x, y, 0.38), 0.065, steel, n=6)
        box(x, 2.37, 0.32, 0.18, 0.15, 0.02, c)
    box(-2.04, 1.37, 0.56, 0.075, 2.56, 1.05, grey)
    table(1.60, 0.15, 2.25)
    # Handheld IR imager: pistol grip, front lens barrel and rear thermal display.
    box(1.07, 1.33, 0.31, 0.22, 0.5, 0.26, black, rubber)
    box(1.07, 1.75, 0.29, 0.57, 0.53, 0.47, yellow)
    tube((1.07, 1.75, 0.05), (1.07, 1.75, -0.20), 0.19, black)
    plate(1.07, 1.76, 0.54, 0.49, 0.40, 7)
    box(2.01, 1.58, 0.04, 0.97, 0.83, 0.08, iron)
    plate(2.01, 1.59, 0.088, 0.87, 0.70, 7)
    box(2.01, 1.11, 0.29, 0.99, 0.06, 0.56, steel)
    for i in range(5):
        box(2.01, 1.15, 0.12 + i * 0.065, 0.76, 0.012, 0.027, black)


def pfc():
    box(0, 0.12, 0, 3.9, 0.24, 1.18, iron)
    box(0, 1.57, -0.14, 3.74, 2.72, 0.69, grey)
    box(0.48, 1.59, 0.23, 2.52, 2.52, 0.07, iron)
    box(-1.28, 1.59, 0.22, 0.99, 2.53, 0.10, ivory)
    plate(-1.28, 2.12, 0.28, 0.82, 0.60, 5)
    for i in range(4):
        box(-1.26, 0.84 + i * 0.10, 0.28, 0.63, 0.037, 0.05, iron)
    for j in range(2):
        y = 0.46 + j * 1.18
        box(0.48, y, 0.49, 2.58, 0.085, 0.66, steel, metal)
        for i in range(4):
            x = -0.42 + i * 0.57
            tube((x, y + 0.06, 0.54), (x, y + 0.69, 0.54), 0.205, "c8c5b2", metal, n=20)
            tube((x, y + 0.67, 0.54), (x, y + 0.73, 0.54), 0.217, steel)
            for dx in (-0.085, 0.085):
                tube((x + dx, y + 0.73, 0.54), (x + dx, y + 0.82, 0.54), 0.031, brass)
            box(x, y + 0.97, 0.30, 0.28, 0.22, 0.22, ivory)
            wire(
                [
                    (x - 0.08, y + 0.79, 0.54),
                    (x - 0.08, y + 0.9, 0.55),
                    (x, y + 0.93, 0.41),
                ],
                0.024,
                red,
            )


def meters():
    # Metering board with a CT window around each incoming phase and sealed terminals.
    box(0, 1.46, -0.26, 3.58, 2.88, 0.35, grey)
    for i in range(3):
        x = -1.13 + i * 1.13
        box(x, 1.86, 0.03, 0.87, 1.08, 0.30, ivory)
        plate(x, 2.00, 0.187, 0.74, 0.69, 4)
        box(x, 1.47, 0.21, 0.84, 0.28, 0.12, "929c97")
        for j in range(4):
            xx = x - 0.26 + j * 0.17
            tube((xx, 1.4, 0.27), (xx, 1.4, 0.28), 0.031, steel, n=6)
        wire(
            [
                (x - 0.17, 1.35, 0.08),
                (x - 0.17, 0.92, 0.17),
                (x - 0.38, 0.63, 0.17),
                (x - 0.38, 0.27, 0.22),
            ],
            0.059,
            phases[i],
        )
        # Four sides and an actual aperture around the insulated conductor.
        for dx in (-0.18, 0.18):
            box(x - 0.38 + dx, 0.56, 0.18, 0.11, 0.43, 0.28, black)
        for yy in (0.36, 0.76):
            box(x - 0.38, yy, 0.18, 0.43, 0.10, 0.28, black)
        wire(
            [
                (x - 0.55, 0.62, 0.29),
                (x - 0.65, 0.92, 0.33),
                (x - 0.40, 1.18, 0.32),
                (x - 0.32, 1.39, 0.28),
            ],
            0.018,
            "bcb69a",
        )
    box(0, 0.2, 0.04, 3.44, 0.15, 0.15, iron)


def commissioning():
    # A control loop, physically distinct from the RMU injection station.
    box(-0.80, 1.40, -0.28, 2.96, 2.80, 0.44, grey)
    for row in range(3):
        box(-0.80, 0.59 + row * 0.76, 0, 2.65, 0.075, 0.08, steel, metal)
    for i in range(7):
        x = -1.94 + i * 0.35
        box(x, 2.14, 0.13, 0.32, 0.73, 0.29, iron if i < 2 else grey)
        box(x, 2.32, 0.285, 0.25, 0.16, 0.025, black)
        for j in range(4):
            box(x - 0.075 + j * 0.048, 2.31, 0.304, 0.022, 0.040, 0.02, green)
        box(x, 1.93, 0.288, 0.24, 0.15, 0.045, "739592")
    for i in range(15):
        x = -2.01 + i * 0.167
        box(x, 0.7, 0.10, 0.14, 0.29, 0.24, "bdba9c")
        wire(
            [(x, 0.79, 0.22), (x, 0.94, 0.20), (x + 0.04, 1.12, 0.09)],
            0.016,
            phases[i % 3],
        )
    for j in range(5):
        box(-0.8, 1.32 + j * 0.064, 0.12, 2.62, 0.035, 0.13, ivory)
    table(1.77, 0.18, 2.2)
    box(1.64, 1.53, 0.20, 1.05, 0.78, 0.10, black)
    plate(1.64, 1.54, 0.258, 0.96, 0.68, 6)
    box(1.64, 1.11, 0.48, 1.09, 0.07, 0.64, "626e73")
    box(2.54, 1.22, 0.40, 0.44, 0.28, 0.50, yellow)
    wire(
        [
            (2.48, 1.24, 0.65),
            (2.32, 1.12, 0.91),
            (0.66, 0.94, 0.92),
            (0.36, 1.23, 0.26),
        ],
        0.025,
        red,
    )


def high_bays():
    # Suspended circular LED luminaires with radial heat sinks and individual optics.
    for x in (-1.55, 1.55):
        tube((x, 0, -0.96), (x, 3.99, -0.96), 0.075, iron)
    box(0, 4.03, -0.96, 3.5, 0.15, 0.19, steel)
    for x in (-1.18, 1.18):
        box(x, 4.02, -0.43, 0.12, 0.13, 1.1, steel)
        tube((x, 3.45, 0.09), (x, 3.99, 0.09), 0.022, iron)
        tube((x, 3.17, 0.09), (x, 3.45, 0.09), 0.22, iron)
        tube((x, 2.92, 0.09), (x, 3.18, 0.09), 0.71, iron, paint, 0.42, n=32)
        for i in range(20):
            a = i * math.pi / 10
            tube(
                (x + 0.24 * math.cos(a), 3.20, 0.09 + 0.24 * math.sin(a)),
                (x + 0.62 * math.cos(a), 3.04, 0.09 + 0.62 * math.sin(a)),
                0.029,
                grey,
            )
        tube((x, 2.885, 0.09), (x, 2.925, 0.09), 0.64, "d0cbbb", n=32)
        for i in range(19):
            a = i * math.pi * 2 / 19
            tube(
                (x + 0.49 * math.cos(a), 2.865, 0.09 + 0.49 * math.sin(a)),
                (x + 0.49 * math.cos(a), 2.887, 0.09 + 0.49 * math.sin(a)),
                0.054,
                "fff1cb",
                lamp,
            )
    # Sectioned, front-facing sample shows the board hidden under the suspended units.
    tube((0, 0.55, 0.66), (0, 0.55, 0.84), 0.49, iron, n=28)
    for i in range(12):
        a = i * math.pi / 6
        tube(
            (0.34 * math.cos(a), 0.55 + 0.34 * math.sin(a), 0.84),
            (0.34 * math.cos(a), 0.55 + 0.34 * math.sin(a), 0.86),
            0.055,
            "fff1cb",
            lamp,
        )


def site_lighting():
    box(1.32, 0.10, -0.22, 0.87, 0.20, 0.85, "b5b0a2")
    tube((1.32, 0.20, -0.22), (1.32, 3.72, -0.22), 0.108, steel, r2=0.065)
    tube((1.32, 3.69, -0.22), (0.19, 4.09, -0.18), 0.067, steel)
    box(-0.13, 4.10, -0.18, 0.97, 0.14, 0.47, iron)
    box(-0.18, 4.015, -0.18, 0.78, 0.031, 0.37, "f9ebc5", lamp)
    for x in (-2.45, -0.59):
        tube((x, 0.16, 0.4), (x, 2.46, 0.4), 0.047, grey)
    box(-1.52, 2.44, 0.43, 2.35, 0.18, 0.32, "bdc7c4")
    box(-1.52, 2.37, 0.56, 2.20, 0.09, 0.16, "f4ecd5", lamp)
    box(-1.52, 1.24, 0.43, 1.05, 0.73, 0.18, "dce2dc")
    for j in range(4):
        box(-1.52, 1.02 + j * 0.14, 0.535, 0.90, 0.035, 0.027, steel)
    for dx in (-0.28, 0.28):
        tube((1.32 + dx, 0.20, 0.05), (1.32 + dx, 0.31, 0.05), 0.054, steel, n=6)


def fan():
    # Cylindrical axial casing, flange bolt circles, motor pedestal and wire guard.
    for x in (-0.89, 0.89):
        for z in (-0.51, 0.45):
            box(x, 0.33, z, 0.105, 0.66, 0.105, iron)
            box(x, 0.045, z, 0.31, 0.09, 0.28, steel)
            box(x, 0.80, z, 0.09, 0.36, 0.12, grey)
        box(x, 0.64, -0.03, 0.13, 0.11, 1.09, iron)
    for z in (-0.51, 0.45):
        for y in (0.13, 0.65):
            box(0, y, z, 1.86, 0.10, 0.11, iron)

    def ring(z, r, rad, color):
        points = [
            (r * math.cos(i * math.pi / 24), 1.65 + r * math.sin(i * math.pi / 24), z)
            for i in range(49)
        ]
        for a, b in zip(points, points[1:]):
            tube(a, b, rad, color, n=6)

    for i in range(40):
        a, b = i * math.pi / 20, (i + 1) * math.pi / 20
        # The casing is hollow, revealing the impeller and its motor.
        v = [
            vertex((r * math.cos(t), 1.65 + r * math.sin(t), z), "738c90")
            for r, z in [(1.30, -0.65), (1.30, 0.55), (1.36, 0.55), (1.36, -0.65)]
            for t in (a, b)
        ]
        for k in range(4):
            m = (k + 1) % 4
            polygon([v[2 * k], v[2 * m], v[2 * m + 1], v[2 * k + 1]], metal)
    ring(0.55, 1.34, 0.053, steel)
    ring(-0.65, 1.34, 0.053, steel)
    for r in (0.36, 0.59, 0.83, 1.07, 1.29):
        ring(0.61, r, 0.016, steel)
    for i in range(12):
        a = i * math.pi / 6
        tube(
            (0.22 * math.cos(a), 1.65 + 0.22 * math.sin(a), 0.62),
            (1.29 * math.cos(a), 1.65 + 1.29 * math.sin(a), 0.62),
            0.014,
            steel,
        )
    tube((0, 1.65, -0.80), (0, 1.65, -0.15), 0.32, iron)
    box(0.99, 2.67, -0.14, 0.48, 0.36, 0.42, iron)
    wire(
        [
            (1.21, 2.6, -0.16),
            (1.39, 2.44, -0.16),
            (1.39, 0.38, -0.20),
            (0.90, 0.19, -0.16),
        ],
        0.047,
        black,
    )


def impeller():
    # Local origin is the shaft axis. Spanwise twist produces a swept airfoil silhouette.
    tube((0, 0, -0.16), (0, 0, 0.28), 0.33, grey, n=28)
    tube((0, 0, 0.28), (0, 0, 0.37), 0.29, steel, r2=0.19, n=24)
    for i in range(7):
        rows = []
        for r, sweep, chord, pitch in [
            (0.23, 0, 0.21, 0.17),
            (0.52, 0.11, 0.36, 0.16),
            (0.92, 0.27, 0.46, 0.10),
            (1.23, 0.48, 0.37, 0.055),
        ]:
            a = i * 2 * math.pi / 7 + sweep
            rows.append(
                [
                    (
                        r * math.cos(a) - v * math.sin(a),
                        r * math.sin(a) + v * math.cos(a),
                        0.04 + dz,
                    )
                    for v, dz in [
                        (-chord / 2, -pitch * 0.5),
                        (0, 0.025),
                        (chord / 2, pitch * 0.5),
                        (0, 0.067),
                    ]
                ]
            )
        loft(rows, "b0babb", metal)


builders = [
    switchboard,
    smart_rmu,
    injection,
    transformer,
    terminations,
    pulling,
    distribution,
    feeder,
    generator,
    maintenance,
    pfc,
    meters,
    commissioning,
    high_bays,
    site_lighting,
    fan,
]
for i, build in enumerate(builders, 1):
    build()
    export_part(f"Exhibit{i:02}")
impeller()
export_part("Impeller")
with tempfile.TemporaryDirectory() as work:
    raw = Path(work) / "exhibits.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(raw), export_materials="EXPORT", export_yup=True
    )
    subprocess.run(
        [
            str(root / "node_modules/.bin/gltf-transform"),
            "meshopt",
            str(raw),
            str(output),
            "--level",
            "medium",
            "--quantize-position",
            "16",
        ],
        check=True,
    )
