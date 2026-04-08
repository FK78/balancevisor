'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserId } from '@/lib/auth';
import { rateLimiters } from '@/lib/rate-limiter';
import { getUserDb } from '@/db/rls-context';
import { mfaBackupCodesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface DisableMfaResult {
  success: boolean;
  error?: string;
}

export async function disableMfa(password: string): Promise<DisableMfaResult> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  // Get user email first
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return {
      success: false,
      error: 'User not found',
    };
  }

  // Verify password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (signInError) {
    return {
      success: false,
      error: 'Invalid password. Please try again.',
    };
  }

  try {
    // Get all MFA factors
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totpFactors = factors?.totp || [];

    // Unenroll all TOTP factors
    for (const factor of totpFactors) {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: factor.id,
      });

      if (unenrollError) {
        console.error(`Error unenrolling factor ${factor.id}:`, unenrollError);
        // Continue with other factors even if one fails
      }
    }

    // Delete all backup codes for the user
    const userDb = await getUserDb(userId);
    await userDb.delete(mfaBackupCodesTable).where(eq(mfaBackupCodesTable.user_id, userId));

    // Update user metadata
    const metadata = user.user_metadata || {};
    await supabase.auth.updateUser({
      data: {
        ...metadata,
        mfa_enabled: false,
        mfa_setup_required: false,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error disabling MFA:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to disable MFA',
    };
  }
}