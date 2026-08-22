'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { createInvoiceForEntry } from '@/lib/api/invoices';
import { invoiceStatusLabels, invoiceStatusTones } from '@/lib/staffLabels';
import { invoiceDetailPath } from '@/lib/routes';
import type { EstimateStatus, JobEntry } from '@/lib/types';
import styles from './InvoiceAction.module.css';

export function InvoiceAction({
  token,
  entryId,
  estimateStatus,
  invoice,
}: {
  token: string;
  entryId: string;
  estimateStatus: EstimateStatus;
  invoice: JobEntry['invoice'];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (estimateStatus !== 'APPROVED') return null;

  async function handleCreate() {
    setCreating(true);
    setError(null);
    const result = await createInvoiceForEntry(token, entryId, {});
    setCreating(false);
    if (result.ok) {
      router.push(invoiceDetailPath(result.data.id));
    } else {
      setError(result.message);
    }
  }

  return (
    <div>
      <div className={styles.row}>
        <span className={styles.title}>Factura</span>
        {invoice ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusBadge tone={invoiceStatusTones[invoice.status]} label={invoiceStatusLabels[invoice.status]} />
            <LinkButton href={invoiceDetailPath(invoice.id)} variant="secondary">
              Ver factura
            </LinkButton>
          </div>
        ) : (
          <Button variant="primary" onClick={handleCreate} loading={creating}>
            Crear factura
          </Button>
        )}
      </div>
      {!invoice && <span className={styles.hint}>Se generará como borrador a partir del presupuesto aprobado.</span>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
