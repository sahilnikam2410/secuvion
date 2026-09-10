/**
 * @vitest-environment node
 *
 * Token lifecycle against a fuller in-memory Firestore (batches +
 * where-queries). The legacy cases matter: tokens minted by the old
 * browser path carry no `keyId` back-reference, and the two UIs that
 * created them disagreed on the field name — the developer page wrote
 * `token`, the dashboard wrote `key`. Revoking one of those must still
 * clear the row the user sees, not just the credential.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

let store;

function makeFakeFirestore() {
  const docRef = (path) => ({
    path,
    get id() { return path.split("/").pop(); },
    async get() {
      const data = store[path];
      return { exists: data !== undefined, data: () => data, ref: docRef(path) };
    },
  });

  const collectionRef = (base) => ({
    doc: (id) => (id ? docRef(`${base}/${id}`) : docRef(`${base}/auto_${Object.keys(store).length}`)),
    where(field, _op, value) {
      return {
        async get() {
          const docs = Object.entries(store)
            .filter(([p, v]) => p.startsWith(`${base}/`) && p.slice(base.length + 1).indexOf("/") === -1 && v?.[field] === value)
            .map(([p]) => ({ ref: docRef(p), data: () => store[p] }));
          return { docs, size: docs.length, empty: docs.length === 0 };
        },
      };
    },
  });

  const rootCollection = (name) => ({
    ...collectionRef(name),
    doc: (id) => ({
      ...docRef(`${name}/${id}`),
      collection: (sub) => collectionRef(`${name}/${id}/${sub}`),
    }),
  });

  return {
    collection: rootCollection,
    batch() {
      const ops = [];
      return {
        set: (r, data, opts) => ops.push(() => {
          store[r.path] = opts?.merge ? { ...(store[r.path] || {}), ...data } : data;
        }),
        update: (r, data) => ops.push(() => { store[r.path] = { ...(store[r.path] || {}), ...data }; }),
        delete: (r) => ops.push(() => { delete store[r.path]; }),
        async commit() { ops.forEach((f) => f()); },
      };
    },
  };
}

vi.mock("./_firebaseAdmin.js", () => ({
  getAdminFirestore: () => makeFakeFirestore(),
  getAdminAuth: () => null,
}));

const { mintApiToken, revokeApiToken, deleteApiToken } = await import("./_auth.js");

const metaKeys = (uid) => Object.keys(store).filter((k) => k.startsWith(`users/${uid}/apikeys/`));
const tokenKeys = () => Object.keys(store).filter((k) => k.startsWith("api_tokens/"));

beforeEach(() => { store = {}; });

describe("mintApiToken", () => {
  it("writes a credential and a metadata row, and returns the secret once", async () => {
    const out = await mintApiToken("u1", "Production");
    expect(out.ok).toBe(true);
    expect(out.token).toMatch(/^vrk_[a-f0-9]{48}$/);
    expect(tokenKeys()).toHaveLength(1);
    expect(metaKeys("u1")).toHaveLength(1);
  });

  it("stores NO plan on the credential document", async () => {
    const out = await mintApiToken("u1");
    const doc = store[`api_tokens/${out.token}`];
    expect(doc.plan).toBeUndefined();
    expect(doc.uid).toBe("u1");
    expect(doc.active).toBe(true);
    expect(doc.keyId).toBeTruthy();
  });

  it("issues a distinct token every time", async () => {
    const a = await mintApiToken("u1");
    const b = await mintApiToken("u1");
    expect(a.token).not.toBe(b.token);
  });

  it("truncates an over-long label", async () => {
    const out = await mintApiToken("u1", "x".repeat(200));
    expect(out.label).toHaveLength(60);
  });

  it("caps live keys per user", async () => {
    for (let i = 0; i < 10; i++) expect((await mintApiToken("u1")).ok).toBe(true);
    const over = await mintApiToken("u1");
    expect(over.ok).toBe(false);
    expect(over.error).toBe("too-many-keys");
    expect(over.limit).toBe(10);
  });

  it("refuses an unauthenticated mint", async () => {
    expect((await mintApiToken(null)).error).toBe("unauthenticated");
  });
});

describe("revokeApiToken", () => {
  it("deactivates the credential and its metadata row", async () => {
    const { token, keyId } = await mintApiToken("u1");
    const out = await revokeApiToken("u1", token);
    expect(out.ok).toBe(true);
    expect(store[`api_tokens/${token}`].active).toBe(false);
    expect(store[`users/u1/apikeys/${keyId}`].active).toBe(false);
  });

  it("refuses to revoke a token belonging to someone else", async () => {
    const { token } = await mintApiToken("u1");
    const out = await revokeApiToken("u2", token);
    expect(out.ok).toBe(false);
    expect(out.error).toBe("forbidden");
    expect(store[`api_tokens/${token}`].active).toBe(true);
  });

  it("rejects a malformed token id", async () => {
    expect((await revokeApiToken("u1", "not-a-token")).error).toBe("bad-request");
  });

  it("reports not-found for an unknown token", async () => {
    expect((await revokeApiToken("u1", `vrk_${"b".repeat(48)}`)).error).toBe("not-found");
  });

  it("clears a LEGACY row keyed by `token` with no keyId back-reference", async () => {
    const token = `vrk_${"c".repeat(48)}`;
    store[`api_tokens/${token}`] = { uid: "u1", plan: "enterprise", active: true };
    store["users/u1/apikeys/legacy1"] = { token, label: "Old dev key", active: true };

    const out = await revokeApiToken("u1", token);
    expect(out.ok).toBe(true);
    expect(out.metadataUpdated).toBe(1);
    expect(store["users/u1/apikeys/legacy1"].active).toBe(false);
  });

  it("clears a LEGACY row keyed by `key` (the dashboard's field name)", async () => {
    const token = `vrk_${"d".repeat(48)}`;
    store[`api_tokens/${token}`] = { uid: "u1", active: true };
    store["users/u1/apikeys/legacy2"] = { key: token, label: "Primary", active: true };

    const out = await revokeApiToken("u1", token);
    expect(out.metadataUpdated).toBe(1);
    expect(store["users/u1/apikeys/legacy2"].active).toBe(false);
  });

  it("does not touch another user's identically-shaped row", async () => {
    const token = `vrk_${"e".repeat(48)}`;
    store[`api_tokens/${token}`] = { uid: "u1", active: true };
    store["users/u1/apikeys/mine"] = { key: token, active: true };
    store["users/u2/apikeys/theirs"] = { key: token, active: true };

    await revokeApiToken("u1", token);
    expect(store["users/u1/apikeys/mine"].active).toBe(false);
    expect(store["users/u2/apikeys/theirs"].active).toBe(true);
  });

  it("still kills the credential when no metadata row exists at all", async () => {
    const token = `vrk_${"f".repeat(48)}`;
    store[`api_tokens/${token}`] = { uid: "u1", active: true };
    const out = await revokeApiToken("u1", token);
    expect(out.ok).toBe(true);
    expect(out.metadataUpdated).toBe(0);
    expect(store[`api_tokens/${token}`].active).toBe(false);
  });
});

describe("deleteApiToken", () => {
  it("removes both documents", async () => {
    const { token } = await mintApiToken("u1");
    const out = await deleteApiToken("u1", token);
    expect(out.ok).toBe(true);
    expect(tokenKeys()).toHaveLength(0);
    expect(metaKeys("u1")).toHaveLength(0);
  });

  it("removes a legacy row with no keyId", async () => {
    const token = `vrk_${"a".repeat(48)}`;
    store[`api_tokens/${token}`] = { uid: "u1", active: true };
    store["users/u1/apikeys/legacy3"] = { token, active: true };

    const out = await deleteApiToken("u1", token);
    expect(out.metadataDeleted).toBe(1);
    expect(store["users/u1/apikeys/legacy3"]).toBeUndefined();
  });

  it("refuses to delete someone else's token", async () => {
    const { token } = await mintApiToken("u1");
    expect((await deleteApiToken("u2", token)).error).toBe("forbidden");
    expect(tokenKeys()).toHaveLength(1);
  });
});
