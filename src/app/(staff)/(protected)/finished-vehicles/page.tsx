'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { listEntries } from '@/lib/api/entries';
import { listInvoices } from '@/lib/api/invoices';
import { entryStatusLabels, entryStatusTones, invoiceStatusLabels, invoiceStatusTones } from '@/lib/staffLabels';
import { clientDisplayName, formatCurrency, formatDate } from '@/lib/format';
import { clientDetailPath, entryDetailPath } from '@/lib/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, type TableColumn } from '@/components/ui/Table';
import type { JobEntry, StaffInvoice } from '@/lib/types';
import styles from './page.module.css';

const PAGE_SIZE = 20;

export default function FinishedVehiclesPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role.name === 'ADMIN';
  const [tab, setTab] = useState<'ready' | 'unpaid'>('ready');

  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<{ items: JobEntry[]; total: number } | null>(null);
  const [entriesLoading, setEntriesLoading] = useState(true);

  const [invoices, setInvoices] = useState<StaffInvoice[] | null>(null);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  useEffect(() => {
    if (!token || tab !== 'ready') return;
    setEntriesLoading(true);
    listEntries(token, { status: 'COMPLETED', page, pageSize: PAGE_SIZE }).then((result) => {
      setEntriesLoading(false);
      if (result.ok) setEntries({ items: result.data.items, total: result.data.pagination.total });
    });
  }, [token, tab, page]);

  useEffect(() => {
    if (!token || tab !== 'unpaid') return;
    setInvoicesLoading(true);
    // Finished vehicles only — an unpaid invoice on a job still in the shop
    // isn't "waiting on the customer" the way this card means it.
    listInvoices(token, { paid: false, page: 1, pageSize: 100 }).then((result) => {
      setInvoicesLoading(false);
      if (result.ok) {
        setInvoices(
          result.data.items.filter((invoice) => ['COMPLETED', 'DELIVERED'].includes(invoice.vehicleEntry.status)),
        );
      }
    });
  }, [token, tab]);

  const readyColumns: TableColumn<JobEntry>[] = [
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
    { key: 'date', header: 'Fecha de ingreso', render: (entry) => formatDate(entry.entryDate, 'es-ES') },
  ];

  const unpaidColumns: TableColumn<StaffInvoice>[] = [
    {
      key: 'vehicle',
      header: 'Vehículo',
      render: (invoice) => (
        <Link href={entryDetailPath(invoice.vehicleEntryId)}>{invoice.vehicleEntry.vehicle.licensePlate}</Link>
      ),
    },
    {
      key: 'client',
      header: 'Cliente',
      render: (invoice) => <Link href={clientDetailPath(invoice.client.id)}>{clientDisplayName(invoice.client)}</Link>,
    },
    {
      key: 'entryStatus',
      header: 'Estado',
      render: (invoice) => (
        <StatusBadge tone={entryStatusTones[invoice.vehicleEntry.status]} label={entryStatusLabels[invoice.vehicleEntry.status]} />
      ),
    },
    {
      key: 'invoiceStatus',
      header: 'Factura',
      render: (invoice) => <StatusBadge tone={invoiceStatusTones[invoice.status]} label={invoiceStatusLabels[invoice.status]} />,
    },
    ...(isAdmin
      ? [
          {
            key: 'total',
            header: 'Total',
            align: 'right' as const,
            render: (invoice: StaffInvoice) => formatCurrency(invoice.totalAmount),
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader title="Vehículos Terminados" />

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'ready' ? styles.tabActive : ''}`}
          onClick={() => setTab('ready')}
        >
          Por retirar
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'unpaid' ? styles.tabActive : ''}`}
          onClick={() => setTab('unpaid')}
        >
          Falta pago
        </button>
      </div>

      {tab === 'ready' ? (
        <Table
          columns={readyColumns}
          rows={entries?.items ?? []}
          getRowId={(entry) => entry.id}
          loading={entriesLoading}
          emptyTitle="No hay vehículos listos para retirar"
          pagination={
            entries ? { page, pageSize: PAGE_SIZE, total: entries.total, onPageChange: setPage } : undefined
          }
        />
      ) : (
        <Table
          columns={unpaidColumns}
          rows={invoices ?? []}
          getRowId={(invoice) => invoice.id}
          loading={invoicesLoading}
          emptyTitle="No hay vehículos terminados con pago pendiente"
        />
      )}
    </div>
  );
}
