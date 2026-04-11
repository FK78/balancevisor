import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/lib/truelayer';
import { saveTrueLayerConnection, getTrueLayerConnections } from '@/db/mutations/truelayer';
import { getCurrentUserId } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getPostHogClient } from '@/lib/posthog-server';
import { env } from '@/lib/env';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  const siteUrl = env().NEXT_PUBLIC_SITE_URL;

  // Validate OAuth state parameter to prevent CSRF attacks
  const cookieState = request.cookies.get('truelayer_oauth_state')?.value;

  // Create response builder (we'll set/clear cookies on it)
  const redirectWithError = (msg: string) => {
    const response = NextResponse.redirect(
      `${siteUrl}/dashboard/accounts?truelayer_error=${encodeURIComponent(msg)}`,
    );
    // Clear the state cookie after use
    response.cookies.set('truelayer_oauth_state', '', { maxAge: 0, path: '/api/truelayer/callback' });
    return response;
  };

  if (error || !code) {
    const msg = error ?? 'Missing authorization code';
    return redirectWithError(msg);
  }

  // Verify state matches (CSRF protection)
  if (!state || !cookieState || state !== cookieState) {
    return redirectWithError('Invalid state parameter. Possible CSRF attack.');
  }

  try {
    const userId = await getCurrentUserId();

    let exchangeSucceeded = false;
    try {
      const tokens = await exchangeCode(code);
      await saveTrueLayerConnection(userId, tokens);
      exchangeSucceeded = true;
    } catch (exchangeErr) {
      // invalid_grant usually means the code was already exchanged by a
      // concurrent request (browser double-fires the redirect). If the user
      // already has a connection, treat this as success.
      const isInvalidGrant =
        exchangeErr instanceof Error && exchangeErr.message.includes('invalid_grant');

      if (isInvalidGrant) {
        const existing = await getTrueLayerConnections();
        if (existing.length > 0) {
          logger.info('truelayer.callback', 'Duplicate callback — connection already exists, treating as success');
          exchangeSucceeded = true;
        }
      }

      if (!exchangeSucceeded) {
        throw exchangeErr;
      }
    }

    // Import is now triggered client-side via TrueLayerImportTrigger to avoid
    // blocking this redirect (which caused white-screen waits of 30s+).

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: 'bank_connection_completed',
      properties: { source: 'truelayer_oauth' },
    });

    // If connecting from onboarding, redirect back there instead of dashboard
    const returnTo = request.cookies.get('truelayer_return_to')?.value;
    const successUrl = returnTo === 'onboarding'
      ? `${siteUrl}/onboarding?stage=setup&method=auto&truelayer_connected=true&import_pending=true`
      : `${siteUrl}/dashboard/accounts?truelayer_connected=true&import_pending=true`;

    const response = NextResponse.redirect(successUrl);
    // Clear cookies after use
    response.cookies.set('truelayer_oauth_state', '', { maxAge: 0, path: '/api/truelayer/callback' });
    response.cookies.set('truelayer_return_to', '', { maxAge: 0, path: '/api/truelayer/callback' });
    return response;
  } catch (err) {
    logger.error('truelayer.callback', 'OAuth callback failed', err);
    return redirectWithError('Failed to connect bank. Please try again.');
  }
}
