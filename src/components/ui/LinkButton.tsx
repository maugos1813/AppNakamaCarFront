import Link from 'next/link';
import buttonStyles from './Button.module.css';

interface LinkButtonProps {
  href: string;
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export function LinkButton({ href, variant = 'primary', children }: LinkButtonProps) {
  return (
    <Link href={href} className={`${buttonStyles.button} ${buttonStyles[variant]}`}>
      {children}
    </Link>
  );
}
