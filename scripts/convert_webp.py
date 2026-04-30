"""
Convert public/*.png brand assets to WebP for ~40-60% size reduction
without visible quality loss. Keeps the original .png files so existing
<img src="/foo.png"> references still work as fallback; you can either
swap to <picture> with WebP source, or just point img tags to the .webp
once verified.

Run:
    python scripts/convert_webp.py
"""
import os
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUBLIC = os.path.join(ROOT, "public")
QUALITY = 85  # 75-90 sweet spot for photographic + UI mixed

CANDIDATES = [
    "wolf-mark.png",
    "wolf-compact.png",
    "wolf-icon.png",
    "og-image.png",
    "apple-touch-icon.png",
    "icon-192.png",
    "icon-512.png",
    "icon-maskable-512.png",
]


def convert(filename):
    src = os.path.join(PUBLIC, filename)
    if not os.path.exists(src):
        return None
    dst = os.path.splitext(src)[0] + ".webp"
    img = Image.open(src).convert("RGBA")
    img.save(dst, "WEBP", quality=QUALITY, method=6)
    src_size = os.path.getsize(src)
    dst_size = os.path.getsize(dst)
    saved = (1 - dst_size / src_size) * 100
    return (filename, src_size, dst_size, saved)


def main():
    print(f"WebP conversion (quality={QUALITY})\n")
    print(f"{'File':<28} {'PNG':>8} {'WebP':>8} {'Saved':>7}")
    print("-" * 56)
    total_png = 0
    total_webp = 0
    for f in CANDIDATES:
        result = convert(f)
        if result is None:
            print(f"{f:<28} -- not found --")
            continue
        name, png, webp, pct = result
        total_png += png
        total_webp += webp
        print(f"{name:<28} {png/1024:>6.1f}K {webp/1024:>6.1f}K {pct:>5.1f}%")
    if total_png:
        print("-" * 56)
        print(f"{'TOTAL':<28} {total_png/1024:>6.1f}K {total_webp/1024:>6.1f}K {(1 - total_webp/total_png)*100:>5.1f}%")
        print(f"\nSaved {(total_png - total_webp)/1024:.1f}KB across all assets.")


if __name__ == "__main__":
    main()
