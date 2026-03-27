import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

export default function NotFound() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "180px 24px 120px", textAlign: "center" }}>
        <div style={{ marginBottom: 20 }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", opacity: 0.7 }}>
            <path d="M26 4L6 12V26C6 37 15 46.5 26 49C37 46.5 46 37 46 26V12L26 4Z" fill="none" stroke="url(#shieldGrad)" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M18 24L26 32L34 20" stroke="none"/>
            <path d="M20 22L26 28M26 28L32 22M26 28V36" stroke="url(#shieldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 15L33 37" stroke="url(#crackGrad)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" opacity="0.6"/>
            <defs>
              <linearGradient id="shieldGrad" x1="6" y1="4" x2="46" y2="49" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#14e3c5"/>
              </linearGradient>
              <linearGradient id="crackGrad" x1="19" y1="15" x2="33" y2="37" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f87171"/>
                <stop offset="1" stopColor="#fb923c"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(100px, 15vw, 160px)", fontWeight: 800, background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 16, animation: "float404 3s ease-in-out infinite" }}>404</div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, margin: "0 0 12px" }}>Page Not Found</h1>
        <p style={{ color: T.muted, fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" style={{ padding: "14px 32px", background: T.accent, color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Back to Home</Link>
          <Link to="/contact" style={{ padding: "14px 32px", background: "transparent", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 10, textDecoration: "none", fontSize: 14 }}>Contact Support</Link>
        </div>

        <div className="resp-grid-3" style={{ marginTop: 64, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[{ label: "Threat Map", to: "/threat-map" }, { label: "Fraud Analyzer", to: "/fraud-analyzer" }, { label: "Security Score", to: "/security-score" }].map(l => (
            <Link key={l.to} to={l.to} style={{ padding: "20px 16px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, textDecoration: "none", color: T.white, fontSize: 13, fontWeight: 500, transition: "border-color 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <Footer />
      <style>{`
  @keyframes float404 {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
  }
  @media (max-width: 768px) {
    .resp-grid-3 { grid-template-columns: 1fr !important; }
  }
`}</style>
    </div>
  );
}
