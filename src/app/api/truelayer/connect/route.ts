import { NextResponse } from 'next/server';
import { buildAuthLink, generateOAuthState } from '@/lib/truelayer';

export async function GET() {
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
