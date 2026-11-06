# Reyan Shoaib — AI-Native Product Engineer

A single-page, statically rendered portfolio built with **Astro 7** and **Tailwind CSS 4**.
No CDN frameworks, no jQuery, no runtime section loader. The page ships as pre-rendered
HTML with ~2 KB of inline JavaScript (mobile nav + scroll reveal). Exactly one interactive
component — the WhatsApp agent demo — is a Vue island that loads on scroll into view.

---

## Why this architecture

The previous site had five structural problems that no amount of CSS could fix:

| Problem | Cause | Fixed by |
| --- | --- | --- |
| Blank page on first paint | All sections injected by `fetch()` in `script.js` | Components render at **build time** into static HTML |
| Zero SEO indexing | Body content existed only after JS ran | Every headline, case study and FAQ is in `dist/index.html` |
| Layout shift | 12 async section swaps + no image dimensions | Static order + Astro-generated `width`/`height` on images |
| 7 render-blocking CDNs | Bootstrap, jQuery, AOS, Font Awesome, Google Fonts | Zero external requests; Tailwind is compiled locally |
| "Tailwind" that wasn't Tailwind | Tailwind never installed; Bootstrap did the layout | Real Tailwind 4 via the official Vite plugin |

Why **Astro** rather than Vue/React/Next: a portfolio is a *brochure*, not an app. Astro
renders HTML by default, so you keep full SEO and sub-second paint, while still giving you
real components (`Hero.astro`, `Services.astro`) instead of a string-template hack. When
you eventually need interactivity — the WhatsApp demo, a pricing calculator — you add a Vue
component as an **island** with `client:visible`, so only that component ships JS. That is
the correct amount of framework for this job. Next.js would add a hydration cost for zero
user-visible benefit here.

Design system: one near-black (`ink`), one panel tone, one accent (`accent`, acid lime),
system font stack (no font downloads), and exactly one motion idea — a 14 px scroll reveal
that respects `prefers-reduced-motion`.

## Project structure

```
src/
├─ config.ts              ← every link, offer, price, metric and FAQ lives here
├─ content.config.ts      ← case-study collection schema (typed frontmatter)
├─ content/
│  └─ case-studies/        ← one markdown file per case study
├─ layouts/
│  └─ Layout.astro        ← <head>, SEO meta, JSON-LD, footer, inline scripts
├─ components/
│  ├─ Navbar.astro        ← 4 links + "Book a 20-min audit"
│  ├─ Hero.astro          ← headline, dual CTA, proof metrics, system diagram
│  ├─ CaseStudies.astro   ← Pencraft fraud system + WhatsApp agent
│  ├─ Services.astro      ← 4 productized offers (replaces the price table)
│  ├─ Process.astro       ← 4-step risk-removal workflow
│  ├─ FAQ.astro           ← 8 objection killers
│  ├─ WhatsAppDemoSection.astro ← section wrapper + framing copy for the demo
│  └─ WhatsAppDemo.vue    ← the only hydrated component (scripted agent, client:visible)
├─ pages/
│  ├─ index.astro          ← composes the page + closing CTA
│  ├─ work/[slug].astro    ← long-form case study page (from the collection)
│  ├─ api/contact.ts       ← serverless contact endpoint (validation + mail)
│  └─ api/lead.ts          ← demo booking endpoint (emails the lead)
├─ components/ContactForm.astro  ← form, client-side validation, success state
├─ lib/
│  ├─ mail.ts             ← SMTP (Gmail app password) with Resend fallback
│  └─ server.ts           ← json/clean/escape helpers + in-memory rate limiter
├─ styles/global.css      ← Tailwind import + design tokens + reveal animation
└─ assets/                ← reyan.png (optimized to WebP at build)
public/                   ← résumé, robots.txt, sitemap target
legacy/                   ← the old Bootstrap/fetch site, kept for reference only
```

**Editing content:** change copy in `src/config.ts` first. Only touch components for layout.
Nothing prices itself in two places.

**Rendering model:** the page is still pre-rendered HTML (verified: the form and every
section are in `dist/client/index.html`). The only on-demand route is `/api/contact`, which
opts in with `export const prerender = false`. That's why `@astrojs/vercel` is installed —
no other page pays for a serverless function.

## Local development

```bash
npm install
cp .env.example .env    # then add SMTP_USER + SMTP_PASS (Gmail app password)
npm run dev             # http://localhost:4321 (includes the contact API route)
npm run build           # static assets in dist/client/ + function in .vercel/output/
npm run preview         # static server for dist/client (see note below)
npm run check           # Astro + TypeScript diagnostics
```

> **Preview note:** `@astrojs/vercel` does not support `astro preview`, so `npm run preview`
runs a small dependency-free static server (`scripts/serve.mjs`) over `dist/client`. It
serves the real production HTML/images but not the serverless function — use
`npm run dev` to exercise the contact form, or `vercel dev` to run the deployed function
locally.

---

## Case studies (content collections)

Each case study is a markdown file. Adding a file creates a page — no route or component
changes required.

```
src/content/case-studies/pencraft.md  →  /work/pencraft/
```

The URL is the filename. The schema in `src/content.config.ts` validates frontmatter at
build time, so a missing metric or malformed date fails the build instead of shipping a
broken page.

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Page `<h1>` and `<title>` |
| `description` | yes | Meta description, max 300 chars |
| `client`, `sector`, `period` | yes | Shown in the breadcrumb header |
| `role` | yes | Your scope on the project |
| `status` | no | Badge text, defaults to “Live in production” |
| `deck` | yes | The one-sentence standfirst under the H1 |
| `metrics` | yes | 1–4 `{ value, label, note? }` — the outcome band |
| `stack` | no | Tech chips under the header |
| `publishedAt` | yes | Drives `<time>` and Article JSON-LD |
| `updatedAt` | no | Sets `dateModified` |
| `draft` | no | `true` keeps it out of the build entirely |
| `cover`, `coverAlt` | no | Optional hero image, optimised at build |

Every entry automatically gets: a table of contents built from its `<h2>`s (desktop),
`Article` + `BreadcrumbList` JSON-LD, canonical URL, and a sitemap entry.

**To add the next one:** copy `pencraft.md`, change the filename (that's the URL), rewrite
the frontmatter, and write the body in plain markdown with `##` section headings. Use
`draft: true` while it's unfinished.

### Using these for outbound

The long-form page is the asset you send, not the homepage. When you email a prospect,
link the specific case study and name the outcome in the first line — e.g. *“I cut invalid
ad payouts 94% for a publisher; here's the architecture.”* Before a batch of outreach:

1. Add `public/images/og.png` (1200×630) and uncomment the `og:image` line in
   `Layout.astro`, otherwise shared links render without a preview card.
2. Add the real client quote and a dashboard screenshot to the case study — both are
   marked with `PROOF SLOT` / `METRIC SLOT` comments.
3. Keep the `/work/<slug>/` URL stable once you've sent it. Changing the filename breaks
   every link you've already emailed.

---

## Email delivery (Gmail SMTP or Resend)

Both `/api/contact` (the form) and `/api/lead` (demo bookings) send through
`src/lib/mail.ts`. That module picks a transport in this order:

1. **SMTP** — when `SMTP_USER` and `SMTP_PASS` are set. This is what a Gmail account uses.
2. **Resend** — when `RESEND_API_KEY` is set and SMTP is not.

So a bad app password can fall back to Resend instead of silently losing enquiries.

Both routes validate on the client (instant feedback) *and* on the server, reject bots with
a honeypot, and rate-limit to 3 submissions per 10 minutes per IP.

### Gmail SMTP setup (5 minutes)

1. Turn on **2-Step Verification** for the Google account.
2. Create an **App Password** at <https://myaccount.google.com/apppasswords>.
3. Put it in `.env` (or Vercel env vars):

```
SMTP_USER=reyanshoaib45@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

Spaces in the app password are stripped, so paste it as Google shows it.

**Your normal Gmail password will not work.** Google removed "less secure app" access, so
an App Password is the only way in — and it requires 2FA to exist. Use port 587
(STARTTLS, the default); Vercel blocks port 25.

Known limits, so they don't surprise you: free Gmail allows roughly 500 recipients/day
(2,000 on Workspace) — far above a portfolio's volume. Google occasionally flags mail sent
from a new datacenter IP as suspicious; if that happens, `RESEND_API_KEY` is your fallback
and the app password can be revoked without touching the site. Gmail also only lets you
send as the authenticated account, which is why `From` follows `SMTP_USER`.

### Resend (optional fallback)

Create a key at <https://resend.com/api-keys> and set `RESEND_API_KEY`. `onboarding@resend.dev`
can send to your own address immediately; for a branded sender, verify `reyanshoaib.com`
and set `CONTACT_FROM_EMAIL=Portfolio <hello@reyanshoaib.com>`.

### What each env var does

| Variable | Required | Default |
| --- | --- | --- |
| `SMTP_USER` | for SMTP | — (Gmail address or Workspace user) |
| `SMTP_PASS` | for SMTP | — (16-character app password) |
| `SMTP_HOST` | no | `smtp.gmail.com` |
| `SMTP_PORT` | no | `587` (use `465` for implicit TLS) |
| `RESEND_API_KEY` | fallback | — (used only when SMTP is unset) |
| `CONTACT_TO_EMAIL` | no | `reyanshoaib45@gmail.com` |
| `CONTACT_FROM_EMAIL` | no | follows `SMTP_USER`, else Resend's test sender |

### Verified behaviour (tested locally against the dev server)

Tested against a local SMTP server (`node scripts/smtp-sink.mjs 2525`), which accepts the
connection and prints each message — no real credentials needed:

| Request | Result |
| --- | --- |
| Valid `/api/contact` post | `200`, message received by the SMTP server |
| Valid `/api/lead` post (email or phone) | `200`, message received with name, contact, topic, timestamp |
| Bad name/email/short message | `422` with per-field messages |
| Honeypot field filled | `200`, silently discarded, no email sent |
| No transport configured | `500` with “email me directly” fallback text |
| 4th submission in 10 min | `429` |
| Lead with an unbuyable contact value | `422`, demo agent asks again |
| No-JS form post | `303` redirect to `/?sent=1#contact` |

`From` is `M Reyan Shoaib <SMTP_USER>` and `Reply-To` is the sender, so hitting reply in
your inbox goes straight back to the buyer.

**Known limitation:** the rate limiter is in-memory, so it resets on cold starts and each
concurrent function instance counts separately. It stops casual abuse, not a determined
attacker. If you ever need real limits, move the counter to Vercel KV or Upstash Redis.

## WhatsApp agent demo (Vue island)

`#demo`, placed directly after the case studies, is a clickable model of the agent you
sell: the visitor can tap suggestion chips or type free text, and the "agent" replies,
qualifies, offers a slot and hands off to a human.

Replies are **scripted, not generated by a model** — that is what keeps it free to serve and
keeps it from inventing a price or a client on your behalf. The booking step is real: it
asks for a name and an email/WhatsApp number, posts them to `/api/lead`, and that emails
you the lead. If delivery fails, the agent says so and points at your direct number
instead of pretending it worked.

Why Vue here and nowhere else: a portfolio is static HTML, but this one block needs state
(a message list, typing delay, intent tracking). Astro renders the first two messages at
build time and hydrates the component only when it scrolls into view, so the rest of the
page stays at zero framework cost.

| Concern | Where it lives |
| --- | --- |
| Reply script, keywords, chips | `STEPS`, `KEYWORDS`, `CHIP_ROUTES` in `src/components/WhatsAppDemo.vue` |
| Real number / link out | `site.whatsapp` in `src/config.ts` |
| Section heading, framing copy | `src/components/WhatsAppDemoSection.astro` |

**Editing the script:** `STEPS` is an ordered state machine — each entry has the bot
messages, the chips to show next, and the intent label displayed in the strip. Keywords in
`KEYWORDS` map free-typed text to an intent; anything unmatched falls into the clarify
branch, which is the behaviour to demo (a confident agent that refuses to guess).

**Script coverage:** services, pricing, scope, timeline, booking, human handoff, identity
("are you a bot?"), location/timezone, proof, plus small talk (greeting, "how are you",
thanks, goodbye) and a low-confidence fallback that explicitly refuses to guess.

**Verified:** chip routing, free-text classification, the full booking flow (asks name →
validates contact → rejects junk → emails the lead → shows "details sent to Reyan"),
`Reset` clearing lead state, the opening thread rendering without JavaScript, and zero
console errors. No horizontal overflow at 320/360/375/414/640/768/1024/1280/1440 px.

Note: the island's scoped styles are inlined in `<style>` tags by Astro and include a
`prefers-reduced-motion` rule for the typing animation.

## The 2-hour deploy runbook

### 0 — Pre-flight (10 min, do this first)

1. `grep -n PostgreSQL src/components/CaseStudies.astro` — the old site said PostgreSQL,
   you said MySQL. The case study currently says **MySQL**. Correct it if the live system
   is Postgres.
2. Open `src/config.ts` and confirm `booking.url`. It currently points at WhatsApp with a
   pre-filled message. A Cal.com link converts better with US/EU buyers — create one and
   replace the single `url` value; every CTA updates automatically.
3. Confirm `site.url` in `astro.config.mjs` and `src/config.ts` match your real domain.
   Sitemap and canonical URLs are generated from it.

### 1 — Verify locally (15 min)

```bash
npm install
npm run build && npm run preview
```

Check three things: the hero renders without JS (disable JS in devtools), the mobile menu
toggles at 375 px, and the FAQ items open.

### 2 — Commit (10 min)

```bash
git add -A
git commit -m "Rebuild portfolio as static Astro site; replace fetch loader and Bootstrap stack"
```

### 3 — Deploy to Vercel (20 min)

**Option A — CLI (fastest):**

```bash
npx vercel login
npx vercel           # accept defaults; Astro is auto-detected
npx vercel --prod
```

Build settings Vercel detects automatically: framework Astro, build `npm run build`,
install `npm install`. Because `@astrojs/vercel` is installed, Vercel reads
`.vercel/output/` and deploys the static assets plus the single `/api/contact` function.
**Do not** override the output directory to `dist` — that would break the API route.
Node 20+ is required (Astro 7); set it under Project → Settings → General →
Node.js Version if prompted.

**Option B — Git integration (recommended for ongoing work):**

1. Push the repo to GitHub.
2. Vercel → **Add New Project** → import the repo.
3. Framework preset: **Astro**. Build command: `npm run build`. Leave the output
   directory on the default — the adapter produces `.vercel/output/`.
4. Deploy. Every push to `main` ships automatically; every PR gets a preview URL.

### 4 — Domain (15 min)

Vercel → Project → Settings → Domains → add `reyanshoaib.com` and `www`. At your
registrar, point the apex `A` record at `76.76.21.21` and `www` `CNAME` at
`cname.vercel-dns.com` (Vercel shows the exact values for your project). TLS provisions
itself.

### 5 — Post-deploy verification (20 min)

```bash
curl -sI https://reyanshoaib.com | head -5          # expect 200 + text/html
curl -s https://reyanshoaib.com/robots.txt
curl -s https://reyanshoaib.com/sitemap-index.xml
curl -s https://reyanshoaib.com | grep -c "Cut a publisher"   # expect 1: content is in the HTML
curl -s -X POST https://reyanshoaib.com/api/contact \
  -H 'content-type: application/json' -H 'accept: application/json' \
  -d '{"name":"Test","email":"you@example.com","message":"Verifying the contact form works end to end."}'
# expect {"ok":true} and an email in your inbox
```

Then: add the property to Google Search Console, submit the sitemap, and run PageSpeed
Insights. Astro static output typically lands 95+ on mobile if the WebP portrait and
system fonts are left alone.

### 6 — What to do in the first week (not optional)

The rebuild removes the *technical* reasons the site underperformed. These remove the
*credibility* ones:

1. **Get one real client sentence.** Paste it into `CaseStudies.astro` at the
   `PROOF SLOT` comment. One attributable quote from the Pencraft client or the US team
   lead is worth more than this entire redesign.
2. **Add the dashboard screenshot** to the Pencraft card (blur sensitive data). A visual
   of the system beats three paragraphs describing it.
3. **Add usage numbers** to the WhatsApp agent at the `METRIC SLOT` comment once you have
   real conversations handled.
4. **Create `public/images/og.png`** (1200×630) and uncomment the `og:image` line in
   `Layout.astro`. Without it, links shared on Slack/LinkedIn/X render as plain text.
5. **Replace the WhatsApp-only booking flow** with a calendar link, and keep email as the
   second option. The US buyers you're targeting will not book a project over WhatsApp.

## Notes and constraints

- `legacy/` is excluded from the TypeScript config and never built. Delete it once you're
  happy with the new site (`git rm -r legacy`).
- Images use Astro's build-time sharp pipeline (`imageService: false` in the Vercel
  adapter), so they ship as static WebP under `/_astro` and work in preview. Side effect:
  sharp is bundled inside the serverless function (~23 MB, well under Vercel's 250 MB
  limit). If function size ever matters, move the portrait to a pre-generated static file
  in `public/` and drop `astro:assets` from the two avatar usages.
- The résumé is served from `public/resume/Reyan.pdf`.
- All claims on the page are ones you can defend in a call. Two blocks are deliberately
  empty and marked with comments (`PROOF SLOT`, `METRIC SLOT`) — fill them with real
  evidence, never invented numbers.
- No analytics is installed. If you add any, prefer a cookie-free option (Plausible,
  Vercel Analytics) so the site needs no consent banner.
- Scroll reveal is scoped to a `.js` class set by an inline script in `<head>`, so with
  JavaScript disabled every section renders fully visible instead of staying at
  `opacity: 0`. Keep that pattern if you add more animated sections.
- The Vue runtime (~76 KB) loads only when a visitor scrolls to the demo. If that weight
  ever matters more than the demo does, the same script can be ported to a plain
  `<script>` block — nothing else on the page depends on Vue.
