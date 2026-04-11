import { NextResponse } from "next/server";
import { z } from "zod";
import { createTransport } from "nodemailer";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { rateLimiters } from "@/lib/rate-limiter";

const SUPPORT_EMAIL = "support@nisba.co.uk";

const reportSchema = z.object({
  page: z.string().max(200),
  errorName: z.string().max(100),
  digest: z.string().max(100).optional(),
  timestamp: z.string().max(50),
  userAgent: z.string().max(500),
});

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const { allowed } = rateLimiters.api.consume(`error-report:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many reports — please try again later" },
        { status: 429 },
      );
    }

    const body = await request.json();
    const data = reportSchema.parse(body);

    const { SMTP_HOST: host, SMTP_PORT: port, SMTP_USER: user, SMTP_PASS: pass } = env();
    if (!host || !user || !pass) {
      logger.warn("error-report", "SMTP not configured — skipping error report email");
      return NextResponse.json({ sent: false, reason: "smtp_not_configured" });
    }

    const transporter = createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const fromAddress = env().SMTP_FROM;
    const subject = `[Error Report] ${data.errorName} on ${data.page}`;
    const text = [
      "BalanceVisor Error Report",
      "========================",
      "",
      `Time:    ${data.timestamp}`,
      `Page:    ${data.page}`,
      `Error:   ${data.errorName}`,
      data.digest ? `Ref:     ${data.digest}` : null,
      `Browser: ${data.userAgent}`,
      "",
      "This report was auto-sent by a user from the error page.",
    ]
      .filter(Boolean)
      .join("\n");

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 16px; font-size: 18px;">Error Report</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 12px 6px 0; color: #888; white-space: nowrap;">Time</td><td style="padding: 6px 0;">${data.timestamp}</td></tr>
          <tr><td style="padding: 6px 12px 6px 0; color: #888; white-space: nowrap;">Page</td><td style="padding: 6px 0;"><code>${data.page}</code></td></tr>
          <tr><td style="padding: 6px 12px 6px 0; color: #888; white-space: nowrap;">Error</td><td style="padding: 6px 0;"><strong>${data.errorName}</strong></td></tr>
          ${data.digest ? `<tr><td style="padding: 6px 12px 6px 0; color: #888; white-space: nowrap;">Ref</td><td style="padding: 6px 0;"><code>${data.digest}</code></td></tr>` : ""}
          <tr><td style="padding: 6px 12px 6px 0; color: #888; white-space: nowrap;">Browser</td><td style="padding: 6px 0; font-size: 12px; color: #666; word-break: break-all;">${data.userAgent}</td></tr>
        </table>
        <p style="margin: 20px 0 0; font-size: 12px; color: #aaa;">Auto-sent from the BalanceVisor error page.</p>
      </div>
    `;

    await transporter.sendMail({
      from: fromAddress,
      to: SUPPORT_EMAIL,
      subject,
      text,
      html,
    });

    logger.info("error-report", "Error report email sent", {
      page: data.page,
      errorName: data.errorName,
      digest: data.digest,
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    logger.error("error-report", "Failed to send error report", error);
    return NextResponse.json(
      { error: "Failed to send report" },
      { status: 500 },
    );
  }
}
