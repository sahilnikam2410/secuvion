"""
Swap the old pixel-art jungle scene in index.html with the new cinematic
cyber-forest. Replaces everything between `<div class="jungle-frame">`
and the matching closing `</div>` (one block) with the new scene markup.
"""
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
INDEX = os.path.join(ROOT, "index.html")

NEW_SCENE = """        <div class="jungle-frame">
          <svg width="420" height="160" viewBox="0 0 420 160" xmlns="http://www.w3.org/2000/svg" style="display:block">
            <defs>
              <linearGradient id="cw-sky" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%"   stop-color="#020411"/>
                <stop offset="40%"  stop-color="#0d1431"/>
                <stop offset="100%" stop-color="#020411"/>
              </linearGradient>
              <radialGradient id="cw-moon" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stop-color="#dde7ff" stop-opacity="0.95"/>
                <stop offset="50%"  stop-color="#6366f1" stop-opacity="0.30"/>
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
              </radialGradient>
              <linearGradient id="cw-moon-ray" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%"   stop-color="#cdd6ff" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="#cdd6ff" stop-opacity="0"/>
              </linearGradient>
              <linearGradient id="cw-fog-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%"   stop-color="#14e3c5" stop-opacity="0"/>
                <stop offset="50%"  stop-color="#14e3c5" stop-opacity="0.14"/>
                <stop offset="100%" stop-color="#0d1431" stop-opacity="0.6"/>
              </linearGradient>
              <linearGradient id="cw-trail-grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%"   stop-color="#14e3c5" stop-opacity="0"/>
                <stop offset="60%"  stop-color="#14e3c5" stop-opacity="0.6"/>
                <stop offset="100%" stop-color="#fff"    stop-opacity="0.85"/>
              </linearGradient>
              <linearGradient id="cw-scan-grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%"   stop-color="#14e3c5" stop-opacity="0"/>
                <stop offset="50%"  stop-color="#14e3c5" stop-opacity="0.5"/>
                <stop offset="100%" stop-color="#14e3c5" stop-opacity="0"/>
              </linearGradient>
              <radialGradient id="cw-vignette" cx="50%" cy="50%" r="60%">
                <stop offset="60%"  stop-color="#000" stop-opacity="0"/>
                <stop offset="100%" stop-color="#000" stop-opacity="0.65"/>
              </radialGradient>
              <symbol id="cw-pine" viewBox="0 0 24 60">
                <polygon points="12,0 22,55 2,55" fill="#040818" stroke="#1f2937" stroke-width="0.5"/>
                <line x1="12" y1="0" x2="12" y2="55" stroke="#0f1730" stroke-width="1"/>
                <circle cx="12" cy="2" r="1.4" fill="#14e3c5" opacity="0.8"/>
              </symbol>
              <symbol id="cw-pine-far" viewBox="0 0 16 36">
                <polygon points="8,0 14,32 2,32" fill="rgba(99,102,241,0.22)"/>
              </symbol>
              <filter id="cw-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            <rect width="420" height="160" fill="url(#cw-sky)"/>
            <polygon points="332,30 360,30 380,160 312,160" fill="url(#cw-moon-ray)" opacity="0.55"/>
            <circle cx="346" cy="32" r="22" fill="url(#cw-moon)"/>
            <circle cx="346" cy="32" r="10" fill="#f1f5f9"/>
            <circle cx="350" cy="30" r="9"  fill="#0d1431"/>

            <g>
              <circle class="cw-twinkle" cx="40"  cy="22" r="0.9" fill="#fff"/>
              <circle class="cw-twinkle" cx="80"  cy="14" r="0.7" fill="#fff" style="animation-delay:0.4s"/>
              <circle class="cw-twinkle" cx="125" cy="28" r="0.8" fill="#fff" style="animation-delay:0.9s"/>
              <circle class="cw-twinkle" cx="170" cy="18" r="0.6" fill="#fff" style="animation-delay:1.6s"/>
              <circle class="cw-twinkle" cx="220" cy="42" r="0.7" fill="#fff" style="animation-delay:0.7s"/>
              <circle class="cw-twinkle" cx="260" cy="20" r="0.8" fill="#fff" style="animation-delay:2.1s"/>
              <circle class="cw-twinkle" cx="395" cy="50" r="0.6" fill="#fff" style="animation-delay:1.2s"/>
            </g>

            <g class="cw-mist">
              <g>
                <polygon points="0,90 30,55 60,90"     fill="rgba(99,102,241,0.10)"/>
                <polygon points="50,90 90,50 130,90"   fill="rgba(99,102,241,0.10)"/>
                <polygon points="120,90 160,60 200,90" fill="rgba(99,102,241,0.10)"/>
                <polygon points="190,90 240,45 290,90" fill="rgba(99,102,241,0.10)"/>
                <polygon points="280,90 330,55 380,90" fill="rgba(99,102,241,0.10)"/>
              </g>
              <g transform="translate(420,0)">
                <polygon points="0,90 30,55 60,90"     fill="rgba(99,102,241,0.10)"/>
                <polygon points="50,90 90,50 130,90"   fill="rgba(99,102,241,0.10)"/>
                <polygon points="120,90 160,60 200,90" fill="rgba(99,102,241,0.10)"/>
                <polygon points="190,90 240,45 290,90" fill="rgba(99,102,241,0.10)"/>
              </g>
            </g>

            <g class="cw-far" transform="translate(0,72)">
              <g>
                <use href="#cw-pine-far" x="20"  width="14" height="32"/>
                <use href="#cw-pine-far" x="55"  width="12" height="28"/>
                <use href="#cw-pine-far" x="95"  width="14" height="32"/>
                <use href="#cw-pine-far" x="140" width="11" height="26"/>
                <use href="#cw-pine-far" x="180" width="13" height="30"/>
                <use href="#cw-pine-far" x="225" width="14" height="34"/>
                <use href="#cw-pine-far" x="265" width="11" height="26"/>
                <use href="#cw-pine-far" x="310" width="13" height="30"/>
                <use href="#cw-pine-far" x="355" width="14" height="32"/>
                <use href="#cw-pine-far" x="395" width="12" height="28"/>
              </g>
              <g transform="translate(420,0)">
                <use href="#cw-pine-far" x="20"  width="14" height="32"/>
                <use href="#cw-pine-far" x="55"  width="12" height="28"/>
                <use href="#cw-pine-far" x="95"  width="14" height="32"/>
                <use href="#cw-pine-far" x="140" width="11" height="26"/>
              </g>
            </g>

            <g class="cw-mid" transform="translate(0,60)">
              <g>
                <use href="#cw-pine" x="20"  width="20" height="50"/>
                <use href="#cw-pine" x="65"  width="22" height="55"/>
                <use href="#cw-pine" x="110" width="18" height="46"/>
                <use href="#cw-pine" x="155" width="24" height="60"/>
                <use href="#cw-pine" x="210" width="20" height="50"/>
                <use href="#cw-pine" x="260" width="22" height="55"/>
                <use href="#cw-pine" x="310" width="18" height="46"/>
                <use href="#cw-pine" x="360" width="24" height="60"/>
                <use href="#cw-pine" x="400" width="20" height="50"/>
              </g>
              <g transform="translate(420,0)">
                <use href="#cw-pine" x="20"  width="20" height="50"/>
                <use href="#cw-pine" x="65"  width="22" height="55"/>
                <use href="#cw-pine" x="110" width="18" height="46"/>
              </g>
            </g>

            <g class="cw-firefly-1">
              <circle cx="430" cy="50" r="1.2" fill="#14e3c5" filter="url(#cw-glow)"/>
              <circle cx="500" cy="80" r="0.9" fill="#14e3c5" filter="url(#cw-glow)" style="animation-delay:1s"/>
            </g>
            <g class="cw-firefly-2">
              <circle cx="450" cy="70" r="1.0" fill="#14e3c5" filter="url(#cw-glow)"/>
              <circle cx="520" cy="50" r="0.8" fill="#14e3c5" filter="url(#cw-glow)" style="animation-delay:2s"/>
              <circle cx="560" cy="90" r="1.1" fill="#14e3c5" filter="url(#cw-glow)" style="animation-delay:3s"/>
            </g>

            <line x1="0" y1="125" x2="420" y2="125" stroke="#1f2937" stroke-width="1"/>
            <line x1="0" y1="126" x2="420" y2="126" stroke="rgba(20,227,197,0.3)" stroke-width="0.5"/>

            <g class="cw-trail" transform="translate(120,118)">
              <ellipse cx="-20" cy="0" rx="40" ry="3" fill="url(#cw-trail-grad)"/>
            </g>

            <g class="cw-body" transform="translate(160,102)">
              <g class="cw-tail" transform="translate(-26,2)">
                <path d="M 0 0 Q -8 -2 -14 -1 Q -20 0 -26 -2 L -30 0 Q -22 4 -14 4 Q -6 4 0 2 Z" fill="#0a0f1e"/>
              </g>
              <path d="M -28 0 C -32 -4 -28 -10 -22 -12 L -10 -14 C -2 -15 8 -15 16 -13 C 22 -12 26 -10 30 -8 L 30 -10 L 34 -10 C 38 -10 40 -8 41 -5 L 44 -4 L 44 -1 L 41 0 C 36 1 30 1 24 0 L 18 0 C 10 0 0 0 -6 0 C -14 0 -22 0 -28 1 Z" fill="#0a0f1e" stroke="#1f2937" stroke-width="0.5"/>
              <path d="M 0 -14 L 4 -19 L 8 -14 Z" fill="#0a0f1e"/>
              <path d="M 8 -15 L 12 -20 L 16 -14 Z" fill="#0a0f1e"/>
              <path d="M 38 -7 L 41 -7 L 41 -3 L 38 -3 Z" fill="#000" opacity="0.5"/>
              <circle class="cw-eye" cx="32" cy="-9" r="1.4" fill="#14e3c5"/>
              <g class="cw-leg l-fl" transform="translate(20, 0)">
                <rect x="-1" y="0" width="2.2" height="9" fill="#0a0f1e"/>
                <rect x="-1.5" y="8" width="3" height="2" fill="#0a0f1e"/>
              </g>
              <g class="cw-leg l-fr" transform="translate(15, 0)">
                <rect x="-1" y="0" width="2" height="9" fill="#0a0f1e" opacity="0.85"/>
                <rect x="-1.5" y="8" width="3" height="2" fill="#0a0f1e" opacity="0.85"/>
              </g>
              <g class="cw-leg l-bl" transform="translate(-16, 0)">
                <rect x="-1" y="0" width="2" height="9" fill="#0a0f1e" opacity="0.85"/>
                <rect x="-1.5" y="8" width="3" height="2" fill="#0a0f1e" opacity="0.85"/>
              </g>
              <g class="cw-leg l-br" transform="translate(-21, 0)">
                <rect x="-1" y="0" width="2.2" height="9" fill="#0a0f1e"/>
                <rect x="-1.5" y="8" width="3" height="2" fill="#0a0f1e"/>
              </g>
            </g>

            <g transform="translate(140,124)">
              <circle class="cw-dust" cx="0"  cy="0" r="2"   fill="#94a3b8" opacity="0.5"/>
              <circle class="cw-dust" cx="-4" cy="0" r="1.5" fill="#94a3b8" opacity="0.4" style="animation-delay:0.18s"/>
              <circle class="cw-dust" cx="-8" cy="0" r="1.2" fill="#94a3b8" opacity="0.3" style="animation-delay:0.36s"/>
            </g>

            <g class="cw-grass" transform="translate(0,128)">
              <g>
                <rect x="0"   y="2" width="2" height="6" fill="#0a0f1e"/>
                <rect x="20"  y="0" width="2" height="8" fill="#0a0f1e"/>
                <rect x="40"  y="3" width="2" height="5" fill="#0a0f1e"/>
                <rect x="60"  y="1" width="2" height="7" fill="#0a0f1e"/>
                <rect x="80"  y="2" width="2" height="6" fill="#0a0f1e"/>
                <rect x="100" y="0" width="2" height="8" fill="#0a0f1e"/>
                <rect x="180" y="1" width="2" height="7" fill="#0a0f1e"/>
                <rect x="200" y="2" width="2" height="6" fill="#0a0f1e"/>
                <rect x="220" y="0" width="2" height="8" fill="#0a0f1e"/>
                <rect x="280" y="1" width="2" height="7" fill="#0a0f1e"/>
                <rect x="300" y="3" width="2" height="5" fill="#0a0f1e"/>
                <rect x="320" y="0" width="2" height="8" fill="#0a0f1e"/>
                <rect x="380" y="2" width="2" height="6" fill="#0a0f1e"/>
                <rect x="400" y="1" width="2" height="7" fill="#0a0f1e"/>
              </g>
              <g transform="translate(420,0)">
                <rect x="0"   y="2" width="2" height="6" fill="#0a0f1e"/>
                <rect x="20"  y="0" width="2" height="8" fill="#0a0f1e"/>
                <rect x="40"  y="3" width="2" height="5" fill="#0a0f1e"/>
                <rect x="60"  y="1" width="2" height="7" fill="#0a0f1e"/>
              </g>
            </g>

            <rect x="0" y="100" width="420" height="60" fill="url(#cw-fog-grad)" opacity="0.7"/>
            <rect class="cw-scan" x="0" y="0" width="60" height="160" fill="url(#cw-scan-grad)"/>
            <rect x="0" y="0" width="420" height="160" fill="url(#cw-vignette)"/>
          </svg>
        </div>"""

with open(INDEX, "r", encoding="utf-8") as f:
    content = f.read()

# Match the entire jungle-frame block (greedy across newlines)
pattern = re.compile(r'        <div class="jungle-frame">[\s\S]*?\n        </div>', re.MULTILINE)
new_content, n = pattern.subn(NEW_SCENE, content, count=1)
if n != 1:
    print(f"ERROR: expected 1 substitution, got {n}")
    raise SystemExit(1)

with open(INDEX, "w", encoding="utf-8") as f:
    f.write(new_content)
print(f"Replaced jungle-frame block in {INDEX}")
