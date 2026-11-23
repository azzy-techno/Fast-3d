"""Synthetic displays for the digital manufacturing gallery, with FAST's partner marks."""

import math
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

panels = [
    ("meta-2i", "Shop-floor capture", "PARTS COUNTED", "0128", "trend"),
    ("meta-2i", "ERP integration", "PRODUCTION ORDER", "WO-204", "flow"),
    ("meta-smart-factory", "APS / supply planning", "SCHEDULE", "SHIFT A", "gantt"),
    ("meta-smart-factory", "MES / equipment effectiveness", "OEE", "84%", "bars"),
    ("meta-smart-factory", "Industrial IoT", "MACHINE SIGNAL", "ONLINE", "trend"),
    ("automassist", "Industrial documents", "PLANT KNOWLEDGE", "P-021", "flow"),
    ("automassist", "Operations context", "PLC / DOCUMENTS / ERP", "LINKED", "flow"),
    ("manwinwin", "Asset register", "PUMP ASSET", "P-021", "rows"),
    ("manwinwin", "Preventive maintenance", "WORK ORDER", "PM-048", "gantt"),
    (
        "godrej-infotech",
        "Enterprise resource planning",
        "STOCK RECEIPT",
        "A-108",
        "rows",
    ),
    ("godrej-infotech", "Digital transformation", "FIELD APPROVAL", "SYNCED", "flow"),
    ("greenovative", "Energy monitoring", "LOAD PROFILE", "48 kW", "trend"),
    ("greenovative", "Energy optimisation", "DEMAND BY SHIFT", "SHIFT B", "bars"),
    ("greenovative", "Sustainability tracking", "NET-ZERO MONITOR", "TREND", "trend"),
    ("fast", "Safety-line detection", "ZONE OBSERVATION", "PERSON", "vision"),
    ("fast", "Vehicle presence", "ZONE OBSERVATION", "FORKLIFT", "vision"),
]
size = 384
atlas = Image.new("RGB", (size * 4, size * 4))
titlefont = ImageFont.truetype("DejaVuSansCondensed-Bold.ttf", 23)
valuefont = ImageFont.truetype("DejaVuSansCondensed-Bold.ttf", 34)
mono = ImageFont.truetype("DejaVuSansMono.ttf", 15)
for i, (partner, title, label, value, kind) in enumerate(panels):
    tile = Image.new("RGB", (size, size), "#152c37")
    d = ImageDraw.Draw(tile)
    d.rectangle((0, 0, 383, 78), fill="#eff2ee")
    if partner != "fast":
        logo = Image.open(
            Path("public/assets/about/partners") / (partner + ".png")
        ).convert("RGBA")
        logo.thumbnail((257, 62))
        tile.paste(logo, (17, (79 - logo.height) // 2), logo)
    else:
        d.text((18, 22), "FAST  /  COMPUTER VISION", font=titlefont, fill="#14384c")
    d.text((16, 94), title, font=titlefont, fill="#f5ead3")
    d.text((17, 132), label, font=mono, fill="#92d4c8")
    d.text((17, 159), value, font=valuefont, fill="white")
    if kind in ("trend", "bars", "gantt"):
        for j in range(4):
            d.line((20, 219 + 28 * j, 357, 219 + 28 * j), fill="#39505b", width=2)
        if kind == "trend":
            d.line(
                [
                    (
                        20 + j * 24,
                        270 + int(21 * math.sin(j * 0.9 + i) + 9 * math.cos(j * 2.1)),
                    )
                    for j in range(15)
                ],
                fill="#69cfc0",
                width=5,
            )
        elif kind == "bars":
            for j in range(8):
                d.rectangle(
                    (25 + j * 41, 301 - (j * 23 + i * 7) % 76, 46 + j * 41, 311),
                    fill=("#dec391", "#6bbcae")[j % 2],
                )
        else:
            for j in range(4):
                d.rounded_rectangle(
                    (25 + j * 43, 214 + j * 27, 147 + j * 58, 227 + j * 27),
                    radius=5,
                    fill=("#75c5b6", "#dcba86")[j % 2],
                )
    elif kind == "vision":
        d.polygon([(19, 316), (135, 215), (265, 215), (355, 316)], fill="#536970")
        d.line((56, 315, 140, 217), fill="#e8bd67", width=5)
        d.rectangle(
            (154, 232, 219 if i == 14 else 292, 292), outline="#84ddc6", width=4
        )
    else:
        for j, term in enumerate(
            (
                ["SOURCE", "REVIEW", "RECORD"]
                if kind == "flow"
                else ["ASSET", "STATUS", "HISTORY"]
            )
        ):
            y = 216 + j * 36
            d.rectangle((18, y, 358, y + 27), fill="#284550")
            d.ellipse((25, y + 8, 34, y + 17), fill="#83c4ad")
            d.text((48, y + 3), term, font=mono, fill="#e7e7d8")
    d.line((17, 335, 365, 335), fill="#6f9d9c", width=2)
    d.text((18, 348), "ILLUSTRATIVE DATA   /   FAST", font=mono, fill="#b1c5c1")
    atlas.paste(tile, ((i % 4) * size, (i // 4) * size))
atlas.save(sys.argv[1])
