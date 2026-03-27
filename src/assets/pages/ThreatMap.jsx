import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ThreatMapLive from "../../components/ThreatMapLive";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", ember: "#f97316", red: "#ef4444", gold: "#eab308", purple: "#a78bfa", blue: "#38bdf8", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

const cities = [
  { n: "New York", x: 27, y: 36 }, { n: "London", x: 47, y: 27 }, { n: "Moscow", x: 60, y: 25 },
  { n: "Mumbai", x: 66, y: 48 }, { n: "Tokyo", x: 83, y: 33 }, { n: "Sao Paulo", x: 31, y: 66 },
  { n: "Sydney", x: 85, y: 73 }, { n: "Lagos", x: 49, y: 53 }, { n: "Singapore", x: 75, y: 55 },
  { n: "Berlin", x: 51, y: 27 }, { n: "Dubai", x: 61, y: 42 }, { n: "Seoul", x: 80, y: 34 },
];
const types = ["MALWARE", "PHISHING", "DDOS", "RANSOMWARE", "EXPLOIT"];
const typeColors = { MALWARE: T.red, PHISHING: T.gold, DDOS: T.ember, RANSOMWARE: T.purple, EXPLOIT: T.blue };

export default function ThreatMap() {
  const [events, setEvents] = useState([]);
  const [count, setCount] = useState(2843921);

  useEffect(() => {
    const c1 = setInterval(() => setCount(c => c + Math.floor(Math.random() * 15) + 3), 1500);
    const add = () => {
      const from = cities[Math.floor(Math.random() * cities.length)];
      let to = cities[Math.floor(Math.random() * cities.length)];
      if (from.n === to.n) return;
      setEvents(prev => [...prev.slice(-12), { id: Date.now() + Math.random(), from, to, type: types[Math.floor(Math.random() * types.length)], time: new Date().toLocaleTimeString("en-US", { hour12: false }) }]);
    };
    const iv = setInterval(add, 1200);
    add(); setTimeout(add, 300); setTimeout(add, 700);
    return () => { clearInterval(iv); clearInterval(c1); };
  }, []);

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Live Threat Map" description="Real-time global cyber threat visualization showing active attacks worldwide." path="/threat-map" />
      <Navbar />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}><Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link></div>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.red}0c`, border: `1px solid ${T.red}20`, fontSize: 11, fontWeight: 600, color: T.red, marginBottom: 16, letterSpacing: 0.5 }}>Live Intelligence</span>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Global Cyber Threat Map</h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>Real-time visualization of cyber attacks detected worldwide.</p>
        </div>

        {/* Status bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", marginBottom: 20, borderRadius: 12, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.red }} />
            <span style={{ color: T.red, fontWeight: 600, fontSize: 13 }}>Threat Level: Elevated</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.white, fontWeight: 700, fontSize: 16 }}>{count.toLocaleString()}</span>
            <span style={{ color: T.mutedDark, fontSize: 12 }}>attacks today</span>
          </div>
        </div>

        {/* Map */}
        <div style={{ position: "relative", height: 500, borderRadius: 18, overflow: "hidden", border: `1px solid rgba(20,227,197,0.06)`, boxShadow: "0 8px 40px rgba(0,0,0,0.3)", marginBottom: 24 }}>
          <ThreatMapLive events={events} />
        </div>

        {/* Bottom panels */}
        <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Attack Vectors */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: "0 0 18px" }}>Attack Vectors</h3>
            {types.map(t => (
              <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: typeColors[t] }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.white }}>{t}</span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: typeColors[t], fontWeight: 600 }}>{Math.floor(count * [0.3, 0.25, 0.18, 0.12, 0.15][types.indexOf(t)]).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Live Feed */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: 0 }}>Live Feed</h3>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.red, fontWeight: 500 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.red }} />Live
              </span>
            </div>
            <div style={{ maxHeight: 240, overflow: "auto" }}>
              {events.slice().reverse().map(e => (
                <div key={e.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: typeColors[e.type] }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: typeColors[e.type], fontWeight: 700, letterSpacing: 1 }}>{e.type}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: T.mutedDark, marginLeft: "auto" }}>{e.time}</span>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.mutedDark, paddingLeft: 12 }}>
                    <span style={{ color: T.white }}>{e.from.n}</span> <span style={{ color: T.red }}>&rarr;</span> <span style={{ color: T.white }}>{e.to.n}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`
  @media (max-width: 768px) {
    .resp-grid-2 { grid-template-columns: 1fr !important; }
  }
`}</style>
    </div>
  );
}
