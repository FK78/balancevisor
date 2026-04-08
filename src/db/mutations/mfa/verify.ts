'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserId } from '@/lib/auth';
import { rateLimiters } from '@/lib/rate-limiter';
import { generate, verify } from 'otplib';

export interface VerifyMfaSetupResult {
  success: boolean;
  factorId?: string;
  error?: string;
}

export async function verifyMfaSetup(
  factorId: string,
  token: string,
  secret: string
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
    // Verify the TOTP token
    const verificationResult = await verify({
      secret,
      token,
      epochTolerance: 1, // Allow 1 step before/after for clock drift
    });

    if (!verificationResult.valid) {
      return {
        success: false,
        error: 'Invalid verification code. Please try again.',
      };
    }

    // Create a challenge for the factor (required for verification)
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError) {
      console.error('Error creating MFA challenge:', challengeError);
      return {
        success: false,
        error: `Failed to start MFA verification: ${challengeError.message}`,
      };
    }

    // Verify the factor with Supabase using the challenge
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: token,
    });

    if (verifyError) {
      console.error('Error verifying MFA factor with Supabase:', verifyError);
      return {
        success: false,
        error: `Failed to verify MFA: ${verifyError.message}`,
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
        error: `Failed to start MFA verification: ${challengeError.message}`,
      };
    }

    // Verify the token with Supabase
    const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: token,
    });

    if (verifyError) {
      console.error('Error verifying MFA login:', verifyError);
      return {
        success: false,
        error: `Invalid verification code: ${verifyError.message}`,
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