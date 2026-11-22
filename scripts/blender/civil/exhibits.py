"""Build the Civil gallery's illustrative sections and project studies in Blender."""

import math
import random
import sys
from pathlib import Path

import bpy

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "electrical"))
from exhibits import (
    box,
    export_part,
    loft,
    materials,
    metal,
    paint,
    tube,
    wire,
    write_glb,
)

# A low-sheen vertex-coloured finish for sawn concrete, earth, aggregate and masonry.
mineral = len(materials)
surface = materials[paint].copy()
surface.name = "Cut mineral surfaces"
shader = surface.node_tree.nodes.get("Principled BSDF")
shader.inputs["Metallic"].default_value = 0
shader.inputs["Roughness"].default_value = 0.91
materials.append(surface)

stone, pale, sand, earth = "b8b1a1", "ded3b8", "bb956a", "84664e"
rust, steel, dark, green = "a76648", "869599", "343e42", "26736d"
amber, white = "cc994c", "e7dfc9"


def prism(points, back, front, color, finish=mineral):
    """Extrude a counter-clockwise x/y section from the back to the viewing face."""
    loft([[(x, y, z) for x, y in points] for z in (back, front)], color, finish)


def slab(x, y, z, w, h, d, color=stone):
    box(x, y, z, w, h, d, color, mineral)


def sleeve(x, y, z0, z1, radius, bore, color, finish=mineral):
    # An annular pipe remains open at both ends, including its socket.
    for i in range(32):
        a, b = (i * math.tau / 32, (i + 1) * math.tau / 32)
        loft(
            [
                [
                    (x + r * math.cos(t), y + r * math.sin(t), z)
                    for r, t in ((bore, a), (radius, a), (radius, b), (bore, b))
                ]
                for z in (z0, z1)
            ],
            color,
            finish,
        )


def aggregate(seed, x0, x1, y0, y1, z, count):
    # A sawn face exposes irregular aggregate rather than a flat stripe of colour.
    rng = random.Random(seed)
    for _ in range(count):
        x, y = rng.uniform(x0, x1), rng.uniform(y0, y1)
        r = rng.uniform(0.018, 0.065)
        prism(
            [
                (x - r, y),
                (x - r * 0.3, y - r * 0.6),
                (x + r, y - r * 0.14),
                (x + r * 0.35, y + r * 0.66),
            ],
            z - 0.012,
            z + 0.004,
            rng.choice((sand, earth, pale, "94887a")),
        )


def foundation():
    slab(0, 0.17, 0, 4.5, 0.34, 2.25, sand)
    slab(-0.75, 0.61, 0, 3, 0.55, 2.04)
    # The missing end of the pour exposes the two directions of footing reinforcement.
    for z in (-0.78, -0.39, 0, 0.39, 0.78):
        tube((0.48, 0.50, z), (2.05, 0.50, z), 0.038, rust)
    for x in (0.80, 1.18, 1.56, 1.94):
        tube((x, 0.57, -0.88), (x, 0.57, 0.88), 0.035, rust)
    slab(-0.63, 1.21, -0.12, 1.10, 0.65, 1.02)
    for x in (-1.01, -0.25):
        for z in (-0.48, 0.24):
            tube((x, 1.43, z), (x, 2.94, z), 0.048, rust)
    for y in (1.69, 1.98, 2.27, 2.56, 2.85):
        wire(
            [
                (-1.04, y, -0.52),
                (-0.22, y, -0.52),
                (-0.22, y, 0.28),
                (-1.04, y, 0.28),
                (-1.04, y, -0.52),
            ],
            0.026,
            steel,
        )
    aggregate(1, -2.17, 0.68, 0.39, 0.82, 1.02, 37)


def renovation():
    slab(0, 0.14, 0, 5.3, 0.28, 1.78)
    # Existing blockwork interrupted by a new lintel and a propped opening.
    for row in range(6):
        x = -2.45
        while x < 2.44:
            end = min(2.45, x + (0.42 if row % 2 and x == -2.45 else 0.84))
            for lo, hi in ((x, min(end, -1.04)), (max(x, 1.04), end)):
                if hi - lo > 0.045:
                    slab(
                        (lo + hi) / 2,
                        0.45 + row * 0.365,
                        -0.18,
                        hi - lo - 0.025,
                        0.34,
                        0.43,
                        ("c5ae8c", "d4bf9e", "bba88a")[row % 3],
                    )
            x = end
    slab(0, 2.53, -0.18, 5.06, 0.34, 0.56)
    for x in (-0.78, 0.78):
        for y in (0.32, 2.30):
            box(x, y, 0.14, 0.43, 0.085, 0.50, steel, metal)
        tube((x, 0.36, 0.14), (x, 1.55, 0.14), 0.084, amber)
        tube((x, 1.47, 0.14), (x, 2.27, 0.14), 0.054, steel)
        tube((x, 1.39, 0.14), (x, 1.52, 0.14), 0.11, dark)
    box(0, 2.31, 0.14, 2.45, 0.12, 0.40, "916647")


def precast():
    slab(0, 0.13, 0, 5.2, 0.25, 1.84, sand)
    # One wall panel is seated in its socket. The next hangs off two lifting inserts.
    for x in (-1.18, 1.18):
        for z in (-0.30, 0.30):
            slab(x, 0.38, z, 2.28, 0.24, 0.28)
    for x, bottom in ((-1.18, 0.27), (1.18, 0.80)):
        slab(x, bottom + 1.02, 0, 2.18, 2.04, 0.25, "bfc0b4")
        for dx in (-0.78, 0.78):
            tube(
                (x + dx, bottom + 1.85, 0.127),
                (x + dx, bottom + 1.85, 0.136),
                0.047,
                dark,
                n=14,
            )
    for x in (0.49, 1.87):
        wire(
            [
                (x - 0.07, 2.80, 0),
                (x - 0.06, 2.96, 0),
                (x + 0.06, 2.96, 0),
                (x + 0.07, 2.80, 0),
            ],
            0.032,
            rust,
        )
        tube((x, 2.95, 0), (1.18, 3.44, 0), 0.023, steel)
    box(1.18, 3.47, 0, 0.38, 0.11, 0.13, amber)


def waterproofing():
    slab(0, 0.19, 0, 4.8, 0.38, 1.97)
    slab(0, 1.32, -0.38, 4.65, 1.92, 0.42)
    # The turned-up membrane is peeled away in stages to expose substrate and primer.
    for x, w, c in (
        (-0.18, 3.85, "685a52"),
        (-0.56, 3.03, dark),
        (-1.09, 1.93, "46827d"),
    ):
        z = -0.14 + (3.85 - w) * 0.04
        box(x, 1.20, z, w, 1.60, 0.043, c)
        box(x, 0.41, z + 0.45, w, 0.05, 0.94, c)
    wire(
        [
            (1.08, 1.98, -0.14),
            (1.27, 1.62, -0.14),
            (1.17, 1.46, -0.14),
            (1.48, 1.19, -0.14),
            (1.35, 0.93, -0.14),
        ],
        0.026,
        earth,
    )
    for x, y in ((1.27, 1.62), (1.48, 1.19)):
        tube((x, y, -0.15), (x + 0.06, y + 0.04, 0.02), 0.057, amber)


def excavation():
    profile = [
        (-2.8, 0.1),
        (2.8, 0.1),
        (2.8, 1.95),
        (2.0, 1.95),
        (1.39, 1.32),
        (0.94, 1.32),
        (0.47, 0.57),
        (-0.47, 0.57),
        (-0.94, 1.32),
        (-1.39, 1.32),
        (-2, 1.95),
        (-2.8, 1.95),
    ]
    prism(profile, -1.00, 1.02, sand)
    for x in (-2.4, 2.4):
        tube((x, 1.94, 0.72), (x, 2.46, 0.72), 0.037, white)
        tube((x, 2.31, 0.72), (x, 2.46, 0.72), 0.041, amber)
    for x in (-2.32, 2.32):
        aggregate(51 + int(x), x - 0.25, x + 0.25, 0.2, 1.75, 1.02, 27)
    slab(0, 0.21, 0, 5.6, 0.21, 2.055, earth)


def pavement():
    # Successive cut-backs make the individual wearing, binder and granular courses visible.
    for x, w, y, h, c in (
        (0, 5.6, 0.22, 0.44, earth),
        (-0.20, 5.2, 0.64, 0.40, sand),
        (-0.45, 4.70, 1.02, 0.36, "948f80"),
        (-0.68, 4.24, 1.29, 0.18, "585654"),
        (-0.90, 3.80, 1.44, 0.12, "393e40"),
    ):
        slab(x, y, 0, w, h, 2.34, c)
    for x in (-2.28, -1.19, -0.10):
        box(x, 1.515, 0, 0.66, 0.024, 0.11, white)
    aggregate(6, -2.72, 1.81, 0.89, 1.14, 1.17, 65)
    aggregate(7, -2.72, 2.28, 0.51, 0.79, 1.17, 60)


def drainage():
    slab(0, 0.16, 0, 4.9, 0.32, 2.30, sand)
    sleeve(-0.98, 0.97, -1.03, 1.02, 0.64, 0.48, stone)
    sleeve(-0.98, 0.97, 0.82, 1.13, 0.72, 0.49, pale)
    # Adjacent catch basin has a cut-away front, open sump and removable inlet grate.
    slab(1.15, 0.50, -0.08, 1.65, 0.24, 1.73)
    for x in (0.37, 1.93):
        slab(x, 1.31, -0.08, 0.15, 1.42, 1.74)
    slab(1.15, 1.31, -0.89, 1.65, 1.42, 0.15)
    slab(1.15, 0.77, 0.72, 1.65, 0.42, 0.15)
    for z in (-0.95, 0.82):
        box(1.15, 2.06, z, 1.78, 0.11, 0.11, dark)
    for i in range(10):
        box(0.40 + i * 0.166, 2.06, -0.06, 0.075, 0.10, 1.77, steel, metal)


def fence():
    slab(0, 0.13, 0, 5.55, 0.26, 1.0, stone)
    for x in (-2.52, -0.78, -0.51, 2.50):
        tube((x, 0.25, 0), (x, 2.75, 0), 0.068, steel)
        tube((x, 2.74, 0), (x, 2.80, 0), 0.078, steel, r2=0.018)
    # Clip each diagonal to its own frame so the gate gap stays open.
    for left, right in ((-2.50, -0.80), (-0.42, 2.42)):
        for y in (0.43, 2.52):
            tube((left, y, 0.0), (right, y, 0.0), 0.045, steel)
        for x in (left, right):
            tube((x, 0.43, 0), (x, 2.52, 0), 0.043, steel)
        for sign in (-1, 1):
            offset = -7.0
            while offset < 7:
                pts = []
                for x in (left, right):
                    y = sign * 1.6 * x + offset
                    if 0.43 < y < 2.52:
                        pts.append((x, y, 0.03))
                for y in (0.43, 2.52):
                    x = (y - offset) / (sign * 1.6)
                    if left <= x <= right:
                        pts.append((x, y, 0.03))
                if len(pts) == 2:
                    tube(*pts, 0.015, "788a83", n=5)
                offset += 0.38
    tube((-0.42, 0.43, 0.05), (2.42, 2.52, 0.05), 0.035, steel)
    for y in (0.66, 2.26):
        box(-0.50, y, 0.02, 0.24, 0.15, 0.16, dark)


def canopy():
    # The tensile surface sags between alternating high and low corner fixings.
    def point(u, v):
        return (
            2.55 * u,
            2.55 + 0.39 * u * v - 0.28 * (1 - u * u) * (1 - v * v),
            1.09 * v,
        )

    for u in (-1, 1):
        for v in (-1, 1):
            x, y, z = point(u, v)
            slab(x, 0.12, z, 0.40, 0.24, 0.38)
            tube((x, 0.24, z), (x, y + 0.08, z), 0.063, steel)
    for i in range(14):
        for j in range(8):
            u, v = -1 + i / 7, -1 + j / 4
            face = [
                point(u, v),
                point(u, v + 0.25),
                point(u + 1 / 7, v + 0.25),
                point(u + 1 / 7, v),
            ]
            loft(
                [[(x, y - 0.025, z) for x, y, z in face], face],
                "dfc99f" if i % 7 else "d6bf96",
                paint,
            )
    for u in (-1, 1):
        tube(point(u, -1), point(u, 1), 0.025, dark)
        tube(point(-1, u), point(1, u), 0.025, dark)
    slab(0, 0.055, 0, 5.65, 0.10, 2.63, "736f69")
    for x in (-1.70, 0, 1.70):
        box(x, 0.115, 0, 0.05, 0.018, 2.17, white)


def landscape():
    slab(0, 0.18, 0, 5.45, 0.36, 2.30, earth)
    for row in range(4):
        for col in range(6):
            slab(
                -2.43 + col * 0.46,
                0.425,
                -0.83 + row * 0.54,
                0.443,
                0.13,
                0.519,
                ("bb9d81", "ceae90", "bea78c")[(row + col) % 3],
            )
    for i in range(4):
        slab(0.20, 0.53, -0.84 + i * 0.55, 0.22, 0.36, 0.54, pale)
    slab(1.49, 0.41, 0, 2.34, 0.15, 2.25, "957454")
    wire(
        [
            (0.53, 0.50, -0.67),
            (2.42, 0.50, -0.67),
            (2.42, 0.50, 0.52),
            (0.63, 0.50, 0.52),
        ],
        0.033,
        dark,
    )
    for x, z, scale in (
        (0.86, -0.56, 0.76),
        (1.82, -0.32, 1.1),
        (1.16, 0.49, 0.87),
        (2.22, 0.54, 0.76),
    ):
        for i in range(11):
            a = i * 2.4
            r = 0.42 * scale
            h = (0.54 + i % 3 * 0.18) * scale
            dx, dz = math.cos(a), math.sin(a)
            # Tapered, folded agave blades with a visible central ridge.
            loft(
                [
                    [
                        (x - dz * 0.06, 0.50, z + dx * 0.06),
                        (x + dx * 0.07, 0.51, z + dz * 0.07),
                        (x + dz * 0.06, 0.50, z - dx * 0.06),
                    ],
                    [
                        (x + dx * r - dz * 0.006, 0.50 + h, z + dz * r + dx * 0.006),
                        (x + dx * r + 0.008, 0.51 + h, z + dz * r),
                        (x + dx * r + dz * 0.006, 0.50 + h, z + dz * r - dx * 0.006),
                    ],
                ],
                ("648c74", "738e67", "93a67f")[i % 3],
                mineral,
            )


def coating():
    # Progressively exposed steel, primer, intermediate coat and protective topcoat on an I-section.
    for i, c in enumerate(("777a75", "995741", "bca46c", green)):
        x = -2.04 + i * 1.36
        for y in (0.62, 2.09):
            box(x, y, 0, 1.355, 0.19, 1.14, c, metal if i == 0 else paint)
        box(x, 1.36, 0, 1.355, 1.31, 0.16, c, metal if i == 0 else paint)
    for x in (-1.93, 1.93):
        slab(x, 0.25, 0, 0.45, 0.50, 1.41)
    for i in range(9):
        x = -2.59 + i * 0.105
        tube(
            (x, 0.99 + 0.1 * math.sin(i), 0.08),
            (x, 0.99 + 0.1 * math.sin(i), 0.087),
            0.045,
            earth,
            n=7,
        )


def flooring():
    slab(0, 0.34, 0, 5.38, 0.63, 2.12)
    aggregate(12, -2.61, 2.61, 0.09, 0.58, 1.06, 90)
    for x, w, y, h, c in (
        (-0.20, 4.98, 0.70, 0.08, "baab90"),
        (-0.49, 4.40, 0.79, 0.10, "7c8886"),
        (-0.84, 3.70, 0.885, 0.09, "387c79"),
    ):
        box(x, y, 0, w, h, 2.09, c)
    # Coved resin skirting curves up the wall-floor junction.
    slab(-0.84, 1.28, -0.96, 3.70, 1.22, 0.16)
    arc = [
        (
            -0.59 - 0.28 * math.sin(t * math.pi / 16),
            1.21 - 0.28 * math.cos(t * math.pi / 16),
        )
        for t in range(9)
    ]
    yz = [(y, z) for z, y in arc] + [
        (1.55, -0.87),
        (1.55, -0.90),
        (0.90, -0.90),
        (0.90, -0.59),
    ]
    loft([[(x, y, z) for y, z in yz] for x in (-2.69, 1.01)], green, paint)
    box(-1.77, 0.94, 0, 0.075, 0.016, 1.99, amber)


def cathodic():
    slab(0, 0.16, 0, 5.4, 0.3, 1.90, earth)
    # Leave the cut pipe bore open. Its ring section distinguishes pipe wall from coating.
    for i in range(32):
        a, b = i * math.tau / 32, (i + 1) * math.tau / 32
        loft(
            [
                [
                    (x, 0.97 + r * math.cos(t), -0.11 + r * math.sin(t))
                    for r, t in ((0.386, a), (0.46, a), (0.46, b), (0.386, b))
                ]
                for x in (-2.53, 0.61)
            ],
            "4f6462",
            metal,
        )
    for x in (-2.27, -0.97, 0.28):
        # Narrow coating bands leave the pipe ends clear.
        for i in range(24):
            a, b = i * math.tau / 24, (i + 1) * math.tau / 24
            loft(
                [
                    [
                        (xx, 0.97 + r * math.cos(t), -0.11 + r * math.sin(t))
                        for r, t in ((0.456, a), (0.48, a), (0.48, b), (0.456, b))
                    ]
                    for xx in (x, x + 0.06)
                ],
                dark,
                paint,
            )
    tube((1.09, 0.64, 0.30), (2.26, 0.64, 0.30), 0.24, "adac9e", r2=0.17, n=12)
    box(0.63, 1.55, -0.17, 0.13, 2.48, 0.15, steel)
    box(0.63, 2.59, -0.08, 0.57, 0.57, 0.24, green)
    # Separate leads rise to the terminal pair. A removable link closes the galvanic bond.
    wire(
        [
            (-0.68, 1.42, -0.11),
            (-0.68, 1.63, -0.11),
            (0.42, 1.63, -0.11),
            (0.51, 1.76, 0.02),
            (0.51, 2.60, 0.07),
        ],
        0.038,
        dark,
    )
    wire(
        [
            (1.13, 0.64, 0.30),
            (0.88, 0.74, 0.30),
            (0.76, 1.52, 0.03),
            (0.76, 2.60, 0.07),
        ],
        0.038,
        amber,
    )
    box(0.635, 2.60, 0.093, 0.32, 0.055, 0.022, "bd874c", metal)
    for x in (0.51, 0.76):
        tube((x, 2.6, 0.094), (x, 2.6, 0.13), 0.056, steel, n=6)


def generator_base():
    slab(0, 0.16, 0, 5.56, 0.32, 2.33, sand)
    slab(0, 0.69, 0, 5.28, 0.73, 2.12)
    for z in (-0.59, 0.59):
        slab(0, 1.19, z, 4.93, 0.27, 0.43, "9c9b90")
        box(0, 1.35, z, 4.66, 0.09, 0.35, steel, metal)
        for x in (-1.94, -0.66, 0.66, 1.94):
            tube((x, 1.32, z), (x, 1.66, z), 0.047, rust)
            tube((x, 1.40, z), (x, 1.48, z), 0.089, steel, n=6)
    aggregate(14, -2.56, 2.53, 0.40, 0.97, 1.06, 70)
    for x in (-0.40, 0.02, 0.44):
        sleeve(x, 0.67, 0.96, 1.105, 0.146, 0.098, dark, paint)


def roof_repair():
    slab(0, 0.48, 0, 5.17, 0.73, 1.98)
    slab(0, 1.54, -0.86, 5.17, 1.43, 0.25)
    box(-0.41, 0.96, 0, 4.33, 0.21, 1.94, "c3aa74")
    box(-0.83, 1.09, 0.02, 3.49, 0.055, 1.90, dark)
    box(-0.83, 1.49, -0.70, 3.49, 0.82, 0.055, dark)
    box(-0.83, 1.89, -0.65, 3.56, 0.08, 0.13, steel, metal)
    for x in (-2.13, -1.25, -0.34, 0.53):
        tube((x, 1.89, -0.59), (x, 1.89, -0.566), 0.035, amber, n=8)
    # Roll sits at the exposed edge of the replacement sheet; open core faces the visitor.
    sleeve(0.73, 1.36, -0.56, 0.94, 0.285, 0.105, dark, paint)
    sleeve(0.73, 1.36, 0.89, 0.945, 0.113, 0.077, "aa8a61", mineral)


def bench():
    # One cast seat with radiused ends, two recessed concrete supports and a paving bed.
    for x in (-1.46, 1.46):
        prism(
            [(x - 0.30, 0.20), (x + 0.30, 0.20), (x + 0.46, 1.15), (x - 0.46, 1.15)],
            -0.48,
            0.48,
            stone,
        )
    radius = 0.23
    contour = []
    for x, start in ((2.15, -math.pi / 2), (-2.15, math.pi / 2)):
        for i in range(13):
            a = start + i * math.pi / 12
            contour.append((x + radius * math.cos(a), 1.35 + radius * math.sin(a)))
    prism(contour, -0.68, 0.68, pale)
    for i in range(8):
        for j in range(3):
            slab(
                -2.42 + i * 0.69,
                0.10,
                -0.68 + j * 0.68,
                0.676,
                0.20,
                0.665,
                ("ad9f8a", "baa995")[(i + j) % 2],
            )
    for x in (-1.46, 1.46):
        box(x, 1.125, 0, 0.93, 0.038, 1.0, dark)


builders = [
    foundation,
    renovation,
    precast,
    waterproofing,
    excavation,
    pavement,
    drainage,
    fence,
    canopy,
    landscape,
    coating,
    flooring,
    cathodic,
    generator_base,
    roof_repair,
    bench,
]
for number, build in enumerate(builders, 1):
    build()
    export_part(f"Exhibit{number:02}")
write_glb(Path.cwd() / "public/assets/civil/exhibits.glb")
