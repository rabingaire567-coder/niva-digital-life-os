import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Vault } from '@/lib/store';
import ItemRow from '@/components/ItemRow';
import { BriefPanel } from '@/components/AiPanel';
import { countdown, formatDate } from '@/lib/date';

export default function Today({ vault, onAdd }: { vault: Vault; onAdd: () => void }) {
  const { stats, settings, updateSettings } = vault;
  const [showAll, setShowAll] = useState(false);

  const top = stats.ordered.slice(0, 6);
  const rest = stats.ordered.slice(6);
  const next = stats.ordered[0];
  const doneList = vault.items.filter((i) => i.status === 'done').slice(0, 4);

  const tiles = [
    { n: stats.overdue, l: 'Overdue', tone: 'var(--red)' },
    { n: stats.critical, l: 'Next 7 days', tone: 'var(--orange)' },
    { n: stats.soon, l: 'This month', tone: 'var(--amber)' },
    { n: stats.later, l: 'Later', tone: 'var(--blue)' },
  ];

  return (
    <div className="stack-lg fade-in">
      <section className="hero">
        <h1>{settings.name ? `Good to see you, ${settings.name}.` : 'Every deadline in your real life, in one place.'}</h1>
        <p className="lede">
          NIVA turns the things you say in passing — “my passport expires next March” — into a
          tracked, prioritised queue, then plans the paperwork so nothing expires on you.
        </p>
        <div className="hero-cta">
          <button type="button" className="btn btn-primary btn-lg" onClick={onAdd}>
            + Add something
          </button>
          <Link to="/vault" className="btn btn-ghost btn-lg">
            Open the vault
          </Link>
          {!settings.name && (
            <button
              type="button"
              className="btn btn-ghost btn-lg"
              onClick={() => {
                const n = window.prompt('What should NIVA call you?', '');
                if (n && n.trim()) updateSettings({ name: n.trim().slice(0, 40) });
              }}
            >
              Set my name
            </button>
          )}
        </div>
        <div className="meta-grid" style={{ marginTop: 22 }}>
          <div className="meta-cell">
            <div className="meta-k">Next up</div>
            <div className="meta-v">{next ? next.title : 'Nothing tracked'}</div>
          </div>
          <div className="meta-cell">
            <div className="meta-k">When</div>
            <div className="meta-v">{next ? countdown(next) : '—'}</div>
          </div>
          <div className="meta-cell">
            <div className="meta-k">Tracked</div>
            <div className="meta-v">{stats.total} active</div>
          </div>
          <div className="meta-cell">
            <div className="meta-k">Closed</div>
            <div className="meta-v">{stats.done} done</div>
          </div>
        </div>
      </section>

      <div className="stats">
        {tiles.map((t) => (
          <div className="stat" key={t.l} style={{ '--tone': t.tone } as React.CSSProperties}>
            <div className="stat-n">{t.n}</div>
            <div className="stat-l">{t.l}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="stack">
          <div className="card">
            <div className="card-head">
              <h2>Your queue</h2>
              <span className="badge">most urgent first</span>
              <span className="spacer" />
              <Link to="/vault" className="btn btn-ghost btn-sm">
                See all {stats.total}
              </Link>
            </div>

            {top.length === 0 ? (
              <div className="empty">
                <div className="empty-ico" aria-hidden="true">✓</div>
                <h3>Nothing is overdue</h3>
                <p>
                  Your queue is empty, which usually means the tracking has not started yet rather
                  than that life admin is genuinely done.
                </p>
                <button type="button" className="btn btn-primary" onClick={onAdd}>
                  Add your first deadline
                </button>
              </div>
            ) : (
              <div className="queue">
                {top.map((i) => (
                  <ItemRow key={i.id} item={i} />
                ))}
              </div>
            )}

            {rest.length > 0 && (
              <>
                <div className="card-foot">
                  <button type="button" className="btn btn-ghost btn-sm btn-block" onClick={() => setShowAll((s) => !s)}>
                    {showAll ? `Hide ${rest.length} more` : `Show ${rest.length} more`}
                  </button>
                </div>
                {showAll && (
                  <div className="queue">
                    {rest.map((i) => (
                      <ItemRow key={i.id} item={i} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {doneList.length > 0 && (
            <div className="card">
              <div className="card-head">
                <h3>Recently closed</h3>
                <span className="badge green">{vault.items.filter((i) => i.status === 'done').length} done</span>
              </div>
              <div className="queue">
                {doneList.map((i) => (
                  <ItemRow key={i.id} item={i} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="stack">
          <BriefPanel items={vault.items} name={settings.name || undefined} />

          <div className="card">
            <div className="card-head">
              <h3>Why this matters</h3>
            </div>
            <div className="card-body stack-sm">
              <div className="note">
                <span aria-hidden="true">⏱</span>
                <span>
                  Most expired-document problems are not discovered on the day. They surface at the
                  airport, the counter or the clinic — where fixing them takes days or weeks.
                </span>
              </div>
              <div className="note">
                <span aria-hidden="true">🧠</span>
                <span>
                  Lead time is the part people get wrong. A passport is a three-month job. A gym
                  cancellation is a one-click job. NIVA stores a different lead time for each.
                </span>
              </div>
              <div className="note">
                <span aria-hidden="true">🔒</span>
                <span>
                  Your list is a reminder system, not a password vault. It lives in this browser and
                  is never sent anywhere unless you connect an AI endpoint yourself.
                </span>
              </div>
            </div>
          </div>

          {next && (
            <div className="card">
              <div className="card-head">
                <h3>Closest deadline</h3>
              </div>
              <div className="card-body stack-sm">
                <div>
                  <div style={{ fontWeight: 660, fontSize: '1.02rem', letterSpacing: '-0.02em' }}>{next.title}</div>
                  <div className="hint">
                    {formatDate(next.due)} · {next.leadDays}-day lead time
                  </div>
                </div>
                <Link to={`/item/${next.id}`} className="btn btn-primary btn-block">
                  Open the plan
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
