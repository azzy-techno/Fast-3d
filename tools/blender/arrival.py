"""Arrival: the street, plaza, FAST Tower exterior and the ground-floor reception.

  blender -b --factory-startup -P tools/blender/arrival.py -- [--preview] [--nobake] [--fast]
"""
import sys, os, json, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastlib import *
import kit, building as B

reset_scene()
m = kit.mats()
G = Geo()
SKY = json.load(open(os.path.join(WORK, "sky.json")))["sunset"]

KERB_Y = -18.0        # plaza / near kerb
ROAD_W = 7.2
MED_W = 2.4
FAR_KERB_Y = KERB_Y - 2 * ROAD_W - MED_W     # -34.8
ROAD_Z = -0.15
XR = 110.0            # half-length of the modelled street

# ----------------------------------------------------------------------------- ground (lightmapped)
with G.group("ground", bake="lm", lm="lm_arrival"):
    G.box(m["asphalt"], (2 * XR, 2 * ROAD_W + MED_W + 0.4, 0.3), at=(0, (KERB_Y + FAR_KERB_Y) / 2, ROAD_Z - 0.15))
    # plaza and pavements
    G.box(m["paving"], (2 * XR, -KERB_Y + 0.4, 0.3), at=(0, KERB_Y / 2 + 0.2, -0.15))
    G.box(m["paving"], (2 * XR, 7.0, 0.3), at=(0, FAR_KERB_Y - 3.5, -0.15))
    G.box(m["paving"], (2 * XR, 40, 0.3), at=(0, B.D + 20, -0.15))
    for sx in (-1, 1):
        G.box(m["paving"], (XR - B.W / 2, B.D, 0.3), at=(sx * (B.W / 2 + (XR - B.W / 2) / 2), B.D / 2, -0.15))
    # kerbs
    for y in (KERB_Y, FAR_KERB_Y):
        G.box(m["kerb"], (2 * XR, 0.3, 0.2), at=(0, y, -0.06), bevel=0.02)
    my = (KERB_Y + FAR_KERB_Y) / 2
    G.box(m["kerb"], (2 * XR, MED_W, 0.24), at=(0, my, -0.05), bevel=0.03)
    # plaza inlay: darker stone strip leading to the entrance
    G.box(m["stone_dark"], (6.0, -KERB_Y - 1.6, 0.012), at=(0, KERB_Y / 2 - 0.3, 0.006))
    for sx in (-1, 1):
        G.box(m["steel"], (0.06, -KERB_Y - 1.6, 0.014), at=(sx * 3.05, KERB_Y / 2 - 0.3, 0.008))

# road markings (vertex baked, tiny)
with G.group("markings", bake="vc"):
    for lane_y in (KERB_Y - ROAD_W / 2, FAR_KERB_Y + ROAD_W / 2):
        x = -XR + 2
        while x < XR - 2:
            if not (-5.5 < x + 1.5 < 5.5):
                G.box(m["paint"], (3.0, 0.14, 0.012), at=(x + 1.5, lane_y, ROAD_Z + 0.006))
            x += 8.0
    for y in (KERB_Y - ROAD_W + 0.25, FAR_KERB_Y + ROAD_W - 0.25):
        G.box(m["paint_y"], (2 * XR - 4, 0.12, 0.012), at=(0, y, ROAD_Z + 0.006))
    # zebra crossing on the entrance axis
    for cy0 in (KERB_Y - ROAD_W + 0.5, FAR_KERB_Y + 0.4):
        for i in range(8):
            G.box(m["paint"], (0.55, ROAD_W - 0.9, 0.012), at=(-3.6 + i * 1.03, cy0 + (ROAD_W - 0.9) / 2, ROAD_Z + 0.006))
    for sy, x in ((KERB_Y - ROAD_W / 2 - 1.75, -6.2), (FAR_KERB_Y + ROAD_W / 2 + 1.75, 6.2)):
        G.box(m["paint"], (0.4, ROAD_W / 2 - 0.4, 0.012), at=(x, sy + (0 if sy > my else 0), ROAD_Z + 0.006))

# ----------------------------------------------------------------------------- tower + lobby
with G.group("tower", bake="vc"):
    B.tower_exterior(G, m)
B.lobby(G, m)

# ----------------------------------------------------------------------------- plaza
rnd = random.Random(3)
# palms flanking the entrance axis
for i, (px, py) in enumerate([(-7.5, -5.5), (7.5, -5.5), (-7.5, -12.5), (7.5, -12.5), (-16, -9), (16, -9), (-25, -6), (25, -6)]):
    with G.at((px, py, 0)):
        kit.planter(G, m, (2.2, 2.2, 0.5), "palm", seed=i, h=rnd.uniform(6.5, 8.5))
# reflecting pool with jets on the left
with G.at((-17.5, -13.5, 0)):
    G.box(m["stone_dark"], (9.0, 4.4, 0.36), at=(0, 0, 0.18), bevel=0.03)
    with G.group("pool", bake="none"):
        G.plane(m["water"], (8.5, 3.9), at=(0, 0, 0.365), sub=(1, 1))
    for i in range(5):
        G.cyl(m["steel"], 0.035, 0.1, at=(-3.2 + i * 1.6, 0, 0.4), seg=8)
        G.marker("jet", f"jet{i}", (-3.2 + i * 1.6, 0, 0.45))
# monument sign
with G.at((22.5, -14.5, 0), rz=-12):
    G.box(m["stone_dark"], (4.6, 0.5, 2.6), at=(0, 0, 1.3), bevel=0.03)
    G.box(m["led_blue"], (4.6, 0.04, 0.05), at=(0, -0.26, 0.2))
    with G.group("sign_totem", bake="none"):
        G.plane(m["sign_logo"], (3.6, 1.07), at=(0, -0.26, 1.55), rot=(90, 0, 0), uvfit=True)
# benches and bins
for bx, by, rz in ((-12, -3.2, 0), (12, -3.2, 0), (10.5, -15.5, 90), (-26, -12, 90)):
    with G.at((bx, by, 0), rz=rz):
        kit.bench(G, m)
for bx, by in ((-4.6, -16.6), (14.5, -3.4)):
    with G.at((bx, by, 0)):
        kit.bin_(G, m)
# bollards along the kerb
x = -30.0
while x <= 30.0:
    if abs(x) > 3.2:
        with G.at((x, KERB_Y + 0.9, 0)):
            kit.bollard(G, m)
    x += 2.5
# flags
for i, fx in enumerate((14.0, 16.4, 18.8)):
    with G.at((fx, -13.5, 0)):
        kit.flagpole(G, m, 9.5, phase=i * 0.7)
# long shrub beds along the facade
for sx in (-1, 1):
    with G.at((sx * 12.0, -1.6, 0)):
        kit.planter(G, m, (9.0, 1.2, 0.45), "shrub", seed=20 + sx)

# ----------------------------------------------------------------------------- street
my = (KERB_Y + FAR_KERB_Y) / 2
x = -XR + 6
i = 0
while x < XR - 4:
    with G.at((x, my, 0.07)):
        if i % 2 == 0:
            kit.lamp_post(G, m, 9.5, arms=2)
        else:
            kit.palm(G, m, h=rnd.uniform(6.0, 8.0), seed=40 + i)
    with G.at((x + 6.0, my, 0.07)):
        kit.hedge(G, m, 7.0, 1.0, 0.6)
    x += 12.0
    i += 1
x = -XR + 12
while x < XR - 4:
    if abs(x) > 34:
        with G.at((x, 4.0, 0)):
            kit.lamp_post(G, m, 8.0, arms=1)
    with G.at((x + 6, FAR_KERB_Y - 1.2, 0), rz=180):
        kit.lamp_post(G, m, 8.0, arms=1)
    x += 24.0
with G.at((-9.5, KERB_Y + 0.6, 0)):
    kit.traffic_light(G, m)
with G.at((9.5, FAR_KERB_Y - 0.6, 0), rz=180):
    kit.traffic_light(G, m)
# parked cars
paints = [M("car_white", "#e8e9ea", rough=0.28, metal=0.3), M("car_graphite", "#2c3036", rough=0.3, metal=0.7),
          M("car_sand", "#b8a98a", rough=0.32, metal=0.6), M("car_blue", "#1f4f86", rough=0.3, metal=0.6)]
for px, style, pi in ((-36, "suv", 0), (-29.5, "sedan", 1), (31, "pickup", 0), (37.5, "sedan", 2), (44, "suv", 3)):
    with G.at((px, 3.4, 0), rz=180 if px < 0 else 0):
        kit.car(G, m, style, paints[pi], lights=False)

# ----------------------------------------------------------------------------- camera shots, stands, hotspots
G.shot("street", (-17.0, FAR_KERB_Y - 2.6, 1.5), (-1.0, 0, 29.0), fov=62)
G.shot("cross", (-9.0, KERB_Y - 6.0, 2.6), (1.0, 0, 15.0), fov=56)
G.shot("plaza", (-5.5, -13.5, 1.75), (1.2, 0, 4.2), fov=52)
G.shot("doors", (-0.6, -3.8, 1.68), (2.5, 8, 2.0), fov=54)
G.shot("reception", (0.8, 3.4, 1.66), (8.6, 10.6, 1.45), fov=50)
G.shot("liftwalk", (-0.5, 8.6, 1.66), (-7.0, 13.5, 1.5), fov=50)
G.shot("lift", (B.LIFT_X + 0.15, 9.7, 1.66), (B.LIFT_X + 0.15, 15.0, 1.5), fov=50)
G.stand("reception", (9.3, 7.5, 0), (0.8, 3.4, 1.6))
G.stand("lift", (B.LIFT_X + 1.75, 12.7, 0), (B.LIFT_X + 0.15, 9.7, 1.6))
G.hotspot("tower", (-6.0, -0.8, 30.0))
G.hotspot("entrance", (0.0, -1.0, 3.2))
G.hotspot("desk", (9.6, 9.9, 1.3))
G.hotspot("lift", (B.LIFT_X, 13.9, 2.9))

objs = G.finish()

# ----------------------------------------------------------------------------- lighting
set_world_hdri(os.path.join(DOWNLOADS, "hdri", "industrial_sunset_puresky_4k.hdr"), strength=1.0, rot_z=SKY["rot_z"])
sd = Vector(SKY["sun_dir"])
# a low warm key along the HDRI sun direction, lifted a little so the plaza is not all shadow
key = Vector((sd.x, sd.y, max(sd.z, 0.2))).normalized()
add_sun(-key, strength=2.2, color=(1.0, 0.72, 0.5), angle=3.0)
# lobby fill (the emissive strips alone would be noisy)
for i in range(5):
    add_area((-12 + i * 6.0, 6.6, 6.9), (0.6, 6.0), 260, color=(1.0, 0.86, 0.68), rot=(0, 0, 0))
add_area((9.6, 10.2, 5.6), 2.4, 220, color=(1.0, 0.85, 0.65), rot=(0, 0, 0))
add_area((B.LIFT_X, 15.3, 2.6), 1.4, 60, color=(1.0, 0.9, 0.75), rot=(0, 0, 0))
add_area((0, -3.9, 4.25), (9.0, 4.4), 220, color=(1.0, 0.84, 0.62), rot=(0, 0, 0))

if arg("--preview"):
    for name, pos, tgt, fov in (("arr_street", (-17.0, FAR_KERB_Y - 2.6, 1.5), (-1.0, 0, 29.0), 62),
                                 ("arr_plaza", (-5.5, -13.5, 1.75), (1.2, 0, 4.2), 52),
                                 ("arr_reception", (0.8, 3.4, 1.66), (8.6, 10.6, 1.45), 50),
                                 ("arr_lift", (B.LIFT_X + 0.15, 9.7, 1.66), (B.LIFT_X + 0.15, 15.0, 1.5), 50)):
        render_preview(name, pos, tgt, fov=fov, res=(1120, 630), samples=40)

if arg("--poster"):
    render_still("poster", (-17.0, FAR_KERB_Y - 2.6, 1.5), (-1.0, 0, 29.0), fov=62, res=(1920, 1200), samples=160)

if not arg("--nobake"):
    render_env("lobby", (0.5, 6.5, 1.7), samples=64)
    fast = arg("--fast")
    bake_lightmap("lm_arrival", size=1024 if fast else 2048, samples=32 if fast else 160)
    bake_lightmap("lm_lobby", size=1024 if fast else 2048, samples=48 if fast else 256)
    bake_vertex(samples=32 if fast else 192)
    export_glb("arrival")
