"""Turn the Poly Haven HDRIs into the runtime sky dome + reflection images, already rotated so the sun
sits where the scenes expect it. Prints the world rotation and sun direction used by the scene scripts.

  blender -b --factory-startup -P tools/blender/sky.py
Outputs (PNG, converted to WebP by tools/pack-sky.mjs): _work/sky_<name>.png (4096 x 1152, zenith to -9 deg)
and _work/env_<name>.png (1024 x 512 full equirect in three.js orientation), plus _work/sky.json.
"""
import sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastlib import *
import numpy as np

# Where the sun should stand in the Blender world (direction from the scene towards the sun).
# The tower entrance faces -Y; the sun sits low behind the visitor's left shoulder.
SUN_AZ = math.degrees(math.atan2(-1.0, -0.42))

SKIES = {
    "sunset": dict(file="industrial_sunset_puresky_4k.hdr", exposure=0.44),
    "dusk": dict(file="qwantani_dusk_2_puresky_4k.hdr", exposure=0.62),
}


def tonemap(x, exposure):
    x = x * exposure
    l = (x @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32))[..., None]
    x = np.maximum(l + (x - l) * 1.18, 0.0)      # a little more saturation than the raw HDRI
    y = 1.0 - np.exp(-x * 1.25)
    y = np.clip(y, 0, 1) ** (1 / 2.2)
    return np.clip(y + 0.10 * np.sin((y - 0.5) * math.pi) * 0.5, 0, 1)  # gentle S-curve


def save_png(arr, path):
    h, w, _ = arr.shape
    img = bpy.data.images.new("out", w, h, alpha=False)
    img.colorspace_settings.name = "Non-Color"
    o = np.ones((h, w, 4), dtype=np.float32)
    o[:, :, :3] = arr
    img.pixels.foreach_set(o.ravel())
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)


reset_scene()
info = {}
for name, cfg in SKIES.items():
    img = bpy.data.images.load(os.path.join(DOWNLOADS, "hdri", cfg["file"]))
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(h, w, 4)[:, :, :3]          # row 0 = bottom (nadir)
    lum = px @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    # sun = brightest 0.02 % of the upper hemisphere, centroid
    up = lum[h // 2:, :]
    thr = np.quantile(up, 0.9998)
    ys, xs = np.nonzero(up >= thr)
    ang = xs / w * 2 * math.pi
    cx = math.atan2(np.sin(ang).mean(), np.cos(ang).mean()) % (2 * math.pi)
    sun_u = cx / (2 * math.pi)
    sun_v = (ys.mean() + h // 2) / h
    elev = (sun_v - 0.5) * 180.0
    # Blender equirect: u = 0.5 - az / 360 (az measured from +X towards +Y)
    az_img = (0.5 - sun_u) * 360.0
    theta = az_img - SUN_AZ                      # world mapping rotation (deg) for the bake
    # three.js equirect is u3 = 0.5 - az / 360 as well, so F(u3) = I(u3 - theta / 360)
    shift = int(round(theta / 360.0 * w))
    rolled = np.roll(px, shift, axis=1)
    ldr = tonemap(rolled, cfg["exposure"])
    top = int(h * (0.5 - 9.0 / 180.0))           # keep zenith .. -9 degrees
    dome = ldr[top:, :, :]
    save_png(dome, os.path.join(WORK, f"sky_{name}.png"))
    # reflection map: quarter size, lower hemisphere replaced by a soft ground tone taken from the horizon
    step = w // 1024
    env = ldr[::step, ::step, :].copy()
    eh = env.shape[0]
    horizon = env[eh // 2: eh // 2 + 6, :, :].mean(axis=(0, 1))
    ground = horizon * np.array([0.42, 0.40, 0.38])
    for r in range(eh // 2):
        t = 1.0 - r / (eh / 2)                   # 0 at horizon .. 1 at nadir (rows below the horizon)
        k = min(1.0, t * 6.0)
        env[eh // 2 - 1 - r, :, :] = env[eh // 2, :, :] * (1 - k) + ground * k
    save_png(env, os.path.join(WORK, f"env_{name}.png"))
    sun_dir = (math.cos(math.radians(SUN_AZ)) * math.cos(math.radians(elev)),
               math.sin(math.radians(SUN_AZ)) * math.cos(math.radians(elev)),
               math.sin(math.radians(elev)))
    # mean colours for the runtime rig that lights moving objects
    upper = rolled[int(h * 0.6):, :, :].mean(axis=(0, 1))
    info[name] = dict(rot_z=theta, sun_dir=sun_dir, elev=elev, sky=[float(c) for c in upper],
                      horizon=[float(c) for c in rolled[h // 2: h // 2 + 20].mean(axis=(0, 1))],
                      sun_peak=float(lum.max()))
    log(name, json.dumps(info[name]))
with open(os.path.join(WORK, "sky.json"), "w") as f:
    json.dump(info, f, indent=1)
