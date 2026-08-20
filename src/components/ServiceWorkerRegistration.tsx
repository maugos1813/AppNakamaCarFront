'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Installability is a progressive enhancement — a failed registration shouldn't break the page.
      });
    }
  }, []);

  return null;
}
