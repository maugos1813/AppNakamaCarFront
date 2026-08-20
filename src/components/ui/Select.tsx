'use client';

import { useId, type SelectHTMLAttributes } from 'react';
import styles from './fields.module.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({ label, error, hint, options, placeholder, id, required, className, ...rest }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={selectId}>
        {label}
        {required && ' *'}
      </label>
      <select
        id={selectId}
        className={[styles.control, styles.select, error ? styles.error : '', className].filter(Boolean).join(' ')}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        required={required}
        defaultValue={rest.value === undefined && rest.defaultValue === undefined ? '' : undefined}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && (
        <span className={styles.errorText} id={`${selectId}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
