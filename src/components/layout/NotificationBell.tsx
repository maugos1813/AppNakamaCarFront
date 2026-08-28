'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listMyNotifications, markNotificationRead } from '@/lib/api/notifications';
import { formatDateTime } from '@/lib/format';
import { entryDetailPath } from '@/lib/routes';
import type { MyNotification } from '@/lib/types';
import styles from './NotificationBell.module.css';

const POLL_INTERVAL_MS = 60_000;

// Admin-only in-app feed (e.g. "new Richiesta") — self-contained so it can
// be dropped into AppShell as a header slot without prop-drilling token/role
// through a component that otherwise has no idea about auth.
export function NotificationBell({ token }: { token: string }) {
  const router = useRouter();
  const [items, setItems] = useState<MyNotification[] | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function load() {
    listMyNotifications(token).then((result) => {
      if (result.ok) setItems(result.data);
    });
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const unreadCount = items?.filter((n) => !n.isRead).length ?? 0;

  async function handleSelect(notification: MyNotification) {
    setOpen(false);
    if (!notification.isRead) {
      const result = await markNotificationRead(token, notification.id);
      if (result.ok) {
        setItems((current) => current?.map((n) => (n.id === notification.id ? result.data : n)) ?? null);
      }
    }
    if (notification.relatedVehicleEntryId) {
      router.push(entryDetailPath(notification.relatedVehicleEntryId));
    }
  }

  return (
    <div className={styles.wrap} ref={containerRef}>
      <button
        type="button"
        className={styles.bellButton}
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `Notificaciones — ${unreadCount} sin leer` : 'Notificaciones'}
        aria-expanded={open}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z"
          />
          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M10 19a2 2 0 0 0 4 0" />
        </svg>
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className={styles.panel} role="menu">
          <div className={styles.panelHeader}>Notificaciones</div>
          {items === null && <div className={styles.empty}>Cargando…</div>}
          {items !== null && items.length === 0 && <div className={styles.empty}>No hay notificaciones.</div>}
          {items !== null &&
            items.map((n) => (
              <button
                type="button"
                key={n.id}
                className={`${styles.item} ${n.isRead ? '' : styles.itemUnread}`}
                onClick={() => handleSelect(n)}
              >
                <span className={styles.itemTitle}>{n.title}</span>
                <span className={styles.itemMessage}>{n.message}</span>
                <span className={styles.itemDate}>{formatDateTime(n.createdAt, 'es-ES')}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
