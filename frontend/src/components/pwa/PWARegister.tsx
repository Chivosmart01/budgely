'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.location.protocol.startsWith('http')
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Budgely PWA ServiceWorker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Budgely PWA ServiceWorker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
