"""
Generate /public/wolf-mark.png — transparent-background origami wolf
sized for inline UI use (navbar, footer, chatbot).

Unlike wolf-icon.png (dark rounded base, used for iOS/PWA),
this one has NO background so it sits naturally on any dark UI surface.
"""
import os
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "brand_assets", "wolf-clean-1024.png")
OUT = os.path.join(ROOT, "public", "wolf-mark.png")

src = Image.open(SRC).convert("RGBA")
# Auto-crop to bbox, then resize for crisp small-size rendering
bbox = src.getbbox()
src = src.crop(bbox)

# Output 256px (sharp on retina even at 36px display size)
target = 256
ratio = target / max(src.size)
new = (int(src.width * ratio), int(src.height * ratio))
out = src.resize(new, Image.LANCZOS)
out.save(OUT, "PNG", optimize=True)
print(f"Saved: {OUT}  ({out.size[0]}x{out.size[1]}, {os.path.getsize(OUT)/1024:.1f} KB)")
