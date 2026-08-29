'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDashboardSummary } from '@/lib/api/dashboard';
import { runReminders } from '@/lib/api/reminders';
import { entryStatusLabels, entryStatusTones, stageLabels } from '@/lib/staffLabels';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { DashboardSummary, RepairStageName, VehicleEntryStatus } from '@/lib/types';
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

const ENTRY_STATUS_ORDER: VehicleEntryStatus[] = ['IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED'];

// Same tone vocabulary as everywhere else (StatusBadge, StatCard) mapped to
// the actual CSS color each tone means, for the chart bars below.
const TONE_COLOR: Record<string, string> = {
  warning: 'var(--warning)',
  success: 'var(--success)',
  danger: 'var(--danger)',
  neutral: 'var(--text-muted)',
  brand: 'var(--brand)',
};

export default function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [reminderResult, setReminderResult] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getDashboardSummary(token).then((result) => {
      if (result.ok) setSummary(result.data);
    });
  }, [token]);

  const maxStatusCount = summary
    ? Math.max(1, ...ENTRY_STATUS_ORDER.map((status) => summary.entriesByStatus[status] ?? 0))
    : 1;

  async function handleSendReminders() {
    if (!token) return;
    setSendingReminders(true);
    setReminderResult(null);
    const result = await runReminders(token);
    setSendingReminders(false);
    if (result.ok) {
      const total = result.data.pickupReminders + result.data.overdueInvoiceReminders;
      setReminderResult(
        total === 0
          ? 'No había recordatorios pendientes de enviar.'
          : `Se enviaron ${result.data.pickupReminders} recordatorio(s) de retiro y ${result.data.overdueInvoiceReminders} de factura vencida.`,
      );
    } else {
      setReminderResult(result.message);
    }
  }

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div className={detailStyles.sections}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span className={detailStyles.sectionTitle}>Pendientes de hoy</span>
            <Button variant="secondary" onClick={handleSendReminders} loading={sendingReminders}>
              Enviar recordatorios ahora
            </Button>
          </div>
          {reminderResult && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{reminderResult}</p>
          )}
          {summary === null ? (
            <div className={styles.statGrid} style={{ marginTop: 12 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={72} radius={12} />
              ))}
            </div>
          ) : (
            <div className={styles.statGrid} style={{ marginTop: 12 }}>
              <Link href="/work-requests">
                <StatCard
                  label="Richieste sin cotizar"
                  value={summary.pendingToday.workRequestsPending}
                  tone={summary.pendingToday.workRequestsPending > 0 ? 'warning' : 'neutral'}
                />
              </Link>
              <Link href="/finished-vehicles">
                <StatCard
                  label={`Listos hace más de ${summary.pendingToday.staleReadyForPickupDays} días`}
                  value={summary.pendingToday.staleReadyForPickup}
                  tone={summary.pendingToday.staleReadyForPickup > 0 ? 'warning' : 'neutral'}
                />
              </Link>
              <Link href="/invoices">
                <StatCard
                  label="Facturas vencidas"
                  value={summary.pendingToday.overdueInvoices}
                  tone={summary.pendingToday.overdueInvoices > 0 ? 'danger' : 'neutral'}
                />
              </Link>
            </div>
          )}
        </Card>

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
            <StatCard label="Vehículos" value={summary.totalVehicles} />
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
          <span className={detailStyles.sectionTitle}>Ingresos por estado</span>
          <div className={styles.statusChart} style={{ marginTop: 12 }}>
            {summary === null
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={20} />)
              : ENTRY_STATUS_ORDER.map((status) => {
                  const count = summary.entriesByStatus[status] ?? 0;
                  const color = TONE_COLOR[entryStatusTones[status]];
                  return (
                    <Link href={`/entries?status=${status}`} key={status} className={styles.statusChartRow}>
                      <span className={styles.statusChartLabel}>{entryStatusLabels[status]}</span>
                      <div className={styles.statusChartTrack}>
                        <div
                          className={styles.statusChartFill}
                          style={{ width: `${(count / maxStatusCount) * 100}%`, background: color }}
                        />
                      </div>
                      <span className={`${styles.statusChartValue} tabular-nums`}>{count}</span>
                    </Link>
                  );
                })}
          </div>
        </Card>
      </div>
    </div>
  );
}
