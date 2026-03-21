import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  HiOutlineCreditCard, HiOutlineLockClosed, HiOutlineCheck,
  HiOutlineShieldCheck, HiOutlineArrowLeft, HiOutlineLightningBolt,
} from "react-icons/hi";

const T = {
  bg: "#030712", surface: "#111827", card: "rgba(17,24,39,0.8)",
  accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444",
  white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)",
};

const plans = {
  pro: { name: "Professional", price: 29, annual: 290, features: ["Real-time threat detection", "VPN Protection", "5 Devices", "Email protection", "24/7 Support", "Weekly reports"] },
  enterprise: { name: "Enterprise", price: 79, annual: 790, features: ["Everything in Pro", "Unlimited devices", "Dark web monitoring", "API access", "Dedicated manager", "Custom integrations", "Priority support", "Advanced analytics"] },
};

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
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.1)",
            border: "2px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
          }}>
            <HiOutlineCheck size={36} color={T.green} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: T.white, marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>Payment Successful!</h2>
          <p style={{ fontSize: 14, color: T.muted, marginBottom: 8 }}>Welcome to SECUVION {plan.name}</p>
          <p style={{ fontSize: 13, color: T.muted }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "20px 40px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/pricing" style={{ display: "flex", alignItems: "center", gap: 8, color: T.muted, textDecoration: "none", fontSize: 14 }}>
          <HiOutlineArrowLeft size={18} /> Back to Pricing
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <HiOutlineLockClosed size={14} color={T.green} />
          <span style={{ fontSize: 12, color: T.green }}>Secure Checkout</span>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 40 }}>
        {/* Payment Form */}
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.white, marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>Payment Details</h2>
          <p style={{ fontSize: 14, color: T.muted, marginBottom: 32 }}>Complete your purchase securely</p>

          {/* Billing Toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {["monthly", "annual"].map((b) => (
              <button key={b} onClick={() => setBilling(b)} style={{
                padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
                background: billing === b ? `linear-gradient(135deg, ${T.accent}, ${T.cyan})` : "transparent",
                border: billing === b ? "none" : `1px solid ${T.border}`,
                color: billing === b ? "#fff" : T.muted, fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {b === "monthly" ? "Monthly" : `Annual (Save $${plan.price * 12 - plan.annual})`}
              </button>
            ))}
          </div>

          <form onSubmit={handlePayment}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>Card Number</label>
              <div style={{ position: "relative" }}>
                <input
                  value={card.number} onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                  placeholder="1234 5678 9012 3456" maxLength={19}
                  style={{
                    width: "100%", padding: "14px 16px 14px 44px", background: "rgba(15,23,42,0.6)",
                    border: errors.number ? `1px solid ${T.red}` : `1px solid ${T.border}`, borderRadius: 10,
                    color: T.white, fontSize: 15, outline: "none", boxSizing: "border-box",
                    fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
                  }}
                />
                <HiOutlineCreditCard size={18} color={T.muted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              </div>
              {errors.number && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.number}</span>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>Cardholder Name</label>
              <input
                value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })}
                placeholder="John Doe"
                style={{
                  width: "100%", padding: "14px 16px", background: "rgba(15,23,42,0.6)",
                  border: errors.name ? `1px solid ${T.red}` : `1px solid ${T.border}`, borderRadius: 10,
                  color: T.white, fontSize: 14, outline: "none", boxSizing: "border-box",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
              {errors.name && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.name}</span>}
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>Expiry Date</label>
                <input
                  value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                  placeholder="MM/YY" maxLength={5}
                  style={{
                    width: "100%", padding: "14px 16px", background: "rgba(15,23,42,0.6)",
                    border: errors.expiry ? `1px solid ${T.red}` : `1px solid ${T.border}`, borderRadius: 10,
                    color: T.white, fontSize: 14, outline: "none", boxSizing: "border-box",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
                {errors.expiry && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.expiry}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>CVV</label>
                <input
                  value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  placeholder="123" type="password" maxLength={4}
                  style={{
                    width: "100%", padding: "14px 16px", background: "rgba(15,23,42,0.6)",
                    border: errors.cvv ? `1px solid ${T.red}` : `1px solid ${T.border}`, borderRadius: 10,
                    color: T.white, fontSize: 14, outline: "none", boxSizing: "border-box",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
                {errors.cvv && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.cvv}</span>}
              </div>
            </div>

            <button type="submit" disabled={processing} style={{
              width: "100%", padding: "16px",
              background: processing ? "rgba(99,102,241,0.4)" : `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
              border: "none", borderRadius: 10, color: "#fff", fontSize: 16, fontWeight: 700,
              cursor: processing ? "wait" : "pointer", fontFamily: "'Space Grotesk', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <HiOutlineLockClosed size={18} />
              {processing ? "Processing Payment..." : `Pay $${price}${billing === "monthly" ? "/mo" : "/yr"}`}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 20 }}>
            <span style={{ fontSize: 11, color: T.muted }}>256-bit SSL Encryption</span>
            <span style={{ color: T.border }}>|</span>
            <span style={{ fontSize: 11, color: T.muted }}>PCI DSS Compliant</span>
            <span style={{ color: T.border }}>|</span>
            <span style={{ fontSize: 11, color: T.muted }}>30-day Money Back</span>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
            padding: 28, backdropFilter: "blur(10px)", position: "sticky", top: 20,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 20 }}>Order Summary</h3>

            <div style={{
              padding: 16, background: `linear-gradient(135deg, rgba(99,102,241,0.12), rgba(20,227,197,0.06))`,
              borderRadius: 12, border: `1px solid rgba(99,102,241,0.15)`, marginBottom: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <HiOutlineLightningBolt size={18} color={T.accent} />
                <span style={{ fontSize: 15, fontWeight: 700, color: T.white }}>{plan.name}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: T.cyan, fontFamily: "'Space Grotesk', sans-serif" }}>
                ${price}<span style={{ fontSize: 14, fontWeight: 400, color: T.muted }}>/{billing === "annual" ? "yr" : "mo"}</span>
              </div>
              {savings > 0 && (
                <div style={{ fontSize: 12, color: T.green, marginTop: 4 }}>You save ${savings}/year</div>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: T.muted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Includes</h4>
              {plan.features.map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                  <HiOutlineCheck size={14} color={T.green} />
                  <span style={{ fontSize: 13, color: T.white }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: T.muted }}>Subtotal</span>
                <span style={{ fontSize: 13, color: T.white }}>${price}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: T.muted }}>Tax</span>
                <span style={{ fontSize: 13, color: T.white }}>$0.00</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: T.white }}>Total</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: T.cyan }}>${price}</span>
              </div>
            </div>

            <div style={{ marginTop: 20, padding: 12, background: "rgba(34,197,94,0.06)", borderRadius: 8, border: "1px solid rgba(34,197,94,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlineShieldCheck size={16} color={T.green} />
                <span style={{ fontSize: 12, color: T.green, fontWeight: 500 }}>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ padding: "20px 40px", borderTop: `1px solid ${T.border}`, textAlign: "center" }}>
        <span style={{ fontSize: 12, color: T.muted }}>&copy; 2026 SECUVION. All rights reserved. Founder: Sahil Anil Nikam</span>
      </footer>
    </div>
  );
}
