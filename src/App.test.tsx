import { beforeEach, describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { KEYS_TEST_RESET } from './test-helpers';

async function render(path: string) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
  });
  // Let the async brief/plan requests settle so no state update lands outside act.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 60));
  });
  const html = host.innerHTML;
  await act(async () => root.unmount());
  host.remove();
  return html;
}

describe('app renders every route without crashing', () => {
  beforeEach(() => {
    localStorage.clear();
    void KEYS_TEST_RESET;
  });

  it('renders the Today dashboard with seeded data', async () => {
    const html = await render('/');
    expect(html).toContain('NIVA');
    expect(html).toContain('Your queue');
    expect(html).toContain('Today');
    expect(html.length).toBeGreaterThan(2000);
  });

  it('renders the vault with search and filters', async () => {
    const html = await render('/vault');
    expect(html).toContain('The vault');
    expect(html).toContain('Search names');
    expect(html).toContain('Passport renewal');
  });

  it('renders the guide page', async () => {
    const html = await render('/guide');
    expect(html).toContain('How NIVA works');
    expect(html).toContain('passport');
  });

  it('renders the 404 route for an unknown path', async () => {
    const html = await render('/definitely-not-a-page');
    expect(html).toContain('Page not found');
  });

  it('renders the detail page for a seeded item id', async () => {
    const html = await render('/item/seed-passport');
    expect(html).toContain('Passport renewal');
    expect(html).toContain('Renewal plan');
    expect(html).toContain('Timeline');
  });

  it('shows a friendly not-found state for a missing item id', async () => {
    const html = await render('/item/does-not-exist');
    expect(html).toContain('That item is gone');
  });

  it('renders an empty state after the queue is cleared', async () => {
    localStorage.setItem('niva:v1:items', '[]');
    const today = await render('/');
    expect(today).toContain('Nothing is overdue');
    const vault = await render('/vault');
    expect(vault).toContain('No matches');
  });

  it('persists added items to localStorage', async () => {
    await render('/');
    const stored = localStorage.getItem('niva:v1:items') ?? '';
    expect(stored.length).toBeGreaterThan(0);
    const parsed = JSON.parse(stored) as unknown[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(5);
  });

  it('recovers from corrupted localStorage instead of crashing', async () => {
    localStorage.setItem('niva:v1:items', '{not json');
    const html = await render('/');
    expect(html).toContain('Your queue');
  });
});
