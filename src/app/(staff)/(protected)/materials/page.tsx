'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { InventoryTab } from '@/components/materials/InventoryTab';
import { MaterialRequestsTab } from '@/components/materials/MaterialRequestsTab';
import styles from './page.module.css';

export default function MaterialsPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role.name === 'ADMIN';
  const [tab, setTab] = useState<'inventory' | 'requests'>('inventory');

  if (!token || !user) return null;

  return (
    <div>
      <PageHeader title="Materiales" />

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'inventory' ? styles.tabActive : ''}`}
          onClick={() => setTab('inventory')}
        >
          Inventario
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'requests' ? styles.tabActive : ''}`}
          onClick={() => setTab('requests')}
        >
          Solicitar Materiales
        </button>
      </div>

      <Card>
        {tab === 'inventory' ? (
          <InventoryTab token={token} isAdmin={isAdmin} />
        ) : (
          <MaterialRequestsTab token={token} userId={user.id} isAdmin={isAdmin} />
        )}
      </Card>
    </div>
  );
}
