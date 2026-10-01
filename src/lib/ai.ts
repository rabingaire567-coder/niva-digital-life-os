import type { AiBrief, AiPlan, ItemDraft, LifeItem } from '@/types';
import { briefOffline, parseOffline, planOffline } from '@/lib/engine';
import { entryFor, GENERAL_CATEGORIES, KNOWLEDGE } from '@/lib/knowledge';
import { countdown, daysLeft, toISO, today, addDays, parseDate } from '@/lib/date';

const TIMEOUT = 20_000;

async function call<T>(path: string, body: unknown): Promise<T | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T; error?: string };
    return json.data ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function strings(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, max);
}

/** Guarantees an ISO string that is a real calendar date. */
function safeISO(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return fallback;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime()) || d.getMonth() !== Number(m[2]) - 1) return fallback;
  return toISO(d);
}

export async function parseWithAi(text: string): Promise<{ draft: ItemDraft; source: 'ai' | 'offline' }> {
  const fallback = parseOffline(text);
  const remote = await call<Partial<ItemDraft>>('/api/parse', { text });
  if (!remote) return { draft: fallback, source: 'offline' };

  const entry = KNOWLEDGE.find((k) => k.kind === remote.kind) ?? null;
  const due = safeISO(remote.due, fallback.due);
  const merged: ItemDraft = {
    title: (typeof remote.title === 'string' && remote.title.trim()) || fallback.title,
    kind: entry ? entry.kind : fallback.kind,
    category: GENERAL_CATEGORIES.includes(remote.category as never)
      ? (remote.category as ItemDraft['category'])
      : (entry?.category ?? fallback.category),
    due,
    leadDays: typeof remote.leadDays === 'number' ? Math.min(180, Math.max(0, remote.leadDays)) : fallback.leadDays,
    jurisdiction: (['NP', 'IN', 'AE', 'US', 'UK', 'OTHER'] as const).includes(remote.jurisdiction as never)
      ? (remote.jurisdiction as ItemDraft['jurisdiction'])
      : fallback.jurisdiction,
    issuer: typeof remote.issuer === 'string' ? remote.issuer.slice(0, 120) : '',
    notes: text,
    confidence: typeof remote.confidence === 'number' ? Math.min(1, Math.max(0, remote.confidence)) : fallback.confidence,
    questions: strings(remote.questions, 4).length ? strings(remote.questions, 4) : fallback.questions,
  };
  return { draft: merged, source: 'ai' };
}

export async function planWithAi(item: LifeItem): Promise<AiPlan> {
  const base = planOffline(item);
  const payload = {
    item: {
      title: item.title,
      kind: item.kind,
      category: item.category,
      due: item.due,
      leadDays: item.leadDays,
      jurisdiction: item.jurisdiction,
      issuer: item.issuer,
      notes: item.notes,
      daysLeft: daysLeft(item.due),
    },
    reference: entryFor(item.kind),
  };
  const remote = await call<Partial<AiPlan>>('/api/plan', payload);
  if (!remote) return base;

  const steps = strings(remote.steps, 8);
  const documents = strings(remote.documents, 10);
  const watchOuts = strings(remote.watchOuts, 5);
  return {
    headline: (typeof remote.headline === 'string' && remote.headline.trim()) || base.headline,
    leadTimeNote: (typeof remote.leadTimeNote === 'string' && remote.leadTimeNote.trim()) || base.leadTimeNote,
    steps: steps.length ? steps : base.steps,
    documents: documents.length ? documents : base.documents,
    watchOuts: watchOuts.length
      ? [...watchOuts, 'Confirm the current fee, forms and office with the issuing authority before you go.']
      : base.watchOuts,
    source: 'ai',
  };
}

export async function briefWithAi(items: LifeItem[]): Promise<AiBrief> {
  const base = briefOffline(items);
  const open = items
    .filter((i) => i.status === 'active')
    .sort((a, b) => daysLeft(a.due) - daysLeft(b.due))
    .slice(0, 14)
    .map((i) => ({ title: i.title, category: i.category, due: i.due, left: countdown(i), daysLeft: daysLeft(i.due) }));
  if (!open.length) return base;

  const remote = await call<Partial<AiBrief>>('/api/brief', { items: open, today: toISO(today()) });
  if (!remote) return base;

  const doToday = strings(remote.doToday, 4);
  const doThisWeek = strings(remote.doThisWeek, 6);
  return {
    headline: (typeof remote.headline === 'string' && remote.headline.trim()) || base.headline,
    doToday: doToday.length ? doToday : base.doToday,
    doThisWeek: doThisWeek.length ? doThisWeek : base.doThisWeek,
    source: 'ai',
  };
}

/** Local, instant confidence readout so the UI can colour the parse. */
export function localConfidence(text: string): number {
  return parseOffline(text).confidence;
}

export function suggestedLead(kind: string): number {
  return entryFor(kind).lead;
}

export function renewPreview(kind: string): { lead: number; next: string } {
  const e = entryFor(kind);
  const next = toISO(addDays(today(), e.lead));
  return { lead: e.lead, next };
}

export { parseDate };
