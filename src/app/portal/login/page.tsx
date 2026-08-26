'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClientFleetAuth } from '@/lib/auth/ClientFleetAuthContext';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TrackPageShell } from '@/components/track/TrackPageShell';
import { TrackingSkeleton } from '@/components/track/TrackingSkeleton';
import styles from './page.module.css';

function errorMessageFor(status: number): string {
  if (status === 401) return 'Email o password non corretti.';
  if (status === 429) return 'Troppi tentativi. Riprova tra qualche minuto.';
  if (status === 0) return 'Impossibile contattare il server. Controlla la connessione.';
  return 'Si è verificato un errore. Riprova.';
}

export default function PortalLoginPage() {
  const { status, client, login } = useClientFleetAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && client) {
      router.replace('/portal/dashboard');
    }
  }, [status, client, router]);

  if (status === 'loading' || status === 'authenticated') {
    return <TrackingSkeleton />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(errorMessageFor(result.status));
    }
  }

  return (
    <TrackPageShell>
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Logo />
            <span className={styles.subtitle}>Accedi per seguire tutti i tuoi veicoli in un unico posto.</span>
          </div>

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
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" fullWidth loading={submitting}>
              Accedi
            </Button>
          </form>

          <Link href="/portal/forgot-password" className={styles.forgotLink}>
            Hai dimenticato la password?
          </Link>
        </div>
      </div>
    </TrackPageShell>
  );
}
