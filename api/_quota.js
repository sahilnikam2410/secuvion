/**
 * Durable, server-authoritative usage quotas.
 * --------------------------------------------------------------
 * Two counters live here, both previously bypassable:
 *
 *   1. Pro-tool free quota (3 uses/tool/day for free callers). Used to
 *      be a module-level Map, so it reset on every cold start and each
 *      concurrent Vercel instance had its own.
 *   2. Plan daily limits (scan / lookup / ai / export). Used to be
 *      counted and enforced entirely in the browser against a
 *      client-writable usage/{uid}_{date} document — a user could
 *      simply reset their own counter.
 *
 * Both are now Firestore transactions through the Admin SDK, and
 * firestore.rules makes both collections read-only to clients.
 *
 * Fallback: when the Admin SDK is unconfigured the in-memory counter
 * still applies, so a misconfigured deploy degrades to the old
 * behaviour rather than to no limit at all.
 *
 * Underscore-prefixed so Vercel does not expose it as a function.
 */
import crypto from "crypto";
import { getAdminFirestore } from "./_firebaseAdmin.js";

export const PRO_FREE_QUOTA_PER_DAY = 3;

/**
 * Daily limits per plan tier. Mirror of src/services/usageLimiter.js —
 * that copy now only renders "3 of 5 left"; this one decides.
 */
export const PLAN_LIMITS = {
  free:       { scan: 5,   lookup: 10,  ai: 3,  export: 2  },
  starter:    { scan: 25,  lookup: 50,  ai: 20, export: 10 },
  standard:   { scan: 25,  lookup: 50,  ai: 20, export: 10 },
  pro:        { scan: 100, lookup: 200, ai: 50, export: 50 },
  advanced:   { scan: 100, lookup: 200, ai: 50, export: 50 },
  family:     { scan: 100, lookup: 200, ai: 50, export: 50 },
  enterprise: { scan: -1,  lookup: -1,  ai: -1, export: -1 }, // unlimited
};

export const TOOL_CATEGORY = {
  "breach":              "scan",
  "security-headers":    "scan",
  "ssl":                 "scan",
  "security-audit":      "scan",
  "vulnerability":       "scan",
  "file-hash":           "scan",
  "dark-web":            "scan",
  "whois":               "lookup",
  "ip-lookup":           "lookup",
  "dns-leak":            "lookup",
  "email-analyzer":      "lookup",
  "phishing-trainer":    "lookup",
  "browser-fingerprint": "lookup",
  "qr-scanner":          "lookup",
  "password-checker":    "lookup",
  "fraud-analyzer":      "ai",
  "ai-chat":             "ai",
  "export-pdf":          "export",
};

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Firestore document ids cannot contain "/" and must not be "." or "..".
 * Scopes are uids or raw IPs (including IPv6), so hash them.
 */
function scopeId(scope) {
  return crypto.createHash("sha256").update(String(scope)).digest("hex").slice(0, 32);
}

/** Documents older than this are dead weight; the weekly cleanup prunes them. */
export const QUOTA_TTL_DAYS = 3;

// ─── In-memory fallback (Admin SDK unavailable) ─────────────────────

const _memCounter = new Map();
function _memConsume(key, limit) {
  const used = _memCounter.get(key) || 0;
  if (used >= limit) return { allowed: false, used, limit, remaining: 0 };
  _memCounter.set(key, used + 1);
  return { allowed: true, used: used + 1, limit, remaining: limit - used - 1 };
}

// ─── Pro-tool free quota ────────────────────────────────────────────

/**
 * Atomically consume one free-quota slot for a Pro-tier tool.
 * Call this ONCE per request, at the point the request is allowed —
 * checking and incrementing separately is what let concurrent calls
 * slip past the old counter.
 *
 * @returns {{ allowed: boolean, used: number, limit: number, remaining: number }}
 */
export async function consumeFreeQuota(scope, tool) {
  const limit = PRO_FREE_QUOTA_PER_DAY;
  const day = today();
  const key = `${scope}|${tool}|${day}`;
  const fs = getAdminFirestore();
  if (!fs) return _memConsume(key, limit);

  const ref = fs.collection("quota").doc(`${scopeId(scope)}_${tool}_${day}`);
  try {
    return await fs.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const used = snap.exists ? (snap.data().count || 0) : 0;
      if (used >= limit) {
        return { allowed: false, used, limit, remaining: 0 };
      }
      tx.set(ref, { count: used + 1, tool, day, updatedAt: new Date() }, { merge: true });
      return { allowed: true, used: used + 1, limit, remaining: limit - used - 1 };
    });
  } catch {
    // Firestore unreachable — fail closed on the shared counter would
    // lock out every free user, so fall back to the local one.
    return _memConsume(key, limit);
  }
}

// ─── Plan daily limits ──────────────────────────────────────────────

/**
 * Atomically consume one unit of a user's daily category allowance.
 * Mirrors the shape the browser hook already expects.
 *
 * @returns {{ allowed: boolean, remaining: number, limit: number, category: string }}
 */
export async function consumeUsage(uid, plan, toolId) {
  const category = TOOL_CATEGORY[toolId] || "lookup";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const limit = limits[category];

  if (limit === -1) return { allowed: true, remaining: -1, limit: -1, category };
  if (!uid) return { allowed: false, remaining: 0, limit, category, reason: "unauthenticated" };

  const fs = getAdminFirestore();
  const day = today();
  if (!fs) {
    const r = _memConsume(`${uid}|${category}|${day}`, limit);
    return { allowed: r.allowed, remaining: r.remaining, limit, category };
  }

  const ref = fs.collection("usage").doc(`${uid}_${day}`);
  try {
    return await fs.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : {};
      const used = data[category] || 0;
      if (used >= limit) {
        return { allowed: false, remaining: 0, limit, category };
      }
      tx.set(ref, {
        [category]: used + 1,
        uid,
        date: day,
        updatedAt: new Date(),
      }, { merge: true });
      return { allowed: true, remaining: limit - used - 1, limit, category };
    });
  } catch {
    // Don't block paying users on a Firestore blip.
    return { allowed: true, remaining: limit, limit, category, degraded: true };
  }
}

/** Read today's counters without consuming anything. */
export async function readUsage(uid, plan) {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const empty = {
    scan:   { used: 0, limit: limits.scan },
    lookup: { used: 0, limit: limits.lookup },
    ai:     { used: 0, limit: limits.ai },
    export: { used: 0, limit: limits.export },
  };
  const fs = getAdminFirestore();
  if (!fs || !uid) return empty;
  try {
    const snap = await fs.collection("usage").doc(`${uid}_${today()}`).get();
    if (!snap.exists) return empty;
    const d = snap.data() || {};
    return {
      scan:   { used: d.scan || 0,   limit: limits.scan },
      lookup: { used: d.lookup || 0, limit: limits.lookup },
      ai:     { used: d.ai || 0,     limit: limits.ai },
      export: { used: d.export || 0, limit: limits.export },
    };
  } catch {
    return empty;
  }
}
