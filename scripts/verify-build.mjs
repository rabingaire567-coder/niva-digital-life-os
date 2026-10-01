/**
 * Local pre-deploy verification.
 *
 * Serves dist/ under a /niva-digital-life-os/ prefix (matching how GitHub Pages
 * hosts the site) and loads it in a real browser, so sub-path routing bugs are
 * caught here rather than after a deploy. Also checks a deep link and a mobile
 * viewport.
 *
 * Usage: node scripts/verify-build.mjs
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PREFIX = process.env.NIVA_BASE || '/niva-digital-life-os/';
const PORT = 4188;

const CANDIDATES = [
  process.env.PLAYWRIGHT_PATH,
  join(process.cwd(), 'node_modules', 'playwright', 'index.js'),
  'C:/Users/Rabin Gaire/OneDrive/Documents/Default Project/Nexa/node_modules/playwright/index.js',
].filter(Boolean);
const found = CANDIDATES.find((p) => existsSync(p));
if (!found) {
  console.error('playwright not found. Set PLAYWRIGHT_PATH to its index.js');
  process.exit(2);
}
const pw = await import(pathToFileURL(found).href);
const chromium = pw.chromium ?? pw.default?.chromium;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer(async (req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (!url.startsWith(PREFIX)) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('outside base');
    return;
  }
  const rel = url.slice(PREFIX.length) || 'index.html';
  let file = join(dist, rel);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
  } catch {
    // Unknown path: GitHub Pages serves 404.html with a 404 status and the SPA boots.
    file = join(dist, '404.html');
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    res.end(await readFile(file));
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(await readFile(file));
});

await new Promise((r) => server.listen(PORT, r));
const base = `http://localhost:${PORT}${PREFIX}`;
console.log('serving', dist, 'at', base, '\n');

const browser = await chromium.launch();
let failed = false;

async function check(label, path, expect) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  const errors = [];
  const bad = [];
  // On a static host there is no /api proxy, so the AI calls 404 and the app
  // falls back to its on-device engine by design. Those are expected.
  const isApiFallback = (t) => /Failed to load resource/.test(t);
  const apiCalls = [];
  page.on('request', (r) => r.url().includes('/api/') && apiCalls.push(new URL(r.url()).pathname));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
  page.on('requestfailed', (r) => bad.push(r.url()));
  await page.goto(base + path, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(700);
  const text = await page.evaluate(() => document.body.innerText);
  const painted = await page.$eval('#root', (el) => el.innerHTML.length).catch(() => 0);
  const real = errors.filter((t) => !isApiFallback(t));
  const ok = text.includes(expect) && !text.includes('Page not found') && real.length === 0 && painted > 500;
  if (!ok) failed = true;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(12)} painted=${String(painted).padEnd(5)} apiFallback=${apiCalls.length}  ${JSON.stringify(text.slice(0, 80))}`,
  );
  if (real.length) console.log('        errors:', real);
  if (bad.length) console.log('        failed requests:', bad);
  return page;
}

await (await check('home', '', 'Your queue')).close();
await (await check('vault', 'vault', 'The vault')).close();
await (await check('guide', 'guide', 'How NIVA works')).close();
const d = await check('deep link', 'item/seed-passport', 'Renewal plan');
await d.screenshot({ path: 'verify-detail.png' });
await d.close();
console.log('wrote verify-detail.png');

const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto(base, { waitUntil: 'networkidle' });
await m.waitForTimeout(600);
await m.screenshot({ path: 'verify-mobile.png' });
console.log('wrote verify-mobile.png');
await m.close();

await browser.close();
server.close();
console.log(failed ? '\nRESULT: FAIL' : '\nRESULT: PASS');
process.exit(failed ? 1 : 0);
