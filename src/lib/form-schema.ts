/**
 * Zod primitives and FormData parsing helper for server actions.
 *
 * These replace the ad-hoc sanitize helpers with declarative schemas
 * while preserving the same XSS stripping and validation behavior.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// XSS-stripping transform (matches sanitizeString behavior)
// ---------------------------------------------------------------------------

function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/gi, "")
    .trim();
}

// ---------------------------------------------------------------------------
// Reusable Zod primitives
// ---------------------------------------------------------------------------

/** Optional string that strips HTML and trims. Returns null when empty/missing. */
export const zString = (maxLength = 255) =>
  z
    .string()
    .transform(stripHtml)
    .pipe(z.string().max(maxLength))
    .transform((v) => (v.length === 0 ? null : v))
    .nullable()
    .optional()
    .default(null);

/** Required string that strips HTML and trims. Throws when empty. */
export const zRequiredString = (maxLength = 255) =>
  z
    .string()
    .transform(stripHtml)
    .pipe(z.string().min(1, "Required").max(maxLength));

/** Numeric form field: comes in as string, parsed to number. Returns 0 if empty & not required. */
export const zNumber = (opts?: { min?: number; max?: number }) => {
  let schema = z.coerce.number();
  if (opts?.min !== undefined) schema = schema.min(opts.min);
  if (opts?.max !== undefined) schema = schema.max(opts.max);
  return schema;
};

/** Optional numeric form field. Returns null when empty. */
export const zOptionalNumber = (opts?: { min?: number; max?: number }) => {
  let schema = z.coerce.number();
  if (opts?.min !== undefined) schema = schema.min(opts.min);
  if (opts?.max !== undefined) schema = schema.max(opts.max);
  return z.union([
    z.literal("").transform(() => null),
    schema.transform((v) => v as number | null),
  ]).nullable().optional().default(null);
};

/** Hex colour string. Falls back to a default. */
export const zColor = (fallback = "#6366f1") =>
  z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .catch(fallback);

/** UUID v4 string. Returns null if invalid or "none". */
export const zUUID = () =>
  z
    .string()
    .trim()
    .transform((v) => (v === "none" || v === "" ? null : v))
    .pipe(
      z
        .string()
        .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        .nullable(),
    )
    .nullable()
    .optional()
    .default(null);

/** Required UUID v4 string. */
export const zRequiredUUID = () =>
  z
    .string()
    .trim()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      "Must be a valid UUID",
    );

/** Date in YYYY-MM-DD format. Returns null if invalid. */
export const zDate = () =>
  z
    .string()
    .trim()
    .transform((v) => {
      if (!v) return null;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
      const d = new Date(v + "T00:00:00");
      return isNaN(d.getTime()) ? null : v;
    })
    .nullable()
    .optional()
    .default(null);

/** Required date in YYYY-MM-DD format. */
export const zRequiredDate = () =>
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .refine((v) => !isNaN(new Date(v + "T00:00:00").getTime()), "Invalid date");

/** URL that must be http or https. Returns null if invalid. */
export const zURL = (maxLength = 2048) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((v) => {
      if (!v) return null;
      try {
        const url = new URL(v);
        return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
      } catch {
        return null;
      }
    })
    .nullable()
    .optional()
    .default(null);

/** Enum with fallback (matches sanitizeEnum behavior). */
export const zEnum = <T extends string>(allowed: readonly [T, ...T[]], fallback: T) =>
  z.enum(allowed).catch(fallback);

/** Boolean from form checkbox ("on" = true, missing = false). */
export const zCheckbox = () =>
  z
    .enum(["on", "true", "1", ""])
    .transform((v) => v === "on" || v === "true" || v === "1")
    .catch(false);

// ---------------------------------------------------------------------------
// FormData → object extraction
// ---------------------------------------------------------------------------

/**
 * Parse a FormData object through a Zod schema.
 * Extracts all string values from FormData and passes them through the schema.
 *
 * Throws a ZodError (caught by Next.js as a validation error) when invalid.
 */
export function parseFormData<T>(schema: z.ZodType<T>, formData: FormData): T {
  const raw: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      raw[key] = value;
    }
  });
  return schema.parse(raw);
}
