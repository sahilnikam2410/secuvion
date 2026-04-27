"""
VRIKAAN — Wolf logo concepts.

The brand metaphor: VRIKAAN = wolf = security + loyalty + intelligence + vigilance.

5 distinct wolf-based marks:
  1. APEX     — Geometric polygonal wolf head, front-facing (modern, tech-precise)
  2. GUARDIAN — Wolf head silhouette inside a shield (security + loyalty fused)
  3. VIGIL    — Glowing wolf eyes peering from darkness (mysterious, watchful)
  4. HOWL     — Side-profile howling wolf (heritage, storytelling)
  5. PACK     — Wordmark with a stylized wolf-V ligature
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_PDF = os.path.join(ROOT, "vrikaan-logo-concepts.pdf")
PNG_DIR = os.path.join(ROOT, "logo_assets")
os.makedirs(PNG_DIR, exist_ok=True)

W, H = 1920, 1080

# Brand palette
BG_DARK = (10, 15, 30)
BG_DARK2 = (20, 25, 45)
BG_LIGHT = (245, 247, 252)
WHITE = (255, 255, 255)
INK = (10, 15, 30)
INK_SOFT = (60, 70, 100)
MUTED = (140, 150, 175)
ACCENT = (99, 102, 241)
CYAN = (20, 227, 197)
PURPLE = (139, 92, 246)
ORANGE = (251, 146, 60)
GOLD = (250, 204, 21)

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
    """Fill a polygon with a gradient by using it as a mask."""
    mask = Image.new("L", canvas.size, 0)
    md = ImageDraw.Draw(mask)
    md.polygon(points, fill=255)
    grad = gradient_box(canvas.size, c1, c2, vertical=vertical)
    canvas.paste(grad, (0, 0), mask)


def fill_shape_with_gradient(canvas, mask_img, c1, c2, vertical=False):
    grad = gradient_box(canvas.size, c1, c2, vertical=vertical)
    canvas.paste(grad, (0, 0), mask_img)


# ──────────────────────────────────────────────────
# Geometric wolf head — front view
# ──────────────────────────────────────────────────
def wolf_head_silhouette(cx, cy, s):
    """Returns polygon points for a geometric wolf head (front-facing)."""
    pts = [
        (cx - 0.65 * s, cy - 0.55 * s),  # left ear outer base
        (cx - 0.55 * s, cy - 1.05 * s),  # left ear tip
        (cx - 0.20 * s, cy - 0.50 * s),  # left ear inner base
        (cx,            cy - 0.40 * s),  # forehead dip
        (cx + 0.20 * s, cy - 0.50 * s),  # right ear inner base
        (cx + 0.55 * s, cy - 1.05 * s),  # right ear tip
        (cx + 0.65 * s, cy - 0.55 * s),  # right ear outer base
        (cx + 0.62 * s, cy - 0.10 * s),  # right cheek widest
        (cx + 0.40 * s, cy + 0.30 * s),  # right jaw
        (cx + 0.18 * s, cy + 0.55 * s),  # right chin shoulder
        (cx,            cy + 0.75 * s),  # chin point
        (cx - 0.18 * s, cy + 0.55 * s),  # left chin shoulder
        (cx - 0.40 * s, cy + 0.30 * s),  # left jaw
        (cx - 0.62 * s, cy - 0.10 * s),  # left cheek widest
    ]
    return [(int(x), int(y)) for x, y in pts]


def wolf_inner_ear(cx, cy, s, side="left"):
    """Smaller inner-ear triangle accent."""
    if side == "left":
        return [
            (int(cx - 0.50 * s), int(cy - 0.92 * s)),
            (int(cx - 0.36 * s), int(cy - 0.55 * s)),
            (int(cx - 0.25 * s), int(cy - 0.62 * s)),
        ]
    else:
        return [
            (int(cx + 0.50 * s), int(cy - 0.92 * s)),
            (int(cx + 0.36 * s), int(cy - 0.55 * s)),
            (int(cx + 0.25 * s), int(cy - 0.62 * s)),
        ]


def wolf_eye(cx, cy, s, side="left"):
    """Slanted/alert eye."""
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


def wolf_snout_shadow(cx, cy, s):
    """Triangular shadow under the eyes — defines the snout."""
    return [
        (int(cx - 0.18 * s), int(cy + 0.05 * s)),
        (int(cx + 0.18 * s), int(cy + 0.05 * s)),
        (int(cx + 0.10 * s), int(cy + 0.45 * s)),
        (int(cx),            int(cy + 0.55 * s)),
        (int(cx - 0.10 * s), int(cy + 0.45 * s)),
    ]


# ──────────────────────────────────────────────────
# LOGO 1 — APEX (geometric wolf head)
# ──────────────────────────────────────────────────
def logo_apex(size, on_dark=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx, cy = size // 2, int(size * 0.52)
    s = int(size * 0.42)

    # Wolf head body — gradient fill
    head = wolf_head_silhouette(cx, cy, s)
    fill_polygon_with_gradient(img, head, ACCENT, CYAN)

    d = ImageDraw.Draw(img)

    # Inner ears — darker
    inner_l = wolf_inner_ear(cx, cy, s, "left")
    inner_r = wolf_inner_ear(cx, cy, s, "right")
    d.polygon(inner_l, fill=(BG_DARK[0], BG_DARK[1], BG_DARK[2], 200))
    d.polygon(inner_r, fill=(BG_DARK[0], BG_DARK[1], BG_DARK[2], 200))

    # Eyes — bright cyan glow with white core
    eye_l = wolf_eye(cx, cy, s, "left")
    eye_r = wolf_eye(cx, cy, s, "right")
    # glow
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.polygon(eye_l, fill=CYAN + (220,))
    gd.polygon(eye_r, fill=CYAN + (220,))
    glow = glow.filter(ImageFilter.GaussianBlur(int(size * 0.012)))
    img.alpha_composite(glow)
    d = ImageDraw.Draw(img)
    d.polygon(eye_l, fill=WHITE + (255,))
    d.polygon(eye_r, fill=WHITE + (255,))

    # Snout shadow — reads as the muzzle
    snout = wolf_snout_shadow(cx, cy, s)
    d.polygon(snout, fill=(BG_DARK[0], BG_DARK[1], BG_DARK[2], 130))

    # Nose triangle
    nose_pts = [
        (cx - int(0.07 * s), cy + int(0.18 * s)),
        (cx + int(0.07 * s), cy + int(0.18 * s)),
        (cx,                 cy + int(0.30 * s)),
    ]
    d.polygon(nose_pts, fill=(BG_DARK[0], BG_DARK[1], BG_DARK[2], 220))

    # Forehead facet — adds geometric depth
    facet_pts = [
        (cx - int(0.20 * s), cy - int(0.50 * s)),
        (cx,                 cy - int(0.40 * s)),
        (cx + int(0.20 * s), cy - int(0.50 * s)),
        (cx,                 cy - int(0.20 * s)),
    ]
    d.polygon(facet_pts, fill=(255, 255, 255, 25))

    return img


# ──────────────────────────────────────────────────
# LOGO 2 — GUARDIAN (wolf head + shield)
# ──────────────────────────────────────────────────
def logo_guardian(size, on_dark=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx, cy = size // 2, size // 2
    s = int(size * 0.46)

    # Shield outline points
    shield_pts = [
        (cx - s,                cy - int(s * 0.95)),
        (cx,                    cy - int(s * 1.08)),
        (cx + s,                cy - int(s * 0.95)),
        (cx + s,                cy + int(s * 0.10)),
        (cx + int(s * 0.6),     cy + int(s * 0.65)),
        (cx,                    cy + int(s * 0.95)),
        (cx - int(s * 0.6),     cy + int(s * 0.65)),
        (cx - s,                cy + int(s * 0.10)),
    ]

    # Shield gradient body
    fill_polygon_with_gradient(img, shield_pts, ACCENT, CYAN)

    d = ImageDraw.Draw(img)

    # Inner shield border (subtle)
    inner_shield = []
    for x, y in shield_pts:
        ix = cx + int((x - cx) * 0.88)
        iy = cy + int((y - cy) * 0.88)
        inner_shield.append((ix, iy))
    d.polygon(inner_shield + [inner_shield[0]], outline=(255, 255, 255, 60), width=2)

    # Wolf head INSIDE shield (smaller, white)
    wcx, wcy = cx, int(cy - s * 0.05)
    ws = int(s * 0.55)
    head = wolf_head_silhouette(wcx, wcy, ws)
    d.polygon(head, fill=WHITE + (255,))

    # Wolf inner ears (dark)
    d.polygon(wolf_inner_ear(wcx, wcy, ws, "left"), fill=ACCENT + (255,))
    d.polygon(wolf_inner_ear(wcx, wcy, ws, "right"), fill=ACCENT + (255,))

    # Wolf eyes (cutouts revealing shield gradient)
    eye_l = wolf_eye(wcx, wcy, ws, "left")
    eye_r = wolf_eye(wcx, wcy, ws, "right")
    # Cut by setting alpha — but PIL polygon overdraw works:
    # Draw eyes in shield's gradient color (use ACCENT to read as cutout)
    d.polygon(eye_l, fill=ACCENT + (255,))
    d.polygon(eye_r, fill=ACCENT + (255,))

    # Snout shadow
    snout = wolf_snout_shadow(wcx, wcy, ws)
    d.polygon(snout, fill=(120, 130, 160, 160))

    return img


# ──────────────────────────────────────────────────
# LOGO 3 — VIGIL (glowing eyes only, dark surround)
# ──────────────────────────────────────────────────
def logo_vigil(size, on_dark=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx, cy = size // 2, size // 2
    s = int(size * 0.42)

    # Rounded square/circle base
    pad = int(size * 0.06)
    box = [pad, pad, size - pad, size - pad]
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle(box, radius=int(size * 0.22), fill=255)

    # Dark base with subtle gradient
    fill_shape_with_gradient(img, mask, (15, 22, 45), (5, 10, 25), vertical=True)

    d = ImageDraw.Draw(img)

    # Subtle wolf head SILHOUETTE (very low contrast — just hints at wolf)
    head = wolf_head_silhouette(cx, cy, s)
    head_overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(head_overlay)
    hd.polygon(head, fill=(0, 0, 0, 100))  # darker fill = subtle wolf shape
    img.alpha_composite(head_overlay)

    # NOW the focus: GLOWING eyes
    eye_l = wolf_eye(cx, cy, s, "left")
    eye_r = wolf_eye(cx, cy, s, "right")

    # Big glow halo
    glow1 = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gd1 = ImageDraw.Draw(glow1)
    gd1.polygon(eye_l, fill=CYAN + (255,))
    gd1.polygon(eye_r, fill=CYAN + (255,))
    glow1_blur = glow1.filter(ImageFilter.GaussianBlur(int(size * 0.05)))
    img.alpha_composite(glow1_blur)

    # Inner glow (tighter)
    glow2 = glow1.filter(ImageFilter.GaussianBlur(int(size * 0.015)))
    img.alpha_composite(glow2)

    # Solid white core
    d = ImageDraw.Draw(img)
    d.polygon(eye_l, fill=WHITE + (255,))
    d.polygon(eye_r, fill=WHITE + (255,))

    return img


# ──────────────────────────────────────────────────
# LOGO 4 — HOWL (side-profile howling wolf)
# ──────────────────────────────────────────────────
def logo_howl(size, on_dark=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx, cy = size // 2, size // 2
    s = int(size * 0.42)

    # Circle base (suggests moon)
    pad = int(size * 0.06)
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.ellipse([pad, pad, size - pad, size - pad], fill=255)
    fill_shape_with_gradient(img, mask, ACCENT, CYAN)

    d = ImageDraw.Draw(img)

    # Side-profile wolf head howling, tilted up
    # Polygon walking: from chin (bottom-left), up the throat, jaw, snout pointing up-right,
    # around the head, ears, back of neck
    wolf_pts = [
        (cx - int(0.40 * s), cy + int(0.50 * s)),  # bottom of throat / chest
        (cx - int(0.30 * s), cy + int(0.20 * s)),  # throat curve
        (cx - int(0.10 * s), cy + int(0.05 * s)),  # under-jaw point
        (cx + int(0.05 * s), cy - int(0.05 * s)),  # jaw start
        (cx + int(0.55 * s), cy - int(0.55 * s)),  # snout tip (howling up)
        (cx + int(0.45 * s), cy - int(0.65 * s)),  # nose top
        (cx + int(0.10 * s), cy - int(0.30 * s)),  # forehead
        (cx - int(0.10 * s), cy - int(0.65 * s)),  # ear front
        (cx - int(0.30 * s), cy - int(0.85 * s)),  # ear tip
        (cx - int(0.30 * s), cy - int(0.40 * s)),  # ear back
        (cx - int(0.55 * s), cy - int(0.10 * s)),  # back of head
        (cx - int(0.65 * s), cy + int(0.20 * s)),  # back of neck
        (cx - int(0.55 * s), cy + int(0.50 * s)),  # back/shoulder
    ]
    d.polygon(wolf_pts, fill=WHITE + (255,))

    # Eye — small dark dot
    d.ellipse(
        [cx - int(0.07 * s), cy - int(0.25 * s),
         cx + int(0.01 * s), cy - int(0.17 * s)],
        fill=BG_DARK + (255,),
    )

    # Mouth line — open howling jaw
    d.line(
        [(cx + int(0.05 * s), cy - int(0.05 * s)), (cx + int(0.40 * s), cy - int(0.40 * s))],
        fill=BG_DARK + (180,), width=int(size * 0.012),
    )

    return img


# ──────────────────────────────────────────────────
# LOGO 5 — PACK (wolf-V wordmark)
# ──────────────────────────────────────────────────
def logo_pack(size, on_dark=True):
    """Square logo: stylized wolf head whose ears form the V of VRIKAAN."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx, cy = size // 2, int(size * 0.55)
    s = int(size * 0.40)

    # Rounded square base
    pad = int(size * 0.08)
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([pad, pad, size - pad, size - pad], radius=int(size * 0.2), fill=255)
    fill_shape_with_gradient(img, mask, ACCENT, CYAN)

    d = ImageDraw.Draw(img)

    # Stylized wolf — exaggerated ears that form a strong V shape
    # Top of "V" — long pointed ears, wider apart
    wolf_pts = [
        (cx - int(0.75 * s), cy - int(0.60 * s)),  # left ear outer base
        (cx - int(0.55 * s), cy - int(1.10 * s)),  # left ear tip (very tall)
        (cx - int(0.10 * s), cy - int(0.30 * s)),  # forehead dip-left
        (cx,                 cy - int(0.20 * s)),  # forehead center
        (cx + int(0.10 * s), cy - int(0.30 * s)),  # forehead dip-right
        (cx + int(0.55 * s), cy - int(1.10 * s)),  # right ear tip
        (cx + int(0.75 * s), cy - int(0.60 * s)),  # right ear outer base
        (cx + int(0.65 * s), cy - int(0.05 * s)),  # right cheek
        (cx + int(0.40 * s), cy + int(0.35 * s)),  # right jaw
        (cx,                 cy + int(0.65 * s)),  # chin point
        (cx - int(0.40 * s), cy + int(0.35 * s)),  # left jaw
        (cx - int(0.65 * s), cy - int(0.05 * s)),  # left cheek
    ]
    d.polygon(wolf_pts, fill=WHITE + (255,))

    # Eyes (slits — angular, alert)
    eye_l = [
        (cx - int(0.36 * s), cy - int(0.10 * s)),
        (cx - int(0.12 * s), cy - int(0.20 * s)),
        (cx - int(0.10 * s), cy - int(0.05 * s)),
        (cx - int(0.32 * s), cy + int(0.02 * s)),
    ]
    eye_r = [
        (cx + int(0.36 * s), cy - int(0.10 * s)),
        (cx + int(0.12 * s), cy - int(0.20 * s)),
        (cx + int(0.10 * s), cy - int(0.05 * s)),
        (cx + int(0.32 * s), cy + int(0.02 * s)),
    ]
    d.polygon(eye_l, fill=ACCENT + (255,))
    d.polygon(eye_r, fill=ACCENT + (255,))

    # Inner ear accents
    d.polygon([
        (cx - int(0.55 * s), cy - int(1.00 * s)),
        (cx - int(0.40 * s), cy - int(0.55 * s)),
        (cx - int(0.30 * s), cy - int(0.65 * s)),
    ], fill=ACCENT + (255,))
    d.polygon([
        (cx + int(0.55 * s), cy - int(1.00 * s)),
        (cx + int(0.40 * s), cy - int(0.55 * s)),
        (cx + int(0.30 * s), cy - int(0.65 * s)),
    ], fill=ACCENT + (255,))

    # Snout shadow
    d.polygon([
        (cx - int(0.15 * s), cy + int(0.10 * s)),
        (cx + int(0.15 * s), cy + int(0.10 * s)),
        (cx + int(0.06 * s), cy + int(0.45 * s)),
        (cx - int(0.06 * s), cy + int(0.45 * s)),
    ], fill=ACCENT + (180,))

    # Nose
    d.polygon([
        (cx - int(0.08 * s), cy + int(0.10 * s)),
        (cx + int(0.08 * s), cy + int(0.10 * s)),
        (cx,                 cy + int(0.22 * s)),
    ], fill=ACCENT + (255,))

    return img


# ──────────────────────────────────────────────────
# Slide presentation builder
# ──────────────────────────────────────────────────
def make_slide_bg(dark=True):
    if dark:
        bg = gradient_box((W, H), BG_DARK, BG_DARK2, vertical=True)
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
    bg = make_slide_bg(dark=True)
    d = ImageDraw.Draw(bg)

    d.text((80, 70), f"CONCEPT {num} / {total}", font=f(FONT_BOLD, 28), fill=CYAN)
    d.text((80, 110), name, font=f(FONT_BOLD, 80), fill=WHITE)
    d.text((80, 200), description, font=f(FONT_LIGHT, 28), fill=MUTED)

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

    # Box 3 — Wordmark lockup
    box3_x, box3_y = 80, 830
    box3_w = W - 160
    box3_h = 180
    d.rounded_rectangle([box3_x, box3_y, box3_x + box3_w, box3_y + box3_h], radius=20, fill=(15, 22, 45, 255))

    lockup_size = 130
    icon = builder_fn(lockup_size, on_dark=True)
    icon_x = box3_x + 50
    icon_y = box3_y + (box3_h - lockup_size) // 2
    bg.paste(icon, (icon_x, icon_y), icon)

    wm_x = icon_x + lockup_size + 30
    wm_y = box3_y + 55
    d.text((wm_x, wm_y), "VRIKAAN", font=f(FONT_BOLD, 70), fill=WHITE)
    d.text((wm_x, wm_y + 78), "AI Cyber Defense  ·  Loyal as a wolf", font=f(FONT_LIGHT, 22), fill=MUTED)

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

    d.text((W // 2 - 280, 130), "VRIKAAN", font=f(FONT_BOLD, 140), fill=WHITE)
    d.text((W // 2 - 250, 290), "Wolf-themed logo concepts", font=f(FONT_LIGHT, 40), fill=CYAN)

    # Brand meaning callout
    d.text((W // 2 - 380, 380), "🐺  Symbol of loyalty, intelligence, vigilance, and protection", font=f(FONT_REG, 24), fill=MUTED)

    # 5 concepts in row
    builders = [
        ("APEX", logo_apex),
        ("GUARDIAN", logo_guardian),
        ("VIGIL", logo_vigil),
        ("HOWL", logo_howl),
        ("PACK", logo_pack),
    ]
    icon_size = 220
    spacing = (W - 160 - len(builders) * icon_size) // (len(builders) - 1)
    sx = 80
    iy = 540
    for i, (name, fn) in enumerate(builders):
        ico = fn(icon_size, on_dark=True)
        bg.paste(ico, (sx + i * (icon_size + spacing), iy), ico)
        d.text(
            (sx + i * (icon_size + spacing) + icon_size // 2 - 50, iy + icon_size + 30),
            name,
            font=f(FONT_BOLD, 26),
            fill=CYAN,
        )

    d.text((W // 2 - 200, H - 80), "Designed for VRIKAAN  ·  by Claude", font=f(FONT_REG, 18), fill=MUTED)
    return bg


def build():
    print("Building wolf logo concept presentation...")

    slides = [title_slide()]

    concepts = [
        (
            "APEX", logo_apex,
            "Front-facing geometric wolf head with glowing cyan eyes.",
            ["Bold + memorable", "Strong silhouette at any size", "Cyber-tech feel via glow", "Most distinctive vs competitors"],
        ),
        (
            "GUARDIAN", logo_guardian,
            "Wolf head silhouette inside a shield — security + loyalty fused.",
            ["Most explicit security signal", "Heritage + classical", "Reads as 'protector' instantly", "Great for trust building"],
        ),
        (
            "VIGIL", logo_vigil,
            "Glowing wolf eyes peering from darkness — vigilant, watching.",
            ["Mysterious + memorable", "Strong dark-mode presence", "Distinctive at small sizes", "AI 'watching' metaphor"],
        ),
        (
            "HOWL", logo_howl,
            "Side-profile howling wolf inside a moon — heritage storytelling.",
            ["Brand storytelling rich", "Indian forest/wolf motif", "Pack-leader symbolism", "More artistic / less corporate"],
        ),
        (
            "PACK", logo_pack,
            "Stylized wolf with exaggerated ears that read as a V — branded ligature.",
            ["Letter + symbol fusion", "Memorable visual pun", "Versatile lockup", "Pairs well with VRIKAAN wordmark"],
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
        title="VRIKAAN Wolf Logo Concepts",
        author="Claude (designer)",
    )
    print(f"[OK] Concept deck: {OUT_PDF}  ({os.path.getsize(OUT_PDF)/1024:.1f} KB)")

    # Save individual logo PNGs
    for name, fn, _, _ in concepts:
        slug = name.lower()
        ico = fn(512, on_dark=True)
        ico.save(os.path.join(PNG_DIR, f"wolf_{slug}_dark_512.png"), "PNG")
        ico2 = fn(512, on_dark=False)
        ico2.save(os.path.join(PNG_DIR, f"wolf_{slug}_light_512.png"), "PNG")
        icof = fn(256, on_dark=True)
        icof.save(os.path.join(PNG_DIR, f"wolf_{slug}_favicon_256.png"), "PNG")

    print(f"[OK] PNG assets in: {PNG_DIR}/")


if __name__ == "__main__":
    build()
