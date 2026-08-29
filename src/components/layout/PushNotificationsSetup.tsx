'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { registerDeviceToken } from '@/lib/api/deviceTokens';
import { entryDetailPath } from '@/lib/routes';

// Renders nothing — just wires up FCM registration on the native Android
// app. A no-op on the web build (Capacitor.isNativePlatform() is false
// there), so this is safe to always mount.
export function PushNotificationsSetup({ token }: { token: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;

    const registrationListener = PushNotifications.addListener('registration', (result) => {
      registerDeviceToken(token, result.value, 'android');
    });

    const actionListener = PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const entryId = action.notification.data?.entryId as string | undefined;
      if (entryId) router.push(entryDetailPath(entryId));
    });

    (async () => {
      // On Android 12 and below this is granted without prompting; on 13+
      // it triggers the real permission dialog.
      const status = await PushNotifications.checkPermissions();
      let receive = status.receive;
      if (receive === 'prompt') {
        receive = (await PushNotifications.requestPermissions()).receive;
      }
      if (receive !== 'granted' || cancelled) return;
      await PushNotifications.register();
    })();

    return () => {
      cancelled = true;
      registrationListener.then((listener) => listener.remove());
      actionListener.then((listener) => listener.remove());
    };
  }, [token, router]);

  return null;
}
