'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { listWorkRequests, setWorkRequestStatus } from '@/lib/api/workRequests';
import { clientDisplayName, formatDateTime } from '@/lib/format';
import { workRequestStatusLabels, workRequestStatusTones } from '@/lib/staffLabels';
import { entryDetailPath } from '@/lib/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Table, type TableColumn } from '@/components/ui/Table';
import type { Paginated, StaffWorkRequest, WorkRequestStatus } from '@/lib/types';

const PAGE_SIZE = 20;

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  ...(Object.entries(workRequestStatusLabels) as [WorkRequestStatus, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

export default function WorkRequestsPage() {
  return (
    <Suspense fallback={null}>
      <WorkRequestsPageContent />
    </Suspense>
  );
}

function WorkRequestsPageContent() {
  const { token, user } = useAuth();
  const isAdmin = user?.role.name === 'ADMIN';

  const [status, setStatus] = useState<WorkRequestStatus | ''>('PENDING');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<StaffWorkRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    if (!token) return;
    setLoading(true);
    listWorkRequests(token, { status: status || undefined, page, pageSize: PAGE_SIZE }).then((result) => {
      setLoading(false);
      if (result.ok) setData(result.data);
    });
  }

  useEffect(load, [token, status, page]);

  async function handleSetStatus(id: string, next: 'PRICED' | 'DISMISSED') {
    if (!token) return;
    setBusyId(id);
    const result = await setWorkRequestStatus(token, id, next);
    setBusyId(null);
    if (result.ok) {
      setData((current) =>
        current ? { ...current, items: current.items.filter((item) => item.id !== id) } : current,
      );
    }
  }

  const columns: TableColumn<StaffWorkRequest>[] = [
    {
      key: 'vehicle',
      header: 'Vehículo',
      render: (item) => (
        <Link href={entryDetailPath(item.vehicleEntry.id)}>
          {item.vehicleEntry.vehicle.licensePlate} — {item.vehicleEntry.vehicle.make} {item.vehicleEntry.vehicle.model}
        </Link>
      ),
    },
    { key: 'client', header: 'Cliente', render: (item) => clientDisplayName(item.vehicleEntry.vehicle.client) },
    { key: 'description', header: 'Descripción', render: (item) => item.description },
    { key: 'createdBy', header: 'Cargado por', render: (item) => item.createdBy?.fullName ?? '—' },
    { key: 'date', header: 'Fecha', render: (item) => formatDateTime(item.createdAt, 'es-ES') },
    {
      key: 'status',
      header: 'Estado',
      render: (item) => <StatusBadge tone={workRequestStatusTones[item.status]} label={workRequestStatusLabels[item.status]} />,
    },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            header: '',
            render: (item: StaffWorkRequest) =>
              item.status === 'PENDING' ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="secondary"
                    onClick={() => handleSetStatus(item.id, 'PRICED')}
                    loading={busyId === item.id}
                  >
                    Cotizada
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleSetStatus(item.id, 'DISMISSED')}
                    loading={busyId === item.id}
                  >
                    Descartar
                  </Button>
                </div>
              ) : null,
          } satisfies TableColumn<StaffWorkRequest>,
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader title="Richiesta" />

      <div style={{ maxWidth: 280, marginBottom: 20 }}>
        <Select
          label="Estado"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as WorkRequestStatus | '');
            setPage(1);
          }}
          options={statusOptions}
        />
      </div>

      <Table
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(item) => item.id}
        loading={loading}
        emptyTitle="No hay richieste"
        emptyDescription={
          isAdmin ? undefined : 'Cargalas desde el ingreso del vehículo que estás revisando.'
        }
        pagination={
          data ? { page, pageSize: PAGE_SIZE, total: data.pagination.total, onPageChange: setPage } : undefined
        }
      />
    </div>
  );
}
