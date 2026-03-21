import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  HiOutlineViewGrid, HiOutlineShieldCheck, HiOutlineBell, HiOutlineCog,
  HiOutlineLogout, HiOutlineSearch, HiOutlineGlobe, HiOutlineLightningBolt,
  HiOutlineDocumentReport, HiOutlineTrendingUp, HiOutlineEye, HiOutlineCheck,
  HiOutlineLockClosed, HiOutlineWifi, HiOutlineMail, HiOutlineExclamation,
  HiOutlineCreditCard, HiOutlineChartBar, HiOutlineRefresh, HiOutlineClipboardCheck,
} from "react-icons/hi";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const T = {
  bg: "#030712", sidebar: "#0a0f1e", surface: "#111827", card: "rgba(17,24,39,0.8)",
  accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444",
  orange: "#f97316", gold: "#eab308", pink: "#ec4899",
  white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)",
};

const activityData = [
  { day: "Mon", threats: 12, blocked: 11 }, { day: "Tue", threats: 19, blocked: 18 },
  { day: "Wed", threats: 8, blocked: 8 }, { day: "Thu", threats: 24, blocked: 22 },
  { day: "Fri", threats: 15, blocked: 14 }, { day: "Sat", threats: 6, blocked: 6 },
  { day: "Sun", threats: 3, blocked: 3 },
];

const deviceData = [
  { name: "Desktop", value: 45, color: T.accent },
  { name: "Mobile", value: 30, color: T.cyan },
  { name: "Tablet", value: 15, color: T.orange },
  { name: "IoT", value: 10, color: T.pink },
];

const scanHistory = [
  { id: 1, name: "Full System Scan", date: "Mar 20, 2026", threats: 2, status: "completed" },
  { id: 2, name: "Quick Scan", date: "Mar 19, 2026", threats: 0, status: "completed" },
  { id: 3, name: "Network Scan", date: "Mar 18, 2026", threats: 1, status: "completed" },
  { id: 4, name: "Email Scan", date: "Mar 17, 2026", threats: 3, status: "completed" },
  { id: 5, name: "Scheduled Scan", date: "Mar 16, 2026", threats: 0, status: "completed" },
];

const notifications = [
  { id: 1, msg: "Suspicious login blocked from unknown IP", time: "5 min ago", type: "warning" },
  { id: 2, msg: "Weekly scan completed - 2 threats found", time: "2 hrs ago", type: "info" },
  { id: 3, msg: "Password change recommended", time: "1 day ago", type: "info" },
];

const navItems = [
  { icon: HiOutlineViewGrid, label: "Overview", active: true },
  { icon: HiOutlineShieldCheck, label: "Protection" },
  { icon: HiOutlineGlobe, label: "Network" },
  { icon: HiOutlineChartBar, label: "Analytics" },
  { icon: HiOutlineBell, label: "Alerts", badge: 2 },
  { icon: HiOutlineCreditCard, label: "Billing" },
  { icon: HiOutlineCog, label: "Settings" },
];

const planLabels = { free: "Free", pro: "Professional", enterprise: "Enterprise" };
const planColors = { free: T.muted, pro: T.cyan, enterprise: T.accent };

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Overview");
  const [scanning, setScanning] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };
  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  const plan = user?.plan || "free";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: T.sidebar, borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${T.cyan}, ${T.accent})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#fff",
          }}>S</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk', sans-serif" }}>SECUVION</span>
        </div>

        {/* User Profile Card */}
        <div style={{ margin: "0 12px 16px", padding: 16, background: "rgba(99,102,241,0.06)", borderRadius: 12, border: `1px solid rgba(99,102,241,0.1)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#fff",
            }}>{user?.name?.charAt(0) || "U"}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{user?.name || "User"}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{user?.email || ""}</div>
            </div>
          </div>
          <div style={{
            padding: "4px 10px", background: `${planColors[plan]}15`, border: `1px solid ${planColors[plan]}30`,
            borderRadius: 6, fontSize: 11, fontWeight: 600, color: planColors[plan], textAlign: "center",
          }}>{planLabels[plan]} Plan</div>
        </div>

        <nav style={{ flex: 1, padding: "0 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => (
            <button key={item.label} onClick={() => setActiveNav(item.label)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", width: "100%",
              background: activeNav === item.label ? `linear-gradient(135deg, rgba(99,102,241,0.15), rgba(20,227,197,0.08))` : "transparent",
              border: activeNav === item.label ? `1px solid rgba(99,102,241,0.2)` : "1px solid transparent",
              borderRadius: 10, color: activeNav === item.label ? T.cyan : T.muted,
              cursor: "pointer", fontSize: 14, fontWeight: activeNav === item.label ? 600 : 400,
              fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative",
            }}>
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: T.orange, color: "#fff", fontSize: 10, fontWeight: 700,
                  padding: "1px 6px", borderRadius: 10, marginLeft: "auto",
                }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px" }}>
          <Link to="/pricing" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "10px", background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
            borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none",
            marginBottom: 8,
          }}>
            <HiOutlineLightningBolt size={16} /> Upgrade Plan
          </Link>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", width: "100%",
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10,
            color: T.red, cursor: "pointer", fontSize: 14, fontWeight: 500,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            <HiOutlineLogout size={20} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {/* Top Bar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 32px", borderBottom: `1px solid ${T.border}`,
          background: "rgba(3,7,18,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk', sans-serif" }}>
              Welcome back, {user?.name?.split(" ")[0] || "User"}
            </h1>
            <p style={{ fontSize: 13, color: T.muted }}>Here's your security overview</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={handleScan} disabled={scanning} style={{
              padding: "8px 20px", background: scanning ? "rgba(99,102,241,0.2)" : `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
              border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: scanning ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              <HiOutlineRefresh size={16} style={{ animation: scanning ? "spin 1s linear infinite" : "none" }} />
              {scanning ? "Scanning..." : "Quick Scan"}
            </button>
            <div style={{ position: "relative" }}>
              <HiOutlineBell size={20} color={T.muted} style={{ cursor: "pointer" }} />
              <div style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, background: T.red, borderRadius: "50%", border: "2px solid #030712" }} />
            </div>
          </div>
        </header>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        <div style={{ padding: "28px 32px", maxWidth: 1200 }}>
          {/* Security Score */}
          <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            {[
              { icon: HiOutlineShieldCheck, label: "Security Score", value: "87/100", color: T.green, desc: "Good" },
              { icon: HiOutlineLockClosed, label: "Threats Blocked", value: "1,247", color: T.cyan, desc: "This month" },
              { icon: HiOutlineWifi, label: "Network Status", value: "Secure", color: T.green, desc: "All ports monitored" },
              { icon: HiOutlineMail, label: "Email Protection", value: "Active", color: T.accent, desc: "12 phishing blocked" },
            ].map((s) => (
              <div key={s.label} style={{
                flex: 1, minWidth: 200, background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 14, padding: "20px", backdropFilter: "blur(10px)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon size={18} color={s.color} />
                  </div>
                  <span style={{ fontSize: 12, color: T.muted }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: s.color, marginTop: 4 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Threat Activity Chart */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 20 }}>Threat Activity (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.red} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={T.red} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.cyan} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={T.cyan} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 13 }} />
                    <Area type="monotone" dataKey="threats" stroke={T.red} fill="url(#threatGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="blocked" stroke={T.cyan} fill="url(#blockedGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Scan History */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white }}>Scan History</h3>
                  <span style={{ fontSize: 13, color: T.cyan, cursor: "pointer" }}>View All &gt;</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                      {["Scan Name", "Date", "Threats", "Status"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, color: T.muted, fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scanHistory.map((s) => (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "12px", fontSize: 13, color: T.white }}>{s.name}</td>
                        <td style={{ padding: "12px", fontSize: 12, color: T.muted }}>{s.date}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ color: s.threats > 0 ? T.orange : T.green, fontSize: 13, fontWeight: 600 }}>{s.threats}</span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                            background: "rgba(34,197,94,0.1)", color: T.green,
                          }}>
                            <HiOutlineCheck size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Protection Circle */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, textAlign: "center" }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 16 }}>Overall Protection</h4>
                <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 16px" }}>
                  <svg viewBox="0 0 36 36" style={{ width: 160, height: 160, transform: "rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke={T.green} strokeWidth="2.5"
                      strokeDasharray="97.4" strokeDashoffset={97.4 * 0.13} strokeLinecap="round" />
                  </svg>
                  <div style={{
                    position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: T.green, fontFamily: "'Space Grotesk', sans-serif" }}>87%</div>
                    <div style={{ fontSize: 11, color: T.muted }}>Protected</div>
                  </div>
                </div>
                {[
                  { label: "Firewall", active: true },
                  { label: "Real-time Protection", active: true },
                  { label: "VPN", active: plan !== "free" },
                  { label: "Dark Web Monitor", active: plan === "enterprise" },
                ].map((f) => (
                  <div key={f.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0", borderBottom: `1px solid ${T.border}`,
                  }}>
                    <span style={{ fontSize: 13, color: T.white }}>{f.label}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: f.active ? T.green : T.muted,
                    }}>{f.active ? "Active" : "Upgrade"}</span>
                  </div>
                ))}
              </div>

              {/* Device Distribution */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 16 }}>Protected Devices</h4>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={0}>
                      {deviceData.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {deviceData.map((d) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                      <span style={{ fontSize: 12, color: T.muted }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.white }}>{d.value}%</span>
                  </div>
                ))}
              </div>

              {/* Notifications */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 12 }}>Notifications</h4>
                {notifications.map((n) => (
                  <div key={n.id} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <HiOutlineExclamation size={16} color={n.type === "warning" ? T.orange : T.cyan} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, color: T.white }}>{n.msg}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer style={{
          padding: "20px 32px", borderTop: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 12, color: T.muted }}>&copy; 2026 SECUVION. All rights reserved. Founder: Sahil Anil Nikam</span>
          <span style={{ fontSize: 12, color: T.muted }}>{planLabels[plan]} Plan</span>
        </footer>
      </main>
    </div>
  );
}
