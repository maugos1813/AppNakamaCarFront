'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDashboardActivity, getDashboardSummary } from '@/lib/api/dashboard';
import { entryStatusLabels, historyEventLabels, stageLabels } from '@/lib/staffLabels';
import { clientDisplayName, formatDateTime } from '@/lib/format';
import { clientDetailPath, entryDetailPath } from '@/lib/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { DashboardActivityEvent, DashboardSummary, RepairStageName } from '@/lib/types';
import detailStyles from '@/components/layout/DetailPage.module.css';
import styles from './page.module.css';

const STAGE_ORDER: RepairStageName[] = [
  'DIAGNOSIS',
  'DISASSEMBLY',
  'BODYWORK',
  'PAINTING',
  'ASSEMBLY',
  'QUALITY_CHECK',
  'READY_FOR_DELIVERY',
];

export default function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activity, setActivity] = useState<DashboardActivityEvent[] | null>(null);

  useEffect(() => {
    if (!token) return;
    getDashboardSummary(token).then((result) => {
      if (result.ok) setSummary(result.data);
    });
    getDashboardActivity(token, 20).then((result) => {
      if (result.ok) setActivity(result.data);
    });
  }, [token]);

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div className={detailStyles.sections}>
        {summary === null ? (
          <div className={styles.statGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={72} radius={12} />
            ))}
          </div>
        ) : (
          <div className={styles.statGrid}>
            <Link href="/entries?status=IN_PROGRESS">
              <StatCard label={entryStatusLabels.IN_PROGRESS} value={summary.activeEntries} tone="warning" />
            </Link>
            <Link href="/entries?status=COMPLETED">
              <StatCard label={entryStatusLabels.COMPLETED} value={summary.readyForPickup} tone="success" />
            </Link>
            <Link href="/clients">
              <StatCard label="Clientes" value={summary.totalClients} />
            </Link>
            <Link href="/vehicles">
              <StatCard label="Vehículos" value={summary.totalVehicles} />
            </Link>
          </div>
        )}

        <Card>
          <span className={detailStyles.sectionTitle}>Fases en curso</span>
          <div className={styles.stageGrid} style={{ marginTop: 12 }}>
            {summary === null
              ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} height={20} />)
              : STAGE_ORDER.map((stage) => (
                  <div className={styles.stageRow} key={stage}>
                    <span>{stageLabels[stage]}</span>
                    <span className={styles.stageCount}>{summary.stagesInProgress[stage] ?? 0}</span>
                  </div>
                ))}
          </div>
        </Card>

        <Card>
          <span className={detailStyles.sectionTitle}>Actividad reciente</span>
          <div style={{ marginTop: 12 }}>
            {activity === null && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={48} radius={8} />
                ))}
              </div>
            )}

            {activity !== null && activity.length === 0 && (
              <EmptyState title="Sin actividad reciente" description="Todavía no hay eventos registrados." />
            )}

            {activity !== null &&
              activity.map((event) => (
                <div className={styles.activityItem} key={event.id}>
                  <div className={styles.activityTop}>
                    <span className={styles.activityEventType}>{historyEventLabels[event.eventType]}</span>
                    <span className={styles.activityDate}>{formatDateTime(event.createdAt, 'es-ES')}</span>
                  </div>
                  <span className={styles.activityDescription}>{event.description}</span>
                  <span className={styles.activityMeta}>
                    <Link href={entryDetailPath(event.vehicleEntry.id)}>{event.vehicleEntry.vehicle.licensePlate}</Link>
                    {' · '}
                    <Link href={clientDetailPath(event.vehicleEntry.vehicle.client.id)}>
                      {clientDisplayName(event.vehicleEntry.vehicle.client)}
                    </Link>
                    {event.performedBy && ` · ${event.performedBy.fullName}`}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
