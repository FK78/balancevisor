'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { generateMfaSetup, verifyMfaSetup, enableMfa } from '@/db/mutations/mfa';
import { Loader2, CheckCircle, AlertCircle, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface MFASetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type SetupStep = 'welcome' | 'qr-scan' | 'verify' | 'backup-codes' | 'complete';

export function MFASetupWizard({ open, onOpenChange, onSuccess }: MFASetupWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [setupData, setSetupData] = useState<{
    qrCodeDataUrl: string;
    secret: string;
    factorId?: string;
  } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleStartSetup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateMfaSetup();
      setSetupData(data);
      setCurrentStep('qr-scan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start MFA setup');
      toast.error('Failed to start MFA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!setupData?.factorId || !setupData?.secret) {
      setError('Setup data missing. Please restart setup.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyMfaSetup(setupData.factorId, verificationCode);
      
      if (result.success) {
        setCurrentStep('backup-codes');
        setVerificationCode('');
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    if (!setupData?.factorId) {
      setError('Setup data missing. Please restart setup.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await enableMfa(setupData.factorId, password, true);
      
      if (result.success) {
        setBackupCodes(result.backupCodes || []);
        setCurrentStep('complete');
        toast.success('Two-factor authentication enabled successfully!');
      } else {
        setError(result.error || 'Failed to enable MFA');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipBackupCodes = async () => {
    if (!setupData?.factorId) {
      setError('Setup data missing. Please restart setup.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await enableMfa(setupData.factorId, password, false);
      
      if (result.success) {
        setCurrentStep('complete');
        toast.success('Two-factor authentication enabled successfully!');
      } else {
        setError(result.error || 'Failed to enable MFA');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onOpenChange(false);
    setCurrentStep('welcome');
    setSetupData(null);
    setBackupCodes([]);
    setVerificationCode('');
    setPassword('');
    setError(null);
    
    if (onSuccess) {
      onSuccess();
    }
    
    router.refresh();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadBackupCodes = () => {
    const content = `BalanceVisor Backup Codes\nGenerated: ${new Date().toLocaleDateString()}\n\n${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\nImportant: Store these codes in a safe place. Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'balancevisor-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="space-y-4">
            <CardDescription className="text-center">
              Two-factor authentication adds an extra layer of security to your account.
              After enabling, you&apos;ll need to enter a verification code from your
              authenticator app when signing in.
            </CardDescription>
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Enhanced Security</p>
                  <p className="text-sm text-muted-foreground">Protects your financial data even if your password is compromised</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Authenticator Apps</p>
                  <p className="text-sm text-muted-foreground">Works with Google Authenticator, Authy, Microsoft Authenticator, etc.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Backup Codes</p>
                  <p className="text-sm text-muted-foreground">You&apos;ll get recovery codes in case you lose access to your authenticator app</p>
                </div>
              </div>
            </div>
            <Button onClick={handleStartSetup} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing setup...
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </div>
        );

      case 'qr-scan':
        return (
          <div className="space-y-6">
            <CardDescription className="text-center">
              Scan this QR code with your authenticator app, or enter the secret key manually.
            </CardDescription>
            
            {setupData?.qrCodeDataUrl && (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={setupData.qrCodeDataUrl} 
                    alt="QR Code for authenticator app" 
                    className="w-48 h-48"
                  />
                </div>
                
                <div className="w-full space-y-2">
                  <Label htmlFor="secret-key">Manual Entry Secret Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secret-key"
                      value={setupData.secret}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(setupData.secret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use this key if you can&apos;t scan the QR code
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-xl tracking-widest"
                  maxLength={6}
                />
              </div>
              
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <Button onClick={handleVerifyCode} disabled={isLoading || verificationCode.length !== 6} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>
            </div>
          </div>
        );

      case 'backup-codes':
        return (
          <div className="space-y-6">
            <CardDescription className="text-center">
              Backup codes allow you to access your account if you lose your authenticator device.
              Store them in a safe place.
            </CardDescription>
            
            <div className="space-y-4">
              <Label htmlFor="password">Confirm Your Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Required to enable two-factor authentication
              </p>
            </div>
            
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <Button onClick={handleGenerateBackupCodes} disabled={isLoading || !password} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating backup codes...
                  </>
                ) : (
                  'Generate Backup Codes & Enable 2FA'
                )}
              </Button>
              <Button variant="outline" onClick={handleSkipBackupCodes} className="w-full">
                Skip Backup Codes (Not Recommended)
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Two-Factor Authentication Enabled!</h3>
                <p className="text-sm text-muted-foreground">
                  Your account is now protected with an extra layer of security
                </p>
              </div>
            </div>
            
            {backupCodes.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Backup Codes</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(backupCodes.join('\n'))}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadBackupCodes}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="bg-background rounded px-3 py-2 text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    ⚠️ Each code can be used only once. Store these in a safe place.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">No Backup Codes Generated</p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      You can generate backup codes later in your account settings if you lose access to your authenticator app.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Button onClick={handleComplete} className="w-full">
              Finish Setup
            </Button>
          </div>
        );
    }
  };

  const getStepProgress = () => {
    const steps = ['welcome', 'qr-scan', 'verify', 'backup-codes', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            {currentStep === 'welcome' && 'Add an extra layer of security to your account'}
            {currentStep === 'qr-scan' && 'Scan QR code with your authenticator app'}
            {currentStep === 'backup-codes' && 'Generate backup recovery codes'}
            {currentStep === 'complete' && 'Setup completed successfully'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{Math.round(getStepProgress())}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>
        
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}