"""Level 05 - Civil: the ground, opened up.
Earthworks and drainage -> footing and rebar -> precast panels -> road build-up -> parking shade.
Scope: FAST O&M profile pp. 11-12.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exhibit_common import *
from gallery import PX0, PX1, PY0, PY1

G, m = begin()
Z = eq.platform(G, m, PX0, PX1, PY0, PY1)
PVC = M("pvc_blue", "#2f7fc4", rough=0.5)
FORM = M("formply", "#b98a4e", rough=0.7, tex="wood", tile=1.2)
ASPH = M("asph_layer", "#26282b", rough=0.9, tex="asphalt", tile=1.5)
BASE = M("base_course", "#9a8c78", rough=0.95, tex="asphalt", tile=1.0)
FABRIC = M("shade_fabric", "#efe9dc", rough=0.8, side="double")

# ----------------------------------------------------------------------------- 1. earthworks & drainage
ex, ey = -2.6, 6.4
with G.at((ex, ey, Z)):
    # block of ground cut open: three strata, with a trench through the top two
    L, W = 3.2, 2.4
    G.box(m["soil_b"], (L, W, 0.4), at=(0, 0, 0.2), maxseg=0.8)
    for sx, w in ((-1.05, 1.1), (1.05, 1.1)):
        G.box(m["soil_a"], (w, W, 0.38), at=(sx, 0, 0.59), maxseg=0.8)
        G.box(m["sand"], (w, W, 0.22), at=(sx, 0, 0.89), maxseg=0.8)
    # trench: gravel bedding, drain pipe, trench shoring
    G.box(m["gravel"], (1.0, W, 0.16), at=(0, 0, 0.48))
    G.cyl(PVC, 0.16, W + 0.3, at=(0, 0, 0.7), axis="y", seg=18)
    G.cyl(M("pvc_dark", "#1f5d94", rough=0.5), 0.18, 0.12, at=(0, 0.4, 0.7), axis="y", seg=18)
    for sy in (-0.7, 0.5):
        for sx in (-0.47, 0.47):
            G.box(FORM, (0.03, 0.9, 0.56), at=(sx, sy, 0.72))
        G.cyl(m["paint_yellow"], 0.025, 0.9, at=(0, sy, 0.92), axis="x", seg=6)
    # precast manhole ring and cover at the end of the run
    G.cyl(m["conc_fresh"], 0.42, 0.75, at=(0, -1.0, 0.72), seg=20)
    G.cyl(m["castiron"], 0.3, 0.04, at=(0, -1.0, 1.11), seg=20)
    # survey level on a tripod and a ranging pole
    with G.at((1.15, 0.6, 1.0)):
        for a in range(3):
            ang = a * 2.094
            G.cyl(m["paint_yellow"], 0.012, 1.3, at=(math.cos(ang) * 0.25, math.sin(ang) * 0.25, 0.6), rot=(-math.sin(ang) * 22, math.cos(ang) * 22, 0), seg=5)
        G.box(m["paint_ral"], (0.2, 0.1, 0.12), at=(0, 0, 1.3), bevel=0.01)
        G.cyl(m["plastic_dark"], 0.03, 0.14, at=(0.12, 0, 1.3), axis="x", seg=8)
    for k in range(5):
        G.cyl(m["paint_red"] if k % 2 else m["white"], 0.015, 0.3, at=(-1.2, -0.7, 1.15 + k * 0.3), seg=6)
    # plate compactor on the fill
    G.box(m["castiron"], (0.5, 0.36, 0.06), at=(1.1, -0.55, 1.03))
    G.box(m["paint_yellow"], (0.3, 0.3, 0.26), at=(1.1, -0.55, 1.2), bevel=0.02)
    G.tube(m["paint_dark"], [(0.95, -0.7, 1.2), (0.7, -0.7, 1.75), (0.7, -0.4, 1.75), (0.95, -0.4, 1.2)], 0.014, seg=6, bend=0.06)
station(G, "earthworks", (ex, ey + 0.55, Z + 0.75), target=(ex - 0.2, ey, 1.0))

# ----------------------------------------------------------------------------- 2. foundation & structural concrete
fx, fy = 1.7, 6.4
with G.at((fx, fy, Z)):
    G.box(m["gravel"], (2.4, 2.2, 0.08), at=(0, 0, 0.04))
    # footing: left half poured, right half still open reinforcement
    G.box(m["conc_fresh"], (0.95, 1.8, 0.5), at=(-0.52, 0, 0.33), maxseg=0.5)
    rb = m["rebar"]
    for k in range(7):
        y = -0.8 + k * 0.266
        G.cyl(rb, 0.012, 1.0, at=(0.48, y, 0.16), axis="x", seg=5)
        G.cyl(rb, 0.012, 1.0, at=(0.48, y, 0.5), axis="x", seg=5)
    for k in range(4):
        x = 0.1 + k * 0.26
        G.cyl(rb, 0.012, 1.8, at=(x, 0, 0.18), axis="y", seg=5)
        G.cyl(rb, 0.012, 1.8, at=(x, 0, 0.52), axis="y", seg=5)
    # formwork on the open side
    G.box(FORM, (0.04, 2.0, 0.62), at=(1.02, 0, 0.39))
    G.box(FORM, (1.0, 0.04, 0.62), at=(0.5, 0.92, 0.39))
    for k in range(3):
        G.box(m["wood"], (0.08, 0.08, 0.8), at=(1.14, -0.7 + k * 0.7, 0.4), rot=(0, 20, 0))
    # column cage rising from the footing: verticals and stirrups, lower part cast
    G.box(m["conc_fresh"], (0.46, 0.46, 0.9), at=(0, 0, 1.03), maxseg=0.5)
    for sx in (-0.17, 0.17):
        for sy in (-0.17, 0.17):
            G.cyl(rb, 0.014, 2.4, at=(sx, sy, 1.75), seg=5)
    for k in range(8):
        z = 1.55 + k * 0.17
        for sx, sy, w, d in ((0, -0.17, 0.36, 0.012), (0, 0.17, 0.36, 0.012), (-0.17, 0, 0.012, 0.36), (0.17, 0, 0.012, 0.36)):
            G.box(rb, (w, d, 0.012), at=(sx, sy, z))
    # anchor bolts cast into the pour for a steel column
    G.box(m["galv"], (0.34, 0.34, 0.02), at=(-0.62, 0.55, 0.59))
    for bx in (-0.12, 0.12):
        for by in (-0.12, 0.12):
            G.cyl(m["galv"], 0.012, 0.22, at=(-0.62 + bx, 0.55 + by, 0.66), seg=6)
station(G, "foundation", (fx + 0.1, fy + 0.3, Z + 1.7), target=(fx, fy, 1.15))

# ----------------------------------------------------------------------------- 3. precast panels and boundary wall
px, py = 6.2, 6.2
with G.at((px, py, Z)):
    post = m["conc_fresh"]
    for i in range(3):
        x = -2.2 + i * 2.2
        G.box(post, (0.24, 0.24, 2.5), at=(x, 0, 1.25), bevel=0.01, maxseg=0.8)
        G.box(post, (0.3, 0.3, 0.06), at=(x, 0, 2.53))
    # two bays: left bay complete (three stacked panels), right bay with the last panel being lowered
    for k in range(3):
        G.box(m["concrete"], (1.94, 0.12, 0.72), at=(-1.1, 0, 0.42 + k * 0.74), bevel=0.012, maxseg=0.7)
    for k in range(2):
        G.box(m["concrete"], (1.94, 0.12, 0.72), at=(1.1, 0, 0.42 + k * 0.74), bevel=0.012, maxseg=0.7)
    with G.group("panel_lift", bake="vc", pivot=(1.1, 0, 3.9), bob=[0.07, 0.35]):
        G.box(m["concrete"], (1.94, 0.12, 0.72), at=(1.1, 0, 2.62), bevel=0.012, maxseg=0.7)
        for sx in (-0.7, 0.7):
            G.cyl(m["castiron"], 0.008, 1.0, at=(1.1 + sx / 2, 0, 3.42), rot=(0, -36 * (1 if sx > 0 else -1), 0), seg=5)
        G.box(m["paint_yellow"], (0.14, 0.1, 0.2), at=(1.1, 0, 3.92), bevel=0.01)
        G.cyl(m["castiron"], 0.012, 1.4, at=(1.1, 0, 4.7), seg=5)
    # stack of hollow-core planks
    with G.at((0.2, 1.5, 0)):
        for bx in (-0.9, 0.9):
            G.box(m["wood"], (0.1, 1.2, 0.08), at=(bx, 0, 0.04))
        for k in range(3):
            G.box(m["concrete"], (2.6, 1.15, 0.16), at=(0, 0, 0.17 + k * 0.2), bevel=0.01)
            for c_ in range(6):
                G.cyl(m["castiron"], 0.045, 0.01, at=(1.301, -0.45 + c_ * 0.18, 0.17 + k * 0.2), axis="x", seg=10)
station(G, "precast", (px + 1.1, py + 0.2, Z + 2.6), target=(px + 0.4, py, 1.6), fov=58)

# ----------------------------------------------------------------------------- 4. road build-up
rx, ry = 10.2, 6.3
with G.at((rx, ry, Z)):
    L, W = 3.0, 2.2
    layers = [(m["soil_b"], 0.22, 0.0), (BASE, 0.2, 0.32), (m["gravel"], 0.16, 0.64), (ASPH, 0.1, 0.96), (ASPH, 0.06, 1.28)]
    z = 0.0
    for mat_, th_, cut in layers:
        # each layer is cut back further so every course of the build-up is visible
        G.box(mat_, (L - cut, W, th_), at=(-cut / 2, 0, z + th_ / 2), maxseg=0.8)
        z += th_
    top = z
    G.box(m["paint"], (L - 1.28, 0.12, 0.006), at=(-0.64, -0.2, top + 0.003))
    for k in range(3):
        G.box(m["paint"], (0.5, 0.1, 0.006), at=(-1.9 + k * 0.9, 0.55, top + 0.003))
    # kerb, gutter and block paving on the far side
    G.box(m["kerb"], (L, 0.18, top + 0.14), at=(0, -W / 2 - 0.09, (top + 0.14) / 2), bevel=0.02)
    G.box(m["paving"], (L, 0.7, top + 0.1), at=(0, -W / 2 - 0.53, (top + 0.1) / 2), maxseg=0.8)
    # ride-on roller on the finished course
    with G.at((-1.25, 0.1, top)):
        G.cyl(m["steel"], 0.3, 0.9, at=(0.55, 0, 0.3), axis="y", seg=20)
        G.cyl(m["steel"], 0.3, 0.9, at=(-0.55, 0, 0.3), axis="y", seg=20)
        G.box(m["paint_yellow"], (1.3, 0.8, 0.4), at=(0, 0, 0.72), bevel=0.04)
        G.box(m["plastic_dark"], (0.4, 0.5, 0.3), at=(-0.2, 0, 1.05), bevel=0.03)
        G.cyl(m["plastic_dark"], 0.02, 0.5, at=(0.25, 0, 1.15), rot=(0, 20, 0), seg=6)
station(G, "road", (rx + 0.6, ry + 0.4, Z + 0.8), target=(rx - 0.2, ry, 0.95))

# ----------------------------------------------------------------------------- 5. parking shade
sx0, sy0 = 13.2, 5.9
with G.at((sx0, sy0, Z)):
    G.box(ASPH, (3.2, 5.2, 0.05), at=(0, 0.3, 0.025))
    for k in (-1, 1):
        G.box(m["paint"], (0.1, 4.6, 0.006), at=(k * 1.35, 0.3, 0.053))
    # cantilever posts with curved arms and tensioned membrane
    for sy in (-1.6, 2.2):
        G.box(m["conc_fresh"], (0.5, 0.5, 0.1), at=(1.45, sy, 0.1))
        G.cyl(m["paint_ral"], 0.07, 2.6, at=(1.45, sy, 1.4), seg=10)
        G.tube(m["paint_ral"], [(1.45, sy, 2.6), (1.2, sy, 2.95), (0.2, sy, 3.05), (-1.5, sy, 2.7)], 0.05, seg=8, bend=0.5)
        G.cyl(m["galv"], 0.01, 1.9, at=(0.6, sy, 2.6), rot=(0, 62, 0), seg=5)
    verts, faces = [], []
    nx, ny = 8, 6
    for j in range(ny + 1):
        for i in range(nx + 1):
            u, v = i / nx, j / ny
            x = 1.3 - u * 2.9
            y = -1.75 + v * 4.1
            zz = 2.98 - (u - 0.35) ** 2 * 0.9 + math.sin(v * math.pi) * 0.16
            verts.append((x, y, zz))
    for j in range(ny):
        for i in range(nx):
            a = j * (nx + 1) + i
            faces.append([a, a + 1, a + nx + 2, a + nx + 1])
    G.add_raw(FABRIC, verts, faces)
    with G.at((-0.1, 0.3, 0.05), rz=90):
        kit.car(G, m, "sedan", M("car_pearl", "#d9dcdf", rough=0.28, metal=0.4), lights=False)
station(G, "shade", (sx0, sy0 + 1.0, Z + 2.9), cam=(12.4, 11.6, 1.62), target=(13.2, 6.0, 1.7), stand=(11.4, 8.6, 0.12), fov=60)

overview(G)
finish(G, "civil")
