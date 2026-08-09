import { createRoot } from 'react-dom/client';

// Import polyfills first
import './lib/polyfills.ts';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// FIXME: a custom font should be used. Eg:
// import '@fontsource-variable/<font-name>';

// Register service worker for PWA.
//
// The worker never caches HTML (see public/sw.js), so a new build is always
// picked up on reload. When a new worker activates we reload once so the page
// and the worker are never a version apart.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none',
      });

      // Ask the browser to check for a new worker immediately.
      registration.update().catch(() => {});

      // A new worker took control — reload once to run the matching bundle.
      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        reloading = true;
        window.location.reload();
      });

      // If an updated worker is waiting, activate it right away.
      registration.addEventListener('updatefound', () => {
        registration.installing?.addEventListener('statechange', function onChange() {
          if (this.state === 'installed' && navigator.serviceWorker.controller) {
            registration.waiting?.postMessage('SKIP_WAITING');
          }
        });
      });
    } catch (err) {
      console.debug('SW registration failed:', err);
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
