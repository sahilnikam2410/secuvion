import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HiOutlineCheck, HiOutlineLightningBolt, HiOutlineStar } from "react-icons/hi";

const T = {
  bg: "#030712", surface: "#111827", card: "rgba(17,24,39,0.6)",
  accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e",
  orange: "#f97316", white: "#f1f5f9", muted: "#94a3b8",
  border: "rgba(148,163,184,0.08)",
};

const plans = [
  {
    key: "free", name: "Free", price: 0, desc: "For personal use",
    features: ["Basic fraud detection", "Security advisories", "Email breach check", "Community reports", "1 device"],
    cta: "Get Started", highlight: false,
  },
  {
    key: "pro", name: "Professional", price: 29, desc: "For professionals",
    features: ["Real-time threat detection", "VPN Protection", "5 Devices", "Email protection", "24/7 Support", "Weekly reports", "Phishing alerts", "Priority response"],
    cta: "Upgrade to Pro", highlight: true,
  },
  {
    key: "enterprise", name: "Enterprise", price: 79, desc: "For organizations",
    features: ["Everything in Pro", "Unlimited devices", "Dark web monitoring", "API access", "Dedicated manager", "Custom integrations", "Priority support", "Advanced analytics", "SOC compliance"],
    cta: "Go Enterprise", highlight: false,
  },
];

export default function Pricing() {
  const { user } = useAuth();

  return (
    <section style={{
      minHeight: "100vh", background: T.bg, padding: "100px 20px 60px",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", color: T.cyan,
            letterSpacing: 3, fontSize: 12, marginBottom: 14,
          }}>[PLANS]</div>
          <h2 style={{
            fontSize: 42, fontWeight: 800, color: T.white, marginBottom: 16,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>Choose Your Shield</h2>
          <p style={{ fontSize: 16, color: T.muted, maxWidth: 500, margin: "0 auto" }}>
            World-class protection at prices built for real people.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {plans.map((plan) => (
            <div key={plan.key} style={{
              background: plan.highlight
                ? "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(20,227,197,0.06))"
                : T.card,
              border: plan.highlight
                ? "1px solid rgba(99,102,241,0.3)"
                : `1px solid ${T.border}`,
              borderRadius: 16, padding: "36px 28px", position: "relative",
              backdropFilter: "blur(10px)", display: "flex", flexDirection: "column",
              transform: plan.highlight ? "scale(1.03)" : "none",
            }}>
              {plan.highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  padding: "4px 16px", background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                  borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#fff",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <HiOutlineStar size={12} /> Most Popular
                </div>
              )}

              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.white, marginBottom: 4 }}>{plan.name}</h3>
              <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>{plan.desc}</p>

              <div style={{ marginBottom: 24 }}>
                <span style={{
                  fontSize: 42, fontWeight: 800, color: plan.highlight ? T.cyan : T.white,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>${plan.price}</span>
                {plan.price > 0 && <span style={{ fontSize: 14, color: T.muted }}>/month</span>}
              </div>

              <div style={{ flex: 1, marginBottom: 28 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <HiOutlineCheck size={16} color={T.green} />
                    <span style={{ fontSize: 13, color: T.white }}>{f}</span>
                  </div>
                ))}
              </div>

              {plan.price === 0 ? (
                <Link to={user ? "/dashboard" : "/signup"} style={{
                  display: "block", textAlign: "center", padding: "14px",
                  background: "transparent", border: `1px solid ${T.border}`,
                  borderRadius: 10, color: T.white, fontSize: 14, fontWeight: 600,
                  textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif",
                }}>{plan.cta}</Link>
              ) : (
                <Link to={user ? `/checkout?plan=${plan.key}` : "/signup"} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "14px",
                  background: plan.highlight ? `linear-gradient(135deg, ${T.accent}, ${T.cyan})` : "transparent",
                  border: plan.highlight ? "none" : `1px solid ${T.border}`,
                  borderRadius: 10, color: plan.highlight ? "#fff" : T.white,
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  <HiOutlineLightningBolt size={16} /> {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <p style={{ fontSize: 13, color: T.muted }}>
            All plans include a 30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
}
