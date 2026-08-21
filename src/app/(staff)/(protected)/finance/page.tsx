'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getFinanceSummary, getOverdueInvoices } from '@/lib/api/finance';
import { clientDisplayName, formatCurrency, formatDate } from '@/lib/format';
import { invoiceStatusLabels, paymentMethodLabels } from '@/lib/staffLabels';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, type TableColumn } from '@/components/ui/Table';
import type { FinanceSummary, OverdueInvoice } from '@/lib/types';
import detailStyles from '@/components/layout/DetailPage.module.css';
import styles from './page.module.css';

// Deliberately reads local calendar fields, not toISOString() — that would
// convert to UTC first, shifting the date shown in the picker by a day in
// any timezone behind UTC (e.g. Argentina).
function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function defaultFrom(): string {
  return toDateInputValue(new Date(new Date().getFullYear(), 0, 1));
}

function defaultTo(): string {
  return toDateInputValue(new Date());
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

export default function FinancePage() {
  const { token } = useAuth();
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [appliedFrom, setAppliedFrom] = useState(defaultFrom);
  const [appliedTo, setAppliedTo] = useState(defaultTo);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [overdue, setOverdue] = useState<OverdueInvoice[] | null>(null);

  useEffect(() => {
    if (!token) return;
    setSummary(null);
    // The "to" input carries a date with no time, which the backend would
    // otherwise coerce to midnight — silently excluding everything issued
    // later that same day. Push it to the end of the day instead.
    getFinanceSummary(token, { from: appliedFrom, to: `${appliedTo}T23:59:59.999` }).then((result) => {
      if (result.ok) setSummary(result.data);
    });
  }, [token, appliedFrom, appliedTo]);

  useEffect(() => {
    if (!token) return;
    getOverdueInvoices(token).then((result) => {
      if (result.ok) setOverdue(result.data);
    });
  }, [token]);

  const maxMonthAmount = summary
    ? Math.max(1, ...summary.revenueByMonth.map((row) => Math.max(row.invoiced, row.collected)))
    : 1;

  const statusColumns: TableColumn<FinanceSummary['byStatus'][number]>[] = [
    { key: 'status', header: 'Estado', render: (row) => invoiceStatusLabels[row.status] },
    { key: 'count', header: 'Cantidad', align: 'right', render: (row) => row.count },
    { key: 'total', header: 'Total', align: 'right', render: (row) => formatCurrency(row.totalAmount) },
  ];

  const methodColumns: TableColumn<FinanceSummary['byPaymentMethod'][number]>[] = [
    { key: 'method', header: 'Método', render: (row) => paymentMethodLabels[row.method] },
    { key: 'count', header: 'Cantidad', align: 'right', render: (row) => row.count },
    { key: 'total', header: 'Total', align: 'right', render: (row) => formatCurrency(row.totalAmount) },
  ];

  const overdueColumns: TableColumn<OverdueInvoice>[] = [
    {
      key: 'number',
      header: 'Número',
      render: (invoice) => <Link href={`/invoices/${invoice.id}`}>{invoice.invoiceNumber ?? 'Borrador'}</Link>,
    },
    {
      key: 'client',
      header: 'Cliente',
      render: (invoice) => <Link href={`/clients/${invoice.client.id}`}>{clientDisplayName(invoice.client)}</Link>,
    },
    { key: 'due', header: 'Vencimiento', render: (invoice) => formatDate(invoice.dueDate, 'es-ES') },
    { key: 'total', header: 'Total', align: 'right', render: (invoice) => formatCurrency(invoice.totalAmount) },
    { key: 'paid', header: 'Pagado', align: 'right', render: (invoice) => formatCurrency(invoice.amountPaid) },
    { key: 'due-amount', header: 'Pendiente', align: 'right', render: (invoice) => formatCurrency(invoice.amountDue) },
  ];

  return (
    <div>
      <PageHeader title="Finanzas" />

      <div className={styles.filterRow}>
        <Input label="Desde" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="Hasta" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button
          variant="secondary"
          onClick={() => {
            setAppliedFrom(from);
            setAppliedTo(to);
          }}
        >
          Aplicar
        </Button>
      </div>

      <div className={detailStyles.sections}>
        {summary === null ? (
          <div className={styles.statGrid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={72} radius={12} />
            ))}
          </div>
        ) : (
          <div className={styles.statGrid}>
            <StatCard label="Total facturado" value={formatCurrency(summary.totalInvoiced)} />
            <StatCard label="Total cobrado" value={formatCurrency(summary.totalCollected)} tone="success" />
            <StatCard
              label="Saldo pendiente"
              value={formatCurrency(summary.outstandingBalance)}
              tone={summary.outstandingBalance > 0 ? 'warning' : 'neutral'}
            />
          </div>
        )}

        <Card>
          <span className={detailStyles.sectionTitle}>Ingresos últimos 12 meses</span>
          <div className={styles.legend} style={{ marginTop: 12 }}>
            <span className={styles.legendItem}>
              <span className={styles.legendSwatch} style={{ background: 'var(--brand)' }} />
              Facturado
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendSwatch} style={{ background: 'var(--success)' }} />
              Cobrado
            </span>
          </div>

          {summary === null && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Cargando…</span>}

          {summary !== null && (
            <div className={styles.chart}>
              {summary.revenueByMonth.map((row) => (
                <div className={styles.chartRow} key={row.month}>
                  <span className={styles.chartMonth}>{formatMonthLabel(row.month)}</span>
                  <div className={styles.chartBars}>
                    <div className={styles.chartBarTrack}>
                      <div
                        className={`${styles.chartBarFill} ${styles.chartBarInvoiced}`}
                        style={{ width: `${(row.invoiced / maxMonthAmount) * 100}%` }}
                      />
                      <span className={styles.chartValue}>{formatCurrency(row.invoiced)}</span>
                    </div>
                    <div className={styles.chartBarTrack}>
                      <div
                        className={`${styles.chartBarFill} ${styles.chartBarCollected}`}
                        style={{ width: `${(row.collected / maxMonthAmount) * 100}%` }}
                      />
                      <span className={styles.chartValue}>{formatCurrency(row.collected)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <span className={detailStyles.sectionTitle}>Por estado</span>
          <div style={{ marginTop: 12 }}>
            <Table columns={statusColumns} rows={summary?.byStatus ?? []} getRowId={(row) => row.status} loading={summary === null} />
          </div>
        </Card>

        <Card>
          <span className={detailStyles.sectionTitle}>Por método de pago</span>
          <div style={{ marginTop: 12 }}>
            <Table columns={methodColumns} rows={summary?.byPaymentMethod ?? []} getRowId={(row) => row.method} loading={summary === null} />
          </div>
        </Card>

        <Card>
          <span className={detailStyles.sectionTitle}>Facturas vencidas</span>
          <div style={{ marginTop: 12 }}>
            <Table
              columns={overdueColumns}
              rows={overdue ?? []}
              getRowId={(invoice) => invoice.id}
              loading={overdue === null}
              emptyTitle="No hay facturas vencidas"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
