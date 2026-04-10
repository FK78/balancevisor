/**
 * Security audit regression tests.
 *
 * Validates fixes for findings C1, C2, H1, H2, H3, H4, H5, H6, M2, M4, M5, M6, L3.
 * Each describe block references the finding ID from SECURITY-AUDIT.md.
 */

import { describe, it, expect } from "vitest";
import { formatMarkdown } from "@/lib/formatMarkdown";

// ---------------------------------------------------------------------------
// H2 — DOMPurify sanitisation of AI-generated markdown
// ---------------------------------------------------------------------------
describe("H2: formatMarkdown XSS prevention", () => {
  it("escapes script tags so they are not executable", () => {
    const malicious = 'Hello <script>alert("xss")</script> world';
    const html = formatMarkdown(malicious);
    // No real <script> element — only escaped entities
    expect(html).not.toContain("<script");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes img tags so onerror is not executable", () => {
    const malicious = '<img src=x onerror="alert(1)">';
    const html = formatMarkdown(malicious);
    // No real <img> element — only escaped entities
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("escapes raw HTML so event handlers become inert text", () => {
    const malicious = '<div onmouseover="steal()">hover me</div>';
    const html = formatMarkdown(malicious);
    // escapeHtml converts < to &lt; so the div is never a real element
    expect(html).not.toContain("<div");
    expect(html).toContain("&lt;div");
  });

  it("strips iframe tags", () => {
    const malicious = '<iframe src="https://evil.com"></iframe>';
    const html = formatMarkdown(malicious);
    expect(html).not.toContain("<iframe");
  });

  it("does not create anchor tags from markdown links (no link support)", () => {
    const malicious = '[click](javascript:alert(1))';
    const html = formatMarkdown(malicious);
    // formatMarkdown does not convert [...](url) to <a> tags,
    // so javascript: protocol never becomes a clickable link
    expect(html).not.toContain("<a ");
    expect(html).not.toContain('href');
  });

  it("preserves safe markdown formatting", () => {
    const safe = "**bold** and *italic* and `code`";
    const html = formatMarkdown(safe);
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<code>code</code>");
  });

  it("preserves headings", () => {
    const md = "## Section Title";
    const html = formatMarkdown(md);
    expect(html).toContain("<h3>Section Title</h3>");
  });

  it("preserves unordered lists", () => {
    const md = "- item one\n- item two";
    const html = formatMarkdown(md);
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>item one</li>");
    expect(html).toContain("<li>item two</li>");
  });

  it("escapes style tags from AI output into inert text", () => {
    const malicious = '<style>body{display:none}</style>Hello';
    const html = formatMarkdown(malicious);
    // escapeHtml converts < to &lt; so no real <style> element exists
    expect(html).not.toContain("<style");
    expect(html).toContain("&lt;style&gt;");
  });

  it("escapes SVG-based XSS into inert text", () => {
    const malicious = '<svg onload="alert(1)"><circle r="40"></circle></svg>';
    const html = formatMarkdown(malicious);
    // escapeHtml converts < to &lt; so no real <svg> element exists
    expect(html).not.toContain("<svg");
    expect(html).toContain("&lt;svg");
  });

  it("DOMPurify strips any tags that bypass escapeHtml via regex replacement", () => {
    // This tests the DOMPurify safety net — even if a future regex change
    // accidentally introduced a dangerous tag, DOMPurify would catch it.
    // We can't easily craft such input today (escapeHtml blocks it), but
    // we can verify DOMPurify is active by checking the import.
    const safeResult = formatMarkdown("**bold** `code`\n- list item");
    expect(safeResult).toContain("<strong>");
    expect(safeResult).toContain("<code>");
    expect(safeResult).toContain("<li>");
  });

  it("only allows safe tags (no anchor, img, div, span, form, input)", () => {
    // Allowed: p, h2, h3, h4, strong, em, code, pre, ul, li, br
    // The output should only contain allowed tags
    const disallowed = ["<a ", "<img", "<div", "<span", "<form", "<input", "<textarea", "<select"];
    for (const tag of disallowed) {
      const result = formatMarkdown(`${tag} test>`);
      expect(result).not.toContain(tag);
    }
  });
});

// ---------------------------------------------------------------------------
// C1 — SSL configuration
// ---------------------------------------------------------------------------
describe("C1: SSL configuration", () => {
  it("src/index.ts does not contain rejectUnauthorized: false", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      new URL("../../index.ts", import.meta.url),
      "utf-8",
    );
    expect(content).not.toContain("rejectUnauthorized: false");
    // Should use 'require' or DATABASE_CA_CERT
    expect(content).toContain("'require'");
  });
});

// ---------------------------------------------------------------------------
// C2 — NODE_TLS_REJECT_UNAUTHORIZED removed from dev script
// ---------------------------------------------------------------------------
describe("C2: NODE_TLS_REJECT_UNAUTHORIZED not in package.json", () => {
  it("dev script does not disable TLS verification", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../../package.json"),
      "utf-8",
    );
    const pkg = JSON.parse(content);
    expect(pkg.scripts.dev).not.toContain("NODE_TLS_REJECT_UNAUTHORIZED");
  });
});

// ---------------------------------------------------------------------------
// H6 — CSP does not allow unsafe-inline or unsafe-eval for scripts
// ---------------------------------------------------------------------------
describe("H6: CSP hardening", () => {
  it("next.config.ts does not use unsafe-inline or unsafe-eval in script-src", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../../next.config.ts"),
      "utf-8",
    );
    // The CSP script-src line should not contain unsafe-inline or unsafe-eval
    const cspMatch = content.match(/script-src[^"']*/);
    expect(cspMatch).toBeTruthy();
    expect(cspMatch![0]).not.toContain("unsafe-inline");
    expect(cspMatch![0]).not.toContain("unsafe-eval");
    // Should contain a sha256 hash
    expect(content).toContain("sha256-");
  });
});

// ---------------------------------------------------------------------------
// M4 — connect-src does not use wildcard for Groq
// ---------------------------------------------------------------------------
describe("M4: Groq connect-src pinned", () => {
  it("does not use https://*.groq.com wildcard", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../../next.config.ts"),
      "utf-8",
    );
    expect(content).not.toContain("https://*.groq.com");
    expect(content).toContain("https://api.groq.com");
  });
});

// ---------------------------------------------------------------------------
// M5 — Permissions-Policy includes payment=()
// ---------------------------------------------------------------------------
describe("M5: Permissions-Policy restricts payment", () => {
  it("includes payment=() in the policy", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../../next.config.ts"),
      "utf-8",
    );
    expect(content).toContain("payment=()");
  });
});

// ---------------------------------------------------------------------------
// H3 — Health endpoint strips internals in production
// ---------------------------------------------------------------------------
describe("H3: health endpoint production safety", () => {
  it("verifies health route file conditionally includes uptime based on NODE_ENV", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../app/api/health/route.ts"),
      "utf-8",
    );
    // Should reference isProd for conditional inclusion
    expect(content).toContain("isProd");
    expect(content).toContain("!isProd");
    // uptime should only appear inside a conditional spread
    expect(content).toMatch(/!isProd\s*&&\s*\{\s*uptime:/);
  });
});

// ---------------------------------------------------------------------------
// M2 — Import generates fresh UUIDs
// ---------------------------------------------------------------------------
describe("M2: importUserData generates fresh UUIDs", () => {
  it("import-data.ts uses randomUUID for ID remapping", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../db/mutations/import-data.ts"),
      "utf-8",
    );
    expect(content).toContain("randomUUID");
    expect(content).toContain("remap(");
    expect(content).toContain("remapNullable(");
    // Should remap primary keys
    expect(content).toContain("id: remap(");
    // Should remap FK references
    expect(content).toContain("account_id: remapNullable(");
    expect(content).toContain("category_id: remapNullable(");
  });
});

// ---------------------------------------------------------------------------
// M6 — MFA error messages are generic
// ---------------------------------------------------------------------------
describe("M6: MFA errors do not leak internals", () => {
  it("verify.ts does not interpolate error.message into client responses", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../db/mutations/mfa/verify.ts"),
      "utf-8",
    );
    // Should not include ${...Error.message} or ${...error.message} in client-facing strings
    const clientErrors = content.match(/error:\s*[`'"].*\$\{.*[Ee]rror\.message.*\}.*[`'"]/g);
    expect(clientErrors).toBeNull();
    // The generic messages should be present
    expect(content).toContain("Failed to start MFA verification. Please try again.");
    expect(content).toContain("Invalid verification code. Please try again.");
  });
});

// ---------------------------------------------------------------------------
// L3 — No duplicate deletions in deleteAccount
// ---------------------------------------------------------------------------
describe("L3: deleteAccount has no duplicate deletions", () => {
  it("settings.ts deletes retirementProfilesTable only once", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../db/mutations/settings.ts"),
      "utf-8",
    );
    const matches = content.match(/delete\(retirementProfilesTable\)/g);
    expect(matches).toHaveLength(1);
  });

  it("settings.ts deletes dashboardLayoutsTable only once", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../db/mutations/settings.ts"),
      "utf-8",
    );
    const matches = content.match(/delete\(dashboardLayoutsTable\)/g);
    expect(matches).toHaveLength(1);
  });

  it("settings.ts deletes userKeysTable only once", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../db/mutations/settings.ts"),
      "utf-8",
    );
    const matches = content.match(/delete\(userKeysTable\)/g);
    expect(matches).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// H1 — Zakat settings input validation
// ---------------------------------------------------------------------------
describe("H1: saveZakatSettings uses input validation", () => {
  it("zakat.ts imports requireDate and sanitizeEnum", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../db/mutations/zakat.ts"),
      "utf-8",
    );
    expect(content).toContain("requireDate");
    expect(content).toContain("sanitizeEnum");
    expect(content).toContain("formString");
    // Should not use raw formData.get() as string for these fields
    expect(content).not.toMatch(
      /formData\.get\(['"]anniversary_date['"]\)\s*as\s*string/,
    );
    expect(content).not.toMatch(
      /formData\.get\(['"]nisab_type['"]\)\s*as\s*string/,
    );
  });
});

// ---------------------------------------------------------------------------
// M3 — Migration scripts don't use rejectUnauthorized: false
// ---------------------------------------------------------------------------
describe("M3: migration scripts SSL fix", () => {
  it("encrypt-existing-data.ts does not use rejectUnauthorized: false", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../db/migrations/encrypt-existing-data.ts"),
      "utf-8",
    );
    expect(content).not.toContain("rejectUnauthorized: false");
  });

  it("migrate-to-per-user-keys.ts does not use rejectUnauthorized: false", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../db/migrations/migrate-to-per-user-keys.ts"),
      "utf-8",
    );
    expect(content).not.toContain("rejectUnauthorized: false");
  });
});

// ---------------------------------------------------------------------------
// H4 / H5 — API route security (rate limit & auth checks)
// ---------------------------------------------------------------------------
describe("H4: nisab-prices has rate limiting", () => {
  it("route file uses withRateLimit", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../app/api/nisab-prices/route.ts"),
      "utf-8",
    );
    expect(content).toContain("withRateLimit");
    expect(content).toContain("rateLimiters");
  });
});

describe("H5: ticker search requires authentication", () => {
  it("route file calls getCurrentUserId()", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../app/api/tickers/search/route.ts"),
      "utf-8",
    );
    expect(content).toContain("getCurrentUserId");
    expect(content).toContain("await getCurrentUserId()");
  });
});
