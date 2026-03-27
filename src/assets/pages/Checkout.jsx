import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = {
  bg: "#030712", surface: "#111827", card: "rgba(17,24,39,0.8)",
  accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444",
  white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)",
};

const plans = {
  pro: { name: "Professional", price: 29, annual: 290, features: ["Real-time threat detection", "VPN Protection", "5 Devices", "Email protection", "24/7 Support", "Weekly reports"] },
  enterprise: { name: "Enterprise", price: 79, annual: 790, features: ["Everything in Pro", "Unlimited devices", "Dark web monitoring", "API access", "Dedicated manager", "Custom integrations", "Priority support", "Advanced analytics"] },
};

// Inline SVG icons
const IconCreditCard = ({ size = 18, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const IconLock = ({ size = 18, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconCheck = ({ size = 14, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconShieldCheck = ({ size = 16, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconArrowLeft = ({ size = 18, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconLightning = ({ size = 18, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default function Checkout() {
  const { user, updatePlan } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planKey = params.get("plan") || "pro";
  const plan = plans[planKey] || plans.pro;
  const [billing, setBilling] = useState("monthly");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const price = billing === "annual" ? plan.annual : plan.price;
  const savings = billing === "annual" ? (plan.price * 12 - plan.annual) : 0;

  const formatCard = (val) => val.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length >= 2) return clean.slice(0, 2) + "/" + clean.slice(2, 4);
    return clean;
  };

  const validate = () => {
    const e = {};
    if (card.number.replace(/\s/g, "").length < 16) e.number = "Enter a valid card number";
    if (!card.name.trim()) e.name = "Enter cardholder name";
    if (card.expiry.length < 5) e.expiry = "Enter valid expiry";
    if (card.cvv.length < 3) e.cvv = "Enter CVV";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      updatePlan(planKey);
      setTimeout(() => navigate("/dashboard"), 2000);
    }, 2500);
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <SEO title="Checkout" description="Complete your Secuvion subscription securely." path="/checkout" />
        <Navbar />
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          paddingTop: 100,
        }}>
          <div style={{ textAlign: "center", maxWidth: 400, padding: "0 24px" }}>
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              background: "rgba(34,197,94,0.1)",
              border: "2px solid rgba(34,197,94,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 28px",
              boxShadow: "0 0 40px rgba(34,197,94,0.15)",
            }}>
              <IconCheck size={40} color={T.green} />
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 700, color: T.white, marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
              Payment Successful!
            </h2>
            <p style={{ fontSize: 15, color: T.muted, marginBottom: 8 }}>
              Welcome to SECUVION {plan.name}
            </p>
            <p style={{ fontSize: 13, color: T.muted }}>Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Checkout" description="Complete your Secuvion subscription securely." path="/checkout" />
      <Navbar />

      <div style={{ paddingTop: 100 }}>
        {/* Back to Pricing link */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 20px 0" }}>
          <Link
            to="/pricing"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: T.muted, textDecoration: "none", fontSize: 13,
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = T.white}
            onMouseLeave={e => e.currentTarget.style.color = T.muted}
          >
            <IconArrowLeft size={15} color="currentColor" />
            Back to Pricing
          </Link>
        </div>

        {/* Page heading */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <IconLock size={14} color={T.green} />
            <span style={{ fontSize: 12, color: T.green, fontWeight: 500, letterSpacing: 0.5 }}>Secure Checkout</span>
          </div>
        </div>

        {/* 2-column grid */}
        <div className="checkout-grid" style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 40 }}>

          {/* LEFT — Payment Form */}
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: T.white, marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>
              Payment Details
            </h2>
            <p style={{ fontSize: 14, color: T.muted, marginBottom: 32 }}>Complete your purchase securely</p>

            {/* Billing Toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
              {["monthly", "annual"].map((b) => (
                <button key={b} onClick={() => setBilling(b)} style={{
                  padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  background: billing === b ? `linear-gradient(135deg, ${T.accent}, ${T.cyan})` : "transparent",
                  border: billing === b ? "none" : `1px solid ${T.border}`,
                  color: billing === b ? "#fff" : T.muted,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "all 0.2s",
                }}>
                  {b === "monthly" ? "Monthly" : `Annual (Save $${plan.price * 12 - plan.annual})`}
                </button>
              ))}
            </div>

            <form onSubmit={handlePayment}>
              {/* Card Number */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>
                  Card Number
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    style={{
                      width: "100%", padding: "14px 16px 14px 44px",
                      background: "rgba(15,23,42,0.6)",
                      border: errors.number ? `1px solid ${T.red}` : `1px solid ${T.border}`,
                      borderRadius: 10, color: T.white, fontSize: 15, outline: "none",
                      boxSizing: "border-box", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
                    }}
                  />
                  <IconCreditCard
                    size={18} color={T.muted}
                    style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  />
                </div>
                {errors.number && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.number}</span>}
              </div>

              {/* Cardholder Name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>
                  Cardholder Name
                </label>
                <input
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  placeholder="John Doe"
                  style={{
                    width: "100%", padding: "14px 16px",
                    background: "rgba(15,23,42,0.6)",
                    border: errors.name ? `1px solid ${T.red}` : `1px solid ${T.border}`,
                    borderRadius: 10, color: T.white, fontSize: 14, outline: "none",
                    boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                />
                {errors.name && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.name}</span>}
              </div>

              {/* Expiry + CVV */}
              <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>
                    Expiry Date
                  </label>
                  <input
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                    placeholder="MM/YY"
                    maxLength={5}
                    style={{
                      width: "100%", padding: "14px 16px",
                      background: "rgba(15,23,42,0.6)",
                      border: errors.expiry ? `1px solid ${T.red}` : `1px solid ${T.border}`,
                      borderRadius: 10, color: T.white, fontSize: 14, outline: "none",
                      boxSizing: "border-box", fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                  {errors.expiry && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.expiry}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>
                    CVV
                  </label>
                  <input
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    placeholder="123"
                    type="password"
                    maxLength={4}
                    style={{
                      width: "100%", padding: "14px 16px",
                      background: "rgba(15,23,42,0.6)",
                      border: errors.cvv ? `1px solid ${T.red}` : `1px solid ${T.border}`,
                      borderRadius: 10, color: T.white, fontSize: 14, outline: "none",
                      boxSizing: "border-box", fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                  {errors.cvv && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.cvv}</span>}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={processing}
                style={{
                  width: "100%", padding: "16px",
                  background: processing ? "rgba(99,102,241,0.4)" : `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                  border: "none", borderRadius: 10, color: "#fff", fontSize: 16, fontWeight: 700,
                  cursor: processing ? "wait" : "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "opacity 0.2s",
                }}
              >
                <IconLock size={18} color="#fff" />
                {processing ? "Processing Payment..." : `Pay $${price}${billing === "monthly" ? "/mo" : "/yr"}`}
              </button>
            </form>

            {/* Trust badges */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 16, marginTop: 20, flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 11, color: T.muted }}>256-bit SSL Encryption</span>
              <span style={{ color: T.border }}>|</span>
              <span style={{ fontSize: 11, color: T.muted }}>PCI DSS Compliant</span>
              <span style={{ color: T.border }}>|</span>
              <span style={{ fontSize: 11, color: T.muted }}>30-day Money Back</span>
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div>
            <div style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
              padding: 28, backdropFilter: "blur(10px)", position: "sticky", top: 110,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 20 }}>Order Summary</h3>

              {/* Plan highlight */}
              <div style={{
                padding: 16,
                background: `linear-gradient(135deg, rgba(99,102,241,0.12), rgba(20,227,197,0.06))`,
                borderRadius: 12, border: `1px solid rgba(99,102,241,0.15)`, marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <IconLightning size={18} color={T.accent} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.white }}>{plan.name}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.cyan, fontFamily: "'Space Grotesk', sans-serif" }}>
                  ${price}<span style={{ fontSize: 14, fontWeight: 400, color: T.muted }}>/{billing === "annual" ? "yr" : "mo"}</span>
                </div>
                {savings > 0 && (
                  <div style={{ fontSize: 12, color: T.green, marginTop: 4 }}>You save ${savings}/year</div>
                )}
              </div>

              {/* Feature list */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{
                  fontSize: 13, fontWeight: 600, color: T.muted, marginBottom: 12,
                  textTransform: "uppercase", letterSpacing: 1,
                }}>Includes</h4>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                    <IconCheck size={14} color={T.green} />
                    <span style={{ fontSize: 13, color: T.white }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: T.muted }}>Subtotal</span>
                  <span style={{ fontSize: 13, color: T.white }}>${price}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: T.muted }}>Tax</span>
                  <span style={{ fontSize: 13, color: T.white }}>$0.00</span>
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  paddingTop: 12, borderTop: `1px solid ${T.border}`,
                }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.white }}>Total</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.cyan }}>${price}</span>
                </div>
              </div>

              {/* Money-back guarantee */}
              <div style={{
                marginTop: 20, padding: 12,
                background: "rgba(34,197,94,0.06)", borderRadius: 8,
                border: "1px solid rgba(34,197,94,0.1)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <IconShieldCheck size={16} color={T.green} />
                  <span style={{ fontSize: 12, color: T.green, fontWeight: 500 }}>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
