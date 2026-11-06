import type { APIRoute } from 'astro';
import { detailTable, mailbox, sendMail, transportKind } from '../../lib/mail';
import { clean, clientIp, createRateLimiter, json } from '../../lib/server';

/**
 * Booking capture for the WhatsApp demo.
 *
 * The demo asks for a name and a way to reply, then posts here so the lead
 * lands in Reyan's inbox instead of dying in the browser. Same protections as
 * the contact form: honeypot, length caps, per-IP rate limit.
 */
export const prerender = false;

const rateLimited = createRateLimiter(10 * 60 * 1000, 3);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

const TOPICS: Record<string, string> = {
  whatsapp: 'WhatsApp orders / sales agent',
  content: 'Content production',
  internal: 'Internal systems',
  other: 'Something else',
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let data: Record<string, unknown> = {};
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'Could not read that request.' }, 400);
  }

  // Honeypot reused from the demo form.
  if (clean(data.website, 200)) return json({ ok: true }, 200);

  if (rateLimited(clientIp(request, clientAddress))) {
    return json({ ok: false, error: 'rate-limited' }, 429);
  }

  const name = clean(data.name, 80);
  const contact = clean(data.contact, 160);
  const topicKey = clean(data.topic, 40);
  const notes = clean(data.notes, 600);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = 'Please enter your name.';

  const looksLikeEmail = EMAIL_RE.test(contact);
  const looksLikePhone = PHONE_RE.test(contact) && (contact.match(/\d/g) ?? []).length >= 7;
  if (!contact) errors.contact = 'Please add an email or WhatsApp number.';
  else if (!looksLikeEmail && !looksLikePhone) errors.contact = 'That doesn’t look like an email or a number.';

  if (Object.keys(errors).length > 0) return json({ ok: false, errors }, 422);

  if (transportKind() === 'none') {
    console.error('[lead] no mail transport configured — booking not delivered');
    return json({ ok: false, error: 'not-configured' }, 500);
  }

  const topic = TOPICS[topicKey] ?? 'Not specified';
  const received = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  const rows: Array<[string, string]> = [
    ['Name', name],
    ['Reply to', contact],
    ['Interested in', topic],
    ['Captured', received],
    ['Source', 'WhatsApp agent demo · reyanshoaib.com/#demo'],
  ];
  if (notes) rows.push(['Notes', notes]);

  const subject = `Demo booking — ${name} (${topic})`;

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:600px">
      <h2 style="margin:0 0 6px;font-size:18px">Someone booked through the demo</h2>
      <p style="margin:0 0 16px;font-size:13px;color:#666">
        They finished the booking flow in the WhatsApp agent demo. Reply within a few hours
        while the conversation is fresh.
      </p>
      ${detailTable(rows)}
    </div>`;

  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');

  const result = await sendMail({
    subject,
    text,
    html,
    replyTo: looksLikeEmail ? contact : undefined,
  });

  if (!result.ok) {
    const message = `I couldn’t save that. Message ${mailbox()} directly and I’ll pick it up.`;
    return json({ ok: false, error: message }, 502);
  }

  console.log('[lead] booking from', contact, 'via', result.via);
  return json({ ok: true }, 200);
};

export const GET: APIRoute = () =>
  json({ ok: false, error: 'POST booking details to this endpoint.' }, 405);
