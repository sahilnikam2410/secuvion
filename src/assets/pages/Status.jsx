import { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = {
  bg: "#030712", surface: "#111827", card: "rgba(17,24,39,0.7)",
  white: "#f1f5f9", muted: "#94a3b8", green: "#22c55e",
  orange: "#f97316", red: "#ef4444", border: "rgba(148,163,184,0.1)",
  cyan: "#14e3c5", accent: "#6366f1",
};

// Endpoints to ping. Each has expected behavior:
// - "404"  endpoint should respond, even with 404, to prove the function is alive
// - "401"  unauthorized response = endpoint up + auth check working
// - "ok"   needs valid 2xx
const ENDPOINTS = [
  { name: "Web", path: "/", method: "GET", expect: "ok" },
  { name: "AI Chat",          path: "/api/chat",                     method: "OPTIONS", expect: "any" },
  { name: "Cashfree Order",   path: "/api/create-checkout-session",  method: "OPTIONS", expect: "any" },
  { name: "Cashfree Verify",  path: "/api/verify-payment",           method: "OPTIONS", expect: "any" },
  { name: "Cashfree Webhook", path: "/api/cashfree-webhook",         method: "GET",     expect: "405" },
  { name: "Tools Dispatcher", path: "/api/tools",                    method: "GET",     expect: "400" },
  { name: "Threats DB",       path: "/api/threats",                  method: "GET",     expect: "ok" },
  { name: "URL Scanner",      path: "/api/scan-url",                 method: "OPTIONS", expect: "any" },
  { name: "SSL Check",        path: "/api/ssl",                      method: "OPTIONS", expect: "any" },
  { name: "Identity X-Ray",   path: "/api/identity-xray",            method: "OPTIONS", expect: "any" },
  { name: "Breach Check",     path: "/api/breach",                   method: "OPTIONS", expect: "any" },
  { name: "OG Image",         path: "/api/og?title=Status",          method: "GET",     expect: "ok" },
  { name: "Cron Digest",      path: "/api/cron-digest",              method: "GET",     expect: "401" },
];

async function pingOne(ep) {
  const start = performance.now();
  try {
    const res = await fetch(ep.path, {
      method: ep.method,
      headers: { "Content-Type": "application/json" },
    });
    const ms = Math.round(performance.now() - start);
    const status = res.status;
    let healthy = false;
    if (ep.expect === "ok") healthy = res.ok;
    else if (ep.expect === "any") healthy = true; // any reply means up
    else if (typeof ep.expect === "string") healthy = String(status) === ep.expect;
    return { ok: healthy, status, ms };
  } catch (e) {
    return { ok: false, status: 0, ms: Math.round(performance.now() - start), error: e.message };
  }
}

export default function Status() {
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const runAll = useCallback(async () => {
    setRunning(true);
    const next = {};
    // Run sequentially so we don't blast the same backend at once
    for (const ep of ENDPOINTS) {
      next[ep.name] = await pingOne(ep);
      setResults({ ...next });
    }
    setLastRun(new Date());
    setRunning(false);
  }, []);

  useEffect(() => {
    runAll();
    // Auto-refresh every 60s
    const id = setInterval(runAll, 60000);
    return () => clearInterval(id);
  }, [runAll]);

  const totalUp = Object.values(results).filter((r) => r.ok).length;
  const totalDown = Object.values(results).filter((r) => r && !r.ok).length;
  const overallStatus =
    totalDown === 0 && totalUp === ENDPOINTS.length ? "operational" :
    totalDown > 0 && totalDown < ENDPOINTS.length / 3 ? "degraded" :
    totalDown >= ENDPOINTS.length / 3 ? "outage" : "checking";

  const statusColor = {
    operational: T.green,
    degraded: T.orange,
    outage: T.red,
    checking: T.muted,
  }[overallStatus];

  const statusLabel = {
    operational: "All Systems Operational",
    degraded: "Partial Degradation",
    outage: "Major Outage",
    checking: "Checking…",
  }[overallStatus];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="System Status" description="Real-time uptime status of VRIKAAN services. Live pings of every API endpoint." path="/status" />
      <Navbar />

      <main style={{ paddingTop: 100, paddingBottom: 80 }}>
        <section style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              padding: "12px 24px", borderRadius: 100,
              background: `${statusColor}18`,
              border: `1px solid ${statusColor}40`,
              marginBottom: 18,
            }}>
              <span style={{
                width: 12, height: 12, borderRadius: "50%",
                background: statusColor,
                boxShadow: `0 0 12px ${statusColor}`,
                animation: overallStatus === "operational" ? "statusPulse 2s infinite" : "none",
              }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: statusColor }}>{statusLabel}</span>
            </div>
            <h1 style={{
              fontSize: 40, fontWeight: 800, color: T.white,
              margin: "0 0 8px", fontFamily: "'Space Grotesk', sans-serif",
            }}>System Status</h1>
            <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>
              Live health of every public endpoint. Auto-refreshes every 60s.
              {lastRun && ` Last checked: ${lastRun.toLocaleTimeString()}`}
            </p>
            <button
              onClick={runAll}
              disabled={running}
              style={{
                marginTop: 16, padding: "8px 20px", borderRadius: 8,
                background: "rgba(99,102,241,0.1)", border: `1px solid ${T.border}`,
                color: T.cyan, fontSize: 13, fontWeight: 600, cursor: running ? "wait" : "pointer",
                fontFamily: "inherit", opacity: running ? 0.6 : 1,
              }}
            >
              {running ? "Checking…" : "↻ Refresh now"}
            </button>
          </div>

          {/* Summary cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14, marginBottom: 28,
          }}>
            {[
              { label: "Total Services", value: ENDPOINTS.length, color: T.cyan },
              { label: "Operational", value: totalUp, color: T.green },
              { label: "Down", value: totalDown, color: totalDown ? T.red : T.muted },
              { label: "Avg Response", value: (() => {
                const arr = Object.values(results).map(r => r?.ms).filter(Boolean);
                return arr.length ? `${Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)}ms` : "—";
              })(), color: T.accent },
            ].map((s) => (
              <div key={s.label} style={{
                padding: 16, borderRadius: 12,
                background: T.card, border: `1px solid ${T.border}`,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Endpoint list */}
          <div style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 14, overflow: "hidden",
          }}>
            {ENDPOINTS.map((ep, i) => {
              const r = results[ep.name];
              const color = !r ? T.muted : r.ok ? T.green : T.red;
              const label = !r ? "checking…" : r.ok ? "operational" : `down (${r.status || "—"})`;
              return (
                <div key={ep.name} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 18px",
                  borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                  gap: 14,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: color, boxShadow: r?.ok ? `0 0 8px ${color}` : "none",
                      flexShrink: 0,
                    }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.white }}>{ep.name}</div>
                      <div style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis" }}>{ep.path}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color }}>{label}</div>
                    {r?.ms != null && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{r.ms}ms</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <p style={{ fontSize: 12, color: T.muted, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
            This page pings each endpoint from your browser. Issues here may not reflect global availability — try refreshing or checking from a different network.
          </p>
        </section>
      </main>

      <Footer />
      <style>{`
        @keyframes statusPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
