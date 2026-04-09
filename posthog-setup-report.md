<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Wealth app (Next.js 16.2.3, App Router). PostHog is initialized client-side via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), with a reverse proxy configured in `next.config.ts` to route analytics traffic through `/ingest`. A server-side PostHog client (`src/lib/posthog-server.ts`) handles event capture from API routes. Users are identified on login and signup using their Supabase user ID as the distinct ID, enabling correlation of client and server events.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User completes sign-up; calls `posthog.identify()` with Supabase user ID | `src/components/SignUpForm.tsx` |
| `user_logged_in` | User logs in; calls `posthog.identify()` with Supabase user ID | `src/components/LoginForm.tsx` |
| `user_logged_out` | User logs out; calls `posthog.reset()` to clear identity | `src/components/LogoutButton.tsx` |
| `bank_sync_completed` | Manual bank sync completes; captures `accounts_imported`, `transactions_imported` | `src/components/ConnectBankButton.tsx` |
| `bank_connection_completed` | Server-side: OAuth bank connection via TrueLayer succeeds | `src/app/api/truelayer/callback/route.ts` |
| `goal_contribution_added` | User adds funds to a savings goal; captures `goal_name`, `amount` | `src/components/ContributeGoalDialog.tsx` |
| `resource_shared` | User sends a share invitation; captures `resource_type`, `permission` | `src/components/ShareDialog.tsx` |
| `zakat_calculation_triggered` | User triggers Zakat calculation | `src/components/CalculateZakatButton.tsx` |
| `private_investment_added` | User adds a new private investment; captures `investment_type` | `src/components/AddPrivateInvestmentDialog.tsx` |
| `transactions_exported` | Server-side: CSV export; captures `start_date`, `end_date`, `row_count` | `src/app/dashboard/transactions/export/route.ts` |

## New files created

- `instrumentation-client.ts` — PostHog client-side initialization (Next.js 15.3+ pattern)
- `src/lib/posthog-server.ts` — Server-side PostHog client singleton

## Files modified

- `next.config.ts` — Added `/ingest` reverse proxy rewrites for EU PostHog host
- `src/components/LoginForm.tsx`
- `src/components/SignUpForm.tsx`
- `src/components/LogoutButton.tsx`
- `src/components/ConnectBankButton.tsx`
- `src/components/ContributeGoalDialog.tsx`
- `src/components/ShareDialog.tsx`
- `src/components/CalculateZakatButton.tsx`
- `src/components/AddPrivateInvestmentDialog.tsx`
- `src/app/api/truelayer/callback/route.ts`
- `src/app/dashboard/transactions/export/route.ts`

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/156487/dashboard/613372
- **Signup → Login Funnel**: https://eu.posthog.com/project/156487/insights/zbsHn4xH
- **Daily Active Users**: https://eu.posthog.com/project/156487/insights/GhhsckXp
- **Bank Connections & Syncs**: https://eu.posthog.com/project/156487/insights/fNSaO4sK
- **Feature Engagement Totals**: https://eu.posthog.com/project/156487/insights/10kVm3Bc
- **User Churn: Logouts Over Time**: https://eu.posthog.com/project/156487/insights/8E0hgkRq

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
