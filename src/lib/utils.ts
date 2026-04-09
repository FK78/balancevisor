import { twMerge } from "tailwind-merge"

type ClassValue = string | number | boolean | undefined | null | Record<string, unknown>;

export function cn(...inputs: (ClassValue | ClassValue[])[]) {
  return twMerge(
    inputs
      .flat()
      .flatMap((v) => {
        if (v != null && typeof v === "object") {
          return Object.entries(v)
            .filter(([, cond]) => Boolean(cond))
            .map(([cls]) => cls);
        }
        return v;
      })
      .filter(Boolean)
      .join(" "),
  );
}

export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;