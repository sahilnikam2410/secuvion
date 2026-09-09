# VRIKAAN

AI-powered cyber defence platform — phishing and scam detection, breach and
dark-web exposure checks, and real-time monitoring for people who are not
security professionals.

Live at **https://vrikaan.com**.

Founder and security lead. Recognised in *The Cyber 50 — India's Elite
Founders List* by Indian Startup Times.

## What it does

- **Scan a URL** before opening it, and explain the verdict in plain language.
- **Check exposure** — whether an address appears in known breach data.
- **Inspect a certificate** and the transport a site is actually using.
- **Identity X-Ray** — what is publicly discoverable about a person.
- **Digest and alerts** — scheduled checks rather than one-off lookups.

The point is the explanation. A verdict a non-technical person cannot act on
is not protection, so classification output is written back into language
before it reaches them.

## Stack

| Layer | Provider |
|---|---|
| Frontend | Vercel — React 19, Vite 7 |
| API | Vercel serverless functions (`api/*.js`) |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Payments | Cashfree |
| AI | Google Gemini |
| Errors | Sentry |
| Analytics | Vercel Analytics and Speed Insights |

## Security decisions worth naming

**The secret boundary is enforced by naming.** Anything prefixed `VITE_` is
compiled into the browser bundle and is treated as public. Everything else —
the Cashfree secret, the Gemini key, the Firebase admin private key — is
server-only and never reaches the client. This is written down in the runbook
rather than left to whoever deploys next to work out.

**Payments are verified server-side, twice.** `create-checkout-session.js`
opens the session, `cashfree-webhook.js` receives the callback and
`verify-payment.js` confirms it independently. A client claiming it paid is
not evidence that it did.

**Abuse controls are first-class.** `_rateLimit.js` and `_quota.js` sit in
front of the scanning endpoints. A URL scanner with no rate limit is a free
proxy for someone else's reconnaissance.

**Backups run on a schedule** — `.github/workflows/backup.yml` — rather than
on the day someone remembers.

## Operations

`PRODUCTION_RUNBOOK.md` carries deployment, the full environment variable
inventory split by exposure, and recovery steps. It is written for the person
on call at the time, which may be someone who has not seen the codebase.

## Repository layout

```
api/        serverless functions — scanning, payments, cron, rate limiting
desktop/    desktop build
brand_assets/
.github/    backup, desktop build, promotion workflows
```

## Scope

This repository is the product. It is not a security-research repository and
contains no offensive tooling.
