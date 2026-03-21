import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  HiOutlineViewGrid, HiOutlineUsers, HiOutlineShieldCheck, HiOutlineBell,
  HiOutlineCog, HiOutlineLogout, HiOutlineSearch, HiOutlineChevronDown,
  HiOutlineDatabase, HiOutlineGlobe, HiOutlineLightningBolt, HiOutlineDocumentReport,
  HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineEye, HiOutlineCheck,
  HiOutlineX, HiOutlineClock, HiOutlineExclamation
} from "react-icons/hi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

const T = {
  bg: "#030712", sidebar: "#0a0f1e", surface: "#111827", card: "rgba(17,24,39,0.8)",
  accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444",
  orange: "#f97316", gold: "#eab308", pink: "#ec4899",
  white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)",
};

const scanData = [
  { month: "Feb", total: 2100, scanned: 1800 }, { month: "Mar", total: 3200, scanned: 2900 },
  { month: "Apr", total: 3800, scanned: 3500 }, { month: "May", total: 4200, scanned: 3800 },
  { month: "Jun", total: 4500, scanned: 4100 }, { month: "Jul", total: 3900, scanned: 3600 },
  { month: "Aug", total: 5800, scanned: 5200 }, { month: "Sep", total: 6200, scanned: 5800 },
  { month: "Oct", total: 7100, scanned: 6500 }, { month: "Nov", total: 8500, scanned: 7800 },
  { month: "Dec", total: 7200, scanned: 6600 }, { month: "Jan", total: 9500, scanned: 8000 },
];

const threatData = [
  { name: "Malware", value: 35, color: T.red },
  { name: "Phishing", value: 28, color: T.orange },
  { name: "DDoS", value: 18, color: T.gold },
  { name: "Ransomware", value: 12, color: T.pink },
  { name: "Other", value: 7, color: T.accent },
];

const recentAlerts = [
  { id: 1, type: "critical", msg: "Ransomware detected on endpoint SRV-04", time: "2 min ago", status: "active" },
  { id: 2, type: "warning", msg: "Unusual login from IP 192.168.45.12", time: "15 min ago", status: "active" },
  { id: 3, type: "info", msg: "SSL certificate expires in 7 days", time: "1 hr ago", status: "pending" },
  { id: 4, type: "critical", msg: "Brute force attempt blocked (3,421 tries)", time: "2 hrs ago", status: "resolved" },
  { id: 5, type: "warning", msg: "Port scan detected from external IP", time: "3 hrs ago", status: "resolved" },
];

const recentUsers = [
  { id: 1, name: "Alexandra Morella", email: "alex@corp.com", role: "Admin", status: "active", lastLogin: "2 min ago" },
  { id: 2, name: "Michael Chen", email: "m.chen@corp.com", role: "User", status: "active", lastLogin: "1 hr ago" },
  { id: 3, name: "Sarah Williams", email: "s.will@corp.com", role: "User", status: "inactive", lastLogin: "3 days ago" },
  { id: 4, name: "James Rodriguez", email: "j.rod@corp.com", role: "Moderator", status: "active", lastLogin: "5 hrs ago" },
  { id: 5, name: "Emily Davis", email: "e.davis@corp.com", role: "User", status: "active", lastLogin: "12 min ago" },
];

const navItems = [
  { icon: HiOutlineViewGrid, label: "Dashboard", active: true },
  { icon: HiOutlineUsers, label: "Users" },
  { icon: HiOutlineShieldCheck, label: "Protection" },
  { icon: HiOutlineGlobe, label: "Threat Map" },
  { icon: HiOutlineDatabase, label: "Database" },
  { icon: HiOutlineLightningBolt, label: "Analytics" },
  { icon: HiOutlineBell, label: "Alerts", badge: 3 },
  { icon: HiOutlineDocumentReport, label: "Reports" },
  { icon: HiOutlineCog, label: "Settings" },
];

const StatCard = ({ icon: Icon, label, value, sub, color, gradient }) => (
  <div style={{
    background: gradient || T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "24px 20px",
    flex: 1, minWidth: 200, backdropFilter: "blur(10px)", position: "relative", overflow: "hidden",
  }}>
    {gradient && <div style={{ position: "absolute", inset: 0, opacity: 0.08, background: gradient }} />}
    <div style={{ position: "relative" }}>
      <Icon size={22} color={color || T.cyan} style={{ marginBottom: 12 }} />
      <div style={{ fontSize: 13, color: T.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("Dashboard");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const alertColor = (type) => type === "critical" ? T.red : type === "warning" ? T.orange : T.cyan;
  const statusColor = (s) => s === "active" ? T.green : s === "pending" ? T.gold : T.muted;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 70, background: T.sidebar, borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", transition: "width 0.3s", flexShrink: 0, position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${T.cyan}, ${T.accent})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>S</div>
          {sidebarOpen && <span style={{ fontSize: 18, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk', sans-serif" }}>SECUVION</span>}
        </div>

        <nav style={{ flex: 1, padding: "0 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => (
            <button key={item.label} onClick={() => setActiveNav(item.label)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: sidebarOpen ? "10px 16px" : "10px 12px",
              background: activeNav === item.label ? `linear-gradient(135deg, rgba(99,102,241,0.15), rgba(20,227,197,0.08))` : "transparent",
              border: activeNav === item.label ? `1px solid rgba(99,102,241,0.2)` : "1px solid transparent",
              borderRadius: 10, color: activeNav === item.label ? T.cyan : T.muted,
              cursor: "pointer", fontSize: 14, fontWeight: activeNav === item.label ? 600 : 400,
              transition: "all 0.2s", justifyContent: sidebarOpen ? "flex-start" : "center", position: "relative",
              width: "100%", fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
              {item.badge && (
                <span style={{
                  position: sidebarOpen ? "relative" : "absolute", top: sidebarOpen ? 0 : -4, right: sidebarOpen ? 0 : -4,
                  background: T.orange, color: "#fff", fontSize: 10, fontWeight: 700,
                  padding: "1px 6px", borderRadius: 10, marginLeft: sidebarOpen ? "auto" : 0,
                }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", margin: "8px",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10,
          color: T.red, cursor: "pointer", fontSize: 14, fontWeight: 500,
          justifyContent: sidebarOpen ? "flex-start" : "center", fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          <HiOutlineLogout size={20} />
          {sidebarOpen && <span>Log Out</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {/* Top Bar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 32px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0,
          background: "rgba(3,7,18,0.85)", backdropFilter: "blur(12px)", zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
              background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, minWidth: 280,
            }}>
              <HiOutlineSearch size={16} color={T.muted} />
              <input placeholder="Search project, folder or file" style={{
                background: "none", border: "none", color: T.white, fontSize: 13, outline: "none", width: "100%",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 13, color: T.muted, cursor: "pointer" }}>Last Week</span>
            <span style={{ fontSize: 13, color: T.white, cursor: "pointer", fontWeight: 600 }}>Last Month</span>
            <div style={{ position: "relative" }}>
              <HiOutlineBell size={20} color={T.muted} style={{ cursor: "pointer" }} />
              <div style={{
                position: "absolute", top: -4, right: -4, width: 8, height: 8,
                background: T.red, borderRadius: "50%", border: "2px solid #030712",
              }} />
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer",
            }}>
              {user?.name?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        <div style={{ padding: "28px 32px", maxWidth: 1400 }}>
          {/* Stats Row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            <StatCard icon={HiOutlineGlobe} label="Local Name" value="WINPQR-24" color="#38bdf8" gradient="linear-gradient(135deg, rgba(56,189,248,0.12), rgba(56,189,248,0.02))" />
            <StatCard icon={HiOutlineClock} label="Registered On" value="2023-01-02" sub="2:00 PM" color={T.accent} gradient="linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.02))" />
            <StatCard icon={HiOutlineDatabase} label="Scheduled Assets" value="131" sub="Subdomain - 5" color={T.green} gradient="linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.02))" />
            <StatCard icon={HiOutlineShieldCheck} label="Agent" value="v1.0.0.8" color={T.orange} gradient="linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.02))" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Bonus Banner */}
              <div style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)",
                borderRadius: 16, padding: "28px 32px", position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>Bonus of the month</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
                    You have Bonus $100
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>
                    10 Free Scans
                  </div>
                  <button style={{
                    padding: "8px 20px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    backdropFilter: "blur(10px)", fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    Claim Bonus
                  </button>
                </div>
                <div style={{
                  position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
                  fontSize: 80, opacity: 0.15,
                }}>
                  {"\u2728"}
                </div>
              </div>

              {/* Scan Chart */}
              <div style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                padding: 24, backdropFilter: "blur(10px)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk', sans-serif" }}>9.5k</div>
                      <div style={{ fontSize: 13, color: T.muted }}>Total Files</div>
                    </div>
                    <div style={{ width: 1, height: 32, background: T.border }} />
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk', sans-serif" }}>8k</div>
                      <div style={{ fontSize: 13, color: T.muted }}>Scanned Files</div>
                    </div>
                  </div>
                  <div style={{
                    padding: "6px 14px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 8, fontSize: 12, color: T.accent, fontWeight: 600,
                  }}>Nov, 2023</div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={scanData} barGap={4}>
                    <XAxis dataKey="month" tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 13 }}
                      cursor={{ fill: "rgba(99,102,241,0.05)" }}
                    />
                    <Bar dataKey="total" fill={T.accent} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="scanned" fill={T.cyan} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Alerts Table */}
              <div style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                padding: 24, backdropFilter: "blur(10px)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white }}>Recent Alerts</h3>
                  <span style={{ fontSize: 13, color: T.cyan, cursor: "pointer" }}>View All &gt;</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                      {["Severity", "Alert", "Time", "Status"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, color: T.muted, fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentAlerts.map((a) => (
                      <tr key={a.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                            background: alertColor(a.type), boxShadow: `0 0 6px ${alertColor(a.type)}`,
                          }} />
                        </td>
                        <td style={{ padding: "12px", fontSize: 13, color: T.white }}>{a.msg}</td>
                        <td style={{ padding: "12px", fontSize: 12, color: T.muted }}>{a.time}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                            background: `${statusColor(a.status)}15`, color: statusColor(a.status),
                            textTransform: "capitalize",
                          }}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* IP Conflicts */}
              <div style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                padding: 20, backdropFilter: "blur(10px)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: T.white }}>IP Conflicts Report</h4>
                  <HiOutlineX size={16} color={T.muted} style={{ cursor: "pointer" }} />
                </div>
                {[
                  { label: "Private IP", sub: "Assigned by LAN admin", ok: true },
                  { label: "Public IP", sub: "By Service Provider", ok: true },
                ].map((ip) => (
                  <div key={ip.label} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 0", borderBottom: `1px solid ${T.border}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: ip.ok ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <HiOutlineShieldCheck size={16} color={ip.ok ? T.green : T.red} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{ip.label}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>{ip.sub}</div>
                      </div>
                    </div>
                    <HiOutlineCheck size={18} color={T.green} />
                  </div>
                ))}
              </div>

              {/* Protection Status */}
              <div style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                padding: 24, backdropFilter: "blur(10px)", textAlign: "center",
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 20 }}>Protection Status</h4>
                <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 16px" }}>
                  <svg viewBox="0 0 36 36" style={{ width: 140, height: 140, transform: "rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke={T.accent} strokeWidth="3"
                      strokeDasharray="97.4" strokeDashoffset={97.4 * 0.2} strokeLinecap="round" />
                  </svg>
                  <div style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, fontWeight: 800, color: T.accent, fontFamily: "'Space Grotesk', sans-serif",
                  }}>80%</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 4 }}>Average Protection</div>
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>Check what you can do to be fully protected</div>
                <button style={{
                  padding: "10px 28px", background: "transparent", border: `1px solid ${T.border}`,
                  borderRadius: 8, color: T.white, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, margin: "0 auto",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>Overview &gt;</button>
              </div>

              {/* Issues Total */}
              <div style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                padding: 24, backdropFilter: "blur(10px)",
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.accent, fontFamily: "'Space Grotesk', sans-serif" }}>262</div>
                <div style={{ fontSize: 14, color: T.white, marginBottom: 16 }}>issues total</div>
                {[
                  { label: "Simple", pct: 50, color: T.red },
                  { label: "Medium", pct: 25, color: "#38bdf8" },
                  { label: "Complex", pct: 10, color: T.pink },
                ].map((i) => (
                  <div key={i.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: T.white }}>{i.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{i.pct}%</span>
                    <div style={{ width: 60, height: 4, background: "rgba(148,163,184,0.1)", borderRadius: 2, marginLeft: 8 }}>
                      <div style={{ width: `${i.pct}%`, height: "100%", background: i.color, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Users Table */}
              <div style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                padding: 20, backdropFilter: "blur(10px)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: T.white }}>Active Users</h4>
                  <span style={{ fontSize: 12, color: T.cyan, cursor: "pointer" }}>View All</span>
                </div>
                {recentUsers.slice(0, 4).map((u) => (
                  <div key={u.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: `1px solid ${T.border}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, color: "#fff",
                      }}>{u.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: T.white }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>{u.email}</div>
                      </div>
                    </div>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: u.status === "active" ? T.green : T.muted,
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          padding: "20px 32px", borderTop: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 12, color: T.muted }}>&copy; 2026 SECUVION. All rights reserved. Founder: Sahil Anil Nikam</span>
          <span style={{ fontSize: 12, color: T.muted }}>v1.0.0 | Admin Panel</span>
        </footer>
      </main>
    </div>
  );
}
