/**
 * Firebase Admin singleton.
 * Reads FIREBASE_SERVICE_ACCOUNT env var (full service account JSON
 * as a single-line string) and initializes the SDK exactly once per
 * cold start. Returns null if the env var is missing so callers can
 * fall back gracefully.
 *
 * Underscore-prefixed file so Vercel ignores it as a function.
 */
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let cached = null;

export function getAdminFirestore() {
  if (cached) return cached;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  let creds;
  try {
    // Allow either raw JSON or base64-encoded JSON
    const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    creds = JSON.parse(text);
    // Vercel often escapes newlines in private_key. Restore them.
    if (creds.private_key && creds.private_key.includes("\\n")) {
      creds.private_key = creds.private_key.replace(/\\n/g, "\n");
    }
  } catch (e) {
    console.error("FIREBASE_SERVICE_ACCOUNT parse failed:", e.message);
    return null;
  }
  if (!getApps().length) {
    initializeApp({ credential: cert(creds) });
  }
  cached = getFirestore();
  return cached;
}
