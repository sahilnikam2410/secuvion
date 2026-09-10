/**
 * API token management for Pro/Enterprise users.
 *
 * Tokens are MINTED SERVER-SIDE by api/tools.js (token-create /
 * token-revoke / token-delete) behind a verified Firebase ID token.
 * This module only reads the owner-listable metadata at
 * /users/{uid}/apikeys/{keyId} and calls those endpoints.
 *
 * It used to write /api_tokens/{token} straight from the browser,
 * including the `plan` field the backend then trusted as the caller's
 * tier — which let any signed-in account issue itself an Enterprise
 * key. That collection is now server-only in firestore.rules, and the
 * stored document carries no plan: api/_auth.js resolves the tier from
 * users/{uid} on every request.
 *
 * Token format: vrk_<48 hex>
 * Sent via Authorization: Bearer header to /api/* endpoints.
 */
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { apiFetch } from "../lib/apiFetch";

async function post(tool, body) {
  const res = await apiFetch(`/api/tools?tool=${tool}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || `${tool} failed`);
  return out;
}

export async function listTokens(uid) {
  if (!uid) return [];
  const snap = await getDocs(collection(db, "users", uid, "apikeys"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Mint a new token. The full secret comes back exactly once — it is
 * not re-derivable, so surface it to the user immediately.
 */
export async function createToken(uid, _plan, label = "API Key") {
  if (!uid) throw new Error("Not signed in");
  const out = await post("token-create", { label });
  return { id: out.keyId, token: out.token, label: out.label };
}

export async function revokeToken(uid, keyId, token) {
  if (!uid || !token) return false;
  await post("token-revoke", { token });
  return true;
}

export async function deleteToken(uid, keyId, token) {
  if (!uid || !token) return false;
  await post("token-delete", { token });
  return true;
}
