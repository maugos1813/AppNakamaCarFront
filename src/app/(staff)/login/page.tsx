'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { homeForRole } from '@/lib/auth/roles';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FullPageLoading } from '@/components/ui/FullPageLoading';
import styles from './page.module.css';

function errorMessageFor(status: number): string {
  if (status === 401) return 'Email o contraseña incorrectos.';
  if (status === 429) return 'Demasiados intentos. Intenta de nuevo en unos minutos.';
  if (status === 0) return 'No se pudo contactar al servidor. Revisa tu conexión.';
  return 'Ocurrió un error. Inténtalo de nuevo.';
}

export default function LoginPage() {
  const { status, user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && user) {
      router.replace(homeForRole(user.role.name));
    }
  }, [status, user, router]);

  if (status === 'loading' || status === 'authenticated') {
    return <FullPageLoading />;
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
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Logo />
          <span className={styles.subtitle}>Inicia sesión con tus credenciales del personal.</span>
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
            Iniciar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
