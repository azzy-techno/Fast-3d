"""Bake the ground, sky, architectural finishes and static shadows for the tour.
Run from the repository root with Python, NumPy and Pillow.
"""

import json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from pathlib import Path

out = Path("public/assets/exterior/optimized")
out.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(2208)
w, h = 1536, 768
x, y = np.meshgrid(np.arange(w) / w, np.arange(h) / h)
raw = np.asarray(
    Image.open(out / "ground-asphalt.webp").convert("L").resize((w, h)), float
)
grain = (raw - raw.mean()) * 0.4
track = sum(
    np.exp(-(((y - c - 0.003 * np.sin(2 * np.pi * x)) / 0.035) ** 2))
    for c in [0.15, 0.34, 0.65, 0.84]
)
base = 71 + grain - 10 * track + 6 * np.cos(2 * np.pi * y) ** 16
paint = (
    sum((abs(y - c) < 0.004) for c in [0.052, 0.948])
    * (0.45 + 0.48 * rng.random((h, w)))
    * (raw > np.percentile(raw, 20))
)
img = np.stack([base * 1.03, base, base * 0.96], -1)
img = img * (1 - paint[:, :, None]) + np.array([207, 195, 151]) * paint[:, :, None]
Image.fromarray(np.uint8(img.clip(0, 255))).save(out / "boulevard.webp", quality=85)
# Periodic multiscale cloud field with a low sun at the scene light's azimuth.
w, h = 1536, 768
u, v = np.meshgrid(np.arange(w) / w, np.arange(h) / h)


def field(n, m):
    a = rng.integers(0, 255, (m, n), dtype=np.uint8)
    tiled = Image.fromarray(np.tile(a, (3, 3))).resize(
        (3 * w, 3 * h), Image.Resampling.BICUBIC
    )
    return np.asarray(tiled.crop((w, h, 2 * w, 2 * h)), float) / 255


e = np.clip((0.5 - v) * np.pi, 0, 1.57)
air = np.exp(-2.7 * e)
sky = (
    np.array([68, 117, 166])
    + (np.array([212, 201, 182]) - np.array([68, 117, 166])) * air[:, :, None]
)
n = (
    0.47 * field(12, 11)
    + 0.28 * field(36, 29)
    + 0.16 * field(90, 64)
    + 0.09 * field(250, 152)
)
cloud = np.clip((n - 0.48) * 3.7, 0, 1) * np.clip(e * 5, 0, 1) * np.exp(-0.9 * e)
sky = sky * (1 - cloud[:, :, None]) + np.array([239, 222, 197]) * cloud[:, :, None]
# SphereGeometry maps azimuth u to (-cos(2pi*u),sin(2pi*u)).
sun = np.maximum(
    0,
    np.cos(e) * np.cos(0.53) * np.cos(2 * np.pi * (u - 0.127))
    + np.sin(e) * np.sin(0.53),
)
sky += (
    np.array([46, 36, 20]) * sun[:, :, None] ** 18
    + np.array([78, 76, 69]) * sun[:, :, None] ** 18000
)
Image.fromarray(np.uint8(sky.clip(0, 255))).save(out / "coastal-sky.webp", quality=90)
im = Image.new("RGBA", (128, 128))
pix = im.load()
for j in range(128):
    for i in range(128):
        r = ((i - 63.5) / 64) ** 2 + ((j - 63.5) / 64) ** 2
        pix[i, j] = (30, 32, 34, int(140 * max(0, 1 - r) ** 2))
im.save(out / "contact.webp", lossless=True)

# Orthographic sun projection in site coordinates, including the FAST tower.
# This single alpha atlas keeps buildings grounded when live shadows are disabled.
blocks = json.loads(Path("src/data/cityBlocks.json").read_text()) + [
    [0, -1, 32, 19, 83]
]
mask = Image.new("L", (1024, 1024))
draw = ImageDraw.Draw(mask)
for x, z, w, d, h in blocks:
    left, right = x - w / 2, x + w / 2
    front, back = z + d / 2, z - d / 2
    dx, dz = 76 * h / 64, -78 * h / 64
    hull = [
        (left, front),
        (right, front),
        (right + dx, front + dz),
        (right + dx, back + dz),
        (left + dx, back + dz),
        (left, back),
    ]
    draw.polygon(
        [((px + 256) * 1024 / 480, (pz + 408) * 1024 / 480) for px, pz in hull],
        fill=255,
    )
shade = Image.new("RGBA", mask.size, "white")
shade.putalpha(mask.filter(ImageFilter.GaussianBlur(2)))
shade.save(out / "district-shade.webp", lossless=True)

# The tiled finish and diffuse daylight bake use separate UV sets in the rooms.
size = 512
gy, gx = np.indices((size, size))
stone = 199 + (rng.random((size, size)) - 0.5) * 12
grout = np.where((gx < 2) | (gy < 2), 0.82, 1)
out_interior = Path("public/assets/architecture")
out_interior.mkdir(parents=True, exist_ok=True)
Image.fromarray(
    np.uint8(
        np.stack([(stone + 8) * grout, (stone + 5) * grout, (stone - 5) * grout], -1)
    )
).save(out_interior / "terrazzo.webp", quality=86)
z, x = np.meshgrid(
    np.linspace(-10.5, 8.5, size), np.linspace(-15.5, 15.5, size), indexing="ij"
)
edge = np.minimum(15.5 - abs(x), np.minimum(z + 10.5, 8.5 - z))
bounce = 0.8 + 0.2 * (1 - np.exp(-np.maximum(edge, 0) * 2.5))
daylight = np.exp(-(((z - 5) / 4) ** 2))
mullions = np.exp(-((np.sin(np.pi * (x + 0.38 * (8.5 - z)) / 2.5) / 0.22) ** 2))
ao = (bounce - 0.17 * daylight * mullions - 0.15 * (1 - daylight)) * 255
Image.fromarray(np.uint8(np.clip(ao, 0, 255))).save(
    out_interior / "gallery-daylight.webp", quality=88
)
