"""Level 06 - Fire Protection: detect, alert, suppress.
Fire pump set -> riser valve station -> sprinkler bay -> alarm panel and devices -> hydrant, hose reel, clean agent.
Scope: FAST O&M profile pp. 15-16.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exhibit_common import *
from gallery import PX0, PX1, PY0, PY1

G, m = begin()
Z = eq.platform(G, m, PX0, PX1, PY0, PY1)
RED = m["paint_red"]
BRASS = m["brass"]

# ----------------------------------------------------------------------------- 1. fire pump set
eq.skid(G, m["paint_dark"], 3.6, 2.4, at=(-2.6, 6.4, Z), h=0.14, cross=3)
# electric duty pump
p1 = eq.pump(G, m, (-1.55, 7.2, Z + 0.14), axis="x", size=1.0, mat=RED, motor_mat=RED)
# diesel standby pump: pump end + engine block with radiator, exhaust and batteries
p2c = (-1.55, 5.8, Z + 0.14)
G.lathe(RED, [(0.0, -0.11), (0.2, -0.11), (0.3, -0.07), (0.33, 0), (0.3, 0.07), (0.2, 0.11), (0.0, 0.11)], at=(p2c[0], p2c[1], p2c[2] + 0.42), seg=24, axis="x")
G.cyl(RED, 0.1, 0.26, at=(p2c[0] + 0.22, p2c[1], p2c[2] + 0.42), axis="x", seg=16)
eq.flange(G, RED, (p2c[0] + 0.36, p2c[1], p2c[2] + 0.42), "x", 0.2)
G.cyl(RED, 0.08, 0.34, at=(p2c[0], p2c[1], p2c[2] + 0.78), seg=16)
eq.flange(G, RED, (p2c[0], p2c[1], p2c[2] + 0.96), "z", 0.16)
G.cyl(RED, 0.11, 0.4, at=(p2c[0] - 0.3, p2c[1], p2c[2] + 0.42), axis="x", seg=14)
with G.at((p2c[0] - 1.35, p2c[1], p2c[2])):
    G.box(RED, (1.1, 0.56, 0.6), at=(0, 0, 0.5), bevel=0.03)                 # engine block
    G.box(m["castiron"], (0.9, 0.5, 0.16), at=(0, 0, 0.88), bevel=0.02)       # rocker cover
    G.box(m["paint_dark"], (0.1, 0.7, 0.7), at=(-0.62, 0, 0.55))              # radiator
    for k in range(10):
        G.box(m["galv"], (0.012, 0.6, 0.6), at=(-0.69 - 0.0, 0, 0.55)) if k == 0 else None
    G.cyl(m["castiron"], 0.045, 1.1, at=(0.1, -0.2, 1.5), seg=10)             # exhaust riser
    G.cyl(m["galv"], 0.09, 0.4, at=(0.1, -0.2, 1.4), seg=12)                  # silencer
    G.cyl(m["plastic_dark"], 0.1, 0.18, at=(0.35, 0.2, 1.05), seg=12)         # air filter
    for bx in (0.0, 0.3):
        G.box(m["plastic_dark"], (0.26, 0.17, 0.2), at=(bx - 0.2, 0.42, 0.26), bevel=0.01)
    G.cyl(m["paint_yellow"], 0.13, 0.24, at=(0.74, 0, 0.56), axis="x", seg=14)
# jockey pump (vertical multistage)
jx, jy = -3.9, 7.3
G.cyl(m["stainless"], 0.07, 0.6, at=(jx, jy, Z + 0.6), seg=14)
G.cyl(RED, 0.1, 0.12, at=(jx, jy, Z + 0.26), seg=14)
eq.motor(G, m, (jx, jy, Z + 1.12), axis="z", L=0.34, r=0.1, mat=RED, feet=False)
# discharge header with OS&Y valves, gauges and a test line
eq.pipe(G, RED, [(-1.55, 7.2, Z + 1.1), (-1.55, 7.2, Z + 1.75), (-0.2, 7.2, Z + 1.75), (-0.2, 6.5, Z + 1.75), (0.7, 6.5, Z + 1.75)], 0.18, flanges=[((-1.55, 7.2, Z + 1.3), "z")])
eq.pipe(G, RED, [(-1.55, 5.8, Z + 1.1), (-1.55, 5.8, Z + 1.75), (-0.2, 5.8, Z + 1.75), (-0.2, 6.5, Z + 1.75)], 0.18, flanges=[((-1.55, 5.8, Z + 1.3), "z")])
eq.gate_valve(G, m, RED, (-0.9, 7.2, Z + 1.75), "x", 0.18)
eq.gate_valve(G, m, RED, (-0.9, 5.8, Z + 1.75), "x", 0.18)
eq.gauge(G, m, (-1.55, 7.2, Z + 1.86), facing="+y", r=0.07, stem=0.1)
eq.gauge(G, m, (-1.55, 5.8, Z + 1.86), facing="+y", r=0.07, stem=0.1)
eq.pipe(G, RED, [(-1.19, 7.2, Z + 0.56), (-0.5, 7.2, Z + 0.56), (-0.5, 6.5, Z + 0.56), (-1.19, 5.8, Z + 0.56)], 0.2)
# pump controllers
for i, cx in enumerate((-4.0, -3.3)):
    c = eq.cabinet(G, m, (0.6, 0.3, 1.4), at=(cx, 5.2, Z), mat=RED, plinth=0.3, facing="+y", vents=False, meter=True,
                   lights=((-0.15, 1.25, "led_green"), (0, 1.25, "led_amber"), (0.15, 1.25, "led_red")))
station(G, "pumps", (-1.55, 7.2, Z + 0.75), target=(-2.0, 6.5, 1.1))

# ----------------------------------------------------------------------------- 2. riser valve station
rx, ry = 1.9, 6.5
G.box(m["wall_dark"], (2.4, 0.12, 3.6), at=(rx, ry - 0.5, Z + 1.8), maxseg=0.9)
eq.pipe(G, RED, [(0.7, 6.5, Z + 1.75), (rx, 6.5, Z + 1.75)], 0.18)
G.cyl(RED, 0.1, 3.5, at=(rx, ry, Z + 1.85), seg=16)
# alarm check valve with trim
G.cyl(RED, 0.19, 0.42, at=(rx, ry, Z + 1.0), seg=18)
eq.flange(G, RED, (rx, ry, Z + 0.76), "z", 0.22)
eq.flange(G, RED, (rx, ry, Z + 1.24), "z", 0.22)
G.box(RED, (0.26, 0.1, 0.26), at=(rx, ry + 0.2, Z + 1.0), bevel=0.02)
for sgn in (-1, 1):
    G.tube(BRASS, [(rx + sgn * 0.19, ry, Z + 0.86), (rx + sgn * 0.36, ry, Z + 0.86), (rx + sgn * 0.36, ry, Z + 1.34)], 0.012, seg=6, bend=0.03)
    eq.gauge(G, m, (rx + sgn * 0.36, ry, Z + 1.36), facing="+y", r=0.06, stem=0.05)
# OS&Y gate valve above
G.box(RED, (0.3, 0.3, 0.34), at=(rx, ry, Z + 1.72), bevel=0.03)
G.cyl(m["stainless"], 0.02, 0.5, at=(rx, ry + 0.38, Z + 1.72), axis="y", seg=8)
eq.handwheel(G, m, (rx, ry + 0.62, Z + 1.72), "y", 0.2)
# flow switch and drain
G.box(RED, (0.12, 0.14, 0.16), at=(rx, ry + 0.16, Z + 2.3), bevel=0.01)
G.tube(RED, [(rx, ry, Z + 0.55), (rx + 0.5, ry, Z + 0.55), (rx + 0.5, ry, Z + 0.1)], 0.03, seg=8, bend=0.06)
eq.handwheel(G, m, (rx + 0.5, ry + 0.07, Z + 0.4), "y", 0.07)
# water motor gong on the wall
G.cyl(RED, 0.2, 0.08, at=(rx - 0.75, ry - 0.4, Z + 2.5), axis="y", seg=20)
G.cyl(BRASS, 0.05, 0.04, at=(rx - 0.75, ry - 0.34, Z + 2.5), axis="y", seg=10)
# fire department inlet (breeching)
G.box(RED, (0.5, 0.14, 0.3), at=(rx + 0.75, ry - 0.38, Z + 1.0), bevel=0.02)
for sgn in (-1, 1):
    G.cyl(BRASS, 0.06, 0.14, at=(rx + 0.75 + sgn * 0.13, ry - 0.26, Z + 1.0), axis="y", seg=12)
    G.cyl(RED, 0.07, 0.03, at=(rx + 0.75 + sgn * 0.13, ry - 0.18, Z + 1.0), axis="y", seg=12)
station(G, "riser", (rx, ry + 0.25, Z + 1.0), target=(rx - 0.1, ry, 1.5))

# ----------------------------------------------------------------------------- 3. sprinkler bay
sx0, sy0 = 6.2, 6.4
top = Z + 3.3
for px_ in (-1.5, 1.5):
    for py_ in (-1.1, 1.1):
        G.box(m["paint_dark"], (0.07, 0.07, 3.3), at=(sx0 + px_, sy0 + py_, Z + 1.65))
for py_ in (-1.1, 1.1):
    G.box(m["paint_dark"], (3.07, 0.07, 0.07), at=(sx0, sy0 + py_, top))
for px_ in (-1.5, 1.5):
    G.box(m["paint_dark"], (0.07, 2.27, 0.07), at=(sx0 + px_, sy0, top))
eq.pipe(G, RED, [(rx, 6.5, Z + 3.55), (sx0 - 1.5, 6.5, Z + 3.55), (sx0 - 1.2, sy0, top - 0.12), (sx0 + 1.4, sy0, top - 0.12)], 0.09)
heads = []
for bx in (-0.9, 0.0, 0.9):
    G.cyl(RED, 0.022, 1.9, at=(sx0 + bx, sy0, top - 0.14), axis="y", seg=8)
    for by in (-0.7, 0.7):
        hp = (sx0 + bx, sy0 + by, top - 0.3)
        G.cyl(RED, 0.015, 0.14, at=(hp[0], hp[1], top - 0.21), seg=6)
        G.cyl(BRASS, 0.022, 0.05, at=(hp[0], hp[1], hp[2] + 0.0), seg=8)
        G.cyl(m["led_red"], 0.006, 0.04, at=(hp[0], hp[1], hp[2] - 0.04), seg=5)       # glass bulb
        G.cyl(BRASS, 0.04, 0.006, at=(hp[0], hp[1], hp[2] - 0.07), seg=12)            # deflector
        heads.append(hp)
# two heads discharge over a rack of stored goods
for hp in (heads[2], heads[3]):
    G.marker("spray", f"h{heads.index(hp)}", (hp[0], hp[1], hp[2] - 0.08), radius=1.0, height=hp[2] - 0.08 - Z - 1.3)
with G.at((sx0, sy0, Z)):
    for lvl in (0.5, 1.15):
        G.box(m["galv"], (2.2, 1.0, 0.04), at=(0, 0, lvl))
    for px_ in (-1.08, 1.08):
        for py_ in (-0.48, 0.48):
            G.box(m["paint_orange"], (0.05, 0.05, 1.3), at=(px_, py_, 0.65))
    carton = M("carton", "#b08a5c", rough=0.9)
    for i in range(4):
        G.box(carton, (0.45, 0.6, 0.4), at=(-0.78 + i * 0.52, 0, 0.74), bevel=0.01)
        if i < 3:
            G.box(carton, (0.5, 0.7, 0.42), at=(-0.6 + i * 0.6, 0, 0.26), bevel=0.01)
station(G, "sprinklers", (sx0, sy0 + 0.7, top - 0.3), target=(sx0 - 0.1, sy0, 1.9), fov=58)

# ----------------------------------------------------------------------------- 4. fire alarm panel and devices
ax, ay = 10.0, 6.2
G.box(m["wall_dark"], (2.6, 0.12, 3.0), at=(ax, ay - 0.3, Z + 1.5), maxseg=0.9)
G.box(m["white"], (2.6, 0.9, 0.06), at=(ax, ay + 0.1, Z + 3.0))                              # ceiling strip
# control panel
G.box(RED, (0.62, 0.14, 0.78), at=(ax - 0.5, ay - 0.17, Z + 1.5), bevel=0.012)
with G.group("scr_facp", bake="none", screen="facp"):
    G.plane(m["screen"], (0.36, 0.16), at=(ax - 0.5, ay - 0.095, Z + 1.68), rot=(90, 0, 180), uvfit=True)
for k in range(8):
    G.cyl(m["led_green" if k < 5 else ("led_amber" if k < 7 else "led_red")], 0.012, 0.01, at=(ax - 0.71 + k * 0.06, ay - 0.095, Z + 1.5), axis="y", seg=8)
for r_ in range(2):
    for c_ in range(5):
        G.box(m["plastic_dark"], (0.05, 0.01, 0.035), at=(ax - 0.66 + c_ * 0.08, ay - 0.095, Z + 1.36 - r_ * 0.07))
# manual call point, sounder / strobe, bell
G.box(RED, (0.12, 0.05, 0.12), at=(ax + 0.35, ay - 0.21, Z + 1.35), bevel=0.008)
G.box(m["white"], (0.07, 0.01, 0.07), at=(ax + 0.35, ay - 0.18, Z + 1.35))
G.box(RED, (0.16, 0.08, 0.2), at=(ax + 0.35, ay - 0.2, Z + 2.25), bevel=0.01)
with G.group("strobe", bake="none", pivot=(ax + 0.35, ay - 0.15, Z + 2.3), blink=[1.0, 0.12, 0.0]):
    G.box(m["led_white"], (0.1, 0.02, 0.07), at=(ax + 0.35, ay - 0.155, Z + 2.3))
G.marker("glow", "strobe", (ax + 0.35, ay - 0.1, Z + 2.3), color="#ffffff", size=1.6, blink=[1.0, 0.12, 0.0])
G.cyl(RED, 0.11, 0.07, at=(ax + 0.85, ay - 0.2, Z + 2.25), axis="y", seg=18)
# conduits and ceiling detectors
G.tube(RED, [(ax - 0.5, ay - 0.2, Z + 1.9), (ax - 0.5, ay - 0.2, Z + 2.9), (ax - 0.5, ay + 0.1, Z + 2.94)], 0.012, seg=6, bend=0.04)
G.tube(RED, [(ax + 0.35, ay - 0.22, Z + 1.42), (ax + 0.35, ay - 0.22, Z + 2.15)], 0.012, seg=6)
for i, dx in enumerate((-0.8, 0.0, 0.8)):
    G.cyl(m["white"], 0.075, 0.045, at=(ax + dx, ay + 0.15, Z + 2.95), seg=16)
    G.cyl(m["white"], 0.05, 0.03, at=(ax + dx, ay + 0.15, Z + 2.915), seg=16)
    with G.group(f"det_led{i}", bake="none", pivot=(ax + dx + 0.05, ay + 0.19, Z + 2.92), blink=[2.4, 0.06, i * 0.8]):
        G.sphere(m["led_red"], 0.008, at=(ax + dx + 0.05, ay + 0.19, Z + 2.925), seg=6, rings=4)
station(G, "alarm", (ax - 0.5, ay - 0.05, Z + 1.55), target=(ax - 0.1, ay, 1.75))

# ----------------------------------------------------------------------------- 5. hydrant, hose reel, extinguishers, clean agent
hx0, hy0 = 13.2, 6.2
# pillar hydrant
with G.at((hx0 - 1.0, hy0 + 0.6, Z)):
    G.cyl(RED, 0.2, 0.06, at=(0, 0, 0.03), seg=18)
    G.cyl(RED, 0.11, 0.85, at=(0, 0, 0.48), seg=16)
    G.sphere(RED, 0.13, at=(0, 0, 0.93), seg=14, rings=8, scale=(1, 1, 0.8))
    G.cyl(m["castiron"], 0.03, 0.08, at=(0, 0, 1.06), seg=6)
    for ang in (0, 180):
        with G.at((0, 0, 0.72), rz=ang):
            G.cyl(RED, 0.055, 0.14, at=(0.15, 0, 0), axis="x", seg=12)
            G.cyl(BRASS, 0.065, 0.04, at=(0.23, 0, 0), axis="x", seg=12)
    G.cyl(RED, 0.07, 0.12, at=(0, 0.16, 0.6), axis="y", seg=12)
    G.cyl(BRASS, 0.08, 0.04, at=(0, 0.23, 0.6), axis="y", seg=12)
# hose reel cabinet, door open
with G.at((hx0 + 0.3, hy0, Z)):
    G.box(m["wall_dark"], (1.3, 0.1, 2.3), at=(0, -0.3, 1.15), maxseg=0.9)
    G.box(RED, (0.9, 0.03, 0.9), at=(0, -0.24, 1.25))
    for sx_ in (-0.45, 0.45):
        G.box(RED, (0.03, 0.26, 0.9), at=(sx_, -0.12, 1.25))
    G.box(RED, (0.93, 0.26, 0.03), at=(0, -0.12, 1.7))
    G.box(RED, (0.93, 0.26, 0.03), at=(0, -0.12, 0.8))
    G.cyl(RED, 0.3, 0.14, at=(0, -0.1, 1.25), axis="y", seg=22)
    G.lathe(m["cable_red"], [(0.14, -0.05), (0.27, -0.05), (0.27, 0.05), (0.14, 0.05), (0.14, -0.05)], at=(0, -0.1, 1.25), seg=22, axis="y")
    G.tube(m["cable_red"], [(0.26, -0.05, 1.1), (0.4, 0.05, 0.9), (0.4, 0.05, 0.4), (0.25, 0.1, 0.25)], 0.016, seg=6, bend=0.06)
    G.cyl(BRASS, 0.02, 0.16, at=(0.2, 0.12, 0.25), rot=(0, 70, 0), seg=8)
    G.box(RED, (0.03, 0.9, 0.9), at=(-0.47, 0.34, 1.25), rot=(0, 0, 8))
# extinguishers
for i, (ex_, col) in enumerate(((1.2, RED), (1.45, RED))):
    with G.at((hx0 + ex_, hy0 + 0.1, Z)):
        G.cyl(col, 0.085, 0.5, at=(0, 0, 0.3), seg=14)
        G.sphere(col, 0.085, at=(0, 0, 0.55), seg=12, rings=6, scale=(1, 1, 0.7))
        G.cyl(m["plastic_dark"], 0.03, 0.1, at=(0, 0, 0.66), seg=8)
        G.box(m["plastic_dark"], (0.16, 0.03, 0.03), at=(0.04, 0, 0.72))
        G.tube(m["plastic_dark"], [(0, 0.03, 0.66), (0.0, 0.12, 0.6), (0.0, 0.12, 0.25)], 0.012, seg=6, bend=0.04)
# clean agent cylinders with manifold and nozzle
for i in range(2):
    cx_ = hx0 - 0.25 + i * 0.36
    G.cyl(RED, 0.15, 1.45, at=(cx_, hy0 - 0.9, Z + 0.78), seg=16)
    G.sphere(RED, 0.15, at=(cx_, hy0 - 0.9, Z + 1.5), seg=14, rings=6, scale=(1, 1, 0.6))
    G.cyl(BRASS, 0.035, 0.14, at=(cx_, hy0 - 0.9, Z + 1.64), seg=8)
    G.box(m["galv"], (0.34, 0.04, 0.03), at=(cx_, hy0 - 1.06, Z + 1.0))
G.tube(m["galv"], [(hx0 - 0.25, hy0 - 0.9, Z + 1.74), (hx0 - 0.25, hy0 - 0.9, Z + 1.95), (hx0 + 0.11, hy0 - 0.9, Z + 1.95), (hx0 + 0.11, hy0 - 0.9, Z + 1.74)], 0.02, seg=6, bend=0.05)
G.tube(m["galv"], [(hx0 - 0.07, hy0 - 0.9, Z + 1.95), (hx0 - 0.07, hy0 - 0.9, Z + 2.9), (hx0 - 0.07, hy0 - 0.3, Z + 2.9)], 0.02, seg=6, bend=0.06)
G.cyl(BRASS, 0.05, 0.05, at=(hx0 - 0.07, hy0 - 0.3, Z + 2.86), seg=10)
station(G, "hydrant", (hx0 + 0.3, hy0 + 0.05, Z + 1.3), cam=(12.6, 11.5, 1.62), target=(13.2, 6.2, 1.2), stand=(11.6, 8.5, 0.12), fov=56)

flow(G, "firewater", [(-1.55, 7.2, Z + 1.1), (-1.55, 7.2, Z + 1.75), (-0.2, 7.2, Z + 1.75), (-0.2, 6.5, Z + 1.75), (rx, 6.5, Z + 1.75), (rx, 6.5, Z + 3.55), (sx0 - 1.5, 6.5, Z + 3.55), (sx0 - 1.2, sy0, top - 0.12), (sx0 + 0.9, sy0, top - 0.12)],
     speed=3.0, color="#ff6a4a", count=9)

overview(G)
finish(G, "fire")
