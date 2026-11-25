"""Roof - Cooling Towers at dusk: one induced-draft cell that opens layer by layer, then the skyline.

Roof-local coordinates: z = 0 is the roof deck (the engine drops the city by the tower height).
Each cooling-tower layer is a pivot group with an `explode` offset; the engine slides the layers apart
when the visitor reaches the fan stop and back together for the farewell.

  blender -b --factory-startup -P tools/blender/roof.py -- [--preview] [--nobake] [--fast] [--still]
"""
import sys, os, json, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastlib import *
import kit, eq, building as B

reset_scene()
m = eq.emats(kit.mats())
G = Geo()
SKY = json.load(open(os.path.join(WORK, "sky.json")))["dusk"]
FRP = M("frp", "#d9d6cb", rough=0.6)
PVCF = M("fill_pvc", "#2c3f52", rough=0.6, side="double")
NOZ = M("nozzle", "#e07a2a", rough=0.5)
HOT = M("pipe_hot", "#b6492f", rough=0.45, metal=0.2)
COLD = m["paint_blue"]
DECK = M("roof_paver", "#a7a39a", rough=0.85, tex="paving", tile=2.4)

X0, X1, Y0, Y1 = -B.W / 2 + 0.3, B.W / 2 - 0.3, 0.3, B.D - 0.3
CX, CY = 4.6, 8.6           # the cell the visitor opens
S = 4.4                     # plan size of a cell


def ex(v):
    """Explode offset in three.js axes."""
    return [v[0], v[2], -v[1]]


# ----------------------------------------------------------------------------- deck, crown, penthouse
with G.group("deck", bake="lm", lm="lm_roof"):
    G.box(DECK, (B.W, B.D, 0.3), at=(0, B.D / 2, -0.15))
    # penthouse: lift overrun and stair core
    G.box(m["stone_wall"], (9.6, 0.3, 3.5), at=(-10.2, 19.0, 1.75))
    lw, lh = 1.4, 2.5
    edges = [-15.0, B.LIFT_B_X - lw / 2, B.LIFT_B_X + lw / 2, B.LIFT_X - lw / 2, B.LIFT_X + lw / 2, -5.4]
    for a_, b_ in ((edges[0], edges[1]), (edges[2], edges[3]), (edges[4], edges[5])):
        G.box(m["stone_wall"], (b_ - a_, 0.3, 3.5), at=((a_ + b_) / 2, B.LOBBY_BACK + 0.15, 1.75))
    for lx in (B.LIFT_B_X, B.LIFT_X):
        G.box(m["stone_wall"], (lw, 0.3, 3.5 - lh), at=(lx, B.LOBBY_BACK + 0.15, lh + (3.5 - lh) / 2))
    for x in (-15.0, -5.4):
        G.box(m["stone_wall"], (0.3, 5.0, 3.5), at=(x, 16.5, 1.75))
    G.box(m["concrete"], (10.2, 5.6, 0.25), at=(-10.2, 16.5, 3.62))
    # plinths under the two cells and the pump skid
    for cx in (CX, CX + 6.6):
        G.box(m["concrete"], (S + 0.6, S + 0.6, 0.2), at=(cx, CY, 0.1))
with G.group("crown", bake="vc"):
    for origin, rz, length, name in B.FACES:
        with G.at((origin[0], origin[1], -B.ROOF_Z), rz=rz):
            H = B.CROWN_Z - B.ROOF_Z
            n = int(length / 0.8)
            for i in range(n + 1):
                G.box(m["fin"], (0.06, 0.45, H), at=(i * length / n, -0.25, B.ROOF_Z + H / 2))
            G.box(m["darkmetal"], (length, 0.5, 0.25), at=(length / 2, -0.25, B.CROWN_Z + 0.1))
            G.box(m["darkmetal"], (length, 0.5, 1.1), at=(length / 2, -0.25, B.ROOF_Z + 0.55))
            if name in ("back", "right"):
                G.box(m["spandrel"], (length, 0.05, H - 1.2), at=(length / 2, 0.1, B.ROOF_Z + 1.1 + (H - 1.2) / 2))
    B.lift_portal(G, m, B.LIFT_X, B.LOBBY_BACK, open_cabin=True, prefix="lift")
    B.lift_portal(G, m, B.LIFT_B_X, B.LOBBY_BACK, open_cabin=False, prefix="liftB")
with G.group("tower_body", bake="vc", far=1):
    # the building below, seen in the farewell pull-back
    rnd = random.Random(7)
    for origin, rz, length, name in B.FACES:
        with G.at((origin[0], origin[1], -B.ROOF_Z), rz=rz):
            B.curtain_wall(G, m, length, rnd, fins=name != "back", detail=False, lit=0.2)
            B.podium(G, m, length, glazed=False)
            if name == "front":
                # the ground floor seen from the air: lobby glazing behind the columns and a stone base course
                G.box(m["glass_dark"], (B.W - 1.2, B.D - 1.2, B.LOBBY_TOP - 0.4), at=(B.W / 2, B.D / 2, (B.LOBBY_TOP - 0.4) / 2))
                G.box(m["stone"], (B.W + 3.0, B.D + 3.0, 0.5), at=(B.W / 2, B.D / 2, 0.2))
                # entrance portal with its sign, and the sign on the crown, as on arrival
                for sx in (-1, 1):
                    G.box(m["stone"], (0.9, 1.5, 6.6), at=(20.0 + sx * 3.55, -0.35, 3.3))
                G.box(m["stone"], (8.0, 1.5, 1.9), at=(20.0, -0.35, 5.65))
                with G.group("sign_portal", bake="none"):
                    G.plane(m["sign_logo"], (4.4, 1.31), at=(20.0, -1.12, 5.65), rot=(90, 0, 0), uvfit=True)
                with G.group("sign_crown", bake="none"):
                    G.plane(m["sign_logo"], (10.4, 3.1), at=(length - 7.2, -0.62, B.ROOF_Z + 2.45), rot=(90, 0, 0), uvfit=True)
with G.group("roof_lights", bake="none"):
    for x in (-13.5, -6.6):
        G.box(m["light_warm"], (0.3, 0.06, 0.12), at=(x, B.LOBBY_BACK - 0.05, 2.9))
        G.marker("glow", f"bulk{x}", (x, B.LOBBY_BACK - 0.2, 2.9), color="#ffd9a0", size=2.2)
    # red obstruction light on a mast
    G.sphere(m["led_red"], 0.09, at=(X1 - 1.2, Y1 - 1.2, 6.4), seg=10, rings=6)
    G.marker("glow", "obstruction", (X1 - 1.2, Y1 - 1.2, 6.4), color="#ff3b2b", size=3.0, blink=[1.6, 0.5, 0])
G.cyl(m["galv"], 0.05, 6.3, at=(X1 - 1.2, Y1 - 1.2, 3.15), seg=8)

# ----------------------------------------------------------------------------- the cooling tower cell
def louvres(z0=0.8, z1=2.0):
    for sgn in (-1, 1):
        for k in range(6):
            z = z0 + 0.1 + k * (z1 - z0 - 0.1) / 6
            G.box(FRP, (S - 0.3, 0.02, 0.26), at=(0, sgn * (S / 2 - 0.03), z + 0.08), rot=(sgn * 42, 0, 0))
            G.box(FRP, (0.02, S - 0.3, 0.26), at=(sgn * (S / 2 - 0.03), 0, z + 0.08), rot=(0, -sgn * 42, 0))


def frame():
    for sx in (-1, 1):
        for sy in (-1, 1):
            G.box(m["galv"], (0.12, 0.12, 3.6), at=(sx * (S / 2 - 0.06), sy * (S / 2 - 0.06), 0.8 + 1.8))
    for z in (2.0, 4.3):
        for sgn in (-1, 1):
            G.box(m["galv"], (S, 0.1, 0.1), at=(0, sgn * (S / 2 - 0.06), z))
            G.box(m["galv"], (0.1, S, 0.1), at=(sgn * (S / 2 - 0.06), 0, z))


def basin():
    G.box(m["conc_fresh"], (S + 0.3, S + 0.3, 0.12), at=(0, 0, 0.26))
    for sgn in (-1, 1):
        G.box(m["conc_fresh"], (S + 0.3, 0.14, 0.6), at=(0, sgn * (S / 2 + 0.08), 0.5), maxseg=0.9)
        G.box(m["conc_fresh"], (0.14, S + 0.3, 0.6), at=(sgn * (S / 2 + 0.08), 0, 0.5), maxseg=0.9)
    # sump, outlet with screen, make-up line with float valve, overflow
    G.box(m["galv"], (0.7, 0.7, 0.02), at=(1.2, -1.2, 0.34))
    for k in range(6):
        G.box(m["galv"], (0.02, 0.7, 0.14), at=(0.9 + k * 0.12, -1.2, 0.4))
    eq.pipe(G, COLD, [(1.2, -1.6, 0.42), (1.2, -S / 2 - 0.7, 0.42)], 0.3, flanges=[((1.2, -S / 2 - 0.35, 0.42), "y")])
    eq.pipe(G, m["galv"], [(-1.6, S / 2 + 0.7, 0.95), (-1.6, S / 2 - 0.4, 0.95), (-1.6, S / 2 - 0.4, 0.78)], 0.07)
    G.cyl(m["brass"], 0.05, 0.1, at=(-1.6, S / 2 - 0.4, 0.74), seg=10)
    G.cyl(m["brass"], 0.008, 0.5, at=(-1.35, S / 2 - 0.4, 0.72), axis="x", seg=5)
    G.sphere(m["copper"], 0.11, at=(-1.08, S / 2 - 0.4, 0.7), seg=12, rings=8)
    G.cyl(m["galv"], 0.06, 0.5, at=(1.8, S / 2 - 0.2, 0.55), seg=10)


def fill():
    n = 40
    for k in range(n):
        x = -S / 2 + 0.22 + k * (S - 0.44) / (n - 1)
        G.box(PVCF, (0.012, S - 0.4, 1.0), at=(x, 0, 2.55), rot=(0, 0, 3 if k % 2 else -3))
    for sgn in (-1, 1):
        G.box(m["galv"], (S - 0.3, 0.06, 0.06), at=(0, sgn * (S / 2 - 0.25), 2.03))


def distribution():
    eq.pipe(G, HOT, [(0, -S / 2 - 0.6, 3.35), (0, S / 2 - 0.3, 3.35)], 0.26, flanges=[((0, -S / 2 - 0.2, 3.35), "y")])
    for k in range(6):
        y = -1.75 + k * 0.7
        G.cyl(HOT, 0.05, S - 0.5, at=(0, y, 3.35), axis="x", seg=8)
        for j in range(6):
            x = -1.75 + j * 0.7
            if abs(x) < 0.2:
                continue
            G.cyl(NOZ, 0.05, 0.1, at=(x, y, 3.24), seg=8, r2=0.02)
            G.cyl(NOZ, 0.07, 0.012, at=(x, y, 3.17), seg=8)


def eliminators():
    n = 26
    for k in range(n):
        y = -S / 2 + 0.3 + k * (S - 0.6) / (n - 1)
        G.box(PVCF, (S - 0.4, 0.008, 0.16), at=(0, y - 0.035, 3.86), rot=(34, 0, 0))
        G.box(PVCF, (S - 0.4, 0.008, 0.16), at=(0, y + 0.035, 3.74), rot=(-34, 0, 0))
    for sgn in (-1, 1):
        G.box(m["galv"], (0.05, S - 0.3, 0.3), at=(sgn * (S / 2 - 0.2), 0, 3.8))


def casing(sides):
    """FRP casing walls for the given sides ('w', 'e', 'n', 's')."""
    for side in sides:
        if side in ("w", "e"):
            sgn = -1 if side == "w" else 1
            G.box(FRP, (0.05, S, 2.3), at=(sgn * (S / 2), 0, 3.15), maxseg=0.9)
            for k in range(-2, 3):
                G.box(FRP, (0.07, 0.04, 2.3), at=(sgn * (S / 2 + 0.02), k * 0.85, 3.15))
        else:
            sgn = -1 if side == "s" else 1
            G.box(FRP, (S, 0.05, 2.3), at=(0, sgn * (S / 2), 3.15), maxseg=0.9)
            for k in range(-2, 3):
                G.box(FRP, (0.04, 0.07, 2.3), at=(k * 0.85, sgn * (S / 2 + 0.02), 3.15))


def fan_deck():
    # deck plate around the fan opening, then the stack
    r = 1.6
    for sgn in (-1, 1):
        G.box(FRP, (S, (S - 2 * r) / 2, 0.06), at=(0, sgn * (r + (S - 2 * r) / 4), 4.33))
        G.box(FRP, ((S - 2 * r) / 2, 2 * r, 0.06), at=(sgn * (r + (S - 2 * r) / 4), 0, 4.33))
    G.lathe(FRP, [(r, 4.36), (r - 0.06, 4.7), (r - 0.04, 5.1), (r + 0.08, 5.36), (r + 0.12, 5.36), (r + 0.0, 5.08), (r - 0.0, 4.7), (r + 0.06, 4.36)], seg=32)
    for k in range(8):
        a = k * math.pi / 4
        G.box(FRP, (0.05, 0.1, 1.0), at=(math.cos(a) * (r + 0.07), math.sin(a) * (r + 0.07), 4.86), rot=(0, 0, math.degrees(a)))
    eq.handrail(G, m, [(-S / 2, -S / 2, 4.36), (S / 2, -S / 2, 4.36), (S / 2, S / 2, 4.36), (-S / 2, S / 2, 4.36), (-S / 2, -S / 2, 4.36)], h=1.0)


def fan(r=1.45):
    G.cyl(m["paint_dark"], 0.28, 0.24, at=(0, 0, 4.82), seg=18)
    G.cyl(m["steel"], 0.34, 0.04, at=(0, 0, 4.95), seg=18)
    for k in range(6):
        a = k * 60
        with G.at((0, 0, 4.82), rz=a):
            # tapered, pitched blade
            G.box(m["white"], (r - 0.3, 0.34, 0.03), at=(0.3 + (r - 0.3) / 2, 0, 0), rot=(16, 0, 0), bevel=0.01)
            G.box(m["steel"], (0.22, 0.12, 0.06), at=(0.34, 0, 0))


def drive():
    # right-angle gearbox under the hub, drive shaft out through the stack to the motor
    G.box(m["paint_green"], (0.5, 0.5, 0.42), at=(0, 0, 4.48), bevel=0.04)
    G.cyl(m["paint_green"], 0.16, 0.2, at=(0, 0, 4.74), seg=14)
    G.cyl(m["stainless"], 0.05, 1.9, at=(1.25, 0, 4.48), axis="x", seg=10)
    for x in (0.35, 2.1):
        G.cyl(m["paint_yellow"], 0.1, 0.12, at=(x, 0, 4.48), axis="x", seg=12)
    eq.motor(G, m, (2.75, 0, 4.48), axis="x", L=0.7, r=0.2, mat=m["paint_blue"], feet=False)
    G.box(m["galv"], (1.0, 0.5, 0.06), at=(2.75, 0, 4.24))
    G.box(m["galv"], (3.4, 0.12, 0.1), at=(1.3, 0, 4.2))


LAYERS = [  # name, builder, explode (dx, dy, dz) in Blender axes
    ("ct_basin", basin, (0, 0, 0)),
    ("ct_fill", fill, (0, 0, 0.55)),
    ("ct_dist", distribution, (0, 0, 1.25)),
    ("ct_elim", eliminators, (0, 0, 1.95)),
    ("ct_drive", drive, (0, 0, 2.75)),
    ("ct_deck", fan_deck, (0, 0, 3.9)),
    # the two walls facing the visitor slide clear; the far walls stay as a backdrop for the internals
    ("ct_casing_front", lambda: casing("wn"), (-3.6, -3.4, 0.25)),
    ("ct_casing_back", lambda: casing("es"), (0, 0, 0)),
]
with G.at((CX, CY, 0.2)):
    with G.group("ct_frame", bake="vc"):
        frame()
        louvres()
    for name, build, off in LAYERS:
        with G.group(name, bake="vc", pivot=(0, 0, 0), explode=ex(off)):
            build()
    with G.group("ct_fanlift", bake="vc", pivot=(0, 0, 0), explode=ex((0, 0, 3.3))):
        with G.group("ct_fan", bake="vc", pivot=(0, 0, 4.82), parent="ct_fanlift", spin=[0, 1, 0, 2.2]):
            fan()
    with G.group("ct_water", bake="none", pivot=(0, 0, 0), explode=ex((0, 0, 0))):
        G.plane(m["water"], (S, S), at=(0, 0, 0.68))
    G.marker("spray", "ct", (0, 0, 3.15), radius=1.9, height=2.3, attach="ct_dist")

# the neighbouring cell stays assembled so the visitor always sees what the whole looks like
with G.at((CX + 6.6, CY, 0.2)):
    with G.group("ct2", bake="vc"):
        frame()
        louvres()
        basin()
        casing("wens")
        fan_deck()
        G.box(m["galv"], (3.4, 0.12, 0.1), at=(1.3, 0, 4.2))
        eq.motor(G, m, (2.75, 0, 4.48), axis="x", L=0.7, r=0.2, mat=m["paint_blue"], feet=False)
    with G.group("ct2_fan", bake="vc", pivot=(0, 0, 4.82), spin=[0, 1, 0, 2.2]):
        fan()

# condenser water pipework and pumps
eq.pipe(G, COLD, [(CX + 1.2, CY - S / 2 - 0.7, 0.62), (CX + 1.2, 3.4, 0.62), (-1.5, 3.4, 0.62)], 0.3, flanges=[((CX + 1.2, 4.6, 0.62), "y"), ((2.0, 3.4, 0.62), "x")])
eq.pipe(G, COLD, [(CX + 7.8, CY - S / 2 - 0.7, 0.62), (CX + 7.8, 3.4, 0.62), (CX + 1.2, 3.4, 0.62)], 0.3)
eq.pipe(G, HOT, [(-1.5, 2.6, 0.62), (CX, 2.6, 0.62), (CX, CY - S / 2 - 0.6, 0.62), (CX, CY - S / 2 - 0.6, 3.55)], 0.26, flanges=[((1.0, 2.6, 0.62), "x")])
for x in (0.0, 2.5, 5.2, 8.0, 10.6):
    eq.support(G, m, (x, 3.4, 0), 0.62, 0.3)
eq.skid(G, m["paint_dark"], 3.0, 2.0, at=(-3.2, 3.0, 0.0), h=0.14, cross=2)
for py in (3.5, 2.5):
    eq.pump(G, m, (-2.4, py, 0.14), axis="x", size=0.9, mat=m["paint_green"], motor_mat=m["paint_blue"])
eq.pipe(G, COLD, [(-3.6, 1.2, 0.62), (-3.6, 1.2, -0.2)], 0.3)
eq.pipe(G, HOT, [(-1.5, 2.6, 0.62), (-1.5, 1.2, 0.62), (-1.5, 1.2, -0.2)], 0.26)
# roof clutter
c = eq.cabinet(G, m, (1.6, 0.5, 1.8), at=(3.2, 16.4, 0), mat=m["paint_grey"], doors=2, plinth=0.15, facing="-y")
eq.cable_tray(G, m, [(4.0, 16.0, 0.25), (7.4, 16.0, 0.25), (7.4, CY + S / 2 + 0.8, 0.25)], w=0.3)
G.box(m["galv"], (3.2, 1.6, 1.5), at=(15.0, 20.0, 0.85), bevel=0.02, maxseg=0.9)

# ----------------------------------------------------------------------------- shots, stands, hotspots
G.shot("arrive", (B.LIFT_X + 0.5, 13.0, 1.66), (CX, CY, 2.6), fov=58)
G.stand("arrive", (-4.4, 10.6, 0), (B.LIFT_X + 0.5, 13.0, 1.6))
tower_stand = (0.6, 10.1, 0)
G.shot("tower", (-2.6, 13.4, 1.8), (CX + 0.4, CY, 2.9), fov=58)
G.shot("fan", (-3.4, 15.0, 2.0), (CX, CY, 7.4), fov=62)
G.shot("drive", (-1.6, 14.2, 2.4), (CX + 1.2, CY, 6.9), fov=56)
G.shot("distribution", (-1.2, 13.4, 2.2), (CX, CY, 4.6), fov=54)
G.shot("fill", (-0.6, 12.8, 1.9), (CX, CY, 3.0), fov=52)
G.shot("basin", (0.4, 12.4, 1.9), (CX, CY + 0.6, 0.9), fov=52)
for sid in ("tower", "fan", "drive", "distribution", "fill", "basin"):
    G.stand(sid, tower_stand, (-2.0, 13.6, 1.6))
G.hotspot("tower", (CX - S / 2, CY + S / 2, 3.2))
G.hotspot("fan", (CX - 0.6, CY + 0.4, 4.9 + 3.3))
G.hotspot("drive", (CX + 2.5, CY + 0.2, 4.5 + 2.75))
G.hotspot("distribution", (CX - 1.0, CY + 1.9, 3.3 + 1.25))
G.hotspot("fill", (CX - 1.6, CY + S / 2 - 0.2, 2.6 + 0.55))
G.hotspot("basin", (CX - 1.1, CY + S / 2 - 0.3, 0.95))
# the edge of the roof, the walk back to the lift, and the farewell flight
G.shot("edge", (-11.0, 4.6, 1.72), (-40.0, -60.0, -6.0), fov=60)
G.stand("edge", (-8.9, 3.2, 0), (-11.0, 4.6, 1.6))
G.shot("back1", (-9.0, 8.5, 1.7), (-8.2, 14.0, 1.6), fov=55)
G.shot("back2", (B.LIFT_X + 0.3, 11.2, 1.68), (B.LIFT_X, 15.0, 1.55), fov=52)
G.stand("lift", (B.LIFT_X + 1.7, 12.9, 0), (B.LIFT_X + 0.3, 11.2, 1.6))
G.hotspot("lift", (B.LIFT_X, B.LOBBY_BACK - 0.1, 2.9))
G.shot("fare1", (-15.0, 0.5, 8.5), (-20.0, -60.0, -10.0), fov=58)
G.shot("fare2", (-52.0, -58.0, 34.0), (2.0, 10.0, -14.0), fov=50)
G.shot("fare3", (-128.0, -180.0, 86.0), (0.0, -24.0, -40.0), fov=44)   # high enough to hold the tower, its plot and the park

objs = G.finish()

# ----------------------------------------------------------------------------- light: dusk sky, warm floods on the plant
set_world_hdri(os.path.join(DOWNLOADS, "hdri", "qwantani_dusk_2_puresky_4k.hdr"), strength=1.0, rot_z=SKY["rot_z"])
for pos, tgt, pw in (((-1.0, 13.5, 3.2), (CX, CY, 3.0), 900), ((CX - 5.0, CY - 4.5, 0.6), (CX, CY, 4.0), 500), ((CX + 9.5, CY + 5.0, 0.6), (CX + 6.6, CY, 3.5), 420), ((-10.0, 12.8, 3.0), (-9.0, 10.0, 0.0), 260)):
    add_area(pos, 0.5, pw, color=(1.0, 0.82, 0.6), target=tgt, shape="DISK")
add_area((B.LIFT_X, 15.3, 2.6), 1.4, 60, color=(1.0, 0.9, 0.75), rot=(0, 0, 0))
# wash the penthouse walls so they do not read as black slabs at dusk
add_area((-2.5, 16.5, 2.6), 1.0, 320, color=(1.0, 0.84, 0.64), target=(-5.4, 16.5, 1.6), shape="DISK")
add_area((-10.0, 11.0, 2.8), 1.0, 380, color=(1.0, 0.84, 0.64), target=(-10.0, 14.0, 1.6), shape="DISK")

sc = bpy.context.scene
exploded = [(o, o.get("explode")) for o in sc.objects if o.type == "EMPTY" and o.get("explode")]


def set_explode(k):
    for o, v in exploded:
        # stored in three.js axes (x, y, z) = Blender (x, z, -y)
        o.location.x += k * v[0]
        o.location.y += k * -v[2]
        o.location.z += k * v[1]
    bpy.context.view_layer.update()


if arg("--preview"):
    render_preview("roof_tower", (-2.6, 13.4, 1.8), (CX + 0.4, CY, 2.9), fov=58, res=(960, 540), samples=32)
    render_preview("roof_edge", (-11.0, 4.6, 1.72), (-40.0, -60.0, -6.0), fov=60, res=(960, 540), samples=32)
    set_explode(1)
    render_preview("roof_fan", (-3.4, 15.0, 2.0), (CX, CY, 7.4), fov=62, res=(960, 540), samples=32)
    render_preview("roof_fill", (-0.6, 12.8, 1.9), (CX, CY, 3.0), fov=52, res=(960, 540), samples=32)
    set_explode(-1)
if arg("--still"):
    render_still("floor-roof", (-2.6, 13.4, 1.8), (CX + 0.4, CY, 2.9), fov=58, res=(1280, 880), samples=128)
if not arg("--nobake"):
    fast = arg("--fast")
    bake_lightmap("lm_roof", size=1024 if fast else 2048, samples=48 if fast else 200)
    # bake the layers apart so the inner parts carry light, then close the tower again for export
    set_explode(1)
    bake_vertex(samples=32 if fast else 160)
    set_explode(-1)
    export_glb("roof")
