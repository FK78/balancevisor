/**
 * Input sanitization helpers for server actions.
 *
 * Drizzle ORM already prevents SQL injection via parameterised queries.
 * These helpers guard against XSS, excessively long strings, and
 * malformed input that could break the UI.
 */

/**
 * Strip HTML tags and trim whitespace from a user-supplied string.
 * Returns `null` when the result is empty.
 */
export function sanitizeString(
  raw: string | null | undefined,
  maxLength = 255,
): string | null {
  if (raw == null) return null;
  const cleaned = raw
    .replace(/<[^>]*>/g, "")    // strip HTML tags
    .replace(/&[a-z]+;/gi, "")  // strip HTML entities like &lt;
    .trim();
  if (cleaned.length === 0) return null;
  return cleaned.slice(0, maxLength);
}

/**
 * Same as sanitizeString but throws if the result is empty.
 * Use for required fields.
 */
export function requireString(
  raw: string | null | undefined,
  fieldName: string,
  maxLength = 255,
): string {
  const value = sanitizeString(raw, maxLength);
  if (!value) throw new Error(`${fieldName} is required`);
  return value;
}

/**
 * Parse and validate a numeric input. Returns NaN-safe result.
 * Throws on NaN if `required` is true.
 */
export function sanitizeNumber(
  raw: string | null | undefined,
  fieldName: string,
  options: { required?: boolean; min?: number; max?: number } = {},
): number {
  const { required = false, min, max } = options;
  const num = parseFloat(raw ?? "");
  if (isNaN(num)) {
    if (required) throw new Error(`${fieldName} must be a valid number`);
    return 0;
  }
  if (min !== undefined && num < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  if (max !== undefined && num > max) {
    throw new Error(`${fieldName} must be at most ${max}`);
  }
  return num;
}

/**
 * Validate a hex colour string. Falls back to a default.
 */
export function sanitizeColor(raw: string | null | undefined, fallback = "#6366f1"): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed : fallback;
}

/**
 * Validate a UUID v4 string. Returns null if invalid.
 */
export function sanitizeUUID(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed === "none" || trimmed === "") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)
    ? trimmed
    : null;
}

/**
 * Validate a UUID, throwing if empty. Use for required ID fields.
 */
export function requireUUID(raw: string | null | undefined, fieldName: string): string {
  const value = sanitizeUUID(raw);
  if (!value) throw new Error(`${fieldName} is required`);
  return value;
}

/**
 * Validate a date string in YYYY-MM-DD format. Returns null if invalid.
 */
export function sanitizeDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const d = new Date(trimmed + "T00:00:00");
  return isNaN(d.getTime()) ? null : trimmed;
}

/**
 * Validate a date string, throwing if empty. Use for required date fields.
 */
export function requireDate(raw: string | null | undefined, fieldName: string): string {
  const value = sanitizeDate(raw);
  if (!value) throw new Error(`${fieldName} must be a valid date (YYYY-MM-DD)`);
  return value;
}

/**
 * Validate a URL string. Returns null if invalid.
 */
export function sanitizeURL(raw: string | null | undefined, maxLength = 2048): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().slice(0, maxLength);
  if (trimmed.length === 0) return null;
  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Validate a value against an allowed set of options.
 */
export function sanitizeEnum<T extends string>(
  raw: string | null | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  if (!raw) return fallback;
  const trimmed = raw.trim() as T;
  return allowed.includes(trimmed) ? trimmed : fallback;
}

/**
 * Helper to pull a FormData value as string.
 */
export function formString(formData: FormData, key: string): string | null {
  const val = formData.get(key);
  return typeof val === "string" ? val : null;
}
