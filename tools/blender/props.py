"""Moving street props: four car styles for the traffic system (public/models/cars.glb).

  blender -b --factory-startup -P tools/blender/props.py
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastlib import *
import kit

reset_scene()
m = kit.mats()
G = Geo()
SKY = json.load(open(os.path.join(WORK, "sky.json")))["sunset"]
paint = M("carpaint", "#c9ccd0", rough=0.3, metal=0.55)
for i, style in enumerate(("sedan", "suv", "pickup", "van")):
    with G.group(f"car_{style}", bake="vc", pivot=(i * 14.0, 0, 0), len=kit.CAR_STYLES[style]["L"]):
        with G.at((i * 14.0, 0, 0)):
            kit.car(G, m, style, paint)
with G.group("ground", bake="none"):
    G.box(m["asphalt"], (80, 30, 0.2), at=(20, 0, -0.1))
objs = G.finish()
set_world_hdri(os.path.join(DOWNLOADS, "hdri", "industrial_sunset_puresky_4k.hdr"), strength=1.0, rot_z=SKY["rot_z"])
if arg("--preview"):
    render_preview("cars", (8, -11, 3.2), (20, 0, 0.6), fov=45, res=(1280, 520), samples=32)
bake_vertex(samples=128)
export_glb("cars", [o for o in bpy.context.scene.objects if o.get("group", "").startswith("car_") or (o.type == "EMPTY" and o.name.startswith("car_"))])
