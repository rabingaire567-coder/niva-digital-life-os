import { useMemo, useState } from 'react';
import type { Category, LifeItem } from '@/types';
import type { Vault } from '@/lib/store';
import ItemRow from '@/components/ItemRow';
import AddDialog from '@/components/AddDialog';
import { CATEGORY_LABEL, GENERAL_CATEGORIES } from '@/lib/knowledge';
import { sortByUrgency } from '@/lib/date';

type Filter = 'all' | 'urgent' | Category | 'done';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'urgent', label: 'Needs action' },
  ...GENERAL_CATEGORIES.map((c) => ({ id: c as Filter, label: CATEGORY_LABEL[c] })),
  { id: 'done', label: 'Done' },
];

export default function VaultPage({ vault, onAdd }: { vault: Vault; onAdd: () => void }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<LifeItem | null>(null);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = vault.items;
    if (filter === 'done') out = out.filter((i) => i.status === 'done');
    else {
      out = out.filter((i) => i.status === 'active');
      if (filter === 'urgent') out = sortByUrgency(out).slice(0, vault.stats.overdue + vault.stats.critical + vault.stats.soon);
      else if (filter !== 'all') out = out.filter((i) => i.category === filter);
    }
    if (needle) {
      out = out.filter((i) =>
        [i.title, i.notes, i.issuer, i.kind].some((v) => v.toLowerCase().includes(needle)),
      );
    }
    return out;
  }, [vault.items, vault.stats, q, filter]);

  return (
    <div className="stack fade-in">
      <div className="page-head row-between">
        <div>
          <h1>The vault</h1>
          <p className="lede">Everything you are tracking, searchable and sorted by what will hurt first.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onAdd}>
          + Add item
        </button>
      </div>

      <div className="card">
        <div className="card-body stack-sm">
          <div className="search">
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>
            <label className="sr" htmlFor="vq">
              Search your items
            </label>
            <input
              id="vq"
              className="input"
              type="search"
              value={q}
              placeholder="Search names, notes, providers…"
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="row" role="group" aria-label="Filter items">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`chip${filter === f.id ? ' on' : ''}`}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
            <span className="spacer" />
            <span className="hint">{list.length} shown</span>
          </div>
        </div>
      </div>

      <div className="card">
        {list.length === 0 ? (
          <div className="empty">
            <div className="empty-ico" aria-hidden="true">⌕</div>
            <h3>No matches</h3>
            <p>
              {q.trim()
                ? `Nothing matches “${q.trim()}”. Try a shorter term, or clear the filter.`
                : 'Nothing in this view yet. Switch filter, or add a real deadline.'}
            </p>
            <div className="row" style={{ justifyContent: 'center' }}>
              {q.trim() ? (
                <button type="button" className="btn btn-ghost" onClick={() => setQ('')}>
                  Clear search
                </button>
              ) : null}
              <button type="button" className="btn btn-primary" onClick={onAdd}>
                + Add item
              </button>
            </div>
          </div>
        ) : (
          <div className="queue">
            {list.map((i) => (
              <div key={i.id} style={{ display: 'flex', alignItems: 'stretch' }}>
                <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
                  <ItemRow item={i} />
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ margin: '14px 16px 14px 0', alignSelf: 'center' }}
                  onClick={() => setEditing(i)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-body row-between">
          <div className="stack-sm" style={{ gap: 2 }}>
            <span className="label">Data</span>
            <span className="hint">
              Everything lives in this browser's localStorage. Reset restores the demo records.
            </span>
          </div>
          <div className="row">
            <button type="button" className="btn btn-ghost btn-sm" onClick={vault.resetDemo}>
              Reset demo data
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={vault.clearAll}>
              Clear everything
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <AddDialog
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(d) => {
            vault.update(editing.id, d);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
