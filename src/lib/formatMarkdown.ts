/**
 * Format markdown text to HTML.
 *
 * Supports:
 * - Code blocks (```)
 * - Inline code (`)
 * - Bold (**)
 * - Italic (*)
 * - Headers (#, ##, ###)
 * - Unordered lists (-)
 * - Paragraphs (double newlines)
 */

import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "h2", "h3", "h4", "strong", "em", "code", "pre",
  "ul", "li", "br",
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function formatMarkdown(text: string): string {
  let html = escapeHtml(text);

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>");
  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Headers
  html = html.replace(/^### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^## (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^# (.+)$/gm, "<h2>$1</h2>");
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");
  // Paragraphs
  html = html.replace(/\n\n/g, "</p><p>");
  html = `<p>${html}</p>`;
  html = html.replace(/<p><\/p>/g, "");
  // Clean up around block elements
  html = html.replace(/<p>(<h[2-4]>)/g, "$1");
  html = html.replace(/(<\/h[2-4]>)<\/p>/g, "$1");
  html = html.replace(/<p>(<ul>)/g, "$1");
  html = html.replace(/(<\/ul>)<\/p>/g, "$1");
  html = html.replace(/<p>(<pre>)/g, "$1");
  html = html.replace(/(<\/pre>)<\/p>/g, "$1");

  return sanitizeHtml(html, { allowedTags: ALLOWED_TAGS, allowedAttributes: {} });
}
