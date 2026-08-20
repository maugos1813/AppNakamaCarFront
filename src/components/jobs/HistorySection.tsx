'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { getHistory } from '@/lib/api/jobs';
import { historyEventLabels } from '@/lib/staffLabels';
import { formatDateTime } from '@/lib/format';
import type { HistoryEvent } from '@/lib/types';
import styles from './HistorySection.module.css';

export function HistorySection({ token, entryId }: { token: string; entryId: string }) {
  const [events, setEvents] = useState<HistoryEvent[] | null>(null);

  useEffect(() => {
    getHistory(token, entryId).then((result) => {
      if (result.ok) setEvents(result.data);
    });
  }, [token, entryId]);

  return (
    <div className={styles.section}>
      <span className={styles.title}>Historial</span>

      {events === null && <Skeleton height={60} radius={12} />}

      {events !== null && events.length === 0 && (
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No hay eventos registrados.</span>
      )}

      {events !== null &&
        events.map((event) => (
          <div className={styles.item} key={event.id}>
            <div className={styles.itemTop}>
              <span className={styles.eventType}>{historyEventLabels[event.eventType]}</span>
              <span className={styles.date}>{formatDateTime(event.createdAt, 'es-ES')}</span>
            </div>
            <span className={styles.description}>{event.description}</span>
            {event.performedBy && <span className={styles.performer}>{event.performedBy.fullName}</span>}
          </div>
        ))}
    </div>
  );
}
