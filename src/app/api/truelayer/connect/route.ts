import { NextResponse } from 'next/server';
import { buildAuthLink, generateOAuthState } from '@/lib/truelayer';
import { getCurrentUserId } from '@/lib/auth';
import { rateLimiters } from '@/lib/rate-limiter';

export async function GET() {
  // Rate limit by user ID (authenticated route)
  const userId = await getCurrentUserId();
  const result = rateLimiters.truelayer.consume(`truelayer-connect:${userId}`);

  if (!result.allowed) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    return NextResponse.redirect(
      `${siteUrl}/dashboard/accounts?truelayer_error=Too many connection attempts. Please try again later.`,
    );
  }

  // Generate a cryptographically random state value for CSRF protection
  const state = generateOAuthState();

  // Store state in a secure, httpOnly cookie for validation on callback
  const response = NextResponse.redirect(buildAuthLink(state));
  response.cookies.set('truelayer_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes — OAuth flow should complete quickly
    path: '/api/truelayer/callback',
  });

  return response;
}
