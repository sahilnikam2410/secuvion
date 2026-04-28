"""
Process the AI-generated origami wolf into a full brand asset pipeline.

Input:  brand_assets/wolf-source.png  (1241x1241, black bg)
Output: every PNG size needed across the product, with two strategies:

  STRATEGY A — Keep black background (drop-in for dark UI)
    apple-touch-icon, social profile pics → use as-is, just resize

  STRATEGY B — Transparent background (works on any bg)
    Use rembg to remove black, then composite onto rounded-square dark
    base for native UI integration.

Builds:
  public/apple-touch-icon.png         180x180  (iOS)
  public/icon-192.png, icon-512.png   PWA
  public/icon-maskable-512.png        PWA maskable
  public/og-image.png                 1200x630 — wolf + wordmark

  brand_assets/
    wolf-clean-1024.png               transparent background
    wolf-on-dark-1024.png             on rounded dark square (UI use)
    linkedin-profile.png              400x400 (square crop with bg)
    twitter-profile.png               400x400
    instagram-profile.png             320x320
    business-card-1024.png            wordmark + wolf composition
    monochrome-white.png              for dark backgrounds
    monochrome-black.png              for light backgrounds

Note: Background removal uses rembg (AI) if installed, else simple threshold.
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUBLIC = os.path.join(ROOT, "public")
ASSETS = os.path.join(ROOT, "brand_assets")

SOURCE = os.path.join(ASSETS, "wolf-source.png")
if not os.path.exists(SOURCE):
    print(f"ERROR: source not found at {SOURCE}")
    sys.exit(1)

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


def remove_black_background(src_img, threshold=30):
    """Remove pure-black background, keep wolf + cyan eyes + mesh wireframe.

    Uses brightness threshold — pixels darker than threshold become transparent.
    Good enough since the source has a true-black background.
    """
    src = src_img.convert("RGBA")
    pixels = src.load()
    w, h = src.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            brightness = max(r, g, b)
            if brightness < threshold:
                pixels[x, y] = (0, 0, 0, 0)
            elif brightness < threshold + 40:
                # soft fade for edge pixels
                fade = int(255 * (brightness - threshold) / 40)
                pixels[x, y] = (r, g, b, fade)
    return src


def crop_to_content(img, padding=20):
    """Crop transparent image to content bounds + padding."""
    bbox = img.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    l = max(0, l - padding)
    t = max(0, t - padding)
    r = min(img.width, r + padding)
    b = min(img.height, b + padding)
    return img.crop((l, t, r, b))


def fit_into_square(img, size, bg_color=None):
    """Resize image to fit a square canvas while preserving aspect ratio."""
    canvas = Image.new("RGBA", (size, size), bg_color + (255,) if bg_color else (0, 0, 0, 0))
    iw, ih = img.size
    scale = min(size / iw, size / ih) * 0.95  # 5% padding
    new_w = int(iw * scale)
    new_h = int(ih * scale)
    resized = img.resize((new_w, new_h), Image.LANCZOS)
    x = (size - new_w) // 2
    y = (size - new_h) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def rounded_dark_base(size, radius_ratio=0.22):
    """Create a rounded-square dark gradient base."""
    base = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    grad = gradient_box((size, size), BG_DARK2, BG_DEEP, vertical=True)
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    pad = int(size * 0.04)
    md.rounded_rectangle([pad, pad, size - pad, size - pad],
                          radius=int(size * radius_ratio), fill=255)
    base.paste(grad, (0, 0), mask)
    return base


def composite_on_dark(wolf_clean, size, padding_ratio=0.05, radius_ratio=0.22):
    """Place transparent wolf onto rounded dark base."""
    base = rounded_dark_base(size, radius_ratio=radius_ratio)
    pad = int(size * padding_ratio)
    inner = size - pad * 2
    iw, ih = wolf_clean.size
    scale = min(inner / iw, inner / ih)
    new_w = int(iw * scale)
    new_h = int(ih * scale)
    resized = wolf_clean.resize((new_w, new_h), Image.LANCZOS)
    x = (size - new_w) // 2
    y = (size - new_h) // 2
    # Mask resized to base area
    base.alpha_composite(resized, (x, y))
    return base


def make_monochrome(img, mono_color):
    """Convert wolf to single color while preserving alpha."""
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    px_in = img.load()
    px_out = out.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px_in[x, y]
            if a > 0:
                # Use brightness as alpha multiplier
                brightness = max(r, g, b) / 255
                px_out[x, y] = (mono_color[0], mono_color[1], mono_color[2],
                                int(a * (0.3 + brightness * 0.7)))
    return out


def og_image(wolf_clean):
    """1200x630 social card."""
    w, h = 1200, 630
    img = gradient_box((w, h), BG_DEEP, BG_DARK, vertical=False)

    # Atmospheric glow orbs
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for i in range(40, 0, -1):
        a = int(12 * (i / 40))
        r = i * 18
        od.ellipse([1000 - r, 100 - r, 1000 + r, 100 + r], fill=ACCENT + (a,))
    for i in range(40, 0, -1):
        a = int(8 * (i / 40))
        r = i * 18
        od.ellipse([200 - r, 530 - r, 200 + r, 530 + r], fill=CYAN + (a,))
    img.alpha_composite(overlay)

    # Subtle grid
    grid = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    for x in range(0, w, 40):
        gd.line([(x, 0), (x, h)], fill=(255, 255, 255, 4))
    for y in range(0, h, 40):
        gd.line([(0, y), (w, y)], fill=(255, 255, 255, 4))
    img.alpha_composite(grid)

    # Wolf on left
    wolf_size = 460
    iw, ih = wolf_clean.size
    scale = wolf_size / max(iw, ih)
    nw, nh = int(iw * scale), int(ih * scale)
    wolf_resized = wolf_clean.resize((nw, nh), Image.LANCZOS)
    wolf_x = 50
    wolf_y = (h - nh) // 2
    img.alpha_composite(wolf_resized, (wolf_x, wolf_y))

    d = ImageDraw.Draw(img)
    text_x = wolf_x + nw + 30

    d.text((text_x, 180), "VRIKAAN", font=f(FONT_BOLD, 92), fill=WHITE + (255,))
    d.text((text_x + 4, 290), "AI Cyber Defense  ·  Made in India", font=f(FONT_REG, 24), fill=CYAN + (255,))
    d.text((text_x + 4, 340), "Loyal as a wolf. Vigilant as one too.",
           font=f(FONT_LIGHT, 26), fill=MUTED + (255,))

    # CTA pill
    d.rounded_rectangle([text_x + 4, 420, text_x + 290, 480], radius=30,
                         fill=(15, 22, 45, 220), outline=CYAN + (180,), width=2)
    d.text((text_x + 28, 432), "→ vrikaan.com", font=f(FONT_BOLD, 26), fill=CYAN + (255,))

    return img


def business_card(wolf_on_dark, size=1024):
    """Square brand card — wolf + wordmark + URL."""
    img = gradient_box((size, size), BG_DEEP, BG_DARK, vertical=True)
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for i in range(40, 0, -1):
        a = int(8 * (i / 40))
        r = i * 18
        od.ellipse([size * 0.8 - r, -r, size * 0.8 + r, r * 2], fill=ACCENT + (a,))
    img.alpha_composite(overlay)

    # Wolf (no rounded base — wolf is already centered)
    iw = wolf_on_dark.width
    ws = int(size * 0.55)
    wolf_resized = wolf_on_dark.resize((ws, ws), Image.LANCZOS)
    wx = (size - ws) // 2
    wy = int(size * 0.10)
    img.alpha_composite(wolf_resized, (wx, wy))

    d = ImageDraw.Draw(img)
    txt = "VRIKAAN"
    font = f(FONT_BOLD, int(size * 0.10))
    bbox = d.textbbox((0, 0), txt, font=font)
    tw = bbox[2] - bbox[0]
    d.text(((size - tw) // 2 - bbox[0], int(size * 0.72)), txt, font=font, fill=WHITE)

    tag = "AI Cyber Defense"
    tf = f(FONT_LIGHT, int(size * 0.034))
    bbox2 = d.textbbox((0, 0), tag, font=tf)
    tw2 = bbox2[2] - bbox2[0]
    d.text(((size - tw2) // 2 - bbox2[0], int(size * 0.84)), tag, font=tf, fill=CYAN)

    url = "vrikaan.com"
    uf = f(FONT_BOLD, int(size * 0.026))
    bbox3 = d.textbbox((0, 0), url, font=uf)
    tw3 = bbox3[2] - bbox3[0]
    d.text(((size - tw3) // 2 - bbox3[0], int(size * 0.91)), url, font=uf, fill=MUTED)

    return img


def main():
    print("Processing wolf source image into brand kit...\n")

    src = Image.open(SOURCE).convert("RGBA")
    print(f"  source: {src.size}")

    # Step 1: Remove black background
    print("  [1/8] Removing black background...")
    wolf_clean = remove_black_background(src, threshold=25)
    wolf_clean = crop_to_content(wolf_clean, padding=10)
    out_path = os.path.join(ASSETS, "wolf-clean-1024.png")
    wolf_clean.resize((1024, int(1024 * wolf_clean.height / wolf_clean.width)),
                       Image.LANCZOS).save(out_path, "PNG", optimize=True)
    print(f"        → {out_path}")

    # Step 2: Wolf on dark rounded base (UI use)
    print("  [2/8] Composing wolf on dark rounded base (UI variant)...")
    wolf_on_dark = composite_on_dark(wolf_clean, 1024, padding_ratio=0.05)
    wolf_on_dark.save(os.path.join(ASSETS, "wolf-on-dark-1024.png"), "PNG", optimize=True)

    # Step 3: PWA + iOS icons (rounded dark base, looks native)
    print("  [3/8] Generating PWA + iOS icons...")
    icon_targets = [
        ("apple-touch-icon.png", 180, 0.05, 0.22),
        ("icon-192.png", 192, 0.05, 0.22),
        ("icon-512.png", 512, 0.05, 0.22),
        ("icon-maskable-512.png", 512, 0.18, 0.0),  # full bleed for masking
    ]
    for name, sz, pad, rad in icon_targets:
        ico = composite_on_dark(wolf_clean, sz, padding_ratio=pad, radius_ratio=rad)
        ico.save(os.path.join(PUBLIC, name), "PNG", optimize=True)
        print(f"        → public/{name}  ({sz}x{sz})")

    # Step 4: OG image
    print("  [4/8] Building OG / Twitter share card...")
    og = og_image(wolf_clean)
    og.convert("RGB").save(os.path.join(PUBLIC, "og-image.png"), "PNG", optimize=True)
    print(f"        → public/og-image.png  (1200x630)")

    # Step 5: Social profile pics (with dark base, looks native on platforms)
    print("  [5/8] Social profile pics...")
    social = [
        ("linkedin-profile.png", 400),
        ("twitter-profile.png", 400),
        ("instagram-profile.png", 320),
    ]
    for name, sz in social:
        p = composite_on_dark(wolf_clean, sz, padding_ratio=0.05)
        p.save(os.path.join(ASSETS, name), "PNG", optimize=True)
        print(f"        → brand_assets/{name}  ({sz}x{sz})")

    # Step 6: Business card
    print("  [6/8] Business card composition...")
    bc = business_card(wolf_on_dark, 1024)
    bc.convert("RGB").save(os.path.join(ASSETS, "business-card-1024.png"), "PNG", optimize=True)

    # Step 7: Monochrome variants
    print("  [7/8] Monochrome variants (white + black)...")
    mw = make_monochrome(wolf_clean, WHITE)
    mw.resize((512, int(512 * mw.height / mw.width)), Image.LANCZOS).save(
        os.path.join(ASSETS, "monochrome-white.png"), "PNG", optimize=True)
    mb = make_monochrome(wolf_clean, INK)
    mb.resize((512, int(512 * mb.height / mb.width)), Image.LANCZOS).save(
        os.path.join(ASSETS, "monochrome-black.png"), "PNG", optimize=True)

    # Step 8: Hero hi-res
    print("  [8/8] Hero hi-res (2048)...")
    hero = composite_on_dark(wolf_clean, 2048, padding_ratio=0.05)
    hero.save(os.path.join(ASSETS, "vigil-2048.png"), "PNG", optimize=True)

    print("\nDone. Brand kit refreshed.")


if __name__ == "__main__":
    main()
