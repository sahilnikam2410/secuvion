/**
 * Weekly digest cron endpoint.
 * --------------------------------------------
 * Sends a personalized weekly security digest to opted-in users.
 * Designed to be triggered by Vercel Cron (vercel.json) every Monday 09:00 IST.
 *
 * Auth model:
 *   - Cron requests carry the secret in the `Authorization` header. If
 *     `CRON_SECRET` env var is unset the endpoint refuses all requests.
 *   - Vercel Cron auto-injects `Authorization: Bearer <CRON_SECRET>` when
 *     configured under Project Settings > Cron Jobs.
 *
 * Persistence note:
 *   Like /api/cashfree-webhook this is log-only on its own — actual user
 *   list comes from the public Firestore REST API using a server-side API
 *   key. For the MVP we POST to EmailJS REST endpoint per recipient,
 *   throttled to respect free-tier rate limits.
 *
 *   In production you'd swap this for a transactional ESP (Resend/Postmark)
 *   that supports batch sends with templating.
 *
 * Configure in vercel.json -> crons:
 *   { "path": "/api/weekly-digest", "schedule": "30 3 * * 1" }
 *   (Mondays 09:00 IST = 03:30 UTC)
 *
 * Required env vars on Vercel:
 *   CRON_SECRET                       any random string
 *   VITE_FIREBASE_PROJECT_ID          for REST API
 *   VITE_FIREBASE_API_KEY             public web API key
 *   VITE_EMAILJS_SERVICE_ID
 *   VITE_EMAILJS_PUBLIC_KEY
 *   VITE_EMAILJS_NOTIFY_TEMPLATE      reuses the notify template
 */

const TIPS = [
  "Rotate any password you reused on a service that's been in the news for a breach in the last 30 days.",
  "Run a Dark Web check on your two most-used email addresses; treat hits as homework.",
  "Review your phone's installed apps — uninstall anything you haven't opened in 90 days.",
  "Confirm 2FA is on for email, banking, primary social account, and any account holding payment info.",
  "Audit browser extensions; remove anything with broad permissions you don't recognize.",
];

const TOOLS_HIGHLIGHT = [
  { name: "Phishing Trainer", desc: "5 min quiz, real-world examples" },
  { name: "Security Audit", desc: "Personal score with action items" },
  { name: "Vulnerability Scanner", desc: "Spot risky open ports and outdated services" },
];

function pickWeekly(arr, weekIndex) {
  return arr[weekIndex % arr.length];
}

function weekOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = (d - start) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000);
  return Math.floor(diff / 86400000 / 7);
}

function buildDigestMessage(name, weekIdx) {
  const tip = pickWeekly(TIPS, weekIdx);
  const tool = pickWeekly(TOOLS_HIGHLIGHT, weekIdx);
  return `Hi ${name || "there"},

Your weekly security digest from VRIKAAN.

🎯 This week's action item:
${tip}

🛠 Tool highlight: ${tool.name}
${tool.desc}
Try it: https://vrikaan.com/dashboard

📊 Quick health checks (2 min each):
- Have any of your accounts been breached this week? https://vrikaan.com/dark-web-monitor
- Is your DNS leaking? https://vrikaan.com/dns-leak-test
- Has your domain's security headers grade slipped? https://vrikaan.com/security-headers

Stay safe,
The VRIKAAN Team

---
Update preferences in your dashboard or unsubscribe by replying with "unsubscribe".`;
}

async function fetchOptedInUsers(projectId, apiKey) {
  // Public Firestore REST API; pull users with weeklyDigest != false
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?pageSize=300&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Firestore fetch failed: ${res.status}`);
  const data = await res.json();
  const docs = data.documents || [];
  return docs
    .map((d) => {
      const f = d.fields || {};
      return {
        uid: d.name.split("/").pop(),
        email: f.email?.stringValue || "",
        name: f.name?.stringValue || "",
        plan: f.plan?.stringValue || "free",
        weeklyDigest: f.weeklyDigest?.booleanValue !== false, // default opt-in
      };
    })
    .filter((u) => u.email && u.weeklyDigest);
}

async function sendOneEmail(to, subject, message, env) {
  const payload = {
    service_id: env.VITE_EMAILJS_SERVICE_ID,
    template_id: env.VITE_EMAILJS_NOTIFY_TEMPLATE,
    user_id: env.VITE_EMAILJS_PUBLIC_KEY,
    template_params: {
      to_name: to.name || "User",
      to_email: to.email,
      from_name: "VRIKAAN",
      subject,
      message,
    },
  };
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`EmailJS ${res.status}`);
}

export default async function handler(req, res) {
  // Auth — only accept calls carrying the cron secret
  const expected = process.env.CRON_SECRET;
  const got = (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");
  if (!expected || got !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!projectId || !apiKey) {
    return res.status(500).json({ error: "Firebase env vars missing" });
  }

  try {
    const users = await fetchOptedInUsers(projectId, apiKey);
    const weekIdx = weekOfYear(new Date());
    const subject = `Your VRIKAAN weekly digest — wk ${weekIdx}`;
    let ok = 0, fail = 0;
    for (const u of users) {
      const message = buildDigestMessage(u.name, weekIdx);
      try {
        await sendOneEmail(u, subject, message, process.env);
        ok++;
      } catch (e) {
        console.warn(`digest fail for ${u.email}: ${e.message}`);
        fail++;
      }
      // Throttle so we don't hit EmailJS rate limit
      await new Promise((r) => setTimeout(r, 350));
    }
    console.log(`weekly-digest sent: ok=${ok} fail=${fail} total=${users.length}`);
    return res.status(200).json({ sent: ok, failed: fail, total: users.length });
  } catch (err) {
    console.error("weekly-digest error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
