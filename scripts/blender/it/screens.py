"""Rasterize sixteen exhibit screens into the gallery's shared 4-by-4 UV atlas."""

import math
import sys
from PIL import Image, ImageDraw, ImageFont

atlas = Image.new("RGB", (1536, 1536))
bold = ImageFont.truetype("DejaVuSansCondensed-Bold.ttf", 29)
body = ImageFont.truetype("DejaVuSans.ttf", 18)
mono = ImageFont.truetype("DejaVuSansMono.ttf", 15)
ink, muted, mint, gold, line = "#ebefe2", "#b1c7c7", "#69d6bf", "#f1be76", "#365965"


def chart(d, rect, values, colour):
    x, y, w, h = rect
    for row in range(4):
        yy = y + h * row / 3
        d.line((x, yy, x + w, yy), fill=line, width=2)
    d.line(
        [
            (x + i * w / (len(values) - 1), y + h * (1 - v))
            for i, v in enumerate(values)
        ],
        fill=colour,
        width=5,
    )


def rows(d, pairs):
    for i, (a, b) in enumerate(pairs):
        y = 127 + i * 52
        d.rounded_rectangle((20, y, 364, y + 40), 5, fill="#203944")
        d.text((30, y + 8), a, font=body, fill=ink)
        d.text((350, y + 9), b, font=mono, fill=mint, anchor="ra")


def frame(d, x, y, w, h):
    # Diagram of a loading bay used only as an illustrative camera feed.
    d.rectangle((x, y, x + w, y + h), fill="#47616a")
    d.polygon(
        [(x, y + h), (x + w * 0.47, y + h * 0.35), (x + w, y + h)], fill="#7e918e"
    )
    d.rectangle((x + 7, y + 9, x + w * 0.37, y + h * 0.55), fill="#889994")
    for k in range(3):
        xx = x + w * (0.47 + k * 0.15)
        d.line((xx, y + 13, xx, y + h * 0.62), fill="#c9d4c9", width=2)
    d.line((x + 8, y + 6, x + 25, y + 6), fill=mint, width=3)


titles = [
    "CAMERA REVIEW",
    "ENTRY READER",
    "PASSAGE STATUS",
    "PART INSPECTION",
    "LINK TEST",
    "RACK ENVIRONMENT",
    "SERVER CHASSIS",
    "VOICE & VIDEO",
    "SERVICE DESK",
    "FIELD WORK ORDER",
    "STOCK MOVEMENTS",
    "LINE SIGNALS",
    "ENDPOINT HEALTH",
    "LINK HANDOVER",
    "OPERATIONS WALL",
    "POWER MONITOR",
]
for i, title in enumerate(titles):
    img = Image.new("RGB", (384, 384), "#102633")
    d = ImageDraw.Draw(img)
    d.text((18, 16), "FAST   /   INDUSTRIAL ICT", font=mono, fill=mint)
    d.text((18, 47), title, font=bold, fill=ink)
    d.line((18, 95, 366, 95), fill=line, width=3)
    if i in (0, 7):
        for k in range(4 if i == 0 else 2):
            frame(d, 19 + (k % 2) * 176, 120 + k // 2 * 91, 166, 82)
        if i == 7:
            d.text((21, 237), "IP TELEPHONY   /   ONLINE", font=body, fill=mint)
    elif i == 3:
        d.ellipse((112, 121, 277, 286), fill="#96aaa8", outline=ink, width=3)
        d.ellipse((150, 159, 239, 248), fill="#172f3c")
        for k in range(6):
            a = math.tau * k / 6
            x = 195 + 64 * math.cos(a)
            y = 203 + 64 * math.sin(a)
            d.ellipse((x - 7, y - 7, x + 7, y + 7), fill="#1a3441")
        for x, y, dx, dy in [
            (89, 111, 1, 1),
            (299, 111, -1, 1),
            (89, 300, 1, -1),
            (299, 300, -1, -1),
        ]:
            d.line([(x + dx * 23, y), (x, y), (x, y + dy * 23)], fill=mint, width=4)
    elif i in (5, 11, 14, 15):
        chart(
            d,
            (24, 141, 334, 119),
            [0.36, 0.38, 0.32, 0.52, 0.48, 0.67, 0.61, 0.71, 0.76, 0.74, 0.67, 0.78],
            mint,
        )
        caption = {
            5: "TEMPERATURE   /   TREND",
            11: "ANDON   /   PRODUCTION",
            14: "LINE OVERVIEW",
            15: "UPS   /   LOAD TREND",
        }[i]
        d.text((24, 283), caption, font=body, fill=gold)
    else:
        records = {
            1: [
                ("Identity", "BADGE"),
                ("Credential", "ENROLLED"),
                ("Reader", "ONLINE"),
            ],
            2: [("Entry lane", "READY"), ("Reader", "ACTIVE")],
            4: [
                ("Copper channel", "PASS"),
                ("Fibre link", "PASS"),
                ("Record", "SAVED"),
            ],
            6: [("Storage bays", "ONLINE"), ("Power supplies", "PAIRED")],
            8: [
                ("Rack inspection", "DUE"),
                ("Device health", "REVIEWED"),
                ("Spare module", "IN STOCK"),
            ],
            9: [
                ("Work order", "WO-024"),
                ("Site visit", "RECORDED"),
                ("Field report", "SYNCED"),
            ],
            10: [
                ("Stock receipt", "POSTED"),
                ("Warehouse bin", "A-12"),
                ("Dispatch", "READY"),
            ],
            12: [
                ("Server health", "CURRENT"),
                ("Workstations", "MANAGED"),
                ("Review", "COMPLETE"),
            ],
            13: [
                ("Site survey", "FILED"),
                ("Channel test", "PASS"),
                ("Link schedule", "ISSUED"),
            ],
        }
        rows(d, records[i])
    d.line((18, 336, 366, 336), fill=line, width=2)
    d.text((18, 347), "ILLUSTRATIVE DISPLAY", font=mono, fill=muted)
    atlas.paste(img, ((i % 4) * 384, (i // 4) * 384))
atlas.save(sys.argv[1])
