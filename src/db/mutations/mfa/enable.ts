'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserId } from '@/lib/auth';
import { rateLimiters } from '@/lib/rate-limiter';
import { db } from '@/index';
import { mfaBackupCodesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';

export interface EnableMfaResult {
  success: boolean;
  backupCodes?: string[];
  error?: string;
}

export async function enableMfa(
  factorId: string,
  password: string,
  generateNewBackupCodes: boolean = false
): Promise<EnableMfaResult> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  // Verify password first
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: '', // We need to get user email first
    password,
  });

  if (signInError) {
    return {
      success: false,
      error: 'Invalid password. Please try again.',
    };
  }

  // Get user email
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return {
      success: false,
      error: 'User not found',
    };
  }

  // Re-authenticate with email
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (reauthError) {
    return {
      success: false,
      error: 'Invalid password. Please try again.',
    };
  }

  try {
    // Get current MFA factors to check if already enabled
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const alreadyEnabled = factors?.totp?.some(factor => factor.id === factorId);

    if (alreadyEnabled) {
      return {
        success: false,
        error: 'MFA is already enabled for this factor.',
      };
    }

    // Generate backup codes if requested or if user doesn't have any
    let backupCodes: string[] = [];
    if (generateNewBackupCodes) {
      // Delete existing backup codes
      await db.delete(mfaBackupCodesTable).where(eq(mfaBackupCodesTable.user_id, userId));

      // Generate new backup codes
      backupCodes = await generateBackupCodes();
      
      // Hash and store backup codes
      const codeHashes = backupCodes.map(code => ({
        user_id: userId,
        code_hash: hashBackupCode(code),
        used: false,
      }));

      if (codeHashes.length > 0) {
        await db.insert(mfaBackupCodesTable).values(codeHashes);
      }
    }

    // Update user metadata to indicate MFA is enabled
    const metadata = user.user_metadata || {};
    await supabase.auth.updateUser({
      data: {
        ...metadata,
        mfa_enabled: true,
        mfa_setup_required: false,
        mfa_reminder_dismissed: true,
      },
    });

    return {
      success: true,
      backupCodes,
    };
  } catch (error) {
    console.error('Error enabling MFA:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enable MFA',
    };
  }
}

// Helper functions (also exported from setup.ts, but duplicated here for convenience)
export async function generateBackupCodes(count: number = 10): Promise<string[]> {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes, uppercase
    const code = crypto.randomBytes(6).toString('hex').toUpperCase().slice(0, 8);
    codes.push(code);
  }
  return codes;
}

function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}