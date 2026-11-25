"""FAST Tower: one building used by every scene (street arrival, lobby, gallery floors, roof).

Blender coordinates: the entrance facade is the plane y = 0 facing -Y (the street); +Y goes into the building.
"""
import math, random
from mathutils import Vector
from fastlib import M, Geo, log

W, D = 40.0, 26.0                 # footprint
LOBBY_TOP = 8.6                   # finished floor level of gallery 01
FLOOR_H = 6.4                     # gallery floor-to-floor
NFLOORS = 8
ROOF_Z = LOBBY_TOP + NFLOORS * FLOOR_H     # 59.8
CROWN_Z = ROOF_Z + 4.8
MOD = 2.0                         # curtain wall module


def floor_z(k):
    """Finished floor level of gallery k (1..8); k = 9 is the roof deck."""
    return LOBBY_TOP + (k - 1) * FLOOR_H


FACES = [  # (origin, rz, length, name): local +X runs along the facade, local -Y points outwards
    ((-W / 2, 0, 0), 0, W, "front"),
    ((W / 2, 0, 0), 90, D, "right"),
    ((W / 2, D, 0), 180, W, "back"),
    ((-W / 2, D, 0), 270, D, "left"),
]


def curtain_wall(G, m, length, rnd, fins=True, detail=True, lit=0.1):
    """Glazed shaft from LOBBY_TOP to ROOF_Z in the current local frame."""
    n = int(round(length / MOD))
    H = ROOF_Z - LOBBY_TOP
    for k in range(1, NFLOORS + 1):
        z0 = floor_z(k)
        G.box(m["spandrel"], (length, 0.06, 1.2), at=(length / 2, 0.0, z0 - 0.3))
        for j in range(2):
            # lit offices come in short runs, not confetti
            run_at, run_len = (rnd.randrange(n), rnd.randint(2, 5)) if rnd.random() < lit * 4 else (-99, 0)
            for i in range(n):
                zc = z0 + 0.3 + 1.3 + j * 2.6
                mat = m["glass_lit"] if run_at <= i < run_at + run_len else m["glass_tower"]
                # each pane is tilted a hair, as real unitised panels are: the reflection breaks up per pane
                G.plane(mat, (MOD - 0.07, 2.54), at=(i * MOD + MOD / 2, -0.03, zc),
                            rot=(90 + rnd.uniform(-0.45, 0.45), 0, rnd.uniform(-0.5, 0.5)))
        if detail:
            for zt in (z0 + 0.3, z0 + 2.9, z0 + 5.5):
                G.box(m["darkmetal"], (length, 0.1, 0.06), at=(length / 2, -0.06, zt))
    for i in range(n + 1):
        x = i * MOD
        G.box(m["darkmetal"], (0.07, 0.16, H), at=(x, -0.09, LOBBY_TOP + H / 2))
        if fins and i % 2 == 1:
            G.box(m["fin"], (0.055, 0.6, H - 0.4), at=(x, -0.42, LOBBY_TOP + H / 2 + 0.2))


def crown(G, m, length, sign=False):
    H = CROWN_Z - ROOF_Z
    n = int(length / 0.8)
    for i in range(n + 1):
        G.box(m["fin"], (0.06, 0.45, H), at=(i * length / n, -0.25, ROOF_Z + H / 2))
    G.box(m["darkmetal"], (length, 0.5, 0.25), at=(length / 2, -0.25, CROWN_Z + 0.1))
    G.box(m["darkmetal"], (length, 0.5, 0.3), at=(length / 2, -0.25, ROOF_Z + 0.15))
    G.box(m["spandrel"], (length, 0.05, H - 0.5), at=(length / 2, 0.1, ROOF_Z + H / 2))
    if sign:
        with G.group("sign_crown", bake="none"):
            G.plane(m["sign_logo"], (10.4, 3.1), at=(length - 7.2, -0.62, ROOF_Z + 2.45), rot=(90, 0, 0), uvfit=True)


def podium(G, m, length, glazed, entrance=False):
    """Stone frame and lobby glazing from ground to LOBBY_TOP in the current local frame."""
    piers = int(round(length / 8.0))
    for i in range(piers + 1):
        x = min(max(i * length / piers, 0.55), length - 0.55)
        G.box(m["stone"], (1.1, 1.1, LOBBY_TOP - 0.6), at=(x, 0.1, (LOBBY_TOP - 0.6) / 2), bevel=0.03)
    G.box(m["stone"], (length + 0.5, 1.3, 0.6), at=(length / 2, 0.05, LOBBY_TOP - 0.3), bevel=0.04)
    G.box(m["darkmetal"], (length, 0.2, 0.12), at=(length / 2, -0.5, LOBBY_TOP - 0.66))
    if not glazed:
        G.box(m["stone"], (length, 0.3, LOBBY_TOP - 0.6), at=(length / 2, 0.3, (LOBBY_TOP - 0.6) / 2))
        return
    n = int(round(length / MOD))
    for i in range(n):
        x = i * MOD + MOD / 2
        if entrance and 16 <= i * MOD < 24:
            continue
        for zc, hh in ((2.1, 4.1), (6.1, 3.7)):
            G.plane(m["glass_clear"], (MOD - 0.06, hh), at=(x, 0.3, zc), rot=(90, 0, 0))
    for i in range(n + 1):
        x = i * MOD
        if entrance and 16 < x < 24:
            continue
        G.box(m["darkmetal"], (0.07, 0.14, LOBBY_TOP - 0.6), at=(x, 0.3, (LOBBY_TOP - 0.6) / 2))
    for seg in ((0, 16), (24, length)) if entrance else ((0, length),):
        G.box(m["darkmetal"], (seg[1] - seg[0], 0.12, 0.07), at=((seg[0] + seg[1]) / 2, 0.3, 4.2))
        G.box(m["stone_dark"], (seg[1] - seg[0], 0.2, 0.18), at=((seg[0] + seg[1]) / 2, 0.3, 0.09))


def entrance(G, m):
    """Entrance portal, sliding doors and canopy. Local frame of the front facade (bay x = 16..24)."""
    cx = 20.0
    # stone portal
    for sx in (-1, 1):
        G.box(m["stone"], (0.9, 1.5, 6.6), at=(cx + sx * 3.55, -0.35, 3.3), bevel=0.03)
    G.box(m["stone"], (8.0, 1.5, 1.9), at=(cx, -0.35, 5.65), bevel=0.03)
    with G.group("sign_portal", bake="none"):
        G.plane(m["sign_logo"], (4.4, 1.31), at=(cx, -1.12, 5.65), rot=(90, 0, 0), uvfit=True)
    # glazing above the doors and sidelights
    G.plane(m["glass_clear"], (6.2, 1.4), at=(cx, 0.3, 3.95), rot=(90, 0, 0))
    G.box(m["darkmetal"], (6.2, 0.14, 0.1), at=(cx, 0.3, 3.2))
    for sx in (-1, 1):
        G.plane(m["glass_clear"], (1.7, 3.2), at=(cx + sx * 2.25, 0.3, 1.6), rot=(90, 0, 0))
        G.box(m["darkmetal"], (0.08, 0.14, 3.2), at=(cx + sx * 1.38, 0.3, 1.6))
    # sliding door leaves (moved by the engine)
    for sx, name in ((-1, "doorL"), (1, "doorR")):
        with G.group(name, bake="none", pivot=(cx + sx * 0.68, 0.24, 0), slide=sx * 1.3):
            G.plane(m["glass_clear"], (1.3, 3.05), at=(cx + sx * 0.68, 0.24, 1.6), rot=(90, 0, 0))
            G.box(m["darkmetal"], (0.06, 0.06, 3.1), at=(cx + sx * 0.03, 0.24, 1.58))
            G.box(m["darkmetal"], (0.06, 0.06, 3.1), at=(cx + sx * 1.33, 0.24, 1.58))
            G.box(m["darkmetal"], (1.3, 0.06, 0.12), at=(cx + sx * 0.68, 0.24, 0.1))
            G.box(m["chrome"], (0.04, 0.05, 0.9), at=(cx + sx * 0.12, 0.2, 1.2))
    # canopy blade
    G.box(m["white"], (10.5, 5.6, 0.2), at=(cx, -3.9, 4.42), bevel=0.03)
    G.box(m["darkmetal"], (10.6, 5.7, 0.08), at=(cx, -3.9, 4.56))
    for sx in (-1, 1):
        G.cyl(m["darkmetal"], 0.03, 4.2, at=(cx + sx * 4.6, -3.2, 5.45), rot=(-52, 0, 0), seg=6)
    for i in range(4):
        G.box(m["light_warm"], (0.12, 4.4, 0.02), at=(cx - 3.75 + i * 2.5, -3.9, 4.31))
    # recessed door mat
    G.box(m["rubber"], (5.0, 2.2, 0.02), at=(cx, -1.3, 0.011))


def roof_silhouette(G, m):
    """Low-detail roof plant seen from the street and the skyline shots (world frame)."""
    G.box(m["concrete"], (W - 0.6, D - 0.6, 0.3), at=(0, D / 2, ROOF_Z - 0.15))
    for cx in (-9.0, -2.5):
        G.box(m["stone"], (5.2, 4.2, 4.4), at=(cx, 16, ROOF_Z + 2.2), bevel=0.05)
        G.cyl(m["steel"], 1.7, 0.9, at=(cx, 16, ROOF_Z + 4.85), seg=20)
    G.box(m["concrete"], (7, 6, 3.4), at=(11, 17, ROOF_Z + 1.7))


def tower_exterior(G, m, seed=7, lobby_glazed=("front", "left", "right"), detail=True):
    rnd = random.Random(seed)
    for origin, rz, length, name in FACES:
        with G.at(origin, rz=rz):
            curtain_wall(G, m, length, rnd, fins=name != "back", detail=detail, lit=0.0)
            crown(G, m, length, sign=name == "front")
            podium(G, m, length, glazed=name in lobby_glazed, entrance=name == "front")
            if name == "front":
                entrance(G, m)
                # the blue light blade on the left corner
                G.box(m["led_blue"], (0.16, 0.05, ROOF_Z - LOBBY_TOP + 4.0), at=(0.45, -0.75, (ROOF_Z + LOBBY_TOP + 4.0) / 2))
                G.box(m["darkmetal"], (0.4, 0.1, ROOF_Z - LOBBY_TOP + 4.0), at=(0.45, -0.68, (ROOF_Z + LOBBY_TOP + 4.0) / 2))
    # corner posts
    for x in (-W / 2, W / 2):
        for y in (0, D):
            G.box(m["darkmetal"], (0.3, 0.3, ROOF_Z - LOBBY_TOP), at=(x, y, (ROOF_Z + LOBBY_TOP) / 2))
    roof_silhouette(G, m)


# ----------------------------------------------------------------------------- lobby
LIFT_X = -8.0          # the lift visitors use
LIFT_B_X = -13.0
LOBBY_BACK = 14.0


def lift_portal(G, m, x, y, open_cabin, prefix="lift", z0=0.0):
    """Lift entrance on a wall at y (cabin behind, +Y). Doors are pivot groups when open_cabin."""
    wdt, hgt = 1.4, 2.5
    G.box(m["steel"], (0.14, 0.34, hgt + 0.14), at=(x - wdt / 2 - 0.07, y - 0.02, z0 + (hgt + 0.14) / 2), bevel=0.01)
    G.box(m["steel"], (0.14, 0.34, hgt + 0.14), at=(x + wdt / 2 + 0.07, y - 0.02, z0 + (hgt + 0.14) / 2), bevel=0.01)
    G.box(m["steel"], (wdt + 0.28, 0.34, 0.14), at=(x, y - 0.02, z0 + hgt + 0.07), bevel=0.01)
    # indicator above the door
    G.box(m["plastic_dark"], (0.7, 0.06, 0.22), at=(x, y - 0.2, z0 + hgt + 0.42), bevel=0.01)
    with G.group(f"{prefix}_ind", bake="none"):
        G.plane(M("screen_ind", "#27a8ee", emit=4.0, kind="screen"), (0.58, 0.13), at=(x, y - 0.235, z0 + hgt + 0.42), rot=(90, 0, 0), uvfit=True)
    if open_cabin:
        for sx, name in ((-1, f"{prefix}DoorL"), (1, f"{prefix}DoorR")):
            with G.group(name, bake="none", pivot=(x + sx * wdt / 4, y + 0.08, z0), slide=sx * (wdt / 2 - 0.02)):
                G.box(m["steel"], (wdt / 2, 0.04, hgt), at=(x + sx * wdt / 4, y + 0.08, z0 + hgt / 2))
        # cabin
        cw, cd, ch = 2.2, 2.2, 2.7
        cy = y + 0.2 + cd / 2
        with G.group(f"{prefix}_cabin", bake="vc", env="lobby"):
            G.box(m["stone_dark"], (cw, cd, 0.06), at=(x, cy, z0 - 0.03))
            G.box(m["steel"], (0.05, cd, ch), at=(x - cw / 2, cy, z0 + ch / 2), maxseg=0.6)
            G.box(m["steel"], (0.05, cd, ch), at=(x + cw / 2, cy, z0 + ch / 2), maxseg=0.6)
            G.box(m["steel"], (cw, 0.05, ch), at=(x, cy + cd / 2, z0 + ch / 2), maxseg=0.6)
            G.box(m["wood_dark"], (cw - 0.1, 0.03, 1.1), at=(x, cy + cd / 2 - 0.04, z0 + 1.75))
            G.box(m["white"], (cw, cd, 0.05), at=(x, cy, z0 + ch))
            G.cyl(m["chrome"], 0.02, cw - 0.3, at=(x, cy + cd / 2 - 0.1, z0 + 0.95), axis="x", seg=8)
            G.box(m["plastic_dark"], (0.03, 0.3, 0.7), at=(x + cw / 2 - 0.04, cy - 0.6, z0 + 1.25))
        with G.group(f"{prefix}_cabinlight", bake="none"):
            G.box(m["light_soft"], (cw - 0.5, cd - 0.5, 0.02), at=(x, cy, z0 + ch - 0.04))
    else:
        G.box(m["steel"], (wdt / 2 - 0.004, 0.04, hgt), at=(x - wdt / 4, y + 0.08, z0 + hgt / 2))
        G.box(m["steel"], (wdt / 2 - 0.004, 0.04, hgt), at=(x + wdt / 4, y + 0.08, z0 + hgt / 2))


def sofa(G, m, L=2.4):
    G.box(m["fabric"], (L, 0.9, 0.36), at=(0, 0, 0.26), bevel=0.05)
    G.box(m["fabric"], (L, 0.24, 0.5), at=(0, 0.33, 0.62), bevel=0.06)
    for sx in (-1, 1):
        G.box(m["fabric"], (0.22, 0.9, 0.28), at=(sx * (L / 2 - 0.11), 0, 0.52), bevel=0.05)
    G.box(m["darkmetal"], (L - 0.2, 0.7, 0.07), at=(0, 0, 0.05))


def indoor_plant(G, m, h=1.9, seed=0):
    import kit
    kit.blade_plant(G, m, h=h * 0.72, seed=seed)


def lobby(G, m, lm="lm_lobby"):
    """Ground-floor reception (world frame). Lightmapped shell + vertex-baked furniture."""
    x0, x1, y0, y1, H = -W / 2 + 0.6, W / 2 - 0.6, 0.35, LOBBY_BACK, 8.0
    cx, cy = 0.0, (y0 + y1) / 2
    with G.group("lobby_shell", bake="lm", lm=lm, env="lobby"):
        G.box(m["floor_stone"], (x1 - x0, y1 - y0 + 0.6, 0.2), at=(cx, cy - 0.3, -0.1))
        G.box(m["ceiling"], (x1 - x0, y1 - y0, 0.2), at=(cx, cy, H + 0.1))
        # back wall, built around the two lift openings
        lw, lh = 1.4, 2.5
        edges = [x0, LIFT_B_X - lw / 2, LIFT_B_X + lw / 2, LIFT_X - lw / 2, LIFT_X + lw / 2, x1]
        for a_, b_ in ((edges[0], edges[1]), (edges[2], edges[3]), (edges[4], edges[5])):
            G.box(m["stone_wall"], (b_ - a_, 0.3, H), at=((a_ + b_) / 2, y1 + 0.15, H / 2))
        for lx in (LIFT_B_X, LIFT_X):
            G.box(m["stone_wall"], (lw, 0.3, H - lh), at=(lx, y1 + 0.15, lh + (H - lh) / 2))
        for sx in (-1, 1):
            G.box(m["stone_wall"], (0.3, y1 - y0, H), at=(sx * (x1 + 0.15), cy, H / 2))
        # floating ceiling raft with light slots
        G.box(m["white"], (30, 7.0, 0.25), at=(0, 6.6, 7.1), bevel=0.02)
        # timber feature wall behind reception (backing)
        G.box(m["wood_dark"], (17.0, 0.12, 6.2), at=(9.6, y1 - 0.06, 3.1))
    with G.group("lobby_lights", bake="none", env="lobby"):
        for i in range(5):
            G.box(m["light_warm"], (0.1, 6.2, 0.02), at=(-12 + i * 6.0, 6.6, 6.965))
        G.box(m["light_warm"], (17.0, 0.1, 0.05), at=(9.6, y1 - 0.22, 6.32))
        # pendant rings above the desk
        for px, pz, r in ((7.4, 4.6, 1.1), (10.0, 5.1, 1.5), (12.4, 4.4, 0.9)):
            G.lathe(m["light_warm"], [(r - 0.035, -0.03), (r + 0.035, -0.03), (r + 0.035, 0.03), (r - 0.035, 0.03), (r - 0.035, -0.03)], at=(px, 9.4, pz), seg=40)
    with G.group("lobby_fit", bake="vc", env="lobby"):
        # slats
        n = int(17.0 / 0.16)
        for i in range(n):
            x = 1.2 + i * 0.16
            if 7.2 < x < 12.0 or 1.75 < x < 6.65 or 13.7 < x < 16.3:
                # calm panels for the logo, the state wall (left) and Vision 2030 (right)
                continue
            G.box(m["wood"], (0.06, 0.08, 6.1), at=(x, y1 - 0.16, 3.1))
        G.box(m["wood"], (4.9, 0.05, 2.2), at=(9.6, y1 - 0.15, 4.0))
        with G.group("sign_reception", bake="none"):
            G.plane(m["sign_logo"], (3.6, 1.07), at=(9.6, y1 - 0.2, 4.05), rot=(90, 0, 0), uvfit=True)
        # state wall, left of the logo: the flag above, the King on the viewer's right and the Crown Prince
        # on the left, each in a gilt frame with a name plate. The flag hangs flat, never draped or mirrored.
        SX = 4.2
        G.box(m["wood"], (4.9, 0.05, 4.3), at=(SX, y1 - 0.15, 4.05))
        G.box(m["darkmetal"], (1.62, 0.03, 1.12), at=(SX, y1 - 0.19, 4.98))
        for px in (SX + 0.85, SX - 0.85):
            G.box(M("gilt", "#c9a55a", rough=0.3, metal=0.9), (1.26, 0.04, 1.54), at=(px, y1 - 0.195, 3.48), bevel=0.008)
            G.box(m["darkmetal"], (1.26, 0.02, 0.26), at=(px, y1 - 0.185, 2.5))
        with G.group("sign_state", bake="none"):
            G.plane(M("sign_flag", "#ffffff", emit=1.0, kind="sign", sign="flag"), (1.5, 1.0), at=(SX, y1 - 0.21, 4.98), rot=(90, 0, 0), uvfit=True)
            G.plane(M("sign_king", "#ffffff", emit=1.0, kind="sign", sign="king"), (1.12, 1.4), at=(SX + 0.85, y1 - 0.22, 3.48), rot=(90, 0, 0), uvfit=True)
            G.plane(M("sign_cp", "#ffffff", emit=1.0, kind="sign", sign="cp"), (1.12, 1.4), at=(SX - 0.85, y1 - 0.22, 3.48), rot=(90, 0, 0), uvfit=True)
            G.plane(M("sign_cap_king", "#ffffff", emit=1.0, kind="sign", sign="cap_king"), (1.22, 0.236), at=(SX + 0.85, y1 - 0.2, 2.5), rot=(90, 0, 0), uvfit=True)
            G.plane(M("sign_cap_cp", "#ffffff", emit=1.0, kind="sign", sign="cap_cp"), (1.22, 0.236), at=(SX - 0.85, y1 - 0.2, 2.5), rot=(90, 0, 0), uvfit=True)
        # Vision 2030, right of the logo
        G.box(m["wood"], (2.5, 0.05, 2.2), at=(15.0, y1 - 0.15, 4.0))
        with G.group("sign_vision", bake="none"):
            G.plane(M("sign_v2030", "#ffffff", emit=1.0, kind="sign", sign="v2030"), (1.95, 1.3), at=(15.0, y1 - 0.2, 4.05), rot=(90, 0, 0), uvfit=True)
        # reception desk
        with G.at((9.6, 10.4, 0)):
            G.box(m["stone"], (5.4, 0.95, 1.08), at=(0, 0, 0.54), bevel=0.02, maxseg=0.9)
            G.box(m["wood"], (5.7, 1.2, 0.06), at=(0, -0.05, 1.11), bevel=0.01)
            G.box(m["led_blue"], (5.3, 0.02, 0.03), at=(0, -0.49, 0.12))
            G.box(m["stone_dark"], (1.8, 0.95, 0.76), at=(-3.6, 0, 0.38), bevel=0.02)
            for sx in (-1.2, 1.3):
                G.box(m["plastic_dark"], (0.6, 0.04, 0.38), at=(sx, 0.25, 1.42), rot=(-8, 0, 0), bevel=0.01)
                G.box(m["plastic_dark"], (0.08, 0.08, 0.2), at=(sx, 0.3, 1.2))
        # columns
        for sx in (-16.6, 16.6):
            G.cyl(m["stone_wall"], 0.45, H, at=(sx, 7.0, H / 2), seg=24)
            G.cyl(m["steel"], 0.47, 0.12, at=(sx, 7.0, 0.06), seg=24)
        # lifts
        lift_portal(G, m, LIFT_X, y1, open_cabin=True, prefix="lift")
        lift_portal(G, m, LIFT_B_X, y1, open_cabin=False, prefix="liftB")
        G.box(m["steel"], (0.16, 0.03, 0.4), at=((LIFT_X + LIFT_B_X) / 2, y1 - 0.02, 1.2), bevel=0.005)
        G.box(m["led_blue"], (0.05, 0.02, 0.05), at=((LIFT_X + LIFT_B_X) / 2, y1 - 0.04, 1.25))
        # directory wall between the lifts and the corner
        G.box(m["wall_dark"], (3.2, 0.06, 3.4), at=(-17.0, y1 - 0.03, 2.4))
        with G.group("sign_directory", bake="none"):
            G.plane(M("sign_dir", "#ffffff", emit=1.5, kind="sign", sign="directory"), (3.0, 3.2), at=(-17.0, y1 - 0.07, 2.4), rot=(90, 0, 0), uvfit=True)
        # lounge
        G.box(m["fabric"], (6.4, 4.6, 0.015), at=(-12.5, 4.6, 0.008))
        with G.at((-12.5, 6.3, 0)):
            sofa(G, m, 2.6)
        with G.at((-15.2, 4.5, 0), rz=-90):
            sofa(G, m, 2.0)
        with G.at((-9.8, 4.5, 0), rz=90):
            sofa(G, m, 2.0)
        G.cyl(m["stone_dark"], 0.62, 0.05, at=(-12.5, 4.5, 0.4), seg=24)
        G.cyl(m["darkmetal"], 0.06, 0.38, at=(-12.5, 4.5, 0.19), seg=8)
        with G.at((-17.6, 1.9, 0)):
            indoor_plant(G, m, 2.3, 1)
        with G.at((17.6, 1.9, 0)):
            indoor_plant(G, m, 2.3, 2)
        with G.at((2.0, 13.2, 0)):
            indoor_plant(G, m, 2.0, 3)
        with G.at((-4.2, 13.2, 0)):
            indoor_plant(G, m, 1.8, 4)
