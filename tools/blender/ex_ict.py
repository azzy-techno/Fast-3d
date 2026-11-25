"""Level 07 - Industrial ICT: the systems that watch, connect and admit.
Server room -> CCTV and video wall -> access control lane -> network cabinet -> software desk.
Scope: FAST O&M profile pp. 17-20.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exhibit_common import *
from gallery import PX0, PX1, PY0, PY1

G, m = begin()
Z = eq.platform(G, m, PX0, PX1, PY0, PY1)
FIBRE = m["cable_yellow"]
SS = m["stainless"]

# ----------------------------------------------------------------------------- 1. server room
sx0, sy0 = -2.6, 6.2
with G.at((sx0, sy0, Z)):
    # raised floor
    G.box(m["paint_grey"], (3.6, 2.2, 0.1), at=(0, 0.2, 0.05), maxseg=0.6)
    for i in range(7):
        G.box(m["paint_dark"], (0.008, 2.2, 0.004), at=(-1.8 + i * 0.6, 0.2, 0.102))
    for j in range(5):
        G.box(m["paint_dark"], (3.6, 0.008, 0.004), at=(0, -0.9 + j * 0.55, 0.102))
    for i in range(4):
        eq.rack(G, m, (-1.05 + i * 0.62, 0, 0.1), h=2.1, w=0.6, d=1.0, seed=i, facing="+y")
    # in-row cooling unit at the end of the row
    c = eq.cabinet(G, m, (0.5, 1.0, 2.1), at=(1.55, 0, 0.1), mat=m["paint_grey"], plinth=0.04, facing="+y", vents=True, meter=True)
    # cold-aisle containment: glazed frame in front of the racks
    for xx in (-1.42, 1.85):
        G.box(m["paint_dark"], (0.05, 0.05, 2.25), at=(xx, 1.25, 1.22))
    G.box(m["paint_dark"], (3.32, 0.05, 0.05), at=(0.215, 1.25, 2.33))
    G.box(m["paint_dark"], (3.32, 1.2, 0.04), at=(0.215, 0.66, 2.36))
    with G.group("glass_ex", bake="none", env="floor"):
        G.plane(m["glass_clear"], (1.1, 2.1), at=(-0.86, 1.25, 1.2), rot=(-90, 0, 0))
        G.plane(m["glass_clear"], (1.1, 2.1), at=(1.29, 1.25, 1.2), rot=(-90, 0, 0))
    # overhead ladder with fibre trunking
    eq.cable_tray(G, m, [(-1.6, -0.2, 2.65), (2.4, -0.2, 2.65)], w=0.4)
    G.box(FIBRE, (4.0, 0.1, 0.08), at=(0.4, -0.05, 2.7))
    for i in range(4):
        G.tube(FIBRE, [(-1.05 + i * 0.62, -0.05, 2.66), (-1.05 + i * 0.62, -0.05, 2.2)], 0.012, seg=6)
station(G, "servers", (sx0 - 0.1, sy0 + 0.55, Z + 1.5), target=(sx0, sy0, 1.3))

# ----------------------------------------------------------------------------- 2. CCTV and video wall
cx0, cy0 = 2.0, 6.0
with G.at((cx0, cy0, Z)):
    # video wall: 2 x 2 LED panels on a frame (image drawn by the engine)
    G.box(m["paint_dark"], (2.7, 0.1, 1.7), at=(0, -0.1, 1.75), bevel=0.01)
    for sx_ in (-1.15, 1.15):
        G.box(m["paint_dark"], (0.08, 0.3, 0.95), at=(sx_, -0.1, 0.47))
        G.box(m["paint_dark"], (0.6, 0.5, 0.03), at=(sx_, -0.1, 0.015))
    with G.group("scr_cctv", bake="none", screen="cctv"):
        G.plane(m["screen"], (2.56, 1.56), at=(0, -0.045, 1.75), rot=(90, 0, 180), uvfit=True)
    # operator console
    G.box(m["paint_dark"], (1.6, 0.6, 0.04), at=(0, 1.3, 0.8), bevel=0.008)
    for sx_ in (-0.72, 0.72):
        G.box(m["paint_dark"], (0.06, 0.5, 0.8), at=(sx_, 1.3, 0.4))
    G.box(m["plastic_dark"], (0.42, 0.14, 0.02), at=(-0.25, 1.4, 0.83))
    G.cyl(m["plastic_dark"], 0.02, 0.1, at=(0.35, 1.38, 0.87), seg=8)
    G.box(m["plastic_dark"], (0.16, 0.12, 0.03), at=(0.35, 1.38, 0.83), bevel=0.006)
# camera column with a PTZ dome and two fixed cameras
with G.at((cx0 + 1.75, cy0 + 1.0, Z)):
    G.cyl(m["galv"], 0.2, 0.05, at=(0, 0, 0.025), seg=14)
    G.cyl(m["galv"], 0.06, 3.4, at=(0, 0, 1.7), seg=10)
    G.box(m["galv"], (0.9, 0.05, 0.05), at=(0, 0, 3.3))
    G.cyl(m["white"], 0.11, 0.1, at=(0, 0.18, 3.18), seg=16)
    with G.group("ptz", bake="vc", pivot=(0, 0.18, 3.1), pan=[0.9, 0.22]):
        G.sphere(m["plastic_dark"], 0.1, at=(0, 0.18, 3.08), seg=14, rings=8)
        G.cyl(m["glass_dark"], 0.04, 0.03, at=(0, 0.27, 3.04), axis="y", seg=10)
    for sx_ in (-0.4, 0.4):
        G.box(m["white"], (0.1, 0.3, 0.1), at=(sx_, 0.12, 3.18), rot=(-14, 0, 12 if sx_ < 0 else -12), bevel=0.01)
        G.cyl(m["glass_dark"], 0.035, 0.02, at=(sx_ + (0.03 if sx_ < 0 else -0.03), 0.28, 3.14), axis="y", seg=10)
        G.box(m["led_red"], (0.01, 0.006, 0.01), at=(sx_, 0.27, 3.2))
    G.box(m["paint_grey"], (0.3, 0.16, 0.4), at=(0, 0.1, 1.5), bevel=0.01)
station(G, "cctv", (cx0, cy0, Z + 1.9), target=(cx0 - 0.1, cy0, 1.7), fov=54)

# ----------------------------------------------------------------------------- 3. access control lane
ax, ay = 6.2, 6.6
with G.at((ax, ay, Z)):
    # three stainless pedestals forming two lanes with glass flaps
    for i, xx in enumerate((-1.2, 0.0, 1.2)):
        G.box(SS, (0.26, 1.3, 0.98), at=(xx, 0, 0.49), bevel=0.03, maxseg=0.6)
        G.box(m["plastic_dark"], (0.2, 1.24, 0.02), at=(xx, 0, 0.99))
        G.box(m["led_green"] if i != 1 else m["accent"], (0.12, 0.012, 0.03), at=(xx, 0.652, 0.86))
        G.plane(m["screen"], (0.12, 0.08), at=(xx, 0.45, 1.002), uvfit=True)
    for i, (xx, sgn) in enumerate(((-1.07, 1), (-0.13, -1), (0.13, 1), (1.07, -1))):
        with G.group(f"flap{i}", bake="none", pivot=(xx, 0, 0.55), swing=[sgn * 1.25, 3.4, 0.5 if i < 2 else 2.2], env="floor"):
            G.plane(m["glass_clear"], (0.44, 0.75), at=(xx + sgn * 0.22, 0, 0.6), rot=(-90, 0, 0))
            G.box(SS, (0.44, 0.02, 0.03), at=(xx + sgn * 0.22, 0, 0.96))
    # door frame with maglock and biometric reader behind the lane
    for xx in (2.1, 3.1):
        G.box(m["paint_dark"], (0.08, 0.12, 2.2), at=(xx, -1.3, 1.1))
    G.box(m["paint_dark"], (1.08, 0.12, 0.08), at=(2.6, -1.3, 2.2))
    G.box(m["wood_dark"], (0.9, 0.05, 2.1), at=(2.6, -1.3, 1.07), maxseg=0.7)
    G.box(SS, (0.5, 0.08, 0.06), at=(2.6, -1.24, 2.12))
    G.box(m["plastic_dark"], (0.1, 0.03, 0.16), at=(1.95, -1.22, 1.3), bevel=0.006)
    G.box(m["accent"], (0.06, 0.006, 0.02), at=(1.95, -1.2, 1.35))
    G.box(m["paint_grey"], (0.4, 0.14, 0.5), at=(3.5, -1.3, 1.6), bevel=0.01)
    G.box(m["led_green"], (0.02, 0.006, 0.02), at=(3.4, -1.22, 1.78))
station(G, "access", (ax, ay + 0.7, Z + 1.0), target=(ax - 0.1, ay - 0.2, 1.0))

# ----------------------------------------------------------------------------- 4. network cabinet
nx, ny = 10.0, 6.3
with G.at((nx, ny, Z)):
    G.box(m["paint_dark"], (0.7, 0.7, 0.05), at=(0, 0, 0.025))
    for sx_ in (-0.3, 0.3):
        for sy_ in (-0.3, 0.3):
            G.box(m["paint_dark"], (0.05, 0.05, 2.1), at=(sx_, sy_, 1.07))
    G.box(m["paint_dark"], (0.7, 0.7, 0.05), at=(0, 0, 2.13))
    u = 0.11
    for i in range(15):
        z = 0.25 + i * u
        kind = i % 5
        if kind in (0, 3):
            # patch panel with a row of ports
            G.box(m["plastic_dark"], (0.56, 0.05, u * 0.8), at=(0, 0.3, z))
            for k in range(12):
                G.box(m["castiron"], (0.028, 0.01, 0.03), at=(-0.23 + k * 0.042, 0.33, z))
        elif kind in (1, 4):
            # switch with link LEDs
            G.box(m["paint_grey"], (0.56, 0.3, u * 0.8), at=(0, 0.17, z))
            for k in range(12):
                G.box(m["led_green"] if (k * 7 + i) % 5 else m["led_amber"], (0.012, 0.006, 0.012), at=(-0.23 + k * 0.042, 0.324, z + 0.02))
        else:
            G.box(m["castiron"], (0.56, 0.02, u * 0.5), at=(0, 0.3, z))
    # patch cords looping between panels
    for k in range(7):
        x = -0.22 + k * 0.07
        z0 = 0.25 + (k % 3) * 5 * u
        G.tube(FIBRE if k % 2 else m["cable_blue"], [(x, 0.34, z0), (x, 0.42, z0 - 0.06), (x + 0.03, 0.42, z0 + u - 0.03), (x + 0.03, 0.34, z0 + u)], 0.007, seg=5, bend=0.03)
    eq.cables(G, [m["cable_blue"], FIBRE], [(0, -0.2, 2.15), (0, -0.2, 2.9), (-1.0, -0.2, 2.9)], n=5, r=0.012, spread=0.03, axis="x")
# wireless access point on a post and a touch display
G.cyl(m["galv"], 0.03, 2.6, at=(nx + 1.0, ny - 0.4, Z + 1.3), seg=8)
G.cyl(m["white"], 0.13, 0.04, at=(nx + 1.0, ny - 0.4, Z + 2.62), seg=18)
G.box(m["accent"], (0.03, 0.03, 0.006), at=(nx + 1.0, ny - 0.3, Z + 2.598))
eq.monitor(G, m, (nx - 1.25, ny - 0.2, Z + 1.45), size=(1.3, 0.76), name="smartboard", facing="+y")
station(G, "network", (nx, ny + 0.4, Z + 1.3), target=(nx - 0.2, ny, 1.35))

# ----------------------------------------------------------------------------- 5. software desk
dx, dy = 13.2, 6.4
with G.at((dx, dy, Z)):
    G.box(m["wood"], (2.2, 0.85, 0.04), at=(0, 0, 0.75), bevel=0.008)
    for sx_ in (-1.0, 1.0):
        G.box(m["paint_dark"], (0.05, 0.75, 0.75), at=(sx_, 0, 0.375))
    G.box(m["paint_dark"], (2.0, 0.04, 0.3), at=(0, -0.36, 0.55))
    G.box(m["plastic_dark"], (0.44, 0.15, 0.02), at=(-0.35, 0.22, 0.78))
    G.box(m["plastic_dark"], (0.07, 0.11, 0.03), at=(0.05, 0.24, 0.785), bevel=0.01)
    G.box(m["paint_dark"], (0.2, 0.45, 0.42), at=(0.85, -0.05, 0.98), bevel=0.01)
    G.box(m["accent"], (0.01, 0.006, 0.1), at=(0.85, 0.176, 1.02))
    # tablet on a stand
    G.box(m["plastic_dark"], (0.26, 0.02, 0.18), at=(0.4, 0.2, 0.9), rot=(-20, 0, 0), bevel=0.006)
eq.monitor(G, m, (dx - 0.6, dy - 0.15, Z + 1.13), size=(0.62, 0.36), name="code", facing="+y", stand=False)
eq.monitor(G, m, (dx + 0.1, dy - 0.15, Z + 1.13), size=(0.62, 0.36), name="bi", facing="+y", stand=False)
for xx in (dx - 0.6, dx + 0.1):
    G.box(m["plastic_dark"], (0.05, 0.05, 0.2), at=(xx, dy - 0.12, Z + 0.87))
    G.box(m["plastic_dark"], (0.24, 0.16, 0.012), at=(xx, dy - 0.12, Z + 0.776))
eq.monitor(G, m, (dx, dy - 1.2, Z + 1.95), size=(2.2, 1.24), name="erp", facing="+y")
# task chair
with G.at((dx - 0.2, dy + 0.75, Z)):
    G.cyl(m["plastic_dark"], 0.3, 0.03, at=(0, 0, 0.04), seg=5)
    G.cyl(m["chrome"], 0.025, 0.4, at=(0, 0, 0.25), seg=8)
    G.box(m["fabric"], (0.46, 0.46, 0.07), at=(0, 0, 0.48), bevel=0.02)
    G.box(m["fabric"], (0.42, 0.06, 0.5), at=(0, 0.22, 0.8), rot=(-8, 0, 0), bevel=0.02)
station(G, "software", (dx - 0.25, dy - 0.1, Z + 1.15), cam=(12.7, 11.5, 1.62), target=(13.1, 6.0, 1.45), stand=(11.7, 8.6, 0.12), fov=56)

flow(G, "data", [(-3.65, 6.15, Z + 2.76), (-0.2, 6.15, Z + 2.76), (2.0, 6.0, Z + 2.7), (5.0, 6.2, Z + 2.9), (9.0, 6.1, Z + 2.9), (10.0, 6.1, Z + 2.2), (10.0, 6.5, Z + 1.2)], speed=4.5, color="#5ad2ff", count=10, size=0.13)

overview(G)
finish(G, "ict")
