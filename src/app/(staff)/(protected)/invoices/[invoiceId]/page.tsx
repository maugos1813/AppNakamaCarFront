'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { cancelInvoice, downloadInvoicePdf, getInvoice, issueInvoice } from '@/lib/api/invoices';
import { invoiceStatusLabels, invoiceStatusTones } from '@/lib/staffLabels';
import { clientDisplayName, formatDate } from '@/lib/format';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { InvoiceItemsList } from '@/components/invoices/InvoiceItemsList';
import { PaymentSection } from '@/components/invoices/PaymentSection';
import type { StaffInvoiceDetail } from '@/lib/types';
import styles from './page.module.css';

export default function InvoiceDetailPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = use(params);
  const { token } = useAuth();
  const [invoice, setInvoice] = useState<StaffInvoiceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [issueOpen, setIssueOpen] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const result = await getInvoice(token, invoiceId);
    if (result.ok) {
      setInvoice(result.data);
      setError(null);
    } else {
      setError(result.message);
    }
  }, [token, invoiceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleIssue() {
    setIssuing(true);
    setIssueError(null);
    const result = await issueInvoice(token!, invoiceId);
    setIssuing(false);
    if (result.ok) {
      setIssueOpen(false);
      load();
    } else {
      setIssueError(result.message);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    setCancelError(null);
    const result = await cancelInvoice(token!, invoiceId);
    setCancelling(false);
    if (result.ok) {
      setCancelOpen(false);
      load();
    } else {
      setCancelError(result.message);
    }
  }

  async function handleDownload() {
    if (!invoice?.invoiceNumber) return;
    setDownloading(true);
    setDownloadError(null);
    const result = await downloadInvoicePdf(token!, invoiceId, invoice.invoiceNumber);
    setDownloading(false);
    if (!result.ok) setDownloadError(result.message);
  }

  if (error) {
    return (
      <div>
        <BackLink href="/invoices" label="Volver a facturación" />
        <Card>
          <span className={styles.errorText}>{error}</span>
        </Card>
      </div>
    );
  }

  if (!invoice || !token) {
    return (
      <div>
        <BackLink href="/invoices" label="Volver a facturación" />
        <Skeleton height={80} radius={12} />
      </div>
    );
  }

  const isDraft = invoice.status === 'DRAFT';

  return (
    <div>
      <BackLink href="/invoices" label="Volver a facturación" />

      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.numberRow}>
            <span className={`${styles.number} ${isDraft ? styles.numberDraft : ''}`}>
              {invoice.invoiceNumber ?? 'Sin emitir'}
            </span>
            <StatusBadge tone={invoiceStatusTones[invoice.status]} label={invoiceStatusLabels[invoice.status]} />
          </div>
          <span className={styles.subLine}>
            <Link href={`/clients/${invoice.client.id}`}>{clientDisplayName(invoice.client)}</Link> ·{' '}
            <Link href={`/entries/${invoice.vehicleEntryId}`}>{invoice.vehicleEntry.vehicle.licensePlate}</Link>
          </span>
          {invoice.issueDate && <span className={styles.subLine}>Emitida el {formatDate(invoice.issueDate, 'es-ES')}</span>}
        </div>

        <div className={styles.actions}>
          {invoice.invoiceNumber && (
            <Button variant="secondary" onClick={handleDownload} loading={downloading}>
              Descargar PDF
            </Button>
          )}
          {isDraft && (
            <Button variant="primary" onClick={() => setIssueOpen(true)}>
              Emitir factura
            </Button>
          )}
          {(invoice.status === 'DRAFT' || invoice.status === 'ISSUED') && (
            <Button variant="danger" onClick={() => setCancelOpen(true)}>
              Cancelar factura
            </Button>
          )}
        </div>
      </div>

      {downloadError && <div className={styles.errorText} style={{ marginBottom: 16 }}>{downloadError}</div>}

      {isDraft && (
        <div className={styles.draftNotice}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4M12 16.5v.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            />
          </svg>
          Esta factura es un borrador — todavía no tiene número fiscal ni es un documento válido. Emítela para
          asignarle un número definitivo.
        </div>
      )}

      <div className={styles.sections}>
        <Card className={`${styles.documentCard} ${isDraft ? styles.documentCardDraft : styles.documentCardIssued}`}>
          <InvoiceItemsList invoice={invoice} />
        </Card>

        <Card>
          <PaymentSection token={token} invoice={invoice} onPaymentRecorded={load} />
        </Card>
      </div>

      <ConfirmModal
        open={issueOpen}
        title="¿Emitir esta factura?"
        description="Se le asignará un número fiscal definitivo y no podrás deshacer esta acción. El cliente recibirá un email con los detalles."
        confirmLabel="Emitir factura"
        cancelLabel="Cancelar"
        variant="primary"
        loading={issuing}
        errorMessage={issueError}
        onConfirm={handleIssue}
        onCancel={() => {
          setIssueOpen(false);
          setIssueError(null);
        }}
      />

      <ConfirmModal
        open={cancelOpen}
        title="¿Cancelar esta factura?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Cancelar factura"
        cancelLabel="Volver"
        variant="danger"
        loading={cancelling}
        errorMessage={cancelError}
        onConfirm={handleCancel}
        onCancel={() => {
          setCancelOpen(false);
          setCancelError(null);
        }}
      />
    </div>
  );
}
