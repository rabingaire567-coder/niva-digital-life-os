import type { AiBrief, AiPlan, Category, ItemDraft, Jurisdiction, LifeItem } from '@/types';
import { entryFor, DEFAULT_ENTRY, KNOWLEDGE } from '@/lib/knowledge';
import { addDays, countdown, daysLeft, formatDate, parseDate, toISO, today } from '@/lib/date';

const MONTHS: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8,
  september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

const JURIS: { code: Jurisdiction; words: string[] }[] = [
  { code: 'NP', words: ['nepal', 'nepali', 'kathmandu', 'lalitpur', 'bhaktapur', 'pokhara', 'biratnagar'] },
  { code: 'IN', words: ['india', 'indian', 'delhi', 'mumbai', 'kolkata', 'chennai', 'bangalore', 'aadhaar'] },
  { code: 'AE', words: ['uae', 'dubai', 'abu dhabi', 'emirates', 'sharjah'] },
  { code: 'US', words: ['usa', 'u.s.', 'united states', 'america', 'new york', 'california', 'texas', 'green card'] },
  { code: 'UK', words: ['uk', 'united kingdom', 'britain', 'england', 'london', 'scotland'] },
];

function pickJurisdiction(text: string): Jurisdiction {
  const t = text.toLowerCase();
  for (const j of JURIS) if (j.words.some((w) => t.includes(w))) return j.code;
  return 'OTHER';
}

function scoreEntry(text: string) {
  const t = ` ${text.toLowerCase()} `;
  let best: { kind: string; score: number } | null = null;
  for (const e of KNOWLEDGE) {
    let score = 0;
    for (const k of e.keywords) if (t.includes(k)) score += k.includes(' ') ? 3 : 2;
    if (score > 0 && (!best || score > best.score)) best = { kind: e.kind, score };
  }
  return best;
}

/** Extracts a date from free text. Returns the date plus how confident we are. */
export function extractDate(text: string): { iso: string | null; confidence: number; evidence: string } {
  const t = text.toLowerCase();

  const iso = t.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return { iso: `${iso[1]}-${iso[2]}-${iso[3]}`, confidence: 0.98, evidence: iso[0] };

  const dmy = t.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    let year = Number(dmy[3]);
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { iso: toISO(new Date(year, month - 1, day)), confidence: 0.85, evidence: dmy[0] };
    }
  }

  // "12 March 2027" / "March 12, 2027"
  const monthFirst = t.match(/\b([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/);
  if (monthFirst) {
    const mi = MONTHS[monthFirst[1]];
    const day = Number(monthFirst[2]);
    if (mi !== undefined && day >= 1 && day <= 31) {
      return { iso: toISO(new Date(Number(monthFirst[3]), mi, day)), confidence: 0.92, evidence: monthFirst[0] };
    }
  }

  // "12 March 2027" / "5th of Feb 2027"
  const dayFirst = t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?([a-z]{3,9})\.?\s*,?\s*(\d{4})\b/);
  if (dayFirst) {
    const mi = MONTHS[dayFirst[2]];
    const day = Number(dayFirst[1]);
    if (mi !== undefined && day >= 1 && day <= 31) {
      return { iso: toISO(new Date(Number(dayFirst[3]), mi, day)), confidence: 0.92, evidence: dayFirst[0] };
    }
  }

  // "March 2027" with no day - assume the last day of the month, flagged as low confidence
  const monthYear = t.match(/\b([a-z]{3,9})\.?\s+(\d{4})\b/);
  if (monthYear) {
    const mi = MONTHS[monthYear[1]];
    if (mi !== undefined) {
      return {
        iso: toISO(new Date(Number(monthYear[2]), mi + 1, 0)),
        confidence: 0.6,
        evidence: monthYear[0],
      };
    }
  }

  const inDays = t.match(/\bin\s+(\d{1,3})\s+days?\b/) || t.match(/\b(\d{1,3})\s+days?\s+(?:from now|later)\b/);
  if (inDays) return { iso: toISO(addDays(today(), Number(inDays[1]))), confidence: 0.8, evidence: inDays[0] };

  const inWeeks = t.match(/\bin\s+(\d{1,2})\s+weeks?\b/);
  if (inWeeks) return { iso: toISO(addDays(today(), Number(inWeeks[1]) * 7)), confidence: 0.8, evidence: inWeeks[0] };

  const inMonths = t.match(/\bin\s+(\d{1,2})\s+months?\b/);
  if (inMonths) {
    const d = today();
    return {
      iso: toISO(new Date(d.getFullYear(), d.getMonth() + Number(inMonths[1]), d.getDate())),
      confidence: 0.75,
      evidence: inMonths[0],
    };
  }

  const inYears = t.match(/\bin\s+(\d{1,2})\s+years?\b/);
  if (inYears) {
    const d = today();
    return {
      iso: toISO(new Date(d.getFullYear() + Number(inYears[1]), d.getMonth(), d.getDate())),
      confidence: 0.7,
      evidence: inYears[0],
    };
  }

  return { iso: null, confidence: 0, evidence: '' };
}

function titleFrom(text: string, label: string, kind: string): string {
  if (kind !== DEFAULT_ENTRY.kind) return label;
  const cleaned = text
    .replace(/\b(in|on|by|due|expires?|expiring|expiry|renew|renewal|renews?)\b/gi, ' ')
    .replace(/\b\d{1,4}([/-]\d{1,2}){0,2}\b/g, ' ')
    .replace(/\b(in \d+ (days?|weeks?|months?|years?))\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const short = cleaned.split(' ').slice(0, 8).join(' ').replace(/[,.]$/, '');
  return short ? short.charAt(0).toUpperCase() + short.slice(1) : label;
}

/**
 * Offline natural-language parser. Runs on-device with no network, and is also
 * the validation layer for model output, so a model can never insert an
 * out-of-range date or an unknown category.
 */
export function parseOffline(text: string): ItemDraft {
  const input = text.trim();
  const matched = scoreEntry(input);
  const entry = matched ? entryFor(matched.kind) : DEFAULT_ENTRY;
  const date = extractDate(input);
  const kind = matched?.kind ?? DEFAULT_ENTRY.kind;
  const questions: string[] = [];

  let due = date.iso;
  let confidence = date.confidence;
  if (!due) {
    due = toISO(addDays(today(), entry.lead + 14));
    questions.push('No date found in your text — check the due date below.');
    confidence = 0.25;
  }

  const leadMatch = input.match(/\b(?:remind|alert|notify)\s+me\s+(\d{1,3})\s+days?\b/i);
  const leadDays = leadMatch ? Math.min(180, Math.max(0, Number(leadMatch[1]))) : entry.lead;

  if (!matched) questions.push('We could not match this to a known task type, so the plan will be generic.');
  if (date.confidence > 0 && date.confidence < 0.8) {
    questions.push(`We read "${date.evidence}" as a month and year — set the exact day.`);
  }

  const catMatch = input.match(/\b(document|documents|finance|money|health|vehicle|car|home|rent|work|study|subscription)\b/i);
  const category: Category = catMatch ? normaliseCategory(catMatch[1]) : entry.category;

  return {
    title: titleFrom(input, entry.label, kind),
    kind,
    category,
    due,
    leadDays,
    jurisdiction: pickJurisdiction(input),
    issuer: '',
    notes: input,
    confidence,
    questions,
  };
}

function normaliseCategory(word: string): Category {
  const w = word.toLowerCase();
  if (w.startsWith('doc')) return 'document';
  if (w === 'finance' || w === 'money') return 'finance';
  if (w === 'health') return 'health';
  if (w === 'vehicle' || w === 'car') return 'vehicle';
  if (w === 'home' || w === 'rent') return 'home';
  if (w === 'work' || w === 'study') return 'work';
  return 'subscription';
}

export function planOffline(item: LifeItem): AiPlan {
  const e = entryFor(item.kind);
  const left = daysLeft(item.due);
  const startIn = left - item.leadDays;

  const leadTimeNote =
    startIn > 0
      ? `Your ${item.leadDays}-day warning window opens on ${formatDate(toISO(addDays(parseDate(item.due), -item.leadDays)), 'short')} — ${startIn} days from today.`
      : left < 0
        ? `This is already ${Math.abs(left)} days past due. ${e.label} usually needs ${e.lead} days of lead time, so treat this as a rescue task today.`
        : `You are inside the warning window already — ${left} days left against a ${item.leadDays}-day lead time.`;

  const priorityStep =
    left <= 3
      ? 'Do this today. With this little time left, use the fastest channel available: an official online service or an authorised agent.'
      : left <= 14
        ? 'Start this week. Book the appointment or submit the application now, before slots fill up.'
        : 'Use the lead time properly — gather documents and book a slot before you feel any pressure.';

  return {
    headline:
      left < 0
        ? `${e.label} expired ${formatDate(item.due, 'short')} — recover it now`
        : `${e.label} — ${countdown(item)}`,
    leadTimeNote,
    steps: [priorityStep, ...e.steps],
    documents: item.issuer ? [`Existing ${item.issuer} reference or record`, ...e.documents] : e.documents,
    watchOuts: [
      'Checklist is general guidance, not an official source. Confirm the current fee, forms and office with the issuing authority before you go.',
      ...e.watchOuts,
    ],
    source: 'offline',
  };
}

export function briefOffline(items: LifeItem[]): AiBrief {
  const open = items.filter((i) => i.status === 'active');
  const overdue = open.filter((i) => daysLeft(i.due) < 0);
  const critical = open.filter((i) => {
    const d = daysLeft(i.due);
    return d >= 0 && d <= 7;
  });
  const soon = open.filter((i) => {
    const d = daysLeft(i.due);
    return d > 7 && d <= 30;
  });

  const headline =
    overdue.length > 0
      ? `${overdue.length} item${overdue.length > 1 ? 's are' : ' is'} already past due. Clear those first — they carry the most risk.`
      : critical.length > 0
        ? `Nothing is overdue. ${critical.length} item${critical.length > 1 ? 's need' : ' needs'} attention within a week.`
        : soon.length > 0
          ? `You are clear this week. ${soon.length} item${soon.length > 1 ? 's' : ''} land in the next month.`
          : open.length > 0
            ? 'You are clear for the next 30 days. This is the moment to batch prep the ones further out.'
            : 'Nothing is tracked yet. Add your first real-life deadline to start the queue.';

  const doToday: string[] = [];
  if (overdue[0]) doToday.push(`Recover ${overdue[0].title} — ${countdown(overdue[0])}. Open its plan and start step 1.`);
  if (critical[0]) doToday.push(`Start ${critical[0].title} — ${countdown(critical[0])} leaves no room for delay.`);
  if (critical[1]) doToday.push(`Book or pay ${critical[1].title} (${countdown(critical[1])}).`);

  const doThisWeek: string[] = [];
  for (const i of [...overdue, ...critical].slice(doToday.length, doToday.length + 3)) {
    doThisWeek.push(`Finish ${i.title} — ${countdown(i)}.`);
  }
  for (const i of soon.slice(0, 3)) doThisWeek.push(`Prepare ${i.title} — ${countdown(i)}. Gather the documents now.`);
  if (!doToday.length && open.length) doToday.push('Clear the queue: open the top item and do the first step only.');

  return { headline, doToday, doThisWeek, source: 'offline' };
}
