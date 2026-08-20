'use client';

import { useId, type InputHTMLAttributes } from 'react';
import styles from './fields.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, required, className, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {required && ' *'}
      </label>
      <input
        id={inputId}
        className={[styles.control, error ? styles.error : '', className].filter(Boolean).join(' ')}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        required={required}
        {...rest}
      />
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && (
        <span className={styles.errorText} id={`${inputId}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
