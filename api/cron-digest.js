// Thin cron entry point.
// Vercel Cron parses cleanest with bare paths (no query string), so this file
// exists solely to host the schedule and delegate into the tools.js dispatcher.
import dispatcher from "./tools.js";

export default function handler(req, res) {
  // Force the tool param so the dispatcher routes to weekly-digest.
  req.query = { ...(req.query || {}), tool: "weekly-digest" };
  return dispatcher(req, res);
}
