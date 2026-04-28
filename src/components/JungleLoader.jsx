/**
 * VRIKAAN — Jungle Loader
 *
 * Cinematic moonlit-jungle scene with a wolf running through silhouetted
 * trees. Multi-layer parallax (4 depth planes), pulsing eyes, atmospheric
 * fog overlay. Used as the loading scene on splash + every navigation.
 *
 * Layers (back to front):
 *   1. Sky gradient + drifting stars
 *   2. Misty mountains (very slow parallax)
 *   3. Distant tree-line silhouette (slow parallax)
 *   4. Mid tree-line silhouette (medium parallax)
 *   5. Wolf running silhouette (centered, bobbing, pulsing eyes)
 *   6. Foreground grass (fast parallax)
 *   7. Atmospheric fog gradient overlay
 */
import React from "react";

const JungleLoader = ({ width = 360, height = 140 }) => (
  <div style={{ width, height, position: "relative", borderRadius: 12, overflow: "hidden", boxShadow: "0 0 40px rgba(20,227,197,0.15) inset" }}>
    <style>{`
      @keyframes jl-stars { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }
      @keyframes jl-px-slow { from { transform: translateX(0) } to { transform: translateX(-360px) } }
      @keyframes jl-px-mid  { from { transform: translateX(0) } to { transform: translateX(-360px) } }
      @keyframes jl-px-fast { from { transform: translateX(0) } to { transform: translateX(-360px) } }
      @keyframes jl-wolf-bob {
        0%,100% { transform: translateY(0) }
        25%     { transform: translateY(-3px) rotate(-1deg) }
        50%     { transform: translateY(-1px) }
        75%     { transform: translateY(-3px) rotate(1deg) }
      }
      @keyframes jl-eye-pulse { 0%,100% { opacity: 0.6 } 50% { opacity: 1 } }
      @keyframes jl-fog-drift { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      .jl-px-slow { animation: jl-px-slow 28s linear infinite; }
      .jl-px-mid  { animation: jl-px-mid 14s linear infinite; }
      .jl-px-fast { animation: jl-px-fast 5s linear infinite; }
      .jl-wolf    { animation: jl-wolf-bob 0.42s ease-in-out infinite; transform-origin: center bottom; }
      .jl-eye     { animation: jl-eye-pulse 1.4s ease-in-out infinite; }
      .jl-fog     { animation: jl-fog-drift 12s linear infinite; }
      .jl-twinkle { animation: jl-stars 2.4s ease-in-out infinite; }
    `}</style>

    <svg viewBox="0 0 360 140" width={width} height={height} xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        <linearGradient id="jl-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#0a0f1e"/>
          <stop offset="55%"  stopColor="#0d1431"/>
          <stop offset="100%" stopColor="#020411"/>
        </linearGradient>
        <radialGradient id="jl-moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dde7ff" stopOpacity="0.95"/>
          <stop offset="60%" stopColor="#6366f1" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="jl-fog" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#14e3c5" stopOpacity="0"/>
          <stop offset="60%"  stopColor="#14e3c5" stopOpacity="0.06"/>
          <stop offset="100%" stopColor="#14e3c5" stopOpacity="0.18"/>
        </linearGradient>
        <linearGradient id="jl-ground" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#020411"/>
          <stop offset="100%" stopColor="#000"/>
        </linearGradient>

        {/* Reusable tree-line patterns. We draw two copies side-by-side on each
            parallax group so the loop wraps seamlessly. */}
        <symbol id="jl-trees-far" viewBox="0 0 360 60">
          <path
            d="M 0 60 L 14 36 L 24 60 L 38 32 L 50 60 L 64 40 L 80 60 L 96 28 L 110 60 L 124 38 L 138 60 L 156 30 L 172 60 L 188 42 L 204 60 L 220 26 L 238 60 L 252 36 L 270 60 L 286 32 L 302 60 L 318 38 L 332 60 L 346 30 L 360 60 Z"
            fill="rgba(99,102,241,0.18)"
          />
        </symbol>

        <symbol id="jl-trees-mid" viewBox="0 0 360 80">
          <path
            d="M 0 80
               L 8 50 L 16 80 L 28 38 L 44 80 L 58 32 L 76 80 L 92 44 L 108 80 L 124 28 L 144 80
               L 162 36 L 180 80 L 198 22 L 220 80 L 240 40 L 260 80 L 280 24 L 302 80 L 322 38
               L 342 80 L 360 30 L 360 80 Z"
            fill="#070b1c"
          />
        </symbol>

        <symbol id="jl-grass" viewBox="0 0 360 30">
          <path
            d="M 0 30 L 6 20 L 9 30 L 14 22 L 18 30 L 22 18 L 26 30 L 30 24 L 34 30 L 40 16 L 44 30
               L 48 22 L 52 30 L 56 14 L 62 30 L 66 24 L 70 30 L 76 18 L 80 30 L 84 22 L 88 30
               L 94 16 L 100 30 L 106 22 L 110 30 L 116 18 L 120 30 L 126 14 L 132 30 L 138 22
               L 144 30 L 150 18 L 156 30 L 162 24 L 168 30 L 174 16 L 180 30 L 186 22 L 192 30
               L 200 18 L 208 30 L 216 24 L 224 30 L 232 18 L 240 30 L 248 22 L 256 30 L 264 16
               L 272 30 L 280 22 L 288 30 L 296 18 L 304 30 L 314 24 L 322 30 L 332 18 L 340 30
               L 350 22 L 360 30 Z"
            fill="#000"
          />
        </symbol>
      </defs>

      {/* 1. Sky */}
      <rect width="360" height="140" fill="url(#jl-sky)"/>

      {/* 2. Moon + halo (fixed) */}
      <circle cx="290" cy="32" r="18" fill="url(#jl-moon-glow)" opacity="0.9"/>
      <circle cx="290" cy="32" r="8" fill="#f1f5f9" opacity="0.85"/>

      {/* 3. Stars (twinkling) */}
      <g>
        <circle className="jl-twinkle" cx="40"  cy="22" r="0.8" fill="#fff"/>
        <circle className="jl-twinkle" cx="80"  cy="14" r="0.6" fill="#fff" style={{ animationDelay: "0.4s" }}/>
        <circle className="jl-twinkle" cx="125" cy="28" r="0.7" fill="#fff" style={{ animationDelay: "0.9s" }}/>
        <circle className="jl-twinkle" cx="170" cy="18" r="0.5" fill="#fff" style={{ animationDelay: "1.6s" }}/>
        <circle className="jl-twinkle" cx="220" cy="40" r="0.6" fill="#fff" style={{ animationDelay: "0.7s" }}/>
        <circle className="jl-twinkle" cx="245" cy="20" r="0.7" fill="#fff" style={{ animationDelay: "2.1s" }}/>
        <circle className="jl-twinkle" cx="335" cy="48" r="0.5" fill="#fff" style={{ animationDelay: "1.2s" }}/>
      </g>

      {/* 4. Distant tree-line (slow parallax) */}
      <g transform="translate(0,55)" style={{ overflow: "visible" }}>
        <g className="jl-px-slow">
          <use href="#jl-trees-far" />
          <use href="#jl-trees-far" x="360"/>
        </g>
      </g>

      {/* 5. Mid tree-line (faster) */}
      <g transform="translate(0,55)" style={{ overflow: "visible" }}>
        <g className="jl-px-mid">
          <use href="#jl-trees-mid" />
          <use href="#jl-trees-mid" x="360"/>
        </g>
      </g>

      {/* 6. Ground strip */}
      <rect x="0" y="118" width="360" height="22" fill="url(#jl-ground)"/>

      {/* 7. Wolf running silhouette (centered, bobbing) */}
      <g className="jl-wolf" transform="translate(160,118)">
        {/* body / head silhouette in profile, head pointing right */}
        <path
          d="M -36 -2
             C -38 -10 -32 -14 -26 -14
             L -18 -16
             C -10 -18 -2 -18 6 -16
             C 12 -14 18 -12 22 -8
             L 26 -10
             L 30 -8
             L 32 -10
             L 34 -6
             L 32 -2
             L 26 -1
             C 18 0 10 0 0 -1
             C -8 -1 -16 0 -22 1
             L -26 4
             L -28 6
             L -32 6
             L -36 4
             Z"
          fill="#000"
          stroke="#1a1f3a"
          strokeWidth="0.5"
        />
        {/* ear */}
        <path d="M -10 -16 L -6 -22 L -2 -16 Z" fill="#000"/>
        {/* tail */}
        <path d="M -36 -2 L -44 -6 L -42 -1 Z" fill="#000"/>
        {/* legs (front + back, shown mid-stride) */}
        <rect x="-16" y="2" width="2.5" height="6" fill="#000"/>
        <rect x="-22" y="3" width="2.5" height="5" fill="#000" transform="rotate(15 -21 5)"/>
        <rect x="14"  y="2" width="2.5" height="6" fill="#000"/>
        <rect x="18"  y="3" width="2.5" height="5" fill="#000" transform="rotate(-15 19 5)"/>
        {/* glowing eye */}
        <circle className="jl-eye" cx="26" cy="-6" r="1.2" fill="#14e3c5">
          <animate attributeName="r" values="1;1.6;1" dur="1.4s" repeatCount="indefinite"/>
        </circle>
      </g>

      {/* 8. Foreground grass (fast parallax) */}
      <g transform="translate(0,108)" style={{ overflow: "visible" }}>
        <g className="jl-px-fast">
          <use href="#jl-grass" />
          <use href="#jl-grass" x="360"/>
        </g>
      </g>

      {/* 9. Atmospheric fog gradient overlay */}
      <rect width="360" height="140" fill="url(#jl-fog)" opacity="0.6"/>
    </svg>
  </div>
);

export default JungleLoader;
