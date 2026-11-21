"""Mechanical gallery, in metres. Run from project root with blender -b -P."""

import math
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "electrical"))
from exhibits import (
    box,
    tube,
    wire,
    loft,
    vertex,
    polygon,
    export_part,
    write_glb,
    metal,
    paint,
)

teal, navy, silver, dark = "267a78", "304852", "b5c3c2", "29373a"
bronze, cream, safety, blue = "ad8053", "d8d7c7", "e8ad47", "438399"


def rail(x, y, z, w, h, d):
    box(x, y, z, w, h, d, navy)


def base(length, depth):
    for z in [-depth / 2, depth / 2]:
        rail(0, 0.13, z, length, 0.24, 0.16)
    for x in [-length * 0.44, 0, length * 0.44]:
        rail(x, 0.13, 0, 0.14, 0.24, depth)
        for z in [-depth / 2, depth / 2]:
            anchor(x, z)


def anchor(x, z):
    box(x, 0.075, z, 0.40, 0.12, 0.35, silver, metal)
    for dx in [-0.13, 0.13]:
        tube((x + dx, 0.13, z), (x + dx, 0.19, z), 0.043, dark, n=6)


def cylinder_x(x, y, z, length, radius, color):
    tube((x - length / 2, y, z), (x + length / 2, y, z), radius, color, n=32)


def flange(x, y, z, r):
    cylinder_x(x, y, z, 0.10, r, silver)
    for i in range(8):
        a = i * math.pi / 4
        tube(
            (x - 0.07, y + 0.82 * r * math.cos(a), z + 0.82 * r * math.sin(a)),
            (x + 0.07, y + 0.82 * r * math.cos(a), z + 0.82 * r * math.sin(a)),
            0.034,
            dark,
            n=6,
        )


def dial(x, y, z, r=0.19):
    tube((x, y, z), (x, y, z + 0.11), r, navy, n=24)
    tube((x, y, z + 0.11), (x, y, z + 0.12), r * 0.85, cream, n=24)
    tube((x, y, z + 0.13), (x + r * 0.49, y + r * 0.36, z + 0.13), 0.013, dark)
    for i in range(7):
        a = (i - 1) * math.pi / 4
        tube(
            (x + 0.66 * r * math.cos(a), y + 0.66 * r * math.sin(a), z + 0.13),
            (x + 0.77 * r * math.cos(a), y + 0.77 * r * math.sin(a), z + 0.13),
            0.008,
            dark,
        )


def motor(x, y, z, length, r):
    cylinder_x(x, y, z, length, r, teal)
    for i in range(16):
        a = i * math.pi / 8
        cylinder_x(
            x, y + r * math.cos(a), z + r * math.sin(a), length * 0.77, 0.038, teal
        )
    cylinder_x(x - length * 0.46, y, z, length * 0.16, r * 1.04, navy)
    rail(x, y - r - 0.10, z, length * 0.8, 0.22, r * 1.7)
    box(x, y + r + 0.1, z, 0.38, 0.23, 0.32, teal)


def fan(x, y, z, r):
    tube((x, y, z - 0.18), (x, y, z + 0.18), r * 0.22, silver, n=20)
    for i in range(7):
        a = i * 2 * math.pi / 7
        rows = []
        for rad, sweep, w in [(0.15, 0, 0.10), (0.55, 0.15, 0.23), (0.94, 0.36, 0.18)]:
            t = a + sweep
            rows.append(
                [
                    (
                        x + r * (rad * math.cos(t) - u * math.sin(t)),
                        y + r * (rad * math.sin(t) + u * math.cos(t)),
                        z + v * r,
                    )
                    for u, v in [(-w, -0.06), (w, 0.04), (w, 0.09), (-w, -0.01)]
                ]
            )
        loft(rows, silver, metal)


def tower():
    base(4.7, 2.2)
    box(0, 0.46, 0, 4.6, 0.48, 2.4, teal)
    for x in [-2.1, 0, 2.1]:
        for z in [-1, 1]:
            rail(x, 1.65, z, 0.12, 2.4, 0.12)
    box(0, 2.86, 0, 4.5, 0.22, 2.25, silver)
    for x in [-1, 1]:
        tube((x, 2.96, 0), (x, 3.24, 0), 0.85, silver, r2=0.68, n=32)
        tube((x, 3.24, 0), (x, 3.26, 0), 0.60, dark, n=32)
    # A shallow corrugated face on the exposed fill pack and inclined intake louvers.
    box(-1.05, 1.55, -0.1, 1.92, 1.40, 1.52, navy)
    fill = []
    for row in range(15):
        fill.append(
            [
                vertex(
                    (
                        -2.01 + col * 0.048,
                        0.85 + row * 0.1,
                        0.68 + 0.08 * ((col + row) % 2),
                    ),
                    "708a90",
                )
                for col in range(41)
            ]
        )
    for lower, upper in zip(fill, fill[1:]):
        for col in range(40):
            polygon([lower[col], lower[col + 1], upper[col + 1]], metal)
            polygon([lower[col], upper[col + 1], upper[col]], metal)
    for i in range(10):
        y = 0.87 + i * 0.16
        loft(
            [
                [
                    (x, y + 0.10, 0.82),
                    (x, y, 1.07),
                    (x, y + 0.028, 1.08),
                    (x, y + 0.129, 0.83),
                ]
                for x in [0.13, 2.03]
            ],
            silver,
            metal,
        )
    # Service ladder on the side and access-cover latches on the front basin.
    for z in [-0.34, 0.32]:
        tube((2.27, 0.41, z), (2.27, 3.02, z), 0.039, silver)
    for i in range(9):
        tube(
            (2.27, 0.54 + i * 0.28, -0.34), (2.27, 0.54 + i * 0.28, 0.32), 0.03, silver
        )
    for x in [-1.92, -1, -0.05, 1.04, 1.93]:
        box(x, 0.50, 1.216, 0.15, 0.11, 0.033, silver, metal)
    cylinder_x(0, 2.56, 0.12, 4, 0.095, blue)
    for i in range(9):
        x = -1.8 + i * 0.45
        tube((x, 2.55, 0.12), (x, 2.39, 0.12), 0.038, bronze, r2=0.07)


def retrofit():
    base(5, 1.9)
    rail(-1.25, 1.18, 0, 0.19, 2, 0.2)
    cylinder_x(-1.3, 1, 0, 1.3, 0.24, navy)
    fan(-1.23, 1.63, 0.27, 1.32)
    for x in [0.65, 1.66]:
        rail(x, 0.53, 0, 0.08, 0.7, 1.5)
        for i in range(13):
            box(x, 1.20, -0.72 + i * 0.12, 0.92, 1.55, 0.047, teal if x < 1 else silver)
    for z in [-0.8, 0.8]:
        rail(1.13, 1.99, z, 2.13, 0.06, 0.08)


def ahu():
    base(5.35, 1.8)
    box(0, 1.55, -0.84, 5.2, 2.55, 0.12, cream)
    for y in [0.39, 2.7]:
        box(0, y, 0, 5.3, 0.15, 1.85, silver)
    for x in [-2.57, -1.15, 0.45, 2.57]:
        rail(x, 1.53, 0.86, 0.10, 2.3, 0.1)
    for i in range(10):
        x = -2.43 + i * 0.122
        box(x, 1.52, 0.13, 0.068, 1.86, 1.1, cream)
    for i in range(15):
        box(-0.98 + i * 0.093, 1.52, 0, 0.043, 1.92, 1.45, bronze)
    for y in [0.75, 2.29]:
        cylinder_x(-0.36, y, 0.78, 1.32, 0.064, bronze)
    # The supply fan rotates separately inside the fixed inlet ring.
    for i in range(48):
        a = i * math.tau / 48
        b = (i + 1) * math.tau / 48
        tube(
            (1.49 + 0.97 * math.cos(a), 1.51 + 0.97 * math.sin(a), 0.48),
            (1.49 + 0.97 * math.cos(b), 1.51 + 0.97 * math.sin(b), 0.48),
            0.047,
            silver,
            n=8,
        )
    for x in [0.85, 2.15]:
        rail(x, 0.62, 0.13, 0.12, 0.41, 0.42)


def heater():
    base(5.6, 1.65)
    for x in [-1.65, 0.30]:
        rail(x, 0.74, 0, 0.29, 0.97, 1.24)
    cylinder_x(-0.69, 1.47, 0, 3.45, 0.77, silver)
    for x in [-2.42, 1.04]:
        flange(x, 1.47, 0, 0.85)
    for x in [-1.73, 0.43]:
        tube((x, 2.12, 0), (x, 2.58, 0), 0.19, teal)
        tube((x, 2.54, 0), (x, 2.64, 0), 0.28, silver)
    for i in range(12):
        a = i * math.pi / 6
        y = 1.47 + 0.46 * math.cos(a)
        z = 0.46 * math.sin(a)
        wire(
            [
                (1.08, y, z),
                (2.49, y, z),
                (2.62, y - 0.055, z),
                (2.49, y - 0.13, z),
                (1.08, y - 0.13, z),
            ],
            0.039,
            bronze,
        )
    dial(-1.23, 1.63, 0.73)


def compressor():
    base(5.1, 1.85)
    for x in [-0.56, 1.36]:
        rail(x, 0.45, 0.11, 0.20, 0.48, 1.15)
    cylinder_x(0.45, 1.02, 0.12, 3.51, 0.62, blue)
    for x, sign in [(-1.30, -1), (2.2, 1)]:
        tube((x, 1.02, 0.12), (x + sign * 0.18, 1.02, 0.12), 0.62, blue, r2=0.39, n=30)
    box(-1.53, 1.55, -0.38, 1.68, 2.5, 1.22, teal)
    for i in range(9):
        box(-1.52, 0.76 + i * 0.16, 0.26, 1.32, 0.055, 0.05, dark)
    motor(0.28, 1.97, 0.07, 1.03, 0.26)
    box(1.12, 1.9, 0, 0.54, 0.58, 0.62, navy)
    wire(
        [(1.14, 2.19, 0), (1.4, 2.43, 0), (1.79, 2.43, 0), (1.79, 1.47, 0)],
        0.066,
        bronze,
    )
    dial(0.84, 1.6, 0.59)


def alignment():
    base(5.35, 1.88)
    for x in [-1.26, 1.27]:
        for z in [-0.49, 0.49]:
            box(x, 0.34, z, 1.64, 0.20, 0.26, silver)
    motor(-1.24, 1.04, 0, 1.65, 0.48)
    cylinder_x(0.04, 1.04, 0, 1.04, 0.13, silver)
    for x in [-0.13, 0.14]:
        cylinder_x(x, 1.04, 0, 0.12, 0.24, bronze)
    tube((1.2, 1.04, -0.35), (1.2, 1.04, 0.47), 0.54, teal, n=32)
    tube((1.2, 1.04, 0.47), (1.2, 1.04, 0.96), 0.25, teal)
    tube((1.2, 1.04, 0.9), (1.2, 1.04, 1.02), 0.35, silver)
    tube((1.40, 1.29, 0), (1.40, 1.98, 0), 0.21, teal)
    rail(1.2, 0.59, 0, 0.79, 0.5, 0.72)
    wire([(-0.39, 1.17, 0.1), (-0.39, 1.67, 0.1), (0.20, 1.67, 0.1)], 0.036, silver)
    dial(0.20, 1.63, 0.13, 0.135)


def pipeline():
    for x in [-2.02, 0.64, 2.03]:
        box(x, 0.16, 0, 0.78, 0.32, 1.2, cream)
        top = 1.95 if x == 0.64 else 1.17
        rail(x, (top + 0.32) / 2, 0, 0.16, top - 0.32, 0.16)
        rail(x, top, 0, 0.58, 0.12, 0.86)
    wire(
        [
            (-2.8, 1.48, 0),
            (-0.65, 1.48, 0),
            (-0.65, 2.26, 0),
            (1.11, 2.26, 0),
            (1.11, 1.48, 0),
            (2.8, 1.48, 0),
        ],
        0.29,
        teal,
        paint,
    )
    for x, y in [
        (-2.72, 1.48),
        (-1.54, 1.48),
        (0.19, 2.26),
        (1.94, 1.48),
        (2.75, 1.48),
    ]:
        flange(x, y, 0, 0.41)


def tap():
    for x in [-1.81, 1.81]:
        rail(x, 0.53, 0, 0.28, 1, 1.23)
    cylinder_x(0, 1, 0, 5, 0.45, blue)
    for x in [-2.45, -0.47, 0.47, 2.45]:
        flange(x, 1, 0, 0.54)
    cylinder_x(0, 1, 0, 0.9, 0.53, teal)
    for y, r, c in [
        (1.54, 0.27, teal),
        (1.76, 0.42, silver),
        (1.97, 0.32, teal),
        (2.18, 0.40, silver),
        (2.45, 0.25, navy),
        (2.83, 0.20, blue),
        (3.06, 0.14, silver),
    ]:
        tube((0, y - 0.16, 0), (0, y + 0.16, 0), r, c, n=20)
    cylinder_x(0.53, 1.97, 0, 0.65, 0.08, bronze)
    dial(0.72, 2.02, 0.2, 0.17)
    rail(0, 3.23, 0, 0.89, 0.09, 0.17)


def trap():
    base(5, 1.5)
    for x in [-2, 2]:
        rail(x, 0.80, 0, 0.13, 1.12, 0.14)
    cylinder_x(0, 1.39, 0, 4.6, 0.142, silver)
    wire(
        [(-1.65, 1.39, 0), (-1.65, 0.67, 0), (1.61, 0.67, 0), (1.61, 1.39, 0)],
        0.105,
        silver,
    )
    for x in [-1.05, 0.96]:
        flange(x, 1.39, 0, 0.24)
        tube((x, 1.45, 0), (x, 1.82, 0), 0.064, bronze)
        tube((x, 1.81, 0), (x, 1.86, 0), 0.19, safety, n=16)
    tube((0, 1.17, 0), (0, 1.65, 0), 0.30, navy, r2=0.36, n=24)
    tube((0, 1.64, 0), (0, 1.72, 0), 0.38, silver, n=24)
    wire([(0.16, 1.48, 0.25), (0.42, 1.76, 0.51), (0.51, 1.87, 0.63)], 0.045, bronze)
    wire(
        [(0.51, 1.87, 0.63), (0.70, 1.26, 0.72), (1.31, 0.94, 0.7), (1.62, 1.58, 0.52)],
        0.026,
        dark,
    )
    box(1.66, 1.76, 0.51, 0.48, 0.61, 0.16, safety)
    box(1.66, 1.85, 0.60, 0.34, 0.23, 0.02, navy)


def treatment():
    base(5.4, 1.86)
    for x in [-2.49, -0.94, 2.49]:
        for z in [-0.81, 0.81]:
            rail(x, 1.58, z, 0.11, 2.75, 0.11)
    for y in [0.35, 2.91]:
        for z in [-0.81, 0.81]:
            rail(0, y, z, 5.15, 0.13, 0.11)
    for i in range(3):
        y = 0.85 + i * 0.72
        cylinder_x(0.84, y, 0, 3.08, 0.268, cream)
        for x in [-0.73, 2.4]:
            cylinder_x(x, y, 0, 0.15, 0.29, blue)
        wire(
            [(2.43, y, 0), (2.65, y, 0), (2.65, y, 0.53), (2.65, 0.55, 0.53)],
            0.054,
            blue,
        )
    for x in [-2.12, -1.57]:
        tube((x, 0.6, 0.10), (x, 2.1, 0.10), 0.21, silver, n=24)
        tube((x, 2.04, 0.10), (x, 2.21, 0.10), 0.25, teal, n=24)
    cylinder_x(-1.84, 2.21, 0.1, 1.14, 0.082, blue)
    dial(-1.83, 2.49, 0.16)


for index, build in enumerate(
    [
        tower,
        retrofit,
        ahu,
        heater,
        compressor,
        alignment,
        pipeline,
        tap,
        trap,
        treatment,
    ],
    1,
):
    build()
    export_part(f"Exhibit{index:02}")
fan(0, 0, 0, 0.91)
export_part("Impeller")
write_glb(Path.cwd() / "public/assets/mechanical/exhibits.glb")
