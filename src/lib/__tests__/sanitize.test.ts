import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  requireString,
  sanitizeNumber,
  sanitizeColor,
  sanitizeUUID,
  requireUUID,
  sanitizeDate,
  requireDate,
  sanitizeURL,
  sanitizeEnum,
  formString,
} from "@/lib/sanitize";

describe("sanitizeString", () => {
  it("strips HTML tags and trims whitespace", () => {
    expect(sanitizeString("  <b>hello</b>  ")).toBe("hello");
  });

  it("strips HTML entities", () => {
    expect(sanitizeString("a &lt; b")).toBe("a  b");
  });

  it("returns null for null/undefined", () => {
    expect(sanitizeString(null)).toBeNull();
    expect(sanitizeString(undefined)).toBeNull();
  });

  it("returns null for empty string after cleaning", () => {
    expect(sanitizeString("  ")).toBeNull();
    expect(sanitizeString("<br>")).toBeNull();
  });

  it("truncates to maxLength", () => {
    const long = "a".repeat(300);
    expect(sanitizeString(long, 10)?.length).toBe(10);
  });

  it("uses default maxLength of 255", () => {
    const long = "a".repeat(300);
    expect(sanitizeString(long)?.length).toBe(255);
  });
});

describe("requireString", () => {
  it("returns sanitized value when present", () => {
    expect(requireString("hello", "Name")).toBe("hello");
  });

  it("throws when value is empty", () => {
    expect(() => requireString("", "Name")).toThrow("Name is required");
  });

  it("throws when value is null", () => {
    expect(() => requireString(null, "Name")).toThrow("Name is required");
  });

  it("throws when value is only HTML tags (no inner text)", () => {
    expect(() => requireString("<br><hr>", "Name")).toThrow(
      "Name is required",
    );
  });

  it("keeps inner text after stripping tags", () => {
    expect(requireString("<b>hello</b>", "Name")).toBe("hello");
  });
});

describe("sanitizeNumber", () => {
  it("parses valid number string", () => {
    expect(sanitizeNumber("42.5", "Amount")).toBe(42.5);
  });

  it("returns 0 for NaN when not required", () => {
    expect(sanitizeNumber("abc", "Amount")).toBe(0);
  });

  it("throws for NaN when required", () => {
    expect(() =>
      sanitizeNumber("abc", "Amount", { required: true }),
    ).toThrow("Amount must be a valid number");
  });

  it("throws when below min", () => {
    expect(() =>
      sanitizeNumber("0", "Amount", { min: 0.01 }),
    ).toThrow("Amount must be at least 0.01");
  });

  it("throws when above max", () => {
    expect(() =>
      sanitizeNumber("101", "Amount", { max: 100 }),
    ).toThrow("Amount must be at most 100");
  });

  it("handles null/undefined input", () => {
    expect(sanitizeNumber(null, "Amount")).toBe(0);
    expect(sanitizeNumber(undefined, "Amount")).toBe(0);
  });

  it("handles negative numbers", () => {
    expect(sanitizeNumber("-5", "Amount")).toBe(-5);
  });
});

describe("sanitizeColor", () => {
  it("returns valid hex colour", () => {
    expect(sanitizeColor("#ff0000")).toBe("#ff0000");
  });

  it("returns fallback for invalid colour", () => {
    expect(sanitizeColor("red")).toBe("#6366f1");
  });

  it("returns fallback for null", () => {
    expect(sanitizeColor(null)).toBe("#6366f1");
  });

  it("returns custom fallback", () => {
    expect(sanitizeColor(null, "#000000")).toBe("#000000");
  });

  it("rejects 3-digit hex", () => {
    expect(sanitizeColor("#fff")).toBe("#6366f1");
  });

  it("rejects 8-digit hex (with alpha)", () => {
    expect(sanitizeColor("#ff000080")).toBe("#6366f1");
  });
});

describe("sanitizeUUID", () => {
  it("accepts valid UUID", () => {
    const uuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    expect(sanitizeUUID(uuid)).toBe(uuid);
  });

  it("returns null for invalid UUID", () => {
    expect(sanitizeUUID("not-a-uuid")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(sanitizeUUID("")).toBeNull();
  });

  it('returns null for "none"', () => {
    expect(sanitizeUUID("none")).toBeNull();
  });

  it("returns null for null/undefined", () => {
    expect(sanitizeUUID(null)).toBeNull();
    expect(sanitizeUUID(undefined)).toBeNull();
  });

  it("is case-insensitive", () => {
    const uuid = "A1B2C3D4-E5F6-7890-ABCD-EF1234567890";
    expect(sanitizeUUID(uuid)).toBe(uuid);
  });
});

describe("requireUUID", () => {
  it("returns valid UUID", () => {
    const uuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    expect(requireUUID(uuid, "ID")).toBe(uuid);
  });

  it("throws for invalid UUID", () => {
    expect(() => requireUUID("bad", "ID")).toThrow("ID is required");
  });

  it("throws for null", () => {
    expect(() => requireUUID(null, "ID")).toThrow("ID is required");
  });
});

describe("sanitizeDate", () => {
  it("accepts valid YYYY-MM-DD", () => {
    expect(sanitizeDate("2025-01-15")).toBe("2025-01-15");
  });

  it("returns null for invalid format", () => {
    expect(sanitizeDate("15/01/2025")).toBeNull();
    expect(sanitizeDate("2025-1-5")).toBeNull();
  });

  it("returns null for invalid date", () => {
    expect(sanitizeDate("2025-13-01")).toBeNull();
  });

  it("returns null for null/undefined", () => {
    expect(sanitizeDate(null)).toBeNull();
    expect(sanitizeDate(undefined)).toBeNull();
  });
});

describe("requireDate", () => {
  it("returns valid date", () => {
    expect(requireDate("2025-06-01", "Date")).toBe("2025-06-01");
  });

  it("throws for invalid date", () => {
    expect(() => requireDate("bad", "Date")).toThrow(
      "Date must be a valid date (YYYY-MM-DD)",
    );
  });
});

describe("sanitizeURL", () => {
  it("accepts valid HTTP URL", () => {
    expect(sanitizeURL("https://example.com")).toBe("https://example.com/");
  });

  it("accepts valid HTTPS URL", () => {
    expect(sanitizeURL("http://example.com/path?q=1")).toBe(
      "http://example.com/path?q=1",
    );
  });

  it("rejects non-HTTP protocols", () => {
    expect(sanitizeURL("ftp://example.com")).toBeNull();
    expect(sanitizeURL("javascript:alert(1)")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(sanitizeURL("not a url")).toBeNull();
  });

  it("returns null for null/empty", () => {
    expect(sanitizeURL(null)).toBeNull();
    expect(sanitizeURL("")).toBeNull();
  });

  it("truncates to maxLength before parsing", () => {
    const long = "https://example.com/" + "a".repeat(3000);
    const result = sanitizeURL(long, 2048);
    // Truncated URL is still valid (domain + path of 'a' chars)
    expect(result).toBeTruthy();
    expect(result!.length).toBeLessThanOrEqual(2100); // URL-encoded length
  });
});

describe("sanitizeEnum", () => {
  const allowed = ["income", "expense", "transfer"] as const;

  it("returns value when in allowed set", () => {
    expect(sanitizeEnum("income", allowed, "expense")).toBe("income");
  });

  it("returns fallback for invalid value", () => {
    expect(sanitizeEnum("other", allowed, "expense")).toBe("expense");
  });

  it("returns fallback for null", () => {
    expect(sanitizeEnum(null, allowed, "expense")).toBe("expense");
  });

  it("trims whitespace", () => {
    expect(sanitizeEnum("  income  ", allowed, "expense")).toBe("income");
  });
});

describe("formString", () => {
  it("returns string value from FormData", () => {
    const fd = new FormData();
    fd.set("key", "value");
    expect(formString(fd, "key")).toBe("value");
  });

  it("returns null for missing key", () => {
    const fd = new FormData();
    expect(formString(fd, "missing")).toBeNull();
  });
});
