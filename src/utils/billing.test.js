import { describe, it, expect } from "vitest";
import { computeCouponDiscount, applyCoupon, isRefundEligible } from "./billing.js";

describe("computeCouponDiscount", () => {
  it("returns 0 when no coupon", () => {
    expect(computeCouponDiscount(100, null)).toBe(0);
    expect(computeCouponDiscount(100, undefined)).toBe(0);
    expect(computeCouponDiscount(100, {})).toBe(0);
  });

  it("returns 0 for non-positive base price", () => {
    expect(computeCouponDiscount(0, { percentOff: 50 })).toBe(0);
    expect(computeCouponDiscount(-100, { percentOff: 50 })).toBe(0);
  });

  it("computes percentOff correctly", () => {
    expect(computeCouponDiscount(100, { percentOff: 25 })).toBe(25);
    expect(computeCouponDiscount(990, { percentOff: 50 })).toBe(495);
  });

  it("caps percentOff at 100%", () => {
    expect(computeCouponDiscount(100, { percentOff: 200 })).toBe(100);
  });

  it("rounds percent results", () => {
    expect(computeCouponDiscount(99, { percentOff: 33 })).toBe(33); // 32.67 → 33
  });

  it("computes flatOff capped at base - 1", () => {
    expect(computeCouponDiscount(100, { flatOff: 30 })).toBe(30);
    expect(computeCouponDiscount(100, { flatOff: 200 })).toBe(99); // capped
  });

  it("ignores flatOff when percentOff present", () => {
    expect(computeCouponDiscount(100, { percentOff: 10, flatOff: 50 })).toBe(10);
  });
});

describe("applyCoupon", () => {
  it("never drops final price below 1", () => {
    expect(applyCoupon(50, { flatOff: 999 })).toBe(1);
    expect(applyCoupon(100, { percentOff: 100 })).toBe(1); // 100% off → still ₹1
  });
  it("subtracts discount normally", () => {
    expect(applyCoupon(990, { percentOff: 50 })).toBe(495);
  });
});

describe("isRefundEligible", () => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  it("allows refund within 7-day default window", () => {
    expect(isRefundEligible(now - 3 * oneDay, {})).toBe(true);
  });
  it("blocks refund past 7-day window", () => {
    expect(isRefundEligible(now - 8 * oneDay, {})).toBe(false);
  });
  it("blocks already-refunded payments", () => {
    expect(isRefundEligible(now - 1 * oneDay, { refunded: true })).toBe(false);
  });
  it("blocks failed/pending payments", () => {
    expect(isRefundEligible(now - 1 * oneDay, { status: "pending" })).toBe(false);
  });
  it("respects custom window", () => {
    expect(isRefundEligible(now - 10 * oneDay, { windowDays: 14 })).toBe(true);
  });
  it("rejects bad inputs", () => {
    expect(isRefundEligible(null, {})).toBe(false);
    expect(isRefundEligible("not a number", {})).toBe(false);
  });
});
