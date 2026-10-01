/**
 * Live smoke check: loads the deployed site in a real browser, captures console
 * errors, page errors and failed requests, and asserts the app actually painted.
 * Not part of the test suite - run manually:  node scripts/check-live.mjs [url]
 */
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

// Playwright is a dev-only diagnostic tool and is not a project dependency, so
// it is resolved from whichever checkout on this machine has it installed.
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

const URL = process.argv[2] || 'https://rabingaire567-coder.github.io/niva-digital-life-os/';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
const failed = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
page.on('requestfailed', (r) => failed.push(`${r.url()} :: ${r.failure()?.errorText}`));

const resp = await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(1500);

const rootHtml = await page.$eval('#root', (el) => el.innerHTML).catch(() => '');
const text = await page.evaluate(() => document.body.innerText.slice(0, 400));
const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

console.log('url        :', URL);
console.log('status     :', resp?.status());
console.log('root bytes :', rootHtml.length);
console.log('body bg    :', bg);
console.log('text head  :', JSON.stringify(text.slice(0, 200)));
console.log('console err:', errors.length ? errors : 'none');
console.log('failed req :', failed.length ? failed : 'none');

await page.screenshot({ path: 'live-desktop.png', fullPage: false });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(URL, { waitUntil: 'networkidle', timeout: 45000 });
await mobile.waitForTimeout(1200);
await mobile.screenshot({ path: 'live-mobile.png', fullPage: false });

const ok = rootHtml.length > 500 && errors.length === 0;
console.log(ok ? '\nRESULT: PASS' : '\nRESULT: FAIL');
await browser.close();
process.exit(ok ? 0 : 1);
