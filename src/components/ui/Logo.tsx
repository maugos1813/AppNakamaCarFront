import Image from 'next/image';
import styles from './Logo.module.css';

export function Logo() {
  return (
    <>
      <Image src="/logo-light.png" alt="NakamaCar" width={420} height={235} className={`${styles.logo} ${styles.light}`} priority />
      <Image src="/logo-dark.png" alt="NakamaCar" width={420} height={235} className={`${styles.logo} ${styles.dark}`} priority />
    </>
  );
}
