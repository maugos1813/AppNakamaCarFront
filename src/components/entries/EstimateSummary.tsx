'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getEntryEstimate, requestEstimateApproval } from '@/lib/api/entries';
import { formatCurrency } from '@/lib/format';
import type { EntryEstimate, EstimateStatus } from '@/lib/types';
import styles from './EstimateSummary.module.css';

export function EstimateSummary({
  token,
  entryId,
  estimateStatus,
  onApprovalRequested,
}: {
  token: string;
  entryId: string;
  estimateStatus: EstimateStatus;
  onApprovalRequested: () => void;
}) {
  const [estimate, setEstimate] = useState<EntryEstimate | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEntryEstimate(token, entryId).then((result) => {
      if (result.ok) setEstimate(result.data);
    });
  }, [token, entryId, estimateStatus]);

  async function handleRequestApproval() {
    setRequesting(true);
    setError(null);
    const result = await requestEstimateApproval(token, entryId);
    setRequesting(false);
    if (result.ok) {
      onApprovalRequested();
    } else {
      setError(result.message);
    }
  }

  if (!estimate) return <Skeleton height={60} radius={12} />;

  const pendingSubtotal =
    estimate.labor.items.filter((i) => !i.approvedAt).reduce((sum, i) => sum + Number(i.total), 0) +
    estimate.parts.items.filter((i) => !i.approvedAt).reduce((sum, i) => sum + Number(i.total), 0) +
    estimate.otherCosts.items.filter((i) => !i.approvedAt).reduce((sum, i) => sum + Number(i.amount), 0);
  const pendingTaxAmount = pendingSubtotal * (estimate.taxRate / 100);
  const pendingTotalWithTax = pendingSubtotal + pendingTaxAmount;

  return (
    <div className={styles.section}>
      <span className={styles.title}>Presupuesto</span>

      <div className={styles.row}>
        <span>Mano de obra</span>
        <span className="tabular-nums">{formatCurrency(estimate.labor.total)}</span>
      </div>
      <div className={styles.row}>
        <span>Repuestos</span>
        <span className="tabular-nums">{formatCurrency(estimate.parts.total)}</span>
      </div>
      <div className={styles.row}>
        <span>Otros costos</span>
        <span className="tabular-nums">{formatCurrency(estimate.otherCosts.total)}</span>
      </div>
      <div className={styles.row}>
        <span>Subtotal</span>
        <span className="tabular-nums">{formatCurrency(estimate.grandTotal)}</span>
      </div>
      <div className={styles.row}>
        <span>IVA ({estimate.taxRate}%)</span>
        <span className="tabular-nums">{formatCurrency(estimate.taxAmount)}</span>
      </div>

      <div className={styles.grandTotalRow}>
        <span className={styles.grandTotalLabel}>Total (IVA incluido)</span>
        <span className={`${styles.grandTotalAmount} tabular-nums`}>{formatCurrency(estimate.totalWithTax)}</span>
      </div>

      {estimateStatus !== 'PENDING_APPROVAL' && (
        <div className={styles.actions}>
          {pendingSubtotal <= 0 ? (
            estimateStatus === 'DRAFT' && (
              <span className={styles.hint}>Agrega mano de obra, repuestos u otros costos antes de solicitar la aprobación.</span>
            )
          ) : (
            <Button variant="primary" onClick={handleRequestApproval} loading={requesting}>
              {estimateStatus === 'DRAFT'
                ? `Solicitar aprobación al cliente (${formatCurrency(pendingTotalWithTax)})`
                : `Solicitar aprobación de costo adicional (${formatCurrency(pendingTotalWithTax)})`}
            </Button>
          )}
        </div>
      )}

      {error && (
        <span className={styles.hint} style={{ color: 'var(--danger)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
