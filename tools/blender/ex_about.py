"""Level 01 - About FAST: five walls of evidence.
Who FAST is -> certificates and registrations -> supplier portals -> technology partners -> sectors served.
The wall graphics (real certificates and logos) are drawn by the engine; the About viewer opens them full size.
Two museum cases stand in the aisle: a model of Balhamer Business Gate (the Dammam head office building)
and a model process plant, each with a caption plate.
Sources: FAST O&M profile pp. 3-5, 25-26, 45-46; head-office photograph public/photos/about-1.webp.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exhibit_common import *
from gallery import PX0, PX1, PY0, PY1

G, m = begin()
Z = eq.platform(G, m, PX0, PX1, PY0, PY1)
WALL = M("about_wall", "#1d2228", rough=0.7)
WW, WH = 3.4, 2.55
WY = 6.0
XS = (-3.0, 1.0, 5.0, 9.0, 13.0)   # five walls, evenly spaced with a clear gap between each


def wall(x, y, name, rz=0):
    with G.at((x, y, Z), rz=rz):
        G.box(WALL, (WW + 0.2, 0.24, WH + 0.35), at=(0, 0, (WH + 0.35) / 2), bevel=0.015, maxseg=0.9)
        G.box(m["accent"], (WW + 0.2, 0.02, 0.03), at=(0, 0.125, 0.12))
        with G.group(f"sign_{name}", bake="none"):
            G.plane(M(f"sign_{name}", "#ffffff", emit=1.0, kind="sign", sign=name), (WW, WH), at=(0, 0.125, 0.22 + WH / 2), rot=(90, 0, 180), uvfit=True)
        # picture light over the wall
        G.box(m["paint_dark"], (WW - 0.4, 0.3, 0.04), at=(0, 0.26, WH + 0.5))
        G.box(m["paint_dark"], (0.04, 0.04, 0.2), at=(0, 0.12, WH + 0.42))
    with G.group("wall_lights", bake="none"):
        with G.at((x, y, Z), rz=rz):
            G.box(m["light_warm"], (WW - 0.5, 0.2, 0.012), at=(0, 0.28, WH + 0.474))


def museum_case(w, d, case_h, caption, deck="white", h=0.95):
    """Gallery plinth: recessed toe, smooth body, brass line, lit deck, acrylic cover and a caption plate.
    Leaves the origin at the plinth centre; returns the deck height."""
    G.box(m["castiron"], (w - 0.1, d - 0.1, 0.07), at=(0, 0, 0.035))
    G.box(m["white"], (w, d, h - 0.09), at=(0, 0, 0.07 + (h - 0.09) / 2), bevel=0.012, maxseg=0.4)
    G.box(m["brass"], (w + 0.012, d + 0.012, 0.014), at=(0, 0, h - 0.013))
    G.box(m[deck], (w - 0.05, d - 0.05, 0.02), at=(0, 0, h))
    top = h + 0.01
    with G.group("case_light", bake="none"):
        G.box(m["led_white"], (w - 0.12, 0.012, 0.006), at=(0, d / 2 - 0.05, top + 0.003))
        G.box(m["led_white"], (w - 0.12, 0.012, 0.006), at=(0, -d / 2 + 0.05, top + 0.003))
    cw, cd = w - 0.07, d - 0.07
    with G.group("case_glass", bake="none"):
        G.plane(m["glass_clear"], (cw, case_h), at=(0, cd / 2, top + case_h / 2), rot=(90, 0, 180))
        G.plane(m["glass_clear"], (cw, case_h), at=(0, -cd / 2, top + case_h / 2), rot=(90, 0, 0))
        G.plane(m["glass_clear"], (cd, case_h), at=(cw / 2, 0, top + case_h / 2), rot=(90, 0, 90))
        G.plane(m["glass_clear"], (cd, case_h), at=(-cw / 2, 0, top + case_h / 2), rot=(90, 0, -90))
        G.plane(m["glass_clear"], (cw, cd), at=(0, 0, top + case_h))
    for sx in (-1, 1):
        for sy in (-1, 1):
            G.box(m["stainless"], (0.008, 0.008, case_h), at=(sx * cw / 2, sy * cd / 2, top + case_h / 2))
    # caption plate on the visitor side
    pw = min(w - 0.12, 0.66)
    G.box(m["brass"], (pw + 0.02, 0.008, pw / 4 + 0.02), at=(0, d / 2 + 0.004, h - 0.26))
    with G.group(f"sign_{caption}", bake="none"):
        G.plane(M(f"sign_{caption}", "#ffffff", emit=1.0, kind="sign", sign=caption), (pw, pw / 4), at=(0, d / 2 + 0.0095, h - 0.26), rot=(90, 0, 180), uvfit=True)
    return top


# ----------------------------------------------------------------------------- Balhamer Business Gate
BBG_GLASS = M("bbg_glass", "#3a93e6", rough=0.28, metal=0.0)
BBG_STONE = M("bbg_stone", "#d9c39a", rough=0.7)
BBG_DARK = M("bbg_dark", "#1f4f86", rough=0.5)


def lens(a, b, back, t0=-75.0, t1=75.0, n=14, scale=1.0):
    """Front of the tower: a shallow arc bulging towards -Y between x = -a and x = +a."""
    tm = math.radians(75.0)
    pts = []
    for k in range(n + 1):
        t = math.radians(t0 + (t1 - t0) * k / n)
        pts.append((a * math.sin(t) / math.sin(tm) * scale, -b * (math.cos(t) - math.cos(tm)) / (1 - math.cos(tm)) * scale))
    return pts


def balhamer(h=1.02):
    a, b, back = 0.2, 0.125, 0.085
    front = lens(a, b, back)
    outline = front + [(a, back), (-a, back)]
    # site and podium
    G.box(m["concrete"], (0.66, 0.6, 0.012), at=(0, 0, 0.006))
    G.box(BBG_STONE, (0.5, 0.3, 0.05), at=(0.02, 0.03, 0.037))
    z0 = 0.062
    G.extrude(BBG_GLASS, outline, h, at=(0, 0, z0), maxseg=0.1)   # rows of vertices so the baked light reads on the glass
    # flat stone back and the dark service core on one edge
    G.box(BBG_STONE, (2 * a + 0.006, 0.02, h + 0.012), at=(0, back + 0.008, z0 + h / 2))
    G.box(BBG_DARK, (0.03, back + 0.03, h + 0.02), at=(-a - 0.006, back / 2, z0 + h / 2))

    def band(t0, t1, z, bh, mat, so=1.035, si=0.97):
        outer = lens(a, b, back, t0, t1, n=10, scale=so)
        inner = lens(a, b, back, t0, t1, n=10, scale=si)
        G.extrude(mat, outer + inner[::-1], bh, at=(0, 0, z0 + z))

    # two stone bands wrap the base, then the glass rises
    band(-75, 75, 0.0, 0.035, BBG_STONE)
    band(-75, 75, 0.085, 0.03, BBG_STONE)
    # floor lines in the glass
    for k in range(1, 26):
        zz = 0.115 + k * (h - 0.15) / 26
        band(-75, 75, zz, 0.003, BBG_DARK, so=1.006, si=0.985)
    # the sweeping stone fins on one side: long near the base, shorter towards the top
    n = 13
    for k in range(n):
        zz = 0.16 + k * (h - 0.26) / (n - 1)
        start = 8.0 + 52.0 * (k / (n - 1)) ** 1.2
        band(start, 75, zz, 0.012, BBG_STONE)
    # crown
    band(-75, 75, h - 0.02, 0.03, BBG_STONE, so=1.02, si=0.9)
    G.box(BBG_DARK, (0.24, 0.1, 0.035), at=(0, 0.0, z0 + h + 0.017))
    # neighbouring car park block and a few trees for scale
    G.box(BBG_STONE, (0.16, 0.2, 0.3), at=(0.26, 0.12, 0.162))
    for k in range(5):
        G.box(BBG_DARK, (0.162, 0.02, 0.006), at=(0.26, 0.02, 0.07 + k * 0.05))
    for tx, ty in ((-0.24, -0.2), (-0.12, -0.24), (0.06, -0.24), (0.2, -0.2)):
        G.cyl(m["trunk"], 0.004, 0.03, at=(tx, ty, 0.027), seg=5)
        G.sphere(m["shrub"], 0.018, at=(tx, ty, 0.05), seg=8, rings=5)


def model_plant():
    """A process plant in miniature: storage tanks, a distillation column, a product sphere, a pipe rack,
    a control building and a flare - the kind of site FAST builds, maintains and upgrades."""
    G.box(m["concrete"], (1.12, 0.78, 0.012), at=(0, 0, 0.006))
    for tx, ty, r, hh in ((-0.4, 0.2, 0.1, 0.15), (-0.16, 0.2, 0.1, 0.15), (-0.4, -0.03, 0.075, 0.12)):
        G.cyl(m["white"], r, hh, at=(tx, ty, 0.012 + hh / 2), seg=20)
        G.cyl(m["steel"], r * 1.03, 0.008, at=(tx, ty, 0.012 + hh), seg=20)
        G.cyl(m["paint_blue"], r * 1.01, 0.012, at=(tx, ty, 0.012 + hh * 0.55), seg=20)
    G.cyl(m["stainless"], 0.035, 0.46, at=(0.1, 0.2, 0.242), seg=14)
    for k in range(4):
        G.cyl(m["steel"], 0.045, 0.008, at=(0.1, 0.2, 0.1 + k * 0.1), seg=14)
    G.sphere(m["white"], 0.075, at=(0.34, 0.22, 0.125), seg=16, rings=10)
    for q in range(4):
        G.cyl(m["steel"], 0.005, 0.1, at=(0.34 + math.cos(q * 1.57) * 0.06, 0.22 + math.sin(q * 1.57) * 0.06, 0.062), seg=5)
    for k in range(7):
        x = -0.48 + k * 0.16
        for yy in (-0.2, -0.28):
            G.box(m["steel"], (0.009, 0.009, 0.11), at=(x, yy, 0.067))
        G.box(m["steel"], (0.009, 0.09, 0.009), at=(x, -0.24, 0.124))
    for i, col in enumerate((m["paint_green"], m["paint_blue"], m["paint_yellow"])):
        G.cyl(col, 0.009, 1.0, at=(0.0, -0.215 - i * 0.025, 0.137), axis="x", seg=6)
    G.box(m["paint_grey"], (0.2, 0.13, 0.07), at=(0.36, -0.05, 0.047))
    G.box(m["paint_dark"], (0.21, 0.14, 0.008), at=(0.36, -0.05, 0.086))
    G.box(m["paint_blue"], (0.13, 0.09, 0.05), at=(0.12, -0.04, 0.037))
    G.cyl(m["steel"], 0.008, 0.52, at=(0.5, -0.3, 0.272), seg=6)
    with G.group("flare_tip", bake="none"):
        G.sphere(m["led_amber"], 0.018, at=(0.5, -0.3, 0.55), seg=8, rings=5, scale=(1, 1, 1.7))


# ----------------------------------------------------------------------------- 1. story + head-office model
wall(XS[0], WY, "about_story")
with G.at((-4.2, 8.4, Z)):
    top = museum_case(0.8, 0.8, 0.98, "cap_tower")
    with G.at((0, 0, top), rz=145, s=0.8):   # the glass front faces the visitor aisle
        balhamer()
station(G, "story", (XS[0], WY + 0.2, Z + 1.7), cam=(XS[0] + 1.4, 11.5, 1.62), target=(XS[0] - 0.3, WY, 1.55), stand=(-4.35, 7.0, 0.12), fov=54)

# ----------------------------------------------------------------------------- 2. credentials
wall(XS[1], WY, "about_credentials")
station(G, "credentials", (XS[1], WY + 0.2, Z + 1.7), target=(XS[1] - 0.2, WY, 1.55))

# ----------------------------------------------------------------------------- 3. supplier portal registrations
wall(XS[2], WY, "about_registrations")
station(G, "registrations", (XS[2], WY + 0.2, Z + 1.7), target=(XS[2] - 0.2, WY, 1.55))

# ----------------------------------------------------------------------------- 4. technology partners
wall(XS[3], WY, "about_partners")
station(G, "partners", (XS[3], WY + 0.2, Z + 1.7), target=(XS[3] - 0.2, WY, 1.55))

# ----------------------------------------------------------------------------- 5. sectors + model plant
wall(XS[4], WY, "about_sectors")
with G.at((11.3, 8.85, Z)):
    top = museum_case(1.15, 0.86, 0.62, "cap_plant", deck="paint_dark")
    with G.at((0, 0, top), rz=180, s=0.92):
        model_plant()
station(G, "sectors", (XS[4], WY + 0.2, Z + 1.7), cam=(13.6, 12.6, 1.62), target=(12.4, WY, 1.5), stand=(12.3, 7.6, 0.12), fov=54)

overview(G)
finish(G, "about")
