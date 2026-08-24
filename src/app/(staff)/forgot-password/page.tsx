'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api/auth';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await forgotPassword(email);
    setSubmitting(false);

    if (!result.ok && result.status === 429) {
      setError('Demasiados intentos. Intenta de nuevo en unos minutos.');
      return;
    }

    // Same response whether or not the email is registered — the backend
    // never reveals which emails have staff accounts.
    setSent(true);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Logo />
          <span className={styles.subtitle}>
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </span>
        </div>

        {sent ? (
          <div className={styles.successBanner} role="status">
            Si ese email está registrado, vas a recibir un enlace para restablecer tu contraseña en los próximos
            minutos.
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.errorBanner} role="alert">
                {error}
              </div>
            )}
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" fullWidth loading={submitting}>
              Enviar enlace
            </Button>
          </form>
        )}

        <Link href="/login" className={styles.backLink}>
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
