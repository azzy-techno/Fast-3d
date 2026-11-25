"""Level 04 - Fabrication: a workshop bay.
Skid under welding -> tank shell -> structural steel -> stainless control panel -> stainless kitchen equipment.
Scope: FAST O&M profile pp. 13-14.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exhibit_common import *
from gallery import PX0, PX1, PY0, PY1

G, m = begin()
Z = eq.platform(G, m, PX0, PX1, PY0, PY1)
STEEL = M("steel_primer", "#8c4a3a", rough=0.6, metal=0.2)       # red-oxide primed steel
RAW = M("steel_raw", "#6f757b", rough=0.45, metal=0.7)           # mill-finish steel
SS = m["stainless"]


def trestle(at, w=1.2, h=0.6):
    with G.at(at):
        G.box(m["paint_yellow"], (0.08, w, 0.08), at=(0, 0, h))
        for sy in (-1, 1):
            G.box(m["paint_yellow"], (0.06, 0.06, h), at=(0, sy * (w / 2 - 0.1), h / 2), rot=(sy * 10, 0, 0))
            G.box(m["paint_yellow"], (0.5, 0.06, 0.05), at=(0, sy * (w / 2 - 0.02), 0.03))


# ----------------------------------------------------------------------------- 1. skid under fabrication
sx0, sy0, sh = -2.6, 6.5, 0.62
for x in (sx0 - 1.2, sx0 + 1.2):
    trestle((x, sy0, Z), w=2.0, h=sh)
eq.skid(G, STEEL, 3.4, 1.8, at=(sx0, sy0, Z + sh + 0.04), h=0.2, cross=3)
# grating on half the deck, pipe spool and a pump pedestal already fitted
for k in range(12):
    G.box(RAW, (1.5, 0.02, 0.03), at=(sx0 - 0.85, sy0 - 0.75 + k * 0.136, Z + sh + 0.26))
for k in range(8):
    G.box(RAW, (0.02, 1.5, 0.03), at=(sx0 - 1.55 + k * 0.2, sy0, Z + sh + 0.25))
G.box(STEEL, (0.9, 0.6, 0.12), at=(sx0 + 0.8, sy0 + 0.3, Z + sh + 0.3))
eq.pipe(G, RAW, [(sx0 + 0.2, sy0 - 0.5, Z + sh + 0.55), (sx0 + 1.4, sy0 - 0.5, Z + sh + 0.55), (sx0 + 1.4, sy0 - 0.5, Z + sh + 1.25)], 0.17,
        flanges=[((sx0 + 0.25, sy0 - 0.5, Z + sh + 0.55), "x"), ((sx0 + 1.4, sy0 - 0.5, Z + sh + 1.2), "z")])
G.box(STEEL, (0.08, 0.08, 0.3), at=(sx0 + 0.7, sy0 - 0.5, Z + sh + 0.39))
# welding set, leads and the arc on the near corner
with G.at((sx0 - 0.6, sy0 + 1.7, Z)):
    G.box(m["paint_red"], (0.5, 0.75, 0.6), at=(0, 0, 0.42), bevel=0.02)
    G.box(m["paint_dark"], (0.5, 0.75, 0.12), at=(0, 0, 0.06))
    G.box(m["plastic_dark"], (0.3, 0.01, 0.2), at=(0, 0.38, 0.5))
    for sxx in (-0.2, 0.2):
        G.cyl(m["rubber"], 0.08, 0.05, at=(sxx, -0.3, 0.08), axis="x", seg=10)
weld = (sx0 + 1.62, sy0 + 0.92, Z + sh + 0.18)
G.tube(m["cable_black"], [(sx0 - 0.5, sy0 + 2.05, Z + 0.4), (sx0 + 0.3, sy0 + 2.0, Z + 0.05), (sx0 + 1.3, sy0 + 1.5, Z + 0.05), (weld[0], weld[1] + 0.3, Z + sh + 0.1), (weld[0], weld[1] + 0.05, weld[2] + 0.05)], 0.016, seg=6, bend=0.15)
G.cyl(m["paint_dark"], 0.018, 0.3, at=(weld[0], weld[1] + 0.12, weld[2] + 0.1), rot=(60, 0, 0), seg=6)
with G.group("weld_arc", bake="none", pivot=weld, blink=[0.11, 0.6, 0.0]):
    G.sphere(m["led_white"], 0.035, at=weld, seg=8, rings=5)
G.marker("glow", "weld", weld, color="#bcdcff", size=1.3, flicker=1)
G.marker("sparks", "weld", weld)
station(G, "skid", (sx0, sy0 + 0.9, Z + sh + 0.35))

# ----------------------------------------------------------------------------- 2. tanks
tx, ty = 1.9, 6.3
tr, th = 1.0, 2.5
G.cyl(RAW, tr + 0.08, 0.06, at=(tx, ty, Z + 0.03), seg=36)
G.cyl(SS, tr, th, at=(tx, ty, Z + 0.06 + th / 2), seg=36)
for k in range(1, 3):
    G.cyl(RAW, tr + 0.012, 0.03, at=(tx, ty, Z + 0.06 + k * th / 3), seg=36)
G.cyl(SS, tr, 0.3, at=(tx, ty, Z + 0.06 + th + 0.15), seg=36, r2=0.35)
G.cyl(SS, 0.3, 0.14, at=(tx, ty, Z + 0.06 + th + 0.36), seg=18)
eq.flange(G, SS, (tx, ty, Z + th + 0.5), "z", 0.5, bolts=12)
eq.nozzle(G, SS, (tx, ty + tr - 0.02, Z + 0.5), "y", 0.16, 0.2)
eq.nozzle(G, SS, (tx - 0.5, ty + tr * 0.86 - 0.02, Z + 1.9), "y", 0.1, 0.16)
# manway
G.cyl(SS, 0.3, 0.14, at=(tx + 0.45, ty + tr * 0.88, Z + 1.0), axis="y", seg=20)
eq.flange(G, SS, (tx + 0.45, ty + tr * 0.88 + 0.1, Z + 1.0), "y", 0.52, bolts=12)
# ladder
for sxx in (-0.2, 0.2):
    G.box(m["paint_yellow"], (0.04, 0.04, th + 0.5), at=(tx - 0.95 + 0.0, ty + 0.55 + sxx, Z + (th + 0.5) / 2), rot=(0, 0, 0))
for k in range(9):
    G.cyl(m["paint_yellow"], 0.014, 0.4, at=(tx - 0.95, ty + 0.55, Z + 0.3 + k * 0.3), axis="y", seg=6)
# rolled shell plate waiting to be fitted: shows how the shell is made
with G.at((tx + 1.55, ty - 0.9, Z)):
    seg_n = 10
    for k in range(seg_n):
        a = math.radians(-50 + k * 100 / seg_n)
        G.box(RAW, (0.012, 2 * 1.0 * math.sin(math.radians(5.2)), 1.2), at=(-1.0 * math.cos(a) + 1.0, 1.0 * math.sin(a), 0.72), rot=(0, 0, math.degrees(a)))
    G.box(m["wood"], (0.1, 1.6, 0.1), at=(0.1, 0, 0.06))
station(G, "tank", (tx + 0.45, ty + 1.05, Z + 1.0), target=(tx - 0.1, ty, 1.45))

# ----------------------------------------------------------------------------- 3. structural steel
fx = 6.3
for sxx in (-1.3, 1.3):
    G.box(RAW, (0.5, 0.5, 0.025), at=(fx + sxx, 6.2, Z + 0.012))
    for bx in (-0.18, 0.18):
        for by in (-0.18, 0.18):
            G.cyl(m["galv"], 0.016, 0.1, at=(fx + sxx + bx, 6.2 + by, Z + 0.05), seg=6)
    G.ibeam(STEEL, 3.2, h=0.3, w=0.2, tf=0.016, tw=0.01, at=(fx + sxx, 6.2, Z + 1.62), rot=(0, 90, 0))
G.ibeam(STEEL, 3.0, h=0.36, w=0.2, tf=0.018, tw=0.011, at=(fx, 6.2, Z + 3.4))
for sxx in (-1.3, 1.3):
    # haunch / gusset with bolt group
    G.box(STEEL, (0.02, 0.34, 0.5), at=(fx + sxx * 0.86, 6.2, Z + 3.05))
    for bz in range(3):
        for by in (-0.1, 0.1):
            G.cyl(m["galv"], 0.018, 0.06, at=(fx + sxx * 0.86, 6.2 + by, Z + 2.9 + bz * 0.15), axis="x", seg=6)
G.cyl(m["galv"], 0.014, 3.9, at=(fx, 6.2, Z + 1.7), rot=(0, 39, 0), seg=6)
# hoist on the rafter carrying a beam (the hook sways)
G.box(m["paint_yellow"], (0.34, 0.3, 0.26), at=(fx + 0.2, 6.2, Z + 3.1), bevel=0.02)
with G.group("hook", bake="vc", pivot=(fx + 0.2, 6.2, Z + 2.97), sway=[0.035, 0.45]):
    G.cyl(m["castiron"], 0.008, 1.0, at=(fx + 0.2, 6.2, Z + 2.47), seg=5)
    G.box(m["paint_yellow"], (0.12, 0.08, 0.16), at=(fx + 0.2, 6.2, Z + 1.92), bevel=0.01)
    for sxx in (-0.5, 0.5):
        G.cyl(m["castiron"], 0.006, 0.62, at=(fx + 0.2 + sxx / 2, 6.2, Z + 1.6), rot=(0, 55 * (1 if sxx > 0 else -1), 0), seg=5)
    G.ibeam(STEEL, 1.6, h=0.2, w=0.12, at=(fx + 0.2, 6.2, Z + 1.3))
# stock of sections on timber bearers
with G.at((fx + 0.1, 7.6, Z)):
    for bx in (-0.8, 0.8):
        G.box(m["wood"], (0.1, 1.0, 0.1), at=(bx, 0, 0.05))
    for k in range(3):
        G.ibeam(RAW, 2.6, h=0.2, w=0.14, at=(0, -0.3 + k * 0.3, 0.2))
    for k in range(2):
        G.ibeam(RAW, 2.6, h=0.2, w=0.14, at=(0, -0.15 + k * 0.3, 0.4))
station(G, "structure", (fx - 1.12, 6.36, Z + 2.9), target=(fx - 0.1, 6.3, 1.7), fov=58)

# ----------------------------------------------------------------------------- 4. stainless control panels
px = 10.2
# open enclosure: body, back plate with DIN rails, door swung open
with G.at((px, 6.4, Z)):
    w, d, h = 1.0, 0.45, 1.8
    G.box(SS, (w, 0.03, h), at=(0, -d / 2, 0.1 + h / 2), maxseg=0.6)
    for sxx in (-1, 1):
        G.box(SS, (0.03, d, h), at=(sxx * w / 2, 0, 0.1 + h / 2), maxseg=0.6)
    G.box(SS, (w, d, 0.03), at=(0, 0, 0.1 + h))
    G.box(SS, (w, d, 0.03), at=(0, 0, 0.115))
    G.box(SS, (w + 0.16, d + 0.2, 0.03), at=(0, 0.04, 0.1 + h + 0.06), rot=(8, 0, 0))            # rain canopy
    for lx in (-0.4, 0.4):
        G.box(SS, (0.06, 0.3, 0.1), at=(lx, 0, 0.05))
    G.box(m["galv"], (w - 0.12, 0.012, h - 0.16), at=(0, -d / 2 + 0.04, 0.1 + h / 2))
    for k in range(4):
        G.box(m["steel"], (w - 0.24, 0.02, 0.035), at=(0, -d / 2 + 0.06, 0.5 + k * 0.36))
        for c_ in range(5):
            eq.breaker(G, m, (-0.34 + c_ * 0.12, -d / 2 + 0.1, 0.5 + k * 0.36), w=0.09, h=0.12)
    G.box(m["paint_grey"], (0.06, 0.06, h - 0.3), at=(0.4, -d / 2 + 0.09, 0.1 + h / 2))             # wiring duct
    G.box(SS, (0.03, w - 0.04, h - 0.04), at=(-w / 2 - 0.04, d / 2 + (w - 0.04) / 2 - 0.02, 0.1 + h / 2), rot=(0, 0, -12), maxseg=0.6)
# finished enclosure beside it
c = eq.cabinet(G, m, (0.8, 0.4, 1.5), at=(px + 1.25, 6.3, Z), mat=SS, plinth=0.08, facing="+y", vents=False)
G.box(SS, (0.96, 0.6, 0.03), at=(px + 1.25, 6.34, Z + 1.56), rot=(8, 0, 0))
station(G, "panel", (px, 6.7, Z + 1.3))

# ----------------------------------------------------------------------------- 5. stainless kitchen equipment
kx = 13.3
with G.at((kx, 6.3, Z)):
    # work table with undershelf
    G.box(SS, (1.9, 0.75, 0.04), at=(-0.1, 0, 0.9), bevel=0.006)
    G.box(SS, (1.9, 0.04, 0.12), at=(-0.1, -0.36, 0.98))
    G.box(SS, (1.8, 0.65, 0.025), at=(-0.1, 0, 0.3))
    for lx in (-0.98, 0.78):
        for ly in (-0.32, 0.32):
            G.cyl(SS, 0.022, 0.9, at=(lx, ly, 0.45), seg=8)
    # sink bowl let into the top
    G.box(m["castiron"], (0.5, 0.42, 0.01), at=(0.4, 0.0, 0.925))
    G.box(SS, (0.5, 0.42, 0.24), at=(0.4, 0.0, 0.78), bevel=0.01)
    G.tube(SS, [(0.4, -0.26, 0.92), (0.4, -0.26, 1.22), (0.4, -0.08, 1.22), (0.4, -0.08, 1.14)], 0.014, seg=8, bend=0.05)
    # exhaust hood with baffle filters
    G.box(SS, (2.1, 1.0, 0.07), at=(-0.1, -0.02, 2.36))
    G.box(SS, (2.1, 0.04, 0.5), at=(-0.1, 0.46, 2.1), rot=(18, 0, 0))
    G.box(SS, (2.1, 0.04, 0.42), at=(-0.1, -0.5, 2.14))
    for sxx in (-1.15, 0.95):
        G.box(SS, (0.04, 1.0, 0.42), at=(sxx, -0.02, 2.14))
    for k in range(4):
        G.box(m["galv"], (0.46, 0.03, 0.34), at=(-0.85 + k * 0.5, 0.1, 2.12), rot=(40, 0, 0))
    G.box(SS, (0.5, 0.5, 0.5), at=(-0.1, -0.1, 2.65))
    for sxx in (-1.1, 0.9):
        G.cyl(m["steel"], 0.01, 3.3, at=(sxx, -0.3, 4.05), seg=5)
station(G, "kitchen", (kx + 0.3, 6.5, Z + 1.0), cam=(13.0, 11.5, 1.62), target=(13.2, 6.2, 1.5), stand=(11.9, 8.4, 0.12), fov=56)

overview(G)
finish(G, "fabrication")
