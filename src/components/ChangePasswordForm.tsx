"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { userError } from "@/lib/user-error";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import posthog from "posthog-js";

type Props = {
  email: string;
};

export function ChangePasswordForm({ email }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValid =
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        setError("Current password is incorrect.");
        setIsLoading(false);
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      posthog.capture("password_changed");
      toast.success("Password updated successfully");
    } catch (err: unknown) {
      setError(
        userError(
          "change-password",
          err,
          "Unable to update password. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="current_password">Current password</Label>
        <PasswordInput
          id="current_password"
          autoComplete="current-password"
          placeholder="Enter your current password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="new_password">New password</Label>
        <PasswordInput
          id="new_password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          required
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm_new_password">Confirm new password</Label>
        <PasswordInput
          id="confirm_new_password"
          autoComplete="new-password"
          placeholder="Type your new password again"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <Button type="submit" disabled={!isValid || isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating…
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Update Password
          </>
        )}
      </Button>
    </form>
  );
}
