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

# Full head — ear tips to bottom of chin/snout
# Then pad to square so the FULL wolf face stays visible at any display size
# (image will fit-contain in the box with transparent padding if needed)
w, h = src.size
left = int(w * 0.06)
right = int(w * 0.94)
top = int(h * 0.02)
bottom = int(h * 0.94)  # include full chin/jaw point
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
