<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { site } from '../config';

type Sender = 'user' | 'agent';

interface Message {
  id: number;
  from: Sender;
  text: string;
}

interface Step {
  /** What the agent says, one bubble per line. `{name}` is replaced at runtime. */
  reply: string[];
  /** Suggested replies shown to the visitor. */
  chips: string[];
  /** Label shown in the demo's classifier strip. */
  intent: string;
  /** Swallow the next free-text message into this lead field instead of routing it. */
  capture?: 'name' | 'contact';
  /** Send the captured lead to /api/lead once this step has been spoken. */
  submit?: boolean;
}

/**
 * Scripted conversation. The production agent uses an LLM with tool-calling;
 * this island exists so a visitor can *feel* the flow without a backend.
 */
const STEPS: Record<string, Step> = {
  start: {
    intent: 'greeting',
    reply: [
      'Hey — I’m Reyan’s WhatsApp agent.',
      'I reply in seconds, qualify leads, book calls, and hand off to a human when I should. This is a scripted demo of that flow.',
    ],
    chips: ['What do you build?', 'How much does it cost?', 'Book a call', 'Talk to a human'],
  },
  services: {
    intent: 'services',
    reply: [
      'Four things: AI automation audits, WhatsApp sales agents, content engines, and internal systems built on Laravel + Vue.',
      'Almost everything starts with a paid audit — it maps every manual step and gives you a ranked automation plan.',
    ],
    chips: ['How much does it cost?', 'How long does it take?', 'Book a call'],
  },
  pricing: {
    intent: 'pricing',
    reply: [
      'Fixed price, agreed after a 20-minute scope call. No hourly billing.',
      'Audits start at $1,500 and are credited toward the build. WhatsApp agents from $4,500. Internal systems from $12,000.',
    ],
    chips: ['What’s included?', 'Book a call', 'Talk to a human'],
  },
  included: {
    intent: 'scope',
    reply: [
      'The agent build includes the Laravel webhook and queue workers on your own number, LLM tool-calling grounded in your pricing and FAQs, lead qualification, booking, an admin dashboard, and a handoff threshold you set.',
      'You own the code, the number and the data at handover.',
    ],
    chips: ['How long does it take?', 'Book a call'],
  },
  timeline: {
    intent: 'timeline',
    reply: [
      'An audit is five working days. A WhatsApp agent is usually two to three weeks. Custom systems run four to eight weeks.',
      'I only take two builds at a time, so the date I quote is one I can hit.',
    ],
    chips: ['Book a call', 'Talk to a human'],
  },
  booking: {
    intent: 'booking',
    reply: [
      'Happy to. The real agent asks this first: what’s the manual workflow you want gone?',
    ],
    chips: ['WhatsApp orders', 'Content production', 'Internal systems', 'Something else'],
  },
  leadWhatsApp: {
    intent: 'lead.qualify',
    reply: [
      'That’s the most common one — orders arriving in WhatsApp and someone retyping them into a sheet.',
      'Let’s get you a slot. I’ll take your details and Reyan confirms the time personally.',
    ],
    chips: ['See available times', 'Talk to a human'],
  },
  leadContent: {
    intent: 'lead.qualify',
    reply: [
      'Content is a good one — drafting, fact-checking and publishing with a human approval step, so nothing goes out unchecked.',
      'Let’s get you a slot. I’ll take your details and Reyan confirms the time personally.',
    ],
    chips: ['See available times', 'Talk to a human'],
  },
  leadInternal: {
    intent: 'lead.qualify',
    reply: [
      'Then the audit maps the spreadsheets first — most internal “systems” are three sheets and a person who remembers the rules.',
      'Let’s get you a slot. I’ll take your details and Reyan confirms the time personally.',
    ],
    chips: ['See available times', 'Talk to a human'],
  },
  leadOther: {
    intent: 'lead.qualify',
    reply: [
      'That’s fine — the audit is where the unknown gets priced.',
      'This is exactly where I’d hand over to Reyan rather than guess, so let me just take your details.',
    ],
    chips: ['See available times', 'Talk to a human'],
  },
  askName: {
    intent: 'booking.name',
    reply: ['Before I hold a slot — what’s your name?'],
    chips: [],
    capture: 'name',
  },
  askContact: {
    intent: 'booking.contact',
    reply: [
      'Thanks, {name}. Where should Reyan send the confirmation — email or WhatsApp number?',
      'Either is fine, I just need one.',
    ],
    chips: [],
    capture: 'contact',
  },
  confirming: {
    intent: 'booking.submit',
    reply: ['Sending that to Reyan now…'],
    chips: [],
    submit: true,
  },
  booked: {
    intent: 'booking.confirmed',
    reply: [
      'You’re in, {name}. Reyan has your details and will confirm a time on WhatsApp — usually within a few hours.',
      'If you’d rather not wait, message him directly and mention you booked through the demo.',
    ],
    chips: ['Talk to a human', 'What do you build?'],
  },
  leadFailed: {
    intent: 'booking.failed',
    reply: [
      'My connection to Reyan’s inbox just failed — that’s on me, not you.',
      'Message him directly and I’ll make sure your details get picked up. Sorry about the extra step.',
    ],
    chips: ['Talk to a human'],
  },
  aboutAgent: {
    intent: 'meta.identity',
    reply: [
      'I’m an AI agent on Reyan’s number. I answer instantly, qualify, book calls, and hand over to him when I’m not sure.',
      'The build behind me is Laravel webhooks, queue workers, and an LLM with tool-calling grounded in his pricing and FAQs — not a keyword menu.',
    ],
    chips: ['What do you build?', 'How much does it cost?', 'Book a call'],
  },
  location: {
    intent: 'about.location',
    reply: [
      'Reyan works from Pakistan (UTC+5) with US and EU teams — six months embedded with a US product team across an 8-hour offset.',
      'Overlap is the EU morning plus the US East Coast morning into the afternoon.',
    ],
    chips: ['Book a call', 'What do you build?'],
  },
  proof: {
    intent: 'about.proof',
    reply: [
      'Two live systems: a fraud-detection pipeline that cut invalid ad payouts 94%, and a WhatsApp order agent that replaced someone retyping orders into a sheet.',
      'The full write-up, including what broke, is on the Pencraft case study page.',
    ],
    chips: ['Book a call', 'How much does it cost?'],
  },
  greeting: {
    intent: 'smalltalk.greeting',
    reply: [
      'Hey — good to see you here.',
      'I can explain what Reyan builds, what it costs, or put you straight into his calendar. What are you working on?',
    ],
    chips: ['WhatsApp orders', 'Content production', 'Internal systems', 'Something else'],
  },
  howAreYou: {
    intent: 'smalltalk.howareyou',
    reply: [
      'Doing well — answering faster than Reyan could. 😄',
      'What brings you here: a bot for WhatsApp, or something internal?',
    ],
    chips: ['WhatsApp orders', 'Internal systems', 'Something else'],
  },
  thanks: {
    intent: 'smalltalk.thanks',
    reply: [
      'Anytime.',
      'If you want the 20-minute audit, I can take your details now — the call itself is free.',
    ],
    chips: ['Book a call', 'What do you build?'],
  },
  bye: {
    intent: 'smalltalk.bye',
    reply: [
      'Sounds good. I’m here 24/7 if something comes up.',
      'When you’re ready, the audit is the cheapest way to find out what’s worth automating.',
    ],
    chips: ['Book a call'],
  },
  human: {
    intent: 'handoff',
    reply: [
      'Handing you to Reyan — my confidence dropped below the threshold, so I stop instead of guessing.',
      `Direct line: ${site.whatsappAgentNumber}. That’s his number, not mine; he answers it himself.`,
    ],
    chips: ['What do you build?', 'How much does it cost?'],
  },
  fallback: {
    intent: 'unknown',
    reply: [
      'I don’t have a solid answer for that one, and I won’t guess at it.',
      'That’s exactly where a real agent should stop: flag low confidence, tell Reyan, and let him answer properly.',
    ],
    chips: ['Talk to a human', 'What do you build?', 'How much does it cost?'],
  },
};

/** Most specific first: business intents win over small talk when both appear. */
const KEYWORDS: Array<[RegExp, string]> = [
  [
    /\b(are you (a |an )?(bot|robot|ai|human|real)|real person|is this a (bot|human)|chat ?bot|automated)\b/i,
    'aboutAgent',
  ],
  [/\b(where (are|is) (you|he|reyan)|based|located|location|time ?zone|country|utc)\b/i, 'location'],
  [/\b(proof|portfolio|case stud|examples?|past work|results?|clients?|show me)\b/i, 'proof'],
  [/\b(price|pricing|cost|much|budget|charge|rate|quote|expensive|cheap)\b/i, 'pricing'],
  [/\b(book|call|meeting|schedule|calendar|availability|available times?|slot|appointment)\b/i, 'booking'],
  [/\b(human|person|speak|handoff|talk to reyan|real number)\b/i, 'human'],
  [/\b(how long|timeline|weeks?|days?|fast|deadline|start)\b/i, 'timeline'],
  [/\b(includ|scope|deliverable|what do i get)\b/i, 'included'],
  [/\b(build|service|do you|offer|what can|automation|bot|laravel|vue|mysql)\b/i, 'services'],
  [/^(hi|hey|hello|yo|salam|assalam\s?o?\s?alaikum|good (morning|afternoon|evening))\b/i, 'greeting'],
  [/\b(how are (you|u)|how'?s it going|how are things|what'?s up|how do you do)\b/i, 'howAreYou'],
  [/\b(thanks|thank you|thx|shukriya|appreciate it)\b/i, 'thanks'],
  [/\b(bye|goodbye|see you|later|that'?s all|talk later)\b/i, 'bye'],
];

const CHIP_ROUTES: Record<string, string> = {
  'What do you build?': 'services',
  'How much does it cost?': 'pricing',
  'What’s included?': 'included',
  'How long does it take?': 'timeline',
  'Book a call': 'booking',
  'Talk to a human': 'human',
  'WhatsApp orders': 'leadWhatsApp',
  'Content production': 'leadContent',
  'Internal systems': 'leadInternal',
  'Something else': 'leadOther',
  'See available times': 'askName',
};

let nextId = 1;

const seed = (): Message[] => [
  ...STEPS.start.reply.map((text) => ({ id: nextId++, from: 'agent' as Sender, text })),
];

const messages = ref<Message[]>(seed());
const chips = ref<string[]>([...STEPS.start.chips]);
const intent = ref(STEPS.start.intent);
const typing = ref(false);
const draft = ref('');
const lead = ref({ name: '', contact: '' });
const pendingCapture = ref<null | 'name' | 'contact'>(null);
const sending = ref(false);
const leadSent = ref(false);
const topic = ref('');
const openedWith = ref('');
const logEl = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);

const prefersReduced = ref(false);

const canSend = computed(() => draft.value.trim().length > 0 && !typing.value && !sending.value);

const CONTACT_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

function validContact(value: string): boolean {
  if (CONTACT_RE.test(value)) return true;
  return PHONE_RE.test(value) && (value.match(/\d/g) ?? []).length >= 7;
}

function wait(ms: number) {
  if (prefersReduced.value) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function scrollToEnd() {
  nextTick(() => {
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight;
  });
}

watch(messages, scrollToEnd, { deep: true, flush: 'post' });

onMounted(() => {
  prefersReduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scrollToEnd();
});

async function sendLead() {
  sending.value = true;

  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        name: lead.value.name,
        contact: lead.value.contact,
        topic: topic.value,
        notes: openedWith.value ? `Opened with: “${openedWith.value}”` : '',
      }),
    });

    if (!response.ok) throw new Error(`lead endpoint returned ${response.status}`);

    leadSent.value = true;
    await runStep('booked');
  } catch (error) {
    console.warn('[demo] lead delivery failed:', error);
    await runStep('leadFailed');
  } finally {
    sending.value = false;
  }
}

async function runStep(key: string) {
  const step = STEPS[key] ?? STEPS.fallback;

  // Remember which service they came in through, so the email says what they want.
  if (key.startsWith('lead')) topic.value = key.slice(4).toLowerCase();

  typing.value = true;
  chips.value = [];
  pendingCapture.value = null;
  scrollToEnd();

  const firstDelay = 420 + Math.min(600, (step.reply[0]?.length ?? 0) * 8);
  await wait(firstDelay);

  for (const [index, raw] of step.reply.entries()) {
    const text = raw.replace('{name}', lead.value.name || 'there');
    messages.value.push({ id: nextId++, from: 'agent', text });
    typing.value = index < step.reply.length - 1;
    scrollToEnd();
    if (index < step.reply.length - 1) await wait(650 + Math.min(500, text.length * 5));
  }

  typing.value = false;
  chips.value = [...step.chips];
  intent.value = step.intent;
  pendingCapture.value = step.capture ?? null;

  if (step.submit) await sendLead();
}

function classify(text: string): string {
  for (const [pattern, key] of KEYWORDS) {
    if (pattern.test(text)) return key;
  }
  return 'fallback';
}

async function submit(text: string, route?: string) {
  const clean = text.trim();
  if (!clean || typing.value || sending.value) return;

  messages.value.push({ id: nextId++, from: 'user', text: clean });
  if (!openedWith.value && !route) openedWith.value = clean;
  draft.value = '';
  scrollToEnd();

  // Mid-booking: the next message is a name or a contact, not an intent.
  if (pendingCapture.value === 'name') {
    lead.value.name = clean.slice(0, 80);
    pendingCapture.value = null;
    await runStep('askContact');
    return;
  }

  if (pendingCapture.value === 'contact') {
    if (!validContact(clean)) {
      messages.value.push({
        id: nextId++,
        from: 'agent',
        text: 'That doesn’t look like an email or a number — mind checking it? Either one works.',
      });
      scrollToEnd();
      return;
    }

    lead.value.contact = clean.slice(0, 160);
    pendingCapture.value = null;
    await runStep('confirming');
    return;
  }

  const key = route ?? CHIP_ROUTES[clean] ?? classify(clean);
  await runStep(key);
}

function onChip(chip: string) {
  void submit(chip, CHIP_ROUTES[chip]);
}

function onSubmit() {
  if (canSend.value) void submit(draft.value);
}

function reset() {
  messages.value = seed();
  chips.value = [...STEPS.start.chips];
  intent.value = STEPS.start.intent;
  typing.value = false;
  sending.value = false;
  leadSent.value = false;
  pendingCapture.value = null;
  lead.value = { name: '', contact: '' };
  topic.value = '';
  openedWith.value = '';
  draft.value = '';
  inputEl.value?.focus();
  scrollToEnd();
}
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_24px_60px_-32px_rgba(0,0,0,0.9)]"
  >
    <!-- Header -------------------------------------------------------- -->
    <div class="flex items-center gap-3 border-b border-line/80 bg-panel-2 px-4 py-3">
      <span
        class="grid size-9 shrink-0 place-items-center rounded-full bg-accent/15 font-mono text-[11px] font-bold text-accent ring-1 ring-accent/30"
        aria-hidden="true"
      >
        RS
      </span>
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold">Reyan’s agent</p>
        <p class="flex items-center gap-1.5 text-[11px] text-muted">
          <span class="size-1.5 rounded-full bg-accent" aria-hidden="true"></span>
          online · replies in seconds
        </p>
      </div>
      <button
        type="button"
        class="ml-auto rounded-md border border-line px-2 py-1 font-mono text-[10px] tracking-wide text-muted uppercase transition hover:border-accent/40 hover:text-fg"
        @click="reset"
      >
        Reset
      </button>
    </div>

    <!-- Thread -------------------------------------------------------- -->
    <div
      ref="logEl"
      class="h-[22rem] space-y-2.5 overflow-y-auto bg-ink px-4 py-4 sm:h-[24rem]"
      role="log"
      aria-live="polite"
      aria-label="Demo conversation with Reyan’s agent"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="message.from === 'user' ? 'justify-end' : 'justify-start'"
      >
        <p
          class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line"
          :class="
            message.from === 'user'
              ? 'rounded-br-sm bg-accent text-accent-ink'
              : 'rounded-bl-sm border border-line/80 bg-panel-2 text-fg'
          "
        >
          {{ message.text }}
        </p>
      </div>

      <div v-if="typing" class="flex justify-start" aria-label="Agent is typing">
        <span class="flex gap-1 rounded-2xl rounded-bl-sm border border-line/80 bg-panel-2 px-3.5 py-3">
          <span class="typing-dot size-1.5 rounded-full bg-muted"></span>
          <span class="typing-dot size-1.5 rounded-full bg-muted"></span>
          <span class="typing-dot size-1.5 rounded-full bg-muted"></span>
        </span>
      </div>

      <p v-if="leadSent" class="pt-1 font-mono text-[10px] tracking-wide text-accent uppercase">
        ✓ details sent to Reyan
      </p>
    </div>

    <!-- Quick replies ------------------------------------------------- -->
    <div class="border-t border-line/80 bg-panel px-3 pt-3">
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="chip in chips"
          :key="chip"
          type="button"
          class="rounded-full border border-line px-2.5 py-1.5 text-[11px] text-muted transition hover:border-accent/40 hover:text-fg disabled:opacity-50"
          :disabled="typing"
          @click="onChip(chip)"
        >
          {{ chip }}
        </button>
      </div>
    </div>

    <!-- Composer ------------------------------------------------------ -->
    <form class="flex items-center gap-2 bg-panel px-3 py-3" @submit.prevent="onSubmit">
      <label for="demo-message" class="sr-only">Type a message</label>
      <input
        id="demo-message"
        ref="inputEl"
        v-model="draft"
        type="text"
        autocomplete="off"
        placeholder="Type a message…"
        :disabled="typing || sending"
        class="min-w-0 flex-1 rounded-lg border border-line bg-ink px-3 py-2 text-[13px] text-fg placeholder:text-muted/60 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/15 disabled:opacity-60"
      />
      <button
        type="submit"
        :disabled="!canSend"
        class="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span class="sr-only">Send</span>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M2 8h11M8.5 3 13 8l-4.5 5"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </form>

    <!-- Classifier strip ---------------------------------------------- -->
    <div
      class="flex items-center justify-between gap-3 border-t border-line/80 bg-panel-2 px-4 py-2 font-mono text-[9px] tracking-wide text-muted/70 uppercase"
    >
      <span>intent · {{ intent }}</span>
    </div>
  </div>
</template>

<style scoped>
.typing-dot {
  animation: demo-blink 1.1s infinite ease-in-out;
}
.typing-dot:nth-child(2) {
  animation-delay: 0.15s;
}
.typing-dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes demo-blink {
  0%,
  80%,
  100% {
    opacity: 0.25;
  }
  40% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .typing-dot {
    animation: none;
    opacity: 0.5;
  }
}
</style>
