import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../firebase/config";

/**
 * Save a tool result to the user's tool history in Firestore.
 * @param {string} tool - Tool name (e.g. "Fraud Analyzer", "IP Lookup")
 * @param {string} query - The user's input/query
 * @param {string} result - Summary of the result
 * @param {"success"|"warning"|"error"} status - Result status
 */
export async function saveToolResult(tool, query, result, status = "success") {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
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
