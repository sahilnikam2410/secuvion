/**
 * Weekly digest opt-in/out helpers.
 * Writes to /digest_subscribers/{uid} which is public-readable so the
 * server-side cron can list emails without a service account.
 *
 * Doc shape:
 *   { uid, email, name, optedAt }
 */
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export async function subscribeToDigest(user) {
  if (!user?.uid || !user?.email) throw new Error("Sign-in required to subscribe");
  await setDoc(doc(db, "digest_subscribers", user.uid), {
    uid: user.uid,
    email: user.email,
    name: user.name || user.displayName || "",
    optedAt: serverTimestamp(),
  });
  return true;
}

export async function unsubscribeFromDigest(uid) {
  if (!uid) throw new Error("Sign-in required");
  await deleteDoc(doc(db, "digest_subscribers", uid));
  return true;
}

export async function isSubscribed(uid) {
  if (!uid) return false;
  try {
    const snap = await getDoc(doc(db, "digest_subscribers", uid));
    return snap.exists();
  } catch {
    return false;
  }
}
