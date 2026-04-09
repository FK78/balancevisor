'use server';

import { createClient } from '@/lib/supabase/server';

export interface MFAStatus {
  enabled: boolean;
  setupRequired: boolean;
  reminderDismissed: boolean;
  factors?: Array<{
    id: string;
    type: 'totp';
    friendly_name: string;
    created_at: string;
  }>;
}

export async function checkMfaStatus(): Promise<MFAStatus> {
  const supabase = await createClient();

  // Get user metadata from Supabase auth
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get MFA factors from Supabase
  const { data: factors, error } = await supabase.auth.mfa.listFactors();
  
  if (error) {
    // If MFA is not enabled or error, treat as no factors
    console.warn('Error fetching MFA factors:', error.message);
  }

  const mfaEnabled = !!(factors?.totp && factors.totp.length > 0);
  const metadata = user.user_metadata || {};
  
  return {
    enabled: mfaEnabled,
    setupRequired: metadata.mfa_setup_required === true,
    reminderDismissed: metadata.mfa_reminder_dismissed === true,
    factors: factors?.totp?.map(factor => ({
      id: factor.id,
      type: 'totp' as const,
      friendly_name: factor.friendly_name || 'Authenticator App',
      created_at: factor.created_at,
    })) || [],
  };
}

export async function dismissMfaReminder(): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const metadata = user.user_metadata || {};
  
  await supabase.auth.updateUser({
    data: {
      ...metadata,
      mfa_reminder_dismissed: true,
    },
  });
}

export async function markMfaSetupRequired(): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const metadata = user.user_metadata || {};
  
  await supabase.auth.updateUser({
    data: {
      ...metadata,
      mfa_setup_required: true,
    },
  });
}