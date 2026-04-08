import { LoginFormWithMFA } from "@/components/LoginFormWithMFA";
import { AuthLayout } from "@/components/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginFormWithMFA />
    </AuthLayout>
  );
}
