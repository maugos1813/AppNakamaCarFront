'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clientForgotPassword } from '@/lib/api/client-fleet-auth';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TrackPageShell } from '@/components/track/TrackPageShell';
import styles from './page.module.css';

export default function PortalForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await clientForgotPassword(email);
    setSubmitting(false);

    if (!result.ok && result.status === 429) {
      setError('Troppi tentativi. Riprova tra qualche minuto.');
      return;
    }

    // Same response whether or not the email has a premium account.
    setSent(true);
  }

  return (
    <TrackPageShell>
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Logo />
            <span className={styles.subtitle}>Inserisci la tua email e ti invieremo un link per reimpostare la password.</span>
          </div>

          {sent ? (
            <div className={styles.successBanner} role="status">
              Se l&rsquo;email corrisponde a un account premium, riceverai un link per reimpostare la password a breve.
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
                Invia link
              </Button>
            </form>
          )}

          <Link href="/portal/login" className={styles.backLink}>
            Torna al login
          </Link>
        </div>
      </div>
    </TrackPageShell>
  );
}
