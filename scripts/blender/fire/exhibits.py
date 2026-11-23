"""Run from the repository root with blender -b -P scripts/blender/fire/exhibits.py."""

import math
import sys
import subprocess
from pathlib import Path

import bpy

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "electrical"))
from exhibits import (
    box,
    loft,
    tube,
    wire,
    plate,
    export_part,
    write_glb,
    materials,
    print_face,
    metal,
    paint,
    rubber,
    atlas,
)

subprocess.run(
    ["python3", str(Path(__file__).with_name("faceplates.py")), str(atlas)], check=True
)
texture = next(
    n for n in materials[print_face].node_tree.nodes if n.type == "TEX_IMAGE"
)
texture.image.reload()

red, vermilion, charcoal, grey = "a93e35", "d65240", "33414b", "869394"
steel, brass, cream, amber, teal = "b9c4be", "c99d57", "e4dfce", "e9ab55", "30717a"


def disc(x, y, z, r, depth, color, material=metal, n=28):
    tube((x, y, z - depth / 2), (x, y, z + depth / 2), r, color, material, n=n)


def torus(x, y, z, r, t, color):
    # All visible wheel rims, hose turns and valve seats face the visitor.
    rings = []
    for i in range(41):
        a = i * math.tau / 40
        rings.append(
            [
                (
                    x + (r + t * math.cos(b)) * math.cos(a),
                    y + (r + t * math.cos(b)) * math.sin(a),
                    z - t * math.sin(b),
                )
                for b in (j * math.tau / 8 for j in range(8))
            ]
        )
    loft(rings, color, paint)


def wheel(x, y, z, r):
    torus(x, y, z, r, 0.032, vermilion)
    for i in range(5):
        a = i * math.tau / 5
        tube((x, y, z), (x + r * math.cos(a), y + r * math.sin(a), z), 0.025, red)
    disc(x, y, z, 0.066, 0.09, brass)


def gauge(x, y, z, r=0.21):
    disc(x, y, z, r, 0.12, steel)
    disc(x, y, z + 0.065, r * 0.91, 0.018, cream, paint)
    for i in range(9):
        a = math.pi * (1.18 - i * 0.17)
        tube(
            (x + r * 0.70 * math.cos(a), y + r * 0.70 * math.sin(a), z + 0.081),
            (x + r * 0.85 * math.cos(a), y + r * 0.85 * math.sin(a), z + 0.081),
            0.010,
            charcoal,
            n=5,
        )
    tube((x, y, z + 0.085), (x + r * 0.48, y + r * 0.48, z + 0.085), 0.017, red, n=6)


def tag(x, y, z, w, h, index):
    box(x, y, z, w + 0.06, h + 0.06, 0.05, charcoal)
    plate(x, y, z + 0.028, w, h, index)


def panel(x, y, z, w=1.24):
    box(x, y, z, w, 1.49, 0.31, red)
    tag(x, y + 0.22, z + 0.18, w * 0.80, 0.66, 1)
    for i, c in enumerate((teal, amber, cream)):
        disc(x - 0.35 + i * 0.24, y - 0.40, z + 0.17, 0.051, 0.05, c, paint)
    box(x + w * 0.40, y - 0.34, z + 0.19, 0.053, 0.26, 0.05, steel)


def detector(x, y, z, r=0.30):
    for dy, rad, depth, c in [
        (0, r, 0.105, cream),
        (-0.09, r * 0.86, 0.095, charcoal),
        (-0.16, r * 0.78, 0.09, cream),
    ]:
        tube(
            (x, y + dy - depth / 2, z), (x, y + dy + depth / 2, z), rad, c, paint, n=24
        )
    for i in range(12):
        a = i * math.tau / 12
        tube(
            (x + r * 0.8 * math.cos(a), y - 0.12, z + r * 0.8 * math.sin(a)),
            (x + r * 0.91 * math.cos(a), y - 0.04, z + r * 0.91 * math.sin(a)),
            0.023,
            cream,
            n=6,
        )


def cylinder(x, z, r, height, color, base=0):
    tube(
        (x, base + 0.012, z),
        (x, base + 0.15, z),
        r * 0.85,
        charcoal,
        rubber,
        r2=r,
        n=32,
    )
    tube((x, base + 0.15, z), (x, height - 0.30, z), r, color, paint, n=36)
    tube(
        (x, height - 0.30, z), (x, height - 0.12, z), r, color, paint, r2=r * 0.80, n=36
    )
    tube(
        (x, height - 0.12, z), (x, height, z), r * 0.80, color, paint, r2=r * 0.25, n=36
    )
    tube((x, height, z), (x, height + 0.17, z), r * 0.25, brass, n=12)


def stand(x, y, z, w, d):
    box(x, y, z, w, 0.13, d, grey, metal)
    for dx in (-w * 0.42, w * 0.42):
        for dz in (-d * 0.36, d * 0.36):
            box(x + dx, y / 2, z + dz, 0.10, y, 0.10, charcoal)


def flange_y(x, y, z, r):
    tube((x, y - 0.055, z), (x, y + 0.055, z), r, red, n=28)
    for i in range(8):
        a = i * math.tau / 8
        tube(
            (x + r * 0.78 * math.cos(a), y + 0.055, z + r * 0.78 * math.sin(a)),
            (x + r * 0.78 * math.cos(a), y + 0.11, z + r * 0.78 * math.sin(a)),
            0.035,
            steel,
            n=6,
        )


def design():
    # A small section model and the associated detection drawing share the review table.
    stand(0, 0.87, 0, 4.9, 1.95)
    box(-1.03, 1.81, -0.67, 2.35, 1.77, 0.11, steel)
    tag(-1.03, 1.81, -0.59, 2.16, 1.55, 0)
    box(1.16, 0.99, 0.03, 2.03, 0.10, 1.47, cream)
    for x in (0.23, 1.20, 2.09):
        box(x, 1.32, -0.06, 0.10, 0.60, 1.20, cream)
    box(1.16, 1.32, -0.61, 1.94, 0.60, 0.10, cream)
    wire([(0.33, 1.63, -0.44), (1.93, 1.63, -0.44), (1.93, 1.63, 0.33)], 0.037, red)
    for x in (0.54, 1.56):
        detector(x, 1.61, -0.43, 0.13)


def alarm():
    box(0, 1.46, -0.41, 3.82, 2.74, 0.14, "879994")
    panel(-0.89, 1.51, -0.15, 1.57)
    wire(
        [
            (-0.90, 2.24, -0.27),
            (-0.90, 2.59, -0.27),
            (1.25, 2.59, -0.27),
            (1.25, 1.73, -0.27),
        ],
        0.048,
        steel,
    )
    box(1.25, 1.65, -0.14, 0.59, 0.70, 0.21, red)
    box(1.25, 1.70, -0.021, 0.42, 0.24, 0.034, cream)
    box(0.62, 2.31, -0.16, 0.44, 0.48, 0.20, red)
    for i in range(4):
        box(0.62, 2.21 + i * 0.075, -0.05, 0.29, 0.024, 0.022, charcoal)
    box(0.62, 2.51, -0.02, 0.35, 0.10, 0.09, cream)


def deluge():
    box(0, 0.13, 0, 3.9, 0.23, 1.65, grey)
    tube((-0.50, 0.24, 0), (-0.50, 2.74, 0), 0.22, red)
    for y in (0.43, 1.02, 1.83, 2.54):
        flange_y(-0.5, y, 0, 0.34)
    disc(-0.50, 1.43, 0.15, 0.56, 0.48, red)
    disc(-0.50, 1.43, 0.43, 0.42, 0.12, vermilion)
    for i in range(8):
        a = i * math.tau / 8
        disc(
            -0.5 + 0.34 * math.cos(a),
            1.43 + 0.34 * math.sin(a),
            0.51,
            0.044,
            0.06,
            steel,
            n=6,
        )
    wire(
        [
            (-0.72, 0.83, 0.16),
            (-1.43, 0.83, 0.16),
            (-1.43, 2.20, 0.16),
            (-0.71, 2.20, 0.16),
        ],
        0.041,
        brass,
    )
    wire([(-0.29, 0.81, 0.08), (0.91, 0.81, 0.08), (0.91, 1.78, 0.08)], 0.051, brass)
    gauge(0.91, 1.98, 0.08, 0.25)
    wheel(-1.43, 1.49, 0.25, 0.19)


def foam():
    tube((-1.71, 1.33, 0), (1.55, 1.33, 0), 0.77, red, paint, n=40)
    for x, edge in ((-1.71, -1.98), (1.55, 1.82)):
        tube((x, 1.33, 0), (edge, 1.33, 0), 0.77, vermilion, paint, r2=0.45, n=40)
    for x in (-1.18, 1.05):
        box(x, 0.31, 0, 0.45, 0.57, 1.34, grey)
        tube((x - 0.045, 1.33, 0), (x + 0.045, 1.33, 0), 0.79, red, n=40)
    wire(
        [
            (-1.65, 1.33, -0.18),
            (-1.99, 1.33, -0.18),
            (-1.99, 2.52, -0.18),
            (1.55, 2.52, -0.18),
            (1.55, 1.91, -0.18),
        ],
        0.087,
        red,
    )
    tube((-0.14, 2.52, -0.18), (0.63, 2.52, -0.18), 0.15, brass, n=18)
    tag(0.08, 1.33, 0.786, 0.89, 0.52, 3)


def sprinkler():
    # Enlarged pendent head beside a branch-line installation.
    for x in (-1.88, 1.97):
        box(x, 1.40, -0.45, 0.13, 2.76, 0.15, steel)
    tube((-2.09, 2.78, -0.45), (2.20, 2.78, -0.45), 0.13, red)
    for x, s in ((-1.15, 0.52), (0.03, 0.52), (1.21, 1.16)):

        def head(y):
            return 2.65 - y * s

        tube((x, head(0), -0.45), (x, head(0.26), -0.45), 0.14 * s, brass, n=6)
        for side in (-1, 1):
            wire(
                [
                    (x + side * 0.11 * s, head(0.23), -0.45),
                    (x + side * 0.29 * s, head(0.48), -0.45),
                    (x + side * 0.23 * s, head(0.91), -0.45),
                    (x, head(1.07), -0.45),
                ],
                0.051 * s,
                brass,
            )
        tube(
            (x, head(0.27), -0.45),
            (x, head(0.94), -0.45),
            0.060 * s,
            vermilion,
            paint,
            r2=0.040 * s,
        )
        tube((x, head(1.12), -0.45), (x, head(1.17), -0.45), 0.22 * s, brass, n=22)
        for i in range(12):
            a = i * math.tau / 12
            tube(
                (
                    x + 0.19 * s * math.cos(a),
                    head(1.15),
                    -0.45 + 0.19 * s * math.sin(a),
                ),
                (
                    x + 0.34 * s * math.cos(a),
                    head(1.20),
                    -0.45 + 0.34 * s * math.sin(a),
                ),
                0.025 * s,
                brass,
                n=6,
            )


def agent_bank():
    for x in (-1.05, 0, 1.05):
        cylinder(x, 0, 0.38, 2.12, red)
        for y in (0.71, 1.54):
            tube((x, y, 0), (x, y + 0.075, 0), 0.389, steel, n=32)
        tag(x, 1.16, 0.386, 0.41, 0.45, 5)
        wire(
            [
                (x, 2.26, 0),
                (x, 2.48, 0.04),
                (x + 0.22, 2.68, -0.14),
                (x + 0.22, 2.73, -0.38),
            ],
            0.052,
            charcoal,
        )
    tube((-1.49, 2.73, -0.38), (1.56, 2.73, -0.38), 0.096, red)
    for x in (-1.53, 1.54):
        box(x, 1.46, -0.42, 0.11, 2.88, 0.12, charcoal)
    for y in (0.75, 1.58):
        box(0, y, -0.42, 3.19, 0.09, 0.14, steel)


def fire_pump():
    box(0, 0.18, 0, 4.96, 0.27, 1.85, charcoal)
    for x in (-1.52, -0.67, 0.98):
        box(x, 0.47, 0, 0.42, 0.34, 0.90, red)
    tube((-2.13, 1.02, 0), (-0.51, 1.02, 0), 0.46, teal, paint, n=32)
    for i in range(10):
        a = i * math.tau / 10
        tube(
            (-1.98, 1.02 + 0.46 * math.cos(a), 0.46 * math.sin(a)),
            (-0.66, 1.02 + 0.46 * math.cos(a), 0.46 * math.sin(a)),
            0.044,
            teal,
            n=8,
        )
    box(-1.22, 1.59, 0, 0.57, 0.29, 0.49, teal)
    tube((-0.52, 1.02, 0), (0.34, 1.02, 0), 0.24, amber, paint, n=20)
    tube((0.38, 1.03, 0), (1.49, 1.03, 0), 0.57, red, paint, n=32)
    box(0.94, 1.03, 0, 1.22, 0.13, 1.25, red)
    for x in (0.47, 0.76, 1.05, 1.35):
        for z in (-0.52, 0.52):
            tube((x, 1.10, z), (x, 1.18, z), 0.052, steel, n=6)
    tube((1.08, 1.19, -0.19), (1.08, 2.02, -0.19), 0.23, red)
    flange_y(1.08, 2.01, -0.19, 0.33)
    disc(0.85, 1.03, 0.56, 0.27, 0.44, red)
    disc(0.85, 1.03, 0.80, 0.36, 0.095, red)
    gauge(1.54, 1.79, 0.13, 0.19)
    tube((1.49, 1.12, 0), (1.54, 1.64, 0.13), 0.033, brass)


def hydrant():
    tube((-1.35, 0.10, 0), (-1.35, 1.70, 0), 0.32, red, n=28)
    for y in (0.15, 1.48, 1.71):
        flange_y(-1.35, y, 0, 0.40)
    tube((-1.35, 1.72, 0), (-1.35, 1.96, 0), 0.38, vermilion, r2=0.14, n=24)
    disc(-1.35, 1.14, 0.36, 0.23, 0.47, red)
    disc(-1.35, 1.14, 0.62, 0.26, 0.10, brass, n=8)
    for side in (-1, 1):
        tube((-1.35 + side * 0.22, 1.36, 0), (-1.35 + side * 0.65, 1.36, 0), 0.17, red)
        tube(
            (-1.35 + side * 0.59, 1.36, 0),
            (-1.35 + side * 0.71, 1.36, 0),
            0.21,
            brass,
            n=8,
        )
    box(1.03, 1.29, -0.47, 1.99, 2.48, 0.16, cream)
    disc(1.03, 1.46, -0.22, 0.81, 0.16, red)
    for i in range(6):
        torus(1.03, 1.46, -0.02, 0.21 + i * 0.105, 0.061, charcoal)
    disc(1.03, 1.46, 0.08, 0.18, 0.13, vermilion)
    wire(
        [
            (1.81, 1.43, -0.02),
            (1.81, 0.65, 0.0),
            (1.56, 0.41, 0.08),
            (1.27, 0.56, 0.15),
        ],
        0.063,
        charcoal,
    )
    tube((1.27, 0.56, 0.15), (1.06, 0.83, 0.15), 0.079, brass, r2=0.05)


def commissioning():
    stand(-0.87, 0.98, 0, 2.65, 1.30)
    box(-0.87, 1.08, 0, 1.48, 0.09, 0.83, charcoal)
    tag(-0.87, 1.58, -0.36, 1.37, 0.85, 8)
    # A telescoping detector tester ends in the open rim of its test cup.
    box(1.23, 0.15, 0, 0.87, 0.22, 0.80, grey)
    for lo, hi, r in ((0.25, 1.22, 0.092), (1.22, 2.05, 0.064), (2.05, 2.47, 0.045)):
        tube((1.23, lo, 0), (1.23, hi, 0), r, steel)
    tube((1.23, 2.45, 0), (1.23, 2.69, 0), 0.095, vermilion, r2=0.27)
    for i in range(24):
        a, b = i * math.tau / 24, (i + 1) * math.tau / 24
        tube(
            (1.23 + 0.26 * math.cos(a), 2.72, 0.26 * math.sin(a)),
            (1.23 + 0.26 * math.cos(b), 2.72, 0.26 * math.sin(b)),
            0.044,
            red,
            n=8,
        )
    box(1.23, 3.27, 0, 1.21, 0.10, 0.89, cream)
    detector(1.23, 3.20, 0)


def inspection():
    tube((-1.68, 0.80, 0), (1.64, 0.80, 0), 0.22, red)
    for x in (-1.12, 0.90):
        box(x, 0.31, 0, 0.29, 0.57, 0.55, charcoal)
    disc(-0.49, 0.85, 0.03, 0.38, 0.48, red)
    tube((-0.49, 1.09, 0), (-0.49, 1.47, 0), 0.23, red, r2=0.14)
    for side in (-1, 1):
        wire(
            [
                (-0.49 + side * 0.19, 1.34, 0),
                (-0.49 + side * 0.24, 1.72, 0),
                (-0.49 + side * 0.14, 2.02, 0),
            ],
            0.047,
            red,
        )
    tube((-0.49, 1.44, 0), (-0.49, 2.35, 0), 0.052, brass)
    # Horizontal handwheel on the rising-stem gate valve.
    for i in range(32):
        a, b = i * math.tau / 32, (i + 1) * math.tau / 32
        tube(
            (-0.49 + 0.40 * math.cos(a), 2.06, 0.40 * math.sin(a)),
            (-0.49 + 0.40 * math.cos(b), 2.06, 0.40 * math.sin(b)),
            0.037,
            red,
        )
    for a in (0, 2.094, 4.188):
        tube(
            (-0.49, 2.06, 0),
            (-0.49 + 0.4 * math.cos(a), 2.06, 0.4 * math.sin(a)),
            0.036,
            red,
        )
    tube((0.93, 1.01, 0), (0.93, 1.62, 0), 0.055, brass)
    gauge(0.93, 1.84, 0, 0.24)
    wire([(-0.27, 1.69, 0.05), (0.01, 1.57, 0.14), (0.12, 1.39, 0.21)], 0.017, steel)
    tag(0.16, 1.22, 0.22, 0.33, 0.39, 9)


def maintenance():
    stand(0, 0.78, 0, 4.70, 1.39)
    # Sectioned swing check valve, with disc, hinge and bonnet displayed separately.
    for x in (-1.79, -0.34):
        disc(x, 1.46, 0, 0.48, 0.21, red)
    box(-1.05, 1.12, -0.05, 1.63, 0.37, 0.64, red)
    box(-1.05, 1.49, -0.31, 1.50, 0.67, 0.15, red)
    disc(-1.06, 1.46, 0.03, 0.34, 0.12, brass)
    tube((-1.06, 1.47, 0.10), (-0.89, 1.91, 0.10), 0.066, steel)
    tube((-1.09, 1.91, 0.10), (-0.69, 1.91, 0.10), 0.064, steel)
    torus(0.51, 1.30, 0.04, 0.40, 0.055, charcoal)
    disc(1.58, 1.38, 0.06, 0.50, 0.10, vermilion)
    for i in range(6):
        a = i * math.tau / 6
        disc(
            1.58 + 0.39 * math.cos(a),
            1.38 + 0.39 * math.sin(a),
            0.134,
            0.045,
            0.045,
            steel,
            n=6,
        )


def schedule():
    # Numbered inspection records sit beside physical asset tags in a workshop rack.
    box(-0.24, 1.55, -0.28, 3.55, 2.57, 0.17, grey)
    for x in (-1.72, 1.28):
        box(x, 0.33, -0.27, 0.13, 0.65, 0.62, charcoal)
    tag(-0.83, 1.68, -0.16, 1.97, 1.72, 11)
    for i in range(3):
        y = 0.95 + i * 0.59
        box(0.86, y, -0.13, 0.89, 0.42, 0.075, cream)
        box(0.48, y, -0.08, 0.066, 0.35, 0.025, (teal, amber, red)[i])
        disc(0.67, y, -0.066, 0.037, 0.03, grey)
        for j in (-1, 1):
            box(0.97, y + j * 0.048, -0.079, 0.32, 0.018, 0.013, grey)


def support_cart():
    for y in (0.36, 1.42):
        box(0, y, 0, 2.88, 0.15, 1.31, red)
    for x in (-1.29, 1.29):
        for z in (-0.52, 0.52):
            box(x, 0.90, z, 0.09, 1.04, 0.09, steel)
            disc(x, 0.18, z, 0.16, 0.12, charcoal)
    wire(
        [
            (1.29, 1.42, -0.52),
            (1.40, 1.81, -0.52),
            (1.40, 1.81, 0.52),
            (1.29, 1.42, 0.52),
        ],
        0.055,
        steel,
    )
    box(-0.50, 1.79, 0, 1.29, 0.59, 0.83, charcoal)
    wire(
        [(-0.79, 2.07, 0), (-0.79, 2.25, 0), (-0.24, 2.25, 0), (-0.24, 2.07, 0)],
        0.050,
        charcoal,
    )
    tag(-0.50, 1.79, 0.43, 0.79, 0.35, 12)
    for x in (0.49, 0.96):
        disc(x, 1.69, 0.03, 0.20, 0.34, brass, n=12)
    box(-0.1, 0.64, -0.04, 1.77, 0.37, 0.84, cream)
    for x in (-0.69, 0.51):
        box(x, 0.66, 0.39, 0.080, 0.37, 0.044, grey)


def extinguishers():
    stand(0.95, 0.28, 0, 1.44, 1.32)
    for x, r, h in ((-1.03, 0.31, 1.68), (0.97, 0.28, 2.03)):
        y = 0.36 if x > 0 else 0
        cylinder(x, 0, r, h + y, red, y)
        box(x + 0.11, h + y + 0.18, 0, 0.46, 0.067, 0.13, charcoal)
        tube((x - 0.09, h + y + 0.30, 0), (x + 0.32, h + y + 0.19, 0), 0.043, steel)
        tag(x, 1.04 + y, r + 0.01, 0.28, 0.39, 13)
        wire(
            [
                (x - 0.1, h + y + 0.06, 0),
                (x - 0.39, h + y - 0.12, 0.02),
                (x - 0.42, h + y - 0.62, 0.1),
            ],
            0.047,
            charcoal,
        )
        if x > 0:
            tube(
                (x - 0.42, h + y - 0.62, 0.1),
                (x - 0.50, h + y - 1.04, 0.11),
                0.064,
                charcoal,
                r2=0.16,
            )
        else:
            tube(
                (x - 0.42, h + y - 0.62, 0.1),
                (x - 0.45, h + y - 0.84, 0.12),
                0.056,
                brass,
                r2=0.039,
            )
    box(1.68, 0.35, 0.41, 0.065, 0.50, 0.07, steel)
    tag(1.68, 0.60, 0.41, 0.51, 0.31, 13)


def supply():
    stand(0, 0.64, 0, 4.43, 1.33)
    for j, (x, r) in enumerate(((-1.24, 0.58), (0.10, 0.51))):
        disc(x, 0.72 + r, 0, r, 0.49, ("cfad76", "c59165")[j], paint, n=36)
        for i in range(7):
            torus(x, 0.72 + r, 0.26, 0.09 + i * r / 8, 0.020, cream)
        disc(x, 0.72 + r, 0.29, 0.083, 0.04, charcoal)
    tube((1.13, 0.85, 0), (1.64, 1.46, 0), 0.145, brass, r2=0.077)
    tube((1.10, 0.83, 0), (1.26, 1.02, 0), 0.19, steel, n=10)
    wheel(1.39, 1.15, 0.17, 0.13)


def project():
    # Representative field installation; the client's actual floor plan is not used.
    for x in (-1.85, 1.85):
        box(x, 1.44, -0.46, 0.12, 2.87, 0.27, steel)
    box(0, 2.92, -0.23, 4.05, 0.17, 1.08, cream)
    detector(-0.43, 2.82, 0.09, 0.35)
    wire(
        [
            (-1.73, 1.44, -0.32),
            (-1.73, 2.74, -0.32),
            (1.63, 2.74, -0.32),
            (1.63, 2.13, -0.32),
        ],
        0.044,
        steel,
    )
    box(-1.70, 1.28, -0.23, 0.46, 0.52, 0.23, red)
    box(-1.70, 1.33, -0.10, 0.33, 0.17, 0.024, cream)
    box(1.63, 2.04, -0.20, 0.43, 0.53, 0.20, red)
    disc(1.63, 2.13, -0.085, 0.14, 0.072, cream, paint)
    for i in range(3):
        box(1.63, 1.96 - i * 0.042, -0.09, 0.27, 0.018, 0.02, charcoal)
    tag(0.67, 2.53, -0.32, 0.66, 0.38, 15)


builders = (
    design,
    alarm,
    deluge,
    foam,
    sprinkler,
    agent_bank,
    fire_pump,
    hydrant,
    commissioning,
    inspection,
    maintenance,
    schedule,
    support_cart,
    extinguishers,
    supply,
    project,
)
for number, build in enumerate(builders, 1):
    build()
    export_part(f"Exhibit{number:02}")
write_glb(Path.cwd() / "public/assets/fire/exhibits.glb")
