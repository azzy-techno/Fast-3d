"""Level 03 - Mechanical: a working plant room.
Pump skid -> piping manifold with a hot tap -> air handling unit -> process heater skid -> compressed air.
Scope: FAST O&M profile pp. 9-10.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exhibit_common import *
from gallery import PX0, PX1, PY0, PY1

G, m = begin()
Z = eq.platform(G, m, PX0, PX1, PY0, PY1)
CHW = m["paint_blue"]      # chilled / process water supply
RET = m["paint_green"]     # return

# ----------------------------------------------------------------------------- 1. pump skid
eq.skid(G, m["paint_dark"], 3.3, 2.3, at=(-2.5, 6.5, Z), h=0.14, cross=3)
pumps = []
for i, py in enumerate((7.15, 5.85)):
    p = eq.pump(G, m, (-1.55, py, Z + 0.14), axis="x", size=1.0, mat=m["paint_green"], motor_mat=m["paint_blue"])
    pumps.append(p)
    # exposed flexible coupling that visibly turns
    with G.group(f"coupling{i}", bake="vc", pivot=p["shaft"], spin=spin("x", 9.0)):
        G.cyl(m["stainless"], 0.1, 0.05, at=(p["shaft"][0] - 0.05, p["shaft"][1], p["shaft"][2]), axis="x", seg=12)
        G.cyl(m["paint_red"], 0.1, 0.05, at=(p["shaft"][0] + 0.05, p["shaft"][1], p["shaft"][2]), axis="x", seg=12)
        for k in range(4):
            a = k * math.pi / 2
            G.cyl(m["castiron"], 0.014, 0.16, at=(p["shaft"][0], p["shaft"][1] + math.cos(a) * 0.07, p["shaft"][2] + math.sin(a) * 0.07), axis="x", seg=6)
    # suction from the header, discharge up and over with a gauge
    sx, sy, sz = p["suction"]
    eq.pipe(G, RET, [(sx, sy, sz), (0.2, sy, sz), (0.6, 6.5, sz)], 0.2, flanges=[((sx + 0.5, sy, sz), "x")])
    dx, dy, dz = p["discharge"]
    eq.pipe(G, CHW, [(dx, dy, dz), (dx, dy, Z + 1.7), (0.4, dy, Z + 1.7), (0.9, 6.5, Z + 1.7)], 0.16, flanges=[((dx, dy, dz + 0.3), "z")])
    eq.gauge(G, m, (dx, dy - 0.0, Z + 1.78 + 0.0), facing="+y", r=0.06, stem=0.1)
    eq.gate_valve(G, m, CHW, (-0.5, dy, Z + 1.7), "x", 0.16)
station(G, "pumps", (-1.55, 7.15, Z + 0.75))

# ----------------------------------------------------------------------------- 2. piping manifold + hot tap
eq.pipe(G, RET, [(0.6, 6.5, Z + 0.56), (4.9, 6.5, Z + 0.56)], 0.26, flanges=[((1.2, 6.5, Z + 0.56), "x"), ((4.3, 6.5, Z + 0.56), "x")])
eq.pipe(G, CHW, [(0.9, 6.5, Z + 1.7), (4.9, 6.5, Z + 1.7)], 0.2, flanges=[((1.5, 6.5, Z + 1.7), "x"), ((4.4, 6.5, Z + 1.7), "x")])
for x in (1.0, 2.6, 4.1):
    eq.support(G, m, (x, 6.5, Z), 0.56, 0.26)
    G.box(m["paint_dark"], (0.07, 0.07, 1.14), at=(x, 6.72, Z + 1.13))
    G.box(m["paint_dark"], (0.07, 0.4, 0.05), at=(x, 6.55, Z + 1.58))
eq.butterfly_valve(G, m, m["castiron"], (3.5, 6.5, Z + 1.7), "x", 0.2)
eq.gauge(G, m, (2.9, 6.5, Z + 1.8), facing="+y", r=0.07, stem=0.12)
# strainer on the return
G.cyl(RET, 0.12, 0.5, at=(3.7, 6.5, Z + 0.4), rot=(0, 40, 0), seg=14)
# hot tap on the live return header: split tee, sandwich valve, tapping machine
hx = 2.1
G.cyl(m["paint_green"], 0.2, 0.5, at=(hx, 6.5, Z + 0.56), axis="x", seg=18)
for sgn in (-1, 1):
    G.cyl(m["paint_green"], 0.23, 0.04, at=(hx + sgn * 0.27, 6.5, Z + 0.56), axis="x", seg=18)
G.cyl(m["paint_green"], 0.11, 0.3, at=(hx, 6.5 + 0.3, Z + 0.56), axis="y", seg=16)
eq.flange(G, m["paint_green"], (hx, 6.95, Z + 0.56), "y", 0.22)
G.box(m["castiron"], (0.36, 0.14, 0.36), at=(hx, 7.06, Z + 0.56), bevel=0.02)          # sandwich valve
eq.handwheel(G, m, (hx, 7.06, Z + 0.95), "z", 0.13)
G.cyl(m["stainless"], 0.02, 0.24, at=(hx, 7.06, Z + 0.82), seg=8)
eq.flange(G, CHW, (hx, 7.17, Z + 0.56), "y", 0.22)
G.cyl(CHW, 0.105, 1.0, at=(hx, 7.7, Z + 0.56), axis="y", seg=18)                        # tapping machine barrel
G.cyl(CHW, 0.14, 0.2, at=(hx, 8.26, Z + 0.56), axis="y", seg=18)
G.box(m["paint_dark"], (0.24, 0.3, 0.3), at=(hx, 8.5, Z + 0.62), bevel=0.02)             # drive
with G.group("tap_feed", bake="vc", pivot=(hx, 8.7, Z + 0.62), spin=spin("y", 2.2)):
    eq.handwheel(G, m, (hx, 8.7, Z + 0.62), "y", 0.17)
G.box(m["paint_dark"], (0.05, 0.05, 0.5), at=(hx - 0.2, 8.0, Z + 0.25))
G.box(m["paint_dark"], (0.05, 0.05, 0.5), at=(hx + 0.2, 8.0, Z + 0.25))
G.box(m["paint_dark"], (0.5, 0.05, 0.05), at=(hx, 8.0, Z + 0.47))
station(G, "piping", (hx, 7.3, Z + 0.75), target=(2.0, 6.6, 1.15))

# ----------------------------------------------------------------------------- 3. air handling unit (cut open)
ax, ay = 6.5, 6.4
aw, ad, ah = 3.0, 1.3, 1.55
G.box(m["paint_dark"], (aw + 0.1, ad + 0.1, 0.12), at=(ax, ay, Z + 0.06))
panel = m["galv"]
G.box(panel, (aw, 0.05, ah), at=(ax, ay - ad / 2, Z + 0.12 + ah / 2), maxseg=0.8)        # back
G.box(panel, (aw, ad, 0.05), at=(ax, ay, Z + 0.12 + ah))                                  # top
G.box(panel, (aw, ad, 0.05), at=(ax, ay, Z + 0.145))
for x in (ax - aw / 2, ax + aw / 2):
    G.box(panel, (0.05, ad, ah), at=(x, ay, Z + 0.12 + ah / 2), maxseg=0.8)
# frame posts on the open front, one closed access door on the fan section
for x in (ax - aw / 2, ax - 0.5, ax + 0.5, ax + aw / 2):
    G.box(m["paint_ral"], (0.06, 0.06, ah), at=(x, ay + ad / 2, Z + 0.12 + ah / 2))
G.box(m["paint_ral"], (aw, 0.06, 0.06), at=(ax, ay + ad / 2, Z + 0.12 + ah - 0.03))
G.box(m["paint_ral"], (aw, 0.06, 0.06), at=(ax, ay + ad / 2, Z + 0.15))
# filter bank (pleated)
for k in range(14):
    G.box(m["insul"], (0.03, ad - 0.2, ah - 0.25), at=(ax - 1.36 + k * 0.035 + (0.0), ay, Z + 0.12 + ah / 2), rot=(0, 0, 14 if k % 2 else -14))
G.box(m["paint_blue"], (0.06, ad - 0.1, 0.06), at=(ax - 1.12, ay, Z + 0.32))
# cooling coil: copper header + fin block
G.box(m["stainless"], (0.3, ad - 0.24, ah - 0.3), at=(ax - 0.1, ay, Z + 0.12 + ah / 2), maxseg=0.5)
for k in range(9):
    G.cyl(m["copper"], 0.018, ad - 0.1, at=(ax - 0.1, ay, Z + 0.4 + k * 0.14), axis="y", seg=6)
    G.cyl(m["copper"], 0.07, 0.02, at=(ax - 0.1, ay + ad / 2 - 0.08, Z + 0.47 + k * 0.14), axis="y", seg=10)
G.cyl(m["copper"], 0.03, ah - 0.3, at=(ax - 0.3, ay + ad / 2 - 0.1, Z + 0.12 + ah / 2), seg=8)
G.cyl(m["copper"], 0.03, ah - 0.3, at=(ax + 0.1, ay + ad / 2 - 0.1, Z + 0.12 + ah / 2), seg=8)
# supply fan (centrifugal wheel) in the last bay
fc = (ax + 1.0, ay, Z + 0.82)
G.cyl(m["paint_ral"], 0.5, 0.5, at=fc, axis="y", seg=24, cap=False)
with G.group("ahu_fan", bake="vc", pivot=fc, spin=spin("y", 7.0)):
    G.cyl(m["paint_dark"], 0.1, 0.5, at=fc, axis="y", seg=10)
    for k in range(16):
        a = 2 * math.pi * k / 16
        G.box(m["galv"], (0.14, 0.42, 0.012), at=(fc[0] + math.cos(a) * 0.36, fc[1], fc[2] + math.sin(a) * 0.36), rot=(0, -math.degrees(a) + 30, 0))
    for sy in (-0.21, 0.21):
        G.lathe(m["galv"], [(0.28, -0.006), (0.44, -0.006), (0.44, 0.006), (0.28, 0.006), (0.28, -0.006)], at=(fc[0], fc[1] + sy, fc[2]), seg=24, axis="y")
eq.motor(G, m, (ax + 1.0, ay - 0.0, Z + 0.33), axis="y", L=0.36, r=0.11, mat=m["paint_blue"], feet=False)
# chilled water into the coil, supply duct out of the top
eq.pipe(G, CHW, [(4.9, 6.5, Z + 1.7), (5.6, 6.5, Z + 1.7), (5.6, 7.25, Z + 1.7), (6.2, 7.25, Z + 1.4), (6.2, 6.95, Z + 1.25)], 0.2)
eq.pipe(G, RET, [(4.9, 6.5, Z + 0.56), (5.6, 6.5, Z + 0.56), (5.6, 7.3, Z + 0.56), (6.6, 7.3, Z + 0.5), (6.6, 6.95, Z + 0.5)], 0.26)
eq.duct(G, m, [(ax + 1.0, ay, Z + 0.12 + ah), (ax + 1.0, ay, Z + 3.0), (ax + 1.0, ay - 2.2, Z + 3.0)], w=0.8, h=0.5)
G.box(m["paint_ral"], (1.0, 0.7, 0.06), at=(ax + 1.0, ay - 2.2, Z + 2.72))
for k in range(5):
    G.box(m["paint_dark"], (0.8, 0.02, 0.02), at=(ax + 1.0, ay - 2.45 + k * 0.12, Z + 2.69))
station(G, "hvac", (ax - 0.1, ay + 0.7, Z + 1.15), cam=(ax + 1.6, 11.4, 1.62), target=(ax + 0.1, ay, 1.2))

# ----------------------------------------------------------------------------- 4. process heater skid
hx0 = 10.3
eq.skid(G, m["paint_dark"], 2.6, 1.3, at=(hx0, 6.4, Z), h=0.14, cross=2)
eq.vessel(G, m["paint_grey"], (hx0 - 0.25, 6.2, Z + 0.95), 0.3, 1.5, axis="x", head=0.3)
for sx in (-0.85, 0.35):
    eq.saddle(G, m, (hx0 + sx, 6.2, Z + 0.14), 0.34)
# terminal enclosure with the element flange
eq.flange(G, m["paint_grey"], (hx0 - 1.15, 6.2, Z + 0.95), "x", 0.5, bolts=12)
G.cyl(m["paint_grey"], 0.26, 0.34, at=(hx0 - 1.36, 6.2, Z + 0.95), axis="x", seg=20)
eq.nozzle(G, m["paint_grey"], (hx0 - 0.7, 6.2, Z + 1.2), "z", 0.14, 0.22)
eq.nozzle(G, m["paint_grey"], (hx0 + 0.3, 6.2, Z + 1.2), "z", 0.14, 0.22)
G.tube(m["cable_black"], [(hx0 - 1.5, 6.2, Z + 0.9), (hx0 - 1.6, 6.2, Z + 0.3), (hx0 - 1.2, 6.9, Z + 0.2), (hx0 + 0.55, 6.9, Z + 0.2), (hx0 + 0.75, 6.9, Z + 0.5)], 0.02, seg=6, bend=0.1)
# thyristor control panel with the door open
cab = eq.cabinet(G, m, (0.7, 0.4, 1.5), at=(hx0 + 0.85, 6.75, Z + 0.14), mat=m["paint_grey"], plinth=0.05, facing="+y", vents=False, handle=False)
G.box(m["galv"], (0.6, 0.012, 1.25), at=(hx0 + 0.85, 6.96, Z + 0.88))
for r_ in range(3):
    for c_ in range(3):
        eq.breaker(G, m, (hx0 + 0.67 + c_ * 0.18, 7.0, Z + 1.3 - r_ * 0.33), w=0.12, h=0.2)
for k in range(4):
    G.cyl(m["plastic_dark"], 0.03, 0.02, at=(hx0 + 0.64 + k * 0.14, 6.99, Z + 0.4), axis="y", seg=10)
G.box(m["paint_grey"], (0.03, 0.66, 1.4), at=(hx0 + 1.22, 7.28, Z + 0.9), rot=(0, 0, 8), bevel=0.004)
G.box(m["led_red"], (0.04, 0.01, 0.04), at=(hx0 + 0.6, 6.96, Z + 1.56))
station(G, "heater", (hx0 - 0.25, 6.55, Z + 1.05))

# ----------------------------------------------------------------------------- 5. compressed air
cx0 = 13.4
c = eq.cabinet(G, m, (1.5, 1.0, 1.5), at=(cx0 - 0.35, 6.3, Z), mat=m["paint_blue"], doors=2, plinth=0.08, facing="+y", vents=True, meter=True)
for k in range(9):
    G.box(m["paint_dark"], (0.55, 0.008, 0.025), at=(cx0 - 0.72, 6.81, Z + 0.55 + k * 0.06))
G.box(m["paint_grey"], (1.5, 1.0, 0.04), at=(cx0 - 0.35, 6.3, Z + 1.52))
# vertical air receiver
eq.vessel(G, m["paint_blue"], (cx0 + 0.95, 6.0, Z + 1.15), 0.36, 1.3, axis="z", head=0.4)
for a in range(3):
    ang = a * 2.094
    G.box(m["paint_blue"], (0.06, 0.06, 0.32), at=(cx0 + 0.95 + math.cos(ang) * 0.3, 6.0 + math.sin(ang) * 0.3, Z + 0.16))
eq.gauge(G, m, (cx0 + 0.95, 6.38, Z + 1.3), facing="+y", r=0.07, stem=0.0)
G.cyl(m["brass"], 0.03, 0.14, at=(cx0 + 0.95, 6.0, Z + 2.05), seg=8)
eq.pipe(G, m["galv"], [(cx0 + 0.2, 6.3, Z + 1.56), (cx0 + 0.2, 6.3, Z + 1.85), (cx0 + 0.95, 6.3, Z + 1.85), (cx0 + 0.95, 6.3, Z + 1.6)], 0.07)
eq.pipe(G, m["galv"], [(cx0 + 1.31, 6.0, Z + 0.7), (cx0 + 1.45, 6.0, Z + 0.7), (cx0 + 1.45, 6.0, Z + 2.6), (cx0 + 0.2, 6.0, Z + 2.6)], 0.06)
station(G, "compressor", (cx0 - 0.35, 6.85, Z + 1.2), cam=(12.9, 11.5, 1.62), target=(13.5, 6.2, 1.2), stand=(11.9, 8.4, 0.12), fov=54)

# flows: water round the loop, compressed air to the receiver
flow(G, "chw", [(-1.55, 7.15, Z + 1.1), (-1.55, 7.15, Z + 1.7), (0.4, 7.15, Z + 1.7), (0.9, 6.5, Z + 1.7), (5.6, 6.5, Z + 1.7), (5.6, 7.25, Z + 1.7), (6.2, 7.0, Z + 1.3)], speed=2.4, color="#4aa8ff", count=8)
flow(G, "ret", [(6.6, 7.0, Z + 0.5), (5.6, 7.3, Z + 0.56), (5.6, 6.5, Z + 0.56), (0.6, 6.5, Z + 0.56), (0.2, 7.15, Z + 0.56), (-1.19, 7.15, Z + 0.56)], speed=2.4, color="#4fe0a6", count=7)
flow(G, "air", [(cx0 + 0.2, 6.3, Z + 1.56), (cx0 + 0.2, 6.3, Z + 1.85), (cx0 + 0.95, 6.3, Z + 1.85), (cx0 + 0.95, 6.3, Z + 1.6)], speed=1.6, color="#ffffff", count=4, size=0.12)

overview(G)
finish(G, "mechanical")
