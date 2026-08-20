import { TrackPageShell } from './TrackPageShell';
import styles from './TrackingSkeleton.module.css';

export function TrackingSkeleton() {
  return (
    <TrackPageShell>
      <div className={styles.stack} aria-busy="true" aria-label="Caricamento in corso">
        <div className={`${styles.block} ${styles.headerBlock}`} />
        <div className={`${styles.block} ${styles.stepperBlock}`} />
        <div className={styles.stack} style={{ gap: 12 }}>
          <div className={`${styles.block} ${styles.sectionTitle}`} />
          <div className={styles.photoRow}>
            <div className={`${styles.block} ${styles.photoBlock}`} />
            <div className={`${styles.block} ${styles.photoBlock}`} />
            <div className={`${styles.block} ${styles.photoBlock}`} />
            <div className={`${styles.block} ${styles.photoBlock}`} />
          </div>
        </div>
        <div className={`${styles.block} ${styles.estimateBlock}`} />
      </div>
    </TrackPageShell>
  );
}
