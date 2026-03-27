import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", ember: "#f97316", red: "#ef4444", gold: "#eab308", purple: "#a78bfa", blue: "#38bdf8", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

const modules = [
  { id: 1, tag: "ESSENTIAL", color: T.red, title: "How to Spot Phishing Emails", time: "5 min", content: "Phishing is the #1 cyber threat. Red flags:\n\n1. Urgency tactics — 'Your account will be locked in 24 hours'\n2. Suspicious sender addresses — check for misspellings (amaz0n.com)\n3. Generic greetings — 'Dear Customer' instead of your name\n4. Hover over links — if the URL doesn't match, it's phishing\n5. Unexpected attachments — never open .exe, .zip from unknowns\n6. Grammar and spelling errors — legitimate companies proofread\n\nIf in doubt, go directly to the website by typing the URL yourself." },
  { id: 2, tag: "FUNDAMENTALS", color: T.blue, title: "Understanding Online Scams", time: "7 min", content: "Scammers use psychology to trick victims:\n\n1. Romance scams — fake profiles building emotional connections\n2. Investment scams — guaranteed high returns (crypto, forex)\n3. Tech support scams — fake pop-ups about infections\n4. Job scams — fake postings requesting fees\n5. Lottery/prize scams — pay a fee to claim winnings\n6. Impersonation — pretending to be government or bank\n\nRule: If it sounds too good to be true, it is." },
  { id: 3, tag: "FINANCE", color: T.gold, title: "Protecting Your Bank Account", time: "6 min", content: "Your financial accounts are prime targets:\n\n1. Enable two-factor authentication on all banking apps\n2. Never share OTPs — your bank will NEVER ask for them\n3. Use unique, strong passwords for each financial account\n4. Set up transaction alerts for any amount\n5. Avoid banking on public WiFi — use mobile data or VPN\n6. Regularly check statements for unauthorized transactions\n7. Freeze your card immediately if you suspect compromise\n8. Use virtual cards for online shopping" },
  { id: 4, tag: "EMERGENCY", color: T.ember, title: "What to Do After a Breach", time: "4 min", content: "If your accounts are compromised, act fast:\n\n1. IMMEDIATELY change passwords on all affected accounts\n2. Enable 2FA on everything — email, social, banking\n3. Check for unauthorized logins in security settings\n4. Revoke access to unknown devices and third-party apps\n5. Run a full antivirus scan on all devices\n6. Alert your bank if financial data was exposed\n7. File a report with cybercrime authorities\n8. Monitor credit report for unusual activity\n\nThe first 24 hours are critical." },
  { id: 5, tag: "PRIVACY", color: T.purple, title: "Social Media Privacy Guide", time: "5 min", content: "Your social media reveals more than you think:\n\n1. Set profiles to private — limit who sees your posts\n2. Disable location tags on photos\n3. Review app permissions — revoke unused apps\n4. Don't share: birthday, mother's maiden name, pet names\n5. Be cautious with quizzes — they harvest data\n6. Use different emails for social media and banking\n7. Regularly Google yourself to see what's public\n8. Enable login alerts for account access" },
  { id: 6, tag: "FUNDAMENTALS", color: T.cyan, title: "Password Security Mastery", time: "3 min", content: "Your password is your first line of defense:\n\n1. Use 12+ characters mixing types\n2. Never reuse passwords across accounts\n3. Use a password manager (1Password, Bitwarden)\n4. Enable 2FA everywhere — use authenticator apps\n5. Avoid personal info in passwords\n6. Use passphrases — 'correct-horse-battery-staple'\n7. Change passwords after any breach notification\n8. Never share passwords via text or email" },
  { id: 7, tag: "ESSENTIAL", color: T.red, title: "Safe Online Shopping", time: "5 min", content: "E-commerce fraud costs billions annually:\n\n1. Only shop on HTTPS sites — look for the padlock\n2. Use credit cards over debit cards\n3. Enable purchase notifications\n4. Be wary of deals 'too good to be true'\n5. Check seller reviews before purchasing\n6. Use virtual card numbers for online purchases\n7. Never save card details on untrusted sites\n8. Verify return/refund policy before buying" },
  { id: 8, tag: "PRIVACY", color: T.purple, title: "VPN & Public WiFi Safety", time: "4 min", content: "Public WiFi is a hacker's playground:\n\n1. Never access banking on public WiFi\n2. Use a reputable VPN to encrypt your connection\n3. Disable auto-connect to WiFi networks\n4. Verify network names with staff\n5. Turn off file sharing in public places\n6. Use HTTPS-only websites on shared networks\n7. Forget networks after you're done\n8. Consider using your phone's hotspot instead" },
];

export default function Learn() {
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const tags = ["ALL", "ESSENTIAL", "FUNDAMENTALS", "FINANCE", "EMERGENCY", "PRIVACY"];
  const filtered = filter === "ALL" ? modules : modules.filter(m => m.tag === filter);

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Learn" description="Free cybersecurity education modules covering phishing, passwords, privacy, and more." path="/learn" />
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link>
        </div>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>Education</span>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Cyber Safety <span style={{ background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Knowledge Base</span></h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>Practical, jargon-free guides to protect yourself online.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 36 }}>
          {tags.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ padding: "8px 18px", borderRadius: 100, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.3s", background: filter === t ? `${T.accent}15` : "rgba(148,163,184,0.04)", border: `1px solid ${filter === t ? T.accent + "30" : T.border}`, color: filter === t ? T.accent : T.mutedDark }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(m => (
            <div key={m.id} style={{ background: T.card, border: `1px solid ${active === m.id ? m.color + "20" : T.border}`, borderRadius: 14, overflow: "hidden", transition: "all 0.3s", cursor: "pointer" }} onClick={() => setActive(active === m.id ? null : m.id)}>
              <div style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ padding: "4px 10px", borderRadius: 6, background: `${m.color}0a`, border: `1px solid ${m.color}15`, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, color: m.color, letterSpacing: 1, flexShrink: 0 }}>{m.tag}</span>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: 0, flex: 1 }}>{m.title}</h3>
                <span style={{ fontSize: 12, color: T.mutedDark, flexShrink: 0 }}>{m.time}</span>
                <span style={{ color: T.accent, fontSize: 18, transition: "transform 0.4s", transform: active === m.id ? "rotate(45deg)" : "none", fontWeight: 300 }}>+</span>
              </div>
              {active === m.id && (
                <div style={{ padding: "0 28px 28px", borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
                  {m.content.split("\n").map((line, i) => (
                    <p key={i} style={{ color: /^\d\./.test(line) ? T.white : T.muted, fontSize: 14, lineHeight: 1.8, margin: line === "" ? "12px 0" : "4px 0", fontWeight: /^\d\./.test(line) ? 500 : 400 }}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
