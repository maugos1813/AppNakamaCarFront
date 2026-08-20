'use client';

import styles from './Switch.module.css';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className={styles.label}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`${styles.track} ${checked ? styles.trackOn : ''}`}>
        <span className={`${styles.thumb} ${checked ? styles.thumbOn : ''}`} />
      </span>
      {label}
    </label>
  );
}
