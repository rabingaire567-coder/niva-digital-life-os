import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Vault } from '@/lib/store';
import { PlanPanel } from '@/components/AiPanel';
import AddDialog from '@/components/AddDialog';
import { UrgencyBadge } from '@/components/ItemRow';
import { addDays, countdown, daysLeft, formatDate, parseDate, toISO } from '@/lib/date';
import { CATEGORY_ICON, CATEGORY_LABEL, JURISDICTION_LABEL, entryFor } from '@/lib/knowledge';

export default function ItemPage({ vault }: { vault: Vault }) {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const [editing, setEditing] = useState(false);
  const item = vault.items.find((i) => i.id === id);

  const entry = useMemo(() => (item ? entryFor(item.kind) : null), [item]);

  if (!item || !entry) {
    return (
      <div className="card fade-in">
        <div className="empty">
          <div className="empty-ico" aria-hidden="true">404</div>
          <h3>That item is gone</h3>
          <p>It may have been deleted, or the link is from a different browser.</p>
          <Link to="/vault" className="btn btn-primary">
            Back to the vault
          </Link>
        </div>
      </div>
    );
  }

  const left = daysLeft(item.due);
  const done = item.status === 'done';
  const warnDate = toISO(addDays(parseDate(item.due), -item.leadDays));
  const warnState =
    left < 0 ? 'opened late' : daysLeft(warnDate) < 0 ? 'already open' : `opens ${formatDate(warnDate, 'short')}`;

  return (
    <div className="stack fade-in">
      <div className="row-between">
        <Link to="/vault" className="btn btn-ghost btn-sm">
          ← Vault
        </Link>
        <div className="row">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            type="button"
            className={done ? 'btn btn-ghost btn-sm' : 'btn btn-primary btn-sm'}
            onClick={() => vault.setStatus(item.id, done ? 'active' : 'done')}
          >
            {done ? 'Reopen' : 'Mark done'}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (window.confirm(`Delete “${item.title}”? This cannot be undone.`)) {
                vault.remove(item.id);
                nav('/vault');
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="hero" style={{ marginBottom: 0 }}>
        <div className="row" style={{ marginBottom: 10 }}>
          <span className="qemoji" style={{ width: 40, height: 40, fontSize: 20 }} aria-hidden="true">
            {CATEGORY_ICON[item.category] ?? '•'}
          </span>
          <UrgencyBadge item={item} />
          {done ? <span className="badge green">closed</span> : null}
          {item.source === 'ai' ? <span className="badge brand">AI captured</span> : null}
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3.6vw, 2.1rem)' }}>{item.title}</h1>
        <p className="lede">
          {done ? `Closed ${item.completedAt ? formatDate(item.completedAt.slice(0, 10)) : ''}.` : `${countdown(item)} — ${formatDate(item.due)}`}
        </p>
      </div>

      <div className="meta-grid">
        <div className="meta-cell">
          <div className="meta-k">Category</div>
          <div className="meta-v">{CATEGORY_LABEL[item.category]}</div>
        </div>
        <div className="meta-cell">
          <div className="meta-k">Type</div>
          <div className="meta-v">{entry.label}</div>
        </div>
        <div className="meta-cell">
          <div className="meta-k">Lead time</div>
          <div className="meta-v">{item.leadDays} days</div>
        </div>
        <div className="meta-cell">
          <div className="meta-k">Warning window</div>
          <div className="meta-v" style={{ fontSize: '0.85rem' }}>{warnState}</div>
        </div>
        <div className="meta-cell">
          <div className="meta-k">Region</div>
          <div className="meta-v">{JURISDICTION_LABEL[item.jurisdiction]}</div>
        </div>
        <div className="meta-cell">
          <div className="meta-k">Issued by</div>
          <div className="meta-v" style={{ fontSize: '0.85rem' }}>{item.issuer || 'Not set'}</div>
        </div>
      </div>

      <div className="grid-2">
        <PlanPanel item={item} />

        <div className="stack">
          {item.notes ? (
            <div className="card">
              <div className="card-head">
                <h3>Your notes</h3>
              </div>
              <div className="card-body">
                <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: 'var(--text-2)' }}>{item.notes}</p>
              </div>
            </div>
          ) : null}

          {item.rawText ? (
            <div className="card">
              <div className="card-head">
                <h3>How you said it</h3>
                <span className="spacer" />
                <span className="badge">AI input</span>
              </div>
              <div className="card-body">
                <code
                  style={{
                    display: 'block',
                    fontFamily: 'var(--mono)',
                    fontSize: '0.82rem',
                    background: 'var(--surface-2)',
                    padding: '11px 13px',
                    borderRadius: 10,
                    wordBreak: 'break-word',
                    color: 'var(--text-2)',
                  }}
                >
                  {item.rawText}
                </code>
              </div>
            </div>
          ) : null}

          <div className="card">
            <div className="card-head">
              <h3>Timeline</h3>
            </div>
            <div className="card-body">
              <div className="tl">
                <div className="tl-row">
                  <span className="tl-rail">
                    <span className="tl-node" />
                    <span className="tl-line" />
                  </span>
                  <span className="tl-txt">
                    <b>Added to NIVA</b>
                    <span>{formatDate(item.createdAt.slice(0, 10))}</span>
                  </span>
                </div>
                <div className="tl-row">
                  <span className="tl-rail">
                    <span className={`tl-node${left >= 0 && left <= item.leadDays ? ' now' : ''}`} />
                    <span className="tl-line" />
                  </span>
                  <span className="tl-txt">
                    <b>Warning window</b>
                    <span>
                      {formatDate(warnDate)} — {item.leadDays} days before the due date
                    </span>
                  </span>
                </div>
                <div className="tl-row">
                  <span className="tl-rail">
                    <span className={`tl-node${left < 0 && !done ? ' due' : ''}`} />
                  </span>
                  <span className="tl-txt">
                    <b>{done ? 'Closed' : left < 0 ? 'Past due' : 'Due date'}</b>
                    <span>{formatDate(item.due)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Related types</h3>
            </div>
            <div className="card-body stack-sm">
              <p className="hint">
                Same category items are usually renewed in the same trip — batching saves a second
                queue at the same counter.
              </p>
              <Link to="/vault" className="btn btn-ghost btn-sm">
                Browse the vault
              </Link>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <AddDialog
          initial={item}
          onClose={() => setEditing(false)}
          onSave={(d) => {
            vault.update(item.id, d);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}
