'use client';

import styles from './Switch.module.css';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  return (
    <label className={`${styles.label} ${disabled ? styles.labelDisabled : ''}`}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`${styles.track} ${checked ? styles.trackOn : ''}`}>
        <span className={`${styles.thumb} ${checked ? styles.thumbOn : ''}`} />
      </span>
      {label}
    </label>
  );
}
