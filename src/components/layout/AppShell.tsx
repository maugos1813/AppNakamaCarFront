'use client';

import { useEffect, useState } from 'react';
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
  offlineIndicator?: React.ReactNode;
  notificationBell?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ navItems, userName, onLogout, offlineIndicator, notificationBell, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Closing on route change would need next/navigation's usePathname, but
  // every nav link already closes the drawer itself on click — this only
  // catches the back/forward-button case.
  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('popstate', () => setMenuOpen(false));
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <Link href="/home" aria-label="Ir al inicio">
              <Logo />
            </Link>
          </div>
          <div className={styles.headerRight}>
            {/* Mounted once here (not duplicated per breakpoint) so it isn't
                polling the API twice — userRow/userNameMobile below still
                toggle by breakpoint, this doesn't need to. */}
            {notificationBell}
            <div className={styles.userRow}>
              <ThemeToggle activateLightLabel="Activar tema claro" activateDarkLabel="Activar tema oscuro" />
              <Link href="/profile" className={styles.userName}>
                {userName}
              </Link>
              <button type="button" className={styles.logoutButton} onClick={onLogout}>
                Salir
              </button>
            </div>
            <Link href="/profile" className={styles.userNameMobile}>
              {userName}
            </Link>
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

      {menuOpen && (
        <div className={styles.drawerBackdrop} onClick={() => setMenuOpen(false)}>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <nav className={styles.drawer} aria-label="Navegación principal" onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <Link href="/home" aria-label="Ir al inicio" onClick={() => setMenuOpen(false)}>
                <Logo />
              </Link>
              <button
                type="button"
                className={styles.drawerClose}
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.drawerLink} ${item.active ? styles.drawerLinkActive : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className={styles.drawerFooter}>
              <ThemeToggle activateLightLabel="Activar tema claro" activateDarkLabel="Activar tema oscuro" showLabel />
              <button type="button" className={styles.drawerFooterItem} onClick={onLogout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9"
                  />
                </svg>
                <span>Salir</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {offlineIndicator}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
