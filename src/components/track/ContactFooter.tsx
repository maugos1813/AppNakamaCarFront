import { env } from '@/lib/env';
import styles from './ContactFooter.module.css';

export function ContactFooter() {
  return (
    <footer className={styles.footer}>
      <span>{env.companyName}</span>
      <span>
        <a href={`tel:${env.companyPhone.replace(/\s+/g, '')}`}>{env.companyPhone}</a>
        {' · '}
        <a href={`mailto:${env.companyEmail}`}>{env.companyEmail}</a>
      </span>
      <span>{env.companyAddress}</span>
    </footer>
  );
}
