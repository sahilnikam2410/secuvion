import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import CinematicLoader from "./components/CinematicLoader";
import CyberGlobe from "./components/CyberGlobe";
import ThreatMapLive from "./components/ThreatMapLive";

/* ═══════════════════════════════════════════════════════
   SECUVION v4 — PREMIUM CYBER DEFENSE PLATFORM
   Aesthetic: Linear x Vercel x CrowdStrike x Raycast
   ═══════════════════════════════════════════════════════ */

/* ── DESIGN TOKENS ── */
const T = {
  bg: "#030712",
  deep: "#0a0f1e",
  surface: "#111827",
  surfaceHover: "#1f2937",
  card: "rgba(17,24,39,0.6)",
  glass: "rgba(3,7,18,0.65)",
  accent: "#6366f1",
  accentSoft: "#818cf8",
  accentDim: "rgba(99,102,241,0.08)",
  accentMed: "rgba(99,102,241,0.18)",
  cyan: "#06ffd0",
  cyanSoft: "#00e5b9",
  cyanDim: "rgba(6,255,208,0.06)",
  cyanMed: "rgba(6,255,208,0.15)",
  cyanGlow: "rgba(6,255,208,0.3)",
  ember: "#f97316",
  emberDim: "rgba(249,115,22,0.08)",
  red: "#ef4444",
  redDim: "rgba(239,68,68,0.08)",
  gold: "#eab308",
  purple: "#a78bfa",
  blue: "#38bdf8",
  white: "#f1f5f9",
  muted: "#94a3b8",
  mutedDark: "#64748b",
  border: "rgba(148,163,184,0.08)",
  borderHover: "rgba(99,102,241,0.25)",
  gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  gradientWarm: "linear-gradient(135deg, #f97316, #eab308)",
  gradientFull: "linear-gradient(135deg, #6366f1, #8b5cf6, #06ffd0)",
};

/* ── SECUVION ANIMATED SHIELD LOGO (Hex + Eye + Full Animation) ── */
let brandClipId = 0;
const BrandIcon = ({ size = 50 }) => {
  const id = useState(() => ++brandClipId)[0];
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <defs>
        {/* Main shield gradient — deep purple to blue-violet 3D effect */}
        <linearGradient id={`bg1_${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7B6CF6"/>
          <stop offset="50%" stopColor="#534AB7"/>
          <stop offset="100%" stopColor="#3B2F9E"/>
        </linearGradient>
        {/* Light face gradient for 3D depth */}
        <linearGradient id={`bg2_${id}`} x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#9B8FFF" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#6358D4" stopOpacity="0.7"/>
        </linearGradient>
        {/* Shadow face gradient */}
        <linearGradient id={`bg3_${id}`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A3DA8"/>
          <stop offset="100%" stopColor="#2A1F7A"/>
        </linearGradient>
        {/* Orbit ring gradient */}
        <linearGradient id={`orb_${id}`} x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#06FFD0" stopOpacity="0"/>
          <stop offset="30%" stopColor="#06FFD0" stopOpacity="0.8"/>
          <stop offset="60%" stopColor="#7B6CF6" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#534AB7" stopOpacity="0"/>
        </linearGradient>
        {/* Inner core glow */}
        <radialGradient id={`core_${id}`} cx="0.45" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#EEEDFE" stopOpacity="0.95"/>
          <stop offset="40%" stopColor="#AFA9EC" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#534AB7" stopOpacity="0"/>
        </radialGradient>
        {/* Ambient glow filter */}
        <filter id={`glow_${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        {/* Soft shadow */}
        <filter id={`sh_${id}`} x="-20%" y="-10%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="shadow"/>
          <feOffset dx="0" dy="8" result="offsetShadow"/>
          <feFlood floodColor="#1a0e4a" floodOpacity="0.5"/>
          <feComposite in2="offsetShadow" operator="in"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* === 3D SHIELD BODY === */}
      <g filter={`url(#sh_${id})`}>
        {/* Back shadow face — creates 3D depth */}
        <path d="M100,22 L152,55 L152,130 L100,163 L100,163 L100,88Z" fill={`url(#bg3_${id})`} opacity="0.6"/>

        {/* Right dark face */}
        <path d="M100,163 L152,130 L152,55 L100,88Z" fill={`url(#bg3_${id})`}/>

        {/* Left light face */}
        <path d="M100,163 L48,130 L48,55 L100,88Z" fill={`url(#bg2_${id})`}/>

        {/* Top face — brightest for 3D */}
        <path d="M100,22 L152,55 L100,88 L48,55Z" fill={`url(#bg1_${id})`}/>

        {/* Glossy highlight on top */}
        <path d="M100,22 L152,55 L100,88 L48,55Z" fill="white" opacity="0.08"/>
        <path d="M100,22 L126,38 L100,54 L74,38Z" fill="white" opacity="0.12"/>
      </g>

      {/* === INNER SHIELD CUTOUT — the "eye window" === */}
      <path d="M100,52 L128,68 L128,108 L100,124 L72,108 L72,68Z"
        fill="#0d0b2a" fillOpacity="0.85"/>
      <path d="M100,52 L128,68 L128,108 L100,124 L72,108 L72,68Z"
        fill="none" stroke="#9B8FFF" strokeWidth="1" opacity="0.5"/>

      {/* === CORE EYE — modern gradient orb === */}
      <circle cx="100" cy="88" r="18" fill={`url(#core_${id})`} filter={`url(#glow_${id})`}>
        <animate attributeName="r" values="18;20;18" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="100" cy="88" r="10" fill="#534AB7" opacity="0.9">
        <animate attributeName="r" values="10;11.5;10" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="100" cy="88" r="5" fill="#EEEDFE" opacity="0.95"/>
      <circle cx="100" cy="88" r="2.2" fill="#1a0e4a"/>
      {/* Specular highlight */}
      <circle cx="96" cy="84" r="2" fill="white" opacity="0.7"/>

      {/* === ORBITAL RING — sweeping around shield === */}
      <g style={{ transformOrigin: "100px 88px", animation: "brand-orbit-ring 8s linear infinite" }}>
        <ellipse cx="100" cy="88" rx="80" ry="22" fill="none"
          stroke={`url(#orb_${id})`} strokeWidth="3.5" strokeLinecap="round"
          transform="rotate(-25 100 88)"/>
        {/* Orbiting particle on ring */}
        <circle cx="178" cy="80" r="4.5" fill="#06FFD0" opacity="0.95" transform="rotate(-25 100 88)">
          <animate attributeName="opacity" values="0.95;0.5;0.95" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="178" cy="80" r="8" fill="#06FFD0" opacity="0.15" transform="rotate(-25 100 88)"/>
      </g>

      {/* Second thinner ring */}
      <g style={{ transformOrigin: "100px 88px", animation: "brand-orbit-ring2 12s linear infinite" }}>
        <ellipse cx="100" cy="88" rx="70" ry="16" fill="none"
          stroke="#7B6CF6" strokeWidth="1.2" strokeDasharray="6 12" opacity="0.3"
          transform="rotate(15 100 88)"/>
      </g>

      {/* === ACCENT PARTICLES — floating dots === */}
      <circle cx="45" cy="40" r="3" fill="#06FFD0" opacity="0.7">
        <animate attributeName="cy" values="40;36;40" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="160" cy="48" r="2" fill="#FF3CAC" opacity="0.6">
        <animate attributeName="cy" values="48;44;48" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0.25;0.6" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="155" cy="138" r="2.5" fill="#7B6CF6" opacity="0.5">
        <animate attributeName="cy" values="138;134;138" dur="2.8s" repeatCount="indefinite"/>
      </circle>

      {/* === SHIELD EDGE HIGHLIGHTS === */}
      {/* Top-left edge gleam */}
      <path d="M100,22 L48,55" stroke="white" strokeWidth="1.5" opacity="0.2" strokeLinecap="round"/>
      {/* Bottom vertex glow */}
      <circle cx="100" cy="163" r="3" fill="#534AB7" opacity="0.6">
        <animate attributeName="r" values="3;4.5;3" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
};

/* ── SUBTLE AMBIENT BACKGROUND ── */
const ParticleField = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    let raf;
    const particles = Array.from({ length: 20 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00015,
      vy: (Math.random() - 0.5) * 0.00015,
      pulse: Math.random() * Math.PI * 2,
      size: 0.4 + Math.random() * 0.8,
    }));
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const draw = () => {
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.pulse += 0.008;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        const px = p.x * w, py = p.y * h;
        const op = 0.06 + Math.sin(p.pulse) * 0.04;
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,184,${op})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
};

/* ── SCROLL REVEAL ── */
const useReveal = (thresh = 0.1) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: thresh });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, vis];
};

const Reveal = ({ children, delay = 0, direction = "up", style = {} }) => {
  const [ref, vis] = useReveal();
  const transforms = {
    up: "translateY(40px)",
    left: "translateX(-40px)",
    right: "translateX(40px)",
    scale: "scale(0.92)",
  };
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0) translateX(0) scale(1)" : transforms[direction],
      transition: `opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 1s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      willChange: vis ? "auto" : "transform, opacity",
      ...style
    }}>{children}</div>
  );
};

/* ── TYPEWRITER TEXT ── */
const Typewriter = ({ text, speed = 35, style = {} }) => {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [ref, vis] = useReveal();
  useEffect(() => { if (vis && !started) setStarted(true); }, [vis]);
  useEffect(() => {
    if (!started) return;
    let i = 0;
    const t = setInterval(() => { i++; setDisplayed(text.slice(0, i)); if (i >= text.length) clearInterval(t); }, speed);
    return () => clearInterval(t);
  }, [started]);
  return <span ref={ref} style={style}>{displayed}<span style={{ animation: "blink-cursor 1s step-end infinite", borderRight: `2px solid ${T.cyan}`, marginLeft: 2 }}>&nbsp;</span></span>;
};

/* ── GRADIENT TEXT ── */
const GradientText = ({ children, gradient, style = {} }) => (
  <span style={{
    background: gradient || "linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #06ffd0 100%)",
    backgroundSize: "200% 200%",
    animation: "gradient-border 8s ease infinite",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
    ...style,
  }}>{children}</span>
);

/* ── BADGE ── */
const Badge = ({ children, color = T.accent }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "5px 14px", borderRadius: 100,
    background: `${color}0c`,
    border: `1px solid ${color}20`,
    fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600,
    letterSpacing: 0.5, color,
  }}>
    {children}
  </span>
);

/* ── SECTION HEADING ── */
const SectionHead = ({ badge, title, subtitle }) => (
  <div style={{ marginBottom: 64, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
    {badge && <div style={{ marginBottom: 20 }}><Badge>{badge}</Badge></div>}
    <h2 style={{
      fontFamily: "var(--font-display)", fontSize: "clamp(30px, 4.5vw, 48px)",
      fontWeight: 700, color: T.white, margin: 0, lineHeight: 1.15,
      letterSpacing: "-0.03em", maxWidth: 700,
    }}>{title}</h2>
    {subtitle && (
      <p style={{
        fontFamily: "var(--font-body)", color: T.muted, fontSize: "clamp(15px, 1.4vw, 17px)",
        marginTop: 18, maxWidth: 540, lineHeight: 1.7, fontWeight: 400,
      }}>{subtitle}</p>
    )}
  </div>
);

/* ── BUTTON ── */
const Button = ({ children, primary, onClick, style: s = {}, icon }) => {
  const [h, setH] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => { setH(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      style={{
        position: "relative", overflow: "hidden",
        background: primary
          ? (h ? "#818cf8" : "#6366f1")
          : (h ? "rgba(99,102,241,0.08)" : "rgba(148,163,184,0.04)"),
        color: primary ? "#fff" : (h ? T.white : T.muted),
        border: primary ? "none" : `1px solid ${h ? T.borderHover : T.border}`,
        padding: primary ? "13px 32px" : "12px 28px",
        fontSize: 14, fontWeight: 600, letterSpacing: 0,
        borderRadius: 10, cursor: "pointer",
        fontFamily: "var(--font-body)",
        transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        transform: pressed ? "translateY(0) scale(0.97)" : h ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: primary
          ? (h ? "0 12px 40px rgba(99,102,241,0.4)" : "0 4px 16px rgba(99,102,241,0.2)")
          : (h ? "0 6px 20px rgba(0,0,0,0.25)" : "none"),
        display: "inline-flex", alignItems: "center", gap: 8,
        ...s,
      }}>
      {/* Shine sweep on hover */}
      {primary && <span style={{
        position: "absolute", top: 0, left: h ? "120%" : "-40%", width: "30%", height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
        transition: "left 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        pointerEvents: "none",
      }} />}
      {icon && <span style={{ fontSize: 14, opacity: 0.8, transition: "transform 0.3s ease", transform: h ? "scale(1.2)" : "scale(1)" }}>{icon}</span>}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </button>
  );
};

/* ── CARD ── */
const Card = ({ children, style: s = {}, onClick }) => {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: T.card,
        border: `1px solid ${h ? "rgba(99,102,241,0.15)" : T.border}`,
        backdropFilter: "blur(8px)", padding: 28,
        borderRadius: 14, transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        cursor: onClick ? "pointer" : "default",
        transform: h ? "translateY(-4px)" : "translateY(0)",
        boxShadow: h
          ? "0 20px 50px rgba(0,0,0,0.3), 0 0 30px rgba(99,102,241,0.06)"
          : "0 2px 12px rgba(0,0,0,0.1)",
        position: "relative", overflow: "hidden",
        ...s,
      }}>
      {/* Top accent line on hover */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: h ? 2 : 0,
        background: "linear-gradient(90deg, transparent, #6366f1, #8b5cf6, transparent)",
        transition: "height 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      }} />
      {children}
    </div>
  );
};

/* ────────────────────────────────────────────
   HERO SECTION
   ──────────────────────────────────────────── */
const Hero = ({ onNav }) => {
  const [threats, setThreats] = useState(2841029);
  const [time, setTime] = useState("");

  useEffect(() => {
    const t1 = setInterval(() => setThreats(c => c + Math.floor(Math.random() * 30) + 5), 800);
    const t2 = setInterval(() => setTime(new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC"), 1000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      padding: "100px clamp(20px, 5vw, 80px) 40px",
      position: "relative", overflow: "hidden",
    }}>

      {/* Background glow orbs */}
      <div style={{ position: "absolute", top: "15%", left: "15%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 65%)", pointerEvents: "none", animation: "glow-drift 10s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.04), transparent 65%)", pointerEvents: "none", animation: "glow-drift 12s ease-in-out infinite 3s" }} />

      {/* Hero content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 900, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Status bar */}
        <Reveal>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            padding: "8px 20px", borderRadius: 100, marginBottom: 40,
            background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "status-pulse 2s ease-in-out infinite" }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.muted, fontWeight: 500 }}>
              All systems operational
            </span>
          </div>
        </Reveal>

        {/* Main title */}
        <Reveal delay={0.2}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(46px, 7.5vw, 92px)",
            fontWeight: 700, color: T.white, margin: 0, lineHeight: 1.02,
            letterSpacing: "-0.045em",
          }}>
            The Future of<br />
            <GradientText>Cyber Defense</GradientText>
          </h1>
        </Reveal>

        {/* Subtitle */}
        <Reveal delay={0.3}>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: "clamp(16px, 1.8vw, 19px)",
            color: T.muted, maxWidth: 520, marginTop: 32, lineHeight: 1.8, fontWeight: 400,
            letterSpacing: "0.01em",
          }}>
            AI-powered protection against fraud, hacking, phishing, and identity theft. Built for real people — students, families, and small businesses.
          </p>
        </Reveal>

        {/* Buttons */}
        <Reveal delay={0.4}>
          <div style={{ display: "flex", gap: 16, marginTop: 48, flexWrap: "wrap", justifyContent: "center" }}>
            <Button primary onClick={() => onNav("analyzer")} icon="⚡">Analyze Threats</Button>
            <Button onClick={() => onNav("dashboard")} icon="◈">Open Dashboard</Button>
          </div>
        </Reveal>

        {/* Stats strip */}
        <Reveal delay={0.5}>
          <div style={{
            display: "flex", gap: 48, marginTop: 64, flexWrap: "wrap", justifyContent: "center",
          }}>
            {[
              { label: "Threats blocked", val: threats.toLocaleString(), color: T.accent },
              { label: "Active users", val: "1,247,893", color: T.ember },
              { label: "Countries", val: "84", color: T.cyan },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.mutedDark, marginBottom: 6, fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>{s.val}</div>
              </div>
            ))}
          </div>
        </Reveal>

      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "relative", marginTop: 56,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        animation: "float 3s ease-in-out infinite",
        zIndex: 2, opacity: 0.5,
      }}>
        <div style={{
          width: 22, height: 36, borderRadius: 11, border: "1.5px solid rgba(148,163,184,0.2)",
          display: "flex", justifyContent: "center", paddingTop: 7,
        }}>
          <div style={{
            width: 2.5, height: 7, borderRadius: 3, background: T.muted,
            animation: "scrollDot 2s ease-in-out infinite",
          }} />
        </div>
      </div>
    </section>
  );
};

/* ── VISION BAND ── */
const VisionBand = () => (
  <section style={{ padding: "100px clamp(20px, 5vw, 80px)", position: "relative" }}>
    <Reveal>
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>
        <Badge color={T.mutedDark}>Our Mission</Badge>
        <blockquote style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3vw, 34px)",
          fontWeight: 500, color: T.white, lineHeight: 1.5,
          margin: "24px 0 0", fontStyle: "normal", letterSpacing: "-0.02em",
        }}>
          "Cybersecurity shouldn't be a luxury for corporations. It's a right for <GradientText>every human</GradientText> connected to the internet."
        </blockquote>
        <div style={{ marginTop: 24, fontFamily: "var(--font-body)", fontSize: 14, color: T.mutedDark, fontWeight: 500 }}>
          Sahil Anil Nikam <span style={{ color: "rgba(148,163,184,0.3)", margin: "0 8px" }}>/</span> Founder
        </div>
      </div>
    </Reveal>
  </section>
);

/* ── AI FRAUD ANALYZER ── */
const Analyzer = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("url");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scan = () => {
    if (!input.trim()) return;
    setLoading(true); setResult(null);
    setTimeout(() => {
      const r = Math.random();
      const level = r > 0.55 ? "CRITICAL" : r > 0.25 ? "WARNING" : "CLEAR";
      const data = {
        CLEAR: { color: "#22c55e", score: 94, msg: "No threats detected. Source appears legitimate.", icon: "✓" },
        WARNING: { color: T.gold, score: 42, msg: "Suspicious patterns detected. Exercise caution and verify the source independently.", icon: "⚠" },
        CRITICAL: { color: T.red, score: 8, msg: "High-risk threat identified. Do not interact. Matches known malicious signatures.", icon: "✕" },
      };
      setResult({ level, ...data[level] });
      setLoading(false);
    }, 2500);
  };

  const modes = [
    { id: "url", label: "URL", placeholder: "Enter suspicious website URL..." },
    { id: "email", label: "EMAIL", placeholder: "Enter suspicious email address..." },
    { id: "phone", label: "PHONE", placeholder: "Enter suspicious phone number..." },
  ];
  const active = modes.find(m => m.id === mode);

  return (
    <section id="analyzer" style={{ padding: "100px clamp(20px, 5vw, 80px)", maxWidth: 1400, margin: "0 auto" }}>
      <Reveal><SectionHead badge="Threat Analysis" title="AI Fraud Analyzer" subtitle="Paste any suspicious URL, email, or phone number. Our AI cross-references global threat databases in real time." /></Reveal>
      <Reveal delay={0.2}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Card glow style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "24px 28px 0" }}>
              {/* Mode tabs */}
              <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 4 }}>
                {modes.map(m => (
                  <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }}
                    style={{
                      flex: 1, padding: "11px 0", borderRadius: 8,
                      background: mode === m.id ? "rgba(99,102,241,0.1)" : "transparent",
                      border: `1px solid ${mode === m.id ? "rgba(99,102,241,0.2)" : "transparent"}`,
                      color: mode === m.id ? T.accentSoft : T.mutedDark,
                      fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}>{m.label}</button>
                ))}
              </div>
              {/* Input */}
              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder={active.placeholder}
                  onKeyDown={e => e.key === "Enter" && scan()}
                  style={{
                    flex: 1, padding: "14px 18px", background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(148,163,184,0.1)", borderRadius: 10, color: T.white,
                    fontFamily: "var(--font-body)", fontSize: 14, outline: "none",
                    transition: "border-color 0.3s ease",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.3)"}
                  onBlur={e => e.target.style.borderColor = "rgba(148,163,184,0.1)"}
                />
                <Button primary onClick={scan}>{loading ? "Scanning..." : "Scan"}</Button>
              </div>
            </div>
            {/* Loading */}
            {loading && (
              <div style={{ textAlign: "center", padding: "44px 0" }}>
                <div style={{ width: 40, height: 40, margin: "0 auto", border: "2px solid rgba(148,163,184,0.1)", borderTopColor: T.accent, borderRadius: "50%", animation: "hud-spin 0.8s linear infinite" }} />
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.muted, marginTop: 18, fontWeight: 500 }}>Analyzing threat signatures...</div>
              </div>
            )}
            {/* Result */}
            {result && (
              <div style={{ margin: "0 24px 24px", padding: 24, background: `${result.color}08`, border: `1px solid ${result.color}18`, borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, border: `1.5px solid ${result.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: result.color, flexShrink: 0, background: `${result.color}0a` }}>{result.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: result.color }}>{result.score}</span>
                      <span style={{ fontSize: 14, color: T.mutedDark }}>/100</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: result.color, marginLeft: "auto" }}>{result.level}</span>
                    </div>
                    <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, margin: "6px 0 0" }}>{result.msg}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </Reveal>
    </section>
  );
};

/* ── HOW IT WORKS ── */
const HowItWorks = () => {
  const steps = [
    { n: "01", title: "Detect", desc: "Our sensors scan URLs, messages, and digital interactions for anomalies.", icon: "◉", color: T.cyan },
    { n: "02", title: "Analyze", desc: "AI models cross-reference billions of threat signatures to assess risk level.", icon: "◈", color: T.blue },
    { n: "03", title: "Protect", desc: "Instant alerts with clear, human-readable guidance to neutralize threats.", icon: "◆", color: T.purple },
  ];
  return (
    <section style={{ padding: "100px clamp(20px, 5vw, 80px)", maxWidth: 1400, margin: "0 auto" }}>
      <Reveal><SectionHead badge="How it works" title="How Secuvion Works" subtitle="Three steps to complete protection. Simple for you, powerful against threats." /></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 1000, margin: "0 auto" }}>
        {steps.map((s, i) => (
          <Reveal key={i} delay={i * 0.12}>
            <Card style={{ height: "100%", textAlign: "center", padding: "44px 28px" }}>
              <div className="step-icon" style={{ width: 56, height: 56, margin: "0 auto 24px", borderRadius: 14, background: `${s.color}0a`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: s.color, transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}>{s.icon}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: s.color, marginBottom: 10, fontWeight: 600 }}>Step {s.n}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, color: T.white, margin: "0 0 12px", letterSpacing: "-0.02em" }}>{s.title}</h3>
              <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ── FEATURES GRID ── */
const Features = () => {
  const feats = [
    { title: "AI Fraud Detection", desc: "Real-time scanning of links, messages, and calls.", icon: "⬡", color: T.cyan },
    { title: "Identity Shield", desc: "Monitor and protect your personal data across the web.", icon: "⬢", color: T.blue },
    { title: "Device Armor", desc: "Intelligent threat detection across all your devices.", icon: "◇", color: T.purple },
    { title: "Privacy Guard", desc: "Control your digital footprint and online visibility.", icon: "○", color: T.gold },
    { title: "Phishing Radar", desc: "Instantly identify fraudulent websites and emails.", icon: "◎", color: T.ember },
    { title: "Dark Web Watch", desc: "Continuous monitoring for your data on the dark web.", icon: "◐", color: T.red },
    { title: "Recovery Ops", desc: "Step-by-step guidance after a security incident.", icon: "◑", color: T.cyanSoft },
  ];
  return (
    <section id="features" style={{ padding: "100px clamp(20px, 5vw, 80px)", maxWidth: 1400, margin: "0 auto" }}>
      <Reveal><SectionHead badge="Features" title="Defense Systems" subtitle="Seven layers of protection. Enterprise-grade security, made simple." /></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
        {feats.map((f, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <Card style={{ height: "100%", "--icon-color": f.color }}>
              <div className="feature-icon" style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${f.color}0a`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, color: f.color, marginBottom: 18,
                transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              }}>{f.icon}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: T.white, margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ── GLOBAL THREAT INTELLIGENCE ── */
const ThreatMapSection = () => {
  const [events, setEvents] = useState([]);
  const [attackCount, setAttackCount] = useState(2843921);
  const [typeCounts, setTypeCounts] = useState({ MALWARE: 847, PHISHING: 1203, DDOS: 432, RANSOMWARE: 298, EXPLOIT: 615 });
  const [countryCounts, setCountryCounts] = useState([
    { n: "United States", attacks: 4821, flag: "US" },
    { n: "China", attacks: 3947, flag: "CN" },
    { n: "Russia", attacks: 3215, flag: "RU" },
    { n: "India", attacks: 2103, flag: "IN" },
    { n: "Brazil", attacks: 1876, flag: "BR" },
  ]);

  const cities = [
    { n: "New York", x: 27, y: 36 }, { n: "London", x: 47, y: 27 },
    { n: "Moscow", x: 60, y: 25 }, { n: "Mumbai", x: 66, y: 48 },
    { n: "Tokyo", x: 83, y: 33 }, { n: "São Paulo", x: 31, y: 66 },
    { n: "Sydney", x: 85, y: 73 }, { n: "Lagos", x: 49, y: 53 },
    { n: "Singapore", x: 75, y: 55 }, { n: "Berlin", x: 51, y: 27 },
    { n: "Dubai", x: 61, y: 42 }, { n: "Seoul", x: 80, y: 34 },
  ];

  const types = ["MALWARE", "PHISHING", "DDOS", "RANSOMWARE", "EXPLOIT"];
  const typeColors = { MALWARE: T.red, PHISHING: T.gold, DDOS: T.ember, RANSOMWARE: T.purple, EXPLOIT: T.blue };

  useEffect(() => {
    const counter = setInterval(() => setAttackCount(c => c + Math.floor(Math.random() * 15) + 3), 1500);
    const typeCounter = setInterval(() => {
      setTypeCounts(prev => {
        const k = types[Math.floor(Math.random() * types.length)];
        return { ...prev, [k]: prev[k] + Math.floor(Math.random() * 3) + 1 };
      });
    }, 800);
    const countryCounter = setInterval(() => {
      setCountryCounts(prev => prev.map(c => ({ ...c, attacks: c.attacks + Math.floor(Math.random() * 4) })));
    }, 1200);
    const add = () => {
      const from = cities[Math.floor(Math.random() * cities.length)];
      const to = cities[Math.floor(Math.random() * cities.length)];
      if (from.n === to.n) return;
      setEvents(prev => [...prev.slice(-8), {
        id: Date.now() + Math.random(), from, to,
        type: types[Math.floor(Math.random() * types.length)],
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      }]);
    };
    const iv = setInterval(add, 1400);
    add(); setTimeout(add, 300); setTimeout(add, 700); setTimeout(add, 1000);
    return () => { clearInterval(iv); clearInterval(counter); clearInterval(typeCounter); clearInterval(countryCounter); };
  }, []);

  return (
    <section id="threats" style={{ padding: "100px clamp(20px, 3vw, 60px)", maxWidth: 1500, margin: "0 auto" }}>
      <Reveal>
        <SectionHead badge="Live Monitoring" title={<>Global Threat <GradientText>Intelligence</GradientText></>} subtitle="Live visualization of cyber operations detected worldwide." />
      </Reveal>

      {/* THREAT LEVEL BAR */}
      <Reveal delay={0.1} style={{ width: "100%" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          padding: "14px 24px", marginBottom: 20, borderRadius: 12,
          background: "rgba(239,68,68,0.04)",
          border: "1px solid rgba(239,68,68,0.1)",
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.red, animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span style={{ fontFamily: "var(--font-body)", color: T.red, fontWeight: 600, fontSize: 13 }}>Threat Level: Elevated</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-display)", color: T.white, fontWeight: 700, fontSize: 16 }}>{attackCount.toLocaleString()}</span>
            <span style={{ color: T.mutedDark, fontSize: 12 }}>attacks today</span>
          </div>
        </div>
      </Reveal>

      {/* MAP GRID */}
      <Reveal delay={0.2} style={{ width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr) 220px", gap: 16, width: "100%", marginBottom: 24 }} className="threat-map-grid">

          {/* LEFT PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card style={{ padding: "18px", borderRadius: 12 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.muted, fontWeight: 600, marginBottom: 14 }}>Attack Vectors</div>
              {types.map(t => (
                <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid rgba(148,163,184,0.05)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: typeColors[t] }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: T.white, fontWeight: 500 }}>{t}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: typeColors[t], fontWeight: 600 }}>{typeCounts[t].toLocaleString()}</span>
                </div>
              ))}
            </Card>
            <Card style={{ padding: "18px", borderRadius: 12, flex: 1 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.muted, fontWeight: 600, marginBottom: 14 }}>Top Origins</div>
              {countryCounts.map((c, i) => {
                const maxAtk = countryCounts[0].attacks;
                return (
                  <div key={c.flag} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: T.white }}>
                        <span style={{ color: T.mutedDark, marginRight: 6 }}>{String(i + 1).padStart(2, "0")}</span>{c.n}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: T.red }}>{c.attacks.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 3, background: T.border, borderRadius: 4 }}>
                      <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${T.red}, ${T.ember})`, width: `${(c.attacks / maxAtk) * 100}%`, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>

          {/* CENTER — 2D THREAT MAP */}
          <div style={{
            position: "relative", minHeight: 450, minWidth: 0, width: "100%",
            borderRadius: 18, overflow: "hidden",
            border: `1px solid rgba(6,255,208,0.06)`,
            boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)",
          }}>
            <ThreatMapLive events={events} />
          </div>

          {/* RIGHT PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "BLOCKED", val: Math.floor(attackCount * 0.87).toLocaleString(), color: "#22c55e" },
                { label: "CRITICAL", val: Math.floor(attackCount * 0.04).toLocaleString(), color: T.red },
                { label: "ACTIVE", val: events.length, color: T.ember },
                { label: "NATIONS", val: "84", color: T.cyan },
              ].map((s, i) => (
                <Card key={i} style={{ padding: "14px 10px", textAlign: "center", borderRadius: 10 }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.mutedDark, marginBottom: 6, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: s.color, fontWeight: 700 }}>{s.val}</div>
                </Card>
              ))}
            </div>
            {/* Live feed */}
            <Card style={{ padding: "16px", borderRadius: 12, flex: 1, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.muted, fontWeight: 600 }}>Live Feed</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.red, display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.red, animation: "pulse-dot 2s ease-in-out infinite" }} />
                  Live
                </span>
              </div>
              <div style={{ maxHeight: 320, overflow: "auto" }}>
                {events.slice().reverse().map(e => (
                  <div key={e.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.border}`, animation: "fadeIn 0.4s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: typeColors[e.type], boxShadow: `0 0 6px ${typeColors[e.type]}50` }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, color: typeColors[e.type], fontWeight: 700 }}>{e.type}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: T.mutedDark, marginLeft: "auto" }}>{e.time}</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: T.mutedDark, paddingLeft: 12 }}>
                      <span style={{ color: T.white }}>{e.from.n}</span>
                      <span style={{ color: T.red, margin: "0 6px" }}> → </span>
                      <span style={{ color: T.white }}>{e.to.n}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Reveal>

      {/* 3D GLOBE */}
      <Reveal delay={0.3} style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, transparent, ${T.border})` }} />
          <Badge color={T.mutedDark}>3D Threat Map</Badge>
          <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${T.border}, transparent)` }} />
        </div>
        <div style={{
          position: "relative", height: 560, width: "100%",
          background: `radial-gradient(ellipse at 50% 50%, rgba(6,255,208,0.02) 0%, #030712 70%)`,
          border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden",
        }}>
          <CyberGlobe size={560} />
          {/* Bottom counter */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center", padding: "36px 0 20px", background: "linear-gradient(transparent, rgba(3,7,18,0.9))", pointerEvents: "none" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.mutedDark, marginBottom: 6, fontWeight: 500 }}>Global operations detected</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, color: T.accent, letterSpacing: "-0.02em" }}>{attackCount.toLocaleString()}</div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

/* ── SAFETY SCORE ── */
const SafetyScore = () => {
  const [score, setScore] = useState(null);
  const [answers, setAnswers] = useState({});
  const questions = [
    { id: "pw", q: "Unique passwords per account?", w: 25 },
    { id: "mfa", q: "Two-factor authentication enabled?", w: 25 },
    { id: "upd", q: "Devices and apps updated regularly?", w: 25 },
    { id: "aware", q: "Can you spot phishing attempts?", w: 25 },
  ];
  const calculateScore = () => { let total = 0; questions.forEach(q => { if (answers[q.id]) total += q.w; }); setScore(total); };
  const color = score === null ? T.cyan : score >= 75 ? "#22c55e" : score >= 50 ? T.gold : T.red;

  return (
    <section style={{ padding: "100px clamp(20px, 5vw, 80px)", maxWidth: 1400, margin: "0 auto" }}>
      <Reveal><SectionHead badge="Assessment" title="Cyber Safety Score" subtitle="Quick assessment of your current security posture." /></Reveal>
      <Reveal delay={0.2}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <Card glow style={{ padding: 36 }}>
            {score === null ? (
              <>
                {questions.map(q => (
                  <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ color: T.white, fontSize: 15, fontWeight: 500 }}>{q.q}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[true, false].map(v => (
                        <button key={String(v)} onClick={() => setAnswers({ ...answers, [q.id]: v })}
                          style={{
                            padding: "7px 16px", borderRadius: 8,
                            fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                            background: answers[q.id] === v ? T.accentDim : "transparent",
                            border: `1px solid ${answers[q.id] === v ? T.accentMed : T.border}`,
                            color: answers[q.id] === v ? T.accent : T.muted, cursor: "pointer", transition: "all 0.25s",
                          }}>{v ? "Yes" : "No"}</button>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ textAlign: "center", marginTop: 28 }}><Button primary onClick={calculateScore}>Run Diagnostic</Button></div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke={color} strokeWidth="6" strokeDasharray={`${(score / 100) * 440} 440`} strokeLinecap="round" transform="rotate(-90 80 80)" style={{ transition: "stroke-dasharray 1s ease" }} />
                  <text x="80" y="75" textAnchor="middle" fontFamily="var(--font-display)" fontSize="38" fontWeight="800" fill={color}>{score}</text>
                  <text x="80" y="98" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill={T.muted} letterSpacing="2">OUT OF 100</text>
                </svg>
                <p style={{ color: T.muted, marginTop: 16, lineHeight: 1.6 }}>
                  {score >= 75 ? "Excellent security posture." : score >= 50 ? "Moderate risk detected." : "High vulnerability detected."}
                </p>
                <Button onClick={() => { setScore(null); setAnswers({}); }} style={{ marginTop: 20 }}>Reset</Button>
              </div>
            )}
          </Card>
        </div>
      </Reveal>
    </section>
  );
};

/* ── EMAIL BREACH CHECK ── */
const BreachCheck = () => {
  const [email, setEmail] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const check = () => { if (!email.includes("@")) return; setLoading(true); setRes(null); setTimeout(() => { const b = Math.floor(Math.random() * 6); setRes({ breaches: b, safe: b === 0 }); setLoading(false); }, 2200); };
  return (
    <section style={{ padding: "100px clamp(20px, 5vw, 80px)", maxWidth: 1400, margin: "0 auto" }}>
      <Reveal><SectionHead badge="Security Check" title="Email Breach Scan" subtitle="Check if your email has been compromised in known data breaches." /></Reveal>
      <Reveal delay={0.2}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <Card style={{ padding: 28 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address..."
                onKeyDown={e => e.key === "Enter" && check()}
                style={{ flex: 1, padding: "14px 18px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 10, color: T.white, fontFamily: "var(--font-body)", fontSize: 14, outline: "none", transition: "border-color 0.3s" }}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.3)"} onBlur={e => e.target.style.borderColor = "rgba(148,163,184,0.1)"} />
              <Button primary onClick={check}>{loading ? "..." : "Scan"}</Button>
            </div>
            {loading && <div style={{ textAlign: "center", padding: 28 }}><div style={{ width: 36, height: 36, border: "2px solid rgba(148,163,184,0.1)", borderTopColor: T.accent, borderRadius: "50%", margin: "0 auto", animation: "hud-spin 0.8s linear infinite" }} /></div>}
            {res && (
              <div style={{ marginTop: 20, padding: 24, background: res.safe ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${res.safe ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`, borderRadius: 12 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: res.safe ? "#22c55e" : T.red }}>{res.safe ? "ALL CLEAR" : `${res.breaches} BREACHES DETECTED`}</div>
                <p style={{ color: T.muted, fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>{res.safe ? "No compromises found. Continue using strong, unique passwords." : "Credentials may be exposed. Change passwords immediately and enable two-factor authentication."}</p>
              </div>
            )}
          </Card>
        </div>
      </Reveal>
    </section>
  );
};

/* ── EMERGENCY PROTOCOLS ── */
const Emergency = () => {
  const [open, setOpen] = useState(null);
  const protocols = [
    { code: "ALPHA", title: "Bank Fraud Recovery", steps: ["Freeze accounts immediately via your bank's emergency line.", "Document all unauthorized transactions with screenshots.", "File a police report and retain the reference number.", "Enable real-time transaction alerts going forward."] },
    { code: "BRAVO", title: "Account Takeover Response", steps: ["Initiate password recovery on the affected platform.", "Revoke sessions from all unknown devices.", "Enable two-factor authentication once access is restored.", "Alert contacts about potential impersonation."] },
    { code: "CHARLIE", title: "Phishing Incident", steps: ["Do not interact further with the suspicious content.", "Change credentials for any exposed accounts.", "Run a comprehensive device security scan.", "Report the phishing attempt to your email provider."] },
  ];
  return (
    <section style={{ padding: "100px clamp(20px, 5vw, 80px)", maxWidth: 1400, margin: "0 auto" }}>
      <Reveal><SectionHead badge="Emergency" title="Recovery Protocols" subtitle="Immediate action guides for active security incidents." /></Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800, margin: "0 auto" }}>
        {protocols.map((p, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <Card onClick={() => setOpen(open === i ? null : i)} glow>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 2, color: T.ember, background: T.emberDim, padding: "5px 12px", borderRadius: 6, fontWeight: 700 }}>{p.code}</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: T.white, margin: 0, flex: 1 }}>{p.title}</h3>
                <span style={{ color: T.accent, fontSize: 18, fontFamily: "var(--font-body)", transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)", transform: open === i ? "rotate(45deg)" : "none", fontWeight: 300 }}>+</span>
              </div>
              {open === i && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                  {p.steps.map((s, j) => (
                    <div key={j} style={{ display: "flex", gap: 14, padding: "12px 0" }}>
                      <span style={{ fontFamily: "var(--font-mono)", color: T.cyan, fontSize: 12, flexShrink: 0, fontWeight: 600 }}>0{j + 1}</span>
                      <span style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ── SCAM DATABASE ── */
const ScamFeed = () => {
  const entries = [
    { type: "PHISHING", target: "fake-paypal-verify.com", t: "2m ago", sev: "CRIT" },
    { type: "VISHING", target: "+1-800-555-0199", t: "8m ago", sev: "CRIT" },
    { type: "EMAIL SCAM", target: "support@amaz0n-verify.net", t: "15m ago", sev: "HIGH" },
    { type: "FAKE STORE", target: "cheapelectronics-deals.shop", t: "22m ago", sev: "CRIT" },
    { type: "SMS SCAM", target: "+44-20-7946-0958", t: "31m ago", sev: "HIGH" },
  ];
  const sevC = { CRIT: T.red, HIGH: T.gold };
  return (
    <section style={{ padding: "100px clamp(20px, 5vw, 80px)", maxWidth: 1400, margin: "0 auto" }}>
      <Reveal><SectionHead badge="Threat Feed" title="Community Threat Feed" subtitle="Real-time scam reports from our global network." /></Reveal>
      <Reveal delay={0.2}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <Card style={{ padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: T.white, fontWeight: 600 }}>Latest entries</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.red, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.red, animation: "pulse-dot 2s ease-in-out infinite" }} />Live
              </span>
            </div>
            {entries.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: `1px solid ${T.border}`, flexWrap: "wrap", transition: "all 0.3s ease", cursor: "default" }}
                onMouseEnter={ev => ev.currentTarget.style.background = "rgba(99,102,241,0.03)"}
                onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 11, padding: "4px 10px", background: `${sevC[e.sev]}08`, color: sevC[e.sev], border: `1px solid ${sevC[e.sev]}18`, borderRadius: 6, minWidth: 80, textAlign: "center", fontWeight: 600 }}>{e.type}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: T.white, flex: 1, minWidth: 200 }}>{e.target}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.mutedDark }}>{e.t}</span>
              </div>
            ))}
          </Card>
        </div>
      </Reveal>
    </section>
  );
};

/* ── AI ASSISTANT ── */
const Assistant = () => {
  const [msgs, setMsgs] = useState([{ role: "ai", text: "SECUVION AI online. I can help assess threats, guide incident response, or answer any cybersecurity question. How can I assist?" }]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  const send = () => {
    if (!input.trim()) return;
    const q = input.trim(); setMsgs(p => [...p, { role: "user", text: q }]); setInput("");
    setTimeout(() => {
      const lc = q.toLowerCase();
      let r = "Good practice: never share personal info with unverified sources, use unique passwords, and enable two-factor auth.";
      if (lc.includes("scam") || lc.includes("fake")) r = "To verify a potential scam: check for urgency tactics, spelling errors, and suspicious URLs. Use our Threat Analyzer to scan any link.";
      else if (lc.includes("hack")) r = "Immediate steps: change all passwords, enable MFA, check for unauthorized access, and review connected apps.";
      else if (lc.includes("phish")) r = "Phishing red flags: misspelled domains, generic greetings, urgent requests for credentials.";
      else if (lc.includes("password")) r = "Use 12+ character passwords mixing letters, numbers, and symbols. Consider a password manager.";
      setMsgs(p => [...p, { role: "ai", text: r }]);
    }, 1000);
  };
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  return (
    <section style={{ padding: "100px clamp(20px, 5vw, 80px)", maxWidth: 1400, margin: "0 auto" }}>
      <Reveal><SectionHead badge="AI Assistant" title="Cyber Assistant" subtitle="Ask anything about online safety and get instant guidance." /></Reveal>
      <Reveal delay={0.2}>
        <div style={{ maxWidth: 660, margin: "0 auto" }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {/* Chat header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "14px 22px",
              borderBottom: "1px solid rgba(148,163,184,0.06)",
              background: "rgba(0,0,0,0.2)",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.muted, fontWeight: 600 }}>Secuvion AI</span>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ height: 320, overflowY: "auto", marginBottom: 16, padding: "4px 0" }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, flexDirection: m.role === "user" ? "row-reverse" : "row", animation: "card-enter 0.4s ease" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      background: m.role === "ai" ? "rgba(99,102,241,0.1)" : "rgba(148,163,184,0.08)",
                      fontSize: 11, fontFamily: "var(--font-body)", color: m.role === "ai" ? T.accent : T.muted, fontWeight: 600,
                    }}>
                      {m.role === "ai" ? "AI" : "U"}
                    </div>
                    <div style={{
                      maxWidth: "78%", padding: "14px 18px",
                      background: m.role === "user" ? "rgba(255,122,69,0.04)" : "rgba(255,255,255,0.015)",
                      border: `1px solid ${m.role === "user" ? "rgba(255,122,69,0.08)" : "rgba(148,163,184,0.06)"}`,
                      borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      fontSize: 14, color: T.white, lineHeight: 1.7,
                    }}>{m.text}</div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about cybersecurity..."
                  onKeyDown={e => e.key === "Enter" && send()}
                  style={{
                    flex: 1, padding: "12px 16px", background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(148,163,184,0.1)", borderRadius: 10, color: T.white,
                    fontFamily: "var(--font-body)", fontSize: 14, outline: "none",
                    transition: "border-color 0.3s ease",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.3)"}
                  onBlur={e => e.target.style.borderColor = "rgba(148,163,184,0.1)"} />
                <Button primary onClick={send}>Send</Button>
              </div>
            </div>
          </Card>
        </div>
      </Reveal>
    </section>
  );
};

/* ── FAMILY PROTECTION ── */
const FamilyProtection = () => {
  const groups = [
    { title: "Students", icon: "🎓", desc: "Defense against scholarship scams, fake jobs, and social media threats." },
    { title: "Families", icon: "🏠", desc: "Household-wide protection with shared dashboards and parental controls." },
    { title: "Seniors", icon: "🛡", desc: "Clear, simple defense against phone scams, phishing, and financial fraud." },
    { title: "Small Business", icon: "💼", desc: "Enterprise-grade security without enterprise complexity or cost." },
  ];
  return (
    <section style={{ padding: "100px clamp(20px, 5vw, 80px)", maxWidth: 1400, margin: "0 auto" }}>
      <Reveal><SectionHead badge="For Everyone" title="Protection Without Borders" subtitle="Security designed for real people, not just IT departments." /></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
        {groups.map((g, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <Card style={{ textAlign: "center", padding: "36px 24px" }}>
              <div className="family-icon" style={{ fontSize: 36, marginBottom: 16, transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}>{g.icon}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: T.white, margin: "0 0 10px" }}>{g.title}</h3>
              <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{g.desc}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ── EDUCATION ── */
const Education = () => {
  const modules = [
    { title: "Phishing Detection", time: "5 min", tag: "ESSENTIAL", color: T.red },
    { title: "How Scams Work", time: "7 min", tag: "FUNDAMENTALS", color: T.blue },
    { title: "Bank Account Safety", time: "6 min", tag: "FINANCE", color: T.gold },
    { title: "Post-Breach Actions", time: "4 min", tag: "EMERGENCY", color: T.ember },
    { title: "Social Media Privacy", time: "5 min", tag: "PRIVACY", color: T.purple },
    { title: "Password Mastery", time: "3 min", tag: "FUNDAMENTALS", color: T.cyan },
  ];
  return (
    <section id="education" style={{ padding: "100px clamp(20px, 5vw, 80px)", maxWidth: 1400, margin: "0 auto" }}>
      <Reveal><SectionHead badge="Learn" title="Knowledge Base" subtitle="Concise, jargon-free guides to upgrade your digital literacy." /></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, maxWidth: 920, margin: "0 auto" }}>
        {modules.map((m, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <Card glow>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <Badge color={m.color}>{m.tag}</Badge>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: T.mutedDark, fontWeight: 500 }}>{m.time}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: T.white, margin: 0 }}>{m.title}</h3>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ── PRICING ── */
const Pricing = () => {
  const plans = [
    { name: "RECON", tier: "Free", price: "$0", sub: "forever", features: ["Basic fraud detection", "Security advisories", "Email breach check", "Community reports", "Education access"], accent: T.mutedDark },
    { name: "SENTINEL", tier: "Pro", price: "$9", sub: "/mo", features: ["Everything in Recon", "AI real-time monitoring", "Device protection", "Phishing alerts", "Priority response", "Safety score tracking"], accent: T.cyan, featured: true },
    { name: "FORTRESS", tier: "Ultimate", price: "$19", sub: "/mo", features: ["Everything in Sentinel", "Identity monitoring", "Dark web surveillance", "Family protection", "Incident recovery ops", "Dedicated analyst"], accent: T.ember },
  ];
  return (
    <section id="pricing" style={{ padding: "100px clamp(20px, 5vw, 80px)", maxWidth: 1400, margin: "0 auto" }}>
      <Reveal><SectionHead badge="Pricing" title="Choose Your Plan" subtitle="World-class protection at prices built for real people." /></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 1100, margin: "0 auto", alignItems: "stretch" }}>
        {plans.map((p, i) => (
          <Reveal key={i} delay={i * 0.12}>
            <div className="pricing-card" style={{
              background: p.featured
                ? "linear-gradient(180deg, rgba(99,102,241,0.04) 0%, rgba(17,24,39,0.9) 40%)"
                : T.card,
              backdropFilter: "blur(16px)",
              border: `1px solid ${p.featured ? "rgba(99,102,241,0.2)" : T.border}`,
              padding: "40px 32px", borderRadius: 18, position: "relative", overflow: "hidden",
              transform: p.featured ? "scale(1.03)" : "scale(1)", transition: "all 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
              boxShadow: p.featured
                ? "0 20px 60px rgba(0,0,0,0.35)"
                : "0 2px 12px rgba(0,0,0,0.1)",
            }}>
              {p.featured && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #6366f1, #8b5cf6, transparent)" }} />}
              <Badge color={p.accent}>{p.name}</Badge>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: T.white, margin: "18px 0", letterSpacing: "-0.02em" }}>{p.tier}</h3>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 700, color: p.accent, letterSpacing: "-0.04em" }}>
                {p.price}<span style={{ fontSize: 16, fontWeight: 400, color: T.mutedDark, marginLeft: 2 }}>{p.sub}</span>
              </div>
              <div style={{ margin: "32px 0" }}>
                {p.features.map((f, j) => (
                  <div key={j} style={{ padding: "13px 0", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ color: p.accent, fontSize: 11, fontWeight: 700 }}>✓</span>
                    <span style={{ color: T.muted, fontSize: 14, fontWeight: 400 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Button primary={p.featured} style={{ width: "100%", justifyContent: "center" }}>{p.price === "$0" ? "Get Started" : "Activate"}</Button>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ── DASHBOARD PREVIEW ── */
const DashboardPreview = () => {
  const stats = [
    { label: "SAFETY SCORE", value: "78", color: T.cyan },
    { label: "THREATS BLOCKED", value: "47", color: T.ember },
    { label: "DEVICES ACTIVE", value: "3", color: T.blue },
    { label: "SHIELD STATUS", value: "ONLINE", color: "#22c55e" },
  ];
  const activity = [
    { title: "Phishing Blocked", desc: "Suspicious link from support@amazon.net", time: "12m", color: T.red },
    { title: "Weak Password", desc: "Netflix credentials found in breach DB", time: "2h", color: T.gold },
    { title: "Scan Complete", desc: "No threats on primary device", time: "5h", color: "#22c55e" },
  ];
  return (
    <section id="dashboard" style={{ padding: "100px clamp(20px, 5vw, 80px)", maxWidth: 1400, margin: "0 auto" }}>
      <Reveal><SectionHead badge="Dashboard" title="Your Dashboard" subtitle="Preview of your personal cyber defense command center." /></Reveal>
      <Reveal delay={0.2}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Card style={{ padding: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 32 }} className="dashboard-stats-grid">
              {stats.map((s, i) => (
                <div key={i} style={{ border: `1px solid ${T.border}`, padding: "20px", textAlign: "center", borderRadius: 12, background: "rgba(0,0,0,0.15)" }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.mutedDark, marginBottom: 8, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 26, color: s.color, fontWeight: 700 }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.mutedDark, marginBottom: 14, fontWeight: 600 }}>Recent Activity</div>
            {activity.map((a, i) => (
              <div key={i} style={{ padding: "16px 0", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.3s ease", borderRadius: 8, cursor: "default" }}
                onMouseEnter={ev => { ev.currentTarget.style.background = "rgba(99,102,241,0.03)"; ev.currentTarget.style.paddingLeft = "8px"; }}
                onMouseLeave={ev => { ev.currentTarget.style.background = "transparent"; ev.currentTarget.style.paddingLeft = "0"; }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: a.color, boxShadow: `0 0 8px ${a.color}40` }} />
                  <div>
                    <div style={{ color: T.white, fontSize: 14, fontWeight: 600 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: T.mutedDark }}>{a.desc}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: T.mutedDark, fontFamily: "var(--font-mono)" }}>{a.time}</div>
              </div>
            ))}
          </Card>
        </div>
      </Reveal>
    </section>
  );
};

/* ── FOUNDER ── */
const FounderSection = () => (
  <section style={{ padding: "120px clamp(20px, 5vw, 80px)", maxWidth: 1400, margin: "0 auto" }}>
    <Reveal>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Badge color={T.mutedDark}>About</Badge>
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 44, alignItems: "start", marginTop: 36 }} className="founder-grid">
          <div className="founder-avatar" style={{
            width: 110, height: 110, borderRadius: 22,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))",
            border: "1px solid rgba(99,102,241,0.15)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 300, color: T.white, opacity: 0.9 }}>S</span>
          </div>
          <div>
            <Badge color={T.accent}>Founder & CEO</Badge>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, color: T.white, margin: "14px 0 22px", letterSpacing: "-0.03em" }}>Sahil Anil Nikam</h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 17, color: T.white, lineHeight: 1.7, fontStyle: "italic", fontWeight: 400, margin: "0 0 22px", opacity: 0.8 }}>
              "The digital world connects billions of people, but it also exposes them to invisible threats. I created Secuvion because cybersecurity shouldn't be a luxury — it should be a right."
            </p>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.75, margin: 0 }}>
              Most cybersecurity platforms focus exclusively on enterprise clients, leaving billions of everyday users exposed. Secuvion was built to change that equation — creating a global cyber defense network that protects the students, families, and small businesses who need it most.
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  </section>
);

/* ── FOOTER ── */
const Footer = () => (
  <footer style={{
    borderTop: `1px solid rgba(148,163,184,0.06)`, padding: "100px clamp(20px, 5vw, 80px) 48px", marginTop: 80,
    background: "linear-gradient(180deg, transparent 0%, rgba(6,255,208,0.015) 100%)",
    position: "relative",
  }}>
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 60, alignItems: "start" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <BrandIcon size={42} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 17, letterSpacing: 3, color: T.white, fontWeight: 700 }}>SECUVION</span>
        </div>
        <p style={{ fontFamily: "var(--font-body)", color: T.mutedDark, fontSize: 14, lineHeight: 1.8, fontStyle: "italic" }}>
          Click with care,<br />we are always there.
        </p>
      </div>
      {[
        { t: "Platform", l: [
          { label: "Features", to: "/#features" },
          { label: "Pricing", to: "/pricing" },
          { label: "Dashboard", to: "/dashboard" },
          { label: "Analyzer", to: "/fraud-analyzer" },
        ]},
        { t: "Company", l: [
          { label: "About", to: "/founder" },
          { label: "Founder", to: "/founder" },
          { label: "Threat Map", to: "/threat-map" },
          { label: "Contact", to: "/emergency-help" },
        ]},
        { t: "Resources", l: [
          { label: "Learn", to: "/learn" },
          { label: "Scam Database", to: "/scam-database" },
          { label: "Security Score", to: "/security-score" },
          { label: "Emergency Help", to: "/emergency-help" },
        ]},
        { t: "Legal", l: [
          { label: "Privacy Policy", to: "/pricing" },
          { label: "Terms of Service", to: "/pricing" },
          { label: "Login", to: "/login" },
          { label: "Sign Up", to: "/signup" },
        ]},
      ].map((c, i) => (
        <div key={i}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.muted, marginBottom: 18, fontWeight: 600 }}>{c.t}</div>
          {c.l.map((l, j) => (
            <Link key={j} to={l.to} className="footer-link" style={{ display: "block", color: T.mutedDark, fontSize: 14, padding: "8px 0", cursor: "pointer", transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)", fontWeight: 400, textDecoration: "none" }}
              onMouseEnter={e => { e.target.style.color = T.white; e.target.style.transform = "translateX(6px)"; }}
              onMouseLeave={e => { e.target.style.color = T.mutedDark; e.target.style.transform = "translateX(0)"; }}>{l.label}</Link>
          ))}
        </div>
      ))}
    </div>
    <div style={{ textAlign: "center", marginTop: 72, paddingTop: 28, borderTop: `1px solid rgba(148,163,184,0.05)` }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.mutedDark }}>© 2026 Secuvion. Founded by Sahil Anil Nikam.</span>
    </div>
  </footer>
);

/* ══════════════════════════════
   MAIN APP
   ══════════════════════════════ */
export default function SecuvionV2() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    if (introComplete) {
      const t = setTimeout(() => setPageReady(true), 150);
      return () => clearTimeout(t);
    }
  }, [introComplete]);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "Threats", id: "threats" },
    { label: "Education", id: "education" },
    { label: "Pricing", id: "pricing" },
  ];

  return (
    <div style={{ background: T.bg, color: T.white, minHeight: "100vh", fontFamily: "var(--font-body)", overflowX: "hidden" }}>

      {/* Cinematic Intro Loader */}
      {!introComplete && <CinematicLoader onComplete={() => setIntroComplete(true)} />}

      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=JetBrains+Mono:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --font-display: 'Space Grotesk', 'Outfit', -apple-system, sans-serif;
  --font-body: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { overflow-x: hidden; }
body { max-width: 1900px; margin: auto; }

::selection { background: rgba(99,102,241,0.3); color: #fff; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 10px; }

/* Smooth global transitions */
html { scroll-behavior: smooth; }

@keyframes hud-spin { to { transform: rotate(360deg) } }
@keyframes hud-spin-r { to { transform: rotate(-360deg) } }
@keyframes blink-cursor { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
@keyframes pulse-dot { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes scrollDot { 0% { opacity: 1; transform: translateY(0); } 50% { opacity: 0.3; transform: translateY(12px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes gradient-border { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes hero-glow { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.65; transform: scale(1.08); } }
@keyframes shimmer-badge { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes ripple { 0% { transform: translate(-50%,-50%) scale(0); opacity: 0.5; } 100% { transform: translate(-50%,-50%) scale(4); opacity: 0; } }
@keyframes glow-breathe { 0%,100% { box-shadow: 0 0 20px rgba(6,255,208,0.06); } 50% { box-shadow: 0 0 40px rgba(6,255,208,0.12); } }
@keyframes scan-hud { 0% { left: -10%; } 100% { left: 110%; } }
@keyframes border-glow { 0%,100% { border-color: rgba(6,255,208,0.08); } 50% { border-color: rgba(6,255,208,0.2); } }
@keyframes counter-flash { 0% { color: #fff; } 100% { color: inherit; } }
@keyframes card-enter { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* Page entry slide-up */
@keyframes page-entry {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes nav-entry {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Brand logo animations */
@keyframes brand-orbit-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes brand-orbit-ring2 { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }

/* Status pulse */
@keyframes status-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50% { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
}

/* Glow drift for hero orbs */
@keyframes glow-drift {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  33% { transform: translate(15px, -10px) scale(1.04); opacity: 0.7; }
  66% { transform: translate(-10px, 8px) scale(0.97); opacity: 0.55; }
}

/* Divider glow */
@keyframes divider-glow {
  0%, 100% { opacity: 0.4; width: 80px; }
  50% { opacity: 1; width: 140px; }
}

/* Nav link underline */
.nav-link-animated::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 1.5px;
  background: #6366f1;
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  transform: translateX(-50%);
  border-radius: 1px;
}
.nav-link-animated:hover::after {
  width: 100%;
}

/* Feature icon hover */
div:hover > .feature-icon,
div:hover > .step-icon {
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 8px 20px rgba(99,102,241,0.15);
}

/* Pricing card hover */
.pricing-card:hover {
  transform: scale(1.03) translateY(-6px) !important;
  box-shadow: 0 24px 70px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.08) !important;
  border-color: rgba(99,102,241,0.2) !important;
}

/* Input focus glow */
input:focus {
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1), inset 0 1px 2px rgba(0,0,0,0.1) !important;
}

/* Footer link arrow on hover */
.footer-link {
  position: relative;
}

/* Family icon bounce on card hover */
div:hover > .family-icon {
  transform: scale(1.15) translateY(-4px);
}

/* Founder avatar hover */
.founder-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 16px 50px rgba(99,102,241,0.15);
  border-color: rgba(99,102,241,0.25);
}

/* Smooth counter number transition */
@keyframes count-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Stagger children animation helper */
@keyframes stagger-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Premium Divider */
.section-divider {
  height: 1px; width: 50%; margin: 0 auto;
  background: linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.08) 20%, rgba(148,163,184,0.08) 50%, rgba(99,102,241,0.08) 80%, transparent 100%);
  position: relative;
}
.section-divider::after {
  content: "";
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent);
  border-radius: 2px;
  animation: divider-glow 4s ease-in-out infinite;
}

/* Responsive */
@media (max-width: 860px) {
  .threat-map-grid { grid-template-columns: 1fr !important; }
  .threat-map-grid > div:nth-child(1) { order: 2; }
  .threat-map-grid > div:nth-child(2) { min-height: 400px !important; order: 1; }
  .threat-map-grid > div:nth-child(3) { order: 3; }
}

@media (max-width: 768px) {
  .hero-hud-right { display: none !important; }
  .nav-links-desktop { display: none !important; }
  .nav-burger { display: flex !important; }
  .founder-grid { grid-template-columns: 1fr !important; }
  .dashboard-stats-grid { grid-template-columns: 1fr 1fr !important; }
}

@media (min-width: 769px) {
  .nav-burger { display: none !important; }
}
      `}</style>

      <ParticleField />

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 clamp(20px, 5vw, 80px)", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(3,7,18,0.7)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(200%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(200%)" : "none",
        borderBottom: scrolled ? `1px solid rgba(148,163,184,0.06)` : "1px solid transparent",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: pageReady ? 1 : 0,
        transform: pageReady ? "translateY(0)" : "translateY(-20px)",
      }}>
        <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
          <BrandIcon size={42} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 17, letterSpacing: 3, color: T.white, fontWeight: 700 }}>SECUVION</span>
        </div>
        <div className="nav-links-desktop" style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {navLinks.map(l => (
            <span key={l.id} onClick={() => scrollTo(l.id)} className="nav-link-animated"
              style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: T.mutedDark, cursor: "pointer", transition: "color 0.3s ease", position: "relative", padding: "4px 0" }}
              onMouseEnter={e => e.target.style.color = T.white}
              onMouseLeave={e => e.target.style.color = T.mutedDark}>{l.label}</span>
          ))}
          {user ? (
            <Link to="/dashboard" style={{ textDecoration: "none" }}>
              <Button primary style={{ padding: "9px 22px", fontSize: 13 }}>Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <Button style={{ padding: "9px 22px", fontSize: 13 }}>Login</Button>
              </Link>
              <Link to="/signup" style={{ textDecoration: "none" }}>
                <Button primary style={{ padding: "9px 22px", fontSize: 13 }}>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
        <div className="nav-burger" style={{ flexDirection: "column", gap: 5, cursor: "pointer", padding: 8 }} onClick={() => setMenuOpen(!menuOpen)}>
          <div style={{ width: 22, height: 2, background: T.white, borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <div style={{ width: 22, height: 2, background: T.white, borderRadius: 2, transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
          <div style={{ width: 22, height: 2, background: T.white, borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, bottom: 0, zIndex: 99,
          background: "rgba(3,7,18,0.95)", backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          padding: "48px clamp(20px, 5vw, 80px)",
          animation: "fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {navLinks.map((l, i) => (
            <div key={l.id} onClick={() => scrollTo(l.id)}
              style={{
                padding: "22px 0", borderBottom: `1px solid rgba(148,163,184,0.06)`,
                fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, color: T.white,
                cursor: "pointer", letterSpacing: "-0.03em",
                opacity: 0, animation: `card-enter 0.5s ease forwards ${i * 0.08}s`,
              }}>{l.label}</div>
          ))}
          <div style={{ marginTop: 40, opacity: 0, animation: `card-enter 0.5s ease forwards ${navLinks.length * 0.08}s`, display: "flex", flexDirection: "column", gap: 12 }}>
            {user ? (
              <Link to="/dashboard" style={{ textDecoration: "none" }}>
                <Button primary style={{ width: "100%", justifyContent: "center" }}>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <Button style={{ width: "100%", justifyContent: "center" }}>Login</Button>
                </Link>
                <Link to="/signup" style={{ textDecoration: "none" }}>
                  <Button primary style={{ width: "100%", justifyContent: "center" }}>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{
        position: "relative", zIndex: 2,
        opacity: pageReady ? 1 : 0,
        transform: pageReady ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <Hero onNav={scrollTo} />
        <div className="section-divider" />
        <VisionBand />
        <div className="section-divider" />
        <Analyzer />
        <div className="section-divider" />
        <HowItWorks />
        <div className="section-divider" />
        <Features />
        <div className="section-divider" />
        <ThreatMapSection />
        <div className="section-divider" />
        <SafetyScore />
        <div className="section-divider" />
        <BreachCheck />
        <div className="section-divider" />
        <Emergency />
        <div className="section-divider" />
        <ScamFeed />
        <div className="section-divider" />
        <Assistant />
        <div className="section-divider" />
        <FamilyProtection />
        <div className="section-divider" />
        <Education />
        <div className="section-divider" />
        <Pricing />
        <div className="section-divider" />
        <DashboardPreview />
        <div className="section-divider" />
        <FounderSection />
        <Footer />
      </div>
    </div>
  );
}
