'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { listEntries } from '@/lib/api/entries';
import { entryStatusLabels, entryStatusTones, estimateStatusLabels } from '@/lib/staffLabels';
import { clientDisplayName, formatDate } from '@/lib/format';
import { clientDetailPath, entryDetailPath } from '@/lib/routes';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, type TableColumn } from '@/components/ui/Table';
import type { JobEntry, Paginated, VehicleEntryStatus } from '@/lib/types';
import styles from './page.module.css';

const PAGE_SIZE = 20;
const STATUSES: VehicleEntryStatus[] = ['IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED'];

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  ...(Object.entries(entryStatusLabels) as [VehicleEntryStatus, string][]).map(([value, label]) => ({ value, label })),
];

export default function VehicleHistoryPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role.name === 'ADMIN';
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState<VehicleEntryStatus | ''>('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<Paginated<JobEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<VehicleEntryStatus, number> | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    listEntries(token, {
      search: debouncedSearch || undefined,
      from: from || undefined,
      to: to ? `${to}T23:59:59.999` : undefined,
      status: status || undefined,
      page,
      pageSize: PAGE_SIZE,
    }).then((result) => {
      setLoading(false);
      if (result.ok) setData(result.data);
    });
  }, [token, debouncedSearch, from, to, status, page]);

  // Counted separately from the (possibly status-filtered) list above, so
  // the stat cards always show the full breakdown for the current
  // search/date window regardless of which status the table itself shows.
  useEffect(() => {
    if (!token) return;
    Promise.all(
      STATUSES.map((s) =>
        listEntries(token, {
          search: debouncedSearch || undefined,
          from: from || undefined,
          to: to ? `${to}T23:59:59.999` : undefined,
          status: s,
          page: 1,
          pageSize: 1,
        }),
      ),
    ).then((results) => {
      const next = {} as Record<VehicleEntryStatus, number>;
      STATUSES.forEach((s, i) => {
        const result = results[i];
        next[s] = result.ok ? result.data.pagination.total : 0;
      });
      setCounts(next);
    });
  }, [token, debouncedSearch, from, to]);

  const total = counts ? STATUSES.reduce((sum, s) => sum + counts[s], 0) : null;

  const columns: TableColumn<JobEntry>[] = [
    {
      key: 'vehicle',
      header: 'Vehículo',
      render: (entry) => (
        <Link href={entryDetailPath(entry.id)}>
          {entry.vehicle.licensePlate} — {entry.vehicle.make} {entry.vehicle.model}
        </Link>
      ),
    },
    {
      key: 'client',
      header: 'Cliente',
      render: (entry) => <Link href={clientDetailPath(entry.vehicle.client.id)}>{clientDisplayName(entry.vehicle.client)}</Link>,
    },
    { key: 'date', header: 'Ingreso', render: (entry) => formatDate(entry.entryDate, 'es-ES') },
    {
      key: 'status',
      header: 'Estado',
      render: (entry) => <StatusBadge tone={entryStatusTones[entry.status]} label={entryStatusLabels[entry.status]} />,
    },
    // Pricing/estimate status stays admin-only — same rule as everywhere
    // else in the app: a mechanic sees what needs doing, never what it's billed.
    ...(isAdmin
      ? [
          {
            key: 'estimate',
            header: 'Presupuesto',
            render: (entry: JobEntry) => <StatusBadge tone="neutral" label={estimateStatusLabels[entry.estimateStatus]} />,
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader title="History Vehículos" />

      <div className={styles.filterRow}>
        <Input
          label="Buscar"
          placeholder="Matrícula, cliente, VIN..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Input
          label="Desde"
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(1);
          }}
        />
        <Input
          label="Hasta"
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(1);
          }}
        />
        <Select
          label="Estado"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as VehicleEntryStatus | '');
            setPage(1);
          }}
          options={statusOptions}
        />
      </div>

      <div className={styles.statGrid}>
        <StatCard label="Total de trabajos" value={total ?? '—'} />
        <StatCard label={entryStatusLabels.IN_PROGRESS} value={counts?.IN_PROGRESS ?? '—'} tone="warning" />
        <StatCard label={entryStatusLabels.COMPLETED} value={counts?.COMPLETED ?? '—'} tone="success" />
        <StatCard label={entryStatusLabels.DELIVERED} value={counts?.DELIVERED ?? '—'} />
        <StatCard label={entryStatusLabels.CANCELLED} value={counts?.CANCELLED ?? '—'} tone="danger" />
      </div>

      <Table
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(entry) => entry.id}
        loading={loading}
        emptyTitle="No se encontraron trabajos"
        pagination={
          data ? { page, pageSize: PAGE_SIZE, total: data.pagination.total, onPageChange: setPage } : undefined
        }
      />
    </div>
  );
}
