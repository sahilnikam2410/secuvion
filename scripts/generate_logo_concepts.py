"""
VRIKAAN — Logo concept presentation.
Generates 5 distinct logo concepts as a presentation PDF + individual PNG assets.

Concepts:
  1. AEGIS    — V silhouette inside a shield (classic cyber-security)
  2. HEX      — V inside a hexagon (modern tech, blockchain-feel)
  3. PULSE    — V with AI signal waveform (AI-forward)
  4. SENTINEL — V with watching-eye accent (monitoring/protection)
  5. WORDMARK — Pure typography with custom V geometry (mature, minimal)
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ─── Constants ───
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_PDF = os.path.join(ROOT, "vrikaan-logo-concepts.pdf")
PNG_DIR = os.path.join(ROOT, "logo_assets")
os.makedirs(PNG_DIR, exist_ok=True)

W, H = 1920, 1080  # presentation slide size

# Brand palette
BG_DARK = (10, 15, 30)
BG_DARK2 = (20, 25, 45)
BG_LIGHT = (245, 247, 252)
WHITE = (255, 255, 255)
INK = (10, 15, 30)
INK_SOFT = (60, 70, 100)
MUTED = (140, 150, 175)
ACCENT = (99, 102, 241)        # indigo
CYAN = (20, 227, 197)          # mint
PURPLE = (139, 92, 246)
GREEN = (34, 197, 94)

FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_REG = "C:/Windows/Fonts/segoeui.ttf"
FONT_LIGHT = "C:/Windows/Fonts/segoeuil.ttf"


def f(font_path, size):
    return ImageFont.truetype(font_path, size)


def lerp(a, b, t):
    return a + (b - a) * t


def gradient_box(size, c1, c2, vertical=True):
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


def paste_gradient_in_shape(canvas, mask, c1, c2, position):
    grad = gradient_box(mask.size, c1, c2)
    canvas.paste(grad, position, mask)


# ──────────────────────────────────────────────────
# LOGO 1 — AEGIS (V inside shield)
# ──────────────────────────────────────────────────
def logo_aegis(size, color1=ACCENT, color2=CYAN, on_dark=True):
    """Shield with V negative-space cut-out."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    cx = size // 2
    cy = size // 2
    s = int(size * 0.42)

    # Shield outline points
    shield_pts = [
        (cx - s, cy - int(s * 0.95)),
        (cx, cy - int(s * 1.1)),
        (cx + s, cy - int(s * 0.95)),
        (cx + s, cy + int(s * 0.05)),
        (cx + int(s * 0.6), cy + int(s * 0.7)),
        (cx, cy + s),
        (cx - int(s * 0.6), cy + int(s * 0.7)),
        (cx - s, cy + int(s * 0.05)),
    ]

    # Make shield mask (filled)
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.polygon(shield_pts, fill=255)

    # Paste gradient through shield mask
    grad = gradient_box(img.size, color1, color2, vertical=False)
    img.paste(grad, (0, 0), mask)

    # V cut-out (negative space)
    v_thickness = int(s * 0.28)
    v_top_y = cy - int(s * 0.55)
    v_bot_y = cy + int(s * 0.4)
    v_outer_x = int(s * 0.55)

    # Left arm
    left_arm_pts = [
        (cx - v_outer_x, v_top_y),
        (cx - v_outer_x + v_thickness, v_top_y),
        (cx + v_thickness // 2, v_bot_y),
        (cx - v_thickness // 2, v_bot_y),
    ]
    # Right arm
    right_arm_pts = [
        (cx + v_outer_x - v_thickness, v_top_y),
        (cx + v_outer_x, v_top_y),
        (cx + v_thickness // 2, v_bot_y),
        (cx - v_thickness // 2, v_bot_y),
    ]

    # Erase to create the V cut
    er = ImageDraw.Draw(img)
    bg = (10, 15, 30, 0)  # transparent
    cut_mask = Image.new("L", img.size, 0)
    cmd = ImageDraw.Draw(cut_mask)
    cmd.polygon(left_arm_pts, fill=255)
    cmd.polygon(right_arm_pts, fill=255)
    # Apply cut by setting alpha to 0
    pixels = img.load()
    cm = cut_mask.load()
    for y in range(size):
        for x in range(size):
            if cm[x, y] > 0:
                pixels[x, y] = (0, 0, 0, 0)

    return img


# ──────────────────────────────────────────────────
# LOGO 2 — HEX (V inside hexagon)
# ──────────────────────────────────────────────────
def logo_hex(size, color1=CYAN, color2=ACCENT, on_dark=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    cx = size // 2
    cy = size // 2
    r = int(size * 0.42)

    # Hexagon points (flat-top)
    hex_pts = []
    for i in range(6):
        ang = math.radians(60 * i - 30)
        hex_pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))

    # Gradient hexagon body
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.polygon(hex_pts, fill=255)
    grad = gradient_box(img.size, color1, color2, vertical=False)
    img.paste(grad, (0, 0), mask)

    # Inner hex border (subtle)
    d = ImageDraw.Draw(img)
    inner_pts = []
    inner_r = int(r * 0.85)
    for i in range(6):
        ang = math.radians(60 * i - 30)
        inner_pts.append((cx + inner_r * math.cos(ang), cy + inner_r * math.sin(ang)))
    d.polygon(inner_pts + [inner_pts[0]], outline=(255, 255, 255, 90), width=2)

    # Bold V mark
    v_w = int(r * 0.95)
    v_h = int(r * 1.0)
    v_thick = int(r * 0.22)
    # V as two beveled lines forming V
    left_pts = [
        (cx - v_w // 2, cy - v_h // 2),
        (cx - v_w // 2 + v_thick, cy - v_h // 2),
        (cx + v_thick // 3, cy + v_h // 2),
        (cx - v_thick // 3, cy + v_h // 2),
    ]
    right_pts = [
        (cx + v_w // 2 - v_thick, cy - v_h // 2),
        (cx + v_w // 2, cy - v_h // 2),
        (cx + v_thick // 3, cy + v_h // 2),
        (cx - v_thick // 3, cy + v_h // 2),
    ]
    d.polygon(left_pts, fill=WHITE + (255,))
    d.polygon(right_pts, fill=WHITE + (255,))

    return img


# ──────────────────────────────────────────────────
# LOGO 3 — PULSE (V with AI waveform)
# ──────────────────────────────────────────────────
def logo_pulse(size, color1=ACCENT, color2=CYAN, on_dark=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    cx = size // 2
    cy = size // 2
    s = int(size * 0.4)

    # Rounded square base with gradient
    pad = int(size * 0.08)
    box = [pad, pad, size - pad, size - pad]
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle(box, radius=int(size * 0.18), fill=255)
    grad = gradient_box(img.size, color1, color2, vertical=False)
    img.paste(grad, (0, 0), mask)

    # Big bold V — geometric, sharp
    v_w = int(s * 1.4)
    v_h = int(s * 1.5)
    v_thick = int(s * 0.32)
    v_top_y = cy - v_h // 2
    v_bot_y = cy + v_h // 2

    left_pts = [
        (cx - v_w // 2, v_top_y),
        (cx - v_w // 2 + v_thick, v_top_y),
        (cx + v_thick // 2, v_bot_y),
        (cx - v_thick // 2, v_bot_y),
    ]
    right_pts = [
        (cx + v_w // 2 - v_thick, v_top_y),
        (cx + v_w // 2, v_top_y),
        (cx + v_thick // 2, v_bot_y),
        (cx - v_thick // 2, v_bot_y),
    ]
    d = ImageDraw.Draw(img)
    d.polygon(left_pts, fill=WHITE + (255,))
    d.polygon(right_pts, fill=WHITE + (255,))

    # Pulse waveform across the bottom — tiny AI signal
    wave_y = cy + int(s * 0.95)
    wave_x_start = cx - int(s * 1.1)
    wave_x_end = cx + int(s * 1.1)
    points = []
    n = 24
    for i in range(n + 1):
        t = i / n
        x = wave_x_start + (wave_x_end - wave_x_start) * t
        # Heartbeat/pulse pattern
        if 0.4 < t < 0.5:
            y_off = -int(s * 0.4) * math.sin((t - 0.4) * 10 * math.pi)
        elif 0.5 < t < 0.6:
            y_off = int(s * 0.55) * math.sin((t - 0.5) * 10 * math.pi)
        else:
            y_off = 0
        points.append((x, wave_y + y_off))

    for i in range(len(points) - 1):
        d.line([points[i], points[i + 1]], fill=WHITE + (220,), width=int(s * 0.06))

    return img


# ──────────────────────────────────────────────────
# LOGO 4 — SENTINEL (V with watching eye)
# ──────────────────────────────────────────────────
def logo_sentinel(size, color1=ACCENT, color2=CYAN, on_dark=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    cx = size // 2
    cy = size // 2
    r = int(size * 0.42)

    # Circular gradient body
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    grad = gradient_box(img.size, color1, color2, vertical=False)
    img.paste(grad, (0, 0), mask)

    d = ImageDraw.Draw(img)

    # Inner concentric ring (subtle)
    d.ellipse([cx - int(r * 0.85), cy - int(r * 0.85), cx + int(r * 0.85), cy + int(r * 0.85)],
              outline=WHITE + (60,), width=2)

    # V shape (top-heavy, slightly stylized) forming an open eye
    v_w = int(r * 1.2)
    v_thick = int(r * 0.22)
    v_top_y = cy - int(r * 0.55)
    v_bot_y = cy + int(r * 0.15)

    # V/checkmark shape
    left_pts = [
        (cx - v_w // 2, v_top_y),
        (cx - v_w // 2 + v_thick, v_top_y),
        (cx + v_thick // 2, v_bot_y),
        (cx - v_thick // 2, v_bot_y),
    ]
    right_pts = [
        (cx + v_w // 2 - v_thick, v_top_y),
        (cx + v_w // 2, v_top_y),
        (cx + v_thick // 2, v_bot_y),
        (cx - v_thick // 2, v_bot_y),
    ]
    d.polygon(left_pts, fill=WHITE + (255,))
    d.polygon(right_pts, fill=WHITE + (255,))

    # Watching eye dot (pupil) below the V — symbolizes monitoring
    pupil_y = cy + int(r * 0.45)
    d.ellipse([cx - 12, pupil_y - 12, cx + 12, pupil_y + 12], fill=WHITE + (255,))

    return img


# ──────────────────────────────────────────────────
# LOGO 5 — Pure WORDMARK (custom typography)
# ──────────────────────────────────────────────────
def logo_wordmark(size, color1=ACCENT, color2=CYAN, on_dark=True):
    """Just the wordmark with a custom geometric V inside."""
    # 3:1 aspect - render at size*3 wide
    w = size * 3
    h = size
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Custom V at the start (gradient)
    v_size = int(h * 0.7)
    cx = int(h * 0.5)
    cy = int(h * 0.5)
    v_w = int(v_size * 0.95)
    v_h = int(v_size * 1.0)
    v_thick = int(v_size * 0.2)
    v_top_y = cy - v_h // 2
    v_bot_y = cy + v_h // 2

    # V in gradient
    left_pts = [
        (cx - v_w // 2, v_top_y),
        (cx - v_w // 2 + v_thick, v_top_y),
        (cx + v_thick // 2, v_bot_y),
        (cx - v_thick // 2, v_bot_y),
    ]
    right_pts = [
        (cx + v_w // 2 - v_thick, v_top_y),
        (cx + v_w // 2, v_top_y),
        (cx + v_thick // 2, v_bot_y),
        (cx - v_thick // 2, v_bot_y),
    ]
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.polygon(left_pts, fill=255)
    md.polygon(right_pts, fill=255)
    grad = gradient_box(img.size, color1, color2, vertical=False)
    img.paste(grad, (0, 0), mask)

    # "RIKAAN" text after V
    text_color = WHITE if on_dark else INK
    font = f(FONT_BOLD, int(h * 0.5))
    text_x = cx + v_w // 2 + int(h * 0.12)
    bbox = d.textbbox((0, 0), "RIKAAN", font=font)
    text_h = bbox[3] - bbox[1]
    d.text((text_x, cy - text_h // 2 - bbox[1]), "RIKAAN", font=font, fill=text_color + (255,))

    return img


# ──────────────────────────────────────────────────
# Slide builder
# ──────────────────────────────────────────────────
def make_slide_bg(dark=True):
    if dark:
        bg = gradient_box((W, H), BG_DARK, BG_DARK2)
        # subtle radial accent
        overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        for i in range(40, 0, -1):
            a = int(8 * (i / 40))
            r = i * 25
            od.ellipse([W * 0.8 - r, -r, W * 0.8 + r, r * 2], fill=ACCENT + (a,))
        bg.alpha_composite(overlay)
    else:
        bg = Image.new("RGBA", (W, H), BG_LIGHT + (255,))
    return bg


def slide_concept(name, num, total, builder_fn, description, key_traits):
    """Single concept slide with dark + light + lockup variants."""
    bg = make_slide_bg(dark=True)
    d = ImageDraw.Draw(bg)

    # Header
    d.text((80, 70), f"CONCEPT {num} / {total}", font=f(FONT_BOLD, 28), fill=CYAN)
    d.text((80, 110), name, font=f(FONT_BOLD, 80), fill=WHITE)
    d.text((80, 200), description, font=f(FONT_LIGHT, 28), fill=MUTED)

    # Three boxes:
    # Box 1 (top-left) — large dark version
    # Box 2 (top-right) — large light version
    # Box 3 (bottom) — wordmark lockup

    # Box 1 — On dark
    box1_w, box1_h = 600, 520
    box1_x, box1_y = 80, 280
    d.rounded_rectangle([box1_x, box1_y, box1_x + box1_w, box1_y + box1_h], radius=20, fill=(15, 22, 45, 255))
    logo_img = builder_fn(420, on_dark=True)
    bg.paste(logo_img, (box1_x + (box1_w - logo_img.width) // 2, box1_y + (box1_h - logo_img.height) // 2 - 30), logo_img)
    d.text((box1_x + box1_w // 2 - 60, box1_y + box1_h - 50), "On Dark", font=f(FONT_REG, 22), fill=MUTED)

    # Box 2 — On light
    box2_x = box1_x + box1_w + 40
    d.rounded_rectangle([box2_x, box1_y, box2_x + box1_w, box1_y + box1_h], radius=20, fill=BG_LIGHT + (255,))
    logo_img2 = builder_fn(420, on_dark=False)
    bg.paste(logo_img2, (box2_x + (box1_w - logo_img2.width) // 2, box1_y + (box1_h - logo_img2.height) // 2 - 30), logo_img2)
    d.text((box2_x + box1_w // 2 - 60, box1_y + box1_h - 50), "On Light", font=f(FONT_REG, 22), fill=INK_SOFT)

    # Box 3 — Wordmark lockup (full-width strip at bottom)
    box3_x, box3_y = 80, 830
    box3_w = W - 160
    box3_h = 180
    d.rounded_rectangle([box3_x, box3_y, box3_x + box3_w, box3_y + box3_h], radius=20, fill=(15, 22, 45, 255))

    # Build lockup: icon + wordmark
    lockup_size = 120
    icon = builder_fn(lockup_size, on_dark=True)
    icon_x = box3_x + 50
    icon_y = box3_y + (box3_h - lockup_size) // 2
    bg.paste(icon, (icon_x, icon_y), icon)

    # Wordmark text
    wm_x = icon_x + lockup_size + 30
    wm_y = box3_y + 55
    d.text((wm_x, wm_y), "VRIKAAN", font=f(FONT_BOLD, 70), fill=WHITE)
    d.text((wm_x, wm_y + 78), "AI Cyber Defense", font=f(FONT_LIGHT, 22), fill=MUTED)

    # Key traits on right side of lockup
    traits_x = box3_x + box3_w - 500
    ty = box3_y + 35
    d.text((traits_x, ty), "Key Traits:", font=f(FONT_BOLD, 22), fill=CYAN)
    for trait in key_traits:
        ty += 28
        d.text((traits_x, ty), f"·  {trait}", font=f(FONT_REG, 20), fill=MUTED)

    return bg


def title_slide():
    bg = make_slide_bg(dark=True)
    d = ImageDraw.Draw(bg)

    d.text((W // 2 - 280, 200), "VRIKAAN", font=f(FONT_BOLD, 140), fill=WHITE)
    d.text((W // 2 - 200, 360), "Logo concept exploration", font=f(FONT_LIGHT, 40), fill=CYAN)

    d.text((W // 2 - 350, 480), "5 distinct concepts to choose from", font=f(FONT_REG, 28), fill=MUTED)
    d.text((W // 2 - 290, 525), "Each shown on dark, light, and as a wordmark lockup", font=f(FONT_REG, 22), fill=MUTED)

    # Display all 5 logos in a row
    builders = [
        ("AEGIS", logo_aegis),
        ("HEX", logo_hex),
        ("PULSE", logo_pulse),
        ("SENTINEL", logo_sentinel),
        ("WORDMARK", logo_wordmark),
    ]
    icon_size = 200
    spacing = 160
    total_w = len(builders) * icon_size + (len(builders) - 1) * spacing
    if total_w > W - 160:
        # Reduce
        spacing = (W - 160 - len(builders) * icon_size) // (len(builders) - 1)
        total_w = len(builders) * icon_size + (len(builders) - 1) * spacing
    sx = (W - total_w) // 2
    iy = 700
    for i, (name, fn) in enumerate(builders):
        if name == "WORDMARK":
            # render wordmark scaled down
            wm = fn(icon_size, on_dark=True)
            wm = wm.resize((int(icon_size * 1.5), icon_size // 2))
            bg.paste(wm, (sx + i * (icon_size + spacing), iy + icon_size // 4), wm)
        else:
            ico = fn(icon_size, on_dark=True)
            bg.paste(ico, (sx + i * (icon_size + spacing), iy), ico)
        d.text(
            (sx + i * (icon_size + spacing) + icon_size // 2 - 40, iy + icon_size + 20),
            name,
            font=f(FONT_BOLD, 22),
            fill=CYAN,
        )

    d.text((W // 2 - 200, H - 80), "Designed for VRIKAAN  ·  by Claude", font=f(FONT_REG, 18), fill=MUTED)
    return bg


def build():
    print("Building logo concept presentation...")

    slides = [title_slide()]

    concepts = [
        (
            "AEGIS", logo_aegis,
            "Classic shield with V silhouette as negative space.",
            ["Cybersecurity heritage", "Trust signal", "Scales to favicon", "Reads as protection"],
        ),
        (
            "HEX", logo_hex,
            "V inside a hexagon — modern, networked, blockchain/AI vibe.",
            ["Tech-forward", "Network/protocol feel", "Geometric balance", "Distinctive at small sizes"],
        ),
        (
            "PULSE", logo_pulse,
            "Bold V with AI heartbeat waveform — most product-y of the set.",
            ["AI-forward", "Active / dynamic", "Already on-brand", "Pairs with current site"],
        ),
        (
            "SENTINEL", logo_sentinel,
            "V inside a circle with a watching pupil — monitoring & vigilance.",
            ["Monitoring metaphor", "Friendly + protective", "Round = approachable", "Stands out vs square peers"],
        ),
        (
            "WORDMARK", logo_wordmark,
            "Pure typography with a custom geometric V — minimal, mature.",
            ["Versatile across sizes", "Mature brand feel", "Less iconographic clutter", "Pairs with any icon set"],
        ),
    ]
    for i, (name, fn, desc, traits) in enumerate(concepts, 1):
        slides.append(slide_concept(name, i, len(concepts), fn, desc, traits))

    # Save PDF
    rgb_slides = [s.convert("RGB") for s in slides]
    rgb_slides[0].save(
        OUT_PDF,
        save_all=True,
        append_images=rgb_slides[1:],
        format="PDF",
        resolution=144,
        title="VRIKAAN Logo Concepts",
        author="Claude (designer)",
    )
    print(f"[OK] Concept deck: {OUT_PDF}  ({os.path.getsize(OUT_PDF)/1024:.1f} KB)")

    # Save individual logo PNGs (for whichever concept user picks)
    for name, fn, _, _ in concepts:
        slug = name.lower()
        # 512px on-dark
        ico = fn(512, on_dark=True)
        ico.save(os.path.join(PNG_DIR, f"{slug}_dark_512.png"), "PNG")
        # 512px on-light
        ico2 = fn(512, on_dark=False)
        ico2.save(os.path.join(PNG_DIR, f"{slug}_light_512.png"), "PNG")
        # 256px favicon
        icof = fn(256, on_dark=True)
        icof.save(os.path.join(PNG_DIR, f"{slug}_favicon_256.png"), "PNG")

    print(f"[OK] PNG assets in: {PNG_DIR}/")


if __name__ == "__main__":
    build()
