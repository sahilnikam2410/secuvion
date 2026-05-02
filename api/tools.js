import { applyRateLimit } from "./_rateLimit.js";
import { getAdminFirestore } from "./_firebaseAdmin.js";

// ─── WHOIS ──────────────────────────────────────────────────────────

const DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const RDAP_ENDPOINTS = {
  com: "https://rdap.verisign.com/com/v1/domain/",
  net: "https://rdap.verisign.com/net/v1/domain/",
};
const RDAP_FALLBACK = "https://rdap.org/domain/";

function extractEvents(events) {
  const result = {};
  if (!Array.isArray(events)) return result;
  for (const event of events) {
    if (event.eventAction === "registration") result.creationDate = event.eventDate;
    if (event.eventAction === "expiration") result.expiryDate = event.eventDate;
    if (event.eventAction === "last changed") result.updatedDate = event.eventDate;
  }
  return result;
}

function extractRegistrar(entities) {
  if (!Array.isArray(entities)) return null;
  for (const entity of entities) {
    if (entity.roles && entity.roles.includes("registrar")) {
      if (entity.vcardArray && Array.isArray(entity.vcardArray[1])) {
        for (const field of entity.vcardArray[1]) {
          if (field[0] === "fn") return field[3];
        }
      }
      if (entity.handle) return entity.handle;
      if (entity.publicIds && entity.publicIds.length > 0) {
        return entity.publicIds[0].identifier || null;
      }
    }
  }
  return null;
}

function extractNameservers(nameservers) {
  if (!Array.isArray(nameservers)) return [];
  return nameservers.map((ns) => ns.ldhName || ns.unicodeName || null).filter(Boolean);
}

async function handleWhois(req, res) {
  const { domain } = req.body || {};
  if (!domain || typeof domain !== "string") {
    return res.status(400).json({ error: "Domain parameter required" });
  }

  let cleanDomain = domain.trim().toLowerCase();
  try {
    const parsed = new URL(cleanDomain.includes("://") ? cleanDomain : `https://${cleanDomain}`);
    cleanDomain = parsed.hostname;
  } catch {
    // keep as-is and let regex validate
  }

  if (!DOMAIN_REGEX.test(cleanDomain)) {
    return res.status(400).json({ error: "Invalid domain format" });
  }

  try {
    const tld = cleanDomain.split(".").pop();
    const rdapBase = RDAP_ENDPOINTS[tld] || RDAP_FALLBACK;
    const rdapUrl = `${rdapBase}${encodeURIComponent(cleanDomain)}`;

    let data = null;
    try {
      const rdapRes = await fetch(rdapUrl, {
        headers: { Accept: "application/rdap+json", "User-Agent": "VRIKAAN/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (rdapRes.ok) data = await rdapRes.json();
    } catch { /* primary failed */ }

    if (!data && RDAP_ENDPOINTS[tld]) {
      try {
        const fallbackRes = await fetch(`${RDAP_FALLBACK}${encodeURIComponent(cleanDomain)}`, {
          headers: { Accept: "application/rdap+json", "User-Agent": "VRIKAAN/1.0" },
          signal: AbortSignal.timeout(10000),
        });
        if (fallbackRes.ok) data = await fallbackRes.json();
      } catch { /* fallback also failed */ }
    }

    if (!data) {
      return res.status(404).json({ error: "WHOIS data not found for this domain" });
    }

    const events = extractEvents(data.events);
    const registrar = extractRegistrar(data.entities);
    const nameservers = extractNameservers(data.nameservers);
    const status = Array.isArray(data.status) ? data.status : [];

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({
      domain: data.ldhName || cleanDomain,
      registrar: registrar || "Unknown",
      creationDate: events.creationDate || null,
      expiryDate: events.expiryDate || null,
      updatedDate: events.updatedDate || null,
      status,
      nameservers,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return res.status(502).json({ error: "WHOIS lookup service temporarily unavailable" });
  }
}

// ─── SECURITY HEADERS ───────────────────────────────────────────────

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const SECURITY_HEADERS = [
  {
    name: "Strict-Transport-Security", key: "strict-transport-security", weight: 15,
    description: "Enforces HTTPS connections, preventing protocol downgrade attacks and cookie hijacking.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      if (/max-age=\d{8,}/.test(value) && /includeSubDomains/i.test(value)) return { status: "present", score: 15 };
      if (/max-age=\d+/.test(value)) {
        const maxAge = parseInt(value.match(/max-age=(\d+)/)[1], 10);
        if (maxAge < 31536000) return { status: "misconfigured", score: 8, note: "max-age should be at least 31536000 (1 year)" };
        return { status: "present", score: 12 };
      }
      return { status: "misconfigured", score: 5 };
    },
  },
  {
    name: "Content-Security-Policy", key: "content-security-policy", weight: 15,
    description: "Prevents XSS, clickjacking, and other code injection attacks by controlling resource loading.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      if (/unsafe-inline|unsafe-eval/.test(value)) return { status: "misconfigured", score: 7, note: "Contains unsafe-inline or unsafe-eval directives" };
      if (/default-src/.test(value)) return { status: "present", score: 15 };
      return { status: "present", score: 10 };
    },
  },
  {
    name: "X-Content-Type-Options", key: "x-content-type-options", weight: 10,
    description: "Prevents MIME-type sniffing, reducing exposure to drive-by download attacks.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      if (value.toLowerCase().trim() === "nosniff") return { status: "present", score: 10 };
      return { status: "misconfigured", score: 3, note: "Value should be 'nosniff'" };
    },
  },
  {
    name: "X-Frame-Options", key: "x-frame-options", weight: 10,
    description: "Prevents clickjacking by controlling whether the site can be embedded in frames.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      const v = value.toUpperCase().trim();
      if (v === "DENY" || v === "SAMEORIGIN") return { status: "present", score: 10 };
      if (v.startsWith("ALLOW-FROM")) return { status: "present", score: 8 };
      return { status: "misconfigured", score: 3, note: "Value should be DENY or SAMEORIGIN" };
    },
  },
  {
    name: "X-XSS-Protection", key: "x-xss-protection", weight: 5,
    description: "Legacy XSS filter for older browsers. Modern browsers use CSP instead.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      if (/1;\s*mode=block/i.test(value)) return { status: "present", score: 5 };
      if (value.trim() === "0") return { status: "present", score: 4, note: "Disabled — acceptable if CSP is set" };
      if (value.trim() === "1") return { status: "misconfigured", score: 2, note: "Should use '1; mode=block' or '0'" };
      return { status: "present", score: 3 };
    },
  },
  {
    name: "Referrer-Policy", key: "referrer-policy", weight: 10,
    description: "Controls how much referrer information is sent with requests, protecting user privacy.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      const good = ["no-referrer", "strict-origin", "strict-origin-when-cross-origin", "same-origin"];
      if (good.includes(value.toLowerCase().trim())) return { status: "present", score: 10 };
      if (value.toLowerCase().trim() === "unsafe-url") return { status: "misconfigured", score: 3, note: "unsafe-url leaks full URL to all origins" };
      return { status: "present", score: 7 };
    },
  },
  {
    name: "Permissions-Policy", key: "permissions-policy", weight: 10,
    description: "Controls which browser features and APIs can be used, reducing the attack surface.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      const restrictedFeatures = (value.match(/=\(\)/g) || []).length;
      if (restrictedFeatures >= 3) return { status: "present", score: 10 };
      return { status: "present", score: 7 };
    },
  },
  {
    name: "Cross-Origin-Opener-Policy", key: "cross-origin-opener-policy", weight: 8,
    description: "Isolates the browsing context, preventing cross-origin attacks like Spectre.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      if (value.toLowerCase().trim() === "same-origin") return { status: "present", score: 8 };
      if (value.toLowerCase().trim() === "same-origin-allow-popups") return { status: "present", score: 6 };
      return { status: "present", score: 4 };
    },
  },
  {
    name: "Cross-Origin-Resource-Policy", key: "cross-origin-resource-policy", weight: 8,
    description: "Prevents other origins from loading your resources, mitigating side-channel attacks.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      const v = value.toLowerCase().trim();
      if (v === "same-origin") return { status: "present", score: 8 };
      if (v === "same-site") return { status: "present", score: 6 };
      if (v === "cross-origin") return { status: "present", score: 3 };
      return { status: "present", score: 4 };
    },
  },
  {
    name: "Cross-Origin-Embedder-Policy", key: "cross-origin-embedder-policy", weight: 9,
    description: "Prevents loading cross-origin resources without explicit permission, enabling cross-origin isolation.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      if (value.toLowerCase().trim() === "require-corp") return { status: "present", score: 9 };
      if (value.toLowerCase().trim() === "credentialless") return { status: "present", score: 7 };
      return { status: "present", score: 4 };
    },
  },
];

const MAX_SCORE = SECURITY_HEADERS.reduce((sum, h) => sum + h.weight, 0);

function calculateGrade(score) {
  const pct = (score / MAX_SCORE) * 100;
  if (pct >= 90) return "A";
  if (pct >= 75) return "B";
  if (pct >= 60) return "C";
  if (pct >= 40) return "D";
  if (pct >= 20) return "E";
  return "F";
}

async function handleSecurityHeaders(req, res) {
  const { url } = req.body || {};
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL parameter required" });
  }

  let targetUrl = url.trim();
  if (!/^https?:\/\//i.test(targetUrl)) targetUrl = `https://${targetUrl}`;

  if (!URL_REGEX.test(targetUrl)) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    const fetchRes = await fetch(targetUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "VRIKAAN-SecurityHeadersChecker/1.0" },
    });

    let totalScore = 0;
    const headers = [];

    for (const header of SECURITY_HEADERS) {
      const value = fetchRes.headers.get(header.key);
      const result = header.validate(value);
      totalScore += result.score;
      headers.push({
        name: header.name,
        value: value || null,
        status: result.status,
        description: header.description,
        ...(result.note ? { note: result.note } : {}),
      });
    }

    const grade = calculateGrade(totalScore);
    const scorePercent = Math.round((totalScore / MAX_SCORE) * 100);

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    return res.status(200).json({
      url: targetUrl,
      grade,
      score: scorePercent,
      maxScore: 100,
      headers,
      summary: {
        present: headers.filter((h) => h.status === "present").length,
        missing: headers.filter((h) => h.status === "missing").length,
        misconfigured: headers.filter((h) => h.status === "misconfigured").length,
        total: headers.length,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err.name === "TimeoutError"
      ? "Request timed out — site may be unreachable"
      : "Could not reach the target URL";
    return res.status(502).json({ error: message });
  }
}

// ─── FILE HASH CHECK ────────────────────────────────────────────────

async function handleFileHashCheck(req, res) {
  const { hash } = req.body || {};
  if (!hash || typeof hash !== "string" || !/^[a-fA-F0-9]{32,128}$/.test(hash.trim())) {
    return res.status(400).json({ error: "Invalid hash format" });
  }

  try {
    const formData = new URLSearchParams();
    formData.append("query", "get_info");
    formData.append("hash", hash.trim());

    const mbResponse = await fetch("https://mb-api.abuse.ch/api/v1/", {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(10000),
    });
    const mbData = await mbResponse.json();

    if (mbData.query_status === "hash_not_found") {
      return res.status(200).json({ status: "clean", message: "No malware match found", hash: hash.trim(), detections: 0, engines: 0 });
    }

    if (mbData.query_status === "ok" && mbData.data && mbData.data.length > 0) {
      const sample = mbData.data[0];
      return res.status(200).json({
        status: "malicious",
        hash: hash.trim(),
        fileName: sample.file_name || "Unknown",
        fileType: sample.file_type || "Unknown",
        fileSize: sample.file_size || 0,
        signature: sample.signature || "Unknown",
        firstSeen: sample.first_seen || null,
        lastSeen: sample.last_seen || null,
        tags: sample.tags || [],
        detections: sample.intelligence?.uploads ? parseInt(sample.intelligence.uploads) : 1,
        engines: 1,
        reporter: sample.reporter || "Unknown",
      });
    }

    return res.status(200).json({ status: "unknown", message: "Could not determine file safety", hash: hash.trim(), detections: 0, engines: 0 });
  } catch (err) {
    console.error("Hash check error:", err.message);
    return res.status(500).json({ error: "Hash check service unavailable" });
  }
}

// ─── GEMINI AI EXPLAIN ──────────────────────────────────────────────

async function handleGeminiExplain(req, res) {
  const { toolName, input, result } = req.body || {};
  if (!toolName || !result) {
    return res.status(400).json({ error: "toolName and result are required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI explanation is not configured" });
  }

  const safeInput = String(input || "").slice(0, 500);
  const safeResult = JSON.stringify(result).slice(0, 3000);

  const prompt = `You are a cybersecurity expert writing for a non-technical user. Tool: ${toolName}. Input scanned: ${safeInput}. Scan result JSON: ${safeResult}.

Write a concise analysis in plain English (max 180 words) with:
1. A one-sentence verdict (safe / suspicious / dangerous).
2. 2-3 specific reasons backed by the scan data.
3. 2-3 concrete next steps the user should take.

Format as markdown with short bullet points. Do not repeat the raw JSON. Do not use jargon.`;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const gRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!gRes.ok) {
      const text = await gRes.text().catch(() => "");
      console.error("Gemini error:", gRes.status, text.slice(0, 300));
      // Surface Gemini's own message so the client can display it for debugging.
      // Gemini error bodies don't contain the API key, so this is safe to echo.
      let detail = "";
      try {
        const parsed = JSON.parse(text);
        detail = parsed?.error?.message || parsed?.error?.status || "";
      } catch {
        detail = text.slice(0, 200);
      }
      return res.status(502).json({
        error: `AI service unavailable (Gemini ${gRes.status}${detail ? `: ${detail}` : ""})`,
      });
    }

    const data = await gRes.json();
    const explanation = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("").trim();
    if (!explanation) {
      return res.status(502).json({ error: "AI returned empty response" });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ explanation, model: "gemini-2.5-flash" });
  } catch (err) {
    const message = err.name === "TimeoutError" ? "AI request timed out" : "AI service error";
    console.error("Gemini explain error:", err.message);
    return res.status(502).json({ error: message });
  }
}

// ─── BREACH CHECK (XposedOrNot, free, no key) ───────────────────────

async function handleBreachCheck(req, res) {
  const { email } = req.body || {};
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "email is required" });
  }
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const r = await fetch(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(clean)}`,
      { signal: AbortSignal.timeout(8000) }
    );

    // 404 from XposedOrNot = not found in any known breach = good news.
    if (r.status === 404) {
      res.setHeader("Cache-Control", "public, max-age=600");
      return res.status(200).json({
        email: clean,
        breached: false,
        count: 0,
        breaches: [],
      });
    }

    if (!r.ok) {
      console.error("XposedOrNot error:", r.status);
      return res.status(502).json({ error: "Breach database unavailable" });
    }

    const data = await r.json();
    // API returns { breaches: [["Canva","Linkedin",...]] } on hits.
    const flat =
      Array.isArray(data?.breaches) && Array.isArray(data.breaches[0])
        ? data.breaches[0]
        : [];

    res.setHeader("Cache-Control", "public, max-age=600");
    return res.status(200).json({
      email: clean,
      breached: flat.length > 0,
      count: flat.length,
      breaches: flat.slice(0, 20),
    });
  } catch (err) {
    const msg = err.name === "TimeoutError" ? "Breach check timed out" : "Breach check failed";
    console.error("breach-check error:", err.message);
    return res.status(502).json({ error: msg });
  }
}

// ─── PASSWORD CHECK (HIBP k-anonymity range) ───────────────────────

async function handlePasswordCheck(req, res) {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  const { hash } = req.body || {};
  if (!hash || typeof hash !== "string" || !/^[a-fA-F0-9]{5}$/.test(hash)) {
    return res.status(400).json({ error: "Invalid hash prefix. Send exactly 5 hex characters." });
  }
  try {
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${hash.toUpperCase()}`,
      { headers: { "User-Agent": "VRIKAAN/1.0" } }
    );
    if (!response.ok) throw new Error(`HIBP API returned ${response.status}`);
    const text = await response.text();
    return res.status(200).send(text);
  } catch {
    return res.status(502).json({ error: "Password check service temporarily unavailable" });
  }
}

// ─── IP LOOKUP ──────────────────────────────────────────────────────

async function handleIpLookup(req, res) {
  const fields = "status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,reverse,proxy,hosting";
  const q = req.query?.q || req.body?.q;
  const clientIP = q || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.headers["x-real-ip"] || "";
  const endpoint = clientIP
    ? `http://ip-api.com/json/${encodeURIComponent(clientIP)}?fields=${fields}`
    : `http://ip-api.com/json/?fields=${fields}`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(data);
  } catch {
    return res.status(502).json({ status: "fail", message: "IP lookup service unavailable" });
  }
}

// ─── WEEKLY DIGEST CRON ─────────────────────────────────────────────

const DIGEST_TIPS = [
  "Rotate any password you reused on a service that's been in the news for a breach in the last 30 days.",
  "Run a Dark Web check on your two most-used email addresses; treat hits as homework.",
  "Review your phone's installed apps — uninstall anything you haven't opened in 90 days.",
  "Confirm 2FA is on for email, banking, primary social account, and any account holding payment info.",
  "Audit browser extensions; remove anything with broad permissions you don't recognize.",
];
const DIGEST_TOOLS = [
  { name: "Phishing Trainer", desc: "5 min quiz, real-world examples" },
  { name: "Security Audit", desc: "Personal score with action items" },
  { name: "Vulnerability Scanner", desc: "Spot risky open ports and outdated services" },
];

function digestWeekIdx(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = (d - start) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000);
  return Math.floor(diff / 86400000 / 7);
}

function buildDigestMsg(name, weekIdx) {
  const tip = DIGEST_TIPS[weekIdx % DIGEST_TIPS.length];
  const tool = DIGEST_TOOLS[weekIdx % DIGEST_TOOLS.length];
  return `Hi ${name || "there"},

Your weekly security digest from VRIKAAN.

🎯 This week's action item:
${tip}

🛠 Tool highlight: ${tool.name}
${tool.desc}
Try it: https://vrikaan.com/dashboard

📊 Quick health checks (2 min each):
- Have any accounts been breached? https://vrikaan.com/dark-web-monitor
- Is your DNS leaking? https://vrikaan.com/dns-leak-test
- Has your security headers grade slipped? https://vrikaan.com/security-headers

Stay safe,
The VRIKAAN Team`;
}

// Delete activity-log + tool-history entries older than RETENTION_DAYS across
// all users. Uses Admin SDK (FIREBASE_SERVICE_ACCOUNT). Returns counts.
// Designed to be called from the weekly cron piggy-back so we don't burn a
// dedicated function slot.
async function runActivityCleanup({ retentionDays = 90, batchLimit = 500 } = {}) {
  let admin;
  try {
    admin = await import("./_firebaseAdmin.js");
  } catch (e) {
    return { error: "admin import failed: " + e.message };
  }
  const fs = admin.getAdminFirestore();
  if (!fs) return { error: "FIREBASE_SERVICE_ACCOUNT not set" };

  const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const cutoffTs = admin.getAdminFirestore && fs ? new Date(cutoffMs) : null;

  let activityDeleted = 0, historyDeleted = 0, usersScanned = 0;
  try {
    const usersSnap = await fs.collection("users").select().limit(2000).get();
    for (const userDoc of usersSnap.docs) {
      usersScanned++;
      // activity
      const aSnap = await fs.collection("users").doc(userDoc.id).collection("activity")
        .where("timestamp", "<", cutoffTs).limit(batchLimit).get();
      if (!aSnap.empty) {
        const batch = fs.batch();
        aSnap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        activityDeleted += aSnap.size;
      }
      // toolHistory
      const tSnap = await fs.collection("users").doc(userDoc.id).collection("toolHistory")
        .where("timestamp", "<", cutoffTs).limit(batchLimit).get();
      if (!tSnap.empty) {
        const batch = fs.batch();
        tSnap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        historyDeleted += tSnap.size;
      }
    }
    return { usersScanned, activityDeleted, historyDeleted, retentionDays };
  } catch (e) {
    return { error: e.message, usersScanned, activityDeleted, historyDeleted };
  }
}

async function handleWeeklyDigest(req, res) {
  // Cron auth
  const expected = process.env.CRON_SECRET;
  const got = (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");
  if (!expected || got !== expected) return res.status(401).json({ error: "Unauthorized" });

  // Always run activity-log cleanup (cheap; piggy-backs on the weekly slot)
  const cleanup = await runActivityCleanup();
  console.log("weekly-digest: cleanup result:", JSON.stringify(cleanup));

  const isMonday = new Date().getUTCDay() === 1;
  const force = String(req.query?.force || "") === "1";
  if (!isMonday && !force) return res.status(200).json({ skipped: true, reason: "not Monday UTC", cleanup });

  // Read opt-in list from public-readable digest_subscribers collection.
  // Users add themselves from the authenticated client; cron uses public REST.
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!projectId || !apiKey) return res.status(500).json({ error: "Firebase env vars missing" });

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/digest_subscribers?pageSize=500&key=${apiKey}`;
    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text();
      console.error("Firestore read failed:", r.status, text.slice(0, 200));
      return res.status(500).json({ error: `Firestore ${r.status}` });
    }
    const data = await r.json();
    const users = (data.documents || [])
      .map((d) => {
        const f = d.fields || {};
        return {
          email: f.email?.stringValue || "",
          name: f.name?.stringValue || "",
        };
      })
      .filter((u) => u.email);

    // Sanity-check EmailJS env vars early so the failure mode is visible.
    const sid = process.env.VITE_EMAILJS_SERVICE_ID;
    const tpl = process.env.VITE_EMAILJS_NOTIFY_TEMPLATE;
    const pub = process.env.VITE_EMAILJS_PUBLIC_KEY;
    const priv = process.env.EMAILJS_PRIVATE_KEY; // server-side only, optional
    if (!sid || !tpl || !pub) {
      const missing = [
        !sid && "VITE_EMAILJS_SERVICE_ID",
        !tpl && "VITE_EMAILJS_NOTIFY_TEMPLATE",
        !pub && "VITE_EMAILJS_PUBLIC_KEY",
      ].filter(Boolean).join(", ");
      console.error("weekly-digest: missing EmailJS env vars:", missing);
      return res.status(500).json({ error: `Missing env: ${missing}` });
    }

    const weekIdx = digestWeekIdx(new Date());
    const subject = `Your VRIKAAN weekly digest — wk ${weekIdx}`;
    const lastErrors = [];
    let ok = 0, fail = 0;
    for (const u of users) {
      try {
        const payload = {
          service_id: sid,
          template_id: tpl,
          user_id: pub,
          ...(priv ? { accessToken: priv } : {}),
          template_params: {
            to_name: u.name || "User",
            to_email: u.email,
            from_name: "VRIKAAN",
            subject,
            message: buildDigestMsg(u.name, weekIdx),
          },
        };
        const er = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", origin: "https://www.vrikaan.com" },
          body: JSON.stringify(payload),
        });
        if (er.ok) {
          ok++;
        } else {
          const body = await er.text();
          console.warn(`EmailJS ${er.status} for ${u.email}:`, body.slice(0, 300));
          if (lastErrors.length < 3) lastErrors.push({ status: er.status, body: body.slice(0, 200) });
          fail++;
        }
      } catch (e) {
        console.warn(`EmailJS exception for ${u.email}:`, e.message);
        if (lastErrors.length < 3) lastErrors.push({ exception: e.message });
        fail++;
      }
      await new Promise((r) => setTimeout(r, 350));
    }
    console.log(`weekly-digest: ok=${ok} fail=${fail} total=${users.length}`);
    return res.status(200).json({ sent: ok, failed: fail, total: users.length, errors: lastErrors, cleanup });
  } catch (err) {
    console.error("weekly-digest error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

// ─── LEAK CHECK ─────────────────────────────────────────────────────

async function handleLeakCheck(req, res) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    "";
  const out = { ip: {}, trace: "" };
  try {
    // ipinfo.io — free tier (50k/month) returns ip/city/region/country/org without a token
    const url = ip ? `https://ipinfo.io/${ip}/json` : "https://ipinfo.io/json";
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } });
    const j = await r.json();
    out.ip = {
      ip: j.ip,
      city: j.city,
      region: j.region,
      country: j.country,
      country_name: j.country, // ipinfo returns country code only; client uses either field
      org: j.org || "",
    };
  } catch (e) {
    out.ip = { error: e.message };
  }
  try {
    // Cloudflare trace from server gives the egress IP/colo that the Vercel
    // function exits through — useful as a sanity check but NOT the user's resolver.
    const r = await fetch("https://1.1.1.1/cdn-cgi/trace", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    out.trace = await r.text();
  } catch (e) {
    out.trace = "";
    out.traceError = e.message;
  }
  return res.status(200).json(out);
}

// ─── OUTBOUND WEBHOOKS ──────────────────────────────────────────────

import crypto from "node:crypto";

// Persist a webhook URL + auto-generated HMAC secret on the user doc.
async function handleWebhookSet(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { url } = req.body || {};
  if (!url || !/^https:\/\//.test(url)) return res.status(400).json({ error: "url must start with https://" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });
  const secret = "whk_" + crypto.randomBytes(24).toString("hex");
  await fs.collection("users").doc(me.uid).set({
    webhook: { url, secret, createdAt: new Date(), enabled: true },
  }, { merge: true });
  return res.status(200).json({ success: true, secret });
}

async function handleWebhookClear(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });
  await fs.collection("users").doc(me.uid).update({
    webhook: { url: null, secret: null, enabled: false, removedAt: new Date() },
  });
  return res.status(200).json({ success: true });
}

// Fire a webhook event to the user's registered URL. Used by the test button
// and by other handlers that want to notify on events. Returns the receiver's
// status code so we can surface delivery failures.
async function fireWebhook({ uid, event, data }) {
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return { ok: false, error: "no admin" };
  const snap = await fs.collection("users").doc(uid).get();
  const wh = snap.data()?.webhook;
  if (!wh?.url || !wh?.enabled) return { ok: false, error: "no webhook" };
  const body = JSON.stringify({ event, ts: new Date().toISOString(), data });
  const sig = crypto.createHmac("sha256", wh.secret).update(body).digest("hex");
  try {
    const r = await fetch(wh.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Vrikaan-Webhook/1.0",
        "X-Vrikaan-Event": event,
        "X-Vrikaan-Signature": "sha256=" + sig,
      },
      body,
      // Limit how long a slow receiver can stall the function
      signal: AbortSignal.timeout(8000),
    });
    return { ok: r.ok, status: r.status };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function handleWebhookTest(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const result = await fireWebhook({
    uid: me.uid,
    event: "test.ping",
    data: { message: "Hello from VRIKAAN — your webhook is wired up.", at: new Date().toISOString() },
  });
  return res.status(200).json(result);
}

// ─── 2FA / TOTP ─────────────────────────────────────────────────────

// Verify a Bearer Firebase ID token and return { uid, email } or null.
async function verifyIdTokenFromHeader(req) {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!idToken) return null;
  try {
    const adminMod = await import("./_firebaseAdmin.js");
    const auth = adminMod.getAdminAuth();
    if (!auth) return null;
    const decoded = await auth.verifyIdToken(idToken);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}

// Generate a new TOTP secret + otpauth:// URL + QR data URI for enrollment.
// Does NOT yet enroll the user — the client must call totp-confirm with a valid
// 6-digit code before the secret is persisted (proves the user typed it correctly).
async function handleTotpSetup(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const otpauth = await import("otpauth");
  const QR = (await import("qrcode")).default;
  const secret = new otpauth.Secret({ size: 20 }); // 160-bit
  const totp = new otpauth.TOTP({
    issuer: "VRIKAAN",
    label: me.email || me.uid,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });
  const url = totp.toString();
  const qrDataUri = await QR.toDataURL(url, { margin: 1, width: 220 });
  // Return secret base32 so client can pass it back in the confirm step.
  // (Server is stateless — we don't keep it until confirmed.)
  return res.status(200).json({ secret: secret.base32, otpauthUrl: url, qrDataUri });
}

// Verify a 6-digit code against the supplied secret. On success, persists the
// secret + a set of one-time backup codes to /users/{uid}.mfa.
async function handleTotpConfirm(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { secret, code } = req.body || {};
  if (!secret || !code) return res.status(400).json({ error: "secret and code required" });
  const otpauth = await import("otpauth");
  try {
    const totp = new otpauth.TOTP({ issuer: "VRIKAAN", secret: otpauth.Secret.fromBase32(secret), digits: 6, period: 30 });
    // window: 1 = accept previous and next 30s as well (clock skew tolerance)
    const delta = totp.validate({ token: String(code).trim(), window: 1 });
    if (delta === null) return res.status(400).json({ error: "Invalid code" });

    // Generate 10 backup codes (8 chars each, base32-ish)
    const ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const backupCodes = Array.from({ length: 10 }, () =>
      Array.from({ length: 8 }, () => ALPH[Math.floor(Math.random() * ALPH.length)]).join("")
    );

    const adminMod = await import("./_firebaseAdmin.js");
    const fs = adminMod.getAdminFirestore();
    if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });
    await fs.collection("users").doc(me.uid).set({
      mfa: {
        enabled: true,
        secret, // base32; server-side only, never sent to client after this
        backupCodes,
        enrolledAt: new Date(),
      },
    }, { merge: true });
    return res.status(200).json({ success: true, backupCodes });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// Verify a TOTP / backup code on login (called AFTER password sign-in).
// Returns { ok: true } if valid; consumes a backup code on use.
async function handleTotpVerify(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: "code required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });
  const snap = await fs.collection("users").doc(me.uid).get();
  const mfa = snap.data()?.mfa;
  if (!mfa?.enabled || !mfa.secret) return res.status(400).json({ error: "MFA not enrolled" });

  const trimmed = String(code).trim().toUpperCase();
  // Backup code path
  if (mfa.backupCodes && mfa.backupCodes.includes(trimmed)) {
    const remaining = mfa.backupCodes.filter((c) => c !== trimmed);
    await fs.collection("users").doc(me.uid).update({ "mfa.backupCodes": remaining });
    return res.status(200).json({ ok: true, used: "backup", remaining: remaining.length });
  }

  const otpauth = await import("otpauth");
  const totp = new otpauth.TOTP({ issuer: "VRIKAAN", secret: otpauth.Secret.fromBase32(mfa.secret), digits: 6, period: 30 });
  const delta = totp.validate({ token: trimmed, window: 1 });
  if (delta === null) return res.status(400).json({ error: "Invalid code" });
  return res.status(200).json({ ok: true, used: "totp" });
}

// Disable MFA. Requires fresh sign-in (verified by ID token age check).
async function handleTotpDisable(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });
  await fs.collection("users").doc(me.uid).update({
    mfa: { enabled: false, secret: null, backupCodes: [], disabledAt: new Date() },
  });
  return res.status(200).json({ success: true });
}

// ─── REFUND ─────────────────────────────────────────────────────────

// Self-serve refund. Requires Authorization: Bearer <id-token> from a
// signed-in user. Verifies the user owns the payment doc before calling
// Cashfree's refund API. Records the refund attempt back to Firestore.
async function handleRefund(req, res) {
  const { orderId, reason } = req.body || {};
  if (!orderId || typeof orderId !== "string") {
    return res.status(400).json({ error: "orderId required" });
  }

  // Verify caller via Firebase ID token
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!idToken) return res.status(401).json({ error: "Sign-in required" });

  let uid;
  try {
    const adminMod = await import("./_firebaseAdmin.js");
    const { getAdminAuth, getAdminFirestore } = adminMod;
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    uid = decoded.uid;
    const fs = getAdminFirestore();

    // Confirm this user owns the payment + it's eligible for refund
    const payDoc = await fs.collection("users").doc(uid)
      .collection("payments").where("orderId", "==", orderId).limit(1).get();
    if (payDoc.empty) return res.status(404).json({ error: "Payment not found" });
    const pay = payDoc.docs[0].data();
    const ageMs = Date.now() - (pay.date?.toMillis ? pay.date.toMillis() : 0);
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (ageMs > SEVEN_DAYS) return res.status(400).json({ error: "Refund window (7 days) elapsed" });
    if (pay.refunded) return res.status(400).json({ error: "Already refunded" });

    // Call Cashfree refund API
    const base = process.env.CASHFREE_ENV === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";
    const refundResp = await fetch(`${base}/${orderId}/refunds`, {
      method: "POST",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refund_amount: pay.amount,
        refund_id: `rf_${orderId}_${Date.now()}`,
        refund_note: (reason || "User-requested refund").slice(0, 200),
      }),
    });
    const refundData = await refundResp.json();
    if (!refundResp.ok) {
      return res.status(refundResp.status).json({ error: refundData.message || "Refund failed", details: refundData });
    }

    // Mark Firestore payment as refunded + downgrade plan
    await payDoc.docs[0].ref.update({
      refunded: true,
      refundedAt: new Date(),
      refundId: refundData.refund_id,
      refundReason: reason || "",
    });
    await fs.collection("users").doc(uid).update({ plan: "free" });

    // Best-effort outbound webhook (don't fail the refund if delivery fails)
    fireWebhook({
      uid,
      event: "payment.refunded",
      data: { orderId, amount: pay.amount, refundId: refundData.refund_id, reason: reason || "" },
    }).catch(() => {});

    return res.status(200).json({ success: true, refundId: refundData.refund_id, status: refundData.refund_status });
  } catch (e) {
    if (e.code === "auth/id-token-expired" || e.code === "auth/argument-error") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    console.error("refund error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}

// ─── ROUTER ─────────────────────────────────────────────────────────

const HANDLERS = {
  whois: handleWhois,
  "security-headers": handleSecurityHeaders,
  "file-hash-check": handleFileHashCheck,
  "ai-explain": handleGeminiExplain,
  "breach-check": handleBreachCheck,
  "password-check": handlePasswordCheck,
  ip: handleIpLookup,
  "weekly-digest": handleWeeklyDigest,
  "leak-check": handleLeakCheck,
  refund: handleRefund,
  "totp-setup": handleTotpSetup,
  "totp-confirm": handleTotpConfirm,
  "totp-verify": handleTotpVerify,
  "totp-disable": handleTotpDisable,
  "webhook-set": handleWebhookSet,
  "webhook-clear": handleWebhookClear,
  "webhook-test": handleWebhookTest,
};

// Some tools accept GET (ip lookup, cron pings); others require POST.
const GET_ALLOWED = new Set(["ip", "weekly-digest", "leak-check"]);
// Tools that bypass shared rate-limit (cron uses its own auth)
const RL_EXEMPT = new Set(["weekly-digest"]);

/**
 * Validate an incoming Bearer token against /api_tokens/{token} in
 * Firestore using the public REST API. Returns { valid, uid, plan }.
 */
async function validateApiToken(authHeader) {
  if (!authHeader) return { valid: false };
  const m = /^Bearer\s+(vrk_[a-f0-9]{48})\s*$/i.exec(authHeader);
  if (!m) return { valid: false };
  const token = m[1];
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!projectId || !apiKey) return { valid: false };
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/api_tokens/${encodeURIComponent(token)}?key=${apiKey}`;
    const r = await fetch(url);
    if (!r.ok) return { valid: false };
    const doc = await r.json();
    const f = doc.fields || {};
    if (f.active?.booleanValue !== true) return { valid: false };
    return { valid: true, uid: f.uid?.stringValue, plan: f.plan?.stringValue || "starter" };
  } catch {
    return { valid: false };
  }
}

export default async function handler(req, res) {
  const tool = req.query.tool;
  if (!tool || !HANDLERS[tool]) {
    return res.status(400).json({ error: `Unknown tool: ${tool || "(missing)"}. Valid: ${Object.keys(HANDLERS).join(", ")}` });
  }

  const allowGet = GET_ALLOWED.has(tool);
  if (req.method !== "POST" && !(allowGet && req.method === "GET")) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // API token auth — Pro+ users get higher rate limits and can call
  // from external clients without the browser-origin check.
  const tokenAuth = await validateApiToken(req.headers["authorization"]);
  req.apiClient = tokenAuth; // { valid, uid, plan }

  if (!RL_EXEMPT.has(tool)) {
    const rateLimits = tokenAuth.valid
      ? { ipLimit: 200, userLimit: 600, windowMs: 60000 }   // Pro+
      : { ipLimit: 20, userLimit: 60, windowMs: 60000 };    // Anonymous / free
    const rl = applyRateLimit(req, rateLimits);
    if (!rl.allowed) {
      res.setHeader("Retry-After", rl.retryAfter);
      return res.status(429).json({ error: "Too many requests", retryAfter: rl.retryAfter });
    }
  }

  return HANDLERS[tool](req, res);
}
