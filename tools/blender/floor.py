"""Shared gallery floor shell for levels 01-08 (public/models/floor.glb, lm_floor, env_floor).

  blender -b --factory-startup -P tools/blender/floor.py -- [--preview] [--nobake] [--fast]
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastlib import *
import kit, eq, building as B, gallery as GA

reset_scene()
m = eq.emats(kit.mats())
G = Geo()
SKY = json.load(open(os.path.join(WORK, "sky.json")))["sunset"]
GA.gallery(G, m)
objs = G.finish()
GA.gallery_lighting(SKY["rot_z"], os.path.join(DOWNLOADS, "hdri", "industrial_sunset_puresky_4k.hdr"))
if arg("--preview"):
    render_preview("floor_arrive", (B.LIFT_X + 0.4, 12.9, 1.66), (2.5, 6.4, 1.5), fov=56, res=(1120, 630), samples=40)
    render_preview("floor_lift", (-4.3, 10.6, 1.66), (-5.4, 14.0, 1.75), fov=52, res=(1120, 630), samples=40)
if not arg("--nobake"):
    fast = arg("--fast")
    render_env("floor", (3.0, 8.0, 1.7), samples=64)
    bake_lightmap("lm_floor", size=1024 if fast else 2048, samples=48 if fast else 256)
    bake_vertex(samples=32 if fast else 192)
    export_glb("floor")
