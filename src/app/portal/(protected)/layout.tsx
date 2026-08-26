'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClientFleetAuth } from '@/lib/auth/ClientFleetAuthContext';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { FullPageLoading } from '@/components/ui/FullPageLoading';
import styles from './layout.module.css';

export default function PortalProtectedLayout({ children }: { children: React.ReactNode }) {
  const { status, client, logout } = useClientFleetAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/portal/login');
    }
  }, [status, router]);

  if (status !== 'authenticated' || !client) {
    return <FullPageLoading />;
  }

  return (
    <div className={styles.shell} lang="it">
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/portal/dashboard" className={styles.logoLink}>
            <Logo />
          </Link>
          <div className={styles.userRow}>
            <ThemeToggle activateLightLabel="Attiva tema chiaro" activateDarkLabel="Attiva tema scuro" />
            <span className={styles.clientName}>{client.fullName}</span>
            <button type="button" className={styles.logoutButton} onClick={logout}>
              Esci
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
