import type { LifeItem, Urgency, UrgencyMeta } from '@/types';

export const MS_DAY = 86_400_000;

/** Midnight-normalised "today" so days-left maths is stable across times of day. */
export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function parseDate(iso: string): Date {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? today() : d;
}

export function toISO(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_DAY);
}

export function daysLeft(iso: string, from = today()): number {
  return Math.round((parseDate(iso).getTime() - from.getTime()) / MS_DAY);
}

const META: Record<Urgency, Omit<UrgencyMeta, 'level' | 'daysLeft'>> = {
  overdue: { label: 'Overdue', color: 'var(--red)', rank: 0 },
  critical: { label: 'Critical', color: 'var(--orange)', rank: 1 },
  soon: { label: 'Soon', color: 'var(--amber)', rank: 2 },
  upcoming: { label: 'Upcoming', color: 'var(--blue)', rank: 3 },
  scheduled: { label: 'Scheduled', color: 'var(--green)', rank: 4 },
};

export function urgencyFor(item: LifeItem): UrgencyMeta {
  const left = daysLeft(item.due);
  const level: Urgency =
    left < 0 ? 'overdue' : left <= 7 ? 'critical' : left <= 30 ? 'soon' : left <= 90 ? 'upcoming' : 'scheduled';
  return { level, daysLeft: left, ...META[level] };
}

export function sortByUrgency(items: LifeItem[]): LifeItem[] {
  return [...items].sort((a, b) => {
    const ua = urgencyFor(a);
    const ub = urgencyFor(b);
    return ua.rank - ub.rank || ua.daysLeft - ub.daysLeft;
  });
}

/** Human friendly countdown: "in 12 days", "today", "3 days ago". */
export function countdown(item: LifeItem): string {
  const left = daysLeft(item.due);
  if (left === 0) return 'due today';
  if (left === 1) return 'due tomorrow';
  if (left === -1) return '1 day overdue';
  if (left < 0) return `${Math.abs(left)} days overdue`;
  return `in ${left} days`;
}

const LONG = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const SHORT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

export function formatDate(iso: string, style: 'long' | 'short' = 'long'): string {
  return (style === 'long' ? LONG : SHORT).format(parseDate(iso));
}
