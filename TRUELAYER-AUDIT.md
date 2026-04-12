# TrueLayer Integration Audit Report

**Date:** June 2025  
**Scope:** Performance, Security, Usability  
**Status:** All fixes implemented ✅

---

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/truelayer.ts` | M1 retry wrapper, M4 accountId validation, L4 PKCE support |
| `src/app/api/truelayer/connect/route.ts` | L4 PKCE code_verifier/challenge generation |
| `src/app/api/truelayer/callback/route.ts` | L4 PKCE verification, M3 error sanitisation |
| `src/db/mutations/truelayer.ts` | H1-H5, C1-C2, M2, L3, M5 re-export |
| `src/db/queries/truelayer.ts` | M5 getTrueLayerConnections moved here |
| `src/lib/trigger-ai-enrichment.ts` | L1 new shared helper |
| `src/components/BankSyncTrigger.tsx` | L1 shared helper, L2 setTimeout |
| `src/components/TrueLayerImportTrigger.tsx` | L1 shared helper |

---

## Findings & Fixes

### Critical / High Priority

| ID | Category | Issue | Fix |
|----|----------|-------|-----|
| H1 | Performance | N+1 query — `findMatchingExpense` called per transaction inside import loop | Pre-fetch up to 500 recent expenses per account, match in-memory |
| H2 | Security | `importFromTrueLayer` had no rate limiting — unbounded TrueLayer API calls | Added `rateLimiters.truelayer.consume()` check at function entry |
| H3 | Security | `disconnectTrueLayer` accepted unvalidated `connectionId` | UUID regex validation before any DB query |
| H4 | Performance | Token refreshed before **every** account within a connection | Single `getValidToken()` call per connection |
| H5 | Security | `getValidToken` accepted bare `connectionId` with no ownership check | Added `userId` parameter, WHERE clause includes `user_id` |
| C1 | Performance | Always fetched 730 days of transactions, even on hourly re-sync | Smart date window: 730d on first import, `last_synced_at - 2d` on re-sync |
| C2 | Performance | Transactions inserted one-by-one (N inserts per account) | Batch inserts in chunks of 100 |

### Medium Priority

| ID | Category | Issue | Fix |
|----|----------|-------|-----|
| M1 | Reliability | No retry on transient TrueLayer API failures (502/503/504, fetch failed) | `withRetry` wrapper with 2 retries + exponential backoff |
| M2 | Reliability | Sync lock was TOCTOU — read + write in separate queries | Atomic `UPDATE ... WHERE last_synced_at < threshold RETURNING` |
| M3 | Security | Raw TrueLayer error codes leaked to user via redirect URL | Error map translates codes to user-friendly messages |
| M4 | Security | `accountId`/`cardId` interpolated into URL path without validation | `assertSafeId()` rejects non-alphanumeric IDs |
| M5 | Code quality | `getTrueLayerConnections` (a read query) lived in mutations file | Moved to `src/db/queries/truelayer.ts`, re-exported for compat |

### Low Priority

| ID | Category | Issue | Fix |
|----|----------|-------|-----|
| L1 | Code quality | AI enrichment trigger duplicated in 2 components (~30 lines each) | Extracted to `src/lib/trigger-ai-enrichment.ts` |
| L2 | Reliability | `queueMicrotask` in BankSyncTrigger can fire before hydration completes | Replaced with `setTimeout(fn, 100)` |
| L3 | Usability | Skipped accounts during import were silently dropped | `importFromTrueLayer` now returns `skippedAccounts` array |
| L4 | Security | OAuth flow lacked PKCE — authorization code interception possible | Full PKCE (S256) with `code_verifier` cookie + `code_challenge` in auth URL |

---

## Verification

- **TypeScript:** `npx tsc --noEmit` — 0 errors
- **ESLint:** All modified files lint clean
- **Tests:** All existing tests pass (11 failures are pre-existing Storybook mock issues, unrelated)

---

## Architecture Notes

### Token Flow (After Fixes)
```
Connection → getValidToken(connId, userId)
           → ownership check (user_id WHERE clause)
           → decrypt with getUserKey(userId)
           → refresh if expired, persist new tokens
```

### Import Pipeline (After Fixes)
```
importFromTrueLayer()
  ├─ Rate limit check (H2)
  ├─ Per-connection: getValidToken ONCE (H4)
  ├─ Smart date window per connection (C1)
  ├─ Per-account:
  │    ├─ Pre-fetch expenses for refund matching (H1)
  │    ├─ Build transaction batch in memory
  │    └─ Insert batch in chunks of 100 (C2)
  └─ Return { ..., skippedAccounts } (L3)
```

### OAuth Flow (After Fixes)
```
/connect → generate PKCE (code_verifier, code_challenge)
         → store code_verifier in httpOnly cookie
         → redirect to TrueLayer with code_challenge + S256

/callback → validate state cookie (CSRF)
          → read code_verifier cookie
          → exchangeCode(code, codeVerifier) with PKCE
          → sanitise errors via mapTruelayerError (M3)
          → clear all cookies
```
