"""Shared materials and street / architectural props for the FAST Tower scenes."""
import math, random
from mathutils import Vector
from fastlib import M, Geo

# ----------------------------------------------------------------------------- palette
def mats():
    """All shared materials. Call once per scene script after reset_scene()."""
    m = {}
    # exterior ground
    m["asphalt"] = M("asphalt", "#3a3c40", rough=0.92, tex="asphalt", tile=3.0)
    m["paving"] = M("paving", "#c9bda9", rough=0.8, tex="paving", tile=2.4)
    m["kerb"] = M("kerb", "#aaa69c", rough=0.85, tex="precast", tile=2.0)
    m["paint"] = M("paint", "#e9e6dc", rough=0.7)
    m["paint_y"] = M("paint_y", "#d9a514", rough=0.7)
    m["sand"] = M("sand", "#c8b48f", rough=0.95)
    m["soil"] = M("soil", "#4c4034", rough=0.95)
    # architecture
    m["stone"] = M("stone", "#e2dbcd", rough=0.78, tex="stone", tile=2.4)
    m["stone_dark"] = M("stone_dark", "#5c5850", rough=0.7, tex="stone", tile=2.4)
    m["concrete"] = M("concrete", "#9a9893", rough=0.85, tex="precast", tile=2.5)
    m["white"] = M("white", "#f1eee8", rough=0.6)
    m["darkmetal"] = M("darkmetal", "#1c2026", rough=0.42, metal=0.75)
    m["fin"] = M("fin", "#c9aa7c", rough=0.34, metal=0.85)
    m["steel"] = M("steel", "#a9afb5", rough=0.34, metal=0.65)
    m["chrome"] = M("chrome", "#d6dadd", rough=0.12, metal=1.0)
    m["spandrel"] = M("spandrel", "#0f151b", rough=0.22, metal=0.7)
    m["glass_tower"] = M("glass_tower", "#93a9bb", rough=0.05, metal=1.0, kind="glass", glass="mirror")
    m["glass_lit"] = M("glass_lit", "#a39a8c", rough=0.08, metal=1.0, kind="glass", glass="mirror", emit=0.3, emit_color="#ffc88a", lit=1)
    m["glass_clear"] = M("glass_clear", "#9fb6c4", rough=0.04, kind="glass", glass="clear", alpha=0.22, transmission=1.0)
    m["glass_dark"] = M("glass_dark", "#0b1016", rough=0.08, metal=0.9)
    # interior
    m["floor_stone"] = M("floor_stone", "#d6cfc1", rough=0.22, tex="stone", tile=2.4)
    m["floor_conc"] = M("floor_conc", "#a3a19b", rough=0.32, tex="concrete", tile=4.0)
    m["wall"] = M("wall", "#ebe6dc", rough=0.9)
    m["stone_wall"] = M("stone_wall", "#ddd5c6", rough=0.82)
    m["wall_dark"] = M("wall_dark", "#262a30", rough=0.8)
    m["ceiling"] = M("ceiling", "#17191d", rough=0.9)
    m["wood"] = M("wood", "#8f6a48", rough=0.55, tex="wood", tile=1.2)
    m["wood_dark"] = M("wood_dark", "#4c3626", rough=0.5, tex="wood", tile=1.2)
    m["fabric"] = M("fabric", "#33475c", rough=0.95)
    m["leather"] = M("leather", "#6a4a34", rough=0.6)
    m["rubber"] = M("rubber", "#15161a", rough=0.9)
    m["plastic_dark"] = M("plastic_dark", "#24272c", rough=0.55)
    # light
    m["light_warm"] = M("light_warm", "#ffd9a8", emit=22.0, kind="emit")
    m["light_soft"] = M("light_soft", "#ffe6c4", emit=6.0, kind="emit")
    m["light_cool"] = M("light_cool", "#eaf2ff", emit=18.0, kind="emit")
    m["led_blue"] = M("led_blue", "#27a8ee", emit=10.0, kind="emit")
    m["lamp_head"] = M("lamp_head", "#ffe2b0", emit=40.0, kind="emit")
    m["tail"] = M("tail", "#ff2b1c", emit=6.0, kind="emit")
    m["head"] = M("head", "#fff3d6", emit=14.0, kind="emit")
    m["sig_red"] = M("sig_red", "#ff3324", emit=8.0, kind="emit")
    m["sig_green"] = M("sig_green", "#39f08a", emit=8.0, kind="emit")
    # nature
    m["trunk"] = M("trunk", "#7a6650", rough=0.95)
    m["leaf"] = M("leaf", "#4d6b38", rough=0.75, side="double")
    m["leaf_dry"] = M("leaf_dry", "#7d7446", rough=0.85, side="double")
    m["shrub"] = M("shrub", "#3f5a34", rough=0.9)
    m["water"] = M("water", "#27506a", rough=0.05, metal=0.6, kind="water")
    # signs (textured at runtime)
    m["sign_logo"] = M("sign_logo", "#ffffff", emit=3.0, kind="sign", sign="logo")
    m["flag"] = M("flag", "#1f73c4", rough=0.8, side="double")
    return m


# ----------------------------------------------------------------------------- vegetation
def palm(G, m, h=8.0, seed=0, lean=0.0):
    """Date palm, base at the local origin."""
    rnd = random.Random(seed)
    segs = 7
    pts = []
    for i in range(segs + 1):
        t = i / segs
        pts.append((lean * t * t * 1.4, 0, h * t))
    # one continuous trunk (stacked segments bake dark rings where they overlap)
    G.tube(m["trunk"], pts, 0.17, seg=9, bend=0, cap=False)
    G.cyl(m["trunk"], 0.26, 0.5, at=(0, 0, 0.25), seg=9, r2=0.18)
    top = Vector(pts[-1])
    G.sphere(m["trunk"], 0.42, at=(top.x, 0, top.z - 0.15), seg=10, rings=6, scale=(1, 1, 1.25))
    n = 20
    for k in range(n):
        az = 2 * math.pi * k / n + rnd.uniform(-0.18, 0.18)
        droop = rnd.uniform(0.15, 1.0) ** 0.8
        L = rnd.uniform(3.1, 4.0)
        steps = 9
        spine = []
        for s in range(steps + 1):
            t = s / steps
            out = L * (t - 0.12 * droop * t * t)
            up = (1.05 - 0.75 * droop) * L * 0.5 * t - (0.5 + 0.95 * droop) * L * 0.5 * t * t
            spine.append(Vector((math.cos(az) * out, math.sin(az) * out, up)) + top)
        side = Vector((-math.sin(az), math.cos(az), 0))
        mat = m["leaf_dry"] if droop > 0.95 else m["leaf"]
        verts, faces = [], []
        # the rib: a thin strip so the frond reads from underneath as well
        for s in range(steps):
            a, b = spine[s], spine[s + 1]
            base = len(verts)
            w = 0.035 * (1 - s / steps) + 0.012
            verts += [a - side * w, a + side * w, b + side * w, b - side * w]
            faces.append([base, base + 1, base + 2, base + 3])
        # narrow leaflets in pairs along the rib, raked forward and hanging a little
        pairs = 15
        for j in range(pairs):
            t = 0.1 + 0.88 * j / (pairs - 1)
            f = t * steps
            i0 = min(int(f), steps - 1)
            p = spine[i0].lerp(spine[i0 + 1], f - i0)
            fwd = (spine[i0 + 1] - spine[i0]).normalized()
            ll = (0.2 + 0.62 * math.sin(math.pi * min(1.0, t * 1.1 + 0.06))) * rnd.uniform(0.85, 1.1)
            lw = 0.05 + 0.03 * (1 - t)
            for sgn in (-1, 1):
                d = (side * sgn * 0.82 + fwd * 0.5 + Vector((0, 0, -0.3 - 0.25 * droop))).normalized()
                tip = p + d * ll
                base = len(verts)
                verts += [p - fwd * lw, p + fwd * lw, tip]
                faces.append([base, base + 1, base + 2])
        G.add_raw(mat, [tuple(v) for v in verts], faces)


def shrub(G, m, r=0.5, seed=0):
    """Clipped hedge ball / block, as planted along Gulf boulevards."""
    rnd = random.Random(seed)
    h = r * rnd.uniform(1.25, 1.6)
    G.box(m["shrub"], (r * 2.1, r * 2.0, h), at=(0, 0, h / 2), bevel=r * 0.42)


def hedge(G, m, L, w=0.8, h=0.7):
    G.box(m["shrub"], (L, w, h), at=(0, 0, h / 2), bevel=min(w, h) * 0.3, maxseg=1.6)


def blade_plant(G, m, h=1.5, seed=0, n=13):
    """Upright blade plant (sansevieria) in a planter: reads as a real lobby plant, not a green blob."""
    rnd = random.Random(seed)
    G.cyl(m["white"], 0.3, 0.62, base=True, seg=16, r2=0.36)
    G.cyl(m["soil"], 0.33, 0.02, at=(0, 0, 0.6), seg=16)
    for i in range(n):
        a = rnd.uniform(0, 6.283)
        r0 = rnd.uniform(0.0, 0.2)
        hh = h * rnd.uniform(0.55, 1.0)
        lean = rnd.uniform(0.04, 0.22)
        w = rnd.uniform(0.05, 0.085)
        bx, by = math.cos(a) * r0, math.sin(a) * r0
        dx, dy = math.cos(a), math.sin(a)
        px, py = -dy, dx
        steps = 4
        verts, faces = [], []
        for k in range(steps + 1):
            t = k / steps
            cx = bx + dx * lean * hh * t * t
            cy = by + dy * lean * hh * t * t
            cz = 0.6 + hh * t
            ww = w * (1 - t ** 2.2) + 0.004
            verts += [(cx - px * ww, cy - py * ww, cz), (cx + px * ww, cy + py * ww, cz)]
        for k in range(steps):
            faces.append([k * 2, k * 2 + 1, k * 2 + 3, k * 2 + 2])
        G.add_raw(m["leaf"], verts, faces)


def planter(G, m, size=(2.4, 2.4, 0.55), plant="palm", seed=0, h=7.0):
    sx, sy, sz = size
    G.box(m["stone"], (sx, sy, sz), base=True, bevel=0.03)
    G.box(m["soil"], (sx - 0.24, sy - 0.24, 0.04), at=(0, 0, sz - 0.02))
    if plant == "palm":
        with G.at((0, 0, sz - 0.05)):
            palm(G, m, h=h, seed=seed)
    else:
        with G.at((0, 0, sz - 0.08)):
            hedge(G, m, sx - 0.3, sy - 0.3, 0.62)


# ----------------------------------------------------------------------------- street furniture
def lamp_post(G, m, h=9.0, arms=1, glow=True):
    G.cyl(m["darkmetal"], 0.16, 0.5, base=True, seg=10)
    G.cyl(m["darkmetal"], 0.09, h, base=True, seg=8, r2=0.06)
    for i in range(arms):
        sgn = 1 if i == 0 else -1
        G.box(m["darkmetal"], (2.2, 0.09, 0.09), at=(sgn * 1.05, 0, h - 0.08))
        G.box(m["darkmetal"], (0.95, 0.34, 0.11), at=(sgn * 1.95, 0, h - 0.02), bevel=0.02)
        G.box(m["lamp_head"], (0.8, 0.26, 0.03), at=(sgn * 1.95, 0, h - 0.09))
        if glow:
            G.marker("glow", f"lamp{len(G.markers)}", (sgn * 1.95, 0, h - 0.14), color="#ffd9a0", size=2.6)


def bollard(G, m):
    G.cyl(m["steel"], 0.085, 0.95, base=True, seg=10)
    G.cyl(m["led_blue"], 0.088, 0.03, at=(0, 0, 0.84), seg=10)


def bench(G, m, L=2.2):
    G.box(m["stone"], (0.34, 0.5, 0.42), at=(-L / 2 + 0.25, 0, 0.21), bevel=0.015)
    G.box(m["stone"], (0.34, 0.5, 0.42), at=(L / 2 - 0.25, 0, 0.21), bevel=0.015)
    for i in range(5):
        G.box(m["wood"], (L, 0.085, 0.045), at=(0, -0.21 + i * 0.105, 0.445), bevel=0.008)


def bin_(G, m):
    G.cyl(m["darkmetal"], 0.24, 0.85, base=True, seg=12)
    G.cyl(m["steel"], 0.255, 0.05, at=(0, 0, 0.86), seg=12)


def traffic_light(G, m, h=5.6, arm=4.2):
    G.cyl(m["darkmetal"], 0.1, h, base=True, seg=8)
    G.box(m["darkmetal"], (arm, 0.09, 0.09), at=(arm / 2, 0, h - 0.1))
    for px in (arm - 0.2, 0.0):
        z = h - 0.75 if px > 0 else 3.0
        G.box(m["plastic_dark"], (0.34, 0.26, 1.0), at=(px, -0.02, z), bevel=0.03)
        G.cyl(m["sig_red"], 0.1, 0.03, at=(px, -0.16, z + 0.3), axis="y", seg=10)
        G.cyl(m["plastic_dark"], 0.1, 0.03, at=(px, -0.16, z), axis="y", seg=10)
        G.cyl(m["plastic_dark"], 0.1, 0.03, at=(px, -0.16, z - 0.3), axis="y", seg=10)


def flagpole(G, m, h=9.0, phase=0.0):
    G.cyl(m["steel"], 0.07, h, base=True, seg=8, r2=0.045)
    G.sphere(m["chrome"], 0.08, at=(0, 0, h + 0.05), seg=8, rings=5)
    with G.group(f"flag{len(G.groups)}", bake="none", pivot=(0, 0, h - 1.0), phase=phase, flag=1):
        G.plane(m["flag"], (2.4, 1.5), at=(1.25, 0, h - 1.0), rot=(90, 0, 0), sub=(12, 4), uvfit=True)


# ----------------------------------------------------------------------------- vehicles
CAR_STYLES = {
    # L, W: size; clear: ground clearance; belt: beltline height; cab: cabin height above the belt;
    # fractions measured from the rear: rb/rr = rear window base/top, ff/fb = windscreen top/base
    "sedan": dict(L=4.75, W=1.84, clear=0.17, belt=0.93, cab=0.5, rb=0.13, rr=0.27, ff=0.57, fb=0.71, wr=0.33),
    "suv": dict(L=4.9, W=1.96, clear=0.23, belt=1.08, cab=0.62, rb=0.02, rr=0.07, ff=0.6, fb=0.74, wr=0.38),
    "pickup": dict(L=5.35, W=1.96, clear=0.26, belt=1.1, cab=0.62, rb=0.4, rr=0.43, ff=0.64, fb=0.77, wr=0.39),
    "van": dict(L=5.3, W=2.0, clear=0.2, belt=1.2, cab=0.85, rb=0.01, rr=0.03, ff=0.8, fb=0.9, wr=0.36),
}


def car(G, m, style="sedan", paint=None, lights=True):
    """Car centred on the local origin, wheels on z=0, nose towards +X."""
    s = CAR_STYLES[style]
    L, W, clear, belt, cabh, wr = s["L"], s["W"], s["clear"], s["belt"], s["cab"], s["wr"]
    paint = paint or M("carpaint_silver", "#b9bec4", rough=0.3, metal=0.6)
    rim = M("rim", "#8f949b", rough=0.3, metal=0.75)
    trim = m["plastic_dark"]
    x0, x1 = -L / 2, L / 2
    xw = x0 + s["fb"] * L          # windscreen base
    xr = x0 + s["rb"] * L          # rear window base
    # body shell: side profile extruded across the width
    prof = [(x0 + 0.12, clear), (x1 - 0.14, clear), (x1, clear + 0.14), (x1, clear + 0.44), (x1 - 0.16, belt - 0.13),
            (xw, belt), (xr, belt + 0.01), (x0 + 0.04, belt - 0.07), (x0, clear + 0.42), (x0, clear + 0.14)]
    with G.at((0, W / 2, 0), rx=90):
        G.extrude(paint, prof, W, bevel=0.06)
    # glass house, narrower than the body (tumblehome)
    cab = [(xr, belt - 0.02), (x0 + s["rr"] * L, belt + cabh), (x0 + s["ff"] * L, belt + cabh), (xw, belt - 0.02)]
    cw = W * 0.84
    with G.at((0, cw / 2, 0), rx=90):
        G.extrude(m["glass_dark"], cab, cw, bevel=0.05)
    rx0, rx1 = cab[1][0], cab[2][0]
    G.box(paint, (rx1 - rx0 + 0.06, cw - 0.04, 0.05), at=((rx0 + rx1) / 2, 0, belt + cabh + 0.005), bevel=0.02)
    # pillars
    for px in (rx0 + 0.02, (rx0 + rx1) / 2, rx1 - 0.02):
        for sy in (-1, 1):
            G.box(paint, (0.07, 0.03, cabh - 0.02), at=(px, sy * (cw / 2 + 0.002), belt + cabh / 2))
    if style == "pickup":
        G.box(trim, (L * 0.34, W * 0.82, 0.04), at=(x0 + L * 0.2, 0, belt - 0.32))
    # sills, bumpers, grille
    for sy in (-1, 1):
        G.box(trim, (L * 0.56, 0.03, 0.1), at=(0, sy * (W / 2 + 0.002), clear + 0.06))
        G.box(trim, (0.16, 0.06, 0.09), at=(xw - 0.12, sy * (W / 2 + 0.07), belt + 0.06), bevel=0.02)
    G.box(trim, (0.05, W * 0.6, 0.2), at=(x1 - 0.015, 0, clear + 0.18), bevel=0.01)
    G.box(trim, (0.05, W * 0.86, 0.1), at=(x0 + 0.015, 0, clear + 0.12), bevel=0.01)
    # wheels with arches
    for fx in (0.185, 0.815):
        cx = x0 + fx * L
        for sy in (-1, 1):
            G.cyl(trim, wr * 1.2, 0.02, at=(cx, sy * (W / 2 + 0.004), wr + 0.03), axis="y", seg=18)
            G.cyl(m["rubber"], wr, 0.25, at=(cx, sy * (W / 2 - 0.11), wr), axis="y", seg=18)
            G.cyl(rim, wr * 0.62, 0.03, at=(cx, sy * (W / 2 + 0.018), wr), axis="y", seg=12)
            G.cyl(trim, wr * 0.2, 0.035, at=(cx, sy * (W / 2 + 0.022), wr), axis="y", seg=8)
    if lights:
        for sy in (-1, 1):
            G.box(m["head"], (0.04, 0.36, 0.1), at=(x1 - 0.045, sy * (W / 2 - 0.3), clear + 0.5), rot=(0, -12, 0))
            G.box(m["tail"], (0.04, 0.38, 0.09), at=(x0 + 0.012, sy * (W / 2 - 0.3), belt - 0.2))
    return s
