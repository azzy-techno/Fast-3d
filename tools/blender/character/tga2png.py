"""Convert images (TGA etc.) to PNG, optionally downscaled. Usage: blender -b --factory-startup -P tga2png.py -- outdir maxsize in1 in2 ..."""
import bpy, sys, os
argv = sys.argv[sys.argv.index("--") + 1:]
outdir, maxsize = argv[0], int(argv[1])
os.makedirs(outdir, exist_ok=True)
for p in argv[2:]:
    img = bpy.data.images.load(p)
    w, h = img.size
    print(os.path.basename(p), w, h, img.channels, img.depth)
    if max(w, h) > maxsize:
        s = maxsize / max(w, h)
        img.scale(int(w * s), int(h * s))
    img.file_format = 'PNG'
    img.filepath_raw = os.path.join(outdir, os.path.splitext(os.path.basename(p))[0] + ".png")
    img.save()
