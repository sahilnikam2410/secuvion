import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", accentSoft: "#818cf8", cyan: "#14e3c5", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 2000);
  };

  const inputStyle = {
    width: "100%", padding: "14px 18px", background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`, borderRadius: 10,
    color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, outline: "none", transition: "border-color 0.3s",
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Contact" description="Get in touch with the Secuvion team for support, partnerships, or inquiries." path="/contact" />
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link>
        </div>

        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>Contact</span>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Get in Touch</h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>Have questions, feedback, or need help? We'd love to hear from you.</p>
        </div>

        <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
          {/* Contact Form */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, backdropFilter: "blur(8px)", borderRadius: 16, padding: 36 }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28, color: "#22c55e" }}>&#10003;</div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 600, margin: "0 0 10px" }}>Message Sent!</h3>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7 }}>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  style={{ marginTop: 24, padding: "10px 24px", background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, borderRadius: 8, color: T.accent, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, margin: "0 0 24px" }}>Send a Message</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <input placeholder="Your Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.3)"} onBlur={e => e.target.style.borderColor = T.border} />
                  <input placeholder="Your Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.3)"} onBlur={e => e.target.style.borderColor = T.border} />
                  <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="" style={{ background: "#111827" }}>Select Subject</option>
                    <option value="general" style={{ background: "#111827" }}>General Inquiry</option>
                    <option value="support" style={{ background: "#111827" }}>Technical Support</option>
                    <option value="billing" style={{ background: "#111827" }}>Billing Question</option>
                    <option value="partnership" style={{ background: "#111827" }}>Partnership</option>
                    <option value="security" style={{ background: "#111827" }}>Report a Security Issue</option>
                  </select>
                  <textarea placeholder="Your Message *" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5}
                    style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.3)"} onBlur={e => e.target.style.borderColor = T.border} />
                  <button type="submit" disabled={sending}
                    style={{ padding: "14px 32px", background: sending ? T.mutedDark : T.accent, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: sending ? "default" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.3s" }}>
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { icon: "\u2709", title: "Email", info: "support@secuvion.com", sub: "We respond within 24 hours" },
              { icon: "\uD83D\uDCCD", title: "Location", info: "Maharashtra, India", sub: "Operating globally across 84 countries" },
              { icon: "\u23F0", title: "Business Hours", info: "24/7 Support Available", sub: "Emergency response team always online" },
              { icon: "\uD83D\uDEE1\uFE0F", title: "Security Reports", info: "security@secuvion.com", sub: "For vulnerability disclosures" },
            ].map((c, i) => (
              <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, backdropFilter: "blur(8px)", borderRadius: 14, padding: "24px 28px", display: "flex", gap: 18, alignItems: "start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${T.accent}08`, border: `1px solid ${T.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 14, color: T.cyan, fontWeight: 500, marginBottom: 2 }}>{c.info}</div>
                  <div style={{ fontSize: 12, color: T.mutedDark }}>{c.sub}</div>
                </div>
              </div>
            ))}

            <div style={{ background: T.card, border: `1px solid ${T.border}`, backdropFilter: "blur(8px)", borderRadius: 14, padding: "24px 28px" }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 12 }}>Follow Us</div>
              <div style={{ display: "flex", gap: 12 }}>
                {["X (Twitter)", "GitHub", "LinkedIn", "YouTube"].map((s, i) => (
                  <span key={i} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(148,163,184,0.04)", border: `1px solid ${T.border}`, fontSize: 12, color: T.muted, cursor: "pointer", transition: "all 0.3s" }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`
  @media (max-width: 768px) {
    .resp-grid-2 { grid-template-columns: 1fr !important; }
    .resp-grid-2 { gap: 24px !important; }
  }
`}</style>
    </div>
  );
}
