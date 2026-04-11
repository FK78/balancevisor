import Link from "next/link";
import { Button } from "./ui/button";
import { getCurrentUserIdentity } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export async function AuthButton() {
  const user = await getCurrentUserIdentity();

  return user ? (
    <div className="flex items-center gap-4 text-xs">
      Hey, {user.displayName || user.fullName || user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
