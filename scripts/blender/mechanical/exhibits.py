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


def trapeze(x, y, half_depth):
    """Rod-and-channel hanger below a ceiling sample rail."""
    for z in (-half_depth, half_depth):
        tube((x, y, z), (x, 3.16, z), 0.027, silver)
        box(x, y + 0.08, z, 0.09, 0.05, 0.09, bronze, metal)
    rail(x, y, 0, 0.10, 0.09, 2 * half_depth + 0.16)


def supply_duct():
    # Galvanised trunk with bolted transverse joints, branch takeoffs and diffusers.
    for x in (-2.25, 2.25):
        rail(x, 1.55, -0.88, 0.13, 3.10, 0.13)
        anchor(x, -0.88)
        rail(x, 3.12, -0.06, 0.14, 0.14, 1.81)
        trapeze(x, 1.76, 0.73)
    box(0, 2.19, 0, 5.4, 0.78, 1.16, silver, metal)
    for x in (-2.69, -1.45, 0, 1.45, 2.69):
        box(x, 2.19, 0, 0.075, 0.88, 1.25, "849496", metal)
    for x in (-1.5, 1.58):
        box(x, 1.66, 0.13, 0.63, 0.56, 0.67, silver, metal)
        # A tapered diffuser neck flares out towards the occupied space.
        loft(
            [
                [
                    (x + dx * w, y, 0.14 + dz * d)
                    for dx, dz in [(-1, 1), (1, 1), (1, -1), (-1, -1)]
                ]
                for y, w, d in [(1.11, 0.69, 0.50), (1.46, 0.31, 0.31)]
            ],
            cream,
            metal,
        )
        for i in range(3):
            box(
                x,
                1.10 - i * 0.065,
                0.14,
                1.48 - i * 0.31,
                0.055,
                1.1 - i * 0.22,
                cream,
                metal,
            )
    box(0.25, 2.20, 0.615, 0.66, 0.52, 0.065, navy)
    for i in range(6):
        box(0.25, 2.01 + i * 0.075, 0.66, 0.55, 0.031, 0.05, silver, metal)


def fresh_air():
    # A weather louvre and removable filter, then an open damper inspection bay.
    base(5.5, 1.7)
    for x in (-2.22, 0, 2.22):
        rail(x, 0.67, 0, 0.14, 0.86, 1.28)
    box(-1.63, 1.87, 0, 1.66, 1.8, 1.12, navy)
    for i in range(9):
        y = 1.14 + i * 0.18
        loft(
            [
                [
                    (x, y + 0.13, 0.52),
                    (x, y, 0.86),
                    (x, y + 0.034, 0.87),
                    (x, y + 0.16, 0.53),
                ]
                for x in (-2.38, -0.89)
            ],
            silver,
            metal,
        )
    for y in (1.03, 2.68):
        box(0.81, y, 0, 3.25, 0.12, 1.3, silver, metal)
    box(0.82, 1.85, -0.61, 3.23, 1.63, 0.085, silver, metal)
    for x in (-0.70, 0.24, 2.39):
        rail(x, 1.86, 0.61, 0.08, 1.62, 0.08)
    for i in range(11):
        x = -0.67 + i * 0.081
        loft(
            [
                [(x, y, 0.54), (x + 0.038, y, -0.49), (x + 0.078, y, 0.54)]
                for y in (1.12, 2.6)
            ],
            cream,
            paint,
        )
    for y in (1.35, 1.78, 2.20):
        tube((2.2, y, 0.05), (2.57, y, 0.05), 0.046, bronze)
    box(2.53, 1.77, 0.09, 0.33, 0.52, 0.38, safety)
    box(2.53, 1.81, 0.29, 0.22, 0.18, 0.025, navy)


def shelter_ac():
    # Show a slice of shelter wall so both halves of the refrigerant circuit are visible.
    base(5.6, 1.82)
    box(-1.04, 1.7, -0.39, 3.28, 2.85, 0.25, cream)
    for i in range(14):
        box(-2.59 + i * 0.237, 1.7, -0.245, 0.037, 2.77, 0.05, silver, metal)
    box(-1.11, 2.37, 0.04, 2.34, 0.66, 0.62, "e8ebe1")
    box(-1.11, 2.17, 0.362, 2.07, 0.14, 0.04, dark)
    box(-1.11, 2.13, 0.395, 1.99, 0.046, 0.09, silver)
    rail(1.6, 0.45, 0, 1.75, 0.42, 1.02)
    box(1.58, 1.36, -0.05, 1.9, 1.55, 1.02, cream)
    tube((1.39, 1.37, 0.46), (1.39, 1.37, 0.48), 0.615, navy, n=40)
    for radius in (0.23, 0.41, 0.59):
        for i in range(24):
            a = i * math.tau / 24
            b = (i + 1) * math.tau / 24
            tube(
                (1.39 + radius * math.cos(a), 1.37 + radius * math.sin(a), 0.67),
                (1.39 + radius * math.cos(b), 1.37 + radius * math.sin(b), 0.67),
                0.012,
                silver,
                n=6,
            )
    for i in range(6):
        box(2.24, 1.11 + i * 0.095, 0.47, 0.33, 0.034, 0.04, navy)
    for shift, radius, color in [(0, 0.052, bronze), (0.13, 0.074, dark)]:
        wire(
            [
                (-0.02, 2.30 + shift, 0.10),
                (0.30 + shift, 2.30 + shift, 0.10),
                (0.30 + shift, 0.86 + shift, 0.10),
                (0.62, 0.86 + shift, 0.10),
                (0.68, 1 + shift, 0.10),
            ],
            radius,
            color,
        )


def exchanger_installation():
    # A plate-and-frame exchanger on grouted soleplates, separate from the tube bundle exhibit.
    base(4.8, 1.85)
    for x in (-1.3, 1.48):
        box(x, 0.37, 0, 0.75, 0.27, 1.63, "a39d8c")
        box(x, 0.54, 0, 0.68, 0.1, 1.53, silver, metal)
    for z in (-0.56, 0.56):
        box(0.11, 0.60, z, 3.46, 0.10, 0.12, silver, metal)
    for x in (-1.3, 0.89):
        box(x, 1.63, 0, 0.15, 2.10, 1.44, teal)
    for i in range(28):
        x = -1.14 + i * 0.067
        box(x, 1.62, 0, 0.044, 1.89, 1.33, silver if i % 2 else "7b8d90", metal)
    for y in (0.78, 2.43):
        for z in (-0.76, 0.76):
            cylinder_x(-0.10, y, z, 2.91, 0.042, silver)
            cylinder_x(0.99, y, z, 0.10, 0.086, bronze)
    rail(1.5, 1.62, 0, 0.14, 2.2, 0.2)
    rail(0.12, 2.72, 0, 2.90, 0.13, 0.22)
    for y in (0.99, 2.22):
        for z in (-0.41, 0.41):
            cylinder_x(-1.58, y, z, 0.47, 0.16, blue)
            flange(-1.82, y, z, 0.23)
    # Mounting studs and a spirit level on the forward soleplate.
    for x in (-1.5, -1.1, 1.28, 1.68):
        tube((x, 0.48, 0.64), (x, 0.66, 0.64), 0.045, bronze, n=6)
    box(0.12, 0.72, 0.58, 0.71, 0.11, 0.12, safety)
    box(0.12, 0.74, 0.647, 0.19, 0.05, 0.016, "649673")


def refractory():
    # View into an opened length of flue. Each brick is a tapered annular segment.
    base(5.16, 1.88)
    for x in (-1.77, 1.77):
        rail(x, 0.55, 0, 0.32, 0.62, 1.44)
    cy = 1.71

    def segment(left, right, inner, outer, a, b, colour, material):
        loft(
            [
                [
                    (x, cy + r * math.cos(t), r * math.sin(t))
                    for r, t in [(inner, a), (outer, a), (outer, b), (inner, b)]
                ]
                for x in (left, right)
            ],
            colour,
            material,
        )

    # Omit the upper forward quadrant across the cutaway. The end rings stay intact.
    for col in range(9):
        x = -2.22 + col * 0.49
        for n in range(20):
            a = n * math.tau / 20
            b = (n + 1) * math.tau / 20
            if 1 <= col <= 7 and n < 7:
                continue
            segment(x, x + 0.49, 1.04, 1.095, a, b, navy, metal)
            segment(
                x + 0.005, x + 0.483, 0.91, 1.038, a + 0.004, b - 0.004, "e6d9b3", paint
            )
            segment(
                x + 0.01,
                x + 0.477,
                0.70,
                0.909,
                a + 0.009,
                b - 0.009,
                ("bb7958", "cb8f68", "a96c50")[(n + col) % 3],
                paint,
            )
    for x in (-2.23, 2.18):
        for n in range(20):
            a = n * math.tau / 20
            b = (n + 1) * math.tau / 20
            segment(x, x + 0.09, 1.05, 1.17, a, b, silver, metal)
    # One sample brick forward of the cutaway makes the wedge profile readable.
    box(0.46, 0.45, 1.0, 1.34, 0.14, 0.52, navy)
    loft(
        [
            [
                (x, y, z)
                for x, y in [(-0.03, 0.53), (0.88, 0.53), (0.78, 0.84), (0.07, 0.84)]
            ]
            for z in (0.81, 1.20)
        ],
        "c88662",
        paint,
    )


def superheater():
    base(5.66, 1.86)
    for x in (-1.28, 0.68):
        rail(x, 0.72, 0, 0.30, 0.93, 1.12)
    # Section the heater shell lengthwise to reveal the removable electrical elements.
    for i in range(20):
        a = (0.60 + i / 20 * 1.44) * math.pi
        b = (0.60 + (i + 1) / 20 * 1.44) * math.pi
        loft(
            [
                [
                    (x, 1.58 + r * math.cos(t), r * math.sin(t))
                    for r, t in [(0.64, a), (0.70, a), (0.70, b), (0.64, b)]
                ]
                for x in (-1.94, 1.34)
            ],
            silver,
            metal,
        )
    for i in range(7):
        y = 1.20 + (i % 4) * 0.218
        z = 0.28 if i < 4 else -0.14
        wire(
            [
                (-1.89, y, z),
                (1.06, y, z),
                (1.22, y + 0.067, z),
                (1.06, y + 0.134, z),
                (-1.89, y + 0.134, z),
            ],
            0.043,
            bronze,
            metal,
        )
    flange(-1.96, 1.58, 0, 0.81)
    cylinder_x(-2.22, 1.58, 0, 0.41, 0.60, teal)
    box(-2.32, 1.61, 0, 0.57, 0.85, 0.92, teal)
    for x in (-1.34, 0.93):
        tube((x, 2.11, -0.16), (x, 2.59, -0.16), 0.17, silver)
        tube((x, 2.54, -0.16), (x, 2.62, -0.16), 0.25, teal)
    box(2.02, 1.26, 0, 0.96, 1.98, 0.83, navy)
    box(2.02, 1.31, 0.43, 0.85, 1.70, 0.055, "c3cfc9")
    box(2.02, 1.74, 0.47, 0.47, 0.31, 0.035, dark)
    box(2.02, 1.74, 0.491, 0.38, 0.22, 0.015, "509fa8")
    for j, col in enumerate((teal, safety, "b75645")):
        tube((1.77 + j * 0.23, 1.32, 0.45), (1.77 + j * 0.23, 1.32, 0.51), 0.064, col)
    wire(
        [
            (1.76, 0.37, -0.15),
            (1.63, 0.32, -0.65),
            (-2.42, 0.32, -0.65),
            (-2.42, 1.25, -0.4),
        ],
        0.064,
        dark,
    )


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
        supply_duct,
        fresh_air,
        shelter_ac,
        exchanger_installation,
        refractory,
        superheater,
    ],
    1,
):
    build()
    export_part(f"Exhibit{index:02}")
fan(0, 0, 0, 0.91)
export_part("Impeller")
box(0, 0, 0, 1.81, 0.07, 0.48, teal)
export_part("DamperBlade")
write_glb(Path.cwd() / "public/assets/mechanical/exhibits.glb")
