'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserId } from '@/lib/auth';
import { rateLimiters } from '@/lib/rate-limiter';
import * as crypto from 'crypto';

interface MFASetupData {
  qrCodeDataUrl: string;
  secret: string;
  factorId: string;
}

export async function generateMfaSetup(): Promise<MFASetupData> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  
  // Rate limiting for MFA setup attempts
  const rateLimitKey = `mfa-setup:${userId}`;
  const { allowed, retryAfter } = rateLimiters.auth.consume(rateLimitKey);
  if (!allowed) {
    throw new Error(`Too many MFA setup attempts. Please try again in ${retryAfter} seconds.`);
  }

  // Get user email for QR code label
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    throw new Error('User not authenticated or email not available');
  }

  // Enroll the factor with Supabase — use Supabase's secret and QR code
  // so that challenge/verify will work against the same secret the user scans.
  const { data: factor, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'Authenticator App',
    issuer: 'BalanceVisor',
  });

  if (error) {
    console.error('Error enrolling MFA factor:', error);
    throw new Error(`Failed to set up MFA: ${error.message}`);
  }

  return {
    qrCodeDataUrl: factor.totp.qr_code,
    secret: factor.totp.secret,
    factorId: factor.id,
  };
}

export async function generateBackupCodes(count: number = 10): Promise<string[]> {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes, uppercase
    const code = crypto.randomBytes(6).toString('hex').toUpperCase().slice(0, 8);
    codes.push(code);
  }
  return codes;
}

export async function hashBackupCode(code: string): Promise<string> {
  // Use SHA-256 for hashing backup codes (no salt needed as codes are random and high entropy)
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function verifyBackupCode(code: string, hash: string): Promise<boolean> {
  const computedHash = await hashBackupCode(code);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash, 'hex'),
    Buffer.from(hash, 'hex')
  );
}
