'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { listInvoices } from '@/lib/api/invoices';
import { invoiceStatusLabels, invoiceStatusTones } from '@/lib/staffLabels';
import { clientDisplayName, formatCurrency, formatDate } from '@/lib/format';
import { clientDetailPath, invoiceDetailPath } from '@/lib/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, type TableColumn } from '@/components/ui/Table';
import type { InvoiceStatus, Paginated, StaffInvoice } from '@/lib/types';

const PAGE_SIZE = 20;

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  ...(Object.entries(invoiceStatusLabels) as [InvoiceStatus, string][]).map(([value, label]) => ({ value, label })),
];

export default function InvoicesPage() {
  return (
    <Suspense fallback={null}>
      <InvoicesPageContent />
    </Suspense>
  );
}

function InvoicesPageContent() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') ?? undefined;

  const [status, setStatus] = useState<InvoiceStatus | ''>('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<StaffInvoice> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    listInvoices(token, { status: status || undefined, clientId, page, pageSize: PAGE_SIZE }).then((result) => {
      setLoading(false);
      if (result.ok) setData(result.data);
    });
  }, [token, status, clientId, page]);

  const columns: TableColumn<StaffInvoice>[] = [
    {
      key: 'number',
      header: 'Número',
      render: (invoice) => (
        <Link href={invoiceDetailPath(invoice.id)}>{invoice.invoiceNumber ?? 'Borrador'}</Link>
      ),
    },
    {
      key: 'client',
      header: 'Cliente',
      render: (invoice) => <Link href={clientDetailPath(invoice.client.id)}>{clientDisplayName(invoice.client)}</Link>,
    },
    { key: 'vehicle', header: 'Vehículo', render: (invoice) => invoice.vehicleEntry.vehicle.licensePlate },
    {
      key: 'status',
      header: 'Estado',
      render: (invoice) => <StatusBadge tone={invoiceStatusTones[invoice.status]} label={invoiceStatusLabels[invoice.status]} />,
    },
    { key: 'total', header: 'Total', align: 'right', render: (invoice) => formatCurrency(invoice.totalAmount) },
    { key: 'date', header: 'Fecha', render: (invoice) => (invoice.issueDate ? formatDate(invoice.issueDate, 'es-ES') : '—') },
  ];

  return (
    <div>
      <PageHeader title="Facturación" />

      {clientId && (
        <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          Filtrado por cliente ·{' '}
          <button
            type="button"
            onClick={() => router.push('/invoices')}
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
            setStatus(e.target.value as InvoiceStatus | '');
            setPage(1);
          }}
          options={statusOptions}
        />
      </div>

      <Table
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(invoice) => invoice.id}
        loading={loading}
        emptyTitle="No se encontraron facturas"
        pagination={
          data
            ? { page, pageSize: PAGE_SIZE, total: data.pagination.total, onPageChange: setPage }
            : undefined
        }
      />
    </div>
  );
}
