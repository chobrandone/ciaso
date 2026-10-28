import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { execute, queryOne } from './db';
import { getContact, getContent } from './content';
import { site } from './site';

let transport: Transporter | null | undefined;

/** SMTP transport from environment variables, or null when email isn't configured. */
function getTransport(): Transporter | null {
  if (transport !== undefined) return transport;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  transport = SMTP_HOST
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT) === 465,
        auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
      })
    : null;
  return transport;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const fill = (tpl: string, vars: Record<string, string>) => tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

/** Turns plain text (blank line = new paragraph) into email-safe HTML, linking ciaso.ca and email addresses. */
function textToHtml(text: string) {
  return text.trim().split(/\n\s*\n/).map((para) => {
    const html = esc(para)
      .replace(/\b([\w.+-]+@[\w-]+\.[\w.]+)\b/g, '<a href="mailto:$1" style="color:#CD0E00">$1</a>')
      .replace(/(^|[\s(])((?:www\.)?ciaso\.ca)(?![\w@/])/g, '$1<a href="https://ciaso.ca" style="color:#CD0E00">$2</a>')
      .replace(/\n/g, '<br>');
    return `<p style="margin:0 0 16px">${html}</p>`;
  }).join('');
}

/** Branded HTML wrapper (Poppins with safe fallbacks; most email apps fall back to Arial). */
function layout(inner: string, orgName: string, logo: string) {
  const logoUrl = logo.startsWith('/') ? `${site.url}${logo}` : logo;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Poppins,'Segoe UI',Arial,sans-serif;color:#2a2a2e;font-size:15px;line-height:1.6">
<tr><td style="height:6px;background:#CD0E00"></td></tr>
<tr><td style="padding:24px 32px 8px"><img src="${esc(logoUrl)}" width="120" alt="CIASO" style="display:block;border:0"></td></tr>
<tr><td style="padding:16px 32px 24px">${inner}</td></tr>
<tr><td style="padding:16px 32px;background:#0b0b0c;color:#b9b9c0;font-size:12px">${esc(orgName)} · <a href="https://ciaso.ca" style="color:#ff8a80">ciaso.ca</a></td></tr>
</table></td></tr></table></body></html>`;
}

async function log(submissionId: number | null, kind: 'admin' | 'autoreply', to: string, subject: string, status: 'sent' | 'failed' | 'skipped', error?: string) {
  await execute('INSERT INTO email_log (submission_id, kind, to_addr, subject, status, error) VALUES (?, ?, ?, ?, ?, ?)',
    [submissionId, kind, to, subject, status, error ? error.slice(0, 500) : null]);
}

export type SubmissionMail = {
  id: number;
  formLabel: string;     // e.g. "Contact message"
  name: string;
  email: string;
  service: string;       // the service / topic the person chose
  details: Record<string, string | null | undefined>;
};

/**
 * Sends (1) a notification to CIASO and (2) the automatic reply to the person, both from CIASO's address.
 * Never throws; every attempt is recorded in email_log. Returns whether the auto-reply was sent.
 */
export async function sendSubmissionEmails(s: SubmissionMail): Promise<{ autoReplySent: boolean }> {
  const [content, contact] = await Promise.all([getContent(), getContact()]);
  const tpl = content.emails;
  const from = process.env.SMTP_FROM || `CIASO <${contact.email}>`;
  const notifyTo = process.env.NOTIFY_EMAIL || contact.email;
  const t = getTransport();
  const vars = { name: s.name, service: s.service, form: s.formLabel.toLowerCase(), email: s.email };

  // 1. Notification to CIASO (reply goes straight to the person)
  const adminSubject = fill(tpl.adminSubject, vars);
  const rows = Object.entries(s.details).filter(([, v]) => v).map(([k, v]) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#55555c;vertical-align:top;white-space:nowrap"><strong>${esc(k)}</strong></td><td style="padding:6px 0;white-space:pre-wrap">${esc(String(v))}</td></tr>`).join('');
  const adminHtml = layout(`<h1 style="font-size:20px;margin:0 0 12px;color:#111113">New ${esc(s.formLabel.toLowerCase())}</h1>
<table role="presentation" cellspacing="0" cellpadding="0" style="font-size:14px">${rows}</table>
<p style="margin:20px 0 0"><a href="${site.url}/admin/submissions/${s.id}" style="display:inline-block;background:#CD0E00;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600">Open in the admin dashboard</a></p>`, contact.orgName, content.images.logo);
  const adminText = Object.entries(s.details).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n\n') + `\n\nOpen in the admin dashboard: ${site.url}/admin/submissions/${s.id}`;

  // 2. Automatic reply to the person
  const replySubject = fill(tpl.autoReplySubject, vars);
  const replyText = fill(tpl.autoReplyBody, vars);
  const replyHtml = layout(textToHtml(replyText), contact.orgName, content.images.logo);

  if (!t) {
    await log(s.id, 'admin', notifyTo, adminSubject, 'skipped', 'SMTP is not configured');
    await log(s.id, 'autoreply', s.email, replySubject, 'skipped', 'SMTP is not configured');
    return { autoReplySent: false };
  }

  try {
    await t.sendMail({ from, to: notifyTo, replyTo: `${s.name} <${s.email}>`, subject: adminSubject, text: adminText, html: adminHtml });
    await log(s.id, 'admin', notifyTo, adminSubject, 'sent');
  } catch (err) {
    console.error('Admin notification failed:', err);
    await log(s.id, 'admin', notifyTo, adminSubject, 'failed', (err as Error).message);
  }

  // Limit automatic replies to the same address (prevents using the form to spam someone)
  const recent = await queryOne<{ n: number }>(
    "SELECT COUNT(*) AS n FROM email_log WHERE kind = 'autoreply' AND status = 'sent' AND to_addr = ? COLLATE NOCASE AND created_at >= datetime('now', '-1 day')", [s.email]);
  if (Number(recent?.n ?? 0) >= 3) {
    await log(s.id, 'autoreply', s.email, replySubject, 'skipped', 'Daily limit for this address reached');
    return { autoReplySent: false };
  }

  try {
    await t.sendMail({ from, to: `${s.name} <${s.email}>`, replyTo: contact.email, subject: replySubject, text: replyText, html: replyHtml });
    await log(s.id, 'autoreply', s.email, replySubject, 'sent');
    return { autoReplySent: true };
  } catch (err) {
    console.error('Auto-reply failed:', err);
    await log(s.id, 'autoreply', s.email, replySubject, 'failed', (err as Error).message);
    return { autoReplySent: false };
  }
}
