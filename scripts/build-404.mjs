/**
 * GitHub Pages needs a physical 404.html that boots the SPA, otherwise a hard
 * refresh on /item/<id> returns GitHub's 404 page instead of the app.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const index = join(dist, 'index.html');

if (!existsSync(index)) {
  console.error('[404] dist/index.html not found — run vite build first');
  process.exit(1);
}

const html = readFileSync(index, 'utf8');
writeFileSync(join(dist, '404.html'), html, 'utf8');
copyFileSync(join(dist, 'index.html'), join(dist, '200.html'));
writeFileSync(join(dist, '.nojekyll'), '', 'utf8');

console.log('[404] wrote dist/404.html, dist/200.html and dist/.nojekyll');
