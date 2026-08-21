'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { updateStage } from '@/lib/api/jobs';
import { enqueueStageUpdate } from '@/lib/offline/queue';
import { actionsFor, isStageGated } from '@/lib/jobBoard';
import { stageLabels, stageStatusLabels } from '@/lib/staffLabels';
import type { BadgeTone } from '@/components/ui/StatusBadge';
import type { JobEntry, RepairStageDetail, RepairStageStatus } from '@/lib/types';
import styles from './StageRow.module.css';

const toneByStatus: Record<RepairStageStatus, BadgeTone> = {
  PENDING: 'neutral',
  IN_PROGRESS: 'warning',
  DONE: 'success',
  SKIPPED: 'neutral',
};

export function StageRow({
  entry,
  stage,
  token,
  onMutated,
}: {
  entry: JobEntry;
  stage: RepairStageDetail;
  token: string;
  onMutated: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);

  const actions = actionsFor(stage.status);
  const gatedNow = isStageGated(entry, stage);

  async function queueOffline(targetStatus: RepairStageStatus) {
    await enqueueStageUpdate({
      stageId: stage.id,
      targetStatus,
      label: `${stageLabels[stage.stage]} — ${entry.vehicle.licensePlate}`,
    });
    setQueued(true);
  }

  async function handleAction(targetStatus: RepairStageStatus) {
    setLoading(targetStatus);
    setError(null);
    setQueued(false);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await queueOffline(targetStatus);
      setLoading(null);
      return;
    }

    const result = await updateStage(token, stage.id, targetStatus);
    setLoading(null);
    if (result.ok) {
      onMutated();
    } else if (result.status === 0) {
      await queueOffline(targetStatus);
    } else {
      setError(result.message);
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <span className={styles.name}>{stageLabels[stage.stage]}</span>
        {stage.assignedMechanic && <span className={styles.mechanic}>{stage.assignedMechanic.fullName}</span>}
        {error && <span className={styles.error}>{error}</span>}
        {queued && <span className={styles.queuedHint}>Sin conexión — se sincronizará automáticamente.</span>}
      </div>
      <div className={styles.right}>
        <StatusBadge tone={toneByStatus[stage.status]} label={stageStatusLabels[stage.status]} />
        {actions.map((action) => {
          const disabledByGate = action.targetStatus === 'IN_PROGRESS' && gatedNow;
          if (disabledByGate && action.variant === 'primary') {
            return (
              <span className={styles.gatedHint} key={action.targetStatus}>
                Presupuesto no aprobado
              </span>
            );
          }
          return (
            <Button
              key={action.targetStatus}
              variant={action.variant}
              className={styles.smallButton}
              onClick={() => handleAction(action.targetStatus)}
              loading={loading === action.targetStatus}
              disabled={loading !== null}
            >
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
