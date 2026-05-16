'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // In development: unregister any existing service workers and clear caches
    // to prevent stale /_next/static/ chunks from being served
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      }
      return;
    }

    // Production: register the service worker
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'activated' &&
                navigator.serviceWorker.controller
              ) {
                console.log('Service worker updated');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });
  }, []);

  return null;
}
