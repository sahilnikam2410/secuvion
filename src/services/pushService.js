/**
 * Browser-side notification service.
 * Uses the standard Notification API (no VAPID/server push yet).
 * Lets us show in-browser alerts for breach detections, weekly digest
 * reminders, etc. without backend infrastructure.
 *
 * To upgrade to real Web Push later, add VAPID keys + serviceWorker
 * registration with subscription, and wire to a Vercel function that
 * stores subscriptions in Firestore.
 */

const PREF_KEY = "vrikaan_push_pref_v1";

export function getPermissionState() {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission; // "default" | "granted" | "denied"
}

export async function requestPermission() {
  if (typeof Notification === "undefined") return "unsupported";
  if (Notification.permission === "granted") return "granted";
  try {
    const result = await Notification.requestPermission();
    if (result === "granted") {
      try { localStorage.setItem(PREF_KEY, JSON.stringify({ enabled: true, askedAt: Date.now() })); } catch {}
    }
    return result;
  } catch {
    return "denied";
  }
}

export function isEnabled() {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return false;
  try {
    const p = JSON.parse(localStorage.getItem(PREF_KEY) || "null");
    return p?.enabled !== false;
  } catch { return true; }
}

export function setEnabled(enabled) {
  try { localStorage.setItem(PREF_KEY, JSON.stringify({ enabled, askedAt: Date.now() })); } catch {}
}

/**
 * Send a notification. No-op if permission not granted or user disabled.
 */
export function notify(title, options = {}) {
  if (!isEnabled()) return null;
  try {
    return new Notification(title, {
      icon: "/wolf-icon.png",
      badge: "/wolf-icon.png",
      ...options,
    });
  } catch {
    return null;
  }
}

/**
 * Convenience: show on breach detection.
 */
export function notifyBreach(email, breachCount) {
  return notify(`⚠ ${breachCount} breach${breachCount > 1 ? "es" : ""} found`, {
    body: `Your email ${email} appeared in ${breachCount} known data breach${breachCount > 1 ? "es" : ""}. Open dashboard to review.`,
    tag: "breach-alert",
  });
}

/**
 * Convenience: show on plan expiry.
 */
export function notifyExpiry(daysLeft) {
  return notify("VRIKAAN plan expires soon", {
    body: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left. Renew to keep access to all features.`,
    tag: "plan-expiry",
  });
}
