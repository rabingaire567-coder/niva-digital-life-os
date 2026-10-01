/**
 * NIVA AI proxy.
 *
 * The browser never sees an API key. This small server reads the key from the
 * environment, calls the model, and returns a narrow JSON shape. If no key is
 * configured the endpoints return 503 and the frontend falls back to its
 * on-device engine, so the app stays fully functional.
 *
 * Run:  node server/index.js       (expects GEMINI_API_KEY or NIVA_AI_KEY)
 * Dev:  npm run dev:full            (proxy + vite together)
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = Number(process.env.PORT || 8788);

for (const f of ['.env.local', '.env']) {
  const p = join(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

const API_KEY = process.env.GEMINI_API_KEY || process.env.NIVA_AI_KEY || '';
const MODEL = process.env.NIVA_MODEL || 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const KINDS = [
  ['passport', 'Passport'],
  ['driving-licence', 'Driving licence'],
  ['national-id', 'National ID / citizenship'],
  ['insurance', 'Insurance premium'],
  ['vehicle-registration', 'Vehicle registration / road tax'],
  ['vehicle-fitness', 'Vehicle fitness / inspection'],
  ['gym-membership', 'Gym or club membership'],
  ['medication', 'Medication refill / review'],
  ['health-checkup', 'Health check-up'],
  ['sim-card', 'SIM / phone validity'],
  ['utility-bill', 'Utility bill'],
  ['rent', 'Rent / lease'],
  ['warranty', 'Warranty / product cover'],
  ['credit-card', 'Credit card'],
  ['bank-kyc', 'Bank KYC'],
  ['subscription', 'Subscription / free trial'],
  ['tax-filing', 'Tax filing'],
  ['work-permit', 'Work permit / visa'],
  ['business-registration', 'Business registration / licence'],
  ['device-support', 'Device backup / migration'],
  ['birth-certificate', 'Civil certificate'],
  ['travel-document', 'Travel documents'],
  ['loan-emi', 'Loan / EMI'],
  ['domestic-help', 'Household service renewal'],
  ['password-audit', 'Account security review'],
  ['student-enrolment', 'Course / scholarship form'],
  ['charity-giving', 'Regular donation'],
];

const CATEGORIES = ['document', 'finance', 'health', 'vehicle', 'subscription', 'home', 'work', 'other'];
const JURIS = ['NP', 'IN', 'AE', 'US', 'UK', 'OTHER'];

const CATEGORY_HINT = `Allowed categories: ${CATEGORIES.join(', ')}.
Allowed jurisdictions: ${JURIS.join(', ')} (NP=Nepal, IN=India, AE=UAE, US=United States, UK=United Kingdom).`;

const SCHEMA = `Reply with a single JSON object and nothing else. No markdown, no prose.
Required keys:
  headline: string (max 90 chars)
  leadTimeNote: string (max 220 chars, one or two sentences)
  steps: string[] (3 to 6 items, imperative, each max 140 chars)
  documents: string[] (3 to 8 items, concrete document names)
  watchOuts: string[] (1 to 3 items, common rejection or cost traps)`;

const TASKS = {
  parse: {
    system: `You extract structured life-admin deadlines from plain text. ${CATEGORY_HINT}
Allowed kind values: ${KINDS.map(([k]) => k).join(', ')}, or "general".
Reply with a single JSON object and nothing else. No markdown.
Required keys:
  title: string (max 60 chars, a short human label)
  kind: string (from the allowed list)
  category: string (from the allowed categories)
  due: string (ISO date "YYYY-MM-DD"; today is ${new Date().toISOString().slice(0, 10)})
  leadDays: number (0-180; how many days of lead time this realistically needs)
  jurisdiction: string (from the allowed jurisdictions)
  issuer: string (max 80 chars, "" if unknown)
  confidence: number (0 to 1, how sure you are about the date)
  questions: string[] (0 to 2 short questions for the user to confirm; empty if confident)
Rules: if no date is present, pick a sensible near date and lower confidence. Never invent an
issuer. Keep the title plain and specific.`,
    build: (b) => b.text,
  },
  plan: {
    system: `You write practical, specific checklists for renewing documents and services.
Never state fees, addresses or office hours as facts. Add a line telling the user to confirm with
the issuing authority. ${SCHEMA}`,
    build: (b) => `Plan for this item:
${JSON.stringify(b.item, null, 2)}

Built-in reference checklist (generic — verify with the issuing authority):
${JSON.stringify(b.reference, null, 2)}`,
  },
  brief: {
    system: `You write a short, calm daily brief from a personal deadline queue.
Be specific and name the actual items. Never invent deadlines. Do not use alarmist language.
Reply with a single JSON object and nothing else. No markdown.
Required keys:
  headline: string (max 140 chars, one sentence, states the real situation)
  doToday: string[] (0 to 4 items, each starting with a verb, max 130 chars)
  doThisWeek: string[] (0 to 5 items, each starting with a verb, max 130 chars)`,
    build: (b) => `Today is ${b.today}. The queue:
${JSON.stringify(b.items, null, 2)}`,
  },
};

function send(res, code, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'cache-control': 'no-store',
  });
  res.end(body);
}

async function callModel(task, body) {
  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(API_KEY)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: task.system }] },
      contents: [{ role: 'user', parts: [{ text: task.build(body) }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1100, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`upstream ${res.status}: ${t.slice(0, 200)}`);
  }

  const json = await res.json();
  const raw = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
  if (!raw.trim()) throw new Error('empty model response');
  return JSON.parse(raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim());
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, GET, OPTIONS',
      'access-control-allow-headers': 'content-type',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/api/health') {
    send(res, 200, { ok: true, model: API_KEY ? MODEL : null, ai: Boolean(API_KEY) });
    return;
  }

  const name = (req.url || '').replace(/^\/api\//, '').split('?')[0];
  const task = TASKS[name];
  if (!task) {
    send(res, 404, { error: 'unknown endpoint' });
    return;
  }
  if (req.method !== 'POST') {
    send(res, 405, { error: 'POST only' });
    return;
  }
  if (!API_KEY) {
    send(res, 503, { error: 'AI not configured. Set GEMINI_API_KEY in .env' });
    return;
  }

  const raw = await new Promise((resolve) => {
    let buf = '';
    req.on('data', (c) => {
      buf += c;
      if (buf.length > 64_000) req.destroy();
    });
    req.on('end', () => resolve(buf));
  });

  let body;
  try {
    body = JSON.parse(raw || '{}');
  } catch {
    send(res, 400, { error: 'invalid JSON body' });
    return;
  }

  if (name === 'parse' && (typeof body.text !== 'string' || body.text.length < 3 || body.text.length > 4000)) {
    send(res, 400, { error: 'text must be 3-4000 characters' });
    return;
  }

  try {
    const data = await callModel(task, body);
    send(res, 200, { data });
  } catch (err) {
    console.error(`[niva] ${name} failed:`, err.message);
    send(res, 502, { error: 'AI request failed' });
  }
});

server.listen(PORT, () => {
  console.log(`[niva] AI proxy on http://localhost:${PORT}`);
  console.log(
    API_KEY
      ? `[niva] model: ${MODEL} (key loaded from environment)`
      : '[niva] no API key set — the app will use its on-device engine. See .env.example',
  );
});
