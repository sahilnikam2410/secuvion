/**
 * @vitest-environment node
 *
 * Quota used to be a module-level Map on the server and a user-writable
 * document in the browser — neither of which held. These tests cover the
 * transaction logic and the degraded path taken when the Admin SDK is
 * unconfigured, which must still limit rather than wave everything through.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

let store;
let adminAvailable;

function makeFakeFirestore() {
  const ref = (path) => ({
    path,
    async get() {
      const data = store[path];
      return { exists: data !== undefined, data: () => data };
    },
  });
  return {
    collection: (name) => ({ doc: (id) => ref(`${name}/${id}`) }),
    async runTransaction(fn) {
      const tx = {
        get: (r) => r.get(),
        set: (r, data, opts) => {
          store[r.path] = opts?.merge ? { ...(store[r.path] || {}), ...data } : data;
        },
      };
      return fn(tx);
    },
  };
}

vi.mock("./_firebaseAdmin.js", () => ({
  getAdminFirestore: () => (adminAvailable ? makeFakeFirestore() : null),
}));

const { consumeFreeQuota, consumeUsage, readUsage, PRO_FREE_QUOTA_PER_DAY, PLAN_LIMITS } =
  await import("./_quota.js");

beforeEach(() => { store = {}; adminAvailable = true; });

describe("consumeFreeQuota", () => {
  it("spends exactly the daily allowance, then refuses", async () => {
    const results = [];
    for (let i = 0; i < PRO_FREE_QUOTA_PER_DAY + 2; i++) {
      results.push(await consumeFreeQuota("u1", "vuln-scan"));
    }
    expect(results.slice(0, PRO_FREE_QUOTA_PER_DAY).every((r) => r.allowed)).toBe(true);
    expect(results.slice(PRO_FREE_QUOTA_PER_DAY).every((r) => !r.allowed)).toBe(true);
    expect(results[0].remaining).toBe(PRO_FREE_QUOTA_PER_DAY - 1);
  });

  it("counts each tool separately", async () => {
    for (let i = 0; i < PRO_FREE_QUOTA_PER_DAY; i++) await consumeFreeQuota("u1", "vuln-scan");
    expect((await consumeFreeQuota("u1", "vuln-scan")).allowed).toBe(false);
    expect((await consumeFreeQuota("u1", "ai-explain")).allowed).toBe(true);
  });

  it("counts each caller separately", async () => {
    for (let i = 0; i < PRO_FREE_QUOTA_PER_DAY; i++) await consumeFreeQuota("u1", "vuln-scan");
    expect((await consumeFreeQuota("u2", "vuln-scan")).allowed).toBe(true);
  });

  it("hashes the scope so a raw IPv6 address is a valid document id", async () => {
    const out = await consumeFreeQuota("2606:4700:4700::1111", "vuln-scan");
    expect(out.allowed).toBe(true);
    const id = Object.keys(store)[0];
    expect(id.startsWith("quota/")).toBe(true);
    expect(id).not.toContain(":");
  });

  it("still limits when the Admin SDK is unavailable", async () => {
    adminAvailable = false;
    const scope = `mem-${Math.random()}`;
    for (let i = 0; i < PRO_FREE_QUOTA_PER_DAY; i++) {
      expect((await consumeFreeQuota(scope, "vuln-scan")).allowed).toBe(true);
    }
    expect((await consumeFreeQuota(scope, "vuln-scan")).allowed).toBe(false);
  });
});

describe("consumeUsage", () => {
  it("spends a free user's daily scan allowance and then refuses", async () => {
    const limit = PLAN_LIMITS.free.scan;
    for (let i = 0; i < limit; i++) {
      expect((await consumeUsage("u1", "free", "breach")).allowed).toBe(true);
    }
    const out = await consumeUsage("u1", "free", "breach");
    expect(out.allowed).toBe(false);
    expect(out.remaining).toBe(0);
    expect(out.category).toBe("scan");
  });

  it("keeps categories independent", async () => {
    for (let i = 0; i < PLAN_LIMITS.free.scan; i++) await consumeUsage("u1", "free", "breach");
    expect((await consumeUsage("u1", "free", "breach")).allowed).toBe(false);
    expect((await consumeUsage("u1", "free", "whois")).allowed).toBe(true); // lookup
  });

  it("never limits enterprise", async () => {
    for (let i = 0; i < 50; i++) {
      expect((await consumeUsage("u1", "enterprise", "breach")).allowed).toBe(true);
    }
    expect(store["usage/u1_" + new Date().toISOString().slice(0, 10)]).toBeUndefined();
  });

  it("refuses an anonymous caller rather than counting them as one shared user", async () => {
    const out = await consumeUsage(null, "free", "breach");
    expect(out.allowed).toBe(false);
    expect(out.reason).toBe("unauthenticated");
  });

  it("maps an unknown tool to the lookup category", async () => {
    const out = await consumeUsage("u1", "free", "brand-new-tool");
    expect(out.category).toBe("lookup");
  });
});

describe("readUsage", () => {
  it("reports zeros before anything is spent", async () => {
    const out = await readUsage("u1", "free");
    expect(out.scan).toEqual({ used: 0, limit: PLAN_LIMITS.free.scan });
  });

  it("reflects what was spent, without spending more", async () => {
    await consumeUsage("u1", "free", "breach");
    await consumeUsage("u1", "free", "breach");
    expect((await readUsage("u1", "free")).scan.used).toBe(2);
    expect((await readUsage("u1", "free")).scan.used).toBe(2);
  });
});
