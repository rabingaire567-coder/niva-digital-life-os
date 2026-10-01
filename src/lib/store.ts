import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LifeItem, Status } from '@/types';
import { sortByUrgency, urgencyFor } from '@/lib/date';
import { SEED } from '@/data/seed';

const KEY = 'niva:v1:items';
const SETTINGS_KEY = 'niva:v1:settings';

export interface Settings {
  theme: 'light' | 'dark';
  name: string;
  hideDone: boolean;
}

export function loadSettings(): Settings {
  const fallback: Settings = { theme: 'light', name: '', hideDone: true };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      name: typeof parsed.name === 'string' ? parsed.name.slice(0, 40) : '',
      hideDone: parsed.hideDone !== false,
    };
  } catch {
    return fallback;
  }
}

function isItem(v: unknown): v is LifeItem {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.title === 'string' && typeof o.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.due);
}

function readItems(): LifeItem[] | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isItem);
  } catch {
    return null;
  }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `i-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useVault() {
  const [items, setItems] = useState<LifeItem[]>(() => readItems() ?? SEED);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked: the app still works for this session */
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.theme = settings.theme;
  }, [settings]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const add = useCallback((draft: Omit<LifeItem, 'id' | 'createdAt' | 'status'>): LifeItem => {
    const item: LifeItem = { ...draft, id: newId(), createdAt: new Date().toISOString(), status: 'active' };
    setItems((prev) => sortByUrgency([item, ...prev]));
    return item;
  }, []);

  const update = useCallback((id: string, patch: Partial<LifeItem>) => {
    setItems((prev) => sortByUrgency(prev.map((i) => (i.id === id ? { ...i, ...patch, id: i.id } : i))));
  }, []);

  const setStatus = useCallback((id: string, status: Status) => {
    setItems((prev) =>
      sortByUrgency(
        prev.map((i) =>
          i.id === id
            ? { ...i, status, completedAt: status === 'done' ? new Date().toISOString() : undefined }
            : i,
        ),
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const resetDemo = useCallback(() => {
    setItems(SEED);
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const stats = useMemo(() => {
    const active = items.filter((i) => i.status === 'active');
    const overdue = active.filter((i) => urgencyFor(i).level === 'overdue');
    const critical = active.filter((i) => urgencyFor(i).level === 'critical');
    const soon = active.filter((i) => urgencyFor(i).level === 'soon');
    const later = active.filter((i) => urgencyFor(i).level === 'upcoming' || urgencyFor(i).level === 'scheduled');
    return {
      total: active.length,
      done: items.length - active.length,
      overdue: overdue.length,
      critical: critical.length,
      soon: soon.length,
      later: later.length,
      ordered: sortByUrgency(active),
    };
  }, [items]);

  return {
    items,
    stats,
    settings,
    loaded,
    add,
    update,
    setStatus,
    remove,
    resetDemo,
    clearAll,
    updateSettings,
  };
}

export type Vault = ReturnType<typeof useVault>;
