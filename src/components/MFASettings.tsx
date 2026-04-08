'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { checkMfaStatus, disableMfa, regenerateBackupCodes, getBackupCodes } from '@/db/mutations/mfa';
import { MFASetupWizard } from '@/components/MFASetupWizard';
import { Loader2, Shield, ShieldAlert, ShieldCheck, Key, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BackupCodeInfo {
  id: string;
  used: boolean;
  used_at?: string;
  created_at: string;
}

export function MFASettings() {
  const [mfaStatus, setMfaStatus] = useState<{
    enabled: boolean;
    setupRequired: boolean;
    reminderDismissed: boolean;
    factors?: Array<{ id: string; type: 'totp'; friendly_name: string; created_at: string }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [backupCodesDialogOpen, setBackupCodesDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);
  const [backupCodes, setBackupCodes] = useState<BackupCodeInfo[]>([]);
  const [isLoadingBackupCodes, setIsLoadingBackupCodes] = useState(false);
  const [isRegeneratingCodes, setIsRegeneratingCodes] = useState(false);

  useEffect(() => {
    loadMfaStatus();
  }, []);

  const loadMfaStatus = async () => {
    setIsLoading(true);
    try {
      const status = await checkMfaStatus();
      setMfaStatus(status);
      
      // Load backup codes if MFA is enabled
      if (status.enabled) {
        loadBackupCodes();
      }
    } catch (error) {
      console.error('Failed to load MFA status:', error);
      toast.error('Failed to load MFA settings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBackupCodes = async () => {
    setIsLoadingBackupCodes(true);
    try {
      const codes = await getBackupCodes();
      setBackupCodes(codes);
    } catch (error) {
      console.error('Failed to load backup codes:', error);
    } finally {
      setIsLoadingBackupCodes(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setIsDisabling(true);
    try {
      const result = await disableMfa(password);
      
      if (result.success) {
        toast.success('Two-factor authentication disabled');
        setDisableDialogOpen(false);
        setPassword('');
        await loadMfaStatus();
      } else {
        toast.error(result.error || 'Failed to disable MFA');
      }
    } catch (error) {
      toast.error('Failed to disable MFA');
      console.error(error);
    } finally {
      setIsDisabling(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setIsRegeneratingCodes(true);
    try {
      const newCodes = await regenerateBackupCodes();
      
      if (newCodes.length > 0) {
        toast.success('Backup codes regenerated');
        await loadBackupCodes();
        
        // Show new codes to user
        const content = `BalanceVisor Backup Codes\nGenerated: ${new Date().toLocaleDateString()}\n\n${newCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\nImportant: Store these codes in a safe place. Each code can only be used once.`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'balancevisor-backup-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error('Failed to regenerate backup codes');
      console.error(error);
    } finally {
      setIsRegeneratingCodes(false);
    }
  };

  const unusedBackupCodes = backupCodes.filter(code => !code.used).length;
  const totalBackupCodes = backupCodes.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mfaStatus?.enabled ? (
                <>
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
                    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Enabled</p>
                    <p className="text-sm text-muted-foreground">
                      Your account is protected with 2FA
                    </p>
                  </div>
                </>
              ) : mfaStatus?.setupRequired ? (
                <>
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-2">
                    <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium">Setup Recommended</p>
                    <p className="text-sm text-muted-foreground">
                      Enhance your account security
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-muted p-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Not Enabled</p>
                    <p className="text-sm text-muted-foreground">
                      Your account is not protected with 2FA
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {mfaStatus?.enabled ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                Protected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                Recommended
              </Badge>
            )}
          </div>

          {/* Backup Codes Status */}
          {mfaStatus?.enabled && (
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <Label className="text-sm font-medium">Backup Codes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={unusedBackupCodes > 3 ? 'outline' : 'destructive'}>
                    {unusedBackupCodes} of {totalBackupCodes} remaining
                  </Badge>
                </div>
              </div>
              
              {isLoadingBackupCodes ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-3">
                    Backup codes allow you to access your account if you lose your authenticator device.
                    {unusedBackupCodes <= 3 && (
                      <span className="text-destructive font-medium"> Generate new codes soon.</span>
                    )}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBackupCodesDialogOpen(true)}
                      disabled={isLoadingBackupCodes}
                    >
                      View Status
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerateBackupCodes}
                      disabled={isRegeneratingCodes || isLoadingBackupCodes}
                    >
                      {isRegeneratingCodes ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        'Regenerate All Codes'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!mfaStatus?.enabled ? (
              <Button onClick={() => setSetupWizardOpen(true)}>
                <Shield className="mr-2 h-4 w-4" />
                Set Up 2FA
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setBackupCodesDialogOpen(true)}>
                  <Key className="mr-2 h-4 w-4" />
                  Manage Backup Codes
                </Button>
                <Button variant="destructive" onClick={() => setDisableDialogOpen(true)}>
                  Disable 2FA
                </Button>
              </>
            )}
            
            {mfaStatus?.setupRequired && !mfaStatus.enabled && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">Security Recommendation</p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      We recommend enabling two-factor authentication to protect your financial data.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Wizard */}
      <MFASetupWizard
        open={setupWizardOpen}
        onOpenChange={setSetupWizardOpen}
        onSuccess={loadMfaStatus}
      />

      {/* Disable MFA Dialog */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              This will remove the extra security layer from your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Security Warning</p>
                  <p className="text-sm text-destructive/80 mt-1">
                    Disabling 2FA makes your account more vulnerable to unauthorized access.
                    Your backup codes will also be invalidated.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="disable-password">Confirm Your Password</Label>
              <Input
                id="disable-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Required to disable two-factor authentication
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleDisableMfa} 
                disabled={isDisabling || !password.trim()}
                variant="destructive"
                className="w-full"
              >
                {isDisabling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Disable 2FA'
                )}
              </Button>
              <Button 
                onClick={() => setDisableDialogOpen(false)} 
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={backupCodesDialogOpen} onOpenChange={setBackupCodesDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>
              Store these codes in a safe place. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">Backup Code Status</p>
                  <p className="text-sm text-muted-foreground">
                    {unusedBackupCodes} of {totalBackupCodes} codes remaining
                  </p>
                </div>
              </div>
              
              {isLoadingBackupCodes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Backup codes are securely hashed and cannot be displayed after initial generation.
                    If you need new codes, regenerate them below. The new codes will be downloaded automatically.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {backupCodes.map((code) => (
                      <div
                        key={code.id}
                        className={`text-sm p-2 rounded text-center ${
                          code.used
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        }`}
                      >
                        {code.used ? 'Used' : 'Available'}
                        {code.used && code.used_at && (
                          <span className="block text-xs text-destructive/70 mt-1">
                            {new Date(code.used_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {unusedBackupCodes <= 3 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">Low on Backup Codes</p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      You have {unusedBackupCodes} backup code{unusedBackupCodes !== 1 ? 's' : ''} remaining.
                      Consider regenerating new codes soon.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleRegenerateBackupCodes}
                disabled={isRegeneratingCodes}
                variant="outline"
                className="w-full"
              >
                {isRegeneratingCodes ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  'Regenerate All Codes'
                )}
              </Button>
              <Button 
                onClick={() => setBackupCodesDialogOpen(false)} 
                variant="ghost"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}