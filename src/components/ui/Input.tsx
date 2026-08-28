'use client';

import { useId, useState, type InputHTMLAttributes } from 'react';
import styles from './fields.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      {off && <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M3 3l18 18" />}
    </svg>
  );
}

export function Input({ label, error, hint, id, required, className, type, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {required && ' *'}
      </label>
      <div className={isPassword ? styles.controlWrap : undefined}>
        <input
          id={inputId}
          type={isPassword && visible ? 'text' : type}
          className={[
            styles.control,
            isPassword ? styles.controlWithToggle : '',
            error ? styles.error : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          required={required}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            <EyeIcon off={visible} />
          </button>
        )}
      </div>
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && (
        <span className={styles.errorText} id={`${inputId}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
