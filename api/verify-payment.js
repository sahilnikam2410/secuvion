import { checkRateLimit } from "./_rateLimit.js";
import { adminDb } from "./_firebaseAdmin.js";
import admin from "firebase-admin";

const CASHFREE_API_BASE = process.env.CASHFREE_ENV === "production"
  ? "https://api.cashfree.com/pg/orders"
  : "https://sandbox.cashfree.com/pg/orders";

const PLAN_MAP = {
  starter: "starter",
  standard: "starter",
  pro: "pro",
  advanced: "pro",
  enterprise: "enterprise",
};

const PLAN_DURATION = {
  monthly: 30,
  annual: 365,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || "unknown";
  const rl = checkRateLimit(ip, 10, 60000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", rl.retryAfter);
    return res.status(429).json({ error: "Too many requests", retryAfter: rl.retryAfter });
  }

  try {
    const { orderId, uid } = req.body;

    if (!orderId || !uid) {
      return res.status(400).json({ error: "Missing orderId or uid" });
    }

    // 1. Verify payment with Cashfree
    const cfResponse = await fetch(`${CASHFREE_API_BASE}/${orderId}`, {
      method: "GET",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      },
    });

    const cfData = await cfResponse.json();

    if (!cfResponse.ok) {
      console.error("Cashfree verify error:", cfData);
      return res.status(400).json({ error: "Failed to verify order with Cashfree" });
    }

    if (cfData.order_status !== "PAID") {
      return res.status(400).json({
        error: "Payment not completed",
        status: cfData.order_status,
      });
    }

    // 2. Check if this payment was already processed (prevent duplicates)
    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();

    // Check if this order was already processed
    const existingPayments = await adminDb
      .collection("users").doc(uid)
      .collection("payments")
      .where("transactionId", "==", orderId)
      .get();

    if (!existingPayments.empty) {
      // Already processed — return current plan info
      return res.status(200).json({
        success: true,
        alreadyProcessed: true,
        plan: userData.plan,
        message: "This payment was already processed",
      });
    }

    // 3. Check if user already has an active subscription for this plan
    const planKey = cfData.order_tags?.plan || "pro";
    const billing = cfData.order_tags?.billing || "monthly";
    const normalizedPlan = PLAN_MAP[planKey] || "pro";

    if (userData.plan === normalizedPlan && userData.subscriptionActive) {
      const expiresAt = userData.subscriptionExpiresAt?.toDate?.();
      if (expiresAt && expiresAt > new Date()) {
        return res.status(400).json({
          error: "You already have an active subscription for this plan",
          currentPlan: userData.plan,
          expiresAt: expiresAt.toISOString(),
        });
      }
    }

    // 4. Activate subscription
    const durationDays = PLAN_DURATION[billing] || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    await userRef.update({
      plan: normalizedPlan,
      subscriptionActive: true,
      subscriptionBilling: billing,
      subscriptionStartedAt: admin.firestore.FieldValue.serverTimestamp(),
      subscriptionExpiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      subscriptionOrderId: orderId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 5. Save payment record
    await adminDb.collection("users").doc(uid).collection("payments").add({
      amount: cfData.order_amount || 0,
      plan: normalizedPlan,
      billing,
      method: "cashfree",
      transactionId: orderId,
      cfPaymentId: cfData.cf_order_id || "",
      status: "completed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      plan: normalizedPlan,
      billing,
      expiresAt: expiresAt.toISOString(),
      message: "Subscription activated successfully",
    });
  } catch (err) {
    console.error("Payment verification error:", err.message);
    return res.status(500).json({ error: "Payment verification failed" });
  }
}
