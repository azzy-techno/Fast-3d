"""Build the single-cell counterflow exhibit with blender -b -P scripts/blender/cooling/tower.py."""

import math
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "electrical"))
from exhibits import (
    box,
    tube,
    loft,
    vertex,
    polygon,
    export_part,
    write_glb,
    paint,
    metal,
    plate,
    print_face,
    materials,
    atlas,
)

pearl, seam, steel, dark = "d2d8d6", "9caeb2", "8297a1", "384951"
teal, copper, amber = "347d84", "b77a50", "e6b162"
tau = math.tau


def identification_plate():
    badge = Image.new("RGB", (420, 248), "#f0efe6")
    draw = ImageDraw.Draw(badge)
    logo = Image.open("public/assets/fast-logo.png").convert("RGBA")
    logo.thumbnail((137, 48))
    badge.paste(logo, (22, 15), logo)
    draw.line((21, 79, 399, 79), fill="#306668", width=4)
    draw.text(
        (18, 83),
        "CT–01",
        font=ImageFont.truetype("DejaVuSansCondensed-Bold.ttf", 76),
        fill="#16313b",
    )
    draw.text(
        (23, 190),
        "COUNTERFLOW   /   INDUCED DRAFT",
        font=ImageFont.truetype("DejaVuSansCondensed-Bold.ttf", 22),
        fill="#36505a",
    )
    texture = Image.new("RGB", (1024, 1024), "#f0efe6")
    texture.paste(badge.resize((256, 256), Image.Resampling.LANCZOS), (0, 0))
    texture.save(atlas)
    next(
        n for n in materials[print_face].node_tree.nodes if n.type == "TEX_IMAGE"
    ).image.reload()


identification_plate()


def hoop(radius, y, thickness, colour, count=72):
    # Revolve a hollow flanged ring, leaving its centre open.
    rings = []
    for r, h in [
        (radius - thickness, y),
        (radius, y),
        (radius, y + 0.055),
        (radius - thickness, y + 0.055),
    ]:
        rings.append(
            [
                vertex(
                    (r * math.cos(i * tau / count), h, r * math.sin(i * tau / count)),
                    colour,
                )
                for i in range(count)
            ]
        )
    for row, nxt in zip(rings, rings[1:] + rings[:1]):
        for i in range(count):
            j = (i + 1) % count
            polygon([row[i], nxt[i], nxt[j], row[j]], metal)


# Fixed galvanised load-bearing structure, mounts and diagonal tie rods.
for x in [-2.26, 2.26]:
    for z in [-1.64, 1.64]:
        box(x, 0.12, z, 0.55, 0.24, 0.55, "a7aba5")
        box(x, 2.26, z, 0.12, 4.24, 0.12, steel, metal)
        box(x, 0.28, z, 0.35, 0.08, 0.35, steel, metal)
    tube((x, 0.83, -1.62), (x, 3.85, 1.62), 0.042, seam)
    tube((x, 0.83, 1.62), (x, 3.85, -1.62), 0.042, seam)
for y in [0.87, 2.45, 4.32]:
    for x in [-2.25, 2.25]:
        box(x, y, 0, 0.15, 0.14, 3.37, steel, metal)
    for z in [-1.64, 1.64]:
        box(0, y, z, 4.58, 0.14, 0.15, steel, metal)
export_part("Frame")

# Cold-water sump, visible water surface, make-up float, suction strainer and flange.
box(0, 0.48, 0, 4.43, 0.15, 3.15, steel, metal)
for x in [-2.16, 2.16]:
    box(x, 0.66, 0, 0.11, 0.40, 3.2, seam, metal)
for z in [-1.55, 1.55]:
    box(0, 0.66, z, 4.41, 0.40, 0.11, seam, metal)
box(0, 0.655, 0, 4.18, 0.028, 2.91, "44868c")
for i in range(10):
    box(-1.16 + i * 0.11, 0.694, 0.05, 0.05, 0.035, 1.12, dark)
tube((1.80, 0.92, 0.46), (1.26, 0.84, 0.46), 0.035, copper)
tube((1.22, 0.84, 0.46), (1.22, 0.90, 0.46), 0.15, amber)
for z, x, r in [(1.76, -1.18, 0.205), (1.76, 1.65, 0.092)]:
    tube((x, 0.63, 1.44), (x, 0.63, 2.25), r, teal)
    tube((x, 0.63, 2.22), (x, 0.63, 2.29), r * 1.53, steel)
    tube((x, 0.63, 2.29), (x, 0.63, 2.295), r * 0.86, dark)
    for j in range(8):
        ang = j * tau / 8
        dx, dy = r * 1.25 * math.cos(ang), r * 1.25 * math.sin(ang)
        tube((x + dx, 0.63 + dy, 2.27), (x + dx, 0.63 + dy, 2.32), 0.025, seam, n=6)
export_part("Basin")

# Removable cladding halves. The front divides at the central service seam.
for side, name in [(-1, "LeftShell"), (1, "RightShell")]:
    for z in [-1.76, 1.76]:
        for j in range(3):
            x = side * (0.40 + 0.8 * j)
            box(x, 2.86, z, 0.778, 2.68, 0.09, pearl)
            for dy in [-1.18, 1.18]:
                for dx in [-0.28, 0.28]:
                    tube(
                        (x + dx, 2.86 + dy, z),
                        (x + dx, 2.86 + dy, z + math.copysign(0.079, z)),
                        0.031,
                        steel,
                        n=6,
                    )
        box(side * 1.20, 4.22, z, 2.38, 0.11, 0.15, teal)
        for j in range(5):
            box(side * 1.20, 0.99 + j * 0.115, z, 2.30, 0.074, 0.22, dark)
        box(side * 1.20, 1.58, z, 2.38, 0.09, 0.16, steel)
    box(side * 2.40, 2.88, 0, 0.085, 2.68, 3.54, pearl)
    for z in [-1.45, -0.73, 0, 0.73, 1.45]:
        box(side * 2.46, 2.88, z, 0.055, 2.64, 0.055, seam)
    for j in range(5):
        box(side * 2.42, 0.99 + j * 0.115, 0, 0.22, 0.074, 3.37, dark)
    if side == 1:
        # Inspection hatch, hinges, latches and a contrasting perimeter gasket.
        box(1.22, 2.82, 1.84, 1.67, 1.76, 0.055, dark)
        box(1.22, 2.82, 1.89, 1.61, 1.69, 0.069, seam)
        plate(1.22, 3.15, 1.937, 1.16, 0.685, 0)
        for y in [2.24, 3.40]:
            box(0.39, y, 1.95, 0.16, 0.22, 0.085, steel, metal)
            box(2.04, y, 1.96, 0.17, 0.074, 0.094, dark, metal)
        for z in [-0.62, 0.02]:
            tube((2.64, 0.55, z), (2.64, 4.49, z), 0.043, steel)
        for j in range(12):
            tube(
                (2.64, 0.65 + j * 0.32, -0.62),
                (2.64, 0.65 + j * 0.32, 0.02),
                0.031,
                steel,
            )
    export_part(name)

# Open fan stack, rolled flange and safety guard with concentric wire rings.
count = 80
rows = []
for y, r in [
    (4.32, 1.63),
    (4.46, 1.56),
    (4.80, 1.53),
    (5.04, 1.60),
    (5.08, 1.66),
    (5.00, 1.68),
    (4.76, 1.59),
    (4.47, 1.62),
    (4.32, 1.70),
]:
    rows.append(
        [
            vertex(
                (r * math.cos(i * tau / count), y, r * math.sin(i * tau / count)), pearl
            )
            for i in range(count)
        ]
    )
for a, b in zip(rows, rows[1:]):
    for i in range(count):
        j = (i + 1) % count
        polygon([a[i], b[i], b[j], a[j]], paint)
hoop(1.77, 4.31, 0.17, steel)
for r in [0.24, 0.48, 0.73, 0.98, 1.23, 1.49]:
    hoop(r, 5.08, 0.018, steel)
for i in range(12):
    a = tau * i / 12
    tube((0, 5.10, 0), (1.60 * math.cos(a), 5.10, 1.60 * math.sin(a)), 0.018, steel)
# Flat deck surrounding the circular throat.
for i in range(count):
    a = tau * i / count
    b = tau * (i + 1) / count
    pts = []
    for theta, inner in [(a, True), (b, True), (b, False), (a, False)]:
        co, si = math.cos(theta), math.sin(theta)
        r = (
            1.63
            if inner
            else min(2.47 / max(abs(co), 0.0001), 1.84 / max(abs(si), 0.0001))
        )
        pts.append(vertex((r * co, 4.32, r * si), seam))
    polygon(pts, metal)
export_part("FanStack")

# Pitched and swept axial aerofoils, hub bolts and retaining cap.
tube((0, 4.49, 0), (0, 4.77, 0), 0.28, steel, n=32)
for i in range(7):
    rings = []
    for r, sweep, chord, twist in [
        (0.22, 0, 0.15, 0.19),
        (0.55, 0.06, 0.32, 0.15),
        (1.04, 0.18, 0.37, 0.115),
        (1.45, 0.30, 0.26, 0.055),
    ]:
        a = i * tau / 7 + sweep
        rings.append(
            [
                (
                    r * math.cos(a) - v * math.sin(a),
                    4.64 + dy,
                    r * math.sin(a) + v * math.cos(a),
                )
                for v, dy in [
                    (-chord / 2, -twist / 2),
                    (0, 0.035),
                    (chord / 2, twist / 2),
                    (0, -0.045),
                ]
            ]
        )
    loft(rings, "d9af6f", metal)
    tube(
        (0.18 * math.cos(i * tau / 7), 4.77, 0.18 * math.sin(i * tau / 7)),
        (0.18 * math.cos(i * tau / 7), 4.80, 0.18 * math.sin(i * tau / 7)),
        0.035,
        dark,
        n=6,
    )
export_part("Rotor")

# Right-angle gearbox and externally accessible horizontal motor.
for z in [-0.42, 0.42]:
    box(0.72, 3.87, z, 3.18, 0.13, 0.1, steel, metal)
box(0, 4.05, 0, 0.68, 0.38, 0.59, "3d747c")
tube((0, 4.15, 0), (0, 4.55, 0), 0.11, steel)
tube((0.26, 4.08, 0), (1.28, 4.08, 0), 0.081, steel)
for x in [0.47, 1.19]:
    tube((x, 4.08, 0), (x + 0.10, 4.08, 0), 0.152, copper)
tube((1.35, 4.08, 0), (2.08, 4.08, 0), 0.27, teal, n=28)
for i in range(16):
    a = i * tau / 16
    tube(
        (1.42, 4.08 + 0.27 * math.cos(a), 0.27 * math.sin(a)),
        (2.01, 4.08 + 0.27 * math.cos(a), 0.27 * math.sin(a)),
        0.024,
        "68a0a3",
    )
box(1.71, 4.41, 0, 0.36, 0.17, 0.28, dark)
export_part("Drive")

# Chevron drift blades describe an actual changing air path.
for i in range(31):
    x = -2.02 + i * 0.132
    loft(
        [
            [
                (x + dx, y, z)
                for dx, y in [
                    (0, 3.38),
                    (0.10, 3.54),
                    (0.025, 3.70),
                    (0.06, 3.70),
                    (0.135, 3.54),
                    (0.035, 3.38),
                ]
            ]
            for z in [-1.49, 1.49]
        ],
        "91aca9",
        paint,
    )
for z in [-1.50, 1.50]:
    box(0, 3.41, z, 4.27, 0.064, 0.055, steel, metal)
export_part("Eliminator")

tube((-2.36, 3.03, 0), (2.09, 3.03, 0), 0.14, teal, n=24)
for i in range(7):
    x = -1.83 + i * 0.60
    tube((x, 3.03, -1.34), (x, 3.03, 1.34), 0.072, teal)
    for z in [-1.17, -0.48, 0.48, 1.17]:
        tube((x, 3.01, z), (x, 2.88, z), 0.049, copper)
        tube((x, 2.89, z), (x, 2.80, z), 0.054, amber, r2=0.119)
export_part("Distribution")

# Alternating corrugated sheets form the two removable fill packs.
for side, name in [(-1, "FillLeft"), (1, "FillRight")]:
    for j in range(26):
        mid = side * 1.02 - 0.94 + j * 0.075
        for k in range(15):
            z = -1.49 + k * 0.198
            off = 0.045 if k % 2 else -0.045
            pts = [
                (mid + off, 1.37, z),
                (mid - off, 1.37, z + 0.198),
                (mid + off, 2.65, z + 0.198),
                (mid - off, 2.65, z),
            ]
            loft(
                [pts, [(x + 0.012, y, z) for x, y, z in pts]],
                "375963" if j % 2 else "50717a",
                paint,
            )
    for z in [-1.44, 1.44]:
        box(side * 1.02, 1.39, z, 1.99, 0.09, 0.09, steel)
    export_part(name)

write_glb(Path.cwd() / "public/assets/cooling/tower.glb")
