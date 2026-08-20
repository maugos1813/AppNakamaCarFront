import { env } from '@/lib/env';
import { TrackPageShell } from './TrackPageShell';
import styles from './TrackingError.module.css';

export function TrackingError({ status }: { status: number }) {
  const isAuthError = status === 401;

  return (
    <TrackPageShell>
      <div className={styles.wrap}>
        <div className={styles.icon} aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M12 9v4M12 16.5v.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            />
          </svg>
        </div>
        <h1 className={styles.title}>
          {isAuthError ? 'Questo link non è più valido' : 'Non è stato possibile caricare i dati'}
        </h1>
        <p className={styles.description}>
          {isAuthError
            ? 'Il link che hai utilizzato è scaduto o non è corretto. Contatta l’officina per riceverne uno nuovo.'
            : 'Si è verificato un problema temporaneo. Riprova tra qualche minuto oppure contatta l’officina.'}
        </p>
        <div className={styles.contact}>
          <a className={styles.contactLink} href={`tel:${env.companyPhone.replace(/\s+/g, '')}`}>
            {env.companyPhone}
          </a>
          <a className={styles.contactLink} href={`mailto:${env.companyEmail}`}>
            {env.companyEmail}
          </a>
        </div>
      </div>
    </TrackPageShell>
  );
}
