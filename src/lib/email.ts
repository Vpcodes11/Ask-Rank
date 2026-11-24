import 'server-only';

/**
 * Sends email through Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Without RESEND_API_KEY (local development) the email is printed to the server log instead.
 */
export async function sendEmail(msg: { to: string; subject: string; html: string; text: string }): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') throw new Error('RESEND_API_KEY is not set');
    console.log(`\n[email:dev] to=${msg.to}\nsubject: ${msg.subject}\n${msg.text}\n`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'AskRank <hello@askrank.ai>',
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}),
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Minimal, client-safe HTML email wrapper. */
export function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f6f7f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<div style="font-weight:800;font-size:18px;margin-bottom:20px">AskRank</div>
<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px">
<h1 style="font-size:18px;margin:0 0 12px">${esc(title)}</h1>
${bodyHtml}
</div>
<p style="font-size:12px;color:#64748b;margin-top:16px">You received this because this address was used on AskRank.</p>
</div></body></html>`;
}

export function button(href: string, label: string) {
  return `<p style="margin:20px 0"><a href="${esc(href)}" style="background:#10b981;color:#04130d;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700">${esc(label)}</a></p>`;
}
