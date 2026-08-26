'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { clientSetPassword } from '@/lib/api/client-fleet-auth';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TrackPageShell } from '@/components/track/TrackPageShell';
import styles from './page.module.css';

function errorMessageFor(status: number): string {
  if (status === 429) return 'Troppi tentativi. Riprova tra qualche minuto.';
  if (status === 0) return 'Impossibile contattare il server. Controlla la connessione.';
  if (status === 400) return 'Questo link non è valido o è scaduto. Richiedine uno nuovo.';
  return 'Si è verificato un errore. Riprova.';
}

export default function PortalSetPasswordPage() {
  return (
    <TrackPageShell>
      <Suspense fallback={null}>
        <PortalSetPasswordPageContent />
      </Suspense>
    </TrackPageShell>
  );
}

function PortalSetPasswordPageContent() {
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
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
            <span className={styles.subtitle}>Questo link non è valido. Richiedine uno nuovo.</span>
          </div>
          <Link href="/portal/forgot-password" className={styles.backLink}>
            Richiedi un nuovo link
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Le password non coincidono.');
      return;
    }

    setSubmitting(true);
    const result = await clientSetPassword(token, password);
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
          <span className={styles.subtitle}>Scegli una password per il tuo account.</span>
        </div>

        {done ? (
          <div className={styles.successBanner} role="status">
            Password impostata con successo. Ora puoi accedere.
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.errorBanner} role="alert">
                {error}
              </div>
            )}
            <Input
              label="Nuova password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint="Minimo 8 caratteri, con una maiuscola e un numero."
              required
            />
            <Input
              label="Conferma password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" fullWidth loading={submitting}>
              Imposta password
            </Button>
          </form>
        )}

        <Link href="/portal/login" className={styles.backLink}>
          Torna al login
        </Link>
      </div>
    </div>
  );
}
