"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SettingsLink() {
  const pathname = usePathname();
  const active = pathname?.startsWith("/dashboard/settings");

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", active && "bg-accent")}
      asChild
    >
      <Link href="/dashboard/settings" aria-label="Settings">
        <Settings className="h-4 w-4" />
      </Link>
    </Button>
  );
}
