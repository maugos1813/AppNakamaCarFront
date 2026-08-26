'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useClientFleetAuth } from '@/lib/auth/ClientFleetAuthContext';
import { listFleetVehicles } from '@/lib/api/client-fleet';
import { entryStatusLabels, entryStatusTones, estimateStatusLabels } from '@/lib/labels';
import { formatDate } from '@/lib/format';
import { portalVehiclePath } from '@/lib/routes';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { FleetVehicleEntry } from '@/lib/types';
import styles from './page.module.css';

export default function PortalDashboardPage() {
  const { token } = useClientFleetAuth();
  const [vehicles, setVehicles] = useState<FleetVehicleEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listFleetVehicles(token, { pageSize: 100 }).then((result) => {
      if (result.ok) {
        setVehicles(result.data.items);
      } else {
        setError(result.message);
      }
    });
  }, [token]);

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>I miei veicoli</h1>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {vehicles === null && !error && (
        <div className={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={84} radius={12} />
          ))}
        </div>
      )}

      {vehicles !== null && vehicles.length === 0 && (
        <EmptyState title="Nessun veicolo" description="Non ci sono ancora veicoli associati al tuo account." />
      )}

      {vehicles !== null && vehicles.length > 0 && (
        <div className={styles.list}>
          {vehicles.map((entry) => (
            <Link href={portalVehiclePath(entry.id)} key={entry.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.plate}>{entry.vehicle.licensePlate}</span>
                <span className={styles.vehicleName}>
                  {entry.vehicle.make} {entry.vehicle.model}
                </span>
              </div>
              <div className={styles.cardBottom}>
                <StatusBadge tone={entryStatusTones[entry.status]} label={entryStatusLabels[entry.status]} />
                <StatusBadge tone="neutral" label={estimateStatusLabels[entry.estimateStatus]} />
                <span className={styles.date}>Ingresso: {formatDate(entry.entryDate, 'it-IT')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
