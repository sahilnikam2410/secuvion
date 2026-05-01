/**
 * Gamification — badges + streak counter.
 * Pure client-side, persists to localStorage. Hooks into the same
 * tool-usage event stream that already powers tool history.
 *
 * Badges unlock once and stay forever. Streak counts consecutive
 * days the user opened any tool. Resets if a day is skipped.
 */

const STREAK_KEY = "vrikaan_streak_v1";
const BADGES_KEY = "vrikaan_badges_v1";
const TOOL_COUNTS_KEY = "vrikaan_tool_counts_v1";

export const BADGES = [
  // First steps
  { id: "first_scan", icon: "🔍", title: "First Scan", desc: "Run your first security tool", req: { totalScans: 1 } },
  { id: "five_tools", icon: "🛠", title: "Toolbelt", desc: "Use 5 different tools", req: { uniqueTools: 5 } },
  { id: "ten_tools", icon: "🧰", title: "Power User", desc: "Use 10 different tools", req: { uniqueTools: 10 } },

  // Volume
  { id: "ten_scans", icon: "🎯", title: "Detective", desc: "Run 10 scans", req: { totalScans: 10 } },
  { id: "fifty_scans", icon: "🕵", title: "Sleuth", desc: "Run 50 scans", req: { totalScans: 50 } },
  { id: "hundred_scans", icon: "🏆", title: "Sentinel", desc: "Run 100 scans", req: { totalScans: 100 } },

  // Streaks
  { id: "streak_3", icon: "🔥", title: "On Fire", desc: "3-day streak", req: { streak: 3 } },
  { id: "streak_7", icon: "⚡", title: "Week Warrior", desc: "7-day streak", req: { streak: 7 } },
  { id: "streak_30", icon: "💎", title: "Diamond", desc: "30-day streak", req: { streak: 30 } },

  // Specific tools
  { id: "phish_master", icon: "🎣", title: "Phish Master", desc: "Use Phishing Trainer 5 times", req: { tool: "phishing-trainer", count: 5 } },
  { id: "vault_keeper", icon: "🔐", title: "Vault Keeper", desc: "Use Password Vault 3 times", req: { tool: "password-vault", count: 3 } },
  { id: "dark_walker", icon: "🌑", title: "Dark Walker", desc: "Run Dark Web Monitor 3 times", req: { tool: "dark-web-monitor", count: 3 } },

  // Profile
  { id: "verified", icon: "✓", title: "Verified", desc: "Verify your email address", req: { emailVerified: true } },
  { id: "complete_profile", icon: "👤", title: "Identity", desc: "Complete your profile", req: { profileComplete: true } },
  { id: "subscriber", icon: "⭐", title: "Pro Member", desc: "Subscribe to a paid plan", req: { paidPlan: true } },
];

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; } catch { return fallback; }
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full */ }
}

export function getStreak() {
  return readJSON(STREAK_KEY, { current: 0, longest: 0, lastDay: null });
}

export function getBadges() {
  return readJSON(BADGES_KEY, []);
}

export function getToolCounts() {
  return readJSON(TOOL_COUNTS_KEY, {});
}

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

function yesterdayKey() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Mark today as active. Increments streak if yesterday was active,
 * resets to 1 if a day was skipped, no-op if already counted today.
 */
export function pingActivity() {
  const s = getStreak();
  const today = todayKey();
  if (s.lastDay === today) return s; // already counted

  const isContinuation = s.lastDay === yesterdayKey();
  const next = isContinuation ? s.current + 1 : 1;
  const updated = {
    current: next,
    longest: Math.max(next, s.longest || 0),
    lastDay: today,
  };
  writeJSON(STREAK_KEY, updated);
  return updated;
}

/**
 * Track a tool invocation. Pass the tool slug (e.g. "fraud-analyzer").
 * Returns array of newly-unlocked badges so callers can toast them.
 */
export function recordToolUse(toolSlug) {
  if (!toolSlug) return [];
  const counts = getToolCounts();
  counts[toolSlug] = (counts[toolSlug] || 0) + 1;
  counts.__total = (counts.__total || 0) + 1;
  writeJSON(TOOL_COUNTS_KEY, counts);
  pingActivity();
  return checkAndAwardBadges();
}

/**
 * Evaluate every badge requirement against the current state.
 * Locks-in any newly-met badges and returns the list of unlocks.
 */
export function checkAndAwardBadges(extra = {}) {
  const counts = getToolCounts();
  const totalScans = counts.__total || 0;
  const uniqueTools = Object.keys(counts).filter((k) => k !== "__total").length;
  const streak = getStreak().current || 0;
  const earned = new Set(getBadges());
  const unlocks = [];

  for (const b of BADGES) {
    if (earned.has(b.id)) continue;
    const r = b.req;
    let met = false;
    if (r.totalScans && totalScans >= r.totalScans) met = true;
    if (r.uniqueTools && uniqueTools >= r.uniqueTools) met = true;
    if (r.streak && streak >= r.streak) met = true;
    if (r.tool && (counts[r.tool] || 0) >= r.count) met = true;
    if (r.emailVerified && extra.emailVerified) met = true;
    if (r.profileComplete && extra.profileComplete) met = true;
    if (r.paidPlan && extra.paidPlan) met = true;
    if (met) {
      earned.add(b.id);
      unlocks.push(b);
    }
  }
  if (unlocks.length) writeJSON(BADGES_KEY, [...earned]);
  return unlocks;
}

/**
 * Get full list with locked/unlocked state for UI.
 */
export function getAllBadgesWithState(extra = {}) {
  // Trigger a check first so freshly-met badges show as unlocked
  checkAndAwardBadges(extra);
  const earned = new Set(getBadges());
  return BADGES.map((b) => ({ ...b, unlocked: earned.has(b.id) }));
}
