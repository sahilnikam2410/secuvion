import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../firebase/config";
import { addNotification } from "./notificationService";

/**
 * Save a tool result to the user's tool history in Firestore.
 * Also creates an in-app notification for warning/error results.
 * @param {string} tool - Tool name (e.g. "Fraud Analyzer", "IP Lookup")
 * @param {string} query - The user's input/query
 * @param {string} result - Summary of the result
 * @param {"success"|"warning"|"error"} status - Result status
 */
export async function saveToolResult(tool, query, result, status = "success") {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  // Create an in-app notification for notable results
  try {
    const resultStr = typeof result === "string" ? result : JSON.stringify(result);
    const color = status === "error" ? "#ef4444" : status === "warning" ? "#f97316" : "#22c55e";
    const icon = status === "error" ? "!" : status === "warning" ? "⚠" : "✓";
    if (status !== "success") {
      addNotification(uid, {
        msg: `${tool}: ${resultStr.slice(0, 120)}`,
        color,
        icon,
      });
    }
  } catch { /* ignore notification errors */ }

  try {
    await addDoc(collection(db, "users", uid, "toolHistory"), {
      tool,
      query: query?.slice(0, 500) || "",
      result: typeof result === "string" ? result.slice(0, 1000) : JSON.stringify(result).slice(0, 1000),
      status,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.error("Failed to save tool history:", e);
  }
}
