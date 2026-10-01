import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

const el = document.getElementById('root');
if (!el) throw new Error('Root element #root is missing from index.html');

/**
 * Vite's `base` is relative ('./') for local dev, so the app is served from the
 * domain root and needs no basename. When NIVA_BASE is set (GitHub Pages under
 * /<repo>/) it is absolute, and BrowserRouter has to be told about the prefix or
 * every route fails to match and the app renders the not-found page.
 */
const raw = import.meta.env.BASE_URL || '/';
const basename = raw.startsWith('/') ? raw.replace(/\/+$/, '') : '';

createRoot(el).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
