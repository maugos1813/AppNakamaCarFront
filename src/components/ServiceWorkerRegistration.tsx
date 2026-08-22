'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Inside the bundled native app there's no offline-caching problem to
    // solve — everything already ships in the APK — and a SW here fights
    // with Capacitor's own local asset loading (WebViewAssetLoader), which
    // can blank the page.
    if (Capacitor.isNativePlatform()) return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Installability is a progressive enhancement — a failed registration shouldn't break the page.
      });
    }
  }, []);

  return null;
}
