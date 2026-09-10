/**
 * @vitest-environment node
 *
 * The trust boundary. These tests exist because a free account could
 * previously write api_tokens/{token} with plan:"enterprise" and the
 * dispatcher believed it — the fix is that the plan is now resolved from
 * users/{uid}, and the assertion that matters is that a plan stored on
 * the token document is ignored no matter what it says.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockDoc = vi.fn(() => ({ get: mockGet }));
const mockCollection = vi.fn(() => ({ doc: mockDoc }));
const mockFs = { collection: mockCollection };
const mockVerifyIdToken = vi.fn();

vi.mock("./_firebaseAdmin.js", () => ({
  getAdminFirestore: () => mockFs,
  getAdminAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

const { planMeetsTier, ACTION_TIERS, validateApiToken, resolveCaller, resolveUserPlan } =
  await import("./_auth.js");

/** Route collection(name).doc(id).get() to a canned document per collection. */
function stubFirestore(docs) {
  mockCollection.mockImplementation((name) => ({
    doc: (id) => ({
      get: async () => {
        const found = docs[`${name}/${id}`];
        return { exists: found !== undefined, data: () => found };
      },
    }),
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
  stubFirestore({});
});

const TOKEN = `vrk_${"a".repeat(48)}`;

describe("planMeetsTier", () => {
  it("treats missing and unknown plans as free", () => {
    expect(planMeetsTier(undefined, "free")).toBe(true);
    expect(planMeetsTier(null, "pro")).toBe(false);
    expect(planMeetsTier("nonsense", "pro")).toBe(false);
  });

  it("ranks starter alongside free, not pro", () => {
    expect(planMeetsTier("starter", "free")).toBe(true);
    expect(planMeetsTier("starter", "pro")).toBe(false);
  });

  it("lets family reach pro tools but not enterprise", () => {
    expect(planMeetsTier("family", "pro")).toBe(true);
    expect(planMeetsTier("family", "enterprise")).toBe(false);
  });

  it("lets enterprise reach everything", () => {
    for (const t of ["free", "pro", "family", "enterprise"]) {
      expect(planMeetsTier("enterprise", t)).toBe(true);
    }
  });
});

describe("ACTION_TIERS", () => {
  it("keeps the B2B and team actions enterprise-only", () => {
    expect(ACTION_TIERS["scam-dna-api"]).toBe("enterprise");
    expect(ACTION_TIERS["team-create"]).toBe("enterprise");
    expect(ACTION_TIERS.refund).toBe("enterprise");
  });

  it("declares a tier for every registered action", () => {
    for (const [action, tier] of Object.entries(ACTION_TIERS)) {
      expect(["free", "pro", "family", "enterprise"], `${action} has tier "${tier}"`).toContain(tier);
    }
  });
});

describe("validateApiToken", () => {
  it("rejects a missing or malformed header", async () => {
    expect(await validateApiToken("")).toEqual({ valid: false });
    expect(await validateApiToken("Bearer nope")).toEqual({ valid: false });
    expect(await validateApiToken(`Bearer vrk_${"a".repeat(10)}`)).toEqual({ valid: false });
  });

  it("rejects an unknown token", async () => {
    stubFirestore({});
    expect(await validateApiToken(`Bearer ${TOKEN}`)).toEqual({ valid: false });
  });

  it("rejects a revoked token", async () => {
    stubFirestore({
      [`api_tokens/${TOKEN}`]: { uid: "u1", active: false },
      "users/u1": { plan: "enterprise" },
    });
    expect(await validateApiToken(`Bearer ${TOKEN}`)).toEqual({ valid: false });
  });

  it("IGNORES a plan stored on the token document", async () => {
    // This is the exact shape of the old exploit: a token doc the client
    // wrote, claiming enterprise, for a user who is actually on free.
    stubFirestore({
      [`api_tokens/${TOKEN}`]: { uid: "u1", active: true, plan: "enterprise" },
      "users/u1": { plan: "free" },
    });
    const out = await validateApiToken(`Bearer ${TOKEN}`);
    expect(out.valid).toBe(true);
    expect(out.uid).toBe("u1");
    expect(out.plan).toBe("free");
  });

  it("resolves the real plan from users/{uid}", async () => {
    stubFirestore({
      [`api_tokens/${TOKEN}`]: { uid: "u2", active: true },
      "users/u2": { plan: "pro" },
    });
    expect(await validateApiToken(`Bearer ${TOKEN}`)).toEqual({ valid: true, uid: "u2", plan: "pro" });
  });

  it("refuses a token with no uid mapping", async () => {
    stubFirestore({ [`api_tokens/${TOKEN}`]: { active: true, plan: "enterprise" } });
    expect(await validateApiToken(`Bearer ${TOKEN}`)).toEqual({ valid: false });
  });
});

describe("resolveUserPlan", () => {
  it("fails closed to free when the user doc is missing", async () => {
    stubFirestore({});
    expect(await resolveUserPlan(mockFs, "ghost")).toBe("free");
  });

  it("fails closed to free when Firestore throws", async () => {
    mockCollection.mockImplementation(() => ({
      doc: () => ({ get: async () => { throw new Error("unavailable"); } }),
    }));
    expect(await resolveUserPlan(mockFs, "u1")).toBe("free");
  });
});

describe("resolveCaller", () => {
  const req = (authorization) => ({ headers: authorization ? { authorization } : {} });

  it("falls back to anonymous free with no header", async () => {
    expect(await resolveCaller(req())).toEqual({ plan: "free", uid: null, source: "anon" });
  });

  it("verifies a Firebase ID token and reads the plan server-side", async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: "u3" });
    stubFirestore({ "users/u3": { plan: "pro" } });
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1MyJ9.sig";
    expect(await resolveCaller(req(`Bearer ${jwt}`))).toEqual({ plan: "pro", uid: "u3", source: "id-token" });
  });

  it("does not trust an unverifiable ID token", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("expired"));
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhdHRhY2tlciJ9.sig";
    expect(await resolveCaller(req(`Bearer ${jwt}`))).toEqual({ plan: "free", uid: null, source: "anon" });
  });

  it("resolves an API token to its owner's real plan", async () => {
    stubFirestore({
      [`api_tokens/${TOKEN}`]: { uid: "u4", active: true, plan: "enterprise" },
      "users/u4": { plan: "starter" },
    });
    expect(await resolveCaller(req(`Bearer ${TOKEN}`))).toEqual({ plan: "starter", uid: "u4", source: "api-token" });
  });
});
