'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getMechanicProductivity } from '@/lib/api/reports';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type TableColumn } from '@/components/ui/Table';
import type { MechanicProductivity } from '@/lib/types';
import detailStyles from '@/components/layout/DetailPage.module.css';
import styles from './page.module.css';

const PERIOD_OPTIONS = [
  { value: '1', label: 'Último mes' },
  { value: '3', label: 'Últimos 3 meses' },
  { value: '6', label: 'Últimos 6 meses' },
  { value: '12', label: 'Últimos 12 meses' },
];

type MechanicRow = MechanicProductivity['byMechanic'][number];

export default function ReportsPage() {
  const { token } = useAuth();
  const [months, setMonths] = useState('6');
  const [data, setData] = useState<MechanicProductivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getMechanicProductivity(token, Number(months)).then((result) => {
      setLoading(false);
      if (result.ok) setData(result.data);
    });
  }, [token, months]);

  const columns: TableColumn<MechanicRow>[] = [
    { key: 'name', header: 'Mecánico', render: (row) => row.fullName },
    { key: 'thisMonth', header: 'Este mes', align: 'right', render: (row) => row.completedThisMonth },
    { key: 'period', header: 'En el período', align: 'right', render: (row) => row.completedCount },
    {
      key: 'avg',
      header: 'Tiempo promedio',
      align: 'right',
      render: (row) => (row.avgRepairDays !== null ? `${row.avgRepairDays} días` : '—'),
    },
  ];

  return (
    <div>
      <PageHeader title="Reportes" />

      <div className={styles.filterRow}>
        <Select label="Período" value={months} onChange={(e) => setMonths(e.target.value)} options={PERIOD_OPTIONS} />
      </div>

      <div className={detailStyles.sections}>
        <Card>
          <span className={detailStyles.sectionTitle}>Productividad por mecánico</span>

          <div className={styles.statGrid} style={{ marginTop: 12 }}>
            <StatCard label="Trabajos completados" value={data?.overall.completedCount ?? (loading ? '—' : 0)} />
            <StatCard
              label="Tiempo promedio de reparación"
              value={data && data.overall.avgRepairDays !== null ? `${data.overall.avgRepairDays} días` : '—'}
            />
          </div>

          <div className={styles.chart} style={{ marginTop: 20 }}>
            {loading &&
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={20} />)}

            {!loading && (data?.byMechanic.length ?? 0) === 0 && (
              <EmptyState title="No hay mecánicos activos" />
            )}

            {!loading &&
              data &&
              data.byMechanic.length > 0 &&
              (() => {
                const max = Math.max(1, ...data.byMechanic.map((m) => m.completedCount));
                return data.byMechanic.map((mechanic) => (
                  <div className={styles.chartRow} key={mechanic.userId}>
                    <span className={styles.chartLabel} title={mechanic.fullName}>
                      {mechanic.fullName}
                    </span>
                    <div className={styles.chartTrack}>
                      <div
                        className={styles.chartFill}
                        style={{ width: `${(mechanic.completedCount / max) * 100}%` }}
                      />
                    </div>
                    <span className={`${styles.chartValue} tabular-nums`}>{mechanic.completedCount}</span>
                  </div>
                ));
              })()}
          </div>

          <div style={{ marginTop: 16 }}>
            <Table
              columns={columns}
              rows={data?.byMechanic ?? []}
              getRowId={(row) => row.userId}
              loading={loading}
              emptyTitle="No hay mecánicos activos"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
