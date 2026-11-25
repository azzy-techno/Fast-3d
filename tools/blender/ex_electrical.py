"""Level 02 - Electrical: power from the grid to the load.
Ring main unit -> distribution transformer -> LV switchboard -> cable ladder and terminations -> feeder
pillar and lighting. Scope: FAST O&M profile pp. 7-8.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exhibit_common import *
from gallery import PX0, PX1, PY0, PY1

G, m = begin()
h0 = eq.platform(G, m, PX0, PX1, PY0, PY1)
Z = h0

# ----------------------------------------------------------------------------- 1. smart ring main unit
with G.at((-2.6, 6.6, Z)):
    w, d, h = 1.74, 0.86, 1.62
    G.box(m["paint_dark"], (w + 0.06, d + 0.06, 0.12), at=(0, 0, 0.06))
    G.box(m["paint_ral"], (w, d, h - 0.12), at=(0, 0, 0.12 + (h - 0.12) / 2), bevel=0.014, maxseg=0.8)
    fy = d / 2 + 0.006
    for i in range(3):
        cx = -w / 2 + w / 3 * (i + 0.5)
        G.box(m["paint_ral"], (w / 3 - 0.03, 0.012, 0.86), at=(cx, fy, 1.13), bevel=0.004)
        G.box(m["paint_grey"], (w / 3 - 0.03, 0.012, 0.52), at=(cx, fy, 0.42), bevel=0.004)
        # mimic diagram: busbar, switch, cable
        G.box(m["plastic_dark"], (w / 3 - 0.12, 0.004, 0.022), at=(cx, fy + 0.008, 1.44))
        G.box(m["plastic_dark"], (0.022, 0.004, 0.2), at=(cx, fy + 0.008, 1.33))
        G.cyl(m["plastic_dark"], 0.05, 0.03, at=(cx, fy + 0.012, 1.17), axis="y", seg=14)
        G.box(m["paint_yellow"] if i < 2 else m["paint_red"], (0.03, 0.02, 0.11), at=(cx, fy + 0.03, 1.17), rot=(0, 35 if i < 2 else 0, 0))
        G.box(m["plastic_dark"], (0.022, 0.004, 0.2), at=(cx, fy + 0.008, 0.98))
        G.box(m["led_green"] if i < 2 else m["led_amber"], (0.05, 0.008, 0.03), at=(cx - 0.14, fy + 0.008, 0.86))
        G.box(m["plastic_dark"], (0.12, 0.008, 0.05), at=(cx + 0.1, fy + 0.008, 0.86))
        eq.nameplate(G, m, (cx, fy + 0.008, 1.55), (0.22, 0.045), "+y")
        # MV cable terminations in the cable box (visible below)
        for k in range(3):
            G.tube(m["cable_red"], [(cx - 0.12 + k * 0.12, 0.25, 0.5), (cx - 0.12 + k * 0.12, 0.25, 0.02)], 0.022, seg=8)
    eq.gauge(G, m, (w / 2 - 0.12, fy - 0.01, 1.3), facing="+y", r=0.045, stem=0.0)
    # the "smart" part: remote terminal unit and antenna on top
    G.box(m["paint_grey"], (0.5, 0.3, 0.34), at=(-0.45, 0.05, h + 0.17), bevel=0.01)
    G.box(m["led_green"], (0.03, 0.006, 0.02), at=(-0.6, 0.205, h + 0.24))
    G.box(m["accent"], (0.03, 0.006, 0.02), at=(-0.54, 0.205, h + 0.24))
    G.cyl(m["plastic_dark"], 0.012, 0.42, at=(-0.28, 0.05, h + 0.55), seg=6)
station(G, "rmu", (-2.6, 7.05, Z + 1.2))

# cable trench from the RMU feeder bay to the transformer HV side
tr_y = 5.2
G.box(m["paint_dark"], (4.6, 0.5, 0.06), at=(-0.4, tr_y, Z + 0.03))
for k in range(3):
    yy = tr_y - 0.12 + k * 0.12
    G.tube(m["cable_red"], [(-2.05 - 0.12 + k * 0.12, 6.85, Z + 0.1), (-2.05 - 0.12 + k * 0.12, tr_y + 0.4, Z + 0.09), (-2.0 + k * 0.1, yy, Z + 0.09), (1.2, yy, Z + 0.09),
                            (1.45, yy, Z + 0.3), (1.45, 5.95 + k * 0.28, Z + 1.0), (1.45, 5.95 + k * 0.28, Z + 1.62)], 0.024, seg=8, bend=0.12)

# ----------------------------------------------------------------------------- 2. distribution transformer
with G.at((1.9, 6.3, Z)):
    tw, td, th = 1.5, 0.82, 1.15
    eq.skid(G, m["paint_dark"], 1.7, 0.9, at=(0, 0, 0), h=0.12, cross=2)
    for sx in (-0.6, 0.6):
        for sy in (-0.45, 0.45):
            G.cyl(m["castiron"], 0.09, 0.07, at=(sx, sy, 0.06), axis="y", seg=12)
    G.box(m["paint_grey"], (tw, td, th), at=(0, 0, 0.12 + th / 2), bevel=0.02, maxseg=0.7)
    # corrugated radiator fins on both long sides and the ends
    for sy in (-1, 1):
        n = 22
        for i in range(n):
            G.box(m["paint_grey"], (0.018, 0.2, th - 0.22), at=(-tw / 2 + 0.07 + i * (tw - 0.14) / (n - 1), sy * (td / 2 + 0.1), 0.12 + th / 2))
    for sx in (-1, 1):
        for i in range(9):
            G.box(m["paint_grey"], (0.16, 0.018, th - 0.3), at=(sx * (tw / 2 + 0.08), -td / 2 + 0.1 + i * (td - 0.2) / 8, 0.12 + th / 2))
    lid = 0.12 + th
    G.box(m["paint_grey"], (tw + 0.1, td + 0.1, 0.04), at=(0, 0, lid + 0.02), bevel=0.008)
    # HV porcelain bushings (ribbed) and LV bushings
    for k in range(3):
        bx, by = -0.45, -0.35 + k * 0.28 + 0.07
        for r_ in range(6):
            G.cyl(m["porcelain"], 0.075 - r_ * 0.004, 0.035, at=(bx, by, lid + 0.07 + r_ * 0.06), seg=14, r2=0.045)
        G.cyl(m["brass"], 0.016, 0.12, at=(bx, by, lid + 0.46), seg=8)
    for k in range(4):
        G.cyl(m["porcelain"], 0.05, 0.16, at=(0.45, -0.33 + k * 0.22, lid + 0.12), seg=12, r2=0.035)
        G.box(m["copper"], (0.05, 0.012, 0.1), at=(0.45, -0.33 + k * 0.22, lid + 0.25))
    # conservator
    eq.vessel(G, m["paint_grey"], (0.0, 0.52, lid + 0.52), 0.14, 0.9, axis="x", head=0.3)
    for sx in (-0.3, 0.3):
        G.box(m["paint_grey"], (0.04, 0.06, 0.42), at=(sx, 0.48, lid + 0.24))
    G.tube(m["paint_grey"], [(0.3, 0.5, lid + 0.4), (0.3, 0.3, lid + 0.3), (0.3, 0.3, lid + 0.04)], 0.02, seg=8)
    eq.nameplate(G, m, (0.1, td / 2 + 0.215, 0.9), (0.26, 0.18), "+y")
    eq.gauge(G, m, (-0.5, td / 2 + 0.22, 1.0), facing="+y", r=0.05, stem=0.0)
    G.box(m["paint_yellow"], (0.3, 0.004, 0.08), at=(0.1, td / 2 + 0.214, 0.62))
station(G, "transformer", (1.6, 6.5, Z + 1.75))

# LV busduct from the transformer to the switchboard incomer
for k in range(4):
    yy = 5.97 + k * 0.22
    G.box(m["copper"], (3.5, 0.03, 0.08), at=(4.1, yy, Z + 1.55 + 0.0)) if False else None
G.box(m["paint_grey"], (3.3, 0.5, 0.22), at=(4.1, 6.3, Z + 1.62), bevel=0.01)
for x in (2.7, 3.7, 4.7, 5.5):
    G.box(m["paint_dark"], (0.05, 0.56, 0.26), at=(x, 6.3, Z + 1.62))
G.box(m["paint_dark"], (0.06, 0.06, 1.5), at=(3.9, 6.3, Z + 0.75))
G.box(m["paint_dark"], (0.3, 0.3, 0.012), at=(3.9, 6.3, Z + 0.006))

# ----------------------------------------------------------------------------- 3. LV switchboard
with G.at((6.4, 6.4, Z)):
    sw, sd, sh = 0.8, 0.8, 2.1
    for i in range(3):
        cx = -0.8 + i * sw
        G.box(m["paint_dark"], (sw - 0.02, sd - 0.04, 0.1), at=(cx, 0, 0.05))
        if i == 1:
            # middle section stands open: frame, copper busbars and outgoing breakers on show
            for sx in (-1, 1):
                G.box(m["paint_ral"], (0.03, sd, sh - 0.1), at=(cx + sx * (sw / 2 - 0.015), 0, 0.1 + (sh - 0.1) / 2))
            G.box(m["paint_ral"], (sw, sd, 0.03), at=(cx, 0, sh - 0.015))
            G.box(m["paint_ral"], (sw, 0.03, sh - 0.1), at=(cx, -sd / 2 + 0.015, 0.1 + (sh - 0.1) / 2))
            G.box(m["paint_grey"], (sw - 0.08, 0.012, sh - 0.2), at=(cx, -sd / 2 + 0.06, 0.1 + (sh - 0.1) / 2))
            for k in range(3):
                G.box(m["copper"], (sw - 0.1, 0.012, 0.06), at=(cx, 0.05 + k * 0.07, 1.86 - k * 0.0), bevel=0.003)
                G.box(m["copper"], (0.05, 0.012, 1.25), at=(cx - 0.24 + k * 0.1, 0.05 + k * 0.07, 1.2), bevel=0.003)
            for r_ in range(4):
                for c_ in range(2):
                    eq.breaker(G, m, (cx + 0.08 + c_ * 0.2, 0.2, 1.55 - r_ * 0.3), w=0.16, h=0.22)
            # outgoing cables dressed down the side in one neat loom
            for k in range(4):
                G.box(m["cable_black"], (0.022, 0.022, 1.5), at=(cx + 0.33, 0.12 + k * 0.03, 0.9))
            # the open door, swung out
            G.box(m["paint_ral"], (0.03, sw - 0.06, sh - 0.2), at=(cx + sw / 2 + 0.1, sd / 2 + (sw - 0.06) / 2 - 0.02, 0.1 + (sh - 0.1) / 2), rot=(0, 0, 14), bevel=0.004)
        else:
            c = eq.cabinet(G, m, (sw, sd, sh), at=(cx, 0, 0), plinth=0.1, vents=True, facing="+y", meter=i == 0,
                           lights=((-0.12, 1.86, "led_red"), (0, 1.86, "led_amber"), (0.12, 1.86, "led_green")))
            if i == 0:
                # incomer: air circuit breaker
                G.box(m["plastic_dark"], (0.46, 0.05, 0.5), at=(cx, sd / 2 + 0.03, 1.1), bevel=0.01)
                G.box(m["paint_grey"], (0.3, 0.02, 0.16), at=(cx, sd / 2 + 0.06, 1.2))
                G.box(m["paint_yellow"], (0.06, 0.05, 0.14), at=(cx + 0.1, sd / 2 + 0.07, 0.98), bevel=0.006)
                G.box(m["led_green"], (0.03, 0.01, 0.03), at=(cx - 0.12, sd / 2 + 0.06, 0.98))
            else:
                for r_ in range(5):
                    G.box(m["plastic_dark"], (0.5, 0.02, 0.16), at=(cx, sd / 2 + 0.016, 1.62 - r_ * 0.26), bevel=0.006)
                    G.box(m["paint_grey"], (0.08, 0.03, 0.06), at=(cx + 0.14, sd / 2 + 0.03, 1.62 - r_ * 0.26))
station(G, "lvpanel", (6.4, 6.75, Z + 1.75))

# ----------------------------------------------------------------------------- 4. cables: ladder, drum, terminations
lad_z = Z + 2.75
eq.cable_tray(G, m, [(7.0, 6.4, lad_z), (12.6, 6.4, lad_z)], w=0.45)
for x in (8.2, 11.4):
    G.box(m["paint_dark"], (0.06, 0.06, lad_z - Z), at=(x, 6.75, Z + (lad_z - Z) / 2))
    G.box(m["paint_dark"], (0.06, 0.5, 0.05), at=(x, 6.5, lad_z - 0.08))
    G.box(m["paint_dark"], (0.3, 0.3, 0.012), at=(x, 6.75, Z + 0.006))
eq.cables(G, [m["cable_black"]], [(7.0, 6.4, Z + 2.1), (7.0, 6.4, lad_z + 0.03), (12.6, 6.4, lad_z + 0.03), (12.9, 6.4, lad_z - 0.2), (12.9, 6.4, Z + 1.35)], n=4, r=0.022, spread=0.07, axis="y")
# cable drum on jacks: cable pulling and laying
with G.at((9.6, 5.0, Z)):
    for sy in (-1, 1):
        G.cyl(m["wood"], 0.72, 0.045, at=(0, sy * 0.36, 0.84), axis="y", seg=28)
        G.box(m["paint_yellow"], (0.5, 0.08, 0.06), at=(0, sy * 0.48, 0.03))
        G.box(m["paint_yellow"], (0.07, 0.07, 0.86), at=(0, sy * 0.48, 0.46))
    G.cyl(m["cable_black"], 0.5, 0.66, at=(0, 0, 0.84), axis="y", seg=24)
    G.cyl(m["wood_dark"], 0.2, 0.7, at=(0, 0, 0.84), axis="y", seg=14)
    G.cyl(m["steel"], 0.03, 1.1, at=(0, 0, 0.84), axis="y", seg=8)
    G.tube(m["cable_black"], [(0, 0.1, 1.33), (0.9, 0.3, 1.2), (1.6, 0.9, 0.5), (1.9, 1.4, 0.06), (2.6, 1.4, 0.06)], 0.03, seg=8, bend=0.3)
# MV termination and joint demonstration bench
with G.at((10.1, 8.3, Z)):
    G.box(m["paint_dark"], (1.9, 0.6, 0.05), at=(0, 0, 0.9), bevel=0.008)
    for sx in (-0.85, 0.85):
        for sy in (-0.22, 0.22):
            G.box(m["paint_dark"], (0.05, 0.05, 0.9), at=(sx, sy, 0.45))
    # stepped cutaway of a single-core MV cable: jacket, screen, insulation, conductor
    steps = [(m["cable_black"], 0.055, 0.5), (m["copper"], 0.049, 0.16), (m["plastic_dark"], 0.045, 0.1), (m["xlpe"], 0.041, 0.26), (m["copper"], 0.02, 0.2)]
    x = -0.8
    for mat_, r_, L_ in steps:
        G.cyl(mat_, r_, L_, at=(x + L_ / 2, 0.1, 0.98), axis="x", seg=18)
        x += L_
    G.box(m["copper"], (0.12, 0.05, 0.012), at=(x + 0.04, 0.1, 0.98))
    # three finished heat-shrink terminations standing on a rail
    G.box(m["galv"], (0.9, 0.06, 0.04), at=(0.35, -0.16, 0.945))
    for k in range(3):
        bx = 0.05 + k * 0.3
        G.cyl(m["cable_red"], 0.03, 0.5, at=(bx, -0.16, 1.2), seg=10)
        for r_ in range(3):
            G.cyl(m["cable_red"], 0.062, 0.02, at=(bx, -0.16, 1.26 + r_ * 0.07), seg=12, r2=0.034)
        G.cyl(m["copper"], 0.014, 0.1, at=(bx, -0.16, 1.5), seg=8)
        G.box(m["copper"], (0.045, 0.01, 0.07), at=(bx, -0.16, 1.58))
station(G, "cables", (10.0, 8.2, Z + 1.1), target=(9.8, 6.9, 1.3), stand=(8.3, 9.2, 0.12))

# ----------------------------------------------------------------------------- 5. feeder pillar and lighting
with G.at((13.0, 6.4, Z)):
    G.box(m["conc_fresh"], (1.3, 0.6, 0.16), at=(0, 0, 0.08), bevel=0.01)
    c = eq.cabinet(G, m, (1.1, 0.42, 1.25), at=(0, 0, 0.16), mat=m["paint_grey"], doors=2, plinth=0.06, facing="+y")
    G.box(m["paint_grey"], (1.2, 0.52, 0.05), at=(0, 0, 1.44), rot=(6, 0, 0), bevel=0.01)
    # smart meter on the pillar door
    G.box(m["white"], (0.16, 0.05, 0.24), at=(0.28, 0.24, 1.0), bevel=0.01)
    G.plane(m["screen"], (0.1, 0.05), at=(0.28, 0.268, 1.05), rot=(90, 0, 180), uvfit=True)
    G.box(m["led_red"], (0.012, 0.006, 0.012), at=(0.33, 0.268, 0.95))
# lighting column with LED floodlights, fed from the pillar
with G.at((14.1, 4.6, Z)):
    G.box(m["conc_fresh"], (0.5, 0.5, 0.12), at=(0, 0, 0.06))
    G.cyl(m["galv"], 0.075, 4.2, at=(0, 0, 2.2), seg=10, r2=0.05)
    G.box(m["galv"], (0.9, 0.05, 0.05), at=(0, 0, 4.25))
    for sx in (-0.38, 0.38):
        G.box(m["paint_dark"], (0.34, 0.26, 0.09), at=(sx, 0.08, 4.16), rot=(-40, 0, 0), bevel=0.01)
        with G.group("lamp_on", bake="none"):
            G.box(m["led_white"], (0.3, 0.22, 0.012), at=(sx, 0.115, 4.12), rot=(-40, 0, 0))
        G.marker("glow", f"flood{sx}", (sx, 0.2, 4.08), color="#f4f8ff", size=1.5)
G.tube(m["cable_black"], [(13.3, 6.3, Z + 0.3), (13.7, 5.6, Z + 0.05), (14.1, 5.0, Z + 0.05), (14.1, 4.7, Z + 0.2)], 0.018, seg=6, bend=0.15)
station(G, "lighting", (13.0, 6.65, Z + 1.3), cam=(12.3, 11.6, 1.62), target=(13.4, 5.6, 2.0), stand=(11.3, 8.4, 0.12), fov=56)

# the path the power takes (animated as travelling pulses)
flow(G, "power", [(-2.05, 6.85, Z + 0.5), (-2.05, tr_y + 0.4, Z + 0.1), (1.2, tr_y, Z + 0.1), (1.45, 6.2, Z + 1.65), (2.35, 6.3, Z + 1.75), (5.6, 6.3, Z + 1.65), (6.4, 6.45, Z + 1.9),
                  (7.0, 6.4, lad_z + 0.05), (12.6, 6.4, lad_z + 0.05), (12.9, 6.4, Z + 1.3), (13.7, 5.6, Z + 0.08), (14.1, 4.7, Z + 0.3), (14.1, 4.6, Z + 4.1)],
     speed=3.2, color="#ffd24a", count=9, size=0.2)

overview(G)
finish(G, "electrical")
