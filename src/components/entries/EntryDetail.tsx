'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getEntry } from '@/lib/api/jobs';
import { entryStatusLabels, entryStatusTones, estimateStatusLabels } from '@/lib/staffLabels';
import { clientDisplayName, formatDate } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { StageRow } from '@/components/jobs/StageRow';
import { DamagesSection } from '@/components/jobs/DamagesSection';
import { LaborSection } from '@/components/jobs/LaborSection';
import { PartsSection } from '@/components/jobs/PartsSection';
import { PhotosSection } from '@/components/jobs/PhotosSection';
import { HistorySection } from '@/components/jobs/HistorySection';
import { EstimateSummary } from './EstimateSummary';
import { OtherCostsSection } from './OtherCostsSection';
import { NotificationsSection } from './NotificationsSection';
import { EntryStatusControl } from './EntryStatusControl';
import { DeleteEntryAction } from './DeleteEntryAction';
import { InvoiceAction } from './InvoiceAction';
import type { JobEntry } from '@/lib/types';
import styles from './EntryDetail.module.css';

export function EntryDetail({ entryId }: { entryId: string }) {
  const { token, user } = useAuth();
  const [entry, setEntry] = useState<JobEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Bumped on every reload so History/Notifications — which log events
  // triggered by other sections (approval requests, status changes, stage
  // moves) — remount and refetch instead of showing stale data.
  const [refreshKey, setRefreshKey] = useState(0);
  const isAdmin = user?.role.name === 'ADMIN';

  const load = useCallback(async () => {
    if (!token) return;
    const result = await getEntry(token, entryId);
    if (result.ok) {
      setEntry(result.data);
      setError(null);
      setRefreshKey((k) => k + 1);
    } else {
      setError(result.message);
    }
  }, [token, entryId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <Card>
        <span style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</span>
      </Card>
    );
  }

  if (!entry || !token) {
    return <Skeleton height={80} radius={12} />;
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.plateRow}>
          <span className={styles.plate}>{entry.vehicle.licensePlate}</span>
          <span className={styles.vehicle}>
            {entry.vehicle.make} {entry.vehicle.model}
          </span>
        </div>
        <span className={styles.client}>{clientDisplayName(entry.vehicle.client)}</span>
        <div className={styles.badges}>
          <StatusBadge tone={entryStatusTones[entry.status]} label={entryStatusLabels[entry.status]} />
          <StatusBadge tone="neutral" label={estimateStatusLabels[entry.estimateStatus]} />
        </div>
        <div className={styles.metaRow}>
          <span>Ingreso: {formatDate(entry.entryDate, 'es-ES')}</span>
          <span>Km: {entry.odometerReading.toLocaleString('es-ES')}</span>
          {entry.estimatedCompletionDate && <span>Entrega estimada: {formatDate(entry.estimatedCompletionDate, 'es-ES')}</span>}
        </div>
        {isAdmin && (
          <EntryStatusControl token={token} entryId={entry.id} currentStatus={entry.status} onMutated={load} />
        )}
        {isAdmin && <DeleteEntryAction token={token} entry={entry} />}
      </div>

      <div className={styles.sections}>
        <Card>
          <div className={styles.sectionTitle}>Fases de reparación</div>
          {[...entry.stages]
            .sort((a, b) => a.order - b.order)
            .map((stage) => (
              <StageRow key={stage.id} entry={entry} stage={stage} token={token} onMutated={load} />
            ))}
        </Card>

        {isAdmin && (
          <Card>
            <EstimateSummary
              key={refreshKey}
              token={token}
              entryId={entry.id}
              estimateStatus={entry.estimateStatus}
              onApprovalRequested={load}
            />
          </Card>
        )}

        {isAdmin && entry.estimateStatus === 'APPROVED' && (
          <Card>
            <InvoiceAction token={token} entryId={entry.id} estimateStatus={entry.estimateStatus} invoice={entry.invoice} />
          </Card>
        )}

        <Card>
          <DamagesSection token={token} entryId={entry.id} />
        </Card>

        <Card>
          <LaborSection token={token} entryId={entry.id} onMutated={isAdmin ? load : undefined} />
        </Card>

        <Card>
          <PartsSection token={token} entryId={entry.id} onMutated={isAdmin ? load : undefined} />
        </Card>

        {isAdmin && (
          <Card>
            <OtherCostsSection token={token} entryId={entry.id} onMutated={load} />
          </Card>
        )}

        <Card>
          <PhotosSection token={token} entryId={entry.id} />
        </Card>

        {isAdmin && (
          <Card>
            <NotificationsSection key={refreshKey} token={token} entryId={entry.id} />
          </Card>
        )}

        <Card>
          <HistorySection key={refreshKey} token={token} entryId={entry.id} />
        </Card>
      </div>
    </>
  );
}
