#!/usr/bin/env node
/**
 * Promote the latest "Ready" Production deployment to vrikaan.com.
 *
 * Background: this Vercel project's vrikaan.com alias does NOT auto-track
 * the latest deployment. Every push must be followed by `vercel promote`.
 * This script picks the newest Ready deploy and promotes it in one step.
 *
 * Usage: npm run promote
 */
import { execSync } from "node:child_process";

console.log("> Listing recent deployments...");
// vercel ls writes the deployment TABLE to stderr; only bare URLs go to stdout.
// Merge both streams so we can scan the table. Strip ANSI colour codes too.
const ANSI_RE = /\[[0-9;]*m/g;
let raw;
try {
  raw = execSync("vercel ls 2>&1", { encoding: "utf8", shell: true });
} catch (e) {
  raw = (e.stdout || "") + (e.stderr || "") + (e.message || "");
}
const lines = raw.replace(ANSI_RE, "").split("\n");

// Find the first table row that has Ready + Production + a deploy URL.
const readyLine = lines.find(
  (l) => /\bReady\b/.test(l) && /\bProduction\b/.test(l) && /https:\/\//.test(l)
);
if (!readyLine) {
  console.error("No Ready Production deployment found.");
  console.error("Raw vercel ls output (last 30 lines):");
  console.error(lines.slice(-30).join("\n"));
  process.exit(1);
}

const urlMatch = readyLine.match(/https:\/\/\S+/);
if (!urlMatch) {
  console.error("Could not parse deployment URL from row:", readyLine.trim());
  process.exit(1);
}
const url = urlMatch[0];

console.log("> Promoting " + url + " ...");
try {
  const result = execSync("vercel promote " + url + " 2>&1", { encoding: "utf8", shell: true });
  console.log(result.trim().split("\n").slice(-3).join("\n"));
} catch (e) {
  const combined = (e.stdout || "") + (e.stderr || "") + (e.message || "");
  if (/already the current production/i.test(combined)) {
    console.log("Already on production - vrikaan.com up to date.");
    process.exit(0);
  }
  console.error("Promote failed:", combined.slice(-500));
  process.exit(1);
}
console.log("Done. vrikaan.com now serves " + url);
