'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { navItemsForRole } from '@/lib/auth/roles';
import { PageHeader } from '@/components/layout/PageHeader';
import { HomeCardIcon } from '@/components/layout/HomeCardIcon';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './page.module.css';

export default function HomePage() {
  const { user } = useAuth();

  if (!user) {
    return <Skeleton height={80} radius={12} />;
  }

  const items = navItemsForRole(user.role.name);

  return (
    <div>
      <PageHeader title={`Hola, ${user.fullName.split(' ')[0]}`} />
      <div className={styles.grid}>
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={styles.card}>
            <span className={styles.icon}>
              <HomeCardIcon href={item.href} />
            </span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
