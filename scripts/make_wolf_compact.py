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

# Tight crop — focus on the head only (skip the lower jaw + full mesh)
# wolf-clean-1024 has wolf centered. We want top 75% of height roughly.
w, h = src.size
# Pad horizontally 5%, crop top 5% to 80% (head + top of muzzle)
left = int(w * 0.08)
right = int(w * 0.92)
top = int(h * 0.05)
bottom = int(h * 0.78)
cropped = src.crop((left, top, right, bottom))
print(f"cropped: {cropped.size}")

# Resize to 256 max dim for crisp small-size rendering
target = 256
ratio = target / max(cropped.size)
new = (int(cropped.width * ratio), int(cropped.height * ratio))
out = cropped.resize(new, Image.LANCZOS)
out.save(OUT, "PNG", optimize=True)
print(f"saved: {OUT}  ({out.size[0]}x{out.size[1]}, {os.path.getsize(OUT)/1024:.1f} KB)")
