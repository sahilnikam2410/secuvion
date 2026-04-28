"""
Create wolf-mark-compact.png — tight crop of just the wolf head/face,
optimized to read at small sizes (40-60px) in navbar/footer.

The full wolf-mark.png includes the wireframe mesh background which
disappears at small sizes. By cropping tighter to just the head, the
distinctive wolf features (ears, eyes, snout) take up the full frame
and remain visible even at 36-48px display size.
"""
import os
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "brand_assets", "wolf-clean-1024.png")
OUT = os.path.join(ROOT, "public", "wolf-compact.png")

src = Image.open(SRC).convert("RGBA")
print(f"source: {src.size}")

# SUPER tight crop — just the head (ears + eyes + top of snout, NO lower jaw)
# Square aspect so it can render in equal width/height boxes without distortion
w, h = src.size
left = int(w * 0.10)
right = int(w * 0.90)
top = int(h * 0.06)
bottom = int(h * 0.62)  # cut off at top of muzzle, before lower jaw
cropped = src.crop((left, top, right, bottom))

# Pad to square so display fits in width=height containers cleanly
cw, ch = cropped.size
side = max(cw, ch)
square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
square.paste(cropped, ((side - cw) // 2, (side - ch) // 2), cropped)
cropped = square
print(f"cropped: {cropped.size}")

# Resize to 256 max dim for crisp small-size rendering
target = 256
ratio = target / max(cropped.size)
new = (int(cropped.width * ratio), int(cropped.height * ratio))
out = cropped.resize(new, Image.LANCZOS)
out.save(OUT, "PNG", optimize=True)
print(f"saved: {OUT}  ({out.size[0]}x{out.size[1]}, {os.path.getsize(OUT)/1024:.1f} KB)")
