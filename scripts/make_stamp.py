"""
Generate a 'VRIKAAN ACADEMY' circular stamp/seal to replace the old
SECUVION ACADEMY stamp at public/images/stamp.png.

Used on certificates + dashboard credentials. Vintage rubber-stamp look:
double-ring border, curved text along the rings, central shield with
the wolf logo inside.
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WOLF = os.path.join(ROOT, "brand_assets", "wolf-clean-1024.png")
OUT = os.path.join(ROOT, "public", "images", "stamp.png")

SIZE = 600
CX = CY = SIZE // 2
INK = (28, 50, 130, 255)  # vintage navy ink

FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_REG = "C:/Windows/Fonts/segoeui.ttf"


def draw_arc_text(canvas, text, font_size, radius, start_angle_deg, end_angle_deg, font_path=FONT_BOLD, color=INK, bottom=False):
    """Render text along a circular arc.

    bottom=False: top arc — characters face outward (tangent), upright at top.
    bottom=True:  bottom arc — characters flipped 180deg so they read upright
                  when viewed normally instead of upside-down.
    """
    font = ImageFont.truetype(font_path, font_size)
    n = len(text)
    if n == 0:
        return
    start = math.radians(start_angle_deg)
    end = math.radians(end_angle_deg)
    total_angle = end - start
    angle_per_char = total_angle / max(n - 1, 1)

    for i, ch in enumerate(text):
        angle = start + angle_per_char * i
        x = CX + radius * math.cos(angle)
        y = CY + radius * math.sin(angle)

        bbox = font.getbbox(ch)
        ch_w = bbox[2] - bbox[0]
        ch_h = bbox[3] - bbox[1]
        layer = Image.new("RGBA", (ch_w + 4, ch_h + 4), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        d.text((-bbox[0] + 2, -bbox[1] + 2), ch, font=font, fill=color)
        # Top: characters face outward (radial outward = upright at 12 o'clock)
        # Bottom: flip 180deg so text reads upright instead of being upside-down
        if bottom:
            rot_deg = -math.degrees(angle) + 90
        else:
            rot_deg = -math.degrees(angle) - 90
        rotated = layer.rotate(rot_deg, resample=Image.BICUBIC, expand=True)
        canvas.alpha_composite(rotated, (int(x - rotated.width / 2), int(y - rotated.height / 2)))


def main():
    img = Image.new("RGBA", (SIZE, SIZE), (252, 250, 246, 255))  # cream parchment
    d = ImageDraw.Draw(img)

    # Outer thick ring
    d.ellipse([20, 20, SIZE - 20, SIZE - 20], outline=INK, width=8)
    # Inner ring
    d.ellipse([45, 45, SIZE - 45, SIZE - 45], outline=INK, width=2)

    # Curved text — top arc: 'VRIKAAN ACADEMY'
    draw_arc_text(img, "VRIKAAN  ACADEMY", font_size=42, radius=240,
                  start_angle_deg=210, end_angle_deg=330)

    # Curved text — bottom arc: tagline (reads upright thanks to bottom=True)
    draw_arc_text(img, "EMPOWERING DEFENDERS FOR A SAFER DIGITAL FUTURE",
                  font_size=16, radius=240,
                  start_angle_deg=160, end_angle_deg=20,
                  bottom=True)

    # Central shield (geometric)
    # Shield outline
    s = 90
    shield_pts = [
        (CX - s, CY - int(s * 0.95)),
        (CX,       CY - int(s * 1.08)),
        (CX + s,   CY - int(s * 0.95)),
        (CX + s,   CY + int(s * 0.05)),
        (CX + int(s * 0.6), CY + int(s * 0.65)),
        (CX,       CY + int(s * 0.95)),
        (CX - int(s * 0.6), CY + int(s * 0.65)),
        (CX - s,   CY + int(s * 0.05)),
    ]
    d.polygon(shield_pts, outline=INK, width=4, fill=None)

    # Wolf inside shield (smaller, ink-tinted)
    if os.path.exists(WOLF):
        wolf = Image.open(WOLF).convert("RGBA")
        # Tighter crop on the head
        ww, wh = wolf.size
        wolf = wolf.crop((int(ww * 0.10), int(wh * 0.04),
                           int(ww * 0.90), int(wh * 0.62)))
        # Tint to ink color while preserving transparency
        tinted = Image.new("RGBA", wolf.size, (0, 0, 0, 0))
        px_in = wolf.load()
        px_out = tinted.load()
        for y in range(wolf.height):
            for x in range(wolf.width):
                r, g, b, a = px_in[x, y]
                if a > 0:
                    brightness = max(r, g, b) / 255
                    final_a = int(a * (0.25 + brightness * 0.75))
                    px_out[x, y] = (INK[0], INK[1], INK[2], final_a)
        # Resize and place inside shield
        target = 130
        ratio = target / max(tinted.size)
        new_size = (int(tinted.width * ratio), int(tinted.height * ratio))
        tinted = tinted.resize(new_size, Image.LANCZOS)
        img.alpha_composite(tinted, (CX - tinted.width // 2, CY - tinted.height // 2 - 14))

    # 'EST. 2024' inside ribbon area at the bottom of shield
    f_est = ImageFont.truetype(FONT_BOLD, 16)
    bbox = d.textbbox((0, 0), "EST. 2024", font=f_est)
    tw = bbox[2] - bbox[0]
    d.text((CX - tw // 2, CY + 60), "EST. 2024", font=f_est, fill=INK)

    # Decorative stars on left/right of top text
    star_font = ImageFont.truetype(FONT_BOLD, 22)
    d.text((CX - 220, CY - 232), "*", font=star_font, fill=INK)
    d.text((CX + 200, CY - 232), "*", font=star_font, fill=INK)

    # Distress effect — slight rotation + simulated stamp imperfection by fading edges
    # (skip for now — keeps it crisp + readable)

    img.save(OUT, "PNG", optimize=True)
    print(f"Saved: {OUT}  ({os.path.getsize(OUT)/1024:.1f} KB)")


if __name__ == "__main__":
    main()
