/**
 * Pure billing helpers — no side effects, no React, easy to test.
 */

/**
 * Compute discount amount (in same currency unit) for a coupon applied to a base price.
 * Coupon shape: { percentOff?: number, flatOff?: number }.
 * Discount is bounded so the final price never goes below 1 (the caller still
 * does the subtraction; this returns the raw discount value).
 */
export function computeCouponDiscount(basePrice, coupon) {
  if (!coupon || !basePrice || basePrice <= 0) return 0;
  if (typeof coupon.percentOff === "number" && coupon.percentOff > 0) {
    const pct = Math.min(100, coupon.percentOff);
    return Math.round(basePrice * (pct / 100));
  }
  if (typeof coupon.flatOff === "number" && coupon.flatOff > 0) {
    // Cap so price stays ≥ 1
    return Math.min(coupon.flatOff, basePrice - 1);
  }
  return 0;
}

/**
 * Final payable price after applying a coupon. Floored at 1.
 */
export function applyCoupon(basePrice, coupon) {
  return Math.max(1, basePrice - computeCouponDiscount(basePrice, coupon));
}

/**
 * Whether a payment is still inside the self-serve refund window (default 7 days).
 * `paymentDateMs` is the payment timestamp in milliseconds since epoch.
 */
export function isRefundEligible(paymentDateMs, { windowDays = 7, status = "success", refunded = false } = {}) {
  if (refunded) return false;
  if (status !== "success") return false;
  if (!paymentDateMs || typeof paymentDateMs !== "number") return false;
  const ageMs = Date.now() - paymentDateMs;
  return ageMs >= 0 && ageMs < windowDays * 24 * 60 * 60 * 1000;
}
