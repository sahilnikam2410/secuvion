"""
VRIKAAN — VIGIL brand kit builder.

Renders the chosen VIGIL logo (wolf eyes peering from darkness) at every
size needed across the product:

  public/
    favicon.svg              ← already authored (vector)
    apple-touch-icon.png     ← 180×180  (iOS home screen)
    icon-192.png             ← 192×192  (Android PWA)
    icon-512.png             ← 512×512  (PWA splash)
    icon-maskable-512.png    ← 512×512  (with safe padding for masking)
    og-image.png             ← 1200×630 (Open Graph / Twitter Card)

  brand_assets/  (top-level, for social profiles)
    linkedin-profile.png     ← 400×400
    twitter-profile.png      ← 400×400
    instagram-profile.png    ← 320×320
    business-card-1024.png   ← 1024×1024
    monochrome-white.png     ← 512×512  (for dark backgrounds, no color)
    monochrome-black.png     ← 512×512  (for light backgrounds, no color)
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUBLIC = os.path.join(ROOT, "public")
ASSETS = os.path.join(ROOT, "brand_assets")
os.makedirs(ASSETS, exist_ok=True)

# Brand
BG_DEEP = (3, 7, 18)
BG_DARK = (10, 15, 30)
BG_DARK2 = (15, 22, 45)
WHITE = (255, 255, 255)
INK = (10, 15, 30)
MUTED = (148, 163, 184)
ACCENT = (99, 102, 241)
CYAN = (20, 227, 197)

FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_REG = "C:/Windows/Fonts/segoeui.ttf"
FONT_LIGHT = "C:/Windows/Fonts/segoeuil.ttf"


def f(font_path, size):
    return ImageFont.truetype(font_path, size)


def lerp(a, b, t):
    return a + (b - a) * t


def gradient_box(size, c1, c2, vertical=False):
    img = Image.new("RGBA", size, c1 + (255,))
    d = ImageDraw.Draw(img)
    if vertical:
        for y in range(size[1]):
            t = y / max(size[1], 1)
            r = int(lerp(c1[0], c2[0], t))
            g = int(lerp(c1[1], c2[1], t))
            b = int(lerp(c1[2], c2[2], t))
            d.line([(0, y), (size[0], y)], fill=(r, g, b, 255))
    else:
        for x in range(size[0]):
            t = x / max(size[0], 1)
            r = int(lerp(c1[0], c2[0], t))
            g = int(lerp(c1[1], c2[1], t))
            b = int(lerp(c1[2], c2[2], t))
            d.line([(x, 0), (x, size[1])], fill=(r, g, b, 255))
    return img


def fill_polygon_with_gradient(canvas, points, c1, c2, vertical=False):
    mask = Image.new("L", canvas.size, 0)
    md = ImageDraw.Draw(mask)
    md.polygon(points, fill=255)
    grad = gradient_box(canvas.size, c1, c2, vertical=vertical)
    canvas.paste(grad, (0, 0), mask)


# Wolf shapes (same as concept exploration)
def wolf_head_silhouette(cx, cy, s):
    pts = [
        (cx - 0.65 * s, cy - 0.55 * s),
        (cx - 0.55 * s, cy - 1.05 * s),
        (cx - 0.20 * s, cy - 0.50 * s),
        (cx,            cy - 0.40 * s),
        (cx + 0.20 * s, cy - 0.50 * s),
        (cx + 0.55 * s, cy - 1.05 * s),
        (cx + 0.65 * s, cy - 0.55 * s),
        (cx + 0.62 * s, cy - 0.10 * s),
        (cx + 0.40 * s, cy + 0.30 * s),
        (cx + 0.18 * s, cy + 0.55 * s),
        (cx,            cy + 0.75 * s),
        (cx - 0.18 * s, cy + 0.55 * s),
        (cx - 0.40 * s, cy + 0.30 * s),
        (cx - 0.62 * s, cy - 0.10 * s),
    ]
    return [(int(x), int(y)) for x, y in pts]


def wolf_eye(cx, cy, s, side="left"):
    if side == "left":
        return [
            (int(cx - 0.32 * s), int(cy - 0.23 * s)),
            (int(cx - 0.10 * s), int(cy - 0.30 * s)),
            (int(cx - 0.07 * s), int(cy - 0.18 * s)),
            (int(cx - 0.28 * s), int(cy - 0.10 * s)),
        ]
    else:
        return [
            (int(cx + 0.32 * s), int(cy - 0.23 * s)),
            (int(cx + 0.10 * s), int(cy - 0.30 * s)),
            (int(cx + 0.07 * s), int(cy - 0.18 * s)),
            (int(cx + 0.28 * s), int(cy - 0.10 * s)),
        ]


def render_vigil(size, padding_ratio=0.06, with_rounded_bg=True, monochrome=None):
    """Render VIGIL logo at given size.

    monochrome: None (color) | 'white' | 'black'
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx, cy = size // 2, size // 2
    s = int(size * 0.42)

    if with_rounded_bg:
        pad = int(size * padding_ratio)
        box = [pad, pad, size - pad, size - pad]
        mask = Image.new("L", img.size, 0)
        md = ImageDraw.Draw(mask)
        md.rounded_rectangle(box, radius=int(size * 0.22), fill=255)
        if monochrome == 'white':
            # Solid white bg
            grad = Image.new("RGBA", img.size, WHITE + (255,))
            img.paste(grad, (0, 0), mask)
        elif monochrome == 'black':
            grad = Image.new("RGBA", img.size, INK + (255,))
            img.paste(grad, (0, 0), mask)
        else:
            grad = gradient_box(img.size, BG_DARK2, BG_DEEP, vertical=True)
            img.paste(grad, (0, 0), mask)

    d = ImageDraw.Draw(img)

    # Subtle wolf head silhouette
    head = wolf_head_silhouette(cx, cy, s)
    head_overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(head_overlay)
    if monochrome == 'white':
        hd.polygon(head, fill=(0, 0, 0, 50))
    elif monochrome == 'black':
        hd.polygon(head, fill=(255, 255, 255, 50))
    else:
        hd.polygon(head, fill=(0, 0, 0, 100))
    img.alpha_composite(head_overlay)

    # Glowing eyes
    eye_l = wolf_eye(cx, cy, s, "left")
    eye_r = wolf_eye(cx, cy, s, "right")

    if monochrome == 'white':
        eye_color = INK
        glow_color = INK
    elif monochrome == 'black':
        eye_color = WHITE
        glow_color = WHITE
    else:
        eye_color = WHITE
        glow_color = CYAN

    if monochrome is None:
        # Big halo glow
        glow1 = Image.new("RGBA", img.size, (0, 0, 0, 0))
        gd1 = ImageDraw.Draw(glow1)
        gd1.polygon(eye_l, fill=glow_color + (255,))
        gd1.polygon(eye_r, fill=glow_color + (255,))
        glow1_blur = glow1.filter(ImageFilter.GaussianBlur(int(size * 0.05)))
        img.alpha_composite(glow1_blur)
        # Inner glow
        glow2 = glow1.filter(ImageFilter.GaussianBlur(int(size * 0.015)))
        img.alpha_composite(glow2)

    # Solid eye core
    d = ImageDraw.Draw(img)
    d.polygon(eye_l, fill=eye_color + (255,))
    d.polygon(eye_r, fill=eye_color + (255,))

    return img


def render_og_image():
    """1200x630 — Open Graph / Twitter Card."""
    img = gradient_box((1200, 630), BG_DEEP, BG_DARK)
    # Accent radial
    overlay = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for i in range(40, 0, -1):
        a = int(10 * (i / 40))
        r = i * 18
        od.ellipse([1000 - r, 100 - r, 1000 + r, 100 + r], fill=ACCENT + (a,))
    for i in range(40, 0, -1):
        a = int(8 * (i / 40))
        r = i * 18
        od.ellipse([200 - r, 530 - r, 200 + r, 530 + r], fill=CYAN + (a,))
    img.alpha_composite(overlay)

    # Subtle grid
    grid = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    for x in range(0, 1200, 40):
        gd.line([(x, 0), (x, 630)], fill=(255, 255, 255, 5))
    for y in range(0, 630, 40):
        gd.line([(0, y), (1200, y)], fill=(255, 255, 255, 5))
    img.alpha_composite(grid)

    # VIGIL icon left side
    icon = render_vigil(280, padding_ratio=0.04, with_rounded_bg=True)
    img.paste(icon, (90, 175), icon)

    d = ImageDraw.Draw(img)

    # Wordmark + tagline
    d.text((420, 200), "VRIKAAN", font=f(FONT_BOLD, 90), fill=WHITE + (255,))
    d.text((424, 305), "AI Cyber Defense  ·  Made in India", font=f(FONT_REG, 26), fill=CYAN + (255,))

    # Subtitle
    d.text((424, 365), "Loyal as a wolf. Vigilant as one too.", font=f(FONT_LIGHT, 28), fill=MUTED + (255,))

    # URL pill
    d.rounded_rectangle([424, 440, 720, 500], radius=30, fill=(15, 22, 45, 220), outline=CYAN + (180,), width=2)
    d.text((448, 452), "→ vrikaan.com", font=f(FONT_BOLD, 28), fill=CYAN + (255,))

    return img


def render_business_card(size=1024):
    """Square 1024 - good for LinkedIn cover, business card mockup."""
    img = gradient_box((size, size), BG_DEEP, BG_DARK, vertical=True)
    # Centered icon
    icon = render_vigil(int(size * 0.45), padding_ratio=0.04)
    ix = (size - icon.width) // 2
    iy = int(size * 0.18)
    img.paste(icon, (ix, iy), icon)

    d = ImageDraw.Draw(img)
    # Wordmark centered
    txt = "VRIKAAN"
    font = f(FONT_BOLD, int(size * 0.10))
    bbox = d.textbbox((0, 0), txt, font=font)
    tw = bbox[2] - bbox[0]
    d.text(((size - tw) // 2 - bbox[0], int(size * 0.65)), txt, font=font, fill=WHITE)

    # Tagline
    tag = "AI Cyber Defense"
    tf = f(FONT_LIGHT, int(size * 0.035))
    bbox2 = d.textbbox((0, 0), tag, font=tf)
    tw2 = bbox2[2] - bbox2[0]
    d.text(((size - tw2) // 2 - bbox2[0], int(size * 0.78)), tag, font=tf, fill=CYAN)

    # URL
    url = "vrikaan.com"
    uf = f(FONT_BOLD, int(size * 0.025))
    bbox3 = d.textbbox((0, 0), url, font=uf)
    tw3 = bbox3[2] - bbox3[0]
    d.text(((size - tw3) // 2 - bbox3[0], int(size * 0.86)), url, font=uf, fill=MUTED)
    return img


def main():
    print("Building VRIKAAN brand kit (VIGIL theme)...\n")

    # ─── Public assets (replaces existing site files) ───
    targets = [
        ("apple-touch-icon.png", 180, 0.06, True),
        ("icon-192.png", 192, 0.06, True),
        ("icon-512.png", 512, 0.06, True),
        ("icon-maskable-512.png", 512, 0.18, True),  # extra padding for safe area
    ]
    for name, sz, pad, bg in targets:
        path = os.path.join(PUBLIC, name)
        render_vigil(sz, padding_ratio=pad, with_rounded_bg=bg).save(path, "PNG", optimize=True)
        print(f"  [public] {name}  ({sz}×{sz})")

    # OG image
    og = render_og_image()
    og.convert("RGB").save(os.path.join(PUBLIC, "og-image.png"), "PNG", optimize=True)
    print(f"  [public] og-image.png  (1200×630)")

    # ─── Brand assets (top-level for social) ───
    print()
    social = [
        ("linkedin-profile.png", 400),
        ("twitter-profile.png", 400),
        ("instagram-profile.png", 320),
    ]
    for name, sz in social:
        path = os.path.join(ASSETS, name)
        render_vigil(sz, padding_ratio=0.04).save(path, "PNG", optimize=True)
        print(f"  [brand_assets] {name}  ({sz}×{sz})")

    # Business card
    bc = render_business_card(1024)
    bc.convert("RGB").save(os.path.join(ASSETS, "business-card-1024.png"), "PNG", optimize=True)
    print(f"  [brand_assets] business-card-1024.png  (1024×1024)")

    # Monochrome variants
    mw = render_vigil(512, padding_ratio=0.04, monochrome='white')
    mw.save(os.path.join(ASSETS, "monochrome-white.png"), "PNG", optimize=True)
    print(f"  [brand_assets] monochrome-white.png  (for dark bg)")

    mb = render_vigil(512, padding_ratio=0.04, monochrome='black')
    mb.save(os.path.join(ASSETS, "monochrome-black.png"), "PNG", optimize=True)
    print(f"  [brand_assets] monochrome-black.png  (for light bg)")

    # Big hero size for LinkedIn cover, keynote slides etc.
    hero = render_vigil(2048, padding_ratio=0.04)
    hero.save(os.path.join(ASSETS, "vigil-2048.png"), "PNG", optimize=True)
    print(f"  [brand_assets] vigil-2048.png  (max-quality 2048×2048)")

    print("\n✓ Brand kit complete.")


if __name__ == "__main__":
    main()
