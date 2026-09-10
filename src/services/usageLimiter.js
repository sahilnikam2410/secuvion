import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { apiFetch } from "../lib/apiFetch";

/**
 * Daily usage limits per plan tier.
 *
 * These values are for DISPLAY ONLY — "3 of 5 left today". The decision
 * of whether a run is allowed is made server-side in api/_quota.js and
 * usage/{uid}_{date} is now write-protected in firestore.rules.
 *
 * Keep this table in sync with PLAN_LIMITS in api/_quota.js; drift shows
 * up as a wrong remaining-count in the UI, never as a wrong verdict.
 */
const PLAN_LIMITS = {
  free:       { scan: 5,   lookup: 10,  ai: 3,  export: 2  },
  starter:    { scan: 25,  lookup: 50,  ai: 20, export: 10 },
  standard:   { scan: 25,  lookup: 50,  ai: 20, export: 10 },
  pro:        { scan: 100, lookup: 200, ai: 50, export: 50 },
  advanced:   { scan: 100, lookup: 200, ai: 50, export: 50 },
  family:     { scan: 100, lookup: 200, ai: 50, export: 50 },
  enterprise: { scan: -1, lookup: -1, ai: -1, export: -1 }, // unlimited
};

/**
 * Map tool names to usage categories.
 */
const TOOL_CATEGORY = {
  "breach":            "scan",
  "security-headers":  "scan",
  "ssl":               "scan",
  "security-audit":    "scan",
  "vulnerability":     "scan",
  "file-hash":         "scan",
  "whois":             "lookup",
  "ip-lookup":         "lookup",
  "dns-leak":          "lookup",
  "email-analyzer":    "lookup",
  "dark-web":          "scan",
  "fraud-analyzer":    "ai",
  "ai-chat":           "ai",
  "phishing-trainer":  "lookup",
  "browser-fingerprint": "lookup",
  "qr-scanner":        "lookup",
  "password-checker":  "lookup",
  "export-pdf":        "export",
};

function getTodayKey() {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Ask the server to spend one unit of the user's daily allowance.
 *
 * The check and the increment happen together inside a Firestore
 * transaction on the server. This function previously did both in the
 * browser against a user-writable document, so resetting the counter —
 * or just not calling this at all — removed the limit entirely.
 *
 * @param {string} uid - User's Firebase UID
 * @param {string} plan - User's current plan (display fallback only)
 * @param {string} toolId - The tool being used (key from TOOL_CATEGORY)
 * @returns {{ allowed: boolean, remaining: number, limit: number, category: string }}
 */
export async function checkAndTrackUsage(uid, plan, toolId) {
  const category = TOOL_CATEGORY[toolId] || "lookup";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const dailyLimit = limits[category];

  // Unlimited
  if (dailyLimit === -1) {
    return { allowed: true, remaining: -1, limit: -1, category };
  }

  try {
    const res = await apiFetch("/api/tools?tool=usage-consume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId }),
    });
    const out = await res.json().catch(() => ({}));
    if (res.status === 402) {
      return { allowed: false, remaining: 0, limit: out.limit ?? dailyLimit, category: out.category || category };
    }
    if (!res.ok) throw new Error(out.error || "usage-consume failed");
    return {
      allowed: out.allowed !== false,
      remaining: out.remaining ?? dailyLimit,
      limit: out.limit ?? dailyLimit,
      category: out.category || category,
    };
  } catch (err) {
    console.warn("Usage tracking error:", err);
    // Allow on transport error so a network blip doesn't block a paying
    // user. The tool's own /api/tools call still enforces the tier gate.
    return { allowed: true, remaining: dailyLimit, limit: dailyLimit, category };
  }
}

/**
 * Get current usage stats for a user today. Read-only: the document is
 * written by the server, and clients have read access to their own.
 * @param {string} uid
 * @param {string} plan
 * @returns {object} { scan: { used, limit }, lookup: { used, limit }, ai: { used, limit }, export: { used, limit } }
 */
export async function getUsageStats(uid, plan) {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const empty = {
    scan:   { used: 0, limit: limits.scan },
    lookup: { used: 0, limit: limits.lookup },
    ai:     { used: 0, limit: limits.ai },
    export: { used: 0, limit: limits.export },
  };
  if (!uid) return empty;

  try {
    const snap = await getDoc(doc(db, "usage", `${uid}_${getTodayKey()}`));
    const data = snap.exists() ? snap.data() : {};
    return {
      scan:   { used: data.scan || 0, limit: limits.scan },
      lookup: { used: data.lookup || 0, limit: limits.lookup },
      ai:     { used: data.ai || 0, limit: limits.ai },
      export: { used: data.export || 0, limit: limits.export },
    };
  } catch {
    return empty;
  }
}

export { PLAN_LIMITS, TOOL_CATEGORY };
