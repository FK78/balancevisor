import { createTransport, type Transporter } from 'nodemailer';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const { SMTP_HOST: host, SMTP_PORT: port, SMTP_USER: user, SMTP_PASS: pass } = env();

  if (!host || !user || !pass) return null;

  transporter = createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendBudgetAlertEmail(
  to: string,
  subject: string,
  alertType: 'threshold_warning' | 'over_budget',
  categoryName: string,
  percentUsed: number,
  budgetAmount: number,
  spent: number,
  currency: string,
) {
  const smtp = getTransporter();
  if (!smtp) {
    console.warn('SMTP not configured — skipping email alert');
    return;
  }

  const fromAddress = env().SMTP_FROM;

  const isOver = alertType === 'over_budget';
  const emoji = isOver ? '🚨' : '⚠️';
  const statusText = isOver ? 'Over Budget' : 'Approaching Limit';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 20px;">${emoji} Budget Alert: ${statusText}</h2>
      <div style="background: ${isOver ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${isOver ? '#fecaca' : '#fde68a'}; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${categoryName}</p>
        <p style="margin: 0 0 4px; font-size: 14px; color: #666;">
          Spent: <strong>${currency} ${spent.toFixed(2)}</strong> of <strong>${currency} ${budgetAmount.toFixed(2)}</strong>
        </p>
        <p style="margin: 0; font-size: 14px; color: ${isOver ? '#dc2626' : '#d97706'}; font-weight: 600;">
          ${percentUsed.toFixed(0)}% used
        </p>
      </div>
      <p style="margin: 0; font-size: 13px; color: #888;">
        You can manage your alert preferences in the MoneyScope dashboard.
      </p>
    </div>
  `;

  try {
    await smtp.sendMail({
      from: fromAddress,
      to,
      subject: `${emoji} ${subject}`,
      html,
    });
  } catch (error) {
    logger.error("email", "Failed to send budget alert email", error);
  }
}
