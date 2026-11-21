"""Draw original instrument legends on one shared texture, using Pillow."""

import sys
from PIL import Image, ImageDraw, ImageFont

CELL = 256
atlas = Image.new("RGB", (CELL * 4, CELL * 4), "#dce1db")
tile = Image.new("RGB", (CELL, CELL))
draw = ImageDraw.Draw(tile)


def label(x, y, words, size, color):
    font = ImageFont.truetype("DejaVuSans.ttf", size)
    draw.text((x, y), words, font=font, fill=color)


def line(points, color, width=4):
    draw.line(points, fill=color, width=width)


def lcd(x, y, w, h, value):
    draw.rectangle((x, y, x + w, y + h), fill="#273833")
    draw.rectangle((x + 5, y + 5, x + w - 5, y + h - 5), fill="#bed2a4")
    label(x + 10, y + 8, value, int(h * 0.50), "#24382b")


def panel(index, title, subtitle, base="#dce1db"):
    draw.rectangle((0, 0, 255, 255), fill=base)
    draw.rectangle((0, 0, 255, 46), fill="#233944")
    label(12, 8, title, 23, "white")
    label(12, 222, subtitle, 15, "#273d40")
    for x in (7, 249):
        for y in (53, 247):
            draw.ellipse((x - 2, y - 2, x + 2, y + 2), fill="#70807e")


def save(index):
    atlas.paste(tile, ((index % 4) * CELL, (index // 4) * CELL))


panel(0, "INCOMER", "AIR CIRCUIT BREAKER")
lcd(16, 65, 104, 58, "1250 A")
for x, c in [(156, "#952e2c"), (205, "#458c64")]:
    draw.rectangle((x, 70, x + 34, 108), fill=c)
label(151, 115, "O      I", 18, "#293932")
draw.rectangle((18, 151, 232, 194), fill="#324042")
label(45, 157, "DRAW-OUT UNIT", 18, "#e1dfcd")
save(0)

for i, title in [(1, "RING SWITCH"), (2, "TEE-OFF / VCB")]:
    panel(i, title, "EARTH  /  OPEN  /  CLOSED")
    line([(24, 76), (222, 76)], "#303c3e", 6)
    line([(116, 76), (116, 106)], "#303c3e", 6)
    line([(116, 135), (139, 104)], "#344144", 7)
    line([(116, 137), (116, 207)], "#344144", 6)
    line([(116, 157), (174, 157), (174, 182)], "#344144", 4)
    for j in range(3):
        line([(159 + j * 4, 183 + j * 5), (189 - j * 4, 183 + j * 5)], "#344144", 3)
    for x in (30, 197):
        draw.ellipse((x, 112, x + 24, 136), fill="#f5ce4c", outline="#3d4140", width=3)
    save(i)
panel(3, "PROTECTION", "SECONDARY INJECTION")
lcd(14, 61, 225, 57, "TRIP  0.312 s")
for j in range(3):
    for k in range(5):
        draw.rectangle(
            (25 + k * 44, 140 + j * 24, 51 + k * 44, 155 + j * 24), fill="#455662"
        )
save(3)
panel(4, "METER", "ACTIVE IMPORT   /   kWh")
lcd(20, 65, 218, 78, "001864.7")
draw.ellipse((28, 169, 44, 185), fill="#b93e34")
draw.ellipse((139, 151, 193, 205), fill="#37454b")
draw.ellipse((150, 162, 182, 194), fill="#151e23")
save(4)
panel(5, "PFC CONTROLLER", "CAPACITOR STAGES")
lcd(17, 65, 222, 69, "PF  0.98")
for k in range(6):
    draw.ellipse(
        (19 + k * 36, 161, 35 + k * 36, 177), fill="#478467" if k < 4 else "#7e8780"
    )
    label(20 + k * 36, 183, str(k + 1), 14, "#2a373c")
save(5)
panel(6, "I/O MONITOR", "LOOP CHECK  /  mA")
draw.rectangle((15, 64, 241, 202), fill="#173440")
for j in range(4):
    line([(25, 83 + j * 30), (228, 83 + j * 30)], "#536c76", 1)
for i, c in enumerate(("#8cd4b7", "#ecbc63")):
    y = 135 + i * 31
    line(
        [
            (26, y),
            (70, y),
            (70, y - 29),
            (120, y - 29),
            (120, y),
            (177, y),
            (177, y - 29),
            (230, y - 29),
        ],
        c,
        4,
    )
save(6)
panel(7, "THERMAL IMAGE", "INSPECTION   /   °C")
draw.rectangle((12, 59, 244, 207), fill="#252b7d")
for j in range(6):
    for k, c in enumerate(["#43409a", "#8150a1", "#c44c6d", "#fa813b", "#ffca56"]):
        y = 70 + j * 20
        draw.rectangle(
            (28 + k * 37, y, 55 + k * 37, y + 13), fill=c if j in (2, 3) else "#505196"
        )
draw.ellipse((150, 107, 174, 129), outline="white", width=3)
label(20, 174, "64.2 °C", 18, "white")
save(7)
atlas.save(sys.argv[1])
