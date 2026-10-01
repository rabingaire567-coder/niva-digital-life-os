import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import type { Vault } from '@/lib/store';

const LINKS = [
  { to: '/', label: 'Today', end: true },
  { to: '/vault', label: 'Vault', end: false },
  { to: '/guide', label: 'How it works', end: false },
];

export default function Layout({ vault, onAdd, children }: { vault: Vault; onAdd: () => void; children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  const { settings, updateSettings, stats } = vault;

  useEffect(() => setMenu(false), [loc.pathname]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  const urgent = stats.overdue + stats.critical;

  return (
    <div className="shell">
      <header className="header">
        <div className="wrap header-in">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">N</span>
            <span>
              NIVA
              <span className="brand-sub">Digital Life OS</span>
            </span>
          </Link>

          <button
            type="button"
            className="icon-btn nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
              {menu ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>

          <nav className={`nav${menu ? '' : ' hidden-sm'}`} style={menu ? undefined : { display: undefined }}>
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => `nav-link${isActive ? ' on' : ''}`}
              >
                {l.label}
                {l.to === '/vault' && urgent > 0 ? ` (${urgent})` : ''}
              </NavLink>
            ))}
            <button
              type="button"
              className="icon-btn"
              style={{ marginLeft: 6 }}
              aria-label={settings.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            >
              {settings.theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4.2" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                </svg>
              )}
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={onAdd} style={{ marginLeft: 2 }}>
              + Add
            </button>
          </nav>
        </div>
      </header>

      <main>
        <div className="wrap">{children}</div>
      </main>

      <footer className="footer">
        <div className="wrap footer-in">
          <span>
            <strong style={{ color: 'var(--text-2)' }}>NIVA</strong> — Digital Life OS
          </span>
          <span className="qdot">•</span>
          <span>Your data stays in this browser (localStorage). Nothing is uploaded unless an AI endpoint is configured.</span>
          <span className="spacer" />
          <span>Checklists are general guidance, not official sources.</span>
        </div>
      </footer>
    </div>
  );
}
