import styles from './Logo.module.css';

export function Logo() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-light.svg" alt="NakamaCar" className={`${styles.logo} ${styles.light}`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-dark.svg" alt="NakamaCar" className={`${styles.logo} ${styles.dark}`} />
    </>
  );
}
