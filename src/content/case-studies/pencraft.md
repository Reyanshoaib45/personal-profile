---
title: "How I cut a publisher’s invalid ad payouts by 94%"
description: "A live publisher was losing roughly $2,000 a month to invalid clicks and spending 40 hours a week reviewing traffic by hand. This is the architecture that removed 94% of invalid payouts in 60 days — and why the fix was not a better filter."
client: "Pencraft.wiki"
sector: "Digital publishing · ad monetization"
period: "2024 — present"
role: "Sole engineer — architecture, backend, admin dashboard"
status: "Live in production"
deck: "The publisher wasn’t short of fraud rules. It was short of a place for those rules to live where they couldn’t be skipped."
metrics:
  - value: "94%"
    label: "reduction in invalid payouts"
    note: "measured over 60 days"
  - value: "40h → 4h"
    label: "weekly manual review"
    note: "same team, no new hires"
  - value: "50K+"
    label: "events processed daily"
    note: "no data loss"
  - value: "15+"
    label: "fraud rules in production"
    note: "each versioned and auditable"
stack:
  - Laravel
  - MySQL
  - Redis queues
  - Vue
  - Ad network APIs
publishedAt: 2026-11-06
---

## The situation

Pencraft.wiki is a content site that pays its bills with advertising. Traffic arrives from search and social, gets served ads, and those impressions and clicks turn into revenue shared with the ad network. That model rests on one fragile assumption: the traffic is real.

It wasn't. A meaningful share of the clicks being billed came from bots, click farms and recycled residential proxies. The network pays on volume, so every invalid click was a small payment for nothing — and, worse, a quality signal that put the account at risk.

By the time I was involved, the numbers looked like this:

- roughly **$2,000 a month** leaving the business in invalid payouts;
- **40 hours a week** of a person's time spent manually reviewing traffic reports;
- an ad network that had already flagged traffic quality and was threatening suspension.

The last one was the real emergency. Losing the account wasn't a revenue dip; it was the end of the business model.

## What was actually going wrong

The instinct is to treat this as a filtering problem: buy a bot-detection service, add a blocklist, move on. But when I mapped the actual flow, the problem wasn't the absence of rules. The site already had checks. They were just in the wrong place.

Validation lived in controllers. Each entry point — the public click endpoint, the admin import, the nightly backfill job — carried its own copy of the same logic, and each copy had drifted. A rule added to one path was missing from the other two. Some checks ran *after* the payout record was written, which meant the money had already moved by the time anything noticed.

So the site had rules, and still accumulated invalid data, because there was no single place where "this click is valid" was decided. Three paths, three versions of the truth.

That's an architectural problem, not a detection problem. More rules would have made it worse.

## Why the obvious fix doesn't hold

Adding stricter checks in the application layer fails for a structural reason: application-layer validation is optional. It only runs if a request passes through the code path that calls it. Anything that writes another way — a console command, a queue retry, a manual fix during an incident — skips it entirely.

The result is the worst of both worlds. The system looks protected, because the checks exist, and quietly isn't, because they can be bypassed. Every bypass stays invisible until someone reconciles the numbers weeks later.

If a rule matters — if money is paid on it — it cannot live somewhere that can be skipped.

## The constraint that shaped the design

Three requirements narrowed the design more than any technology choice:

1. **No silent rejections.** Rejected traffic had to be explainable. If the ad network asked why a click wasn't paid, the answer needed to be a specific rule and the evidence behind it, not "the system said no."
2. **No blocking the read path.** Legitimate readers could not wait on a fraud score before seeing the page. Enforcement belongs where the money is decided, not where the content is served.
3. **No new incidents on the human side.** The team reviewing traffic didn't want a dashboard with forty new fields. They wanted fewer things to review, and confidence in the ones that surfaced.

That third constraint is the one engineers underestimate. A system that produces more information than a team can act on hasn't solved anything — it has moved the 40 hours somewhere else.

## What I built

### A rule catalogue, not a filter

I started by turning every fraud indicator into an explicit, versioned rule with an identifier and a human-readable reason. Fifteen shipped in the first release: IP reputation, request timing, interaction behaviour on the click event, subnet clustering, click-to-impression ratio per session, referrer consistency, user-agent anomalies, and a handful of patterns specific to this site's traffic mix.

The catalogue matters more than any individual rule. A rule you can name, version, disable and audit is a rule you can defend. A regex buried in a controller is not.

### Invariants in the schema

Anything that must never be true regardless of code path became a database-level invariant: a payout cannot exist without a decision record, a decision cannot exist without the rule version that produced it, and a settled payout cannot be rewritten. Foreign keys and constraints enforce the shape; a state machine enforces which transitions are legal.

This is the part that made the system hold. The application can be wrong — a bug, a retry, a manual command — and the database still refuses to store an impossible state. Rules that matter belong where they cannot be bypassed.

### A queue pipeline with a budget

Scoring runs on Redis queues, decoupled from request handling. An event arrives, gets enriched with IP reputation, session context and recent history, is scored against the active rule catalogue, and produces a decision with its evidence attached.

Decoupling was deliberate. It let me add checks without adding latency to the page, and it meant a slow reputation lookup couldn't take the site down. The trade-off is eventual consistency — so the payout step waits on the decision rather than assuming it.

### Every rejection explains itself

Each decision stores the rules that fired, the weight each carried, and the inputs that triggered them. A snapshot, not a pointer to live data that will have changed by the time someone reviews the case.

That single decision changed the conversation with the ad network. Instead of "we think this is fraud," it became "this click failed rules R-04, R-07 and R-11 — here is the evidence." Disputes stopped being arguments about judgement and became reviews of specific evidence.

### A dashboard for the humans

The review dashboard surfaces what can be acted on: which rules are firing, on what kind of traffic, and which decisions are borderline enough to deserve a person. The 40 hours of manual review didn't shrink because the work got faster. It shrank because most of the work stopped existing.

### Alerts that fire before the network does

Rule firing rates are monitored as a time series. A spike means one of two things: a new attack, or a rule mis-firing on legitimate traffic. Both need a human quickly, and both are cheaper to detect from your own data than from a suspension notice.

## The results

Within 60 days of the first release:

- **94%** reduction in invalid click payouts;
- weekly manual review down from **40 hours to about four**;
- **50,000+ events a day** processed with no data loss;
- zero quality escalations from the ad network.

The number I care about most is the second one. The payout reduction is the headline, but recovering roughly 36 hours a week is what changed how the team worked — that time went back into content, which is what actually grows the business.

## What broke along the way

Three things, in order of how much they cost.

**False positives on privacy-conscious users.** VPN and privacy-browser users look like proxies. Early rules caught them, and real readers lost ad revenue for the publisher. The fix was a review queue for borderline decisions and per-rule confidence instead of a single yes/no — but it should have existed on day one, before the first rule shipped.

**Queue backlog during traffic spikes.** Decoupling saved the page, but when a reputation lookup slowed down, decisions arrived after payouts were queued. The resolution was an explicit ordering rule: settlement waits for a decision, and undecided events are held, never assumed valid.

**Rule drift in the first two weeks.** Several of the fifteen rules were tuned three or four times as real traffic contradicted our assumptions. That's normal. The mistake would have been shipping rules without a way to watch their firing rates and disable them individually — versioning every rule and logging every decision is what made tuning safe.

## What I'd do differently

**Build observability before rules.** The dashboard and alerting shipped alongside detection. They should have come first. Without them, every rule change is a guess, and you can't tell an attack from a bug.

**Make the false-positive path a first-class feature.** The review queue was an afterthought. Any system that says "no" to real users needs a designed path for a human to say "actually, yes" — with that decision logged too.

**Start with the invariants.** The schema work took the longest and looked the least impressive. It is the reason the results held after launch instead of decaying back to the old baseline.

## If your site has this problem

Four questions worth answering about your own setup:

1. **Where is "valid" actually decided?** If the answer is "in the controller," you have as many versions of the truth as you have entry points.
2. **Can a payout exist without a decision?** If a foreign key doesn't say no, a bug eventually says yes.
3. **Can you explain a rejection to a third party?** Not "our system flagged it" — which rule, what evidence, and when.
4. **What does human review actually look like?** If the dashboard grows every time the system improves, you've automated detection and not the work.

The pattern generalises well beyond ad fraud. Anywhere money moves on the basis of a judgement — payouts, refunds, credits, approvals — the same rule applies: put the decision where it can't be skipped, and keep the evidence.
