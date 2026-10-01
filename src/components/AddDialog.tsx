import { useEffect, useMemo, useState } from 'react';
import type { Category, ItemDraft, Jurisdiction, LifeItem } from '@/types';
import Modal from '@/components/Modal';
import { parseWithAi } from '@/lib/ai';
import { parseOffline } from '@/lib/engine';
import { CATEGORY_LABEL, GENERAL_CATEGORIES, JURISDICTIONS, JURISDICTION_LABEL, entryFor, KNOWLEDGE } from '@/lib/knowledge';
import { formatDate, toISO, today } from '@/lib/date';

const EXAMPLES = [
  'passport expires 12 March next year',
  'car insurance premium on 5 feb',
  'gym membership in 9 days, cancel it',
  'mom blood pressure tablets run out in 2 weeks',
  'driving licence in india expires 2027-04-30',
  'figma trial ends in 3 days',
];

const MAX = 400;

type Mode = 'ai' | 'manual';

function emptyDraft(): ItemDraft {
  return {
    title: '',
    kind: 'general',
    category: 'document',
    due: toISO(today()),
    leadDays: 14,
    jurisdiction: 'OTHER',
    issuer: '',
    notes: '',
    confidence: 1,
    questions: [],
  };
}

export default function AddDialog({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (draft: Omit<LifeItem, 'id' | 'createdAt' | 'status'>) => void;
  initial?: LifeItem;
}) {
  const editing = Boolean(initial);
  const [mode, setMode] = useState<Mode>(editing ? 'manual' : 'ai');
  const [text, setText] = useState(initial?.rawText ?? '');
  const [draft, setDraft] = useState<ItemDraft>(() =>
    initial
      ? {
          title: initial.title,
          kind: initial.kind,
          category: initial.category,
          due: initial.due,
          leadDays: initial.leadDays,
          jurisdiction: initial.jurisdiction,
          issuer: initial.issuer,
          notes: initial.notes,
          confidence: 1,
          questions: [],
        }
      : emptyDraft(),
  );
  const [source, setSource] = useState<'ai' | 'offline' | null>(null);
  const [parsing, setParsing] = useState(false);
  const [err, setErr] = useState('');
  const [touched, setTouched] = useState(false);

  const localPreview = useMemo(() => (text.trim() ? parseOffline(text) : null), [text]);

  async function runParse(value: string) {
    const input = value.trim();
    if (!input) return;
    setParsing(true);
    setErr('');
    try {
      const { draft: d, source: s } = await parseWithAi(input);
      setDraft(d);
      setSource(s);
    } catch {
      setErr('Could not read that text. Fill the form in manually — everything still works.');
      setSource('offline');
    } finally {
      setParsing(false);
    }
  }

  useEffect(() => {
    if (mode !== 'ai' || editing) return;
    const t = setTimeout(() => void runParse(text), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, mode]);

  const titleError = touched && !draft.title.trim() ? 'Give this a short name so you can recognise it.' : '';
  const dateError = touched && !/^\d{4}-\d{2}-\d{2}$/.test(draft.due) ? 'Pick a valid date.' : '';
  const inPast = draft.due < toISO(today());
  const conf = Math.round((localPreview?.confidence ?? 1) * 100);

  function submit() {
    setTouched(true);
    if (!draft.title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(draft.due)) return;
    if (editing && initial) {
      onSave({
        ...initial,
        title: draft.title.trim(),
        kind: draft.kind,
        category: draft.category,
        due: draft.due,
        leadDays: draft.leadDays,
        jurisdiction: draft.jurisdiction,
        issuer: draft.issuer.trim(),
        notes: draft.notes.trim(),
        rawText: (initial.rawText ?? text.trim()) || undefined,
      });
    } else {
      onSave({
        title: draft.title.trim(),
        kind: draft.kind,
        category: draft.category,
        due: draft.due,
        leadDays: draft.leadDays,
        jurisdiction: draft.jurisdiction,
        issuer: draft.issuer.trim(),
        notes: draft.notes.trim(),
        source: mode === 'ai' ? 'ai' : 'manual',
        rawText: mode === 'ai' && text.trim() ? text.trim() : undefined,
      });
    }
  }

  const kindOptions = useMemo(() => {
    const seen = new Set<string>();
    return KNOWLEDGE.filter((k) => (seen.has(k.kind) ? false : (seen.add(k.kind), true)));
  }, []);

  return (
    <Modal
      title={editing ? 'Edit item' : 'Add to your life queue'}
      onClose={onClose}
      labelledBy="add-title"
      footer={
        <>
          <button type="button" className="btn btn-primary" onClick={submit}>
            {editing ? 'Save changes' : 'Add item'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <span className="spacer" />
          <span className="hint">Saved to this browser only</span>
        </>
      }
    >
      <div className="modal-body stack">
        {!editing && (
          <div className="row" role="tablist" aria-label="Add mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'ai'}
              className={`chip${mode === 'ai' ? ' on' : ''}`}
              onClick={() => setMode('ai')}
            >
              ✦ Describe it
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'manual'}
              className={`chip${mode === 'manual' ? ' on' : ''}`}
              onClick={() => setMode('manual')}
            >
              Fill the form
            </button>
            <span className="spacer" />
            {parsing ? (
              <span className="mini">
                <span className="spin" /> reading…
              </span>
            ) : source ? (
              <span className="badge brand">{source === 'ai' ? 'AI parsed' : 'On-device parse'}</span>
            ) : null}
          </div>
        )}

        {mode === 'ai' && !editing && (
          <>
            <div className="field">
              <label className="label" htmlFor="cap">
                Say it the way you would to a friend
              </label>
              <textarea
                id="cap"
                className="textarea"
                value={text}
                maxLength={MAX}
                placeholder="e.g. my passport expires on 12 March 2027 and I need it for a trip"
                onChange={(e) => {
                  setText(e.target.value);
                  setSource(null);
                }}
                onBlur={() => text.trim() && !source && void runParse(text)}
              />
              <div className="row-between">
                <span className="hint">
                  NIVA pulls out the date, the type and how early you should be warned.
                </span>
                <span className="hint">{text.length}/{MAX}</span>
              </div>
              {localPreview && (
                <div>
                  <div className="row-between" style={{ marginBottom: 2 }}>
                    <span className="hint">Date confidence</span>
                    <span className="hint" style={{ fontWeight: 650, color: conf >= 70 ? 'var(--green)' : 'var(--amber)' }}>
                      {conf}%
                    </span>
                  </div>
                  <div className="qmeter">
                    <span
                      style={{
                        width: `${Math.max(4, conf)}%`,
                        '--tone': conf >= 70 ? 'var(--green)' : 'var(--amber)',
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="examples">
              {EXAMPLES.map((ex) => (
                <button key={ex} type="button" className="example" onClick={() => setText(ex)}>
                  {ex}
                </button>
              ))}
            </div>

            {err ? <div className="error">{err}</div> : null}

            {draft.questions.length > 0 && mode === 'ai' && (
              <div className="draft-note">
                <span aria-hidden="true">?</span>
                <span>
                  {draft.questions.map((q, i) => (
                    <div key={i}>{q}</div>
                  ))}
                </span>
              </div>
            )}

            {text.trim() && draft.title ? (
              <div className="note">
                <span aria-hidden="true">✦</span>
                <span>
                  Read as <strong>{draft.title}</strong> · {formatDate(draft.due)} ·{' '}
                  {CATEGORY_LABEL[draft.category]} · warn me {draft.leadDays} days ahead. Check it below and edit anything wrong.
                </span>
              </div>
            ) : null}
          </>
        )}

        <div className="form-grid">
          <div className="field full">
            <label className="label" htmlFor="t">
              Name
            </label>
            <input
              id="t"
              className="input"
              value={draft.title}
              maxLength={80}
              placeholder="e.g. Passport renewal"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            {titleError ? <span className="hint" style={{ color: 'var(--red)' }}>{titleError}</span> : null}
          </div>

          <div className="field">
            <label className="label" htmlFor="d">
              Due date
            </label>
            <input
              id="d"
              className="input"
              type="date"
              value={draft.due}
              onChange={(e) => setDraft({ ...draft, due: e.target.value })}
            />
            {dateError ? (
              <span className="hint" style={{ color: 'var(--red)' }}>{dateError}</span>
            ) : inPast ? (
              <span className="hint" style={{ color: 'var(--orange)' }}>This date has passed — NIVA will flag it as overdue.</span>
            ) : null}
          </div>

          <div className="field">
            <label className="label" htmlFor="k">
              Type
            </label>
            <select
              id="k"
              className="select"
              value={draft.kind}
              onChange={(e) => {
                const k = e.target.value;
                setDraft({
                  ...draft,
                  kind: k,
                  category: entryFor(k).category,
                  leadDays: entryFor(k).lead,
                });
              }}
            >
              {kindOptions.map((k) => (
                <option key={k.kind} value={k.kind}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="c">
              Category
            </label>
            <select
              id="c"
              className="select"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}
            >
              {GENERAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="l">
              Warn me this many days before
            </label>
            <input
              id="l"
              className="input"
              type="number"
              min={0}
              max={180}
              value={draft.leadDays}
              onChange={(e) => {
                const n = Number(e.target.value);
                setDraft({ ...draft, leadDays: Number.isFinite(n) ? Math.min(180, Math.max(0, n)) : 0 });
              }}
            />
            <span className="hint">Standard lead time for this type is {entryFor(draft.kind).lead} days.</span>
          </div>

          <div className="field">
            <label className="label" htmlFor="j">
              Country / region
            </label>
            <select
              id="j"
              className="select"
              value={draft.jurisdiction}
              onChange={(e) => setDraft({ ...draft, jurisdiction: e.target.value as Jurisdiction })}
            >
              {JURISDICTIONS.map((j) => (
                <option key={j} value={j}>
                  {JURISDICTION_LABEL[j]}
                </option>
              ))}
            </select>
          </div>

          <div className="field full">
            <label className="label" htmlFor="i">
              Issued by / provider <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>(optional)</span>
            </label>
            <input
              id="i"
              className="input"
              value={draft.issuer}
              maxLength={80}
              placeholder="e.g. Department of Immigration, or a bank name"
              onChange={(e) => setDraft({ ...draft, issuer: e.target.value })}
            />
          </div>

          <div className="field full">
            <label className="label" htmlFor="n">
              Notes <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>(optional)</span>
            </label>
            <textarea
              id="n"
              className="textarea"
              value={draft.notes}
              maxLength={500}
              placeholder="Anything that would make this easier next time"
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
