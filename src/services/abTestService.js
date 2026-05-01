/**
 * Lightweight client-side A/B testing.
 * Each experiment has variants; on first visit a user is bucketed
 * into one variant by hashing their browser fingerprint. Bucket is
 * persisted in localStorage so the same user always sees the same
 * variant. Conversion events are recorded locally; sync to analytics
 * later.
 *
 * Reading a variant:
 *   import { getVariant, trackConversion } from "...";
 *   const variant = getVariant("pricing_layout"); // "A" | "B"
 *
 * Define experiments here so all variants are documented in one place.
 */

const STORAGE_KEY = "vrikaan_ab_v1";
const EVENTS_KEY = "vrikaan_ab_events_v1";

// Active experiments. Update weights to control split.
export const EXPERIMENTS = {
  pricing_layout: {
    desc: "A = price-first card; B = features-first card",
    variants: ["A", "B"],
    weights: [0.5, 0.5],
  },
  trial_cta: {
    desc: "A = 'Start Free Trial'; B = 'Try VRIKAAN — no card needed'",
    variants: ["A", "B"],
    weights: [0.5, 0.5],
  },
  hero_headline: {
    desc: "A = current; B = aggressive value-prop",
    variants: ["A", "B"],
    weights: [0.5, 0.5],
  },
};

function readBuckets() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

function writeBuckets(b) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(b)); } catch { /* full */ }
}

function readEvents() {
  try { return JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]"); } catch { return []; }
}

function writeEvents(arr) {
  try { localStorage.setItem(EVENTS_KEY, JSON.stringify(arr.slice(-200))); } catch { /* full */ }
}

function pickWeighted(variants, weights) {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < variants.length; i++) {
    acc += weights[i] || 1 / variants.length;
    if (r < acc) return variants[i];
  }
  return variants[variants.length - 1];
}

/**
 * Get (or assign) the variant for an experiment.
 */
export function getVariant(experimentKey) {
  const exp = EXPERIMENTS[experimentKey];
  if (!exp) return null;
  const buckets = readBuckets();
  if (buckets[experimentKey]) return buckets[experimentKey];
  const variant = pickWeighted(exp.variants, exp.weights);
  buckets[experimentKey] = variant;
  buckets[`${experimentKey}_assignedAt`] = new Date().toISOString();
  writeBuckets(buckets);
  // Record exposure event
  recordEvent("exposure", experimentKey, variant);
  return variant;
}

/**
 * Record an event for an experiment (e.g. "click_cta", "checkout_started", "purchase").
 */
export function recordEvent(eventName, experimentKey, variant, meta = {}) {
  const events = readEvents();
  events.push({
    event: eventName,
    experiment: experimentKey,
    variant: variant || readBuckets()[experimentKey],
    ts: new Date().toISOString(),
    ...meta,
  });
  writeEvents(events);
}

/**
 * Convenience: track a conversion against the user's current variant
 * for an experiment.
 */
export function trackConversion(experimentKey, value = 1, meta = {}) {
  const variant = readBuckets()[experimentKey];
  if (!variant) return;
  recordEvent("conversion", experimentKey, variant, { value, ...meta });
}

/**
 * Get all events grouped for analysis (admin view).
 */
export function summarizeEvents() {
  const events = readEvents();
  const byExp = {};
  events.forEach((e) => {
    const exp = e.experiment;
    if (!byExp[exp]) byExp[exp] = {};
    if (!byExp[exp][e.variant]) byExp[exp][e.variant] = { exposures: 0, conversions: 0, value: 0 };
    if (e.event === "exposure") byExp[exp][e.variant].exposures++;
    if (e.event === "conversion") {
      byExp[exp][e.variant].conversions++;
      byExp[exp][e.variant].value += Number(e.value || 0);
    }
  });
  return byExp;
}
