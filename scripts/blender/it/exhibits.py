"""Build from the repository root with blender -b -P scripts/blender/it/exhibits.py."""

import math
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "electrical"))
from exhibits import (
    box,
    tube,
    wire,
    loft,
    verts,
    plate,
    export_part,
    write_glb,
    materials,
    print_face,
    atlas,
    metal,
    paint,
)

subprocess.run(
    ["python3", str(Path(__file__).with_name("screens.py")), str(atlas)], check=True
)
next(
    n for n in materials[print_face].node_tree.nodes if n.type == "TEX_IMAGE"
).image.reload()

dark, black, slate, steel = "26323b", "18252e", "536776", "aab8be"
cream, teal, gold, blue, green = "e6e3d4", "338e91", "d7a459", "4c91ac", "80bf9c"


def disc(x, y, z, r, length, colour):
    tube((x, y, z - length / 2), (x, y, z + length / 2), r, colour, n=24)


def screen(x, y, z, w, h, index):
    box(x, y, z, w, h, 0.12, dark, metal)
    plate(x, y, z + 0.064, w * 0.94, h * 0.91, index)


def desk(x, y, z, w, d):
    box(x, y, z, w, 0.12, d, "bda98e")
    for xx in (x - w * 0.43, x + w * 0.43):
        for zz in (z - d * 0.38, z + d * 0.38):
            box(xx, y / 2, zz, 0.09, y, 0.09, slate)


def display(x, y, z, w, h, index):
    box(x, y - h * 0.55, z, 0.55, 0.06, 0.38, slate)
    box(x, y - h * 0.30, z - 0.12, 0.12, h * 0.50, 0.09, slate)
    screen(x, y, z, w, h, index)


def rack(x, z, width, height):
    box(x, 0.16, z, width + 0.15, 0.25, 1.09, slate)
    box(x, height, z, width + 0.13, 0.12, 1.09, slate)
    for dx in (-width / 2, width / 2):
        for dz in (-0.48, 0.48):
            box(x + dx, height / 2, z + dz, 0.09, height, 0.09, slate, metal)
    box(x, height / 2, z - 0.52, width, height, 0.07, dark)
    for side in (-1, 1):
        box(
            x + side * width * 0.48,
            height / 2,
            z + 0.40,
            0.069,
            height,
            0.07,
            steel,
            metal,
        )


def ports(x, y, z, n, spacing):
    for j in range(n):
        xx = x + (j - (n - 1) / 2) * spacing
        box(xx, y, z, 0.115, 0.086, 0.03, black)
        box(xx + 0.032, y + 0.059, z, 0.024, 0.019, 0.026, green)


def server(x, y, z, w=1.61, depth=0.86):
    box(x, y, z, w, 0.27, depth, slate, metal)
    front = z + depth / 2
    for i in range(6):
        xx = x + (i - 2.5) * w * 0.135
        box(xx, y, front + 0.015, w * 0.113, 0.18, 0.049, black)
        box(xx - 0.018, y + 0.04, front + 0.046, w * 0.075, 0.017, 0.014, steel)
        box(xx + w * 0.041, y - 0.045, front + 0.046, 0.017, 0.026, 0.014, green)
    for xx in (x - w * 0.47, x + w * 0.47):
        box(xx, y, front + 0.03, 0.03, 0.17, 0.055, cream)


def pad(x, y, z, w, h):
    box(x, y, z, w, h, 0.16, slate)
    box(x, y + 0.18 * h, z + 0.10, w * 0.75, h * 0.38, 0.035, teal)
    for row in range(3):
        for col in range(3):
            box(
                x + (col - 1) * w * 0.19,
                y - (0.05 + row * 0.12) * h,
                z + 0.098,
                w * 0.11,
                h * 0.063,
                0.025,
                cream,
            )


def camera(x, y, z):
    # Bullet camera with a visor, recessed lens and articulated wall bracket.
    box(x, y - 0.17, z - 0.32, 0.22, 0.50, 0.14, steel)
    tube((x, y - 0.04, z - 0.29), (x, y, z), 0.076, slate)
    box(x, y, z + 0.19, 0.43, 0.33, 0.63, cream)
    box(x, y + 0.19, z + 0.26, 0.49, 0.052, 0.75, cream)
    disc(x, y, z + 0.527, 0.136, 0.05, black)
    disc(x, y, z + 0.558, 0.082, 0.027, teal)


def cctv():
    desk(-0.57, 0.92, 0, 3.38, 1.16)
    display(-1.00, 1.64, -0.18, 1.76, 1.13, 0)
    server(0.44, 1.12, 0, 0.95)
    box(1.70, 0.11, -0.20, 0.81, 0.19, 0.77, slate)
    box(1.70, 1.39, -0.32, 0.13, 2.59, 0.13, steel)
    camera(1.70, 2.55, 0.02)


def access():
    # A walk-up door slice with separate badge and fingerprint readers on the jamb.
    box(-0.51, 1.36, -0.22, 1.90, 2.70, 0.14, "b2bdba")
    for x in (-1.52, 0.50):
        box(x, 1.45, -0.22, 0.12, 2.87, 0.31, slate)
    box(-0.51, 2.89, -0.22, 2.16, 0.13, 0.31, slate)
    box(0.14, 1.23, -0.10, 0.41, 0.06, 0.12, steel)
    box(1.14, 1.16, -0.26, 0.87, 2.30, 0.24, slate)
    box(1.14, 1.70, -0.09, 0.46, 0.57, 0.11, black)
    for i in range(3):
        box(1.14, 1.68 + i * 0.043, -0.026, 0.25 - 0.052 * i, 0.022, 0.013, cream)
    pad(1.14, 0.97, -0.083, 0.54, 0.55)
    box(1.14, 0.70, 0.005, 0.26, 0.14, 0.095, teal)


def turnstile():
    box(0, 0.10, 0, 3.3, 0.17, 1.55, slate)
    box(-0.72, 1.05, 0, 1.00, 1.77, 1.17, steel, metal)
    box(-0.72, 1.98, 0, 1.17, 0.14, 1.30, dark)
    pad(-0.72, 1.76, 0.61, 0.37, 0.26)
    disc(-0.19, 1.42, 0.51, 0.29, 0.29, slate)
    for i in range(3):
        a = i * math.tau / 3
        tube(
            (-0.18, 1.42, 0.57),
            (
                0.63 + 0.60 * math.cos(a),
                1.42 + 0.85 * math.sin(a),
                0.91 + 0.28 * math.cos(a),
            ),
            0.061,
            steel,
        )
    for z in (-0.53, 0.47):
        tube((1.38, 0.18, z), (1.38, 1.61, z), 0.069, steel)
    tube((1.38, 1.61, -0.53), (1.38, 1.61, 0.47), 0.069, steel)


def vision():
    desk(0, 0.89, 0, 3.97, 1.45)
    box(-0.74, 1.05, 0, 1.78, 0.20, 1.18, dark)
    for x in (-1.46, 0.02):
        box(x, 1.83, -0.44, 0.10, 1.84, 0.13, steel)
    box(-0.72, 2.74, -0.16, 1.65, 0.13, 0.70, steel)
    box(-0.72, 2.49, 0, 0.38, 0.39, 0.34, teal)
    tube((-0.72, 2.18, 0), (-0.72, 2.32, 0), 0.135, black)
    display(1.10, 1.64, -0.08, 1.51, 1.11, 3)


def inspection_carrier():
    tube((0, 0.0, 0), (0, 0.13, 0), 0.54, slate, n=32)
    # Annular machined part, open bore and six bolt heads visible from the aisle.
    for i in range(36):
        a, b = i * math.tau / 36, (i + 1) * math.tau / 36
        loft(
            [
                [
                    (r * math.cos(t), y, r * math.sin(t))
                    for r, t in ((0.14, b), (0.41, b), (0.41, a), (0.14, a))
                ]
                for y in (0.13, 0.27)
            ],
            steel,
            metal,
        )
    for i in range(6):
        a = i * math.tau / 6
        x = 0.30 * math.cos(a)
        z = 0.30 * math.sin(a)
        tube((x, 0.27, z), (x, 0.286, z), 0.049, dark, n=8)


def cabling():
    rack(-0.66, -0.14, 2.12, 2.66)
    for y in (1.85, 2.26):
        box(-0.66, y, -0.11, 2.03, 0.26, 0.79, dark)
        ports(-0.66, y, 0.302, 12, 0.151)
    for j in range(8):
        x = -1.47 + j * 0.15
        wire(
            [
                (x, 2.26, 0.31),
                (x, 2.13, 0.61),
                (x + 0.22, 2.02, 0.67),
                (x + 0.22, 1.85, 0.31),
            ],
            0.025,
            blue if j < 4 else gold,
        )
    box(-0.66, 0.93, -0.04, 1.99, 0.44, 0.79, steel)
    for i in range(6):
        box(-1.36 + i * 0.26, 0.95, 0.38, 0.15, 0.12, 0.065, teal)
    desk(1.27, 0.81, 0, 1.32, 1.05)
    screen(1.27, 1.21, 0.05, 0.62, 0.72, 4)


def data_centre():
    for x in (-0.87, 0.87):
        rack(x, 0, 1.51, 2.91)
        for y in (0.55, 0.89, 1.23, 1.57):
            server(x, y, 0, 1.41)
        for y in (2.08, 2.39):
            box(x, y, -0.03, 1.40, 0.21, 0.83, dark)
            ports(x, y, 0.405, 8, 0.145)
    box(0, 3.02, 0, 3.41, 0.10, 0.82, steel)
    screen(1.83, 1.91, 0.26, 0.52, 0.58, 5)
    box(1.78, 1.55, -0.05, 0.10, 0.76, 0.18, steel)


def server_sled():
    desk(0, 0.82, 0, 4.00, 1.58)
    chassis_start = len(verts)
    # Lid removed. Paired heatsinks, memory banks, hot-swap bays and redundant PSUs.
    box(0, 0.99, 0, 3.33, 0.18, 1.40, steel)
    for x in (-1.63, 1.63):
        box(x, 1.17, 0, 0.085, 0.37, 1.41, slate)
    box(-0.03, 1.10, -0.04, 3.09, 0.045, 1.19, "447465")
    for x in (-0.75, 0.15):
        for j in range(7):
            box(x + (j - 3) * 0.054, 1.25, 0.01, 0.027, 0.27, 0.48, steel, metal)
    for j in range(5):
        box(-1.39 + j * 0.094, 1.21, -0.04, 0.042, 0.19, 0.59, dark)
    for x in (0.84, 1.33):
        box(x, 1.22, -0.36, 0.40, 0.25, 0.50, slate)
    server(0, 1.13, 0.60, 3.12, 0.20)

    # Tilt the section toward the aisle around its front lower edge. The shared
    # exporter stores exhibit (x, y, z) as Blender (x, -z, y).
    angle = math.radians(28)
    for i in range(chassis_start, len(verts)):
        x, negative_z, y = verts[i]
        dy, dz = y - .9, -negative_z - .7
        y = .9 + dy * math.cos(angle) - dz * math.sin(angle)
        z = .7 + dy * math.sin(angle) + dz * math.cos(angle)
        verts[i] = (x, -z, y)
    for x in (-1.28, 1.28):
        box(x, .92, -.04, .18, .08, 1.40, slate)
        tube((x, .94, -.47), (x, 1.52, -.47), .068, steel)
        tube((x, .94, .61), (x, 1.52, -.47), .046, steel)


def integration():
    desk(0, 0.91, 0, 3.46, 1.36)
    display(0.68, 1.73, -0.22, 1.67, 1.21, 7)
    box(-0.96, 1.14, 0.09, 1.18, 0.36, 0.77, slate)
    pad(-0.71, 1.29, 0.44, 0.54, 0.41)
    wire(
        [
            (-1.41, 1.29, 0.31),
            (-1.41, 1.58, 0.31),
            (-1.41, 1.63, -0.22),
            (-1.41, 1.39, -0.22),
        ],
        0.104,
        black,
    )
    box(0.72, 1.01, 0.43, 1.12, 0.064, 0.33, dark)
    for i in range(9):
        box(0.25 + i * 0.114, 1.049, 0.43, 0.076, 0.014, 0.21, steel)


def service_bench():
    desk(0, 0.87, 0, 3.92, 1.41)
    screen(-0.93, 1.49, -0.30, 1.69, 1.02, 8)
    box(-0.93, 0.98, 0.06, 1.72, 0.09, 0.79, slate)
    box(1.03, 1.13, -0.06, 1.21, 0.34, 0.92, dark)
    for i in range(3):
        box(0.70 + i * 0.31, 1.14, 0.42, 0.23, 0.19, 0.065, steel)
    box(0.88, 1.00, 0.78, 0.49, 0.10, 0.24, "518778")
    for i in range(6):
        box(0.69 + i * 0.061, 1.045, 0.85, 0.027, 0.021, 0.10, gold)


def apps():
    desk(0, 0.89, -0.04, 3.89, 1.38)
    display(-0.83, 1.79, -0.21, 1.93, 1.25, 9)
    box(1.08, 1.03, 0, 0.67, 0.15, 0.65, steel)
    box(1.08, 1.34, -0.14, 0.12, 0.60, 0.14, slate)
    screen(1.08, 1.68, 0.04, 0.71, 1.30, 9)
    box(1.08, 2.27, 0.119, 0.19, 0.022, 0.012, black)


def erp():
    desk(0, 0.92, 0, 4.21, 1.48)
    display(-1.05, 1.79, -0.13, 1.64, 1.21, 10)
    for x, y in ((0.32, 1.23), (1.27, 1.23), (1.27, 1.74)):
        box(x, y, 0, 0.83, 0.47, 0.71, "bb9875")
        box(x, y, 0.365, 0.46, 0.18, 0.015, cream)
        for j in range(12):
            box(
                x - 0.19 + j * 0.033,
                y,
                0.381,
                0.009 + (j % 3) * 0.004,
                0.135,
                0.013,
                black,
            )
    tube((-0.02, 1.04, 0.54), (0.06, 1.34, 0.42), 0.07, slate)
    box(0.08, 1.37, 0.40, 0.28, 0.16, 0.25, dark)


def andon():
    desk(0.70, 0.79, -0.10, 2.65, 1.15)
    display(0.75, 1.65, -0.22, 1.99, 1.31, 11)
    box(-1.44, 0.14, 0, 0.91, 0.25, 0.83, slate)
    box(-1.44, 1.05, 0, 0.15, 1.75, 0.15, steel)
    box(-1.44, 1.51, 0, 0.67, 0.83, 0.43, cream)
    for i, c in enumerate((green, gold, "b95246")):
        disc(-1.44, 1.25 + i * 0.23, 0.249, 0.079, 0.072, c)
    tube((-1.44, 1.91, 0), (-1.44, 2.25, 0), 0.047, steel)
    for j, c in enumerate((green, gold, "b95246")):
        tube((-1.44, 2.25 + 0.19 * j, 0), (-1.44, 2.41 + 0.19 * j, 0), 0.144, c, n=20)


def endpoint():
    desk(0, 0.84, 0, 3.81, 1.30)
    display(0.68, 1.64, -0.13, 1.97, 1.22, 12)
    box(-1.05, 1.46, -0.02, 0.64, 1.12, 0.83, dark)
    for j in range(9):
        box(-1.05, 1.05 + 0.066 * j, 0.406, 0.44, 0.029, 0.019, slate)
    disc(-0.94, 1.86, 0.407, 0.038, 0.024, green)
    for i in range(2):
        box(-1.18 + i * 0.13, 1.73, 0.407, 0.089, 0.043, 0.03, steel)
    box(0.59, 0.96, 0.39, 1.04, 0.085, 0.37, slate)


def handover():
    desk(0, 0.87, 0, 3.78, 1.43)
    box(-0.90, 1.05, 0.04, 1.36, 0.25, 0.98, dark)
    screen(-0.90, 1.74, -0.38, 1.35, 1.25, 13)
    for j in range(3):
        box(
            0.45 + j * 0.32,
            1.41,
            -0.23,
            0.27,
            0.96,
            0.57,
            ("497c87", "b08f62", "709189")[j],
        )
        box(0.45 + j * 0.32, 1.56, 0.068, 0.18, 0.33, 0.021, cream)
        disc(0.45 + j * 0.32, 1.15, 0.07, 0.043, 0.027, dark)
    box(1.51, 1.01, 0.35, 0.35, 0.14, 0.49, gold)
    wire([(1.52, 1.02, 0.12), (1.67, 1.02, -0.16), (1.67, 0.98, -0.40)], 0.024, blue)


def video_wall():
    # Seams and rear cabinet profiles remain visible around the shared image.
    for x in (-1.69, 1.69):
        box(x, 0.13, 0, 0.69, 0.21, 0.80, slate)
        box(x, 1.52, -0.25, 0.13, 2.77, 0.21, steel)
    screen(0, 1.94, 0, 4.48, 2.19, 14)
    for x in (-0.735, 0.735):
        box(x, 1.94, 0.070, 0.025, 2.04, 0.02, black)
    box(0, 1.94, 0.070, 4.24, 0.027, 0.02, black)
    for x in (-1.47, 0, 1.47):
        for y in (1.49, 2.46):
            box(x, y, -0.18, 1.38, 0.85, 0.17, slate)


def power_monitor():
    rack(-0.65, 0, 1.76, 2.74)
    for y in (0.57, 1.10):
        box(-0.65, y, 0.02, 1.63, 0.44, 0.83, dark)
        for x in (-1.19, -0.65, -0.11):
            box(x, y, 0.46, 0.45, 0.32, 0.035, slate)
            box(x, y, 0.49, 0.23, 0.045, 0.027, steel)
    server(-0.65, 1.64, 0)
    box(-0.65, 2.08, 0, 1.67, 0.35, 0.86, dark)
    ports(-0.65, 2.08, 0.45, 9, 0.155)
    desk(1.17, 0.93, 0, 1.60, 1.17)
    display(1.17, 1.69, -0.10, 1.43, 1.08, 15)


builders = (
    cctv,
    access,
    turnstile,
    vision,
    cabling,
    data_centre,
    server_sled,
    integration,
    service_bench,
    apps,
    erp,
    andon,
    endpoint,
    handover,
    video_wall,
    power_monitor,
)
for i, build in enumerate(builders, 1):
    build()
    export_part(f"Exhibit{i:02}")
inspection_carrier()
export_part("InspectionCarrier")
write_glb(Path.cwd() / "public/assets/it/exhibits.glb")
