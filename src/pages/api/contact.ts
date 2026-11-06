import type { APIRoute } from 'astro';
import { site } from '../../config';
import { detailTable, mailbox, sendMail, transportKind } from '../../lib/mail';
import { clean, clientIp, createRateLimiter, escapeHtml, json } from '../../lib/server';

/**
 * Contact form endpoint.
 *
 * Runs as a single Vercel serverless function. Everything else on the site stays
 * statically pre-rendered, so this costs one function invocation per submission.
 *
 * Delivery uses Gmail SMTP when SMTP_USER + SMTP_PASS are set, otherwise Resend
 * (RESEND_API_KEY). See src/lib/mail.ts.
 */
export const prerender = false;

const MAX = { name: 80, email: 254, company: 120, budget: 40, message: 3000 } as const;
const MIN_MESSAGE = 20;

const rateLimited = createRateLimiter(10 * 60 * 1000, 3);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

type Errors = Record<string, string>;

function validate(data: Record<string, unknown>): { errors: Errors; values: Record<string, string> } {
  const values = {
    name: clean(data.name, MAX.name),
    email: clean(data.email, MAX.email),
    company: clean(data.company, MAX.company),
    budget: clean(data.budget, MAX.budget),
    message: clean(data.message, MAX.message),
  };

  const errors: Errors = {};

  if (values.name.length < 2) errors.name = 'Please enter your name.';
  else if (values.name.length > MAX.name) errors.name = 'That name is too long.';

  if (!values.email) errors.email = 'Please enter your email address.';
  else if (values.email.length > MAX.email || !EMAIL_RE.test(values.email))
    errors.email = 'That email address doesn’t look right.';

  if (!values.message) errors.message = 'Please tell me what you need.';
  else if (values.message.length < MIN_MESSAGE)
    errors.message = `A little more detail, please — at least ${MIN_MESSAGE} characters.`;
  else if (values.message.length > MAX.message)
    errors.message = `Please keep it under ${MAX.message} characters.`;

  return { errors, values };
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const contentType = request.headers.get('content-type') ?? '';
  const wantsJson =
    (request.headers.get('accept') ?? '').includes('application/json') ||
    contentType.includes('application/json');

  let data: Record<string, unknown> = {};

  try {
    if (contentType.includes('application/json')) {
      data = (await request.json()) as Record<string, unknown>;
    } else {
      const form = await request.formData();
      data = Object.fromEntries(form.entries());
    }
  } catch {
    return json({ ok: false, error: 'Could not read that submission.' }, 400);
  }

  // Honeypot: a real person never fills a hidden "website" field.
  if (clean(data.website, 200)) {
    return json({ ok: true }, 200);
  }

  if (rateLimited(clientIp(request, clientAddress))) {
    const message =
      'Too many messages from this connection. Try again in a few minutes, or email me directly.';
    return wantsJson
      ? json({ ok: false, error: message }, 429)
      : new Response(message, { status: 429 });
  }

  const { errors, values } = validate(data);

  if (Object.keys(errors).length > 0) {
    if (wantsJson) return json({ ok: false, errors }, 422);
    return new Response('Please check the form and try again.', { status: 422 });
  }

  if (transportKind() === 'none') {
    const message = `The form isn’t configured yet. Please email ${site.email} directly.`;
    return wantsJson ? json({ ok: false, error: message }, 500) : new Response(message, { status: 500 });
  }

  const subject = `New enquiry — ${values.name}${values.company ? ` (${values.company})` : ''}`;

  const rows: Array<[string, string]> = [
    ['Name', values.name],
    ['Email', values.email],
    ['Company', values.company || '—'],
    ['Budget', values.budget || '—'],
    ['Message', values.message],
  ];

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:600px">
      <h2 style="margin:0 0 16px;font-size:18px">New enquiry from your portfolio</h2>
      ${detailTable(rows)}
      <p style="margin-top:20px;font-size:12px;color:#888">
        Reply directly to this email to reach ${escapeHtml(values.name)}.
      </p>
    </div>`;

  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n\n');

  const result = await sendMail({ subject, text, html, replyTo: values.email });

  if (!result.ok) {
    const message = `I couldn’t send that message. Please email ${mailbox()} directly.`;
    return wantsJson ? json({ ok: false, error: message }, 502) : new Response(message, { status: 502 });
  }

  console.log('[contact] delivered enquiry from', values.email, 'via', result.via);

  if (wantsJson) return json({ ok: true }, 200);
  return new Response(null, { status: 303, headers: { location: '/?sent=1#contact' } });
};

/** A GET here means someone opened the endpoint directly. */
export const GET: APIRoute = () =>
  json({ ok: false, error: 'POST to this endpoint to send a message.' }, 405);
