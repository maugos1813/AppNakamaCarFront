'use client';

import { useId, type TextareaHTMLAttributes } from 'react';
import styles from './fields.module.css';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, id, required, className, ...rest }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={textareaId}>
        {label}
        {required && ' *'}
      </label>
      <textarea
        id={textareaId}
        className={[styles.control, styles.textarea, error ? styles.error : '', className].filter(Boolean).join(' ')}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        required={required}
        {...rest}
      />
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && (
        <span className={styles.errorText} id={`${textareaId}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
