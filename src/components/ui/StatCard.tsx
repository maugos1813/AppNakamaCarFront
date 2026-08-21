import styles from './StatCard.module.css';

export function StatCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: React.ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${styles[tone]} tabular-nums`}>{value}</span>
    </div>
  );
}
