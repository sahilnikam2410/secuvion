import { checkRateLimit } from "./_rateLimit.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || "unknown";
  const rl = checkRateLimit(ip, 15, 60000);
  if (!rl.allowed) { res.setHeader("Retry-After", rl.retryAfter); return res.status(429).json({ error: "Too many requests" }); }

  const { hash } = req.body || {};
  if (!hash || typeof hash !== "string" || !/^[a-fA-F0-9]{32,128}$/.test(hash.trim())) {
    return res.status(400).json({ error: "Invalid hash format" });
  }

  try {
    // Use Malware Bazaar API (abuse.ch) — free, no key needed
    const formData = new URLSearchParams();
    formData.append("query", "get_info");
    formData.append("hash", hash.trim());

    const mbResponse = await fetch("https://mb-api.abuse.ch/api/v1/", {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(10000),
    });
    const mbData = await mbResponse.json();

    if (mbData.query_status === "hash_not_found") {
      return res.status(200).json({ status: "clean", message: "No malware match found", hash: hash.trim(), detections: 0, engines: 0 });
    }

    if (mbData.query_status === "ok" && mbData.data && mbData.data.length > 0) {
      const sample = mbData.data[0];
      return res.status(200).json({
        status: "malicious",
        hash: hash.trim(),
        fileName: sample.file_name || "Unknown",
        fileType: sample.file_type || "Unknown",
        fileSize: sample.file_size || 0,
        signature: sample.signature || "Unknown",
        firstSeen: sample.first_seen || null,
        lastSeen: sample.last_seen || null,
        tags: sample.tags || [],
        detections: sample.intelligence?.uploads ? parseInt(sample.intelligence.uploads) : 1,
        engines: 1,
        reporter: sample.reporter || "Unknown",
      });
    }

    return res.status(200).json({ status: "unknown", message: "Could not determine file safety", hash: hash.trim(), detections: 0, engines: 0 });
  } catch (err) {
    console.error("Hash check error:", err.message);
    return res.status(500).json({ error: "Hash check service unavailable" });
  }
}
