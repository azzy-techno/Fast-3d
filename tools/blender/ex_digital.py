"""Level 08 - Digital Manufacturing: the automated line and its digital twin.
Robot palletising cell -> vision inspection -> SCADA / MES control desk -> laser scanning and digital twin -> ERP wall.
Scope: FAST O&M profile pp. 21-24 (Industrial Automation, 3D Engineering & Digital, ERP) and partner pages.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exhibit_common import *
from gallery import PX0, PX1, PY0, PY1

G, m = begin()
Z = eq.platform(G, m, PX0, PX1, PY0, PY1)
ROBOT = m["paint_orange"]
BELT = M("belt", "#1d1f22", rough=0.8)
CARTON = M("carton", "#b08a5c", rough=0.9)
HOLO = M("holo", "#5ad2ff", emit=3.0, kind="emit")

# ----------------------------------------------------------------------------- conveyor through both cells
cy = 6.5
cz = Z + 0.82
c0, c1 = -3.6, 3.6
G.box(m["paint_grey"], (c1 - c0, 0.08, 0.14), at=((c0 + c1) / 2, cy - 0.33, cz - 0.03))
G.box(m["paint_grey"], (c1 - c0, 0.08, 0.14), at=((c0 + c1) / 2, cy + 0.33, cz - 0.03))
G.box(BELT, (c1 - c0 - 0.1, 0.58, 0.03), at=((c0 + c1) / 2, cy, cz))
x = c0 + 0.2
while x < c1:
    G.cyl(m["steel"], 0.035, 0.6, at=(x, cy, cz - 0.03), axis="y", seg=8)
    x += 0.36
for x in (c0 + 0.3, -1.2, 1.2, c1 - 0.3):
    for sy_ in (-0.33, 0.33):
        G.box(m["paint_grey"], (0.06, 0.06, cz - Z - 0.1), at=(x, cy + sy_, Z + (cz - Z - 0.1) / 2))
G.box(m["paint_blue"], (0.3, 0.22, 0.24), at=(c1 - 0.1, cy - 0.5, cz - 0.1), bevel=0.02)       # drive
# cartons travelling on the belt (moved by the engine)
for i in range(5):
    with G.group(f"carton{i}", bake="vc", pivot=(c1 - 0.6 - i * 1.4, cy, cz + 0.015), conveyor=[c1 - 0.3, c0 + 0.7, 0.45]):
        G.box(CARTON, (0.4, 0.34, 0.28), at=(c1 - 0.6 - i * 1.4, cy, cz + 0.155), bevel=0.01)
        G.box(m["paint_ral"], (0.4, 0.06, 0.002), at=(c1 - 0.6 - i * 1.4, cy, cz + 0.296))

# ----------------------------------------------------------------------------- 1. robot palletising cell
rx, ry = -3.2, 5.2
G.cyl(m["paint_dark"], 0.34, 0.5, at=(rx, ry, Z + 0.25), seg=20)
with G.group("robot_base", bake="vc", pivot=(rx, ry, Z + 0.5), robot="base"):
    G.cyl(ROBOT, 0.26, 0.26, at=(rx, ry, Z + 0.63), seg=20)
    G.box(ROBOT, (0.3, 0.36, 0.34), at=(rx, ry, Z + 0.9), bevel=0.04)
    with G.group("robot_arm1", bake="vc", pivot=(rx, ry, Z + 0.95), parent="robot_base", robot="shoulder"):
        G.cyl(m["paint_dark"], 0.13, 0.42, at=(rx, ry, Z + 0.95), axis="x", seg=14)
        G.box(ROBOT, (0.2, 0.22, 1.1), at=(rx, ry, Z + 1.5), bevel=0.05)
        with G.group("robot_arm2", bake="vc", pivot=(rx, ry, Z + 2.05), parent="robot_arm1", robot="elbow"):
            G.cyl(m["paint_dark"], 0.11, 0.36, at=(rx, ry, Z + 2.05), axis="x", seg=14)
            G.box(ROBOT, (0.17, 1.2, 0.17), at=(rx, ry + 0.6, Z + 2.05), bevel=0.04)
            G.cyl(m["paint_dark"], 0.07, 0.2, at=(rx, ry + 1.25, Z + 2.05), axis="y", seg=12)
            # vacuum gripper
            G.cyl(m["steel"], 0.025, 0.3, at=(rx, ry + 1.3, Z + 1.87), seg=8)
            G.box(m["paint_dark"], (0.36, 0.3, 0.04), at=(rx, ry + 1.3, Z + 1.71))
            for sx_ in (-0.12, 0.12):
                for sy_ in (-0.09, 0.09):
                    G.cyl(m["rubber"], 0.035, 0.05, at=(rx + sx_, ry + 1.3 + sy_, Z + 1.67), seg=8)
# pallet with stacked cartons, light curtain posts
with G.at((rx - 0.1, ry + 2.6, Z)):
    for k in range(3):
        G.box(m["wood"], (1.2, 0.1, 0.1), at=(0, -0.35 + k * 0.35, 0.05))
    for k in range(5):
        G.box(m["wood"], (0.14, 0.9, 0.025), at=(-0.5 + k * 0.25, 0, 0.11))
    for lvl in range(2):
        for i in range(3):
            for j in range(2):
                if lvl == 1 and i == 2:
                    continue
                G.box(CARTON, (0.38, 0.4, 0.28), at=(-0.4 + i * 0.4, -0.21 + j * 0.42, 0.265 + lvl * 0.29), bevel=0.01)
for sx_ in (-4.4, -2.0):
    G.box(m["paint_yellow"], (0.08, 0.08, 1.3), at=(sx_, ry + 3.45, Z + 0.65))
    G.box(m["led_amber"], (0.02, 0.01, 1.0), at=(sx_ + (0.045 if sx_ < -3 else -0.045), ry + 3.45, Z + 0.7))
station(G, "line", (rx, ry + 0.2, Z + 2.1), target=(rx + 0.1, 6.5, 1.35), cam=(rx + 2.2, 11.6, 1.62), stand=(rx + 0.9, 9.0, 0.12), fov=56)

# ----------------------------------------------------------------------------- 2. vision inspection
vx = 2.0
for sx_ in (-0.5, 0.5):
    for sy_ in (-0.5, 0.5):
        G.box(m["paint_grey"], (0.05, 0.05, 2.0), at=(vx + sx_, cy + sy_, Z + 1.0))
G.box(m["paint_grey"], (1.05, 1.05, 0.05), at=(vx, cy, Z + 2.0))
G.box(m["plastic_dark"], (0.16, 0.16, 0.26), at=(vx, cy, Z + 1.84), bevel=0.01)             # camera head
G.cyl(m["glass_dark"], 0.045, 0.06, at=(vx, cy, Z + 1.69), seg=12)
with G.group("ringlight", bake="none"):
    G.lathe(m["led_white"], [(0.13, -0.012), (0.19, -0.012), (0.19, 0.012), (0.13, 0.012), (0.13, -0.012)], at=(vx, cy, Z + 1.66), seg=24)
with G.group("scanline", bake="none", pivot=(vx, cy, cz + 0.33), scan=[0.42, 1.1]):
    G.box(HOLO, (0.012, 0.6, 0.004), at=(vx, cy, cz + 0.33))
G.marker("glow", "ring", (vx, cy, Z + 1.6), color="#eaf4ff", size=1.1)
eq.monitor(G, m, (vx + 0.95, cy - 0.3, Z + 1.5), size=(0.7, 0.42), name="vision", facing="+y")
# reject chute
G.box(m["paint_grey"], (0.5, 0.7, 0.03), at=(vx + 0.2, cy - 0.75, cz - 0.2), rot=(28, 0, 0))
G.box(m["paint_red"], (0.56, 0.5, 0.36), at=(vx + 0.2, cy - 1.25, Z + 0.2), bevel=0.02)
station(G, "vision", (vx, cy + 0.1, Z + 1.75), target=(vx + 0.2, cy, 1.4))

# ----------------------------------------------------------------------------- 3. control desk: SCADA / MES
dx, dy = 6.3, 6.6
with G.at((dx, dy, Z)):
    G.box(m["paint_dark"], (2.6, 0.9, 0.05), at=(0, 0.1, 0.76), bevel=0.01)
    G.box(m["paint_dark"], (2.6, 0.05, 0.7), at=(0, -0.3, 0.38))
    for sx_ in (-1.25, 1.25):
        G.box(m["paint_dark"], (0.05, 0.85, 0.74), at=(sx_, 0.1, 0.37))
    G.box(m["accent"], (2.6, 0.012, 0.02), at=(0, 0.555, 0.74))
    for i in range(3):
        G.box(m["plastic_dark"], (0.4, 0.14, 0.02), at=(-0.75 + i * 0.75, 0.32, 0.795))
for i, nm in enumerate(("scada", "mes", "ems")):
    eq.monitor(G, m, (dx - 0.75 + i * 0.75, dy - 0.05, Z + 1.14), size=(0.66, 0.38), name=nm, facing="+y", stand=False)
    G.box(m["plastic_dark"], (0.05, 0.05, 0.2), at=(dx - 0.75 + i * 0.75, dy - 0.02, Z + 0.88))
eq.monitor(G, m, (dx, dy - 1.35, Z + 2.25), size=(2.6, 1.1), name="oee", facing="+y")
# PLC cabinet with the door open and a stack light
with G.at((dx + 1.9, dy - 0.4, Z)):
    w, d, h = 0.8, 0.35, 1.7
    G.box(m["paint_ral"], (w, 0.03, h), at=(0, -d / 2, 0.1 + h / 2), maxseg=0.6)
    for sx_ in (-1, 1):
        G.box(m["paint_ral"], (0.03, d, h), at=(sx_ * w / 2, 0, 0.1 + h / 2))
    G.box(m["paint_ral"], (w, d, 0.03), at=(0, 0, 0.1 + h))
    G.box(m["paint_dark"], (w, d, 0.1), at=(0, 0, 0.05))
    G.box(m["galv"], (w - 0.1, 0.012, h - 0.14), at=(0, -d / 2 + 0.04, 0.1 + h / 2))
    # PLC rack: power supply, CPU, I/O modules with channel LEDs
    for k in range(7):
        G.box(m["paint_grey"] if k else m["paint_dark"], (0.075, 0.1, 0.24), at=(-0.27 + k * 0.085, -d / 2 + 0.1, 1.45), bevel=0.004)
        if k:
            for l in range(4):
                G.box(m["led_green"] if (k + l) % 3 else m["led_amber"], (0.01, 0.006, 0.01), at=(-0.27 + k * 0.085, -d / 2 + 0.152, 1.4 + l * 0.03))
    for r_ in range(2):
        G.box(m["steel"], (w - 0.2, 0.02, 0.03), at=(0, -d / 2 + 0.06, 1.0 - r_ * 0.4))
        for c_ in range(6):
            eq.breaker(G, m, (-0.26 + c_ * 0.1, -d / 2 + 0.1, 1.0 - r_ * 0.4), w=0.07, h=0.1)
    G.box(m["paint_ral"], (0.03, w - 0.04, h - 0.04), at=(w / 2 + 0.04, d / 2 + (w - 0.04) / 2 - 0.02, 0.1 + h / 2), rot=(0, 0, 10))
    # stack light
    G.cyl(m["galv"], 0.015, 0.3, at=(0.25, 0, 1.95), seg=6)
    for k, lm_ in enumerate(("led_green", "led_amber", "led_red")):
        with G.group(f"stack{k}", bake="none", pivot=(0.25, 0, 2.13 + k * 0.07), blink=[3.0, 0.34, k * 1.0]):
            G.cyl(m[lm_], 0.035, 0.065, at=(0.25, 0, 2.13 + k * 0.07), seg=12)
station(G, "control", (dx, dy - 0.05, Z + 1.2), target=(dx + 0.2, dy - 0.6, 1.55), fov=56)

# ----------------------------------------------------------------------------- 4. laser scanning and digital twin
tx, ty = 10.2, 6.3
# the physical asset: a small pipe-rack mock-up
with G.at((tx - 0.9, ty - 0.4, Z)):
    for sx_ in (-0.6, 0.6):
        G.box(m["paint_grey"], (0.07, 0.07, 1.4), at=(sx_, 0, 0.7))
    G.box(m["paint_grey"], (1.3, 0.07, 0.07), at=(0, 0, 1.4))
    G.box(m["paint_grey"], (1.3, 0.07, 0.07), at=(0, 0, 0.8))
    eq.pipe(G, m["paint_green"], [(-0.9, 0, 1.52), (0.9, 0, 1.52)], 0.14, flanges=[((0.2, 0, 1.52), "x")])
    eq.pipe(G, m["paint_blue"], [(-0.9, 0, 0.92), (0.4, 0, 0.92), (0.4, 0.5, 0.92)], 0.12)
    eq.gate_valve(G, m, m["paint_blue"], (-0.3, 0, 0.92), "x", 0.12)
# its twin as a hologram on a lit plinth
hx, hy = tx + 0.9, ty - 0.4
G.cyl(m["paint_dark"], 0.85, 0.12, at=(hx, hy, Z + 0.06), seg=30)
with G.group("twin_ring", bake="none"):
    G.lathe(HOLO, [(0.78, -0.01), (0.84, -0.01), (0.84, 0.01), (0.78, 0.01), (0.78, -0.01)], at=(hx, hy, Z + 0.125), seg=36)
with G.group("twin", bake="none", pivot=(hx, hy, Z + 0.3), spin=spin("z", 0.35)):
    with G.at((hx, hy, Z + 0.15), s=0.82):
        e = 0.012
        for sx_ in (-0.6, 0.6):
            G.box(HOLO, (e, e, 1.4), at=(sx_, 0, 0.7))
        for zz in (1.4, 0.8):
            G.box(HOLO, (1.3, e, e), at=(0, 0, zz))
        for yy in (-0.07, 0.07):
            G.box(HOLO, (1.8, e, e), at=(0, yy, 1.52))
            G.box(HOLO, (1.3, e, e), at=(-0.25, yy * 0.86, 0.92))
        for xx in (-0.9, -0.45, 0.0, 0.45, 0.9):
            G.lathe(HOLO, [(0.066, -0.004), (0.074, -0.004), (0.074, 0.004), (0.066, 0.004), (0.066, -0.004)], at=(xx, 0, 1.52), seg=12, axis="x")
        G.box(HOLO, (e, e, 0.4), at=(-0.3, 0, 1.12))
        G.lathe(HOLO, [(0.085, -0.004), (0.095, -0.004), (0.095, 0.004), (0.085, 0.004), (0.085, -0.004)], at=(-0.3, 0, 1.22), seg=12)
G.marker("glow", "twin", (hx, hy, Z + 0.9), color="#5ad2ff", size=2.6)
# terrestrial laser scanner on a tripod, head turning
with G.at((tx, ty + 1.2, Z)):
    for a in range(3):
        ang = a * 2.094 + 0.5
        G.cyl(m["paint_dark"], 0.014, 1.35, at=(math.cos(ang) * 0.27, math.sin(ang) * 0.27, 0.63), rot=(-math.sin(ang) * 23, math.cos(ang) * 23, 0), seg=5)
    G.cyl(m["paint_dark"], 0.05, 0.1, at=(0, 0, 1.3), seg=10)
    with G.group("scanner", bake="vc", pivot=(0, 0, 1.4), spin=spin("z", 1.4)):
        G.box(m["paint_grey"], (0.2, 0.12, 0.28), at=(0, 0, 1.5), bevel=0.02)
        G.cyl(m["glass_dark"], 0.05, 0.13, at=(0, 0, 1.52), axis="y", seg=12)
        G.box(HOLO, (0.004, 0.004, 0.004), at=(0, 0.07, 1.52))
# survey drone hovering above
with G.group("drone", bake="vc", pivot=(tx + 0.1, ty - 0.2, Z + 2.9), bob=[0.09, 0.5]):
    with G.at((tx + 0.1, ty - 0.2, Z + 2.9)):
        G.box(m["paint_dark"], (0.26, 0.2, 0.08), at=(0, 0, 0), bevel=0.02)
        G.sphere(m["glass_dark"], 0.045, at=(0, 0.1, -0.05), seg=10, rings=6)
        for sx_ in (-1, 1):
            for sy_ in (-1, 1):
                G.box(m["paint_dark"], (0.36, 0.025, 0.02), at=(sx_ * 0.16, sy_ * 0.16, 0.01), rot=(0, 0, 45 * sx_ * sy_))
                G.cyl(m["paint_dark"], 0.025, 0.05, at=(sx_ * 0.29, sy_ * 0.29, 0.04), seg=8)
                with G.group(f"rotor{sx_}{sy_}", bake="none", pivot=(sx_ * 0.29, sy_ * 0.29, 0.075), parent="drone", spin=spin("z", 60.0 * sx_ * sy_)):
                    G.box(m["plastic_dark"], (0.34, 0.03, 0.004), at=(sx_ * 0.29, sy_ * 0.29, 0.075))
        G.box(m["led_red"], (0.02, 0.01, 0.02), at=(0, -0.105, 0.0))
station(G, "twin", (hx, hy, Z + 1.3), target=(tx, ty - 0.3, 1.45), fov=56)

# ----------------------------------------------------------------------------- 5. ERP wall
ex0, ey0 = 13.4, 6.0
for i, nm in enumerate(("erp1", "erp2", "erp3")):
    xx = ex0 - 0.95 + i * 0.95
    G.box(m["paint_dark"], (0.86, 0.08, 2.1), at=(xx, ey0, Z + 1.15), bevel=0.01)
    G.box(m["paint_dark"], (0.7, 0.5, 0.04), at=(xx, ey0, Z + 0.02))
    with G.group(f"scr_{nm}", bake="none", screen=nm):
        G.plane(m["screen"], (0.76, 1.9), at=(xx, ey0 + 0.045, Z + 1.2), rot=(90, 0, 180), uvfit=True)
# kiosk with a work-order tablet
with G.at((ex0 - 0.2, ey0 + 1.3, Z)):
    G.cyl(m["paint_dark"], 0.22, 0.03, at=(0, 0, 0.015), seg=18)
    G.cyl(m["stainless"], 0.03, 1.0, at=(0, 0, 0.5), seg=8)
    G.box(m["plastic_dark"], (0.36, 0.03, 0.26), at=(0, 0, 1.1), rot=(-30, 0, 0), bevel=0.006)
station(G, "erp", (ex0, ey0 + 0.1, Z + 1.5), cam=(12.6, 11.5, 1.62), target=(13.3, 6.0, 1.35), stand=(11.7, 8.6, 0.12), fov=56)

flow(G, "signals", [(-3.2, 5.2, Z + 0.3), (-3.2, 4.4, Z + 0.06), (2.0, 4.4, Z + 0.06), (2.0, 6.0, Z + 0.06), (6.3, 5.4, Z + 0.06), (6.3, 6.5, Z + 0.7), (8.2, 6.2, Z + 1.4)], speed=4.0, color="#a58bff", count=9, size=0.13)

overview(G)
finish(G, "digital")
