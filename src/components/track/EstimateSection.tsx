'use client';

import { useState } from 'react';
import { approveEstimate, rejectEstimate } from '@/lib/api/client-portal';
import { formatCurrency, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Estimate, EstimateStatus } from '@/lib/types';
import styles from './EstimateSection.module.css';
import modalStyles from '@/components/ui/ConfirmModal.module.css';

interface EstimateSectionProps {
  token: string;
  estimate: Estimate;
  estimateStatus: EstimateStatus;
  estimateRespondedAt: string | null;
  estimateRejectionReason: string | null;
}

export function EstimateSection({
  token,
  estimate,
  estimateStatus,
  estimateRespondedAt,
  estimateRejectionReason,
}: EstimateSectionProps) {
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (estimateStatus === 'DRAFT') {
    return <div className={styles.draft}>Preventivo in preparazione. Ti avviseremo quando sarà pronto.</div>;
  }

  async function handleApprove() {
    setSubmitting(true);
    setError(null);
    const result = await approveEstimate(token);
    setSubmitting(false);
    if (result.ok) {
      window.location.reload();
    } else {
      setError(result.message);
      if (result.status === 400) window.location.reload();
    }
  }

  async function handleReject() {
    setSubmitting(true);
    setError(null);
    const result = await rejectEstimate(token, reason.trim());
    setSubmitting(false);
    if (result.ok) {
      window.location.reload();
    } else {
      setError(result.message);
      if (result.status === 400) window.location.reload();
    }
  }

  function closeModal() {
    if (submitting) return;
    setModal(null);
    setError(null);
    setReason('');
  }

  return (
    <div className={`${styles.card} ${estimateStatus === 'PENDING_APPROVAL' ? styles.pending : ''}`}>
      <span className={styles.title}>Preventivo</span>

      {estimate.labor.items.length > 0 && (
        <div className={styles.group}>
          <span className={styles.groupLabel}>Manodopera</span>
          {estimate.labor.items.map((item) => (
            <div className={styles.row} key={item.id}>
              <span className={styles.rowDescription}>{item.description}</span>
              <span className={`${styles.rowAmount} tabular-nums`}>{formatCurrency(item.total)}</span>
            </div>
          ))}
          <div className={`${styles.subtotalRow} tabular-nums`}>
            <span>Subtotale</span>
            <span>{formatCurrency(estimate.labor.total)}</span>
          </div>
        </div>
      )}

      {estimate.parts.items.length > 0 && (
        <div className={styles.group}>
          <span className={styles.groupLabel}>Ricambi</span>
          {estimate.parts.items.map((item) => (
            <div className={styles.row} key={item.id}>
              <span className={styles.rowDescription}>
                {item.name}
                {item.quantity > 1 ? ` × ${item.quantity}` : ''}
              </span>
              <span className={`${styles.rowAmount} tabular-nums`}>{formatCurrency(item.total)}</span>
            </div>
          ))}
          <div className={`${styles.subtotalRow} tabular-nums`}>
            <span>Subtotale</span>
            <span>{formatCurrency(estimate.parts.total)}</span>
          </div>
        </div>
      )}

      {estimate.otherCosts.items.length > 0 && (
        <div className={styles.group}>
          <span className={styles.groupLabel}>Altri costi</span>
          {estimate.otherCosts.items.map((item) => (
            <div className={styles.row} key={item.id}>
              <span className={styles.rowDescription}>{item.description}</span>
              <span className={`${styles.rowAmount} tabular-nums`}>{formatCurrency(item.amount)}</span>
            </div>
          ))}
          <div className={`${styles.subtotalRow} tabular-nums`}>
            <span>Subtotale</span>
            <span>{formatCurrency(estimate.otherCosts.total)}</span>
          </div>
        </div>
      )}

      <div className={styles.grandTotalRow}>
        <span className={styles.grandTotalLabel}>Totale</span>
        <span className={`${styles.grandTotalAmount} tabular-nums`}>{formatCurrency(estimate.grandTotal)}</span>
      </div>

      {estimateStatus === 'PENDING_APPROVAL' && (
        <div className={styles.approvalPrompt}>
          <p className={styles.approvalText}>
            È necessaria la tua approvazione prima di iniziare i lavori di riparazione.
          </p>
          <div className={styles.actions}>
            <Button variant="danger" fullWidth onClick={() => setModal('reject')}>
              Rifiuta
            </Button>
            <Button variant="primary" fullWidth onClick={() => setModal('approve')}>
              Approva preventivo
            </Button>
          </div>
        </div>
      )}

      {estimateStatus === 'APPROVED' && (
        <div>
          <StatusBadge
            tone="success"
            label={`Preventivo approvato${formatDate(estimateRespondedAt) ? ` il ${formatDate(estimateRespondedAt)}` : ''}`}
          />
        </div>
      )}

      {estimateStatus === 'REJECTED' && (
        <div className={styles.group}>
          <StatusBadge
            tone="danger"
            label={`Preventivo rifiutato${formatDate(estimateRespondedAt) ? ` il ${formatDate(estimateRespondedAt)}` : ''}`}
          />
          {estimateRejectionReason && <p className={styles.reasonBox}>“{estimateRejectionReason}”</p>}
          <p className={styles.approvalText}>Contatta l’officina per rivedere insieme il preventivo.</p>
        </div>
      )}

      <ConfirmModal
        open={modal === 'approve'}
        title="Confermi l’approvazione?"
        description={`Stai per approvare il preventivo di ${formatCurrency(estimate.grandTotal)}. L’officina inizierà i lavori. Questa azione non può essere annullata da questa pagina.`}
        confirmLabel="Approva"
        variant="primary"
        loading={submitting}
        errorMessage={error}
        onConfirm={handleApprove}
        onCancel={closeModal}
      />

      <ConfirmModal
        open={modal === 'reject'}
        title="Confermi il rifiuto?"
        description="Puoi indicare il motivo del rifiuto: sarà comunicato all’officina."
        confirmLabel="Rifiuta preventivo"
        variant="danger"
        loading={submitting}
        errorMessage={error}
        onConfirm={handleReject}
        onCancel={closeModal}
      >
        <textarea
          className={modalStyles.textarea}
          placeholder="Motivo (facoltativo)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={submitting}
        />
      </ConfirmModal>
    </div>
  );
}
