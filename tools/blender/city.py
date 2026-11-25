"""The district around FAST Tower: seen from the street, through every floor's glazing and from the roof.
A conceptual Gulf-coast business district (not a survey of Dammam): boulevard grid, low and mid-rise blocks,
a taller cluster to the east and the sea to the north. Window grids are drawn by the engine's facade
shader, so the model stays tiny.

  blender -b --factory-startup -P tools/blender/city.py -- [--preview] [--fast]
"""
import sys, os, json, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastlib import *
import kit, building as B

reset_scene()
m = kit.mats()
G = Geo()
SKY = json.load(open(os.path.join(WORK, "sky.json")))["sunset"]
rnd = random.Random(11)

FAC = [M(f"facade_{i}", c, rough=0.85, windows=1, tile=1.0) for i, c in enumerate(("#d9ccb4", "#c9b9a0", "#e4ddd0", "#b9a88f", "#aab3ba", "#8f9aa6"))]
GLASSY = M("facade_glass", "#7f95a8", rough=0.25, metal=0.6, windows=1, tile=1.0)
ROOF = M("roof", "#b8b0a2", rough=0.9)
ROAD = M("road_far", "#3d3f43", rough=0.95)
PAVE = M("pave_far", "#b9ae9c", rough=0.9)
GROUND = M("ground_far", "#c4b08a", rough=0.95)
SEA = M("sea", "#3a5f7a", rough=0.08, metal=0.7, kind="water")

BLOCK = 96.0          # street grid pitch
STREET = 16.0
N = 6                 # blocks each side

# ----------------------------------------------------------------------------- ground, sea, streets
G.box(GROUND, (2400, 1500, 0.4), at=(0, -330, -0.5))
with G.group("sea", bake="none"):
    G.plane(SEA, (5000, 3000), at=(0, 420 + 1500, -0.6))
for i in range(-N, N + 1):
    # streets run both ways; the boulevard in front of the tower is the y = -26.4 line
    G.box(ROAD, (STREET, 1400, 0.1), at=(i * BLOCK + 48, -280, -0.2))
    if -9 <= i <= 4:
        G.box(ROAD, (2 * N * BLOCK + 200, STREET, 0.1), at=(0, -26.4 + i * BLOCK, -0.2))
# corniche promenade along the shore
G.box(PAVE, (2 * N * BLOCK + 200, 14, 0.1), at=(0, 410, -0.18))
# ----------------------------------------------------------------------------- the ground around the tower
# What the visitor looks down on from the floors, the roof and the closing drone shot: marked roads with
# sidewalks, the tower's own plot (forecourt, garden, car park), and a park across the boulevard.
GRASS = M("grass_far", "#5b7b42", rough=0.95)
GRASS2 = M("grass_far2", "#6d8d4c", rough=0.95)
PAVE2 = M("pave_light", "#d9d0be", rough=0.9)
PATH = M("path_far", "#cdb994", rough=0.9)
MARK = M("mark_w", "#e9e6dc", rough=0.8)
MARKY = M("mark_y", "#d9a61f", rough=0.8)
COURT = M("court_far", "#3f7f6a", rough=0.85)
COURT2 = M("court_far2", "#b5553c", rough=0.85)
POND = M("pond_far", "#3f7fa6", rough=0.08, metal=0.6)
HEDGE = M("hedge_far", "#3f5a34", rough=0.95)
FLOWER = [M("flower_a", "#c8566a", rough=0.9), M("flower_b", "#e0b03a", rough=0.9), M("flower_c", "#d8d2e6", rough=0.9)]
CANOPY = [M("canopy_a", "#4f7038", rough=0.9), M("canopy_b", "#5f7f3b", rough=0.9), M("canopy_c", "#476a3f", rough=0.9)]
CARC = [M(f"car_far{i}", c, rough=0.4, metal=0.5) for i, c in enumerate(("#ecebe7", "#b9bcc0", "#2b2e33", "#8a1f1f", "#1f4f86", "#d8d3c4"))]
nr = random.Random(23)
MZ = -0.02            # road paint sits just above every road surface
XS_ = [i * BLOCK + 48 for i in range(-2, 2)]            # north-south streets near the tower
YS_ = [-26.4 + j * BLOCK for j in range(-2, 2)]         # east-west streets (the boulevard is -26.4)


def palm(x, y, h=7.5):
    """A date palm that still reads as one from the air: tapering trunk and a crown of drooping fronds."""
    G.cyl(m["trunk"], 0.22, h, at=(x, y, h / 2), seg=5, r2=0.15)
    a0 = nr.uniform(0, 6.28)
    for k in range(9):
        az = a0 + k * 6.283 / 9
        L, tilt = nr.uniform(2.7, 3.4), nr.uniform(16, 36)
        c, s = math.cos(math.radians(tilt)), math.sin(math.radians(tilt))
        G.plane(m["leaf"], (L, 0.8), at=(x + math.cos(az) * L / 2 * c, y + math.sin(az) * L / 2 * c, h + 0.1 - s * L / 2), rot=(0, tilt, math.degrees(az)))
    for k in range(5):
        az = a0 + 0.4 + k * 6.283 / 5
        L, tilt = 2.1, -28.0
        c, s = math.cos(math.radians(tilt)), math.sin(math.radians(tilt))
        G.plane(m["leaf_dry"] if k == 0 else m["leaf"], (L, 0.6), at=(x + math.cos(az) * L / 2 * c, y + math.sin(az) * L / 2 * c, h + 0.1 - s * L / 2), rot=(0, tilt, math.degrees(az)))


def tree(x, y, s=1.0, full=True):
    """Shade tree: trunk and a rounded, slightly lopsided canopy."""
    mat = nr.choice(CANOPY)
    G.cyl(m["trunk"], 0.17 * s, 2.8 * s, at=(x, y, 1.4 * s), seg=5)
    G.sphere(mat, 2.3 * s, at=(x, y, 4.0 * s), seg=7, rings=5, scale=(1, 1, 0.82))
    if full:
        a = nr.uniform(0, 6.28)
        G.sphere(mat, 1.5 * s, at=(x + math.cos(a) * 1.1 * s, y + math.sin(a) * 1.1 * s, 4.9 * s), seg=6, rings=4)


def lamp(x, y, rz=0.0):
    G.cyl(m["darkmetal"], 0.09, 9.0, at=(x, y, 4.5), seg=4)
    with G.at((x, y, 9.0), rz=rz):
        G.box(m["lamp_head"], (1.5, 0.34, 0.1), at=(0.5, 0, 0))


def car(x, y, rz, lights=True):
    with G.at((x, y, 0), rz=rz):
        G.box(nr.choice(CARC), (4.4, 1.8, 0.78), at=(0, 0, 0.62))
        G.box(m["glass_dark"], (2.3, 1.62, 0.5), at=(-0.25, 0, 1.24))
        if lights:
            G.box(m["head"], (0.06, 1.4, 0.14), at=(2.21, 0, 0.66))
            G.box(m["tail"], (0.06, 1.4, 0.12), at=(-2.21, 0, 0.72))


def dashes(x0, y0, x1, y1, pitch=9.0, length=3.2):
    """White lane dashes along a straight line (axis-aligned)."""
    n = int(math.hypot(x1 - x0, y1 - y0) / pitch)
    along_x = abs(x1 - x0) > abs(y1 - y0)
    for k in range(n):
        t = (k + 0.5) / n
        G.plane(MARK, (length, 0.22) if along_x else (0.22, length), at=(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, MZ))


def zebra(x, y, along_x, half=6.2):
    """Pedestrian crossing across a street that runs along x (along_x) or along y."""
    for k in range(-4, 4):
        o = (k + 0.5) * half / 4
        G.plane(MARK, (3.0, 0.75) if along_x else (0.75, 3.0), at=(x, y + o, MZ) if along_x else (x + o, y, MZ))


with G.group("near", bake="vc", near=1):
    # ---- city blocks get a pavement slab, so every street has kerbs and sidewalks
    for bi in range(-2, 3):
        for bj in range(-3, 2):
            G.box(PAVE, (81.0, 81.0, 0.26), at=(bi * BLOCK, bj * BLOCK + 21.6, -0.17))
    # ---- streets: centre line, lane dashes, crossings, lamps, a little traffic
    for X in XS_:
        for j in range(-3, 2):
            ya, yb = -26.4 + j * BLOCK + 8.0, -26.4 + (j + 1) * BLOCK - 8.0
            G.plane(MARKY, (0.3, yb - ya - 9.0), at=(X, (ya + yb) / 2, MZ))
            dashes(X - 3.6, ya + 5, X - 3.6, yb - 5)
            dashes(X + 3.6, ya + 5, X + 3.6, yb - 5)
            if abs(X) < 100 and -3 < j < 1:
                zebra(X, ya + 2.2, False)
                zebra(X, yb - 2.2, False)
            for k in range(3):
                yy = ya + 12 + k * 28
                lamp(X - 8.3, yy, 0)
                lamp(X + 8.3, yy + 14, 180)
            for k in range(nr.randint(1, 3)):
                north = nr.random() < 0.5
                car(X + (nr.choice((1.8, 5.4)) if north else -nr.choice((1.8, 5.4))), nr.uniform(ya + 8, yb - 8), 90 if north else -90)
    for Y in YS_:
        boulevard = abs(Y + 26.4) < 1
        for i in range(-3, 2):
            xa, xb = i * BLOCK + 48 + 8.0, (i + 1) * BLOCK + 48 - 8.0
            if boulevard:
                # planted median with palms; two lanes each way
                G.box(ROAD, (xb - xa + 16, 16.8, 0.1), at=((xa + xb) / 2, Y, -0.15))
                G.box(PAVE2, (xb - xa - 8, 2.4, 0.2), at=((xa + xb) / 2, Y, -0.06))
                G.box(GRASS, (xb - xa - 12, 1.5, 0.06), at=((xa + xb) / 2, Y, 0.05))
                for k in range(7):
                    palm(xa + 8 + k * (xb - xa - 16) / 6, Y, nr.uniform(6.8, 8.2))
                dashes(xa + 5, Y - 4.8, xb - 5, Y - 4.8)
                dashes(xa + 5, Y + 4.8, xb - 5, Y + 4.8)
                lanes = (3.0, 6.4)
            else:
                G.plane(MARKY, (xb - xa - 9.0, 0.3), at=((xa + xb) / 2, Y, MZ))
                dashes(xa + 5, Y - 3.6, xb - 5, Y - 3.6)
                dashes(xa + 5, Y + 3.6, xb - 5, Y + 3.6)
                lanes = (1.8, 5.4)
            if -3 < i < 1 and abs(Y) < 130:
                zebra(xa + 2.2, Y, True, 7.6 if boulevard else 6.2)
                zebra(xb - 2.2, Y, True, 7.6 if boulevard else 6.2)
            for k in range(3):
                xx = xa + 12 + k * 28
                lamp(xx, Y - (9.0 if boulevard else 8.3), 90)
                lamp(xx + 14, Y + (9.0 if boulevard else 8.3), -90)
            for k in range(nr.randint(1, 3)):
                east = nr.random() < 0.5
                car(nr.uniform(xa + 8, xb - 8), Y - nr.choice(lanes) if east else Y + nr.choice(lanes), 0 if east else 180)
    # ---- sidewalk trees on the blocks facing the tower and the park
    for bi in range(-1, 2):
        for bj in range(-2, 1):
            if bi == 0:
                continue
            cx, cy = bi * BLOCK, bj * BLOCK + 21.6
            for k in range(5):
                o = -32 + k * 16
                tree(cx - bi * 38.8, cy + o, nr.uniform(0.8, 1.05), full=False)
    # ---- the tower's own plot: x -40..40, y -18..62 (the tower stands on x -20..20, y 0..26)
    G.box(PAVE2, (60.0, 50.0, 0.12), at=(0, 6.0, -0.02))                # forecourt and apron, top +0.04
    G.box(m["stone_dark"], (46.0, 32.0, 0.14), at=(0, 13.0, 0.02))      # dark base course the tower sits on
    G.box(m["stone_dark"], (9.0, 16.5, 0.08), at=(0, -9.5, 0.03))       # entrance walk from the boulevard
    for sx in (-1, 1):
        for py in (-6.0, -13.0):
            G.box(m["stone"], (7.0, 2.2, 0.6), at=(sx * 10.5, py, 0.3))
            G.box(HEDGE, (6.5, 1.7, 0.5), at=(sx * 10.5, py, 0.82))
        for py in (-5.5, -12.5):
            palm(sx * 6.2, py, 7.8)
        palm(sx * 17.5, -9.0, 8.4)
        palm(sx * 24.5, -15.0, 7.2)
    # west garden
    G.box(GRASS, (13.0, 46.0, 0.1), at=(-32.0, 8.0, 0.0))
    G.box(PATH, (2.2, 46.0, 0.06), at=(-24.2, 8.0, 0.04))
    for k in range(5):
        tree(-33.0 + nr.uniform(-2.5, 2.5), -11.0 + k * 9.5, nr.uniform(0.85, 1.2))
    for k in range(3):
        G.cyl(nr.choice(FLOWER), 1.5, 0.1, at=(-28.5, -6.0 + k * 13.0, 0.08), seg=10)
    # east car park, with marked bays
    G.box(ROAD, (15.5, 52.0, 0.1), at=(31.5, 10.0, 0.0))
    for k in range(18):
        yy = -14.0 + k * 2.8
        G.plane(MARK, (5.0, 0.14), at=(26.5, yy, 0.06))
        G.plane(MARK, (5.0, 0.14), at=(36.5, yy, 0.06))
        if k < 17:
            if nr.random() < 0.6:
                car(26.6, yy + 1.4, 0 if nr.random() < 0.5 else 180, lights=False)
            if nr.random() < 0.55:
                car(36.4, yy + 1.4, 0 if nr.random() < 0.5 else 180, lights=False)
    # service yard and a row of trees behind the tower
    G.box(ROAD, (44.0, 22.0, 0.1), at=(0, 44.0, 0.0))
    for k in range(6):
        G.plane(MARK, (0.14, 5.0), at=(-12.0 + k * 3.0, 51.0, 0.06))
    car(-10.5, 51.0, 90, lights=False)
    car(-1.5, 51.0, -90, lights=False)
    G.box(m["white"], (2.4, 6.5, 2.6), at=(12.0, 48.0, 1.45))           # a delivery truck
    G.box(m["glass_dark"], (2.2, 1.6, 1.2), at=(12.0, 44.2, 0.9))
    for k in range(8):
        tree(-35.0 + k * 10.0, 59.0, nr.uniform(0.8, 1.05), full=False)
    for px, py, rz in ((-22, -16.5, 90), (22, -16.5, 90), (-38.5, 20, 0), (38.5, 30, 180), (0, 34, 90)):
        lamp(px, py, rz)

    # ---- the park across the boulevard: x -40..40, y -114..-35
    PX, PY = 0.0, -74.4
    G.box(GRASS, (75.0, 75.0, 0.1), at=(PX, PY, 0.0))                   # lawn, top +0.05
    for qx, qy, rr in ((-20, 19, 9.5), (19, -21, 8.0), (21, 20, 7.0)):
        G.cyl(GRASS2, rr, 0.04, at=(PX + qx, PY + qy, 0.055), seg=18)
    G.box(PATH, (75.0, 3.4, 0.06), at=(PX, PY, 0.07))                   # cross paths
    G.box(PATH, (3.4, 75.0, 0.06), at=(PX, PY, 0.07))
    for o in (-33.5, 33.5):                                             # perimeter walk
        G.box(PATH, (70.0, 2.4, 0.06), at=(PX, PY + o, 0.07))
        G.box(PATH, (2.4, 70.0, 0.06), at=(PX + o, PY, 0.07))
    for o in (-37.0, 37.0):                                             # clipped hedge, open at the four gates
        for sgn in (-1, 1):
            G.box(HEDGE, (33.0, 0.9, 0.9), at=(PX + sgn * 20.0, PY + o, 0.45))
            G.box(HEDGE, (0.9, 33.0, 0.9), at=(PX + o, PY + sgn * 20.0, 0.45))
    # central plaza with a fountain
    G.cyl(PAVE2, 11.0, 0.08, at=(PX, PY, 0.08), seg=28)
    G.cyl(m["stone"], 5.4, 0.55, at=(PX, PY, 0.3), seg=24)
    G.cyl(POND, 4.8, 0.06, at=(PX, PY, 0.57), seg=24)
    G.cyl(m["stone"], 1.0, 0.9, at=(PX, PY, 0.75), seg=10)
    G.cyl(m["white"], 0.5, 1.0, at=(PX, PY, 1.6), seg=8, r2=0.1)
    for k in range(8):
        a = k * 6.283 / 8 + 0.39
        palm(PX + math.cos(a) * 13.0, PY + math.sin(a) * 13.0, nr.uniform(7.0, 8.4))
        G.cyl(nr.choice(FLOWER), 1.3, 0.1, at=(PX + math.cos(a + 0.39) * 8.6, PY + math.sin(a + 0.39) * 8.6, 0.14), seg=10)
    # north-west: a pond among trees
    G.cyl(m["stone"], 7.6, 0.12, at=(PX - 20, PY + 19, 0.07), seg=22)
    G.cyl(POND, 7.0, 0.05, at=(PX - 20, PY + 19, 0.13), seg=22)
    # south-west: a multi-use games court
    G.box(COURT2, (30.0, 17.0, 0.06), at=(PX - 19.5, PY - 19.5, 0.07))
    G.box(COURT, (26.0, 13.5, 0.06), at=(PX - 19.5, PY - 19.5, 0.09))
    for oy in (-6.6, 6.6):
        G.plane(MARK, (25.6, 0.14), at=(PX - 19.5, PY - 19.5 + oy, 0.125))
    for ox in (-12.7, 0, 12.7):
        G.plane(MARK, (0.14, 13.2), at=(PX - 19.5 + ox, PY - 19.5, 0.125))
    # south-east: pergola and seating
    for sx in (-1, 1):
        for k in range(3):
            G.box(m["wood_dark"], (0.25, 0.25, 2.8), at=(PX + 19 + sx * 3.2, PY - 26 + k * 5.0, 1.4))
    for k in range(9):
        G.box(m["wood"], (7.4, 0.3, 0.14), at=(PX + 19, PY - 26.5 + k * 1.35, 2.87))
    # benches and lamps along the paths
    for o in (-26, -16, 16, 26):
        G.box(m["wood_dark"], (1.8, 0.55, 0.45), at=(PX + o, PY + 2.4, 0.3))
        G.box(m["wood_dark"], (0.55, 1.8, 0.45), at=(PX - 2.4, PY + o, 0.3))
        lamp(PX + o + 4, PY - 2.6, 90)
        lamp(PX + 2.6, PY + o + 4, 0)
    # shade trees, kept off the paths, the plaza, the pond and the court
    placed = 0
    while placed < 46:
        tx, ty = nr.uniform(-34, 34), nr.uniform(-34, 34)
        if abs(tx) < 4 or abs(ty) < 4 or math.hypot(tx, ty) < 15.5 or abs(abs(tx) - 33.5) < 2.2 or abs(abs(ty) - 33.5) < 2.2:
            continue
        if math.hypot(tx + 20, ty - 19) < 9.5 or (abs(tx + 19.5) < 16.5 and abs(ty + 19.5) < 10) or (abs(tx - 19) < 5.5 and abs(ty + 21) < 8):
            continue
        tree(PX + tx, PY + ty, nr.uniform(0.85, 1.35))
        placed += 1
    for k in range(9):                                                   # a row of palms facing the tower
        palm(PX - 34.0 + k * 8.5, PY + 38.8, nr.uniform(7.0, 8.2))


def roof_clutter(w, d, z, seed, near=True):
    r = random.Random(seed)
    G.plane(ROOF, (w - 0.6, d - 0.6), at=(0, 0, z + 0.02))
    if near:
        for sx, sy, sw, sd in ((0, d / 2 - 0.15, w, 0.3), (0, -d / 2 + 0.15, w, 0.3), (w / 2 - 0.15, 0, 0.3, d), (-w / 2 + 0.15, 0, 0.3, d)):
            G.box(ROOF, (sw, sd, 1.0), at=(sx, sy, z + 0.5))
    G.box(m["concrete"], (4.0, 5.0, 2.8), at=(r.uniform(-w / 4, w / 4), r.uniform(-d / 4, d / 4), z + 1.4))
    for i in range(r.randint(1, 3) if near else 0):
        px, py = r.uniform(-w / 2 + 2, w / 2 - 2), r.uniform(-d / 2 + 2, d / 2 - 2)
        if r.random() < 0.45:
            G.cyl(m["white"], 0.9, 1.6, at=(px, py, z + 1.1), seg=10)
            G.box(m["steel"], (1.6, 1.6, 0.3), at=(px, py, z + 0.15))
        else:
            G.box(m["steel"], (r.uniform(1.4, 2.6), r.uniform(1.0, 1.8), r.uniform(0.8, 1.3)), at=(px, py, z + 0.6))


def tower_block(w, d, h, mat, seed, podium=True, near=True):
    r = random.Random(seed)
    if podium and h > 30:
        G.box(mat, (w, d, 9.0), at=(0, 0, 4.5))
        iw, idp = w * r.uniform(0.6, 0.8), d * r.uniform(0.6, 0.8)
        G.box(mat, (iw, idp, h - 9.0), at=(0, 0, 9.0 + (h - 9.0) / 2))
        roof_clutter(iw, idp, h, seed, near)
        G.plane(ROOF, (w - 0.4, d - 0.4), at=(0, 0, 9.02))
    else:
        G.box(mat, (w, d, h), at=(0, 0, h / 2))
        roof_clutter(w, d, h, seed, near)
    if near:
        # ground-floor band (shops / entrance)
        G.box(m["stone_dark"], (w + 0.3, d + 0.3, 3.6), at=(0, 0, 1.8))


with G.group("buildings", bake="vc"):
    for bi in range(-N, N + 1):
        for bj in range(-7, 5):
            cx = bi * BLOCK
            cy = bj * BLOCK + 22
            # keep the tower's own block clear, and leave the shore open
            if abs(cx) < 60 and -80 < cy < 80:
                continue
            if cy > 370:
                continue
            dist = math.hypot(cx, cy)
            # taller cluster to the east, low rise towards the sea
            cbd = max(0.0, 1.0 - math.hypot(cx - 330, cy + 120) / 320)
            sub = 2 if rnd.random() < 0.8 else 1
            for sx in range(sub):
                for sy in range(sub):
                    if rnd.random() < 0.12:
                        continue
                    w = (BLOCK - STREET) / sub - rnd.uniform(4, 10)
                    d = (BLOCK - STREET) / sub - rnd.uniform(4, 10)
                    ox = cx + (sx - (sub - 1) / 2) * (BLOCK - STREET) / sub
                    oy = cy + (sy - (sub - 1) / 2) * (BLOCK - STREET) / sub
                    h = rnd.choice((10.2, 13.6, 17, 20.4, 23.8, 27.2)) * (1.0 + 0.8 * rnd.random() * (1 if dist > 150 else 0.6))
                    if rnd.random() < 0.2 + cbd * 0.6:
                        h = rnd.uniform(48, 80) + cbd * rnd.uniform(20, 70)
                    if cy > 250:
                        h = min(h, 22)
                    h = round(h / 3.4) * 3.4
                    mat = GLASSY if (h > 55 and rnd.random() < 0.6) else rnd.choice(FAC)
                    with G.at((ox, oy, -0.1)):
                        tower_block(w, d, h, mat, rnd.randint(0, 99999), near=dist < 240)

with G.group("skyline", bake="vc"):
    # distant silhouettes that close the horizon on the land side
    for i in range(70):
        a = rnd.uniform(math.radians(150), math.radians(390))
        r_ = rnd.uniform(760, 1250)
        x, y = math.cos(a) * r_, math.sin(a) * r_ - 150
        if y > 380:
            continue
        w, h = rnd.uniform(30, 70), rnd.uniform(25, 150) * (0.5 + rnd.random())
        G.box(rnd.choice(FAC), (w, rnd.uniform(30, 60), h), at=(x, y, h / 2 - 0.2))

objs = G.finish()
set_world_hdri(os.path.join(DOWNLOADS, "hdri", "industrial_sunset_puresky_4k.hdr"), strength=1.0, rot_z=SKY["rot_z"])
sd = Vector(SKY["sun_dir"])
add_sun(-Vector((sd.x, sd.y, max(sd.z, 0.2))).normalized(), strength=2.2, color=(1.0, 0.72, 0.5), angle=3.0)
if arg("--preview"):
    render_preview("city_top", (-140, -260, 190), (60, 60, 0), fov=50, res=(1280, 720), samples=24)
    render_preview("city_roof", (-6, -30, 68), (60, 300, 10), fov=60, res=(1280, 720), samples=24)
bake_vertex(samples=24 if arg("--fast") else 96)
export_glb("city")
