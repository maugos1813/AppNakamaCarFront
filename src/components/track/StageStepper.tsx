import { stageLabels } from '@/lib/labels';
import type { TrackingStage } from '@/lib/types';
import styles from './StageStepper.module.css';

function DotIcon({ status }: { status: TrackingStage['status'] }) {
  if (status === 'DONE') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
      </svg>
    );
  }
  if (status === 'SKIPPED') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
      </svg>
    );
  }
  return <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />;
}

const labelClass: Record<TrackingStage['status'], string> = {
  DONE: styles.label,
  IN_PROGRESS: `${styles.label} ${styles.labelInProgress}`,
  PENDING: `${styles.label} ${styles.labelPending}`,
  SKIPPED: `${styles.label} ${styles.labelSkipped}`,
};

const dotClass: Record<TrackingStage['status'], string> = {
  DONE: styles.dotDone,
  IN_PROGRESS: styles.dotInProgress,
  PENDING: '',
  SKIPPED: styles.dotSkipped,
};

export function StageStepper({ stages }: { stages: TrackingStage[] }) {
  return (
    <ol className={styles.list}>
      {stages.map((stage, index) => {
        const isLast = index === stages.length - 1;
        const lineFilled = !isLast && stage.status === 'DONE';
        return (
          <li
            key={stage.stage}
            className={styles.item}
            title={stage.status === 'SKIPPED' ? 'Non applicabile a questa riparazione' : undefined}
          >
            <div className={styles.trackCol}>
              <span className={`${styles.dot} ${dotClass[stage.status]}`}>
                <DotIcon status={stage.status} />
              </span>
              {!isLast && <span className={`${styles.line} ${lineFilled ? styles.lineFilled : ''}`} />}
            </div>
            <div className={styles.body}>
              <span className={labelClass[stage.status]}>{stageLabels[stage.stage]}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
