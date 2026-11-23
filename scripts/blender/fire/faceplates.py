"""Printed labels and the illustrative planning board shared by the Fire exhibits."""

import sys
from PIL import Image, ImageDraw, ImageFont

image = Image.new("RGB", (1024, 1024))
draw = ImageDraw.Draw(image)
font = ImageFont.truetype("DejaVuSansCondensed-Bold.ttf", 30)
small = ImageFont.truetype("DejaVuSans.ttf", 17)
labels = [
    ("DESIGN STUDY", "DETECTION PLAN"),
    ("FIRE ALARM", "SYSTEM STATUS"),
    ("DELUGE", "WATER SUPPLY"),
    ("FOAM", "CONCENTRATE"),
    ("SPRINKLER", "SECTION"),
    ("CLEAN AGENT", "CYLINDER BANK"),
    ("FIRE PUMP", "PUMP SET"),
    ("FIRE HOSE", "REEL"),
    ("TEST LOG", "DEVICE RECORD"),
    ("INSPECTION", "SERVICE TAG"),
    ("SERVICE", "VALVE ASSEMBLY"),
    ("SERVICE LOG", "SCHEDULED VISITS"),
    ("FIELD KIT", "SERVICE SUPPORT"),
    ("EXTINGUISHER", "SERVICE SCALE"),
    ("HOSE STORE", "DELIVERY HOSE"),
    ("DETECTION", "ILLUSTRATIVE BAY"),
]
for i, (title, sub) in enumerate(labels):
    x, y = (i % 4) * 256, (i // 4) * 256
    draw.rectangle((x, y, x + 255, y + 255), fill="#224151")
    draw.rectangle((x + 6, y + 6, x + 249, y + 249), outline="#99b5ad", width=2)
    draw.rectangle((x + 14, y + 22, x + 44, y + 27), fill="#e3af62")
    draw.text((x + 14, y + 38), title, font=font, fill="#fff5dc")
    draw.text((x + 15, y + 86), sub, font=small, fill="#bfdbd3")
    if i == 0:
        draw.rectangle((x + 22, y + 124, x + 225, y + 221), outline="ivory", width=3)
        draw.line(
            [
                (x + 85, y + 124),
                (x + 85, y + 161),
                (x + 169, y + 161),
                (x + 169, y + 221),
            ],
            fill="ivory",
            width=3,
        )
        draw.line(
            [
                (x + 40, y + 193),
                (x + 40, y + 146),
                (x + 137, y + 146),
                (x + 137, y + 193),
                (x + 201, y + 193),
            ],
            fill="#e9ad6d",
            width=3,
        )
        for a, b in [(40, 193), (40, 146), (137, 146), (137, 193), (201, 193)]:
            draw.ellipse((x + a - 5, y + b - 5, x + a + 5, y + b + 5), fill="#e9ad6d")
    elif i in (8, 9, 11):
        for row in range(4):
            yy = y + 125 + row * 24
            draw.rectangle((x + 17, yy, x + 26, yy + 9), outline="ivory")
            draw.line((x + 38, yy + 4, x + 225, yy + 4), fill="#97b8b5", width=2)
    else:
        draw.line((x + 15, y + 126, x + 235, y + 126), fill="#bbbdb1", width=2)
        draw.text((x + 15, y + 173), "FAST  /  FIRE", font=small, fill="#e4c487")
image.save(sys.argv[1])
