"""Build the shared digital floor from the repository root using Blender."""

import math
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from it.exhibits import (
    box,
    tube,
    wire,
    disc,
    screen,
    desk,
    display,
    ports,
    camera,
    export_part,
    write_glb,
    materials,
    print_face,
    atlas,
    metal,
    steel,
    dark,
    slate,
    cream,
    teal,
    gold,
    blue,
    green,
    black,
)

def hmi(x, y, z, index, w=1.39, h=1.02):
    box(x, 0.08, z, 0.66, 0.16, 0.64, slate)
    box(x, y / 2, z - 0.12, 0.12, y, 0.14, steel)
    screen(x, y, z, w, h, index)


def conveyor():
    for x in (-1.98, 0.71):
        for z in (-0.46, 0.46):
            box(x, 0.49, z, 0.12, 0.95, 0.12, slate)
    for z in (-0.54, 0.54):
        box(-0.64, 1, z, 3.31, 0.21, 0.13, teal)
    for j in range(14):
        x = -2.12 + j * 0.226
        tube((x, 1.06, -0.50), (x, 1.06, 0.50), 0.081, steel)
    for x in (-1.42, -0.28):
        box(x, 1.36, 0, 0.68, 0.44, 0.66, "c7a374")
    for z in (-0.57, 0.57):
        box(0.51, 1.62, z, 0.09, 1.30, 0.09, steel)
    box(0.51, 2.29, 0, 0.14, 0.10, 1.22, steel)
    box(0.51, 2.12, 0.06, 0.22, 0.24, 0.24, black)
    hmi(1.70, 1.65, 0, 0)


def trace():
    desk(0, 0.92, 0, 3.95, 1.43)
    display(-0.86, 1.73, -0.12, 1.97, 1.27, 1)
    box(1.05, 1.30, 0, 1.16, 0.64, 0.82, slate)
    disc(1.05, 1.65, 0, 0.33, 0.56, cream)
    box(1.05, 1.32, 0.425, 0.75, 0.10, 0.06, black)
    box(1.05, 1.18, 0.49, 0.54, 0.23, 0.045, cream)
    for j in range(11):
        box(0.83 + j * 0.042, 1.19, 0.52, 0.018, 0.12, 0.014, black)


def planning():
    for x in (-1.48, 1.48):
        box(x, 0.14, 0, 0.64, 0.22, 0.76, slate)
        box(x, 1.26, -0.23, 0.13, 2.44, 0.14, steel)
    screen(0, 1.99, -0.10, 3.88, 1.85, 2)
    box(0, 0.74, 0.03, 3.59, 0.14, 0.80, "b6a486")
    for i, c in enumerate((teal, gold, blue)):
        for j in range(3 - i):
            box(-1.24 + i * 1.10 + j * 0.22, 0.88, 0.11, 0.21, 0.15, 0.33, c)


def filling():
    box(-0.71, 0.51, 0, 2.07, 0.93, 1.53, slate)
    tube((-0.71, 1.00, 0), (-0.71, 1.15, 0), 0.88, steel, n=36)
    for i in range(8):
        a = i * math.tau / 8
        x = -0.71 + 0.65 * math.cos(a)
        z = 0.65 * math.sin(a)
        tube((x, 1.15, z), (x, 1.53, z), 0.113, teal)
        tube((x, 1.53, z), (x, 1.62, z), 0.113, teal, r2=0.056)
        tube((x, 1.62, z), (x, 1.68, z), 0.057, gold)
    box(-0.73, 1.70, -0.65, 0.14, 1.48, 0.14, steel)
    box(-0.73, 2.45, -0.27, 0.25, 0.17, 0.87, steel)
    tube((-0.73, 2.04, 0.08), (-0.73, 2.39, 0.08), 0.065, steel)
    hmi(1.49, 1.69, 0, 3)


def motor(x):
    box(x, 0.22, 0, 2.03, 0.38, 1.11, dark)
    tube((x - 0.75, 0.86, 0), (x + 0.69, 0.86, 0), 0.48, teal, n=32)
    for j in range(12):
        a = j * math.tau / 12
        y = 0.86 + 0.47 * math.cos(a)
        z = 0.47 * math.sin(a)
        tube((x - 0.62, y, z), (x + 0.57, y, z), 0.044, teal, n=8)
    tube((x + 0.67, 0.86, 0), (x + 0.97, 0.86, 0), 0.12, steel)
    box(x, 1.42, 0.03, 0.47, 0.26, 0.42, slate)


def gateway():
    motor(-1.06)
    box(-1.04, 1.61, 0.15, 0.20, 0.16, 0.20, gold)
    box(0.90, 1.29, -0.24, 0.24, 2.46, 0.18, steel)
    box(0.90, 1.74, -0.04, 0.65, 0.90, 0.27, slate)
    ports(0.90, 1.47, 0.113, 3, 0.16)
    wire(
        [
            (-1.04, 1.69, 0.15),
            (-1.04, 1.80, 0.15),
            (-0.01, 1.80, 0.15),
            (0.16, 0.34, 0.15),
            (0.58, 0.34, 0.15),
            (0.60, 1.44, 0.12),
        ],
        0.028,
        blue,
    )
    hmi(1.88, 2.24, -0.37, 4, 1.17, 0.89)


def documents():
    desk(0, 0.85, 0, 3.87, 1.35)
    for i, c in enumerate((slate, teal, blue, gold)):
        x = -1.51 + i * 0.29
        box(x, 1.48, -0.08, 0.247, 1.10, 0.66, c)
        box(x, 1.69, 0.266, 0.17, 0.37, 0.030, cream)
        disc(x, 1.13, 0.277, 0.04, 0.023, dark)
    display(0.80, 1.70, -0.08, 1.73, 1.22, 5)
    box(0.55, 0.97, 0.46, 1.20, 0.076, 0.26, slate)


def contextual():
    box(-0.91, 1.25, -0.08, 2.12, 2.39, 0.27, cream)
    for y in (0.62, 1.29, 1.88):
        box(-0.91, y, 0.09, 1.85, 0.09, 0.10, steel)
    for j in range(6):
        x = -1.61 + j * 0.278
        box(x, 1.45, 0.17, 0.25, 0.79, 0.23, slate if j else teal)
        for k in range(3):
            box(x - 0.04, 1.61 - k * 0.12, 0.298, 0.055, 0.030, 0.018, green)
        wire([(x, 1.05, 0.20), (x, 0.81, 0.20), (x + 0.08, 0.67, 0.16)], 0.018, blue)
    hmi(1.38, 1.70, 0, 6)


def asset():
    motor(-0.98)
    disc(0.12, 0.85, 0, 0.52, 0.51, "9d624b")
    tube((0.13, 1.12, -0.09), (0.13, 1.65, -0.09), 0.18, "9d624b")
    tube((0.13, 1.60, -0.09), (0.13, 1.69, -0.09), 0.27, steel)
    box(-1.03, 1.47, 0.27, 0.43, 0.26, 0.04, cream)
    for j in range(8):
        box(-1.19 + j * 0.041, 1.47, 0.295, 0.016, 0.16, 0.016, black)
    hmi(1.59, 1.67, 0, 7)


def work_order():
    for y in (0.36, 1.35):
        box(-0.77, y, 0, 2.10, 0.11, 1.12, teal)
    for x in (-1.67, 0.13):
        for z in (-0.43, 0.43):
            box(x, 0.84, z, 0.09, 0.96, 0.09, steel)
            disc(x, 0.19, z, 0.17, 0.10, dark)
    for j in range(3):
        x = -1.38 + j * 0.58
        box(x, 0.60, 0, 0.46, 0.39, 0.70, "c39d68")
    for x in (-1.38, -0.69):
        disc(x, 1.60, -0.02, 0.22, 0.24, steel)
    hmi(1.46, 1.74, 0, 8)


def warehouse():
    for x in (-1.87, -1.17, -0.47):
        box(x, 0.16, 0, 0.22, 0.24, 1.45, "96744e")
    for j in range(5):
        box(-1.17, 0.32, -0.56 + j * 0.28, 2.10, 0.10, 0.235, "c4a784")
    for x, y in ((-1.72, 0.68), (-0.65, 0.68), (-0.65, 1.32)):
        box(x, y, 0, 0.94, 0.63, 1.04, "cba780")
        box(x, y, 0.532, 0.55, 0.25, 0.018, cream)
        for j in range(12):
            box(x - 0.22 + j * 0.039, y, 0.544, 0.013, 0.18, 0.014, black)
    hmi(1.28, 1.66, 0, 9)


def workflow():
    desk(0, 0.92, 0, 3.76, 1.35)
    display(-0.76, 1.81, -0.15, 1.84, 1.29, 10)
    box(1.17, 1.16, 0.03, 0.62, 0.40, 0.54, slate)
    screen(1.17, 1.69, 0.06, 0.83, 1.17, 10)
    for j in range(3):
        box(0.24 + j * 0.02, 1.01 + j * 0.025, 0.28, 0.55, 0.02, 0.69, cream)


def metering():
    box(-0.83, 1.38, -0.27, 2.10, 2.68, 0.25, slate)
    for i, c in enumerate(("a76b4e", "a28b52", "607b94")):
        x = -1.48 + i * 0.66
        box(x, 1.44, -0.06, 0.12, 2.16, 0.12, c, metal)
        for xx in (-0.17, 0.17):
            box(x + xx, 1.48, 0.04, 0.10, 0.46, 0.24, cream)
        for yy in (1.26, 1.70):
            box(x, yy, 0.04, 0.42, 0.09, 0.24, cream)
        wire(
            [(x + 0.18, 1.48, 0.16), (x + 0.29, 1.46, 0.16), (x + 0.29, 0.57, 0.16)],
            0.024,
            blue,
        )
    hmi(1.51, 1.70, 0, 11)


def ventilation():
    box(-0.76, 0.16, 0, 2.36, 0.24, 1.49, slate)
    box(-0.76, 1.19, -0.08, 2.03, 1.89, 0.76, steel)
    disc(-0.76, 1.22, 0.32, 0.81, 0.10, dark)
    for i in range(7):
        a = i * math.tau / 7
        tube(
            (-0.76 + 0.12 * math.cos(a), 1.22 + 0.12 * math.sin(a), 0.43),
            (-0.76 + 0.63 * math.cos(a + 0.37), 1.22 + 0.63 * math.sin(a + 0.37), 0.43),
            0.105,
            teal,
            r2=0.069,
        )
    disc(-0.76, 1.22, 0.46, 0.17, 0.16, slate)
    hmi(1.53, 1.69, 0, 12)


def sustainability():
    # A miniature metered plant and rooftop solar rows beside the trend display.
    box(-0.98, 0.20, 0, 2.49, 0.29, 1.53, slate)
    box(-1.28, 0.73, -0.13, 1.28, 0.84, 0.93, cream)
    for i in range(3):
        tube(
            (-0.29, 0.35, -0.42 + i * 0.38),
            (-0.29, 1.00 + i * 0.30, -0.42 + i * 0.38),
            0.115,
            steel,
        )
    for x in (-1.67, -1.27, -0.87):
        for z in (-0.37, 0.10):
            box(x, 1.19, z, 0.365, 0.054, 0.405, "3e657f")
    hmi(1.42, 1.72, 0, 13)


def safety_scene(forklift):
    box(-0.40, 0.15, 0, 4.14, 0.24, 2.08, "687577")
    for x in (-1.53, 0.76):
        box(x, 0.283, 0, 0.060, 0.025, 1.95, gold)
    box(-2.27, 1.32, -0.75, 0.10, 2.15, 0.10, steel)
    camera(-2.27, 2.43, -0.41)
    if forklift:
        box(-0.32, 0.70, 0, 0.92, 0.59, 0.89, gold)
        for x in (-0.65, 0.03):
            for z in (-0.42, 0.42):
                disc(x, 0.49, z, 0.20, 0.13, dark)
        for x in (-0.68, 0.06):
            for z in (-0.32, 0.32):
                box(x, 1.28, z, 0.057, 0.68, 0.058, slate)
        box(-0.31, 1.65, 0, 0.91, 0.095, 0.80, gold)
        box(-0.33, 1.01, 0, 0.31, 0.19, 0.39, dark)
        for z in (-0.28, 0.28):
            box(0.23, 1.11, z, 0.092, 1.52, 0.083, slate)
            box(0.67, 0.51, z, 0.92, 0.07, 0.11, steel)
    else:
        for x in (-0.66, -0.40):
            tube((x, 0.33, 0.12), (x, 0.92, 0.12), 0.082, slate)
        box(-0.53, 1.12, 0.12, 0.47, 0.50, 0.32, gold)
        box(-0.53, 1.13, 0.29, 0.46, 0.089, 0.025, cream)
        for x in (-0.83, -0.23):
            tube((x, 1.29, 0.12), (x, 1.00, 0.15), 0.068, slate)
        tube((-0.53, 1.41, 0.12), (-0.53, 1.65, 0.12), 0.124, "ba947b")
        tube((-0.53, 1.62, 0.12), (-0.53, 1.73, 0.12), 0.16, cream, r2=0.10)
    hmi(1.92, 1.89, -0.31, 15 if forklift else 14, 1.14, 0.88)


subprocess.run(
    ["python3", str(Path(__file__).with_name("displays.py")), str(atlas)], check=True
)
next(
    n for n in materials[print_face].node_tree.nodes if n.type == "TEX_IMAGE"
).image.reload()
for i, build in enumerate(
    (
        conveyor,
        trace,
        planning,
        filling,
        gateway,
        documents,
        contextual,
        asset,
        work_order,
        warehouse,
        workflow,
        metering,
        ventilation,
        sustainability,
        lambda: safety_scene(False),
        lambda: safety_scene(True),
    ),
    1,
):
    build()
    export_part(f"Exhibit{i:02}")
write_glb(Path.cwd() / "public/assets/manufacturing/exhibits.glb")
