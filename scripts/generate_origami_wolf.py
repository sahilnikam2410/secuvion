"""
VRIKAAN — APEX v2: Low-poly origami wolf head.

Modeled after a folded-paper / faceted-polygon aesthetic with:
  - 30+ triangular facets
  - 5 shading levels (highlight → midlight → mid → middark → shadow)
  - Anatomically accurate wolf structure (brow ridge, cheekbones, snout, ears)
  - Symmetric left/right with deliberate asymmetric highlights

Renders both:
  - Monochrome (white-on-dark, like the reference photo)
  - Brand color (cyan/indigo gradient with shading)
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(ROOT, "logo_assets")
os.makedirs(OUT_DIR, exist_ok=True)

# Brand
BG_DARK = (10, 15, 30)
BG_DEEP = (3, 7, 18)
ACCENT = (99, 102, 241)
CYAN = (20, 227, 197)


def render_origami_wolf(size=1024, palette="mono", show_bg=False):
    """Render origami wolf head.

    palette: 'mono' (white-grey on dark) | 'brand' (cyan/indigo shading)
    show_bg: True draws a dark background, False = transparent
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    if show_bg:
        d_bg = ImageDraw.Draw(img)
        d_bg.rectangle([0, 0, size, size], fill=BG_DEEP + (255,))

    d = ImageDraw.Draw(img, "RGBA")

    # Center the wolf
    cx = size // 2
    cy = int(size * 0.55)

    def P(rx, ry):
        """Convert relative coords to absolute pixels. rx, ry in [-1, 1] roughly."""
        return (int(cx + rx * size * 0.42), int(cy + ry * size * 0.42))

    # ─── PALETTE (5 shading levels) ───
    if palette == "mono":
        # Off-white origami paper look
        H1 = (250, 252, 255)   # highlight
        H2 = (215, 220, 230)   # mid-light
        H3 = (160, 168, 185)   # mid
        H4 = (90, 100, 120)    # mid-dark
        H5 = (45, 52, 68)      # shadow
        EYE = (15, 20, 35)
        OUTLINE = (25, 30, 45, 0)  # invisible outline (transparent)
    else:  # brand
        H1 = (180, 240, 230)   # near-white cyan
        H2 = (90, 200, 200)
        H3 = (60, 130, 185)
        H4 = (80, 80, 165)     # indigo
        H5 = (50, 50, 110)
        EYE = (10, 15, 30)
        OUTLINE = (30, 30, 60, 0)

    # ──────────────────────────────────────
    # FACETS — defined as relative coordinates
    # Walking from top to bottom, left to right
    # ──────────────────────────────────────

    # ─── EARS ───
    # Left ear: outer, mid, inner-shadow facets
    facets_ears = [
        # Left ear outer (largest, brightest)
        ([P(-0.85, -1.40), P(-0.55, -2.00), P(-0.40, -1.05)], H2),
        # Left ear front facet (slightly darker)
        ([P(-0.55, -2.00), P(-0.30, -1.70), P(-0.40, -1.05)], H1),
        # Left ear inner triangle (darkest — represents inner ear shadow)
        ([P(-0.55, -1.85), P(-0.40, -1.05), P(-0.30, -1.70)], H4),
        # Left ear bottom-side facet
        ([P(-0.85, -1.40), P(-0.85, -0.80), P(-0.40, -1.05)], H3),

        # Right ear (mirror)
        ([P(0.85, -1.40), P(0.55, -2.00), P(0.40, -1.05)], H1),
        ([P(0.55, -2.00), P(0.30, -1.70), P(0.40, -1.05)], H2),
        ([P(0.55, -1.85), P(0.40, -1.05), P(0.30, -1.70)], H4),
        ([P(0.85, -1.40), P(0.85, -0.80), P(0.40, -1.05)], H3),
    ]

    # ─── FOREHEAD / TOP OF HEAD ───
    facets_forehead = [
        # Top-left forehead panel (between left ear and center)
        ([P(-0.40, -1.05), P(-0.30, -1.70), P(0.0, -1.30), P(-0.20, -0.85)], H1),
        # Top-right forehead panel (mirror)
        ([P(0.40, -1.05), P(0.30, -1.70), P(0.0, -1.30), P(0.20, -0.85)], H2),
        # CENTRAL HERO TRIANGLE — the bright forehead diamond (signature of origami wolves)
        ([P(0.0, -1.30), P(-0.20, -0.85), P(0.0, -0.30), P(0.20, -0.85)], H1),
    ]

    # ─── BROW RIDGES (over the eyes) ───
    facets_brows = [
        # Left brow ridge (catches highlight)
        ([P(-0.40, -1.05), P(-0.20, -0.85), P(-0.30, -0.45), P(-0.55, -0.55)], H2),
        # Left brow shadow underneath (dark triangle creating eye socket)
        ([P(-0.30, -0.45), P(-0.20, -0.85), P(-0.10, -0.40)], H4),
        # Right brow ridge
        ([P(0.40, -1.05), P(0.20, -0.85), P(0.30, -0.45), P(0.55, -0.55)], H1),
        # Right brow shadow
        ([P(0.30, -0.45), P(0.20, -0.85), P(0.10, -0.40)], H4),
    ]

    # ─── CHEEKS / SIDE OF FACE ───
    facets_cheeks = [
        # Left upper cheek (catches light)
        ([P(-0.55, -0.55), P(-0.85, -0.80), P(-0.85, -0.10), P(-0.55, -0.10)], H3),
        # Left mid cheek
        ([P(-0.55, -0.55), P(-0.55, -0.10), P(-0.30, -0.45), P(-0.30, -0.05)], H2),
        # Left cheek bottom (jawline shadow)
        ([P(-0.85, -0.10), P(-0.55, -0.10), P(-0.50, 0.30), P(-0.80, 0.10)], H3),
        # Left jaw outer (dark)
        ([P(-0.80, 0.10), P(-0.50, 0.30), P(-0.40, 0.55)], H4),
        # Left fur fluff (jaw side panel)
        ([P(-0.85, -0.10), P(-1.0, 0.10), P(-0.80, 0.10)], H4),

        # Right side mirror
        ([P(0.55, -0.55), P(0.85, -0.80), P(0.85, -0.10), P(0.55, -0.10)], H2),
        ([P(0.55, -0.55), P(0.55, -0.10), P(0.30, -0.45), P(0.30, -0.05)], H3),
        ([P(0.85, -0.10), P(0.55, -0.10), P(0.50, 0.30), P(0.80, 0.10)], H4),
        ([P(0.80, 0.10), P(0.50, 0.30), P(0.40, 0.55)], H5),
        ([P(0.85, -0.10), P(1.0, 0.10), P(0.80, 0.10)], H5),
    ]

    # ─── SNOUT ───
    facets_snout = [
        # Top of snout (between eyes, bright ridge)
        ([P(-0.10, -0.40), P(0.10, -0.40), P(0.0, -0.05)], H1),
        # Left side of snout (medium)
        ([P(-0.10, -0.40), P(0.0, -0.05), P(-0.20, 0.10), P(-0.30, -0.05)], H3),
        # Right side of snout (lighter)
        ([P(0.10, -0.40), P(0.0, -0.05), P(0.20, 0.10), P(0.30, -0.05)], H2),
        # Snout bridge bottom (mid-dark)
        ([P(-0.20, 0.10), P(0.0, -0.05), P(0.20, 0.10), P(0.0, 0.30)], H3),
        # Nose (very dark triangle at tip)
        ([P(-0.12, 0.18), P(0.12, 0.18), P(0.0, 0.35)], H5),
        # Nose top facet (medium)
        ([P(-0.12, 0.18), P(0.12, 0.18), P(0.0, 0.05)], H4),
    ]

    # ─── MOUTH / LOWER FACE ───
    facets_mouth = [
        # Left mouth shadow
        ([P(-0.30, -0.05), P(-0.20, 0.10), P(-0.25, 0.45), P(-0.40, 0.30)], H4),
        # Right mouth shadow
        ([P(0.30, -0.05), P(0.20, 0.10), P(0.25, 0.45), P(0.40, 0.30)], H5),
        # Lower lip / muzzle dark area
        ([P(-0.20, 0.30), P(0.20, 0.30), P(0.15, 0.55), P(-0.15, 0.55)], H5),
        # Chin bottom (lighter)
        ([P(-0.15, 0.55), P(0.15, 0.55), P(0.0, 0.85)], H3),
        # Chin point shadow
        ([P(-0.25, 0.45), P(-0.15, 0.55), P(0.0, 0.85), P(-0.40, 0.55)], H4),
        ([P(0.25, 0.45), P(0.15, 0.55), P(0.0, 0.85), P(0.40, 0.55)], H4),
    ]

    # ─── EYES (on top of brows) ───
    facets_eyes = [
        # Left eye — sharp slanted slit, dark
        ([P(-0.30, -0.55), P(-0.10, -0.60), P(-0.10, -0.45), P(-0.30, -0.40)], EYE),
        # Right eye
        ([P(0.30, -0.55), P(0.10, -0.60), P(0.10, -0.45), P(0.30, -0.40)], EYE),
    ]

    # ─── EYE GLOWS (subtle inner bright spot) ───
    # Add tiny highlights inside the dark eyes — gives them life
    eye_highlights = [
        ([P(-0.22, -0.52), P(-0.16, -0.54), P(-0.16, -0.48), P(-0.22, -0.46)],
         CYAN if palette == "brand" else (200, 220, 240)),
        ([P(0.22, -0.52), P(0.16, -0.54), P(0.16, -0.48), P(0.22, -0.46)],
         CYAN if palette == "brand" else (200, 220, 240)),
    ]

    # ─── Render order (back to front) ───
    all_facets = (
        facets_ears +
        facets_forehead +
        facets_brows +
        facets_cheeks +
        facets_snout +
        facets_mouth +
        facets_eyes +
        eye_highlights
    )

    for poly, color in all_facets:
        if len(color) == 3:
            color = color + (255,)
        d.polygon(poly, fill=color, outline=OUTLINE)

    # ─── Subtle outline pass for definition (very thin black lines along edges) ───
    # Adds the "fold line" feel of origami
    fold_lines = [
        # Forehead diamond edges
        (P(0.0, -1.30), P(-0.20, -0.85)),
        (P(0.0, -1.30), P(0.20, -0.85)),
        (P(-0.20, -0.85), P(0.0, -0.30)),
        (P(0.20, -0.85), P(0.0, -0.30)),
        # Snout center ridge
        (P(0.0, -0.30), P(0.0, -0.05)),
        (P(0.0, -0.05), P(0.0, 0.30)),
        # Brow lines
        (P(-0.40, -1.05), P(-0.20, -0.85)),
        (P(0.40, -1.05), P(0.20, -0.85)),
    ]
    for a, b in fold_lines:
        d.line([a, b], fill=(0, 0, 0, 60), width=max(1, size // 600))

    return img


def main():
    print("Rendering origami wolf — APEX v2...\n")

    # Mono on transparent (matches reference photo)
    mono = render_origami_wolf(1024, palette="mono", show_bg=False)
    p = os.path.join(OUT_DIR, "apex_v2_mono_1024.png")
    mono.save(p, "PNG", optimize=True)
    print(f"  [mono] {p}")

    # Mono on dark
    mono_bg = render_origami_wolf(1024, palette="mono", show_bg=True)
    p = os.path.join(OUT_DIR, "apex_v2_mono_dark_1024.png")
    mono_bg.save(p, "PNG", optimize=True)
    print(f"  [mono-dark] {p}")

    # Brand color
    brand = render_origami_wolf(1024, palette="brand", show_bg=False)
    p = os.path.join(OUT_DIR, "apex_v2_brand_1024.png")
    brand.save(p, "PNG", optimize=True)
    print(f"  [brand] {p}")

    # Brand color on dark
    brand_bg = render_origami_wolf(1024, palette="brand", show_bg=True)
    p = os.path.join(OUT_DIR, "apex_v2_brand_dark_1024.png")
    brand_bg.save(p, "PNG", optimize=True)
    print(f"  [brand-dark] {p}")

    # Larger 2048 for hero
    hero = render_origami_wolf(2048, palette="brand", show_bg=False)
    p = os.path.join(OUT_DIR, "apex_v2_hero_2048.png")
    hero.save(p, "PNG", optimize=True)
    print(f"  [hero] {p}")

    print("\nDone. Open the PNGs to compare with the reference.")


if __name__ == "__main__":
    main()
