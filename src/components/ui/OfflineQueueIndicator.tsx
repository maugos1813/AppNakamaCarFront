'use client';

import { useEffect, useState } from 'react';
import { useOnlineStatus } from '@/lib/useOnlineStatus';
import { getPendingActions, removeAction, retryAction, subscribeQueue } from '@/lib/offline/queue';
import { syncQueue } from '@/lib/offline/sync';
import type { QueuedAction } from '@/lib/offline/types';
import styles from './OfflineQueueIndicator.module.css';

export function OfflineQueueIndicator({ token }: { token: string | null }) {
  const online = useOnlineStatus();
  const [actions, setActions] = useState<QueuedAction[]>([]);
  const [expanded, setExpanded] = useState(false);

  async function refresh() {
    setActions(await getPendingActions());
  }

  useEffect(() => {
    refresh();
    return subscribeQueue(refresh);
  }, []);

  useEffect(() => {
    if (online && token) syncQueue(token).then(refresh);
  }, [online, token]);

  const pending = actions.filter((a) => a.syncStatus === 'PENDING');
  const failed = actions.filter((a) => a.syncStatus === 'FAILED');

  if (online && pending.length === 0 && failed.length === 0) return null;

  return (
    <div>
      <button type="button" className={styles.bar} onClick={() => setExpanded((v) => !v)}>
        <span className={`${styles.dot} ${!online ? styles.dotOffline : failed.length > 0 ? styles.dotFailed : styles.dotSyncing}`} aria-hidden="true" />
        <span className={styles.text}>
          {!online && 'Sin conexión'}
          {online && pending.length > 0 && failed.length === 0 && 'Sincronizando cambios pendientes…'}
          {online && pending.length === 0 && failed.length > 0 && 'Hay cambios que no se pudieron sincronizar'}
          {online && pending.length > 0 && failed.length > 0 && 'Sincronizando — algunos cambios fallaron'}
        </span>
        {pending.length > 0 && <span className={styles.badge}>{pending.length}</span>}
        {failed.length > 0 && <span className={`${styles.badge} ${styles.badgeFailed}`}>{failed.length}</span>}
      </button>

      {expanded && (
        <div className={styles.panel}>
          {actions.length === 0 && <span className={styles.empty}>No hay cambios pendientes.</span>}
          {actions.map((action) => (
            <div className={styles.item} key={action.id}>
              <div className={styles.itemMain}>
                <span className={styles.itemLabel}>{action.label}</span>
                {action.syncStatus === 'FAILED' && action.errorMessage && (
                  <span className={styles.itemError}>{action.errorMessage}</span>
                )}
              </div>
              {action.syncStatus === 'FAILED' ? (
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.itemButton}
                    onClick={async () => {
                      await retryAction(action);
                      if (token) syncQueue(token).then(refresh);
                    }}
                  >
                    Reintentar
                  </button>
                  <button type="button" className={styles.itemButton} onClick={() => removeAction(action.id)}>
                    Descartar
                  </button>
                </div>
              ) : (
                <span className={styles.itemPending}>Pendiente</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
