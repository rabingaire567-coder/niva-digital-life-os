import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// `base` is relative for local dev so the bundle works from any local path, and
// absolute when NIVA_BASE is set for hosting under a sub-path (GitHub Pages).
// src/main.tsx feeds the same value to BrowserRouter as its basename, otherwise
// the sub-path prefix would never match the "/" route and the app would render
// the not-found page.
const base = process.env.NIVA_BASE || './';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    cssTarget: 'chrome111',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 5174,
    proxy: {
      // Optional backend (`npm run server`) proxies the AI provider so no key is
      // ever needed in the browser. The app is fully functional without it.
      '/api': { target: 'http://localhost:8788', changeOrigin: true },
    },
  },
  preview: { port: 4174 },
});
