'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { listEntries } from '@/lib/api/entries';
import { entryStatusLabels, entryStatusTones, estimateStatusLabels } from '@/lib/staffLabels';
import { clientDisplayName, formatDate } from '@/lib/format';
import { clientDetailPath, entryDetailPath } from '@/lib/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { LinkButton } from '@/components/ui/LinkButton';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, type TableColumn } from '@/components/ui/Table';
import type { JobEntry, Paginated, VehicleEntryStatus } from '@/lib/types';

const PAGE_SIZE = 20;

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  ...(Object.entries(entryStatusLabels) as [VehicleEntryStatus, string][]).map(([value, label]) => ({ value, label })),
];

export default function EntriesPage() {
  return (
    <Suspense fallback={null}>
      <EntriesPageContent />
    </Suspense>
  );
}

function EntriesPageContent() {
  const { token, user } = useAuth();
  const isAdmin = user?.role.name === 'ADMIN';
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicleId') ?? undefined;
  const clientId = searchParams.get('clientId') ?? undefined;
  const statusParam = searchParams.get('status') as VehicleEntryStatus | null;

  const [status, setStatus] = useState<VehicleEntryStatus | ''>(statusParam ?? 'IN_PROGRESS');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<JobEntry> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    listEntries(token, { status: status || undefined, vehicleId, clientId, page, pageSize: PAGE_SIZE }).then((result) => {
      setLoading(false);
      if (result.ok) setData(result.data);
    });
  }, [token, status, vehicleId, clientId, page]);

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
    // Pricing/estimate status stays admin-only — a mechanic just needs to
    // know which vehicle and what state the job is in, not what it's billed.
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
      <PageHeader title="Ingresos" action={<LinkButton href="/entries/new">+ Nuevo ingreso</LinkButton>} />

      {(vehicleId || clientId) && (
        <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          Filtrado {vehicleId ? 'por vehículo' : 'por cliente'} ·{' '}
          <button
            type="button"
            onClick={() => router.push('/entries')}
            style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', padding: 0, font: 'inherit' }}
          >
            Quitar filtro
          </button>
        </div>
      )}

      <div style={{ maxWidth: 280, marginBottom: 20 }}>
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

      <Table
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(entry) => entry.id}
        loading={loading}
        emptyTitle="No se encontraron ingresos"
        pagination={
          data
            ? { page, pageSize: PAGE_SIZE, total: data.pagination.total, onPageChange: setPage }
            : undefined
        }
      />
    </div>
  );
}
