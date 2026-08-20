import styles from './PageHeader.module.css';

export function PageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className={styles.header}>
      <span className={styles.title}>{title}</span>
      {action}
    </div>
  );
}
