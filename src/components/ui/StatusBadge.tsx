import styles from './StatusBadge.module.css';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'brand';

export function StatusBadge({ tone, label }: { tone: BadgeTone; label: string }) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  );
}
