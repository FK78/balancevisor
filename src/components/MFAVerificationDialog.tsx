'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { verifyMfaLogin, useBackupCode as consumeBackupCode } from '@/db/mutations/mfa';
import { Loader2, AlertCircle, Key } from 'lucide-react';
import { toast } from 'sonner';

interface MFAVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  factorId: string;
  email: string;
  onSuccess: () => void;
  onUseBackupCode?: () => void;
}

export function MFAVerificationDialog({
  open,
  onOpenChange,
  factorId,
  email,
  onSuccess,
  onUseBackupCode,
}: MFAVerificationDialogProps) {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBackup, setUseBackup] = useState(false);

  const handleVerifyCode = async () => {
    if (!factorId) {
      setError('Authentication session expired. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyMfaLogin(factorId, verificationCode);
      
      if (result.success) {
        toast.success('Verification successful!');
        onSuccess();
        onOpenChange(false);
        router.refresh();
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseBackupCode = async () => {
    if (!backupCode.trim()) {
      setError('Please enter a backup code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await consumeBackupCode(backupCode.trim());
      
      if (result.success) {
        toast.success('Backup code accepted!');
        if (onUseBackupCode) {
          onUseBackupCode();
        }
        onSuccess();
        onOpenChange(false);
        router.refresh();
      } else {
        setError(result.error || 'Invalid backup code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to use backup code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    // Note: TOTP codes are time-based, so there's no "resend" in the traditional sense.
    // This is more for user reassurance.
    toast.info('Enter the current code from your authenticator app');
    setVerificationCode('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobileLayout="full-height" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication for {email}</DialogTitle>
          <DialogDescription>
            {useBackup 
              ? 'Enter one of your backup codes to sign in'
              : 'Enter the verification code from your authenticator app'
            }
          </DialogDescription>
        </DialogHeader>

        {!useBackup ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <div className="bg-primary/10 rounded-full p-4">
                <Key className="h-12 w-12 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-xl tracking-widest"
                maxLength={6}
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <DialogFooter mobileSticky className="flex-col gap-3 sm:flex-col sm:justify-stretch">
              <Button 
                onClick={handleVerifyCode} 
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Sign In'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setUseBackup(true)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Use a backup code instead
                </button>
                <span className="mx-2 text-muted-foreground">•</span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Need a new code?
                </button>
              </div>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Backup Code Notice</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Each backup code can only be used once. After use, it will be permanently invalidated.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-code">Backup Code</Label>
              <Input
                id="backup-code"
                placeholder="Enter 8-character backup code"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                className="text-center font-mono tracking-wider"
                maxLength={8}
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter one of your 8-character backup codes (letters and numbers only)
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <DialogFooter mobileSticky className="flex-col gap-3 sm:flex-col sm:justify-stretch">
              <Button 
                onClick={handleUseBackupCode} 
                disabled={isLoading || backupCode.length !== 8}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Use Backup Code'
                )}
              </Button>

              <Button 
                onClick={() => setUseBackup(false)} 
                variant="ghost"
                className="w-full"
              >
                Back to Authenticator Code
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
