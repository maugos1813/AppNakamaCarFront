'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { updateStage } from '@/lib/api/jobs';
import { isStageGated, nextStageAfter } from '@/lib/jobBoard';
import { clientDisplayName } from '@/lib/format';
import { estimateStatusLabels } from '@/lib/staffLabels';
import type { JobEntry, RepairStageDetail } from '@/lib/types';
import styles from './JobCard.module.css';

interface JobCardProps {
  entry: JobEntry;
  stage: RepairStageDetail;
  token: string;
  currentUserId: string;
  highlightMine: boolean;
  onMutated: () => void;
}

export function JobCard({ entry, stage, token, currentUserId, highlightMine, onMutated }: JobCardProps) {
  const [loading, setLoading] = useState<'advance' | 'skip' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const gated = stage.status === 'PENDING' && isStageGated(entry, stage);
  const isMine = highlightMine && stage.assignedMechanicId === currentUserId;

  async function handleAdvance() {
    setLoading('advance');
    setError(null);

    if (stage.status === 'PENDING') {
      const result = await updateStage(token, stage.id, 'IN_PROGRESS');
      setLoading(null);
      if (result.ok) {
        onMutated();
      } else {
        setError(result.message);
      }
      return;
    }

    const done = await updateStage(token, stage.id, 'DONE');
    if (!done.ok) {
      setLoading(null);
      setError(done.message);
      return;
    }

    const next = nextStageAfter(entry, stage);
    if (next) {
      await updateStage(token, next.id, 'IN_PROGRESS');
      // A gate rejection here just leaves the next stage PENDING — not an
      // error worth surfacing, since completing the current one already
      // succeeded and the board will reflect the real state on refetch.
    }

    setLoading(null);
    onMutated();
  }

  async function handleSkip() {
    setLoading('skip');
    setError(null);
    const result = await updateStage(token, stage.id, 'SKIPPED');
    setLoading(null);
    if (result.ok) {
      onMutated();
    } else {
      setError(result.message);
    }
  }

  return (
    <div className={`${styles.card} ${isMine ? styles.highlighted : ''}`}>
      <Link href={`/jobs/${entry.id}`} className={styles.top}>
        <span className={styles.plate}>{entry.vehicle.licensePlate}</span>
        <span className={styles.client}>{clientDisplayName(entry.vehicle.client)}</span>
      </Link>

      {(stage.assignedMechanic || (stage.stage !== 'DIAGNOSIS' && entry.estimateStatus !== 'APPROVED')) && (
        <div className={styles.meta}>
          {stage.assignedMechanic && (
            <span className={styles.mechanic}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
              {stage.assignedMechanic.fullName}
            </span>
          )}
          {stage.stage !== 'DIAGNOSIS' && entry.estimateStatus !== 'APPROVED' && (
            <StatusBadge tone="neutral" label={estimateStatusLabels[entry.estimateStatus]} />
          )}
        </div>
      )}

      {gated ? (
        <span className={styles.gatedHint}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
            <path stroke="currentColor" strokeWidth="2" d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          Pendiente de aprobación del presupuesto
        </span>
      ) : (
        <div className={styles.actions}>
          <Button variant="primary" onClick={handleAdvance} loading={loading === 'advance'} disabled={loading !== null}>
            {stage.status === 'PENDING' ? 'Iniciar' : 'Completar'}
          </Button>
          <button type="button" className={styles.skipLink} onClick={handleSkip} disabled={loading !== null}>
            {loading === 'skip' ? '...' : 'Omitir'}
          </button>
        </div>
      )}

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
