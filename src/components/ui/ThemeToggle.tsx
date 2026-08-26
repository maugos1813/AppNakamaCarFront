'use client';

import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';

type Theme = 'light' | 'dark';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface ThemeToggleProps {
  activateLightLabel?: string;
  activateDarkLabel?: string;
  // Renders the label as visible text next to the icon, for contexts like a
  // menu row where an icon-only button reads as unlabeled. Icon-only
  // (default) keeps the aria-label instead, for the compact header spot.
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({
  activateLightLabel = 'Attiva tema chiaro',
  activateDarkLabel = 'Attiva tema scuro',
  showLabel = false,
  className,
}: ThemeToggleProps = {}) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('nakamacar-theme') as Theme | null;
    setTheme(stored ?? getSystemTheme());
  }, []);

  function toggle() {
    const next: Theme = (theme ?? getSystemTheme()) === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('nakamacar-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  const label = theme === 'dark' ? activateLightLabel : activateDarkLabel;

  return (
    <button
      type="button"
      onClick={toggle}
      className={[styles.toggle, showLabel ? styles.toggleWithLabel : '', className].filter(Boolean).join(' ')}
      aria-label={showLabel ? undefined : label}
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
          />
        </svg>
      )}
      {showLabel && <span>{label}</span>}
    </button>
  );
}
