import { NextRequest, NextResponse } from 'next/server';
import { buildAuthLink, generateOAuthState, generatePkceChallenge } from '@/lib/truelayer';
import { getCurrentUserId } from '@/lib/auth';
import { rateLimiters } from '@/lib/rate-limiter';
import { env } from '@/lib/env';

export async function GET(request: NextRequest) {
  // Rate limit by user ID (authenticated route)
  const userId = await getCurrentUserId();
  const result = rateLimiters.truelayer.consume(`truelayer-connect:${userId}`);

  if (!result.allowed) {
    const siteUrl = env().NEXT_PUBLIC_SITE_URL;
    return NextResponse.redirect(
      `${siteUrl}/dashboard/accounts?truelayer_error=Too many connection attempts. Please try again later.`,
    );
  }

  // Generate a cryptographically random state value for CSRF protection
  const state = generateOAuthState();

  // Generate PKCE challenge to prevent authorization code interception
  const pkce = generatePkceChallenge();

  // Store state in a secure, httpOnly cookie for validation on callback
  const response = NextResponse.redirect(buildAuthLink(state, pkce.code_challenge));
  response.cookies.set('truelayer_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes — OAuth flow should complete quickly
    path: '/api/truelayer/callback',
  });

  // Store PKCE code_verifier for token exchange on callback
  response.cookies.set('truelayer_pkce_verifier', pkce.code_verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/api/truelayer/callback',
  });

  // If connecting from onboarding, store the return path so the callback
  // redirects back to onboarding instead of the dashboard accounts page.
  const returnTo = new URL(request.url).searchParams.get('return_to');
  if (returnTo === 'onboarding') {
    response.cookies.set('truelayer_return_to', 'onboarding', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/api/truelayer/callback',
    });
  }

  return response;
}
