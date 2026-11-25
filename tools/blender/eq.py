"""Equipment parts kit for the service-floor exhibits. Every part is built in the current local frame of G.

Sizes are metres. `axis` is 'x' | 'y' | 'z': the direction a pipe, shaft or flange faces.
"""
import math, random
from mathutils import Vector
from fastlib import M


def emats(m):
    """Extra materials used by equipment (added to the shared palette dict)."""
    m["paint_grey"] = M("paint_grey", "#a9aeb2", rough=0.45, metal=0.15)
    m["paint_ral"] = M("paint_ral", "#bfc2bd", rough=0.5, metal=0.1)
    m["paint_blue"] = M("paint_blue", "#1f5fa8", rough=0.42, metal=0.2)
    m["paint_green"] = M("paint_green", "#2f8a5f", rough=0.45, metal=0.15)
    m["paint_red"] = M("paint_red", "#c5282a", rough=0.4, metal=0.15)
    m["paint_yellow"] = M("paint_yellow", "#e2b21c", rough=0.5, metal=0.1)
    m["paint_orange"] = M("paint_orange", "#e2702a", rough=0.45, metal=0.15)
    m["paint_dark"] = M("paint_dark", "#2d3238", rough=0.5, metal=0.3)
    m["stainless"] = M("stainless", "#c8ccd0", rough=0.26, metal=0.8)
    m["galv"] = M("galv", "#aab0b5", rough=0.5, metal=0.55)
    m["copper"] = M("copper", "#c47a4a", rough=0.3, metal=0.9)
    m["brass"] = M("brass", "#c9a55a", rough=0.3, metal=0.9)
    m["castiron"] = M("castiron", "#3a3f45", rough=0.6, metal=0.4)
    m["insul"] = M("insul", "#d8d8d2", rough=0.7)
    m["cable_black"] = M("cable_black", "#1b1c1f", rough=0.6)
    m["cable_red"] = M("cable_red", "#b3261e", rough=0.55)
    m["cable_yellow"] = M("cable_yellow", "#d8a81a", rough=0.55)
    m["cable_blue"] = M("cable_blue", "#1d5fb0", rough=0.55)
    m["xlpe"] = M("xlpe", "#e7e2d2", rough=0.5)
    m["porcelain"] = M("porcelain", "#7a3b2a", rough=0.3)
    m["plinth"] = M("plinth", "#22262b", rough=0.55, tex="concrete", tile=4.0)
    m["plinth_edge"] = M("plinth_edge", "#3a3f46", rough=0.4, metal=0.5)
    m["accent"] = M("accent", "#27a8ee", emit=5.0, kind="emit", accent=1)
    m["led_green"] = M("led_green", "#3cff8a", emit=6.0, kind="emit")
    m["led_red"] = M("led_red", "#ff3b2b", emit=6.0, kind="emit")
    m["led_amber"] = M("led_amber", "#ffb020", emit=6.0, kind="emit")
    m["led_white"] = M("led_white", "#f4f8ff", emit=8.0, kind="emit")
    m["screen"] = M("screen", "#0c2236", emit=1.6, kind="screen")
    m["soil_a"] = M("soil_a", "#8a6a48", rough=0.95)
    m["soil_b"] = M("soil_b", "#6f5a44", rough=0.95)
    m["gravel"] = M("gravel", "#8d8a84", rough=0.95, tex="asphalt", tile=1.5)
    m["rebar"] = M("rebar", "#6a4a3a", rough=0.6, metal=0.5)
    m["conc_fresh"] = M("conc_fresh", "#b3b1ab", rough=0.8, tex="precast", tile=2.0)
    m["hivis"] = M("hivis", "#d6e023", rough=0.7)
    return m


AX = {"x": (1, 0, 0), "y": (0, 1, 0), "z": (0, 0, 1)}


def _off(at, axis, d):
    a = AX[axis]
    return (at[0] + a[0] * d, at[1] + a[1] * d, at[2] + a[2] * d)


# ----------------------------------------------------------------------------- staging
def platform(G, m, x0, x1, y0, y1, h=0.12):
    """Low dark plinth with a lit edge; subdivided so vertex baking catches contact shadows."""
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    G.box(m["plinth"], (x1 - x0, y1 - y0, h), at=(cx, cy, h / 2), bevel=0.012, maxseg=0.42)
    with G.group("accent_strip", bake="none"):
        G.box(m["accent"], (x1 - x0 + 0.02, 0.03, 0.025), at=(cx, y1 + 0.012, 0.03))
        G.box(m["accent"], (x1 - x0 + 0.02, 0.03, 0.025), at=(cx, y0 - 0.012, 0.03))
        for x in (x0 - 0.012, x1 + 0.012):
            G.box(m["accent"], (0.03, y1 - y0, 0.025), at=(x, cy, 0.03))
    return h


def nameplate(G, m, at, size=(0.3, 0.1), facing="-y"):
    rot = {"-y": (90, 0, 0), "+y": (90, 0, 180), "-x": (90, 0, -90), "+x": (90, 0, 90)}[facing]
    G.plane(m["stainless"], size, at=at, rot=rot)


# ----------------------------------------------------------------------------- piping
def flange(G, mat, at, axis, d, bolts=8):
    """Pipe flange pair centred at `at` on a pipe of outer diameter d."""
    r = d * 0.5
    G.cyl(mat, r * 1.75, max(0.035, d * 0.16), at=at, axis=axis, seg=20)
    bm = M("bolt", "#8a9096", rough=0.4, metal=0.8)
    for i in range(bolts):
        a = 2 * math.pi * i / bolts
        c, s_ = math.cos(a) * r * 1.42, math.sin(a) * r * 1.42
        p = {"x": (at[0], at[1] + c, at[2] + s_), "y": (at[0] + c, at[1], at[2] + s_), "z": (at[0] + c, at[1] + s_, at[2])}[axis]
        G.cyl(bm, max(0.012, d * 0.05), max(0.06, d * 0.3), at=p, axis=axis, seg=6)


def pipe(G, mat, pts, d, flanges=(), seg=14, bend=None):
    """Pipe through pts; `flanges` is a list of (point, axis)."""
    G.tube(mat, pts, d / 2, seg=seg, bend=bend if bend is not None else d * 0.9)
    for p, axis in flanges:
        flange(G, mat, p, axis, d)


def handwheel(G, m, at, axis, r):
    a = AX[axis]
    prof = [(r - 0.012, -0.012), (r + 0.012, -0.012), (r + 0.012, 0.012), (r - 0.012, 0.012), (r - 0.012, -0.012)]
    G.lathe(m["paint_red"], prof, at=at, seg=18, axis=axis)
    for i in range(3):
        ang = i * 60
        rot = {"z": (0, 0, ang), "x": (ang, 0, 0), "y": (0, ang, 0)}[axis]
        size = {"z": (2 * r, 0.02, 0.014), "x": (0.014, 2 * r, 0.02), "y": (2 * r, 0.014, 0.02)}[axis]
        G.box(m["paint_red"], size, at=at, rot=rot)


def gate_valve(G, m, mat, at, axis, d):
    """Flanged gate valve in a line running along `axis` (x or y); handwheel on top."""
    r = d / 2
    L = d * 1.6
    for sgn in (-1, 1):
        flange(G, mat, _off(at, axis, sgn * L / 2), axis, d)
    G.cyl(mat, r * 1.15, L, at=at, axis=axis, seg=16)
    G.box(mat, (d * 0.9, d * 0.9, d * 1.2), at=(at[0], at[1], at[2] + d * 0.7), bevel=d * 0.08)
    G.cyl(m["stainless"], d * 0.09, d * 1.3, at=(at[0], at[1], at[2] + d * 1.9), seg=8)
    handwheel(G, m, (at[0], at[1], at[2] + d * 2.5), "z", d * 0.75)


def butterfly_valve(G, m, mat, at, axis, d):
    r = d / 2
    G.cyl(mat, r * 1.7, d * 0.35, at=at, axis=axis, seg=18)
    G.cyl(m["stainless"], d * 0.1, d * 0.9, at=(at[0], at[1], at[2] + r * 1.7 + d * 0.3), seg=8)
    G.box(m["paint_dark"], (d * 0.5, d * 0.5, d * 0.4), at=(at[0], at[1], at[2] + r * 1.7 + d * 0.85), bevel=0.01)
    lever = {"x": (0.02, d * 1.6, 0.03), "y": (d * 1.6, 0.02, 0.03)}[axis]
    G.box(m["paint_red"], lever, at=(at[0] + (0 if axis == "x" else d * 0.5), at[1] + (d * 0.5 if axis == "x" else 0), at[2] + r * 1.7 + d * 1.1))


def gauge(G, m, at, facing="-y", r=0.07, stem=0.12):
    G.cyl(m["brass"], 0.012, stem, at=(at[0], at[1], at[2] - stem / 2), seg=6)
    ax = "y" if facing in ("-y", "+y") else "x"
    G.cyl(m["stainless"], r, 0.04, at=(at[0], at[1], at[2] + r), axis=ax, seg=18)
    sgn = -1 if facing.startswith("-") else 1
    face = (at[0] + (sgn * 0.022 if ax == "x" else 0), at[1] + (sgn * 0.022 if ax == "y" else 0), at[2] + r)
    G.cyl(m["white"], r * 0.86, 0.004, at=face, axis=ax, seg=18)
    G.box(m["paint_red"], (0.006, 0.006, r * 0.7) if ax == "y" else (0.006, 0.006, r * 0.7), at=(face[0] + (sgn * 0.004 if ax == "x" else 0), face[1] + (sgn * 0.004 if ax == "y" else 0), face[2] + r * 0.2), rot=(0, 35, 0) if ax == "y" else (35, 0, 0))


def support(G, m, at, h, d):
    """Pipe support from the floor to a pipe centreline at height h."""
    G.box(m["paint_dark"], (0.2, 0.2, 0.012), at=(at[0], at[1], at[2] + 0.006))
    G.box(m["paint_dark"], (0.07, 0.07, h - d / 2), at=(at[0], at[1], at[2] + (h - d / 2) / 2))
    G.box(m["paint_dark"], (d * 1.2, 0.09, 0.02), at=(at[0], at[1], at[2] + h - d / 2))


# ----------------------------------------------------------------------------- rotating machinery
def motor(G, m, at, axis="x", L=0.7, r=0.2, mat=None, feet=True):
    """Induction motor: finned frame, end shields, fan cowl, terminal box. `at` = centre; shaft end towards +axis."""
    mat = mat or m["paint_blue"]
    a = AX[axis]
    G.cyl(mat, r, L, at=at, axis=axis, seg=24)
    nf = 18
    for i in range(nf):
        ang = 360.0 * i / nf
        rot = (ang, 0, 0) if axis == "x" else (0, ang, 0)
        size = (L * 0.78, 0.012, r * 2.24) if axis == "x" else (0.012, L * 0.78, r * 2.24)
        if axis == "y":
            rot = (0, ang, 0)
        G.box(mat, size, at=at, rot=rot)
    G.cyl(mat, r * 1.06, L * 0.1, at=_off(at, axis, L * 0.47), axis=axis, seg=24)
    G.cyl(m["paint_dark"], r * 1.1, L * 0.24, at=_off(at, axis, -L * 0.6), axis=axis, seg=24)
    G.cyl(m["stainless"], r * 0.2, L * 0.3, at=_off(at, axis, L * 0.66), axis=axis, seg=12)
    G.box(mat, (L * 0.36, r * 0.9, r * 0.5) if axis == "x" else (r * 0.9, L * 0.36, r * 0.5), at=(at[0], at[1], at[2] + r * 1.15), bevel=0.012)
    if feet:
        for sgn in (-1, 1):
            p = _off(at, axis, sgn * L * 0.3)
            size = (0.08, r * 2.3, 0.04) if axis == "x" else (r * 2.3, 0.08, 0.04)
            G.box(mat, size, at=(p[0], p[1], at[2] - r - 0.0))
    return L


def coupling_guard(G, m, at, axis, L, r):
    G.cyl(m["paint_yellow"], r, L, at=at, axis=axis, seg=18)


def pump(G, m, at, axis="x", size=1.0, mat=None, motor_mat=None):
    """End-suction centrifugal pump set on a baseplate. `at` = floor point under the pump casing;
    suction faces +axis, the motor is on the -axis side, discharge points up. Returns key points."""
    mat = mat or m["paint_green"]
    s = size
    cz = at[2] + 0.42 * s
    c = (at[0], at[1], cz)
    # baseplate
    bl = 2.0 * s
    bc = _off(at, axis, -0.72 * s)
    G.box(m["paint_dark"], (bl, 0.62 * s, 0.1 * s) if axis == "x" else (0.62 * s, bl, 0.1 * s), at=(bc[0], bc[1], at[2] + 0.05 * s), bevel=0.01)
    # volute
    prof = [(0.0, -0.11 * s), (0.2 * s, -0.11 * s), (0.3 * s, -0.07 * s), (0.33 * s, 0), (0.3 * s, 0.07 * s), (0.2 * s, 0.11 * s), (0.0, 0.11 * s)]
    G.lathe(mat, prof, at=c, seg=24, axis=axis)
    # suction nozzle + flange
    G.cyl(mat, 0.1 * s, 0.26 * s, at=_off(c, axis, 0.22 * s), axis=axis, seg=16)
    flange(G, mat, _off(c, axis, 0.36 * s), axis, 0.2 * s)
    # discharge up
    G.cyl(mat, 0.08 * s, 0.34 * s, at=(c[0], c[1], cz + 0.36 * s), seg=16)
    flange(G, mat, (c[0], c[1], cz + 0.54 * s), "z", 0.16 * s)
    # bearing housing, coupling, motor
    G.cyl(mat, 0.11 * s, 0.4 * s, at=_off(c, axis, -0.3 * s), axis=axis, seg=16)
    G.box(mat, (0.12 * s, 0.24 * s, 0.3 * s) if axis == "x" else (0.24 * s, 0.12 * s, 0.3 * s), at=(_off(c, axis, -0.32 * s)[0], _off(c, axis, -0.32 * s)[1], at[2] + 0.25 * s))
    coupling_guard(G, m, _off(c, axis, -0.62 * s), axis, 0.24 * s, 0.13 * s)
    mc = _off(c, axis, -1.16 * s)
    motor(G, m, mc, axis=axis, L=0.62 * s, r=0.19 * s, mat=motor_mat or m["paint_blue"])
    G.box(m["paint_dark"], (0.5 * s, 0.4 * s, 0.13 * s) if axis == "x" else (0.4 * s, 0.5 * s, 0.13 * s), at=(mc[0], mc[1], at[2] + 0.165 * s))
    return dict(centre=c, suction=_off(c, axis, 0.36 * s), discharge=(c[0], c[1], cz + 0.54 * s), motor=mc, shaft=_off(c, axis, -0.62 * s))


# ----------------------------------------------------------------------------- enclosures / electrical
def cabinet(G, m, size, at=(0, 0, 0), mat=None, doors=1, plinth=0.1, vents=True, handle=True, facing="-y", lights=(), meter=False, bevel=0.012):
    """Steel enclosure standing on the floor at `at`; front faces `facing` (-y or +y)."""
    mat = mat or m["paint_ral"]
    w, d, h = size
    f = -1 if facing == "-y" else 1
    G.box(m["paint_dark"], (w - 0.04, d - 0.04, plinth), at=(at[0], at[1], at[2] + plinth / 2))
    G.box(mat, (w, d, h - plinth), at=(at[0], at[1], at[2] + plinth + (h - plinth) / 2), bevel=bevel, maxseg=0.9)
    fy = at[1] + f * (d / 2 + 0.006)
    dw = w / doors
    for i in range(doors):
        cx = at[0] - w / 2 + dw * (i + 0.5)
        G.box(mat, (dw - 0.03, 0.012, h - plinth - 0.06), at=(cx, fy, at[2] + plinth + (h - plinth) / 2), bevel=0.004)
        if handle:
            hx = cx + (dw / 2 - 0.07) * (1 if i % 2 == 0 else -1)
            G.box(m["plastic_dark"], (0.03, 0.03, 0.16), at=(hx, fy + f * 0.02, at[2] + plinth + (h - plinth) * 0.5), bevel=0.005)
        if vents:
            for k in range(4):
                G.box(m["paint_dark"], (dw * 0.4, 0.006, 0.012), at=(cx, fy + f * 0.006, at[2] + plinth + 0.14 + k * 0.035))
    for i, (lx, lz, lm_) in enumerate(lights):
        G.cyl(m[lm_], 0.022, 0.02, at=(at[0] + lx, fy + f * 0.012, at[2] + lz), axis="y", seg=10)
    if meter:
        G.box(m["plastic_dark"], (0.16, 0.012, 0.16), at=(at[0], fy + f * 0.008, at[2] + h * 0.78), bevel=0.004)
        G.plane(m["screen"], (0.12, 0.09), at=(at[0], fy + f * 0.016, at[2] + h * 0.79), rot=(90, 0, 0 if f < 0 else 180), uvfit=True)
    return dict(front_y=fy, top=at[2] + h)


def breaker(G, m, at, w=0.07, h=0.09, color=None):
    G.box(color or m["plastic_dark"], (w, 0.07, h), at=at, bevel=0.004)
    G.box(m["white"], (w * 0.35, 0.02, h * 0.3), at=(at[0], at[1] - 0.04, at[2]))


def cable_tray(G, m, pts, w=0.4, rung=0.3):
    """Ladder tray along a polyline (horizontal runs)."""
    for a, b in zip(pts[:-1], pts[1:]):
        A, Bv = Vector(a), Vector(b)
        d = Bv - A
        L = d.length
        if L < 1e-4:
            continue
        ang = math.degrees(math.atan2(d.y, d.x))
        mid = (A + Bv) / 2
        with G.at(tuple(mid), rz=ang):
            for sy in (-1, 1):
                G.box(m["galv"], (L, 0.02, 0.08), at=(0, sy * w / 2, 0))
            n = max(1, int(L / rung))
            for i in range(n + 1):
                G.box(m["galv"], (0.03, w, 0.02), at=(-L / 2 + i * L / n, 0, -0.03))


def cables(G, mats, pts, n=3, r=0.02, spread=0.06, axis="y"):
    """A bundle of parallel cables following pts, offset sideways along `axis`."""
    for i in range(n):
        o = (i - (n - 1) / 2) * spread
        p2 = [(p[0] + (o if axis == "x" else 0), p[1] + (o if axis == "y" else 0), p[2]) for p in pts]
        G.tube(mats[i % len(mats)], p2, r, seg=8, bend=r * 4)


# ----------------------------------------------------------------------------- vessels / structure
def vessel(G, mat, at, r, L, axis="z", head=0.35):
    """Pressure vessel / tank with dished heads; `at` = centre."""
    hl = r * head
    prof = [(0.0, -L / 2 - hl)]
    for i in range(1, 7):
        a = math.pi / 2 * i / 6
        prof.append((r * math.sin(a), -L / 2 - hl * math.cos(a)))
    for i in range(6, -1, -1):
        a = math.pi / 2 * i / 6
        prof.append((r * math.sin(a), L / 2 + hl * math.cos(a)))
    G.lathe(mat, prof, at=at, seg=28, axis=axis)


def nozzle(G, mat, at, axis, d, L):
    G.cyl(mat, d / 2, L, at=_off(at, axis, L / 2), axis=axis, seg=14)
    flange(G, mat, _off(at, axis, L), axis, d, bolts=6)


def saddle(G, m, at, r, w=0.2):
    G.box(m["paint_dark"], (w, r * 1.5, r * 0.75), at=(at[0], at[1], at[2] + r * 0.375))
    G.box(m["paint_dark"], (w + 0.1, r * 1.7, 0.02), at=(at[0], at[1], at[2] + 0.01))


def skid(G, mat, L, W, at=(0, 0, 0), h=0.2, cross=3):
    """I-beam base frame; `at` = centre on the floor."""
    for sy in (-1, 1):
        G.ibeam(mat, L, h=h, w=h * 0.6, at=(at[0], at[1] + sy * (W / 2 - h * 0.3), at[2] + h / 2))
    for i in range(cross + 1):
        x = at[0] - L / 2 + h * 0.3 + i * (L - h * 0.6) / cross
        G.ibeam(mat, W - h * 0.6, h=h, w=h * 0.6, at=(x, at[1], at[2] + h / 2), rot=(0, 0, 90))
    for sx in (-1, 1):
        for sy in (-1, 1):
            G.box(mat, (0.1, 0.02, 0.14), at=(at[0] + sx * (L / 2 - 0.25), at[1] + sy * (W / 2 + 0.01), at[2] + h + 0.05))
    return h


def handrail(G, m, pts, h=1.05, mat=None):
    mat = mat or m["paint_yellow"]
    for a, b in zip(pts[:-1], pts[1:]):
        G.tube(mat, [(a[0], a[1], a[2] + h), (b[0], b[1], b[2] + h)], 0.021, seg=8)
        G.tube(mat, [(a[0], a[1], a[2] + h * 0.52), (b[0], b[1], b[2] + h * 0.52)], 0.016, seg=6)
    for p in pts:
        G.cyl(mat, 0.021, h, at=(p[0], p[1], p[2] + h / 2), seg=8)


def duct(G, m, pts, w=0.6, h=0.4, mat=None, joint=1.2):
    """Rectangular duct along an axis-aligned polyline with flange joints."""
    mat = mat or m["galv"]
    for a, b in zip(pts[:-1], pts[1:]):
        A, Bv = Vector(a), Vector(b)
        d = Bv - A
        L = d.length
        mid = (A + Bv) / 2
        if abs(d.z) > max(abs(d.x), abs(d.y)):
            G.box(mat, (w, h, L + h * 0.0), at=tuple(mid))
            n = max(1, int(L / joint))
            for i in range(n + 1):
                G.box(mat, (w + 0.05, h + 0.05, 0.03), at=(mid.x, mid.y, A.z + (Bv.z - A.z) * i / n))
        else:
            ang = math.degrees(math.atan2(d.y, d.x))
            with G.at(tuple(mid), rz=ang):
                G.box(mat, (L, w, h), at=(0, 0, 0))
                n = max(1, int(L / joint))
                for i in range(n + 1):
                    G.box(mat, (0.03, w + 0.05, h + 0.05), at=(-L / 2 + i * L / n, 0, 0))


def rack(G, m, at, h=2.1, w=0.6, d=1.0, seed=0, facing="-y"):
    """Server rack with perforated-door look and status LEDs."""
    rnd = random.Random(seed)
    f = -1 if facing == "-y" else 1
    G.box(m["paint_dark"], (w, d, h), at=(at[0], at[1], at[2] + h / 2), bevel=0.01)
    fy = at[1] + f * (d / 2 + 0.004)
    G.box(m["plastic_dark"], (w - 0.06, 0.01, h - 0.12), at=(at[0], fy, at[2] + h / 2))
    u = 0.085
    n = int((h - 0.3) / u)
    for i in range(n):
        z = at[2] + 0.18 + i * u
        if rnd.random() < 0.72:
            G.box(m["castiron"], (w - 0.12, 0.012, u * 0.78), at=(at[0], fy + f * 0.006, z))
            for k in range(rnd.randint(1, 4)):
                lm_ = "led_green" if rnd.random() < 0.8 else ("led_amber" if rnd.random() < 0.6 else "accent")
                G.box(m[lm_], (0.012, 0.006, 0.012), at=(at[0] - w / 2 + 0.1 + k * 0.035, fy + f * 0.014, z))
    G.box(m["accent"], (0.012, 0.008, h - 0.16), at=(at[0] + w / 2 - 0.025, fy + f * 0.008, at[2] + h / 2))


def monitor(G, m, at, size=(1.2, 0.7), name="screen", facing="-y", stand=True, tilt=0):
    """Flat display whose image is drawn by the engine (group name `scr_<name>`)."""
    w, h = size
    f = -1 if facing == "-y" else 1
    G.box(m["plastic_dark"], (w + 0.04, 0.05, h + 0.04), at=at, bevel=0.008, rot=(tilt, 0, 0))
    with G.group(f"scr_{name}", bake="none", screen=name):
        G.plane(m["screen"], (w, h), at=(at[0], at[1] + f * 0.028, at[2]), rot=(90 + tilt * f * -1, 0, 0 if f < 0 else 180), uvfit=True)
    if stand:
        G.box(m["plastic_dark"], (0.08, 0.06, at[2] - h / 2), at=(at[0], at[1] + 0.04, (at[2] - h / 2) / 2))
        G.box(m["plastic_dark"], (0.5, 0.3, 0.02), at=(at[0], at[1] + 0.04, 0.01))


def person_marker(G, id, pos, look):
    """Convenience: guide stand on the visitor side of a component."""
    G.stand(id, pos, look)
