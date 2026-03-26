import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", accentSoft: "#818cf8", cyan: "#14e3c5", ember: "#f97316", red: "#ef4444", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

export default function About() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link>
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>About Secuvion</span>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
            Cybersecurity for <span style={{ background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Everyone</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 17, maxWidth: 600, margin: "0 auto", lineHeight: 1.8 }}>
            Most cybersecurity companies protect corporations. We protect people. Secuvion is building a global defense network for students, families, and small businesses.
          </p>
        </div>

        {/* Mission */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 80 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 36 }}>
            <div style={{ fontSize: 28, marginBottom: 16 }}>&#x1F3AF;</div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 600, margin: "0 0 12px" }}>Our Mission</h3>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.8 }}>
              To democratize cybersecurity by making enterprise-grade protection accessible and affordable for everyone. We believe online safety is a fundamental right, not a luxury reserved for corporations with massive IT budgets.
            </p>
          </div>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 36 }}>
            <div style={{ fontSize: 28, marginBottom: 16 }}>&#x1F441;</div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 600, margin: "0 0 12px" }}>Our Vision</h3>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.8 }}>
              A world where every individual can navigate the digital landscape without fear of fraud, identity theft, or exploitation. We envision AI-powered security as a universal shield, protecting billions of connected lives across every continent.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 80, textAlign: "center" }}>
          {[
            { val: "1.2M+", label: "Users Protected", color: T.cyan },
            { val: "84", label: "Countries Covered", color: T.accent },
            { val: "12B+", label: "Threat Signatures", color: T.ember },
            { val: "99.7%", label: "Detection Rate", color: "#22c55e" },
          ].map((s, i) => (
            <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "32px 16px" }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 800, color: s.color, letterSpacing: "-0.03em" }}>{s.val}</div>
              <div style={{ fontSize: 13, color: T.mutedDark, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, textAlign: "center", margin: "0 0 48px", letterSpacing: "-0.02em" }}>Our Core Values</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { icon: "\uD83D\uDD12", title: "Privacy First", desc: "Your data belongs to you. We use zero-knowledge architecture and never sell personal information." },
              { icon: "\uD83E\uDD16", title: "AI-Powered Defense", desc: "Leveraging neural networks trained on billions of threat patterns for real-time, intelligent protection." },
              { icon: "\uD83C\uDF0D", title: "Global Accessibility", desc: "Security shouldn't have borders. We serve users in 84 countries with localized threat intelligence." },
              { icon: "\uD83D\uDCA1", title: "Radical Transparency", desc: "Open about our methods, clear in our communications, and honest about what we can and cannot protect." },
              { icon: "\uD83D\uDC65", title: "Community Driven", desc: "Built with feedback from real users. Our roadmap is shaped by the people we protect." },
              { icon: "\u26A1", title: "Always Evolving", desc: "Threats evolve daily. So do we. Continuous updates ensure protection against the latest attack vectors." },
            ].map((v, i) => (
              <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "28px 24px" }}>
                <div style={{ fontSize: 24, marginBottom: 14 }}>{v.icon}</div>
                <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: "0 0 8px" }}>{v.title}</h4>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Founder */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "clamp(32px, 4vw, 56px)", marginBottom: 80 }}>
          <div style={{ display: "flex", gap: 36, alignItems: "start" }}>
            <div style={{ width: 90, height: 90, borderRadius: 20, background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))", border: "1px solid rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 300, color: T.white, opacity: 0.9 }}>S</span>
            </div>
            <div>
              <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 10 }}>Founder & CEO</span>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 600, margin: "0 0 16px", letterSpacing: "-0.02em" }}>Sahil Anil Nikam</h3>
              <blockquote style={{ fontSize: 16, color: T.white, lineHeight: 1.7, fontStyle: "italic", margin: "0 0 16px", opacity: 0.8, borderLeft: `3px solid ${T.accent}`, paddingLeft: 20 }}>
                "The digital world connects billions of people, but it also exposes them to invisible threats. I created Secuvion because cybersecurity shouldn't be a luxury — it should be a right."
              </blockquote>
              <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.75, margin: 0 }}>
                Sahil founded Secuvion with a simple belief: that everyone deserves protection online. His vision is to build the world's most accessible cyber defense platform.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "56px 32px", background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,227,197,0.03))", border: `1px solid rgba(99,102,241,0.1)`, borderRadius: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, margin: "0 0 14px" }}>Join Our Mission</h2>
          <p style={{ color: T.muted, fontSize: 16, marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>Start protecting your digital life today. Free forever plan available.</p>
          <Link to="/signup" style={{ display: "inline-block", padding: "14px 36px", background: T.accent, color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Get Started Free</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
