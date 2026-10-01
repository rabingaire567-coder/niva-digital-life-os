import { Link } from 'react-router-dom';
import { KNOWLEDGE, entryFor } from '@/lib/knowledge';
import { CATEGORY_LABEL } from '@/lib/knowledge';

const STEPS = [
  {
    n: '01',
    t: 'Say it once, in your own words',
    d: '“My passport expires in March 2027.” NIVA reads the date, the type, the country and how early you should be warned — then asks you to confirm before saving.',
  },
  {
    n: '02',
    t: 'NIVA sorts by what hurts first',
    d: 'Not by the date alone. A passport due in 100 days outranks a gym renewal due in 3 days, because the passport needs 120 days of lead time and the gym needs none.',
  },
  {
    n: '03',
    t: 'You get a plan, not just a date',
    d: 'Every item expands into ordered steps, the paperwork to gather, and the mistakes that cause rejections — the part reference checklists never tell you.',
  },
  {
    n: '04',
    t: 'One brief instead of fourteen notifications',
    d: 'The daily brief collapses your queue into what to do today, what to do this week, and what can wait. Overdue items always surface first.',
  },
];

export default function Guide() {
  return (
    <div className="stack-lg fade-in">
      <section className="hero">
        <h1>How NIVA works</h1>
        <p className="lede">
          NIVA is a reminder system for the paperwork side of life — the part where a missed date
          turns into a queue, a fine, or a rejected application. It does not replace official
          sources; it tells you what to do next and when to start.
        </p>
      </section>

      <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
        {STEPS.map((s) => (
          <div className="card" key={s.n}>
            <div className="card-body row" style={{ alignItems: 'flex-start', gap: 16, flexWrap: 'nowrap' }}>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: 'var(--brand)',
                  lineHeight: 1.1,
                  flexShrink: 0,
                }}
              >
                {s.n}
              </span>
              <div>
                <h3 style={{ marginBottom: 5 }}>{s.t}</h3>
                <p className="hint" style={{ fontSize: '0.9rem' }}>
                  {s.d}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <h2>What NIVA knows about</h2>
          <span className="spacer" />
          <span className="badge">{KNOWLEDGE.length} task types</span>
        </div>
        <div className="card-body">
          <div className="meta-grid">
            {KNOWLEDGE.map((k) => {
              const e = entryFor(k.kind);
              return (
                <div className="meta-cell" key={k.kind}>
                  <div className="meta-k">{CATEGORY_LABEL[e.category]}</div>
                  <div className="meta-v" style={{ fontSize: '0.87rem' }}>{k.label}</div>
                  <div className="hint" style={{ marginTop: 2 }}>{k.lead}-day lead time</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card-foot">
          <p className="hint">
            These checklists are general, publicly-documented procedure — not an official source.
            Fees, forms and office locations change, so confirm with the issuing authority before
            you go. NIVA never presents this as verified.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Where your data goes</h2>
        </div>
        <div className="card-body stack-sm">
          <div className="note">
            <span aria-hidden="true">1</span>
            <span>
              <strong>Stored locally.</strong> Items and settings live in this browser's
              localStorage. Clearing site data removes them. There is no account and no server.
            </span>
          </div>
          <div className="note">
            <span aria-hidden="true">2</span>
            <span>
              <strong>AI is optional and off by default.</strong> NIVA ships with an on-device
              engine that parses text, builds plans and writes briefs locally. It labels its output
              “On-device engine” so you always know which one you are reading.
            </span>
          </div>
          <div className="note">
            <span aria-hidden="true">3</span>
            <span>
              <strong>No key in the browser, ever.</strong> Connecting a model means running the
              bundled proxy server, which reads the key from an environment variable. The key is
              never bundled, never committed, and never sent to the client.
            </span>
          </div>
          <div className="note">
            <span aria-hidden="true">4</span>
            <span>
              <strong>Not a password manager.</strong> NIVA stores dates and reminder notes, not
              credentials. Do not put passwords, card numbers or PINs in the notes field.
            </span>
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'center', paddingTop: 6 }}>
        <Link to="/" className="btn btn-primary btn-lg">
          Go to your queue
        </Link>
        <Link to="/vault" className="btn btn-ghost btn-lg">
          Open the vault
        </Link>
      </div>
    </div>
  );
}
