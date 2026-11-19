"""Build the tower sun screen, arrival canopy and interior display alcove in metres.
Run from the repository root with blender -b -P scripts/blender/architecture.py.
"""

import bpy
from math import sin, cos, pi
from pathlib import Path
from subprocess import run
from tempfile import TemporaryDirectory

out = Path.cwd() / "public/assets/architecture"
out.mkdir(exist_ok=True, parents=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
palette = [
    ("Anodized champagne", (0.52, 0.32, 0.15), 0.74, 0.34),
    ("Satin aluminium", (0.57, 0.61, 0.59), 0.75, 0.29),
    ("Shadow reveal", (0.047, 0.075, 0.079), 0.58, 0.47),
    ("Oiled oak", (0.31, 0.17, 0.085), 0.05, 0.52),
    ("Linear diffuser", (0.98, 0.83, 0.58), 0.08, 0.27),
    ("Honed limestone", (0.76, 0.69, 0.54), 0.05, 0.64),
]
materials = []
for name, rgb, metallic, rough in palette:
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bs = m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value = (*rgb, 1)
    bs.inputs["Metallic"].default_value = metallic
    bs.inputs["Roughness"].default_value = rough
    if name == "Linear diffuser":
        bs.inputs["Emission Color"].default_value = (*rgb, 1)
        bs.inputs["Emission Strength"].default_value = 1.2
    materials.append(m)

verts, faces, slots = [], [], []


def rings(levels, material):
    start = len(verts)
    for level in levels:
        verts.extend((x, -z, y) for x, y, z in level)
    n = len(levels[0])
    for j in range(len(levels) - 1):
        for k in range(n):
            a = start + j * n + k
            b = start + j * n + (k + 1) % n
            faces.append((a, b, b + n, a + n))
            slots.append(material)
    faces.extend(
        [
            tuple(reversed(range(start, start + n))),
            tuple(range(len(verts) - n, len(verts))),
        ]
    )
    slots.extend([material] * 2)


def block(x, y, z, w, h, d, material):
    rings(
        [
            [
                (x + i * w / 2, y + j * h / 2, z + k * d / 2)
                for i, k in [(-1, 1), (1, 1), (1, -1), (-1, -1)]
            ]
            for j in [-1, 1]
        ],
        material,
    )


def export(name):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for m in materials:
        mesh.materials.append(m)
    for polygon, slot in zip(mesh.polygons, slots):
        polygon.material_index = slot
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bevel = obj.modifiers.new("Machined edge highlights", "BEVEL")
    bevel.width = 0.018
    bevel.segments = 1
    normal = obj.modifiers.new("Weighted face normals", "WEIGHTED_NORMAL")
    bpy.ops.export_scene.gltf(
        filepath=str(out / (name + ".glb")), use_selection=True, export_apply=True
    )
    verts.clear()
    faces.clear()
    slots.clear()


# Folded fins twist from a deep shade at the podium to an open lantern at the crown.
for side in [0, 1, -1]:
    count = 21 if side == 0 else 12
    for i in range(count):
        u = i / (count - 1)
        lateral = (u - 0.5) * (31 if side == 0 else 18.2)
        if side == 0 and -13.8 < lateral < -8.4:
            continue
        levels = []
        for j in range(15):
            y = 7.3 + j * (75.1 + 1.6 * cos(pi * u)) / 14
            # Keep the FAST emblem clear of the vertical screen.
            if side == 0 and 2.5 < lateral < 13.6 and y > 74:
                break
            angle = 0.3 + 0.65 * sin(pi * (j / 14 + u * 0.8))
            level = []
            for a, b in [(-0.09, 0.57), (0.09, 0.57), (0.09, -0.57), (-0.09, -0.57)]:
                t = lateral + a * cos(angle) - b * sin(angle)
                depth = a * sin(angle) + b * cos(angle)
                level.append(
                    (t, y, 9.85 + depth)
                    if side == 0
                    else (side * (16.9 + depth), y, -1 - side * t)
                )
            levels.append(level)
        rings(levels, 0)
for i in range(45):
    block(-6.8 + i * 0.445, 6.43, 12.6, 0.13, 0.22, 6.1, 3)
for x in [-6.95, 12.95]:
    block(x, 6.69, 12.5, 0.17, 0.54, 7.25, 0)
block(3, 6.66, 16.04, 20, 0.53, 0.14, 0)
block(3, 6.43, 16.13, 19.7, 0.045, 0.035, 4)
export("tower-brise-soleil")

# A recessed oak and metal lining that frames each engineering exhibit.
block(0, 2.1, -0.1, 8.65, 4.16, 0.15, 2)
for i in range(41):
    x = (i - 20) * 0.21
    block(x, 2.10, 0.012, 0.12, 4.13, 0.11 + 0.12 * (0.5 + 0.5 * cos(i * 0.28)), 3)
for side in [-1, 1]:
    block(side * 4.38, 2.18, 0.13, 0.12, 4.36, 0.48, 0)
    block(side * 4.28, 2.18, 0.29, 0.028, 4.21, 0.027, 4)
block(0, 4.33, 0.14, 8.85, 0.16, 0.54, 1)
block(0, 0.12, 0.23, 8.8, 0.23, 0.6, 5)
export("gallery-alcove")


# Wire fan guards with concentric stainless wires and radial stays, modelled
# separately so the rotor can turn below them.
def toroidal_wire(radius, height, thickness):
    start = len(verts)
    sections = 48
    for i in range(sections):
        a = 2 * pi * i / sections
        for j in range(6):
            b = 2 * pi * j / 6
            r = radius + thickness * cos(b)
            verts.append((r * cos(a), r * sin(a), height + thickness * sin(b)))
    for i in range(sections):
        for j in range(6):
            faces.append(
                tuple(
                    start + 6 * (k % sections) + (m % 6)
                    for k, m in [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]
                )
            )
            slots.append(1)


for r in [0.22, 0.38, 0.54, 0.69, 0.84]:
    toroidal_wire(r, 0.05 * (1 - r), 0.015 if r < 0.84 else 0.029)
for i in range(8):
    a = 2 * pi * i / 8
    levels = []
    for y in [-0.032, -0.012]:
        levels.append(
            [
                (r * cos(a) - d * sin(a), y, r * sin(a) + d * cos(a))
                for r, d in [(0, 0.02), (0.86, 0.02), (0.86, -0.02), (0, -0.02)]
            ]
        )
    rings(levels, 2)
export("fan-guard")

# A foot-mounted finned induction motor with its terminal box, bolted end
# bells and guarded coupling. The neighbouring volute takes the service colour.
motor_paint = bpy.data.materials.new("Petrol enamel")
motor_paint.use_nodes = True
bsdf = motor_paint.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Base Color"].default_value = (0.026, 0.13, 0.16, 1)
bsdf.inputs["Metallic"].default_value = 0.48
bsdf.inputs["Roughness"].default_value = 0.31
materials.append(motor_paint)
enamel = len(materials) - 1


def shaft(profile, cy=0.71, cz=0, mat=enamel, sides=48):
    rings(
        [
            [
                (x, cy + r * cos(2 * pi * i / sides), cz + r * sin(2 * pi * i / sides))
                for i in range(sides)
            ]
            for x, r in profile
        ],
        mat,
    )


shaft(
    [
        (-1.06, 0.26),
        (-1.02, 0.38),
        (-0.92, 0.46),
        (-0.8, 0.46),
        (-0.76, 0.4),
        (0.09, 0.4),
        (0.2, 0.44),
        (0.29, 0.38),
        (0.32, 0.21),
    ]
)
for i in range(26):
    angle = 2 * pi * i / 26
    section = [(0.395, -0.017), (0.49, -0.012), (0.49, 0.012), (0.395, 0.017)]
    rings(
        [
            [
                (
                    x,
                    0.71 + r * cos(angle) - v * sin(angle),
                    r * sin(angle) + v * cos(angle),
                )
                for r, v in section
            ]
            for x in [-0.76, 0.12]
        ],
        enamel,
    )
for x in [-0.79, 0.19]:
    shaft([(x - 0.032, 0.465), (x + 0.032, 0.465)])
    for i in range(8):
        theta = 2 * pi * i / 8
        shaft(
            [(x + 0.032, 0.035), (x + 0.056, 0.035)],
            0.71 + 0.42 * cos(theta),
            0.42 * sin(theta),
            1,
            6,
        )
for z in [-0.37, 0.37]:
    block(-0.32, 0.28, z, 1.17, 0.16, 0.21, 2)
    for x in [-0.69, 0.06]:
        block(x, 0.42, z, 0.15, 0.22, 0.14, enamel)
block(-0.3, 1.22, 0, 0.48, 0.23, 0.35, enamel)
block(-0.3, 1.35, 0, 0.53, 0.04, 0.39, 1)
block(-0.32, 0.76, 0.493, 0.40, 0.19, 0.018, 1)
for i in range(3):
    block(-0.32, 0.715 + i * 0.041, 0.507, 0.29, 0.012, 0.009, 2)
shaft([(0.29, 0.105), (0.72, 0.105)], mat=1)
shaft([(0.38, 0.215), (0.42, 0.24), (0.64, 0.24), (0.68, 0.215)], mat=0)
for i in range(12):
    a = 2 * pi * i / 12
    shaft([(0.43, 0.018), (0.64, 0.018)], 0.71 + 0.239 * cos(a), 0.239 * sin(a), 2, 6)
export("induction-motor")

# Quantize positions and pack geometry using the project's glTF Transform tool.
# Blender still produces ordinary uncompressed files when used without node_modules.
optimizer = Path.cwd() / "node_modules/.bin/gltf-transform"
if optimizer.is_file():
    with TemporaryDirectory() as tmp:
        for name in [
            "tower-brise-soleil",
            "gallery-alcove",
            "fan-guard",
            "induction-motor",
        ]:
            asset = out / (name + ".glb")
            packed = Path(tmp) / (name + ".glb")
            run(
                [
                    str(optimizer),
                    "meshopt",
                    str(asset),
                    str(packed),
                    "--level",
                    "medium",
                    "--quantize-position",
                    "16",
                ],
                check=True,
            )
            asset.write_bytes(packed.read_bytes())
