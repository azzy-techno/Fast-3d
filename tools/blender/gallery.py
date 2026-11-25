"""Gallery floor plate shared by levels 01-08, in floor-local coordinates (z = 0 is the finished floor).

The visitor steps out of the lift on the core wall (y = GY1) and looks across the exhibit platform to the
glazed facade and the city beyond.
"""
from fastlib import M, set_world_hdri, add_area
from building import W, MOD, LIFT_X, LIFT_B_X, LOBBY_BACK, lift_portal
import kit

GX0, GX1 = -W / 2 + 0.6, W / 2 - 0.6     # inside faces of the end glazing
GY0, GY1 = 0.35, LOBBY_BACK              # front glazing .. core wall
GH = 6.0                                 # floor to soffit
# exhibit platform footprint shared by every service floor
PX0, PX1, PY0, PY1 = -5.0, 15.0, 2.6, 10.2
ROWS = (3.3, 7.0, 10.6)                  # pendant light rows


def gallery(G, m, lm="lm_floor"):
    cx, cy = 0.0, (GY0 + GY1) / 2
    with G.group("shell", bake="lm", lm=lm, env="floor", shell=1):
        G.box(m["floor_conc"], (GX1 - GX0 + 0.6, GY1 - GY0 + 0.3, 0.2), at=(cx, cy - 0.15, -0.1))
        G.box(m["ceiling"], (GX1 - GX0 + 0.6, GY1 - GY0 + 0.3, 0.2), at=(cx, cy - 0.15, GH + 0.1))
        # core wall built around the two lift openings: light stone by the lifts, dark feature wall beyond
        lw, lh = 1.4, 2.5
        edges = [GX0 - 0.3, LIFT_B_X - lw / 2, LIFT_B_X + lw / 2, LIFT_X - lw / 2, LIFT_X + lw / 2, -0.6]
        for a_, b_ in ((edges[0], edges[1]), (edges[2], edges[3]), (edges[4], edges[5])):
            G.box(m["stone_wall"], (b_ - a_, 0.3, GH), at=((a_ + b_) / 2, GY1 + 0.15, GH / 2))
        for lx in (LIFT_B_X, LIFT_X):
            G.box(m["stone_wall"], (lw, 0.3, GH - lh), at=(lx, GY1 + 0.15, lh + (GH - lh) / 2))
        G.box(m["wall_dark"], (GX1 + 0.3 + 0.6, 0.3, GH), at=((GX1 + 0.3 - 0.6) / 2, GY1 + 0.15, GH / 2))
        # sill and head of the glazing on three sides
        for z, hh in ((0.15, 0.3), (GH - 0.25, 0.5)):
            G.box(m["wall_dark"], (GX1 - GX0 + 0.6, 0.25, hh), at=(cx, GY0 - 0.1, z))
            for sx in (-1, 1):
                G.box(m["wall_dark"], (0.25, GY1 - GY0, hh), at=(sx * (GX1 + 0.1), cy, z))
        for x in (-16, -8, 0, 8, 16):
            G.cyl(m["concrete"], 0.38, GH, at=(x, GY0 + 1.0, GH / 2), seg=20)

    with G.group("glazing", bake="none", shell=1, env="floor"):
        x = GX0 + 0.4
        while x < GX1:
            for zc, hh in ((1.6, 2.56), (4.2, 2.56)):
                G.plane(m["glass_clear"], (MOD - 0.06, hh), at=(x + MOD / 2 - 0.4, GY0, zc), rot=(-90, 0, 0))
            x += MOD
        for sx in (-1, 1):
            y = GY0 + 1.0
            while y < GY1 - 0.5:
                for zc, hh in ((1.6, 2.56), (4.2, 2.56)):
                    G.plane(m["glass_clear"], (MOD - 0.06, hh), at=(sx * GX1, y, zc), rot=(0, -90 * sx, 0))
                y += MOD

    with G.group("fit", bake="vc", shell=1, env="floor"):
        x = GX0 - 0.6
        while x <= GX1 + 0.6:
            G.box(m["darkmetal"], (0.07, 0.16, GH - 0.8), at=(x, GY0, GH / 2 - 0.1))
            x += MOD
        G.box(m["darkmetal"], (GX1 - GX0 + 0.6, 0.12, 0.06), at=(cx, GY0, 2.9))
        for sx in (-1, 1):
            y = GY0
            while y < GY1:
                G.box(m["darkmetal"], (0.16, 0.07, GH - 0.8), at=(sx * GX1, y, GH / 2 - 0.1))
                y += MOD
            G.box(m["darkmetal"], (0.12, GY1 - GY0, 0.06), at=(sx * GX1, cy, 2.9))
        # exposed building services: supply ducts, cable ladder, sprinkler main
        for dy in (4.2, 11.6):
            G.cyl(m["steel"], 0.3, GX1 - GX0 - 2, at=(cx, dy, 5.35), axis="x", seg=18)
            x = GX0 + 2
            while x < GX1 - 1:
                G.cyl(m["darkmetal"], 0.315, 0.05, at=(x, dy, 5.35), axis="x", seg=18)
                G.box(m["darkmetal"], (0.02, 0.02, 0.35), at=(x, dy, 5.83))
                x += 3.0
        sp = M("sprinkler_red", "#b3261e", rough=0.45, metal=0.3)
        G.cyl(sp, 0.05, GX1 - GX0 - 1, at=(cx, 7.4, 5.6), axis="x", seg=10)
        x = GX0 + 2.5
        while x < GX1 - 1:
            G.cyl(sp, 0.02, 0.3, at=(x, 7.4, 5.42), seg=6)
            G.cyl(m["chrome"], 0.035, 0.03, at=(x, 7.4, 5.26), seg=8)
            x += 3.2
        for a_ in range(-18, 19, 4):
            G.box(m["steel"], (0.02, 0.36, 0.07), at=(a_, 12.9, 5.1))
        G.box(m["steel"], (GX1 - GX0 - 2, 0.02, 0.07), at=(cx, 12.72, 5.1))
        G.box(m["steel"], (GX1 - GX0 - 2, 0.02, 0.07), at=(cx, 13.08, 5.1))
        # pendant light housings and the spot track over the visitor aisle
        for row_y in ROWS:
            x = GX0 + 2.4
            while x < GX1 - 1.2:
                G.box(m["darkmetal"], (2.4, 0.09, 0.07), at=(x, row_y, 4.55))
                for sx in (-1, 1):
                    G.box(m["darkmetal"], (0.008, 0.008, GH - 4.58), at=(x + sx * 1.0, row_y, (GH + 4.58) / 2))
                x += 3.6
        G.box(m["darkmetal"], (PX1 - PX0 + 2, 0.05, 0.04), at=((PX0 + PX1) / 2, 11.9, 5.0))
        x = PX0
        while x <= PX1 + 0.1:
            G.cyl(m["darkmetal"], 0.07, 0.22, at=(x, 11.9, 4.86), rot=(-35, 0, 0), seg=10)
            x += 2.5
        # photo frames on the core wall beside the lift
        for fx in (-5.6, -3.7, -1.8):
            G.box(m["darkmetal"], (1.6, 0.05, 1.22), at=(fx, GY1 - 0.03, 1.8), bevel=0.008)
        with G.at((-13.5, 2.6, 0)):
            kit.bench(G, m, 2.6)
        with G.at((-17.3, 12.6, 0)):
            kit.blade_plant(G, m, 1.4, 5)
        lift_portal(G, m, LIFT_X, GY1, open_cabin=True, prefix="lift")
        lift_portal(G, m, LIFT_B_X, GY1, open_cabin=False, prefix="liftB")
        G.box(m["steel"], (0.16, 0.03, 0.4), at=((LIFT_X + LIFT_B_X) / 2, GY1 - 0.02, 1.2), bevel=0.005)

    with G.group("lights", bake="none", shell=1):
        for row_y in ROWS:
            x = GX0 + 2.4
            while x < GX1 - 1.2:
                G.box(m["light_cool"], (2.34, 0.07, 0.012), at=(x, row_y, 4.51))
                x += 3.6
        x = PX0
        while x <= PX1 + 0.1:
            G.cyl(m["light_warm"], 0.05, 0.01, at=(x, 11.835, 4.765), rot=(-35, 0, 0), seg=10)
            x += 2.5
        G.box(m["accent"], (12.0, 0.03, 0.04), at=(8.4, GY1 - 0.03, 0.95))

    with G.group("signs", bake="none", shell=1):
        G.plane(M("sign_floor", "#ffffff", emit=1.2, kind="sign", sign="floor"), (12.0, 4.0), at=(8.4, GY1 - 0.02, 3.1), rot=(90, 0, 0), uvfit=True)
        for i, fx in enumerate((-5.6, -3.7, -1.8)):
            G.plane(M(f"sign_photo{i}", "#cccccc", emit=1.0, kind="sign", sign=f"photo{i}"), (1.5, 1.12), at=(fx, GY1 - 0.062, 1.8), rot=(90, 0, 0), uvfit=True)

    # camera shots / stands shared by all floors (each exhibit adds its overview and stations)
    G.shot("arrive", (LIFT_X + 0.4, 12.9, 1.66), (2.5, 6.4, 1.5), fov=56)
    G.shot("lift", (-4.3, 10.6, 1.66), (-5.4, 14.0, 1.75), fov=52)
    G.stand("arrive", (LIFT_X + 2.6, 11.6, 0), (LIFT_X + 0.4, 12.9, 1.6))
    G.stand("lift", (-2.2, 12.5, 0), (-4.3, 10.6, 1.6))
    G.hotspot("lift", (LIFT_X, GY1 - 0.1, 2.9))


def gallery_lighting(sky_rot, hdri_path):
    """Lights used when baking / previewing a gallery floor and its exhibit."""
    set_world_hdri(hdri_path, strength=1.0, rot_z=sky_rot)
    for row_y in ROWS:
        add_area((0, row_y, 4.45), (36.0, 0.3), 1500, color=(0.95, 0.97, 1.0), rot=(0, 0, 0))
    x = PX0
    while x <= PX1 + 0.1:
        add_area((x, 11.8, 4.8), 0.5, 300, color=(1.0, 0.9, 0.78), target=(x, 6.0, 0.9), shape="DISK")
        x += 2.5
    add_area((LIFT_X, 15.3, 2.6), 1.4, 60, color=(1.0, 0.9, 0.75), rot=(0, 0, 0))
