#!/usr/bin/env node
/**
 * Seed sample coupon codes into Firestore.
 *
 * Usage:
 *   1. Download serviceAccount.json from Firebase Console
 *      (Project Settings → Service Accounts → Generate new private key)
 *      and place it at the project root (gitignored).
 *   2. npm install firebase-admin --no-save
 *   3. node scripts/seed-coupons.mjs
 *
 * Edit the COUPONS array below to add / change codes. Re-running is safe —
 * existing codes are merged (not duplicated).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const KEY_PATH = resolve(process.cwd(), "serviceAccount.json");
let creds;
try {
  creds = JSON.parse(readFileSync(KEY_PATH, "utf8"));
} catch (e) {
  console.error("✗ Could not read serviceAccount.json at", KEY_PATH);
  console.error("  Download it from Firebase Console → Project Settings → Service Accounts.");
  process.exit(1);
}

const adminPkg = await import("firebase-admin/app").catch(() => null);
const fsPkg = await import("firebase-admin/firestore").catch(() => null);
if (!adminPkg || !fsPkg) {
  console.error("✗ firebase-admin not installed. Run: npm install firebase-admin --no-save");
  process.exit(1);
}

const { initializeApp, cert } = adminPkg;
const { getFirestore, Timestamp } = fsPkg;

initializeApp({ credential: cert(creds) });
const db = getFirestore();

const days = (n) => Timestamp.fromMillis(Date.now() + n * 24 * 60 * 60 * 1000);

// === Edit this list to manage coupons ===
const COUPONS = [
  { code: "LAUNCH50", percentOff: 50, active: true, expiresAt: days(30), plans: ["pro", "enterprise"] },
  { code: "STUDENT25", percentOff: 25, active: true, expiresAt: days(90) },
  { code: "FLAT100", flatOff: 100, active: true, expiresAt: days(60) },
  { code: "WELCOME10", percentOff: 10, active: true, expiresAt: days(180) },
];

console.log(`→ Seeding ${COUPONS.length} coupon(s) into Firestore project: ${creds.project_id}`);
let ok = 0, fail = 0;
for (const c of COUPONS) {
  try {
    const { code, ...data } = c;
    await db.collection("coupons").doc(code).set(data, { merge: true });
    console.log(`  ✓ ${code}`);
    ok++;
  } catch (e) {
    console.error(`  ✗ ${c.code}: ${e.message}`);
    fail++;
  }
}
console.log(`\nDone. ${ok} ok / ${fail} failed.`);
process.exit(fail > 0 ? 1 : 0);
