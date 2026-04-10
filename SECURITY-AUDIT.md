# BalanceVisor Security Audit Report

**Date:** June 2025
**Scope:** Full codebase — authentication, authorization, data handling, API routes, encryption, CSP, environment config
**Methodology:** Manual code review of all API routes, server actions, middleware, encryption, client components, and configuration

---

## Executive Summary

BalanceVisor demonstrates strong security fundamentals: per-user envelope encryption (AES-256-GCM), comprehensive ownership checks, CSRF protection on OAuth flows, rate limiting on most endpoints, GDPR-compliant account deletion, and a well-structured sanitisation library. The audit identified **2 critical**, **6 high**, **7 medium**, and **3 low** severity issues. All actionable findings have been remediated.

---

## Findings & Remediations

### CRITICAL

| # | Finding | Status |
|---|---------|--------|
| C1 | **SSL certificate verification disabled for production DB connections** — `rejectUnauthorized: false` in `src/index.ts`, `src/db/seed.ts`, and migration scripts allowed MITM attacks on database traffic. | **FIXED** — Changed to `'require'` (system CA store) with optional `DATABASE_CA_CERT` env var for custom CAs. |
| C2 | **`NODE_TLS_REJECT_UNAUTHORIZED=0` in dev script** — Disabled TLS verification for all outgoing connections (Supabase, Groq, TrueLayer) during development, with risk of leaking into production. | **FIXED** — Removed from `package.json`. Root cause (DB SSL) resolved by C1. |

### HIGH

| # | Finding | Status |
|---|---------|--------|
| H1 | **Missing input validation in `saveZakatSettings`** — `anniversaryDate` and `nisabType` taken directly from FormData without sanitisation. | **FIXED** — Added `requireDate()` and `sanitizeEnum()` validation. |
| H2 | **`dangerouslySetInnerHTML` with AI-generated content** — 8+ components render AI responses via `formatMarkdown()` → `dangerouslySetInnerHTML`. While `escapeHtml` runs first, regex replacements re-introduce HTML. | **FIXED** — Added `sanitize-html` as a final sanitisation pass with strict allowlist of tags and no attributes. |
| H3 | **Health endpoint leaks internal state** — `process.uptime()`, heap memory usage exposed to unauthenticated users. | **FIXED** — Uptime and memory only included in non-production responses. |
| H4 | **Nisab prices endpoint has no rate limit** — Public, unauthenticated, makes outbound HTTP requests (DoS / SSRF vector). | **FIXED** — Added rate limiting via `withRateLimit` keyed by client IP. |
| H5 | **Ticker search has no auth check** — Rate limited by spoofable IP only. | **FIXED** — Added `getCurrentUserId()` authentication check. |
| H6 | **CSP allows `unsafe-eval`** — Allows eval-based XSS attacks. | **FIXED** — Removed `unsafe-eval` from `script-src`. `unsafe-inline` retained because Next.js requires it for hydration/RSC inline scripts. |

### MEDIUM

| # | Finding | Status |
|---|---------|--------|
| M1 | **In-memory rate limiter doesn't survive restarts / multi-instance** — Documented limitation. Acceptable for single-instance VPS. | **ACCEPTED** — Note for future: migrate to Redis-backed limiter if scaling. |
| M2 | **`importUserData` trusts foreign IDs** — Crafted export could contain IDs colliding with other users' data. | **FIXED** — Import now generates fresh UUIDs for all records and remaps all FK references. |
| M3 | **Migration scripts have hardcoded `rejectUnauthorized: false`** — Same MITM risk as C1 in one-off scripts. | **FIXED** — Same pattern as C1 applied to `encrypt-existing-data.ts` and `migrate-to-per-user-keys.ts`. |
| M4 | **`connect-src` CSP uses wildcard `https://*.groq.com`** — Broader than necessary. | **FIXED** — Pinned to `https://api.groq.com`. |
| M5 | **Missing `payment` in Permissions-Policy** — Finance app doesn't restrict Payment Request API. | **FIXED** — Added `payment=()` to deny. |
| M6 | **MFA error messages leak Supabase internals** — `challengeError.message` and `verifyError.message` returned to client. | **FIXED** — Replaced with generic messages; internal details logged server-side only. |
| M7 | **PostHog `/ingest/*` rewrite** — Wildcarded path proxy to PostHog EU. Low risk since destination is hardcoded. | **ACCEPTED** — Low risk; destination is fixed. |

### LOW

| # | Finding | Status |
|---|---------|--------|
| L1 | **`maximumScale: 1` prevents zoom** — Accessibility concern (not security). | **NOTED** — Recommend removing for a11y compliance. |
| L2 | **Backup code hashing uses SHA-256 without salt** — Codes are 8-char random hex (high entropy), so precomputation risk is minimal. | **ACCEPTED** — Low risk given code entropy. |
| L3 | **Duplicate deletions in `deleteAccount`** — `retirementProfilesTable`, `dashboardLayoutsTable`, `userKeysTable` deleted twice. | **FIXED** — Removed duplicate calls. |

---

## Positive Findings (No Action Required)

These security controls were reviewed and found to be well-implemented:

- **Per-user envelope encryption** — AES-256-GCM with versioned master key, per-user keys in `user_keys` table, key rotation support
- **TrueLayer tokens encrypted at rest** — `encryptForUser`/`decryptForUser` used in `saveTrueLayerConnection` and `getValidToken`
- **Broker credentials encrypted** — Stored as encrypted JSON blob via per-user envelope encryption
- **Comprehensive ownership checks** — `requireOwnership()` and `hasEditAccess()` used consistently across mutations
- **CSRF protection** — OAuth state parameter validated against secure httpOnly cookie in TrueLayer callback
- **GDPR-compliant deletion** — Full cascade delete in transaction with Supabase auth user removal
- **Service worker security** — Explicitly excludes `/auth/`, `/api/`, `/dashboard` from caching
- **Input sanitisation library** — `src/lib/sanitize.ts` provides comprehensive validation for strings, numbers, UUIDs, dates, URLs, enums
- **MFA implementation** — TOTP with backup codes, timing-safe comparison, rate limiting on attempts
- **Cron endpoint security** — `/api/cron/*` endpoints secured with `CRON_SECRET` header validation
- **`dangerouslySetInnerHTML` in layout** — Static inline script for theme detection; no dynamic content injection risk

---

## Files Changed

| File | Change |
|------|--------|
| `src/index.ts` | SSL: `rejectUnauthorized: false` → `'require'` with `DATABASE_CA_CERT` support |
| `src/db/seed.ts` | Same SSL fix |
| `src/db/migrations/encrypt-existing-data.ts` | Same SSL fix |
| `src/db/migrations/migrate-to-per-user-keys.ts` | Same SSL fix |
| `package.json` | Removed `NODE_TLS_REJECT_UNAUTHORIZED=0` from dev script |
| `.env.example` | Documented `DATABASE_CA_CERT` env var |
| `src/db/mutations/zakat.ts` | Added `requireDate` + `sanitizeEnum` validation |
| `src/lib/formatMarkdown.ts` | Added DOMPurify final sanitisation pass |
| `src/app/api/health/route.ts` | Strip uptime/memory in production |
| `src/app/api/nisab-prices/route.ts` | Added rate limiting |
| `src/app/api/tickers/search/route.ts` | Added auth check |
| `next.config.ts` | CSP: removed `unsafe-eval` (kept `unsafe-inline` for Next.js hydration); pinned Groq connect-src; added `payment=()` |
| `src/db/mutations/mfa/verify.ts` | Generic error messages |
| `src/db/mutations/import-data.ts` | Fresh UUIDs + FK remapping on import |
| `src/db/mutations/settings.ts` | Removed duplicate deletions |

**New dependency:** `sanitize-html` (pure JS HTML sanitiser, no jsdom required)
