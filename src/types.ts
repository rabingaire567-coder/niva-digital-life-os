export type Category =
  | 'document'
  | 'finance'
  | 'health'
  | 'vehicle'
  | 'subscription'
  | 'home'
  | 'work'
  | 'digital'
  | 'other';

export type Status = 'active' | 'done';

export type Urgency = 'overdue' | 'critical' | 'soon' | 'upcoming' | 'scheduled';

export type Jurisdiction = 'NP' | 'IN' | 'AE' | 'US' | 'UK' | 'OTHER';

export interface LifeItem {
  id: string;
  title: string;
  /** Machine-readable kind used by the knowledge base, e.g. `passport`. */
  kind: string;
  category: Category;
  /** ISO `YYYY-MM-DD`. */
  due: string;
  /** How many days before `due` NIVA should start warning you. */
  leadDays: number;
  jurisdiction: Jurisdiction;
  issuer: string;
  notes: string;
  status: Status;
  /** Where the deadline came from: `manual` or `ai`. */
  source: 'manual' | 'ai';
  createdAt: string;
  completedAt?: string;
  /** Original text when the item was created by the AI parser. */
  rawText?: string;
}

export interface ItemDraft {
  title: string;
  kind: string;
  category: Category;
  due: string;
  leadDays: number;
  jurisdiction: Jurisdiction;
  issuer: string;
  notes: string;
  /** 0-1, how sure the parser is about the extracted date. */
  confidence: number;
  /** Things the parser could not resolve, shown to the user for review. */
  questions: string[];
}

export interface AiPlan {
  headline: string;
  leadTimeNote: string;
  steps: string[];
  documents: string[];
  watchOuts: string[];
  source: 'ai' | 'offline';
}

export interface AiBrief {
  headline: string;
  doToday: string[];
  doThisWeek: string[];
  source: 'ai' | 'offline';
}

export interface UrgencyMeta {
  level: Urgency;
  label: string;
  daysLeft: number;
  color: string;
  rank: number;
}
