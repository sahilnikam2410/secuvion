/**
 * VRIKAAN — Chrome-Dino-style Pixel Wolf Loader
 *
 * Inspired by the Chrome offline T-rex game. Pixel-perfect wolf running
 * across an endless ground with cacti scrolling toward it. Brand-tinted:
 * white wolf on deep navy, cyan eye, cyan accent on cacti.
 *
 * No anti-aliasing — every shape uses shapeRendering="crispEdges" so the
 * pixel-art look is preserved at any zoom level.
 */
import React from "react";

const JungleLoader = ({ width = 360, height = 110 }) => (
  <div style={{ width, height, position: "relative", borderRadius: 8, overflow: "hidden", background: "#030712", border: "1px solid rgba(20,227,197,0.18)", boxShadow: "0 0 24px rgba(20,227,197,0.12) inset" }}>
    <style>{`
      @keyframes pl-scroll-fast { from { transform: translateX(0) } to { transform: translateX(-360px) } }
      @keyframes pl-scroll-mid  { from { transform: translateX(0) } to { transform: translateX(-360px) } }
      @keyframes pl-scroll-slow { from { transform: translateX(0) } to { transform: translateX(-360px) } }
      @keyframes pl-leg-1 { 0%,49% { transform: translateY(0); } 50%,100% { transform: translateY(2px); } }
      @keyframes pl-leg-2 { 0%,49% { transform: translateY(2px); } 50%,100% { transform: translateY(0); } }
      @keyframes pl-eye   { 0%,40% { fill: #14e3c5 } 50%,90% { fill: #fff } 100% { fill: #14e3c5 } }
      @keyframes pl-twinkle { 0%,100% { opacity: 0.3 } 50% { opacity: 1 } }
      .pl-cacti { animation: pl-scroll-fast 3.5s linear infinite; }
      .pl-stars { animation: pl-scroll-slow 30s linear infinite; }
      .pl-mountains { animation: pl-scroll-mid 18s linear infinite; }
      .pl-leg-1 { animation: pl-leg-1 0.22s steps(1) infinite; }
      .pl-leg-2 { animation: pl-leg-2 0.22s steps(1) infinite; }
      .pl-eye-blink { animation: pl-eye 1.4s steps(1) infinite; }
      .pl-twinkle { animation: pl-twinkle 2s ease-in-out infinite; }
    `}</style>

    <svg
      viewBox="0 0 360 110"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ display: "block", imageRendering: "pixelated" }}
    >
      {/* Stars (slow parallax) */}
      <g className="pl-stars">
        <g>
          <rect className="pl-twinkle" x="40"  y="14" width="2" height="2" fill="#fff"/>
          <rect className="pl-twinkle" x="86"  y="22" width="2" height="2" fill="#fff" style={{ animationDelay: "0.5s" }}/>
          <rect className="pl-twinkle" x="140" y="10" width="2" height="2" fill="#fff" style={{ animationDelay: "1.2s" }}/>
          <rect className="pl-twinkle" x="200" y="20" width="2" height="2" fill="#fff" style={{ animationDelay: "0.8s" }}/>
          <rect className="pl-twinkle" x="260" y="14" width="2" height="2" fill="#fff" style={{ animationDelay: "1.6s" }}/>
          <rect className="pl-twinkle" x="320" y="24" width="2" height="2" fill="#fff" style={{ animationDelay: "0.3s" }}/>
        </g>
        <g transform="translate(360,0)">
          <rect x="40"  y="14" width="2" height="2" fill="#fff" opacity="0.5"/>
          <rect x="86"  y="22" width="2" height="2" fill="#fff" opacity="0.6"/>
          <rect x="140" y="10" width="2" height="2" fill="#fff" opacity="0.5"/>
          <rect x="200" y="20" width="2" height="2" fill="#fff" opacity="0.7"/>
          <rect x="260" y="14" width="2" height="2" fill="#fff" opacity="0.4"/>
          <rect x="320" y="24" width="2" height="2" fill="#fff" opacity="0.6"/>
        </g>
      </g>

      {/* Pixel moon (top right) */}
      <g transform="translate(308,18)">
        <rect x="0"  y="2" width="2" height="6" fill="#94a3b8"/>
        <rect x="2"  y="0" width="6" height="2" fill="#94a3b8"/>
        <rect x="2"  y="8" width="6" height="2" fill="#94a3b8"/>
        <rect x="8"  y="2" width="2" height="6" fill="#94a3b8"/>
        <rect x="2"  y="2" width="6" height="6" fill="#cbd5e1"/>
      </g>

      {/* Distant pixel mountains (medium parallax) */}
      <g className="pl-mountains">
        <g transform="translate(0,40)">
          <rect x="20"  y="14" width="2" height="2" fill="#1f2937"/>
          <rect x="22"  y="12" width="2" height="2" fill="#1f2937"/>
          <rect x="24"  y="10" width="2" height="2" fill="#1f2937"/>
          <rect x="26"  y="8"  width="2" height="2" fill="#1f2937"/>
          <rect x="28"  y="6"  width="2" height="2" fill="#1f2937"/>
          <rect x="30"  y="8"  width="2" height="2" fill="#1f2937"/>
          <rect x="32"  y="10" width="2" height="2" fill="#1f2937"/>
          <rect x="34"  y="12" width="2" height="2" fill="#1f2937"/>
          <rect x="36"  y="14" width="2" height="2" fill="#1f2937"/>
          <rect x="100" y="16" width="2" height="2" fill="#1f2937"/>
          <rect x="102" y="14" width="2" height="2" fill="#1f2937"/>
          <rect x="104" y="12" width="2" height="2" fill="#1f2937"/>
          <rect x="106" y="14" width="2" height="2" fill="#1f2937"/>
          <rect x="108" y="16" width="2" height="2" fill="#1f2937"/>
          <rect x="220" y="14" width="2" height="2" fill="#1f2937"/>
          <rect x="222" y="12" width="2" height="2" fill="#1f2937"/>
          <rect x="224" y="10" width="2" height="2" fill="#1f2937"/>
          <rect x="226" y="8"  width="2" height="2" fill="#1f2937"/>
          <rect x="228" y="10" width="2" height="2" fill="#1f2937"/>
          <rect x="230" y="12" width="2" height="2" fill="#1f2937"/>
          <rect x="232" y="14" width="2" height="2" fill="#1f2937"/>
        </g>
        <g transform="translate(360,40)">
          <rect x="20"  y="14" width="2" height="2" fill="#1f2937"/>
          <rect x="22"  y="12" width="2" height="2" fill="#1f2937"/>
          <rect x="24"  y="10" width="2" height="2" fill="#1f2937"/>
          <rect x="26"  y="8"  width="2" height="2" fill="#1f2937"/>
          <rect x="28"  y="6"  width="2" height="2" fill="#1f2937"/>
          <rect x="30"  y="8"  width="2" height="2" fill="#1f2937"/>
          <rect x="32"  y="10" width="2" height="2" fill="#1f2937"/>
          <rect x="34"  y="12" width="2" height="2" fill="#1f2937"/>
          <rect x="36"  y="14" width="2" height="2" fill="#1f2937"/>
          <rect x="100" y="16" width="2" height="2" fill="#1f2937"/>
          <rect x="102" y="14" width="2" height="2" fill="#1f2937"/>
          <rect x="104" y="12" width="2" height="2" fill="#1f2937"/>
          <rect x="106" y="14" width="2" height="2" fill="#1f2937"/>
          <rect x="220" y="14" width="2" height="2" fill="#1f2937"/>
          <rect x="222" y="12" width="2" height="2" fill="#1f2937"/>
          <rect x="224" y="10" width="2" height="2" fill="#1f2937"/>
          <rect x="226" y="8"  width="2" height="2" fill="#1f2937"/>
          <rect x="228" y="10" width="2" height="2" fill="#1f2937"/>
          <rect x="230" y="12" width="2" height="2" fill="#1f2937"/>
        </g>
      </g>

      {/* Ground line (dashed pixel pattern) */}
      <g transform="translate(0,86)">
        {Array.from({ length: 90 }).map((_, i) => (
          <rect key={i} x={i * 4} y="0" width="2" height="1" fill="#94a3b8"/>
        ))}
      </g>
      {/* Tiny ground bumps for texture */}
      <rect x="20"  y="88" width="2" height="2" fill="#475569"/>
      <rect x="120" y="88" width="2" height="2" fill="#475569"/>
      <rect x="240" y="88" width="2" height="2" fill="#475569"/>
      <rect x="320" y="88" width="2" height="2" fill="#475569"/>

      {/* Cacti / obstacles (fast scroll) */}
      <g className="pl-cacti">
        {/* Cactus 1 — small */}
        <g transform="translate(120,68)">
          <rect x="0" y="0"  width="4" height="18" fill="#fff"/>
          <rect x="-3" y="6" width="3" height="2" fill="#fff"/>
          <rect x="-3" y="6" width="2" height="6" fill="#fff"/>
          <rect x="4" y="4"  width="3" height="2" fill="#fff"/>
          <rect x="6" y="4"  width="2" height="8" fill="#fff"/>
        </g>
        {/* Cactus 2 — tall */}
        <g transform="translate(240,60)">
          <rect x="0" y="0"  width="4" height="26" fill="#fff"/>
          <rect x="-4" y="8" width="4" height="2" fill="#fff"/>
          <rect x="-4" y="8" width="2" height="8" fill="#fff"/>
          <rect x="4" y="4"  width="4" height="2" fill="#fff"/>
          <rect x="6" y="4"  width="2" height="10" fill="#fff"/>
        </g>
        {/* Cactus 3 — cluster */}
        <g transform="translate(330,68)">
          <rect x="0" y="0" width="3" height="18" fill="#fff"/>
          <rect x="4" y="4" width="3" height="14" fill="#fff"/>
          <rect x="8" y="2" width="3" height="16" fill="#fff"/>
        </g>
        {/* Duplicate cluster offset 360 for seamless loop */}
        <g transform="translate(480,68)">
          <rect x="0" y="0"  width="4" height="18" fill="#fff"/>
          <rect x="-3" y="6" width="3" height="2" fill="#fff"/>
          <rect x="-3" y="6" width="2" height="6" fill="#fff"/>
          <rect x="4" y="4"  width="3" height="2" fill="#fff"/>
          <rect x="6" y="4"  width="2" height="8" fill="#fff"/>
        </g>
        <g transform="translate(600,60)">
          <rect x="0" y="0"  width="4" height="26" fill="#fff"/>
          <rect x="-4" y="8" width="4" height="2" fill="#fff"/>
          <rect x="-4" y="8" width="2" height="8" fill="#fff"/>
          <rect x="4" y="4"  width="4" height="2" fill="#fff"/>
          <rect x="6" y="4"  width="2" height="10" fill="#fff"/>
        </g>
      </g>

      {/* Pixel wolf running (centered, fixed x) */}
      <g transform="translate(60,60)">
        {/* Tail */}
        <rect x="-6" y="8" width="2" height="2" fill="#fff"/>
        <rect x="-4" y="8" width="2" height="2" fill="#fff"/>
        {/* Body block */}
        <rect x="-2" y="6"  width="22" height="8" fill="#fff"/>
        {/* Belly indent */}
        <rect x="2"  y="14" width="14" height="2" fill="#fff"/>
        {/* Neck rising up */}
        <rect x="14" y="2"  width="6" height="6" fill="#fff"/>
        {/* Head */}
        <rect x="18" y="0"  width="8" height="6" fill="#fff"/>
        {/* Snout */}
        <rect x="24" y="2"  width="4" height="4" fill="#fff"/>
        <rect x="28" y="4"  width="2" height="2" fill="#fff"/>
        {/* Pointy ears */}
        <rect x="14" y="-2" width="2" height="2" fill="#fff"/>
        <rect x="20" y="-2" width="2" height="2" fill="#fff"/>
        {/* Glowing eye */}
        <rect className="pl-eye-blink" x="22" y="2" width="2" height="2" fill="#14e3c5"/>
        {/* Legs (alternating run cycle) */}
        <g className="pl-leg-1">
          <rect x="2"  y="16" width="2" height="4" fill="#fff"/>
          <rect x="16" y="16" width="2" height="4" fill="#fff"/>
        </g>
        <g className="pl-leg-2">
          <rect x="6"  y="16" width="2" height="4" fill="#fff"/>
          <rect x="12" y="16" width="2" height="4" fill="#fff"/>
        </g>
      </g>

      {/* Bottom dust puff under wolf */}
      <rect x="80" y="84" width="2" height="2" fill="#475569" opacity="0.7"/>
      <rect x="84" y="84" width="2" height="2" fill="#475569" opacity="0.5"/>
    </svg>
  </div>
);

export default JungleLoader;
