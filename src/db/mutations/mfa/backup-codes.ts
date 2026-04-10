'use server';

import { db } from '@/index';
import { mfaBackupCodesTable } from '@/db/schema';
import { getCurrentUserId } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import * as crypto from 'crypto';

export interface BackupCodeInfo {
  id: string;
  used: boolean;
  used_at?: string;
  created_at: string;
}

export interface UseBackupCodeResult {
  success: boolean;
  error?: string;
  codeId?: string;
}

export async function getBackupCodes(): Promise<BackupCodeInfo[]> {
  const userId = await getCurrentUserId();

  const codes = await db.select({
    id: mfaBackupCodesTable.id,
    used: mfaBackupCodesTable.used,
    used_at: mfaBackupCodesTable.used_at,
    created_at: mfaBackupCodesTable.created_at,
  })
    .from(mfaBackupCodesTable)
    .where(eq(mfaBackupCodesTable.user_id, userId))
    .orderBy(mfaBackupCodesTable.created_at);

  return codes.map(code => ({
    ...code,
    used_at: code.used_at?.toISOString(),
    created_at: code.created_at.toISOString(),
  }));
}

export async function useBackupCode(code: string): Promise<UseBackupCodeResult> {
  const userId = await getCurrentUserId();

  // Hash the provided code
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');

  // Atomic: UPDATE only if unused, RETURNING the id — prevents double-spend
  const [used] = await db.update(mfaBackupCodesTable)
    .set({
      used: true,
      used_at: new Date(),
    })
    .where(
      and(
        eq(mfaBackupCodesTable.user_id, userId),
        eq(mfaBackupCodesTable.code_hash, codeHash),
        eq(mfaBackupCodesTable.used, false),
      )
    )
    .returning({ id: mfaBackupCodesTable.id });

  if (!used) {
    return {
      success: false,
      error: 'Invalid or already used backup code.',
    };
  }

  return {
    success: true,
    codeId: used.id,
  };
}

export async function regenerateBackupCodes(): Promise<string[]> {
  const userId = await getCurrentUserId();

  // Generate new backup codes
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(6).toString('hex').toUpperCase().slice(0, 8);
    codes.push(code);
  }

  const codeHashes = codes.map(code => ({
    user_id: userId,
    code_hash: crypto.createHash('sha256').update(code).digest('hex'),
    used: false,
  }));

  // Atomic delete + insert to prevent concurrent useBackupCode from racing
  await db.transaction(async (tx) => {
    await tx.delete(mfaBackupCodesTable).where(eq(mfaBackupCodesTable.user_id, userId));
    if (codeHashes.length > 0) {
      await tx.insert(mfaBackupCodesTable).values(codeHashes);
    }
  });

  return codes;
}