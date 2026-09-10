/**
 * Caller authentication + tier resolution.
 * --------------------------------------------------------------
 * Extracted from tools.js so the whole trust boundary — who the caller
 * is, what plan they hold, and which actions that unlocks — sits in one
 * readable file instead of 4,000 lines apart.
 *
 * SECURITY INVARIANT: a caller's plan is ALWAYS read from users/{uid}
 * via the Admin SDK. It is never taken from anything the client can
 * write. api_tokens/{token} maps a bearer token to a uid and nothing
 * more; the plan is resolved fresh on every request.
 *
 * Underscore-prefixed so Vercel does not expose it as a function.
 */
import crypto from "crypto";
import { getAdminFirestore, getAdminAuth } from "./_firebaseAdmin.js";


// ─── Tier gate (server-trusted) ─────────────────────────────────────
// Map each action → required plan tier.
// "free" = anyone (including unauthenticated)
// "pro"  = paid Pro plan OR allowed daily free-quota slots
// "enterprise" = Enterprise plan only, no free quota
export const ACTION_TIERS = {
  // FREE tier (educational, public utility)
  whois:               "free",
  ip:                  "free",
  "breach-check":      "free",
  "password-check":    "free",
  "weekly-digest":     "free", // cron auth handled separately inside handler
  "leak-check":        "free",
  "newsletter-subscribe": "free",
  "enterprise-lead": "free",
  "yt-lesson": "free",
  "blog-list": "free",
  "blog-get": "free",
  "blog-generate": "free", // gated internally by CRON_SECRET
  "blog-delete": "free",   // gated internally by CRON_SECRET
  "referral-record": "free", // attributes a signup to a referrer (auth required)
  "scamsig-delete": "free",  // admin purge of scamSignatures docs (CRON_SECRET)
  "daily-alert": "free",   // cron, gated by CRON_SECRET
  "wa-broadcast": "free",  // cron/admin, gated by CRON_SECRET
  "cert-register": "free",
  "cert-verify": "free",
  "coupon-validate": "free",
  "whatsapp-inbound": "free",  // Twilio webhook — no user auth, rate-limited by phone
  "telegram": "free",          // Telegram bot webhook — no user auth

  // PRO tier (AI, data-heavy, paid value)
  "scam-check":         "pro",
  "scam-dna":           "free",  // free → grows the community scam-intel network (the moat)
  "scambait":           "free",  // free → viral + harvests scam intel into Scam DNA
  "scam-dna-api":       "enterprise", // B2B: programmatic scam-intel for fintechs/banks (paid)
  "whatsapp":           "free",  // Meta Cloud API webhook (scam-check via WhatsApp)
  "risk-score":         "free",  // lead-gen — free to drive signups + upgrade intent
  "headers-fix":        "pro",
  "deepfake-audio":     "pro",
  "security-headers":   "pro",
  "file-hash-check":    "pro",
  "ai-explain":         "pro",
  "vuln-scan":          "pro",
  "vuln-synthesize":    "pro",

  // ENTERPRISE tier (team / webhooks / refunds / 2FA admin)
  "team-create":         "enterprise",
  "team-invite":         "enterprise",
  "team-accept-invite":  "enterprise",
  "team-remove-member":  "enterprise",
  // Family — accept/info/set-mode open to any plan (invited members may be
  // free-tier). create/invite/remove are owner-only and require Family plan.
  "family-create":         "family",
  "family-invite":         "family",
  "family-remove-member":  "family",
  "family-set-mode":       "family",
  "family-add-seat":       "family",
  "family-accept-invite":  "free",
  "family-info":           "free",
  "webhook-set":         "enterprise",
  "webhook-clear":       "enterprise",
  "webhook-test":        "enterprise",
  refund:                "enterprise",
  "totp-setup":          "free",  // 2FA available to all
  "totp-confirm":        "free",
  "totp-verify":         "free",
  "totp-disable":        "free",
  // Account self-service — "free" here means no tier gate; each handler
  // requires a verified Firebase ID token of its own.
  "token-create":        "free",
  "token-revoke":        "free",
  "token-delete":        "free",
  "usage-consume":       "free",
  "usage-read":          "free",
};

// family = same Pro-tool access + family-specific features. Mirror of
// src/lib/toolTiers.js TIER_LEVEL — drift here = silent UI/backend mismatch.
export const TIER_LEVEL = { free: 0, starter: 0, pro: 1, family: 1, enterprise: 2 };
export function planMeetsTier(plan, required) {
  return (TIER_LEVEL[plan || "free"] ?? 0) >= (TIER_LEVEL[required || "free"] ?? 0);
}

// ─── Plan resolution (single source of truth) ───────────────────────

/**
 * Read a user's plan from users/{uid} via the Admin SDK.
 * This collection blocks client writes to `plan` in firestore.rules,
 * so it is the only trustworthy source. Defaults to "free" on any
 * miss or error — fail closed, never fail open to a paid tier.
 */
export async function resolveUserPlan(fs, uid) {
  if (!fs || !uid) return "free";
  try {
    const snap = await fs.collection("users").doc(uid).get();
    return snap.exists ? (snap.data().plan || "free") : "free";
  } catch {
    return "free";
  }
}

// ─── API tokens ─────────────────────────────────────────────────────

const TOKEN_RE = /^vrk_[a-f0-9]{48}$/i;
const BEARER_TOKEN_RE = /^Bearer\s+(vrk_[a-f0-9]{48})\s*$/i;

/**
 * Validate a long-lived API token.
 *
 * The token doc is READ WITH THE ADMIN SDK and treated as a uid mapping
 * only — `plan` is deliberately ignored even if present, because older
 * documents carry a client-supplied value from before this path was
 * locked down. The effective plan always comes from users/{uid}.
 */
export async function validateApiToken(authHeader) {
  if (!authHeader) return { valid: false };
  const m = BEARER_TOKEN_RE.exec(authHeader);
  if (!m) return { valid: false };
  const token = m[1].toLowerCase();

  const fs = getAdminFirestore();
  if (!fs) return { valid: false };

  try {
    const snap = await fs.collection("api_tokens").doc(token).get();
    if (!snap.exists) return { valid: false };
    const data = snap.data() || {};
    if (data.active !== true) return { valid: false };
    if (!data.uid) return { valid: false };
    const plan = await resolveUserPlan(fs, data.uid);
    return { valid: true, uid: data.uid, plan };
  } catch {
    return { valid: false };
  }
}

/** Cryptographically strong token id. Doc id IS the secret. */
function generateToken() {
  return `vrk_${crypto.randomBytes(24).toString("hex")}`;
}

/** Max live keys per user — stops token-table flooding. */
const MAX_TOKENS_PER_USER = 10;

/**
 * Mint an API token for `uid`. Server-only: writes both the secret
 * mapping (api_tokens/{token}) and the owner-listable metadata record
 * (users/{uid}/apikeys/{id}) in one batch. No `plan` is stored.
 */
export async function mintApiToken(uid, label = "API key") {
  const fs = getAdminFirestore();
  if (!fs) return { ok: false, error: "admin-unavailable" };
  if (!uid) return { ok: false, error: "unauthenticated" };

  const metaCol = fs.collection("users").doc(uid).collection("apikeys");
  const live = await metaCol.where("active", "==", true).get();
  if (live.size >= MAX_TOKENS_PER_USER) {
    return { ok: false, error: "too-many-keys", limit: MAX_TOKENS_PER_USER };
  }

  const token = generateToken();
  const clean = String(label || "API key").slice(0, 60);
  const metaRef = metaCol.doc();
  const now = new Date();

  const batch = fs.batch();
  batch.set(fs.collection("api_tokens").doc(token), {
    uid,
    active: true,
    keyId: metaRef.id,
    createdAt: now,
  });
  batch.set(metaRef, {
    label: clean,
    token,
    key: token, // legacy field name still read by UserDashboard
    preview: `${token.slice(0, 12)}…${token.slice(-4)}`,
    active: true,
    createdAt: now,
    createdAtMs: now.getTime(),
    lastUsedAt: null,
    callCount: 0,
  });
  await batch.commit();

  return { ok: true, token, keyId: metaRef.id, label: clean };
}

/**
 * Locate the owner-listable metadata row(s) for a token.
 *
 * Tokens minted here store a `keyId` back-reference, so this is one
 * lookup. Tokens minted by the old browser path have no back-reference,
 * and the two UIs that created them disagreed on the field name — the
 * developer page wrote `token`, the dashboard wrote `key`. Without this
 * fallback, revoking a legacy key would kill the credential but leave
 * the row in the list still showing "active".
 */
async function findMetadataRefs(fs, uid, token, keyId) {
  const col = fs.collection("users").doc(uid).collection("apikeys");
  if (keyId) return [col.doc(keyId)];

  const refs = [];
  for (const field of ["token", "key"]) {
    try {
      const snap = await col.where(field, "==", token).get();
      snap.docs.forEach((d) => refs.push(d.ref));
    } catch {
      // Field absent on every doc → Firestore returns empty, not an error.
      // A genuine failure here shouldn't block revoking the credential.
    }
  }
  // De-duplicate: a doc could carry both field names.
  return refs.filter((r, i) => refs.findIndex((x) => x.path === r.path) === i);
}

/** Look up a token and confirm `uid` owns it. */
async function ownedToken(fs, uid, token) {
  if (!uid || !TOKEN_RE.test(String(token || ""))) {
    return { error: "bad-request" };
  }
  const ref = fs.collection("api_tokens").doc(String(token).toLowerCase());
  const snap = await ref.get();
  if (!snap.exists) return { error: "not-found" };
  if (snap.data()?.uid !== uid) return { error: "forbidden" };
  return { ref, data: snap.data() || {} };
}

/** Deactivate a token. Only the owning uid may revoke it. */
export async function revokeApiToken(uid, token) {
  const fs = getAdminFirestore();
  if (!fs) return { ok: false, error: "admin-unavailable" };
  const found = await ownedToken(fs, uid, token);
  if (found.error) return { ok: false, error: found.error };

  const now = new Date();
  const metaRefs = await findMetadataRefs(fs, uid, found.ref.id, found.data.keyId);

  const batch = fs.batch();
  batch.update(found.ref, { active: false, revokedAt: now });
  for (const m of metaRefs) batch.set(m, { active: false, revokedAt: now }, { merge: true });
  await batch.commit();
  return { ok: true, metadataUpdated: metaRefs.length };
}

/** Permanently remove a token and its metadata record. */
export async function deleteApiToken(uid, token) {
  const fs = getAdminFirestore();
  if (!fs) return { ok: false, error: "admin-unavailable" };
  const found = await ownedToken(fs, uid, token);
  if (found.error) return { ok: false, error: found.error };

  const metaRefs = await findMetadataRefs(fs, uid, found.ref.id, found.data.keyId);

  const batch = fs.batch();
  batch.delete(found.ref);
  for (const m of metaRefs) batch.delete(m);
  await batch.commit();
  return { ok: true, metadataDeleted: metaRefs.length };
}

// ─── Caller resolution ──────────────────────────────────────────────

/**
 * Resolve who is calling and what they may do.
 * Order: Firebase ID token (browser) → API token (external client) → anon.
 * Both authenticated paths resolve `plan` through resolveUserPlan().
 *
 * @returns {{ plan: string, uid: string|null, source: "id-token"|"api-token"|"anon" }}
 */
export async function resolveCaller(req) {
  const header = req.headers["authorization"] || "";

  // 1) Firebase ID token (Authorization: Bearer <jwt> from the browser)
  const jwtMatch = /^Bearer\s+(eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)\s*$/i.exec(header);
  if (jwtMatch) {
    const auth = getAdminAuth();
    const fs = getAdminFirestore();
    if (auth && fs) {
      try {
        const decoded = await auth.verifyIdToken(jwtMatch[1]);
        const plan = await resolveUserPlan(fs, decoded.uid);
        return { plan, uid: decoded.uid, source: "id-token" };
      } catch {
        // Invalid/expired ID token → fall through to API token, then anon
      }
    }
  }

  // 2) Long-lived API token
  const apiTok = await validateApiToken(header);
  if (apiTok.valid) return { plan: apiTok.plan || "free", uid: apiTok.uid, source: "api-token" };

  // 3) Anonymous
  return { plan: "free", uid: null, source: "anon" };
}
