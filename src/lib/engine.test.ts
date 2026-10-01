import { describe, expect, it } from 'vitest';
import { briefOffline, extractDate, parseOffline, planOffline } from '@/lib/engine';
import { countdown, daysLeft, toISO, addDays, today, urgencyFor } from '@/lib/date';
import { entryFor, KNOWLEDGE } from '@/lib/knowledge';
import type { LifeItem } from '@/types';

const iso = (d: number) => toISO(addDays(today(), d));

function item(over: Partial<LifeItem> = {}): LifeItem {
  return {
    id: 't',
    title: 'Test item',
    kind: 'passport',
    category: 'document',
    due: iso(200),
    leadDays: 120,
    jurisdiction: 'NP',
    issuer: '',
    notes: '',
    status: 'active',
    source: 'manual',
    createdAt: new Date().toISOString(),
    ...over,
  };
}

describe('extractDate', () => {
  it('reads an ISO date', () => {
    expect(extractDate('expires 2027-04-30').iso).toBe('2027-04-30');
  });

  it('reads day/month/year with slashes', () => {
    expect(extractDate('due 05/02/2027').iso).toBe('2027-02-05');
  });

  it('reads a written month and day', () => {
    expect(extractDate('expires on 12 March 2027').iso).toBe('2027-03-12');
  });

  it('reads a day-first month name', () => {
    expect(extractDate('renew on 5th of Feb 2027').iso).toBe('2027-02-05');
  });

  it('prefers the full date over a bare month-year match', () => {
    expect(extractDate('passport expires 12 March 2027').iso).toBe('2027-03-12');
    expect(extractDate('passport expires March 12 2027').iso).toBe('2027-03-12');
  });

  it('reads relative days', () => {
    expect(extractDate('trial ends in 3 days').iso).toBe(iso(3));
  });

  it('reads relative weeks', () => {
    expect(extractDate('in 2 weeks').iso).toBe(iso(14));
  });

  it('reads relative months', () => {
    const got = extractDate('in 6 months').iso;
    const want = toISO(new Date(today().getFullYear(), today().getMonth() + 6, today().getDate()));
    expect(got).toBe(want);
  });

  it('reads relative years', () => {
    const got = extractDate('in 2 years').iso;
    const want = toISO(new Date(today().getFullYear() + 2, today().getMonth(), today().getDate()));
    expect(got).toBe(want);
  });

  it('returns no date and no confidence when there is none', () => {
    const r = extractDate('I need to sort out my paperwork at some point');
    expect(r.iso).toBeNull();
    expect(r.confidence).toBe(0);
  });

  it('rejects an impossible month/year pair', () => {
    expect(extractDate('nonsense 99/99/9999').iso).not.toBe('9999-99-99');
  });
});

describe('parseOffline', () => {
  it('maps a passport mention to the passport knowledge entry', () => {
    const d = parseOffline('my nepal passport expires 12 March 2027');
    expect(d.kind).toBe('passport');
    expect(d.due).toBe('2027-03-12');
    expect(d.jurisdiction).toBe('NP');
    expect(d.leadDays).toBe(entryFor('passport').lead);
    expect(d.confidence).toBeGreaterThan(0.9);
  });

  it('picks up an explicit reminder window', () => {
    const d = parseOffline('insurance premium in 10 days, remind me 45 days before');
    expect(d.kind).toBe('insurance');
    expect(d.leadDays).toBe(45);
  });

  it('flags a missing date with a question', () => {
    const d = parseOffline('need to renew the gym membership');
    expect(d.questions.length).toBeGreaterThan(0);
    expect(d.confidence).toBeLessThan(0.5);
    expect(d.kind).toBe('gym-membership');
  });

  it('flags an unknown type with a question', () => {
    const d = parseOffline('thingamajig expires 2027-01-01');
    expect(d.kind).toBe('general');
    expect(d.questions.some((q) => q.includes('known task type'))).toBe(true);
  });

  it('keeps the original text in notes', () => {
    const text = 'gym in 9 days cancel it';
    expect(parseOffline(text).notes).toBe(text);
  });

  it('never returns an empty title', () => {
    for (const t of ['passport', 'in 3 days', 'license renewal 2027-01-01', '!!!']) {
      expect(parseOffline(t).title.length).toBeGreaterThan(0);
    }
  });
});

describe('urgency', () => {
  it('marks past dates overdue', () => {
    expect(urgencyFor(item({ due: iso(-1) })).level).toBe('overdue');
  });
  it('marks seven days out critical', () => {
    expect(urgencyFor(item({ due: iso(7) })).level).toBe('critical');
  });
  it('marks thirty days out soon', () => {
    expect(urgencyFor(item({ due: iso(30) })).level).toBe('soon');
  });
  it('marks ninety days out upcoming', () => {
    expect(urgencyFor(item({ due: iso(90) })).level).toBe('upcoming');
  });
  it('counts days left from midnight', () => {
    expect(daysLeft(iso(5))).toBe(5);
  });
  it('formats countdowns', () => {
    expect(countdown(item({ due: iso(0) }))).toBe('due today');
    expect(countdown(item({ due: iso(1) }))).toBe('due tomorrow');
    expect(countdown(item({ due: iso(-3) }))).toBe('3 days overdue');
    expect(countdown(item({ due: iso(12) }))).toBe('in 12 days');
  });
});

describe('planOffline', () => {
  it('always produces steps, documents and a lead-time note', () => {
    const p = planOffline(item());
    expect(p.steps.length).toBeGreaterThan(2);
    expect(p.documents.length).toBeGreaterThan(0);
    expect(p.leadTimeNote.length).toBeGreaterThan(0);
    expect(p.source).toBe('offline');
  });

  it('puts urgency into the first step when time is short', () => {
    const p = planOffline(item({ due: iso(2), leadDays: 120 }));
    expect(p.steps[0]).toMatch(/today/i);
  });

  it('uses the prep instruction when there is room', () => {
    const p = planOffline(item({ due: iso(300), leadDays: 120 }));
    expect(p.steps[0]).toMatch(/lead time properly/i);
  });

  it('treats an overdue item as a rescue task', () => {
    const p = planOffline(item({ due: iso(-20) }));
    expect(p.headline).toMatch(/expired/i);
    expect(p.leadTimeNote).toMatch(/past due/i);
  });

  it('carries the verify-with-the-authority disclaimer', () => {
    expect(planOffline(item()).watchOuts[0]).toMatch(/issuing authority/i);
  });

  it('works for every knowledge entry', () => {
    for (const k of KNOWLEDGE) {
      const p = planOffline(item({ kind: k.kind }));
      expect(p.steps.length).toBeGreaterThan(1);
      expect(p.documents.length).toBeGreaterThan(0);
    }
  });
});

describe('briefOffline', () => {
  it('puts overdue items first in the headline', () => {
    const b = briefOffline([item({ due: iso(-2) }), item({ due: iso(60) })]);
    expect(b.headline).toMatch(/past due/i);
  });

  it('reports a clear month when nothing is urgent', () => {
    const b = briefOffline([item({ due: iso(200) }), item({ due: iso(300) })]);
    expect(b.headline).toMatch(/clear for the next 30 days/i);
  });

  it('handles an empty queue without throwing', () => {
    const b = briefOffline([]);
    expect(b.headline.length).toBeGreaterThan(0);
  });

  it('always produces an action for a non-empty queue', () => {
    const b = briefOffline([item({ due: iso(10) })]);
    expect(b.doToday.length + b.doThisWeek.length).toBeGreaterThan(0);
  });
});
