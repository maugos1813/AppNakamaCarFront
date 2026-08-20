'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { listNotifications } from '@/lib/api/entries';
import { notificationStatusLabels, notificationStatusTones, notificationTypeLabels } from '@/lib/staffLabels';
import { formatDateTime } from '@/lib/format';
import type { StaffNotification } from '@/lib/types';
import styles from '@/components/jobs/HistorySection.module.css';

export function NotificationsSection({ token, entryId }: { token: string; entryId: string }) {
  const [notifications, setNotifications] = useState<StaffNotification[] | null>(null);

  useEffect(() => {
    listNotifications(token, entryId).then((result) => {
      if (result.ok) setNotifications(result.data);
    });
  }, [token, entryId]);

  return (
    <div className={styles.section}>
      <span className={styles.title}>Notificaciones al cliente</span>

      {notifications === null && <Skeleton height={60} radius={12} />}

      {notifications !== null && notifications.length === 0 && (
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No se enviaron notificaciones todavía.</span>
      )}

      {notifications !== null &&
        notifications.map((notification) => (
          <div className={styles.item} key={notification.id}>
            <div className={styles.itemTop}>
              <span className={styles.eventType}>{notificationTypeLabels[notification.type]}</span>
              <span className={styles.date}>{formatDateTime(notification.createdAt, 'es-ES')}</span>
            </div>
            <span className={styles.description}>{notification.title}</span>
            <div style={{ marginTop: 4 }}>
              <StatusBadge
                tone={notificationStatusTones[notification.status]}
                label={notificationStatusLabels[notification.status]}
              />
            </div>
            {notification.status === 'FAILED' && notification.errorMessage && (
              <span className={styles.description} style={{ color: 'var(--danger)' }}>
                {notification.errorMessage}
              </span>
            )}
          </div>
        ))}
    </div>
  );
}
