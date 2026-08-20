import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import styles from './AppShell.module.css';

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

interface AppShellProps {
  navItems: NavItem[];
  userName: string;
  onLogout?: () => void;
  children: React.ReactNode;
}

export function AppShell({ navItems, userName, onLogout, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Logo />
          <div className={styles.userRow}>
            <ThemeToggle activateLightLabel="Activar tema claro" activateDarkLabel="Activar tema oscuro" />
            <span className={styles.userName}>{userName}</span>
            <button type="button" className={styles.logoutButton} onClick={onLogout}>
              Salir
            </button>
          </div>
        </div>
        <nav className={styles.nav} aria-label="Navegación principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${item.active ? styles.navLinkActive : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
