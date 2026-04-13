import { db } from "../firebase/config";
import { doc, getDoc, setDoc, increment, serverTimestamp } from "firebase/firestore";

/**
 * Daily usage limits per plan tier.
 * Keys are tool categories, values are max daily uses.
 */
const PLAN_LIMITS = {
  free:       { scan: 5,  lookup: 10, ai: 3,  export: 2  },
  starter:    { scan: 25, lookup: 50, ai: 20, export: 10 },
  standard:   { scan: 25, lookup: 50, ai: 20, export: 10 },
  pro:        { scan: 100, lookup: 200, ai: 50, export: 50 },
  advanced:   { scan: 100, lookup: 200, ai: 50, export: 50 },
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
 * Check if the user can use a tool, and increment usage if allowed.
 * @param {string} uid - User's Firebase UID
 * @param {string} plan - User's current plan
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

  const todayKey = getTodayKey();
  const usageRef = doc(db, "usage", `${uid}_${todayKey}`);

  try {
    const snap = await getDoc(usageRef);
    const data = snap.exists() ? snap.data() : {};
    const currentCount = data[category] || 0;

    if (currentCount >= dailyLimit) {
      return { allowed: false, remaining: 0, limit: dailyLimit, category };
    }

    // Increment usage
    await setDoc(usageRef, {
      [category]: increment(1),
      uid,
      date: todayKey,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return { allowed: true, remaining: dailyLimit - currentCount - 1, limit: dailyLimit, category };
  } catch (err) {
    console.warn("Usage tracking error:", err);
    // Allow on error to not block users
    return { allowed: true, remaining: dailyLimit, limit: dailyLimit, category };
  }
}

/**
 * Get current usage stats for a user today.
 * @param {string} uid
 * @param {string} plan
 * @returns {object} { scan: { used, limit }, lookup: { used, limit }, ai: { used, limit }, export: { used, limit } }
 */
export async function getUsageStats(uid, plan) {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const todayKey = getTodayKey();
  const usageRef = doc(db, "usage", `${uid}_${todayKey}`);

  try {
    const snap = await getDoc(usageRef);
    const data = snap.exists() ? snap.data() : {};
    return {
      scan:   { used: data.scan || 0, limit: limits.scan },
      lookup: { used: data.lookup || 0, limit: limits.lookup },
      ai:     { used: data.ai || 0, limit: limits.ai },
      export: { used: data.export || 0, limit: limits.export },
    };
  } catch {
    return {
      scan:   { used: 0, limit: limits.scan },
      lookup: { used: 0, limit: limits.lookup },
      ai:     { used: 0, limit: limits.ai },
      export: { used: 0, limit: limits.export },
    };
  }
}

export { PLAN_LIMITS, TOOL_CATEGORY };
