'use client';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { userError } from '@/lib/user-error';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { MFAVerificationDialog } from '@/components/MFAVerificationDialog';

export function LoginFormWithMFA({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string>('');
  const [mfaSession, setMfaSession] = useState<any>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setMfaRequired(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check if this is an MFA required error
        if (error.message.includes('MFA') || error.message.includes('factor')) {
          // User has MFA enabled, need to get the factor ID
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const totpFactors = factors?.totp || [];
          
          if (totpFactors.length > 0) {
            setMfaFactorId(totpFactors[0].id);
            setMfaRequired(true);
            return;
          }
        }
        throw error;
      }

      // Check if MFA is required via session data
      if (data.session?.aal === 'aal2') {
        // Already authenticated with MFA
        router.push('/dashboard');
      } else {
        // Password-only authentication successful
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(userError('login', err, 'Unable to sign in. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSuccess = () => {
    router.push('/dashboard');
    router.refresh();
  };

  const handleUseBackupCode = () => {
    // Backup code used, we can track this if needed
    console.log('Backup code used for login');
  };

  return (
    <>
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your BalanceVisor account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="ml-auto text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                {mfaRequired && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Two-factor authentication required</p>
                      <p className="text-xs text-muted-foreground">
                        Your account has 2FA enabled. Click sign in to continue.
                      </p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mfaRequired ? 'Preparing 2FA...' : 'Signing in...'}
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  href="/auth/sign-up"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  Create one free
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <MFAVerificationDialog
        open={mfaRequired}
        onOpenChange={setMfaRequired}
        factorId={mfaFactorId}
        email={email}
        onSuccess={handleMfaSuccess}
        onUseBackupCode={handleUseBackupCode}
      />
    </>
  );
}