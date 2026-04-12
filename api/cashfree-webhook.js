import crypto from "crypto";
import { adminDb } from "./_firebaseAdmin.js";
import admin from "firebase-admin";

const PLAN_MAP = {
  starter: "starter", standard: "starter",
  pro: "pro", advanced: "pro",
  enterprise: "enterprise",
};

const PLAN_DURATION = { monthly: 30, annual: 365 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify webhook signature
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const rawBody = JSON.stringify(req.body);

    if (process.env.CASHFREE_WEBHOOK_SECRET && signature) {
      const payload = timestamp + rawBody;
      const expectedSig = crypto
        .createHmac("sha256", process.env.CASHFREE_WEBHOOK_SECRET)
        .update(payload)
        .digest("base64");

      if (signature !== expectedSig) {
        console.error("Webhook signature mismatch");
        return res.status(400).json({ error: "Invalid signature" });
      }
    }

    const event = req.body;

    if (event.type === "PAYMENT_SUCCESS_WEBHOOK" || event.data?.payment?.payment_status === "SUCCESS") {
      const payment = event.data?.payment || {};
      const order = event.data?.order || {};
      const orderId = order.order_id;
      const tags = order.order_tags || {};
      const planKey = tags.plan || "pro";
      const billing = tags.billing || "monthly";
      const normalizedPlan = PLAN_MAP[planKey] || "pro";

      console.log("Cashfree webhook - payment succeeded:", { orderId, planKey, billing });

      // Find user by matching the order in their payments subcollection
      // Or use customer email to find user
      const customerEmail = order.customer_details?.customer_email;
      if (customerEmail) {
        const usersSnapshot = await adminDb
          .collection("users")
          .where("email", "==", customerEmail)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          const uid = userDoc.id;

          // Check if already processed
          const existing = await adminDb
            .collection("users").doc(uid)
            .collection("payments")
            .where("transactionId", "==", orderId)
            .get();

          if (existing.empty) {
            const durationDays = PLAN_DURATION[billing] || 30;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + durationDays);

            await adminDb.collection("users").doc(uid).update({
              plan: normalizedPlan,
              subscriptionActive: true,
              subscriptionBilling: billing,
              subscriptionStartedAt: admin.firestore.FieldValue.serverTimestamp(),
              subscriptionExpiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
              subscriptionOrderId: orderId,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            await adminDb.collection("users").doc(uid).collection("payments").add({
              amount: order.order_amount || 0,
              plan: normalizedPlan,
              billing,
              method: "cashfree",
              transactionId: orderId,
              cfPaymentId: payment.cf_payment_id || "",
              status: "completed",
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`Subscription activated for ${customerEmail}: ${normalizedPlan} (${billing})`);
          } else {
            console.log(`Payment already processed for order ${orderId}`);
          }
        }
      }
    } else if (event.data?.payment?.payment_status === "FAILED") {
      console.log("Cashfree payment failed:", event.data?.order?.order_id);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}
