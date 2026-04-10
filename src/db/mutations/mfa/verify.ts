'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserId } from '@/lib/auth';
import { rateLimiters } from '@/lib/rate-limiter';

export interface VerifyMfaSetupResult {
  success: boolean;
  factorId?: string;
  error?: string;
}

export async function verifyMfaSetup(
  factorId: string,
  token: string,
): Promise<VerifyMfaSetupResult> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  
  // Rate limiting for MFA verification attempts
  const rateLimitKey = `mfa-verify:${userId}`;
  const { allowed, retryAfter } = rateLimiters.auth.consume(rateLimitKey);
  if (!allowed) {
    return {
      success: false,
      error: `Too many verification attempts. Please try again in ${retryAfter} seconds.`,
    };
  }

  try {
    // Create a challenge for the factor and verify via Supabase.
    // Supabase holds the TOTP secret from enroll(), so it verifies the token
    // against the same secret the user scanned from the QR code.
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError) {
      console.error('Error creating MFA challenge:', challengeError);
      return {
        success: false,
        error: 'Failed to start MFA verification. Please try again.',
      };
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: token,
    });

    if (verifyError) {
      console.error('Error verifying MFA factor with Supabase:', verifyError);
      return {
        success: false,
        error: 'Invalid verification code. Please try again.',
      };
    }

    // Mark MFA setup as not required in user metadata
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const metadata = user.user_metadata || {};
      await supabase.auth.updateUser({
        data: {
          ...metadata,
          mfa_setup_required: false,
        },
      });
    }

    return {
      success: true,
      factorId,
    };
  } catch (error) {
    console.error('Error verifying MFA setup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify MFA setup',
    };
  }
}

export async function verifyMfaLogin(
  factorId: string,
  token: string
): Promise<VerifyMfaSetupResult> {
  const supabase = await createClient();
  
  // Rate limiting for login MFA attempts
  const rateLimitKey = `mfa-login:${factorId}`;
  const { allowed, retryAfter } = rateLimiters.auth.consume(rateLimitKey);
  if (!allowed) {
    return {
      success: false,
      error: `Too many login attempts. Please try again in ${retryAfter} seconds.`,
    };
  }

  try {
    // Get the MFA challenge (should be stored in session after initial auth)
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError) {
      console.error('Error getting MFA challenge:', challengeError);
      return {
        success: false,
        error: 'Failed to start MFA verification. Please try again.',
      };
    }

    // Verify the token with Supabase
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: token,
    });

    if (verifyError) {
      console.error('Error verifying MFA login:', verifyError);
      return {
        success: false,
        error: 'Invalid verification code. Please try again.',
      };
    }

    return {
      success: true,
      factorId,
    };
  } catch (error) {
    console.error('Error in MFA login verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify MFA login',
    };
  }
}