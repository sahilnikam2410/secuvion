/**
 * Lightweight error reporter — works as a Sentry adapter via direct HTTP
 * to Sentry's public envelope endpoint when `VITE_SENTRY_DSN` is set.
 * No SDK dependency, zero bundle cost when DSN is unset.
 *
 * Enable in production:
 *   1. Create a free Sentry project at https://sentry.io
 *   2. Copy the project DSN (format: https://PUBLIC_KEY@oXXX.ingest.sentry.io/PROJECT_ID)
 *   3. In Vercel, add env var: VITE_SENTRY_DSN = <your DSN>
 *   4. Redeploy
 *
 * Locally it is a no-op unless VITE_SENTRY_DEBUG=true.
 */

const DSN = import.meta.env.VITE_SENTRY_DSN || "";
const DEBUG = import.meta.env.VITE_SENTRY_DEBUG === "true";
const ENV = import.meta.env.MODE || "production";
const RELEASE = import.meta.env.VITE_APP_VERSION || "unknown";

function parseDsn(dsn) {
  try {
    const m = dsn.match(/^https?:\/\/([^@]+)@([^/]+)\/(.+)$/);
    if (!m) return null;
    const [, publicKey, host, projectId] = m;
    return {
      publicKey,
      host,
      projectId,
      endpoint: `https://${host}/api/${projectId}/envelope/`,
    };
  } catch {
    return null;
  }
}

const parsed = DSN ? parseDsn(DSN) : null;

function isEnabled() {
  if (!parsed) return false;
  // Don't send from localhost unless explicitly debugging.
  if (typeof window !== "undefined" && /localhost|127\.0\.0\.1/.test(window.location.hostname) && !DEBUG) {
    return false;
  }
  return true;
}

let userContext = null;
let flushQueue = [];
let flushing = false;

export function setUser(user) {
  userContext = user ? { id: user.uid, email: user.email, username: user.name } : null;
}

function buildEvent(error, extra = {}) {
  const now = new Date().toISOString();
  const isError = error instanceof Error;
  return {
    event_id: (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).replace(/-/g, ""),
    timestamp: now,
    platform: "javascript",
    level: extra.level || "error",
    environment: ENV,
    release: RELEASE,
    exception: isError
      ? {
          values: [
            {
              type: error.name || "Error",
              value: error.message || String(error),
              stacktrace: error.stack
                ? {
                    frames: parseStack(error.stack),
                  }
                : undefined,
            },
          ],
        }
      : undefined,
    message: !isError ? { formatted: String(error) } : undefined,
    user: userContext || undefined,
    request:
      typeof window !== "undefined"
        ? {
            url: window.location.href,
            headers: { "User-Agent": navigator.userAgent },
          }
        : undefined,
    tags: extra.tags || {},
    extra: extra.extra || {},
  };
}

function parseStack(stack) {
  return stack
    .split("\n")
    .slice(1)
    .map((line) => {
      const m = line.match(/at (?:(.+?) )?\(?(.+?):(\d+):(\d+)\)?/);
      if (!m) return { function: line.trim() };
      return {
        function: m[1] || "<anonymous>",
        filename: m[2],
        lineno: parseInt(m[3], 10),
        colno: parseInt(m[4], 10),
      };
    })
    .reverse()
    .slice(0, 50);
}

async function flush() {
  if (flushing || flushQueue.length === 0 || !parsed) return;
  flushing = true;
  const event = flushQueue.shift();
  const envelopeHeader = {
    event_id: event.event_id,
    sent_at: new Date().toISOString(),
    sdk: { name: "vrikaan.errorReporter", version: "1.0.0" },
  };
  const itemHeader = { type: "event" };
  const body = [
    JSON.stringify(envelopeHeader),
    JSON.stringify(itemHeader),
    JSON.stringify(event),
  ].join("\n");

  try {
    await fetch(parsed.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${parsed.publicKey}, sentry_client=vrikaan.errorReporter/1.0`,
      },
      body,
      keepalive: true,
    });
  } catch (e) {
    if (DEBUG) console.warn("[errorReporter] send failed:", e);
  } finally {
    flushing = false;
    if (flushQueue.length > 0) flush();
  }
}

export function captureException(error, extra) {
  if (DEBUG) console.error("[errorReporter]", error, extra);
  if (!isEnabled()) return;
  flushQueue.push(buildEvent(error, extra));
  flush();
}

export function captureMessage(message, level = "info", extra) {
  if (DEBUG) console.log(`[errorReporter:${level}]`, message, extra);
  if (!isEnabled()) return;
  flushQueue.push(buildEvent(message, { level, ...extra }));
  flush();
}

/**
 * Install global handlers for window errors + unhandled promise rejections.
 * Call once in main.jsx.
 */
export function installGlobalHandlers() {
  if (typeof window === "undefined") return;
  window.addEventListener("error", (e) => {
    captureException(e.error || new Error(e.message), {
      tags: { source: "window.error" },
      extra: { filename: e.filename, lineno: e.lineno, colno: e.colno },
    });
  });
  window.addEventListener("unhandledrejection", (e) => {
    captureException(e.reason instanceof Error ? e.reason : new Error(String(e.reason)), {
      tags: { source: "unhandledrejection" },
    });
  });
}
