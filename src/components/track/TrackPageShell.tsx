import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import styles from './TrackPageShell.module.css';

export function TrackPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page} lang="it">
      <div className={styles.container}>
        <div className={styles.topBar}>
          <Logo />
          <ThemeToggle />
        </div>
        <div className={styles.italyStripe} aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
