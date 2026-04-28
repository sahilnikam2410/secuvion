"""
Generate a VRIKAAN ACADEMY badge to replace the old SECUVION ACADEMY shield.
Used on course completion + membership certificates (Welcome.jsx, Learn.jsx).
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WOLF_SOURCE = os.path.join(ROOT, "brand_assets", "wolf-clean-1024.png")
OUT_PATH = os.path.join(ROOT, "public", "images", "academy-logo.png")

SIZE = 600

# Brand
BG_DARK = (10, 15, 30)
BG_DEEP = (3, 7, 18)
WHITE = (240, 245, 255)
ACCENT = (99, 102, 241)
CYAN = (20, 227, 197)
GOLD = (218, 178, 80)

FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_REG = "C:/Windows/Fonts/segoeui.ttf"
FONT_LIGHT = "C:/Windows/Fonts/segoeuil.ttf"


def f(font_path, size):
    return ImageFont.truetype(font_path, size)


def make_badge():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 255))  # cream bg matches certificate
    d = ImageDraw.Draw(img, "RGBA")

    cx, cy = SIZE // 2, SIZE // 2

    # Outer gold ring
    d.ellipse([20, 20, SIZE - 20, SIZE - 20], outline=GOLD + (255,), width=4)
    # Inner gold ring
    d.ellipse([35, 35, SIZE - 35, SIZE - 35], outline=GOLD + (180,), width=2)

    # Dark inner circle
    d.ellipse([55, 55, SIZE - 55, SIZE - 55], fill=BG_DEEP + (255,))

    # Wolf in center
    if os.path.exists(WOLF_SOURCE):
        wolf = Image.open(WOLF_SOURCE).convert("RGBA")
        # Scale to fit
        target = 320
        ws = (target, int(target * wolf.height / wolf.width))
        wolf = wolf.resize(ws, Image.LANCZOS)
        wx = cx - wolf.width // 2
        wy = cy - wolf.height // 2 - 20
        img.alpha_composite(wolf, (wx, wy))

    # "VRIKAAN" curved at top
    d.text((cx - 100, 80), "VRIKAAN", font=f(FONT_BOLD, 48), fill=GOLD + (255,))

    # "ACADEMY" at bottom
    bbox = d.textbbox((0, 0), "ACADEMY", font=f(FONT_BOLD, 36))
    aw = bbox[2] - bbox[0]
    d.text((cx - aw // 2, SIZE - 130), "ACADEMY", font=f(FONT_BOLD, 36), fill=GOLD + (255,))

    # "EST. 2024" tiny ribbon
    d.text((cx - 45, SIZE - 80), "EST. 2024", font=f(FONT_REG, 16), fill=WHITE + (200,))

    img.save(OUT_PATH, "PNG", optimize=True)
    print(f"Saved: {OUT_PATH}  ({os.path.getsize(OUT_PATH)/1024:.1f} KB)")


if __name__ == "__main__":
    make_badge()
