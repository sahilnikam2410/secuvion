import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", card: "rgba(17,24,39,0.8)", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)" };

function generateCode(uid) {
  const base = uid ? uid.slice(0, 6).toUpperCase() : Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SECUV-${base}`;
}

export default function Referral() {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      const stored = localStorage.getItem(`secuvion_referral_${user.uid}`);
      if (stored) { setCode(stored); }
      else { const c = generateCode(user.uid); setCode(c); localStorage.setItem(`secuvion_referral_${user.uid}`, c); }
      const refs = JSON.parse(localStorage.getItem(`secuvion_referrals_${user.uid}`) || "[]");
      setReferrals(refs);
    }
  }, [user]);

  const referralLink = `https://secuvion.vercel.app/signup?ref=${code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    const text = `Check out SECUVION — free AI-powered cybersecurity tools! Use my referral code: ${code}\n${referralLink}`;
    if (navigator.share) navigator.share({ title: "Join SECUVION", text, url: referralLink });
    else copyLink();
  };

  const rewards = [
    { count: 3, reward: "50 bonus AI credits", icon: "\u2B50" },
    { count: 5, reward: "1 month Standard free", icon: "\uD83C\uDF1F" },
    { count: 10, reward: "1 month Advanced free", icon: "\uD83D\uDC8E" },
    { count: 25, reward: "Lifetime Standard", icon: "\uD83C\uDFC6" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <SEO title="Refer & Earn" description="Invite friends to SECUVION and earn free credits and subscription upgrades." path="/referral" />
      <Navbar />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "120px 20px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#x1F381;</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Refer & Earn</h1>
          <p style={{ color: T.muted, fontSize: 15 }}>Invite friends and earn free credits & subscription upgrades</p>
        </div>

        {/* Referral code card */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Your Referral Code</h3>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, padding: "14px 16px", background: "rgba(15,23,42,0.6)", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 18, fontWeight: 700, color: T.cyan, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2 }}>{code}</div>
            <button onClick={copyLink} style={{ padding: "14px 20px", borderRadius: 10, border: "none", background: copied ? "rgba(34,197,94,0.15)" : `linear-gradient(135deg,${T.accent},${T.cyan})`, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{copied ? "Copied!" : "Copy Link"}</button>
          </div>

          <div style={{ padding: "10px 14px", background: "rgba(15,23,42,0.4)", borderRadius: 8, border: `1px solid ${T.border}`, wordBreak: "break-all", marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>{referralLink}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <button onClick={share} style={{ padding: "10px", borderRadius: 8, border: `1px solid ${T.border}`, background: "rgba(15,23,42,0.6)", color: T.white, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>&#x1F4E4; Share</button>
            <button onClick={() => { const url = `https://wa.me/?text=${encodeURIComponent(`Check out SECUVION! ${referralLink}`)}`; window.open(url, "_blank"); }} style={{ padding: "10px", borderRadius: 8, border: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.06)", color: T.green, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>WhatsApp</button>
            <button onClick={() => { const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out SECUVION — free AI cybersecurity tools! ${referralLink}`)}`; window.open(url, "_blank"); }} style={{ padding: "10px", borderRadius: 8, border: "1px solid rgba(29,161,242,0.2)", background: "rgba(29,161,242,0.06)", color: "#1DA1F2", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Twitter</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ padding: 20, background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: T.cyan, fontFamily: "'Space Grotesk',sans-serif" }}>{referrals.length}</div>
            <div style={{ fontSize: 12, color: T.muted }}>Successful Referrals</div>
          </div>
          <div style={{ padding: 20, background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: T.green, fontFamily: "'Space Grotesk',sans-serif" }}>{referrals.length * 10}</div>
            <div style={{ fontSize: 12, color: T.muted }}>Credits Earned</div>
          </div>
        </div>

        {/* Rewards tiers */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: T.white, marginBottom: 16, fontFamily: "'Space Grotesk',sans-serif" }}>Reward Tiers</h3>
          {rewards.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < rewards.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span style={{ fontSize: 24 }}>{r.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.white }}>{r.reward}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{r.count} referrals needed</div>
              </div>
              <div style={{ width: 60, textAlign: "right" }}>
                {referrals.length >= r.count ? (
                  <span style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>&#x2705; Earned</span>
                ) : (
                  <span style={{ fontSize: 12, color: T.muted }}>{r.count - referrals.length} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
