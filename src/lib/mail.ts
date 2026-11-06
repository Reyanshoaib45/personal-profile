import nodemailer from 'nodemailer';
import { site } from '../config';
import { escapeHtml } from './server';

/**
 * One place that sends mail, two possible transports.
 *
 * 1. SMTP (Google Workspace / Gmail app password) — used when SMTP_USER is set.
 *    Gmail requires 2-Step Verification + an App Password; a normal account
 *    password is rejected. Port 587 (STARTTLS) works from Vercel; port 25 does not.
 * 2. Resend — used when RESEND_API_KEY is set and SMTP is not.
 *
 * Keeping both means a broken app password degrades to a working provider
 * instead of silently losing enquiries.
 */

export type Mail = {
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export type MailResult = { ok: true; via: 'smtp' | 'resend' } | { ok: false; error: string };

const read = (...values: Array<string | undefined>) => values.find((v) => v && v.trim())?.trim() ?? '';

const smtpHost = () => read(import.meta.env.SMTP_HOST, process.env.SMTP_HOST);
const smtpUser = () => read(import.meta.env.SMTP_USER, process.env.SMTP_USER);
const smtpPass = () => read(import.meta.env.SMTP_PASS, process.env.SMTP_PASS).replace(/\s+/g, '');
const resendKey = () => read(import.meta.env.RESEND_API_KEY, process.env.RESEND_API_KEY);

/** Where enquiries land. */
export const mailbox = () =>
  read(import.meta.env.CONTACT_TO_EMAIL, process.env.CONTACT_TO_EMAIL, site.email);

/**
 * Gmail only lets you send as the account you authenticated as, so the From
 * address follows SMTP_USER unless CONTACT_FROM_EMAIL overrides it (Workspace
 * aliases). Resend needs a verified-domain sender instead.
 */
export const senderAddress = () => {
  const explicit = read(import.meta.env.CONTACT_FROM_EMAIL, process.env.CONTACT_FROM_EMAIL);
  if (explicit) return explicit;
  if (smtpUser()) return `${site.name} <${smtpUser()}>`;
  return 'Portfolio <onboarding@resend.dev>';
};

export const transportKind = (): 'smtp' | 'resend' | 'none' => {
  if (smtpUser() && smtpPass()) return 'smtp';
  if (resendKey()) return 'resend';
  return 'none';
};

function smtpTransport() {
  const host = smtpHost() || 'smtp.gmail.com';
  const port = Number(read(import.meta.env.SMTP_PORT, process.env.SMTP_PORT, '587'));

  return nodemailer.createTransport({
    host,
    port,
    // 465 is implicit TLS; 587 starts plaintext and upgrades via STARTTLS.
    secure: port === 465,
    auth: { user: smtpUser(), pass: smtpPass() },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

export async function sendMail(mail: Mail): Promise<MailResult> {
  const kind = transportKind();
  const from = senderAddress();
  const to = mailbox();

  if (kind === 'none') {
    console.error('[mail] No transport configured — set SMTP_USER + SMTP_PASS (or RESEND_API_KEY).');
    return { ok: false, error: 'not-configured' };
  }

  try {
    if (kind === 'smtp') {
      const info = await smtpTransport().sendMail({
        from,
        to,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        replyTo: mail.replyTo,
      });
      // Gmail quietly accepts then bounces; accepted/rejected tells us what happened.
      const accepted = (info.accepted ?? []).length;
      const rejected = (info.rejected ?? []).length;
      if (accepted === 0) {
        console.error('[mail] SMTP accepted 0 recipients:', info.response, mail.subject);
        return { ok: false, error: 'rejected' };
      }
      if (rejected > 0) console.warn('[mail] SMTP rejected some recipients:', info.rejected);
      console.log('[mail] sent via SMTP:', info.messageId, '→', to);
      return { ok: true, via: 'smtp' };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${resendKey()}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        reply_to: mail.replyTo,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('[mail] Resend rejected the message:', response.status, detail);
      return { ok: false, error: `resend-${response.status}` };
    }

    console.log('[mail] sent via Resend →', to);
    return { ok: true, via: 'resend' };
  } catch (error) {
    // Surface the real reason in logs: bad app password, blocked port, DNS, TLS.
    const message = error instanceof Error ? error.message : String(error);
    console.error('[mail] send failed:', message);
    return { ok: false, error: message };
  }
}

/** Shared table layout so both emails look like they came from the same site. */
export function detailTable(rows: Array<[string, string]>): string {
  return `<table style="border-collapse:collapse;width:100%">${rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 12px 8px 0;vertical-align:top;color:#666;font-size:13px;white-space:nowrap">${label}</td>
        <td style="padding:8px 0;font-size:14px;white-space:pre-wrap">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join('')}</table>`;
}
