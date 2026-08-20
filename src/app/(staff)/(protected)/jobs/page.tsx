'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { listActiveEntries } from '@/lib/api/jobs';
import { currentStageFor } from '@/lib/jobBoard';
import { stageOrder } from '@/lib/labels';
import { stageLabels } from '@/lib/staffLabels';
import { Switch } from '@/components/ui/Switch';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { JobCard } from '@/components/jobs/JobCard';
import type { JobEntry, RepairStageDetail, RepairStageName } from '@/lib/types';
import styles from './page.module.css';

export default function JobsPage() {
  const { token, user } = useAuth();
  const [entries, setEntries] = useState<JobEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightMine, setHighlightMine] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    const result = await listActiveEntries(token);
    if (result.ok) {
      setEntries(result.data.items);
      setError(null);
    } else {
      setError(result.message);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = new Map<RepairStageName, { entry: JobEntry; stage: RepairStageDetail }[]>(
    stageOrder.map((name) => [name, []]),
  );

  if (entries) {
    for (const entry of entries) {
      const stage = currentStageFor(entry);
      if (stage) columns.get(stage.stage)?.push({ entry, stage });
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.title}>Tablero de trabajos</div>
        <Switch checked={highlightMine} onChange={setHighlightMine} label="Resaltar mis fases" />
      </div>

      {error && (
        <Card>
          <span style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</span>
        </Card>
      )}

      {!error && entries === null && (
        <div className={styles.board}>
          {stageOrder.map((name) => (
            <div className={styles.column} key={name}>
              <Skeleton height={80} radius={12} />
              <Skeleton height={80} radius={12} />
            </div>
          ))}
        </div>
      )}

      {!error && entries !== null && entries.length === 0 && (
        <Card>
          <EmptyState title="No hay trabajos activos" description="Por ahora no hay ingresos en reparación." />
        </Card>
      )}

      {!error && entries !== null && entries.length > 0 && (
        <div className={styles.board}>
          {stageOrder.map((name) => {
            const items = columns.get(name) ?? [];
            return (
              <div className={styles.column} key={name}>
                <div className={styles.columnHeader}>
                  <span className={styles.columnTitle}>{stageLabels[name]}</span>
                  <span className={styles.columnTitle}>{items.length}</span>
                </div>
                {items.length === 0 && <span className={styles.columnEmpty}>Sin autos aquí</span>}
                {items.map(({ entry, stage }) => (
                  <JobCard
                    key={entry.id}
                    entry={entry}
                    stage={stage}
                    token={token!}
                    currentUserId={user!.id}
                    highlightMine={highlightMine}
                    onMutated={load}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
