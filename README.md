# NIVA — Digital Life OS

> Every deadline in your real life, in one place.

**Hackathon theme:** Digital Life, Better Life

---

## The problem

Expired paperwork is almost never discovered on the day it expires. It surfaces at the airport
counter, the bank teller, the insurance desk or the clinic — where fixing it takes days or weeks,
costs a penalty, or is simply too late.

Three things go wrong:

1. **Nothing collects it.** A passport expiry, a car fitness date, a gym auto-renewal and a blood
   pressure refill live in a head, a paper diary, or eleven different phone reminders.
2. **Lead time is ignored.** The date is treated as the deadline. For a passport the real deadline
   is 120 days earlier; for a gym cancellation it is one click, today.
3. **The paperwork is the hard part.** Everyone knows a passport expires. Nobody remembers that the
   appointment must be booked, the photos must meet a spec, and a signature mismatch is a rejection.

Password managers and note apps store secrets and text. None of them track **life admin**.

## The solution

NIVA is a queue for real-life deadlines that does three things a reminder never does:

- **Reads plain language.** “my nepal passport expires 12 March 2027” becomes a tracked item with
  the type, country, due date and a sensible lead time — with a confidence score and questions
  where it is unsure.
- **Sorts by consequence, not by date.** Urgency is computed against the lead time each task
  actually needs, so a passport due in 100 days correctly outranks a gym renewal due in 3 days.
- **Produces a plan.** Every item expands into ordered steps, the documents to gather first, and
  the specific traps that cause rejections or extra cost.

## The AI

NIVA's AI is real functionality in three places, not a chatbot bolted onto the side:

| Feature | What it does | Why it needs intelligence |
| --- | --- | --- |
| **Natural-language capture** | Turns free text into a structured item: title, type, due date, lead time, country, provider. | Requires date extraction across formats, keyword-to-type classification, and an honest confidence value. |
| **Renewal plan** | Generates ordered steps, a document checklist, lead-time guidance and rejection traps per item. | Procedure differs per task and per urgency — the same passport plan is different 2 days out vs 120 days out. |
| **Daily brief** | Collapses the whole queue into what to do today, what to do this week, and what can wait. | Requires ranking, not summarising. Overdue always wins. |

### The AI runs in two modes, and the UI always tells you which

**1. On-device engine (default, always available).** A rule-based parser and planner that ships in
the bundle and runs with no network. It handles ISO dates, `12 March 2027`, `05/02/2027`,
“in 3 days”, “in 2 weeks”, “in 6 months”, month-year, and relative phrasing; classifies 27 task
types by keyword; detects country from 20 place names; and builds every plan from a curated
reference knowledge base. Output is labelled **“On-device engine”**.

**2. Model-backed (optional).** Connect a Gemini key and the same three features are handled by the
model, with the on-device engine kept as a validation layer so a malformed model response can never
insert an out-of-range date or an unknown category. Output is labelled **“AI generated”**.

This means the demo is never broken, never makes a network call it cannot make, and never
misrepresents where an answer came from.

## Tech stack

- React 19 + TypeScript + Vite 7
- React Router 7
- `localStorage` persistence (no database, no account, no backend required)
- Optional Node proxy (`server/index.js`) for the AI provider
- Vitest — 42 tests covering the engine, urgency maths and every route render
- Zero UI libraries. Hand-written CSS design system with light/dark themes.

## Running it

```bash
npm install
npm run dev        # http://localhost:5174
```

Production build:

```bash
npm run build      # typecheck + bundle + SPA 404/200 shims
npm run preview
```

Tests:

```bash
npm test           # 42 tests
npm run typecheck
```

## AI setup (optional — the app is fully functional without it)

**Get a key:** <https://aistudio.google.com/apikey>

**Where it goes:** copy `.env.example` to `.env` and set the value. That file is git-ignored.

```bash
cp .env.example .env
# .env
GEMINI_API_KEY=your-key-here
```

```bash
npm run dev:full   # starts the AI proxy on :8788 and Vite on :5174
```

### Security

The key is read by `server/index.js` from the environment only. It is **never** placed in a
`VITE_*` variable, never imported into `src/`, never bundled, and never returned to the browser.
The proxy accepts three narrow request shapes and returns a narrow JSON object. With no key
configured, `/api/*` returns `503` and the frontend falls back to the on-device engine.

Do not put passwords, card numbers or PINs in the notes field. NIVA is a reminder system, not a
vault.

## Data honesty

- **Demo records are fictional.** The 12 seeded items are sample data, clearly labelled, generated
  relative to today so the queue always looks realistic. They are not real people's documents.
- **Checklists are not verified sources.** They are general, publicly-documented procedure. Fees,
  forms, office locations and eligibility change. Every generated plan carries a line telling the
  user to confirm with the issuing authority, and the app never presents guidance as official.
- **No fabricated statistics.** There are no invented percentages or “X% of users” claims anywhere
  in the product.

## Features

- **Today** — AI daily brief, urgency tiles, priority queue, closest-deadline focus
- **Vault** — search across names/notes/providers, filter by category or urgency, edit inline,
  reset or clear data
- **Item detail** — AI renewal plan, document checklist, warning traps, timeline showing when the
  lead-time window opens, mark done / reopen / delete
- **How it works** — product walkthrough, the 27 task types with their lead times, and a plain
  statement of where data goes
- **Capture** — natural-language entry with live confidence meter, plus a full manual form;
  defaults pre-filled from the matched task type
- **Responsive** — mobile (bottom-safe header, collapsible nav), tablet, desktop
- **Accessible** — focus trap and Escape handling in modals, focus restore, `aria-*` on tabs and
  filters, visible focus rings, `prefers-reduced-motion` support
- **States** — loading skeletons, empty states, error states, and recovery from corrupted
  localStorage

## Deploy

Static — GitHub Pages, Vercel, Netlify or Cloudflare Pages all work. The build emits `dist/` with
`404.html`, `200.html` and `.nojekyll` so deep links like `/item/<id>` survive a hard refresh.

The AI proxy is a separate Node process and is **not** part of the static deploy. On a static host
NIVA runs fully on its on-device engine, which is the intended default.

## Project structure

```
niva/
├── index.html
├── vite.config.ts            # relative base for static hosts, /api proxy
├── server/index.js           # AI proxy — reads the key from env only
├── scripts/                  # dev runner, SPA 404 shim, dist server
├── public/favicon.svg
└── src/
    ├── App.tsx               # routes
    ├── types.ts
    ├── data/seed.ts          # fictional demo records
    ├── lib/
    │   ├── knowledge.ts      # 27 task types: lead times, steps, documents, traps
    │   ├── engine.ts         # on-device parser, plan builder, brief writer
    │   ├── ai.ts             # calls the proxy, validates, falls back
    │   ├── store.ts          # localStorage vault + settings
    │   └── date.ts           # urgency maths
    ├── components/           # Layout, Modal, ItemRow, AiPanel, AddDialog
    ├── pages/                # Today, Vault, ItemPage, Guide
    └── styles/index.css      # design system
```

## Licence

MIT
