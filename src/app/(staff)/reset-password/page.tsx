'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/api/auth';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

function errorMessageFor(status: number): string {
  if (status === 429) return 'Demasiados intentos. Intenta de nuevo en unos minutos.';
  if (status === 0) return 'No se pudo contactar al servidor. Revisa tu conexión.';
  if (status === 400) return 'Este enlace no es válido o expiró. Solicita uno nuevo.';
  return 'Ocurrió un error. Inténtalo de nuevo.';
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

function ResetPasswordPageContent() {
  const token = useSearchParams().get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Logo />
            <span className={styles.subtitle}>Este enlace no es válido. Solicita uno nuevo.</span>
          </div>
          <Link href="/forgot-password" className={styles.backLink}>
            Solicitar un nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    const result = await resetPassword(token, newPassword);
    setSubmitting(false);

    if (result.ok) {
      setDone(true);
    } else {
      setError(errorMessageFor(result.status));
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Logo />
          <span className={styles.subtitle}>Elige una nueva contraseña para tu cuenta.</span>
        </div>

        {done ? (
          <div className={styles.successBanner} role="status">
            Tu contraseña fue actualizada. Ya podés iniciar sesión con la nueva contraseña.
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.errorBanner} role="alert">
                {error}
              </div>
            )}
            <Input
              label="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint="Mínimo 8 caracteres, con una mayúscula y un número."
              required
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" fullWidth loading={submitting}>
              Restablecer contraseña
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
