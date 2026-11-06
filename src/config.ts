/**
 * Single source of truth for every link, price and claim on the site.
 * Change it here, not in six components.
 */
export const site = {
  name: 'M Reyan Shoaib',
  initials: 'RS',
  role: 'AI-native product engineer',
  location: 'Pakistan · working with US & EU teams',
  url: 'https://reyanshoaib.com',
  email: 'reyanshoaib45@gmail.com',
  phoneDisplay: '+92 316 893 0791',
  phoneRaw: '923168930791',

  github: 'https://github.com/Reyanshoaib45',
  linkedin: 'https://www.linkedin.com/in/reyan-shoaib-7598b23a0/',
  resume: '/resume/Reyan.pdf',

  /**
   * Primary CTA target. Swap `url` for your Cal.com / Calendly link once you
   * have one — every "Book" button on the site reads from this object.
   */
  booking: {
    label: 'Book a 20-min audit',
    url: 'https://wa.me/923168930791?text=Hi%20Reyan%2C%20I%27d%20like%20to%20book%20a%2020-min%20automation%20audit.',
  },

  /** The live WhatsApp agent — your best proof asset. */
  whatsapp: 'https://wa.me/923168930791?text=Hi%20Reyan%2C%20I%20want%20to%20try%20the%20WhatsApp%20agent.',
  whatsappAgentNumber: '+92 316 893 0791',
} as const;

/** Headline proof. Every number here is one you can defend in a call. */
export const metrics = [
  { value: '94%', label: 'reduction in invalid ad payouts', sub: 'live client, 60 days' },
  { value: '50K+', label: 'events processed per day', sub: 'no data loss' },
  { value: '40h → 4h', label: 'weekly manual review removed', sub: 'same team, automation' },
  { value: '6 mo', label: 'embedded with a US product team', sub: '8-hour timezone offset' },
] as const;

/** Productized offers. Outcome first, price second. */
export const offers = [
  {
    name: 'Automation Audit',
    outcome: 'Find every manual hour you can delete.',
    pitch:
      'I map your operation end to end, price the manual work, and hand you a ranked list of what to automate first. No code required to start.',
    deliverables: [
      'Workflow map of every manual step, with hours and cost',
      'Ranked automation plan (impact vs. effort)',
      'Written scope + fixed price for the highest-value build',
      '60-minute walkthrough with your team',
    ],
    timeline: '5 working days',
    price: 'from $1,500',
    note: 'Fully credited toward the build if you go ahead.',
    href: '#work',
    featured: false,
  },
  {
    name: 'WhatsApp Sales Agent',
    outcome: 'Answer, qualify and book — 24/7, in your brand voice.',
    pitch:
      'An AI agent on your WhatsApp number that replies in seconds, qualifies leads against your rules, books calls, and hands off to a human when it should.',
    deliverables: [
      'Laravel webhook + queue worker on your own number',
      'LLM tool-calling with your pricing, stock and FAQs',
      'Lead qualification and calendar booking',
      'Admin dashboard: every conversation, logged in MySQL',
      'Human handoff at a confidence threshold you set',
    ],
    timeline: '2–3 weeks',
    price: 'from $4,500',
    note: 'You own the code, the number and the data.',
    href: '#contact',
    featured: true,
  },
  {
    name: 'Content Engine',
    outcome: 'Publish consistently without hiring a content team.',
    pitch:
      'An AI-assisted pipeline that drafts, fact-checks, formats and queues your content — with a human approval step you control.',
    deliverables: [
      'Research → draft → review pipeline with approval gates',
      'Brand voice profile and prompt library',
      'Automated publishing to your CMS / socials',
      'Performance tracking per piece',
    ],
    timeline: '3–4 weeks',
    price: 'from $6,000',
    note: 'Built on your stack or mine.',
    href: '#contact',
    featured: false,
  },
  {
    name: 'Internal System',
    outcome: 'Replace the spreadsheets your business actually runs on.',
    pitch:
      'Custom Laravel + Vue operations software: inventory, orders, payments, permissions — with database constraints so bad data is rejected, not cleaned up later.',
    deliverables: [
      'Schema designed so invalid states are impossible',
      'Role-based access + audit trail on every write',
      'Vue admin interface your team will actually use',
      'Deployment, backups and monitoring',
    ],
    timeline: '4–8 weeks',
    price: 'from $12,000',
    note: 'Fixed price after scope call. No hourly billing.',
    href: '#contact',
    featured: false,
  },
] as const;

export const faqs = [
  {
    q: 'You’re 18. How do I know you’ll finish the project?',
    a: 'Fair question — so the risk sits with me, not you. You get a written scope and fixed price before work starts, a working demo every Friday, and the final payment is only due at handover. If I stop delivering, you stop paying. I’ve also shipped and maintained live production systems, including a fraud-detection pipeline a publisher depends on daily — the case studies above are real deployments, not mockups.',
  },
  {
    q: 'What timezone do you work in, and how do we communicate?',
    a: 'I’m on PKT (UTC+5), which overlaps the EU morning and the US East Coast morning-to-afternoon. I spent six months embedded with a US product team across an 8-hour offset, so async-first is my default: written updates, Loom walkthroughs, and a weekly call at a time that works for you. Slack, WhatsApp or email — your choice.',
  },
  {
    q: 'Who owns the code and the data?',
    a: 'You do, fully, on final payment. That means the Git repository, database schema and migrations, deployment configuration, documentation, and recorded walkthroughs. No lock-in, no licence fee, no “contact the developer to change the text” clause. Your WhatsApp number, API keys and data stay in your accounts.',
  },
  {
    q: 'How fast can something be live?',
    a: 'An audit is 5 working days. A WhatsApp agent is typically 2–3 weeks from kickoff. A custom internal system runs 4–8 weeks depending on scope. I only take two builds at a time, so the timeline I quote is the timeline I can actually hit.',
  },
  {
    q: 'Can I see the code quality before paying for a build?',
    a: 'Yes — that’s what the paid audit is for. You get a real architectural review of your current system, written findings, and a ranked fix list, credited in full against the build if you continue. You can also review the repository history and code style on GitHub before we start.',
  },
  {
    q: 'Do you work with my existing team or stack?',
    a: 'Yes. Most of my work sits inside someone else’s codebase. I’m strongest in Laravel, Vue, MySQL, JavaScript and Linux hosting, and I’m comfortable joining your Git workflow, code review and sprint process rather than replacing it.',
  },
  {
    q: 'What happens after launch?',
    a: 'Every build includes 30 days of bug fixes at no extra cost, plus the documentation and walkthroughs your team needs to run it. After that, ongoing support is optional at a fixed monthly rate — you’re never forced into a retainer to keep your own system running.',
  },
  {
    q: 'How do payments work?',
    a: 'Fixed price, agreed in writing after a 30-minute scope call. 50% to start, 50% at handover. No hourly billing, no surprise invoices, and no charge for the call where we work out whether this is a fit.',
  },
] as const;
