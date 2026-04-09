import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/lib/truelayer';
import { saveTrueLayerConnection, importFromTrueLayer } from '@/db/mutations/truelayer';
import { getCurrentUserId } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getPostHogClient } from '@/lib/posthog-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

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
    const tokens = await exchangeCode(code);

    await saveTrueLayerConnection(userId, tokens);

    // Auto-import accounts & transactions immediately after connecting
    try {
      await importFromTrueLayer();
    } catch {
      // Non-critical: user can manually import later
    }

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: 'bank_connection_completed',
      properties: { source: 'truelayer_oauth' },
    });

    const response = NextResponse.redirect(
      `${siteUrl}/dashboard/accounts?truelayer_connected=true`,
    );
    // Clear the state cookie after successful use
    response.cookies.set('truelayer_oauth_state', '', { maxAge: 0, path: '/api/truelayer/callback' });
    return response;
  } catch (err) {
    logger.error('truelayer.callback', 'OAuth callback failed', err);
    return redirectWithError('Failed to connect bank. Please try again.');
  }
}
